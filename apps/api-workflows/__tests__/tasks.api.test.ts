import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
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

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '@ims/database';
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
        id: 'task-1',
        taskNumber: 'TSK-2024-000001',
        title: 'Review Document',
        taskType: 'REVIEW',
        status: 'PENDING',
        priority: 'HIGH',
        assigneeId: 'user-1',
        instance: { instanceNumber: 'WF-001', title: 'Onboarding', priority: 'NORMAL' },
      },
      {
        id: 'task-2',
        taskNumber: 'TSK-2024-000002',
        title: 'Approve Purchase',
        taskType: 'APPROVE',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        assigneeId: 'user-2',
        instance: { instanceNumber: 'WF-002', title: 'Purchase Order', priority: 'HIGH' },
      },
    ];

    it('should return list of tasks', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce(mockTasks);

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by assigneeId', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks?assigneeId=user-1');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assigneeId: 'user-1',
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

    it('should filter by priority', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks?priority=HIGH');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priority: 'HIGH',
          }),
        })
      );
    });

    it('should filter by instanceId', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks?instanceId=inst-1');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            instanceId: 'inst-1',
          }),
        })
      );
    });

    it('should order by priority desc then dueDate asc', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
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
          { priority: 'HIGH', _count: 8 },
          { priority: 'NORMAL', _count: 7 },
        ]); // byPriority
      (mockPrisma.workflowTask.count as jest.Mock).mockResolvedValueOnce(3); // overdue

      const response = await request(app).get('/api/tasks/stats/summary');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.byStatus).toBeDefined();
      expect(response.body.data.byPriority).toBeDefined();
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
          id: 'task-1',
          title: 'My Task',
          assigneeId: 'user-1',
          instance: { instanceNumber: 'WF-001', title: 'Test', priority: 'NORMAL' },
        },
      ]);

      const response = await request(app).get('/api/tasks/my/user-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter by status for user tasks', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/tasks/my/user-1?status=PENDING');

      expect(mockPrisma.workflowTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assigneeId: 'user-1',
            status: 'PENDING',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/tasks/my/user-1');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/tasks/:id', () => {
    const mockTask = {
      id: 'task-1',
      taskNumber: 'TSK-2024-000001',
      title: 'Review Document',
      taskType: 'REVIEW',
      status: 'PENDING',
      instance: {
        instanceNumber: 'WF-001',
        definition: { id: 'def-1', name: 'Onboarding' },
      },
    };

    it('should return single task with instance and definition', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockResolvedValueOnce(mockTask);

      const response = await request(app).get('/api/tasks/task-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('task-1');
      expect(response.body.data.instance).toBeDefined();
    });

    it('should return 404 for non-existent task', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get('/api/tasks/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/tasks/task-1');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/tasks', () => {
    const createPayload = {
      instanceId: '11111111-1111-1111-1111-111111111111',
      assigneeId: '22222222-2222-2222-2222-222222222222',
      taskType: 'REVIEW' as const,
      title: 'Review the document',
    };

    it('should create a task successfully', async () => {
      (mockPrisma.workflowTask.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.workflowTask.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-task-123',
        taskNumber: 'TSK-2024-000006',
        ...createPayload,
        status: 'PENDING',
        instance: { instanceNumber: 'WF-001', title: 'Test' },
      });

      const response = await request(app)
        .post('/api/tasks')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Review the document');
    });

    it('should generate taskNumber from count', async () => {
      (mockPrisma.workflowTask.count as jest.Mock).mockResolvedValueOnce(10);
      (mockPrisma.workflowTask.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-task',
        taskNumber: 'TSK-2024-000011',
      });

      await request(app)
        .post('/api/tasks')
        .send(createPayload);

      expect(mockPrisma.workflowTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskNumber: expect.stringContaining('TSK-'),
            status: 'PENDING',
          }),
        })
      );
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          instanceId: '11111111-1111-1111-1111-111111111111',
          assigneeId: '22222222-2222-2222-2222-222222222222',
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

    it('should return 400 for invalid instanceId format', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ ...createPayload, instanceId: 'not-a-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.workflowTask.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/tasks')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/tasks/:id/claim', () => {
    it('should claim a task successfully', async () => {
      (mockPrisma.workflowTask.update as jest.Mock).mockResolvedValueOnce({
        id: 'task-1',
        assigneeId: 'user-1',
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .put('/api/tasks/task-1/claim')
        .send({ userId: 'user-1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/tasks/task-1/claim')
        .send({ userId: 'user-1' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/tasks/:id/complete', () => {
    it('should complete a task successfully', async () => {
      (mockPrisma.workflowTask.update as jest.Mock).mockResolvedValueOnce({
        id: 'task-1',
        instanceId: 'inst-1',
        status: 'COMPLETED',
      });
      (mockPrisma.workflowHistory.create as jest.Mock).mockResolvedValueOnce({
        id: 'hist-1',
      });

      const response = await request(app)
        .put('/api/tasks/task-1/complete')
        .send({
          result: { approved: true },
          notes: 'Completed review',
          completedBy: '11111111-1111-1111-1111-111111111111',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'TASK_COMPLETED',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/tasks/task-1/complete')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/tasks/:id/reassign', () => {
    it('should reassign a task successfully', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'task-1',
        assigneeId: 'old-user',
        instanceId: 'inst-1',
      });
      (mockPrisma.workflowTask.update as jest.Mock).mockResolvedValueOnce({
        id: 'task-1',
        assigneeId: 'new-user',
        instanceId: 'inst-1',
      });
      (mockPrisma.workflowHistory.create as jest.Mock).mockResolvedValueOnce({
        id: 'hist-1',
      });

      const response = await request(app)
        .put('/api/tasks/task-1/reassign')
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
            action: 'TASK_REASSIGNED',
          }),
        })
      );
    });

    it('should return 404 for non-existent task', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/tasks/non-existent/reassign')
        .send({ newAssigneeId: 'new-user' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTask.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/tasks/task-1/reassign')
        .send({ newAssigneeId: 'new-user' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
