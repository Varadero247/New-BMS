import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgScenarioAnalysis: {
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

import router from '../src/routes/scenario-analysis';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/scenario-analysis', router);

beforeEach(() => jest.clearAllMocks());

const mockScenario = {
  id: '00000000-0000-0000-0000-000000000001',
  title: '1.5°C Transition Pathway',
  scenarioType: 'TRANSITION_RISK',
  baselineScenario: '1_5C',
  timeHorizon: 'LONG_TERM',
  description: 'Analysis of 1.5°C transition risks',
  assumptions: 'Carbon price reaches $200/t by 2035',
  keyVariables: ['carbon price', 'renewable energy cost'],
  analysisDate: new Date('2026-01-20'),
  conductedBy: 'Sustainability Team',
  reportingYear: 2026,
  status: 'DRAFT',
  deletedAt: null,
  createdAt: new Date('2026-01-20'),
};

// ── GET / ─────────────────────────────────────────────────────────────────

describe('GET /api/scenario-analysis', () => {
  it('returns paginated scenario analyses', async () => {
    (mockPrisma.esgScenarioAnalysis.findMany as jest.Mock).mockResolvedValue([mockScenario]);
    (mockPrisma.esgScenarioAnalysis.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/scenario-analysis');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by scenarioType', async () => {
    (mockPrisma.esgScenarioAnalysis.findMany as jest.Mock).mockResolvedValue([mockScenario]);
    (mockPrisma.esgScenarioAnalysis.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/scenario-analysis?scenarioType=TRANSITION_RISK');
    const [call] = (mockPrisma.esgScenarioAnalysis.findMany as jest.Mock).mock.calls;
    expect(call[0].where.scenarioType).toBe('TRANSITION_RISK');
  });

  it('filters by timeHorizon', async () => {
    (mockPrisma.esgScenarioAnalysis.findMany as jest.Mock).mockResolvedValue([mockScenario]);
    (mockPrisma.esgScenarioAnalysis.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/scenario-analysis?timeHorizon=LONG_TERM');
    const [call] = (mockPrisma.esgScenarioAnalysis.findMany as jest.Mock).mock.calls;
    expect(call[0].where.timeHorizon).toBe('LONG_TERM');
  });

  it('filters by reportingYear', async () => {
    (mockPrisma.esgScenarioAnalysis.findMany as jest.Mock).mockResolvedValue([mockScenario]);
    (mockPrisma.esgScenarioAnalysis.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/scenario-analysis?reportingYear=2026');
    const [call] = (mockPrisma.esgScenarioAnalysis.findMany as jest.Mock).mock.calls;
    expect(call[0].where.reportingYear).toBe(2026);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.esgScenarioAnalysis.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/scenario-analysis');
    expect(res.status).toBe(500);
  });
});

// ── POST / ────────────────────────────────────────────────────────────────

describe('POST /api/scenario-analysis', () => {
  const validBody = {
    title: '1.5°C Transition Pathway',
    scenarioType: 'TRANSITION_RISK',
    baselineScenario: '1_5C',
    timeHorizon: 'LONG_TERM',
    description: 'Analysis of 1.5°C transition risks',
    assumptions: 'Carbon price reaches $200/t by 2035',
    keyVariables: ['carbon price', 'renewable energy cost'],
    analysisDate: '2026-01-20',
    conductedBy: 'Sustainability Team',
    reportingYear: 2026,
  };

  it('creates a scenario analysis with DRAFT status', async () => {
    (mockPrisma.esgScenarioAnalysis.create as jest.Mock).mockResolvedValue(mockScenario);
    const res = await request(app).post('/api/scenario-analysis').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const [call] = (mockPrisma.esgScenarioAnalysis.create as jest.Mock).mock.calls;
    expect(call[0].data.status).toBe('DRAFT');
  });

  it('accepts all scenarioType values', async () => {
    for (const scenarioType of ['TRANSITION_RISK', 'PHYSICAL_RISK', 'COMBINED', 'OPPORTUNITY']) {
      (mockPrisma.esgScenarioAnalysis.create as jest.Mock).mockResolvedValue({ ...mockScenario, scenarioType });
      const res = await request(app).post('/api/scenario-analysis').send({ ...validBody, scenarioType });
      expect(res.status).toBe(201);
    }
  });

  it('accepts all baselineScenario values', async () => {
    for (const baselineScenario of ['1_5C', '2C', '3C', '4C', 'CURRENT_POLICIES', 'NET_ZERO_2050', 'CUSTOM']) {
      (mockPrisma.esgScenarioAnalysis.create as jest.Mock).mockResolvedValue({ ...mockScenario, baselineScenario });
      const res = await request(app).post('/api/scenario-analysis').send({ ...validBody, baselineScenario });
      expect(res.status).toBe(201);
    }
  });

  it('accepts all timeHorizon values', async () => {
    for (const timeHorizon of ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM']) {
      (mockPrisma.esgScenarioAnalysis.create as jest.Mock).mockResolvedValue({ ...mockScenario, timeHorizon });
      const res = await request(app).post('/api/scenario-analysis').send({ ...validBody, timeHorizon });
      expect(res.status).toBe(201);
    }
  });

  it('accepts financial impact range', async () => {
    const bodyWithFinancial = { ...validBody, financialImpactLow: -500000, financialImpactHigh: 100000, financialImpactCurrency: 'GBP' };
    (mockPrisma.esgScenarioAnalysis.create as jest.Mock).mockResolvedValue(mockScenario);
    const res = await request(app).post('/api/scenario-analysis').send(bodyWithFinancial);
    expect(res.status).toBe(201);
  });

  it('returns 400 when title missing', async () => {
    const { title, ...body } = validBody;
    const res = await request(app).post('/api/scenario-analysis').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when keyVariables is empty', async () => {
    const res = await request(app).post('/api/scenario-analysis').send({ ...validBody, keyVariables: [] });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid scenarioType', async () => {
    const res = await request(app).post('/api/scenario-analysis').send({ ...validBody, scenarioType: 'TRANSITION_1_5C' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid analysisDate', async () => {
    const res = await request(app).post('/api/scenario-analysis').send({ ...validBody, analysisDate: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.esgScenarioAnalysis.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/scenario-analysis').send(validBody);
    expect(res.status).toBe(500);
  });
});

// ── GET /summary ──────────────────────────────────────────────────────────

describe('GET /api/scenario-analysis/summary', () => {
  it('returns summary with scenario groupings', async () => {
    (mockPrisma.esgScenarioAnalysis.count as jest.Mock).mockResolvedValue(5);
    (mockPrisma.esgScenarioAnalysis.groupBy as jest.Mock)
      .mockResolvedValueOnce([{ scenarioType: 'TRANSITION_RISK', _count: { id: 3 } }])
      .mockResolvedValueOnce([{ timeHorizon: 'LONG_TERM', _count: { id: 5 } }]);
    const res = await request(app).get('/api/scenario-analysis/summary');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('byScenarioType');
    expect(res.body.data).toHaveProperty('byTimeHorizon');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.esgScenarioAnalysis.count as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/scenario-analysis/summary');
    expect(res.status).toBe(500);
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────

describe('GET /api/scenario-analysis/:id', () => {
  it('returns a single scenario', async () => {
    (mockPrisma.esgScenarioAnalysis.findUnique as jest.Mock).mockResolvedValue(mockScenario);
    const res = await request(app).get('/api/scenario-analysis/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('1.5°C Transition Pathway');
  });

  it('returns 404 for missing scenario', async () => {
    (mockPrisma.esgScenarioAnalysis.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/scenario-analysis/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('returns 404 for soft-deleted scenario', async () => {
    (mockPrisma.esgScenarioAnalysis.findUnique as jest.Mock).mockResolvedValue({ ...mockScenario, deletedAt: new Date() });
    const res = await request(app).get('/api/scenario-analysis/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
  });
});

// ── PUT /:id ──────────────────────────────────────────────────────────────

describe('PUT /api/scenario-analysis/:id', () => {
  it('updates status to APPROVED', async () => {
    (mockPrisma.esgScenarioAnalysis.findUnique as jest.Mock).mockResolvedValue(mockScenario);
    (mockPrisma.esgScenarioAnalysis.update as jest.Mock).mockResolvedValue({ ...mockScenario, status: 'APPROVED' });
    const res = await request(app)
      .put('/api/scenario-analysis/00000000-0000-0000-0000-000000000001')
      .send({ status: 'APPROVED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('accepts all status values on update', async () => {
    for (const status of ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']) {
      (mockPrisma.esgScenarioAnalysis.findUnique as jest.Mock).mockResolvedValue(mockScenario);
      (mockPrisma.esgScenarioAnalysis.update as jest.Mock).mockResolvedValue({ ...mockScenario, status });
      const res = await request(app)
        .put('/api/scenario-analysis/00000000-0000-0000-0000-000000000001')
        .send({ status });
      expect(res.status).toBe(200);
    }
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.esgScenarioAnalysis.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/scenario-analysis/00000000-0000-0000-0000-000000000099')
      .send({ status: 'APPROVED' });
    expect(res.status).toBe(404);
  });
});
