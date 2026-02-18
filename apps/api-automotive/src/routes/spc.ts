import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';
import {
  xbarRChart,
  iMrChart,
  pChart,
  calculateCpk,
  calculatePpk,
  detectWesternElectricRules,
} from '@ims/spc-engine';
import type { DataPoint, PChartDataPoint } from '@ims/spc-engine';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Helper: generate SPC reference number SPC-YYMM-XXXX
// ============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `SPC-${yy}${mm}`;

  const count = await prisma.spcChart.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createChartSchema = z.object({
  title: z.string().trim().min(1).max(200),
  partNumber: z.string().trim().min(1).max(200),
  partName: z.string().optional(),
  characteristic: z.string().trim().min(1).max(200),
  chartType: z.enum(['XBAR_R', 'XBAR_S', 'IMR', 'P', 'NP', 'C', 'U']),
  subgroupSize: z.number().int().min(1).max(25).optional().default(5),
  usl: z.number().optional(),
  lsl: z.number().optional(),
  target: z.number().optional(),
  unit: z.string().optional(),
  frequency: z.string().optional(),
  notes: z.string().optional(),
});

const addDataPointSchema = z.union([
  z.object({
    value: z.number(),
    timestamp: z.string().optional(),
    subgroup: z.number().int().optional(),
    defectives: z.number().int().optional(),
    sampleSize: z.number().int().optional(),
  }),
  z.array(
    z.object({
      value: z.number(),
      timestamp: z.string().optional(),
      subgroup: z.number().int().optional(),
      defectives: z.number().int().optional(),
      sampleSize: z.number().int().optional(),
    })
  ),
]);

const listQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  status: z.string().optional(),
  partNumber: z.string().optional(),
  chartType: z.string().optional(),
  search: z.string().optional(),
});

// ============================================
// POST / - Create SPC chart
// ============================================

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createChartSchema.parse(req.body);
    const refNumber = await generateRefNumber();

    const chart = await prisma.spcChart.create({
      data: {
        refNumber,
        title: data.title,
        partNumber: data.partNumber,
        partName: data.partName,
        characteristic: data.characteristic,
        chartType: data.chartType,
        subgroupSize: data.subgroupSize,
        usl: data.usl,
        lsl: data.lsl,
        target: data.target,
        unit: data.unit,
        frequency: data.frequency,
        notes: data.notes,
        status: 'ACTIVE',
        createdBy: req.user?.id,
      },
    });

    logger.info('SPC chart created', { refNumber, chartType: data.chartType, partNumber: data.partNumber });

    res.status(201).json({ success: true, data: chart });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map((e) => e.path.join('.')) },
      });
    }
    logger.error('Create SPC chart error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create SPC chart' } });
  }
});

// ============================================
// GET / - List SPC charts with pagination
// ============================================

