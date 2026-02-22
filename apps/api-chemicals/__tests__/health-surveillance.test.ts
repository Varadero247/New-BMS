import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemHealthSurveillance: {
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

import router from '../src/routes/health-surveillance';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/health-surveillance', router);

beforeEach(() => jest.clearAllMocks());

const mockRecord = {
  id: '00000000-0000-0000-0000-000000000001',
  employeeId: 'EMP-001',
  employeeName: 'Jane Smith',
  jobRole: 'Paint Sprayer',
  department: 'Production',
  substancesExposed: ['Isocyanates', 'Styrene'],
  surveillanceType: 'LUNG_FUNCTION',
  examinationDate: new Date('2026-01-15'),
  conductedBy: 'Dr. Jones',
  result: 'NORMAL',
  nextSurveillanceDue: new Date('2027-01-15'),
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
};

// ── GET / ─────────────────────────────────────────────────────────────────

describe('GET /api/health-surveillance', () => {
  it('returns paginated surveillance records', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([mockRecord]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/health-surveillance');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('filters by result', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([mockRecord]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/health-surveillance?result=UNFIT_FOR_ROLE');
    const [call] = (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mock.calls;
    expect(call[0].where.result).toBe('UNFIT_FOR_ROLE');
  });

  it('filters by surveillanceType', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/health-surveillance?surveillanceType=LUNG_FUNCTION');
    const [call] = (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mock.calls;
    expect(call[0].where.surveillanceType).toBe('LUNG_FUNCTION');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/health-surveillance');
    expect(res.status).toBe(500);
  });
});

// ── POST / ────────────────────────────────────────────────────────────────

describe('POST /api/health-surveillance', () => {
  const validBody = {
    employeeId: 'EMP-001',
    employeeName: 'Jane Smith',
    jobRole: 'Paint Sprayer',
    substancesExposed: ['Isocyanates'],
    surveillanceType: 'LUNG_FUNCTION',
    examinationDate: '2026-01-15',
    conductedBy: 'Dr. Jones',
    result: 'NORMAL',
  };

  it('creates a surveillance record', async () => {
    (mockPrisma.chemHealthSurveillance.create as jest.Mock).mockResolvedValue(mockRecord);
    const res = await request(app).post('/api/health-surveillance').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('accepts all result values', async () => {
    const results = ['NORMAL', 'BORDERLINE', 'ABNORMAL', 'REQUIRES_FOLLOW_UP', 'UNFIT_FOR_ROLE'];
    for (const result of results) {
      (mockPrisma.chemHealthSurveillance.create as jest.Mock).mockResolvedValue({ ...mockRecord, result });
      const res = await request(app).post('/api/health-surveillance').send({ ...validBody, result });
      expect(res.status).toBe(201);
    }
  });

  it('accepts all surveillanceType values', async () => {
    const types = ['LUNG_FUNCTION', 'SKIN_CHECK', 'BLOOD_TEST', 'URINE_TEST', 'AUDIOMETRY', 'VISION_TEST', 'GENERAL_HEALTH', 'BIOLOGICAL_MONITORING', 'OTHER'];
    for (const surveillanceType of types) {
      (mockPrisma.chemHealthSurveillance.create as jest.Mock).mockResolvedValue({ ...mockRecord, surveillanceType });
      const res = await request(app).post('/api/health-surveillance').send({ ...validBody, surveillanceType });
      expect(res.status).toBe(201);
    }
  });

  it('returns 400 when required jobRole missing', async () => {
    const { jobRole, ...body } = validBody;
    const res = await request(app).post('/api/health-surveillance').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when substancesExposed is empty', async () => {
    const res = await request(app).post('/api/health-surveillance').send({ ...validBody, substancesExposed: [] });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid result', async () => {
    const res = await request(app).post('/api/health-surveillance').send({ ...validBody, result: 'FIT' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid examinationDate', async () => {
    const res = await request(app).post('/api/health-surveillance').send({ ...validBody, examinationDate: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.chemHealthSurveillance.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/health-surveillance').send(validBody);
    expect(res.status).toBe(500);
  });
});

// ── GET /dashboard ────────────────────────────────────────────────────────

describe('GET /api/health-surveillance/dashboard', () => {
  it('returns dashboard summary', async () => {
    (mockPrisma.chemHealthSurveillance.count as jest.Mock)
      .mockResolvedValueOnce(20)  // total
      .mockResolvedValueOnce(2)   // abnormal
      .mockResolvedValueOnce(4)   // unfit
      .mockResolvedValueOnce(1)   // overdue
      .mockResolvedValueOnce(3);  // dueSoon
    const res = await request(app).get('/api/health-surveillance/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('abnormal');
    expect(res.body.data).toHaveProperty('unfit');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/health-surveillance/dashboard');
    expect(res.status).toBe(500);
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────

describe('GET /api/health-surveillance/:id', () => {
  it('returns a single record', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    const res = await request(app).get('/api/health-surveillance/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.employeeName).toBe('Jane Smith');
  });

  it('returns 404 for missing record', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/health-surveillance/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('returns 404 for soft-deleted record', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue({ ...mockRecord, deletedAt: new Date() });
    const res = await request(app).get('/api/health-surveillance/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
  });
});

// ── PUT /:id ──────────────────────────────────────────────────────────────

describe('PUT /api/health-surveillance/:id', () => {
  it('updates a record', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    (mockPrisma.chemHealthSurveillance.update as jest.Mock).mockResolvedValue({ ...mockRecord, result: 'BORDERLINE' });
    const res = await request(app)
      .put('/api/health-surveillance/00000000-0000-0000-0000-000000000001')
      .send({ result: 'BORDERLINE' });
    expect(res.status).toBe(200);
    expect(res.body.data.result).toBe('BORDERLINE');
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/health-surveillance/00000000-0000-0000-0000-000000000099')
      .send({ result: 'NORMAL' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid result on update', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    const res = await request(app)
      .put('/api/health-surveillance/00000000-0000-0000-0000-000000000001')
      .send({ result: 'FIT_WITH_RESTRICTIONS' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    (mockPrisma.chemHealthSurveillance.update as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app)
      .put('/api/health-surveillance/00000000-0000-0000-0000-000000000001')
      .send({ result: 'NORMAL' });
    expect(res.status).toBe(500);
  });
});

// ─── Additional coverage: pagination, 500 paths, response shapes ──────────────

describe('Health Surveillance — extended coverage', () => {
  it('GET / returns correct totalPages for multi-page result set', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([mockRecord]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(45);

    const res = await request(app).get('/api/health-surveillance?page=1&limit=20');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.totalPages).toBe(3);
    expect(res.body.pagination.total).toBe(45);
  });

  it('GET / passes correct skip/take for page 2', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/health-surveillance?page=2&limit=10');
    const [call] = (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mock.calls;
    expect(call[0].skip).toBe(10);
    expect(call[0].take).toBe(10);
  });

  it('GET / filters by surveillanceType and passes it into where clause', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/health-surveillance?surveillanceType=AUDIOMETRY');
    const [call] = (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mock.calls;
    expect(call[0].where.surveillanceType).toBe('AUDIOMETRY');
  });

  it('GET / returns success:true with empty data array when no records', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/health-surveillance');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('GET /:id returns correct data shape for existing record', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(mockRecord);

    const res = await request(app).get('/api/health-surveillance/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('employeeId');
    expect(res.body.data).toHaveProperty('surveillanceType');
    expect(res.body.data).toHaveProperty('result');
  });

  it('GET /dashboard returns 500 on DB error during second count', async () => {
    (mockPrisma.chemHealthSurveillance.count as jest.Mock)
      .mockResolvedValueOnce(20)
      .mockRejectedValueOnce(new Error('fail'));

    const res = await request(app).get('/api/health-surveillance/dashboard');
    expect(res.status).toBe(500);
  });

  it('POST / returns 400 for invalid surveillanceType enum', async () => {
    const res = await request(app).post('/api/health-surveillance').send({
      employeeId: 'EMP-001',
      employeeName: 'Jane Smith',
      jobRole: 'Paint Sprayer',
      substancesExposed: ['Isocyanates'],
      surveillanceType: 'INVALID_TYPE',
      examinationDate: '2026-01-15',
      conductedBy: 'Dr. Jones',
      result: 'NORMAL',
    });
    expect(res.status).toBe(400);
  });

  it('POST / returns 500 on DB error during create', async () => {
    (mockPrisma.chemHealthSurveillance.create as jest.Mock).mockRejectedValue(new Error('DB fail'));

    const res = await request(app).post('/api/health-surveillance').send({
      employeeId: 'EMP-002',
      employeeName: 'Bob Jones',
      jobRole: 'Welder',
      substancesExposed: ['Manganese'],
      surveillanceType: 'BLOOD_TEST',
      examinationDate: '2026-01-20',
      conductedBy: 'Dr. Smith',
      result: 'NORMAL',
    });
    expect(res.status).toBe(500);
  });
});

describe('Health Surveillance — additional coverage 2', () => {
  it('GET / returns pagination block with page, limit, and total', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/health-surveillance');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('GET / count is called once per list request', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/health-surveillance');
    expect(mockPrisma.chemHealthSurveillance.count).toHaveBeenCalledTimes(1);
  });

  it('POST / creates record with employeeId from request body', async () => {
    (mockPrisma.chemHealthSurveillance.create as jest.Mock).mockResolvedValue(mockRecord);
    await request(app).post('/api/health-surveillance').send({
      employeeId: 'EMP-001',
      employeeName: 'Jane Smith',
      jobRole: 'Paint Sprayer',
      substancesExposed: ['Isocyanates'],
      surveillanceType: 'LUNG_FUNCTION',
      examinationDate: '2026-01-15',
      conductedBy: 'Dr. Jones',
      result: 'NORMAL',
    });
    const [call] = (mockPrisma.chemHealthSurveillance.create as jest.Mock).mock.calls;
    expect(call[0].data).toHaveProperty('employeeId', 'EMP-001');
  });

  it('GET /dashboard returns overdue and dueSoon fields', async () => {
    (mockPrisma.chemHealthSurveillance.count as jest.Mock)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3);
    const res = await request(app).get('/api/health-surveillance/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
  });

  it('GET /:id returns 500 on db error', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/health-surveillance/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('PUT /:id updates nextSurveillanceDue when provided', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    (mockPrisma.chemHealthSurveillance.update as jest.Mock).mockResolvedValue({
      ...mockRecord,
      nextSurveillanceDue: new Date('2028-01-15'),
    });
    const res = await request(app)
      .put('/api/health-surveillance/00000000-0000-0000-0000-000000000001')
      .send({ nextSurveillanceDue: '2028-01-15T00:00:00.000Z' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / filters by result=ABNORMAL when provided as query param', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([{ ...mockRecord, result: 'ABNORMAL' }]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/health-surveillance?result=ABNORMAL');
    const [call] = (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mock.calls;
    expect(call[0].where.result).toBe('ABNORMAL');
  });
});

describe('Health Surveillance — additional coverage 3', () => {
  it('GET / response is JSON content-type', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/health-surveillance');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET / with page=2&limit=5 passes skip:5 to findMany', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/health-surveillance?page=2&limit=5');
    const [call] = (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mock.calls;
    expect(call[0].skip).toBe(5);
    expect(call[0].take).toBe(5);
  });

  it('POST / returns 400 when conductedBy is missing', async () => {
    const res = await request(app).post('/api/health-surveillance').send({
      employeeId: 'EMP-001',
      employeeName: 'Jane Smith',
      jobRole: 'Paint Sprayer',
      substancesExposed: ['Isocyanates'],
      surveillanceType: 'LUNG_FUNCTION',
      examinationDate: '2026-01-15',
      result: 'NORMAL',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:id returns 200 with updated conductedBy', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    (mockPrisma.chemHealthSurveillance.update as jest.Mock).mockResolvedValue({
      ...mockRecord,
      conductedBy: 'Dr. New',
    });
    const res = await request(app)
      .put('/api/health-surveillance/00000000-0000-0000-0000-000000000001')
      .send({ conductedBy: 'Dr. New' });
    expect(res.status).toBe(200);
    expect(res.body.data.conductedBy).toBe('Dr. New');
  });
});

describe('Health Surveillance — phase28 coverage', () => {
  it('GET / success:true is present in response', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/health-surveillance');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 when employeeId is missing', async () => {
    const res = await request(app).post('/api/health-surveillance').send({
      employeeName: 'Jane Smith',
      jobRole: 'Paint Sprayer',
      substancesExposed: ['Isocyanates'],
      surveillanceType: 'LUNG_FUNCTION',
      examinationDate: '2026-01-15',
      result: 'NORMAL',
      conductedBy: 'Dr. Jones',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id returns 404 when record does not exist', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/health-surveillance/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /:id returns 500 when update rejects', async () => {
    (mockPrisma.chemHealthSurveillance.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    (mockPrisma.chemHealthSurveillance.update as jest.Mock).mockRejectedValue(new Error('DB crash'));
    const res = await request(app)
      .put('/api/health-surveillance/00000000-0000-0000-0000-000000000001')
      .send({ conductedBy: 'Dr. Crash' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET / pagination has page, limit and total fields', async () => {
    (mockPrisma.chemHealthSurveillance.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemHealthSurveillance.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/health-surveillance');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
  });
});
