import dotenv from 'dotenv';
dotenv.config();

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

const logger = createLogger('api-payroll');

// Import routes
import payrollRouter from './routes/payroll';
import salaryRouter from './routes/salary';
import benefitsRouter from './routes/benefits';
import expensesRouter from './routes/expenses';
import loansRouter from './routes/loans';
import taxRouter from './routes/tax';

const app: Express = express();
const PORT = process.env.PORT || 4007;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3007',
    'http://localhost:4000',
  ],
  credentials: true,
}));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-payroll'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check and metrics
app.get('/health', createHealthCheck('api-payroll', prisma, '1.0.0'));
app.get('/metrics', metricsHandler);

// API Routes
app.use('/api/payroll', payrollRouter);
app.use('/api/salary', salaryRouter);
app.use('/api/benefits', benefitsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/loans', loansRouter);
app.use('/api/tax', taxRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    },
  });
});

app.listen(PORT, () => {
  logger.info(`Payroll API server running on port ${PORT}`);
});

export default app;
