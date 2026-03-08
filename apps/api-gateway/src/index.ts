// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { initSentry, sentryErrorHandler, Sentry } from '@ims/sentry';
import express from 'express';
import type { Express, Request } from 'express';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  initTracing,
} from '@ims/monitoring';
import { validateStartupSecrets } from '@ims/secrets';
import { prisma, createSessionCleanupJob } from '@ims/database';
import { generateServiceToken } from '@ims/service-auth';

import { createProxyCircuitBreaker } from './middleware/circuit-breaker';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import complianceCalendarRoutes from './routes/compliance-calendar';
import complianceScoresRoutes from './routes/compliance-scores';
import sessionsRoutes from './routes/sessions';
import reportRoutes from './routes/reports';
import v1Routes from './routes/v1';
import mspRoutes from './routes/msp';
import notificationsRoutes from './routes/notifications';
import complianceRoutes from './routes/compliance';
import rolesRouter from './routes/roles';
import activityRoutes from './routes/activity';
import presenceRouter from './routes/presence';
import featureFlagsRouter from './routes/feature-flags';
import commentsRoutes from './routes/comments';
import tasksRoutes from './routes/tasks';
import apiKeysRouter from './routes/api-keys';
import certificationsRouter from './routes/certifications';
import ipAllowlistRouter from './routes/ip-allowlist';
import samlRouter from './routes/saml';
import scimRouter from './routes/scim';
import changelogRoutes from './routes/changelog';
import npsRoutes from './routes/nps';
import automationRulesRouter from './routes/automation-rules';
import webhooksRouter from './routes/webhooks';
import statusRouter from './routes/status';
import importRouter from './routes/import';
import openapiRouter from './routes/openapi';
import scheduledReportsRouter from './routes/scheduled-reports';
import dsarRouter from './routes/dsar';
import dpaRouter from './routes/dpa';
import marketplaceRouter from './routes/marketplace';
import esignatureRouter from './routes/esignature';
import migrationRouter from './routes/migration';
import ssoWizardRouter from './routes/sso-wizard';
import erpConnectorsRouter from './routes/erp-connectors';
import favouritesRouter from './routes/favourites';
import templatesRouter from './routes/templates';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { errorHandler } from './middleware/error-handler';
import { compressionMiddleware } from './middleware/compression';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { notFoundHandler } from './middleware/not-found';
import { apiLimiter, strictApiLimiter } from './middleware/rate-limiter';
import { orgRateLimit, stopOrgRateLimitCleanup } from './middleware/org-rate-limit';
import { csrfProtection, generateCsrfToken } from './middleware/csrf';
import { createSecurityMiddleware } from './middleware/security-headers';
import { addVersionHeader, deprecatedRoute } from './middleware/api-version';

dotenv.config();
initSentry('api-gateway');
initTracing({ serviceName: 'api-gateway' });

