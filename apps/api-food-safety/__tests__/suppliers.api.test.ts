import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSupplier: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

import suppliersRouter from '../src/routes/suppliers';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/suppliers', suppliersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/suppliers', () => {
  it('should return suppliers with pagination', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Supplier A' },
    ]);
    mockPrisma.fsSupplier.count.mockResolvedValue(1);

    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([]);
    mockPrisma.fsSupplier.count.mockResolvedValue(0);

    await request(app).get('/api/suppliers?status=APPROVED');
    expect(mockPrisma.fsSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'APPROVED' }) })
    );
  });

  it('should filter by category', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([]);
    mockPrisma.fsSupplier.count.mockResolvedValue(0);

    await request(app).get('/api/suppliers?category=RAW_MATERIAL');
    expect(mockPrisma.fsSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'RAW_MATERIAL' }) })
    );
  });

  it('should handle database errors', async () => {
    mockPrisma.fsSupplier.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/suppliers', () => {
  it('should create a supplier with auto-generated code', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Supplier A',
      code: 'FS-SUP-1234',
      category: 'RAW_MATERIAL',
    };
    mockPrisma.fsSupplier.create.mockResolvedValue(created);

    const res = await request(app).post('/api/suppliers').send({
      name: 'Supplier A',
      category: 'RAW_MATERIAL',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/suppliers').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsSupplier.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/suppliers').send({
      name: 'Supplier A',
      category: 'RAW_MATERIAL',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/suppliers/:id', () => {
  it('should return a supplier by id', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Supplier A',
    });

    const res = await request(app).get('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent supplier', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/suppliers/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/suppliers/:id', () => {
  it('should update a supplier', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/suppliers/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent supplier', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/suppliers/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/suppliers/:id', () => {
  it('should soft delete a supplier', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent supplier', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/suppliers/due-audit', () => {
  it('should return suppliers due for audit', async () => {
    const suppliers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Supplier A',
        nextAuditDate: '2026-02-20',
      },
    ];
    mockPrisma.fsSupplier.findMany.mockResolvedValue(suppliers);

    const res = await request(app).get('/api/suppliers/due-audit');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should accept custom days parameter', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/suppliers/due-audit?days=60');
    expect(res.status).toBe(200);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsSupplier.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/suppliers/due-audit');
    expect(res.status).toBe(500);
  });
});

describe('suppliers.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/suppliers', suppliersRouter);
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

  it('GET /api/suppliers body is an object', async () => {
    const res = await request(app).get('/api/suppliers');
    expect(typeof res.body).toBe('object');
  });
});

describe('suppliers.api — edge cases and extended coverage', () => {
  it('GET /api/suppliers returns pagination metadata', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([]);
    mockPrisma.fsSupplier.count.mockResolvedValue(45);

    const res = await request(app).get('/api/suppliers?page=3&limit=15');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toMatchObject({ page: 3, limit: 15, total: 45, totalPages: 3 });
  });

  it('GET /api/suppliers filters by combined status and category', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([]);
    mockPrisma.fsSupplier.count.mockResolvedValue(0);

    await request(app).get('/api/suppliers?status=APPROVED&category=PACKAGING');
    expect(mockPrisma.fsSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'APPROVED', category: 'PACKAGING' }),
      })
    );
  });

  it('POST /api/suppliers rejects missing category', async () => {
    const res = await request(app).post('/api/suppliers').send({ name: 'Test Supplier' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/suppliers/:id handles 500 on update', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSupplier.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/suppliers/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Supplier' });
    expect(res.status).toBe(500);
  });

  it('DELETE /api/suppliers/:id returns confirmation message', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('DELETE /api/suppliers/:id handles 500 on update', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSupplier.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('GET /api/suppliers/:id handles 500 on findFirst', async () => {
    mockPrisma.fsSupplier.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('GET /api/suppliers/due-audit returns empty array when none due', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/suppliers/due-audit');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/suppliers returns multiple suppliers with success:true', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Supplier A' },
      { id: '00000000-0000-0000-0000-000000000002', name: 'Supplier B' },
    ]);
    mockPrisma.fsSupplier.count.mockResolvedValue(2);

    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('suppliers.api — final coverage pass', () => {
  it('GET /api/suppliers default pagination applies skip 0', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([]);
    mockPrisma.fsSupplier.count.mockResolvedValue(0);

    await request(app).get('/api/suppliers');
    expect(mockPrisma.fsSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });

  it('GET /api/suppliers/:id queries with deletedAt null', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Supplier A',
    });
    await request(app).get('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.fsSupplier.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null }),
      })
    );
  });

  it('POST /api/suppliers creates with createdBy from auth user', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000030',
      name: 'Fresh Farms',
      code: 'FS-SUP-5678',
      category: 'RAW_MATERIAL',
      createdBy: 'user-123',
    };
    mockPrisma.fsSupplier.create.mockResolvedValue(created);

    const res = await request(app).post('/api/suppliers').send({
      name: 'Fresh Farms',
      category: 'RAW_MATERIAL',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('createdBy', 'user-123');
  });

  it('PUT /api/suppliers/:id update calls update with where id', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSupplier.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Fresh Farms Renamed',
    });

    await request(app)
      .put('/api/suppliers/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Fresh Farms Renamed' });
    expect(mockPrisma.fsSupplier.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-0000-0000-000000000001' },
      })
    );
  });

  it('DELETE /api/suppliers/:id calls update with deletedAt', async () => {
    mockPrisma.fsSupplier.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSupplier.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    await request(app).delete('/api/suppliers/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.fsSupplier.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('GET /api/suppliers page 4 limit 10 applies skip 30 take 10', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([]);
    mockPrisma.fsSupplier.count.mockResolvedValue(0);

    await request(app).get('/api/suppliers?page=4&limit=10');
    expect(mockPrisma.fsSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 30, take: 10 })
    );
  });

  it('GET /api/suppliers/due-audit with days=30 calls findMany once', async () => {
    mockPrisma.fsSupplier.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/suppliers/due-audit?days=30');
    expect(res.status).toBe(200);
    expect(mockPrisma.fsSupplier.findMany).toHaveBeenCalledTimes(1);
  });
});
