import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('risk-analytics');

// GET /api/risks/analytics/dashboard
router.get('/analytics/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const baseWhere = { orgId, deletedAt: null };

    const [
      totalRisks, byStatusRaw, byCategoryRaw, byLevelRaw,
      exceedsAppetite, overdueReviewCount, overdueActionsCount,
      kriRedCount, kriAmberCount, topRisks, recentlyChanged,
      allOpenRisks, newThisMonth,
    ] = await Promise.all([
      (prisma as any).riskRegister.count({ where: baseWhere }),
      (prisma as any).riskRegister.groupBy({ by: ['status'], where: baseWhere, _count: true }),
      (prisma as any).riskRegister.groupBy({ by: ['category'], where: baseWhere, _count: true }),
      (prisma as any).riskRegister.groupBy({ by: ['residualRiskLevel'], where: { ...baseWhere, residualRiskLevel: { not: null } }, _count: true }),
      (prisma as any).riskRegister.count({ where: { ...baseWhere, appetiteStatus: 'EXCEEDS' } }),
      (prisma as any).riskRegister.count({ where: { ...baseWhere, nextReviewDate: { lt: new Date() }, status: { not: 'CLOSED' } } }),
      (prisma as any).riskAction.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, targetDate: { lt: new Date() } } }),
      (prisma as any).riskKri.count({ where: { isActive: true, currentStatus: 'RED' } }),
      (prisma as any).riskKri.count({ where: { isActive: true, currentStatus: 'AMBER' } }),
      (prisma as any).riskRegister.findMany({ where: { ...baseWhere, status: { not: 'CLOSED' } }, orderBy: { residualScore: 'desc' }, take: 5, select: { id: true, referenceNumber: true, title: true, residualScore: true, residualRiskLevel: true, category: true, ownerName: true } }),
      (prisma as any).riskRegister.findMany({ where: baseWhere, orderBy: { updatedAt: 'desc' }, take: 10, select: { id: true, referenceNumber: true, title: true, status: true, residualRiskLevel: true, updatedAt: true } }),
      (prisma as any).riskRegister.findMany({ where: { ...baseWhere, status: { not: 'CLOSED' } }, select: { residualLikelihoodNum: true, residualConsequenceNum: true, id: true, title: true, referenceNumber: true, residualRiskLevel: true } }),
      (prisma as any).riskRegister.count({ where: { ...baseWhere, raisedDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const s of byStatusRaw) byStatus[s.status] = s._count;

    const byCategory = byCategoryRaw.map((c: any) => ({ category: c.category, count: c._count }));
    const byLevel: Record<string, number> = {};
    for (const l of byLevelRaw) if (l.residualRiskLevel) byLevel[l.residualRiskLevel] = l._count;

    // Build 5x5 heatmap
    const heatmapData: Array<{ likelihood: number; consequence: number; count: number; risks: any[] }> = [];
    const heatmapMap: Record<string, any[]> = {};
    for (const r of allOpenRisks) {
      const l = r.residualLikelihoodNum || 3;
      const c = r.residualConsequenceNum || 3;
      const key = `${l}-${c}`;
      if (!heatmapMap[key]) heatmapMap[key] = [];
      heatmapMap[key].push({ id: r.id, title: r.title, ref: r.referenceNumber, level: r.residualRiskLevel });
    }
    for (let l = 1; l <= 5; l++) {
      for (let c = 1; c <= 5; c++) {
        const key = `${l}-${c}`;
        const risks = heatmapMap[key] || [];
        heatmapData.push({ likelihood: l, consequence: c, count: risks.length, risks });
      }
    }

    // Source module breakdown
    const moduleBreakdownRaw = await (prisma as any).riskRegister.groupBy({ by: ['sourceModule'], where: baseWhere, _count: true });
    const moduleBreakdown = moduleBreakdownRaw.map((m: any) => ({ module: m.sourceModule, count: m._count }));

    res.json({
      success: true,
      data: {
        totalRisks,
        byStatus,
        byLevel,
        byCategory,
        exceedsAppetite,
        overdueReview: overdueReviewCount,
        overdueActions: overdueActionsCount,
        kriBreaches: kriRedCount,
        kriWarnings: kriAmberCount,
        heatmapData,
        topRisks,
        recentlyChanged,
        moduleBreakdown,
        newThisMonth,
      },
    });
  } catch (error: any) {
    logger.error('Failed to generate analytics', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to generate analytics dashboard' } });
  }
});

// GET /api/risks/analytics/by-module
router.get('/analytics/by-module', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const raw = await (prisma as any).riskRegister.groupBy({
      by: ['sourceModule'],
      where: { orgId, deletedAt: null, status: { not: 'CLOSED' } },
      _count: true,
    });
    const result = raw.map((r: any) => ({ module: r.sourceModule, count: r._count }));
    res.json({ success: true, data: result });
  } catch (error: any) { logger.error('Failed to fetch by-module', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch module breakdown' } }); }
});

export default router;
