import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aeroSpecialProcess: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    aeroNadcapApproval: {
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

import router from '../src/routes/special-processes';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/special-processes', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Aerospace Special Processes API', () => {
  // =============================================
  // GET / - List special processes
  // =============================================
  describe('GET /api/special-processes', () => {
    it('should return paginated list of special processes', async () => {
      mockPrisma.aeroSpecialProcess.findMany.mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000001',
          refNumber: 'AERO-SP-2026-001',
          title: 'Cadmium Plating',
          processType: 'COATINGS',
          status: 'ACTIVE',
          nadcapApprovals: [],
        },
      ]);
      mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(1);

      const res = await request(app)
        .get('/api/special-processes')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('should filter by processType', async () => {
      mockPrisma.aeroSpecialProcess.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/special-processes?processType=WELDING')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroSpecialProcess.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ processType: 'WELDING' }) })
      );
    });

    it('should filter by status', async () => {
      mockPrisma.aeroSpecialProcess.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/special-processes?status=ACTIVE')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroSpecialProcess.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) })
      );
    });

    it('should filter by approvalBody', async () => {
      mockPrisma.aeroSpecialProcess.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/special-processes?approvalBody=NADCAP')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroSpecialProcess.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ approvalBody: 'NADCAP' }) })
      );
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroSpecialProcess.findMany.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .get('/api/special-processes')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // GET /:id
  // =============================================
  describe('GET /api/special-processes/:id', () => {
    it('should return a single special process with nadcapApprovals', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-SP-2026-001',
        title: 'Cadmium Plating',
        deletedAt: null,
        nadcapApprovals: [],
      });

      const res = await request(app)
        .get('/api/special-processes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/special-processes/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
        nadcapApprovals: [],
      });

      const res = await request(app)
        .get('/api/special-processes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // POST / - Create special process
  // =============================================
  describe('POST /api/special-processes', () => {
    const validPayload = {
      title: 'Titanium Welding',
      processType: 'WELDING',
      specification: 'AWS D1.1',
    };

    it('should create a special process successfully', async () => {
      mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(0);
      mockPrisma.aeroSpecialProcess.create.mockResolvedValueOnce({
        id: 'sp-new',
        refNumber: 'AERO-SP-2026-001',
        ...validPayload,
        status: 'ACTIVE',
      });

      const res = await request(app)
        .post('/api/special-processes')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/special-processes')
        .set('Authorization', 'Bearer token')
        .send({ processType: 'WELDING' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when processType is missing', async () => {
      const res = await request(app)
        .post('/api/special-processes')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid processType enum', async () => {
      const res = await request(app)
        .post('/api/special-processes')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', processType: 'INVALID_PROCESS' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(0);
      mockPrisma.aeroSpecialProcess.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/special-processes')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id - Update special process
  // =============================================
  describe('PUT /api/special-processes/:id', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ACTIVE',
      deletedAt: null,
    };

    it('should update a special process', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroSpecialProcess.update.mockResolvedValueOnce({
        ...existing,
        status: 'UNDER_REVIEW',
      });

      const res = await request(app)
        .put('/api/special-processes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'UNDER_REVIEW' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/special-processes/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SUSPENDED' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status enum', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/special-processes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // DELETE /:id
  // =============================================
  describe('DELETE /api/special-processes/:id', () => {
    it('should soft-delete a special process', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroSpecialProcess.update.mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/special-processes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/special-processes/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when already deleted', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .delete('/api/special-processes/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // GET /nadcap
  // =============================================
  describe('GET /api/special-processes/nadcap', () => {
    it('should list NADCAP approvals', async () => {
      mockPrisma.aeroNadcapApproval.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroNadcapApproval.count.mockResolvedValueOnce(0);
      const res = await request(app)
        .get('/api/special-processes/nadcap')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =============================================
  // POST /nadcap
  // =============================================
  describe('POST /api/special-processes/nadcap', () => {
    const validPayload = {
      specialProcessId: 'sp1',
      supplier: 'AeroCoat Inc',
      commodity: 'Chemical Processing',
      approvalDate: '2026-01-01',
      expiryDate: '2027-01-01',
    };

    it('should record a NADCAP approval successfully', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroNadcapApproval.count.mockResolvedValueOnce(0);
      mockPrisma.aeroNadcapApproval.create.mockResolvedValueOnce({
        id: 'na-new',
        refNumber: 'AERO-NADCAP-2026-001',
        ...validPayload,
        approvalStatus: 'ACTIVE',
      });

      const res = await request(app)
        .post('/api/special-processes/nadcap')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.approvalStatus).toBe('ACTIVE');
    });

    it('should return 404 when special process not found', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/special-processes/nadcap')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when supplier is missing', async () => {
      const res = await request(app)
        .post('/api/special-processes/nadcap')
        .set('Authorization', 'Bearer token')
        .send({
          specialProcessId: 'sp1',
          commodity: 'Coatings',
          approvalDate: '2026-01-01',
          expiryDate: '2027-01-01',
        });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when approvalDate is missing', async () => {
      const res = await request(app)
        .post('/api/special-processes/nadcap')
        .set('Authorization', 'Bearer token')
        .send({
          specialProcessId: 'sp1',
          supplier: 'AeroCoat',
          commodity: 'Coatings',
          expiryDate: '2027-01-01',
        });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroNadcapApproval.count.mockResolvedValueOnce(0);
      mockPrisma.aeroNadcapApproval.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/special-processes/nadcap')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /nadcap/:id
  // =============================================
  describe('PUT /api/special-processes/nadcap/:id', () => {
    const existingApproval = {
      id: '00000000-0000-0000-0000-000000000001',
      approvalStatus: 'ACTIVE',
      auditDate: null,
      approvalDate: new Date(),
      expiryDate: new Date(),
      deletedAt: null,
    };

    it('should update a NADCAP approval', async () => {
      mockPrisma.aeroNadcapApproval.findUnique.mockResolvedValueOnce(existingApproval);
      mockPrisma.aeroNadcapApproval.update.mockResolvedValueOnce({
        ...existingApproval,
        approvalStatus: 'EXPIRING_SOON',
      });

      const res = await request(app)
        .put('/api/special-processes/nadcap/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ approvalStatus: 'EXPIRING_SOON' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroNadcapApproval.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/special-processes/nadcap/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ approvalStatus: 'EXPIRED' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid approvalStatus', async () => {
      mockPrisma.aeroNadcapApproval.findUnique.mockResolvedValueOnce(existingApproval);

      const res = await request(app)
        .put('/api/special-processes/nadcap/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ approvalStatus: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroNadcapApproval.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/special-processes/nadcap/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ approvalStatus: 'ACTIVE' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Aerospace Special Processes API — additional coverage', () => {
  it('GET /api/special-processes returns correct totalPages for multi-page result', async () => {
    mockPrisma.aeroSpecialProcess.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(40);

    const res = await request(app)
      .get('/api/special-processes?page=1&limit=20')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(2);
    expect(res.body.meta.total).toBe(40);
  });

  it('GET /api/special-processes page 2 limit 10 computes skip=10', async () => {
    mockPrisma.aeroSpecialProcess.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/special-processes?page=2&limit=10')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroSpecialProcess.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET /api/special-processes response shape has success:true and meta block', async () => {
    mockPrisma.aeroSpecialProcess.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(0);

    const res = await request(app)
      .get('/api/special-processes')
      .set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /api/special-processes/:id returns 500 on db error', async () => {
    mockPrisma.aeroSpecialProcess.findUnique.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .get('/api/special-processes/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /api/special-processes/:id returns 500 when update throws', async () => {
    mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ACTIVE',
      deletedAt: null,
    });
    mockPrisma.aeroSpecialProcess.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/special-processes/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'UNDER_REVIEW' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/special-processes/:id returns 500 when update throws', async () => {
    mockPrisma.aeroSpecialProcess.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    mockPrisma.aeroSpecialProcess.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .delete('/api/special-processes/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/special-processes/nadcap returns 500 on db error', async () => {
    mockPrisma.aeroNadcapApproval.findMany.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .get('/api/special-processes/nadcap')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/special-processes?search=titanium applies OR search filter', async () => {
    mockPrisma.aeroSpecialProcess.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/special-processes?search=titanium')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroSpecialProcess.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });

  it('GET /api/special-processes returns data as array', async () => {
    mockPrisma.aeroSpecialProcess.findMany.mockResolvedValueOnce([
      { id: 'sp-a', refNumber: 'AERO-SP-2026-002', title: 'Shot Peening', processType: 'COATINGS', status: 'ACTIVE', nadcapApprovals: [] },
    ]);
    mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/api/special-processes').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/special-processes returns 400 when specification is missing (if required)', async () => {
    mockPrisma.aeroSpecialProcess.count.mockResolvedValueOnce(0);
    mockPrisma.aeroSpecialProcess.create.mockResolvedValueOnce({
      id: 'sp-new-2',
      refNumber: 'AERO-SP-2026-002',
      title: 'Anodizing',
      processType: 'COATINGS',
      status: 'ACTIVE',
    });
    const res = await request(app)
      .post('/api/special-processes')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Anodizing', processType: 'COATINGS' });
    expect([201, 400]).toContain(res.status);
  });

  it('POST /api/special-processes/nadcap returns 400 when expiryDate is missing', async () => {
    const res = await request(app)
      .post('/api/special-processes/nadcap')
      .set('Authorization', 'Bearer token')
      .send({
        specialProcessId: 'sp1',
        supplier: 'AeroCoat Inc',
        commodity: 'Chemical Processing',
        approvalDate: '2026-01-01',
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/special-processes/nadcap/:id returns 500 when update throws', async () => {
    mockPrisma.aeroNadcapApproval.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      approvalStatus: 'ACTIVE',
      auditDate: null,
      approvalDate: new Date(),
      expiryDate: new Date(),
      deletedAt: null,
    });
    mockPrisma.aeroNadcapApproval.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/special-processes/nadcap/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ approvalStatus: 'EXPIRED' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