const logger = createLogger('api-gateway');

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Service URLs
const SERVICES = {
  healthSafety:
    process.env.SERVICE_HEALTH_SAFETY_URL ||
    process.env.HEALTH_SAFETY_URL ||
    'http://localhost:4001',
  environment:
    process.env.SERVICE_ENVIRONMENT_URL || process.env.ENVIRONMENT_URL || 'http://localhost:4002',
  quality: process.env.SERVICE_QUALITY_URL || process.env.QUALITY_URL || 'http://localhost:4003',
  aiAnalysis: process.env.SERVICE_AI_URL || process.env.AI_ANALYSIS_URL || 'http://localhost:4004',
  inventory:
    process.env.SERVICE_INVENTORY_URL || process.env.INVENTORY_URL || 'http://localhost:4005',
  hr: process.env.SERVICE_HR_URL || process.env.HR_URL || 'http://localhost:4006',
  payroll: process.env.SERVICE_PAYROLL_URL || process.env.PAYROLL_URL || 'http://localhost:4007',
  workflows:
    process.env.SERVICE_WORKFLOWS_URL || process.env.WORKFLOWS_URL || 'http://localhost:4008',
  projectManagement:
    process.env.SERVICE_PROJECT_MANAGEMENT_URL ||
    process.env.PROJECT_MANAGEMENT_URL ||
    'http://localhost:4009',
  automotive:
    process.env.SERVICE_AUTOMOTIVE_URL || process.env.AUTOMOTIVE_URL || 'http://localhost:4010',
  medical: process.env.SERVICE_MEDICAL_URL || process.env.MEDICAL_URL || 'http://localhost:4011',
  aerospace:
    process.env.SERVICE_AEROSPACE_URL || process.env.AEROSPACE_URL || 'http://localhost:4012',
  finance: process.env.SERVICE_FINANCE_URL || process.env.FINANCE_URL || 'http://localhost:4013',
  crm: process.env.SERVICE_CRM_URL || process.env.CRM_URL || 'http://localhost:4014',
  infosec: process.env.SERVICE_INFOSEC_URL || process.env.INFOSEC_URL || 'http://localhost:4015',
  esg: process.env.SERVICE_ESG_URL || process.env.ESG_URL || 'http://localhost:4016',
  cmms: process.env.SERVICE_CMMS_URL || process.env.CMMS_URL || 'http://localhost:4017',
  portal: process.env.SERVICE_PORTAL_URL || process.env.PORTAL_URL || 'http://localhost:4018',
  foodSafety:
    process.env.SERVICE_FOOD_SAFETY_URL || process.env.FOOD_SAFETY_URL || 'http://localhost:4019',
  energy: process.env.SERVICE_ENERGY_URL || process.env.ENERGY_URL || 'http://localhost:4020',
  analytics:
    process.env.SERVICE_ANALYTICS_URL || process.env.ANALYTICS_URL || 'http://localhost:4021',
  fieldService:
    process.env.SERVICE_FIELD_SERVICE_URL ||
    process.env.FIELD_SERVICE_URL ||
    'http://localhost:4022',
  iso42001: process.env.SERVICE_ISO42001_URL || process.env.ISO42001_URL || 'http://localhost:4023',
  iso37001: process.env.SERVICE_ISO37001_URL || process.env.ISO37001_URL || 'http://localhost:4024',
  marketing:
    process.env.SERVICE_MARKETING_URL || process.env.MARKETING_URL || 'http://localhost:4025',
  partners: process.env.SERVICE_PARTNERS_URL || process.env.PARTNERS_URL || 'http://localhost:4026',
  risk: process.env.SERVICE_RISK_URL || process.env.RISK_URL || 'http://localhost:4027',
  training: process.env.SERVICE_TRAINING_URL || process.env.TRAINING_URL || 'http://localhost:4028',
  suppliers:
    process.env.SERVICE_SUPPLIERS_URL || process.env.SUPPLIERS_URL || 'http://localhost:4029',
  assets: process.env.SERVICE_ASSETS_URL || process.env.ASSETS_URL || 'http://localhost:4030',
  documents:
    process.env.SERVICE_DOCUMENTS_URL || process.env.DOCUMENTS_URL || 'http://localhost:4031',
  complaints:
    process.env.SERVICE_COMPLAINTS_URL || process.env.COMPLAINTS_URL || 'http://localhost:4032',
  contracts:
    process.env.SERVICE_CONTRACTS_URL || process.env.CONTRACTS_URL || 'http://localhost:4033',
  ptw: process.env.SERVICE_PTW_URL || process.env.PTW_URL || 'http://localhost:4034',
  regMonitor:
    process.env.SERVICE_REG_MONITOR_URL || process.env.REG_MONITOR_URL || 'http://localhost:4035',
  incidents:
    process.env.SERVICE_INCIDENTS_URL || process.env.INCIDENTS_URL || 'http://localhost:4036',
  audits: process.env.SERVICE_AUDITS_URL || process.env.AUDITS_URL || 'http://localhost:4037',
  mgmtReview:
    process.env.SERVICE_MGMT_REVIEW_URL || process.env.MGMT_REVIEW_URL || 'http://localhost:4038',
  setupWizard:
    process.env.SERVICE_SETUP_WIZARD_URL || process.env.SETUP_WIZARD_URL || 'http://localhost:4039',
  chemicals:
    process.env.SERVICE_CHEMICALS_URL || process.env.CHEMICALS_URL || 'http://localhost:4040',
  emergency:
    process.env.SERVICE_EMERGENCY_URL || process.env.EMERGENCY_URL || 'http://localhost:4041',
  search: process.env.SERVICE_SEARCH_URL || process.env.SEARCH_URL || 'http://localhost:4050',
  regional: process.env.SERVICE_REGIONAL_URL || process.env.REGIONAL_URL || 'http://localhost:4042',
};

// FINDING-027: Warn in production when service URLs fall back to localhost defaults
// In production, all SERVICE_*_URL env vars should be explicitly configured.
if (process.env.NODE_ENV === 'production') {
  const localhostServices = Object.entries(SERVICES)
    .filter(([, url]) => url.includes('localhost'))
    .map(([name]) => name);
  if (localhostServices.length > 0) {
    logger.warn('Production: service URLs using localhost fallbacks — set SERVICE_*_URL env vars', {
      services: localhostServices,
    });
  }
}

// Generate service token for inter-service authentication
// Token is generated once at startup and refreshed periodically
let serviceToken = '';
function getServiceToken(): string {
  if (!serviceToken) {
    try {
      serviceToken = generateServiceToken('api-gateway');
      // Refresh token every 50 minutes (before 1h expiry)
      setInterval(
        () => {
          try {
            serviceToken = generateServiceToken('api-gateway');
            logger.info('Service token refreshed');
          } catch (error) {
            logger.error('Failed to refresh service token', { error });
          }
        },
        50 * 60 * 1000
      ).unref();
    } catch (error) {
      logger.warn('Service token generation failed - inter-service auth disabled', { error });
    }
  }
  return serviceToken;
}

// Add service token to proxy requests
function addServiceToken(proxyReq: { setHeader: (name: string, value: string) => void }): void {
  const token = getServiceToken();
  if (token) {
    proxyReq.setHeader('X-Service-Token', token);
  }
}

