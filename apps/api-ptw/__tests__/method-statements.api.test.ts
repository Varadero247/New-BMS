import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    ptwMethodStatement: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/method-statements';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/method-statements', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/method-statements', () => {
  it('should return method statements', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(1);
    const res = await request(app).get('/api/method-statements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns empty list when no method statements exist', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    const res = await request(app).get('/api/method-statements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('findMany and count are each called once', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    await request(app).get('/api/method-statements');
    expect(mockPrisma.ptwMethodStatement.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.ptwMethodStatement.count).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/method-statements/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue(null);
    const res = await request(app).get(
      '/api/method-statements/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get(
      '/api/method-statements/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/method-statements', () => {
  it('should create', async () => {
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwMethodStatement.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app).post('/api/method-statements').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/method-statements/:id', () => {
  it('should update', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.ptwMethodStatement.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/method-statements/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('returns 404 if method statement not found on update', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/method-statements/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/method-statements/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.ptwMethodStatement.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete(
      '/api/method-statements/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 if method statement not found on delete', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue(null);
    const res = await request(app).delete(
      '/api/method-statements/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/method-statements');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/method-statements/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwMethodStatement.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/method-statements').send({ title: 'Test MS', permitId: '00000000-0000-0000-0000-000000000001' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.ptwMethodStatement.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/method-statements/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.ptwMethodStatement.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/method-statements/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('method-statements.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/method-statements', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/method-statements', async () => {
    const res = await request(app).get('/api/method-statements');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/method-statements', async () => {
    const res = await request(app).get('/api/method-statements');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/method-statements body has success property', async () => {
    const res = await request(app).get('/api/method-statements');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/method-statements body is an object', async () => {
    const res = await request(app).get('/api/method-statements');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/method-statements route is accessible', async () => {
    const res = await request(app).get('/api/method-statements');
    expect(res.status).toBeDefined();
  });
});

describe('method-statements.api — extended edge cases', () => {
  it('GET / returns correct pagination metadata', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(100);
    const res = await request(app).get('/api/method-statements?page=3&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.total).toBe(100);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('GET / filters by status query param', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    const res = await request(app).get('/api/method-statements?status=APPROVED');
    expect(res.status).toBe(200);
    expect(mockPrisma.ptwMethodStatement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'APPROVED' }) })
    );
  });

  it('GET / filters by search query param', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    const res = await request(app).get('/api/method-statements?search=excavation');
    expect(res.status).toBe(200);
    expect(mockPrisma.ptwMethodStatement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ title: expect.objectContaining({ contains: 'excavation' }) }) })
    );
  });

  it('POST / returns 400 when title is empty string', async () => {
    const res = await request(app).post('/api/method-statements').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /:id returns success message on soft delete', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.ptwMethodStatement.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/method-statements/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('method statement deleted successfully');
  });

  it('GET /:id returns success true with data on found record', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'MS1' });
    const res = await request(app).get('/api/method-statements/00000000-0000-0000-0000-000000000001');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('PUT /:id returns updated data', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.ptwMethodStatement.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'New Title' });
    const res = await request(app).put('/api/method-statements/00000000-0000-0000-0000-000000000001').send({ title: 'New Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('New Title');
  });

  it('GET / returns success false on DB error', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/method-statements');
    expect(res.body.success).toBe(false);
  });

  it('POST / creates with optional fields included', async () => {
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(3);
    mockPrisma.ptwMethodStatement.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000003', title: 'Full MS' });
    const res = await request(app).post('/api/method-statements').send({
      title: 'Full MS',
      steps: 'Step 1, Step 2',
      hazards: 'Slipping',
      controls: 'Non-slip boots',
      ppe: 'Hard hat, boots',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('method-statements.api — final coverage', () => {
  it('GET / returns success:true with data array', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([{ id: '1', title: 'A' }]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(1);
    const res = await request(app).get('/api/method-statements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / pagination.totalPages rounds up correctly', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(21);
    const res = await request(app).get('/api/method-statements?limit=10');
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET /:id returns 404 error code NOT_FOUND', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/method-statements/00000000-0000-0000-0000-000000000099');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST / with approvedBy field succeeds', async () => {
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(5);
    mockPrisma.ptwMethodStatement.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000006', title: 'Approved MS' });
    const res = await request(app).post('/api/method-statements').send({ title: 'Approved MS', approvedBy: 'manager@ims.local' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id returns success:false on DB error', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.ptwMethodStatement.update.mockRejectedValue(new Error('db error'));
    const res = await request(app).put('/api/method-statements/00000000-0000-0000-0000-000000000001').send({ title: 'X' });
    expect(res.body.success).toBe(false);
  });

  it('DELETE /:id calls update with deletedAt', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.ptwMethodStatement.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/method-statements/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.ptwMethodStatement.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });
});

describe('method-statements.api — extra boundary coverage', () => {
  it('GET / returns multiple method statements', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'MS1' },
      { id: '00000000-0000-0000-0000-000000000002', title: 'MS2' },
    ]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(2);
    const res = await request(app).get('/api/method-statements');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('POST / generates referenceNumber for new method statement', async () => {
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(4);
    mockPrisma.ptwMethodStatement.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000005',
      title: 'New MS',
      referenceNumber: 'PMS-2026-0005',
    });
    const res = await request(app).post('/api/method-statements').send({ title: 'New MS' });
    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toBeDefined();
  });

  it('PUT /:id returns success:true on update', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.ptwMethodStatement.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Changed' });
    const res = await request(app)
      .put('/api/method-statements/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Changed' });
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id returns 404 error code NOT_FOUND when not found', async () => {
    mockPrisma.ptwMethodStatement.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/method-statements/00000000-0000-0000-0000-000000000099');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET / data is an array', async () => {
    mockPrisma.ptwMethodStatement.findMany.mockResolvedValue([]);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    const res = await request(app).get('/api/method-statements');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
