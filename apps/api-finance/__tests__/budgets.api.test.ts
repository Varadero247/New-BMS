import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finBudget: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finAccount: {
      findFirst: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
    FinBudgetWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/budgets';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/budgets', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/budgets
// ===================================================================

describe('GET /api/budgets', () => {
  it('should return a list of budgets', async () => {
    const budgets = [
      { id: 'bud-1', name: 'Q1 Marketing', fiscalYear: 2026, budgetAmount: 50000, actualAmount: 30000, account: { id: 'acc-1', code: '5000', name: 'Marketing', type: 'EXPENSE' } },
    ];
    (prisma as any).finBudget.findMany.mockResolvedValue(budgets);
    (prisma as any).finBudget.count.mockResolvedValue(1);

    const res = await request(app).get('/api/budgets');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by fiscalYear', async () => {
    (prisma as any).finBudget.findMany.mockResolvedValue([]);
    (prisma as any).finBudget.count.mockResolvedValue(0);

    const res = await request(app).get('/api/budgets?fiscalYear=2026');

    expect(res.status).toBe(200);
    expect((prisma as any).finBudget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ fiscalYear: 2026 }),
      })
    );
  });

  it('should filter by accountId', async () => {
    (prisma as any).finBudget.findMany.mockResolvedValue([]);
    (prisma as any).finBudget.count.mockResolvedValue(0);

    const res = await request(app).get('/api/budgets?accountId=acc-1');

    expect(res.status).toBe(200);
  });

  it('should filter by month and quarter', async () => {
    (prisma as any).finBudget.findMany.mockResolvedValue([]);
    (prisma as any).finBudget.count.mockResolvedValue(0);

    const res = await request(app).get('/api/budgets?month=3&quarter=1');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).finBudget.findMany.mockResolvedValue([]);
    (prisma as any).finBudget.count.mockResolvedValue(100);

    const res = await request(app).get('/api/budgets?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finBudget.findMany.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/budgets');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/budgets/variance-report
// ===================================================================

describe('GET /api/budgets/variance-report', () => {
  it('should return variance report for a fiscal year', async () => {
    const budgets = [
      { id: 'bud-1', fiscalYear: 2026, budgetAmount: 50000, actualAmount: 45000, account: { id: 'acc-1', code: '5000', name: 'Marketing', type: 'EXPENSE' } },
      { id: 'bud-2', fiscalYear: 2026, budgetAmount: 30000, actualAmount: 32000, account: { id: 'acc-2', code: '5100', name: 'HR', type: 'EXPENSE' } },
    ];
    (prisma as any).finBudget.findMany.mockResolvedValue(budgets);

    const res = await request(app).get('/api/budgets/variance-report?fiscalYear=2026');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fiscalYear).toBe(2026);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.rows).toHaveLength(2);
  });

  it('should return 400 if fiscalYear not provided', async () => {
    const res = await request(app).get('/api/budgets/variance-report');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finBudget.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/budgets/variance-report?fiscalYear=2026');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/budgets/:id
// ===================================================================

describe('GET /api/budgets/:id', () => {
  it('should return a single budget', async () => {
    const budget = { id: 'bud-1', name: 'Q1 Marketing', fiscalYear: 2026, account: { id: 'acc-1', code: '5000', name: 'Marketing', type: 'EXPENSE' } };
    (prisma as any).finBudget.findFirst.mockResolvedValue(budget);

    const res = await request(app).get('/api/budgets/bud-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('bud-1');
  });

  it('should return 404 when budget not found', async () => {
    (prisma as any).finBudget.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/budgets/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finBudget.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/budgets/bud-1');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/budgets
// ===================================================================

describe('POST /api/budgets', () => {
  const validBudget = {
    name: 'Q1 Marketing Budget',
    accountId: '550e8400-e29b-41d4-a716-446655440001',
    fiscalYear: 2026,
    month: 1,
    budgetAmount: 50000,
  };

  it('should create a budget successfully', async () => {
    (prisma as any).finAccount.findFirst.mockResolvedValue({ id: validBudget.accountId, code: '5000', name: 'Marketing' });
    (prisma as any).finBudget.create.mockResolvedValue({
      id: 'bud-new',
      ...validBudget,
      actualAmount: 0,
      variance: 0,
      account: { id: validBudget.accountId, code: '5000', name: 'Marketing', type: 'EXPENSE' },
    });

    const res = await request(app).post('/api/budgets').send(validBudget);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('bud-new');
  });

  it('should return 400 when account not found', async () => {
    (prisma as any).finAccount.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/budgets').send(validBudget);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Account not found');
  });

  it('should return 400 for validation error (missing name)', async () => {
    const res = await request(app).post('/api/budgets').send({
      accountId: '550e8400-e29b-41d4-a716-446655440001',
      fiscalYear: 2026,
      budgetAmount: 50000,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid accountId (not UUID)', async () => {
    const res = await request(app).post('/api/budgets').send({
      ...validBudget,
      accountId: 'not-a-uuid',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for out-of-range fiscalYear', async () => {
    const res = await request(app).post('/api/budgets').send({
      ...validBudget,
      fiscalYear: 1999,
    });

    expect(res.status).toBe(400);
  });

  it('should return 409 on duplicate budget entry', async () => {
    (prisma as any).finAccount.findFirst.mockResolvedValue({ id: validBudget.accountId });
    const err = Object.assign(new Error('Unique violation'), { code: 'P2002' });
    (prisma as any).finBudget.create.mockRejectedValue(err);

    const res = await request(app).post('/api/budgets').send(validBudget);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on unexpected error', async () => {
    (prisma as any).finAccount.findFirst.mockResolvedValue({ id: validBudget.accountId });
    (prisma as any).finBudget.create.mockRejectedValue(new Error('Unexpected DB error'));

    const res = await request(app).post('/api/budgets').send(validBudget);

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/budgets/:id
// ===================================================================

describe('PUT /api/budgets/:id', () => {
  it('should update a budget successfully', async () => {
    const existing = { id: 'bud-1', budgetAmount: 50000, actualAmount: 0 };
    (prisma as any).finBudget.findFirst.mockResolvedValue(existing);
    (prisma as any).finBudget.update.mockResolvedValue({
      id: 'bud-1',
      budgetAmount: 60000,
      actualAmount: 0,
      variance: 0,
      account: { id: 'acc-1', code: '5000', name: 'Marketing', type: 'EXPENSE' },
    });

    const res = await request(app).put('/api/budgets/bud-1').send({ budgetAmount: 60000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update actualAmount and recalculate variance', async () => {
    const existing = { id: 'bud-1', budgetAmount: 50000, actualAmount: 0 };
    (prisma as any).finBudget.findFirst.mockResolvedValue(existing);
    (prisma as any).finBudget.update.mockResolvedValue({
      id: 'bud-1',
      budgetAmount: 50000,
      actualAmount: 45000,
      variance: -5000,
      account: { id: 'acc-1', code: '5000', name: 'Marketing', type: 'EXPENSE' },
    });

    const res = await request(app).put('/api/budgets/bud-1').send({ actualAmount: 45000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when budget not found', async () => {
    (prisma as any).finBudget.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/budgets/nonexistent').send({ budgetAmount: 60000 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for validation error (negative amount)', async () => {
    (prisma as any).finBudget.findFirst.mockResolvedValue({ id: 'bud-1', budgetAmount: 50000, actualAmount: 0 });

    const res = await request(app).put('/api/budgets/bud-1').send({ budgetAmount: -100 });

    expect(res.status).toBe(400);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finBudget.findFirst.mockResolvedValue({ id: 'bud-1', budgetAmount: 50000, actualAmount: 0 });
    (prisma as any).finBudget.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/budgets/bud-1').send({ budgetAmount: 60000 });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// DELETE /api/budgets/:id
// ===================================================================

describe('DELETE /api/budgets/:id', () => {
  it('should soft delete a budget', async () => {
    (prisma as any).finBudget.findFirst.mockResolvedValue({ id: 'bud-1', name: 'Q1 Marketing' });
    (prisma as any).finBudget.update.mockResolvedValue({ id: 'bud-1' });

    const res = await request(app).delete('/api/budgets/bud-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when budget not found', async () => {
    (prisma as any).finBudget.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/budgets/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finBudget.findFirst.mockResolvedValue({ id: 'bud-1' });
    (prisma as any).finBudget.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/budgets/bud-1');

    expect(res.status).toBe(500);
  });
});