// Allowed CORS origins - configurable via ALLOWED_ORIGINS env var (comma-separated)
const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:3008',
  'http://localhost:3009',
  'http://localhost:3010',
  'http://localhost:3011',
  'http://localhost:3012',
  'http://localhost:3013',
  'http://localhost:3014',
  'http://localhost:3015',
  'http://localhost:3016',
  'http://localhost:3017',
  'http://localhost:3018',
  'http://localhost:3019',
  'http://localhost:3020',
  'http://localhost:3021',
  'http://localhost:3022',
  'http://localhost:3023',
  'http://localhost:3024',
  'http://localhost:3025',
  'http://localhost:3026',
  'http://localhost:3027',
  'http://localhost:3030',
  'http://localhost:3031',
  'http://localhost:3032',
  'http://localhost:3033',
  'http://localhost:3034',
  'http://localhost:3035',
  'http://localhost:3036',
  'http://localhost:3037',
  'http://localhost:3038',
  'http://localhost:3039',
  'http://localhost:3040',
  'http://localhost:3041',
  'http://localhost:3042',
  'http://localhost:3043',
  'http://localhost:3044',
  'http://localhost:3045',
  // Training Portal (port 3046)
  'http://localhost:3046',
  // Alternative ports for when Docker orphans block standard ports
  'http://localhost:3051',
  'http://localhost:3052',
  'http://localhost:3053',
  'http://localhost:3054',
  'http://localhost:3055',
  'http://localhost:3056',
  'http://localhost:3057',
  'http://localhost:3058',
  'http://localhost:3059',
  // 127.0.0.1 variants — browsers may use IP instead of hostname
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:3004',
  'http://127.0.0.1:3005',
  'http://127.0.0.1:3006',
  'http://127.0.0.1:3007',
  'http://127.0.0.1:3008',
  'http://127.0.0.1:3009',
  'http://127.0.0.1:3010',
  'http://127.0.0.1:3011',
  'http://127.0.0.1:3012',
  'http://127.0.0.1:3013',
  'http://127.0.0.1:3014',
  'http://127.0.0.1:3015',
  'http://127.0.0.1:3016',
  'http://127.0.0.1:3017',
  'http://127.0.0.1:3018',
  'http://127.0.0.1:3019',
  'http://127.0.0.1:3020',
  'http://127.0.0.1:3021',
  'http://127.0.0.1:3022',
  'http://127.0.0.1:3023',
  'http://127.0.0.1:3024',
  'http://127.0.0.1:3025',
  'http://127.0.0.1:3026',
  'http://127.0.0.1:3027',
  'http://127.0.0.1:3030',
  'http://127.0.0.1:3031',
  'http://127.0.0.1:3032',
  'http://127.0.0.1:3033',
  'http://127.0.0.1:3034',
  'http://127.0.0.1:3035',
  'http://127.0.0.1:3036',
  'http://127.0.0.1:3037',
  'http://127.0.0.1:3038',
  'http://127.0.0.1:3039',
  'http://127.0.0.1:3040',
  'http://127.0.0.1:3041',
  'http://127.0.0.1:3042',
  'http://127.0.0.1:3043',
  'http://127.0.0.1:3044',
  'http://127.0.0.1:3045',
  'http://127.0.0.1:3046',
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : DEFAULT_ORIGINS;

// Any localhost or 127.0.0.1 origin is allowed (development). Pattern covers all ports.
const DEV_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isOriginAllowed(origin: string): boolean {
  return allowedOrigins.includes(origin) || DEV_ORIGIN_RE.test(origin);
}

// Raw CORS headers - must be absolute first middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,X-CSRF-Token,X-Correlation-ID'
  );
  // Chrome Private Network Access (PNA): cross-origin requests from localhost to localhost
  // require Access-Control-Allow-Private-Network: true in the preflight response.
  // Without this, Chrome 94+ blocks the fetch with "TypeError: Failed to fetch".
  if (req.headers['access-control-request-private-network']) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});
// Security middleware (Helmet with strict CSP, HSTS, etc.)
createSecurityMiddleware().forEach((mw) => app.use(mw));
app.use(cookieParser());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-gateway'));
// Request size limits to prevent DoS attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
// Response compression (gzip/deflate for responses > 1KB)
app.use(compressionMiddleware({ threshold: 1024, level: 6 }));

// Set Sentry user scope from JWT if already decoded upstream (e.g. optional auth paths)
app.use((req, _res, next) => {
  const user = (req as import('@ims/auth').AuthRequest).user;
  if (user) {
    Sentry.getCurrentScope().setUser({ id: user.id, email: user.email, username: user.role });
  }
  next();
});

// Request timeout (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// Rate limiting (using Redis-backed limiter) — skip entirely when RATE_LIMIT_ENABLED=false
if (process.env.RATE_LIMIT_ENABLED !== 'false') {
  app.use('/api', apiLimiter);
  // Per-organisation sliding window rate limit (in-memory, plan-tier aware)
  app.use('/api', orgRateLimit());
}

// API Key authentication — checks for rxk_ tokens before JWT auth handles other tokens
app.use('/api', apiKeyAuth);

// CSRF protection (enabled by default, can be disabled with CSRF_ENABLED=false)
if (process.env.CSRF_ENABLED !== 'false') {
  app.use('/api', csrfProtection());
  logger.info('CSRF protection enabled');
} else {
  logger.warn('CSRF protection DISABLED - only disable for development/testing');
}

// Health check, readiness, and metrics
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      service: 'api-gateway',
      version: '1.0.0',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'unhealthy',
      service: 'api-gateway',
      version: '1.0.0',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// CSRF token endpoint (always available for clients to fetch tokens)
app.get('/api/csrf-token', generateCsrfToken());
app.get('/api/v1/csrf-token', generateCsrfToken());

// ============================================
// API v1 Routes (current version)
// ============================================
app.use('/api/v1', addVersionHeader('v1'), v1Routes);

