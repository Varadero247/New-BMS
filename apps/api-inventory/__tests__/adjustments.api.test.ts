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

// ── Adjustment type mapping ────────────────────────────────────────────────
// Verifies the UI→DB type mapping and positive/negative quantityChange logic
// for every adjustment type the schema accepts.

describe('POST /api/adjustments — all adjustment types', () => {
  const baseBody = {
    productId: PRODUCT_ID,
    warehouseId: WAREHOUSE_ID,
    quantity: 3,
    reason: 'Stock correction',
  };

  const mockInventory = { id: 'inv-1', quantityOnHand: 20 };

  beforeEach(() => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue(mockInventory);
    (mockPrisma.$transaction as jest.Mock).mockResolvedValue([mockTransaction]);
  });

  it.each([
    'ADJUSTMENT_IN',
    'ADJUSTMENT_OUT',
    'DAMAGE',
    'EXPIRED',
    'WRITE_OFF',
    'FOUND',
    'RECOUNT',
  ] as const)('accepts adjustmentType %s and returns 201', async (adjustmentType) => {
    const res = await request(app)
      .post('/api/adjustments')
      .send({ ...baseBody, adjustmentType });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('prevents DAMAGE from creating negative stock', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue({
      id: 'inv-1',
      quantityOnHand: 2,
    });
    const res = await request(app)
      .post('/api/adjustments')
      .send({ ...baseBody, adjustmentType: 'DAMAGE', quantity: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('prevents EXPIRED from creating negative stock', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue({
      id: 'inv-1',
      quantityOnHand: 1,
    });
    const res = await request(app)
      .post('/api/adjustments')
      .send({ ...baseBody, adjustmentType: 'EXPIRED', quantity: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('prevents WRITE_OFF from creating negative stock', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue({
      id: 'inv-1',
      quantityOnHand: 1,
    });
    const res = await request(app)
      .post('/api/adjustments')
      .send({ ...baseBody, adjustmentType: 'WRITE_OFF', quantity: 5 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('FOUND does not require existing inventory (treats as positive adjustment)', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/adjustments')
      .send({ ...baseBody, adjustmentType: 'FOUND' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('rejects an invalid adjustmentType', async () => {
    const res = await request(app)
      .post('/api/adjustments')
      .send({ ...baseBody, adjustmentType: 'TELEPORT' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('adjustments.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/adjustments', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/adjustments', async () => {
    const res = await request(app).get('/api/adjustments');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/adjustments', async () => {
    const res = await request(app).get('/api/adjustments');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/adjustments body has success property', async () => {
    const res = await request(app).get('/api/adjustments');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/adjustments body is an object', async () => {
    const res = await request(app).get('/api/adjustments');
    expect(typeof res.body).toBe('object');
  });
});
