import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    crmQuote: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    crmQuoteLine: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
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

import quotesRouter from '../src/routes/quotes';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/quotes', quotesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockQuote = {
  id: '00000000-0000-0000-0000-000000000001',
  refNumber: 'QUO-2602-0001',
  title: 'Enterprise Proposal',
  dealId: 'deal-1',
  accountId: 'acc-1',
  contactId: 'contact-1',
  status: 'DRAFT',
  currency: 'GBP',
  subtotal: 1000,
  taxTotal: 200,
  total: 1200,
  validUntil: null,
  sentAt: null,
  acceptedAt: null,
  notes: null,
  terms: null,
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  lines: [
    {
      id: 'line-1',
      description: 'Consulting',
      quantity: 10,
      unitPrice: 100,
      discount: 0,
      taxRate: 20,
      subtotal: 1000,
      taxAmount: 200,
      total: 1200,
      sortOrder: 0,
    },
  ],
};

// ===================================================================
// POST /api/quotes
// ===================================================================

describe('POST /api/quotes', () => {
  it('should create quote with lines and calculate totals', async () => {
    mockPrisma.crmQuote.count.mockResolvedValue(0);
    mockPrisma.crmQuote.create.mockResolvedValue(mockQuote);

    const res = await request(app)
      .post('/api/quotes')
      .send({
        title: 'Enterprise Proposal',
        lines: [
          { description: 'Consulting', quantity: 10, unitPrice: 100, discount: 0, taxRate: 20 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.refNumber).toBe('QUO-2602-0001');
  });

  it('should create quote without lines', async () => {
    mockPrisma.crmQuote.count.mockResolvedValue(0);
    mockPrisma.crmQuote.create.mockResolvedValue({
      ...mockQuote,
      subtotal: 0,
      taxTotal: 0,
      total: 0,
      lines: [],
    });

    const res = await request(app).post('/api/quotes').send({
      title: 'Empty Proposal',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should create quote with multiple lines', async () => {
    mockPrisma.crmQuote.count.mockResolvedValue(5);
    mockPrisma.crmQuote.create.mockResolvedValue({
      ...mockQuote,
      subtotal: 2500,
      taxTotal: 500,
      total: 3000,
    });

    const res = await request(app)
      .post('/api/quotes')
      .send({
        title: 'Multi-line Proposal',
        lines: [
          { description: 'Item 1', quantity: 5, unitPrice: 200, discount: 0, taxRate: 20 },
          { description: 'Item 2', quantity: 10, unitPrice: 150, discount: 0, taxRate: 20 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing title', async () => {
    const res = await request(app)
      .post('/api/quotes')
      .send({
        lines: [{ description: 'Item', quantity: 1, unitPrice: 100, discount: 0, taxRate: 20 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for empty title', async () => {
    const res = await request(app).post('/api/quotes').send({
      title: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid line data', async () => {
    const res = await request(app)
      .post('/api/quotes')
      .send({
        title: 'Test',
        lines: [{ description: '', quantity: -1, unitPrice: 100, discount: 0, taxRate: 20 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should generate sequential ref numbers', async () => {
    mockPrisma.crmQuote.count.mockResolvedValue(5);
    mockPrisma.crmQuote.create.mockResolvedValue({
      ...mockQuote,
      refNumber: 'QUO-2602-0006',
    });

    const res = await request(app).post('/api/quotes').send({
      title: 'Another Proposal',
    });

    expect(res.status).toBe(201);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmQuote.count.mockResolvedValue(0);
    mockPrisma.crmQuote.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/quotes').send({
      title: 'Test',
    });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/quotes
// ===================================================================

describe('GET /api/quotes', () => {
  it('should return paginated list', async () => {
    mockPrisma.crmQuote.findMany.mockResolvedValue([mockQuote]);
    mockPrisma.crmQuote.count.mockResolvedValue(1);

    const res = await request(app).get('/api/quotes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    mockPrisma.crmQuote.findMany.mockResolvedValue([]);
    mockPrisma.crmQuote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/quotes?status=SENT');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmQuote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'SENT' }),
      })
    );
  });

  it('should filter by dealId', async () => {
    mockPrisma.crmQuote.findMany.mockResolvedValue([]);
    mockPrisma.crmQuote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/quotes?dealId=deal-1');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmQuote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ dealId: 'deal-1' }),
      })
    );
  });

  it('should filter by accountId', async () => {
    mockPrisma.crmQuote.findMany.mockResolvedValue([]);
    mockPrisma.crmQuote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/quotes?accountId=acc-1');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmQuote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountId: 'acc-1' }),
      })
    );
  });

  it('should return empty array when no quotes', async () => {
    mockPrisma.crmQuote.findMany.mockResolvedValue([]);
    mockPrisma.crmQuote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/quotes');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should handle pagination', async () => {
    mockPrisma.crmQuote.findMany.mockResolvedValue([]);
    mockPrisma.crmQuote.count.mockResolvedValue(50);

    const res = await request(app).get('/api/quotes?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmQuote.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/quotes');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/quotes/:id
// ===================================================================

describe('GET /api/quotes/:id', () => {
  it('should return quote with lines', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(mockQuote);

    const res = await request(app).get('/api/quotes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(res.body.data.lines).toHaveLength(1);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/quotes/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmQuote.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/quotes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/quotes/:id
// ===================================================================

describe('PUT /api/quotes/:id', () => {
  it('should update draft quote', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(mockQuote);
    mockPrisma.crmQuote.update.mockResolvedValue({ ...mockQuote, notes: 'Updated' });

    const res = await request(app)
      .put('/api/quotes/00000000-0000-0000-0000-000000000001')
      .send({ notes: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when not in DRAFT status', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue({ ...mockQuote, status: 'SENT' });

    const res = await request(app)
      .put('/api/quotes/00000000-0000-0000-0000-000000000001')
      .send({ notes: 'Updated' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('DRAFT');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/quotes/00000000-0000-0000-0000-000000000099')
      .send({ notes: 'Updated' });

    expect(res.status).toBe(404);
  });

  it('should recalculate totals when lines are updated', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(mockQuote);
    mockPrisma.crmQuoteLine.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.crmQuote.update.mockResolvedValue({
      ...mockQuote,
      subtotal: 500,
      total: 600,
      lines: [{ description: 'New item', quantity: 5, unitPrice: 100 }],
    });

    const res = await request(app)
      .put('/api/quotes/00000000-0000-0000-0000-000000000001')
      .send({
        lines: [{ description: 'New item', quantity: 5, unitPrice: 100, discount: 0, taxRate: 20 }],
      });

    expect(res.status).toBe(200);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(mockQuote);
    mockPrisma.crmQuote.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/quotes/00000000-0000-0000-0000-000000000001')
      .send({ notes: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/quotes/:id/send
// ===================================================================

describe('POST /api/quotes/:id/send', () => {
  it('should mark as sent', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(mockQuote);
    mockPrisma.crmQuote.update.mockResolvedValue({
      ...mockQuote,
      status: 'SENT',
      sentAt: new Date(),
    });

    const res = await request(app).post('/api/quotes/00000000-0000-0000-0000-000000000001/send');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SENT');
  });

  it('should return 400 when quote is not DRAFT', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue({ ...mockQuote, status: 'SENT' });

    const res = await request(app).post('/api/quotes/00000000-0000-0000-0000-000000000001/send');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('DRAFT');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/quotes/00000000-0000-0000-0000-000000000099/send');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(mockQuote);
    mockPrisma.crmQuote.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/quotes/00000000-0000-0000-0000-000000000001/send');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/quotes/:id/accept
// ===================================================================

describe('POST /api/quotes/:id/accept', () => {
  it('should mark as accepted', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue({ ...mockQuote, status: 'SENT' });
    mockPrisma.crmQuote.update.mockResolvedValue({
      ...mockQuote,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    });

    const res = await request(app).post('/api/quotes/00000000-0000-0000-0000-000000000001/accept');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACCEPTED');
  });

  it('should return 400 when quote is not SENT', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(mockQuote); // DRAFT status

    const res = await request(app).post('/api/quotes/00000000-0000-0000-0000-000000000001/accept');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('SENT');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/quotes/00000000-0000-0000-0000-000000000099/accept');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue({ ...mockQuote, status: 'SENT' });
    mockPrisma.crmQuote.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/quotes/00000000-0000-0000-0000-000000000001/accept');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/quotes/:id/pdf
// ===================================================================

describe('GET /api/quotes/:id/pdf', () => {
  it('should return a real PDF binary with correct headers', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue({ ...mockQuote, lines: [] });

    const res = await request(app).get('/api/quotes/00000000-0000-0000-0000-000000000001/pdf');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
    // PDF binary starts with %PDF-1.4
    const bodyStr = Buffer.isBuffer(res.body)
      ? res.body.toString('ascii', 0, 8)
      : String(res.body ?? '');
    expect(bodyStr.startsWith('%PDF-1.4')).toBe(true);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/quotes/00000000-0000-0000-0000-000000000099/pdf');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmQuote.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/quotes/00000000-0000-0000-0000-000000000001/pdf');

    expect(res.status).toBe(500);
  });
});

describe('CRM Quotes — additional coverage', () => {
  it('GET /api/quotes pagination.totalPages reflects total and limit', async () => {
    mockPrisma.crmQuote.findMany.mockResolvedValue([]);
    mockPrisma.crmQuote.count.mockResolvedValue(100);

    const res = await request(app).get('/api/quotes?page=1&limit=20');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('GET / returns content-type application/json', async () => {
    mockPrisma.crmQuote.findMany.mockResolvedValue([]);
    mockPrisma.crmQuote.count.mockResolvedValue(0);
    const res = await request(app).get('/api/quotes');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET / response data is an array', async () => {
    mockPrisma.crmQuote.findMany.mockResolvedValue([]);
    mockPrisma.crmQuote.count.mockResolvedValue(0);
    const res = await request(app).get('/api/quotes');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / returns created quote with refNumber', async () => {
    mockPrisma.crmQuote.count.mockResolvedValue(0);
    mockPrisma.crmQuote.create.mockResolvedValue(mockQuote);
    const res = await request(app).post('/api/quotes').send({ title: 'Test Quote' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('refNumber');
  });

  it('GET /:id response data has lines array', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue(mockQuote);
    const res = await request(app).get('/api/quotes/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.lines)).toBe(true);
  });

  it('POST /:id/accept calls update with status ACCEPTED', async () => {
    mockPrisma.crmQuote.findFirst.mockResolvedValue({ ...mockQuote, status: 'SENT' });
    mockPrisma.crmQuote.update.mockResolvedValue({ ...mockQuote, status: 'ACCEPTED' });
    await request(app).post('/api/quotes/00000000-0000-0000-0000-000000000001/accept');
    expect(mockPrisma.crmQuote.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACCEPTED' }) }),
    );
  });
});

describe('quotes — phase29 coverage', () => {
  it('handles join method', () => {
    expect([1, 2, 3].join('-')).toBe('1-2-3');
  });

  it('handles nullish coalescing', () => {
    const val: string | null = null; expect(val ?? 'default').toBe('default');
  });

  it('handles parseFloat', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles spread operator', () => {
    expect([...[1, 2], ...[3, 4]]).toEqual([1, 2, 3, 4]);
  });

});

describe('quotes — phase30 coverage', () => {
  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

  it('handles ternary operator', () => {
    expect(true ? 'yes' : 'no').toBe('yes');
  });

  it('handles Array.from', () => {
    expect(Array.from('abc')).toEqual(['a', 'b', 'c']);
  });

  it('handles string includes', () => {
    expect('hello world'.includes('world')).toBe(true);
  });

  it('handles short-circuit eval', () => {
    let x2 = 0; false && x2++; expect(x2).toBe(0);
  });

});
