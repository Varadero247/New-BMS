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

const logger = createLogger('api-health-safety');

import risksRouter from './routes/risks';
import incidentsRouter from './routes/incidents';
import metricsRouter from './routes/metrics';
import trainingRouter from './routes/training';

const app: Express = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-health-safety'));
app.use(express.json());

// Health check and metrics
app.get('/health', createHealthCheck('api-health-safety', prisma, '1.0.0'));
app.get('/metrics', metricsHandler);

// Routes - all filtered by ISO_45001
app.use('/api/risks', risksRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/metrics/safety', metricsRouter);
app.use('/api/training', trainingRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  logger.info(`Health & Safety API running on port ${PORT}`);
});

export default app;
