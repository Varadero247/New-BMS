import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { assetWorkOrder: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/work-orders';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/work-orders', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/work-orders', () => {
  it('should return work orders', async () => {
    (prisma as any).assetWorkOrder.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', title: 'Test' }]);
    (prisma as any).assetWorkOrder.count.mockResolvedValue(1);
    const res = await request(app).get('/api/work-orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/work-orders/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).assetWorkOrder.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/work-orders/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    (prisma as any).assetWorkOrder.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).get('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

describe('POST /api/work-orders', () => {
  it('should create', async () => {
    (prisma as any).assetWorkOrder.count.mockResolvedValue(0);
    (prisma as any).assetWorkOrder.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'New' });
    const res = await request(app).post('/api/work-orders').send({ assetId: 'asset-1', title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/work-orders/:id', () => {
  it('should update', async () => {
    (prisma as any).assetWorkOrder.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).assetWorkOrder.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated' });
    const res = await request(app).put('/api/work-orders/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/work-orders/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).assetWorkOrder.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).assetWorkOrder.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/work-orders/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
