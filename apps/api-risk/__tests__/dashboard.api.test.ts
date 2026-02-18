import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: { count: jest.fn(), aggregate: jest.fn() },
    riskCapa: { count: jest.fn() },
    riskReview: { count: jest.fn() },
    riskAction: { count: jest.fn() },
    riskKri: { count: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/dashboard';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/dashboard', router);
beforeEach(() => { jest.clearAllMocks(); });

function mockAllCounts(val: number) {
  (prisma as any).riskRegister.count.mockResolvedValue(val);
  (prisma as any).riskCapa.count.mockResolvedValue(val);
  (prisma as any).riskReview.count.mockResolvedValue(val);
  (prisma as any).riskAction.count.mockResolvedValue(val);
  (prisma as any).riskKri.count.mockResolvedValue(val);
  (prisma as any).riskRegister.aggregate.mockResolvedValue({ _avg: { residualScore: val ? 8.5 : null } });
}

describe('GET /api/dashboard/stats', () => {
  it('should return dashboard stats', async () => {
    mockAllCounts(10);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRisks).toBe(10);
    expect(res.body.data.totalCapas).toBe(10);
    expect(res.body.data).toHaveProperty('criticalRisks');
    expect(res.body.data).toHaveProperty('exceedsAppetite');
    expect(res.body.data).toHaveProperty('kriBreaches');
    expect(res.body.data).toHaveProperty('avgRiskScore');
  });

  it('should return zero counts when no data exists', async () => {
    mockAllCounts(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRisks).toBe(0);
    expect(res.body.data.totalCapas).toBe(0);
    expect(res.body.data.avgRiskScore).toBe(0);
  });

  it('should return 500 on error', async () => {
    (prisma as any).riskRegister.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
