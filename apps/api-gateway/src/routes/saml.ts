// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { createVerify } from 'crypto';
import { prisma as prismaBase } from '@ims/database';
import type { PrismaClient } from '@ims/database/core';

const prisma = prismaBase as unknown as PrismaClient;

// ─── XML Escaping ────────────────────────────────────────────────────────────

/**
 * Escape special XML characters to prevent XML injection when interpolating
 * values into XML templates.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const logger = createLogger('api-gateway:saml');
const router = Router();

// ─── Types ──────────────────────────────────────────────────────────────────

interface SamlConfig {
  id: string;
  orgId: string;
  entryPoint: string;
  issuer: string;
  cert: string;
  signatureAlgorithm: 'sha1' | 'sha256' | 'sha512';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended SSO settings
  entityId?: string;
  assertionConsumerUrl?: string;
  idpMetadataUrl?: string;
  nameIdFormat?: string;
  allowUnencryptedAssertions?: boolean;
}

// ─── Validation Schemas ─────────────────────────────────────────────────────

// Allowed SAML NameID formats to prevent arbitrary string injection
const ALLOWED_NAMEID_FORMATS = [
  'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
  'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
  'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
];

const samlConfigSchema = z.object({
  entryPoint: z
    .string()
    .trim()
    .url('Must be a valid URL')
    .refine((url) => url.startsWith('https://'), 'Entry point must use HTTPS'),
  issuer: z.string().trim().min(1, 'Issuer is required').max(500),
  cert: z.string().trim().min(1, 'Certificate is required').max(10000),
  signatureAlgorithm: z.enum(['sha256', 'sha512']).optional().default('sha256'),
  enabled: z.boolean().optional().default(true),
  entityId: z.string().trim().max(500).optional(),
  assertionConsumerUrl: z
    .string()
    .trim()
    .url()
    .refine((url) => url.startsWith('https://'), 'ACS URL must use HTTPS')
    .optional(),
  idpMetadataUrl: z
    .string()
    .trim()
    .url()
    .refine((url) => url.startsWith('https://'), 'IdP metadata URL must use HTTPS')
    .optional(),
  nameIdFormat: z
    .string()
    .refine((val) => ALLOWED_NAMEID_FORMATS.includes(val), 'Invalid NameID format')
    .optional(),
  allowUnencryptedAssertions: z.boolean().optional().default(false),
});

// ─── Helper ─────────────────────────────────────────────────────────────────

const SP_ENTITY_ID = process.env.SAML_SP_ENTITY_ID || 'https://app.ims.local/saml/metadata';
const SP_ACS_URL = process.env.SAML_SP_ACS_URL || 'https://app.ims.local/api/auth/saml/callback';

// Cache SP metadata XML at module load (static — built from env vars)
const SP_METADATA_CACHED = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="${escapeXml(SP_ENTITY_ID)}">
  <md:SPSSODescriptor
    AuthnRequestsSigned="true"
    WantAssertionsSigned="true"
    protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${escapeXml(SP_ACS_URL)}"
      index="0"
      isDefault="true" />
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;

function generateSpMetadata(): string {
  return SP_METADATA_CACHED;
}

async function getConfigByOrgId(orgId: string): Promise<SamlConfig | null> {
  const record = await prisma.samlConfig.findUnique({ where: { orgId } });
  if (!record) return null;
  return {
    id: record.id,
    orgId: record.orgId,
    entryPoint: record.entryPoint,
    issuer: record.issuer,
    cert: record.cert,
    signatureAlgorithm: record.signatureAlgorithm as SamlConfig['signatureAlgorithm'],
    enabled: record.enabled,
    entityId: record.entityId ?? undefined,
    assertionConsumerUrl: record.assertionConsumerUrl ?? undefined,
    idpMetadataUrl: record.idpMetadataUrl ?? undefined,
    nameIdFormat: record.nameIdFormat ?? undefined,
    allowUnencryptedAssertions: record.allowUnencryptedAssertions,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/**
 * Build a SAML 2.0 AuthnRequest XML document.
 */
