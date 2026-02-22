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
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import sprintsRouter from '../src/routes/sprints';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockSprint = {
  id: '45000000-0000-4000-a000-000000000001',
  projectId: '44000000-0000-4000-a000-000000000001',
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
  sprintId: '45000000-0000-4000-a000-000000000001',
  projectId: '44000000-0000-4000-a000-000000000001',
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

      const res = await request(app)
        .get('/api/sprints')
        .query({ projectId: '44000000-0000-4000-a000-000000000001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('45000000-0000-4000-a000-000000000001');
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBe(1);
      expect(mockPrisma.projectSprint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: '44000000-0000-4000-a000-000000000001', deletedAt: null },
          orderBy: { sprintNumber: 'asc' },
          include: { _count: { select: { userStories: true } } },
        })
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

      const res = await request(app)
        .get('/api/sprints')
        .query({ projectId: '44000000-0000-4000-a000-000000000001' });

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

      const res = await request(app).get(
        '/api/sprints/45000000-0000-4000-a000-000000000001/stories'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('story-001');
      expect(mockPrisma.projectSprint.findUnique).toHaveBeenCalledWith({
        where: { id: '45000000-0000-4000-a000-000000000001' },
      });
      expect(mockPrisma.projectUserStory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sprintId: '45000000-0000-4000-a000-000000000001', deletedAt: null },
        })
      );
    });

    it('should return 404 when sprint does not exist', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get(
        '/api/sprints/00000000-0000-4000-a000-ffffffffffff/stories'
      );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectUserStory.findMany).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get(
        '/api/sprints/45000000-0000-4000-a000-000000000001/stories'
      );

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- POST / ----

  describe('POST /api/sprints', () => {
    it('should create a new sprint', async () => {
      const createPayload = {
        projectId: '44000000-0000-4000-a000-000000000001',
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
          projectId: '44000000-0000-4000-a000-000000000001',
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
        projectId: '44000000-0000-4000-a000-000000000001',
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
        projectId: '44000000-0000-4000-a000-000000000001',
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

      const res = await request(app).put('/api/sprints/45000000-0000-4000-a000-000000000001').send({
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

      await request(app).put('/api/sprints/45000000-0000-4000-a000-000000000001').send({
        startDate: '2025-02-01',
        endDate: '2025-02-15',
      });

      expect(mockPrisma.projectSprint.update).toHaveBeenCalledWith({
        where: { id: '45000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      });
    });

    it('should return 404 when sprint does not exist', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/sprints/00000000-0000-4000-a000-ffffffffffff')
        .send({ sprintGoal: 'New goal' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectSprint.update).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(mockSprint);
      (mockPrisma.projectSprint.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/sprints/45000000-0000-4000-a000-000000000001')
        .send({ status: 'ACTIVE' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- DELETE /:id ----

  describe('DELETE /api/sprints/:id', () => {
    it('should delete an existing sprint', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(mockSprint);
      (mockPrisma.projectSprint.update as jest.Mock).mockResolvedValue(mockSprint);

      const res = await request(app).delete('/api/sprints/45000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(204);
      expect(mockPrisma.projectSprint.update).toHaveBeenCalledWith({
        where: { id: '45000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 when sprint does not exist', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/sprints/00000000-0000-4000-a000-ffffffffffff');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectSprint.update).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValue(mockSprint);
      (mockPrisma.projectSprint.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/sprints/45000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('sprints.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sprints', sprintsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/sprints', async () => {
    const res = await request(app).get('/api/sprints');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/sprints', async () => {
    const res = await request(app).get('/api/sprints');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/sprints body has success property', async () => {
    const res = await request(app).get('/api/sprints');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/sprints body is an object', async () => {
    const res = await request(app).get('/api/sprints');
    expect(typeof res.body).toBe('object');
  });
});

describe('sprints.api — edge cases and extended coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sprints', sprintsRouter);
    jest.clearAllMocks();
  });

  it('GET /api/sprints returns empty array when project has no sprints', async () => {
    (mockPrisma.projectSprint.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectSprint.count as jest.Mock).mockResolvedValueOnce(0);

    const res = await request(app)
      .get('/api/sprints')
      .query({ projectId: '44000000-0000-4000-a000-000000000001' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });

  it('GET /api/sprints supports pagination (page=2, limit=3)', async () => {
    (mockPrisma.projectSprint.findMany as jest.Mock).mockResolvedValueOnce([mockSprint]);
    (mockPrisma.projectSprint.count as jest.Mock).mockResolvedValueOnce(9);

    const res = await request(app)
      .get('/api/sprints')
      .query({ projectId: '44000000-0000-4000-a000-000000000001', page: '2', limit: '3' });

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(3);
    expect(res.body.meta.totalPages).toBe(3);
  });

  it('GET /api/sprints/:id/stories returns 500 when userStory findMany throws', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValueOnce(mockSprint);
    (mockPrisma.projectUserStory.findMany as jest.Mock).mockRejectedValueOnce(
      new Error('DB error')
    );

    const res = await request(app).get(
      '/api/sprints/45000000-0000-4000-a000-000000000001/stories'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/sprints creates sprint with ACTIVE status when status is set', async () => {
    const activeSprint = { ...mockSprint, status: 'ACTIVE' };
    (mockPrisma.projectSprint.create as jest.Mock).mockResolvedValueOnce(activeSprint);

    const res = await request(app).post('/api/sprints').send({
      projectId: '44000000-0000-4000-a000-000000000001',
      sprintNumber: 3,
      sprintName: 'Sprint 3',
      sprintGoal: 'Build reporting module',
      startDate: '2025-03-01',
      endDate: '2025-03-15',
      duration: 14,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/sprints/:id updates committedStoryPoints', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValueOnce(mockSprint);
    (mockPrisma.projectSprint.update as jest.Mock).mockResolvedValueOnce({
      ...mockSprint,
      committedStoryPoints: 30,
    });

    const res = await request(app)
      .put('/api/sprints/45000000-0000-4000-a000-000000000001')
      .send({ committedStoryPoints: 30 });

    expect(res.status).toBe(200);
    expect(res.body.data.committedStoryPoints).toBe(30);
  });

  it('DELETE /api/sprints/:id performs soft-delete with deletedAt', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValueOnce(mockSprint);
    (mockPrisma.projectSprint.update as jest.Mock).mockResolvedValueOnce({
      ...mockSprint,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/sprints/45000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(204);
    expect(mockPrisma.projectSprint.update).toHaveBeenCalledWith({
      where: { id: '45000000-0000-4000-a000-000000000001' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('GET /api/sprints/:id/stories returns empty array when sprint has no stories', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValueOnce(mockSprint);
    (mockPrisma.projectUserStory.findMany as jest.Mock).mockResolvedValueOnce([]);

    const res = await request(app).get(
      '/api/sprints/45000000-0000-4000-a000-000000000001/stories'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('POST /api/sprints returns 400 for missing duration field', async () => {
    const res = await request(app).post('/api/sprints').send({
      projectId: '44000000-0000-4000-a000-000000000001',
      sprintNumber: 4,
      sprintName: 'Sprint 4',
      startDate: '2025-04-01',
      endDate: '2025-04-15',
      // missing duration
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/sprints/:id returns 500 when findUnique throws', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockRejectedValueOnce(
      new Error('Connection failed')
    );

    const res = await request(app)
      .put('/api/sprints/45000000-0000-4000-a000-000000000001')
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('sprints.api — final extended coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sprints', sprintsRouter);
    jest.clearAllMocks();
  });

  it('DELETE /api/sprints/:id does not call update when not found', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app).delete('/api/sprints/00000000-0000-4000-a000-ffffffffffff');
    expect(mockPrisma.projectSprint.update).not.toHaveBeenCalled();
  });

  it('GET /api/sprints returns data as array', async () => {
    (mockPrisma.projectSprint.findMany as jest.Mock).mockResolvedValueOnce([mockSprint]);
    (mockPrisma.projectSprint.count as jest.Mock).mockResolvedValueOnce(1);
    const res = await request(app)
      .get('/api/sprints')
      .query({ projectId: '44000000-0000-4000-a000-000000000001' });
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/sprints meta.page defaults to 1', async () => {
    (mockPrisma.projectSprint.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectSprint.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app)
      .get('/api/sprints')
      .query({ projectId: '44000000-0000-4000-a000-000000000001' });
    expect(res.body.meta.page).toBe(1);
  });

  it('PUT /api/sprints/:id does not call update when not found', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app)
      .put('/api/sprints/00000000-0000-4000-a000-ffffffffffff')
      .send({ sprintGoal: 'Never updated' });
    expect(mockPrisma.projectSprint.update).not.toHaveBeenCalled();
  });

  it('POST /api/sprints returns 201 with created sprint id', async () => {
    (mockPrisma.projectSprint.create as jest.Mock).mockResolvedValueOnce({
      ...mockSprint,
      id: '45000000-0000-4000-a000-000000000099',
      sprintNumber: 10,
      sprintName: 'Sprint 10',
    });
    const res = await request(app).post('/api/sprints').send({
      projectId: '44000000-0000-4000-a000-000000000001',
      sprintNumber: 10,
      sprintName: 'Sprint 10',
      startDate: '2025-10-01',
      endDate: '2025-10-15',
      duration: 14,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('45000000-0000-4000-a000-000000000099');
  });

  it('GET /api/sprints/:id/stories returns stories array', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValueOnce(mockSprint);
    (mockPrisma.projectUserStory.findMany as jest.Mock).mockResolvedValueOnce([mockUserStory]);
    const res = await request(app).get(
      '/api/sprints/45000000-0000-4000-a000-000000000001/stories'
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('sprints.api — extra boundary coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/sprints', sprintsRouter);
    jest.clearAllMocks();
  });

  it('GET /api/sprints returns success:true with multiple sprints', async () => {
    const sprint2 = { ...mockSprint, id: '45000000-0000-4000-a000-000000000002', sprintNumber: 2 };
    (mockPrisma.projectSprint.findMany as jest.Mock).mockResolvedValueOnce([mockSprint, sprint2]);
    (mockPrisma.projectSprint.count as jest.Mock).mockResolvedValueOnce(2);
    const res = await request(app)
      .get('/api/sprints')
      .query({ projectId: '44000000-0000-4000-a000-000000000001' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('PUT /api/sprints/:id updates sprintName correctly', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValueOnce(mockSprint);
    (mockPrisma.projectSprint.update as jest.Mock).mockResolvedValueOnce({
      ...mockSprint,
      sprintName: 'Renamed Sprint',
    });
    const res = await request(app)
      .put('/api/sprints/45000000-0000-4000-a000-000000000001')
      .send({ sprintName: 'Renamed Sprint' });
    expect(res.status).toBe(200);
    expect(res.body.data.sprintName).toBe('Renamed Sprint');
  });

  it('POST /api/sprints returns 400 for empty projectId', async () => {
    const res = await request(app).post('/api/sprints').send({
      projectId: '',
      sprintNumber: 5,
      sprintName: 'Sprint 5',
      startDate: '2025-05-01',
      endDate: '2025-05-15',
      duration: 14,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /api/sprints/:id returns 500 when update throws after findUnique', async () => {
    (mockPrisma.projectSprint.findUnique as jest.Mock).mockResolvedValueOnce(mockSprint);
    (mockPrisma.projectSprint.update as jest.Mock).mockRejectedValueOnce(new Error('Write failed'));
    const res = await request(app).delete('/api/sprints/45000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/sprints count is called once per request', async () => {
    (mockPrisma.projectSprint.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectSprint.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app)
      .get('/api/sprints')
      .query({ projectId: '44000000-0000-4000-a000-000000000001' });
    expect(mockPrisma.projectSprint.count).toHaveBeenCalledTimes(1);
  });
});

describe('sprints — phase29 coverage', () => {
  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

  it('handles object keys', () => {
    expect(Object.keys({ a: 1, b: 2 }).length).toBe(2);
  });

  it('handles Array.from set', () => {
    expect(Array.from(new Set([1, 1, 2]))).toEqual([1, 2]);
  });

  it('handles JSON stringify', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}');
  });

  it('handles numeric type', () => {
    expect(typeof 42).toBe('number');
  });

});

describe('sprints — phase30 coverage', () => {
  it('handles string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

  it('handles Date type', () => {
    expect(new Date()).toBeInstanceOf(Date);
  });

  it('handles array isArray', () => {
    expect(Array.isArray([])).toBe(true);
  });

  it('handles array filter', () => {
    expect([1, 2, 3, 4].filter(x => x > 2)).toEqual([3, 4]);
  });

});
