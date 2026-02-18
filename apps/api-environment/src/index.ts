import { initSentry } from '@ims/sentry';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-environment');

// Validate required configuration
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing required env var: ${envVar}`);
    process.exit(1);
  }
}

import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  createHealthCheck,
} from '@ims/monitoring';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { optionalServiceAuth } from '@ims/service-auth';
import { attachPermissions } from '@ims/rbac';
import { prisma } from './prisma';

const logger = createLogger('api-environment');

import aspectsRouter from './routes/aspects';
import eventsRouter from './routes/events';
import legalRouter from './routes/legal';
import objectivesRouter from './routes/objectives';
import actionsRouter from './routes/actions';
import capaRouter from './routes/capa';
import auditsRouter from './routes/audits';
import managementReviewsRouter from './routes/management-reviews';
import emergencyRouter from './routes/emergency';
import lifecycleRouter from './routes/lifecycle';
import esgRouter from './routes/esg';
import communicationsRouter from './routes/communications';
import trainingRouter from './routes/training';

const app: Express = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-environment'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-environment', prisma as any, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Routes — gateway rewrites /api/environment/* → /api/*
app.use('/api/aspects', aspectsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/legal', legalRouter);
app.use('/api/objectives', objectivesRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/capa', capaRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/management-reviews', managementReviewsRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/lifecycle', lifecycleRouter);
app.use('/api/esg', esgRouter);
app.use('/api/communications', communicationsRouter);
app.use('/api/training', trainingRouter);

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// Error handling
app.use(
  (
    err: Error & { statusCode?: number; code?: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(err.statusCode || 500).json({
      success: false,
      error: { code: err.code || 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
);

const server = app.listen(PORT, () => {
  logger.info(`Environment API running on port ${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => {
    process.exit(1);
  }, 10000);
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
