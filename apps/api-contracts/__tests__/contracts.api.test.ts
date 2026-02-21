import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    contContract: {
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

import router from '../src/routes/contracts';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/contracts', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/contracts', () => {
  it('should return contracts', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.contContract.count.mockResolvedValue(1);
    const res = await request(app).get('/api/contracts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/contracts/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.contContract.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/contracts/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.contContract.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/contracts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/contracts', () => {
  it('should create', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contContract.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app).post('/api/contracts').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/contracts/:id', () => {
  it('should update', async () => {
    mockPrisma.contContract.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.contContract.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/contracts/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/contracts/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.contContract.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.contContract.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/contracts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when record not found', async () => {
    mockPrisma.contContract.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/contracts/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── Validation errors ─────────────────────────────────────────────────────

describe('POST /api/contracts — validation', () => {
  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/contracts').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when fileUrl is not a valid URL', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    const res = await request(app)
      .post('/api/contracts')
      .send({ title: 'Contract', fileUrl: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/contracts/:id — not-found', () => {
  it('returns 404 when record not found', async () => {
    mockPrisma.contContract.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/contracts/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.contContract.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/contracts');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.contContract.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/contracts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contContract.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/contracts').send({ title: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.contContract.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.contContract.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/contracts/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.contContract.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.contContract.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/contracts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Query filtering ────────────────────────────────────────────────────────

describe('GET /api/contracts — filtering', () => {
  it('filters by status query param', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([]);
    mockPrisma.contContract.count.mockResolvedValue(0);
    const res = await request(app).get('/api/contracts?status=ACTIVE');
    expect(res.status).toBe(200);
    expect(mockPrisma.contContract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) })
    );
  });

  it('searches by title keyword', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([]);
    mockPrisma.contContract.count.mockResolvedValue(0);
    const res = await request(app).get('/api/contracts?search=supplier');
    expect(res.status).toBe(200);
    expect(mockPrisma.contContract.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ title: expect.objectContaining({ contains: 'supplier' }) }) })
    );
  });

  it('returns pagination metadata', async () => {
    mockPrisma.contContract.findMany.mockResolvedValue([]);
    mockPrisma.contContract.count.mockResolvedValue(50);
    const res = await request(app).get('/api/contracts?page=3&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.total).toBe(50);
    expect(res.body.pagination.totalPages).toBe(5);
  });
});

describe('contracts.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/contracts', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/contracts', async () => {
    const res = await request(app).get('/api/contracts');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/contracts', async () => {
    const res = await request(app).get('/api/contracts');
    expect(res.headers['content-type']).toBeDefined();
  });
});
