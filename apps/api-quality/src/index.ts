// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { initSentry, sentryErrorHandler } from '@ims/sentry';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-quality');
initTracing({ serviceName: 'api-quality' });

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
import calibrationsRouter from './routes/calibrations';
import competencesRouter from './routes/competences';
import raciRouter from './routes/raci';
import releasesRouter from './routes/releases';
import managementReviewsRouter from './routes/management-reviews';
import auditsRouter from './routes/audits';
import trainingRouter from './routes/training';
import metricsRouter from './routes/metrics';
import investigationsRouter from './routes/investigations';
import ciRouter from './routes/ci';
import riskRegisterRouter from './routes/risk-register';
import contextFactorsRouter from './routes/context-factors';
import scopeRouter from './routes/scope';
import policyRouter from './routes/policy';
import templateGeneratorRouter from './routes/template-generator';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';

const app: Express = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-quality'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-quality', prisma as unknown as Parameters<typeof createHealthCheck>[1], '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Routes — gateway rewrites /api/quality/* → /api/*
app.use('/api', writeRoleGuard('ADMIN', 'MANAGER'));
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
app.use('/api/calibrations', calibrationsRouter);
app.use('/api/competences', competencesRouter);
app.use('/api/raci', raciRouter);
app.use('/api/releases', releasesRouter);
app.use('/api/management-reviews', managementReviewsRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/training', trainingRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/investigations', investigationsRouter);
app.use('/api/ci', ciRouter);
app.use('/api/risk-register', riskRegisterRouter);
app.use('/api/context-factors', contextFactorsRouter);
app.use('/api/scope', scopeRouter);
app.use('/api/policy', policyRouter);
app.use('/api/template-generator', templateGeneratorRouter);

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.use(sentryErrorHandler());
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Quality API running on port ${PORT}`);
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
