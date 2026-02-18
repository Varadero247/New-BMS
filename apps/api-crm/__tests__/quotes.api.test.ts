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

const app = express();
app.use(express.json());
app.use('/api/quotes', quotesRouter);

beforeEach(() => { jest.clearAllMocks(); });

const mockQuote = {
  id: 'quote-1',
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
    (prisma as any).crmQuote.count.mockResolvedValue(0);
    (prisma as any).crmQuote.create.mockResolvedValue(mockQuote);

    const res = await request(app).post('/api/quotes').send({
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
    (prisma as any).crmQuote.count.mockResolvedValue(0);
    (prisma as any).crmQuote.create.mockResolvedValue({
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
    (prisma as any).crmQuote.count.mockResolvedValue(5);
    (prisma as any).crmQuote.create.mockResolvedValue({
      ...mockQuote,
      subtotal: 2500,
      taxTotal: 500,
      total: 3000,
    });

    const res = await request(app).post('/api/quotes').send({
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
    const res = await request(app).post('/api/quotes').send({
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
    const res = await request(app).post('/api/quotes').send({
      title: 'Test',
      lines: [{ description: '', quantity: -1, unitPrice: 100, discount: 0, taxRate: 20 }],
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should generate sequential ref numbers', async () => {
    (prisma as any).crmQuote.count.mockResolvedValue(5);
    (prisma as any).crmQuote.create.mockResolvedValue({
      ...mockQuote,
      refNumber: 'QUO-2602-0006',
    });

    const res = await request(app).post('/api/quotes').send({
      title: 'Another Proposal',
    });

    expect(res.status).toBe(201);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmQuote.count.mockResolvedValue(0);
    (prisma as any).crmQuote.create.mockRejectedValue(new Error('DB error'));

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
    (prisma as any).crmQuote.findMany.mockResolvedValue([mockQuote]);
    (prisma as any).crmQuote.count.mockResolvedValue(1);

    const res = await request(app).get('/api/quotes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    (prisma as any).crmQuote.findMany.mockResolvedValue([]);
    (prisma as any).crmQuote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/quotes?status=SENT');

    expect(res.status).toBe(200);
    expect((prisma as any).crmQuote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'SENT' }),
      })
    );
  });

  it('should filter by dealId', async () => {
    (prisma as any).crmQuote.findMany.mockResolvedValue([]);
    (prisma as any).crmQuote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/quotes?dealId=deal-1');

    expect(res.status).toBe(200);
    expect((prisma as any).crmQuote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ dealId: 'deal-1' }),
      })
    );
  });

  it('should filter by accountId', async () => {
    (prisma as any).crmQuote.findMany.mockResolvedValue([]);
    (prisma as any).crmQuote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/quotes?accountId=acc-1');

    expect(res.status).toBe(200);
    expect((prisma as any).crmQuote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountId: 'acc-1' }),
      })
    );
  });

  it('should return empty array when no quotes', async () => {
    (prisma as any).crmQuote.findMany.mockResolvedValue([]);
    (prisma as any).crmQuote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/quotes');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should handle pagination', async () => {
    (prisma as any).crmQuote.findMany.mockResolvedValue([]);
    (prisma as any).crmQuote.count.mockResolvedValue(50);

    const res = await request(app).get('/api/quotes?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmQuote.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/quotes');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/quotes/:id
// ===================================================================

describe('GET /api/quotes/:id', () => {
  it('should return quote with lines', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(mockQuote);

    const res = await request(app).get('/api/quotes/quote-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('quote-1');
    expect(res.body.data.lines).toHaveLength(1);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/quotes/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmQuote.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/quotes/quote-1');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/quotes/:id
// ===================================================================

describe('PUT /api/quotes/:id', () => {
  it('should update draft quote', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(mockQuote);
    (prisma as any).crmQuote.update.mockResolvedValue({ ...mockQuote, notes: 'Updated' });

    const res = await request(app).put('/api/quotes/quote-1').send({ notes: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when not in DRAFT status', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue({ ...mockQuote, status: 'SENT' });

    const res = await request(app).put('/api/quotes/quote-1').send({ notes: 'Updated' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('DRAFT');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/quotes/nonexistent').send({ notes: 'Updated' });

    expect(res.status).toBe(404);
  });

  it('should recalculate totals when lines are updated', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(mockQuote);
    (prisma as any).crmQuoteLine.deleteMany.mockResolvedValue({ count: 1 });
    (prisma as any).crmQuote.update.mockResolvedValue({
      ...mockQuote,
      subtotal: 500,
      total: 600,
      lines: [{ description: 'New item', quantity: 5, unitPrice: 100 }],
    });

    const res = await request(app).put('/api/quotes/quote-1').send({
      lines: [{ description: 'New item', quantity: 5, unitPrice: 100, discount: 0, taxRate: 20 }],
    });

    expect(res.status).toBe(200);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(mockQuote);
    (prisma as any).crmQuote.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/quotes/quote-1').send({ notes: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/quotes/:id/send
// ===================================================================

describe('POST /api/quotes/:id/send', () => {
  it('should mark as sent', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(mockQuote);
    (prisma as any).crmQuote.update.mockResolvedValue({ ...mockQuote, status: 'SENT', sentAt: new Date() });

    const res = await request(app).post('/api/quotes/quote-1/send');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SENT');
  });

  it('should return 400 when quote is not DRAFT', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue({ ...mockQuote, status: 'SENT' });

    const res = await request(app).post('/api/quotes/quote-1/send');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('DRAFT');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/quotes/nonexistent/send');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(mockQuote);
    (prisma as any).crmQuote.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/quotes/quote-1/send');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/quotes/:id/accept
// ===================================================================

describe('POST /api/quotes/:id/accept', () => {
  it('should mark as accepted', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue({ ...mockQuote, status: 'SENT' });
    (prisma as any).crmQuote.update.mockResolvedValue({
      ...mockQuote,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    });

    const res = await request(app).post('/api/quotes/quote-1/accept');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACCEPTED');
  });

  it('should return 400 when quote is not SENT', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(mockQuote); // DRAFT status

    const res = await request(app).post('/api/quotes/quote-1/accept');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('SENT');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/quotes/nonexistent/accept');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue({ ...mockQuote, status: 'SENT' });
    (prisma as any).crmQuote.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/quotes/quote-1/accept');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/quotes/:id/pdf
// ===================================================================

describe('GET /api/quotes/:id/pdf', () => {
  it('should return a real PDF binary with correct headers', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue({ ...mockQuote, lines: [] });

    const res = await request(app).get('/api/quotes/quote-1/pdf');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
    // PDF binary starts with %PDF-1.4
    const bodyStr = Buffer.isBuffer(res.body) ? res.body.toString('ascii', 0, 8) : String(res.body ?? '');
    expect(bodyStr.startsWith('%PDF-1.4')).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmQuote.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/quotes/nonexistent/pdf');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmQuote.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/quotes/quote-1/pdf');

    expect(res.status).toBe(500);
  });
});
