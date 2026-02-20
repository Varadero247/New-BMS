import { initSentry, sentryErrorHandler } from '@ims/sentry';
import dotenv from 'dotenv';
dotenv.config();
initSentry('api-marketing');
initTracing({ serviceName: 'api-marketing' });

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
import { startScheduler } from './scheduler';

const logger = createLogger('api-marketing');

import roiRouter from './routes/roi';
import chatRouter from './routes/chat';
import leadsRouter from './routes/leads';
import onboardingRouter from './routes/onboarding';
import healthScoreRouter from './routes/health-score';
import expansionRouter from './routes/expansion';
import prospectResearchRouter from './routes/prospect-research';
import linkedinTrackerRouter from './routes/linkedin-tracker';
import renewalRouter from './routes/renewal';
import winbackRouter from './routes/winback';
import stripeWebhooksRouter from './routes/stripe-webhooks';
import growthRouter from './routes/growth';
import digestRouter from './routes/digest';
import partnerOnboardingRouter from './routes/partner-onboarding';
import { writeRoleGuard } from '@ims/auth';
import { errorHandler } from '@ims/shared';

const app: Express = express();
const PORT = process.env.PORT || 4025;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(createDownstreamRateLimiter());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-marketing'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware());
app.use(sanitizeQueryMiddleware());

// Stripe webhooks need raw body for signature verification
app.use(
  '/api/webhooks',
  express.raw({ type: 'application/json' }),
  (req: Request, _res: Response, next: NextFunction) => {
    if (Buffer.isBuffer(req.body)) {
      (req as Request & { rawBody?: Buffer }).rawBody = req.body;
      req.body = JSON.parse(req.body.toString());
    }
    next();
  },
  stripeWebhooksRouter
);

// Public routes (no auth required)
app.use('/api', writeRoleGuard('ADMIN', 'MANAGER'));
app.use('/api/roi', roiRouter);
app.use('/api/chat', chatRouter);
app.post('/api/leads/capture', express.json(), leadsRouter);
app.get('/api/winback/reason/:reason', winbackRouter);

// Public signup endpoint — creates a trial lead
app.post('/api/signup', express.json(), async (req: Request, res: Response) => {
  try {
    const { email, name, company, plan, source } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } });
    }

    // Check if lead already exists
    const existing = await prisma.mktLead.findFirst({ where: { email } });
    if (existing) {
      return res.status(200).json({ success: true, data: { id: existing.id, email, alreadyExists: true } });
    }

    const sourceMap: Record<string, string> = {
      website: 'LANDING_PAGE', roi: 'ROI_CALCULATOR', chat: 'CHATBOT',
      partner: 'PARTNER_REFERRAL', linkedin: 'LINKEDIN', direct: 'DIRECT',
    };
    const resolvedSource = sourceMap[source as string] || 'LANDING_PAGE';

    const lead = await prisma.mktLead.create({
      data: {
        email,
        name: name || email.split('@')[0],
        company: company || null,
        source: resolvedSource as 'LANDING_PAGE',
      },
    });

    res.status(201).json({ success: true, data: { id: lead.id, email: lead.email, message: 'Signup successful' } });
  } catch (error) {
    logger.error('Signup error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Signup failed' } });
  }
});

// Auth middleware for protected routes
app.use(optionalServiceAuth);
app.use(attachPermissions());

// Protected routes
app.use('/api/leads', leadsRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/health-score', healthScoreRouter);
app.use('/api/expansion', expansionRouter);
app.use('/api/prospects', prospectResearchRouter);
app.use('/api/linkedin', linkedinTrackerRouter);
app.use('/api/renewal', renewalRouter);
app.use('/api/winback', winbackRouter);
app.use('/api/growth', growthRouter);
app.use('/api/digest', digestRouter);
app.use('/api/partner-onboarding', partnerOnboardingRouter);

// Health check, readiness, and metrics
app.get('/health', createHealthCheck('api-marketing', prisma, '1.0.0'));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});
app.get('/metrics', metricsHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

app.use(sentryErrorHandler());
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Marketing API server running on port ${PORT}`);
  // Start cron scheduler
  startScheduler();
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
