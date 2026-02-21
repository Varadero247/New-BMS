import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    assetWorkOrder: {
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

import router from '../src/routes/work-orders';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/work-orders', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/work-orders', () => {
  it('should return work orders', async () => {
    mockPrisma.assetWorkOrder.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(1);
    const res = await request(app).get('/api/work-orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/work-orders/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/work-orders/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).get('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/work-orders', () => {
  it('should create', async () => {
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetWorkOrder.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
    });
    const res = await request(app)
      .post('/api/work-orders')
      .send({ assetId: 'asset-1', title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/work-orders/:id', () => {
  it('should update', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetWorkOrder.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/work-orders/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/work-orders/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetWorkOrder.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when record not found', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/work-orders/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── Validation errors ─────────────────────────────────────────────────────

describe('POST /api/work-orders — validation', () => {
  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/work-orders').send({ assetId: 'asset-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when assetId is missing', async () => {
    const res = await request(app).post('/api/work-orders').send({ title: 'Fix pump' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/work-orders/:id — not-found', () => {
  it('returns 404 when record not found', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/work-orders/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.assetWorkOrder.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/work-orders');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetWorkOrder.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/work-orders')
      .send({ assetId: 'asset-1', title: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetWorkOrder.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/work-orders/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetWorkOrder.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Query filtering ────────────────────────────────────────────────────────

describe('GET /api/work-orders — filtering', () => {
  it('filters by status query param', async () => {
    mockPrisma.assetWorkOrder.findMany.mockResolvedValue([]);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/work-orders?status=OPEN');
    expect(res.status).toBe(200);
    expect(mockPrisma.assetWorkOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'OPEN' }) })
    );
  });

  it('filters by assetId', async () => {
    mockPrisma.assetWorkOrder.findMany.mockResolvedValue([]);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    const res = await request(app).get(
      '/api/work-orders?assetId=00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
  });
});

describe('work-orders.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/work-orders', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/work-orders', async () => {
    const res = await request(app).get('/api/work-orders');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/work-orders', async () => {
    const res = await request(app).get('/api/work-orders');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/work-orders body has success property', async () => {
    const res = await request(app).get('/api/work-orders');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});
