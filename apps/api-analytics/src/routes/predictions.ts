import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { requirePermission } from '@ims/rbac';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AiDisclosure {
  provider: string;
  model: string;
  confidence: number;
  generatedAt: string;
  disclaimer: string;
}

function makeDisclosure(confidence: number): AiDisclosure {
  return {
    provider: 'IMS Predictive Engine',
    model: 'ims-predict-v1',
    confidence,
    generatedAt: new Date().toISOString(),
    disclaimer:
      'AI-generated prediction. Results should be reviewed by a qualified professional before making decisions.',
  };
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_PREDICTIONS = [
  {
    id: 'pred-001',
    type: 'capa_overrun',
    title: 'CAPA overrun risk analysis',
    status: 'COMPLETED',
    createdAt: '2026-02-14T08:00:00Z',
    confidence: 0.82,
  },
  {
    id: 'pred-002',
    type: 'audit_forecast',
    title: 'Q1 2026 audit outcome forecast',
    status: 'COMPLETED',
    createdAt: '2026-02-13T14:30:00Z',
    confidence: 0.76,
  },
  {
    id: 'pred-003',
    type: 'ncr_forecast',
    title: 'March 2026 NCR rate forecast',
    status: 'COMPLETED',
    createdAt: '2026-02-12T09:15:00Z',
    confidence: 0.79,
  },
  {
    id: 'pred-004',
    type: 'capa_overrun',
    title: 'February CAPA overrun predictions',
    status: 'COMPLETED',
    createdAt: '2026-02-10T11:00:00Z',
    confidence: 0.84,
  },
  {
    id: 'pred-005',
    type: 'ncr_forecast',
    title: 'April 2026 NCR forecast (early)',
    status: 'PENDING',
    createdAt: '2026-02-14T10:00:00Z',
    confidence: 0,
  },
];

const SEED_CAPA_OVERRUNS = [
  {
    capaId: 'CAPA-2026-0012',
    title: 'Weld defect root cause — Line 3',
    daysOpen: 42,
    targetDays: 30,
    overrunProbability: 0.91,
    daysAtRisk: 12,
    recommendation:
      'Escalate to Quality Manager. Root cause analysis incomplete — consider 8D methodology.',
    owner: 'Carol Davis',
    module: 'Quality',
  },
  {
    capaId: 'CAPA-2026-0018',
    title: 'Customer complaint — late delivery pattern',
    daysOpen: 28,
    targetDays: 30,
    overrunProbability: 0.73,
    daysAtRisk: 2,
    recommendation: 'Action owner has 3 other overdue items. Reassign or extend deadline.',
    owner: 'George Ops',
    module: 'Quality',
  },
  {
    capaId: 'CAPA-2026-0021',
    title: 'PPE compliance gap in spray booth',
    daysOpen: 35,
    targetDays: 21,
    overrunProbability: 0.95,
    daysAtRisk: 14,
    recommendation:
      'Already overdue. Immediate management review required. Link to incident INV-2026-045.',
    owner: 'Bob Smith',
    module: 'Health & Safety',
  },
  {
    capaId: 'CAPA-2026-0025',
    title: 'Supplier audit finding — raw material traceability',
    daysOpen: 15,
    targetDays: 45,
    overrunProbability: 0.32,
    daysAtRisk: 0,
    recommendation: 'On track. Supplier has submitted corrective action plan.',
    owner: 'Karl Procurement',
    module: 'Quality',
  },
  {
    capaId: 'CAPA-2026-0029',
    title: 'Environmental spill response procedure update',
    daysOpen: 20,
    targetDays: 30,
    overrunProbability: 0.58,
    daysAtRisk: 0,
    recommendation: 'Moderate risk. Procedure drafted but awaiting legal review. Chase legal team.',
    owner: 'Eve Green',
    module: 'Environment',
  },
  {
    capaId: 'CAPA-2026-0033',
    title: 'InfoSec access control review findings',
    daysOpen: 18,
    targetDays: 60,
    overrunProbability: 0.15,
    daysAtRisk: 0,
    recommendation: 'Low risk. Active progress noted. 4 of 7 actions completed.',
    owner: 'Frank Security',
    module: 'Information Security',
  },
];

const SEED_AUDIT_FORECAST = [
  {
    clause: '4.1',
    title: 'Understanding the organization and its context',
    likelyFinding: 'NONE',
    confidence: 0.88,
    rationale: 'Context of organisation document updated in January. SWOT/PESTLE current.',
  },
  {
    clause: '4.2',
    title: 'Understanding needs and expectations of interested parties',
    likelyFinding: 'OBSERVATION',
    confidence: 0.72,
    rationale:
      'Interested parties register last reviewed 8 months ago. Some entries may be outdated.',
  },
  {
    clause: '5.1',
    title: 'Leadership and commitment',
    likelyFinding: 'NONE',
    confidence: 0.91,
    rationale:
      'Management review completed on schedule. Evidence of top management engagement strong.',
  },
  {
    clause: '6.1',
    title: 'Actions to address risks and opportunities',
    likelyFinding: 'MINOR_NC',
    confidence: 0.65,
    rationale:
      'Risk register has 3 risks without documented treatment plans. Risk methodology updated but not fully deployed.',
  },
  {
    clause: '7.2',
    title: 'Competence',
    likelyFinding: 'OBSERVATION',
    confidence: 0.7,
    rationale: 'Training matrix up to date but 4 employees have overdue competency assessments.',
  },
  {
    clause: '8.1',
    title: 'Operational planning and control',
    likelyFinding: 'NONE',
    confidence: 0.85,
    rationale: 'Process documentation comprehensive. Work instructions reviewed within cycle.',
  },
  {
    clause: '8.4',
    title: 'Control of externally provided processes',
    likelyFinding: 'MINOR_NC',
    confidence: 0.68,
    rationale: 'Supplier evaluation schedule shows 2 critical suppliers not assessed this year.',
  },
  {
    clause: '9.1',
    title: 'Monitoring, measurement, analysis and evaluation',
    likelyFinding: 'OBSERVATION',
    confidence: 0.74,
    rationale: 'KPI tracking active but some data collection intervals inconsistent.',
  },
  {
    clause: '9.2',
    title: 'Internal audit',
    likelyFinding: 'NONE',
    confidence: 0.9,
    rationale: 'Audit programme on schedule. Auditor competency records maintained.',
  },
  {
    clause: '10.2',
    title: 'Nonconformity and corrective action',
    likelyFinding: 'MINOR_NC',
    confidence: 0.62,
    rationale:
      'CAPA closure rate at 76% — below 85% target. 3 CAPAs overdue with no extension documented.',
  },
];

const SEED_NCR_FORECAST = {
  currentMonth: {
    month: 'February 2026',
    actualCount: 8,
    forecastCount: 9,
    accuracy: 89,
  },
  nextMonthForecast: {
    month: 'March 2026',
    forecastCount: 11,
    confidenceInterval: { low: 7, high: 15 },
    trend: 'INCREASING',
    trendReason:
      'Seasonal pattern and new supplier onboarding historically correlate with higher NCR rates in Q1.',
  },
  topRiskCategories: [
    { category: 'Supplier Material', forecastCount: 4, percentOfTotal: 36, trend: 'INCREASING' },
    { category: 'Process Deviation', forecastCount: 3, percentOfTotal: 27, trend: 'STABLE' },
    { category: 'Documentation', forecastCount: 2, percentOfTotal: 18, trend: 'DECREASING' },
    { category: 'Customer Complaint', forecastCount: 2, percentOfTotal: 18, trend: 'STABLE' },
  ],
  topRiskSuppliers: [
    { supplier: 'Acme Materials Ltd', riskScore: 0.78, recentNcrs: 3, trend: 'HIGH_RISK' },
    { supplier: 'Global Parts Co', riskScore: 0.45, recentNcrs: 1, trend: 'MODERATE_RISK' },
    { supplier: 'Precision Castings Inc', riskScore: 0.22, recentNcrs: 0, trend: 'LOW_RISK' },
  ],
  historicalTrend: [
    { month: 'Sep 2025', count: 6 },
    { month: 'Oct 2025', count: 7 },
    { month: 'Nov 2025', count: 5 },
    { month: 'Dec 2025', count: 4 },
    { month: 'Jan 2026', count: 9 },
    { month: 'Feb 2026', count: 8 },
  ],
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const generateSchema = z.object({
  type: z.enum(['capa_overrun', 'audit_forecast', 'ncr_forecast']),
  parameters: z.record(z.any()).optional(),
});

// ===================================================================
// GET /api/predictions/capa-overrun — CAPA overrun risk predictions
// ===================================================================

router.get(
  '/capa-overrun',
  requirePermission('analytics', 1),
  async (_req: Request, res: Response) => {
    try {
      const disclosure = makeDisclosure(0.82);

      res.json({
        success: true,
        data: {
          predictions: SEED_CAPA_OVERRUNS,
          summary: {
            totalCapasAnalysed: SEED_CAPA_OVERRUNS.length,
            highRisk: SEED_CAPA_OVERRUNS.filter((c) => c.overrunProbability >= 0.7).length,
            moderateRisk: SEED_CAPA_OVERRUNS.filter(
              (c) => c.overrunProbability >= 0.4 && c.overrunProbability < 0.7
            ).length,
            lowRisk: SEED_CAPA_OVERRUNS.filter((c) => c.overrunProbability < 0.4).length,
            alreadyOverdue: SEED_CAPA_OVERRUNS.filter((c) => c.daysOpen > c.targetDays).length,
          },
          aiDisclosure: disclosure,
        },
      });
    } catch (error: unknown) {
      logger.error('Failed to get CAPA overrun predictions', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get CAPA overrun predictions' },
      });
    }
  }
);

// ===================================================================
// GET /api/predictions/audit-forecast — Audit outcome forecast
// ===================================================================

router.get(
  '/audit-forecast',
  requirePermission('analytics', 1),
  async (_req: Request, res: Response) => {
    try {
      const disclosure = makeDisclosure(0.76);

      const findingsSummary = {
        totalClauses: SEED_AUDIT_FORECAST.length,
        predictedClear: SEED_AUDIT_FORECAST.filter((c) => c.likelyFinding === 'NONE').length,
        predictedObservations: SEED_AUDIT_FORECAST.filter((c) => c.likelyFinding === 'OBSERVATION')
          .length,
        predictedMinorNCs: SEED_AUDIT_FORECAST.filter((c) => c.likelyFinding === 'MINOR_NC').length,
        predictedMajorNCs: SEED_AUDIT_FORECAST.filter((c) => c.likelyFinding === 'MAJOR_NC').length,
        overallReadiness: 82,
      };

      res.json({
        success: true,
        data: {
          standard: 'ISO 9001:2015',
          auditDate: '2026-03-15',
          clauses: SEED_AUDIT_FORECAST,
          summary: findingsSummary,
          aiDisclosure: disclosure,
        },
      });
    } catch (error: unknown) {
      logger.error('Failed to get audit forecast', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit forecast' },
      });
    }
  }
);

