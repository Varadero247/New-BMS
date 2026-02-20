import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    esgTarget: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    esgMetric: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    EsgTargetWhereInput: {},
    EsgMetricWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '20000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
      tenantId: 'tenant-1',
    };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));
jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import esgRoutes from '../src/routes/esg';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ESG / Sustainability API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/esg', esgRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/esg/summary
  // ============================================
  describe('GET /api/esg/summary', () => {
    it('should return ESG summary with GHG, energy, water, waste', async () => {
      const mockMetrics = [
        {
          id: '1',
          category: 'GHG_SCOPE_1',
          subcategory: 'Direct',
          period: '2026-01',
          value: 120,
          unit: 'tCO2e',
          source: 'Meter',
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          category: 'GHG_SCOPE_2',
          subcategory: 'Electricity',
          period: '2026-01',
          value: 80,
          unit: 'tCO2e',
          source: 'Grid',
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          category: 'GHG_SCOPE_3',
          subcategory: 'Supply Chain',
          period: '2026-02',
          value: 200,
          unit: 'tCO2e',
          source: 'Calc',
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          category: 'ENERGY',
          subcategory: 'Electricity',
          period: '2026-01',
          value: 500,
          unit: 'MWh',
          source: 'Meter',
          verified: true,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '5',
          category: 'WATER',
          subcategory: 'Mains',
          period: '2026-01',
          value: 300,
          unit: 'm3',
          source: 'Meter',
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '6',
          category: 'WASTE',
          subcategory: 'General',
          period: '2026-01',
          value: 50,
          unit: 'tonnes',
          source: 'Manifest',
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.esgMetric.findMany as jest.Mock).mockResolvedValueOnce(mockMetrics);
      (mockPrisma.esgTarget.findMany as jest.Mock).mockResolvedValueOnce([
        { id: '00000000-0000-0000-0000-000000000001', status: 'ON_TRACK' },
        { id: 't2', status: 'ACHIEVED' },
        { id: 't3', status: 'AT_RISK' },
      ]);

      const response = await request(app)
        .get('/api/esg/summary?year=2026')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ghg.scope1).toBe(120);
      expect(response.body.data.ghg.scope2).toBe(80);
      expect(response.body.data.ghg.scope3).toBe(200);
      expect(response.body.data.ghg.total).toBe(400);
      expect(response.body.data.energy.total).toBe(500);
      expect(response.body.data.water.total).toBe(300);
      expect(response.body.data.waste.total).toBe(50);
      expect(response.body.data.targets.total).toBe(3);
      expect(response.body.data.targets.achieved).toBe(1);
      expect(response.body.data.targets.atRisk).toBe(1);
    });

    it('should return zeros when no metrics exist', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.esgTarget.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/esg/summary')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.ghg.total).toBe(0);
      expect(response.body.data.energy.total).toBe(0);
      expect(response.body.data.water.total).toBe(0);
      expect(response.body.data.waste.total).toBe(0);
    });

    it('should handle database errors', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/esg/summary')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/esg/trends
  // ============================================
  describe('GET /api/esg/trends', () => {
    it('should return monthly trend data', async () => {
      const mockMetrics = [
        {
          id: '1',
          category: 'GHG_SCOPE_1',
          period: '2026-01',
          value: 100,
          unit: 'tCO2e',
          subcategory: 'Direct',
          source: null,
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          category: 'GHG_SCOPE_1',
          period: '2026-02',
          value: 95,
          unit: 'tCO2e',
          subcategory: 'Direct',
          source: null,
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          category: 'ENERGY',
          period: '2026-01',
          value: 450,
          unit: 'MWh',
          subcategory: 'Electricity',
          source: null,
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          category: 'ENERGY',
          period: '2026-02',
          value: 420,
          unit: 'MWh',
          subcategory: 'Electricity',
          source: null,
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPrisma.esgMetric.findMany as jest.Mock).mockResolvedValueOnce(mockMetrics);

      const response = await request(app)
        .get('/api/esg/trends?months=6')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].period).toBe('2026-01');
      expect(response.body.data[0].GHG_SCOPE_1).toBe(100);
      expect(response.body.data[0].ENERGY).toBe(450);
    });

    it('should filter by category', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app)
        .get('/api/esg/trends?category=ENERGY')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.esgMetric.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'ENERGY',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/esg/trends')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/esg/targets
  // ============================================
  describe('GET /api/esg/targets', () => {
    const mockTargets = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'ESG-TGT-2602-0001',
        category: 'GHG_SCOPE_1',
        subcategory: 'Direct Emissions',
        description: 'Reduce direct GHG by 30%',
        baselineValue: 1000,
        baselineYear: 2024,
        targetValue: 700,
        targetYear: 2030,
        currentValue: 850,
        unit: 'tCO2e',
        status: 'ON_TRACK',
        notes: null,
        tenantId: 'default',
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 't2',
        refNumber: 'ESG-TGT-2602-0002',
        category: 'WATER',
        subcategory: 'Water Consumption',
        description: 'Reduce water by 20%',
        baselineValue: 500,
        baselineYear: 2024,
        targetValue: 400,
        targetYear: 2028,
        currentValue: 460,
        unit: 'm3',
        status: 'AT_RISK',
        notes: null,
        tenantId: 'default',
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    it('should return list of targets with progress', async () => {
      (mockPrisma.esgTarget.findMany as jest.Mock).mockResolvedValueOnce(mockTargets);
      (mockPrisma.esgTarget.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/esg/targets')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].progressPercent).toBeDefined();
      expect(response.body.meta).toMatchObject({
        page: 1,
        total: 2,
      });
    });

    it('should filter by status', async () => {
      (mockPrisma.esgTarget.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.esgTarget.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/esg/targets?status=ON_TRACK')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.esgTarget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ON_TRACK',
          }),
        })
      );
    });

    it('should filter by category', async () => {
      (mockPrisma.esgTarget.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.esgTarget.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/esg/targets?category=ENERGY')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.esgTarget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'ENERGY',
          }),
        })
      );
    });

    it('should support search', async () => {
      (mockPrisma.esgTarget.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.esgTarget.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/esg/targets?search=reduce').set('Authorization', 'Bearer token');

      expect(mockPrisma.esgTarget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { description: { contains: 'reduce', mode: 'insensitive' } },
              { refNumber: { contains: 'reduce', mode: 'insensitive' } },
              { subcategory: { contains: 'reduce', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should support pagination', async () => {
      (mockPrisma.esgTarget.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.esgTarget.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/esg/targets?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should handle database errors', async () => {
      (mockPrisma.esgTarget.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/esg/targets')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // POST /api/esg/targets
  // ============================================
  describe('POST /api/esg/targets', () => {
    const validPayload = {
      category: 'GHG_SCOPE_1',
      subcategory: 'Direct Emissions',
      description: 'Reduce Scope 1 GHG emissions by 30% by 2030',
      baselineValue: 1000,
      baselineYear: 2024,
      targetValue: 700,
      targetYear: 2030,
      unit: 'tCO2e',
    };

    it('should create a target successfully', async () => {
      (mockPrisma.esgTarget.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.esgTarget.create as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'ESG-TGT-2602-0001',
        ...validPayload,
        status: 'ON_TRACK',
        currentValue: 1000,
        tenantId: 'default',
        createdBy: '20000000-0000-4000-a000-000000000123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        notes: null,
      });

      const response = await request(app)
        .post('/api/esg/targets')
        .set('Authorization', 'Bearer token')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.refNumber).toContain('ESG-TGT-');
      expect(response.body.data.category).toBe('GHG_SCOPE_1');
    });

    it('should generate reference number with ESG-TGT prefix', async () => {
      (mockPrisma.esgTarget.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.esgTarget.create as jest.Mock).mockResolvedValueOnce({
        id: 't2',
        refNumber: 'ESG-TGT-2602-0006',
        ...validPayload,
      });

      await request(app)
        .post('/api/esg/targets')
        .set('Authorization', 'Bearer token')
        .send(validPayload);

      expect(mockPrisma.esgTarget.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringContaining('ESG-TGT-'),
        }),
      });
    });

    it('should create target with optional currentValue', async () => {
      (mockPrisma.esgTarget.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.esgTarget.create as jest.Mock).mockResolvedValueOnce({
        id: 't3',
        refNumber: 'ESG-TGT-2602-0001',
        ...validPayload,
        currentValue: 900,
      });

      const response = await request(app)
        .post('/api/esg/targets')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, currentValue: 900 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing category', async () => {
      const response = await request(app)
        .post('/api/esg/targets')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, category: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category enum', async () => {
      const response = await request(app)
        .post('/api/esg/targets')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, category: 'INVALID_CATEGORY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing description', async () => {
      const { description, ...payload } = validPayload;
      const response = await request(app)
        .post('/api/esg/targets')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing baselineValue', async () => {
      const { baselineValue, ...payload } = validPayload;
      const response = await request(app)
        .post('/api/esg/targets')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing unit', async () => {
      const { unit, ...payload } = validPayload;
      const response = await request(app)
        .post('/api/esg/targets')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors on create', async () => {
      (mockPrisma.esgTarget.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.esgTarget.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/esg/targets')
        .set('Authorization', 'Bearer token')
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // PUT /api/esg/targets/:id
  // ============================================
  describe('PUT /api/esg/targets/:id', () => {
    const existingTarget = {
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'ESG-TGT-2602-0001',
      category: 'GHG_SCOPE_1',
      subcategory: 'Direct Emissions',
      description: 'Reduce Scope 1 GHG by 30%',
      baselineValue: 1000,
      targetValue: 700,
      currentValue: 850,
      status: 'ON_TRACK',
    };

    it('should update target successfully', async () => {
      (mockPrisma.esgTarget.findUnique as jest.Mock).mockResolvedValueOnce(existingTarget);
      (mockPrisma.esgTarget.update as jest.Mock).mockResolvedValueOnce({
        ...existingTarget,
        currentValue: 800,
        status: 'ON_TRACK',
      });

      const response = await request(app)
        .put('/api/esg/targets/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ currentValue: 800 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.currentValue).toBe(800);
    });

    it('should update target status', async () => {
      (mockPrisma.esgTarget.findUnique as jest.Mock).mockResolvedValueOnce(existingTarget);
      (mockPrisma.esgTarget.update as jest.Mock).mockResolvedValueOnce({
        ...existingTarget,
        status: 'ACHIEVED',
      });

      const response = await request(app)
        .put('/api/esg/targets/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'ACHIEVED' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('ACHIEVED');
    });

    it('should return 404 for non-existent target', async () => {
      (mockPrisma.esgTarget.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/esg/targets/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ currentValue: 800 });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status enum', async () => {
      (mockPrisma.esgTarget.findUnique as jest.Mock).mockResolvedValueOnce(existingTarget);

      const response = await request(app)
        .put('/api/esg/targets/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors on update', async () => {
      (mockPrisma.esgTarget.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/esg/targets/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ currentValue: 800 });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/esg/report
  // ============================================
  describe('GET /api/esg/report', () => {
    it('should generate GRI/TCFD-aligned report', async () => {
      const currentMetrics = [
        {
          id: '1',
          category: 'GHG_SCOPE_1',
          period: '2026-01',
          value: 100,
          unit: 'tCO2e',
          subcategory: 'Direct',
          source: null,
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          category: 'GHG_SCOPE_2',
          period: '2026-01',
          value: 80,
          unit: 'tCO2e',
          subcategory: 'Electricity',
          source: null,
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          category: 'ENERGY',
          period: '2026-01',
          value: 500,
          unit: 'MWh',
          subcategory: 'Electricity',
          source: null,
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const prevMetrics = [
        {
          id: 'p1',
          category: 'GHG_SCOPE_1',
          period: '2025-01',
          value: 120,
          unit: 'tCO2e',
          subcategory: 'Direct',
          source: null,
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'p2',
          category: 'ENERGY',
          period: '2025-01',
          value: 550,
          unit: 'MWh',
          subcategory: 'Electricity',
          source: null,
          verified: false,
          notes: null,
          createdBy: null,
          tenantId: 'default',
          verifiedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const targets = [
        {
          id: '00000000-0000-0000-0000-000000000001',
          refNumber: 'ESG-TGT-2602-0001',
          category: 'GHG_SCOPE_1',
          subcategory: 'Direct',
          description: 'Reduce Scope 1',
          baselineValue: 1000,
          targetValue: 700,
          currentValue: 850,
          status: 'ON_TRACK',
          unit: 'tCO2e',
        },
      ];

      (mockPrisma.esgMetric.findMany as jest.Mock)
        .mockResolvedValueOnce(currentMetrics)
        .mockResolvedValueOnce(prevMetrics);
      (mockPrisma.esgTarget.findMany as jest.Mock).mockResolvedValueOnce(targets);

      const response = await request(app)
        .get('/api/esg/report?year=2026')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reportYear).toBe(2026);
      expect(response.body.data.gri).toBeDefined();
      expect(response.body.data.gri['GRI 305']).toBeDefined();
      expect(response.body.data.gri['GRI 305'].scope1).toBe(100);
      expect(response.body.data.gri['GRI 302']).toBeDefined();
      expect(response.body.data.tcfd).toBeDefined();
      expect(response.body.data.tcfd.metricsAndTargets).toBeDefined();
      expect(response.body.data.yearOverYear).toBeDefined();
      expect(response.body.data.yearOverYear.GHG_SCOPE_1.current).toBe(100);
      expect(response.body.data.yearOverYear.GHG_SCOPE_1.previous).toBe(120);
      expect(response.body.data.targets).toHaveLength(1);
    });

    it('should handle empty data gracefully', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      (mockPrisma.esgTarget.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/esg/report')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.summary.totalMetricEntries).toBe(0);
      expect(response.body.data.gri['GRI 305'].scope1).toBe(0);
    });

    it('should handle database errors', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/esg/report')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // POST /api/esg/metrics
  // ============================================
  describe('POST /api/esg/metrics', () => {
    const validPayload = {
      category: 'GHG_SCOPE_1',
      subcategory: 'Direct Fuel Combustion',
      period: '2026-01',
      value: 120.5,
      unit: 'tCO2e',
      source: 'Fuel meter readings',
    };

    it('should create a metric data point successfully', async () => {
      (mockPrisma.esgMetric.create as jest.Mock).mockResolvedValueOnce({
        id: 'm1',
        ...validPayload,
        verified: false,
        notes: null,
        tenantId: 'default',
        verifiedBy: null,
        createdBy: '20000000-0000-4000-a000-000000000123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/esg/metrics')
        .set('Authorization', 'Bearer token')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe('GHG_SCOPE_1');
      expect(response.body.data.value).toBe(120.5);
    });

    it('should create a metric with verified flag', async () => {
      (mockPrisma.esgMetric.create as jest.Mock).mockResolvedValueOnce({
        id: 'm2',
        ...validPayload,
        verified: true,
      });

      const response = await request(app)
        .post('/api/esg/metrics')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, verified: true });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing category', async () => {
      const response = await request(app)
        .post('/api/esg/metrics')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, category: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid period format', async () => {
      const response = await request(app)
        .post('/api/esg/metrics')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, period: '2026/01' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing value', async () => {
      const { value, ...payload } = validPayload;
      const response = await request(app)
        .post('/api/esg/metrics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing unit', async () => {
      const { unit, ...payload } = validPayload;
      const response = await request(app)
        .post('/api/esg/metrics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing subcategory', async () => {
      const { subcategory, ...payload } = validPayload;
      const response = await request(app)
        .post('/api/esg/metrics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors on metric create', async () => {
      (mockPrisma.esgMetric.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/esg/metrics')
        .set('Authorization', 'Bearer token')
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/esg/metrics
  // ============================================
  describe('GET /api/esg/metrics', () => {
    const mockMetrics = [
      {
        id: 'm1',
        category: 'GHG_SCOPE_1',
        subcategory: 'Direct Fuel',
        period: '2026-02',
        value: 120.5,
        unit: 'tCO2e',
        source: 'Fuel meter',
        verified: false,
        notes: null,
        tenantId: 'default',
        verifiedBy: null,
        createdBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'm2',
        category: 'ENERGY',
        subcategory: 'Electricity',
        period: '2026-02',
        value: 450,
        unit: 'MWh',
        source: 'Grid meter',
        verified: true,
        notes: null,
        tenantId: 'default',
        verifiedBy: 'auditor-1',
        createdBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    it('should return list of metrics with pagination', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockResolvedValueOnce(mockMetrics);
      (mockPrisma.esgMetric.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/esg/metrics')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        total: 2,
      });
    });

    it('should filter by category', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.esgMetric.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/esg/metrics?category=GHG_SCOPE_1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.esgMetric.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'GHG_SCOPE_1',
          }),
        })
      );
    });

    it('should filter by period', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.esgMetric.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/esg/metrics?period=2026-01')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.esgMetric.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            period: '2026-01',
          }),
        })
      );
    });

    it('should filter by verified status', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.esgMetric.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/esg/metrics?verified=true').set('Authorization', 'Bearer token');

      expect(mockPrisma.esgMetric.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            verified: true,
          }),
        })
      );
    });

    it('should support pagination', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.esgMetric.count as jest.Mock).mockResolvedValueOnce(200);

      const response = await request(app)
        .get('/api/esg/metrics?page=5&limit=20')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(5);
      expect(response.body.meta.limit).toBe(20);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should handle database errors on list', async () => {
      (mockPrisma.esgMetric.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/esg/metrics')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
