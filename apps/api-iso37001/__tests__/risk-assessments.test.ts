import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    abRiskAssessment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import riskAssessmentsRouter from '../src/routes/risk-assessments';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/risk-assessments', riskAssessmentsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockRisk = {
  id: '00000000-0000-0000-0000-000000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  title: 'Country Risk - High Corruption Index',
  description: 'Operations in country with high corruption perception index',
  category: 'BRIBERY_OF_PUBLIC_OFFICIALS',
  riskLevel: 'HIGH',
  businessFunction: 'International Operations',
  country: 'Nigeria',
  likelihood: 4,
  impact: 4,
  riskScore: 16,
  existingControls: null,
  mitigationPlan: null,
  residualLikelihood: null,
  residualImpact: null,
  residualRiskScore: null,
  residualRiskLevel: null,
  controlsAdded: null,
  mitigationOwner: null,
  targetDate: null,
  owner: 'Risk Manager',
  reviewDate: null,
  status: 'IDENTIFIED',
  referenceNumber: 'AB-RSK-2602-1234',
  updatedBy: 'user-123',
  notes: null,
};

const mockRisk2 = {
  ...mockRisk,
  id: '00000000-0000-0000-0000-000000000002',
  title: 'Third Party Risk',
  category: 'THIRD_PARTY_RISKS',
  riskLevel: 'MEDIUM',
  likelihood: 3,
  impact: 3,
  riskScore: 9,
  businessFunction: 'Procurement',
  referenceNumber: 'AB-RSK-2602-5678',
};

