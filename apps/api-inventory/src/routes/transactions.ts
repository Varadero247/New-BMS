import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-inventory');

const router: IRouter = Router();

router.use(authenticate);
router.param('id', validateIdParam());
router.param('productId', validateIdParam('productId'));

// GET /api/inventory/transactions - List transactions (audit trail)
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      productId,
      warehouseId,
      transactionType,
      referenceType,
      startDate,
      endDate,
      performedById,
    } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query, { defaultLimit: 50 });

    const where: Record<string, unknown> = { deletedAt: null };

    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (transactionType) where.transactionType = transactionType;
    if (referenceType) where.referenceType = referenceType;
    if (performedById) where.performedById = performedById;

    // Date range filter
    if (startDate || endDate) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);
      where.transactionDate = dateFilter;
    }

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        // FINDING-040: select list fields only — exclude free-text notes to reduce bandwidth
        select: {
          id: true,
          orgId: true,
          productId: true,
          transactionType: true,
          referenceNumber: true,
          referenceType: true,
          referenceId: true,
          quantityBefore: true,
          quantityAfter: true,
          quantityChange: true,
          warehouseId: true,
          fromWarehouseId: true,
          toWarehouseId: true,
          binLocation: true,
          lotNumber: true,
          serialNumber: true,
          expiryDate: true,
          unitCost: true,
          totalCost: true,
          reason: true,
          performedById: true,
          transactionDate: true,
          createdAt: true,
          product: { select: { id: true, sku: true, name: true } },
          warehouse: { select: { id: true, code: true, name: true } },
          fromWarehouse: { select: { id: true, code: true, name: true } },
        },
        skip,
        take: limitNum,
        orderBy: { transactionDate: 'desc' },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: transactions,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List transactions error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list transactions' },
    });
  }
});

// GET /api/inventory/transactions/summary - Transaction summary statistics
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, warehouseId } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (warehouseId) where.warehouseId = warehouseId;

    // Default to last 30 days if no date range specified
    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    where.transactionDate = { gte: start, lte: end };

    // Get transaction counts by type
    const transactionsByType = await prisma.inventoryTransaction.groupBy({
      by: ['transactionType'],
      where,
      _count: { id: true },
      _sum: { quantityChange: true, totalCost: true },
    });

    // Get daily transaction volumes
    let dailyTransactions: unknown[];
    if (warehouseId) {
      dailyTransactions = await prisma.$queryRaw`
        SELECT
          DATE("transactionDate") as date,
          COUNT(*) as count,
          SUM(CASE WHEN "quantityChange" > 0 THEN "quantityChange" ELSE 0 END) as total_in,
          SUM(CASE WHEN "quantityChange" < 0 THEN ABS("quantityChange") ELSE 0 END) as total_out
        FROM inventory_transactions
        WHERE "transactionDate" >= ${start} AND "transactionDate" <= ${end}
        AND "warehouseId" = ${warehouseId}
        GROUP BY DATE("transactionDate")
        ORDER BY date DESC
        LIMIT 30
      `;
    } else {
      dailyTransactions = await prisma.$queryRaw`
        SELECT
          DATE("transactionDate") as date,
          COUNT(*) as count,
          SUM(CASE WHEN "quantityChange" > 0 THEN "quantityChange" ELSE 0 END) as total_in,
          SUM(CASE WHEN "quantityChange" < 0 THEN ABS("quantityChange") ELSE 0 END) as total_out
        FROM inventory_transactions
        WHERE "transactionDate" >= ${start} AND "transactionDate" <= ${end}
        GROUP BY DATE("transactionDate")
        ORDER BY date DESC
        LIMIT 30
      `;
    }

    // Calculate totals
    const totals = transactionsByType.reduce(
      (acc, t) => {
        return {
          totalTransactions: acc.totalTransactions + (t._count.id || 0),
          totalIn:
            acc.totalIn +
            (['RECEIPT', 'ADJUSTMENT_IN', 'TRANSFER_IN', 'RETURN', 'INITIAL'].includes(
              t.transactionType as string
            )
              ? Math.abs(t._sum.quantityChange || 0)
              : 0),
          totalOut:
            acc.totalOut +
            (['ISSUE', 'ADJUSTMENT_OUT', 'TRANSFER_OUT', 'DAMAGE', 'EXPIRED'].includes(
              t.transactionType as string
            )
              ? Math.abs(t._sum.quantityChange || 0)
              : 0),
          totalValue: acc.totalValue + Math.abs(Number(t._sum.totalCost) || 0),
        };
      },
      { totalTransactions: 0, totalIn: 0, totalOut: 0, totalValue: 0 }
    );

    res.json({
      success: true,
      data: {
        period: { start, end },
        totals,
        byType: transactionsByType.map((t) => ({
          type: t.transactionType,
          count: (t as { _count: { id: number } })._count.id,
          quantityChange: t._sum.quantityChange,
          totalValue: t._sum.totalCost,
        })),
        dailyTrend: dailyTransactions,
      },
    });
  } catch (error) {
    logger.error('Transaction summary error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get transaction summary' },
    });
  }
});

// GET /api/inventory/transactions/product/:productId - Transaction history for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query, { defaultLimit: 50 });

    const [transactions, total, product] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where: { productId: req.params.productId },
        skip,
        take: limitNum,
        orderBy: { transactionDate: 'desc' },
        include: {
          warehouse: { select: { id: true, code: true, name: true } },
          fromWarehouse: { select: { id: true, code: true, name: true } },
        },
      }),
      prisma.inventoryTransaction.count({ where: { productId: req.params.productId } }),
      prisma.product.findUnique({
        where: { id: req.params.productId },
        select: { id: true, sku: true, name: true },
      }),
    ]);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    res.json({
      success: true,
      data: {
        product,
        transactions,
      },
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Product transaction history error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get product transaction history' },
    });
  }
});

// GET /api/inventory/transactions/:id - Get single transaction
router.get(
  '/:id',
  checkOwnership(prisma.inventoryTransaction),
  async (req: Request, res: Response) => {
    try {
      const transaction = await prisma.inventoryTransaction.findUnique({
        where: { id: req.params.id },
        include: {
          product: { select: { id: true, sku: true, name: true, barcode: true } },
          warehouse: { select: { id: true, code: true, name: true } },
          fromWarehouse: { select: { id: true, code: true, name: true } },
        },
      });

      if (!transaction) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
      }

      res.json({ success: true, data: transaction });
    } catch (error) {
      logger.error('Get transaction error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get transaction' },
      });
    }
  }
);

export default router;
