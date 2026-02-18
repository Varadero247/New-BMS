import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { q } = req.query as Record<string, string>; if (!q) return res.json({ success: true, data: [] }); const data = await prisma.docDocument.findMany({ where: { orgId, deletedAt: null, OR: [{ title: { contains: q, mode: 'insensitive' } as any }, { description: { contains: q, mode: 'insensitive' } }] }, take: 20 }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Search failed' } }); } });
export default router;
