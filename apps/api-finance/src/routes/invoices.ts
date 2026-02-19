import { randomUUID } from 'crypto';
import { Router, Response } from 'express';
import { prisma} from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `FIN-${prefix}-${yy}${mm}-${rand}`;
}

function getAgingBucket(daysOverdue: number): string {
  if (daysOverdue <= 30) return '0-30';
  if (daysOverdue <= 60) return '31-60';
  if (daysOverdue <= 90) return '61-90';
  return '90+';
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const customerCreateSchema = z.object({
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(50).optional(),
  contactPerson: z.string().trim().max(200).optional(),
  addressLine1: z.string().trim().max(255).optional(),
  addressLine2: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().max(100).optional(),
  taxNumber: z.string().trim().max(50).optional(),
  currency: z.string().trim().length(3).default('USD'),
  paymentTerms: z.string().trim().max(50).optional(),
  creditLimit: z.number().min(0).optional(),
});

const customerUpdateSchema = customerCreateSchema.partial().omit({ code: true });

const invoiceLineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  taxRateId: z.string().trim().uuid().optional(),
  accountId: z.string().trim().uuid().optional(),
});

const invoiceCreateSchema = z.object({
  customerId: z.string().trim().uuid(),
  issueDate: z
    .string()
    .trim()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  dueDate: z
    .string()
    .trim()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  notes: z.string().trim().max(2000).optional(),
  lines: z.array(invoiceLineSchema).min(1, 'At least one line item is required'),
});

const invoiceUpdateSchema = z.object({
  customerId: z.string().trim().uuid().optional(),
  issueDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' })
    .optional(),
  dueDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' })
    .optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  lines: z.array(invoiceLineSchema).min(1).optional(),
});

const paymentCreateSchema = z.object({
  customerId: z.string().trim().uuid(),
  invoiceId: z.string().trim().uuid().optional(),
  date: z
    .string()
    .trim()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  amount: z.number().positive(),
  method: z.string().trim().min(1).max(50),
  bankAccountId: z.string().trim().uuid().optional(),
  notes: z.string().trim().max(2000).optional(),
});

const creditNoteCreateSchema = z.object({
  customerId: z.string().trim().uuid(),
  date: z
    .string()
    .trim()
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date' }),
  amount: z.number().positive(),
  reason: z.string().trim().min(1).max(2000),
  invoiceId: z.string().trim().uuid().optional(),
});

// ===========================================================================
// CUSTOMER ENDPOINTS
// ===========================================================================

// GET /customers - List customers
router.get('/customers', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, isActive } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { code: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { contactPerson: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.finCustomer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { invoices: true } },
        },
      }),
      prisma.finCustomer.count({ where }),
    ]);

    res.json({
      success: true,
      data: customers,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List customers error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list customers' },
    });
  }
});

// GET /customers/:id - Single customer with invoice count
router.get('/customers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const customer = await prisma.finCustomer.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { invoices: true, payments: true, creditNotes: true } },
      },
    });

    if (!customer || customer.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    logger.error('Get customer error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get customer' },
    });
  }
});

// POST /customers - Create customer
router.post('/customers', async (req: AuthRequest, res: Response) => {
  try {
    const data = customerCreateSchema.parse(req.body);

    // Check for duplicate code
    const existing = await prisma.finCustomer.findUnique({ where: { code: data.code } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_CODE', message: 'Customer code already exists' },
      });
    }

    const customer = await prisma.finCustomer.create({
      data: {
        ...data,
        isActive: true,
        createdById: req.user?.id,
        updatedById: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: customer });
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
    logger.error('Create customer error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create customer' },
    });
  }
});

// PUT /customers/:id - Update customer
router.put('/customers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.finCustomer.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const data = customerUpdateSchema.parse(req.body);

    const customer = await prisma.finCustomer.update({
      where: { id: req.params.id },
      data: {
        ...data,
        updatedById: req.user?.id,
      },
    });

    res.json({ success: true, data: customer });
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
    logger.error('Update customer error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update customer' },
    });
  }
});

// DELETE /customers/:id - Soft delete (409 if has unpaid invoices)
router.delete('/customers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.finCustomer.findUnique({
      where: { id: req.params.id },
      include: {
        invoices: {
          where: {
            status: { in: ['DRAFT', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
          },
          take: 1,
        },
      },
    });

    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    if (existing.invoices.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'HAS_UNPAID_INVOICES',
          message: 'Cannot delete customer with unpaid invoices. Settle all invoices first.',
        },
      });
    }

    await prisma.finCustomer.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false, updatedById: req.user?.id },
    });

    res.json({ success: true, data: { message: 'Customer deleted' } });
  } catch (error) {
    logger.error('Delete customer error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete customer' },
    });
  }
});

// ===========================================================================
// INVOICE ENDPOINTS
// ===========================================================================

