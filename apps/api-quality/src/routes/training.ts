import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-TRN';
  const count = await prisma.qualTraining.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  employeeId: z.string().min(1).max(100),
  employeeName: z.string().min(1).max(200),
  department: z.string().max(200).optional().nullable(),
  position: z.string().max(200).optional().nullable(),
  courseName: z.string().min(1).max(300),
  trainingType: z.enum(['INDUCTION', 'ROLE_SPECIFIC', 'QUALITY_AWARENESS', 'PROCESS_TRAINING', 'AUDIT_TRAINING', 'REFRESHER', 'REGULATORY', 'OTHER']).default('ROLE_SPECIFIC'),
  assignedDate: z.string().min(1),
  dueDate: z.string().min(1),
  deliveryMethod: z.enum(['ONLINE', 'CLASSROOM', 'WORKSHOP', 'WEBINAR', 'SELF_STUDY', 'BLENDED']).optional().nullable(),
  provider: z.string().max(300).optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  passMark: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'OVERDUE', 'CANCELLED']).optional(),
  completedDate: z.string().optional().nullable(),
  score: z.number().int().min(0).max(100).optional().nullable(),
  passed: z.boolean().optional().nullable(),
  certificate: z.string().max(500).optional().nullable(),
  feedback: z.string().max(2000).optional().nullable(),
});

const completeSchema = z.object({
  score: z.number().int().min(0).max(100),
  completedDate: z.string().optional(),
  certificate: z.string().max(500).optional(),
  feedback: z.string().max(2000).optional(),
});

// GET /overdue — Overdue training (must be before /:id)
router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      dueDate: { lt: new Date() },
      status: { not: 'COMPLETED' },
    };

    const [items, total] = await Promise.all([
      prisma.qualTraining.findMany({ where, skip, take: limit, orderBy: { dueDate: 'asc' } }),
      prisma.qualTraining.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list overdue training', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list overdue training' } });
  }
});

// GET /stats — Training statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, completed, inProgress, overdue, byType] = await Promise.all([
      prisma.qualTraining.count({ where: { deletedAt: null } }),
      prisma.qualTraining.count({ where: { deletedAt: null, status: 'COMPLETED' } }),
      prisma.qualTraining.count({ where: { deletedAt: null, status: 'IN_PROGRESS' } }),
      prisma.qualTraining.count({ where: { deletedAt: null, dueDate: { lt: new Date() }, status: { not: 'COMPLETED' } } }),
      prisma.qualTraining.groupBy({ by: ['trainingType'], where: { deletedAt: null }, _count: { id: true } }),
    ]);
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    res.json({ success: true, data: { total, completed, inProgress, overdue, completionRate, byType: byType.map((t: Record<string, unknown>) => ({ trainingType: t.trainingType, count: t._count.id })) } });
  } catch (error: unknown) {
    logger.error('Failed to get training stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get training stats' } });
  }
});

// GET / — List training records
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, trainingType, department, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (trainingType && typeof trainingType === 'string') where.trainingType = trainingType;
    if (department && typeof department === 'string') where.department = { contains: department, mode: 'insensitive' };
    if (search && typeof search === 'string') {
      where.OR = [
        { employeeName: { contains: search, mode: 'insensitive' } },
        { courseName: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualTraining.findMany({ where, skip, take: limit, orderBy: { dueDate: 'asc' } }),
      prisma.qualTraining.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list training records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list training records' } });
  }
});

// POST / — Create training record
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const referenceNumber = await generateRefNumber();

    const item = await prisma.qualTraining.create({
      data: {
        referenceNumber,
        ...parsed.data,
        assignedDate: new Date(parsed.data.assignedDate),
        dueDate: new Date(parsed.data.dueDate),
        status: 'ASSIGNED',
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create training record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create training record' } });
  }
});

// PUT /:id/complete — Mark as completed
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const parsed = completeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualTraining.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Training record not found' } });

    const passed = existing.passMark ? parsed.data.score >= existing.passMark : true;

    const item = await prisma.qualTraining.update({
      where: { id: req.params.id },
      data: {
        status: passed ? 'COMPLETED' : 'FAILED',
        score: parsed.data.score,
        completedDate: parsed.data.completedDate ? new Date(parsed.data.completedDate) : new Date(),
        certificate: parsed.data.certificate ?? null,
        feedback: parsed.data.feedback ?? null,
        passed,
      },
    });

    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to complete training record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete training record' } });
  }
});

// GET /:id — Get training record by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualTraining.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Training record not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get training record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get training record' } });
  }
});

// PUT /:id — Update training record
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualTraining.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Training record not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.assignedDate) data.assignedDate = new Date(parsed.data.assignedDate);
    if (parsed.data.dueDate) data.dueDate = new Date(parsed.data.dueDate);
    if ((parsed.data as any).completedDate) data.completedDate = new Date((parsed.data as any).completedDate);

    const item = await prisma.qualTraining.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update training record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update training record' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualTraining.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Training record not found' } });

    await prisma.qualTraining.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete training record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete training record' } });
  }
});

export default router;
