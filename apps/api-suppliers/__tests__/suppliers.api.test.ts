import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { suppSupplier: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/suppliers';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/suppliers', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/suppliers', () => {
  it('should return suppliers with pagination', async () => {
    (prisma as any).suppSupplier.findMany.mockResolvedValue([{ id: '1', name: 'Acme Corp' }]);
    (prisma as any).suppSupplier.count.mockResolvedValue(1);
    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    (prisma as any).suppSupplier.findMany.mockResolvedValue([]);
    (prisma as any).suppSupplier.count.mockResolvedValue(0);
    const res = await request(app).get('/api/suppliers?status=APPROVED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should search by name', async () => {
    (prisma as any).suppSupplier.findMany.mockResolvedValue([]);
    (prisma as any).suppSupplier.count.mockResolvedValue(0);
    const res = await request(app).get('/api/suppliers?search=acme');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).suppSupplier.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/suppliers/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).suppSupplier.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/suppliers/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return item by id', async () => {
    (prisma as any).suppSupplier.findFirst.mockResolvedValue({ id: '1', name: 'Acme Corp' });
    const res = await request(app).get('/api/suppliers/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).suppSupplier.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/suppliers/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/suppliers', () => {
  it('should create', async () => {
    (prisma as any).suppSupplier.count.mockResolvedValue(0);
    (prisma as any).suppSupplier.create.mockResolvedValue({ id: '1', name: 'New Supplier', referenceNumber: 'SUP-2026-0001' });
    const res = await request(app).post('/api/suppliers').send({ name: 'New Supplier' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New Supplier');
  });

  it('should return 400 when name is missing', async () => {
    const res = await request(app).post('/api/suppliers').send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when name is empty string', async () => {
    const res = await request(app).post('/api/suppliers').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database create error', async () => {
    (prisma as any).suppSupplier.count.mockResolvedValue(0);
    (prisma as any).suppSupplier.create.mockRejectedValue(new Error('Unique constraint'));
    const res = await request(app).post('/api/suppliers').send({ name: 'Duplicate' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/suppliers/:id', () => {
  it('should update', async () => {
    (prisma as any).suppSupplier.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).suppSupplier.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const res = await request(app).put('/api/suppliers/1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    (prisma as any).suppSupplier.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/suppliers/nope').send({ name: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database update error', async () => {
    (prisma as any).suppSupplier.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).suppSupplier.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/api/suppliers/1').send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/suppliers/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).suppSupplier.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).suppSupplier.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/suppliers/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    (prisma as any).suppSupplier.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/suppliers/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).suppSupplier.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).suppSupplier.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/suppliers/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
