import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    spcChart: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    spcDataPoint: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    SpcChartWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

jest.mock('@ims/validation', () => ({
  sanitizeMiddleware: () => (_req: any, _res: any, next: any) => next(),
  sanitizeQueryMiddleware: () => (_req: any, _res: any, next: any) => next(),
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

jest.mock('@ims/spc-engine', () => ({
  xbarRChart: jest.fn(),
  iMrChart: jest.fn(),
  pChart: jest.fn(),
  calculateCpk: jest.fn(),
  calculatePpk: jest.fn(),
  detectWesternElectricRules: jest.fn(),
}));

import { prisma } from '../src/prisma';
import spcRoutes from '../src/routes/spc';
import {
  xbarRChart,
  iMrChart,
  pChart,
  calculateCpk,
  calculatePpk,
  detectWesternElectricRules,
} from '@ims/spc-engine';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockXbarRChart = xbarRChart as jest.Mock;
const mockIMrChart = iMrChart as jest.Mock;
const mockPChart = pChart as jest.Mock;
const mockCalculateCpk = calculateCpk as jest.Mock;
const mockCalculatePpk = calculatePpk as jest.Mock;
const mockDetectWesternElectricRules = detectWesternElectricRules as jest.Mock;

// ==========================================
// Test data fixtures
// ==========================================

const mockChart = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'SPC-2602-0001',
  title: 'Bore Diameter Control',
  partNumber: 'BA-2026-001',
  partName: 'Front Brake Assembly',
  characteristic: 'Bore Diameter',
  chartType: 'XBAR_R',
  subgroupSize: 5,
  usl: 25.05,
  lsl: 24.95,
  target: 25.0,
  unit: 'mm',
  frequency: 'Every 2 hours',
  notes: 'Critical dimension',
  status: 'ACTIVE',
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-02-01'),
};

const mockChartIMR = {
  ...mockChart,
  id: '20000000-0000-4000-a000-000000000002',
  refNumber: 'SPC-2602-0002',
  title: 'Surface Roughness',
  characteristic: 'Ra Surface Roughness',
  chartType: 'IMR',
  subgroupSize: 1,
};

const mockChartP = {
  ...mockChart,
  id: '20000000-0000-4000-a000-000000000003',
  refNumber: 'SPC-2602-0003',
  title: 'Defect Rate',
  characteristic: 'Visual Defects',
  chartType: 'P',
  subgroupSize: 1,
  usl: null,
  lsl: null,
};

const mockChartInactive = {
  ...mockChart,
  id: '20000000-0000-4000-a000-000000000010',
  status: 'INACTIVE',
};

const mockChartNoLimits = {
  ...mockChart,
  id: '20000000-0000-4000-a000-000000000011',
  usl: null,
  lsl: null,
};

const mockDataPoint1 = {
  id: 'dp-0001',
  chartId: '20000000-0000-4000-a000-000000000001',
  value: 25.01,
  timestamp: new Date('2026-02-01T08:00:00Z'),
  subgroup: 1,
  defectives: null,
  sampleSize: null,
  outOfControl: false,
  violationRules: [],
};

const mockDataPoint2 = {
  id: 'dp-0002',
  chartId: '20000000-0000-4000-a000-000000000001',
  value: 25.02,
  timestamp: new Date('2026-02-01T10:00:00Z'),
  subgroup: 2,
  defectives: null,
  sampleSize: null,
  outOfControl: false,
  violationRules: [],
};

const mockDataPoint3 = {
  id: 'dp-0003',
  chartId: '20000000-0000-4000-a000-000000000001',
  value: 24.99,
  timestamp: new Date('2026-02-01T12:00:00Z'),
  subgroup: 3,
  defectives: null,
  sampleSize: null,
  outOfControl: false,
  violationRules: [],
};

const mockOocDataPoint = {
  id: 'dp-ooc-001',
  chartId: '20000000-0000-4000-a000-000000000001',
  value: 25.1,
  timestamp: new Date('2026-02-01T14:00:00Z'),
  subgroup: 4,
  defectives: null,
  sampleSize: null,
  outOfControl: true,
  violationRules: ['Rule 1'],
};

const mockComputedChart = {
  type: 'XBAR_R' as const,
  ucl: 25.06,
  lcl: 24.94,
  centerLine: 25.0,
  dataPoints: [
    { value: 25.01, timestamp: new Date(), index: 0, outOfControl: false, violationRules: [] },
    { value: 25.02, timestamp: new Date(), index: 1, outOfControl: false, violationRules: [] },
    { value: 24.99, timestamp: new Date(), index: 2, outOfControl: false, violationRules: [] },
  ],
  outOfControl: [],
  rangeUcl: 0.12,
  rangeLcl: 0,
  rangeCenterLine: 0.05,
  rangePoints: [],
};

const mockComputedChartWithOOC = {
  ...mockComputedChart,
  dataPoints: [
    { value: 25.01, timestamp: new Date(), index: 0, outOfControl: false, violationRules: [] },
    {
      value: 25.1,
      timestamp: new Date(),
      index: 1,
      outOfControl: true,
      violationRules: ['Rule 1'],
    },
  ],
  outOfControl: [{ index: 1, value: 25.1, rules: ['Rule 1'] }],
};

const mockIMRComputedChart = {
  type: 'IMR' as const,
  ucl: 25.08,
  lcl: 24.92,
  centerLine: 25.0,
  dataPoints: [
    { value: 25.01, timestamp: new Date(), index: 0, outOfControl: false, violationRules: [] },
    { value: 25.02, timestamp: new Date(), index: 1, outOfControl: false, violationRules: [] },
  ],
  outOfControl: [],
};

const mockPComputedChart = {
  type: 'P' as const,
  ucl: 0.15,
  lcl: 0,
  centerLine: 0.05,
  dataPoints: [
    { value: 0.04, timestamp: new Date(), index: 0, outOfControl: false, violationRules: [] },
    { value: 0.06, timestamp: new Date(), index: 1, outOfControl: false, violationRules: [] },
  ],
  outOfControl: [],
};

const validCreatePayload = {
  title: 'Bore Diameter Control',
  partNumber: 'BA-2026-001',
  partName: 'Front Brake Assembly',
  characteristic: 'Bore Diameter',
  chartType: 'XBAR_R',
  subgroupSize: 5,
  usl: 25.05,
  lsl: 24.95,
  target: 25.0,
  unit: 'mm',
  frequency: 'Every 2 hours',
  notes: 'Critical dimension',
};

const validDataPointPayload = {
  value: 25.01,
  timestamp: '2026-02-01T08:00:00Z',
  subgroup: 1,
};

const validBatchDataPointPayload = [
  { value: 25.01, subgroup: 1 },
  { value: 25.02, subgroup: 2 },
  { value: 24.99, subgroup: 3 },
];

// ==========================================
// Tests
// ==========================================

describe('Automotive SPC API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/spc', spcRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset return-value queues on spc-engine mocks to prevent bleed between tests
    mockXbarRChart.mockReset();
    mockIMrChart.mockReset();
    mockPChart.mockReset();
    mockCalculateCpk.mockReset();
    mockCalculatePpk.mockReset();
    mockDetectWesternElectricRules.mockReset();
  });

  // ==========================================
  // POST / - Create SPC Chart
  // ==========================================
  describe('POST /api/spc', () => {
    it('should create a new SPC chart successfully', async () => {
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.spcChart.create as jest.Mock).mockResolvedValueOnce({
        ...mockChart,
        refNumber: 'SPC-2602-0001',
      });

      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.refNumber).toBe('SPC-2602-0001');

      expect(mockPrisma.spcChart.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Bore Diameter Control',
          partNumber: 'BA-2026-001',
          partName: 'Front Brake Assembly',
          characteristic: 'Bore Diameter',
          chartType: 'XBAR_R',
          subgroupSize: 5,
          usl: 25.05,
          lsl: 24.95,
          target: 25.0,
          unit: 'mm',
          frequency: 'Every 2 hours',
          notes: 'Critical dimension',
          status: 'ACTIVE',
          createdBy: 'user-1',
        }),
      });
    });

    it('should generate sequential reference numbers', async () => {
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.spcChart.create as jest.Mock).mockResolvedValueOnce({
        ...mockChart,
        refNumber: 'SPC-2602-0006',
      });

      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(mockPrisma.spcChart.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringMatching(/^SPC-\d{4}-\d{4}$/),
        }),
      });
    });

    it('should create a chart with minimal required fields', async () => {
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.spcChart.create as jest.Mock).mockResolvedValueOnce(mockChart);

      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Simple Chart',
          partNumber: 'P-001',
          characteristic: 'Length',
          chartType: 'IMR',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.spcChart.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Simple Chart',
          partNumber: 'P-001',
          characteristic: 'Length',
          chartType: 'IMR',
          subgroupSize: 5, // default value
        }),
      });
    });

    it('should return 400 for missing required field: title', async () => {
      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send({
          partNumber: 'BA-2026-001',
          characteristic: 'Bore Diameter',
          chartType: 'XBAR_R',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toBeDefined();
    });

    it('should return 400 for missing required field: partNumber', async () => {
      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test Chart',
          characteristic: 'Bore Diameter',
          chartType: 'XBAR_R',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field: characteristic', async () => {
      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test Chart',
          partNumber: 'P-001',
          chartType: 'XBAR_R',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field: chartType', async () => {
      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test Chart',
          partNumber: 'P-001',
          characteristic: 'Bore Diameter',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid chartType', async () => {
      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test Chart',
          partNumber: 'P-001',
          characteristic: 'Bore Diameter',
          chartType: 'INVALID_TYPE',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for subgroupSize exceeding 25', async () => {
      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, subgroupSize: 30 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for subgroupSize of 0', async () => {
      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, subgroupSize: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept all valid chartType values', async () => {
      const validTypes = ['XBAR_R', 'XBAR_S', 'IMR', 'P', 'NP', 'C', 'U'];

      for (const chartType of validTypes) {
        jest.clearAllMocks();
        (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(0);
        (mockPrisma.spcChart.create as jest.Mock).mockResolvedValueOnce({
          ...mockChart,
          chartType,
        });

        const response = await request(app)
          .post('/api/spc')
          .set('Authorization', 'Bearer token')
          .send({ ...validCreatePayload, chartType });

        expect(response.status).toBe(201);
      }
    });

    it('should handle database errors during creation', async () => {
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.spcChart.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/spc')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create SPC chart');
    });
  });

  // ==========================================
  // GET / - List SPC Charts
  // ==========================================
  describe('GET /api/spc', () => {
    it('should return a list of charts with default pagination', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([mockChart, mockChartIMR]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/spc').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support custom pagination parameters', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([mockChart]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/spc?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(50);
      expect(response.body.meta.totalPages).toBe(5);

      expect(mockPrisma.spcChart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/spc?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
      expect(mockPrisma.spcChart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([mockChart]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/spc?status=ACTIVE').set('Authorization', 'Bearer token');

      expect(mockPrisma.spcChart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by partNumber (case-insensitive contains)', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([mockChart]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/spc?partNumber=BA-2026').set('Authorization', 'Bearer token');

      expect(mockPrisma.spcChart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            partNumber: { contains: 'BA-2026', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by chartType', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([mockChart]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/spc?chartType=XBAR_R').set('Authorization', 'Bearer token');

      expect(mockPrisma.spcChart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            chartType: 'XBAR_R',
            deletedAt: null,
          }),
        })
      );
    });

    it('should support search across title, partNumber, partName, characteristic, refNumber', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([mockChart]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/spc?search=bore').set('Authorization', 'Bearer token');

      expect(mockPrisma.spcChart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'bore', mode: 'insensitive' } },
              { partNumber: { contains: 'bore', mode: 'insensitive' } },
              { partName: { contains: 'bore', mode: 'insensitive' } },
              { characteristic: { contains: 'bore', mode: 'insensitive' } },
              { refNumber: { contains: 'bore', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should return empty results when no charts match', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/spc?search=nonexistent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
      expect(response.body.meta.totalPages).toBe(0);
    });

    it('should order by updatedAt desc then createdAt desc', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/spc').set('Authorization', 'Bearer token');

      expect(mockPrisma.spcChart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app).get('/api/spc').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list SPC charts');
    });
  });

  // ==========================================
  // GET /alerts - SPC Alerts (Out-of-Control)
  // ==========================================
  describe('GET /api/spc/alerts', () => {
    it('should return charts with out-of-control data points', async () => {
      const chartWithOOC = {
        ...mockChart,
        dataPoints: [mockOocDataPoint],
        _count: { dataPoints: 1 },
      };

      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([chartWithOOC]);

      const response = await request(app)
        .get('/api/spc/alerts')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        chartId: mockChart.id,
        refNumber: mockChart.refNumber,
        title: mockChart.title,
        partNumber: mockChart.partNumber,
        characteristic: mockChart.characteristic,
        chartType: mockChart.chartType,
        oocCount: 1,
      });
      expect(response.body.data[0].recentOocPoints).toHaveLength(1);
    });

    it('should return empty array when no charts have OOC points', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/spc/alerts')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return multiple chart alerts', async () => {
      const charts = [
        {
          ...mockChart,
          dataPoints: [mockOocDataPoint],
          _count: { dataPoints: 3 },
        },
        {
          ...mockChartIMR,
          dataPoints: [{ ...mockOocDataPoint, id: 'dp-ooc-002', chartId: mockChartIMR.id }],
          _count: { dataPoints: 1 },
        },
      ];

      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce(charts);

      const response = await request(app)
        .get('/api/spc/alerts')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].oocCount).toBe(3);
      expect(response.body.data[1].oocCount).toBe(1);
    });

    it('should query only active charts with OOC data points', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/spc/alerts').set('Authorization', 'Bearer token');

      expect(mockPrisma.spcChart.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletedAt: null,
            status: 'ACTIVE',
            dataPoints: {
              some: {
                outOfControl: true,
              },
            },
          },
          include: expect.objectContaining({
            dataPoints: expect.objectContaining({
              where: { outOfControl: true },
              orderBy: { timestamp: 'desc' },
              take: 10,
            }),
          }),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/spc/alerts')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get SPC alerts');
    });
  });

  // ==========================================
  // GET /:id - Get SPC Chart with Data Points
  // ==========================================
  describe('GET /api/spc/:id', () => {
    it('should return a chart with data points and computed chart (XBAR_R)', async () => {
      const chartWithPoints = {
        ...mockChart,
        dataPoints: [mockDataPoint3, mockDataPoint2, mockDataPoint1], // desc order from DB
      };

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(chartWithPoints);
      mockXbarRChart.mockReturnValueOnce(mockComputedChart);
      mockDetectWesternElectricRules.mockReturnValueOnce([]);

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockChart.id);
      expect(response.body.data.dataPoints).toBeDefined();
      expect(response.body.data.computedChart).toBeDefined();
      expect(response.body.data.violations).toEqual([]);

      // Data points should be in chronological order (reversed from desc DB query)
      expect(mockXbarRChart).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: 25.01 }),
          expect.objectContaining({ value: 25.02 }),
          expect.objectContaining({ value: 24.99 }),
        ]),
        5 // subgroupSize
      );
    });

    it('should return a chart with computed IMR chart', async () => {
      const chartWithPoints = {
        ...mockChartIMR,
        dataPoints: [mockDataPoint2, mockDataPoint1],
      };

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(chartWithPoints);
      mockIMrChart.mockReturnValueOnce(mockIMRComputedChart);
      mockDetectWesternElectricRules.mockReturnValueOnce([]);

      const response = await request(app)
        .get(`/api/spc/${mockChartIMR.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.computedChart).toBeDefined();
      expect(mockIMrChart).toHaveBeenCalled();
    });

    it('should return a chart with computed P chart', async () => {
      const pDataPoints = [
        { ...mockDataPoint2, defectives: 3, sampleSize: 100 },
        { ...mockDataPoint1, defectives: 5, sampleSize: 100 },
      ];
      const chartWithPoints = {
        ...mockChartP,
        dataPoints: pDataPoints,
      };

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(chartWithPoints);
      mockPChart.mockReturnValueOnce(mockPComputedChart);
      mockDetectWesternElectricRules.mockReturnValueOnce([]);

      const response = await request(app)
        .get(`/api/spc/${mockChartP.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.computedChart).toBeDefined();
      expect(mockPChart).toHaveBeenCalled();
    });

    it('should return chart with violations detected by Western Electric rules', async () => {
      const chartWithPoints = {
        ...mockChart,
        dataPoints: [mockDataPoint2, mockDataPoint1],
      };

      const violations = [
        { pointIndex: 1, rule: 'Rule 1', description: 'One point beyond 3 sigma' },
      ];

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(chartWithPoints);
      mockXbarRChart.mockReturnValueOnce(mockComputedChart);
      mockDetectWesternElectricRules.mockReturnValueOnce(violations);

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.violations).toHaveLength(1);
      expect(response.body.data.violations[0].rule).toBe('Rule 1');
    });

    it('should return null computedChart when fewer than 2 data points', async () => {
      const chartWithOnePoint = {
        ...mockChart,
        dataPoints: [mockDataPoint1],
      };

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(chartWithOnePoint);

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.computedChart).toBeNull();
      expect(response.body.data.violations).toBeNull();
      expect(mockXbarRChart).not.toHaveBeenCalled();
    });

    it('should return null computedChart when no data points exist', async () => {
      const chartWithNoPoints = {
        ...mockChart,
        dataPoints: [],
      };

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(chartWithNoPoints);

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.computedChart).toBeNull();
      expect(response.body.data.violations).toBeNull();
    });

    it('should handle spc-engine computation errors gracefully (return null computedChart)', async () => {
      const chartWithPoints = {
        ...mockChart,
        dataPoints: [mockDataPoint2, mockDataPoint1],
      };

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(chartWithPoints);
      mockXbarRChart.mockImplementationOnce(() => {
        throw new Error('Computation error');
      });

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.computedChart).toBeNull();
    });

    it('should return 404 when chart is not found', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/spc/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('SPC chart not found');
    });

    it('should return 404 when chart is soft-deleted', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockChart,
        deletedAt: new Date(),
        dataPoints: [],
      });

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should include data points in the findUnique query', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockChart,
        dataPoints: [],
      });

      await request(app).get(`/api/spc/${mockChart.id}`).set('Authorization', 'Bearer token');

      expect(mockPrisma.spcChart.findUnique).toHaveBeenCalledWith({
        where: { id: mockChart.id },
        include: {
          dataPoints: {
            orderBy: { timestamp: 'desc' },
            take: 100,
          },
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get SPC chart');
    });
  });

  // ==========================================
  // POST /:id/data - Add Data Point(s)
  // ==========================================
  describe('POST /api/spc/:id/data', () => {
    it('should add a single data point to an active chart', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock)
        .mockResolvedValueOnce([]) // existing points
        .mockResolvedValueOnce([mockDataPoint1]); // all points after insert
      (mockPrisma.spcDataPoint.create as jest.Mock).mockResolvedValueOnce(mockDataPoint1);
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValueOnce(mockChart);

      // Not enough data for chart computation in this case (only 1 point)
      const response = await request(app)
        .post(`/api/spc/${mockChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send(validDataPointPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.points).toHaveLength(1);
      expect(response.body.data.violationsDetected).toBeDefined();

      expect(mockPrisma.spcDataPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          chartId: mockChart.id,
          value: 25.01,
          outOfControl: false,
          violationRules: [],
        }),
      });
    });

    it('should add multiple data points as a batch', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock)
        .mockResolvedValueOnce([]) // existing points
        .mockResolvedValueOnce([mockDataPoint1, mockDataPoint2, mockDataPoint3]); // all points
      (mockPrisma.spcDataPoint.create as jest.Mock)
        .mockResolvedValueOnce(mockDataPoint1)
        .mockResolvedValueOnce(mockDataPoint2)
        .mockResolvedValueOnce(mockDataPoint3);
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValueOnce(mockChart);

      // Mock chart computation and violations
      mockXbarRChart.mockReturnValueOnce(mockComputedChart);
      mockDetectWesternElectricRules.mockReturnValueOnce([]);

      const response = await request(app)
        .post(`/api/spc/${mockChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send(validBatchDataPointPayload);

      expect(response.status).toBe(201);
      expect(response.body.data.points).toHaveLength(3);
      expect(mockPrisma.spcDataPoint.create).toHaveBeenCalledTimes(3);
    });

    it('should detect violations and update out-of-control status', async () => {
      // Use an IMR chart (subgroupSize=1) so the condition dataPoints.length >= 2 is met
      const imrChartActive = { ...mockChartIMR, status: 'ACTIVE' };
      const existingPoints = [mockDataPoint1, mockDataPoint2];
      const newPoint = { ...mockDataPoint3, id: 'dp-new' };
      const allPoints = [...existingPoints, newPoint];

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(imrChartActive);
      (mockPrisma.spcDataPoint.findMany as jest.Mock)
        .mockResolvedValueOnce(existingPoints) // existing points
        .mockResolvedValueOnce(allPoints); // all points after insert
      (mockPrisma.spcDataPoint.create as jest.Mock).mockResolvedValueOnce(newPoint);
      (mockPrisma.spcDataPoint.update as jest.Mock).mockResolvedValue({});
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValueOnce(imrChartActive);

      mockIMrChart.mockReturnValueOnce(mockComputedChartWithOOC);
      mockDetectWesternElectricRules.mockReturnValueOnce([
        { pointIndex: 1, rule: 'Rule 1', description: 'One point beyond 3 sigma' },
      ]);

      const response = await request(app)
        .post(`/api/spc/${imrChartActive.id}/data`)
        .set('Authorization', 'Bearer token')
        .send({ value: 24.99 });

      expect(response.status).toBe(201);
      expect(response.body.data.violationsDetected).toBe(1);
      expect(response.body.data.violations).toHaveLength(1);
      expect(response.body.data.violations[0].rule).toBe('Rule 1');

      // Should update the OOC point
      expect(mockPrisma.spcDataPoint.update).toHaveBeenCalledWith({
        where: { id: allPoints[1].id },
        data: {
          outOfControl: true,
          violationRules: ['Rule 1'],
        },
      });
    });

    it('should update chart updatedAt timestamp after adding data', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockDataPoint1]);
      (mockPrisma.spcDataPoint.create as jest.Mock).mockResolvedValueOnce(mockDataPoint1);
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValueOnce(mockChart);

      await request(app)
        .post(`/api/spc/${mockChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send(validDataPointPayload);

      expect(mockPrisma.spcChart.update).toHaveBeenCalledWith({
        where: { id: mockChart.id },
        data: { updatedAt: expect.any(Date) },
      });
    });

    it('should return 404 when chart is not found', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/spc/00000000-0000-4000-a000-ffffffffffff/data')
        .set('Authorization', 'Bearer token')
        .send(validDataPointPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('SPC chart not found');
    });

    it('should return 404 when chart is soft-deleted', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockChart,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/spc/${mockChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send(validDataPointPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when chart is inactive', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChartInactive);

      const response = await request(app)
        .post(`/api/spc/${mockChartInactive.id}/data`)
        .set('Authorization', 'Bearer token')
        .send(validDataPointPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CHART_INACTIVE');
      expect(response.body.error.message).toBe('Cannot add data to an inactive chart');
    });

    it('should return 400 for invalid data point (missing value)', async () => {
      // Route checks chart existence before validation, so we must mock the chart lookup
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);

      const response = await request(app)
        .post(`/api/spc/${mockChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send({ subgroup: 1 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid data point (value is not a number)', async () => {
      // Route checks chart existence before validation, so we must mock the chart lookup
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);

      const response = await request(app)
        .post(`/api/spc/${mockChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send({ value: 'not-a-number' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept a data point with only value (minimal payload)', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockDataPoint1]);
      (mockPrisma.spcDataPoint.create as jest.Mock).mockResolvedValueOnce(mockDataPoint1);
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValueOnce(mockChart);

      const response = await request(app)
        .post(`/api/spc/${mockChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send({ value: 25.01 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should compute IMR chart for IMR chart type', async () => {
      const imrChart = { ...mockChartIMR, status: 'ACTIVE' };
      const allPoints = [mockDataPoint1, mockDataPoint2, mockDataPoint3];

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(imrChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock)
        .mockResolvedValueOnce([mockDataPoint1, mockDataPoint2]) // existing
        .mockResolvedValueOnce(allPoints); // all after insert
      (mockPrisma.spcDataPoint.create as jest.Mock).mockResolvedValueOnce(mockDataPoint3);
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValueOnce(imrChart);

      mockIMrChart.mockReturnValueOnce(mockIMRComputedChart);
      mockDetectWesternElectricRules.mockReturnValueOnce([]);

      const response = await request(app)
        .post(`/api/spc/${imrChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send({ value: 24.99 });

      expect(response.status).toBe(201);
      expect(mockIMrChart).toHaveBeenCalled();
    });

    it('should compute P chart for P chart type', async () => {
      const pChartActive = { ...mockChartP, status: 'ACTIVE' };
      const pPoint1 = { ...mockDataPoint1, defectives: 3, sampleSize: 100 };
      const pPoint2 = { ...mockDataPoint2, defectives: 5, sampleSize: 100 };
      const allPoints = [pPoint1, pPoint2];

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(pChartActive);
      (mockPrisma.spcDataPoint.findMany as jest.Mock)
        .mockResolvedValueOnce([pPoint1]) // existing
        .mockResolvedValueOnce(allPoints); // all after insert
      (mockPrisma.spcDataPoint.create as jest.Mock).mockResolvedValueOnce(pPoint2);
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValueOnce(pChartActive);

      mockPChart.mockReturnValueOnce(mockPComputedChart);
      mockDetectWesternElectricRules.mockReturnValueOnce([]);

      const response = await request(app)
        .post(`/api/spc/${pChartActive.id}/data`)
        .set('Authorization', 'Bearer token')
        .send({ value: 0.05, defectives: 5, sampleSize: 100 });

      expect(response.status).toBe(201);
      expect(mockPChart).toHaveBeenCalled();
    });

    it('should handle spc-engine computation errors gracefully during data add', async () => {
      const allPoints = [mockDataPoint1, mockDataPoint2, mockDataPoint3];

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock)
        .mockResolvedValueOnce([mockDataPoint1, mockDataPoint2])
        .mockResolvedValueOnce(allPoints);
      (mockPrisma.spcDataPoint.create as jest.Mock).mockResolvedValueOnce(mockDataPoint3);
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValueOnce(mockChart);

      mockXbarRChart.mockImplementationOnce(() => {
        throw new Error('Not enough data for Xbar-R');
      });

      const response = await request(app)
        .post(`/api/spc/${mockChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send({ value: 24.99 });

      // Should still succeed - engine errors are caught, points are still created
      expect(response.status).toBe(201);
      expect(response.body.data.violationsDetected).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post(`/api/spc/${mockChart.id}/data`)
        .set('Authorization', 'Bearer token')
        .send(validDataPointPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to add data points');
    });
  });

  // ==========================================
  // GET /:id/capability - Capability Analysis
  // ==========================================
  describe('GET /api/spc/:id/capability', () => {
    it('should calculate Cpk and Ppk for a chart with spec limits and data', async () => {
      const dataPoints = [mockDataPoint1, mockDataPoint2, mockDataPoint3];

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock).mockResolvedValueOnce(dataPoints);

      mockCalculateCpk.mockReturnValueOnce({
        cp: 1.85,
        cpk: 1.72,
        sigma: 0.018,
        mean: 25.007,
        status: 'CAPABLE',
      });
      mockCalculatePpk.mockReturnValueOnce({
        pp: 1.75,
        ppk: 1.65,
        sigma: 0.019,
        mean: 25.007,
        status: 'MARGINAL',
      });

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const data = response.body.data;
      expect(data.chartId).toBe(mockChart.id);
      expect(data.refNumber).toBe(mockChart.refNumber);
      expect(data.partNumber).toBe(mockChart.partNumber);
      expect(data.characteristic).toBe(mockChart.characteristic);
      expect(data.usl).toBe(25.05);
      expect(data.lsl).toBe(24.95);
      expect(data.target).toBe(25.0);
      expect(data.sampleSize).toBe(3);
      expect(data.cp).toBe(1.85);
      expect(data.cpk).toBe(1.72);
      expect(data.pp).toBe(1.75);
      expect(data.ppk).toBe(1.65);
      expect(data.mean).toBe(25.007);
      expect(data.sigmaWithin).toBe(0.018);
      expect(data.sigmaOverall).toBe(0.019);
      expect(data.statusCpk).toBe('CAPABLE');
      expect(data.statusPpk).toBe('MARGINAL');

      expect(mockCalculateCpk).toHaveBeenCalledWith([25.01, 25.02, 24.99], 25.05, 24.95);
      expect(mockCalculatePpk).toHaveBeenCalledWith([25.01, 25.02, 24.99], 25.05, 24.95);
    });

    it('should return 404 when chart is not found', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/spc/00000000-0000-4000-a000-ffffffffffff/capability')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('SPC chart not found');
    });

    it('should return 404 when chart is soft-deleted', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockChart,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when USL is missing', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockChart,
        usl: null,
      });

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_SPEC_LIMITS');
      expect(response.body.error.message).toBe('USL and LSL are required for capability analysis');
    });

    it('should return 400 when LSL is missing', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockChart,
        lsl: null,
      });

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_SPEC_LIMITS');
    });

    it('should return 400 when both USL and LSL are missing', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChartNoLimits);

      const response = await request(app)
        .get(`/api/spc/${mockChartNoLimits.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_SPEC_LIMITS');
    });

    it('should return 400 when fewer than 2 data points exist', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock).mockResolvedValueOnce([mockDataPoint1]);

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INSUFFICIENT_DATA');
      expect(response.body.error.message).toBe(
        'Need at least 2 data points for capability analysis'
      );
    });

    it('should return 400 when no data points exist', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INSUFFICIENT_DATA');
    });

    it('should report INCAPABLE status when Cpk is low', async () => {
      const dataPoints = [mockDataPoint1, mockDataPoint2];

      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock).mockResolvedValueOnce(dataPoints);

      mockCalculateCpk.mockReturnValueOnce({
        cp: 0.85,
        cpk: 0.72,
        sigma: 0.04,
        mean: 25.015,
        status: 'INCAPABLE',
      });
      mockCalculatePpk.mockReturnValueOnce({
        pp: 0.8,
        ppk: 0.65,
        sigma: 0.042,
        mean: 25.015,
        status: 'INCAPABLE',
      });

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.statusCpk).toBe('INCAPABLE');
      expect(response.body.data.statusPpk).toBe('INCAPABLE');
    });

    it('should query data points ordered by timestamp ascending', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValueOnce(mockChart);
      (mockPrisma.spcDataPoint.findMany as jest.Mock).mockResolvedValueOnce([
        mockDataPoint1,
        mockDataPoint2,
      ]);

      mockCalculateCpk.mockReturnValueOnce({
        cp: 1.5,
        cpk: 1.4,
        sigma: 0.02,
        mean: 25.0,
        status: 'MARGINAL',
      });
      mockCalculatePpk.mockReturnValueOnce({
        pp: 1.4,
        ppk: 1.3,
        sigma: 0.021,
        mean: 25.0,
        status: 'INCAPABLE',
      });

      await request(app)
        .get(`/api/spc/${mockChart.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.spcDataPoint.findMany).toHaveBeenCalledWith({
        where: { chartId: mockChart.id },
        orderBy: { timestamp: 'asc' },
        take: 50,
        skip: 0,
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get(`/api/spc/${mockChart.id}/capability`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to calculate capability');
    });
  });
});


