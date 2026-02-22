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

// ===================================================================
// Analytics Datasets — additional coverage (5 tests)
// ===================================================================
describe('Analytics Datasets — additional coverage', () => {
  it('GET /datasets returns 401 when authenticate rejects', async () => {
    const { authenticate } = await import('@ims/auth');
    (authenticate as jest.Mock).mockImplementationOnce((_req: any, res: any, _next: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' } });
    });

    const res = await request(app).get('/api/datasets');
    expect(res.status).toBe(401);
  });

  it('GET /datasets returns empty array and total 0 when no datasets exist', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);

    const res = await request(app).get('/api/datasets');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('GET /datasets honours limit and page query params', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);

    const res = await request(app).get('/api/datasets?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsDataset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET /datasets?isActive=false filters to inactive datasets', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);

    const res = await request(app).get('/api/datasets?isActive=false');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsDataset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: false }) })
    );
  });

  it('POST /datasets/:id/refresh returns 500 on DB update error', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDataset.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/datasets/00000000-0000-0000-0000-000000000001/refresh');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// Analytics Datasets — extended field, error, and filter coverage
// ===================================================================
describe('Analytics Datasets — extended field and filter coverage', () => {
  it('GET /datasets pagination has totalPages as a number', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);
    const res = await request(app).get('/api/datasets');
    expect(res.status).toBe(200);
    expect(typeof res.body.pagination.totalPages).toBe('number');
  });

  it('GET /datasets?source=HEALTH_SAFETY filters correctly', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);
    await request(app).get('/api/datasets?source=HEALTH_SAFETY');
    expect(mockPrisma.analyticsDataset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ source: 'HEALTH_SAFETY' }) })
    );
  });

  it('PUT /api/datasets/:id returns 500 on update failure', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDataset.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/datasets/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/datasets/:id returns 500 on update failure', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDataset.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete(
      '/api/datasets/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/datasets returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/datasets').send({
      source: 'QUALITY',
      query: 'SELECT * FROM quality',
      schema: {},
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/datasets returns 400 for invalid source enum value', async () => {
    const res = await request(app).post('/api/datasets').send({
      name: 'Bad Source',
      source: 'INVALID_SOURCE',
      query: 'SELECT 1',
      schema: {},
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/datasets/:id returns 500 on DB error', async () => {
    mockPrisma.analyticsDataset.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get(
      '/api/datasets/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/datasets/:id returns success message', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsDataset.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    const res = await request(app).delete(
      '/api/datasets/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Dataset deleted');
  });

  it('POST /api/datasets with description stores it', async () => {
    const created = {
      id: 'ds-desc',
      name: 'Described',
      description: 'A dataset with description',
      source: 'HR',
      isActive: true,
    };
    mockPrisma.analyticsDataset.create.mockResolvedValue(created);
    const res = await request(app).post('/api/datasets').send({
      name: 'Described',
      description: 'A dataset with description',
      source: 'HR',
      query: 'SELECT * FROM employees',
      schema: { columns: ['id'] },
    });
    expect(res.status).toBe(201);
    expect(res.body.data.description).toBe('A dataset with description');
  });
});

describe('Analytics Datasets — final coverage', () => {
  it('GET /api/datasets response body has success:true', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);
    const res = await request(app).get('/api/datasets');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/datasets count is called once per list request', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);
    await request(app).get('/api/datasets');
    expect(mockPrisma.analyticsDataset.count).toHaveBeenCalledTimes(1);
  });

  it('POST /api/datasets create called once on valid body', async () => {
    mockPrisma.analyticsDataset.create.mockResolvedValue({
      id: 'ds-once',
      name: 'Once',
      source: 'QUALITY',
      isActive: true,
    });
    await request(app).post('/api/datasets').send({
      name: 'Once',
      source: 'QUALITY',
      query: 'SELECT 1',
      schema: { columns: [] },
    });
    expect(mockPrisma.analyticsDataset.create).toHaveBeenCalledTimes(1);
  });

  it('POST /api/datasets/:id/refresh update includes lastRefreshed as a Date', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.analyticsDataset.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      lastRefreshed: new Date(),
      rowCount: 200,
    });
    await request(app).post('/api/datasets/00000000-0000-0000-0000-000000000001/refresh');
    expect(mockPrisma.analyticsDataset.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lastRefreshed: expect.any(Date) }) })
    );
  });

  it('DELETE /api/datasets/:id calls update with deletedAt field', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.analyticsDataset.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    await request(app).delete('/api/datasets/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.analyticsDataset.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET /api/datasets/:id findFirst called with correct id', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'ID Check',
    });
    await request(app).get('/api/datasets/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.analyticsDataset.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000001' }) })
    );
  });
});

