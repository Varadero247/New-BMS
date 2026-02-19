import { randomUUID } from 'crypto';
import { Router, Response, Request } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-health-safety');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const ACTION_TYPES = ['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'IMMEDIATE'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'OVERDUE', 'CANCELLED'] as const;

function generateRefNumber(): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 10000)
    .toString()
    .padStart(4, '0');
  return `HSA-${yy}${mm}-${rand}`;
}

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(5000),
  type: z.enum(ACTION_TYPES),
  priority: z.enum(PRIORITIES).default('MEDIUM'),
  ownerId: z.string().trim().min(1).max(200),
  incidentId: z.string().trim().optional().nullable(),
  riskId: z.string().trim().optional().nullable(),
  dueDate: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  estimatedCost: z.number().nonnegative().optional().nullable(),
  verificationMethod: z.string().trim().max(500).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(STATUSES).optional(),
  completedAt: z.string().trim().optional().nullable(),
  verifiedAt: z.string().trim().optional().nullable(),
  verificationNotes: z.string().trim().max(2000).optional().nullable(),
  effectivenessRating: z.number().int().min(1).max(5).optional().nullable(),
  actualCost: z.number().nonnegative().optional().nullable(),
});

// GET /overdue — Overdue actions (must be before /:id)
router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
      dueDate: { lt: new Date() },
      status: { notIn: ['COMPLETED', 'VERIFIED', 'CANCELLED'] },
    };

    const [items, total] = await Promise.all([
      prisma.hSAction.findMany({ where, skip, take: limit, orderBy: { dueDate: 'asc' } }),
      prisma.hSAction.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('List overdue actions error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list overdue actions' },
    });
  }
});

// GET /stats — Action statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, open, inProgress, completed, overdue, byType] = await Promise.all([
      prisma.hSAction.count({ where: { deletedAt: null } }),
      prisma.hSAction.count({ where: { deletedAt: null, status: 'OPEN' } }),
      prisma.hSAction.count({ where: { deletedAt: null, status: 'IN_PROGRESS' } }),
      prisma.hSAction.count({
        where: { deletedAt: null, status: { in: ['COMPLETED', 'VERIFIED'] } as any },
      }),
      prisma.hSAction.count({
        where: {
          deletedAt: null,
          dueDate: { lt: new Date() } as any,
          status: { notIn: ['COMPLETED', 'VERIFIED', 'CANCELLED'] },
        },
      }),
      prisma.hSAction.groupBy({
        by: ['type'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        completed,
        overdue,
        byType: byType.map((t: Record<string, unknown>) => ({
          type: t.type,
          count: (t as { _count: { id: number } })._count.id,
        })),
      },
    });
  } catch (error) {
    logger.error('Action stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get action stats' },
    });
  }
});

// GET / — List actions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, priority, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { ownerId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.hSAction.findMany({ where, skip, take: limit, orderBy: { dueDate: 'asc' } }),
      prisma.hSAction.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('List actions error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list actions' },
    });
  }
});

// POST / — Create action
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const action = await prisma.hSAction.create({
      data: {
        referenceNumber: generateRefNumber(),
        ...parsed.data,
        dueDate: new Date(parsed.data.dueDate),
        createdById: authReq.user?.id || 'system',
        status: 'OPEN',
      },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    logger.error('Create action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create action' },
    });
  }
});

// GET /:id — Get single action
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const action = await prisma.hSAction.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!action)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    res.json({ success: true, data: action });
  } catch (error) {
    logger.error('Get action error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get action' } });
  }
});

// PUT /:id — Update action
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.hSAction.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dueDate) data.dueDate = new Date(parsed.data.dueDate);
    if (parsed.data.completedAt)
      data.completedAt = new Date(parsed.data.completedAt);
    if (parsed.data.verifiedAt)
      data.verifiedAt = new Date(parsed.data.verifiedAt);

    const action = await prisma.hSAction.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: action });
  } catch (error) {
    logger.error('Update action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update action' },
    });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hSAction.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });

    await prisma.hSAction.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error) {
    logger.error('Delete action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete action' },
    });
  }
});

export default router;
