import { initSentry, sentryErrorHandler } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-contracts');
initTracing({ serviceName: 'api-contracts' });
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
const logger = createLogger('api-contracts');
import contractsRouter from './routes/contracts';
import approvalsRouter from './routes/approvals';
import noticesRouter from './routes/notices';
import clausesRouter from './routes/clauses';
import dashboardRouter from './routes/dashboard';
import renewalsRouter from './routes/renewals';
import extractionRouter from './routes/extraction';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';
const app: Express = express();
const PORT = process.env.PORT || 4033;
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-contracts'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());
app.get('/health', createHealthCheck('api-contracts', prisma, '1.0.0'));
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
app.use('/api/contracts', contractsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/clauses', clausesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/renewals', renewalsRouter);
app.use('/api/extraction', extractionRouter);
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});
app.use(sentryErrorHandler());
app.use(errorHandler);
const server = app.listen(PORT, () => {
  logger.info(`Contracts API server running on port ${PORT}`);
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
