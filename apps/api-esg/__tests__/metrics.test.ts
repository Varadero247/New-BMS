import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgMetric: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    esgDataPoint: {
      findMany: jest.fn(),
      create: jest.fn(),
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

import metricsRouter from '../src/routes/metrics';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/metrics', metricsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockMetric = {
  id: '00000000-0000-0000-0000-000000000001',
  frameworkId: 'fw-1',
  category: 'ENVIRONMENTAL',
  subcategory: 'Emissions',
  name: 'Total GHG',
  code: 'E-001',
  unit: 'tCO2e',
  frequency: 'ANNUALLY',
  deletedAt: null,
};

const mockDataPoint = {
  id: 'dp-1',
  metricId: 'met-1',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-03-31'),
  value: 1500,
  unit: 'tCO2e',
  source: 'Measured',
  verifiedBy: null,
  verifiedAt: null,
  notes: null,
  status: 'DRAFT',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/metrics/:id/data-points', () => {
  it('should return paginated data points for a metric', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([mockDataPoint]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get(
      '/api/metrics/00000000-0000-0000-0000-000000000001/data-points'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should return 404 if metric not found', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(
      '/api/metrics/00000000-0000-0000-0000-000000000099/data-points'
    );
    expect(res.status).toBe(404);
  });

  it('should handle pagination', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(50);

    const res = await request(app).get(
      '/api/metrics/00000000-0000-0000-0000-000000000001/data-points?page=2&limit=10'
    );
    expect(prisma.esgDataPoint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('should return empty list when no data points exist', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get(
      '/api/metrics/00000000-0000-0000-0000-000000000001/data-points'
    );
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/metrics/:id/data-points', () => {
  it('should create a data point', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.create as jest.Mock).mockResolvedValue(mockDataPoint);

    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points')
      .send({
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        value: 1500,
        unit: 'tCO2e',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if metric not found', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000099/data-points')
      .send({
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        value: 1500,
        unit: 'tCO2e',
      });

    expect(res.status).toBe(404);
  });

  it('should return 400 for missing required fields', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);

    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points')
      .send({
        periodStart: '2026-01-01',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should accept optional fields', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.create as jest.Mock).mockResolvedValue(mockDataPoint);

    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points')
      .send({
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        value: 1500,
        unit: 'tCO2e',
        source: 'Measured',
        notes: 'Q1 data',
        status: 'VERIFIED',
      });

    expect(res.status).toBe(201);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET /:id/data-points returns 500 on DB error', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgDataPoint.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/data-points returns 500 when create fails', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgDataPoint.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points')
      .send({ periodStart: '2026-01-01', periodEnd: '2026-03-31', value: 1500, unit: 'tCO2e' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Metrics — extended', () => {
  it('GET /:id/data-points pagination has totalPages field', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([mockDataPoint]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('GET /:id/data-points count is called once', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(prisma.esgDataPoint.count).toHaveBeenCalledTimes(1);
  });

  it('POST /:id/data-points success is true on create', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.create as jest.Mock).mockResolvedValue(mockDataPoint);
    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points')
      .send({ periodStart: '2026-01-01', periodEnd: '2026-03-31', value: 100, unit: 'tCO2e' });
    expect(res.body.success).toBe(true);
  });

  it('GET /:id/data-points data is an array', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([mockDataPoint, mockDataPoint]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(2);
    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /:id/data-points 404 error code is NOT_FOUND', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000099/data-points');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});


describe('Metrics — additional coverage', () => {
  it('auth enforcement: authenticate middleware is called on GET data-points', async () => {
    const { authenticate } = require('@ims/auth');
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(authenticate).toHaveBeenCalled();
  });

  it('empty list response: GET data-points returns empty array with pagination when none exist', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
    expect(res.body.pagination.totalPages).toBe(0);
  });

  it('invalid params (400): non-UUID metric id returns INVALID_ID error', async () => {
    const res = await request(app).get('/api/metrics/not-a-uuid/data-points');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  it('DB error handling (500): GET data-points count failure returns INTERNAL_ERROR', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockRejectedValue(new Error('DB count failed'));
    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('additional positive case: POST data-point stores VERIFIED status when provided', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.create as jest.Mock).mockResolvedValue({ ...mockDataPoint, status: 'VERIFIED' });
    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points')
      .send({
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        value: 2000,
        unit: 'tCO2e',
        status: 'VERIFIED',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('VERIFIED');
  });
});

// ─── Extended edge cases ────────────────────────────────────────────────────

describe('metrics — extended edge cases', () => {
  it('GET /:id/data-points response body is an object', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(typeof res.body).toBe('object');
  });

  it('GET /:id/data-points pagination page defaults to 1', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(res.body.pagination.page).toBe(1);
  });

  it('POST /:id/data-points with source and notes fields succeeds', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.create as jest.Mock).mockResolvedValue({ ...mockDataPoint, source: 'Meter', notes: 'Checked' });
    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points')
      .send({
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        value: 750,
        unit: 'tCO2e',
        source: 'Meter',
        notes: 'Checked',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /:id/data-points create is called with correct metricId', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.create as jest.Mock).mockResolvedValue(mockDataPoint);
    await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points')
      .send({ periodStart: '2026-01-01', periodEnd: '2026-03-31', value: 500, unit: 'tCO2e' });
    expect(prisma.esgDataPoint.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ metricId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('GET /:id/data-points with page=2 uses skip=20 by default limit', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(50);
    await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points?page=2');
    expect(prisma.esgDataPoint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20 })
    );
  });

  it('POST /:id/data-points missing periodEnd returns 400', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points')
      .send({ periodStart: '2026-01-01', value: 100, unit: 'tCO2e' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id/data-points 500 when metric findFirst throws', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/data-points 404 returns NOT_FOUND error code', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/metrics/00000000-0000-0000-0000-000000000099/data-points')
      .send({ periodStart: '2026-01-01', periodEnd: '2026-03-31', value: 100, unit: 'tCO2e' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
