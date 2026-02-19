import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `FIN-${prefix}-${yy}${mm}-${rand}`;
}

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

const supplierCreateSchema = z.object({
  code: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  contactPerson: z.string().trim().max(200).optional().nullable(),
  addressLine1: z.string().trim().max(200).optional().nullable(),
  addressLine2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  region: z.string().trim().max(100).optional().nullable(),
  postalCode: z.string().trim().max(20).optional().nullable(),
  country: z.string().trim().length(3).optional(),
  taxNumber: z.string().trim().max(50).optional().nullable(),
  currency: z.string().trim().length(3).optional(),
  paymentTerms: z.number().int().min(0).optional(),
  notes: z.string().trim().optional().nullable(),
});

const supplierUpdateSchema = supplierCreateSchema.partial();

const poLineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  taxRateId: z.string().trim().uuid().optional().nullable(),
  accountId: z.string().trim().uuid().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

const poCreateSchema = z.object({
  supplierId: z.string().trim().uuid(),
  orderDate: z.string().trim().or(z.date()),
  expectedDate: z.string().trim().or(z.date()).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  currency: z.string().trim().length(3).optional(),
  lines: z.array(poLineSchema).min(1),
});

const poUpdateSchema = z.object({
  supplierId: z.string().trim().uuid().optional(),
  orderDate: z.string().trim().or(z.date()).optional(),
  expectedDate: z.string().trim().or(z.date()).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  currency: z.string().trim().length(3).optional(),
  lines: z.array(poLineSchema).optional(),
});

const billLineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  taxRateId: z.string().trim().uuid().optional().nullable(),
  accountId: z.string().trim().uuid().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

const billCreateSchema = z.object({
  supplierId: z.string().trim().uuid(),
  purchaseOrderId: z.string().trim().uuid().optional().nullable(),
  billDate: z.string().trim().or(z.date()),
  dueDate: z.string().trim().or(z.date()),
  supplierRef: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  currency: z.string().trim().length(3).optional(),
  lines: z.array(billLineSchema).min(1),
});

const billUpdateSchema = z.object({
  supplierId: z.string().trim().uuid().optional(),
  purchaseOrderId: z.string().trim().uuid().optional().nullable(),
  billDate: z.string().trim().or(z.date()).optional(),
  dueDate: z.string().trim().or(z.date()).optional(),
  supplierRef: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  currency: z.string().trim().length(3).optional(),
  lines: z.array(billLineSchema).optional(),
});

const paymentMadeCreateSchema = z.object({
  supplierId: z.string().trim().uuid(),
  billId: z.string().trim().uuid().optional().nullable(),
  date: z.string().trim().or(z.date()),
  amount: z.number().positive(),
  method: z.enum([
    'BANK_TRANSFER',
    'CHEQUE',
    'CASH',
    'CREDIT_CARD',
    'DIRECT_DEBIT',
    'STANDING_ORDER',
    'OTHER',
  ]),
  bankAccountId: z.string().trim().uuid().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

// ============================================
// SUPPLIERS
// ============================================

// GET /suppliers — List suppliers
router.get('/suppliers', async (req: Request, res: Response) => {
  try {
    const _authReq = req as AuthRequest;
    const { search, isActive, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { contactPerson: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [suppliers, total] = await Promise.all([
      prisma.finSupplier.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              bills: true,
              purchaseOrders: true,
              payments: true,
            },
          },
        },
      }),
      prisma.finSupplier.count({ where }),
    ]);

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        page: Math.max(1, parseInt(page as string, 10) || 1),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Failed to list suppliers', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list suppliers' },
    });
  }
});

// GET /suppliers/:id — Single supplier
router.get('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.finSupplier.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        _count: {
          select: {
            bills: true,
            purchaseOrders: true,
            payments: true,
          },
        },
      },
    });

    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    logger.error('Failed to get supplier', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get supplier' },
    });
  }
});

// POST /suppliers — Create supplier
router.post('/suppliers', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = supplierCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.finSupplier.findUnique({ where: { code: parsed.data.code } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE', message: 'Supplier code already exists' },
      });
    }

    const supplier = await prisma.finSupplier.create({
      data: {
        ...parsed.data,
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Supplier created', { id: supplier.id, code: supplier.code });
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    logger.error('Failed to create supplier', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create supplier' },
    });
  }
});

