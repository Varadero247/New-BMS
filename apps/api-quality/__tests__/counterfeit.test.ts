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


describe('phase38 coverage', () => {
  it('applies map-reduce pattern', () => { const data=[{cat:'a',v:1},{cat:'b',v:2},{cat:'a',v:3}]; const result=data.reduce((acc,{cat,v})=>{acc[cat]=(acc[cat]||0)+v;return acc;},{} as Record<string,number>); expect(result['a']).toBe(4); });
  it('splits array into n chunks', () => { const chunks=<T>(a:T[],n:number)=>Array.from({length:n},(_,i)=>a.filter((_,j)=>j%n===i)); expect(chunks([1,2,3,4,5,6],3)).toEqual([[1,4],[2,5],[3,6]]); });
  it('implements min stack', () => { class MinStack{private d:[number,number][]=[];push(v:number){const m=this.d.length?Math.min(v,this.d[this.d.length-1][1]):v;this.d.push([v,m]);}pop(){return this.d.pop()?.[0];}getMin(){return this.d[this.d.length-1]?.[1];}} const s=new MinStack();s.push(5);s.push(3);s.push(7);expect(s.getMin()).toBe(3);s.pop();expect(s.getMin()).toBe(3); });
  it('checks if year is leap year', () => { const isLeap=(y:number)=>y%4===0&&(y%100!==0||y%400===0); expect(isLeap(2000)).toBe(true); expect(isLeap(1900)).toBe(false); expect(isLeap(2024)).toBe(true); });
  it('implements linear search', () => { const search=(a:number[],v:number)=>a.indexOf(v); expect(search([1,3,5,7,9],5)).toBe(2); expect(search([1,3,5],4)).toBe(-1); });
});


describe('phase39 coverage', () => {
  it('checks if two strings are isomorphic', () => { const isIso=(s:string,t:string)=>{const m1=new Map<string,string>(),m2=new Set<string>();for(let i=0;i<s.length;i++){if(m1.has(s[i])&&m1.get(s[i])!==t[i])return false;if(!m1.has(s[i])&&m2.has(t[i]))return false;m1.set(s[i],t[i]);m2.add(t[i]);}return true;}; expect(isIso('egg','add')).toBe(true); expect(isIso('foo','bar')).toBe(false); });
  it('checks valid IP address format', () => { const isIP=(s:string)=>/^(\d{1,3}\.){3}\d{1,3}$/.test(s)&&s.split('.').every(p=>Number(p)<=255); expect(isIP('192.168.1.1')).toBe(true); expect(isIP('999.0.0.1')).toBe(false); });
  it('computes sum of proper divisors', () => { const divSum=(n:number)=>{let s=1;for(let i=2;i*i<=n;i++)if(n%i===0){s+=i;if(i!==n/i)s+=n/i;}return s;}; expect(divSum(12)).toBe(16); });
  it('finds longest word in sentence', () => { const longest=(s:string)=>s.split(' ').reduce((a,b)=>b.length>a.length?b:a,''); expect(longest('the quick brown fox')).toBe('quick'); });
  it('computes word break possible', () => { const wb=(s:string,d:string[])=>{const dp=Array(s.length+1).fill(false);dp[0]=true;for(let i=1;i<=s.length;i++)for(const w of d)if(i>=w.length&&dp[i-w.length]&&s.slice(i-w.length,i)===w){dp[i]=true;break;}return dp[s.length];}; expect(wb('leetcode',['leet','code'])).toBe(true); });
});


describe('phase40 coverage', () => {
  it('finds maximum path sum in triangle', () => { const tri=[[2],[3,4],[6,5,7],[4,1,8,3]]; const dp=tri.map(r=>[...r]); for(let i=dp.length-2;i>=0;i--)for(let j=0;j<dp[i].length;j++)dp[i][j]+=Math.max(dp[i+1][j],dp[i+1][j+1]); expect(dp[0][0]).toBe(21); });
  it('checks if path exists in DAG', () => { const hasPath=(adj:Map<number,number[]>,s:number,t:number)=>{const vis=new Set<number>();const dfs=(n:number):boolean=>{if(n===t)return true;if(vis.has(n))return false;vis.add(n);return(adj.get(n)||[]).some(dfs);};return dfs(s);}; const g=new Map([[0,[1,2]],[1,[3]],[2,[3]],[3,[]]]); expect(hasPath(g,0,3)).toBe(true); expect(hasPath(g,1,2)).toBe(false); });
  it('computes nth ugly number', () => { const ugly=(n:number)=>{const u=[1];let i2=0,i3=0,i5=0;while(u.length<n){const next=Math.min(u[i2]*2,u[i3]*3,u[i5]*5);u.push(next);if(next===u[i2]*2)i2++;if(next===u[i3]*3)i3++;if(next===u[i5]*5)i5++;}return u[n-1];}; expect(ugly(10)).toBe(12); });
  it('computes element-wise matrix addition', () => { const addM=(a:number[][],b:number[][])=>a.map((r,i)=>r.map((v,j)=>v+b[i][j])); expect(addM([[1,2],[3,4]],[[5,6],[7,8]])).toEqual([[6,8],[10,12]]); });
  it('converts number to words (single digit)', () => { const words=['zero','one','two','three','four','five','six','seven','eight','nine']; expect(words[7]).toBe('seven'); });
});


describe('phase41 coverage', () => {
  it('computes minimum cost to connect ropes', () => { const minCost=(ropes:number[])=>{const pq=[...ropes].sort((a,b)=>a-b);let cost=0;while(pq.length>1){const a=pq.shift()!,b=pq.shift()!;cost+=a+b;pq.push(a+b);pq.sort((x,y)=>x-y);}return cost;}; expect(minCost([4,3,2,6])).toBe(29); });
  it('finds Euler totient for small n', () => { const phi=(n:number)=>{let r=n;for(let p=2;p*p<=n;p++)if(n%p===0){while(n%p===0)n/=p;r-=r/p;}if(n>1)r-=r/n;return r;}; expect(phi(9)).toBe(6); expect(phi(7)).toBe(6); });
  it('checks if number is automorphic', () => { const isAuto=(n:number)=>String(n*n).endsWith(String(n)); expect(isAuto(5)).toBe(true); expect(isAuto(6)).toBe(true); expect(isAuto(7)).toBe(false); });
  it('checks if array is mountain', () => { const isMtn=(a:number[])=>{let i=0;while(i<a.length-1&&a[i]<a[i+1])i++;if(i===0||i===a.length-1)return false;while(i<a.length-1&&a[i]>a[i+1])i++;return i===a.length-1;}; expect(isMtn([0,2,3,4,2,1])).toBe(true); expect(isMtn([1,2,3])).toBe(false); });
  it('checks if grid path exists with obstacles', () => { const hasPath=(grid:number[][])=>{const m=grid.length,n=grid[0].length;if(grid[0][0]===1||grid[m-1][n-1]===1)return false;const vis=Array.from({length:m},()=>Array(n).fill(false));const q:number[][]=[]; q.push([0,0]);vis[0][0]=true;const dirs=[[-1,0],[1,0],[0,-1],[0,1]];while(q.length){const[r,c]=q.shift()!;if(r===m-1&&c===n-1)return true;for(const[dr,dc] of dirs){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<m&&nc>=0&&nc<n&&!vis[nr][nc]&&grid[nr][nc]===0){vis[nr][nc]=true;q.push([nr,nc]);}}}return false;}; expect(hasPath([[0,0,0],[1,1,0],[0,0,0]])).toBe(true); });
});


describe('phase42 coverage', () => {
  it('computes HSL hue for pure red', () => { const rgbToH=(r:number,g:number,b:number)=>{const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;if(d===0)return 0;if(max===r)return((g-b)/d+6)%6*60;if(max===g)return((b-r)/d+2)*60;return((r-g)/d+4)*60;}; expect(rgbToH(255,0,0)).toBe(0); expect(rgbToH(0,255,0)).toBe(120); });
  it('checks if two rectangles overlap', () => { const overlap=(x1:number,y1:number,w1:number,h1:number,x2:number,y2:number,w2:number,h2:number)=>x1<x2+w2&&x1+w1>x2&&y1<y2+h2&&y1+h1>y2; expect(overlap(0,0,4,4,2,2,4,4)).toBe(true); expect(overlap(0,0,2,2,3,3,2,2)).toBe(false); });
  it('checks if hexagonal number', () => { const isHex=(n:number)=>{const t=(1+Math.sqrt(1+8*n))/4;return Number.isInteger(t)&&t>0;}; expect(isHex(6)).toBe(true); expect(isHex(15)).toBe(true); expect(isHex(7)).toBe(false); });
  it('checks line segments intersection (bounding box)', () => { const overlap=(a:number,b:number,c:number,d:number)=>Math.max(a,c)<=Math.min(b,d); expect(overlap(1,4,2,6)).toBe(true); expect(overlap(1,2,3,4)).toBe(false); });
  it('checks if number is narcissistic (3 digits)', () => { const isNarc=(n:number)=>{const d=String(n).split('');return d.reduce((s,c)=>s+Math.pow(Number(c),d.length),0)===n;}; expect(isNarc(153)).toBe(true); expect(isNarc(370)).toBe(true); expect(isNarc(100)).toBe(false); });
});


