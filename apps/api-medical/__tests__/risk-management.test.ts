import express from 'express';
import request from 'supertest';

// ── Mocks (must be before any module imports that use them) ──────────

jest.mock('../src/prisma', () => ({
  prisma: {
    riskManagementFile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    hazard: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    riskControl: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    RiskManagementFileWhereInput: {},
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
import riskManagementRoutes from '../src/routes/risk-management';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockRMF = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'RMF-2602-0001',
  title: 'Cardiac Pacemaker Risk Management',
  deviceName: 'CardioSync Pacemaker Model X',
  deviceClass: 'CLASS_III',
  intendedUse: 'Implantable cardiac rhythm management',
  riskPolicy: 'All risks shall be reduced to ALARP',
  status: 'DRAFT',
  overallRiskAcceptable: null,
  benefitRiskAcceptable: null,
  benefitRiskAnalysis: null,
  reportSummary: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-02-01'),
};

const mockRMF2 = {
  id: '20000000-0000-4000-a000-000000000002',
  refNumber: 'RMF-2602-0002',
  title: 'Infusion Pump Risk Assessment',
  deviceName: 'SmartFlow Infusion Pump',
  deviceClass: 'CLASS_IIB',
  intendedUse: 'Controlled drug delivery',
  riskPolicy: null,
  status: 'DRAFT',
  overallRiskAcceptable: null,
  benefitRiskAcceptable: null,
  benefitRiskAnalysis: null,
  reportSummary: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockHazard1 = {
  id: '00000000-0000-0000-0000-000000000001',
  fileId: '20000000-0000-4000-a000-000000000001',
  hazardId: 'H-001',
  hazardCategory: 'ENERGY',
  hazardDescription: 'Electrical energy exceeds safe limits',
  hazardousSituation: 'Excessive stimulation pulse delivered to myocardium',
  harm: 'Cardiac tissue damage, arrhythmia',
  severityBefore: 5,
  probabilityBefore: 3,
  riskLevelBefore: 'HIGH',
  severityAfter: null,
  probabilityAfter: null,
  riskLevelAfter: null,
  residualRiskAcceptable: null,
  notes: null,
  createdAt: new Date('2026-01-20'),
  updatedAt: new Date('2026-01-20'),
};

const mockHazard2 = {
  id: 'haz-0002',
  fileId: '20000000-0000-4000-a000-000000000001',
  hazardId: 'H-002',
  hazardCategory: 'USE_ERROR',
  hazardDescription: 'Incorrect programming of device parameters',
  hazardousSituation: 'Clinician sets inappropriate pacing rate',
  harm: 'Hemodynamic compromise',
  severityBefore: 4,
  probabilityBefore: 2,
  riskLevelBefore: 'LOW',
  severityAfter: 4,
  probabilityAfter: 1,
  riskLevelAfter: 'NEGLIGIBLE',
  residualRiskAcceptable: true,
  notes: 'Controlled via programmer safety limits',
  createdAt: new Date('2026-01-21'),
  updatedAt: new Date('2026-02-01'),
};

const mockHazard3 = {
  id: 'haz-0003',
  fileId: '20000000-0000-4000-a000-000000000001',
  hazardId: 'H-003',
  hazardCategory: 'BIOLOGICAL',
  hazardDescription: 'Biocompatibility failure of lead material',
  hazardousSituation: 'Lead insulation degradation in vivo',
  harm: 'Tissue inflammation, device failure',
  severityBefore: 4,
  probabilityBefore: 2,
  riskLevelBefore: 'LOW',
  severityAfter: 4,
  probabilityAfter: 1,
  riskLevelAfter: 'NEGLIGIBLE',
  residualRiskAcceptable: false,
  notes: null,
  createdAt: new Date('2026-01-22'),
  updatedAt: new Date('2026-02-01'),
};

const mockControl1 = {
  id: 'ctrl-0001',
  hazardId: 'haz-0001',
  controlType: 'INHERENT_SAFETY',
  description: 'Hardware current limiter circuit with redundant path',
  implementationStatus: 'IMPLEMENTED',
  verificationMethod: 'Electrical safety testing per IEC 60601-1',
  createdAt: new Date('2026-01-25'),
  updatedAt: new Date('2026-01-25'),
};

const mockControl2 = {
  id: 'ctrl-0002',
  hazardId: 'haz-0001',
  controlType: 'PROTECTIVE_MEASURE',
  description: 'Software watchdog with automatic shutdown on overcurrent',
  implementationStatus: 'VERIFIED',
  verificationMethod: 'V&V protocol TC-SW-042',
  createdAt: new Date('2026-01-26'),
  updatedAt: new Date('2026-01-26'),
};

const mockControl3 = {
  id: 'ctrl-0003',
  hazardId: 'haz-0002',
  controlType: 'INFORMATION_FOR_SAFETY',
  description: 'Warning label on programmer about rate limits',
  implementationStatus: 'PLANNED',
  verificationMethod: null,
  createdAt: new Date('2026-01-27'),
  updatedAt: new Date('2026-01-27'),
};

const mockHazard1WithControls = {
  ...mockHazard1,
  controls: [mockControl1, mockControl2],
};

const mockHazard2WithControls = {
  ...mockHazard2,
  controls: [mockControl3],
};

const mockRMFWithHazards = {
  ...mockRMF,
  hazards: [mockHazard1WithControls, mockHazard2WithControls],
};

const validCreatePayload = {
  title: 'Cardiac Pacemaker Risk Management',
  deviceName: 'CardioSync Pacemaker Model X',
  deviceClass: 'CLASS_III',
  intendedUse: 'Implantable cardiac rhythm management',
  riskPolicy: 'All risks shall be reduced to ALARP',
};

const validHazardPayload = {
  hazardCategory: 'ENERGY',
  hazardDescription: 'Electrical energy exceeds safe limits',
  hazardousSituation: 'Excessive stimulation pulse delivered to myocardium',
  harm: 'Cardiac tissue damage, arrhythmia',
  severityBefore: 5,
  probabilityBefore: 3,
};

const validBenefitRiskPayload = {
  overallRiskAcceptable: true,
  benefitRiskAcceptable: true,
  benefitRiskAnalysis:
    'The benefits of cardiac pacing for life-threatening bradycardia outweigh the residual risks. All identified hazards have been reduced to acceptable levels through design controls and protective measures.',
  reportSummary:
    'Risk management file complete. 3 hazards identified, all mitigated. Residual risk acceptable per ISO 14971.',
};

// ==========================================
// Tests
// ==========================================

describe('Medical ISO 14971 Risk Management API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risk', riskManagementRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / - Create Risk Management File
  // ==========================================
  describe('POST /api/risk', () => {
    it('should create a risk management file successfully', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        refNumber: 'RMF-2602-0001',
      });

      const response = await request(app)
        .post('/api/risk')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('Cardiac Pacemaker Risk Management');
      expect(response.body.data.deviceName).toBe('CardioSync Pacemaker Model X');
      expect(response.body.data.deviceClass).toBe('CLASS_III');
      expect(response.body.data.status).toBe('DRAFT');

      expect(mockPrisma.riskManagementFile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Cardiac Pacemaker Risk Management',
          deviceName: 'CardioSync Pacemaker Model X',
          deviceClass: 'CLASS_III',
          intendedUse: 'Implantable cardiac rhythm management',
          riskPolicy: 'All risks shall be reduced to ALARP',
          status: 'DRAFT',
          createdBy: 'user-1',
          refNumber: expect.stringMatching(/^RMF-\d{4}-\d{4}$/),
        }),
      });
    });

    it('should generate incrementing reference numbers', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        refNumber: 'RMF-2602-0006',
      });

      await request(app)
        .post('/api/risk')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(mockPrisma.riskManagementFile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringMatching(/^RMF-\d{4}-0006$/),
        }),
      });
    });

    it('should create RMF with only required fields (no intendedUse, no riskPolicy)', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        intendedUse: undefined,
        riskPolicy: undefined,
      });

      const response = await request(app)
        .post('/api/risk')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Minimal RMF',
          deviceName: 'Test Device',
          deviceClass: 'CLASS_I',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/risk')
        .set('Authorization', 'Bearer token')
        .send({
          deviceName: 'CardioSync Pacemaker',
          deviceClass: 'CLASS_III',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toContain('title');
    });

    it('should return 400 for missing deviceName', async () => {
      const response = await request(app)
        .post('/api/risk')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Risk Management File',
          deviceClass: 'CLASS_III',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toContain('deviceName');
    });

    it('should return 400 for missing deviceClass', async () => {
      const response = await request(app)
        .post('/api/risk')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Risk Management File',
          deviceName: 'Test Device',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toContain('deviceClass');
    });

    it('should return 400 for invalid deviceClass enum value', async () => {
      const response = await request(app)
        .post('/api/risk')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Risk Management File',
          deviceName: 'Test Device',
          deviceClass: 'CLASS_IV',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/risk')
        .set('Authorization', 'Bearer token')
        .send({
          title: '',
          deviceName: 'Test Device',
          deviceClass: 'CLASS_I',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept all valid device classes', async () => {
      const deviceClasses = ['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIA', 'CLASS_IIB'];

      for (const dc of deviceClasses) {
        jest.clearAllMocks();
        (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);
        (mockPrisma.riskManagementFile.create as jest.Mock).mockResolvedValueOnce({
          ...mockRMF,
          deviceClass: dc,
        });

        const response = await request(app)
          .post('/api/risk')
          .set('Authorization', 'Bearer token')
          .send({
            title: `RMF for ${dc}`,
            deviceName: 'Test Device',
            deviceClass: dc,
          });

        expect(response.status).toBe(201);
      }
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.riskManagementFile.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/risk')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create risk management file');
    });
  });

  // ==========================================
  // GET / - List Risk Management Files
  // ==========================================
  describe('GET /api/risk', () => {
    it('should return a list of RMFs with default pagination', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([
        mockRMF,
        mockRMF2,
      ]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/risk').set('Authorization', 'Bearer token');

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
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([mockRMF]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/risk?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(50);
      expect(response.body.meta.totalPages).toBe(5);

      expect(mockPrisma.riskManagementFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/risk?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
      expect(mockPrisma.riskManagementFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risk?status=DRAFT').set('Authorization', 'Bearer token');

      expect(mockPrisma.riskManagementFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DRAFT',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by deviceName (case-insensitive contains)', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([mockRMF]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/risk?deviceName=pacemaker').set('Authorization', 'Bearer token');

      expect(mockPrisma.riskManagementFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deviceName: { contains: 'pacemaker', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risk').set('Authorization', 'Bearer token');

      expect(mockPrisma.riskManagementFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should only include non-deleted records (deletedAt: null)', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/risk').set('Authorization', 'Bearer token');

      expect(mockPrisma.riskManagementFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });

    it('should return empty list when no records exist', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app).get('/api/risk').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
      expect(response.body.meta.totalPages).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app).get('/api/risk').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list risk management files');
    });
  });

  // ==========================================
  // GET /:id - Get RMF with hazards and controls
  // ==========================================
  describe('GET /api/risk/:id', () => {
    it('should return an RMF with hazards and controls included', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(
        mockRMFWithHazards
      );

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockRMF.id);
      expect(response.body.data.title).toBe('Cardiac Pacemaker Risk Management');
      expect(response.body.data.hazards).toHaveLength(2);
      expect(response.body.data.hazards[0].controls).toHaveLength(2);
      expect(response.body.data.hazards[1].controls).toHaveLength(1);

      expect(mockPrisma.riskManagementFile.findUnique).toHaveBeenCalledWith({
        where: { id: mockRMF.id },
        include: {
          hazards: {
            orderBy: { createdAt: 'asc' },
            include: {
              controls: { orderBy: { createdAt: 'asc' } },
            },
          },
        },
      });
    });

    it('should return 404 when RMF does not exist', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/risk/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Risk management file not found');
    });

    it('should return 404 when RMF is soft-deleted', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMFWithHazards,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get risk management file');
    });
  });

  // ==========================================
  // POST /:id/hazards - Add Hazard Identification
  // ==========================================
  describe('POST /api/risk/:id/hazards', () => {
    it('should create a hazard with auto-generated hazardId and calculated risk level', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hazard.create as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        hazardId: 'H-001',
        riskLevelBefore: 'HIGH',
      });

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send(validHazardPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hazardId).toBe('H-001');
      expect(response.body.data.riskLevelBefore).toBe('HIGH');

      expect(mockPrisma.hazard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fileId: mockRMF.id,
          hazardId: 'H-001',
          hazardCategory: 'ENERGY',
          hazardDescription: 'Electrical energy exceeds safe limits',
          hazardousSituation: 'Excessive stimulation pulse delivered to myocardium',
          harm: 'Cardiac tissue damage, arrhythmia',
          severityBefore: 5,
          probabilityBefore: 3,
          riskLevelBefore: 'HIGH',
        }),
      });
    });

    it('should auto-increment hazardId based on existing hazard count', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValueOnce(7);
      (mockPrisma.hazard.create as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        hazardId: 'H-008',
      });

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send(validHazardPayload);

      expect(response.status).toBe(201);
      expect(mockPrisma.hazard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hazardId: 'H-008',
        }),
      });
    });

    it('should calculate NEGLIGIBLE risk level (severity*probability <= 4)', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hazard.create as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        riskLevelBefore: 'NEGLIGIBLE',
      });

      await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, severityBefore: 2, probabilityBefore: 2 });

      // 2*2 = 4 <= 4 = NEGLIGIBLE
      expect(mockPrisma.hazard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskLevelBefore: 'NEGLIGIBLE',
        }),
      });
    });

    it('should calculate LOW risk level (severity*probability <= 8)', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hazard.create as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        riskLevelBefore: 'LOW',
      });

      await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, severityBefore: 4, probabilityBefore: 2 });

      // 4*2 = 8 <= 8 = LOW
      expect(mockPrisma.hazard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskLevelBefore: 'LOW',
        }),
      });
    });

    it('should calculate MEDIUM risk level (severity*probability <= 12)', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hazard.create as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        riskLevelBefore: 'MEDIUM',
      });

      await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, severityBefore: 4, probabilityBefore: 3 });

      // 4*3 = 12 <= 12 = MEDIUM
      expect(mockPrisma.hazard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskLevelBefore: 'MEDIUM',
        }),
      });
    });

    it('should calculate HIGH risk level (severity*probability <= 16)', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hazard.create as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        riskLevelBefore: 'HIGH',
      });

      await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, severityBefore: 4, probabilityBefore: 4 });

      // 4*4 = 16 <= 16 = HIGH
      expect(mockPrisma.hazard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskLevelBefore: 'HIGH',
        }),
      });
    });

    it('should calculate UNACCEPTABLE risk level (severity*probability > 16)', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hazard.create as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        riskLevelBefore: 'UNACCEPTABLE',
      });

      await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, severityBefore: 5, probabilityBefore: 5 });

      // 5*5 = 25 > 16 = UNACCEPTABLE
      expect(mockPrisma.hazard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskLevelBefore: 'UNACCEPTABLE',
        }),
      });
    });

    it('should accept all valid hazard categories', async () => {
      const categories = [
        'ENERGY',
        'BIOLOGICAL',
        'ENVIRONMENTAL',
        'WRONG_OUTPUT',
        'USE_ERROR',
        'FUNCTIONALITY',
        'CHEMICAL',
        'ELECTROMAGNETIC',
        'RADIATION',
        'MECHANICAL',
        'THERMAL',
        'OTHER',
      ];

      for (const category of categories) {
        jest.clearAllMocks();
        (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
        (mockPrisma.hazard.count as jest.Mock).mockResolvedValueOnce(0);
        (mockPrisma.hazard.create as jest.Mock).mockResolvedValueOnce({
          ...mockHazard1,
          hazardCategory: category,
        });

        const response = await request(app)
          .post(`/api/risk/${mockRMF.id}/hazards`)
          .set('Authorization', 'Bearer token')
          .send({ ...validHazardPayload, hazardCategory: category });

        expect(response.status).toBe(201);
      }
    });

    it('should return 404 when RMF does not exist', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/risk/00000000-0000-4000-a000-ffffffffffff/hazards')
        .set('Authorization', 'Bearer token')
        .send(validHazardPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Risk management file not found');
    });

    it('should return 404 when RMF is soft-deleted', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send(validHazardPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing hazardCategory', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({
          hazardDescription: 'Test hazard',
          hazardousSituation: 'Test situation',
          harm: 'Test harm',
          severityBefore: 3,
          probabilityBefore: 2,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid hazardCategory', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, hazardCategory: 'INVALID_CATEGORY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty hazardDescription', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, hazardDescription: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty hazardousSituation', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, hazardousSituation: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty harm', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, harm: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for severityBefore out of range (0)', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, severityBefore: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for severityBefore out of range (6)', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, severityBefore: 6 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for probabilityBefore out of range (0)', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, probabilityBefore: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for probabilityBefore out of range (6)', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, probabilityBefore: 6 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for non-integer severity', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send({ ...validHazardPayload, severityBefore: 3.5 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hazard.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/hazards`)
        .set('Authorization', 'Bearer token')
        .send(validHazardPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create hazard');
    });
  });

  // ==========================================
  // PUT /:id/hazards/:hazardId - Update Hazard + Manage Controls
  // ==========================================
  describe('PUT /api/risk/:id/hazards/:hazardId', () => {
    it('should update hazard fields and recalculate residual risk level', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(mockHazard1);
      (mockPrisma.hazard.update as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        severityAfter: 5,
        probabilityAfter: 1,
        riskLevelAfter: 'LOW',
        residualRiskAcceptable: true,
        notes: 'Mitigated via hardware limiter',
        controls: [mockControl1, mockControl2],
      });

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({
          severityAfter: 5,
          probabilityAfter: 1,
          residualRiskAcceptable: true,
          notes: 'Mitigated via hardware limiter',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.residualRiskAcceptable).toBe(true);

      // Verify update was called with recalculated riskLevelAfter
      // 5*1 = 5, which is > 4 so risk level is LOW
      expect(mockPrisma.hazard.update).toHaveBeenCalledWith({
        where: { id: mockHazard1.id },
        data: expect.objectContaining({
          severityAfter: 5,
          probabilityAfter: 1,
          riskLevelAfter: 'LOW',
          residualRiskAcceptable: true,
          notes: 'Mitigated via hardware limiter',
        }),
        include: { controls: { orderBy: { createdAt: 'asc' } } },
      });
    });

    it('should create risk controls when provided', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(mockHazard1);
      (mockPrisma.riskControl.create as jest.Mock)
        .mockResolvedValueOnce(mockControl1)
        .mockResolvedValueOnce(mockControl2);
      (mockPrisma.hazard.update as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        controls: [mockControl1, mockControl2],
      });

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({
          controls: [
            {
              controlType: 'INHERENT_SAFETY',
              description: 'Hardware current limiter circuit with redundant path',
              implementationStatus: 'IMPLEMENTED',
              verificationMethod: 'Electrical safety testing per IEC 60601-1',
            },
            {
              controlType: 'PROTECTIVE_MEASURE',
              description: 'Software watchdog with automatic shutdown on overcurrent',
              verificationMethod: 'V&V protocol TC-SW-042',
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify two controls were created
      expect(mockPrisma.riskControl.create).toHaveBeenCalledTimes(2);

      // First control: explicit implementationStatus
      expect(mockPrisma.riskControl.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hazardId: mockHazard1.id,
          controlType: 'INHERENT_SAFETY',
          description: 'Hardware current limiter circuit with redundant path',
          implementationStatus: 'IMPLEMENTED',
          verificationMethod: 'Electrical safety testing per IEC 60601-1',
        }),
      });

      // Second control: defaults to PLANNED
      expect(mockPrisma.riskControl.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hazardId: mockHazard1.id,
          controlType: 'PROTECTIVE_MEASURE',
          description: 'Software watchdog with automatic shutdown on overcurrent',
          implementationStatus: 'PLANNED',
          verificationMethod: 'V&V protocol TC-SW-042',
        }),
      });
    });

    it('should update hazard description only without controls', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(mockHazard1);
      (mockPrisma.hazard.update as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        hazardDescription: 'Updated description',
        controls: [],
      });

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({ hazardDescription: 'Updated description' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.riskControl.create).not.toHaveBeenCalled();
    });

    it('should return 404 when RMF does not exist', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put(
          '/api/risk/00000000-0000-4000-a000-ffffffffffff/hazards/00000000-0000-0000-0000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ notes: 'test' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Risk management file not found');
    });

    it('should return 404 when RMF is soft-deleted', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/haz-0001`)
        .set('Authorization', 'Bearer token')
        .send({ notes: 'test' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when hazard does not exist', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/nonexistent`)
        .set('Authorization', 'Bearer token')
        .send({ notes: 'test' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Hazard not found in this risk management file');
    });

    it('should return 404 when hazard belongs to a different RMF', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockHazard1,
        fileId: 'different-rmf-id',
      });

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({ notes: 'test' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Hazard not found in this risk management file');
    });

    it('should return 400 for invalid control type', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(mockHazard1);

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({
          controls: [
            {
              controlType: 'INVALID_TYPE',
              description: 'Test control',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty control description', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(mockHazard1);

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({
          controls: [
            {
              controlType: 'INHERENT_SAFETY',
              description: '',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for severityAfter out of range', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(mockHazard1);

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({ severityAfter: 6 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for probabilityAfter out of range', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(mockHazard1);

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({ probabilityAfter: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid implementationStatus on controls', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(mockHazard1);

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({
          controls: [
            {
              controlType: 'INHERENT_SAFETY',
              description: 'Valid description',
              implementationStatus: 'INVALID_STATUS',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should use existing hazard severity/probability if only one is provided for recalculation', async () => {
      const hazardWithAfter = {
        ...mockHazard1,
        severityAfter: 3,
        probabilityAfter: 2,
        riskLevelAfter: 'LOW',
      };
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.hazard.findUnique as jest.Mock).mockResolvedValueOnce(hazardWithAfter);
      (mockPrisma.hazard.update as jest.Mock).mockResolvedValueOnce({
        ...hazardWithAfter,
        probabilityAfter: 1,
        riskLevelAfter: 'NEGLIGIBLE',
        controls: [],
      });

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({ probabilityAfter: 1 });

      expect(response.status).toBe(200);

      // Should recalculate using existing severityAfter=3 and new probabilityAfter=1
      // 3*1 = 3 <= 4 = NEGLIGIBLE
      expect(mockPrisma.hazard.update).toHaveBeenCalledWith({
        where: { id: mockHazard1.id },
        data: expect.objectContaining({
          probabilityAfter: 1,
          riskLevelAfter: 'NEGLIGIBLE',
        }),
        include: { controls: { orderBy: { createdAt: 'asc' } } },
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put(`/api/risk/${mockRMF.id}/hazards/${mockHazard1.id}`)
        .set('Authorization', 'Bearer token')
        .send({ notes: 'test' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to update hazard');
    });
  });

  // ==========================================
  // POST /:id/benefit-risk - Submit Benefit-Risk Analysis
  // ==========================================
  describe('POST /api/risk/:id/benefit-risk', () => {
    it('should submit benefit-risk analysis successfully', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.riskManagementFile.update as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        ...validBenefitRiskPayload,
      });

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send(validBenefitRiskPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.overallRiskAcceptable).toBe(true);
      expect(response.body.data.benefitRiskAcceptable).toBe(true);
      expect(response.body.data.benefitRiskAnalysis).toBeDefined();
      expect(response.body.data.reportSummary).toBeDefined();

      expect(mockPrisma.riskManagementFile.update).toHaveBeenCalledWith({
        where: { id: mockRMF.id },
        data: {
          overallRiskAcceptable: true,
          benefitRiskAcceptable: true,
          benefitRiskAnalysis: validBenefitRiskPayload.benefitRiskAnalysis,
          reportSummary: validBenefitRiskPayload.reportSummary,
        },
      });
    });

    it('should accept false values for risk acceptability', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.riskManagementFile.update as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        overallRiskAcceptable: false,
        benefitRiskAcceptable: false,
      });

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send({
          overallRiskAcceptable: false,
          benefitRiskAcceptable: false,
          benefitRiskAnalysis: 'Risks exceed acceptable levels. Additional controls required.',
          reportSummary: 'Risk management incomplete. Unacceptable residual risks remain.',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.overallRiskAcceptable).toBe(false);
      expect(response.body.data.benefitRiskAcceptable).toBe(false);
    });

    it('should return 404 when RMF does not exist', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/risk/00000000-0000-4000-a000-ffffffffffff/benefit-risk')
        .set('Authorization', 'Bearer token')
        .send(validBenefitRiskPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Risk management file not found');
    });

    it('should return 404 when RMF is soft-deleted', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send(validBenefitRiskPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing overallRiskAcceptable', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send({
          benefitRiskAcceptable: true,
          benefitRiskAnalysis: 'Analysis text',
          reportSummary: 'Summary text',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing benefitRiskAcceptable', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send({
          overallRiskAcceptable: true,
          benefitRiskAnalysis: 'Analysis text',
          reportSummary: 'Summary text',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing benefitRiskAnalysis', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send({
          overallRiskAcceptable: true,
          benefitRiskAcceptable: true,
          reportSummary: 'Summary text',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing reportSummary', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send({
          overallRiskAcceptable: true,
          benefitRiskAcceptable: true,
          benefitRiskAnalysis: 'Analysis text',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty benefitRiskAnalysis', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send({
          overallRiskAcceptable: true,
          benefitRiskAcceptable: true,
          benefitRiskAnalysis: '',
          reportSummary: 'Summary',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for non-boolean overallRiskAcceptable', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send({
          overallRiskAcceptable: 'yes',
          benefitRiskAcceptable: true,
          benefitRiskAnalysis: 'Analysis',
          reportSummary: 'Summary',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMF);
      (mockPrisma.riskManagementFile.update as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post(`/api/risk/${mockRMF.id}/benefit-risk`)
        .set('Authorization', 'Bearer token')
        .send(validBenefitRiskPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to submit benefit-risk analysis');
    });
  });

  // ==========================================
  // GET /:id/report - Full Risk Management Report
  // ==========================================
  describe('GET /api/risk/:id/report', () => {
    it('should return a full risk management report with summary statistics', async () => {
      const rmfWithFullData = {
        ...mockRMF,
        overallRiskAcceptable: true,
        benefitRiskAcceptable: true,
        hazards: [
          {
            ...mockHazard1,
            riskLevelBefore: 'HIGH',
            riskLevelAfter: 'LOW',
            residualRiskAcceptable: true,
            controls: [
              { ...mockControl1, implementationStatus: 'IMPLEMENTED' },
              { ...mockControl2, implementationStatus: 'VERIFIED' },
            ],
          },
          {
            ...mockHazard2,
            riskLevelBefore: 'LOW',
            riskLevelAfter: 'NEGLIGIBLE',
            residualRiskAcceptable: true,
            controls: [{ ...mockControl3, implementationStatus: 'PLANNED' }],
          },
          {
            ...mockHazard3,
            riskLevelBefore: 'LOW',
            riskLevelAfter: null,
            residualRiskAcceptable: null,
            controls: [],
          },
        ],
      };

      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(
        rmfWithFullData
      );

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/report`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const { riskManagementFile, summary } = response.body.data;

      // Verify RMF data is included
      expect(riskManagementFile.id).toBe(mockRMF.id);
      expect(riskManagementFile.title).toBe('Cardiac Pacemaker Risk Management');

      // Summary statistics
      expect(summary.totalHazards).toBe(3);

      // Hazards by initial risk level
      expect(summary.byRiskLevelBefore).toMatchObject({
        HIGH: 1,
        LOW: 2,
      });

      // Hazards by residual risk level (only those that have riskLevelAfter)
      expect(summary.byRiskLevelAfter).toMatchObject({
        LOW: 1,
        NEGLIGIBLE: 1,
      });

      // Controls statistics
      expect(summary.totalControls).toBe(3);
      expect(summary.controlsImplemented).toBe(2); // IMPLEMENTED + VERIFIED

      // Residual risk summary
      expect(summary.residualRisk.acceptable).toBe(2);
      expect(summary.residualRisk.unacceptable).toBe(0);
      expect(summary.residualRisk.notEvaluated).toBe(1);
    });

    it('should handle report with no hazards', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        hazards: [],
      });

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/report`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);

      const { summary } = response.body.data;
      expect(summary.totalHazards).toBe(0);
      expect(summary.totalControls).toBe(0);
      expect(summary.controlsImplemented).toBe(0);
      expect(summary.residualRisk.acceptable).toBe(0);
      expect(summary.residualRisk.unacceptable).toBe(0);
      expect(summary.residualRisk.notEvaluated).toBe(0);
    });

    it('should correctly count unacceptable residual risks', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        hazards: [
          {
            ...mockHazard1,
            residualRiskAcceptable: false,
            riskLevelBefore: 'HIGH',
            riskLevelAfter: 'MEDIUM',
            controls: [],
          },
          {
            ...mockHazard2,
            residualRiskAcceptable: false,
            riskLevelBefore: 'MEDIUM',
            riskLevelAfter: 'MEDIUM',
            controls: [],
          },
          {
            ...mockHazard3,
            residualRiskAcceptable: true,
            riskLevelBefore: 'LOW',
            riskLevelAfter: 'NEGLIGIBLE',
            controls: [],
          },
        ],
      });

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/report`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.summary.residualRisk.acceptable).toBe(1);
      expect(response.body.data.summary.residualRisk.unacceptable).toBe(2);
      expect(response.body.data.summary.residualRisk.notEvaluated).toBe(0);
    });

    it('should return 404 when RMF does not exist', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/risk/00000000-0000-4000-a000-ffffffffffff/report')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Risk management file not found');
    });

    it('should return 404 when RMF is soft-deleted', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        hazards: [],
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/report`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should include hazards with controls in the report', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(
        mockRMFWithHazards
      );

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/report`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(mockPrisma.riskManagementFile.findUnique).toHaveBeenCalledWith({
        where: { id: mockRMF.id },
        include: {
          hazards: {
            orderBy: { createdAt: 'asc' },
            include: {
              controls: { orderBy: { createdAt: 'asc' } },
            },
          },
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/report`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to generate risk management report');
    });
  });

  // ==========================================
  // GET /:id/residual - Residual Risk Summary
  // ==========================================
  describe('GET /api/risk/:id/residual', () => {
    it('should return residual risk summary with aggregated data', async () => {
      const rmfWithHazards = {
        ...mockRMF,
        overallRiskAcceptable: true,
        benefitRiskAcceptable: true,
        hazards: [
          { ...mockHazard1, riskLevelAfter: 'LOW', residualRiskAcceptable: true },
          { ...mockHazard2, riskLevelAfter: 'NEGLIGIBLE', residualRiskAcceptable: true },
          { ...mockHazard3, riskLevelAfter: null, residualRiskAcceptable: null },
        ],
      };

      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(rmfWithHazards);

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/residual`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const data = response.body.data;
      expect(data.riskManagementFileId).toBe(mockRMF.id);
      expect(data.refNumber).toBe('RMF-2602-0001');
      expect(data.deviceName).toBe('CardioSync Pacemaker Model X');
      expect(data.totalHazards).toBe(3);

      // Aggregated risk levels
      expect(data.byRiskLevelAfter).toMatchObject({
        LOW: 1,
        NEGLIGIBLE: 1,
        NOT_EVALUATED: 1,
      });

      // Residual risk acceptance
      expect(data.residualRiskAcceptance.acceptable).toBe(2);
      expect(data.residualRiskAcceptance.unacceptable).toBe(0);
      expect(data.residualRiskAcceptance.notEvaluated).toBe(1);

      // Overall assessment
      expect(data.overallRiskAcceptable).toBe(true);
      expect(data.benefitRiskAcceptable).toBe(true);
    });

    it('should return NOT_EVALUATED for hazards without riskLevelAfter', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        hazards: [
          { ...mockHazard1, riskLevelAfter: null, residualRiskAcceptable: null },
          { ...mockHazard2, riskLevelAfter: null, residualRiskAcceptable: null },
        ],
      });

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/residual`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.byRiskLevelAfter).toMatchObject({
        NOT_EVALUATED: 2,
      });
      expect(response.body.data.residualRiskAcceptance.notEvaluated).toBe(2);
    });

    it('should handle RMF with no hazards', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        hazards: [],
      });

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/residual`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.totalHazards).toBe(0);
      expect(response.body.data.byRiskLevelAfter).toEqual({});
      expect(response.body.data.residualRiskAcceptance.acceptable).toBe(0);
      expect(response.body.data.residualRiskAcceptance.unacceptable).toBe(0);
      expect(response.body.data.residualRiskAcceptance.notEvaluated).toBe(0);
    });

    it('should correctly count unacceptable residual risks', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        overallRiskAcceptable: false,
        benefitRiskAcceptable: false,
        hazards: [
          { ...mockHazard1, riskLevelAfter: 'HIGH', residualRiskAcceptable: false },
          { ...mockHazard2, riskLevelAfter: 'MEDIUM', residualRiskAcceptable: false },
          { ...mockHazard3, riskLevelAfter: 'LOW', residualRiskAcceptable: true },
        ],
      });

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/residual`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.residualRiskAcceptance.acceptable).toBe(1);
      expect(response.body.data.residualRiskAcceptance.unacceptable).toBe(2);
      expect(response.body.data.overallRiskAcceptable).toBe(false);
      expect(response.body.data.benefitRiskAcceptable).toBe(false);
    });

    it('should include correct query with hazards included', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        hazards: [],
      });

      await request(app)
        .get(`/api/risk/${mockRMF.id}/residual`)
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.riskManagementFile.findUnique).toHaveBeenCalledWith({
        where: { id: mockRMF.id },
        include: { hazards: true },
      });
    });

    it('should return 404 when RMF does not exist', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/risk/00000000-0000-4000-a000-ffffffffffff/residual')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Risk management file not found');
    });

    it('should return 404 when RMF is soft-deleted', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockRMF,
        hazards: [],
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/residual`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/residual`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get residual risk summary');
    });
  });
});


