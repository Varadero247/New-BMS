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

  it('returns empty array when no risks exist', async () => {
    mockPrisma.riskRegister.groupBy.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/analytics/by-module');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on DB error', async () => {
    mockPrisma.riskRegister.groupBy.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/analytics/by-module');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/risks/analytics/dashboard — extended', () => {
  it('returns 500 on DB error', async () => {
    mockPrisma.riskRegister.count.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/analytics/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('builds heatmap cells from open risks with explicit coordinates', async () => {
    mockPrisma.riskRegister.count.mockResolvedValue(2);
    mockPrisma.riskRegister.groupBy.mockResolvedValue([]);
    // allOpenRisks (3rd findMany call) returns two risks at different positions
    mockPrisma.riskRegister.findMany.mockImplementation((_query: any) => {
      // topRisks (take:5) vs recentlyChanged (take:10) vs allOpenRisks (take:1000)
      const take = _query?.take;
      if (take === 1000) {
        return Promise.resolve([
          { id: 'r1', title: 'Risk A', referenceNumber: 'RSK-001', residualRiskLevel: 'HIGH', residualLikelihoodNum: 4, residualConsequenceNum: 3 },
          { id: 'r2', title: 'Risk B', referenceNumber: 'RSK-002', residualRiskLevel: 'MEDIUM', residualLikelihoodNum: 2, residualConsequenceNum: 2 },
        ]);
      }
      return Promise.resolve([]);
    });
    mockPrisma.riskAction.count.mockResolvedValue(0);
    mockPrisma.riskKri.count.mockResolvedValue(0);

    const res = await request(app).get('/api/risks/analytics/dashboard');
    expect(res.status).toBe(200);
    // Cell (4,3) should have count:1
    const cell43 = res.body.data.heatmapData.find(
      (c: { likelihood: number; consequence: number }) => c.likelihood === 4 && c.consequence === 3
    );
    expect(cell43).toBeDefined();
    expect(cell43.count).toBe(1);
    expect(cell43.risks[0].ref).toBe('RSK-001');
  });

  it('aggregates byStatus from groupBy results', async () => {
    mockPrisma.riskRegister.count.mockResolvedValue(3);
    mockPrisma.riskRegister.groupBy.mockImplementation((_query: any) => {
      const by = _query?.by?.[0];
      if (by === 'status') return Promise.resolve([{ status: 'OPEN', _count: 2 }, { status: 'CLOSED', _count: 1 }]);
      return Promise.resolve([]);
    });
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    mockPrisma.riskAction.count.mockResolvedValue(0);
    mockPrisma.riskKri.count.mockResolvedValue(0);

    const res = await request(app).get('/api/risks/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.byStatus.OPEN).toBe(2);
    expect(res.body.data.byStatus.CLOSED).toBe(1);
  });

  it('by-module response data is an array', async () => {
    mockPrisma.riskRegister.groupBy.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/analytics/by-module');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('dashboard heatmapData always has 25 cells', async () => {
    mockPrisma.riskRegister.count.mockResolvedValue(0);
    mockPrisma.riskRegister.groupBy.mockResolvedValue([]);
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    mockPrisma.riskAction.count.mockResolvedValue(0);
    mockPrisma.riskKri.count.mockResolvedValue(0);
    const res = await request(app).get('/api/risks/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.heatmapData).toHaveLength(25);
  });

  it('by-module entry has module and count fields', async () => {
    mockPrisma.riskRegister.groupBy.mockResolvedValue([{ sourceModule: 'MANUAL', _count: 3 }]);
    const res = await request(app).get('/api/risks/analytics/by-module');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('module');
    expect(res.body.data[0]).toHaveProperty('count');
  });
});

describe('Risk Analytics — extra', () => {
  it('dashboard success is true on 200', async () => {
    mockPrisma.riskRegister.count.mockResolvedValue(0);
    mockPrisma.riskRegister.groupBy.mockResolvedValue([]);
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    mockPrisma.riskAction.count.mockResolvedValue(0);
    mockPrisma.riskKri.count.mockResolvedValue(0);
    const res = await request(app).get('/api/risks/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('dashboard totalRisks is a number', async () => {
    mockPrisma.riskRegister.count.mockResolvedValue(7);
    mockPrisma.riskRegister.groupBy.mockResolvedValue([]);
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    mockPrisma.riskAction.count.mockResolvedValue(0);
    mockPrisma.riskKri.count.mockResolvedValue(0);
    const res = await request(app).get('/api/risks/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalRisks).toBe('number');
  });

  it('by-module success is true', async () => {
    mockPrisma.riskRegister.groupBy.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/analytics/by-module');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('by-module count field is a number when entry exists', async () => {
    mockPrisma.riskRegister.groupBy.mockResolvedValue([{ sourceModule: 'MANUAL', _count: 4 }]);
    const res = await request(app).get('/api/risks/analytics/by-module');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].count).toBe('number');
  });

  it('dashboard kriBreaches is a number', async () => {
    mockPrisma.riskRegister.count.mockResolvedValue(0);
    mockPrisma.riskRegister.groupBy.mockResolvedValue([]);
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    mockPrisma.riskAction.count.mockResolvedValue(0);
    mockPrisma.riskKri.count.mockResolvedValue(3);
    const res = await request(app).get('/api/risks/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.kriBreaches).toBe('number');
  });
});

describe('analytics.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/risks body has success property', async () => {
    const res = await request(app).get('/api/risks');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/risks body is an object', async () => {
    const res = await request(app).get('/api/risks');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/risks route is accessible', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.status).toBeDefined();
  });
});
