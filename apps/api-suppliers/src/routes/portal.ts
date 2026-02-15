import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/profile', authenticate, async (req: Request, res: Response) => { try { const supplier = await prisma.suppSupplier.findFirst({ where: { orgId: (req as any).user?.orgId || 'default', email: (req as any).user?.email, deletedAt: null } }); if (!supplier) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } }); res.json({ success: true, data: supplier }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch profile' } }); } });
export default router;
