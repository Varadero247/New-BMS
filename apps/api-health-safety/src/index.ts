import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import risksRouter from './routes/risks';
import incidentsRouter from './routes/incidents';
import metricsRouter from './routes/metrics';
import trainingRouter from './routes/training';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-health-safety', timestamp: new Date().toISOString() });
});

// Routes - all filtered by ISO_45001
app.use('/api/risks', risksRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/metrics/safety', metricsRouter);
app.use('/api/training', trainingRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  console.log(`Health & Safety API running on port ${PORT}`);
});

export default app;
