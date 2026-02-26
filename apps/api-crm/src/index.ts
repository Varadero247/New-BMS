// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { initSentry, sentryErrorHandler } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-crm');
initTracing({ serviceName: 'api-crm' });

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
  createDownstreamRateLimiter,
  initTracing,
} from '@ims/monitoring';
import { attachPermissions } from '@ims/rbac';
import { optionalServiceAuth } from '@ims/service-auth';
import { sanitizeMiddleware, sanitizeQueryMiddleware } from '@ims/validation';
import { prisma } from './prisma';

const logger = createLogger('api-crm');

import contactsRouter from './routes/contacts';
import accountsRouter from './routes/accounts';
import dealsRouter from './routes/deals';
import quotesRouter from './routes/quotes';
import leadsRouter from './routes/leads';
import campaignsRouter, { emailSequenceRouter } from './routes/campaigns';
import partnersRouter from './routes/partners';
import reportsRouter from './routes/reports';
import forecastRouter from './routes/forecast';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';

const app: Express = express();
const PORT = process.env.PORT || 4014;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-crm'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-crm', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// API Routes
app.use('/api', writeRoleGuard('ADMIN', 'MANAGER'));
app.use('/api/contacts', contactsRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/pipelines', dealsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/email-sequences', emailSequenceRouter);
app.use('/api/sequences', emailSequenceRouter); // alias — web app calls /sequences
app.use('/api/partners', partnersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/forecast', forecastRouter);

// CRM dashboard aggregate endpoint
app.get('/api/dashboard', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalContacts, totalAccounts, openDeals, allDeals, wonThisMonth, recentActivities] =
      await Promise.all([
        prisma.crmContact.count(),
        prisma.crmAccount.count(),
        prisma.crmDeal.findMany({ where: { status: 'OPEN' }, select: { value: true } }),
        prisma.crmDeal.count(),
        prisma.crmDeal.findMany({
          where: { status: 'WON', actualCloseDate: { gte: startOfMonth } },
          select: { value: true },
        }),
        prisma.crmActivity.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, type: true, subject: true, createdAt: true },
        }),
      ]);

    const wonCount = await prisma.crmDeal.count({ where: { status: 'WON' } });
    const conversionRate = allDeals > 0 ? Math.round((wonCount / allDeals) * 100) : 0;
    const pipelineValue = openDeals.reduce((sum, d) => sum + Number(d.value), 0);
    const wonThisMonthValue = wonThisMonth.reduce((sum, d) => sum + Number(d.value), 0);

    res.json({
      success: true,
      data: {
        totalContacts,
        totalAccounts,
        openDeals: openDeals.length,
        pipelineValue,
        wonThisMonth: wonThisMonthValue,
        conversionRate,
        recentActivities,
      },
    });
  } catch (err) {
    logger.error('CRM dashboard error', { error: (err as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to load dashboard' } });
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.use(sentryErrorHandler());
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`CRM API server running on port ${PORT}`);
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
