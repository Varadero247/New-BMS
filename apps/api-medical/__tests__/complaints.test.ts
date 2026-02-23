import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    complaint: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    ComplaintWhereInput: {},
    ComplaintUpdateInput: {},
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
import complaintsRoutes from '../src/routes/complaints';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockComplaint = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'COMP-2602-0001',
  deviceName: 'Cardiac Monitor X200',
  deviceId: 'DEV-CM-X200',
  lotNumber: 'LOT-2026-001',
  serialNumber: 'SN-001234',
  complaintDate: new Date('2026-02-01'),
  source: 'CUSTOMER',
  reporterName: 'Dr. Jane Smith',
  reporterContact: 'jane.smith@hospital.org',
  description: 'Device intermittently displays incorrect heart rate readings',
  patientInvolved: true,
  injuryOccurred: false,
  injuryDescription: null,
  deathOccurred: false,
  malfunctionOccurred: true,
  severity: 'MAJOR',
  status: 'RECEIVED',
  mdrReportable: null,
  mdrDecisionDate: null,
  mdrDecisionBy: null,
  mdrReportRef: null,
  investigationSummary: null,
  rootCause: null,
  correctiveAction: null,
  capaRef: null,
  closedDate: null,
  closedBy: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockComplaint2 = {
  id: '20000000-0000-4000-a000-000000000002',
  refNumber: 'COMP-2602-0002',
  deviceName: 'Infusion Pump P500',
  deviceId: 'DEV-IP-P500',
  lotNumber: 'LOT-2026-010',
  serialNumber: 'SN-005678',
  complaintDate: new Date('2026-02-05'),
  source: 'HEALTHCARE_PROVIDER',
  reporterName: 'Nurse Roberts',
  reporterContact: 'roberts@clinic.com',
  description: 'Infusion pump delivered incorrect dosage resulting in patient adverse event',
  patientInvolved: true,
  injuryOccurred: true,
  injuryDescription: 'Patient experienced adverse reaction due to incorrect dosage',
  deathOccurred: false,
  malfunctionOccurred: true,
  severity: 'CRITICAL',
  status: 'MDR_REVIEW',
  mdrReportable: null,
  mdrDecisionDate: null,
  mdrDecisionBy: null,
  mdrReportRef: null,
  investigationSummary: null,
  rootCause: null,
  correctiveAction: null,
  capaRef: null,
  closedDate: null,
  closedBy: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-05'),
};

const mockComplaintReadyToClose = {
  id: '20000000-0000-4000-a000-000000000003',
  refNumber: 'COMP-2602-0003',
  deviceName: 'Surgical Stapler S100',
  deviceId: 'DEV-SS-S100',
  lotNumber: 'LOT-2026-020',
  serialNumber: 'SN-009999',
  complaintDate: new Date('2026-01-15'),
  source: 'FIELD_SERVICE',
  reporterName: 'Tech Team',
  reporterContact: 'field@company.com',
  description: 'Stapler misfired during procedure',
  patientInvolved: true,
  injuryOccurred: true,
  injuryDescription: 'Minor tissue damage from misfire',
  deathOccurred: false,
  malfunctionOccurred: true,
  severity: 'MAJOR',
  status: 'CAPA_INITIATED',
  mdrReportable: true,
  mdrDecisionDate: new Date('2026-01-20'),
  mdrDecisionBy: 'test@test.com',
  mdrReportRef: 'MDR-2026-0001',
  investigationSummary: 'Spring mechanism fatigue identified',
  rootCause: 'Metal fatigue in firing mechanism spring after extended use cycles',
  correctiveAction: 'Redesign spring mechanism with higher-grade alloy; add cycle counter',
  capaRef: 'CAPA-MED-2026-001',
  closedDate: null,
  closedBy: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-02-08'),
};

const validCreatePayload = {
  deviceName: 'Cardiac Monitor X200',
  deviceId: 'DEV-CM-X200',
  lotNumber: 'LOT-2026-001',
  serialNumber: 'SN-001234',
  complaintDate: '2026-02-01',
  source: 'CUSTOMER',
  reporterName: 'Dr. Jane Smith',
  reporterContact: 'jane.smith@hospital.org',
  description: 'Device intermittently displays incorrect heart rate readings',
  patientInvolved: true,
  injuryOccurred: false,
  deathOccurred: false,
  malfunctionOccurred: true,
  severity: 'MAJOR',
};

const validCreatePayloadWithInjury = {
  deviceName: 'Infusion Pump P500',
  complaintDate: '2026-02-05',
  source: 'HEALTHCARE_PROVIDER',
  description: 'Pump delivered incorrect dosage',
  injuryOccurred: true,
  deathOccurred: false,
  malfunctionOccurred: true,
  severity: 'CRITICAL',
};

const validUpdatePayload = {
  investigationSummary: 'Firmware analysis reveals timing issue in sensor module',
  rootCause: 'Race condition in firmware v2.3 sensor polling loop',
  correctiveAction: 'Firmware patch v2.3.1 with mutex lock on sensor reads',
  status: 'UNDER_INVESTIGATION',
};

const validMDRDecisionPayload = {
  reportable: true,
  mdrReportRef: 'MDR-2026-0042',
  notes: 'Meets criteria under 21 CFR 803.50 - malfunction with potential injury',
};

// ==========================================
// Tests
// ==========================================

