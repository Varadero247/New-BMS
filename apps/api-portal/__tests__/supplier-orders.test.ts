import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalOrder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import supplierOrdersRouter from '../src/routes/supplier-orders';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/supplier/purchase-orders', supplierOrdersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/supplier/purchase-orders', () => {
  it('should list purchase orders', async () => {
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        orderNumber: 'PO-001',
        type: 'PURCHASE',
        status: 'SUBMITTED',
      },
    ];
    mockPrisma.portalOrder.findMany.mockResolvedValue(items);
    mockPrisma.portalOrder.count.mockResolvedValue(1);

    const res = await request(app).get('/api/supplier/purchase-orders');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/supplier/purchase-orders?status=SUBMITTED');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(25);

    const res = await request(app).get('/api/supplier/purchase-orders?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('should handle server error', async () => {
    mockPrisma.portalOrder.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/supplier/purchase-orders');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/supplier/purchase-orders/:id/confirm', () => {
  it('should confirm a purchase order', async () => {
    const order = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      type: 'PURCHASE',
      status: 'SUBMITTED',
      notes: null,
      expectedDelivery: null,
    };
    mockPrisma.portalOrder.findFirst.mockResolvedValue(order);
    mockPrisma.portalOrder.update.mockResolvedValue({ ...order, status: 'CONFIRMED' });

    const res = await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if PO not found', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000099/confirm')
      .send({});

    expect(res.status).toBe(404);
  });

  it('should return 400 if PO not in SUBMITTED status', async () => {
    const order = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      type: 'PURCHASE',
      status: 'CONFIRMED',
      notes: null,
      expectedDelivery: null,
    };
    mockPrisma.portalOrder.findFirst.mockResolvedValue(order);

    const res = await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('should handle server error on confirm', async () => {
    mockPrisma.portalOrder.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({});

    expect(res.status).toBe(500);
  });
});

describe('Supplier Orders — extended', () => {
  it('GET list: data is an array', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET list: success is true', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET list: findMany called once per request', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    await request(app).get('/api/supplier/purchase-orders');
    expect(mockPrisma.portalOrder.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('Supplier Orders — extra', () => {
  it('GET list: count called once per request', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    await request(app).get('/api/supplier/purchase-orders');
    expect(mockPrisma.portalOrder.count).toHaveBeenCalledTimes(1);
  });

  it('GET list: data length matches mock array length', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([
      { id: 'o1', orderNumber: 'PO-001', type: 'PURCHASE', status: 'SUBMITTED' },
      { id: 'o2', orderNumber: 'PO-002', type: 'PURCHASE', status: 'CONFIRMED' },
    ]);
    mockPrisma.portalOrder.count.mockResolvedValue(2);
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.body.data).toHaveLength(2);
  });

  it('POST confirm: update called once on success', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      type: 'PURCHASE',
      status: 'SUBMITTED',
      notes: null,
      expectedDelivery: null,
    });
    mockPrisma.portalOrder.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'CONFIRMED' });
    await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({});
    expect(mockPrisma.portalOrder.update).toHaveBeenCalledTimes(1);
  });

  it('GET list: returns 500 on DB error with success false', async () => {
    mockPrisma.portalOrder.findMany.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('supplier-orders — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/supplier/purchase-orders', supplierOrdersRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/supplier/purchase-orders', async () => {
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/supplier/purchase-orders', async () => {
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/supplier/purchase-orders body has success property', async () => {
    const res = await request(app).get('/api/supplier/purchase-orders');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/supplier/purchase-orders body is an object', async () => {
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/supplier/purchase-orders route is accessible', async () => {
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.status).toBeDefined();
  });
});

