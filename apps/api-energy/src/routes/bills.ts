import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-energy');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ENR-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const billCreateSchema = z.object({
  meterId: z.string().uuid().optional().nullable(),
  provider: z.string().min(1).max(200),
  accountNumber: z.string().max(100).optional().nullable(),
  invoiceNumber: z.string().max(100).optional().nullable(),
  periodStart: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  periodEnd: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  consumption: z.number().min(0),
  unit: z.string().min(1).max(50),
  cost: z.number().min(0),
  currency: z.string().length(3).optional().default('GBP'),
});

const billUpdateSchema = z.object({
  meterId: z.string().uuid().optional().nullable(),
  provider: z.string().min(1).max(200).optional(),
  accountNumber: z.string().max(100).optional().nullable(),
  invoiceNumber: z.string().max(100).optional().nullable(),
  periodStart: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  periodEnd: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  consumption: z.number().min(0).optional(),
  unit: z.string().min(1).max(50).optional(),
  cost: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  status: z.enum(['PENDING', 'VERIFIED', 'DISPUTED', 'PAID']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// GET /summary — Bill cost summary by period
// ---------------------------------------------------------------------------

router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { meterId, dateFrom, dateTo } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (meterId && typeof meterId === 'string') {
      where.meterId = meterId;
    }
    if (dateFrom || dateTo) {
      const periodFilter: Record<string, Date> = {};
      if (dateFrom) periodFilter.gte = new Date(String(dateFrom));
      if (dateTo) periodFilter.lte = new Date(String(dateTo));
      where.periodStart = periodFilter;
    }

    const result = await prisma.energyBill.aggregate({
      where,
      _sum: { cost: true, consumption: true },
      _avg: { cost: true },
      _count: true,
    });

    // Group by provider
    const bills = await prisma.energyBill.findMany({
      where,
      select: { provider: true, cost: true, consumption: true },
    });

    const byProvider: Record<string, { totalCost: number; totalConsumption: number; count: number }> = {};
    for (const b of bills) {
      if (!byProvider[b.provider]) {
        byProvider[b.provider] = { totalCost: 0, totalConsumption: 0, count: 0 };
      }
      byProvider[b.provider].totalCost += Number(b.cost);
      byProvider[b.provider].totalConsumption += Number(b.consumption);
      byProvider[b.provider].count++;
    }

    res.json({
      success: true,
      data: {
        totalCost: Number(result._sum.cost || 0),
        totalConsumption: Number(result._sum.consumption || 0),
        averageCost: Number(result._avg.cost || 0),
        billCount: (result as any)._count,
        byProvider: Object.entries(byProvider).map(([provider, data]) => ({
          provider,
          ...data,
        })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get bill summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get bill summary' } });
  }
});

// ---------------------------------------------------------------------------
// GET / — List bills
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { meterId, status, dateFrom, dateTo } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (meterId && typeof meterId === 'string') {
      where.meterId = meterId;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (dateFrom || dateTo) {
      const periodFilter: Record<string, Date> = {};
      if (dateFrom) periodFilter.gte = new Date(String(dateFrom));
      if (dateTo) periodFilter.lte = new Date(String(dateTo));
      where.periodStart = periodFilter;
    }

    const [bills, total] = await Promise.all([
      prisma.energyBill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { periodStart: 'desc' },
        include: {
          meter: { select: { id: true, name: true, code: true, type: true } },
        },
      }),
      prisma.energyBill.count({ where }),
    ]);

    res.json({
      success: true,
      data: bills,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list bills', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list bills' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create bill
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = billCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    // Validate meter if provided
    if (data.meterId) {
      const meter = await prisma.energyMeter.findFirst({ where: { id: data.meterId, deletedAt: null } as any });
      if (!meter) {
        return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Meter not found' } });
      }
    }

    const bill = await prisma.energyBill.create({
      data: {
        meterId: data.meterId ?? null,
        provider: data.provider,
        accountNumber: data.accountNumber ?? null,
        invoiceNumber: data.invoiceNumber ?? null,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        consumption: new Prisma.Decimal(data.consumption),
        unit: data.unit,
        cost: new Prisma.Decimal(data.cost),
        currency: data.currency,
        status: 'PENDING',
        createdBy: authReq.user?.id || 'system',
      },
      include: {
        meter: { select: { id: true, name: true, code: true } },
      },
    });

    logger.info('Bill created', { billId: bill.id });
    res.status(201).json({ success: true, data: bill });
  } catch (error: unknown) {
    logger.error('Failed to create bill', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create bill' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get bill
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['summary']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const bill = await prisma.energyBill.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        meter: { select: { id: true, name: true, code: true, type: true } },
      },
    });

    if (!bill) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Bill not found' } });
    }

    res.json({ success: true, data: bill });
  } catch (error: unknown) {
    logger.error('Failed to get bill', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get bill' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update bill
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = billUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.energyBill.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Bill not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.consumption !== undefined) {
      updateData.consumption = new Prisma.Decimal(updateData.consumption as any);
    }
    if (updateData.cost !== undefined) {
      updateData.cost = new Prisma.Decimal(updateData.cost as any);
    }
    if (updateData.periodStart) {
      updateData.periodStart = new Date(updateData.periodStart as string);
    }
    if (updateData.periodEnd) {
      updateData.periodEnd = new Date(updateData.periodEnd as string);
    }

    const bill = await prisma.energyBill.update({
      where: { id },
      data: updateData,
    });

    logger.info('Bill updated', { billId: id });
    res.json({ success: true, data: bill });
  } catch (error: unknown) {
    logger.error('Failed to update bill', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update bill' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete bill
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyBill.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Bill not found' } });
    }

    await prisma.energyBill.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Bill soft-deleted', { billId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete bill', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete bill' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/verify — Verify bill
// ---------------------------------------------------------------------------

router.put('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyBill.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Bill not found' } });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Only PENDING bills can be verified' } });
    }

    const bill = await prisma.energyBill.update({
      where: { id },
      data: { status: 'VERIFIED' },
    });

    logger.info('Bill verified', { billId: id });
    res.json({ success: true, data: bill });
  } catch (error: unknown) {
    logger.error('Failed to verify bill', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to verify bill' } });
  }
});

export default router;
