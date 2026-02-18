import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const assets = await prisma.assetRegister.findMany({ where: { orgId, deletedAt: null } as any, select: { location: true } }); const counts: Record<string, number> = {}; for (const a of assets) { if (a.location) counts[a.location] = (counts[a.location] || 0) + 1; } res.json({ success: true, data: Object.entries(counts).map(([location, count]) => ({ location, count })) }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } }); } });
export default router;
