import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const overdue = await prisma.compComplaint.count({ where: { orgId, deletedAt: null, slaDeadline: { lt: new Date() } as any, status: { notIn: ['RESOLVED', 'CLOSED'] } } }); const onTrack = await prisma.compComplaint.count({ where: { orgId, deletedAt: null, slaDeadline: { gte: new Date() } as any, status: { notIn: ['RESOLVED', 'CLOSED'] } } }); res.json({ success: true, data: { overdue, onTrack } }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } }); } });
export default router;
