import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('suppliers-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const where = { orgId, deletedAt: null };
    const [totalSuppliers, totalScorecards, totalDocuments] = await Promise.all([
      prisma.suppSupplier.count({ where }),
      prisma.suppScorecard.count({ where }),
      prisma.suppDocument.count({ where }),
    ]);
    res.json({ success: true, data: { totalSuppliers, totalScorecards, totalDocuments } });
  } catch (error: unknown) {
    logger.error('Failed to fetch stats', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' },
    });
  }
});
export default router;