// GET / - List invoices
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, customerId, dateFrom, dateTo, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (customerId) where.customerId = customerId as string;

    if (dateFrom || dateTo) {
      where.issueDate = {};
      if (dateFrom) where.issueDate.gte = new Date(dateFrom as string);
      if (dateTo) where.issueDate.lte = new Date(dateTo as string);
    }

    if (search) {
      where.OR = [
        { reference: { contains: search as string, mode: 'insensitive' } },
        { customer: { name: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.finInvoice.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, code: true, name: true } },
          _count: { select: { lines: true } },
        },
      }),
      prisma.finInvoice.count({ where }),
    ]);

    res.json({
      success: true,
      data: invoices,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List invoices error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list invoices' },
    });
  }
});

// GET /aging - AR aging report
router.get('/aging', async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.finInvoice.findMany({
      where: {
        status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
        amountDue: { gt: 0 },
      },
      include: {
        customer: { select: { id: true, code: true, name: true } },
      },
      take: 1000,
    });

    const now = new Date();
    const buckets: Record<
      string,
      { total: number; count: number; invoices: Record<string, unknown>[] }
    > = {
      '0-30': { total: 0, count: 0, invoices: [] },
      '31-60': { total: 0, count: 0, invoices: [] },
      '61-90': { total: 0, count: 0, invoices: [] },
      '90+': { total: 0, count: 0, invoices: [] },
    };

    for (const inv of invoices) {
      const daysOverdue = Math.max(
        0,
        Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      );
      const bucket = getAgingBucket(daysOverdue);
      buckets[bucket].total += Number(inv.amountDue);
      buckets[bucket].count += 1;
      buckets[bucket].invoices.push({
        id: inv.id,
        reference: inv.reference,
        customer: inv.customer,
        amountDue: inv.amountDue,
        dueDate: inv.dueDate,
        daysOverdue,
      });
    }

    const grandTotal = Object.values(buckets).reduce((sum, b) => sum + b.total, 0);

    res.json({
      success: true,
      data: {
        buckets,
        grandTotal,
        asOfDate: now.toISOString(),
      },
    });
  } catch (error) {
    logger.error('AR aging report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate aging report' },
    });
  }
});

// GET /statements/:customerId - Customer statement
router.get('/statements/:customerId', async (req: AuthRequest, res: Response) => {
  try {
    const { customerId } = req.params;

    const customer = await prisma.finCustomer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const [invoices, payments, creditNotes] = await Promise.all([
      prisma.finInvoice.findMany({
        where: { customerId },
        orderBy: { issueDate: 'asc' },
        select: {
          id: true,
          reference: true,
          issueDate: true,
          dueDate: true,
          total: true,
          amountPaid: true,
          amountDue: true,
          status: true,
        },
        take: 1000,
      }),
      prisma.finPaymentReceived.findMany({
        where: { customerId },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          reference: true,
          date: true,
          amount: true,
          method: true,
          invoiceId: true,
        },
        take: 1000,
      }),
      prisma.finCreditNote.findMany({
        where: { customerId },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          reference: true,
          date: true,
          amount: true,
          reason: true,
          invoiceId: true,
        },
        take: 1000,
      }),
    ]);

    const totalInvoiced = invoices.reduce((sum: number, inv: { total: unknown }) => sum + Number(inv.total), 0);
    const totalPaid = payments.reduce((sum: number, p: { amount: unknown }) => sum + Number(p.amount), 0);
    const totalCredits = creditNotes.reduce((sum: number, cn: { amount: unknown }) => sum + Number(cn.amount), 0);
    const balanceDue = totalInvoiced - totalPaid - totalCredits;

    res.json({
      success: true,
      data: {
        customer: { id: customer.id, code: customer.code, name: customer.name },
        invoices,
        payments,
        creditNotes,
        summary: {
          totalInvoiced,
          totalPaid,
          totalCredits,
          balanceDue,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Customer statement error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate statement' },
    });
  }
});

// GET /credit-notes - List credit notes
router.get('/credit-notes', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', customerId } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId as string;

    const [creditNotes, total] = await Promise.all([
      prisma.finCreditNote.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, code: true, name: true } },
          invoice: { select: { id: true, reference: true } },
        },
      }),
      prisma.finCreditNote.count({ where }),
    ]);

    res.json({
      success: true,
      data: creditNotes,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List credit notes error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list credit notes' },
    });
  }
});