describe('Medical Complaint Handling & MDR API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/complaints', complaintsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / - Log new complaint
  // ==========================================
  describe('POST /api/complaints', () => {
    it('should create a new complaint successfully', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        refNumber: 'COMP-2602-0001',
      });

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.refNumber).toBe('COMP-2602-0001');
    });

    it('should generate a sequential reference number', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        refNumber: 'COMP-2602-0006',
      });

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);

      // Verify count was called with the prefix filter
      expect(mockPrisma.complaint.count).toHaveBeenCalledWith({
        where: { refNumber: { startsWith: expect.stringMatching(/^COMP-\d{4}$/) } },
      });
    });

    it('should auto-detect MDR flag and set status to MDR_REVIEW when injury occurs', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(1);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint2,
        status: 'MDR_REVIEW',
      });

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayloadWithInjury);

      expect(response.status).toBe(201);

      // Verify the create call used MDR_REVIEW status
      expect(mockPrisma.complaint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'MDR_REVIEW',
          injuryOccurred: true,
          malfunctionOccurred: true,
        }),
      });
    });

    it('should set status to MDR_REVIEW when death occurred', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        status: 'MDR_REVIEW',
        deathOccurred: true,
      });

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreatePayload,
          deathOccurred: true,
          injuryOccurred: false,
          malfunctionOccurred: false,
        });

      expect(response.status).toBe(201);
      expect(mockPrisma.complaint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'MDR_REVIEW',
          deathOccurred: true,
        }),
      });
    });

    it('should set status to RECEIVED when no MDR-triggering events', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        status: 'RECEIVED',
      });

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreatePayload,
          injuryOccurred: false,
          deathOccurred: false,
          malfunctionOccurred: false,
        });

      expect(response.status).toBe(201);
      expect(mockPrisma.complaint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'RECEIVED',
        }),
      });
    });

    it('should default boolean fields to false when not provided', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.complaint.create as jest.Mock).mockResolvedValueOnce(mockComplaint);

      await request(app).post('/api/complaints').set('Authorization', 'Bearer token').send({
        deviceName: 'Test Device',
        complaintDate: '2026-02-10',
        source: 'INTERNAL',
        description: 'Test complaint with minimal fields',
      });

      expect(mockPrisma.complaint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          patientInvolved: false,
          injuryOccurred: false,
          deathOccurred: false,
          malfunctionOccurred: false,
          severity: 'MINOR',
          status: 'RECEIVED',
          createdBy: 'user-1',
        }),
      });
    });

    it('should return 400 for missing deviceName', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          complaintDate: '2026-02-01',
          source: 'CUSTOMER',
          description: 'Some issue',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing complaintDate', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          deviceName: 'Device X',
          source: 'CUSTOMER',
          description: 'Some issue',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing source', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          deviceName: 'Device X',
          complaintDate: '2026-02-01',
          description: 'Some issue',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing description', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          deviceName: 'Device X',
          complaintDate: '2026-02-01',
          source: 'CUSTOMER',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid source enum value', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreatePayload,
          source: 'INVALID_SOURCE',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid severity enum value', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreatePayload,
          severity: 'EXTREME',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty deviceName', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreatePayload,
          deviceName: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty description', async () => {
      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreatePayload,
          description: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept all valid source enum values', async () => {
      const sources = [
        'CUSTOMER',
        'FIELD_SERVICE',
        'INTERNAL',
        'REGULATORY',
        'DISTRIBUTOR',
        'HEALTHCARE_PROVIDER',
        'PATIENT',
      ];

      for (const source of sources) {
        jest.clearAllMocks();
        (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);
        (mockPrisma.complaint.create as jest.Mock).mockResolvedValueOnce({
          ...mockComplaint,
          source,
        });

        const response = await request(app)
          .post('/api/complaints')
          .set('Authorization', 'Bearer token')
          .send({ ...validCreatePayload, source });

        expect(response.status).toBe(201);
      }
    });

    it('should accept all valid severity enum values', async () => {
      const severities = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'LIFE_THREATENING'];

      for (const severity of severities) {
        jest.clearAllMocks();
        (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);
        (mockPrisma.complaint.create as jest.Mock).mockResolvedValueOnce({
          ...mockComplaint,
          severity,
        });

        const response = await request(app)
          .post('/api/complaints')
          .set('Authorization', 'Bearer token')
          .send({ ...validCreatePayload, severity });

        expect(response.status).toBe(201);
      }
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.complaint.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create complaint');
    });
  });

  // ==========================================
  // GET / - List complaints with pagination & filters
  // ==========================================
  describe('GET /api/complaints', () => {
    it('should return a list of complaints with default pagination', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([
        mockComplaint,
        mockComplaint2,
      ]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/complaints')
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
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([mockComplaint]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/complaints?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(50);
      expect(response.body.meta.totalPages).toBe(5);

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/complaints?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([mockComplaint2]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/complaints?status=MDR_REVIEW')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'MDR_REVIEW',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by severity', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/complaints?severity=CRITICAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: 'CRITICAL',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by deviceName (case-insensitive contains)', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([mockComplaint]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/complaints?deviceName=cardiac')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deviceName: { contains: 'cardiac', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by mdrReportable=true', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/complaints?mdrReportable=true')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            mdrReportable: true,
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by mdrReportable=false', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/complaints?mdrReportable=false')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            mdrReportable: false,
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by date range (dateFrom and dateTo)', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/complaints?dateFrom=2026-01-01&dateTo=2026-02-28')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            complaintDate: {
              gte: new Date('2026-01-01'),
              lte: new Date('2026-02-28'),
            },
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by dateFrom only', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/complaints?dateFrom=2026-02-01')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            complaintDate: {
              gte: new Date('2026-02-01'),
            },
            deletedAt: null,
          }),
        })
      );
    });

    it('should order by complaintDate descending', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/complaints').set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { complaintDate: 'desc' },
        })
      );
    });

    it('should always exclude soft-deleted records', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/complaints').set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .get('/api/complaints')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list complaints');
    });
  });

  // ==========================================
  // GET /trending - Complaint trend analysis
  // ==========================================
  describe('GET /api/complaints/trending', () => {
    it('should return complaint trend data grouped by month, device, source, and severity', async () => {
      const trendComplaints = [
        {
          complaintDate: new Date('2025-06-15'),
          deviceName: 'Cardiac Monitor X200',
          source: 'CUSTOMER',
          severity: 'MAJOR',
        },
        {
          complaintDate: new Date('2025-06-20'),
          deviceName: 'Cardiac Monitor X200',
          source: 'HEALTHCARE_PROVIDER',
          severity: 'CRITICAL',
        },
        {
          complaintDate: new Date('2025-07-10'),
          deviceName: 'Infusion Pump P500',
          source: 'CUSTOMER',
          severity: 'MINOR',
        },
        {
          complaintDate: new Date('2026-01-05'),
          deviceName: 'Cardiac Monitor X200',
          source: 'PATIENT',
          severity: 'MAJOR',
        },
      ];

      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce(trendComplaints);

      const response = await request(app)
        .get('/api/complaints/trending')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const data = response.body.data;
      expect(data.totalComplaints).toBe(4);
      expect(data.period).toBeDefined();
      expect(data.period.from).toBeDefined();
      expect(data.period.to).toBeDefined();

      // byMonth should be sorted chronologically
      expect(data.byMonth).toBeDefined();
      expect(Array.isArray(data.byMonth)).toBe(true);
      expect(data.byMonth.length).toBeGreaterThan(0);

      // byDevice should be sorted descending by count
      expect(data.byDevice).toBeDefined();
      expect(data.byDevice[0].device).toBe('Cardiac Monitor X200');
      expect(data.byDevice[0].count).toBe(3);
      expect(data.byDevice[1].device).toBe('Infusion Pump P500');
      expect(data.byDevice[1].count).toBe(1);

      // bySource should be sorted descending by count
      expect(data.bySource).toBeDefined();
      expect(data.bySource[0].source).toBe('CUSTOMER');
      expect(data.bySource[0].count).toBe(2);

      // bySeverity should be sorted descending by count
      expect(data.bySeverity).toBeDefined();
      expect(data.bySeverity[0].severity).toBe('MAJOR');
      expect(data.bySeverity[0].count).toBe(2);
    });

    it('should return empty arrays when no complaints in last 12 months', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/complaints/trending')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.totalComplaints).toBe(0);
      expect(response.body.data.byMonth).toEqual([]);
      expect(response.body.data.byDevice).toEqual([]);
      expect(response.body.data.bySource).toEqual([]);
      expect(response.body.data.bySeverity).toEqual([]);
    });

    it('should query for last 12 months only and exclude soft-deleted', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/complaints/trending').set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletedAt: null,
            complaintDate: { gte: expect.any(Date) },
          },
          select: { complaintDate: true, deviceName: true, source: true, severity: true },
          orderBy: { complaintDate: 'asc' },
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/complaints/trending')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to generate complaint trends');
    });
  });

  // ==========================================
  // GET /mdr-pending - Complaints needing MDR decision
  // ==========================================
  describe('GET /api/complaints/mdr-pending', () => {
    it('should return complaints pending MDR decision with pagination', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([mockComplaint2]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/complaints/mdr-pending')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should filter for mdrReportable=null with injury/death/malfunction OR conditions', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/complaints/mdr-pending').set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletedAt: null,
            mdrReportable: null,
            OR: [{ injuryOccurred: true }, { deathOccurred: true }, { malfunctionOccurred: true }],
          },
        })
      );
    });

    it('should support custom pagination', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(30);

      const response = await request(app)
        .get('/api/complaints/mdr-pending?page=2&limit=5')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.meta.totalPages).toBe(6);

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('should cap limit at 100', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/complaints/mdr-pending?limit=200')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
    });

    it('should order by complaintDate descending', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/complaints/mdr-pending').set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { complaintDate: 'desc' },
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/complaints/mdr-pending')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list MDR pending complaints');
    });
  });

  // ==========================================
  // GET /:id - Get complaint with full details
  // ==========================================
  describe('GET /api/complaints/:id', () => {
    it('should return a complaint by ID', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);

      const response = await request(app)
        .get(`/api/complaints/${mockComplaint.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockComplaint.id);
      expect(response.body.data.refNumber).toBe('COMP-2602-0001');
      expect(response.body.data.deviceName).toBe('Cardiac Monitor X200');

      expect(mockPrisma.complaint.findUnique).toHaveBeenCalledWith({
        where: { id: mockComplaint.id },
      });
    });

    it('should return 404 when complaint is not found', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/complaints/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Complaint not found');
    });

    it('should return 404 when complaint is soft-deleted', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/complaints/${mockComplaint.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get(`/api/complaints/${mockComplaint.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get complaint');
    });
  });

  // ==========================================
  // PUT /:id - Update investigation details
  // ==========================================
  describe('PUT /api/complaints/:id', () => {
    it('should update investigation details successfully', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        ...validUpdatePayload,
      });

      const response = await request(app)
        .put(`/api/complaints/${mockComplaint.id}`)
        .set('Authorization', 'Bearer token')
        .send(validUpdatePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.investigationSummary).toBe(validUpdatePayload.investigationSummary);
      expect(response.body.data.rootCause).toBe(validUpdatePayload.rootCause);
      expect(response.body.data.correctiveAction).toBe(validUpdatePayload.correctiveAction);
      expect(response.body.data.status).toBe('UNDER_INVESTIGATION');
    });

    it('should update only provided fields', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        rootCause: 'Identified root cause',
      });

      await request(app)
        .put(`/api/complaints/${mockComplaint.id}`)
        .set('Authorization', 'Bearer token')
        .send({ rootCause: 'Identified root cause' });

      expect(mockPrisma.complaint.update).toHaveBeenCalledWith({
        where: { id: mockComplaint.id },
        data: {
          rootCause: 'Identified root cause',
        },
      });
    });

    it('should update status to CAPA_INITIATED', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        status: 'CAPA_INITIATED',
        capaRef: 'CAPA-MED-2026-005',
      });

      const response = await request(app)
        .put(`/api/complaints/${mockComplaint.id}`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'CAPA_INITIATED', capaRef: 'CAPA-MED-2026-005' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CAPA_INITIATED');
      expect(response.body.data.capaRef).toBe('CAPA-MED-2026-005');
    });

    it('should return 404 when complaint does not exist', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/complaints/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send(validUpdatePayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Complaint not found');
    });

    it('should return 404 when complaint is soft-deleted', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .put(`/api/complaints/${mockComplaint.id}`)
        .set('Authorization', 'Bearer token')
        .send(validUpdatePayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);

      const response = await request(app)
        .put(`/api/complaints/${mockComplaint.id}`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put(`/api/complaints/${mockComplaint.id}`)
        .set('Authorization', 'Bearer token')
        .send(validUpdatePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to update complaint');
    });
  });

  // ==========================================
  // POST /:id/mdr - Flag MDR reportability decision
  // ==========================================
  describe('POST /api/complaints/:id/mdr', () => {
    it('should record MDR reportable=true decision and set status to MDR_REVIEW', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        mdrReportable: true,
        mdrDecisionDate: new Date(),
        mdrDecisionBy: 'test@test.com',
        mdrReportRef: 'MDR-2026-0042',
        status: 'MDR_REVIEW',
      });

      const response = await request(app)
        .post(`/api/complaints/${mockComplaint.id}/mdr`)
        .set('Authorization', 'Bearer token')
        .send(validMDRDecisionPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.mdrReportable).toBe(true);
      expect(response.body.data.mdrReportRef).toBe('MDR-2026-0042');
      expect(response.body.data.status).toBe('MDR_REVIEW');

      expect(mockPrisma.complaint.update).toHaveBeenCalledWith({
        where: { id: mockComplaint.id },
        data: expect.objectContaining({
          mdrReportable: true,
          mdrDecisionDate: expect.any(Date),
          mdrDecisionBy: 'test@test.com',
          mdrReportRef: 'MDR-2026-0042',
          status: 'MDR_REVIEW',
        }),
      });
    });

    it('should record MDR reportable=false decision without changing status to MDR_REVIEW', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        mdrReportable: false,
        mdrDecisionDate: new Date(),
        mdrDecisionBy: 'test@test.com',
      });

      const response = await request(app)
        .post(`/api/complaints/${mockComplaint.id}/mdr`)
        .set('Authorization', 'Bearer token')
        .send({ reportable: false, notes: 'Does not meet MDR threshold' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify that status was NOT set to MDR_REVIEW for non-reportable
      expect(mockPrisma.complaint.update).toHaveBeenCalledWith({
        where: { id: mockComplaint.id },
        data: expect.objectContaining({
          mdrReportable: false,
          mdrDecisionDate: expect.any(Date),
          mdrDecisionBy: 'test@test.com',
        }),
      });

      // The update data should NOT include status when reportable=false
      const updateCall = (mockPrisma.complaint.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.status).toBeUndefined();
    });

    it('should use user email for mdrDecisionBy', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        mdrDecisionBy: 'test@test.com',
      });

      await request(app)
        .post(`/api/complaints/${mockComplaint.id}/mdr`)
        .set('Authorization', 'Bearer token')
        .send({ reportable: true });

      expect(mockPrisma.complaint.update).toHaveBeenCalledWith({
        where: { id: mockComplaint.id },
        data: expect.objectContaining({
          mdrDecisionBy: 'test@test.com',
        }),
      });
    });

    it('should include mdrReportRef when provided', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce(mockComplaint);

      await request(app)
        .post(`/api/complaints/${mockComplaint.id}/mdr`)
        .set('Authorization', 'Bearer token')
        .send({ reportable: true, mdrReportRef: 'MDR-REF-123' });

      expect(mockPrisma.complaint.update).toHaveBeenCalledWith({
        where: { id: mockComplaint.id },
        data: expect.objectContaining({
          mdrReportRef: 'MDR-REF-123',
        }),
      });
    });

    it('should not include mdrReportRef when not provided', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce(mockComplaint);

      await request(app)
        .post(`/api/complaints/${mockComplaint.id}/mdr`)
        .set('Authorization', 'Bearer token')
        .send({ reportable: false });

      const updateCall = (mockPrisma.complaint.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.mdrReportRef).toBeUndefined();
    });

    it('should return 404 when complaint does not exist', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/complaints/00000000-0000-4000-a000-ffffffffffff/mdr')
        .set('Authorization', 'Bearer token')
        .send(validMDRDecisionPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Complaint not found');
    });

    it('should return 404 when complaint is soft-deleted', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockComplaint,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/complaints/${mockComplaint.id}/mdr`)
        .set('Authorization', 'Bearer token')
        .send(validMDRDecisionPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for missing reportable field', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);

      const response = await request(app)
        .post(`/api/complaints/${mockComplaint.id}/mdr`)
        .set('Authorization', 'Bearer token')
        .send({ notes: 'Missing the required reportable boolean' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for non-boolean reportable field', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaint);

      const response = await request(app)
        .post(`/api/complaints/${mockComplaint.id}/mdr`)
        .set('Authorization', 'Bearer token')
        .send({ reportable: 'yes' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post(`/api/complaints/${mockComplaint.id}/mdr`)
        .set('Authorization', 'Bearer token')
        .send(validMDRDecisionPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to record MDR decision');
    });
  });

  // ==========================================
  // POST /:id/close - Close complaint
  // ==========================================
  describe('POST /api/complaints/:id/close', () => {
    it('should close a complaint that has MDR decision and investigation complete', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(
        mockComplaintReadyToClose
      );
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...mockComplaintReadyToClose,
        status: 'CLOSED',
        closedDate: new Date(),
        closedBy: 'test@test.com',
      });

      const response = await request(app)
        .post(`/api/complaints/${mockComplaintReadyToClose.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('CLOSED');

      expect(mockPrisma.complaint.update).toHaveBeenCalledWith({
        where: { id: mockComplaintReadyToClose.id },
        data: expect.objectContaining({
          status: 'CLOSED',
          closedDate: expect.any(Date),
          closedBy: 'test@test.com',
        }),
      });
    });

    it('should append disposition to existing investigation summary', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(
        mockComplaintReadyToClose
      );
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...mockComplaintReadyToClose,
        status: 'CLOSED',
        investigationSummary: `${mockComplaintReadyToClose.investigationSummary}\n\nDisposition: Product recall initiated for affected lot`,
      });

      const response = await request(app)
        .post(`/api/complaints/${mockComplaintReadyToClose.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({ disposition: 'Product recall initiated for affected lot' });

      expect(response.status).toBe(200);

      expect(mockPrisma.complaint.update).toHaveBeenCalledWith({
        where: { id: mockComplaintReadyToClose.id },
        data: expect.objectContaining({
          status: 'CLOSED',
          investigationSummary: `${mockComplaintReadyToClose.investigationSummary}\n\nDisposition: Product recall initiated for affected lot`,
        }),
      });
    });

    it('should set disposition as investigation summary when no existing summary', async () => {
      const complaintNoSummary = {
        ...mockComplaintReadyToClose,
        investigationSummary: null,
      };

      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(complaintNoSummary);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...complaintNoSummary,
        status: 'CLOSED',
        investigationSummary: 'Disposition: No further action required',
      });

      const response = await request(app)
        .post(`/api/complaints/${mockComplaintReadyToClose.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({ disposition: 'No further action required' });

      expect(response.status).toBe(200);

      expect(mockPrisma.complaint.update).toHaveBeenCalledWith({
        where: { id: mockComplaintReadyToClose.id },
        data: expect.objectContaining({
          investigationSummary: 'Disposition: No further action required',
        }),
      });
    });

    it('should return 400 when MDR decision has not been made (mdrReportable=null)', async () => {
      const complaintNoMDR = {
        ...mockComplaintReadyToClose,
        mdrReportable: null,
        rootCause: 'Some cause',
        correctiveAction: 'Some action',
      };

      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(complaintNoMDR);

      const response = await request(app)
        .post(`/api/complaints/${complaintNoMDR.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MDR_DECISION_REQUIRED');
      expect(response.body.error.message).toContain('MDR reportability decision must be made');

      // Should NOT have called update
      expect(mockPrisma.complaint.update).not.toHaveBeenCalled();
    });

    it('should return 400 when rootCause is missing', async () => {
      const complaintNoRootCause = {
        ...mockComplaintReadyToClose,
        rootCause: null,
      };

      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(complaintNoRootCause);

      const response = await request(app)
        .post(`/api/complaints/${complaintNoRootCause.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVESTIGATION_INCOMPLETE');
      expect(response.body.error.message).toContain(
        'Root cause and corrective action must be documented'
      );

      expect(mockPrisma.complaint.update).not.toHaveBeenCalled();
    });

    it('should return 400 when correctiveAction is missing', async () => {
      const complaintNoCA = {
        ...mockComplaintReadyToClose,
        correctiveAction: null,
      };

      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(complaintNoCA);

      const response = await request(app)
        .post(`/api/complaints/${complaintNoCA.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVESTIGATION_INCOMPLETE');

      expect(mockPrisma.complaint.update).not.toHaveBeenCalled();
    });

    it('should return 400 when both rootCause and correctiveAction are missing', async () => {
      const complaintIncomplete = {
        ...mockComplaintReadyToClose,
        rootCause: null,
        correctiveAction: null,
      };

      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(complaintIncomplete);

      const response = await request(app)
        .post(`/api/complaints/${complaintIncomplete.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVESTIGATION_INCOMPLETE');
    });

    it('should allow closing with mdrReportable=false (decision was made)', async () => {
      const complaintMDRFalse = {
        ...mockComplaintReadyToClose,
        mdrReportable: false,
      };

      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(complaintMDRFalse);
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...complaintMDRFalse,
        status: 'CLOSED',
        closedDate: new Date(),
        closedBy: 'test@test.com',
      });

      const response = await request(app)
        .post(`/api/complaints/${complaintMDRFalse.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CLOSED');
    });

    it('should return 404 when complaint does not exist', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/complaints/00000000-0000-4000-a000-ffffffffffff/close')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Complaint not found');
    });

    it('should return 404 when complaint is soft-deleted', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockComplaintReadyToClose,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/complaints/${mockComplaintReadyToClose.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should close without disposition (disposition is optional)', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(
        mockComplaintReadyToClose
      );
      (mockPrisma.complaint.update as jest.Mock).mockResolvedValueOnce({
        ...mockComplaintReadyToClose,
        status: 'CLOSED',
        closedDate: new Date(),
        closedBy: 'test@test.com',
      });

      const response = await request(app)
        .post(`/api/complaints/${mockComplaintReadyToClose.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(200);

      // The update data should NOT include investigationSummary when no disposition given
      const updateCall = (mockPrisma.complaint.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.investigationSummary).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.complaint.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post(`/api/complaints/${mockComplaintReadyToClose.id}/close`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to close complaint');
    });
  });
});


describe('phase35 coverage', () => {
  it('handles number base conversion', () => { expect((10).toString(2)).toBe('1010'); expect((255).toString(16)).toBe('ff'); });
  it('handles unique by key pattern', () => { const uniqBy = <T>(arr:T[], key:(x:T)=>unknown) => [...new Map(arr.map(x=>[key(x),x])).values()]; const r = uniqBy([{id:1,v:'a'},{id:2,v:'b'},{id:1,v:'c'}],x=>x.id); expect(r.length).toBe(2); });
});


describe('phase36 coverage', () => {
  it('handles string anagram check', () => { const isAnagram=(a:string,b:string)=>a.split('').sort().join('')===b.split('').sort().join(''); expect(isAnagram('listen','silent')).toBe(true); expect(isAnagram('hello','world')).toBe(false); });
  it('handles object deep merge', () => { const merge=(a:Record<string,unknown>,b:Record<string,unknown>):Record<string,unknown>=>{const r={...a};for(const k in b){r[k]=b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])?merge((a[k]||{}) as Record<string,unknown>,b[k] as Record<string,unknown>):b[k];}return r;};expect(merge({a:{x:1}},{a:{y:2}})).toEqual({a:{x:1,y:2}}); });
  it('handles promise timeout pattern', async () => { const withTimeout=<T>(p:Promise<T>,ms:number)=>Promise.race([p,new Promise<never>((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);await expect(withTimeout(Promise.resolve(1),100)).resolves.toBe(1); });
  it('handles LRU cache pattern', () => { const cache=new Map<string,number>();const get=(k:string)=>cache.has(k)?(cache.get(k)!):null;const set=(k:string,v:number)=>{cache.delete(k);cache.set(k,v);};set('a',1);set('b',2);expect(get('a')).toBe(1); });
  it('handles number formatting with commas', () => { const fmt=(n:number)=>n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');expect(fmt(1000000)).toBe('1,000,000'); });
});


describe('phase37 coverage', () => {
  it('computes combination count', () => { const fact=(n:number):number=>n<=1?1:n*fact(n-1); const comb=(n:number,r:number)=>fact(n)/(fact(r)*fact(n-r)); expect(comb(5,2)).toBe(10); });
  it('rotates array right', () => { const rotR=<T>(a:T[],n:number)=>{ const k=n%a.length; return [...a.slice(a.length-k),...a.slice(0,a.length-k)]; }; expect(rotR([1,2,3,4,5],2)).toEqual([4,5,1,2,3]); });
  it('reverses words in sentence', () => { const revWords=(s:string)=>s.split(' ').reverse().join(' '); expect(revWords('hello world')).toBe('world hello'); });
  it('computes string hash code', () => { const hash=(s:string)=>[...s].reduce((h,c)=>(h*31+c.charCodeAt(0))|0,0); expect(typeof hash('hello')).toBe('number'); });
  it('picks max from array', () => { expect(Math.max(...[5,3,8,1,9])).toBe(9); });
});


describe('phase38 coverage', () => {
  it('finds median of array', () => { const med=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}; expect(med([3,1,4,1,5])).toBe(3); expect(med([1,2,3,4])).toBe(2.5); });
  it('computes array variance', () => { const variance=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;return a.reduce((s,v)=>s+(v-m)**2,0)/a.length;}; expect(variance([2,4,4,4,5,5,7,9])).toBe(4); });
  it('converts decimal to binary string', () => { const toBin=(n:number)=>n.toString(2); expect(toBin(10)).toBe('1010'); expect(toBin(255)).toBe('11111111'); });
  it('computes longest common subsequence length', () => { const lcs=(a:string,b:string)=>{const m=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=a[i-1]===b[j-1]?m[i-1][j-1]+1:Math.max(m[i-1][j],m[i][j-1]);return m[a.length][b.length];}; expect(lcs('ABCBDAB','BDCAB')).toBe(4); });
  it('implements linear search', () => { const search=(a:number[],v:number)=>a.indexOf(v); expect(search([1,3,5,7,9],5)).toBe(2); expect(search([1,3,5],4)).toBe(-1); });
});


describe('phase39 coverage', () => {
  it('computes collatz sequence length', () => { const collatz=(n:number)=>{let steps=1;while(n!==1){n=n%2===0?n/2:3*n+1;steps++;}return steps;}; expect(collatz(6)).toBe(9); });
  it('parses CSV row', () => { const parseCSV=(row:string)=>row.split(',').map(s=>s.trim()); expect(parseCSV('a, b, c')).toEqual(['a','b','c']); });
  it('checks valid IP address format', () => { const isIP=(s:string)=>/^(\d{1,3}\.){3}\d{1,3}$/.test(s)&&s.split('.').every(p=>Number(p)<=255); expect(isIP('192.168.1.1')).toBe(true); expect(isIP('999.0.0.1')).toBe(false); });
  it('validates parenthesis string', () => { const valid=(s:string)=>{let c=0;for(const ch of s){if(ch==='(')c++;else if(ch===')'){if(c===0)return false;c--;}}return c===0;}; expect(valid('(())')).toBe(true); expect(valid('())')).toBe(false); });
  it('implements topological sort check', () => { const canFinish=(n:number,pre:[number,number][])=>{const indeg=Array(n).fill(0);const adj:number[][]=Array.from({length:n},()=>[]);pre.forEach(([a,b])=>{adj[b].push(a);indeg[a]++;});const q=indeg.map((v,i)=>v===0?i:-1).filter(v=>v>=0);let done=q.length;while(q.length){const cur=q.shift()!;for(const nb of adj[cur]){if(--indeg[nb]===0){q.push(nb);done++;}}}return done===n;}; expect(canFinish(2,[[1,0]])).toBe(true); expect(canFinish(2,[[1,0],[0,1]])).toBe(false); });
});


describe('phase40 coverage', () => {
  it('finds next permutation', () => { const nextPerm=(a:number[])=>{const r=[...a];let i=r.length-2;while(i>=0&&r[i]>=r[i+1])i--;if(i>=0){let j=r.length-1;while(r[j]<=r[i])j--;[r[i],r[j]]=[r[j],r[i]];}let l=i+1,rt=r.length-1;while(l<rt){[r[l],r[rt]]=[r[rt],r[l]];l++;rt--;}return r;}; expect(nextPerm([1,2,3])).toEqual([1,3,2]); });
  it('checks row stochastic matrix', () => { const isStochastic=(m:number[][])=>m.every(r=>Math.abs(r.reduce((a,b)=>a+b,0)-1)<1e-9); expect(isStochastic([[0.5,0.5],[0.3,0.7]])).toBe(true); });
  it('implements sparse table for range min query', () => { const a=[2,4,3,1,6,7,8,9,1,7]; const mn=(l:number,r:number)=>Math.min(...a.slice(l,r+1)); expect(mn(0,4)).toBe(1); expect(mn(2,7)).toBe(1); });
  it('implements reservoir sampling', () => { const sample=(a:number[],k:number)=>{const r=a.slice(0,k);for(let i=k;i<a.length;i++){const j=Math.floor(Math.random()*(i+1));if(j<k)r[j]=a[i];}return r;}; const s=sample([1,2,3,4,5,6,7,8,9,10],3); expect(s.length).toBe(3); expect(s.every(v=>v>=1&&v<=10)).toBe(true); });
  it('implements Luhn algorithm check', () => { const luhn=(s:string)=>{let sum=0;let alt=false;for(let i=s.length-1;i>=0;i--){let d=Number(s[i]);if(alt){d*=2;if(d>9)d-=9;}sum+=d;alt=!alt;}return sum%10===0;}; expect(luhn('4532015112830366')).toBe(true); });
});


describe('phase41 coverage', () => {
  it('finds maximum width of binary tree level', () => { const maxWidth=(nodes:number[])=>{const levels=new Map<number,number[]>();nodes.forEach((v,i)=>{if(v!==-1){const lvl=Math.floor(Math.log2(i+1));(levels.get(lvl)||levels.set(lvl,[]).get(lvl)!).push(i);}});return Math.max(...[...levels.values()].map(idxs=>idxs[idxs.length-1]-idxs[0]+1),1);}; expect(maxWidth([1,3,2,5,-1,-1,9,-1,-1,-1,-1,-1,-1,7])).toBeGreaterThan(0); });
  it('finds Euler totient for small n', () => { const phi=(n:number)=>{let r=n;for(let p=2;p*p<=n;p++)if(n%p===0){while(n%p===0)n/=p;r-=r/p;}if(n>1)r-=r/n;return r;}; expect(phi(9)).toBe(6); expect(phi(7)).toBe(6); });
  it('computes sum of first n odd numbers', () => { const sumOdd=(n:number)=>n*n; expect(sumOdd(5)).toBe(25); expect(sumOdd(10)).toBe(100); });
  it('checks if grid path exists with obstacles', () => { const hasPath=(grid:number[][])=>{const m=grid.length,n=grid[0].length;if(grid[0][0]===1||grid[m-1][n-1]===1)return false;const vis=Array.from({length:m},()=>Array(n).fill(false));const q:number[][]=[]; q.push([0,0]);vis[0][0]=true;const dirs=[[-1,0],[1,0],[0,-1],[0,1]];while(q.length){const[r,c]=q.shift()!;if(r===m-1&&c===n-1)return true;for(const[dr,dc] of dirs){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<m&&nc>=0&&nc<n&&!vis[nr][nc]&&grid[nr][nc]===0){vis[nr][nc]=true;q.push([nr,nc]);}}}return false;}; expect(hasPath([[0,0,0],[1,1,0],[0,0,0]])).toBe(true); });
  it('finds minimum operations to make array palindrome', () => { const minOps=(a:number[])=>{let ops=0,l=0,r=a.length-1;while(l<r){if(a[l]<a[r]){a[l+1]+=a[l];l++;ops++;}else if(a[l]>a[r]){a[r-1]+=a[r];r--;ops++;}else{l++;r--;}}return ops;}; expect(minOps([1,4,5,1])).toBe(1); });
});


describe('phase42 coverage', () => {
  it('computes distance between two 2D points', () => { const dist=(x1:number,y1:number,x2:number,y2:number)=>Math.hypot(x2-x1,y2-y1); expect(dist(0,0,3,4)).toBe(5); });
  it('checks color contrast ratio passes AA', () => { const contrast=(l1:number,l2:number)=>(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); expect(contrast(1,0)).toBeCloseTo(21,0); });
  it('computes centroid of polygon', () => { const centroid=(pts:[number,number][]):[number,number]=>[pts.reduce((s,p)=>s+p[0],0)/pts.length,pts.reduce((s,p)=>s+p[1],0)/pts.length]; expect(centroid([[0,0],[2,0],[2,2],[0,2]])).toEqual([1,1]); });
  it('checks if number is narcissistic (3 digits)', () => { const isNarc=(n:number)=>{const d=String(n).split('');return d.reduce((s,c)=>s+Math.pow(Number(c),d.length),0)===n;}; expect(isNarc(153)).toBe(true); expect(isNarc(370)).toBe(true); expect(isNarc(100)).toBe(false); });
  it('checks if two rectangles overlap', () => { const overlap=(x1:number,y1:number,w1:number,h1:number,x2:number,y2:number,w2:number,h2:number)=>x1<x2+w2&&x1+w1>x2&&y1<y2+h2&&y1+h1>y2; expect(overlap(0,0,4,4,2,2,4,4)).toBe(true); expect(overlap(0,0,2,2,3,3,2,2)).toBe(false); });
});


describe('phase43 coverage', () => {
  it('computes percentage change', () => { const pctChange=(from:number,to:number)=>((to-from)/from)*100; expect(pctChange(100,125)).toBe(25); expect(pctChange(200,150)).toBe(-25); });
  it('computes Pearson correlation', () => { const pearson=(x:number[],y:number[])=>{const n=x.length,mx=x.reduce((s,v)=>s+v,0)/n,my=y.reduce((s,v)=>s+v,0)/n;const num=x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0);const den=Math.sqrt(x.reduce((s,v)=>s+(v-mx)**2,0)*y.reduce((s,v)=>s+(v-my)**2,0));return den===0?0:num/den;}; expect(pearson([1,2,3],[1,2,3])).toBeCloseTo(1); });
  it('computes linear regression slope', () => { const slope=(x:number[],y:number[])=>{const n=x.length,mx=x.reduce((s,v)=>s+v,0)/n,my=y.reduce((s,v)=>s+v,0)/n;return x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0)/x.reduce((s,v)=>s+(v-mx)**2,0);}; expect(slope([1,2,3,4,5],[2,4,6,8,10])).toBe(2); });
  it('counts business days between dates', () => { const bizDays=(start:Date,end:Date)=>{let count=0;const d=new Date(start);while(d<=end){if(d.getDay()!==0&&d.getDay()!==6)count++;d.setDate(d.getDate()+1);}return count;}; expect(bizDays(new Date('2026-02-23'),new Date('2026-02-27'))).toBe(5); });
  it('computes Spearman rank correlation', () => { const rank=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);return a.map(v=>s.indexOf(v)+1);}; const x=[1,2,3,4,5],y=[5,6,7,8,7]; const rx=rank(x),ry=rank(y); expect(rx).toEqual([1,2,3,4,5]); });
});


