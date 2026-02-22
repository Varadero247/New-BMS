import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    workOrder: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    taskCard: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    WorkOrderWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
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
import workordersRouter from '../src/routes/workorders';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockWorkOrder = {
  id: 'wo-00000000-0000-4000-a000-000000000001',
  refNumber: 'WO-2602-0001',
  title: 'Engine Overhaul - CFM56',
  aircraftType: 'B737-800',
  aircraftReg: 'N12345',
  description: 'Scheduled engine overhaul per maintenance program',
  priority: 'ROUTINE',
  status: 'OPEN',
  assignedTo: 'tech-team-1',
  startDate: new Date('2026-02-10'),
  dueDate: new Date('2026-03-10'),
  inspectedBy: null,
  inspectedDate: null,
  releaseCertType: null,
  releaseCertRef: null,
  releasedBy: null,
  releasedDate: null,
  completedDate: null,
  deferralRef: null,
  deferralNotes: null,
  createdBy: 'test@test.com',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
  tasks: [],
};

const mockWorkOrderWithTasks = {
  ...mockWorkOrder,
  status: 'IN_PROGRESS',
  tasks: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      workOrderId: mockWorkOrder.id,
      taskNumber: 'TC-001',
      description: 'Remove engine cowling',
      zone: 'Zone 1',
      access: 'Panel 1A',
      estimatedHours: 2,
      actualHours: 1.5,
      technicianId: 'tech-1',
      technicianName: 'John Smith',
      status: 'COMPLETED',
      signedDate: new Date('2026-02-12'),
      notes: null,
      createdAt: new Date('2026-02-10'),
      updatedAt: new Date('2026-02-12'),
    },
    {
      id: 'task-002',
      workOrderId: mockWorkOrder.id,
      taskNumber: 'TC-002',
      description: 'Inspect fan blades',
      zone: 'Zone 1',
      access: null,
      estimatedHours: 4,
      actualHours: null,
      technicianId: null,
      technicianName: null,
      status: 'OPEN',
      signedDate: null,
      notes: null,
      createdAt: new Date('2026-02-10'),
      updatedAt: new Date('2026-02-10'),
    },
  ],
};

const mockReleasedWorkOrder = {
  ...mockWorkOrder,
  status: 'RELEASED',
  inspectedBy: 'inspector@test.com',
  inspectedDate: new Date('2026-02-15'),
  releaseCertType: 'EASA_FORM_1',
  releaseCertRef: 'EASA-CRS-2026-001',
  releasedBy: 'test@test.com',
  releasedDate: new Date('2026-02-16'),
  completedDate: new Date('2026-02-16'),
  tasks: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      workOrderId: mockWorkOrder.id,
      taskNumber: 'TC-001',
      description: 'Remove engine cowling',
      zone: 'Zone 1',
      access: 'Panel 1A',
      estimatedHours: 2,
      actualHours: 1.5,
      technicianId: 'tech-1',
      technicianName: 'John Smith',
      status: 'COMPLETED',
      signedDate: new Date('2026-02-12'),
      notes: null,
      createdAt: new Date('2026-02-10'),
      updatedAt: new Date('2026-02-12'),
    },
  ],
};

const mockInspectedWorkOrder = {
  ...mockWorkOrder,
  status: 'INSPECTION',
  inspectedBy: 'inspector@test.com',
  inspectedDate: new Date('2026-02-15'),
  tasks: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      workOrderId: mockWorkOrder.id,
      taskNumber: 'TC-001',
      description: 'Remove engine cowling',
      zone: 'Zone 1',
      access: 'Panel 1A',
      estimatedHours: 2,
      actualHours: 1.5,
      technicianId: 'tech-1',
      technicianName: 'John Smith',
      status: 'COMPLETED',
      signedDate: new Date('2026-02-12'),
      notes: null,
      createdAt: new Date('2026-02-10'),
      updatedAt: new Date('2026-02-12'),
    },
  ],
};

const validCreatePayload = {
  title: 'Engine Overhaul - CFM56',
  aircraftType: 'B737-800',
  aircraftReg: 'N12345',
  description: 'Scheduled engine overhaul per maintenance program',
  priority: 'ROUTINE',
  assignedTo: 'tech-team-1',
};

