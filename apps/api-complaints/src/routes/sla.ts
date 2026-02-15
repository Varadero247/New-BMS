import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const overdue = await prisma.compComplaint.count({ where: { orgId, deletedAt: null, slaDeadline: { lt: new Date() }, status: { notIn: ['RESOLVED', 'CLOSED'] } } }); const onTrack = await prisma.compComplaint.count({ where: { orgId, deletedAt: null, slaDeadline: { gte: new Date() }, status: { notIn: ['RESOLVED', 'CLOSED'] } } }); res.json({ success: true, data: { overdue, onTrack } }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
export default router;
