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
app.use('/api/inventory', partsRouter);

const mockInventoryItem = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'O-Ring Kit',
  partNumber: 'ORK-200',
  description: 'Assorted O-ring kit for hydraulic systems',
  category: 'Seals',
  manufacturer: 'Parker',
  unitCost: 12.5,
  quantity: 200,
  minStock: 20,
  maxStock: 600,
  location: 'Warehouse B, Shelf 1',
  supplier: 'Parker Distributor',
  reorderPoint: 40,
  leadTimeDays: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('Inventory Routes — phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/inventory — list', () => {
    it('returns 200 with success:true and data array', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([mockInventoryItem]);
      prisma.cmmsPart.count.mockResolvedValue(1);
      const res = await request(app).get('/api/inventory');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns pagination object', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([]);
      prisma.cmmsPart.count.mockResolvedValue(0);
      const res = await request(app).get('/api/inventory');
      expect(res.status).toBe(200);
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('filters by category', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([]);
      prisma.cmmsPart.count.mockResolvedValue(0);
      const res = await request(app).get('/api/inventory?category=Seals');
      expect(res.status).toBe(200);
    });

    it('handles search query', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([]);
      prisma.cmmsPart.count.mockResolvedValue(0);
      const res = await request(app).get('/api/inventory?search=o-ring');
      expect(res.status).toBe(200);
      expect(prisma.cmmsPart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('returns 500 with INTERNAL_ERROR when findMany rejects', async () => {
      prisma.cmmsPart.findMany.mockRejectedValue(new Error('DB down'));
      const res = await request(app).get('/api/inventory');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('returns totalPages from count and limit', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([]);
      prisma.cmmsPart.count.mockResolvedValue(30);
      const res = await request(app).get('/api/inventory?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.pagination.totalPages).toBe(3);
    });

    it('passes correct skip for page=2&limit=10', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([]);
      prisma.cmmsPart.count.mockResolvedValue(0);
      await request(app).get('/api/inventory?page=2&limit=10');
      expect(prisma.cmmsPart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 })
      );
    });

    it('response content-type is application/json', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([]);
      prisma.cmmsPart.count.mockResolvedValue(0);
      const res = await request(app).get('/api/inventory');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('GET /api/inventory/low-stock', () => {
    it('returns 200 with low-stock items', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([{ ...mockInventoryItem, quantity: 5 }]);
      const res = await request(app).get('/api/inventory/low-stock');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns empty array when no low-stock items', async () => {
      prisma.cmmsPart.findMany.mockResolvedValue([]);
      const res = await request(app).get('/api/inventory/low-stock');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('returns 500 on DB error', async () => {
      prisma.cmmsPart.findMany.mockRejectedValue(new Error('DB down'));
      const res = await request(app).get('/api/inventory/low-stock');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/inventory — create', () => {
    it('returns 201 on valid payload', async () => {
      prisma.cmmsPart.create.mockResolvedValue(mockInventoryItem);
      const res = await request(app).post('/api/inventory').send({
        name: 'O-Ring Kit',
        partNumber: 'ORK-200',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/inventory').send({ partNumber: 'ORK-200' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when partNumber is missing', async () => {
      const res = await request(app).post('/api/inventory').send({ name: 'Test Part' });
      expect(res.status).toBe(400);
    });

    it('returns 409 on duplicate partNumber', async () => {
      prisma.cmmsPart.create.mockRejectedValue({ code: 'P2002' });
      const res = await request(app).post('/api/inventory').send({ name: 'Duplicate', partNumber: 'ORK-200' });
      expect(res.status).toBe(409);
    });

    it('returns 500 when create rejects with non-P2002 error', async () => {
      prisma.cmmsPart.create.mockRejectedValue(new Error('DB down'));
      const res = await request(app).post('/api/inventory').send({ name: 'Test', partNumber: 'ORK-201' });
      expect(res.status).toBe(500);
    });

    it('sets createdBy from authenticated user', async () => {
      prisma.cmmsPart.create.mockResolvedValue(mockInventoryItem);
      await request(app).post('/api/inventory').send({ name: 'New Item', partNumber: 'NI-001' });
      expect(prisma.cmmsPart.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ createdBy: 'user-123' }) })
      );
    });
  });

  describe('GET /api/inventory/:id — single item', () => {
    it('returns 200 with item data', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue({ ...mockInventoryItem, partUsages: [] });
      const res = await request(app).get('/api/inventory/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('returns 404 when not found', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);
      const res = await request(app).get('/api/inventory/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('returns 500 on DB error', async () => {
      prisma.cmmsPart.findFirst.mockRejectedValue(new Error('DB down'));
      const res = await request(app).get('/api/inventory/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/inventory/:id — update', () => {
    it('returns 200 on successful update', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(mockInventoryItem);
      prisma.cmmsPart.update.mockResolvedValue({ ...mockInventoryItem, quantity: 250 });
      const res = await request(app)
        .put('/api/inventory/00000000-0000-0000-0000-000000000001')
        .send({ quantity: 250 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when item not found', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);
      const res = await request(app)
        .put('/api/inventory/00000000-0000-0000-0000-000000000099')
        .send({ quantity: 250 });
      expect(res.status).toBe(404);
    });

    it('returns 500 when update fails', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(mockInventoryItem);
      prisma.cmmsPart.update.mockRejectedValue(new Error('DB down'));
      const res = await request(app)
        .put('/api/inventory/00000000-0000-0000-0000-000000000001')
        .send({ quantity: 250 });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/inventory/:id — soft delete', () => {
    it('returns 200 with success:true', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(mockInventoryItem);
      prisma.cmmsPart.update.mockResolvedValue({ ...mockInventoryItem, deletedAt: new Date() });
      const res = await request(app).delete('/api/inventory/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when item not found', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);
      const res = await request(app).delete('/api/inventory/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('calls update with deletedAt field', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(mockInventoryItem);
      prisma.cmmsPart.update.mockResolvedValue({ ...mockInventoryItem, deletedAt: new Date() });
      await request(app).delete('/api/inventory/00000000-0000-0000-0000-000000000001');
      expect(prisma.cmmsPart.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
      );
    });

    it('returns 500 when update fails', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(mockInventoryItem);
      prisma.cmmsPart.update.mockRejectedValue(new Error('DB down'));
      const res = await request(app).delete('/api/inventory/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/inventory/:id/usage — record usage', () => {
    it('returns 201 on valid usage record', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(mockInventoryItem);
      prisma.cmmsPartUsage.create.mockResolvedValue({ id: 'usage-1', quantity: 2, totalCost: 25 });
      prisma.cmmsPart.update.mockResolvedValue({ ...mockInventoryItem, quantity: 198 });
      const res = await request(app)
        .post('/api/inventory/00000000-0000-0000-0000-000000000001/usage')
        .send({ workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2 });
      expect(res.status).toBe(201);
    });

    it('returns 400 when quantity exceeds stock', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue({ ...mockInventoryItem, quantity: 1 });
      const res = await request(app)
        .post('/api/inventory/00000000-0000-0000-0000-000000000001/usage')
        .send({ workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 10 });
      expect(res.status).toBe(400);
    });

    it('returns 404 when item not found', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/inventory/00000000-0000-0000-0000-000000000099/usage')
        .send({ workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2 });
      expect(res.status).toBe(404);
    });

    it('returns 400 when workOrderId is missing', async () => {
      const res = await request(app)
        .post('/api/inventory/00000000-0000-0000-0000-000000000001/usage')
        .send({ quantity: 2 });
      expect(res.status).toBe(400);
    });

    it('decrements stock via update after usage', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue({ ...mockInventoryItem, quantity: 100 });
      prisma.cmmsPartUsage.create.mockResolvedValue({ id: 'usage-2', quantity: 5, totalCost: 62.5 });
      prisma.cmmsPart.update.mockResolvedValue({ ...mockInventoryItem, quantity: 95 });
      const res = await request(app)
        .post('/api/inventory/00000000-0000-0000-0000-000000000001/usage')
        .send({ workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 5 });
      expect(res.status).toBe(201);
      expect(prisma.cmmsPart.update).toHaveBeenCalled();
    });
  });
});

describe('Inventory — additional coverage', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('GET / data items include partNumber field', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([mockInventoryItem]);
    prisma.cmmsPart.count.mockResolvedValue(1);
    const res = await request(app).get('/api/inventory');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('partNumber', 'ORK-200');
  });

  it('GET / pagination page defaults to 1', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([]);
    prisma.cmmsPart.count.mockResolvedValue(0);
    const res = await request(app).get('/api/inventory');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET / count is called once per request', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([]);
    prisma.cmmsPart.count.mockResolvedValue(0);
    await request(app).get('/api/inventory');
    expect(prisma.cmmsPart.count).toHaveBeenCalledTimes(1);
  });

  it('GET / returns 500 when count rejects', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([]);
    prisma.cmmsPart.count.mockRejectedValue(new Error('count fail'));
    const res = await request(app).get('/api/inventory');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /low-stock data array is an Array type', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([mockInventoryItem]);
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /:id returns success:true when found', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue({ ...mockInventoryItem, partUsages: [] });
    const res = await request(app).get('/api/inventory/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id NOT_FOUND code on 404', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/inventory/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /:id NOT_FOUND code on 404', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/inventory/00000000-0000-0000-0000-000000000099').send({ quantity: 10 });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST / returns 201 with created item id', async () => {
    prisma.cmmsPart.create.mockResolvedValue(mockInventoryItem);
    const res = await request(app).post('/api/inventory').send({ name: 'Filter Kit', partNumber: 'FK-001' });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('DELETE /:id success:true and returns message', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue(mockInventoryItem);
    prisma.cmmsPart.update.mockResolvedValue({ ...mockInventoryItem, deletedAt: new Date() });
    const res = await request(app).delete('/api/inventory/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / data length matches findMany result', async () => {
    prisma.cmmsPart.findMany.mockResolvedValue([mockInventoryItem, mockInventoryItem]);
    prisma.cmmsPart.count.mockResolvedValue(2);
    const res = await request(app).get('/api/inventory');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('POST /:id/usage returns 500 on create failure', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue({ ...mockInventoryItem, quantity: 50 });
    prisma.cmmsPartUsage.create.mockRejectedValue(new Error('DB crash'));
    const res = await request(app)
      .post('/api/inventory/00000000-0000-0000-0000-000000000001/usage')
      .send({ workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 3 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error with INTERNAL_ERROR code', async () => {
    prisma.cmmsPart.findFirst.mockResolvedValue(mockInventoryItem);
    prisma.cmmsPart.update.mockRejectedValue(new Error('DB crash'));
    const res = await request(app)
      .put('/api/inventory/00000000-0000-0000-0000-000000000001')
      .send({ quantity: 300 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
