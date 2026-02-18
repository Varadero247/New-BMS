import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const data = await prisma.compComplaint.findMany({ where: { orgId, deletedAt: null, isRegulatory: true } as any, orderBy: { createdAt: 'desc' }, take: 500 }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } }); } });
export default router;
