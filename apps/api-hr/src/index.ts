import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import employeesRouter from './routes/employees';
import departmentsRouter from './routes/departments';
import attendanceRouter from './routes/attendance';
import leaveRouter from './routes/leave';
import performanceRouter from './routes/performance';
import recruitmentRouter from './routes/recruitment';
import trainingRouter from './routes/training';
import documentsRouter from './routes/documents';

const app: Express = express();
const PORT = process.env.PORT || 4006;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3006',
    'http://localhost:4000',
  ],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'api-hr', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/employees', employeesRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/recruitment', recruitmentRouter);
app.use('/api/training', trainingRouter);
app.use('/api/documents', documentsRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    },
  });
});

app.listen(PORT, () => {
  console.log(`HR API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
