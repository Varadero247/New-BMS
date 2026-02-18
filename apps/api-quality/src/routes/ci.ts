import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-CI';
  const count = await prisma.qualContinuousImprovement.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(5000),
  source: z.string().max(200).optional().nullable(),
  category: z.string().max(200).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  submittedBy: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
  assignedTo: z.string().max(200).optional().nullable(),
  targetDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
  isoClause: z.string().max(200).optional().nullable(),
  expectedBenefit: z.string().max(2000).optional().nullable(),
  estimatedCost: z.number().optional().nullable(),
  estimatedSaving: z.number().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['IDEA', 'UNDER_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'ON_HOLD']).optional(),
  completedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
  actualSaving: z.number().optional().nullable(),
  reviewNotes: z.string().max(5000).optional().nullable(),
  approvedBy: z.string().max(200).optional().nullable(),
  approvedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
});

// GET /stats — CI statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, ideas, approved, inProgress, completed, byPriority] = await Promise.all([
      prisma.qualContinuousImprovement.count({ where: { deletedAt: null } as any }),
      prisma.qualContinuousImprovement.count({ where: { deletedAt: null, status: 'IDEA' } as any }),
      prisma.qualContinuousImprovement.count({ where: { deletedAt: null, status: 'APPROVED' } as any }),
      prisma.qualContinuousImprovement.count({ where: { deletedAt: null, status: 'IN_PROGRESS' } as any }),
      prisma.qualContinuousImprovement.count({ where: { deletedAt: null, status: 'COMPLETED' } as any }),
      prisma.qualContinuousImprovement.groupBy({ by: ['priority'], where: { deletedAt: null } as any, _count: { id: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total, ideas, approved, inProgress, completed,
        byPriority: byPriority.map((p: Record<string, unknown>) => ({ priority: p.priority, count: (p as any)._count.id })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get CI stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get CI stats' } });
  }
});

// GET / — List continuous improvements
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority, category, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (priority && typeof priority === 'string') where.priority = priority;
    if (category && typeof category === 'string') where.category = { contains: category, mode: 'insensitive' };
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { submittedBy: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualContinuousImprovement.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.qualContinuousImprovement.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list continuous improvements', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list continuous improvements' } });
  }
});

// POST / — Create continuous improvement
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const referenceNumber = await generateRefNumber();

    const item = await prisma.qualContinuousImprovement.create({
      data: {
        referenceNumber,
        ...parsed.data,
        targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
        status: 'IDEA',
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create continuous improvement', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create continuous improvement' } });
  }
});

// GET /:id — Get by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualContinuousImprovement.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Continuous improvement not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get continuous improvement', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get continuous improvement' } });
  }
});

// PUT /:id — Update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualContinuousImprovement.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Continuous improvement not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.targetDate) data.targetDate = new Date(parsed.data.targetDate);
    if ((parsed.data as any).completedDate) data.completedDate = new Date((parsed.data as any).completedDate);
    if ((parsed.data as any).approvedDate) data.approvedDate = new Date((parsed.data as any).approvedDate);

    const item = await prisma.qualContinuousImprovement.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update continuous improvement', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update continuous improvement' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualContinuousImprovement.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Continuous improvement not found' } });

    await prisma.qualContinuousImprovement.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete continuous improvement', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete continuous improvement' } });
  }
});

export default router;
