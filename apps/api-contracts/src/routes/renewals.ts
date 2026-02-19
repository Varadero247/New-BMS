import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('contracts-renewals');
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const data = await prisma.contContract.findMany({
      where: { orgId, deletedAt: null, renewalDate: { lte: thirtyDays }, status: 'ACTIVE' },
      orderBy: { renewalDate: 'asc' },
      take: 500,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } });
  }
});
export default router;
