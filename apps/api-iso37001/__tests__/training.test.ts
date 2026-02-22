import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    abTrainingRecord: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import trainingRouter from '../src/routes/training';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/training', trainingRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockTraining = {
  id: '00000000-0000-0000-0000-000000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  employeeId: 'EMP-001',
  employeeName: 'John Smith',
  department: 'Finance',
  courseName: 'Anti-Bribery Awareness',
  courseType: 'GENERAL_AWARENESS',
  status: 'ASSIGNED',
  assignedDate: '2026-01-01',
  dueDate: '2026-03-01',
  completedDate: null,
  score: null,
  passMark: 80,
  referenceNumber: 'AB-TRN-2602-1234',
  updatedBy: 'user-123',
  passed: null,
  notes: null,
  position: null,
  deliveryMethod: null,
  duration: null,
  provider: null,
  certificate: null,
  feedback: null,
};

const mockTraining2 = {
  ...mockTraining,
  id: '00000000-0000-0000-0000-000000000002',
  employeeName: 'Jane Doe',
  department: 'Legal',
  courseName: 'Annual Refresher',
  courseType: 'REFRESHER',
  status: 'COMPLETED',
  score: 92,
  passed: true,
  referenceNumber: 'AB-TRN-2602-5678',
};

const mockOverdueTraining = {
  ...mockTraining,
  id: '00000000-0000-0000-0000-000000000003',
  dueDate: '2025-12-01',
  status: 'ASSIGNED',
  referenceNumber: 'AB-TRN-2602-9012',
};

