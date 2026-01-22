import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import aspectsRouter from './routes/aspects';
import eventsRouter from './routes/events';
import legalRouter from './routes/legal';
import objectivesRouter from './routes/objectives';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-environment', timestamp: new Date().toISOString() });
});

// Routes - all filtered by ISO_14001
app.use('/api/risks', aspectsRouter);  // Environmental aspects stored as risks
app.use('/api/incidents', eventsRouter);  // Environmental events stored as incidents
app.use('/api/legal', legalRouter);
app.use('/api/objectives', objectivesRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  console.log(`Environment API running on port ${PORT}`);
});

export default app;
