import { initSentry } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-partners');

const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing required env var: ${envVar}`);
    process.exit(1);
  }
}

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
import { optionalServiceAuth } from '@ims/service-auth';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { prisma } from './prisma';
import { authenticatePartner } from './middleware/partner-auth';

const logger = createLogger('api-partners');

import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import dealsRouter from './routes/deals';
import payoutsRouter from './routes/payouts';
import referralsRouter from './routes/referrals';
import commissionRouter from './routes/commission';
import supportRouter from './routes/support';
import collateralRouter from './routes/collateral';

const app: Express = express();
const PORT = process.env.PORT || 4026;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-partners'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());

// Health check
app.get('/health', createHealthCheck('api-partners', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/profile', authenticatePartner, profileRouter);
app.use('/api/deals', authenticatePartner, dealsRouter);
app.use('/api/payouts', authenticatePartner, payoutsRouter);
app.use('/api/referrals', authenticatePartner, referralsRouter);
app.use('/api/commission', authenticatePartner, commissionRouter);
app.use('/api/support', authenticatePartner, supportRouter);
app.use('/api/collateral', authenticatePartner, collateralRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Partners API server running on port ${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => {
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
  process.exit(1);
});

export default app;
