import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    assetRegister: { findMany: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/locations';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/locations', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/locations', () => {
  it('should return location counts', async () => {
    (prisma as any).assetRegister.findMany.mockResolvedValue([
      { location: 'Warehouse A' },
      { location: 'Warehouse A' },
      { location: 'Factory Floor' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ location: 'Warehouse A', count: 2 }),
        expect.objectContaining({ location: 'Factory Floor', count: 1 }),
      ])
    );
  });

  it('should skip assets with no location', async () => {
    (prisma as any).assetRegister.findMany.mockResolvedValue([
      { location: null },
      { location: 'Site B' },
      { location: '' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // null location should be excluded; empty string falsy so also excluded
    const locations = res.body.data.map((d: any) => d.location);
    expect(locations).not.toContain(null);
  });

  it('should return empty array when no assets', async () => {
    (prisma as any).assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).assetRegister.findMany.mockRejectedValue(new Error('DB connection error'));
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});
