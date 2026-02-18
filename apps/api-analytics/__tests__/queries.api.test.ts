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
      { id: 'q-1', name: 'Safety Query', ownerId: 'user-123', isPublic: false },
      { id: 'q-2', name: 'Public Query', ownerId: 'user-456', isPublic: true },
    ];
    (prisma as any).analyticsQuery.findMany.mockResolvedValue(queries);
    (prisma as any).analyticsQuery.count.mockResolvedValue(2);

    const res = await request(app).get('/api/queries');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by owner=me', async () => {
    (prisma as any).analyticsQuery.findMany.mockResolvedValue([]);
    (prisma as any).analyticsQuery.count.mockResolvedValue(0);

    const res = await request(app).get('/api/queries?owner=me');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsQuery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ ownerId: 'user-123' }) })
    );
  });

  it('should filter by isPublic', async () => {
    (prisma as any).analyticsQuery.findMany.mockResolvedValue([]);
    (prisma as any).analyticsQuery.count.mockResolvedValue(0);

    const res = await request(app).get('/api/queries?isPublic=true');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsQuery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isPublic: true }) })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).analyticsQuery.findMany.mockRejectedValue(new Error('DB error'));

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
    (prisma as any).analyticsQuery.create.mockResolvedValue(created);

    const res = await request(app).post('/api/queries').send({
      name: 'New Query', sql: 'SELECT 1',
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
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue({ id: 'q-1', name: 'Test' });

    const res = await request(app).get('/api/queries/q-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('q-1');
  });

  it('should return 404 for non-existent query', async () => {
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/queries/nonexistent');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/queries/:id — Update
// ===================================================================
describe('PUT /api/queries/:id', () => {
  it('should update a query', async () => {
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue({ id: 'q-1' });
    (prisma as any).analyticsQuery.update.mockResolvedValue({ id: 'q-1', name: 'Updated' });

    const res = await request(app).put('/api/queries/q-1').send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for non-existent query', async () => {
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/queries/nonexistent').send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/queries/:id — Soft delete
// ===================================================================
describe('DELETE /api/queries/:id', () => {
  it('should soft delete a query', async () => {
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue({ id: 'q-1' });
    (prisma as any).analyticsQuery.update.mockResolvedValue({ id: 'q-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/queries/q-1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Query deleted');
  });

  it('should return 404 for non-existent query', async () => {
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/queries/nonexistent');

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
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue({ id: 'q-1', sql: 'SELECT 1' });
    (prisma as any).analyticsQuery.update.mockResolvedValue({ id: 'q-1', lastRun: new Date() });
    (prisma as any).$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        $executeRawUnsafe: jest.fn().mockResolvedValue(0),
        $queryRawUnsafe: jest.fn().mockResolvedValue(mockRows),
      };
      return fn(tx);
    });

    const res = await request(app).post('/api/queries/q-1/execute');

    expect(res.status).toBe(200);
    expect(res.body.data.results).toBeDefined();
    expect(res.body.data.results.rowCount).toBe(2);
    expect(res.body.data.results.columns).toEqual(['id', 'name', 'value']);
    expect(res.body.data.executionMs).toBeDefined();
  });

  it('should reject non-SELECT queries', async () => {
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue({ id: 'q-1', sql: 'DROP TABLE users' });

    const res = await request(app).post('/api/queries/q-1/execute');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_QUERY');
  });

  it('should reject stacked queries containing semicolons', async () => {
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue({
      id: 'q-1',
      sql: 'SELECT 1; DROP TABLE users',
    });

    const res = await request(app).post('/api/queries/q-1/execute');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_QUERY');
    expect(res.body.error.message).toMatch(/stacked/i);
  });

  it('should return 404 for non-existent query', async () => {
    (prisma as any).analyticsQuery.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/queries/nonexistent/execute');

    expect(res.status).toBe(404);
  });
});
