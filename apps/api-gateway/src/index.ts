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

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import sessionsRoutes from './routes/sessions';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { apiLimiter } from './middleware/rate-limiter';
import { csrfProtection, generateCsrfToken } from './middleware/csrf';
import { createSecurityMiddleware } from './middleware/security-headers';

dotenv.config();

const logger = createLogger('api-gateway');

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Service URLs
const SERVICES = {
  healthSafety: process.env.HEALTH_SAFETY_URL || 'http://localhost:4001',
  environment: process.env.ENVIRONMENT_URL || 'http://localhost:4002',
  quality: process.env.QUALITY_URL || 'http://localhost:4003',
  aiAnalysis: process.env.AI_ANALYSIS_URL || 'http://localhost:4004',
  inventory: process.env.INVENTORY_URL || 'http://localhost:4005',
  hr: process.env.HR_URL || 'http://localhost:4006',
  payroll: process.env.PAYROLL_URL || 'http://localhost:4007',
  workflows: process.env.WORKFLOWS_URL || 'http://localhost:4008',
};

// Security middleware (Helmet with strict CSP, HSTS, etc.)
createSecurityMiddleware().forEach((mw) => app.use(mw));
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007', 'http://localhost:3008'],
  credentials: true,
}));
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

// Local routes (handled by gateway)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sessions', sessionsRoutes);

// Proxy routes to domain services
app.use('/api/health-safety', createProxyMiddleware({
  target: SERVICES.healthSafety,
  changeOrigin: true,
  pathRewrite: { '^/api/health-safety': '/api' },
  onError: (err, req, res) => {
    logger.error('Health Safety Proxy Error', { error: err.message });
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Health & Safety service unavailable' },
    });
  },
}));

app.use('/api/environment', createProxyMiddleware({
  target: SERVICES.environment,
  changeOrigin: true,
  pathRewrite: { '^/api/environment': '/api' },
  onError: (err, req, res) => {
    logger.error('Environment Proxy Error', { error: err.message });
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Environment service unavailable' },
    });
  },
}));

app.use('/api/quality', createProxyMiddleware({
  target: SERVICES.quality,
  changeOrigin: true,
  pathRewrite: { '^/api/quality': '/api' },
  onError: (err, req, res) => {
    logger.error('Quality Proxy Error', { error: err.message });
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Quality service unavailable' },
    });
  },
}));

app.use('/api/ai', createProxyMiddleware({
  target: SERVICES.aiAnalysis,
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/api' },
  onError: (err, req, res) => {
    logger.error('AI Analysis Proxy Error', { error: err.message });
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'AI Analysis service unavailable' },
    });
  },
}));

app.use('/api/inventory', createProxyMiddleware({
  target: SERVICES.inventory,
  changeOrigin: true,
  pathRewrite: { '^/api/inventory': '/api' },
  onError: (err, req, res) => {
    logger.error('Inventory Proxy Error', { error: err.message });
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Inventory service unavailable' },
    });
  },
}));

app.use('/api/hr', createProxyMiddleware({
  target: SERVICES.hr,
  changeOrigin: true,
  pathRewrite: { '^/api/hr': '/api' },
  onError: (err, req, res) => {
    logger.error('HR Proxy Error', { error: err.message });
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'HR service unavailable' },
    });
  },
}));

app.use('/api/payroll', createProxyMiddleware({
  target: SERVICES.payroll,
  changeOrigin: true,
  pathRewrite: { '^/api/payroll': '/api' },
  onError: (err, req, res) => {
    logger.error('Payroll Proxy Error', { error: err.message });
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Payroll service unavailable' },
    });
  },
}));

app.use('/api/workflows', createProxyMiddleware({
  target: SERVICES.workflows,
  changeOrigin: true,
  pathRewrite: { '^/api/workflows': '/api' },
  onError: (err, req, res) => {
    logger.error('Workflows Proxy Error', { error: err.message });
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Workflows service unavailable' },
    });
  },
}));

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
