import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@new-bms/database';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ===== SAFETY METRICS (H&S - ISO 45001) =====

const safetyMetricSchema = z.object({
  year: z.number().min(2000).max(2100),
  month: z.number().min(1).max(12),
  hoursWorked: z.number().min(0),
  lostTimeInjuries: z.number().min(0).default(0),
  totalRecordableInjuries: z.number().min(0).default(0),
  daysLost: z.number().min(0).default(0),
  nearMisses: z.number().min(0).default(0),
  firstAidCases: z.number().min(0).default(0),
});

// Calculate safety rates
function calculateSafetyRates(data: {
  hoursWorked: number;
  lostTimeInjuries: number;
  totalRecordableInjuries: number;
  daysLost: number;
}) {
  const { hoursWorked, lostTimeInjuries, totalRecordableInjuries, daysLost } = data;

  if (hoursWorked === 0) {
    return { ltifr: 0, trir: 0, severityRate: 0 };
  }

  // LTIFR = (Lost Time Injuries × 1,000,000) / Hours Worked
  const ltifr = (lostTimeInjuries * 1000000) / hoursWorked;

  // TRIR = (Total Recordable Injuries × 200,000) / Hours Worked
  const trir = (totalRecordableInjuries * 200000) / hoursWorked;

  // Severity Rate = (Days Lost × 1,000,000) / Hours Worked
  const severityRate = (daysLost * 1000000) / hoursWorked;

  return {
    ltifr: Math.round(ltifr * 100) / 100,
    trir: Math.round(trir * 100) / 100,
    severityRate: Math.round(severityRate * 100) / 100,
  };
}

