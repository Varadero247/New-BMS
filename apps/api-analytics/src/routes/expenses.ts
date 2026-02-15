import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('expenses');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET / — List expenses with pagination, filter by status/category
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list expenses', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list expenses' } });
  }
});

// ---------------------------------------------------------------------------
// GET /summary — Expense totals by category, status breakdown
// (Named route BEFORE /:id)
// ---------------------------------------------------------------------------
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const [byCategory, byStatus, totalApproved, totalPending] = await Promise.all([
      prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { status: 'SUBMITTED' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        byCategory,
        byStatus,
        totalApproved: {
          amount: totalApproved._sum?.amount || 0,
          count: totalApproved._count || 0,
        },
        totalPending: {
          amount: totalPending._sum?.amount || 0,
          count: totalPending._count || 0,
        },
      },
    });
  } catch (err) {
    logger.error('Failed to get expense summary', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get expense summary' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get single expense
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });

    if (!expense) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    logger.error('Failed to get expense', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get expense' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create expense
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, amount, category, vendor, receiptUrl } = req.body;

    if (!title || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title, amount, and category are required' },
      });
    }

    const authReq = req as AuthRequest;
    const expense = await prisma.expense.create({
      data: {
        title,
        description: description || '',
        amount: parseFloat(amount),
        category,
        vendor: vendor || null,
        receiptUrl: receiptUrl || null,
        status: 'DRAFT',
        expenseDate: new Date(),
        submittedBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Expense created', { id: expense.id, title, amount });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    logger.error('Failed to create expense', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create expense' } });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id — Update expense
// ---------------------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    }

    const { title, description, amount, category, vendor, receiptUrl } = req.body;
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(category !== undefined && { category }),
        ...(vendor !== undefined && { vendor }),
        ...(receiptUrl !== undefined && { receiptUrl }),
      },
    });

    logger.info('Expense updated', { id: expense.id });
    res.json({ success: true, data: expense });
  } catch (err) {
    logger.error('Failed to update expense', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update expense' } });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/submit — Transition DRAFT → SUBMITTED
// ---------------------------------------------------------------------------
router.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    }

    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TRANSITION', message: 'Only DRAFT expenses can be submitted' },
      });
    }

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: { status: 'SUBMITTED' },
    });

    logger.info('Expense submitted', { id: expense.id });
    res.json({ success: true, data: expense });
  } catch (err) {
    logger.error('Failed to submit expense', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit expense' } });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/approve — Transition SUBMITTED → APPROVED
// ---------------------------------------------------------------------------
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    }

    if (existing.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TRANSITION', message: 'Only SUBMITTED expenses can be approved' },
      });
    }

    const authReq = req as AuthRequest;
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: authReq.user?.id || 'system',
        approvedAt: new Date(),
      },
    });

    logger.info('Expense approved', { id: expense.id, approvedBy: authReq.user?.id });
    res.json({ success: true, data: expense });
  } catch (err) {
    logger.error('Failed to approve expense', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve expense' } });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/reject — Transition SUBMITTED → REJECTED
// ---------------------------------------------------------------------------
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.expense.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    }

    if (existing.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TRANSITION', message: 'Only SUBMITTED expenses can be rejected' },
      });
    }

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' },
    });

    logger.info('Expense rejected', { id: expense.id });
    res.json({ success: true, data: expense });
  } catch (err) {
    logger.error('Failed to reject expense', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reject expense' } });
  }
});

export default router;