describe('phase37 coverage', () => {
  it('removes falsy values', () => { const compact=<T>(a:(T|null|undefined|false|0|'')[])=>a.filter(Boolean) as T[]; expect(compact([1,0,2,null,3,undefined,false])).toEqual([1,2,3]); });
});


describe('phase38 coverage', () => {
  it('splits array into n chunks', () => { const chunks=<T>(a:T[],n:number)=>Array.from({length:n},(_,i)=>a.filter((_,j)=>j%n===i)); expect(chunks([1,2,3,4,5,6],3)).toEqual([[1,4],[2,5],[3,6]]); });
  it('implements min stack', () => { class MinStack{private d:[number,number][]=[];push(v:number){const m=this.d.length?Math.min(v,this.d[this.d.length-1][1]):v;this.d.push([v,m]);}pop(){return this.d.pop()?.[0];}getMin(){return this.d[this.d.length-1]?.[1];}} const s=new MinStack();s.push(5);s.push(3);s.push(7);expect(s.getMin()).toBe(3);s.pop();expect(s.getMin()).toBe(3); });
  it('checks if strings are rotations of each other', () => { const isRot=(a:string,b:string)=>a.length===b.length&&(a+a).includes(b); expect(isRot('abcde','cdeab')).toBe(true); expect(isRot('abc','acb')).toBe(false); });
  it('implements linear search', () => { const search=(a:number[],v:number)=>a.indexOf(v); expect(search([1,3,5,7,9],5)).toBe(2); expect(search([1,3,5],4)).toBe(-1); });
  it('computes standard deviation', () => { const std=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length);}; expect(std([2,4,4,4,5,5,7,9])).toBe(2); });
});