// ============================================
// Legacy routes (deprecated, for backward compatibility)
// These will be removed in future versions
// ============================================
app.use('/api/auth', deprecatedRoute('/api/v1/auth'), authRoutes);
app.use('/api/users', deprecatedRoute('/api/v1/users'), userRoutes);
app.use('/api/dashboard', deprecatedRoute('/api/v1/dashboard'), dashboardRoutes);
app.use('/api/dashboard/compliance-calendar', complianceCalendarRoutes);
app.use('/api/dashboard/compliance-scores', complianceScoresRoutes);
app.use('/api/sessions', deprecatedRoute('/api/v1/sessions'), sessionsRoutes);
app.use('/api/reports', deprecatedRoute('/api/v1/reports'), reportRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/v1/notifications', addVersionHeader('v1'), notificationsRoutes);
app.use('/api/organisations', mspRoutes);
app.use('/api/v1/organisations', addVersionHeader('v1'), mspRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/v1/compliance', addVersionHeader('v1'), complianceRoutes);
app.use('/api/roles', rolesRouter);
app.use('/api/access-log', rolesRouter);
app.use('/api', featureFlagsRouter);
app.use('/api/v1', addVersionHeader('v1'), featureFlagsRouter);
app.use('/api/presence', presenceRouter);
app.use('/api/v1/presence', addVersionHeader('v1'), presenceRouter);
app.use('/api/activity', activityRoutes);
app.use('/api/v1/activity', addVersionHeader('v1'), activityRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/v1/comments', addVersionHeader('v1'), commentsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/v1/tasks', addVersionHeader('v1'), tasksRoutes);
app.use('/api/admin/api-keys', apiKeysRouter);
app.use('/api/v1/admin/api-keys', addVersionHeader('v1'), apiKeysRouter);
app.use('/api/admin/certifications', certificationsRouter);
app.use('/api/v1/admin/certifications', addVersionHeader('v1'), certificationsRouter);
app.use('/api/admin/ip-allowlist', ipAllowlistRouter);
app.use('/api/v1/admin/ip-allowlist', addVersionHeader('v1'), ipAllowlistRouter);
app.use('/api/admin/automation-rules', automationRulesRouter);
app.use('/api/v1/admin/automation-rules', addVersionHeader('v1'), automationRulesRouter);
app.use('/api/admin/webhooks', webhooksRouter);
app.use('/api/v1/admin/webhooks', addVersionHeader('v1'), webhooksRouter);
app.use('/api/health/status', statusRouter);
app.use('/api/v1/health/status', addVersionHeader('v1'), statusRouter);
app.use('/api/changelog', changelogRoutes);
app.use('/api/v1/changelog', addVersionHeader('v1'), changelogRoutes);
app.use('/api/nps', npsRoutes);
app.use('/api/v1/nps', addVersionHeader('v1'), npsRoutes);
app.use('/api', samlRouter);
app.use('/api/v1', addVersionHeader('v1'), samlRouter);
app.use('/scim/v2', scimRouter);
app.use('/api/admin/import', importRouter);
app.use('/api/v1/admin/import', addVersionHeader('v1'), importRouter);
app.use('/api/docs', openapiRouter);
app.use('/api/v1/docs', addVersionHeader('v1'), openapiRouter);
app.use('/api/admin/reports', scheduledReportsRouter);
app.use('/api/v1/admin/reports', addVersionHeader('v1'), scheduledReportsRouter);
app.use('/api/admin/privacy/dsar', dsarRouter);
app.use('/api/v1/admin/privacy/dsar', addVersionHeader('v1'), dsarRouter);
app.use('/api/admin/dpa', dpaRouter);
app.use('/api/v1/admin/dpa', addVersionHeader('v1'), dpaRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/v1/marketplace', addVersionHeader('v1'), marketplaceRouter);
app.use('/api/esignatures', esignatureRouter);
app.use('/api/v1/esignatures', addVersionHeader('v1'), esignatureRouter);
app.use('/api/migration', migrationRouter);
app.use('/api/v1/migration', addVersionHeader('v1'), migrationRouter);
app.use('/api/sso', ssoWizardRouter);
app.use('/api/v1/sso', addVersionHeader('v1'), ssoWizardRouter);
app.use('/api/erp-connectors', erpConnectorsRouter);
app.use('/api/v1/erp-connectors', addVersionHeader('v1'), erpConnectorsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/v1/templates', addVersionHeader('v1'), templatesRouter);

// ─── Cookie Consent Persistence ──────────────────────────────────────────
// Shared handler with input validation — only accepts boolean fields
function handleCookieConsent(req: express.Request, res: express.Response): void {
  const body = req.body;
  // Reject oversized or non-object payloads
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Request body must be a JSON object' },
    });
    return;
  }
  // Only allow known boolean fields — strip everything else
  const essential = typeof body.essential === 'boolean' ? body.essential : true;
  const analytics = typeof body.analytics === 'boolean' ? body.analytics : false;
  const functional = typeof body.functional === 'boolean' ? body.functional : false;

  logger.info('Cookie consent recorded', { essential, analytics, functional, ip: req.ip });
  res.json({
    success: true,
    data: {
      message: 'Cookie preferences saved',
      essential,
      analytics,
      functional,
      savedAt: new Date().toISOString(),
    },
  });
}
app.post('/api/cookie-consent', handleCookieConsent);
app.post('/api/v1/cookie-consent', addVersionHeader('v1'), handleCookieConsent);

// ============================================
// API v1 Proxy Routes (current version)
// ============================================
const createServiceProxy = (
  serviceName: string,
  target: string,
  basePath: string,
  errorMessage: string
) => {
  const cb = createProxyCircuitBreaker({ name: serviceName });

  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,
    pathRewrite: { [`^${basePath}`]: '/api' },
    onProxyReq: (proxyReq, req) => {
      addServiceToken(proxyReq);
      // Forward correlation ID to downstream services
      const correlationId =
        (req as Request & { correlationId?: string }).correlationId ||
        req.headers['x-correlation-id'];
      if (correlationId) {
        proxyReq.setHeader('x-correlation-id', correlationId);
      }
      // Re-serialize body for POST/PUT/PATCH — express.json() consumed the stream
      if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData).toString());
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes) => {
      // Track circuit breaker health: 5xx = failure, else = success
      if (proxyRes.statusCode && proxyRes.statusCode >= 500) {
        cb.onFailure();
      } else {
        cb.onSuccess();
      }
      // Remove downstream CORS headers - gateway handles CORS
      delete proxyRes.headers['access-control-allow-origin'];
      delete proxyRes.headers['access-control-allow-credentials'];
      delete proxyRes.headers['access-control-allow-methods'];
      delete proxyRes.headers['access-control-allow-headers'];
    },
    onError: (err, req, res) => {
      cb.onFailure(); // Network-level failure (connection refused, timeout, etc.)
      logger.error(`${serviceName} Proxy Error`, { error: err.message, stack: err.stack });
      (res as express.Response).status(502).json({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: errorMessage },
      });
    },
  });

  // Return a combined middleware chain:
  //   1. circuit breaker gate (OPEN → serve stale cache or 503)
  //   2. capture middleware (buffer response body for future stale cache)
  //   3. proxy (forward to downstream service)
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    cb.middleware(req, res, () => {
      cb.captureMiddleware(req, res, () => proxy(req, res, next));
    });
  };
};

