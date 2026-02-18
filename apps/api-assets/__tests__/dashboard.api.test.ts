import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    assetRegister: { count: jest.fn() },
    assetWorkOrder: { count: jest.fn() },
    assetCalibration: { count: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/dashboard';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/dashboard', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/dashboard/stats', () => {
  it('should return dashboard stats', async () => {
    (prisma as any).assetRegister.count.mockResolvedValue(42);
    (prisma as any).assetWorkOrder.count.mockResolvedValue(10);
    (prisma as any).assetCalibration.count.mockResolvedValue(5);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAssets).toBe(42);
    expect(res.body.data.totalWorkOrders).toBe(10);
    expect(res.body.data.totalCalibrations).toBe(5);
  });

  it('should return zeros when no records exist', async () => {
    (prisma as any).assetRegister.count.mockResolvedValue(0);
    (prisma as any).assetWorkOrder.count.mockResolvedValue(0);
    (prisma as any).assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAssets).toBe(0);
  });

  it('should return 500 on error', async () => {
    (prisma as any).assetRegister.count.mockRejectedValue(new Error('DB error'));
    (prisma as any).assetWorkOrder.count.mockResolvedValue(0);
    (prisma as any).assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