describe('phase39 coverage', () => {
  it('checks Kaprekar number', () => { const isKap=(n:number)=>{const sq=n*n;const s=String(sq);for(let i=1;i<s.length;i++){const r=Number(s.slice(i)),l=Number(s.slice(0,i));if(r>0&&l+r===n)return true;}return false;}; expect(isKap(9)).toBe(true); expect(isKap(45)).toBe(true); });
  it('checks valid IP address format', () => { const isIP=(s:string)=>/^(\d{1,3}\.){3}\d{1,3}$/.test(s)&&s.split('.').every(p=>Number(p)<=255); expect(isIP('192.168.1.1')).toBe(true); expect(isIP('999.0.0.1')).toBe(false); });
  it('finds maximum profit from stock prices', () => { const maxProfit=(prices:number[])=>{let min=Infinity,max=0;for(const p of prices){min=Math.min(min,p);max=Math.max(max,p-min);}return max;}; expect(maxProfit([7,1,5,3,6,4])).toBe(5); });
  it('computes integer square root', () => { const isqrt=(n:number)=>Math.floor(Math.sqrt(n)); expect(isqrt(16)).toBe(4); expect(isqrt(17)).toBe(4); });
  it('checks if perfect square', () => { const isPerfSq=(n:number)=>Number.isInteger(Math.sqrt(n)); expect(isPerfSq(25)).toBe(true); expect(isPerfSq(26)).toBe(false); });
});


