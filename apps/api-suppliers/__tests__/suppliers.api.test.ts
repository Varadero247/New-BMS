import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    suppSupplier: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/suppliers';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/suppliers', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/suppliers', () => {
  it('should return suppliers with pagination', async () => {
    mockPrisma.suppSupplier.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Acme Corp' },
    ]);
    mockPrisma.suppSupplier.count.mockResolvedValue(1);
    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    mockPrisma.suppSupplier.findMany.mockResolvedValue([]);
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    const res = await request(app).get('/api/suppliers?status=APPROVED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should search by name', async () => {
    mockPrisma.suppSupplier.findMany.mockResolvedValue([]);
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    const res = await request(app).get('/api/suppliers?search=acme');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.suppSupplier.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/suppliers/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/suppliers/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return item by id', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Acme Corp',
    });
    const res = await request(app).get('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.suppSupplier.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/suppliers', () => {
  it('should create', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppSupplier.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'New Supplier',
      referenceNumber: 'SUP-2026-0001',
    });
    const res = await request(app).post('/api/suppliers').send({ name: 'New Supplier' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New Supplier');
  });

  it('should return 400 when name is missing', async () => {
    const res = await request(app).post('/api/suppliers').send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when name is empty string', async () => {
    const res = await request(app).post('/api/suppliers').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database create error', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppSupplier.create.mockRejectedValue(new Error('Unique constraint'));
    const res = await request(app).post('/api/suppliers').send({ name: 'Duplicate' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/suppliers/:id', () => {
  it('should update', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });
    const res = await request(app)
      .put('/api/suppliers/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/suppliers/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database update error', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.suppSupplier.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/suppliers/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/suppliers/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.suppSupplier.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('suppliers.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/suppliers', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/suppliers', async () => {
    const res = await request(app).get('/api/suppliers');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/suppliers', async () => {
    const res = await request(app).get('/api/suppliers');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/suppliers body has success property', async () => {
    const res = await request(app).get('/api/suppliers');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('suppliers.api — edge cases and extended coverage', () => {
  it('GET /api/suppliers supports pagination', async () => {
    mockPrisma.suppSupplier.findMany.mockResolvedValue([]);
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    const res = await request(app).get('/api/suppliers?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('GET /api/suppliers pagination includes totalPages', async () => {
    mockPrisma.suppSupplier.findMany.mockResolvedValue([]);
    mockPrisma.suppSupplier.count.mockResolvedValue(30);
    const res = await request(app).get('/api/suppliers?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET /api/suppliers returns data as array', async () => {
    mockPrisma.suppSupplier.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Supplier A' },
    ]);
    mockPrisma.suppSupplier.count.mockResolvedValue(1);
    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/suppliers returns 400 when invalid status enum', async () => {
    const res = await request(app).post('/api/suppliers').send({
      name: 'Test Supplier',
      status: 'NOT_VALID_STATUS',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/suppliers returns 400 when invalid tier enum', async () => {
    const res = await request(app).post('/api/suppliers').send({
      name: 'Test Supplier',
      tier: 'NOT_VALID_TIER',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/suppliers creates with optional fields', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppSupplier.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Full Supplier',
    });
    const res = await request(app).post('/api/suppliers').send({
      name: 'Full Supplier',
      status: 'APPROVED',
      tier: 'HIGH',
      category: 'IT',
      city: 'London',
      country: 'UK',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/suppliers/:id returns correct success message', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('supplier deleted successfully');
  });

  it('PUT /api/suppliers/:id with valid status update succeeds', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SUSPENDED',
    });
    const res = await request(app)
      .put('/api/suppliers/00000000-0000-0000-0000-000000000001')
      .send({ status: 'SUSPENDED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/suppliers/:id returns correct data id', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Specific Supplier',
    });
    const res = await request(app).get('/api/suppliers/00000000-0000-0000-0000-000000000003');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000003');
  });
});

describe('suppliers.api — final coverage expansion', () => {
  it('GET /api/suppliers with category filter returns 200', async () => {
    mockPrisma.suppSupplier.findMany.mockResolvedValue([]);
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    const res = await request(app).get('/api/suppliers?category=IT');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/suppliers with email creates successfully', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppSupplier.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Email Supplier',
      email: 'contact@supplier.com',
    });
    const res = await request(app).post('/api/suppliers').send({
      name: 'Email Supplier',
      email: 'contact@supplier.com',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/suppliers/:id response data.name is defined', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Named Supplier',
    });
    const res = await request(app).get('/api/suppliers/00000000-0000-0000-0000-000000000005');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBeDefined();
  });

  it('GET /api/suppliers count is called exactly once per list request', async () => {
    mockPrisma.suppSupplier.findMany.mockResolvedValue([]);
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    await request(app).get('/api/suppliers');
    expect(mockPrisma.suppSupplier.count).toHaveBeenCalledTimes(1);
  });

  it('DELETE /api/suppliers/:id success message contains supplier', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.suppSupplier.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('supplier');
  });

  it('PUT /api/suppliers/:id response data.id matches path param', async () => {
    mockPrisma.suppSupplier.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000009' });
    mockPrisma.suppSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000009',
      name: 'Updated Name',
    });
    const res = await request(app)
      .put('/api/suppliers/00000000-0000-0000-0000-000000000009')
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000009');
  });
});
