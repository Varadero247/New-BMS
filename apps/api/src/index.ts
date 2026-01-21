import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';

// Auth routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';

// IMS Core routes
import risksRoutes from './routes/risks';
import incidentsRoutes from './routes/incidents';
import actionsRoutes from './routes/actions';
import legalRoutes from './routes/legal';
import objectivesRoutes from './routes/objectives';
import trainingRoutes from './routes/training';

// Analytics routes
import analyticsRoutes from './routes/analytics';
import aiRoutes from './routes/ai';
import metricsRoutes from './routes/metrics';

// Dashboard
import dashboardRoutes from './routes/ims-dashboard';

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit for IMS operations
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'IMS API',
    version: '2.0.0'
  });
});

// API routes - Authentication
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// API routes - IMS Core
app.use('/api/risks', risksRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/legal-requirements', legalRoutes);
app.use('/api/objectives', objectivesRoutes);
app.use('/api/training', trainingRoutes);

// API routes - Analytics & AI
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/metrics', metricsRoutes);

// API routes - Dashboard
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 IMS API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 ISO Standards: 45001 (H&S), 14001 (Environmental), 9001 (Quality)`);
});

export default app;
