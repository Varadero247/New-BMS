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
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  type: z.enum(['ELECTRICITY', 'GAS', 'WATER', 'STEAM', 'COMPRESSED_AIR', 'FUEL']),
  location: z.string().max(200).optional().nullable(),
  facility: z.string().max(200).optional().nullable(),
  unit: z.string().min(1).max(50),
  multiplier: z.number().min(0).optional().default(1),
  isVirtual: z.boolean().optional().default(false),
  parentMeterId: z.string().uuid().optional().nullable(),
});

const meterUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(['ELECTRICITY', 'GAS', 'WATER', 'STEAM', 'COMPRESSED_AIR', 'FUEL']).optional(),
  location: z.string().max(200).optional().nullable(),
  facility: z.string().max(200).optional().nullable(),
  unit: z.string().min(1).max(50).optional(),
  multiplier: z.number().min(0).optional(),
  isVirtual: z.boolean().optional(),
  parentMeterId: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'FAULTY', 'DECOMMISSIONED']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function buildMeterTree(meters: any[]): any[] {
  const map = new Map<string, any>();
  const roots: any[] = [];

  for (const m of meters) {
    map.set(m.id, { ...m, children: [] });
  }

  for (const m of meters) {
    const node = map.get(m.id)!;
    if (m.parentMeterId && map.has(m.parentMeterId)) {
      map.get(m.parentMeterId)!.children.push(node);
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
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });

    const tree = buildMeterTree(meters);
    res.json({ success: true, data: tree });
  } catch (error: any) {
    logger.error('Failed to build meter hierarchy', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to build meter hierarchy' });
  }
});

// ---------------------------------------------------------------------------
// GET / — List meters
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, facility, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

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
  } catch (error: any) {
    logger.error('Failed to list meters', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to list meters' });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create meter
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = meterCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    // Check duplicate code
    const existing = await prisma.energyMeter.findFirst({ where: { code: data.code, deletedAt: null } });
    if (existing) {
      return res.status(409).json({ success: false, error: `Meter with code '${data.code}' already exists` });
    }

    // Validate parent if provided
    if (data.parentMeterId) {
      const parent = await prisma.energyMeter.findFirst({ where: { id: data.parentMeterId, deletedAt: null } });
      if (!parent) {
        return res.status(400).json({ success: false, error: 'Parent meter not found' });
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
  } catch (error: any) {
    logger.error('Failed to create meter', { error: error.message });
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Meter code must be unique' });
    }
    res.status(500).json({ success: false, error: 'Failed to create meter' });
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
      where: { id, deletedAt: null },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { where: { deletedAt: null }, select: { id: true, name: true, code: true, type: true, status: true } },
      },
    });

    if (!meter) {
      return res.status(404).json({ success: false, error: 'Meter not found' });
    }

    res.json({ success: true, data: meter });
  } catch (error: any) {
    logger.error('Failed to get meter', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get meter' });
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
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.energyMeter.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Meter not found' });
    }

    const updateData: any = { ...parsed.data };
    if (updateData.multiplier !== undefined) {
      updateData.multiplier = new Prisma.Decimal(updateData.multiplier);
    }

    const meter = await prisma.energyMeter.update({
      where: { id },
      data: updateData,
    });

    logger.info('Meter updated', { meterId: id });
    res.json({ success: true, data: meter });
  } catch (error: any) {
    logger.error('Failed to update meter', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update meter' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete meter
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyMeter.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Meter not found' });
    }

    await prisma.energyMeter.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DECOMMISSIONED' },
    });

    logger.info('Meter soft-deleted', { meterId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: any) {
    logger.error('Failed to delete meter', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to delete meter' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/readings — Readings for a meter
// ---------------------------------------------------------------------------

router.get('/:id/readings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const meter = await prisma.energyMeter.findFirst({ where: { id, deletedAt: null } });
    if (!meter) {
      return res.status(404).json({ success: false, error: 'Meter not found' });
    }

    const where: any = { meterId: id, deletedAt: null };

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
  } catch (error: any) {
    logger.error('Failed to get meter readings', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get meter readings' });
  }
});

export default router;
