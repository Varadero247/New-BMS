import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    performanceGoal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
    performanceCycle: {
      findUnique: jest.fn(),
    },
    goalUpdate: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = {
      id: '00000000-0000-4000-a000-000000000099',
      orgId: '00000000-0000-4000-a000-000000000100',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import router from '../src/routes/goals';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/goals', router);

const GOAL_ID = '00000000-0000-4000-a000-000000000001';
const EMP_ID = '00000000-0000-4000-a000-000000000002';
const CYCLE_ID = '00000000-0000-4000-a000-000000000003';

const mockGoal = {
  id: GOAL_ID,
  employeeId: EMP_ID,
  cycleId: CYCLE_ID,
  title: 'Improve quality score by 10%',
  description: 'Achieve 10% improvement in quality metrics',
  category: 'PERFORMANCE',
  status: 'NOT_STARTED',
  progress: 0,
  dueDate: new Date('2026-12-31'),
  employee: {
    id: EMP_ID,
    employeeNumber: 'EMP-001',
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Engineer',
  },
  cycle: { id: CYCLE_ID, name: '2026 Annual', status: 'ACTIVE' },
  _count: { updates: 0 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/goals', () => {
  it('returns list of goals with meta', async () => {
    (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValue([mockGoal]);
    (mockPrisma.performanceGoal.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/goals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('filters by employeeId and cycleId', async () => {
    (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceGoal.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get(`/api/goals?employeeId=${EMP_ID}&cycleId=${CYCLE_ID}`);
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.performanceGoal.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/goals');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/goals/overdue', () => {
  it('returns overdue goals', async () => {
    (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValue([mockGoal]);

    const res = await request(app).get('/api/goals/overdue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.performanceGoal.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/goals/overdue');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/goals/stats', () => {
  it('returns goal statistics', async () => {
    (mockPrisma.performanceGoal.count as jest.Mock).mockResolvedValue(5);
    (mockPrisma.performanceGoal.groupBy as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceGoal.aggregate as jest.Mock).mockResolvedValue({
      _avg: { progress: 50 },
    });

    const res = await request(app).get('/api/goals/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('avgProgress');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.performanceGoal.count as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/goals/stats');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/goals/:id', () => {
  it('returns a single goal', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue({
      ...mockGoal,
      updates: [],
    });

    const res = await request(app).get(`/api/goals/${GOAL_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(GOAL_ID);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/goals/${GOAL_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/goals', () => {
  const validBody = {
    cycleId: CYCLE_ID,
    employeeId: EMP_ID,
    title: 'Improve quality score by 10%',
    description: 'Achieve 10% improvement in quality metrics',
    category: 'PERFORMANCE',
    measurementCriteria: 'QA dashboard monthly report',
    dueDate: '2026-12-31',
  };

  it('creates a goal successfully', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue({ id: EMP_ID });
    (mockPrisma.performanceCycle.findUnique as jest.Mock).mockResolvedValue({ id: CYCLE_ID });
    (mockPrisma.performanceGoal.create as jest.Mock).mockResolvedValue(mockGoal);

    const res = await request(app).post('/api/goals').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when employee not found', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.performanceCycle.findUnique as jest.Mock).mockResolvedValue({ id: CYCLE_ID });

    const res = await request(app).post('/api/goals').send(validBody);
    expect(res.status).toBe(404);
  });

  it('returns 404 when cycle not found', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue({ id: EMP_ID });
    (mockPrisma.performanceCycle.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/api/goals').send(validBody);
    expect(res.status).toBe(404);
  });

  it('returns 400 on validation error', async () => {
    const res = await request(app).post('/api/goals').send({ title: 'missing required fields' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue({ id: EMP_ID });
    (mockPrisma.performanceCycle.findUnique as jest.Mock).mockResolvedValue({ id: CYCLE_ID });
    (mockPrisma.performanceGoal.create as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/api/goals').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/goals/:id', () => {
  it('updates goal successfully', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(mockGoal);
    (mockPrisma.performanceGoal.update as jest.Mock).mockResolvedValue({
      ...mockGoal,
      progress: 50,
    });

    const res = await request(app)
      .put(`/api/goals/${GOAL_ID}`)
      .send({ progress: 50, status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put(`/api/goals/${GOAL_ID}`).send({ progress: 50 });
    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(mockGoal);
    (mockPrisma.performanceGoal.update as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).put(`/api/goals/${GOAL_ID}`).send({ progress: 50 });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/goals/:id', () => {
  it('deletes goal successfully', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(mockGoal);
    (mockPrisma.performanceGoal.delete as jest.Mock).mockResolvedValue(mockGoal);

    const res = await request(app).delete(`/api/goals/${GOAL_ID}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/api/goals/${GOAL_ID}`);
    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(mockGoal);
    (mockPrisma.performanceGoal.delete as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).delete(`/api/goals/${GOAL_ID}`);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/goals/:id/updates', () => {
  it('adds progress update successfully', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(mockGoal);
    const mockUpdate = {
      id: '00000000-0000-4000-a000-000000000010',
      goalId: GOAL_ID,
      progressBefore: 0,
      progressAfter: 50,
    };
    (mockPrisma.$transaction as jest.Mock).mockResolvedValue(mockUpdate);

    const res = await request(app).post(`/api/goals/${GOAL_ID}/updates`).send({
      progressAfter: 50,
      updateNotes: 'Completed first milestone',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when goal not found', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(`/api/goals/${GOAL_ID}/updates`).send({
      progressAfter: 50,
      updateNotes: 'Done',
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 on validation error', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(mockGoal);

    const res = await request(app)
      .post(`/api/goals/${GOAL_ID}/updates`)
      .send({ progressAfter: 200 });
    expect(res.status).toBe(400);
  });
});

// ── Additional coverage ──────────────────────────────────────────────────────

describe('GET /api/goals — pagination and filter coverage', () => {
  it('meta.totalPages is calculated correctly for multiple pages', async () => {
    (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValue([mockGoal]);
    (mockPrisma.performanceGoal.count as jest.Mock).mockResolvedValue(45);

    const res = await request(app).get('/api/goals?page=1&limit=10');
    expect(res.status).toBe(200);
    // 45 records / 10 per page = 5 pages
    expect(res.body.meta.totalPages).toBe(5);
  });

  it('filters by status param are forwarded to Prisma where clause', async () => {
    (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceGoal.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/goals?status=IN_PROGRESS');
    expect(mockPrisma.performanceGoal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'IN_PROGRESS' }),
      })
    );
  });

  it('returns success:true with empty data array when no goals exist', async () => {
    (mockPrisma.performanceGoal.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.performanceGoal.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/goals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 400 when creating goal with invalid category enum', async () => {
    (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue({ id: EMP_ID });
    (mockPrisma.performanceCycle.findUnique as jest.Mock).mockResolvedValue({ id: CYCLE_ID });

    const res = await request(app).post('/api/goals').send({
      cycleId: CYCLE_ID,
      employeeId: EMP_ID,
      title: 'Test Goal',
      description: 'desc',
      category: 'INVALID_CATEGORY_XYZ',
      measurementCriteria: 'criteria',
      dueDate: '2026-12-31',
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/goals/:id returns error.code NOT_FOUND in response body', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/goals/${GOAL_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /api/goals/:id with invalid status enum returns 400', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(mockGoal);

    const res = await request(app)
      .put(`/api/goals/${GOAL_ID}`)
      .send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
  });

  it('POST /api/goals/:id/updates returns 500 on transaction failure', async () => {
    (mockPrisma.performanceGoal.findUnique as jest.Mock).mockResolvedValue(mockGoal);
    (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('tx fail'));

    const res = await request(app).post(`/api/goals/${GOAL_ID}/updates`).send({
      progressAfter: 50,
      updateNotes: 'Milestone done',
    });
    expect(res.status).toBe(500);
  });
});