// POST /credit-notes - Create credit note
router.post('/credit-notes', async (req: AuthRequest, res: Response) => {
  try {
    const data = creditNoteCreateSchema.parse(req.body);

    // Validate customer exists
    const customer = await prisma.finCustomer.findUnique({ where: { id: data.customerId } });
    if (!customer || customer.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    // Validate invoice if provided
    if (data.invoiceId) {
      const invoice = await prisma.finInvoice.findUnique({ where: { id: data.invoiceId } });
      if (!invoice) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
      }
      if (invoice.customerId !== data.customerId) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISMATCH', message: 'Invoice does not belong to the specified customer' },
        });
      }
    }

    const reference = generateReference('CN');

    const creditNote = await prisma.finCreditNote.create({
      data: {
        reference,
        customerId: data.customerId,
        invoiceId: data.invoiceId || null,
        date: new Date(data.date),
        amount: data.amount,
        reason: data.reason,
        createdById: req.user?.id,
      },
      include: {
        customer: { select: { id: true, code: true, name: true } },
      },
    });

    res.status(201).json({ success: true, data: creditNote });
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
    logger.error('Create credit note error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create credit note' },
    });
  }
});

// GET /payments - List payments received
router.get('/payments', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', customerId, dateFrom, dateTo } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId as string;

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const [payments, total] = await Promise.all([
      prisma.finPaymentReceived.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, code: true, name: true } },
          invoice: { select: { id: true, reference: true } },
        },
      }),
      prisma.finPaymentReceived.count({ where }),
    ]);

    res.json({
      success: true,
      data: payments,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List payments error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list payments' },
    });
  }
});

