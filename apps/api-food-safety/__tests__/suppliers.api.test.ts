import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSupplier: {
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

import suppliersRouter from '../src/routes/suppliers';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/suppliers', suppliersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/suppliers', () => {
  it('should return suppliers with pagination', async () => {
    (prisma as any).fsSupplier.findMany.mockResolvedValue([{ id: 's-1', name: 'Supplier A' }]);
    (prisma as any).fsSupplier.count.mockResolvedValue(1);

    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).fsSupplier.findMany.mockResolvedValue([]);
    (prisma as any).fsSupplier.count.mockResolvedValue(0);

    await request(app).get('/api/suppliers?status=APPROVED');
    expect((prisma as any).fsSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'APPROVED' }) })
    );
  });

  it('should filter by category', async () => {
    (prisma as any).fsSupplier.findMany.mockResolvedValue([]);
    (prisma as any).fsSupplier.count.mockResolvedValue(0);

    await request(app).get('/api/suppliers?category=RAW_MATERIAL');
    expect((prisma as any).fsSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'RAW_MATERIAL' }) })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsSupplier.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/suppliers', () => {
  it('should create a supplier with auto-generated code', async () => {
    const created = { id: 's-1', name: 'Supplier A', code: 'FS-SUP-1234', category: 'RAW_MATERIAL' };
    (prisma as any).fsSupplier.create.mockResolvedValue(created);

    const res = await request(app).post('/api/suppliers').send({
      name: 'Supplier A', category: 'RAW_MATERIAL',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/suppliers').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsSupplier.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/suppliers').send({
      name: 'Supplier A', category: 'RAW_MATERIAL',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/suppliers/:id', () => {
  it('should return a supplier by id', async () => {
    (prisma as any).fsSupplier.findFirst.mockResolvedValue({ id: 's-1', name: 'Supplier A' });

    const res = await request(app).get('/api/suppliers/s-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('s-1');
  });

  it('should return 404 for non-existent supplier', async () => {
    (prisma as any).fsSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/suppliers/non-existent');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/suppliers/:id', () => {
  it('should update a supplier', async () => {
    (prisma as any).fsSupplier.findFirst.mockResolvedValue({ id: 's-1' });
    (prisma as any).fsSupplier.update.mockResolvedValue({ id: 's-1', name: 'Updated' });

    const res = await request(app).put('/api/suppliers/s-1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent supplier', async () => {
    (prisma as any).fsSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/suppliers/non-existent').send({ name: 'Test' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/suppliers/:id', () => {
  it('should soft delete a supplier', async () => {
    (prisma as any).fsSupplier.findFirst.mockResolvedValue({ id: 's-1' });
    (prisma as any).fsSupplier.update.mockResolvedValue({ id: 's-1' });

    const res = await request(app).delete('/api/suppliers/s-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent supplier', async () => {
    (prisma as any).fsSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/suppliers/non-existent');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/suppliers/due-audit', () => {
  it('should return suppliers due for audit', async () => {
    const suppliers = [{ id: 's-1', name: 'Supplier A', nextAuditDate: '2026-02-20' }];
    (prisma as any).fsSupplier.findMany.mockResolvedValue(suppliers);

    const res = await request(app).get('/api/suppliers/due-audit');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should accept custom days parameter', async () => {
    (prisma as any).fsSupplier.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/suppliers/due-audit?days=60');
    expect(res.status).toBe(200);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsSupplier.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/suppliers/due-audit');
    expect(res.status).toBe(500);
  });
});
