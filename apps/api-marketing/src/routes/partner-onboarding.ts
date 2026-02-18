import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const enqueuePartnerSchema = z.object({
  email: z.string().email('Valid email is required').min(1, 'Email is required'),
  name: z.string().optional(),
});

const logger = createLogger('api-marketing:partner-onboarding');
const router = Router();

// POST /api/partner-onboarding/enqueue/:partnerId
router.post('/enqueue/:partnerId', async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const parsed = enqueuePartnerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const { email, name } = parsed.data;

    const sequenceId = `partner-onboarding-${partnerId}`;
    const now = Date.now();

    // Welcome email (immediate)
    await prisma.mktEmailJob.create({
      data: {
        email,
        template: 'partner_welcome',
        subject: 'Welcome to the Nexara Partner Programme',
        scheduledFor: new Date(now),
        sequenceId,
      },
    });

    // Day 7: Tips for first referral (if no deal submitted)
    await prisma.mktEmailJob.create({
      data: {
        email,
        template: 'partner_day7_tips',
        subject: 'Tips for your first Nexara referral',
        scheduledFor: new Date(now + 7 * 24 * 60 * 60 * 1000),
        sequenceId,
      },
    });

    // Day 30: Case study or closing help
    await prisma.mktEmailJob.create({
      data: {
        email,
        template: 'partner_day30_casestudy',
        subject: 'How one ISO consultant earned £4,200 in Q1 referring clients to Nexara',
        scheduledFor: new Date(now + 30 * 24 * 60 * 60 * 1000),
        sequenceId,
      },
    });

    res.status(201).json({
      success: true,
      data: { sequenceId, jobsScheduled: 3 },
    });
  } catch (error) {
    logger.error('Partner onboarding enqueue failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to enqueue partner onboarding' },
    });
  }
});

export default router;
