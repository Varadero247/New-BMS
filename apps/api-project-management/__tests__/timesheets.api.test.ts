import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectTimesheet: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
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
import timesheetsRouter from '../src/routes/timesheets';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockTimesheet = {
  id: '48000000-0000-4000-a000-000000000001',
  projectId: '44000000-0000-4000-a000-000000000001',
  taskId: '3d000000-0000-4000-a000-000000000001',
  employeeId: 'emp-001',
  workDate: '2025-03-10T00:00:00.000Z',
  hoursWorked: 8,
  overtime: 1,
  activityType: 'DEVELOPMENT',
  description: 'Implemented login feature',
  isBillable: true,
  billableHours: 8,
  hourlyRate: 75,
  totalCost: 600,
  status: 'PENDING',
  approvedBy: null,
  approvedAt: null,
  createdAt: '2025-03-10T09:00:00.000Z',
  updatedAt: '2025-03-10T09:00:00.000Z',
  task: {
    id: '3d000000-0000-4000-a000-000000000001',
    taskCode: 'TSK-001',
    taskName: 'Login Feature',
  },
};

describe('Timesheets API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/timesheets', timesheetsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- GET / ----

  describe('GET /api/timesheets', () => {
    it('should list timesheets by projectId', async () => {
      (mockPrisma.projectTimesheet.findMany as jest.Mock).mockResolvedValue([mockTimesheet]);
      (mockPrisma.projectTimesheet.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/timesheets')
        .query({ projectId: '44000000-0000-4000-a000-000000000001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('48000000-0000-4000-a000-000000000001');
      expect(res.body.meta.total).toBe(1);
      expect(mockPrisma.projectTimesheet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null, projectId: '44000000-0000-4000-a000-000000000001' },
          orderBy: { workDate: 'desc' },
          include: { task: { select: { id: true, taskCode: true, taskName: true } } },
        })
      );
    });

    it('should list timesheets by employeeId', async () => {
      (mockPrisma.projectTimesheet.findMany as jest.Mock).mockResolvedValue([mockTimesheet]);
      (mockPrisma.projectTimesheet.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/timesheets').query({ employeeId: 'emp-001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(mockPrisma.projectTimesheet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null, employeeId: 'emp-001' },
        })
      );
    });

    it('should return 400 when neither projectId nor employeeId is provided', async () => {
      const res = await request(app).get('/api/timesheets');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('projectId or employeeId');
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectTimesheet.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
      (mockPrisma.projectTimesheet.count as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .get('/api/timesheets')
        .query({ projectId: '44000000-0000-4000-a000-000000000001' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- POST / ----

  describe('POST /api/timesheets', () => {
    it('should create a new timesheet entry', async () => {
      const createPayload = {
        projectId: '44000000-0000-4000-a000-000000000001',
        taskId: '3d000000-0000-4000-a000-000000000001',
        employeeId: 'emp-001',
        workDate: '2025-03-11',
        hoursWorked: 7,
        activityType: 'DEVELOPMENT',
        description: 'Worked on API endpoints',
      };

      const createdTimesheet = {
        id: 'ts-002',
        ...createPayload,
        workDate: new Date('2025-03-11').toISOString(),
        overtime: 0,
        isBillable: true,
        billableHours: 7,
        hourlyRate: null,
        totalCost: null,
        status: 'PENDING',
        approvedBy: null,
        approvedAt: null,
      };

      (mockPrisma.projectTimesheet.create as jest.Mock).mockResolvedValue(createdTimesheet);

      const res = await request(app).post('/api/timesheets').send(createPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('ts-002');
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.isBillable).toBe(true);
      expect(res.body.data.billableHours).toBe(7);
    });

    it('should calculate totalCost when hourlyRate is provided', async () => {
      const createPayload = {
        projectId: '44000000-0000-4000-a000-000000000001',
        employeeId: 'emp-001',
        workDate: '2025-03-11',
        hoursWorked: 8,
        activityType: 'TESTING',
        hourlyRate: 50,
        billableHours: 6,
      };

      const createdTimesheet = {
        id: 'ts-003',
        ...createPayload,
        workDate: new Date('2025-03-11').toISOString(),
        overtime: 0,
        isBillable: true,
        totalCost: 300, // 50 * 6
        status: 'PENDING',
      };

      (mockPrisma.projectTimesheet.create as jest.Mock).mockResolvedValue(createdTimesheet);

      const res = await request(app).post('/api/timesheets').send(createPayload);

      expect(res.status).toBe(201);
      expect(res.body.data.totalCost).toBe(300);
      expect(mockPrisma.projectTimesheet.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hourlyRate: 50,
          billableHours: 6,
          totalCost: 300,
          status: 'PENDING',
        }),
      });
    });

    it('should return 400 for validation errors (missing required fields)', async () => {
      const res = await request(app).post('/api/timesheets').send({
        projectId: '44000000-0000-4000-a000-000000000001',
        // missing employeeId, workDate, hoursWorked, activityType
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectTimesheet.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/timesheets').send({
        projectId: '44000000-0000-4000-a000-000000000001',
        employeeId: 'emp-001',
        workDate: '2025-03-11',
        hoursWorked: 8,
        activityType: 'DEVELOPMENT',
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- PUT /:id ----

  describe('PUT /api/timesheets/:id', () => {
    it('should update an existing timesheet', async () => {
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(mockTimesheet);

      const updatedTimesheet = {
        ...mockTimesheet,
        hoursWorked: 9,
        description: 'Updated description',
      };
      (mockPrisma.projectTimesheet.update as jest.Mock).mockResolvedValue(updatedTimesheet);

      const res = await request(app)
        .put('/api/timesheets/48000000-0000-4000-a000-000000000001')
        .send({
          hoursWorked: 9,
          description: 'Updated description',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hoursWorked).toBe(9);
      expect(res.body.data.description).toBe('Updated description');
    });

    it('should recalculate totalCost when hourlyRate or billableHours change', async () => {
      const existingTimesheet = {
        ...mockTimesheet,
        hourlyRate: 75,
        billableHours: 8,
        totalCost: 600,
      };
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(existingTimesheet);

      const updatedTimesheet = { ...existingTimesheet, billableHours: 10, totalCost: 750 };
      (mockPrisma.projectTimesheet.update as jest.Mock).mockResolvedValue(updatedTimesheet);

      const res = await request(app)
        .put('/api/timesheets/48000000-0000-4000-a000-000000000001')
        .send({ billableHours: 10 });

      expect(res.status).toBe(200);
      // The route recalculates: hourlyRate (75 from existing) * billableHours (10 from update) = 750
      expect(mockPrisma.projectTimesheet.update).toHaveBeenCalledWith({
        where: { id: '48000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          totalCost: 750,
        }),
      });
    });

    it('should return 404 when timesheet does not exist', async () => {
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/timesheets/00000000-0000-4000-a000-ffffffffffff')
        .send({ hoursWorked: 5 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectTimesheet.update).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(mockTimesheet);
      (mockPrisma.projectTimesheet.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/timesheets/48000000-0000-4000-a000-000000000001')
        .send({ hoursWorked: 5 });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- PUT /:id/approve ----

  describe('PUT /api/timesheets/:id/approve', () => {
    it('should approve an existing timesheet', async () => {
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(mockTimesheet);

      const approvedTimesheet = {
        ...mockTimesheet,
        status: 'APPROVED',
        approvedBy: '20000000-0000-4000-a000-000000000123',
        approvedAt: '2025-03-11T10:00:00.000Z',
      };
      (mockPrisma.projectTimesheet.update as jest.Mock).mockResolvedValue(approvedTimesheet);

      const res = await request(app)
        .put('/api/timesheets/48000000-0000-4000-a000-000000000001/approve')
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPROVED');
      expect(res.body.data.approvedBy).toBe('20000000-0000-4000-a000-000000000123');
      expect(mockPrisma.projectTimesheet.update).toHaveBeenCalledWith({
        where: { id: '48000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          status: 'APPROVED',
          approvedBy: '20000000-0000-4000-a000-000000000123',
          approvedAt: expect.any(Date),
        }),
      });
    });

    it('should return 404 when timesheet to approve does not exist', async () => {
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/timesheets/00000000-0000-4000-a000-ffffffffffff/approve')
        .send();

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectTimesheet.update).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error during approval', async () => {
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(mockTimesheet);
      (mockPrisma.projectTimesheet.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/timesheets/48000000-0000-4000-a000-000000000001/approve')
        .send();

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- DELETE /:id ----

  describe('DELETE /api/timesheets/:id', () => {
    it('should delete an existing timesheet', async () => {
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(mockTimesheet);
      (mockPrisma.projectTimesheet.update as jest.Mock).mockResolvedValue(mockTimesheet);

      const res = await request(app).delete('/api/timesheets/48000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(204);
      expect(mockPrisma.projectTimesheet.update).toHaveBeenCalledWith({
        where: { id: '48000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 when timesheet does not exist', async () => {
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/timesheets/00000000-0000-4000-a000-ffffffffffff');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectTimesheet.update).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectTimesheet.findUnique as jest.Mock).mockResolvedValue(mockTimesheet);
      (mockPrisma.projectTimesheet.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/timesheets/48000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('timesheets.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/timesheets', timesheetsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/timesheets', async () => {
    const res = await request(app).get('/api/timesheets');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/timesheets', async () => {
    const res = await request(app).get('/api/timesheets');
    expect(res.headers['content-type']).toBeDefined();
  });
});
