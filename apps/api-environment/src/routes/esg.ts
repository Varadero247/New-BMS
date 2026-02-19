import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-environment');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// ESG Category Enum Values
// ============================================

const ESG_CATEGORIES = [
  'GHG_SCOPE_1',
  'GHG_SCOPE_2',
  'GHG_SCOPE_3',
  'ENERGY',
  'WATER',
  'WASTE',
  'BIODIVERSITY',
  'SOCIAL',
  'GOVERNANCE',
] as const;

// ============================================
// Reference Number Generator
// ============================================

async function generateTargetRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.esgTarget.count({
    where: { refNumber: { startsWith: `ESG-TGT-${yymm}` } },
  });
  return `ESG-TGT-${yymm}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// GET /summary — GHG Scope 1/2/3, water, waste, energy KPIs
// ============================================

router.get('/summary', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string, 10) : new Date().getFullYear();

    // Get all metrics for the given year
    const metrics = await prisma.esgMetric.findMany({
      where: {
        period: { startsWith: String(targetYear) },
      },
      orderBy: { period: 'asc' },
      take: 1000,
    });

    // Aggregate by category
    const summary: Record<string, { total: number; unit: string; count: number }> = {};
    for (const m of metrics) {
      const key = `${m.category}`;
      if (!summary[key]) {
        summary[key] = { total: 0, unit: m.unit, count: 0 };
      }
      summary[key].total += m.value;
      summary[key].count += 1;
    }

    // Calculate GHG totals
    const ghgScope1 = summary['GHG_SCOPE_1']?.total ?? 0;
    const ghgScope2 = summary['GHG_SCOPE_2']?.total ?? 0;
    const ghgScope3 = summary['GHG_SCOPE_3']?.total ?? 0;
    const totalGhg = ghgScope1 + ghgScope2 + ghgScope3;

    const energy = summary['ENERGY']?.total ?? 0;
    const water = summary['WATER']?.total ?? 0;
    const waste = summary['WASTE']?.total ?? 0;

    // Get targets for progress context
    const targets = await prisma.esgTarget.findMany({
      where: { deletedAt: null } as any,
      take: 1000,
    });

    const activeTargets = targets.length;
    const achievedTargets = targets.filter((t) => t.status === 'ACHIEVED').length;
    const atRiskTargets = targets.filter(
      (t) => t.status === 'AT_RISK' || t.status === 'OFF_TRACK'
    ).length;

    res.json({
      success: true,
      data: {
        year: targetYear,
        ghg: {
          scope1: ghgScope1,
          scope2: ghgScope2,
          scope3: ghgScope3,
          total: totalGhg,
          unit: 'tCO2e',
        },
        energy: { total: energy, unit: 'MWh' },
        water: { total: water, unit: 'm3' },
        waste: { total: waste, unit: 'tonnes' },
        intensityRatios: {
          carbonIntensity: totalGhg > 0 ? Math.round((totalGhg / (energy || 1)) * 1000) / 1000 : 0,
          waterIntensity: water > 0 ? Math.round((water / (energy || 1)) * 1000) / 1000 : 0,
        },
        targets: {
          total: activeTargets,
          achieved: achievedTargets,
          atRisk: atRiskTargets,
        },
        metricEntries: metrics.length,
      },
    });
  } catch (error) {
    logger.error('ESG summary error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to load ESG summary' },
    });
  }
});

// ============================================
// GET /trends — Monthly trend data for all ESG metrics
// ============================================

router.get('/trends', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { months = '12', category } = req.query;
    const monthCount = Math.min(parseInt(months as string, 10) || 12, 36);

    // Build date range
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthCount + 1, 1);
    const startPeriod = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

    const where: Record<string, unknown> = {
      period: { gte: startPeriod },
    };
    if (category) where.category = category as string;

    const metrics = await prisma.esgMetric.findMany({
      where,
      orderBy: { period: 'asc' },
      take: 1000,
    });

    // Group by period and category
    const trendMap: Record<string, Record<string, number>> = {};
    for (const m of metrics) {
      if (!trendMap[m.period]) trendMap[m.period] = {};
      if (!trendMap[m.period][m.category]) trendMap[m.period][m.category] = 0;
      trendMap[m.period][m.category] += m.value;
    }

    // Convert to array format
    const trends = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, categories]) => ({
        period,
        ...categories,
      }));

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    logger.error('ESG trends error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to load ESG trends' },
    });
  }
});

// ============================================
// GET /targets — Progress against ESG targets
// ============================================

router.get('/targets', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, category, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 50), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (category) where.category = category as any;
    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { subcategory: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [targets, total] = await Promise.all([
      prisma.esgTarget.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.esgTarget.count({ where }),
    ]);

    // Calculate progress for each target
    const targetsWithProgress = targets.map((t) => {
      const current = t.currentValue ?? t.baselineValue;
      const range = Math.abs(t.targetValue - t.baselineValue);
      const progress =
        range > 0
          ? Math.min(
              100,
              Math.max(0, Math.round((Math.abs(current - t.baselineValue) / range) * 100))
            )
          : 0;
      return { ...t, progressPercent: progress };
    });

    res.json({
      success: true,
      data: targetsWithProgress,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('ESG targets list error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list ESG targets' },
    });
  }
});

// ============================================
// POST /targets — Set ESG target
// ============================================

router.post('/targets', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      category: z.enum(ESG_CATEGORIES),
      subcategory: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      baselineValue: z.number(),
      baselineYear: z.number().int().min(2000).max(2100),
      targetValue: z.number().nonnegative(),
      targetYear: z.number().int().min(2000).max(2100),
      unit: z.string().trim().min(1).max(200),
      status: z.enum(['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'ACHIEVED', 'CANCELLED']).optional(),
      currentValue: z.number().nonnegative().optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateTargetRefNumber();

    const target = await prisma.esgTarget.create({
      data: {
        refNumber,
        category: data.category as any,
        subcategory: data.subcategory,
        description: data.description,
        baselineValue: data.baselineValue,
        baselineYear: data.baselineYear,
        targetValue: data.targetValue,
        targetYear: data.targetYear,
        unit: data.unit,
        status: (data.status as any) || 'ON_TRACK',
        currentValue: data.currentValue ?? data.baselineValue,
        notes: data.notes,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: target });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create ESG target error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create ESG target' },
    });
  }
});

// ============================================
// PUT /targets/:id — Update target
// ============================================

router.put(
  '/targets/:id',
  checkOwnership(prisma.esgTarget as any),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.esgTarget.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'ESG target not found' } });
      }

      const schema = z.object({
        category: z.enum(ESG_CATEGORIES).optional(),
        subcategory: z.string().trim().min(1).max(200).optional(),
        description: z.string().trim().min(1).max(2000).optional(),
        baselineValue: z.number().optional(),
        baselineYear: z.number().int().min(2000).max(2100).optional(),
        targetValue: z.number().nonnegative().optional(),
        targetYear: z.number().int().min(2000).max(2100).optional(),
        unit: z.string().trim().min(1).max(200).optional(),
        status: z.enum(['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'ACHIEVED', 'CANCELLED']).optional(),
        currentValue: z.number().nonnegative().optional(),
        notes: z.string().trim().optional(),
      });

      const data = schema.parse(req.body);

      const target = await prisma.esgTarget.update({
        where: { id: req.params.id },
        data: data as any,
      });

      res.json({ success: true, data: target });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: error.errors.map((e) => e.path.join('.')),
          },
        });
      }
      logger.error('Update ESG target error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update ESG target' },
      });
    }
  }
);

// ============================================
// GET /report — Auto-generate ESG report data (GRI/TCFD aligned)
// ============================================

router.get('/report', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string, 10) : new Date().getFullYear();

    // Get all metrics for the year
    const metrics = await prisma.esgMetric.findMany({
      where: { period: { startsWith: String(targetYear) } },
      orderBy: { period: 'asc' },
      take: 1000,
    });

    // Get previous year for YoY comparison
    const prevMetrics = await prisma.esgMetric.findMany({
      where: { period: { startsWith: String(targetYear - 1) } },
      take: 1000,
    });

    // Get targets
    const targets = await prisma.esgTarget.findMany({
      where: { deletedAt: null } as any,
      take: 1000,
    });

    // Aggregate current year by category
    const currentTotals: Record<string, number> = {};
    for (const m of metrics) {
      if (!currentTotals[m.category]) currentTotals[m.category] = 0;
      currentTotals[m.category] += m.value;
    }

    // Aggregate previous year by category
    const prevTotals: Record<string, number> = {};
    for (const m of prevMetrics) {
      if (!prevTotals[m.category]) prevTotals[m.category] = 0;
      prevTotals[m.category] += m.value;
    }

    // Calculate year-over-year changes
    const yoyChanges: Record<
      string,
      { current: number; previous: number; changePercent: number | null }
    > = {};
    for (const cat of ESG_CATEGORIES) {
      const current = currentTotals[cat] ?? 0;
      const previous = prevTotals[cat] ?? 0;
      yoyChanges[cat] = {
        current,
        previous,
        changePercent:
          previous > 0 ? Math.round(((current - previous) / previous) * 10000) / 100 : null,
      };
    }

    // GRI Standards alignment
    const griDisclosures = {
      'GRI 302': {
        title: 'Energy',
        value: currentTotals['ENERGY'] ?? 0,
        unit: 'MWh',
        disclosure: '302-1: Energy consumption within the organization',
      },
      'GRI 303': {
        title: 'Water and Effluents',
        value: currentTotals['WATER'] ?? 0,
        unit: 'm3',
        disclosure: '303-3: Water withdrawal',
      },
      'GRI 305': {
        title: 'Emissions',
        scope1: currentTotals['GHG_SCOPE_1'] ?? 0,
        scope2: currentTotals['GHG_SCOPE_2'] ?? 0,
        scope3: currentTotals['GHG_SCOPE_3'] ?? 0,
        unit: 'tCO2e',
        disclosure: '305-1/2/3: Direct & Indirect GHG Emissions',
      },
      'GRI 306': {
        title: 'Waste',
        value: currentTotals['WASTE'] ?? 0,
        unit: 'tonnes',
        disclosure: '306-3: Waste generated',
      },
    };

    // TCFD alignment
    const tcfd = {
      governance: 'ESG targets set and monitored through integrated management system',
      strategy: `${targets.length} active targets across ${new Set(targets.map((t) => t.category)).size} ESG categories`,
      riskManagement: `${targets.filter((t) => t.status === 'AT_RISK' || t.status === 'OFF_TRACK').length} targets require attention`,
      metricsAndTargets: {
        totalGhg:
          (currentTotals['GHG_SCOPE_1'] ?? 0) +
          (currentTotals['GHG_SCOPE_2'] ?? 0) +
          (currentTotals['GHG_SCOPE_3'] ?? 0),
        unit: 'tCO2e',
        targetCount: targets.length,
        achievedCount: targets.filter((t) => t.status === 'ACHIEVED').length,
      },
    };

    res.json({
      success: true,
      data: {
        reportYear: targetYear,
        generatedAt: new Date().toISOString(),
        summary: {
          totalMetricEntries: metrics.length,
          categoriesCovered: Object.keys(currentTotals).length,
          activeTargets: targets.length,
        },
        yearOverYear: yoyChanges,
        gri: griDisclosures,
        tcfd,
        targets: targets.map((t) => ({
          refNumber: t.refNumber,
          category: t.category,
          description: t.description,
          baselineValue: t.baselineValue,
          targetValue: t.targetValue,
          currentValue: t.currentValue,
          status: t.status,
          unit: t.unit,
        })),
      },
    });
  } catch (error) {
    logger.error('ESG report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate ESG report' },
    });
  }
});

// ============================================
// POST /metrics — Record ESG metric data point
// ============================================

router.post('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      category: z.enum(ESG_CATEGORIES),
      subcategory: z.string().trim().min(1).max(200),
      period: z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'),
      value: z.number(),
      unit: z.string().trim().min(1).max(200),
      source: z.string().trim().optional(),
      verified: z.boolean().optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const metric = await prisma.esgMetric.create({
      data: {
        category: data.category as any,
        subcategory: data.subcategory,
        period: data.period,
        value: data.value,
        unit: data.unit,
        source: data.source,
        verified: data.verified ?? false,
        notes: data.notes,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create ESG metric error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create ESG metric' },
    });
  }
});

// ============================================
// GET /metrics — List metric data points with filters
// ============================================

router.get('/metrics', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', category, period, subcategory, verified } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 50), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (category) where.category = category as any;
    if (period) where.period = period as string;
    if (subcategory) where.subcategory = { contains: subcategory as string, mode: 'insensitive' };
    if (verified === 'true') where.verified = true;
    if (verified === 'false') where.verified = false;

    const [metrics, total] = await Promise.all([
      prisma.esgMetric.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ period: 'desc' }, { category: 'asc' }],
      }),
      prisma.esgMetric.count({ where }),
    ]);

    res.json({
      success: true,
      data: metrics,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List ESG metrics error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list ESG metrics' },
    });
  }
});

export default router;
