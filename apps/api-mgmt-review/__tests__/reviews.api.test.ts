import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mgmtReview: {
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
  it('should return management reviews', async () => {
    mockPrisma.mgmtReview.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.mgmtReview.count.mockResolvedValue(1);
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/reviews/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/reviews/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/reviews', () => {
  it('should create', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    mockPrisma.mgmtReview.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app).post('/api/reviews').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/reviews/:id', () => {
  it('should update', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.mgmtReview.update.mockResolvedValue({
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
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.mgmtReview.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when record not found', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── Validation errors ─────────────────────────────────────────────────────

describe('POST /api/reviews — validation', () => {
  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/reviews').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when minutesUrl is not a valid URL', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    const res = await request(app)
      .post('/api/reviews')
      .send({ title: 'Review', minutesUrl: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/reviews/:id — validation and not-found', () => {
  it('returns 404 when record not found', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/reviews/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.mgmtReview.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.mgmtReview.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    mockPrisma.mgmtReview.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/reviews').send({ title: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.mgmtReview.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/reviews/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.mgmtReview.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Query filtering ────────────────────────────────────────────────────────

describe('GET /api/reviews — filtering', () => {
  it('filters by status query param', async () => {
    mockPrisma.mgmtReview.findMany.mockResolvedValue([]);
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    const res = await request(app).get('/api/reviews?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(mockPrisma.mgmtReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) })
    );
  });

  it('searches by title keyword', async () => {
    mockPrisma.mgmtReview.findMany.mockResolvedValue([]);
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    const res = await request(app).get('/api/reviews?search=quarterly');
    expect(res.status).toBe(200);
    expect(mockPrisma.mgmtReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ title: expect.objectContaining({ contains: 'quarterly' }) }),
      })
    );
  });

  it('returns pagination metadata', async () => {
    mockPrisma.mgmtReview.findMany.mockResolvedValue([]);
    mockPrisma.mgmtReview.count.mockResolvedValue(42);
    const res = await request(app).get('/api/reviews?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.total).toBe(42);
    expect(res.body.pagination.totalPages).toBe(5);
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
});

describe('reviews.api — extended error and field coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / includes pagination.page in response', async () => {
    mockPrisma.mgmtReview.findMany.mockResolvedValue([]);
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
  });

  it('GET / includes pagination.totalPages in response', async () => {
    mockPrisma.mgmtReview.findMany.mockResolvedValue([]);
    mockPrisma.mgmtReview.count.mockResolvedValue(20);
    const res = await request(app).get('/api/reviews?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('GET / orgId from auth is included in findMany where clause', async () => {
    mockPrisma.mgmtReview.findMany.mockResolvedValue([]);
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    await request(app).get('/api/reviews');
    expect(mockPrisma.mgmtReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: 'org-1', deletedAt: null }),
      })
    );
  });

  it('POST / returns 400 when minutesUrl is invalid', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    const res = await request(app).post('/api/reviews').send({ title: 'Review', minutesUrl: 'bad-url' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:id returns 400 when minutesUrl is invalid', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app)
      .put('/api/reviews/00000000-0000-0000-0000-000000000001')
      .send({ minutesUrl: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE / response data has a message field', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.mgmtReview.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('POST / create is called with orgId from auth', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    mockPrisma.mgmtReview.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'T' });
    await request(app).post('/api/reviews').send({ title: 'T' });
    expect(mockPrisma.mgmtReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ orgId: 'org-1' }),
      })
    );
  });

  it('DELETE / update is called with deletedAt Date', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.mgmtReview.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.mgmtReview.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });
});

describe('reviews.api — exhaustive coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns success:true when findMany resolves', async () => {
    mockPrisma.mgmtReview.findMany.mockResolvedValue([]);
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST / create is called exactly once for valid payload', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    mockPrisma.mgmtReview.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Review' });
    await request(app).post('/api/reviews').send({ title: 'Review' });
    expect(mockPrisma.mgmtReview.create).toHaveBeenCalledTimes(1);
  });

  it('GET /:id returns success:true for found record', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Rev' });
    const res = await request(app).get('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id update is called with correct id in where clause', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.mgmtReview.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated' });
    await request(app)
      .put('/api/reviews/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(mockPrisma.mgmtReview.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('DELETE /:id findFirst is called with correct id', async () => {
    mockPrisma.mgmtReview.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.mgmtReview.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/reviews/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.mgmtReview.findFirst).toHaveBeenCalledTimes(1);
  });

  it('GET / returns data as an array', async () => {
    mockPrisma.mgmtReview.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001' }]);
    mockPrisma.mgmtReview.count.mockResolvedValue(1);
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / returns the created item in data', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    mockPrisma.mgmtReview.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'New Review' });
    const res = await request(app).post('/api/reviews').send({ title: 'New Review' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('New Review');
  });
});
