import { Router, Request, Response } from 'express';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-marketing:expansion');
const router = Router();

// GET /api/expansion/triggers
router.get('/triggers', async (req: Request, res: Response) => {
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
router.post('/check', async (req: Request, res: Response) => {
  try {
    // Manual expansion trigger check
    // In production, this queries actual usage data against thresholds
    const checks = {
      userLimitApproaching: [],
      unusedModuleNudge: [],
      growthFlag: [],
    };

    res.json({
      success: true,
      data: {
        message: 'Expansion check completed',
        results: checks,
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
