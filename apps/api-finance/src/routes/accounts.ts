import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-finance');
interface FinLineWithAccount {
  accountId: string;
  debit: unknown;
  credit: unknown;
  account: { id: string; code: string; name: string; type: string; normalBalance: string };
}

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
  return `FIN-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const accountCreateSchema = z.object({
  code: z.string().trim().min(1).max(20),
  name: z.string().trim().min(1).max(200),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  normalBalance: z.enum(['DEBIT', 'CREDIT']),
  parentId: z.string().trim().uuid().optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  currency: z.string().trim().length(3).default('USD'),
  taxRateId: z.string().trim().uuid().optional().nullable(),
  openingBalance: z.number().optional().default(0),
});

const accountUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  currency: z.string().trim().length(3).optional(),
  taxRateId: z.string().trim().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
  parentId: z.string().trim().uuid().optional().nullable(),
});

const journalLineSchema = z.object({
  accountId: z.string().trim().uuid(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  description: z.string().trim().max(500).optional().nullable(),
});

const journalEntryCreateSchema = z.object({
  date: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    ),
  periodId: z.string().trim().uuid(),
  description: z.string().trim().min(1).max(1000),
  memo: z.string().trim().max(2000).optional().nullable(),
  source: z.string().trim().max(100).optional().nullable(),
  sourceId: z.string().trim().uuid().optional().nullable(),
  lines: z.array(journalLineSchema).min(2),
});

const journalEntryUpdateSchema = z.object({
  date: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    )
    .optional(),
  description: z.string().trim().min(1).max(1000).optional(),
  memo: z.string().trim().max(2000).optional().nullable(),
  lines: z.array(journalLineSchema).min(2).optional(),
});

const periodCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  startDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    ),
  endDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    ),
  fiscalYear: z.number().int().min(2000).max(2100),
  quarter: z.number().int().min(1).max(4).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function buildAccountTree(accounts: Record<string, unknown>[]): Record<string, unknown>[] {
  const map = new Map<string, Record<string, unknown>>();
  const roots: Record<string, unknown>[] = [];

  for (const acc of accounts) {
    map.set(acc.id as string, { ...acc, children: [] });
  }

  for (const acc of accounts) {
    const node = map.get(acc.id as string)!;
    if (acc.parentId && map.has(acc.parentId as string)) {
      (map.get(acc.parentId as string)!.children as Record<string, unknown>[]).push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ===================================================================
// CHART OF ACCOUNTS
// ===================================================================

// GET / — List accounts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, isActive, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (type && typeof type === 'string') {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [accounts, total] = await Promise.all([
      prisma.finAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
        include: {
          parent: { select: { id: true, code: true, name: true } },
          _count: { select: { children: true, journalLines: true } },
        },
      }),
      prisma.finAccount.count({ where }),
    ]);

    res.json({
      success: true,
      data: accounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list accounts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list accounts' },
    });
  }
});

// GET /tree — Hierarchical tree
router.get('/tree', async (_req: Request, res: Response) => {
  try {
    const accounts = await prisma.finAccount.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
      include: {
        _count: { select: { journalLines: true } },
      },
      take: 1000,
    });

    const tree = buildAccountTree(accounts);
    res.json({ success: true, data: tree });
  } catch (error: unknown) {
    logger.error('Failed to build account tree', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to build account tree' },
    });
  }
});

// GET /trial-balance — Trial balance for a period
router.get('/trial-balance', async (req: Request, res: Response) => {
  try {
    const { periodId } = req.query;

    if (!periodId || typeof periodId !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'periodId query parameter is required' },
      });
    }

    const period = await prisma.finPeriod.findUnique({ where: { id: periodId } });
    if (!period) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Period not found' } });
    }

    const lines = await prisma.finJournalLine.findMany({
      where: {
        journalEntry: {
          status: 'POSTED',
          periodId,
        },
      },
      include: {
        account: { select: { id: true, code: true, name: true, type: true, normalBalance: true } },
      },
      take: 1000,
    });

    const balances = new Map<
      string,
      { account: Record<string, unknown>; totalDebit: number; totalCredit: number }
    >();

    for (const line of lines) {
      const key = line.accountId;
      if (!balances.has(key)) {
        balances.set(key, { account: (line as FinLineWithAccount).account, totalDebit: 0, totalCredit: 0 });
      }
      const entry = balances.get(key)!;
      entry.totalDebit += Number(line.debit);
      entry.totalCredit += Number(line.credit);
    }

    const rows = Array.from(balances.values()).map((b) => ({
      ...b.account,
      totalDebit: b.totalDebit,
      totalCredit: b.totalCredit,
      balance: b.totalDebit - b.totalCredit,
    }));

    rows.sort((a, b) => (a as { code: string }).code.localeCompare((b as { code: string }).code));

    const totalDebits = rows.reduce((s, r) => s + r.totalDebit, 0);
    const totalCredits = rows.reduce((s, r) => s + r.totalCredit, 0);

    res.json({
      success: true,
      data: {
        period,
        rows,
        totals: {
          totalDebits,
          totalCredits,
          difference: totalDebits - totalCredits,
          isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate trial balance', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate trial balance' },
    });
  }
});

// GET /profit-loss — P&L report for date range
router.get('/profit-loss', async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'dateFrom and dateTo query parameters are required',
        },
      });
    }

    const fromDate = new Date(String(dateFrom));
    const toDate = new Date(String(dateTo));

    const lines = await prisma.finJournalLine.findMany({
      where: {
        journalEntry: {
          status: 'POSTED',
          date: { gte: fromDate, lte: toDate },
        },
        account: {
          type: { in: ['REVENUE', 'EXPENSE'] },
          deletedAt: null,
        },
      },
      include: {
        account: { select: { id: true, code: true, name: true, type: true, normalBalance: true } },
      },
      take: 1000,
    });

    const revenue: Record<string, { account: Record<string, unknown>; amount: number }> = {};
    const expenses: Record<string, { account: Record<string, unknown>; amount: number }> = {};

    for (const line of lines) {
      const target = (line as FinLineWithAccount).account.type === 'REVENUE' ? revenue : expenses;
      if (!target[line.accountId]) {
        target[line.accountId] = { account: (line as FinLineWithAccount).account, amount: 0 };
      }
      // Revenue: credits increase, debits decrease
      // Expenses: debits increase, credits decrease
      if ((line as FinLineWithAccount).account.type === 'REVENUE') {
        target[line.accountId].amount += Number(line.credit) - Number(line.debit);
      } else {
        target[line.accountId].amount += Number(line.debit) - Number(line.credit);
      }
    }

    const revenueItems = Object.values(revenue).sort((a, b) =>
      (a as { account: { code: string } }).account.code.localeCompare((b as { account: { code: string } }).account.code)
    );
    const expenseItems = Object.values(expenses).sort((a, b) =>
      (a as { account: { code: string } }).account.code.localeCompare((b as { account: { code: string } }).account.code)
    );

    const totalRevenue = revenueItems.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenseItems.reduce((s, r) => s + r.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    res.json({
      success: true,
      data: {
        dateFrom: fromDate.toISOString(),
        dateTo: toDate.toISOString(),
        revenue: revenueItems,
        expenses: expenseItems,
        totals: { totalRevenue, totalExpenses, netIncome },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate P&L report', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate profit & loss report' },
    });
  }
});

// GET /balance-sheet — Balance Sheet at a given date
router.get('/balance-sheet', async (req: Request, res: Response) => {
  try {
    const { asOf } = req.query;
    const asOfDate = asOf ? new Date(String(asOf)) : new Date();

    const lines = await prisma.finJournalLine.findMany({
      where: {
        journalEntry: {
          status: 'POSTED',
          date: { lte: asOfDate },
        },
        account: {
          type: { in: ['ASSET', 'LIABILITY', 'EQUITY'] },
          deletedAt: null,
        },
      },
      include: {
        account: { select: { id: true, code: true, name: true, type: true, normalBalance: true } },
      },
      take: 1000,
    });

    const groups: Record<
      string,
      Record<string, { account: Record<string, unknown>; balance: number }>
    > = {
      ASSET: {},
      LIABILITY: {},
      EQUITY: {},
    };

    for (const line of lines) {
      const group = groups[(line as FinLineWithAccount).account.type];
      if (!group[line.accountId]) {
        group[line.accountId] = { account: (line as FinLineWithAccount).account, balance: 0 };
      }
      // Assets: normal debit — debits increase, credits decrease
      // Liabilities/Equity: normal credit — credits increase, debits decrease
      if ((line as FinLineWithAccount).account.normalBalance === 'DEBIT') {
        group[line.accountId].balance += Number(line.debit) - Number(line.credit);
      } else {
        group[line.accountId].balance += Number(line.credit) - Number(line.debit);
      }
    }

    // Include opening balances
    const accounts = await prisma.finAccount.findMany({
      where: { type: { in: ['ASSET', 'LIABILITY', 'EQUITY'] }, deletedAt: null },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        normalBalance: true,
        openingBalance: true,
      },
      take: 1000,
    });

    for (const acc of accounts) {
      const group = groups[acc.type];
      if (!group[acc.id]) {
        group[acc.id] = { account: acc, balance: 0 };
      }
      group[acc.id].balance += Number(acc.openingBalance || 0);
    }

    const toList = (g: Record<string, { account: Record<string, unknown>; balance: number }>) =>
      Object.values(g)
        .filter((v) => Math.abs(v.balance) >= 0.01)
        .sort((a, b) => (a as { account: { code: string } }).account.code.localeCompare((b as { account: { code: string } }).account.code));

    const assets = toList(groups.ASSET);
    const liabilities = toList(groups.LIABILITY);
    const equity = toList(groups.EQUITY);

    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
    const totalEquity = equity.reduce((s, e) => s + e.balance, 0);

    res.json({
      success: true,
      data: {
        asOf: asOfDate.toISOString(),
        assets,
        liabilities,
        equity,
        totals: {
          totalAssets,
          totalLiabilities,
          totalEquity,
          liabilitiesPlusEquity: totalLiabilities + totalEquity,
          isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate balance sheet', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate balance sheet' },
    });
  }
});

// GET /cash-flow — Cash flow summary
router.get('/cash-flow', async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    if (!dateFrom || !dateTo) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'dateFrom and dateTo query parameters are required',
        },
      });
    }

    const fromDate = new Date(String(dateFrom));
    const toDate = new Date(String(dateTo));

    // Cash flow grouped by account type
    const lines = await prisma.finJournalLine.findMany({
      where: {
        journalEntry: {
          status: 'POSTED',
          date: { gte: fromDate, lte: toDate },
        },
        account: { deletedAt: null },
      },
      include: {
        account: { select: { id: true, code: true, name: true, type: true, normalBalance: true } },
      },
      take: 1000,
    });

    // Categorize into operating, investing, financing
    const operating: { inflows: number; outflows: number } = { inflows: 0, outflows: 0 };
    const investing: { inflows: number; outflows: number } = { inflows: 0, outflows: 0 };
    const financing: { inflows: number; outflows: number } = { inflows: 0, outflows: 0 };

    for (const line of lines) {
      const debit = Number(line.debit);
      const credit = Number(line.credit);

      switch ((line as FinLineWithAccount).account.type) {
        case 'REVENUE':
        case 'EXPENSE':
          operating.inflows += credit;
          operating.outflows += debit;
          break;
        case 'ASSET':
          investing.outflows += debit;
          investing.inflows += credit;
          break;
        case 'LIABILITY':
        case 'EQUITY':
          financing.inflows += credit;
          financing.outflows += debit;
          break;
      }
    }

    const operatingNet = operating.inflows - operating.outflows;
    const investingNet = investing.inflows - investing.outflows;
    const financingNet = financing.inflows - financing.outflows;

    res.json({
      success: true,
      data: {
        dateFrom: fromDate.toISOString(),
        dateTo: toDate.toISOString(),
        operating: { ...operating, net: operatingNet },
        investing: { ...investing, net: investingNet },
        financing: { ...financing, net: financingNet },
        netCashFlow: operatingNet + investingNet + financingNet,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate cash flow', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate cash flow report' },
    });
  }
});

// GET /periods — List accounting periods
router.get('/periods', async (req: Request, res: Response) => {
  try {
    const { fiscalYear, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (fiscalYear) {
      const n = parseInt(String(fiscalYear), 10);
      if (!isNaN(n)) where.fiscalYear = n;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [periods, total] = await Promise.all([
      prisma.finPeriod.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          _count: { select: { journalEntries: true } },
        },
      }),
      prisma.finPeriod.count({ where }),
    ]);

    res.json({
      success: true,
      data: periods,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list periods', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list periods' },
    });
  }
});

// POST /periods — Create accounting period
router.post('/periods', async (req: Request, res: Response) => {
  try {
    const parsed = periodCreateSchema.safeParse(req.body);
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

    const { name, startDate, endDate, fiscalYear, quarter } = parsed.data;
    const authReq = req as AuthRequest;

    // Check for overlapping periods
    const overlap = await prisma.finPeriod.findFirst({
      where: {
        OR: [{ startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }],
      },
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `Period overlaps with existing period: ${overlap.name}`,
        },
      });
    }

    const period = await prisma.finPeriod.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        fiscalYear,
        quarter: quarter ?? null,
        status: 'OPEN',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Accounting period created', { periodId: period.id, name });
    res.status(201).json({ success: true, data: period });
  } catch (error: unknown) {
    logger.error('Failed to create period', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create period' },
    });
  }
});

// PUT /periods/:id/close — Close an accounting period
router.put('/periods/:id/close', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const period = await prisma.finPeriod.findUnique({ where: { id } });
    if (!period) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Period not found' } });
    }
    if (period.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Period is already closed' },
      });
    }

    // Reject if unposted entries exist
    const unpostedCount = await prisma.finJournalEntry.count({
      where: { periodId: id, status: 'DRAFT' },
    });

    if (unpostedCount > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Cannot close period: ${unpostedCount} unposted journal entries exist`,
        },
      });
    }

    const authReq = req as AuthRequest;
    const updated = await prisma.finPeriod.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Accounting period closed', { periodId: id });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to close period', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to close period' },
    });
  }
});

