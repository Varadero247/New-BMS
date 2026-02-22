import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualTraining: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
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

describe('Quality Training API Routes', () => {
  const mockTraining = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-TRN-2026-001',
    employeeId: 'EMP-001',
    employeeName: 'John Employee',
    department: 'Production',
    position: 'Operator',
    courseName: 'ISO 9001 Quality Awareness',
    trainingType: 'QUALITY_AWARENESS',
    assignedDate: new Date('2026-02-01').toISOString(),
    dueDate: new Date('2026-03-01').toISOString(),
    deliveryMethod: 'ONLINE',
    status: 'ASSIGNED',
    passMark: 75,
    score: null,
    passed: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/training/overdue', () => {
    it('should return overdue training records', async () => {
      mockPrisma.qualTraining.findMany.mockResolvedValue([mockTraining]);
      mockPrisma.qualTraining.count.mockResolvedValue(1);

      const res = await request(app).get('/api/training/overdue');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualTraining.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.qualTraining.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/training/overdue');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/training/stats', () => {
    it('should return training statistics with completion rate', async () => {
      mockPrisma.qualTraining.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);
      mockPrisma.qualTraining.groupBy.mockResolvedValue([
        { trainingType: 'QUALITY_AWARENESS', _count: { id: 20 } },
      ]);

      const res = await request(app).get('/api/training/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('completed');
      expect(res.body.data).toHaveProperty('inProgress');
      expect(res.body.data).toHaveProperty('overdue');
      expect(res.body.data).toHaveProperty('completionRate');
      expect(res.body.data).toHaveProperty('byType');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualTraining.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/training/stats');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/training', () => {
    it('should return list of training records with pagination', async () => {
      mockPrisma.qualTraining.findMany.mockResolvedValue([mockTraining]);
      mockPrisma.qualTraining.count.mockResolvedValue(1);

      const res = await request(app).get('/api/training');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.qualTraining.findMany.mockResolvedValue([mockTraining]);
      mockPrisma.qualTraining.count.mockResolvedValue(1);

      const res = await request(app).get('/api/training?status=ASSIGNED');

      expect(res.status).toBe(200);
    });

    it('should filter by trainingType', async () => {
      mockPrisma.qualTraining.findMany.mockResolvedValue([mockTraining]);
      mockPrisma.qualTraining.count.mockResolvedValue(1);

      const res = await request(app).get('/api/training?trainingType=QUALITY_AWARENESS');

      expect(res.status).toBe(200);
    });

    it('should support search', async () => {
      mockPrisma.qualTraining.findMany.mockResolvedValue([mockTraining]);
      mockPrisma.qualTraining.count.mockResolvedValue(1);

      const res = await request(app).get('/api/training?search=ISO');

      expect(res.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualTraining.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.qualTraining.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/training');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/training', () => {
    const validBody = {
      employeeId: 'EMP-001',
      employeeName: 'John Employee',
      courseName: 'ISO 9001 Quality Awareness',
      trainingType: 'QUALITY_AWARENESS',
      assignedDate: '2026-02-01',
      dueDate: '2026-03-01',
    };

    it('should create a new training record', async () => {
      mockPrisma.qualTraining.count.mockResolvedValue(0);
      mockPrisma.qualTraining.create.mockResolvedValue(mockTraining);

      const res = await request(app).post('/api/training').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/api/training').send({ employeeId: 'EMP-001' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid trainingType', async () => {
      const res = await request(app)
        .post('/api/training')
        .send({ ...validBody, trainingType: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualTraining.count.mockResolvedValue(0);
      mockPrisma.qualTraining.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/training').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/training/:id/complete', () => {
    const completeBody = {
      score: 85,
      completedDate: '2026-03-01',
      feedback: 'Great course',
    };

    it('should mark training as completed when score >= passMark', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(mockTraining);
      const completed = { ...mockTraining, status: 'COMPLETED', score: 85, passed: true };
      mockPrisma.qualTraining.update.mockResolvedValue(completed);

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
        .send(completeBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should mark training as failed when score < passMark', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue({ ...mockTraining, passMark: 80 });
      const failed = { ...mockTraining, status: 'FAILED', score: 70, passed: false };
      mockPrisma.qualTraining.update.mockResolvedValue(failed);

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
        .send({ score: 70 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when training record not found', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000099/complete')
        .send(completeBody);

      expect(res.status).toBe(404);
    });

    it('should return 400 for missing score', async () => {
      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
        .send({ feedback: 'No score provided' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(mockTraining);
      mockPrisma.qualTraining.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
        .send(completeBody);

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/training/:id', () => {
    it('should return a single training record', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(mockTraining);

      const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when training record not found', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualTraining.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/training/:id', () => {
    it('should update a training record', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(mockTraining);
      const updated = { ...mockTraining, status: 'IN_PROGRESS' };
      mockPrisma.qualTraining.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001')
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when training record not found', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000099')
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(mockTraining);
      mockPrisma.qualTraining.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/training/00000000-0000-0000-0000-000000000001')
        .send({ courseName: 'Updated' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/training/:id', () => {
    it('should soft delete a training record', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(mockTraining);
      mockPrisma.qualTraining.update.mockResolvedValue({ ...mockTraining, deletedAt: new Date() });

      const res = await request(app).delete('/api/training/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });

    it('should return 404 when training record not found', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/training/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualTraining.findFirst.mockResolvedValue(mockTraining);
      mockPrisma.qualTraining.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/training/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });
});

describe('Quality Training API Routes — additional edge cases', () => {
  const mockTrainingRecord = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-TRN-2026-001',
    employeeId: 'EMP-001',
    employeeName: 'Jane Employee',
    department: 'Quality',
    position: 'Analyst',
    courseName: 'ISO 14001 Awareness',
    trainingType: 'PROCEDURE_TRAINING',
    assignedDate: new Date('2026-02-01').toISOString(),
    dueDate: new Date('2026-04-01').toISOString(),
    deliveryMethod: 'CLASSROOM',
    status: 'ASSIGNED',
    passMark: 70,
    score: null,
    passed: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/training — supports department filter param', async () => {
    mockPrisma.qualTraining.findMany.mockResolvedValue([mockTrainingRecord]);
    mockPrisma.qualTraining.count.mockResolvedValue(1);

    const res = await request(app).get('/api/training?department=Quality');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/training/stats — completionRate is 0 when total is 0', async () => {
    mockPrisma.qualTraining.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    mockPrisma.qualTraining.groupBy.mockResolvedValue([]);

    const res = await request(app).get('/api/training/stats');

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.completionRate).toBe(0);
  });

  it('POST /api/training — missing employeeName returns 400', async () => {
    const res = await request(app).post('/api/training').send({
      employeeId: 'EMP-002',
      courseName: 'ISO 45001 Awareness',
      trainingType: 'QUALITY_AWARENESS',
      assignedDate: '2026-02-01',
      dueDate: '2026-03-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
