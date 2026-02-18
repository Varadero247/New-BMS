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

      await request(app)
        .post('/api/complaints')
        .set('Authorization', 'Bearer token')
        .send({
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
        'CUSTOMER', 'FIELD_SERVICE', 'INTERNAL', 'REGULATORY',
        'DISTRIBUTOR', 'HEALTHCARE_PROVIDER', 'PATIENT',
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
      (mockPrisma.complaint.create as jest.Mock).mockRejectedValueOnce(new Error('DB connection failed'));

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
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([mockComplaint, mockComplaint2]);
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

      await request(app)
        .get('/api/complaints')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { complaintDate: 'desc' },
        })
      );
    });

    it('should always exclude soft-deleted records', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.complaint.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/complaints')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.complaint.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB connection failed'));

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

      await request(app)
        .get('/api/complaints/trending')
        .set('Authorization', 'Bearer token');

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

      await request(app)
        .get('/api/complaints/mdr-pending')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complaint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            deletedAt: null,
            mdrReportable: null,
            OR: [
              { injuryOccurred: true },
              { deathOccurred: true },
              { malfunctionOccurred: true },
            ],
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

      await request(app)
        .get('/api/complaints/mdr-pending')
        .set('Authorization', 'Bearer token');

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
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaintReadyToClose);
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
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaintReadyToClose);
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
      expect(response.body.error.message).toContain('Root cause and corrective action must be documented');

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
      (mockPrisma.complaint.findUnique as jest.Mock).mockResolvedValueOnce(mockComplaintReadyToClose);
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