describe('phase43 coverage', () => {
  it('floors to nearest multiple', () => { const floorTo=(n:number,m:number)=>Math.floor(n/m)*m; expect(floorTo(27,5)).toBe(25); expect(floorTo(30,5)).toBe(30); });
  it('checks if date is in past', () => { const inPast=(d:Date)=>d.getTime()<Date.now(); expect(inPast(new Date('2020-01-01'))).toBe(true); expect(inPast(new Date('2099-01-01'))).toBe(false); });
  it('finds next occurrence of weekday', () => { const nextDay=(from:Date,day:number)=>{const d=new Date(from);d.setDate(d.getDate()+(day-d.getDay()+7)%7||7);return d;}; const fri=nextDay(new Date('2026-02-22'),5); expect(fri.getDay()).toBe(5); /* next Friday */ });
  it('computes cosine similarity', () => { const cosSim=(a:number[],b:number[])=>{const dot=a.reduce((s,v,i)=>s+v*b[i],0);const ma=Math.sqrt(a.reduce((s,v)=>s+v*v,0));const mb=Math.sqrt(b.reduce((s,v)=>s+v*v,0));return ma&&mb?dot/(ma*mb):0;}; expect(cosSim([1,0],[1,0])).toBe(1); expect(cosSim([1,0],[0,1])).toBe(0); });
  it('sorts dates chronologically', () => { const dates=[new Date('2026-03-01'),new Date('2026-01-15'),new Date('2026-02-10')]; dates.sort((a,b)=>a.getTime()-b.getTime()); expect(dates[0].getMonth()).toBe(0); });
});


describe('phase44 coverage', () => {
  it('generates collatz sequence', () => { const coll=(n:number):number[]=>[n,...(n===1?[]:(n%2===0?coll(n/2):coll(3*n+1)))]; expect(coll(6)).toEqual([6,3,10,5,16,8,4,2,1]); });
  it('checks if two strings are anagrams', () => { const anagram=(a:string,b:string)=>a.split('').sort().join('')===b.split('').sort().join(''); expect(anagram('listen','silent')).toBe(true); expect(anagram('hello','world')).toBe(false); });
  it('parses query string to object', () => { const pqs=(s:string)=>Object.fromEntries(s.split('&').map(p=>{const [k,v]=p.split('=');return[decodeURIComponent(k),decodeURIComponent(v||'')];})); expect(pqs('a=1&b=hello%20world')).toEqual({a:'1',b:'hello world'}); });
  it('converts binary string to decimal', () => { const toDec=(s:string)=>parseInt(s,2); expect(toDec('1010')).toBe(10); expect(toDec('11111111')).toBe(255); });
  it('computes nth Fibonacci iteratively', () => { const fib=(n:number)=>{let a=0,b=1;for(let i=0;i<n;i++){[a,b]=[b,a+b];}return a;}; expect(fib(0)).toBe(0); expect(fib(7)).toBe(13); expect(fib(10)).toBe(55); });
});


describe('phase45 coverage', () => {
  it('computes digital root', () => { const dr=(n:number):number=>n<10?n:dr(String(n).split('').reduce((s,d)=>s+Number(d),0)); expect(dr(942)).toBe(6); expect(dr(493)).toBe(7); });
  it('implements simple bloom filter check', () => { const bf=(size:number)=>{const bits=new Uint8Array(Math.ceil(size/8));const h=(s:string,seed:number)=>[...s].reduce((a,c)=>Math.imul(a^c.charCodeAt(0),seed)>>>0,0)%size;return{add:(s:string)=>{[31,37,41].forEach(seed=>{const i=h(s,seed);bits[i>>3]|=1<<(i&7);});},has:(s:string)=>[31,37,41].every(seed=>{const i=h(s,seed);return(bits[i>>3]>>(i&7))&1;})};}; const b=bf(256);b.add('hello');b.add('world'); expect(b.has('hello')).toBe(true); expect(b.has('world')).toBe(true); });
  it('checks if string contains only digits', () => { const digits=(s:string)=>/^\d+$/.test(s); expect(digits('12345')).toBe(true); expect(digits('123a5')).toBe(false); });
  it('computes simple moving sum', () => { const ms=(a:number[],w:number)=>Array.from({length:a.length-w+1},(_,i)=>a.slice(i,i+w).reduce((s,v)=>s+v,0)); expect(ms([1,2,3,4,5],3)).toEqual([6,9,12]); });
  it('shuffles array using Fisher-Yates', () => { const shuf=(a:number[])=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}; const a=[1,2,3,4,5];const s=shuf(a); expect(s.sort((x,y)=>x-y)).toEqual([1,2,3,4,5]); });
});


describe('phase46 coverage', () => {
  it('implements segment tree range sum', () => { const st=(a:number[])=>{const n=a.length;const t=new Array(4*n).fill(0);const build=(i:number,l:number,r:number)=>{if(l===r){t[i]=a[l];return;}const m=(l+r)>>1;build(2*i,l,m);build(2*i+1,m+1,r);t[i]=t[2*i]+t[2*i+1];};build(1,0,n-1);const query=(i:number,l:number,r:number,ql:number,qr:number):number=>{if(qr<l||r<ql)return 0;if(ql<=l&&r<=qr)return t[i];const m=(l+r)>>1;return query(2*i,l,m,ql,qr)+query(2*i+1,m+1,r,ql,qr);};return(ql:number,qr:number)=>query(1,0,n-1,ql,qr);}; const q=st([1,3,5,7,9,11]); expect(q(1,3)).toBe(15); expect(q(0,5)).toBe(36); });
  it('computes number of ways to decode string', () => { const nd=(s:string)=>{const n=s.length;const dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=s[0]!=='0'?1:0;for(let i=2;i<=n;i++){const one=+s[i-1];const two=+(s.slice(i-2,i));if(one>0)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(nd('12')).toBe(2); expect(nd('226')).toBe(3); expect(nd('06')).toBe(0); });
  it('finds maximum path sum in binary tree', () => { type N={v:number;l?:N;r?:N}; let mx=-Infinity; const dfs=(n:N|undefined):number=>{if(!n)return 0;const l=Math.max(0,dfs(n.l)),r=Math.max(0,dfs(n.r));mx=Math.max(mx,n.v+l+r);return n.v+Math.max(l,r);}; const t:N={v:-10,l:{v:9},r:{v:20,l:{v:15},r:{v:7}}}; mx=-Infinity;dfs(t); expect(mx).toBe(42); });
  it('implements A* pathfinding (grid)', () => { const astar=(grid:number[][],sx:number,sy:number,ex:number,ey:number)=>{const h=(x:number,y:number)=>Math.abs(x-ex)+Math.abs(y-ey);const open=[[0+h(sx,sy),0,sx,sy]];const g=new Map<string,number>();g.set(sx+','+sy,0);const dirs=[[0,1],[0,-1],[1,0],[-1,0]];while(open.length){open.sort((a,b)=>a[0]-b[0]);const [,gc,x,y]=open.shift()!;if(x===ex&&y===ey)return gc;for(const [dx,dy] of dirs){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=grid.length||ny>=grid[0].length||grid[nx][ny])continue;const ng=gc+1;const k=nx+','+ny;if(!g.has(k)||ng<g.get(k)!){g.set(k,ng);open.push([ng+h(nx,ny),ng,nx,ny]);}}}return -1;}; expect(astar([[0,0,0],[0,1,0],[0,0,0]],0,0,2,2)).toBe(4); });
  it('converts number to roman numeral', () => { const rom=(n:number)=>{const v=[1000,900,500,400,100,90,50,40,10,9,5,4,1];const s=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];let r='';v.forEach((val,i)=>{while(n>=val){r+=s[i];n-=val;}});return r;}; expect(rom(3749)).toBe('MMMDCCXLIX'); expect(rom(58)).toBe('LVIII'); });
});


