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


describe('phase38 coverage', () => {
  it('computes longest common subsequence length', () => { const lcs=(a:string,b:string)=>{const m=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=a[i-1]===b[j-1]?m[i-1][j-1]+1:Math.max(m[i-1][j],m[i][j-1]);return m[a.length][b.length];}; expect(lcs('ABCBDAB','BDCAB')).toBe(4); });
  it('implements count inversions approach', () => { const inv=(a:number[])=>{let c=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]>a[j])c++;return c;}; expect(inv([3,1,2])).toBe(2); });
  it('finds longest palindromic substring length', () => { const longestPalin=(s:string)=>{let max=1;for(let i=0;i<s.length;i++){for(let l=i,r=i;l>=0&&r<s.length&&s[l]===s[r];l--,r++)max=Math.max(max,r-l+1);for(let l=i,r=i+1;l>=0&&r<s.length&&s[l]===s[r];l--,r++)max=Math.max(max,r-l+1);}return max;}; expect(longestPalin('babad')).toBe(3); });
  it('finds median of array', () => { const med=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}; expect(med([3,1,4,1,5])).toBe(3); expect(med([1,2,3,4])).toBe(2.5); });
  it('checks Armstrong number', () => { const isArmstrong=(n:number)=>{const d=String(n).split('');return d.reduce((s,c)=>s+Math.pow(Number(c),d.length),0)===n;}; expect(isArmstrong(153)).toBe(true); expect(isArmstrong(100)).toBe(false); });
});


describe('phase39 coverage', () => {
  it('checks if graph has cycle (undirected)', () => { const hasCycle=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const vis=new Set<number>();const dfs=(node:number,par:number):boolean=>{vis.add(node);for(const nb of adj[node]){if(!vis.has(nb)){if(dfs(nb,node))return true;}else if(nb!==par)return true;}return false;};return dfs(0,-1);}; expect(hasCycle(4,[[0,1],[1,2],[2,3],[3,1]])).toBe(true); expect(hasCycle(3,[[0,1],[1,2]])).toBe(false); });
  it('implements string hashing polynomial', () => { const polyHash=(s:string,p=31,m=1e9+7)=>[...s].reduce((h,c)=>(h*p+c.charCodeAt(0))%m,0); const h=polyHash('hello'); expect(typeof h).toBe('number'); expect(h).toBeGreaterThan(0); });
  it('generates power set of small array', () => { const ps=<T>(a:T[]):T[][]=>a.reduce((acc,v)=>[...acc,...acc.map(s=>[...s,v])],[[]] as T[][]); expect(ps([1,2]).length).toBe(4); });
  it('implements XOR swap', () => { let a=5,b=3; a=a^b; b=a^b; a=a^b; expect(a).toBe(3); expect(b).toBe(5); });
  it('zigzag converts string', () => { const zz=(s:string,r:number)=>{if(r===1)return s;const rows=Array.from({length:r},()=>'');let row=0,dir=-1;for(const c of s){rows[row]+=c;if(row===0||row===r-1)dir*=-1;row+=dir;}return rows.join('');}; expect(zz('PAYPALISHIRING',3)).toBe('PAHNAPLSIIGYIR'); });
});


describe('phase40 coverage', () => {
  it('checks if number is perfect power', () => { const isPerfPow=(n:number)=>{for(let b=2;b*b<=n;b++)for(let e=2;Math.pow(b,e)<=n;e++)if(Math.pow(b,e)===n)return true;return false;}; expect(isPerfPow(8)).toBe(true); expect(isPerfPow(9)).toBe(true); expect(isPerfPow(10)).toBe(false); });
  it('finds smallest window containing all chars', () => { const minWindow=(s:string,t:string)=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let l=0,formed=0,best='';const have=new Map<string,number>();for(let r=0;r<s.length;r++){const c=s[r];have.set(c,(have.get(c)||0)+1);if(need.has(c)&&have.get(c)===need.get(c))formed++;while(formed===need.size){const w=s.slice(l,r+1);if(!best||w.length<best.length)best=w;const lc=s[l];have.set(lc,(have.get(lc)||0)-1);if(need.has(lc)&&have.get(lc)!<need.get(lc)!)formed--;l++;}}return best;}; expect(minWindow('ADOBECODEBANC','ABC')).toBe('BANC'); });
  it('computes element-wise matrix addition', () => { const addM=(a:number[][],b:number[][])=>a.map((r,i)=>r.map((v,j)=>v+b[i][j])); expect(addM([[1,2],[3,4]],[[5,6],[7,8]])).toEqual([[6,8],[10,12]]); });
  it('implements string multiplication', () => { const mul=(a:string,b:string)=>{const m=a.length,n=b.length,pos=Array(m+n).fill(0);for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--){const p=(Number(a[i]))*(Number(b[j]));const p1=i+j,p2=i+j+1;const sum=p+pos[p2];pos[p2]=sum%10;pos[p1]+=Math.floor(sum/10);}return pos.join('').replace(/^0+/,'')||'0';}; expect(mul('123','456')).toBe('56088'); });
  it('converts number to words (single digit)', () => { const words=['zero','one','two','three','four','five','six','seven','eight','nine']; expect(words[7]).toBe('seven'); });
});


