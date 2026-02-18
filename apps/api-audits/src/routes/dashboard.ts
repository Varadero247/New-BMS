import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('audits-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const where = { orgId, deletedAt: null };
    const [totalAudits, totalFindings, totalChecklists] = await Promise.all([
      prisma.audAudit.count({ where }),
      prisma.audFinding.count({ where }),
      prisma.audChecklist.count({ where }),
    ]);
    res.json({ success: true, data: { totalAudits, totalFindings, totalChecklists } });
  } catch (error: unknown) {
    logger.error('Stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' },
    });
  }
});
export default router;
