import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('documents-search');
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { q } = req.query as Record<string, string>; if (!q) return res.json({ success: true, data: [] }); const data = await prisma.docDocument.findMany({ where: { orgId, deletedAt: null, OR: [{ title: { contains: q, mode: 'insensitive' } as any }, { description: { contains: q, mode: 'insensitive' } }] }, take: 20, orderBy: { createdAt: 'desc' } }); res.json({ success: true, data }); } catch (error: unknown) { logger.error('Operation failed', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Search failed' } }); } });
export default router;
