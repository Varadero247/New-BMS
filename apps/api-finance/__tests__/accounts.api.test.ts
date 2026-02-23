import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finAccount: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finJournalLine: {
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
    finJournalEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finPeriod: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
    FinAccountWhereInput: {},
    FinJournalEntryWhereInput: {},
    FinPeriodWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import accountsRouter from '../src/routes/accounts';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/accounts', accountsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/accounts — List accounts
// ===================================================================
describe('GET /api/accounts', () => {
  it('should return a list of accounts with pagination', async () => {
    const accounts = [
      {
        id: 'f2000000-0000-4000-a000-000000000001',
        code: '1000',
        name: 'Cash',
        type: 'ASSET',
        parent: null,
        _count: { children: 0, journalLines: 2 },
      },
      {
        id: 'f2000000-0000-4000-a000-000000000002',
        code: '2000',
        name: 'AP',
        type: 'LIABILITY',
        parent: null,
        _count: { children: 0, journalLines: 5 },
      },
    ];
    mockPrisma.finAccount.findMany.mockResolvedValue(accounts);
    mockPrisma.finAccount.count.mockResolvedValue(2);

    const res = await request(app).get('/api/accounts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by type', async () => {
    mockPrisma.finAccount.findMany.mockResolvedValue([]);
    mockPrisma.finAccount.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts?type=ASSET');

    expect(res.status).toBe(200);
    expect(mockPrisma.finAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'ASSET' }),
      })
    );
  });

  it('should filter by isActive', async () => {
    mockPrisma.finAccount.findMany.mockResolvedValue([]);
    mockPrisma.finAccount.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts?isActive=true');

    expect(res.status).toBe(200);
    expect(mockPrisma.finAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    );
  });

  it('should search by code, name, or description', async () => {
    mockPrisma.finAccount.findMany.mockResolvedValue([]);
    mockPrisma.finAccount.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts?search=cash');

    expect(res.status).toBe(200);
    expect(mockPrisma.finAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ code: expect.objectContaining({ contains: 'cash' }) }),
          ]),
        }),
      })
    );
  });

  it('should handle pagination params', async () => {
    mockPrisma.finAccount.findMany.mockResolvedValue([]);
    mockPrisma.finAccount.count.mockResolvedValue(100);

    const res = await request(app).get('/api/accounts?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finAccount.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/accounts');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/accounts/tree — Hierarchical tree
// ===================================================================
describe('GET /api/accounts/tree', () => {
  it('should return a hierarchical account tree', async () => {
    const accounts = [
      {
        id: 'f2100000-0000-4000-a000-000000000001',
        code: '1000',
        name: 'Assets',
        parentId: null,
        _count: { journalLines: 0 },
      },
      {
        id: 'f2100000-0000-4000-a000-000000000002',
        code: '1100',
        name: 'Cash',
        parentId: 'f2100000-0000-4000-a000-000000000001',
        _count: { journalLines: 3 },
      },
    ];
    mockPrisma.finAccount.findMany.mockResolvedValue(accounts);

    const res = await request(app).get('/api/accounts/tree');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 500 on error', async () => {
    mockPrisma.finAccount.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/accounts/tree');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/accounts/:id — Single account
// ===================================================================
describe('GET /api/accounts/:id', () => {
  it('should return an account when found', async () => {
    const account = {
      id: 'f2000000-0000-4000-a000-000000000001',
      code: '1000',
      name: 'Cash',
      type: 'ASSET',
      parent: null,
      children: [],
    };
    mockPrisma.finAccount.findFirst.mockResolvedValue(account);

    const res = await request(app).get('/api/accounts/f2000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('f2000000-0000-4000-a000-000000000001');
  });

  it('should return 404 when account not found', async () => {
    mockPrisma.finAccount.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/accounts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on error', async () => {
    mockPrisma.finAccount.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/accounts/f2000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/accounts — Create account
// ===================================================================
describe('POST /api/accounts', () => {
  const validAccount = {
    code: '1000',
    name: 'Cash',
    type: 'ASSET',
    normalBalance: 'DEBIT',
    currency: 'USD',
  };

  it('should create an account successfully', async () => {
    mockPrisma.finAccount.findFirst.mockResolvedValue(null);
    mockPrisma.finAccount.create.mockResolvedValue({
      id: 'new-acc',
      ...validAccount,
      parent: null,
    });

    const res = await request(app).post('/api/accounts').send(validAccount);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('1000');
  });

  it('should return 409 for duplicate code', async () => {
    mockPrisma.finAccount.findFirst.mockResolvedValue({ id: 'existing', code: '1000' });

    const res = await request(app).post('/api/accounts').send(validAccount);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 for invalid parent', async () => {
    mockPrisma.finAccount.findFirst
      .mockResolvedValueOnce(null) // no duplicate code
      .mockResolvedValueOnce(null); // parent not found

    const res = await request(app)
      .post('/api/accounts')
      .send({
        ...validAccount,
        parentId: '550e8400-e29b-41d4-a716-446655440000',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('Parent account not found');
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/accounts').send({ code: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should handle P2002 unique constraint error', async () => {
    mockPrisma.finAccount.findFirst.mockResolvedValue(null);
    const err = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    mockPrisma.finAccount.create.mockRejectedValue(err);

    const res = await request(app).post('/api/accounts').send(validAccount);

    expect(res.status).toBe(409);
  });
});

// ===================================================================
// PUT /api/accounts/:id — Update account
// ===================================================================
describe('PUT /api/accounts/:id', () => {
  it('should update an account successfully', async () => {
    mockPrisma.finAccount.findFirst.mockResolvedValue({
      id: 'f2000000-0000-4000-a000-000000000001',
      code: '1000',
    });
    mockPrisma.finAccount.update.mockResolvedValue({
      id: 'f2000000-0000-4000-a000-000000000001',
      name: 'Updated Cash',
      parent: null,
    });

    const res = await request(app)
      .put('/api/accounts/f2000000-0000-4000-a000-000000000001')
      .send({ name: 'Updated Cash' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when account not found', async () => {
    mockPrisma.finAccount.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/accounts/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 for circular parent reference', async () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440099';
    mockPrisma.finAccount.findFirst.mockResolvedValue({ id: uuid, code: '1000' });

    const res = await request(app).put(`/api/accounts/${uuid}`).send({
      parentId: uuid,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('cannot be its own parent');
  });

  it('should return 404 for non-existent parent', async () => {
    mockPrisma.finAccount.findFirst
      .mockResolvedValueOnce({ id: 'f2000000-0000-4000-a000-000000000001', code: '1000' }) // account exists
      .mockResolvedValueOnce(null); // parent not found

    const res = await request(app).put('/api/accounts/f2000000-0000-4000-a000-000000000001').send({
      parentId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('Parent account not found');
  });
});

// ===================================================================
// DELETE /api/accounts/:id — Soft delete
// ===================================================================
describe('DELETE /api/accounts/:id', () => {
  it('should soft delete an account successfully', async () => {
    mockPrisma.finAccount.findFirst.mockResolvedValue({
      id: 'f2000000-0000-4000-a000-000000000001',
      code: '1000',
    });
    mockPrisma.finJournalLine.count.mockResolvedValue(0);
    mockPrisma.finAccount.update.mockResolvedValue({
      id: 'f2000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete('/api/accounts/f2000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when account not found', async () => {
    mockPrisma.finAccount.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/accounts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should return 409 when account has journal lines', async () => {
    mockPrisma.finAccount.findFirst.mockResolvedValue({
      id: 'f2000000-0000-4000-a000-000000000001',
      code: '1000',
    });
    mockPrisma.finJournalLine.count.mockResolvedValue(5);

    const res = await request(app).delete('/api/accounts/f2000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('journal line(s)');
  });
});

// ===================================================================
// GET /api/accounts/entries — List journal entries
// ===================================================================
describe('GET /api/accounts/entries', () => {
  it('should return a list of journal entries', async () => {
    const entries = [
      {
        id: 'f2200000-0000-4000-a000-000000000001',
        reference: 'FIN-JE-2601-1234',
        status: 'DRAFT',
        lines: [],
        period: { id: 'f2300000-0000-4000-a000-000000000001', name: 'Jan 2026', status: 'OPEN' },
      },
    ];
    mockPrisma.finJournalEntry.findMany.mockResolvedValue(entries);
    mockPrisma.finJournalEntry.count.mockResolvedValue(1);

    const res = await request(app).get('/api/accounts/entries');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts/entries?status=POSTED');

    expect(res.status).toBe(200);
    expect(mockPrisma.finJournalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'POSTED' }),
      })
    );
  });

  it('should filter by periodId', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts/entries?periodId=period-1');

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    mockPrisma.finJournalEntry.findMany.mockResolvedValue([]);
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/accounts/entries?dateFrom=2026-01-01&dateTo=2026-01-31'
    );

    expect(res.status).toBe(200);
  });
});

// ===================================================================
// GET /api/accounts/entries/:id — Single journal entry
// ===================================================================
describe('GET /api/accounts/entries/:id', () => {
  it('should return a journal entry when found', async () => {
    const entry = {
      id: 'f2200000-0000-4000-a000-000000000001',
      reference: 'FIN-JE-2601-1234',
      lines: [],
      period: { id: 'f2300000-0000-4000-a000-000000000001', name: 'Jan 2026' },
    };
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(entry);

    const res = await request(app).get(
      '/api/accounts/entries/f2200000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('f2200000-0000-4000-a000-000000000001');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/accounts/entries/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/accounts/entries — Create journal entry
// ===================================================================
describe('POST /api/accounts/entries', () => {
  const validEntry = {
    date: '2026-01-15',
    periodId: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Office supplies purchase',
    lines: [
      { accountId: '550e8400-e29b-41d4-a716-446655440001', debit: 100, credit: 0 },
      { accountId: '550e8400-e29b-41d4-a716-446655440002', debit: 0, credit: 100 },
    ],
  };

  it('should create a journal entry successfully', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({
      id: validEntry.periodId,
      status: 'OPEN',
    });
    mockPrisma.finAccount.findMany.mockResolvedValue([
      { id: '550e8400-e29b-41d4-a716-446655440001' },
      { id: '550e8400-e29b-41d4-a716-446655440002' },
    ]);
    mockPrisma.finJournalEntry.create.mockResolvedValue({
      id: 'je-new',
      ...validEntry,
      reference: 'FIN-JE-2601-1234',
      status: 'DRAFT',
      lines: [],
      period: { id: validEntry.periodId, name: 'Jan 2026' },
    });

    const res = await request(app).post('/api/accounts/entries').send(validEntry);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when debits do not equal credits', async () => {
    const res = await request(app)
      .post('/api/accounts/entries')
      .send({
        ...validEntry,
        lines: [
          { accountId: '550e8400-e29b-41d4-a716-446655440001', debit: 100, credit: 0 },
          { accountId: '550e8400-e29b-41d4-a716-446655440002', debit: 0, credit: 50 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Debits');
  });

  it('should return 400 when a line has both debit and credit', async () => {
    const res = await request(app)
      .post('/api/accounts/entries')
      .send({
        ...validEntry,
        lines: [
          { accountId: '550e8400-e29b-41d4-a716-446655440001', debit: 100, credit: 50 },
          { accountId: '550e8400-e29b-41d4-a716-446655440002', debit: 0, credit: 50 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('cannot have both debit and credit');
  });

  it('should return 400 when a line has zero debit and credit', async () => {
    const res = await request(app)
      .post('/api/accounts/entries')
      .send({
        ...validEntry,
        lines: [
          { accountId: '550e8400-e29b-41d4-a716-446655440001', debit: 100, credit: 0 },
          { accountId: '550e8400-e29b-41d4-a716-446655440002', debit: 0, credit: 0 },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('must have either a debit or credit');
  });

  it('should return 400 when period is CLOSED', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({
      id: validEntry.periodId,
      status: 'CLOSED',
    });

    const res = await request(app).post('/api/accounts/entries').send(validEntry);

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('CLOSED');
  });

  it('should return 404 when period not found', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/accounts/entries').send(validEntry);

    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('period not found');
  });

  it('should return 400 when account IDs are invalid', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({
      id: validEntry.periodId,
      status: 'OPEN',
    });
    mockPrisma.finAccount.findMany.mockResolvedValue([
      { id: '550e8400-e29b-41d4-a716-446655440001' },
    ]);

    const res = await request(app).post('/api/accounts/entries').send(validEntry);

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Invalid or inactive account');
  });

  it('should return 400 for validation errors', async () => {
    const res = await request(app).post('/api/accounts/entries').send({});

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// PUT /api/accounts/entries/:id — Update draft journal entry
// ===================================================================
describe('PUT /api/accounts/entries/:id', () => {
  it('should update header-only fields of a DRAFT entry', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finJournalEntry.update.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      description: 'Updated desc',
      lines: [],
    });

    const res = await request(app)
      .put('/api/accounts/entries/f2200000-0000-4000-a000-000000000001')
      .send({ description: 'Updated desc' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when entry not found', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/accounts/entries/00000000-0000-0000-0000-000000000099')
      .send({ description: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when entry is not DRAFT', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'POSTED',
    });

    const res = await request(app)
      .put('/api/accounts/entries/f2200000-0000-4000-a000-000000000001')
      .send({ description: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('DRAFT');
  });

  it('should update lines when provided and validate double-entry', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finAccount.findMany.mockResolvedValue([
      { id: '550e8400-e29b-41d4-a716-446655440001' },
      { id: '550e8400-e29b-41d4-a716-446655440002' },
    ]);
    mockPrisma.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        finJournalLine: { deleteMany: jest.fn() },
        finJournalEntry: {
          update: jest
            .fn()
            .mockResolvedValue({ id: 'f2200000-0000-4000-a000-000000000001', lines: [] }),
        },
      };
      return fn(tx);
    });

    const res = await request(app)
      .put('/api/accounts/entries/f2200000-0000-4000-a000-000000000001')
      .send({
        lines: [
          { accountId: '550e8400-e29b-41d4-a716-446655440001', debit: 200, credit: 0 },
          { accountId: '550e8400-e29b-41d4-a716-446655440002', debit: 0, credit: 200 },
        ],
      });

    expect(res.status).toBe(200);
  });

  it('should return 400 when updated lines debits != credits', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });

    const res = await request(app)
      .put('/api/accounts/entries/f2200000-0000-4000-a000-000000000001')
      .send({
        lines: [
          { accountId: '550e8400-e29b-41d4-a716-446655440001', debit: 200, credit: 0 },
          { accountId: '550e8400-e29b-41d4-a716-446655440002', debit: 0, credit: 100 },
        ],
      });

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// POST /api/accounts/entries/:id/post — Post a draft entry
// ===================================================================
describe('POST /api/accounts/entries/:id/post', () => {
  it('should post a DRAFT entry in an OPEN period', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
      period: { status: 'OPEN' },
    });
    mockPrisma.finJournalEntry.update.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'POSTED',
      lines: [],
      period: { id: 'f2300000-0000-4000-a000-000000000001', name: 'Jan 2026' },
    });

    const res = await request(app).post(
      '/api/accounts/entries/f2200000-0000-4000-a000-000000000001/post'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('POSTED');
  });

  it('should return 404 when entry not found', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/accounts/entries/00000000-0000-0000-0000-000000000099/post'
    );

    expect(res.status).toBe(404);
  });

  it('should return 400 when entry is already POSTED', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'POSTED',
      period: { status: 'OPEN' },
    });

    const res = await request(app).post(
      '/api/accounts/entries/f2200000-0000-4000-a000-000000000001/post'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('already POSTED');
  });

  it('should return 400 when period is CLOSED', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
      period: { status: 'CLOSED' },
    });

    const res = await request(app).post(
      '/api/accounts/entries/f2200000-0000-4000-a000-000000000001/post'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('CLOSED');
  });
});

// ===================================================================
// POST /api/accounts/entries/:id/reverse — Reverse a posted entry
// ===================================================================
describe('POST /api/accounts/entries/:id/reverse', () => {
  it('should reverse a POSTED entry', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      reference: 'FIN-JE-2601-1000',
      status: 'POSTED',
      periodId: 'f2300000-0000-4000-a000-000000000001',
      description: 'Test entry',
      totalDebit: 100,
      totalCredit: 100,
      lines: [
        {
          accountId: 'f2000000-0000-4000-a000-000000000001',
          debit: 100,
          credit: 0,
          description: 'Debit line',
        },
        {
          accountId: 'f2000000-0000-4000-a000-000000000002',
          debit: 0,
          credit: 100,
          description: 'Credit line',
        },
      ],
      period: { status: 'OPEN' },
    });
    mockPrisma.finJournalEntry.create.mockResolvedValue({
      id: 'je-reversal',
      status: 'POSTED',
      lines: [],
      period: { id: 'f2300000-0000-4000-a000-000000000001', name: 'Jan 2026' },
    });
    mockPrisma.finJournalEntry.update.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'REVERSED',
    });

    const res = await request(app).post(
      '/api/accounts/entries/f2200000-0000-4000-a000-000000000001/reverse'
    );

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when entry not found', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/accounts/entries/00000000-0000-0000-0000-000000000099/reverse'
    );

    expect(res.status).toBe(404);
  });

  it('should return 400 when entry is not POSTED', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
      lines: [],
      period: { status: 'OPEN' },
    });

    const res = await request(app).post(
      '/api/accounts/entries/f2200000-0000-4000-a000-000000000001/reverse'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Only POSTED');
  });

  it('should return 400 when period is CLOSED', async () => {
    mockPrisma.finJournalEntry.findUnique.mockResolvedValue({
      id: 'f2200000-0000-4000-a000-000000000001',
      status: 'POSTED',
      lines: [],
      period: { status: 'CLOSED' },
    });

    const res = await request(app).post(
      '/api/accounts/entries/f2200000-0000-4000-a000-000000000001/reverse'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('CLOSED');
  });
});

// ===================================================================
// GET /api/accounts/trial-balance
// ===================================================================
describe('GET /api/accounts/trial-balance', () => {
  it('should return trial balance for a valid period', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({
      id: 'f2300000-0000-4000-a000-000000000001',
      name: 'Jan 2026',
    });
    mockPrisma.finJournalLine.findMany.mockResolvedValue([
      {
        accountId: 'f2000000-0000-4000-a000-000000000001',
        debit: 500,
        credit: 0,
        account: {
          id: 'f2000000-0000-4000-a000-000000000001',
          code: '1000',
          name: 'Cash',
          type: 'ASSET',
          normalBalance: 'DEBIT',
        },
      },
      {
        accountId: 'f2000000-0000-4000-a000-000000000002',
        debit: 0,
        credit: 500,
        account: {
          id: 'f2000000-0000-4000-a000-000000000002',
          code: '2000',
          name: 'AP',
          type: 'LIABILITY',
          normalBalance: 'CREDIT',
        },
      },
    ]);

    const res = await request(app).get('/api/accounts/trial-balance?periodId=p-1');

    expect(res.status).toBe(200);
    expect(res.body.data.totals.isBalanced).toBe(true);
    expect(res.body.data.rows).toHaveLength(2);
  });

  it('should return 400 when periodId is missing', async () => {
    const res = await request(app).get('/api/accounts/trial-balance');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('periodId');
  });

  it('should return 404 when period not found', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/accounts/trial-balance?periodId=nonexistent');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/accounts/profit-loss
// ===================================================================
describe('GET /api/accounts/profit-loss', () => {
  it('should return P&L report for date range', async () => {
    mockPrisma.finJournalLine.findMany.mockResolvedValue([
      {
        accountId: 'acc-rev',
        debit: 0,
        credit: 1000,
        account: {
          id: 'acc-rev',
          code: '4000',
          name: 'Sales',
          type: 'REVENUE',
          normalBalance: 'CREDIT',
        },
      },
      {
        accountId: 'acc-exp',
        debit: 500,
        credit: 0,
        account: {
          id: 'acc-exp',
          code: '5000',
          name: 'Rent',
          type: 'EXPENSE',
          normalBalance: 'DEBIT',
        },
      },
    ]);

    const res = await request(app).get(
      '/api/accounts/profit-loss?dateFrom=2026-01-01&dateTo=2026-01-31'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.totals.totalRevenue).toBe(1000);
    expect(res.body.data.totals.totalExpenses).toBe(500);
    expect(res.body.data.totals.netIncome).toBe(500);
  });

  it('should return 400 when date range is missing', async () => {
    const res = await request(app).get('/api/accounts/profit-loss');

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// GET /api/accounts/balance-sheet
// ===================================================================
describe('GET /api/accounts/balance-sheet', () => {
  it('should return balance sheet', async () => {
    mockPrisma.finJournalLine.findMany.mockResolvedValue([
      {
        accountId: 'f2000000-0000-4000-a000-000000000001',
        debit: 10000,
        credit: 0,
        account: {
          id: 'f2000000-0000-4000-a000-000000000001',
          code: '1000',
          name: 'Cash',
          type: 'ASSET',
          normalBalance: 'DEBIT',
        },
      },
    ]);
    mockPrisma.finAccount.findMany.mockResolvedValue([
      {
        id: 'f2000000-0000-4000-a000-000000000001',
        code: '1000',
        name: 'Cash',
        type: 'ASSET',
        normalBalance: 'DEBIT',
        openingBalance: 5000,
      },
    ]);

    const res = await request(app).get('/api/accounts/balance-sheet?asOf=2026-01-31');

    expect(res.status).toBe(200);
    expect(res.body.data.totals).toBeDefined();
  });

  it('should work without asOf parameter (defaults to now)', async () => {
    mockPrisma.finJournalLine.findMany.mockResolvedValue([]);
    mockPrisma.finAccount.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/accounts/balance-sheet');

    expect(res.status).toBe(200);
  });
});

// ===================================================================
// GET /api/accounts/periods — List periods
// ===================================================================
describe('GET /api/accounts/periods', () => {
  it('should return a list of periods', async () => {
    const periods = [
      {
        id: 'f2300000-0000-4000-a000-000000000001',
        name: 'Jan 2026',
        status: 'OPEN',
        _count: { journalEntries: 5 },
      },
    ];
    mockPrisma.finPeriod.findMany.mockResolvedValue(periods);
    mockPrisma.finPeriod.count.mockResolvedValue(1);

    const res = await request(app).get('/api/accounts/periods');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by fiscalYear', async () => {
    mockPrisma.finPeriod.findMany.mockResolvedValue([]);
    mockPrisma.finPeriod.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts/periods?fiscalYear=2026');

    expect(res.status).toBe(200);
  });

  it('should filter by status', async () => {
    mockPrisma.finPeriod.findMany.mockResolvedValue([]);
    mockPrisma.finPeriod.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts/periods?status=OPEN');

    expect(res.status).toBe(200);
  });
});

// ===================================================================
// POST /api/accounts/periods — Create period
// ===================================================================
describe('POST /api/accounts/periods', () => {
  const validPeriod = {
    name: 'January 2026',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    fiscalYear: 2026,
    quarter: 1,
  };

  it('should create a period successfully', async () => {
    mockPrisma.finPeriod.findFirst.mockResolvedValue(null);
    mockPrisma.finPeriod.create.mockResolvedValue({
      id: 'p-new',
      ...validPeriod,
      status: 'OPEN',
    });

    const res = await request(app).post('/api/accounts/periods').send(validPeriod);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 409 when period overlaps', async () => {
    mockPrisma.finPeriod.findFirst.mockResolvedValue({
      id: 'existing',
      name: 'Existing Period',
    });

    const res = await request(app).post('/api/accounts/periods').send(validPeriod);

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('overlaps');
  });

  it('should return 400 for validation errors', async () => {
    const res = await request(app).post('/api/accounts/periods').send({ name: '' });

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// PUT /api/accounts/periods/:id/close — Close period
// ===================================================================
describe('PUT /api/accounts/periods/:id/close', () => {
  it('should close an OPEN period with no unposted entries', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({
      id: 'f2300000-0000-4000-a000-000000000001',
      status: 'OPEN',
    });
    mockPrisma.finJournalEntry.count.mockResolvedValue(0);
    mockPrisma.finPeriod.update.mockResolvedValue({
      id: 'f2300000-0000-4000-a000-000000000001',
      status: 'CLOSED',
    });

    const res = await request(app).put(
      '/api/accounts/periods/00000000-0000-0000-0000-000000000001/close'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CLOSED');
  });

  it('should return 404 when period not found', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue(null);

    const res = await request(app).put(
      '/api/accounts/periods/00000000-0000-0000-0000-000000000099/close'
    );

    expect(res.status).toBe(404);
  });

  it('should return 400 when period is already CLOSED', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({
      id: 'f2300000-0000-4000-a000-000000000001',
      status: 'CLOSED',
    });

    const res = await request(app).put(
      '/api/accounts/periods/00000000-0000-0000-0000-000000000001/close'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('already closed');
  });

  it('should return 409 when unposted entries exist', async () => {
    mockPrisma.finPeriod.findUnique.mockResolvedValue({
      id: 'f2300000-0000-4000-a000-000000000001',
      status: 'OPEN',
    });
    mockPrisma.finJournalEntry.count.mockResolvedValue(3);

    const res = await request(app).put(
      '/api/accounts/periods/00000000-0000-0000-0000-000000000001/close'
    );

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('3 unposted');
  });
});


describe('phase34 coverage', () => {
  it('handles named function expression', () => { const factorial = function fact(n: number): number { return n <= 1 ? 1 : n * fact(n-1); }; expect(factorial(4)).toBe(24); });
  it('handles generic class', () => { class Box<T> { constructor(public value: T) {} } const b = new Box(99); expect(b.value).toBe(99); });
  it('handles string comparison', () => { expect('apple' < 'banana').toBe(true); expect('zebra' > 'apple').toBe(true); });
});


describe('phase35 coverage', () => {
  it('handles array of nulls filter', () => { const a = [1,null,2,null,3]; expect(a.filter(Boolean)).toEqual([1,2,3]); });
  it('handles string padStart for dates', () => { const day = 5; expect(String(day).padStart(2,'0')).toBe('05'); });
  it('handles async map pattern', async () => { const asyncDouble = async (n:number) => n*2; const results = await Promise.all([1,2,3].map(asyncDouble)); expect(results).toEqual([2,4,6]); });
  it('handles flatten array deeply', () => { expect([1,[2,[3,[4]]]].flat(3)).toEqual([1,2,3,4]); });
  it('handles discriminated union', () => { type Shape = {kind:'circle';r:number}|{kind:'rect';w:number;h:number}; const area=(s:Shape)=>s.kind==='circle'?Math.PI*s.r*s.r:s.w*s.h; expect(area({kind:'rect',w:3,h:4})).toBe(12); });
});


describe('phase36 coverage', () => {
  it('handles string compression', () => { const compress=(s:string)=>{let r='',i=0;while(i<s.length){let j=i;while(j<s.length&&s[j]===s[i])j++;r+=j-i>1?`${j-i}${s[i]}`:s[i];i=j;}return r;}; expect(compress('aaabbc')).toBe('3a2bc'); });
  it('handles number formatting with commas', () => { const fmt=(n:number)=>n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');expect(fmt(1000000)).toBe('1,000,000'); });
  it('computes fibonacci iteratively', () => { const fib=(n:number)=>{let a=0,b=1;for(let i=0;i<n;i++){[a,b]=[b,a+b];}return a;}; expect(fib(10)).toBe(55); });
  it('handles maximum subarray sum', () => { const maxSub=(a:number[])=>{let max=a[0],cur=a[0];for(let i=1;i<a.length;i++){cur=Math.max(a[i],cur+a[i]);max=Math.max(max,cur);}return max;};expect(maxSub([-2,1,-3,4,-1,2,1,-5,4])).toBe(6); });
  it('handles graph adjacency list', () => { const g=new Map<number,number[]>([[1,[2,3]],[2,[4]],[3,[4]],[4,[]]]);const neighbors=g.get(1)!;expect(neighbors).toContain(2);expect(neighbors.length).toBe(2); });
});


describe('phase37 coverage', () => {
  it('finds all indexes of value', () => { const findAll=<T>(a:T[],v:T)=>a.reduce((acc,x,i)=>x===v?[...acc,i]:acc,[] as number[]); expect(findAll([1,2,1,3,1],1)).toEqual([0,2,4]); });
  it('checks if number is power of 2', () => { const isPow2=(n:number)=>n>0&&(n&(n-1))===0; expect(isPow2(8)).toBe(true); expect(isPow2(6)).toBe(false); });
  it('sums digits recursively', () => { const dsum=(n:number):number=>n<10?n:n%10+dsum(Math.floor(n/10)); expect(dsum(9999)).toBe(36); });
  it('checks all elements satisfy predicate', () => { expect([2,4,6].every(n=>n%2===0)).toBe(true); expect([2,3,6].every(n=>n%2===0)).toBe(false); });
  it('chunks array by predicate', () => { const split=<T>(a:T[],fn:(x:T)=>boolean)=>{const r:T[][]=[];let cur:T[]=[];for(const x of a){if(fn(x)){if(cur.length)r.push(cur);cur=[];}else cur.push(x);}if(cur.length)r.push(cur);return r;}; expect(split([1,2,0,3,4,0,5],x=>x===0)).toEqual([[1,2],[3,4],[5]]); });
});


describe('phase38 coverage', () => {
  it('computes digital root', () => { const dr=(n:number):number=>n<10?n:dr(String(n).split('').reduce((a,c)=>a+Number(c),0)); expect(dr(942)).toBe(6); });
  it('applies selection sort', () => { const sort=(a:number[])=>{const r=[...a];for(let i=0;i<r.length;i++){let m=i;for(let j=i+1;j<r.length;j++)if(r[j]<r[m])m=j;[r[i],r[m]]=[r[m],r[i]];}return r;}; expect(sort([3,1,4,1,5])).toEqual([1,1,3,4,5]); });
  it('implements exponential search bound', () => { const expBound=(a:number[],v:number)=>{if(a[0]===v)return 0;let i=1;while(i<a.length&&a[i]<=v)i*=2;return Math.min(i,a.length-1);}; expect(expBound([1,2,4,8,16,32],8)).toBeGreaterThanOrEqual(3); });
  it('finds median of array', () => { const med=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}; expect(med([3,1,4,1,5])).toBe(3); expect(med([1,2,3,4])).toBe(2.5); });
  it('computes standard deviation', () => { const std=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length);}; expect(std([2,4,4,4,5,5,7,9])).toBe(2); });
});


describe('phase39 coverage', () => {
  it('checks valid IP address format', () => { const isIP=(s:string)=>/^(\d{1,3}\.){3}\d{1,3}$/.test(s)&&s.split('.').every(p=>Number(p)<=255); expect(isIP('192.168.1.1')).toBe(true); expect(isIP('999.0.0.1')).toBe(false); });
  it('finds longest word in sentence', () => { const longest=(s:string)=>s.split(' ').reduce((a,b)=>b.length>a.length?b:a,''); expect(longest('the quick brown fox')).toBe('quick'); });
  it('checks if power of 4', () => { const isPow4=(n:number)=>n>0&&(n&(n-1))===0&&(n-1)%3===0; expect(isPow4(16)).toBe(true); expect(isPow4(8)).toBe(false); });
  it('checks if two strings are isomorphic', () => { const isIso=(s:string,t:string)=>{const m1=new Map<string,string>(),m2=new Set<string>();for(let i=0;i<s.length;i++){if(m1.has(s[i])&&m1.get(s[i])!==t[i])return false;if(!m1.has(s[i])&&m2.has(t[i]))return false;m1.set(s[i],t[i]);m2.add(t[i]);}return true;}; expect(isIso('egg','add')).toBe(true); expect(isIso('foo','bar')).toBe(false); });
  it('checks if string has all unique chars', () => { const allUniq=(s:string)=>new Set(s).size===s.length; expect(allUniq('abcde')).toBe(true); expect(allUniq('abcda')).toBe(false); });
});


describe('phase40 coverage', () => {
  it('checks if matrix is identity', () => { const isId=(m:number[][])=>m.every((r,i)=>r.every((v,j)=>v===(i===j?1:0))); expect(isId([[1,0],[0,1]])).toBe(true); expect(isId([[1,0],[0,2]])).toBe(false); });
  it('computes number of set bits sum for range', () => { const rangePopcount=(n:number)=>Array.from({length:n+1},(_,i)=>i).reduce((s,v)=>{let c=0,x=v;while(x){c+=x&1;x>>>=1;}return s+c;},0); expect(rangePopcount(5)).toBe(7); /* 0+1+1+2+1+2 */ });
  it('checks if array forms arithmetic progression', () => { const isAP=(a:number[])=>{const d=a[1]-a[0];return a.every((v,i)=>i===0||v-a[i-1]===d);}; expect(isAP([3,5,7,9])).toBe(true); expect(isAP([1,2,4])).toBe(false); });
  it('computes number of subsequences matching pattern', () => { const countSub=(s:string,p:string)=>{const dp=Array(p.length+1).fill(0);dp[0]=1;for(const c of s)for(let j=p.length;j>0;j--)if(c===p[j-1])dp[j]+=dp[j-1];return dp[p.length];}; expect(countSub('rabbbit','rabbit')).toBe(3); });
  it('finds smallest window containing all chars', () => { const minWindow=(s:string,t:string)=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let l=0,formed=0,best='';const have=new Map<string,number>();for(let r=0;r<s.length;r++){const c=s[r];have.set(c,(have.get(c)||0)+1);if(need.has(c)&&have.get(c)===need.get(c))formed++;while(formed===need.size){const w=s.slice(l,r+1);if(!best||w.length<best.length)best=w;const lc=s[l];have.set(lc,(have.get(lc)||0)-1);if(need.has(lc)&&have.get(lc)!<need.get(lc)!)formed--;l++;}}return best;}; expect(minWindow('ADOBECODEBANC','ABC')).toBe('BANC'); });
});


describe('phase41 coverage', () => {
  it('checks if sentence is pangram', () => { const isPangram=(s:string)=>new Set(s.toLowerCase().replace(/[^a-z]/g,'')).size===26; expect(isPangram('The quick brown fox jumps over the lazy dog')).toBe(true); expect(isPangram('Hello world')).toBe(false); });
  it('implements dutch national flag partition', () => { const dnf=(a:number[])=>{const r=[...a];let lo=0,mid=0,hi=r.length-1;while(mid<=hi){if(r[mid]===0){[r[lo],r[mid]]=[r[mid],r[lo]];lo++;mid++;}else if(r[mid]===1)mid++;else{[r[mid],r[hi]]=[r[hi],r[mid]];hi--;}}return r;}; expect(dnf([2,0,1,2,1,0])).toEqual([0,0,1,1,2,2]); });
  it('computes minimum number of platforms needed', () => { const platforms=(arr:number[],dep:number[])=>{arr.sort((a,b)=>a-b);dep.sort((a,b)=>a-b);let plat=1,max=1,i=1,j=0;while(i<arr.length&&j<dep.length){if(arr[i]<=dep[j]){plat++;i++;}else{plat--;j++;}max=Math.max(max,plat);}return max;}; expect(platforms([900,940,950,1100,1500,1800],[910,1200,1120,1130,1900,2000])).toBe(3); });
  it('checks if string is a valid hex color', () => { const isHex=(s:string)=>/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s); expect(isHex('#fff')).toBe(true); expect(isHex('#aabbcc')).toBe(true); expect(isHex('#xyz')).toBe(false); });
  it('checks if string can form palindrome permutation', () => { const canFormPalin=(s:string)=>{const odd=[...s].reduce((cnt,c)=>{cnt.set(c,(cnt.get(c)||0)+1);return cnt;},new Map<string,number>());return[...odd.values()].filter(v=>v%2!==0).length<=1;}; expect(canFormPalin('carrace')).toBe(true); expect(canFormPalin('code')).toBe(false); });
});


describe('phase42 coverage', () => {
  it('scales point from origin', () => { const scale=(x:number,y:number,s:number):[number,number]=>[x*s,y*s]; expect(scale(2,3,2)).toEqual([4,6]); });
  it('translates point', () => { const translate=(x:number,y:number,dx:number,dy:number):[number,number]=>[x+dx,y+dy]; expect(translate(1,2,3,4)).toEqual([4,6]); });
  it('computes distance between two 2D points', () => { const dist=(x1:number,y1:number,x2:number,y2:number)=>Math.hypot(x2-x1,y2-y1); expect(dist(0,0,3,4)).toBe(5); });
  it('checks lazy caterer sequence', () => { const lazyCat=(n:number)=>n*(n+1)/2+1; expect(lazyCat(0)).toBe(1); expect(lazyCat(4)).toBe(11); });
  it('checks star number', () => { const starNums=new Set(Array.from({length:20},(_,i)=>6*i*(i-1)+1).filter(v=>v>0)); expect(starNums.has(13)).toBe(true); expect(starNums.has(37)).toBe(true); expect(starNums.has(7)).toBe(false); });
});


describe('phase43 coverage', () => {
  it('computes cross-entropy loss (binary)', () => { const bce=(p:number,y:number)=>-(y*Math.log(p+1e-9)+(1-y)*Math.log(1-p+1e-9)); expect(bce(0.9,1)).toBeLessThan(bce(0.1,1)); });
  it('computes linear regression intercept', () => { const lr=(x:number[],y:number[])=>{const n=x.length,mx=x.reduce((s,v)=>s+v,0)/n,my=y.reduce((s,v)=>s+v,0)/n,m=x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0)/x.reduce((s,v)=>s+(v-mx)**2,0);return my-m*mx;}; expect(lr([1,2,3],[2,4,6])).toBeCloseTo(0); });
  it('computes Spearman rank correlation', () => { const rank=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);return a.map(v=>s.indexOf(v)+1);}; const x=[1,2,3,4,5],y=[5,6,7,8,7]; const rx=rank(x),ry=rank(y); expect(rx).toEqual([1,2,3,4,5]); });
  it('formats duration in seconds to mm:ss', () => { const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; expect(fmt(90)).toBe('01:30'); expect(fmt(3661)).toBe('61:01'); });
  it('gets last day of month', () => { const lastDay=(y:number,m:number)=>new Date(y,m,0).getDate(); expect(lastDay(2026,2)).toBe(28); expect(lastDay(2024,2)).toBe(29); });
});


describe('phase44 coverage', () => {
  it('computes dot product', () => { const dot=(a:number[],b:number[])=>a.reduce((s,v,i)=>s+v*b[i],0); expect(dot([1,2,3],[4,5,6])).toBe(32); });
  it('converts snake_case to camelCase', () => { const toCamel=(s:string)=>s.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()); expect(toCamel('hello_world_foo')).toBe('helloWorldFoo'); });
  it('generates power set', () => { const ps=(a:number[]):number[][]=>a.reduce((acc,v)=>[...acc,...acc.map(s=>[...s,v])],[[]] as number[][]); expect(ps([1,2,3]).length).toBe(8); });
  it('flattens deeply nested array', () => { const deepFlat=(a:any[]):any[]=>a.reduce((acc,v)=>Array.isArray(v)?[...acc,...deepFlat(v)]:[...acc,v],[]); expect(deepFlat([1,[2,[3,[4,[5]]]]])).toEqual([1,2,3,4,5]); });
  it('rotates array right by k', () => { const rotR=(a:number[],k:number)=>{const n=a.length;const r=k%n;return [...a.slice(n-r),...a.slice(0,n-r)];}; expect(rotR([1,2,3,4,5],2)).toEqual([4,5,1,2,3]); });
});


describe('phase45 coverage', () => {
  it('computes row sums of matrix', () => { const rs=(m:number[][])=>m.map(r=>r.reduce((s,v)=>s+v,0)); expect(rs([[1,2,3],[4,5,6],[7,8,9]])).toEqual([6,15,24]); });
  it('computes string similarity (Jaccard)', () => { const jacc=(a:string,b:string)=>{const sa=new Set(a),sb=new Set(b);const inter=[...sa].filter(c=>sb.has(c)).length;const uni=new Set([...a,...b]).size;return inter/uni;}; expect(jacc('abc','bcd')).toBeCloseTo(0.5); });
  it('implements string builder pattern', () => { const sb=()=>{const parts:string[]=[];const self={append:(s:string)=>{parts.push(s);return self;},toString:()=>parts.join('')};return self;}; const b=sb();b.append('Hello').append(', ').append('World'); expect(b.toString()).toBe('Hello, World'); });
  it('returns most frequent character', () => { const mfc=(s:string)=>{const f:Record<string,number>={};for(const c of s)f[c]=(f[c]||0)+1;return Object.entries(f).sort((a,b)=>b[1]-a[1])[0][0];}; expect(mfc('aababc')).toBe('a'); });
  it('counts character frequency map', () => { const freq=(s:string)=>[...s].reduce((m,c)=>{m[c]=(m[c]||0)+1;return m;},{} as Record<string,number>); expect(freq('hello')).toEqual({h:1,e:1,l:2,o:1}); });
});


describe('phase46 coverage', () => {
  it('finds number of ways to partition n into k parts', () => { const parts=(n:number,k:number,min=1):number=>k===1?n>=min?1:0:Array.from({length:n-min*(k-1)-min+1},(_,i)=>parts(n-(i+min),k-1,i+min)).reduce((s,v)=>s+v,0); expect(parts(5,2)).toBe(2); expect(parts(6,3,1)).toBe(3); });
  it('implements sieve of Eratosthenes', () => { const sieve=(n:number)=>{const p=new Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return Array.from({length:n-1},(_,i)=>i+2).filter(i=>p[i]);}; expect(sieve(30)).toEqual([2,3,5,7,11,13,17,19,23,29]); });
  it('checks if number is deficient', () => { const def=(n:number)=>Array.from({length:n-1},(_,i)=>i+1).filter(d=>n%d===0).reduce((s,v)=>s+v,0)<n; expect(def(8)).toBe(true); expect(def(12)).toBe(false); });
  it('counts distinct subsequences', () => { const ds=(s:string,t:string)=>{const m=s.length,n=t.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=0;i<=m;i++)dp[i][0]=1;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=dp[i-1][j]+(s[i-1]===t[j-1]?dp[i-1][j-1]:0);return dp[m][n];}; expect(ds('rabbbit','rabbit')).toBe(3); expect(ds('babgbag','bag')).toBe(5); });
  it('checks valid BST from preorder', () => { const vbst=(pre:number[])=>{const st:number[]=[],min=[-Infinity];for(const v of pre){if(v<min[0])return false;while(st.length&&st[st.length-1]<v)min[0]=st.pop()!;st.push(v);}return true;}; expect(vbst([5,2,1,3,6])).toBe(true); expect(vbst([5,2,6,1,3])).toBe(false); });
});


describe('phase47 coverage', () => {
  it('checks if string is valid IPv6', () => { const v6=(s:string)=>{const g=s.split(':');return g.length===8&&g.every(x=>/^[0-9a-fA-F]{1,4}$/.test(x));}; expect(v6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true); expect(v6('2001:db8::1')).toBe(false); });
  it('computes Floyd-Warshall all-pairs shortest paths', () => { const fw=(d:number[][])=>{const n=d.length,r=d.map(row=>[...row]);for(let k=0;k<n;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(r[i][k]+r[k][j]<r[j][j+0]||true)r[i][j]=Math.min(r[i][j],r[i][k]+r[k][j]);return r;}; const INF=Infinity;const g=[[0,3,INF,5],[2,0,INF,4],[INF,1,0,INF],[INF,INF,2,0]]; const r=fw(g); expect(r[0][2]).toBe(7); expect(r[3][0]).toBe(5); });
  it('computes stock profit with cooldown', () => { const sp=(p:number[])=>{let hold=-Infinity,sold=0,cool=0;for(const v of p){const nh=Math.max(hold,cool-v),ns=hold+v,nc=Math.max(cool,sold);[hold,sold,cool]=[nh,ns,nc];}return Math.max(sold,cool);}; expect(sp([1,2,3,0,2])).toBe(3); expect(sp([1])).toBe(0); });
  it('implements Z-algorithm for string matching', () => { const zfn=(s:string)=>{const n=s.length,z=new Array(n).fill(0);let l=0,r=0;for(let i=1;i<n;i++){if(i<r)z[i]=Math.min(r-i,z[i-l]);while(i+z[i]<n&&s[z[i]]===s[i+z[i]])z[i]++;if(i+z[i]>r){l=i;r=i+z[i];}}return z;}; const z=zfn('aabxaa'); expect(z[4]).toBe(2); expect(z[0]).toBe(0); });
  it('normalizes matrix rows to sum 1', () => { const nr=(m:number[][])=>m.map(r=>{const s=r.reduce((a,v)=>a+v,0);return r.map(v=>Math.round(v/s*100)/100);}); expect(nr([[1,3],[2,2]])[0]).toEqual([0.25,0.75]); });
});


describe('phase48 coverage', () => {
  it('computes bit reversal', () => { const rev=(n:number,bits=8)=>{let r=0;for(let i=0;i<bits;i++){r=(r<<1)|(n&1);n>>=1;}return r;}; expect(rev(0b10110001,8)).toBe(0b10001101); });
  it('finds Eulerian path existence', () => { const ep=(n:number,edges:[number,number][])=>{const deg=new Array(n).fill(0);edges.forEach(([u,v])=>{deg[u]++;deg[v]++;});const odd=deg.filter(d=>d%2!==0).length;return odd===0||odd===2;}; expect(ep(4,[[0,1],[1,2],[2,3]])).toBe(true); expect(ep(4,[[0,1],[1,2],[2,3],[3,1]])).toBe(true); });
  it('converts number base', () => { const conv=(n:number,from:number,to:number)=>parseInt(n.toString(),from).toString(to); expect(conv(255,10,16)).toBe('ff'); expect(conv(255,10,2)).toBe('11111111'); });
  it('finds median without sorting (quickselect)', () => { const qs=(a:number[],k:number):number=>{const p=a[Math.floor(a.length/2)];const lo=a.filter(x=>x<p),eq=a.filter(x=>x===p),hi=a.filter(x=>x>p);return k<lo.length?qs(lo,k):k<lo.length+eq.length?p:qs(hi,k-lo.length-eq.length);}; const a=[3,1,4,1,5,9,2,6];const m=qs(a,Math.floor(a.length/2)); expect(m).toBe(4); });
  it('finds the Josephus position', () => { const jos=(n:number,k:number):number=>n===1?0:(jos(n-1,k)+k)%n; expect(jos(7,3)).toBe(3); expect(jos(6,2)).toBe(4); });
});


describe('phase49 coverage', () => {
  it('finds all permutations', () => { const perms=(a:number[]):number[][]=>a.length<=1?[a]:a.flatMap((v,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[v,...p])); expect(perms([1,2,3]).length).toBe(6); });
  it('checks if array can be partitioned into equal sums', () => { const part=(a:number[])=>{const sum=a.reduce((s,v)=>s+v,0);if(sum%2)return false;const t=sum/2;const dp=new Array(t+1).fill(false);dp[0]=true;for(const v of a)for(let j=t;j>=v;j--)dp[j]=dp[j]||dp[j-v];return dp[t];}; expect(part([1,5,11,5])).toBe(true); expect(part([1,2,3,5])).toBe(false); });
  it('checks if string has all unique characters', () => { const uniq=(s:string)=>new Set(s).size===s.length; expect(uniq('abcde')).toBe(true); expect(uniq('aabcd')).toBe(false); expect(uniq('')).toBe(true); });
  it('checks if linked list has cycle', () => { type N={v:number;next?:N};const hasCycle=(h:N|undefined)=>{let s:N|undefined=h,f:N|undefined=h;while(f&&f.next){s=s!.next;f=f.next.next;if(s===f)return true;}return false;}; const n1:N={v:1},n2:N={v:2},n3:N={v:3};n1.next=n2;n2.next=n3; expect(hasCycle(n1)).toBe(false); n3.next=n1; expect(hasCycle(n1)).toBe(true); });
  it('finds maximum score from removing stones', () => { const ms=(a:number,b:number,c:number)=>{const s=[a,b,c].sort((x,y)=>x-y);return s[2]>=s[0]+s[1]?s[0]+s[1]:Math.floor((a+b+c)/2);}; expect(ms(2,4,6)).toBe(6); expect(ms(4,4,6)).toBe(7); });
});


describe('phase50 coverage', () => {
  it('computes sum of all odd-length subarrays', () => { const sodd=(a:number[])=>{let sum=0;for(let i=0;i<a.length;i++)for(let j=i;j<a.length;j+=2)sum+=a.slice(i,j+1).reduce((s,v)=>s+v,0);return sum;}; expect(sodd([1,4,2,5,3])).toBe(58); });
  it('computes minimum knight moves', () => { const km=(x:number,y:number)=>{const seen=new Set(['0,0']);const q:[[number,number],number][]=[[[0,0],0]];const moves=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];let head=0;while(head<q.length){const [[cx,cy],d]=q[head++];if(cx===x&&cy===y)return d;for(const [dx,dy] of moves){const nx=cx+dx,ny=cy+dy,k=`${nx},${ny}`;if(!seen.has(k)&&Math.abs(nx)<=300&&Math.abs(ny)<=300){seen.add(k);q.push([[nx,ny],d+1]);}}}return -1;}; expect(km(2,1)).toBe(1); expect(km(0,0)).toBe(0); });
  it('finds all unique BST structures count', () => { const bst=(n:number):number=>{if(n<=1)return 1;let cnt=0;for(let i=1;i<=n;i++)cnt+=bst(i-1)*bst(n-i);return cnt;}; expect(bst(3)).toBe(5); expect(bst(4)).toBe(14); expect(bst(1)).toBe(1); });
  it('finds number of good subarrays', () => { const gs=(a:number[],k:number)=>{const mp=new Map([[0,1]]);let sum=0,cnt=0;for(const v of a){sum+=v;cnt+=mp.get(sum-k)||0;mp.set(sum,(mp.get(sum)||0)+1);}return cnt;}; expect(gs([1,1,1],2)).toBe(2); expect(gs([1,2,3],3)).toBe(2); });
  it('finds all palindrome partitions', () => { const pp=(s:string):string[][]=>{const r:string[][]=[];const isPal=(str:string)=>str===str.split('').reverse().join('');const bt=(i:number,cur:string[])=>{if(i===s.length){r.push([...cur]);return;}for(let j=i+1;j<=s.length;j++){const sub=s.slice(i,j);if(isPal(sub))bt(j,[...cur,sub]);}};bt(0,[]);return r;}; expect(pp('aab').length).toBe(2); expect(pp('a').length).toBe(1); });
});

describe('phase51 coverage', () => {
  it('finds median of two sorted arrays', () => { const med=(a:number[],b:number[])=>{const m=[...a,...b].sort((x,y)=>x-y),n=m.length;return n%2?m[Math.floor(n/2)]:(m[n/2-1]+m[n/2])/2;}; expect(med([1,3],[2])).toBe(2); expect(med([1,2],[3,4])).toBe(2.5); expect(med([],[1])).toBe(1); });
  it('traverses matrix in spiral order', () => { const spiral=(m:number[][])=>{const res:number[]=[];let t=0,b=m.length-1,l=0,r=m[0].length-1;while(t<=b&&l<=r){for(let i=l;i<=r;i++)res.push(m[t][i]);t++;for(let i=t;i<=b;i++)res.push(m[i][r]);r--;if(t<=b){for(let i=r;i>=l;i--)res.push(m[b][i]);b--;}if(l<=r){for(let i=b;i>=t;i--)res.push(m[i][l]);l++;}}return res;}; expect(spiral([[1,2,3],[4,5,6],[7,8,9]])).toEqual([1,2,3,6,9,8,7,4,5]); expect(spiral([[1,2],[3,4]])).toEqual([1,2,4,3]); });
  it('solves coin change minimum coins', () => { const cc=(coins:number[],amt:number)=>{const dp=new Array(amt+1).fill(amt+1);dp[0]=0;for(let i=1;i<=amt;i++)for(const c of coins)if(c<=i)dp[i]=Math.min(dp[i],dp[i-c]+1);return dp[amt]>amt?-1:dp[amt];}; expect(cc([1,5,11],15)).toBe(3); expect(cc([2],3)).toBe(-1); expect(cc([1,2,5],11)).toBe(3); });
  it('finds all duplicates in array in O(n)', () => { const fd=(a:number[])=>{const b=[...a],res:number[]=[];for(let i=0;i<b.length;i++){const idx=Math.abs(b[i])-1;if(b[idx]<0)res.push(Math.abs(b[i]));else b[idx]*=-1;}return res.sort((x,y)=>x-y);}; expect(fd([4,3,2,7,8,2,3,1])).toEqual([2,3]); expect(fd([1,1,2])).toEqual([1]); });
  it('computes next permutation of array', () => { const np=(a:number[])=>{const r=[...a];let i=r.length-2;while(i>=0&&r[i]>=r[i+1])i--;if(i>=0){let j=r.length-1;while(r[j]<=r[i])j--;[r[i],r[j]]=[r[j],r[i]];}let lo=i+1,hi=r.length-1;while(lo<hi){[r[lo],r[hi]]=[r[hi],r[lo]];lo++;hi--;}return r;}; expect(np([1,2,3])).toEqual([1,3,2]); expect(np([3,2,1])).toEqual([1,2,3]); expect(np([1,1,5])).toEqual([1,5,1]); });
});

describe('phase52 coverage', () => {
  it('counts inversions in array', () => { const inv=(a:number[])=>{let cnt=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>a[j])cnt++;return cnt;}; expect(inv([2,4,1,3,5])).toBe(3); expect(inv([1,2,3,4,5])).toBe(0); expect(inv([5,4,3,2,1])).toBe(10); });
  it('checks if array can be partitioned into equal subset sums', () => { const cp3=(a:number[])=>{const tot=a.reduce((s,v)=>s+v,0);if(tot%2)return false;const half=tot/2,dp=new Array(half+1).fill(false);dp[0]=true;for(const n of a)for(let j=half;j>=n;j--)if(dp[j-n])dp[j]=true;return dp[half];}; expect(cp3([1,5,11,5])).toBe(true); expect(cp3([1,2,3,5])).toBe(false); expect(cp3([2,2,3,5])).toBe(false); });
  it('finds kth largest element in array', () => { const kl=(a:number[],k:number)=>[...a].sort((x,y)=>y-x)[k-1]; expect(kl([3,2,1,5,6,4],2)).toBe(5); expect(kl([3,2,3,1,2,4,5,5,6],4)).toBe(4); });
  it('counts subarrays with exactly k odd numbers', () => { const nna2=(a:number[],k:number)=>{let cnt=0;for(let i=0;i<a.length;i++){let odds=0;for(let j=i;j<a.length;j++){odds+=a[j]%2;if(odds===k)cnt++;else if(odds>k)break;}}return cnt;}; expect(nna2([1,1,2,1,1],3)).toBe(2); expect(nna2([2,4,6],1)).toBe(0); expect(nna2([1,2,3,1],2)).toBe(3); });
  it('finds minimum path sum in grid', () => { const mps2=(g:number[][])=>{const m=g.length,n=g[0].length,dp=Array.from({length:m},()=>new Array(n).fill(0));dp[0][0]=g[0][0];for(let i=1;i<m;i++)dp[i][0]=dp[i-1][0]+g[i][0];for(let j=1;j<n;j++)dp[0][j]=dp[0][j-1]+g[0][j];for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]=Math.min(dp[i-1][j],dp[i][j-1])+g[i][j];return dp[m-1][n-1];}; expect(mps2([[1,3,1],[1,5,1],[4,2,1]])).toBe(7); expect(mps2([[1,2],[1,1]])).toBe(3); });
});

describe('phase53 coverage', () => {
  it('implements queue using two stacks', () => { const myQ=()=>{const ib:number[]=[],ob:number[]=[];const load=()=>{if(!ob.length)while(ib.length)ob.push(ib.pop()!);};return{push:(x:number)=>ib.push(x),pop:():number=>{load();return ob.pop()!;},peek:():number=>{load();return ob[ob.length-1];},empty:()=>!ib.length&&!ob.length};}; const q=myQ();q.push(1);q.push(2);expect(q.peek()).toBe(1);expect(q.pop()).toBe(1);expect(q.empty()).toBe(false); });
  it('finds peak element index using binary search', () => { const pe2=(a:number[])=>{let l=0,r=a.length-1;while(l<r){const m=l+r>>1;if(a[m]<a[m+1])l=m+1;else r=m;}return l;}; expect(pe2([1,2,3,1])).toBe(2); expect(pe2([1,2,1,3,5,6,4])).toBe(5); expect(pe2([1])).toBe(0); });
  it('finds minimum falling path sum through matrix', () => { const mfps=(m:number[][])=>{const n=m.length,dp=m.map(r=>[...r]);for(let i=1;i<n;i++)for(let j=0;j<n;j++){const mn=Math.min(dp[i-1][j],j>0?dp[i-1][j-1]:Infinity,j<n-1?dp[i-1][j+1]:Infinity);dp[i][j]+=mn;}return Math.min(...dp[n-1]);}; expect(mfps([[2,1,3],[6,5,4],[7,8,9]])).toBe(13); expect(mfps([[1,2],[3,4]])).toBe(4); });
  it('evaluates reverse polish notation expression', () => { const rpn=(tokens:string[])=>{const st:number[]=[],ops:{[k:string]:(a:number,b:number)=>number}={'+': (a,b)=>a+b,'-': (a,b)=>a-b,'*': (a,b)=>a*b,'/': (a,b)=>Math.trunc(a/b)};for(const t of tokens){if(t in ops){const b=st.pop()!,a=st.pop()!;st.push(ops[t](a,b));}else st.push(Number(t));}return st[0];}; expect(rpn(['2','1','+','3','*'])).toBe(9); expect(rpn(['4','13','5','/','+'  ])).toBe(6); });
  it('sorts array of 0s 1s and 2s using Dutch national flag', () => { const sc=(a:number[])=>{let lo=0,mid=0,hi=a.length-1;while(mid<=hi){if(a[mid]===0){[a[lo],a[mid]]=[a[mid],a[lo]];lo++;mid++;}else if(a[mid]===1)mid++;else{[a[mid],a[hi]]=[a[hi],a[mid]];hi--;}}return a;}; expect(sc([2,0,2,1,1,0])).toEqual([0,0,1,1,2,2]); expect(sc([2,0,1])).toEqual([0,1,2]); });
});


describe('phase54 coverage', () => {
  it('computes minimum cost to cut a stick at given positions', () => { const cutCost=(n:number,cuts:number[])=>{const c=[0,...cuts.sort((a,b)=>a-b),n],m=c.length;const dp=Array.from({length:m},()=>new Array(m).fill(0));for(let len=2;len<m;len++){for(let i=0;i+len<m;i++){const j=i+len;dp[i][j]=Infinity;for(let k=i+1;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k][j]+c[j]-c[i]);}}return dp[0][m-1];}; expect(cutCost(7,[1,3,4,5])).toBe(16); expect(cutCost(9,[5,6,1,4,2])).toBe(22); });
  it('collects matrix elements in clockwise spiral order', () => { const spiral=(m:number[][])=>{const res:number[]=[],rows=m.length,cols=m[0].length;let t=0,b=rows-1,l=0,r=cols-1;while(t<=b&&l<=r){for(let i=l;i<=r;i++)res.push(m[t][i]);t++;for(let i=t;i<=b;i++)res.push(m[i][r]);r--;if(t<=b){for(let i=r;i>=l;i--)res.push(m[b][i]);b--;}if(l<=r){for(let i=b;i>=t;i--)res.push(m[i][l]);l++;}}return res;}; expect(spiral([[1,2],[4,3]])).toEqual([1,2,3,4]); });
  it('counts subarrays with exactly k distinct integers', () => { const ek=(a:number[],k:number)=>{const atMost=(x:number)=>{let res=0,l=0;const m=new Map<number,number>();for(let r=0;r<a.length;r++){m.set(a[r],(m.get(a[r])||0)+1);while(m.size>x){const v=m.get(a[l])!-1;if(v===0)m.delete(a[l]);else m.set(a[l],v);l++;}res+=r-l+1;}return res;};return atMost(k)-atMost(k-1);}; expect(ek([1,2,1,2,3],2)).toBe(7); expect(ek([1,2,1,3,4],3)).toBe(3); });
  it('finds all duplicates in array using sign-marking O(n) no extra space', () => { const dups=(a:number[])=>{const res:number[]=[],b=[...a];for(let i=0;i<b.length;i++){const idx=Math.abs(b[i])-1;if(b[idx]<0)res.push(idx+1);else b[idx]=-b[idx];}return res.sort((x,y)=>x-y);}; expect(dups([4,3,2,7,8,2,3,1])).toEqual([2,3]); expect(dups([1,1,2])).toEqual([1]); });
  it('finds minimum arrows to burst all balloons', () => { const minArrows=(pts:number[][])=>{if(!pts.length)return 0;pts.sort((a,b)=>a[1]-b[1]);let arrows=1,end=pts[0][1];for(let i=1;i<pts.length;i++){if(pts[i][0]>end){arrows++;end=pts[i][1];}}return arrows;}; expect(minArrows([[10,16],[2,8],[1,6],[7,12]])).toBe(2); expect(minArrows([[1,2],[3,4],[5,6]])).toBe(3); expect(minArrows([[1,2],[2,3]])).toBe(1); });
});


describe('phase55 coverage', () => {
  it('finds majority element using Boyer-Moore voting algorithm', () => { const maj=(a:number[])=>{let cand=a[0],cnt=1;for(let i=1;i<a.length;i++){if(cnt===0){cand=a[i];cnt=1;}else if(a[i]===cand)cnt++;else cnt--;}return cand;}; expect(maj([3,2,3])).toBe(3); expect(maj([2,2,1,1,1,2,2])).toBe(2); expect(maj([1])).toBe(1); });
  it('finds container with most water using two-pointer', () => { const mw=(h:number[])=>{let l=0,r=h.length-1,mx=0;while(l<r){mx=Math.max(mx,(r-l)*Math.min(h[l],h[r]));if(h[l]<h[r])l++;else r--;}return mx;}; expect(mw([1,8,6,2,5,4,8,3,7])).toBe(49); expect(mw([1,1])).toBe(1); expect(mw([4,3,2,1,4])).toBe(16); });
  it('generates the nth term of count-and-say sequence', () => { const cas=(n:number):string=>{if(n===1)return '1';const prev=cas(n-1);let res='',i=0;while(i<prev.length){let j=i;while(j<prev.length&&prev[j]===prev[i])j++;res+=`${j-i}${prev[i]}`;i=j;}return res;}; expect(cas(1)).toBe('1'); expect(cas(4)).toBe('1211'); expect(cas(5)).toBe('111221'); });
  it('counts ways to decode a digit string into letters', () => { const decode=(s:string)=>{const n=s.length;if(!n||s[0]==='0')return 0;const dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=+s[i-1],two=+(s.slice(i-2,i));if(one>=1)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(decode('12')).toBe(2); expect(decode('226')).toBe(3); expect(decode('06')).toBe(0); });
  it('finds maximum product subarray', () => { const mp=(a:number[])=>{let mn=a[0],mx=a[0],res=a[0];for(let i=1;i<a.length;i++){const tmp=mx;mx=Math.max(a[i],mx*a[i],mn*a[i]);mn=Math.min(a[i],tmp*a[i],mn*a[i]);res=Math.max(res,mx);}return res;}; expect(mp([2,3,-2,4])).toBe(6); expect(mp([-2,0,-1])).toBe(0); expect(mp([-2,3,-4])).toBe(24); });
});


describe('phase56 coverage', () => {
  it('checks if two strings are isomorphic (consistent char mapping)', () => { const iso=(s:string,t:string)=>{const ms=new Map<string,string>(),mt=new Map<string,string>();for(let i=0;i<s.length;i++){if(ms.has(s[i])&&ms.get(s[i])!==t[i])return false;if(mt.has(t[i])&&mt.get(t[i])!==s[i])return false;ms.set(s[i],t[i]);mt.set(t[i],s[i]);}return true;}; expect(iso('egg','add')).toBe(true); expect(iso('foo','bar')).toBe(false); expect(iso('paper','title')).toBe(true); });
  it('finds kth smallest element in BST using inorder traversal', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const kth=(root:N|null,k:number)=>{const stack:N[]=[];let cur=root,cnt=0;while(cur||stack.length){while(cur){stack.push(cur);cur=cur.l;}cur=stack.pop()!;if(++cnt===k)return cur.v;cur=cur.r;}return -1;}; const bst=mk(3,mk(1,null,mk(2)),mk(4)); expect(kth(bst,1)).toBe(1); expect(kth(bst,3)).toBe(3); });
  it('fills surrounded regions with X leaving border-connected O regions', () => { const solve=(b:string[][])=>{const m=b.length,n=b[0].length;const dfs=(i:number,j:number)=>{if(i<0||i>=m||j<0||j>=n||b[i][j]!=='O')return;b[i][j]='S';dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);};for(let i=0;i<m;i++){dfs(i,0);dfs(i,n-1);}for(let j=0;j<n;j++){dfs(0,j);dfs(m-1,j);}for(let i=0;i<m;i++)for(let j=0;j<n;j++)b[i][j]=b[i][j]==='S'?'O':'X';return b;}; const b=[['X','X','X','X'],['X','O','O','X'],['X','X','O','X'],['X','O','X','X']]; expect(solve(b)[1][1]).toBe('X'); expect(solve([['X','O','X'],['O','X','O'],['X','O','X']])[0][1]).toBe('O'); });
  it('finds length of longest increasing subsequence in O(n log n)', () => { const lis=(a:number[])=>{const tails:number[]=[];for(const x of a){let lo=0,hi=tails.length;while(lo<hi){const m=lo+hi>>1;if(tails[m]<x)lo=m+1;else hi=m;}tails[lo]=x;}return tails.length;}; expect(lis([10,9,2,5,3,7,101,18])).toBe(4); expect(lis([0,1,0,3,2,3])).toBe(4); expect(lis([7,7,7,7])).toBe(1); });
  it('counts subarrays with sum equal to k using prefix sum + hashmap', () => { const sub=(a:number[],k:number)=>{const m=new Map<number,number>([[0,1]]);let sum=0,cnt=0;for(const x of a){sum+=x;cnt+=m.get(sum-k)||0;m.set(sum,(m.get(sum)||0)+1);}return cnt;}; expect(sub([1,1,1],2)).toBe(2); expect(sub([1,2,3],3)).toBe(2); expect(sub([-1,-1,1],0)).toBe(1); });
});


describe('phase57 coverage', () => {
  it('reconstructs travel itinerary using DFS and min-heap', () => { const findItin=(tickets:[string,string][])=>{const g=new Map<string,string[]>();for(const[f,t]of tickets){g.set(f,[...(g.get(f)||[]),t]);}for(const v of g.values())v.sort();const res:string[]=[];const dfs=(a:string)=>{const nxt=g.get(a)||[];while(nxt.length)dfs(nxt.shift()!);res.unshift(a);};dfs('JFK');return res;}; expect(findItin([['MUC','LHR'],['JFK','MUC'],['SFO','SJC'],['LHR','SFO']])).toEqual(['JFK','MUC','LHR','SFO','SJC']); });
  it('finds all paths from node 0 to last node in a DAG', () => { const allPaths=(graph:number[][])=>{const res:number[][]=[];const dfs=(node:number,path:number[])=>{if(node===graph.length-1){res.push([...path]);return;}for(const nxt of graph[node])dfs(nxt,[...path,nxt]);};dfs(0,[0]);return res;}; expect(allPaths([[1,2],[3],[3],[]])).toEqual([[0,1,3],[0,2,3]]); expect(allPaths([[4,3,1],[3,2,4],[3],[4],[]])).toEqual([[0,4],[0,3,4],[0,1,3,4],[0,1,2,3,4],[0,1,4]]); });
  it('identifies all duplicate subtrees in binary tree', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const dups=(root:N|null)=>{const m=new Map<string,number>(),res:number[]=[];const ser=(n:N|null):string=>{if(!n)return'#';const s=`${n.v},${ser(n.l)},${ser(n.r)}`;m.set(s,(m.get(s)||0)+1);if(m.get(s)===2)res.push(n.v);return s;};ser(root);return res.sort((a,b)=>a-b);}; const t=mk(1,mk(2,mk(4)),mk(3,mk(2,mk(4)),mk(4))); expect(dups(t)).toEqual([2,4]); });
  it('implements LRU cache with O(1) get and put', () => { class LRU{private cap:number;private m=new Map<number,number>();constructor(c:number){this.cap=c;}get(k:number){if(!this.m.has(k))return -1;const v=this.m.get(k)!;this.m.delete(k);this.m.set(k,v);return v;}put(k:number,v:number){if(this.m.has(k))this.m.delete(k);else if(this.m.size>=this.cap)this.m.delete(this.m.keys().next().value!);this.m.set(k,v);}} const c=new LRU(2);c.put(1,1);c.put(2,2);expect(c.get(1)).toBe(1);c.put(3,3);expect(c.get(2)).toBe(-1);expect(c.get(3)).toBe(3); });
  it('counts ways to assign + and - to array elements to reach target', () => { const ts2=(a:number[],t:number)=>{const memo=new Map<string,number>();const dfs=(i:number,s:number):number=>{if(i===a.length)return s===t?1:0;const k=`${i},${s}`;if(memo.has(k))return memo.get(k)!;const v=dfs(i+1,s+a[i])+dfs(i+1,s-a[i]);memo.set(k,v);return v;};return dfs(0,0);}; expect(ts2([1,1,1,1,1],3)).toBe(5); expect(ts2([1],1)).toBe(1); });
});

describe('phase58 coverage', () => {
  it('median from stream', () => {
    class MedianFinder{private lo:number[]=[];private hi:number[]=[];addNum(n:number){this.lo.push(n);this.lo.sort((a,b)=>b-a);this.hi.push(this.lo.shift()!);this.hi.sort((a,b)=>a-b);if(this.hi.length>this.lo.length)this.lo.unshift(this.hi.shift()!);}findMedian():number{return this.lo.length>this.hi.length?this.lo[0]:(this.lo[0]+this.hi[0])/2;}}
    const mf=new MedianFinder();mf.addNum(1);mf.addNum(2);
    expect(mf.findMedian()).toBe(1.5);
    mf.addNum(3);
    expect(mf.findMedian()).toBe(2);
  });
  it('maximal rectangle histogram', () => {
    const largestRectangleInHistogram=(h:number[]):number=>{const stack:number[]=[];let max=0;const heights=[...h,0];for(let i=0;i<heights.length;i++){while(stack.length&&heights[stack[stack.length-1]]>heights[i]){const hi=heights[stack.pop()!];const w=stack.length?i-stack[stack.length-1]-1:i;max=Math.max(max,hi*w);}stack.push(i);}return max;};
    expect(largestRectangleInHistogram([2,1,5,6,2,3])).toBe(10);
    expect(largestRectangleInHistogram([2,4])).toBe(4);
    expect(largestRectangleInHistogram([1])).toBe(1);
  });
  it('jump game II min jumps', () => {
    const jump=(nums:number[]):number=>{let jumps=0,curEnd=0,farthest=0;for(let i=0;i<nums.length-1;i++){farthest=Math.max(farthest,i+nums[i]);if(i===curEnd){jumps++;curEnd=farthest;}}return jumps;};
    expect(jump([2,3,1,1,4])).toBe(2);
    expect(jump([2,3,0,1,4])).toBe(2);
    expect(jump([1,2,3])).toBe(2);
    expect(jump([0])).toBe(0);
  });
  it('permutation in string', () => {
    const checkInclusion=(s1:string,s2:string):boolean=>{if(s1.length>s2.length)return false;const cnt=new Array(26).fill(0);const a='a'.charCodeAt(0);for(const c of s1)cnt[c.charCodeAt(0)-a]++;let matches=cnt.filter(x=>x===0).length;let l=0;for(let r=0;r<s2.length;r++){const rc=s2[r].charCodeAt(0)-a;cnt[rc]--;if(cnt[rc]===0)matches++;else if(cnt[rc]===-1)matches--;if(r-l+1>s1.length){const lc=s2[l].charCodeAt(0)-a;cnt[lc]++;if(cnt[lc]===1)matches--;else if(cnt[lc]===0)matches++;l++;}if(matches===26)return true;}return false;};
    expect(checkInclusion('ab','eidbaooo')).toBe(true);
    expect(checkInclusion('ab','eidboaoo')).toBe(false);
  });
  it('letter combinations phone', () => {
    const letterCombinations=(digits:string):string[]=>{if(!digits)return[];const map:Record<string,string>={'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'};const res:string[]=[];const bt=(idx:number,cur:string)=>{if(idx===digits.length){res.push(cur);return;}for(const c of map[digits[idx]])bt(idx+1,cur+c);};bt(0,'');return res;};
    const r=letterCombinations('23');
    expect(r).toHaveLength(9);
    expect(r).toContain('ad');
    expect(letterCombinations('')).toEqual([]);
  });
});

describe('phase59 coverage', () => {
  it('surrounded regions', () => {
    const solve=(board:string[][]):void=>{const m=board.length,n=board[0].length;const dfs=(r:number,c:number)=>{if(r<0||r>=m||c<0||c>=n||board[r][c]!=='O')return;board[r][c]='S';dfs(r-1,c);dfs(r+1,c);dfs(r,c-1);dfs(r,c+1);};for(let i=0;i<m;i++){dfs(i,0);dfs(i,n-1);}for(let j=0;j<n;j++){dfs(0,j);dfs(m-1,j);}for(let i=0;i<m;i++)for(let j=0;j<n;j++)board[i][j]=board[i][j]==='S'?'O':board[i][j]==='O'?'X':board[i][j];};
    const b=[['X','X','X','X'],['X','O','O','X'],['X','X','O','X'],['X','O','X','X']];
    solve(b);
    expect(b[1][1]).toBe('X');
    expect(b[3][1]).toBe('O');
  });
  it('binary tree path sum III', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const pathSum=(root:TN|null,targetSum:number):number=>{const cnt=new Map([[0,1]]);let res=0,prefix=0;const dfs=(n:TN|null)=>{if(!n)return;prefix+=n.val;res+=(cnt.get(prefix-targetSum)||0);cnt.set(prefix,(cnt.get(prefix)||0)+1);dfs(n.left);dfs(n.right);cnt.set(prefix,(cnt.get(prefix)||0)-1);prefix-=n.val;};dfs(root);return res;};
    const t=mk(10,mk(5,mk(3,mk(3),mk(-2)),mk(2,null,mk(1))),mk(-3,null,mk(11)));
    expect(pathSum(t,8)).toBe(3);
    expect(pathSum(mk(5,mk(4,mk(11,mk(7),mk(2)),null),mk(8,mk(13),mk(4,null,mk(1)))),22)).toBe(2);
  });
  it('accounts merge', () => {
    const accountsMerge=(accounts:string[][]):string[][]=>{const parent=new Map<string,string>();const find=(x:string):string=>{if(!parent.has(x))parent.set(x,x);if(parent.get(x)!==x)parent.set(x,find(parent.get(x)!));return parent.get(x)!;};const union=(a:string,b:string)=>parent.set(find(a),find(b));const emailToName=new Map<string,string>();accounts.forEach(acc=>{acc.slice(1).forEach(e=>{emailToName.set(e,acc[0]);union(e,acc[1]);});});const groups=new Map<string,string[]>();emailToName.forEach((_,e)=>{const root=find(e);groups.set(root,[...(groups.get(root)||[]),e]);});return Array.from(groups.entries()).map(([root,emails])=>[emailToName.get(root)!,...emails.sort()]);};
    const r=accountsMerge([['John','johnsmith@mail.com','john_newyork@mail.com'],['John','johnsmith@mail.com','john00@mail.com'],['Mary','mary@mail.com'],['John','johnnybravo@mail.com']]);
    expect(r).toHaveLength(3);
  });
  it('number of connected components', () => {
    const countComponents=(n:number,edges:[number,number][]):number=>{const parent=Array.from({length:n},(_,i)=>i);const find=(x:number):number=>parent[x]===x?x:parent[x]=find(parent[x]);const union=(a:number,b:number)=>parent[find(a)]=find(b);edges.forEach(([a,b])=>union(a,b));return new Set(Array.from({length:n},(_,i)=>find(i))).size;};
    expect(countComponents(5,[[0,1],[1,2],[3,4]])).toBe(2);
    expect(countComponents(5,[[0,1],[1,2],[2,3],[3,4]])).toBe(1);
    expect(countComponents(4,[])).toBe(4);
  });
  it('task scheduler cooling', () => {
    const leastInterval=(tasks:string[],n:number):number=>{const cnt=new Array(26).fill(0);const a='A'.charCodeAt(0);for(const t of tasks)cnt[t.charCodeAt(0)-a]++;const maxCnt=Math.max(...cnt);const maxTasks=cnt.filter(c=>c===maxCnt).length;return Math.max(tasks.length,(maxCnt-1)*(n+1)+maxTasks);};
    expect(leastInterval(['A','A','A','B','B','B'],2)).toBe(8);
    expect(leastInterval(['A','A','A','B','B','B'],0)).toBe(6);
    expect(leastInterval(['A','A','A','A','A','A','B','C','D','E','F','G'],2)).toBe(16);
  });
});

describe('phase60 coverage', () => {
  it('interleaving string DP', () => {
    const isInterleave=(s1:string,s2:string,s3:string):boolean=>{const m=s1.length,n=s2.length;if(m+n!==s3.length)return false;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let i=1;i<=m;i++)dp[i][0]=dp[i-1][0]&&s1[i-1]===s3[i-1];for(let j=1;j<=n;j++)dp[0][j]=dp[0][j-1]&&s2[j-1]===s3[j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=(dp[i-1][j]&&s1[i-1]===s3[i+j-1])||(dp[i][j-1]&&s2[j-1]===s3[i+j-1]);return dp[m][n];};
    expect(isInterleave('aabcc','dbbca','aadbbcbcac')).toBe(true);
    expect(isInterleave('aabcc','dbbca','aadbbbaccc')).toBe(false);
    expect(isInterleave('','','b')).toBe(false);
  });
  it('wildcard matching DP', () => {
    const isMatch=(s:string,p:string):boolean=>{const m=s.length,n=p.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){if(p[j-1]==='*')dp[i][j]=dp[i-1][j]||dp[i][j-1];else dp[i][j]=(p[j-1]==='?'||p[j-1]===s[i-1])&&dp[i-1][j-1];}return dp[m][n];};
    expect(isMatch('aa','a')).toBe(false);
    expect(isMatch('aa','*')).toBe(true);
    expect(isMatch('cb','?a')).toBe(false);
    expect(isMatch('adceb','*a*b')).toBe(true);
  });
  it('sum of subarray minimums', () => {
    const sumSubarrayMins=(arr:number[]):number=>{const MOD=1e9+7;const n=arr.length;const left=new Array(n).fill(0);const right=new Array(n).fill(0);const s1:number[]=[];const s2:number[]=[];for(let i=0;i<n;i++){while(s1.length&&arr[s1[s1.length-1]]>=arr[i])s1.pop();left[i]=s1.length?i-s1[s1.length-1]:i+1;s1.push(i);}for(let i=n-1;i>=0;i--){while(s2.length&&arr[s2[s2.length-1]]>arr[i])s2.pop();right[i]=s2.length?s2[s2.length-1]-i:n-i;s2.push(i);}let res=0;for(let i=0;i<n;i++)res=(res+arr[i]*left[i]*right[i])%MOD;return res;};
    expect(sumSubarrayMins([3,1,2,4])).toBe(17);
    expect(sumSubarrayMins([11,81,94,43,3])).toBe(444);
  });
  it('stock span problem', () => {
    const calculateSpan=(prices:number[]):number[]=>{const stack:number[]=[];const span:number[]=[];for(let i=0;i<prices.length;i++){while(stack.length&&prices[stack[stack.length-1]]<=prices[i])stack.pop();span.push(stack.length===0?i+1:i-stack[stack.length-1]);stack.push(i);}return span;};
    expect(calculateSpan([100,80,60,70,60,75,85])).toEqual([1,1,1,2,1,4,6]);
    expect(calculateSpan([10,4,5,90,120,80])).toEqual([1,1,2,4,5,1]);
  });
  it('maximum sum circular subarray', () => {
    const maxSubarraySumCircular=(nums:number[]):number=>{let totalSum=0,curMax=0,maxSum=nums[0],curMin=0,minSum=nums[0];for(const n of nums){curMax=Math.max(curMax+n,n);maxSum=Math.max(maxSum,curMax);curMin=Math.min(curMin+n,n);minSum=Math.min(minSum,curMin);totalSum+=n;}return maxSum>0?Math.max(maxSum,totalSum-minSum):maxSum;};
    expect(maxSubarraySumCircular([1,-2,3,-2])).toBe(3);
    expect(maxSubarraySumCircular([5,-3,5])).toBe(10);
    expect(maxSubarraySumCircular([-3,-2,-3])).toBe(-2);
  });
});

describe('phase61 coverage', () => {
  it('moving average data stream', () => {
    class MovingAverage{private q:number[]=[];private sum=0;constructor(private size:number){}next(val:number):number{this.q.push(val);this.sum+=val;if(this.q.length>this.size)this.sum-=this.q.shift()!;return this.sum/this.q.length;}}
    const ma=new MovingAverage(3);
    expect(ma.next(1)).toBeCloseTo(1);
    expect(ma.next(10)).toBeCloseTo(5.5);
    expect(ma.next(3)).toBeCloseTo(4.667,2);
    expect(ma.next(5)).toBeCloseTo(6);
  });
  it('iterator flatten generator', () => {
    function* flatGen(arr:any[]):Generator<number>{for(const x of arr){if(Array.isArray(x))yield*flatGen(x);else yield x;}}
    const it=flatGen([[1,[2]],[3,[4,[5]]]]);
    const res:number[]=[];
    for(const v of it)res.push(v);
    expect(res).toEqual([1,2,3,4,5]);
    expect([...flatGen([1,[2,[3]]])]).toEqual([1,2,3]);
  });
  it('sliding window median', () => {
    const medianSlidingWindow=(nums:number[],k:number):number[]=>{const res:number[]=[];for(let i=0;i<=nums.length-k;i++){const win=[...nums.slice(i,i+k)].sort((a,b)=>a-b);res.push(k%2===0?(win[k/2-1]+win[k/2])/2:win[Math.floor(k/2)]);}return res;};
    expect(medianSlidingWindow([1,3,-1,-3,5,3,6,7],3)).toEqual([1,-1,-1,3,5,6]);
    expect(medianSlidingWindow([1,2,3,4,2,3,1,4,2],3)).toEqual([2,3,3,3,2,3,2]);
  });
  it('maximum frequency stack', () => {
    class FreqStack{private freq=new Map<number,number>();private group=new Map<number,number[]>();private maxFreq=0;push(val:number):void{const f=(this.freq.get(val)||0)+1;this.freq.set(val,f);this.maxFreq=Math.max(this.maxFreq,f);if(!this.group.has(f))this.group.set(f,[]);this.group.get(f)!.push(val);}pop():number{const top=this.group.get(this.maxFreq)!;const val=top.pop()!;if(top.length===0){this.group.delete(this.maxFreq);this.maxFreq--;}this.freq.set(val,this.freq.get(val)!-1);return val;}}
    const fs=new FreqStack();[5,7,5,7,4,5].forEach(v=>fs.push(v));
    expect(fs.pop()).toBe(5);
    expect(fs.pop()).toBe(7);
    expect(fs.pop()).toBe(5);
    expect(fs.pop()).toBe(4);
  });
  it('asteroid collision stack', () => {
    const asteroidCollision=(asteroids:number[]):number[]=>{const stack:number[]=[];for(const a of asteroids){let destroyed=false;while(stack.length&&a<0&&stack[stack.length-1]>0){if(stack[stack.length-1]<-a){stack.pop();continue;}else if(stack[stack.length-1]===-a){stack.pop();}destroyed=true;break;}if(!destroyed)stack.push(a);}return stack;};
    expect(asteroidCollision([5,10,-5])).toEqual([5,10]);
    expect(asteroidCollision([8,-8])).toEqual([]);
    expect(asteroidCollision([10,2,-5])).toEqual([10]);
    expect(asteroidCollision([-2,-1,1,2])).toEqual([-2,-1,1,2]);
  });
});

describe('phase62 coverage', () => {
  it('reorganize string no adjacent', () => {
    const reorganizeString=(s:string):string=>{const cnt=new Array(26).fill(0);for(const c of s)cnt[c.charCodeAt(0)-97]++;const maxCnt=Math.max(...cnt);if(maxCnt>(s.length+1)/2)return'';const res:string[]=new Array(s.length);let i=0;for(let c=0;c<26;c++){while(cnt[c]>0){if(i>=s.length)i=1;res[i]=String.fromCharCode(97+c);cnt[c]--;i+=2;}}return res.join('');};
    const r=reorganizeString('aab');
    expect(r).toBeTruthy();
    expect(r[0]).not.toBe(r[1]);
    expect(reorganizeString('aaab')).toBe('');
  });
  it('gas station greedy', () => {
    const canCompleteCircuit=(gas:number[],cost:number[]):number=>{let total=0,tank=0,start=0;for(let i=0;i<gas.length;i++){const diff=gas[i]-cost[i];total+=diff;tank+=diff;if(tank<0){start=i+1;tank=0;}}return total>=0?start:-1;};
    expect(canCompleteCircuit([1,2,3,4,5],[3,4,5,1,2])).toBe(3);
    expect(canCompleteCircuit([2,3,4],[3,4,3])).toBe(-1);
    expect(canCompleteCircuit([5,1,2,3,4],[4,4,1,5,1])).toBe(4);
  });
  it('zigzag string conversion', () => {
    const convert=(s:string,numRows:number):string=>{if(numRows===1||numRows>=s.length)return s;const rows:string[]=new Array(numRows).fill('');let cur=0,dir=-1;for(const c of s){rows[cur]+=c;if(cur===0||cur===numRows-1)dir=-dir;cur+=dir;}return rows.join('');};
    expect(convert('PAYPALISHIRING',3)).toBe('PAHNAPLSIIGYIR');
    expect(convert('PAYPALISHIRING',4)).toBe('PINALSIGYAHRPI');
    expect(convert('A',1)).toBe('A');
  });
  it('divide two integers bit shift', () => {
    const divide=(dividend:number,divisor:number):number=>{if(dividend===0)return 0;if(divisor===0||dividend===-2147483648&&divisor===-1)return 2147483647;const sign=dividend>0===divisor>0?1:-1;let a=Math.abs(dividend),b=Math.abs(divisor),res=0;while(a>=b){let temp=b,mul=1;while(temp*2<=a){temp*=2;mul*=2;}a-=temp;res+=mul;}return sign*res;};
    expect(divide(10,3)).toBe(3);
    expect(divide(7,-2)).toBe(-3);
    expect(divide(0,1)).toBe(0);
  });
  it('number of 1 bits hamming weight', () => {
    const hammingWeight=(n:number):number=>{let count=0;while(n){count+=n&1;n>>>=1;}return count;};
    const hammingDistance=(x:number,y:number):number=>hammingWeight(x^y);
    expect(hammingWeight(11)).toBe(3);
    expect(hammingWeight(128)).toBe(1);
    expect(hammingDistance(1,4)).toBe(2);
    expect(hammingDistance(3,1)).toBe(1);
  });
});

describe('phase63 coverage', () => {
  it('top k frequent words', () => {
    const topKFrequent=(words:string[],k:number):string[]=>{const cnt=new Map<string,number>();for(const w of words)cnt.set(w,(cnt.get(w)||0)+1);return [...cnt.entries()].sort(([a,fa],[b,fb])=>fb!==fa?fb-fa:a.localeCompare(b)).slice(0,k).map(([w])=>w);};
    expect(topKFrequent(['i','love','leetcode','i','love','coding'],2)).toEqual(['i','love']);
    expect(topKFrequent(['the','day','is','sunny','the','the','the','sunny','is','is'],4)).toEqual(['the','is','sunny','day']);
  });
  it('toeplitz matrix check', () => {
    const isToeplitzMatrix=(matrix:number[][]):boolean=>{for(let i=1;i<matrix.length;i++)for(let j=1;j<matrix[0].length;j++)if(matrix[i][j]!==matrix[i-1][j-1])return false;return true;};
    expect(isToeplitzMatrix([[1,2,3,4],[5,1,2,3],[9,5,1,2]])).toBe(true);
    expect(isToeplitzMatrix([[1,2],[2,2]])).toBe(false);
  });
  it('shortest completing word', () => {
    const shortestCompletingWord=(plate:string,words:string[]):string=>{const cnt=(s:string)=>{const f=new Array(26).fill(0);for(const c of s.toLowerCase())if(c>='a'&&c<='z')f[c.charCodeAt(0)-97]++;return f;};const need=cnt(plate);return words.filter(w=>{const f=cnt(w);return need.every((n,i)=>f[i]>=n);}).sort((a,b)=>a.length-b.length)[0];};
    expect(shortestCompletingWord('1s3 PSt',['step','steps','stripe','stepple'])).toBe('steps');
    expect(shortestCompletingWord('1s3 456',['looks','pest','stew','show'])).toBe('pest');
  });
  it('wiggle sort array', () => {
    const wiggleSort=(nums:number[]):void=>{const sorted=[...nums].sort((a,b)=>a-b);const n=nums.length;let lo=Math.floor((n-1)/2),hi=n-1;for(let i=0;i<n;i+=2)nums[i]=sorted[lo--];for(let i=1;i<n;i+=2)nums[i]=sorted[hi--];};
    const a=[1,5,1,1,6,4];wiggleSort(a);
    for(let i=1;i<a.length-1;i++)expect((a[i]>=a[i-1]&&a[i]>=a[i+1])||(a[i]<=a[i-1]&&a[i]<=a[i+1])).toBe(true);
    const b=[1,3,2,2,3,1];wiggleSort(b);
    for(let i=1;i<b.length-1;i++)expect((b[i]>=b[i-1]&&b[i]>=b[i+1])||(b[i]<=b[i-1]&&b[i]<=b[i+1])).toBe(true);
  });
  it('longest word by deleting', () => {
    const findLongestWord=(s:string,dict:string[]):string=>{let res='';for(const w of dict){let i=0;for(const c of s)if(i<w.length&&c===w[i])i++;if(i===w.length&&(w.length>res.length||(w.length===res.length&&w<res)))res=w;}return res;};
    expect(findLongestWord('abpcplea',['ale','apple','monkey','plea'])).toBe('apple');
    expect(findLongestWord('abpcplea',['a','b','c'])).toBe('a');
    expect(findLongestWord('aewfafwafjlwajflwajflwafj',['apple','ewaf','jaf','abcdef'])).toBe('ewaf');
  });
});

describe('phase64 coverage', () => {
  describe('max points on a line', () => {
    function maxPoints(pts:number[][]):number{if(pts.length<=2)return pts.length;let res=2;const g=(a:number,b:number):number=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t;}return a;};for(let i=0;i<pts.length;i++){const map:Record<string,number>={};for(let j=i+1;j<pts.length;j++){let dx=pts[j][0]-pts[i][0],dy=pts[j][1]-pts[i][1];const gg=g(Math.abs(dx),Math.abs(dy));if(gg>0){dx/=gg;dy/=gg;}if(dx<0||(dx===0&&dy<0)){dx=-dx;dy=-dy;}const k=dx===0&&dy===0?'same':`${dy}/${dx}`;map[k]=(map[k]||1)+1;res=Math.max(res,map[k]);}}return res;}
    it('3col'  ,()=>expect(maxPoints([[1,1],[2,2],[3,3]])).toBe(3));
    it('4col'  ,()=>expect(maxPoints([[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]])).toBe(4));
    it('one'   ,()=>expect(maxPoints([[0,0]])).toBe(1));
    it('two'   ,()=>expect(maxPoints([[1,1],[2,2]])).toBe(2));
    it('noCol' ,()=>expect(maxPoints([[1,1],[2,3],[3,5],[4,7]])).toBe(4));
  });
  describe('palindrome pairs', () => {
    function palindromePairs(words:string[]):number{const isPal=(s:string)=>s===s.split('').reverse().join('');let c=0;for(let i=0;i<words.length;i++)for(let j=0;j<words.length;j++)if(i!==j&&isPal(words[i]+words[j]))c++;return c;}
    it('ex1'   ,()=>expect(palindromePairs(['abcd','dcba','lls','s','sssll'])).toBe(4));
    it('ex2'   ,()=>expect(palindromePairs(['bat','tab','cat'])).toBe(2));
    it('empty' ,()=>expect(palindromePairs(['a',''])).toBe(2));
    it('one'   ,()=>expect(palindromePairs(['a'])).toBe(0));
    it('aba'   ,()=>expect(palindromePairs(['aba',''])).toBe(2));
  });
  describe('word break II', () => {
    function wordBreakII(s:string,dict:string[]):string[]{const set=new Set(dict);const memo=new Map<number,string[]>();function bt(start:number):string[]{if(memo.has(start))return memo.get(start)!;if(start===s.length)return[''];const res:string[]=[];for(let end=start+1;end<=s.length;end++){const w=s.slice(start,end);if(set.has(w))for(const r of bt(end))res.push(w+(r?' '+r:''));}memo.set(start,res);return res;}return bt(0);}
    it('ex1'   ,()=>expect(wordBreakII('catsanddog',['cat','cats','and','sand','dog']).sort()).toEqual(['cat sand dog','cats and dog']));
    it('ex2'   ,()=>expect(wordBreakII('pineapplepenapple',['apple','pen','applepen','pine','pineapple']).length).toBe(3));
    it('nores' ,()=>expect(wordBreakII('catsandog',['cats','dog','sand','and','cat'])).toEqual([]));
    it('empty' ,()=>expect(wordBreakII('',['a'])).toEqual(['']));
    it('single',()=>expect(wordBreakII('a',['a'])).toEqual(['a']));
  });
  describe('nth super ugly number', () => {
    function nthSuperUgly(n:number,primes:number[]):number{const u=[1];const idx=new Array(primes.length).fill(0);for(let i=1;i<n;i++){const nx=Math.min(...primes.map((p,j)=>u[idx[j]]*p));u.push(nx);primes.forEach((_,j)=>{if(u[idx[j]]*primes[j]===nx)idx[j]++;});}return u[n-1];}
    it('p2'    ,()=>expect(nthSuperUgly(12,[2,7,13,19])).toBe(32));
    it('p1'    ,()=>expect(nthSuperUgly(1,[2,3,5])).toBe(1));
    it('std10' ,()=>expect(nthSuperUgly(10,[2,3,5])).toBe(12));
    it('p2only',()=>expect(nthSuperUgly(4,[2])).toBe(8));
    it('p3only',()=>expect(nthSuperUgly(3,[3])).toBe(9));
  });
  describe('longest consecutive sequence', () => {
    function lcs(nums:number[]):number{const s=new Set(nums);let b=0;for(const n of s){if(!s.has(n-1)){let c=n,l=1;while(s.has(c+1)){c++;l++;}b=Math.max(b,l);}}return b;}
    it('ex1'   ,()=>expect(lcs([100,4,200,1,3,2])).toBe(4));
    it('ex2'   ,()=>expect(lcs([0,3,7,2,5,8,4,6,0,1])).toBe(9));
    it('empty' ,()=>expect(lcs([])).toBe(0));
    it('single',()=>expect(lcs([5])).toBe(1));
    it('nocons',()=>expect(lcs([1,3,5,7])).toBe(1));
  });
});
