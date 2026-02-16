import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    inventory: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    inventoryTransaction: {
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
import router from '../src/routes/reports';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/reports', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/reports/valuation', () => {
  it('returns inventory valuation report', async () => {
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({
      _sum: { quantityOnHand: 1000, inventoryValue: 50000 },
      _count: { id: 100 },
    });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/reports/valuation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data).toHaveProperty('byWarehouse');
    expect(res.body.data).toHaveProperty('topValueItems');
  });

  it('filters by warehouseId', async () => {
    (mockPrisma.inventory.aggregate as jest.Mock).mockResolvedValue({ _sum: { quantityOnHand: 100, inventoryValue: 1000 }, _count: { id: 10 } });
    (mockPrisma.inventory.groupBy as jest.Mock).mockResolvedValue([]);
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/reports/valuation?warehouseId=wh-1');
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventory.aggregate as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/reports/valuation');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/reports/movement', () => {
  it('returns stock movement report', async () => {
    (mockPrisma.inventoryTransaction.groupBy as jest.Mock).mockResolvedValue([]);
    (mockPrisma.$queryRaw as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/reports/movement');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('period');
    expect(res.body.data).toHaveProperty('byType');
  });

  it('accepts date range parameters', async () => {
    (mockPrisma.inventoryTransaction.groupBy as jest.Mock).mockResolvedValue([]);
    (mockPrisma.$queryRaw as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/reports/movement?startDate=2026-01-01&endDate=2026-01-31');
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventoryTransaction.groupBy as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/reports/movement');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/reports/ageing', () => {
  it('returns stock ageing report', async () => {
    const mockItems = [
      {
        id: 'inv-1',
        inventoryValue: 1000,
        lastReceivedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        product: { sku: 'SKU-001', name: 'Widget A' },
        warehouse: { code: 'WH-01', name: 'Main' },
      },
    ];
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue(mockItems);

    const res = await request(app).get('/api/reports/ageing');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('buckets');
  });

  it('handles items with null lastReceivedAt', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValue([
      { id: 'inv-1', inventoryValue: 500, lastReceivedAt: null, product: { sku: 'SKU-002', name: 'Widget B' }, warehouse: { code: 'WH-01', name: 'Main' } },
    ]);

    const res = await request(app).get('/api/reports/ageing');
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventory.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/reports/ageing');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/reports/turnover', () => {
  it('returns inventory turnover report', async () => {
    (mockPrisma.inventoryTransaction.groupBy as jest.Mock).mockResolvedValue([
      { productId: 'prod-1', _sum: { totalCost: 5000, quantityChange: -100 } },
    ]);

    const res = await request(app).get('/api/reports/turnover');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('period');
    expect(res.body.data).toHaveProperty('products');
  });

  it('accepts custom date range', async () => {
    (mockPrisma.inventoryTransaction.groupBy as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/reports/turnover?startDate=2025-01-01&endDate=2026-01-01');
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.inventoryTransaction.groupBy as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/reports/turnover');
    expect(res.status).toBe(500);
  });
});
