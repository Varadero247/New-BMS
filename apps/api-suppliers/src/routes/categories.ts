import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const suppliers = await prisma.suppSupplier.findMany({ where: { orgId, deletedAt: null }, select: { category: true }, take: 500 }); const counts: Record<string, number> = {}; for (const s of suppliers) { if (s.category) counts[s.category] = (counts[s.category] || 0) + 1; } res.json({ success: true, data: Object.entries(counts).map(([category, count]) => ({ category, count })) }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch categories' } }); } });
export default router;
