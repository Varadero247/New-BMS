import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-marketing:expansion');
const router = Router();

const expansionCheckSchema = z.object({
  orgId: z.string().optional(),
  thresholds: z.object({
    userLimit: z.number().optional(),
    moduleLimit: z.number().optional(),
  }).optional(),
});

// GET /api/expansion/triggers
router.get('/triggers', authenticate, async (req: Request, res: Response) => {
  try {
    // Return recent expansion trigger events from email logs
    const triggers = await prisma.mktEmailLog.findMany({
      where: {
        template: { startsWith: 'expansion_' },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: triggers });
  } catch (error) {
    logger.error('Failed to fetch expansion triggers', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch triggers' },
    });
  }
});

// POST /api/expansion/check
router.post('/check', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = expansionCheckSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message || 'Invalid input' } });
    }

    const { orgId, thresholds } = parsed.data;
    const userLimit = thresholds?.userLimit ?? 10;
    const moduleLimit = thresholds?.moduleLimit ?? 5;

    let userLimitApproaching: string[] = [];
    let unusedModuleNudge: string[] = [];
    let growthFlag: string[] = [];

    // Users with critically low health scores — at risk of churning
    try {
      const atRisk = await (prisma as any).mktHealthScore.findMany({
        where: { ...(orgId ? { orgId } : {}), score: { lt: 40 } },
        orderBy: { score: 'asc' },
        take: userLimit,
      });
      userLimitApproaching = (atRisk || []).map((s: any) => s.userId);
    } catch { /* DB unavailable — default to [] */ }

    // Users who received onboarding emails >30 days ago (module adoption nudge)
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const stale = await prisma.mktEmailLog.findMany({
        where: { template: { startsWith: 'onboarding_' }, sentAt: { lt: cutoff } },
        take: moduleLimit,
      });
      unusedModuleNudge = (stale || []).map((e: any) => e.email);
    } catch { /* DB unavailable — default to [] */ }

    // Users with IMPROVING health score trend — expansion opportunity
    try {
      const improving = await (prisma as any).mktHealthScore.findMany({
        where: { ...(orgId ? { orgId } : {}), trend: 'IMPROVING' },
        take: 10,
      });
      growthFlag = (improving || []).map((s: any) => s.userId);
    } catch { /* DB unavailable — default to [] */ }

    res.json({
      success: true,
      data: {
        message: 'Expansion check completed',
        results: { userLimitApproaching, unusedModuleNudge, growthFlag },
      },
    });
  } catch (error) {
    logger.error('Expansion check failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to run expansion check' },
    });
  }
});

export default router;