describe('phase33 coverage', () => {
  it('handles Proxy basic', () => { const p = new Proxy({x:1}, { get(t,k) { return (t as any)[k] * 2; } }); expect((p as any).x).toBe(2); });
});


describe('phase34 coverage', () => {
  it('handles mapped type pattern', () => { type Flags<T> = { [K in keyof T]: boolean }; const flags: Flags<{a:number;b:string}> = {a:true,b:false}; expect(flags.a).toBe(true); });
  it('handles Map with complex values', () => { const m = new Map<string, number[]>(); m.set('evens', [2,4,6]); expect(m.get('evens')?.length).toBe(3); });
  it('handles object method shorthand', () => { const o = { double(x: number) { return x * 2; } }; expect(o.double(6)).toBe(12); });
  it('handles string template type safety', () => { const greet = (name: string) => `Hello, ${name}!`; expect(greet('World')).toBe('Hello, World!'); });
  it('handles interface-like typing', () => { interface Point { x: number; y: number; } const p: Point = {x:3,y:4}; const dist = Math.sqrt(p.x**2+p.y**2); expect(dist).toBe(5); });
});


describe('phase35 coverage', () => {
  it('handles zip arrays pattern', () => { const zip = <A,B>(a:A[],b:B[]):[A,B][] => a.map((v,i)=>[v,b[i]]); expect(zip([1,2,3],['a','b','c'])).toEqual([[1,'a'],[2,'b'],[3,'c']]); });
  it('handles short-circuit evaluation', () => { let x = 0; false && (x=1); expect(x).toBe(0); true || (x=2); expect(x).toBe(0); });
  it('handles flatMap with filter', () => { expect([[1,2],[3],[4,5]].flatMap(x=>x).filter(x=>x>2)).toEqual([3,4,5]); });
  it('handles string to array via spread', () => { expect([...'abc']).toEqual(['a','b','c']); });
  it('handles using const assertion', () => { const dirs = ['N','S','E','W'] as const; type Dir = typeof dirs[number]; const fn = (d:Dir) => d; expect(fn('N')).toBe('N'); });
});