describe('ISO 37001 Risk Assessments API', () => {
  // =========================================================================
  // GET /api/risk-assessments
  // =========================================================================
  describe('GET /api/risk-assessments', () => {
    it('should return paginated list of risk assessments', async () => {
      (mockPrisma.abRiskAssessment.findMany as jest.Mock).mockResolvedValueOnce([
        mockRisk,
        mockRisk2,
      ]);
      (mockPrisma.abRiskAssessment.count as jest.Mock).mockResolvedValueOnce(2);

      const res = await request(app).get('/api/risk-assessments');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should support pagination', async () => {
      (mockPrisma.abRiskAssessment.findMany as jest.Mock).mockResolvedValueOnce([mockRisk]);
      (mockPrisma.abRiskAssessment.count as jest.Mock).mockResolvedValueOnce(25);

      const res = await request(app).get('/api/risk-assessments?page=3&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(3);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.totalPages).toBe(5);
    });

    it('should filter by category', async () => {
      (mockPrisma.abRiskAssessment.findMany as jest.Mock).mockResolvedValueOnce([mockRisk]);
      (mockPrisma.abRiskAssessment.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/risk-assessments?category=BRIBERY_OF_PUBLIC_OFFICIALS');

      expect(mockPrisma.abRiskAssessment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'BRIBERY_OF_PUBLIC_OFFICIALS' }),
        })
      );
    });

    it('should filter by riskLevel', async () => {
      (mockPrisma.abRiskAssessment.findMany as jest.Mock).mockResolvedValueOnce([mockRisk]);
      (mockPrisma.abRiskAssessment.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/risk-assessments?riskLevel=HIGH');

      expect(mockPrisma.abRiskAssessment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ riskLevel: 'HIGH' }),
        })
      );
    });

    it('should filter by businessFunction', async () => {
      (mockPrisma.abRiskAssessment.findMany as jest.Mock).mockResolvedValueOnce([mockRisk2]);
      (mockPrisma.abRiskAssessment.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/risk-assessments?businessFunction=Procurement');

      expect(mockPrisma.abRiskAssessment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            businessFunction: expect.objectContaining({ contains: 'Procurement' }),
          }),
        })
      );
    });

    it('should return empty list', async () => {
      (mockPrisma.abRiskAssessment.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abRiskAssessment.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/risk-assessments');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abRiskAssessment.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );
      (mockPrisma.abRiskAssessment.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/risk-assessments');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /api/risk-assessments
  // =========================================================================
  describe('POST /api/risk-assessments', () => {
    const validPayload = {
      title: 'Country Risk - High Corruption Index',
      category: 'BRIBERY_OF_PUBLIC_OFFICIALS',
      businessFunction: 'International Operations',
      likelihood: 4,
      impact: 4,
    };

    it('should create a risk assessment with auto-calculated riskScore and return 201', async () => {
      (mockPrisma.abRiskAssessment.create as jest.Mock).mockResolvedValueOnce(mockRisk);

      const res = await request(app).post('/api/risk-assessments').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.abRiskAssessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            riskScore: 16,
            riskLevel: 'HIGH',
          }),
        })
      );
    });

    it('should calculate LOW risk level for low scores (score < 6)', async () => {
      (mockPrisma.abRiskAssessment.create as jest.Mock).mockResolvedValueOnce({
        ...mockRisk,
        riskScore: 2,
        riskLevel: 'LOW',
      });

      await request(app)
        .post('/api/risk-assessments')
        .send({
          ...validPayload,
          likelihood: 1,
          impact: 2,
        });

      expect(mockPrisma.abRiskAssessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            riskScore: 2,
            riskLevel: 'LOW',
          }),
        })
      );
    });

    it('should calculate CRITICAL risk level for scores >= 20', async () => {
      (mockPrisma.abRiskAssessment.create as jest.Mock).mockResolvedValueOnce({
        ...mockRisk,
        riskScore: 25,
        riskLevel: 'CRITICAL',
      });

      await request(app)
        .post('/api/risk-assessments')
        .send({
          ...validPayload,
          likelihood: 5,
          impact: 5,
        });

      expect(mockPrisma.abRiskAssessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            riskScore: 25,
            riskLevel: 'CRITICAL',
          }),
        })
      );
    });

    it('should calculate MEDIUM risk level for scores 6-11', async () => {
      (mockPrisma.abRiskAssessment.create as jest.Mock).mockResolvedValueOnce({
        ...mockRisk,
        riskScore: 9,
        riskLevel: 'MEDIUM',
      });

      await request(app)
        .post('/api/risk-assessments')
        .send({
          ...validPayload,
          likelihood: 3,
          impact: 3,
        });

      expect(mockPrisma.abRiskAssessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            riskScore: 9,
            riskLevel: 'MEDIUM',
          }),
        })
      );
    });

    it('should return 400 when title is missing', async () => {
      const { title, ...payload } = validPayload;
      const res = await request(app).post('/api/risk-assessments').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when category is invalid', async () => {
      const res = await request(app)
        .post('/api/risk-assessments')
        .send({
          ...validPayload,
          category: 'INVALID_CATEGORY',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when likelihood is out of range', async () => {
      const res = await request(app)
        .post('/api/risk-assessments')
        .send({
          ...validPayload,
          likelihood: 6,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when businessFunction is missing', async () => {
      const { businessFunction, ...payload } = validPayload;
      const res = await request(app).post('/api/risk-assessments').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database create error', async () => {
      (mockPrisma.abRiskAssessment.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const res = await request(app).post('/api/risk-assessments').send(validPayload);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/risk-assessments/:id
  // =========================================================================
  describe('GET /api/risk-assessments/:id', () => {
    it('should return a risk assessment by ID', async () => {
      (mockPrisma.abRiskAssessment.findFirst as jest.Mock).mockResolvedValueOnce(mockRisk);

      const res = await request(app).get(
        '/api/risk-assessments/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.abRiskAssessment.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(
        '/api/risk-assessments/00000000-0000-0000-0000-000000000099'
      );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/risk-assessments/:id
  // =========================================================================
  describe('PUT /api/risk-assessments/:id', () => {
    it('should update a risk assessment and recalculate score', async () => {
      (mockPrisma.abRiskAssessment.findFirst as jest.Mock).mockResolvedValueOnce(mockRisk);
      (mockPrisma.abRiskAssessment.update as jest.Mock).mockResolvedValueOnce({
        ...mockRisk,
        likelihood: 2,
        impact: 3,
        riskScore: 6,
        riskLevel: 'MEDIUM',
      });

      const res = await request(app)
        .put('/api/risk-assessments/00000000-0000-0000-0000-000000000001')
        .send({ likelihood: 2, impact: 3 });

      expect(res.status).toBe(200);
      expect(mockPrisma.abRiskAssessment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            riskScore: 6,
            riskLevel: 'MEDIUM',
          }),
        })
      );
    });

    it('should return 404 when not found for update', async () => {
      (mockPrisma.abRiskAssessment.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/risk-assessments/00000000-0000-0000-0000-000000000099')
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/risk-assessments/:id/mitigate
  // =========================================================================
  describe('PUT /api/risk-assessments/:id/mitigate', () => {
    it('should set mitigation plan and calculate residual risk', async () => {
      (mockPrisma.abRiskAssessment.findFirst as jest.Mock).mockResolvedValueOnce(mockRisk);
      (mockPrisma.abRiskAssessment.update as jest.Mock).mockResolvedValueOnce({
        ...mockRisk,
        status: 'MITIGATED',
        mitigationPlan: 'Enhanced due diligence procedures',
        residualLikelihood: 2,
        residualImpact: 2,
        residualRiskScore: 4,
        residualRiskLevel: 'LOW',
      });

      const res = await request(app)
        .put('/api/risk-assessments/00000000-0000-0000-0000-000000000001/mitigate')
        .send({
          mitigationPlan: 'Enhanced due diligence procedures',
          residualLikelihood: 2,
          residualImpact: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('MITIGATED');
      expect(mockPrisma.abRiskAssessment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'MITIGATED',
            mitigationPlan: 'Enhanced due diligence procedures',
            residualLikelihood: 2,
            residualImpact: 2,
            residualRiskScore: 4,
            residualRiskLevel: 'LOW',
          }),
        })
      );
    });

    it('should return 400 when mitigationPlan is missing', async () => {
      const res = await request(app)
        .put('/api/risk-assessments/00000000-0000-0000-0000-000000000001/mitigate')
        .send({ residualLikelihood: 2, residualImpact: 2 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when residualLikelihood is missing', async () => {
      const res = await request(app)
        .put('/api/risk-assessments/00000000-0000-0000-0000-000000000001/mitigate')
        .send({ mitigationPlan: 'Some plan', residualImpact: 2 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when residualImpact is missing', async () => {
      const res = await request(app)
        .put('/api/risk-assessments/00000000-0000-0000-0000-000000000001/mitigate')
        .send({ mitigationPlan: 'Some plan', residualLikelihood: 2 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when not found for mitigation', async () => {
      (mockPrisma.abRiskAssessment.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/risk-assessments/00000000-0000-0000-0000-000000000099/mitigate')
        .send({ mitigationPlan: 'Test', residualLikelihood: 2, residualImpact: 2 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // DELETE /api/risk-assessments/:id
  // =========================================================================
  describe('DELETE /api/risk-assessments/:id', () => {
    it('should soft delete a risk assessment', async () => {
      (mockPrisma.abRiskAssessment.findFirst as jest.Mock).mockResolvedValueOnce(mockRisk);
      (mockPrisma.abRiskAssessment.update as jest.Mock).mockResolvedValueOnce({
        ...mockRisk,
        deletedAt: new Date(),
      });

      const res = await request(app).delete(
        '/api/risk-assessments/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found for deletion', async () => {
      (mockPrisma.abRiskAssessment.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(
        '/api/risk-assessments/00000000-0000-0000-0000-000000000099'
      );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
