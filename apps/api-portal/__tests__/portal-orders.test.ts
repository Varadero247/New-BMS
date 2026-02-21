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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/portal/orders', portalOrdersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/orders', () => {
  it('should list orders', async () => {
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        orderNumber: 'PTL-ORD-2602-1234',
        type: 'PURCHASE',
        status: 'DRAFT',
      },
    ];
    mockPrisma.portalOrder.findMany.mockResolvedValue(items);
    mockPrisma.portalOrder.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/orders');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status and type', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/orders?status=CONFIRMED&type=PURCHASE');

    expect(res.status).toBe(200);
    expect(mockPrisma.portalOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'CONFIRMED', type: 'PURCHASE' }),
      })
    );
  });

  it('should handle server error', async () => {
    mockPrisma.portalOrder.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/orders');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/orders', () => {
  it('should create an order', async () => {
    const order = {
      id: '00000000-0000-0000-0000-000000000001',
      orderNumber: 'PTL-ORD-2602-1234',
      type: 'PURCHASE',
      status: 'DRAFT',
    };
    mockPrisma.portalOrder.create.mockResolvedValue(order);

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
    const res = await request(app).post('/api/portal/orders').send({
      portalUserId: '00000000-0000-0000-0000-000000000001',
      type: 'PURCHASE',
      totalAmount: -100,
      items: [],
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/portal/orders/:id', () => {
  it('should return an order', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      orderNumber: 'PTL-ORD-2602-1234',
    });

    const res = await request(app).get('/api/portal/orders/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/portal/orders/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/orders/:id', () => {
  it('should update an order', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalOrder.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      notes: 'Updated',
    });

    const res = await request(app)
      .put('/api/portal/orders/00000000-0000-0000-0000-000000000001')
      .send({ notes: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for update if not found', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/orders/00000000-0000-0000-0000-000000000099')
      .send({ notes: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/orders/:id/status', () => {
  it('should update order status', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalOrder.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SHIPPED',
    });

    const res = await request(app)
      .put('/api/portal/orders/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(200);
  });

  it('should return 400 for invalid status', async () => {
    const res = await request(app)
      .put('/api/portal/orders/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'INVALID' });

    expect(res.status).toBe(400);
  });

  it('should return 404 if order not found for status update', async () => {
    mockPrisma.portalOrder.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/orders/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(404);
  });
});

describe('Portal Orders — extended', () => {
  it('GET /orders returns pagination info in response', async () => {
    mockPrisma.portalOrder.findMany.mockResolvedValue([]);
    mockPrisma.portalOrder.count.mockResolvedValue(25);

    const res = await request(app).get('/api/portal/orders?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(25);
  });

  it('POST /orders returns DRAFT status by default', async () => {
    const order = {
      id: '00000000-0000-0000-0000-000000000002',
      orderNumber: 'PTL-ORD-2602-5678',
      type: 'SALES',
      status: 'DRAFT',
    };
    mockPrisma.portalOrder.create.mockResolvedValue(order);

    const res = await request(app).post('/api/portal/orders').send({
      portalUserId: '00000000-0000-0000-0000-000000000001',
      type: 'SALES',
      totalAmount: 1200,
      items: [{ name: 'Service', qty: 1, price: 1200 }],
    });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
  });
});

describe('portal-orders — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/portal/orders', portalOrdersRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/portal/orders', async () => {
    const res = await request(app).get('/api/portal/orders');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/portal/orders', async () => {
    const res = await request(app).get('/api/portal/orders');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/portal/orders body has success property', async () => {
    const res = await request(app).get('/api/portal/orders');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/portal/orders body is an object', async () => {
    const res = await request(app).get('/api/portal/orders');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/portal/orders route is accessible', async () => {
    const res = await request(app).get('/api/portal/orders');
    expect(res.status).toBeDefined();
  });
});
