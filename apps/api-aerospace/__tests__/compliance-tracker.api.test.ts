import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aeroComplianceItem: {
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

import router from '../src/routes/compliance-tracker';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as any;

const app = express();
app.use(express.json());
app.use('/api/compliance', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Aerospace Compliance Tracker API', () => {
  // =============================================
  // GET /clauses - AS9100D clause reference
  // =============================================
  describe('GET /api/compliance/clauses', () => {
    it('should return AS9100D clause reference data', async () => {
      const res = await request(app).get('/api/compliance/clauses').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('clause');
      expect(res.body.data[0]).toHaveProperty('title');
    });
  });

  // =============================================
  // GET / - List compliance items
  // =============================================
  describe('GET /api/compliance', () => {
    it('should return paginated list of compliance items', async () => {
      mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([
        { id: '00000000-0000-0000-0000-000000000001', refNumber: 'AERO-COMP-2026-001', clause: '4.1', complianceStatus: 'COMPLIANT' },
      ]);
      mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(1);

      const res = await request(app).get('/api/compliance').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 50, total: 1, totalPages: 1 });
    });

    it('should filter by compliance status', async () => {
      mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

      await request(app).get('/api/compliance?status=NON_COMPLIANT').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroComplianceItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ complianceStatus: 'NON_COMPLIANT' }) })
      );
    });

    it('should filter by standard', async () => {
      mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

      await request(app).get('/api/compliance?standard=AS9100D').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroComplianceItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ standard: 'AS9100D' }) })
      );
    });

    it('should support search', async () => {
      mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

      await request(app).get('/api/compliance?search=audit').set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroComplianceItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroComplianceItem.findMany.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/compliance').set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // GET /:id
  // =============================================
  describe('GET /api/compliance/:id', () => {
    it('should return a single compliance item', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001', refNumber: 'AERO-COMP-2026-001', clause: '9.2', deletedAt: null,
      });

      const res = await request(app).get('/api/compliance/00000000-0000-0000-0000-000000000001').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(null);

      const res = await request(app).get('/api/compliance/00000000-0000-0000-0000-000000000099').set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });

      const res = await request(app).get('/api/compliance/00000000-0000-0000-0000-000000000001').set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/compliance/00000000-0000-0000-0000-000000000001').set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // POST / - Create compliance item
  // =============================================
  describe('POST /api/compliance', () => {
    const validPayload = { clause: '9.2', standard: 'AS9100D' };

    it('should create a compliance item successfully', async () => {
      mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);
      mockPrisma.aeroComplianceItem.create.mockResolvedValueOnce({
        id: 'c-new', refNumber: 'AERO-COMP-2026-001', clause: '9.2', complianceStatus: 'UNDER_REVIEW',
      });

      const res = await request(app).post('/api/compliance').set('Authorization', 'Bearer token').send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complianceStatus).toBe('UNDER_REVIEW');
    });

    it('should return 400 when clause is missing', async () => {
      const res = await request(app).post('/api/compliance').set('Authorization', 'Bearer token').send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should look up clause title from AS9100D reference data', async () => {
      mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);
      mockPrisma.aeroComplianceItem.create.mockResolvedValueOnce({
        id: 'c-new', refNumber: 'AERO-COMP-2026-001', clause: '4.1', title: 'Understanding the organization and its context',
      });

      await request(app).post('/api/compliance').set('Authorization', 'Bearer token')
        .send({ clause: '4.1' });

      expect(mockPrisma.aeroComplianceItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ clause: '4.1' }),
        })
      );
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);
      mockPrisma.aeroComplianceItem.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).post('/api/compliance').set('Authorization', 'Bearer token').send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id - Update compliance item
  // =============================================
  describe('PUT /api/compliance/:id', () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', targetDate: null, lastReviewDate: null, nextReviewDate: null, deletedAt: null };

    it('should update a compliance item', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroComplianceItem.update.mockResolvedValueOnce({ ...existing, complianceStatus: 'COMPLIANT' });

      const res = await request(app).put('/api/compliance/00000000-0000-0000-0000-000000000001').set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(null);

      const res = await request(app).put('/api/compliance/00000000-0000-0000-0000-000000000099').set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid complianceStatus enum', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app).put('/api/compliance/00000000-0000-0000-0000-000000000001').set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // DELETE /:id - Soft delete
  // =============================================
  describe('DELETE /api/compliance/:id', () => {
    it('should soft-delete a compliance item', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null });
      mockPrisma.aeroComplianceItem.update.mockResolvedValueOnce({});

      const res = await request(app).delete('/api/compliance/00000000-0000-0000-0000-000000000001').set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(null);

      const res = await request(app).delete('/api/compliance/00000000-0000-0000-0000-000000000099').set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // GET /dashboard/summary
  // =============================================
  describe('GET /api/compliance/dashboard/summary', () => {
    it('should return compliance summary dashboard', async () => {
      mockPrisma.aeroComplianceItem.count
        .mockResolvedValueOnce(34)  // total
        .mockResolvedValueOnce(20)  // compliant
        .mockResolvedValueOnce(5)   // partiallyCompliant
        .mockResolvedValueOnce(3)   // nonCompliant
        .mockResolvedValueOnce(2)   // notApplicable
        .mockResolvedValueOnce(4);  // underReview

      const res = await request(app).get('/api/compliance/dashboard/summary').set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('complianceScore');
      expect(res.body.data).toHaveProperty('byStatus');
      expect(res.body.data.byStatus).toHaveProperty('compliant', 20);
      expect(res.body.data.byStatus).toHaveProperty('nonCompliant', 3);
      expect(res.body.data.gaps).toBe(8); // nonCompliant(3) + partiallyCompliant(5)
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroComplianceItem.count.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/compliance/dashboard/summary').set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
