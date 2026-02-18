import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualContinuousImprovement: {
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

import ciRouter from '../src/routes/ci';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as any;

const app = express();
app.use(express.json());
app.use('/api/ci', ciRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Quality Continuous Improvement (CI) API Routes', () => {
  const mockCI = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-CI-2026-001',
    title: 'Reduce defect rate in assembly',
    description: 'Current defect rate is 3%, target is 1%',
    source: 'AUDIT',
    category: 'Manufacturing',
    priority: 'HIGH',
    submittedBy: 'John Quality',
    department: 'Production',
    assignedTo: 'Jane Engineer',
    status: 'IDEA',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/ci/stats', () => {
    it('should return CI statistics', async () => {
      mockPrisma.qualContinuousImprovement.count
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(3);
      mockPrisma.qualContinuousImprovement.groupBy.mockResolvedValue([
        { priority: 'HIGH', _count: { id: 8 } },
      ]);

      const res = await request(app).get('/api/ci/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('ideas');
      expect(res.body.data).toHaveProperty('approved');
      expect(res.body.data).toHaveProperty('inProgress');
      expect(res.body.data).toHaveProperty('completed');
      expect(res.body.data).toHaveProperty('byPriority');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualContinuousImprovement.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/ci/stats');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/ci', () => {
    it('should return list of continuous improvements with pagination', async () => {
      mockPrisma.qualContinuousImprovement.findMany.mockResolvedValue([mockCI]);
      mockPrisma.qualContinuousImprovement.count.mockResolvedValue(1);

      const res = await request(app).get('/api/ci');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.qualContinuousImprovement.findMany.mockResolvedValue([mockCI]);
      mockPrisma.qualContinuousImprovement.count.mockResolvedValue(1);

      const res = await request(app).get('/api/ci?status=IDEA');

      expect(res.status).toBe(200);
    });

    it('should filter by priority', async () => {
      mockPrisma.qualContinuousImprovement.findMany.mockResolvedValue([mockCI]);
      mockPrisma.qualContinuousImprovement.count.mockResolvedValue(1);

      const res = await request(app).get('/api/ci?priority=HIGH');

      expect(res.status).toBe(200);
    });

    it('should support search', async () => {
      mockPrisma.qualContinuousImprovement.findMany.mockResolvedValue([mockCI]);
      mockPrisma.qualContinuousImprovement.count.mockResolvedValue(1);

      const res = await request(app).get('/api/ci?search=defect');

      expect(res.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualContinuousImprovement.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.qualContinuousImprovement.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/ci');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/ci', () => {
    const validBody = {
      title: 'Reduce defect rate',
      description: 'Defect rate reduction initiative',
      priority: 'HIGH',
    };

    it('should create a new CI item', async () => {
      mockPrisma.qualContinuousImprovement.count.mockResolvedValue(0);
      mockPrisma.qualContinuousImprovement.create.mockResolvedValue(mockCI);

      const res = await request(app).post('/api/ci').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/api/ci').send({ title: 'Missing description' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid priority', async () => {
      const res = await request(app)
        .post('/api/ci')
        .send({ ...validBody, priority: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualContinuousImprovement.count.mockResolvedValue(0);
      mockPrisma.qualContinuousImprovement.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/ci').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/ci/:id', () => {
    it('should return a single CI item', async () => {
      mockPrisma.qualContinuousImprovement.findFirst.mockResolvedValue(mockCI);

      const res = await request(app).get('/api/ci/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when CI item not found', async () => {
      mockPrisma.qualContinuousImprovement.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/ci/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualContinuousImprovement.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/ci/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/ci/:id', () => {
    it('should update a CI item', async () => {
      mockPrisma.qualContinuousImprovement.findFirst.mockResolvedValue(mockCI);
      const updated = { ...mockCI, status: 'APPROVED' };
      mockPrisma.qualContinuousImprovement.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/ci/00000000-0000-0000-0000-000000000001')
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when CI item not found', async () => {
      mockPrisma.qualContinuousImprovement.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/ci/00000000-0000-0000-0000-000000000099')
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualContinuousImprovement.findFirst.mockResolvedValue(mockCI);
      mockPrisma.qualContinuousImprovement.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/ci/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/ci/:id', () => {
    it('should soft delete a CI item', async () => {
      mockPrisma.qualContinuousImprovement.findFirst.mockResolvedValue(mockCI);
      mockPrisma.qualContinuousImprovement.update.mockResolvedValue({
        ...mockCI,
        deletedAt: new Date(),
      });

      const res = await request(app).delete('/api/ci/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });

    it('should return 404 when CI item not found', async () => {
      mockPrisma.qualContinuousImprovement.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/ci/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualContinuousImprovement.findFirst.mockResolvedValue(mockCI);
      mockPrisma.qualContinuousImprovement.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/ci/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });
});
