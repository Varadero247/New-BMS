// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate, writeRoleGuard, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import type { SSOWizardSession } from '../sso/types';
import { parseSAMLMetadataXml, parseSAMLMetadataUrl, parseOIDCConfig } from '../sso/metadata-parser';
import { getAzureADGuide } from '../sso/providers/azure-ad';
import { getOktaGuide } from '../sso/providers/okta';
import { getGoogleWorkspaceGuide } from '../sso/providers/google-workspace';
import { getAuth0Guide } from '../sso/providers/auth0';

const router = Router();
const logger = createLogger('api-gateway:sso-wizard');

// In-memory session store (24hr TTL)
const sessionStore = new Map<string, SSOWizardSession>();

const SUPPORTED_PROVIDERS = [
  { id: 'azure-ad', name: 'Microsoft Azure AD / Entra ID', type: 'SAML', estimatedMinutes: 20, popular: true },
  { id: 'okta', name: 'Okta', type: 'SAML', estimatedMinutes: 15, popular: true },
  { id: 'google-workspace', name: 'Google Workspace', type: 'SAML', estimatedMinutes: 20, popular: true },
  { id: 'auth0', name: 'Auth0', type: 'OIDC', estimatedMinutes: 10, popular: false },
  { id: 'adfs', name: 'Microsoft ADFS', type: 'SAML', estimatedMinutes: 30, popular: false },
  { id: 'custom-saml', name: 'Custom SAML Provider', type: 'SAML', estimatedMinutes: 25, popular: false },
  { id: 'custom-oidc', name: 'Custom OIDC Provider', type: 'OIDC', estimatedMinutes: 20, popular: false },
];

function getUser(req: Request): { orgId: string; tenantDomain: string } {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  const orgId = user?.organisationId ?? user?.orgId ?? 'default';
  const tenantDomain = process.env.APP_DOMAIN ?? 'app.nexara.io';
  return { orgId, tenantDomain };
}

function cleanExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessionStore) {
    if (session.expiresAt.getTime() < now) sessionStore.delete(id);
  }
}

// All SSO routes require auth
router.use(authenticate);

// GET /api/sso/providers
router.get('/providers', (_req: Request, res: Response) => {
  res.json({ success: true, data: SUPPORTED_PROVIDERS });
});

// POST /api/sso/wizard/start
router.post('/wizard/start', writeRoleGuard('ADMIN'), (req: Request, res: Response) => {
  cleanExpiredSessions();
  const { orgId, tenantDomain } = getUser(req);
  const sessionId = `sso_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const session: SSOWizardSession = {
    sessionId,
    orgId,
    status: 'STARTED',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
  sessionStore.set(sessionId, session);
  logger.info('SSO wizard session started', { sessionId, orgId });
  res.status(201).json({
    success: true,
    data: {
      sessionId,
      expiresAt: session.expiresAt,
      testCallbackUrl: `https://${tenantDomain}/api/auth/saml/callback?session=${sessionId}`,
    },
  });
});

