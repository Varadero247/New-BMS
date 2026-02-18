import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsDowntime: {
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

import downtimeRouter from '../src/routes/downtime';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/downtime', downtimeRouter);

const mockDowntime = {
  id: '00000000-0000-0000-0000-000000000001',
  assetId: 'asset-1',
  workOrderId: 'wo-1',
  startTime: new Date('2026-02-13T08:00:00Z'),
  endTime: new Date('2026-02-13T12:00:00Z'),
  duration: 4,
  reason: 'Bearing failure',
  impact: 'PRODUCTION_STOP',
  estimatedLoss: 50000,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
  workOrder: { id: 'wo-1', number: 'WO-2602-1234', title: 'Replace bearing' },
};

describe('Downtime Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/downtime', () => {
    it('should return paginated downtime records', async () => {
      prisma.cmmsDowntime.findMany.mockResolvedValue([mockDowntime]);
      prisma.cmmsDowntime.count.mockResolvedValue(1);

      const res = await request(app).get('/api/downtime');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by assetId', async () => {
      prisma.cmmsDowntime.findMany.mockResolvedValue([]);
      prisma.cmmsDowntime.count.mockResolvedValue(0);

      const res = await request(app).get('/api/downtime?assetId=asset-1');
      expect(res.status).toBe(200);
    });

    it('should filter by impact', async () => {
      prisma.cmmsDowntime.findMany.mockResolvedValue([]);
      prisma.cmmsDowntime.count.mockResolvedValue(0);

      const res = await request(app).get('/api/downtime?impact=PRODUCTION_STOP');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsDowntime.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/downtime');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/downtime/pareto', () => {
    it('should return Pareto analysis', async () => {
      prisma.cmmsDowntime.findMany.mockResolvedValue([
        { reason: 'Bearing failure', duration: 4, impact: 'PRODUCTION_STOP' },
        { reason: 'Bearing failure', duration: 3, impact: 'PRODUCTION_STOP' },
        { reason: 'Electrical fault', duration: 2, impact: 'REDUCED_OUTPUT' },
      ]);

      const res = await request(app).get('/api/downtime/pareto');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].reason).toBe('Bearing failure');
      expect(res.body.data[0].totalDuration).toBe(7);
    });

    it('should handle errors', async () => {
      prisma.cmmsDowntime.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/downtime/pareto');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/downtime', () => {
    it('should create a downtime record', async () => {
      prisma.cmmsDowntime.create.mockResolvedValue(mockDowntime);

      const res = await request(app).post('/api/downtime').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        startTime: '2026-02-13T08:00:00Z',
        reason: 'Bearing failure',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should auto-calculate duration', async () => {
      prisma.cmmsDowntime.create.mockResolvedValue(mockDowntime);

      const res = await request(app).post('/api/downtime').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        startTime: '2026-02-13T08:00:00Z',
        endTime: '2026-02-13T12:00:00Z',
        reason: 'Bearing failure',
      });
      expect(res.status).toBe(201);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/downtime').send({});
      expect(res.status).toBe(400);
    });

    it('should handle creation errors', async () => {
      prisma.cmmsDowntime.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/downtime').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        startTime: '2026-02-13T08:00:00Z',
        reason: 'Bearing failure',
      });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/downtime/:id', () => {
    it('should return a downtime record by ID', async () => {
      prisma.cmmsDowntime.findFirst.mockResolvedValue(mockDowntime);

      const res = await request(app).get('/api/downtime/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent record', async () => {
      prisma.cmmsDowntime.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/downtime/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/downtime/:id', () => {
    it('should update a downtime record', async () => {
      prisma.cmmsDowntime.findFirst.mockResolvedValue(mockDowntime);
      prisma.cmmsDowntime.update.mockResolvedValue({ ...mockDowntime, reason: 'Updated reason' });

      const res = await request(app)
        .put('/api/downtime/00000000-0000-0000-0000-000000000001')
        .send({ reason: 'Updated reason' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent record', async () => {
      prisma.cmmsDowntime.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/downtime/00000000-0000-0000-0000-000000000099')
        .send({ reason: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/downtime/:id', () => {
    it('should soft delete a downtime record', async () => {
      prisma.cmmsDowntime.findFirst.mockResolvedValue(mockDowntime);
      prisma.cmmsDowntime.update.mockResolvedValue({ ...mockDowntime, deletedAt: new Date() });

      const res = await request(app).delete('/api/downtime/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent record', async () => {
      prisma.cmmsDowntime.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/downtime/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });
});
