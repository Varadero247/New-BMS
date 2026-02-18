import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    inventory: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    inventoryTransaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
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
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { prisma } from '../src/prisma';
import router from '../src/routes/adjustments';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/adjustments', router);

const ADJ_ID = '00000000-0000-4000-a000-000000000001';
const PRODUCT_ID = '00000000-0000-4000-a000-000000000002';
const WAREHOUSE_ID = '00000000-0000-4000-a000-000000000003';

const mockTransaction = {
  id: ADJ_ID,
  productId: PRODUCT_ID,
  warehouseId: WAREHOUSE_ID,
  transactionType: 'ADJUSTMENT_IN',
  referenceType: 'ADJUSTMENT',
  quantityBefore: 10,
  quantityAfter: 15,
  quantityChange: 5,
  reason: 'Stock count correction',
  performedById: 'user-1',
  transactionDate: new Date(),
  product: { id: PRODUCT_ID, sku: 'SKU-001', name: 'Widget A' },
  warehouse: { id: WAREHOUSE_ID, code: 'WH-01', name: 'Main Warehouse' },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/adjustments', () => {
  it('returns list of adjustments with meta', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValue([mockTransaction]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/adjustments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('filters by productId and warehouseId', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get(
      `/api/adjustments?productId=${PRODUCT_ID}&warehouseId=${WAREHOUSE_ID}`
    );
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/adjustments');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/adjustments', () => {
  const validBody = {
    productId: PRODUCT_ID,
    warehouseId: WAREHOUSE_ID,
    adjustmentType: 'ADJUSTMENT_IN',
    quantity: 5,
    reason: 'Stock count correction',
  };

  it('creates adjustment successfully when inventory exists', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue({
      id: 'inv-1',
      quantityOnHand: 10,
    });
    (mockPrisma.$transaction as jest.Mock).mockResolvedValue([mockTransaction]);

    const res = await request(app).post('/api/adjustments').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('creates adjustment when no inventory record exists', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue(null);
    (mockPrisma.$transaction as jest.Mock).mockResolvedValue([mockTransaction]);

    const res = await request(app).post('/api/adjustments').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when ADJUSTMENT_OUT would create negative stock', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue({
      id: 'inv-1',
      quantityOnHand: 2,
    });

    const res = await request(app)
      .post('/api/adjustments')
      .send({ ...validBody, adjustmentType: 'ADJUSTMENT_OUT', quantity: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('returns 400 on validation error', async () => {
    const res = await request(app).post('/api/adjustments').send({ productId: PRODUCT_ID });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue({
      id: 'inv-1',
      quantityOnHand: 10,
    });
    (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/api/adjustments').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('GET /api/adjustments/:id', () => {
  it('returns a single adjustment', async () => {
    (mockPrisma.inventoryTransaction.findFirst as jest.Mock).mockResolvedValue(mockTransaction);

    const res = await request(app).get(`/api/adjustments/${ADJ_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(ADJ_ID);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.inventoryTransaction.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/adjustments/${ADJ_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventoryTransaction.findFirst as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get(`/api/adjustments/${ADJ_ID}`);
    expect(res.status).toBe(500);
  });
});
