// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { initSentry, sentryErrorHandler } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-assets');
initTracing({ serviceName: 'api-assets' });
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
const logger = createLogger('api-assets');
import assetsRouter from './routes/assets';
import workOrdersRouter from './routes/work-orders';
import calibrationsRouter from './routes/calibrations';
import inspectionsRouter from './routes/inspections';
import dashboardRouter from './routes/dashboard';
import locationsRouter from './routes/locations';
import depreciationRouter from './routes/depreciation';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';
const app: Express = express();
const PORT = process.env.PORT || 4030;
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-assets'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());
app.get('/health', createHealthCheck('api-assets', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);
app.use('/api', writeRoleGuard('ADMIN', 'MANAGER'));
app.use('/api/assets', assetsRouter);
app.use('/api/work-orders', workOrdersRouter);
app.use('/api/calibrations', calibrationsRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/depreciation', depreciationRouter);
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});
app.use(sentryErrorHandler());
app.use(errorHandler);
const server = app.listen(PORT, () => {
  logger.info(`Assets API server running on port ${PORT}`);
});
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received`);
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