// v1 proxy routes
app.use(
  '/api/v1/health-safety',
  addVersionHeader('v1'),
  createServiceProxy(
    'Health Safety',
    SERVICES.healthSafety,
    '/api/v1/health-safety',
    'Health & Safety service unavailable'
  )
);
app.use(
  '/api/v1/environment',
  addVersionHeader('v1'),
  createServiceProxy(
    'Environment',
    SERVICES.environment,
    '/api/v1/environment',
    'Environment service unavailable'
  )
);
app.use(
  '/api/v1/quality',
  addVersionHeader('v1'),
  createServiceProxy('Quality', SERVICES.quality, '/api/v1/quality', 'Quality service unavailable')
);
app.use(
  '/api/v1/ai',
  addVersionHeader('v1'),
  strictApiLimiter,
  createServiceProxy(
    'AI Analysis',
    SERVICES.aiAnalysis,
    '/api/v1/ai',
    'AI Analysis service unavailable'
  )
);
app.use(
  '/api/v1/inventory',
  addVersionHeader('v1'),
  createServiceProxy(
    'Inventory',
    SERVICES.inventory,
    '/api/v1/inventory',
    'Inventory service unavailable'
  )
);
app.use(
  '/api/v1/hr',
  addVersionHeader('v1'),
  createServiceProxy('HR', SERVICES.hr, '/api/v1/hr', 'HR service unavailable')
);
app.use(
  '/api/v1/payroll',
  addVersionHeader('v1'),
  createServiceProxy('Payroll', SERVICES.payroll, '/api/v1/payroll', 'Payroll service unavailable')
);
app.use(
  '/api/v1/workflows',
  addVersionHeader('v1'),
  createServiceProxy(
    'Workflows',
    SERVICES.workflows,
    '/api/v1/workflows',
    'Workflows service unavailable'
  )
);
app.use(
  '/api/v1/project-management',
  addVersionHeader('v1'),
  createServiceProxy(
    'Project Management',
    SERVICES.projectManagement,
    '/api/v1/project-management',
    'Project Management service unavailable'
  )
);
app.use(
  '/api/v1/automotive',
  addVersionHeader('v1'),
  createServiceProxy(
    'Automotive',
    SERVICES.automotive,
    '/api/v1/automotive',
    'Automotive service unavailable'
  )
);
app.use(
  '/api/v1/medical',
  addVersionHeader('v1'),
  createServiceProxy('Medical', SERVICES.medical, '/api/v1/medical', 'Medical service unavailable')
);
app.use(
  '/api/v1/aerospace',
  addVersionHeader('v1'),
  createServiceProxy(
    'Aerospace',
    SERVICES.aerospace,
    '/api/v1/aerospace',
    'Aerospace service unavailable'
  )
);
app.use(
  '/api/v1/finance',
  addVersionHeader('v1'),
  createServiceProxy('Finance', SERVICES.finance, '/api/v1/finance', 'Finance service unavailable')
);
app.use(
  '/api/v1/crm',
  addVersionHeader('v1'),
  createServiceProxy('CRM', SERVICES.crm, '/api/v1/crm', 'CRM service unavailable')
);
app.use(
  '/api/v1/infosec',
  addVersionHeader('v1'),
  createServiceProxy('InfoSec', SERVICES.infosec, '/api/v1/infosec', 'InfoSec service unavailable')
);
app.use(
  '/api/v1/esg',
  addVersionHeader('v1'),
  createServiceProxy('ESG', SERVICES.esg, '/api/v1/esg', 'ESG service unavailable')
);
app.use(
  '/api/v1/cmms',
  addVersionHeader('v1'),
  createServiceProxy('CMMS', SERVICES.cmms, '/api/v1/cmms', 'CMMS service unavailable')
);
app.use(
  '/api/v1/portal',
  addVersionHeader('v1'),
  createServiceProxy('Portal', SERVICES.portal, '/api/v1/portal', 'Portal service unavailable')
);
app.use(
  '/api/v1/food-safety',
  addVersionHeader('v1'),
  createServiceProxy(
    'Food Safety',
    SERVICES.foodSafety,
    '/api/v1/food-safety',
    'Food Safety service unavailable'
  )
);
app.use(
  '/api/v1/energy',
  addVersionHeader('v1'),
  createServiceProxy('Energy', SERVICES.energy, '/api/v1/energy', 'Energy service unavailable')
);
app.use(
  '/api/v1/analytics',
  addVersionHeader('v1'),
  createServiceProxy(
    'Analytics',
    SERVICES.analytics,
    '/api/v1/analytics',
    'Analytics service unavailable'
  )
);
app.use(
  '/api/v1/field-service',
  addVersionHeader('v1'),
  createServiceProxy(
    'Field Service',
    SERVICES.fieldService,
    '/api/v1/field-service',
    'Field Service service unavailable'
  )
);
app.use(
  '/api/v1/iso42001',
  addVersionHeader('v1'),
  createServiceProxy(
    'ISO 42001',
    SERVICES.iso42001,
    '/api/v1/iso42001',
    'ISO 42001 AI Management service unavailable'
  )
);
app.use(
  '/api/v1/iso37001',
  addVersionHeader('v1'),
  createServiceProxy(
    'ISO 37001',
    SERVICES.iso37001,
    '/api/v1/iso37001',
    'ISO 37001 Anti-Bribery service unavailable'
  )
);
app.use(
  '/api/v1/marketing',
  addVersionHeader('v1'),
  createServiceProxy(
    'Marketing',
    SERVICES.marketing,
    '/api/v1/marketing',
    'Marketing service unavailable'
  )
);
app.use(
  '/api/v1/partners',
  addVersionHeader('v1'),
  createServiceProxy(
    'Partners',
    SERVICES.partners,
    '/api/v1/partners',
    'Partners service unavailable'
  )
);
app.use(
  '/api/v1/risk',
  addVersionHeader('v1'),
  createServiceProxy('Risk', SERVICES.risk, '/api/v1/risk', 'Risk service unavailable')
);
app.use(
  '/api/v1/training',
  addVersionHeader('v1'),
  createServiceProxy(
    'Training',
    SERVICES.training,
    '/api/v1/training',
    'Training service unavailable'
  )
);
app.use(
  '/api/v1/suppliers',
  addVersionHeader('v1'),
  createServiceProxy(
    'Suppliers',
    SERVICES.suppliers,
    '/api/v1/suppliers',
    'Suppliers service unavailable'
  )
);
app.use(
  '/api/v1/assets',
  addVersionHeader('v1'),
  createServiceProxy('Assets', SERVICES.assets, '/api/v1/assets', 'Assets service unavailable')
);
app.use(
  '/api/v1/documents',
  addVersionHeader('v1'),
  createServiceProxy(
    'Documents',
    SERVICES.documents,
    '/api/v1/documents',
    'Documents service unavailable'
  )
);
app.use(
  '/api/v1/complaints',
  addVersionHeader('v1'),
  createServiceProxy(
    'Complaints',
    SERVICES.complaints,
    '/api/v1/complaints',
    'Complaints service unavailable'
  )
);
app.use(
  '/api/v1/contracts',
  addVersionHeader('v1'),
  createServiceProxy(
    'Contracts',
    SERVICES.contracts,
    '/api/v1/contracts',
    'Contracts service unavailable'
  )
);
app.use(
  '/api/v1/ptw',
  addVersionHeader('v1'),
  createServiceProxy('PTW', SERVICES.ptw, '/api/v1/ptw', 'PTW service unavailable')
);
app.use(
  '/api/v1/reg-monitor',
  addVersionHeader('v1'),
  createServiceProxy(
    'Reg Monitor',
    SERVICES.regMonitor,
    '/api/v1/reg-monitor',
    'Regulatory Monitor service unavailable'
  )
);
app.use(
  '/api/v1/incidents',
  addVersionHeader('v1'),
  createServiceProxy(
    'Incidents',
    SERVICES.incidents,
    '/api/v1/incidents',
    'Incidents service unavailable'
  )
);
app.use(
  '/api/v1/audits',
  addVersionHeader('v1'),
  createServiceProxy('Audits', SERVICES.audits, '/api/v1/audits', 'Audits service unavailable')
);
app.use(
  '/api/v1/mgmt-review',
  addVersionHeader('v1'),
  createServiceProxy(
    'Mgmt Review',
    SERVICES.mgmtReview,
    '/api/v1/mgmt-review',
    'Management Review service unavailable'
  )
);
app.use(
  '/api/v1/wizard',
  addVersionHeader('v1'),
  createServiceProxy(
    'Setup Wizard',
    SERVICES.setupWizard,
    '/api/v1/wizard',
    'Setup Wizard service unavailable'
  )
);
app.use(
  '/api/v1/chemicals',
  addVersionHeader('v1'),
  createServiceProxy(
    'Chemicals',
    SERVICES.chemicals,
    '/api/v1/chemicals',
    'Chemical Management service unavailable'
  )
);
app.use(
  '/api/v1/emergency',
  addVersionHeader('v1'),
  createServiceProxy(
    'Emergency',
    SERVICES.emergency,
    '/api/v1/emergency',
    'Fire, Emergency & Disaster Management service unavailable'
  )
);
app.use(
  '/api/v1/search',
  addVersionHeader('v1'),
  createServiceProxy('Search', SERVICES.search, '/api/v1/search', 'Global Search service unavailable')
);
app.use(
  '/api/v1/regional',
  addVersionHeader('v1'),
  createServiceProxy(
    'Regional',
    SERVICES.regional,
    '/api/v1/regional',
    'Regional Localisation service unavailable'
  )
);