// PUT /suppliers/:id — Update supplier
router.put('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const parsed = supplierUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.finSupplier.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    if (parsed.data.code && parsed.data.code !== existing.code) {
      const dup = await prisma.finSupplier.findUnique({ where: { code: parsed.data.code } });
      if (dup) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: 'Supplier code already exists' },
        });
      }
    }

    const supplier = await prisma.finSupplier.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    logger.info('Supplier updated', { id: supplier.id });
    res.json({ success: true, data: supplier });
  } catch (error) {
    logger.error('Failed to update supplier', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update supplier' },
    });
  }
});

// DELETE /suppliers/:id — Soft delete
router.delete('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finSupplier.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    // Check for unpaid bills
    const unpaidBills = await prisma.finBill.count({
      where: {
        supplierId: req.params.id,
        deletedAt: null,
        status: { in: ['DRAFT', 'RECEIVED', 'PARTIALLY_PAID', 'OVERDUE'] },
      },
    });

    if (unpaidBills > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'HAS_UNPAID_BILLS',
          message: `Cannot delete supplier with ${unpaidBills} unpaid bill(s)`,
        },
      });
    }

    const supplier = await prisma.finSupplier.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    logger.info('Supplier soft-deleted', { id: supplier.id });
    res.json({ success: true, data: { id: supplier.id, deleted: true } });
  } catch (error) {
    logger.error('Failed to delete supplier', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete supplier' },
    });
  }
});

// ============================================
// PURCHASE ORDERS
// ============================================

// GET /purchase-orders — List POs
router.get('/purchase-orders', async (req: Request, res: Response) => {
  try {
    const { status, supplierId, dateFrom, dateTo, search, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, unknown> = { deletedAt: null };

    if (status) {
      where.status = String(status);
    }
    if (supplierId) {
      where.supplierId = String(supplierId);
    }
    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) where.orderDate.gte = new Date(String(dateFrom));
      if (dateTo) where.orderDate.lte = new Date(String(dateTo));
    }
    if (search) {
      where.OR = [
        { reference: { contains: String(search), mode: 'insensitive' } },
        { supplier: { name: { contains: String(search), mode: 'insensitive' } } },
        { notes: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.finPurchaseOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
      pagination: {
        page: Math.max(1, parseInt(page as string, 10) || 1),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Failed to list purchase orders', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list purchase orders' },
    });
  }
});

// GET /purchase-orders/:id — Single PO
router.get('/purchase-orders/:id', async (req: Request, res: Response) => {
  try {
    const po = await prisma.finPurchaseOrder.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        supplier: { select: { id: true, code: true, name: true, email: true, currency: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!po) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Purchase order not found' },
      });
    }

    res.json({ success: true, data: po });
  } catch (error) {
    logger.error('Failed to get purchase order', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get purchase order' },
    });
  }
});

// POST /purchase-orders — Create PO with lines
router.post('/purchase-orders', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = poCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const supplier = await prisma.finSupplier.findFirst({
      where: { id: parsed.data.supplierId, deletedAt: null },
    });
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    // Calculate line totals
    const linesData = parsed.data.lines.map((line, idx) => {
      const amount = Number((line.quantity * line.unitPrice).toFixed(2));
      return {
        description: line.description,
        quantity: new Prisma.Decimal(line.quantity),
        unitPrice: new Prisma.Decimal(line.unitPrice),
        amount: new Prisma.Decimal(amount),
        taxRateId: line.taxRateId || null,
        taxAmount: new Prisma.Decimal(0),
        accountId: line.accountId || null,
        sortOrder: line.sortOrder ?? idx,
      };
    });

    const subtotal = linesData.reduce((sum, l) => sum + Number(l.amount), 0);
    const taxTotal = linesData.reduce((sum, l) => sum + Number(l.taxAmount), 0);
    const total = subtotal + taxTotal;

    const po = await prisma.finPurchaseOrder.create({
      data: {
        reference: generateReference('PO'),
        supplierId: parsed.data.supplierId,
        orderDate: new Date(parsed.data.orderDate as string),
        expectedDate: parsed.data.expectedDate
          ? new Date(parsed.data.expectedDate as string)
          : null,
        notes: parsed.data.notes || null,
        currency: parsed.data.currency || supplier.currency,
        subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
        taxTotal: new Prisma.Decimal(taxTotal.toFixed(2)),
        total: new Prisma.Decimal(total.toFixed(2)),
        createdBy: authReq.user?.id || 'system',
        lines: { create: linesData },
      },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    logger.info('Purchase order created', { id: po.id, reference: po.reference });
    res.status(201).json({ success: true, data: po });
  } catch (error) {
    logger.error('Failed to create purchase order', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create purchase order' },
    });
  }
});

