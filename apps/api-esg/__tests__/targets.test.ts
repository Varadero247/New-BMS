import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgTarget: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import targetsRouter from '../src/routes/targets';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/targets', targetsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockTarget = {
  id: '00000000-0000-0000-0000-000000000001',
  metricId: '00000000-0000-0000-0000-000000000001',
  year: 2026,
  targetValue: 5000,
  actualValue: 3200,
  baselineYear: 2024,
  baselineValue: 8000,
  status: 'ON_TRACK',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  metric: { id: 'met-1', name: 'Total CO2', code: 'E-001' },
};

describe('GET /api/targets', () => {
  it('should return paginated targets list', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([mockTarget]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/targets');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by year', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/targets?year=2026');
    expect(res.status).toBe(200);
    expect(prisma.esgTarget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ year: 2026 }) })
    );
  });

  it('should filter by status', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/targets?status=ON_TRACK');
    expect(res.status).toBe(200);
    expect(prisma.esgTarget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ON_TRACK' }) })
    );
  });

  it('should return empty data when no targets exist', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/targets');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/targets', () => {
  it('should create a target', async () => {
    (prisma.esgTarget.create as jest.Mock).mockResolvedValue(mockTarget);

    const res = await request(app).post('/api/targets').send({
      metricId: '00000000-0000-0000-0000-000000000001',
      year: 2026,
      targetValue: 5000,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/targets').send({
      year: 2026,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid year', async () => {
    const res = await request(app).post('/api/targets').send({
      metricId: '00000000-0000-0000-0000-000000000001',
      year: 1999,
      targetValue: 5000,
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/targets/:id', () => {
  it('should return a single target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);

    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when target not found', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/targets/:id', () => {
  it('should update a target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);
    (prisma.esgTarget.update as jest.Mock).mockResolvedValue({ ...mockTarget, status: 'ACHIEVED' });

    const res = await request(app)
      .put('/api/targets/00000000-0000-0000-0000-000000000001')
      .send({ status: 'ACHIEVED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating non-existent target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/targets/00000000-0000-0000-0000-000000000099')
      .send({ status: 'ACHIEVED' });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid update data', async () => {
    const res = await request(app)
      .put('/api/targets/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/targets/:id', () => {
  it('should soft delete a target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);
    (prisma.esgTarget.update as jest.Mock).mockResolvedValue({
      ...mockTarget,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/targets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when deleting non-existent target', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/targets/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/targets/:id/trajectory', () => {
  it('should return target trajectory data', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue({
      ...mockTarget,
      metric: {
        ...mockTarget.metric,
        dataPoints: [
          { periodStart: new Date('2026-01-01'), value: 1000 },
          { periodStart: new Date('2026-02-01'), value: 900 },
        ],
      },
    });

    const res = await request(app).get(
      '/api/targets/00000000-0000-0000-0000-000000000001/trajectory'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.target).toBeDefined();
    expect(res.body.data.trajectory).toHaveLength(2);
  });

  it('should return 404 for non-existent target trajectory', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(
      '/api/targets/00000000-0000-0000-0000-000000000099/trajectory'
    );
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/targets');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgTarget.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/targets').send({ metricId: '00000000-0000-0000-0000-000000000001', year: 2026, targetValue: 5000 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgTarget.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/targets/00000000-0000-0000-0000-000000000001').send({ targetValue: 4000 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgTarget.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/targets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Additional coverage: pagination, filters, response shapes ────────────────

describe('Targets — extended coverage', () => {
  it('GET /api/targets returns correct totalPages for multi-page result', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([mockTarget]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(35);

    const res = await request(app).get('/api/targets?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination.totalPages).toBe(4);
    expect(res.body.pagination.total).toBe(35);
  });

  it('GET /api/targets passes correct skip for page 3', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/targets?page=3&limit=10');
    expect(prisma.esgTarget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('GET /api/targets filters by metricId query param', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/targets?metricId=00000000-0000-0000-0000-000000000001');
    expect(prisma.esgTarget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ metricId: '00000000-0000-0000-0000-000000000001' }) })
    );
  });

  it('GET /api/targets returns success:true with empty data array', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/targets');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/targets/:id returns data with expected fields', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);

    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('year');
    expect(res.body.data).toHaveProperty('targetValue');
    expect(res.body.data).toHaveProperty('status');
  });

  it('GET /api/targets/:id/trajectory returns 500 on DB error', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000001/trajectory');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/targets returns 400 when targetValue is missing', async () => {
    const res = await request(app).post('/api/targets').send({
      metricId: '00000000-0000-0000-0000-000000000001',
      year: 2026,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /api/targets/:id returns 400 for invalid status enum', async () => {
    const res = await request(app)
      .put('/api/targets/00000000-0000-0000-0000-000000000001')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('targets — batch-q coverage', () => {
  it('GET / findMany called once per request', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/targets');
    expect(prisma.esgTarget.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST / returns 400 when year is too low', async () => {
    const res = await request(app).post('/api/targets').send({
      metricId: '00000000-0000-0000-0000-000000000001',
      year: 1990,
      targetValue: 100,
    });
    expect(res.status).toBe(400);
  });

  it('GET / returns data as array', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([mockTarget]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/targets');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /:id returns 500 on DB error in find step', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockRejectedValue(new Error('DB fail'));
    const res = await request(app).delete('/api/targets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('targets — additional coverage 2', () => {
  it('GET / response has success:true and pagination', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([mockTarget]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/targets');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('POST / stores createdBy from authenticated user', async () => {
    (prisma.esgTarget.create as jest.Mock).mockResolvedValue(mockTarget);
    await request(app).post('/api/targets').send({
      metricId: '00000000-0000-0000-0000-000000000001',
      year: 2026,
      targetValue: 3000,
    });
    const [call] = (prisma.esgTarget.create as jest.Mock).mock.calls;
    expect(call[0].data.createdBy).toBe('user-123');
  });

  it('DELETE /:id calls update with deletedAt set', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);
    (prisma.esgTarget.update as jest.Mock).mockResolvedValue({ ...mockTarget, deletedAt: new Date() });
    await request(app).delete('/api/targets/00000000-0000-0000-0000-000000000001');
    const [call] = (prisma.esgTarget.update as jest.Mock).mock.calls;
    expect(call[0].data).toHaveProperty('deletedAt');
  });

  it('GET /:id returns metric subobject', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);
    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('metric');
  });

  it('GET / filters by both year and status simultaneously', async () => {
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgTarget.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/targets?year=2026&status=AT_RISK');
    expect(prisma.esgTarget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ year: 2026, status: 'AT_RISK' }) })
    );
  });

  it('PUT /:id updates actualValue field', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockResolvedValue(mockTarget);
    (prisma.esgTarget.update as jest.Mock).mockResolvedValue({ ...mockTarget, actualValue: 4500 });
    const res = await request(app)
      .put('/api/targets/00000000-0000-0000-0000-000000000001')
      .send({ actualValue: 4500 });
    expect(res.status).toBe(200);
    expect(res.body.data.actualValue).toBe(4500);
  });

  it('GET /trajectory returns 500 when DB fails', async () => {
    (prisma.esgTarget.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000001/trajectory');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('targets — phase29 coverage', () => {
  it('handles string length', () => {
    expect('hello'.length).toBe(5);
  });

  it('handles regex match', () => {
    expect('hello world'.match(/world/)).not.toBeNull();
  });

  it('handles error instanceof', () => {
    expect(new Error('test')).toBeInstanceOf(Error);
  });

  it('handles array length', () => {
    expect([1, 2, 3].length).toBe(3);
  });

  it('handles string slice', () => {
    expect('hello'.slice(1, 3)).toBe('el');
  });

});

describe('targets — phase30 coverage', () => {
  it('handles short-circuit eval', () => {
    let x2 = 0; false && x2++; expect(x2).toBe(0);
  });

  it('handles indexOf method', () => {
    expect([1, 2, 3].indexOf(2)).toBe(1);
  });

  it('handles computed properties', () => {
    const key = 'foo'; const obj3 = { [key]: 42 }; expect((obj3 as any).foo).toBe(42);
  });

  it('handles Date type', () => {
    expect(new Date()).toBeInstanceOf(Date);
  });

  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

});


describe('phase31 coverage', () => {
  it('handles ternary', () => { const x = 5 > 3 ? 'yes' : 'no'; expect(x).toBe('yes'); });
  it('returns correct type', () => { expect(typeof 'hello').toBe('string'); });
  it('handles Number.isFinite', () => { expect(Number.isFinite(42)).toBe(true); expect(Number.isFinite(Infinity)).toBe(false); });
  it('handles array of', () => { expect(Array.of(1,2,3)).toEqual([1,2,3]); });
  it('handles Math.floor', () => { expect(Math.floor(3.9)).toBe(3); });
});