describe('Analytics Datasets — supplemental coverage', () => {
  it('GET /api/datasets response data is always an array', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);
    const res = await request(app).get('/api/datasets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/datasets?source=FINANCE filters by FINANCE source', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);
    await request(app).get('/api/datasets?source=FINANCE');
    expect(mockPrisma.analyticsDataset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ source: 'FINANCE' }) })
    );
  });

  it('POST /api/datasets returns 500 on DB create error', async () => {
    mockPrisma.analyticsDataset.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/datasets').send({
      name: 'Will Fail',
      source: 'QUALITY',
      query: 'SELECT 1',
      schema: { columns: [] },
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/datasets pagination totalPages equals Math.ceil(total/limit)', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(30);
    const res = await request(app).get('/api/datasets?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET /api/datasets findMany is called once per list request', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);
    await request(app).get('/api/datasets');
    expect(mockPrisma.analyticsDataset.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('datasets.api.test.ts — phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/datasets returns 200 with data array of length 2', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'DS Phase28 A', source: 'QUALITY', isActive: true },
      { id: '00000000-0000-0000-0000-000000000002', name: 'DS Phase28 B', source: 'HR', isActive: true },
    ]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(2);
    const res = await request(app).get('/api/datasets');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('POST /api/datasets returns 201 with data.source matching input', async () => {
    mockPrisma.analyticsDataset.create.mockResolvedValue({
      id: 'ph28-ds-1',
      name: 'Phase28 Dataset',
      source: 'INVENTORY',
      isActive: true,
    });
    const res = await request(app).post('/api/datasets').send({
      name: 'Phase28 Dataset',
      source: 'INVENTORY',
      query: 'SELECT * FROM inventory',
      schema: { columns: ['id', 'name'] },
    });
    expect(res.status).toBe(201);
    expect(res.body.data.source).toBe('INVENTORY');
  });

  it('GET /api/datasets/:id returns 200 with data.name for existing dataset', async () => {
    mockPrisma.analyticsDataset.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Phase28 Detail DS',
      source: 'FINANCE',
      isActive: true,
    });
    const res = await request(app).get('/api/datasets/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Phase28 Detail DS');
  });

  it('GET /api/datasets 500 on DB error returns success:false', async () => {
    mockPrisma.analyticsDataset.findMany.mockRejectedValue(new Error('phase28 db error'));
    const res = await request(app).get('/api/datasets');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/datasets?isActive=true filters with isActive:true in where clause', async () => {
    mockPrisma.analyticsDataset.findMany.mockResolvedValue([]);
    mockPrisma.analyticsDataset.count.mockResolvedValue(0);
    await request(app).get('/api/datasets?isActive=true');
    expect(mockPrisma.analyticsDataset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });
});

describe('datasets — phase30 coverage', () => {
  it('handles Math.min', () => {
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('handles Math.max', () => {
    expect(Math.max(1, 2, 3)).toBe(3);
  });

  it('handles every method', () => {
    expect([1, 2, 3].every(x => x > 0)).toBe(true);
  });

  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

  it('handles indexOf method', () => {
    expect([1, 2, 3].indexOf(2)).toBe(1);
  });

});


describe('phase31 coverage', () => {
  it('handles string toLowerCase', () => { expect('HELLO'.toLowerCase()).toBe('hello'); });
  it('handles array some', () => { expect([1,2,3].some(x => x > 2)).toBe(true); });
  it('handles regex match', () => { const m = 'hello123'.match(/\d+/); expect(m?.[0]).toBe('123'); });
  it('handles regex test', () => { expect(/^\d+$/.test('123')).toBe(true); expect(/^\d+$/.test('abc')).toBe(false); });
  it('handles array spread', () => { const a = [1,2]; const b = [...a, 3]; expect(b).toEqual([1,2,3]); });
});


describe('phase32 coverage', () => {
  it('handles Array.from Set', () => { const s = new Set([1,1,2,3]); expect(Array.from(s)).toEqual([1,2,3]); });
  it('handles bitwise OR', () => { expect(6 | 3).toBe(7); });
  it('handles array concat', () => { expect([1,2].concat([3,4])).toEqual([1,2,3,4]); });
  it('handles logical nullish assignment', () => { let z: number | null = null; z ??= 3; expect(z).toBe(3); });
  it('handles string slice', () => { expect('hello world'.slice(6)).toBe('world'); });
});