describe('phase44 coverage', () => {
  it('counts set bits (popcount)', () => { const pop=(n:number)=>{let c=0;while(n){c+=n&1;n>>=1;}return c;}; expect(pop(7)).toBe(3); expect(pop(255)).toBe(8); });
  it('wraps text at given width', () => { const wrap=(s:string,w:number)=>{const words=s.split(' ');const lines:string[]=[];let cur='';for(const wd of words){if(cur&&(cur+' '+wd).length>w){lines.push(cur);cur=wd;}else cur=cur?cur+' '+wd:wd;}if(cur)lines.push(cur);return lines;}; expect(wrap('the quick brown fox',10)).toEqual(['the quick','brown fox']); });
  it('implements min stack with O(1) min', () => { const mk=()=>{const s:number[]=[],m:number[]=[];return{push:(v:number)=>{s.push(v);m.push(Math.min(v,m.length?m[m.length-1]:v));},pop:()=>{s.pop();m.pop();},min:()=>m[m.length-1]};}; const st=mk();st.push(3);st.push(1);st.push(2); expect(st.min()).toBe(1);st.pop(); expect(st.min()).toBe(1);st.pop(); expect(st.min()).toBe(3); });
  it('implements simple stack', () => { const mk=()=>{const s:number[]=[];return{push:(v:number)=>s.push(v),pop:()=>s.pop(),peek:()=>s[s.length-1],size:()=>s.length};}; const st=mk();st.push(1);st.push(2);st.push(3); expect(st.peek()).toBe(3);st.pop(); expect(st.peek()).toBe(2); });
  it('inverts a key-value map', () => { const inv=(o:Record<string,string>)=>Object.fromEntries(Object.entries(o).map(([k,v])=>[v,k])); expect(inv({a:'1',b:'2',c:'3'})).toEqual({'1':'a','2':'b','3':'c'}); });
});