// ============================================
// Legacy Proxy Routes (deprecated)
// ============================================
app.use(
  '/api/health-safety',
  deprecatedRoute('/api/v1/health-safety'),
  createServiceProxy(
    'Health Safety',
    SERVICES.healthSafety,
    '/api/health-safety',
    'Health & Safety service unavailable'
  )
);
app.use(
  '/api/environment',
  deprecatedRoute('/api/v1/environment'),
  createServiceProxy(
    'Environment',
    SERVICES.environment,
    '/api/environment',
    'Environment service unavailable'
  )
);
app.use(
  '/api/quality',
  deprecatedRoute('/api/v1/quality'),
  createServiceProxy('Quality', SERVICES.quality, '/api/quality', 'Quality service unavailable')
);
app.use(
  '/api/ai',
  deprecatedRoute('/api/v1/ai'),
  strictApiLimiter,
  createServiceProxy(
    'AI Analysis',
    SERVICES.aiAnalysis,
    '/api/ai',
    'AI Analysis service unavailable'
  )
);
app.use(
  '/api/inventory',
  deprecatedRoute('/api/v1/inventory'),
  createServiceProxy(
    'Inventory',
    SERVICES.inventory,
    '/api/inventory',
    'Inventory service unavailable'
  )
);
app.use(
  '/api/hr',
  deprecatedRoute('/api/v1/hr'),
  createServiceProxy('HR', SERVICES.hr, '/api/hr', 'HR service unavailable')
);
app.use(
  '/api/payroll',
  deprecatedRoute('/api/v1/payroll'),
  createServiceProxy('Payroll', SERVICES.payroll, '/api/payroll', 'Payroll service unavailable')
);
app.use(
  '/api/workflows',
  deprecatedRoute('/api/v1/workflows'),
  createServiceProxy(
    'Workflows',
    SERVICES.workflows,
    '/api/workflows',
    'Workflows service unavailable'
  )
);
app.use(
  '/api/project-management',
  deprecatedRoute('/api/v1/project-management'),
  createServiceProxy(
    'Project Management',
    SERVICES.projectManagement,
    '/api/project-management',
    'Project Management service unavailable'
  )
);
app.use(
  '/api/automotive',
  deprecatedRoute('/api/v1/automotive'),
  createServiceProxy(
    'Automotive',
    SERVICES.automotive,
    '/api/automotive',
    'Automotive service unavailable'
  )
);
app.use(
  '/api/medical',
  deprecatedRoute('/api/v1/medical'),
  createServiceProxy('Medical', SERVICES.medical, '/api/medical', 'Medical service unavailable')
);
app.use(
  '/api/aerospace',
  deprecatedRoute('/api/v1/aerospace'),
  createServiceProxy(
    'Aerospace',
    SERVICES.aerospace,
    '/api/aerospace',
    'Aerospace service unavailable'
  )
);
app.use(
  '/api/finance',
  deprecatedRoute('/api/v1/finance'),
  createServiceProxy('Finance', SERVICES.finance, '/api/finance', 'Finance service unavailable')
);
app.use(
  '/api/crm',
  deprecatedRoute('/api/v1/crm'),
  createServiceProxy('CRM', SERVICES.crm, '/api/crm', 'CRM service unavailable')
);
app.use(
  '/api/infosec',
  deprecatedRoute('/api/v1/infosec'),
  createServiceProxy('InfoSec', SERVICES.infosec, '/api/infosec', 'InfoSec service unavailable')
);
app.use(
  '/api/esg',
  deprecatedRoute('/api/v1/esg'),
  createServiceProxy('ESG', SERVICES.esg, '/api/esg', 'ESG service unavailable')
);
app.use(
  '/api/cmms',
  deprecatedRoute('/api/v1/cmms'),
  createServiceProxy('CMMS', SERVICES.cmms, '/api/cmms', 'CMMS service unavailable')
);
app.use(
  '/api/portal',
  deprecatedRoute('/api/v1/portal'),
  createServiceProxy('Portal', SERVICES.portal, '/api/portal', 'Portal service unavailable')
);
app.use(
  '/api/food-safety',
  deprecatedRoute('/api/v1/food-safety'),
  createServiceProxy(
    'Food Safety',
    SERVICES.foodSafety,
    '/api/food-safety',
    'Food Safety service unavailable'
  )
);
app.use(
  '/api/energy',
  deprecatedRoute('/api/v1/energy'),
  createServiceProxy('Energy', SERVICES.energy, '/api/energy', 'Energy service unavailable')
);
app.use(
  '/api/analytics',
  deprecatedRoute('/api/v1/analytics'),
  createServiceProxy(
    'Analytics',
    SERVICES.analytics,
    '/api/analytics',
    'Analytics service unavailable'
  )
);
app.use(
  '/api/field-service',
  deprecatedRoute('/api/v1/field-service'),
  createServiceProxy(
    'Field Service',
    SERVICES.fieldService,
    '/api/field-service',
    'Field Service service unavailable'
  )
);
app.use(
  '/api/iso42001',
  deprecatedRoute('/api/v1/iso42001'),
  createServiceProxy(
    'ISO 42001',
    SERVICES.iso42001,
    '/api/iso42001',
    'ISO 42001 AI Management service unavailable'
  )
);
app.use(
  '/api/iso37001',
  deprecatedRoute('/api/v1/iso37001'),
  createServiceProxy(
    'ISO 37001',
    SERVICES.iso37001,
    '/api/iso37001',
    'ISO 37001 Anti-Bribery service unavailable'
  )
);
app.use(
  '/api/marketing',
  deprecatedRoute('/api/v1/marketing'),
  createServiceProxy(
    'Marketing',
    SERVICES.marketing,
    '/api/marketing',
    'Marketing service unavailable'
  )
);
app.use(
  '/api/partners',
  deprecatedRoute('/api/v1/partners'),
  createServiceProxy('Partners', SERVICES.partners, '/api/partners', 'Partners service unavailable')
);
app.use(
  '/api/risk',
  deprecatedRoute('/api/v1/risk'),
  createServiceProxy('Risk', SERVICES.risk, '/api/risk', 'Risk service unavailable')
);
app.use(
  '/api/training',
  deprecatedRoute('/api/v1/training'),
  createServiceProxy('Training', SERVICES.training, '/api/training', 'Training service unavailable')
);
app.use(
  '/api/suppliers',
  deprecatedRoute('/api/v1/suppliers'),
  createServiceProxy(
    'Suppliers',
    SERVICES.suppliers,
    '/api/suppliers',
    'Suppliers service unavailable'
  )
);
app.use(
  '/api/assets',
  deprecatedRoute('/api/v1/assets'),
  createServiceProxy('Assets', SERVICES.assets, '/api/assets', 'Assets service unavailable')
);
app.use(
  '/api/documents',
  deprecatedRoute('/api/v1/documents'),
  createServiceProxy(
    'Documents',
    SERVICES.documents,
    '/api/documents',
    'Documents service unavailable'
  )
);
app.use(
  '/api/complaints',
  deprecatedRoute('/api/v1/complaints'),
  createServiceProxy(
    'Complaints',
    SERVICES.complaints,
    '/api/complaints',
    'Complaints service unavailable'
  )
);
app.use(
  '/api/contracts',
  deprecatedRoute('/api/v1/contracts'),
  createServiceProxy(
    'Contracts',
    SERVICES.contracts,
    '/api/contracts',
    'Contracts service unavailable'
  )
);
app.use(
  '/api/ptw',
  deprecatedRoute('/api/v1/ptw'),
  createServiceProxy('PTW', SERVICES.ptw, '/api/ptw', 'PTW service unavailable')
);
app.use(
  '/api/reg-monitor',
  deprecatedRoute('/api/v1/reg-monitor'),
  createServiceProxy(
    'Reg Monitor',
    SERVICES.regMonitor,
    '/api/reg-monitor',
    'Regulatory Monitor service unavailable'
  )
);
app.use(
  '/api/incidents',
  deprecatedRoute('/api/v1/incidents'),
  createServiceProxy(
    'Incidents',
    SERVICES.incidents,
    '/api/incidents',
    'Incidents service unavailable'
  )
);
app.use(
  '/api/audits',
  deprecatedRoute('/api/v1/audits'),
  createServiceProxy('Audits', SERVICES.audits, '/api/audits', 'Audits service unavailable')
);
app.use(
  '/api/mgmt-review',
  deprecatedRoute('/api/v1/mgmt-review'),
  createServiceProxy(
    'Mgmt Review',
    SERVICES.mgmtReview,
    '/api/mgmt-review',
    'Management Review service unavailable'
  )
);
app.use(
  '/api/wizard',
  deprecatedRoute('/api/v1/wizard'),
  createServiceProxy(
    'Setup Wizard',
    SERVICES.setupWizard,
    '/api/wizard',
    'Setup Wizard service unavailable'
  )
);
app.use(
  '/api/chemicals',
  deprecatedRoute('/api/v1/chemicals'),
  createServiceProxy(
    'Chemicals',
    SERVICES.chemicals,
    '/api/chemicals',
    'Chemical Management service unavailable'
  )
);
app.use(
  '/api/emergency',
  deprecatedRoute('/api/v1/emergency'),
  createServiceProxy(
    'Emergency',
    SERVICES.emergency,
    '/api/emergency',
    'Fire, Emergency & Disaster Management service unavailable'
  )
);
app.use(
  '/api/search',
  deprecatedRoute('/api/v1/search'),
  createServiceProxy('Search', SERVICES.search, '/api/search', 'Global Search service unavailable')
);
app.use(
  '/api/regional',
  deprecatedRoute('/api/v1/regional'),
  createServiceProxy(
    'Regional',
    SERVICES.regional,
    '/api/regional',
    'Regional Localisation service unavailable'
  )
);

