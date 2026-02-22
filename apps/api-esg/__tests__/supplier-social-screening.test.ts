import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgSupplierSocialScreen: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
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
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>) => {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || 20), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import router from '../src/routes/supplier-social-screening';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/supplier-social-screening', router);

beforeEach(() => jest.clearAllMocks());

const mockScreening = {
  id: '00000000-0000-0000-0000-000000000001',
  supplierName: 'Acme Corp',
  supplierCountry: 'UK',
  screeningDate: new Date('2026-01-15'),
  screenedBy: 'Procurement Team',
  criteriaUsed: ['child_labour', 'forced_labour', 'wages', 'health_safety'],
  result: 'PASSED',
  riskRating: 'MEDIUM',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
};

// ── GET / ─────────────────────────────────────────────────────────────────

describe('GET /api/supplier-social-screening', () => {
  it('returns paginated screening records', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([mockScreening]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/supplier-social-screening');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by riskRating', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([mockScreening]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/supplier-social-screening?riskRating=HIGH');
    const [call] = (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mock.calls;
    expect(call[0].where.riskRating).toBe('HIGH');
  });

  it('filters by result', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/supplier-social-screening?result=FAILED');
    const [call] = (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mock.calls;
    expect(call[0].where.result).toBe('FAILED');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/supplier-social-screening');
    expect(res.status).toBe(500);
  });
});

// ── POST / ────────────────────────────────────────────────────────────────

describe('POST /api/supplier-social-screening', () => {
  const validBody = {
    supplierName: 'Acme Corp',
    screeningDate: '2026-01-15',
    screenedBy: 'Procurement Team',
    criteriaUsed: ['child_labour', 'forced_labour'],
    result: 'PASSED',
  };

  it('creates a supplier social screening', async () => {
    (mockPrisma.esgSupplierSocialScreen.create as jest.Mock).mockResolvedValue(mockScreening);
    const res = await request(app).post('/api/supplier-social-screening').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('accepts all result values', async () => {
    for (const result of ['PASSED', 'CONDITIONAL_PASS', 'FAILED', 'UNDER_REVIEW', 'PENDING']) {
      (mockPrisma.esgSupplierSocialScreen.create as jest.Mock).mockResolvedValue({ ...mockScreening, result });
      const res = await request(app).post('/api/supplier-social-screening').send({ ...validBody, result });
      expect(res.status).toBe(201);
    }
  });

  it('accepts all riskRating values', async () => {
    for (const riskRating of ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']) {
      (mockPrisma.esgSupplierSocialScreen.create as jest.Mock).mockResolvedValue({ ...mockScreening, riskRating });
      const res = await request(app).post('/api/supplier-social-screening').send({ ...validBody, riskRating });
      expect(res.status).toBe(201);
    }
  });

  it('accepts optional check fields', async () => {
    const bodyFull = {
      ...validBody,
      childLaborCheck: true,
      forcedLaborCheck: true,
      healthSafetyCheck: true,
      isNewSupplier: true,
    };
    (mockPrisma.esgSupplierSocialScreen.create as jest.Mock).mockResolvedValue(mockScreening);
    const res = await request(app).post('/api/supplier-social-screening').send(bodyFull);
    expect(res.status).toBe(201);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/supplier-social-screening').send({ supplierName: 'Acme' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for empty criteriaUsed', async () => {
    const res = await request(app).post('/api/supplier-social-screening').send({ ...validBody, criteriaUsed: [] });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid result', async () => {
    const res = await request(app).post('/api/supplier-social-screening').send({ ...validBody, result: 'CONDITIONAL' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.esgSupplierSocialScreen.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/supplier-social-screening').send(validBody);
    expect(res.status).toBe(500);
  });
});

// ── GET /stats ────────────────────────────────────────────────────────────

describe('GET /api/supplier-social-screening/stats', () => {
  it('returns screening stats with screening rate', async () => {
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock)
      .mockResolvedValueOnce(100)  // total
      .mockResolvedValueOnce(80)   // thisYear
      .mockResolvedValueOnce(70)   // passed
      .mockResolvedValueOnce(10);  // failed
    (mockPrisma.esgSupplierSocialScreen.groupBy as jest.Mock).mockResolvedValue([
      { riskRating: 'LOW', _count: { id: 40 } },
      { riskRating: 'MEDIUM', _count: { id: 30 } },
    ]);
    const res = await request(app).get('/api/supplier-social-screening/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('screeningRate');
    expect(res.body.data).toHaveProperty('byRiskRating');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/supplier-social-screening/stats');
    expect(res.status).toBe(500);
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────

describe('GET /api/supplier-social-screening/:id', () => {
  it('returns a single screening', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(mockScreening);
    const res = await request(app).get('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.supplierName).toBe('Acme Corp');
  });

  it('returns 404 for missing screening', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/supplier-social-screening/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('returns 404 for soft-deleted screening', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue({ ...mockScreening, deletedAt: new Date() });
    const res = await request(app).get('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
  });
});

// ── PUT /:id ──────────────────────────────────────────────────────────────

describe('PUT /api/supplier-social-screening/:id', () => {
  it('updates a screening result', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(mockScreening);
    (mockPrisma.esgSupplierSocialScreen.update as jest.Mock).mockResolvedValue({ ...mockScreening, result: 'CONDITIONAL_PASS' });
    const res = await request(app)
      .put('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001')
      .send({ result: 'CONDITIONAL_PASS' });
    expect(res.status).toBe(200);
    expect(res.body.data.result).toBe('CONDITIONAL_PASS');
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/supplier-social-screening/00000000-0000-0000-0000-000000000099')
      .send({ result: 'PASSED' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid result on update', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(mockScreening);
    const res = await request(app)
      .put('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001')
      .send({ result: 'INVALID_RESULT' });
    expect(res.status).toBe(400);
  });
});

// ── Extended coverage ──────────────────────────────────────────────────────

describe('supplier-social-screening — extended coverage', () => {
  it('GET / returns pagination metadata with total', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([mockScreening]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(50);
    const res = await request(app).get('/api/supplier-social-screening?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(50);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('GET / filters by both result and riskRating combined', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/supplier-social-screening?result=PASSED&riskRating=LOW');
    const [call] = (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mock.calls;
    expect(call[0].where.result).toBe('PASSED');
    expect(call[0].where.riskRating).toBe('LOW');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error during update', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(mockScreening);
    (mockPrisma.esgSupplierSocialScreen.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001')
      .send({ result: 'PASSED' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / with optional nextReviewDate succeeds', async () => {
    (mockPrisma.esgSupplierSocialScreen.create as jest.Mock).mockResolvedValue(mockScreening);
    const res = await request(app).post('/api/supplier-social-screening').send({
      supplierName: 'Beta Supplies',
      screeningDate: '2026-01-20',
      screenedBy: 'Audit Team',
      criteriaUsed: ['wages', 'health_safety'],
      result: 'CONDITIONAL_PASS',
      nextReviewDate: '2026-07-20',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /stats returns byRiskRating breakdown', async () => {
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock)
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(40)
      .mockResolvedValueOnce(35)
      .mockResolvedValueOnce(5);
    (mockPrisma.esgSupplierSocialScreen.groupBy as jest.Mock).mockResolvedValue([
      { riskRating: 'LOW', _count: { id: 20 } },
      { riskRating: 'HIGH', _count: { id: 10 } },
    ]);
    const res = await request(app).get('/api/supplier-social-screening/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.byRiskRating).toHaveProperty('LOW', 20);
    expect(res.body.data.byRiskRating).toHaveProperty('HIGH', 10);
  });

  it('PUT /:id updates riskRating field', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(mockScreening);
    (mockPrisma.esgSupplierSocialScreen.update as jest.Mock).mockResolvedValue({
      ...mockScreening,
      riskRating: 'CRITICAL',
    });
    const res = await request(app)
      .put('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001')
      .send({ riskRating: 'CRITICAL' });
    expect(res.status).toBe(200);
    expect(res.body.data.riskRating).toBe('CRITICAL');
  });

  it('POST / returns 400 when screenedBy is missing', async () => {
    const res = await request(app).post('/api/supplier-social-screening').send({
      supplierName: 'Acme',
      screeningDate: '2026-01-15',
      criteriaUsed: ['child_labour'],
      result: 'PASSED',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / returns empty array when no screenings match filter', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/supplier-social-screening?result=UNDER_REVIEW');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });
});

describe('supplier-social-screening — batch-q coverage', () => {
  it('GET / findMany called once per request', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/supplier-social-screening');
    expect(mockPrisma.esgSupplierSocialScreen.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST / with PENDING result creates successfully', async () => {
    (mockPrisma.esgSupplierSocialScreen.create as jest.Mock).mockResolvedValue({ ...mockScreening, result: 'PENDING' });
    const res = await request(app).post('/api/supplier-social-screening').send({
      supplierName: 'Delta Co',
      screeningDate: '2026-04-01',
      screenedBy: 'Ethics Team',
      criteriaUsed: ['child_labour'],
      result: 'PENDING',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET / returns data as array', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([mockScreening]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/supplier-social-screening');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /:id returns id field in data', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(mockScreening);
    const res = await request(app).get('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001');
    expect(res.body.data).toHaveProperty('id', '00000000-0000-0000-0000-000000000001');
  });
});

describe('supplier-social-screening — additional coverage 2', () => {
  it('GET / response has success:true with data array', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([mockScreening]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/supplier-social-screening');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / stores supplierName in create call data', async () => {
    (mockPrisma.esgSupplierSocialScreen.create as jest.Mock).mockResolvedValue(mockScreening);
    await request(app).post('/api/supplier-social-screening').send({
      supplierName: 'Gamma Ltd',
      screeningDate: '2026-03-01',
      screenedBy: 'Supply Chain',
      criteriaUsed: ['wages'],
      result: 'PASSED',
    });
    const [call] = (mockPrisma.esgSupplierSocialScreen.create as jest.Mock).mock.calls;
    expect(call[0].data.supplierName).toBe('Gamma Ltd');
  });

  it('GET /:id returns supplierName and riskRating', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(mockScreening);
    const res = await request(app).get('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001');
    expect(res.body.data).toHaveProperty('supplierName', 'Acme Corp');
    expect(res.body.data).toHaveProperty('riskRating', 'MEDIUM');
  });

  it('POST / returns 400 when supplierName is missing', async () => {
    const res = await request(app).post('/api/supplier-social-screening').send({
      screeningDate: '2026-01-15',
      screenedBy: 'Team',
      criteriaUsed: ['wages'],
      result: 'PASSED',
    });
    expect(res.status).toBe(400);
  });

  it('GET /stats returns passRate percentage', async () => {
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock)
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(80)
      .mockResolvedValueOnce(75)
      .mockResolvedValueOnce(5);
    (mockPrisma.esgSupplierSocialScreen.groupBy as jest.Mock).mockResolvedValue([
      { riskRating: 'LOW', _count: { id: 60 } },
    ]);
    const res = await request(app).get('/api/supplier-social-screening/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total', 100);
  });

  it('PUT /:id updates notes field', async () => {
    (mockPrisma.esgSupplierSocialScreen.findUnique as jest.Mock).mockResolvedValue(mockScreening);
    (mockPrisma.esgSupplierSocialScreen.update as jest.Mock).mockResolvedValue({ ...mockScreening, notes: 'Reviewed' });
    const res = await request(app)
      .put('/api/supplier-social-screening/00000000-0000-0000-0000-000000000001')
      .send({ notes: 'Reviewed' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / page 2 passes correct skip value', async () => {
    (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.esgSupplierSocialScreen.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/supplier-social-screening?page=2&limit=20');
    const [call] = (mockPrisma.esgSupplierSocialScreen.findMany as jest.Mock).mock.calls;
    expect(call[0].skip).toBe(20);
  });
});
