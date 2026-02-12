import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

// Validate required configuration
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Required environment variable ${envVar} is not set`);
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
import { prisma } from './prisma';

const logger = createLogger('api-quality');

// Route imports
import partiesRouter from './routes/parties';
import issuesRouter from './routes/issues';
import risksRouter from './routes/risks';
import opportunitiesRouter from './routes/opportunities';
import processesRouter from './routes/processes';
import nonconformancesRouter from './routes/nonconformances';
import actionsRouter from './routes/actions';
import documentsRouter from './routes/documents';
import capaRouter from './routes/capa';
import legalRouter from './routes/legal';
import fmeaRouter from './routes/fmea';
import improvementsRouter from './routes/improvements';
import suppliersRouter from './routes/suppliers';
import changesRouter from './routes/changes';
import objectivesRouter from './routes/objectives';

const app: Express = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-quality'));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-quality', prisma as any, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await (prisma as any).$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Routes — gateway rewrites /api/quality/* → /api/*
app.use('/api/parties', partiesRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/risks', risksRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/processes', processesRouter);
app.use('/api/nonconformances', nonconformancesRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/capa', capaRouter);
app.use('/api/legal', legalRouter);
app.use('/api/fmea', fmeaRouter);
app.use('/api/improvements', improvementsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/changes', changesRouter);
app.use('/api/objectives', objectivesRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'An error occurred') },
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Quality API running on port ${PORT}`);
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
