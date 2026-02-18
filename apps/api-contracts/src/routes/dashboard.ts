import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('contracts-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const where = { orgId, deletedAt: null } as any;
    const [totalContracts, upcomingNotices] = await Promise.all([
      prisma.contContract.count({ where }),
      prisma.contNotice.count({ where }),
    ]);
    res.json({ success: true, data: { totalContracts, upcomingNotices } });
  } catch (error: unknown) {
    logger.error('Stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' },
    });
  }
});
export default router;
