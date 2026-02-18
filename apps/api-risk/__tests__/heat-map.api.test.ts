import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { riskRegister: { findMany: jest.fn() } },
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

import router from '../src/routes/heat-map';
import { prisma } from '../src/prisma';
const app = express();
app.use(express.json());
app.use('/api/heat-map', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/heat-map', () => {
  it('should return heat map data with risks', async () => {
    const mockRisks = [
      { id: '1', title: 'Risk A', likelihood: 3, consequence: 4, inherentScore: 12 },
      { id: '2', title: 'Risk B', likelihood: 2, consequence: 2, inherentScore: 4 },
    ];
    (prisma as any).riskRegister.findMany.mockResolvedValue(mockRisks);
    const res = await request(app).get('/api/heat-map');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.risks).toHaveLength(2);
    expect(res.body.data.total).toBe(2);
  });

  it('should return empty heat map when no open risks exist', async () => {
    (prisma as any).riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/heat-map');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.risks).toEqual([]);
    expect(res.body.data.total).toBe(0);
  });

  it('should return 500 on error', async () => {
    (prisma as any).riskRegister.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/heat-map');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
