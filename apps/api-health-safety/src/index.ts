import { initSentry, sentryErrorHandler } from '@ims/sentry';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-health-safety');
initTracing({ serviceName: 'api-health-safety' });

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
  createDownstreamRateLimiter,
  initTracing,
} from '@ims/monitoring';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { optionalServiceAuth } from '@ims/service-auth';
import { attachPermissions } from '@ims/rbac';
import { prisma } from './prisma';

const logger = createLogger('api-health-safety');

import risksRouter from './routes/risks';
import incidentsRouter from './routes/incidents';
import metricsRouter from './routes/metrics';
import trainingRouter from './routes/training';
import legalRouter from './routes/legal';
import objectivesRouter from './routes/objectives';
import capaRouter from './routes/capa';
import managementReviewsRouter from './routes/management-reviews';
import communicationsRouter from './routes/communications';
import actionsRouter from './routes/actions';
import managementOfChangeRouter from './routes/management-of-change';
import contractorManagementRouter from './routes/contractor-management';
import workerConsultationRouter from './routes/worker-consultation';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';

const app: Express = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-health-safety'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

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
app.use('/api', writeRoleGuard('ADMIN', 'MANAGER'));
app.use('/api/risks', risksRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/metrics/safety', metricsRouter);
app.use('/api/metrics', metricsRouter); // alias — web app calls /metrics
app.use('/api/training', trainingRouter);
app.use('/api/legal', legalRouter);
app.use('/api/objectives', objectivesRouter);
app.use('/api/capa', capaRouter);
app.use('/api/management-reviews', managementReviewsRouter);
app.use('/api/communications', communicationsRouter);
app.use('/api/actions', actionsRouter);

// ISO 45001:2018 Clause 8.1.3 — Management of Change
app.use('/api/management-of-change', managementOfChangeRouter);
// ISO 45001:2018 Clause 8.4 — Contractor OHS Management
app.use('/api/contractors', contractorManagementRouter);
// ISO 45001:2018 Clause 5.4 — Worker Participation and Consultation
app.use('/api/worker-consultation', workerConsultationRouter);

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.use(sentryErrorHandler());
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Health & Safety API running on port ${PORT}`);
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
  logger.error('Unhandled rejection', { reason: String(reason), stack: reason instanceof Error ? reason.stack : undefined });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

export default app;
