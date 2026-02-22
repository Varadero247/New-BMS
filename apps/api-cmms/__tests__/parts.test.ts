import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsPart: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cmmsPartUsage: { create: jest.fn() },
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

import partsRouter from '../src/routes/parts';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/parts', partsRouter);

const mockPart = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Ball Bearing',
  partNumber: 'BB-6205-2RS',
  description: 'Deep groove ball bearing',
  category: 'Bearings',
  manufacturer: 'SKF',
  unitCost: 25.5,
  quantity: 100,
  minStock: 10,
  maxStock: 500,
  location: 'Warehouse A, Shelf 3',
  supplier: 'SKF Distributor',
  reorderPoint: 20,
  leadTimeDays: 7,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('Parts Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/parts', () => {
    it('should return paginated parts', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([mockPart]);
      prisma.cmmsPart.count.mockResolvedValue(1);

      const res = await request(app).get('/api/parts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by category', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([]);
      prisma.cmmsPart.count.mockResolvedValue(0);

      const res = await request(app).get('/api/parts?category=Bearings');
      expect(res.status).toBe(200);
    });

    it('should handle search', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([]);
      prisma.cmmsPart.count.mockResolvedValue(0);

      const res = await request(app).get('/api/parts?search=ball');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsPart.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/parts');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/parts/low-stock', () => {
    it('should return low-stock parts', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([{ ...mockPart, quantity: 5 }]);

      const res = await request(app).get('/api/parts/low-stock');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle errors', async () => {
      prisma.cmmsPart.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/parts/low-stock');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/parts', () => {
    it('should create a part', async () => {
      prisma.cmmsPart.create.mockResolvedValue(mockPart);

      const res = await request(app).post('/api/parts').send({
        name: 'Ball Bearing',
        partNumber: 'BB-6205-2RS',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/api/parts').send({});
      expect(res.status).toBe(400);
    });

    it('should handle duplicate part number', async () => {
      prisma.cmmsPart.create.mockRejectedValue({ code: 'P2002' });

      const res = await request(app).post('/api/parts').send({
        name: 'Ball Bearing',
        partNumber: 'BB-6205-2RS',
      });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/parts/:id', () => {
    it('should return a part by ID', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue({ ...mockPart, partUsages: [] });

      const res = await request(app).get('/api/parts/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent part', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/parts/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/parts/:id', () => {
    it('should update a part', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(mockPart);
      prisma.cmmsPart.update.mockResolvedValue({ ...mockPart, name: 'Updated Bearing' });

      const res = await request(app)
        .put('/api/parts/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated Bearing' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent part', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/parts/00000000-0000-0000-0000-000000000099')
        .send({ name: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/parts/:id', () => {
    it('should soft delete a part', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(mockPart);
      prisma.cmmsPart.update.mockResolvedValue({ ...mockPart, deletedAt: new Date() });

      const res = await request(app).delete('/api/parts/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent part', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/parts/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/parts/:id/usage', () => {
    it('should record part usage', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(mockPart);
      prisma.cmmsPartUsage.create.mockResolvedValue({
        id: 'usage-1',
        workOrderId: 'wo-1',
        partId: 'part-1',
        quantity: 2,
        unitCost: 25.5,
        totalCost: 51.0,
      });
      prisma.cmmsPart.update.mockResolvedValue({ ...mockPart, quantity: 98 });

      const res = await request(app)
        .post('/api/parts/00000000-0000-0000-0000-000000000001/usage')
        .send({
          workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          quantity: 2,
        });
      expect(res.status).toBe(201);
    });

    it('should return 400 for insufficient stock', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue({ ...mockPart, quantity: 1 });

      const res = await request(app)
        .post('/api/parts/00000000-0000-0000-0000-000000000001/usage')
        .send({
          workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          quantity: 5,
        });
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent part', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/parts/00000000-0000-0000-0000-000000000099/usage')
        .send({
          workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          quantity: 2,
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app)
        .post('/api/parts/00000000-0000-0000-0000-000000000001/usage')
        .send({});
      expect(res.status).toBe(400);
    });
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    prisma.cmmsPart.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/parts');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    prisma.cmmsPart.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/parts').send({ name: 'Ball Bearing', partNumber: 'BB-001' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    prisma.cmmsPart.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/parts/00000000-0000-0000-0000-000000000001').send({ quantity: 10 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── extended coverage ───────────────────────────────────────────────────────

describe('Parts Routes — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns correct totalPages for multi-page result', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([]);
    prisma.cmmsPart.count.mockResolvedValue(40);

    const res = await request(app).get('/api/parts?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('GET / passes correct skip to Prisma for page 3 limit 5', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([]);
    prisma.cmmsPart.count.mockResolvedValue(20);

    await request(app).get('/api/parts?page=3&limit=5');

    expect(prisma.cmmsPart.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('GET / response shape contains success:true and pagination', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([]);
    prisma.cmmsPart.count.mockResolvedValue(0);

    const res = await request(app).get('/api/parts');

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total', 0);
  });

  it('DELETE /:id returns 500 on DB error during update', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null });
    prisma.cmmsPart.update.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).delete('/api/parts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /low-stock returns list with success:true', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', quantity: 3, minStock: 10 }]);

    const res = await request(app).get('/api/parts/low-stock');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /:id/usage returns 500 on DB error during usage create', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', quantity: 50, unitCost: 25.5, deletedAt: null });
    prisma.cmmsPartUsage.create.mockRejectedValue(new Error('DB crash'));

    const res = await request(app)
      .post('/api/parts/00000000-0000-0000-0000-000000000001/usage')
      .send({ workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2 });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on database error', async () => {
    prisma.cmmsPart.findFirst.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).get('/api/parts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Parts Routes — business logic and response structure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST / sets createdBy from authenticated user', async () => {
    prisma.cmmsPart.create.mockResolvedValue(mockPart);
    await request(app).post('/api/parts').send({ name: 'Seal Kit', partNumber: 'SK-001' });
    expect(prisma.cmmsPart.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ createdBy: 'user-123' }) })
    );
  });

  it('GET /parts?search passes OR clause to Prisma findMany', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([]);
    prisma.cmmsPart.count.mockResolvedValue(0);
    await request(app).get('/api/parts?search=seal');
    expect(prisma.cmmsPart.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });

  it('GET /parts?category filters findMany with category in where clause', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([]);
    prisma.cmmsPart.count.mockResolvedValue(0);
    await request(app).get('/api/parts?category=Bearings');
    expect(prisma.cmmsPart.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: expect.anything() }) })
    );
  });

  it('GET /low-stock returns 500 on DB error', async () => {
    prisma.cmmsPart.findMany.mockRejectedValue(new Error('DB crash'));
    const res = await request(app).get('/api/parts/low-stock');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/usage records usage and decrements stock via update', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue({ ...mockPart, quantity: 50 });
    prisma.cmmsPartUsage.create.mockResolvedValue({ id: 'usage-x', quantity: 3, totalCost: 76.5 });
    prisma.cmmsPart.update.mockResolvedValue({ ...mockPart, quantity: 47 });
    const res = await request(app)
      .post('/api/parts/00000000-0000-0000-0000-000000000001/usage')
      .send({ workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 3 });
    expect(res.status).toBe(201);
    expect(prisma.cmmsPartUsage.create).toHaveBeenCalled();
    expect(prisma.cmmsPart.update).toHaveBeenCalled();
  });

  it('GET / returns success:true and data is an array', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([mockPart]);
    prisma.cmmsPart.count.mockResolvedValue(1);
    const res = await request(app).get('/api/parts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
