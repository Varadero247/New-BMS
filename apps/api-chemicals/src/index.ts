import { initSentry, sentryErrorHandler } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-chemicals');
initTracing({ serviceName: 'api-chemicals' });

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

const logger = createLogger('api-chemicals');

import chemicalsRouter from './routes/chemicals';
import sdsRouter from './routes/sds';
import coshhRouter from './routes/coshh';
import inventoryRouter from './routes/inventory';
import monitoringRouter from './routes/monitoring';
import incidentsRouter from './routes/incidents';
import disposalRouter from './routes/disposal';
import analyticsRouter from './routes/analytics';
import healthSurveillanceRouter from './routes/health-surveillance';
import biologicalMonitoringRouter from './routes/biological-monitoring';
import fumigationRouter from './routes/fumigation';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';

const app: Express = express();
const PORT = process.env.PORT || 4040;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-chemicals'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-chemicals', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// API Routes — named routes BEFORE /:id patterns
app.use('/api', writeRoleGuard('ADMIN', 'MANAGER'));
app.use('/api/register', chemicalsRouter);
app.use('/api/chemicals', chemicalsRouter);
app.use('/api/sds', sdsRouter);
app.use('/api/coshh', coshhRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/disposal', disposalRouter);
app.use('/api/analytics', analyticsRouter);

// COSHH 2002 Extended Routes
app.use('/api/health-surveillance', healthSurveillanceRouter);       // Reg 11
app.use('/api/biological-monitoring', biologicalMonitoringRouter);   // Reg 14
app.use('/api/fumigation', fumigationRouter);                        // Reg 18

// 404 handler
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.use(sentryErrorHandler());
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Chemical Management API server running on port ${PORT}`);
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
