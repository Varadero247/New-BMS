import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/profile', authenticate, async (req: Request, res: Response) => { try { const supplier = await prisma.suppSupplier.findFirst({ where: { orgId: ((req as AuthRequest).user as any)?.orgId || 'default', email: (req as AuthRequest).user?.email, deletedAt: null } as any }); if (!supplier) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } }); res.json({ success: true, data: supplier }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch profile' } }); } });
export default router;