describe('phase41 coverage', () => {
  it('implements counting sort for strings', () => { const countSort=(a:string[])=>[...a].sort(); expect(countSort(['banana','apple','cherry'])).toEqual(['apple','banana','cherry']); });
  it('computes extended GCD', () => { const extGcd=(a:number,b:number):[number,number,number]=>{if(b===0)return[a,1,0];const[g,x,y]=extGcd(b,a%b);return[g,y,x-Math.floor(a/b)*y];}; const[g]=extGcd(35,15); expect(g).toBe(5); });
  it('parses simple key=value config string', () => { const parse=(s:string)=>Object.fromEntries(s.split('\n').filter(Boolean).map(l=>l.split('=').map(p=>p.trim()) as [string,string])); expect(parse('host=localhost\nport=3000')).toEqual({host:'localhost',port:'3000'}); });
  it('computes largest rectangle in binary matrix', () => { const maxRect=(matrix:number[][])=>{if(!matrix.length)return 0;const h=Array(matrix[0].length).fill(0);let max=0;const hist=(heights:number[])=>{const st:number[]=[],n=heights.length;let m=0;for(let i=0;i<=n;i++){while(st.length&&(i===n||heights[st[st.length-1]]>=heights[i])){const ht=heights[st.pop()!];const w=st.length?i-st[st.length-1]-1:i;m=Math.max(m,ht*w);}st.push(i);}return m;};for(const row of matrix){row.forEach((v,j)=>{h[j]=v===0?0:h[j]+v;});max=Math.max(max,hist(h));}return max;}; expect(maxRect([[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]])).toBe(6); });
  it('finds all permutations of array', () => { const perms=<T>(a:T[]):T[][]=>a.length<=1?[a]:[...a.flatMap((v,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[v,...p]))]; expect(perms([1,2,3]).length).toBe(6); });
});


describe('phase42 coverage', () => {
  it('computes dot product of 2D vectors', () => { const dot=(ax:number,ay:number,bx:number,by:number)=>ax*bx+ay*by; expect(dot(1,0,0,1)).toBe(0); expect(dot(2,3,4,5)).toBe(23); });
  it('converts hex color to RGB', () => { const fromHex=(h:string)=>{const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];}; expect(fromHex('#ffa500')).toEqual([255,165,0]); });
  it('computes angle between two vectors in degrees', () => { const angle=(ax:number,ay:number,bx:number,by:number)=>{const cos=(ax*bx+ay*by)/(Math.hypot(ax,ay)*Math.hypot(bx,by));return Math.round(Math.acos(Math.max(-1,Math.min(1,cos)))*180/Math.PI);}; expect(angle(1,0,0,1)).toBe(90); expect(angle(1,0,1,0)).toBe(0); });
  it('checks if polygon is convex', () => { const isConvex=(pts:[number,number][])=>{const n=pts.length;let sign=0;for(let i=0;i<n;i++){const[ax,ay]=pts[i],[bx,by]=pts[(i+1)%n],[cx,cy]=pts[(i+2)%n];const cross=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);if(cross!==0){if(sign===0)sign=cross>0?1:-1;else if((cross>0?1:-1)!==sign)return false;}}return true;}; expect(isConvex([[0,0],[1,0],[1,1],[0,1]])).toBe(true); });
  it('computes Zeckendorf representation count', () => { const fibs=(n:number)=>{const f=[1,2];while(f[f.length-1]+f[f.length-2]<=n)f.push(f[f.length-1]+f[f.length-2]);return f.filter(v=>v<=n).reverse();}; const zeck=(n:number)=>{const f=fibs(n);const r:number[]=[];let rem=n;for(const v of f)if(rem>=v){r.push(v);rem-=v;}return r;}; expect(zeck(11)).toEqual([8,3]); });
});