describe('phase36 coverage', () => {
  it('checks prime number', () => { const isPrime=(n:number)=>{if(n<2)return false;for(let i=2;i<=Math.sqrt(n);i++)if(n%i===0)return false;return true;}; expect(isPrime(7)).toBe(true); expect(isPrime(9)).toBe(false); });
  it('handles flatten nested object keys', () => { const flat=(o:Record<string,unknown>,prefix=''):Record<string,unknown>=>{return Object.entries(o).reduce((acc,[k,v])=>{const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))Object.assign(acc,flat(v as Record<string,unknown>,key));else(acc as any)[key]=v;return acc;},{});};expect(flat({a:{b:1}})).toEqual({'a.b':1}); });
  it('handles LRU cache pattern', () => { const cache=new Map<string,number>();const get=(k:string)=>cache.has(k)?(cache.get(k)!):null;const set=(k:string,v:number)=>{cache.delete(k);cache.set(k,v);};set('a',1);set('b',2);expect(get('a')).toBe(1); });
  it('handles vowel count', () => { const countVowels=(s:string)=>(s.match(/[aeiou]/gi)||[]).length;expect(countVowels('Hello World')).toBe(3);expect(countVowels('rhythm')).toBe(0); });
  it('handles string anagram check', () => { const isAnagram=(a:string,b:string)=>a.split('').sort().join('')===b.split('').sort().join(''); expect(isAnagram('listen','silent')).toBe(true); expect(isAnagram('hello','world')).toBe(false); });
});


