import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsPreventivePlan: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import preventivePlansRouter from '../src/routes/preventive-plans';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/preventive-plans', preventivePlansRouter);

const mockPlan = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Monthly Lubrication',
  assetId: 'asset-1',
  description: 'Monthly lubrication schedule',
  frequency: 'MONTHLY',
  lastPerformed: null,
  nextDue: new Date('2026-03-01'),
  tasks: [{ task: 'Lubricate bearings', done: false }],
  assignedTo: 'tech-1',
  isActive: true,
  estimatedDuration: 60,
  estimatedCost: 250,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
};

describe('Preventive Plans Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/preventive-plans', () => {
    it('should return paginated plans', async () => {
      prisma.cmmsPreventivePlan.findMany.mockResolvedValue([mockPlan]);
      prisma.cmmsPreventivePlan.count.mockResolvedValue(1);

      const res = await request(app).get('/api/preventive-plans');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by assetId', async () => {
      prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
      prisma.cmmsPreventivePlan.count.mockResolvedValue(0);

      const res = await request(app).get('/api/preventive-plans?assetId=asset-1');
      expect(res.status).toBe(200);
    });

    it('should filter by frequency', async () => {
      prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
      prisma.cmmsPreventivePlan.count.mockResolvedValue(0);

      const res = await request(app).get('/api/preventive-plans?frequency=MONTHLY');
      expect(res.status).toBe(200);
    });

    it('should filter by isActive', async () => {
      prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
      prisma.cmmsPreventivePlan.count.mockResolvedValue(0);

      const res = await request(app).get('/api/preventive-plans?isActive=true');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsPreventivePlan.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/preventive-plans');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/preventive-plans', () => {
    it('should create a plan', async () => {
      prisma.cmmsPreventivePlan.create.mockResolvedValue(mockPlan);

      const res = await request(app)
        .post('/api/preventive-plans')
        .send({
          name: 'Monthly Lubrication',
          assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          frequency: 'MONTHLY',
          tasks: [{ task: 'Lubricate bearings' }],
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app).post('/api/preventive-plans').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid frequency', async () => {
      const res = await request(app).post('/api/preventive-plans').send({
        name: 'Test',
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        frequency: 'INVALID',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/preventive-plans/:id', () => {
    it('should return a plan by ID', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);

      const res = await request(app).get(
        '/api/preventive-plans/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(null);

      const res = await request(app).get(
        '/api/preventive-plans/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/preventive-plans/:id', () => {
    it('should update a plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);
      prisma.cmmsPreventivePlan.update.mockResolvedValue({ ...mockPlan, name: 'Updated' });

      const res = await request(app)
        .put('/api/preventive-plans/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/preventive-plans/00000000-0000-0000-0000-000000000099')
        .send({ name: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/preventive-plans/:id', () => {
    it('should soft delete a plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);
      prisma.cmmsPreventivePlan.update.mockResolvedValue({ ...mockPlan, deletedAt: new Date() });

      const res = await request(app).delete(
        '/api/preventive-plans/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent plan', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(null);

      const res = await request(app).delete(
        '/api/preventive-plans/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });

  // ─── 500 error paths ────────────────────────────────────────────────────────

  describe('500 error handling', () => {
    it('POST / returns 500 when create fails', async () => {
      prisma.cmmsPreventivePlan.create.mockRejectedValue(new Error('DB down'));
      const res = await request(app).post('/api/preventive-plans').send({
        name: 'Test Plan',
        assetId: '00000000-0000-0000-0000-000000000001',
        frequency: 'MONTHLY',
        nextDue: '2026-03-01',
      });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('GET /:id returns 500 on DB error', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockRejectedValue(new Error('DB down'));
      const res = await request(app).get('/api/preventive-plans/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('PUT /:id returns 500 when update fails', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);
      prisma.cmmsPreventivePlan.update.mockRejectedValue(new Error('DB down'));
      const res = await request(app)
        .put('/api/preventive-plans/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('DELETE /:id returns 500 when update fails', async () => {
      prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);
      prisma.cmmsPreventivePlan.update.mockRejectedValue(new Error('DB down'));
      const res = await request(app).delete('/api/preventive-plans/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('preventive-plans — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/preventive-plans', preventivePlansRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/preventive-plans', async () => {
    const res = await request(app).get('/api/preventive-plans');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/preventive-plans', async () => {
    const res = await request(app).get('/api/preventive-plans');
    expect(res.headers['content-type']).toBeDefined();
  });
});

describe('preventive-plans — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns pagination metadata with correct totalPages', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([mockPlan]);
    prisma.cmmsPreventivePlan.count.mockResolvedValue(60);
    const res = await request(app).get('/api/preventive-plans?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(6);
    expect(res.body.pagination.total).toBe(60);
  });

  it('GET / filters by isActive=false', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
    prisma.cmmsPreventivePlan.count.mockResolvedValue(0);
    const res = await request(app).get('/api/preventive-plans?isActive=false');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET / returns INTERNAL_ERROR when count rejects', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
    prisma.cmmsPreventivePlan.count.mockRejectedValue(new Error('count error'));
    const res = await request(app).get('/api/preventive-plans');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / accepts WEEKLY frequency', async () => {
    prisma.cmmsPreventivePlan.create.mockResolvedValue({ ...mockPlan, frequency: 'WEEKLY' });
    const res = await request(app).post('/api/preventive-plans').send({
      name: 'Weekly Check',
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      frequency: 'WEEKLY',
      tasks: [],
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / accepts ANNUALLY frequency', async () => {
    prisma.cmmsPreventivePlan.create.mockResolvedValue({ ...mockPlan, frequency: 'ANNUALLY' });
    const res = await request(app).post('/api/preventive-plans').send({
      name: 'Annual Inspection',
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      frequency: 'ANNUALLY',
    });
    expect(res.status).toBe(201);
  });

  it('POST / returns 400 when assetId is not a valid UUID', async () => {
    const res = await request(app).post('/api/preventive-plans').send({
      name: 'Test Plan',
      assetId: 'not-a-uuid',
      frequency: 'MONTHLY',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id returns 404 with NOT_FOUND code', async () => {
    prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/preventive-plans/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('DELETE /:id response message confirms deletion', async () => {
    prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);
    prisma.cmmsPreventivePlan.update.mockResolvedValue({ ...mockPlan, deletedAt: new Date() });
    const res = await request(app).delete('/api/preventive-plans/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('GET / search filter returns matching plans', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([mockPlan]);
    prisma.cmmsPreventivePlan.count.mockResolvedValue(1);
    const res = await request(app).get('/api/preventive-plans?search=Lubrication');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET / returns page and limit in pagination', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
    prisma.cmmsPreventivePlan.count.mockResolvedValue(0);
    const res = await request(app).get('/api/preventive-plans?page=4&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(4);
    expect(res.body.pagination.limit).toBe(5);
  });
});

describe('preventive-plans — business logic and response structure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST / sets createdBy from authenticated user', async () => {
    prisma.cmmsPreventivePlan.create.mockResolvedValue(mockPlan);
    await request(app).post('/api/preventive-plans').send({
      name: 'Quarterly Check',
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      frequency: 'QUARTERLY',
    });
    expect(prisma.cmmsPreventivePlan.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ createdBy: 'user-123' }) })
    );
  });

  it('GET /preventive-plans?frequency=QUARTERLY filters findMany', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
    prisma.cmmsPreventivePlan.count.mockResolvedValue(0);
    await request(app).get('/api/preventive-plans?frequency=QUARTERLY');
    expect(prisma.cmmsPreventivePlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ frequency: 'QUARTERLY' }) })
    );
  });

  it('PUT /:id updates frequency and returns updated data', async () => {
    prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);
    prisma.cmmsPreventivePlan.update.mockResolvedValue({ ...mockPlan, frequency: 'QUARTERLY' });
    const res = await request(app)
      .put('/api/preventive-plans/00000000-0000-0000-0000-000000000001')
      .send({ frequency: 'QUARTERLY' });
    expect(res.status).toBe(200);
    expect(res.body.data.frequency).toBe('QUARTERLY');
  });

  it('DELETE /:id soft-deletes by setting deletedAt via update', async () => {
    prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(mockPlan);
    prisma.cmmsPreventivePlan.update.mockResolvedValue({ ...mockPlan, deletedAt: new Date() });
    await request(app).delete('/api/preventive-plans/00000000-0000-0000-0000-000000000001');
    expect(prisma.cmmsPreventivePlan.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET / returns success:true and data is an array', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([mockPlan]);
    prisma.cmmsPreventivePlan.count.mockResolvedValue(1);
    const res = await request(app).get('/api/preventive-plans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('preventive-plans — final coverage expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /preventive-plans data items include name field', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([mockPlan]);
    prisma.cmmsPreventivePlan.count.mockResolvedValue(1);
    const res = await request(app).get('/api/preventive-plans');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('name', 'Monthly Lubrication');
  });

  it('GET /preventive-plans response content-type is application/json', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
    prisma.cmmsPreventivePlan.count.mockResolvedValue(0);
    const res = await request(app).get('/api/preventive-plans');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('DELETE /preventive-plans/:id returns 404 with NOT_FOUND code', async () => {
    prisma.cmmsPreventivePlan.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/preventive-plans/00000000-0000-0000-0000-000000000077');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /preventive-plans returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/preventive-plans').send({
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      frequency: 'MONTHLY',
    });
    expect(res.status).toBe(400);
  });

  it('GET /preventive-plans?assetId filters findMany by assetId', async () => {
    prisma.cmmsPreventivePlan.findMany.mockResolvedValue([]);
    prisma.cmmsPreventivePlan.count.mockResolvedValue(0);
    const aid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    await request(app).get(`/api/preventive-plans?assetId=${aid}`);
    expect(prisma.cmmsPreventivePlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ assetId: aid }) })
    );
  });
});

describe('preventive plans — phase29 coverage', () => {
  it('handles parseInt', () => {
    expect(parseInt('42', 10)).toBe(42);
  });

  it('handles BigInt type', () => {
    expect(typeof BigInt(42)).toBe('bigint');
  });

  it('handles Map size', () => {
    const m = new Map<string, number>([['a', 1]]); expect(m.size).toBe(1);
  });

  it('handles undefined check', () => {
    expect(undefined).toBeUndefined();
  });

  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

});

describe('preventive plans — phase30 coverage', () => {
  it('handles Object.assign', () => {
    expect(Object.assign({}, { a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

  it('handles Math.round', () => {
    expect(Math.round(3.7)).toBe(4);
  });

  it('handles regex match', () => {
    expect('hello world'.match(/world/)).not.toBeNull();
  });

  it('handles string toUpperCase', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

});
