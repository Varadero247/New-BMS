import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Service URLs
const SERVICES = {
  healthSafety: process.env.HEALTH_SAFETY_URL || 'http://localhost:4001',
  environment: process.env.ENVIRONMENT_URL || 'http://localhost:4002',
  quality: process.env.QUALITY_URL || 'http://localhost:4003',
  aiAnalysis: process.env.AI_ANALYSIS_URL || 'http://localhost:4004',
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Local routes (handled by gateway)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Proxy routes to domain services
app.use('/api/health-safety', createProxyMiddleware({
  target: SERVICES.healthSafety,
  changeOrigin: true,
  pathRewrite: { '^/api/health-safety': '/api' },
  onError: (err, req, res) => {
    console.error('Health Safety Proxy Error:', err);
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Health & Safety service unavailable' },
    });
  },
}));

app.use('/api/environment', createProxyMiddleware({
  target: SERVICES.environment,
  changeOrigin: true,
  pathRewrite: { '^/api/environment': '/api' },
  onError: (err, req, res) => {
    console.error('Environment Proxy Error:', err);
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Environment service unavailable' },
    });
  },
}));

app.use('/api/quality', createProxyMiddleware({
  target: SERVICES.quality,
  changeOrigin: true,
  pathRewrite: { '^/api/quality': '/api' },
  onError: (err, req, res) => {
    console.error('Quality Proxy Error:', err);
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Quality service unavailable' },
    });
  },
}));

app.use('/api/ai', createProxyMiddleware({
  target: SERVICES.aiAnalysis,
  changeOrigin: true,
  pathRewrite: { '^/api/ai': '/api' },
  onError: (err, req, res) => {
    console.error('AI Analysis Proxy Error:', err);
    (res as express.Response).status(502).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'AI Analysis service unavailable' },
    });
  },
}));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Health & Safety service: ${SERVICES.healthSafety}`);
  console.log(`Environment service: ${SERVICES.environment}`);
  console.log(`Quality service: ${SERVICES.quality}`);
  console.log(`AI Analysis service: ${SERVICES.aiAnalysis}`);
});

export default app;