router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const parsedQuery = listQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsedQuery.error.errors[0].message } });
    }
    const query = parsedQuery.data;
    const pageNum = Math.min(10000, Math.max(1, parseInt(query.page, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(query.limit, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };

    if (query.status) where.status = query.status as any;
    if (query.partNumber) where.partNumber = { contains: query.partNumber, mode: 'insensitive' };
    if (query.chartType) where.chartType = query.chartType as any;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { partNumber: { contains: query.search, mode: 'insensitive' } },
        { partName: { contains: query.search, mode: 'insensitive' } },
        { characteristic: { contains: query.search, mode: 'insensitive' } },
        { refNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [charts, total] = await Promise.all([
      prisma.spcChart.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.spcChart.count({ where }),
    ]);

    res.json({
      success: true,
      data: charts,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List SPC charts error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list SPC charts' } });
  }
});

// ============================================
// GET /alerts - All active charts with OOC points
// ============================================

router.get('/alerts', async (req: AuthRequest, res: Response) => {
  try {
    // Find active charts that have out-of-control data points
    const chartsWithOOC = await prisma.spcChart.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        dataPoints: {
          some: {
            outOfControl: true,
          } as any,
        },
      },
      include: {
        dataPoints: {
          where: { outOfControl: true },
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            dataPoints: { where: { outOfControl: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: Math.min(Math.max(1, parseInt(req.query.limit as string, 10) || 50), 200),
      skip: Math.max(0, parseInt(req.query.offset as string, 10) || 0),
    });

    const alerts = chartsWithOOC.map((chart) => ({
      chartId: chart.id,
      refNumber: chart.refNumber,
      title: chart.title,
      partNumber: chart.partNumber,
      characteristic: chart.characteristic,
      chartType: chart.chartType,
      oocCount: chart._count.dataPoints,
      recentOocPoints: chart.dataPoints,
    }));

    res.json({ success: true, data: alerts });
  } catch (error) {
    logger.error('Get SPC alerts error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get SPC alerts' } });
  }
});

// ============================================
// GET /:id - Get chart with last 100 data points
// ============================================

router.get('/:id', checkOwnership(prisma.spcChart), async (req: AuthRequest, res: Response) => {
  try {
    const chart = await prisma.spcChart.findUnique({
      where: { id: req.params.id },
      include: {
        dataPoints: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        },
      },
    });

    if (!chart || chart.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SPC chart not found' } });
    }

    // Reverse the data points so they are in chronological order
    const chronologicalPoints = chart.dataPoints.reverse();

    // Compute control chart if we have enough data
    let computedChart = null;
    if (chronologicalPoints.length >= 2) {
      try {
        const dataPoints: DataPoint[] = chronologicalPoints.map((dp) => ({
          value: dp.value,
          timestamp: dp.timestamp,
          subgroup: dp.subgroup ?? undefined,
        }));

        if (chart.chartType === 'XBAR_R' && chart.subgroupSize >= 2) {
          computedChart = xbarRChart(dataPoints, chart.subgroupSize);
        } else if (chart.chartType === 'IMR') {
          computedChart = iMrChart(dataPoints);
        } else if (chart.chartType === 'P') {
          const pData: PChartDataPoint[] = chronologicalPoints.map((dp) => ({
            defectives: dp.defectives ?? 0,
            sampleSize: dp.sampleSize ?? 1,
            timestamp: dp.timestamp,
          }));
          computedChart = pChart(pData);
        }
      } catch {
        // Not enough data for chart computation; return null
        computedChart = null;
      }
    }

    // Run Western Electric rules if we have a computed chart
    let violations = null;
    if (computedChart) {
      violations = detectWesternElectricRules(computedChart);
    }

    res.json({
      success: true,
      data: {
        ...chart,
        dataPoints: chronologicalPoints,
        computedChart,
        violations,
      },
    });
  } catch (error) {
    logger.error('Get SPC chart error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get SPC chart' } });
  }
});

// ============================================
// POST /:id/data - Add data point(s) to chart
// ============================================

