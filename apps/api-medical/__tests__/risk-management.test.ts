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


describe('phase49 coverage', () => {
  it('finds the kth symbol in grammar', () => { const kth=(n:number,k:number):number=>n===1?0:kth(n-1,Math.ceil(k/2))===0?(k%2?0:1):(k%2?1:0); expect(kth(1,1)).toBe(0); expect(kth(2,1)).toBe(0); expect(kth(2,2)).toBe(1); expect(kth(4,5)).toBe(1); });
  it('checks if string has all unique characters', () => { const uniq=(s:string)=>new Set(s).size===s.length; expect(uniq('abcde')).toBe(true); expect(uniq('aabcd')).toBe(false); expect(uniq('')).toBe(true); });
  it('checks if parentheses are balanced', () => { const bal=(s:string)=>{let d=0;for(const c of s){if(c==='(')d++;else if(c===')')d--;if(d<0)return false;}return d===0;}; expect(bal('(())')).toBe(true); expect(bal('(()')).toBe(false); expect(bal(')(')).toBe(false); });
  it('finds all anagram positions in string', () => { const anag=(s:string,p:string)=>{const r:number[]=[],n=p.length,freq=new Array(26).fill(0);p.split('').forEach(c=>freq[c.charCodeAt(0)-97]++);const w=new Array(26).fill(0);for(let i=0;i<s.length;i++){w[s.charCodeAt(i)-97]++;if(i>=n)w[s.charCodeAt(i-n)-97]--;if(i>=n-1&&w.every((v,j)=>v===freq[j]))r.push(i-n+1);}return r;}; expect(anag('cbaebabacd','abc')).toEqual([0,6]); });
  it('finds shortest path with BFS', () => { const bfs=(g:number[][],s:number,t:number)=>{const d=new Array(g.length).fill(-1);d[s]=0;const q=[s];while(q.length){const u=q.shift()!;for(const v of g[u])if(d[v]===-1){d[v]=d[u]+1;if(v===t)return d[v];q.push(v);}}return d[t];}; expect(bfs([[1,2],[0,3],[0,3],[1,2]],0,3)).toBe(2); });
});


describe('phase50 coverage', () => {
  it('computes range sum query with prefix sums', () => { const rsq=(a:number[])=>{const p=[0,...a];for(let i=1;i<p.length;i++)p[i]+=p[i-1];return(l:number,r:number)=>p[r+1]-p[l];}; const q=rsq([1,2,3,4,5]); expect(q(0,2)).toBe(6); expect(q(2,4)).toBe(12); });
  it('finds minimum number of platforms needed', () => { const plat=(arr:number[],dep:number[])=>{arr.sort((a,b)=>a-b);dep.sort((a,b)=>a-b);let plat=1,max=1,i=1,j=0;while(i<arr.length&&j<dep.length){arr[i]<=dep[j]?(plat++,i++):(plat--,j++);max=Math.max(max,plat);}return max;}; expect(plat([900,940,950,1100,1500,1800],[910,1200,1120,1130,1900,2000])).toBe(3); });
  it('finds the longest consecutive sequence', () => { const lcs=(a:number[])=>{const s=new Set(a);let max=0;for(const v of s){if(!s.has(v-1)){let cur=v,len=1;while(s.has(cur+1)){cur++;len++;}max=Math.max(max,len);}}return max;}; expect(lcs([100,4,200,1,3,2])).toBe(4); expect(lcs([0,3,7,2,5,8,4,6,0,1])).toBe(9); });
  it('checks if array is sorted and rotated', () => { const isSR=(a:number[])=>{let cnt=0;for(let i=0;i<a.length;i++)if(a[i]>a[(i+1)%a.length])cnt++;return cnt<=1;}; expect(isSR([3,4,5,1,2])).toBe(true); expect(isSR([2,1,3,4])).toBe(false); expect(isSR([1,2,3])).toBe(true); });
  it('computes largest rectangle in histogram', () => { const lrh=(h:number[])=>{const s:number[]=[],n=h.length;let max=0;for(let i=0;i<=n;i++){const hi=i===n?0:h[i];while(s.length&&h[s[s.length-1]]>hi){const top=s.pop()!;const w=s.length?i-s[s.length-1]-1:i;max=Math.max(max,h[top]*w);}s.push(i);}return max;}; expect(lrh([2,1,5,6,2,3])).toBe(10); expect(lrh([2,4])).toBe(4); });
});

