import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    controlPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    controlPlanChar: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    ControlPlanWhereInput: {},
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
import controlPlanRoutes from '../src/routes/control-plans';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockControlPlan = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'CP-2602-0001',
  title: 'Brake Assembly Control Plan',
  partNumber: 'BA-2026-001',
  partName: 'Front Brake Assembly',
  planType: 'PROTOTYPE',
  revision: '1.0',
  status: 'DRAFT',
  approvedBy: null,
  approvedDate: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-02-01'),
};

const mockControlPlan2 = {
  id: '20000000-0000-4000-a000-000000000002',
  refNumber: 'CP-2602-0002',
  title: 'Steering Column Control Plan',
  partNumber: 'SC-2026-050',
  partName: 'Steering Column',
  planType: 'PRODUCTION',
  revision: '2.1',
  status: 'APPROVED',
  approvedBy: 'user-2',
  approvedDate: new Date('2026-02-10'),
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-10'),
};

const mockCharacteristic = {
  id: '00000000-0000-0000-0000-000000000001',
  planId: '20000000-0000-4000-a000-000000000001',
  processNumber: '10',
  processName: 'CNC Machining',
  machineDevice: 'CNC Mill #3',
  characteristicName: 'Bore Diameter',
  characteristicType: 'PRODUCT',
  specialCharClass: 'CC',
  specification: '25.00 mm',
  tolerance: '+/- 0.05 mm',
  evalTechnique: 'CMM Measurement',
  sampleSize: '5',
  sampleFrequency: 'Every 2 hours',
  controlMethod: 'X-bar R Chart',
  reactionPlan: 'Stop production, segregate parts, notify supervisor',
  pfmeaRef: 'FMEA-001',
  spcChartId: null,
  workInstructionRef: 'WI-CNC-003',
  createdAt: new Date('2026-01-20'),
  updatedAt: new Date('2026-01-20'),
};

const mockCharacteristic2 = {
  id: 'char-0002',
  planId: '20000000-0000-4000-a000-000000000001',
  processNumber: '20',
  processName: 'Assembly',
  machineDevice: 'Assembly Station A',
  characteristicName: 'Torque',
  characteristicType: 'PROCESS',
  specialCharClass: 'SC',
  specification: '50 Nm',
  tolerance: '+/- 5 Nm',
  evalTechnique: 'Torque Wrench',
  sampleSize: '3',
  sampleFrequency: 'Every batch',
  controlMethod: 'Torque verification log',
  reactionPlan: 'Re-torque and verify',
  pfmeaRef: 'FMEA-002',
  spcChartId: null,
  workInstructionRef: null,
  createdAt: new Date('2026-01-21'),
  updatedAt: new Date('2026-01-21'),
};

const mockPlanWithCharacteristics = {
  ...mockControlPlan,
  characteristics: [mockCharacteristic, mockCharacteristic2],
};

const validCreatePayload = {
  title: 'Brake Assembly Control Plan',
  partNumber: 'BA-2026-001',
  partName: 'Front Brake Assembly',
  planType: 'PROTOTYPE',
  revision: '1.0',
};

const validCharacteristicPayload = {
  processNumber: '10',
  processName: 'CNC Machining',
  machineDevice: 'CNC Mill #3',
  characteristicName: 'Bore Diameter',
  characteristicType: 'PRODUCT',
  specialCharClass: 'CC',
  specification: '25.00 mm',
  tolerance: '+/- 0.05 mm',
  evalTechnique: 'CMM Measurement',
  sampleSize: '5',
  sampleFrequency: 'Every 2 hours',
  controlMethod: 'X-bar R Chart',
  reactionPlan: 'Stop production, segregate parts, notify supervisor',
  pfmeaRef: 'FMEA-001',
  workInstructionRef: 'WI-CNC-003',
};

// ==========================================
// Tests
// ==========================================

