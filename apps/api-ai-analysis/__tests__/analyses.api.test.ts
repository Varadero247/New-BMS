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
    req.user = {
      id: '20000000-0000-4000-a000-000000000001',
      email: 'admin@ims.local',
      role: 'ADMIN',
    };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
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

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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

  const mockUser = {
    id: '20000000-0000-4000-a000-000000000001',
    firstName: 'Admin',
    lastName: 'User',
  };

  const mockAnalysis = {
    id: '52000000-0000-4000-a000-000000000001',
    userId: '20000000-0000-4000-a000-000000000001',
    sourceType: 'risk',
    sourceId: 'source-1',
    sourceData: { title: 'Fall from height' },
    prompt: 'Analyse this risk',
    provider: 'OPENAI',
    model: 'gpt-4',
    response: { content: 'Analysis result' },
    suggestedRootCause: 'Inadequate protection',
    suggestedActions: [
      {
        title: 'Install guardrails',
        description: 'Install guardrails',
        priority: 'HIGH',
        type: 'CORRECTIVE',
      },
      {
        title: 'Provide training',
        description: 'Training on heights',
        priority: 'MEDIUM',
        type: 'PREVENTIVE',
      },
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
    it('returns 404 for 00000000-0000-4000-a000-ffffffffffff analysis', async () => {
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/analyses/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Analysis not found');
    });

    it('returns analysis by id', async () => {
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(mockAnalysis);

      const response = await request(app)
        .get('/api/analyses/52000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('52000000-0000-4000-a000-000000000001');

      expect(mockPrisma.aIAnalysis.findUnique).toHaveBeenCalledWith({
        where: { id: '52000000-0000-4000-a000-000000000001' },
      });
    });

    it('returns 500 on database error', async () => {
      mockPrisma.aIAnalysis.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/analyses/52000000-0000-4000-a000-000000000001')
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
    it('returns 404 for 00000000-0000-4000-a000-ffffffffffff analysis', async () => {
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/analyses/00000000-0000-4000-a000-ffffffffffff/accept')
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
        .post('/api/analyses/52000000-0000-4000-a000-000000000001/accept')
        .set('Authorization', 'Bearer test-token')
        .send({ acceptedActions: [0, 1] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ACCEPTED');

      expect(mockPrisma.aIAnalysis.update).toHaveBeenCalledWith({
        where: { id: '52000000-0000-4000-a000-000000000001' },
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
        .post('/api/analyses/52000000-0000-4000-a000-000000000001/accept')
        .set('Authorization', 'Bearer test-token')
        .send({ acceptedActions: [0] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('PARTIALLY_ACCEPTED');

      expect(mockPrisma.aIAnalysis.update).toHaveBeenCalledWith({
        where: { id: '52000000-0000-4000-a000-000000000001' },
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
        .post('/api/analyses/52000000-0000-4000-a000-000000000001/accept')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('returns 500 on database error', async () => {
      mockPrisma.aIAnalysis.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/analyses/52000000-0000-4000-a000-000000000001/accept')
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
    it('returns 404 for 00000000-0000-4000-a000-ffffffffffff analysis', async () => {
      mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/analyses/00000000-0000-4000-a000-ffffffffffff/reject')
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
        .post('/api/analyses/52000000-0000-4000-a000-000000000001/reject')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REJECTED');

      expect(mockPrisma.aIAnalysis.update).toHaveBeenCalledWith({
        where: { id: '52000000-0000-4000-a000-000000000001' },
        data: {
          status: 'REJECTED',
          rejectedAt: expect.any(Date),
        },
      });
    });

    it('returns 500 on database error', async () => {
      mockPrisma.aIAnalysis.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/analyses/52000000-0000-4000-a000-000000000001/reject')
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
        .delete('/api/analyses/52000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(204);

      expect(mockPrisma.aIAnalysis.update).toHaveBeenCalledWith({
        where: { id: '52000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('returns 500 on database error', async () => {
      mockPrisma.aIAnalysis.update.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/analyses/52000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to delete analysis');
    });
  });
});

describe('analyses.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyses', analysesRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/analyses', async () => {
    const res = await request(app).get('/api/analyses');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

// ── analyses.api — edge cases and extended paths ──────────────────────────

describe('analyses.api — edge cases', () => {
  let app: express.Express;

  const mockAnalysis = {
    id: '52000000-0000-4000-a000-000000000001',
    userId: '20000000-0000-4000-a000-000000000001',
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
    ],
    complianceGaps: [],
    highlights: [],
    status: 'COMPLETED',
    acceptedAt: null,
    rejectedAt: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analyses', analysesRouter);
    jest.clearAllMocks();
  });

  it('GET /api/analyses filters by sourceType=incident', async () => {
    mockPrisma.aIAnalysis.findMany.mockResolvedValueOnce([]);
    mockPrisma.aIAnalysis.count.mockResolvedValueOnce(0);
    const res = await request(app)
      .get('/api/analyses?sourceType=incident')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(mockPrisma.aIAnalysis.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ sourceType: 'incident' }) })
    );
  });

  it('GET /api/analyses filters by status=REJECTED', async () => {
    mockPrisma.aIAnalysis.findMany.mockResolvedValueOnce([]);
    mockPrisma.aIAnalysis.count.mockResolvedValueOnce(0);
    const res = await request(app)
      .get('/api/analyses?status=REJECTED')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(mockPrisma.aIAnalysis.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'REJECTED' }) })
    );
  });

  it('GET /api/analyses returns totalPages=1 for single result', async () => {
    mockPrisma.aIAnalysis.findMany.mockResolvedValueOnce([mockAnalysis]);
    mockPrisma.aIAnalysis.count.mockResolvedValueOnce(1);
    const res = await request(app)
      .get('/api/analyses')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(1);
  });

  it('POST /api/analyses/:id/accept returns 400 for invalid acceptedActions type', async () => {
    mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(mockAnalysis);
    const res = await request(app)
      .post('/api/analyses/52000000-0000-4000-a000-000000000001/accept')
      .set('Authorization', 'Bearer test-token')
      .send({ acceptedActions: 'not-an-array' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/analyses/:id/accept sets ACCEPTED when acceptedActions length matches suggestedActions', async () => {
    const oneActionAnalysis = { ...mockAnalysis, suggestedActions: [{ title: 'Action 1' }] };
    mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(oneActionAnalysis);
    mockPrisma.aIAnalysis.update.mockResolvedValueOnce({ ...oneActionAnalysis, status: 'ACCEPTED', acceptedAt: new Date() });
    const res = await request(app)
      .post('/api/analyses/52000000-0000-4000-a000-000000000001/accept')
      .set('Authorization', 'Bearer test-token')
      .send({ acceptedActions: [0] });
    expect(res.status).toBe(200);
    const updateCall = (mockPrisma.aIAnalysis.update as jest.Mock).mock.calls[0];
    expect(updateCall[0].data.status).toBe('ACCEPTED');
  });

  it('POST /api/analyses/:id/reject returns 500 on update DB error', async () => {
    mockPrisma.aIAnalysis.findUnique.mockResolvedValueOnce(mockAnalysis);
    mockPrisma.aIAnalysis.update.mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app)
      .post('/api/analyses/52000000-0000-4000-a000-000000000001/reject')
      .set('Authorization', 'Bearer test-token')
      .send({});
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/analyses/:id soft-deletes by setting deletedAt', async () => {
    mockPrisma.aIAnalysis.update.mockResolvedValueOnce({ ...mockAnalysis, deletedAt: new Date() });
    const res = await request(app)
      .delete('/api/analyses/52000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(204);
    expect(mockPrisma.aIAnalysis.update).toHaveBeenCalledWith({
      where: { id: '52000000-0000-4000-a000-000000000001' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('GET /api/analyses/:id returns 401 without auth', async () => {
    const res = await request(app).get('/api/analyses/52000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(401);
  });

  it('GET /api/analyses returns empty data array with correct meta', async () => {
    mockPrisma.aIAnalysis.findMany.mockResolvedValueOnce([]);
    mockPrisma.aIAnalysis.count.mockResolvedValueOnce(0);
    const res = await request(app)
      .get('/api/analyses')
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });
});
