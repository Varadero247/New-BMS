import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';

const router: IRouter = Router();

router.use(authenticate);

// GET /api/inventory/transactions - List transactions (audit trail)
router.get('/', async (req: AuthRequest, res: Response) => {
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

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (transactionType) where.transactionType = transactionType;
    if (referenceType) where.referenceType = referenceType;
    if (performedById) where.performedById = performedById;

    // Date range filter
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate as string);
      if (endDate) where.transactionDate.lte = new Date(endDate as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { transactionDate: 'desc' },
        include: {
          product: { select: { id: true, sku: true, name: true } },
          warehouse: { select: { id: true, code: true, name: true } },
          fromWarehouse: { select: { id: true, code: true, name: true } },
        },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: transactions,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list transactions' } });
  }
});

// GET /api/inventory/transactions/summary - Transaction summary statistics
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, warehouseId } = req.query;

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;

    // Default to last 30 days if no date range specified
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
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
    const dailyTransactions = await prisma.$queryRaw`
      SELECT
        DATE("transactionDate") as date,
        COUNT(*) as count,
        SUM(CASE WHEN "quantityChange" > 0 THEN "quantityChange" ELSE 0 END) as total_in,
        SUM(CASE WHEN "quantityChange" < 0 THEN ABS("quantityChange") ELSE 0 END) as total_out
      FROM inventory_transactions
      WHERE "transactionDate" >= ${start} AND "transactionDate" <= ${end}
      ${warehouseId ? prisma.$queryRaw`AND "warehouseId" = ${warehouseId}` : prisma.$queryRaw``}
      GROUP BY DATE("transactionDate")
      ORDER BY date DESC
      LIMIT 30
    ` as any[];

    // Calculate totals
    const totals = transactionsByType.reduce((acc, t) => {
      return {
        totalTransactions: acc.totalTransactions + (t._count.id || 0),
        totalIn: acc.totalIn + (['RECEIPT', 'ADJUSTMENT_IN', 'TRANSFER_IN', 'RETURN', 'INITIAL'].includes(t.transactionType as string) ? Math.abs(t._sum.quantityChange || 0) : 0),
        totalOut: acc.totalOut + (['ISSUE', 'ADJUSTMENT_OUT', 'TRANSFER_OUT', 'DAMAGE', 'EXPIRED'].includes(t.transactionType as string) ? Math.abs(t._sum.quantityChange || 0) : 0),
        totalValue: acc.totalValue + Math.abs(t._sum.totalCost || 0),
      };
    }, { totalTransactions: 0, totalIn: 0, totalOut: 0, totalValue: 0 });

    res.json({
      success: true,
      data: {
        period: { start, end },
        totals,
        byType: transactionsByType.map(t => ({
          type: t.transactionType,
          count: t._count.id,
          quantityChange: t._sum.quantityChange,
          totalValue: t._sum.totalCost,
        })),
        dailyTrend: dailyTransactions,
      },
    });
  } catch (error) {
    console.error('Transaction summary error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get transaction summary' } });
  }
});

// GET /api/inventory/transactions/product/:productId - Transaction history for a product
router.get('/product/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
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
    console.error('Product transaction history error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get product transaction history' } });
  }
});

// GET /api/inventory/transactions/:id - Get single transaction
router.get('/:id', async (req: AuthRequest, res: Response) => {
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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get transaction' } });
  }
});

export default router;
