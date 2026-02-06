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

const logger = createLogger('api-quality');

// Existing routes
import processesRouter from './routes/processes';
import nonconformancesRouter from './routes/nonconformances';
import metricsRouter from './routes/metrics';

// Enhanced QMS routes
import documentsRouter from './routes/documents';
import investigationsRouter from './routes/investigations';
import capasRouter from './routes/capas';
import auditsRouter from './routes/audits';
import risksRouter from './routes/risks';
import fmeaRouter from './routes/fmea';
import continuousImprovementRouter from './routes/continuous-improvement';
import trainingRouter from './routes/training';
import supplierQualityRouter from './routes/supplier-quality';
import changeManagementRouter from './routes/change-management';

const app: Express = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-quality'));
app.use(express.json());

// Health check and metrics
app.get('/health', createHealthCheck('api-quality', prisma, '1.0.0'));
app.get('/metrics', metricsHandler);

// Existing Routes - all filtered by ISO_9001
app.use('/api/processes', processesRouter);  // Process risks stored as risks
app.use('/api/nonconformances', nonconformancesRouter);  // Non-conformances stored as incidents
app.use('/api/metrics/quality', metricsRouter);

// Enhanced QMS Routes
app.use('/api/documents', documentsRouter);
app.use('/api/investigations', investigationsRouter);
app.use('/api/capas', capasRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/qms-risks', risksRouter);  // Enterprise risk management (separate from process risks)
app.use('/api/fmea', fmeaRouter);
app.use('/api/ci', continuousImprovementRouter);  // Continuous Improvement (projects, kaizen, ideas, 5S, standard work)
app.use('/api/training', trainingRouter);
app.use('/api/suppliers', supplierQualityRouter);
app.use('/api/change-requests', changeManagementRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  logger.info(`Quality API running on port ${PORT}`);
});

export default app;
