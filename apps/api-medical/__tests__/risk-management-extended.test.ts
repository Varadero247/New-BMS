import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskManagementFile: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    hazard: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    riskControl: { findMany: jest.fn(), create: jest.fn() },
  },
  Prisma: { RiskManagementFileWhereInput: {} },
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
import riskMgmtRouter from '../src/routes/risk-management';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/risk-management', riskMgmtRouter);

describe('Risk Management Routes (Medical)', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/risk-management', () => {
    const validBody = {
      title: 'Cardiac Monitor Risk File',
      deviceName: 'Cardiac Monitor X200',
      deviceClass: 'CLASS_II',
    };

    it('should create a risk management file', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', refNumber: 'RMF-2602-0001', ...validBody, status: 'DRAFT',
      });

      const res = await request(app).post('/api/risk-management').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app).post('/api/risk-management').send({
        deviceName: 'X200', deviceClass: 'CLASS_II',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing deviceName', async () => {
      const res = await request(app).post('/api/risk-management').send({
        title: 'Test', deviceClass: 'CLASS_II',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid deviceClass', async () => {
      const res = await request(app).post('/api/risk-management').send({
        title: 'Test', deviceName: 'X200', deviceClass: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should accept CLASS_III', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockResolvedValue({ id: 'rmf-2' });

      const res = await request(app).post('/api/risk-management').send({
        ...validBody, deviceClass: 'CLASS_III',
      });
      expect(res.status).toBe(201);
    });

    it('should accept CLASS_IIA', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockResolvedValue({ id: 'rmf-3' });

      const res = await request(app).post('/api/risk-management').send({
        ...validBody, deviceClass: 'CLASS_IIA',
      });
      expect(res.status).toBe(201);
    });

    it('should accept CLASS_IIB', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockResolvedValue({ id: 'rmf-4' });

      const res = await request(app).post('/api/risk-management').send({
        ...validBody, deviceClass: 'CLASS_IIB',
      });
      expect(res.status).toBe(201);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockResolvedValue({ id: 'rmf-5' });

      const res = await request(app).post('/api/risk-management').send({
        ...validBody,
        intendedUse: 'Patient monitoring',
        riskPolicy: 'ALARP principle',
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/risk-management').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/risk-management', () => {
    it('should list RMFs', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001' }]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/risk-management');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValue(30);

      const res = await request(app).get('/api/risk-management?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.riskManagementFile.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/risk-management');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/risk-management/:id', () => {
    it('should get RMF with hazards', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null, hazards: [],
      });

      const res = await request(app).get('/api/risk-management/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/risk-management/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date(),
      });

      const res = await request(app).get('/api/risk-management/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/risk-management/:id/hazards', () => {
    const validHazard = {
      hazardCategory: 'ENERGY',
      hazardDescription: 'Electrical shock from exposed terminals',
      hazardousSituation: 'User contacts exposed wires',
      harm: 'Electrical burn',
      severityBefore: 4,
      probabilityBefore: 3,
    };

    it('should add a hazard', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null,
      });
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.hazard.create as jest.Mock).mockResolvedValue({
        id: 'hz-1', hazardId: 'H-001', riskLevelBefore: 'MEDIUM',
      });

      const res = await request(app).post('/api/risk-management/00000000-0000-0000-0000-000000000001/hazards').send(validHazard);
      expect(res.status).toBe(201);
    });

    it('should return 404 if RMF not found', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/risk-management/00000000-0000-0000-0000-000000000099/hazards').send(validHazard);
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid hazardCategory', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null });

      const res = await request(app).post('/api/risk-management/00000000-0000-0000-0000-000000000001/hazards').send({
        ...validHazard, hazardCategory: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for severity out of range', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null });

      const res = await request(app).post('/api/risk-management/00000000-0000-0000-0000-000000000001/hazards').send({
        ...validHazard, severityBefore: 6,
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for probability 0', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null });

      const res = await request(app).post('/api/risk-management/00000000-0000-0000-0000-000000000001/hazards').send({
        ...validHazard, probabilityBefore: 0,
      });
      expect(res.status).toBe(400);
    });

    it('should accept USE_ERROR category', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null });
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValue(1);
      (mockPrisma.hazard.create as jest.Mock).mockResolvedValue({ id: 'hz-2' });

      const res = await request(app).post('/api/risk-management/00000000-0000-0000-0000-000000000001/hazards').send({
        ...validHazard, hazardCategory: 'USE_ERROR',
      });
      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/risk-management/:id/benefit-risk', () => {
    const validBody = {
      overallRiskAcceptable: true,
      benefitRiskAcceptable: true,
      benefitRiskAnalysis: 'Benefits outweigh residual risks',
      reportSummary: 'All hazards mitigated to acceptable levels',
    };

    it('should submit benefit-risk analysis', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null });
      (mockPrisma.riskManagementFile.update as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

      const res = await request(app).post('/api/risk-management/00000000-0000-0000-0000-000000000001/benefit-risk').send(validBody);
      expect(res.status).toBe(200);
    });

    it('should return 404 if RMF not found', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/risk-management/00000000-0000-0000-0000-000000000099/benefit-risk').send(validBody);
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing benefitRiskAnalysis', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null });

      const { benefitRiskAnalysis, ...noAnalysis } = validBody;
      const res = await request(app).post('/api/risk-management/00000000-0000-0000-0000-000000000001/benefit-risk').send(noAnalysis);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/risk-management/:id/report', () => {
    it('should return risk management report', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null,
        hazards: [
          {
            riskLevelBefore: 'MEDIUM', riskLevelAfter: 'LOW',
            residualRiskAcceptable: true, controls: [{ implementationStatus: 'IMPLEMENTED' }],
          },
        ],
      });

      const res = await request(app).get('/api/risk-management/00000000-0000-0000-0000-000000000001/report');
      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalHazards).toBe(1);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/risk-management/00000000-0000-0000-0000-000000000099/report');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/risk-management/:id/residual', () => {
    it('should return residual risk summary', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null, refNumber: 'RMF-2602-0001', deviceName: 'X200',
        overallRiskAcceptable: true, benefitRiskAcceptable: true,
        hazards: [
          { riskLevelAfter: 'LOW', residualRiskAcceptable: true },
          { riskLevelAfter: null, residualRiskAcceptable: null },
        ],
      });

      const res = await request(app).get('/api/risk-management/00000000-0000-0000-0000-000000000001/residual');
      expect(res.status).toBe(200);
      expect(res.body.data.totalHazards).toBe(2);
      expect(res.body.data.residualRiskAcceptance.acceptable).toBe(1);
      expect(res.body.data.residualRiskAcceptance.notEvaluated).toBe(1);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/risk-management/00000000-0000-0000-0000-000000000099/residual');
      expect(res.status).toBe(404);
    });
  });
});
