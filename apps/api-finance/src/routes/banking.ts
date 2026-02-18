import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);

// Validation schemas
const createBankAccountSchema = z.object({
  name: z.string().min(1),
  accountNumber: z.string().optional(),
  sortCode: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  type: z.enum(['CURRENT', 'SAVINGS', 'CREDIT_CARD', 'LOAN', 'MERCHANT', 'OTHER']).default('CURRENT'),
  currency: z.string().default('GBP'),
  bankName: z.string().optional(),
  accountId: z.string().uuid().optional(),
  currentBalance: z.number().optional(),
});

const createTransactionSchema = z.object({
  bankAccountId: z.string().uuid(),
  date: z.string(),
  description: z.string().min(1),
  reference: z.string().optional(),
  amount: z.number(),
  sourceType: z.string().optional(),
  sourceId: z.string().optional(),
});

const importTransactionsSchema = z.object({
  bankAccountId: z.string().uuid(),
  transactions: z.array(z.object({
    date: z.string(),
    description: z.string(),
    reference: z.string().optional(),
    amount: z.number(),
  })),
});

const startReconciliationSchema = z.object({
  bankAccountId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
  openingBalance: z.number(),
  closingBalance: z.number(),
});

const reconcileTransactionsSchema = z.object({
  transactionIds: z.array(z.string().uuid()),
});

// ============================================
// BANK ACCOUNTS
// ============================================

// GET /api/banking - List bank accounts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { isActive, type } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (type) where.type = type;

    const accounts = await prisma.finBankAccount.findMany({
      where,
      include: {
        _count: { select: { transactions: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: accounts });
  } catch (error: unknown) {
    logger.error('Error listing bank accounts', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list bank accounts' } });
  }
});

// GET /api/banking/:id - Get bank account
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const account = await prisma.finBankAccount.findUnique({
      where: { id: req.params.id },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 50,
        },
        _count: { select: { transactions: true, reconciliations: true } },
      },
    });

    if (!account) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bank account not found' } });
    }

    res.json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Error getting bank account', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get bank account' } });
  }
});

// POST /api/banking - Create bank account
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createBankAccountSchema.parse(req.body);
    const user = (req as AuthRequest).user;

    const account = await prisma.finBankAccount.create({
      data: {
        ...data,
        currentBalance: data.currentBalance ?? 0,
        createdBy: user!.id,
      },
    });

    res.status(201).json({ success: true, data: account });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Error creating bank account', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create bank account' } });
  }
});

// PUT /api/banking/:id - Update bank account
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = createBankAccountSchema.partial().parse(req.body);

    const existing = await prisma.finBankAccount.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bank account not found' } });
    }

    const account = await prisma.finBankAccount.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: account });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Error updating bank account', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update bank account' } });
  }
});

// DELETE /api/banking/:id - Soft delete bank account
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finBankAccount.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { transactions: { where: { isReconciled: false } } } } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bank account not found' } });
    }

    if ((existing as any)._count?.transactions > 0) {
      return res.status(409).json({ success: false, error: { code: 'IN_USE', message: 'Bank account has unreconciled transactions' } });
    }

    await prisma.finBankAccount.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    res.json({ success: true, data: { message: 'Bank account deleted' } });
  } catch (error: unknown) {
    logger.error('Error deleting bank account', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete bank account' } });
  }
});

// ============================================
// TRANSACTIONS
// ============================================

// GET /api/banking/transactions - List transactions
router.get('/transactions/list', async (req: Request, res: Response) => {
  try {
    const { bankAccountId, dateFrom, dateTo, isReconciled, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string) || 50), 200);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (bankAccountId) where.bankAccountId = bankAccountId;
    if (isReconciled !== undefined) where.isReconciled = isReconciled === 'true';
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as any).gte = new Date(dateFrom as string);
      if (dateTo) (where.date as any).lte = new Date(dateTo as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.finBankTransaction.findMany({
        where,
        include: { bankAccount: { select: { id: true, name: true } } },
        orderBy: { date: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.finBankTransaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: unknown) {
    logger.error('Error listing transactions', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list transactions' } });
  }
});

// POST /api/banking/transactions - Create transaction
router.post('/transactions', async (req: Request, res: Response) => {
  try {
    const data = createTransactionSchema.parse(req.body);
    const user = (req as AuthRequest).user;

    const bankAccount = await prisma.finBankAccount.findUnique({ where: { id: data.bankAccountId } });
    if (!bankAccount) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bank account not found' } });
    }

    const transaction = await prisma.finBankTransaction.create({
      data: {
        ...data,
        date: new Date(data.date),
        createdBy: user!.id,
      },
    });

    // Update bank account balance
    await prisma.finBankAccount.update({
      where: { id: data.bankAccountId },
      data: {
        currentBalance: { increment: data.amount },
      },
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Error creating transaction', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create transaction' } });
  }
});

