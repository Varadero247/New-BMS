import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing required env var: ${envVar}`);
    process.exit(1);
  }
}

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  createHealthCheck,
} from '@ims/monitoring';
import { attachPermissions } from '@ims/rbac';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { prisma } from './prisma';

const logger = createLogger('api-iso42001');

import aiSystemsRouter from './routes/ai-systems';
import riskAssessmentsRouter from './routes/risk-assessments';
import policiesRouter from './routes/policies';
import incidentsRouter from './routes/incidents';
import controlsRouter from './routes/controls';
import impactAssessmentsRouter from './routes/impact-assessments';
import selfDeclarationRouter from './routes/self-declaration';
import auditLogRouter from './routes/audit-log';
import humanReviewRouter from './routes/human-review';
import monitoringRouter from './routes/monitoring';
import { createAiAuditMiddleware } from './middleware/ai-audit';

const app: Express = express();
const PORT = process.env.PORT || 4023;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-iso42001'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-iso42001', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// AI Audit Middleware — logs all mutating requests to AiAuditLog
app.use(createAiAuditMiddleware());

// API Routes
app.use('/api/ai-systems', aiSystemsRouter);
app.use('/api/risk-assessments', riskAssessmentsRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/controls', controlsRouter);
app.use('/api/impact-assessments', impactAssessmentsRouter);
app.use('/api/self-declaration', selfDeclarationRouter);
app.use('/api/audit-log', auditLogRouter);
app.use('/api/human-review', humanReviewRouter);
app.use('/api/monitoring', monitoringRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
});

const server = app.listen(PORT, () => {
  logger.info(`ISO 42001 API server running on port ${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => { process.exit(1); }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
  process.exit(1);
});

export default app;
