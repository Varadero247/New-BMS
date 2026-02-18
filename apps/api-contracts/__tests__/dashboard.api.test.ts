import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { contContract: { count: jest.fn() }, contNotice: { count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/dashboard';
import { prisma } from '../src/prisma';
const app = express();
app.use(express.json());
app.use('/api/dashboard', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dashboard/stats', () => {
  it('should return contract dashboard stats', async () => {
    (prisma as any).contContract.count.mockResolvedValue(42);
    (prisma as any).contNotice.count.mockResolvedValue(5);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.totalContracts).toBe(42);
    expect(res.body.data.upcomingNotices).toBe(5);
  });

  it('should return 500 on db error', async () => {
    (prisma as any).contContract.count.mockRejectedValue(new Error('DB failure'));
    (prisma as any).contNotice.count.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
