import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aeroConfigBaseline: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

jest.mock('@ims/service-auth', () => ({
  scopeToUser: (_req: any, _res: any, next: any) => next(),
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import router from '../src/routes/baselines';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/baselines', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Aerospace Configuration Baselines API', () => {
  // =============================================
  // GET / - List baselines
  // =============================================
  describe('GET /api/baselines', () => {
    it('should return paginated list of baselines', async () => {
      mockPrisma.aeroConfigBaseline.findMany.mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000001',
          refNumber: 'AERO-BL-2026-001',
          title: 'Functional Baseline',
          baselineType: 'FUNCTIONAL',
          status: 'DRAFT',
        },
      ]);
      mockPrisma.aeroConfigBaseline.count.mockResolvedValueOnce(1);

      const res = await request(app).get('/api/baselines').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('should filter by status', async () => {
      mockPrisma.aeroConfigBaseline.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroConfigBaseline.count.mockResolvedValueOnce(0);

      await request(app).get('/api/baselines?status=APPROVED').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroConfigBaseline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'APPROVED' }) })
      );
    });

    it('should filter by baselineType', async () => {
      mockPrisma.aeroConfigBaseline.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroConfigBaseline.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/baselines?baselineType=PRODUCT')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroConfigBaseline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ baselineType: 'PRODUCT' }) })
      );
    });

    it('should support search', async () => {
      mockPrisma.aeroConfigBaseline.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroConfigBaseline.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/baselines?search=functional')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroConfigBaseline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroConfigBaseline.findMany.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/baselines').set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // GET /:id
  // =============================================
  describe('GET /api/baselines/:id', () => {
    it('should return a single baseline', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-BL-2026-001',
        title: 'Functional Baseline',
        deletedAt: null,
      });

      const res = await request(app)
        .get('/api/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/baselines/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .get('/api/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // POST / - Create baseline
  // =============================================
  describe('POST /api/baselines', () => {
    const validPayload = { title: 'Allocated Baseline', program: 'JSF', baselineType: 'ALLOCATED' };

    it('should create a baseline successfully', async () => {
      mockPrisma.aeroConfigBaseline.count.mockResolvedValueOnce(2);
      mockPrisma.aeroConfigBaseline.create.mockResolvedValueOnce({
        id: 'b-new',
        refNumber: 'AERO-BL-2026-003',
        ...validPayload,
        status: 'DRAFT',
      });

      const res = await request(app)
        .post('/api/baselines')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/baselines')
        .set('Authorization', 'Bearer token')
        .send({ program: 'JSF' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid baselineType', async () => {
      const res = await request(app)
        .post('/api/baselines')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', baselineType: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroConfigBaseline.count.mockResolvedValueOnce(0);
      mockPrisma.aeroConfigBaseline.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/baselines')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id - Update baseline
  // =============================================
  describe('PUT /api/baselines/:id', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      effectiveDate: null,
      approvedDate: null,
      deletedAt: null,
    };

    it('should update a baseline successfully', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroConfigBaseline.update.mockResolvedValueOnce({
        ...existing,
        status: 'APPROVED',
      });

      const res = await request(app)
        .put('/api/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'APPROVED' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/baselines/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ status: 'APPROVED' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status enum', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'APPROVED' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // DELETE /:id - Soft delete
  // =============================================
  describe('DELETE /api/baselines/:id', () => {
    it('should soft-delete a baseline', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroConfigBaseline.update.mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
      expect(mockPrisma.aeroConfigBaseline.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/baselines/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when already deleted', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .delete('/api/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // PUT /:id/approve - Approve baseline
  // =============================================
  describe('PUT /api/baselines/:id/approve', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'UNDER_REVIEW',
      notes: null,
      deletedAt: null,
    };

    it('should approve a baseline', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroConfigBaseline.update.mockResolvedValueOnce({
        ...existing,
        status: 'APPROVED',
        approvedBy: 'John',
      });

      const res = await request(app)
        .put('/api/baselines/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvedBy: 'John', approvalNotes: 'Reviewed and approved' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/baselines/00000000-0000-0000-0000-000000000099/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvedBy: 'John' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when approvedBy is missing', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/baselines/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroConfigBaseline.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/baselines/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({ approvedBy: 'John' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
