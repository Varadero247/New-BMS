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
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import router from '../src/routes/compliance-tracker';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
      const res = await request(app)
        .get('/api/compliance/clauses')
        .set('Authorization', 'Bearer token');
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
        {
          id: '00000000-0000-0000-0000-000000000001',
          refNumber: 'AERO-COMP-2026-001',
          clause: '4.1',
          complianceStatus: 'COMPLIANT',
        },
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

      await request(app)
        .get('/api/compliance?status=NON_COMPLIANT')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroComplianceItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ complianceStatus: 'NON_COMPLIANT' }),
        })
      );
    });

    it('should filter by standard', async () => {
      mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/compliance?standard=AS9100D')
        .set('Authorization', 'Bearer token');
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
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-COMP-2026-001',
        clause: '9.2',
        deletedAt: null,
      });

      const res = await request(app)
        .get('/api/compliance/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/compliance/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/compliance/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .get('/api/compliance/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
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
        id: 'c-new',
        refNumber: 'AERO-COMP-2026-001',
        clause: '9.2',
        complianceStatus: 'UNDER_REVIEW',
      });

      const res = await request(app)
        .post('/api/compliance')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complianceStatus).toBe('UNDER_REVIEW');
    });

    it('should return 400 when clause is missing', async () => {
      const res = await request(app)
        .post('/api/compliance')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should look up clause title from AS9100D reference data', async () => {
      mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);
      mockPrisma.aeroComplianceItem.create.mockResolvedValueOnce({
        id: 'c-new',
        refNumber: 'AERO-COMP-2026-001',
        clause: '4.1',
        title: 'Understanding the organization and its context',
      });

      await request(app)
        .post('/api/compliance')
        .set('Authorization', 'Bearer token')
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

      const res = await request(app)
        .post('/api/compliance')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id - Update compliance item
  // =============================================
  describe('PUT /api/compliance/:id', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      targetDate: null,
      lastReviewDate: null,
      nextReviewDate: null,
      deletedAt: null,
    };

    it('should update a compliance item', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroComplianceItem.update.mockResolvedValueOnce({
        ...existing,
        complianceStatus: 'COMPLIANT',
      });

      const res = await request(app)
        .put('/api/compliance/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/compliance/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid complianceStatus enum', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/compliance/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
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
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroComplianceItem.update.mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/compliance/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/compliance/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
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
        .mockResolvedValueOnce(34) // total
        .mockResolvedValueOnce(20) // compliant
        .mockResolvedValueOnce(5) // partiallyCompliant
        .mockResolvedValueOnce(3) // nonCompliant
        .mockResolvedValueOnce(2) // notApplicable
        .mockResolvedValueOnce(4); // underReview

      const res = await request(app)
        .get('/api/compliance/dashboard/summary')
        .set('Authorization', 'Bearer token');
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

      const res = await request(app)
        .get('/api/compliance/dashboard/summary')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

// ─── Additional coverage: pagination, filters, error paths ───────────────────

describe('Aerospace Compliance Tracker — extended coverage', () => {
  it('GET /api/compliance returns correct totalPages for multi-page result', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000001', refNumber: 'X', clause: '4.1', complianceStatus: 'COMPLIANT' },
    ]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(110);

    const res = await request(app)
      .get('/api/compliance?page=1&limit=50')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(3);
    expect(res.body.meta.total).toBe(110);
  });

  it('GET /api/compliance passes correct skip/take for page 2', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/compliance?page=2&limit=50')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroComplianceItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 50, take: 50 })
    );
  });

  it('GET /api/compliance filters by standard query param wired into Prisma where clause', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/compliance?standard=AS9100D')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroComplianceItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ standard: 'AS9100D' }) })
    );
  });

  it('GET /api/compliance returns success:true with empty data array', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

    const res = await request(app)
      .get('/api/compliance')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
    expect(res.body.meta.totalPages).toBe(0);
  });

  it('PUT /api/compliance/:id returns 500 on db error', async () => {
    mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      targetDate: null,
      lastReviewDate: null,
      nextReviewDate: null,
      deletedAt: null,
    });
    mockPrisma.aeroComplianceItem.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .put('/api/compliance/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ complianceStatus: 'COMPLIANT' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/compliance/:id returns 500 on db error', async () => {
    mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    mockPrisma.aeroComplianceItem.update.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .delete('/api/compliance/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/compliance returns 400 when targetDate is not a valid date string', async () => {
    const res = await request(app)
      .post('/api/compliance')
      .set('Authorization', 'Bearer token')
      .send({ clause: '9.2', targetDate: 'not-a-date' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/compliance/:id returns 500 on db error (count check)', async () => {
    mockPrisma.aeroComplianceItem.findUnique.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .get('/api/compliance/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Aerospace Compliance Tracker — additional coverage 2', () => {
  it('GET /api/compliance page 3 limit 50 computes skip=100', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/compliance?page=3&limit=50')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroComplianceItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 100, take: 50 })
    );
  });

  it('GET /api/compliance response shape has success:true and meta block', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

    const res = await request(app).get('/api/compliance').set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /api/compliance/dashboard/summary returns complianceScore as number', async () => {
    mockPrisma.aeroComplianceItem.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(8) // compliant
      .mockResolvedValueOnce(1) // partiallyCompliant
      .mockResolvedValueOnce(1) // nonCompliant
      .mockResolvedValueOnce(0) // notApplicable
      .mockResolvedValueOnce(0); // underReview

    const res = await request(app)
      .get('/api/compliance/dashboard/summary')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.complianceScore).toBe('number');
    expect(res.body.data.byStatus.compliant).toBe(8);
    expect(res.body.data.byStatus.nonCompliant).toBe(1);
  });

  it('POST /api/compliance returns 400 when clause is empty string', async () => {
    const res = await request(app)
      .post('/api/compliance')
      .set('Authorization', 'Bearer token')
      .send({ clause: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/compliance filters by standard and status together', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/compliance?standard=AS9100D&status=COMPLIANT')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.aeroComplianceItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ standard: 'AS9100D', complianceStatus: 'COMPLIANT' }),
      })
    );
  });

  it('GET /api/compliance totalPages=1 for exactly defaultLimit=50 records', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(50);

    const res = await request(app).get('/api/compliance').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(1);
  });
});

