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
import { optionalServiceAuth } from '@ims/service-auth';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { prisma } from './prisma';

const logger = createLogger('api-analytics');

import dashboardsRouter from './routes/dashboards';
import reportsRouter from './routes/reports';
import datasetsRouter from './routes/datasets';
import kpisRouter from './routes/kpis';
import alertsRouter from './routes/alerts';
import exportsRouter from './routes/exports';
import queriesRouter from './routes/queries';
import schedulesRouter from './routes/schedules';
import benchmarksRouter from './routes/benchmarks';
import executiveRouter from './routes/executive';
import unifiedRisksRouter from './routes/unified-risks';
import predictionsRouter from './routes/predictions';
import anomaliesRouter from './routes/anomalies';
import nlqRouter from './routes/nlq';
import monthlyReviewRouter from './routes/monthly-review';
// Session A — Finance
import stripeDunningRouter from './routes/webhooks/stripe-dunning';
import cashflowRouter from './routes/cashflow';
// Session B — Support & Product
import intercomWebhookRouter from './routes/webhooks/intercom';
import sentryWebhookRouter from './routes/webhooks/sentry';
import githubWebhookRouter from './routes/webhooks/github';
import featureRequestsRouter from './routes/feature-requests';
import releaseNotesRouter from './routes/release-notes';
import uptimeRouter from './routes/uptime';
// Session C — Compliance
import contractsRouter from './routes/contracts';
import gdprRouter from './routes/gdpr';
import dsarsRouter from './routes/dsars';
import certificationsRouter from './routes/certifications';
// Session D — Business Intelligence
import competitorsRouter from './routes/competitors';
import boardPacksRouter from './routes/board-packs';
import meetingsRouter from './routes/meetings';
import expensesRouter from './routes/expenses';
import { startScheduler } from './scheduler';

const app: Express = express();
const PORT = process.env.PORT || 4021;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-analytics'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-analytics', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// API Routes — named routes before parameterised routes
app.use('/api/executive-summary', executiveRouter);
app.use('/api/unified-risks', unifiedRisksRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/anomalies', anomaliesRouter);
app.use('/api/nlq', nlqRouter);
app.use('/api/dashboards', dashboardsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/datasets', datasetsRouter);
app.use('/api/kpis', kpisRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/exports', exportsRouter);
app.use('/api/queries', queriesRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/benchmarks', benchmarksRouter);
app.use('/api/monthly-review', monthlyReviewRouter);
// Session A — Finance
app.use('/api/webhooks/stripe-dunning', stripeDunningRouter);
app.use('/api/cashflow', cashflowRouter);
// Session B — Support & Product
app.use('/api/webhooks/intercom', intercomWebhookRouter);
app.use('/api/webhooks/sentry', sentryWebhookRouter);
app.use('/api/webhooks/github', githubWebhookRouter);
app.use('/api/feature-requests', featureRequestsRouter);
app.use('/api/release-notes', releaseNotesRouter);
app.use('/api/uptime', uptimeRouter);
// Session C — Compliance
app.use('/api/contracts', contractsRouter);
app.use('/api/gdpr', gdprRouter);
app.use('/api/dsars', dsarsRouter);
app.use('/api/certifications', certificationsRouter);
// Session D — Business Intelligence
app.use('/api/competitors', competitorsRouter);
app.use('/api/board-packs', boardPacksRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/expenses', expensesRouter);

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
  logger.info(`Analytics API server running on port ${PORT}`);
  startScheduler();
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
