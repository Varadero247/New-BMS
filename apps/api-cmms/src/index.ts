import { initSentry } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-cmms');

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
import { optionalServiceAuth } from '@ims/service-auth';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { prisma } from './prisma';

const logger = createLogger('api-cmms');

import assetsRouter from './routes/assets';
import workOrdersRouter from './routes/work-orders';
import preventivePlansRouter from './routes/preventive-plans';
import partsRouter from './routes/parts';
import inspectionsRouter from './routes/inspections';
import metersRouter from './routes/meters';
import downtimeRouter from './routes/downtime';
import vendorsRouter from './routes/vendors';
import locationsRouter from './routes/locations';
import requestsRouter from './routes/requests';
import checklistsRouter from './routes/checklists';
import kpisRouter from './routes/kpis';
import schedulerRouter from './routes/scheduler';

const app: Express = express();
const PORT = process.env.PORT || 4017;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-cmms'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-cmms', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// API Routes
app.use('/api/assets', assetsRouter);
app.use('/api/work-orders', workOrdersRouter);
app.use('/api/preventive-plans', preventivePlansRouter);
app.use('/api/parts', partsRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/meters', metersRouter);
app.use('/api/downtime', downtimeRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/checklists', checklistsRouter);
app.use('/api/kpis', kpisRouter);
app.use('/api/contracts', vendorsRouter);
app.use('/api/scheduler', schedulerRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
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
  logger.info(`CMMS API server running on port ${PORT}`);
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
