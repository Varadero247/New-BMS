import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const assets = await prisma.assetRegister.findMany({ where: { orgId, deletedAt: null }, select: { location: true } }); const counts: Record<string, number> = {}; for (const a of assets) { if (a.location) counts[a.location] = (counts[a.location] || 0) + 1; } res.json({ success: true, data: Object.entries(counts).map(([location, count]) => ({ location, count })) }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
export default router;
