import express from 'express';
import request from 'supertest';

// Mock prisma - must use ../src/prisma (NOT @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    aIAnalysis: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    }
    req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN' };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (req: any, res: any, next: any) => next(),
  metricsHandler: (req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (req: any, res: any, next: any) => next(),
  createHealthCheck: () => (req: any, res: any) => res.json({ status: 'healthy' }),
}));

import { prisma } from '../src/prisma';
import analysesRouter from '../src/routes/analyses';

const mockPrisma = prisma as any;

describe('Analyses CRUD API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyses', analysesRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = { id: 'user-1', firstName: 'Admin', lastName: 'User' };

  const mockAnalysis = {
    id: 'analysis-1',
    userId: 'user-1',
    sourceType: 'risk',
    sourceId: 'source-1',
    sourceData: { title: 'Fall from height' },
    prompt: 'Analyse this risk',
    provider: 'OPENAI',
    model: 'gpt-4',
    response: { content: 'Analysis result' },
    suggestedRootCause: 'Inadequate protection',
    suggestedActions: [
      { title: 'Install guardrails', description: 'Install guardrails', priority: 'HIGH', type: 'CORRECTIVE' },
      { title: 'Provide training', description: 'Training on heights', priority: 'MEDIUM', type: 'PREVENTIVE' },
    ],
    complianceGaps: [{ clause: '6.1.2', gap: 'Risk assessment gap' }],
    highlights: [],
    status: 'COMPLETED',
    acceptedAt: null,
    rejectedAt: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    user: mockUser,
  };

  const mockAnalysis2 = {
    ...mockAnalysis,
    id: 'analysis-2',
    sourceType: 'incident',
    sourceId: 'source-2',
    sourceData: { title: 'Chemical spill' },
    createdAt: new Date('2024-01-14'),
  };

  // =========================================================
  // GET /api/analyses - List analyses
  // =========================================================
  describe('GET /api/analyses', () => {
    it('returns 401 without auth', async () => {
      const response = await request(app).get('/api/analyses');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns paginated list of analyses', async () => {
      mockPrisma.aIAnalysis.findMany.mockResolvedValueOnce([mockAnalysis, mockAnalysis2]);
      mockPrisma.aIAnalysis.count.mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/analyses')
        .set('Authorization', 'Bearer test-token');

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

    it('respects page and limit query params', async () => {
      mockPrisma.aIAnalysis.findMany.mockResolvedValueOnce([mockAnalysis]);
      mockPrisma.aIAnalysis.count.mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/analyses?page=3&limit=10')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.meta).toMatchObject({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
      });

      expect(mockPrisma.aIAnalysis.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('supports sourceType filter', async () => {
      mockPrisma.aIAnalysis.findMany.mockResolvedValueOnce([mockAnalysis]);
      mockPrisma.aIAnalysis.count.mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/analyses?sourceType=risk')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);

      expect(mockPrisma.aIAnalysis.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sourceType: 'risk',
          }),
        })
      );
    });

    it('supports status filter', async () => {
      mockPrisma.aIAnalysis.findMany.mockResolvedValueOnce([]);
      mockPrisma.aIAnalysis.count.mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/analyses?status=ACCEPTED')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);

      expect(mockPrisma.aIAnalysis.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACCEPTED',
          }),
        })
      );
    });

    it('returns 500 on database error', async () => {
      mockPrisma.aIAnalysis.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/analyses')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================
  // GET /api/analyses/:id - Get single analysis
  // =========================================================
  describe('GET /api/analyses/:id', () => {
    it('returns 404 for non-existent analysis', async () => {
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/analyses/non-existent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Analysis not found');
    });

    it('returns analysis with user and actions includes', async () => {
      const analysisWithActions = {
        ...mockAnalysis,
        actions: [{ id: 'action-1', title: 'Install guardrails' }],
      };
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(analysisWithActions);

      const response = await request(app)
        .get('/api/analyses/analysis-1')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('analysis-1');
      expect(response.body.data.actions).toHaveLength(1);

      expect(mockPrisma.aIAnalysis.findUnique).toHaveBeenCalledWith({
        where: { id: 'analysis-1' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          actions: true,
        },
      });
    });

    it('returns 500 on database error', async () => {
      mockPrisma.aIAnalysis.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/analyses/analysis-1')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================
  // POST /api/analyses/:id/accept - Accept analysis
  // =========================================================
  describe('POST /api/analyses/:id/accept', () => {
    it('returns 404 for non-existent analysis', async () => {
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/analyses/non-existent/accept')
        .set('Authorization', 'Bearer test-token')
        .send({ acceptedActions: [0, 1] });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('sets ACCEPTED status when all actions accepted', async () => {
      // suggestedActions has 2 items, acceptedActions has 2 indices -> full accept
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(mockAnalysis);
      mockPrisma.aIAnalysis.update.mockResolvedValueOnce({
        ...mockAnalysis,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/analyses/analysis-1/accept')
        .set('Authorization', 'Bearer test-token')
        .send({ acceptedActions: [0, 1] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ACCEPTED');

      expect(mockPrisma.aIAnalysis.update).toHaveBeenCalledWith({
        where: { id: 'analysis-1' },
        data: expect.objectContaining({
          status: 'ACCEPTED',
          acceptedAt: expect.any(Date),
        }),
      });
    });

    it('sets PARTIALLY_ACCEPTED when fewer actions accepted', async () => {
      // suggestedActions has 2 items, acceptedActions has 1 index -> partial
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(mockAnalysis);
      mockPrisma.aIAnalysis.update.mockResolvedValueOnce({
        ...mockAnalysis,
        status: 'PARTIALLY_ACCEPTED',
        acceptedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/analyses/analysis-1/accept')
        .set('Authorization', 'Bearer test-token')
        .send({ acceptedActions: [0] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('PARTIALLY_ACCEPTED');

      expect(mockPrisma.aIAnalysis.update).toHaveBeenCalledWith({
        where: { id: 'analysis-1' },
        data: expect.objectContaining({
          status: 'PARTIALLY_ACCEPTED',
          acceptedAt: expect.any(Date),
        }),
      });
    });

    it('handles accept with empty body', async () => {
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(mockAnalysis);
      mockPrisma.aIAnalysis.update.mockResolvedValueOnce({
        ...mockAnalysis,
        status: 'PARTIALLY_ACCEPTED',
        acceptedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/analyses/analysis-1/accept')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('returns 500 on database error', async () => {
      mockPrisma.aIAnalysis.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/analyses/analysis-1/accept')
        .set('Authorization', 'Bearer test-token')
        .send({ acceptedActions: [0] });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================
  // POST /api/analyses/:id/reject - Reject analysis
  // =========================================================
  describe('POST /api/analyses/:id/reject', () => {
    it('returns 404 for non-existent analysis', async () => {
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/analyses/non-existent/reject')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('sets REJECTED status and rejectedAt timestamp', async () => {
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(mockAnalysis);
      mockPrisma.aIAnalysis.update.mockResolvedValueOnce({
        ...mockAnalysis,
        status: 'REJECTED',
        rejectedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/analyses/analysis-1/reject')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REJECTED');

      expect(mockPrisma.aIAnalysis.update).toHaveBeenCalledWith({
        where: { id: 'analysis-1' },
        data: {
          status: 'REJECTED',
          rejectedAt: expect.any(Date),
        },
      });
    });

    it('returns 500 on database error', async () => {
      mockPrisma.aIAnalysis.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/analyses/analysis-1/reject')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================
  // DELETE /api/analyses/:id - Delete analysis
  // =========================================================
  describe('DELETE /api/analyses/:id', () => {
    it('deletes analysis successfully', async () => {
      mockPrisma.aIAnalysis.delete.mockResolvedValueOnce(mockAnalysis);

      const response = await request(app)
        .delete('/api/analyses/analysis-1')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(204);

      expect(mockPrisma.aIAnalysis.delete).toHaveBeenCalledWith({
        where: { id: 'analysis-1' },
      });
    });

    it('returns 500 on database error', async () => {
      mockPrisma.aIAnalysis.delete.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/analyses/analysis-1')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to delete analysis');
    });
  });
});
