import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectTask: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
import tasksRouter from '../src/routes/tasks';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockTask = {
  id: '3d000000-0000-4000-a000-000000000001',
  projectId: '44000000-0000-4000-a000-000000000001',
  taskCode: 'TSK-001',
  taskName: 'Implement Feature X',
  taskDescription: 'Build the feature X module',
  parentTaskId: null,
  wbsLevel: 1,
  sortOrder: 1,
  taskType: 'TASK',
  assignedToId: 'user-456',
  assignedDepartment: 'Engineering',
  plannedStartDate: '2025-02-01T00:00:00.000Z',
  plannedEndDate: '2025-03-01T00:00:00.000Z',
  actualStartDate: null,
  actualEndDate: null,
  baselineStartDate: null,
  baselineEndDate: null,
  plannedDuration: 20,
  actualDuration: null,
  plannedEffort: 160,
  progressPercentage: 0,
  predecessorIds: null,
  dependencyType: null,
  lagDays: 0,
  isCriticalPath: false,
  slack: null,
  plannedCost: 5000,
  actualCost: 0,
  acceptanceCriteria: 'All tests pass',
  priority: 'MEDIUM',
  tags: null,
  status: 'NOT_STARTED',
  createdAt: '2025-01-15T00:00:00.000Z',
  updatedAt: '2025-01-15T00:00:00.000Z',
};

const mockGanttTask = {
  id: '3d000000-0000-4000-a000-000000000001',
  taskCode: 'TSK-001',
  taskName: 'Implement Feature X',
  taskType: 'TASK',
  parentTaskId: null,
  wbsLevel: 1,
  sortOrder: 1,
  plannedStartDate: '2025-02-01T00:00:00.000Z',
  plannedEndDate: '2025-03-01T00:00:00.000Z',
  actualStartDate: null,
  actualEndDate: null,
  baselineStartDate: null,
  baselineEndDate: null,
  plannedDuration: 20,
  actualDuration: null,
  progressPercentage: 0,
  status: 'NOT_STARTED',
  isCriticalPath: false,
  slack: null,
  predecessorIds: null,
  dependencyType: null,
  lagDays: 0,
  assignedToId: 'user-456',
  priority: 'MEDIUM',
};

