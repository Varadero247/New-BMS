import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-payroll');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/expenses - Get expenses
router.get('/', async (req: Request, res: Response) => {
  try {
    const { employeeId, status, category, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ExpenseWhereInput = {};
    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status as string;
    if (category) where.category = category as string;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { expenseDate: 'desc' },
      }),
      prisma.expense.count({ where }),
    ]);

    res.json({
      success: true,
      data: expenses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Error fetching expenses', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch expenses' } });
  }
});

// GET /api/expenses/:id - Get single expense
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: {
        report: true,
      },
    });

    if (!expense) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    logger.error('Error fetching expense', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch expense' } });
  }
});

// POST /api/expenses - Create expense
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      category: z.enum(['TRAVEL', 'MEALS', 'ACCOMMODATION', 'TRANSPORTATION', 'OFFICE_SUPPLIES', 'SOFTWARE', 'HARDWARE', 'TRAINING', 'COMMUNICATION', 'CLIENT_ENTERTAINMENT', 'MISCELLANEOUS']),
      subcategory: z.string().optional(),
      description: z.string(),
      merchant: z.string().optional(),
      amount: z.number().positive(),
      currency: z.string().default('USD'),
      expenseDate: z.string(),
      receiptUrls: z.array(z.string()).default([]),
      projectCode: z.string().optional(),
      costCenter: z.string().optional(),
      isBillable: z.boolean().default(false),
      clientName: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Generate expense number
    const count = await prisma.expense.count();
    const expenseNumber = `EXP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        ...data,
        expenseDate: new Date(data.expenseDate),
        hasReceipt: data.receiptUrls.length > 0,
        amountInBaseCurrency: data.amount, // Simplified - no exchange rate calculation
        status: 'SUBMITTED',
      },
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating expense', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create expense' } });
  }
});

// PUT /api/expenses/:id/approve - Approve expense
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { approvedById, approvalNotes } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedById,
        approvedAt: new Date(),
        approvalNotes,
      },
    });

    res.json({ success: true, data: expense });
  } catch (error) {
    logger.error('Error approving expense', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve expense' } });
  }
});

// PUT /api/expenses/:id/reject - Reject expense
router.put('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { approvedById, approvalNotes } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        approvalStatus: 'REJECTED',
        approvedById,
        approvedAt: new Date(),
        approvalNotes,
      },
    });

    res.json({ success: true, data: expense });
  } catch (error) {
    logger.error('Error rejecting expense', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reject expense' } });
  }
});

// PUT /api/expenses/:id/reimburse - Mark as reimbursed
router.put('/:id/reimburse', async (req: Request, res: Response) => {
  try {
    const { paymentMethod } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        status: 'REIMBURSED',
        reimbursementStatus: 'COMPLETED',
        reimbursedAt: new Date(),
        reimbursementMethod: paymentMethod,
      },
    });

    res.json({ success: true, data: expense });
  } catch (error) {
    logger.error('Error reimbursing expense', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reimburse expense' } });
  }
});

// Expense reports
// GET /api/expenses/reports - Get expense reports
router.get('/reports/all', async (req: Request, res: Response) => {
  try {
    const { employeeId, status } = req.query;

    const where: Prisma.ExpenseReportWhereInput = {};
    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status as string;

    const reports = await prisma.expenseReport.findMany({
      where,
      include: {
        _count: { select: { expenses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    logger.error('Error fetching expense reports', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reports' } });
  }
});

// POST /api/expenses/reports - Create expense report
router.post('/reports', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      periodStart: z.string(),
      periodEnd: z.string(),
      expenseIds: z.array(z.string().uuid()).default([]),
    });

    const data = schema.parse(req.body);

    // Calculate totals from expenses
    const expenses = await prisma.expense.findMany({
      where: { id: { in: data.expenseIds } },
    });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Generate report number
    const count = await prisma.expenseReport.count();
    const reportNumber = `ER-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const report = await prisma.expenseReport.create({
      data: {
        reportNumber,
        employeeId: data.employeeId,
        title: data.title,
        description: data.description,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        totalAmount,
        expenseCount: expenses.length,
        status: 'DRAFT',
      },
    });

    // Link expenses to report
    await prisma.expense.updateMany({
      where: { id: { in: data.expenseIds } },
      data: { reportId: report.id },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating report', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create report' } });
  }
});

export default router;