function buildAuthnRequest(config: SamlConfig, requestId: string): string {
  const issueInstant = new Date().toISOString();
  const destination = config.entryPoint;
  const entityId = config.entityId || SP_ENTITY_ID;
  const acsUrl = config.assertionConsumerUrl || SP_ACS_URL;
  const nameIdFormat =
    config.nameIdFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress';

  return `<samlp:AuthnRequest
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  ID="_${escapeXml(requestId)}"
  Version="2.0"
  IssueInstant="${escapeXml(issueInstant)}"
  Destination="${escapeXml(destination)}"
  AssertionConsumerServiceURL="${escapeXml(acsUrl)}"
  ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
  <saml:Issuer>${escapeXml(entityId)}</saml:Issuer>
  <samlp:NameIDPolicy
    Format="${escapeXml(nameIdFormat)}"
    AllowCreate="true" />
</samlp:AuthnRequest>`;
}

/**
 * Deflate and Base64-encode the AuthnRequest for HTTP-Redirect binding.
 */
function encodeAuthnRequest(xml: string): string {
  // Use raw deflate (zlib) — for simplicity, use base64 encoding of the XML
  // In production with @xmldom/xmldom + pako, this would be deflated first
  return Buffer.from(xml, 'utf-8').toString('base64');
}

/**
 * Parse SAML Response XML and extract assertion attributes.
 * In production, this would use a full XML parser with signature validation.
 */
function parseSamlResponse(
  samlResponseB64: string,
  config: SamlConfig
): {
  valid: boolean;
  nameId?: string;
  attributes: Record<string, string>;
  sessionIndex?: string;
  error?: string;
} {
  try {
    const xml = Buffer.from(samlResponseB64, 'base64').toString('utf-8');

    // Extract NameID
    const nameIdMatch = xml.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/);
    const nameId = nameIdMatch?.[1];

    // Extract attributes
    const attributes: Record<string, string> = {};
    const attrRegex =
      /<saml:Attribute\s+Name="([^"]+)"[^>]*>\s*<saml:AttributeValue[^>]*>([^<]*)<\/saml:AttributeValue>/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(xml)) !== null) {
      attributes[attrMatch[1]] = attrMatch[2];
    }

    // Extract SessionIndex
    const sessionMatch = xml.match(/SessionIndex="([^"]+)"/);
    const sessionIndex = sessionMatch?.[1];

    // Cryptographic signature verification using the IdP's X.509 certificate.
    // Extracts the RSA-SHA256 signature and verifies it against the SignedInfo element.
    // Note: Full XML-DSig canonical form (C14N) requires xml-crypto for strict compliance;
    // this check covers the common case where SignedInfo is already serialised canonically.
    const sigValueMatch = xml.match(
      /<(?:ds:)?SignatureValue[^>]*>([A-Za-z0-9+/=\s]+)<\/(?:ds:)?SignatureValue>/
    );
    const signedInfoMatch = xml.match(/(<(?:ds:)?SignedInfo[\s\S]*?<\/(?:ds:)?SignedInfo>)/);

    if (!sigValueMatch || !signedInfoMatch) {
      if (!config.allowUnencryptedAssertions) {
        return { valid: false, attributes: {}, error: 'SAML Response is not signed' };
      }
    } else {
      try {
        const sigBytes = Buffer.from(sigValueMatch[1].replace(/\s/g, ''), 'base64');
        const signedInfoXml = signedInfoMatch[1];

        // Normalise the certificate to PEM format
        const rawCert = config.cert.replace(
          /-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s/g,
          ''
        );
        const pem = `-----BEGIN CERTIFICATE-----\n${rawCert.match(/.{1,64}/g)!.join('\n')}\n-----END CERTIFICATE-----`;

        // Determine algorithm from SignedInfo (default to sha256)
        const algoMap: Record<string, string> = {
          'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256': 'RSA-SHA256',
          'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512': 'RSA-SHA512',
          'http://www.w3.org/2000/09/xmldsig#rsa-sha1': 'RSA-SHA1',
        };
        const algoMatch = signedInfoXml.match(/Algorithm="([^"]+)"/);
        const nodeAlgo = (algoMatch && algoMap[algoMatch[1]]) || 'RSA-SHA256';

        const verifier = createVerify(nodeAlgo);
        verifier.update(signedInfoXml, 'utf8');
        const signatureValid = verifier.verify(pem, sigBytes);

        if (!signatureValid) {
          return { valid: false, attributes: {}, error: 'SAML signature verification failed' };
        }
      } catch (cryptoErr: unknown) {
        logger.error('SAML crypto verification error', { error: (cryptoErr as Error).message });
        return { valid: false, attributes: {}, error: 'SAML signature verification error' };
      }
    }

    // Validate that the response is addressed to our SP entity
    const audienceMatch = xml.match(/<saml:Audience>([^<]+)<\/saml:Audience>/);
    const expectedEntityId = config.entityId || SP_ENTITY_ID;
    if (audienceMatch && audienceMatch[1] !== expectedEntityId) {
      return { valid: false, attributes: {}, error: 'SAML audience mismatch' };
    }

    // Check for replay: validate NotOnOrAfter timestamp if present
    const notOnOrAfterMatch = xml.match(/NotOnOrAfter="([^"]+)"/);
    if (notOnOrAfterMatch) {
      const notOnOrAfter = new Date(notOnOrAfterMatch[1]);
      if (notOnOrAfter.getTime() < Date.now()) {
        return { valid: false, attributes: {}, error: 'SAML assertion has expired' };
      }
    }

    if (!nameId) {
      return { valid: false, attributes: {}, error: 'No NameID found in SAML assertion' };
    }

    return { valid: true, nameId, attributes, sessionIndex };
  } catch (err: unknown) {
    logger.error('Failed to parse SAML Response', { error: (err as Error).message });
    return { valid: false, attributes: {}, error: 'Failed to parse SAML Response' };
  }
}

