import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgFramework: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    esgMetric: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

import frameworksRouter from '../src/routes/frameworks';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/frameworks', frameworksRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockFramework = {
  id: 'fw-1',
  name: 'GRI Standards',
  code: 'GRI',
  version: '2021',
  description: 'Global Reporting Initiative',
  isActive: true,
  modules: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  metrics: [],
};

const mockMetric = {
  id: 'met-1',
  frameworkId: 'fw-1',
  category: 'ENVIRONMENTAL',
  subcategory: 'Emissions',
  name: 'Total GHG Emissions',
  code: 'GRI-305-1',
  unit: 'tCO2e',
  targetValue: null,
  description: null,
  frequency: 'ANNUALLY',
  isRequired: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/frameworks', () => {
  it('should return paginated frameworks list', async () => {
    (prisma.esgFramework.findMany as jest.Mock).mockResolvedValue([mockFramework]);
    (prisma.esgFramework.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/frameworks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should handle pagination', async () => {
    (prisma.esgFramework.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgFramework.count as jest.Mock).mockResolvedValue(10);

    const res = await request(app).get('/api/frameworks?page=2&limit=5');
    expect(prisma.esgFramework.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgFramework.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgFramework.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/frameworks');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/frameworks', () => {
  it('should create a framework', async () => {
    (prisma.esgFramework.create as jest.Mock).mockResolvedValue(mockFramework);

    const res = await request(app).post('/api/frameworks').send({
      name: 'GRI Standards',
      code: 'GRI',
      version: '2021',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing fields', async () => {
    const res = await request(app).post('/api/frameworks').send({
      name: 'Test',
    });

    expect(res.status).toBe(400);
  });

  it('should return 409 for duplicate code', async () => {
    (prisma.esgFramework.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

    const res = await request(app).post('/api/frameworks').send({
      name: 'GRI Standards',
      code: 'GRI',
      version: '2021',
    });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/frameworks/:id', () => {
  it('should return a single framework with metrics', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(mockFramework);

    const res = await request(app).get('/api/frameworks/fw-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('fw-1');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/frameworks/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/frameworks/:id', () => {
  it('should update a framework', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(mockFramework);
    (prisma.esgFramework.update as jest.Mock).mockResolvedValue({ ...mockFramework, name: 'Updated' });

    const res = await request(app).put('/api/frameworks/fw-1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/frameworks/nonexistent').send({ name: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/frameworks/:id', () => {
  it('should soft delete a framework', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(mockFramework);
    (prisma.esgFramework.update as jest.Mock).mockResolvedValue({ ...mockFramework, deletedAt: new Date() });

    const res = await request(app).delete('/api/frameworks/fw-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/frameworks/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/frameworks/:id/metrics', () => {
  it('should return metrics for a framework', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(mockFramework);
    (prisma.esgMetric.findMany as jest.Mock).mockResolvedValue([mockMetric]);

    const res = await request(app).get('/api/frameworks/fw-1/metrics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 if framework not found', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/frameworks/nonexistent/metrics');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/frameworks/:id/metrics', () => {
  it('should create a metric for a framework', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(mockFramework);
    (prisma.esgMetric.create as jest.Mock).mockResolvedValue(mockMetric);

    const res = await request(app).post('/api/frameworks/fw-1/metrics').send({
      category: 'ENVIRONMENTAL',
      subcategory: 'Emissions',
      name: 'Total GHG Emissions',
      code: 'GRI-305-1',
      unit: 'tCO2e',
      frequency: 'ANNUALLY',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if framework not found', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/api/frameworks/nonexistent/metrics').send({
      category: 'ENVIRONMENTAL',
      subcategory: 'Emissions',
      name: 'Test',
      code: 'TEST-001',
      unit: 'kg',
      frequency: 'MONTHLY',
    });

    expect(res.status).toBe(404);
  });

  it('should return 400 for missing metric fields', async () => {
    (prisma.esgFramework.findFirst as jest.Mock).mockResolvedValue(mockFramework);

    const res = await request(app).post('/api/frameworks/fw-1/metrics').send({
      category: 'ENVIRONMENTAL',
    });

    expect(res.status).toBe(400);
  });
});
