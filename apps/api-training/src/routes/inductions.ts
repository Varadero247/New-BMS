import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => {
  try { const orgId = (req as any).user?.orgId || 'default'; const data = await prisma.trainRecord.findMany({ where: { orgId, deletedAt: null, course: { type: 'INDUCTION' } }, include: { course: { select: { title: true, code: true } } }, take: 500 }); res.json({ success: true, data }); }
  catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch inductions' } }); }
});
export default router;
