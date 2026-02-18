import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    suppSupplier: { count: jest.fn() },
    suppScorecard: { count: jest.fn() },
    suppDocument: { count: jest.fn() },
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
    (prisma as any).suppSupplier.count.mockResolvedValue(10);
    (prisma as any).suppScorecard.count.mockResolvedValue(5);
    (prisma as any).suppDocument.count.mockResolvedValue(20);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSuppliers).toBe(10);
    expect(res.body.data.totalScorecards).toBe(5);
    expect(res.body.data.totalDocuments).toBe(20);
  });

  it('should return zeros when no data', async () => {
    (prisma as any).suppSupplier.count.mockResolvedValue(0);
    (prisma as any).suppScorecard.count.mockResolvedValue(0);
    (prisma as any).suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSuppliers).toBe(0);
  });

  it('should return 500 on DB error', async () => {
    (prisma as any).suppSupplier.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