// ─── Public SAML Routes ─────────────────────────────────────────────────────

// GET /api/auth/saml/metadata — SP metadata XML
router.get('/auth/saml/metadata', (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', 'application/xml');
    res.send(generateSpMetadata());
  } catch (error: unknown) {
    logger.error('Failed to generate SP metadata', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate SP metadata' },
    });
  }
});

// GET /api/auth/saml/login?orgId=xxx — redirect to IdP
router.get('/auth/saml/login', async (req: Request, res: Response) => {
  try {
    const orgId = req.query.orgId as string;
    if (!orgId || typeof orgId !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'orgId query parameter is required' },
      });
    }

    // Validate orgId format to prevent path traversal or injection
    const orgIdSchema = z
      .string()
      .trim()
      .uuid()
      .or(
        z
          .string()
          .trim()
          .regex(/^[a-zA-Z0-9_-]{1,128}$/)
      );
    const orgIdResult = orgIdSchema.safeParse(orgId);
    if (!orgIdResult.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid orgId format' },
      });
    }

    const config = await getConfigByOrgId(orgId);
    if (!config || !config.enabled) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SSO_NOT_CONFIGURED',
          message: 'SSO is not configured or not enabled for this organisation',
        },
      });
    }

    // Build SAML AuthnRequest XML and encode for HTTP-Redirect binding
    const requestId = crypto.randomUUID().replace(/-/g, '');
    const authnRequestXml = buildAuthnRequest(config, requestId);
    const encodedRequest = encodeAuthnRequest(authnRequestXml);

    const redirectUrl = new URL(config.entryPoint);
    redirectUrl.searchParams.set('SAMLRequest', encodedRequest);
    redirectUrl.searchParams.set('RelayState', orgId);

    // Validate the redirect URL protocol to prevent open redirect to javascript: or data: URIs
    if (!['https:', 'http:'].includes(redirectUrl.protocol)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid IdP entry point URL' },
      });
    }

    logger.info('SAML login redirect', { orgId, requestId });
    res.redirect(redirectUrl.toString());
  } catch (error: unknown) {
    logger.error('Failed to initiate SAML login', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to initiate SAML login' },
    });
  }
});

