import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    controlPlan: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    controlPlanChar: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  },
  Prisma: { ControlPlanWhereInput: {} },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import controlPlanRouter from '../src/routes/control-plans';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/control-plans', controlPlanRouter);

describe('Control Plan Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/control-plans', () => {
    const validBody = {
      title: 'Bracket Assembly Control Plan',
      partNumber: 'PN-001',
      partName: 'Bracket',
    };

    it('should create a control plan', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockResolvedValue({
        id: 'cp-1', refNumber: 'CP-2602-0001', ...validBody, planType: 'PROTOTYPE', status: 'DRAFT',
      });

      const res = await request(app).post('/api/control-plans').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should accept PRODUCTION planType', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockResolvedValue({ id: 'cp-2' });

      const res = await request(app).post('/api/control-plans').send({
        ...validBody, planType: 'PRODUCTION',
      });
      expect(res.status).toBe(201);
    });

    it('should accept PRE_LAUNCH planType', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockResolvedValue({ id: 'cp-3' });

      const res = await request(app).post('/api/control-plans').send({
        ...validBody, planType: 'PRE_LAUNCH',
      });
      expect(res.status).toBe(201);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app).post('/api/control-plans').send({
        partNumber: 'PN-001', partName: 'Bracket',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing partNumber', async () => {
      const res = await request(app).post('/api/control-plans').send({
        title: 'Test', partName: 'Bracket',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing partName', async () => {
      const res = await request(app).post('/api/control-plans').send({
        title: 'Test', partNumber: 'PN-001',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid planType', async () => {
      const res = await request(app).post('/api/control-plans').send({
        ...validBody, planType: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/control-plans').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/control-plans', () => {
    it('should list control plans', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValue([{ id: 'cp-1' }]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/control-plans');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValue(40);

      const res = await request(app).get('/api/control-plans?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.totalPages).toBe(4);
    });

    it('should filter by planType', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/control-plans?planType=PRODUCTION');
      expect(mockPrisma.controlPlan.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.controlPlan.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/control-plans');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/control-plans/:id', () => {
    it('should get control plan with characteristics', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue({
        id: 'cp-1', characteristics: [],
      });

      const res = await request(app).get('/api/control-plans/cp-1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('cp-1');
    });

    it('should return 404 for non-existent', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/control-plans/fake');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/control-plans/:id/characteristics', () => {
    const validChar = {
      processNumber: '10',
      processName: 'Assembly',
      characteristicName: 'Torque',
      characteristicType: 'PRODUCT',
      evalTechnique: 'Torque wrench',
      sampleSize: '5',
      sampleFrequency: 'Every hour',
      controlMethod: 'Control chart',
      reactionPlan: 'Stop and adjust',
    };

    it('should add a characteristic', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue({ id: 'cp-1', deletedAt: null });
      (mockPrisma.controlPlanChar.create as jest.Mock).mockResolvedValue({ id: 'ch-1', ...validChar });

      const res = await request(app).post('/api/control-plans/cp-1/characteristics').send(validChar);
      expect(res.status).toBe(201);
    });

    it('should return 404 for non-existent plan', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/control-plans/fake/characteristics').send(validChar);
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing processNumber', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue({ id: 'cp-1', deletedAt: null });

      const { processNumber, ...noProcess } = validChar;
      const res = await request(app).post('/api/control-plans/cp-1/characteristics').send(noProcess);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid characteristicType', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue({ id: 'cp-1', deletedAt: null });

      const res = await request(app).post('/api/control-plans/cp-1/characteristics').send({
        ...validChar, characteristicType: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should accept PROCESS characteristicType', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue({ id: 'cp-1', deletedAt: null });
      (mockPrisma.controlPlanChar.create as jest.Mock).mockResolvedValue({ id: 'ch-2' });

      const res = await request(app).post('/api/control-plans/cp-1/characteristics').send({
        ...validChar, characteristicType: 'PROCESS',
      });
      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/control-plans/:id/approve', () => {
    it('should approve a control plan', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue({ id: 'cp-1', deletedAt: null, status: 'DRAFT' });
      (mockPrisma.controlPlan.update as jest.Mock).mockResolvedValue({ id: 'cp-1', status: 'APPROVED' });

      const res = await request(app).post('/api/control-plans/cp-1/approve').send({});
      expect(res.status).toBe(200);
    });

    it('should return 400 for already approved plan', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue({ id: 'cp-1', deletedAt: null, status: 'APPROVED' });

      const res = await request(app).post('/api/control-plans/cp-1/approve').send({});
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent plan', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/control-plans/fake/approve').send({});
      expect(res.status).toBe(404);
    });
  });
});
