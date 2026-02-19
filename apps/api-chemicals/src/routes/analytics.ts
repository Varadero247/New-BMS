import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('chem-analytics');

// GET /api/analytics/dashboard — comprehensive dashboard data
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const baseWhere = { orgId, isActive: true, deletedAt: null };

    const [
      totalChemicals,
      cmrCount,
      highRiskCoshh,
      sdsOverdue,
      coshhDueReview,
      welExceedances,
      expiringStock,
      openIncidents,
      incompatAlerts,
      riskLevels,
      recentIncidents,
    ] = await Promise.all([
      prisma.chemRegister.count({ where: baseWhere }),
      prisma.chemRegister.count({ where: { ...baseWhere, isCmr: true } }),
      prisma.chemCoshh.count({
        where: {
          orgId,
          deletedAt: null,
          residualRiskLevel: { in: ['VERY_HIGH', 'UNACCEPTABLE'] } as any,
        },
      }),
      prisma.chemSds.count({
        where: {
          status: 'CURRENT',
          nextReviewDate: { lte: new Date() },
          chemical: { orgId, deletedAt: null },
        },
      }),
      prisma.chemCoshh.count({
        where: {
          orgId,
          status: 'ACTIVE',
          deletedAt: null,
          reviewDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } as any,
        },
      }),
      prisma.chemMonitoring.count({
        where: { resultVsWel: 'ABOVE_WEL', chemical: { orgId, deletedAt: null } as any },
      }),
      prisma.chemInventory.count({
        where: {
          isActive: true,
          expiryDate: { lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), not: null },
          chemical: { orgId, deletedAt: null },
        },
      }),
      prisma.chemIncident.count({ where: { orgId } }),
      prisma.chemIncompatAlert.count({
        where: { isActive: true, chemical: { orgId, deletedAt: null } as any },
      }),
      // Risk level breakdown from COSHH assessments
      prisma.chemCoshh.groupBy({
        by: ['residualRiskLevel'],
        where: { orgId, status: 'ACTIVE', deletedAt: null } as any,
        _count: true,
      }),
      prisma.chemIncident.findMany({
        where: { orgId },
        orderBy: { dateTime: 'desc' },
        take: 10,
        include: { chemical: { select: { productName: true } } },
      }),
    ]);

    const riskLevelBreakdown: Record<string, number> = {};
    for (const r of riskLevels) {
      riskLevelBreakdown[r.residualRiskLevel] = (r as { _count: number })._count;
    }

    res.json({
      success: true,
      data: {
        totalChemicals,
        highRiskCount: highRiskCoshh,
        cmrCount,
        sdsOverdueCount: sdsOverdue,
        coshhDueReviewCount: coshhDueReview,
        welExceedanceCount: welExceedances,
        expiringStockCount: expiringStock,
        openIncidents,
        incompatibilityAlerts: incompatAlerts,
        riskLevelBreakdown,
        recentIncidents,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch analytics dashboard', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch analytics dashboard' },
    });
  }
});

export default router;
