import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { AutomationConfig } from '../config';

const logger = createLogger('api-marketing:digest');
const router = Router();

const triggerDigestSchema = z.object({
  date: z.string().optional(),
});

// POST /api/digest/trigger
router.post('/trigger', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = triggerDigestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message || 'Invalid input' } });
    }
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Gather digest data
    const [newLeads, emailsSent, activeWinBacks, upcomingRenewals] = await Promise.all([
      prisma.mktLead.count({ where: { createdAt: { gte: yesterday, lt: todayStart } } }),
      prisma.mktEmailLog.count({ where: { sentAt: { gte: yesterday, lt: todayStart } } }),
      prisma.mktWinBackSequence.count({ where: { reactivatedAt: null } }),
      prisma.mktRenewalSequence.count({
        where: {
          renewalDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          renewedAt: null,
        },
      }),
    ]);

    // Critical health scores
    const criticalScores = await prisma.mktHealthScore.findMany({
      where: { score: { lt: AutomationConfig.health.criticalThreshold } },
      orderBy: { score: 'asc' },
      take: 5,
      distinct: ['userId'],
    });

    const digestData = {
      date: now.toISOString().split('T')[0],
      yesterday: {
        newLeads,
        emailsSent,
      },
      today: {
        activeWinBacks,
        upcomingRenewals,
        criticalCustomers: criticalScores.length,
      },
    };

    // Log the digest
    await prisma.mktEmailLog.create({
      data: {
        email: AutomationConfig.founder.email,
        template: 'daily_digest',
        subject: `Nexara Daily — ${digestData.date} | ${newLeads} new leads | ${upcomingRenewals} renewals`,
      },
    });

    res.json({ success: true, data: digestData });
  } catch (error) {
    logger.error('Digest trigger failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to trigger digest' },
    });
  }
});

// GET /api/digest/history
router.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const digests = await prisma.mktEmailLog.findMany({
      where: { template: 'daily_digest' },
      orderBy: { sentAt: 'desc' },
      take: 30,
    });

    res.json({ success: true, data: digests });
  } catch (error) {
    logger.error('Failed to fetch digest history', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch history' },
    });
  }
});

export default router;
