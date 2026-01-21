import { Router, Response } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { calculateSafetyMetrics } from '@ims/calculations';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(authenticate);

// GET /api/metrics/safety - List safety metrics
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;
    const filterYear = year ? parseInt(year as string, 10) : new Date().getFullYear();

    const metrics = await prisma.safetyMetric.findMany({
      where: { year: filterYear },
      orderBy: { month: 'asc' },
    });

    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('List safety metrics error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list safety metrics' } });
  }
});

// GET /api/metrics/safety/summary - Get summary for current year
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const year = new Date().getFullYear();

    const metrics = await prisma.safetyMetric.findMany({
      where: { year },
    });

    if (metrics.length === 0) {
      return res.json({
        success: true,
        data: {
          year,
          totalHoursWorked: 0,
          totalLTIs: 0,
          totalTRIs: 0,
          totalDaysLost: 0,
          averageLTIFR: 0,
          averageTRIR: 0,
          averageSeverityRate: 0,
        },
      });
    }

    const totals = metrics.reduce(
      (acc, m) => ({
        hoursWorked: acc.hoursWorked + m.hoursWorked,
        ltis: acc.ltis + m.lostTimeInjuries,
        tris: acc.tris + m.totalRecordableInjuries,
        daysLost: acc.daysLost + m.daysLost,
        nearMisses: acc.nearMisses + m.nearMisses,
      }),
      { hoursWorked: 0, ltis: 0, tris: 0, daysLost: 0, nearMisses: 0 }
    );

    const calculated = calculateSafetyMetrics({
      hoursWorked: totals.hoursWorked,
      lostTimeInjuries: totals.ltis,
      totalRecordableInjuries: totals.tris,
      daysLost: totals.daysLost,
      nearMisses: totals.nearMisses,
    });

    res.json({
      success: true,
      data: {
        year,
        totalHoursWorked: totals.hoursWorked,
        totalLTIs: totals.ltis,
        totalTRIs: totals.tris,
        totalDaysLost: totals.daysLost,
        totalNearMisses: totals.nearMisses,
        ...calculated,
      },
    });
  } catch (error) {
    console.error('Safety metrics summary error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get safety metrics summary' } });
  }
});

// POST /api/metrics/safety - Create or update monthly metric
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      year: z.number().min(2000).max(2100),
      month: z.number().min(1).max(12),
      hoursWorked: z.number().min(0),
      lostTimeInjuries: z.number().min(0).default(0),
      totalRecordableInjuries: z.number().min(0).default(0),
      daysLost: z.number().min(0).default(0),
      nearMisses: z.number().min(0).default(0),
      firstAidCases: z.number().min(0).default(0),
    });

    const data = schema.parse(req.body);

    // Calculate rates
    const calculated = calculateSafetyMetrics({
      hoursWorked: data.hoursWorked,
      lostTimeInjuries: data.lostTimeInjuries,
      totalRecordableInjuries: data.totalRecordableInjuries,
      daysLost: data.daysLost,
      nearMisses: data.nearMisses,
    });

    // Upsert
    const metric = await prisma.safetyMetric.upsert({
      where: {
        year_month: { year: data.year, month: data.month },
      },
      update: {
        ...data,
        ltifr: calculated.ltifr,
        trir: calculated.trir,
        severityRate: calculated.severityRate,
      },
      create: {
        id: uuidv4(),
        ...data,
        ltifr: calculated.ltifr,
        trir: calculated.trir,
        severityRate: calculated.severityRate,
      },
    });

    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create safety metric error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create safety metric' } });
  }
});

export default router;