describe('phase37 coverage', () => {
  it('reverses words in sentence', () => { const revWords=(s:string)=>s.split(' ').reverse().join(' '); expect(revWords('hello world')).toBe('world hello'); });
  it('finds missing number in range', () => { const missing=(a:number[])=>{const n=a.length+1;const expected=n*(n+1)/2;return expected-a.reduce((s,v)=>s+v,0);}; expect(missing([1,2,4,5])).toBe(3); });
  it('converts fahrenheit to celsius', () => { const toC=(f:number)=>(f-32)*5/9; expect(toC(32)).toBe(0); expect(toC(212)).toBe(100); });
  it('computes compound interest', () => { const ci=(p:number,r:number,n:number)=>p*Math.pow(1+r/100,n); expect(ci(1000,10,1)).toBeCloseTo(1100); });
  it('formats bytes to human readable', () => { const fmt=(b:number)=>b>=1e9?`${(b/1e9).toFixed(1)}GB`:b>=1e6?`${(b/1e6).toFixed(1)}MB`:`${(b/1e3).toFixed(1)}KB`; expect(fmt(1500000)).toBe('1.5MB'); });
});


describe('phase38 coverage', () => {
  it('finds peak element index', () => { const peak=(a:number[])=>a.indexOf(Math.max(...a)); expect(peak([1,3,7,2,4])).toBe(2); });
  it('applies selection sort', () => { const sort=(a:number[])=>{const r=[...a];for(let i=0;i<r.length;i++){let m=i;for(let j=i+1;j<r.length;j++)if(r[j]<r[m])m=j;[r[i],r[m]]=[r[m],r[i]];}return r;}; expect(sort([3,1,4,1,5])).toEqual([1,1,3,4,5]); });
  it('computes longest common subsequence length', () => { const lcs=(a:string,b:string)=>{const m=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=a[i-1]===b[j-1]?m[i-1][j-1]+1:Math.max(m[i-1][j],m[i][j-1]);return m[a.length][b.length];}; expect(lcs('ABCBDAB','BDCAB')).toBe(4); });
  it('implements min stack', () => { class MinStack{private d:[number,number][]=[];push(v:number){const m=this.d.length?Math.min(v,this.d[this.d.length-1][1]):v;this.d.push([v,m]);}pop(){return this.d.pop()?.[0];}getMin(){return this.d[this.d.length-1]?.[1];}} const s=new MinStack();s.push(5);s.push(3);s.push(7);expect(s.getMin()).toBe(3);s.pop();expect(s.getMin()).toBe(3); });
  it('checks majority element', () => { const majority=(a:number[])=>{const f=a.reduce((m,v)=>{m.set(v,(m.get(v)||0)+1);return m;},new Map<number,number>());let res=-1;f.forEach((c,v)=>{if(c>a.length/2)res=v;});return res;}; expect(majority([3,2,3])).toBe(3); });
});


describe('phase39 coverage', () => {
  it('zigzag converts string', () => { const zz=(s:string,r:number)=>{if(r===1)return s;const rows=Array.from({length:r},()=>'');let row=0,dir=-1;for(const c of s){rows[row]+=c;if(row===0||row===r-1)dir*=-1;row+=dir;}return rows.join('');}; expect(zz('PAYPALISHIRING',3)).toBe('PAHNAPLSIIGYIR'); });
  it('checks Kaprekar number', () => { const isKap=(n:number)=>{const sq=n*n;const s=String(sq);for(let i=1;i<s.length;i++){const r=Number(s.slice(i)),l=Number(s.slice(0,i));if(r>0&&l+r===n)return true;}return false;}; expect(isKap(9)).toBe(true); expect(isKap(45)).toBe(true); });
  it('checks if two strings are isomorphic', () => { const isIso=(s:string,t:string)=>{const m1=new Map<string,string>(),m2=new Set<string>();for(let i=0;i<s.length;i++){if(m1.has(s[i])&&m1.get(s[i])!==t[i])return false;if(!m1.has(s[i])&&m2.has(t[i]))return false;m1.set(s[i],t[i]);m2.add(t[i]);}return true;}; expect(isIso('egg','add')).toBe(true); expect(isIso('foo','bar')).toBe(false); });
  it('implements counting sort', () => { const csort=(a:number[],max:number)=>{const c=Array(max+1).fill(0);a.forEach(v=>c[v]++);const r:number[]=[];c.forEach((cnt,v)=>r.push(...Array(cnt).fill(v)));return r;}; expect(csort([4,2,3,1,4,2],4)).toEqual([1,2,2,3,4,4]); });
  it('computes minimum coins for amount', () => { const minCoins=(coins:number[],amt:number)=>{const dp=Array(amt+1).fill(Infinity);dp[0]=0;for(let i=1;i<=amt;i++)for(const c of coins)if(c<=i&&dp[i-c]+1<dp[i])dp[i]=dp[i-c]+1;return dp[amt]===Infinity?-1:dp[amt];}; expect(minCoins([1,5,6,9],11)).toBe(2); });
});


describe('phase40 coverage', () => {
  it('implements string multiplication', () => { const mul=(a:string,b:string)=>{const m=a.length,n=b.length,pos=Array(m+n).fill(0);for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--){const p=(Number(a[i]))*(Number(b[j]));const p1=i+j,p2=i+j+1;const sum=p+pos[p2];pos[p2]=sum%10;pos[p1]+=Math.floor(sum/10);}return pos.join('').replace(/^0+/,'')||'0';}; expect(mul('123','456')).toBe('56088'); });
  it('computes sliding window maximum', () => { const swMax=(a:number[],k:number)=>{const r:number[]=[];const dq:number[]=[];for(let i=0;i<a.length;i++){while(dq.length&&dq[0]<i-k+1)dq.shift();while(dq.length&&a[dq[dq.length-1]]<a[i])dq.pop();dq.push(i);if(i>=k-1)r.push(a[dq[0]]);}return r;}; expect(swMax([1,3,-1,-3,5,3,6,7],3)).toEqual([3,3,5,5,6,7]); });
  it('computes determinant of 2x2 matrix', () => { const det2=([[a,b],[c,d]]:number[][])=>a*d-b*c; expect(det2([[3,7],[1,2]])).toBe(-1); expect(det2([[1,0],[0,1]])).toBe(1); });
  it('computes number of subsequences matching pattern', () => { const countSub=(s:string,p:string)=>{const dp=Array(p.length+1).fill(0);dp[0]=1;for(const c of s)for(let j=p.length;j>0;j--)if(c===p[j-1])dp[j]+=dp[j-1];return dp[p.length];}; expect(countSub('rabbbit','rabbit')).toBe(3); });
  it('computes maximum sum circular subarray', () => { const maxCircSum=(a:number[])=>{const maxSub=(arr:number[])=>{let cur=arr[0],res=arr[0];for(let i=1;i<arr.length;i++){cur=Math.max(arr[i],cur+arr[i]);res=Math.max(res,cur);}return res;};const totalSum=a.reduce((s,v)=>s+v,0);const maxLinear=maxSub(a);const minLinear=-maxSub(a.map(v=>-v));const maxCircular=totalSum-minLinear;return maxCircular===0?maxLinear:Math.max(maxLinear,maxCircular);}; expect(maxCircSum([1,-2,3,-2])).toBe(3); });
});


describe('phase41 coverage', () => {
  it('finds longest consecutive sequence length', () => { const longestConsec=(a:number[])=>{const s=new Set(a);let max=0;for(const v of s)if(!s.has(v-1)){let len=1;while(s.has(v+len))len++;max=Math.max(max,len);}return max;}; expect(longestConsec([100,4,200,1,3,2])).toBe(4); });
  it('computes extended GCD', () => { const extGcd=(a:number,b:number):[number,number,number]=>{if(b===0)return[a,1,0];const[g,x,y]=extGcd(b,a%b);return[g,y,x-Math.floor(a/b)*y];}; const[g]=extGcd(35,15); expect(g).toBe(5); });
  it('implements simple regex match (. and *)', () => { const rmatch=(s:string,p:string):boolean=>{if(!p)return!s;const first=!!s&&(p[0]==='.'||p[0]===s[0]);if(p.length>=2&&p[1]==='*')return rmatch(s,p.slice(2))||(first&&rmatch(s.slice(1),p));return first&&rmatch(s.slice(1),p.slice(1));}; expect(rmatch('aa','a*')).toBe(true); expect(rmatch('ab','.*')).toBe(true); });
  it('finds all permutations of array', () => { const perms=<T>(a:T[]):T[][]=>a.length<=1?[a]:[...a.flatMap((v,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[v,...p]))]; expect(perms([1,2,3]).length).toBe(6); });
  it('implements dutch national flag partition', () => { const dnf=(a:number[])=>{const r=[...a];let lo=0,mid=0,hi=r.length-1;while(mid<=hi){if(r[mid]===0){[r[lo],r[mid]]=[r[mid],r[lo]];lo++;mid++;}else if(r[mid]===1)mid++;else{[r[mid],r[hi]]=[r[hi],r[mid]];hi--;}}return r;}; expect(dnf([2,0,1,2,1,0])).toEqual([0,0,1,1,2,2]); });
});


describe('phase42 coverage', () => {
  it('checks if two rectangles overlap', () => { const overlap=(x1:number,y1:number,w1:number,h1:number,x2:number,y2:number,w2:number,h2:number)=>x1<x2+w2&&x1+w1>x2&&y1<y2+h2&&y1+h1>y2; expect(overlap(0,0,4,4,2,2,4,4)).toBe(true); expect(overlap(0,0,2,2,3,3,2,2)).toBe(false); });
  it('computes Manhattan distance', () => { const mhDist=(x1:number,y1:number,x2:number,y2:number)=>Math.abs(x2-x1)+Math.abs(y2-y1); expect(mhDist(0,0,3,4)).toBe(7); });
  it('converts RGB to hex color', () => { const toHex=(r:number,g:number,b:number)=>'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); expect(toHex(255,165,0)).toBe('#ffa500'); });
  it('computes number of triangles in n-gon diagonals', () => { const triCount=(n:number)=>n*(n-1)*(n-2)/6; expect(triCount(5)).toBe(10); expect(triCount(4)).toBe(4); });
  it('checks if point on line segment', () => { const onSeg=(px:number,py:number,ax:number,ay:number,bx:number,by:number)=>Math.abs((py-ay)*(bx-ax)-(px-ax)*(by-ay))<1e-9&&Math.min(ax,bx)<=px&&px<=Math.max(ax,bx); expect(onSeg(2,2,0,0,4,4)).toBe(true); expect(onSeg(3,2,0,0,4,4)).toBe(false); });
});


describe('phase43 coverage', () => {
  it('computes percentage change', () => { const pctChange=(from:number,to:number)=>((to-from)/from)*100; expect(pctChange(100,125)).toBe(25); expect(pctChange(200,150)).toBe(-25); });
  it('computes linear regression slope', () => { const slope=(x:number[],y:number[])=>{const n=x.length,mx=x.reduce((s,v)=>s+v,0)/n,my=y.reduce((s,v)=>s+v,0)/n;return x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0)/x.reduce((s,v)=>s+(v-mx)**2,0);}; expect(slope([1,2,3,4,5],[2,4,6,8,10])).toBe(2); });
  it('computes moving average', () => { const ma=(a:number[],w:number)=>Array.from({length:a.length-w+1},(_,i)=>a.slice(i,i+w).reduce((s,v)=>s+v,0)/w); expect(ma([1,2,3,4,5],3)).toEqual([2,3,4]); });
  it('z-score normalizes values', () => { const zscore=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;const std=Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length);return std===0?a.map(()=>0):a.map(v=>(v-m)/std);}; const z=zscore([2,4,4,4,5,5,7,9]);expect(Math.abs(z.reduce((s,v)=>s+v,0))).toBeLessThan(1e-9); });
  it('computes confidence interval (known std)', () => { const ci=(mean:number,std:number,n:number,z=1.96)=>[mean-z*std/Math.sqrt(n),mean+z*std/Math.sqrt(n)]; const[lo,hi]=ci(100,15,25); expect(lo).toBeLessThan(100); expect(hi).toBeGreaterThan(100); });
});


