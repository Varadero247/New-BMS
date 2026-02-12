import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    hSManagementReview: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    hSMRAction: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  },
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
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import managementReviewsRouter from '../src/routes/management-reviews';

const mockPrisma = prisma as any;

describe('Health & Safety Management Reviews API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/management-reviews', managementReviewsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================
  // GET /api/management-reviews
  // =========================================
  describe('GET /api/management-reviews', () => {
    const mockReviews = [
      {
        id: '10000000-0000-4000-a000-000000000001',
        refNumber: 'HS-MR-2026-01',
        reviewDate: new Date('2026-01-15'),
        chair: 'Jane Smith',
        attendees: ['Alice', 'Bob'],
        status: 'DRAFT',
        actions: [],
        createdAt: new Date('2026-01-10'),
      },
      {
        id: '10000000-0000-4000-a000-000000000002',
        refNumber: 'HS-MR-2026-02',
        reviewDate: new Date('2026-02-15'),
        chair: 'John Doe',
        attendees: ['Charlie'],
        status: 'COMPLETED',
        actions: [{ id: 'act-1', action: 'Follow up', owner: 'Alice', status: 'OPEN' }],
        createdAt: new Date('2026-02-10'),
      },
    ];

    it('should return list of management reviews with pagination', async () => {
      mockPrisma.hSManagementReview.findMany.mockResolvedValueOnce(mockReviews);
      mockPrisma.hSManagementReview.count.mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/management-reviews')
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
      mockPrisma.hSManagementReview.findMany.mockResolvedValueOnce([mockReviews[0]]);
      mockPrisma.hSManagementReview.count.mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/management-reviews?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(5);
    });

    it('should filter by status', async () => {
      mockPrisma.hSManagementReview.findMany.mockResolvedValueOnce([]);
      mockPrisma.hSManagementReview.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/management-reviews?status=DRAFT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.hSManagementReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DRAFT',
          }),
        })
      );
    });

    it('should filter by year', async () => {
      mockPrisma.hSManagementReview.findMany.mockResolvedValueOnce([]);
      mockPrisma.hSManagementReview.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/management-reviews?year=2026')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.hSManagementReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            reviewDate: {
              gte: new Date('2026-01-01T00:00:00.000Z'),
              lt: new Date('2027-01-01T00:00:00.000Z'),
            },
          }),
        })
      );
    });

    it('should support search by refNumber or chair', async () => {
      mockPrisma.hSManagementReview.findMany.mockResolvedValueOnce([]);
      mockPrisma.hSManagementReview.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/management-reviews?search=Jane')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.hSManagementReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { refNumber: { contains: 'Jane', mode: 'insensitive' } },
              { chair: { contains: 'Jane', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.hSManagementReview.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/management-reviews')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================
  // GET /api/management-reviews/:id
  // =========================================
  describe('GET /api/management-reviews/:id', () => {
    const mockReview = {
      id: '10000000-0000-4000-a000-000000000001',
      refNumber: 'HS-MR-2026-01',
      reviewDate: new Date('2026-01-15'),
      chair: 'Jane Smith',
      attendees: ['Alice', 'Bob'],
      status: 'DRAFT',
      actions: [],
    };

    it('should return a single management review with actions', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce(mockReview);

      const response = await request(app)
        .get('/api/management-reviews/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('10000000-0000-4000-a000-000000000001');
    });

    it('should return 404 when review not found', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.hSManagementReview.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/management-reviews/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================
  // POST /api/management-reviews
  // =========================================
  describe('POST /api/management-reviews', () => {
    const createPayload = {
      reviewDate: '2026-03-15',
      chair: 'Jane Smith',
      attendees: ['Alice', 'Bob', 'Charlie'],
    };

    it('should create a management review successfully', async () => {
      mockPrisma.hSManagementReview.findFirst.mockResolvedValueOnce(null);
      mockPrisma.hSManagementReview.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        refNumber: 'HS-MR-2026-01',
        ...createPayload,
        reviewDate: new Date(createPayload.reviewDate),
        status: 'DRAFT',
        actions: [],
      });

      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.chair).toBe('Jane Smith');
    });

    it('should generate a reference number HS-MR-YYYY-NN', async () => {
      mockPrisma.hSManagementReview.findFirst.mockResolvedValueOnce({
        refNumber: 'HS-MR-2026-03',
      });
      mockPrisma.hSManagementReview.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        refNumber: 'HS-MR-2026-04',
        actions: [],
      });

      await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.hSManagementReview.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            refNumber: expect.stringMatching(/^HS-MR-\d{4}-\d{2}$/),
          }),
        })
      );
    });

    it('should set initial status to DRAFT and createdBy from user', async () => {
      mockPrisma.hSManagementReview.findFirst.mockResolvedValueOnce(null);
      mockPrisma.hSManagementReview.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        status: 'DRAFT',
        createdBy: 'user-1',
        actions: [],
      });

      await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.hSManagementReview.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DRAFT',
            createdBy: 'user-1',
          }),
        })
      );
    });

    it('should accept optional ISO 45001 input fields', async () => {
      const fullPayload = {
        ...createPayload,
        prevActionStatus: 'All completed',
        ohsObjectivesProgress: 'On track',
        legalComplianceStatus: 'Compliant',
        incidentStatistics: '2 minor incidents',
        riskOpportunityReview: 'Reviewed',
        auditResults: 'No findings',
        workerParticipation: 'Good',
        externalCommunications: 'None',
        changesInIssues: 'None',
        continualImprovement: 'In progress',
        resourceNeeds: 'Additional training budget',
        systemChanges: 'None required',
      };

      mockPrisma.hSManagementReview.findFirst.mockResolvedValueOnce(null);
      mockPrisma.hSManagementReview.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...fullPayload,
        actions: [],
      });

      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send(fullPayload);

      expect(response.status).toBe(201);
      expect(mockPrisma.hSManagementReview.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            prevActionStatus: 'All completed',
            continualImprovement: 'In progress',
          }),
        })
      );
    });

    it('should return 400 for missing reviewDate', async () => {
      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send({ chair: 'Jane Smith', attendees: ['Alice'] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing chair', async () => {
      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send({ reviewDate: '2026-03-15', attendees: ['Alice'] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty attendees array', async () => {
      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send({ reviewDate: '2026-03-15', chair: 'Jane Smith', attendees: [] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.hSManagementReview.findFirst.mockResolvedValueOnce(null);
      mockPrisma.hSManagementReview.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/management-reviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================
  // PUT /api/management-reviews/:id
  // =========================================
  describe('PUT /api/management-reviews/:id', () => {
    const existingReview = {
      id: '10000000-0000-4000-a000-000000000001',
      refNumber: 'HS-MR-2026-01',
      chair: 'Jane Smith',
      status: 'DRAFT',
    };

    it('should update a management review successfully', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce(existingReview);
      mockPrisma.hSManagementReview.update.mockResolvedValueOnce({
        ...existingReview,
        chair: 'Updated Chair',
        actions: [],
      });

      const response = await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ chair: 'Updated Chair' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should convert reviewDate string to Date object', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce(existingReview);
      mockPrisma.hSManagementReview.update.mockResolvedValueOnce({
        ...existingReview,
        reviewDate: new Date('2026-04-01'),
        actions: [],
      });

      await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ reviewDate: '2026-04-01' });

      expect(mockPrisma.hSManagementReview.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reviewDate: expect.any(Date),
          }),
        })
      );
    });

    it('should return 404 when review not found', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ chair: 'Updated Chair' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce(existingReview);

      const response = await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.hSManagementReview.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ chair: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================
  // POST /api/management-reviews/:id/complete
  // =========================================
  describe('POST /api/management-reviews/:id/complete', () => {
    it('should complete a DRAFT management review', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
        status: 'DRAFT',
      });
      mockPrisma.hSManagementReview.update.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
        status: 'COMPLETED',
        actions: [],
      });

      const response = await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/complete')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.hSManagementReview.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'COMPLETED' },
        })
      );
    });

    it('should return 400 when review is already COMPLETED', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
        status: 'COMPLETED',
      });

      const response = await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/complete')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ALREADY_COMPLETED');
    });

    it('should return 400 when review is already APPROVED', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
        status: 'APPROVED',
      });

      const response = await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/complete')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ALREADY_COMPLETED');
    });

    it('should return 404 when review not found', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff/complete')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.hSManagementReview.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/complete')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================
  // POST /api/management-reviews/:id/actions
  // =========================================
  describe('POST /api/management-reviews/:id/actions', () => {
    const actionPayload = {
      action: 'Follow up on risk assessment',
      owner: 'Alice Johnson',
      dueDate: '2026-04-30',
    };

    it('should add an action to a management review', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
      });
      mockPrisma.hSMRAction.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        reviewId: '10000000-0000-4000-a000-000000000001',
        ...actionPayload,
        dueDate: new Date(actionPayload.dueDate),
        status: 'OPEN',
      });

      const response = await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send(actionPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.action).toBe('Follow up on risk assessment');
      expect(response.body.data.status).toBe('OPEN');
    });

    it('should set reviewId from route param and status to OPEN', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
      });
      mockPrisma.hSMRAction.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        reviewId: '10000000-0000-4000-a000-000000000001',
        status: 'OPEN',
      });

      await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send(actionPayload);

      expect(mockPrisma.hSMRAction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          reviewId: '10000000-0000-4000-a000-000000000001',
          status: 'OPEN',
        }),
      });
    });

    it('should return 404 if management review not found', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff/actions')
        .set('Authorization', 'Bearer token')
        .send(actionPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing action text', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
      });

      const response = await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send({ owner: 'Alice', dueDate: '2026-04-30' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing owner', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
      });

      const response = await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send({ action: 'Do something', dueDate: '2026-04-30' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing dueDate', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
      });

      const response = await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send({ action: 'Do something', owner: 'Alice' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
      });
      mockPrisma.hSMRAction.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions')
        .set('Authorization', 'Bearer token')
        .send(actionPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================
  // PUT /api/management-reviews/:id/actions/:actionId
  // =========================================
  describe('PUT /api/management-reviews/:id/actions/:actionId', () => {
    const existingAction = {
      id: '20000000-0000-4000-a000-000000000001',
      reviewId: '10000000-0000-4000-a000-000000000001',
      action: 'Follow up on risk assessment',
      owner: 'Alice',
      status: 'OPEN',
    };

    it('should update a management review action successfully', async () => {
      mockPrisma.hSMRAction.findUnique.mockResolvedValueOnce(existingAction);
      mockPrisma.hSMRAction.update.mockResolvedValueOnce({
        ...existingAction,
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should set completedAt when status is COMPLETE', async () => {
      mockPrisma.hSMRAction.findUnique.mockResolvedValueOnce(existingAction);
      mockPrisma.hSMRAction.update.mockResolvedValueOnce({
        ...existingAction,
        status: 'COMPLETE',
        completedAt: new Date(),
      });

      await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETE' });

      expect(mockPrisma.hSMRAction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETE',
            completedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should return 404 when action not found', async () => {
      mockPrisma.hSMRAction.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when action belongs to a different review', async () => {
      mockPrisma.hSMRAction.findUnique.mockResolvedValueOnce({
        ...existingAction,
        reviewId: 'different-review-id',
      });

      const response = await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      mockPrisma.hSMRAction.findUnique.mockResolvedValueOnce(existingAction);

      const response = await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.hSMRAction.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/management-reviews/10000000-0000-4000-a000-000000000001/actions/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================
  // DELETE /api/management-reviews/:id
  // =========================================
  describe('DELETE /api/management-reviews/:id', () => {
    it('should soft delete a management review', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
      });
      mockPrisma.hSManagementReview.update.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000001',
        deletedAt: new Date(),
      });

      const response = await request(app)
        .delete('/api/management-reviews/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.hSManagementReview.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '10000000-0000-4000-a000-000000000001' },
          data: { deletedAt: expect.any(Date) },
        })
      );
    });

    it('should return 404 when review not found', async () => {
      mockPrisma.hSManagementReview.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/management-reviews/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.hSManagementReview.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/management-reviews/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
