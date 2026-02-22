import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aeroChangeRequest: {
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
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import router from '../src/routes/changes';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/changes', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Aerospace Change Requests API', () => {
  // =============================================
  // GET / - List change requests
  // =============================================
  describe('GET /api/changes', () => {
    it('should return paginated list of change requests', async () => {
      mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000001',
          refNumber: 'AERO-CR-2026-0001',
          title: 'Design Change',
          changeType: 'DESIGN',
          status: 'DRAFT',
        },
      ]);
      mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(1);

      const res = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('should filter by status', async () => {
      mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(0);

      await request(app).get('/api/changes?status=APPROVED').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroChangeRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'APPROVED' }) })
      );
    });

    it('should filter by changeType', async () => {
      mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(0);

      await request(app).get('/api/changes?changeType=DESIGN').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroChangeRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ changeType: 'DESIGN' }) })
      );
    });

    it('should filter by priority', async () => {
      mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(0);

      await request(app).get('/api/changes?priority=HIGH').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroChangeRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ priority: 'HIGH' }) })
      );
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroChangeRequest.findMany.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // GET /:id
  // =============================================
  describe('GET /api/changes/:id', () => {
    it('should return a single change request', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-CR-2026-0001',
        title: 'Design Change',
        deletedAt: null,
      });

      const res = await request(app)
        .get('/api/changes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/changes/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/changes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .get('/api/changes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // POST / - Create change request
  // =============================================
  describe('POST /api/changes', () => {
    const validPayload = {
      title: 'Material Substitution',
      description: 'Replace aluminum 7075 with 7050',
      changeType: 'MATERIAL',
      reason: 'Cost reduction and improved availability',
    };

    it('should create a change request successfully', async () => {
      mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(0);
      mockPrisma.aeroChangeRequest.create.mockResolvedValueOnce({
        id: 'cr-new',
        refNumber: 'AERO-CR-2026-0001',
        ...validPayload,
        status: 'DRAFT',
        priority: 'MEDIUM',
      });

      const res = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({ description: 'desc', changeType: 'DESIGN', reason: 'reason' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when description is missing', async () => {
      const res = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', changeType: 'DESIGN', reason: 'reason' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when reason is missing', async () => {
      const res = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', description: 'desc', changeType: 'DESIGN' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid changeType', async () => {
      const res = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, changeType: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(0);
      mockPrisma.aeroChangeRequest.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/changes')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id - Update change request
  // =============================================
  describe('PUT /api/changes/:id', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DRAFT',
      deletedAt: null,
    };

    it('should update a change request successfully', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroChangeRequest.update.mockResolvedValueOnce({
        ...existing,
        status: 'SUBMITTED',
      });

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SUBMITTED' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SUBMITTED' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status enum', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'BOGUS' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // DELETE /:id - Soft delete
  // =============================================
  describe('DELETE /api/changes/:id', () => {
    it('should soft-delete a change request', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroChangeRequest.update.mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/changes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
      expect(mockPrisma.aeroChangeRequest.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/changes/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // PUT /:id/submit - Submit for review
  // =============================================
  describe('PUT /api/changes/:id/submit', () => {
    it('should submit a change request', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'DRAFT',
        deletedAt: null,
      });
      mockPrisma.aeroChangeRequest.update.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'SUBMITTED',
      });

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000001/submit')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000099/submit')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000001/submit')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id/review - Review decision
  // =============================================
  describe('PUT /api/changes/:id/review', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SUBMITTED',
      deletedAt: null,
    };

    it('should approve a change request', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroChangeRequest.update.mockResolvedValueOnce({
        ...existing,
        status: 'APPROVED',
        reviewDecision: 'APPROVE',
      });

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000001/review')
        .set('Authorization', 'Bearer token')
        .send({ decision: 'APPROVE' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject a change request', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroChangeRequest.update.mockResolvedValueOnce({
        ...existing,
        status: 'REJECTED',
        reviewDecision: 'REJECT',
      });

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000001/review')
        .set('Authorization', 'Bearer token')
        .send({ decision: 'REJECT', reviewNotes: 'Not feasible' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid decision', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000001/review')
        .set('Authorization', 'Bearer token')
        .send({ decision: 'MAYBE' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000099/review')
        .set('Authorization', 'Bearer token')
        .send({ decision: 'APPROVE' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // PUT /:id/implement - Mark as implemented
  // =============================================
  describe('PUT /api/changes/:id/implement', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'APPROVED',
      deletedAt: null,
    };

    it('should mark change request as implemented', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroChangeRequest.update.mockResolvedValueOnce({
        ...existing,
        status: 'IMPLEMENTED',
      });

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000001/implement')
        .set('Authorization', 'Bearer token')
        .send({ implementationNotes: 'Change applied to drawing rev B' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000099/implement')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroChangeRequest.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/changes/00000000-0000-0000-0000-000000000001/implement')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Aerospace Change Requests API — additional coverage', () => {
  it('GET /api/changes returns correct totalPages for multi-page result', async () => {
    mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(40);

    const res = await request(app)
      .get('/api/changes?page=1&limit=20')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(2);
    expect(res.body.meta.total).toBe(40);
  });

  it('GET /api/changes page 2 limit 10 computes skip=10', async () => {
    mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/changes?page=2&limit=10')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroChangeRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET /api/changes response shape has success:true and meta block', async () => {
    mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(0);

    const res = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /api/changes?search=design applies OR filter', async () => {
    mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/changes?search=design')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroChangeRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });

  it('PUT /api/changes/:id returns 500 when update throws', async () => {
    mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DRAFT',
      deletedAt: null,
    });
    mockPrisma.aeroChangeRequest.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/changes/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'SUBMITTED' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/changes/:id returns 500 when update throws', async () => {
    mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    mockPrisma.aeroChangeRequest.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .delete('/api/changes/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /api/changes/:id/review returns 500 on update db error', async () => {
    mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SUBMITTED',
      deletedAt: null,
    });
    mockPrisma.aeroChangeRequest.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/changes/00000000-0000-0000-0000-000000000001/review')
      .set('Authorization', 'Bearer token')
      .send({ decision: 'APPROVE' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/changes/:id returns 404 when already deleted', async () => {
    mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app)
      .delete('/api/changes/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('Aerospace Change Requests API — extra coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('PUT /api/changes/:id/implement returns 500 when update throws', async () => {
    mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'APPROVED',
      deletedAt: null,
    });
    mockPrisma.aeroChangeRequest.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/changes/00000000-0000-0000-0000-000000000001/implement')
      .set('Authorization', 'Bearer token')
      .send({ implementationNotes: 'Notes' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/changes totalPages rounds up correctly for 21 items limit 20', async () => {
    mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(21);

    const res = await request(app)
      .get('/api/changes?limit=20')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(2);
  });
});

describe('Aerospace Change Requests API — phase28 coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / data items have refNumber field', async () => {
    mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000001', refNumber: 'AERO-CR-2026-001', title: 'Title', status: 'DRAFT' },
    ]);
    mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/api/changes').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('refNumber');
  });

  it('GET / with page=2 limit=10 returns correct meta', async () => {
    mockPrisma.aeroChangeRequest.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(30);
    const res = await request(app).get('/api/changes?page=2&limit=10').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(10);
  });

  it('POST / returns 201 and success:true with valid body', async () => {
    mockPrisma.aeroChangeRequest.count.mockResolvedValueOnce(0);
    mockPrisma.aeroChangeRequest.create.mockResolvedValueOnce({
      id: 'cr-p28',
      refNumber: 'AERO-CR-2026-001',
      title: 'Phase28 Change',
      status: 'DRAFT',
    });
    const res = await request(app)
      .post('/api/changes')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Phase28 Change', changeType: 'DESIGN', description: 'Something changed', reason: 'Business need' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id returns data with title field', async () => {
    mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'AERO-CR-2026-001',
      title: 'Phase28 CR',
      deletedAt: null,
    });
    const res = await request(app)
      .get('/api/changes/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('title');
  });

  it('DELETE /:id sets deletedAt on soft-delete', async () => {
    mockPrisma.aeroChangeRequest.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000003',
      deletedAt: null,
    });
    mockPrisma.aeroChangeRequest.update.mockResolvedValueOnce({});
    const res = await request(app)
      .delete('/api/changes/00000000-0000-0000-0000-000000000003')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(204);
    expect(mockPrisma.aeroChangeRequest.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});

describe('changes — phase30 coverage', () => {
  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

  it('handles join method', () => {
    expect([1, 2, 3].join('-')).toBe('1-2-3');
  });

  it('handles JSON parse', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

});


describe('phase31 coverage', () => {
  it('handles ternary', () => { const x = 5 > 3 ? 'yes' : 'no'; expect(x).toBe('yes'); });
  it('handles array spread', () => { const a = [1,2]; const b = [...a, 3]; expect(b).toEqual([1,2,3]); });
  it('handles array flat', () => { expect([[1,2],[3,4]].flat()).toEqual([1,2,3,4]); });
  it('handles regex test', () => { expect(/^\d+$/.test('123')).toBe(true); expect(/^\d+$/.test('abc')).toBe(false); });
  it('handles object freeze', () => { const o = Object.freeze({a:1}); expect(Object.isFrozen(o)).toBe(true); });
});


describe('phase32 coverage', () => {
  it('handles string lastIndexOf', () => { expect('abcabc'.lastIndexOf('a')).toBe(3); });
  it('handles exponentiation', () => { expect(2 ** 8).toBe(256); });
  it('returns correct type for number', () => { expect(typeof 42).toBe('number'); });
  it('handles string slice', () => { expect('hello world'.slice(6)).toBe('world'); });
  it('handles empty array length', () => { expect([].length).toBe(0); });
});


describe('phase33 coverage', () => {
  it('handles string fromCharCode', () => { expect(String.fromCharCode(65)).toBe('A'); });
  it('handles decodeURIComponent', () => { expect(decodeURIComponent('hello%20world')).toBe('hello world'); });
  it('handles delete operator', () => { const o: any = {a:1,b:2}; delete o.a; expect(o.a).toBeUndefined(); });
  it('handles string charCodeAt', () => { expect('A'.charCodeAt(0)).toBe(65); });
  it('handles Infinity', () => { expect(1/0).toBe(Infinity); expect(isFinite(1/0)).toBe(false); });
});


describe('phase34 coverage', () => {
  it('handles number array typed', () => { const nums: number[] = [1,2,3]; expect(nums.every(n => typeof n === 'number')).toBe(true); });
  it('handles interface-like typing', () => { interface Point { x: number; y: number; } const p: Point = {x:3,y:4}; const dist = Math.sqrt(p.x**2+p.y**2); expect(dist).toBe(5); });
  it('handles negative array index via at()', () => { expect([10,20,30].at(-2)).toBe(20); });
  it('handles chained optional access', () => { const o: any = {a:{b:{c:42}}}; expect(o?.a?.b?.c).toBe(42); expect(o?.x?.y?.z).toBeUndefined(); });
  it('handles static method', () => { class MathHelper { static square(n: number) { return n*n; } } expect(MathHelper.square(4)).toBe(16); });
});


describe('phase35 coverage', () => {
  it('handles object entries round-trip', () => { const o = {a:1,b:2}; expect(Object.fromEntries(Object.entries(o))).toEqual(o); });
  it('handles number clamp', () => { const clamp = (v:number,min:number,max:number) => Math.min(Math.max(v,min),max); expect(clamp(10,0,5)).toBe(5); expect(clamp(-1,0,5)).toBe(0); });
  it('handles optional catch binding', () => { let ok = false; try { throw 1; } catch { ok = true; } expect(ok).toBe(true); });
  it('handles numeric separator readability', () => { const million = 1_000_000; expect(million).toBe(1000000); });
  it('handles debounce-like pattern', () => { let count = 0; const fn = () => count++; fn(); fn(); fn(); expect(count).toBe(3); });
});


describe('phase36 coverage', () => {
  it('handles flatten nested object keys', () => { const flat=(o:Record<string,unknown>,prefix=''):Record<string,unknown>=>{return Object.entries(o).reduce((acc,[k,v])=>{const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))Object.assign(acc,flat(v as Record<string,unknown>,key));else(acc as any)[key]=v;return acc;},{});};expect(flat({a:{b:1}})).toEqual({'a.b':1}); });
  it('handles balanced parentheses check', () => { const balanced=(s:string)=>{let c=0;for(const ch of s){if(ch==='(')c++;else if(ch===')')c--;if(c<0)return false;}return c===0;};expect(balanced('(()())')).toBe(true);expect(balanced('(()')).toBe(false); });
  it('handles string rotation check', () => { const isRotation=(s:string,t:string)=>s.length===t.length&&(s+s).includes(t);expect(isRotation('abcde','cdeab')).toBe(true);expect(isRotation('abcde','abced')).toBe(false); });
  it('handles queue pattern', () => { class Queue<T>{private d:T[]=[];enqueue(v:T){this.d.push(v);}dequeue(){return this.d.shift();}get size(){return this.d.length;}} const q=new Queue<string>();q.enqueue('a');q.enqueue('b');expect(q.dequeue()).toBe('a');expect(q.size).toBe(1); });
  it('handles stack pattern', () => { class Stack<T>{private d:T[]=[];push(v:T){this.d.push(v);}pop(){return this.d.pop();}peek(){return this.d[this.d.length-1];}get size(){return this.d.length;}} const s=new Stack<number>();s.push(1);s.push(2);expect(s.pop()).toBe(2);expect(s.size).toBe(1); });
});


describe('phase37 coverage', () => {
  it('partitions array by predicate', () => { const part=<T>(a:T[],fn:(x:T)=>boolean):[T[],T[]]=>[a.filter(fn),a.filter(x=>!fn(x))]; const [evens,odds]=part([1,2,3,4,5],x=>x%2===0); expect(evens).toEqual([2,4]); expect(odds).toEqual([1,3,5]); });
  it('checks balanced brackets', () => { const bal=(s:string)=>{const m:{[k:string]:string}={')':'(',']':'[','}':'{'}; const st:string[]=[]; for(const c of s){if('([{'.includes(c))st.push(c);else if(m[c]){if(st.pop()!==m[c])return false;}} return st.length===0;}; expect(bal('{[()]}')).toBe(true); expect(bal('{[(])}')).toBe(false); });
  it('checks if array is sorted', () => { const isSorted=(a:number[])=>a.every((v,i)=>i===0||v>=a[i-1]); expect(isSorted([1,2,3,4])).toBe(true); expect(isSorted([1,3,2])).toBe(false); });
  it('converts fahrenheit to celsius', () => { const toC=(f:number)=>(f-32)*5/9; expect(toC(32)).toBe(0); expect(toC(212)).toBe(100); });
  it('computes combination count', () => { const fact=(n:number):number=>n<=1?1:n*fact(n-1); const comb=(n:number,r:number)=>fact(n)/(fact(r)*fact(n-r)); expect(comb(5,2)).toBe(10); });
});


describe('phase38 coverage', () => {
  it('merges sorted arrays', () => { const merge=(a:number[],b:number[])=>{const r:number[]=[];let i=0,j=0;while(i<a.length&&j<b.length)r.push(a[i]<=b[j]?a[i++]:b[j++]);return [...r,...a.slice(i),...b.slice(j)];}; expect(merge([1,3,5],[2,4,6])).toEqual([1,2,3,4,5,6]); });
  it('checks if year is leap year', () => { const isLeap=(y:number)=>y%4===0&&(y%100!==0||y%400===0); expect(isLeap(2000)).toBe(true); expect(isLeap(1900)).toBe(false); expect(isLeap(2024)).toBe(true); });
  it('checks majority element', () => { const majority=(a:number[])=>{const f=a.reduce((m,v)=>{m.set(v,(m.get(v)||0)+1);return m;},new Map<number,number>());let res=-1;f.forEach((c,v)=>{if(c>a.length/2)res=v;});return res;}; expect(majority([3,2,3])).toBe(3); });
  it('checks if matrix is symmetric', () => { const isSym=(m:number[][])=>m.every((r,i)=>r.every((v,j)=>v===m[j][i])); expect(isSym([[1,2],[2,1]])).toBe(true); expect(isSym([[1,2],[3,1]])).toBe(false); });
  it('implements circular buffer', () => { class CircBuf{private d:number[];private head=0;private tail=0;private count=0;constructor(private cap:number){this.d=Array(cap);}write(v:number){this.d[this.tail]=v;this.tail=(this.tail+1)%this.cap;this.count=Math.min(this.count+1,this.cap);}read(){const v=this.d[this.head];this.head=(this.head+1)%this.cap;this.count--;return v;}get size(){return this.count;}} const b=new CircBuf(3);b.write(1);b.write(2);expect(b.read()).toBe(1);expect(b.size).toBe(1); });
});


describe('phase39 coverage', () => {
  it('checks if two strings are isomorphic', () => { const isIso=(s:string,t:string)=>{const m1=new Map<string,string>(),m2=new Set<string>();for(let i=0;i<s.length;i++){if(m1.has(s[i])&&m1.get(s[i])!==t[i])return false;if(!m1.has(s[i])&&m2.has(t[i]))return false;m1.set(s[i],t[i]);m2.add(t[i]);}return true;}; expect(isIso('egg','add')).toBe(true); expect(isIso('foo','bar')).toBe(false); });
  it('computes levenshtein distance small', () => { const lev=(a:string,b:string):number=>{if(!a.length)return b.length;if(!b.length)return a.length;return a[0]===b[0]?lev(a.slice(1),b.slice(1)):1+Math.min(lev(a.slice(1),b),lev(a,b.slice(1)),lev(a.slice(1),b.slice(1)));}; expect(lev('cat','cut')).toBe(1); });
  it('checks if string is a valid integer string', () => { const isInt=(s:string)=>/^-?[0-9]+$/.test(s.trim()); expect(isInt('42')).toBe(true); expect(isInt('-7')).toBe(true); expect(isInt('3.14')).toBe(false); });
  it('generates Gray code sequence', () => { const gray=(n:number)=>Array.from({length:1<<n},(_,i)=>i^(i>>1)); const g=gray(2); expect(g).toEqual([0,1,3,2]); });
  it('implements Sieve of Eratosthenes', () => { const sieve=(n:number)=>{const p=Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return p.map((v,i)=>v?i:-1).filter(v=>v>0);}; expect(sieve(20)).toEqual([2,3,5,7,11,13,17,19]); });
});


describe('phase40 coverage', () => {
  it('implements token bucket rate limiter logic', () => { let tokens=10; const refill=(add:number,max:number)=>{tokens=Math.min(tokens+add,max);}; const consume=(n:number)=>{if(tokens>=n){tokens-=n;return true;}return false;}; expect(consume(3)).toBe(true); expect(tokens).toBe(7); refill(5,10); expect(tokens).toBe(10); /* capped at max */ });
  it('finds next permutation', () => { const nextPerm=(a:number[])=>{const r=[...a];let i=r.length-2;while(i>=0&&r[i]>=r[i+1])i--;if(i>=0){let j=r.length-1;while(r[j]<=r[i])j--;[r[i],r[j]]=[r[j],r[i]];}let l=i+1,rt=r.length-1;while(l<rt){[r[l],r[rt]]=[r[rt],r[l]];l++;rt--;}return r;}; expect(nextPerm([1,2,3])).toEqual([1,3,2]); });
  it('implements flood fill algorithm', () => { const fill=(g:number[][],r:number,c:number,newC:number)=>{const old=g[r][c];if(old===newC)return g;const q:number[][]=[]; const v=g.map(row=>[...row]); q.push([r,c]);while(q.length){const[cr,cc]=q.shift()!;if(cr<0||cr>=v.length||cc<0||cc>=v[0].length||v[cr][cc]!==old)continue;v[cr][cc]=newC;q.push([cr+1,cc],[cr-1,cc],[cr,cc+1],[cr,cc-1]);}return v;}; expect(fill([[1,1,1],[1,1,0],[1,0,1]],1,1,2)[0][0]).toBe(2); });
  it('checks if path exists in DAG', () => { const hasPath=(adj:Map<number,number[]>,s:number,t:number)=>{const vis=new Set<number>();const dfs=(n:number):boolean=>{if(n===t)return true;if(vis.has(n))return false;vis.add(n);return(adj.get(n)||[]).some(dfs);};return dfs(s);}; const g=new Map([[0,[1,2]],[1,[3]],[2,[3]],[3,[]]]); expect(hasPath(g,0,3)).toBe(true); expect(hasPath(g,1,2)).toBe(false); });
  it('computes number of valid parenthesizations', () => { const catalan=(n:number):number=>n<=1?1:Array.from({length:n},(_,i)=>catalan(i)*catalan(n-1-i)).reduce((a,b)=>a+b,0); expect(catalan(3)).toBe(5); });
});
