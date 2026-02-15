import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('audits-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try { const orgId = (req as any).user?.orgId || 'default'; const where = { orgId, deletedAt: null };
    const [totalAudits, totalFindings, totalChecklists, ] = await Promise.all([
      (prisma as any).audAudit.count({ where }),
      (prisma as any).audFinding.count({ where }),
      (prisma as any).audChecklist.count({ where }),    ]);
    res.json({ success: true, data: { totalAudits, totalFindings, totalChecklists,  } });
  } catch (error: any) { logger.error('Stats error', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch stats' } }); }
});
export default router;
