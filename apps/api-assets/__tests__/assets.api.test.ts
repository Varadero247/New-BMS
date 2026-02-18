import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { assetRegister: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/assets';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/assets', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/assets', () => {
  it('should return assets with pagination', async () => {
    (prisma as any).assetRegister.findMany.mockResolvedValue([{ id: '1', name: 'Forklift' }]);
    (prisma as any).assetRegister.count.mockResolvedValue(1);
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    (prisma as any).assetRegister.findMany.mockResolvedValue([]);
    (prisma as any).assetRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/assets?status=ACTIVE');
    expect(res.status).toBe(200);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).assetRegister.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/assets/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).assetRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/assets/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return item by id', async () => {
    (prisma as any).assetRegister.findFirst.mockResolvedValue({ id: '1', name: 'Forklift' });
    const res = await request(app).get('/api/assets/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).assetRegister.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/assets/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/assets', () => {
  it('should create', async () => {
    (prisma as any).assetRegister.count.mockResolvedValue(0);
    (prisma as any).assetRegister.create.mockResolvedValue({ id: '1', name: 'New Asset', referenceNumber: 'AST-2026-0001' });
    const res = await request(app).post('/api/assets').send({ name: 'New Asset' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when name is missing', async () => {
    const res = await request(app).post('/api/assets').send({ description: 'No name' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when name is empty', async () => {
    const res = await request(app).post('/api/assets').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database create error', async () => {
    (prisma as any).assetRegister.count.mockResolvedValue(0);
    (prisma as any).assetRegister.create.mockRejectedValue(new Error('Unique constraint'));
    const res = await request(app).post('/api/assets').send({ name: 'Duplicate' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/assets/:id', () => {
  it('should update', async () => {
    (prisma as any).assetRegister.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetRegister.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const res = await request(app).put('/api/assets/1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when asset not found', async () => {
    (prisma as any).assetRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/assets/nope').send({ name: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database update error', async () => {
    (prisma as any).assetRegister.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetRegister.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/api/assets/1').send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/assets/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).assetRegister.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetRegister.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/assets/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when asset not found', async () => {
    (prisma as any).assetRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/assets/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).assetRegister.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetRegister.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/assets/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
