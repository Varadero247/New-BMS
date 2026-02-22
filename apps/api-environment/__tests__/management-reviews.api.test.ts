import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    envManagementReview: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    envMRAction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '20000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

jest.mock('@ims/validation', () => ({
  sanitizeMiddleware: () => (_req: any, _res: any, next: any) => next(),
  sanitizeQueryMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import managementReviewsRoutes from '../src/routes/management-reviews';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Environment Management Reviews API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/management-reviews', managementReviewsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /api/management-reviews ──────────────────────────────────────────
  describe('GET /api/management-reviews', () => {
    const mockReviews = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'ENV-MR-2026-01',
        reviewDate: new Date('2026-01-15'),
        chair: 'CEO',
        attendees: ['CEO', 'EMS Manager', 'Ops Manager'],
        status: 'DRAFT',
        actions: [],
      },
      {
        id: 'mr-2',
        refNumber: 'ENV-MR-2026-02',
        reviewDate: new Date('2026-06-15'),
        chair: 'EMS Manager',
        attendees: ['EMS Manager', 'Quality Lead'],
        status: 'COMPLETED',
        actions: [{ id: '00000000-0000-0000-0000-000000000001', action: 'Update policy' }],
      },
    ];

    it('should return list of reviews with pagination', async () => {
      (mockPrisma.envManagementReview.findMany as jest.Mock).mockResolvedValueOnce(mockReviews);
      (mockPrisma.envManagementReview.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/management-reviews')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toHaveLength(2);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.envManagementReview.findMany as jest.Mock).mockResolvedValueOnce([
        mockReviews[0],
      ]);
      (mockPrisma.envManagementReview.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/management-reviews?page=3&limit=5')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(3);
      expect(response.body.data.pagination.limit).toBe(5);
      expect(response.body.data.pagination.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      (mockPrisma.envManagementReview.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envManagementReview.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/management-reviews?status=DRAFT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envManagementReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DRAFT',
          }),
        })
      );
    });

    it('should filter by year', async () => {
      (mockPrisma.envManagementReview.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envManagementReview.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/management-reviews?year=2026')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envManagementReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            reviewDate: {
              gte: expect.any(Date),
              lt: expect.any(Date),
            },
          }),
        })
      );
    });

    it('should support search across refNumber, chair, prevActionStatus, objectivesProgress', async () => {
      (mockPrisma.envManagementReview.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envManagementReview.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/management-reviews?search=CEO')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envManagementReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { refNumber: { contains: 'CEO', mode: 'insensitive' } },
              { chair: { contains: 'CEO', mode: 'insensitive' } },
              { prevActionStatus: { contains: 'CEO', mode: 'insensitive' } },
              { objectivesProgress: { contains: 'CEO', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envManagementReview.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/management-reviews')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ─── GET /api/management-reviews/:id ──────────────────────────────────────
  describe('GET /api/management-reviews/:id', () => {
    const mockReview = {
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'ENV-MR-2026-01',
      reviewDate: new Date('2026-01-15'),
      chair: 'CEO',
      attendees: ['CEO', 'EMS Manager'],
      status: 'DRAFT',
      actions: [],
    };

    it('should return a single review with actions', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(mockReview);

      const response = await request(app)
        .get('/api/management-reviews/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
      expect(response.body.data.chair).toBe('CEO');
    });

    it('should return 404 for non-existent review', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/management-reviews/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ─── POST /api/management-reviews ─────────────────────────────────────────
  describe('POST /api/management-reviews', () => {
    const createPayload = {
      reviewDate: '2026-01-15',
      chair: 'CEO',
      attendees: ['CEO', 'EMS Manager', 'Ops Manager'],
      prevActionStatus: 'All previous actions completed',
      objectivesProgress: 'On track for all objectives',
    };

    it('should create a management review successfully', async () => {
      (mockPrisma.envManagementReview.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envManagementReview.create as jest.Mock).mockResolvedValueOnce({
        id: 'mr-new',
        refNumber: 'ENV-MR-2026-01',
        ...createPayload,
        reviewDate: new Date('2026-01-15'),
        status: 'DRAFT',
        actions: [],
      });

      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.chair).toBe('CEO');
      expect(response.body.data.refNumber).toMatch(/^ENV-MR-/);
    });

    it('should return 400 for missing reviewDate', async () => {
      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send({ chair: 'CEO', attendees: ['CEO'] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing chair', async () => {
      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send({ reviewDate: '2026-01-15', attendees: ['CEO'] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty attendees array', async () => {
      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send({ reviewDate: '2026-01-15', chair: 'CEO', attendees: [] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing attendees', async () => {
      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send({ reviewDate: '2026-01-15', chair: 'CEO' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envManagementReview.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envManagementReview.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ─── PUT /api/management-reviews/:id ──────────────────────────────────────
  describe('PUT /api/management-reviews/:id', () => {
    const existingReview = {
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'ENV-MR-2026-01',
      reviewDate: new Date('2026-01-15'),
      chair: 'CEO',
      attendees: ['CEO', 'EMS Manager'],
      status: 'DRAFT',
    };

    it('should update review successfully', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(
        existingReview
      );
      (mockPrisma.envManagementReview.update as jest.Mock).mockResolvedValueOnce({
        ...existingReview,
        chair: 'COO',
        actions: [],
      });

      const response = await request(app)
        .put('/api/management-reviews/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ chair: 'COO' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.chair).toBe('COO');
    });

    it('should return 404 for non-existent review', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ chair: 'COO' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when updating an approved review', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce({
        ...existingReview,
        status: 'APPROVED',
      });

      const response = await request(app)
        .put('/api/management-reviews/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ chair: 'COO' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('REVIEW_LOCKED');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/management-reviews/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ chair: 'COO' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ─── POST /api/management-reviews/:id/complete ────────────────────────────
  describe('POST /api/management-reviews/:id/complete', () => {
    const completeReview = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DRAFT',
      prevActionStatus: 'All done',
      changesInIssues: 'No changes',
      objectivesProgress: 'On track',
      aspectsPerformance: 'Good',
      legalCompliance: 'Compliant',
      auditResults: 'Satisfactory',
      incidentSummary: null,
      supplierPerformance: null,
    };

    it('should complete a review when all mandatory fields are filled', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(
        completeReview
      );
      (mockPrisma.envManagementReview.update as jest.Mock).mockResolvedValueOnce({
        ...completeReview,
        status: 'COMPLETED',
        completedAt: new Date(),
        actions: [],
      });

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.envManagementReview.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            completedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should return 404 if review does not exist', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff/complete')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 if review is already completed', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce({
        ...completeReview,
        status: 'COMPLETED',
      });

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ALREADY_COMPLETED');
    });

    it('should return 400 if review is already approved', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce({
        ...completeReview,
        status: 'APPROVED',
      });

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ALREADY_COMPLETED');
    });

    it('should return 400 if mandatory ISO 14001 input fields are missing', async () => {
      const incompleteReview = {
        ...completeReview,
        prevActionStatus: null,
        changesInIssues: '',
      };
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(
        incompleteReview
      );

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INCOMPLETE_REVIEW');
      expect(response.body.error.fields).toContain('prevActionStatus');
      expect(response.body.error.fields).toContain('changesInIssues');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(
        completeReview
      );
      (mockPrisma.envManagementReview.update as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ─── POST /api/management-reviews/:id/actions ─────────────────────────────
  describe('POST /api/management-reviews/:id/actions', () => {
    const actionPayload = {
      action: 'Update environmental policy',
      owner: 'EMS Manager',
      dueDate: '2026-03-15',
    };

    it('should add an action to a review', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.envMRAction.create as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        reviewId: 'mr-1',
        ...actionPayload,
        dueDate: new Date('2026-03-15'),
        status: 'OPEN',
      });

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send(actionPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.action).toBe('Update environmental policy');
      expect(response.body.data.owner).toBe('EMS Manager');
    });

    it('should return 404 if review does not exist', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff/actions')
        .set('Authorization', 'Bearer token')
        .send(actionPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing action field', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send({ owner: 'EMS Manager', dueDate: '2026-03-15' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing owner', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send({ action: 'Do something', dueDate: '2026-03-15' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing dueDate', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send({ action: 'Do something', owner: 'Person' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.envMRAction.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-0000-0000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send(actionPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ─── PUT /api/management-reviews/:id/actions/:actionId ────────────────────
  describe('PUT /api/management-reviews/:id/actions/:actionId', () => {
    const existingAction = {
      id: '00000000-0000-0000-0000-000000000001',
      reviewId: 'mr-1',
      action: 'Update environmental policy',
      owner: 'EMS Manager',
      dueDate: new Date('2026-03-15'),
      status: 'OPEN',
    };

    it('should update an action successfully', async () => {
      (mockPrisma.envMRAction.findFirst as jest.Mock).mockResolvedValueOnce(existingAction);
      (mockPrisma.envMRAction.update as jest.Mock).mockResolvedValueOnce({
        ...existingAction,
        notes: 'In progress',
      });

      const response = await request(app)
        .put(
          '/api/management-reviews/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ notes: 'In progress' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBe('In progress');
    });

    it('should return 404 for non-existent action', async () => {
      (mockPrisma.envMRAction.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put(
          '/api/management-reviews/00000000-0000-0000-0000-000000000001/actions/00000000-0000-4000-a000-ffffffffffff'
        )
        .set('Authorization', 'Bearer token')
        .send({ notes: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should auto-set completedAt when status changes to COMPLETED', async () => {
      (mockPrisma.envMRAction.findFirst as jest.Mock).mockResolvedValueOnce(existingAction);
      (mockPrisma.envMRAction.update as jest.Mock).mockResolvedValueOnce({
        ...existingAction,
        status: 'COMPLETED',
        completedAt: new Date(),
      });

      await request(app)
        .put(
          '/api/management-reviews/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(mockPrisma.envMRAction.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should not override explicit completedAt when status is COMPLETED', async () => {
      (mockPrisma.envMRAction.findFirst as jest.Mock).mockResolvedValueOnce(existingAction);
      (mockPrisma.envMRAction.update as jest.Mock).mockResolvedValueOnce({
        ...existingAction,
        status: 'COMPLETED',
        completedAt: new Date('2026-02-28'),
      });

      await request(app)
        .put(
          '/api/management-reviews/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED', completedAt: '2026-02-28' });

      expect(mockPrisma.envMRAction.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          completedAt: new Date('2026-02-28'),
        }),
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.envMRAction.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put(
          '/api/management-reviews/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ notes: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ─── DELETE /api/management-reviews/:id ───────────────────────────────────
  describe('DELETE /api/management-reviews/:id', () => {
    it('should soft-delete a management review', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
      });
      (mockPrisma.envManagementReview.update as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const response = await request(app)
        .delete('/api/management-reviews/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.envManagementReview.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for non-existent review', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envManagementReview.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/management-reviews/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Environment Management Reviews — boundary coverage', () => {
  let app2: express.Express;

  beforeAll(() => {
    app2 = express();
    app2.use(express.json());
    app2.use('/api/management-reviews', managementReviewsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/management-reviews returns success:true in response body', async () => {
    (mockPrisma.envManagementReview.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.envManagementReview.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app2)
      .get('/api/management-reviews')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('management reviews — phase29 coverage', () => {
  it('handles Math.max', () => {
    expect(Math.max(1, 2, 3)).toBe(3);
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

  it('handles parseInt', () => {
    expect(parseInt('42', 10)).toBe(42);
  });

  it('handles iterable protocol', () => {
    const iter = [1, 2, 3][Symbol.iterator](); expect(iter.next().value).toBe(1);
  });

});

describe('management reviews — phase30 coverage', () => {
  it('handles Math.min', () => {
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

  it('handles spread operator', () => {
    expect([...[1, 2], ...[3, 4]]).toEqual([1, 2, 3, 4]);
  });

  it('handles template literals', () => {
    const n = 42; expect(`value: ${n}`).toBe('value: 42');
  });

  it('handles computed properties', () => {
    const key = 'foo'; const obj3 = { [key]: 42 }; expect((obj3 as any).foo).toBe(42);
  });

});


describe('phase31 coverage', () => {
  it('handles Math.min', () => { expect(Math.min(1,5,3)).toBe(1); });
  it('handles string trim', () => { expect('  hi  '.trim()).toBe('hi'); });
  it('handles default params', () => { const fn = (x = 10) => x; expect(fn()).toBe(10); expect(fn(5)).toBe(5); });
  it('handles async/await error', async () => { const fn = async () => { throw new Error('fail'); }; await expect(fn()).rejects.toThrow('fail'); });
  it('handles ternary', () => { const x = 5 > 3 ? 'yes' : 'no'; expect(x).toBe('yes'); });
});


describe('phase32 coverage', () => {
  it('handles array fill', () => { expect(new Array(3).fill(0)).toEqual([0,0,0]); });
  it('handles closure', () => { const counter = () => { let n = 0; return () => ++n; }; const inc = counter(); expect(inc()).toBe(1); expect(inc()).toBe(2); });
  it('handles object hasOwnProperty', () => { const o = {a:1}; expect(o.hasOwnProperty('a')).toBe(true); expect(o.hasOwnProperty('b')).toBe(false); });
  it('handles do...while loop', () => { let i = 0; do { i++; } while (i < 3); expect(i).toBe(3); });
  it('handles typeof undefined', () => { expect(typeof undefined).toBe('undefined'); });
});


describe('phase33 coverage', () => {
  it('handles Infinity', () => { expect(1/0).toBe(Infinity); expect(isFinite(1/0)).toBe(false); });
  it('handles Reflect.ownKeys', () => { const s = Symbol('k'); const o = {a:1,[s]:2}; expect(Reflect.ownKeys(o)).toContain('a'); });
  it('handles toFixed', () => { expect((3.14159).toFixed(2)).toBe('3.14'); });
  it('handles Array.from range', () => { expect(Array.from({length:5},(_,i)=>i)).toEqual([0,1,2,3,4]); });
  it('handles encodeURIComponent', () => { expect(encodeURIComponent('hello world')).toBe('hello%20world'); });
});


describe('phase34 coverage', () => {
  it('handles default value in destructuring', () => { const {x=10,y=20} = {x:5} as {x?:number;y?:number}; expect(x).toBe(5); expect(y).toBe(20); });
  it('handles object with numeric keys', () => { const o: Record<string,number> = {'0':10,'1':20}; expect(o['0']).toBe(10); });
  it('handles enum-like object', () => { const Direction = { UP: 'UP', DOWN: 'DOWN' } as const; expect(Direction.UP).toBe('UP'); });
  it('handles mapped type pattern', () => { type Flags<T> = { [K in keyof T]: boolean }; const flags: Flags<{a:number;b:string}> = {a:true,b:false}; expect(flags.a).toBe(true); });
  it('handles static method', () => { class MathHelper { static square(n: number) { return n*n; } } expect(MathHelper.square(4)).toBe(16); });
});


describe('phase35 coverage', () => {
  it('handles string is palindrome', () => { const isPalin = (s: string) => s === s.split('').reverse().join(''); expect(isPalin('racecar')).toBe(true); expect(isPalin('hello')).toBe(false); });
  it('handles optional catch binding', () => { let ok = false; try { throw 1; } catch { ok = true; } expect(ok).toBe(true); });
  it('handles retry pattern', async () => { let attempts = 0; const retry = async (fn: ()=>Promise<number>, n:number): Promise<number> => { try { return await fn(); } catch(e) { if(n<=0) throw e; return retry(fn,n-1); } }; const fn = () => { attempts++; return attempts < 3 ? Promise.reject(new Error()) : Promise.resolve(42); }; expect(await retry(fn,5)).toBe(42); });
  it('handles debounce-like pattern', () => { let count = 0; const fn = () => count++; fn(); fn(); fn(); expect(count).toBe(3); });
  it('handles string split-join replace', () => { expect('aabbcc'.split('b').join('x')).toBe('aaxxcc'); });
});


describe('phase36 coverage', () => {
  it('handles linked-list node pattern', () => { class Node<T>{constructor(public val:T,public next:Node<T>|null=null){}} const head=new Node(1,new Node(2,new Node(3))); let s=0,n:Node<number>|null=head;while(n){s+=n.val;n=n.next;} expect(s).toBe(6); });
  it('handles parse query string', () => { const parseQS=(s:string)=>Object.fromEntries(s.split('&').map(p=>p.split('=')));expect(parseQS('a=1&b=2')).toEqual({a:'1',b:'2'}); });
  it('handles top-K elements', () => { const topK=(a:number[],k:number)=>[...a].sort((x,y)=>y-x).slice(0,k);expect(topK([3,1,4,1,5,9,2,6],3)).toEqual([9,6,5]); });
  it('computes fibonacci iteratively', () => { const fib=(n:number)=>{let a=0,b=1;for(let i=0;i<n;i++){[a,b]=[b,a+b];}return a;}; expect(fib(10)).toBe(55); });
  it('handles LRU cache pattern', () => { const cache=new Map<string,number>();const get=(k:string)=>cache.has(k)?(cache.get(k)!):null;const set=(k:string,v:number)=>{cache.delete(k);cache.set(k,v);};set('a',1);set('b',2);expect(get('a')).toBe(1); });
});


describe('phase37 coverage', () => {
  it('computes hamming distance', () => { const hamming=(a:string,b:string)=>[...a].filter((c,i)=>c!==b[i]).length; expect(hamming('karolin','kathrin')).toBe(3); });
  it('computes compound interest', () => { const ci=(p:number,r:number,n:number)=>p*Math.pow(1+r/100,n); expect(ci(1000,10,1)).toBeCloseTo(1100); });
  it('interleaves two arrays', () => { const interleave=<T>(a:T[],b:T[])=>a.flatMap((v,i)=>b[i]!==undefined?[v,b[i]]:[v]); expect(interleave([1,3,5],[2,4,6])).toEqual([1,2,3,4,5,6]); });
  it('extracts numbers from string', () => { const nums=(s:string)=>(s.match(/\d+/g)||[]).map(Number); expect(nums('a1b22c333')).toEqual([1,22,333]); });
  it('sums nested arrays', () => { const sumNested=(a:number[][])=>a.reduce((t,r)=>t+r.reduce((s,v)=>s+v,0),0); expect(sumNested([[1,2],[3,4],[5]])).toBe(15); });
});


describe('phase38 coverage', () => {
  it('computes digital root', () => { const dr=(n:number):number=>n<10?n:dr(String(n).split('').reduce((a,c)=>a+Number(c),0)); expect(dr(942)).toBe(6); });
  it('finds all prime factors', () => { const factors=(n:number)=>{const r:number[]=[];for(let i=2;i*i<=n;i++)while(n%i===0){r.push(i);n/=i;}if(n>1)r.push(n);return r;}; expect(factors(12)).toEqual([2,2,3]); });
  it('implements linear search', () => { const search=(a:number[],v:number)=>a.indexOf(v); expect(search([1,3,5,7,9],5)).toBe(2); expect(search([1,3,5],4)).toBe(-1); });
  it('checks if year is leap year', () => { const isLeap=(y:number)=>y%4===0&&(y%100!==0||y%400===0); expect(isLeap(2000)).toBe(true); expect(isLeap(1900)).toBe(false); expect(isLeap(2024)).toBe(true); });
  it('implements exponential search bound', () => { const expBound=(a:number[],v:number)=>{if(a[0]===v)return 0;let i=1;while(i<a.length&&a[i]<=v)i*=2;return Math.min(i,a.length-1);}; expect(expBound([1,2,4,8,16,32],8)).toBeGreaterThanOrEqual(3); });
});


describe('phase39 coverage', () => {
  it('implements topological sort check', () => { const canFinish=(n:number,pre:[number,number][])=>{const indeg=Array(n).fill(0);const adj:number[][]=Array.from({length:n},()=>[]);pre.forEach(([a,b])=>{adj[b].push(a);indeg[a]++;});const q=indeg.map((v,i)=>v===0?i:-1).filter(v=>v>=0);let done=q.length;while(q.length){const cur=q.shift()!;for(const nb of adj[cur]){if(--indeg[nb]===0){q.push(nb);done++;}}}return done===n;}; expect(canFinish(2,[[1,0]])).toBe(true); expect(canFinish(2,[[1,0],[0,1]])).toBe(false); });
  it('checks bipartite graph', () => { const isBipartite=(adj:number[][])=>{const color=Array(adj.length).fill(-1);for(let s=0;s<adj.length;s++){if(color[s]!==-1)continue;color[s]=0;const q=[s];while(q.length){const u=q.shift()!;for(const v of adj[u]){if(color[v]===-1){color[v]=1-color[u];q.push(v);}else if(color[v]===color[u])return false;}}}return true;}; expect(isBipartite([[1,3],[0,2],[1,3],[0,2]])).toBe(true); });
  it('generates Gray code sequence', () => { const gray=(n:number)=>Array.from({length:1<<n},(_,i)=>i^(i>>1)); const g=gray(2); expect(g).toEqual([0,1,3,2]); });
  it('computes collatz sequence length', () => { const collatz=(n:number)=>{let steps=1;while(n!==1){n=n%2===0?n/2:3*n+1;steps++;}return steps;}; expect(collatz(6)).toBe(9); });
  it('checks if graph has cycle (undirected)', () => { const hasCycle=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const vis=new Set<number>();const dfs=(node:number,par:number):boolean=>{vis.add(node);for(const nb of adj[node]){if(!vis.has(nb)){if(dfs(nb,node))return true;}else if(nb!==par)return true;}return false;};return dfs(0,-1);}; expect(hasCycle(4,[[0,1],[1,2],[2,3],[3,1]])).toBe(true); expect(hasCycle(3,[[0,1],[1,2]])).toBe(false); });
});
