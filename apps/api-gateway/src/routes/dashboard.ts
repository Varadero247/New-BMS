import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';

const router: IRouter = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats - Get IMS dashboard statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    // Get compliance scores
    const complianceScores = await prisma.complianceScore.findMany();

    const compliance = {
      iso45001: complianceScores.find(s => s.standard === 'ISO_45001')?.overallScore || 0,
      iso14001: complianceScores.find(s => s.standard === 'ISO_14001')?.overallScore || 0,
      iso9001: complianceScores.find(s => s.standard === 'ISO_9001')?.overallScore || 0,
      overall: 0,
    };
    compliance.overall = Math.round((compliance.iso45001 + compliance.iso14001 + compliance.iso9001) / 3);

    // Get risk statistics
    const [totalRisks, highRisks, criticalRisks] = await Promise.all([
      prisma.risk.count({ where: { status: 'ACTIVE' } }),
      prisma.risk.count({ where: { status: 'ACTIVE', riskLevel: 'HIGH' } }),
      prisma.risk.count({ where: { status: 'ACTIVE', riskLevel: 'CRITICAL' } }),
    ]);

    const risksByStandard = await prisma.risk.groupBy({
      by: ['standard'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
    });

    // Get incident statistics
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const [totalIncidents, openIncidents, thisMonthIncidents] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({ where: { status: { not: 'CLOSED' } } }),
      prisma.incident.count({ where: { createdAt: { gte: thisMonthStart } } }),
    ]);

    const incidentsByStandard = await prisma.incident.groupBy({
      by: ['standard'],
      _count: { id: true },
    });

    // Get action statistics
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [totalActions, openActions, overdueActions, dueThisWeek] = await Promise.all([
      prisma.action.count(),
      prisma.action.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
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
    ]);

    // Get top 5 risks
    const topRisks = await prisma.risk.findMany({
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
    });

    // Get overdue actions
    const overdueActionsList = await prisma.action.findMany({
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
    });

    // Get recent AI insights
    const recentAIInsights = await prisma.aIAnalysis.findMany({
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
    });

    res.json({
      success: true,
      data: {
        compliance,
        risks: {
          total: totalRisks,
          high: highRisks,
          critical: criticalRisks,
          byStandard: Object.fromEntries(
            risksByStandard.map(r => [r.standard, r._count.id])
          ),
        },
        incidents: {
          total: totalIncidents,
          open: openIncidents,
          thisMonth: thisMonthIncidents,
          byStandard: Object.fromEntries(
            incidentsByStandard.map(i => [i.standard, i._count.id])
          ),
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
    console.error('Dashboard stats error:', error);
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
    });

    res.json({ success: true, data: complianceScores });
  } catch (error) {
    console.error('Compliance error:', error);
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

    const where: any = { year: currentYear };
    if (standard) where.standard = standard;
    if (metric) where.metric = metric;

    const trends = await prisma.monthlyTrend.findMany({
      where,
      orderBy: [{ standard: 'asc' }, { metric: 'asc' }, { month: 'asc' }],
    });

    res.json({ success: true, data: trends });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get trends data' },
    });
  }
});

export default router;