// Favourites (bookmarks)
app.use(favouritesRouter);

// Error handling
app.use(notFoundHandler);
app.use(sentryErrorHandler());
app.use(errorHandler);

// Validate secrets on startup
const isProduction = process.env.NODE_ENV === 'production';
const secretsValidation = validateStartupSecrets(process.env, isProduction);

if (!secretsValidation.valid) {
  logger.error('Startup failed - invalid secrets configuration', {
    errors: secretsValidation.errors,
  });
  if (isProduction) {
    process.exit(1);
  }
}

if (secretsValidation.warnings.length > 0) {
  secretsValidation.warnings.forEach((warning) => {
    logger.warn(warning);
  });
}

// Start session cleanup job (runs every hour)
const sessionCleanupJob = createSessionCleanupJob(prisma, logger);
sessionCleanupJob.start(60 * 60 * 1000); // 1 hour

const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Proxied services configured', { services: SERVICES });
  logger.info('Session cleanup job started');
});

// Prevent EADDRINUSE and other listen errors from becoming uncaughtExceptions
server.on('error', (err: NodeJS.ErrnoException) => {
  console.error(`[api-gateway] Server error: ${err.code} ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`[api-gateway] Port ${PORT} already in use — exiting so process manager can retry`);
  }
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  sessionCleanupJob.stop();
  stopOrgRateLimitCleanup();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Force exit after 10 seconds if connections don't close
  setTimeout(() => {
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason), stack: reason instanceof Error ? reason.stack : undefined });
});

process.on('uncaughtException', (error) => {
  // Use synchronous console.error so the message flushes before process.exit
  console.error('[api-gateway] Uncaught exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

export default app;
