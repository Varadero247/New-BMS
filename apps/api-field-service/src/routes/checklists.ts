import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const checklistCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  items: z.array(z.any()),
  isActive: z.boolean().optional(),
});

const checklistUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  items: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
});

const checklistResultCreateSchema = z.object({
  jobId: z.string().trim().uuid(),
  completedAt: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  results: z.array(z.any()),
  overallResult: z.enum(['PASS', 'FAIL', 'PARTIAL']),
  notes: z.string().trim().max(2000).optional().nullable(),
  signature: z.string().trim().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List checklists
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, isActive } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (category) where.category = String(category);
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await Promise.all([
      prisma.fsSvcChecklist.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsSvcChecklist.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list checklists', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list checklists' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create checklist
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = checklistCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcChecklist.create({
      data: {
        ...parsed.data,
        items: parsed.data.items as Prisma.InputJsonValue,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create checklist', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create checklist' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get checklist
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcChecklist.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get checklist', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get checklist' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update checklist
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcChecklist.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }

    const parsed = checklistUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const data = await prisma.fsSvcChecklist.update({
      where: { id: req.params.id },
      data: { ...parsed.data, items: parsed.data.items as Prisma.InputJsonValue },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update checklist', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update checklist' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete checklist
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcChecklist.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }

    await prisma.fsSvcChecklist.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Checklist deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete checklist', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete checklist' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/results — Submit checklist results
// ---------------------------------------------------------------------------
router.post('/:id/results', async (req: Request, res: Response) => {
  try {
    const checklist = await prisma.fsSvcChecklist.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!checklist) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }

    const parsed = checklistResultCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcChecklistResult.create({
      data: {
        checklistId: req.params.id,
        jobId: parsed.data.jobId,
        completedBy: authReq.user!.id,
        completedAt: new Date(parsed.data.completedAt),
        results: parsed.data.results as Prisma.InputJsonValue,
        overallResult: parsed.data.overallResult,
        notes: parsed.data.notes,
        signature: parsed.data.signature,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to submit checklist results', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to submit checklist results' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/results — Get checklist results
// ---------------------------------------------------------------------------
router.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const checklist = await prisma.fsSvcChecklist.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!checklist) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }

    const data = await prisma.fsSvcChecklistResult.findMany({
      where: { checklistId: req.params.id, deletedAt: null },
      orderBy: { completedAt: 'desc' },
      take: 1000,
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get checklist results', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get checklist results' },
    });
  }
});

export default router;
