import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------
function generateCustomerCode(): string {
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `CUST-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const customerCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  contactName: z.string().max(200).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.record(z.any()),
  billingAddress: z.record(z.any()).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

const customerUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  contactName: z.string().max(200).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.record(z.any()).optional(),
  billingAddress: z.record(z.any()).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List customers
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { isActive, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.fsSvcCustomer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsSvcCustomer.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list customers', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list customers' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create customer
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = customerCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcCustomer.create({
      data: {
        ...parsed.data,
        code: generateCustomerCode(),
        address: parsed.data.address as any,
        billingAddress: parsed.data.billingAddress as any,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create customer', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create customer' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get customer by ID
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcCustomer.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: {
        sites: { where: { deletedAt: null } as any },
        contracts: { where: { deletedAt: null } as any },
      },
    });

    if (!data) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get customer', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get customer' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/sites — Get customer sites
// ---------------------------------------------------------------------------
router.get('/:id/sites', async (req: Request, res: Response) => {
  try {
    const customer = await prisma.fsSvcCustomer.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!customer) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const data = await prisma.fsSvcSite.findMany({
      where: { customerId: req.params.id, deletedAt: null } as any,
      orderBy: { createdAt: 'desc' },
      take: 1000});

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get customer sites', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get customer sites' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/jobs — Get customer jobs
// ---------------------------------------------------------------------------
router.get('/:id/jobs', async (req: Request, res: Response) => {
  try {
    const customer = await prisma.fsSvcCustomer.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!customer) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { customerId: req.params.id, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.fsSvcJob.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsSvcJob.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to get customer jobs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get customer jobs' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update customer
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcCustomer.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    const parsed = customerUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const data = await prisma.fsSvcCustomer.update({
      where: { id: req.params.id },
      data: { ...parsed.data, address: parsed.data.address as any, billingAddress: parsed.data.billingAddress as any },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update customer', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update customer' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete customer
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcCustomer.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
    }

    await prisma.fsSvcCustomer.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Customer deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete customer', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete customer' } });
  }
});

export default router;
