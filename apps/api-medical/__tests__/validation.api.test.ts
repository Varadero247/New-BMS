import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    designValidation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    designProject: {
      findUnique: jest.fn(),
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

jest.mock('@ims/service-auth', () => ({
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import validationRouter from '../src/routes/validation';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/validation', validationRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Medical Design Validation API Routes', () => {
  const mockProject = {
    id: 'project-uuid-1',
    projectCode: 'PRJ-001',
    title: 'Device A Project',
    status: 'ACTIVE',
  };

  const mockValidation = {
    id: '00000000-0000-0000-0000-000000000001',
    projectId: 'project-uuid-1',
    title: 'Clinical Performance Validation',
    protocol: 'Protocol V1.0',
    testMethod: 'Clinical trial phase II',
    intendedUseConfirmed: false,
    results: null,
    pass: null,
    completedDate: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    project: mockProject,
  };

  describe('GET /api/validation', () => {
    it('should return list of design validations with pagination', async () => {
      mockPrisma.designValidation.findMany.mockResolvedValue([mockValidation]);
      mockPrisma.designValidation.count.mockResolvedValue(1);

      const res = await request(app).get('/api/validation');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should filter by projectId', async () => {
      mockPrisma.designValidation.findMany.mockResolvedValue([mockValidation]);
      mockPrisma.designValidation.count.mockResolvedValue(1);

      const res = await request(app).get('/api/validation?projectId=project-uuid-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by pass status', async () => {
      mockPrisma.designValidation.findMany.mockResolvedValue([]);
      mockPrisma.designValidation.count.mockResolvedValue(0);

      const res = await request(app).get('/api/validation?pass=true');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support search', async () => {
      mockPrisma.designValidation.findMany.mockResolvedValue([mockValidation]);
      mockPrisma.designValidation.count.mockResolvedValue(1);

      const res = await request(app).get('/api/validation?search=clinical');

      expect(res.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designValidation.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.designValidation.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/validation');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/validation/stats', () => {
    it('should return validation statistics', async () => {
      mockPrisma.designValidation.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(5);

      const res = await request(app).get('/api/validation/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('passed');
      expect(res.body.data).toHaveProperty('failed');
      expect(res.body.data).toHaveProperty('pending');
      expect(res.body.data).toHaveProperty('passRate');
    });

    it('should return 0 passRate when no validations', async () => {
      mockPrisma.designValidation.count.mockResolvedValue(0);

      const res = await request(app).get('/api/validation/stats');

      expect(res.status).toBe(200);
      expect(res.body.data.passRate).toBe(0);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designValidation.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/validation/stats');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/validation/:id', () => {
    it('should return a single design validation', async () => {
      mockPrisma.designValidation.findUnique.mockResolvedValue(mockValidation);

      const res = await request(app).get('/api/validation/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when validation not found', async () => {
      mockPrisma.designValidation.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/validation/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designValidation.findUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/validation/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/validation', () => {
    const validBody = {
      projectId: 'project-uuid-1',
      title: 'Clinical Performance Validation',
      testMethod: 'Clinical trial phase II',
    };

    it('should create a new design validation', async () => {
      mockPrisma.designProject.findUnique.mockResolvedValue(mockProject);
      mockPrisma.designValidation.create.mockResolvedValue(mockValidation);

      const res = await request(app).post('/api/validation').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when project not found', async () => {
      mockPrisma.designProject.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/api/validation').send(validBody);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app).post('/api/validation').send({ projectId: 'project-uuid-1' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designProject.findUnique.mockResolvedValue(mockProject);
      mockPrisma.designValidation.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/validation').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/validation/:id', () => {
    it('should update a design validation', async () => {
      mockPrisma.designValidation.findUnique.mockResolvedValue(mockValidation);
      const updated = { ...mockValidation, pass: true, results: 'All tests passed' };
      mockPrisma.designValidation.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/validation/00000000-0000-0000-0000-000000000001')
        .send({ pass: true, results: 'All tests passed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when validation not found', async () => {
      mockPrisma.designValidation.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/validation/00000000-0000-0000-0000-000000000099')
        .send({ pass: true });

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designValidation.findUnique.mockResolvedValue(mockValidation);
      mockPrisma.designValidation.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/validation/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/validation/:id', () => {
    it('should delete a design validation', async () => {
      mockPrisma.designValidation.findUnique.mockResolvedValue(mockValidation);
      mockPrisma.designValidation.delete.mockResolvedValue(mockValidation);

      const res = await request(app).delete('/api/validation/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(204);
    });

    it('should return 404 when validation not found', async () => {
      mockPrisma.designValidation.findUnique.mockResolvedValue(null);

      const res = await request(app).delete('/api/validation/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.designValidation.findUnique.mockResolvedValue(mockValidation);
      mockPrisma.designValidation.delete.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/validation/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });

  describe('Medical Design Validation — extended coverage', () => {
    it('GET /api/validation returns correct totalPages in meta', async () => {
      mockPrisma.designValidation.findMany.mockResolvedValue([]);
      mockPrisma.designValidation.count.mockResolvedValue(20);
      const res = await request(app).get('/api/validation?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.meta.totalPages).toBe(4);
    });

    it('GET /api/validation passes skip based on page and limit to findMany', async () => {
      mockPrisma.designValidation.findMany.mockResolvedValue([]);
      mockPrisma.designValidation.count.mockResolvedValue(0);
      await request(app).get('/api/validation?page=3&limit=5');
      expect(mockPrisma.designValidation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 })
      );
    });

    it('GET /api/validation filters by projectId wired to Prisma where', async () => {
      mockPrisma.designValidation.findMany.mockResolvedValue([]);
      mockPrisma.designValidation.count.mockResolvedValue(0);
      await request(app).get('/api/validation?projectId=project-uuid-1');
      expect(mockPrisma.designValidation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ projectId: 'project-uuid-1' }) })
      );
    });

    it('POST /api/validation returns 400 for missing testMethod', async () => {
      mockPrisma.designProject.findUnique.mockResolvedValue(mockProject);
      const res = await request(app).post('/api/validation').send({
        projectId: 'project-uuid-1', title: 'Validation without method',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/validation returns 500 on DB create error with success:false', async () => {
      mockPrisma.designProject.findUnique.mockResolvedValue(mockProject);
      mockPrisma.designValidation.create.mockRejectedValue(new Error('DB error'));
      const res = await request(app).post('/api/validation').send({
        projectId: 'project-uuid-1', title: 'Test', testMethod: 'Clinical',
      });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('PUT /api/validation/:id returns updated pass:true in response', async () => {
      mockPrisma.designValidation.findUnique.mockResolvedValue(mockValidation);
      mockPrisma.designValidation.update.mockResolvedValue({ ...mockValidation, pass: true });
      const res = await request(app)
        .put('/api/validation/00000000-0000-0000-0000-000000000001')
        .send({ pass: true });
      expect(res.status).toBe(200);
      expect(res.body.data.pass).toBe(true);
    });

    it('GET /api/validation/stats passRate is 100 when all validations pass', async () => {
      mockPrisma.designValidation.count
        .mockResolvedValueOnce(5)  // total
        .mockResolvedValueOnce(5)  // passed
        .mockResolvedValueOnce(0)  // failed
        .mockResolvedValueOnce(0)  // pending
        .mockResolvedValueOnce(0); // with_project
      const res = await request(app).get('/api/validation/stats');
      expect(res.status).toBe(200);
      expect(res.body.data.passRate).toBe(100);
    });

    it('GET /api/validation/stats returns 500 on DB error with success:false', async () => {
      mockPrisma.designValidation.count.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/validation/stats');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
