import { Router, Request, Response, NextFunction } from 'express';
import { prisma} from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const inspectionCreateSchema = z.object({
  assetId: z.string().trim().uuid(),
  inspectionType: z.string().trim().min(1).max(100),
  inspector: z.string().trim().min(1).max(200),
  scheduledDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  completedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
  result: z.enum(['PASS', 'FAIL', 'CONDITIONAL', 'NA']).optional().nullable(),
  findings: z.any().optional().nullable(),
  nextInspectionDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
});

const inspectionUpdateSchema = z.object({
  inspectionType: z.string().trim().min(1).max(100).optional(),
  inspector: z.string().trim().min(1).max(200).optional(),
  scheduledDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  completedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']).optional(),
  result: z.enum(['PASS', 'FAIL', 'CONDITIONAL', 'NA']).optional().nullable(),
  findings: z.any().optional().nullable(),
  nextInspectionDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const RESERVED_PATHS = new Set(['overdue']);

// ===================================================================
// INSPECTIONS CRUD
// ===================================================================

// GET /overdue — Overdue inspections
router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const inspections = await prisma.cmmsInspection.findMany({
      where: {
        deletedAt: null,
        status: { in: ['SCHEDULED', 'OVERDUE'] } as any,
        scheduledDate: { lt: now },
      },
      include: { asset: { select: { id: true, name: true, code: true } } },
      orderBy: { scheduledDate: 'asc' },
      take: 1000,
    });

    res.json({ success: true, data: inspections });
  } catch (error: unknown) {
    logger.error('Failed to list overdue inspections', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list overdue inspections' },
    });
  }
});

// GET / — List inspections
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assetId, status, result, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (assetId) where.assetId = String(assetId);
    if (status) where.status = String(status);
    if (result) where.result = String(result);
    if (search) {
      where.OR = [
        { inspectionType: { contains: String(search), mode: 'insensitive' } },
        { inspector: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [inspections, total] = await Promise.all([
      prisma.cmmsInspection.findMany({
        where,
        skip,
        take: limit,
        include: { asset: { select: { id: true, name: true, code: true } } },
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.cmmsInspection.count({ where }),
    ]);

    res.json({
      success: true,
      data: inspections,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list inspections', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list inspections' },
    });
  }
});

// POST / — Create inspection
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = inspectionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const inspection = await prisma.cmmsInspection.create({
      data: {
        assetId: data.assetId,
        inspectionType: data.inspectionType,
        inspector: data.inspector,
        scheduledDate: new Date(data.scheduledDate),
        completedDate: data.completedDate ? new Date(data.completedDate) : null,
        status: data.status || 'SCHEDULED',
        result: data.result,
        findings: data.findings,
        nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: inspection });
  } catch (error: unknown) {
    logger.error('Failed to create inspection', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create inspection' },
    });
  }
});

// GET /:id — Get inspection by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const inspection = await prisma.cmmsInspection.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { asset: { select: { id: true, name: true, code: true } } },
    });

    if (!inspection) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Inspection not found' } });
    }

    res.json({ success: true, data: inspection });
  } catch (error: unknown) {
    logger.error('Failed to get inspection', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get inspection' },
    });
  }
});

// PUT /:id — Update inspection
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = inspectionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const existing = await prisma.cmmsInspection.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Inspection not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };
    if (data.scheduledDate !== undefined) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.completedDate !== undefined)
      updateData.completedDate = data.completedDate ? new Date(data.completedDate) : null;
    if (data.nextInspectionDate !== undefined)
      updateData.nextInspectionDate = data.nextInspectionDate
        ? new Date(data.nextInspectionDate)
        : null;

    const inspection = await prisma.cmmsInspection.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data: inspection });
  } catch (error: unknown) {
    logger.error('Failed to update inspection', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update inspection' },
    });
  }
});

// DELETE /:id — Soft delete inspection
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsInspection.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Inspection not found' } });
    }

    await prisma.cmmsInspection.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Inspection deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete inspection', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete inspection' },
    });
  }
});

export default router;