router.post('/:id/data', async (req: AuthRequest, res: Response) => {
  try {
    const chartId = req.params.id;

    // Verify chart exists and is active
    const chart = await prisma.spcChart.findUnique({
      where: { id: chartId },
    });

    if (!chart || chart.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SPC chart not found' } });
    }

    if (chart.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: { code: 'CHART_INACTIVE', message: 'Cannot add data to an inactive chart' },
      });
    }

    const parsed = addDataPointSchema.parse(req.body);
    const pointsInput = Array.isArray(parsed) ? parsed : [parsed];

    // Get existing data points for computing chart and detecting violations
    const existingPoints = await prisma.spcDataPoint.findMany({
      where: { chartId },
      orderBy: { timestamp: 'asc' },
      take: 200,
    });

    // Create data points in parallel
    const createdPoints = await Promise.all(
      pointsInput.map(pt => prisma.spcDataPoint.create({
        data: {
          chartId,
          value: pt.value,
          timestamp: pt.timestamp ? new Date(pt.timestamp) : new Date(),
          subgroup: pt.subgroup,
          defectives: pt.defectives,
          sampleSize: pt.sampleSize,
          outOfControl: false, // Will be updated below
          violationRules: [],
        },
      }))
    );

    // Re-fetch all points including newly added ones for chart computation
    const allPoints = await prisma.spcDataPoint.findMany({
      where: { chartId },
      orderBy: { timestamp: 'asc' },
      take: 200,
    });

    // Compute chart and detect violations
    let violations: { pointIndex: number; rule: string; description: string }[] = [];
    try {
      const dataPoints: DataPoint[] = allPoints.map((dp) => ({
        value: dp.value,
        timestamp: dp.timestamp,
        subgroup: dp.subgroup ?? undefined,
      }));

      let computedChart = null;
      if (chart.chartType === 'XBAR_R' && chart.subgroupSize >= 2 && dataPoints.length >= chart.subgroupSize * 2) {
        computedChart = xbarRChart(dataPoints, chart.subgroupSize);
      } else if (chart.chartType === 'IMR' && dataPoints.length >= 2) {
        computedChart = iMrChart(dataPoints);
      } else if (chart.chartType === 'P' && allPoints.length >= 2) {
        const pData: PChartDataPoint[] = allPoints.map((dp) => ({
          defectives: dp.defectives ?? 0,
          sampleSize: dp.sampleSize ?? 1,
          timestamp: dp.timestamp,
        }));
        computedChart = pChart(pData);
      }

      if (computedChart) {
        violations = detectWesternElectricRules(computedChart);

        // Update out-of-control status on data points
        const oocIndices = new Set(computedChart.outOfControl.map((o) => o.index));
        for (let i = 0; i < allPoints.length && i < computedChart.dataPoints.length; i++) {
          const isOOC = oocIndices.has(i) || computedChart.dataPoints[i].outOfControl;
          const pointViolations = violations
            .filter((v) => v.pointIndex === i)
            .map((v) => v.rule);

          if (isOOC || pointViolations.length > 0) {
            await prisma.spcDataPoint.update({
              where: { id: allPoints[i].id },
              data: {
                outOfControl: true,
                violationRules: pointViolations,
              },
            });
          }
        }
      }
    } catch {
      // Not enough data for chart computation yet; skip violation detection
    }

    // Update chart's updatedAt timestamp
    await prisma.spcChart.update({
      where: { id: chartId },
      data: { updatedAt: new Date() },
    });

    logger.info('SPC data points added', {
      chartId,
      refNumber: chart.refNumber,
      count: createdPoints.length,
      violationsDetected: violations.length,
    });

    res.status(201).json({
      success: true,
      data: {
        points: createdPoints,
        violationsDetected: violations.length,
        violations: violations.slice(0, 20), // Limit violation details returned
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map((e) => e.path.join('.')) },
      });
    }
    logger.error('Add SPC data error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add data points' } });
  }
});

// ============================================
// GET /:id/capability - Calculate Cpk/Ppk
// ============================================

router.get('/:id/capability', async (req: AuthRequest, res: Response) => {
  try {
    const chartId = req.params.id;

    const chart = await prisma.spcChart.findUnique({
      where: { id: chartId },
    });

    if (!chart || chart.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SPC chart not found' } });
    }

    // Capability analysis requires USL and LSL
    if (chart.usl == null || chart.lsl == null) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_SPEC_LIMITS', message: 'USL and LSL are required for capability analysis' },
      });
    }

    // Get all data points
    const dataPoints = await prisma.spcDataPoint.findMany({
      where: { chartId },
      orderBy: { timestamp: 'asc' },
      take: Math.min(Math.max(1, parseInt(req.query.limit as string, 10) || 50), 200),
      skip: Math.max(0, parseInt(req.query.offset as string, 10) || 0),
    });

    if (dataPoints.length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'INSUFFICIENT_DATA', message: 'Need at least 2 data points for capability analysis' },
      });
    }

    const values = dataPoints.map((dp) => dp.value);
    const cpkResult = calculateCpk(values, chart.usl, chart.lsl);
    const ppkResult = calculatePpk(values, chart.usl, chart.lsl);

    const capability = {
      chartId: chart.id,
      refNumber: chart.refNumber,
      partNumber: chart.partNumber,
      characteristic: chart.characteristic,
      usl: chart.usl,
      lsl: chart.lsl,
      target: chart.target,
      sampleSize: dataPoints.length,
      cp: cpkResult.cp,
      cpk: cpkResult.cpk,
      pp: ppkResult.pp,
      ppk: ppkResult.ppk,
      mean: cpkResult.mean,
      sigmaWithin: cpkResult.sigma,
      sigmaOverall: ppkResult.sigma,
      statusCpk: cpkResult.status,
      statusPpk: ppkResult.status,
    };

    res.json({ success: true, data: capability });
  } catch (error) {
    logger.error('Get SPC capability error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate capability' } });
  }
});

export default router;
