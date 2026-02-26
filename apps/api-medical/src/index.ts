// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { initSentry, sentryErrorHandler } from '@ims/sentry';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-medical');
initTracing({ serviceName: 'api-medical' });

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
  createDownstreamRateLimiter,
  initTracing,
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
import deviceRecordsRouter from './routes/device-records';
import dhfRouter from './routes/dhf';
import suppliersRouter from './routes/suppliers';
import udiRouter from './routes/udi';
import pmsRouter from './routes/pms';
import softwareRouter from './routes/software';
import submissionsRouter from './routes/submissions';
import capaRouter from './routes/capa';
import traceabilityRouter from './routes/traceability';
import validationRouter from './routes/validation';
import verificationRouter from './routes/verification';
import hipaaPrivacyRouter from './routes/hipaa-privacy';
import hipaaBaaRouter from './routes/hipaa-baa';
import hipaaSecurityRouter from './routes/hipaa-security';
import hipaaBreachRouter from './routes/hipaa-breach';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';

const app: Express = express();
const PORT = process.env.PORT || 4011;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
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
app.use('/api', writeRoleGuard('ADMIN', 'MANAGER'));
app.use('/api/design-controls', designControlsRouter);

// Routes - Complaint Handling & MDR/Vigilance (21 CFR 803 / EU MDR Art 87)
app.use('/api/complaints', complaintsRouter);

// Routes - DMR/DHR (FDA 21 CFR 820.181/184)
app.use('/api', dmrDhrRouter);

// Routes - Risk Management (ISO 14971:2019)
app.use('/api/risk', riskManagementRouter);
app.use('/api/risk-management', riskManagementRouter); // alias — web app calls /risk-management

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

// Additional routes
app.use('/api/device-records', deviceRecordsRouter);
app.use('/api/dhf', dhfRouter);
app.use('/api/suppliers', suppliersRouter);

// HIPAA Compliance Routes (45 CFR Part 164)
app.use('/api/hipaa/privacy', hipaaPrivacyRouter);
app.use('/api/hipaa/baa', hipaaBaaRouter);
app.use('/api/hipaa/security', hipaaSecurityRouter);
app.use('/api/hipaa/breach', hipaaBreachRouter);

// 404 handler
app.use((_req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.use(sentryErrorHandler());
// Error handling
app.use(
  (
    err: Error & { statusCode?: number; code?: string },
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(err.statusCode || 500).json({
      success: false,
      error: { code: err.code || 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
);

const server = app.listen(PORT, () => {
  logger.info(`Medical Devices API running on port ${PORT}`);
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
  logger.error('Unhandled rejection', { reason: String(reason), stack: reason instanceof Error ? reason.stack : undefined });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

export default app;
