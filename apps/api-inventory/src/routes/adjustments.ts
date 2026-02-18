import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-inventory');
const router: IRouter = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const ADJUSTMENT_TYPES = ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'DAMAGE', 'EXPIRED', 'WRITE_OFF', 'FOUND', 'RECOUNT'] as const;

const createSchema = z.object({
  productId: z.string().trim().min(1),
  warehouseId: z.string().trim().min(1),
  adjustmentType: z.enum(ADJUSTMENT_TYPES),
  quantity: z.number().int().positive(),
  reason: z.string().trim().min(1).max(500),
  notes: z.string().max(2000).optional().nullable(),
  binLocation: z.string().max(100).optional().nullable(),
  lotNumber: z.string().max(100).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  unitCost: z.number().optional().nullable(),
  adjustmentDate: z.string().optional().nullable(),
});

// GET / — List stock adjustments
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { productId, warehouseId, adjustmentType, startDate, endDate } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      transactionType: {
        in: ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'DAMAGE', 'EXPIRED', 'WRITE_OFF', 'FOUND'],
      },
    };

    if (adjustmentType && typeof adjustmentType === 'string') {
      where.transactionType = adjustmentType;
    }
    if (productId) where.productId = productId as any;
    if (warehouseId) where.warehouseId = warehouseId as any;
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) (where.transactionDate as any).gte = new Date(startDate as string);
      if (endDate) (where.transactionDate as any).lte = new Date(endDate as string);
    }

    const [items, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { transactionDate: 'desc' },
        include: {
          product: { select: { id: true, sku: true, name: true } },
          warehouse: { select: { id: true, code: true, name: true } },
        },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    res.json({ success: true, data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error('List adjustments error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list adjustments' } });
  }
});

// POST / — Create stock adjustment
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const { productId, warehouseId, adjustmentType, quantity, reason, notes, binLocation, lotNumber, serialNumber, unitCost, adjustmentDate } = parsed.data;

    // Determine quantity change direction
    const isNegative = ['ADJUSTMENT_OUT', 'DAMAGE', 'EXPIRED', 'WRITE_OFF'].includes(adjustmentType);
    const quantityChange = isNegative ? -quantity : quantity;

    // Get current inventory level
    const inventory = await prisma.inventory.findFirst({ where: { productId, warehouseId } });
    const quantityBefore = inventory?.quantityOnHand ?? 0;
    const quantityAfter = quantityBefore + quantityChange;

    if (quantityAfter < 0) {
      return res.status(400).json({ success: false, error: { code: 'INSUFFICIENT_STOCK', message: `Insufficient stock. Current: ${quantityBefore}, Requested: ${quantity}` } });
    }

    // Create transaction and update inventory atomically
    const [transaction] = await prisma.$transaction([
      prisma.inventoryTransaction.create({
        data: {
          productId,
          warehouseId,
          transactionType: adjustmentType as any,
          referenceType: 'ADJUSTMENT',
          quantityBefore,
          quantityAfter,
          quantityChange,
          reason,
          notes: notes ?? undefined,
          binLocation: binLocation ?? undefined,
          lotNumber: lotNumber ?? undefined,
          serialNumber: serialNumber ?? undefined,
          unitCost: unitCost ? unitCost : 0,
          totalCost: unitCost ? Math.abs(quantityChange) * unitCost : 0,
          performedById: req.user?.id || 'system',
          transactionDate: adjustmentDate ? new Date(adjustmentDate) : new Date(),
        },
      }),
      ...(inventory
        ? [prisma.inventory.update({
            where: { id: inventory.id },
            data: { quantityOnHand: quantityAfter },
          })]
        : []),
    ]);

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    logger.error('Create adjustment error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create adjustment' } });
  }
});

// GET /:id — Get single adjustment
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.inventoryTransaction.findFirst({
      where: { id: req.params.id },
      include: {
        product: { select: { id: true, sku: true, name: true } },
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Adjustment not found' } });
    res.json({ success: true, data: item });
  } catch (error) {
    logger.error('Get adjustment error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get adjustment' } });
  }
});

export default router;