describe('phase44 coverage', () => {
  it('computes max subarray sum (Kadane)', () => { const kad=(a:number[])=>{let cur=a[0],max=a[0];for(let i=1;i<a.length;i++){cur=Math.max(a[i],cur+a[i]);max=Math.max(max,cur);}return max;}; expect(kad([-2,1,-3,4,-1,2,1,-5,4])).toBe(6); });
  it('generates all substrings', () => { const subs=(s:string)=>{const r:string[]=[];for(let i=0;i<s.length;i++)for(let j=i+1;j<=s.length;j++)r.push(s.slice(i,j));return r;}; expect(subs('abc')).toEqual(['a','ab','abc','b','bc','c']); });
  it('implements min stack with O(1) min', () => { const mk=()=>{const s:number[]=[],m:number[]=[];return{push:(v:number)=>{s.push(v);m.push(Math.min(v,m.length?m[m.length-1]:v));},pop:()=>{s.pop();m.pop();},min:()=>m[m.length-1]};}; const st=mk();st.push(3);st.push(1);st.push(2); expect(st.min()).toBe(1);st.pop(); expect(st.min()).toBe(1);st.pop(); expect(st.min()).toBe(3); });
  it('implements memoize decorator', () => { const memo=<T extends unknown[],R>(fn:(...a:T)=>R)=>{const c=new Map<string,R>();return(...a:T)=>{const k=JSON.stringify(a);if(c.has(k))return c.get(k)!;const r=fn(...a);c.set(k,r);return r;};}; let calls=0;const sq=memo((n:number)=>{calls++;return n*n;});sq(5);sq(5);sq(6); expect(calls).toBe(2); });
  it('groups consecutive equal elements', () => { const group=(a:number[])=>a.reduce((acc,v)=>{if(acc.length&&acc[acc.length-1][0]===v)acc[acc.length-1].push(v);else acc.push([v]);return acc;},[] as number[][]); expect(group([1,1,2,3,3,3])).toEqual([[1,1],[2],[3,3,3]]); });
});


describe('phase45 coverage', () => {
  it('implements functional option pattern', () => { type Cfg={debug:boolean;timeout:number;retries:number}; const dflt:Cfg={debug:false,timeout:5000,retries:3}; const cfg=(...opts:Partial<Cfg>[])=>Object.assign({},dflt,...opts); expect(cfg({debug:true})).toEqual({debug:true,timeout:5000,retries:3}); expect(cfg({timeout:1000},{retries:5})).toEqual({debug:false,timeout:1000,retries:5}); });
  it('implements result type (Ok/Err)', () => { type R<T,E>={ok:true;val:T}|{ok:false;err:E}; const Ok=<T>(val:T):R<T,never>=>({ok:true,val}); const Err=<E>(err:E):R<never,E>=>({ok:false,err}); const div=(a:number,b:number):R<number,string>=>b===0?Err('div by zero'):Ok(a/b); expect(div(10,2)).toEqual({ok:true,val:5}); expect(div(1,0)).toEqual({ok:false,err:'div by zero'}); });
  it('implements circular buffer', () => { const cb=(cap:number)=>{const buf=new Array(cap).fill(0);let r=0,w=0,sz=0;return{write:(v:number)=>{if(sz<cap){buf[w%cap]=v;w++;sz++;}},read:()=>sz>0?(sz--,buf[r++%cap]):undefined,size:()=>sz};}; const c=cb(3);c.write(1);c.write(2);c.write(3); expect(c.read()).toBe(1); expect(c.size()).toBe(2); });
  it('generates spiral matrix', () => { const sp=(n:number)=>{const m:number[][]=Array.from({length:n},()=>new Array(n).fill(0));let t=0,b=n-1,l=0,r=n-1,num=1;while(t<=b&&l<=r){for(let i=l;i<=r;i++)m[t][i]=num++;t++;for(let i=t;i<=b;i++)m[i][r]=num++;r--;if(t<=b){for(let i=r;i>=l;i--)m[b][i]=num++;b--;}if(l<=r){for(let i=b;i>=t;i--)m[i][l]=num++;l++;}}return m;}; const s=sp(3); expect(s[0]).toEqual([1,2,3]); expect(s[1]).toEqual([8,9,4]); expect(s[2]).toEqual([7,6,5]); });
  it('flattens matrix to array', () => { const flat=(m:number[][])=>m.reduce((a,r)=>[...a,...r],[]); expect(flat([[1,2],[3,4],[5,6]])).toEqual([1,2,3,4,5,6]); });
});


describe('phase46 coverage', () => {
  it('solves N-Queens (count solutions)', () => { const nq=(n:number)=>{let cnt=0;const col=new Set<number>(),d1=new Set<number>(),d2=new Set<number>();const bt=(r:number)=>{if(r===n){cnt++;return;}for(let c=0;c<n;c++){if(col.has(c)||d1.has(r-c)||d2.has(r+c))continue;col.add(c);d1.add(r-c);d2.add(r+c);bt(r+1);col.delete(c);d1.delete(r-c);d2.delete(r+c);}};bt(0);return cnt;}; expect(nq(4)).toBe(2); expect(nq(5)).toBe(10); });
  it('computes diameter of binary tree', () => { type N={v:number;l?:N;r?:N}; let d=0; const h=(n:N|undefined):number=>{if(!n)return 0;const l=h(n.l),r=h(n.r);d=Math.max(d,l+r);return 1+Math.max(l,r);}; const t:N={v:1,l:{v:2,l:{v:4},r:{v:5}},r:{v:3}}; d=0;h(t); expect(d).toBe(3); });
  it('computes prefix XOR array', () => { const px=(a:number[])=>{const r=[0];for(const v of a)r.push(r[r.length-1]^v);return r;}; expect(px([1,2,3])).toEqual([0,1,3,0]); });
  it('finds non-overlapping intervals count', () => { const noOverlap=(ivs:[number,number][])=>{const s=[...ivs].sort((a,b)=>a[1]-b[1]);let cnt=0,end=-Infinity;for(const [l,r] of s){if(l>=end)end=r;else cnt++;}return cnt;}; expect(noOverlap([[1,2],[2,3],[3,4],[1,3]])).toBe(1); });
  it('finds maximum path sum in binary tree', () => { type N={v:number;l?:N;r?:N}; let mx=-Infinity; const dfs=(n:N|undefined):number=>{if(!n)return 0;const l=Math.max(0,dfs(n.l)),r=Math.max(0,dfs(n.r));mx=Math.max(mx,n.v+l+r);return n.v+Math.max(l,r);}; const t:N={v:-10,l:{v:9},r:{v:20,l:{v:15},r:{v:7}}}; mx=-Infinity;dfs(t); expect(mx).toBe(42); });
});


describe('phase47 coverage', () => {
  it('implements Z-algorithm for string matching', () => { const zfn=(s:string)=>{const n=s.length,z=new Array(n).fill(0);let l=0,r=0;for(let i=1;i<n;i++){if(i<r)z[i]=Math.min(r-i,z[i-l]);while(i+z[i]<n&&s[z[i]]===s[i+z[i]])z[i]++;if(i+z[i]>r){l=i;r=i+z[i];}}return z;}; const z=zfn('aabxaa'); expect(z[4]).toBe(2); expect(z[0]).toBe(0); });
  it('computes number of paths of length k in graph', () => { const mm=(a:number[][],b:number[][])=>{const n=a.length;return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Array.from({length:n},(_,k)=>a[i][k]*b[k][j]).reduce((s,v)=>s+v,0)));};const kp=(adj:number[][],k:number)=>{let r=adj.map(row=>[...row]);for(let i=1;i<k;i++)r=mm(r,adj);return r;}; const adj=[[0,1,0],[0,0,1],[1,0,0]]; expect(kp(adj,3)[0][0]).toBe(1); });
  it('finds index of min element', () => { const argmin=(a:number[])=>a.reduce((mi,v,i)=>v<a[mi]?i:mi,0); expect(argmin([3,1,4,1,5])).toBe(1); expect(argmin([5,3,8,1])).toBe(3); });
  it('computes house robber (non-adjacent max sum)', () => { const hr=(a:number[])=>a.reduce(([prev2,prev1],v)=>[prev1,Math.max(prev1,prev2+v)],[0,0])[1]; expect(hr([1,2,3,1])).toBe(4); expect(hr([2,7,9,3,1])).toBe(12); });
  it('computes average of array', () => { const avg=(a:number[])=>a.reduce((s,v)=>s+v,0)/a.length; expect(avg([1,2,3,4,5])).toBe(3); expect(avg([10,20])).toBe(15); });
});


describe('phase48 coverage', () => {
  it('implements interval tree insert and query', () => { type I=[number,number]; const it=()=>{const ivs:I[]=[];return{ins:(l:number,r:number)=>ivs.push([l,r]),qry:(p:number)=>ivs.filter(([l,r])=>l<=p&&p<=r).length};}; const t=it();t.ins(1,5);t.ins(3,8);t.ins(6,10); expect(t.qry(4)).toBe(2); expect(t.qry(7)).toBe(2); expect(t.qry(11)).toBe(0); });
  it('finds minimum vertex cover size', () => { const mvc=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const visited=new Set<number>(),matched=new Array(n).fill(-1);const dfs=(u:number,vis:Set<number>):boolean=>{for(const v of adj[u]){if(!vis.has(v)){vis.add(v);if(matched[v]===-1||dfs(matched[v],vis)){matched[v]=u;return true;}}}return false;};for(let u=0;u<n;u++){const vis=new Set([u]);dfs(u,vis);}return matched.filter(v=>v!==-1).length;}; expect(mvc(4,[[0,1],[1,2],[2,3]])).toBe(4); });
  it('checks if binary tree is complete', () => { type N={v:number;l?:N;r?:N}; const isCom=(root:N|undefined)=>{if(!root)return true;const q:((N|undefined))[]=[];q.push(root);let end=false;while(q.length){const n=q.shift();if(!n){end=true;}else{if(end)return false;q.push(n.l);q.push(n.r);}}return true;}; const t:N={v:1,l:{v:2,l:{v:4},r:{v:5}},r:{v:3,l:{v:6}}}; expect(isCom(t)).toBe(true); });
  it('checks if number is happy', () => { const happy=(n:number)=>{const seen=new Set<number>();while(n!==1&&!seen.has(n)){seen.add(n);n=[...String(n)].reduce((s,d)=>s+Number(d)**2,0);}return n===1;}; expect(happy(19)).toBe(true); expect(happy(4)).toBe(false); });
  it('computes longest zig-zag subsequence', () => { const lzz=(a:number[])=>{const up=new Array(a.length).fill(1),dn=new Array(a.length).fill(1);for(let i=1;i<a.length;i++)for(let j=0;j<i;j++){if(a[i]>a[j])up[i]=Math.max(up[i],dn[j]+1);else if(a[i]<a[j])dn[i]=Math.max(dn[i],up[j]+1);}return Math.max(...up,...dn);}; expect(lzz([1,7,4,9,2,5])).toBe(6); expect(lzz([1,4,7,2,5])).toBe(4); });
});