// GET /api/metrics/safety - List safety metrics
router.get('/safety', authenticate, async (req, res, next) => {
  try {
    const { year, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (year) where.year = parseInt(year as string);

    const [metrics, total] = await Promise.all([
      prisma.safetyMetric.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      prisma.safetyMetric.count({ where }),
    ]);

    res.json({
      success: true,
      data: metrics,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/metrics/safety/summary - Get safety summary
router.get('/safety/summary', authenticate, async (req, res, next) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const metrics = await prisma.safetyMetric.findMany({
      where: { year: targetYear },
      orderBy: { month: 'asc' },
    });

    // Calculate YTD totals
    const ytd = metrics.reduce(
      (acc, m) => ({
        hoursWorked: acc.hoursWorked + m.hoursWorked,
        lostTimeInjuries: acc.lostTimeInjuries + m.lostTimeInjuries,
        totalRecordableInjuries: acc.totalRecordableInjuries + m.totalRecordableInjuries,
        daysLost: acc.daysLost + m.daysLost,
        nearMisses: acc.nearMisses + m.nearMisses,
        firstAidCases: acc.firstAidCases + m.firstAidCases,
      }),
      {
        hoursWorked: 0,
        lostTimeInjuries: 0,
        totalRecordableInjuries: 0,
        daysLost: 0,
        nearMisses: 0,
        firstAidCases: 0,
      }
    );

    const ytdRates = calculateSafetyRates(ytd);

    // Get previous year for comparison
    const previousYearMetrics = await prisma.safetyMetric.findMany({
      where: { year: targetYear - 1 },
    });

    const previousYtd = previousYearMetrics.reduce(
      (acc, m) => ({
        hoursWorked: acc.hoursWorked + m.hoursWorked,
        lostTimeInjuries: acc.lostTimeInjuries + m.lostTimeInjuries,
        totalRecordableInjuries: acc.totalRecordableInjuries + m.totalRecordableInjuries,
        daysLost: acc.daysLost + m.daysLost,
      }),
      { hoursWorked: 0, lostTimeInjuries: 0, totalRecordableInjuries: 0, daysLost: 0 }
    );

    const previousRates = calculateSafetyRates(previousYtd);

    res.json({
      success: true,
      data: {
        year: targetYear,
        ytd: {
          ...ytd,
          ...ytdRates,
        },
        monthlyTrend: metrics.map((m) => ({
          month: m.month,
          ltifr: m.ltifr,
          trir: m.trir,
          severityRate: m.severityRate,
          nearMisses: m.nearMisses,
        })),
        comparison: {
          previousYear: targetYear - 1,
          ltifrChange: previousRates.ltifr > 0
            ? Math.round(((ytdRates.ltifr - previousRates.ltifr) / previousRates.ltifr) * 100)
            : 0,
          trirChange: previousRates.trir > 0
            ? Math.round(((ytdRates.trir - previousRates.trir) / previousRates.trir) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/metrics/safety - Create/update safety metric
router.post('/safety', authenticate, requireRole(['ADMIN', 'MANAGER']), validate(safetyMetricSchema), async (req, res, next) => {
  try {
    const rates = calculateSafetyRates(req.body);

    const metric = await prisma.safetyMetric.upsert({
      where: {
        year_month: {
          year: req.body.year,
          month: req.body.month,
        },
      },
      create: {
        ...req.body,
        ...rates,
      },
      update: {
        ...req.body,
        ...rates,
      },
    });

    res.json({ success: true, data: metric });
  } catch (error) {
    next(error);
  }
});

// ===== QUALITY METRICS (ISO 9001) =====

const qualityMetricSchema = z.object({
  year: z.number().min(2000).max(2100),
  month: z.number().min(1).max(12),
  preventionCost: z.number().min(0).default(0),
  appraisalCost: z.number().min(0).default(0),
  internalFailureCost: z.number().min(0).default(0),
  externalFailureCost: z.number().min(0).default(0),
  totalUnits: z.number().min(0).default(0),
  defectiveUnits: z.number().min(0).default(0),
  defectOpportunities: z.number().min(1).default(1),
});

// Calculate quality metrics
function calculateQualityMetrics(data: {
  preventionCost: number;
  appraisalCost: number;
  internalFailureCost: number;
  externalFailureCost: number;
  totalUnits: number;
  defectiveUnits: number;
  defectOpportunities: number;
}) {
  const {
    preventionCost,
    appraisalCost,
    internalFailureCost,
    externalFailureCost,
    totalUnits,
    defectiveUnits,
    defectOpportunities,
  } = data;

  // COPQ = Prevention + Appraisal + Internal Failure + External Failure
  const totalCOPQ = preventionCost + appraisalCost + internalFailureCost + externalFailureCost;

  // DPMO = (Defects × 1,000,000) / (Units × Opportunities)
  const dpmo =
    totalUnits > 0 && defectOpportunities > 0
      ? (defectiveUnits * 1000000) / (totalUnits * defectOpportunities)
      : 0;

  // First Pass Yield = ((Total - Defective) / Total) × 100
  const firstPassYield = totalUnits > 0 ? ((totalUnits - defectiveUnits) / totalUnits) * 100 : 100;

  // Process Sigma from DPMO (simplified lookup)
  const processSigma = dpmoToSigma(dpmo);

  return {
    totalCOPQ: Math.round(totalCOPQ * 100) / 100,
    dpmo: Math.round(dpmo),
    firstPassYield: Math.round(firstPassYield * 100) / 100,
    processSigma: Math.round(processSigma * 100) / 100,
  };
}

// DPMO to Sigma conversion (simplified)
function dpmoToSigma(dpmo: number): number {
  if (dpmo <= 3.4) return 6.0;
  if (dpmo <= 233) return 5.0;
  if (dpmo <= 6210) return 4.0;
  if (dpmo <= 66807) return 3.0;
  if (dpmo <= 308538) return 2.0;
  if (dpmo <= 690000) return 1.0;
  return 0;
}

// GET /api/metrics/quality - List quality metrics
router.get('/quality', authenticate, async (req, res, next) => {
  try {
    const { year, page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (year) where.year = parseInt(year as string);

    const [metrics, total] = await Promise.all([
      prisma.qualityMetric.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      prisma.qualityMetric.count({ where }),
    ]);

    res.json({
      success: true,
      data: metrics,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/metrics/quality/summary - Get quality summary
router.get('/quality/summary', authenticate, async (req, res, next) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const metrics = await prisma.qualityMetric.findMany({
      where: { year: targetYear },
      orderBy: { month: 'asc' },
    });

    // Calculate YTD totals
    const ytd = metrics.reduce(
      (acc, m) => ({
        preventionCost: acc.preventionCost + m.preventionCost,
        appraisalCost: acc.appraisalCost + m.appraisalCost,
        internalFailureCost: acc.internalFailureCost + m.internalFailureCost,
        externalFailureCost: acc.externalFailureCost + m.externalFailureCost,
        totalUnits: acc.totalUnits + m.totalUnits,
        defectiveUnits: acc.defectiveUnits + m.defectiveUnits,
        defectOpportunities: m.defectOpportunities, // Use latest
      }),
      {
        preventionCost: 0,
        appraisalCost: 0,
        internalFailureCost: 0,
        externalFailureCost: 0,
        totalUnits: 0,
        defectiveUnits: 0,
        defectOpportunities: 1,
      }
    );

    const ytdMetrics = calculateQualityMetrics(ytd);

    res.json({
      success: true,
      data: {
        year: targetYear,
        ytd: {
          ...ytd,
          ...ytdMetrics,
        },
        monthlyTrend: metrics.map((m) => ({
          month: m.month,
          totalCOPQ: m.totalCOPQ,
          dpmo: m.dpmo,
          firstPassYield: m.firstPassYield,
          processSigma: m.processSigma,
        })),
        copqBreakdown: {
          prevention: ytd.preventionCost,
          appraisal: ytd.appraisalCost,
          internalFailure: ytd.internalFailureCost,
          externalFailure: ytd.externalFailureCost,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/metrics/quality - Create/update quality metric
router.post('/quality', authenticate, requireRole(['ADMIN', 'MANAGER']), validate(qualityMetricSchema), async (req, res, next) => {
  try {
    const calculated = calculateQualityMetrics(req.body);

    const metric = await prisma.qualityMetric.upsert({
      where: {
        year_month: {
          year: req.body.year,
          month: req.body.month,
        },
      },
      create: {
        ...req.body,
        ...calculated,
      },
      update: {
        ...req.body,
        ...calculated,
      },
    });

    res.json({ success: true, data: metric });
  } catch (error) {
    next(error);
  }
});

// ===== COMPLIANCE SCORES =====

// GET /api/metrics/compliance - Get compliance scores
router.get('/compliance', authenticate, async (req, res, next) => {
  try {
    const scores = await prisma.complianceScore.findMany({
      orderBy: { calculatedAt: 'desc' },
    });

    // If no scores, return defaults
    if (scores.length === 0) {
      return res.json({
        success: true,
        data: [
          { standard: 'ISO_45001', overallScore: 0, calculatedAt: new Date() },
          { standard: 'ISO_14001', overallScore: 0, calculatedAt: new Date() },
          { standard: 'ISO_9001', overallScore: 0, calculatedAt: new Date() },
        ],
      });
    }

    res.json({ success: true, data: scores });
  } catch (error) {
    next(error);
  }
});

// POST /api/metrics/compliance/calculate - Calculate compliance scores
router.post('/compliance/calculate', authenticate, async (req, res, next) => {
  try {
    const standards = ['ISO_45001', 'ISO_14001', 'ISO_9001'] as const;
    const results = [];

    for (const standard of standards) {
      // Count various compliance indicators
      const [
        totalRisks,
        mitigatedRisks,
        totalIncidents,
        closedIncidents,
        totalLegal,
        compliantLegal,
        totalObjectives,
        achievedObjectives,
        totalActions,
        completedActions,
      ] = await Promise.all([
        prisma.risk.count({ where: { standard } }),
        prisma.risk.count({ where: { standard, status: { in: ['MITIGATED', 'CLOSED', 'ACCEPTED'] } } }),
        prisma.incident.count({ where: { standard } }),
        prisma.incident.count({ where: { standard, status: 'CLOSED' } }),
        prisma.legalRequirement.count({ where: { standard } }),
        prisma.legalRequirement.count({ where: { standard, complianceStatus: { in: ['COMPLIANT', 'NOT_APPLICABLE'] } } }),
        prisma.objective.count({ where: { standard } }),
        prisma.objective.count({ where: { standard, status: 'ACHIEVED' } }),
        prisma.action.count({ where: { standard } }),
        prisma.action.count({ where: { standard, status: { in: ['COMPLETED', 'VERIFIED'] } } }),
      ]);

      // Calculate component scores
      const riskScore = totalRisks > 0 ? (mitigatedRisks / totalRisks) * 100 : 100;
      const incidentScore = totalIncidents > 0 ? (closedIncidents / totalIncidents) * 100 : 100;
      const legalScore = totalLegal > 0 ? (compliantLegal / totalLegal) * 100 : 100;
      const objectiveScore = totalObjectives > 0 ? (achievedObjectives / totalObjectives) * 100 : 100;
      const actionScore = totalActions > 0 ? (completedActions / totalActions) * 100 : 100;

      // Weighted overall score
      const weights = { risk: 0.2, incident: 0.2, legal: 0.25, objective: 0.15, action: 0.2 };
      const overallScore =
        riskScore * weights.risk +
        incidentScore * weights.incident +
        legalScore * weights.legal +
        objectiveScore * weights.objective +
        actionScore * weights.action;

      const totalItems = totalRisks + totalIncidents + totalLegal + totalObjectives + totalActions;
      const compliantItems = mitigatedRisks + closedIncidents + compliantLegal + achievedObjectives + completedActions;

      // Upsert compliance score
      const score = await prisma.complianceScore.upsert({
        where: { standard },
        create: {
          standard,
          overallScore: Math.round(overallScore),
          riskScore: Math.round(riskScore),
          incidentScore: Math.round(incidentScore),
          legalScore: Math.round(legalScore),
          objectiveScore: Math.round(objectiveScore),
          actionScore: Math.round(actionScore),
          totalItems,
          compliantItems,
        },
        update: {
          overallScore: Math.round(overallScore),
          riskScore: Math.round(riskScore),
          incidentScore: Math.round(incidentScore),
          legalScore: Math.round(legalScore),
          objectiveScore: Math.round(objectiveScore),
          actionScore: Math.round(actionScore),
          totalItems,
          compliantItems,
          calculatedAt: new Date(),
        },
      });

      results.push(score);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

export default router;