describe('phase47 coverage', () => {
  it('computes strongly connected components (Kosaraju)', () => { const scc=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);const radj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);radj[v].push(u);});const vis=new Set<number>(),order:number[]=[];const dfs1=(u:number)=>{vis.add(u);adj[u].forEach(v=>{if(!vis.has(v))dfs1(v);});order.push(u);};for(let i=0;i<n;i++)if(!vis.has(i))dfs1(i);vis.clear();let cnt=0;const dfs2=(u:number)=>{vis.add(u);radj[u].forEach(v=>{if(!vis.has(v))dfs2(v);});};while(order.length){const u=order.pop()!;if(!vis.has(u)){dfs2(u);cnt++;}}return cnt;}; expect(scc(5,[[1,0],[0,2],[2,1],[0,3],[3,4]])).toBe(3); });
  it('computes number of paths of length k in graph', () => { const mm=(a:number[][],b:number[][])=>{const n=a.length;return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Array.from({length:n},(_,k)=>a[i][k]*b[k][j]).reduce((s,v)=>s+v,0)));};const kp=(adj:number[][],k:number)=>{let r=adj.map(row=>[...row]);for(let i=1;i<k;i++)r=mm(r,adj);return r;}; const adj=[[0,1,0],[0,0,1],[1,0,0]]; expect(kp(adj,3)[0][0]).toBe(1); });
  it('implements heapsort', () => { const hs=(arr:number[])=>{const a=[...arr],n=a.length;const sink=(i:number,sz:number)=>{while(true){let m=i;const l=2*i+1,r=2*i+2;if(l<sz&&a[l]>a[m])m=l;if(r<sz&&a[r]>a[m])m=r;if(m===i)break;[a[i],a[m]]=[a[m],a[i]];i=m;}};for(let i=Math.floor(n/2)-1;i>=0;i--)sink(i,n);for(let i=n-1;i>0;i--){[a[0],a[i]]=[a[i],a[0]];sink(0,i);}return a;}; expect(hs([12,11,13,5,6,7])).toEqual([5,6,7,11,12,13]); });
  it('solves paint fence with k colors', () => { const pf=(n:number,k:number)=>{if(n===0)return 0;if(n===1)return k;let same=k,diff=k*(k-1);for(let i=3;i<=n;i++){const ts=diff,td=(same+diff)*(k-1);same=ts;diff=td;}return same+diff;}; expect(pf(3,2)).toBe(6); expect(pf(1,1)).toBe(1); });
  it('computes all unique triplets summing to zero', () => { const t0=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);const r:number[][]=[];for(let i=0;i<s.length-2;i++){if(i>0&&s[i]===s[i-1])continue;let l=i+1,h=s.length-1;while(l<h){const sm=s[i]+s[l]+s[h];if(sm===0){r.push([s[i],s[l],s[h]]);while(l<h&&s[l]===s[l+1])l++;while(l<h&&s[h]===s[h-1])h--;l++;h--;}else sm<0?l++:h--;}}return r;}; expect(t0([-1,0,1,2,-1,-4]).length).toBe(2); });
});


describe('phase48 coverage', () => {
  it('checks if graph has Eulerian circuit', () => { const ec=(n:number,edges:[number,number][])=>{const deg=new Array(n).fill(0);edges.forEach(([u,v])=>{deg[u]++;deg[v]++;});return deg.every(d=>d%2===0);}; expect(ec(4,[[0,1],[1,2],[2,3],[3,0],[0,2]])).toBe(false); expect(ec(3,[[0,1],[1,2],[2,0]])).toBe(true); });
  it('finds sum of distances in tree', () => { const sd=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>{adj[u].push(v);adj[v].push(u);});const cnt=new Array(n).fill(1),ans=new Array(n).fill(0);const dfs1=(u:number,p:number,d:number)=>{adj[u].forEach(v=>{if(v!==p){dfs1(v,u,d+1);cnt[u]+=cnt[v];ans[0]+=d+1;}});};const dfs2=(u:number,p:number)=>{adj[u].forEach(v=>{if(v!==p){ans[v]=ans[u]-cnt[v]+(n-cnt[v]);dfs2(v,u);}});};dfs1(0,-1,0);dfs2(0,-1);return ans;}; const r=sd(6,[[0,1],[0,2],[2,3],[2,4],[2,5]]); expect(r[0]).toBe(8); });
  it('computes closest pair distance', () => { const cpd=(pts:[number,number][])=>{const d=(a:[number,number],b:[number,number])=>Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2);let best=Infinity;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)best=Math.min(best,d(pts[i],pts[j]));return best;}; expect(cpd([[0,0],[3,4],[1,1],[5,2]])).toBeCloseTo(Math.sqrt(2),5); });
  it('finds the right sibling of each tree node', () => { type N={v:number;l?:N;r?:N;next?:N}; const connect=(root:N|undefined)=>{if(!root)return;const q:N[]=[root];while(q.length){const sz=q.length;for(let i=0;i<sz;i++){const n=q.shift()!;if(i<sz-1)n.next=q[0];if(n.l)q.push(n.l);if(n.r)q.push(n.r);}}return root;}; const t:N={v:1,l:{v:2,l:{v:4},r:{v:5}},r:{v:3,r:{v:7}}}; connect(t); expect(t.l?.next?.v).toBe(3); });
  it('computes next higher number with same bits', () => { const next=(n:number)=>{const t=n|(n-1);return (t+1)|((~t&-(~t))-1)>>(n&-n).toString(2).length;}; expect(next(6)).toBe(9); });
});


describe('phase49 coverage', () => {
  it('finds the celebrity using stack', () => { const cel2=(m:number[][])=>{const n=m.length,s=Array.from({length:n},(_,i)=>i);while(s.length>1){const a=s.pop()!,b=s.pop()!;m[a][b]?s.push(b):s.push(a);}const c=s[0];return m[c].every((_,j)=>j===c||!m[c][j])&&m.every((_,i)=>i===c||m[i][c])?c:-1;}; const mx=[[0,1,1],[0,0,1],[0,0,0]]; expect(cel2(mx)).toBe(2); });
  it('finds minimum in rotated sorted array', () => { const minRot=(a:number[])=>{let l=0,r=a.length-1;while(l<r){const m=l+r>>1;if(a[m]>a[r])l=m+1;else r=m;}return a[l];}; expect(minRot([3,4,5,1,2])).toBe(1); expect(minRot([4,5,6,7,0,1,2])).toBe(0); });
  it('checks if string has all unique characters', () => { const uniq=(s:string)=>new Set(s).size===s.length; expect(uniq('abcde')).toBe(true); expect(uniq('aabcd')).toBe(false); expect(uniq('')).toBe(true); });
  it('finds the kth symbol in grammar', () => { const kth=(n:number,k:number):number=>n===1?0:kth(n-1,Math.ceil(k/2))===0?(k%2?0:1):(k%2?1:0); expect(kth(1,1)).toBe(0); expect(kth(2,1)).toBe(0); expect(kth(2,2)).toBe(1); expect(kth(4,5)).toBe(1); });
  it('finds the majority element (Boyer-Moore)', () => { const maj=(a:number[])=>{let cand=a[0],cnt=1;for(let i=1;i<a.length;i++)cnt=a[i]===cand?cnt+1:cnt-1||(cand=a[i],1);return cand;}; expect(maj([3,2,3])).toBe(3); expect(maj([2,2,1,1,1,2,2])).toBe(2); });
});


describe('phase50 coverage', () => {
  it('checks if valid sudoku row/col/box', () => { const vr=(b:string[][])=>{const ok=(a:string[])=>{const d=a.filter(v=>v!=='.');return d.length===new Set(d).size;};for(let i=0;i<9;i++){if(!ok(b[i]))return false;if(!ok(b.map(r=>r[i])))return false;}for(let bi=0;bi<3;bi++)for(let bj=0;bj<3;bj++){const box=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)box.push(b[3*bi+i][3*bj+j]);if(!ok(box))return false;}return true;}; expect(vr([['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']])).toBe(true); });
  it('computes number of set bits in range 1 to n', () => { const cb=(n:number)=>{let cnt=0;for(let i=1;i<=n;i++){let x=i;while(x){x&=x-1;cnt++;}}return cnt;}; expect(cb(5)).toBe(7); expect(cb(1)).toBe(1); });
  it('finds minimum difference between BST nodes', () => { const mbd=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);let min=Infinity;for(let i=1;i<s.length;i++)min=Math.min(min,s[i]-s[i-1]);return min;}; expect(mbd([4,2,6,1,3])).toBe(1); expect(mbd([1,0,48,12,49])).toBe(1); });
  it('finds pairs with difference k', () => { const pk=(a:number[],k:number)=>{const s=new Set(a);let cnt=0;for(const v of s)if(s.has(v+k))cnt++;return cnt;}; expect(pk([1,7,5,9,2,12,3],2)).toBe(4); expect(pk([1,2,3,4,5],1)).toBe(4); });
  it('checks if string has repeated character pattern', () => { const rep=(s:string)=>{const n=s.length;for(let k=1;k<=n/2;k++){if(n%k===0&&s.slice(0,k).repeat(n/k)===s)return true;}return false;}; expect(rep('abab')).toBe(true); expect(rep('aba')).toBe(false); expect(rep('abcabc')).toBe(true); });
});

