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
  id: 'haz-0001',
  riskManagementFileId: '20000000-0000-4000-a000-000000000001',
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
  riskManagementFileId: '20000000-0000-4000-a000-000000000001',
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
  riskManagementFileId: '20000000-0000-4000-a000-000000000001',
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
  benefitRiskAnalysis: 'The benefits of cardiac pacing for life-threatening bradycardia outweigh the residual risks. All identified hazards have been reduced to acceptable levels through design controls and protective measures.',
  reportSummary: 'Risk management file complete. 3 hazards identified, all mitigated. Residual risk acceptable per ISO 14971.',
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
      (mockPrisma.riskManagementFile.create as jest.Mock).mockRejectedValueOnce(new Error('DB connection failed'));

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
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([mockRMF, mockRMF2]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/risk')
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

      await request(app)
        .get('/api/risk?status=DRAFT')
        .set('Authorization', 'Bearer token');

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

      await request(app)
        .get('/api/risk?deviceName=pacemaker')
        .set('Authorization', 'Bearer token');

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

      await request(app)
        .get('/api/risk')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.riskManagementFile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should only include non-deleted records (deletedAt: null)', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.riskManagementFile.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/risk')
        .set('Authorization', 'Bearer token');

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

      const response = await request(app)
        .get('/api/risk')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
      expect(response.body.meta.totalPages).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.riskManagementFile.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB connection failed'));

      const response = await request(app)
        .get('/api/risk')
        .set('Authorization', 'Bearer token');

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
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMFWithHazards);

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
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
          riskManagementFileId: mockRMF.id,
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
        'ENERGY', 'BIOLOGICAL', 'ENVIRONMENTAL', 'WRONG_OUTPUT',
        'USE_ERROR', 'FUNCTIONALITY', 'CHEMICAL', 'ELECTROMAGNETIC',
        'RADIATION', 'MECHANICAL', 'THERMAL', 'OTHER',
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
        .put('/api/risk/00000000-0000-4000-a000-ffffffffffff/hazards/haz-0001')
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
        riskManagementFileId: 'different-rmf-id',
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
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
      (mockPrisma.riskManagementFile.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
            controls: [
              { ...mockControl3, implementationStatus: 'PLANNED' },
            ],
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

      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(rmfWithFullData);

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
          { ...mockHazard1, residualRiskAcceptable: false, riskLevelBefore: 'HIGH', riskLevelAfter: 'MEDIUM', controls: [] },
          { ...mockHazard2, residualRiskAcceptable: false, riskLevelBefore: 'MEDIUM', riskLevelAfter: 'MEDIUM', controls: [] },
          { ...mockHazard3, residualRiskAcceptable: true, riskLevelBefore: 'LOW', riskLevelAfter: 'NEGLIGIBLE', controls: [] },
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
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockResolvedValueOnce(mockRMFWithHazards);

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
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

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
      (mockPrisma.riskManagementFile.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get(`/api/risk/${mockRMF.id}/residual`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get residual risk summary');
    });
  });
});
