import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  createHealthCheck,
} from '@ims/monitoring';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';

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

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007', 'http://localhost:3008'],
  credentials: true,
}));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-gateway'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
app.use('/api', limiter);

// Health check and metrics
app.get('/health', createHealthCheck('api-gateway', undefined, '1.0.0'));
app.get('/metrics', metricsHandler);

// Local routes (handled by gateway)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

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

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Proxied services configured', { services: SERVICES });
});

export default app;