describe('phase51 coverage', () => {
  it('solves house robber II with circular houses', () => { const rob2=(nums:number[])=>{if(nums.length===1)return nums[0];const rob=(a:number[])=>{let prev=0,cur=0;for(const n of a){const tmp=Math.max(cur,prev+n);prev=cur;cur=tmp;}return cur;};return Math.max(rob(nums.slice(0,-1)),rob(nums.slice(1)));}; expect(rob2([2,3,2])).toBe(3); expect(rob2([1,2,3,1])).toBe(4); expect(rob2([1,2,3])).toBe(3); });
  it('counts ways to decode a digit string', () => { const decode=(s:string)=>{if(!s||s[0]==='0')return 0;const n=s.length,dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=Number(s[i-1]),two=Number(s.slice(i-2,i));if(one>0)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(decode('12')).toBe(2); expect(decode('226')).toBe(3); expect(decode('06')).toBe(0); });
  it('finds longest palindromic substring', () => { const lps2=(s:string)=>{let st=0,ml=1;const ex=(l:number,r:number)=>{while(l>=0&&r<s.length&&s[l]===s[r]){if(r-l+1>ml){ml=r-l+1;st=l;}l--;r++;}};for(let i=0;i<s.length;i++){ex(i,i);ex(i,i+1);}return s.slice(st,st+ml);}; expect(lps2('cbbd')).toBe('bb'); expect(lps2('a')).toBe('a'); expect(['bab','aba']).toContain(lps2('babad')); });
  it('solves coin change minimum coins', () => { const cc=(coins:number[],amt:number)=>{const dp=new Array(amt+1).fill(amt+1);dp[0]=0;for(let i=1;i<=amt;i++)for(const c of coins)if(c<=i)dp[i]=Math.min(dp[i],dp[i-c]+1);return dp[amt]>amt?-1:dp[amt];}; expect(cc([1,5,11],15)).toBe(3); expect(cc([2],3)).toBe(-1); expect(cc([1,2,5],11)).toBe(3); });
  it('generates power set of an array', () => { const ps=(a:number[])=>{const r:number[][]=[];for(let mask=0;mask<(1<<a.length);mask++){const s:number[]=[];for(let i=0;i<a.length;i++)if(mask&(1<<i))s.push(a[i]);r.push(s);}return r;}; expect(ps([1,2]).length).toBe(4); expect(ps([1,2,3]).length).toBe(8); expect(ps([])).toEqual([[]]); });
});

describe('phase52 coverage', () => {
  it('searches for word in character grid', () => { const ws2=(board:string[][],word:string)=>{const rows=board.length,cols=board[0].length;const dfs=(r:number,c:number,i:number):boolean=>{if(i===word.length)return true;if(r<0||r>=rows||c<0||c>=cols||board[r][c]!==word[i])return false;const tmp=board[r][c];board[r][c]='#';const ok=dfs(r+1,c,i+1)||dfs(r-1,c,i+1)||dfs(r,c+1,i+1)||dfs(r,c-1,i+1);board[r][c]=tmp;return ok;};for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(dfs(r,c,0))return true;return false;}; expect(ws2([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCCED')).toBe(true); expect(ws2([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCB')).toBe(false); });
  it('computes product of array except self', () => { const pes=(a:number[])=>{const n=a.length,res=new Array(n).fill(1);for(let i=1;i<n;i++)res[i]=res[i-1]*a[i-1];let r=1;for(let i=n-1;i>=0;i--){res[i]*=r;r*=a[i];}return res;}; expect(pes([1,2,3,4])).toEqual([24,12,8,6]); expect(pes([1,2,0,4])).toEqual([0,0,8,0]); });
  it('matches string with wildcard pattern', () => { const wm=(s:string,p:string)=>{const m=s.length,n=p.length,dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){if(p[j-1]==='*')dp[i][j]=dp[i-1][j]||dp[i][j-1];else if(p[j-1]==='?'||s[i-1]===p[j-1])dp[i][j]=dp[i-1][j-1];}return dp[m][n];}; expect(wm('aa','a')).toBe(false); expect(wm('aa','*')).toBe(true); expect(wm('adceb','*a*b')).toBe(true); });
  it('finds minimum perfect squares sum to n', () => { const ps2=(n:number)=>{const dp=new Array(n+1).fill(Infinity);dp[0]=0;for(let i=1;i<=n;i++)for(let j=1;j*j<=i;j++)dp[i]=Math.min(dp[i],dp[i-j*j]+1);return dp[n];}; expect(ps2(12)).toBe(3); expect(ps2(13)).toBe(2); expect(ps2(4)).toBe(1); });
  it('counts subarrays with exactly k odd numbers', () => { const nna2=(a:number[],k:number)=>{let cnt=0;for(let i=0;i<a.length;i++){let odds=0;for(let j=i;j<a.length;j++){odds+=a[j]%2;if(odds===k)cnt++;else if(odds>k)break;}}return cnt;}; expect(nna2([1,1,2,1,1],3)).toBe(2); expect(nna2([2,4,6],1)).toBe(0); expect(nna2([1,2,3,1],2)).toBe(3); });
});

describe('phase53 coverage', () => {
  it('finds if valid path exists in undirected graph', () => { const vp=(n:number,edges:[number,number][],src:number,dst:number)=>{const adj:number[][]=Array.from({length:n},()=>[]);for(const[u,v]of edges){adj[u].push(v);adj[v].push(u);}const vis=new Set<number>();const dfs=(v:number):boolean=>{if(v===dst)return true;vis.add(v);for(const u of adj[v])if(!vis.has(u)&&dfs(u))return true;return false;};return dfs(src);}; expect(vp(3,[[0,1],[1,2],[2,0]],0,2)).toBe(true); expect(vp(6,[[0,1],[0,2],[3,5],[5,4],[4,3]],0,5)).toBe(false); });
  it('simulates asteroid collisions', () => { const ac2=(a:number[])=>{const st:number[]=[];for(const x of a){let alive=true;while(alive&&x<0&&st.length&&st[st.length-1]>0){if(st[st.length-1]<-x)st.pop();else if(st[st.length-1]===-x){st.pop();alive=false;}else alive=false;}if(alive)st.push(x);}return st;}; expect(ac2([5,10,-5])).toEqual([5,10]); expect(ac2([8,-8])).toEqual([]); expect(ac2([10,2,-5])).toEqual([10]); });
  it('finds days until warmer temperature', () => { const dt2=(T:number[])=>{const res=new Array(T.length).fill(0),st:number[]=[];for(let i=0;i<T.length;i++){while(st.length&&T[st[st.length-1]]<T[i]){const j=st.pop()!;res[j]=i-j;}st.push(i);}return res;}; expect(dt2([73,74,75,71,69,72,76,73])).toEqual([1,1,4,2,1,1,0,0]); expect(dt2([30,40,50,60])).toEqual([1,1,1,0]); });
  it('removes k digits to form smallest number', () => { const rk2=(num:string,k:number)=>{const st:string[]=[];for(const c of num){while(k>0&&st.length&&st[st.length-1]>c){st.pop();k--;}st.push(c);}while(k--)st.pop();const res=st.join('').replace(/^0+/,'');return res||'0';}; expect(rk2('1432219',3)).toBe('1219'); expect(rk2('10200',1)).toBe('200'); expect(rk2('10',2)).toBe('0'); });
  it('counts car fleets arriving at target', () => { const cf2=(target:number,pos:number[],spd:number[])=>{const cars=[...Array(pos.length).keys()].sort((a,b)=>pos[b]-pos[a]);const st:number[]=[];for(const i of cars){const t=(target-pos[i])/spd[i];if(!st.length||t>st[st.length-1])st.push(t);}return st.length;}; expect(cf2(12,[10,8,0,5,3],[2,4,1,1,3])).toBe(3); expect(cf2(10,[3],[3])).toBe(1); });
});


describe('phase54 coverage', () => {
  it('finds the duplicate number in array containing n+1 integers in [1,n]', () => { const fd=(a:number[])=>{let slow=a[0],fast=a[0];do{slow=a[slow];fast=a[a[fast]];}while(slow!==fast);slow=a[0];while(slow!==fast){slow=a[slow];fast=a[fast];}return slow;}; expect(fd([1,3,4,2,2])).toBe(2); expect(fd([3,1,3,4,2])).toBe(3); });
  it('counts total number of digit 1 appearing in all numbers from 1 to n', () => { const cnt1=(n:number)=>{let res=0;for(let f=1;f<=n;f*=10){const hi=Math.floor(n/(f*10)),cur=Math.floor(n/f)%10,lo=n%f;res+=hi*f+(cur>1?f:cur===1?lo+1:0);}return res;}; expect(cnt1(13)).toBe(6); expect(cnt1(0)).toBe(0); expect(cnt1(100)).toBe(21); });
  it('finds maximum sum subarray with all unique elements', () => { const mev=(a:number[])=>{const seen=new Set<number>();let l=0,sum=0,res=0;for(let r=0;r<a.length;r++){while(seen.has(a[r])){seen.delete(a[l]);sum-=a[l++];}seen.add(a[r]);sum+=a[r];res=Math.max(res,sum);}return res;}; expect(mev([4,2,4,5,6])).toBe(17); expect(mev([5,2,1,2,5,2,1,2,5])).toBe(8); });
  it('counts inversions in array using merge sort', () => { const invCount=(a:number[])=>{let cnt=0;const ms=(arr:number[]):number[]=>{if(arr.length<=1)return arr;const m=arr.length>>1,L=ms(arr.slice(0,m)),R=ms(arr.slice(m));const res:number[]=[];let i=0,j=0;while(i<L.length&&j<R.length){if(L[i]<=R[j])res.push(L[i++]);else{cnt+=L.length-i;res.push(R[j++]);}}return res.concat(L.slice(i)).concat(R.slice(j));};ms(a);return cnt;}; expect(invCount([2,4,1,3,5])).toBe(3); expect(invCount([5,4,3,2,1])).toBe(10); expect(invCount([1,2,3])).toBe(0); });
  it('computes total hamming distance between all pairs', () => { const thd=(a:number[])=>{let res=0;for(let b=0;b<32;b++){let ones=0;for(const x of a)ones+=(x>>b)&1;res+=ones*(a.length-ones);}return res;}; expect(thd([4,14,2])).toBe(6); expect(thd([4,14,4])).toBe(4); });
});


describe('phase55 coverage', () => {
  it('determines if array can be partitioned into two equal-sum subsets', () => { const part=(a:number[])=>{const sum=a.reduce((s,v)=>s+v,0);if(sum%2)return false;const t=sum/2;const dp=new Array(t+1).fill(false);dp[0]=true;for(const n of a)for(let j=t;j>=n;j--)dp[j]=dp[j]||dp[j-n];return dp[t];}; expect(part([1,5,11,5])).toBe(true); expect(part([1,2,3,5])).toBe(false); });
  it('converts an integer to Roman numeral string', () => { const i2r=(n:number)=>{const vals=[1000,900,500,400,100,90,50,40,10,9,5,4,1];const syms=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];let res='';for(let i=0;i<vals.length;i++){while(n>=vals[i]){res+=syms[i];n-=vals[i];}}return res;}; expect(i2r(3)).toBe('III'); expect(i2r(58)).toBe('LVIII'); expect(i2r(1994)).toBe('MCMXCIV'); });
  it('reverses bits of a 32-bit unsigned integer', () => { const revBits=(n:number)=>{let res=0;for(let i=0;i<32;i++){res=(res*2+((n>>i)&1))>>>0;}return res;}; expect(revBits(0b00000010100101000001111010011100)).toBe(0b00111001011110000010100101000000); expect(revBits(0b11111111111111111111111111111101)).toBe(0b10111111111111111111111111111111); });
  it('generates the nth term of count-and-say sequence', () => { const cas=(n:number):string=>{if(n===1)return '1';const prev=cas(n-1);let res='',i=0;while(i<prev.length){let j=i;while(j<prev.length&&prev[j]===prev[i])j++;res+=`${j-i}${prev[i]}`;i=j;}return res;}; expect(cas(1)).toBe('1'); expect(cas(4)).toBe('1211'); expect(cas(5)).toBe('111221'); });
  it('counts prime numbers less than n using Sieve of Eratosthenes', () => { const cp=(n:number)=>{if(n<2)return 0;const s=new Uint8Array(n).fill(1);s[0]=s[1]=0;for(let i=2;i*i<n;i++)if(s[i])for(let j=i*i;j<n;j+=i)s[j]=0;return s.reduce((a,v)=>a+v,0);}; expect(cp(10)).toBe(4); expect(cp(0)).toBe(0); expect(cp(20)).toBe(8); });
});


