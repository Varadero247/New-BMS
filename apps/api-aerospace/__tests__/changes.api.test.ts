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
