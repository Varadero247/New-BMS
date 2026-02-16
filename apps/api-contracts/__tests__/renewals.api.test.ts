import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { contContract: { findMany: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/renewals';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/renewals', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/renewals', () => {
  it('should return contracts with upcoming renewals within 30 days', async () => {
    const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    (prisma as any).contContract.findMany.mockResolvedValue([
      { id: '1', title: 'Contract A', renewalDate: futureDate, status: 'ACTIVE' },
      { id: '2', title: 'Contract B', renewalDate: futureDate, status: 'ACTIVE' },
    ]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should return an empty array when no contracts are due', async () => {
    (prisma as any).contContract.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on db error', async () => {
    (prisma as any).contContract.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/renewals');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});
