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
import { prisma } from '@ims/database';

const logger = createLogger('api-environment');

import aspectsRouter from './routes/aspects';
import eventsRouter from './routes/events';
import legalRouter from './routes/legal';
import objectivesRouter from './routes/objectives';

const app: Express = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-environment'));
app.use(express.json());

// Health check and metrics
app.get('/health', createHealthCheck('api-environment', prisma, '1.0.0'));
app.get('/metrics', metricsHandler);

// Routes - all filtered by ISO_14001
app.use('/api/risks', aspectsRouter);  // Environmental aspects stored as risks
app.use('/api/incidents', eventsRouter);  // Environmental events stored as incidents
app.use('/api/legal', legalRouter);
app.use('/api/objectives', objectivesRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  logger.info(`Environment API running on port ${PORT}`);
});

export default app;
