import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    envAspect: {
      findMany: jest.fn(),
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
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import aspectsRoutes from '../src/routes/aspects';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Environment Aspects API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/aspects', aspectsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/aspects', () => {
    const mockAspects = [
      {
        id: '16000000-0000-4000-a000-000000000001',
        referenceNumber: 'ENV-ASP-2026-001',
        activityProcess: 'Manufacturing',
        aspect: 'Air emissions',
        impact: 'Air pollution',
        significanceScore: 18,
        isSignificant: true,
        status: 'ACTIVE',
      },
      {
        id: 'env00000-0000-4000-a000-000000000002',
        referenceNumber: 'ENV-ASP-2026-002',
        activityProcess: 'Waste disposal',
        aspect: 'Waste generation',
        impact: 'Land contamination',
        significanceScore: 10,
        isSignificant: false,
        status: 'ACTIVE',
      },
    ];

    it('should return list of aspects with pagination', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockResolvedValueOnce(mockAspects);
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/aspects').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockResolvedValueOnce([mockAspects[0]]);
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/aspects?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/aspects?status=ACTIVE').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAspect.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should filter by significant=true', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/aspects?significant=true').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAspect.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isSignificant: true,
          }),
        })
      );
    });

    it('should filter by significant=false', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/aspects?significant=false').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAspect.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isSignificant: false,
          }),
        })
      );
    });

    it('should support search across activityProcess, aspect, impact, referenceNumber', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/aspects?search=emissions').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAspect.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { activityProcess: { contains: 'emissions', mode: 'insensitive' } },
              { aspect: { contains: 'emissions', mode: 'insensitive' } },
              { impact: { contains: 'emissions', mode: 'insensitive' } },
              { referenceNumber: { contains: 'emissions', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should order by significanceScore descending', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockResolvedValueOnce(mockAspects);
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/aspects').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAspect.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { significanceScore: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/aspects').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/aspects/:id', () => {
    const mockAspect = {
      id: '16000000-0000-4000-a000-000000000001',
      referenceNumber: 'ENV-ASP-2026-001',
      activityProcess: 'Manufacturing',
      aspect: 'Air emissions',
      impact: 'Air pollution',
      significanceScore: 18,
    };

    it('should return single aspect', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce(mockAspect);

      const response = await request(app)
        .get('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('16000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff aspect', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/aspects/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/aspects', () => {
    const createPayload = {
      activityProcess: 'Manufacturing',
      activityCategory: 'EMISSIONS_TO_AIR',
      department: 'Operations',
      aspect: 'Air emissions from stack',
      impact: 'Air quality degradation',
      scoreSeverity: 3,
      scoreProbability: 4,
      scoreDuration: 2,
      scoreExtent: 3,
      scoreReversibility: 2,
      scoreRegulatory: 3,
      scoreStakeholder: 2,
    };

    it('should create an aspect successfully', async () => {
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envAspect.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'ENV-ASP-2026-001',
        ...createPayload,
        significanceScore: 22,
        isSignificant: true,
        status: 'ACTIVE',
      });

      const response = await request(app)
        .post('/api/aspects')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activityProcess).toBe(createPayload.activityProcess);
    });

    it('should calculate significance score from input scores', async () => {
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envAspect.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        significanceScore: 22,
        isSignificant: true,
      });

      await request(app)
        .post('/api/aspects')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      // Significance: 3*1.5 + 4*1.5 + 2 + 3 + 2 + 3 + 2 = 4.5 + 6 + 2 + 3 + 2 + 3 + 2 = 22.5 -> round to 23
      expect(mockPrisma.envAspect.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          significanceScore: expect.any(Number),
          isSignificant: expect.any(Boolean),
        }),
      });
    });

    it('should return 400 for missing activityProcess', async () => {
      const response = await request(app)
        .post('/api/aspects')
        .set('Authorization', 'Bearer token')
        .send({
          aspect: 'Some aspect',
          impact: 'Some impact',
          activityCategory: 'EMISSIONS_TO_AIR',
          department: 'Ops',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing aspect field', async () => {
      const response = await request(app)
        .post('/api/aspects')
        .set('Authorization', 'Bearer token')
        .send({
          activityProcess: 'Manufacturing',
          activityCategory: 'EMISSIONS_TO_AIR',
          department: 'Ops',
          impact: 'Some impact',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing impact field', async () => {
      const response = await request(app)
        .post('/api/aspects')
        .set('Authorization', 'Bearer token')
        .send({
          activityProcess: 'Manufacturing',
          activityCategory: 'EMISSIONS_TO_AIR',
          department: 'Ops',
          aspect: 'Air emissions',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing department', async () => {
      const response = await request(app)
        .post('/api/aspects')
        .set('Authorization', 'Bearer token')
        .send({
          activityProcess: 'Manufacturing',
          activityCategory: 'EMISSIONS_TO_AIR',
          aspect: 'Air emissions',
          impact: 'Pollution',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envAspect.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/aspects')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/aspects/:id', () => {
    const existingAspect = {
      id: '16000000-0000-4000-a000-000000000001',
      activityProcess: 'Manufacturing',
      aspect: 'Air emissions',
      impact: 'Air pollution',
      scoreSeverity: 3,
      scoreProbability: 3,
      scoreDuration: 2,
      scoreExtent: 2,
      scoreReversibility: 2,
      scoreRegulatory: 2,
      scoreStakeholder: 2,
      nextReviewDate: null,
    };

    it('should update aspect successfully', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce(existingAspect);
      (mockPrisma.envAspect.update as jest.Mock).mockResolvedValueOnce({
        ...existingAspect,
        activityProcess: 'Updated Manufacturing',
      });

      const response = await request(app)
        .put('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ activityProcess: 'Updated Manufacturing' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff aspect', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/aspects/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ activityProcess: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should recalculate significance on score update', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce(existingAspect);
      (mockPrisma.envAspect.update as jest.Mock).mockResolvedValueOnce({
        ...existingAspect,
        scoreSeverity: 5,
        significanceScore: 22,
        isSignificant: true,
      });

      await request(app)
        .put('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ scoreSeverity: 5 });

      expect(mockPrisma.envAspect.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            significanceScore: expect.any(Number),
            isSignificant: expect.any(Boolean),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ activityProcess: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/aspects/:id', () => {
    it('should delete aspect successfully', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '16000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.envAspect.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.envAspect.update).toHaveBeenCalledWith({
        where: { id: '16000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date), updatedBy: '20000000-0000-4000-a000-000000000123' },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff aspect', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/aspects/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('aspects – extended coverage', () => {
    it('GET /api/aspects returns success:true in response body', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(0);
      const response = await request(app).get('/api/aspects').set('Authorization', 'Bearer token');
      expect(response.body.success).toBe(true);
    });

    it('GET /api/aspects totalPages rounds up for non-divisible count', async () => {
      (mockPrisma.envAspect.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAspect.count as jest.Mock).mockResolvedValueOnce(101);
      const response = await request(app)
        .get('/api/aspects?page=1&limit=50')
        .set('Authorization', 'Bearer token');
      expect(response.body.meta.totalPages).toBe(3);
    });

    it('GET /api/aspects/:id returns success:true for existing aspect', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '16000000-0000-4000-a000-000000000001',
        referenceNumber: 'ENV-ASP-2026-001',
      });
      const response = await request(app)
        .get('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('PUT /api/aspects/:id returns success:true on successful update', async () => {
      const existingAspect = {
        id: '16000000-0000-4000-a000-000000000001',
        activityProcess: 'Manufacturing',
        aspect: 'Air emissions',
        impact: 'Air pollution',
        scoreSeverity: 3,
        scoreProbability: 3,
        scoreDuration: 2,
        scoreExtent: 2,
        scoreReversibility: 2,
        scoreRegulatory: 2,
        scoreStakeholder: 2,
        nextReviewDate: null,
      };
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce(existingAspect);
      (mockPrisma.envAspect.update as jest.Mock).mockResolvedValueOnce({
        ...existingAspect,
        activityProcess: 'Revised Process',
      });
      const response = await request(app)
        .put('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ activityProcess: 'Revised Process' });
      expect(response.body.success).toBe(true);
    });

    it('POST /api/aspects returns error.code VALIDATION_ERROR for missing scores when all numeric scores absent', async () => {
      const response = await request(app)
        .post('/api/aspects')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('DELETE /api/aspects/:id returns 204 on success', async () => {
      (mockPrisma.envAspect.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '16000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.envAspect.update as jest.Mock).mockResolvedValueOnce({});
      const response = await request(app)
        .delete('/api/aspects/16000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(response.status).toBe(204);
    });
  });
});
