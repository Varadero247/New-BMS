import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { calculateQualityMetrics } from '@ims/calculations';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();

router.use(authenticate);

// GET /api/metrics/quality - List quality metrics
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;
    const filterYear = year ? parseInt(year as string, 10) : new Date().getFullYear();

    const metrics = await prisma.qualityMetric.findMany({
      where: { year: filterYear },
      orderBy: { month: 'asc' },
    });

    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('List quality metrics error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list quality metrics' } });
  }
});

// GET /api/metrics/quality/summary - Get summary for current year
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const year = new Date().getFullYear();

    const metrics = await prisma.qualityMetric.findMany({
      where: { year },
    });

    if (metrics.length === 0) {
      return res.json({
        success: true,
        data: {
          year,
          totalCOPQ: 0,
          averageDPMO: 0,
          averageFPY: 0,
          averageSigma: 0,
        },
      });
    }

    const totals = metrics.reduce(
      (acc, m) => ({
        preventionCost: acc.preventionCost + (m.preventionCost || 0),
        appraisalCost: acc.appraisalCost + (m.appraisalCost || 0),
        internalFailureCost: acc.internalFailureCost + (m.internalFailureCost || 0),
        externalFailureCost: acc.externalFailureCost + (m.externalFailureCost || 0),
        totalUnits: acc.totalUnits + (m.totalUnits || 0),
        defectiveUnits: acc.defectiveUnits + (m.defectiveUnits || 0),
        defectOpportunities: acc.defectOpportunities + (m.defectOpportunities || 1),
      }),
      {
        preventionCost: 0,
        appraisalCost: 0,
        internalFailureCost: 0,
        externalFailureCost: 0,
        totalUnits: 0,
        defectiveUnits: 0,
        defectOpportunities: 0,
      }
    );

    const calculated = calculateQualityMetrics({
      preventionCost: totals.preventionCost,
      appraisalCost: totals.appraisalCost,
      internalFailureCost: totals.internalFailureCost,
      externalFailureCost: totals.externalFailureCost,
      totalUnits: totals.totalUnits,
      defectiveUnits: totals.defectiveUnits,
      defectOpportunities: totals.defectOpportunities,
    });

    res.json({
      success: true,
      data: {
        year,
        ...totals,
        ...calculated,
        monthlyData: metrics,
      },
    });
  } catch (error) {
    console.error('Quality metrics summary error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get quality metrics summary' } });
  }
});

// POST /api/metrics/quality - Create or update monthly metric
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
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

    const data = schema.parse(req.body);

    // Calculate derived metrics
    const calculated = calculateQualityMetrics({
      preventionCost: data.preventionCost,
      appraisalCost: data.appraisalCost,
      internalFailureCost: data.internalFailureCost,
      externalFailureCost: data.externalFailureCost,
      totalUnits: data.totalUnits,
      defectiveUnits: data.defectiveUnits,
      defectOpportunities: data.defectOpportunities,
    });

    // Upsert
    const metric = await prisma.qualityMetric.upsert({
      where: {
        year_month: { year: data.year, month: data.month },
      },
      update: {
        ...data,
        totalCOPQ: calculated.totalCOPQ,
        dpmo: calculated.dpmo,
        firstPassYield: calculated.firstPassYield,
        processSigma: calculated.processSigma,
      },
      create: {
        id: uuidv4(),
        ...data,
        totalCOPQ: calculated.totalCOPQ,
        dpmo: calculated.dpmo,
        firstPassYield: calculated.firstPassYield,
        processSigma: calculated.processSigma,
      },
    });

    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create quality metric error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create quality metric' } });
  }
});

export default router;
