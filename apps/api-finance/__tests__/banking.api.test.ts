import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finBankAccount: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    finBankTransaction: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    finReconciliation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import bankingRouter from '../src/routes/banking';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/banking', bankingRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// BANK ACCOUNTS
// ===================================================================

describe('GET /api/banking', () => {
  it('should return a list of bank accounts', async () => {
    const accounts = [
      { id: 'ba-1', name: 'Main Account', type: 'CURRENT', currentBalance: 50000, _count: { transactions: 120 } },
    ];
    (prisma as any).finBankAccount.findMany.mockResolvedValue(accounts);

    const res = await request(app).get('/api/banking');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by isActive', async () => {
    (prisma as any).finBankAccount.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/banking?isActive=true');

    expect(res.status).toBe(200);
    expect((prisma as any).finBankAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    );
  });

  it('should filter by type', async () => {
    (prisma as any).finBankAccount.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/banking?type=SAVINGS');

    expect(res.status).toBe(200);
    expect((prisma as any).finBankAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'SAVINGS' }),
      })
    );
  });

  it('should return 500 on error', async () => {
    (prisma as any).finBankAccount.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/banking');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/banking/:id', () => {
  it('should return a bank account with recent transactions', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue({
      id: 'ba-1',
      name: 'Main Account',
      currentBalance: 50000,
      transactions: [{ id: 'tx-1', amount: -500, description: 'Office supplies' }],
      _count: { transactions: 120, reconciliations: 3 },
    });

    const res = await request(app).get('/api/banking/ba-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('ba-1');
    expect(res.body.data.transactions).toHaveLength(1);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/banking/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/banking', () => {
  const validAccount = {
    name: 'Business Savings',
    type: 'SAVINGS',
    currency: 'GBP',
    bankName: 'Barclays',
    currentBalance: 10000,
  };

  it('should create a bank account', async () => {
    (prisma as any).finBankAccount.create.mockResolvedValue({ id: 'ba-new', ...validAccount });

    const res = await request(app).post('/api/banking').send(validAccount);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/banking').send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finBankAccount.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/banking').send(validAccount);

    expect(res.status).toBe(500);
  });
});

describe('PUT /api/banking/:id', () => {
  it('should update a bank account', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue({ id: 'ba-1', name: 'Old Name' });
    (prisma as any).finBankAccount.update.mockResolvedValue({ id: 'ba-1', name: 'Updated Name' });

    const res = await request(app).put('/api/banking/ba-1').send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue(null);

    const res = await request(app).put('/api/banking/nonexistent').send({ name: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 for validation error', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue({ id: 'ba-1' });

    const res = await request(app).put('/api/banking/ba-1').send({ type: 'INVALID_TYPE' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/banking/:id', () => {
  it('should soft delete a bank account with no unreconciled transactions', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue({
      id: 'ba-1',
      _count: { transactions: 0 },
    });
    (prisma as any).finBankAccount.update.mockResolvedValue({ id: 'ba-1' });

    const res = await request(app).delete('/api/banking/ba-1');

    expect(res.status).toBe(200);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue(null);

    const res = await request(app).delete('/api/banking/nonexistent');

    expect(res.status).toBe(404);
  });

  it('should return 409 when account has unreconciled transactions', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue({
      id: 'ba-1',
      _count: { transactions: 5 },
    });

    const res = await request(app).delete('/api/banking/ba-1');

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('IN_USE');
  });
});

// ===================================================================
// TRANSACTIONS
// ===================================================================

describe('GET /api/banking/transactions/list', () => {
  it('should return a list of transactions', async () => {
    const transactions = [
      { id: 'tx-1', amount: -500, description: 'Rent', bankAccount: { id: 'ba-1', name: 'Main' } },
    ];
    (prisma as any).finBankTransaction.findMany.mockResolvedValue(transactions);
    (prisma as any).finBankTransaction.count.mockResolvedValue(1);

    const res = await request(app).get('/api/banking/transactions/list');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by bankAccountId', async () => {
    (prisma as any).finBankTransaction.findMany.mockResolvedValue([]);
    (prisma as any).finBankTransaction.count.mockResolvedValue(0);

    const res = await request(app).get('/api/banking/transactions/list?bankAccountId=ba-1');

    expect(res.status).toBe(200);
  });

  it('should filter by isReconciled', async () => {
    (prisma as any).finBankTransaction.findMany.mockResolvedValue([]);
    (prisma as any).finBankTransaction.count.mockResolvedValue(0);

    const res = await request(app).get('/api/banking/transactions/list?isReconciled=false');

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    (prisma as any).finBankTransaction.findMany.mockResolvedValue([]);
    (prisma as any).finBankTransaction.count.mockResolvedValue(0);

    const res = await request(app).get('/api/banking/transactions/list?dateFrom=2026-01-01&dateTo=2026-01-31');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).finBankTransaction.findMany.mockResolvedValue([]);
    (prisma as any).finBankTransaction.count.mockResolvedValue(200);

    const res = await request(app).get('/api/banking/transactions/list?page=2&limit=50');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
  });
});

describe('POST /api/banking/transactions', () => {
  const validTx = {
    bankAccountId: '550e8400-e29b-41d4-a716-446655440000',
    date: '2026-01-15',
    description: 'Client payment received',
    amount: 5000,
  };

  it('should create a transaction and update balance', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue({ id: validTx.bankAccountId, currentBalance: 10000 });
    (prisma as any).finBankTransaction.create.mockResolvedValue({ id: 'tx-new', ...validTx });
    (prisma as any).finBankAccount.update.mockResolvedValue({ id: validTx.bankAccountId, currentBalance: 15000 });

    const res = await request(app).post('/api/banking/transactions').send(validTx);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when bank account not found', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/banking/transactions').send(validTx);

    expect(res.status).toBe(404);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/banking/transactions').send({ description: '' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/banking/import', () => {
  const validImport = {
    bankAccountId: '550e8400-e29b-41d4-a716-446655440000',
    transactions: [
      { date: '2026-01-10', description: 'Transfer in', amount: 1000 },
      { date: '2026-01-11', description: 'Subscription', amount: -50 },
      { date: '2026-01-12', description: 'Client payment', amount: 3000 },
    ],
  };

  it('should import multiple transactions', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue({ id: validImport.bankAccountId });
    (prisma as any).finBankTransaction.createMany.mockResolvedValue({ count: 3 });

    const res = await request(app).post('/api/banking/import').send(validImport);

    expect(res.status).toBe(201);
    expect(res.body.data.imported).toBe(3);
  });

  it('should return 404 when bank account not found', async () => {
    (prisma as any).finBankAccount.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/banking/import').send(validImport);

    expect(res.status).toBe(404);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/banking/import').send({ transactions: [] });

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// RECONCILIATION
// ===================================================================

describe('GET /api/banking/reconciliations/list', () => {
  it('should return a list of reconciliations', async () => {
    const reconciliations = [
      { id: 'rec-1', status: 'IN_PROGRESS', bankAccount: { id: 'ba-1', name: 'Main' }, _count: { transactions: 10 } },
    ];
    (prisma as any).finReconciliation.findMany.mockResolvedValue(reconciliations);

    const res = await request(app).get('/api/banking/reconciliations/list');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by bankAccountId', async () => {
    (prisma as any).finReconciliation.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/banking/reconciliations/list?bankAccountId=ba-1');

    expect(res.status).toBe(200);
  });

  it('should filter by status', async () => {
    (prisma as any).finReconciliation.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/banking/reconciliations/list?status=COMPLETED');

    expect(res.status).toBe(200);
  });
});

describe('POST /api/banking/reconciliations', () => {
  const validRecon = {
    bankAccountId: '550e8400-e29b-41d4-a716-446655440000',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    openingBalance: 10000,
    closingBalance: 15000,
  };

  it('should start a reconciliation', async () => {
    (prisma as any).finReconciliation.create.mockResolvedValue({
      id: 'rec-new',
      status: 'IN_PROGRESS',
      ...validRecon,
    });

    const res = await request(app).post('/api/banking/reconciliations').send(validRecon);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/banking/reconciliations').send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/banking/reconciliations/:id/reconcile', () => {
  it('should reconcile selected transactions', async () => {
    (prisma as any).finReconciliation.findUnique.mockResolvedValue({
      id: 'rec-1',
      status: 'IN_PROGRESS',
    });
    (prisma as any).finBankTransaction.updateMany.mockResolvedValue({ count: 3 });

    const res = await request(app)
      .post('/api/banking/reconciliations/rec-1/reconcile')
      .send({
        transactionIds: [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
          '550e8400-e29b-41d4-a716-446655440003',
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.reconciled).toBe(3);
  });

  it('should return 404 when reconciliation not found', async () => {
    (prisma as any).finReconciliation.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/banking/reconciliations/nonexistent/reconcile')
      .send({ transactionIds: ['550e8400-e29b-41d4-a716-446655440001'] });

    expect(res.status).toBe(404);
  });

  it('should return 400 when reconciliation is COMPLETED', async () => {
    (prisma as any).finReconciliation.findUnique.mockResolvedValue({
      id: 'rec-1',
      status: 'COMPLETED',
    });

    const res = await request(app)
      .post('/api/banking/reconciliations/rec-1/reconcile')
      .send({ transactionIds: ['550e8400-e29b-41d4-a716-446655440001'] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_COMPLETED');
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app)
      .post('/api/banking/reconciliations/rec-1/reconcile')
      .send({ transactionIds: 'not-an-array' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/banking/reconciliations/:id/complete', () => {
  it('should complete a reconciliation', async () => {
    (prisma as any).finReconciliation.findUnique.mockResolvedValue({
      id: 'rec-1',
      status: 'IN_PROGRESS',
      bankAccountId: 'ba-1',
    });
    (prisma as any).finReconciliation.update.mockResolvedValue({
      id: 'rec-1',
      status: 'COMPLETED',
    });
    (prisma as any).finBankAccount.update.mockResolvedValue({ id: 'ba-1' });

    const res = await request(app).post('/api/banking/reconciliations/rec-1/complete');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('should return 404 when reconciliation not found', async () => {
    (prisma as any).finReconciliation.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/banking/reconciliations/nonexistent/complete');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finReconciliation.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/banking/reconciliations/rec-1/complete');

    expect(res.status).toBe(500);
  });
});