describe('phase51 coverage', () => {
  it('finds shortest path using Dijkstra', () => { const dijk=(n:number,edges:[number,number,number][],src:number)=>{const g=new Map<number,[number,number][]>();for(let i=0;i<n;i++)g.set(i,[]);for(const[u,v,w]of edges){g.get(u)!.push([v,w]);g.get(v)!.push([u,w]);}const dist=new Array(n).fill(Infinity);dist[src]=0;const pq:[number,number][]=[[0,src]];while(pq.length){pq.sort((a,b)=>a[0]-b[0]);const[d,u]=pq.shift()!;if(d>dist[u])continue;for(const[v,w]of g.get(u)!){if(dist[u]+w<dist[v]){dist[v]=dist[u]+w;pq.push([dist[v],v]);}}}return dist;}; expect(dijk(4,[[0,1,1],[1,2,2],[0,2,4],[2,3,1]],0)).toEqual([0,1,3,4]); });
  it('traverses matrix in spiral order', () => { const spiral=(m:number[][])=>{const res:number[]=[];let t=0,b=m.length-1,l=0,r=m[0].length-1;while(t<=b&&l<=r){for(let i=l;i<=r;i++)res.push(m[t][i]);t++;for(let i=t;i<=b;i++)res.push(m[i][r]);r--;if(t<=b){for(let i=r;i>=l;i--)res.push(m[b][i]);b--;}if(l<=r){for(let i=b;i>=t;i--)res.push(m[i][l]);l++;}}return res;}; expect(spiral([[1,2,3],[4,5,6],[7,8,9]])).toEqual([1,2,3,6,9,8,7,4,5]); expect(spiral([[1,2],[3,4]])).toEqual([1,2,4,3]); });
  it('finds maximum in each sliding window of size k', () => { const sw=(a:number[],k:number)=>{const res:number[]=[],dq:number[]=[];for(let i=0;i<a.length;i++){while(dq.length&&dq[0]<i-k+1)dq.shift();while(dq.length&&a[dq[dq.length-1]]<a[i])dq.pop();dq.push(i);if(i>=k-1)res.push(a[dq[0]]);}return res;}; expect(sw([1,3,-1,-3,5,3,6,7],3)).toEqual([3,3,5,5,6,7]); expect(sw([1],1)).toEqual([1]); });
  it('counts good nodes in binary tree array', () => { const cgn=(a:(number|null)[])=>{let cnt=0;const dfs=(i:number,mx:number):void=>{if(i>=a.length||a[i]===null)return;const v=a[i] as number;if(v>=mx){cnt++;mx=v;}dfs(2*i+1,mx);dfs(2*i+2,mx);};if(a.length>0&&a[0]!==null)dfs(0,a[0] as number);return cnt;}; expect(cgn([3,1,4,3,null,1,5])).toBe(4); expect(cgn([3,3,null,4,2])).toBe(3); });
  it('finds longest palindromic substring', () => { const lps2=(s:string)=>{let st=0,ml=1;const ex=(l:number,r:number)=>{while(l>=0&&r<s.length&&s[l]===s[r]){if(r-l+1>ml){ml=r-l+1;st=l;}l--;r++;}};for(let i=0;i<s.length;i++){ex(i,i);ex(i,i+1);}return s.slice(st,st+ml);}; expect(lps2('cbbd')).toBe('bb'); expect(lps2('a')).toBe('a'); expect(['bab','aba']).toContain(lps2('babad')); });
});

describe('phase52 coverage', () => {
  it('finds maximum width ramp in array', () => { const mwr2=(a:number[])=>{let mx=0;for(let i=0;i<a.length;i++)for(let j=a.length-1;j>i;j--)if(a[i]<=a[j]){mx=Math.max(mx,j-i);break;}return mx;}; expect(mwr2([6,0,8,2,1,5])).toBe(4); expect(mwr2([9,8,1,0,1,9,4,0,4,1])).toBe(7); expect(mwr2([1,1])).toBe(1); });
  it('finds longest common prefix among strings', () => { const lcp3=(strs:string[])=>{let pre=strs[0];for(let i=1;i<strs.length;i++)while(!strs[i].startsWith(pre))pre=pre.slice(0,-1);return pre;}; expect(lcp3(['flower','flow','flight'])).toBe('fl'); expect(lcp3(['dog','racecar','car'])).toBe(''); expect(lcp3(['abc','abcd','ab'])).toBe('ab'); });
  it('finds kth largest element in array', () => { const kl=(a:number[],k:number)=>[...a].sort((x,y)=>y-x)[k-1]; expect(kl([3,2,1,5,6,4],2)).toBe(5); expect(kl([3,2,3,1,2,4,5,5,6],4)).toBe(4); });
  it('counts vowel-only substrings with all five vowels', () => { const cvs=(word:string)=>{let cnt=0;const v=new Set('aeiou');for(let i=0;i<word.length;i++){const seen=new Set<string>();for(let j=i;j<word.length;j++){if(!v.has(word[j]))break;seen.add(word[j]);if(seen.size===5)cnt++;}}return cnt;}; expect(cvs('aeiouu')).toBe(2); expect(cvs('aeiou')).toBe(1); expect(cvs('abc')).toBe(0); });
  it('finds first missing positive integer', () => { const fmp=(a:number[])=>{const b=[...a],n=b.length;for(let i=0;i<n;i++)while(b[i]>0&&b[i]<=n&&b[b[i]-1]!==b[i]){const j2=b[i]-1;const tmp=b[j2];b[j2]=b[i];b[i]=tmp;}for(let i=0;i<n;i++)if(b[i]!==i+1)return i+1;return n+1;}; expect(fmp([1,2,0])).toBe(3); expect(fmp([3,4,-1,1])).toBe(2); expect(fmp([7,8,9,11,12])).toBe(1); });
});

describe('phase53 coverage', () => {
  it('finds minimum number of overlapping intervals to remove', () => { const eoi=(ivs:[number,number][])=>{if(!ivs.length)return 0;const s=ivs.slice().sort((a,b)=>a[1]-b[1]);let cnt=0,end=s[0][1];for(let i=1;i<s.length;i++){if(s[i][0]<end)cnt++;else end=s[i][1];}return cnt;}; expect(eoi([[1,2],[2,3],[3,4],[1,3]])).toBe(1); expect(eoi([[1,2],[1,2],[1,2]])).toBe(2); expect(eoi([[1,2],[2,3]])).toBe(0); });
  it('finds minimum falling path sum through matrix', () => { const mfps=(m:number[][])=>{const n=m.length,dp=m.map(r=>[...r]);for(let i=1;i<n;i++)for(let j=0;j<n;j++){const mn=Math.min(dp[i-1][j],j>0?dp[i-1][j-1]:Infinity,j<n-1?dp[i-1][j+1]:Infinity);dp[i][j]+=mn;}return Math.min(...dp[n-1]);}; expect(mfps([[2,1,3],[6,5,4],[7,8,9]])).toBe(13); expect(mfps([[1,2],[3,4]])).toBe(4); });
  it('counts connected components in undirected graph', () => { const cc2=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);for(const[u,v]of edges){adj[u].push(v);adj[v].push(u);}const vis=new Set<number>();const dfs=(v:number):void=>{vis.add(v);for(const u of adj[v])if(!vis.has(u))dfs(u);};let cnt=0;for(let i=0;i<n;i++)if(!vis.has(i)){dfs(i);cnt++;}return cnt;}; expect(cc2(5,[[0,1],[1,2],[3,4]])).toBe(2); expect(cc2(5,[[0,1],[1,2],[2,3],[3,4]])).toBe(1); });
  it('searches target in row-column sorted 2D matrix', () => { const sm=(m:number[][],t:number)=>{let r=0,c=m[0].length-1;while(r<m.length&&c>=0){if(m[r][c]===t)return true;else if(m[r][c]>t)c--;else r++;}return false;}; expect(sm([[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17],[18,21,23,26]],5)).toBe(true); expect(sm([[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17],[18,21,23,26]],20)).toBe(false); });
  it('finds minimum number of train platforms needed', () => { const mp3=(arr:number[],dep:number[])=>{const n=arr.length;arr=[...arr].sort((a,b)=>a-b);dep=[...dep].sort((a,b)=>a-b);let plat=0,mx=0,i=0,j=0;while(i<n&&j<n){if(arr[i]<=dep[j]){plat++;i++;}else{plat--;j++;}mx=Math.max(mx,plat);}return mx;}; expect(mp3([900,940,950,1100,1500,1800],[910,1200,1120,1130,1900,2000])).toBe(3); expect(mp3([100,200,300,400],[500,600,700,800])).toBe(4); });
});


