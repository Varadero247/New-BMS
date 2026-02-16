import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finJournalEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    finJournalLine: {
      deleteMany: jest.fn(),
    },
    finPeriod: {
      findUnique: jest.fn(),
    },
    finAccount: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
    FinJournalEntryWhereInput: {},
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

import router from '../src/routes/journal';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/journal', router);

const ACC_UUID_1 = '550e8400-e29b-41d4-a716-446655440001';
const ACC_UUID_2 = '550e8400-e29b-41d4-a716-446655440002';
const PERIOD_UUID = '550e8400-e29b-41d4-a716-446655440010';

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/journal
// ===================================================================

describe('GET /api/journal', () => {
  it('should return a list of journal entries', async () => {
    const entries = [
      {
        id: 'je-1',
        reference: 'FIN-JE-2601-1234',
        date: '2026-01-15',
        status: 'POSTED',
        lines: [],
        period: { id: PERIOD_UUID, name: 'Jan 2026', status: 'OPEN' },
      },
    ];
    (prisma as any).finJournalEntry.findMany.mockResolvedValue(entries);
    (prisma as any).finJournalEntry.count.mockResolvedValue(1);

    const res = await request(app).get('/api/journal');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    (prisma as any).finJournalEntry.findMany.mockResolvedValue([]);
    (prisma as any).finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get('/api/journal?status=POSTED');

    expect(res.status).toBe(200);
  });

  it('should filter by periodId', async () => {
    (prisma as any).finJournalEntry.findMany.mockResolvedValue([]);
    (prisma as any).finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get(`/api/journal?periodId=${PERIOD_UUID}`);

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    (prisma as any).finJournalEntry.findMany.mockResolvedValue([]);
    (prisma as any).finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get('/api/journal?dateFrom=2026-01-01&dateTo=2026-01-31');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).finJournalEntry.findMany.mockResolvedValue([]);
    (prisma as any).finJournalEntry.count.mockResolvedValue(100);

    const res = await request(app).get('/api/journal?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finJournalEntry.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/journal');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/journal/:id
// ===================================================================

describe('GET /api/journal/:id', () => {
  it('should return a single journal entry with lines', async () => {
    const entry = {
      id: 'je-1',
      reference: 'FIN-JE-2601-1234',
      lines: [
        { id: 'line-1', lineNumber: 1, debit: 1000, credit: 0, account: { id: ACC_UUID_1, code: '1000', name: 'Cash', type: 'ASSET', normalBalance: 'DEBIT' } },
        { id: 'line-2', lineNumber: 2, debit: 0, credit: 1000, account: { id: ACC_UUID_2, code: '4000', name: 'Revenue', type: 'INCOME', normalBalance: 'CREDIT' } },
      ],
      period: { id: PERIOD_UUID, name: 'Jan 2026', status: 'OPEN' },
    };
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue(entry);

    const res = await request(app).get('/api/journal/je-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('je-1');
    expect(res.body.data.lines).toHaveLength(2);
  });

  it('should return 404 when entry not found', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/journal/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Journal entry not found');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finJournalEntry.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/journal/je-1');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/journal
// ===================================================================

describe('POST /api/journal', () => {
  const validEntry = {
    date: '2026-01-15',
    periodId: PERIOD_UUID,
    description: 'Monthly revenue recognition',
    lines: [
      { accountId: ACC_UUID_1, debit: 1000, credit: 0 },
      { accountId: ACC_UUID_2, debit: 0, credit: 1000 },
    ],
  };

  it('should create a journal entry successfully', async () => {
    (prisma as any).finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, name: 'Jan 2026', status: 'OPEN' });
    (prisma as any).finAccount.findMany.mockResolvedValue([
      { id: ACC_UUID_1 },
      { id: ACC_UUID_2 },
    ]);
    (prisma as any).finJournalEntry.create.mockResolvedValue({
      id: 'je-new',
      reference: 'FIN-JE-2601-5678',
      status: 'DRAFT',
      totalDebit: 1000,
      totalCredit: 1000,
      lines: [],
      period: { id: PERIOD_UUID, name: 'Jan 2026' },
    });

    const res = await request(app).post('/api/journal').send(validEntry);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('je-new');
  });

  it('should return 400 for validation error (missing periodId)', async () => {
    const res = await request(app).post('/api/journal').send({
      date: '2026-01-15',
      description: 'Test',
      lines: [
        { accountId: ACC_UUID_1, debit: 1000, credit: 0 },
        { accountId: ACC_UUID_2, debit: 0, credit: 1000 },
      ],
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when fewer than 2 lines', async () => {
    const res = await request(app).post('/api/journal').send({
      date: '2026-01-15',
      periodId: PERIOD_UUID,
      description: 'Test',
      lines: [
        { accountId: ACC_UUID_1, debit: 1000, credit: 0 },
      ],
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 when debits do not equal credits', async () => {
    (prisma as any).finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });
    (prisma as any).finAccount.findMany.mockResolvedValue([{ id: ACC_UUID_1 }, { id: ACC_UUID_2 }]);

    const res = await request(app).post('/api/journal').send({
      ...validEntry,
      lines: [
        { accountId: ACC_UUID_1, debit: 1000, credit: 0 },
        { accountId: ACC_UUID_2, debit: 0, credit: 500 },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Debits');
  });

  it('should return 400 when a line has both debit and credit', async () => {
    (prisma as any).finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });

    const res = await request(app).post('/api/journal').send({
      ...validEntry,
      lines: [
        { accountId: ACC_UUID_1, debit: 500, credit: 500 },
        { accountId: ACC_UUID_2, debit: 0, credit: 1000 },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('cannot have both debit and credit');
  });

  it('should return 400 when a line has neither debit nor credit', async () => {
    (prisma as any).finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });

    const res = await request(app).post('/api/journal').send({
      ...validEntry,
      lines: [
        { accountId: ACC_UUID_1, debit: 0, credit: 0 },
        { accountId: ACC_UUID_2, debit: 0, credit: 1000 },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('must have either debit or credit');
  });

  it('should return 404 when period not found', async () => {
    (prisma as any).finPeriod.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/journal').send(validEntry);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Accounting period not found');
  });

  it('should return 400 when period is not OPEN', async () => {
    (prisma as any).finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'CLOSED' });

    const res = await request(app).post('/api/journal').send(validEntry);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('CLOSED period');
  });

  it('should return 400 when account not found or inactive', async () => {
    (prisma as any).finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });
    (prisma as any).finAccount.findMany.mockResolvedValue([{ id: ACC_UUID_1 }]); // missing ACC_UUID_2

    const res = await request(app).post('/api/journal').send(validEntry);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid or inactive account(s)');
  });

  it('should return 500 on unexpected error', async () => {
    (prisma as any).finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });
    (prisma as any).finAccount.findMany.mockResolvedValue([{ id: ACC_UUID_1 }, { id: ACC_UUID_2 }]);
    (prisma as any).finJournalEntry.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/journal').send(validEntry);

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/journal/:id
// ===================================================================

describe('PUT /api/journal/:id', () => {
  it('should update a DRAFT journal entry (no lines)', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({ id: 'je-1', status: 'DRAFT' });
    (prisma as any).finJournalEntry.update.mockResolvedValue({
      id: 'je-1',
      description: 'Updated description',
      lines: [],
    });

    const res = await request(app).put('/api/journal/je-1').send({ description: 'Updated description' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update a DRAFT entry with new lines via transaction', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({ id: 'je-1', status: 'DRAFT' });
    (prisma as any).finAccount.findMany.mockResolvedValue([{ id: ACC_UUID_1 }, { id: ACC_UUID_2 }]);
    (prisma as any).$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        finJournalLine: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
        finJournalEntry: {
          update: jest.fn().mockResolvedValue({
            id: 'je-1',
            totalDebit: 500,
            totalCredit: 500,
            lines: [],
          }),
        },
      };
      return fn(tx);
    });

    const res = await request(app).put('/api/journal/je-1').send({
      lines: [
        { accountId: ACC_UUID_1, debit: 500, credit: 0 },
        { accountId: ACC_UUID_2, debit: 0, credit: 500 },
      ],
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when entry not found', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).put('/api/journal/nonexistent').send({ description: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when entry is not DRAFT', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({ id: 'je-1', status: 'POSTED' });

    const res = await request(app).put('/api/journal/je-1').send({ description: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Only DRAFT entries can be updated');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({ id: 'je-1', status: 'DRAFT' });
    (prisma as any).finJournalEntry.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/journal/je-1').send({ description: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// DELETE /api/journal/:id
// ===================================================================

describe('DELETE /api/journal/:id', () => {
  it('should delete a DRAFT journal entry', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({ id: 'je-1', status: 'DRAFT' });
    (prisma as any).$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        finJournalLine: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
        finJournalEntry: { delete: jest.fn().mockResolvedValue({ id: 'je-1' }) },
      };
      return fn(tx);
    });

    const res = await request(app).delete('/api/journal/je-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when entry not found', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).delete('/api/journal/nonexistent');

    expect(res.status).toBe(404);
  });

  it('should return 409 when entry is not DRAFT (e.g. POSTED)', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({ id: 'je-1', status: 'POSTED' });

    const res = await request(app).delete('/api/journal/je-1');

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('DRAFT');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({ id: 'je-1', status: 'DRAFT' });
    (prisma as any).$transaction.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/journal/je-1');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/journal/:id/post
// ===================================================================

describe('POST /api/journal/:id/post', () => {
  it('should post a DRAFT entry', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({
      id: 'je-1',
      status: 'DRAFT',
      period: { id: PERIOD_UUID, status: 'OPEN' },
    });
    (prisma as any).finJournalEntry.update.mockResolvedValue({
      id: 'je-1',
      status: 'POSTED',
      lines: [],
      period: { id: PERIOD_UUID, name: 'Jan 2026' },
    });

    const res = await request(app).post('/api/journal/je-1/post');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('POSTED');
  });

  it('should return 404 when entry not found', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/journal/nonexistent/post');

    expect(res.status).toBe(404);
  });

  it('should return 400 when entry is already POSTED', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({
      id: 'je-1',
      status: 'POSTED',
      period: { id: PERIOD_UUID, status: 'OPEN' },
    });

    const res = await request(app).post('/api/journal/je-1/post');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already POSTED');
  });

  it('should return 400 when period is not OPEN', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({
      id: 'je-1',
      status: 'DRAFT',
      period: { id: PERIOD_UUID, status: 'CLOSED' },
    });

    const res = await request(app).post('/api/journal/je-1/post');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('CLOSED period');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finJournalEntry.findUnique.mockResolvedValue({
      id: 'je-1',
      status: 'DRAFT',
      period: { id: PERIOD_UUID, status: 'OPEN' },
    });
    (prisma as any).finJournalEntry.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/journal/je-1/post');

    expect(res.status).toBe(500);
  });
});
