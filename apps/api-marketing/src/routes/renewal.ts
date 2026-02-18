import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const sendReminderSchema = z.object({
  type: z.enum(['day90', 'day60', 'day30', 'day7'], {
    errorMap: () => ({ message: 'Invalid reminder type' }),
  }),
});

const logger = createLogger('api-marketing:renewal');
const router = Router();

// GET /api/renewal/upcoming
router.get('/upcoming', authenticate, async (req: Request, res: Response) => {
  try {
    const daysAhead = Math.min(365, Math.max(1, parseInt(req.query.days as string, 10) || 90));
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const sequences = await prisma.mktRenewalSequence.findMany({
      where: {
        renewalDate: { lte: futureDate },
        renewedAt: null,
      },
      orderBy: { renewalDate: 'asc' },
      take: 1000,
    });

    res.json({ success: true, data: sequences });
  } catch (error) {
    logger.error('Failed to fetch upcoming renewals', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch renewals' },
    });
  }
});

// POST /api/renewal/:orgId/send-reminder
router.post('/:orgId/send-reminder', authenticate, async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const parsed = sendReminderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { type } = parsed.data;

    const sequence = await prisma.mktRenewalSequence.findUnique({
      where: { orgId },
    });

    if (!sequence) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Renewal sequence not found' },
      });
    }

    const updateField =
      type === 'day90'
        ? 'day90Sent'
        : type === 'day60'
          ? 'day60Sent'
          : type === 'day30'
            ? 'day30Sent'
            : 'day7Sent';

    await prisma.mktRenewalSequence.update({
      where: { orgId },
      data: { [updateField]: true },
    });

    // Schedule the email
    await prisma.mktEmailJob.create({
      data: {
        email: '', // Would be populated from org data
        template: `renewal_${type}`,
        subject: getRenewalSubject(type),
        scheduledFor: new Date(),
        sequenceId: `renewal-${orgId}`,
      },
    });

    res.json({
      success: true,
      data: { message: `${type} reminder sent for org ${orgId}` },
    });
  } catch (error) {
    logger.error('Renewal reminder failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to send reminder' },
    });
  }
});

function getRenewalSubject(type: string): string {
  switch (type) {
    case 'day90':
      return "Your Nexara renewal is coming up — here's your year in review";
    case 'day60':
      return 'How your team compares — Nexara usage benchmark';
    case 'day30':
      return 'A thank-you for your first year — exclusive renewal offer inside';
    case 'day7':
      return 'Your renewal is in 7 days — special offer enclosed';
    default:
      return 'Nexara renewal reminder';
  }
}

export default router;