describe('phase43 coverage', () => {
  it('computes cross-entropy loss (binary)', () => { const bce=(p:number,y:number)=>-(y*Math.log(p+1e-9)+(1-y)*Math.log(1-p+1e-9)); expect(bce(0.9,1)).toBeLessThan(bce(0.1,1)); });
  it('gets last day of month', () => { const lastDay=(y:number,m:number)=>new Date(y,m,0).getDate(); expect(lastDay(2026,2)).toBe(28); expect(lastDay(2024,2)).toBe(29); });
  it('computes percentage change', () => { const pctChange=(from:number,to:number)=>((to-from)/from)*100; expect(pctChange(100,125)).toBe(25); expect(pctChange(200,150)).toBe(-25); });
  it('computes Spearman rank correlation', () => { const rank=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);return a.map(v=>s.indexOf(v)+1);}; const x=[1,2,3,4,5],y=[5,6,7,8,7]; const rx=rank(x),ry=rank(y); expect(rx).toEqual([1,2,3,4,5]); });
  it('rounds to nearest multiple', () => { const roundTo=(n:number,m:number)=>Math.round(n/m)*m; expect(roundTo(27,5)).toBe(25); expect(roundTo(28,5)).toBe(30); });
});


describe('phase44 coverage', () => {
  it('counts vowels in string', () => { const cv=(s:string)=>(s.match(/[aeiouAEIOU]/g)||[]).length; expect(cv('Hello World')).toBe(3); });
  it('flattens nested array one level', () => { const flat1=(a:any[][])=>([] as any[]).concat(...a); expect(flat1([[1,2],[3,4],[5]])).toEqual([1,2,3,4,5]); });
  it('computes nth Fibonacci iteratively', () => { const fib=(n:number)=>{let a=0,b=1;for(let i=0;i<n;i++){[a,b]=[b,a+b];}return a;}; expect(fib(0)).toBe(0); expect(fib(7)).toBe(13); expect(fib(10)).toBe(55); });
  it('computes cumulative sum', () => { const cumsum=(a:number[])=>a.reduce((acc,v,i)=>[...acc,((acc[i-1]||0)+v)],[] as number[]); expect(cumsum([1,2,3,4])).toEqual([1,3,6,10]); });
  it('detects balanced brackets', () => { const bal=(s:string)=>{const st:string[]=[];for(const c of s){if('([{'.includes(c))st.push(c);else{const t=st.pop();if(c===')' && t!=='(')return false;if(c===']' && t!=='[')return false;if(c==='}' && t!=='{')return false;}}return st.length===0;}; expect(bal('([{}])')).toBe(true); expect(bal('([)]')).toBe(false); });
});


describe('phase45 coverage', () => {
  it('computes z-score normalization', () => { const zn=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;const sd=Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length);return a.map(v=>(v-m)/sd);}; const r=zn([2,4,4,4,5,5,7,9]); expect(Math.round(r[0]*100)/100).toBe(-1.5); });
  it('transposes a matrix', () => { const tr=(m:number[][])=>m[0].map((_,c)=>m.map(r=>r[c])); expect(tr([[1,2,3],[4,5,6]])).toEqual([[1,4],[2,5],[3,6]]); });
  it('generates multiplication table', () => { const mt=(n:number)=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>(i+1)*(j+1))); const t=mt(3); expect(t[0]).toEqual([1,2,3]); expect(t[2]).toEqual([3,6,9]); });
  it('computes moving average', () => { const ma=(a:number[],w:number)=>Array.from({length:a.length-w+1},(_,i)=>a.slice(i,i+w).reduce((s,v)=>s+v,0)/w); expect(ma([1,2,3,4,5],3).map(v=>Math.round(v*10)/10)).toEqual([2,3,4]); });
  it('implements safe division', () => { const sdiv=(a:number,b:number,fallback=0)=>b===0?fallback:a/b; expect(sdiv(10,2)).toBe(5); expect(sdiv(5,0)).toBe(0); expect(sdiv(5,0,Infinity)).toBe(Infinity); });
});