// ===================================================================
// GET /api/predictions/ncr-forecast — NCR rate forecast
// ===================================================================

router.get(
  '/ncr-forecast',
  requirePermission('analytics', 1),
  async (_req: Request, res: Response) => {
    try {
      const disclosure = makeDisclosure(0.79);

      res.json({
        success: true,
        data: {
          ...SEED_NCR_FORECAST,
          aiDisclosure: disclosure,
        },
      });
    } catch (error: unknown) {
      logger.error('Failed to get NCR forecast', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get NCR forecast' },
      });
    }
  }
);

// ===================================================================
// GET /api/predictions — List recent predictions
// ===================================================================

router.get('/', requirePermission('analytics', 1), async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: SEED_PREDICTIONS,
      pagination: { page: 1, limit: 50, total: SEED_PREDICTIONS.length, totalPages: 1 },
    });
  } catch (error: unknown) {
    logger.error('Failed to list predictions', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list predictions' },
    });
  }
});

// ===================================================================
// POST /api/predictions/generate — Trigger new prediction run
// ===================================================================

router.post('/generate', requirePermission('analytics', 3), async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const { type, parameters } = parsed.data;

    // In production this would queue a background job.
    // For now, return a stub response indicating the job was accepted.
    const predictionId = `pred-${randomUUID()}`;

    logger.info('Prediction run triggered', { predictionId, type, userId: authReq.user!.id });

    res.status(202).json({
      success: true,
      data: {
        id: predictionId,
        type,
        status: 'QUEUED',
        parameters: parameters || {},
        createdAt: new Date().toISOString(),
        estimatedCompletionSeconds: 30,
        message: `Prediction run '${type}' queued successfully. Results will be available shortly.`,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to trigger prediction run', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to trigger prediction run' },
    });
  }
});

export default router;
