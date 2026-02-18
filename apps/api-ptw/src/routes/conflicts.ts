import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const active = await prisma.ptwPermit.findMany({ where: { orgId, deletedAt: null, status: 'ACTIVE' } as any, select: { id: true, title: true, location: true, area: true, startDate: true, endDate: true, type: true }, take: 500 }); const conflicts: unknown[] = []; for (let i = 0; i < active.length; i++) { for (let j = i + 1; j < active.length; j++) { if (active[i].location === active[j].location && active[i].area === active[j].area) { conflicts.push({ permit1: active[i], permit2: active[j], reason: 'Same location and area' }); } } } res.json({ success: true, data: conflicts }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
export default router;