// PUT /purchase-orders/:id — Update draft PO
router.put('/purchase-orders/:id', async (req: Request, res: Response) => {
  try {
    const parsed = poUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.finPurchaseOrder.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Purchase order not found' },
      });
    }
    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_EDITABLE', message: 'Only draft purchase orders can be updated' },
      });
    }

    const { lines, ...poData } = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (poData.supplierId) updateData.supplierId = poData.supplierId;
    if (poData.orderDate) updateData.orderDate = new Date(poData.orderDate as string);
    if (poData.expectedDate !== undefined)
      updateData.expectedDate = poData.expectedDate
        ? new Date(poData.expectedDate as string)
        : null;
    if (poData.notes !== undefined) updateData.notes = poData.notes;
    if (poData.currency) updateData.currency = poData.currency;

    if (lines && lines.length > 0) {
      // Recalculate totals with new lines
      const linesData = lines.map((line, idx) => {
        const amount = Number((line.quantity * line.unitPrice).toFixed(2));
        return {
          description: line.description,
          quantity: new Prisma.Decimal(line.quantity),
          unitPrice: new Prisma.Decimal(line.unitPrice),
          amount: new Prisma.Decimal(amount),
          taxRateId: line.taxRateId || null,
          taxAmount: new Prisma.Decimal(0),
          accountId: line.accountId || null,
          sortOrder: line.sortOrder ?? idx,
        };
      });

      const subtotal = linesData.reduce((sum, l) => sum + Number(l.amount), 0);
      const taxTotal = linesData.reduce((sum, l) => sum + Number(l.taxAmount), 0);
      const total = subtotal + taxTotal;

      updateData.subtotal = new Prisma.Decimal(subtotal.toFixed(2));
      updateData.taxTotal = new Prisma.Decimal(taxTotal.toFixed(2));
      updateData.total = new Prisma.Decimal(total.toFixed(2));
      updateData.lines = {
        deleteMany: {},
        create: linesData,
      };
    }

    const po = await prisma.finPurchaseOrder.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        supplier: { select: { id: true, code: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    logger.info('Purchase order updated', { id: po.id });
    res.json({ success: true, data: po });
  } catch (error) {
    logger.error('Failed to update purchase order', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update purchase order' },
    });
  }
});

// POST /purchase-orders/:id/approve — Approve PO
router.post('/purchase-orders/:id/approve', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const existing = await prisma.finPurchaseOrder.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Purchase order not found' },
      });
    }
    if (existing.status !== 'DRAFT' && existing.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Purchase order cannot be approved in its current status',
        },
      });
    }

    const po = await prisma.finPurchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: authReq.user?.id || 'system',
        approvedAt: new Date(),
      },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
      },
    });

    logger.info('Purchase order approved', { id: po.id, approvedBy: po.approvedBy });
    res.json({ success: true, data: po });
  } catch (error) {
    logger.error('Failed to approve purchase order', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve purchase order' },
    });
  }
});

// POST /purchase-orders/:id/receive — Mark PO received
router.post('/purchase-orders/:id/receive', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finPurchaseOrder.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Purchase order not found' },
      });
    }
    if (existing.status !== 'APPROVED' && existing.status !== 'PARTIALLY_RECEIVED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only approved or partially received purchase orders can be marked as received',
        },
      });
    }

    const po = await prisma.finPurchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'RECEIVED',
        receivedAt: new Date(),
      },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
      },
    });

    logger.info('Purchase order received', { id: po.id });
    res.json({ success: true, data: po });
  } catch (error) {
    logger.error('Failed to mark purchase order received', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mark purchase order received' },
    });
  }
});

// POST /purchase-orders/:id/cancel — Cancel PO
router.post('/purchase-orders/:id/cancel', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finPurchaseOrder.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Purchase order not found' },
      });
    }
    if (existing.status === 'CANCELLED' || existing.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Purchase order is already cancelled or closed',
        },
      });
    }

    const po = await prisma.finPurchaseOrder.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
      },
    });

    logger.info('Purchase order cancelled', { id: po.id });
    res.json({ success: true, data: po });
  } catch (error) {
    logger.error('Failed to cancel purchase order', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel purchase order' },
    });
  }
});

// ============================================
// BILLS (mounted at /api/payables)
// ============================================

