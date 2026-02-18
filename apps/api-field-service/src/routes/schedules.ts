import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const scheduleCreateSchema = z.object({
  technicianId: z.string().trim().uuid(),
  date: z.string(),
  slots: z.array(z.any()),
  isAvailable: z.boolean().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

const scheduleUpdateSchema = z.object({
  slots: z.array(z.any()).optional(),
  isAvailable: z.boolean().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const RESERVED_PATHS = new Set(['calendar']);

// ---------------------------------------------------------------------------
// GET / — List schedules
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { technicianId, date, isAvailable } = req.query;
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
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';

    const [data, total] = await Promise.all([
      prisma.fsSvcSchedule.findMany({ where, skip, take: limit, orderBy: { date: 'desc' }, include: { technician: true } }),
      prisma.fsSvcSchedule.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list schedules', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list schedules' } });
  }
});

// ---------------------------------------------------------------------------
// GET /calendar/:technicianId — Calendar view
// ---------------------------------------------------------------------------
router.get('/calendar/:technicianId', async (req: Request, res: Response) => {
  try {
    const { technicianId } = req.params;
    const { startDate, endDate } = req.query;

    const technician = await prisma.fsSvcTechnician.findFirst({ where: { id: technicianId, deletedAt: null } as any });
    if (!technician) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Technician not found' } });
    }

    const where: Record<string, unknown> = { technicianId, deletedAt: null };
    if (startDate || endDate) {
      (where as any).date = {};
      if (startDate) (where as any).date.gte = new Date(String(startDate));
      if (endDate) (where as any).date.lte = new Date(String(endDate));
    }

    const schedules = await prisma.fsSvcSchedule.findMany({
      where,
      orderBy: { date: 'asc' },
      take: 1000});

    const jobs = await prisma.fsSvcJob.findMany({
      where: {
        technicianId,
        deletedAt: null,
        status: { notIn: ['CANCELLED'] } as any,
        ...(startDate || endDate ? {
          scheduledStart: {
            ...(startDate ? { gte: new Date(String(startDate)) } : {}),
            ...(endDate ? { lte: new Date(String(endDate)) } : {}),
          },
        } : {}),
      },
      orderBy: { scheduledStart: 'asc' },
      include: { customer: true, site: true },
      take: 1000});

    res.json({ success: true, data: { technician, schedules, jobs } });
  } catch (error: unknown) {
    logger.error('Failed to get calendar', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get calendar' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create schedule
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = scheduleCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcSchedule.create({
      data: {
        ...parsed.data,
        date: new Date(parsed.data.date),
        slots: parsed.data.slots as any,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create schedule' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get schedule
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const data = await prisma.fsSvcSchedule.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { technician: true },
    });

    if (!data) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get schedule' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update schedule
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcSchedule.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    }

    const parsed = scheduleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const data = await prisma.fsSvcSchedule.update({
      where: { id: req.params.id },
      data: { ...parsed.data, slots: parsed.data.slots as any },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update schedule' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete schedule
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcSchedule.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    }

    await prisma.fsSvcSchedule.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Schedule deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete schedule' } });
  }
});

export default router;