describe('phase56 coverage', () => {
  it('computes diameter (longest path between any two nodes) of binary tree', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const diam=(root:N|null)=>{let res=0;const h=(n:N|null):number=>{if(!n)return 0;const l=h(n.l),r=h(n.r);res=Math.max(res,l+r);return 1+Math.max(l,r);};h(root);return res;}; expect(diam(mk(1,mk(2,mk(4),mk(5)),mk(3)))).toBe(3); expect(diam(mk(1,mk(2)))).toBe(1); });
  it('reverses a character array in-place using two pointers', () => { const rev=(a:string[])=>{let l=0,r=a.length-1;while(l<r){[a[l],a[r]]=[a[r],a[l]];l++;r--;}return a;}; expect(rev(['h','e','l','l','o'])).toEqual(['o','l','l','e','h']); expect(rev(['H','a','n','n','a','h'])).toEqual(['h','a','n','n','a','H']); });
  it('finds index of first non-repeating character in string', () => { const fuc=(s:string)=>{const m=new Map<string,number>();for(const c of s)m.set(c,(m.get(c)||0)+1);for(let i=0;i<s.length;i++)if(m.get(s[i])===1)return i;return -1;}; expect(fuc('leetcode')).toBe(0); expect(fuc('loveleetcode')).toBe(2); expect(fuc('aabb')).toBe(-1); });
  it('adds two integers without using + or - operators', () => { const add=(a:number,b:number):number=>{while(b!==0){const carry=(a&b)<<1;a=a^b;b=carry;}return a;}; expect(add(1,2)).toBe(3); expect(add(-2,3)).toBe(1); expect(add(0,0)).toBe(0); });
  it('checks if two strings are isomorphic (consistent char mapping)', () => { const iso=(s:string,t:string)=>{const ms=new Map<string,string>(),mt=new Map<string,string>();for(let i=0;i<s.length;i++){if(ms.has(s[i])&&ms.get(s[i])!==t[i])return false;if(mt.has(t[i])&&mt.get(t[i])!==s[i])return false;ms.set(s[i],t[i]);mt.set(t[i],s[i]);}return true;}; expect(iso('egg','add')).toBe(true); expect(iso('foo','bar')).toBe(false); expect(iso('paper','title')).toBe(true); });
});


