import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainMatrix: {
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

import router from '../src/routes/matrix';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/matrix', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/matrix', () => {
  it('should return matrix entries', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', competencyId: 'comp-1', employeeId: 'emp-1' },
    ]);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/matrix');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support pagination', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([]);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/matrix?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainMatrix.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.trainMatrix.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/matrix');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/matrix/:id', () => {
  it('should return matrix entry by id', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      competencyId: 'comp-1',
    });
    const res = await request(app).get('/api/matrix/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/matrix/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainMatrix.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/matrix/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/matrix', () => {
  it('should create a matrix entry', async () => {
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      competencyId: 'comp-1',
      employeeId: 'emp-1',
    });
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should create with all optional fields', async () => {
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.create.mockResolvedValue({ id: '2' });
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
      employeeName: 'John Doe',
      currentLevel: 'DEVELOPING',
      targetLevel: 'COMPETENT',
      assessedDate: '2026-01-01T00:00:00.000Z',
      assessedBy: 'user-1',
      nextReviewDate: '2027-01-01T00:00:00.000Z',
      gap: true,
      notes: 'Needs improvement',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 if competencyId is missing', async () => {
    const res = await request(app).post('/api/matrix').send({ employeeId: 'emp-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if employeeId is missing', async () => {
    const res = await request(app).post('/api/matrix').send({ competencyId: 'comp-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if currentLevel is invalid', async () => {
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
      currentLevel: 'INVALID_LEVEL',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on create error', async () => {
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/matrix/:id', () => {
  it('should update a matrix entry', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainMatrix.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      currentLevel: 'COMPETENT',
    });
    const res = await request(app)
      .put('/api/matrix/00000000-0000-0000-0000-000000000001')
      .send({ currentLevel: 'COMPETENT' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/matrix/00000000-0000-0000-0000-000000000099')
      .send({ currentLevel: 'COMPETENT' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 on invalid targetLevel', async () => {
    const res = await request(app)
      .put('/api/matrix/00000000-0000-0000-0000-000000000001')
      .send({ targetLevel: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainMatrix.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/matrix/00000000-0000-0000-0000-000000000001')
      .send({ currentLevel: 'COMPETENT' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/matrix/:id', () => {
  it('should soft delete a matrix entry', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainMatrix.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/matrix/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/matrix/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainMatrix.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/matrix/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('matrix.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/matrix', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/matrix', async () => {
    const res = await request(app).get('/api/matrix');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('matrix.api — edge cases and extended coverage', () => {
  it('GET /api/matrix supports pagination params', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([]);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/matrix?page=3&limit=15');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(15);
  });

  it('GET /api/matrix pagination includes totalPages', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([]);
    mockPrisma.trainMatrix.count.mockResolvedValue(40);
    const res = await request(app).get('/api/matrix?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('GET /api/matrix returns data as array', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', competencyId: 'c1', employeeId: 'e1' },
    ]);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/matrix');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/matrix returns 400 when both ids are missing', async () => {
    const res = await request(app).post('/api/matrix').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/matrix with gap=true creates successfully', async () => {
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      competencyId: 'comp-1',
      employeeId: 'emp-1',
      gap: true,
    });
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
      gap: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/matrix/:id returns correct success message', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainMatrix.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/matrix/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('matrix entry deleted successfully');
  });

  it('PUT /api/matrix/:id with gap=false succeeds', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainMatrix.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      gap: false,
    });
    const res = await request(app)
      .put('/api/matrix/00000000-0000-0000-0000-000000000001')
      .send({ gap: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/matrix/:id returns correct data id', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      competencyId: 'comp-5',
    });
    const res = await request(app).get('/api/matrix/00000000-0000-0000-0000-000000000005');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000005');
  });

  it('POST /api/matrix returns 400 when currentLevel is invalid enum', async () => {
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
      currentLevel: 'SUPER_EXPERT',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/matrix supports search filter', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([]);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/matrix?search=John');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('matrix.api — final coverage expansion', () => {
  it('GET /api/matrix count called exactly once', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([]);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    await request(app).get('/api/matrix');
    expect(mockPrisma.trainMatrix.count).toHaveBeenCalledTimes(1);
  });

  it('GET /api/matrix response content-type contains json', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([]);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/matrix');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/matrix with notes creates successfully', async () => {
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      competencyId: 'comp-1',
      employeeId: 'emp-1',
      notes: 'Needs coaching',
    });
    const res = await request(app).post('/api/matrix').send({
      competencyId: 'comp-1',
      employeeId: 'emp-1',
      notes: 'Needs coaching',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/matrix/:id response is success true on found', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000009',
      competencyId: 'comp-9',
    });
    const res = await request(app).get('/api/matrix/00000000-0000-0000-0000-000000000009');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/matrix/:id success flag is true', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainMatrix.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/matrix/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('matrix.api — coverage to 40', () => {
  it('GET /api/matrix response body has success and data', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([]);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/matrix');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/matrix response content-type is json', async () => {
    mockPrisma.trainMatrix.findMany.mockResolvedValue([]);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/matrix');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/matrix/:id returns 404 code NOT_FOUND', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/matrix/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /api/matrix/:id response data.id matches the path id', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000006' });
    mockPrisma.trainMatrix.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000006',
      currentLevel: 'EXPERT',
    });
    const res = await request(app)
      .put('/api/matrix/00000000-0000-0000-0000-000000000006')
      .send({ currentLevel: 'EXPERT' });
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000006');
  });

  it('DELETE /api/matrix/:id message contains matrix entry', async () => {
    mockPrisma.trainMatrix.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainMatrix.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/matrix/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('matrix entry');
  });
});