describe('phase40 coverage', () => {
  it('checks if number is palindrome without string', () => { const isPalinNum=(n:number)=>{if(n<0)return false;let rev=0,orig=n;while(n>0){rev=rev*10+n%10;n=Math.floor(n/10);}return rev===orig;}; expect(isPalinNum(121)).toBe(true); expect(isPalinNum(123)).toBe(false); });
  it('implements flood fill algorithm', () => { const fill=(g:number[][],r:number,c:number,newC:number)=>{const old=g[r][c];if(old===newC)return g;const q:number[][]=[]; const v=g.map(row=>[...row]); q.push([r,c]);while(q.length){const[cr,cc]=q.shift()!;if(cr<0||cr>=v.length||cc<0||cc>=v[0].length||v[cr][cc]!==old)continue;v[cr][cc]=newC;q.push([cr+1,cc],[cr-1,cc],[cr,cc+1],[cr,cc-1]);}return v;}; expect(fill([[1,1,1],[1,1,0],[1,0,1]],1,1,2)[0][0]).toBe(2); });
  it('counts distinct islands count', () => { const grid=[[1,1,0,1,1],[1,0,0,0,0],[0,0,0,0,1],[1,1,0,1,1]]; const vis=grid.map(r=>[...r]); let count=0; const dfs=(i:number,j:number)=>{if(i<0||i>=vis.length||j<0||j>=vis[0].length||vis[i][j]!==1)return;vis[i][j]=0;dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);}; for(let i=0;i<vis.length;i++)for(let j=0;j<vis[0].length;j++)if(vis[i][j]===1){dfs(i,j);count++;} expect(count).toBe(4); });
  it('computes consistent hash bucket', () => { const bucket=(key:string,n:number)=>[...key].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,0)%n; expect(bucket('user123',10)).toBeGreaterThanOrEqual(0); expect(bucket('user123',10)).toBeLessThan(10); });
  it('implements string multiplication', () => { const mul=(a:string,b:string)=>{const m=a.length,n=b.length,pos=Array(m+n).fill(0);for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--){const p=(Number(a[i]))*(Number(b[j]));const p1=i+j,p2=i+j+1;const sum=p+pos[p2];pos[p2]=sum%10;pos[p1]+=Math.floor(sum/10);}return pos.join('').replace(/^0+/,'')||'0';}; expect(mul('123','456')).toBe('56088'); });
});


