import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Validation schemas
const createBudgetSchema = z.object({
  name: z.string().trim().min(1).max(200),
  accountId: z.string().trim().uuid(),
  fiscalYear: z.number().int().min(2020).max(2099),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  budgetAmount: z.number().nonnegative(),
  notes: z.string().trim().optional(),
});

// ============================================
// DASHBOARD KPIs
// ============================================

// GET /api/reports/dashboard - Dashboard KPIs
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Revenue (sum of paid invoices this month)
    const revenueResult = await prisma.finInvoice.aggregate({
      where: {
        status: { in: ['PAID', 'PARTIALLY_PAID'] },
        paidAt: { gte: startOfMonth, lte: endOfMonth },
        deletedAt: null,
      },
      _sum: { amountPaid: true },
    });

    // Expenses (sum of paid bills this month)
    const expenseResult = await prisma.finBill.aggregate({
      where: {
        status: { in: ['PAID', 'PARTIALLY_PAID'] },
        deletedAt: null,
        billDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amountPaid: true },
    });

    // Accounts Receivable (total outstanding invoices)
    const arResult = await prisma.finInvoice.aggregate({
      where: {
        status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] },
        deletedAt: null,
      },
      _sum: { amountDue: true },
    });

    // Accounts Payable (total outstanding bills)
    const apResult = await prisma.finBill.aggregate({
      where: {
        status: { in: ['RECEIVED', 'PARTIALLY_PAID', 'OVERDUE'] },
        deletedAt: null,
      },
      _sum: { amountDue: true },
    });

    // Cash position (sum of all bank account balances)
    const cashResult = await prisma.finBankAccount.aggregate({
      where: { isActive: true, deletedAt: null } as any,
      _sum: { currentBalance: true },
    });

    // Overdue invoices count
    const overdueInvoices = await prisma.finInvoice.count({
      where: {
        status: { in: ['SENT', 'PARTIALLY_PAID'] },
        dueDate: { lt: now },
        deletedAt: null,
      },
    });

    // Overdue bills count
    const overdueBills = await prisma.finBill.count({
      where: {
        status: { in: ['RECEIVED', 'PARTIALLY_PAID'] },
        dueDate: { lt: now },
        deletedAt: null,
      },
    });

    const revenue = Number(revenueResult._sum.amountPaid || 0);
    const expenses = Number(expenseResult._sum.amountPaid || 0);

    res.json({
      success: true,
      data: {
        revenue,
        expenses,
        profit: revenue - expenses,
        cashPosition: Number(cashResult._sum.currentBalance || 0),
        accountsReceivable: Number(arResult._sum.amountDue || 0),
        accountsPayable: Number(apResult._sum.amountDue || 0),
        overdueInvoices,
        overdueBills,
        period: {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString(),
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Error generating dashboard KPIs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate dashboard' },
    });
  }
});

// ============================================
// BUDGET vs ACTUAL
// ============================================

// GET /api/reports/budgets - List budgets
router.get('/budgets', async (req: Request, res: Response) => {
  try {
    const { fiscalYear, accountId, page = '1', limit = '50' } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 50), 200);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (fiscalYear) {
      const n = parseInt(fiscalYear as string, 10);
      if (!isNaN(n)) where.fiscalYear = n;
    }
    if (accountId) where.accountId = accountId;

    const [budgets, total] = await Promise.all([
      prisma.finBudget.findMany({
        where,
        include: { account: { select: { id: true, code: true, name: true, type: true } } },
        orderBy: [{ fiscalYear: 'desc' }, { month: 'asc' }],
        skip,
        take: limitNum,
      }),
      prisma.finBudget.count({ where }),
    ]);

    res.json({
      success: true,
      data: budgets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: unknown) {
    logger.error('Error listing budgets', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list budgets' },
    });
  }
});

// GET /api/reports/budgets/:id - Get budget
router.get('/budgets/:id', async (req: Request, res: Response) => {
  try {
    const budget = await prisma.finBudget.findUnique({
      where: { id: req.params.id },
      include: { account: true },
    });

    if (!budget) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    }

    res.json({ success: true, data: budget });
  } catch (error: unknown) {
    logger.error('Error getting budget', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get budget' } });
  }
});

