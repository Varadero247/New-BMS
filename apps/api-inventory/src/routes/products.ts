import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();

router.use(authenticate);

// GET /api/products - List products with search and filters
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      status,
      categoryId,
      supplierId,
      lowStock
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;

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
      const productIds = products.map(p => p.id);
      const inventoryTotals = await prisma.inventory.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _sum: { quantityOnHand: true },
      });

      const stockMap = new Map(inventoryTotals.map(i => [i.productId, i._sum.quantityOnHand || 0]));

      productsWithStock = products.filter(p => {
        const totalStock = stockMap.get(p.id) || 0;
        return totalStock <= p.reorderPoint;
      }).map(p => ({
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
    console.error('List products error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list products' } });
  }
});

// GET /api/products/low-stock - Get low stock alerts
router.get('/low-stock', async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: { select: { id: true, name: true } },
        inventoryItems: {
          select: { quantityOnHand: true, warehouseId: true },
        },
      },
    });

    const lowStockProducts = products.filter(product => {
      const totalStock = product.inventoryItems.reduce((sum, inv) => sum + inv.quantityOnHand, 0);
      return totalStock <= product.reorderPoint;
    }).map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      reorderPoint: product.reorderPoint,
      reorderQuantity: product.reorderQuantity,
      totalStock: product.inventoryItems.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
      deficit: product.reorderPoint - product.inventoryItems.reduce((sum, inv) => sum + inv.quantityOnHand, 0),
    }));

    res.json({ success: true, data: lowStockProducts });
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get low stock products' } });
  }
});

// GET /api/products/search - Quick search by SKU or barcode
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Search query required' } });
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: q as string },
          { barcode: q as string },
        ],
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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Search product error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to search product' } });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req: AuthRequest, res: Response) => {
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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get product' } });
  }
});

// POST /api/products - Create product
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      sku: z.string().min(1),
      barcode: z.string().optional(),
      name: z.string().min(1),
      description: z.string().optional(),
      categoryId: z.string().optional(),
      supplierId: z.string().optional(),
      brand: z.string().optional(),
      model: z.string().optional(),
      costPrice: z.number().min(0).default(0),
      sellingPrice: z.number().min(0).default(0),
      currency: z.string().default('USD'),
      taxRate: z.number().min(0).max(100).default(0),
      reorderPoint: z.number().int().min(0).default(0),
      reorderQuantity: z.number().int().min(0).default(0),
      minStockLevel: z.number().int().min(0).default(0),
      maxStockLevel: z.number().int().min(0).default(0),
      leadTimeDays: z.number().int().min(0).default(0),
      dimensions: z.any().optional(),
      weight: z.number().optional(),
      weightUnit: z.string().optional(),
      customAttributes: z.any().optional(),
      trackSerialNumbers: z.boolean().default(false),
      trackLotNumbers: z.boolean().default(false),
      trackExpiryDates: z.boolean().default(false),
    });

    const data = schema.parse(req.body);

    // Check for duplicate SKU
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_SKU', message: 'SKU already exists' } });
    }

    // Check for duplicate barcode if provided
    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existingBarcode) {
        return res.status(400).json({ success: false, error: { code: 'DUPLICATE_BARCODE', message: 'Barcode already exists' } });
      }
    }

    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        ...data,
        status: 'ACTIVE',
        createdById: req.user?.id,
        updatedById: req.user?.id,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create product error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create product' } });
  }
});

// PATCH /api/products/:id - Update product
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const schema = z.object({
      sku: z.string().min(1).optional(),
      barcode: z.string().optional().nullable(),
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      categoryId: z.string().optional().nullable(),
      supplierId: z.string().optional().nullable(),
      brand: z.string().optional().nullable(),
      model: z.string().optional().nullable(),
      costPrice: z.number().min(0).optional(),
      sellingPrice: z.number().min(0).optional(),
      currency: z.string().optional(),
      taxRate: z.number().min(0).max(100).optional(),
      reorderPoint: z.number().int().min(0).optional(),
      reorderQuantity: z.number().int().min(0).optional(),
      minStockLevel: z.number().int().min(0).optional(),
      maxStockLevel: z.number().int().min(0).optional(),
      leadTimeDays: z.number().int().min(0).optional(),
      dimensions: z.any().optional(),
      weight: z.number().optional().nullable(),
      weightUnit: z.string().optional().nullable(),
      customAttributes: z.any().optional(),
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
        error: { code: 'CONFLICT', message: 'Product has been modified by another user. Please refresh and try again.' }
      });
    }

    // Check for duplicate SKU if changing
    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existingSku) {
        return res.status(400).json({ success: false, error: { code: 'DUPLICATE_SKU', message: 'SKU already exists' } });
      }
    }

    // Check for duplicate barcode if changing
    if (data.barcode && data.barcode !== existing.barcode) {
      const existingBarcode = await prisma.product.findUnique({ where: { barcode: data.barcode } });
      if (existingBarcode) {
        return res.status(400).json({ success: false, error: { code: 'DUPLICATE_BARCODE', message: 'Barcode already exists' } });
      }
    }

    const { version: _, ...updateData } = data;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        version: { increment: 1 },
        updatedById: req.user?.id,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    res.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update product' } });
  }
});

// DELETE /api/products/:id - Delete product (soft delete by setting status)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { inventoryItems: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // Check if product has inventory
    const hasInventory = existing.inventoryItems.some(inv => inv.quantityOnHand > 0);
    if (hasInventory) {
      return res.status(400).json({
        success: false,
        error: { code: 'HAS_INVENTORY', message: 'Cannot delete product with existing inventory. Set status to DISCONTINUED instead.' }
      });
    }

    await prisma.product.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Product deleted successfully' } });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete product' } });
  }
});

export default router;
