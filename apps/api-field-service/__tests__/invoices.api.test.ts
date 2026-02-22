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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
    mockPrisma.fsSvcInvoice.findMany.mockResolvedValue(invoices);
    mockPrisma.fsSvcInvoice.count.mockResolvedValue(1);

    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    mockPrisma.fsSvcInvoice.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcInvoice.count.mockResolvedValue(0);

    await request(app).get('/api/invoices?customerId=cust-1');

    expect(mockPrisma.fsSvcInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ customerId: 'cust-1' }),
      })
    );
  });

  it('should filter by status', async () => {
    mockPrisma.fsSvcInvoice.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcInvoice.count.mockResolvedValue(0);

    await request(app).get('/api/invoices?status=PAID');

    expect(mockPrisma.fsSvcInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PAID' }),
      })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.fsSvcInvoice.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/invoices', () => {
  it('should create an invoice with generated number', async () => {
    const created = { id: 'inv-new', number: 'FSI-2602-5678', status: 'DRAFT' };
    mockPrisma.fsSvcInvoice.create.mockResolvedValue(created);

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
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
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
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/invoices/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/invoices/:id', () => {
  it('should update an invoice', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcInvoice.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      total: 300,
    });

    const res = await request(app)
      .put('/api/invoices/00000000-0000-0000-0000-000000000001')
      .send({ total: 300 });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/invoices/00000000-0000-0000-0000-000000000099')
      .send({ total: 300 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/invoices/:id', () => {
  it('should soft delete an invoice', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcInvoice.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/invoices/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Invoice deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/invoices/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/invoices/:id/send', () => {
  it('should send a draft invoice', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.fsSvcInvoice.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SENT',
    });

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001/send');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SENT');
  });

  it('should reject if not draft', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SENT',
    });

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001/send');

    expect(res.status).toBe(400);
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000099/send');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/invoices/:id/pay', () => {
  it('should mark invoice as paid', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SENT',
    });
    mockPrisma.fsSvcInvoice.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PAID',
      paidDate: new Date(),
    });

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001/pay');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PAID');
  });

  it('should reject if already paid', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PAID',
    });

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001/pay');

    expect(res.status).toBe(400);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcInvoice.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/invoices');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcInvoice.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/invoices').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      lineItems: [{ description: 'Labour', amount: 200 }],
      laborTotal: 200,
      partsTotal: 50,
      total: 250,
      dueDate: '2026-03-01',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcInvoice.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001').send({ status: 'SENT' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Extended coverage ───────────────────────────────────────────────────────

describe('invoices.api — extended edge cases', () => {
  it('GET / returns pagination metadata', async () => {
    mockPrisma.fsSvcInvoice.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', number: 'FSI-001', status: 'DRAFT', job: {}, customer: {} },
    ]);
    mockPrisma.fsSvcInvoice.count.mockResolvedValue(8);

    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination.total).toBe(8);
  });

  it('GET / applies page and limit to query', async () => {
    mockPrisma.fsSvcInvoice.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcInvoice.count.mockResolvedValue(0);

    await request(app).get('/api/invoices?page=2&limit=5');

    expect(mockPrisma.fsSvcInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('GET / filters by jobId', async () => {
    mockPrisma.fsSvcInvoice.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcInvoice.count.mockResolvedValue(0);

    await request(app).get('/api/invoices?jobId=00000000-0000-0000-0000-000000000001');

    expect(mockPrisma.fsSvcInvoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ jobId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('PUT /:id/send returns 404 when invoice not found', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000099/send');

    expect(res.status).toBe(404);
  });

  it('PUT /:id/pay returns 404 when invoice not found', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000099/pay');

    expect(res.status).toBe(404);
  });

  it('PUT /:id/send returns 500 on DB error during update', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.fsSvcInvoice.update.mockRejectedValue(new Error('DB down'));

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000001/send');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns success:true', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000002' });
    mockPrisma.fsSvcInvoice.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000002', deletedAt: new Date() });

    const res = await request(app).delete('/api/invoices/00000000-0000-0000-0000-000000000002');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id/pay returns 500 on DB error during update', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      status: 'SENT',
    });
    mockPrisma.fsSvcInvoice.update.mockRejectedValue(new Error('DB down'));

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000003/pay');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update rejects', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000004' });
    mockPrisma.fsSvcInvoice.update.mockRejectedValue(new Error('DB down'));

    const res = await request(app).delete('/api/invoices/00000000-0000-0000-0000-000000000004');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 400 when lineItems is missing', async () => {
    const res = await request(app).post('/api/invoices').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      laborTotal: 100,
      partsTotal: 0,
      total: 100,
      dueDate: '2026-03-01',
    });

    expect(res.status).toBe(400);
  });
});

// ─── Further coverage ─────────────────────────────────────────────────────────

describe('invoices.api — further coverage', () => {
  it('GET / returns success:true on empty result set', async () => {
    mockPrisma.fsSvcInvoice.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcInvoice.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET / pagination.page defaults to 1 when not supplied', async () => {
    mockPrisma.fsSvcInvoice.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcInvoice.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices');

    expect(res.body.pagination.page).toBe(1);
  });

  it('POST / create is called with jobId and customerId', async () => {
    mockPrisma.fsSvcInvoice.create.mockResolvedValue({
      id: 'inv-x',
      number: 'FSI-2026-0001',
      status: 'DRAFT',
    });

    await request(app).post('/api/invoices').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      lineItems: [{ description: 'Labour', amount: 100 }],
      laborTotal: 100,
      partsTotal: 0,
      total: 100,
      dueDate: '2026-04-01',
    });

    expect(mockPrisma.fsSvcInvoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          customerId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        }),
      })
    );
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/invoices/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id/pay returns success:true when status updated to PAID', async () => {
    mockPrisma.fsSvcInvoice.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000010',
      status: 'SENT',
    });
    mockPrisma.fsSvcInvoice.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000010',
      status: 'PAID',
      paidDate: new Date(),
    });

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000010/pay');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
