import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

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

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-quality', timestamp: new Date().toISOString() });
});

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
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  console.log(`Quality API running on port ${PORT}`);
});

export default app;
