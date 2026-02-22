import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    isControl: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/controls';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/controls', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('InfoSec Controls API', () => {
  const mockControl = {
    id: 'a3000000-0000-4000-a000-000000000001',
    controlId: 'A.5.1',
    domain: 'ORGANISATIONAL',
    title: 'Policies for information security',
    description: 'A set of policies for information security shall be defined',
    applicability: 'APPLICABLE',
    justification: 'Required for ISMS',
    implementationStatus: 'FULLY_IMPLEMENTED',
    implementationNotes: 'Policy document approved',
    evidence: 'Policy_v3.pdf',
    owner: 'CISO',
    reviewDate: null,
    lastReviewedAt: null,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  const mockControl2 = {
    ...mockControl,
    id: 'a3000000-0000-4000-a000-000000000002',
    controlId: 'A.5.2',
    title: 'Information security roles and responsibilities',
    implementationStatus: 'PARTIALLY_IMPLEMENTED',
  };

  // ---- GET /api/controls ----

  describe('GET /api/controls', () => {
    it('should return all controls with pagination', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([
        mockControl,
        mockControl2,
      ]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(2);

      const res = await request(app).get('/api/controls');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    it('should filter by domain', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([mockControl]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/controls?domain=ORGANISATIONAL');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.domain).toBe('ORGANISATIONAL');
    });

    it('should filter by implementationStatus', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/controls?implementationStatus=NOT_IMPLEMENTED');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.implementationStatus).toBe('NOT_IMPLEMENTED');
    });

    it('should support search across title and controlId', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/controls?search=policy');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
    });

    it('should order by controlId ascending', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/controls');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.orderBy).toEqual({ controlId: 'asc' });
    });

    it('should default to limit 50 and page 1', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/controls');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.skip).toBe(0);
      expect(findCall.take).toBe(50);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/controls');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/controls/soa ----

  describe('GET /api/controls/soa', () => {
    it('should return Statement of Applicability', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([
        mockControl,
        mockControl2,
      ]);

      const res = await request(app).get('/api/controls/soa');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.controls).toBeDefined();
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.total).toBe(2);
    });

    it('should calculate summary counts correctly', async () => {
      const notApplicable = {
        ...mockControl,
        id: 'a3000000-0000-4000-a000-000000000003',
        applicability: 'NOT_APPLICABLE',
        implementationStatus: 'NOT_APPLICABLE',
      };
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([
        mockControl,
        notApplicable,
      ]);

      const res = await request(app).get('/api/controls/soa');

      expect(res.body.data.summary.applicable).toBe(1);
      expect(res.body.data.summary.notApplicable).toBe(1);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/controls/soa');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/controls/soa/pdf ----

  describe('GET /api/controls/soa/pdf', () => {
    it('should return a real PDF binary with correct headers', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([mockControl]);

      const res = await request(app).get('/api/controls/soa/pdf');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      expect(res.headers['content-disposition']).toMatch(/attachment/);
      // PDF binary starts with %PDF-1.4
      const bodyStr = Buffer.isBuffer(res.body)
        ? res.body.toString('ascii', 0, 8)
        : String(res.body ?? '');
      expect(bodyStr.startsWith('%PDF-1.4')).toBe(true);
    });

    it('should return PDF even with empty controls list', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);

      const res = await request(app).get('/api/controls/soa/pdf');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
    });
  });

  // ---- GET /api/controls/:id ----

  describe('GET /api/controls/:id', () => {
    it('should return control detail', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);

      const res = await request(app).get('/api/controls/a3000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.controlId).toBe('A.5.1');
    });

    it('should return 404 when control not found', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/controls/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/controls/a3000000-0000-4000-a000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- PUT /api/controls/:id/status ----

  describe('PUT /api/controls/:id/status', () => {
    it('should update applicability to APPLICABLE', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce({
        ...mockControl,
        applicability: 'APPLICABLE',
      });

      const res = await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/status')
        .send({ applicability: 'APPLICABLE', justification: 'Required' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should update applicability to NOT_APPLICABLE with justification', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce({
        ...mockControl,
        applicability: 'NOT_APPLICABLE',
        justification: 'Not relevant to scope',
      });

      const res = await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/status')
        .send({ applicability: 'NOT_APPLICABLE', justification: 'Not relevant to scope' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid applicability value', async () => {
      const res = await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/status')
        .send({ applicability: 'MAYBE', justification: 'test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when justification is missing', async () => {
      const res = await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/status')
        .send({ applicability: 'APPLICABLE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when control not found', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/controls/00000000-0000-0000-0000-000000000099/status')
        .send({ applicability: 'APPLICABLE', justification: 'Required' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/status')
        .send({ applicability: 'APPLICABLE', justification: 'Required' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- PUT /api/controls/:id/implementation ----

  describe('PUT /api/controls/:id/implementation', () => {
    it('should update implementation status', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce({
        ...mockControl,
        implementationStatus: 'FULLY_IMPLEMENTED',
      });

      const res = await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/implementation')
        .send({ implementationStatus: 'FULLY_IMPLEMENTED', evidence: 'Evidence.pdf' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when control not found', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/controls/00000000-0000-0000-0000-000000000099/implementation')
        .send({ implementationStatus: 'NOT_IMPLEMENTED' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid implementationStatus', async () => {
      const res = await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/implementation')
        .send({ implementationStatus: 'SORT_OF_DONE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should accept optional fields like evidence, owner, reviewDate', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce(mockControl);

      const res = await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/implementation')
        .send({
          implementationStatus: 'PARTIALLY_IMPLEMENTED',
          implementationNotes: 'In progress',
          evidence: 'Doc.pdf',
          owner: 'IT Team',
          reviewDate: '2026-06-01',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should set updatedBy from authenticated user', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce(mockControl);

      await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/implementation')
        .send({ implementationStatus: 'FULLY_IMPLEMENTED' });

      const updateCall = (mockPrisma.isControl.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.updatedBy).toBe('00000000-0000-4000-a000-000000000123');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/controls/a3000000-0000-4000-a000-000000000001/implementation')
        .send({ implementationStatus: 'FULLY_IMPLEMENTED' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});

// ===================================================================
// InfoSec Controls — additional response shape coverage
// ===================================================================
describe('InfoSec Controls — additional response shape coverage', () => {
  it('GET /api/controls returns success:true with pagination on success', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/controls/soa returns success:false and 500 on database error', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockRejectedValueOnce(new Error('Connection lost'));

    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// InfoSec Controls — extended boundary and pagination coverage
// ===================================================================
describe('InfoSec Controls — pre-extended coverage', () => {
  const baseCtrl = {
    id: 'a3000000-0000-4000-a000-000000000001',
    controlId: 'A.5.1',
    domain: 'ORGANISATIONAL',
    title: 'Policies for information security',
    description: 'A set of policies',
    applicability: 'APPLICABLE',
    justification: 'Required',
    implementationStatus: 'FULLY_IMPLEMENTED',
    implementationNotes: null,
    evidence: null,
    owner: 'CISO',
    reviewDate: null,
    lastReviewedAt: null,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/controls data is an array on success', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([baseCtrl]);
    (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /api/controls/:id/implementation NOT_IMPLEMENTED status is valid', async () => {
    (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(baseCtrl);
    (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce({
      ...baseCtrl,
      implementationStatus: 'NOT_IMPLEMENTED',
    });
    const res = await request(app)
      .put('/api/controls/a3000000-0000-4000-a000-000000000001/implementation')
      .send({ implementationStatus: 'NOT_IMPLEMENTED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/controls/soa controls array length matches mocked findMany return', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([baseCtrl]);
    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(200);
    expect(res.body.data.controls).toHaveLength(1);
  });
});

describe('InfoSec Controls — extended boundary and pagination coverage', () => {
  const baseControl = {
    id: 'a3000000-0000-4000-a000-000000000001',
    controlId: 'A.5.1',
    domain: 'ORGANISATIONAL',
    title: 'Policies for information security',
    description: 'A set of policies',
    applicability: 'APPLICABLE',
    justification: 'Required',
    implementationStatus: 'FULLY_IMPLEMENTED',
    implementationNotes: null,
    evidence: null,
    owner: 'CISO',
    reviewDate: null,
    lastReviewedAt: null,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/controls pagination contains totalPages', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([baseControl]);
    (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(50);

    const res = await request(app).get('/api/controls?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('totalPages', 5);
  });

  it('GET /api/controls custom page and limit are reflected in pagination', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

    const res = await request(app).get('/api/controls?page=3&limit=20');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(20);
  });

  it('GET /api/controls responds with JSON content-type', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

    const res = await request(app).get('/api/controls');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/controls/soa summary contains implemented count', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([
      { ...baseControl, implementationStatus: 'FULLY_IMPLEMENTED' },
      { ...baseControl, id: 'a3000000-0000-4000-a000-000000000002', controlId: 'A.5.2', implementationStatus: 'NOT_IMPLEMENTED' },
    ]);

    const res = await request(app).get('/api/controls/soa');
    expect(res.status).toBe(200);
    expect(res.body.data.summary).toHaveProperty('fullyImplemented');
  });

  it('GET /api/controls/soa PDF endpoint returns content-disposition attachment', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([baseControl]);

    const res = await request(app).get('/api/controls/soa/pdf');
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });

  it('PUT /api/controls/:id/status returns 400 when body is empty', async () => {
    const res = await request(app)
      .put('/api/controls/a3000000-0000-4000-a000-000000000001/status')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/controls/:id/implementation accepts PARTIALLY_IMPLEMENTED status', async () => {
    (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(baseControl);
    (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce({
      ...baseControl,
      implementationStatus: 'PARTIALLY_IMPLEMENTED',
    });

    const res = await request(app)
      .put('/api/controls/a3000000-0000-4000-a000-000000000001/implementation')
      .send({ implementationStatus: 'PARTIALLY_IMPLEMENTED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/controls data items have controlId field', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([baseControl]);
    (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(1);

    const res = await request(app).get('/api/controls');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('controlId');
  });

  it('GET /api/controls filter by domain PEOPLE passes to prisma query', async () => {
    (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

    await request(app).get('/api/controls?domain=PEOPLE');

    const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
    expect(findCall.where.domain).toBe('PEOPLE');
  });
});
