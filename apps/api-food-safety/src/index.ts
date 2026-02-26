// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { initSentry, sentryErrorHandler } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-food-safety');
initTracing({ serviceName: 'api-food-safety' });

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
  createDownstreamRateLimiter,
  initTracing,
} from '@ims/monitoring';
import { attachPermissions } from '@ims/rbac';
import { optionalServiceAuth } from '@ims/service-auth';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { prisma } from './prisma';

const logger = createLogger('api-food-safety');

import hazardsRouter from './routes/hazards';
import ccpsRouter from './routes/ccps';
import monitoringRouter from './routes/monitoring';
import auditsRouter from './routes/audits';
import suppliersRouter from './routes/suppliers';
import recallsRouter from './routes/recalls';
import traceabilityRouter from './routes/traceability';
import sanitationRouter from './routes/sanitation';
import allergensRouter from './routes/allergens';
import productsRouter from './routes/products';
import ncrsRouter from './routes/ncrs';
import trainingRouter from './routes/training';
import environmentalMonitoringRouter from './routes/environmental-monitoring';
import foodDefenseRouter from './routes/food-defense';
import dashboardRouter from './routes/dashboard';
import haccpFlowRouter from './routes/haccp-flow';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';

const app: Express = express();
const PORT = process.env.PORT || 4019;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-food-safety'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-food-safety', prisma, '1.0.0'));
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
app.use('/api', writeRoleGuard('ADMIN', 'MANAGER'));
app.use('/api/hazards', hazardsRouter);
app.use('/api/ccps', ccpsRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/recalls', recallsRouter);
app.use('/api/traceability', traceabilityRouter);
app.use('/api/sanitation', sanitationRouter);
app.use('/api/allergens', allergensRouter);
app.use('/api/products', productsRouter);
app.use('/api/ncrs', ncrsRouter);
app.use('/api/training', trainingRouter);
app.use('/api/environmental-monitoring', environmentalMonitoringRouter);
app.use('/api/food-defense', foodDefenseRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/haccp-flow', haccpFlowRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.use(sentryErrorHandler());
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Food Safety API server running on port ${PORT}`);
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