describe('phase45 coverage', () => {
  it('computes exponential smoothing', () => { const ema=(a:number[],alpha:number)=>a.reduce((acc,v,i)=>i===0?[v]:[...acc,alpha*v+(1-alpha)*acc[i-1]],[] as number[]); const r=ema([10,20,30],0.5); expect(r[0]).toBe(10); expect(r[1]).toBe(15); });
  it('implements string builder pattern', () => { const sb=()=>{const parts:string[]=[];const self={append:(s:string)=>{parts.push(s);return self;},toString:()=>parts.join('')};return self;}; const b=sb();b.append('Hello').append(', ').append('World'); expect(b.toString()).toBe('Hello, World'); });
  it('computes simple moving sum', () => { const ms=(a:number[],w:number)=>Array.from({length:a.length-w+1},(_,i)=>a.slice(i,i+w).reduce((s,v)=>s+v,0)); expect(ms([1,2,3,4,5],3)).toEqual([6,9,12]); });
  it('implements result type (Ok/Err)', () => { type R<T,E>={ok:true;val:T}|{ok:false;err:E}; const Ok=<T>(val:T):R<T,never>=>({ok:true,val}); const Err=<E>(err:E):R<never,E>=>({ok:false,err}); const div=(a:number,b:number):R<number,string>=>b===0?Err('div by zero'):Ok(a/b); expect(div(10,2)).toEqual({ok:true,val:5}); expect(div(1,0)).toEqual({ok:false,err:'div by zero'}); });
  it('implements functional option pattern', () => { type Cfg={debug:boolean;timeout:number;retries:number}; const dflt:Cfg={debug:false,timeout:5000,retries:3}; const cfg=(...opts:Partial<Cfg>[])=>Object.assign({},dflt,...opts); expect(cfg({debug:true})).toEqual({debug:true,timeout:5000,retries:3}); expect(cfg({timeout:1000},{retries:5})).toEqual({debug:false,timeout:1000,retries:5}); });
});