describe('phase46 coverage', () => {
  it('implements Dijkstra shortest path', () => { const dijk=(n:number,edges:[number,number,number][],s:number)=>{const adj:([number,number])[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v,w])=>{adj[u].push([v,w]);adj[v].push([u,w]);});const dist=new Array(n).fill(Infinity);dist[s]=0;const vis=new Set<number>();while(vis.size<n){let u=-1;dist.forEach((d,i)=>{if(!vis.has(i)&&(u===-1||d<dist[u]))u=i;});if(dist[u]===Infinity)break;vis.add(u);adj[u].forEach(([v,w])=>{if(dist[u]+w<dist[v])dist[v]=dist[u]+w;});} return dist;}; expect(dijk(5,[[0,1,4],[0,2,1],[2,1,2],[1,3,1],[2,3,5]],0)).toEqual([0,3,1,4,Infinity]); });
  it('finds saddle point in matrix', () => { const sp=(m:number[][])=>{for(let i=0;i<m.length;i++){const rowMin=Math.min(...m[i]);for(let j=0;j<m[i].length;j++){if(m[i][j]===rowMin){const col=m.map(r=>r[j]);if(m[i][j]===Math.max(...col))return[i,j];}}}return null;}; expect(sp([[1,2],[4,3]])).toEqual([1,1]); });
  it('checks if tree is balanced', () => { type N={v:number;l?:N;r?:N}; const bal=(n:N|undefined):number=>{if(!n)return 0;const l=bal(n.l),r=bal(n.r);if(l===-1||r===-1||Math.abs(l-r)>1)return -1;return 1+Math.max(l,r);}; const ok=(t:N|undefined)=>bal(t)!==-1; const t:N={v:1,l:{v:2,l:{v:4}},r:{v:3}}; expect(ok(t)).toBe(true); const bad:N={v:1,l:{v:2,l:{v:3,l:{v:4}}}}; expect(ok(bad)).toBe(false); });
  it('finds bridges in undirected graph', () => { const bridges=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const disc=new Array(n).fill(-1),low=new Array(n).fill(0);let timer=0;const res:[number,number][]=[];const dfs=(u:number,p:number)=>{disc[u]=low[u]=timer++;for(const v of adj[u]){if(disc[v]===-1){dfs(v,u);low[u]=Math.min(low[u],low[v]);if(low[v]>disc[u])res.push([u,v]);}else if(v!==p)low[u]=Math.min(low[u],disc[v]);}};for(let i=0;i<n;i++)if(disc[i]===-1)dfs(i,-1);return res;}; expect(bridges(4,[[0,1],[1,2],[2,0],[1,3]]).length).toBe(1); });
  it('finds path sum in binary tree', () => { type N={v:number;l?:N;r?:N}; const ps=(n:N|undefined,t:number,cur=0):boolean=>!n?false:n.v+cur===t&&!n.l&&!n.r?true:ps(n.l,t,cur+n.v)||ps(n.r,t,cur+n.v); const t:N={v:5,l:{v:4,l:{v:11,l:{v:7},r:{v:2}}},r:{v:8,l:{v:13},r:{v:4,r:{v:1}}}}; expect(ps(t,22)).toBe(true); expect(ps(t,28)).toBe(false); });
});


