import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualMetric: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
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
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

import metricsRouter from '../src/routes/metrics';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/metrics', metricsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Quality Metrics API Routes', () => {
  const mockMetric = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-MET-2026-001',
    name: 'Customer Satisfaction Score',
    description: 'NPS score tracking',
    category: 'CUSTOMER_SATISFACTION',
    unit: 'score',
    targetValue: 80,
    actualValue: 75,
    status: 'AT_RISK',
    frequency: 'MONTHLY',
    owner: 'Jane Quality',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/metrics/summary', () => {
    it('should return metrics dashboard summary', async () => {
      mockPrisma.qualMetric.count
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(3);
      mockPrisma.qualMetric.groupBy.mockResolvedValue([
        { category: 'CUSTOMER_SATISFACTION', _count: { id: 5 } },
      ]);

      const res = await request(app).get('/api/metrics/summary');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('onTrack');
      expect(res.body.data).toHaveProperty('atRisk');
      expect(res.body.data).toHaveProperty('offTrack');
      expect(res.body.data).toHaveProperty('byCategory');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualMetric.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/metrics/summary');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/metrics', () => {
    it('should return list of metrics with pagination', async () => {
      mockPrisma.qualMetric.findMany.mockResolvedValue([mockMetric]);
      mockPrisma.qualMetric.count.mockResolvedValue(1);

      const res = await request(app).get('/api/metrics');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.qualMetric.findMany.mockResolvedValue([mockMetric]);
      mockPrisma.qualMetric.count.mockResolvedValue(1);

      const res = await request(app).get('/api/metrics?status=AT_RISK');

      expect(res.status).toBe(200);
    });

    it('should filter by category', async () => {
      mockPrisma.qualMetric.findMany.mockResolvedValue([mockMetric]);
      mockPrisma.qualMetric.count.mockResolvedValue(1);

      const res = await request(app).get('/api/metrics?category=CUSTOMER_SATISFACTION');

      expect(res.status).toBe(200);
    });

    it('should support search', async () => {
      mockPrisma.qualMetric.findMany.mockResolvedValue([mockMetric]);
      mockPrisma.qualMetric.count.mockResolvedValue(1);

      const res = await request(app).get('/api/metrics?search=satisfaction');

      expect(res.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualMetric.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.qualMetric.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/metrics');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/metrics', () => {
    const validBody = {
      name: 'Customer Satisfaction Score',
      category: 'CUSTOMER_SATISFACTION',
    };

    it('should create a new metric', async () => {
      mockPrisma.qualMetric.count.mockResolvedValue(0);
      mockPrisma.qualMetric.create.mockResolvedValue(mockMetric);

      const res = await request(app).post('/api/metrics').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/metrics')
        .send({ category: 'CUSTOMER_SATISFACTION' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const res = await request(app)
        .post('/api/metrics')
        .send({ name: 'Test', category: 'INVALID_CATEGORY' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualMetric.count.mockResolvedValue(0);
      mockPrisma.qualMetric.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/metrics').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/metrics/:id', () => {
    it('should return a single metric', async () => {
      mockPrisma.qualMetric.findFirst.mockResolvedValue(mockMetric);

      const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when metric not found', async () => {
      mockPrisma.qualMetric.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualMetric.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/metrics/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/metrics/:id', () => {
    it('should update a metric', async () => {
      mockPrisma.qualMetric.findFirst.mockResolvedValue(mockMetric);
      const updated = { ...mockMetric, actualValue: 82, status: 'ON_TRACK' };
      mockPrisma.qualMetric.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/metrics/00000000-0000-0000-0000-000000000001')
        .send({ actualValue: 82, status: 'ON_TRACK' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when metric not found', async () => {
      mockPrisma.qualMetric.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/metrics/00000000-0000-0000-0000-000000000099')
        .send({ actualValue: 90 });

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.qualMetric.findFirst.mockResolvedValue(mockMetric);

      const res = await request(app)
        .put('/api/metrics/00000000-0000-0000-0000-000000000001')
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualMetric.findFirst.mockResolvedValue(mockMetric);
      mockPrisma.qualMetric.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/metrics/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/metrics/:id', () => {
    it('should soft delete a metric', async () => {
      mockPrisma.qualMetric.findFirst.mockResolvedValue(mockMetric);
      mockPrisma.qualMetric.update.mockResolvedValue({ ...mockMetric, deletedAt: new Date() });

      const res = await request(app).delete('/api/metrics/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });

    it('should return 404 when metric not found', async () => {
      mockPrisma.qualMetric.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/metrics/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualMetric.findFirst.mockResolvedValue(mockMetric);
      mockPrisma.qualMetric.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/metrics/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });
});

describe('Quality Metrics API — extended coverage', () => {
  const mockMetric = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-MET-2026-001',
    name: 'Customer Satisfaction Score',
    description: 'NPS score tracking',
    category: 'CUSTOMER_SATISFACTION',
    unit: 'score',
    targetValue: 80,
    actualValue: 75,
    status: 'AT_RISK',
    frequency: 'MONTHLY',
    owner: 'Jane Quality',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns correct totalPages for multi-page result', async () => {
    mockPrisma.qualMetric.findMany.mockResolvedValue([mockMetric]);
    mockPrisma.qualMetric.count.mockResolvedValue(50);

    const res = await request(app).get('/api/metrics?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('GET / passes correct skip to Prisma for page 3', async () => {
    mockPrisma.qualMetric.findMany.mockResolvedValue([]);
    mockPrisma.qualMetric.count.mockResolvedValue(30);

    await request(app).get('/api/metrics?page=3&limit=10');

    expect(mockPrisma.qualMetric.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('GET / filters by frequency query param', async () => {
    mockPrisma.qualMetric.findMany.mockResolvedValue([mockMetric]);
    mockPrisma.qualMetric.count.mockResolvedValue(1);

    const res = await request(app).get('/api/metrics?frequency=MONTHLY');

    expect(res.status).toBe(200);
  });

  it('POST / returns 400 when name is empty string', async () => {
    const res = await request(app)
      .post('/api/metrics')
      .send({ name: '', category: 'CUSTOMER_SATISFACTION' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /summary returns 500 and error shape on DB error', async () => {
    mockPrisma.qualMetric.count.mockRejectedValue(new Error('Timeout'));

    const res = await request(app).get('/api/metrics/summary');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /:id response shape contains deleted:true on success', async () => {
    mockPrisma.qualMetric.findFirst.mockResolvedValue(mockMetric);
    mockPrisma.qualMetric.update.mockResolvedValue({ ...mockMetric, deletedAt: new Date() });

    const res = await request(app).delete('/api/metrics/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('PUT /:id returns 500 on DB error during update', async () => {
    mockPrisma.qualMetric.findFirst.mockResolvedValue(mockMetric);
    mockPrisma.qualMetric.update.mockRejectedValue(new Error('Write failure'));

    const res = await request(app)
      .put('/api/metrics/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Metric' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET / response always includes pagination object', async () => {
    mockPrisma.qualMetric.findMany.mockResolvedValue([]);
    mockPrisma.qualMetric.count.mockResolvedValue(0);

    const res = await request(app).get('/api/metrics');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total', 0);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
  });
});
