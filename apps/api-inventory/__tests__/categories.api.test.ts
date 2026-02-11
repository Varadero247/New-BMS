import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    productCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '../src/prisma';
import categoriesRoutes from '../src/routes/categories';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Inventory Categories API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/categories', categoriesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'Electronics',
        description: 'Electronic components',
        parentId: null,
        code: 'ELEC',
        sortOrder: 0,
        isActive: true,
        _count: { products: 5 },
      },
      {
        id: 'cat-2',
        name: 'Resistors',
        description: 'Resistor components',
        parentId: 'cat-1',
        code: 'RES',
        sortOrder: 1,
        isActive: true,
        _count: { products: 3 },
      },
    ];

    it('should return hierarchical list of categories', async () => {
      (mockPrisma.productCategory.findMany as jest.Mock).mockResolvedValueOnce(mockCategories);

      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1); // Only root categories
      expect(response.body.data[0].children).toHaveLength(1);
    });

    it('should return flat list when flat=true', async () => {
      (mockPrisma.productCategory.findMany as jest.Mock).mockResolvedValueOnce(mockCategories);

      const response = await request(app)
        .get('/api/categories?flat=true')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by isActive', async () => {
      (mockPrisma.productCategory.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/categories?isActive=true')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.productCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should order by parentId, sortOrder, name', async () => {
      (mockPrisma.productCategory.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/categories')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.productCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.productCategory.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/categories/:id', () => {
    const mockCategory = {
      id: 'cat-1',
      name: 'Electronics',
      description: 'Electronic components',
      parent: null,
      children: [{ id: 'cat-2', name: 'Resistors', code: 'RES' }],
      products: [{ id: 'prod-1', sku: 'SKU001', name: 'Resistor 10k', status: 'ACTIVE' }],
      _count: { products: 5 },
    };

    it('should return single category with includes', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce(mockCategory);

      const response = await request(app)
        .get('/api/categories/cat-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('cat-1');
      expect(response.body.data.children).toHaveLength(1);
    });

    it('should return 404 for non-existent category', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/categories/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/categories/cat-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/categories', () => {
    const createPayload = {
      name: 'New Category',
      description: 'A new category',
      code: 'NEW',
    };

    it('should create a category successfully', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValue(null); // No duplicate code
      (mockPrisma.productCategory.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        ...createPayload,
        isActive: true,
        parent: null,
      });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Category');
    });

    it('should validate parent exists if parentId provided', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce(null); // Parent not found

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, parentId: 'non-existent-parent' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_PARENT');
    });

    it('should reject duplicate code', async () => {
      // No parent lookup needed (no parentId), but code check returns existing
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing' });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_CODE');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer token')
        .send({ description: 'No name' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.productCategory.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PATCH /api/categories/:id', () => {
    const existingCategory = {
      id: 'cat-1',
      name: 'Electronics',
      code: 'ELEC',
      parentId: null,
    };

    it('should update category successfully', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce(existingCategory);
      (mockPrisma.productCategory.update as jest.Mock).mockResolvedValueOnce({
        ...existingCategory,
        name: 'Updated Electronics',
        parent: null,
      });

      const response = await request(app)
        .patch('/api/categories/cat-1')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated Electronics' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/categories/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should prevent circular reference (self-parent)', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce(existingCategory);

      const response = await request(app)
        .patch('/api/categories/cat-1')
        .set('Authorization', 'Bearer token')
        .send({ parentId: 'cat-1' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CIRCULAR_REFERENCE');
    });

    it('should reject duplicate code on change', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingCategory) // Find existing
        .mockResolvedValueOnce({ id: 'other' }); // Duplicate code check

      const response = await request(app)
        .patch('/api/categories/cat-1')
        .set('Authorization', 'Bearer token')
        .send({ code: 'EXISTING_CODE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_CODE');
    });

    it('should handle database errors', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .patch('/api/categories/cat-1')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete category successfully', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'cat-1',
        children: [],
        products: [],
      });
      (mockPrisma.productCategory.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/categories/cat-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.productCategory.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });

    it('should return 404 for non-existent category', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/categories/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should prevent deletion if category has children', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'cat-1',
        children: [{ id: 'child-1' }],
        products: [],
      });

      const response = await request(app)
        .delete('/api/categories/cat-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('HAS_CHILDREN');
    });

    it('should prevent deletion if category has products', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'cat-1',
        children: [],
        products: [{ id: 'prod-1' }],
      });

      const response = await request(app)
        .delete('/api/categories/cat-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('HAS_PRODUCTS');
    });

    it('should handle database errors', async () => {
      (mockPrisma.productCategory.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/categories/cat-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
