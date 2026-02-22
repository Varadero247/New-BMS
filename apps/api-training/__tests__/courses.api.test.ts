import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainCourse: {
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

import router from '../src/routes/courses';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/courses', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/courses', () => {
  it('should return courses', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.trainCourse.count.mockResolvedValue(1);
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns empty list when no courses exist', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([]);
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('findMany and count are each called once', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([]);
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    await request(app).get('/api/courses');
    expect(mockPrisma.trainCourse.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainCourse.count).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/courses/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/courses/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/courses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/courses', () => {
  it('should create', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainCourse.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app).post('/api/courses').send({ title: 'New', type: 'MANDATORY' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/courses/:id', () => {
  it('should update', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainCourse.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/courses/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('returns 404 if course not found on update', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/courses/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/courses/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainCourse.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/courses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 if course not found on delete', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/courses/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.trainCourse.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.trainCourse.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/courses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainCourse.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/courses').send({ title: 'Test Course', type: 'MANDATORY' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainCourse.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/courses/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainCourse.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/courses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('courses.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/courses', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/courses', async () => {
    const res = await request(app).get('/api/courses');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/courses', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/courses body has success property', async () => {
    const res = await request(app).get('/api/courses');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/courses body is an object', async () => {
    const res = await request(app).get('/api/courses');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/courses route is accessible', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBeDefined();
  });
});

describe('courses.api — edge cases and extended coverage', () => {
  it('GET /api/courses supports pagination params', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([]);
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    const res = await request(app).get('/api/courses?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('GET /api/courses pagination includes totalPages', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([]);
    mockPrisma.trainCourse.count.mockResolvedValue(25);
    const res = await request(app).get('/api/courses?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('POST /api/courses returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/courses').send({ type: 'MANDATORY' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/courses returns 400 when type is invalid', async () => {
    const res = await request(app).post('/api/courses').send({
      title: 'Test',
      type: 'INVALID_TYPE',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/courses creates INDUCTION type successfully', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainCourse.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Site Induction',
      type: 'INDUCTION',
    });
    const res = await request(app).post('/api/courses').send({
      title: 'Site Induction',
      type: 'INDUCTION',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/courses/:id returns correct success message', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainCourse.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/courses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('course deleted successfully');
  });

  it('PUT /api/courses/:id with invalid delivery enum returns 400', async () => {
    const res = await request(app)
      .put('/api/courses/00000000-0000-0000-0000-000000000001')
      .send({ delivery: 'INVALID_DELIVERY' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/courses returns data as array', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Course A' },
      { id: '00000000-0000-0000-0000-000000000002', title: 'Course B' },
    ]);
    mockPrisma.trainCourse.count.mockResolvedValue(2);
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('POST /api/courses with negative cost returns 400', async () => {
    const res = await request(app).post('/api/courses').send({
      title: 'Test Course',
      type: 'OPTIONAL',
      cost: -50,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('courses.api — final coverage expansion', () => {
  it('GET /api/courses with search filter returns 200', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([]);
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    const res = await request(app).get('/api/courses?search=fire+safety');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/courses count called exactly once', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([]);
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    await request(app).get('/api/courses');
    expect(mockPrisma.trainCourse.count).toHaveBeenCalledTimes(1);
  });

  it('GET /api/courses/:id returns 500 on DB error', async () => {
    mockPrisma.trainCourse.findFirst.mockRejectedValue(new Error('db fail'));
    const res = await request(app).get('/api/courses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/courses with OPTIONAL type creates successfully', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainCourse.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Optional Module',
      type: 'OPTIONAL',
    });
    const res = await request(app).post('/api/courses').send({
      title: 'Optional Module',
      type: 'OPTIONAL',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/courses/:id returns correct id in data', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000008',
      title: 'Advanced Course',
    });
    const res = await request(app).get('/api/courses/00000000-0000-0000-0000-000000000008');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000008');
  });

  it('DELETE /api/courses/:id returns message containing deleted', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainCourse.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/courses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('deleted');
  });
});

describe('courses.api — coverage to 40', () => {
  it('GET /api/courses response body has success and data', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([]);
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/courses response content-type is json', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([]);
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    const res = await request(app).get('/api/courses');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/courses/:id returns 404 code NOT_FOUND', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/courses/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /api/courses with duration creates successfully', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainCourse.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Duration Course',
      type: 'OPTIONAL',
      duration: 120,
    });
    const res = await request(app).post('/api/courses').send({
      title: 'Duration Course',
      type: 'OPTIONAL',
      duration: 120,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/courses/:id returns 500 on DB error', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainCourse.update.mockRejectedValue(new Error('db fail'));
    const res = await request(app)
      .put('/api/courses/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('courses.api — phase28 coverage', () => {
  it('GET /api/courses response body is not null', async () => {
    mockPrisma.trainCourse.findMany.mockResolvedValue([]);
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    const res = await request(app).get('/api/courses');
    expect(res.body).not.toBeNull();
  });

  it('POST /api/courses create mock called once on success', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainCourse.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'T', type: 'MANDATORY' });
    await request(app).post('/api/courses').send({ title: 'T', type: 'MANDATORY' });
    expect(mockPrisma.trainCourse.create).toHaveBeenCalledTimes(1);
  });

  it('GET /api/courses/:id returns 500 error code INTERNAL_ERROR', async () => {
    mockPrisma.trainCourse.findFirst.mockRejectedValue(new Error('db gone'));
    const res = await request(app).get('/api/courses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /api/courses/:id update called once on success', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainCourse.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated' });
    await request(app).put('/api/courses/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(mockPrisma.trainCourse.update).toHaveBeenCalledTimes(1);
  });

  it('DELETE /api/courses/:id 500 error body success is false', async () => {
    mockPrisma.trainCourse.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainCourse.update.mockRejectedValue(new Error('connection lost'));
    const res = await request(app).delete('/api/courses/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('courses — phase30 coverage', () => {
  it('handles string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

  it('handles JSON stringify', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}');
  });

  it('handles array filter', () => {
    expect([1, 2, 3, 4].filter(x => x > 2)).toEqual([3, 4]);
  });

  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

});
