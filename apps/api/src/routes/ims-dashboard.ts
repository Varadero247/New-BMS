import { Router } from 'express';
import { prisma } from '@new-bms/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/stats - Get IMS dashboard statistics
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    // Get compliance scores
    const complianceScores = await prisma.complianceScore.findMany();
    const compliance = {
      iso45001: complianceScores.find((s) => s.standard === 'ISO_45001')?.overallScore || 0,
      iso14001: complianceScores.find((s) => s.standard === 'ISO_14001')?.overallScore || 0,
      iso9001: complianceScores.find((s) => s.standard === 'ISO_9001')?.overallScore || 0,
      overall: 0,
    };
    compliance.overall = Math.round((compliance.iso45001 + compliance.iso14001 + compliance.iso9001) / 3);

    // Get risk statistics
    const [totalRisks, highRisks, criticalRisks, risksByStandard] = await Promise.all([
      prisma.risk.count({ where: { status: 'ACTIVE' } }),
      prisma.risk.count({ where: { status: 'ACTIVE', riskLevel: 'HIGH' } }),
      prisma.risk.count({ where: { status: 'ACTIVE', riskLevel: 'CRITICAL' } }),
      prisma.risk.groupBy({
        by: ['standard'],
        where: { status: 'ACTIVE' },
        _count: { id: true },
      }),
    ]);

    // Get incident statistics
    const [totalIncidents, openIncidents, thisMonthIncidents, incidentsByStandard] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({ where: { status: { not: 'CLOSED' } } }),
      prisma.incident.count({ where: { dateOccurred: { gte: startOfMonth } } }),
      prisma.incident.groupBy({
        by: ['standard'],
        _count: { id: true },
      }),
    ]);

    // Get action statistics
    const [totalActions, openActions, overdueActions, dueThisWeek] = await Promise.all([
      prisma.action.count(),
      prisma.action.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.action.count({
        where: {
          dueDate: { lt: now },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
      prisma.action.count({
        where: {
          dueDate: { gte: now, lte: endOfWeek },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
    ]);

    // Get top 5 highest risks
    const topRisks = await prisma.risk.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { riskScore: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        standard: true,
        riskScore: true,
        riskLevel: true,
        likelihood: true,
        severity: true,
      },
    });

    // Get overdue actions
    const overdueActionsList = await prisma.action.findMany({
      where: {
        dueDate: { lt: now },
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
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
        status: true,
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
          byStandard: risksByStandard.reduce(
            (acc, item) => ({ ...acc, [item.standard]: item._count.id }),
            { ISO_45001: 0, ISO_14001: 0, ISO_9001: 0 }
          ),
        },
        incidents: {
          total: totalIncidents,
          open: openIncidents,
          thisMonth: thisMonthIncidents,
          byStandard: incidentsByStandard.reduce(
            (acc, item) => ({ ...acc, [item.standard]: item._count.id }),
            { ISO_45001: 0, ISO_14001: 0, ISO_9001: 0 }
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
    next(error);
  }
});

// GET /api/dashboard/compliance - Get detailed compliance data
router.get('/compliance', authenticate, async (req, res, next) => {
  try {
    const scores = await prisma.complianceScore.findMany();

    // If no scores exist, calculate them
    if (scores.length === 0) {
      // Return default scores
      return res.json({
        success: true,
        data: {
          ISO_45001: { overallScore: 0, details: {} },
          ISO_14001: { overallScore: 0, details: {} },
          ISO_9001: { overallScore: 0, details: {} },
        },
      });
    }

    const result = scores.reduce((acc, score) => {
      acc[score.standard] = {
        overallScore: score.overallScore,
        details: {
          riskScore: score.riskScore,
          incidentScore: score.incidentScore,
          legalScore: score.legalScore,
          objectiveScore: score.objectiveScore,
          actionScore: score.actionScore,
          trainingScore: score.trainingScore,
          documentScore: score.documentScore,
        },
        totalItems: score.totalItems,
        compliantItems: score.compliantItems,
        calculatedAt: score.calculatedAt,
      };
      return acc;
    }, {} as Record<string, any>);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/summary/:standard - Get standard-specific summary
router.get('/summary/:standard', authenticate, async (req, res, next) => {
  try {
    const { standard } = req.params;

    if (!['ISO_45001', 'ISO_14001', 'ISO_9001'].includes(standard)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STANDARD', message: 'Invalid ISO standard' },
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      risks,
      incidents,
      openIncidents,
      actions,
      openActions,
      overdueActions,
      legalRequirements,
      compliantLegal,
      objectives,
      achievedObjectives,
    ] = await Promise.all([
      prisma.risk.count({ where: { standard: standard as any, status: 'ACTIVE' } }),
      prisma.incident.count({ where: { standard: standard as any } }),
      prisma.incident.count({ where: { standard: standard as any, status: { not: 'CLOSED' } } }),
      prisma.action.count({ where: { standard: standard as any } }),
      prisma.action.count({ where: { standard: standard as any, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.action.count({
        where: {
          standard: standard as any,
          dueDate: { lt: now },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
      prisma.legalRequirement.count({ where: { standard: standard as any } }),
      prisma.legalRequirement.count({
        where: { standard: standard as any, complianceStatus: { in: ['COMPLIANT', 'NOT_APPLICABLE'] } },
      }),
      prisma.objective.count({ where: { standard: standard as any } }),
      prisma.objective.count({ where: { standard: standard as any, status: 'ACHIEVED' } }),
    ]);

    // Get recent incidents
    const recentIncidents = await prisma.incident.findMany({
      where: { standard: standard as any },
      orderBy: { dateOccurred: 'desc' },
      take: 5,
      select: {
        id: true,
        referenceNumber: true,
        title: true,
        type: true,
        severity: true,
        status: true,
        dateOccurred: true,
      },
    });

    // Get high/critical risks
    const topRisks = await prisma.risk.findMany({
      where: {
        standard: standard as any,
        status: 'ACTIVE',
        riskLevel: { in: ['HIGH', 'CRITICAL'] },
      },
      orderBy: { riskScore: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        riskScore: true,
        riskLevel: true,
      },
    });

    res.json({
      success: true,
      data: {
        standard,
        summary: {
          risks: {
            active: risks,
            highCritical: topRisks.length,
          },
          incidents: {
            total: incidents,
            open: openIncidents,
            closureRate: incidents > 0 ? Math.round(((incidents - openIncidents) / incidents) * 100) : 100,
          },
          actions: {
            total: actions,
            open: openActions,
            overdue: overdueActions,
          },
          legal: {
            total: legalRequirements,
            compliant: compliantLegal,
            complianceRate: legalRequirements > 0 ? Math.round((compliantLegal / legalRequirements) * 100) : 100,
          },
          objectives: {
            total: objectives,
            achieved: achievedObjectives,
            achievementRate: objectives > 0 ? Math.round((achievedObjectives / objectives) * 100) : 100,
          },
        },
        recentIncidents,
        topRisks,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
