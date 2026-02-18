import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsRequest: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    cmmsWorkOrder: { create: jest.fn() },
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

import requestsRouter from '../src/routes/requests';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/requests', requestsRouter);

const mockRequest = {
  id: '00000000-0000-0000-0000-000000000001',
  number: 'MR-2602-1234',
  title: 'Fix leaking pipe',
  description: 'Water leaking from pipe in room 201',
  requestedBy: 'John Smith',
  assetId: 'asset-1',
  locationId: 'loc-1',
  priority: 'HIGH',
  status: 'NEW',
  workOrderId: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
  location: { id: 'loc-1', name: 'Building A', code: 'LOC-001' },
};

describe('Requests Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/requests', () => {
    it('should return paginated requests', async () => {
      prisma.cmmsRequest.findMany.mockResolvedValue([mockRequest]);
      prisma.cmmsRequest.count.mockResolvedValue(1);

      const res = await request(app).get('/api/requests');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by status', async () => {
      prisma.cmmsRequest.findMany.mockResolvedValue([]);
      prisma.cmmsRequest.count.mockResolvedValue(0);

      const res = await request(app).get('/api/requests?status=NEW');
      expect(res.status).toBe(200);
    });

    it('should filter by priority', async () => {
      prisma.cmmsRequest.findMany.mockResolvedValue([]);
      prisma.cmmsRequest.count.mockResolvedValue(0);

      const res = await request(app).get('/api/requests?priority=HIGH');
      expect(res.status).toBe(200);
    });

    it('should filter by assetId', async () => {
      prisma.cmmsRequest.findMany.mockResolvedValue([]);
      prisma.cmmsRequest.count.mockResolvedValue(0);

      const res = await request(app).get('/api/requests?assetId=asset-1');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsRequest.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/requests');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/requests', () => {
    it('should create a request', async () => {
      prisma.cmmsRequest.create.mockResolvedValue(mockRequest);

      const res = await request(app).post('/api/requests').send({
        title: 'Fix leaking pipe',
        requestedBy: 'John Smith',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/requests').send({});
      expect(res.status).toBe(400);
    });

    it('should handle creation errors', async () => {
      prisma.cmmsRequest.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/requests').send({
        title: 'Fix leaking pipe',
        requestedBy: 'John Smith',
      });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/requests/:id', () => {
    it('should return a request by ID', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue(mockRequest);

      const res = await request(app).get('/api/requests/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent request', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/requests/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/requests/:id', () => {
    it('should update a request', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue(mockRequest);
      prisma.cmmsRequest.update.mockResolvedValue({ ...mockRequest, title: 'Updated' });

      const res = await request(app).put('/api/requests/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent request', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue(null);

      const res = await request(app).put('/api/requests/00000000-0000-0000-0000-000000000099').send({ title: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/requests/:id/approve', () => {
    it('should approve a request and create work order', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue(mockRequest);
      prisma.cmmsWorkOrder.create.mockResolvedValue({ id: 'wo-new', number: 'WO-2602-9999' });
      prisma.cmmsRequest.update.mockResolvedValue({ ...mockRequest, status: 'APPROVED', workOrderId: 'wo-new' });

      const res = await request(app).put('/api/requests/00000000-0000-0000-0000-000000000001/approve');
      expect(res.status).toBe(200);
      expect(res.body.data.request).toBeDefined();
      expect(res.body.data.workOrder).toBeDefined();
    });

    it('should return 400 for non-NEW request', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue({ ...mockRequest, status: 'APPROVED' });

      const res = await request(app).put('/api/requests/00000000-0000-0000-0000-000000000001/approve');
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent request', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue(null);

      const res = await request(app).put('/api/requests/00000000-0000-0000-0000-000000000099/approve');
      expect(res.status).toBe(404);
    });

    it('should handle approval errors', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue(mockRequest);
      prisma.cmmsWorkOrder.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/requests/00000000-0000-0000-0000-000000000001/approve');
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/requests/:id', () => {
    it('should soft delete a request', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue(mockRequest);
      prisma.cmmsRequest.update.mockResolvedValue({ ...mockRequest, deletedAt: new Date() });

      const res = await request(app).delete('/api/requests/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent request', async () => {
      prisma.cmmsRequest.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/requests/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });
});
