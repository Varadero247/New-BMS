import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); const data = await prisma.contContract.findMany({ where: { orgId, deletedAt: null, renewalDate: { lte: thirtyDays } as any, status: 'ACTIVE' }, orderBy: { renewalDate: 'asc' }, take: 500 }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
export default router;
