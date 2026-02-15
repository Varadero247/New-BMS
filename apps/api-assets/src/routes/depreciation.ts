import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const assets = await prisma.assetRegister.findMany({ where: { orgId, deletedAt: null, purchaseCost: { not: null } }, select: { id: true, name: true, purchaseCost: true, currentValue: true, purchaseDate: true } }); res.json({ success: true, data: assets }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
export default router;