// POST /api/reports/budgets - Create budget
router.post('/budgets', async (req: Request, res: Response) => {
  try {
    const data = createBudgetSchema.parse(req.body);
    const user = (req as AuthRequest).user;

    const account = await prisma.finAccount.findUnique({ where: { id: data.accountId } });
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    const budget = await prisma.finBudget.create({
      data: {
        ...data,
        createdBy: user!.id,
      },
      include: { account: { select: { id: true, code: true, name: true, type: true } } },
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as any).code === 'P2002'
    ) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE',
          message: 'Budget already exists for this account/year/month',
        },
      });
    }
    logger.error('Error creating budget', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create budget' },
    });
  }
});

// PUT /api/reports/budgets/:id - Update budget
router.put('/budgets/:id', async (req: Request, res: Response) => {
  try {
    const data = createBudgetSchema.partial().parse(req.body);

    const existing = await prisma.finBudget.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    }

    const budget = await prisma.finBudget.update({
      where: { id: req.params.id },
      data: {
        ...data,
        variance:
          data.budgetAmount !== undefined
            ? data.budgetAmount - Number(existing.actualAmount)
            : undefined,
      },
      include: { account: { select: { id: true, code: true, name: true, type: true } } },
    });

    res.json({ success: true, data: budget });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Error updating budget', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update budget' },
    });
  }
});

// DELETE /api/reports/budgets/:id - Delete budget
router.delete('/budgets/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finBudget.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
    }

    await prisma.finBudget.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Budget deleted' } });
  } catch (error: unknown) {
    logger.error('Error deleting budget', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete budget' },
    });
  }
});

// ============================================
// BUDGET vs ACTUAL REPORT
// ============================================

// GET /api/reports/budget-vs-actual - Budget vs Actual report
router.get('/budget-vs-actual', async (req: Request, res: Response) => {
  try {
    const { fiscalYear = new Date().getFullYear().toString() } = req.query;
    const year = parseInt(fiscalYear as string, 10);

    const budgets = await prisma.finBudget.findMany({
      where: { fiscalYear: year, deletedAt: null } as any,
      include: { account: { select: { id: true, code: true, name: true, type: true } } },
      orderBy: [{ account: { code: 'asc' } }, { month: 'asc' }],
      take: 1000,
    });

    // Group by account
    const byAccount: Record<
      string,
      {
        account: Record<string, unknown>;
        months: Record<string, unknown>[];
        totalBudget: number;
        totalActual: number;
      }
    > = {};
    for (const b of budgets) {
      if (!byAccount[b.accountId]) {
        byAccount[b.accountId] = {
          account: b.account,
          months: [],
          totalBudget: 0,
          totalActual: 0,
        };
      }
      byAccount[b.accountId].months.push({
        month: b.month,
        quarter: b.quarter,
        budget: Number(b.budgetAmount),
        actual: Number(b.actualAmount),
        variance: Number(b.variance),
        variancePercent:
          Number(b.budgetAmount) > 0
            ? ((Number(b.actualAmount) - Number(b.budgetAmount)) / Number(b.budgetAmount)) * 100
            : 0,
      });
      byAccount[b.accountId].totalBudget += Number(b.budgetAmount);
      byAccount[b.accountId].totalActual += Number(b.actualAmount);
    }

    res.json({
      success: true,
      data: {
        fiscalYear: year,
        accounts: Object.values(byAccount),
      },
    });
  } catch (error: unknown) {
    logger.error('Error generating budget vs actual report', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate report' },
    });
  }
});

// ============================================
// REVENUE / EXPENSE BREAKDOWN
// ============================================

// GET /api/reports/revenue-breakdown - Revenue by customer/month
router.get('/revenue-breakdown', async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const where: Record<string, unknown> = {
      status: { in: ['PAID', 'PARTIALLY_PAID'] },
      deletedAt: null,
    };
    if (dateFrom)
      where.issueDate = { ...((where.issueDate as any) ?? {}), gte: new Date(dateFrom as string) };
    if (dateTo)
      where.issueDate = { ...((where.issueDate as any) ?? {}), lte: new Date(dateTo as string) };

    const invoices = await prisma.finInvoice.findMany({
      where,
      include: { customer: { select: { id: true, name: true, code: true } } },
      orderBy: { issueDate: 'asc' },
      take: 1000,
    });

    // Group by customer
    const byCustomer: Record<
      string,
      { customer: Record<string, unknown>; total: number; count: number }
    > = {};
    for (const inv of invoices) {
      if (!byCustomer[inv.customerId]) {
        byCustomer[inv.customerId] = { customer: inv.customer, total: 0, count: 0 };
      }
      byCustomer[inv.customerId].total += Number(inv.amountPaid);
      byCustomer[inv.customerId].count++;
    }

    res.json({
      success: true,
      data: {
        totalRevenue: invoices.reduce((sum, i) => sum + Number(i.amountPaid), 0),
        invoiceCount: invoices.length,
        byCustomer: Object.values(byCustomer).sort((a, b) => b.total - a.total),
      },
    });
  } catch (error: unknown) {
    logger.error('Error generating revenue breakdown', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate report' },
    });
  }
});

