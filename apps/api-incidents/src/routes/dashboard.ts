import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('incidents-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try { const orgId = (req as AuthRequest).user?.orgId || 'default'; const where = { orgId, deletedAt: null };
    const [totalIncidents, ] = await Promise.all([
      prisma.incIncident.count({ where }),    ]);
    res.json({ success: true, data: { totalIncidents,  } });
  } catch (error: unknown) { logger.error('Stats error', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch stats' } }); }
});
export default router;
