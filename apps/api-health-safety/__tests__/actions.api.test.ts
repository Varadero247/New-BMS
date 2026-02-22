import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    hSAction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { prisma } from '../src/prisma';
import router from '../src/routes/actions';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/actions', router);

const ACTION_ID = '00000000-0000-4000-a000-000000000001';

const mockAction = {
  id: ACTION_ID,
  referenceNumber: 'HSA-2601-0001',
  title: 'Fix slipping hazard in corridor',
  description: 'Anti-slip tape required in main corridor',
  type: 'CORRECTIVE',
  priority: 'HIGH',
  status: 'OPEN',
  ownerId: 'John Smith',
  dueDate: new Date('2026-03-31'),
  deletedAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/actions/overdue', () => {
  it('returns overdue actions with pagination', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([mockAction]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/actions/overdue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.total).toBe(1);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/actions/overdue');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/actions/stats', () => {
  it('returns action statistics', async () => {
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(20);
    (mockPrisma.hSAction.groupBy as jest.Mock).mockResolvedValue([
      { type: 'CORRECTIVE', _count: { id: 10 } },
    ]);

    const res = await request(app).get('/api/actions/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('byType');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.hSAction.count as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/actions/stats');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/actions', () => {
  it('returns list of actions', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([mockAction]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('filters by status, type, and priority', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/actions?status=OPEN&type=CORRECTIVE&priority=HIGH');
    expect(res.status).toBe(200);
  });

  it('supports search query', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/actions?search=hazard');
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/actions', () => {
  const validBody = {
    title: 'Fix slipping hazard in corridor',
    description: 'Anti-slip tape required in main corridor',
    type: 'CORRECTIVE',
    priority: 'HIGH',
    ownerId: 'John Smith',
    dueDate: '2026-03-31',
  };

  it('creates action successfully', async () => {
    (mockPrisma.hSAction.create as jest.Mock).mockResolvedValue(mockAction);

    const res = await request(app).post('/api/actions').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });

  it('returns 400 on validation error', async () => {
    const res = await request(app).post('/api/actions').send({ title: 'missing required fields' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.hSAction.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/actions').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('GET /api/actions/:id', () => {
  it('returns a single action', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(mockAction);

    const res = await request(app).get(`/api/actions/${ACTION_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(ACTION_ID);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/actions/${ACTION_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get(`/api/actions/${ACTION_ID}`);
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/actions/:id', () => {
  it('updates action successfully', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(mockAction);
    (mockPrisma.hSAction.update as jest.Mock).mockResolvedValue({
      ...mockAction,
      status: 'IN_PROGRESS',
    });

    const res = await request(app).put(`/api/actions/${ACTION_ID}`).send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put(`/api/actions/${ACTION_ID}`).send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(404);
  });

  it('returns 400 on validation error', async () => {
    const res = await request(app)
      .put(`/api/actions/${ACTION_ID}`)
      .send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(mockAction);
    (mockPrisma.hSAction.update as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).put(`/api/actions/${ACTION_ID}`).send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/actions/:id', () => {
  it('soft deletes action successfully', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(mockAction);
    (mockPrisma.hSAction.update as jest.Mock).mockResolvedValue({
      ...mockAction,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/actions/${ACTION_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/api/actions/${ACTION_ID}`);
    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(mockAction);
    (mockPrisma.hSAction.update as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).delete(`/api/actions/${ACTION_ID}`);
    expect(res.status).toBe(500);
  });
});

describe('H&S Actions — extended coverage', () => {
  it('GET /api/actions returns pagination totalPages computed from count', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(50);
    const res = await request(app).get('/api/actions?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(5);
  });

  it('GET /api/actions passes skip based on page/limit to findMany', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/actions?page=3&limit=5');
    expect(mockPrisma.hSAction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('GET /api/actions filters by priority wired to Prisma where', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/actions?priority=CRITICAL');
    expect(mockPrisma.hSAction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ priority: 'CRITICAL' }) })
    );
  });

  it('POST /api/actions returns 400 with error.code VALIDATION_ERROR on invalid type', async () => {
    const res = await request(app).post('/api/actions').send({
      title: 'Test', type: 'INVALID_TYPE', priority: 'HIGH', ownerId: 'u', dueDate: '2026-03-31',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/actions returns 400 when dueDate is missing', async () => {
    const res = await request(app).post('/api/actions').send({
      title: 'Fix hazard', type: 'CORRECTIVE', priority: 'HIGH', ownerId: 'John',
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/actions/overdue returns success:true with meta.total', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([mockAction, mockAction]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(2);
    const res = await request(app).get('/api/actions/overdue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.total).toBe(2);
  });

  it('GET /api/actions/stats returns byType object', async () => {
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(5);
    (mockPrisma.hSAction.groupBy as jest.Mock).mockResolvedValue([
      { type: 'PREVENTIVE', _count: { id: 3 } },
    ]);
    const res = await request(app).get('/api/actions/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.byType).toBeDefined();
  });

  it('PUT /api/actions/:id returns 200 with updated status in response', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(mockAction);
    (mockPrisma.hSAction.update as jest.Mock).mockResolvedValue({ ...mockAction, status: 'COMPLETED' });
    const res = await request(app).put(`/api/actions/${ACTION_ID}`).send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});

describe('H&S Actions — final coverage', () => {
  it('GET /api/actions response data is an array', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([mockAction]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/actions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/actions filters by type wired to Prisma where', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/actions?type=PREVENTIVE');
    expect(mockPrisma.hSAction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'PREVENTIVE' }) })
    );
  });

  it('DELETE /api/actions/:id calls update once with deletedAt', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(mockAction);
    (mockPrisma.hSAction.update as jest.Mock).mockResolvedValue({ ...mockAction, deletedAt: new Date() });
    await request(app).delete(`/api/actions/${ACTION_ID}`);
    expect(mockPrisma.hSAction.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('POST /api/actions response data has referenceNumber', async () => {
    (mockPrisma.hSAction.create as jest.Mock).mockResolvedValue(mockAction);
    const res = await request(app).post('/api/actions').send({
      title: 'Hazard check', description: 'Check for slip hazards', type: 'CORRECTIVE', priority: 'MEDIUM', ownerId: 'Alice', dueDate: '2026-06-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });

  it('GET /api/actions/stats returns 500 when groupBy rejects', async () => {
    (mockPrisma.hSAction.count as jest.Mock).mockResolvedValue(10);
    (mockPrisma.hSAction.groupBy as jest.Mock).mockRejectedValue(new Error('groupBy fail'));
    const res = await request(app).get('/api/actions/stats');
    expect(res.status).toBe(500);
  });

  it('GET /api/actions/overdue 500 when count rejects', async () => {
    (mockPrisma.hSAction.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.hSAction.count as jest.Mock).mockRejectedValue(new Error('count fail'));
    const res = await request(app).get('/api/actions/overdue');
    expect(res.status).toBe(500);
  });

  it('PUT /api/actions/:id calls update with correct where clause', async () => {
    (mockPrisma.hSAction.findFirst as jest.Mock).mockResolvedValue(mockAction);
    (mockPrisma.hSAction.update as jest.Mock).mockResolvedValue({ ...mockAction, status: 'IN_PROGRESS' });
    await request(app).put(`/api/actions/${ACTION_ID}`).send({ status: 'IN_PROGRESS' });
    expect(mockPrisma.hSAction.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ACTION_ID } })
    );
  });
});
