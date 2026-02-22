import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualDesignProject: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    qualDesignStageDoc: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    designReview: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  },
  Prisma: { DesignDevelopmentWhereInput: {} },
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
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
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
import designDevRouter from '../src/routes/design-development';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/design-development', designDevRouter);

describe('Design & Development Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/design-development', () => {
    const validBody = {
      title: 'New Product Design',
      productName: 'Widget Pro 2026',
    };

    it('should create a design project', async () => {
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(0);
      const created = {
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'DD-2602-0001',
        ...validBody,
        status: 'DRAFT',
      };
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
        return cb({
          qualDesignProject: {
            create: jest.fn().mockResolvedValue(created),
          },
          qualDesignStageDoc: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const res = await request(app).post('/api/design-development').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app).post('/api/design-development').send({
        productName: 'Widget Pro',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing productName', async () => {
      const res = await request(app).post('/api/design-development').send({
        title: 'New Design',
      });
      expect(res.status).toBe(400);
    });

    it('should accept optional priority', async () => {
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
        return cb({
          qualDesignProject: { create: jest.fn().mockResolvedValue({ id: 'dd-2' }) },
          qualDesignStageDoc: { create: jest.fn().mockResolvedValue({}) },
        });
      });

      const res = await request(app)
        .post('/api/design-development')
        .send({
          ...validBody,
          priority: 'HIGH',
        });
      expect(res.status).toBe(201);
    });

    it('should reject invalid priority', async () => {
      const res = await request(app)
        .post('/api/design-development')
        .send({
          ...validBody,
          priority: 'SUPER_HIGH',
        });
      expect(res.status).toBe(400);
    });

    it('should accept optional dates', async () => {
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
        return cb({
          qualDesignProject: { create: jest.fn().mockResolvedValue({ id: 'dd-3' }) },
          qualDesignStageDoc: { create: jest.fn().mockResolvedValue({}) },
        });
      });

      const res = await request(app)
        .post('/api/design-development')
        .send({
          ...validBody,
          plannedStartDate: '2026-03-01',
          plannedEndDate: '2026-06-30',
        });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/design-development').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/design-development', () => {
    it('should list design projects', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValue([
        { id: '00000000-0000-0000-0000-000000000001', title: 'Project A' },
      ]);
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/design-development');
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(100);

      const res = await request(app).get('/api/design-development?page=3&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(3);
      expect(res.body.data.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/design-development?status=ACTIVE');
      expect(mockPrisma.qualDesignProject.findMany).toHaveBeenCalled();
    });

    it('should support search', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/design-development?search=Widget');
      expect(mockPrisma.qualDesignProject.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.qualDesignProject.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/design-development');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/design-development/:id', () => {
    it('should get project by id', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Project',
        deletedAt: null,
      });
      (mockPrisma.qualDesignStageDoc.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get(
        '/api/design-development/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for not found', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get(
        '/api/design-development/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app).get(
        '/api/design-development/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/design-development/:id', () => {
    it('should update a design project', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.qualDesignProject.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'ACTIVE',
      });

      const res = await request(app)
        .put('/api/design-development/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'ACTIVE',
        });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent project', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/design-development/00000000-0000-0000-0000-000000000099')
        .send({
          status: 'ACTIVE',
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .put('/api/design-development/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'INVALID',
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid priority', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .put('/api/design-development/00000000-0000-0000-0000-000000000001')
        .send({
          priority: 'SUPER_HIGH',
        });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/design-development/:id', () => {
    it('should soft-delete a design project', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.qualDesignProject.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app).delete(
        '/api/design-development/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete(
        '/api/design-development/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/design-development/:id/stages/:stage/submit', () => {
    it('should submit a stage for review', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.qualDesignStageDoc.findFirst as jest.Mock).mockResolvedValue({
        id: 'ds-1',
        status: 'IN_PROGRESS',
      });
      (mockPrisma.qualDesignStageDoc.update as jest.Mock).mockResolvedValue({
        id: 'ds-1',
        status: 'SUBMITTED',
      });

      const res = await request(app)
        .post('/api/design-development/00000000-0000-0000-0000-000000000001/stages/PLANNING/submit')
        .send({
          deliverables: 'Requirements doc',
        });
      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid stage', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post(
          '/api/design-development/00000000-0000-0000-0000-000000000001/stages/INVALID_STAGE/submit'
        )
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent project', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/design-development/00000000-0000-0000-0000-000000000099/stages/PLANNING/submit')
        .send({});
      expect(res.status).toBe(404);
    });

    it('should return 400 for already approved stage', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.qualDesignStageDoc.findFirst as jest.Mock).mockResolvedValue({
        id: 'ds-1',
        status: 'APPROVED',
      });

      const res = await request(app)
        .post('/api/design-development/00000000-0000-0000-0000-000000000001/stages/PLANNING/submit')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/design-development/:id/stages/:stage/approve', () => {
    it('should return 400 for stage not submitted', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.qualDesignStageDoc.findFirst as jest.Mock).mockResolvedValue({
        id: 'ds-1',
        status: 'IN_PROGRESS',
      });

      const res = await request(app)
        .post(
          '/api/design-development/00000000-0000-0000-0000-000000000001/stages/PLANNING/approve'
        )
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid stage', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post(
          '/api/design-development/00000000-0000-0000-0000-000000000001/stages/00000000-0000-0000-0000-000000000099/approve'
        )
        .send({});
      expect(res.status).toBe(400);
    });
  });
});

describe('Design & Development Routes — additional edge cases', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/design-development — response includes totalPages computed correctly', async () => {
    (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(50);

    const res = await request(app).get('/api/design-development?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.data.totalPages).toBe(5);
  });

  it('DELETE /api/design-development/:id — returns 500 on database error during update', async () => {
    (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.qualDesignProject.update as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).delete(
      '/api/design-development/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(500);
  });

  it('PUT /api/design-development/:id — returns 500 on database error during update', async () => {
    (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.qualDesignProject.update as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app)
      .put('/api/design-development/00000000-0000-0000-0000-000000000001')
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(500);
  });
});

describe('Design & Development Routes — final coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / returns success:true with items array', async () => {
    (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/design-development');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('GET / returns correct pagination total', async () => {
    (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(5);
    const res = await request(app).get('/api/design-development');
    expect(res.body.data.total).toBe(5);
  });

  it('PUT /:id returns updated data on success', async () => {
    (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.qualDesignProject.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ON_HOLD',
    });
    const res = await request(app)
      .put('/api/design-development/00000000-0000-0000-0000-000000000001')
      .send({ status: 'ON_HOLD' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id calls update with deletedAt', async () => {
    (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.qualDesignProject.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    await request(app).delete('/api/design-development/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.qualDesignProject.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('POST / creates project and calls transaction', async () => {
    (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      return cb({
        qualDesignProject: { create: jest.fn().mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Product Z' }) },
        qualDesignStageDoc: { create: jest.fn().mockResolvedValue({}) },
      });
    });
    const res = await request(app).post('/api/design-development').send({ title: 'Product Z', productName: 'Widget Z' });
    expect(res.status).toBe(201);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
