import dotenv from 'dotenv';
dotenv.config();

// Validate required configuration
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
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { optionalServiceAuth } from '@ims/service-auth';
import { attachPermissions, requirePermission, PermissionLevel } from '@ims/rbac';
import { prisma } from './prisma';

const logger = createLogger('api-hr');

// Import routes
import employeesRouter from './routes/employees';
import departmentsRouter from './routes/departments';
import attendanceRouter from './routes/attendance';
import leaveRouter from './routes/leave';
import performanceRouter from './routes/performance';
import recruitmentRouter from './routes/recruitment';
import trainingRouter from './routes/training';
import documentsRouter from './routes/documents';
import certificationsRouter from './routes/certifications';
import goalsRouter from './routes/goals';
import orgChartRouter from './routes/org-chart';

const app: Express = express();
const PORT = process.env.PORT || 4006;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-hr'));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(express.urlencoded({ extended: true }));
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-hr', prisma, '1.0.0'));
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
app.use('/api/employees', employeesRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/recruitment', recruitmentRouter);
app.use('/api/training', trainingRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/certifications', certificationsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/org-chart', orgChartRouter);

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
  logger.info(`HR API server running on port ${PORT}`);
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
