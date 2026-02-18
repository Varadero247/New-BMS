import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualImprovement: {
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
import improvementsRoutes from '../src/routes/improvements';

const mockPrisma = prisma as any;

describe('Quality Improvements API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/improvements', improvementsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/improvements — List improvements
  // ============================================
  describe('GET /api/improvements', () => {
    const mockImprovements = [
      {
        id: '21000000-0000-4000-a000-000000000001',
        referenceNumber: 'QMS-CI-2026-001',
        title: 'Reduce defect rate',
        category: 'QUALITY_IMPROVEMENT',
        source: 'DATA_ANALYSIS',
        status: 'IN_PROGRESS',
        pdcaStage: 'DO',
        submittedBy: 'John Doe',
        description: 'Reduce defect rate by 20%',
        proposedSolution: 'Implement SPC',
        expectedBenefits: 'Lower scrap costs',
      },
      {
        id: 'imp-2',
        referenceNumber: 'QMS-CI-2026-002',
        title: 'Automate inspection',
        category: 'PROCESS_IMPROVEMENT',
        source: 'EMPLOYEE_SUGGESTION',
        status: 'IDEA_SUBMITTED',
        pdcaStage: 'PLAN',
        submittedBy: 'Jane Smith',
        description: 'Automate visual inspection step',
        proposedSolution: 'Install cameras',
        expectedBenefits: 'Faster throughput',
      },
    ];

    it('should return list of improvements with pagination', async () => {
      (mockPrisma.qualImprovement.findMany as jest.Mock).mockResolvedValueOnce(mockImprovements);
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/improvements')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.totalPages).toBe(1);
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.qualImprovement.findMany as jest.Mock).mockResolvedValueOnce([
        mockImprovements[0],
      ]);
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/improvements?page=3&limit=5')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(3);
      expect(response.body.data.limit).toBe(5);
      expect(response.body.data.totalPages).toBe(20);
    });

    it('should filter by category', async () => {
      (mockPrisma.qualImprovement.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/improvements?category=QUALITY_IMPROVEMENT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualImprovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'QUALITY_IMPROVEMENT',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.qualImprovement.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/improvements?status=IN_PROGRESS')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualImprovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'IN_PROGRESS',
          }),
        })
      );
    });

    it('should filter by pdcaStage', async () => {
      (mockPrisma.qualImprovement.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/improvements?pdcaStage=DO').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualImprovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            pdcaStage: 'DO',
          }),
        })
      );
    });

    it('should filter by source', async () => {
      (mockPrisma.qualImprovement.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/improvements?source=AUDIT').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualImprovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            source: 'AUDIT',
          }),
        })
      );
    });

    it('should filter by search (case-insensitive title search)', async () => {
      (mockPrisma.qualImprovement.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/improvements?search=defect')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualImprovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'defect', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.qualImprovement.findMany as jest.Mock).mockResolvedValueOnce(mockImprovements);
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/improvements').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualImprovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualImprovement.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/improvements')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/improvements/:id — Get single
  // ============================================
  describe('GET /api/improvements/:id', () => {
    const mockImprovement = {
      id: '21000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-CI-2026-001',
      title: 'Reduce defect rate',
      category: 'QUALITY_IMPROVEMENT',
      source: 'DATA_ANALYSIS',
      submittedBy: 'John Doe',
      description: 'Reduce defect rate by 20%',
      proposedSolution: 'Implement SPC',
      expectedBenefits: 'Lower scrap costs',
    };

    it('should return single improvement', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockResolvedValueOnce(mockImprovement);

      const response = await request(app)
        .get('/api/improvements/21000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('21000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff improvement', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/improvements/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/improvements/21000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // POST /api/improvements — Create improvement
  // ============================================
  describe('POST /api/improvements', () => {
    const createPayload = {
      title: 'New Improvement',
      category: 'PROCESS_IMPROVEMENT',
      source: 'EMPLOYEE_SUGGESTION',
      submittedBy: 'John Doe',
      description: 'Improve cycle time',
      proposedSolution: 'Lean methodology',
      expectedBenefits: 'Faster output',
    };

    it('should create an improvement successfully', async () => {
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualImprovement.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-CI-2026-001',
        ...createPayload,
        status: 'IDEA_SUBMITTED',
        pdcaStage: 'PLAN',
        priorityScore: 0,
        qualityImpact: 'NONE',
        customerImpact: 'NONE',
        processImpact: 'NONE',
        environmentalImpact: 'NONE',
      });

      const response = await request(app)
        .post('/api/improvements')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
      expect(response.body.data.referenceNumber).toBe('QMS-CI-2026-001');
    });

    it('should auto-calculate priority score from impacts', async () => {
      const payloadWithImpacts = {
        ...createPayload,
        qualityImpact: 'HIGH',
        customerImpact: 'MEDIUM',
        processImpact: 'LOW',
      };

      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualImprovement.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...payloadWithImpacts,
        priorityScore: 6, // HIGH(3) + MEDIUM(2) + LOW(1)
      });

      await request(app)
        .post('/api/improvements')
        .set('Authorization', 'Bearer token')
        .send(payloadWithImpacts);

      expect(mockPrisma.qualImprovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          priorityScore: 6,
        }),
      });
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/improvements')
        .set('Authorization', 'Bearer token')
        .send({
          category: 'PROCESS_IMPROVEMENT',
          source: 'AUDIT',
          submittedBy: 'Test',
          description: 'Desc',
          proposedSolution: 'Solution',
          expectedBenefits: 'Benefits',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing description', async () => {
      const response = await request(app)
        .post('/api/improvements')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          category: 'PROCESS_IMPROVEMENT',
          source: 'AUDIT',
          submittedBy: 'Test',
          proposedSolution: 'Solution',
          expectedBenefits: 'Benefits',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/improvements')
        .set('Authorization', 'Bearer token')
        .send({
          ...createPayload,
          category: 'INVALID_CATEGORY',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid source', async () => {
      const response = await request(app)
        .post('/api/improvements')
        .set('Authorization', 'Bearer token')
        .send({
          ...createPayload,
          source: 'INVALID_SOURCE',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualImprovement.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualImprovement.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/improvements')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // PUT /api/improvements/:id — Update improvement
  // ============================================
  describe('PUT /api/improvements/:id', () => {
    const existingImprovement = {
      id: '21000000-0000-4000-a000-000000000001',
      title: 'Existing Improvement',
      qualityImpact: 'MEDIUM',
      customerImpact: 'LOW',
      processImpact: 'NONE',
      priorityScore: 3,
    };

    it('should update improvement successfully', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockResolvedValueOnce(
        existingImprovement
      );
      (mockPrisma.qualImprovement.update as jest.Mock).mockResolvedValueOnce({
        ...existingImprovement,
        title: 'Updated Improvement',
      });

      const response = await request(app)
        .put('/api/improvements/21000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Improvement' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Improvement');
    });

    it('should recalculate priority score when impacts change', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockResolvedValueOnce(
        existingImprovement
      );
      (mockPrisma.qualImprovement.update as jest.Mock).mockResolvedValueOnce({
        ...existingImprovement,
        qualityImpact: 'HIGH',
        priorityScore: 4, // HIGH(3) + LOW(1) + NONE(0)
      });

      await request(app)
        .put('/api/improvements/21000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ qualityImpact: 'HIGH' });

      expect(mockPrisma.qualImprovement.update).toHaveBeenCalledWith({
        where: { id: '21000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          priorityScore: 4,
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff improvement', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/improvements/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockResolvedValueOnce(
        existingImprovement
      );

      const response = await request(app)
        .put('/api/improvements/21000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/improvements/21000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // DELETE /api/improvements/:id — Delete improvement
  // ============================================
  describe('DELETE /api/improvements/:id', () => {
    it('should delete improvement successfully', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '21000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.qualImprovement.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/improvements/21000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualImprovement.update).toHaveBeenCalledWith({
        where: { id: '21000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff improvement', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/improvements/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualImprovement.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/improvements/21000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
