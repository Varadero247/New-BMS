import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    risk: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '../src/prisma';
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
        riskScore: 20,
        riskLevel: 'HIGH',
        status: 'ACTIVE',
      },
      {
        id: 'risk-2',
        title: 'Chemical exposure',
        description: 'Risk from handling chemicals',
        riskScore: 12,
        riskLevel: 'MEDIUM',
        status: 'ACTIVE',
      },
    ];

    it('should return list of risks with pagination', async () => {
      (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce(mockRisks);
      (mockPrisma.risk.count as jest.Mock).mockResolvedValueOnce(2);

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
      (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([mockRisks[0]]);
      (mockPrisma.risk.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/risks?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.risk.count as jest.Mock).mockResolvedValueOnce(0);

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
      (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.risk.count as jest.Mock).mockResolvedValueOnce(0);

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
      (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.risk.count as jest.Mock).mockResolvedValueOnce(0);

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
      (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce(mockRisks);
      (mockPrisma.risk.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/risks')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([{ riskScore: 'desc' }]),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.risk.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/risks')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/risks/matrix', () => {
    it('should return risk matrix data', async () => {
      (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'r1', title: 'Risk 1', likelihood: 3, severity: 4, riskScore: 12 },
        { id: 'r2', title: 'Risk 2', likelihood: 2, severity: 3, riskScore: 6 },
        { id: 'r3', title: 'Risk 3', likelihood: 3, severity: 4, riskScore: 12 },
      ]);

      const response = await request(app)
        .get('/api/risks/matrix')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('3-4');
      expect(response.body.data['3-4']).toHaveLength(2);
    });

    it('should handle database errors', async () => {
      (mockPrisma.risk.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
      riskScore: 20,
    };

    it('should return single risk', async () => {
      (mockPrisma.risk.findUnique as jest.Mock).mockResolvedValueOnce(mockRisk);

      const response = await request(app)
        .get('/api/risks/risk-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('risk-1');
    });

    it('should return 404 for non-existent risk', async () => {
      (mockPrisma.risk.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/risks/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.risk.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
    };

    it('should create a risk successfully', async () => {
      (mockPrisma.risk.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.risk.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        ...createPayload,
        referenceNumber: 'HS-001',
        riskScore: 12,
        riskLevel: 'MEDIUM',
        status: 'ACTIVE',
      });

      const response = await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should calculate risk score from L x S', async () => {
      (mockPrisma.risk.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.risk.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        riskScore: 12,
        riskLevel: 'MEDIUM',
      });

      await request(app)
        .post('/api/risks')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.risk.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskScore: 12,
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

    it('should handle database errors', async () => {
      (mockPrisma.risk.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.risk.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
    };

    it('should update risk successfully', async () => {
      (mockPrisma.risk.findUnique as jest.Mock).mockResolvedValueOnce(existingRisk);
      (mockPrisma.risk.update as jest.Mock).mockResolvedValueOnce({
        ...existingRisk,
        title: 'Updated Title',
      });

      const response = await request(app)
        .patch('/api/risks/risk-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent risk', async () => {
      (mockPrisma.risk.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/risks/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.risk.findUnique as jest.Mock).mockResolvedValueOnce(existingRisk);

      const response = await request(app)
        .patch('/api/risks/risk-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.risk.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
      (mockPrisma.risk.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'risk-1' });
      (mockPrisma.risk.delete as jest.Mock).mockResolvedValueOnce({});

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
      (mockPrisma.risk.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/risks/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.risk.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/risks/risk-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
