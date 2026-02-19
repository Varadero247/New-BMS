import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma} from '../prisma';
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

const supplierCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contactName: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  category: z.enum(['RAW_MATERIAL', 'PACKAGING', 'INGREDIENT', 'SERVICE']),
  status: z
    .enum(['APPROVED', 'CONDITIONAL', 'SUSPENDED', 'REJECTED'])
    .optional()
    .default('APPROVED'),
  lastAuditDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    )
    .optional()
    .nullable(),
  nextAuditDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    )
    .optional()
    .nullable(),
  rating: z.number().min(0).max(100).optional().nullable(),
  certifications: z.any().optional().nullable(),
});

const supplierUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  contactName: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  category: z.enum(['RAW_MATERIAL', 'PACKAGING', 'INGREDIENT', 'SERVICE']).optional(),
  status: z.enum(['APPROVED', 'CONDITIONAL', 'SUSPENDED', 'REJECTED']).optional(),
  lastAuditDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    )
    .optional()
    .nullable(),
  nextAuditDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    )
    .optional()
    .nullable(),
  rating: z.number().min(0).max(100).optional().nullable(),
  certifications: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function generateSupplierCode(): string {
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `FS-SUP-${rand}`;
}

// ---------------------------------------------------------------------------
// GET /api/suppliers/due-audit
// ---------------------------------------------------------------------------
router.get('/due-audit', async (req: Request, res: Response) => {
  try {
    const daysAhead = parseIntParam(req.query.days, 30);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const data = await prisma.fsSupplier.findMany({
      where: {
        deletedAt: null,
        nextAuditDate: { lte: futureDate } as any,
        status: { not: 'REJECTED' },
      },
      orderBy: { nextAuditDate: 'asc' },
      take: 500,
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Error fetching suppliers due for audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch suppliers due for audit' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/suppliers
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, category } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = String(status);
    if (category) where.category = String(category);

    const [data, total] = await Promise.all([
      prisma.fsSupplier.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsSupplier.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing suppliers', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list suppliers' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/suppliers
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = supplierCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      });
    }

    const body = parsed.data;
    const code = generateSupplierCode();
    const user = (req as AuthRequest).user;

    const supplier = await prisma.fsSupplier.create({
      data: {
        ...body,
        code,
        lastAuditDate: body.lastAuditDate ? new Date(body.lastAuditDate) : null,
        nextAuditDate: body.nextAuditDate ? new Date(body.nextAuditDate) : null,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Supplier created', { id: supplier.id, code });
    res.status(201).json({ success: true, data: supplier });
  } catch (error: unknown) {
    logger.error('Error creating supplier', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create supplier' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/suppliers/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.fsSupplier.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    res.json({ success: true, data: supplier });
  } catch (error: unknown) {
    logger.error('Error fetching supplier', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch supplier' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/suppliers/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSupplier.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    const parsed = supplierUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      });
    }

    const body = parsed.data;
    const updateData: Record<string, unknown> = { ...body };
    if (body.lastAuditDate) updateData.lastAuditDate = new Date(body.lastAuditDate);
    if (body.nextAuditDate) updateData.nextAuditDate = new Date(body.nextAuditDate);

    const supplier = await prisma.fsSupplier.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Supplier updated', { id: supplier.id });
    res.json({ success: true, data: supplier });
  } catch (error: unknown) {
    logger.error('Error updating supplier', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update supplier' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/suppliers/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSupplier.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    await prisma.fsSupplier.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Supplier deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Supplier deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting supplier', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete supplier' },
    });
  }
});

export default router;
