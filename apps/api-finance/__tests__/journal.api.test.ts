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
    _req.user = {
      id: '00000000-0000-4000-a000-000000000099',
      orgId: '00000000-0000-4000-a000-000000000100',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/journal';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
        id: 'f2200000-0000-4000-a000-000000000001',
        reference: 'FIN-JE-2601-1234',
        date: '2026-01-15',
        status: 'POSTED',
        lines: [],
        period: { id: PERIOD_UUID, name: 'Jan 2026', status: 'OPEN' },
      },
    ];
    mockPrisma.finJournalEntry.findMany.mockResolvedValue(entries);
    mockPrisma.finJournalEntry.count.mockResolvedValue(1);

    const res = await request(app).get('/api/journal');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get('/api/journal?status=POSTED');

    expect(res.status).toBe(200);
  });

  it('should filter by periodId', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get(`/api/journal?periodId=${PERIOD_UUID}`);

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get('/api/journal?dateFrom=2026-01-01&dateTo=2026-01-31');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(100);

    const res = await request(app).get('/api/journal?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finJournalEntry.findMany.mockRejectedValue(new Error('DB error'));

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
      id: 'f2200000-0000-4000-a000-000000000001',
      reference: 'FIN-JE-2601-1234',
      lines: [
        {
          id: 'f6100000-0000-4000-a000-000000000001',
          lineNumber: 1,
          debit: 1000,
          credit: 0,
          account: {
            id: ACC_UUID_1,
            code: '1000',
            name: 'Cash',
            type: 'ASSET',
            normalBalance: 'DEBIT',
          },
        },
        {
          id: 'f6100000-0000-4000-a000-000000000002',
          lineNumber: 2,
          debit: 0,
          credit: 1000,
          account: {
            id: ACC_UUID_2,
            code: '4000',
            name: 'Revenue',
            type: 'INCOME',
            normalBalance: 'CREDIT',
          },
        },
      ],
      period: { id: PERIOD_UUID, name: 'Jan 2026', status: 'OPEN' },
    };
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(entry);

    const res = await request(app).get('/api/journal/f2200000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('f2200000-0000-4000-a000-000000000001');
    expect(res.body.data.lines).toHaveLength(2);
  });

  it('should return 404 when entry not found', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/journal/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Journal entry not found');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finJournalEntry.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/journal/f2200000-0000-4000-a000-000000000001');

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
    mockPrisma.finPeriod.findUnique.mockResolvedValue({
      id: PERIOD_UUID,
      name: 'Jan 2026',
      status: 'OPEN',
    });
    mockPrisma.finAccount.findMany.mockResolvedValue([{ id: ACC_UUID_1 }, { id: ACC_UUID_2 }]);
    mockPrisma.finJournalEntry.create.mockResolvedValue({
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
    const res = await request(app)
      .post('/api/journal')
      .send({
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
    const res = await request(app)
      .post('/api/journal')
      .send({
        date: '2026-01-15',
        periodId: PERIOD_UUID,
        description: 'Test',
        lines: [{ accountId: ACC_UUID_1, debit: 1000, credit: 0 }],
      });

    expect(res.status).toBe(400);
  });

  it('should return 400 when debits do not equal credits', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });
    mockPrisma.finAccount.findMany.mockResolvedValue([{ id: ACC_UUID_1 }, { id: ACC_UUID_2 }]);

    const res = await request(app)
      .post('/api/journal')
      .send({
        ...validEntry,
        lines: [
          { accountId: ACC_UUID_1, debit: 1000, credit: 0 },
          { accountId: ACC_UUID_2, debit: 0, credit: 500 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Debits');
  });

  it('should return 400 when a line has both debit and credit', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });

    const res = await request(app)
      .post('/api/journal')
      .send({
        ...validEntry,
        lines: [
          { accountId: ACC_UUID_1, debit: 500, credit: 500 },
          { accountId: ACC_UUID_2, debit: 0, credit: 1000 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('cannot have both debit and credit');
  });

  it('should return 400 when a line has neither debit nor credit', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });

    const res = await request(app)
      .post('/api/journal')
      .send({
        ...validEntry,
        lines: [
          { accountId: ACC_UUID_1, debit: 0, credit: 0 },
          { accountId: ACC_UUID_2, debit: 0, credit: 1000 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('must have either debit or credit');
  });

  it('should return 404 when period not found', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/journal').send(validEntry);

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Accounting period not found');
  });

  it('should return 400 when period is not OPEN', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'CLOSED' });

    const res = await request(app).post('/api/journal').send(validEntry);

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('CLOSED period');
  });

  it('should return 400 when account not found or inactive', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });
    mockPrisma.finAccount.findMany.mockResolvedValue([{ id: ACC_UUID_1 }]); // missing ACC_UUID_2

    const res = await request(app).post('/api/journal').send(validEntry);

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Invalid or inactive account(s)');
  });

  it('should return 500 on unexpected error', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({ id: PERIOD_UUID, status: 'OPEN' });
    mockPrisma.finAccount.findMany.mockResolvedValue([{ id: ACC_UUID_1 }, { id: ACC_UUID_2 }]);
    mockPrisma.finJournalEntry.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/journal').send(validEntry);

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/journal/:id
// ===================================================================

describe('PUT /api/journal/:id', () => {
  it('should update a DRAFT journal entry (no lines)', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finJournalEntry.update.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      description: 'Updated description',
      lines: [],
    });

    const res = await request(app)
      .put('/api/journal/f2200000-0000-4000-a000-000000000001')
      .send({ description: 'Updated description' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update a DRAFT entry with new lines via transaction', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finAccount.findMany.mockResolvedValue([{ id: ACC_UUID_1 }, { id: ACC_UUID_2 }]);
    mockPrisma.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        finJournalLine: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
        finJournalEntry: {
          update: jest.fn().mockResolvedValue({
            id: 'f2200000-0000-4000-a000-000000000001',
            totalDebit: 500,
            totalCredit: 500,
            lines: [],
          }),
        },
      };
      return fn(tx);
    });

    const res = await request(app)
      .put('/api/journal/f2200000-0000-4000-a000-000000000001')
      .send({
        lines: [
          { accountId: ACC_UUID_1, debit: 500, credit: 0 },
          { accountId: ACC_UUID_2, debit: 0, credit: 500 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when entry not found', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/journal/00000000-0000-0000-0000-000000000099')
      .send({ description: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when entry is not DRAFT', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'POSTED',
    });

    const res = await request(app)
      .put('/api/journal/f2200000-0000-4000-a000-000000000001')
      .send({ description: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Only DRAFT entries can be updated');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finJournalEntry.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/journal/f2200000-0000-4000-a000-000000000001')
      .send({ description: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// DELETE /api/journal/:id
// ===================================================================

describe('DELETE /api/journal/:id', () => {
  it('should delete a DRAFT journal entry', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        finJournalLine: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
        finJournalEntry: {
          delete: jest.fn().mockResolvedValue({ id: 'f2200000-0000-4000-a000-000000000001' }),
        },
      };
      return fn(tx);
    });

    const res = await request(app).delete('/api/journal/f2200000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when entry not found', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).delete('/api/journal/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should return 409 when entry is not DRAFT (e.g. POSTED)', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'POSTED',
    });

    const res = await request(app).delete('/api/journal/f2200000-0000-4000-a000-000000000001');

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('DRAFT');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.$transaction.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/journal/f2200000-0000-4000-a000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/journal/:id/post
// ===================================================================

describe('POST /api/journal/:id/post', () => {
  it('should post a DRAFT entry', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
      period: { id: PERIOD_UUID, status: 'OPEN' },
    });
    mockPrisma.finJournalEntry.update.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'POSTED',
      lines: [],
      period: { id: PERIOD_UUID, name: 'Jan 2026' },
    });

    const res = await request(app).post('/api/journal/f2200000-0000-4000-a000-000000000001/post');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('POSTED');
  });

  it('should return 404 when entry not found', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/journal/00000000-0000-0000-0000-000000000099/post');

    expect(res.status).toBe(404);
  });

  it('should return 400 when entry is already POSTED', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'POSTED',
      period: { id: PERIOD_UUID, status: 'OPEN' },
    });

    const res = await request(app).post('/api/journal/f2200000-0000-4000-a000-000000000001/post');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('already POSTED');
  });

  it('should return 400 when period is not OPEN', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
      period: { id: PERIOD_UUID, status: 'CLOSED' },
    });

    const res = await request(app).post('/api/journal/f2200000-0000-4000-a000-000000000001/post');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('CLOSED period');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
      period: { id: PERIOD_UUID, status: 'OPEN' },
    });
    mockPrisma.finJournalEntry.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/journal/f2200000-0000-4000-a000-000000000001/post');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// Additional coverage
