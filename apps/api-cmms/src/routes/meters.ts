import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const meterCreateSchema = z.object({
  assetId: z.string().uuid(),
  meterType: z.enum(['HOURS', 'MILES', 'KILOMETERS', 'CYCLES', 'UNITS']),
  reading: z.number(),
  readingDate: z.string(),
  previousReading: z.number().optional().nullable(),
  delta: z.number().optional().nullable(),
});

const meterUpdateSchema = z.object({
  meterType: z.enum(['HOURS', 'MILES', 'KILOMETERS', 'CYCLES', 'UNITS']).optional(),
  reading: z.number().optional(),
  readingDate: z.string().optional(),
  previousReading: z.number().optional().nullable(),
  delta: z.number().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ===================================================================
// METER READINGS CRUD
// ===================================================================

// GET / — List meter readings
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assetId, meterType } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (assetId) where.assetId = String(assetId);
    if (meterType) where.meterType = String(meterType);

    const [readings, total] = await Promise.all([
      prisma.cmmsMeterReading.findMany({
        where,
        skip,
        take: limit,
        include: { asset: { select: { id: true, name: true, code: true } } },
        orderBy: { readingDate: 'desc' },
      }),
      prisma.cmmsMeterReading.count({ where }),
    ]);

    res.json({
      success: true,
      data: readings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list meter readings', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list meter readings' } });
  }
});

// POST / — Create meter reading
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = meterCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    // Auto-calculate delta from previous reading if not provided
    let delta = data.delta;
    if (delta == null && data.previousReading != null) {
      delta = data.reading - data.previousReading;
    }

    const reading = await prisma.cmmsMeterReading.create({
      data: {
        assetId: data.assetId,
        meterType: data.meterType,
        reading: new Prisma.Decimal(data.reading),
        readingDate: new Date(data.readingDate),
        previousReading: data.previousReading != null ? new Prisma.Decimal(data.previousReading) : null,
        delta: delta != null ? new Prisma.Decimal(delta) : null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: reading });
  } catch (error: unknown) {
    logger.error('Failed to create meter reading', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create meter reading' } });
  }
});

// GET /:id — Get meter reading by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const reading = await prisma.cmmsMeterReading.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { asset: { select: { id: true, name: true, code: true } } },
    });

    if (!reading) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meter reading not found' } });
    }

    res.json({ success: true, data: reading });
  } catch (error: unknown) {
    logger.error('Failed to get meter reading', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get meter reading' } });
  }
});

// PUT /:id — Update meter reading
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = meterUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const existing = await prisma.cmmsMeterReading.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meter reading not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.meterType !== undefined) updateData.meterType = data.meterType;
    if (data.reading !== undefined) updateData.reading = new Prisma.Decimal(data.reading);
    if (data.readingDate !== undefined) updateData.readingDate = new Date(data.readingDate);
    if (data.previousReading !== undefined) updateData.previousReading = data.previousReading != null ? new Prisma.Decimal(data.previousReading) : null;
    if (data.delta !== undefined) updateData.delta = data.delta != null ? new Prisma.Decimal(data.delta) : null;

    const reading = await prisma.cmmsMeterReading.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: reading });
  } catch (error: unknown) {
    logger.error('Failed to update meter reading', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update meter reading' } });
  }
});

// DELETE /:id — Soft delete meter reading
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsMeterReading.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meter reading not found' } });
    }

    await prisma.cmmsMeterReading.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Meter reading deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete meter reading', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete meter reading' } });
  }
});

export default router;
