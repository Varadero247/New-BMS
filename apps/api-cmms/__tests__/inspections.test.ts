import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsInspection: {
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

import inspectionsRouter from '../src/routes/inspections';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/inspections', inspectionsRouter);

const mockInspection = {
  id: '00000000-0000-0000-0000-000000000001',
  assetId: 'asset-1',
  inspectionType: 'Safety Inspection',
  inspector: 'John Smith',
  scheduledDate: new Date('2026-03-01'),
  completedDate: null,
  status: 'SCHEDULED',
  result: null,
  findings: null,
  nextInspectionDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
};

describe('Inspections Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/inspections', () => {
    it('should return paginated inspections', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([mockInspection]);
      prisma.cmmsInspection.count.mockResolvedValue(1);

      const res = await request(app).get('/api/inspections');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by assetId', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([]);
      prisma.cmmsInspection.count.mockResolvedValue(0);

      const res = await request(app).get('/api/inspections?assetId=asset-1');
      expect(res.status).toBe(200);
    });

    it('should filter by status', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([]);
      prisma.cmmsInspection.count.mockResolvedValue(0);

      const res = await request(app).get('/api/inspections?status=SCHEDULED');
      expect(res.status).toBe(200);
    });

    it('should filter by result', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([]);
      prisma.cmmsInspection.count.mockResolvedValue(0);

      const res = await request(app).get('/api/inspections?result=PASS');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsInspection.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/inspections');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/inspections/overdue', () => {
    it('should return overdue inspections', async () => {
      prisma.cmmsInspection.findMany.mockResolvedValue([mockInspection]);

      const res = await request(app).get('/api/inspections/overdue');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle errors', async () => {
      prisma.cmmsInspection.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/inspections/overdue');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/inspections', () => {
    it('should create an inspection', async () => {
      prisma.cmmsInspection.create.mockResolvedValue(mockInspection);

      const res = await request(app).post('/api/inspections').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        inspectionType: 'Safety Inspection',
        inspector: 'John Smith',
        scheduledDate: '2026-03-01T00:00:00Z',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/inspections').send({});
      expect(res.status).toBe(400);
    });

    it('should handle creation errors', async () => {
      prisma.cmmsInspection.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/inspections').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        inspectionType: 'Safety Inspection',
        inspector: 'John Smith',
        scheduledDate: '2026-03-01T00:00:00Z',
      });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/inspections/:id', () => {
    it('should return an inspection by ID', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(mockInspection);

      const res = await request(app).get('/api/inspections/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/inspections/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/inspections/:id', () => {
    it('should update an inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(mockInspection);
      prisma.cmmsInspection.update.mockResolvedValue({
        ...mockInspection,
        status: 'COMPLETED',
        result: 'PASS',
      });

      const res = await request(app)
        .put('/api/inspections/00000000-0000-0000-0000-000000000001')
        .send({ status: 'COMPLETED', result: 'PASS' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/inspections/00000000-0000-0000-0000-000000000099')
        .send({ status: 'COMPLETED' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/inspections/:id', () => {
    it('should soft delete an inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(mockInspection);
      prisma.cmmsInspection.update.mockResolvedValue({ ...mockInspection, deletedAt: new Date() });

      const res = await request(app).delete(
        '/api/inspections/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent inspection', async () => {
      prisma.cmmsInspection.findFirst.mockResolvedValue(null);

      const res = await request(app).delete(
        '/api/inspections/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });
});
