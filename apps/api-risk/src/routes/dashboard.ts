import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('risk-dashboard');

router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const where = { orgId, deletedAt: null };
    const [totalRisks, totalCapas, ] = await Promise.all([
      (prisma as any).riskRegister.count({ where }),
      (prisma as any).riskCapa.count({ where }),
    ]);
    res.json({ success: true, data: { totalRisks, totalCapas,  } });
  } catch (error: any) { logger.error('Failed to fetch stats', { error: (error as any).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch stats' } }); }
});

export default router;
