import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function generateSupplierCode(name: string, rand: number): string {
  const slug = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6).padEnd(3, 'X');
  return `SUPP-${slug}-${rand.toString().padStart(4, '0')}`;
}

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  contactPerson: z.string().max(100).optional().nullable(),
  addressLine1: z.string().max(200).optional().nullable(),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().length(2).default('GB'),
  taxNumber: z.string().max(50).optional().nullable(),
  currency: z.string().length(3).default('GBP'),
  paymentTerms: z.number().int().min(0).default(30),
  notes: z.string().max(2000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// GET / — List suppliers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, isActive, country } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
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

    const [suppliers, total] = await Promise.all([
      prisma.finSupplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { purchaseOrders: true, bills: true } },
        },
      }),
      prisma.finSupplier.count({ where }),
    ]);

    res.json({
      success: true,
      data: suppliers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list suppliers', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list suppliers' });
  }
});

// GET /:id — Single supplier with PO summary
const RESERVED = new Set(['stats']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const supplier = await prisma.finSupplier.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        purchaseOrders: {
          where: { deletedAt: null } as any,
          orderBy: { orderDate: 'desc' },
          take: 10,
          select: { id: true, reference: true, orderDate: true, expectedDate: true, status: true, total: true },
        },
        _count: { select: { purchaseOrders: true, bills: true } },
      },
    });

    if (!supplier) {
      return res.status(404).json({ success: false, error: 'Supplier not found' });
    }

    res.json({ success: true, data: supplier });
  } catch (error: unknown) {
    logger.error('Failed to get supplier', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get supplier' });
  }
});

// POST / — Create supplier
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
    const code = generateSupplierCode(parsed.data.name, rand);

    const supplier = await prisma.finSupplier.create({
      data: {
        code,
        ...parsed.data,
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Supplier created', { supplierId: supplier.id, code });
    res.status(201).json({ success: true, data: supplier });
  } catch (error: unknown) {
    logger.error('Failed to create supplier', { error: error instanceof Error ? error.message : 'Unknown error' });
    if (error != null && typeof error === 'object' && 'code' in error && (error as any).code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Supplier code must be unique' });
    }
    res.status(500).json({ success: false, error: 'Failed to create supplier' });
  }
});

// PUT /:id — Update supplier
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.finSupplier.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Supplier not found' });
    }

    const supplier = await prisma.finSupplier.update({
      where: { id },
      data: { ...parsed.data, updatedAt: new Date() },
    });

    logger.info('Supplier updated', { supplierId: id });
    res.json({ success: true, data: supplier });
  } catch (error: unknown) {
    logger.error('Failed to update supplier', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update supplier' });
  }
});

// DELETE /:id — Soft delete supplier
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.finSupplier.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Supplier not found' });
    }

    const poCount = await prisma.finPurchaseOrder.count({ where: { supplierId: id, deletedAt: null } as any });
    if (poCount > 0) {
      return res.status(409).json({ success: false, error: `Cannot delete supplier: ${poCount} purchase order(s) exist` });
    }

    await prisma.finSupplier.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    logger.info('Supplier soft-deleted', { supplierId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete supplier', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to delete supplier' });
  }
});

export default router;
