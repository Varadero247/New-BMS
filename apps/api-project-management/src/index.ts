import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  createHealthCheck,
} from '@ims/monitoring';
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

const app: Express = express();
const PORT = process.env.PORT || 4009;

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-project-management'));
app.use(express.json());

// Health check and metrics
app.get('/health', createHealthCheck('api-project-management', prisma as any, '1.0.0'));
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

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  logger.info(`Project Management API running on port ${PORT}`);
});

export default app;
