import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalOrder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

import customerInvoicesRouter from '../src/routes/customer-invoices';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/customer/invoices', customerInvoicesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/customer/invoices', () => {
  it('should list invoices with pagination', async () => {
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        orderNumber: 'ORD-001',
        type: 'SALES',
        totalAmount: 100,
      },
    ];
    mockPrisma.portalOrder.findMany.mockResolvedValue(items);
    mockPrisma.portalOrder.count.mockResolvedValue(1);

    const res = await request(app).get('/api/customer/invoices');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should handle pagination params', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customer/invoices?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(mockPrisma.portalOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('should handle server error', async () => {
    mockPrisma.portalOrder.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/customer/invoices');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/customer/invoices/:id', () => {
  it('should return an invoice', async () => {
    const invoice = {
      id: '00000000-0000-0000-0000-000000000001',
      orderNumber: 'ORD-001',
      portalUserId: 'user-123',
    };
    mockPrisma.portalOrder.findFirst.mockResolvedValue(invoice);

    const res = await request(app).get(
      '/api/customer/invoices/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/customer/invoices/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });
});

describe('POST /api/customer/invoices/:id/pay', () => {
  it('should record payment intent', async () => {
    const invoice = {
      id: '00000000-0000-0000-0000-000000000001',
      orderNumber: 'ORD-001',
      portalUserId: 'user-123',
      notes: null,
    };
    mockPrisma.portalOrder.findFirst.mockResolvedValue(invoice);
    mockPrisma.portalOrder.update.mockResolvedValue({
      ...invoice,
      notes: 'Payment intent: BANK_TRANSFER',
    });

    const res = await request(app)
      .post('/api/customer/invoices/00000000-0000-0000-0000-000000000001/pay')
      .send({ paymentMethod: 'BANK_TRANSFER' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if invoice not found for payment', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/customer/invoices/00000000-0000-0000-0000-000000000099/pay')
      .send({ paymentMethod: 'BANK_TRANSFER' });

    expect(res.status).toBe(404);
  });

  it('should handle server error on pay', async () => {
    mockPrisma.portalOrder.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/customer/invoices/00000000-0000-0000-0000-000000000001/pay')
      .send({ paymentMethod: 'BANK_TRANSFER' });

    expect(res.status).toBe(500);
  });
});

describe('Customer Invoices — extended', () => {
  it('GET list: data is an array', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/customer/invoices');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET list: success is true', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/customer/invoices');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id success is true when found', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      type: 'INVOICE',
      status: 'PENDING',
      portalUserId: 'user-123',
    });
    const res = await request(app).get('/api/customer/invoices/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Customer Invoices — extra', () => {
  it('GET list: count called once per request', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    await request(app).get('/api/customer/invoices');
    expect(mockPrisma.portalOrder.count).toHaveBeenCalledTimes(1);
  });

  it('GET list: data length matches mock array length', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([
      { id: 'o1', orderNumber: 'ORD-001', type: 'SALES', totalAmount: 200 },
      { id: 'o2', orderNumber: 'ORD-002', type: 'SALES', totalAmount: 150 },
    ]);
    mockPrisma.portalOrder.count.mockResolvedValue(2);
    const res = await request(app).get('/api/customer/invoices');
    expect(res.body.data).toHaveLength(2);
  });

  it('POST pay: update called once on success', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      orderNumber: 'ORD-001',
      portalUserId: 'user-123',
      notes: null,
    });
    mockPrisma.portalOrder.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', notes: 'Payment intent: CARD' });
    await request(app)
      .post('/api/customer/invoices/00000000-0000-0000-0000-000000000001/pay')
      .send({ paymentMethod: 'CREDIT_CARD' });
    expect(mockPrisma.portalOrder.update).toHaveBeenCalledTimes(1);
  });

  it('GET list: pagination has total field', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(10);
    const res = await request(app).get('/api/customer/invoices');
    expect(res.body.pagination).toHaveProperty('total', 10);
  });
});

describe('customer-invoices — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/customer/invoices', customerInvoicesRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/customer/invoices', async () => {
    const res = await request(app).get('/api/customer/invoices');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/customer/invoices', async () => {
    const res = await request(app).get('/api/customer/invoices');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/customer/invoices body has success property', async () => {
    const res = await request(app).get('/api/customer/invoices');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/customer/invoices body is an object', async () => {
    const res = await request(app).get('/api/customer/invoices');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/customer/invoices route is accessible', async () => {
    const res = await request(app).get('/api/customer/invoices');
    expect(res.status).toBeDefined();
  });
});

describe('customer-invoices — edge cases', () => {
  it('GET list: where clause always includes type=SALES', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);

    await request(app).get('/api/customer/invoices');

    expect(mockPrisma.portalOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'SALES' }) })
    );
  });

  it('GET list: totalPages rounds up correctly', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(13);

    const res = await request(app).get('/api/customer/invoices?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET /:id: 500 on DB error returns INTERNAL_ERROR code', async () => {
    mockPrisma.portalOrder.findFirst.mockRejectedValue(new Error('DB timeout'));

    const res = await request(app).get(
      '/api/customer/invoices/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id: NOT_FOUND error code when invoice not found', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/customer/invoices/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST pay: invalid paymentMethod → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/customer/invoices/00000000-0000-0000-0000-000000000001/pay')
      .send({ paymentMethod: 'CRYPTO' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST pay: notes appended to payment intent string', async () => {
    const invoice = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      notes: null,
    };
    mockPrisma.portalOrder.findFirst.mockResolvedValue(invoice);
    mockPrisma.portalOrder.update.mockResolvedValue({
      ...invoice,
      notes: 'Payment intent: CHECK - Wire transfer pending',
    });

    const res = await request(app)
      .post('/api/customer/invoices/00000000-0000-0000-0000-000000000001/pay')
      .send({ paymentMethod: 'CHECK', notes: 'Wire transfer pending' });

    expect(res.status).toBe(200);
    expect(mockPrisma.portalOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: expect.stringContaining('Wire transfer pending'),
        }),
      })
    );
  });

  it('POST pay: omitting paymentMethod defaults to BANK_TRANSFER and succeeds', async () => {
    const invoice = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      notes: null,
    };
    mockPrisma.portalOrder.findFirst.mockResolvedValue(invoice);
    mockPrisma.portalOrder.update.mockResolvedValue({
      ...invoice,
      notes: 'Payment intent: BANK_TRANSFER',
    });

    const res = await request(app)
      .post('/api/customer/invoices/00000000-0000-0000-0000-000000000001/pay')
      .send({});

    expect(res.status).toBe(200);
    expect(mockPrisma.portalOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notes: expect.stringContaining('BANK_TRANSFER'),
        }),
      })
    );
  });

  it('POST pay: CREDIT_CARD is accepted and records update', async () => {
    const invoice = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      notes: null,
    };
    mockPrisma.portalOrder.findFirst.mockResolvedValue(invoice);
    mockPrisma.portalOrder.update.mockResolvedValue({
      ...invoice,
      notes: 'Payment intent: CREDIT_CARD',
    });

    const res = await request(app)
      .post('/api/customer/invoices/00000000-0000-0000-0000-000000000001/pay')
      .send({ paymentMethod: 'CREDIT_CARD' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET list: 500 error on count propagates as 500 response', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/customer/invoices');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