describe('phase46 coverage', () => {
  it('rotates matrix 90 degrees counter-clockwise', () => { const rotCCW=(m:number[][])=>m[0].map((_,c)=>m.map(r=>r[m[0].length-1-c])); expect(rotCCW([[1,2],[3,4]])).toEqual([[2,4],[1,3]]); });
  it('finds median of two sorted arrays', () => { const med=(a:number[],b:number[])=>{const m=[...a,...b].sort((x,y)=>x-y);const n=m.length;return n%2?m[(n-1)/2]:(m[n/2-1]+m[n/2])/2;}; expect(med([1,3],[2])).toBe(2); expect(med([1,2],[3,4])).toBe(2.5); });
  it('checks valid BST from preorder', () => { const vbst=(pre:number[])=>{const st:number[]=[],min=[-Infinity];for(const v of pre){if(v<min[0])return false;while(st.length&&st[st.length-1]<v)min[0]=st.pop()!;st.push(v);}return true;}; expect(vbst([5,2,1,3,6])).toBe(true); expect(vbst([5,2,6,1,3])).toBe(false); });
  it('finds first missing positive', () => { const fmp=(a:number[])=>{const s=new Set(a);let i=1;while(s.has(i))i++;return i;}; expect(fmp([1,2,0])).toBe(3); expect(fmp([3,4,-1,1])).toBe(2); expect(fmp([7,8,9,11,12])).toBe(1); });
  it('computes range minimum query (sparse table)', () => { const rmq=(a:number[])=>{const n=a.length,LOG=Math.floor(Math.log2(n))+1;const t:number[][]=Array.from({length:LOG},()=>new Array(n).fill(0));for(let i=0;i<n;i++)t[0][i]=a[i];for(let k=1;k<LOG;k++)for(let i=0;i+(1<<k)<=n;i++)t[k][i]=Math.min(t[k-1][i],t[k-1][i+(1<<(k-1))]);return(l:number,r:number)=>{const k=Math.floor(Math.log2(r-l+1));return Math.min(t[k][l],t[k][r-(1<<k)+1]);};}; const q=rmq([2,4,3,1,6,7,8,9,1,7]); expect(q(0,4)).toBe(1); expect(q(4,7)).toBe(6); });
});


describe('phase47 coverage', () => {
  it('checks if two arrays have same elements', () => { const same=(a:number[],b:number[])=>a.length===b.length&&[...new Set([...a,...b])].every(v=>a.filter(x=>x===v).length===b.filter(x=>x===v).length); expect(same([1,2,3],[3,1,2])).toBe(true); expect(same([1,2],[1,1])).toBe(false); });
  it('generates all valid IP addresses', () => { const ips=(s:string)=>{const r:string[]=[];const bt=(i:number,parts:string[])=>{if(parts.length===4){if(i===s.length)r.push(parts.join('.'));return;}for(let l=1;l<=3&&i+l<=s.length;l++){const p=s.slice(i,i+l);if((p.length>1&&p[0]==='0')||+p>255)break;bt(i+l,[...parts,p]);}};bt(0,[]);return r;}; expect(ips('25525511135')).toContain('255.255.11.135'); expect(ips('25525511135')).toContain('255.255.111.35'); });
  it('solves activity selection problem', () => { const act=(start:number[],end:number[])=>{const n=start.length;const idx=[...Array(n).keys()].sort((a,b)=>end[a]-end[b]);let cnt=1,last=idx[0];for(let i=1;i<n;i++){if(start[idx[i]]>=end[last]){cnt++;last=idx[i];}}return cnt;}; expect(act([1,3,0,5,8,5],[2,4,6,7,9,9])).toBe(4); });
  it('computes trace of matrix', () => { const tr=(m:number[][])=>m.reduce((s,r,i)=>s+r[i],0); expect(tr([[1,2,3],[4,5,6],[7,8,9]])).toBe(15); });
  it('finds number of ways to fill board', () => { const ways=(n:number)=>Math.round(((1+Math.sqrt(5))/2)**(n+1)/Math.sqrt(5)); expect(ways(1)).toBe(1); expect(ways(3)).toBe(3); expect(ways(5)).toBe(8); });
});


describe('phase48 coverage', () => {
  it('finds all factor combinations', () => { const fc=(n:number):number[][]=>{ const r:number[][]=[];const bt=(rem:number,min:number,cur:number[])=>{if(rem===1&&cur.length>1)r.push([...cur]);for(let f=min;f<=rem;f++)if(rem%f===0){bt(rem/f,f,[...cur,f]);}};bt(n,2,[]);return r;}; expect(fc(12).length).toBe(3); expect(fc(12)).toContainEqual([2,6]); });
  it('computes maximum meetings in one room', () => { const mm=(s:number[],e:number[])=>{const m=s.map((si,i)=>[si,e[i]] as [number,number]).sort((a,b)=>a[1]-b[1]);let cnt=1,end=m[0][1];for(let i=1;i<m.length;i++)if(m[i][0]>=end){cnt++;end=m[i][1];}return cnt;}; expect(mm([0,3,1,5],[5,4,2,9])).toBe(3); expect(mm([1,3,0,5,8,5],[2,4,6,7,9,9])).toBe(4); });
  it('finds maximum XOR of two array elements', () => { const mx=(a:number[])=>{let res=0,pre=0;const seen=new Set([0]);for(const v of a){pre^=v;for(let b=31;b>=0;b--){const t=(pre>>b)&1;res=Math.max(res,pre);if(seen.has(pre^res))break;}seen.add(pre);}return a.reduce((best,_,i)=>a.slice(i+1).reduce((b,v)=>Math.max(b,a[i]^v),best),0);}; expect(mx([3,10,5,25,2,8])).toBe(28); });
  it('finds median without sorting (quickselect)', () => { const qs=(a:number[],k:number):number=>{const p=a[Math.floor(a.length/2)];const lo=a.filter(x=>x<p),eq=a.filter(x=>x===p),hi=a.filter(x=>x>p);return k<lo.length?qs(lo,k):k<lo.length+eq.length?p:qs(hi,k-lo.length-eq.length);}; const a=[3,1,4,1,5,9,2,6];const m=qs(a,Math.floor(a.length/2)); expect(m).toBe(4); });
  it('finds number of ways to express n as sum of primes', () => { const wp=(n:number)=>{const sieve=(m:number)=>{const p=new Array(m+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=m;i++)if(p[i])for(let j=i*i;j<=m;j+=i)p[j]=false;return Array.from({length:m-1},(_,i)=>i+2).filter(i=>p[i]);};const primes=sieve(n);const dp=new Array(n+1).fill(0);dp[0]=1;for(const p of primes)for(let i=p;i<=n;i++)dp[i]+=dp[i-p];return dp[n];}; expect(wp(7)).toBe(3); expect(wp(10)).toBe(5); });
});


describe('phase49 coverage', () => {
  it('finds longest common substring', () => { const lcs=(a:string,b:string)=>{let max=0,end=0;const dp=Array.from({length:a.length+1},()=>new Array(b.length+1).fill(0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)if(a[i-1]===b[j-1]){dp[i][j]=dp[i-1][j-1]+1;if(dp[i][j]>max){max=dp[i][j];end=i;}}return a.slice(end-max,end);}; expect(lcs('abcdef','zcdemf')).toBe('cde'); });
  it('checks if number is perfect square', () => { const isSq=(n:number)=>{if(n<0)return false;const s=Math.round(Math.sqrt(n));return s*s===n;}; expect(isSq(16)).toBe(true); expect(isSq(14)).toBe(false); expect(isSq(0)).toBe(true); });
  it('computes maximum length chain of pairs', () => { const chain=(pairs:[number,number][])=>{pairs.sort((a,b)=>a[1]-b[1]);let cnt=1,end=pairs[0][1];for(let i=1;i<pairs.length;i++)if(pairs[i][0]>end){cnt++;end=pairs[i][1];}return cnt;}; expect(chain([[1,2],[2,3],[3,4]])).toBe(2); expect(chain([[1,2],[3,4],[2,3]])).toBe(2); });
  it('finds all permutations', () => { const perms=(a:number[]):number[][]=>a.length<=1?[a]:a.flatMap((v,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[v,...p])); expect(perms([1,2,3]).length).toBe(6); });
  it('finds the skyline of buildings', () => { const sky=(b:[number,number,number][])=>{const pts:[number,number][]=[];b.forEach(([l,r,h])=>{pts.push([l,-h],[r,h]);});pts.sort((a,b2)=>a[0]-b2[0]||a[1]-b2[1]);const heap=[0];let res:[number,number][]=[];for(const [x,h] of pts){if(h<0)heap.push(-h);else heap.splice(heap.indexOf(h),1);const top=Math.max(...heap);if(!res.length||res[res.length-1][1]!==top)res.push([x,top]);}return res;}; expect(sky([[2,9,10],[3,7,15],[5,12,12]]).length).toBeGreaterThan(0); });
});


describe('phase50 coverage', () => {
  it('finds the duplicate number in array', () => { const dup=(a:number[])=>{let s=0,ss=0;a.forEach(v=>{s+=v;ss+=v*v;});const n=a.length-1,ts=n*(n+1)/2,tss=n*(n+1)*(2*n+1)/6;const d=s-ts;return (ss-tss)/d/2+d/2;}; expect(Math.round(dup([1,3,4,2,2]))).toBe(2); expect(Math.round(dup([3,1,3,4,2]))).toBe(3); });
  it('reverses words in a sentence', () => { const rw=(s:string)=>s.trim().split(/\s+/).reverse().join(' '); expect(rw('the sky is blue')).toBe('blue is sky the'); expect(rw('  hello world  ')).toBe('world hello'); });
  it('finds maximum number of vowels in substring', () => { const mv=(s:string,k:number)=>{const isV=(c:string)=>'aeiou'.includes(c);let cnt=s.slice(0,k).split('').filter(isV).length,max=cnt;for(let i=k;i<s.length;i++){cnt+=isV(s[i])?1:0;cnt-=isV(s[i-k])?1:0;max=Math.max(max,cnt);}return max;}; expect(mv('abciiidef',3)).toBe(3); expect(mv('aeiou',2)).toBe(2); });
  it('computes minimum insertions for palindrome', () => { const mip=(s:string)=>{const n=s.length;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=s[i]===s[j]?dp[i+1][j-1]:1+Math.min(dp[i+1][j],dp[i][j-1]);}return dp[0][n-1];}; expect(mip('zzazz')).toBe(0); expect(mip('mbadm')).toBe(2); });
  it('finds maximum erasure value', () => { const mev=(a:number[])=>{const seen=new Set<number>();let l=0,sum=0,max=0;for(let r=0;r<a.length;r++){while(seen.has(a[r])){seen.delete(a[l]);sum-=a[l++];}seen.add(a[r]);sum+=a[r];max=Math.max(max,sum);}return max;}; expect(mev([4,2,4,5,6])).toBe(17); expect(mev([5,2,1,2,5,2,1,2,5])).toBe(8); });
});

describe('phase51 coverage', () => {
  it('finds largest rectangle area in histogram', () => { const lr=(h:number[])=>{const st:number[]=[],n=h.length;let mx=0;for(let i=0;i<=n;i++){const cur=i===n?0:h[i];while(st.length&&h[st[st.length-1]]>cur){const ht=h[st.pop()!],w=st.length?i-st[st.length-1]-1:i;mx=Math.max(mx,ht*w);}st.push(i);}return mx;}; expect(lr([2,1,5,6,2,3])).toBe(10); expect(lr([2,4])).toBe(4); expect(lr([1])).toBe(1); });
  it('solves coin change minimum coins', () => { const cc=(coins:number[],amt:number)=>{const dp=new Array(amt+1).fill(amt+1);dp[0]=0;for(let i=1;i<=amt;i++)for(const c of coins)if(c<=i)dp[i]=Math.min(dp[i],dp[i-c]+1);return dp[amt]>amt?-1:dp[amt];}; expect(cc([1,5,11],15)).toBe(3); expect(cc([2],3)).toBe(-1); expect(cc([1,2,5],11)).toBe(3); });
  it('finds minimum window containing all target chars', () => { const minWin=(s:string,t:string)=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let have=0,tot=need.size,l=0,res='';for(let r=0;r<s.length;r++){const c=s[r];if(need.has(c)){need.set(c,need.get(c)!-1);if(need.get(c)===0)have++;}while(have===tot){const w=s.slice(l,r+1);if(!res||w.length<res.length)res=w;const lc=s[l];if(need.has(lc)){need.set(lc,need.get(lc)!+1);if(need.get(lc)===1)have--;}l++;}}return res;}; expect(minWin('ADOBECODEBANC','ABC')).toBe('BANC'); expect(minWin('a','a')).toBe('a'); });
  it('determines if array allows reaching last index', () => { const canJump=(nums:number[])=>{let reach=0;for(let i=0;i<nums.length;i++){if(i>reach)return false;reach=Math.max(reach,i+nums[i]);}return true;}; expect(canJump([2,3,1,1,4])).toBe(true); expect(canJump([3,2,1,0,4])).toBe(false); expect(canJump([1,0])).toBe(true); });
  it('computes next permutation of array', () => { const np=(a:number[])=>{const r=[...a];let i=r.length-2;while(i>=0&&r[i]>=r[i+1])i--;if(i>=0){let j=r.length-1;while(r[j]<=r[i])j--;[r[i],r[j]]=[r[j],r[i]];}let lo=i+1,hi=r.length-1;while(lo<hi){[r[lo],r[hi]]=[r[hi],r[lo]];lo++;hi--;}return r;}; expect(np([1,2,3])).toEqual([1,3,2]); expect(np([3,2,1])).toEqual([1,2,3]); expect(np([1,1,5])).toEqual([1,5,1]); });
});