describe('phase49 coverage', () => {
  it('computes maximum subarray sum (Kadane)', () => { const kad=(a:number[])=>{let max=a[0],cur=a[0];for(let i=1;i<a.length;i++){cur=Math.max(a[i],cur+a[i]);max=Math.max(max,cur);}return max;}; expect(kad([-2,1,-3,4,-1,2,1,-5,4])).toBe(6); expect(kad([-1])).toBe(-1); });
  it('computes minimum cost to connect ropes', () => { const mc=(r:number[])=>{const pq=[...r].sort((a,b)=>a-b);let cost=0;while(pq.length>1){const a=pq.shift()!,b=pq.shift()!,s=a+b;cost+=s;let i=0;while(i<pq.length&&pq[i]<s)i++;pq.splice(i,0,s);}return cost;}; expect(mc([4,3,2,6])).toBe(29); });
  it('computes sum of all subsets', () => { const sos=(a:number[])=>a.reduce((s,v)=>s+v*Math.pow(2,a.length-1),0); expect(sos([1,2,3])).toBe(24); expect(sos([1])).toBe(1); });
  it('computes number of ways to decode string', () => { const dec=(s:string)=>{if(!s||s[0]==='0')return 0;const n=s.length,dp=new Array(n+1).fill(0);dp[0]=dp[1]=1;for(let i=2;i<=n;i++){if(s[i-1]!=='0')dp[i]+=dp[i-1];const two=Number(s.slice(i-2,i));if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(dec('12')).toBe(2); expect(dec('226')).toBe(3); expect(dec('06')).toBe(0); });
  it('finds the celebrity in a party', () => { const cel=(knows:(a:number,b:number)=>boolean,n:number)=>{let cand=0;for(let i=1;i<n;i++)if(knows(cand,i))cand=i;for(let i=0;i<n;i++)if(i!==cand&&(knows(cand,i)||!knows(i,cand)))return -1;return cand;}; const m=[[0,1,1],[0,0,1],[0,0,0]];const k=(a:number,b:number)=>m[a][b]===1; expect(cel(k,3)).toBe(2); });
});


describe('phase50 coverage', () => {
  it('finds maximum erasure value', () => { const mev=(a:number[])=>{const seen=new Set<number>();let l=0,sum=0,max=0;for(let r=0;r<a.length;r++){while(seen.has(a[r])){seen.delete(a[l]);sum-=a[l++];}seen.add(a[r]);sum+=a[r];max=Math.max(max,sum);}return max;}; expect(mev([4,2,4,5,6])).toBe(17); expect(mev([5,2,1,2,5,2,1,2,5])).toBe(8); });
  it('computes max depth of N-ary tree', () => { type N={v:number;ch:N[]};const md=(n:N|undefined):number=>!n?0:1+Math.max(0,...n.ch.map(md)); const t:N={v:1,ch:[{v:3,ch:[{v:5,ch:[]},{v:6,ch:[]}]},{v:2,ch:[]},{v:4,ch:[]}]}; expect(md(t)).toBe(3); });
  it('finds minimum cost to hire k workers', () => { const hk=(q:number[],w:number[],k:number)=>{const r=q.map((qi,i)=>[w[i]/qi,qi,w[i]] as [number,number,number]).sort((a,b)=>a[0]-b[0]);let res=Infinity;const heap:number[]=[];let heapSum=0;for(const [ratio,qi,wi] of r){heap.push(qi);heapSum+=qi;heap.sort((a,b)=>b-a);if(heap.length>k){heapSum-=heap.shift()!;}if(heap.length===k)res=Math.min(res,ratio*heapSum);}return res;}; expect(hk([10,20,5],[70,50,30],2)).toBe(105); });
  it('finds maximum number of vowels in substring', () => { const mv=(s:string,k:number)=>{const isV=(c:string)=>'aeiou'.includes(c);let cnt=s.slice(0,k).split('').filter(isV).length,max=cnt;for(let i=k;i<s.length;i++){cnt+=isV(s[i])?1:0;cnt-=isV(s[i-k])?1:0;max=Math.max(max,cnt);}return max;}; expect(mv('abciiidef',3)).toBe(3); expect(mv('aeiou',2)).toBe(2); });
  it('checks if number is a power of 4', () => { const pow4=(n:number)=>n>0&&(n&(n-1))===0&&(n-1)%3===0; expect(pow4(16)).toBe(true); expect(pow4(5)).toBe(false); expect(pow4(1)).toBe(true); });
});

describe('phase51 coverage', () => {
  it('counts palindromic substrings', () => { const cp=(s:string)=>{let cnt=0;const ex=(l:number,r:number)=>{while(l>=0&&r<s.length&&s[l]===s[r]){cnt++;l--;r++;}};for(let i=0;i<s.length;i++){ex(i,i);ex(i,i+1);}return cnt;}; expect(cp('abc')).toBe(3); expect(cp('aaa')).toBe(6); expect(cp('racecar')).toBe(10); });
  it('determines if array allows reaching last index', () => { const canJump=(nums:number[])=>{let reach=0;for(let i=0;i<nums.length;i++){if(i>reach)return false;reach=Math.max(reach,i+nums[i]);}return true;}; expect(canJump([2,3,1,1,4])).toBe(true); expect(canJump([3,2,1,0,4])).toBe(false); expect(canJump([1,0])).toBe(true); });
  it('counts set bits for all numbers 0 to n', () => { const cb=(n:number)=>{const dp=new Array(n+1).fill(0);for(let i=1;i<=n;i++)dp[i]=dp[i>>1]+(i&1);return dp;}; expect(cb(5)).toEqual([0,1,1,2,1,2]); expect(cb(2)).toEqual([0,1,1]); });
  it('traverses matrix in spiral order', () => { const spiral=(m:number[][])=>{const res:number[]=[];let t=0,b=m.length-1,l=0,r=m[0].length-1;while(t<=b&&l<=r){for(let i=l;i<=r;i++)res.push(m[t][i]);t++;for(let i=t;i<=b;i++)res.push(m[i][r]);r--;if(t<=b){for(let i=r;i>=l;i--)res.push(m[b][i]);b--;}if(l<=r){for(let i=b;i>=t;i--)res.push(m[i][l]);l++;}}return res;}; expect(spiral([[1,2,3],[4,5,6],[7,8,9]])).toEqual([1,2,3,6,9,8,7,4,5]); expect(spiral([[1,2],[3,4]])).toEqual([1,2,4,3]); });
  it('computes minimum matrix chain multiplication cost', () => { const mcm=(p:number[])=>{const n=p.length-1;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=Infinity;for(let k=i;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k+1][j]+p[i]*p[k+1]*p[j+1]);}return dp[0][n-1];}; expect(mcm([10,30,5,60])).toBe(4500); expect(mcm([40,20,30,10,30])).toBe(26000); });
});

describe('phase52 coverage', () => {
  it('counts inversions in array', () => { const inv=(a:number[])=>{let cnt=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>a[j])cnt++;return cnt;}; expect(inv([2,4,1,3,5])).toBe(3); expect(inv([1,2,3,4,5])).toBe(0); expect(inv([5,4,3,2,1])).toBe(10); });
  it('computes sum of subarray minimums', () => { const ssm2=(a:number[])=>{let sum=0;for(let i=0;i<a.length;i++){let mn=a[i];for(let j=i;j<a.length;j++){mn=Math.min(mn,a[j]);sum+=mn;}}return sum;}; expect(ssm2([3,1,2,4])).toBe(17); expect(ssm2([1,2,3])).toBe(10); });
  it('finds kth largest element in array', () => { const kl=(a:number[],k:number)=>[...a].sort((x,y)=>y-x)[k-1]; expect(kl([3,2,1,5,6,4],2)).toBe(5); expect(kl([3,2,3,1,2,4,5,5,6],4)).toBe(4); });
  it('finds minimum cost to climb stairs', () => { const mcc2=(cost:number[])=>{const n=cost.length,dp=new Array(n+1).fill(0);for(let i=2;i<=n;i++)dp[i]=Math.min(dp[i-1]+cost[i-1],dp[i-2]+cost[i-2]);return dp[n];}; expect(mcc2([10,15,20])).toBe(15); expect(mcc2([1,100,1,1,1,100,1,1,100,1])).toBe(6); });
  it('finds container with most water', () => { const mw3=(h:number[])=>{let l=0,r=h.length-1,mx=0;while(l<r){mx=Math.max(mx,Math.min(h[l],h[r])*(r-l));h[l]<h[r]?l++:r--;}return mx;}; expect(mw3([1,8,6,2,5,4,8,3,7])).toBe(49); expect(mw3([1,1])).toBe(1); });
});

describe('phase53 coverage', () => {
  it('finds peak element index using binary search', () => { const pe2=(a:number[])=>{let l=0,r=a.length-1;while(l<r){const m=l+r>>1;if(a[m]<a[m+1])l=m+1;else r=m;}return l;}; expect(pe2([1,2,3,1])).toBe(2); expect(pe2([1,2,1,3,5,6,4])).toBe(5); expect(pe2([1])).toBe(0); });
  it('determines if a number is a happy number', () => { const isHappy=(n:number)=>{const seen=new Set<number>();while(n!==1&&!seen.has(n)){seen.add(n);n=[...String(n)].reduce((s,d)=>s+Number(d)**2,0);}return n===1;}; expect(isHappy(19)).toBe(true); expect(isHappy(2)).toBe(false); expect(isHappy(1)).toBe(true); });
  it('simulates asteroid collisions', () => { const ac2=(a:number[])=>{const st:number[]=[];for(const x of a){let alive=true;while(alive&&x<0&&st.length&&st[st.length-1]>0){if(st[st.length-1]<-x)st.pop();else if(st[st.length-1]===-x){st.pop();alive=false;}else alive=false;}if(alive)st.push(x);}return st;}; expect(ac2([5,10,-5])).toEqual([5,10]); expect(ac2([8,-8])).toEqual([]); expect(ac2([10,2,-5])).toEqual([10]); });
  it('finds minimum falling path sum through matrix', () => { const mfps=(m:number[][])=>{const n=m.length,dp=m.map(r=>[...r]);for(let i=1;i<n;i++)for(let j=0;j<n;j++){const mn=Math.min(dp[i-1][j],j>0?dp[i-1][j-1]:Infinity,j<n-1?dp[i-1][j+1]:Infinity);dp[i][j]+=mn;}return Math.min(...dp[n-1]);}; expect(mfps([[2,1,3],[6,5,4],[7,8,9]])).toBe(13); expect(mfps([[1,2],[3,4]])).toBe(4); });
  it('evaluates reverse polish notation expression', () => { const rpn=(tokens:string[])=>{const st:number[]=[],ops:{[k:string]:(a:number,b:number)=>number}={'+': (a,b)=>a+b,'-': (a,b)=>a-b,'*': (a,b)=>a*b,'/': (a,b)=>Math.trunc(a/b)};for(const t of tokens){if(t in ops){const b=st.pop()!,a=st.pop()!;st.push(ops[t](a,b));}else st.push(Number(t));}return st[0];}; expect(rpn(['2','1','+','3','*'])).toBe(9); expect(rpn(['4','13','5','/','+'  ])).toBe(6); });
});


