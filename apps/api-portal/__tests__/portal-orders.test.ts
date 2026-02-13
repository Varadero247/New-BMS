import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalOrder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
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

import portalOrdersRouter from '../src/routes/portal-orders';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/portal/orders', portalOrdersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/orders', () => {
  it('should list orders', async () => {
    const items = [{ id: 'o-1', orderNumber: 'PTL-ORD-2602-1234', type: 'PURCHASE', status: 'DRAFT' }];
    (prisma as any).portalOrder.findMany.mockResolvedValue(items);
    (prisma as any).portalOrder.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/orders');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status and type', async () => {
    (prisma as any).portalOrder.findMany.mockResolvedValue([]);
    (prisma as any).portalOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/orders?status=CONFIRMED&type=PURCHASE');

    expect(res.status).toBe(200);
    expect((prisma as any).portalOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'CONFIRMED', type: 'PURCHASE' }) })
    );
  });

  it('should handle server error', async () => {
    (prisma as any).portalOrder.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/orders');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/orders', () => {
  it('should create an order', async () => {
    const order = { id: 'o-1', orderNumber: 'PTL-ORD-2602-1234', type: 'PURCHASE', status: 'DRAFT' };
    (prisma as any).portalOrder.create.mockResolvedValue(order);

    const res = await request(app)
      .post('/api/portal/orders')
      .send({
        portalUserId: '00000000-0000-0000-0000-000000000001',
        type: 'PURCHASE',
        totalAmount: 5000,
        items: [{ name: 'Widget', qty: 10, price: 500 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing portalUserId', async () => {
    const res = await request(app)
      .post('/api/portal/orders')
      .send({ type: 'PURCHASE', totalAmount: 5000, items: [], portalUserId: 'not-a-uuid' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for negative amount', async () => {
    const res = await request(app)
      .post('/api/portal/orders')
      .send({ portalUserId: '00000000-0000-0000-0000-000000000001', type: 'PURCHASE', totalAmount: -100, items: [] });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/portal/orders/:id', () => {
  it('should return an order', async () => {
    (prisma as any).portalOrder.findFirst.mockResolvedValue({ id: 'o-1', orderNumber: 'PTL-ORD-2602-1234' });

    const res = await request(app).get('/api/portal/orders/o-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('o-1');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/portal/orders/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/orders/:id', () => {
  it('should update an order', async () => {
    (prisma as any).portalOrder.findFirst.mockResolvedValue({ id: 'o-1' });
    (prisma as any).portalOrder.update.mockResolvedValue({ id: 'o-1', notes: 'Updated' });

    const res = await request(app)
      .put('/api/portal/orders/o-1')
      .send({ notes: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for update if not found', async () => {
    (prisma as any).portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/orders/nonexistent')
      .send({ notes: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/orders/:id/status', () => {
  it('should update order status', async () => {
    (prisma as any).portalOrder.findFirst.mockResolvedValue({ id: 'o-1' });
    (prisma as any).portalOrder.update.mockResolvedValue({ id: 'o-1', status: 'SHIPPED' });

    const res = await request(app)
      .put('/api/portal/orders/o-1/status')
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(200);
  });

  it('should return 400 for invalid status', async () => {
    const res = await request(app)
      .put('/api/portal/orders/o-1/status')
      .send({ status: 'INVALID' });

    expect(res.status).toBe(400);
  });

  it('should return 404 if order not found for status update', async () => {
    (prisma as any).portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/orders/o-1/status')
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(404);
  });
});