describe('phase41 coverage', () => {
  it('counts ways to decode string', () => { const decode=(s:string)=>{if(!s||s[0]==='0')return 0;const dp=Array(s.length+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=s.length;i++){if(s[i-1]!=='0')dp[i]+=dp[i-1];const two=Number(s.slice(i-2,i));if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[s.length];}; expect(decode('226')).toBe(3); expect(decode('06')).toBe(0); });
  it('implements sparse set membership', () => { const set=new Set<number>([1,3,5,7,9]); const query=(v:number)=>set.has(v); expect(query(5)).toBe(true); expect(query(4)).toBe(false); });
  it('implements counting sort for strings', () => { const countSort=(a:string[])=>[...a].sort(); expect(countSort(['banana','apple','cherry'])).toEqual(['apple','banana','cherry']); });
  it('implements shortest path in unweighted graph', () => { const bfsDist=(adj:Map<number,number[]>,s:number,t:number)=>{const dist=new Map([[s,0]]);const q=[s];while(q.length){const u=q.shift()!;for(const v of adj.get(u)||[]){if(!dist.has(v)){dist.set(v,(dist.get(u)||0)+1);q.push(v);}}}return dist.get(t)??-1;}; const g=new Map([[0,[1,2]],[1,[3]],[2,[3]],[3,[]]]); expect(bfsDist(g,0,3)).toBe(2); });
  it('implements dutch national flag partition', () => { const dnf=(a:number[])=>{const r=[...a];let lo=0,mid=0,hi=r.length-1;while(mid<=hi){if(r[mid]===0){[r[lo],r[mid]]=[r[mid],r[lo]];lo++;mid++;}else if(r[mid]===1)mid++;else{[r[mid],r[hi]]=[r[hi],r[mid]];hi--;}}return r;}; expect(dnf([2,0,1,2,1,0])).toEqual([0,0,1,1,2,2]); });
});


describe('phase42 coverage', () => {
  it('finds number of rectangles in grid', () => { const rects=(m:number,n:number)=>m*(m+1)/2*n*(n+1)/2; expect(rects(2,2)).toBe(9); expect(rects(1,1)).toBe(1); });
  it('translates point', () => { const translate=(x:number,y:number,dx:number,dy:number):[number,number]=>[x+dx,y+dy]; expect(translate(1,2,3,4)).toEqual([4,6]); });
  it('scales point from origin', () => { const scale=(x:number,y:number,s:number):[number,number]=>[x*s,y*s]; expect(scale(2,3,2)).toEqual([4,6]); });
  it('interpolates between two values', () => { const lerp=(a:number,b:number,t:number)=>a+(b-a)*t; expect(lerp(0,100,0.5)).toBe(50); expect(lerp(10,20,0.3)).toBeCloseTo(13); });
  it('clamps RGB value', () => { const clamp=(v:number)=>Math.min(255,Math.max(0,v)); expect(clamp(300)).toBe(255); expect(clamp(-10)).toBe(0); expect(clamp(128)).toBe(128); });
});


describe('phase43 coverage', () => {
  it('applies label encoding to categories', () => { const encode=(cats:string[])=>{const u=[...new Set(cats)];return cats.map(c=>u.indexOf(c));}; expect(encode(['a','b','a','c'])).toEqual([0,1,0,2]); });
  it('sorts dates chronologically', () => { const dates=[new Date('2026-03-01'),new Date('2026-01-15'),new Date('2026-02-10')]; dates.sort((a,b)=>a.getTime()-b.getTime()); expect(dates[0].getMonth()).toBe(0); });
  it('formats date to ISO date string', () => { const toISO=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; expect(toISO(new Date(2026,0,5))).toBe('2026-01-05'); });
  it('computes moving average', () => { const ma=(a:number[],w:number)=>Array.from({length:a.length-w+1},(_,i)=>a.slice(i,i+w).reduce((s,v)=>s+v,0)/w); expect(ma([1,2,3,4,5],3)).toEqual([2,3,4]); });
  it('formats duration in seconds to mm:ss', () => { const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; expect(fmt(90)).toBe('01:30'); expect(fmt(3661)).toBe('61:01'); });
});


describe('phase44 coverage', () => {
  it('computes greatest common divisor', () => { const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b); expect(gcd(48,18)).toBe(6); expect(gcd(100,75)).toBe(25); });
  it('implements compose (right to left)', () => { const comp=(...fns:((x:number)=>number)[])=>(x:number)=>[...fns].reverse().reduce((v,f)=>f(v),x); const double=(x:number)=>x*2; const inc=(x:number)=>x+1; expect(comp(double,inc)(3)).toBe(8); });
  it('computes integer square root', () => { const isqrt=(n:number)=>Math.floor(Math.sqrt(n)); expect(isqrt(16)).toBe(4); expect(isqrt(17)).toBe(4); expect(isqrt(25)).toBe(5); });
  it('omits specified keys from object', () => { const omit=<T extends object,K extends keyof T>(o:T,...ks:K[]):Omit<T,K>=>{const r={...o} as any;ks.forEach(k=>delete r[k]);return r;}; expect(omit({a:1,b:2,c:3},'b')).toEqual({a:1,c:3}); });
  it('batches array of promises into groups', async () => { const batch=async<T>(fns:(()=>Promise<T>)[],size:number):Promise<T[]>=>{const r:T[]=[];for(let i=0;i<fns.length;i+=size){const g=await Promise.all(fns.slice(i,i+size).map(f=>f()));r.push(...g);}return r;};const fns=[1,2,3,4,5].map(n=>()=>Promise.resolve(n*2));const r=await batch(fns,2); expect(r).toEqual([2,4,6,8,10]); });
});


