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
import { prisma } from '@ims/database';

const logger = createLogger('api-workflows');

import templatesRouter from './routes/templates';
import definitionsRouter from './routes/definitions';
import instancesRouter from './routes/instances';
import tasksRouter from './routes/tasks';
import approvalsRouter from './routes/approvals';
import automationRouter from './routes/automation';

const app: Express = express();
const PORT = process.env.PORT || 4008;

// Middleware
app.use(helmet());
app.use(cors());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-workflows'));
app.use(express.json());

// Health check and metrics
app.get('/health', createHealthCheck('api-workflows', prisma, '1.0.0'));
app.get('/metrics', metricsHandler);

// API Routes
app.use('/api/templates', templatesRouter);
app.use('/api/definitions', definitionsRouter);
app.use('/api/instances', instancesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/automation', automationRouter);

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.listen(PORT, () => {
  logger.info(`Workflows API running on port ${PORT}`);
});

export default app;
