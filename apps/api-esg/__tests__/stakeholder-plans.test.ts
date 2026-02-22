import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgStakeholderPlan: {
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

import router from '../src/routes/stakeholder-plans';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/stakeholder-plans', router);

beforeEach(() => jest.clearAllMocks());

const mockPlan = {
  id: '00000000-0000-0000-0000-000000000001',
  stakeholderGroup: 'Investors',
  engagementPurpose: 'Discuss climate risk strategy',
  frequency: 'QUARTERLY',
  methods: ['SURVEY', 'MEETING'],
  reportingYear: 2026,
  responsibleTeam: 'IR Team',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
};

// ── GET / ─────────────────────────────────────────────────────────────────

describe('GET /api/stakeholder-plans', () => {
  it('returns paginated stakeholder plans', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockResolvedValue([mockPlan]);
    (mockPrisma.esgStakeholderPlan.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/stakeholder-plans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by reportingYear', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockResolvedValue([mockPlan]);
    (mockPrisma.esgStakeholderPlan.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/stakeholder-plans?reportingYear=2026');
    const [call] = (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mock.calls;
    expect(call[0].where.reportingYear).toBe(2026);
  });

  it('returns empty list when no plans', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.esgStakeholderPlan.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/stakeholder-plans');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/stakeholder-plans');
    expect(res.status).toBe(500);
  });
});

// ── POST / ────────────────────────────────────────────────────────────────

describe('POST /api/stakeholder-plans', () => {
  const validBody = {
    stakeholderGroup: 'Investors',
    engagementPurpose: 'Discuss climate risk strategy',
    frequency: 'QUARTERLY',
    methods: ['SURVEY', 'MEETING'],
    reportingYear: 2026,
    responsibleTeam: 'IR Team',
  };

  it('creates a stakeholder engagement plan', async () => {
    (mockPrisma.esgStakeholderPlan.create as jest.Mock).mockResolvedValue(mockPlan);
    const res = await request(app).post('/api/stakeholder-plans').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('accepts all frequency values', async () => {
    const freqs = ['ONGOING', 'ANNUAL', 'QUARTERLY', 'MONTHLY', 'AD_HOC', 'EVENT_BASED'];
    for (const frequency of freqs) {
      (mockPrisma.esgStakeholderPlan.create as jest.Mock).mockResolvedValue({ ...mockPlan, frequency });
      const res = await request(app).post('/api/stakeholder-plans').send({ ...validBody, frequency });
      expect(res.status).toBe(201);
    }
  });

  it('accepts optional fields', async () => {
    const bodyFull = {
      ...validBody,
      keyTopics: ['climate risk', 'emissions'],
      feedbackMechanism: 'Online portal',
      outcomes: 'Alignment achieved',
    };
    (mockPrisma.esgStakeholderPlan.create as jest.Mock).mockResolvedValue(mockPlan);
    const res = await request(app).post('/api/stakeholder-plans').send(bodyFull);
    expect(res.status).toBe(201);
  });

  it('returns 400 when engagementPurpose missing', async () => {
    const { engagementPurpose, ...body } = validBody;
    const res = await request(app).post('/api/stakeholder-plans').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when methods is empty array', async () => {
    const res = await request(app).post('/api/stakeholder-plans').send({ ...validBody, methods: [] });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid frequency', async () => {
    const res = await request(app).post('/api/stakeholder-plans').send({ ...validBody, frequency: 'DAILY' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-integer reportingYear', async () => {
    const res = await request(app).post('/api/stakeholder-plans').send({ ...validBody, reportingYear: 'two-thousand-twenty-six' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.esgStakeholderPlan.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/stakeholder-plans').send(validBody);
    expect(res.status).toBe(500);
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────

describe('GET /api/stakeholder-plans/:id', () => {
  it('returns a single plan', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
    const res = await request(app).get('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.stakeholderGroup).toBe('Investors');
  });

  it('returns 404 for missing plan', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/stakeholder-plans/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('returns 404 for soft-deleted plan', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue({ ...mockPlan, deletedAt: new Date() });
    const res = await request(app).get('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
  });
});

// ── PUT /:id ──────────────────────────────────────────────────────────────

describe('PUT /api/stakeholder-plans/:id', () => {
  it('updates a plan frequency', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
    (mockPrisma.esgStakeholderPlan.update as jest.Mock).mockResolvedValue({ ...mockPlan, frequency: 'ANNUAL' });
    const res = await request(app)
      .put('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001')
      .send({ frequency: 'ANNUAL' });
    expect(res.status).toBe(200);
    expect(res.body.data.frequency).toBe('ANNUAL');
  });

  it('updates outcomes field', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
    (mockPrisma.esgStakeholderPlan.update as jest.Mock).mockResolvedValue({ ...mockPlan, outcomes: 'Positive feedback received' });
    const res = await request(app)
      .put('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001')
      .send({ outcomes: 'Positive feedback received' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/stakeholder-plans/00000000-0000-0000-0000-000000000099')
      .send({ frequency: 'ANNUAL' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid frequency on update', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
    const res = await request(app)
      .put('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001')
      .send({ frequency: 'BIWEEKLY' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
    (mockPrisma.esgStakeholderPlan.update as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app)
      .put('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001')
      .send({ frequency: 'ANNUAL' });
    expect(res.status).toBe(500);
  });
});

// ── Extended coverage ──────────────────────────────────────────────────────

describe('stakeholder-plans — extended coverage', () => {
  it('GET / returns pagination metadata with total and totalPages', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockResolvedValue([mockPlan]);
    (mockPrisma.esgStakeholderPlan.count as jest.Mock).mockResolvedValue(25);
    const res = await request(app).get('/api/stakeholder-plans?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(25);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET / filters by both reportingYear and returns correct count', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.esgStakeholderPlan.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/stakeholder-plans?reportingYear=2025');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    const [call] = (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mock.calls;
    expect(call[0].where.reportingYear).toBe(2025);
  });

  it('GET /:id returns 500 on DB error', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / with optional date fields succeeds', async () => {
    (mockPrisma.esgStakeholderPlan.create as jest.Mock).mockResolvedValue(mockPlan);
    const res = await request(app).post('/api/stakeholder-plans').send({
      stakeholderGroup: 'Employees',
      engagementPurpose: 'Annual survey',
      frequency: 'ANNUAL',
      methods: ['SURVEY'],
      reportingYear: 2026,
      responsibleTeam: 'HR',
      lastEngagementDate: '2025-12-01',
      nextEngagementDate: '2026-06-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 when stakeholderGroup is missing', async () => {
    const res = await request(app).post('/api/stakeholder-plans').send({
      engagementPurpose: 'Some purpose',
      frequency: 'ANNUAL',
      methods: ['MEETING'],
      reportingYear: 2026,
      responsibleTeam: 'Risk',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 when responsibleTeam is missing', async () => {
    const res = await request(app).post('/api/stakeholder-plans').send({
      stakeholderGroup: 'NGOs',
      engagementPurpose: 'Engage NGOs',
      frequency: 'QUARTERLY',
      methods: ['MEETING'],
      reportingYear: 2026,
    });
    expect(res.status).toBe(400);
  });

  it('PUT /:id returns 404 for soft-deleted plan', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue({
      ...mockPlan,
      deletedAt: new Date(),
    });
    const res = await request(app)
      .put('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001')
      .send({ frequency: 'MONTHLY' });
    expect(res.status).toBe(404);
  });

  it('GET / success field is true on 200 response', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.esgStakeholderPlan.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/stakeholder-plans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT / accepts ONGOING frequency', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
    (mockPrisma.esgStakeholderPlan.update as jest.Mock).mockResolvedValue({
      ...mockPlan,
      frequency: 'ONGOING',
    });
    const res = await request(app)
      .put('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001')
      .send({ frequency: 'ONGOING' });
    expect(res.status).toBe(200);
    expect(res.body.data.frequency).toBe('ONGOING');
  });
});

describe('stakeholder-plans — additional coverage 2', () => {
  it('GET / returns correct data length', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockResolvedValue([mockPlan, { ...mockPlan, id: '00000000-0000-0000-0000-000000000002' }]);
    (mockPrisma.esgStakeholderPlan.count as jest.Mock).mockResolvedValue(2);
    const res = await request(app).get('/api/stakeholder-plans');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /:id returns stakeholderGroup field', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
    const res = await request(app).get('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('stakeholderGroup', 'Investors');
  });

  it('POST / stores stakeholderGroup in create call data', async () => {
    (mockPrisma.esgStakeholderPlan.create as jest.Mock).mockResolvedValue(mockPlan);
    await request(app).post('/api/stakeholder-plans').send({
      stakeholderGroup: 'Regulators',
      engagementPurpose: 'Regulatory engagement',
      frequency: 'ANNUAL',
      methods: ['MEETING'],
      reportingYear: 2026,
      responsibleTeam: 'Legal',
    });
    const [call] = (mockPrisma.esgStakeholderPlan.create as jest.Mock).mock.calls;
    expect(call[0].data.stakeholderGroup).toBe('Regulators');
  });

  it('PUT /:id updates methods array field', async () => {
    (mockPrisma.esgStakeholderPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
    (mockPrisma.esgStakeholderPlan.update as jest.Mock).mockResolvedValue({ ...mockPlan, methods: ['SURVEY'] });
    const res = await request(app)
      .put('/api/stakeholder-plans/00000000-0000-0000-0000-000000000001')
      .send({ methods: ['SURVEY'] });
    expect(res.status).toBe(200);
    expect(res.body.data.methods).toEqual(['SURVEY']);
  });

  it('GET / findMany called once per request', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.esgStakeholderPlan.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/stakeholder-plans');
    expect(mockPrisma.esgStakeholderPlan.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET / returns 500 body with error.code INTERNAL_ERROR', async () => {
    (mockPrisma.esgStakeholderPlan.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/stakeholder-plans');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 201 with success:true', async () => {
    (mockPrisma.esgStakeholderPlan.create as jest.Mock).mockResolvedValue(mockPlan);
    const res = await request(app).post('/api/stakeholder-plans').send({
      stakeholderGroup: 'NGOs',
      engagementPurpose: 'Community consultation',
      frequency: 'AD_HOC',
      methods: ['MEETING', 'SURVEY'],
      reportingYear: 2026,
      responsibleTeam: 'CSR Team',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
