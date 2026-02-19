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

const partUsedCreateSchema = z.object({
  jobId: z.string().trim().uuid(),
  partName: z.string().trim().min(1).max(200),
  partNumber: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(1),
  unitCost: z.number().min(0),
  totalCost: z.number().min(0),
  fromInventory: z.boolean().optional(),
  serialNumber: z.string().trim().max(100).optional().nullable(),
});

const partUsedUpdateSchema = z.object({
  partName: z.string().trim().min(1).max(200).optional(),
  partNumber: z.string().trim().min(1).max(100).optional(),
  quantity: z.number().int().min(1).optional(),
  unitCost: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  fromInventory: z.boolean().optional(),
  serialNumber: z.string().trim().max(100).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List parts used
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (jobId) where.jobId = String(jobId);

    const [data, total] = await Promise.all([
      prisma.fsSvcPartUsed.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { job: true },
      }),
      prisma.fsSvcPartUsed.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list parts used', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list parts used' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create part used
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = partUsedCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcPartUsed.create({
      data: {
        ...parsed.data,
        unitCost: new Prisma.Decimal(parsed.data.unitCost),
        totalCost: new Prisma.Decimal(parsed.data.totalCost),
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create part used', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create part used' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get part used
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcPartUsed.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { job: true },
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Part used not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get part used', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get part used' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update part used
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcPartUsed.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Part used not found' } });
    }

    const parsed = partUsedUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.unitCost !== undefined)
      updateData.unitCost = new Prisma.Decimal(parsed.data.unitCost);
    if (parsed.data.totalCost !== undefined)
      updateData.totalCost = new Prisma.Decimal(parsed.data.totalCost);

    const data = await prisma.fsSvcPartUsed.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update part used', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update part used' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete part used
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcPartUsed.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Part used not found' } });
    }

    await prisma.fsSvcPartUsed.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Part used deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete part used', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete part used' },
    });
  }
});

export default router;
