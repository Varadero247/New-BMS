import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('assets-locations');
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const assets = await prisma.assetRegister.findMany({ where: { orgId, deletedAt: null } as any, select: { location: true },
      take: 1000}); const counts: Record<string, number> = {}; for (const a of assets) { if (a.location) counts[a.location] = (counts[a.location] || 0) + 1; } res.json({ success: true, data: Object.entries(counts).map(([location, count]) => ({ location, count })) }); } catch (error: unknown) { logger.error('Operation failed', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } }); } });
export default router;