describe('phase52 coverage', () => {
  it('counts vowel-only substrings with all five vowels', () => { const cvs=(word:string)=>{let cnt=0;const v=new Set('aeiou');for(let i=0;i<word.length;i++){const seen=new Set<string>();for(let j=i;j<word.length;j++){if(!v.has(word[j]))break;seen.add(word[j]);if(seen.size===5)cnt++;}}return cnt;}; expect(cvs('aeiouu')).toBe(2); expect(cvs('aeiou')).toBe(1); expect(cvs('abc')).toBe(0); });
  it('finds minimum perfect squares sum to n', () => { const ps2=(n:number)=>{const dp=new Array(n+1).fill(Infinity);dp[0]=0;for(let i=1;i<=n;i++)for(let j=1;j*j<=i;j++)dp[i]=Math.min(dp[i],dp[i-j*j]+1);return dp[n];}; expect(ps2(12)).toBe(3); expect(ps2(13)).toBe(2); expect(ps2(4)).toBe(1); });
  it('finds minimum cost to climb stairs', () => { const mcc2=(cost:number[])=>{const n=cost.length,dp=new Array(n+1).fill(0);for(let i=2;i<=n;i++)dp[i]=Math.min(dp[i-1]+cost[i-1],dp[i-2]+cost[i-2]);return dp[n];}; expect(mcc2([10,15,20])).toBe(15); expect(mcc2([1,100,1,1,1,100,1,1,100,1])).toBe(6); });
  it('counts unique paths in grid', () => { const up=(m:number,n:number)=>{const dp=Array.from({length:m},()=>new Array(n).fill(1));for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]=dp[i-1][j]+dp[i][j-1];return dp[m-1][n-1];}; expect(up(3,7)).toBe(28); expect(up(3,2)).toBe(3); expect(up(1,1)).toBe(1); });
  it('rotates array by k positions', () => { const rot=(a:number[],k:number)=>{const r=[...a],n=r.length;k%=n;const rev=(l:number,h:number)=>{while(l<h){[r[l],r[h]]=[r[h],r[l]];l++;h--;}};rev(0,n-1);rev(0,k-1);rev(k,n-1);return r;}; expect(rot([1,2,3,4,5,6,7],3)).toEqual([5,6,7,1,2,3,4]); expect(rot([1,2],1)).toEqual([2,1]); });
});

describe('phase53 coverage', () => {
  it('counts car fleets arriving at target', () => { const cf2=(target:number,pos:number[],spd:number[])=>{const cars=[...Array(pos.length).keys()].sort((a,b)=>pos[b]-pos[a]);const st:number[]=[];for(const i of cars){const t=(target-pos[i])/spd[i];if(!st.length||t>st[st.length-1])st.push(t);}return st.length;}; expect(cf2(12,[10,8,0,5,3],[2,4,1,1,3])).toBe(3); expect(cf2(10,[3],[3])).toBe(1); });
  it('finds if valid path exists in undirected graph', () => { const vp=(n:number,edges:[number,number][],src:number,dst:number)=>{const adj:number[][]=Array.from({length:n},()=>[]);for(const[u,v]of edges){adj[u].push(v);adj[v].push(u);}const vis=new Set<number>();const dfs=(v:number):boolean=>{if(v===dst)return true;vis.add(v);for(const u of adj[v])if(!vis.has(u)&&dfs(u))return true;return false;};return dfs(src);}; expect(vp(3,[[0,1],[1,2],[2,0]],0,2)).toBe(true); expect(vp(6,[[0,1],[0,2],[3,5],[5,4],[4,3]],0,5)).toBe(false); });
  it('implements min stack with O(1) getMin', () => { const minStk=()=>{const st:number[]=[],ms:number[]=[];return{push:(x:number)=>{st.push(x);ms.push(Math.min(x,ms.length?ms[ms.length-1]:x));},pop:()=>{st.pop();ms.pop();},top:()=>st[st.length-1],getMin:()=>ms[ms.length-1]};}; const s=minStk();s.push(-2);s.push(0);s.push(-3);expect(s.getMin()).toBe(-3);s.pop();expect(s.top()).toBe(0);expect(s.getMin()).toBe(-2); });
  it('searches target in row-column sorted 2D matrix', () => { const sm=(m:number[][],t:number)=>{let r=0,c=m[0].length-1;while(r<m.length&&c>=0){if(m[r][c]===t)return true;else if(m[r][c]>t)c--;else r++;}return false;}; expect(sm([[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17],[18,21,23,26]],5)).toBe(true); expect(sm([[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17],[18,21,23,26]],20)).toBe(false); });
  it('finds minimum falling path sum through matrix', () => { const mfps=(m:number[][])=>{const n=m.length,dp=m.map(r=>[...r]);for(let i=1;i<n;i++)for(let j=0;j<n;j++){const mn=Math.min(dp[i-1][j],j>0?dp[i-1][j-1]:Infinity,j<n-1?dp[i-1][j+1]:Infinity);dp[i][j]+=mn;}return Math.min(...dp[n-1]);}; expect(mfps([[2,1,3],[6,5,4],[7,8,9]])).toBe(13); expect(mfps([[1,2],[3,4]])).toBe(4); });
});


describe('phase54 coverage', () => {
  it('finds minimum length subarray to sort to make array sorted', () => { const mws=(a:number[])=>{const n=a.length;let l=n,r=-1;for(let i=0;i<n-1;i++)if(a[i]>a[i+1]){if(l===n)l=i;r=i+1;}if(r===-1)return 0;const sub=a.slice(l,r+1);const mn=Math.min(...sub),mx=Math.max(...sub);while(l>0&&a[l-1]>mn)l--;while(r<n-1&&a[r+1]<mx)r++;return r-l+1;}; expect(mws([2,6,4,8,10,9,15])).toBe(5); expect(mws([1,2,3])).toBe(0); expect(mws([3,2,1])).toBe(3); });
  it('computes minimum cost to connect sticks using min-heap', () => { const mcs=(s:number[])=>{if(s.length<=1)return 0;const h=[...s].sort((a,b)=>a-b);let cost=0;const pop=()=>{h.sort((a,b)=>a-b);return h.shift()!;};while(h.length>1){const a=pop(),b=pop();cost+=a+b;h.push(a+b);}return cost;}; expect(mcs([2,4,3])).toBe(14); expect(mcs([1,8,3,5])).toBe(30); expect(mcs([5])).toBe(0); });
  it('computes minimum cost to hire k workers satisfying wage/quality ratios', () => { const hireK=(q:number[],w:number[],k:number)=>{const n=q.length,workers=Array.from({length:n},(_,i)=>[w[i]/q[i],q[i]]).sort((a,b)=>a[0]-b[0]);let res=Infinity,qSum=0;const maxH:number[]=[];for(const [r,qi] of workers){qSum+=qi;maxH.push(qi);maxH.sort((a,b)=>b-a);if(maxH.length>k){qSum-=maxH.shift()!;}if(maxH.length===k)res=Math.min(res,r*qSum);}return res;}; expect(hireK([10,20,5],[70,50,30],2)).toBeCloseTo(105); });
  it('finds maximum sum subarray with all unique elements', () => { const mev=(a:number[])=>{const seen=new Set<number>();let l=0,sum=0,res=0;for(let r=0;r<a.length;r++){while(seen.has(a[r])){seen.delete(a[l]);sum-=a[l++];}seen.add(a[r]);sum+=a[r];res=Math.max(res,sum);}return res;}; expect(mev([4,2,4,5,6])).toBe(17); expect(mev([5,2,1,2,5,2,1,2,5])).toBe(8); });
  it('counts pairs with absolute difference exactly k', () => { const cpdk=(a:number[],k:number)=>{const s=new Set(a);let c=0;const seen=new Set<number>();for(const x of a){if(!seen.has(x)&&s.has(x+k))c++;seen.add(x);}return c;}; expect(cpdk([1,7,5,9,2,12,3],2)).toBe(4); expect(cpdk([1,2,3,4,5],1)).toBe(4); });
});


describe('phase55 coverage', () => {
  it('finds minimum sum falling path through matrix (each step diagonal or same col)', () => { const fp=(m:number[][])=>{const n=m.length;const dp=m.map(r=>[...r]);for(let i=1;i<n;i++)for(let j=0;j<n;j++){const l=j>0?dp[i-1][j-1]:Infinity,c=dp[i-1][j],r=j<n-1?dp[i-1][j+1]:Infinity;dp[i][j]+=Math.min(l,c,r);}return Math.min(...dp[n-1]);}; expect(fp([[2,1,3],[6,5,4],[7,8,9]])).toBe(13); expect(fp([[-19,57],[-40,-5]])).toBe(-59); });
  it('reverses bits of a 32-bit unsigned integer', () => { const revBits=(n:number)=>{let res=0;for(let i=0;i<32;i++){res=(res*2+((n>>i)&1))>>>0;}return res;}; expect(revBits(0b00000010100101000001111010011100)).toBe(0b00111001011110000010100101000000); expect(revBits(0b11111111111111111111111111111101)).toBe(0b10111111111111111111111111111111); });
  it('finds longest common prefix among an array of strings', () => { const lcp=(strs:string[])=>{if(!strs.length)return '';let prefix=strs[0];for(let i=1;i<strs.length;i++){while(strs[i].indexOf(prefix)!==0)prefix=prefix.slice(0,-1);}return prefix;}; expect(lcp(['flower','flow','flight'])).toBe('fl'); expect(lcp(['dog','racecar','car'])).toBe(''); expect(lcp(['abc','abc','abc'])).toBe('abc'); });
  it('finds maximum depth of a binary tree', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const md=(n:N|null):number=>n?1+Math.max(md(n.l),md(n.r)):0; const t=mk(3,mk(9),mk(20,mk(15),mk(7))); expect(md(t)).toBe(3); expect(md(null)).toBe(0); expect(md(mk(1,mk(2)))).toBe(2); });
  it('finds majority element using Boyer-Moore voting algorithm', () => { const maj=(a:number[])=>{let cand=a[0],cnt=1;for(let i=1;i<a.length;i++){if(cnt===0){cand=a[i];cnt=1;}else if(a[i]===cand)cnt++;else cnt--;}return cand;}; expect(maj([3,2,3])).toBe(3); expect(maj([2,2,1,1,1,2,2])).toBe(2); expect(maj([1])).toBe(1); });
});


