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

const logger = createLogger('api-ai-analysis');

import analyseRouter from './routes/analyse';
import analysesRouter from './routes/analyses';
import settingsRouter from './routes/settings';

const app: Express = express();
const PORT = process.env.PORT || 4004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-ai-analysis'));
app.use(express.json());

// Health check and metrics
app.get('/health', createHealthCheck('api-ai-analysis', prisma, '1.0.0'));
app.get('/metrics', metricsHandler);

// Routes
app.use('/api/analyse', analyseRouter);
app.use('/api/analyses', analysesRouter);
app.use('/api/settings', settingsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  logger.info(`AI Analysis API running on port ${PORT}`);
});

export default app;
