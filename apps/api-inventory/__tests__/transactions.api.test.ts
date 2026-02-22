import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    inventoryTransaction: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import transactionsRoutes from '../src/routes/transactions';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Inventory Transactions API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/inventory/transactions', transactionsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/inventory/transactions', () => {
    const mockTransactions = [
      {
        id: '29000000-0000-4000-a000-000000000001',
        productId: '27000000-0000-4000-a000-000000000001',
        warehouseId: '28000000-0000-4000-a000-000000000001',
        transactionType: 'RECEIPT',
        referenceNumber: 'RCV-001',
        quantityBefore: 100,
        quantityAfter: 150,
        quantityChange: 50,
        transactionDate: '2024-01-15T10:00:00Z',
        product: { id: '27000000-0000-4000-a000-000000000001', sku: 'SKU001', name: 'Widget A' },
        warehouse: {
          id: '28000000-0000-4000-a000-000000000001',
          code: 'WH1',
          name: 'Main Warehouse',
        },
        fromWarehouse: null,
      },
      {
        id: 'txn-2',
        productId: 'prod-2',
        warehouseId: '28000000-0000-4000-a000-000000000001',
        transactionType: 'ISSUE',
        referenceNumber: 'ISS-001',
        quantityBefore: 50,
        quantityAfter: 30,
        quantityChange: -20,
        transactionDate: '2024-01-15T12:00:00Z',
        product: { id: 'prod-2', sku: 'SKU002', name: 'Widget B' },
        warehouse: {
          id: '28000000-0000-4000-a000-000000000001',
          code: 'WH1',
          name: 'Main Warehouse',
        },
        fromWarehouse: null,
      },
    ];

    it('should return list of transactions with pagination', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce(
        mockTransactions
      );
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/inventory/transactions')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([
        mockTransactions[0],
      ]);
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(200);

      const response = await request(app)
        .get('/api/inventory/transactions?page=3&limit=25')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(25);
      expect(response.body.meta.totalPages).toBe(8);
    });

    it('should filter by productId', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/inventory/transactions?productId=27000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.inventoryTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            productId: '27000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by warehouseId', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/inventory/transactions?warehouseId=28000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.inventoryTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            warehouseId: '28000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by transactionType', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/inventory/transactions?transactionType=RECEIPT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.inventoryTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            transactionType: 'RECEIPT',
          }),
        })
      );
    });

    it('should filter by referenceType', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/inventory/transactions?referenceType=TRANSFER')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.inventoryTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            referenceType: 'TRANSFER',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/inventory/transactions?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.inventoryTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            transactionDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should order by transactionDate desc', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/inventory/transactions').set('Authorization', 'Bearer token');

      expect(mockPrisma.inventoryTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { transactionDate: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/inventory/transactions')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/inventory/transactions/product/:productId', () => {
    it('should return transaction history for a product', async () => {
      const mockTxns = [
        {
          id: '29000000-0000-4000-a000-000000000001',
          transactionType: 'RECEIPT',
          quantityChange: 50,
        },
      ];
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce(mockTxns);
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(1);
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '27000000-0000-4000-a000-000000000001',
        sku: 'SKU001',
        name: 'Widget A',
      });

      const response = await request(app)
        .get('/api/inventory/transactions/product/27000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.id).toBe('27000000-0000-4000-a000-000000000001');
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff product', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/inventory/transactions/product/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/inventory/transactions/product/27000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/inventory/transactions/:id', () => {
    const mockTransaction = {
      id: '29000000-0000-4000-a000-000000000001',
      productId: '27000000-0000-4000-a000-000000000001',
      warehouseId: '28000000-0000-4000-a000-000000000001',
      transactionType: 'RECEIPT',
      referenceNumber: 'RCV-001',
      quantityBefore: 100,
      quantityAfter: 150,
      quantityChange: 50,
      product: {
        id: '27000000-0000-4000-a000-000000000001',
        sku: 'SKU001',
        name: 'Widget A',
        barcode: '123456',
      },
      warehouse: {
        id: '28000000-0000-4000-a000-000000000001',
        code: 'WH1',
        name: 'Main Warehouse',
      },
      fromWarehouse: null,
    };

    it('should return single transaction', async () => {
      (mockPrisma.inventoryTransaction.findUnique as jest.Mock).mockResolvedValueOnce(
        mockTransaction
      );

      const response = await request(app)
        .get('/api/inventory/transactions/29000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('29000000-0000-4000-a000-000000000001');
      expect(response.body.data.transactionType).toBe('RECEIPT');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff transaction', async () => {
      (mockPrisma.inventoryTransaction.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/inventory/transactions/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.inventoryTransaction.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/inventory/transactions/29000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Inventory Transactions — additional coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/inventory/transactions', transactionsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/inventory/transactions returns success:true on empty list', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);

    const res = await request(app).get('/api/inventory/transactions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/inventory/transactions meta.totalPages is calculated from total and limit', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(100);

    const res = await request(app).get('/api/inventory/transactions?page=1&limit=20');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(5);
  });

  it('GET /api/inventory/transactions/:id data contains transactionType field', async () => {
    (mockPrisma.inventoryTransaction.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '29000000-0000-4000-a000-000000000001',
      transactionType: 'ISSUE',
      quantityChange: -20,
      product: { id: '27000000-0000-4000-a000-000000000001', sku: 'SKU001', name: 'Widget A', barcode: null },
      warehouse: { id: '28000000-0000-4000-a000-000000000001', code: 'WH1', name: 'Main Warehouse' },
      fromWarehouse: null,
    });

    const res = await request(app).get('/api/inventory/transactions/29000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('transactionType', 'ISSUE');
  });

  it('GET /api/inventory/transactions/product/:productId returns data.transactions as array', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.product.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '27000000-0000-4000-a000-000000000001',
      sku: 'SKU001',
      name: 'Widget A',
    });

    const res = await request(app).get(
      '/api/inventory/transactions/product/27000000-0000-4000-a000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.transactions)).toBe(true);
  });

  it('GET /api/inventory/transactions/product/:productId meta has page and limit', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(10);
    (mockPrisma.product.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '27000000-0000-4000-a000-000000000001',
      sku: 'SKU001',
      name: 'Widget A',
    });

    const res = await request(app).get(
      '/api/inventory/transactions/product/27000000-0000-4000-a000-000000000001?page=1&limit=50'
    );
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty('page', 1);
    expect(res.body.meta).toHaveProperty('limit', 50);
    expect(res.body.meta).toHaveProperty('total', 10);
  });
});

describe('Inventory Transactions — edge cases and deeper coverage', () => {
  let localApp: express.Express;

  beforeAll(() => {
    localApp = express();
    localApp.use(express.json());
    localApp.use('/api/inventory/transactions', transactionsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/inventory/transactions responds with JSON content-type', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(localApp).get('/api/inventory/transactions');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/inventory/transactions meta has totalPages field', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(localApp).get('/api/inventory/transactions');
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('GET /api/inventory/transactions filters by performedById', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
    const uid = '20000000-0000-4000-a000-000000000123';
    await request(localApp).get(`/api/inventory/transactions?performedById=${uid}`);
    expect(mockPrisma.inventoryTransaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ performedById: uid }),
      })
    );
  });

  it('GET /api/inventory/transactions 500 has INTERNAL_ERROR code', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockRejectedValueOnce(
      new Error('crash')
    );
    const res = await request(localApp).get('/api/inventory/transactions');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/inventory/transactions/:id 404 has NOT_FOUND code', async () => {
    (mockPrisma.inventoryTransaction.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(localApp).get(
      '/api/inventory/transactions/00000000-0000-4000-a000-ffffffffffff'
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/inventory/transactions/:id 500 has INTERNAL_ERROR code', async () => {
    (mockPrisma.inventoryTransaction.findUnique as jest.Mock).mockRejectedValueOnce(
      new Error('timeout')
    );
    const res = await request(localApp).get(
      '/api/inventory/transactions/29000000-0000-4000-a000-000000000001'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/inventory/transactions/product/:productId 500 has INTERNAL_ERROR code', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockRejectedValueOnce(
      new Error('db error')
    );
    const res = await request(localApp).get(
      '/api/inventory/transactions/product/27000000-0000-4000-a000-000000000001'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/inventory/transactions with page=2&limit=10 has totalPages calculated correctly', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(50);
    const res = await request(localApp).get('/api/inventory/transactions?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(5);
  });
});

// ── Inventory Transactions — final tests ──────────────────────────────────────

describe('Inventory Transactions — final tests', () => {
  let finalApp: express.Express;

  beforeAll(() => {
    finalApp = express();
    finalApp.use(express.json());
    finalApp.use('/api/inventory/transactions', transactionsRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET /api/inventory/transactions success:true on success', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(finalApp).get('/api/inventory/transactions');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/inventory/transactions responds with JSON content-type', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(finalApp).get('/api/inventory/transactions');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/inventory/transactions data is an array', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(finalApp).get('/api/inventory/transactions');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/inventory/transactions/:id returns product nested data', async () => {
    (mockPrisma.inventoryTransaction.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '29000000-0000-4000-a000-000000000001',
      transactionType: 'RECEIPT',
      quantityChange: 50,
      product: { id: '27000000-0000-4000-a000-000000000001', sku: 'SKU001', name: 'Widget A', barcode: null },
      warehouse: { id: '28000000-0000-4000-a000-000000000001', code: 'WH1', name: 'Main Warehouse' },
      fromWarehouse: null,
    });
    const res = await request(finalApp).get('/api/inventory/transactions/29000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.product).toHaveProperty('sku', 'SKU001');
  });

  it('GET /api/inventory/transactions/:id returns warehouse nested data', async () => {
    (mockPrisma.inventoryTransaction.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '29000000-0000-4000-a000-000000000001',
      transactionType: 'RECEIPT',
      quantityChange: 50,
      product: { id: '27000000-0000-4000-a000-000000000001', sku: 'SKU001', name: 'Widget A', barcode: null },
      warehouse: { id: '28000000-0000-4000-a000-000000000001', code: 'WH1', name: 'Main Warehouse' },
      fromWarehouse: null,
    });
    const res = await request(finalApp).get('/api/inventory/transactions/29000000-0000-4000-a000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.warehouse).toHaveProperty('code', 'WH1');
  });

  it('GET /api/inventory/transactions/product/:productId meta has totalPages', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.product.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '27000000-0000-4000-a000-000000000001',
      sku: 'SKU001',
      name: 'Widget A',
    });
    const res = await request(finalApp).get(
      '/api/inventory/transactions/product/27000000-0000-4000-a000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('GET /api/inventory/transactions meta has limit defaulting to 50', async () => {
    (mockPrisma.inventoryTransaction.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.inventoryTransaction.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(finalApp).get('/api/inventory/transactions');
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(50);
  });
});
