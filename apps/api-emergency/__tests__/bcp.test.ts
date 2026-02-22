import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    femBusinessContinuityPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    femBcpExercise: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

import router from '../src/routes/bcp';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/bcp', router);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockBcp = jest.mocked(prisma.femBusinessContinuityPlan);
const mockExercise = jest.mocked(prisma.femBcpExercise);

const BCP_ID = '00000000-0000-0000-0000-000000000001';
const EXERCISE_ID = '00000000-0000-0000-0000-000000000002';

const fakeBcp = {
  id: BCP_ID,
  planReference: 'BCP-2026-001',
  title: 'Main Business Continuity Plan',
  version: '1.0',
  status: 'DRAFT',
  reviewDate: '2027-01-01T00:00:00.000Z',
  organisationId: 'org-1',
  createdAt: new Date().toISOString(),
};

const validCreateBody = {
  title: 'Main Business Continuity Plan',
  reviewDate: '2027-01-01',
};

describe('GET /api/bcp', () => {
  it('returns list of BCPs with pagination', async () => {
    mockBcp.findMany.mockResolvedValue([fakeBcp]);
    mockBcp.count.mockResolvedValue(1);

    const res = await request(app).get('/api/bcp');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].planReference).toBe('BCP-2026-001');
    expect(res.body.pagination.total).toBe(1);
  });

  it('returns empty list when no BCPs', async () => {
    mockBcp.findMany.mockResolvedValue([]);
    mockBcp.count.mockResolvedValue(0);

    const res = await request(app).get('/api/bcp');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('filters by status query param', async () => {
    mockBcp.findMany.mockResolvedValue([fakeBcp]);
    mockBcp.count.mockResolvedValue(1);

    const res = await request(app).get('/api/bcp?status=DRAFT');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 on database error', async () => {
    mockBcp.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/bcp');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/bcp/due-review', () => {
  it('returns BCPs due for review', async () => {
    const dueBcp = {
      ...fakeBcp,
      reviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    mockBcp.findMany.mockResolvedValue([dueBcp]);

    const res = await request(app).get('/api/bcp/due-review');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns empty array when no BCPs due for review', async () => {
    mockBcp.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/bcp/due-review');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/bcp', () => {
  it('creates a new BCP and returns 201', async () => {
    mockBcp.count.mockResolvedValue(0);
    mockBcp.create.mockResolvedValue(fakeBcp);

    const res = await request(app).post('/api/bcp').send(validCreateBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Main Business Continuity Plan');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/bcp').send({
      reviewDate: '2027-01-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when reviewDate is missing', async () => {
    const res = await request(app).post('/api/bcp').send({
      title: 'My BCP',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('creates BCP with emergency types', async () => {
    const bcpWithTypes = { ...fakeBcp, emergencyTypes: ['FIRE', 'FLOOD'] };
    mockBcp.count.mockResolvedValue(0);
    mockBcp.create.mockResolvedValue(bcpWithTypes);

    const res = await request(app)
      .post('/api/bcp')
      .send({
        ...validCreateBody,
        emergencyTypes: ['FIRE', 'FLOOD'],
        crisisTeamLead: 'Alice',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.emergencyTypes).toContain('FIRE');
  });
});

describe('GET /api/bcp/:id', () => {
  it('returns a single BCP with exercises', async () => {
    mockBcp.findUnique.mockResolvedValue({ ...fakeBcp, exercises: [] });

    const res = await request(app).get(`/api/bcp/${BCP_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(BCP_ID);
  });

  it('returns 404 when BCP does not exist', async () => {
    mockBcp.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/bcp/00000000-0000-0000-0000-000000000999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PUT /api/bcp/:id', () => {
  it('updates an existing BCP', async () => {
    const updated = { ...fakeBcp, title: 'Updated BCP', status: 'APPROVED' };
    mockBcp.findFirst.mockResolvedValue(fakeBcp);
    mockBcp.update.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/api/bcp/${BCP_ID}`)
      .send({ title: 'Updated BCP', status: 'APPROVED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated BCP');
  });

  it('returns 404 when BCP does not exist on update', async () => {
    mockBcp.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/bcp/00000000-0000-0000-0000-000000000999')
      .send({ title: 'Ghost' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/bcp/:id/activate', () => {
  it('activates a BCP and sets status to ACTIVE', async () => {
    const activated = { ...fakeBcp, status: 'ACTIVE' };
    mockBcp.findFirst.mockResolvedValue(fakeBcp);
    mockBcp.update.mockResolvedValue(activated);

    const res = await request(app).post(`/api/bcp/${BCP_ID}/activate`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('returns 404 when BCP does not exist on activate', async () => {
    mockBcp.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/bcp/00000000-0000-0000-0000-000000000999/activate');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/bcp/:id/exercise', () => {
  it('creates an exercise for a BCP', async () => {
    const exercise = {
      id: EXERCISE_ID,
      bcpId: BCP_ID,
      exerciseType: 'TABLETOP',
      title: 'Annual Tabletop Exercise',
      scheduledDate: '2026-06-01T00:00:00.000Z',
    };
    mockBcp.findFirst.mockResolvedValue(fakeBcp);
    mockExercise.create.mockResolvedValue(exercise);

    const res = await request(app).post(`/api/bcp/${BCP_ID}/exercise`).send({
      exerciseType: 'TABLETOP',
      title: 'Annual Tabletop Exercise',
      scheduledDate: '2026-06-01',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.exerciseType).toBe('TABLETOP');
  });

  it('returns 400 when exerciseType is invalid', async () => {
    const res = await request(app).post(`/api/bcp/${BCP_ID}/exercise`).send({
      exerciseType: 'INVALID_TYPE',
      title: 'Test',
      scheduledDate: '2026-06-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when BCP not found for exercise creation', async () => {
    mockBcp.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/bcp/00000000-0000-0000-0000-000000000999/exercise')
      .send({
        exerciseType: 'TABLETOP',
        title: 'Test',
        scheduledDate: '2026-06-01',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PUT /api/bcp/:bcpId/exercise/:id', () => {
  it('updates an exercise with results', async () => {
    const updatedExercise = {
      id: EXERCISE_ID,
      bcpId: BCP_ID,
      exerciseType: 'TABLETOP',
      outcome: 'PASSED',
      objectivesMet: true,
    };
    mockExercise.findFirst.mockResolvedValue({ id: EXERCISE_ID, bcpId: BCP_ID });
    mockExercise.update.mockResolvedValue(updatedExercise);
    mockBcp.update.mockResolvedValue({
      ...fakeBcp,
      lastTestedDate: new Date().toISOString(),
      lastTestOutcome: 'PASSED',
    });

    const res = await request(app).put(`/api/bcp/${BCP_ID}/exercise/${EXERCISE_ID}`).send({
      outcome: 'PASSED',
      objectivesMet: true,
      findings: 'All objectives met',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outcome).toBe('PASSED');
  });

  it('returns 404 when exercise does not exist', async () => {
    mockExercise.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/bcp/${BCP_ID}/exercise/00000000-0000-0000-0000-000000000999`)
      .send({
        outcome: 'PASSED',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 when outcome enum is invalid', async () => {
    const res = await request(app).put(`/api/bcp/${BCP_ID}/exercise/${EXERCISE_ID}`).send({
      outcome: 'EXCELLENT',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('BCP Routes — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns correct totalPages for multi-page result', async () => {
    mockBcp.findMany.mockResolvedValue([]);
    mockBcp.count.mockResolvedValue(50);

    const res = await request(app).get('/api/bcp?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('GET / passes correct skip to Prisma for page 2 limit 5', async () => {
    mockBcp.findMany.mockResolvedValue([]);
    mockBcp.count.mockResolvedValue(15);

    await request(app).get('/api/bcp?page=2&limit=5');

    expect(mockBcp.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('GET /:id returns 500 on database error', async () => {
    mockBcp.findUnique.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).get(`/api/bcp/${BCP_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on database error during update', async () => {
    mockBcp.findFirst.mockResolvedValue(fakeBcp);
    mockBcp.update.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).put(`/api/bcp/${BCP_ID}`).send({ title: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 on database error during create', async () => {
    mockBcp.count.mockResolvedValue(0);
    mockBcp.create.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).post('/api/bcp').send({
      title: 'New BCP',
      reviewDate: '2027-06-01',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/activate returns 500 on database error', async () => {
    mockBcp.findFirst.mockResolvedValue(fakeBcp);
    mockBcp.update.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).post(`/api/bcp/${BCP_ID}/activate`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('ACTIVATE_ERROR');
  });

  it('GET / response shape contains success:true and pagination object', async () => {
    mockBcp.findMany.mockResolvedValue([fakeBcp]);
    mockBcp.count.mockResolvedValue(1);

    const res = await request(app).get('/api/bcp');

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total', 1);
  });
});
