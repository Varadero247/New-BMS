// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { initSentry, sentryErrorHandler } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-ptw');
initTracing({ serviceName: 'api-ptw' });
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
const logger = createLogger('api-ptw');
import permitsRouter from './routes/permits';
import methodStatementsRouter from './routes/method-statements';
import toolboxTalksRouter from './routes/toolbox-talks';
import dashboardRouter from './routes/dashboard';
import conflictsRouter from './routes/conflicts';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';
const app: Express = express();
const PORT = process.env.PORT || 4034;
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-ptw'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());
app.get('/health', createHealthCheck('api-ptw', prisma, '1.0.0'));
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
app.use('/api/permits', permitsRouter);
app.use('/api/method-statements', methodStatementsRouter);
app.use('/api/toolbox-talks', toolboxTalksRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/conflicts', conflictsRouter);
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});
app.use(sentryErrorHandler());
app.use(errorHandler);
const server = app.listen(PORT, () => {
  logger.info(`Permit to Work API running on port ${PORT}`);
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