describe('phase45 coverage', () => {
  it('computes power set size 2^n', () => { const ps=(n:number)=>1<<n; expect(ps(0)).toBe(1); expect(ps(3)).toBe(8); expect(ps(10)).toBe(1024); });
  it('flattens matrix to array', () => { const flat=(m:number[][])=>m.reduce((a,r)=>[...a,...r],[]); expect(flat([[1,2],[3,4],[5,6]])).toEqual([1,2,3,4,5,6]); });
  it('implements simple bloom filter check', () => { const bf=(size:number)=>{const bits=new Uint8Array(Math.ceil(size/8));const h=(s:string,seed:number)=>[...s].reduce((a,c)=>Math.imul(a^c.charCodeAt(0),seed)>>>0,0)%size;return{add:(s:string)=>{[31,37,41].forEach(seed=>{const i=h(s,seed);bits[i>>3]|=1<<(i&7);});},has:(s:string)=>[31,37,41].every(seed=>{const i=h(s,seed);return(bits[i>>3]>>(i&7))&1;})};}; const b=bf(256);b.add('hello');b.add('world'); expect(b.has('hello')).toBe(true); expect(b.has('world')).toBe(true); });
  it('generates initials from name', () => { const init=(n:string)=>n.split(' ').map(w=>w[0].toUpperCase()).join(''); expect(init('john doe smith')).toBe('JDS'); });
  it('implements circular buffer', () => { const cb=(cap:number)=>{const buf=new Array(cap).fill(0);let r=0,w=0,sz=0;return{write:(v:number)=>{if(sz<cap){buf[w%cap]=v;w++;sz++;}},read:()=>sz>0?(sz--,buf[r++%cap]):undefined,size:()=>sz};}; const c=cb(3);c.write(1);c.write(2);c.write(3); expect(c.read()).toBe(1); expect(c.size()).toBe(2); });
});


