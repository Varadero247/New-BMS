import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

// Validate required configuration
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Required environment variable ${envVar} is not set`);
    process.exit(1);
  }
}

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

const logger = createLogger('api-project-management');

import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import milestonesRouter from './routes/milestones';
import risksRouter from './routes/risks';
import issuesRouter from './routes/issues';
import changesRouter from './routes/changes';
import resourcesRouter from './routes/resources';
import stakeholdersRouter from './routes/stakeholders';
import documentsRouter from './routes/documents';
import sprintsRouter from './routes/sprints';
import timesheetsRouter from './routes/timesheets';
import reportsRouter from './routes/reports';
import benefitsRouter from './routes/benefits';

const app: Express = express();
const PORT = process.env.PORT || 4009;

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-project-management'));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-project-management', prisma as any, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await (prisma as any).$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Routes — gateway rewrites /api/project-management/* → /api/*
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/milestones', milestonesRouter);
app.use('/api/risks', risksRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/changes', changesRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/stakeholders', stakeholdersRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/sprints', sprintsRouter);
app.use('/api/timesheets', timesheetsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/benefits', benefitsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: 'Internal server error' },
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Project Management API running on port ${PORT}`);
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