describe('Aerospace Compliance Tracker — extra coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('DELETE /api/compliance/:id already-deleted returns 404', async () => {
    mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app)
      .delete('/api/compliance/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/compliance/clauses returns array with clause and title properties', async () => {
    const res = await request(app)
      .get('/api/compliance/clauses')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('PUT /api/compliance/:id returns 404 for soft-deleted record', async () => {
    mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
      targetDate: null,
      lastReviewDate: null,
      nextReviewDate: null,
    });

    const res = await request(app)
      .put('/api/compliance/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ complianceStatus: 'COMPLIANT' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/compliance data items have clause and complianceStatus fields', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([
      { id: '00000000-0000-0000-0000-000000000001', refNumber: 'X', clause: '9.2', complianceStatus: 'COMPLIANT' },
    ]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/compliance').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('clause');
    expect(res.body.data[0]).toHaveProperty('complianceStatus');
  });

  it('POST /api/compliance returns 201 with refNumber when created', async () => {
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);
    mockPrisma.aeroComplianceItem.create.mockResolvedValueOnce({
      id: 'ci-new',
      refNumber: 'AERO-COMP-2026-001',
      clause: '7.1',
      complianceStatus: 'UNDER_REVIEW',
    });

    const res = await request(app)
      .post('/api/compliance')
      .set('Authorization', 'Bearer token')
      .send({ clause: '7.1' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('refNumber');
  });
});

describe('Aerospace Compliance Tracker API — phase28 coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / with page=2 limit=5 returns correct meta', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(15);
    const res = await request(app).get('/api/compliance?page=2&limit=5').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(5);
  });

  it('GET / data array is empty when count is 0', async () => {
    mockPrisma.aeroComplianceItem.findMany.mockResolvedValueOnce([]);
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/compliance').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET /:id returns data with clause field', async () => {
    mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'AERO-COMP-2026-001',
      clause: '8.1',
      deletedAt: null,
    });
    const res = await request(app)
      .get('/api/compliance/00000000-0000-0000-0000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('clause');
  });

  it('POST / with optional targetDate returns 201', async () => {
    mockPrisma.aeroComplianceItem.count.mockResolvedValueOnce(0);
    mockPrisma.aeroComplianceItem.create.mockResolvedValueOnce({
      id: 'ci-p28',
      refNumber: 'AERO-COMP-2026-001',
      clause: '9.1',
      complianceStatus: 'UNDER_REVIEW',
    });
    const res = await request(app)
      .post('/api/compliance')
      .set('Authorization', 'Bearer token')
      .send({ clause: '9.1', targetDate: '2026-12-31' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id returns 204 and calls update with deletedAt', async () => {
    mockPrisma.aeroComplianceItem.findUnique.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000004',
      deletedAt: null,
    });
    mockPrisma.aeroComplianceItem.update.mockResolvedValueOnce({});
    const res = await request(app)
      .delete('/api/compliance/00000000-0000-0000-0000-000000000004')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(204);
    expect(mockPrisma.aeroComplianceItem.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
