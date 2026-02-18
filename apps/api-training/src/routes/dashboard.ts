import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('training-dashboard');
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const where = { orgId, deletedAt: null };
    const [totalCourses, totalRecords, totalCompetencies, totalGaps, ] = await Promise.all([
      prisma.trainCourse.count({ where }),
      prisma.trainRecord.count({ where }),
      prisma.trainCompetency.count({ where }),
      prisma.trainMatrix.count({ where }),    ]);
    res.json({ success: true, data: { totalCourses, totalRecords, totalCompetencies, totalGaps,  } });
  } catch (error: unknown) { logger.error('Failed to fetch stats', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch stats' } }); }
});
export default router;
