import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const benchmarkCreateSchema = z.object({
  name: z.string().min(1).max(200),
  module: z.string().min(1).max(100),
  metric: z.string().min(1).max(200),
  industryAverage: z.number(),
  topPerformer: z.number(),
  currentValue: z.number().optional().nullable(),
  unit: z.string().max(50).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
  year: z.number().int().min(2000).max(2100).optional(),
});

// ---------------------------------------------------------------------------
// Industry benchmark data (built-in)
// ---------------------------------------------------------------------------

const INDUSTRY_BENCHMARKS: Record<string, any[]> = {
  HEALTH_SAFETY: [
    { metric: 'Total Recordable Incident Rate (TRIR)', industryAverage: 3.0, topPerformer: 0.5, unit: 'per 200k hours' },
    { metric: 'Lost Time Injury Frequency Rate (LTIFR)', industryAverage: 1.2, topPerformer: 0.1, unit: 'per million hours' },
    { metric: 'Near Miss Reporting Rate', industryAverage: 10, topPerformer: 50, unit: 'per 100 employees' },
    { metric: 'Safety Training Completion', industryAverage: 85, topPerformer: 99, unit: '%' },
  ],
  ENVIRONMENT: [
    { metric: 'Carbon Emissions Intensity', industryAverage: 120, topPerformer: 30, unit: 'tCO2e/revenue $M' },
    { metric: 'Waste Diversion Rate', industryAverage: 60, topPerformer: 95, unit: '%' },
    { metric: 'Water Use Intensity', industryAverage: 500, topPerformer: 100, unit: 'm3/revenue $M' },
    { metric: 'Environmental Compliance Rate', industryAverage: 92, topPerformer: 100, unit: '%' },
  ],
  QUALITY: [
    { metric: 'First Pass Yield', industryAverage: 90, topPerformer: 99.5, unit: '%' },
    { metric: 'Customer Complaint Rate', industryAverage: 5, topPerformer: 0.5, unit: 'per 1000 units' },
    { metric: 'CAPA Closure Rate (30 days)', industryAverage: 70, topPerformer: 95, unit: '%' },
    { metric: 'Audit Finding Closure', industryAverage: 80, topPerformer: 98, unit: '%' },
  ],
  HR: [
    { metric: 'Employee Turnover Rate', industryAverage: 15, topPerformer: 5, unit: '%' },
    { metric: 'Training Hours per Employee', industryAverage: 40, topPerformer: 80, unit: 'hours/year' },
    { metric: 'Employee Engagement Score', industryAverage: 65, topPerformer: 90, unit: '%' },
  ],
  FINANCE: [
    { metric: 'Operating Margin', industryAverage: 12, topPerformer: 25, unit: '%' },
    { metric: 'Days Sales Outstanding (DSO)', industryAverage: 45, topPerformer: 25, unit: 'days' },
    { metric: 'Return on Assets (ROA)', industryAverage: 8, topPerformer: 18, unit: '%' },
  ],
};

// ===================================================================
// GET /api/benchmarks — All industry benchmarks
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    // Fetch any custom benchmarks from KPIs
    const kpis = await prisma.analyticsKpi.findMany({
      where: { deletedAt: null } as any,
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
      take: Math.min(Number(req.query.limit) || 50, 200),
      skip: Number(req.query.offset) || 0,
    });

    const customBenchmarks: Record<string, any[]> = {};
    for (const kpi of kpis) {
      if (!customBenchmarks[kpi.module]) customBenchmarks[kpi.module] = [];
      customBenchmarks[kpi.module].push({
        metric: kpi.name,
        currentValue: kpi.currentValue ? Number(kpi.currentValue) : null,
        targetValue: kpi.targetValue ? Number(kpi.targetValue) : null,
        trend: kpi.trend,
        unit: kpi.unit,
      });
    }

    res.json({
      success: true,
      data: {
        industry: INDUSTRY_BENCHMARKS,
        organization: customBenchmarks,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get benchmarks', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get benchmarks' } });
  }
});

// ===================================================================
// GET /api/benchmarks/:module — Module-specific benchmarks
// ===================================================================

router.get('/:module', async (req: Request, res: Response) => {
  try {
    const { module } = req.params;
    const moduleKey = module.toUpperCase();

    const industryData = INDUSTRY_BENCHMARKS[moduleKey] || [];

    const kpis = await prisma.analyticsKpi.findMany({
      where: { module: moduleKey, deletedAt: null } as any,
      orderBy: { name: 'asc' },
      take: Math.min(Number(req.query.limit) || 50, 200),
      skip: Number(req.query.offset) || 0,
    });

    const orgData = kpis.map((kpi) => ({
      metric: kpi.name,
      currentValue: kpi.currentValue ? Number(kpi.currentValue) : null,
      targetValue: kpi.targetValue ? Number(kpi.targetValue) : null,
      trend: kpi.trend,
      unit: kpi.unit,
    }));

    res.json({
      success: true,
      data: {
        module: moduleKey,
        industry: industryData,
        organization: orgData,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get module benchmarks', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get module benchmarks' } });
  }
});

// ===================================================================
// POST /api/benchmarks — Create custom benchmark (stored as KPI)
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = benchmarkCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const data = parsed.data;

    // Determine trend
    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    if (data.currentValue != null) {
      if (data.currentValue > data.industryAverage) trend = 'UP';
      else if (data.currentValue < data.industryAverage) trend = 'DOWN';
    }

    const kpi = await prisma.analyticsKpi.create({
      data: {
        name: data.name,
        description: `Benchmark: ${data.metric}`,
        module: data.module,
        formula: null,
        unit: data.unit || null,
        currentValue: data.currentValue != null ? data.currentValue : null,
        targetValue: data.topPerformer,
        previousValue: data.industryAverage,
        trend,
        frequency: 'MONTHLY',
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Custom benchmark created', { id: kpi.id, name: kpi.name });
    res.status(201).json({ success: true, data: kpi });
  } catch (error: unknown) {
    logger.error('Failed to create benchmark', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create benchmark' } });
  }
});

export default router;
