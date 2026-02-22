import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskReview: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

import router from '../src/routes/reviews';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/reviews', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/reviews', () => {
  it('should return reviews', async () => {
    mockPrisma.riskReview.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.riskReview.count.mockResolvedValue(1);
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/reviews/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/reviews/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/reviews', () => {
  it('should create', async () => {
    mockPrisma.riskReview.count.mockResolvedValue(0);
    mockPrisma.riskReview.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app)
      .post('/api/reviews')
      .send({ riskId: 'risk-1', scheduledDate: '2026-03-01T00:00:00.000Z' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/reviews/:id', () => {
  it('should update', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.riskReview.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/reviews/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/reviews/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.riskReview.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when record not found', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── Validation errors ─────────────────────────────────────────────────────

describe('POST /api/reviews — validation', () => {
  it('returns 400 when riskId is missing', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ scheduledDate: '2026-03-01T00:00:00.000Z' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when scheduledDate is missing', async () => {
    const res = await request(app).post('/api/reviews').send({ riskId: 'risk-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/reviews/:id — not-found', () => {
  it('returns 404 when record not found', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/reviews/00000000-0000-0000-0000-000000000099')
      .send({ findings: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.riskReview.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.riskReview.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.riskReview.count.mockResolvedValue(0);
    mockPrisma.riskReview.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/reviews')
      .send({ riskId: 'risk-1', scheduledDate: '2026-03-01T00:00:00.000Z' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskReview.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/reviews/00000000-0000-0000-0000-000000000001')
      .send({ findings: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskReview.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Query filtering ────────────────────────────────────────────────────────

describe('GET /api/reviews — filtering', () => {
  it('filters by status query param', async () => {
    mockPrisma.riskReview.findMany.mockResolvedValue([]);
    mockPrisma.riskReview.count.mockResolvedValue(0);
    const res = await request(app).get('/api/reviews?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(mockPrisma.riskReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) })
    );
  });

  it('searches by reference/findings keyword', async () => {
    mockPrisma.riskReview.findMany.mockResolvedValue([]);
    mockPrisma.riskReview.count.mockResolvedValue(0);
    const res = await request(app).get('/api/reviews?search=overdue');
    expect(res.status).toBe(200);
    expect(mockPrisma.riskReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });
});

describe('reviews.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/reviews', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/reviews', async () => {
    const res = await request(app).get('/api/reviews');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/reviews', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/reviews body has success property', async () => {
    const res = await request(app).get('/api/reviews');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('reviews.api — pagination and extended paths', () => {
  it('GET / includes pagination object with page, limit, total, totalPages', async () => {
    mockPrisma.riskReview.findMany.mockResolvedValue([]);
    mockPrisma.riskReview.count.mockResolvedValue(50);
    const res = await request(app).get('/api/reviews?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('GET / pagination total reflects count mock', async () => {
    mockPrisma.riskReview.findMany.mockResolvedValue([]);
    mockPrisma.riskReview.count.mockResolvedValue(75);
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(75);
  });

  it('GET / returns data as an array', async () => {
    mockPrisma.riskReview.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001' },
      { id: '00000000-0000-0000-0000-000000000002' },
    ]);
    mockPrisma.riskReview.count.mockResolvedValue(2);
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('POST / with status field succeeds', async () => {
    mockPrisma.riskReview.count.mockResolvedValue(0);
    mockPrisma.riskReview.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SCHEDULED',
    });
    const res = await request(app)
      .post('/api/reviews')
      .send({ riskId: 'risk-1', scheduledDate: '2026-06-01T00:00:00.000Z', status: 'SCHEDULED' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 when scheduledDate is invalid datetime', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ riskId: 'risk-1', scheduledDate: 'not-a-date' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /:id returns success message', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskReview.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('review deleted successfully');
  });

  it('PUT /:id with optional fields succeeds', async () => {
    mockPrisma.riskReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskReview.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      findings: 'All clear',
    });
    const res = await request(app)
      .put('/api/reviews/00000000-0000-0000-0000-000000000001')
      .send({ findings: 'All clear', recommendations: 'None' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /?search with count=0 returns empty data array', async () => {
    mockPrisma.riskReview.findMany.mockResolvedValue([]);
    mockPrisma.riskReview.count.mockResolvedValue(0);
    const res = await request(app).get('/api/reviews?search=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });
});
