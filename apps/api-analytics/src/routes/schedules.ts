import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const scheduleTypeEnum = z.enum(['REPORT', 'EXPORT', 'REFRESH', 'ALERT_CHECK']);

const scheduleCreateSchema = z.object({
  name: z.string().min(1).max(200),
  type: scheduleTypeEnum,
  referenceId: z.string().uuid(),
  cronExpression: z.string().min(1).max(100),
  isActive: z.boolean().optional().default(true),
  timezone: z.string().max(50).optional().default('UTC'),
});

const scheduleUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: scheduleTypeEnum.optional(),
  referenceId: z.string().uuid().optional(),
  cronExpression: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  timezone: z.string().max(50).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function matchCronField(field: string, value: number): boolean {
  if (field === '*') return true;
  if (field.includes('/')) {
    const [rangeStr, stepStr] = field.split('/');
    const step = parseInt(stepStr, 10);
    if (isNaN(step) || step <= 0) return false;
    if (rangeStr === '*') return value % step === 0;
    const start = parseInt(rangeStr, 10);
    return !isNaN(start) && value >= start && (value - start) % step === 0;
  }
  if (field.includes('-')) {
    const [startStr, endStr] = field.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    return !isNaN(start) && !isNaN(end) && value >= start && value <= end;
  }
  if (field.includes(',')) {
    return field.split(',').some((v) => parseInt(v.trim(), 10) === value);
  }
  return parseInt(field, 10) === value;
}

function getNextCronRun(cronExpression: string): Date {
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) return new Date(Date.now() + 3600000);

  const [minF, hourF, domF, monF, dowF] = parts;
  const result = new Date();
  result.setSeconds(0, 0);
  result.setMinutes(result.getMinutes() + 1);

  // Iterate minute-by-minute up to 1 year ahead
  for (let i = 0; i < 525600; i++) {
    if (
      matchCronField(minF, result.getMinutes()) &&
      matchCronField(hourF, result.getHours()) &&
      matchCronField(domF, result.getDate()) &&
      matchCronField(monF, result.getMonth() + 1) &&
      matchCronField(dowF, result.getDay())
    ) {
      return new Date(result);
    }
    result.setMinutes(result.getMinutes() + 1);
  }

  return new Date(Date.now() + 3600000);
}

// ===================================================================
// GET /api/schedules — List schedules
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, isActive, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (typeof type === 'string' && type.length > 0) where.type = type;
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;
    if (typeof search === 'string' && search.length > 0) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [schedules, total] = await Promise.all([
      prisma.analyticsSchedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsSchedule.count({ where }),
    ]);

    res.json({
      success: true,
      data: schedules,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list schedules', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list schedules' } });
  }
});

// ===================================================================
// POST /api/schedules — Create schedule
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = scheduleCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const data = parsed.data;

    const nextRun = getNextCronRun(data.cronExpression);

    const schedule = await prisma.analyticsSchedule.create({
      data: {
        name: data.name,
        type: data.type,
        referenceId: data.referenceId,
        cronExpression: data.cronExpression,
        isActive: data.isActive,
        timezone: data.timezone,
        nextRun,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Schedule created', { id: schedule.id, name: schedule.name });
    res.status(201).json({ success: true, data: schedule });
  } catch (error: unknown) {
    logger.error('Failed to create schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create schedule' } });
  }
});

// ===================================================================
// PUT /api/schedules/:id/toggle — Enable/disable schedule
// ===================================================================

router.put('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.analyticsSchedule.findFirst({ where: { id, deletedAt: null } as any });
    if (!schedule) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    }

    const updated = await prisma.analyticsSchedule.update({
      where: { id },
      data: { isActive: !schedule.isActive },
    });

    logger.info('Schedule toggled', { id, isActive: updated.isActive });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to toggle schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to toggle schedule' } });
  }
});

// ===================================================================
// GET /api/schedules/:id — Get schedule by ID
// ===================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const schedule = await prisma.analyticsSchedule.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!schedule) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    }

    res.json({ success: true, data: schedule });
  } catch (error: unknown) {
    logger.error('Failed to get schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get schedule' } });
  }
});

// ===================================================================
// PUT /api/schedules/:id — Update schedule
// ===================================================================

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsSchedule.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    }

    const parsed = scheduleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const updated = await prisma.analyticsSchedule.update({
      where: { id },
      data: parsed.data,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update schedule' } });
  }
});

// ===================================================================
// DELETE /api/schedules/:id — Soft delete schedule
// ===================================================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsSchedule.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } });
    }

    await prisma.analyticsSchedule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Schedule deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete schedule' } });
  }
});

export default router;
