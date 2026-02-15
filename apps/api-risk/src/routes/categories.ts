import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const risks = await prisma.riskRegister.findMany({ where: { orgId, deletedAt: null }, select: { category: true } });
    const counts: Record<string, number> = {};
    for (const r of risks) { counts[r.category] = (counts[r.category] || 0) + 1; }
    res.json({ success: true, data: Object.entries(counts).map(([category, count]) => ({ category, count })) });
  } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch categories' } }); }
});
export default router;
