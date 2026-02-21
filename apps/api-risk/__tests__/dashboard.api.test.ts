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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/dashboard', router);
beforeEach(() => {
  jest.clearAllMocks();
});

function mockAllCounts(val: number) {
  mockPrisma.riskRegister.count.mockResolvedValue(val);
  mockPrisma.riskCapa.count.mockResolvedValue(val);
  mockPrisma.riskReview.count.mockResolvedValue(val);
  mockPrisma.riskAction.count.mockResolvedValue(val);
  mockPrisma.riskKri.count.mockResolvedValue(val);
  mockPrisma.riskRegister.aggregate.mockResolvedValue({
    _avg: { residualScore: val ? 8.5 : null },
  });
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
    mockPrisma.riskRegister.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response contains all expected data keys', async () => {
    mockAllCounts(5);
    const res = await request(app).get('/api/dashboard/stats');
    const data = res.body.data;
    for (const key of [
      'totalRisks', 'totalCapas', 'openCapas', 'pendingReviews',
      'avgRiskScore', 'criticalRisks', 'exceedsAppetite',
      'overdueReviews', 'overdueActions', 'kriBreaches', 'kriWarnings', 'newThisMonth',
    ]) {
      expect(data).toHaveProperty(key);
    }
  });

  it('avgRiskScore is rounded to 1 decimal place', async () => {
    mockPrisma.riskRegister.count.mockResolvedValue(3);
    mockPrisma.riskCapa.count.mockResolvedValue(1);
    mockPrisma.riskReview.count.mockResolvedValue(1);
    mockPrisma.riskAction.count.mockResolvedValue(1);
    mockPrisma.riskKri.count.mockResolvedValue(1);
    mockPrisma.riskRegister.aggregate.mockResolvedValue({ _avg: { residualScore: 7.333 } });
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    // 7.333 rounds to 7.3
    expect(res.body.data.avgRiskScore).toBe(7.3);
  });

  it('avgRiskScore returns 0 when no residualScore data', async () => {
    mockPrisma.riskRegister.count.mockResolvedValue(0);
    mockPrisma.riskCapa.count.mockResolvedValue(0);
    mockPrisma.riskReview.count.mockResolvedValue(0);
    mockPrisma.riskAction.count.mockResolvedValue(0);
    mockPrisma.riskKri.count.mockResolvedValue(0);
    mockPrisma.riskRegister.aggregate.mockResolvedValue({ _avg: { residualScore: null } });
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.avgRiskScore).toBe(0);
  });
});
