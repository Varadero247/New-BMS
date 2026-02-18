import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsKpi: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cmmsAsset: { count: jest.fn() },
    cmmsWorkOrder: { count: jest.fn() },
    cmmsPart: { count: jest.fn() },
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

import kpisRouter from '../src/routes/kpis';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/kpis', kpisRouter);

const mockKpi = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'MTBF - CNC Machine',
  metricType: 'MTBF',
  assetId: 'asset-1',
  value: 720,
  unit: 'hours',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-01-31'),
  target: 800,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
};

describe('KPIs Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/kpis', () => {
    it('should return paginated KPIs', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([mockKpi]);
      prisma.cmmsKpi.count.mockResolvedValue(1);

      const res = await request(app).get('/api/kpis');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by metricType', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([]);
      prisma.cmmsKpi.count.mockResolvedValue(0);

      const res = await request(app).get('/api/kpis?metricType=MTBF');
      expect(res.status).toBe(200);
    });

    it('should filter by assetId', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([]);
      prisma.cmmsKpi.count.mockResolvedValue(0);

      const res = await request(app).get('/api/kpis?assetId=asset-1');
      expect(res.status).toBe(200);
    });

    it('should filter by period', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([]);
      prisma.cmmsKpi.count.mockResolvedValue(0);

      const res = await request(app).get('/api/kpis?periodStart=2026-01-01&periodEnd=2026-01-31');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsKpi.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/kpis');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/kpis/dashboard', () => {
    it('should return dashboard summary', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([mockKpi]);
      prisma.cmmsAsset.count.mockResolvedValue(50);
      prisma.cmmsWorkOrder.count.mockImplementation((args: any) => {
        if (args?.where?.scheduledEnd) return Promise.resolve(3);
        return Promise.resolve(12);
      });
      prisma.cmmsPart.count.mockResolvedValue(200);

      const res = await request(app).get('/api/kpis/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.latestKpis).toBeDefined();
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalAssets).toBe(50);
    });

    it('should handle errors', async () => {
      prisma.cmmsKpi.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/kpis/dashboard');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/kpis', () => {
    it('should create a KPI', async () => {
      prisma.cmmsKpi.create.mockResolvedValue(mockKpi);

      const res = await request(app).post('/api/kpis').send({
        name: 'MTBF - CNC Machine',
        metricType: 'MTBF',
        value: 720,
        unit: 'hours',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/kpis').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid metricType', async () => {
      const res = await request(app).post('/api/kpis').send({
        name: 'Test',
        metricType: 'INVALID',
        value: 100,
        unit: 'hours',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      });
      expect(res.status).toBe(400);
    });

    it('should handle creation errors', async () => {
      prisma.cmmsKpi.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/kpis').send({
        name: 'MTBF',
        metricType: 'MTBF',
        value: 720,
        unit: 'hours',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/kpis/:id', () => {
    it('should return a KPI by ID', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(mockKpi);

      const res = await request(app).get('/api/kpis/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/kpis/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/kpis/:id', () => {
    it('should update a KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(mockKpi);
      prisma.cmmsKpi.update.mockResolvedValue({ ...mockKpi, value: 750 });

      const res = await request(app)
        .put('/api/kpis/00000000-0000-0000-0000-000000000001')
        .send({ value: 750 });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/kpis/00000000-0000-0000-0000-000000000099')
        .send({ value: 750 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/kpis/:id', () => {
    it('should soft delete a KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(mockKpi);
      prisma.cmmsKpi.update.mockResolvedValue({ ...mockKpi, deletedAt: new Date() });

      const res = await request(app).delete('/api/kpis/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/kpis/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });
});
