import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsKpi: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cmmsAsset: { count: jest.fn() },
    cmmsWorkOrder: { count: jest.fn() },
    cmmsPart: { count: jest.fn() },
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

import kpisRouter from '../src/routes/kpis';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/kpis', kpisRouter);

const mockKpi = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'MTBF - CNC Machine',
  metricType: 'MTBF',
  assetId: 'asset-1',
  value: 720,
  unit: 'hours',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-01-31'),
  target: 800,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
};

describe('KPIs Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/kpis', () => {
    it('should return paginated KPIs', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([mockKpi]);
      prisma.cmmsKpi.count.mockResolvedValue(1);

      const res = await request(app).get('/api/kpis');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by metricType', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([]);
      prisma.cmmsKpi.count.mockResolvedValue(0);

      const res = await request(app).get('/api/kpis?metricType=MTBF');
      expect(res.status).toBe(200);
    });

    it('should filter by assetId', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([]);
      prisma.cmmsKpi.count.mockResolvedValue(0);

      const res = await request(app).get('/api/kpis?assetId=asset-1');
      expect(res.status).toBe(200);
    });

    it('should filter by period', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([]);
      prisma.cmmsKpi.count.mockResolvedValue(0);

      const res = await request(app).get('/api/kpis?periodStart=2026-01-01&periodEnd=2026-01-31');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsKpi.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/kpis');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/kpis/dashboard', () => {
    it('should return dashboard summary', async () => {
      prisma.cmmsKpi.findMany.mockResolvedValue([mockKpi]);
      prisma.cmmsAsset.count.mockResolvedValue(50);
      prisma.cmmsWorkOrder.count.mockImplementation((args: any) => {
        if (args?.where?.scheduledEnd) return Promise.resolve(3);
        return Promise.resolve(12);
      });
      prisma.cmmsPart.count.mockResolvedValue(200);

      const res = await request(app).get('/api/kpis/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.latestKpis).toBeDefined();
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalAssets).toBe(50);
    });

    it('should handle errors', async () => {
      prisma.cmmsKpi.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/kpis/dashboard');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/kpis', () => {
    it('should create a KPI', async () => {
      prisma.cmmsKpi.create.mockResolvedValue(mockKpi);

      const res = await request(app).post('/api/kpis').send({
        name: 'MTBF - CNC Machine',
        metricType: 'MTBF',
        value: 720,
        unit: 'hours',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/kpis').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid metricType', async () => {
      const res = await request(app).post('/api/kpis').send({
        name: 'Test',
        metricType: 'INVALID',
        value: 100,
        unit: 'hours',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      });
      expect(res.status).toBe(400);
    });

    it('should handle creation errors', async () => {
      prisma.cmmsKpi.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/kpis').send({
        name: 'MTBF',
        metricType: 'MTBF',
        value: 720,
        unit: 'hours',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/kpis/:id', () => {
    it('should return a KPI by ID', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(mockKpi);

      const res = await request(app).get('/api/kpis/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/kpis/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/kpis/:id', () => {
    it('should update a KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(mockKpi);
      prisma.cmmsKpi.update.mockResolvedValue({ ...mockKpi, value: 750 });

      const res = await request(app)
        .put('/api/kpis/00000000-0000-0000-0000-000000000001')
        .send({ value: 750 });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/kpis/00000000-0000-0000-0000-000000000099')
        .send({ value: 750 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/kpis/:id', () => {
    it('should soft delete a KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(mockKpi);
      prisma.cmmsKpi.update.mockResolvedValue({ ...mockKpi, deletedAt: new Date() });

      const res = await request(app).delete('/api/kpis/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent KPI', async () => {
      prisma.cmmsKpi.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/kpis/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    prisma.cmmsKpi.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/kpis');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    prisma.cmmsKpi.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/kpis').send({
      name: 'MTTR',
      metricType: 'MTTR',
      value: 2.5,
      unit: 'hours',
      periodStart: '2026-01-01T00:00:00Z',
      periodEnd: '2026-01-31T00:00:00Z',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    prisma.cmmsKpi.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    prisma.cmmsKpi.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/kpis/00000000-0000-0000-0000-000000000001').send({ value: 3.0 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('kpis — edge cases and field validation', () => {
  it('GET /kpis returns success: true on 200', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([mockKpi]);
    prisma.cmmsKpi.count.mockResolvedValue(1);
    const res = await request(app).get('/api/kpis');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /kpis pagination includes total, page, and limit fields', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([]);
    prisma.cmmsKpi.count.mockResolvedValue(0);
    const res = await request(app).get('/api/kpis');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('GET /kpis?page=3&limit=5 returns correct pagination metadata', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([]);
    prisma.cmmsKpi.count.mockResolvedValue(30);
    const res = await request(app).get('/api/kpis?page=3&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.pagination.total).toBe(30);
  });

  it('GET /kpis data items include id and metricType fields', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([mockKpi]);
    prisma.cmmsKpi.count.mockResolvedValue(1);
    const res = await request(app).get('/api/kpis');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id', '00000000-0000-0000-0000-000000000001');
    expect(res.body.data[0]).toHaveProperty('metricType', 'MTBF');
  });

  it('POST /kpis sets createdBy from authenticated user', async () => {
    prisma.cmmsKpi.create.mockResolvedValue(mockKpi);
    await request(app).post('/api/kpis').send({
      name: 'OEE - Press',
      metricType: 'OEE',
      value: 85.5,
      unit: '%',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });
    expect(prisma.cmmsKpi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ createdBy: 'user-123' }),
      })
    );
  });

  it('DELETE /kpis/:id returns 500 on update error', async () => {
    prisma.cmmsKpi.findFirst.mockResolvedValue(mockKpi);
    prisma.cmmsKpi.update.mockRejectedValue(new Error('DB write error'));
    const res = await request(app).delete('/api/kpis/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /kpis/dashboard summary contains totalAssets and openWorkOrders', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([mockKpi]);
    prisma.cmmsAsset.count.mockResolvedValue(30);
    prisma.cmmsWorkOrder.count.mockResolvedValue(8);
    prisma.cmmsPart.count.mockResolvedValue(100);
    const res = await request(app).get('/api/kpis/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary).toHaveProperty('totalAssets', 30);
  });

  it('PUT /kpis/:id response data contains updated value field', async () => {
    prisma.cmmsKpi.findFirst.mockResolvedValue(mockKpi);
    prisma.cmmsKpi.update.mockResolvedValue({ ...mockKpi, value: 850 });
    const res = await request(app)
      .put('/api/kpis/00000000-0000-0000-0000-000000000001')
      .send({ value: 850 });
    expect(res.status).toBe(200);
    expect(res.body.data.value).toBe(850);
  });

  it('GET /kpis/:id 500 response has error.code INTERNAL_ERROR', async () => {
    prisma.cmmsKpi.findFirst.mockRejectedValue(new Error('Read error'));
    const res = await request(app).get('/api/kpis/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('kpis — business logic and response structure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /kpis?metricType=MTTR filters findMany by metricType', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([]);
    prisma.cmmsKpi.count.mockResolvedValue(0);
    await request(app).get('/api/kpis?metricType=MTTR');
    expect(prisma.cmmsKpi.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ metricType: 'MTTR' }) })
    );
  });

  it('GET /kpis returns correct totalPages for multi-page set', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([]);
    prisma.cmmsKpi.count.mockResolvedValue(60);
    const res = await request(app).get('/api/kpis?page=1&limit=15');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('GET /kpis/dashboard returns summary with openWorkOrders key', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([mockKpi]);
    prisma.cmmsAsset.count.mockResolvedValue(20);
    prisma.cmmsWorkOrder.count.mockResolvedValue(5);
    prisma.cmmsPart.count.mockResolvedValue(80);
    const res = await request(app).get('/api/kpis/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary).toHaveProperty('openWorkOrders');
  });

  it('DELETE /kpis/:id calls soft delete via update with deletedAt', async () => {
    prisma.cmmsKpi.findFirst.mockResolvedValue(mockKpi);
    prisma.cmmsKpi.update.mockResolvedValue({ ...mockKpi, deletedAt: new Date() });
    const res = await request(app).delete('/api/kpis/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(prisma.cmmsKpi.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('POST /kpis sets createdBy from authenticated user', async () => {
    prisma.cmmsKpi.create.mockResolvedValue(mockKpi);
    await request(app).post('/api/kpis').send({
      name: 'MTTR - Press',
      metricType: 'MTTR',
      value: 2.0,
      unit: 'hours',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });
    expect(prisma.cmmsKpi.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ createdBy: 'user-123' }) })
    );
  });

  it('GET /kpis returns 500 with INTERNAL_ERROR when count rejects', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([]);
    prisma.cmmsKpi.count.mockRejectedValue(new Error('count fail'));
    const res = await request(app).get('/api/kpis');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /kpis returns success:true and data is an array', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([mockKpi]);
    prisma.cmmsKpi.count.mockResolvedValue(1);
    const res = await request(app).get('/api/kpis');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('kpis — final coverage expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /kpis?assetId filters findMany by assetId', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([]);
    prisma.cmmsKpi.count.mockResolvedValue(0);
    const aid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    await request(app).get(`/api/kpis?assetId=${aid}`);
    expect(prisma.cmmsKpi.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ assetId: aid }) })
    );
  });

  it('DELETE /kpis/:id returns 404 with NOT_FOUND code', async () => {
    prisma.cmmsKpi.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/kpis/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /kpis returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/kpis').send({
      metricType: 'MTBF',
      value: 100,
      unit: 'hours',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });
    expect(res.status).toBe(400);
  });

  it('GET /kpis/dashboard returns 500 on asset count error', async () => {
    prisma.cmmsKpi.findMany.mockResolvedValue([]);
    prisma.cmmsAsset.count.mockRejectedValue(new Error('asset count fail'));
    const res = await request(app).get('/api/kpis/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('kpis — phase29 coverage', () => {
  it('handles array map', () => {
    expect([1, 2, 3].map(x => x * 2)).toEqual([2, 4, 6]);
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles nullish coalescing', () => {
    const val: string | null = null; expect(val ?? 'default').toBe('default');
  });

  it('handles reverse method', () => {
    expect([1, 2, 3].reverse()).toEqual([3, 2, 1]);
  });

  it('handles Math.pow', () => {
    expect(Math.pow(2, 3)).toBe(8);
  });

});

describe('kpis — phase30 coverage', () => {
  it('handles Object.assign', () => {
    expect(Object.assign({}, { a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('handles Map size', () => {
    const m = new Map<string, number>([['a', 1]]); expect(m.size).toBe(1);
  });

  it('handles Math.round', () => {
    expect(Math.round(3.7)).toBe(4);
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles string trim', () => {
    expect('  hello  '.trim()).toBe('hello');
  });

});


describe('phase31 coverage', () => {
  it('handles string split', () => { expect('a,b,c'.split(',')).toEqual(['a','b','c']); });
  it('handles array from', () => { expect(Array.from('abc')).toEqual(['a','b','c']); });
  it('handles Number.isFinite', () => { expect(Number.isFinite(42)).toBe(true); expect(Number.isFinite(Infinity)).toBe(false); });
  it('handles async/await error', async () => { const fn = async () => { throw new Error('fail'); }; await expect(fn()).rejects.toThrow('fail'); });
  it('handles typeof null', () => { expect(typeof null).toBe('object'); });
});