// GET / — List bills
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, supplierId, dateFrom, dateTo, search, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, unknown> = { deletedAt: null };

    if (status) {
      where.status = String(status);
    }
    if (supplierId) {
      where.supplierId = String(supplierId);
    }
    if (dateFrom || dateTo) {
      where.billDate = {};
      if (dateFrom) where.billDate.gte = new Date(String(dateFrom));
      if (dateTo) where.billDate.lte = new Date(String(dateTo));
    }
    if (search) {
      where.OR = [
        { reference: { contains: String(search), mode: 'insensitive' } },
        { supplierRef: { contains: String(search), mode: 'insensitive' } },
        { supplier: { name: { contains: String(search), mode: 'insensitive' } } },
      ];
    }

    const [bills, total] = await Promise.all([
      prisma.finBill.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, code: true, name: true } },
        },
      }),
      prisma.finBill.count({ where }),
    ]);

    res.json({
      success: true,
      data: bills,
      pagination: {
        page: Math.max(1, parseInt(page as string, 10) || 1),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Failed to list bills', { error });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list bills' } });
  }
});

// GET /:id — Single bill with lines, supplier, payments
const PAYABLES_RESERVED = new Set([
  'suppliers',
  'purchase-orders',
  'payments',
  'aging',
  'payment-run',
]);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (PAYABLES_RESERVED.has(req.params.id)) return next('route');
  try {
    const bill = await prisma.finBill.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        supplier: { select: { id: true, code: true, name: true, email: true, currency: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
        payments: { where: { deletedAt: null }, orderBy: { date: 'desc' } },
      },
    });

    if (!bill) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Bill not found' } });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    logger.error('Failed to get bill', { error, id: req.params.id });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get bill' } });
  }
});

// POST / — Create bill with lines
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = billCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const supplier = await prisma.finSupplier.findFirst({
      where: { id: parsed.data.supplierId, deletedAt: null },
    });
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    if (parsed.data.purchaseOrderId) {
      const po = await prisma.finPurchaseOrder.findFirst({
        where: { id: parsed.data.purchaseOrderId, deletedAt: null },
      });
      if (!po) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Purchase order not found' },
        });
      }
    }

    const linesData = parsed.data.lines.map((line, idx) => {
      const amount = Number((line.quantity * line.unitPrice).toFixed(2));
      return {
        description: line.description,
        quantity: new Prisma.Decimal(line.quantity),
        unitPrice: new Prisma.Decimal(line.unitPrice),
        amount: new Prisma.Decimal(amount),
        taxRateId: line.taxRateId || null,
        taxAmount: new Prisma.Decimal(0),
        accountId: line.accountId || null,
        sortOrder: line.sortOrder ?? idx,
      };
    });

    const subtotal = linesData.reduce((sum, l) => sum + Number(l.amount), 0);
    const taxTotal = linesData.reduce((sum, l) => sum + Number(l.taxAmount), 0);
    const total = subtotal + taxTotal;

    const bill = await prisma.finBill.create({
      data: {
        reference: generateReference('BILL'),
        supplierId: parsed.data.supplierId,
        purchaseOrderId: parsed.data.purchaseOrderId || null,
        billDate: new Date(parsed.data.billDate as string),
        dueDate: new Date(parsed.data.dueDate as string),
        supplierRef: parsed.data.supplierRef || null,
        notes: parsed.data.notes || null,
        currency: parsed.data.currency || supplier.currency,
        subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
        taxTotal: new Prisma.Decimal(taxTotal.toFixed(2)),
        total: new Prisma.Decimal(total.toFixed(2)),
        amountDue: new Prisma.Decimal(total.toFixed(2)),
        createdBy: authReq.user?.id || 'system',
        lines: { create: linesData },
      },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    logger.info('Bill created', { id: bill.id, reference: bill.reference });
    res.status(201).json({ success: true, data: bill });
  } catch (error) {
    logger.error('Failed to create bill', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create bill' },
    });
  }
});

