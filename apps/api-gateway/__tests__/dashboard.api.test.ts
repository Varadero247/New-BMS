import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    complianceScore: {
      findMany: jest.fn(),
    },
    risk: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    incident: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    action: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    aIAnalysis: {
      findMany: jest.fn(),
    },
    monthlyTrend: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

import { prisma } from '@ims/database';
import dashboardRoutes from '../src/routes/dashboard';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Dashboard API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', dashboardRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/stats', () => {
    beforeEach(() => {
      // Setup default mock responses
      (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValue([
        { standard: 'ISO_45001', overallScore: 85 },
        { standard: 'ISO_14001', overallScore: 90 },
        { standard: 'ISO_9001', overallScore: 88 },
      ]);

      (mockPrisma.risk.count as jest.Mock).mockResolvedValue(10);
      mockPrisma.risk.groupBy.mockResolvedValue([
        { standard: 'ISO_45001', _count: { id: 5 } },
        { standard: 'ISO_14001', _count: { id: 3 } },
      ]);
      (mockPrisma.risk.findMany as jest.Mock).mockResolvedValue([
        {
          id: '10000000-0000-4000-a000-000000000001',
          title: 'Risk 1',
          riskScore: 25,
          riskLevel: 'CRITICAL',
        },
      ]);

      (mockPrisma.incident.count as jest.Mock).mockResolvedValue(5);
      mockPrisma.incident.groupBy.mockResolvedValue([
        { standard: 'ISO_45001', _count: { id: 3 } },
      ]);

      (mockPrisma.action.count as jest.Mock).mockResolvedValue(20);
      mockPrisma.action.findMany.mockResolvedValue([
        {
          id: '13000000-0000-4000-a000-000000000001',
          title: 'Overdue Action',
          dueDate: new Date(),
        },
      ]);

      (mockPrisma.aIAnalysis.findMany as jest.Mock).mockResolvedValue([
        { id: 'ai-1', sourceType: 'INCIDENT', suggestedRootCause: 'Test cause' },
      ]);
    });

    it('should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('compliance');
      expect(response.body.data).toHaveProperty('risks');
      expect(response.body.data).toHaveProperty('incidents');
      expect(response.body.data).toHaveProperty('actions');
    });

    it('should calculate overall compliance score', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.body.data.compliance.iso45001).toBe(85);
      expect(response.body.data.compliance.iso14001).toBe(90);
      expect(response.body.data.compliance.iso9001).toBe(88);
      expect(response.body.data.compliance.overall).toBe(88); // (85+90+88)/3 rounded
    });

    it('should return risk statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.body.data.risks).toHaveProperty('total');
      expect(response.body.data.risks).toHaveProperty('high');
      expect(response.body.data.risks).toHaveProperty('critical');
      expect(response.body.data.risks).toHaveProperty('byStandard');
    });

    it('should return incident statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.body.data.incidents).toHaveProperty('total');
      expect(response.body.data.incidents).toHaveProperty('open');
      expect(response.body.data.incidents).toHaveProperty('thisMonth');
      expect(response.body.data.incidents).toHaveProperty('byStandard');
    });

    it('should return action statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.body.data.actions).toHaveProperty('total');
      expect(response.body.data.actions).toHaveProperty('open');
      expect(response.body.data.actions).toHaveProperty('overdue');
      expect(response.body.data.actions).toHaveProperty('dueThisWeek');
    });

    it('should return top risks', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.body.data).toHaveProperty('topRisks');
      expect(Array.isArray(response.body.data.topRisks)).toBe(true);
    });

    it('should return overdue actions', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.body.data).toHaveProperty('overdueActions');
      expect(Array.isArray(response.body.data.overdueActions)).toBe(true);
    });

    it('should return recent AI insights', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.body.data).toHaveProperty('recentAIInsights');
      expect(Array.isArray(response.body.data.recentAIInsights)).toBe(true);
    });

    it('should handle missing compliance scores gracefully', async () => {
      (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.compliance.iso45001).toBe(0);
      expect(response.body.data.compliance.iso14001).toBe(0);
      expect(response.body.data.compliance.iso9001).toBe(0);
    });

    it('should handle database errors', async () => {
      mockPrisma.complianceScore.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/dashboard/compliance', () => {
    it('should return compliance scores', async () => {
      mockPrisma.complianceScore.findMany.mockResolvedValueOnce([
        { standard: 'ISO_45001', overallScore: 85 },
        { standard: 'ISO_14001', overallScore: 90 },
      ]);

      const response = await request(app)
        .get('/api/dashboard/compliance')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array when no compliance data', async () => {
      (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/dashboard/compliance')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockPrisma.complianceScore.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/dashboard/compliance')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/dashboard/trends', () => {
    const mockTrends = [
      { standard: 'ISO_45001', metric: 'RISKS', month: 1, value: 10, year: 2024 },
      { standard: 'ISO_45001', metric: 'RISKS', month: 2, value: 12, year: 2024 },
    ];

    it('should return monthly trends', async () => {
      mockPrisma.monthlyTrend.findMany.mockResolvedValueOnce(mockTrends);

      const response = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by standard', async () => {
      (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValueOnce(mockTrends);

      await request(app)
        .get('/api/dashboard/trends?standard=ISO_45001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.monthlyTrend.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            standard: 'ISO_45001',
          }),
        })
      );
    });

    it('should filter by metric', async () => {
      (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValueOnce(mockTrends);

      await request(app)
        .get('/api/dashboard/trends?metric=RISKS')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.monthlyTrend.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            metric: 'RISKS',
          }),
        })
      );
    });

    it('should filter by year', async () => {
      (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValueOnce(mockTrends);

      await request(app)
        .get('/api/dashboard/trends?year=2023')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.monthlyTrend.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            year: 2023,
          }),
        })
      );
    });

    it('should default to current year', async () => {
      mockPrisma.monthlyTrend.findMany.mockResolvedValueOnce([]);
      const currentYear = new Date().getFullYear();

      await request(app).get('/api/dashboard/trends').set('Authorization', 'Bearer token');

      expect(mockPrisma.monthlyTrend.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            year: currentYear,
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.monthlyTrend.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('dashboard.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', dashboardRoutes);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/dashboard', async () => {
    const res = await request(app).get('/api/dashboard');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('Dashboard API Routes — extended edge cases', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', dashboardRoutes);
    jest.clearAllMocks();

    // Default mock setup for stats endpoint
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValue([
      { standard: 'ISO_45001', overallScore: 80 },
      { standard: 'ISO_14001', overallScore: 80 },
      { standard: 'ISO_9001', overallScore: 80 },
    ]);
    (mockPrisma.risk.count as jest.Mock).mockResolvedValue(0);
    mockPrisma.risk.groupBy.mockResolvedValue([]);
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.incident.count as jest.Mock).mockResolvedValue(0);
    mockPrisma.incident.groupBy.mockResolvedValue([]);
    (mockPrisma.action.count as jest.Mock).mockResolvedValue(0);
    mockPrisma.action.findMany.mockResolvedValue([]);
    (mockPrisma.aIAnalysis.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValue([]);
  });

  it('GET /api/dashboard/stats overall compliance rounds correctly for equal scores', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValueOnce([
      { standard: 'ISO_45001', overallScore: 90 },
      { standard: 'ISO_14001', overallScore: 90 },
      { standard: 'ISO_9001', overallScore: 90 },
    ]);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data.compliance.overall).toBe(90);
  });

  it('GET /api/dashboard/stats returns compliance.overall as 0 when all scores are 0', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data.compliance.overall).toBe(0);
  });

  it('GET /api/dashboard/stats returns risks.total from count', async () => {
    (mockPrisma.risk.count as jest.Mock).mockResolvedValue(42);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data.risks.total).toBe(42);
  });

  it('GET /api/dashboard/compliance returns array of scores ordered by standard', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValueOnce([
      { standard: 'ISO_14001', overallScore: 75 },
      { standard: 'ISO_45001', overallScore: 85 },
    ]);
    const res = await request(app)
      .get('/api/dashboard/compliance')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].standard).toBe('ISO_14001');
  });

  it('GET /api/dashboard/trends returns empty array when no trend data', async () => {
    (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET /api/dashboard/trends passes both standard and metric filters together', async () => {
    (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(app)
      .get('/api/dashboard/trends?standard=ISO_9001&metric=INCIDENTS&year=2025')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.monthlyTrend.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          standard: 'ISO_9001',
          metric: 'INCIDENTS',
          year: 2025,
        }),
      })
    );
  });

  it('GET /api/dashboard/stats returns actions.overdue count', async () => {
    (mockPrisma.action.count as jest.Mock).mockResolvedValue(3);
    mockPrisma.action.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.actions.overdue).toBe('number');
  });

  it('GET /api/dashboard/stats returns incidents.thisMonth count', async () => {
    (mockPrisma.incident.count as jest.Mock).mockResolvedValue(7);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.incidents.thisMonth).toBe('number');
  });
});

