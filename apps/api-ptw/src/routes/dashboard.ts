import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('ptw-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try { const orgId = (req as any).user?.orgId || 'default'; const where = { orgId, deletedAt: null };
    const [totalPermits, totalMethodStatements, totalToolboxTalks, ] = await Promise.all([
      (prisma as any).ptwPermit.count({ where }),
      (prisma as any).ptwMethodStatement.count({ where }),
      (prisma as any).ptwToolboxTalk.count({ where }),    ]);
    res.json({ success: true, data: { totalPermits, totalMethodStatements, totalToolboxTalks,  } });
  } catch (error: any) { logger.error('Stats error', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch stats' } }); }
});
export default router;
