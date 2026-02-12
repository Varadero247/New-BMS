import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => {
  const p: any = {
    workflowInstance: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    workflowDefinition: {
      findUnique: jest.fn(),
    },
    workflowHistory: {
      create: jest.fn(),
    },
  };
  p.$transaction = jest.fn((cb: any) => cb(p));
  return { prisma: p };
});

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (req: any, res: any, next: any) => next(),
  metricsHandler: (req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (req: any, res: any, next: any) => next(),
  createHealthCheck: () => (req: any, res: any) => res.json({ status: 'healthy' }),
}));

import { prisma } from '../src/prisma';
import instancesRoutes from '../src/routes/instances';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Workflow Instances API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/instances', instancesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/instances', () => {
    const mockInstances = [
      {
        id: '3c000000-0000-4000-a000-000000000001',
        referenceNumber: 'WF-2024-000001',
        status: 'IN_PROGRESS',
        priority: 'NORMAL',
        definition: { name: 'Leave Approval' },
        _count: { tasks: 2, history: 5 },
      },
      {
        id: 'inst-2',
        referenceNumber: 'WF-2024-000002',
        status: 'COMPLETED',
        priority: 'HIGH',
        definition: { name: 'PO Approval' },
        _count: { tasks: 3, history: 8 },
      },
    ];

    it('should return list of workflow instances with pagination', async () => {
      mockPrisma.workflowInstance.findMany.mockResolvedValueOnce(mockInstances as any);
      mockPrisma.workflowInstance.count.mockResolvedValueOnce(2);

      const response = await request(app).get('/api/instances');

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
      mockPrisma.workflowInstance.findMany.mockResolvedValueOnce([mockInstances[0]] as any);
      mockPrisma.workflowInstance.count.mockResolvedValueOnce(100);

      const response = await request(app).get('/api/instances?page=3&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      mockPrisma.workflowInstance.findMany.mockResolvedValueOnce([]);
      mockPrisma.workflowInstance.count.mockResolvedValueOnce(0);

      await request(app).get('/api/instances?status=COMPLETED');

      expect(mockPrisma.workflowInstance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'COMPLETED',
          }),
        })
      );
    });

    it('should filter by definitionId', async () => {
      mockPrisma.workflowInstance.findMany.mockResolvedValueOnce([]);
      mockPrisma.workflowInstance.count.mockResolvedValueOnce(0);

      await request(app).get('/api/instances?definitionId=3b000000-0000-4000-a000-000000000001');

      expect(mockPrisma.workflowInstance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            definitionId: '3b000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by initiatedById', async () => {
      mockPrisma.workflowInstance.findMany.mockResolvedValueOnce([]);
      mockPrisma.workflowInstance.count.mockResolvedValueOnce(0);

      await request(app).get('/api/instances?initiatedById=20000000-0000-4000-a000-000000000001');

      expect(mockPrisma.workflowInstance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            initiatedById: '20000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowInstance.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/instances');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/instances/stats/summary', () => {
    it('should return instance statistics', async () => {
      mockPrisma.workflowInstance.groupBy
        .mockResolvedValueOnce([
          { status: 'IN_PROGRESS', _count: 5 },
          { status: 'COMPLETED', _count: 20 },
        ] as any)
        .mockResolvedValueOnce([
          { priority: 'NORMAL', _count: 15 },
          { priority: 'HIGH', _count: 10 },
        ] as any);
      mockPrisma.workflowInstance.findMany.mockResolvedValueOnce([
        { id: '3c000000-0000-4000-a000-000000000001', definition: { name: 'Workflow 1' } },
      ] as any);

      const response = await request(app).get('/api/instances/stats/summary');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('byPriority');
      expect(response.body.data).toHaveProperty('recentActive');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowInstance.groupBy.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/instances/stats/summary');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/instances/:id', () => {
    const mockInstance = {
      id: '3c000000-0000-4000-a000-000000000001',
      referenceNumber: 'WF-2024-000001',
      status: 'IN_PROGRESS',
      definition: { id: '3b000000-0000-4000-a000-000000000001', name: 'Leave Approval' },
      tasks: [{ id: '3d000000-0000-4000-a000-000000000001' }],
      history: [{ id: 'hist-1', eventType: 'STARTED' }],
    };

    it('should return single instance with tasks and history', async () => {
      mockPrisma.workflowInstance.findUnique.mockResolvedValueOnce(mockInstance as any);

      const response = await request(app).get('/api/instances/3c000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('3c000000-0000-4000-a000-000000000001');
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.history).toHaveLength(1);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff instance', async () => {
      mockPrisma.workflowInstance.findUnique.mockResolvedValueOnce(null);

      const response = await request(app).get('/api/instances/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowInstance.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/instances/3c000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/instances', () => {
    const createPayload = {
      definitionId: '11111111-1111-1111-1111-111111111111',
      initiatedById: '22222222-2222-2222-2222-222222222222',
      priority: 'NORMAL',
    };

    it('should create a workflow instance successfully', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce({
        id: createPayload.definitionId,
        status: 'ACTIVE',
      } as any);
      mockPrisma.workflowInstance.count.mockResolvedValueOnce(5);
      mockPrisma.workflowInstance.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'WF-2024-000006',
        ...createPayload,
        status: 'IN_PROGRESS',
        definition: { name: 'Approval' },
      } as any);
      mockPrisma.workflowHistory.create.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .post('/api/instances')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.referenceNumber).toBe('WF-2024-000006');
    });

    it('should generate sequential reference number', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce({
        id: createPayload.definitionId,
        status: 'ACTIVE',
      } as any);
      mockPrisma.workflowInstance.count.mockResolvedValueOnce(99);
      mockPrisma.workflowInstance.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'WF-2024-000100',
      } as any);
      mockPrisma.workflowHistory.create.mockResolvedValueOnce({} as any);

      await request(app)
        .post('/api/instances')
        .send(createPayload);

      expect(mockPrisma.workflowInstance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^WF-\d{4}-\d{6}$/),
        }),
        include: expect.any(Object),
      });
    });

    it('should create initial history entry', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce({
        id: createPayload.definitionId,
        status: 'ACTIVE',
      } as any);
      mockPrisma.workflowInstance.count.mockResolvedValueOnce(0);
      mockPrisma.workflowInstance.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
      } as any);
      mockPrisma.workflowHistory.create.mockResolvedValueOnce({} as any);

      await request(app)
        .post('/api/instances')
        .send(createPayload);

      expect(mockPrisma.workflowHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          instanceId: '30000000-0000-4000-a000-000000000123',
          eventType: 'STARTED',
          actorId: createPayload.initiatedById,
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff definition', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/instances')
        .send(createPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for inactive definition', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce({
        id: createPayload.definitionId,
        status: 'DRAFT',
      } as any);

      const response = await request(app)
        .post('/api/instances')
        .send(createPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATE');
    });

    it('should return 400 for missing definitionId', async () => {
      const { definitionId, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/instances')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid priority', async () => {
      const response = await request(app)
        .post('/api/instances')
        .send({ ...createPayload, priority: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/instances')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/instances/:id/advance', () => {
    it('should advance to next step', async () => {
      mockPrisma.workflowInstance.findUnique.mockResolvedValueOnce({
        id: '3c000000-0000-4000-a000-000000000001',
        currentStepId: 'step-1',
      } as any);
      mockPrisma.workflowInstance.update.mockResolvedValueOnce({
        id: '3c000000-0000-4000-a000-000000000001',
        currentStepId: 'step-2',
      } as any);
      mockPrisma.workflowHistory.create.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/advance')
        .send({ nextStepId: 'step-2', actionBy: '20000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should update currentStepId', async () => {
      mockPrisma.workflowInstance.findUnique.mockResolvedValueOnce({
        id: '3c000000-0000-4000-a000-000000000001',
        currentStepId: 'step-2',
      } as any);
      mockPrisma.workflowInstance.update.mockResolvedValueOnce({} as any);
      mockPrisma.workflowHistory.create.mockResolvedValueOnce({} as any);

      await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/advance')
        .send({ nextStepId: 'step-3', actionBy: '20000000-0000-4000-a000-000000000001' });

      expect(mockPrisma.workflowInstance.update).toHaveBeenCalledWith({
        where: { id: '3c000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          currentStepId: 'step-3',
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff instance', async () => {
      mockPrisma.workflowInstance.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/instances/00000000-0000-4000-a000-ffffffffffff/advance')
        .send({ nextStepId: 'step-2' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowInstance.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/advance')
        .send({ nextStepId: 'step-2' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/instances/:id/complete', () => {
    it('should complete workflow instance', async () => {
      mockPrisma.workflowInstance.update.mockResolvedValueOnce({
        id: '3c000000-0000-4000-a000-000000000001',
        status: 'COMPLETED',
        completedAt: new Date(),
        outcome: 'APPROVED',
      } as any);
      mockPrisma.workflowHistory.create.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/complete')
        .send({ outcome: 'APPROVED', completedById: '20000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should record completion in history', async () => {
      mockPrisma.workflowInstance.update.mockResolvedValueOnce({ id: '3c000000-0000-4000-a000-000000000001' } as any);
      mockPrisma.workflowHistory.create.mockResolvedValueOnce({} as any);

      await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/complete')
        .send({ outcome: 'REJECTED' });

      expect(mockPrisma.workflowHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          instanceId: '3c000000-0000-4000-a000-000000000001',
          eventType: 'COMPLETED',
        }),
      });
    });

    it('should return 400 for invalid outcome', async () => {
      const response = await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/complete')
        .send({ outcome: 'INVALID_OUTCOME' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowInstance.update.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/complete')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/instances/:id/cancel', () => {
    it('should cancel workflow instance', async () => {
      mockPrisma.workflowInstance.update.mockResolvedValueOnce({
        id: '3c000000-0000-4000-a000-000000000001',
        status: 'CANCELLED',
        completedAt: new Date(),
        completedById: '20000000-0000-4000-a000-000000000001',
        cancellationReason: 'No longer needed',
      } as any);
      mockPrisma.workflowHistory.create.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/cancel')
        .send({
          cancelledById: '20000000-0000-4000-a000-000000000001',
          cancellationReason: 'No longer needed',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should record cancellation in history', async () => {
      mockPrisma.workflowInstance.update.mockResolvedValueOnce({ id: '3c000000-0000-4000-a000-000000000001' } as any);
      mockPrisma.workflowHistory.create.mockResolvedValueOnce({} as any);

      await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/cancel')
        .send({
          cancelledById: '20000000-0000-4000-a000-000000000001',
          cancellationReason: 'Project cancelled',
        });

      expect(mockPrisma.workflowHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          instanceId: '3c000000-0000-4000-a000-000000000001',
          eventType: 'CANCELLED',
          actorId: '20000000-0000-4000-a000-000000000001',
        }),
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowInstance.update.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/instances/3c000000-0000-4000-a000-000000000001/cancel')
        .send({ cancelledById: '20000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
