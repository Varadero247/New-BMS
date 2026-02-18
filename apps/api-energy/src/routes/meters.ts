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

const meterCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(50),
  type: z.enum(['ELECTRICITY', 'GAS', 'WATER', 'STEAM', 'COMPRESSED_AIR', 'FUEL']),
  location: z.string().max(200).optional().nullable(),
  facility: z.string().max(200).optional().nullable(),
  unit: z.string().trim().min(1).max(50),
  multiplier: z.number().min(0).optional().default(1),
  isVirtual: z.boolean().optional().default(false),
  parentMeterId: z.string().trim().uuid().optional().nullable(),
});

const meterUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  type: z.enum(['ELECTRICITY', 'GAS', 'WATER', 'STEAM', 'COMPRESSED_AIR', 'FUEL']).optional(),
  location: z.string().max(200).optional().nullable(),
  facility: z.string().max(200).optional().nullable(),
  unit: z.string().trim().min(1).max(50).optional(),
  multiplier: z.number().min(0).optional(),
  isVirtual: z.boolean().optional(),
  parentMeterId: z.string().trim().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'FAULTY', 'DECOMMISSIONED']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function buildMeterTree(meters: Record<string, unknown>[]): Record<string, unknown>[] {
  const map = new Map<string, Record<string, unknown>>();
  const roots: Record<string, unknown>[] = [];

  for (const m of meters) {
    map.set(m.id as string, { ...m, children: [] });
  }

  for (const m of meters) {
    const node = map.get(m.id as string)!;
    if (m.parentMeterId && map.has(m.parentMeterId as string)) {
      (map.get(m.parentMeterId as string)!.children as Record<string, unknown>[]).push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ---------------------------------------------------------------------------
// GET /hierarchy — Meter tree structure
// ---------------------------------------------------------------------------

router.get('/hierarchy', async (_req: Request, res: Response) => {
  try {
    const meters = await prisma.energyMeter.findMany({
      where: { deletedAt: null } as any,
      orderBy: { name: 'asc' },
      take: 1000});

    const tree = buildMeterTree(meters);
    res.json({ success: true, data: tree });
  } catch (error: unknown) {
    logger.error('Failed to build meter hierarchy', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to build meter hierarchy' } });
  }
});

// ---------------------------------------------------------------------------
// GET / — List meters
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, facility, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (type && typeof type === 'string') {
      where.type = type;
    }
    if (facility && typeof facility === 'string') {
      where.facility = { contains: facility, mode: 'insensitive' };
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [meters, total] = await Promise.all([
      prisma.energyMeter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          parent: { select: { id: true, name: true, code: true } },
          _count: { select: { readings: true, children: true } },
        },
      }),
      prisma.energyMeter.count({ where }),
    ]);

    res.json({
      success: true,
      data: meters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list meters', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list meters' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create meter
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = meterCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    // Check duplicate code
    const existing = await prisma.energyMeter.findFirst({ where: { code: data.code, deletedAt: null } as any });
    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: `Meter with code '${data.code}' already exists` } });
    }

    // Validate parent if provided
    if (data.parentMeterId) {
      const parent = await prisma.energyMeter.findFirst({ where: { id: data.parentMeterId, deletedAt: null } as any });
      if (!parent) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parent meter not found' } });
      }
    }

    const meter = await prisma.energyMeter.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        location: data.location ?? null,
        facility: data.facility ?? null,
        unit: data.unit,
        multiplier: new Prisma.Decimal(data.multiplier),
        isVirtual: data.isVirtual,
        parentMeterId: data.parentMeterId ?? null,
        status: 'ACTIVE',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Meter created', { meterId: meter.id, code: data.code });
    res.status(201).json({ success: true, data: meter });
  } catch (error: unknown) {
    logger.error('Failed to create meter', { error: error instanceof Error ? error.message : 'Unknown error' });
    if (error != null && typeof error === 'object' && 'code' in error && (error as any).code === 'P2002') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Meter code must be unique' } });
    }
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create meter' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get meter
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['hierarchy']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const meter = await prisma.energyMeter.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { where: { deletedAt: null } as any, select: { id: true, name: true, code: true, type: true, status: true } },
      },
    });

    if (!meter) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meter not found' } });
    }

    res.json({ success: true, data: meter });
  } catch (error: unknown) {
    logger.error('Failed to get meter', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get meter' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update meter
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = meterUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.energyMeter.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meter not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.multiplier !== undefined) {
      updateData.multiplier = new Prisma.Decimal(updateData.multiplier as any);
    }

    const meter = await prisma.energyMeter.update({
      where: { id },
      data: updateData,
    });

    logger.info('Meter updated', { meterId: id });
    res.json({ success: true, data: meter });
  } catch (error: unknown) {
    logger.error('Failed to update meter', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update meter' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete meter
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyMeter.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meter not found' } });
    }

    await prisma.energyMeter.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DECOMMISSIONED' },
    });

    logger.info('Meter soft-deleted', { meterId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete meter', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete meter' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/readings — Readings for a meter
// ---------------------------------------------------------------------------

router.get('/:id/readings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const meter = await prisma.energyMeter.findFirst({ where: { id, deletedAt: null } as any });
    if (!meter) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meter not found' } });
    }

    const where: Record<string, unknown> = { meterId: id, deletedAt: null };

    const [readings, total] = await Promise.all([
      prisma.energyReading.findMany({
        where,
        skip,
        take: limit,
        orderBy: { readingDate: 'desc' },
      }),
      prisma.energyReading.count({ where }),
    ]);

    res.json({
      success: true,
      data: readings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to get meter readings', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get meter readings' } });
  }
});

export default router;