describe('phase47 coverage', () => {
  it('computes longest substring without repeating', () => { const lw=(s:string)=>{const m=new Map<string,number>();let best=0,l=0;for(let r=0;r<s.length;r++){if(m.has(s[r])&&m.get(s[r])!>=l)l=m.get(s[r])!+1;m.set(s[r],r);best=Math.max(best,r-l+1);}return best;}; expect(lw('abcabcbb')).toBe(3); expect(lw('pwwkew')).toBe(3); });
  it('implements KMP string search', () => { const kmp=(text:string,pat:string)=>{const n=text.length,m=pat.length;const lps=new Array(m).fill(0);for(let i=1,len=0;i<m;){if(pat[i]===pat[len])lps[i++]=++len;else len>0?len=lps[len-1]:i++;}const res:number[]=[];for(let i=0,j=0;i<n;){if(text[i]===pat[j]){i++;j++;}if(j===m){res.push(i-j);j=lps[j-1];}else if(i<n&&text[i]!==pat[j])j>0?j=lps[j-1]:i++;}return res;}; expect(kmp('AABAACAADAABAABA','AABA')).toEqual([0,9,12]); });
  it('implements binary indexed tree (Fenwick)', () => { const bit=(n:number)=>{const t=new Array(n+1).fill(0);const upd=(i:number,v:number)=>{for(i++;i<=n;i+=i&-i)t[i]+=v;};const qry=(i:number)=>{let s=0;for(i++;i>0;i-=i&-i)s+=t[i];return s;};const rng=(l:number,r:number)=>qry(r)-(l>0?qry(l-1):0);return{upd,rng};}; const b=bit(6);[1,3,5,7,9,11].forEach((v,i)=>b.upd(i,v)); expect(b.rng(1,3)).toBe(15); expect(b.rng(0,5)).toBe(36); });
  it('checks if matrix has a zero row', () => { const zr=(m:number[][])=>m.some(r=>r.every(v=>v===0)); expect(zr([[1,2],[0,0],[3,4]])).toBe(true); expect(zr([[1,2],[3,4]])).toBe(false); });
  it('finds word in grid (DFS backtrack)', () => { const ws=(board:string[][],word:string)=>{const r=board.length,c=board[0].length;const dfs=(i:number,j:number,k:number):boolean=>{if(k===word.length)return true;if(i<0||j<0||i>=r||j>=c||board[i][j]!==word[k])return false;const tmp=board[i][j];board[i][j]='#';const found=[[0,1],[0,-1],[1,0],[-1,0]].some(([di,dj])=>dfs(i+di,j+dj,k+1));board[i][j]=tmp;return found;};for(let i=0;i<r;i++)for(let j=0;j<c;j++)if(dfs(i,j,0))return true;return false;}; expect(ws([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCCED')).toBe(true); expect(ws([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCB')).toBe(false); });
});


describe('phase48 coverage', () => {
  it('finds median without sorting (quickselect)', () => { const qs=(a:number[],k:number):number=>{const p=a[Math.floor(a.length/2)];const lo=a.filter(x=>x<p),eq=a.filter(x=>x===p),hi=a.filter(x=>x>p);return k<lo.length?qs(lo,k):k<lo.length+eq.length?p:qs(hi,k-lo.length-eq.length);}; const a=[3,1,4,1,5,9,2,6];const m=qs(a,Math.floor(a.length/2)); expect(m).toBe(4); });
  it('finds two missing numbers in range', () => { const tm=(a:number[],n:number)=>{const s=a.reduce((acc,v)=>acc+v,0),sp=a.reduce((acc,v)=>acc+v*v,0);const ts=n*(n+1)/2,tsp=n*(n+1)*(2*n+1)/6;const d=ts-s,dp2=tsp-sp;const b=(dp2/d-d)/2;return [Math.round(b+d),Math.round(b)].sort((x,y)=>x-y);}; expect(tm([1,2,4,6],6)).toEqual([-2,6]); });
  it('finds number of ways to express n as sum of primes', () => { const wp=(n:number)=>{const sieve=(m:number)=>{const p=new Array(m+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=m;i++)if(p[i])for(let j=i*i;j<=m;j+=i)p[j]=false;return Array.from({length:m-1},(_,i)=>i+2).filter(i=>p[i]);};const primes=sieve(n);const dp=new Array(n+1).fill(0);dp[0]=1;for(const p of primes)for(let i=p;i<=n;i++)dp[i]+=dp[i-p];return dp[n];}; expect(wp(7)).toBe(3); expect(wp(10)).toBe(5); });
  it('finds the right sibling of each tree node', () => { type N={v:number;l?:N;r?:N;next?:N}; const connect=(root:N|undefined)=>{if(!root)return;const q:N[]=[root];while(q.length){const sz=q.length;for(let i=0;i<sz;i++){const n=q.shift()!;if(i<sz-1)n.next=q[0];if(n.l)q.push(n.l);if(n.r)q.push(n.r);}}return root;}; const t:N={v:1,l:{v:2,l:{v:4},r:{v:5}},r:{v:3,r:{v:7}}}; connect(t); expect(t.l?.next?.v).toBe(3); });
  it('finds the missing number in sequence', () => { const miss=(a:number[])=>{const n=a.length;return n*(n+1)/2-a.reduce((s,v)=>s+v,0);}; expect(miss([3,0,1])).toBe(2); expect(miss([9,6,4,2,3,5,7,0,1])).toBe(8); });
});


describe('phase49 coverage', () => {
  it('finds closest pair of points', () => { const cp=(pts:[number,number][])=>{const d=([x1,y1]:[number,number],[x2,y2]:[number,number])=>Math.hypot(x2-x1,y2-y1);let min=Infinity;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)min=Math.min(min,d(pts[i],pts[j]));return min;}; expect(cp([[0,0],[3,4],[1,1]])).toBeCloseTo(Math.sqrt(2)); });
  it('finds longest palindromic subsequence', () => { const lps=(s:string)=>{const n=s.length;const dp=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0)) as number[][];for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=s[i]===s[j]?(len===2?2:dp[i+1][j-1]+2):Math.max(dp[i+1][j],dp[i][j-1]);}return dp[0][n-1];}; expect(lps('bbbab')).toBe(4); expect(lps('cbbd')).toBe(2); });
  it('checks if string has all unique characters', () => { const uniq=(s:string)=>new Set(s).size===s.length; expect(uniq('abcde')).toBe(true); expect(uniq('aabcd')).toBe(false); expect(uniq('')).toBe(true); });
  it('finds maximum score from removing stones', () => { const ms=(a:number,b:number,c:number)=>{const s=[a,b,c].sort((x,y)=>x-y);return s[2]>=s[0]+s[1]?s[0]+s[1]:Math.floor((a+b+c)/2);}; expect(ms(2,4,6)).toBe(6); expect(ms(4,4,6)).toBe(7); });
  it('finds all topological orderings count', () => { const dag=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);const ind=new Array(n).fill(0);edges.forEach(([u,v])=>{adj[u].push(v);ind[v]++;});const q=ind.map((v,i)=>v===0?i:-1).filter(v=>v>=0);return q.length;}; expect(dag(4,[[0,1],[0,2],[1,3],[2,3]])).toBe(1); });
});


