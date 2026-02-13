import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    infoSecRisk: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
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

import router from '../src/routes/risks';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/risks', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('InfoSec Risks API', () => {
  const mockRisk = {
    id: 'risk-1',
    refNumber: 'ISR-2602-1234',
    title: 'Unauthorized access to production database',
    description: 'Risk of unauthorized access via compromised credentials',
    threat: 'Credential theft',
    vulnerability: 'Weak password policy',
    likelihood: 4,
    impact: 5,
    riskScore: 20,
    riskLevel: 'CRITICAL',
    assetId: null,
    category: 'Access Control',
    owner: 'CISO',
    treatment: null,
    treatmentPlan: null,
    controlIds: [],
    residualLikelihood: null,
    residualImpact: null,
    residualRiskScore: null,
    residualRiskLevel: null,
    status: 'IDENTIFIED',
    createdBy: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  const validCreatePayload = {
    title: 'Unauthorized access to production database',
    threat: 'Credential theft',
    vulnerability: 'Weak password policy',
    likelihood: 4,
    impact: 5,
  };

  // ---- POST /api/risks ----

  describe('POST /api/risks', () => {
    it('should create risk with calculated score and level', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce(mockRisk);

      const res = await request(app)
        .post('/api/risks')
        .send(validCreatePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(20);
      expect(createCall.data.riskLevel).toBe('CRITICAL');
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/api/risks')
        .send({ threat: 'X', vulnerability: 'Y', likelihood: 3, impact: 3 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for likelihood out of range (>5)', async () => {
      const res = await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 6 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for impact out of range (<1)', async () => {
      const res = await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, impact: 0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should calculate VERY_LOW for score 1-4 (e.g. 1*1=1)', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce({ ...mockRisk, riskScore: 1, riskLevel: 'VERY_LOW' });

      await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 1, impact: 1 });

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(1);
      expect(createCall.data.riskLevel).toBe('VERY_LOW');
    });

    it('should calculate VERY_LOW for score 4 (e.g. 2*2=4)', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce({ ...mockRisk, riskScore: 4, riskLevel: 'VERY_LOW' });

      await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 2, impact: 2 });

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(4);
      expect(createCall.data.riskLevel).toBe('VERY_LOW');
    });

    it('should calculate LOW for score 5-8 (e.g. 2*3=6)', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce({ ...mockRisk, riskScore: 6, riskLevel: 'LOW' });

      await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 2, impact: 3 });

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(6);
      expect(createCall.data.riskLevel).toBe('LOW');
    });

    it('should calculate LOW for score 8 (e.g. 2*4=8)', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce({ ...mockRisk, riskScore: 8, riskLevel: 'LOW' });

      await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 2, impact: 4 });

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(8);
      expect(createCall.data.riskLevel).toBe('LOW');
    });

    it('should calculate MEDIUM for score 9-12 (e.g. 3*3=9)', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce({ ...mockRisk, riskScore: 9, riskLevel: 'MEDIUM' });

      await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 3, impact: 3 });

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(9);
      expect(createCall.data.riskLevel).toBe('MEDIUM');
    });

    it('should calculate MEDIUM for score 12 (e.g. 3*4=12)', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce({ ...mockRisk, riskScore: 12, riskLevel: 'MEDIUM' });

      await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 3, impact: 4 });

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(12);
      expect(createCall.data.riskLevel).toBe('MEDIUM');
    });

    it('should calculate HIGH for score 13-19 (e.g. 3*5=15)', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce({ ...mockRisk, riskScore: 15, riskLevel: 'HIGH' });

      await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 3, impact: 5 });

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(15);
      expect(createCall.data.riskLevel).toBe('HIGH');
    });

    it('should calculate CRITICAL for score 20-25 (e.g. 4*5=20)', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce(mockRisk);

      await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 4, impact: 5 });

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(20);
      expect(createCall.data.riskLevel).toBe('CRITICAL');
    });

    it('should calculate CRITICAL for score 25 (e.g. 5*5=25)', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce({ ...mockRisk, riskScore: 25 });

      await request(app)
        .post('/api/risks')
        .send({ ...validCreatePayload, likelihood: 5, impact: 5 });

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.riskScore).toBe(25);
      expect(createCall.data.riskLevel).toBe('CRITICAL');
    });

    it('should generate a ref number starting with ISR-', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce(mockRisk);

      await request(app)
        .post('/api/risks')
        .send(validCreatePayload);

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toMatch(/^ISR-/);
    });

    it('should set status to IDENTIFIED on create', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockResolvedValueOnce(mockRisk);

      await request(app)
        .post('/api/risks')
        .send(validCreatePayload);

      const createCall = (mockPrisma.infoSecRisk.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('IDENTIFIED');
    });

    it('should return 400 for missing threat', async () => {
      const res = await request(app)
        .post('/api/risks')
        .send({ title: 'Test', vulnerability: 'X', likelihood: 3, impact: 3 });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing vulnerability', async () => {
      const res = await request(app)
        .post('/api/risks')
        .send({ title: 'Test', threat: 'X', likelihood: 3, impact: 3 });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.infoSecRisk.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/risks')
        .send(validCreatePayload);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/risks ----

  describe('GET /api/risks', () => {
    it('should return paginated list', async () => {
      (mockPrisma.infoSecRisk.findMany as jest.Mock).mockResolvedValueOnce([mockRisk]);
      (mockPrisma.infoSecRisk.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/risks');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by riskLevel', async () => {
      (mockPrisma.infoSecRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.infoSecRisk.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risks?riskLevel=CRITICAL');

      const findCall = (mockPrisma.infoSecRisk.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.riskLevel).toBe('CRITICAL');
    });

    it('should filter by status', async () => {
      (mockPrisma.infoSecRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.infoSecRisk.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risks?status=TREATING');

      const findCall = (mockPrisma.infoSecRisk.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.status).toBe('TREATING');
    });

    it('should exclude soft-deleted risks', async () => {
      (mockPrisma.infoSecRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.infoSecRisk.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risks');

      const findCall = (mockPrisma.infoSecRisk.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.deletedAt).toBeNull();
    });

    it('should order by riskScore descending', async () => {
      (mockPrisma.infoSecRisk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.infoSecRisk.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risks');

      const findCall = (mockPrisma.infoSecRisk.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.orderBy).toEqual({ riskScore: 'desc' });
    });
  });

  // ---- GET /api/risks/heat-map ----

  describe('GET /api/risks/heat-map', () => {
    it('should return 5x5 matrix', async () => {
      (mockPrisma.infoSecRisk.findMany as jest.Mock).mockResolvedValueOnce([
        { likelihood: 4, impact: 5 },
        { likelihood: 2, impact: 3 },
      ]);

      const res = await request(app).get('/api/risks/heat-map');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matrix).toBeDefined();
      expect(res.body.data.matrix).toHaveLength(5);
      expect(res.body.data.matrix[0]).toHaveLength(5);
    });

    it('should count risks in correct cells', async () => {
      (mockPrisma.infoSecRisk.findMany as jest.Mock).mockResolvedValueOnce([
        { likelihood: 1, impact: 1 },
        { likelihood: 1, impact: 1 },
        { likelihood: 5, impact: 5 },
      ]);

      const res = await request(app).get('/api/risks/heat-map');

      // matrix[0][0] = likelihood=1, impact=1 => should have 2 risks
      expect(res.body.data.matrix[0][0]).toBe(2);
      // matrix[4][4] = likelihood=5, impact=5 => should have 1 risk
      expect(res.body.data.matrix[4][4]).toBe(1);
    });

    it('should return totalRisks count', async () => {
      (mockPrisma.infoSecRisk.findMany as jest.Mock).mockResolvedValueOnce([
        { likelihood: 3, impact: 3 },
      ]);

      const res = await request(app).get('/api/risks/heat-map');

      expect(res.body.data.totalRisks).toBe(1);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.infoSecRisk.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/risks/heat-map');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/risks/:id ----

  describe('GET /api/risks/:id', () => {
    it('should return risk detail', async () => {
      (mockPrisma.infoSecRisk.findFirst as jest.Mock).mockResolvedValueOnce(mockRisk);

      const res = await request(app).get('/api/risks/risk-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(mockRisk.title);
    });

    it('should return 404 when risk not found', async () => {
      (mockPrisma.infoSecRisk.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/risks/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- PUT /api/risks/:id ----

  describe('PUT /api/risks/:id', () => {
    it('should update and recalculate score', async () => {
      (mockPrisma.infoSecRisk.findFirst as jest.Mock).mockResolvedValueOnce({ ...mockRisk, likelihood: 4, impact: 5 });
      (mockPrisma.infoSecRisk.update as jest.Mock).mockResolvedValueOnce({ ...mockRisk, likelihood: 2, impact: 3, riskScore: 6, riskLevel: 'LOW' });

      const res = await request(app)
        .put('/api/risks/risk-1')
        .send({ likelihood: 2, impact: 3 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updateCall = (mockPrisma.infoSecRisk.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.riskScore).toBe(6);
      expect(updateCall.data.riskLevel).toBe('LOW');
    });

    it('should recalculate using existing values when only likelihood changes', async () => {
      (mockPrisma.infoSecRisk.findFirst as jest.Mock).mockResolvedValueOnce({ ...mockRisk, likelihood: 4, impact: 5 });
      (mockPrisma.infoSecRisk.update as jest.Mock).mockResolvedValueOnce(mockRisk);

      await request(app)
        .put('/api/risks/risk-1')
        .send({ likelihood: 2 });

      const updateCall = (mockPrisma.infoSecRisk.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.riskScore).toBe(10); // 2 * 5
      expect(updateCall.data.riskLevel).toBe('MEDIUM');
    });

    it('should return 404 when risk not found', async () => {
      (mockPrisma.infoSecRisk.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/risks/nonexistent')
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app)
        .put('/api/risks/risk-1')
        .send({ likelihood: 10 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- PUT /api/risks/:id/treatment ----

  describe('PUT /api/risks/:id/treatment', () => {
    it('should assign treatment plan and set status to TREATING', async () => {
      (mockPrisma.infoSecRisk.findFirst as jest.Mock).mockResolvedValueOnce(mockRisk);
      (mockPrisma.infoSecRisk.update as jest.Mock).mockResolvedValueOnce({
        ...mockRisk,
        treatment: 'MITIGATE',
        treatmentPlan: 'Implement MFA',
        status: 'TREATING',
      });

      const res = await request(app)
        .put('/api/risks/risk-1/treatment')
        .send({ treatment: 'MITIGATE', treatmentPlan: 'Implement MFA' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const updateCall = (mockPrisma.infoSecRisk.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.status).toBe('TREATING');
    });

    it('should calculate residual risk when provided', async () => {
      (mockPrisma.infoSecRisk.findFirst as jest.Mock).mockResolvedValueOnce(mockRisk);
      (mockPrisma.infoSecRisk.update as jest.Mock).mockResolvedValueOnce(mockRisk);

      await request(app)
        .put('/api/risks/risk-1/treatment')
        .send({
          treatment: 'MITIGATE',
          treatmentPlan: 'Implement MFA',
          residualLikelihood: 2,
          residualImpact: 3,
        });

      const updateCall = (mockPrisma.infoSecRisk.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.residualLikelihood).toBe(2);
      expect(updateCall.data.residualImpact).toBe(3);
      expect(updateCall.data.residualRiskScore).toBe(6);
    });

    it('should return 404 when risk not found', async () => {
      (mockPrisma.infoSecRisk.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/risks/nonexistent/treatment')
        .send({ treatment: 'ACCEPT', treatmentPlan: 'Accept risk' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing treatmentPlan', async () => {
      const res = await request(app)
        .put('/api/risks/risk-1/treatment')
        .send({ treatment: 'MITIGATE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid treatment value', async () => {
      const res = await request(app)
        .put('/api/risks/risk-1/treatment')
        .send({ treatment: 'IGNORE', treatmentPlan: 'Ignore it' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