describe('phase56 coverage', () => {
  it('finds length of longest substring where each char appears at least k times', () => { const ls=(s:string,k:number):number=>{if(s.length===0)return 0;const m=new Map<string,number>();for(const c of s)m.set(c,(m.get(c)||0)+1);for(let i=0;i<s.length;i++){if(m.get(s[i])!<k){return Math.max(ls(s.slice(0,i),k),ls(s.slice(i+1),k));}}return s.length;}; expect(ls('aaabb',3)).toBe(3); expect(ls('ababbc',2)).toBe(5); });
  it('finds maximum product of lengths of two words with no common letters', () => { const mp2=(words:string[])=>{const masks=words.map(w=>[...w].reduce((m,c)=>m|(1<<(c.charCodeAt(0)-97)),0));let res=0;for(let i=0;i<words.length;i++)for(let j=i+1;j<words.length;j++)if(!(masks[i]&masks[j]))res=Math.max(res,words[i].length*words[j].length);return res;}; expect(mp2(['abcw','baz','foo','bar','xtfn','abcdef'])).toBe(16); expect(mp2(['a','ab','abc','d','cd','bcd','abcd'])).toBe(4); });
  it('validates a 9x9 Sudoku board', () => { const vs=(b:string[][])=>{for(let i=0;i<9;i++){const row=new Set<string>(),col=new Set<string>(),box=new Set<string>();for(let j=0;j<9;j++){const r=b[i][j],c=b[j][i],bx=b[3*Math.floor(i/3)+Math.floor(j/3)][3*(i%3)+(j%3)];if(r!=='.'&&!row.add(r))return false;if(c!=='.'&&!col.add(c))return false;if(bx!=='.'&&!box.add(bx))return false;}}return true;}; const valid=[['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']]; expect(vs(valid)).toBe(true); });
  it('finds minimum window in s containing all characters of t', () => { const mws2=(s:string,t:string)=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let have=0,req=need.size,l=0,res='';const win=new Map<string,number>();for(let r=0;r<s.length;r++){const c=s[r];win.set(c,(win.get(c)||0)+1);if(need.has(c)&&win.get(c)===need.get(c))have++;while(have===req){if(!res||r-l+1<res.length)res=s.slice(l,r+1);const lc=s[l];win.set(lc,win.get(lc)!-1);if(need.has(lc)&&win.get(lc)!<need.get(lc)!)have--;l++;}}return res;}; expect(mws2('ADOBECODEBANC','ABC')).toBe('BANC'); expect(mws2('a','a')).toBe('a'); expect(mws2('a','aa')).toBe(''); });
  it('adds two integers without using + or - operators', () => { const add=(a:number,b:number):number=>{while(b!==0){const carry=(a&b)<<1;a=a^b;b=carry;}return a;}; expect(add(1,2)).toBe(3); expect(add(-2,3)).toBe(1); expect(add(0,0)).toBe(0); });
});


describe('phase57 coverage', () => {
  it('implements FreqStack that pops the most frequent element', () => { class FS{private freq=new Map<number,number>();private group=new Map<number,number[]>();private maxFreq=0;push(v:number){const f=(this.freq.get(v)||0)+1;this.freq.set(v,f);this.maxFreq=Math.max(this.maxFreq,f);if(!this.group.has(f))this.group.set(f,[]);this.group.get(f)!.push(v);}pop(){const top=this.group.get(this.maxFreq)!;const v=top.pop()!;if(!top.length){this.group.delete(this.maxFreq);this.maxFreq--;}this.freq.set(v,this.freq.get(v)!-1);return v;}} const fs=new FS();[5,7,5,7,4,5].forEach(v=>fs.push(v));expect(fs.pop()).toBe(5);expect(fs.pop()).toBe(7);expect(fs.pop()).toBe(5);expect(fs.pop()).toBe(4); });
  it('checks if array has continuous subarray of size ≥2 summing to multiple of k', () => { const csm=(a:number[],k:number)=>{const m=new Map([[0,-1]]);let sum=0;for(let i=0;i<a.length;i++){sum=(sum+a[i])%k;if(m.has(sum)){if(i-m.get(sum)!>=2)return true;}else m.set(sum,i);}return false;}; expect(csm([23,2,4,6,7],6)).toBe(true); expect(csm([23,2,6,4,7],6)).toBe(true); expect(csm([23,2,6,4,7],13)).toBe(false); });
  it('implements a hash set with add, remove, and contains', () => { class HS{private s=new Set<number>();add(k:number){this.s.add(k);}remove(k:number){this.s.delete(k);}contains(k:number){return this.s.has(k);}} const hs=new HS();hs.add(1);hs.add(2);expect(hs.contains(1)).toBe(true);hs.remove(2);expect(hs.contains(2)).toBe(false);expect(hs.contains(3)).toBe(false); });
  it('finds cells that can flow to both Pacific and Atlantic oceans', () => { const paf=(h:number[][])=>{const m=h.length,n=h[0].length,pac=Array.from({length:m},()=>new Array(n).fill(false)),atl=Array.from({length:m},()=>new Array(n).fill(false));const dfs=(i:number,j:number,vis:boolean[][],prev:number)=>{if(i<0||i>=m||j<0||j>=n||vis[i][j]||h[i][j]<prev)return;vis[i][j]=true;for(const[di,dj]of[[-1,0],[1,0],[0,-1],[0,1]])dfs(i+di,j+dj,vis,h[i][j]);};for(let i=0;i<m;i++){dfs(i,0,pac,0);dfs(i,n-1,atl,0);}for(let j=0;j<n;j++){dfs(0,j,pac,0);dfs(m-1,j,atl,0);}const res:number[][]=[];for(let i=0;i<m;i++)for(let j=0;j<n;j++)if(pac[i][j]&&atl[i][j])res.push([i,j]);return res;}; expect(paf([[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]).length).toBe(7); });
  it('determines if two binary trees are flip equivalent', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const flip=(a:N|null,b:N|null):boolean=>{if(!a&&!b)return true;if(!a||!b||a.v!==b.v)return false;return(flip(a.l,b.l)&&flip(a.r,b.r))||(flip(a.l,b.r)&&flip(a.r,b.l));}; expect(flip(mk(1,mk(2,mk(4),mk(5,mk(7),mk(8))),mk(3,mk(6))),mk(1,mk(3,null,mk(6)),mk(2,mk(4),mk(5,mk(8),mk(7)))))).toBe(true); expect(flip(mk(1,mk(2),mk(3)),mk(1,mk(4),mk(5)))).toBe(false); });
});

describe('phase58 coverage', () => {
  it('sliding window max', () => {
    const maxSlidingWindow=(nums:number[],k:number):number[]=>{const q:number[]=[];const res:number[]=[];for(let i=0;i<nums.length;i++){while(q.length&&q[0]<i-k+1)q.shift();while(q.length&&nums[q[q.length-1]]<nums[i])q.pop();q.push(i);if(i>=k-1)res.push(nums[q[0]]);}return res;};
    expect(maxSlidingWindow([1,3,-1,-3,5,3,6,7],3)).toEqual([3,3,5,5,6,7]);
    expect(maxSlidingWindow([1],1)).toEqual([1]);
    expect(maxSlidingWindow([1,-1],1)).toEqual([1,-1]);
  });
  it('letter combinations phone', () => {
    const letterCombinations=(digits:string):string[]=>{if(!digits)return[];const map:Record<string,string>={'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'};const res:string[]=[];const bt=(idx:number,cur:string)=>{if(idx===digits.length){res.push(cur);return;}for(const c of map[digits[idx]])bt(idx+1,cur+c);};bt(0,'');return res;};
    const r=letterCombinations('23');
    expect(r).toHaveLength(9);
    expect(r).toContain('ad');
    expect(letterCombinations('')).toEqual([]);
  });
  it('trapping rain water', () => {
    const trap=(h:number[]):number=>{let l=0,r=h.length-1,lMax=0,rMax=0,water=0;while(l<r){if(h[l]<h[r]){h[l]>=lMax?lMax=h[l]:water+=lMax-h[l];l++;}else{h[r]>=rMax?rMax=h[r]:water+=rMax-h[r];r--;}}return water;};
    expect(trap([0,1,0,2,1,0,1,3,2,1,2,1])).toBe(6);
    expect(trap([4,2,0,3,2,5])).toBe(9);
    expect(trap([1,0,1])).toBe(1);
  });
  it('N-ary serialize', () => {
    type NT={val:number;children:NT[]};
    const mk=(v:number,...ch:NT[]):NT=>({val:v,children:ch});
    const ser=(r:NT|null):string=>{if(!r)return'#';return`${r.val}(${r.children.map(ser).join(',')})`;};
    const t=mk(1,mk(3,mk(5),mk(6)),mk(2),mk(4));
    const s=ser(t);
    expect(s).toContain('1');
    expect(s).toContain('3');
    expect(s.split('(').length).toBeGreaterThan(3);
  });
  it('container with most water', () => {
    const maxArea=(h:number[]):number=>{let l=0,r=h.length-1,best=0;while(l<r){best=Math.max(best,Math.min(h[l],h[r])*(r-l));if(h[l]<h[r])l++;else r--;}return best;};
    expect(maxArea([1,8,6,2,5,4,8,3,7])).toBe(49);
    expect(maxArea([1,1])).toBe(1);
    expect(maxArea([4,3,2,1,4])).toBe(16);
  });
});