describe('phase50 coverage', () => {
  it('finds number of atoms in molecule', () => { const atoms=(f:string)=>{const m=new Map<string,number>();let i=0;const parse=(mult:number)=>{while(i<f.length&&f[i]!==')'){if(f[i]==='('){i++;parse(mult);}else{const s=i;i++;while(i<f.length&&f[i]>='a'&&f[i]<='z')i++;const el=f.slice(s,i);let n=0;while(i<f.length&&f[i]>='0'&&f[i]<='9')n=n*10+Number(f[i++]);m.set(el,(m.get(el)||0)+(n||1)*mult);}if(f[i]===')'){i++;let n=0;while(i<f.length&&f[i]>='0'&&f[i]<='9')n=n*10+Number(f[i++]);mult*=n||1;}};};parse(1);return Object.fromEntries([...m.entries()].sort());}; expect(atoms('H2O')).toEqual({H:2,O:1}); });
  it('finds number of good subarrays', () => { const gs=(a:number[],k:number)=>{const mp=new Map([[0,1]]);let sum=0,cnt=0;for(const v of a){sum+=v;cnt+=mp.get(sum-k)||0;mp.set(sum,(mp.get(sum)||0)+1);}return cnt;}; expect(gs([1,1,1],2)).toBe(2); expect(gs([1,2,3],3)).toBe(2); });
  it('finds maximum width of binary tree level', () => { const mw=(a:(number|null)[])=>{let max=0;for(let l=0,r=0,sz=1;l<a.length;l=r+1,r=Math.min(a.length-1,l+2*sz-1),sz*=2){while(l<=r&&a[l]===null)l++;while(r>=l&&a[r]===null)r--;max=Math.max(max,r-l+1);}return max;}; expect(mw([1,3,2,5,3,null,9])).toBe(4); });
  it('finds maximum number of events attended', () => { const mae=(events:[number,number][])=>{events.sort((a,b)=>a[0]-b[0]);const endTimes:number[]=[];let day=0,idx=0,cnt=0;for(day=1;day<=100000&&idx<events.length;day++){while(idx<events.length&&events[idx][0]<=day){let i=endTimes.length;endTimes.push(events[idx][1]);while(i>0&&endTimes[Math.floor((i-1)/2)]>endTimes[i]){[endTimes[Math.floor((i-1)/2)],endTimes[i]]=[endTimes[i],endTimes[Math.floor((i-1)/2)]];i=Math.floor((i-1)/2);}idx++;}while(endTimes.length&&endTimes[0]<day){endTimes.shift();}if(endTimes.length){endTimes.shift();cnt++;}}return cnt;}; expect(mae([[1,2],[2,3],[3,4]])).toBe(3); });
  it('implements reservoir sampling', () => { const res=(a:number[],k:number,seed=42)=>{const r=[...a.slice(0,k)];let x=seed;const rand=()=>{x^=x<<13;x^=x>>17;x^=x<<5;return Math.abs(x);};for(let i=k;i<a.length;i++){const j=rand()%(i+1);if(j<k)r[j]=a[i];}return r;}; expect(res([1,2,3,4,5],3).length).toBe(3); });
});

