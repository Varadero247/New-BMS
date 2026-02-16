import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const risks = await prisma.riskRegister.findMany({ where: { orgId, deletedAt: null, status: { not: 'CLOSED' } }, select: { id: true, title: true, likelihood: true, consequence: true, inherentScore: true }, take: 500 });
    res.json({ success: true, data: { risks, total: risks.length } });
  } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to generate heat map' } }); }
});
export default router;
