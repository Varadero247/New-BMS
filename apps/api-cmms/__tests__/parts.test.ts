import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsPart: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
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
  unitCost: 25.50,
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

      const res = await request(app).put('/api/parts/00000000-0000-0000-0000-000000000001').send({ name: 'Updated Bearing' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent part', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);

      const res = await request(app).put('/api/parts/00000000-0000-0000-0000-000000000099').send({ name: 'Updated' });
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
        unitCost: 25.50,
        totalCost: 51.00,
      });
      prisma.cmmsPart.update.mockResolvedValue({ ...mockPart, quantity: 98 });

      const res = await request(app).post('/api/parts/00000000-0000-0000-0000-000000000001/usage').send({
        workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        quantity: 2,
      });
      expect(res.status).toBe(201);
    });

    it('should return 400 for insufficient stock', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue({ ...mockPart, quantity: 1 });

      const res = await request(app).post('/api/parts/00000000-0000-0000-0000-000000000001/usage').send({
        workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        quantity: 5,
      });
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent part', async () => {
      prisma.cmmsPart.findFirst.mockResolvedValue(null);

      const res = await request(app).post('/api/parts/00000000-0000-0000-0000-000000000099/usage').send({
        workOrderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        quantity: 2,
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app).post('/api/parts/00000000-0000-0000-0000-000000000001/usage').send({});
      expect(res.status).toBe(400);
    });
  });
});