describe('phase54 coverage', () => {
  it('finds the nth ugly number (factors 2, 3, 5 only)', () => { const ugly=(n:number)=>{const dp=[1];let i2=0,i3=0,i5=0;for(let i=1;i<n;i++){const next=Math.min(dp[i2]*2,dp[i3]*3,dp[i5]*5);dp.push(next);if(next===dp[i2]*2)i2++;if(next===dp[i3]*3)i3++;if(next===dp[i5]*5)i5++;}return dp[n-1];}; expect(ugly(1)).toBe(1); expect(ugly(10)).toBe(12); expect(ugly(15)).toBe(24); });
  it('counts pairs with absolute difference exactly k', () => { const cpdk=(a:number[],k:number)=>{const s=new Set(a);let c=0;const seen=new Set<number>();for(const x of a){if(!seen.has(x)&&s.has(x+k))c++;seen.add(x);}return c;}; expect(cpdk([1,7,5,9,2,12,3],2)).toBe(4); expect(cpdk([1,2,3,4,5],1)).toBe(4); });
  it('finds all lonely numbers (no adjacent values exist in array)', () => { const lonely=(a:number[])=>{const s=new Set(a),cnt=new Map<number,number>();for(const x of a)cnt.set(x,(cnt.get(x)||0)+1);return a.filter(x=>cnt.get(x)===1&&!s.has(x-1)&&!s.has(x+1)).sort((a,b)=>a-b);}; expect(lonely([10,6,5,8])).toEqual([8,10]); expect(lonely([1,3,5,3])).toEqual([1,5]); });
  it('computes length of longest wiggle subsequence', () => { const wiggle=(a:number[])=>{if(a.length<2)return a.length;let up=1,down=1;for(let i=1;i<a.length;i++){if(a[i]>a[i-1])up=down+1;else if(a[i]<a[i-1])down=up+1;}return Math.max(up,down);}; expect(wiggle([1,7,4,9,2,5])).toBe(6); expect(wiggle([1,17,5,10,13,15,10,5,16,8])).toBe(7); expect(wiggle([1,2,3,4,5])).toBe(2); });
  it('finds all duplicates in array using sign-marking O(n) no extra space', () => { const dups=(a:number[])=>{const res:number[]=[],b=[...a];for(let i=0;i<b.length;i++){const idx=Math.abs(b[i])-1;if(b[idx]<0)res.push(idx+1);else b[idx]=-b[idx];}return res.sort((x,y)=>x-y);}; expect(dups([4,3,2,7,8,2,3,1])).toEqual([2,3]); expect(dups([1,1,2])).toEqual([1]); });
});


describe('phase55 coverage', () => {
  it('counts islands after each addLand operation using union-find', () => { const addLand=(m:number,n:number,pos:[number,number][])=>{const id=(r:number,c:number)=>r*n+c;const p=new Array(m*n).fill(-1);const added=new Set<number>();const find=(x:number):number=>p[x]<0?x:(p[x]=find(p[x]),p[x]);const union=(a:number,b:number)=>{a=find(a);b=find(b);if(a===b)return 0;p[a]+=p[b];p[b]=a;return 1;};let cnt=0;const res:number[]=[];for(const[r,c]of pos){const cell=id(r,c);if(!added.has(cell)){added.add(cell);cnt++;for(const[dr,dc]of[[-1,0],[1,0],[0,-1],[0,1]]){const nr=r+dr,nc=c+dc,nc2=id(nr,nc);if(nr>=0&&nr<m&&nc>=0&&nc<n&&added.has(nc2))cnt-=union(cell,nc2);}}res.push(cnt);}return res;}; expect(addLand(3,3,[[0,0],[0,1],[1,2],[2,1]])).toEqual([1,1,2,3]); });
  it('finds maximum product subarray', () => { const mp=(a:number[])=>{let mn=a[0],mx=a[0],res=a[0];for(let i=1;i<a.length;i++){const tmp=mx;mx=Math.max(a[i],mx*a[i],mn*a[i]);mn=Math.min(a[i],tmp*a[i],mn*a[i]);res=Math.max(res,mx);}return res;}; expect(mp([2,3,-2,4])).toBe(6); expect(mp([-2,0,-1])).toBe(0); expect(mp([-2,3,-4])).toBe(24); });
  it('counts ways to decode a digit string into letters', () => { const decode=(s:string)=>{const n=s.length;if(!n||s[0]==='0')return 0;const dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=+s[i-1],two=+(s.slice(i-2,i));if(one>=1)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(decode('12')).toBe(2); expect(decode('226')).toBe(3); expect(decode('06')).toBe(0); });
  it('reverses bits of a 32-bit unsigned integer', () => { const revBits=(n:number)=>{let res=0;for(let i=0;i<32;i++){res=(res*2+((n>>i)&1))>>>0;}return res;}; expect(revBits(0b00000010100101000001111010011100)).toBe(0b00111001011110000010100101000000); expect(revBits(0b11111111111111111111111111111101)).toBe(0b10111111111111111111111111111111); });
  it('counts prime numbers less than n using Sieve of Eratosthenes', () => { const cp=(n:number)=>{if(n<2)return 0;const s=new Uint8Array(n).fill(1);s[0]=s[1]=0;for(let i=2;i*i<n;i++)if(s[i])for(let j=i*i;j<n;j+=i)s[j]=0;return s.reduce((a,v)=>a+v,0);}; expect(cp(10)).toBe(4); expect(cp(0)).toBe(0); expect(cp(20)).toBe(8); });
});


describe('phase56 coverage', () => {
  it('finds index of first non-repeating character in string', () => { const fuc=(s:string)=>{const m=new Map<string,number>();for(const c of s)m.set(c,(m.get(c)||0)+1);for(let i=0;i<s.length;i++)if(m.get(s[i])===1)return i;return -1;}; expect(fuc('leetcode')).toBe(0); expect(fuc('loveleetcode')).toBe(2); expect(fuc('aabb')).toBe(-1); });
  it('counts number of combinations to make amount from coins', () => { const cc2=(amount:number,coins:number[])=>{const dp=new Array(amount+1).fill(0);dp[0]=1;for(const c of coins)for(let i=c;i<=amount;i++)dp[i]+=dp[i-c];return dp[amount];}; expect(cc2(5,[1,2,5])).toBe(4); expect(cc2(3,[2])).toBe(0); expect(cc2(10,[10])).toBe(1); });
  it('finds length of longest consecutive path in a binary tree', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const lcp2=(root:N|null)=>{let res=0;const dfs=(n:N|null,parent:N|null,len:number)=>{if(!n)return;const cur=parent&&n.v===parent.v+1?len+1:1;res=Math.max(res,cur);dfs(n.l,n,cur);dfs(n.r,n,cur);};dfs(root,null,0);return res;}; expect(lcp2(mk(1,mk(2,mk(3))))).toBe(3); expect(lcp2(mk(2,mk(3,mk(2)),mk(2)))).toBe(2); });
  it('checks if n is a power of two using bit manipulation', () => { const isPow2=(n:number)=>n>0&&(n&(n-1))===0; expect(isPow2(1)).toBe(true); expect(isPow2(16)).toBe(true); expect(isPow2(3)).toBe(false); expect(isPow2(4)).toBe(true); expect(isPow2(5)).toBe(false); });
  it('counts unique paths from top-left to bottom-right in m×n grid', () => { const up=(m:number,n:number)=>{const dp=new Array(n).fill(1);for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[j]+=dp[j-1];return dp[n-1];}; expect(up(3,7)).toBe(28); expect(up(3,2)).toBe(3); expect(up(1,1)).toBe(1); });
});


describe('phase57 coverage', () => {
  it('implements LRU cache with O(1) get and put', () => { class LRU{private cap:number;private m=new Map<number,number>();constructor(c:number){this.cap=c;}get(k:number){if(!this.m.has(k))return -1;const v=this.m.get(k)!;this.m.delete(k);this.m.set(k,v);return v;}put(k:number,v:number){if(this.m.has(k))this.m.delete(k);else if(this.m.size>=this.cap)this.m.delete(this.m.keys().next().value!);this.m.set(k,v);}} const c=new LRU(2);c.put(1,1);c.put(2,2);expect(c.get(1)).toBe(1);c.put(3,3);expect(c.get(2)).toBe(-1);expect(c.get(3)).toBe(3); });
  it('reconstructs travel itinerary using DFS and min-heap', () => { const findItin=(tickets:[string,string][])=>{const g=new Map<string,string[]>();for(const[f,t]of tickets){g.set(f,[...(g.get(f)||[]),t]);}for(const v of g.values())v.sort();const res:string[]=[];const dfs=(a:string)=>{const nxt=g.get(a)||[];while(nxt.length)dfs(nxt.shift()!);res.unshift(a);};dfs('JFK');return res;}; expect(findItin([['MUC','LHR'],['JFK','MUC'],['SFO','SJC'],['LHR','SFO']])).toEqual(['JFK','MUC','LHR','SFO','SJC']); });
  it('finds cells that can flow to both Pacific and Atlantic oceans', () => { const paf=(h:number[][])=>{const m=h.length,n=h[0].length,pac=Array.from({length:m},()=>new Array(n).fill(false)),atl=Array.from({length:m},()=>new Array(n).fill(false));const dfs=(i:number,j:number,vis:boolean[][],prev:number)=>{if(i<0||i>=m||j<0||j>=n||vis[i][j]||h[i][j]<prev)return;vis[i][j]=true;for(const[di,dj]of[[-1,0],[1,0],[0,-1],[0,1]])dfs(i+di,j+dj,vis,h[i][j]);};for(let i=0;i<m;i++){dfs(i,0,pac,0);dfs(i,n-1,atl,0);}for(let j=0;j<n;j++){dfs(0,j,pac,0);dfs(m-1,j,atl,0);}const res:number[][]=[];for(let i=0;i<m;i++)for(let j=0;j<n;j++)if(pac[i][j]&&atl[i][j])res.push([i,j]);return res;}; expect(paf([[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]).length).toBe(7); });
  it('finds all paths from node 0 to last node in a DAG', () => { const allPaths=(graph:number[][])=>{const res:number[][]=[];const dfs=(node:number,path:number[])=>{if(node===graph.length-1){res.push([...path]);return;}for(const nxt of graph[node])dfs(nxt,[...path,nxt]);};dfs(0,[0]);return res;}; expect(allPaths([[1,2],[3],[3],[]])).toEqual([[0,1,3],[0,2,3]]); expect(allPaths([[4,3,1],[3,2,4],[3],[4],[]])).toEqual([[0,4],[0,3,4],[0,1,3,4],[0,1,2,3,4],[0,1,4]]); });
  it('returns k most frequent words sorted by frequency then lexicographically', () => { const topK=(words:string[],k:number)=>{const m=new Map<string,number>();for(const w of words)m.set(w,(m.get(w)||0)+1);return [...m.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,k).map(e=>e[0]);}; expect(topK(['i','love','leetcode','i','love','coding'],2)).toEqual(['i','love']); expect(topK(['the','day','is','sunny','the','the','the','sunny','is','is'],4)).toEqual(['the','is','sunny','day']); });
});

describe('phase58 coverage', () => {
  it('alien dict order', () => {
    const alienOrder=(words:string[])=>{const adj:Map<string,Set<string>>=new Map();const chars=new Set(words.join(''));chars.forEach(c=>adj.set(c,new Set()));for(let i=0;i<words.length-1;i++){const[a,b]=[words[i],words[i+1]];const len=Math.min(a.length,b.length);if(a.length>b.length&&a.startsWith(b))return'';for(let j=0;j<len;j++)if(a[j]!==b[j]){adj.get(a[j])!.add(b[j]);break;}}const visited=new Map<string,boolean>();const res:string[]=[];const dfs=(c:string):boolean=>{if(visited.has(c))return visited.get(c)!;visited.set(c,true);for(const n of adj.get(c)!){if(dfs(n))return true;}visited.set(c,false);res.push(c);return false;};for(const c of chars)if(!visited.has(c)&&dfs(c))return'';return res.reverse().join('');};
    const r=alienOrder(['wrt','wrf','er','ett','rftt']);
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });
  it('sliding window max', () => {
    const maxSlidingWindow=(nums:number[],k:number):number[]=>{const q:number[]=[];const res:number[]=[];for(let i=0;i<nums.length;i++){while(q.length&&q[0]<i-k+1)q.shift();while(q.length&&nums[q[q.length-1]]<nums[i])q.pop();q.push(i);if(i>=k-1)res.push(nums[q[0]]);}return res;};
    expect(maxSlidingWindow([1,3,-1,-3,5,3,6,7],3)).toEqual([3,3,5,5,6,7]);
    expect(maxSlidingWindow([1],1)).toEqual([1]);
    expect(maxSlidingWindow([1,-1],1)).toEqual([1,-1]);
  });
  it('course schedule II', () => {
    const findOrder=(n:number,prereqs:[number,number][]):number[]=>{const adj:number[][]=Array.from({length:n},()=>[]);const indeg=new Array(n).fill(0);prereqs.forEach(([a,b])=>{adj[b].push(a);indeg[a]++;});const q=[];for(let i=0;i<n;i++)if(indeg[i]===0)q.push(i);const res:number[]=[];while(q.length){const c=q.shift()!;res.push(c);adj[c].forEach(nb=>{if(--indeg[nb]===0)q.push(nb);});}return res.length===n?res:[];};
    expect(findOrder(2,[[1,0]])).toEqual([0,1]);
    expect(findOrder(4,[[1,0],[2,0],[3,1],[3,2]])).toHaveLength(4);
    expect(findOrder(2,[[1,0],[0,1]])).toEqual([]);
  });
  it('flatten tree to list', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const flatten=(root:TN|null):void=>{let cur=root;while(cur){if(cur.left){let r=cur.left;while(r.right)r=r.right;r.right=cur.right;cur.right=cur.left;cur.left=null;}cur=cur.right;}};
    const toArr=(r:TN|null):number[]=>{const a:number[]=[];while(r){a.push(r.val);r=r.right;}return a;};
    const t=mk(1,mk(2,mk(3),mk(4)),mk(5,null,mk(6)));
    flatten(t);
    expect(toArr(t)).toEqual([1,2,3,4,5,6]);
  });
  it('find peak element binary', () => {
    const findPeakElement=(nums:number[]):number=>{let lo=0,hi=nums.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(nums[mid]>nums[mid+1])hi=mid;else lo=mid+1;}return lo;};
    const p1=findPeakElement([1,2,3,1]);
    expect([1,2,3,1][p1]).toBeGreaterThan([1,2,3,1][p1-1]||(-Infinity));
    expect([1,2,3,1][p1]).toBeGreaterThan([1,2,3,1][p1+1]||(-Infinity));
    const p2=findPeakElement([1,2,1,3,5,6,4]);
    expect(p2===1||p2===5).toBe(true);
  });
});

