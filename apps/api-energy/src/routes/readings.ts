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

const readingCreateSchema = z.object({
  meterId: z.string().uuid(),
  value: z.number().min(0),
  readingDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  source: z.enum(['MANUAL', 'AUTOMATIC', 'ESTIMATED', 'INVOICE']).optional().default('MANUAL'),
  cost: z.number().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

const readingUpdateSchema = z.object({
  value: z.number().min(0).optional(),
  readingDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  source: z.enum(['MANUAL', 'AUTOMATIC', 'ESTIMATED', 'INVOICE']).optional(),
  cost: z.number().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// GET /summary — Consumption summary by period
// ---------------------------------------------------------------------------

router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { meterId, dateFrom, dateTo } = req.query;

    const where: any = { deletedAt: null };
    if (meterId && typeof meterId === 'string') {
      where.meterId = meterId;
    }
    if (dateFrom || dateTo) {
      where.readingDate = {};
      if (dateFrom) where.readingDate.gte = new Date(String(dateFrom));
      if (dateTo) where.readingDate.lte = new Date(String(dateTo));
    }

    const result = await prisma.energyReading.aggregate({
      where,
      _sum: { value: true, cost: true },
      _avg: { value: true },
      _count: true,
      _min: { readingDate: true },
      _max: { readingDate: true },
    });

    res.json({
      success: true,
      data: {
        totalConsumption: Number(result._sum.value || 0),
        totalCost: Number(result._sum.cost || 0),
        averageConsumption: Number(result._avg.value || 0),
        readingCount: result._count,
        periodStart: result._min.readingDate,
        periodEnd: result._max.readingDate,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get reading summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to get reading summary' });
  }
});

// ---------------------------------------------------------------------------
// GET / — List readings
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { meterId, source, dateFrom, dateTo } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (meterId && typeof meterId === 'string') {
      where.meterId = meterId;
    }
    if (source && typeof source === 'string') {
      where.source = source;
    }
    if (dateFrom || dateTo) {
      where.readingDate = {};
      if (dateFrom) where.readingDate.gte = new Date(String(dateFrom));
      if (dateTo) where.readingDate.lte = new Date(String(dateTo));
    }

    const [readings, total] = await Promise.all([
      prisma.energyReading.findMany({
        where,
        skip,
        take: limit,
        orderBy: { readingDate: 'desc' },
        include: {
          meter: { select: { id: true, name: true, code: true, type: true, unit: true } },
        },
      }),
      prisma.energyReading.count({ where }),
    ]);

    res.json({
      success: true,
      data: readings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list readings', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list readings' });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create reading
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = readingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    // Validate meter exists
    const meter = await prisma.energyMeter.findFirst({ where: { id: data.meterId, deletedAt: null } });
    if (!meter) {
      return res.status(400).json({ success: false, error: 'Meter not found' });
    }

    const reading = await prisma.energyReading.create({
      data: {
        meterId: data.meterId,
        value: new Prisma.Decimal(data.value),
        readingDate: new Date(data.readingDate),
        source: data.source,
        cost: data.cost != null ? new Prisma.Decimal(data.cost) : null,
        notes: data.notes ?? null,
        createdBy: authReq.user?.id || 'system',
      },
      include: {
        meter: { select: { id: true, name: true, code: true, type: true } },
      },
    });

    logger.info('Reading created', { readingId: reading.id, meterId: data.meterId });
    res.status(201).json({ success: true, data: reading });
  } catch (error: unknown) {
    logger.error('Failed to create reading', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to create reading' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get reading
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['summary']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const reading = await prisma.energyReading.findFirst({
      where: { id, deletedAt: null },
      include: {
        meter: { select: { id: true, name: true, code: true, type: true, unit: true } },
      },
    });

    if (!reading) {
      return res.status(404).json({ success: false, error: 'Reading not found' });
    }

    res.json({ success: true, data: reading });
  } catch (error: unknown) {
    logger.error('Failed to get reading', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get reading' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update reading
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = readingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.energyReading.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Reading not found' });
    }

    const updateData: any = { ...parsed.data };
    if (updateData.value !== undefined) {
      updateData.value = new Prisma.Decimal(updateData.value);
    }
    if (updateData.cost !== undefined && updateData.cost !== null) {
      updateData.cost = new Prisma.Decimal(updateData.cost);
    }
    if (updateData.readingDate) {
      updateData.readingDate = new Date(updateData.readingDate);
    }

    const reading = await prisma.energyReading.update({
      where: { id },
      data: updateData,
    });

    logger.info('Reading updated', { readingId: id });
    res.json({ success: true, data: reading });
  } catch (error: unknown) {
    logger.error('Failed to update reading', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update reading' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete reading
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyReading.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Reading not found' });
    }

    await prisma.energyReading.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Reading soft-deleted', { readingId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete reading', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to delete reading' });
  }
});

export default router;
