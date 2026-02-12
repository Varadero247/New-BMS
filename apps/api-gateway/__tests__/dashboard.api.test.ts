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
      mockPrisma.complianceScore.findMany.mockResolvedValue([
        { standard: 'ISO_45001', overallScore: 85 },
        { standard: 'ISO_14001', overallScore: 90 },
        { standard: 'ISO_9001', overallScore: 88 },
      ] as any);

      mockPrisma.risk.count.mockResolvedValue(10);
      mockPrisma.risk.groupBy.mockResolvedValue([
        { standard: 'ISO_45001', _count: { id: 5 } },
        { standard: 'ISO_14001', _count: { id: 3 } },
      ] as any);
      mockPrisma.risk.findMany.mockResolvedValue([
        { id: '10000000-0000-4000-a000-000000000001', title: 'Risk 1', riskScore: 25, riskLevel: 'CRITICAL' },
      ] as any);

      mockPrisma.incident.count.mockResolvedValue(5);
      mockPrisma.incident.groupBy.mockResolvedValue([
        { standard: 'ISO_45001', _count: { id: 3 } },
      ] as any);

      mockPrisma.action.count.mockResolvedValue(20);
      mockPrisma.action.findMany.mockResolvedValue([
        { id: '13000000-0000-4000-a000-000000000001', title: 'Overdue Action', dueDate: new Date() },
      ] as any);

      mockPrisma.aIAnalysis.findMany.mockResolvedValue([
        { id: 'ai-1', sourceType: 'INCIDENT', suggestedRootCause: 'Test cause' },
      ] as any);
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
      mockPrisma.complianceScore.findMany.mockResolvedValueOnce([]);

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
      ] as any);

      const response = await request(app)
        .get('/api/dashboard/compliance')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array when no compliance data', async () => {
      mockPrisma.complianceScore.findMany.mockResolvedValueOnce([]);

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
      mockPrisma.monthlyTrend.findMany.mockResolvedValueOnce(mockTrends as any);

      const response = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by standard', async () => {
      mockPrisma.monthlyTrend.findMany.mockResolvedValueOnce(mockTrends as any);

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
      mockPrisma.monthlyTrend.findMany.mockResolvedValueOnce(mockTrends as any);

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
      mockPrisma.monthlyTrend.findMany.mockResolvedValueOnce(mockTrends as any);

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

      await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', 'Bearer token');

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
