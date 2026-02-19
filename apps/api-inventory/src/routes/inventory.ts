import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-inventory');

const router: IRouter = Router();

router.use(authenticate);
router.param('id', validateIdParam());
router.param('productId', validateIdParam('productId'));

// GET /api/inventory - List inventory levels
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', warehouseId, productId, lowStock } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;

    // Low stock filter
    if (lowStock === 'true') {
      // This requires a subquery approach - we'll filter after fetching
    }

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          product: { select: { id: true, sku: true, name: true, reorderPoint: true } },
          warehouse: { select: { id: true, code: true, name: true } },
        },
      }),
      prisma.inventory.count({ where }),
    ]);

    // Add calculated available quantity
    const inventoryWithAvailable = inventory.map((inv) => ({
      ...inv,
      quantityAvailable: inv.quantityOnHand - inv.quantityReserved,
    }));

    res.json({
      success: true,
      data: inventoryWithAvailable,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List inventory error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list inventory' },
    });
  }
});

// GET /api/inventory/summary - Get inventory summary stats
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const { warehouseId } = req.query;
    const where: Prisma.InventoryWhereInput = warehouseId
      ? { warehouseId: warehouseId as string }
      : {};

    const [totalProducts, inventoryStats, lowStockCount, recentTransactions] = await Promise.all([
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.inventory.aggregate({
        where,
        _sum: {
          quantityOnHand: true,
          quantityReserved: true,
          inventoryValue: true,
        },
      }),
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT i."productId") as count
        FROM inventory i
        JOIN products p ON i."productId" = p.id
        WHERE i."quantityOnHand" <= p."reorderPoint"
        AND p.status = 'ACTIVE'
      ` as Promise<{ count: bigint }[]>,
      prisma.inventoryTransaction.count({
        where: {
          transactionDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalQuantityOnHand: inventoryStats._sum.quantityOnHand || 0,
        totalQuantityReserved: inventoryStats._sum.quantityReserved || 0,
        totalInventoryValue: inventoryStats._sum.inventoryValue || 0,
        lowStockCount: Number(lowStockCount[0]?.count || 0),
        recentTransactions,
      },
    });
  } catch (error) {
    logger.error('Inventory summary error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get inventory summary' },
    });
  }
});

// GET /api/inventory/availability/:productId - Check product availability
router.get('/availability/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const inventory = await prisma.inventory.findMany({
      where: { productId: req.params.productId, deletedAt: null } as any,
      include: {
        warehouse: { select: { id: true, code: true, name: true, isActive: true } },
      },
      take: 1000,
    });

    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
      select: { id: true, sku: true, name: true, reorderPoint: true },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const totalOnHand = inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0);
    const totalReserved = inventory.reduce((sum, inv) => sum + inv.quantityReserved, 0);
    const totalAvailable = totalOnHand - totalReserved;

    res.json({
      success: true,
      data: {
        product,
        totalOnHand,
        totalReserved,
        totalAvailable,
        isLowStock: totalOnHand <= product.reorderPoint,
        byWarehouse: inventory.map((inv) => ({
          warehouse: inv.warehouse,
          quantityOnHand: inv.quantityOnHand,
          quantityReserved: inv.quantityReserved,
          quantityAvailable: inv.quantityOnHand - inv.quantityReserved,
          binLocation: inv.binLocation,
        })),
      },
    });
  } catch (error) {
    logger.error('Check availability error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to check availability' },
    });
  }
});

// POST /api/inventory/adjust - Create stock adjustment
router.post('/adjust', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      productId: z.string().trim(),
      warehouseId: z.string().trim(),
      adjustmentType: z.enum([
        'ADJUSTMENT_IN',
        'ADJUSTMENT_OUT',
        'CYCLE_COUNT',
        'DAMAGE',
        'EXPIRED',
      ]),
      quantity: z.number().int(),
      reason: z.string().trim().min(1).max(2000),
      notes: z.string().trim().optional(),
      binLocation: z.string().trim().optional(),
      lotNumber: z.string().trim().optional(),
      unitCost: z.number().min(0).optional(),
    });

    const data = schema.parse(req.body);

    // Get current inventory
    let inventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },
    });

    const quantityBefore = inventory?.quantityOnHand || 0;
    let quantityChange = data.quantity;

    // For negative adjustments, ensure enough stock
    if (['ADJUSTMENT_OUT', 'DAMAGE', 'EXPIRED'].includes(data.adjustmentType)) {
      quantityChange = -Math.abs(data.quantity);
      if (quantityBefore + quantityChange < 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'INSUFFICIENT_STOCK', message: 'Insufficient stock for this adjustment' },
        });
      }
    }

    // For cycle count, set to absolute value
    if (data.adjustmentType === 'CYCLE_COUNT') {
      quantityChange = data.quantity - quantityBefore;
    }

    const quantityAfter = quantityBefore + quantityChange;

    // Create or update inventory record
    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          id: uuidv4(),
          productId: data.productId,
          warehouseId: data.warehouseId,
          quantityOnHand: quantityAfter,
          binLocation: data.binLocation,
          createdById: req.user?.id,
          updatedById: req.user?.id,
        },
      });
    } else {
      inventory = await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantityOnHand: quantityAfter,
          binLocation: data.binLocation || inventory.binLocation,
          lastCountedAt:
            data.adjustmentType === 'CYCLE_COUNT' ? new Date() : inventory.lastCountedAt,
          version: { increment: 1 },
          updatedById: req.user?.id,
        },
      });
    }

    // Create transaction record
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        id: uuidv4(),
        productId: data.productId,
        warehouseId: data.warehouseId,
        transactionType: data.adjustmentType,
        referenceNumber: `ADJ-${Date.now()}`,
        referenceType: 'ADJUSTMENT',
        quantityBefore,
        quantityAfter,
        quantityChange,
        binLocation: data.binLocation,
        lotNumber: data.lotNumber,
        unitCost: data.unitCost || 0,
        totalCost: (data.unitCost || 0) * Math.abs(quantityChange),
        reason: data.reason,
        notes: data.notes,
        performedById: req.user?.id || '',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        inventory,
        transaction,
      },
    });
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
    logger.error('Stock adjustment error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to adjust stock' },
    });
  }
});

// POST /api/inventory/transfer - Transfer stock between warehouses
router.post('/transfer', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      productId: z.string().trim(),
      fromWarehouseId: z.string().trim(),
      toWarehouseId: z.string().trim(),
      quantity: z.number().int().positive(),
      reason: z.string().trim().optional(),
      notes: z.string().trim().optional(),
      fromBinLocation: z.string().trim().optional(),
      toBinLocation: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    if (data.fromWarehouseId === data.toWarehouseId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SAME_WAREHOUSE',
          message: 'Source and destination warehouse cannot be the same',
        },
      });
    }

    // Get source inventory
    const sourceInventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.fromWarehouseId,
        },
      },
    });

    if (!sourceInventory || sourceInventory.quantityOnHand < data.quantity) {
      return res.status(400).json({
        success: false,
        error: { code: 'INSUFFICIENT_STOCK', message: 'Insufficient stock in source warehouse' },
      });
    }

    // Get or create destination inventory
    const destInventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.toWarehouseId,
        },
      },
    });

    const transferRef = `TRF-${Date.now()}`;
    const sourceQuantityBefore = sourceInventory.quantityOnHand;
    const destQuantityBefore = destInventory?.quantityOnHand || 0;

    // Use transaction to ensure atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // Update source inventory
      const updatedSource = await tx.inventory.update({
        where: { id: sourceInventory.id },
        data: {
          quantityOnHand: { decrement: data.quantity },
          version: { increment: 1 },
          updatedById: req.user?.id,
        },
      });

      // Create or update destination inventory
      let updatedDest;
      if (!destInventory) {
        updatedDest = await tx.inventory.create({
          data: {
            id: uuidv4(),
            productId: data.productId,
            warehouseId: data.toWarehouseId,
            quantityOnHand: data.quantity,
            binLocation: data.toBinLocation,
            averageCost: sourceInventory.averageCost,
            lastCost: sourceInventory.lastCost,
            createdById: req.user?.id,
            updatedById: req.user?.id,
          },
        });
      } else {
        updatedDest = await tx.inventory.update({
          where: { id: destInventory.id },
          data: {
            quantityOnHand: { increment: data.quantity },
            binLocation: data.toBinLocation || destInventory.binLocation,
            version: { increment: 1 },
            updatedById: req.user?.id,
          },
        });
      }

      // Create transfer out transaction
      const transferOut = await tx.inventoryTransaction.create({
        data: {
          id: uuidv4(),
          productId: data.productId,
          warehouseId: data.fromWarehouseId,
          fromWarehouseId: data.fromWarehouseId,
          toWarehouseId: data.toWarehouseId,
          transactionType: 'TRANSFER_OUT',
          referenceNumber: `${transferRef}-OUT`,
          referenceType: 'TRANSFER',
          referenceId: transferRef,
          quantityBefore: sourceQuantityBefore,
          quantityAfter: sourceQuantityBefore - data.quantity,
          quantityChange: -data.quantity,
          binLocation: data.fromBinLocation,
          reason: data.reason || 'Warehouse transfer',
          notes: data.notes,
          performedById: req.user?.id || '',
        },
      });

      // Create transfer in transaction
      const transferIn = await tx.inventoryTransaction.create({
        data: {
          id: uuidv4(),
          productId: data.productId,
          warehouseId: data.toWarehouseId,
          fromWarehouseId: data.fromWarehouseId,
          toWarehouseId: data.toWarehouseId,
          transactionType: 'TRANSFER_IN',
          referenceNumber: `${transferRef}-IN`,
          referenceType: 'TRANSFER',
          referenceId: transferRef,
          quantityBefore: destQuantityBefore,
          quantityAfter: destQuantityBefore + data.quantity,
          quantityChange: data.quantity,
          binLocation: data.toBinLocation,
          reason: data.reason || 'Warehouse transfer',
          notes: data.notes,
          performedById: req.user?.id || '',
        },
      });

      return { updatedSource, updatedDest, transferOut, transferIn };
    });

    res.status(201).json({
      success: true,
      data: {
        transferReference: transferRef,
        source: result.updatedSource,
        destination: result.updatedDest,
        transactions: [result.transferOut, result.transferIn],
      },
    });
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
    logger.error('Transfer error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to transfer stock' },
    });
  }
});

// POST /api/inventory/receive - Receive goods (e.g., from purchase order)
router.post('/receive', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      productId: z.string().trim(),
      warehouseId: z.string().trim(),
      quantity: z.number().int().positive(),
      unitCost: z.number().min(0),
      referenceType: z.string().trim().optional(), // PO, RETURN, etc.
      referenceId: z.string().trim().optional(),
      binLocation: z.string().trim().optional(),
      lotNumber: z.string().trim().optional(),
      expiryDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    // Get or create inventory record
    let inventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },
    });

    const quantityBefore = inventory?.quantityOnHand || 0;
    const quantityAfter = quantityBefore + data.quantity;

    // Calculate new average cost
    const totalValueBefore = Number(inventory?.averageCost || 0) * quantityBefore;
    const newValue = data.unitCost * data.quantity;
    const newAverageCost =
      quantityAfter > 0 ? (totalValueBefore + newValue) / quantityAfter : data.unitCost;

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          id: uuidv4(),
          productId: data.productId,
          warehouseId: data.warehouseId,
          quantityOnHand: data.quantity,
          binLocation: data.binLocation,
          averageCost: data.unitCost,
          lastCost: data.unitCost,
          inventoryValue: newValue,
          lastReceivedAt: new Date(),
          createdById: req.user?.id,
          updatedById: req.user?.id,
        },
      });
    } else {
      inventory = await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantityOnHand: quantityAfter,
          averageCost: newAverageCost,
          lastCost: data.unitCost,
          inventoryValue: newAverageCost * quantityAfter,
          binLocation: data.binLocation || inventory.binLocation,
          lastReceivedAt: new Date(),
          version: { increment: 1 },
          updatedById: req.user?.id,
        },
      });
    }

    // Create transaction record
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        id: uuidv4(),
        productId: data.productId,
        warehouseId: data.warehouseId,
        transactionType: 'RECEIPT',
        referenceNumber: `RCV-${Date.now()}`,
        referenceType: data.referenceType || 'RECEIPT',
        referenceId: data.referenceId,
        quantityBefore,
        quantityAfter,
        quantityChange: data.quantity,
        binLocation: data.binLocation,
        lotNumber: data.lotNumber,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        unitCost: data.unitCost,
        totalCost: data.unitCost * data.quantity,
        notes: data.notes,
        performedById: req.user?.id || '',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        inventory,
        transaction,
      },
    });
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
    logger.error('Receive goods error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to receive goods' },
    });
  }
});

// POST /api/inventory/issue - Issue goods (e.g., for sales order)
router.post('/issue', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      productId: z.string().trim(),
      warehouseId: z.string().trim(),
      quantity: z.number().int().positive(),
      referenceType: z.string().trim().optional(), // SO, WO, etc.
      referenceId: z.string().trim().optional(),
      binLocation: z.string().trim().optional(),
      lotNumber: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    // Get inventory record
    const inventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },
    });

    if (!inventory) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_INVENTORY',
          message: 'No inventory record found for this product in this warehouse',
        },
      });
    }

    const availableQty = inventory.quantityOnHand - inventory.quantityReserved;
    if (availableQty < data.quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient available stock. Available: ${availableQty}`,
        },
      });
    }

    const quantityBefore = inventory.quantityOnHand;
    const quantityAfter = quantityBefore - data.quantity;

    // Update inventory
    const updatedInventory = await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantityOnHand: quantityAfter,
        inventoryValue: Number(inventory.averageCost) * quantityAfter,
        version: { increment: 1 },
        updatedById: req.user?.id,
      },
    });

    // Create transaction record
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        id: uuidv4(),
        productId: data.productId,
        warehouseId: data.warehouseId,
        transactionType: 'ISSUE',
        referenceNumber: `ISS-${Date.now()}`,
        referenceType: data.referenceType || 'ISSUE',
        referenceId: data.referenceId,
        quantityBefore,
        quantityAfter,
        quantityChange: -data.quantity,
        binLocation: data.binLocation,
        lotNumber: data.lotNumber,
        unitCost: inventory.averageCost,
        totalCost: Number(inventory.averageCost) * data.quantity,
        notes: data.notes,
        performedById: req.user?.id || '',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        inventory: updatedInventory,
        transaction,
      },
    });
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
    logger.error('Issue goods error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to issue goods' },
    });
  }
});

export default router;
