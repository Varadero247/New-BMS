import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function generateReference(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `FIN-PO-${yy}${mm}-${rand}`;
}

const poLineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().min(0.01),
  unitPrice: z.number().min(0),
  taxRateId: z.string().trim().uuid().optional().nullable(),
  accountId: z.string().trim().uuid().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

const createSchema = z.object({
  supplierId: z.string().trim().uuid(),
  orderDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
  expectedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
  currency: z.string().length(3).default('GBP'),
  notes: z.string().max(2000).optional().nullable(),
  lines: z.array(poLineSchema).min(1),
});

const updateSchema = z.object({
  supplierId: z.string().trim().uuid().optional(),
  orderDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  expectedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
  currency: z.string().length(3).optional(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(['DRAFT', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED']).optional(),
});

// GET / — List purchase orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const { supplierId, status, dateFrom, dateTo } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (supplierId && typeof supplierId === 'string') where.supplierId = supplierId;
    if (status && typeof status === 'string') where.status = status as any;
    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) (where.orderDate as any).gte = new Date(String(dateFrom));
      if (dateTo) (where.orderDate as any).lte = new Date(String(dateTo));
    }

    const [orders, total] = await Promise.all([
      prisma.finPurchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderDate: 'desc' },
        include: {
          supplier: { select: { id: true, code: true, name: true } },
          _count: { select: { lines: true } },
        },
      }),
      prisma.finPurchaseOrder.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list purchase orders', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list purchase orders' } });
  }
});

// GET /:id — Single purchase order with lines
const RESERVED = new Set(['stats']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const order = await prisma.finPurchaseOrder.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        supplier: true,
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Purchase order not found' } });
    }

    res.json({ success: true, data: order });
  } catch (error: unknown) {
    logger.error('Failed to get purchase order', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get purchase order' } });
  }
});

// POST / — Create purchase order
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const { supplierId, orderDate, expectedDate, currency, notes, lines } = parsed.data;

    const supplier = await prisma.finSupplier.findFirst({ where: { id: supplierId, deletedAt: null, isActive: true } as any });
    if (!supplier) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found or inactive' } });
    }

    const authReq = req as AuthRequest;
    const reference = generateReference();

    // Calculate totals
    const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

    const order = await prisma.finPurchaseOrder.create({
      data: {
        reference,
        supplierId,
        orderDate: new Date(orderDate),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        currency: currency || 'GBP',
        notes: notes ?? null,
        status: 'DRAFT',
        subtotal: new Prisma.Decimal(subtotal),
        taxTotal: new Prisma.Decimal(0),
        total: new Prisma.Decimal(subtotal),
        createdBy: authReq.user?.id || 'system',
        lines: {
          create: lines.map((l) => ({
            description: l.description,
            quantity: new Prisma.Decimal(l.quantity),
            unitPrice: new Prisma.Decimal(l.unitPrice),
            amount: new Prisma.Decimal(l.quantity * l.unitPrice),
            taxRateId: l.taxRateId ?? null,
            accountId: l.accountId ?? null,
            sortOrder: l.sortOrder,
          })),
        },
      },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    logger.info('Purchase order created', { orderId: order.id, reference });
    res.status(201).json({ success: true, data: order });
  } catch (error: unknown) {
    logger.error('Failed to create purchase order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create purchase order' } });
  }
});

// PUT /:id — Update purchase order (header only, DRAFT only)
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.finPurchaseOrder.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Purchase order not found' } });
    }
    if (existing.status === 'RECEIVED' || existing.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: `Cannot update a ${existing.status} purchase order` } });
    }

    const { orderDate, expectedDate, status, ...rest } = parsed.data;
    const authReq = req as AuthRequest;

    const updateData: Record<string, unknown> = { ...rest };
    if (orderDate) updateData.orderDate = new Date(orderDate);
    if (expectedDate !== undefined) updateData.expectedDate = expectedDate ? new Date(expectedDate) : null;
    if (status) updateData.status = status;
    if (status === 'RECEIVED') updateData.receivedAt = new Date();
    if (status === 'SENT') updateData.approvedBy = authReq.user?.id || 'system';

    const order = await prisma.finPurchaseOrder.update({
      where: { id },
      data: { ...updateData, updatedAt: new Date() },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    logger.info('Purchase order updated', { orderId: id });
    res.json({ success: true, data: order });
  } catch (error: unknown) {
    logger.error('Failed to update purchase order', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update purchase order' } });
  }
});

// DELETE /:id — Soft delete purchase order (DRAFT only)
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.finPurchaseOrder.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Purchase order not found' } });
    }
    if (existing.status !== 'DRAFT' && existing.status !== 'CANCELLED') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: `Cannot delete a ${existing.status} purchase order` } });
    }

    await prisma.finPurchaseOrder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Purchase order soft-deleted', { orderId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete purchase order', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete purchase order' } });
  }
});

export default router;
