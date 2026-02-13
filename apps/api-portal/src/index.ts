import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Required environment variable ${envVar} is not set`);
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
import { attachPermissions } from '@ims/rbac';
import { prisma } from './prisma';

const logger = createLogger('api-portal');

import customerComplaintsRouter from './routes/customer-complaints';
import customerInvoicesRouter from './routes/customer-invoices';
import customerDocumentsRouter from './routes/customer-documents';
import customerNpsRouter from './routes/customer-nps';
import supplierRegisterRouter from './routes/supplier-register';
import supplierDocumentsRouter from './routes/supplier-documents';
import supplierNcrsRouter from './routes/supplier-ncrs';
import supplierOrdersRouter from './routes/supplier-orders';
import portalUsersRouter from './routes/portal-users';
import portalTicketsRouter from './routes/portal-tickets';
import portalOrdersRouter from './routes/portal-orders';
import portalNotificationsRouter from './routes/portal-notifications';
import portalAnnouncementsRouter from './routes/portal-announcements';
import portalApprovalsRouter from './routes/portal-approvals';
import portalQualityRouter from './routes/portal-quality';
import portalScorecardsRouter from './routes/portal-scorecards';

const app: Express = express();
const PORT = process.env.PORT || 4018;

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-portal'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-portal', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Customer Portal Routes
app.use('/api/customer/complaints', customerComplaintsRouter);
app.use('/api/customer/invoices', customerInvoicesRouter);
app.use('/api/customer/documents', customerDocumentsRouter);
app.use('/api/customer/nps', customerNpsRouter);

// Supplier Portal Routes
app.use('/api/supplier/register', supplierRegisterRouter);
app.use('/api/supplier/documents', supplierDocumentsRouter);
app.use('/api/supplier/ncrs', supplierNcrsRouter);
app.use('/api/supplier/purchase-orders', supplierOrdersRouter);

// Internal Portal Management Routes
app.use('/api/portal/users', portalUsersRouter);
app.use('/api/portal/tickets', portalTicketsRouter);
app.use('/api/portal/orders', portalOrdersRouter);
app.use('/api/portal/notifications', portalNotificationsRouter);
app.use('/api/portal/announcements', portalAnnouncementsRouter);
app.use('/api/portal/approvals', portalApprovalsRouter);
app.use('/api/portal/quality-reports', portalQualityRouter);
app.use('/api/portal/scorecards', portalScorecardsRouter);

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
      message: 'Internal server error',
    },
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Portal API server running on port ${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => { process.exit(1); }, 10000);
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
