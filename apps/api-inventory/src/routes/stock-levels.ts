import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-inventory');
const router: IRouter = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// GET /low-stock — Products below reorder point (must be before /:id)
router.get('/low-stock', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    // Join inventory with product to find items below reorder point
    const lowStockItems = await prisma.$queryRaw`
      SELECT
        i.id,
        i."productId",
        i."warehouseId",
        i."quantityOnHand",
        i."quantityReserved",
        i."quantityOnOrder",
        p.sku,
        p.name,
        p."reorderPoint",
        p."reorderQuantity",
        p."maxStock",
        w.name as "warehouseName",
        w.code as "warehouseCode"
      FROM inventory i
      JOIN products p ON p.id = i."productId"
      JOIN warehouses w ON w.id = i."warehouseId"
      WHERE i."quantityOnHand" <= p."reorderPoint"
        AND p."reorderPoint" > 0
      ORDER BY (i."quantityOnHand"::float / NULLIF(p."reorderPoint", 0)) ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM inventory i
      JOIN products p ON p.id = i."productId"
      WHERE i."quantityOnHand" <= p."reorderPoint"
        AND p."reorderPoint" > 0
    `;

    const total = Number(countResult[0]?.count ?? 0);

    res.json({ success: true, data: lowStockItems, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error('Low stock error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get low stock items' } });
  }
});

// GET /summary — Stock level summary
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const { warehouseId } = req.query;
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId as any;

    const [totalProducts, totalValue, stockCounts] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.aggregate({ where, _sum: { inventoryValue: true } }),
      prisma.inventory.groupBy({
        by: ['warehouseId'],
        where,
        _sum: { quantityOnHand: true, inventoryValue: true },
        _count: { id: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalInventoryValue: totalValue._sum.inventoryValue ?? 0,
        byWarehouse: stockCounts,
      },
    });
  } catch (error) {
    logger.error('Stock summary error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stock summary' } });
  }
});

// GET / — List stock levels
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { warehouseId, productId, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId as any;
    if (productId) where.productId = productId as any;

    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          product: { select: { id: true, sku: true, name: true, reorderPoint: true, reorderQuantity: true, maxStockLevel: true } },
          warehouse: { select: { id: true, code: true, name: true } },
        },
      }),
      prisma.inventory.count({ where }),
    ]);

    res.json({ success: true, data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    logger.error('List stock levels error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list stock levels' } });
  }
});

// GET /:id — Get stock level by inventory ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.inventory.findFirst({
      where: { id: req.params.id },
      include: {
        product: { select: { id: true, sku: true, name: true, reorderPoint: true, reorderQuantity: true, maxStockLevel: true, costPrice: true } },
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stock level record not found' } });
    res.json({ success: true, data: item });
  } catch (error) {
    logger.error('Get stock level error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stock level' } });
  }
});

export default router;
