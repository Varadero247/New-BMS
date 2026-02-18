import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finCustomer: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finInvoice: {
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
    FinCustomerWhereInput: {},
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

import router from '../src/routes/customers';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/customers', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/customers
// ===================================================================

describe('GET /api/customers', () => {
  it('should return a list of customers', async () => {
    const customers = [
      {
        id: 'f4000000-0000-4000-a000-000000000001',
        code: 'CUST-ACME-1234',
        name: 'Acme Corp',
        _count: { invoices: 5 },
      },
      {
        id: 'f4000000-0000-4000-a000-000000000002',
        code: 'CUST-BETA-5678',
        name: 'Beta Inc',
        _count: { invoices: 2 },
      },
    ];
    (prisma as any).finCustomer.findMany.mockResolvedValue(customers);
    (prisma as any).finCustomer.count.mockResolvedValue(2);

    const res = await request(app).get('/api/customers');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should search customers by name, code, email, contactPerson', async () => {
    (prisma as any).finCustomer.findMany.mockResolvedValue([]);
    (prisma as any).finCustomer.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customers?search=acme');

    expect(res.status).toBe(200);
    expect((prisma as any).finCustomer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'acme' }) }),
          ]),
        }),
      })
    );
  });

  it('should filter by isActive', async () => {
    (prisma as any).finCustomer.findMany.mockResolvedValue([]);
    (prisma as any).finCustomer.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customers?isActive=true');

    expect(res.status).toBe(200);
    expect((prisma as any).finCustomer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    );
  });

  it('should filter by country', async () => {
    (prisma as any).finCustomer.findMany.mockResolvedValue([]);
    (prisma as any).finCustomer.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customers?country=GB');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).finCustomer.findMany.mockResolvedValue([]);
    (prisma as any).finCustomer.count.mockResolvedValue(50);

    const res = await request(app).get('/api/customers?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finCustomer.findMany.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/customers');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/customers/:id
// ===================================================================

describe('GET /api/customers/:id', () => {
  it('should return a customer with invoice summary', async () => {
    const customer = {
      id: 'f4000000-0000-4000-a000-000000000001',
      code: 'CUST-ACME-1234',
      name: 'Acme Corp',
      deletedAt: null,
      invoices: [
        {
          id: 'f4100000-0000-4000-a000-000000000001',
          reference: 'FIN-INV-001',
          issueDate: '2026-01-15',
          dueDate: '2026-02-15',
          status: 'SENT',
          total: 1000,
          amountDue: 1000,
        },
      ],
      _count: { invoices: 1 },
    };
    (prisma as any).finCustomer.findFirst.mockResolvedValue(customer);

    const res = await request(app).get('/api/customers/f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('f4000000-0000-4000-a000-000000000001');
  });

  it('should return 404 when customer not found', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/customers/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Customer not found');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finCustomer.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/customers/f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/customers
// ===================================================================

describe('POST /api/customers', () => {
  const validCustomer = {
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+44 20 1234 5678',
    country: 'GB',
    currency: 'GBP',
    paymentTerms: 30,
  };

  it('should create a customer successfully', async () => {
    (prisma as any).finCustomer.create.mockResolvedValue({
      id: 'cust-new',
      code: 'CUST-ACMEC-1234',
      ...validCustomer,
    });

    const res = await request(app).post('/api/customers').send(validCustomer);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('cust-new');
  });

  it('should return 400 for validation error (missing name)', async () => {
    const res = await request(app).post('/api/customers').send({
      email: 'billing@acme.com',
      country: 'GB',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/customers')
      .send({
        ...validCustomer,
        email: 'not-an-email',
      });

    expect(res.status).toBe(400);
  });

  it('should return 409 on duplicate customer code', async () => {
    const err = Object.assign(new Error('Unique violation'), { code: 'P2002' });
    (prisma as any).finCustomer.create.mockRejectedValue(err);

    const res = await request(app).post('/api/customers').send(validCustomer);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Customer code must be unique');
  });

  it('should return 500 on unexpected error', async () => {
    (prisma as any).finCustomer.create.mockRejectedValue(new Error('Unexpected DB error'));

    const res = await request(app).post('/api/customers').send(validCustomer);

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/customers/:id
// ===================================================================

describe('PUT /api/customers/:id', () => {
  it('should update a customer successfully', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });
    (prisma as any).finCustomer.update.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      name: 'Updated Acme Corp',
    });

    const res = await request(app)
      .put('/api/customers/f4000000-0000-4000-a000-000000000001')
      .send({ name: 'Updated Acme Corp' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update isActive flag', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });
    (prisma as any).finCustomer.update.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      isActive: false,
    });

    const res = await request(app)
      .put('/api/customers/f4000000-0000-4000-a000-000000000001')
      .send({ isActive: false });

    expect(res.status).toBe(200);
  });

  it('should return 404 when customer not found', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/customers/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for validation error', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });

    const res = await request(app)
      .put('/api/customers/f4000000-0000-4000-a000-000000000001')
      .send({ email: 'invalid-email' });

    expect(res.status).toBe(400);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });
    (prisma as any).finCustomer.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/customers/f4000000-0000-4000-a000-000000000001')
      .send({ name: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// DELETE /api/customers/:id
// ===================================================================

describe('DELETE /api/customers/:id', () => {
  it('should soft delete a customer with no invoices', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });
    (prisma as any).finInvoice.count.mockResolvedValue(0);
    (prisma as any).finCustomer.update.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete('/api/customers/f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when customer not found', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/customers/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 409 when customer has existing invoices', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });
    (prisma as any).finInvoice.count.mockResolvedValue(3);

    const res = await request(app).delete('/api/customers/f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('invoice(s) exist');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finCustomer.findFirst.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });
    (prisma as any).finInvoice.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/customers/f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(500);
  });
});
