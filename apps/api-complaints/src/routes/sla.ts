import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('complaints-sla');
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const overdue = await prisma.compComplaint.count({
      where: {
        orgId,
        deletedAt: null,
        slaDeadline: { lt: new Date() },
        status: { notIn: ['RESOLVED', 'CLOSED'] },
      },
    });
    const onTrack = await prisma.compComplaint.count({
      where: {
        orgId,
        deletedAt: null,
        slaDeadline: { gte: new Date() },
        status: { notIn: ['RESOLVED', 'CLOSED'] },
      },
    });
    res.json({ success: true, data: { overdue, onTrack } });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } });
  }
});
export default router;