// POST /api/banking/import - Import transactions
router.post('/import', async (req: Request, res: Response) => {
  try {
    const data = importTransactionsSchema.parse(req.body);
    const user = (req as AuthRequest).user;

    const bankAccount = await prisma.finBankAccount.findUnique({ where: { id: data.bankAccountId } });
    if (!bankAccount) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Bank account not found' } });
    }

    const created = await prisma.finBankTransaction.createMany({
      data: data.transactions.map(t => ({
        bankAccountId: data.bankAccountId,
        date: new Date(t.date),
        description: t.description,
        reference: t.reference,
        amount: t.amount,
        importedAt: new Date(),
        createdBy: user!.id,
      })),
    });

    res.status(201).json({ success: true, data: { imported: created.count } });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Error importing transactions', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to import transactions' } });
  }
});

// ============================================
// RECONCILIATION
// ============================================

// GET /api/banking/reconciliations - List reconciliations
router.get('/reconciliations/list', async (req: Request, res: Response) => {
  try {
    const { bankAccountId, status } = req.query;

    const where: Record<string, unknown> = {};
    if (bankAccountId) where.bankAccountId = bankAccountId;
    if (status) where.status = status;

    const reconciliations = await prisma.finReconciliation.findMany({
      where,
      include: {
        bankAccount: { select: { id: true, name: true } },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reconciliations });
  } catch (error: unknown) {
    logger.error('Error listing reconciliations', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list reconciliations' } });
  }
});

// POST /api/banking/reconciliations - Start reconciliation
router.post('/reconciliations', async (req: Request, res: Response) => {
  try {
    const data = startReconciliationSchema.parse(req.body);
    const user = (req as AuthRequest).user;

    const reconciliation = await prisma.finReconciliation.create({
      data: {
        bankAccountId: data.bankAccountId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        openingBalance: data.openingBalance,
        closingBalance: data.closingBalance,
        createdBy: user!.id,
      },
    });

    res.status(201).json({ success: true, data: reconciliation });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Error starting reconciliation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to start reconciliation' } });
  }
});

// POST /api/banking/reconciliations/:id/reconcile - Reconcile transactions
router.post('/reconciliations/:id/reconcile', async (req: Request, res: Response) => {
  try {
    const data = reconcileTransactionsSchema.parse(req.body);
    const user = (req as AuthRequest).user;

    const reconciliation = await prisma.finReconciliation.findUnique({ where: { id: req.params.id } });
    if (!reconciliation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reconciliation not found' } });
    }

    if (reconciliation.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_COMPLETED', message: 'Reconciliation already completed' } });
    }

    // Mark transactions as reconciled
    await prisma.finBankTransaction.updateMany({
      where: { id: { in: data.transactionIds } },
      data: { isReconciled: true, reconciliationId: req.params.id },
    });

    res.json({ success: true, data: { reconciled: data.transactionIds.length } });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Error reconciling transactions', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reconcile transactions' } });
  }
});

// POST /api/banking/reconciliations/:id/complete - Complete reconciliation
router.post('/reconciliations/:id/complete', async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;

    const reconciliation = await prisma.finReconciliation.findUnique({ where: { id: req.params.id } });
    if (!reconciliation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reconciliation not found' } });
    }

    const updated = await prisma.finReconciliation.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: user!.id,
      },
    });

    // Update bank account last reconciled date
    await prisma.finBankAccount.update({
      where: { id: reconciliation.bankAccountId },
      data: { lastReconciledDate: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error completing reconciliation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete reconciliation' } });
  }
});

export default router;
