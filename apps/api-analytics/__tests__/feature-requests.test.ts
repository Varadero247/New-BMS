import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    featureRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', email: 'a@b.com' };
    next();
  },
}));

import featureRequestsRouter from '../src/routes/feature-requests';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/feature-requests', featureRequestsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/feature-requests', () => {
  it('lists feature requests with pagination', async () => {
    (prisma.featureRequest.findMany as jest.Mock).mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Dark mode',
        votes: 10,
        status: 'SUBMITTED',
      },
    ]);
    (prisma.featureRequest.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/feature-requests');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.featureRequests).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it('filters by status', async () => {
    (prisma.featureRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.featureRequest.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/feature-requests?status=PLANNED');
    expect(prisma.featureRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'PLANNED' } })
    );
  });

  it('sorts by votes descending', async () => {
    (prisma.featureRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.featureRequest.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/feature-requests');
    expect(prisma.featureRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { votes: 'desc' } })
    );
  });
});

describe('GET /api/feature-requests/aggregate', () => {
  it('returns top 10 by votes and status counts', async () => {
    (prisma.featureRequest.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Dark mode', votes: 50 },
    ]);
    (prisma.featureRequest.groupBy as jest.Mock).mockResolvedValue([
      { status: 'SUBMITTED', _count: { id: 3 } },
      { status: 'SHIPPED', _count: { id: 1 } },
    ]);

    const res = await request(app).get('/api/feature-requests/aggregate');
    expect(res.status).toBe(200);
    expect(res.body.data.topByVotes).toHaveLength(1);
    expect(res.body.data.statusCounts.SUBMITTED).toBe(3);
  });
});

describe('GET /api/feature-requests/:id', () => {
  it('returns a single feature request', async () => {
    (prisma.featureRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'SSO Support',
    });

    const res = await request(app).get(
      '/api/feature-requests/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.featureRequest.title).toBe('SSO Support');
  });

  it('returns 404 for missing feature request', async () => {
    (prisma.featureRequest.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(
      '/api/feature-requests/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
  });
});

describe('POST /api/feature-requests', () => {
  it('creates a feature request', async () => {
    const created = { id: 'fr-new', title: 'API Webhooks', votes: 0, status: 'SUBMITTED' };
    (prisma.featureRequest.create as jest.Mock).mockResolvedValue(created);

    const res = await request(app).post('/api/feature-requests').send({
      title: 'API Webhooks',
      description: 'Need webhook support',
      requestedBy: 'customer@test.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.featureRequest.id).toBe('fr-new');
  });

  it('returns 400 if title is missing', async () => {
    const res = await request(app).post('/api/feature-requests').send({ description: 'No title' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/feature-requests/:id', () => {
  it('updates status and priority', async () => {
    (prisma.featureRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma.featureRequest.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    });

    const res = await request(app)
      .patch('/api/feature-requests/00000000-0000-0000-0000-000000000001')
      .send({ status: 'IN_PROGRESS', priority: 'HIGH' });

    expect(res.status).toBe(200);
    expect(prisma.featureRequest.update).toHaveBeenCalled();
  });

  it('returns 404 for missing feature request', async () => {
    (prisma.featureRequest.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/feature-requests/00000000-0000-0000-0000-000000000099')
      .send({ status: 'PLANNED' });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/feature-requests/:id/vote', () => {
  it('increments votes', async () => {
    (prisma.featureRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      votes: 5,
    });
    (prisma.featureRequest.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      votes: 6,
    });

    const res = await request(app).post(
      '/api/feature-requests/00000000-0000-0000-0000-000000000001/vote'
    );
    expect(res.status).toBe(200);
    expect(prisma.featureRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { votes: 6 } })
    );
  });

  it('returns 404 for missing feature request', async () => {
    (prisma.featureRequest.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(
      '/api/feature-requests/00000000-0000-0000-0000-000000000099/vote'
    );
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.featureRequest.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/feature-requests');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.featureRequest.count as jest.Mock).mockResolvedValue(0);
    (prisma.featureRequest.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/feature-requests').send({ title: 'API Webhooks', description: 'Need webhook support', requestedBy: 'customer@test.com' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PATCH /:id returns 500 when update fails', async () => {
    (prisma.featureRequest.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.featureRequest.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).patch('/api/feature-requests/00000000-0000-0000-0000-000000000001').send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// Feature Requests — additional coverage (5 tests)
// ===================================================================
describe('Feature Requests — additional coverage', () => {
  it('GET /feature-requests response has success:true and pagination object', async () => {
    (prisma.featureRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.featureRequest.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/feature-requests');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('pagination');
    expect(res.body.data.pagination).toHaveProperty('total');
    expect(res.body.data.pagination).toHaveProperty('page');
  });

  it('GET /feature-requests returns empty list when no requests exist', async () => {
    (prisma.featureRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.featureRequest.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/feature-requests');

    expect(res.status).toBe(200);
    expect(res.body.data.featureRequests).toHaveLength(0);
    expect(res.body.data.pagination.total).toBe(0);
  });

  it('GET /feature-requests honours page and limit query params', async () => {
    (prisma.featureRequest.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.featureRequest.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/feature-requests?page=2&limit=5');

    expect(prisma.featureRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('GET /feature-requests/:id returns 500 on DB error', async () => {
    (prisma.featureRequest.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get(
      '/api/feature-requests/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /feature-requests/:id/vote returns 500 on DB update error', async () => {
    (prisma.featureRequest.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      votes: 3,
    });
    (prisma.featureRequest.update as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).post(
      '/api/feature-requests/00000000-0000-0000-0000-000000000001/vote'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
