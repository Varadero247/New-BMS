import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-inventory');

const router: IRouter = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/products - List products with search and filters
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      status,
      categoryId,
      supplierId,
      lowStock,
    } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };

    if (status) where.status = status as any;
    if (categoryId) where.categoryId = categoryId as any;
    if (supplierId) where.supplierId = supplierId as any;

    // Search by SKU, barcode, or name
    if (search) {
      where.OR = [
        { sku: { contains: search as string, mode: 'insensitive' } },
        { barcode: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // If lowStock filter is applied, include inventory totals
    let productsWithStock = products;
    if (lowStock === 'true') {
      const productIds = products.map((p) => p.id);
      const inventoryTotals = await prisma.inventory.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _sum: { quantityOnHand: true },
      });

      const stockMap = new Map(
        inventoryTotals.map((i) => [i.productId, i._sum.quantityOnHand || 0])
      );

      productsWithStock = products
        .filter((p) => {
          const totalStock = stockMap.get(p.id) || 0;
          return totalStock <= p.reorderPoint;
        })
        .map((p) => ({
          ...p,
          totalStock: stockMap.get(p.id) || 0,
        }));
    }

    res.json({
      success: true,
      data: productsWithStock,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List products error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list products' },
    });
  }
});

// GET /api/products/low-stock - Get low stock alerts
router.get('/low-stock', async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE', deletedAt: null } as any,
      include: {
        category: { select: { id: true, name: true } },
        inventoryItems: {
          select: { quantityOnHand: true, warehouseId: true },
        },
      },
      take: 1000,
    });

    const lowStockProducts = products
      .filter((product) => {
        const totalStock = product.inventoryItems.reduce((sum, inv) => sum + inv.quantityOnHand, 0);
        return totalStock <= product.reorderPoint;
      })
      .map((product) => ({
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        reorderPoint: product.reorderPoint,
        reorderQuantity: product.reorderQuantity,
        totalStock: product.inventoryItems.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
        deficit:
          product.reorderPoint -
          product.inventoryItems.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
      }));

    res.json({ success: true, data: lowStockProducts });
  } catch (error) {
    logger.error('Low stock error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get low stock products' },
    });
  }
});

// GET /api/products/search - Quick search by SKU or barcode
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Search query required' },
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        deletedAt: null,
        OR: [{ sku: q as string } as any, { barcode: q as string }],
      },
      include: {
        category: true,
        supplier: true,
        inventoryItems: {
          include: { warehouse: { select: { id: true, code: true, name: true } } },
        },
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    logger.error('Search product error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to search product' },
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', checkOwnership(prisma.product), async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        supplier: true,
        inventoryItems: {
          include: { warehouse: { select: { id: true, code: true, name: true } } },
        },
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    logger.error('Get product error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get product' },
    });
  }
});

// POST /api/products - Create product
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      sku: z.string().trim().min(1).max(200),
      barcode: z.string().trim().optional(),
      name: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      categoryId: z.string().trim().optional(),
      supplierId: z.string().trim().optional(),
      brand: z.string().trim().optional(),
      model: z.string().trim().optional(),
      costPrice: z.number().min(0).default(0),
      sellingPrice: z.number().min(0).default(0),
      currency: z.string().trim().length(3).default('USD'),
      taxRate: z.number().min(0).max(100).default(0),
      reorderPoint: z.number().int().min(0).default(0),
      reorderQuantity: z.number().int().min(0).default(0),
      minStockLevel: z.number().int().min(0).default(0),
      maxStockLevel: z.number().int().min(0).default(0),
      leadTimeDays: z.number().int().min(0).default(0),
      dimensions: z.record(z.unknown()).optional(),
      weight: z.number().nonnegative().optional(),
      weightUnit: z.string().trim().optional(),
      customAttributes: z.record(z.unknown()).optional(),
      trackSerialNumbers: z.boolean().default(false),
      trackLotNumbers: z.boolean().default(false),
      trackExpiryDates: z.boolean().default(false),
    });

    const data = schema.parse(req.body);

    // Check for duplicate SKU
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'DUPLICATE_SKU', message: 'SKU already exists' } });
    }

    // Check for duplicate barcode if provided
    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_BARCODE', message: 'Barcode already exists' },
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        ...data,
        status: 'ACTIVE',
        createdById: req.user?.id,
        updatedById: req.user?.id,
      } as any,
      include: {
        category: true,
        supplier: true,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create product error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create product' },
    });
  }
});

// PATCH /api/products/:id - Update product
router.patch('/:id', checkOwnership(prisma.product), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const schema = z.object({
      sku: z.string().trim().min(1).max(200).optional(),
      barcode: z.string().trim().optional().nullable(),
      name: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().optional().nullable(),
      categoryId: z.string().trim().optional().nullable(),
      supplierId: z.string().trim().optional().nullable(),
      brand: z.string().trim().optional().nullable(),
      model: z.string().trim().optional().nullable(),
      costPrice: z.number().min(0).optional(),
      sellingPrice: z.number().min(0).optional(),
      currency: z.string().trim().length(3).optional(),
      taxRate: z.number().min(0).max(100).optional(),
      reorderPoint: z.number().int().min(0).optional(),
      reorderQuantity: z.number().int().min(0).optional(),
      minStockLevel: z.number().int().min(0).optional(),
      maxStockLevel: z.number().int().min(0).optional(),
      leadTimeDays: z.number().int().min(0).optional(),
      dimensions: z.record(z.unknown()).optional(),
      weight: z.number().nonnegative().optional().nullable(),
      weightUnit: z.string().trim().optional().nullable(),
      customAttributes: z.record(z.unknown()).optional(),
      trackSerialNumbers: z.boolean().optional(),
      trackLotNumbers: z.boolean().optional(),
      trackExpiryDates: z.boolean().optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK']).optional(),
      version: z.number().int().optional(), // For optimistic locking
    });

    const data = schema.parse(req.body);

    // Optimistic locking check
    if (data.version !== undefined && data.version !== existing.version) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Product has been modified by another user. Please refresh and try again.',
        },
      });
    }

    // Check for duplicate SKU if changing
    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_SKU', message: 'SKU already exists' },
        });
      }
    }

    // Check for duplicate barcode if changing
    if (data.barcode && data.barcode !== existing.barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          error: { code: 'DUPLICATE_BARCODE', message: 'Barcode already exists' },
        });
      }
    }

    const { version: _, ...updateData } = data;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        version: { increment: 1 },
        updatedById: req.user?.id,
      } as any,
      include: {
        category: true,
        supplier: true,
      },
    });

    res.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update product error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update product' },
    });
  }
});

// DELETE /api/products/:id - Delete product (soft delete by setting status)
router.delete('/:id', checkOwnership(prisma.product), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { inventoryItems: true },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // Check if product has inventory
    const hasInventory = existing.inventoryItems.some((inv) => inv.quantityOnHand > 0);
    if (hasInventory) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HAS_INVENTORY',
          message:
            'Cannot delete product with existing inventory. Set status to DISCONTINUED instead.',
        },
      });
    }

    await prisma.product.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete product error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete product' },
    });
  }
});

export default router;
