/**
 * TODO: ARCHITECTURAL DEBT — HIGH PRIORITY
 * ==========================================
 * This file contains business/aggregation logic in the API Gateway.
 * The gateway should be a pure routing layer (proxy only).
 *
 * Correct solution: Create apps/api-dashboard/ service (port 4010)
 *   - Move all aggregation queries to the dedicated service
 *   - Gateway proxies /api/dashboard/* → api-dashboard:4010
 *   - Estimated effort: 8h (Sprint 1)
 *
 * Tracking: System Review Finding #4
 */
import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-gateway');

const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats - Get IMS dashboard statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    // Compute date boundaries before the parallel query block
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Run ALL independent queries in parallel
    const [
      complianceScores,
      [totalRisks, highRisks, criticalRisks],
      risksByStandard,
      [totalIncidents, openIncidents, thisMonthIncidents],
      incidentsByStandard,
      [totalActions, openActions, overdueActions, dueThisWeek],
      topRisks,
      overdueActionsList,
      recentAIInsights,
    ] = await Promise.all([
      // Compliance scores
      prisma.complianceScore.findMany({ take: 100 }),

      // Risk counts
      Promise.all([
        prisma.risk.count({ where: { status: 'ACTIVE' } }),
        prisma.risk.count({ where: { status: 'ACTIVE', riskLevel: 'HIGH' } }),
        prisma.risk.count({ where: { status: 'ACTIVE', riskLevel: 'CRITICAL' } }),
      ]),

      // Risks grouped by standard
      prisma.risk.groupBy({
        by: ['standard'],
        where: { status: 'ACTIVE' },
        _count: { id: true },
      }),

      // Incident counts
      Promise.all([
        prisma.incident.count(),
        prisma.incident.count({ where: { status: { not: 'CLOSED' } } }),
        prisma.incident.count({ where: { createdAt: { gte: thisMonthStart } } }),
      ]),

      // Incidents grouped by standard
      prisma.incident.groupBy({
        by: ['standard'],
        _count: { id: true },
      }),

      // Action counts
      Promise.all([
        prisma.action.count(),
        prisma.action.count({
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        }),
        prisma.action.count({
          where: {
            status: { in: ['OPEN', 'IN_PROGRESS'] },
            dueDate: { lt: now },
          },
        }),
        prisma.action.count({
          where: {
            status: { in: ['OPEN', 'IN_PROGRESS'] },
            dueDate: { gte: now, lte: weekFromNow },
          },
        }),
      ]),

      // Top 5 risks
      prisma.risk.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { riskScore: 'desc' },
        take: 5,
        select: {
          id: true,
          standard: true,
          title: true,
          riskScore: true,
          riskLevel: true,
        },
      }),

      // Overdue actions
      prisma.action.findMany({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          dueDate: { lt: now },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          dueDate: true,
          standard: true,
          priority: true,
        },
      }),

      // Recent AI insights
      prisma.aIAnalysis.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          sourceType: true,
          sourceId: true,
          suggestedRootCause: true,
          createdAt: true,
        },
      }),
    ]);

    const compliance = {
      iso45001: complianceScores.find((s) => s.standard === 'ISO_45001')?.overallScore || 0,
      iso14001: complianceScores.find((s) => s.standard === 'ISO_14001')?.overallScore || 0,
      iso9001: complianceScores.find((s) => s.standard === 'ISO_9001')?.overallScore || 0,
      overall: 0,
    };
    compliance.overall = Math.round(
      (compliance.iso45001 + compliance.iso14001 + compliance.iso9001) / 3
    );

    res.json({
      success: true,
      data: {
        compliance,
        risks: {
          total: totalRisks,
          high: highRisks,
          critical: criticalRisks,
          byStandard: Object.fromEntries(risksByStandard.map((r) => [r.standard, r._count.id])),
        },
        incidents: {
          total: totalIncidents,
          open: openIncidents,
          thisMonth: thisMonthIncidents,
          byStandard: Object.fromEntries(incidentsByStandard.map((i) => [i.standard, i._count.id])),
        },
        actions: {
          total: totalActions,
          open: openActions,
          overdue: overdueActions,
          dueThisWeek,
        },
        topRisks,
        overdueActions: overdueActionsList,
        recentAIInsights,
      },
    });
  } catch (error) {
    logger.error('Dashboard stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard stats' },
    });
  }
});

// GET /api/dashboard/compliance - Get compliance summary
router.get('/compliance', async (req: AuthRequest, res: Response) => {
  try {
    const complianceScores = await prisma.complianceScore.findMany({
      orderBy: { standard: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: complianceScores });
  } catch (error) {
    logger.error('Compliance error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get compliance data' },
    });
  }
});

// GET /api/dashboard/trends - Get monthly trends
router.get('/trends', async (req: AuthRequest, res: Response) => {
  try {
    const { standard, metric, year } = req.query;
    const currentYear = year ? parseInt(year as string, 10) : new Date().getFullYear();

    const where: Record<string, unknown> = { year: currentYear };
    if (standard) where.standard = standard as string;
    if (metric) where.metric = metric as string;

    const trends = await prisma.monthlyTrend.findMany({
      where: where as Parameters<typeof prisma.monthlyTrend.findMany>[0]['where'],
      orderBy: [{ standard: 'asc' }, { metric: 'asc' }, { month: 'asc' }],
      take: 120,
    });

    res.json({ success: true, data: trends });
  } catch (error) {
    logger.error('Trends error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get trends data' },
    });
  }
});

export default router;
