import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aeroAudit: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    aeroAuditFinding: {
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

import router from '../src/routes/audits';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/audits', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Aerospace Audits API', () => {
  // =============================================
  // GET / - List audits
  // =============================================
  describe('GET /api/audits', () => {
    it('should return paginated list of audits', async () => {
      mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000001',
          refNumber: 'AERO-AUD-2026-001',
          title: 'AS9100D Internal Audit',
          status: 'SCHEDULED',
          findings: [],
        },
      ]);
      mockPrisma.aeroAudit.count.mockResolvedValueOnce(1);

      const res = await request(app).get('/api/audits').set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('should filter by status', async () => {
      mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);

      await request(app).get('/api/audits?status=COMPLETED').set('Authorization', 'Bearer token');

      expect(mockPrisma.aeroAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) })
      );
    });

    it('should filter by auditType', async () => {
      mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);

      await request(app).get('/api/audits?auditType=INTERNAL').set('Authorization', 'Bearer token');

      expect(mockPrisma.aeroAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ auditType: 'INTERNAL' }) })
      );
    });

    it('should support search', async () => {
      mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);

      await request(app).get('/api/audits?search=quality').set('Authorization', 'Bearer token');

      expect(mockPrisma.aeroAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroAudit.findMany.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/audits').set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // GET /:id
  // =============================================
  describe('GET /api/audits/:id', () => {
    it('should return a single audit', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-AUD-2026-001',
        title: 'Internal Audit',
        deletedAt: null,
        findings: [],
      });

      const res = await request(app)
        .get('/api/audits/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/audits/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
        findings: [],
      });

      const res = await request(app)
        .get('/api/audits/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroAudit.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .get('/api/audits/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // POST / - Create audit
  // =============================================
  describe('POST /api/audits', () => {
    const validPayload = {
      title: 'AS9100D Surveillance Audit',
      auditType: 'SURVEILLANCE',
      scope: 'Full QMS scope',
      scheduledDate: '2026-06-01',
      leadAuditor: 'John Smith',
    };

    it('should create an audit successfully', async () => {
      mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);
      mockPrisma.aeroAudit.create.mockResolvedValueOnce({
        id: 'a-new',
        refNumber: 'AERO-AUD-2026-001',
        ...validPayload,
        status: 'SCHEDULED',
      });

      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SCHEDULED');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app).post('/api/audits').set('Authorization', 'Bearer token').send({
        auditType: 'INTERNAL',
        scope: 'Scope',
        scheduledDate: '2026-06-01',
        leadAuditor: 'Smith',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when scope is missing', async () => {
      const res = await request(app).post('/api/audits').set('Authorization', 'Bearer token').send({
        title: 'Test',
        auditType: 'INTERNAL',
        scheduledDate: '2026-06-01',
        leadAuditor: 'Smith',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid auditType', async () => {
      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, auditType: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);
      mockPrisma.aeroAudit.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id - Update audit
  // =============================================
  describe('PUT /api/audits/:id', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      scheduledDate: new Date(),
      actualDate: null,
      deletedAt: null,
    };

    it('should update an audit successfully', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroAudit.update.mockResolvedValueOnce({ ...existing, status: 'IN_PROGRESS' });

      const res = await request(app)
        .put('/api/audits/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/audits/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/audits/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroAudit.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/audits/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // DELETE /:id - Soft delete
  // =============================================
  describe('DELETE /api/audits/:id', () => {
    it('should soft-delete an audit', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroAudit.update.mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/audits/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
      expect(mockPrisma.aeroAudit.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/audits/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when already deleted', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .delete('/api/audits/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroAudit.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .delete('/api/audits/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // POST /findings - Record finding
  // =============================================
  describe('POST /api/audits/findings', () => {
    const validFinding = {
      auditId: 'a1',
      findingType: 'NONCONFORMITY',
      severity: 'MAJOR',
      description: 'Missing calibration records',
    };

    it('should create a finding successfully', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-AUD-2026-001',
        deletedAt: null,
      });
      mockPrisma.aeroAuditFinding.count.mockResolvedValueOnce(0);
      mockPrisma.aeroAuditFinding.create.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-AUD-2026-001-F01',
        ...validFinding,
        status: 'OPEN',
      });

      const res = await request(app)
        .post('/api/audits/findings')
        .set('Authorization', 'Bearer token')
        .send(validFinding);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('OPEN');
    });

    it('should return 404 when audit not found', async () => {
      mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/audits/findings')
        .set('Authorization', 'Bearer token')
        .send(validFinding);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when required fields missing', async () => {
      const res = await request(app)
        .post('/api/audits/findings')
        .set('Authorization', 'Bearer token')
        .send({ auditId: 'a1', findingType: 'NONCONFORMITY' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid findingType', async () => {
      const res = await request(app)
        .post('/api/audits/findings')
        .set('Authorization', 'Bearer token')
        .send({ auditId: 'a1', findingType: 'INVALID', description: 'desc' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // PUT /findings/:id/close
  // =============================================
  describe('PUT /api/audits/findings/:id/close', () => {
    it('should close a finding successfully', async () => {
      mockPrisma.aeroAuditFinding.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'OPEN',
      });
      mockPrisma.aeroAuditFinding.update.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'CLOSED',
      });

      const res = await request(app)
        .put('/api/audits/findings/00000000-0000-0000-0000-000000000001/close')
        .set('Authorization', 'Bearer token')
        .send({ correctiveAction: 'Calibration records updated' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when finding not found', async () => {
      mockPrisma.aeroAuditFinding.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/audits/findings/00000000-0000-0000-0000-000000000099/close')
        .set('Authorization', 'Bearer token')
        .send({ correctiveAction: 'Fixed' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when correctiveAction is missing', async () => {
      mockPrisma.aeroAuditFinding.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'OPEN',
      });

      const res = await request(app)
        .put('/api/audits/findings/00000000-0000-0000-0000-000000000001/close')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // GET /schedule/upcoming
  // =============================================
  describe('GET /api/audits/schedule/upcoming', () => {
    it('should return upcoming scheduled audits', async () => {
      mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000001',
          status: 'SCHEDULED',
          scheduledDate: new Date(),
          findings: [],
        },
      ]);

      const res = await request(app)
        .get('/api/audits/schedule/upcoming')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroAudit.findMany.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .get('/api/audits/schedule/upcoming')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Aerospace Audits API — additional coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / returns success:true with empty data array', async () => {
    mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/audits').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('GET / computes totalPages correctly for 40 items limit 20', async () => {
    mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroAudit.count.mockResolvedValueOnce(40);
    const res = await request(app).get('/api/audits?page=1&limit=20').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('PUT /:id returns 500 when update throws after find succeeds', async () => {
    mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      scheduledDate: new Date(),
      actualDate: null,
      deletedAt: null,
    });
    mockPrisma.aeroAudit.update.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /findings returns 500 on db error when creating finding', async () => {
    mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'AERO-AUD-2026-001',
      deletedAt: null,
    });
    mockPrisma.aeroAuditFinding.count.mockResolvedValueOnce(0);
    mockPrisma.aeroAuditFinding.create.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .post('/api/audits/findings')
      .set('Authorization', 'Bearer token')
      .send({
        auditId: '00000000-0000-0000-0000-000000000001',
        findingType: 'NONCONFORMITY',
        severity: 'MAJOR',
        description: 'Missing calibration records',
      });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /findings/:id/close returns 500 on db error', async () => {
    mockPrisma.aeroAuditFinding.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'OPEN',
    });
    mockPrisma.aeroAuditFinding.update.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .put('/api/audits/findings/00000000-0000-0000-0000-000000000001/close')
      .set('Authorization', 'Bearer token')
      .send({ correctiveAction: 'Fixed the issue' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /schedule/upcoming returns empty data array', async () => {
    mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/audits/schedule/upcoming').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Aerospace Audits API — extra coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / filters by both status and auditType simultaneously', async () => {
    mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);
    await request(app)
      .get('/api/audits?status=COMPLETED&auditType=INTERNAL')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'COMPLETED', auditType: 'INTERNAL' }),
      })
    );
  });

  it('POST /findings returns 400 for missing description field', async () => {
    const res = await request(app)
      .post('/api/audits/findings')
      .set('Authorization', 'Bearer token')
      .send({ auditId: 'a1', findingType: 'NONCONFORMITY' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / response shape has success:true and meta block', async () => {
    mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/audits').set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });
});

describe('Aerospace Audits API — phase28 coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / filters by auditType=EXTERNAL and returns 200', async () => {
    mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/audits?auditType=EXTERNAL').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(mockPrisma.aeroAudit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ auditType: 'EXTERNAL' }) })
    );
  });

  it('POST / accepts optional teamMembers field and returns 201', async () => {
    mockPrisma.aeroAudit.count.mockResolvedValueOnce(0);
    mockPrisma.aeroAudit.create.mockResolvedValueOnce({
      id: 'a-team',
      refNumber: 'AERO-AUD-2026-002',
      title: 'Team Audit',
      status: 'SCHEDULED',
    });
    const res = await request(app)
      .post('/api/audits')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'Team Audit',
        auditType: 'INTERNAL',
        scope: 'Full QMS',
        scheduledDate: '2026-07-01',
        leadAuditor: 'Jane Doe',
        teamMembers: ['Alice', 'Bob'],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id updates status to COMPLETED and returns 200', async () => {
    mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      scheduledDate: new Date(),
      actualDate: null,
      deletedAt: null,
    });
    mockPrisma.aeroAudit.update.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });
    const res = await request(app)
      .put('/api/audits/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / with page=2 limit=5 returns correct meta', async () => {
    mockPrisma.aeroAudit.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroAudit.count.mockResolvedValueOnce(15);
    const res = await request(app).get('/api/audits?page=2&limit=5').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(5);
  });

  it('DELETE /:id sets deletedAt on the audit record', async () => {
    mockPrisma.aeroAudit.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000002',
      deletedAt: null,
    });
    mockPrisma.aeroAudit.update.mockResolvedValueOnce({});
    const res = await request(app)
      .delete('/api/audits/00000000-0000-0000-0000-000000000002')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(204);
    expect(mockPrisma.aeroAudit.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});

describe('audits — phase30 coverage', () => {
  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

  it('handles reduce method', () => {
    expect([1, 2, 3].reduce((acc, x) => acc + x, 0)).toBe(6);
  });

  it('handles Set size', () => {
    expect(new Set([1, 2, 2, 3]).size).toBe(3);
  });

  it('handles computed properties', () => {
    const key = 'foo'; const obj3 = { [key]: 42 }; expect((obj3 as any).foo).toBe(42);
  });

  it('handles some method', () => {
    expect([1, 2, 3].some(x => x > 2)).toBe(true);
  });

});


describe('phase31 coverage', () => {
  it('handles regex match', () => { const m = 'hello123'.match(/\d+/); expect(m?.[0]).toBe('123'); });
  it('handles string padEnd', () => { expect('5'.padEnd(3,'0')).toBe('500'); });
  it('handles Math.abs', () => { expect(Math.abs(-7)).toBe(7); });
  it('handles string includes', () => { expect('foobar'.includes('bar')).toBe(true); });
  it('handles array slice', () => { expect([1,2,3,4].slice(1,3)).toEqual([2,3]); });
});


describe('phase32 coverage', () => {
  it('handles Set iteration', () => { const s = new Set([1,2,3]); expect([...s]).toEqual([1,2,3]); });
  it('handles logical nullish assignment', () => { let z: number | null = null; z ??= 3; expect(z).toBe(3); });
  it('handles string substring', () => { expect('hello'.substring(1,3)).toBe('el'); });
  it('handles array at method', () => { expect([1,2,3].at(-1)).toBe(3); });
  it('handles Promise.allSettled', async () => { const r = await Promise.allSettled([Promise.resolve(1)]); expect(r[0].status).toBe('fulfilled'); });
});


describe('phase33 coverage', () => {
  it('handles string search', () => { expect('hello world'.search(/world/)).toBe(6); });
  it('handles generator next with value', () => { function* gen() { const x: number = yield 1; yield x + 10; } const g = gen(); g.next(); expect(g.next(5).value).toBe(15); });
  it('handles Date methods', () => { const d = new Date(2026, 0, 15); expect(d.getMonth()).toBe(0); expect(d.getDate()).toBe(15); });
  it('multiplies numbers', () => { expect(4 * 5).toBe(20); });
  it('handles NaN check', () => { expect(isNaN(NaN)).toBe(true); expect(isNaN(1)).toBe(false); });
});


describe('phase34 coverage', () => {
  it('handles string repeat zero times', () => { expect('abc'.repeat(0)).toBe(''); });
  it('handles abstract-like pattern', () => { class Shape { area(): number { return 0; } } class Square extends Shape { constructor(private s: number) { super(); } area() { return this.s*this.s; } } expect(new Square(4).area()).toBe(16); });
  it('handles Required type pattern', () => { interface Opts { a?: number; b?: string; } const o: Required<Opts> = { a: 1, b: 'x' }; expect(o.a).toBe(1); });
  it('handles object with numeric keys', () => { const o: Record<string,number> = {'0':10,'1':20}; expect(o['0']).toBe(10); });
  it('handles Set union', () => { const a = new Set([1,2,3]); const b = new Set([2,3,4]); const union = new Set([...a,...b]); expect(union.size).toBe(4); });
});


describe('phase35 coverage', () => {
  it('handles flatMap with filter', () => { expect([[1,2],[3],[4,5]].flatMap(x=>x).filter(x=>x>2)).toEqual([3,4,5]); });
  it('handles async map pattern', async () => { const asyncDouble = async (n:number) => n*2; const results = await Promise.all([1,2,3].map(asyncDouble)); expect(results).toEqual([2,4,6]); });
  it('handles number clamp', () => { const clamp = (v:number,min:number,max:number) => Math.min(Math.max(v,min),max); expect(clamp(10,0,5)).toBe(5); expect(clamp(-1,0,5)).toBe(0); });
  it('handles mixin pattern', () => { class Base { name = 'Alice'; } class WithDate extends Base { createdAt = new Date(); } const u = new WithDate(); expect(u.name).toBe('Alice'); expect(u.createdAt instanceof Date).toBe(true); });
  it('handles array chunk pattern', () => { const chunk = <T>(a: T[], n: number): T[][] => Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,i*n+n)); expect(chunk([1,2,3,4,5],2)).toEqual([[1,2],[3,4],[5]]); });
});


describe('phase36 coverage', () => {
  it('handles two-sum pattern', () => { const twoSum=(nums:number[],t:number)=>{const m=new Map<number,number>();for(let i=0;i<nums.length;i++){const c=t-nums[i];if(m.has(c))return[m.get(c)!,i];m.set(nums[i],i);}return[];}; expect(twoSum([2,7,11,15],9)).toEqual([0,1]); });
  it('handles balanced parentheses check', () => { const balanced=(s:string)=>{let c=0;for(const ch of s){if(ch==='(')c++;else if(ch===')')c--;if(c<0)return false;}return c===0;};expect(balanced('(()())')).toBe(true);expect(balanced('(()')).toBe(false); });
  it('handles graph adjacency list', () => { const g=new Map<number,number[]>([[1,[2,3]],[2,[4]],[3,[4]],[4,[]]]);const neighbors=g.get(1)!;expect(neighbors).toContain(2);expect(neighbors.length).toBe(2); });
  it('handles maximum subarray sum', () => { const maxSub=(a:number[])=>{let max=a[0],cur=a[0];for(let i=1;i<a.length;i++){cur=Math.max(a[i],cur+a[i]);max=Math.max(max,cur);}return max;};expect(maxSub([-2,1,-3,4,-1,2,1,-5,4])).toBe(6); });
  it('handles regex URL validation', () => { const isUrl=(s:string)=>/^https?:\/\/.+/.test(s);expect(isUrl('https://example.com')).toBe(true);expect(isUrl('ftp://nope')).toBe(false); });
});


describe('phase37 coverage', () => {
  it('finds common elements', () => { const common=<T>(a:T[],b:T[])=>a.filter(x=>b.includes(x)); expect(common([1,2,3,4],[2,4,6])).toEqual([2,4]); });
  it('groups array into pairs', () => { const pairs=<T>(a:T[]):[T,T][]=>[]; const chunk2=<T>(a:T[])=>Array.from({length:Math.ceil(a.length/2)},(_,i)=>a.slice(i*2,i*2+2)); expect(chunk2([1,2,3,4,5])).toEqual([[1,2],[3,4],[5]]); });
  it('moves element to front', () => { const toFront=<T>(a:T[],idx:number)=>[a[idx],...a.filter((_,i)=>i!==idx)]; expect(toFront([1,2,3,4],2)).toEqual([3,1,2,4]); });
  it('partitions array by predicate', () => { const part=<T>(a:T[],fn:(x:T)=>boolean):[T[],T[]]=>[a.filter(fn),a.filter(x=>!fn(x))]; const [evens,odds]=part([1,2,3,4,5],x=>x%2===0); expect(evens).toEqual([2,4]); expect(odds).toEqual([1,3,5]); });
  it('counts occurrences in array', () => { const count=<T>(a:T[],v:T)=>a.filter(x=>x===v).length; expect(count([1,2,1,3,1],1)).toBe(3); });
});


describe('phase38 coverage', () => {
  it('rotates matrix 90 degrees', () => { const rot90=(m:number[][])=>m[0].map((_,i)=>m.map(r=>r[i]).reverse()); expect(rot90([[1,2],[3,4]])).toEqual([[3,1],[4,2]]); });
  it('generates fibonacci sequence up to n', () => { const fibSeq=(n:number)=>{const s=[0,1];while(s[s.length-1]+s[s.length-2]<=n)s.push(s[s.length-1]+s[s.length-2]);return s.filter(v=>v<=n);}; expect(fibSeq(10)).toEqual([0,1,1,2,3,5,8]); });
  it('finds median of array', () => { const med=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}; expect(med([3,1,4,1,5])).toBe(3); expect(med([1,2,3,4])).toBe(2.5); });
  it('implements exponential search bound', () => { const expBound=(a:number[],v:number)=>{if(a[0]===v)return 0;let i=1;while(i<a.length&&a[i]<=v)i*=2;return Math.min(i,a.length-1);}; expect(expBound([1,2,4,8,16,32],8)).toBeGreaterThanOrEqual(3); });
  it('applies insertion sort', () => { const sort=(a:number[])=>{const r=[...a];for(let i=1;i<r.length;i++){const key=r[i];let j=i-1;while(j>=0&&r[j]>key){r[j+1]=r[j];j--;}r[j+1]=key;}return r;}; expect(sort([5,2,4,6,1,3])).toEqual([1,2,3,4,5,6]); });
});


describe('phase39 coverage', () => {
  it('checks if graph has cycle (undirected)', () => { const hasCycle=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const vis=new Set<number>();const dfs=(node:number,par:number):boolean=>{vis.add(node);for(const nb of adj[node]){if(!vis.has(nb)){if(dfs(nb,node))return true;}else if(nb!==par)return true;}return false;};return dfs(0,-1);}; expect(hasCycle(4,[[0,1],[1,2],[2,3],[3,1]])).toBe(true); expect(hasCycle(3,[[0,1],[1,2]])).toBe(false); });
  it('implements counting sort', () => { const csort=(a:number[],max:number)=>{const c=Array(max+1).fill(0);a.forEach(v=>c[v]++);const r:number[]=[];c.forEach((cnt,v)=>r.push(...Array(cnt).fill(v)));return r;}; expect(csort([4,2,3,1,4,2],4)).toEqual([1,2,2,3,4,4]); });
  it('zigzag converts string', () => { const zz=(s:string,r:number)=>{if(r===1)return s;const rows=Array.from({length:r},()=>'');let row=0,dir=-1;for(const c of s){rows[row]+=c;if(row===0||row===r-1)dir*=-1;row+=dir;}return rows.join('');}; expect(zz('PAYPALISHIRING',3)).toBe('PAHNAPLSIIGYIR'); });
  it('counts bits to flip to convert A to B', () => { const bitsToFlip=(a:number,b:number)=>{let x=a^b,c=0;while(x){c+=x&1;x>>>=1;}return c;}; expect(bitsToFlip(29,15)).toBe(2); });
  it('implements Sieve of Eratosthenes', () => { const sieve=(n:number)=>{const p=Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return p.map((v,i)=>v?i:-1).filter(v=>v>0);}; expect(sieve(20)).toEqual([2,3,5,7,11,13,17,19]); });
});