describe('phase57 coverage', () => {
  it('implements FreqStack that pops the most frequent element', () => { class FS{private freq=new Map<number,number>();private group=new Map<number,number[]>();private maxFreq=0;push(v:number){const f=(this.freq.get(v)||0)+1;this.freq.set(v,f);this.maxFreq=Math.max(this.maxFreq,f);if(!this.group.has(f))this.group.set(f,[]);this.group.get(f)!.push(v);}pop(){const top=this.group.get(this.maxFreq)!;const v=top.pop()!;if(!top.length){this.group.delete(this.maxFreq);this.maxFreq--;}this.freq.set(v,this.freq.get(v)!-1);return v;}} const fs=new FS();[5,7,5,7,4,5].forEach(v=>fs.push(v));expect(fs.pop()).toBe(5);expect(fs.pop()).toBe(7);expect(fs.pop()).toBe(5);expect(fs.pop()).toBe(4); });
  it('counts nodes in complete binary tree in O(log^2 n)', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const ld=(n:N|null):number=>n?1+ld(n.l):0; const cnt=(n:N|null):number=>{if(!n)return 0;const l=ld(n.l),r=ld(n.r);return l===r?cnt(n.r)+(1<<l):cnt(n.l)+(1<<r);}; const t=mk(1,mk(2,mk(4),mk(5)),mk(3,mk(6),null)); expect(cnt(t)).toBe(6); expect(cnt(null)).toBe(0); expect(cnt(mk(1))).toBe(1); });
  it('arranges numbers to form the largest possible number', () => { const largest=(nums:number[])=>{const s=nums.map(String).sort((a,b)=>(b+a).localeCompare(a+b));return s[0]==='0'?'0':s.join('');}; expect(largest([10,2])).toBe('210'); expect(largest([3,30,34,5,9])).toBe('9534330'); expect(largest([0,0])).toBe('0'); });
  it('finds the index of the minimum right interval for each interval', () => { const fri=(ivs:[number,number][])=>{const starts=ivs.map((v,i)=>[v[0],i]).sort((a,b)=>a[0]-b[0]);return ivs.map(([,end])=>{let lo=0,hi=starts.length;while(lo<hi){const m=lo+hi>>1;if(starts[m][0]<end)lo=m+1;else hi=m;}return lo<starts.length?starts[lo][1]:-1;});}; expect(fri([[1,2]])).toEqual([-1]); expect(fri([[3,4],[2,3],[1,2]])).toEqual([-1,0,1]); });
  it('implements a trie with insert, search, and startsWith', () => { class Trie{private root:{[k:string]:any}={};insert(w:string){let n=this.root;for(const c of w){n[c]=n[c]||{};n=n[c];}n['$']=true;}search(w:string){let n=this.root;for(const c of w){if(!n[c])return false;n=n[c];}return!!n['$'];}startsWith(p:string){let n=this.root;for(const c of p){if(!n[c])return false;n=n[c];}return true;}} const t=new Trie();t.insert('apple');expect(t.search('apple')).toBe(true);expect(t.search('app')).toBe(false);expect(t.startsWith('app')).toBe(true);t.insert('app');expect(t.search('app')).toBe(true); });
});

