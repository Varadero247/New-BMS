import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('risk-dashboard');

router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const where = { orgId, deletedAt: null };
    const openWhere = { ...where, status: { not: 'CLOSED' as const } };

    const [
      totalRisks,
      totalCapas,
      openCapas,
      pendingReviews,
      criticalRisks,
      exceedsAppetite,
      overdueReviews,
      overdueActions,
      kriBreaches,
      kriWarnings,
      newThisMonth,
    ] = await Promise.all([
      prisma.riskRegister.count({ where }),
      prisma.riskCapa.count({ where }),
      prisma.riskCapa.count({ where: { ...where, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.riskReview.count({ where: { ...where, status: 'SCHEDULED' } }),
      prisma.riskRegister.count({ where: { ...openWhere, residualRiskLevel: 'CRITICAL' } }),
      prisma.riskRegister.count({ where: { ...openWhere, appetiteStatus: 'EXCEEDS' } }),
      prisma.riskRegister.count({ where: { ...openWhere, nextReviewDate: { lt: new Date() } } }),
      prisma.riskAction.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, targetDate: { lt: new Date() } },
      }),
      prisma.riskKri.count({ where: { isActive: true, currentStatus: 'RED' } }),
      prisma.riskKri.count({ where: { isActive: true, currentStatus: 'AMBER' } }),
      prisma.riskRegister.count({
        where: {
          ...where,
          raisedDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ]);

    // Average risk score
    const avgResult = await prisma.riskRegister.aggregate({
      where: openWhere,
      _avg: { residualScore: true },
    });
    const avgRiskScore = avgResult._avg?.residualScore
      ? Math.round(avgResult._avg.residualScore * 10) / 10
      : 0;

    res.json({
      success: true,
      data: {
        totalRisks,
        totalCapas,
        openCapas,
        pendingReviews,
        avgRiskScore,
        criticalRisks,
        exceedsAppetite,
        overdueReviews,
        overdueActions,
        kriBreaches,
        kriWarnings,
        newThisMonth,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch stats', { error: (error instanceof Error ? error.message : String(error)) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' },
    });
  }
});

export default router;
