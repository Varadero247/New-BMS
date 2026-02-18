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
  const prefix = 'QMS-INV';
  const count = await prisma.qualInvestigation.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(5000),
  source: z.string().max(200).optional().nullable(),
  relatedId: z.string().max(100).optional().nullable(),
  relatedType: z.string().max(100).optional().nullable(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  assignedTo: z.string().max(200).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  methodology: z.string().max(200).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED', 'CANCELLED']).optional(),
  completedDate: z.string().optional().nullable(),
  immediateCause: z.string().max(5000).optional().nullable(),
  rootCause: z.string().max(5000).optional().nullable(),
  contributingFactors: z.string().max(5000).optional().nullable(),
  findings: z.string().max(10000).optional().nullable(),
  recommendations: z.string().max(5000).optional().nullable(),
  correctiveActions: z.string().max(5000).optional().nullable(),
});

// GET /stats — Investigation statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, open, inProgress, closed, bySeverity] = await Promise.all([
      prisma.qualInvestigation.count({ where: { deletedAt: null } as any }),
      prisma.qualInvestigation.count({ where: { deletedAt: null, status: 'OPEN' } as any }),
      prisma.qualInvestigation.count({ where: { deletedAt: null, status: 'IN_PROGRESS' } as any }),
      prisma.qualInvestigation.count({ where: { deletedAt: null, status: 'CLOSED' } as any }),
      prisma.qualInvestigation.groupBy({ by: ['severity'], where: { deletedAt: null } as any, _count: { id: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total, open, inProgress, closed,
        bySeverity: bySeverity.map((s: Record<string, unknown>) => ({ severity: s.severity, count: (s as any)._count.id })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get investigation stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get investigation stats' } });
  }
});

// GET / — List investigations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, severity, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (severity && typeof severity === 'string') where.severity = severity;
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualInvestigation.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.qualInvestigation.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list investigations', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list investigations' } });
  }
});

// POST / — Create investigation
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const referenceNumber = await generateRefNumber();

    const item = await prisma.qualInvestigation.create({
      data: {
        referenceNumber,
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        status: 'OPEN',
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create investigation' } });
  }
});

// GET /:id — Get investigation by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualInvestigation.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Investigation not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get investigation' } });
  }
});

// PUT /:id — Update investigation
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualInvestigation.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Investigation not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dueDate) data.dueDate = new Date(parsed.data.dueDate);
    if ((parsed.data as any).completedDate) data.completedDate = new Date((parsed.data as any).completedDate);

    const item = await prisma.qualInvestigation.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update investigation' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualInvestigation.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Investigation not found' } });

    await prisma.qualInvestigation.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete investigation' } });
  }
});

export default router;