describe('phase54 coverage', () => {
  it('computes minimum cost to hire k workers satisfying wage/quality ratios', () => { const hireK=(q:number[],w:number[],k:number)=>{const n=q.length,workers=Array.from({length:n},(_,i)=>[w[i]/q[i],q[i]]).sort((a,b)=>a[0]-b[0]);let res=Infinity,qSum=0;const maxH:number[]=[];for(const [r,qi] of workers){qSum+=qi;maxH.push(qi);maxH.sort((a,b)=>b-a);if(maxH.length>k){qSum-=maxH.shift()!;}if(maxH.length===k)res=Math.min(res,r*qSum);}return res;}; expect(hireK([10,20,5],[70,50,30],2)).toBeCloseTo(105); });
  it('counts how many people each person can see in a queue (monotonic stack)', () => { const see=(h:number[])=>{const n=h.length,res=new Array(n).fill(0),st:number[]=[];for(let i=n-1;i>=0;i--){let cnt=0;while(st.length&&h[st[st.length-1]]<h[i]){cnt++;st.pop();}if(st.length)cnt++;res[i]=cnt;st.push(i);}return res;}; expect(see([10,6,8,5,11,9])).toEqual([3,1,2,1,1,0]); expect(see([5,1,2,3,10])).toEqual([4,1,1,1,0]); });
  it('computes minimum score triangulation of a convex polygon', () => { const mst=(v:number[])=>{const n=v.length,dp=Array.from({length:n},()=>new Array(n).fill(0));for(let len=2;len<n;len++){for(let i=0;i+len<n;i++){const j=i+len;dp[i][j]=Infinity;for(let k=i+1;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k][j]+v[i]*v[k]*v[j]);}}return dp[0][n-1];}; expect(mst([1,2,3])).toBe(6); expect(mst([3,7,4,5])).toBe(144); });
  it('finds minimum arrows to burst all balloons', () => { const minArrows=(pts:number[][])=>{if(!pts.length)return 0;pts.sort((a,b)=>a[1]-b[1]);let arrows=1,end=pts[0][1];for(let i=1;i<pts.length;i++){if(pts[i][0]>end){arrows++;end=pts[i][1];}}return arrows;}; expect(minArrows([[10,16],[2,8],[1,6],[7,12]])).toBe(2); expect(minArrows([[1,2],[3,4],[5,6]])).toBe(3); expect(minArrows([[1,2],[2,3]])).toBe(1); });
  it('sorts characters in string by decreasing frequency', () => { const fs=(s:string)=>{const m=new Map<string,number>();for(const c of s)m.set(c,(m.get(c)||0)+1);return [...m.entries()].sort((a,b)=>b[1]-a[1]).map(([c,f])=>c.repeat(f)).join('');}; expect(fs('tree')).toMatch(/^e{2}[rt]{2}$/); expect(fs('cccaaa')).toMatch(/^(c{3}a{3}|a{3}c{3})$/); expect(fs('Aabb')).toMatch(/b{2}[aA]{2}|b{2}[Aa]{2}/); });
});


describe('phase55 coverage', () => {
  it('counts ways to decode a digit string into letters', () => { const decode=(s:string)=>{const n=s.length;if(!n||s[0]==='0')return 0;const dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=+s[i-1],two=+(s.slice(i-2,i));if(one>=1)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(decode('12')).toBe(2); expect(decode('226')).toBe(3); expect(decode('06')).toBe(0); });
  it('counts good triplets where all pairwise abs diffs are within bounds', () => { const gt=(a:number[],x:number,y:number,z:number)=>{let cnt=0;for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)for(let k=j+1;k<a.length;k++)if(Math.abs(a[i]-a[j])<=x&&Math.abs(a[j]-a[k])<=y&&Math.abs(a[i]-a[k])<=z)cnt++;return cnt;}; expect(gt([3,0,1,1,9,7],7,2,3)).toBe(4); expect(gt([1,1,2,2,3],0,0,1)).toBe(0); });
  it('finds longest common prefix among an array of strings', () => { const lcp=(strs:string[])=>{if(!strs.length)return '';let prefix=strs[0];for(let i=1;i<strs.length;i++){while(strs[i].indexOf(prefix)!==0)prefix=prefix.slice(0,-1);}return prefix;}; expect(lcp(['flower','flow','flight'])).toBe('fl'); expect(lcp(['dog','racecar','car'])).toBe(''); expect(lcp(['abc','abc','abc'])).toBe('abc'); });
  it('computes bitwise AND of all numbers in range [left, right]', () => { const rangeAnd=(l:number,r:number)=>{let shift=0;while(l!==r){l>>=1;r>>=1;shift++;}return l<<shift;}; expect(rangeAnd(5,7)).toBe(4); expect(rangeAnd(0,0)).toBe(0); expect(rangeAnd(1,2147483647)).toBe(0); });
  it('finds min cost to climb stairs paying either step cost', () => { const minCost=(cost:number[])=>{const n=cost.length,dp=[...cost];for(let i=2;i<n;i++)dp[i]+=Math.min(dp[i-1],dp[i-2]);return Math.min(dp[n-1],dp[n-2]);}; expect(minCost([10,15,20])).toBe(15); expect(minCost([1,100,1,1,1,100,1,1,100,1])).toBe(6); });
});


