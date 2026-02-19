import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    analyticsQuery: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
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

import queriesRouter from '../src/routes/queries';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/queries', queriesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/queries — List queries
// ===================================================================
describe('GET /api/queries', () => {
  it('should return a list of queries with pagination', async () => {
    const queries = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Safety Query',
        ownerId: 'user-123',
        isPublic: false,
      },
      { id: 'q-2', name: 'Public Query', ownerId: 'user-456', isPublic: true },
    ];
    mockPrisma.analyticsQuery.findMany.mockResolvedValue(queries);
    mockPrisma.analyticsQuery.count.mockResolvedValue(2);

    const res = await request(app).get('/api/queries');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by owner=me', async () => {
    mockPrisma.analyticsQuery.findMany.mockResolvedValue([]);
    mockPrisma.analyticsQuery.count.mockResolvedValue(0);

    const res = await request(app).get('/api/queries?owner=me');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsQuery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ ownerId: 'user-123' }) })
    );
  });

  it('should filter by isPublic', async () => {
    mockPrisma.analyticsQuery.findMany.mockResolvedValue([]);
    mockPrisma.analyticsQuery.count.mockResolvedValue(0);

    const res = await request(app).get('/api/queries?isPublic=true');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsQuery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isPublic: true }) })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.analyticsQuery.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/queries');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/queries — Create query
// ===================================================================
describe('POST /api/queries', () => {
  it('should create a new query', async () => {
    const created = { id: 'q-new', name: 'New Query', sql: 'SELECT 1', ownerId: 'user-123' };
    mockPrisma.analyticsQuery.create.mockResolvedValue(created);

    const res = await request(app).post('/api/queries').send({
      name: 'New Query',
      sql: 'SELECT 1',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Query');
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/queries').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ===================================================================
// GET /api/queries/:id — Get by ID
// ===================================================================
describe('GET /api/queries/:id', () => {
  it('should return a query by ID', async () => {
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test',
    });

    const res = await request(app).get('/api/queries/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent query', async () => {
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/queries/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/queries/:id — Update
// ===================================================================
describe('PUT /api/queries/:id', () => {
  it('should update a query', async () => {
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsQuery.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/queries/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for non-existent query', async () => {
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/queries/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/queries/:id — Soft delete
// ===================================================================
describe('DELETE /api/queries/:id', () => {
  it('should soft delete a query', async () => {
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsQuery.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/queries/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Query deleted');
  });

  it('should return 404 for non-existent query', async () => {
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/queries/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/queries/:id/execute — Execute query
// ===================================================================
describe('POST /api/queries/:id/execute', () => {
  it('should execute a query and return results', async () => {
    const mockRows = [
      { id: 1, name: 'Sample 1', value: 100 },
      { id: 2, name: 'Sample 2', value: 200 },
    ];
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      sql: 'SELECT 1',
    });
    mockPrisma.analyticsQuery.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      lastRun: new Date(),
    });
    mockPrisma.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        $executeRawUnsafe: jest.fn().mockResolvedValue(0),
        $queryRawUnsafe: jest.fn().mockResolvedValue(mockRows),
      };
      return fn(tx);
    });

    const res = await request(app).post(
      '/api/queries/00000000-0000-0000-0000-000000000001/execute'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.results).toBeDefined();
    expect(res.body.data.results.rowCount).toBe(2);
    expect(res.body.data.results.columns).toEqual(['id', 'name', 'value']);
    expect(res.body.data.executionMs).toBeDefined();
  });

  it('should reject non-SELECT queries', async () => {
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      sql: 'DROP TABLE users',
    });

    const res = await request(app).post(
      '/api/queries/00000000-0000-0000-0000-000000000001/execute'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_QUERY');
  });

  it('should reject stacked queries containing semicolons', async () => {
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      sql: 'SELECT 1; DROP TABLE users',
    });

    const res = await request(app).post(
      '/api/queries/00000000-0000-0000-0000-000000000001/execute'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_QUERY');
    expect(res.body.error.message).toMatch(/stacked/i);
  });

  it('should return 404 for non-existent query', async () => {
    mockPrisma.analyticsQuery.findFirst.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/queries/00000000-0000-0000-0000-000000000099/execute'
    );

    expect(res.status).toBe(404);
  });
});
