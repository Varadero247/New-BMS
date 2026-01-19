import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import authRoutes from './routes/auth';
import buildingsRoutes from './routes/buildings';
import devicesRoutes from './routes/devices';
import alertsRoutes from './routes/alerts';
import energyRoutes from './routes/energy';
import dashboardRoutes from './routes/dashboard';

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
  max: 100, // Limit each IP to 100 requests per windowMs
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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
