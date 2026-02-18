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

const downtimeCreateSchema = z.object({
  assetId: z.string().uuid(),
  workOrderId: z.string().uuid().optional().nullable(),
  startTime: z.string(),
  endTime: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  reason: z.string().min(1).max(500),
  impact: z.enum(['PRODUCTION_STOP', 'REDUCED_OUTPUT', 'QUALITY_IMPACT', 'SAFETY_RISK', 'NONE']).optional(),
  estimatedLoss: z.number().optional().nullable(),
});

const downtimeUpdateSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  reason: z.string().min(1).max(500).optional(),
  impact: z.enum(['PRODUCTION_STOP', 'REDUCED_OUTPUT', 'QUALITY_IMPACT', 'SAFETY_RISK', 'NONE']).optional(),
  estimatedLoss: z.number().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const RESERVED_PATHS = new Set(['pareto']);

// ===================================================================
// DOWNTIME CRUD
// ===================================================================

// GET /pareto — Top downtime causes (Pareto analysis)
router.get('/pareto', async (req: Request, res: Response) => {
  try {
    const downtimes = await prisma.cmmsDowntime.findMany({
      where: { deletedAt: null } as any,
      select: { reason: true, duration: true, impact: true },
    });

    const reasonMap: Record<string, { count: number; totalDuration: number }> = {};
    for (const d of downtimes) {
      if (!reasonMap[d.reason]) {
        reasonMap[d.reason] = { count: 0, totalDuration: 0 };
      }
      reasonMap[d.reason].count += 1;
      reasonMap[d.reason].totalDuration += d.duration ? Number(d.duration) : 0;
    }

    const pareto = Object.entries(reasonMap)
      .map(([reason, stats]) => ({ reason, ...stats }))
      .sort((a, b) => b.totalDuration - a.totalDuration);

    res.json({ success: true, data: pareto });
  } catch (error: unknown) {
    logger.error('Failed to generate Pareto analysis', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate Pareto analysis' } });
  }
});

// GET / — List downtime records
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assetId, impact, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (assetId) where.assetId = String(assetId);
    if (impact) where.impact = String(impact);
    if (search) {
      where.OR = [
        { reason: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [downtimes, total] = await Promise.all([
      prisma.cmmsDowntime.findMany({
        where,
        skip,
        take: limit,
        include: {
          asset: { select: { id: true, name: true, code: true } },
          workOrder: { select: { id: true, number: true, title: true } },
        },
        orderBy: { startTime: 'desc' },
      }),
      prisma.cmmsDowntime.count({ where }),
    ]);

    res.json({
      success: true,
      data: downtimes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list downtime records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list downtime records' } });
  }
});

// POST / — Create downtime record
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = downtimeCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    // Auto-calculate duration if start and end are provided
    let duration = data.duration;
    if (duration == null && data.endTime) {
      const start = new Date(data.startTime).getTime();
      const end = new Date(data.endTime).getTime();
      duration = (end - start) / (1000 * 60 * 60); // hours
    }

    const downtime = await prisma.cmmsDowntime.create({
      data: {
        assetId: data.assetId,
        workOrderId: data.workOrderId,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        duration: duration != null ? new Prisma.Decimal(duration) : null,
        reason: data.reason,
        impact: data.impact || 'NONE',
        estimatedLoss: data.estimatedLoss != null ? new Prisma.Decimal(data.estimatedLoss) : null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: downtime });
  } catch (error: unknown) {
    logger.error('Failed to create downtime record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create downtime record' } });
  }
});

// GET /:id — Get downtime record by ID
router.get('/:id', async (req: Request, res: Response) => {
  if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
  try {
    const downtime = await prisma.cmmsDowntime.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: {
        asset: { select: { id: true, name: true, code: true } },
        workOrder: { select: { id: true, number: true, title: true } },
      },
    });

    if (!downtime) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Downtime record not found' } });
    }

    res.json({ success: true, data: downtime });
  } catch (error: unknown) {
    logger.error('Failed to get downtime record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get downtime record' } });
  }
});

// PUT /:id — Update downtime record
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = downtimeUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const existing = await prisma.cmmsDowntime.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Downtime record not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = data.endTime ? new Date(data.endTime) : null;
    if (data.duration !== undefined) updateData.duration = data.duration != null ? new Prisma.Decimal(data.duration) : null;
    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.impact !== undefined) updateData.impact = data.impact;
    if (data.estimatedLoss !== undefined) updateData.estimatedLoss = data.estimatedLoss != null ? new Prisma.Decimal(data.estimatedLoss) : null;

    const downtime = await prisma.cmmsDowntime.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: downtime });
  } catch (error: unknown) {
    logger.error('Failed to update downtime record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update downtime record' } });
  }
});

// DELETE /:id — Soft delete downtime record
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsDowntime.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Downtime record not found' } });
    }

    await prisma.cmmsDowntime.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Downtime record deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete downtime record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete downtime record' } });
  }
});

export default router;
