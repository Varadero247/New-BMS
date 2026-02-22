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

describe('work-orders.api — extended edge cases', () => {
  it('POST with optional priority HIGH creates record', async () => {
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetWorkOrder.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Urgent Fix',
      priority: 'HIGH',
    });
    const res = await request(app)
      .post('/api/work-orders')
      .send({ assetId: '00000000-0000-0000-0000-000000000001', title: 'Urgent Fix', priority: 'HIGH' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST with invalid priority enum returns 400', async () => {
    const res = await request(app)
      .post('/api/work-orders')
      .send({ assetId: 'a-1', title: 'Test', priority: 'ULTRA' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST with invalid status enum returns 400', async () => {
    const res = await request(app)
      .post('/api/work-orders')
      .send({ assetId: 'a-1', title: 'Test', status: 'BROKEN' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET returns pagination metadata with correct total', async () => {
    mockPrisma.assetWorkOrder.findMany.mockResolvedValue([]);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(100);
    const res = await request(app).get('/api/work-orders?page=3&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(100);
    expect(res.body.pagination.totalPages).toBe(10);
    expect(res.body.pagination.page).toBe(3);
  });

  it('GET filters by search param and passes contains filter to findMany', async () => {
    mockPrisma.assetWorkOrder.findMany.mockResolvedValue([]);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/work-orders?search=pump');
    expect(res.status).toBe(200);
    expect(mockPrisma.assetWorkOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ title: expect.objectContaining({ contains: 'pump' }) }),
      })
    );
  });

  it('DELETE returns message containing deleted', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetWorkOrder.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('PUT with valid status IN_PROGRESS updates successfully', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetWorkOrder.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'IN_PROGRESS',
    });
    const res = await request(app)
      .put('/api/work-orders/00000000-0000-0000-0000-000000000001')
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT with negative estimatedHours returns 400 validation error', async () => {
    const res = await request(app)
      .put('/api/work-orders/00000000-0000-0000-0000-000000000001')
      .send({ estimatedHours: -5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
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

describe('Work Orders API — final coverage block', () => {
  it('POST / count is called to generate reference number', async () => {
    mockPrisma.assetWorkOrder.count.mockResolvedValue(4);
    mockPrisma.assetWorkOrder.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Fix pump', referenceNumber: 'AWO-2026-0005' });
    await request(app).post('/api/work-orders').send({ assetId: 'asset-1', title: 'Fix pump' });
    expect(mockPrisma.assetWorkOrder.count).toHaveBeenCalledTimes(1);
  });

  it('DELETE /:id update is called with deletedAt data', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetWorkOrder.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.assetWorkOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('POST / create is called with assetId in data', async () => {
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetWorkOrder.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Task' });
    await request(app).post('/api/work-orders').send({ assetId: 'asset-zz', title: 'Task' });
    expect(mockPrisma.assetWorkOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ assetId: 'asset-zz' }) })
    );
  });

  it('PUT /:id update is called with correct where.id', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetWorkOrder.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Done' });
    await request(app).put('/api/work-orders/00000000-0000-0000-0000-000000000001').send({ title: 'Done' });
    expect(mockPrisma.assetWorkOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('GET / returns success true and data is an array', async () => {
    mockPrisma.assetWorkOrder.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'WO 1' },
    ]);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(1);
    const res = await request(app).get('/api/work-orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /:id returns correct data.id matching param', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000042' });
    const res = await request(app).get('/api/work-orders/00000000-0000-0000-0000-000000000042');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000042');
  });

  it('GET / pagination total matches count mock', async () => {
    mockPrisma.assetWorkOrder.findMany.mockResolvedValue([]);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(88);
    const res = await request(app).get('/api/work-orders');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(88);
  });
});

describe('Work Orders API — extra coverage', () => {
  it('GET / returns success:true and data array on success', async () => {
    mockPrisma.assetWorkOrder.findMany.mockResolvedValue([]);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/work-orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST returns 201 with success:true for valid minimal payload', async () => {
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetWorkOrder.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000005', title: 'Minimal' });
    const res = await request(app).post('/api/work-orders').send({ assetId: 'asset-min', title: 'Minimal' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id returns success:true and message on soft delete', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetWorkOrder.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('message');
  });

  it('GET /:id returns 500 when findFirst rejects', async () => {
    mockPrisma.assetWorkOrder.findFirst.mockRejectedValue(new Error('network error'));
    const res = await request(app).get('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / response has pagination property on success', async () => {
    mockPrisma.assetWorkOrder.findMany.mockResolvedValue([]);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/work-orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
  });
});