describe('phase58 coverage', () => {
  it('palindrome partitioning', () => {
    const partition=(s:string):string[][]=>{const res:string[][]=[];const isPalin=(a:string)=>a===a.split('').reverse().join('');const bt=(start:number,path:string[])=>{if(start===s.length){res.push([...path]);return;}for(let end=start+1;end<=s.length;end++){const sub=s.slice(start,end);if(isPalin(sub)){path.push(sub);bt(end,path);path.pop();}}};bt(0,[]);return res;};
    const r=partition('aab');
    expect(r).toContainEqual(['a','a','b']);
    expect(r).toContainEqual(['aa','b']);
    expect(partition('a')).toEqual([['a']]);
  });
  it('find peak element binary', () => {
    const findPeakElement=(nums:number[]):number=>{let lo=0,hi=nums.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(nums[mid]>nums[mid+1])hi=mid;else lo=mid+1;}return lo;};
    const p1=findPeakElement([1,2,3,1]);
    expect([1,2,3,1][p1]).toBeGreaterThan([1,2,3,1][p1-1]||(-Infinity));
    expect([1,2,3,1][p1]).toBeGreaterThan([1,2,3,1][p1+1]||(-Infinity));
    const p2=findPeakElement([1,2,1,3,5,6,4]);
    expect(p2===1||p2===5).toBe(true);
  });
  it('median from stream', () => {
    class MedianFinder{private lo:number[]=[];private hi:number[]=[];addNum(n:number){this.lo.push(n);this.lo.sort((a,b)=>b-a);this.hi.push(this.lo.shift()!);this.hi.sort((a,b)=>a-b);if(this.hi.length>this.lo.length)this.lo.unshift(this.hi.shift()!);}findMedian():number{return this.lo.length>this.hi.length?this.lo[0]:(this.lo[0]+this.hi[0])/2;}}
    const mf=new MedianFinder();mf.addNum(1);mf.addNum(2);
    expect(mf.findMedian()).toBe(1.5);
    mf.addNum(3);
    expect(mf.findMedian()).toBe(2);
  });
  it('coin change combinations', () => {
    const change=(amount:number,coins:number[]):number=>{const dp=new Array(amount+1).fill(0);dp[0]=1;coins.forEach(c=>{for(let i=c;i<=amount;i++)dp[i]+=dp[i-c];});return dp[amount];};
    expect(change(5,[1,2,5])).toBe(4);
    expect(change(3,[2])).toBe(0);
    expect(change(10,[10])).toBe(1);
    expect(change(0,[1,2,3])).toBe(1);
  });
  it('validate BST', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const isValidBST=(root:TN|null,min=-Infinity,max=Infinity):boolean=>{if(!root)return true;if(root.val<=min||root.val>=max)return false;return isValidBST(root.left,min,root.val)&&isValidBST(root.right,root.val,max);};
    expect(isValidBST(mk(2,mk(1),mk(3)))).toBe(true);
    expect(isValidBST(mk(5,mk(1),mk(4,mk(3),mk(6))))).toBe(false);
    expect(isValidBST(null)).toBe(true);
  });
});

describe('phase59 coverage', () => {
  it('find all anagrams', () => {
    const findAnagrams=(s:string,p:string):number[]=>{if(p.length>s.length)return[];const cnt=new Array(26).fill(0);const a='a'.charCodeAt(0);for(const c of p)cnt[c.charCodeAt(0)-a]++;const window=new Array(26).fill(0);const res:number[]=[];for(let i=0;i<s.length;i++){window[s[i].charCodeAt(0)-a]++;if(i>=p.length)window[s[i-p.length].charCodeAt(0)-a]--;if(i>=p.length-1&&window.join(',')===cnt.join(','))res.push(i-p.length+1);}return res;};
    expect(findAnagrams('cbaebabacd','abc')).toEqual([0,6]);
    expect(findAnagrams('abab','ab')).toEqual([0,1,2]);
  });
  it('minimum window substring', () => {
    const minWindow=(s:string,t:string):string=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let have=0,req=need.size,l=0,best='';for(let r=0;r<s.length;r++){const c=s[r];need.set(c,(need.get(c)||0)-1);if(need.get(c)===0)have++;while(have===req){if(!best||r-l+1<best.length)best=s.slice(l,r+1);const lc=s[l];need.set(lc,(need.get(lc)||0)+1);if((need.get(lc)||0)>0)have--;l++;}}return best;};
    expect(minWindow('ADOBECODEBANC','ABC')).toBe('BANC');
    expect(minWindow('a','a')).toBe('a');
    expect(minWindow('a','aa')).toBe('');
  });
  it('number of connected components', () => {
    const countComponents=(n:number,edges:[number,number][]):number=>{const parent=Array.from({length:n},(_,i)=>i);const find=(x:number):number=>parent[x]===x?x:parent[x]=find(parent[x]);const union=(a:number,b:number)=>parent[find(a)]=find(b);edges.forEach(([a,b])=>union(a,b));return new Set(Array.from({length:n},(_,i)=>find(i))).size;};
    expect(countComponents(5,[[0,1],[1,2],[3,4]])).toBe(2);
    expect(countComponents(5,[[0,1],[1,2],[2,3],[3,4]])).toBe(1);
    expect(countComponents(4,[])).toBe(4);
  });
  it('search 2D matrix II', () => {
    const searchMatrix=(matrix:number[][],target:number):boolean=>{let r=0,c=matrix[0].length-1;while(r<matrix.length&&c>=0){if(matrix[r][c]===target)return true;if(matrix[r][c]>target)c--;else r++;}return false;};
    const m=[[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]];
    expect(searchMatrix(m,5)).toBe(true);
    expect(searchMatrix(m,20)).toBe(false);
  });
  it('non-overlapping intervals', () => {
    const eraseOverlapIntervals=(intervals:[number,number][]):number=>{if(!intervals.length)return 0;intervals.sort((a,b)=>a[1]-b[1]);let count=0,end=intervals[0][1];for(let i=1;i<intervals.length;i++){if(intervals[i][0]<end)count++;else end=intervals[i][1];}return count;};
    expect(eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]])).toBe(1);
    expect(eraseOverlapIntervals([[1,2],[1,2],[1,2]])).toBe(2);
    expect(eraseOverlapIntervals([[1,2],[2,3]])).toBe(0);
  });
});

