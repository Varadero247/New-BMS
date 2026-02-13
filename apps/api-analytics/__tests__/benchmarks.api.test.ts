import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    analyticsKpi: {
      findMany: jest.fn(),
      create: jest.fn(),
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

import benchmarksRouter from '../src/routes/benchmarks';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/benchmarks', benchmarksRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/benchmarks — All industry benchmarks
// ===================================================================
describe('GET /api/benchmarks', () => {
  it('should return industry and organization benchmarks', async () => {
    const kpis = [
      { id: 'kpi-1', name: 'TRIR', module: 'HEALTH_SAFETY', currentValue: 2.5, targetValue: 1.0, trend: 'DOWN', unit: 'per 200k hours' },
    ];
    (prisma as any).analyticsKpi.findMany.mockResolvedValue(kpis);

    const res = await request(app).get('/api/benchmarks');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.industry).toBeDefined();
    expect(res.body.data.industry.HEALTH_SAFETY).toHaveLength(4);
    expect(res.body.data.industry.ENVIRONMENT).toHaveLength(4);
    expect(res.body.data.industry.QUALITY).toHaveLength(4);
    expect(res.body.data.industry.HR).toHaveLength(3);
    expect(res.body.data.industry.FINANCE).toHaveLength(3);
    expect(res.body.data.organization).toBeDefined();
    expect(res.body.data.organization.HEALTH_SAFETY).toHaveLength(1);
  });

  it('should handle server errors', async () => {
    (prisma as any).analyticsKpi.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/benchmarks');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/benchmarks/:module — Module-specific benchmarks
// ===================================================================
describe('GET /api/benchmarks/:module', () => {
  it('should return benchmarks for a specific module', async () => {
    const kpis = [
      { id: 'kpi-1', name: 'TRIR', module: 'HEALTH_SAFETY', currentValue: 2.5, targetValue: 1.0, trend: 'DOWN', unit: 'per 200k hours' },
    ];
    (prisma as any).analyticsKpi.findMany.mockResolvedValue(kpis);

    const res = await request(app).get('/api/benchmarks/HEALTH_SAFETY');

    expect(res.status).toBe(200);
    expect(res.body.data.module).toBe('HEALTH_SAFETY');
    expect(res.body.data.industry).toHaveLength(4);
    expect(res.body.data.organization).toHaveLength(1);
  });

  it('should return empty arrays for unknown module', async () => {
    (prisma as any).analyticsKpi.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/benchmarks/UNKNOWN');

    expect(res.status).toBe(200);
    expect(res.body.data.industry).toHaveLength(0);
    expect(res.body.data.organization).toHaveLength(0);
  });

  it('should handle case-insensitive module names', async () => {
    (prisma as any).analyticsKpi.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/benchmarks/quality');

    expect(res.status).toBe(200);
    expect(res.body.data.module).toBe('QUALITY');
    expect(res.body.data.industry).toHaveLength(4);
  });
});

// ===================================================================
// POST /api/benchmarks — Create custom benchmark
// ===================================================================
describe('POST /api/benchmarks', () => {
  it('should create a custom benchmark stored as KPI', async () => {
    const created = {
      id: 'kpi-new', name: 'Custom Metric', module: 'QUALITY',
      description: 'Benchmark: Custom Metric', trend: 'UP',
    };
    (prisma as any).analyticsKpi.create.mockResolvedValue(created);

    const res = await request(app).post('/api/benchmarks').send({
      name: 'Custom Metric', module: 'QUALITY', metric: 'Custom Metric',
      industryAverage: 80, topPerformer: 99, currentValue: 90,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Custom Metric');
  });

  it('should set trend DOWN when current below industry average', async () => {
    const created = { id: 'kpi-new', name: 'Low Metric', trend: 'DOWN' };
    (prisma as any).analyticsKpi.create.mockResolvedValue(created);

    const res = await request(app).post('/api/benchmarks').send({
      name: 'Low Metric', module: 'HR', metric: 'Low Metric',
      industryAverage: 80, topPerformer: 99, currentValue: 50,
    });

    expect(res.status).toBe(201);
    // The create call should have trend: 'DOWN'
    expect((prisma as any).analyticsKpi.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ trend: 'DOWN' }) })
    );
  });

  it('should set trend STABLE when no current value', async () => {
    const created = { id: 'kpi-new', name: 'No Value', trend: 'STABLE' };
    (prisma as any).analyticsKpi.create.mockResolvedValue(created);

    const res = await request(app).post('/api/benchmarks').send({
      name: 'No Value', module: 'FINANCE', metric: 'No Value',
      industryAverage: 10, topPerformer: 25,
    });

    expect(res.status).toBe(201);
    expect((prisma as any).analyticsKpi.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ trend: 'STABLE' }) })
    );
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/benchmarks').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle server errors', async () => {
    (prisma as any).analyticsKpi.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/benchmarks').send({
      name: 'Test', module: 'HR', metric: 'Test',
      industryAverage: 10, topPerformer: 25,
    });

    expect(res.status).toBe(500);
  });
});
