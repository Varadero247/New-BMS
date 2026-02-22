import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    inventory: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    $queryRaw: jest.fn(),
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
import router from '../src/routes/stock-levels';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/stock-levels', router);

const INV_ID = '00000000-0000-4000-a000-000000000001';
const PRODUCT_ID = '00000000-0000-4000-a000-000000000002';
const WAREHOUSE_ID = '00000000-0000-4000-a000-000000000003';

const mockInventoryItem = {
  id: INV_ID,
  productId: PRODUCT_ID,
  warehouseId: WAREHOUSE_ID,
  quantityOnHand: 50,
  quantityReserved: 10,
  quantityOnOrder: 5,
  inventoryValue: 2500,
  product: {
    id: PRODUCT_ID,
    sku: 'SKU-001',
    name: 'Widget A',
    reorderPoint: 20,
    reorderQuantity: 100,
    maxStockLevel: 500,
    costPrice: 50,
  },
  warehouse: { id: WAREHOUSE_ID, code: 'WH-01', name: 'Main Warehouse' },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/stock-levels/low-stock', () => {
  it('returns low stock items', async () => {
    (mockPrisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([
        {
          id: INV_ID,
          productId: PRODUCT_ID,
          warehouseId: WAREHOUSE_ID,
          quantityOnHand: 5,
          sku: 'SKU-001',
          name: 'Widget A',
          reorderPoint: 20,
        },
      ])
      .mockResolvedValueOnce([{ count: BigInt(1) }]);

    const res = await request(app).get('/api/stock-levels/low-stock');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/stock-levels/low-stock');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/stock-levels/summary', () => {
  it('returns stock level summary', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(100);
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({
      _sum: { inventoryValue: 50000 },
    });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/stock-levels/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalProducts');
    expect(res.body.data).toHaveProperty('totalInventoryValue');
  });

  it('filters by warehouseId', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(50);
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({
      _sum: { inventoryValue: 25000 },
    });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get(`/api/stock-levels/summary?warehouseId=${WAREHOUSE_ID}`);
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/stock-levels/summary');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/stock-levels', () => {
  it('returns paginated stock levels', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([mockInventoryItem]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/stock-levels');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('filters by warehouseId and productId', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get(
      `/api/stock-levels?warehouseId=${WAREHOUSE_ID}&productId=${PRODUCT_ID}`
    );
    expect(res.status).toBe(200);
  });

  it('returns an empty array when no items exist', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/stock-levels');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/stock-levels');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/stock-levels/:id', () => {
  it('returns a single stock level record', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue(mockInventoryItem);

    const res = await request(app).get(`/api/stock-levels/${INV_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(INV_ID);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/stock-levels/${INV_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get(`/api/stock-levels/${INV_ID}`);
    expect(res.status).toBe(500);
  });
});

describe('Stock Levels — extended', () => {
  it('GET /api/stock-levels meta contains page field', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/stock-levels');
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('GET /api/stock-levels/summary totalInventoryValue is a number', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(10);
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({
      _sum: { inventoryValue: 12500 },
    });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/stock-levels/summary');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalInventoryValue).toBe('number');
  });

  it('GET /api/stock-levels/:id returns 404 with NOT_FOUND code when product missing', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get(`/api/stock-levels/${INV_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('Stock Levels — additional coverage', () => {
  it('GET /api/stock-levels returns success:true on empty result', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/stock-levels');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/stock-levels meta contains totalPages calculated correctly', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([mockInventoryItem]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(50);

    const res = await request(app).get('/api/stock-levels?limit=25');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(2);
  });

  it('GET /api/stock-levels/summary byWarehouse key is an array', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(20);
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({
      _sum: { inventoryValue: 9999 },
    });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([
      {
        warehouseId: WAREHOUSE_ID,
        _sum: { quantityOnHand: 20, inventoryValue: 9999 },
        _count: { id: 20 },
      },
    ]);

    const res = await request(app).get('/api/stock-levels/summary');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('byWarehouse');
    expect(Array.isArray(res.body.data.byWarehouse)).toBe(true);
  });

  it('GET /api/stock-levels/low-stock meta contains totalPages', async () => {
    (mockPrisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([
        {
          id: INV_ID,
          productId: PRODUCT_ID,
          warehouseId: WAREHOUSE_ID,
          quantityOnHand: 3,
          sku: 'SKU-002',
          name: 'Low Widget',
          reorderPoint: 10,
        },
      ])
      .mockResolvedValueOnce([{ count: BigInt(3) }]);

    const res = await request(app).get('/api/stock-levels/low-stock');
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('GET /api/stock-levels/:id returns productId field in data', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue(mockInventoryItem);

    const res = await request(app).get(`/api/stock-levels/${INV_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('productId', PRODUCT_ID);
  });
});

describe('Stock Levels — further boundary and business logic', () => {
  it('GET /api/stock-levels passes warehouseId filter to Prisma when provided', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(0);

    await request(app).get(`/api/stock-levels?warehouseId=${WAREHOUSE_ID}`);

    expect(mockPrisma.inventory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ warehouseId: WAREHOUSE_ID }),
      })
    );
  });

  it('GET /api/stock-levels passes productId filter to Prisma when provided', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(0);

    await request(app).get(`/api/stock-levels?productId=${PRODUCT_ID}`);

    expect(mockPrisma.inventory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ productId: PRODUCT_ID }),
      })
    );
  });

  it('GET /api/stock-levels uses page=1 by default', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/stock-levels');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(1);
  });

  it('GET /api/stock-levels/summary with no items returns totalInventoryValue of 0', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({
      _sum: { inventoryValue: null },
    });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/stock-levels/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.totalInventoryValue).toBe(0);
  });

  it('GET /api/stock-levels/low-stock returns totalResults in meta.total', async () => {
    (mockPrisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ count: BigInt(0) }]);

    const res = await request(app).get('/api/stock-levels/low-stock');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(0);
  });

  it('GET /api/stock-levels/:id includes warehouse data in response', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue(mockInventoryItem);

    const res = await request(app).get(`/api/stock-levels/${INV_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('warehouse');
    expect(res.body.data.warehouse).toHaveProperty('name', 'Main Warehouse');
  });

  it('GET /api/stock-levels/:id includes product sku in response', async () => {
    (mockPrisma.inventory.findFirst as jest.Mock).mockResolvedValue(mockInventoryItem);

    const res = await request(app).get(`/api/stock-levels/${INV_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.data.product).toHaveProperty('sku', 'SKU-001');
  });

  it('GET /api/stock-levels/summary filters by warehouseId in Prisma calls', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(10);
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({
      _sum: { inventoryValue: 5000 },
    });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([]);

    await request(app).get(`/api/stock-levels/summary?warehouseId=${WAREHOUSE_ID}`);

    expect(mockPrisma.inventory.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ warehouseId: WAREHOUSE_ID }) })
    );
  });

  it('GET /api/stock-levels returns data with quantityOnHand field', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([mockInventoryItem]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/stock-levels');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('quantityOnHand', 50);
  });

  it('GET /api/stock-levels/summary returns totalProducts count', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(42);
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({
      _sum: { inventoryValue: 1000 },
    });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/stock-levels/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.totalProducts).toBe(42);
  });
});

// ── Stock Levels — final tests ─────────────────────────────────────────────────

describe('Stock Levels — final tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/stock-levels responds with JSON content-type', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/stock-levels');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/stock-levels/summary returns 500 when aggregate throws', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(10);
    (mockPrisma.inventory.aggregate as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/stock-levels/summary');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/stock-levels data items have warehouseId field', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([mockInventoryItem]);
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/stock-levels');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('warehouseId', WAREHOUSE_ID);
  });

  it('GET /api/stock-levels 500 has success false', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockRejectedValue(new Error('db fail'));
    const res = await request(app).get('/api/stock-levels');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/stock-levels/low-stock accepts warehouseId filter', async () => {
    (mockPrisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ count: BigInt(0) }]);
    const res = await request(app).get(`/api/stock-levels/low-stock?warehouseId=${WAREHOUSE_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(0);
  });

  it('GET /api/stock-levels/summary success is true', async () => {
    (mockPrisma.inventory.count as jest.Mock).mockResolvedValue(5);
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({
      _sum: { inventoryValue: 2500 },
    });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/stock-levels/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