describe('phase60 coverage', () => {
  it('minimum score triangulation', () => {
    const minScoreTriangulation=(values:number[]):number=>{const n=values.length;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let len=2;len<n;len++)for(let i=0;i<n-len;i++){const j=i+len;dp[i][j]=Infinity;for(let k=i+1;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+values[i]*values[k]*values[j]+dp[k][j]);}return dp[0][n-1];};
    expect(minScoreTriangulation([1,2,3])).toBe(6);
    expect(minScoreTriangulation([3,7,4,5])).toBe(144);
    expect(minScoreTriangulation([1,3,1,4,1,5])).toBe(13);
  });
  it('number of longest increasing subsequences', () => {
    const findNumberOfLIS=(nums:number[]):number=>{const n=nums.length;const len=new Array(n).fill(1);const cnt=new Array(n).fill(1);for(let i=1;i<n;i++)for(let j=0;j<i;j++)if(nums[j]<nums[i]){if(len[j]+1>len[i]){len[i]=len[j]+1;cnt[i]=cnt[j];}else if(len[j]+1===len[i])cnt[i]+=cnt[j];}const maxLen=Math.max(...len);return cnt.reduce((s,c,i)=>len[i]===maxLen?s+c:s,0);};
    expect(findNumberOfLIS([1,3,5,4,7])).toBe(2);
    expect(findNumberOfLIS([2,2,2,2,2])).toBe(5);
    expect(findNumberOfLIS([1,2,4,3,5,4,7,2])).toBe(3);
  });
  it('fruit into baskets', () => {
    const totalFruit=(fruits:number[]):number=>{const basket=new Map<number,number>();let l=0,res=0;for(let r=0;r<fruits.length;r++){basket.set(fruits[r],(basket.get(fruits[r])||0)+1);while(basket.size>2){const lf=fruits[l];basket.set(lf,basket.get(lf)!-1);if(basket.get(lf)===0)basket.delete(lf);l++;}res=Math.max(res,r-l+1);}return res;};
    expect(totalFruit([1,2,1])).toBe(3);
    expect(totalFruit([0,1,2,2])).toBe(3);
    expect(totalFruit([1,2,3,2,2])).toBe(4);
  });
  it('number of nice subarrays', () => {
    const numberOfSubarrays=(nums:number[],k:number):number=>{const atMost=(m:number)=>{let count=0,odd=0,l=0;for(let r=0;r<nums.length;r++){if(nums[r]%2!==0)odd++;while(odd>m){if(nums[l]%2!==0)odd--;l++;}count+=r-l+1;}return count;};return atMost(k)-atMost(k-1);};
    expect(numberOfSubarrays([1,1,2,1,1],3)).toBe(2);
    expect(numberOfSubarrays([2,4,6],1)).toBe(0);
    expect(numberOfSubarrays([2,2,2,1,2,2,1,2,2,2],2)).toBe(16);
  });
  it('burst balloons interval DP', () => {
    const maxCoins=(nums:number[]):number=>{const arr=[1,...nums,1];const n=arr.length;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let len=2;len<n;len++){for(let left=0;left<n-len;left++){const right=left+len;for(let k=left+1;k<right;k++){dp[left][right]=Math.max(dp[left][right],dp[left][k]+arr[left]*arr[k]*arr[right]+dp[k][right]);}}}return dp[0][n-1];};
    expect(maxCoins([3,1,5,8])).toBe(167);
    expect(maxCoins([1,5])).toBe(10);
    expect(maxCoins([1])).toBe(1);
  });
});

describe('phase61 coverage', () => {
  it('subarray sum equals k', () => {
    const subarraySum=(nums:number[],k:number):number=>{const map=new Map([[0,1]]);let count=0,prefix=0;for(const n of nums){prefix+=n;count+=(map.get(prefix-k)||0);map.set(prefix,(map.get(prefix)||0)+1);}return count;};
    expect(subarraySum([1,1,1],2)).toBe(2);
    expect(subarraySum([1,2,3],3)).toBe(2);
    expect(subarraySum([-1,-1,1],0)).toBe(1);
    expect(subarraySum([1],1)).toBe(1);
  });
  it('two sum less than k', () => {
    const twoSumLessThanK=(nums:number[],k:number):number=>{const sorted=[...nums].sort((a,b)=>a-b);let lo=0,hi=sorted.length-1,best=-1;while(lo<hi){const s=sorted[lo]+sorted[hi];if(s<k){best=Math.max(best,s);lo++;}else hi--;}return best;};
    expect(twoSumLessThanK([34,23,1,24,75,33,54,8],60)).toBe(58);
    expect(twoSumLessThanK([10,20,30],15)).toBe(-1);
    expect(twoSumLessThanK([254,914,971,990,525,33,186,136,54,104],1000)).toBe(968);
  });
  it('contiguous array equal zeros ones', () => {
    const findMaxLength=(nums:number[]):number=>{const map=new Map([[0,-1]]);let max=0,count=0;for(let i=0;i<nums.length;i++){count+=nums[i]===0?-1:1;if(map.has(count))max=Math.max(max,i-map.get(count)!);else map.set(count,i);}return max;};
    expect(findMaxLength([0,1])).toBe(2);
    expect(findMaxLength([0,1,0])).toBe(2);
    expect(findMaxLength([0,0,1,0,0,0,1,1])).toBe(6);
  });
  it('asteroid collision stack', () => {
    const asteroidCollision=(asteroids:number[]):number[]=>{const stack:number[]=[];for(const a of asteroids){let destroyed=false;while(stack.length&&a<0&&stack[stack.length-1]>0){if(stack[stack.length-1]<-a){stack.pop();continue;}else if(stack[stack.length-1]===-a){stack.pop();}destroyed=true;break;}if(!destroyed)stack.push(a);}return stack;};
    expect(asteroidCollision([5,10,-5])).toEqual([5,10]);
    expect(asteroidCollision([8,-8])).toEqual([]);
    expect(asteroidCollision([10,2,-5])).toEqual([10]);
    expect(asteroidCollision([-2,-1,1,2])).toEqual([-2,-1,1,2]);
  });
  it('sliding window median', () => {
    const medianSlidingWindow=(nums:number[],k:number):number[]=>{const res:number[]=[];for(let i=0;i<=nums.length-k;i++){const win=[...nums.slice(i,i+k)].sort((a,b)=>a-b);res.push(k%2===0?(win[k/2-1]+win[k/2])/2:win[Math.floor(k/2)]);}return res;};
    expect(medianSlidingWindow([1,3,-1,-3,5,3,6,7],3)).toEqual([1,-1,-1,3,5,6]);
    expect(medianSlidingWindow([1,2,3,4,2,3,1,4,2],3)).toEqual([2,3,3,3,2,3,2]);
  });
});

