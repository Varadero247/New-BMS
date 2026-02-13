import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-food-safety');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  allergens: z.any().optional().nullable(),
  shelfLifeDays: z.number().int().min(0).optional().nullable(),
  storageRequirements: z.string().max(1000).optional().nullable(),
  labellingInfo: z.any().optional().nullable(),
  nutritionalInfo: z.any().optional().nullable(),
  status: z.enum(['ACTIVE', 'DISCONTINUED', 'DEVELOPMENT']).optional().default('ACTIVE'),
});

const productUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  allergens: z.any().optional().nullable(),
  shelfLifeDays: z.number().int().min(0).optional().nullable(),
  storageRequirements: z.string().max(1000).optional().nullable(),
  labellingInfo: z.any().optional().nullable(),
  nutritionalInfo: z.any().optional().nullable(),
  status: z.enum(['ACTIVE', 'DISCONTINUED', 'DEVELOPMENT']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// GET /api/products
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, category } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = String(status);
    if (category) where.category = { contains: String(category), mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.fsProduct.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsProduct.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Error listing products', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list products' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/products
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = productCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const user = (req as AuthRequest).user;

    const product = await prisma.fsProduct.create({
      data: {
        ...body,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Product created', { id: product.id, code: product.code });
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    logger.error('Error creating product', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create product' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/products/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.fsProduct.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    logger.error('Error fetching product', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch product' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/products/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsProduct.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const parsed = productUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const product = await prisma.fsProduct.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    logger.info('Product updated', { id: product.id });
    res.json({ success: true, data: product });
  } catch (error: any) {
    logger.error('Error updating product', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update product' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/products/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsProduct.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    await prisma.fsProduct.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Product deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Product deleted successfully' } });
  } catch (error: any) {
    logger.error('Error deleting product', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete product' } });
  }
});

export default router;
