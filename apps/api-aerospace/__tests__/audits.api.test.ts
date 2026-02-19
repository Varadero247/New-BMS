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