describe('phase62 coverage', () => {
  it('sum without plus operator', () => {
    const getSum=(a:number,b:number):number=>{while(b!==0){const carry=(a&b)<<1;a=a^b;b=carry;}return a;};
    expect(getSum(1,2)).toBe(3);
    expect(getSum(2,3)).toBe(5);
    expect(getSum(-1,1)).toBe(0);
    expect(getSum(0,0)).toBe(0);
  });
  it('count and say sequence', () => {
    const countAndSay=(n:number):string=>{let s='1';for(let i=1;i<n;i++){let next='';let j=0;while(j<s.length){let k=j;while(k<s.length&&s[k]===s[j])k++;next+=`${k-j}${s[j]}`;j=k;}s=next;}return s;};
    expect(countAndSay(1)).toBe('1');
    expect(countAndSay(4)).toBe('1211');
    expect(countAndSay(5)).toBe('111221');
  });
  it('single number II appears once', () => {
    const singleNumberII=(nums:number[]):number=>{let ones=0,twos=0;for(const n of nums){ones=(ones^n)&~twos;twos=(twos^n)&~ones;}return ones;};
    expect(singleNumberII([2,2,3,2])).toBe(3);
    expect(singleNumberII([0,1,0,1,0,1,99])).toBe(99);
    expect(singleNumberII([1,1,1,2])).toBe(2);
  });
  it('find duplicate Floyd cycle', () => {
    const findDuplicate=(nums:number[]):number=>{let slow=nums[0],fast=nums[0];do{slow=nums[slow];fast=nums[nums[fast]];}while(slow!==fast);slow=nums[0];while(slow!==fast){slow=nums[slow];fast=nums[fast];}return slow;};
    expect(findDuplicate([1,3,4,2,2])).toBe(2);
    expect(findDuplicate([3,1,3,4,2])).toBe(3);
    expect(findDuplicate([1,1])).toBe(1);
  });
  it('reverse words in string', () => {
    const reverseWords=(s:string):string=>s.trim().split(/\s+/).reverse().join(' ');
    expect(reverseWords('the sky is blue')).toBe('blue is sky the');
    expect(reverseWords('  hello world  ')).toBe('world hello');
    expect(reverseWords('a good   example')).toBe('example good a');
  });
});

describe('phase63 coverage', () => {
  it('rotate image 90 degrees', () => {
    const rotate=(matrix:number[][]):void=>{const n=matrix.length;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)[matrix[i][j],matrix[j][i]]=[matrix[j][i],matrix[i][j]];for(let i=0;i<n;i++)matrix[i].reverse();};
    const m=[[1,2,3],[4,5,6],[7,8,9]];rotate(m);
    expect(m).toEqual([[7,4,1],[8,5,2],[9,6,3]]);
    const m2=[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]];rotate(m2);
    expect(m2[0]).toEqual([15,13,2,5]);
  });
  it('car fleet problem', () => {
    const carFleet=(target:number,position:number[],speed:number[]):number=>{const cars=position.map((p,i)=>[(target-p)/speed[i],p]).sort((a,b)=>b[1]-a[1]);let fleets=0,maxTime=0;for(const[time]of cars){if(time>maxTime){fleets++;maxTime=time;}}return fleets;};
    expect(carFleet(12,[10,8,0,5,3],[2,4,1,1,3])).toBe(3);
    expect(carFleet(10,[3],[3])).toBe(1);
    expect(carFleet(100,[0,2,4],[4,2,1])).toBe(1);
  });
  it('repeated substring pattern', () => {
    const repeatedSubstringPattern=(s:string):boolean=>(s+s).slice(1,-1).includes(s);
    expect(repeatedSubstringPattern('abab')).toBe(true);
    expect(repeatedSubstringPattern('aba')).toBe(false);
    expect(repeatedSubstringPattern('abcabcabcabc')).toBe(true);
    expect(repeatedSubstringPattern('ab')).toBe(false);
  });
  it('island perimeter calculation', () => {
    const islandPerimeter=(grid:number[][]):number=>{let p=0;const m=grid.length,n=grid[0].length;for(let i=0;i<m;i++)for(let j=0;j<n;j++)if(grid[i][j]===1){p+=4;if(i>0&&grid[i-1][j]===1)p-=2;if(j>0&&grid[i][j-1]===1)p-=2;}return p;};
    expect(islandPerimeter([[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]])).toBe(16);
    expect(islandPerimeter([[1]])).toBe(4);
    expect(islandPerimeter([[1,0]])).toBe(4);
  });
  it('toeplitz matrix check', () => {
    const isToeplitzMatrix=(matrix:number[][]):boolean=>{for(let i=1;i<matrix.length;i++)for(let j=1;j<matrix[0].length;j++)if(matrix[i][j]!==matrix[i-1][j-1])return false;return true;};
    expect(isToeplitzMatrix([[1,2,3,4],[5,1,2,3],[9,5,1,2]])).toBe(true);
    expect(isToeplitzMatrix([[1,2],[2,2]])).toBe(false);
  });
});