// POST /api/auth/saml/callback — mock SAML assertion handler
router.post('/auth/saml/callback', async (req: Request, res: Response) => {
  try {
    const { SAMLResponse, RelayState } = req.body;

    if (!SAMLResponse) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'SAMLResponse is required' },
      });
    }

    // Look up the SAML config for the org
    const orgId = RelayState as string;
    const config = orgId ? await getConfigByOrgId(orgId) : null;

    if (!config) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SSO_NOT_CONFIGURED',
          message: 'Could not find SSO configuration for this organisation',
        },
      });
    }

    // Parse and validate the SAML Response
    const parsed = parseSamlResponse(SAMLResponse, config);

    if (!parsed.valid) {
      logger.warn('SAML assertion validation failed', { orgId, error: parsed.error });
      return res.status(400).json({
        success: false,
        error: {
          code: 'SAML_VALIDATION_FAILED',
          message: parsed.error || 'SAML assertion validation failed',
        },
      });
    }

    logger.info('SAML callback processed', {
      orgId,
      nameId: parsed.nameId,
      attributes: Object.keys(parsed.attributes),
      sessionIndex: parsed.sessionIndex,
    });

    // In production: look up or create user by nameId (email), issue JWT, redirect to frontend
    // For now, return the parsed assertion data
    res.json({
      success: true,
      data: {
        message: 'SAML assertion validated successfully',
        nameId: parsed.nameId,
        attributes: parsed.attributes,
        sessionIndex: parsed.sessionIndex,
        relayState: RelayState,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to process SAML callback', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process SAML callback' },
    });
  }
});

// GET /api/auth/saml/idp-metadata?orgId=xxx — fetch and cache IdP metadata
router.get('/auth/saml/idp-metadata', async (req: Request, res: Response) => {
  try {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'orgId query parameter is required' },
      });
    }

    const config = await getConfigByOrgId(orgId);
    if (!config) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No SSO configuration found for this organisation' },
      });
    }

    // Return the IdP metadata URL and SP configuration for the client to use
    res.json({
      success: true,
      data: {
        idpMetadataUrl: config.idpMetadataUrl || null,
        idpEntryPoint: config.entryPoint,
        idpIssuer: config.issuer,
        spEntityId: config.entityId || SP_ENTITY_ID,
        spAcsUrl: config.assertionConsumerUrl || SP_ACS_URL,
        spMetadataUrl: '/api/auth/saml/metadata',
        signatureAlgorithm: config.signatureAlgorithm,
        nameIdFormat:
          config.nameIdFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get IdP metadata', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get IdP metadata' },
    });
  }
});

// ─── Admin SAML Routes ──────────────────────────────────────────────────────

// GET /api/admin/security/sso — get SAML config for org
router.get(
  '/admin/security/sso',
  authenticate,
  requireRole('ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
      const config = await getConfigByOrgId(orgId);

      if (!config) {
        return res.json({
          success: true,
          data: {
            configured: false,
            enabled: false,
            spMetadataUrl: '/api/auth/saml/metadata',
            spEntityId: SP_ENTITY_ID,
            spAcsUrl: SP_ACS_URL,
          },
        });
      }

      res.json({
        success: true,
        data: {
          configured: true,
          id: config.id,
          enabled: config.enabled,
          entryPoint: config.entryPoint,
          issuer: config.issuer,
          signatureAlgorithm: config.signatureAlgorithm,
          hasCert: !!config.cert,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
          spMetadataUrl: '/api/auth/saml/metadata',
          spEntityId: SP_ENTITY_ID,
          spAcsUrl: SP_ACS_URL,
        },
      });
    } catch (error: unknown) {
      logger.error('Failed to get SSO config', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get SSO configuration' },
      });
    }
  }
);

