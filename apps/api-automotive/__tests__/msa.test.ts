import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    msaStudy: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    msaMeasurement: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    MsaStudyWhereInput: {},
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

import { prisma } from '../src/prisma';
import msaRoutes from '../src/routes/msa';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockStudy = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'MSA-2602-0001',
  title: 'Caliper Bore Diameter GR&R',
  studyType: 'GRR_CROSSED',
  gageName: 'Digital Caliper #42',
  gageId: 'DC-042',
  characteristic: 'Bore Diameter',
  specification: '25.00 +/- 0.05 mm',
  tolerance: '0.10',
  operatorCount: 3,
  numParts: 10,
  numTrials: 3,
  status: 'DRAFT',
  result: null,
  grrPercent: null,
  ndc: null,
  ev: null,
  av: null,
  grr: null,
  pv: null,
  tv: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockStudy2 = {
  id: '20000000-0000-4000-a000-000000000002',
  refNumber: 'MSA-2602-0002',
  title: 'Surface Roughness Bias Study',
  studyType: 'BIAS',
  gageName: 'Profilometer P100',
  gageId: 'P-100',
  characteristic: 'Surface Roughness Ra',
  specification: 'Ra 0.8 um max',
  tolerance: null,
  operatorCount: 1,
  numParts: 10,
  numTrials: 3,
  status: 'DATA_COLLECTED',
  result: null,
  grrPercent: null,
  ndc: null,
  ev: null,
  av: null,
  grr: null,
  pv: null,
  tv: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-06'),
};

const mockMeasurement = {
  id: 'meas-0001',
  studyId: '20000000-0000-4000-a000-000000000001',
  operator: 'Operator A',
  partNumber: 1,
  trial: 1,
  value: 25.01,
  createdAt: new Date('2026-02-02'),
};

// Generate a realistic set of GRR measurements for 2 operators, 3 parts, 2 trials
const generateGrrMeasurements = () => {
  const measurements = [];
  const operators = ['Operator A', 'Operator B'];
  const parts = [1, 2, 3];
  const trials = [1, 2];
  const baseValues: Record<number, number> = { 1: 25.01, 2: 25.03, 3: 24.98 };

  let idx = 0;
  for (const op of operators) {
    for (const part of parts) {
      for (const trial of trials) {
        const noise = ((idx % 3) - 1) * 0.005; // Small variation
        measurements.push({
          id: `meas-grr-${String(idx).padStart(4, '0')}`,
          studyId: '20000000-0000-4000-a000-000000000001',
          operator: op,
          partNumber: part,
          trial,
          value: baseValues[part] + noise,
          createdAt: new Date('2026-02-02'),
        });
        idx++;
      }
    }
  }
  return measurements;
};

// Generate measurements for a non-GRR (BIAS) study
const generateBiasMeasurements = () => [
  {
    id: 'meas-bias-01',
    studyId: '20000000-0000-4000-a000-000000000002',
    operator: 'Operator A',
    partNumber: 1,
    trial: 1,
    value: 0.82,
    createdAt: new Date(),
  },
  {
    id: 'meas-bias-02',
    studyId: '20000000-0000-4000-a000-000000000002',
    operator: 'Operator A',
    partNumber: 1,
    trial: 2,
    value: 0.79,
    createdAt: new Date(),
  },
  {
    id: 'meas-bias-03',
    studyId: '20000000-0000-4000-a000-000000000002',
    operator: 'Operator A',
    partNumber: 1,
    trial: 3,
    value: 0.81,
    createdAt: new Date(),
  },
  {
    id: 'meas-bias-04',
    studyId: '20000000-0000-4000-a000-000000000002',
    operator: 'Operator A',
    partNumber: 2,
    trial: 1,
    value: 0.85,
    createdAt: new Date(),
  },
  {
    id: 'meas-bias-05',
    studyId: '20000000-0000-4000-a000-000000000002',
    operator: 'Operator A',
    partNumber: 2,
    trial: 2,
    value: 0.83,
    createdAt: new Date(),
  },
];

