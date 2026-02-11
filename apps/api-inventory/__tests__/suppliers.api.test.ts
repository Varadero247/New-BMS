import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    supplier: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
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
import suppliersRoutes from '../src/routes/suppliers';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Inventory Suppliers API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/suppliers', suppliersRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/suppliers', () => {
    const mockSuppliers = [
      {
        id: 'sup-1',
        code: 'ACME',
        name: 'Acme Corp',
        contactName: 'John Doe',
        email: 'john@acme.com',
        status: 'ACTIVE',
        isActive: true,
        _count: { products: 10 },
      },
      {
        id: 'sup-2',
        code: 'BETA',
        name: 'Beta Inc',
        contactName: 'Jane Smith',
        email: 'jane@beta.com',
        status: 'ACTIVE',
        isActive: true,
        _count: { products: 5 },
      },
    ];

    it('should return list of suppliers with pagination', async () => {
      (mockPrisma.supplier.findMany as jest.Mock).mockResolvedValueOnce(mockSuppliers);
      (mockPrisma.supplier.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/suppliers')
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
      (mockPrisma.supplier.findMany as jest.Mock).mockResolvedValueOnce([mockSuppliers[0]]);
      (mockPrisma.supplier.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/suppliers?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      (mockPrisma.supplier.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.supplier.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/suppliers?status=INACTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'INACTIVE',
          }),
        })
      );
    });

    it('should filter by isActive', async () => {
      (mockPrisma.supplier.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.supplier.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/suppliers?isActive=true')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should support search across code, name, contactName, email', async () => {
      (mockPrisma.supplier.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.supplier.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/suppliers?search=acme')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ code: expect.any(Object) }),
              expect.objectContaining({ name: expect.any(Object) }),
              expect.objectContaining({ contactName: expect.any(Object) }),
              expect.objectContaining({ email: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('should order by name asc', async () => {
      (mockPrisma.supplier.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.supplier.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/suppliers')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.supplier.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/suppliers')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/suppliers/:id', () => {
    const mockSupplier = {
      id: 'sup-1',
      code: 'ACME',
      name: 'Acme Corp',
      products: [{ id: 'prod-1', sku: 'SKU001', name: 'Widget', status: 'ACTIVE' }],
      _count: { products: 10 },
    };

    it('should return single supplier with products', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce(mockSupplier);

      const response = await request(app)
        .get('/api/suppliers/sup-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('sup-1');
      expect(response.body.data.products).toHaveLength(1);
    });

    it('should return 404 for non-existent supplier', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/suppliers/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/suppliers/sup-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/suppliers', () => {
    const createPayload = {
      code: 'NEW_SUP',
      name: 'New Supplier',
      contactName: 'Bob Jones',
      email: 'bob@newsup.com',
    };

    it('should create a supplier successfully', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce(null); // No duplicate code
      (mockPrisma.supplier.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        ...createPayload,
        status: 'ACTIVE',
        isActive: true,
      });

      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Supplier');
    });

    it('should set createdById from authenticated user', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.supplier.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        createdById: 'user-123',
      });

      await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.supplier.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          createdById: 'user-123',
          updatedById: 'user-123',
        }),
      });
    });

    it('should reject duplicate code', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing' });

      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_CODE');
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send({ name: 'No Code' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send({ code: 'NO_NAME' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.supplier.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PATCH /api/suppliers/:id', () => {
    const existingSupplier = {
      id: 'sup-1',
      code: 'ACME',
      name: 'Acme Corp',
    };

    it('should update supplier successfully', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce(existingSupplier);
      (mockPrisma.supplier.update as jest.Mock).mockResolvedValueOnce({
        ...existingSupplier,
        name: 'Updated Acme',
      });

      const response = await request(app)
        .patch('/api/suppliers/sup-1')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated Acme' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent supplier', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/suppliers/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject duplicate code on change', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingSupplier) // Find existing
        .mockResolvedValueOnce({ id: 'other' }); // Duplicate code check

      const response = await request(app)
        .patch('/api/suppliers/sup-1')
        .set('Authorization', 'Bearer token')
        .send({ code: 'EXISTING_CODE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_CODE');
    });

    it('should allow updating status', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce(existingSupplier);
      (mockPrisma.supplier.update as jest.Mock).mockResolvedValueOnce({
        ...existingSupplier,
        status: 'BLOCKED',
      });

      const response = await request(app)
        .patch('/api/suppliers/sup-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'BLOCKED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .patch('/api/suppliers/sup-1')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/suppliers/:id', () => {
    it('should delete supplier successfully', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'sup-1',
        products: [],
      });
      (mockPrisma.supplier.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/suppliers/sup-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.supplier.delete).toHaveBeenCalledWith({
        where: { id: 'sup-1' },
      });
    });

    it('should return 404 for non-existent supplier', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/suppliers/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should prevent deletion if supplier has products', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'sup-1',
        products: [{ id: 'prod-1' }],
      });

      const response = await request(app)
        .delete('/api/suppliers/sup-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('HAS_PRODUCTS');
    });

    it('should handle database errors', async () => {
      (mockPrisma.supplier.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/suppliers/sup-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