describe('Tasks API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tasks', tasksRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== GET / ==========

  describe('GET /api/tasks', () => {
    it('should list tasks for a given projectId', async () => {
      (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([mockTask]);
      (mockPrisma.projectTask.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get(
        '/api/tasks?projectId=44000000-0000-4000-a000-000000000001'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].taskCode).toBe('TSK-001');
      expect(res.body.meta).toEqual({ page: 1, limit: 100, total: 1, totalPages: 1 });
    });

    it('should return 400 when projectId is missing', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toBe('projectId query parameter is required');
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([mockTask]);
      (mockPrisma.projectTask.count as jest.Mock).mockResolvedValueOnce(50);

      const res = await request(app).get(
        '/api/tasks?projectId=44000000-0000-4000-a000-000000000001&page=2&limit=10'
      );

      expect(res.status).toBe(200);
      expect(res.body.meta).toEqual({ page: 2, limit: 10, total: 50, totalPages: 5 });
      expect(mockPrisma.projectTask.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.projectTask.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));
      (mockPrisma.projectTask.count as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).get(
        '/api/tasks?projectId=44000000-0000-4000-a000-000000000001'
      );

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== GET /gantt/:projectId ==========

  describe('GET /api/tasks/gantt/:projectId', () => {
    it('should return Gantt chart data for a project', async () => {
      (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([mockGanttTask]);

      const res = await request(app).get('/api/tasks/gantt/44000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].taskCode).toBe('TSK-001');
      expect(res.body.data[0].isCriticalPath).toBe(false);
      expect(mockPrisma.projectTask.findMany as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: '44000000-0000-4000-a000-000000000001', deletedAt: null },
          orderBy: [{ wbsLevel: 'asc' }, { sortOrder: 'asc' }],
          select: expect.objectContaining({
            id: true,
            taskCode: true,
            taskName: true,
            isCriticalPath: true,
            slack: true,
          }),
        })
      );
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.projectTask.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).get('/api/tasks/gantt/44000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== GET /:id ==========

  describe('GET /api/tasks/:id', () => {
    it('should return a single task with relations', async () => {
      const taskWithRelations = {
        ...mockTask,
        childTasks: [],
        parentTask: null,
        timesheets: [],
      };
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(taskWithRelations);

      const res = await request(app).get('/api/tasks/3d000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('3d000000-0000-4000-a000-000000000001');
      expect(mockPrisma.projectTask.findUnique as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '3d000000-0000-4000-a000-000000000001' },
          include: { childTasks: true, parentTask: true, timesheets: true },
        })
      );
    });

    it('should return 404 if task not found', async () => {
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/tasks/00000000-0000-4000-a000-ffffffffffff');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.projectTask.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB failure')
      );

      const res = await request(app).get('/api/tasks/3d000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== POST / ==========

  describe('POST /api/tasks', () => {
    it('should create a task successfully', async () => {
      (mockPrisma.projectTask.create as jest.Mock).mockResolvedValueOnce(mockTask);

      const res = await request(app).post('/api/tasks').send({
        projectId: '44000000-0000-4000-a000-000000000001',
        taskCode: 'TSK-001',
        taskName: 'Implement Feature X',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.taskCode).toBe('TSK-001');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/api/tasks').send({
        taskName: 'Missing projectId and taskCode',
        // missing projectId and taskCode
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
    });

    it('should return 500 on database error during create', async () => {
      (mockPrisma.projectTask.create as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).post('/api/tasks').send({
        projectId: '44000000-0000-4000-a000-000000000001',
        taskCode: 'TSK-002',
        taskName: 'Another Task',
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== PUT /:id ==========

  describe('PUT /api/tasks/:id', () => {
    it('should update a task successfully', async () => {
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
      (mockPrisma.projectTask.update as jest.Mock).mockResolvedValueOnce({
        ...mockTask,
        taskName: 'Updated Task Name',
      });

      const res = await request(app).put('/api/tasks/3d000000-0000-4000-a000-000000000001').send({
        taskName: 'Updated Task Name',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.taskName).toBe('Updated Task Name');
    });

    it('should return 404 if task not found', async () => {
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put('/api/tasks/00000000-0000-4000-a000-ffffffffffff').send({
        taskName: 'Updated',
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should auto-set actualStartDate when status changes to IN_PROGRESS', async () => {
      const notStartedTask = { ...mockTask, status: 'NOT_STARTED', actualStartDate: null };
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(notStartedTask);
      (mockPrisma.projectTask.update as jest.Mock).mockResolvedValueOnce({
        ...notStartedTask,
        status: 'IN_PROGRESS',
        actualStartDate: new Date(),
      });

      const res = await request(app).put('/api/tasks/3d000000-0000-4000-a000-000000000001').send({
        status: 'IN_PROGRESS',
      });

      expect(res.status).toBe(200);
      const updateCall = (mockPrisma.projectTask.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.actualStartDate).toBeInstanceOf(Date);
    });

    it('should auto-set actualEndDate and progressPercentage to 100 when COMPLETED', async () => {
      const inProgressTask = { ...mockTask, status: 'IN_PROGRESS', progressPercentage: 50 };
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(inProgressTask);
      (mockPrisma.projectTask.update as jest.Mock).mockResolvedValueOnce({
        ...inProgressTask,
        status: 'COMPLETED',
        progressPercentage: 100,
        actualEndDate: new Date(),
      });

      const res = await request(app).put('/api/tasks/3d000000-0000-4000-a000-000000000001').send({
        status: 'COMPLETED',
      });

      expect(res.status).toBe(200);
      const updateCall = (mockPrisma.projectTask.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.progressPercentage).toBe(100);
      expect(updateCall.data.actualEndDate).toBeInstanceOf(Date);
    });

    it('should return 500 on database error during update', async () => {
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
      (mockPrisma.projectTask.update as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).put('/api/tasks/3d000000-0000-4000-a000-000000000001').send({
        taskName: 'Updated',
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ========== DELETE /:id ==========

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task successfully', async () => {
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
      (mockPrisma.projectTask.update as jest.Mock).mockResolvedValueOnce(mockTask);

      const res = await request(app).delete('/api/tasks/3d000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(204);
    });

    it('should return 404 if task not found', async () => {
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete('/api/tasks/00000000-0000-4000-a000-ffffffffffff');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error during delete', async () => {
      (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
      (mockPrisma.projectTask.update as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app).delete('/api/tasks/3d000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('tasks.api — edge cases and extended coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tasks', tasksRouter);
    jest.clearAllMocks();
  });

  it('GET /api/tasks returns empty array when project has no tasks', async () => {
    (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectTask.count as jest.Mock).mockResolvedValueOnce(0);

    const res = await request(app).get(
      '/api/tasks?projectId=44000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });

  it('GET /api/tasks filters by status=IN_PROGRESS', async () => {
    (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([
      { ...mockTask, status: 'IN_PROGRESS' },
    ]);
    (mockPrisma.projectTask.count as jest.Mock).mockResolvedValueOnce(1);

    const res = await request(app).get(
      '/api/tasks?projectId=44000000-0000-4000-a000-000000000001&status=IN_PROGRESS'
    );

    expect(res.status).toBe(200);
    expect(res.body.data[0].status).toBe('IN_PROGRESS');
  });

  it('GET /api/tasks/gantt/:projectId returns empty array when no tasks', async () => {
    (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([]);

    const res = await request(app).get('/api/tasks/gantt/44000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/tasks supports page and limit pagination params', async () => {
    (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([mockTask]);
    (mockPrisma.projectTask.count as jest.Mock).mockResolvedValueOnce(30);

    const res = await request(app).get(
      '/api/tasks?projectId=44000000-0000-4000-a000-000000000001&page=3&limit=10'
    );

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(3);
    expect(res.body.meta.limit).toBe(10);
    expect(res.body.meta.total).toBe(30);
    expect(res.body.meta.totalPages).toBe(3);
  });

  it('POST /api/tasks defaults status to NOT_STARTED', async () => {
    (mockPrisma.projectTask.create as jest.Mock).mockResolvedValueOnce(mockTask);

    const res = await request(app).post('/api/tasks').send({
      projectId: '44000000-0000-4000-a000-000000000001',
      taskCode: 'TSK-010',
      taskName: 'New Task',
    });

    expect(res.status).toBe(201);
    expect(mockPrisma.projectTask.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'NOT_STARTED' }),
      })
    );
  });

  it('PUT /api/tasks/:id returns 500 when update throws after findUnique succeeds', async () => {
    (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
    (mockPrisma.projectTask.update as jest.Mock).mockRejectedValueOnce(
      new Error('Constraint violation')
    );

    const res = await request(app)
      .put('/api/tasks/3d000000-0000-4000-a000-000000000001')
      .send({ taskName: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/tasks/:id performs soft-delete with deletedAt', async () => {
    (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
    (mockPrisma.projectTask.update as jest.Mock).mockResolvedValueOnce({
      ...mockTask,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/tasks/3d000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(204);
    expect(mockPrisma.projectTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '3d000000-0000-4000-a000-000000000001' },
      })
    );
  });

  it('GET /api/tasks/:id returns task with childTasks and parentTask relations', async () => {
    const taskWithRelations = {
      ...mockTask,
      childTasks: [{ id: '3d000000-0000-4000-a000-000000000002', taskName: 'Sub-task' }],
      parentTask: null,
      timesheets: [],
    };
    (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(taskWithRelations);

    const res = await request(app).get('/api/tasks/3d000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.childTasks).toHaveLength(1);
    expect(res.body.data.childTasks[0].taskName).toBe('Sub-task');
  });

  it('PUT /api/tasks/:id does not auto-set actualStartDate if already set', async () => {
    const alreadyStarted = {
      ...mockTask,
      status: 'NOT_STARTED',
      actualStartDate: new Date('2025-02-05'),
    };
    (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(alreadyStarted);
    (mockPrisma.projectTask.update as jest.Mock).mockResolvedValueOnce({
      ...alreadyStarted,
      status: 'IN_PROGRESS',
    });

    const res = await request(app)
      .put('/api/tasks/3d000000-0000-4000-a000-000000000001')
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    const updateCall = (mockPrisma.projectTask.update as jest.Mock).mock.calls[0][0];
    // actualStartDate should NOT be overwritten since it was already set
    expect(updateCall.data.actualStartDate).toBeUndefined();
  });
});

describe('tasks.api — final extended coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tasks', tasksRouter);
    jest.clearAllMocks();
  });

  it('DELETE /api/tasks/:id does not call update when not found', async () => {
    (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app).delete('/api/tasks/00000000-0000-4000-a000-ffffffffffff');
    expect(mockPrisma.projectTask.update).not.toHaveBeenCalled();
  });

  it('GET /api/tasks returns data as array', async () => {
    (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([mockTask]);
    (mockPrisma.projectTask.count as jest.Mock).mockResolvedValueOnce(1);
    const res = await request(app).get(
      '/api/tasks?projectId=44000000-0000-4000-a000-000000000001'
    );
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /api/tasks/:id does not call update when not found', async () => {
    (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app)
      .put('/api/tasks/00000000-0000-4000-a000-ffffffffffff')
      .send({ taskName: 'Never updated' });
    expect(mockPrisma.projectTask.update).not.toHaveBeenCalled();
  });

  it('GET /api/tasks meta.limit defaults to 100', async () => {
    (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectTask.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app).get(
      '/api/tasks?projectId=44000000-0000-4000-a000-000000000001'
    );
    expect(res.body.meta.limit).toBe(100);
  });

  it('POST /api/tasks: create is called with correct projectId', async () => {
    (mockPrisma.projectTask.create as jest.Mock).mockResolvedValueOnce(mockTask);
    await request(app).post('/api/tasks').send({
      projectId: '44000000-0000-4000-a000-000000000001',
      taskCode: 'TSK-100',
      taskName: 'Test create call',
    });
    expect(mockPrisma.projectTask.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ projectId: '44000000-0000-4000-a000-000000000001' }),
      })
    );
  });

  it('GET /api/tasks/gantt/:projectId returns success:true', async () => {
    (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([mockGanttTask]);
    const res = await request(app).get('/api/tasks/gantt/44000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('tasks.api — extra boundary coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tasks', tasksRouter);
    jest.clearAllMocks();
  });

  it('GET /api/tasks returns multiple tasks', async () => {
    const task2 = { ...mockTask, id: '3d000000-0000-4000-a000-000000000002', taskCode: 'TSK-002' };
    (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([mockTask, task2]);
    (mockPrisma.projectTask.count as jest.Mock).mockResolvedValueOnce(2);
    const res = await request(app).get('/api/tasks?projectId=44000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('POST /api/tasks returns 400 when taskName is missing', async () => {
    const res = await request(app).post('/api/tasks').send({
      projectId: '44000000-0000-4000-a000-000000000001',
      taskCode: 'TSK-200',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/tasks/:id updates priority field', async () => {
    (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
    (mockPrisma.projectTask.update as jest.Mock).mockResolvedValueOnce({
      ...mockTask,
      priority: 'HIGH',
    });
    const res = await request(app)
      .put('/api/tasks/3d000000-0000-4000-a000-000000000001')
      .send({ priority: 'HIGH' });
    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe('HIGH');
  });

  it('DELETE /api/tasks/:id calls update with deletedAt timestamp', async () => {
    (mockPrisma.projectTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);
    (mockPrisma.projectTask.update as jest.Mock).mockResolvedValueOnce({ ...mockTask, deletedAt: new Date() });
    await request(app).delete('/api/tasks/3d000000-0000-4000-a000-000000000001');
    expect(mockPrisma.projectTask.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET /api/tasks count is called once per request', async () => {
    (mockPrisma.projectTask.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectTask.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app).get('/api/tasks?projectId=44000000-0000-4000-a000-000000000001');
    expect(mockPrisma.projectTask.count).toHaveBeenCalledTimes(1);
  });
});
