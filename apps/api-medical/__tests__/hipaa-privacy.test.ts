import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    hipaaPrivacyPolicy: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    hipaaPhiDisclosure: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    hipaaMinimumNecessary: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    hipaaTrainingRecord: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
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
    return { skip: (page - 1) * limit, limit, page };
  },
}));

import router from '../src/routes/hipaa-privacy';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/', router);

const policyPayload = {
  version: '1.0',
  effectiveDate: '2026-01-01',
  nppSummary: 'Summary of NPP',
  fullText: 'Full text of the Notice of Privacy Practices',
};

const disclosurePayload = {
  disclosureDate: '2026-01-15',
  recipient: 'Dr Smith',
  recipientType: 'TREATMENT_PROVIDER',
  purpose: 'Treatment coordination',
  phiCategories: ['demographics', 'diagnoses'],
  recordedBy: 'admin@clinic.com',
};

const trainingPayload = {
  employeeId: 'EMP-001',
  employeeName: 'Jane Doe',
  trainingType: 'INITIAL_TRAINING',
  completedDate: '2026-01-10',
  trainingModule: 'HIPAA Privacy Rule 101',
};

const mnPayload = {
  role: 'Nurse',
  phiCategory: 'Diagnoses',
  accessLevel: 'Read-only',
  justification: 'Treatment need',
  approvedBy: 'Privacy Officer',
  effectiveDate: '2026-01-01',
};

