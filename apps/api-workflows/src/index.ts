import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import templatesRouter from './routes/templates';
import definitionsRouter from './routes/definitions';
import instancesRouter from './routes/instances';
import tasksRouter from './routes/tasks';
import approvalsRouter from './routes/approvals';
import automationRouter from './routes/automation';

const app: Express = express();
const PORT = process.env.PORT || 4008;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'api-workflows', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/templates', templatesRouter);
app.use('/api/definitions', definitionsRouter);
app.use('/api/instances', instancesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/automation', automationRouter);

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.listen(PORT, () => {
  console.log(`Workflows API running on port ${PORT}`);
});

export default app;
