import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcCustomer: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fsSvcSite: {
      findMany: jest.fn(),
    },
    fsSvcJob: {
      findMany: jest.fn(),
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

import customersRouter from '../src/routes/customers';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/customers', customersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/customers', () => {
  it('should return a list of customers with pagination', async () => {
    const customers = [
      { id: 'cust-1', name: 'Acme Corp', code: 'CUST-1001' },
      { id: 'cust-2', name: 'Beta Inc', code: 'CUST-1002' },
    ];
    (prisma as any).fsSvcCustomer.findMany.mockResolvedValue(customers);
    (prisma as any).fsSvcCustomer.count.mockResolvedValue(2);

    const res = await request(app).get('/api/customers');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by isActive', async () => {
    (prisma as any).fsSvcCustomer.findMany.mockResolvedValue([]);
    (prisma as any).fsSvcCustomer.count.mockResolvedValue(0);

    await request(app).get('/api/customers?isActive=true');

    expect((prisma as any).fsSvcCustomer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).fsSvcCustomer.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/customers');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/customers', () => {
  it('should create a customer with generated code', async () => {
    const created = { id: 'cust-new', name: 'New Customer', code: 'CUST-5678', address: { city: 'London' } };
    (prisma as any).fsSvcCustomer.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/customers')
      .send({ name: 'New Customer', address: { city: 'London' } });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toMatch(/^CUST-/);
  });

  it('should reject invalid data', async () => {
    const res = await request(app)
      .post('/api/customers')
      .send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/customers/:id', () => {
  it('should return a customer with sites and contracts', async () => {
    const customer = { id: 'cust-1', name: 'Acme', sites: [], contracts: [] };
    (prisma as any).fsSvcCustomer.findFirst.mockResolvedValue(customer);

    const res = await request(app).get('/api/customers/cust-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('cust-1');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcCustomer.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/customers/missing');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/customers/:id/sites', () => {
  it('should return customer sites', async () => {
    (prisma as any).fsSvcCustomer.findFirst.mockResolvedValue({ id: 'cust-1' });
    (prisma as any).fsSvcSite.findMany.mockResolvedValue([{ id: 'site-1', name: 'HQ' }]);

    const res = await request(app).get('/api/customers/cust-1/sites');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 if customer not found', async () => {
    (prisma as any).fsSvcCustomer.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/customers/missing/sites');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/customers/:id/jobs', () => {
  it('should return customer jobs with pagination', async () => {
    (prisma as any).fsSvcCustomer.findFirst.mockResolvedValue({ id: 'cust-1' });
    (prisma as any).fsSvcJob.findMany.mockResolvedValue([{ id: 'job-1' }]);
    (prisma as any).fsSvcJob.count.mockResolvedValue(1);

    const res = await request(app).get('/api/customers/cust-1/jobs');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('PUT /api/customers/:id', () => {
  it('should update a customer', async () => {
    (prisma as any).fsSvcCustomer.findFirst.mockResolvedValue({ id: 'cust-1' });
    (prisma as any).fsSvcCustomer.update.mockResolvedValue({ id: 'cust-1', name: 'Updated' });

    const res = await request(app)
      .put('/api/customers/cust-1')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcCustomer.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/customers/missing')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/customers/:id', () => {
  it('should soft delete a customer', async () => {
    (prisma as any).fsSvcCustomer.findFirst.mockResolvedValue({ id: 'cust-1' });
    (prisma as any).fsSvcCustomer.update.mockResolvedValue({ id: 'cust-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/customers/cust-1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Customer deleted');
  });

  it('should return 404 for not found', async () => {
    (prisma as any).fsSvcCustomer.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/customers/missing');

    expect(res.status).toBe(404);
  });
});
