import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { AutomationConfig } from '../config';

const enqueueOnboardingSchema = z.object({
  email: z.string().trim().email('Valid email is required').min(1, 'Email is required'),
  firstName: z.string().optional(),
  companyName: z.string().optional(),
});

const logger = createLogger('api-marketing:onboarding');
const router = Router();

// Email delays in milliseconds
const SEQUENCE_DELAYS = [
  { template: 'welcome', delayMs: 0, subject: 'Welcome to Nexara — your 21-day trial is live' },
  {
    template: 'inactive_or_active',
    delayMs: 3 * 24 * 60 * 60 * 1000,
    subject: 'How is your Nexara trial going?',
  },
  {
    template: 'feature_highlight',
    delayMs: 7 * 24 * 60 * 60 * 1000,
    subject: 'Discover the feature most relevant to your ISO standards',
  },
  {
    template: 'case_study',
    delayMs: 14 * 24 * 60 * 60 * 1000,
    subject: 'How companies like yours reduced audit prep by 60%',
  },
  {
    template: 'expiry_warning',
    delayMs: 18 * 24 * 60 * 60 * 1000,
    subject: "Your trial ends in 3 days — here's what you'd keep",
  },
  {
    template: 'extension',
    delayMs: 21 * 24 * 60 * 60 * 1000,
    subject: 'Get 7 more free days — just book a quick call',
  },
  {
    template: 'final_offer',
    delayMs: 25 * 24 * 60 * 60 * 1000,
    subject: '20% off your first 3 months — today only',
  },
];

// POST /api/onboarding/enqueue/:userId
router.post('/enqueue/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const parsed = enqueueOnboardingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { email, firstName, companyName } = parsed.data;

    const sequenceId = `onboarding-${userId}-${Date.now()}`;
    const now = Date.now();

    const jobs = SEQUENCE_DELAYS.map((step) => ({
      userId,
      email,
      template: step.template,
      subject: step.subject,
      scheduledFor: new Date(now + step.delayMs),
      sequenceId,
      status: 'PENDING' as const,
    }));

    // Create all jobs in a transaction
    await prisma.$transaction(jobs.map((job) => prisma.mktEmailJob.create({ data: job })));

    res.status(201).json({
      success: true,
      data: { sequenceId, jobsScheduled: jobs.length },
    });
  } catch (error) {
    logger.error('Onboarding enqueue failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to enqueue onboarding' },
    });
  }
});

// GET /api/onboarding/status/:userId
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.mktEmailJob.findMany({
      where: {
        userId: req.params.userId,
        sequenceId: { startsWith: 'onboarding-' },
      },
      orderBy: { scheduledFor: 'asc' },
      take: 1000,
    });

    const sent = jobs.filter((j) => j.status === 'SENT').length;
    const pending = jobs.filter((j) => j.status === 'PENDING').length;
    const cancelled = jobs.filter((j) => j.status === 'CANCELLED').length;

    res.json({
      success: true,
      data: { jobs, summary: { total: jobs.length, sent, pending, cancelled } },
    });
  } catch (error) {
    logger.error('Onboarding status check failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to check status' },
    });
  }
});

// POST /api/onboarding/cancel/:userId
router.post('/cancel/:userId', async (req: Request, res: Response) => {
  try {
    const result = await prisma.mktEmailJob.updateMany({
      where: {
        userId: req.params.userId,
        sequenceId: { startsWith: 'onboarding-' },
        status: 'PENDING',
      },
      data: { status: 'CANCELLED' },
    });

    res.json({
      success: true,
      data: { cancelledCount: result.count },
    });
  } catch (error) {
    logger.error('Onboarding cancel failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel onboarding' },
    });
  }
});

export default router;
