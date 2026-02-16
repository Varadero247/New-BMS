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
import { createLogger, metricsMiddleware, metricsHandler, correlationIdMiddleware, createHealthCheck } from '@ims/monitoring';
import { attachPermissions } from '@ims/rbac';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { prisma } from './prisma';

const logger = createLogger('api-risk');

import risksRouter from './routes/risks';
import reviewsRouter from './routes/reviews';
import capaRouter from './routes/capa';
import dashboardRouter from './routes/dashboard';
import heatMapRouter from './routes/heat-map';
import categoriesRouter from './routes/categories';
import treatmentsRouter from './routes/treatments';
import controlsRouter from './routes/controls';
import kriRouter from './routes/kri';
import actionsRouter from './routes/actions';
import bowtieRouter from './routes/bowtie';
import appetiteRouter from './routes/appetite';
import analyticsRouter from './routes/analytics';

const app: Express = express();
const PORT = process.env.PORT || 4027;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-risk'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-risk', prisma, '2.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// API Routes — named routes before parameterized
// Appetite & framework (must be before /api/risks to avoid /:id capture)
app.use('/api/risks', appetiteRouter);
// Analytics
app.use('/api/risks', analyticsRouter);
// KRI aggregate routes (breaches, due) — before /:id routes
app.use('/api/risks', kriRouter);
// Actions aggregate routes (overdue, due-soon) — before /:id routes
app.use('/api/risks', actionsRouter);
// Bowtie aggregate route
app.use('/api/risks', bowtieRouter);
// Main risk routes (register, heatmap, overdue-review, exceeds-appetite, by-category, aggregate, from-*, CRUD)
app.use('/api/risks', risksRouter);
// Controls (nested under /api/risks/:id/controls)
app.use('/api/risks', controlsRouter);

// Other top-level routes
app.use('/api/reviews', reviewsRouter);
app.use('/api/capa', capaRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/heat-map', heatMapRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/treatments', treatmentsRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

const server = app.listen(PORT, () => {
  logger.info(`Enterprise Risk Management API (ISO 31000:2018) running on port ${PORT}`);
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