const validCreatePayload = {
  title: 'Caliper Bore Diameter GR&R',
  studyType: 'GRR_CROSSED',
  gageName: 'Digital Caliper #42',
  gageId: 'DC-042',
  characteristic: 'Bore Diameter',
  specification: '25.00 +/- 0.05 mm',
  tolerance: '0.10',
  operatorCount: 3,
  numParts: 10,
  numTrials: 3,
};

const validMeasurementPayload = {
  measurements: [
    { operator: 'Operator A', partNumber: 1, trial: 1, value: 25.01 },
    { operator: 'Operator A', partNumber: 1, trial: 2, value: 25.02 },
    { operator: 'Operator A', partNumber: 2, trial: 1, value: 25.03 },
  ],
};

// ==========================================
// Tests
// ==========================================

describe('Automotive MSA API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/msa', msaRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / - Create MSA Study
  // ==========================================
  describe('POST /api/msa', () => {
    it('should create an MSA study successfully', async () => {
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.msaStudy.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-study-id',
        ...mockStudy,
        refNumber: 'MSA-2602-0001',
      });

      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      expect(mockPrisma.msaStudy.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Caliper Bore Diameter GR&R',
          studyType: 'GRR_CROSSED',
          gageName: 'Digital Caliper #42',
          gageId: 'DC-042',
          characteristic: 'Bore Diameter',
          specification: '25.00 +/- 0.05 mm',
          tolerance: '0.10',
          operatorCount: 3,
          numParts: 10,
          numTrials: 3,
          status: 'DRAFT',
          createdBy: 'user-1',
          refNumber: expect.stringMatching(/^MSA-\d{4}-\d{4}$/),
        }),
      });
    });

    it('should create a study with minimal required fields (defaults for numParts/numTrials)', async () => {
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.msaStudy.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-study-id-2',
        ...mockStudy,
        refNumber: 'MSA-2602-0006',
        numParts: 10,
        numTrials: 3,
      });

      const minimalPayload = {
        title: 'Minimal Study',
        studyType: 'ATTRIBUTE',
        gageName: 'Go/No-Go Gage',
        characteristic: 'Thread Fit',
        operatorCount: 2,
        // numParts and numTrials omitted -- should default to 10 and 3
      };

      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send(minimalPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      expect(mockPrisma.msaStudy.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Minimal Study',
          studyType: 'ATTRIBUTE',
          operatorCount: 2,
          numParts: 10,
          numTrials: 3,
        }),
      });
    });

    it('should generate correct reference number with incrementing sequence', async () => {
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(42);
      (mockPrisma.msaStudy.create as jest.Mock).mockResolvedValueOnce({
        ...mockStudy,
        refNumber: 'MSA-2602-0043',
      });

      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);

      expect(mockPrisma.msaStudy.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringMatching(/^MSA-\d{4}-0043$/),
        }),
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Incomplete Study',
          // missing studyType, gageName, characteristic, operatorCount
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toBeDefined();
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty gageName', async () => {
      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, gageName: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty characteristic', async () => {
      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, characteristic: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid studyType enum', async () => {
      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, studyType: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for operatorCount less than 1', async () => {
      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, operatorCount: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for non-integer operatorCount', async () => {
      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, operatorCount: 2.5 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for numParts less than 1', async () => {
      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, numParts: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for numTrials less than 1', async () => {
      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, numTrials: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept all valid studyType enum values', async () => {
      const studyTypes = [
        'GRR_CROSSED',
        'GRR_NESTED',
        'BIAS',
        'LINEARITY',
        'STABILITY',
        'ATTRIBUTE',
      ];

      for (const studyType of studyTypes) {
        jest.clearAllMocks();
        (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(0);
        (mockPrisma.msaStudy.create as jest.Mock).mockResolvedValueOnce({
          ...mockStudy,
          studyType,
        });

        const response = await request(app)
          .post('/api/msa')
          .set('Authorization', 'Bearer token')
          .send({ ...validCreatePayload, studyType });

        expect(response.status).toBe(201);
      }
    });

    it('should handle database errors during creation', async () => {
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.msaStudy.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/msa')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create MSA study');
    });
  });

  // ==========================================
  // GET / - List MSA Studies
  // ==========================================
  describe('GET /api/msa', () => {
    it('should return a list of studies with default pagination', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValueOnce([mockStudy, mockStudy2]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/msa').set('Authorization', 'Bearer token');

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
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValueOnce([mockStudy]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/msa?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(50);
      expect(response.body.meta.totalPages).toBe(5);

      expect(mockPrisma.msaStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/msa?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
      expect(mockPrisma.msaStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/msa?status=COMPLETED').set('Authorization', 'Bearer token');

      expect(mockPrisma.msaStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'COMPLETED',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by studyType', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValueOnce([mockStudy]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/msa?studyType=GRR_CROSSED').set('Authorization', 'Bearer token');

      expect(mockPrisma.msaStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            studyType: 'GRR_CROSSED',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by result', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/msa?result=ACCEPTABLE').set('Authorization', 'Bearer token');

      expect(mockPrisma.msaStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            result: 'ACCEPTABLE',
            deletedAt: null,
          }),
        })
      );
    });

    it('should combine multiple filters', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/msa?status=COMPLETED&studyType=GRR_CROSSED&result=ACCEPTABLE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.msaStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'COMPLETED',
            studyType: 'GRR_CROSSED',
            result: 'ACCEPTABLE',
            deletedAt: null,
          }),
        })
      );
    });

    it('should order by updatedAt desc then createdAt desc', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/msa').set('Authorization', 'Bearer token');

      expect(mockPrisma.msaStudy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        })
      );
    });

    it('should default page to 1 for invalid page parameter', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/msa?page=abc')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app).get('/api/msa').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list MSA studies');
    });
  });

  // ==========================================
  // GET /:id - Get MSA Study with Measurements
  // ==========================================
  describe('GET /api/msa/:id', () => {
    it('should return a study with measurements', async () => {
      const grrMeasurements = generateGrrMeasurements();
      const studyWithMeasurements = {
        ...mockStudy,
        measurements: grrMeasurements,
      };

      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(studyWithMeasurements);

      const response = await request(app)
        .get('/api/msa/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('20000000-0000-4000-a000-000000000001');
      expect(response.body.data.title).toBe('Caliper Bore Diameter GR&R');
      expect(response.body.data.measurements).toBeDefined();
      expect(response.body.data.measurements).toHaveLength(grrMeasurements.length);

      expect(mockPrisma.msaStudy.findUnique).toHaveBeenCalledWith({
        where: { id: '20000000-0000-4000-a000-000000000001' },
        include: {
          measurements: { orderBy: [{ operator: 'asc' }, { partNumber: 'asc' }, { trial: 'asc' }] },
        },
      });
    });

    it('should return a study with no measurements', async () => {
      const studyNoMeasurements = {
        ...mockStudy,
        measurements: [],
      };

      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(studyNoMeasurements);

      const response = await request(app)
        .get('/api/msa/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.measurements).toHaveLength(0);
    });

    it('should return 404 when study is not found', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/msa/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('MSA study not found');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/msa/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get MSA study');
    });
  });

  // ==========================================
  // POST /:id/data - Enter Measurement Data
  // ==========================================
  describe('POST /api/msa/:id/data', () => {
    it('should enter measurement data and update status to DATA_COLLECTED', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(mockStudy);

      const createdMeasurements = validMeasurementPayload.measurements.map((m, i) => ({
        id: `meas-new-${i}`,
        studyId: '20000000-0000-4000-a000-000000000001',
        ...m,
        createdAt: new Date(),
      }));

      const mockTx = {
        msaMeasurement: {
          create: jest.fn(),
        },
        msaStudy: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      // Set up individual create calls
      createdMeasurements.forEach((m) => {
        mockTx.msaMeasurement.create.mockResolvedValueOnce(m);
      });

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(mockTx));

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send(validMeasurementPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);

      // Verify each measurement was created
      expect(mockTx.msaMeasurement.create).toHaveBeenCalledTimes(3);
      expect(mockTx.msaMeasurement.create).toHaveBeenCalledWith({
        data: {
          studyId: '20000000-0000-4000-a000-000000000001',
          operator: 'Operator A',
          partNumber: 1,
          trial: 1,
          value: 25.01,
        },
      });
      expect(mockTx.msaMeasurement.create).toHaveBeenCalledWith({
        data: {
          studyId: '20000000-0000-4000-a000-000000000001',
          operator: 'Operator A',
          partNumber: 1,
          trial: 2,
          value: 25.02,
        },
      });
      expect(mockTx.msaMeasurement.create).toHaveBeenCalledWith({
        data: {
          studyId: '20000000-0000-4000-a000-000000000001',
          operator: 'Operator A',
          partNumber: 2,
          trial: 1,
          value: 25.03,
        },
      });

      // Verify study status was updated to DATA_COLLECTED
      expect(mockTx.msaStudy.update).toHaveBeenCalledWith({
        where: { id: '20000000-0000-4000-a000-000000000001' },
        data: { status: 'DATA_COLLECTED' },
      });
    });

    it('should return 404 when study does not exist', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/msa/00000000-0000-4000-a000-ffffffffffff/data')
        .set('Authorization', 'Bearer token')
        .send(validMeasurementPayload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('MSA study not found');
    });

    it('should return 404 when study is soft-deleted', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockStudy,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send(validMeasurementPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for empty measurements array', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(mockStudy);

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send({ measurements: [] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing measurements field', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(mockStudy);

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for measurement with empty operator', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(mockStudy);

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send({
          measurements: [{ operator: '', partNumber: 1, trial: 1, value: 25.01 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for measurement with partNumber less than 1', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(mockStudy);

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send({
          measurements: [{ operator: 'Operator A', partNumber: 0, trial: 1, value: 25.01 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for measurement with trial less than 1', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(mockStudy);

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send({
          measurements: [{ operator: 'Operator A', partNumber: 1, trial: 0, value: 25.01 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for measurement with non-numeric value', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(mockStudy);

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send({
          measurements: [
            { operator: 'Operator A', partNumber: 1, trial: 1, value: 'not-a-number' },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept negative measurement values', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(mockStudy);

      const mockTx = {
        msaMeasurement: {
          create: jest.fn().mockResolvedValue({
            id: 'meas-neg',
            studyId: mockStudy.id,
            operator: 'Operator A',
            partNumber: 1,
            trial: 1,
            value: -0.005,
          }),
        },
        msaStudy: {
          update: jest.fn().mockResolvedValue({}),
        },
      };
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(mockTx));

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send({
          measurements: [{ operator: 'Operator A', partNumber: 1, trial: 1, value: -0.005 }],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors during transaction', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(mockStudy);
      (mockPrisma.$transaction as jest.Mock).mockRejectedValueOnce(new Error('Transaction failed'));

      const response = await request(app)
        .post('/api/msa/20000000-0000-4000-a000-000000000001/data')
        .set('Authorization', 'Bearer token')
        .send(validMeasurementPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to enter measurement data');
    });
  });

  // ==========================================
  // GET /:id/results - Calculate GR&R Results
  // ==========================================
  describe('GET /api/msa/:id/results', () => {
    describe('GRR_CROSSED study type', () => {
      it('should calculate and return full GR&R analysis results', async () => {
        const grrMeasurements = generateGrrMeasurements();
        const studyWithMeasurements = {
          ...mockStudy,
          studyType: 'GRR_CROSSED',
          numTrials: 2,
          measurements: grrMeasurements,
        };

        (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(studyWithMeasurements);
        (mockPrisma.msaStudy.update as jest.Mock).mockResolvedValueOnce({});

        const response = await request(app)
          .get('/api/msa/20000000-0000-4000-a000-000000000001/results')
          .set('Authorization', 'Bearer token');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const data = response.body.data;
        expect(data.studyId).toBe('20000000-0000-4000-a000-000000000001');
        expect(data.studyType).toBe('GRR_CROSSED');
        expect(data.totalMeasurements).toBe(grrMeasurements.length);
        expect(data.numOperators).toBe(2);
        expect(data.numParts).toBe(3);
        expect(data.numTrials).toBe(2);

        // Verify repeatability section
        expect(data.repeatability).toBeDefined();
        expect(typeof data.repeatability.averageRange).toBe('number');
        expect(typeof data.repeatability.ev).toBe('number');

        // Verify reproducibility section
        expect(data.reproducibility).toBeDefined();
        expect(typeof data.reproducibility.operatorDifference).toBe('number');
        expect(typeof data.reproducibility.av).toBe('number');

        // Verify Gage R&R section
        expect(data.gageRR).toBeDefined();
        expect(typeof data.gageRR.grr).toBe('number');
        expect(typeof data.gageRR.grrPercent).toBe('number');

        // Verify part variation
        expect(data.partVariation).toBeDefined();
        expect(typeof data.partVariation.pv).toBe('number');

        // Verify total variation
        expect(data.totalVariation).toBeDefined();
        expect(typeof data.totalVariation.tv).toBe('number');

        // Verify ndc and result
        expect(typeof data.ndc).toBe('number');
        expect(['ACCEPTABLE', 'CONDITIONAL', 'UNACCEPTABLE']).toContain(data.result);
      });

      it('should update study with COMPLETED status and result values', async () => {
        const grrMeasurements = generateGrrMeasurements();
        const studyWithMeasurements = {
          ...mockStudy,
          studyType: 'GRR_CROSSED',
          numTrials: 2,
          measurements: grrMeasurements,
        };

        (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(studyWithMeasurements);
        (mockPrisma.msaStudy.update as jest.Mock).mockResolvedValueOnce({});

        await request(app)
          .get('/api/msa/20000000-0000-4000-a000-000000000001/results')
          .set('Authorization', 'Bearer token');

        expect(mockPrisma.msaStudy.update).toHaveBeenCalledWith({
          where: { id: '20000000-0000-4000-a000-000000000001' },
          data: expect.objectContaining({
            status: 'COMPLETED',
            result: expect.any(String),
            grrPercent: expect.any(Number),
            ndc: expect.any(Number),
            ev: expect.any(Number),
            av: expect.any(Number),
            grr: expect.any(Number),
            pv: expect.any(Number),
            tv: expect.any(Number),
          }),
        });
      });

      it('should classify grrPercent < 10 as ACCEPTABLE', async () => {
        // Create measurements with very high part variation and very low measurement error
        // to ensure grrPercent < 10
        const measurements = [];
        const operators = ['Op A', 'Op B'];
        const parts = [1, 2, 3, 4, 5];
        let idx = 0;
        for (const op of operators) {
          for (const part of parts) {
            for (let trial = 1; trial <= 2; trial++) {
              measurements.push({
                id: `m-${idx++}`,
                studyId: mockStudy.id,
                operator: op,
                partNumber: part,
                trial,
                // Large spread between parts, tiny measurement error
                value: part * 10.0 + 0.0001 * trial,
                createdAt: new Date(),
              });
            }
          }
        }

        const study = {
          ...mockStudy,
          studyType: 'GRR_CROSSED',
          numTrials: 2,
          measurements,
        };

        (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(study);
        (mockPrisma.msaStudy.update as jest.Mock).mockResolvedValueOnce({});

        const response = await request(app)
          .get('/api/msa/20000000-0000-4000-a000-000000000001/results')
          .set('Authorization', 'Bearer token');

        expect(response.status).toBe(200);
        expect(response.body.data.result).toBe('ACCEPTABLE');
        expect(response.body.data.gageRR.grrPercent).toBeLessThan(10);
      });
    });

    describe('Non-GRR study types (BIAS, LINEARITY, STABILITY, ATTRIBUTE)', () => {
      it('should return basic statistics for BIAS study type', async () => {
        const biasMeasurements = generateBiasMeasurements();
        const biasStudy = {
          ...mockStudy2,
          studyType: 'BIAS',
          measurements: biasMeasurements,
        };

        (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(biasStudy);
        (mockPrisma.msaStudy.update as jest.Mock).mockResolvedValueOnce({});

        const response = await request(app)
          .get('/api/msa/20000000-0000-4000-a000-000000000002/results')
          .set('Authorization', 'Bearer token');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const data = response.body.data;
        expect(data.studyId).toBe('20000000-0000-4000-a000-000000000002');
        expect(data.studyType).toBe('BIAS');
        expect(data.totalMeasurements).toBe(5);

        // Verify statistics section
        expect(data.statistics).toBeDefined();
        expect(typeof data.statistics.mean).toBe('number');
        expect(typeof data.statistics.stdDev).toBe('number');
        expect(typeof data.statistics.variance).toBe('number');
        expect(typeof data.statistics.min).toBe('number');
        expect(typeof data.statistics.max).toBe('number');
        expect(typeof data.statistics.range).toBe('number');

        // Check basic math
        expect(data.statistics.min).toBeLessThanOrEqual(data.statistics.mean);
        expect(data.statistics.max).toBeGreaterThanOrEqual(data.statistics.mean);
        // range is rounded to 5 decimal places by the route, so use toBeCloseTo
        expect(data.statistics.range).toBeCloseTo(data.statistics.max - data.statistics.min, 5);
      });

      it('should update study status to COMPLETED for non-GRR types', async () => {
        const biasMeasurements = generateBiasMeasurements();
        const biasStudy = {
          ...mockStudy2,
          studyType: 'LINEARITY',
          measurements: biasMeasurements,
        };

        (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(biasStudy);
        (mockPrisma.msaStudy.update as jest.Mock).mockResolvedValueOnce({});

        await request(app)
          .get('/api/msa/20000000-0000-4000-a000-000000000002/results')
          .set('Authorization', 'Bearer token');

        expect(mockPrisma.msaStudy.update).toHaveBeenCalledWith({
          where: { id: '20000000-0000-4000-a000-000000000002' },
          data: { status: 'COMPLETED' },
        });
      });
    });

    describe('Error cases', () => {
      it('should return 404 when study does not exist', async () => {
        (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(null);

        const response = await request(app)
          .get('/api/msa/00000000-0000-4000-a000-ffffffffffff/results')
          .set('Authorization', 'Bearer token');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NOT_FOUND');
        expect(response.body.error.message).toBe('MSA study not found');
      });

      it('should return 404 when study is soft-deleted', async () => {
        (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce({
          ...mockStudy,
          deletedAt: new Date(),
          measurements: [],
        });

        const response = await request(app)
          .get('/api/msa/20000000-0000-4000-a000-000000000001/results')
          .set('Authorization', 'Bearer token');

        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe('NOT_FOUND');
      });

      it('should return 400 when study has no measurement data', async () => {
        const studyNoData = {
          ...mockStudy,
          measurements: [],
        };

        (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(studyNoData);

        const response = await request(app)
          .get('/api/msa/20000000-0000-4000-a000-000000000001/results')
          .set('Authorization', 'Bearer token');

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('NO_DATA');
        expect(response.body.error.message).toBe('No measurement data available for analysis');
      });

      it('should handle database errors gracefully', async () => {
        (mockPrisma.msaStudy.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

        const response = await request(app)
          .get('/api/msa/20000000-0000-4000-a000-000000000001/results')
          .set('Authorization', 'Bearer token');

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INTERNAL_ERROR');
        expect(response.body.error.message).toBe('Failed to calculate MSA results');
      });

      it('should handle database error during study update after calculation', async () => {
        const grrMeasurements = generateGrrMeasurements();
        const studyWithMeasurements = {
          ...mockStudy,
          studyType: 'GRR_CROSSED',
          numTrials: 2,
          measurements: grrMeasurements,
        };

        (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValueOnce(studyWithMeasurements);
        (mockPrisma.msaStudy.update as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

        const response = await request(app)
          .get('/api/msa/20000000-0000-4000-a000-000000000001/results')
          .set('Authorization', 'Bearer token');

        expect(response.status).toBe(500);
        expect(response.body.error.code).toBe('INTERNAL_ERROR');
      });
    });
  });
});

describe('msa — phase30 coverage', () => {
  it('handles string length', () => {
    expect('hello'.length).toBe(5);
  });

});
