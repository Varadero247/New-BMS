import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('assets-depreciation');
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const assets = await prisma.assetRegister.findMany({
      where: { orgId, deletedAt: null, purchaseCost: { not: null } },
      select: { id: true, name: true, purchaseCost: true, currentValue: true, purchaseDate: true },
      take: 500,
    });
    res.json({ success: true, data: assets });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } });
  }
});
export default router;
