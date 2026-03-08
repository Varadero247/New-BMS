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
initSentry('api-regional');
initTracing({ serviceName: 'api-regional' });

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
import { errorHandler } from '@ims/shared';
import { prisma } from './prisma';

const logger = createLogger('api-regional');

import countriesRouter from './routes/countries';
import regionsRouter from './routes/regions';
import legislationRouter from './routes/legislation';
import financialRulesRouter from './routes/financial-rules';
import tradeAgreementsRouter from './routes/trade-agreements';
import isoMappingsRouter from './routes/iso-mappings';
import onboardingRouter from './routes/onboarding';
import taxSummaryRouter from './routes/tax-summary';
import regionConfigRouter from './routes/region-config';

const app: Express = express();
const PORT = process.env.PORT || 4042;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-regional'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-regional', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Routes
app.use('/api/countries', countriesRouter);
app.use('/api/regions', regionsRouter);
app.use('/api/legislation', legislationRouter);
app.use('/api/financial-rules', financialRulesRouter);
app.use('/api/trade-agreements', tradeAgreementsRouter);
app.use('/api/iso-mappings', isoMappingsRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/tax-summary', taxSummaryRouter);
app.use('/api/region-config', regionConfigRouter);

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

app.use(sentryErrorHandler());
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Regional API running on port ${PORT}`);
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
  logger.error('Unhandled rejection', {
    reason: String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

export default app;
