import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const suppliers = await prisma.suppSupplier.findMany({ where: { orgId, deletedAt: null } as any, select: { category: true }, take: 500 }); const counts: Record<string, number> = {}; for (const s of suppliers) { if (s.category) counts[s.category] = (counts[s.category] || 0) + 1; } res.json({ success: true, data: Object.entries(counts).map(([category, count]) => ({ category, count })) }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' } }); } });
export default router;