const validTaskPayload = {
  taskNumber: 'TC-003',
  description: 'Borescope inspection',
  zone: 'Zone 2',
  access: 'Panel 2B',
  estimatedHours: 3,
  technicianId: 'tech-2',
  technicianName: 'Jane Doe',
};

const validCompleteTaskPayload = {
  actualHours: 2.5,
  technicianId: 'tech-1',
  technicianName: 'John Smith',
  notes: 'Completed without findings',
};

const validReleasePayload = {
  releaseCertType: 'EASA_FORM_1',
  releaseCertRef: 'EASA-CRS-2026-001',
};

const validDeferPayload = {
  deferralRef: 'MEL-72-001',
  deferralNotes: 'Deferred per MEL Category C - 10 day rectification interval',
};

// ==========================================
// Tests
// ==========================================

describe('Aerospace Work Orders (AS9110 MRO) API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/workorders', workordersRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / — Create Work Order
  // ==========================================
  describe('POST /api/workorders', () => {
    it('should create a work order with all fields successfully', async () => {
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.workOrder.create as jest.Mock).mockResolvedValueOnce({
        ...mockWorkOrder,
        refNumber: 'WO-2602-0001',
      });

      const response = await request(app)
        .post('/api/workorders')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.refNumber).toBe('WO-2602-0001');
      expect(mockPrisma.workOrder.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/workorders')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, title: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when aircraftType is missing', async () => {
      const response = await request(app)
        .post('/api/workorders')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, aircraftType: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when description is missing', async () => {
      const response = await request(app)
        .post('/api/workorders')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, description: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.workOrder.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/workorders')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET / — List Work Orders
  // ==========================================
  describe('GET /api/workorders', () => {
    it('should list work orders with pagination metadata', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockResolvedValueOnce([mockWorkOrder]);
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/workorders')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBe(1);
      expect(response.body.meta.page).toBe(1);
    });

    it('should filter by status query parameter', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/workorders?status=OPEN')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'OPEN' }),
        })
      );
    });

    it('should support search query parameter', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.workOrder.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/workorders?search=CFM56')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(mockPrisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: { contains: 'CFM56', mode: 'insensitive' } }),
            ]),
          }),
        })
      );
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.workOrder.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/workorders')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /:id — Get Work Order by ID
  // ==========================================
  describe('GET /api/workorders/:id', () => {
    it('should return a work order with tasks', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrderWithTasks);

      const response = await request(app)
        .get(`/api/workorders/${mockWorkOrder.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockWorkOrder.id);
      expect(response.body.data.tasks).toHaveLength(2);
    });

    it('should return 404 when work order not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/workorders/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when work order is soft-deleted', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockWorkOrder,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/workorders/${mockWorkOrder.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ==========================================
  // POST /:id/tasks — Add Task Card
  // ==========================================
  describe('POST /api/workorders/:id/tasks', () => {
    it('should add a task card to an OPEN work order', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrder);
      (mockPrisma.taskCard.create as jest.Mock).mockResolvedValueOnce({
        id: 'task-003',
        workOrderId: mockWorkOrder.id,
        ...validTaskPayload,
        status: 'OPEN',
      });
      (mockPrisma.workOrder.update as jest.Mock).mockResolvedValueOnce({
        ...mockWorkOrder,
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/tasks`)
        .set('Authorization', 'Bearer token')
        .send(validTaskPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.taskNumber).toBe('TC-003');
      expect(mockPrisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'IN_PROGRESS' } })
      );
    });

    it('should return 404 when work order not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/workorders/00000000-0000-0000-0000-000000000099/tasks')
        .set('Authorization', 'Bearer token')
        .send(validTaskPayload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when work order is RELEASED', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockWorkOrder,
        status: 'RELEASED',
      });

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/tasks`)
        .set('Authorization', 'Bearer token')
        .send(validTaskPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_STATE');
    });

    it('should return 400 when task number is missing', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrder);

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/tasks`)
        .set('Authorization', 'Bearer token')
        .send({ ...validTaskPayload, taskNumber: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ==========================================
  // PUT /:id/tasks/:tid/complete — Complete Task
  // ==========================================
  describe('PUT /api/workorders/:id/tasks/:tid/complete', () => {
    it('should complete a task card with technician sign-off', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrderWithTasks);
      (mockPrisma.taskCard.findFirst as jest.Mock).mockResolvedValueOnce(
        mockWorkOrderWithTasks.tasks[1]
      );
      (mockPrisma.taskCard.update as jest.Mock).mockResolvedValueOnce({
        ...mockWorkOrderWithTasks.tasks[1],
        status: 'COMPLETED',
        actualHours: 2.5,
        technicianId: 'tech-1',
        technicianName: 'John Smith',
        signedDate: new Date(),
      });

      const response = await request(app)
        .put(`/api/workorders/${mockWorkOrder.id}/tasks/task-002/complete`)
        .set('Authorization', 'Bearer token')
        .send(validCompleteTaskPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
    });

    it('should return 404 when work order not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put(
          '/api/workorders/00000000-0000-0000-0000-000000000099/tasks/00000000-0000-0000-0000-000000000001/complete'
        )
        .set('Authorization', 'Bearer token')
        .send(validCompleteTaskPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when task card not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrderWithTasks);
      (mockPrisma.taskCard.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put(`/api/workorders/${mockWorkOrder.id}/tasks/nonexistent-task/complete`)
        .set('Authorization', 'Bearer token')
        .send(validCompleteTaskPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when task is already completed', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrderWithTasks);
      (mockPrisma.taskCard.findFirst as jest.Mock).mockResolvedValueOnce(
        mockWorkOrderWithTasks.tasks[0]
      ); // Already COMPLETED

      const response = await request(app)
        .put(`/api/workorders/${mockWorkOrder.id}/tasks/task-001/complete`)
        .set('Authorization', 'Bearer token')
        .send(validCompleteTaskPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATE');
    });

    it('should return 400 when actualHours is missing', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrderWithTasks);
      (mockPrisma.taskCard.findFirst as jest.Mock).mockResolvedValueOnce(
        mockWorkOrderWithTasks.tasks[1]
      );

      const response = await request(app)
        .put(`/api/workorders/${mockWorkOrder.id}/tasks/task-002/complete`)
        .set('Authorization', 'Bearer token')
        .send({ technicianId: 'tech-1', technicianName: 'John Smith' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ==========================================
  // POST /:id/inspect — Quality Inspection
  // ==========================================
  describe('POST /api/workorders/:id/inspect', () => {
    it('should mark work order as inspected when all tasks are completed', async () => {
      const woAllTasksComplete = {
        ...mockWorkOrder,
        status: 'IN_PROGRESS',
        tasks: [{ ...mockWorkOrderWithTasks.tasks[0], status: 'COMPLETED' }],
      };
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(woAllTasksComplete);
      (mockPrisma.workOrder.update as jest.Mock).mockResolvedValueOnce({
        ...woAllTasksComplete,
        status: 'INSPECTION',
        inspectedBy: 'test@test.com',
        inspectedDate: new Date(),
      });

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/inspect`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('INSPECTION');
    });

    it('should return 400 when work order has no tasks', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockWorkOrder,
        tasks: [],
      });

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/inspect`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('NO_TASKS');
    });

    it('should return 400 when some tasks are incomplete', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrderWithTasks);

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/inspect`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('TASKS_INCOMPLETE');
    });

    it('should return 400 when work order status is RELEASED', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockReleasedWorkOrder);

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/inspect`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATE');
    });

    it('should return 404 when work order not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/workorders/00000000-0000-0000-0000-000000000099/inspect')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ==========================================
  // POST /:id/release — Airworthiness Release
  // ==========================================
  describe('POST /api/workorders/:id/release', () => {
    it('should release an inspected work order with valid certificate', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockInspectedWorkOrder);
      (mockPrisma.workOrder.update as jest.Mock).mockResolvedValueOnce({
        ...mockInspectedWorkOrder,
        status: 'RELEASED',
        releaseCertType: 'EASA_FORM_1',
        releaseCertRef: 'EASA-CRS-2026-001',
        releasedBy: 'test@test.com',
        releasedDate: new Date(),
        completedDate: new Date(),
      });

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/release`)
        .set('Authorization', 'Bearer token')
        .send(validReleasePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('RELEASED');
    });

    it('should return 400 when inspection has not been done', async () => {
      const woNoInspection = {
        ...mockWorkOrder,
        status: 'IN_PROGRESS',
        inspectedBy: null,
        inspectedDate: null,
        tasks: [{ ...mockWorkOrderWithTasks.tasks[0], status: 'COMPLETED' }],
      };
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(woNoInspection);

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/release`)
        .set('Authorization', 'Bearer token')
        .send(validReleasePayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INSPECTION_REQUIRED');
    });

    it('should return 400 when tasks are incomplete', async () => {
      const woIncompleteTasks = {
        ...mockWorkOrder,
        inspectedBy: 'inspector@test.com',
        inspectedDate: new Date(),
        tasks: [
          { ...mockWorkOrderWithTasks.tasks[0], status: 'COMPLETED' },
          { ...mockWorkOrderWithTasks.tasks[1], status: 'OPEN' },
        ],
      };
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(woIncompleteTasks);

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/release`)
        .set('Authorization', 'Bearer token')
        .send(validReleasePayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('TASKS_INCOMPLETE');
    });

    it('should return 400 with invalid release certificate type', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockInspectedWorkOrder);

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/release`)
        .set('Authorization', 'Bearer token')
        .send({ releaseCertType: 'INVALID_TYPE', releaseCertRef: 'REF-001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when work order not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/workorders/00000000-0000-0000-0000-000000000099/release')
        .set('Authorization', 'Bearer token')
        .send(validReleasePayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ==========================================
  // POST /:id/defer — Defer with MEL/CDL
  // ==========================================
  describe('POST /api/workorders/:id/defer', () => {
    it('should defer an open work order with MEL reference', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrder);
      (mockPrisma.workOrder.update as jest.Mock).mockResolvedValueOnce({
        ...mockWorkOrder,
        status: 'DEFERRED',
        deferralRef: 'MEL-72-001',
        deferralNotes: 'Deferred per MEL Category C - 10 day rectification interval',
      });

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/defer`)
        .set('Authorization', 'Bearer token')
        .send(validDeferPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('DEFERRED');
    });

    it('should return 400 when work order is RELEASED', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockWorkOrder,
        status: 'RELEASED',
      });

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/defer`)
        .set('Authorization', 'Bearer token')
        .send(validDeferPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATE');
    });

    it('should return 400 when deferralRef is missing', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockWorkOrder);

      const response = await request(app)
        .post(`/api/workorders/${mockWorkOrder.id}/defer`)
        .set('Authorization', 'Bearer token')
        .send({ deferralRef: '', deferralNotes: 'Some notes' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when work order not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/workorders/00000000-0000-0000-0000-000000000099/defer')
        .set('Authorization', 'Bearer token')
        .send(validDeferPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ==========================================
  // GET /:id/release-cert — Release Certificate
  // ==========================================
  describe('GET /api/workorders/:id/release-cert', () => {
    it('should generate release certificate data for a released work order', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(mockReleasedWorkOrder);

      const response = await request(app)
        .get(`/api/workorders/${mockWorkOrder.id}/release-cert`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.certificateType).toBe('EASA_FORM_1');
      expect(response.body.data.certificateRef).toBe('EASA-CRS-2026-001');
      expect(response.body.data.workOrderRef).toBe('WO-2602-0001');
      expect(response.body.data.tasksPerformed).toHaveLength(1);
      expect(response.body.data.totalHours).toBe(1.5);
    });

    it('should return 400 when work order is not released', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockWorkOrder,
        tasks: [],
      });

      const response = await request(app)
        .get(`/api/workorders/${mockWorkOrder.id}/release-cert`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('NOT_RELEASED');
    });

    it('should return 404 when work order not found', async () => {
      (mockPrisma.workOrder.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/workorders/00000000-0000-0000-0000-000000000099/release-cert')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});

describe('Aerospace Work Orders — additional coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/workorders', workordersRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/workorders returns empty list with pagination metadata', async () => {
    (mockPrisma.workOrder.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.workOrder.count as jest.Mock).mockResolvedValueOnce(0);
    const response = await request(app).get('/api/workorders').set('Authorization', 'Bearer token');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(0);
    expect(response.body.meta.total).toBe(0);
  });

  it('POST /api/workorders returns 400 when title is missing', async () => {
    const payload = { aircraftType: 'A320', aircraftReg: 'G-TEST', description: 'Routine check', priority: 'ROUTINE' };
    const response = await request(app)
      .post('/api/workorders')
      .set('Authorization', 'Bearer token')
      .send(payload);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
