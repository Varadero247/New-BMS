import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('risk-categories');
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const risks = await prisma.riskRegister.findMany({
      where: { orgId, deletedAt: null },
      select: { category: true },
      take: 500,
    });
    const counts: Record<string, number> = {};
    for (const r of risks) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    res.json({
      success: true,
      data: Object.entries(counts).map(([category, count]) => ({ category, count })),
    });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' },
    });
  }
});
export default router;
