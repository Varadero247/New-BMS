import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);

function generateCode(name: string, rand: number): string {
  const slug = name
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 6)
    .padEnd(3, 'X');
  return `CUST-${slug}-${rand.toString().padStart(4, '0')}`;
}

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  contactPerson: z.string().trim().max(100).optional().nullable(),
  addressLine1: z.string().trim().max(200).optional().nullable(),
  addressLine2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  region: z.string().trim().max(100).optional().nullable(),
  postalCode: z.string().trim().max(20).optional().nullable(),
  country: z.string().trim().length(2).default('GB'),
  taxNumber: z.string().trim().max(50).optional().nullable(),
  currency: z.string().trim().length(3).default('GBP'),
  paymentTerms: z.number().int().min(0).default(30),
  creditLimit: z.number().min(0).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// GET / — List customers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, isActive, country } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (country && typeof country === 'string') where.country = country;
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.finCustomer.findMany({
        where,
        skip,
        take: limit,
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list customers', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list customers' },
    });
  }
});

// GET /:id — Single customer with invoice summary
const RESERVED = new Set(['stats']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const customer = await prisma.finCustomer.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        invoices: {
          where: { deletedAt: null } as any,
          orderBy: { issueDate: 'desc' },
          take: 10,
          select: {
            id: true,
            reference: true,
            issueDate: true,
            dueDate: true,
            status: true,
            total: true,
            amountDue: true,
          },
        },
        _count: { select: { invoices: true } },
      },
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    res.json({ success: true, data: customer });
  } catch (error: unknown) {
    logger.error('Failed to get customer', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get customer' },
    });
  }
});

// POST / — Create customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const authReq = req as AuthRequest;
    const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
    const code = generateCode(parsed.data.name, rand);

    const customer = await prisma.finCustomer.create({
      data: {
        code,
        ...parsed.data,
        creditLimit:
          parsed.data.creditLimit !== null ? new Prisma.Decimal(parsed.data.creditLimit) : null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Customer created', { customerId: customer.id, code });
    res.status(201).json({ success: true, data: customer });
  } catch (error: unknown) {
    logger.error('Failed to create customer', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as any).code === 'P2002'
    ) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Customer code must be unique' },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create customer' },
    });
  }
});

// PUT /:id — Update customer
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.finCustomer.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const _authReq = req as AuthRequest;
    const { creditLimit, ...rest } = parsed.data;

    const customer = await prisma.finCustomer.update({
      where: { id },
      data: {
        ...rest,
        ...(creditLimit !== undefined
          ? { creditLimit: creditLimit !== null ? new Prisma.Decimal(creditLimit) : null }
          : {}),
        updatedAt: new Date(),
      },
    });

    logger.info('Customer updated', { customerId: id });
    res.json({ success: true, data: customer });
  } catch (error: unknown) {
    logger.error('Failed to update customer', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update customer' },
    });
  }
});

// DELETE /:id — Soft delete customer
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.finCustomer.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const invoiceCount = await prisma.finInvoice.count({
      where: { customerId: id, deletedAt: null } as any,
    });
    if (invoiceCount > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `Cannot delete customer: ${invoiceCount} invoice(s) exist`,
        },
      });
    }

    const _authReq = req as AuthRequest;
    await prisma.finCustomer.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    logger.info('Customer soft-deleted', { customerId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete customer', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete customer' },
    });
  }
});

export default router;