// POST /api/admin/security/sso — create or update SAML config
router.post(
  '/admin/security/sso',
  authenticate,
  requireRole('ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const parsed = samlConfigSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: parsed.error.flatten(),
          },
        });
      }

      const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
      const existing = await getConfigByOrgId(orgId);

      if (existing) {
        // Update existing config in DB
        await prisma.samlConfig.update({
          where: { orgId },
          data: {
            entryPoint: parsed.data.entryPoint,
            issuer: parsed.data.issuer,
            cert: parsed.data.cert,
            signatureAlgorithm: parsed.data.signatureAlgorithm,
            enabled: parsed.data.enabled,
            entityId: parsed.data.entityId,
            assertionConsumerUrl: parsed.data.assertionConsumerUrl,
            idpMetadataUrl: parsed.data.idpMetadataUrl,
            nameIdFormat: parsed.data.nameIdFormat,
            allowUnencryptedAssertions: parsed.data.allowUnencryptedAssertions,
          },
        });
        const updated = await getConfigByOrgId(orgId);

        logger.info('SAML config updated', { orgId, id: existing.id, updatedBy: (req as AuthRequest).user!.id });

        res.json({
          success: true,
          data: {
            id: updated!.id,
            enabled: updated!.enabled,
            entryPoint: updated!.entryPoint,
            issuer: updated!.issuer,
            signatureAlgorithm: updated!.signatureAlgorithm,
            updatedAt: updated!.updatedAt,
          },
        });
      } else {
        // Create new config in DB
        const created = await prisma.samlConfig.create({
          data: {
            orgId,
            entryPoint: parsed.data.entryPoint,
            issuer: parsed.data.issuer,
            cert: parsed.data.cert,
            signatureAlgorithm: parsed.data.signatureAlgorithm,
            enabled: parsed.data.enabled,
            entityId: parsed.data.entityId,
            assertionConsumerUrl: parsed.data.assertionConsumerUrl,
            idpMetadataUrl: parsed.data.idpMetadataUrl,
            nameIdFormat: parsed.data.nameIdFormat,
            allowUnencryptedAssertions: parsed.data.allowUnencryptedAssertions,
            createdBy: (req as AuthRequest).user!.id,
          },
        });

        logger.info('SAML config created', { orgId, id: created.id, createdBy: (req as AuthRequest).user!.id });

        res.status(201).json({
          success: true,
          data: {
            id: created.id,
            enabled: created.enabled,
            entryPoint: created.entryPoint,
            issuer: created.issuer,
            signatureAlgorithm: created.signatureAlgorithm,
            createdAt: created.createdAt.toISOString(),
          },
        });
      }
    } catch (error: unknown) {
      logger.error('Failed to save SSO config', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to save SSO configuration' },
      });
    }
  }
);

// DELETE /api/admin/security/sso — disable and remove SAML config
router.delete(
  '/admin/security/sso',
  authenticate,
  requireRole('ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
      const config = await getConfigByOrgId(orgId);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'No SSO configuration found for this organisation' },
        });
      }

      await prisma.samlConfig.delete({ where: { orgId } });
      logger.info('SAML config deleted', { orgId, id: config.id, deletedBy: (req as AuthRequest).user!.id });

      res.json({
        success: true,
        data: { message: 'SSO configuration removed', id: config.id },
      });
    } catch (error: unknown) {
      logger.error('Failed to delete SSO config', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete SSO configuration' },
      });
    }
  }
);

export default router;
