import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('risk-dashboard');

router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const where = { orgId, deletedAt: null };
    const openWhere = { ...where, status: { not: 'CLOSED' as const } };

    const [
      totalRisks, totalCapas, openCapas, pendingReviews,
      criticalRisks, exceedsAppetite, overdueReviews,
      overdueActions, kriBreaches, kriWarnings, newThisMonth,
    ] = await Promise.all([
      (prisma as any).riskRegister.count({ where }),
      (prisma as any).riskCapa.count({ where }),
      (prisma as any).riskCapa.count({ where: { ...where, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      (prisma as any).riskReview.count({ where: { ...where, status: 'SCHEDULED' } }),
      (prisma as any).riskRegister.count({ where: { ...openWhere, residualRiskLevel: 'CRITICAL' } }),
      (prisma as any).riskRegister.count({ where: { ...openWhere, appetiteStatus: 'EXCEEDS' } }),
      (prisma as any).riskRegister.count({ where: { ...openWhere, nextReviewDate: { lt: new Date() } } }),
      (prisma as any).riskAction.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, targetDate: { lt: new Date() } } }),
      (prisma as any).riskKri.count({ where: { isActive: true, currentStatus: 'RED' } }),
      (prisma as any).riskKri.count({ where: { isActive: true, currentStatus: 'AMBER' } }),
      (prisma as any).riskRegister.count({ where: { ...where, raisedDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    ]);

    // Average risk score
    const avgResult = await (prisma as any).riskRegister.aggregate({ where: openWhere, _avg: { residualScore: true } });
    const avgRiskScore = avgResult._avg?.residualScore ? Math.round(avgResult._avg.residualScore * 10) / 10 : 0;

    res.json({
      success: true,
      data: {
        totalRisks, totalCapas, openCapas, pendingReviews, avgRiskScore,
        criticalRisks, exceedsAppetite, overdueReviews, overdueActions,
        kriBreaches, kriWarnings, newThisMonth,
      },
    });
  } catch (error: any) {
    logger.error('Failed to fetch stats', { error: (error as any).message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch stats' } });
  }
});

export default router;