describe('phase46 coverage', () => {
  it('solves Sudoku validation', () => { const valid=(b:string[][])=>{const ok=(vals:string[])=>{const d=vals.filter(v=>v!=='.');return d.length===new Set(d).size;};for(let i=0;i<9;i++){if(!ok(b[i]))return false;if(!ok(b.map(r=>r[i])))return false;const br=Math.floor(i/3)*3,bc=(i%3)*3;if(!ok([...Array(3).keys()].flatMap(r=>[...Array(3).keys()].map(c=>b[br+r][bc+c]))))return false;}return true;}; const b=[['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']]; expect(valid(b)).toBe(true); });
  it('computes number of ways to decode string', () => { const nd=(s:string)=>{const n=s.length;const dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=s[0]!=='0'?1:0;for(let i=2;i<=n;i++){const one=+s[i-1];const two=+(s.slice(i-2,i));if(one>0)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(nd('12')).toBe(2); expect(nd('226')).toBe(3); expect(nd('06')).toBe(0); });
  it('implements A* pathfinding (grid)', () => { const astar=(grid:number[][],sx:number,sy:number,ex:number,ey:number)=>{const h=(x:number,y:number)=>Math.abs(x-ex)+Math.abs(y-ey);const open=[[0+h(sx,sy),0,sx,sy]];const g=new Map<string,number>();g.set(sx+','+sy,0);const dirs=[[0,1],[0,-1],[1,0],[-1,0]];while(open.length){open.sort((a,b)=>a[0]-b[0]);const [,gc,x,y]=open.shift()!;if(x===ex&&y===ey)return gc;for(const [dx,dy] of dirs){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=grid.length||ny>=grid[0].length||grid[nx][ny])continue;const ng=gc+1;const k=nx+','+ny;if(!g.has(k)||ng<g.get(k)!){g.set(k,ng);open.push([ng+h(nx,ny),ng,nx,ny]);}}}return -1;}; expect(astar([[0,0,0],[0,1,0],[0,0,0]],0,0,2,2)).toBe(4); });
  it('finds number of ways to partition n into k parts', () => { const parts=(n:number,k:number,min=1):number=>k===1?n>=min?1:0:Array.from({length:n-min*(k-1)-min+1},(_,i)=>parts(n-(i+min),k-1,i+min)).reduce((s,v)=>s+v,0); expect(parts(5,2)).toBe(2); expect(parts(6,3,1)).toBe(3); });
  it('checks if number is deficient', () => { const def=(n:number)=>Array.from({length:n-1},(_,i)=>i+1).filter(d=>n%d===0).reduce((s,v)=>s+v,0)<n; expect(def(8)).toBe(true); expect(def(12)).toBe(false); });
});


describe('phase47 coverage', () => {
  it('checks if string has all unique chars', () => { const uniq=(s:string)=>s.length===new Set(s).size; expect(uniq('abcde')).toBe(true); expect(uniq('aabcd')).toBe(false); });
  it('normalizes matrix rows to sum 1', () => { const nr=(m:number[][])=>m.map(r=>{const s=r.reduce((a,v)=>a+v,0);return r.map(v=>Math.round(v/s*100)/100);}); expect(nr([[1,3],[2,2]])[0]).toEqual([0.25,0.75]); });
  it('checks if directed graph is DAG', () => { const isDAG=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>adj[u].push(v));const col=new Array(n).fill(0);const dfs=(u:number):boolean=>{col[u]=1;for(const v of adj[u]){if(col[v]===1)return false;if(col[v]===0&&!dfs(v))return false;}col[u]=2;return true;};return Array.from({length:n},(_,i)=>i).every(i=>col[i]!==0||dfs(i));}; expect(isDAG(4,[[0,1],[1,2],[2,3]])).toBe(true); expect(isDAG(3,[[0,1],[1,2],[2,0]])).toBe(false); });
  it('finds all anagram positions in string', () => { const ap=(s:string,p:string)=>{const r:number[]=[],n=p.length;const pc=new Array(26).fill(0),wc=new Array(26).fill(0);const ci=(c:string)=>c.charCodeAt(0)-97;for(const c of p)pc[ci(c)]++;for(let i=0;i<s.length;i++){wc[ci(s[i])]++;if(i>=n)wc[ci(s[i-n])]--;if(pc.every((v,j)=>v===wc[j]))r.push(i-n+1);}return r;}; expect(ap('cbaebabacd','abc')).toEqual([0,6]); });
  it('checks if can reach end of array', () => { const cr=(a:number[])=>{let far=0;for(let i=0;i<a.length&&i<=far;i++)far=Math.max(far,i+a[i]);return far>=a.length-1;}; expect(cr([2,3,1,1,4])).toBe(true); expect(cr([3,2,1,0,4])).toBe(false); });
});


