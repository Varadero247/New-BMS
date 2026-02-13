import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsPreventivePlan: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
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

import preventivePlansRouter from '../src/routes/preventive-plans';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/preventive-plans', preventivePlansRouter);

const mockPlan = {
  id: 'plan-1',
  name: 'Monthly Lubrication',
  assetId: 'asset-1',
  description: 'Monthly lubrication schedule',
  frequency: 'MONTHLY',
  lastPerformed: null,
  nextDue: new Date('2026-03-01'),
  tasks: [{ task: 'Lubricate bearings', done: false }],
  assignedTo: 'tech-1',
  isActive: true,
  estimatedDuration: 60,
  estimatedCost: 250,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
};

describe('Preventive Plans Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/preventive-plans', () => {
    it('should return paginated plans', async () => {
      prisma.cmmsPreventivePlan.findMany.mockResolvedValue([mockPlan]);
      prisma.cmmsPreventivePlan.count.mockResolvedValue(1);

      const res = await request(app).get('/api/preventive-plans');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by assetId', async () => {
      prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
      prisma.cmmsPreventivePlan.count.mockResolvedValue(0);

      const res = await request(app).get('/api/preventive-plans?assetId=asset-1');
      expect(res.status).toBe(200);
    });

    it('should filter by frequency', async () => {
      prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
      prisma.cmmsPreventivePlan.count.mockResolvedValue(0);

      const res = await request(app).get('/api/preventive-plans?frequency=MONTHLY');
      expect(res.status).toBe(200);
    });

    it('should filter by isActive', async () => {
      prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
      prisma.cmmsPreventivePlan.count.mockResolvedValue(0);

      const res = await request(app).get('/api/preventive-plans?isActive=true');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsPreventivePlan.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/preventive-plans');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/preventive-plans', () => {
    it('should create a plan', async () => {
      prisma.cmmsPreventivePlan.create.mockResolvedValue(mockPlan);

      const res = await request(app).post('/api/preventive-plans').send({
        name: 'Monthly Lubrication',
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        frequency: 'MONTHLY',
        tasks: [{ task: 'Lubricate bearings' }],
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app).post('/api/preventive-plans').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid frequency', async () => {
      const res = await request(app).post('/api/preventive-plans').send({
        name: 'Test',
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        frequency: 'INVALID',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/preventive-plans/:id', () => {
    it('should return a plan by ID', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);

      const res = await request(app).get('/api/preventive-plans/plan-1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('plan-1');
    });

    it('should return 404 for non-existent plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/preventive-plans/non-existent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/preventive-plans/:id', () => {
    it('should update a plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);
      prisma.cmmsPreventivePlan.update.mockResolvedValue({ ...mockPlan, name: 'Updated' });

      const res = await request(app).put('/api/preventive-plans/plan-1').send({ name: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(null);

      const res = await request(app).put('/api/preventive-plans/non-existent').send({ name: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/preventive-plans/:id', () => {
    it('should soft delete a plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);
      prisma.cmmsPreventivePlan.update.mockResolvedValue({ ...mockPlan, deletedAt: new Date() });

      const res = await request(app).delete('/api/preventive-plans/plan-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/preventive-plans/non-existent');
      expect(res.status).toBe(404);
    });
  });
});