// PUT /:id — Update draft bill
router.put('/:id', async (req: Request, res: Response, next) => {
  if (PAYABLES_RESERVED.has(req.params.id)) return next('route');
  try {
    const parsed = billUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.finBill.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Bill not found' } });
    }
    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_EDITABLE', message: 'Only draft bills can be updated' },
      });
    }

    const { lines, ...billData } = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (billData.supplierId) updateData.supplierId = billData.supplierId;
    if (billData.purchaseOrderId !== undefined)
      updateData.purchaseOrderId = billData.purchaseOrderId || null;
    if (billData.billDate) updateData.billDate = new Date(billData.billDate as string);
    if (billData.dueDate) updateData.dueDate = new Date(billData.dueDate as string);
    if (billData.supplierRef !== undefined) updateData.supplierRef = billData.supplierRef;
    if (billData.notes !== undefined) updateData.notes = billData.notes;
    if (billData.currency) updateData.currency = billData.currency;

    if (lines && lines.length > 0) {
      const linesData = lines.map((line, idx) => {
        const amount = Number((line.quantity * line.unitPrice).toFixed(2));
        return {
          description: line.description,
          quantity: new Prisma.Decimal(line.quantity),
          unitPrice: new Prisma.Decimal(line.unitPrice),
          amount: new Prisma.Decimal(amount),
          taxRateId: line.taxRateId || null,
          taxAmount: new Prisma.Decimal(0),
          accountId: line.accountId || null,
          sortOrder: line.sortOrder ?? idx,
        };
      });

      const subtotal = linesData.reduce((sum, l) => sum + Number(l.amount), 0);
      const taxTotal = linesData.reduce((sum, l) => sum + Number(l.taxAmount), 0);
      const total = subtotal + taxTotal;

      updateData.subtotal = new Prisma.Decimal(subtotal.toFixed(2));
      updateData.taxTotal = new Prisma.Decimal(taxTotal.toFixed(2));
      updateData.total = new Prisma.Decimal(total.toFixed(2));
      updateData.amountDue = new Prisma.Decimal((total - Number(existing.amountPaid)).toFixed(2));
      updateData.lines = {
        deleteMany: {},
        create: linesData,
      };
    }

    const bill = await prisma.finBill.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        supplier: { select: { id: true, code: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    logger.info('Bill updated', { id: bill.id });
    res.json({ success: true, data: bill });
  } catch (error) {
    logger.error('Failed to update bill', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update bill' },
    });
  }
});

// ============================================
// PAYMENTS MADE
// ============================================

// POST /payments — Record payment made
router.post('/payments', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = paymentMadeCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const supplier = await prisma.finSupplier.findFirst({
      where: { id: parsed.data.supplierId, deletedAt: null },
    });
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
    }

    let bill = null;
    if (parsed.data.billId) {
      bill = await prisma.finBill.findFirst({
        where: { id: parsed.data.billId, deletedAt: null },
      });
      if (!bill) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Bill not found' } });
      }
      if (bill.status === 'PAID' || bill.status === 'VOID' || bill.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Cannot apply payment to a paid, void, or cancelled bill',
          },
        });
      }
    }

    const payment = await prisma.finPaymentMade.create({
      data: {
        reference: generateReference('PAY'),
        supplierId: parsed.data.supplierId,
        billId: parsed.data.billId || null,
        date: new Date(parsed.data.date as string),
        amount: new Prisma.Decimal(parsed.data.amount),
        method: parsed.data.method as string,
        bankAccountId: parsed.data.bankAccountId || null,
        notes: parsed.data.notes || null,
        createdBy: authReq.user?.id || 'system',
      },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
        bill: {
          select: {
            id: true,
            reference: true,
            total: true,
            amountPaid: true,
            amountDue: true,
            status: true,
          },
        },
      },
    });

    // Update bill if payment is linked
    if (bill && parsed.data.billId) {
      const newAmountPaid = Number(bill.amountPaid) + parsed.data.amount;
      const newAmountDue = Number(bill.total) - newAmountPaid;
      let newStatus: string = bill.status;

      if (newAmountDue <= 0) {
        newStatus = 'PAID';
      } else if (newAmountPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      await prisma.finBill.update({
        where: { id: parsed.data.billId },
        data: {
          amountPaid: new Prisma.Decimal(Math.max(0, newAmountPaid).toFixed(2)),
          amountDue: new Prisma.Decimal(Math.max(0, newAmountDue).toFixed(2)),
          status: newStatus as string,
        },
      });
    }

    logger.info('Payment made recorded', {
      id: payment.id,
      reference: payment.reference,
      billId: parsed.data.billId,
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    logger.error('Failed to record payment', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to record payment' },
    });
  }
});

// GET /payments — List payments made
router.get('/payments', async (req: Request, res: Response) => {
  try {
    const { supplierId, dateFrom, dateTo, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, unknown> = { deletedAt: null };

    if (supplierId) {
      where.supplierId = String(supplierId);
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(String(dateFrom));
      if (dateTo) where.date.lte = new Date(String(dateTo));
    }

    const [payments, total] = await Promise.all([
      prisma.finPaymentMade.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
        include: {
          supplier: { select: { id: true, code: true, name: true } },
          bill: { select: { id: true, reference: true, total: true } },
        },
      }),
      prisma.finPaymentMade.count({ where }),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: Math.max(1, parseInt(page as string, 10) || 1),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error('Failed to list payments', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list payments' },
    });
  }
});