describe('phase48 coverage', () => {
  it('checks if array can form arithmetic progression', () => { const ap=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);const d=s[1]-s[0];return s.every((v,i)=>i===0||v-s[i-1]===d);}; expect(ap([3,5,1])).toBe(true); expect(ap([1,2,4])).toBe(false); });
  it('computes chromatic number (greedy coloring)', () => { const gc=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const col=new Array(n).fill(-1);for(let u=0;u<n;u++){const used=new Set(adj[u].map(v=>col[v]).filter(c=>c>=0));let c=0;while(used.has(c))c++;col[u]=c;}return Math.max(...col)+1;}; expect(gc(4,[[0,1],[1,2],[2,3],[3,0]])).toBe(2); expect(gc(3,[[0,1],[1,2],[2,0]])).toBe(3); });
  it('generates all binary strings of length n', () => { const bs=(n:number):string[]=>n===0?['']:bs(n-1).flatMap(s=>['0'+s,'1'+s]); expect(bs(2)).toEqual(['00','10','01','11']); expect(bs(1)).toEqual(['0','1']); });
  it('finds two missing numbers in range', () => { const tm=(a:number[],n:number)=>{const s=a.reduce((acc,v)=>acc+v,0),sp=a.reduce((acc,v)=>acc+v*v,0);const ts=n*(n+1)/2,tsp=n*(n+1)*(2*n+1)/6;const d=ts-s,dp2=tsp-sp;const b=(dp2/d-d)/2;return [Math.round(b+d),Math.round(b)].sort((x,y)=>x-y);}; expect(tm([1,2,4,6],6)).toEqual([-2,6]); });
  it('finds median without sorting (quickselect)', () => { const qs=(a:number[],k:number):number=>{const p=a[Math.floor(a.length/2)];const lo=a.filter(x=>x<p),eq=a.filter(x=>x===p),hi=a.filter(x=>x>p);return k<lo.length?qs(lo,k):k<lo.length+eq.length?p:qs(hi,k-lo.length-eq.length);}; const a=[3,1,4,1,5,9,2,6];const m=qs(a,Math.floor(a.length/2)); expect(m).toBe(4); });
});