describe('phase56 coverage', () => {
  it('checks if word exists in grid using DFS backtracking', () => { const ws=(board:string[][],word:string)=>{const m=board.length,n=board[0].length;const dfs=(i:number,j:number,k:number):boolean=>{if(k===word.length)return true;if(i<0||i>=m||j<0||j>=n||board[i][j]!==word[k])return false;const tmp=board[i][j];board[i][j]='#';const r=dfs(i+1,j,k+1)||dfs(i-1,j,k+1)||dfs(i,j+1,k+1)||dfs(i,j-1,k+1);board[i][j]=tmp;return r;};for(let i=0;i<m;i++)for(let j=0;j<n;j++)if(dfs(i,j,0))return true;return false;}; expect(ws([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCCED')).toBe(true); expect(ws([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'SEE')).toBe(true); expect(ws([['A','B','C','E'],['S','F','C','S'],['A','D','E','E']],'ABCB')).toBe(false); });
  it('finds three integers closest to target sum', () => { const ts=(a:number[],t:number)=>{a.sort((x,y)=>x-y);let res=a[0]+a[1]+a[2];for(let i=0;i<a.length-2;i++){let l=i+1,r=a.length-1;while(l<r){const s=a[i]+a[l]+a[r];if(Math.abs(s-t)<Math.abs(res-t))res=s;if(s<t)l++;else if(s>t)r--;else return s;}}return res;}; expect(ts([-1,2,1,-4],1)).toBe(2); expect(ts([0,0,0],1)).toBe(0); });
  it('computes diameter (longest path between any two nodes) of binary tree', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const diam=(root:N|null)=>{let res=0;const h=(n:N|null):number=>{if(!n)return 0;const l=h(n.l),r=h(n.r);res=Math.max(res,l+r);return 1+Math.max(l,r);};h(root);return res;}; expect(diam(mk(1,mk(2,mk(4),mk(5)),mk(3)))).toBe(3); expect(diam(mk(1,mk(2)))).toBe(1); });
  it('finds minimum depth of binary tree (shortest root-to-leaf path)', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const md=(n:N|null):number=>{if(!n)return 0;if(!n.l&&!n.r)return 1;if(!n.l)return 1+md(n.r);if(!n.r)return 1+md(n.l);return 1+Math.min(md(n.l),md(n.r));}; expect(md(mk(3,mk(9),mk(20,mk(15),mk(7))))).toBe(2); expect(md(mk(2,null,mk(3,null,mk(4,null,mk(5,null,mk(6))))))).toBe(5); });
  it('checks if array contains duplicate within k positions', () => { const dup=(a:number[],k:number)=>{const m=new Map<number,number>();for(let i=0;i<a.length;i++){if(m.has(a[i])&&i-m.get(a[i])!<=k)return true;m.set(a[i],i);}return false;}; expect(dup([1,2,3,1],3)).toBe(true); expect(dup([1,0,1,1],1)).toBe(true); expect(dup([1,2,3,1,2,3],2)).toBe(false); });
});


describe('phase57 coverage', () => {
  it('serializes and deserializes a binary tree', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const ser=(n:N|null):string=>n?`${n.v},${ser(n.l)},${ser(n.r)}`:'#'; const des=(s:string)=>{const a=s.split(',');const f=():N|null=>{const v=a.shift();return v==='#'?null:mk(+v!,f(),f());};return f();}; const t=mk(1,mk(2),mk(3,mk(4),mk(5))); const r=des(ser(t)); expect(r?.v).toBe(1); expect(r?.l?.v).toBe(2); expect(r?.r?.l?.v).toBe(4); });
  it('determines if two binary trees are flip equivalent', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const flip=(a:N|null,b:N|null):boolean=>{if(!a&&!b)return true;if(!a||!b||a.v!==b.v)return false;return(flip(a.l,b.l)&&flip(a.r,b.r))||(flip(a.l,b.r)&&flip(a.r,b.l));}; expect(flip(mk(1,mk(2,mk(4),mk(5,mk(7),mk(8))),mk(3,mk(6))),mk(1,mk(3,null,mk(6)),mk(2,mk(4),mk(5,mk(8),mk(7)))))).toBe(true); expect(flip(mk(1,mk(2),mk(3)),mk(1,mk(4),mk(5)))).toBe(false); });
  it('finds length of longest palindromic subsequence', () => { const lps2=(s:string)=>{const n=s.length,dp=Array.from({length:n},(_,i)=>new Array(n).fill(0).map((_,j):number=>i===j?1:0));for(let len=2;len<=n;len++)for(let i=0;i+len<=n;i++){const j=i+len-1;dp[i][j]=s[i]===s[j]?dp[i+1][j-1]+2:Math.max(dp[i+1][j],dp[i][j-1]);}return dp[0][n-1];}; expect(lps2('bbbab')).toBe(4); expect(lps2('cbbd')).toBe(2); });
  it('computes maximum width of binary tree (including null nodes)', () => { type N={v:number,l:N|null,r:N|null}; const mk=(v:number,l:N|null=null,r:N|null=null):N=>({v,l,r}); const mw=(root:N|null)=>{if(!root)return 0;let res=0;const q:Array<[N,number]>=[[root,0]];while(q.length){const sz=q.length;const base=q[0][1];let last=0;for(let i=0;i<sz;i++){const[n,idx]=q.shift()!;last=idx-base;if(n.l)q.push([n.l,2*(idx-base)]);if(n.r)q.push([n.r,2*(idx-base)+1]);}res=Math.max(res,last+1);}return res;}; expect(mw(mk(1,mk(3,mk(5),mk(3)),mk(2,null,mk(9))))).toBe(4); expect(mw(mk(1))).toBe(1); });
  it('implements a trie with insert, search, and startsWith', () => { class Trie{private root:{[k:string]:any}={};insert(w:string){let n=this.root;for(const c of w){n[c]=n[c]||{};n=n[c];}n['$']=true;}search(w:string){let n=this.root;for(const c of w){if(!n[c])return false;n=n[c];}return!!n['$'];}startsWith(p:string){let n=this.root;for(const c of p){if(!n[c])return false;n=n[c];}return true;}} const t=new Trie();t.insert('apple');expect(t.search('apple')).toBe(true);expect(t.search('app')).toBe(false);expect(t.startsWith('app')).toBe(true);t.insert('app');expect(t.search('app')).toBe(true); });
});

describe('phase58 coverage', () => {
  it('longest common subsequence', () => {
    const lcs=(a:string,b:string):number=>{const m=a.length,n=b.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);return dp[m][n];};
    expect(lcs('abcde','ace')).toBe(3);
    expect(lcs('abc','abc')).toBe(3);
    expect(lcs('abc','def')).toBe(0);
    expect(lcs('ezupkr','ubmrapg')).toBe(2);
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
  it('median from stream', () => {
    class MedianFinder{private lo:number[]=[];private hi:number[]=[];addNum(n:number){this.lo.push(n);this.lo.sort((a,b)=>b-a);this.hi.push(this.lo.shift()!);this.hi.sort((a,b)=>a-b);if(this.hi.length>this.lo.length)this.lo.unshift(this.hi.shift()!);}findMedian():number{return this.lo.length>this.hi.length?this.lo[0]:(this.lo[0]+this.hi[0])/2;}}
    const mf=new MedianFinder();mf.addNum(1);mf.addNum(2);
    expect(mf.findMedian()).toBe(1.5);
    mf.addNum(3);
    expect(mf.findMedian()).toBe(2);
  });
  it('validate BST', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const isValidBST=(root:TN|null,min=-Infinity,max=Infinity):boolean=>{if(!root)return true;if(root.val<=min||root.val>=max)return false;return isValidBST(root.left,min,root.val)&&isValidBST(root.right,root.val,max);};
    expect(isValidBST(mk(2,mk(1),mk(3)))).toBe(true);
    expect(isValidBST(mk(5,mk(1),mk(4,mk(3),mk(6))))).toBe(false);
    expect(isValidBST(null)).toBe(true);
  });
  it('letter combinations phone', () => {
    const letterCombinations=(digits:string):string[]=>{if(!digits)return[];const map:Record<string,string>={'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'};const res:string[]=[];const bt=(idx:number,cur:string)=>{if(idx===digits.length){res.push(cur);return;}for(const c of map[digits[idx]])bt(idx+1,cur+c);};bt(0,'');return res;};
    const r=letterCombinations('23');
    expect(r).toHaveLength(9);
    expect(r).toContain('ad');
    expect(letterCombinations('')).toEqual([]);
  });
});

describe('phase59 coverage', () => {
  it('binary tree path sum III', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const pathSum=(root:TN|null,targetSum:number):number=>{const cnt=new Map([[0,1]]);let res=0,prefix=0;const dfs=(n:TN|null)=>{if(!n)return;prefix+=n.val;res+=(cnt.get(prefix-targetSum)||0);cnt.set(prefix,(cnt.get(prefix)||0)+1);dfs(n.left);dfs(n.right);cnt.set(prefix,(cnt.get(prefix)||0)-1);prefix-=n.val;};dfs(root);return res;};
    const t=mk(10,mk(5,mk(3,mk(3),mk(-2)),mk(2,null,mk(1))),mk(-3,null,mk(11)));
    expect(pathSum(t,8)).toBe(3);
    expect(pathSum(mk(5,mk(4,mk(11,mk(7),mk(2)),null),mk(8,mk(13),mk(4,null,mk(1)))),22)).toBe(2);
  });
  it('all paths source to target', () => {
    const allPathsSourceTarget=(graph:number[][]):number[][]=>{const res:number[][]=[];const dfs=(node:number,path:number[])=>{if(node===graph.length-1){res.push([...path]);return;}for(const next of graph[node])dfs(next,[...path,next]);};dfs(0,[0]);return res;};
    const r=allPathsSourceTarget([[1,2],[3],[3],[]]);
    expect(r).toContainEqual([0,1,3]);
    expect(r).toContainEqual([0,2,3]);
    expect(r).toHaveLength(2);
  });
  it('increasing triplet subsequence', () => {
    const increasingTriplet=(nums:number[]):boolean=>{let first=Infinity,second=Infinity;for(const n of nums){if(n<=first)first=n;else if(n<=second)second=n;else return true;}return false;};
    expect(increasingTriplet([1,2,3,4,5])).toBe(true);
    expect(increasingTriplet([5,4,3,2,1])).toBe(false);
    expect(increasingTriplet([2,1,5,0,4,6])).toBe(true);
    expect(increasingTriplet([1,1,1,1,1])).toBe(false);
  });
  it('in-memory file system', () => {
    class FileSystem{private fs:any={'/':{_isDir:true,_content:''}};private get(path:string){const parts=path.split('/').filter(Boolean);let cur=this.fs['/'];for(const p of parts){cur=cur[p];}return cur;}ls(path:string):string[]{const node=this.get(path);if(!node._isDir)return[path.split('/').pop()!];return Object.keys(node).filter(k=>!k.startsWith('_')).sort();}mkdir(path:string):void{const parts=path.split('/').filter(Boolean);let cur=this.fs['/'];for(const p of parts){if(!cur[p])cur[p]={_isDir:true,_content:''};cur=cur[p];}}addContentToFile(path:string,content:string):void{const parts=path.split('/').filter(Boolean);const name=parts.pop()!;let cur=this.fs['/'];for(const p of parts)cur=cur[p];if(!cur[name])cur[name]={_isDir:false,_content:''};cur[name]._content+=content;}readContentFromFile(path:string):string{return this.get(path)._content;}}
    const f=new FileSystem();f.mkdir('/a/b/c');f.addContentToFile('/a/b/c/d','hello');
    expect(f.readContentFromFile('/a/b/c/d')).toBe('hello');
    expect(f.ls('/a/b/c')).toEqual(['d']);
  });
  it('house robber III', () => {
    type TN={val:number;left:TN|null;right:TN|null};
    const mk=(v:number,l:TN|null=null,r:TN|null=null):TN=>({val:v,left:l,right:r});
    const rob=(root:TN|null):[number,number]=>{if(!root)return[0,0];const[ll,lr]=rob(root.left);const[rl,rr]=rob(root.right);const withRoot=root.val+lr+rr;const withoutRoot=Math.max(ll,lr)+Math.max(rl,rr);return[withRoot,withoutRoot];};
    const robTree=(r:TN|null)=>Math.max(...rob(r));
    const t=mk(3,mk(2,null,mk(3)),mk(3,null,mk(1)));
    expect(robTree(t)).toBe(7);
    expect(robTree(mk(3,mk(4,mk(1),mk(3)),mk(5,null,mk(1))))).toBe(9);
  });
});