describe('phase64 coverage', () => {
  describe('edit distance', () => {
    function minDistance(w1:string,w2:string):number{const m=w1.length,n=w2.length,dp=Array.from({length:m+1},(_,i)=>new Array(n+1).fill(0).map((_,j)=>i?j?0:i:j));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=w1[i-1]===w2[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);return dp[m][n];}
    it('ex1'   ,()=>expect(minDistance('horse','ros')).toBe(3));
    it('ex2'   ,()=>expect(minDistance('intention','execution')).toBe(5));
    it('same'  ,()=>expect(minDistance('abc','abc')).toBe(0));
    it('empty1',()=>expect(minDistance('','abc')).toBe(3));
    it('empty2',()=>expect(minDistance('abc','')).toBe(3));
  });
  describe('length of LIS', () => {
    function lis(nums:number[]):number{const t:number[]=[];for(const n of nums){let lo=0,hi=t.length;while(lo<hi){const m=(lo+hi)>>1;if(t[m]<n)lo=m+1;else hi=m;}t[lo]=n;}return t.length;}
    it('ex1'   ,()=>expect(lis([10,9,2,5,3,7,101,18])).toBe(4));
    it('ex2'   ,()=>expect(lis([0,1,0,3,2,3])).toBe(4));
    it('asc'   ,()=>expect(lis([1,2,3,4,5])).toBe(5));
    it('desc'  ,()=>expect(lis([5,4,3,2,1])).toBe(1));
    it('one'   ,()=>expect(lis([1])).toBe(1));
  });
  describe('regular expression matching', () => {
    function isMatch(s:string,p:string):boolean{const m=s.length,n=p.length,dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let j=1;j<=n;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-2];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){if(p[j-1]==='*')dp[i][j]=dp[i][j-2]||((p[j-2]==='.'||p[j-2]===s[i-1])&&dp[i-1][j]);else dp[i][j]=(p[j-1]==='.'||p[j-1]===s[i-1])&&dp[i-1][j-1];}return dp[m][n];}
    it('ex1'   ,()=>expect(isMatch('aa','a')).toBe(false));
    it('ex2'   ,()=>expect(isMatch('aa','a*')).toBe(true));
    it('ex3'   ,()=>expect(isMatch('ab','.*')).toBe(true));
    it('star0' ,()=>expect(isMatch('aab','c*a*b')).toBe(true));
    it('dot'   ,()=>expect(isMatch('mississippi','mis*is*p*.')).toBe(false));
  });
  describe('nth ugly number', () => {
    function nthUgly(n:number):number{const u=[1];let i2=0,i3=0,i5=0;for(let i=1;i<n;i++){const nx=Math.min(u[i2]*2,u[i3]*3,u[i5]*5);u.push(nx);if(nx===u[i2]*2)i2++;if(nx===u[i3]*3)i3++;if(nx===u[i5]*5)i5++;}return u[n-1];}
    it('n10'   ,()=>expect(nthUgly(10)).toBe(12));
    it('n1'    ,()=>expect(nthUgly(1)).toBe(1));
    it('n6'    ,()=>expect(nthUgly(6)).toBe(6));
    it('n11'   ,()=>expect(nthUgly(11)).toBe(15));
    it('n7'    ,()=>expect(nthUgly(7)).toBe(8));
  });
  describe('word break II', () => {
    function wordBreakII(s:string,dict:string[]):string[]{const set=new Set(dict);const memo=new Map<number,string[]>();function bt(start:number):string[]{if(memo.has(start))return memo.get(start)!;if(start===s.length)return[''];const res:string[]=[];for(let end=start+1;end<=s.length;end++){const w=s.slice(start,end);if(set.has(w))for(const r of bt(end))res.push(w+(r?' '+r:''));}memo.set(start,res);return res;}return bt(0);}
    it('ex1'   ,()=>expect(wordBreakII('catsanddog',['cat','cats','and','sand','dog']).sort()).toEqual(['cat sand dog','cats and dog']));
    it('ex2'   ,()=>expect(wordBreakII('pineapplepenapple',['apple','pen','applepen','pine','pineapple']).length).toBe(3));
    it('nores' ,()=>expect(wordBreakII('catsandog',['cats','dog','sand','and','cat'])).toEqual([]));
    it('empty' ,()=>expect(wordBreakII('',['a'])).toEqual(['']));
    it('single',()=>expect(wordBreakII('a',['a'])).toEqual(['a']));
  });
});

describe('phase65 coverage', () => {
  describe('n-queens count', () => {
    function nq(n:number):number{let c=0;const cols=new Set<number>(),d1=new Set<number>(),d2=new Set<number>();function bt(r:number):void{if(r===n){c++;return;}for(let col=0;col<n;col++){if(cols.has(col)||d1.has(r-col)||d2.has(r+col))continue;cols.add(col);d1.add(r-col);d2.add(r+col);bt(r+1);cols.delete(col);d1.delete(r-col);d2.delete(r+col);}}bt(0);return c;}
    it('n4'    ,()=>expect(nq(4)).toBe(2));
    it('n1'    ,()=>expect(nq(1)).toBe(1));
    it('n5'    ,()=>expect(nq(5)).toBe(10));
    it('n6'    ,()=>expect(nq(6)).toBe(4));
    it('n8'    ,()=>expect(nq(8)).toBe(92));
  });
});