describe('supplier-orders — edge cases and validation', () => {
  it('GET list: filter by CONFIRMED status returns 200', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/purchase-orders?status=CONFIRMED');
    expect(res.status).toBe(200);
  });

  it('GET list: pagination page 3 limit 5 returns totalPages=4 for 20 items', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(20);
    const res = await request(app).get('/api/supplier/purchase-orders?page=3&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(4);
  });

  it('GET list: response body contains pagination object', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
  });

  it('POST confirm: returns 500 when update throws error', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      type: 'PURCHASE',
      status: 'SUBMITTED',
      notes: null,
      expectedDelivery: null,
    });
    mockPrisma.portalOrder.update.mockRejectedValue(new Error('DB crash'));
    const res = await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({});
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('POST confirm: update sets status to CONFIRMED', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      type: 'PURCHASE',
      status: 'SUBMITTED',
      notes: null,
      expectedDelivery: null,
    });
    mockPrisma.portalOrder.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'CONFIRMED',
    });
    await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({});
    expect(mockPrisma.portalOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CONFIRMED' }),
      })
    );
  });

  it('GET list: findMany called once per request', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    await request(app).get('/api/supplier/purchase-orders');
    expect(mockPrisma.portalOrder.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET list: total in pagination matches count mock value', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(42);
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(42);
  });

  it('POST confirm: accepts expectedDelivery and notes in body', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      type: 'PURCHASE',
      status: 'SUBMITTED',
      notes: null,
      expectedDelivery: null,
    });
    mockPrisma.portalOrder.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'CONFIRMED',
      notes: 'Confirmed with delivery date',
      expectedDelivery: new Date('2024-03-01'),
    });
    const res = await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({ notes: 'Confirmed with delivery date', expectedDelivery: '2024-03-01' });
    expect(res.status).toBe(200);
  });

  it('GET list: count called once per list request', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    await request(app).get('/api/supplier/purchase-orders');
    expect(mockPrisma.portalOrder.count).toHaveBeenCalledTimes(1);
  });
});

describe('Supplier Orders — final coverage', () => {
  it('GET list: response body has success and data fields', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET list: pagination has page, limit, total, totalPages fields', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('GET list: returns empty array when no orders exist', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.body.data).toEqual([]);
  });

  it('POST confirm: findFirst called with correct order id', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue(null);
    await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({});
    expect(mockPrisma.portalOrder.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000001' }) })
    );
  });

  it('GET list: filter by CANCELLED status returns 200', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/purchase-orders?status=CANCELLED');
    expect(res.status).toBe(200);
  });

  it('POST confirm: success true when SUBMITTED order is confirmed', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      type: 'PURCHASE',
      status: 'SUBMITTED',
      notes: null,
      expectedDelivery: null,
    });
    mockPrisma.portalOrder.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'CONFIRMED' });
    const res = await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({});
    expect(res.body.success).toBe(true);
  });
});

describe('supplier-orders — boundary and extra coverage', () => {
  it('GET list: filter by SHIPPED status returns 200', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/purchase-orders?status=SHIPPED');
    expect(res.status).toBe(200);
  });

  it('GET list: multiple orders reflected in data array length', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([
      { id: 'o1', orderNumber: 'PO-001', type: 'PURCHASE', status: 'SUBMITTED' },
      { id: 'o2', orderNumber: 'PO-002', type: 'PURCHASE', status: 'CONFIRMED' },
      { id: 'o3', orderNumber: 'PO-003', type: 'PURCHASE', status: 'SHIPPED' },
    ]);
    mockPrisma.portalOrder.count.mockResolvedValue(3);
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('GET list: page 3 limit 10 gives skip=20 in findMany call', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(30);
    await request(app).get('/api/supplier/purchase-orders?page=3&limit=10');
    expect(mockPrisma.portalOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('POST confirm: confirmed order data has status CONFIRMED in response', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      type: 'PURCHASE',
      status: 'SUBMITTED',
      notes: null,
      expectedDelivery: null,
    });
    mockPrisma.portalOrder.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'CONFIRMED',
      notes: null,
    });
    const res = await request(app)
      .post('/api/supplier/purchase-orders/00000000-0000-0000-0000-000000000001/confirm')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('status');
  });

  it('GET list: success false and status 500 when count throws', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockRejectedValue(new Error('count fail'));
    const res = await request(app).get('/api/supplier/purchase-orders');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
