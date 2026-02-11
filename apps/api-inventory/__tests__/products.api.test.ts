import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    inventory: {
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

import { prisma } from '../src/prisma';
import productsRoutes from '../src/routes/products';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Inventory Products API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/products', productsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    const mockProducts = [
      {
        id: 'prod-1',
        sku: 'SKU001',
        barcode: '1234567890',
        name: 'Widget A',
        status: 'ACTIVE',
        costPrice: 10,
        sellingPrice: 20,
        reorderPoint: 10,
        category: { id: 'cat-1', name: 'Widgets' },
        supplier: { id: 'sup-1', name: 'Acme Corp', code: 'ACME' },
      },
      {
        id: 'prod-2',
        sku: 'SKU002',
        barcode: '0987654321',
        name: 'Widget B',
        status: 'ACTIVE',
        costPrice: 15,
        sellingPrice: 30,
        reorderPoint: 5,
        category: { id: 'cat-1', name: 'Widgets' },
        supplier: { id: 'sup-2', name: 'Beta Inc', code: 'BETA' },
      },
    ];

    it('should return list of products with pagination', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce(mockProducts as any);
      mockPrisma.product.count.mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/products')
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

    it('should support pagination parameters', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([mockProducts[0]] as any);
      mockPrisma.product.count.mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/products?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([]);
      mockPrisma.product.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/products?status=INACTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'INACTIVE',
          }),
        })
      );
    });

    it('should filter by categoryId', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([]);
      mockPrisma.product.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/products?categoryId=cat-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-1',
          }),
        })
      );
    });

    it('should filter by supplierId', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([]);
      mockPrisma.product.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/products?supplierId=sup-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            supplierId: 'sup-1',
          }),
        })
      );
    });

    it('should support search by SKU, barcode, or name', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([]);
      mockPrisma.product.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/products?search=widget')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ sku: expect.any(Object) }),
              expect.objectContaining({ barcode: expect.any(Object) }),
              expect.objectContaining({ name: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should filter low stock products', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce(mockProducts as any);
      mockPrisma.product.count.mockResolvedValueOnce(2);
      mockPrisma.inventory.groupBy.mockResolvedValueOnce([
        { productId: 'prod-1', _sum: { quantityOnHand: 5 } },
        { productId: 'prod-2', _sum: { quantityOnHand: 20 } },
      ] as any);

      const response = await request(app)
        .get('/api/products?lowStock=true')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      // Only prod-1 should be returned (stock 5 <= reorderPoint 10)
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('prod-1');
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/products/low-stock', () => {
    it('should return low stock products', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([
        {
          id: 'prod-1',
          sku: 'SKU001',
          name: 'Widget A',
          reorderPoint: 10,
          reorderQuantity: 50,
          category: { id: 'cat-1', name: 'Widgets' },
          inventoryItems: [{ quantityOnHand: 5, warehouseId: 'wh-1' }],
        },
      ] as any);

      const response = await request(app)
        .get('/api/products/low-stock')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0]).toHaveProperty('deficit');
      expect(response.body.data[0].totalStock).toBe(5);
    });

    it('should only include active products', async () => {
      mockPrisma.product.findMany.mockResolvedValueOnce([]);

      await request(app)
        .get('/api/products/low-stock')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        include: expect.any(Object),
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/products/low-stock')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/products/search', () => {
    it('should find product by SKU', async () => {
      mockPrisma.product.findFirst.mockResolvedValueOnce({
        id: 'prod-1',
        sku: 'SKU001',
        name: 'Widget A',
        category: { id: 'cat-1', name: 'Widgets' },
        supplier: { id: 'sup-1', name: 'Acme' },
        inventoryItems: [],
      } as any);

      const response = await request(app)
        .get('/api/products/search?q=SKU001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sku).toBe('SKU001');
    });

    it('should find product by barcode', async () => {
      mockPrisma.product.findFirst.mockResolvedValueOnce({
        id: 'prod-1',
        sku: 'SKU001',
        barcode: '1234567890',
      } as any);

      const response = await request(app)
        .get('/api/products/search?q=1234567890')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
    });

    it('should return 400 when query is missing', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when product not found', async () => {
      mockPrisma.product.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/products/search?q=NONEXISTENT')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/products/search?q=SKU001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/products/:id', () => {
    const mockProduct = {
      id: 'prod-1',
      sku: 'SKU001',
      name: 'Widget A',
      category: { id: 'cat-1', name: 'Widgets' },
      supplier: { id: 'sup-1', name: 'Acme' },
      inventoryItems: [
        { quantityOnHand: 50, warehouse: { id: 'wh-1', code: 'WH1', name: 'Main' } },
      ],
    };

    it('should return single product with inventory', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(mockProduct as any);

      const response = await request(app)
        .get('/api/products/prod-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('prod-1');
      expect(response.body.data.inventoryItems).toHaveLength(1);
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/products/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/products/prod-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/products', () => {
    const createPayload = {
      sku: 'SKU003',
      name: 'New Widget',
      costPrice: 25,
      sellingPrice: 50,
    };

    it('should create a product successfully', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null); // No duplicate SKU/barcode
      mockPrisma.product.create.mockResolvedValueOnce({
        id: 'new-prod-123',
        ...createPayload,
        status: 'ACTIVE',
        category: null,
        supplier: null,
      } as any);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sku).toBe('SKU003');
    });

    it('should set createdById from authenticated user', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      mockPrisma.product.create.mockResolvedValueOnce({
        id: 'new-prod-123',
        createdById: 'user-123',
      } as any);

      await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          createdById: 'user-123',
          updatedById: 'user-123',
        }),
        include: expect.any(Object),
      });
    });

    it('should return 400 for duplicate SKU', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({ id: 'existing' } as any);

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_SKU');
    });

    it('should return 400 for duplicate barcode', async () => {
      mockPrisma.product.findUnique
        .mockResolvedValueOnce(null) // SKU check
        .mockResolvedValueOnce({ id: 'existing' } as any); // Barcode check

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, barcode: '1234567890' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_BARCODE');
    });

    it('should return 400 for missing SKU', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Widget' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send({ sku: 'SKU003' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for negative price', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, costPrice: -10 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      mockPrisma.product.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PATCH /api/products/:id', () => {
    const existingProduct = {
      id: 'prod-1',
      sku: 'SKU001',
      barcode: '1234567890',
      name: 'Widget A',
      version: 1,
    };

    it('should update product successfully', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(existingProduct as any);
      mockPrisma.product.update.mockResolvedValueOnce({
        ...existingProduct,
        name: 'Updated Widget',
        version: 2,
      } as any);

      const response = await request(app)
        .patch('/api/products/prod-1')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated Widget' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/products/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should support optimistic locking', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({ ...existingProduct, version: 2 } as any);

      const response = await request(app)
        .patch('/api/products/prod-1')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated', version: 1 });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should check for duplicate SKU on change', async () => {
      mockPrisma.product.findUnique
        .mockResolvedValueOnce(existingProduct as any) // Find existing
        .mockResolvedValueOnce({ id: 'other' } as any); // Duplicate check

      const response = await request(app)
        .patch('/api/products/prod-1')
        .set('Authorization', 'Bearer token')
        .send({ sku: 'EXISTING_SKU' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_SKU');
    });

    it('should allow updating status', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(existingProduct as any);
      mockPrisma.product.update.mockResolvedValueOnce({
        ...existingProduct,
        status: 'DISCONTINUED',
      } as any);

      const response = await request(app)
        .patch('/api/products/prod-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'DISCONTINUED' });

      expect(response.status).toBe(200);
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .patch('/api/products/prod-1')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product with no inventory', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'prod-1',
        inventoryItems: [],
      } as any);
      mockPrisma.product.delete.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .delete('/api/products/prod-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent product', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/products/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should prevent deletion if product has inventory', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'prod-1',
        inventoryItems: [{ quantityOnHand: 50 }],
      } as any);

      const response = await request(app)
        .delete('/api/products/prod-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('HAS_INVENTORY');
    });

    it('should allow deletion if inventory is zero', async () => {
      mockPrisma.product.findUnique.mockResolvedValueOnce({
        id: 'prod-1',
        inventoryItems: [{ quantityOnHand: 0 }],
      } as any);
      mockPrisma.product.delete.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .delete('/api/products/prod-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
    });

    it('should handle database errors', async () => {
      mockPrisma.product.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/products/prod-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