// GET /api/reports/expense-breakdown - Expenses by supplier/month
router.get('/expense-breakdown', async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const where: Record<string, unknown> = {
      status: { in: ['PAID', 'PARTIALLY_PAID'] },
      deletedAt: null,
    };
    if (dateFrom)
      where.billDate = { ...((where.billDate as any) ?? {}), gte: new Date(dateFrom as string) };
    if (dateTo)
      where.billDate = { ...((where.billDate as any) ?? {}), lte: new Date(dateTo as string) };

    const bills = await prisma.finBill.findMany({
      where,
      include: { supplier: { select: { id: true, name: true, code: true } } },
      orderBy: { billDate: 'asc' },
      take: 1000,
    });

    // Group by supplier
    const bySupplier: Record<
      string,
      { supplier: Record<string, unknown>; total: number; count: number }
    > = {};
    for (const bill of bills) {
      if (!bySupplier[bill.supplierId]) {
        bySupplier[bill.supplierId] = { supplier: bill.supplier, total: 0, count: 0 };
      }
      bySupplier[bill.supplierId].total += Number(bill.amountPaid);
      bySupplier[bill.supplierId].count++;
    }

    res.json({
      success: true,
      data: {
        totalExpenses: bills.reduce((sum, b) => sum + Number(b.amountPaid), 0),
        billCount: bills.length,
        bySupplier: Object.values(bySupplier).sort((a, b) => b.total - a.total),
      },
    });
  } catch (error: unknown) {
    logger.error('Error generating expense breakdown', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate report' },
    });
  }
});

// GET /api/reports/cash-forecast - Cash flow forecast
router.get('/cash-forecast', async (req: Request, res: Response) => {
  try {
    const { months = '3' } = req.query;
    const numMonths = Math.min(parseInt(months as string, 10) || 3, 12);
    const now = new Date();

    // Current cash position
    const cashResult = await prisma.finBankAccount.aggregate({
      where: { isActive: true, deletedAt: null } as any,
      _sum: { currentBalance: true },
    });
    const currentCash = Number(cashResult._sum.currentBalance || 0);

    // Expected inflows (outstanding invoices by due date)
    const inflows = await prisma.finInvoice.findMany({
      where: {
        status: { in: ['SENT', 'PARTIALLY_PAID'] },
        dueDate: {
          gte: now,
          lte: new Date(now.getFullYear(), now.getMonth() + numMonths, now.getDate()),
        },
        deletedAt: null,
      },
      select: { dueDate: true, amountDue: true },
      orderBy: { dueDate: 'asc' },
      take: 1000,
    });

    // Expected outflows (outstanding bills by due date)
    const outflows = await prisma.finBill.findMany({
      where: {
        status: { in: ['RECEIVED', 'PARTIALLY_PAID'] },
        dueDate: {
          gte: now,
          lte: new Date(now.getFullYear(), now.getMonth() + numMonths, now.getDate()),
        },
        deletedAt: null,
      },
      select: { dueDate: true, amountDue: true },
      orderBy: { dueDate: 'asc' },
      take: 1000,
    });

    const totalInflows = inflows.reduce((sum, i) => sum + Number(i.amountDue), 0);
    const totalOutflows = outflows.reduce((sum, o) => sum + Number(o.amountDue), 0);

    res.json({
      success: true,
      data: {
        currentCash,
        projectedCash: currentCash + totalInflows - totalOutflows,
        totalExpectedInflows: totalInflows,
        totalExpectedOutflows: totalOutflows,
        forecastMonths: numMonths,
        inflows: inflows.map((i) => ({ dueDate: i.dueDate, amount: Number(i.amountDue) })),
        outflows: outflows.map((o) => ({ dueDate: o.dueDate, amount: Number(o.amountDue) })),
      },
    });
  } catch (error: unknown) {
    logger.error('Error generating cash forecast', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate forecast' },
    });
  }
});

export default router;
