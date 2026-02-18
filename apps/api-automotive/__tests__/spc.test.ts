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