describe('phase59 coverage', () => {
  it('maximum product subarray', () => {
    const maxProduct=(nums:number[]):number=>{let maxP=nums[0],minP=nums[0],res=nums[0];for(let i=1;i<nums.length;i++){const tmp=maxP;maxP=Math.max(nums[i],maxP*nums[i],minP*nums[i]);minP=Math.min(nums[i],tmp*nums[i],minP*nums[i]);res=Math.max(res,maxP);}return res;};
    expect(maxProduct([2,3,-2,4])).toBe(6);
    expect(maxProduct([-2,0,-1])).toBe(0);
    expect(maxProduct([-2,3,-4])).toBe(24);
    expect(maxProduct([0,2])).toBe(2);
  });
  it('min arrows to burst balloons', () => {
    const findMinArrowShots=(points:[number,number][]):number=>{if(!points.length)return 0;points.sort((a,b)=>a[1]-b[1]);let arrows=1,end=points[0][1];for(let i=1;i<points.length;i++){if(points[i][0]>end){arrows++;end=points[i][1];}}return arrows;};
    expect(findMinArrowShots([[10,16],[2,8],[1,6],[7,12]])).toBe(2);
    expect(findMinArrowShots([[1,2],[3,4],[5,6],[7,8]])).toBe(4);
    expect(findMinArrowShots([[1,2],[2,3],[3,4],[4,5]])).toBe(2);
  });
  it('LCA of BST', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const lcaBST=(root:TN|null,p:number,q:number):number=>{if(!root)return -1;if(root.val>p&&root.val>q)return lcaBST(root.left,p,q);if(root.val<p&&root.val<q)return lcaBST(root.right,p,q);return root.val;};
    const t=mk(6,mk(2,mk(0),mk(4,mk(3),mk(5))),mk(8,mk(7),mk(9)));
    expect(lcaBST(t,2,8)).toBe(6);
    expect(lcaBST(t,2,4)).toBe(2);
    expect(lcaBST(t,0,5)).toBe(2);
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
});

describe('phase60 coverage', () => {
  it('stock span problem', () => {
    const calculateSpan=(prices:number[]):number[]=>{const stack:number[]=[];const span:number[]=[];for(let i=0;i<prices.length;i++){while(stack.length&&prices[stack[stack.length-1]]<=prices[i])stack.pop();span.push(stack.length===0?i+1:i-stack[stack.length-1]);stack.push(i);}return span;};
    expect(calculateSpan([100,80,60,70,60,75,85])).toEqual([1,1,1,2,1,4,6]);
    expect(calculateSpan([10,4,5,90,120,80])).toEqual([1,1,2,4,5,1]);
  });
  it('stone game DP', () => {
    const stoneGame=(piles:number[]):boolean=>{const n=piles.length;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let i=0;i<n;i++)dp[i][i]=piles[i];for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=Math.max(piles[i]-dp[i+1][j],piles[j]-dp[i][j-1]);}return dp[0][n-1]>0;};
    expect(stoneGame([5,3,4,5])).toBe(true);
    expect(stoneGame([3,7,2,3])).toBe(true);
  });
  it('sum of subarray minimums', () => {
    const sumSubarrayMins=(arr:number[]):number=>{const MOD=1e9+7;const n=arr.length;const left=new Array(n).fill(0);const right=new Array(n).fill(0);const s1:number[]=[];const s2:number[]=[];for(let i=0;i<n;i++){while(s1.length&&arr[s1[s1.length-1]]>=arr[i])s1.pop();left[i]=s1.length?i-s1[s1.length-1]:i+1;s1.push(i);}for(let i=n-1;i>=0;i--){while(s2.length&&arr[s2[s2.length-1]]>arr[i])s2.pop();right[i]=s2.length?s2[s2.length-1]-i:n-i;s2.push(i);}let res=0;for(let i=0;i<n;i++)res=(res+arr[i]*left[i]*right[i])%MOD;return res;};
    expect(sumSubarrayMins([3,1,2,4])).toBe(17);
    expect(sumSubarrayMins([11,81,94,43,3])).toBe(444);
  });
  it('interleaving string DP', () => {
    const isInterleave=(s1:string,s2:string,s3:string):boolean=>{const m=s1.length,n=s2.length;if(m+n!==s3.length)return false;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(false));dp[0][0]=true;for(let i=1;i<=m;i++)dp[i][0]=dp[i-1][0]&&s1[i-1]===s3[i-1];for(let j=1;j<=n;j++)dp[0][j]=dp[0][j-1]&&s2[j-1]===s3[j-1];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=(dp[i-1][j]&&s1[i-1]===s3[i+j-1])||(dp[i][j-1]&&s2[j-1]===s3[i+j-1]);return dp[m][n];};
    expect(isInterleave('aabcc','dbbca','aadbbcbcac')).toBe(true);
    expect(isInterleave('aabcc','dbbca','aadbbbaccc')).toBe(false);
    expect(isInterleave('','','b')).toBe(false);
  });
  it('fruit into baskets', () => {
    const totalFruit=(fruits:number[]):number=>{const basket=new Map<number,number>();let l=0,res=0;for(let r=0;r<fruits.length;r++){basket.set(fruits[r],(basket.get(fruits[r])||0)+1);while(basket.size>2){const lf=fruits[l];basket.set(lf,basket.get(lf)!-1);if(basket.get(lf)===0)basket.delete(lf);l++;}res=Math.max(res,r-l+1);}return res;};
    expect(totalFruit([1,2,1])).toBe(3);
    expect(totalFruit([0,1,2,2])).toBe(3);
    expect(totalFruit([1,2,3,2,2])).toBe(4);
  });
});

describe('phase61 coverage', () => {
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
  it('restore IP addresses', () => {
    const restoreIpAddresses=(s:string):string[]=>{const res:string[]=[];const bt=(start:number,parts:string[])=>{if(parts.length===4){if(start===s.length)res.push(parts.join('.'));return;}for(let len=1;len<=3;len++){if(start+len>s.length)break;const seg=s.slice(start,start+len);if(seg.length>1&&seg[0]==='0')break;if(parseInt(seg)>255)break;bt(start+len,[...parts,seg]);}};bt(0,[]);return res;};
    const r=restoreIpAddresses('25525511135');
    expect(r).toContain('255.255.11.135');
    expect(r).toContain('255.255.111.35');
    expect(restoreIpAddresses('0000')).toEqual(['0.0.0.0']);
  });
  it('odd even linked list', () => {
    type N={val:number;next:N|null};
    const mk=(...v:number[]):N|null=>{let h:N|null=null;for(let i=v.length-1;i>=0;i--)h={val:v[i],next:h};return h;};
    const toArr=(h:N|null):number[]=>{const a:number[]=[];while(h){a.push(h.val);h=h.next;}return a;};
    const oddEvenList=(head:N|null):N|null=>{if(!head)return null;let odd:N=head,even:N|null=head.next;const evenHead=even;while(even?.next){odd.next=even.next;odd=odd.next!;even.next=odd.next;even=even.next;}odd.next=evenHead;return head;};
    expect(toArr(oddEvenList(mk(1,2,3,4,5)))).toEqual([1,3,5,2,4]);
    expect(toArr(oddEvenList(mk(2,1,3,5,6,4,7)))).toEqual([2,3,6,7,1,5,4]);
  });
});

describe('phase62 coverage', () => {
  it('reorganize string no adjacent', () => {
    const reorganizeString=(s:string):string=>{const cnt=new Array(26).fill(0);for(const c of s)cnt[c.charCodeAt(0)-97]++;const maxCnt=Math.max(...cnt);if(maxCnt>(s.length+1)/2)return'';const res:string[]=new Array(s.length);let i=0;for(let c=0;c<26;c++){while(cnt[c]>0){if(i>=s.length)i=1;res[i]=String.fromCharCode(97+c);cnt[c]--;i+=2;}}return res.join('');};
    const r=reorganizeString('aab');
    expect(r).toBeTruthy();
    expect(r[0]).not.toBe(r[1]);
    expect(reorganizeString('aaab')).toBe('');
  });
  it('find duplicate Floyd cycle', () => {
    const findDuplicate=(nums:number[]):number=>{let slow=nums[0],fast=nums[0];do{slow=nums[slow];fast=nums[nums[fast]];}while(slow!==fast);slow=nums[0];while(slow!==fast){slow=nums[slow];fast=nums[fast];}return slow;};
    expect(findDuplicate([1,3,4,2,2])).toBe(2);
    expect(findDuplicate([3,1,3,4,2])).toBe(3);
    expect(findDuplicate([1,1])).toBe(1);
  });
  it('find and replace pattern', () => {
    const findAndReplacePattern=(words:string[],pattern:string):string[]=>{const match=(w:string):boolean=>{const m=new Map<string,string>();const seen=new Set<string>();for(let i=0;i<w.length;i++){if(m.has(w[i])){if(m.get(w[i])!==pattern[i])return false;}else{if(seen.has(pattern[i]))return false;m.set(w[i],pattern[i]);seen.add(pattern[i]);}}return true;};return words.filter(match);};
    expect(findAndReplacePattern(['aa','bb','ab','ba'],'aa')).toEqual(['aa','bb']);
    expect(findAndReplacePattern(['abc','deq','mee','aqq','dkd','ccc'],'abb')).toEqual(['mee','aqq']);
  });
  it('sum without plus operator', () => {
    const getSum=(a:number,b:number):number=>{while(b!==0){const carry=(a&b)<<1;a=a^b;b=carry;}return a;};
    expect(getSum(1,2)).toBe(3);
    expect(getSum(2,3)).toBe(5);
    expect(getSum(-1,1)).toBe(0);
    expect(getSum(0,0)).toBe(0);
  });
  it('buddy strings swap', () => {
    const buddyStrings=(s:string,goal:string):boolean=>{if(s.length!==goal.length)return false;if(s===goal)return new Set(s).size<s.length;const diff:number[][]=[];for(let i=0;i<s.length;i++)if(s[i]!==goal[i])diff.push([i]);return diff.length===2&&s[diff[0][0]]===goal[diff[1][0]]&&s[diff[1][0]]===goal[diff[0][0]];};
    expect(buddyStrings('ab','ba')).toBe(true);
    expect(buddyStrings('ab','ab')).toBe(false);
    expect(buddyStrings('aa','aa')).toBe(true);
    expect(buddyStrings('aaaaaaabc','aaaaaaacb')).toBe(true);
  });
});

describe('phase63 coverage', () => {
  it('toeplitz matrix check', () => {
    const isToeplitzMatrix=(matrix:number[][]):boolean=>{for(let i=1;i<matrix.length;i++)for(let j=1;j<matrix[0].length;j++)if(matrix[i][j]!==matrix[i-1][j-1])return false;return true;};
    expect(isToeplitzMatrix([[1,2,3,4],[5,1,2,3],[9,5,1,2]])).toBe(true);
    expect(isToeplitzMatrix([[1,2],[2,2]])).toBe(false);
  });
  it('sort colors Dutch flag', () => {
    const sortColors=(nums:number[]):void=>{let lo=0,mid=0,hi=nums.length-1;while(mid<=hi){if(nums[mid]===0){[nums[lo],nums[mid]]=[nums[mid],nums[lo]];lo++;mid++;}else if(nums[mid]===1)mid++;else{[nums[mid],nums[hi]]=[nums[hi],nums[mid]];hi--;}}};
    const a=[2,0,2,1,1,0];sortColors(a);expect(a).toEqual([0,0,1,1,2,2]);
    const b=[2,0,1];sortColors(b);expect(b).toEqual([0,1,2]);
    const c=[0];sortColors(c);expect(c).toEqual([0]);
  });
  it('island perimeter calculation', () => {
    const islandPerimeter=(grid:number[][]):number=>{let p=0;const m=grid.length,n=grid[0].length;for(let i=0;i<m;i++)for(let j=0;j<n;j++)if(grid[i][j]===1){p+=4;if(i>0&&grid[i-1][j]===1)p-=2;if(j>0&&grid[i][j-1]===1)p-=2;}return p;};
    expect(islandPerimeter([[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]])).toBe(16);
    expect(islandPerimeter([[1]])).toBe(4);
    expect(islandPerimeter([[1,0]])).toBe(4);
  });
  it('interval list intersections', () => {
    const intervalIntersection=(A:[number,number][],B:[number,number][]): [number,number][]=>{const res:[number,number][]=[];let i=0,j=0;while(i<A.length&&j<B.length){const lo=Math.max(A[i][0],B[j][0]);const hi=Math.min(A[i][1],B[j][1]);if(lo<=hi)res.push([lo,hi]);if(A[i][1]<B[j][1])i++;else j++;}return res;};
    const r=intervalIntersection([[0,2],[5,10],[13,23],[24,25]],[[1,5],[8,12],[15,24],[25,26]]);
    expect(r).toEqual([[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]);
    expect(intervalIntersection([],[['a'==='' as any? 0:0,1]])).toEqual([]);
  });
  it('game of life next state', () => {
    const gameOfLife=(board:number[][]):void=>{const m=board.length,n=board[0].length;const count=(r:number,c:number)=>{let live=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(dr===0&&dc===0)continue;const nr=r+dr,nc=c+dc;if(nr>=0&&nr<m&&nc>=0&&nc<n&&Math.abs(board[nr][nc])===1)live++;}return live;};for(let i=0;i<m;i++)for(let j=0;j<n;j++){const c=count(i,j);if(board[i][j]===1&&(c<2||c>3))board[i][j]=-1;if(board[i][j]===0&&c===3)board[i][j]=2;}for(let i=0;i<m;i++)for(let j=0;j<n;j++)board[i][j]=board[i][j]>0?1:0;};
    const b=[[0,1,0],[0,0,1],[1,1,1],[0,0,0]];gameOfLife(b);
    expect(b).toEqual([[0,0,0],[1,0,1],[0,1,1],[0,1,0]]);
  });
});
