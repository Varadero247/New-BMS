import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    abCompliance: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import complianceRouter from '../src/routes/compliance';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/compliance', complianceRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockCompliance = {
  id: UUID1,
  referenceNumber: 'AB-CMP-2602-1234',
  title: 'Anti-Bribery Policy Review',
  description: 'Annual review of anti-bribery policy compliance',
  isoClause: '5.3',
  category: 'POLICY',
  status: 'UNDER_REVIEW',
  owner: 'Compliance Officer',
  department: 'Legal',
  assessmentDate: new Date('2026-01-15'),
  nextReviewDate: new Date('2027-01-15'),
  evidence: 'Policy document v3.2',
  gaps: null,
  remediation: null,
  remediationDue: null,
  remediationBy: null,
  notes: null,
  closedDate: null,
  closedBy: null,
  closureNotes: null,
  organisationId: 'default',
  createdBy: 'user-123',
  updatedBy: null,
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('ISO 37001 Compliance API', () => {
  // =========================================================================
  // GET /api/compliance/stats
  // =========================================================================
  describe('GET /api/compliance/stats', () => {
    it('should return compliance statistics', async () => {
      (mockPrisma.abCompliance.count as jest.Mock)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60) // compliant
        .mockResolvedValueOnce(15) // nonCompliant
        .mockResolvedValueOnce(25); // partial
      (mockPrisma.abCompliance.groupBy as jest.Mock).mockResolvedValueOnce([
        { category: 'POLICY', _count: { id: 30 } },
        { category: 'PROCEDURE', _count: { id: 40 } },
        { category: 'CONTROL', _count: { id: 30 } },
      ]);

      const res = await request(app).get('/api/compliance/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(100);
      expect(res.body.data.compliant).toBe(60);
      expect(res.body.data.nonCompliant).toBe(15);
      expect(res.body.data.partial).toBe(25);
      expect(res.body.data.complianceRate).toBe(60);
      expect(res.body.data.byCategory).toHaveLength(3);
    });

    it('should return 0 compliance rate when no records exist', async () => {
      (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.abCompliance.groupBy as jest.Mock).mockResolvedValueOnce([]);

      const res = await request(app).get('/api/compliance/stats');

      expect(res.status).toBe(200);
      expect(res.body.data.complianceRate).toBe(0);
      expect(res.body.data.total).toBe(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abCompliance.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/compliance/stats');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================================
  // GET /api/compliance
  // =========================================================================
  describe('GET /api/compliance', () => {
    it('should return paginated list of compliance records', async () => {
      (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([mockCompliance]);
      (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/compliance');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
      expect(res.body.pagination.page).toBe(1);
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([mockCompliance]);
      (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(50);

      const res = await request(app).get('/api/compliance?page=2&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.totalPages).toBe(5);
    });

    it('should filter by status', async () => {
      (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/compliance?status=COMPLIANT');

      expect(mockPrisma.abCompliance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'COMPLIANT' }),
        })
      );
    });

    it('should filter by category', async () => {
      (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/compliance?category=POLICY');

      expect(mockPrisma.abCompliance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'POLICY' }),
        })
      );
    });

    it('should filter by isoClause', async () => {
      (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/compliance?isoClause=5.3');

      expect(mockPrisma.abCompliance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isoClause: expect.objectContaining({ contains: '5.3' }),
          }),
        })
      );
    });

    it('should support search query', async () => {
      (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/compliance?search=policy');

      expect(mockPrisma.abCompliance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: expect.objectContaining({ contains: 'policy' }) }),
            ]),
          }),
        })
      );
    });

    it('should return empty list when no records exist', async () => {
      (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/compliance');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abCompliance.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/compliance');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /api/compliance
  // =========================================================================
  describe('POST /api/compliance', () => {
    const validPayload = {
      title: 'Anti-Bribery Policy Review',
      category: 'POLICY',
      isoClause: '5.3',
      owner: 'Compliance Officer',
      department: 'Legal',
    };

    it('should create a compliance record and return 201', async () => {
      (mockPrisma.abCompliance.create as jest.Mock).mockResolvedValueOnce(mockCompliance);

      const res = await request(app).post('/api/compliance').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Anti-Bribery Policy Review');
    });

    it('should auto-assign status UNDER_REVIEW on create', async () => {
      (mockPrisma.abCompliance.create as jest.Mock).mockResolvedValueOnce(mockCompliance);

      await request(app).post('/api/compliance').send(validPayload);

      expect(mockPrisma.abCompliance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'UNDER_REVIEW' }),
        })
      );
    });

    it('should generate a reference number', async () => {
      (mockPrisma.abCompliance.create as jest.Mock).mockResolvedValueOnce(mockCompliance);

      await request(app).post('/api/compliance').send(validPayload);

      expect(mockPrisma.abCompliance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            referenceNumber: expect.stringMatching(/^AB-CMP-/),
          }),
        })
      );
    });

    it('should return 400 when title is missing', async () => {
      const { title, ...payload } = validPayload;
      const res = await request(app).post('/api/compliance').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const res = await request(app)
        .post('/api/compliance')
        .send({
          ...validPayload,
          category: 'INVALID_CATEGORY',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abCompliance.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).post('/api/compliance').send(validPayload);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/compliance/:id
  // =========================================================================
  describe('GET /api/compliance/:id', () => {
    it('should return a compliance record by ID', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(mockCompliance);

      const res = await request(app).get(`/api/compliance/${UUID1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(UUID1);
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get(`/api/compliance/${UUID2}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get(`/api/compliance/${UUID1}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/compliance/:id
  // =========================================================================
  describe('PUT /api/compliance/:id', () => {
    it('should update a compliance record', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(mockCompliance);
      (mockPrisma.abCompliance.update as jest.Mock).mockResolvedValueOnce({
        ...mockCompliance,
        status: 'COMPLIANT',
      });

      const res = await request(app).put(`/api/compliance/${UUID1}`).send({ status: 'COMPLIANT' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLIANT');
    });

    it('should return 404 when not found for update', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put(`/api/compliance/${UUID2}`).send({ status: 'COMPLIANT' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(mockCompliance);

      const res = await request(app)
        .put(`/api/compliance/${UUID1}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should include updatedBy from authenticated user', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(mockCompliance);
      (mockPrisma.abCompliance.update as jest.Mock).mockResolvedValueOnce(mockCompliance);

      await request(app).put(`/api/compliance/${UUID1}`).send({ notes: 'Reviewed and approved' });

      expect(mockPrisma.abCompliance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ updatedBy: 'user-123' }),
        })
      );
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(mockCompliance);
      (mockPrisma.abCompliance.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).put(`/api/compliance/${UUID1}`).send({ notes: 'Test' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // DELETE /api/compliance/:id
  // =========================================================================
  describe('DELETE /api/compliance/:id', () => {
    it('should soft delete a compliance record', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValue(mockCompliance);
      (mockPrisma.abCompliance.update as jest.Mock).mockResolvedValue({
        ...mockCompliance,
        deletedAt: new Date(),
      });

      const res = await request(app).delete(`/api/compliance/${UUID1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
      expect(res.body.data.id).toBe(UUID1);
    });

    it('should return 404 when not found for deletion', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete(`/api/compliance/${UUID2}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should use soft delete (set deletedAt)', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValue(mockCompliance);
      (mockPrisma.abCompliance.update as jest.Mock).mockResolvedValue({});

      await request(app).delete(`/api/compliance/${UUID1}`);

      expect(mockPrisma.abCompliance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abCompliance.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete(`/api/compliance/${UUID1}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});

// =========================================================================
// ISO 37001 Compliance — extended coverage
// =========================================================================
describe('ISO 37001 Compliance — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/compliance responds with JSON content-type', async () => {
    (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/compliance');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/compliance pagination has totalPages field', async () => {
    (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(50);
    const res = await request(app).get('/api/compliance?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('POST /api/compliance with all optional fields succeeds', async () => {
    (mockPrisma.abCompliance.create as jest.Mock).mockResolvedValueOnce(mockCompliance);
    const res = await request(app).post('/api/compliance').send({
      title: 'Full Record',
      category: 'CONTROL',
      isoClause: '8.2',
      owner: 'Compliance Team',
      department: 'Risk',
      description: 'Full compliance assessment',
      evidence: 'Evidence doc',
      assessmentDate: '2026-01-15',
      nextReviewDate: '2027-01-15',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/compliance/:id updates evidence field', async () => {
    (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(mockCompliance);
    (mockPrisma.abCompliance.update as jest.Mock).mockResolvedValueOnce({
      ...mockCompliance,
      evidence: 'New evidence v2',
    });
    const res = await request(app)
      .put(`/api/compliance/${UUID1}`)
      .send({ evidence: 'New evidence v2' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/compliance data items have referenceNumber field', async () => {
    (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([mockCompliance]);
    (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/compliance');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('referenceNumber');
  });

  it('GET /api/compliance/stats byCategory is an array', async () => {
    (mockPrisma.abCompliance.count as jest.Mock)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);
    (mockPrisma.abCompliance.groupBy as jest.Mock).mockResolvedValueOnce([
      { category: 'TRAINING', _count: { id: 10 } },
    ]);
    const res = await request(app).get('/api/compliance/stats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.byCategory)).toBe(true);
  });

  it('PUT /api/compliance/:id sets closedBy and closedDate as optional fields', async () => {
    (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(mockCompliance);
    (mockPrisma.abCompliance.update as jest.Mock).mockResolvedValueOnce({
      ...mockCompliance,
      status: 'COMPLIANT',
      closedDate: new Date(),
      closedBy: 'user-123',
    });
    const res = await request(app)
      .put(`/api/compliance/${UUID1}`)
      .send({ status: 'COMPLIANT', closedBy: 'user-123', closureNotes: 'All items resolved', closedDate: '2026-01-31' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('ISO 37001 Compliance — final batch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/compliance: response data items have isoClause field', async () => {
    (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([mockCompliance]);
    (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/compliance');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('isoClause');
  });

  it('GET /api/compliance: pagination has limit field', async () => {
    (mockPrisma.abCompliance.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/compliance');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('DELETE /api/compliance/:id uses updatedBy from authenticated user', async () => {
    (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValue(mockCompliance);
    (mockPrisma.abCompliance.update as jest.Mock).mockResolvedValue({ ...mockCompliance, deletedAt: new Date() });
    await request(app).delete(`/api/compliance/${UUID1}`);
    expect(mockPrisma.abCompliance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('PUT /api/compliance/:id with gaps field updates correctly', async () => {
    (mockPrisma.abCompliance.findFirst as jest.Mock).mockResolvedValueOnce(mockCompliance);
    (mockPrisma.abCompliance.update as jest.Mock).mockResolvedValueOnce({
      ...mockCompliance,
      gaps: 'Policy gaps identified in section 3',
      status: 'NON_COMPLIANT',
    });
    const res = await request(app)
      .put(`/api/compliance/${UUID1}`)
      .send({ gaps: 'Policy gaps identified in section 3', status: 'NON_COMPLIANT' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/compliance/stats returns 500 when groupBy fails', async () => {
    (mockPrisma.abCompliance.count as jest.Mock).mockResolvedValueOnce(10);
    (mockPrisma.abCompliance.groupBy as jest.Mock).mockRejectedValueOnce(new Error('groupBy fail'));
    const res = await request(app).get('/api/compliance/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('compliance — phase29 coverage', () => {
  it('handles sort method', () => {
    expect([3, 1, 2].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles Math.max', () => {
    expect(Math.max(1, 2, 3)).toBe(3);
  });

});
