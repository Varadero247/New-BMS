import { initSentry } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-esg');

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

const logger = createLogger('api-esg');

import emissionsRouter from './routes/emissions';
import targetsRouter from './routes/targets';
import initiativesRouter from './routes/initiatives';
import socialRouter from './routes/social';
import governanceRouter from './routes/governance';
import reportsRouter from './routes/reports';
import frameworksRouter from './routes/frameworks';
import metricsRouter from './routes/metrics';
import wasteRouter from './routes/waste';
import waterRouter from './routes/water';
import energyRouter from './routes/energy';
import auditsRouter from './routes/audits';
import stakeholdersRouter from './routes/stakeholders';
import materialityRouter from './routes/materiality';
import defraFactorsRouter from './routes/defra-factors';
import scopeEmissionsRouter from './routes/scope-emissions';
import esgReportsRouter from './routes/esg-reports';

const app: Express = express();
const PORT = process.env.PORT || 4016;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-esg'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-esg', prisma, '1.0.0'));
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
app.use('/api/emissions', emissionsRouter);
app.use('/api/targets', targetsRouter);
app.use('/api/initiatives', initiativesRouter);
app.use('/api/social', socialRouter);
app.use('/api/governance', governanceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/frameworks', frameworksRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/waste', wasteRouter);
app.use('/api/water', waterRouter);
app.use('/api/energy', energyRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/stakeholders', stakeholdersRouter);
app.use('/api/defra-factors', defraFactorsRouter);
app.use('/api/scope-emissions', scopeEmissionsRouter);
app.use('/api/esg-reports', esgReportsRouter);
app.use('/api/materiality', materialityRouter);

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
  logger.info(`ESG API server running on port ${PORT}`);
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
