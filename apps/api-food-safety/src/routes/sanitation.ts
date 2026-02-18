import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-food-safety');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const sanitationCreateSchema = z.object({
  area: z.string().trim().min(1).max(200),
  procedure: z.string().trim().min(1).max(2000),
  frequency: z.enum(['CONTINUOUS', 'HOURLY', 'PER_BATCH', 'DAILY', 'WEEKLY']),
  scheduledDate: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  completedBy: z.string().max(200).optional().nullable(),
  result: z.enum(['PASS', 'FAIL', 'CONDITIONAL']).optional().nullable(),
  findings: z.string().max(2000).optional().nullable(),
  verifiedBy: z.string().max(200).optional().nullable(),
});

const sanitationCompleteSchema = z.object({
  result: z.enum(['PASS', 'FAIL', 'CONDITIONAL']).optional().nullable(),
  findings: z.string().max(2000).optional().nullable(),
  verifiedBy: z.string().max(200).optional().nullable(),
});

const sanitationUpdateSchema = z.object({
  area: z.string().trim().min(1).max(200).optional(),
  procedure: z.string().trim().min(1).max(2000).optional(),
  frequency: z.enum(['CONTINUOUS', 'HOURLY', 'PER_BATCH', 'DAILY', 'WEEKLY']).optional(),
  scheduledDate: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'OVERDUE', 'FAILED']).optional(),
  completedBy: z.string().max(200).optional().nullable(),
  result: z.enum(['PASS', 'FAIL', 'CONDITIONAL']).optional().nullable(),
  findings: z.string().max(2000).optional().nullable(),
  verifiedBy: z.string().max(200).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET /api/sanitation/overdue
// ---------------------------------------------------------------------------
router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSanitation.findMany({
      where: {
        deletedAt: null,
        status: 'OVERDUE',
      } as any,
      orderBy: { scheduledDate: 'asc' },
      take: 500,
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Error fetching overdue sanitation tasks', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch overdue sanitation tasks' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/sanitation
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { area, status, frequency } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (area) where.area = { contains: String(area), mode: 'insensitive' };
    if (status) where.status = String(status);
    if (frequency) where.frequency = String(frequency);

    const [data, total] = await Promise.all([
      prisma.fsSanitation.findMany({ where, skip, take: limit, orderBy: { scheduledDate: 'desc' } }),
      prisma.fsSanitation.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing sanitation tasks', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list sanitation tasks' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/sanitation
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = sanitationCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const user = (req as AuthRequest).user;

    const task = await prisma.fsSanitation.create({
      data: {
        ...body,
        scheduledDate: new Date(body.scheduledDate),
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Sanitation task created', { id: task.id });
    res.status(201).json({ success: true, data: task });
  } catch (error: unknown) {
    logger.error('Error creating sanitation task', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create sanitation task' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/sanitation/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const task = await prisma.fsSanitation.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!task) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sanitation task not found' } });
    }

    res.json({ success: true, data: task });
  } catch (error: unknown) {
    logger.error('Error fetching sanitation task', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch sanitation task' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/sanitation/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const RESERVED = new Set(['complete']);
    if (RESERVED.has(req.params.id)) return (undefined as any);

    const existing = await prisma.fsSanitation.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sanitation task not found' } });
    }

    const parsed = sanitationUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const updateData: Record<string, unknown> = { ...body };
    if (body.scheduledDate) updateData.scheduledDate = new Date(body.scheduledDate);

    const task = await prisma.fsSanitation.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Sanitation task updated', { id: task.id });
    res.json({ success: true, data: task });
  } catch (error: unknown) {
    logger.error('Error updating sanitation task', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update sanitation task' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/sanitation/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSanitation.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sanitation task not found' } });
    }

    await prisma.fsSanitation.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Sanitation task deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Sanitation task deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting sanitation task', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete sanitation task' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/sanitation/:id/complete
// ---------------------------------------------------------------------------
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSanitation.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sanitation task not found' } });
    }

    if (existing.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_COMPLETED', message: 'Sanitation task is already completed' } });
    }

    const completeParsed = sanitationCompleteSchema.safeParse(req.body);
    if (!completeParsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: completeParsed.error.errors[0]?.message || 'Invalid completion data' } });
    }
    const { result, findings, verifiedBy } = completeParsed.data;

    const task = await prisma.fsSanitation.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        completedBy: (req as AuthRequest).user?.id || 'system',
        ...(result != null ? { result } : {}),
        ...(findings != null ? { findings } : {}),
        ...(verifiedBy != null ? { verifiedBy } : {}),
      },
    });

    logger.info('Sanitation task completed', { id: task.id });
    res.json({ success: true, data: task });
  } catch (error: unknown) {
    logger.error('Error completing sanitation task', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete sanitation task' } });
  }
});

export default router;
