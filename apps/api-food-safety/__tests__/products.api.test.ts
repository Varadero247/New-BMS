import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsProduct: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

import productsRouter from '../src/routes/products';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/products', () => {
  it('should return products with pagination', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Product A' },
    ]);
    mockPrisma.fsProduct.count.mockResolvedValue(1);

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([]);
    mockPrisma.fsProduct.count.mockResolvedValue(0);

    await request(app).get('/api/products?status=ACTIVE');
    expect(mockPrisma.fsProduct.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) })
    );
  });

  it('should filter by category', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([]);
    mockPrisma.fsProduct.count.mockResolvedValue(0);

    await request(app).get('/api/products?category=Dairy');
    expect(mockPrisma.fsProduct.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: expect.objectContaining({ contains: 'Dairy' }),
        }),
      })
    );
  });

  it('should handle database errors', async () => {
    mockPrisma.fsProduct.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/products', () => {
  it('should create a product', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Product A',
      code: 'PROD-001',
    };
    mockPrisma.fsProduct.create.mockResolvedValue(created);

    const res = await request(app).post('/api/products').send({
      name: 'Product A',
      code: 'PROD-001',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/products').send({});
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsProduct.create.mockRejectedValue(new Error('Unique constraint'));

    const res = await request(app).post('/api/products').send({
      name: 'Product A',
      code: 'PROD-001',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/products/:id', () => {
  it('should return a product by id', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Product A',
    });

    const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent product', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/products/:id', () => {
  it('should update a product', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsProduct.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/products/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent product', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/products/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .put('/api/products/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/products/:id', () => {
  it('should soft delete a product', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsProduct.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/products/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent product', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/products/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('Food Safety Products — extended', () => {
  it('GET /products returns success:true with correct data length', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Cheese' },
      { id: '00000000-0000-0000-0000-000000000002', name: 'Milk' },
    ]);
    mockPrisma.fsProduct.count.mockResolvedValue(2);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });
});


describe('Food Safety Products — additional coverage', () => {
  it('GET /products returns correct totalPages in pagination', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([]);
    mockPrisma.fsProduct.count.mockResolvedValue(15);

    const res = await request(app).get('/api/products?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('POST /products with DEVELOPMENT status creates successfully', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Prototype Bar',
      code: 'PROTO-001',
      status: 'DEVELOPMENT',
    };
    mockPrisma.fsProduct.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Prototype Bar', code: 'PROTO-001', status: 'DEVELOPMENT' });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DEVELOPMENT');
  });

  it('PUT /products/:id can set status to DISCONTINUED', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsProduct.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'DISCONTINUED',
    });

    const res = await request(app)
      .put('/api/products/00000000-0000-0000-0000-000000000001')
      .send({ status: 'DISCONTINUED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /products/:id returns a confirmation message in data', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsProduct.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/products/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('GET /products/:id returns success: true with the correct product name', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Gouda Cheese',
      code: 'GOUDA-001',
    });

    const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000004');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'Gouda Cheese');
  });
});

describe('products.api — edge cases and extended coverage', () => {
  it('GET /api/products filters by status and category together', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([]);
    mockPrisma.fsProduct.count.mockResolvedValue(0);

    await request(app).get('/api/products?status=ACTIVE&category=Beverages');
    expect(mockPrisma.fsProduct.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
          category: expect.objectContaining({ contains: 'Beverages' }),
        }),
      })
    );
  });

  it('POST /api/products rejects empty name', async () => {
    const res = await request(app).post('/api/products').send({ name: '', code: 'PROD-001' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/products rejects invalid status enum', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Test Product',
      code: 'PROD-002',
      status: 'ARCHIVED',
    });
    expect(res.status).toBe(400);
  });

  it('PUT /api/products/:id handles 500 on update', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsProduct.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/products/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(500);
  });

  it('DELETE /api/products/:id handles 500 on update', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsProduct.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/products/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('GET /api/products/:id handles 500 on findFirst', async () => {
    mockPrisma.fsProduct.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('GET /api/products returns empty list with total 0', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([]);
    mockPrisma.fsProduct.count.mockResolvedValue(0);

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('POST /api/products creates with shelfLifeDays and storageRequirements', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000006',
      name: 'Aged Cheddar',
      code: 'CHED-001',
      shelfLifeDays: 180,
      storageRequirements: 'Refrigerate at 4C',
    };
    mockPrisma.fsProduct.create.mockResolvedValue(created);

    const res = await request(app).post('/api/products').send({
      name: 'Aged Cheddar',
      code: 'CHED-001',
      shelfLifeDays: 180,
      storageRequirements: 'Refrigerate at 4C',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('shelfLifeDays', 180);
  });
});

describe('products.api — final coverage pass', () => {
  it('GET /api/products default pagination applies skip 0', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([]);
    mockPrisma.fsProduct.count.mockResolvedValue(0);

    await request(app).get('/api/products');
    expect(mockPrisma.fsProduct.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 })
    );
  });

  it('GET /api/products/:id queries with deletedAt null', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Butter',
    });
    await request(app).get('/api/products/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.fsProduct.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null }),
      })
    );
  });

  it('POST /api/products creates with createdBy from auth user', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000020',
      name: 'Organic Oats',
      code: 'OATS-001',
      createdBy: 'user-123',
    };
    mockPrisma.fsProduct.create.mockResolvedValue(created);

    const res = await request(app).post('/api/products').send({
      name: 'Organic Oats',
      code: 'OATS-001',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('createdBy', 'user-123');
  });

  it('PUT /api/products/:id update calls update with where id', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsProduct.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated Oats',
    });

    await request(app)
      .put('/api/products/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Oats' });
    expect(mockPrisma.fsProduct.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-0000-0000-000000000001' },
      })
    );
  });

  it('DELETE /api/products/:id calls update with deletedAt', async () => {
    mockPrisma.fsProduct.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsProduct.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    await request(app).delete('/api/products/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.fsProduct.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('GET /api/products page 2 limit 10 applies skip 10 take 10', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([]);
    mockPrisma.fsProduct.count.mockResolvedValue(0);

    await request(app).get('/api/products?page=2&limit=10');
    expect(mockPrisma.fsProduct.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('GET /api/products returns success:true with totalPages', async () => {
    mockPrisma.fsProduct.findMany.mockResolvedValue([]);
    mockPrisma.fsProduct.count.mockResolvedValue(100);

    const res = await request(app).get('/api/products?limit=25');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(4);
  });
});
