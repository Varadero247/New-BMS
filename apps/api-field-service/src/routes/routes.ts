import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const routeCreateSchema = z.object({
  technicianId: z.string().trim().uuid(),
  date: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  stops: z.array(z.any()),
  optimizedOrder: z.array(z.any()).optional().nullable(),
  totalDistance: z.number().nonnegative().optional().nullable(),
  totalDuration: z.number().int().optional().nullable(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

const routeUpdateSchema = z.object({
  stops: z.array(z.any()).optional(),
  optimizedOrder: z.array(z.any()).optional().nullable(),
  totalDistance: z.number().nonnegative().optional().nullable(),
  totalDuration: z.number().int().optional().nullable(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const RESERVED_PATHS = new Set(['optimize']);

// ---------------------------------------------------------------------------
// GET / — List routes
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { technicianId, date, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (technicianId) where.technicianId = String(technicianId);
    if (date) {
      const d = new Date(String(date));
      const nextDay = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      where.date = { gte: d, lt: nextDay };
    }
    if (status) where.status = String(status);

    const [data, total] = await Promise.all([
      prisma.fsSvcRoute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { technician: true },
      }),
      prisma.fsSvcRoute.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list routes', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list routes' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /optimize/:technicianId/:date — Optimized route for day
// ---------------------------------------------------------------------------
router.get('/optimize/:technicianId/:date', async (req: Request, res: Response) => {
  try {
    const { technicianId, date } = req.params;

    const technician = await prisma.fsSvcTechnician.findFirst({
      where: { id: technicianId, deletedAt: null },
    });
    if (!technician) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Technician not found' } });
    }

    const d = new Date(date);
    const nextDay = new Date(d.getTime() + 24 * 60 * 60 * 1000);

    const jobs = await prisma.fsSvcJob.findMany({
      where: {
        technicianId,
        deletedAt: null,
        status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] },
        scheduledStart: { gte: d, lt: nextDay },
      },
      include: { site: true, customer: true },
      orderBy: { scheduledStart: 'asc' },
      take: 1000,
    });

    // Simple optimization: order by scheduled start time
    const optimizedStops = jobs.map((job, index) => ({
      order: index + 1,
      jobId: job.id,
      jobNumber: job.number,
      customer: (job as { customer?: { name?: string } }).customer?.name,
      site: (job as { site?: { name?: string; address?: string } }).site?.name,
      address: (job as { site?: { name?: string; address?: string } }).site?.address,
      scheduledStart: job.scheduledStart,
      estimatedDuration: job.estimatedDuration,
    }));

    res.json({
      success: true,
      data: {
        technicianId,
        date,
        stops: optimizedStops,
        totalStops: optimizedStops.length,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to optimize route', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to optimize route' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create route
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = routeCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcRoute.create({
      data: {
        ...parsed.data,
        date: new Date(parsed.data.date),
        stops: parsed.data.stops as Prisma.InputJsonValue,
        optimizedOrder: parsed.data.optimizedOrder as Prisma.InputJsonValue,
        totalDistance: parsed.data.totalDistance
          ? new Prisma.Decimal(parsed.data.totalDistance)
          : null,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create route', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create route' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get route
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const data = await prisma.fsSvcRoute.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { technician: true },
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get route', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get route' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update route
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcRoute.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
    }

    const parsed = routeUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.stops) updateData.stops = parsed.data.stops as Prisma.InputJsonValue;
    if (parsed.data.optimizedOrder !== undefined)
      updateData.optimizedOrder = parsed.data.optimizedOrder as Prisma.InputJsonValue;
    if (parsed.data.totalDistance !== undefined)
      updateData.totalDistance = parsed.data.totalDistance
        ? new Prisma.Decimal(parsed.data.totalDistance)
        : null;

    const data = await prisma.fsSvcRoute.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update route', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update route' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete route
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcRoute.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
    }

    await prisma.fsSvcRoute.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Route deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete route', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete route' },
    });
  }
});

export default router;
