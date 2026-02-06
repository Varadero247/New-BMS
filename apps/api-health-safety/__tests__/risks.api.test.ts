import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    risk: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('@ims/calculations', () => ({
  calculateRiskScore: jest.fn().mockReturnValue(15),
  getRiskLevel: jest.fn().mockReturnValue('MEDIUM'),
}));

import { prisma } from '@ims/database';
import risksRoutes from '../src/routes/risks';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Health & Safety Risks API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/risks', () => {
    const mockRisks = [
      {
        id: 'risk-1',
        title: 'Fall from height',
        description: 'Risk of falls when working at height',
        standard: 'ISO_45001',
        riskScore: 20,
        riskLevel: 'HIGH',
        status: 'ACTIVE',
      },
      {
        id: 'risk-2',
        title: 'Chemical exposure',
        description: 'Risk from handling chemicals',
        standard: 'ISO_45001',
        riskScore: 12,
        riskLevel: 'MEDIUM',
        status: 'ACTIVE',
      },
    ];

    it('should return list of risks with pagination', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce(mockRisks as any);
      mockPrisma.risk.count.mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/risks')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([mockRisks[0]] as any);
      mockPrisma.risk.count.mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/risks?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([]);
      mockPrisma.risk.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/risks?status=MITIGATED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'MITIGATED',
          }),
        })
      );
    });

    it('should filter by riskLevel', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([]);
      mockPrisma.risk.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/risks?riskLevel=HIGH')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskLevel: 'HIGH',
          }),
        })
      );
    });

    it('should filter by category', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([]);
      mockPrisma.risk.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/risks?category=PHYSICAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'PHYSICAL',
          }),
        })
      );
    });

    it('should order by riskScore descending', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce(mockRisks as any);
      mockPrisma.risk.count.mockResolvedValueOnce(2);

      await request(app)
        .get('/api/risks')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { riskScore: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.risk.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/risks')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/risks/matrix', () => {
    it('should return risk matrix data', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([
        { id: 'r1', title: 'Risk 1', likelihood: 3, severity: 4, riskScore: 12 },
        { id: 'r2', title: 'Risk 2', likelihood: 2, severity: 3, riskScore: 6 },
        { id: 'r3', title: 'Risk 3', likelihood: 3, severity: 4, riskScore: 12 },
      ] as any);

      const response = await request(app)
        .get('/api/risks/matrix')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('3-4');
      expect(response.body.data['3-4']).toHaveLength(2);
    });

    it('should only include active risks', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([]);

      await request(app)
        .get('/api/risks/matrix')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { standard: 'ISO_45001', status: 'ACTIVE' },
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.risk.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/risks/matrix')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/risks/:id', () => {
    const mockRisk = {
      id: 'risk-1',
      title: 'Fall from height',
      description: 'Risk of falls',
      standard: 'ISO_45001',
      riskScore: 20,
      actions: [],
    };

    it('should return single risk with actions', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(mockRisk as any);

      const response = await request(app)
        .get('/api/risks/risk-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('risk-1');
    });

    it('should return 404 for non-existent risk', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/risks/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should only find risks for ISO_45001 standard', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(null);

      await request(app)
        .get('/api/risks/risk-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.risk.findFirst).toHaveBeenCalledWith({
        where: { id: 'risk-1', standard: 'ISO_45001' },
        include: { actions: true },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.risk.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/risks/risk-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/risks', () => {
    const createPayload = {
      title: 'New Risk',
      description: 'Description of the risk',
      likelihood: 3,
      severity: 4,
      detectability: 2,
    };

    it('should create a risk successfully', async () => {
      mockPrisma.risk.create.mockResolvedValueOnce({
        id: 'new-risk-123',
        ...createPayload,
        standard: 'ISO_45001',
        riskScore: 15,
        riskLevel: 'MEDIUM',
        status: 'ACTIVE',
      } as any);

      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should calculate risk score from likelihood, severity, detectability', async () => {
      mockPrisma.risk.create.mockResolvedValueOnce({
        id: 'new-risk-123',
        riskScore: 15,
        riskLevel: 'MEDIUM',
      } as any);

      await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.risk.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskScore: 15,
          riskLevel: 'MEDIUM',
        }),
      });
    });

    it('should set default values for optional fields', async () => {
      mockPrisma.risk.create.mockResolvedValueOnce({ id: 'new-risk' } as any);

      await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Risk', description: 'Desc' });

      expect(mockPrisma.risk.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'ACTIVE',
          standard: 'ISO_45001',
        }),
      });
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ description: 'No title' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing description', async () => {
      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ title: 'No description' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate likelihood range (1-5)', async () => {
      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, likelihood: 6 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate severity range (1-5)', async () => {
      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, severity: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.risk.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PATCH /api/risks/:id', () => {
    const existingRisk = {
      id: 'risk-1',
      title: 'Existing Risk',
      likelihood: 3,
      severity: 3,
      detectability: 3,
      standard: 'ISO_45001',
    };

    it('should update risk successfully', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(existingRisk as any);
      mockPrisma.risk.update.mockResolvedValueOnce({
        ...existingRisk,
        title: 'Updated Title',
      } as any);

      const response = await request(app)
        .patch('/api/risks/risk-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent risk', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/risks/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should recalculate risk score when factors change', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(existingRisk as any);
      mockPrisma.risk.update.mockResolvedValueOnce({ id: 'risk-1' } as any);

      await request(app)
        .patch('/api/risks/risk-1')
        .set('Authorization', 'Bearer token')
        .send({ likelihood: 5 });

      expect(mockPrisma.risk.update).toHaveBeenCalledWith({
        where: { id: 'risk-1' },
        data: expect.objectContaining({
          riskScore: 15,
          riskLevel: 'MEDIUM',
          lastReviewedAt: expect.any(Date),
        }),
      });
    });

    it('should allow updating status', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(existingRisk as any);
      mockPrisma.risk.update.mockResolvedValueOnce({ id: 'risk-1', status: 'MITIGATED' } as any);

      const response = await request(app)
        .patch('/api/risks/risk-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'MITIGATED' });

      expect(response.status).toBe(200);
      expect(mockPrisma.risk.update).toHaveBeenCalledWith({
        where: { id: 'risk-1' },
        data: expect.objectContaining({
          status: 'MITIGATED',
        }),
      });
    });

    it('should return 400 for invalid status value', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(existingRisk as any);

      const response = await request(app)
        .patch('/api/risks/risk-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.risk.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .patch('/api/risks/risk-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/risks/:id', () => {
    it('should delete risk successfully', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce({ id: 'risk-1' } as any);
      mockPrisma.risk.delete.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .delete('/api/risks/risk-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.risk.delete).toHaveBeenCalledWith({
        where: { id: 'risk-1' },
      });
    });

    it('should return 404 for non-existent risk', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/risks/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should only delete risks for ISO_45001 standard', async () => {
      mockPrisma.risk.findFirst.mockResolvedValueOnce(null);

      await request(app)
        .delete('/api/risks/risk-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.risk.findFirst).toHaveBeenCalledWith({
        where: { id: 'risk-1', standard: 'ISO_45001' },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.risk.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/risks/risk-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
