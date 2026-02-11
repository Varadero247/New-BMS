import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  createHealthCheck,
} from '@ims/monitoring';
import { validateStartupSecrets } from '@ims/secrets';
import { prisma, createSessionCleanupJob } from '@ims/database';
import { generateServiceToken } from '@ims/service-auth';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import sessionsRoutes from './routes/sessions';
import v1Routes from './routes/v1';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { apiLimiter } from './middleware/rate-limiter';
import { csrfProtection, generateCsrfToken } from './middleware/csrf';
import { createSecurityMiddleware } from './middleware/security-headers';
import { addVersionHeader, deprecatedRoute } from './middleware/api-version';

dotenv.config();

const logger = createLogger('api-gateway');

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Service URLs
const SERVICES = {
  healthSafety: process.env.SERVICE_HEALTH_SAFETY_URL || process.env.HEALTH_SAFETY_URL || 'http://localhost:4001',
  environment: process.env.SERVICE_ENVIRONMENT_URL || process.env.ENVIRONMENT_URL || 'http://localhost:4002',
  quality: process.env.SERVICE_QUALITY_URL || process.env.QUALITY_URL || 'http://localhost:4003',
  aiAnalysis: process.env.SERVICE_AI_URL || process.env.AI_ANALYSIS_URL || 'http://localhost:4004',
  inventory: process.env.SERVICE_INVENTORY_URL || process.env.INVENTORY_URL || 'http://localhost:4005',
  hr: process.env.SERVICE_HR_URL || process.env.HR_URL || 'http://localhost:4006',
  payroll: process.env.SERVICE_PAYROLL_URL || process.env.PAYROLL_URL || 'http://localhost:4007',
  workflows: process.env.SERVICE_WORKFLOWS_URL || process.env.WORKFLOWS_URL || 'http://localhost:4008',
};

// Generate service token for inter-service authentication
// Token is generated once at startup and refreshed periodically
let serviceToken = '';
function getServiceToken(): string {
  if (!serviceToken) {
    try {
      serviceToken = generateServiceToken('api-gateway');
      // Refresh token every 50 minutes (before 1h expiry)
      setInterval(() => {
        try {
          serviceToken = generateServiceToken('api-gateway');
          logger.info('Service token refreshed');
        } catch (error) {
          logger.error('Failed to refresh service token', { error });
        }
      }, 50 * 60 * 1000);
    } catch (error) {
      logger.warn('Service token generation failed - inter-service auth disabled', { error });
    }
  }
  return serviceToken;
}

// Add service token to proxy requests
function addServiceToken(proxyReq: any): void {
  const token = getServiceToken();
  if (token) {
    proxyReq.setHeader('X-Service-Token', token);
  }
}

// Raw CORS headers - must be absolute first middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.headers.origin;
  const allowed = ['http://localhost:3000','http://localhost:3001','http://localhost:3002','http://localhost:3003','http://localhost:3004','http://localhost:3005','http://localhost:3006','http://localhost:3007','http://localhost:3008'];
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Correlation-ID');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});
// CORS must run BEFORE security middleware
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007', 'http://localhost:3008'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || '*');
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Correlation-ID'],
}));
// Security middleware (Helmet with strict CSP, HSTS, etc.)
createSecurityMiddleware().forEach((mw) => app.use(mw));
app.use(cookieParser());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-gateway'));
// Request size limits to prevent DoS attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request timeout (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// Rate limiting (using Redis-backed limiter)
app.use('/api', apiLimiter);

// CSRF protection (enabled by default, can be disabled with CSRF_ENABLED=false)
if (process.env.CSRF_ENABLED !== 'false') {
  app.use('/api', csrfProtection());
  logger.info('CSRF protection enabled');
} else {
  logger.warn('CSRF protection DISABLED - only disable for development/testing');
}

// Health check and metrics
app.get('/health', createHealthCheck('api-gateway', undefined, '1.0.0'));
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
app.use('/api/sessions', deprecatedRoute('/api/v1/sessions'), sessionsRoutes);