// POST /payments - Record payment received
router.post('/payments', async (req: AuthRequest, res: Response) => {
  try {
    const data = paymentCreateSchema.parse(req.body);

    // Validate customer exists
    const customer = await prisma.finCustomer.findUnique({ where: { id: data.customerId } });
    if (!customer || customer.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    // Validate invoice if provided
    let invoice: Record<string, unknown> | null = null;
    if (data.invoiceId) {
      invoice = await prisma.finInvoice.findUnique({ where: { id: data.invoiceId } });
      if (!invoice) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
      }
      if (invoice.customerId !== data.customerId) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISMATCH', message: 'Invoice does not belong to the specified customer' },
        });
      }
      if (invoice.status === 'VOID' || invoice.status === 'PAID') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Cannot apply payment to ${invoice.status} invoice`,
          },
        });
      }
    }

    const reference = generateReference('PMT');

    // Use transaction to create payment and update invoice atomically
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.finPaymentReceived.create({
        data: {
          reference,
          customerId: data.customerId,
          invoiceId: data.invoiceId || null,
          date: new Date(data.date),
          amount: data.amount,
          method: data.method,
          bankAccountId: data.bankAccountId || null,
          notes: data.notes || null,
          createdById: req.user?.id,
        },
        include: {
          customer: { select: { id: true, code: true, name: true } },
          invoice: { select: { id: true, reference: true } },
        },
      });

      // Update invoice if payment is linked
      if (data.invoiceId && invoice) {
        const newAmountPaid = Number(invoice.amountPaid) + data.amount;
        const newAmountDue = Number(invoice.total) - newAmountPaid;
        const newStatus = newAmountDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';

        await tx.finInvoice.update({
          where: { id: data.invoiceId },
          data: {
            amountPaid: Math.min(newAmountPaid, Number(invoice.total)),
            amountDue: Math.max(newAmountDue, 0),
            status: newStatus,
            paidAt: newStatus === 'PAID' ? new Date() : undefined,
          },
        });
      }

      return payment;
    });

    res.status(201).json({ success: true, data: result });
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
    logger.error('Create payment error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create payment' },
    });
  }
});

// GET /:id - Single invoice with lines, customer, and payments
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.finInvoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        lines: { orderBy: { sortOrder: 'asc' } },
        payments: { orderBy: { date: 'desc' } },
      },
    });

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    logger.error('Get invoice error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get invoice' },
    });
  }
});

// POST / - Create invoice with lines
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = invoiceCreateSchema.parse(req.body);

    // Validate customer exists
    const customer = await prisma.finCustomer.findUnique({ where: { id: data.customerId } });
    if (!customer || customer.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    // Batch-fetch tax rates for all lines that specify one
    const taxRateIds = [...new Set(data.lines.map((l) => l.taxRateId).filter(Boolean) as string[])];
    const taxRates =
      taxRateIds.length > 0
        ? await prisma.finTaxRate.findMany({
            where: { id: { in: taxRateIds }, isActive: true },
            take: 1000,
          })
        : [];
    const taxRateMap = new Map(taxRates.map((r: { id: string; rate: unknown }) => [r.id, Number(r.rate)]));

    // Calculate totals from lines
    let subtotal = 0;
    let taxTotal = 0;
    const lineData = data.lines.map((line, index) => {
      const lineSubtotal = line.quantity * line.unitPrice;
      const taxRatePct = line.taxRateId ? (taxRateMap.get(line.taxRateId) ?? 0) : 0;
      const lineTax = Math.round(lineSubtotal * taxRatePct) / 100;
      subtotal += lineSubtotal;
      taxTotal += lineTax;

      return {
        sortOrder: index + 1,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRateId: line.taxRateId || null,
        accountId: line.accountId || null,
        lineTotal: lineSubtotal,
        taxAmount: lineTax,
      };
    });

    const total = subtotal + taxTotal;
    const reference = generateReference('INV');

    const invoice = await prisma.finInvoice.create({
      data: {
        reference,
        customerId: data.customerId,
        status: 'DRAFT',
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        subtotal,
        taxTotal,
        total,
        amountPaid: 0,
        amountDue: total,
        currency: customer.currency || 'USD',
        notes: data.notes || null,
        createdById: req.user?.id,
        updatedById: req.user?.id,
        lines: {
          create: lineData as Record<string, unknown>,
        },
      },
      include: {
        customer: { select: { id: true, code: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    res.status(201).json({ success: true, data: invoice });
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
    logger.error('Create invoice error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create invoice' },
    });
  }
});

// PUT /:id - Update draft invoice
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.finInvoice.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_DRAFT', message: 'Only draft invoices can be updated' },
      });
    }

    const data = invoiceUpdateSchema.parse(req.body);

    // If customerId provided, validate it
    if (data.customerId) {
      const customer = await prisma.finCustomer.findUnique({ where: { id: data.customerId } });
      if (!customer || customer.deletedAt) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
      }
    }

    // Recalculate totals if lines provided
    let updateData: Record<string, unknown> = {
      customerId: data.customerId,
      issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      notes: data.notes,
      updatedById: req.user?.id,
    };

    // Remove undefined keys
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    if (data.lines) {
      const updateTaxRateIds = [
        ...new Set(data.lines.map((l) => l.taxRateId).filter(Boolean) as string[]),
      ];
      const updateTaxRates =
        updateTaxRateIds.length > 0
          ? await prisma.finTaxRate.findMany({
              where: { id: { in: updateTaxRateIds }, isActive: true },
              take: 1000,
            })
          : [];
      const updateTaxRateMap = new Map(updateTaxRates.map((r: { id: string; rate: unknown }) => [r.id, Number(r.rate)]));

      let subtotal = 0;
      let taxTotal = 0;
      const lineData = data.lines.map((line, index) => {
        const lineSubtotal = line.quantity * line.unitPrice;
        const taxRatePct = line.taxRateId ? (updateTaxRateMap.get(line.taxRateId) ?? 0) : 0;
        const lineTax = Math.round(lineSubtotal * taxRatePct) / 100;
        subtotal += lineSubtotal;
        taxTotal += lineTax;

        return {
          sortOrder: index + 1,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRateId: line.taxRateId || null,
          accountId: line.accountId || null,
          lineTotal: lineSubtotal,
          taxAmount: lineTax,
        };
      });

      const total = subtotal + taxTotal;

      // Delete existing lines and recreate
      await prisma.finInvoiceLine.deleteMany({ where: { invoiceId: req.params.id } });

      updateData = {
        ...updateData,
        subtotal,
        taxTotal,
        total,
        amountDue: total,
        lines: { create: lineData },
      };
    }

    const invoice = await prisma.finInvoice.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        customer: { select: { id: true, code: true, name: true } },
        lines: { orderBy: { sortOrder: 'asc' } },
      },
    });

    res.json({ success: true, data: invoice });
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
    logger.error('Update invoice error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update invoice' },
    });
  }
});

// POST /:id/send - Mark invoice as SENT
router.post('/:id/send', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.finInvoice.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Only draft invoices can be sent' },
      });
    }

    const invoice = await prisma.finInvoice.update({
      where: { id: req.params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        updatedById: req.user?.id,
      },
      include: {
        customer: { select: { id: true, code: true, name: true } },
      },
    });

    res.json({ success: true, data: invoice });
  } catch (error) {
    logger.error('Send invoice error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to send invoice' },
    });
  }
});

// POST /:id/void - Void invoice
router.post('/:id/void', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.finInvoice.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    if (existing.status === 'VOID') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_VOID', message: 'Invoice is already voided' },
      });
    }

    if (existing.status === 'PAID') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_VOID_PAID',
          message: 'Cannot void a fully paid invoice. Create a credit note instead.',
        },
      });
    }

    const voidReasonSchema = z.object({
      reason: z.string().trim().min(1).max(500),
    });
    const { reason } = voidReasonSchema.parse(req.body);

    const invoice = await prisma.finInvoice.update({
      where: { id: req.params.id },
      data: {
        status: 'VOID',
        voidedAt: new Date(),
        voidReason: reason,
        amountDue: 0,
        updatedById: req.user?.id,
      },
      include: {
        customer: { select: { id: true, code: true, name: true } },
      },
    });

    res.json({ success: true, data: invoice });
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
    logger.error('Void invoice error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to void invoice' },
    });
  }
});

export default router;
