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

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  accountId: z.string().trim().uuid(),
  fiscalYear: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional().nullable(),
  quarter: z.number().int().min(1).max(4).optional().nullable(),
  budgetAmount: z.number().min(0),
  notes: z.string().trim().max(2000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  actualAmount: z.number().min(0).optional(),
});

// GET / — List budgets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { accountId, fiscalYear, month, quarter } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (accountId && typeof accountId === 'string') where.accountId = accountId;
    if (fiscalYear) {
      const n = parseInt(String(fiscalYear), 10);
      if (!isNaN(n)) where.fiscalYear = n;
    }
    if (month) {
      const n = parseInt(String(month), 10);
      if (!isNaN(n)) where.month = n;
    }
    if (quarter) {
      const n = parseInt(String(quarter), 10);
      if (!isNaN(n)) where.quarter = n;
    }

    const [budgets, total] = await Promise.all([
      prisma.finBudget.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ fiscalYear: 'desc' }, { month: 'asc' }],
        include: {
          account: { select: { id: true, code: true, name: true, type: true } },
        },
      }),
      prisma.finBudget.count({ where }),
    ]);

    res.json({
      success: true,
      data: budgets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list budgets', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list budgets' },
    });
  }
});

// GET /variance-report — Budget vs Actual variance report
router.get('/variance-report', async (req: Request, res: Response) => {
  try {
    const { fiscalYear } = req.query;

    if (!fiscalYear) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'fiscalYear query parameter is required' },
      });
    }

    const budgets = await prisma.finBudget.findMany({
      where: { deletedAt: null, fiscalYear: parseInt(String(fiscalYear), 10) },
      include: {
        account: { select: { id: true, code: true, name: true, type: true } },
      },
      orderBy: [{ account: { code: 'asc' } }, { month: 'asc' }],
      take: 1000,
    });

    const totalBudget = budgets.reduce((s, b) => s + Number(b.budgetAmount), 0);
    const totalActual = budgets.reduce((s, b) => s + Number(b.actualAmount), 0);
    const totalVariance = totalActual - totalBudget;
    const variancePct = totalBudget !== 0 ? (totalVariance / totalBudget) * 100 : 0;

    const rows = budgets.map((b) => ({
      ...b,
      variancePct:
        Number(b.budgetAmount) !== 0
          ? ((Number(b.actualAmount) - Number(b.budgetAmount)) / Number(b.budgetAmount)) * 100
          : 0,
    }));

    res.json({
      success: true,
      data: {
        fiscalYear: parseInt(String(fiscalYear), 10),
        rows,
        summary: { totalBudget, totalActual, totalVariance, variancePct },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate variance report', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate variance report' },
    });
  }
});

// GET /:id — Single budget
const RESERVED = new Set(['variance-report']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const budget = await prisma.finBudget.findFirst({
      where: { id, deletedAt: null },
      include: {
        account: { select: { id: true, code: true, name: true, type: true } },
      },
    });

    if (!budget) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    }

    res.json({ success: true, data: budget });
  } catch (error: unknown) {
    logger.error('Failed to get budget', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get budget' } });
  }
});

// POST / — Create budget entry
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

    const { accountId, fiscalYear, month, budgetAmount, name, notes, quarter } = parsed.data;
    const authReq = req as AuthRequest;

    const account = await prisma.finAccount.findFirst({
      where: { id: accountId, deletedAt: null },
    });
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    const budget = await prisma.finBudget.create({
      data: {
        name,
        accountId,
        fiscalYear,
        month: month ?? null,
        quarter: quarter ?? null,
        budgetAmount: new Prisma.Decimal(budgetAmount),
        actualAmount: new Prisma.Decimal(0),
        variance: new Prisma.Decimal(0),
        notes: notes ?? null,
        createdBy: authReq.user?.id || 'system',
      },
      include: {
        account: { select: { id: true, code: true, name: true, type: true } },
      },
    });

    logger.info('Budget created', { budgetId: budget.id });
    res.status(201).json({ success: true, data: budget });
  } catch (error: unknown) {
    logger.error('Failed to create budget', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Budget entry already exists for this account/year/month combination',
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create budget' },
    });
  }
});

// PUT /:id — Update budget
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

    const existing = await prisma.finBudget.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    }

    const { budgetAmount, actualAmount, ...rest } = parsed.data;

    const newBudget =
      budgetAmount !== undefined ? new Prisma.Decimal(budgetAmount) : existing.budgetAmount;
    const newActual =
      actualAmount !== undefined ? new Prisma.Decimal(actualAmount) : existing.actualAmount;
    const variance = new Prisma.Decimal(Number(newActual) - Number(newBudget));

    const budget = await prisma.finBudget.update({
      where: { id },
      data: {
        ...rest,
        ...(budgetAmount !== undefined ? { budgetAmount: new Prisma.Decimal(budgetAmount) } : {}),
        ...(actualAmount !== undefined ? { actualAmount: new Prisma.Decimal(actualAmount) } : {}),
        variance,
        updatedAt: new Date(),
      },
      include: {
        account: { select: { id: true, code: true, name: true, type: true } },
      },
    });

    logger.info('Budget updated', { budgetId: id });
    res.json({ success: true, data: budget });
  } catch (error: unknown) {
    logger.error('Failed to update budget', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update budget' },
    });
  }
});

// DELETE /:id — Soft delete budget
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.finBudget.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    }

    await prisma.finBudget.update({ where: { id }, data: { deletedAt: new Date() } });

    logger.info('Budget soft-deleted', { budgetId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete budget', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete budget' },
    });
  }
});

export default router;