describe('ISO 37001 Training API', () => {
  // =========================================================================
  // GET /api/training
  // =========================================================================
  describe('GET /api/training', () => {
    it('should return paginated list of training records', async () => {
      (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockResolvedValueOnce([
        mockTraining,
        mockTraining2,
      ]);
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockResolvedValueOnce(2);

      const res = await request(app).get('/api/training');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockResolvedValueOnce([mockTraining]);
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockResolvedValueOnce(30);

      const res = await request(app).get('/api/training?page=2&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.totalPages).toBe(3);
    });

    it('should filter by status', async () => {
      (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockResolvedValueOnce([mockTraining2]);
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/training?status=COMPLETED');

      expect(mockPrisma.abTrainingRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'COMPLETED' }),
        })
      );
    });

    it('should filter by department', async () => {
      (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockResolvedValueOnce([mockTraining]);
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/training?department=Finance');

      expect(mockPrisma.abTrainingRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: expect.objectContaining({ contains: 'Finance' }),
          }),
        })
      );
    });

    it('should filter by courseType', async () => {
      (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockResolvedValueOnce([mockTraining]);
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/training?courseType=GENERAL_AWARENESS');

      expect(mockPrisma.abTrainingRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ courseType: 'GENERAL_AWARENESS' }),
        })
      );
    });

    it('should return empty list', async () => {
      (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/training');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/training');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /api/training
  // =========================================================================
  describe('POST /api/training', () => {
    const validPayload = {
      employeeId: 'EMP-001',
      employeeName: 'John Smith',
      courseName: 'Anti-Bribery Awareness',
      courseType: 'GENERAL_AWARENESS',
      assignedDate: '2026-01-01',
      dueDate: '2026-03-01',
    };

    it('should create a training record and return 201', async () => {
      (mockPrisma.abTrainingRecord.create as jest.Mock).mockResolvedValueOnce(mockTraining);

      const res = await request(app).post('/api/training').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeName).toBe('John Smith');
    });

    it('should return 400 when employeeId is missing', async () => {
      const { employeeId, ...payload } = validPayload;
      const res = await request(app).post('/api/training').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when employeeName is missing', async () => {
      const { employeeName, ...payload } = validPayload;
      const res = await request(app).post('/api/training').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when courseName is missing', async () => {
      const { courseName, ...payload } = validPayload;
      const res = await request(app).post('/api/training').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when courseType is invalid', async () => {
      const res = await request(app)
        .post('/api/training')
        .send({
          ...validPayload,
          courseType: 'INVALID_TYPE',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database create error', async () => {
      (mockPrisma.abTrainingRecord.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).post('/api/training').send(validPayload);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/training/:id
  // =========================================================================
  describe('GET /api/training/:id', () => {
    it('should return a training record by ID', async () => {
      (mockPrisma.abTrainingRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);

      const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.abTrainingRecord.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/training/:id
  // =========================================================================
  describe('PUT /api/training/:id', () => {
    it('should update a training record', async () => {
      (mockPrisma.abTrainingRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);
      (mockPrisma.abTrainingRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockTraining,
        department: 'Compliance',
      });

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001')
        .send({ department: 'Compliance' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.department).toBe('Compliance');
    });

    it('should return 404 when not found for update', async () => {
      (mockPrisma.abTrainingRecord.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000099')
        .send({ department: 'Compliance' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/training/:id/complete
  // =========================================================================
  describe('PUT /api/training/:id/complete', () => {
    it('should complete training with passing score', async () => {
      (mockPrisma.abTrainingRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);
      (mockPrisma.abTrainingRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockTraining,
        status: 'COMPLETED',
        score: 90,
        passed: true,
        completedDate: new Date(),
      });

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
        .send({ score: 90 });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.passed).toBe(true);
      expect(mockPrisma.abTrainingRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            score: 90,
            passed: true,
          }),
        })
      );
    });

    it('should mark as FAILED when score below passMark', async () => {
      (mockPrisma.abTrainingRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);
      (mockPrisma.abTrainingRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockTraining,
        status: 'FAILED',
        score: 50,
        passed: false,
      });

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
        .send({ score: 50 });

      expect(res.status).toBe(200);
      expect(mockPrisma.abTrainingRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            score: 50,
            passed: false,
          }),
        })
      );
    });

    it('should pass when passMark is null/undefined (no pass requirement)', async () => {
      const noPassMarkTraining = { ...mockTraining, passMark: null };
      (mockPrisma.abTrainingRecord.findFirst as jest.Mock).mockResolvedValueOnce(noPassMarkTraining);
      (mockPrisma.abTrainingRecord.update as jest.Mock).mockResolvedValueOnce({
        ...noPassMarkTraining,
        status: 'COMPLETED',
        score: 30,
        passed: true,
      });

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
        .send({ score: 30 });

      expect(res.status).toBe(200);
      expect(mockPrisma.abTrainingRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            passed: true,
          }),
        })
      );
    });

    it('should return 400 when score is missing', async () => {
      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when not found for completion', async () => {
      (mockPrisma.abTrainingRecord.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000099/complete')
        .send({ score: 90 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/training/overdue
  // =========================================================================
  describe('GET /api/training/overdue', () => {
    it('should return overdue training records', async () => {
      (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockResolvedValueOnce([mockOverdueTraining]);
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/training/overdue');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(mockPrisma.abTrainingRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: expect.objectContaining({ not: 'COMPLETED' }),
            dueDate: expect.objectContaining({ lt: expect.any(Date) }),
          }),
        })
      );
    });

    it('should return empty list when no overdue records', async () => {
      (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/training/overdue');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  // =========================================================================
  // GET /api/training/stats
  // =========================================================================
  describe('GET /api/training/stats', () => {
    it('should return training completion statistics', async () => {
      (mockPrisma.abTrainingRecord.count as jest.Mock)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60) // completed
        .mockResolvedValueOnce(20) // inProgress
        .mockResolvedValueOnce(10); // overdue
      (mockPrisma.abTrainingRecord.groupBy as jest.Mock).mockResolvedValueOnce([
        { courseType: 'GENERAL_AWARENESS', _count: { id: 50 } },
        { courseType: 'ROLE_SPECIFIC', _count: { id: 30 } },
      ]);

      const res = await request(app).get('/api/training/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(100);
      expect(res.body.data.completed).toBe(60);
      expect(res.body.data.overdue).toBe(10);
      expect(res.body.data.inProgress).toBe(20);
      expect(res.body.data.completionRate).toBe(60);
      expect(res.body.data.byType).toHaveLength(2);
    });

    it('should return 0 completion rate when no records exist', async () => {
      (mockPrisma.abTrainingRecord.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (mockPrisma.abTrainingRecord.groupBy as jest.Mock).mockResolvedValueOnce([]);

      const res = await request(app).get('/api/training/stats');

      expect(res.status).toBe(200);
      expect(res.body.data.completionRate).toBe(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abTrainingRecord.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/training/stats');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});

// ===================================================================
// ISO 37001 Training — additional response shape coverage
// ===================================================================
describe('ISO 37001 Training — additional response shape coverage', () => {
  it('GET /api/training returns success:true and pagination on success', async () => {
    (mockPrisma.abTrainingRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.abTrainingRecord.count as jest.Mock).mockResolvedValueOnce(0);

    const res = await request(app).get('/api/training');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('PUT /:id returns 500 on database update error', async () => {
    (mockPrisma.abTrainingRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);
    (mockPrisma.abTrainingRecord.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001')
      .send({ department: 'Finance' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
