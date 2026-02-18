import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-energy');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const enpiCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  formula: z.string().min(1).max(500),
  unit: z.string().min(1).max(50),
  baselineValue: z.number().optional().nullable(),
  targetValue: z.number().optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional().default('MONTHLY'),
});

const enpiUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  formula: z.string().min(1).max(500).optional(),
  unit: z.string().min(1).max(50).optional(),
  baselineValue: z.number().optional().nullable(),
  currentValue: z.number().optional().nullable(),
  targetValue: z.number().optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
});

const dataPointCreateSchema = z.object({
  value: z.number(),
  periodStart: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  periodEnd: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  variables: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List EnPIs
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { frequency } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (frequency && typeof frequency === 'string') {
      where.frequency = frequency;
    }

    const [enpis, total] = await Promise.all([
      prisma.energyEnpi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { dataPoints: true } },
        },
      }),
      prisma.energyEnpi.count({ where }),
    ]);

    res.json({
      success: true,
      data: enpis,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list EnPIs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list EnPIs' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create EnPI
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = enpiCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const enpi = await prisma.energyEnpi.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        formula: data.formula,
        unit: data.unit,
        baselineValue: data.baselineValue != null ? new Prisma.Decimal(data.baselineValue) : null,
        targetValue: data.targetValue != null ? new Prisma.Decimal(data.targetValue) : null,
        frequency: data.frequency,
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('EnPI created', { enpiId: enpi.id });
    res.status(201).json({ success: true, data: enpi });
  } catch (error: unknown) {
    logger.error('Failed to create EnPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create EnPI' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get EnPI
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const enpi = await prisma.energyEnpi.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        _count: { select: { dataPoints: true } },
      },
    });

    if (!enpi) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'EnPI not found' } });
    }

    res.json({ success: true, data: enpi });
  } catch (error: unknown) {
    logger.error('Failed to get EnPI', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get EnPI' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update EnPI
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = enpiUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.energyEnpi.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'EnPI not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.baselineValue !== undefined && updateData.baselineValue !== null) {
      updateData.baselineValue = new Prisma.Decimal(updateData.baselineValue as any);
    }
    if (updateData.currentValue !== undefined && updateData.currentValue !== null) {
      updateData.currentValue = new Prisma.Decimal(updateData.currentValue as any);
    }
    if (updateData.targetValue !== undefined && updateData.targetValue !== null) {
      updateData.targetValue = new Prisma.Decimal(updateData.targetValue as any);
    }

    const enpi = await prisma.energyEnpi.update({
      where: { id },
      data: updateData,
    });

    logger.info('EnPI updated', { enpiId: id });
    res.json({ success: true, data: enpi });
  } catch (error: unknown) {
    logger.error('Failed to update EnPI', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update EnPI' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete EnPI
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyEnpi.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'EnPI not found' } });
    }

    await prisma.energyEnpi.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('EnPI soft-deleted', { enpiId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete EnPI', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete EnPI' } });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/data-points — Add data point to EnPI
// ---------------------------------------------------------------------------

router.post('/:id/data-points', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = dataPointCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const enpi = await prisma.energyEnpi.findFirst({ where: { id, deletedAt: null } as any });
    if (!enpi) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'EnPI not found' } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const dataPoint = await prisma.energyEnpiData.create({
      data: {
        enpiId: id,
        value: new Prisma.Decimal(data.value),
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        variables: data.variables ?? null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    // Update current value and last calculated
    await prisma.energyEnpi.update({
      where: { id },
      data: {
        currentValue: new Prisma.Decimal(data.value),
        lastCalculated: new Date(),
      },
    });

    logger.info('EnPI data point added', { enpiId: id, dataPointId: dataPoint.id });
    res.status(201).json({ success: true, data: dataPoint });
  } catch (error: unknown) {
    logger.error('Failed to add EnPI data point', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add data point' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/data-points — List data points for EnPI
// ---------------------------------------------------------------------------

router.get('/:id/data-points', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 100);
    const skip = (page - 1) * limit;

    const enpi = await prisma.energyEnpi.findFirst({ where: { id, deletedAt: null } as any });
    if (!enpi) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'EnPI not found' } });
    }

    const where: Record<string, unknown> = { enpiId: id, deletedAt: null };

    const [dataPoints, total] = await Promise.all([
      prisma.energyEnpiData.findMany({
        where,
        skip,
        take: limit,
        orderBy: { periodStart: 'desc' },
      }),
      prisma.energyEnpiData.count({ where }),
    ]);

    res.json({
      success: true,
      data: dataPoints,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list EnPI data points', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list data points' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/trend — EnPI trend data
// ---------------------------------------------------------------------------

router.get('/:id/trend', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { periods } = req.query;
    const numPeriods = parseIntParam(periods, 12);

    const enpi = await prisma.energyEnpi.findFirst({ where: { id, deletedAt: null } as any });
    if (!enpi) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'EnPI not found' } });
    }

    const dataPoints = await prisma.energyEnpiData.findMany({
      where: { enpiId: id, deletedAt: null } as any,
      orderBy: { periodStart: 'desc' },
      take: numPeriods,
    });

    const values = dataPoints.map(dp => Number(dp.value));
    const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;

    // Calculate trend direction
    let trend = 'STABLE';
    if (values.length >= 2) {
      const recent = values.slice(0, Math.ceil(values.length / 2));
      const older = values.slice(Math.ceil(values.length / 2));
      const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
      const olderAvg = older.reduce((s, v) => s + v, 0) / older.length;
      if (recentAvg > olderAvg * 1.05) trend = 'INCREASING';
      else if (recentAvg < olderAvg * 0.95) trend = 'DECREASING';
    }

    res.json({
      success: true,
      data: {
        enpiId: id,
        name: enpi.name,
        unit: enpi.unit,
        baseline: Number(enpi.baselineValue || 0),
        target: Number(enpi.targetValue || 0),
        current: Number(enpi.currentValue || 0),
        trend,
        statistics: { average: avg, min, max, count: values.length },
        dataPoints: dataPoints.reverse().map(dp => ({
          periodStart: dp.periodStart,
          periodEnd: dp.periodEnd,
          value: Number(dp.value),
        })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get EnPI trend', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get EnPI trend' } });
  }
});

export default router;