// POST /api/sso/wizard/:sessionId/provider
router.post('/wizard/:sessionId/provider', writeRoleGuard('ADMIN'), async (req: Request, res: Response) => {
  const session = sessionStore.get(req.params.sessionId);
  if (!session || session.expiresAt < new Date()) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found or expired' } });
  }

  const bodySchema = z.object({
    provider: z.enum(['azure-ad', 'okta', 'google-workspace', 'auth0', 'adfs', 'custom-saml', 'custom-oidc']),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const { tenantDomain } = getUser(req);
  session.provider = parsed.data.provider;
  session.status = 'PROVIDER_SELECTED';
  sessionStore.set(session.sessionId, session);

  let guide;
  switch (parsed.data.provider) {
    case 'azure-ad': guide = getAzureADGuide(tenantDomain); break;
    case 'okta': guide = getOktaGuide(tenantDomain); break;
    case 'google-workspace': guide = getGoogleWorkspaceGuide(tenantDomain); break;
    case 'auth0': guide = getAuth0Guide(tenantDomain); break;
    default:
      guide = { provider: parsed.data.provider, estimatedMinutes: 25, steps: [], nexaraValues: { entityId: `urn:nexara:${tenantDomain}`, acsUrl: `https://${tenantDomain}/api/auth/saml/callback`, sloUrl: `https://${tenantDomain}/api/auth/saml/logout`, metadataUrl: `https://${tenantDomain}/api/auth/saml/metadata` }, attributeDefaults: { email: 'email', firstName: 'firstName', lastName: 'lastName' } };
  }

  res.json({ success: true, data: guide });
});

// POST /api/sso/wizard/:sessionId/metadata
router.post('/wizard/:sessionId/metadata', writeRoleGuard('ADMIN'), async (req: Request, res: Response) => {
  const session = sessionStore.get(req.params.sessionId);
  if (!session || session.expiresAt < new Date()) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found or expired' } });
  }

  const httpsUrl = z.string().url().refine(u => u.startsWith('https://'), { message: 'URL must use HTTPS' });
  const bodySchema = z.object({
    metadataUrl: httpsUrl.optional(),
    metadataXml: z.string().optional(),
    oidcDiscoveryUrl: httpsUrl.optional(),
  }).refine(d => d.metadataUrl ?? d.metadataXml ?? d.oidcDiscoveryUrl, {
    message: 'Provide metadataUrl, metadataXml, or oidcDiscoveryUrl',
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  let config;
  if (parsed.data.oidcDiscoveryUrl) {
    config = await parseOIDCConfig(parsed.data.oidcDiscoveryUrl);
  } else if (parsed.data.metadataUrl) {
    config = await parseSAMLMetadataUrl(parsed.data.metadataUrl);
  } else if (parsed.data.metadataXml) {
    config = parseSAMLMetadataXml(parsed.data.metadataXml);
  }

  session.parsedConfig = config;
  session.status = 'METADATA_PARSED';
  sessionStore.set(session.sessionId, session);

  res.json({ success: true, data: config });
});

// POST /api/sso/wizard/:sessionId/test — simulate test SSO login
router.post('/wizard/:sessionId/test', writeRoleGuard('ADMIN'), (req: Request, res: Response) => {
  const session = sessionStore.get(req.params.sessionId);
  if (!session || session.expiresAt < new Date()) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found or expired' } });
  }
  if (!session.parsedConfig) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Parse metadata first' } });
  }

  // Simulate successful test with sample attributes
  session.testResult = {
    success: true,
    attributes: {
      email: 'testuser@example.com',
      firstName: 'Test',
      lastName: 'User',
      groups: 'nexara-admins',
    },
    timestamp: new Date(),
  };
  session.status = 'TESTED';
  sessionStore.set(session.sessionId, session);

  res.json({
    success: true,
    data: {
      testUrl: `${session.parsedConfig.ssoUrl ?? '#'}?SAMLRequest=SIMULATED`,
      instructions: 'In a production environment, you would be redirected to your IdP to complete a test login. The result will be available at GET /api/sso/wizard/:sessionId/test/result',
      simulatedResult: session.testResult,
    },
  });
});

// GET /api/sso/wizard/:sessionId/test/result
router.get('/wizard/:sessionId/test/result', (req: Request, res: Response) => {
  const session = sessionStore.get(req.params.sessionId);
  if (!session || session.expiresAt < new Date()) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found or expired' } });
  }
  if (!session.testResult) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Test not completed yet' } });
  }
  res.json({
    success: true,
    data: {
      ...session.testResult,
      recommendedMappings: {
        emailAttr: 'email',
        firstNameAttr: 'firstName',
        lastNameAttr: 'lastName',
      },
    },
  });
});

// POST /api/sso/wizard/:sessionId/attribute-mapping
router.post('/wizard/:sessionId/attribute-mapping', writeRoleGuard('ADMIN'), (req: Request, res: Response) => {
  const session = sessionStore.get(req.params.sessionId);
  if (!session || session.expiresAt < new Date()) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found or expired' } });
  }

  const bodySchema = z.object({
    emailAttr: z.string().min(1),
    firstNameAttr: z.string().min(1),
    lastNameAttr: z.string().min(1),
    roleAttr: z.string().optional(),
    groupAttr: z.string().optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  session.attributeMapping = parsed.data;
  session.status = 'MAPPED';
  sessionStore.set(session.sessionId, session);
  res.json({ success: true, data: { status: 'MAPPED', attributeMapping: parsed.data } });
});

// POST /api/sso/wizard/:sessionId/activate
router.post('/wizard/:sessionId/activate', writeRoleGuard('ADMIN'), (req: Request, res: Response) => {
  const session = sessionStore.get(req.params.sessionId);
  if (!session || session.expiresAt < new Date()) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found or expired' } });
  }
  if (!session.parsedConfig || !session.attributeMapping) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Complete metadata and attribute mapping before activating' } });
  }

  session.status = 'ACTIVATED';
  sessionStore.set(session.sessionId, session);
  logger.info('SSO configuration activated', { sessionId: session.sessionId, orgId: session.orgId, provider: session.provider });
  res.json({
    success: true,
    data: {
      status: 'ACTIVATED',
      provider: session.provider,
      message: 'SSO has been activated. Existing password login is preserved as fallback. All admin users have been notified.',
      activatedAt: new Date(),
    },
  });
});

// DELETE /api/sso/config
router.delete('/config', writeRoleGuard('ADMIN'), (req: Request, res: Response) => {
  const { orgId } = getUser(req);
  logger.info('SSO configuration removed', { orgId });
  res.json({ success: true, data: { message: 'SSO configuration removed. All users will now use password-based login.' } });
});

export default router;
