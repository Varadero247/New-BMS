import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    femFireRiskAssessment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
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

import router from '../src/routes/fireRiskAssessment';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/fra', router);

beforeEach(() => { jest.clearAllMocks(); });

const mockFra = prisma.femFireRiskAssessment as any;

const FRA_ID = '00000000-0000-0000-0000-000000000001';
const PREMISES_ID = '00000000-0000-0000-0000-000000000002';

const fakeFra = {
  id: FRA_ID,
  referenceNumber: 'FRA-2026-0001',
  premisesId: PREMISES_ID,
  assessmentDate: '2026-01-01T00:00:00.000Z',
  nextReviewDate: '2027-01-01T00:00:00.000Z',
  assessorName: 'Jane Smith',
  likelihoodRating: 2,
  consequenceRating: 2,
  overallRiskScore: 4,
  overallRiskLevel: 'LOW',
  assessmentStatus: 'DRAFT',
  organisationId: 'org-1',
  deletedAt: null,
};

const validCreateBody = {
  premisesId: PREMISES_ID,
  assessmentDate: '2026-01-01',
  nextReviewDate: '2027-01-01',
  assessorName: 'Jane Smith',
  likelihoodRating: 2,
  consequenceRating: 2,
};

describe('GET /api/fra', () => {
  it('returns list of FRAs with pagination', async () => {
    mockFra.findMany.mockResolvedValue([fakeFra]);
    mockFra.count.mockResolvedValue(1);

    const res = await request(app).get('/api/fra');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].referenceNumber).toBe('FRA-2026-0001');
    expect(res.body.pagination.total).toBe(1);
  });

  it('returns empty list when no FRAs exist', async () => {
    mockFra.findMany.mockResolvedValue([]);
    mockFra.count.mockResolvedValue(0);

    const res = await request(app).get('/api/fra');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('filters by status query param', async () => {
    mockFra.findMany.mockResolvedValue([fakeFra]);
    mockFra.count.mockResolvedValue(1);

    const res = await request(app).get('/api/fra?status=DRAFT');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('filters by premisesId query param', async () => {
    mockFra.findMany.mockResolvedValue([fakeFra]);
    mockFra.count.mockResolvedValue(1);

    const res = await request(app).get(`/api/fra?premisesId=${PREMISES_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 on database error', async () => {
    mockFra.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/fra');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('GET /api/fra/overdue', () => {
  it('returns overdue FRAs', async () => {
    const overdueFra = { ...fakeFra, nextReviewDate: '2025-01-01T00:00:00.000Z' };
    mockFra.findMany.mockResolvedValue([overdueFra]);

    const res = await request(app).get('/api/fra/overdue');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns empty array when no overdue FRAs', async () => {
    mockFra.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/fra/overdue');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/fra', () => {
  it('creates a new FRA and returns 201', async () => {
    mockFra.count.mockResolvedValue(0);
    mockFra.create.mockResolvedValue(fakeFra);

    const res = await request(app).post('/api/fra').send(validCreateBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessorName).toBe('Jane Smith');
  });

  it('returns 400 when assessorName is missing', async () => {
    const res = await request(app).post('/api/fra').send({
      premisesId: PREMISES_ID,
      assessmentDate: '2026-01-01',
      nextReviewDate: '2027-01-01',
      likelihoodRating: 2,
      consequenceRating: 2,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when likelihoodRating is out of range', async () => {
    const res = await request(app).post('/api/fra').send({
      ...validCreateBody,
      likelihoodRating: 6,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when premisesId is missing', async () => {
    const res = await request(app).post('/api/fra').send({
      assessmentDate: '2026-01-01',
      nextReviewDate: '2027-01-01',
      assessorName: 'Jane Smith',
      likelihoodRating: 2,
      consequenceRating: 2,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('calculates overallRiskLevel on create for high risk', async () => {
    const highRiskFra = { ...fakeFra, overallRiskScore: 25, overallRiskLevel: 'INTOLERABLE' };
    mockFra.count.mockResolvedValue(0);
    mockFra.create.mockResolvedValue(highRiskFra);

    const res = await request(app).post('/api/fra').send({
      ...validCreateBody,
      likelihoodRating: 5,
      consequenceRating: 5,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.overallRiskLevel).toBe('INTOLERABLE');
  });
});

describe('GET /api/fra/:id', () => {
  it('returns a single FRA by id', async () => {
    mockFra.findFirst.mockResolvedValue({ ...fakeFra, premises: { id: PREMISES_ID, name: 'HQ' } });

    const res = await request(app).get(`/api/fra/${FRA_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(FRA_ID);
  });

  it('returns 404 when FRA does not exist', async () => {
    mockFra.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/fra/00000000-0000-0000-0000-000000000999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PUT /api/fra/:id', () => {
  it('updates an existing FRA', async () => {
    const updated = { ...fakeFra, assessorName: 'Bob Jones' };
    mockFra.findFirst.mockResolvedValue(fakeFra);
    mockFra.update.mockResolvedValue(updated);

    const res = await request(app).put(`/api/fra/${FRA_ID}`).send({ assessorName: 'Bob Jones' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessorName).toBe('Bob Jones');
  });

  it('returns 404 when FRA does not exist on update', async () => {
    mockFra.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/fra/00000000-0000-0000-0000-000000000999').send({ assessorName: 'Test' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/fra/:id/approve', () => {
  it('approves an FRA and sets status to CURRENT', async () => {
    const approved = { ...fakeFra, assessmentStatus: 'CURRENT', approvedBy: 'user-1' };
    mockFra.findFirst.mockResolvedValue(fakeFra);
    mockFra.update.mockResolvedValue(approved);

    const res = await request(app).post(`/api/fra/${FRA_ID}/approve`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessmentStatus).toBe('CURRENT');
  });

  it('returns 404 when FRA does not exist on approve', async () => {
    mockFra.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/fra/00000000-0000-0000-0000-000000000999/approve');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/fra/:id/action-plan', () => {
  it('returns the action plan for an FRA', async () => {
    const fraWithPlan = {
      id: FRA_ID,
      referenceNumber: 'FRA-2026-0001',
      actionPlan: [{ action: 'Install extinguisher', priority: 'HIGH', dueDate: '2026-03-01' }],
      overallRiskLevel: 'MEDIUM',
    };
    mockFra.findFirst.mockResolvedValue(fraWithPlan);

    const res = await request(app).get(`/api/fra/${FRA_ID}/action-plan`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.actionPlan).toBeDefined();
  });

  it('returns 404 when FRA does not exist for action plan', async () => {
    mockFra.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/fra/00000000-0000-0000-0000-000000000999/action-plan');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