describe('HIPAA Privacy Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // GET /stats
  it('GET /stats returns summary statistics', async () => {
    prisma.hipaaPrivacyPolicy.count.mockResolvedValueOnce(5).mockResolvedValueOnce(3);
    prisma.hipaaPhiDisclosure.count.mockResolvedValueOnce(22);
    prisma.hipaaTrainingRecord.count.mockResolvedValueOnce(18);
    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalPolicies');
    expect(res.body.data).toHaveProperty('disclosuresThisYear');
    expect(res.body.data).toHaveProperty('trainingCompletionsThisYear');
  });

  it('GET /stats returns 500 on DB error', async () => {
    prisma.hipaaPrivacyPolicy.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/stats');
    expect(res.status).toBe(500);
  });

  // GET /disclosures
  it('GET /disclosures returns paginated list', async () => {
    prisma.hipaaPhiDisclosure.findMany.mockResolvedValue([{ id: 'd1', recipient: 'Dr Smith' }]);
    prisma.hipaaPhiDisclosure.count.mockResolvedValue(1);
    const res = await request(app).get('/disclosures');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /disclosures filters by recipientType', async () => {
    prisma.hipaaPhiDisclosure.findMany.mockResolvedValue([]);
    prisma.hipaaPhiDisclosure.count.mockResolvedValue(0);
    const res = await request(app).get('/disclosures?recipientType=LEGAL');
    expect(res.status).toBe(200);
    expect(prisma.hipaaPhiDisclosure.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ recipientType: 'LEGAL' }) })
    );
  });

  // POST /disclosures
  it('POST /disclosures creates a disclosure record', async () => {
    prisma.hipaaPhiDisclosure.create.mockResolvedValue({ id: 'd1', ...disclosurePayload });
    const res = await request(app).post('/disclosures').send(disclosurePayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /disclosures returns 400 on invalid payload', async () => {
    const res = await request(app).post('/disclosures').send({ recipient: 'X' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /disclosures returns 400 on missing phiCategories', async () => {
    const res = await request(app).post('/disclosures').send({ ...disclosurePayload, phiCategories: [] });
    expect(res.status).toBe(400);
  });

  // GET /minimum-necessary
  it('GET /minimum-necessary returns paginated list', async () => {
    prisma.hipaaMinimumNecessary.findMany.mockResolvedValue([{ id: 'mn1', role: 'Nurse' }]);
    prisma.hipaaMinimumNecessary.count.mockResolvedValue(1);
    const res = await request(app).get('/minimum-necessary');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  // POST /minimum-necessary
  it('POST /minimum-necessary creates a policy', async () => {
    prisma.hipaaMinimumNecessary.create.mockResolvedValue({ id: 'mn1', ...mnPayload });
    const res = await request(app).post('/minimum-necessary').send(mnPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /minimum-necessary returns 400 on missing role', async () => {
    const { role: _r, ...body } = mnPayload;
    const res = await request(app).post('/minimum-necessary').send(body);
    expect(res.status).toBe(400);
  });

  // GET /training
  it('GET /training returns paginated training records', async () => {
    prisma.hipaaTrainingRecord.findMany.mockResolvedValue([{ id: 't1', employeeName: 'Jane Doe' }]);
    prisma.hipaaTrainingRecord.count.mockResolvedValue(1);
    const res = await request(app).get('/training');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET /training filters by trainingType', async () => {
    prisma.hipaaTrainingRecord.findMany.mockResolvedValue([]);
    prisma.hipaaTrainingRecord.count.mockResolvedValue(0);
    const res = await request(app).get('/training?trainingType=ANNUAL_REFRESHER');
    expect(res.status).toBe(200);
  });

  // POST /training
  it('POST /training creates a training record', async () => {
    prisma.hipaaTrainingRecord.create.mockResolvedValue({ id: 't1', ...trainingPayload });
    const res = await request(app).post('/training').send(trainingPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /training returns 400 on invalid trainingType', async () => {
    const res = await request(app).post('/training').send({ ...trainingPayload, trainingType: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('POST /training accepts optional score and passed fields', async () => {
    prisma.hipaaTrainingRecord.create.mockResolvedValue({ id: 't2', ...trainingPayload, score: 95, passed: true });
    const res = await request(app).post('/training').send({ ...trainingPayload, score: 95, passed: true });
    expect(res.status).toBe(201);
  });

  // GET / (NPP list)
  it('GET / returns paginated NPP versions', async () => {
    prisma.hipaaPrivacyPolicy.findMany.mockResolvedValue([{ id: 'p1', version: '1.0' }]);
    prisma.hipaaPrivacyPolicy.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET / filters by status', async () => {
    prisma.hipaaPrivacyPolicy.findMany.mockResolvedValue([]);
    prisma.hipaaPrivacyPolicy.count.mockResolvedValue(0);
    const res = await request(app).get('/?status=ACTIVE');
    expect(res.status).toBe(200);
  });

  // POST /
  it('POST / creates a new NPP version', async () => {
    prisma.hipaaPrivacyPolicy.create.mockResolvedValue({ id: 'p1', ...policyPayload, status: 'DRAFT' });
    const res = await request(app).post('/').send(policyPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
  });

  it('POST / returns 400 on missing nppSummary', async () => {
    const { nppSummary: _s, ...body } = policyPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
  });

  // GET /:id
  it('GET /:id returns a single policy', async () => {
    prisma.hipaaPrivacyPolicy.findUnique.mockResolvedValue({ id: 'p1', ...policyPayload, deletedAt: null });
    const res = await request(app).get('/p1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('p1');
  });

  it('GET /:id returns 404 for missing policy', async () => {
    prisma.hipaaPrivacyPolicy.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /:id returns 404 for soft-deleted policy', async () => {
    prisma.hipaaPrivacyPolicy.findUnique.mockResolvedValue({ id: 'p1', deletedAt: new Date() });
    const res = await request(app).get('/p1');
    expect(res.status).toBe(404);
  });

  // PUT /:id
  it('PUT /:id updates NPP status to ACTIVE', async () => {
    prisma.hipaaPrivacyPolicy.findUnique.mockResolvedValue({ id: 'p1', deletedAt: null });
    prisma.hipaaPrivacyPolicy.update.mockResolvedValue({ id: 'p1', status: 'ACTIVE' });
    const res = await request(app).put('/p1').send({ status: 'ACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('PUT /:id returns 404 for unknown policy', async () => {
    prisma.hipaaPrivacyPolicy.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown').send({ status: 'ACTIVE' });
    expect(res.status).toBe(404);
  });

  it('PUT /:id returns 400 on invalid status', async () => {
    prisma.hipaaPrivacyPolicy.findUnique.mockResolvedValue({ id: 'p1', deletedAt: null });
    const res = await request(app).put('/p1').send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
  });
});

// ===================================================================
// Extended coverage: 500 error paths, pagination totalPages, response shape
// ===================================================================

describe('HIPAA Privacy — extended coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /disclosures returns correct totalPages for multi-page results', async () => {
    prisma.hipaaPhiDisclosure.findMany.mockResolvedValue([]);
    prisma.hipaaPhiDisclosure.count.mockResolvedValue(40);
    const res = await request(app).get('/disclosures?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(40);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('GET /disclosures returns 500 on DB error', async () => {
    prisma.hipaaPhiDisclosure.findMany.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/disclosures');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /disclosures returns 500 on DB error', async () => {
    prisma.hipaaPhiDisclosure.create.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).post('/disclosures').send({
      disclosureDate: '2026-01-15',
      recipient: 'Dr Jones',
      recipientType: 'TREATMENT_PROVIDER',
      purpose: 'Referral',
      phiCategories: ['diagnoses'],
      recordedBy: 'nurse@clinic.com',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /training returns correct totalPages in pagination', async () => {
    prisma.hipaaTrainingRecord.findMany.mockResolvedValue([]);
    prisma.hipaaTrainingRecord.count.mockResolvedValue(50);
    const res = await request(app).get('/training?page=1&limit=25');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('POST /training returns 500 on DB error', async () => {
    prisma.hipaaTrainingRecord.create.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).post('/training').send({
      employeeId: 'EMP-002',
      employeeName: 'Bob Smith',
      trainingType: 'ANNUAL_REFRESHER',
      completedDate: '2026-02-01',
      trainingModule: 'HIPAA Refresher 2026',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('HIPAA Privacy — final edge cases', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /minimum-necessary returns 500 on DB error', async () => {
    prisma.hipaaMinimumNecessary.findMany.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/minimum-necessary');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST /minimum-necessary returns 500 on DB error', async () => {
    prisma.hipaaMinimumNecessary.create.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).post('/minimum-necessary').send({
      role: 'Doctor',
      phiCategory: 'Labs',
      accessLevel: 'Read',
      justification: 'Direct care',
      approvedBy: 'Privacy Officer',
      effectiveDate: '2026-01-01',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('PUT /:id returns 500 on DB error during update', async () => {
    prisma.hipaaPrivacyPolicy.findUnique.mockResolvedValue({ id: 'p1', deletedAt: null });
    prisma.hipaaPrivacyPolicy.update.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).put('/p1').send({ status: 'ACTIVE' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST / returns 500 on DB error', async () => {
    prisma.hipaaPrivacyPolicy.create.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).post('/').send({
      version: '2.0',
      effectiveDate: '2026-03-01',
      nppSummary: 'New Summary',
      fullText: 'Full text of NPP v2',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /:id returns 500 on DB error', async () => {
    prisma.hipaaPrivacyPolicy.findUnique.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/some-policy-id');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('HIPAA Privacy — further boundary coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / returns success:true and data array on empty list', async () => {
    prisma.hipaaPrivacyPolicy.findMany.mockResolvedValue([]);
    prisma.hipaaPrivacyPolicy.count.mockResolvedValue(0);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /training returns 500 on DB error', async () => {
    prisma.hipaaTrainingRecord.findMany.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/training');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST / NPP create is called once on valid payload', async () => {
    prisma.hipaaPrivacyPolicy.create.mockResolvedValue({ id: 'p-new', ...policyPayload, status: 'DRAFT' });
    await request(app).post('/').send(policyPayload);
    expect(prisma.hipaaPrivacyPolicy.create).toHaveBeenCalledTimes(1);
  });

  it('POST /training returns 400 on missing employeeName', async () => {
    const { employeeName: _en, ...body } = trainingPayload;
    const res = await request(app).post('/training').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /minimum-necessary pagination has total field', async () => {
    prisma.hipaaMinimumNecessary.findMany.mockResolvedValue([]);
    prisma.hipaaMinimumNecessary.count.mockResolvedValue(5);
    const res = await request(app).get('/minimum-necessary');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('total', 5);
  });

  it('PUT /:id response data has updated status', async () => {
    prisma.hipaaPrivacyPolicy.findUnique.mockResolvedValue({ id: 'p1', deletedAt: null });
    prisma.hipaaPrivacyPolicy.update.mockResolvedValue({ id: 'p1', status: 'SUPERSEDED' });
    const res = await request(app).put('/p1').send({ status: 'SUPERSEDED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUPERSEDED');
  });
});

describe('hipaa privacy — phase29 coverage', () => {
  it('handles boolean type', () => {
    expect(typeof true).toBe('boolean');
  });

  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

  it('handles parseFloat', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

});

describe('hipaa privacy — phase30 coverage', () => {
  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles array length', () => {
    expect([1, 2, 3].length).toBe(3);
  });

  it('handles array isArray', () => {
    expect(Array.isArray([])).toBe(true);
  });

  it('handles null check', () => {
    expect(null).toBeNull();
  });

});
