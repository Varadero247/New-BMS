import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    workflowTask: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    workflowHistory: {
      create: jest.fn(),
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

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (req: any, res: any, next: any) => next(),
  metricsHandler: (req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (req: any, res: any, next: any) => next(),
  createHealthCheck: () => (req: any, res: any) => res.json({ status: 'healthy' }),
}));

import { prisma } from '../src/prisma';
import tasksRoutes from '../src/routes/tasks';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Workflows Tasks API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/tasks', tasksRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    const mockTasks = [
      {
        id: '3d000000-0000-4000-a000-000000000001',
        title: 'Review Document',
        taskType: 'REVIEW',
        status: 'PENDING',
        assignedToId: '20000000-0000-4000-a000-000000000001',
        instance: { referenceNumber: 'WF-001', priority: 'NORMAL' },
      },
      {
        id: 'task-2',
        title: 'Approve Purchase',
        taskType: 'APPROVE',
        status: 'IN_PROGRESS',
        assignedToId: '20000000-0000-4000-a000-000000000002',
        instance: { referenceNumber: 'WF-002', priority: 'HIGH' },
      },
    ];

    it('should return list of tasks', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce(mockTasks);

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by assignedToId', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks?assignedToId=20000000-0000-4000-a000-000000000001');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignedToId: '20000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks?status=PENDING');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });

    it('should filter by instanceId', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks?instanceId=3c000000-0000-4000-a000-000000000001');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            instanceId: '3c000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should order by dueDate asc', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { dueDate: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/tasks/stats/summary', () => {
    it('should return task statistics', async () => {
      (mockPrisma.workflowTask.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { status: 'PENDING', _count: 10 },
          { status: 'IN_PROGRESS', _count: 5 },
          { status: 'COMPLETED', _count: 20 },
        ]) // byStatus
        .mockResolvedValueOnce([
          { taskType: 'REVIEW', _count: 8 },
          { taskType: 'APPROVE', _count: 7 },
        ]); // byTaskType
      (mockPrisma.workflowTask.count as jest.Mock).mockResolvedValueOnce(3); // overdue

      const response = await request(app).get('/api/tasks/stats/summary');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.byStatus).toBeDefined();
      expect(response.body.data.byTaskType).toBeDefined();
      expect(response.body.data.overdueCount).toBe(3);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.groupBy as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/tasks/stats/summary');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/tasks/my/:userId', () => {
    it('should return tasks assigned to user', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: '3d000000-0000-4000-a000-000000000001',
          title: 'My Task',
          assignedToId: '20000000-0000-4000-a000-000000000001',
          instance: { referenceNumber: 'WF-001', priority: 'NORMAL' },
        },
      ]);

      const response = await request(app).get('/api/tasks/my/20000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter by status for user tasks', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks/my/20000000-0000-4000-a000-000000000001?status=PENDING');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignedToId: '20000000-0000-4000-a000-000000000001',
            status: 'PENDING',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/tasks/my/20000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/tasks/:id', () => {
    const mockTask = {
      id: '3d000000-0000-4000-a000-000000000001',
      title: 'Review Document',
      taskType: 'REVIEW',
      status: 'PENDING',
      instance: {
        referenceNumber: 'WF-001',
        definition: { id: '3b000000-0000-4000-a000-000000000001', name: 'Onboarding' },
      },
    };

    it('should return single task with instance and definition', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);

      const response = await request(app).get('/api/tasks/3d000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('3d000000-0000-4000-a000-000000000001');
      expect(response.body.data.instance).toBeDefined();
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff task', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get('/api/tasks/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get('/api/tasks/3d000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/tasks', () => {
    const createPayload = {
      instanceId: '11111111-1111-1111-1111-111111111111',
      assignedToId: '22222222-2222-2222-2222-222222222222',
      taskType: 'REVIEW' as const,
      title: 'Review the document',
    };

    it('should create a task successfully', async () => {
      (mockPrisma.workflowTask.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        status: 'PENDING',
        instance: { referenceNumber: 'WF-001' },
      });

      const response = await request(app).post('/api/tasks').send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Review the document');
    });

    it('should set status to PENDING on create', async () => {
      (mockPrisma.workflowTask.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-task',
        status: 'PENDING',
      });

      await request(app).post('/api/tasks').send(createPayload);

      expect(mockPrisma.workflowTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      );
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app).post('/api/tasks').send({
        instanceId: '11111111-1111-1111-1111-111111111111',
        assignedToId: '22222222-2222-2222-2222-222222222222',
        taskType: 'REVIEW',
      });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid taskType', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ ...createPayload, taskType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing instanceId', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ taskType: 'REVIEW', title: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).post('/api/tasks').send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/tasks/:id/claim', () => {
    it('should claim a task successfully', async () => {
      (mockPrisma.workflowTask.update as jest.Mock).mockResolvedValueOnce({
        id: '3d000000-0000-4000-a000-000000000001',
        assignedToId: '20000000-0000-4000-a000-000000000001',
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .put('/api/tasks/3d000000-0000-4000-a000-000000000001/claim')
        .send({ userId: '20000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/tasks/3d000000-0000-4000-a000-000000000001/claim')
        .send({ userId: '20000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/tasks/:id/complete', () => {
    it('should complete a task successfully', async () => {
      (mockPrisma.workflowTask.update as jest.Mock).mockResolvedValueOnce({
        id: '3d000000-0000-4000-a000-000000000001',
        instanceId: '3c000000-0000-4000-a000-000000000001',
        status: 'COMPLETED',
      });
      (mockPrisma.workflowHistory.create as jest.Mock).mockResolvedValueOnce({
        id: 'hist-1',
      });

      const response = await request(app)
        .put('/api/tasks/3d000000-0000-4000-a000-000000000001/complete')
        .send({
          outcome: 'approved',
          notes: 'Completed review',
          completedBy: '11111111-1111-1111-1111-111111111111',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'TASK_COMPLETED',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/tasks/3d000000-0000-4000-a000-000000000001/complete')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/tasks/:id/reassign', () => {
    it('should reassign a task successfully', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '3d000000-0000-4000-a000-000000000001',
        assignedToId: 'old-user',
        instanceId: '3c000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.workflowTask.update as jest.Mock).mockResolvedValueOnce({
        id: '3d000000-0000-4000-a000-000000000001',
        assignedToId: 'new-user',
        instanceId: '3c000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.workflowHistory.create as jest.Mock).mockResolvedValueOnce({
        id: 'hist-1',
      });

      const response = await request(app)
        .put('/api/tasks/3d000000-0000-4000-a000-000000000001/reassign')
        .send({
          newAssigneeId: 'new-user',
          reason: 'Out of office',
          reassignedBy: 'admin-1',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'DELEGATED',
          }),
        })
      );
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff task', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/tasks/00000000-0000-4000-a000-ffffffffffff/reassign')
        .send({ newAssigneeId: 'new-user' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/tasks/3d000000-0000-4000-a000-000000000001/reassign')
        .send({ newAssigneeId: 'new-user' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