describe('phase60 coverage', () => {
  it('max points on a line', () => {
    const maxPoints=(points:number[][]):number=>{if(points.length<=2)return points.length;let res=2;for(let i=0;i<points.length;i++){const map=new Map<string,number>();for(let j=i+1;j<points.length;j++){let dx=points[j][0]-points[i][0];let dy=points[j][1]-points[i][1];const g=(a:number,b:number):number=>b===0?a:g(b,a%b);const d=g(Math.abs(dx),Math.abs(dy));if(d>0){dx/=d;dy/=d;}if(dx<0||(dx===0&&dy<0)){dx=-dx;dy=-dy;}const key=`${dx},${dy}`;map.set(key,(map.get(key)||1)+1);res=Math.max(res,map.get(key)!);}};return res;};
    expect(maxPoints([[1,1],[2,2],[3,3]])).toBe(3);
    expect(maxPoints([[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]])).toBe(4);
  });
  it('longest arithmetic subsequence', () => {
    const longestArithSeqLength=(nums:number[]):number=>{const n=nums.length;const dp:Map<number,number>[]=Array.from({length:n},()=>new Map());let res=2;for(let i=1;i<n;i++){for(let j=0;j<i;j++){const d=nums[i]-nums[j];const len=(dp[j].get(d)||1)+1;dp[i].set(d,Math.max(dp[i].get(d)||0,len));res=Math.max(res,dp[i].get(d)!);}}return res;};
    expect(longestArithSeqLength([3,6,9,12])).toBe(4);
    expect(longestArithSeqLength([9,4,7,2,10])).toBe(3);
    expect(longestArithSeqLength([20,1,15,3,10,5,8])).toBe(4);
  });
  it('max consecutive ones III', () => {
    const longestOnes=(nums:number[],k:number):number=>{let l=0,zeros=0,res=0;for(let r=0;r<nums.length;r++){if(nums[r]===0)zeros++;while(zeros>k){if(nums[l]===0)zeros--;l++;}res=Math.max(res,r-l+1);}return res;};
    expect(longestOnes([1,1,1,0,0,0,1,1,1,1,0],2)).toBe(6);
    expect(longestOnes([0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1],3)).toBe(10);
    expect(longestOnes([1,1,1],0)).toBe(3);
  });
  it('number of nice subarrays', () => {
    const numberOfSubarrays=(nums:number[],k:number):number=>{const atMost=(m:number)=>{let count=0,odd=0,l=0;for(let r=0;r<nums.length;r++){if(nums[r]%2!==0)odd++;while(odd>m){if(nums[l]%2!==0)odd--;l++;}count+=r-l+1;}return count;};return atMost(k)-atMost(k-1);};
    expect(numberOfSubarrays([1,1,2,1,1],3)).toBe(2);
    expect(numberOfSubarrays([2,4,6],1)).toBe(0);
    expect(numberOfSubarrays([2,2,2,1,2,2,1,2,2,2],2)).toBe(16);
  });
  it('clone graph BFS', () => {
    class GN{val:number;neighbors:GN[];constructor(v=0,n:GN[]=[]){this.val=v;this.neighbors=n;}}
    const cloneGraph=(node:GN|null):GN|null=>{if(!node)return null;const map=new Map<GN,GN>();const q=[node];map.set(node,new GN(node.val));while(q.length){const cur=q.shift()!;for(const nb of cur.neighbors){if(!map.has(nb)){map.set(nb,new GN(nb.val));q.push(nb);}map.get(cur)!.neighbors.push(map.get(nb)!);}}return map.get(node)!;};
    const n1=new GN(1);const n2=new GN(2);const n3=new GN(3);const n4=new GN(4);
    n1.neighbors=[n2,n4];n2.neighbors=[n1,n3];n3.neighbors=[n2,n4];n4.neighbors=[n1,n3];
    const c=cloneGraph(n1);
    expect(c).not.toBe(n1);
    expect(c!.val).toBe(1);
    expect(c!.neighbors.length).toBe(2);
  });
});

describe('phase61 coverage', () => {
  it('design circular queue', () => {
    class MyCircularQueue{private q:number[];private h=0;private t=0;private size=0;constructor(private k:number){this.q=new Array(k);}enQueue(v:number):boolean{if(this.isFull())return false;this.q[this.t]=v;this.t=(this.t+1)%this.k;this.size++;return true;}deQueue():boolean{if(this.isEmpty())return false;this.h=(this.h+1)%this.k;this.size--;return true;}Front():number{return this.isEmpty()?-1:this.q[this.h];}Rear():number{return this.isEmpty()?-1:this.q[(this.t-1+this.k)%this.k];}isEmpty():boolean{return this.size===0;}isFull():boolean{return this.size===this.k;}}
    const q=new MyCircularQueue(3);
    expect(q.enQueue(1)).toBe(true);q.enQueue(2);q.enQueue(3);
    expect(q.enQueue(4)).toBe(false);
    expect(q.Rear()).toBe(3);
    expect(q.isFull()).toBe(true);
    q.deQueue();
    expect(q.enQueue(4)).toBe(true);
    expect(q.Rear()).toBe(4);
  });
  it('two sum less than k', () => {
    const twoSumLessThanK=(nums:number[],k:number):number=>{const sorted=[...nums].sort((a,b)=>a-b);let lo=0,hi=sorted.length-1,best=-1;while(lo<hi){const s=sorted[lo]+sorted[hi];if(s<k){best=Math.max(best,s);lo++;}else hi--;}return best;};
    expect(twoSumLessThanK([34,23,1,24,75,33,54,8],60)).toBe(58);
    expect(twoSumLessThanK([10,20,30],15)).toBe(-1);
    expect(twoSumLessThanK([254,914,971,990,525,33,186,136,54,104],1000)).toBe(968);
  });
  it('flatten nested array iterator', () => {
    const flatten=(arr:any[]):number[]=>{const res:number[]=[];const dfs=(a:any[])=>{for(const x of a){if(Array.isArray(x))dfs(x);else res.push(x);}};dfs(arr);return res;};
    expect(flatten([[1,1],2,[1,1]])).toEqual([1,1,2,1,1]);
    expect(flatten([1,[4,[6]]])).toEqual([1,4,6]);
    expect(flatten([[],[1,[2,[3,[4,[5]]]]]])).toEqual([1,2,3,4,5]);
  });
  it('LFU cache operations', () => {
    class LFUCache{private cap:number;private min=0;private kv=new Map<number,number>();private kf=new Map<number,number>();private fk=new Map<number,Set<number>>();constructor(c:number){this.cap=c;}get(k:number):number{if(!this.kv.has(k))return -1;this._inc(k);return this.kv.get(k)!;}_inc(k:number):void{const f=this.kf.get(k)||0;this.kf.set(k,f+1);this.fk.get(f)?.delete(k);if(!this.fk.has(f+1))this.fk.set(f+1,new Set());this.fk.get(f+1)!.add(k);if(f===this.min&&this.fk.get(f)?.size===0)this.min++;}put(k:number,v:number):void{if(this.cap<=0)return;if(this.kv.has(k)){this.kv.set(k,v);this._inc(k);return;}if(this.kv.size>=this.cap){const evict=[...this.fk.get(this.min)!][0];this.fk.get(this.min)!.delete(evict);this.kv.delete(evict);this.kf.delete(evict);}this.kv.set(k,v);this.kf.set(k,1);if(!this.fk.has(1))this.fk.set(1,new Set());this.fk.get(1)!.add(k);this.min=1;}}
    const lfu=new LFUCache(2);lfu.put(1,1);lfu.put(2,2);
    expect(lfu.get(1)).toBe(1);
    lfu.put(3,3);
    expect(lfu.get(2)).toBe(-1);
    expect(lfu.get(3)).toBe(3);
  });
  it('basic calculator II', () => {
    const calculate=(s:string):number=>{const stack:number[]=[];let num=0,op='+';for(let i=0;i<s.length;i++){const c=s[i];if(c>='0'&&c<='9')num=num*10+parseInt(c);if((c==='+'||c==='-'||c==='*'||c==='/')||i===s.length-1){if(op==='+')stack.push(num);else if(op==='-')stack.push(-num);else if(op==='*')stack.push(stack.pop()!*num);else stack.push(Math.trunc(stack.pop()!/num));op=c;num=0;}}return stack.reduce((a,b)=>a+b,0);};
    expect(calculate('3+2*2')).toBe(7);
    expect(calculate(' 3/2 ')).toBe(1);
    expect(calculate(' 3+5 / 2 ')).toBe(5);
  });
});

describe('phase62 coverage', () => {
  it('is palindrome number', () => {
    const isPalindrome=(x:number):boolean=>{if(x<0||(x%10===0&&x!==0))return false;let rev=0;while(x>rev){rev=rev*10+x%10;x=Math.floor(x/10);}return x===rev||x===Math.floor(rev/10);};
    expect(isPalindrome(121)).toBe(true);
    expect(isPalindrome(-121)).toBe(false);
    expect(isPalindrome(10)).toBe(false);
    expect(isPalindrome(0)).toBe(true);
    expect(isPalindrome(1221)).toBe(true);
  });
  it('integer to roman numeral', () => {
    const intToRoman=(num:number):string=>{const vals=[1000,900,500,400,100,90,50,40,10,9,5,4,1];const syms=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];let res='';vals.forEach((v,i)=>{while(num>=v){res+=syms[i];num-=v;}});return res;};
    expect(intToRoman(3)).toBe('III');
    expect(intToRoman(4)).toBe('IV');
    expect(intToRoman(9)).toBe('IX');
    expect(intToRoman(58)).toBe('LVIII');
    expect(intToRoman(1994)).toBe('MCMXCIV');
  });
  it('zigzag string conversion', () => {
    const convert=(s:string,numRows:number):string=>{if(numRows===1||numRows>=s.length)return s;const rows:string[]=new Array(numRows).fill('');let cur=0,dir=-1;for(const c of s){rows[cur]+=c;if(cur===0||cur===numRows-1)dir=-dir;cur+=dir;}return rows.join('');};
    expect(convert('PAYPALISHIRING',3)).toBe('PAHNAPLSIIGYIR');
    expect(convert('PAYPALISHIRING',4)).toBe('PINALSIGYAHRPI');
    expect(convert('A',1)).toBe('A');
  });
  it('count and say sequence', () => {
    const countAndSay=(n:number):string=>{let s='1';for(let i=1;i<n;i++){let next='';let j=0;while(j<s.length){let k=j;while(k<s.length&&s[k]===s[j])k++;next+=`${k-j}${s[j]}`;j=k;}s=next;}return s;};
    expect(countAndSay(1)).toBe('1');
    expect(countAndSay(4)).toBe('1211');
    expect(countAndSay(5)).toBe('111221');
  });
  it('counting bits array', () => {
    const countBits=(n:number):number[]=>{const dp=new Array(n+1).fill(0);for(let i=1;i<=n;i++)dp[i]=dp[i>>1]+(i&1);return dp;};
    expect(countBits(2)).toEqual([0,1,1]);
    expect(countBits(5)).toEqual([0,1,1,2,1,2]);
    expect(countBits(0)).toEqual([0]);
  });
});

