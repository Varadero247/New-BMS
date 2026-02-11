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
if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
  console.warn('[SECURITY WARNING] Using placeholder JWT_SECRET. Change in production!');
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

const logger = createLogger('api-health-safety');

import risksRouter from './routes/risks';
import incidentsRouter from './routes/incidents';
import metricsRouter from './routes/metrics';
import trainingRouter from './routes/training';
import legalRouter from './routes/legal';
import objectivesRouter from './routes/objectives';
import capaRouter from './routes/capa';

const app: Express = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-health-safety'));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-health-safety', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Routes - all filtered by ISO_45001
app.use('/api/risks', risksRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/metrics/safety', metricsRouter);
app.use('/api/training', trainingRouter);
app.use('/api/legal', legalRouter);
app.use('/api/objectives', objectivesRouter);
app.use('/api/capa', capaRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'An error occurred') },
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Health & Safety API running on port ${PORT}`);
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