// ============================================
// REPORTS
// ============================================

// GET /aging — AP aging report
router.get('/aging', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const bills = await prisma.finBill.findMany({
      where: {
        deletedAt: null,
        status: { in: ['RECEIVED', 'PARTIALLY_PAID', 'OVERDUE'] },
        amountDue: { gt: 0 },
      },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 1000,
    });

    const aging: {
      current: typeof bills;
      days31to60: typeof bills;
      days61to90: typeof bills;
      over90: typeof bills;
      summary: {
        current: number;
        days31to60: number;
        days61to90: number;
        over90: number;
        total: number;
      };
    } = {
      current: [],
      days31to60: [],
      days61to90: [],
      over90: [],
      summary: { current: 0, days31to60: 0, days61to90: 0, over90: 0, total: 0 },
    };

    for (const bill of bills) {
      const daysOverdue = Math.max(
        0,
        Math.floor((now.getTime() - new Date(bill.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      );
      const due = Number(bill.amountDue);

      if (daysOverdue <= 30) {
        aging.current.push(bill);
        aging.summary.current += due;
      } else if (daysOverdue <= 60) {
        aging.days31to60.push(bill);
        aging.summary.days31to60 += due;
      } else if (daysOverdue <= 90) {
        aging.days61to90.push(bill);
        aging.summary.days61to90 += due;
      } else {
        aging.over90.push(bill);
        aging.summary.over90 += due;
      }
      aging.summary.total += due;
    }

    // Round summaries
    aging.summary.current = Number(aging.summary.current.toFixed(2));
    aging.summary.days31to60 = Number(aging.summary.days31to60.toFixed(2));
    aging.summary.days61to90 = Number(aging.summary.days61to90.toFixed(2));
    aging.summary.over90 = Number(aging.summary.over90.toFixed(2));
    aging.summary.total = Number(aging.summary.total.toFixed(2));

    res.json({ success: true, data: aging });
  } catch (error) {
    logger.error('Failed to generate AP aging report', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate AP aging report' },
    });
  }
});

// POST /payment-run — Payment run stub
router.post('/payment-run', async (req: Request, res: Response) => {
  try {
    const _schema = z.object({
      asOfDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
    });
    const _parsed = _schema.safeParse(req.body);
    if (!_parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
      });
    const { asOfDate } = _parsed.data;
    const cutoffDate = asOfDate ? new Date(asOfDate) : new Date();

    const dueBills = await prisma.finBill.findMany({
      where: {
        deletedAt: null,
        status: { in: ['RECEIVED', 'PARTIALLY_PAID', 'OVERDUE'] },
        dueDate: { lte: cutoffDate },
        amountDue: { gt: 0 },
      },
      include: {
        supplier: {
          select: { id: true, code: true, name: true, currency: true, paymentTerms: true },
        },
      },
      orderBy: [{ supplier: { name: 'asc' } }, { dueDate: 'asc' }],
      take: 1000,
    });

    // Group by supplier
    const bySupplier: Record<
      string,
      { supplier: Record<string, unknown>; bills: typeof dueBills; totalDue: number }
    > = {};
    for (const bill of dueBills) {
      const sid = bill.supplierId;
      if (!bySupplier[sid]) {
        bySupplier[sid] = { supplier: bill.supplier, bills: [], totalDue: 0 };
      }
      bySupplier[sid].bills.push(bill);
      bySupplier[sid].totalDue += Number(bill.amountDue);
    }

    const plannedPayments = Object.values(bySupplier).map((group) => ({
      supplier: group.supplier,
      billCount: group.bills.length,
      totalDue: Number(group.totalDue.toFixed(2)),
      bills: group.bills.map((b) => ({
        id: b.id,
        reference: b.reference,
        dueDate: b.dueDate,
        amountDue: b.amountDue,
      })),
    }));

    const grandTotal = plannedPayments.reduce((sum, p) => sum + p.totalDue, 0);

    res.json({
      success: true,
      data: {
        cutoffDate,
        supplierCount: plannedPayments.length,
        billCount: dueBills.length,
        grandTotal: Number(grandTotal.toFixed(2)),
        payments: plannedPayments,
      },
    });
  } catch (error) {
    logger.error('Failed to generate payment run', { error });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate payment run' },
    });
  }
});

export default router;
