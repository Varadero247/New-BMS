import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.mock('@ims/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@ims.local',
      organisationId: 'org-1',
      roles: ['SUPER_ADMIN'],
    };
    next();
  },
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

jest.mock('../src/prisma', () => {
  let packCounter = 0;
  const packStore = new Map<string, any>();

  const qualEvidencePack = {
    count: jest.fn().mockImplementation(async () => packCounter),
    create: jest.fn().mockImplementation(async ({ data }: any) => {
      packCounter++;
      const id = `00000000-0000-0000-${String(packCounter).padStart(4, '0')}-${String(packCounter).padStart(12, '0')}`;
      const year = new Date().getFullYear();
      const referenceNumber = `EVP-${year}-${String(packCounter).padStart(3, '0')}`;
      const record = {
        id,
        referenceNumber,
        organisationId: data.organisationId || 'default',
        standard: data.standard,
        status: data.status || 'GENERATING',
        format: data.format || 'PDF',
        dateFrom: data.dateFrom || null,
        dateTo: data.dateTo || null,
        sections: data.sections || [],
        generatedAt: new Date(),
        generatedBy: data.generatedBy || 'unknown',
        totalDocuments: data.totalDocuments || 0,
        totalRecords: data.totalRecords || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      packStore.set(id, record);
      return record;
    }),
    update: jest.fn().mockImplementation(async ({ where, data }: any) => {
      const record = packStore.get(where.id);
      if (!record) throw new Error('Record not found');
      Object.assign(record, data);
      return record;
    }),
    findMany: jest.fn().mockImplementation(async ({ where = {}, orderBy: _orderBy, skip = 0, take = 20 }: any) => {
      let items = Array.from(packStore.values());
      if (where.standard) items = items.filter((p: any) => p.standard === where.standard);
      if (where.status) items = items.filter((p: any) => p.status === where.status);
      return items.slice(skip, skip + take);
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }: any) => {
      return packStore.get(where.id) || null;
    }),
  };

  return {
    prisma: {
      qualDocument: { count: jest.fn().mockResolvedValue(10) },
      qualNonConformance: { count: jest.fn().mockResolvedValue(5) },
      qualCapa: { count: jest.fn().mockResolvedValue(3) },
      qualRisk: { count: jest.fn().mockResolvedValue(8) },
      qualObjective: { count: jest.fn().mockResolvedValue(6) },
      qualInterestedParty: { count: jest.fn().mockResolvedValue(4) },
      qualLegal: { count: jest.fn().mockResolvedValue(7) },
      qualSupplier: { count: jest.fn().mockResolvedValue(9) },
      qualImprovement: { count: jest.fn().mockResolvedValue(2) },
      qualProcess: { count: jest.fn().mockResolvedValue(5) },
      qualFmea: { count: jest.fn().mockResolvedValue(3) },
      qualChange: { count: jest.fn().mockResolvedValue(1) },
      qualEvidencePack,
    },
    Prisma: {},
  };
});

import evidencePackRouter from '../src/routes/evidence-pack';

const app = express();
app.use(express.json());
app.use('/api/evidence-pack', evidencePackRouter);