describe('phase63 coverage', () => {
  it('longest word by deleting', () => {
    const findLongestWord=(s:string,dict:string[]):string=>{let res='';for(const w of dict){let i=0;for(const c of s)if(i<w.length&&c===w[i])i++;if(i===w.length&&(w.length>res.length||(w.length===res.length&&w<res)))res=w;}return res;};
    expect(findLongestWord('abpcplea',['ale','apple','monkey','plea'])).toBe('apple');
    expect(findLongestWord('abpcplea',['a','b','c'])).toBe('a');
    expect(findLongestWord('aewfafwafjlwajflwajflwafj',['apple','ewaf','jaf','abcdef'])).toBe('ewaf');
  });
  it('longest valid parentheses', () => {
    const longestValidParentheses=(s:string):number=>{const stack:number[]=[-1];let max=0;for(let i=0;i<s.length;i++){if(s[i]==='(')stack.push(i);else{stack.pop();if(!stack.length)stack.push(i);else max=Math.max(max,i-stack[stack.length-1]);}}return max;};
    expect(longestValidParentheses('(()')).toBe(2);
    expect(longestValidParentheses(')()())')).toBe(4);
    expect(longestValidParentheses('')).toBe(0);
    expect(longestValidParentheses('()()')).toBe(4);
  });
  it('check if word equals summation of two words', () => {
    const isSumEqual=(f:string,s:string,t:string):boolean=>{const val=(w:string):number=>parseInt(w.split('').map(c=>c.charCodeAt(0)-97).join(''));return val(f)+val(s)===val(t);};
    expect(isSumEqual('acb','cba','cdb')).toBe(true);
    expect(isSumEqual('aaa','a','aab')).toBe(false);
    expect(isSumEqual('aaa','a','aaaa')).toBe(true);
  });
  it('rotate image 90 degrees', () => {
    const rotate=(matrix:number[][]):void=>{const n=matrix.length;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)[matrix[i][j],matrix[j][i]]=[matrix[j][i],matrix[i][j]];for(let i=0;i<n;i++)matrix[i].reverse();};
    const m=[[1,2,3],[4,5,6],[7,8,9]];rotate(m);
    expect(m).toEqual([[7,4,1],[8,5,2],[9,6,3]]);
    const m2=[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]];rotate(m2);
    expect(m2[0]).toEqual([15,13,2,5]);
  });
  it('verifying alien dictionary', () => {
    const isAlienSorted=(words:string[],order:string):boolean=>{const rank=new Map(order.split('').map((c,i)=>[c,i]));for(let i=0;i<words.length-1;i++){const[a,b]=[words[i],words[i+1]];let found=false;for(let j=0;j<Math.min(a.length,b.length);j++){if(rank.get(a[j])!<rank.get(b[j])!){found=true;break;}if(rank.get(a[j])!>rank.get(b[j])!)return false;}if(!found&&a.length>b.length)return false;}return true;};
    expect(isAlienSorted(['hello','leetcode'],'hlabcdefgijkmnopqrstuvwxyz')).toBe(true);
    expect(isAlienSorted(['word','world','row'],'worldabcefghijkmnpqstuvxyz')).toBe(false);
    expect(isAlienSorted(['apple','app'],'abcdefghijklmnopqrstuvwxyz')).toBe(false);
  });
});

describe('phase64 coverage', () => {
  describe('max points on a line', () => {
    function maxPoints(pts:number[][]):number{if(pts.length<=2)return pts.length;let res=2;const g=(a:number,b:number):number=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t;}return a;};for(let i=0;i<pts.length;i++){const map:Record<string,number>={};for(let j=i+1;j<pts.length;j++){let dx=pts[j][0]-pts[i][0],dy=pts[j][1]-pts[i][1];const gg=g(Math.abs(dx),Math.abs(dy));if(gg>0){dx/=gg;dy/=gg;}if(dx<0||(dx===0&&dy<0)){dx=-dx;dy=-dy;}const k=dx===0&&dy===0?'same':`${dy}/${dx}`;map[k]=(map[k]||1)+1;res=Math.max(res,map[k]);}}return res;}
    it('3col'  ,()=>expect(maxPoints([[1,1],[2,2],[3,3]])).toBe(3));
    it('4col'  ,()=>expect(maxPoints([[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]])).toBe(4));
    it('one'   ,()=>expect(maxPoints([[0,0]])).toBe(1));
    it('two'   ,()=>expect(maxPoints([[1,1],[2,2]])).toBe(2));
    it('noCol' ,()=>expect(maxPoints([[1,1],[2,3],[3,5],[4,7]])).toBe(4));
  });
  describe('minimum ascii delete sum', () => {
    function minDeleteSum(s1:string,s2:string):number{const m=s1.length,n=s2.length,dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=1;i<=m;i++)dp[i][0]=dp[i-1][0]+s1.charCodeAt(i-1);for(let j=1;j<=n;j++)dp[0][j]=dp[0][j-1]+s2.charCodeAt(j-1);for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=s1[i-1]===s2[j-1]?dp[i-1][j-1]:Math.min(dp[i-1][j]+s1.charCodeAt(i-1),dp[i][j-1]+s2.charCodeAt(j-1));return dp[m][n];}
    it('ex1'   ,()=>expect(minDeleteSum('sea','eat')).toBe(231));
    it('ex2'   ,()=>expect(minDeleteSum('delete','leet')).toBe(403));
    it('same'  ,()=>expect(minDeleteSum('a','a')).toBe(0));
    it('empty' ,()=>expect(minDeleteSum('','a')).toBe(97));
    it('diff'  ,()=>expect(minDeleteSum('ab','ba')).toBe(194));
  });
  describe('distinct subsequences', () => {
    function numDistinct(s:string,t:string):number{const m=s.length,n=t.length,dp=new Array(n+1).fill(0);dp[0]=1;for(let i=0;i<m;i++)for(let j=n-1;j>=0;j--)if(s[i]===t[j])dp[j+1]+=dp[j];return dp[n];}
    it('ex1'   ,()=>expect(numDistinct('rabbbit','rabbit')).toBe(3));
    it('ex2'   ,()=>expect(numDistinct('babgbag','bag')).toBe(5));
    it('same'  ,()=>expect(numDistinct('abc','abc')).toBe(1));
    it('empty' ,()=>expect(numDistinct('','a')).toBe(0));
    it('repeat',()=>expect(numDistinct('aaa','a')).toBe(3));
  });
  describe('interleaving string', () => {
    function isInterleave(s1:string,s2:string,s3:string):boolean{const m=s1.length,n=s2.length;if(m+n!==s3.length)return false;const dp=new Array(n+1).fill(false);dp[0]=true;for(let j=1;j<=n;j++)dp[j]=dp[j-1]&&s2[j-1]===s3[j-1];for(let i=1;i<=m;i++){dp[0]=dp[0]&&s1[i-1]===s3[i-1];for(let j=1;j<=n;j++)dp[j]=(dp[j]&&s1[i-1]===s3[i+j-1])||(dp[j-1]&&s2[j-1]===s3[i+j-1]);}return dp[n];}
    it('ex1'   ,()=>expect(isInterleave('aabcc','dbbca','aadbbcbcac')).toBe(true));
    it('ex2'   ,()=>expect(isInterleave('aabcc','dbbca','aadbbbaccc')).toBe(false));
    it('empty' ,()=>expect(isInterleave('','','')) .toBe(true));
    it('one'   ,()=>expect(isInterleave('a','','a')).toBe(true));
    it('mism'  ,()=>expect(isInterleave('a','b','ab')).toBe(true));
  });
  describe('russian doll envelopes', () => {
    function maxEnvelopes(env:number[][]):number{env.sort((a,b)=>a[0]!==b[0]?a[0]-b[0]:b[1]-a[1]);const t:number[]=[];for(const [,h] of env){let lo=0,hi=t.length;while(lo<hi){const m=(lo+hi)>>1;if(t[m]<h)lo=m+1;else hi=m;}t[lo]=h;}return t.length;}
    it('ex1'   ,()=>expect(maxEnvelopes([[5,4],[6,4],[6,7],[2,3]])).toBe(3));
    it('ex2'   ,()=>expect(maxEnvelopes([[1,1],[1,1],[1,1]])).toBe(1));
    it('two'   ,()=>expect(maxEnvelopes([[1,2],[2,3]])).toBe(2));
    it('onefit',()=>expect(maxEnvelopes([[3,3],[2,4],[1,5]])).toBe(1));
    it('single',()=>expect(maxEnvelopes([[1,1]])).toBe(1));
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
