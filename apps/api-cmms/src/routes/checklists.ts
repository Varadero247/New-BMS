import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const checklistCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  assetType: z.enum(['EQUIPMENT', 'VEHICLE', 'BUILDING', 'INFRASTRUCTURE', 'IT_ASSET', 'TOOL']).optional().nullable(),
  items: z.any(),
  isActive: z.boolean().optional(),
});

const checklistUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  assetType: z.enum(['EQUIPMENT', 'VEHICLE', 'BUILDING', 'INFRASTRUCTURE', 'IT_ASSET', 'TOOL']).optional().nullable(),
  items: z.any().optional(),
  isActive: z.boolean().optional(),
});

const checklistResultSchema = z.object({
  workOrderId: z.string().uuid().optional().nullable(),
  assetId: z.string().uuid(),
  completedBy: z.string().min(1).max(200),
  completedAt: z.string(),
  results: z.any(),
  overallResult: z.enum(['PASS', 'FAIL', 'CONDITIONAL', 'NA']),
  notes: z.string().max(2000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ===================================================================
// CHECKLISTS CRUD
// ===================================================================

// GET / — List checklists
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assetType, isActive, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (assetType) where.assetType = String(assetType);
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [checklists, total] = await Promise.all([
      prisma.cmmsChecklist.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.cmmsChecklist.count({ where }),
    ]);

    res.json({
      success: true,
      data: checklists,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list checklists', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list checklists' } });
  }
});

// POST / — Create checklist
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = checklistCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const checklist = await prisma.cmmsChecklist.create({
      data: {
        name: data.name,
        description: data.description,
        assetType: data.assetType,
        items: data.items || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: checklist });
  } catch (error: unknown) {
    logger.error('Failed to create checklist', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create checklist' } });
  }
});

// GET /:id — Get checklist by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const checklist = await prisma.cmmsChecklist.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!checklist) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }

    res.json({ success: true, data: checklist });
  } catch (error: unknown) {
    logger.error('Failed to get checklist', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get checklist' } });
  }
});

// PUT /:id — Update checklist
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = checklistUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const existing = await prisma.cmmsChecklist.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }

    const checklist = await prisma.cmmsChecklist.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: checklist });
  } catch (error: unknown) {
    logger.error('Failed to update checklist', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update checklist' } });
  }
});

// DELETE /:id — Soft delete checklist
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsChecklist.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }

    await prisma.cmmsChecklist.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Checklist deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete checklist', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete checklist' } });
  }
});

// POST /:id/results — Submit completed checklist
router.post('/:id/results', async (req: Request, res: Response) => {
  try {
    const parsed = checklistResultSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const checklist = await prisma.cmmsChecklist.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!checklist) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const result = await prisma.cmmsChecklistResult.create({
      data: {
        checklistId: req.params.id,
        workOrderId: data.workOrderId,
        assetId: data.assetId,
        completedBy: data.completedBy,
        completedAt: new Date(data.completedAt),
        results: data.results,
        overallResult: data.overallResult,
        notes: data.notes,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: unknown) {
    logger.error('Failed to submit checklist result', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit checklist result' } });
  }
});

// GET /:id/results — Get checklist results
router.get('/:id/results', async (req: Request, res: Response) => {
  try {
    const checklist = await prisma.cmmsChecklist.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!checklist) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Checklist not found' } });
    }

    const results = await prisma.cmmsChecklistResult.findMany({
      where: { checklistId: req.params.id, deletedAt: null },
      include: {
        asset: { select: { id: true, name: true, code: true } },
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json({ success: true, data: results });
  } catch (error: unknown) {
    logger.error('Failed to get checklist results', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get checklist results' } });
  }
});

export default router;
