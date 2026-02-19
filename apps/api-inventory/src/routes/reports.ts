import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-inventory');
const router: IRouter = Router();
router.use(authenticate);

// GET /valuation — Inventory valuation report
router.get('/valuation', async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.query;

    const where: Record<string, unknown> = {};
    if (warehouseId) where.warehouseId = warehouseId;

    const [totals, byWarehouse, topValueItems] = await Promise.all([
      prisma.inventory.aggregate({
        where,
        _sum: { quantityOnHand: true, inventoryValue: true },
        _count: { id: true },
      }),
      prisma.inventory.groupBy({
        by: ['warehouseId'],
        where,
        _sum: { quantityOnHand: true, inventoryValue: true },
        _count: { id: true },
      }),
      prisma.inventory.findMany({
        where,
        take: 20,
        orderBy: { inventoryValue: 'desc' },
        include: {
          product: { select: { sku: true, name: true } },
          warehouse: { select: { code: true, name: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalItems: (totals as { _count: { id: number } })._count.id,
          totalQuantity: totals._sum.quantityOnHand ?? 0,
          totalValue: totals._sum.inventoryValue ?? 0,
        },
        byWarehouse,
        topValueItems,
      },
    });
  } catch (error) {
    logger.error('Valuation report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate valuation report' },
    });
  }
});

// GET /movement — Stock movement report
router.get('/movement', async (req: Request, res: Response) => {
  try {
    const { warehouseId, startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const where: Record<string, unknown> = {
      transactionDate: { gte: start, lte: end },
    };
    if (warehouseId) where.warehouseId = warehouseId;

    const [byType, dailyMovement, topMovingProducts] = await Promise.all([
      prisma.inventoryTransaction.groupBy({
        by: ['transactionType'],
        where,
        _count: { id: true },
        _sum: { quantityChange: true, totalCost: true },
      }),
      prisma.$queryRaw`
        SELECT
          DATE("transactionDate") as date,
          COUNT(*) as transactions,
          SUM(CASE WHEN "quantityChange" > 0 THEN "quantityChange" ELSE 0 END) as qty_in,
          SUM(CASE WHEN "quantityChange" < 0 THEN ABS("quantityChange") ELSE 0 END) as qty_out
        FROM inventory_transactions
        WHERE "transactionDate" >= ${start} AND "transactionDate" <= ${end}
        GROUP BY DATE("transactionDate")
        ORDER BY date ASC
      `,
      prisma.inventoryTransaction.groupBy({
        by: ['productId'],
        where,
        _count: { id: true },
        _sum: { quantityChange: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        period: { start, end },
        byType: byType.map((t) => ({
          transactionType: t.transactionType as string,
          count: t._count.id,
          quantityChange: t._sum?.quantityChange ?? null,
          totalValue: t._sum?.totalCost != null ? Number(t._sum.totalCost) : null,
        })),
        dailyMovement,
        topMovingProducts,
      },
    });
  } catch (error) {
    logger.error('Movement report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate movement report' },
    });
  }
});

// GET /ageing — Stock ageing report
router.get('/ageing', async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.query;
    const now = new Date();

    const where: Record<string, unknown> = {};
    if (warehouseId) where.warehouseId = warehouseId;

    const items = await prisma.inventory.findMany({
      where,
      include: {
        product: { select: { sku: true, name: true } },
        warehouse: { select: { code: true, name: true } },
      },
      take: 1000,
    });

    // Categorise by last received date
    const aged = items.map((item) => {
      const lastReceived = item.lastReceivedAt;
      const daysSinceReceived = lastReceived
        ? Math.floor((now.getTime() - lastReceived.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...item,
        daysSinceReceived,
        ageBucket:
          daysSinceReceived === null
            ? 'UNKNOWN'
            : daysSinceReceived <= 30
              ? '0-30 days'
              : daysSinceReceived <= 60
                ? '31-60 days'
                : daysSinceReceived <= 90
                  ? '61-90 days'
                  : daysSinceReceived <= 180
                    ? '91-180 days'
                    : '180+ days',
      };
    });

    const buckets = aged.reduce(
      (acc, item) => {
        const bucket = item.ageBucket;
        if (!acc[bucket]) acc[bucket] = { count: 0, totalValue: 0 };
        acc[bucket].count++;
        acc[bucket].totalValue += Number(item.inventoryValue);
        return acc;
      },
      {} as Record<string, { count: number; totalValue: number }>
    );

    res.json({ success: true, data: { items: aged, buckets } });
  } catch (error) {
    logger.error('Ageing report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate ageing report' },
    });
  }
});

// GET /turnover — Inventory turnover report
router.get('/turnover', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Outbound transactions for COGS approximation
    const outbound = await prisma.inventoryTransaction.groupBy({
      by: ['productId'],
      where: {
        transactionDate: { gte: start, lte: end },
        quantityChange: { lt: 0 },
      },
      _sum: { totalCost: true, quantityChange: true },
    });

    res.json({
      success: true,
      data: {
        period: { start, end },
        products: outbound.map((o) => ({
          productId: o.productId,
          totalOutbound: Math.abs(o._sum?.quantityChange ?? 0),
          totalCost: Math.abs(Number(o._sum?.totalCost ?? 0)),
        })),
      },
    });
  } catch (error) {
    logger.error('Turnover report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate turnover report' },
    });
  }
});

export default router;
