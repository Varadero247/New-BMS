import { Router, Request, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

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
}

// ─── In-Memory Store ────────────────────────────────────────────────────────

const samlConfigStore = new Map<string, SamlConfig>();

// ─── Validation Schemas ─────────────────────────────────────────────────────

const samlConfigSchema = z.object({
  entryPoint: z.string().url('Must be a valid URL'),
  issuer: z.string().min(1, 'Issuer is required'),
  cert: z.string().min(1, 'Certificate is required'),
  signatureAlgorithm: z.enum(['sha1', 'sha256', 'sha512']).optional().default('sha256'),
  enabled: z.boolean().optional().default(true),
});

// ─── Helper ─────────────────────────────────────────────────────────────────

const SP_ENTITY_ID = process.env.SAML_SP_ENTITY_ID || 'https://app.ims.local/saml/metadata';
const SP_ACS_URL = process.env.SAML_SP_ACS_URL || 'https://app.ims.local/api/auth/saml/callback';

function generateSpMetadata(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="${SP_ENTITY_ID}">
  <md:SPSSODescriptor
    AuthnRequestsSigned="true"
    WantAssertionsSigned="true"
    protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${SP_ACS_URL}"
      index="0"
      isDefault="true" />
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
}

function getConfigByOrgId(orgId: string): SamlConfig | undefined {
  return Array.from(samlConfigStore.values()).find((c) => c.orgId === orgId);
}

// ─── Public SAML Routes ─────────────────────────────────────────────────────

// GET /api/auth/saml/metadata — SP metadata XML
router.get('/auth/saml/metadata', (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', 'application/xml');
    res.send(generateSpMetadata());
  } catch (error: unknown) {
    logger.error('Failed to generate SP metadata', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate SP metadata' },
    });
  }
});

// GET /api/auth/saml/login?orgId=xxx — redirect to IdP
router.get('/auth/saml/login', (req: Request, res: Response) => {
  try {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'orgId query parameter is required' },
      });
    }

    const config = getConfigByOrgId(orgId);
    if (!config || !config.enabled) {
      return res.status(400).json({
        success: false,
        error: { code: 'SSO_NOT_CONFIGURED', message: 'SSO is not configured or not enabled for this organisation' },
      });
    }

    // In production, this would build a SAML AuthnRequest and redirect
    // For the skeleton, we redirect to the IdP entry point with basic params
    const redirectUrl = new URL(config.entryPoint);
    redirectUrl.searchParams.set('SAMLRequest', 'placeholder');
    redirectUrl.searchParams.set('RelayState', orgId);

    logger.info('SAML login redirect', { orgId, entryPoint: config.entryPoint });
    res.redirect(redirectUrl.toString());
  } catch (error: unknown) {
    logger.error('Failed to initiate SAML login', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to initiate SAML login' },
    });
  }
});

// POST /api/auth/saml/callback — mock SAML assertion handler
router.post('/auth/saml/callback', (req: Request, res: Response) => {
  try {
    const { SAMLResponse, RelayState } = req.body;

    if (!SAMLResponse) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'SAMLResponse is required' },
      });
    }

    // In production, this would:
    // 1. Decode and validate the SAML assertion
    // 2. Verify the signature using the IdP certificate
    // 3. Extract user attributes (email, name, groups)
    // 4. Create or update the user in the database
    // 5. Generate a JWT and redirect to the frontend

    logger.info('SAML callback received', { relayState: RelayState, hasResponse: !!SAMLResponse });

    // Mock response — would normally redirect with a token
    res.json({
      success: true,
      data: {
        message: 'SAML callback processed (skeleton — would issue JWT and redirect)',
        relayState: RelayState,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to process SAML callback', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process SAML callback' },
    });
  }
});

// ─── Admin SAML Routes ──────────────────────────────────────────────────────

// GET /api/admin/security/sso — get SAML config for org
router.get('/admin/security/sso', authenticate, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req.user as any)?.orgId || 'default';
    const config = getConfigByOrgId(orgId);

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
    logger.error('Failed to get SSO config', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get SSO configuration' },
    });
  }
});

// POST /api/admin/security/sso — create or update SAML config
router.post('/admin/security/sso', authenticate, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
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

    const orgId = (req.user as any)?.orgId || 'default';
    const existing = getConfigByOrgId(orgId);
    const now = new Date().toISOString();

    if (existing) {
      // Update
      existing.entryPoint = parsed.data.entryPoint;
      existing.issuer = parsed.data.issuer;
      existing.cert = parsed.data.cert;
      existing.signatureAlgorithm = parsed.data.signatureAlgorithm;
      existing.enabled = parsed.data.enabled;
      existing.updatedAt = now;

      logger.info('SAML config updated', { orgId, id: existing.id, updatedBy: req.user!.id });

      res.json({
        success: true,
        data: {
          id: existing.id,
          enabled: existing.enabled,
          entryPoint: existing.entryPoint,
          issuer: existing.issuer,
          signatureAlgorithm: existing.signatureAlgorithm,
          updatedAt: existing.updatedAt,
        },
      });
    } else {
      // Create
      const config: SamlConfig = {
        id: uuidv4(),
        orgId,
        entryPoint: parsed.data.entryPoint,
        issuer: parsed.data.issuer,
        cert: parsed.data.cert,
        signatureAlgorithm: parsed.data.signatureAlgorithm,
        enabled: parsed.data.enabled,
        createdAt: now,
        updatedAt: now,
      };

      samlConfigStore.set(config.id, config);

      logger.info('SAML config created', { orgId, id: config.id, createdBy: req.user!.id });

      res.status(201).json({
        success: true,
        data: {
          id: config.id,
          enabled: config.enabled,
          entryPoint: config.entryPoint,
          issuer: config.issuer,
          signatureAlgorithm: config.signatureAlgorithm,
          createdAt: config.createdAt,
        },
      });
    }
  } catch (error: unknown) {
    logger.error('Failed to save SSO config', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to save SSO configuration' },
    });
  }
});

// DELETE /api/admin/security/sso — disable and remove SAML config
router.delete('/admin/security/sso', authenticate, requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req.user as any)?.orgId || 'default';
    const config = getConfigByOrgId(orgId);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No SSO configuration found for this organisation' },
      });
    }

    samlConfigStore.delete(config.id);
    logger.info('SAML config deleted', { orgId, id: config.id, deletedBy: req.user!.id });

    res.json({
      success: true,
      data: { message: 'SSO configuration removed', id: config.id },
    });
  } catch (error: unknown) {
    logger.error('Failed to delete SSO config', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete SSO configuration' },
    });
  }
});

export default router;
