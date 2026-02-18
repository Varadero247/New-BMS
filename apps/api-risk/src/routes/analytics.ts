import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('risk-analytics');

// GET /api/risks/analytics/dashboard
router.get('/analytics/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const baseWhere = { orgId, deletedAt: null };

    const [
      totalRisks, byStatusRaw, byCategoryRaw, byLevelRaw,
      exceedsAppetite, overdueReviewCount, overdueActionsCount,
      kriRedCount, kriAmberCount, topRisks, recentlyChanged,
      allOpenRisks, newThisMonth,
    ] = await Promise.all([
      prisma.riskRegister.count({ where: baseWhere }),
      prisma.riskRegister.groupBy({ by: ['status'], where: baseWhere, _count: true }),
      prisma.riskRegister.groupBy({ by: ['category'], where: baseWhere, _count: true }),
      prisma.riskRegister.groupBy({ by: ['residualRiskLevel'], where: { ...baseWhere, residualRiskLevel: { not: null } }, _count: true }),
      prisma.riskRegister.count({ where: { ...baseWhere, appetiteStatus: 'EXCEEDS' } }),
      prisma.riskRegister.count({ where: { ...baseWhere, nextReviewDate: { lt: new Date() }, status: { not: 'CLOSED' } } }),
      prisma.riskAction.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, targetDate: { lt: new Date() } } }),
      prisma.riskKri.count({ where: { isActive: true, currentStatus: 'RED' } }),
      prisma.riskKri.count({ where: { isActive: true, currentStatus: 'AMBER' } }),
      prisma.riskRegister.findMany({ where: { ...baseWhere, status: { not: 'CLOSED' } }, orderBy: { residualScore: 'desc' }, take: 5, select: { id: true, referenceNumber: true, title: true, residualScore: true, residualRiskLevel: true, category: true, ownerName: true } }),
      prisma.riskRegister.findMany({ where: baseWhere, orderBy: { updatedAt: 'desc' }, take: 10, select: { id: true, referenceNumber: true, title: true, status: true, residualRiskLevel: true, updatedAt: true } }),
      prisma.riskRegister.findMany({ where: { ...baseWhere, status: { not: 'CLOSED' } }, select: { residualLikelihoodNum: true, residualConsequenceNum: true, id: true, title: true, referenceNumber: true, residualRiskLevel: true }, take: 1000 }),
      prisma.riskRegister.count({ where: { ...baseWhere, raisedDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    ]);

    const byStatus: Record<string, number> = {};
    for (const s of byStatusRaw) byStatus[s.status] = (s as any)._count;

    const byCategory = byCategoryRaw.map((c: Record<string, unknown>) => ({ category: c.category, count: (c as any)._count }));
    const byLevel: Record<string, number> = {};
    for (const l of byLevelRaw) if (l.residualRiskLevel) byLevel[l.residualRiskLevel] = (l as any)._count;

    // Build 5x5 heatmap
    const heatmapData: Array<{ likelihood: number; consequence: number; count: number; risks: unknown[] }> = [];
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
    const moduleBreakdownRaw = await prisma.riskRegister.groupBy({ by: ['sourceModule'], where: baseWhere, _count: true });
    const moduleBreakdown = moduleBreakdownRaw.map((m: Record<string, unknown>) => ({ module: m.sourceModule, count: (m as any)._count }));

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
  } catch (error: unknown) {
    logger.error('Failed to generate analytics', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate analytics dashboard' } });
  }
});

// GET /api/risks/analytics/by-module
router.get('/analytics/by-module', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const raw = await prisma.riskRegister.groupBy({
      by: ['sourceModule'],
      where: { orgId, deletedAt: null, status: { not: 'CLOSED' } as any },
      _count: true,
    });
    const result = raw.map((r: Record<string, unknown>) => ({ module: r.sourceModule, count: (r as any)._count }));
    res.json({ success: true, data: result });
  } catch (error: unknown) { logger.error('Failed to fetch by-module', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch module breakdown' } }); }
});

export default router;
