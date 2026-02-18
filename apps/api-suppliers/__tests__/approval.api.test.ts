import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { suppSupplier: { update: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/approval';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/approval', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('POST /api/approval/:id/approve', () => {
  it('should approve a supplier', async () => {
    (prisma as any).suppSupplier.update.mockResolvedValue({ id: '1', status: 'APPROVED' });
    const res = await request(app).post('/api/approval/1/approve');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('should return 500 on error when approving', async () => {
    (prisma as any).suppSupplier.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/approval/1/approve');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/approval/:id/suspend', () => {
  it('should suspend a supplier', async () => {
    (prisma as any).suppSupplier.update.mockResolvedValue({ id: '1', status: 'SUSPENDED' });
    const res = await request(app).post('/api/approval/1/suspend');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUSPENDED');
  });

  it('should return 500 on error when suspending', async () => {
    (prisma as any).suppSupplier.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/approval/1/suspend');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