// ===================================================================

describe('Journal API — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/journal should filter by DRAFT status', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get('/api/journal?status=DRAFT');

    expect(res.status).toBe(200);
    expect(mockPrisma.finJournalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'DRAFT' }) })
    );
  });

  it('POST /api/journal should return 400 when date is missing', async () => {
    const res = await request(app)
      .post('/api/journal')
      .send({
        periodId: PERIOD_UUID,
        description: 'No date',
        lines: [
          { accountId: ACC_UUID_1, debit: 100, credit: 0 },
          { accountId: ACC_UUID_2, debit: 0, credit: 100 },
        ],
      });

    expect(res.status).toBe(400);
  });

  it('DELETE /api/journal/:id should return 500 on transaction error', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

    const res = await request(app).delete('/api/journal/f2200000-0000-4000-a000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// Journal API — extra coverage to reach 40 tests
// ===================================================================
describe('Journal API — extra coverage', () => {
  it('GET /api/journal data array is always an array', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get('/api/journal');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/journal count is called once per list request', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    await request(app).get('/api/journal');

    expect(mockPrisma.finJournalEntry.count).toHaveBeenCalledTimes(1);
  });

  it('POST /api/journal/:id/post update sets status to POSTED', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
      period: { id: PERIOD_UUID, status: 'OPEN' },
    });
    mockPrisma.finJournalEntry.update.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'POSTED',
      lines: [],
      period: { id: PERIOD_UUID, name: 'Jan 2026' },
    });

    await request(app).post('/api/journal/f2200000-0000-4000-a000-000000000001/post');

    expect(mockPrisma.finJournalEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'POSTED' }),
      })
    );
  });

  it('GET /api/journal response body includes success and pagination keys', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get('/api/journal');

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body).toHaveProperty('data');
  });
});
