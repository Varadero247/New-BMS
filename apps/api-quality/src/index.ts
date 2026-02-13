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
    createLogger('startup').error(`FATAL: Missing required env var: ${envVar}`);
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
import { attachPermissions, requirePermission, PermissionLevel } from '@ims/rbac';
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
import customerSatisfactionRouter from './routes/customer-satisfaction';
import counterfeitRouter from './routes/counterfeit';
import productSafetyRouter from './routes/product-safety';
import designDevelopmentRouter from './routes/design-development';
import evidencePackRouter from './routes/evidence-pack';
import headstartRouter from './routes/headstart';

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
app.use(optionalServiceAuth);
app.use(attachPermissions());

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
app.use('/api/customer-satisfaction', customerSatisfactionRouter);
app.use('/api/counterfeit', counterfeitRouter);
app.use('/api/product-safety', productSafetyRouter);
app.use('/api/design-development', designDevelopmentRouter);
app.use('/api/evidence-pack', evidencePackRouter);
app.use('/api/headstart', headstartRouter);

// Error handling
app.use((err: Error & { statusCode?: number; code?: string }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: 'Internal server error' },
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
