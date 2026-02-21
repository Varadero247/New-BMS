import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    expense: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', email: 'a@b.com' };
    next();
  },
}));

import expensesRouter from '../src/routes/expenses';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/expenses', expensesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const sampleExpense = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'AWS Hosting',
  description: 'Monthly cloud bill',
  amount: 250.0,
  category: 'SOFTWARE',
  vendor: 'Amazon',
  status: 'DRAFT',
  expenseDate: '2026-02-01T00:00:00.000Z',
  submittedBy: 'user-1',
  approvedBy: null,
  approvedAt: null,
  receiptUrl: null,
  createdAt: '2026-02-01T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// GET /api/expenses
// ---------------------------------------------------------------------------
describe('GET /api/expenses', () => {
  it('lists expenses with pagination', async () => {
    (prisma.expense.findMany as jest.Mock).mockResolvedValue([sampleExpense]);
    (prisma.expense.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expenses).toHaveLength(1);
  });

  it('filters by status', async () => {
    (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.expense.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/expenses?status=APPROVED');
    expect(prisma.expense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'APPROVED' }) })
    );
  });

  it('filters by category', async () => {
    (prisma.expense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.expense.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/expenses?category=TRAVEL');
    expect(prisma.expense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'TRAVEL' }) })
    );
  });
});

// ---------------------------------------------------------------------------
// GET /api/expenses/summary
// ---------------------------------------------------------------------------
describe('GET /api/expenses/summary', () => {
  it('returns expense totals by category and status', async () => {
    (prisma.expense.groupBy as jest.Mock).mockResolvedValue([
      { category: 'SOFTWARE', _sum: { amount: 500 }, _count: 2 },
    ]);
    (prisma.expense.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 300 }, _count: 1 });

    const res = await request(app).get('/api/expenses/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('byCategory');
    expect(res.body.data).toHaveProperty('totalApproved');
    expect(res.body.data).toHaveProperty('totalPending');
  });
});

// ---------------------------------------------------------------------------
// GET /api/expenses/:id
// ---------------------------------------------------------------------------
describe('GET /api/expenses/:id', () => {
  it('returns a single expense', async () => {
    (prisma.expense.findUnique as jest.Mock).mockResolvedValue(sampleExpense);
    const res = await request(app).get('/api/expenses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('AWS Hosting');
  });

  it('returns 404 for missing expense', async () => {
    (prisma.expense.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/expenses/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/expenses
// ---------------------------------------------------------------------------
describe('POST /api/expenses', () => {
  it('creates a new expense', async () => {
    (prisma.expense.create as jest.Mock).mockResolvedValue(sampleExpense);

    const res = await request(app).post('/api/expenses').send({
      title: 'AWS Hosting',
      amount: 250,
      category: 'SOFTWARE',
      vendor: 'Amazon',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('AWS Hosting');
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/expenses').send({ title: 'No amount' });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/expenses/:id/submit
// ---------------------------------------------------------------------------
describe('POST /api/expenses/:id/submit', () => {
  it('transitions DRAFT to SUBMITTED', async () => {
    (prisma.expense.findUnique as jest.Mock).mockResolvedValue({
      ...sampleExpense,
      status: 'DRAFT',
    });
    (prisma.expense.update as jest.Mock).mockResolvedValue({
      ...sampleExpense,
      status: 'SUBMITTED',
    });

    const res = await request(app).post(
      '/api/expenses/00000000-0000-0000-0000-000000000001/submit'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUBMITTED');
  });

  it('rejects submission of non-DRAFT expense', async () => {
    (prisma.expense.findUnique as jest.Mock).mockResolvedValue({
      ...sampleExpense,
      status: 'SUBMITTED',
    });
    const res = await request(app).post(
      '/api/expenses/00000000-0000-0000-0000-000000000001/submit'
    );
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/expenses/:id/approve
// ---------------------------------------------------------------------------
describe('POST /api/expenses/:id/approve', () => {
  it('transitions SUBMITTED to APPROVED', async () => {
    (prisma.expense.findUnique as jest.Mock).mockResolvedValue({
      ...sampleExpense,
      status: 'SUBMITTED',
    });
    (prisma.expense.update as jest.Mock).mockResolvedValue({
      ...sampleExpense,
      status: 'APPROVED',
      approvedBy: 'user-1',
      approvedAt: new Date().toISOString(),
    });

    const res = await request(app).post(
      '/api/expenses/00000000-0000-0000-0000-000000000001/approve'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
    expect(res.body.data.approvedBy).toBe('user-1');
  });

  it('rejects approval of non-SUBMITTED expense', async () => {
    (prisma.expense.findUnique as jest.Mock).mockResolvedValue({
      ...sampleExpense,
      status: 'DRAFT',
    });
    const res = await request(app).post(
      '/api/expenses/00000000-0000-0000-0000-000000000001/approve'
    );
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/expenses/:id/reject
// ---------------------------------------------------------------------------
describe('POST /api/expenses/:id/reject', () => {
  it('transitions SUBMITTED to REJECTED', async () => {
    (prisma.expense.findUnique as jest.Mock).mockResolvedValue({
      ...sampleExpense,
      status: 'SUBMITTED',
    });
    (prisma.expense.update as jest.Mock).mockResolvedValue({
      ...sampleExpense,
      status: 'REJECTED',
    });

    const res = await request(app).post(
      '/api/expenses/00000000-0000-0000-0000-000000000001/reject'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REJECTED');
  });

  it('rejects rejection of non-SUBMITTED expense', async () => {
    (prisma.expense.findUnique as jest.Mock).mockResolvedValue({
      ...sampleExpense,
      status: 'APPROVED',
    });
    const res = await request(app).post(
      '/api/expenses/00000000-0000-0000-0000-000000000001/reject'
    );
    expect(res.status).toBe(400);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.expense.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.expense.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/expenses').send({
      title: 'AWS Hosting',
      amount: 250,
      category: 'SOFTWARE',
      vendor: 'Amazon',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
