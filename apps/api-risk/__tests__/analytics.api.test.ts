import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: { count: jest.fn(), groupBy: jest.fn(), findMany: jest.fn() },
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

import router from '../src/routes/analytics';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/risks', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/risks/analytics/dashboard', () => {
  it('should return full analytics dashboard', async () => {
    mockPrisma.riskRegister.count.mockResolvedValue(10);
    mockPrisma.riskRegister.groupBy.mockResolvedValue([]);
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    mockPrisma.riskAction.count.mockResolvedValue(2);
    mockPrisma.riskKri.count.mockResolvedValue(1);
    const res = await request(app).get('/api/risks/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalRisks');
    expect(res.body.data).toHaveProperty('heatmapData');
    expect(res.body.data).toHaveProperty('byCategory');
    expect(res.body.data).toHaveProperty('kriBreaches');
    expect(res.body.data).toHaveProperty('overdueActions');
    expect(res.body.data).toHaveProperty('moduleBreakdown');
    expect(res.body.data.heatmapData).toHaveLength(25); // 5x5 matrix
  });
});

describe('GET /api/risks/analytics/by-module', () => {
  it('should return module breakdown', async () => {
    mockPrisma.riskRegister.groupBy.mockResolvedValue([
      { sourceModule: 'MANUAL', _count: 5 },
      { sourceModule: 'CHEMICAL_COSHH', _count: 3 },
    ]);
    const res = await request(app).get('/api/risks/analytics/by-module');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].module).toBe('MANUAL');
  });
});
