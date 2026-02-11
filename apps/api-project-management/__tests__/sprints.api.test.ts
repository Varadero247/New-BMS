import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectSprint: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    projectUserStory: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

import { prisma } from '../src/prisma';
import sprintsRouter from '../src/routes/sprints';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockSprint = {
  id: 'sprint-001',
  projectId: 'proj-001',
  sprintNumber: 1,
  sprintName: 'Sprint 1',
  sprintGoal: 'Complete user authentication module',
  startDate: '2025-01-06T00:00:00.000Z',
  endDate: '2025-01-20T00:00:00.000Z',
  duration: 14,
  status: 'PLANNED',
  committedStoryPoints: 0,
  completedStoryPoints: 0,
  plannedVelocity: 30,
  teamCapacity: 120,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  _count: { userStories: 5 },
};

const mockUserStory = {
  id: 'story-001',
  sprintId: 'sprint-001',
  projectId: 'proj-001',
  storyCode: 'US-001',
  title: 'As a user I want to log in',
  backlogPriority: 1,
  storyPoints: 5,
  status: 'TODO',
  createdAt: '2025-01-01T00:00:00.000Z',
};

describe('Sprints API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sprints', sprintsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- GET / ----

  describe('GET /api/sprints', () => {
    it('should list sprints for a given projectId', async () => {
      (mockPrisma.projectSprint.findMany as jest.Mock).mockResolvedValue([mockSprint]);
      (mockPrisma.projectSprint.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/sprints').query({ projectId: 'proj-001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('sprint-001');
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBe(1);
      expect(mockPrisma.projectSprint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 'proj-001' },
          orderBy: { sprintNumber: 'asc' },
          include: { _count: { select: { userStories: true } } },
        }),
      );
    });

    it('should return 400 when projectId is missing', async () => {
      const res = await request(app).get('/api/sprints');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectSprint.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
      (mockPrisma.projectSprint.count as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/sprints').query({ projectId: 'proj-001' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- GET /:id/stories ----

  describe('GET /api/sprints/:id/stories', () => {
    it('should return user stories for a sprint', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(mockSprint);
      (mockPrisma.projectUserStory.findMany as jest.Mock).mockResolvedValue([mockUserStory]);

      const res = await request(app).get('/api/sprints/sprint-001/stories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('story-001');
      expect(mockPrisma.projectSprint.findUnique).toHaveBeenCalledWith({ where: { id: 'sprint-001' } });
      expect(mockPrisma.projectUserStory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sprintId: 'sprint-001' },
        }),
      );
    });

    it('should return 404 when sprint does not exist', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/sprints/nonexistent/stories');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectUserStory.findMany).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/sprints/sprint-001/stories');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- POST / ----

  describe('POST /api/sprints', () => {
    it('should create a new sprint', async () => {
      const createPayload = {
        projectId: 'proj-001',
        sprintNumber: 2,
        sprintName: 'Sprint 2',
        sprintGoal: 'Build dashboard',
        startDate: '2025-01-21',
        endDate: '2025-02-04',
        duration: 14,
        plannedVelocity: 25,
        teamCapacity: 100,
      };

      const createdSprint = {
        id: 'sprint-002',
        ...createPayload,
        startDate: new Date('2025-01-21').toISOString(),
        endDate: new Date('2025-02-04').toISOString(),
        status: 'PLANNED',
        committedStoryPoints: 0,
        completedStoryPoints: 0,
        createdAt: '2025-01-15T00:00:00.000Z',
        updatedAt: '2025-01-15T00:00:00.000Z',
      };

      (mockPrisma.projectSprint.create as jest.Mock).mockResolvedValue(createdSprint);

      const res = await request(app).post('/api/sprints').send(createPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('sprint-002');
      expect(res.body.data.status).toBe('PLANNED');
      expect(res.body.data.committedStoryPoints).toBe(0);
      expect(res.body.data.completedStoryPoints).toBe(0);
      expect(mockPrisma.projectSprint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'proj-001',
          sprintNumber: 2,
          sprintName: 'Sprint 2',
          status: 'PLANNED',
          committedStoryPoints: 0,
          completedStoryPoints: 0,
        }),
      });
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/api/sprints').send({
        projectId: 'proj-001',
        // missing sprintNumber, sprintName, startDate, endDate, duration
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectSprint.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/sprints').send({
        projectId: 'proj-001',
        sprintNumber: 1,
        sprintName: 'Sprint 1',
        startDate: '2025-01-06',
        endDate: '2025-01-20',
        duration: 14,
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- PUT /:id ----

  describe('PUT /api/sprints/:id', () => {
    it('should update an existing sprint', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(mockSprint);

      const updatedSprint = { ...mockSprint, sprintGoal: 'Updated goal', status: 'ACTIVE' };
      (mockPrisma.projectSprint.update as jest.Mock).mockResolvedValue(updatedSprint);

      const res = await request(app).put('/api/sprints/sprint-001').send({
        sprintGoal: 'Updated goal',
        status: 'ACTIVE',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sprintGoal).toBe('Updated goal');
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('should convert startDate and endDate to Date objects', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(mockSprint);
      (mockPrisma.projectSprint.update as jest.Mock).mockResolvedValue({
        ...mockSprint,
        startDate: '2025-02-01T00:00:00.000Z',
        endDate: '2025-02-15T00:00:00.000Z',
      });

      await request(app).put('/api/sprints/sprint-001').send({
        startDate: '2025-02-01',
        endDate: '2025-02-15',
      });

      expect(mockPrisma.projectSprint.update).toHaveBeenCalledWith({
        where: { id: 'sprint-001' },
        data: expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      });
    });

    it('should return 404 when sprint does not exist', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/sprints/nonexistent').send({ sprintGoal: 'New goal' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectSprint.update).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(mockSprint);
      (mockPrisma.projectSprint.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/sprints/sprint-001').send({ status: 'ACTIVE' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- DELETE /:id ----

  describe('DELETE /api/sprints/:id', () => {
    it('should delete an existing sprint', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(mockSprint);
      (mockPrisma.projectSprint.delete as jest.Mock).mockResolvedValue(mockSprint);

      const res = await request(app).delete('/api/sprints/sprint-001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Sprint deleted successfully');
      expect(mockPrisma.projectSprint.delete).toHaveBeenCalledWith({ where: { id: 'sprint-001' } });
    });

    it('should return 404 when sprint does not exist', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/sprints/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectSprint.delete).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(mockSprint);
      (mockPrisma.projectSprint.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/sprints/sprint-001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