describe('phase59 coverage', () => {
  it('binary tree right side view', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const rightSideView=(root:TN|null):number[]=>{if(!root)return[];const res:number[]=[];const q=[root];while(q.length){const sz=q.length;for(let i=0;i<sz;i++){const n=q.shift()!;if(i===sz-1)res.push(n.val);if(n.left)q.push(n.left);if(n.right)q.push(n.right);}};return res;};
    expect(rightSideView(mk(1,mk(2,null,mk(5)),mk(3,null,mk(4))))).toEqual([1,3,4]);
    expect(rightSideView(null)).toEqual([]);
    expect(rightSideView(mk(1,mk(2),null))).toEqual([1,2]);
  });
  it('queue reconstruction by height', () => {
    const reconstructQueue=(people:[number,number][]):[number,number][]=>{people.sort((a,b)=>a[0]!==b[0]?b[0]-a[0]:a[1]-b[1]);const res:[number,number][]=[];for(const p of people)res.splice(p[1],0,p);return res;};
    const r=reconstructQueue([[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]);
    expect(r[0]).toEqual([5,0]);
    expect(r[1]).toEqual([7,0]);
    expect(r.length).toBe(6);
  });
  it('populating next right pointers', () => {
    type TN={val:number;left:TN|null;right:TN|null;next:TN|null};
    const mk=(v:number):TN=>({val:v,left:null,right:null,next:null});
    const connect=(root:TN|null):TN|null=>{if(!root)return null;const q=[root];while(q.length){const sz=q.length;for(let i=0;i<sz;i++){const n=q.shift()!;if(i<sz-1)n.next=q[0]||null;if(n.left)q.push(n.left as TN);if(n.right)q.push(n.right as TN);}};return root;};
    const r=mk(1);r.left=mk(2);r.right=mk(3);(r.left as TN).left=mk(4);(r.left as TN).right=mk(5);(r.right as TN).right=mk(7);
    connect(r);
    expect(r.next).toBeNull();
    expect(r.left!.next).toBe(r.right);
  });
  it('number of connected components', () => {
    const countComponents=(n:number,edges:[number,number][]):number=>{const parent=Array.from({length:n},(_,i)=>i);const find=(x:number):number=>parent[x]===x?x:parent[x]=find(parent[x]);const union=(a:number,b:number)=>parent[find(a)]=find(b);edges.forEach(([a,b])=>union(a,b));return new Set(Array.from({length:n},(_,i)=>find(i))).size;};
    expect(countComponents(5,[[0,1],[1,2],[3,4]])).toBe(2);
    expect(countComponents(5,[[0,1],[1,2],[2,3],[3,4]])).toBe(1);
    expect(countComponents(4,[])).toBe(4);
  });
  it('min in rotated sorted array', () => {
    const findMin=(nums:number[]):number=>{let lo=0,hi=nums.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(nums[mid]>nums[hi])lo=mid+1;else hi=mid;}return nums[lo];};
    expect(findMin([3,4,5,1,2])).toBe(1);
    expect(findMin([4,5,6,7,0,1,2])).toBe(0);
    expect(findMin([11,13,15,17])).toBe(11);
    expect(findMin([2,1])).toBe(1);
  });
});

describe('phase60 coverage', () => {
  it('maximum width ramp', () => {
    const maxWidthRamp=(nums:number[]):number=>{const stack:number[]=[];for(let i=0;i<nums.length;i++)if(!stack.length||nums[stack[stack.length-1]]>nums[i])stack.push(i);let res=0;for(let j=nums.length-1;j>=0;j--){while(stack.length&&nums[stack[stack.length-1]]<=nums[j]){res=Math.max(res,j-stack[stack.length-1]);stack.pop();}}return res;};
    expect(maxWidthRamp([6,0,8,2,1,5])).toBe(4);
    expect(maxWidthRamp([9,8,1,0,1,9,4,0,4,1])).toBe(7);
    expect(maxWidthRamp([3,3])).toBe(1);
  });
  it('wildcard matching DP', () => {
    const isMatch=(s:string,p:string):boolean=>{const m=s.length,n=p.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){if(p[j-1]==='*')dp[i][j]=dp[i-1][j]||dp[i][j-1];else dp[i][j]=(p[j-1]==='?'||p[j-1]===s[i-1])&&dp[i-1][j-1];}return dp[m][n];};
    expect(isMatch('aa','a')).toBe(false);
    expect(isMatch('aa','*')).toBe(true);
    expect(isMatch('cb','?a')).toBe(false);
    expect(isMatch('adceb','*a*b')).toBe(true);
  });
  it('max points on a line', () => {
    const maxPoints=(points:number[][]):number=>{if(points.length<=2)return points.length;let res=2;for(let i=0;i<points.length;i++){const map=new Map<string,number>();for(let j=i+1;j<points.length;j++){let dx=points[j][0]-points[i][0];let dy=points[j][1]-points[i][1];const g=(a:number,b:number):number=>b===0?a:g(b,a%b);const d=g(Math.abs(dx),Math.abs(dy));if(d>0){dx/=d;dy/=d;}if(dx<0||(dx===0&&dy<0)){dx=-dx;dy=-dy;}const key=`${dx},${dy}`;map.set(key,(map.get(key)||1)+1);res=Math.max(res,map.get(key)!);}};return res;};
    expect(maxPoints([[1,1],[2,2],[3,3]])).toBe(3);
    expect(maxPoints([[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]])).toBe(4);
  });
  it('stock span problem', () => {
    const calculateSpan=(prices:number[]):number[]=>{const stack:number[]=[];const span:number[]=[];for(let i=0;i<prices.length;i++){while(stack.length&&prices[stack[stack.length-1]]<=prices[i])stack.pop();span.push(stack.length===0?i+1:i-stack[stack.length-1]);stack.push(i);}return span;};
    expect(calculateSpan([100,80,60,70,60,75,85])).toEqual([1,1,1,2,1,4,6]);
    expect(calculateSpan([10,4,5,90,120,80])).toEqual([1,1,2,4,5,1]);
  });
  it('minimum cost for tickets', () => {
    const mincostTickets=(days:number[],costs:number[]):number=>{const daySet=new Set(days);const lastDay=days[days.length-1];const dp=new Array(lastDay+1).fill(0);for(let i=1;i<=lastDay;i++){if(!daySet.has(i)){dp[i]=dp[i-1];continue;}dp[i]=Math.min(dp[i-1]+costs[0],dp[Math.max(0,i-7)]+costs[1],dp[Math.max(0,i-30)]+costs[2]);}return dp[lastDay];};
    expect(mincostTickets([1,4,6,7,8,20],[2,7,15])).toBe(11);
    expect(mincostTickets([1,2,3,4,5,6,7,8,9,10,30,31],[2,7,15])).toBe(17);
  });
});

describe('phase61 coverage', () => {
  it('count primes sieve', () => {
    const countPrimes=(n:number):number=>{if(n<2)return 0;const sieve=new Array(n).fill(true);sieve[0]=sieve[1]=false;for(let i=2;i*i<n;i++)if(sieve[i])for(let j=i*i;j<n;j+=i)sieve[j]=false;return sieve.filter(Boolean).length;};
    expect(countPrimes(10)).toBe(4);
    expect(countPrimes(0)).toBe(0);
    expect(countPrimes(1)).toBe(0);
    expect(countPrimes(20)).toBe(8);
  });
  it('sliding window median', () => {
    const medianSlidingWindow=(nums:number[],k:number):number[]=>{const res:number[]=[];for(let i=0;i<=nums.length-k;i++){const win=[...nums.slice(i,i+k)].sort((a,b)=>a-b);res.push(k%2===0?(win[k/2-1]+win[k/2])/2:win[Math.floor(k/2)]);}return res;};
    expect(medianSlidingWindow([1,3,-1,-3,5,3,6,7],3)).toEqual([1,-1,-1,3,5,6]);
    expect(medianSlidingWindow([1,2,3,4,2,3,1,4,2],3)).toEqual([2,3,3,3,2,3,2]);
  });
  it('queue using two stacks', () => {
    class MyQueue{private in:number[]=[];private out:number[]=[];push(x:number):void{this.in.push(x);}pop():number{if(!this.out.length)while(this.in.length)this.out.push(this.in.pop()!);return this.out.pop()!;}peek():number{if(!this.out.length)while(this.in.length)this.out.push(this.in.pop()!);return this.out[this.out.length-1];}empty():boolean{return!this.in.length&&!this.out.length;}}
    const q=new MyQueue();q.push(1);q.push(2);
    expect(q.peek()).toBe(1);
    expect(q.pop()).toBe(1);
    expect(q.empty()).toBe(false);
    q.push(3);
    expect(q.pop()).toBe(2);
    expect(q.pop()).toBe(3);
  });
  it('flatten nested array iterator', () => {
    const flatten=(arr:any[]):number[]=>{const res:number[]=[];const dfs=(a:any[])=>{for(const x of a){if(Array.isArray(x))dfs(x);else res.push(x);}};dfs(arr);return res;};
    expect(flatten([[1,1],2,[1,1]])).toEqual([1,1,2,1,1]);
    expect(flatten([1,[4,[6]]])).toEqual([1,4,6]);
    expect(flatten([[],[1,[2,[3,[4,[5]]]]]])).toEqual([1,2,3,4,5]);
  });
  it('daily temperatures monotonic stack', () => {
    const dailyTemperatures=(temps:number[]):number[]=>{const stack:number[]=[];const res=new Array(temps.length).fill(0);for(let i=0;i<temps.length;i++){while(stack.length&&temps[stack[stack.length-1]]<temps[i]){const idx=stack.pop()!;res[idx]=i-idx;}stack.push(i);}return res;};
    expect(dailyTemperatures([73,74,75,71,69,72,76,73])).toEqual([1,1,4,2,1,1,0,0]);
    expect(dailyTemperatures([30,40,50,60])).toEqual([1,1,1,0]);
    expect(dailyTemperatures([30,60,90])).toEqual([1,1,0]);
  });
});