// GET /:id — Single account (skip known sub-paths to avoid clashing with /entries, /tree, etc.)
const RESERVED_PATHS = new Set([
  'entries',
  'tree',
  'trial-balance',
  'profit-loss',
  'balance-sheet',
  'cash-flow',
  'periods',
  'gl-report',
]);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const account = await prisma.finAccount.findFirst({
      where: { id, deletedAt: null },
      include: {
        parent: { select: { id: true, code: true, name: true, type: true } },
        children: {
          where: { deletedAt: null },
          select: { id: true, code: true, name: true, type: true, isActive: true },
          orderBy: { code: 'asc' },
        },
      },
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    res.json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Failed to get account', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get account' },
    });
  }
});

// POST / — Create account
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = accountCreateSchema.safeParse(req.body);
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

    const {
      code,
      name,
      type,
      normalBalance,
      parentId,
      description,
      currency,
      taxRateId,
      openingBalance,
    } = parsed.data;
    const authReq = req as AuthRequest;

    // Check duplicate code
    const existing = await prisma.finAccount.findFirst({ where: { code, deletedAt: null } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `Account with code '${code}' already exists` },
      });
    }

    // Validate parent exists if provided
    if (parentId) {
      const parent = await prisma.finAccount.findFirst({
        where: { id: parentId, deletedAt: null },
      });
      if (!parent) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Parent account not found' },
        });
      }
    }

    const account = await prisma.finAccount.create({
      data: {
        code,
        name,
        type,
        normalBalance,
        parentId: parentId ?? null,
        description: description ?? null,
        currency: currency || 'USD',
        taxRateId: taxRateId ?? null,
        openingBalance: openingBalance ? new Prisma.Decimal(openingBalance) : new Prisma.Decimal(0),
        isActive: true,
        createdBy: authReq.user?.id || 'system',
      },
      include: {
        parent: { select: { id: true, code: true, name: true } },
      },
    });

    logger.info('Account created', { accountId: account.id, code });
    res.status(201).json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Failed to create account', {
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
        error: { code: 'CONFLICT', message: 'Account code must be unique' },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create account' },
    });
  }
});

