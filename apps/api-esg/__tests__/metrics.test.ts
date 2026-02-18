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

    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should return 404 if metric not found', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000099/data-points');
    expect(res.status).toBe(404);
  });

  it('should handle pagination', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(50);

    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points?page=2&limit=10');
    expect(prisma.esgDataPoint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('should return empty list when no data points exist', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgDataPoint.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001/data-points');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/metrics/:id/data-points', () => {
  it('should create a data point', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.create as jest.Mock).mockResolvedValue(mockDataPoint);

    const res = await request(app).post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points').send({
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

    const res = await request(app).post('/api/metrics/00000000-0000-0000-0000-000000000099/data-points').send({
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
      value: 1500,
      unit: 'tCO2e',
    });

    expect(res.status).toBe(404);
  });

  it('should return 400 for missing required fields', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);

    const res = await request(app).post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points').send({
      periodStart: '2026-01-01',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should accept optional fields', async () => {
    (prisma.esgMetric.findFirst as jest.Mock).mockResolvedValue(mockMetric);
    (prisma.esgDataPoint.create as jest.Mock).mockResolvedValue(mockDataPoint);

    const res = await request(app).post('/api/metrics/00000000-0000-0000-0000-000000000001/data-points').send({
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
