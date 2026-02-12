import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    inventory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    inventoryTransaction: {
      create: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
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

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import inventoryRoutes from '../src/routes/inventory';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Inventory API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/inventory', inventoryRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/inventory', () => {
    const mockInventory = [
      {
        id: 'inv-1',
        productId: '27000000-0000-4000-a000-000000000001',
        warehouseId: '28000000-0000-4000-a000-000000000001',
        quantityOnHand: 100,
        quantityReserved: 10,
        product: { id: '27000000-0000-4000-a000-000000000001', sku: 'SKU001', name: 'Widget A', reorderPoint: 20 },
        warehouse: { id: '28000000-0000-4000-a000-000000000001', code: 'WH1', name: 'Main Warehouse' },
      },
      {
        id: 'inv-2',
        productId: 'prod-2',
        warehouseId: '28000000-0000-4000-a000-000000000001',
        quantityOnHand: 50,
        quantityReserved: 5,
        product: { id: 'prod-2', sku: 'SKU002', name: 'Widget B', reorderPoint: 10 },
        warehouse: { id: '28000000-0000-4000-a000-000000000001', code: 'WH1', name: 'Main Warehouse' },
      },
    ];

    it('should return list of inventory with pagination', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValueOnce(mockInventory);
      (mockPrisma.inventory.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should add quantityAvailable to each item', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValueOnce(mockInventory);
      (mockPrisma.inventory.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer token');

      expect(response.body.data[0].quantityAvailable).toBe(90); // 100 - 10
      expect(response.body.data[1].quantityAvailable).toBe(45); // 50 - 5
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValueOnce([mockInventory[0]]);
      (mockPrisma.inventory.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/inventory?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by warehouseId', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventory.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/inventory?warehouseId=28000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.inventory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            warehouseId: '28000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should filter by productId', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventory.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/inventory?productId=27000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.inventory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            productId: '27000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should order by updatedAt desc', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.inventory.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.inventory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/inventory/availability/:productId', () => {
    it('should return product availability across warehouses', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValueOnce([
        {
          quantityOnHand: 100,
          quantityReserved: 10,
          binLocation: 'A1',
          warehouse: { id: '28000000-0000-4000-a000-000000000001', code: 'WH1', name: 'Main', isActive: true },
        },
        {
          quantityOnHand: 50,
          quantityReserved: 5,
          binLocation: 'B2',
          warehouse: { id: 'wh-2', code: 'WH2', name: 'Secondary', isActive: true },
        },
      ]);
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '27000000-0000-4000-a000-000000000001',
        sku: 'SKU001',
        name: 'Widget A',
        reorderPoint: 20,
      });

      const response = await request(app)
        .get('/api/inventory/availability/27000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalOnHand).toBe(150);
      expect(response.body.data.totalReserved).toBe(15);
      expect(response.body.data.totalAvailable).toBe(135);
      expect(response.body.data.byWarehouse).toHaveLength(2);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff product', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/inventory/availability/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should indicate low stock status', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockResolvedValueOnce([
        {
          quantityOnHand: 5,
          quantityReserved: 0,
          binLocation: 'A1',
          warehouse: { id: '28000000-0000-4000-a000-000000000001', code: 'WH1', name: 'Main', isActive: true },
        },
      ]);
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '27000000-0000-4000-a000-000000000001',
        sku: 'SKU001',
        name: 'Widget A',
        reorderPoint: 20,
      });

      const response = await request(app)
        .get('/api/inventory/availability/27000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.body.data.isLowStock).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.inventory.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/inventory/availability/27000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/inventory/adjust', () => {
    const adjustPayload = {
      productId: '27000000-0000-4000-a000-000000000001',
      warehouseId: '28000000-0000-4000-a000-000000000001',
      adjustmentType: 'ADJUSTMENT_IN',
      quantity: 25,
      reason: 'Physical count adjustment',
    };

    it('should create stock adjustment successfully (existing inventory)', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'inv-1',
        quantityOnHand: 100,
        binLocation: 'A1',
        lastCountedAt: null,
      });
      (mockPrisma.inventory.update as jest.Mock).mockResolvedValueOnce({
        id: 'inv-1',
        quantityOnHand: 125,
      });
      (mockPrisma.inventoryTransaction.create as jest.Mock).mockResolvedValueOnce({
        id: '29000000-0000-4000-a000-000000000001',
        quantityBefore: 100,
        quantityAfter: 125,
        quantityChange: 25,
      });

      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', 'Bearer token')
        .send(adjustPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inventory).toBeDefined();
      expect(response.body.data.transaction).toBeDefined();
    });

    it('should create new inventory record if not exists', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.inventory.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        quantityOnHand: 25,
      });
      (mockPrisma.inventoryTransaction.create as jest.Mock).mockResolvedValueOnce({
        id: '29000000-0000-4000-a000-000000000001',
      });

      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', 'Bearer token')
        .send(adjustPayload);

      expect(response.status).toBe(201);
      expect(mockPrisma.inventory.create).toHaveBeenCalled();
    });

    it('should reject insufficient stock for ADJUSTMENT_OUT', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'inv-1',
        quantityOnHand: 5,
      });

      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', 'Bearer token')
        .send({
          ...adjustPayload,
          adjustmentType: 'ADJUSTMENT_OUT',
          quantity: 10,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', 'Bearer token')
        .send({ productId: '27000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid adjustmentType', async () => {
      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', 'Bearer token')
        .send({ ...adjustPayload, adjustmentType: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', 'Bearer token')
        .send(adjustPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/inventory/transfer', () => {
    const transferPayload = {
      productId: '27000000-0000-4000-a000-000000000001',
      fromWarehouseId: '28000000-0000-4000-a000-000000000001',
      toWarehouseId: 'wh-2',
      quantity: 20,
    };

    it('should transfer stock successfully', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'inv-1', quantityOnHand: 100, averageCost: 10, lastCost: 10 }) // Source
        .mockResolvedValueOnce({ id: 'inv-2', quantityOnHand: 50, binLocation: 'B1' }); // Destination

      const txResult = {
        updatedSource: { id: 'inv-1', quantityOnHand: 80 },
        updatedDest: { id: 'inv-2', quantityOnHand: 70 },
        transferOut: { id: 'txn-out' },
        transferIn: { id: 'txn-in' },
      };
      (mockPrisma.$transaction as jest.Mock).mockResolvedValueOnce(txResult);

      const response = await request(app)
        .post('/api/inventory/transfer')
        .set('Authorization', 'Bearer token')
        .send(transferPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.source).toBeDefined();
      expect(response.body.data.destination).toBeDefined();
      expect(response.body.data.transactions).toHaveLength(2);
    });

    it('should reject same warehouse transfer', async () => {
      const response = await request(app)
        .post('/api/inventory/transfer')
        .set('Authorization', 'Bearer token')
        .send({ ...transferPayload, toWarehouseId: '28000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('SAME_WAREHOUSE');
    });

    it('should reject insufficient stock in source', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'inv-1',
        quantityOnHand: 5,
      });

      const response = await request(app)
        .post('/api/inventory/transfer')
        .set('Authorization', 'Bearer token')
        .send(transferPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should reject when source inventory not found', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/inventory/transfer')
        .set('Authorization', 'Bearer token')
        .send(transferPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/inventory/transfer')
        .set('Authorization', 'Bearer token')
        .send({ productId: '27000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/inventory/transfer')
        .set('Authorization', 'Bearer token')
        .send(transferPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/inventory/receive', () => {
    const receivePayload = {
      productId: '27000000-0000-4000-a000-000000000001',
      warehouseId: '28000000-0000-4000-a000-000000000001',
      quantity: 50,
      unitCost: 10,
    };

    it('should receive goods successfully (existing inventory)', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'inv-1',
        quantityOnHand: 100,
        averageCost: 8,
        binLocation: 'A1',
      });
      (mockPrisma.inventory.update as jest.Mock).mockResolvedValueOnce({
        id: 'inv-1',
        quantityOnHand: 150,
      });
      (mockPrisma.inventoryTransaction.create as jest.Mock).mockResolvedValueOnce({
        id: '29000000-0000-4000-a000-000000000001',
        transactionType: 'RECEIPT',
      });

      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Authorization', 'Bearer token')
        .send(receivePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inventory).toBeDefined();
      expect(response.body.data.transaction).toBeDefined();
    });

    it('should create new inventory if not exists', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.inventory.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        quantityOnHand: 50,
      });
      (mockPrisma.inventoryTransaction.create as jest.Mock).mockResolvedValueOnce({
        id: '29000000-0000-4000-a000-000000000001',
      });

      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Authorization', 'Bearer token')
        .send(receivePayload);

      expect(response.status).toBe(201);
      expect(mockPrisma.inventory.create).toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Authorization', 'Bearer token')
        .send({ productId: '27000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/inventory/receive')
        .set('Authorization', 'Bearer token')
        .send(receivePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/inventory/issue', () => {
    const issuePayload = {
      productId: '27000000-0000-4000-a000-000000000001',
      warehouseId: '28000000-0000-4000-a000-000000000001',
      quantity: 20,
    };

    it('should issue goods successfully', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'inv-1',
        quantityOnHand: 100,
        quantityReserved: 10,
        averageCost: 8,
      });
      (mockPrisma.inventory.update as jest.Mock).mockResolvedValueOnce({
        id: 'inv-1',
        quantityOnHand: 80,
      });
      (mockPrisma.inventoryTransaction.create as jest.Mock).mockResolvedValueOnce({
        id: '29000000-0000-4000-a000-000000000001',
        transactionType: 'ISSUE',
      });

      const response = await request(app)
        .post('/api/inventory/issue')
        .set('Authorization', 'Bearer token')
        .send(issuePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inventory).toBeDefined();
      expect(response.body.data.transaction).toBeDefined();
    });

    it('should reject when no inventory record exists', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/inventory/issue')
        .set('Authorization', 'Bearer token')
        .send(issuePayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('NO_INVENTORY');
    });

    it('should reject insufficient available stock', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'inv-1',
        quantityOnHand: 25,
        quantityReserved: 20, // Available = 5
        averageCost: 8,
      });

      const response = await request(app)
        .post('/api/inventory/issue')
        .set('Authorization', 'Bearer token')
        .send(issuePayload); // Requesting 20, only 5 available

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/inventory/issue')
        .set('Authorization', 'Bearer token')
        .send({ productId: '27000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.inventory.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/inventory/issue')
        .set('Authorization', 'Bearer token')
        .send(issuePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
