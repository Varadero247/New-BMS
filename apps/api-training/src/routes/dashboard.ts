import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('training-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const where = { orgId, deletedAt: null };
    const [totalCourses, totalRecords, totalCompetencies, totalGaps, ] = await Promise.all([
      (prisma as any).trainCourse.count({ where }),
      (prisma as any).trainRecord.count({ where }),
      (prisma as any).trainCompetency.count({ where }),
      (prisma as any).trainMatrix.count({ where }),    ]);
    res.json({ success: true, data: { totalCourses, totalRecords, totalCompetencies, totalGaps,  } });
  } catch (error: any) { logger.error('Failed to fetch stats', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch stats' } }); }
});
export default router;
