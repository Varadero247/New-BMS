import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-food-safety');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const traceabilityCreateSchema = z.object({
  productName: z.string().trim().min(1).max(200),
  batchNumber: z.string().trim().min(1).max(100),
  productionDate: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  expiryDate: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  ingredients: z.any(),
  suppliers: z.any().optional().nullable(),
  processRecords: z.any().optional().nullable(),
  distributionRecords: z.any().optional().nullable(),
  status: z.enum(['IN_PRODUCTION', 'IN_STORAGE', 'DISTRIBUTED', 'RECALLED', 'EXPIRED']).optional().default('IN_PRODUCTION'),
});

const traceabilityUpdateSchema = z.object({
  productName: z.string().trim().min(1).max(200).optional(),
  batchNumber: z.string().trim().min(1).max(100).optional(),
  productionDate: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  expiryDate: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  ingredients: z.any().optional(),
  suppliers: z.any().optional().nullable(),
  processRecords: z.any().optional().nullable(),
  distributionRecords: z.any().optional().nullable(),
  status: z.enum(['IN_PRODUCTION', 'IN_STORAGE', 'DISTRIBUTED', 'RECALLED', 'EXPIRED']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET /api/traceability/batch/:batchNumber
// ---------------------------------------------------------------------------
router.get('/batch/:batchNumber', async (req: Request, res: Response) => {
  try {
    const record = await prisma.fsTraceability.findFirst({
      where: { batchNumber: req.params.batchNumber, deletedAt: null } as any,
    });

    if (!record) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Batch not found' } });
    }

    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error fetching batch', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch batch' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/traceability
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { productName, batchNumber, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (productName) where.productName = { contains: String(productName), mode: 'insensitive' };
    if (batchNumber) where.batchNumber = { contains: String(batchNumber), mode: 'insensitive' };
    if (status) where.status = String(status);

    const [data, total] = await Promise.all([
      prisma.fsTraceability.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsTraceability.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing traceability records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list traceability records' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/traceability
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = traceabilityCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const user = (req as AuthRequest).user;

    const record = await prisma.fsTraceability.create({
      data: {
        ...(body as any),
        productionDate: new Date(body.productionDate),
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Traceability record created', { id: record.id });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error creating traceability record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create traceability record' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/traceability/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.fsTraceability.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!record) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Traceability record not found' } });
    }

    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error fetching traceability record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch traceability record' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/traceability/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsTraceability.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Traceability record not found' } });
    }

    const parsed = traceabilityUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const updateData: Record<string, unknown> = { ...body };
    if (body.productionDate) updateData.productionDate = new Date(body.productionDate);
    if (body.expiryDate) updateData.expiryDate = new Date(body.expiryDate);

    const record = await prisma.fsTraceability.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Traceability record updated', { id: record.id });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error updating traceability record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update traceability record' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/traceability/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsTraceability.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Traceability record not found' } });
    }

    await prisma.fsTraceability.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Traceability record deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Traceability record deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting traceability record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete traceability record' } });
  }
});

export default router;
