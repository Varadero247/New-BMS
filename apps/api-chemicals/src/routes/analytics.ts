import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('chem-analytics');

// GET /api/analytics/dashboard — comprehensive dashboard data
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
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
      (prisma as any).chemRegister.count({ where: baseWhere }),
      (prisma as any).chemRegister.count({ where: { ...baseWhere, isCmr: true } }),
      (prisma as any).chemCoshh.count({ where: { orgId, deletedAt: null, residualRiskLevel: { in: ['VERY_HIGH', 'UNACCEPTABLE'] } } }),
      (prisma as any).chemSds.count({ where: { status: 'CURRENT', nextReviewDate: { lte: new Date() }, chemical: { orgId, deletedAt: null } } }),
      (prisma as any).chemCoshh.count({
        where: {
          orgId, status: 'ACTIVE', deletedAt: null,
          reviewDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      (prisma as any).chemMonitoring.count({ where: { resultVsWel: 'ABOVE_WEL', chemical: { orgId, deletedAt: null } } }),
      (prisma as any).chemInventory.count({
        where: {
          isActive: true,
          expiryDate: { lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), not: null },
          chemical: { orgId, deletedAt: null },
        },
      }),
      (prisma as any).chemIncident.count({ where: { orgId } }),
      (prisma as any).chemIncompatAlert.count({ where: { isActive: true, chemical: { orgId, deletedAt: null } } }),
      // Risk level breakdown from COSHH assessments
      (prisma as any).chemCoshh.groupBy({
        by: ['residualRiskLevel'],
        where: { orgId, status: 'ACTIVE', deletedAt: null },
        _count: true,
      }),
      (prisma as any).chemIncident.findMany({
        where: { orgId },
        orderBy: { dateTime: 'desc' },
        take: 10,
        include: { chemical: { select: { productName: true } } },
      }),
    ]);

    const riskLevelBreakdown: Record<string, number> = {};
    for (const r of riskLevels) {
      riskLevelBreakdown[r.residualRiskLevel] = r._count;
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
  } catch (error: any) {
    logger.error('Failed to fetch analytics dashboard', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch analytics dashboard' } });
  }
});

export default router;
