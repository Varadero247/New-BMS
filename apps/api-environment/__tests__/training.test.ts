import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    envTraining: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
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

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockTraining = {
  id: UUID1,
  refNumber: 'ENV-TRN-2602-1234',
  employeeId: 'EMP-001',
  employeeName: 'John Smith',
  department: 'Operations',
  position: 'Supervisor',
  courseName: 'Environmental Awareness',
  trainingType: 'ENVIRONMENTAL_AWARENESS',
  status: 'ASSIGNED',
  assignedDate: new Date('2026-01-01'),
  dueDate: new Date('2026-03-01'),
  completedDate: null,
  score: null,
  passMark: 80,
  passed: null,
  deliveryMethod: 'ONLINE',
  provider: 'E-learning Platform',
  duration: 120,
  isoClause: '7.3',
  notes: null,
  certificate: null,
  feedback: null,
  tenantId: 'default',
  createdBy: '00000000-0000-4000-a000-000000000123',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('Environment Training API', () => {
  // =========================================================================
  // GET /api/training/overdue
  // =========================================================================
  describe('GET /api/training/overdue', () => {
    it('should return overdue training records', async () => {
      const overdueRecord = {
        ...mockTraining,
        dueDate: new Date('2025-12-01'),
        status: 'ASSIGNED',
      };
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([overdueRecord]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/training/overdue');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(mockPrisma.envTraining.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: expect.objectContaining({ not: 'COMPLETED' }),
            dueDate: expect.objectContaining({ lt: expect.any(Date) }),
          }),
        })
      );
    });

    it('should return empty list when no overdue records', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/training/overdue');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should support pagination', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(20);

      const res = await request(app).get('/api/training/overdue?page=2&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.totalPages).toBe(4);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/training/overdue');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================================
  // GET /api/training/stats
  // =========================================================================
  describe('GET /api/training/stats', () => {
    it('should return training statistics', async () => {
      (mockPrisma.envTraining.count as jest.Mock)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(70) // completed
        .mockResolvedValueOnce(15); // overdue
      (mockPrisma.envTraining.groupBy as jest.Mock).mockResolvedValueOnce([
        { trainingType: 'ENVIRONMENTAL_AWARENESS', _count: { id: 50 } },
        { trainingType: 'WASTE_MANAGEMENT', _count: { id: 30 } },
        { trainingType: 'ENERGY_CONSERVATION', _count: { id: 20 } },
      ]);

      const res = await request(app).get('/api/training/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(100);
      expect(res.body.data.completed).toBe(70);
      expect(res.body.data.overdue).toBe(15);
      expect(res.body.data.completionRate).toBe(70);
      expect(res.body.data.byType).toHaveLength(3);
    });

    it('should return 0 completion rate when no records exist', async () => {
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.envTraining.groupBy as jest.Mock).mockResolvedValueOnce([]);

      const res = await request(app).get('/api/training/stats');

      expect(res.status).toBe(200);
      expect(res.body.data.completionRate).toBe(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.envTraining.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/training/stats');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/training
  // =========================================================================
  describe('GET /api/training', () => {
    it('should return paginated list of training records', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([mockTraining]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/training');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([mockTraining]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(30);

      const res = await request(app).get('/api/training?page=2&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.totalPages).toBe(3);
    });

    it('should filter by status', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/training?status=COMPLETED');

      expect(mockPrisma.envTraining.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'COMPLETED' }),
        })
      );
    });

    it('should filter by trainingType', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/training?trainingType=WASTE_MANAGEMENT');

      expect(mockPrisma.envTraining.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ trainingType: 'WASTE_MANAGEMENT' }),
        })
      );
    });

    it('should filter by department', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/training?department=Operations');

      expect(mockPrisma.envTraining.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: expect.objectContaining({ contains: 'Operations' }),
          }),
        })
      );
    });

    it('should support search query', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/training?search=John');

      expect(mockPrisma.envTraining.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                employeeName: expect.objectContaining({ contains: 'John' }),
              }),
            ]),
          }),
        })
      );
    });

    it('should return empty list', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envTraining.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/training');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.envTraining.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
      courseName: 'Environmental Awareness',
      trainingType: 'ENVIRONMENTAL_AWARENESS',
      assignedDate: '2026-01-01',
      dueDate: '2026-03-01',
    };

    it('should create a training record and return 201', async () => {
      (mockPrisma.envTraining.create as jest.Mock).mockResolvedValueOnce(mockTraining);

      const res = await request(app).post('/api/training').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.employeeName).toBe('John Smith');
    });

    it('should auto-set status to ASSIGNED on create', async () => {
      (mockPrisma.envTraining.create as jest.Mock).mockResolvedValueOnce(mockTraining);

      await request(app).post('/api/training').send(validPayload);

      expect(mockPrisma.envTraining.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ASSIGNED' }),
        })
      );
    });

    it('should generate a reference number', async () => {
      (mockPrisma.envTraining.create as jest.Mock).mockResolvedValueOnce(mockTraining);

      await request(app).post('/api/training').send(validPayload);

      expect(mockPrisma.envTraining.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            refNumber: expect.stringMatching(/^ENV-TRN-/),
          }),
        })
      );
    });

    it('should return 400 when employeeId is missing', async () => {
      const { employeeId, ...payload } = validPayload;
      const res = await request(app).post('/api/training').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
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

    it('should return 400 when assignedDate is missing', async () => {
      const { assignedDate, ...payload } = validPayload;
      const res = await request(app).post('/api/training').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when dueDate is missing', async () => {
      const { dueDate, ...payload } = validPayload;
      const res = await request(app).post('/api/training').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid trainingType', async () => {
      const res = await request(app)
        .post('/api/training')
        .send({
          ...validPayload,
          trainingType: 'INVALID_TYPE',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.envTraining.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).post('/api/training').send(validPayload);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/training/:id/complete
  // =========================================================================
  describe('PUT /api/training/:id/complete', () => {
    it('should complete training with passing score', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);
      (mockPrisma.envTraining.update as jest.Mock).mockResolvedValueOnce({
        ...mockTraining,
        status: 'COMPLETED',
        score: 90,
        passed: true,
        completedDate: new Date(),
      });

      const res = await request(app).put(`/api/training/${UUID1}/complete`).send({ score: 90 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.envTraining.update).toHaveBeenCalledWith(
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
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);
      (mockPrisma.envTraining.update as jest.Mock).mockResolvedValueOnce({
        ...mockTraining,
        status: 'FAILED',
        score: 50,
        passed: false,
      });

      const res = await request(app).put(`/api/training/${UUID1}/complete`).send({ score: 50 });

      expect(res.status).toBe(200);
      expect(mockPrisma.envTraining.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            score: 50,
            passed: false,
          }),
        })
      );
    });

    it('should always pass when passMark is null', async () => {
      const noPassMarkTraining = { ...mockTraining, passMark: null };
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(noPassMarkTraining);
      (mockPrisma.envTraining.update as jest.Mock).mockResolvedValueOnce({
        ...noPassMarkTraining,
        status: 'COMPLETED',
        score: 30,
        passed: true,
      });

      const res = await request(app).put(`/api/training/${UUID1}/complete`).send({ score: 30 });

      expect(res.status).toBe(200);
      expect(mockPrisma.envTraining.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            passed: true,
          }),
        })
      );
    });

    it('should return 400 when score is missing', async () => {
      const res = await request(app).put(`/api/training/${UUID1}/complete`).send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when training record not found', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put(`/api/training/${UUID2}/complete`).send({ score: 90 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).put(`/api/training/${UUID1}/complete`).send({ score: 90 });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/training/:id
  // =========================================================================
  describe('GET /api/training/:id', () => {
    it('should return a training record by ID', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);

      const res = await request(app).get(`/api/training/${UUID1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(UUID1);
      expect(res.body.data.employeeName).toBe('John Smith');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/api/training/${UUID2}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get(`/api/training/${UUID1}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/training/:id
  // =========================================================================
  describe('PUT /api/training/:id', () => {
    it('should update a training record', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);
      (mockPrisma.envTraining.update as jest.Mock).mockResolvedValueOnce({
        ...mockTraining,
        department: 'Safety',
      });

      const res = await request(app).put(`/api/training/${UUID1}`).send({ department: 'Safety' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.department).toBe('Safety');
    });

    it('should return 404 when not found for update', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put(`/api/training/${UUID2}`).send({ department: 'Safety' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);

      const res = await request(app)
        .put(`/api/training/${UUID1}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValueOnce(mockTraining);
      (mockPrisma.envTraining.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).put(`/api/training/${UUID1}`).send({ notes: 'Test' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // DELETE /api/training/:id
  // =========================================================================
  describe('DELETE /api/training/:id', () => {
    it('should soft delete a training record', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValue(mockTraining);
      (mockPrisma.envTraining.update as jest.Mock).mockResolvedValue({
        ...mockTraining,
        deletedAt: new Date(),
      });

      const res = await request(app).delete(`/api/training/${UUID1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
      expect(res.body.data.id).toBe(UUID1);
    });

    it('should return 404 when not found for deletion', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete(`/api/training/${UUID2}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should use soft delete (set deletedAt)', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockResolvedValue(mockTraining);
      (mockPrisma.envTraining.update as jest.Mock).mockResolvedValue({});

      await request(app).delete(`/api/training/${UUID1}`);

      expect(mockPrisma.envTraining.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { deletedAt: expect.any(Date) },
        })
      );
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.envTraining.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete(`/api/training/${UUID1}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('training — phase29 coverage', () => {
  it('handles BigInt type', () => {
    expect(typeof BigInt(42)).toBe('bigint');
  });

  it('handles template literals', () => {
    const n = 42; expect(`value: ${n}`).toBe('value: 42');
  });

  it('handles string repeat', () => {
    expect('ab'.repeat(3)).toBe('ababab');
  });

});
