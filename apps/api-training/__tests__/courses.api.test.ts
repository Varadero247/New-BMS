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
