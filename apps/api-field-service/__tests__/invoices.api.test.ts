import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcInvoice: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import invoicesRouter from '../src/routes/invoices';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/invoices', invoicesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/invoices', () => {
  it('should return invoices with pagination', async () => {
    const invoices = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        number: 'FSI-2602-1234',
        status: 'DRAFT',
        job: {},
        customer: {},
      },
    ];
    (prisma as any).fsSvcInvoice.findMany.mockResolvedValue(invoices);
    (prisma as any).fsSvcInvoice.count.mockResolvedValue(1);

    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    (prisma as any).fsSvcInvoice.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcInvoice.count.mockResolvedValue(0);

    await request(app).get('/api/invoices?customerId=cust-1');

    expect((prisma as any).fsSvcInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ customerId: 'cust-1' }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma as any).fsSvcInvoice.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcInvoice.count.mockResolvedValue(0);

    await request(app).get('/api/invoices?status=PAID');

    expect((prisma as any).fsSvcInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PAID' }),
      })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).fsSvcInvoice.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/invoices', () => {
  it('should create an invoice with generated number', async () => {
    const created = { id: 'inv-new', number: 'FSI-2602-5678', status: 'DRAFT' };
    (prisma as any).fsSvcInvoice.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/invoices')
      .send({
        jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        lineItems: [{ description: 'Labour', amount: 200 }],
        laborTotal: 200,
        partsTotal: 50,
        total: 250,
        dueDate: '2026-03-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/invoices').send({ total: -1 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/invoices/:id', () => {
  it('should return an invoice by id', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      number: 'FSI-001',
      job: {},
      customer: {},
    });

    const res = await request(app).get('/api/invoices/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/invoices/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/invoices/:id', () => {
  it('should update an invoice', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).fsSvcInvoice.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      total: 300,
    });

    const res = await request(app)
      .put('/api/invoices/00000000-0000-0000-0000-000000000001')
      .send({ total: 300 });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/invoices/00000000-0000-0000-0000-000000000099')
      .send({ total: 300 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/invoices/:id', () => {
  it('should soft delete an invoice', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).fsSvcInvoice.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/invoices/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Invoice deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/invoices/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/invoices/:id/send', () => {
  it('should send a draft invoice', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DRAFT',
    });
    (prisma as any).fsSvcInvoice.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SENT',
    });

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001/send');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SENT');
  });

  it('should reject if not draft', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SENT',
    });

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001/send');

    expect(res.status).toBe(400);
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000099/send');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/invoices/:id/pay', () => {
  it('should mark invoice as paid', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SENT',
    });
    (prisma as any).fsSvcInvoice.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PAID',
      paidDate: new Date(),
    });

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001/pay');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PAID');
  });

  it('should reject if already paid', async () => {
    (prisma as any).fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PAID',
    });

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001/pay');

    expect(res.status).toBe(400);
  });
});
