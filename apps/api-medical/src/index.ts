import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

// Validate required configuration
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL: Missing required env var: ${envVar}`);
    process.exit(1);
  }
}

import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  createHealthCheck,
} from '@ims/monitoring';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { optionalServiceAuth } from '@ims/service-auth';
import { attachPermissions } from '@ims/rbac';
import { prisma } from './prisma';

const logger = createLogger('api-medical');

import designControlsRouter from './routes/design-controls';
import complaintsRouter from './routes/complaints';
import dmrDhrRouter from './routes/dmr-dhr';
import riskManagementRouter from './routes/risk-management';
import udiRouter from './routes/udi';
import pmsRouter from './routes/pms';
import softwareRouter from './routes/software';
import submissionsRouter from './routes/submissions';
import capaRouter from './routes/capa';
import traceabilityRouter from './routes/traceability';
import validationRouter from './routes/validation';
import verificationRouter from './routes/verification';

const app: Express = express();
const PORT = process.env.PORT || 4011;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-medical'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-medical', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// Routes - Design Controls (ISO 13485 Clause 7.3)
app.use('/api/design-controls', designControlsRouter);

// Routes - Complaint Handling & MDR/Vigilance (21 CFR 803 / EU MDR Art 87)
app.use('/api/complaints', complaintsRouter);

// Routes - DMR/DHR (FDA 21 CFR 820.181/184)
app.use('/api', dmrDhrRouter);

// Routes - Risk Management (ISO 14971:2019)
app.use('/api/risk', riskManagementRouter);

// Routes - UDI Management (EU MDR / FDA)
app.use('/api/udi', udiRouter);

// Routes - Post-Market Surveillance (EU MDR Art 83-86)
app.use('/api/pms', pmsRouter);

// Routes - Software Validation (IEC 62304)
app.use('/api/software', softwareRouter);

// Routes - Regulatory Submissions Tracker (S4-05)
app.use('/api/submissions', submissionsRouter);

// Routes - CAPA (ISO 13485 Clause 8.5)
app.use('/api/capa', capaRouter);

// Routes - Traceability Matrix (ISO 13485 Clause 7.3 / FDA 21 CFR 820.30)
app.use('/api/traceability', traceabilityRouter);

// Routes - Design Validation (ISO 13485 Clause 7.3.7)
app.use('/api/validation', validationRouter);

// Routes - Design Verification (ISO 13485 Clause 7.3.6)
app.use('/api/verification', verificationRouter);

// Error handling
app.use((err: Error & { statusCode?: number; code?: string }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: 'Internal server error' },
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Medical Devices API running on port ${PORT}`);
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
