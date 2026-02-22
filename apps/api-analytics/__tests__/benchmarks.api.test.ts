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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
      {
        id: 'kpi-1',
        name: 'TRIR',
        module: 'HEALTH_SAFETY',
        currentValue: 2.5,
        targetValue: 1.0,
        trend: 'DOWN',
        unit: 'per 200k hours',
      },
    ];
    mockPrisma.analyticsKpi.findMany.mockResolvedValue(kpis);

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
    mockPrisma.analyticsKpi.findMany.mockRejectedValue(new Error('DB error'));

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
      {
        id: 'kpi-1',
        name: 'TRIR',
        module: 'HEALTH_SAFETY',
        currentValue: 2.5,
        targetValue: 1.0,
        trend: 'DOWN',
        unit: 'per 200k hours',
      },
    ];
    mockPrisma.analyticsKpi.findMany.mockResolvedValue(kpis);

    const res = await request(app).get('/api/benchmarks/HEALTH_SAFETY');

    expect(res.status).toBe(200);
    expect(res.body.data.module).toBe('HEALTH_SAFETY');
    expect(res.body.data.industry).toHaveLength(4);
    expect(res.body.data.organization).toHaveLength(1);
  });

  it('should return empty arrays for unknown module', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/benchmarks/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(200);
    expect(res.body.data.industry).toHaveLength(0);
    expect(res.body.data.organization).toHaveLength(0);
  });

  it('should handle case-insensitive module names', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);

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
      id: 'kpi-new',
      name: 'Custom Metric',
      module: 'QUALITY',
      description: 'Benchmark: Custom Metric',
      trend: 'UP',
    };
    mockPrisma.analyticsKpi.create.mockResolvedValue(created);

    const res = await request(app).post('/api/benchmarks').send({
      name: 'Custom Metric',
      module: 'QUALITY',
      metric: 'Custom Metric',
      industryAverage: 80,
      topPerformer: 99,
      currentValue: 90,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Custom Metric');
  });

  it('should set trend DOWN when current below industry average', async () => {
    const created = { id: 'kpi-new', name: 'Low Metric', trend: 'DOWN' };
    mockPrisma.analyticsKpi.create.mockResolvedValue(created);

    const res = await request(app).post('/api/benchmarks').send({
      name: 'Low Metric',
      module: 'HR',
      metric: 'Low Metric',
      industryAverage: 80,
      topPerformer: 99,
      currentValue: 50,
    });

    expect(res.status).toBe(201);
    // The create call should have trend: 'DOWN'
    expect(mockPrisma.analyticsKpi.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ trend: 'DOWN' }) })
    );
  });

  it('should set trend STABLE when no current value', async () => {
    const created = { id: 'kpi-new', name: 'No Value', trend: 'STABLE' };
    mockPrisma.analyticsKpi.create.mockResolvedValue(created);

    const res = await request(app).post('/api/benchmarks').send({
      name: 'No Value',
      module: 'FINANCE',
      metric: 'No Value',
      industryAverage: 10,
      topPerformer: 25,
    });

    expect(res.status).toBe(201);
    expect(mockPrisma.analyticsKpi.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ trend: 'STABLE' }) })
    );
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/benchmarks').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle server errors', async () => {
    mockPrisma.analyticsKpi.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/benchmarks').send({
      name: 'Test',
      module: 'HR',
      metric: 'Test',
      industryAverage: 10,
      topPerformer: 25,
    });

    expect(res.status).toBe(500);
  });
});

describe('Benchmarks — extended', () => {
  it('GET /api/benchmarks returns success true', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/benchmarks data.organization is defined', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks');
    expect(res.body.data.organization).toBeDefined();
  });

  it('GET /api/benchmarks findMany called once', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    await request(app).get('/api/benchmarks');
    expect(mockPrisma.analyticsKpi.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /api/benchmarks returns 500 on DB error with success false', async () => {
    mockPrisma.analyticsKpi.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/benchmarks');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/benchmarks/:module data.module is uppercase', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks/finance');
    expect(res.body.data.module).toBe('FINANCE');
  });
});

describe('benchmarks.api.test.ts — additional coverage', () => {
  it('GET /api/benchmarks returns empty organization array when no KPIs in DB', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks');
    expect(res.status).toBe(200);
    // All organization arrays should be empty or undefined when no KPIs
    const org = res.body.data.organization;
    const allEmpty = Object.values(org as Record<string, unknown[]>).every((arr) => arr.length === 0);
    expect(allEmpty).toBe(true);
  });

  it('GET /api/benchmarks/:module returns 200 with empty arrays for completely unknown module', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks/UNKNOWN_MODULE_XYZ');
    expect(res.status).toBe(200);
    expect(res.body.data.industry).toHaveLength(0);
    expect(res.body.data.organization).toHaveLength(0);
  });

  it('POST /api/benchmarks rejects missing module field with 400', async () => {
    const res = await request(app).post('/api/benchmarks').send({
      name: 'Missing Module',
      metric: 'something',
      industryAverage: 50,
      topPerformer: 90,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/benchmarks sets trend UP when currentValue exceeds industryAverage', async () => {
    mockPrisma.analyticsKpi.create.mockResolvedValue({ id: 'kpi-up', name: 'High Metric', trend: 'UP' });
    const res = await request(app).post('/api/benchmarks').send({
      name: 'High Metric',
      module: 'QUALITY',
      metric: 'High Metric',
      industryAverage: 60,
      topPerformer: 99,
      currentValue: 85,
    });
    expect(res.status).toBe(201);
    expect(mockPrisma.analyticsKpi.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ trend: 'UP' }) })
    );
  });

  it('GET /api/benchmarks/:module handles page=0 query param without crashing', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks/QUALITY?page=0');
    expect(res.status).toBe(200);
  });
});

describe('benchmarks.api — extended edge cases', () => {
  it('GET /api/benchmarks industry has HEALTH_SAFETY key', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks');
    expect(res.status).toBe(200);
    expect(res.body.data.industry).toHaveProperty('HEALTH_SAFETY');
  });

  it('GET /api/benchmarks industry has QUALITY key', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks');
    expect(res.status).toBe(200);
    expect(res.body.data.industry).toHaveProperty('QUALITY');
  });

  it('GET /api/benchmarks industry ENVIRONMENT returns 4 items', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks');
    expect(res.status).toBe(200);
    expect(res.body.data.industry.ENVIRONMENT).toHaveLength(4);
  });

  it('GET /api/benchmarks/:module returns organization array', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks/ENVIRONMENT');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.organization)).toBe(true);
  });

  it('POST /api/benchmarks rejects missing name field with 400', async () => {
    const res = await request(app).post('/api/benchmarks').send({
      module: 'QUALITY',
      metric: 'something',
      industryAverage: 50,
      topPerformer: 90,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/benchmarks rejects missing industryAverage with 400', async () => {
    const res = await request(app).post('/api/benchmarks').send({
      name: 'Test',
      module: 'HR',
      metric: 'Test',
      topPerformer: 90,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/benchmarks/:module HR returns 3 industry items', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks/HR');
    expect(res.status).toBe(200);
    expect(res.body.data.industry).toHaveLength(3);
  });

  it('GET /api/benchmarks/:module FINANCE returns 3 industry items', async () => {
    mockPrisma.analyticsKpi.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/benchmarks/FINANCE');
    expect(res.status).toBe(200);
    expect(res.body.data.industry).toHaveLength(3);
  });
});
