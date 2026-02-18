import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// Calculate next due date based on frequency and last performed
function calcNextDue(lastPerformed: Date | null, frequency: string): Date {
  const base = lastPerformed ?? new Date();
  const next = new Date(base);
  switch (frequency) {
    case 'DAILY':       next.setDate(next.getDate() + 1); break;
    case 'WEEKLY':      next.setDate(next.getDate() + 7); break;
    case 'BIWEEKLY':    next.setDate(next.getDate() + 14); break;
    case 'MONTHLY':     next.setMonth(next.getMonth() + 1); break;
    case 'QUARTERLY':   next.setMonth(next.getMonth() + 3); break;
    case 'BIANNUAL':    next.setMonth(next.getMonth() + 6); break;
    case 'ANNUAL':      next.setFullYear(next.getFullYear() + 1); break;
    default:            next.setMonth(next.getMonth() + 1); break;
  }
  return next;
}

const scheduleCompleteSchema = z.object({
  completedDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

const scheduleSchema = z.object({
  assetId: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(300),
  description: z.string().max(2000).optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL', 'AS_NEEDED']).default('MONTHLY'),
  tasks: z.array(z.string()).default([]),
  assignedTo: z.string().max(200).optional().nullable(),
  estimatedDuration: z.number().int().min(0).optional().nullable(),
  estimatedCost: z.number().optional().nullable(),
  lastPerformed: z.string().optional().nullable(),
  nextDue: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const updateScheduleSchema = scheduleSchema.partial();

// GET /upcoming — Upcoming scheduled maintenance (must be before /:id)
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const days = parseIntParam(req.query.days, 30);
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    const where = {
      deletedAt: null,
      isActive: true,
      nextDue: { lte: cutoff },
    };

    const [items, total] = await Promise.all([
      prisma.cmmsPreventivePlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nextDue: 'asc' },
        include: { asset: { select: { id: true, name: true, location: true } } },
      }),
      prisma.cmmsPreventivePlan.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list upcoming maintenance', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list upcoming maintenance' } });
  }
});

// GET /overdue — Overdue scheduled maintenance
router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      isActive: true,
      nextDue: { lt: new Date() },
    };

    const [items, total] = await Promise.all([
      prisma.cmmsPreventivePlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nextDue: 'asc' },
        include: { asset: { select: { id: true, name: true, location: true } } },
      }),
      prisma.cmmsPreventivePlan.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list overdue maintenance', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list overdue maintenance' } });
  }
});

// GET /calendar — Calendar view for a given month
router.get('/calendar', async (req: Request, res: Response) => {
  try {
    const year = parseIntParam(req.query.year, new Date().getFullYear());
    const month = parseIntParam(req.query.month, new Date().getMonth() + 1) - 1;

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    const scheduled = await prisma.cmmsPreventivePlan.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        nextDue: { gte: start, lte: end } as any,
      },
      orderBy: { nextDue: 'asc' },
      include: { asset: { select: { id: true, name: true } } },
      take: 1000});

    // Also include work orders scheduled this month
    const workOrders = await prisma.cmmsWorkOrder.findMany({
      where: {
        deletedAt: null,
        scheduledStart: { gte: start, lte: end } as any,
      },
      orderBy: { scheduledStart: 'asc' },
      include: { asset: { select: { id: true, name: true } } },
      take: 1000});

    res.json({ success: true, data: { year, month: month + 1, scheduled, workOrders } });
  } catch (error: unknown) {
    logger.error('Failed to get calendar', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get maintenance calendar' } });
  }
});

// GET / — List all maintenance schedules (preventive plans)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assetId, isActive, frequency, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (assetId && typeof assetId === 'string') where.assetId = assetId;
    if (frequency && typeof frequency === 'string') where.frequency = frequency;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.cmmsPreventivePlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nextDue: 'asc' },
        include: { asset: { select: { id: true, name: true, location: true } } },
      }),
      prisma.cmmsPreventivePlan.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list schedules', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list maintenance schedules' } });
  }
});

// POST / — Create maintenance schedule
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const lastPerformed = parsed.data.lastPerformed ? new Date(parsed.data.lastPerformed) : null;
    const nextDue = parsed.data.nextDue
      ? new Date(parsed.data.nextDue)
      : calcNextDue(lastPerformed, parsed.data.frequency);

    const item = await prisma.cmmsPreventivePlan.create({
      data: {
        name: parsed.data.name,
        assetId: parsed.data.assetId,
        description: parsed.data.description ?? null,
        frequency: parsed.data.frequency as any,
        tasks: parsed.data.tasks,
        assignedTo: parsed.data.assignedTo ?? null,
        estimatedDuration: parsed.data.estimatedDuration ?? null,
        estimatedCost: parsed.data.estimatedCost ?? null,
        lastPerformed,
        nextDue,
        isActive: parsed.data.isActive,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create maintenance schedule' } });
  }
});

// POST /:id/complete — Mark as completed, advance next due date
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const completeParsed = scheduleCompleteSchema.safeParse(req.body);
    if (!completeParsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: completeParsed.error.errors[0]?.message || 'Invalid completion data' } });
    }
    const completedDate = completeParsed.data.completedDate ? new Date(completeParsed.data.completedDate) : new Date();

    const existing = await prisma.cmmsPreventivePlan.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });

    const nextDue = calcNextDue(completedDate, existing.frequency);

    const item = await prisma.cmmsPreventivePlan.update({
      where: { id: req.params.id },
      data: { lastPerformed: completedDate, nextDue },
    });

    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to complete schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete maintenance schedule' } });
  }
});

// GET /:id — Get schedule by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.cmmsPreventivePlan.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { asset: { select: { id: true, name: true, location: true } } },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get maintenance schedule' } });
  }
});

// PUT /:id — Update schedule
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.cmmsPreventivePlan.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.lastPerformed) data.lastPerformed = new Date(parsed.data.lastPerformed);
    if (parsed.data.nextDue) data.nextDue = new Date(parsed.data.nextDue);

    // Auto-recalculate nextDue if frequency or lastPerformed changed but nextDue not explicitly set
    if ((parsed.data.frequency || parsed.data.lastPerformed) && !parsed.data.nextDue) {
      const newFrequency = parsed.data.frequency || existing.frequency;
      const newLastPerformed = data.lastPerformed as Date | null || existing.lastPerformed;
      data.nextDue = calcNextDue(newLastPerformed, newFrequency);
    }

    const item = await prisma.cmmsPreventivePlan.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update maintenance schedule' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsPreventivePlan.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });

    await prisma.cmmsPreventivePlan.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete maintenance schedule' } });
  }
});

export default router;
