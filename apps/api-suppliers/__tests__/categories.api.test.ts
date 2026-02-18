import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { suppSupplier: { findMany: jest.fn() } },
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

import router from '../src/routes/categories';
import { prisma } from '../src/prisma';
const app = express();
app.use(express.json());
app.use('/api/categories', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/categories', () => {
  it('should return category counts', async () => {
    (prisma as any).suppSupplier.findMany.mockResolvedValue([
      { category: 'IT' },
      { category: 'IT' },
      { category: 'Manufacturing' },
    ]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const it = res.body.data.find((c: any) => c.category === 'IT');
    expect(it.count).toBe(2);
  });

  it('should return empty array when no suppliers', async () => {
    (prisma as any).suppSupplier.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should skip suppliers with null category', async () => {
    (prisma as any).suppSupplier.findMany.mockResolvedValue([
      { category: null },
      { category: 'IT' },
    ]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].category).toBe('IT');
  });

  it('should return 500 on DB error', async () => {
    (prisma as any).suppSupplier.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