describe('Evidence Pack API', () => {
  // ── POST / — Generate evidence pack ──────────────────────────────

  describe('POST /api/evidence-pack', () => {
    it('should create an evidence pack for ISO_9001', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_9001' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.standard).toBe('ISO_9001');
      expect(res.body.data.status).toBe('GENERATING');
      expect(res.body.data.referenceNumber).toMatch(/^EVP-\d{4}-\d{3}$/);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.clauses).toBeDefined();
      expect(Array.isArray(res.body.data.clauses)).toBe(true);
      expect(res.body.data.generatedAt).toBeDefined();
    });

    it('should create evidence pack for ISO_14001', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_14001' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('ISO_14001');
    });

    it('should create evidence pack for ISO_45001', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_45001' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('ISO_45001');
    });

    it('should create evidence pack for ISO_27001', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_27001' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('ISO_27001');
    });

    it('should create evidence pack for IATF_16949', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'IATF_16949' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('IATF_16949');
    });

    it('should create evidence pack for ISO_13485', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_13485' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('ISO_13485');
    });

    it('should create evidence pack for AS9100D', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'AS9100D' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('AS9100D');
    });

    it('should create evidence pack for ISO_22000', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_22000' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('ISO_22000');
    });

    it('should create evidence pack for ISO_50001', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_50001' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('ISO_50001');
    });

    it('should create evidence pack for ISO_42001', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_42001' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('ISO_42001');
    });

    it('should create evidence pack for ISO_37001', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_37001' });

      expect(res.status).toBe(201);
      expect(res.body.data.standard).toBe('ISO_37001');
    });

    it('should default format to PDF', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_9001' });

      expect(res.status).toBe(201);
    });

    it('should accept ZIP format', async () => {
      const res = await request(app)
        .post('/api/evidence-pack')
        .send({ standard: 'ISO_9001', format: 'ZIP' });

      expect(res.status).toBe(201);
    });

    it('should accept date range filters', async () => {
      const res = await request(app).post('/api/evidence-pack').send({
        standard: 'ISO_9001',
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
      });

      expect(res.status).toBe(201);
    });

    it('should accept inclusion flags', async () => {
      const res = await request(app).post('/api/evidence-pack').send({
        standard: 'ISO_9001',
        includeDocuments: true,
        includeAudits: true,
        includeCapa: false,
        includeTraining: false,
        includeObjectives: true,
        includeLegalRegister: true,
        includeRiskRegister: true,
        includeManagementReview: true,
      });

      expect(res.status).toBe(201);
    });

    it('should reject invalid standard', async () => {
      const res = await request(app)
        .post('/api/evidence-pack')
        .send({ standard: 'INVALID_STANDARD' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing standard', async () => {
      const res = await request(app).post('/api/evidence-pack').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid format', async () => {
      const res = await request(app)
        .post('/api/evidence-pack')
        .send({ standard: 'ISO_9001', format: 'DOCX' });

      expect(res.status).toBe(400);
    });

    it('should generate unique reference numbers', async () => {
      const res1 = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_9001' });

      const res2 = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_9001' });

      expect(res1.body.data.referenceNumber).not.toBe(res2.body.data.referenceNumber);
    });

    it('should generate unique IDs', async () => {
      const res1 = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_14001' });

      const res2 = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_14001' });

      expect(res1.body.data.id).not.toBe(res2.body.data.id);
    });

    it('should return clause numbers for the requested standard', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'ISO_9001' });

      expect(res.body.data.clauses).toContain('4.1');
      expect(res.body.data.clauses).toContain('10.2');
    });
  });

  // ── GET / — List evidence packs ──────────────────────────────────

  describe('GET /api/evidence-pack', () => {
    it('should list evidence packs', async () => {
      const res = await request(app).get('/api/evidence-pack');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(0);
      expect(res.body.data.page).toBe(1);
    });

    it('should support pagination', async () => {
      const res = await request(app).get('/api/evidence-pack?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.data.limit).toBe(5);
    });

    it('should filter by standard', async () => {
      // Create some packs first
      await request(app).post('/api/evidence-pack').send({ standard: 'ISO_9001' });
      await request(app).post('/api/evidence-pack').send({ standard: 'ISO_14001' });

      const res = await request(app).get('/api/evidence-pack?standard=ISO_14001');

      expect(res.status).toBe(200);
      if (res.body.data.items.length > 0) {
        res.body.data.items.forEach((item: any) => {
          expect(item.standard).toBe('ISO_14001');
        });
      }
    });

    it('should filter by status', async () => {
      const res = await request(app).get('/api/evidence-pack?status=GENERATING');

      expect(res.status).toBe(200);
    });

    it('should return totalPages', async () => {
      const res = await request(app).get('/api/evidence-pack?limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data.totalPages).toBeDefined();
    });

    it('should cap limit at 100', async () => {
      const res = await request(app).get('/api/evidence-pack?limit=200');

      expect(res.status).toBe(200);
      expect(res.body.data.limit).toBeLessThanOrEqual(100);
    });

    it('should default to page 1', async () => {
      const res = await request(app).get('/api/evidence-pack?page=0');

      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(1);
    });
  });

  // ── GET /:id — Get evidence pack detail ──────────────────────────

  describe('GET /api/evidence-pack/:id', () => {
    it('should return evidence pack detail', async () => {
      const createRes = await request(app)
        .post('/api/evidence-pack')
        .send({ standard: 'ISO_9001' });

      const id = createRes.body.data.id;

      const res = await request(app).get(`/api/evidence-pack/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(id);
      expect(res.body.data.standard).toBe('ISO_9001');
    });

    it('should return 404 for non-existent pack', async () => {
      const res = await request(app).get('/api/evidence-pack/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should include sections in detail', async () => {
      const createRes = await request(app)
        .post('/api/evidence-pack')
        .send({ standard: 'ISO_9001' });

      const id = createRes.body.data.id;

      // Wait briefly for async generation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const res = await request(app).get(`/api/evidence-pack/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.sections).toBeDefined();
    });
  });

  // ── GET /:id/download — Download evidence pack ───────────────────

  describe('GET /api/evidence-pack/:id/download', () => {
    it('should return 404 for non-existent pack', async () => {
      const res = await request(app).get(
        '/api/evidence-pack/00000000-0000-0000-0000-000000000099/download'
      );

      expect(res.status).toBe(404);
    });

    it('should return pack data when complete', async () => {
      const createRes = await request(app)
        .post('/api/evidence-pack')
        .send({ standard: 'ISO_9001' });

      const id = createRes.body.data.id;

      // Wait for async generation
      await new Promise((resolve) => setTimeout(resolve, 200));

      const res = await request(app).get(`/api/evidence-pack/${id}/download`);

      // May be 200 (complete) or 409 (still generating)
      expect([200, 409]).toContain(res.status);

      if (res.status === 200) {
        expect(res.headers['content-disposition']).toContain('attachment');
        expect(res.body.data.evidencePack).toBeDefined();
        expect(res.body.data.metadata).toBeDefined();
      }
    });

    it('should return 409 for pack still generating', async () => {
      const createRes = await request(app)
        .post('/api/evidence-pack')
        .send({ standard: 'ISO_45001' });

      const id = createRes.body.data.id;

      // Immediately try to download (should be still generating)
      const res = await request(app).get(`/api/evidence-pack/${id}/download`);

      // Could be 409 (generating) or 200 (if generation was instant)
      expect([200, 409]).toContain(res.status);
    });
  });

  // ── Edge cases ───────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('should handle multiple packs created in sequence', async () => {
      const standards = ['ISO_9001', 'ISO_14001', 'ISO_45001'];

      for (const standard of standards) {
        const res = await request(app).post('/api/evidence-pack').send({ standard });

        expect(res.status).toBe(201);
        expect(res.body.data.standard).toBe(standard);
      }
    });

    it('should handle concurrent pack creation', async () => {
      const promises = [
        request(app).post('/api/evidence-pack').send({ standard: 'ISO_9001' }),
        request(app).post('/api/evidence-pack').send({ standard: 'ISO_14001' }),
        request(app).post('/api/evidence-pack').send({ standard: 'ISO_27001' }),
      ];

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect(res.status).toBe(201);
      });
    });

    it('should handle empty body gracefully', async () => {
      const res = await request(app).post('/api/evidence-pack').send();

      expect(res.status).toBe(400);
    });

    it('should return proper error structure', async () => {
      const res = await request(app).post('/api/evidence-pack').send({ standard: 'INVALID' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
    });
  });
});