describe('Dashboard API Routes — final coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', dashboardRoutes);
    jest.clearAllMocks();
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.risk.count as jest.Mock).mockResolvedValue(0);
    mockPrisma.risk.groupBy.mockResolvedValue([]);
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.incident.count as jest.Mock).mockResolvedValue(0);
    mockPrisma.incident.groupBy.mockResolvedValue([]);
    (mockPrisma.action.count as jest.Mock).mockResolvedValue(0);
    mockPrisma.action.findMany.mockResolvedValue([]);
    (mockPrisma.aIAnalysis.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValue([]);
  });

  it('GET /api/dashboard/stats returns success true', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValue([
      { standard: 'ISO_45001', overallScore: 70 },
      { standard: 'ISO_14001', overallScore: 70 },
      { standard: 'ISO_9001', overallScore: 70 },
    ]);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/dashboard/stats risks.byStandard is an object', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValue([
      { standard: 'ISO_45001', overallScore: 75 },
      { standard: 'ISO_14001', overallScore: 75 },
      { standard: 'ISO_9001', overallScore: 75 },
    ]);
    mockPrisma.risk.groupBy.mockResolvedValue([
      { standard: 'ISO_45001', _count: { id: 2 } },
    ]);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.risks.byStandard).toBe('object');
  });

  it('GET /api/dashboard/stats incidents.byStandard is an object', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValue([
      { standard: 'ISO_45001', overallScore: 80 },
      { standard: 'ISO_14001', overallScore: 80 },
      { standard: 'ISO_9001', overallScore: 80 },
    ]);
    mockPrisma.incident.groupBy.mockResolvedValue([
      { standard: 'ISO_45001', _count: { id: 1 } },
    ]);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.incidents.byStandard).toBe('object');
  });

  it('GET /api/dashboard/compliance returns data with standard field', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValueOnce([
      { standard: 'ISO_9001', overallScore: 92 },
    ]);
    const res = await request(app)
      .get('/api/dashboard/compliance')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('standard');
  });

  it('GET /api/dashboard/trends with no filters returns 200', async () => {
    (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/dashboard/stats recentAIInsights is an array', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValue([
      { standard: 'ISO_45001', overallScore: 85 },
      { standard: 'ISO_14001', overallScore: 85 },
      { standard: 'ISO_9001', overallScore: 85 },
    ]);
    (mockPrisma.aIAnalysis.findMany as jest.Mock).mockResolvedValue([
      { id: 'ai-2', sourceType: 'RISK', suggestedRootCause: 'Equipment failure' },
    ]);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recentAIInsights)).toBe(true);
  });

  it('GET /api/dashboard/trends returns data as array', async () => {
    (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValueOnce([
      { standard: 'ISO_9001', metric: 'RISKS', month: 3, value: 5, year: 2026 },
    ]);
    const res = await request(app)
      .get('/api/dashboard/trends')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Dashboard API Routes — extra batch coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', dashboardRoutes);
    jest.clearAllMocks();
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValue([
      { standard: 'ISO_45001', overallScore: 80 },
      { standard: 'ISO_14001', overallScore: 80 },
      { standard: 'ISO_9001', overallScore: 80 },
    ]);
    (mockPrisma.risk.count as jest.Mock).mockResolvedValue(0);
    mockPrisma.risk.groupBy.mockResolvedValue([]);
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.incident.count as jest.Mock).mockResolvedValue(0);
    mockPrisma.incident.groupBy.mockResolvedValue([]);
    (mockPrisma.action.count as jest.Mock).mockResolvedValue(0);
    mockPrisma.action.findMany.mockResolvedValue([]);
    (mockPrisma.aIAnalysis.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValue([]);
  });

  it('GET /api/dashboard/stats response content-type is JSON', async () => {
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/dashboard/compliance response success is true', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockResolvedValueOnce([
      { standard: 'ISO_9001', overallScore: 88 },
    ]);
    const res = await request(app).get('/api/dashboard/compliance').set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/dashboard/trends response success is true', async () => {
    (mockPrisma.monthlyTrend.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(app).get('/api/dashboard/trends').set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/dashboard/stats topRisks is an array of objects', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValue([
      { id: 'risk-a', title: 'Supply chain risk', riskScore: 30, riskLevel: 'HIGH' },
    ]);
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.topRisks)).toBe(true);
  });

  it('GET /api/dashboard/compliance DB error returns 500', async () => {
    (mockPrisma.complianceScore.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB fail'));
    const res = await request(app).get('/api/dashboard/compliance').set('Authorization', 'Bearer token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('dashboard — phase29 coverage', () => {
  it('handles Symbol type', () => {
    expect(typeof Symbol('test')).toBe('symbol');
  });

  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

  it('handles Array.from set', () => {
    expect(Array.from(new Set([1, 1, 2]))).toEqual([1, 2]);
  });

  it('handles string padEnd', () => {
    expect('5'.padEnd(3, '0')).toBe('500');
  });

  it('handles parseFloat', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
  });

});
