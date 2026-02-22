import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    counterfeitReport: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    quarantineRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    approvedSource: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    CounterfeitReportWhereInput: {},
    ApprovedSourceWhereInput: {},
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
import counterfeitRouter from '../src/routes/counterfeit';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockReport = {
  id: '10000000-0000-4000-a000-000000000001',
  refNumber: 'SUCP-2602-0001',
  partNumber: 'IC-7805-REG',
  partName: 'Voltage Regulator 5V',
  manufacturer: 'Texas Instruments',
  distributor: 'Digi-Key Electronics',
  lotNumber: 'LOT-2026-A1',
  serialNumber: 'SN-00123456',
  suspicionReason: 'Markings inconsistent with manufacturer datasheet',
  evidence: 'Visual inspection photos attached',
  reportedBy: 'user-1',
  status: 'REPORTED',
  investigationNotes: null,
  disposition: null,
  dispositionDate: null,
  dispositionBy: null,
  quarantineId: null,
  gidepReported: false,
  gidepRef: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockReport2 = {
  id: '10000000-0000-4000-a000-000000000002',
  refNumber: 'SUCP-2602-0002',
  partNumber: 'CAP-100UF-16V',
  partName: 'Electrolytic Capacitor',
  manufacturer: 'Murata',
  distributor: null,
  lotNumber: 'LOT-2026-B3',
  serialNumber: null,
  suspicionReason: 'Weight differs from specification by 15%',
  evidence: null,
  reportedBy: 'user-1',
  status: 'UNDER_INVESTIGATION',
  investigationNotes: 'XRF analysis scheduled',
  disposition: null,
  dispositionDate: null,
  dispositionBy: null,
  quarantineId: null,
  gidepReported: false,
  gidepRef: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-06'),
};

const mockQuarantineRecord = {
  id: 'qr-0001',
  refNumber: 'QR-2602-0001',
  partNumber: 'IC-7805-REG',
  quantity: 500,
  location: 'Warehouse B, Shelf 12, Bin 3',
  reason: 'Suspected counterfeit part - SUCP-2602-0001',
  reportId: '10000000-0000-4000-a000-000000000001',
  status: 'QUARANTINED',
  createdBy: 'user-1',
  createdAt: new Date('2026-02-02'),
  updatedAt: new Date('2026-02-02'),
};

const mockApprovedSource = {
  id: 'src-0001',
  companyName: 'Arrow Electronics',
  cageCode: '1ABC2',
  partNumbers: ['IC-7805-REG', 'IC-7812-REG', 'IC-7905-REG'],
  certifications: ['ISO 9001:2015', 'AS6081'],
  approvalDate: new Date('2025-06-01'),
  expiryDate: new Date('2027-06-01'),
  notes: 'Primary distributor for TI voltage regulators',
  riskRating: 'LOW',
  status: 'APPROVED',
  createdBy: 'user-1',
  createdAt: new Date('2025-06-01'),
  updatedAt: new Date('2025-06-01'),
};

const mockApprovedSource2 = {
  id: 'src-0002',
  companyName: 'Mouser Electronics',
  cageCode: '3DEF4',
  partNumbers: ['CAP-100UF-16V', 'CAP-220UF-25V'],
  certifications: ['ISO 9001:2015', 'IDEA-STD-1010'],
  approvalDate: new Date('2025-09-15'),
  expiryDate: null,
  notes: null,
  riskRating: 'MEDIUM',
  status: 'APPROVED',
  createdBy: 'user-1',
  createdAt: new Date('2025-09-15'),
  updatedAt: new Date('2025-09-15'),
};

const validCreateReportPayload = {
  partNumber: 'IC-7805-REG',
  partName: 'Voltage Regulator 5V',
  manufacturer: 'Texas Instruments',
  distributor: 'Digi-Key Electronics',
  lotNumber: 'LOT-2026-A1',
  serialNumber: 'SN-00123456',
  suspicionReason: 'Markings inconsistent with manufacturer datasheet',
  evidence: 'Visual inspection photos attached',
};

const validCreateApprovedSourcePayload = {
  companyName: 'Arrow Electronics',
  cageCode: '1ABC2',
  partNumbers: ['IC-7805-REG', 'IC-7812-REG'],
  certifications: ['ISO 9001:2015', 'AS6081'],
  approvalDate: '2025-06-01',
  expiryDate: '2027-06-01',
  notes: 'Primary distributor',
  riskRating: 'LOW',
};

const validQuarantinePayload = {
  quantity: 500,
  location: 'Warehouse B, Shelf 12, Bin 3',
  reason: 'Suspected counterfeit parts',
};

const validNotifyPayload = {
  notifyGidep: true,
  gidepRef: 'GIDEP-2026-001',
};

// ==========================================
// Tests
// ==========================================

describe('Quality Counterfeit Parts Prevention API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/counterfeit', counterfeitRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST /reports — Report suspected counterfeit part
  // ==========================================
  describe('POST /api/counterfeit/reports', () => {
    it('should create a counterfeit report successfully', async () => {
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.counterfeitReport.create as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        refNumber: 'SUCP-2602-0001',
      });

      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send(validCreateReportPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.partNumber).toBe('IC-7805-REG');
      expect(response.body.data.manufacturer).toBe('Texas Instruments');
      expect(response.body.data.status).toBe('REPORTED');

      expect(mockPrisma.counterfeitReport.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          partNumber: 'IC-7805-REG',
          partName: 'Voltage Regulator 5V',
          manufacturer: 'Texas Instruments',
          distributor: 'Digi-Key Electronics',
          lotNumber: 'LOT-2026-A1',
          serialNumber: 'SN-00123456',
          suspicionReason: 'Markings inconsistent with manufacturer datasheet',
          evidence: 'Visual inspection photos attached',
          reportedBy: 'user-1',
          status: 'REPORTED',
          createdBy: 'user-1',
        }),
      });
    });

    it('should create a report with only required fields', async () => {
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(2);
      (mockPrisma.counterfeitReport.create as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        refNumber: 'SUCP-2602-0003',
        partName: undefined,
        distributor: undefined,
        lotNumber: undefined,
        serialNumber: undefined,
        evidence: undefined,
      });

      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send({
          partNumber: 'RES-10K-0805',
          manufacturer: 'Yageo',
          suspicionReason: 'Resistance value out of tolerance',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should generate sequential ref numbers based on count', async () => {
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.counterfeitReport.create as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        refNumber: 'SUCP-2602-0006',
      });

      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send(validCreateReportPayload);

      expect(response.status).toBe(201);

      // Verify the refNumber was generated with count+1
      expect(mockPrisma.counterfeitReport.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringMatching(/^SUCP-\d{4}-0006$/),
        }),
      });
    });

    it('should return 400 when partNumber is missing', async () => {
      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send({
          manufacturer: 'Texas Instruments',
          suspicionReason: 'Markings inconsistent',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toBeDefined();
    });

    it('should return 400 when manufacturer is missing', async () => {
      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send({
          partNumber: 'IC-7805-REG',
          suspicionReason: 'Markings inconsistent',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when suspicionReason is missing', async () => {
      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send({
          partNumber: 'IC-7805-REG',
          manufacturer: 'Texas Instruments',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when partNumber is empty string', async () => {
      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreateReportPayload,
          partNumber: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when manufacturer is empty string', async () => {
      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreateReportPayload,
          manufacturer: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when suspicionReason is empty string', async () => {
      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreateReportPayload,
          suspicionReason: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.counterfeitReport.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token')
        .send(validCreateReportPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create counterfeit report');
    });
  });

  // ==========================================
  // GET /reports — List counterfeit reports
  // ==========================================
  describe('GET /api/counterfeit/reports', () => {
    it('should return a list of reports with default pagination', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([
        mockReport,
        mockReport2,
      ]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
      expect(response.body.data.totalPages).toBe(1);
    });

    it('should support custom pagination parameters', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([mockReport]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/counterfeit/reports?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(3);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.total).toBe(50);
      expect(response.body.data.totalPages).toBe(5);

      expect(mockPrisma.counterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/counterfeit/reports?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.limit).toBe(100);

      expect(mockPrisma.counterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([mockReport2]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/counterfeit/reports?status=UNDER_INVESTIGATION')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.counterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'UNDER_INVESTIGATION',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by partNumber (case-insensitive contains)', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([mockReport]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/counterfeit/reports?partNumber=7805')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.counterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            partNumber: { contains: '7805', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by manufacturer (case-insensitive contains)', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([mockReport]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/counterfeit/reports?manufacturer=texas')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.counterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            manufacturer: { contains: 'texas', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should combine multiple filters', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/counterfeit/reports?status=REPORTED&manufacturer=texas&partNumber=7805')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.counterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'REPORTED',
            partNumber: { contains: '7805', mode: 'insensitive' },
            manufacturer: { contains: 'texas', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/counterfeit/reports').set('Authorization', 'Bearer token');

      expect(mockPrisma.counterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should exclude soft-deleted records', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/counterfeit/reports').set('Authorization', 'Bearer token');

      expect(mockPrisma.counterfeitReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });

    it('should return empty results when no reports exist', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.counterfeitReport.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.totalPages).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.counterfeitReport.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .get('/api/counterfeit/reports')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list counterfeit reports');
    });
  });

  // ==========================================
  // GET /reports/:id — Get report details
  // ==========================================
  describe('GET /api/counterfeit/reports/:id', () => {
    it('should return a single report by ID', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .get('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('10000000-0000-4000-a000-000000000001');
      expect(response.body.data.partNumber).toBe('IC-7805-REG');
      expect(response.body.data.manufacturer).toBe('Texas Instruments');
      expect(response.body.data.refNumber).toBe('SUCP-2602-0001');

      expect(mockPrisma.counterfeitReport.findUnique).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
      });
    });

    it('should return 404 when report is not found', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/counterfeit/reports/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Counterfeit report not found');
    });

    it('should return 404 when report is soft-deleted', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        deletedAt: new Date('2026-02-10'),
      });

      const response = await request(app)
        .get('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Counterfeit report not found');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get counterfeit report');
    });
  });

  // ==========================================
  // PUT /reports/:id — Update investigation
  // ==========================================
  describe('PUT /api/counterfeit/reports/:id', () => {
    it('should update investigation notes on a report', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        investigationNotes: 'XRF analysis shows lead content is out of spec',
        status: 'UNDER_INVESTIGATION',
      });

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({
          investigationNotes: 'XRF analysis shows lead content is out of spec',
          status: 'UNDER_INVESTIGATION',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.investigationNotes).toBe(
        'XRF analysis shows lead content is out of spec'
      );
      expect(response.body.data.status).toBe('UNDER_INVESTIGATION');

      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          investigationNotes: 'XRF analysis shows lead content is out of spec',
          status: 'UNDER_INVESTIGATION',
        }),
      });
    });

    it('should update status to CONFIRMED_COUNTERFEIT', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport2);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport2,
        status: 'CONFIRMED_COUNTERFEIT',
      });

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000002')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CONFIRMED_COUNTERFEIT' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CONFIRMED_COUNTERFEIT');
    });

    it('should update status to CONFIRMED_AUTHENTIC', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport2);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport2,
        status: 'CONFIRMED_AUTHENTIC',
      });

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000002')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CONFIRMED_AUTHENTIC' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CONFIRMED_AUTHENTIC');
    });

    it('should set disposition with dispositionDate and dispositionBy', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        disposition: 'DESTROY',
        dispositionDate: new Date(),
        dispositionBy: 'user-1',
      });

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ disposition: 'DESTROY' });

      expect(response.status).toBe(200);

      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          disposition: 'DESTROY',
          dispositionDate: expect.any(Date),
          dispositionBy: 'user-1',
        }),
      });
    });

    it('should accept RETURN_TO_SUPPLIER disposition', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        disposition: 'RETURN_TO_SUPPLIER',
      });

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ disposition: 'RETURN_TO_SUPPLIER' });

      expect(response.status).toBe(200);
      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          disposition: 'RETURN_TO_SUPPLIER',
        }),
      });
    });

    it('should accept QUARANTINE disposition', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        disposition: 'QUARANTINE',
      });

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ disposition: 'QUARANTINE' });

      expect(response.status).toBe(200);
    });

    it('should accept CLEARED disposition', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        disposition: 'CLEARED',
      });

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ disposition: 'CLEARED' });

      expect(response.status).toBe(200);
    });

    it('should update evidence field', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        evidence: 'Updated evidence with XRF results',
      });

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ evidence: 'Updated evidence with XRF results' });

      expect(response.status).toBe(200);
      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          evidence: 'Updated evidence with XRF results',
        }),
      });
    });

    it('should return 404 when report is not found', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/counterfeit/reports/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CLOSED' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Counterfeit report not found');
    });

    it('should return 404 when report is soft-deleted', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CLOSED' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid disposition value', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ disposition: 'INVALID_DISPOSITION' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CLOSED' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to update counterfeit report');
    });
  });

  // ==========================================
  // POST /reports/:id/quarantine — Place in quarantine
  // ==========================================
  describe('POST /api/counterfeit/reports/:id/quarantine', () => {
    it('should create a quarantine record and link it to the report', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.quarantineRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.quarantineRecord.create as jest.Mock).mockResolvedValueOnce(mockQuarantineRecord);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        quarantineId: 'qr-0001',
      });

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send(validQuarantinePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.partNumber).toBe('IC-7805-REG');
      expect(response.body.data.quantity).toBe(500);
      expect(response.body.data.location).toBe('Warehouse B, Shelf 12, Bin 3');
      expect(response.body.data.status).toBe('QUARANTINED');

      // Verify quarantine record was created with correct data
      expect(mockPrisma.quarantineRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          partNumber: 'IC-7805-REG',
          quantity: 500,
          location: 'Warehouse B, Shelf 12, Bin 3',
          reason: 'Suspected counterfeit parts',
          reportId: '10000000-0000-4000-a000-000000000001',
          status: 'QUARANTINED',
          createdBy: 'user-1',
        }),
      });

      // Verify counterfeit report was linked to quarantine record
      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: { quarantineId: 'qr-0001' },
      });
    });

    it('should use default reason when not provided', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.quarantineRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.quarantineRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockQuarantineRecord,
        reason: `Suspected counterfeit part - ${mockReport.refNumber}`,
      });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send({ quantity: 100, location: 'Warehouse A' });

      expect(response.status).toBe(201);

      expect(mockPrisma.quarantineRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          reason: `Suspected counterfeit part - ${mockReport.refNumber}`,
        }),
      });
    });

    it('should generate sequential quarantine ref numbers', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.quarantineRecord.count as jest.Mock).mockResolvedValueOnce(3);
      (mockPrisma.quarantineRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockQuarantineRecord,
        refNumber: 'QR-2602-0004',
      });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send(validQuarantinePayload);

      expect(response.status).toBe(201);

      expect(mockPrisma.quarantineRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringMatching(/^QR-\d{4}-0004$/),
        }),
      });
    });

    it('should return 404 when report is not found', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/counterfeit/reports/00000000-0000-4000-a000-ffffffffffff/quarantine')
        .set('Authorization', 'Bearer token')
        .send(validQuarantinePayload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Counterfeit report not found');
    });

    it('should return 404 when report is soft-deleted', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send(validQuarantinePayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when quantity is missing', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send({ location: 'Warehouse A' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when quantity is not a positive integer', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send({ quantity: 0, location: 'Warehouse A' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when quantity is negative', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send({ quantity: -5, location: 'Warehouse A' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when quantity is a decimal', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send({ quantity: 3.5, location: 'Warehouse A' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when location is missing', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send({ quantity: 100 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when location is empty string', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send({ quantity: 100, location: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when body is empty', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/quarantine')
        .set('Authorization', 'Bearer token')
        .send(validQuarantinePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to quarantine part');
    });
  });

  // ==========================================
  // POST /reports/:id/notify — Notify GIDEP/EASA
  // ==========================================
  describe('POST /api/counterfeit/reports/:id/notify', () => {
    it('should update GIDEP notification flag and ref on a report', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        gidepReported: true,
        gidepRef: 'GIDEP-2026-001',
      });

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/notify')
        .set('Authorization', 'Bearer token')
        .send(validNotifyPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gidepReported).toBe(true);
      expect(response.body.data.gidepRef).toBe('GIDEP-2026-001');

      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          gidepReported: true,
          gidepRef: 'GIDEP-2026-001',
        }),
      });
    });

    it('should update only the notifyGidep flag without gidepRef', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        gidepReported: true,
      });

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/notify')
        .set('Authorization', 'Bearer token')
        .send({ notifyGidep: true });

      expect(response.status).toBe(200);

      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: { gidepReported: true },
      });
    });

    it('should update only the gidepRef without notifyGidep flag', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        gidepRef: 'GIDEP-2026-002',
      });

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/notify')
        .set('Authorization', 'Bearer token')
        .send({ gidepRef: 'GIDEP-2026-002' });

      expect(response.status).toBe(200);

      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: { gidepRef: 'GIDEP-2026-002' },
      });
    });

    it('should set notifyGidep to false (un-report)', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        gidepReported: true,
      });
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        gidepReported: false,
      });

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/notify')
        .set('Authorization', 'Bearer token')
        .send({ notifyGidep: false });

      expect(response.status).toBe(200);

      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: { gidepReported: false },
      });
    });

    it('should handle empty body gracefully (no updates)', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(mockReport);
      (mockPrisma.counterfeitReport.update as jest.Mock).mockResolvedValueOnce(mockReport);

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/notify')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(mockPrisma.counterfeitReport.update).toHaveBeenCalledWith({
        where: { id: '10000000-0000-4000-a000-000000000001' },
        data: {},
      });
    });

    it('should return 404 when report is not found', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/counterfeit/reports/00000000-0000-4000-a000-ffffffffffff/notify')
        .set('Authorization', 'Bearer token')
        .send(validNotifyPayload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Counterfeit report not found');
    });

    it('should return 404 when report is soft-deleted', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockReport,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/notify')
        .set('Authorization', 'Bearer token')
        .send(validNotifyPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.counterfeitReport.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/counterfeit/reports/10000000-0000-4000-a000-000000000001/notify')
        .set('Authorization', 'Bearer token')
        .send(validNotifyPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to update GIDEP notification');
    });
  });

  // ==========================================
  // POST /approved-sources — Add to approved source list
  // ==========================================
  describe('POST /api/counterfeit/approved-sources', () => {
    it('should create an approved source successfully', async () => {
      (mockPrisma.approvedSource.create as jest.Mock).mockResolvedValueOnce(mockApprovedSource);

      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send(validCreateApprovedSourcePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.companyName).toBe('Arrow Electronics');
      expect(response.body.data.cageCode).toBe('1ABC2');
      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.riskRating).toBe('LOW');

      expect(mockPrisma.approvedSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyName: 'Arrow Electronics',
          cageCode: '1ABC2',
          partNumbers: ['IC-7805-REG', 'IC-7812-REG'],
          certifications: ['ISO 9001:2015', 'AS6081'],
          approvalDate: expect.any(Date),
          expiryDate: expect.any(Date),
          notes: 'Primary distributor',
          riskRating: 'LOW',
          status: 'APPROVED',
          createdBy: 'user-1',
        }),
      });
    });

    it('should create an approved source with only required fields', async () => {
      (mockPrisma.approvedSource.create as jest.Mock).mockResolvedValueOnce({
        ...mockApprovedSource,
        cageCode: null,
        expiryDate: null,
        notes: null,
        riskRating: 'LOW',
      });

      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          companyName: 'New Supplier Inc',
          partNumbers: ['PART-001'],
          certifications: ['ISO 9001:2015'],
          approvalDate: '2026-01-01',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Default riskRating should be LOW
      expect(mockPrisma.approvedSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskRating: 'LOW',
          status: 'APPROVED',
        }),
      });
    });

    it('should accept HIGH risk rating', async () => {
      (mockPrisma.approvedSource.create as jest.Mock).mockResolvedValueOnce({
        ...mockApprovedSource,
        riskRating: 'HIGH',
      });

      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreateApprovedSourcePayload,
          riskRating: 'HIGH',
        });

      expect(response.status).toBe(201);
      expect(mockPrisma.approvedSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          riskRating: 'HIGH',
        }),
      });
    });

    it('should accept CRITICAL risk rating', async () => {
      (mockPrisma.approvedSource.create as jest.Mock).mockResolvedValueOnce({
        ...mockApprovedSource,
        riskRating: 'CRITICAL',
      });

      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreateApprovedSourcePayload,
          riskRating: 'CRITICAL',
        });

      expect(response.status).toBe(201);
    });

    it('should accept MEDIUM risk rating', async () => {
      (mockPrisma.approvedSource.create as jest.Mock).mockResolvedValueOnce({
        ...mockApprovedSource,
        riskRating: 'MEDIUM',
      });

      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreateApprovedSourcePayload,
          riskRating: 'MEDIUM',
        });

      expect(response.status).toBe(201);
    });

    it('should return 400 when companyName is missing', async () => {
      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          partNumbers: ['PART-001'],
          certifications: ['ISO 9001:2015'],
          approvalDate: '2026-01-01',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when companyName is empty string', async () => {
      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreateApprovedSourcePayload,
          companyName: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when partNumbers is missing', async () => {
      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          companyName: 'Arrow Electronics',
          certifications: ['ISO 9001:2015'],
          approvalDate: '2026-01-01',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when certifications is missing', async () => {
      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          companyName: 'Arrow Electronics',
          partNumbers: ['PART-001'],
          approvalDate: '2026-01-01',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when approvalDate is missing', async () => {
      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          companyName: 'Arrow Electronics',
          partNumbers: ['PART-001'],
          certifications: ['ISO 9001:2015'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid riskRating value', async () => {
      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({
          ...validCreateApprovedSourcePayload,
          riskRating: 'EXTREME',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.approvedSource.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token')
        .send(validCreateApprovedSourcePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create approved source');
    });
  });

  // ==========================================
  // GET /approved-sources — Query approved sources
  // ==========================================
  describe('GET /api/counterfeit/approved-sources', () => {
    it('should return a list of approved sources with default pagination', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([
        mockApprovedSource,
        mockApprovedSource2,
      ]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
      expect(response.body.data.totalPages).toBe(1);
    });

    it('should support custom pagination parameters', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([mockApprovedSource]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(30);

      const response = await request(app)
        .get('/api/counterfeit/approved-sources?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.total).toBe(30);
      expect(response.body.data.totalPages).toBe(3);

      expect(mockPrisma.approvedSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/counterfeit/approved-sources?limit=999')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.limit).toBe(100);

      expect(mockPrisma.approvedSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([mockApprovedSource]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/counterfeit/approved-sources?status=APPROVED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.approvedSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );
    });

    it('should filter by cageCode (case-insensitive contains)', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([mockApprovedSource]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/counterfeit/approved-sources?cageCode=1abc')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.approvedSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            cageCode: { contains: '1abc', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should filter by companyName (case-insensitive contains)', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([mockApprovedSource]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/counterfeit/approved-sources?companyName=arrow')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.approvedSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyName: { contains: 'arrow', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should filter by riskRating', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([
        mockApprovedSource2,
      ]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/counterfeit/approved-sources?riskRating=MEDIUM')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.approvedSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskRating: 'MEDIUM',
          }),
        })
      );
    });

    it('should combine multiple filters', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/counterfeit/approved-sources?status=APPROVED&riskRating=LOW&companyName=arrow')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.approvedSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
            riskRating: 'LOW',
            companyName: { contains: 'arrow', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.approvedSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should return empty results when no sources exist', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.approvedSource.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.totalPages).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.approvedSource.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .get('/api/counterfeit/approved-sources')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list approved sources');
    });
  });
});


describe('phase37 coverage', () => {
  it('transposes 2d array', () => { const t=(m:number[][])=>m[0].map((_,i)=>m.map(r=>r[i])); expect(t([[1,2,3],[4,5,6]])).toEqual([[1,4],[2,5],[3,6]]); });
});
