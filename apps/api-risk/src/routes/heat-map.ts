import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const risks = await prisma.riskRegister.findMany({ where: { orgId, deletedAt: null, status: { not: 'CLOSED' } as any }, select: { id: true, title: true, likelihood: true, consequence: true, inherentScore: true }, take: 500 });
    res.json({ success: true, data: { risks, total: risks.length } });
  } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate heat map' } }); }
});
export default router;