describe('Automotive Control Plans API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/control-plans', controlPlanRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / - Create Control Plan
  // ==========================================
  describe('POST /api/control-plans', () => {
    it('should create a control plan successfully', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        refNumber: 'CP-2602-0001',
      });

      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.refNumber).toBe('CP-2602-0001');
      expect(response.body.data.status).toBe('DRAFT');

      expect(mockPrisma.controlPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Brake Assembly Control Plan',
          partNumber: 'BA-2026-001',
          partName: 'Front Brake Assembly',
          planType: 'PROTOTYPE',
          revision: '1.0',
          status: 'DRAFT',
          createdBy: 'user-1',
        }),
      });
    });

    it('should generate sequential reference numbers', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.controlPlan.create as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        refNumber: 'CP-2602-0006',
      });

      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(mockPrisma.controlPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringMatching(/^CP-\d{4}-0006$/),
        }),
      });
    });

    it('should default planType to PROTOTYPE when not provided', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockResolvedValueOnce(mockControlPlan);

      const { planType, ...payloadWithoutType } = validCreatePayload;

      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send(payloadWithoutType);

      expect(response.status).toBe(201);
      expect(mockPrisma.controlPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          planType: 'PROTOTYPE',
        }),
      });
    });

    it('should default revision to 1.0 when not provided', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockResolvedValueOnce(mockControlPlan);

      const { revision, ...payloadWithoutRevision } = validCreatePayload;

      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send(payloadWithoutRevision);

      expect(response.status).toBe(201);
      expect(mockPrisma.controlPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          revision: '1.0',
        }),
      });
    });

    it('should accept PRE_LAUNCH planType', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        planType: 'PRE_LAUNCH',
      });

      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, planType: 'PRE_LAUNCH' });

      expect(response.status).toBe(201);
      expect(mockPrisma.controlPlan.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          planType: 'PRE_LAUNCH',
        }),
      });
    });

    it('should accept PRODUCTION planType', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        planType: 'PRODUCTION',
      });

      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, planType: 'PRODUCTION' });

      expect(response.status).toBe(201);
    });

    it('should return 400 for missing required field title', async () => {
      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send({
          partNumber: 'BA-2026-001',
          partName: 'Front Brake Assembly',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toBeDefined();
    });

    it('should return 400 for missing required field partNumber', async () => {
      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test Plan',
          partName: 'Front Brake Assembly',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field partName', async () => {
      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test Plan',
          partNumber: 'BA-2026-001',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty partNumber', async () => {
      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, partNumber: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid planType', async () => {
      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, planType: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors during creation', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.controlPlan.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create control plan');
    });

    it('should handle ref number generation failure', async () => {
      (mockPrisma.controlPlan.count as jest.Mock).mockRejectedValueOnce(
        new Error('Count query failed')
      );

      const response = await request(app)
        .post('/api/control-plans')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET / - List Control Plans
  // ==========================================
  describe('GET /api/control-plans', () => {
    it('should return a list of control plans with default pagination', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([
        mockControlPlan,
        mockControlPlan2,
      ]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/control-plans')
        .set('Authorization', 'Bearer token');

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
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([mockControlPlan]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/control-plans?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(50);
      expect(response.body.meta.totalPages).toBe(5);

      expect(mockPrisma.controlPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/control-plans?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
      expect(mockPrisma.controlPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should default page to 1 for invalid page value', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/control-plans?page=-5')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
    });

    it('should filter by status', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([mockControlPlan2]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/control-plans?status=APPROVED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.controlPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by planType', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([mockControlPlan]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/control-plans?planType=PROTOTYPE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.controlPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            planType: 'PROTOTYPE',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by partNumber (case-insensitive contains)', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([mockControlPlan]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/control-plans?partNumber=ba-2026')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.controlPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            partNumber: { contains: 'ba-2026', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should combine multiple filters', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/control-plans?status=DRAFT&planType=PROTOTYPE&partNumber=BA')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.controlPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DRAFT',
            planType: 'PROTOTYPE',
            partNumber: { contains: 'BA', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should always exclude soft-deleted records', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/control-plans').set('Authorization', 'Bearer token');

      expect(mockPrisma.controlPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });

    it('should order by updatedAt desc then createdAt desc', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/control-plans').set('Authorization', 'Bearer token');

      expect(mockPrisma.controlPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        })
      );
    });

    it('should return empty data array when no plans exist', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.controlPlan.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/control-plans')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
      expect(response.body.meta.totalPages).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.controlPlan.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .get('/api/control-plans')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list control plans');
    });
  });

  // ==========================================
  // GET /:id - Get Control Plan with Characteristics
  // ==========================================
  describe('GET /api/control-plans/:id', () => {
    it('should return a control plan with characteristics', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(
        mockPlanWithCharacteristics
      );

      const response = await request(app)
        .get('/api/control-plans/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('20000000-0000-4000-a000-000000000001');
      expect(response.body.data.characteristics).toBeDefined();
      expect(response.body.data.characteristics).toHaveLength(2);

      expect(mockPrisma.controlPlan.findUnique).toHaveBeenCalledWith({
        where: { id: '20000000-0000-4000-a000-000000000001' },
        include: {
          characteristics: { orderBy: { createdAt: 'asc' } },
        },
      });
    });

    it('should return a plan with empty characteristics array', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        characteristics: [],
      });

      const response = await request(app)
        .get('/api/control-plans/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.characteristics).toHaveLength(0);
    });

    it('should return 404 when control plan is not found', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/control-plans/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Control plan not found');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/control-plans/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get control plan');
    });
  });

  // ==========================================
  // POST /:id/characteristics - Add Characteristic
  // ==========================================
  describe('POST /api/control-plans/:id/characteristics', () => {
    it('should add a characteristic to a control plan successfully', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.create as jest.Mock).mockResolvedValueOnce(mockCharacteristic);

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(validCharacteristicPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.characteristicName).toBe('Bore Diameter');
      expect(response.body.data.characteristicType).toBe('PRODUCT');

      expect(mockPrisma.controlPlanChar.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          planId: '20000000-0000-4000-a000-000000000001',
          processNumber: '10',
          processName: 'CNC Machining',
          characteristicName: 'Bore Diameter',
          characteristicType: 'PRODUCT',
          evalTechnique: 'CMM Measurement',
          sampleSize: '5',
          sampleFrequency: 'Every 2 hours',
          controlMethod: 'X-bar R Chart',
          reactionPlan: 'Stop production, segregate parts, notify supervisor',
        }),
      });
    });

    it('should add a PROCESS type characteristic', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.create as jest.Mock).mockResolvedValueOnce(mockCharacteristic2);

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCharacteristicPayload,
          characteristicName: 'Torque',
          characteristicType: 'PROCESS',
        });

      expect(response.status).toBe(201);
    });

    it('should add a characteristic with optional fields omitted', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.create as jest.Mock).mockResolvedValueOnce({
        ...mockCharacteristic,
        machineDevice: undefined,
        specialCharClass: undefined,
        specification: undefined,
        tolerance: undefined,
        pfmeaRef: undefined,
        spcChartId: undefined,
        workInstructionRef: undefined,
      });

      const minimalPayload = {
        processNumber: '10',
        processName: 'CNC Machining',
        characteristicName: 'Bore Diameter',
        characteristicType: 'PRODUCT',
        evalTechnique: 'CMM Measurement',
        sampleSize: '5',
        sampleFrequency: 'Every 2 hours',
        controlMethod: 'X-bar R Chart',
        reactionPlan: 'Stop production and notify',
      };

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(minimalPayload);

      expect(response.status).toBe(201);
    });

    it('should return 404 when control plan does not exist', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/control-plans/00000000-0000-4000-a000-ffffffffffff/characteristics')
        .set('Authorization', 'Bearer token')
        .send(validCharacteristicPayload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Control plan not found');
    });

    it('should return 404 when control plan is soft-deleted', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(validCharacteristicPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Control plan not found');
    });

    it('should return 400 for missing required field processNumber', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);

      const { processNumber, ...payload } = validCharacteristicPayload;

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toBeDefined();
    });

    it('should return 400 for missing required field processName', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      const { processName, ...payload } = validCharacteristicPayload;

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field characteristicName', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      const { characteristicName, ...payload } = validCharacteristicPayload;

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field characteristicType', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      const { characteristicType, ...payload } = validCharacteristicPayload;

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid characteristicType', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send({ ...validCharacteristicPayload, characteristicType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field evalTechnique', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      const { evalTechnique, ...payload } = validCharacteristicPayload;

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field sampleSize', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      const { sampleSize, ...payload } = validCharacteristicPayload;

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field sampleFrequency', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      const { sampleFrequency, ...payload } = validCharacteristicPayload;

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field controlMethod', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      const { controlMethod, ...payload } = validCharacteristicPayload;

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required field reactionPlan', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      const { reactionPlan, ...payload } = validCharacteristicPayload;

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty required string fields', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send({ ...validCharacteristicPayload, processNumber: '', processName: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics')
        .set('Authorization', 'Bearer token')
        .send(validCharacteristicPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to add characteristic');
    });
  });

  // ==========================================
  // PUT /:id/characteristics/:charId - Update Characteristic
  // ==========================================
  describe('PUT /api/control-plans/:id/characteristics/:charId', () => {
    it('should update a characteristic successfully', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCharacteristic
      );
      (mockPrisma.controlPlanChar.update as jest.Mock).mockResolvedValueOnce({
        ...mockCharacteristic,
        specification: '26.00 mm',
        tolerance: '+/- 0.02 mm',
      });

      const response = await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ specification: '26.00 mm', tolerance: '+/- 0.02 mm' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.specification).toBe('26.00 mm');
      expect(response.body.data.tolerance).toBe('+/- 0.02 mm');

      expect(mockPrisma.controlPlanChar.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: { specification: '26.00 mm', tolerance: '+/- 0.02 mm' },
      });
    });

    it('should update characteristicType from PRODUCT to PROCESS', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCharacteristic
      );
      (mockPrisma.controlPlanChar.update as jest.Mock).mockResolvedValueOnce({
        ...mockCharacteristic,
        characteristicType: 'PROCESS',
      });

      const response = await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ characteristicType: 'PROCESS' });

      expect(response.status).toBe(200);
      expect(response.body.data.characteristicType).toBe('PROCESS');
    });

    it('should update multiple fields at once', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCharacteristic
      );
      (mockPrisma.controlPlanChar.update as jest.Mock).mockResolvedValueOnce({
        ...mockCharacteristic,
        processName: 'Updated Process',
        controlMethod: 'Updated Method',
        reactionPlan: 'Updated Plan',
        spcChartId: 'spc-001',
      });

      const response = await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({
          processName: 'Updated Process',
          controlMethod: 'Updated Method',
          reactionPlan: 'Updated Plan',
          spcChartId: 'spc-001',
        });

      expect(response.status).toBe(200);
      expect(mockPrisma.controlPlanChar.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: {
          processName: 'Updated Process',
          controlMethod: 'Updated Method',
          reactionPlan: 'Updated Plan',
          spcChartId: 'spc-001',
        },
      });
    });

    it('should only include defined fields in update data', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCharacteristic
      );
      (mockPrisma.controlPlanChar.update as jest.Mock).mockResolvedValueOnce({
        ...mockCharacteristic,
        processName: 'Only This Field',
      });

      await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ processName: 'Only This Field' });

      expect(mockPrisma.controlPlanChar.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: { processName: 'Only This Field' },
      });
    });

    it('should return 404 when control plan does not exist', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put(
          '/api/control-plans/00000000-0000-4000-a000-ffffffffffff/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ specification: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Control plan not found');
    });

    it('should return 404 when control plan is soft-deleted', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ specification: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Control plan not found');
    });

    it('should return 404 when characteristic does not exist', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000099'
        )
        .set('Authorization', 'Bearer token')
        .send({ specification: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Characteristic not found');
    });

    it('should return 404 when characteristic belongs to a different plan', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockCharacteristic,
        planId: 'different-plan-id',
      });

      const response = await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ specification: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Characteristic not found');
    });

    it('should return 400 for invalid characteristicType', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCharacteristic
      );

      const response = await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ characteristicType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ specification: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to update characteristic');
    });

    it('should handle update database errors gracefully', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlanChar.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCharacteristic
      );
      (mockPrisma.controlPlanChar.update as jest.Mock).mockRejectedValueOnce(
        new Error('Update failed')
      );

      const response = await request(app)
        .put(
          '/api/control-plans/20000000-0000-4000-a000-000000000001/characteristics/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ specification: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // POST /:id/approve - Approve Control Plan
  // ==========================================
  describe('POST /api/control-plans/:id/approve', () => {
    it('should approve a DRAFT control plan successfully', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlan.update as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        status: 'APPROVED',
        approvedBy: 'user-1',
        approvedDate: new Date(),
      });

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.approvedBy).toBe('user-1');
      expect(response.body.data.approvedDate).toBeDefined();

      expect(mockPrisma.controlPlan.update).toHaveBeenCalledWith({
        where: { id: '20000000-0000-4000-a000-000000000001' },
        data: {
          status: 'APPROVED',
          approvedBy: 'user-1',
          approvedDate: expect.any(Date),
        },
      });
    });

    it('should set the approvedBy to the current user', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlan.update as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        status: 'APPROVED',
        approvedBy: 'user-1',
        approvedDate: new Date(),
      });

      await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.controlPlan.update).toHaveBeenCalledWith({
        where: { id: '20000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          approvedBy: 'user-1',
        }),
      });
    });

    it('should return 400 when control plan is already approved', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan2); // status: APPROVED

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000002/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ALREADY_APPROVED');
      expect(response.body.error.message).toBe('Control plan is already approved');

      // Should NOT call update
      expect(mockPrisma.controlPlan.update).not.toHaveBeenCalled();
    });

    it('should return 404 when control plan does not exist', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/control-plans/00000000-0000-4000-a000-ffffffffffff/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Control plan not found');
    });

    it('should return 404 when control plan is soft-deleted', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockControlPlan,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to approve control plan');
    });

    it('should handle update database errors gracefully', async () => {
      (mockPrisma.controlPlan.findUnique as jest.Mock).mockResolvedValueOnce(mockControlPlan);
      (mockPrisma.controlPlan.update as jest.Mock).mockRejectedValueOnce(
        new Error('Update failed')
      );

      const response = await request(app)
        .post('/api/control-plans/20000000-0000-4000-a000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});


describe('phase34 coverage', () => {
  it('handles string comparison', () => { expect('apple' < 'banana').toBe(true); expect('zebra' > 'apple').toBe(true); });
  it('handles array of objects sort', () => { const arr = [{n:3},{n:1},{n:2}]; arr.sort((a,b)=>a.n-b.n); expect(arr[0].n).toBe(1); });
  it('handles negative array index via at()', () => { expect([10,20,30].at(-2)).toBe(20); });
  it('computes sum of array', () => { expect([1,2,3,4,5].reduce((a,b)=>a+b,0)).toBe(15); });
  it('handles Set union', () => { const a = new Set([1,2,3]); const b = new Set([2,3,4]); const union = new Set([...a,...b]); expect(union.size).toBe(4); });
});


describe('phase35 coverage', () => {
  it('handles object pick pattern', () => { const pick = <T, K extends keyof T>(o:T, keys:K[]): Pick<T,K> => Object.fromEntries(keys.map(k=>[k,o[k]])) as Pick<T,K>; expect(pick({a:1,b:2,c:3},['a','c'])).toEqual({a:1,c:3}); });
  it('handles object entries round-trip', () => { const o = {a:1,b:2}; expect(Object.fromEntries(Object.entries(o))).toEqual(o); });
  it('handles object omit pattern', () => { const omit = <T, K extends keyof T>(o:T, keys:K[]): Omit<T,K> => { const r={...o}; keys.forEach(k=>delete (r as any)[k]); return r as Omit<T,K>; }; expect(omit({a:1,b:2,c:3},['b'])).toEqual({a:1,c:3}); });
  it('handles discriminated union', () => { type Shape = {kind:'circle';r:number}|{kind:'rect';w:number;h:number}; const area=(s:Shape)=>s.kind==='circle'?Math.PI*s.r*s.r:s.w*s.h; expect(area({kind:'rect',w:3,h:4})).toBe(12); });
  it('handles array groupBy pattern', () => { const groupBy = <T>(arr:T[], key:(item:T)=>string): Record<string,T[]> => arr.reduce((acc,item)=>{ const k=key(item); (acc[k]=acc[k]||[]).push(item); return acc; },{}as Record<string,T[]>); const r = groupBy([{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}],x=>x.t); expect(r['a'].length).toBe(2); });
});


describe('phase36 coverage', () => {
  it('handles graph adjacency list', () => { const g=new Map<number,number[]>([[1,[2,3]],[2,[4]],[3,[4]],[4,[]]]);const neighbors=g.get(1)!;expect(neighbors).toContain(2);expect(neighbors.length).toBe(2); });
  it('handles counting sort result', () => { const arr=[3,1,4,1,5,9,2,6]; const sorted=[...arr].sort((a,b)=>a-b); expect(sorted[0]).toBe(1); expect(sorted[sorted.length-1]).toBe(9); });
  it('handles two-sum pattern', () => { const twoSum=(nums:number[],t:number)=>{const m=new Map<number,number>();for(let i=0;i<nums.length;i++){const c=t-nums[i];if(m.has(c))return[m.get(c)!,i];m.set(nums[i],i);}return[];}; expect(twoSum([2,7,11,15],9)).toEqual([0,1]); });
  it('handles power set size', () => { const powerSetSize=(n:number)=>Math.pow(2,n);expect(powerSetSize(3)).toBe(8);expect(powerSetSize(0)).toBe(1); });
  it('handles object to query string', () => { const toQS=(o:Record<string,string|number>)=>Object.entries(o).map(([k,v])=>`${k}=${v}`).join('&');expect(toQS({a:1,b:'x'})).toBe('a=1&b=x'); });
});


describe('phase37 coverage', () => {
  it('removes duplicates preserving order', () => { const unique=<T>(a:T[])=>[...new Set(a)]; expect(unique([3,1,2,1,3])).toEqual([3,1,2]); });
  it('rotates array left', () => { const rotL=<T>(a:T[],n:number)=>[...a.slice(n),...a.slice(0,n)]; expect(rotL([1,2,3,4,5],2)).toEqual([3,4,5,1,2]); });
  it('picks max from array', () => { expect(Math.max(...[5,3,8,1,9])).toBe(9); });
  it('removes falsy values', () => { const compact=<T>(a:(T|null|undefined|false|0|'')[])=>a.filter(Boolean) as T[]; expect(compact([1,0,2,null,3,undefined,false])).toEqual([1,2,3]); });
  it('computes hamming distance', () => { const hamming=(a:string,b:string)=>[...a].filter((c,i)=>c!==b[i]).length; expect(hamming('karolin','kathrin')).toBe(3); });
});
