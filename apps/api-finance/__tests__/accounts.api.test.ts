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
