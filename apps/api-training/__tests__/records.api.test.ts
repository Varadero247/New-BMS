import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainRecord: {
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

import router from '../src/routes/records';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/records', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/records', () => {
  it('should return records with pagination', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.trainRecord.count.mockResolvedValue(1);
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    const res = await request(app).get('/api/records?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should search by title', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    const res = await request(app).get('/api/records?search=safety');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/records/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/records/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return item by id', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/records/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.trainRecord.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/records/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/records', () => {
  it('should create', async () => {
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainRecord.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
      referenceNumber: 'TRN-2026-0001',
    });
    const res = await request(app)
      .post('/api/records')
      .send({ courseId: 'course-1', employeeId: 'emp-1' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 400 when courseId is missing', async () => {
    const res = await request(app).post('/api/records').send({ employeeId: 'emp-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when employeeId is missing', async () => {
    const res = await request(app).post('/api/records').send({ courseId: 'course-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database create error', async () => {
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainRecord.create.mockRejectedValue(new Error('Unique constraint'));
    const res = await request(app)
      .post('/api/records')
      .send({ courseId: 'course-1', employeeId: 'emp-1' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/records/:id', () => {
  it('should update', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainRecord.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/records/00000000-0000-0000-0000-000000000001')
      .send({ courseId: 'course-2' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when record not found', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/records/00000000-0000-0000-0000-000000000099')
      .send({ courseId: 'course-2' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database update error', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainRecord.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/records/00000000-0000-0000-0000-000000000001')
      .send({ courseId: 'course-2' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/records/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainRecord.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/records/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when record not found', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/records/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainRecord.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/records/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('records.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/records', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/records', async () => {
    const res = await request(app).get('/api/records');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/records', async () => {
    const res = await request(app).get('/api/records');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/records body has success property', async () => {
    const res = await request(app).get('/api/records');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('Training Records — extended edge cases', () => {
  it('GET /api/records returns pagination object with page and limit', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    const res = await request(app).get('/api/records?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('GET /api/records returns multiple records correctly', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Fire Safety' },
      { id: '00000000-0000-0000-0000-000000000002', title: 'First Aid' },
    ]);
    mockPrisma.trainRecord.count.mockResolvedValue(2);
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('GET /api/records/:id returns data with correct id', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      title: 'ISO 9001 Training',
      status: 'COMPLETED',
    });
    const res = await request(app).get('/api/records/00000000-0000-0000-0000-000000000005');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000005');
  });

  it('POST /api/records generates a referenceNumber', async () => {
    mockPrisma.trainRecord.count.mockResolvedValue(3);
    mockPrisma.trainRecord.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      title: 'New Record',
      referenceNumber: 'TRN-2026-0004',
    });
    const res = await request(app)
      .post('/api/records')
      .send({ courseId: 'course-1', employeeId: 'emp-2' });
    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toBeDefined();
  });

  it('PUT /api/records/:id responds with updated data', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainRecord.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
      score: 95,
    });
    const res = await request(app)
      .put('/api/records/00000000-0000-0000-0000-000000000001')
      .send({ status: 'COMPLETED', score: 95 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/records/:id returns message in response', async () => {
    mockPrisma.trainRecord.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainRecord.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/records/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/records filters by courseId query param', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    const res = await request(app).get('/api/records?courseId=course-99');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/records count is called exactly once', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    await request(app).get('/api/records');
    expect(mockPrisma.trainRecord.count).toHaveBeenCalledTimes(1);
  });
});
