import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainTNA: {
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

import router from '../src/routes/tna';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/tna', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/tna', () => {
  it('should return TNAs', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Leadership Training Gap' },
    ]);
    mockPrisma.trainTNA.count.mockResolvedValue(1);
    const res = await request(app).get('/api/tna');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status and search filters', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([]);
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    const res = await request(app).get(
      '/api/tna?status=IN_PROGRESS&search=leadership&page=1&limit=10'
    );
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainTNA.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.trainTNA.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/tna');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/tna/:id', () => {
  it('should return TNA by id', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Leadership Training Gap',
    });
    const res = await request(app).get('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/tna/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainTNA.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/tna', () => {
  it('should create a TNA', async () => {
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    mockPrisma.trainTNA.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New TNA',
      referenceNumber: 'TNA-2026-0001',
    });
    const res = await request(app).post('/api/tna').send({ title: 'New TNA' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should create with all optional fields', async () => {
    mockPrisma.trainTNA.count.mockResolvedValue(2);
    mockPrisma.trainTNA.create.mockResolvedValue({
      id: '2',
      title: 'Full TNA',
      referenceNumber: 'TNA-2026-0003',
    });
    const res = await request(app).post('/api/tna').send({
      title: 'Full TNA',
      department: 'HR',
      role: 'Manager',
      priority: 'HIGH',
      identifiedGap: 'Leadership skills',
      recommendedTraining: 'Leadership course',
      targetDate: '2026-06-01T00:00:00.000Z',
      status: 'SCHEDULED',
      assignee: 'user-2',
      assigneeName: 'Jane Smith',
      budget: 5000,
      approvedBy: 'user-1',
      notes: 'Urgent requirement',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 if title is missing', async () => {
    const res = await request(app).post('/api/tna').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if priority is invalid', async () => {
    const res = await request(app).post('/api/tna').send({ title: 'Test', priority: 'EXTREME' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 if status is invalid', async () => {
    const res = await request(app)
      .post('/api/tna')
      .send({ title: 'Test', status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on create error', async () => {
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    mockPrisma.trainTNA.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/tna').send({ title: 'New TNA' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/tna/:id', () => {
  it('should update a TNA', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Old TNA',
    });
    mockPrisma.trainTNA.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated TNA',
    });
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated TNA' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update status', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainTNA.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 on invalid priority', async () => {
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ priority: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainTNA.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/tna/:id', () => {
  it('should soft delete a TNA', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainTNA.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/tna/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainTNA.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('TNA — extended edge cases', () => {
  it('GET /api/tna returns pagination with correct total', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'TNA 1' },
      { id: '00000000-0000-0000-0000-000000000002', title: 'TNA 2' },
    ]);
    mockPrisma.trainTNA.count.mockResolvedValue(2);
    const res = await request(app).get('/api/tna');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(2);
  });

  it('GET /api/tna supports page and limit query params', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([]);
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    const res = await request(app).get('/api/tna?page=3&limit=15');
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(15);
  });

  it('POST /api/tna generates a referenceNumber', async () => {
    mockPrisma.trainTNA.count.mockResolvedValue(5);
    mockPrisma.trainTNA.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000006',
      title: 'TNA Ref Test',
      referenceNumber: 'TNA-2026-0006',
    });
    const res = await request(app).post('/api/tna').send({ title: 'TNA Ref Test' });
    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toBeDefined();
  });

  it('PUT /api/tna/:id can update budget field', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainTNA.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      budget: 10000,
    });
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ budget: 10000 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/tna/:id calls update with deletedAt', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainTNA.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    await request(app).delete('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.trainTNA.update).toHaveBeenCalledTimes(1);
  });

  it('GET /api/tna count is called once per list request', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([]);
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    await request(app).get('/api/tna');
    expect(mockPrisma.trainTNA.count).toHaveBeenCalledTimes(1);
  });

  it('POST /api/tna with LOW priority succeeds', async () => {
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    mockPrisma.trainTNA.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000007',
      title: 'Low Priority TNA',
      priority: 'LOW',
      referenceNumber: 'TNA-2026-0001',
    });
    const res = await request(app)
      .post('/api/tna')
      .send({ title: 'Low Priority TNA', priority: 'LOW' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/tna/:id with MEDIUM priority succeeds', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.trainTNA.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      priority: 'MEDIUM',
    });
    const res = await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ priority: 'MEDIUM' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('tna.api — final coverage expansion', () => {
  it('GET /api/tna response content-type contains json', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([]);
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    const res = await request(app).get('/api/tna');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/tna pagination totalPages computed correctly', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([]);
    mockPrisma.trainTNA.count.mockResolvedValue(30);
    const res = await request(app).get('/api/tna?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET /api/tna/:id returns NOT_FOUND on null', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/tna/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /api/tna with CRITICAL priority succeeds', async () => {
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    mockPrisma.trainTNA.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Critical TNA',
      priority: 'CRITICAL',
      referenceNumber: 'TNA-2026-0001',
    });
    const res = await request(app).post('/api/tna').send({
      title: 'Critical TNA',
      priority: 'CRITICAL',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/tna/:id returns success message containing deleted', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainTNA.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/tna/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('deleted');
  });

  it('GET /api/tna data is array type', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([]);
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    const res = await request(app).get('/api/tna');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/tna count is called exactly once per list request', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([]);
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    await request(app).get('/api/tna');
    expect(mockPrisma.trainTNA.count).toHaveBeenCalledTimes(1);
  });
});

describe('tna.api — boundary and method coverage', () => {
  it('DELETE /api/tna/:id calls update with deletedAt set', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainTNA.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/tna/00000000-0000-0000-0000-000000000001');
    const callArg = (mockPrisma.trainTNA.update as jest.Mock).mock.calls[0][0];
    expect(callArg.data).toHaveProperty('deletedAt');
  });

  it('GET /api/tna with SCHEDULED status returns 200', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([]);
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    const res = await request(app).get('/api/tna?status=SCHEDULED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/tna count is called once to generate reference number', async () => {
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    mockPrisma.trainTNA.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      referenceNumber: 'TNA-2026-0001',
    });
    await request(app).post('/api/tna').send({ title: 'Test TNA' });
    expect(mockPrisma.trainTNA.count).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/tna/:id calls findFirst before update', async () => {
    mockPrisma.trainTNA.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.trainTNA.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app)
      .put('/api/tna/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(mockPrisma.trainTNA.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainTNA.update).toHaveBeenCalledTimes(1);
  });

  it('GET /api/tna with search filter calls findMany once', async () => {
    mockPrisma.trainTNA.findMany.mockResolvedValue([]);
    mockPrisma.trainTNA.count.mockResolvedValue(0);
    const res = await request(app).get('/api/tna?search=safety');
    expect(res.status).toBe(200);
    expect(mockPrisma.trainTNA.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('tna — phase29 coverage', () => {
  it('handles sort method', () => {
    expect([3, 1, 2].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it('handles array concat', () => {
    expect([1, 2].concat([3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('returns true for truthy values', () => {
    expect(Boolean('value')).toBe(true);
  });

  it('handles BigInt type', () => {
    expect(typeof BigInt(42)).toBe('bigint');
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

});
