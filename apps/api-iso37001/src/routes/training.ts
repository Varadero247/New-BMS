import { randomUUID } from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso37001');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `AB-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const trainingCreateSchema = z.object({
  employeeId: z.string().trim().min(1).max(100),
  employeeName: z.string().trim().min(1).max(200),
  courseName: z.string().trim().min(1).max(300),
  courseType: z.enum([
    'GENERAL_AWARENESS',
    'ROLE_SPECIFIC',
    'MANAGEMENT_TRAINING',
    'BOARD_TRAINING',
    'THIRD_PARTY_TRAINING',
    'REFRESHER',
    'INDUCTION',
    'SPECIALIST',
    'OTHER',
  ]),
  assignedDate: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  dueDate: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  department: z.string().trim().max(200).optional(),
  position: z.string().trim().max(200).optional(),
  deliveryMethod: z
    .enum(['ONLINE', 'CLASSROOM', 'WORKSHOP', 'WEBINAR', 'SELF_STUDY', 'BLENDED'])
    .optional(),
  duration: z.number().int().min(0).optional(),
  provider: z.string().trim().max(300).optional(),
  passMark: z.number().int().min(0).max(100).optional(),
  notes: z.string().trim().max(2000).optional(),
});

const trainingUpdateSchema = z.object({
  employeeName: z.string().trim().min(1).max(200).optional(),
  courseName: z.string().trim().min(1).max(300).optional(),
  courseType: z
    .enum([
      'GENERAL_AWARENESS',
      'ROLE_SPECIFIC',
      'MANAGEMENT_TRAINING',
      'BOARD_TRAINING',
      'THIRD_PARTY_TRAINING',
      'REFRESHER',
      'INDUCTION',
      'SPECIALIST',
      'OTHER',
    ])
    .optional(),
  assignedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  dueDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  department: z.string().trim().max(200).optional(),
  position: z.string().trim().max(200).optional(),
  deliveryMethod: z
    .enum(['ONLINE', 'CLASSROOM', 'WORKSHOP', 'WEBINAR', 'SELF_STUDY', 'BLENDED'])
    .optional(),
  duration: z.number().int().min(0).optional(),
  provider: z.string().trim().max(300).optional(),
  passMark: z.number().int().min(0).max(100).optional(),
  notes: z.string().trim().max(2000).optional(),
});

const completeSchema = z.object({
  score: z.number().int().min(0).max(100),
  completedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  certificate: z.string().trim().max(500).optional(),
  feedback: z.string().trim().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Reserved paths for /:id routes
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['health', 'overdue', 'stats', 'export']);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /overdue — List overdue training (must be before /:id)
router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
      dueDate: { lt: new Date() },
      status: { not: 'COMPLETED' },
    };

    const [records, total] = await Promise.all([
      (prisma as any).abTraining.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
      }),
      (prisma as any).abTraining.count({ where }),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list overdue training', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list overdue training' },
    });
  }
});

// GET /stats — Training completion statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, completed, inProgress, overdue, byType] = await Promise.all([
      (prisma as any).abTraining.count({ where: { deletedAt: null } as any }),
      (prisma as any).abTraining.count({ where: { deletedAt: null, status: 'COMPLETED' } as any }),
      (prisma as any).abTraining.count({
        where: { deletedAt: null, status: 'IN_PROGRESS' } as any,
      }),
      (prisma as any).abTraining.count({
        where: {
          deletedAt: null,
          dueDate: { lt: new Date() } as any,
          status: { not: 'COMPLETED' },
        },
      }),
      (prisma as any).abTraining.groupBy({
        by: ['courseType'],
        where: { deletedAt: null } as any,
        _count: { id: true },
      }),
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        overdue,
        completionRate,
        byType: byType.map((t: any) => ({
          courseType: t.courseType,
          count: (t as { _count: { id: number } })._count.id,
        })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get training stats', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get training stats' },
    });
  }
});

// GET / — List training records
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, department, courseType, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (department && typeof department === 'string') {
      where.department = { contains: department, mode: 'insensitive' };
    }
    if (courseType && typeof courseType === 'string') {
      where.courseType = courseType;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { employeeName: { contains: search, mode: 'insensitive' } },
        { courseName: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await Promise.all([
      (prisma as any).abTraining.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).abTraining.count({ where }),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list training records', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list training records' },
    });
  }
});

// POST / — Create training record
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = trainingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const referenceNumber = generateReference('TRN');

    const record = await (prisma as any).abTraining.create({
      data: {
        ...parsed.data,
        referenceNumber,
        status: 'ASSIGNED',
        createdBy: userId,
        updatedBy: userId,
      },
    });

    logger.info('Training record created', { id: record.id, referenceNumber });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to create training record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create training record' },
    });
  }
});

// GET /:id — Get by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return next('route');

    const record = await (prisma as any).abTraining.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Training record not found' },
      });
    }

    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to get training record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get training record' },
    });
  }
});

// PUT /:id — Update
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return next('route');

    const parsed = trainingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await (prisma as any).abTraining.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Training record not found' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const record = await (prisma as any).abTraining.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        updatedBy: userId,
      },
    });

    logger.info('Training record updated', { id: record.id });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to update training record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update training record' },
    });
  }
});

// PUT /:id/complete — Mark as completed with score
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const parsed = completeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await (prisma as any).abTraining.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Training record not found' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    // Check pass mark
    const passed = existing.passMark ? parsed.data.score >= existing.passMark : true;

    const record = await (prisma as any).abTraining.update({
      where: { id: req.params.id },
      data: {
        status: passed ? 'COMPLETED' : 'FAILED',
        score: parsed.data.score,
        completedDate: parsed.data.completedDate ? new Date(parsed.data.completedDate) : new Date(),
        certificate: parsed.data.certificate,
        feedback: parsed.data.feedback,
        passed,
        updatedBy: userId,
      },
    });

    logger.info('Training record completed', { id: record.id, score: parsed.data.score, passed });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to complete training record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete training record' },
    });
  }
});

export default router;
