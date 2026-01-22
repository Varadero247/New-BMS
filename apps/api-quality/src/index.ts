import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import processesRouter from './routes/processes';
import nonconformancesRouter from './routes/nonconformances';
import metricsRouter from './routes/metrics';

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

// Routes - all filtered by ISO_9001
app.use('/api/risks', processesRouter);  // Process risks stored as risks
app.use('/api/incidents', nonconformancesRouter);  // Non-conformances stored as incidents
app.use('/api/metrics/quality', metricsRouter);

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