// ============================================
// API v1 Proxy Routes (current version)
// ============================================
const createServiceProxy = (
  serviceName: string,
  target: string,
  basePath: string,
  errorMessage: string
) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: { [`^${basePath}`]: '/api' },
  onProxyReq: (proxyReq, req) => {
    addServiceToken(proxyReq);
    // Re-serialize body for POST/PUT/PATCH — express.json() consumed the stream
    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData).toString());
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes) => {
    // Remove downstream CORS headers - gateway handles CORS
    delete proxyRes.headers['access-control-allow-origin'];
    delete proxyRes.headers['access-control-allow-credentials'];
    delete proxyRes.headers['access-control-allow-methods'];
    delete proxyRes.headers['access-control-allow-headers'];
  },
  onError: (err, req, res) => {
    logger.error(`${serviceName} Proxy Error`, { error: err.message });
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: errorMessage },
    });
  },
});

// v1 proxy routes
app.use('/api/v1/health-safety', addVersionHeader('v1'), createServiceProxy('Health Safety', SERVICES.healthSafety, '/api/v1/health-safety', 'Health & Safety service unavailable'));
app.use('/api/v1/environment', addVersionHeader('v1'), createServiceProxy('Environment', SERVICES.environment, '/api/v1/environment', 'Environment service unavailable'));
app.use('/api/v1/quality', addVersionHeader('v1'), createServiceProxy('Quality', SERVICES.quality, '/api/v1/quality', 'Quality service unavailable'));
app.use('/api/v1/ai', addVersionHeader('v1'), createServiceProxy('AI Analysis', SERVICES.aiAnalysis, '/api/v1/ai', 'AI Analysis service unavailable'));
app.use('/api/v1/inventory', addVersionHeader('v1'), createServiceProxy('Inventory', SERVICES.inventory, '/api/v1/inventory', 'Inventory service unavailable'));
app.use('/api/v1/hr', addVersionHeader('v1'), createServiceProxy('HR', SERVICES.hr, '/api/v1/hr', 'HR service unavailable'));
app.use('/api/v1/payroll', addVersionHeader('v1'), createServiceProxy('Payroll', SERVICES.payroll, '/api/v1/payroll', 'Payroll service unavailable'));
app.use('/api/v1/workflows', addVersionHeader('v1'), createServiceProxy('Workflows', SERVICES.workflows, '/api/v1/workflows', 'Workflows service unavailable'));

// ============================================
// Legacy Proxy Routes (deprecated)
// ============================================
app.use('/api/health-safety', deprecatedRoute('/api/v1/health-safety'), createServiceProxy('Health Safety', SERVICES.healthSafety, '/api/health-safety', 'Health & Safety service unavailable'));
app.use('/api/environment', deprecatedRoute('/api/v1/environment'), createServiceProxy('Environment', SERVICES.environment, '/api/environment', 'Environment service unavailable'));
app.use('/api/quality', deprecatedRoute('/api/v1/quality'), createServiceProxy('Quality', SERVICES.quality, '/api/quality', 'Quality service unavailable'));
app.use('/api/ai', deprecatedRoute('/api/v1/ai'), createServiceProxy('AI Analysis', SERVICES.aiAnalysis, '/api/ai', 'AI Analysis service unavailable'));
app.use('/api/inventory', deprecatedRoute('/api/v1/inventory'), createServiceProxy('Inventory', SERVICES.inventory, '/api/inventory', 'Inventory service unavailable'));
app.use('/api/hr', deprecatedRoute('/api/v1/hr'), createServiceProxy('HR', SERVICES.hr, '/api/hr', 'HR service unavailable'));
app.use('/api/payroll', deprecatedRoute('/api/v1/payroll'), createServiceProxy('Payroll', SERVICES.payroll, '/api/payroll', 'Payroll service unavailable'));
app.use('/api/workflows', deprecatedRoute('/api/v1/workflows'), createServiceProxy('Workflows', SERVICES.workflows, '/api/workflows', 'Workflows service unavailable'));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Validate secrets on startup
const isProduction = process.env.NODE_ENV === 'production';
const secretsValidation = validateStartupSecrets(process.env, isProduction);

if (!secretsValidation.valid) {
  logger.error('Startup failed - invalid secrets configuration', { errors: secretsValidation.errors });
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

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Proxied services configured', { services: SERVICES });
  logger.info('Session cleanup job started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  sessionCleanupJob.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  sessionCleanupJob.stop();
  process.exit(0);
});

export default app;
