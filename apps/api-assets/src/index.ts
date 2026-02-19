import { initSentry, sentryErrorHandler } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-assets');
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
const logger = createLogger('api-assets');
import assetsRouter from './routes/assets';
import workOrdersRouter from './routes/work-orders';
import calibrationsRouter from './routes/calibrations';
import inspectionsRouter from './routes/inspections';
import dashboardRouter from './routes/dashboard';
import locationsRouter from './routes/locations';
import depreciationRouter from './routes/depreciation';
const app: Express = express();
const PORT = process.env.PORT || 4030;
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
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
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res
    .status(500)
    .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});
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
  logger.error('Unhandled rejection', { reason: String(reason) });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
  process.exit(1);
});
export default app;
