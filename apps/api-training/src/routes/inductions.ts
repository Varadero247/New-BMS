import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('training-inductions');
router.get('/', authenticate, async (req: Request, res: Response) => {
  try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const data = await prisma.trainRecord.findMany({ where: { orgId, deletedAt: null, course: { type: 'INDUCTION' } as any }, include: { course: { select: { title: true, code: true } } }, take: 500, orderBy: { createdAt: 'desc' } }); res.json({ success: true, data }); }
  catch (error: unknown) { logger.error('Operation failed', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch inductions' } }); }
});
export default router;
