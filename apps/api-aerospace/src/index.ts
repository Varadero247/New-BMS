import { initSentry } from '@ims/sentry';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-aerospace');

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

const logger = createLogger('api-aerospace');

import configRouter from './routes/configuration';
import faiRouter from './routes/fai';
import workordersRouter from './routes/workorders';
import humanFactorsRouter from './routes/human-factors';
import oasisRouter from './routes/oasis';
import auditsRouter from './routes/audits';
import baselinesRouter from './routes/baselines';
import changesRouter from './routes/changes';
import complianceTrackerRouter from './routes/compliance-tracker';
import counterfeitRouter from './routes/counterfeit';
import fodRouter from './routes/fod';
import productSafetyRouter from './routes/product-safety';
import specialProcessesRouter from './routes/special-processes';

const app: Express = express();
const PORT = process.env.PORT || 4012;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-aerospace'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-aerospace', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Routes - AS9100D Aerospace Configuration Management
app.use('/api/configuration', configRouter);
// Routes - AS9102 First Article Inspection
app.use('/api/fai', faiRouter);
// Routes - MRO Work Orders (AS9110)
app.use('/api/workorders', workordersRouter);
// Routes - Human Factors (ICAO/Transport Canada)
app.use('/api/human-factors', humanFactorsRouter);
// Routes - OASIS Database Integration (S4-04)
app.use('/api/oasis', oasisRouter);
// Routes - AS9100D Audit Management
app.use('/api/audits', auditsRouter);
// Routes - Configuration Baselines
app.use('/api/baselines', baselinesRouter);
// Routes - Change Management
app.use('/api/changes', changesRouter);
// Routes - AS9100D Compliance Tracker
app.use('/api/compliance-tracker', complianceTrackerRouter);
// Routes - Counterfeit Parts Prevention (SAE AS6174)
app.use('/api/counterfeit', counterfeitRouter);
// Routes - Foreign Object Debris/Damage Prevention
app.use('/api/fod', fodRouter);
// Routes - Product Safety Management
app.use('/api/product-safety', productSafetyRouter);
// Routes - Special Processes (Nadcap)
app.use('/api/special-processes', specialProcessesRouter);

// 404 handler
app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// Error handling
app.use((err: Error & { statusCode?: number; code?: string }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: 'Internal server error' },
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Aerospace API running on port ${PORT}`);
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
