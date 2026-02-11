import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    performanceCycle: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    performanceReview: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    performanceGoal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    goalUpdate: {
      create: jest.fn(),
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

import { prisma } from '@ims/database';
import performanceRoutes from '../src/routes/performance';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('HR Performance API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/performance', performanceRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/performance/cycles', () => {
    const mockCycles = [
      {
        id: 'cycle-1',
        name: '2024 Annual Review',
        year: 2024,
        cycleType: 'ANNUAL',
        status: 'ACTIVE',
        _count: { reviews: 10, goals: 25 },
      },
      {
        id: 'cycle-2',
        name: '2023 Annual Review',
        year: 2023,
        cycleType: 'ANNUAL',
        status: 'COMPLETED',
        _count: { reviews: 50, goals: 100 },
      },
    ];

    it('should return list of performance cycles', async () => {
      (mockPrisma.performanceCycle.findMany as jest.Mock).mockResolvedValueOnce(mockCycles);

      const response = await request(app)
        .get('/api/performance/cycles')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by year', async () => {
      (mockPrisma.performanceCycle.findMany as jest.Mock).mockResolvedValueOnce([mockCycles[0]]);

      await request(app)
        .get('/api/performance/cycles?year=2024')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceCycle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            year: 2024,
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.performanceCycle.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/performance/cycles?status=ACTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceCycle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should order by year descending', async () => {
      (mockPrisma.performanceCycle.findMany as jest.Mock).mockResolvedValueOnce(mockCycles);

      await request(app)
        .get('/api/performance/cycles')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceCycle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { year: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceCycle.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/performance/cycles')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/performance/cycles', () => {
    const createPayload = {
      name: 'Q1 2024 Review',
      year: 2024,
      cycleType: 'QUARTERLY',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
    };

    it('should create a performance cycle successfully', async () => {
      (mockPrisma.performanceCycle.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-cycle-123',
        ...createPayload,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
      });

      const response = await request(app)
        .post('/api/performance/cycles')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Q1 2024 Review');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/performance/cycles')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid cycleType', async () => {
      const response = await request(app)
        .post('/api/performance/cycles')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, cycleType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceCycle.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/performance/cycles')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/performance/reviews', () => {
    const mockReviews = [
      {
        id: 'review-1',
        cycleId: 'cycle-1',
        employeeId: 'emp-1',
        reviewerId: 'mgr-1',
        status: 'DRAFT',
        cycle: { name: '2024 Review', year: 2024 },
        employee: { id: 'emp-1', firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001', jobTitle: 'Developer' },
        reviewer: { id: 'mgr-1', firstName: 'Jane', lastName: 'Manager' },
      },
      {
        id: 'review-2',
        cycleId: 'cycle-1',
        employeeId: 'emp-2',
        reviewerId: 'mgr-1',
        status: 'COMPLETED',
        cycle: { name: '2024 Review', year: 2024 },
        employee: { id: 'emp-2', firstName: 'Alice', lastName: 'Smith', employeeNumber: 'EMP002', jobTitle: 'Designer' },
        reviewer: { id: 'mgr-1', firstName: 'Jane', lastName: 'Manager' },
      },
    ];

    it('should return list of reviews with pagination', async () => {
      (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValueOnce(mockReviews);
      (mockPrisma.performanceReview.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/performance/reviews')
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
      (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValueOnce([mockReviews[0]]);
      (mockPrisma.performanceReview.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/performance/reviews?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by cycleId', async () => {
      (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.performanceReview.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/performance/reviews?cycleId=cycle-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            cycleId: 'cycle-1',
          }),
        })
      );
    });

    it('should filter by employeeId', async () => {
      (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.performanceReview.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/performance/reviews?employeeId=emp-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.performanceReview.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/performance/reviews?status=DRAFT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DRAFT',
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.performanceReview.findMany as jest.Mock).mockResolvedValueOnce(mockReviews);
      (mockPrisma.performanceReview.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/performance/reviews')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceReview.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/performance/reviews')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/performance/reviews/:id', () => {
    const mockReview = {
      id: 'review-1',
      cycleId: 'cycle-1',
      employeeId: 'emp-1',
      reviewerId: 'mgr-1',
      status: 'DRAFT',
      cycle: { id: 'cycle-1', name: '2024 Review' },
      employee: { id: 'emp-1', firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001', jobTitle: 'Developer', department: { name: 'Engineering' } },
      reviewer: { id: 'mgr-1', firstName: 'Jane', lastName: 'Manager' },
      feedbacks: [],
    };

    it('should return single review with goals', async () => {
      (mockPrisma.performanceReview.findUnique as jest.Mock).mockResolvedValueOnce(mockReview);
      (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'goal-1', title: 'Complete project', status: 'IN_PROGRESS', updates: [] },
      ]);

      const response = await request(app)
        .get('/api/performance/reviews/review-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('review-1');
      expect(response.body.data.goals).toHaveLength(1);
    });

    it('should return 404 for non-existent review', async () => {
      (mockPrisma.performanceReview.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/performance/reviews/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceReview.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/performance/reviews/review-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/performance/reviews', () => {
    const createPayload = {
      cycleId: '11111111-1111-1111-1111-111111111111',
      employeeId: '22222222-2222-2222-2222-222222222222',
      reviewerId: '33333333-3333-3333-3333-333333333333',
      reviewType: 'ANNUAL',
      periodStart: '2024-01-01',
      periodEnd: '2024-12-31',
    };

    it('should create a review successfully', async () => {
      (mockPrisma.performanceReview.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-review-123',
        ...createPayload,
        status: 'DRAFT',
        cycle: { name: '2024 Review' },
        employee: { firstName: 'John', lastName: 'Doe' },
        reviewer: { firstName: 'Jane', lastName: 'Manager' },
      });

      const response = await request(app)
        .post('/api/performance/reviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('DRAFT');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/performance/reviews')
        .set('Authorization', 'Bearer token')
        .send({ cycleId: '11111111-1111-1111-1111-111111111111' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid reviewType', async () => {
      const response = await request(app)
        .post('/api/performance/reviews')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, reviewType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceReview.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/performance/reviews')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/performance/reviews/:id', () => {
    it('should update review successfully', async () => {
      (mockPrisma.performanceReview.update as jest.Mock).mockResolvedValueOnce({
        id: 'review-1',
        selfAssessment: 'Good performance',
        selfRating: 4,
        status: 'SELF_ASSESSMENT',
        cycle: {},
        employee: {},
        reviewer: {},
      });

      const response = await request(app)
        .put('/api/performance/reviews/review-1')
        .set('Authorization', 'Bearer token')
        .send({ selfAssessment: 'Good performance', selfRating: 4, status: 'SELF_ASSESSMENT' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/performance/reviews/review-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceReview.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/performance/reviews/review-1')
        .set('Authorization', 'Bearer token')
        .send({ selfAssessment: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/performance/goals', () => {
    const mockGoals = [
      {
        id: 'goal-1',
        title: 'Complete project X',
        category: 'PERFORMANCE',
        status: 'IN_PROGRESS',
        progress: 50,
        cycle: { name: '2024 Review', year: 2024 },
        employee: { id: 'emp-1', firstName: 'John', lastName: 'Doe' },
        updates: [],
      },
    ];

    it('should return list of goals', async () => {
      (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValueOnce(mockGoals);

      const response = await request(app)
        .get('/api/performance/goals')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter by employeeId', async () => {
      (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/performance/goals?employeeId=emp-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceGoal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
          }),
        })
      );
    });

    it('should filter by cycleId', async () => {
      (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/performance/goals?cycleId=cycle-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceGoal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            cycleId: 'cycle-1',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/performance/goals?status=IN_PROGRESS')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceGoal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'IN_PROGRESS',
          }),
        })
      );
    });

    it('should filter by category', async () => {
      (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/performance/goals?category=PERFORMANCE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.performanceGoal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'PERFORMANCE',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceGoal.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/performance/goals')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/performance/goals', () => {
    const createPayload = {
      cycleId: '11111111-1111-1111-1111-111111111111',
      employeeId: '22222222-2222-2222-2222-222222222222',
      title: 'Complete project X',
      description: 'Deliver the project by Q2',
      category: 'PERFORMANCE',
      measurementCriteria: 'Project delivered on time',
      dueDate: '2024-06-30',
    };

    it('should create a goal successfully', async () => {
      (mockPrisma.performanceGoal.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-goal-123',
        ...createPayload,
        status: 'NOT_STARTED',
        dueDate: new Date('2024-06-30'),
        cycle: {},
        employee: {},
      });

      const response = await request(app)
        .post('/api/performance/goals')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Complete project X');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/performance/goals')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Incomplete' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/performance/goals')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, category: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceGoal.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/performance/goals')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/performance/goals/:id', () => {
    it('should update goal successfully', async () => {
      (mockPrisma.performanceGoal.update as jest.Mock).mockResolvedValueOnce({
        id: 'goal-1',
        title: 'Updated Goal',
        progress: 75,
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .put('/api/performance/goals/goal-1')
        .set('Authorization', 'Bearer token')
        .send({ progress: 75, status: 'IN_PROGRESS' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/performance/goals/goal-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceGoal.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/performance/goals/goal-1')
        .set('Authorization', 'Bearer token')
        .send({ progress: 50 });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/performance/goals/:id/update', () => {
    const updatePayload = {
      progressAfter: 75,
      updateNotes: 'Milestone reached',
      updatedById: 'user-123',
    };

    it('should add goal progress update successfully', async () => {
      (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'goal-1',
        progress: 50,
      });
      (mockPrisma.goalUpdate.create as jest.Mock).mockResolvedValueOnce({
        id: 'update-1',
        goalId: 'goal-1',
        progressBefore: 50,
        progressAfter: 75,
        updateNotes: 'Milestone reached',
      });
      (mockPrisma.performanceGoal.update as jest.Mock).mockResolvedValueOnce({
        id: 'goal-1',
        progress: 75,
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .post('/api/performance/goals/goal-1/update')
        .set('Authorization', 'Bearer token')
        .send(updatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent goal', async () => {
      (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/performance/goals/non-existent/update')
        .set('Authorization', 'Bearer token')
        .send(updatePayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/performance/goals/goal-1/update')
        .set('Authorization', 'Bearer token')
        .send({ progressAfter: 75 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'goal-1',
        progress: 50,
      });
      (mockPrisma.goalUpdate.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/performance/goals/goal-1/update')
        .set('Authorization', 'Bearer token')
        .send(updatePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
