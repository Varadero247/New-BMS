import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Required environment variable ${envVar} is not set`);
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

const app: Express = express();
const PORT = process.env.PORT || 4019;

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-food-safety'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
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
  logger.info(`Food Safety API server running on port ${PORT}`);
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