// PUT /:id — Update account
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = accountUpdateSchema.safeParse(req.body);
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

    const existing = await prisma.finAccount.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    // Prevent circular parent references
    if (parsed.data.parentId) {
      if (parsed.data.parentId === id) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_STATE', message: 'Account cannot be its own parent' },
        });
      }
      const parent = await prisma.finAccount.findFirst({
        where: { id: parsed.data.parentId, deletedAt: null },
      });
      if (!parent) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Parent account not found' },
        });
      }
    }

    const authReq = req as AuthRequest;
    const account = await prisma.finAccount.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
      include: {
        parent: { select: { id: true, code: true, name: true } },
      },
    });

    logger.info('Account updated', { accountId: id });
    res.json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Failed to update account', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update account' },
    });
  }
});

// DELETE /:id — Soft delete account
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const account = await prisma.finAccount.findFirst({ where: { id, deletedAt: null } });
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    // Reject if account has journal lines
    const lineCount = await prisma.finJournalLine.count({ where: { accountId: id } });
    if (lineCount > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Cannot delete account: ${lineCount} journal line(s) reference this account`,
        },
      });
    }

    const authReq = req as AuthRequest;
    await prisma.finAccount.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: authReq.user?.id || 'system',
        isActive: false,
      },
    });

    logger.info('Account soft-deleted', { accountId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete account', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete account' },
    });
  }
});

// ===================================================================
// JOURNAL ENTRIES
// ===================================================================

// GET /entries — List journal entries
router.get('/entries', async (req: Request, res: Response) => {
  try {
    const { status, periodId, dateFrom, dateTo } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (periodId && typeof periodId === 'string') {
      where.periodId = periodId;
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(String(dateFrom));
      if (dateTo) where.date.lte = new Date(String(dateTo));
    }

    const [entries, total] = await Promise.all([
      prisma.finJournalEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          lines: {
            include: {
              account: { select: { id: true, code: true, name: true, type: true } },
            },
            orderBy: { lineNumber: 'asc' as const },
          },
          period: { select: { id: true, name: true, status: true } },
        },
      }),
      prisma.finJournalEntry.count({ where }),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list journal entries', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list journal entries' },
    });
  }
});

// GET /entries/:id — Single journal entry
router.get('/entries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entry = await prisma.finJournalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: {
              select: { id: true, code: true, name: true, type: true, normalBalance: true },
            },
          },
          orderBy: { lineNumber: 'asc' as const },
        },
        period: true,
      },
    });

    if (!entry) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } });
    }

    res.json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to get journal entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get journal entry' },
    });
  }
});

// POST /entries — Create journal entry with lines
router.post('/entries', async (req: Request, res: Response) => {
  try {
    const parsed = journalEntryCreateSchema.safeParse(req.body);
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

    const { date, periodId, description, memo, source, sourceId, lines } = parsed.data;
    const authReq = req as AuthRequest;

    // Each line must have either a debit or credit, not both
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].debit > 0 && lines[i].credit > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: `Line ${i + 1}: a line cannot have both debit and credit amounts`,
          },
        });
      }
      if (lines[i].debit === 0 && lines[i].credit === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: `Line ${i + 1}: a line must have either a debit or credit amount`,
          },
        });
      }
    }

    // Validate double-entry: sum(debits) === sum(credits)
    const totalDebits = lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredits = lines.reduce((sum, l) => sum + l.credit, 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Debits (${totalDebits.toFixed(2)}) must equal credits (${totalCredits.toFixed(2)})`,
        },
      });
    }

    // Validate period exists and is OPEN
    const period = await prisma.finPeriod.findUnique({ where: { id: periodId } });
    if (!period) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Accounting period not found' },
      });
    }
    if (period.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: `Cannot post to a ${period.status} period` },
      });
    }

    // Validate all account IDs exist
    const accountIds = [...new Set(lines.map((l) => l.accountId))];
    const accounts = await prisma.finAccount.findMany({
      where: { id: { in: accountIds }, deletedAt: null, isActive: true },
      select: { id: true },
      take: 1000,
    });
    const foundIds = new Set(accounts.map((a) => a.id));
    const missing = accountIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Invalid or inactive account(s): ${missing.join(', ')}`,
        },
      });
    }

    const reference = generateReference('JE');

    const entry = await prisma.finJournalEntry.create({
      data: {
        reference,
        date: new Date(date),
        periodId,
        description,
        memo: memo ?? null,
        source: source ?? null,
        sourceId: sourceId ?? null,
        status: 'DRAFT',
        totalDebit: new Prisma.Decimal(totalDebits),
        totalCredit: new Prisma.Decimal(totalCredits),
        createdBy: authReq.user?.id || 'system',
        lines: {
          create: lines.map((line, idx) => ({
            lineNumber: idx + 1,
            accountId: line.accountId,
            debit: new Prisma.Decimal(line.debit),
            credit: new Prisma.Decimal(line.credit),
            description: line.description ?? null,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: { select: { id: true, code: true, name: true, type: true } },
          },
          orderBy: { lineNumber: 'asc' as const },
        },
        period: { select: { id: true, name: true } },
      },
    });

    logger.info('Journal entry created', { entryId: entry.id, reference });
    res.status(201).json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to create journal entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create journal entry' },
    });
  }
});

// PUT /entries/:id — Update draft journal entry
router.put('/entries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = journalEntryUpdateSchema.safeParse(req.body);
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

    const existing = await prisma.finJournalEntry.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } });
    }
    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Only DRAFT entries can be updated' },
      });
    }

    const { date, description, memo, lines } = parsed.data;
    const authReq = req as AuthRequest;

    // If lines are being replaced, validate double-entry
    if (lines) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].debit > 0 && lines[i].credit > 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: `Line ${i + 1}: a line cannot have both debit and credit amounts`,
            },
          });
        }
        if (lines[i].debit === 0 && lines[i].credit === 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: `Line ${i + 1}: a line must have either a debit or credit amount`,
            },
          });
        }
      }

      const totalDebits = lines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredits = lines.reduce((sum, l) => sum + l.credit, 0);

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: `Debits (${totalDebits.toFixed(2)}) must equal credits (${totalCredits.toFixed(2)})`,
          },
        });
      }

      // Validate account IDs
      const accountIds = [...new Set(lines.map((l) => l.accountId))];
      const accounts = await prisma.finAccount.findMany({
        where: { id: { in: accountIds }, deletedAt: null, isActive: true },
        select: { id: true },
        take: 1000,
      });
      const foundIds = new Set(accounts.map((a) => a.id));
      const missing = accountIds.filter((aid) => !foundIds.has(aid));
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: `Invalid or inactive account(s): ${missing.join(', ')}`,
          },
        });
      }

      // Replace lines in a transaction
      const entry = await prisma.$transaction(async (tx) => {
        await tx.finJournalLine.deleteMany({ where: { journalEntryId: id } });

        return tx.finJournalEntry.update({
          where: { id },
          data: {
            ...(date && { date: new Date(date) }),
            ...(description && { description }),
            ...(memo !== undefined && { memo }),
            totalDebit: new Prisma.Decimal(totalDebits),
            totalCredit: new Prisma.Decimal(totalCredits),
            updatedBy: authReq.user?.id || 'system',
            updatedAt: new Date(),
            lines: {
              create: lines.map((line, idx) => ({
                lineNumber: idx + 1,
                accountId: line.accountId,
                debit: new Prisma.Decimal(line.debit),
                credit: new Prisma.Decimal(line.credit),
                description: line.description ?? null,
              })),
            },
          },
          include: {
            lines: {
              include: {
                account: { select: { id: true, code: true, name: true, type: true } },
              },
              orderBy: { lineNumber: 'asc' as const },
            },
          },
        });
      });

      logger.info('Journal entry updated with new lines', { entryId: id });
      return res.json({ success: true, data: entry });
    }

    // Update header only (no line changes)
    const entry = await prisma.finJournalEntry.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(description && { description }),
        ...(memo !== undefined && { memo }),
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
      include: {
        lines: {
          include: {
            account: { select: { id: true, code: true, name: true, type: true } },
          },
          orderBy: { lineNumber: 'asc' as const },
        },
      },
    });

    logger.info('Journal entry updated', { entryId: id });
    res.json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to update journal entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update journal entry' },
    });
  }
});

// POST /entries/:id/post — Post a draft entry
router.post('/entries/:id/post', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entry = await prisma.finJournalEntry.findUnique({
      where: { id },
      include: { period: true },
    });

    if (!entry) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } });
    }
    if (entry.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: `Entry is already ${entry.status}` },
      });
    }
    if (entry.period.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `Cannot post to a ${entry.period.status} period`,
        },
      });
    }

    const authReq = req as AuthRequest;
    const updated = await prisma.finJournalEntry.update({
      where: { id },
      data: {
        status: 'POSTED',
        postedAt: new Date(),
        postedBy: authReq.user?.id || 'system',
      },
      include: {
        lines: {
          include: {
            account: { select: { id: true, code: true, name: true, type: true } },
          },
          orderBy: { lineNumber: 'asc' as const },
        },
        period: { select: { id: true, name: true } },
      },
    });

    logger.info('Journal entry posted', { entryId: id, reference: entry.reference });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to post journal entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to post journal entry' },
    });
  }
});

// POST /entries/:id/reverse — Reverse a posted entry
router.post('/entries/:id/reverse', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const original = await prisma.finJournalEntry.findUnique({
      where: { id },
      include: {
        lines: true,
        period: true,
      },
    });

    if (!original) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } });
    }
    if (original.status !== 'POSTED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Only POSTED entries can be reversed' },
      });
    }
    if (original.period.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `Cannot reverse: period is ${original.period.status}`,
        },
      });
    }

    const authReq = req as AuthRequest;
    const reversalRef = generateReference('JE');

    // Create reversal entry: swap debits and credits
    const reversal = await prisma.finJournalEntry.create({
      data: {
        reference: reversalRef,
        date: new Date(),
        periodId: original.periodId,
        description: `Reversal of ${original.reference}: ${original.description}`,
        memo: `Reversal of journal entry ${original.reference}`,
        source: 'REVERSAL',
        sourceId: original.id,
        status: 'POSTED',
        postedAt: new Date(),
        postedBy: authReq.user?.id || 'system',
        totalDebit: (original as Record<string, unknown>).totalCredit,
        totalCredit: (original as Record<string, unknown>).totalDebit,
        createdBy: authReq.user?.id || 'system',
        lines: {
          create: original.lines.map((line, idx) => ({
            lineNumber: idx + 1,
            accountId: line.accountId,
            debit: line.credit, // Swap: original credit becomes reversal debit
            credit: line.debit, // Swap: original debit becomes reversal credit
            description: `Reversal: ${line.description || ''}`.trim(),
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: { select: { id: true, code: true, name: true, type: true } },
          },
          orderBy: { lineNumber: 'asc' as const },
        },
        period: { select: { id: true, name: true } },
      },
    });

    // Mark original as reversed
    await prisma.finJournalEntry.update({
      where: { id },
      data: { status: 'REVERSED', reversedBy: reversal.id },
    });

    logger.info('Journal entry reversed', { originalId: id, reversalId: reversal.id, reversalRef });
    res.status(201).json({ success: true, data: reversal });
  } catch (error: unknown) {
    logger.error('Failed to reverse journal entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reverse journal entry' },
    });
  }
});

export default router;
