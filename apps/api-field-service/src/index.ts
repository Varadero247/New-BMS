import { initSentry } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-field-service');

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

const logger = createLogger('api-field-service');

import techniciansRouter from './routes/technicians';
import customersRouter from './routes/customers';
import sitesRouter from './routes/sites';
import contractsRouter from './routes/contracts';
import jobsRouter from './routes/jobs';
import timeEntriesRouter from './routes/time-entries';
import partsUsedRouter from './routes/parts-used';
import jobNotesRouter from './routes/job-notes';
import routesRouter from './routes/routes';
import invoicesRouter from './routes/invoices';
import checklistsRouter from './routes/checklists';
import schedulesRouter from './routes/schedules';
import kpisRouter from './routes/kpis';

const app: Express = express();
const PORT = process.env.PORT || 4022;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-field-service'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-field-service', prisma, '1.0.0'));
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
app.use('/api/technicians', techniciansRouter);
app.use('/api/customers', customersRouter);
app.use('/api/sites', sitesRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/time-entries', timeEntriesRouter);
app.use('/api/parts-used', partsUsedRouter);
app.use('/api/job-notes', jobNotesRouter);
app.use('/api/routes', routesRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/checklists', checklistsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/kpis', kpisRouter);

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
  logger.info(`Field Service API server running on port ${PORT}`);
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