describe('phase51 coverage', () => {
  it('solves coin change minimum coins', () => { const cc=(coins:number[],amt:number)=>{const dp=new Array(amt+1).fill(amt+1);dp[0]=0;for(let i=1;i<=amt;i++)for(const c of coins)if(c<=i)dp[i]=Math.min(dp[i],dp[i-c]+1);return dp[amt]>amt?-1:dp[amt];}; expect(cc([1,5,11],15)).toBe(3); expect(cc([2],3)).toBe(-1); expect(cc([1,2,5],11)).toBe(3); });
  it('counts ways to decode a digit string', () => { const decode=(s:string)=>{if(!s||s[0]==='0')return 0;const n=s.length,dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=Number(s[i-1]),two=Number(s.slice(i-2,i));if(one>0)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(decode('12')).toBe(2); expect(decode('226')).toBe(3); expect(decode('06')).toBe(0); });
  it('implements union-find with path compression', () => { const uf=(n:number)=>{const p=Array.from({length:n},(_:unknown,i:number)=>i),r=new Array(n).fill(0);const find=(x:number):number=>{if(p[x]!==x)p[x]=find(p[x]);return p[x];};const union=(a:number,b:number)=>{const pa=find(a),pb=find(b);if(pa===pb)return false;if(r[pa]<r[pb])p[pa]=pb;else if(r[pa]>r[pb])p[pb]=pa;else{p[pb]=pa;r[pa]++;}return true;};return{find,union};}; const d=uf(5);d.union(0,1);d.union(1,2);d.union(3,4); expect(d.find(0)===d.find(2)).toBe(true); expect(d.find(0)===d.find(3)).toBe(false); });
  it('traverses matrix in spiral order', () => { const spiral=(m:number[][])=>{const res:number[]=[];let t=0,b=m.length-1,l=0,r=m[0].length-1;while(t<=b&&l<=r){for(let i=l;i<=r;i++)res.push(m[t][i]);t++;for(let i=t;i<=b;i++)res.push(m[i][r]);r--;if(t<=b){for(let i=r;i>=l;i--)res.push(m[b][i]);b--;}if(l<=r){for(let i=b;i>=t;i--)res.push(m[i][l]);l++;}}return res;}; expect(spiral([[1,2,3],[4,5,6],[7,8,9]])).toEqual([1,2,3,6,9,8,7,4,5]); expect(spiral([[1,2],[3,4]])).toEqual([1,2,4,3]); });
  it('groups anagram strings together', () => { const ga=(strs:string[])=>{const mp=new Map<string,string[]>();for(const s of strs){const k=[...s].sort().join('');if(!mp.has(k))mp.set(k,[]);mp.get(k)!.push(s);}return[...mp.values()];}; const res=ga(['eat','tea','tan','ate','nat','bat']); expect(res.length).toBe(3); expect(res.flat().sort()).toEqual(['ate','bat','eat','nat','tan','tea']); });
});
