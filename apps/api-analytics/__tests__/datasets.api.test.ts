import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    analyticsDataset: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

import datasetsRouter from '../src/routes/datasets';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/datasets', datasetsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/datasets — List datasets
// ===================================================================
describe('GET /api/datasets', () => {
  it('should return a list of datasets with pagination', async () => {
    const datasets = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Safety Data',
        source: 'HEALTH_SAFETY',
        isActive: true,
      },
      { id: 'ds-2', name: 'Quality Data', source: 'QUALITY', isActive: true },
    ];
    mockPrisma.analyticsDataset.findMany.mockResolvedValue(datasets);
    mockPrisma.analyticsDataset.count.mockResolvedValue(2);

    const res = await request(app).get('/api/datasets');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by source', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);

    const res = await request(app).get('/api/datasets?source=QUALITY');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsDataset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ source: 'QUALITY' }) })
    );
  });

  it('should filter by isActive', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);

    const res = await request(app).get('/api/datasets?isActive=true');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsDataset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.analyticsDataset.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/datasets');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/datasets — Create dataset
// ===================================================================
describe('POST /api/datasets', () => {
  it('should create a new dataset', async () => {
    const created = { id: 'ds-new', name: 'New Dataset', source: 'HR' };
    mockPrisma.analyticsDataset.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/datasets')
      .send({
        name: 'New Dataset',
        source: 'HR',
        query: 'SELECT * FROM employees',
        schema: { columns: ['id', 'name'] },
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Dataset');
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/datasets').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ===================================================================
// GET /api/datasets/:id — Get by ID
// ===================================================================
describe('GET /api/datasets/:id', () => {
  it('should return a dataset by ID', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test',
    });

    const res = await request(app).get('/api/datasets/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent dataset', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/datasets/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/datasets/:id — Update
// ===================================================================
describe('PUT /api/datasets/:id', () => {
  it('should update a dataset', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDataset.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/datasets/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for non-existent dataset', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/datasets/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/datasets/:id — Soft delete
// ===================================================================
describe('DELETE /api/datasets/:id', () => {
  it('should soft delete a dataset', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDataset.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/datasets/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Dataset deleted');
  });

  it('should return 404 for non-existent dataset', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/datasets/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/datasets/:id/refresh — Refresh dataset
// ===================================================================
describe('POST /api/datasets/:id/refresh', () => {
  it('should refresh a dataset', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDataset.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      lastRefreshed: new Date(),
      rowCount: 500,
    });

    const res = await request(app).post(
      '/api/datasets/00000000-0000-0000-0000-000000000001/refresh'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.lastRefreshed).toBeDefined();
  });

  it('should return 404 for non-existent dataset', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/datasets/00000000-0000-0000-0000-000000000099/refresh'
    );

    expect(res.status).toBe(404);
  });
});

describe('Analytics Datasets — extended', () => {
  it('POST /datasets sets isActive to true by default on create', async () => {
    const created = { id: 'ds-ext', name: 'Extended Dataset', source: 'ENVIRONMENT', isActive: true };
    mockPrisma.analyticsDataset.create.mockResolvedValue(created);

    const res = await request(app).post('/api/datasets').send({
      name: 'Extended Dataset',
      source: 'ENVIRONMENT',
      query: 'SELECT * FROM env_aspects',
      schema: { columns: ['id', 'name'] },
    });

    expect(res.status).toBe(201);
    expect(res.body.data.isActive).toBe(true);
  });
});
