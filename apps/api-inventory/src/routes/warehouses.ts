import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();

router.use(authenticate);

// GET /api/warehouses - List warehouses
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', isActive } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
      }),
      prisma.warehouse.count({ where }),
    ]);

    // Get inventory stats for each warehouse
    const warehouseIds = warehouses.map(w => w.id);
    const inventoryStats = await prisma.inventory.groupBy({
      by: ['warehouseId'],
      where: { warehouseId: { in: warehouseIds } },
      _sum: { quantityOnHand: true, inventoryValue: true },
      _count: { productId: true },
    });

    const statsMap = new Map(inventoryStats.map(s => [s.warehouseId, s]));

    const warehousesWithStats = warehouses.map(w => ({
      ...w,
      stats: {
        totalProducts: statsMap.get(w.id)?._count.productId || 0,
        totalQuantity: statsMap.get(w.id)?._sum.quantityOnHand || 0,
        totalValue: statsMap.get(w.id)?._sum.inventoryValue || 0,
      },
    }));

    res.json({
      success: true,
      data: warehousesWithStats,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List warehouses error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list warehouses' } });
  }
});

// GET /api/warehouses/:id - Get single warehouse with inventory summary
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: req.params.id },
    });

    if (!warehouse) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Warehouse not found' } });
    }

    // Get inventory summary
    const inventoryStats = await prisma.inventory.aggregate({
      where: { warehouseId: req.params.id },
      _sum: { quantityOnHand: true, quantityReserved: true, inventoryValue: true },
      _count: { productId: true },
    });

    // Get low stock items in this warehouse
    const lowStockItems = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM inventory i
      JOIN products p ON i."productId" = p.id
      WHERE i."warehouseId" = ${req.params.id}
      AND i."quantityOnHand" <= p."reorderPoint"
      AND p.status = 'ACTIVE'
    ` as { count: bigint }[];

    res.json({
      success: true,
      data: {
        ...warehouse,
        stats: {
          totalProducts: inventoryStats._count.productId,
          totalQuantity: inventoryStats._sum.quantityOnHand || 0,
          totalReserved: inventoryStats._sum.quantityReserved || 0,
          totalValue: inventoryStats._sum.inventoryValue || 0,
          lowStockItems: Number(lowStockItems[0]?.count || 0),
        },
      },
    });
  } catch (error) {
    console.error('Get warehouse error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get warehouse' } });
  }
});

// GET /api/warehouses/:id/inventory - Get all inventory in a warehouse
router.get('/:id/inventory', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', search } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { warehouseId: req.params.id };

    // If search, filter by product
    if (search) {
      where.product = {
        OR: [
          { sku: { contains: search as string, mode: 'insensitive' } },
          { name: { contains: search as string, mode: 'insensitive' } },
          { barcode: { contains: search as string, mode: 'insensitive' } },
        ],
      };
    }

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              barcode: true,
              reorderPoint: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { product: { name: 'asc' } },
      }),
      prisma.inventory.count({ where }),
    ]);

    const inventoryWithAvailable = inventory.map(inv => ({
      ...inv,
      quantityAvailable: inv.quantityOnHand - inv.quantityReserved,
      isLowStock: inv.quantityOnHand <= (inv.product?.reorderPoint || 0),
    }));

    res.json({
      success: true,
      data: inventoryWithAvailable,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Get warehouse inventory error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get warehouse inventory' } });
  }
});

// POST /api/warehouses - Create warehouse
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      address: z.any().optional(),
      totalCapacity: z.number().optional(),
      capacityUnit: z.string().default('cubic_meters'),
      managerId: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      operatingHours: z.any().optional(),
      isDefault: z.boolean().default(false),
    });

    const data = schema.parse(req.body);

    // Check for duplicate code
    const existingCode = await prisma.warehouse.findUnique({ where: { code: data.code } });
    if (existingCode) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_CODE', message: 'Warehouse code already exists' } });
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.warehouse.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        id: uuidv4(),
        ...data,
        isActive: true,
        createdById: req.user?.id,
        updatedById: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create warehouse error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create warehouse' } });
  }
});

// PATCH /api/warehouses/:id - Update warehouse
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.warehouse.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Warehouse not found' } });
    }

    const schema = z.object({
      code: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      address: z.any().optional(),
      totalCapacity: z.number().optional().nullable(),
      usedCapacity: z.number().optional().nullable(),
      capacityUnit: z.string().optional(),
      managerId: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      operatingHours: z.any().optional(),
      isDefault: z.boolean().optional(),
      isActive: z.boolean().optional(),
      version: z.number().int().optional(),
    });

    const data = schema.parse(req.body);

    // Optimistic locking check
    if (data.version !== undefined && data.version !== existing.version) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Warehouse has been modified. Please refresh and try again.' }
      });
    }

    // Check for duplicate code if changing
    if (data.code && data.code !== existing.code) {
      const existingCode = await prisma.warehouse.findUnique({ where: { code: data.code } });
      if (existingCode) {
        return res.status(400).json({ success: false, error: { code: 'DUPLICATE_CODE', message: 'Warehouse code already exists' } });
      }
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.warehouse.updateMany({
        where: { isDefault: true, id: { not: req.params.id } },
        data: { isDefault: false },
      });
    }

    const { version: _, ...updateData } = data;

    const warehouse = await prisma.warehouse.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        version: { increment: 1 },
        updatedById: req.user?.id,
      },
    });

    res.json({ success: true, data: warehouse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update warehouse error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update warehouse' } });
  }
});

// DELETE /api/warehouses/:id - Delete warehouse
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.warehouse.findUnique({
      where: { id: req.params.id },
      include: { inventoryItems: { take: 1 } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Warehouse not found' } });
    }

    // Check if warehouse has inventory
    if (existing.inventoryItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'HAS_INVENTORY', message: 'Cannot delete warehouse with existing inventory. Transfer or remove inventory first.' }
      });
    }

    await prisma.warehouse.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Warehouse deleted successfully' } });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete warehouse' } });
  }
});

export default router;
