import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('assets-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const where = { orgId, deletedAt: null };
    const [totalAssets, totalWorkOrders, totalCalibrations] = await Promise.all([
      prisma.assetRegister.count({ where }),
      prisma.assetWorkOrder.count({ where }),
      prisma.assetCalibration.count({ where }),
    ]);
    res.json({ success: true, data: { totalAssets, totalWorkOrders, totalCalibrations } });
  } catch (error: unknown) {
    logger.error('Stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' },
    });
  }
});
export default router;
