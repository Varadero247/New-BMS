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

const logger = createLogger('api-quality');

// Route imports
import partiesRouter from './routes/parties';
import issuesRouter from './routes/issues';
import risksRouter from './routes/risks';
import opportunitiesRouter from './routes/opportunities';
import processesRouter from './routes/processes';
import nonconformancesRouter from './routes/nonconformances';
import actionsRouter from './routes/actions';
import documentsRouter from './routes/documents';
import capaRouter from './routes/capa';
import legalRouter from './routes/legal';
import fmeaRouter from './routes/fmea';
import improvementsRouter from './routes/improvements';
import suppliersRouter from './routes/suppliers';
import changesRouter from './routes/changes';
import objectivesRouter from './routes/objectives';

const app: Express = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-quality'));
app.use(express.json());

// Health check and metrics
app.get('/health', createHealthCheck('api-quality', prisma as any, '1.0.0'));
app.get('/metrics', metricsHandler);

// Routes — gateway rewrites /api/quality/* → /api/*
app.use('/api/parties', partiesRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/risks', risksRouter);
app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/processes', processesRouter);
app.use('/api/nonconformances', nonconformancesRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/capa', capaRouter);
app.use('/api/legal', legalRouter);
app.use('/api/fmea', fmeaRouter);
app.use('/api/improvements', improvementsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/changes', changesRouter);
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
  logger.info(`Quality API running on port ${PORT}`);
});

export default app;
