import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const risks = await prisma.riskRegister.findMany({ where: { orgId, deletedAt: null } as any, select: { treatment: true }, take: 500 });
    const counts: Record<string, number> = {};
    for (const r of risks) { counts[r.treatment] = (counts[r.treatment] || 0) + 1; }
    res.json({ success: true, data: Object.entries(counts).map(([treatment, count]) => ({ treatment, count })) });
  } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch treatments' } }); }
});
export default router;
