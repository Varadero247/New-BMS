import express from 'express';
import request from 'supertest';

// ── Mocks ───────────────────────────────────────────────────────────

jest.mock('../src/prisma', () => ({
  prisma: {
    deviceMasterRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    deviceHistoryRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    dHRRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    DeviceMasterRecordWhereInput: {},
    DeviceHistoryRecordWhereInput: {},
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
import dmrDhrRouter from '../src/routes/dmr-dhr';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockDMR = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'DMR-2602-0001',
  deviceName: 'Cardiac Pacemaker Model X',
  deviceClass: 'CLASS_III',
  description: 'Implantable cardiac pacemaker',
  specifications: 'FDA 510(k) cleared specs',
  productionProcesses: 'Cleanroom manufacturing process',
  qualityProcedures: 'QMS-MED-001',
  acceptanceCriteria: 'Visual inspection + electrical test',
  labellingSpecs: 'UDI compliant labelling',
  packagingSpecs: 'Sterile barrier packaging',
  installationProcs: 'Surgical implantation guide',
  servicingProcs: 'Periodic follow-up procedures',
  status: 'DRAFT',
  currentVersion: '1.0',
  approvedBy: null,
  approvedDate: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-02-01'),
};

const mockDMR2 = {
  id: '20000000-0000-4000-a000-000000000002',
  refNumber: 'DMR-2602-0002',
  deviceName: 'Blood Glucose Monitor',
  deviceClass: 'CLASS_II',
  description: 'In-vitro diagnostic glucose monitor',
  specifications: null,
  productionProcesses: null,
  qualityProcedures: null,
  acceptanceCriteria: null,
  labellingSpecs: null,
  packagingSpecs: null,
  installationProcs: null,
  servicingProcs: null,
  status: 'APPROVED',
  currentVersion: '2.0',
  approvedBy: 'admin@ims.local',
  approvedDate: new Date('2026-01-20'),
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-10'),
  updatedAt: new Date('2026-01-20'),
};

const mockDHR = {
  id: '30000000-0000-4000-a000-000000000001',
  refNumber: 'DHR-2602-0001',
  dmrId: '20000000-0000-4000-a000-000000000001',
  batchNumber: 'BATCH-2026-001',
  manufacturingDate: new Date('2026-02-01'),
  quantityManufactured: 500,
  labelsUsed: 'UDI-L001',
  primaryId: 'PID-001',
  status: 'IN_PRODUCTION',
  releasedBy: null,
  releaseDate: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockDHR2 = {
  id: '30000000-0000-4000-a000-000000000002',
  refNumber: 'DHR-2602-0002',
  dmrId: '20000000-0000-4000-a000-000000000001',
  batchNumber: 'BATCH-2026-002',
  manufacturingDate: new Date('2026-02-05'),
  quantityManufactured: 200,
  labelsUsed: null,
  primaryId: null,
  status: 'IN_PRODUCTION',
  releasedBy: null,
  releaseDate: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-05'),
};

const mockDHRRecord = {
  id: 'rec-0001',
  dhrId: '30000000-0000-4000-a000-000000000001',
  recordType: 'INCOMING_INSPECTION',
  title: 'Raw Material Inspection',
  description: 'Inspection of incoming titanium alloy',
  result: 'Pass - within spec',
  pass: true,
  documentRef: 'DOC-INS-001',
  performedBy: 'Inspector A',
  performedDate: new Date('2026-02-02'),
  createdAt: new Date('2026-02-02'),
  updatedAt: new Date('2026-02-02'),
};

const mockDHRRecordFailed = {
  id: 'rec-0002',
  dhrId: '30000000-0000-4000-a000-000000000001',
  recordType: 'FINAL_INSPECTION',
  title: 'Final QC Inspection',
  description: 'Final quality check',
  result: 'Fail - surface defect detected',
  pass: false,
  documentRef: 'DOC-INS-002',
  performedBy: 'Inspector B',
  performedDate: new Date('2026-02-03'),
  createdAt: new Date('2026-02-03'),
  updatedAt: new Date('2026-02-03'),
};

const validCreateDMRPayload = {
  deviceName: 'Cardiac Pacemaker Model X',
  deviceClass: 'CLASS_III',
  description: 'Implantable cardiac pacemaker',
  specifications: 'FDA 510(k) cleared specs',
  productionProcesses: 'Cleanroom manufacturing process',
  qualityProcedures: 'QMS-MED-001',
  acceptanceCriteria: 'Visual inspection + electrical test',
  labellingSpecs: 'UDI compliant labelling',
  packagingSpecs: 'Sterile barrier packaging',
  installationProcs: 'Surgical implantation guide',
  servicingProcs: 'Periodic follow-up procedures',
};

const validCreateDHRPayload = {
  dmrId: '20000000-0000-4000-a000-000000000001',
  batchNumber: 'BATCH-2026-001',
  manufacturingDate: '2026-02-01',
  quantityManufactured: 500,
  labelsUsed: 'UDI-L001',
  primaryId: 'PID-001',
};

const validCreateRecordPayload = {
  recordType: 'INCOMING_INSPECTION',
  title: 'Raw Material Inspection',
  description: 'Inspection of incoming titanium alloy',
  result: 'Pass - within spec',
  pass: true,
  documentRef: 'DOC-INS-001',
  performedBy: 'Inspector A',
  performedDate: '2026-02-02',
};

// ==========================================
// Tests
// ==========================================

describe('Medical DMR/DHR API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', dmrDhrRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST /dmr - Create Device Master Record
  // ==========================================
  describe('POST /api/dmr', () => {
    it('should create a DMR with all fields successfully', async () => {
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.deviceMasterRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        id: 'new-dmr-id',
      });

      const response = await request(app)
        .post('/api/dmr')
        .set('Authorization', 'Bearer token')
        .send(validCreateDMRPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.deviceName).toBe('Cardiac Pacemaker Model X');

      expect(mockPrisma.deviceMasterRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          deviceName: 'Cardiac Pacemaker Model X',
          deviceClass: 'CLASS_III',
          description: 'Implantable cardiac pacemaker',
          specifications: 'FDA 510(k) cleared specs',
          productionProcesses: 'Cleanroom manufacturing process',
          qualityProcedures: 'QMS-MED-001',
          acceptanceCriteria: 'Visual inspection + electrical test',
          labellingSpecs: 'UDI compliant labelling',
          packagingSpecs: 'Sterile barrier packaging',
          installationProcs: 'Surgical implantation guide',
          servicingProcs: 'Periodic follow-up procedures',
          status: 'DRAFT',
          currentVersion: '1.0',
          createdBy: 'user-1',
        }),
      });
    });

    it('should create a DMR with only required fields', async () => {
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(2);
      (mockPrisma.deviceMasterRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        id: 'new-dmr-id',
        refNumber: 'DMR-2602-0003',
        description: undefined,
      });

      const response = await request(app)
        .post('/api/dmr')
        .set('Authorization', 'Bearer token')
        .send({
          deviceName: 'Simple Device',
          deviceClass: 'CLASS_I',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should generate a proper reference number with padded sequence', async () => {
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.deviceMasterRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        refNumber: 'DMR-2602-0006',
      });

      await request(app)
        .post('/api/dmr')
        .set('Authorization', 'Bearer token')
        .send(validCreateDMRPayload);

      expect(mockPrisma.deviceMasterRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringMatching(/^DMR-\d{4}-\d{4}$/),
        }),
      });
    });

    it('should return 400 when deviceName is missing', async () => {
      const response = await request(app)
        .post('/api/dmr')
        .set('Authorization', 'Bearer token')
        .send({
          deviceClass: 'CLASS_III',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toBeDefined();
    });

    it('should return 400 when deviceName is empty', async () => {
      const response = await request(app)
        .post('/api/dmr')
        .set('Authorization', 'Bearer token')
        .send({
          deviceName: '',
          deviceClass: 'CLASS_II',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when deviceClass is missing', async () => {
      const response = await request(app)
        .post('/api/dmr')
        .set('Authorization', 'Bearer token')
        .send({
          deviceName: 'Test Device',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid deviceClass value', async () => {
      const response = await request(app)
        .post('/api/dmr')
        .set('Authorization', 'Bearer token')
        .send({
          deviceName: 'Test Device',
          deviceClass: 'CLASS_IV',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept all valid deviceClass enum values', async () => {
      const validClasses = ['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIA', 'CLASS_IIB'];

      for (const deviceClass of validClasses) {
        jest.clearAllMocks();
        (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(0);
        (mockPrisma.deviceMasterRecord.create as jest.Mock).mockResolvedValueOnce({
          ...mockDMR,
          deviceClass,
        });

        const response = await request(app)
          .post('/api/dmr')
          .set('Authorization', 'Bearer token')
          .send({ deviceName: 'Test Device', deviceClass });

        expect(response.status).toBe(201);
      }
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.deviceMasterRecord.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/dmr')
        .set('Authorization', 'Bearer token')
        .send(validCreateDMRPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create device master record');
    });
  });

  // ==========================================
  // GET /dmr - List Device Master Records
  // ==========================================
  describe('GET /api/dmr', () => {
    it('should return a list of DMRs with default pagination', async () => {
      (mockPrisma.deviceMasterRecord.findMany as jest.Mock).mockResolvedValueOnce([
        mockDMR,
        mockDMR2,
      ]);
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/dmr').set('Authorization', 'Bearer token');

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
      (mockPrisma.deviceMasterRecord.findMany as jest.Mock).mockResolvedValueOnce([mockDMR]);
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/dmr?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(50);
      expect(response.body.meta.totalPages).toBe(5);

      expect(mockPrisma.deviceMasterRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.deviceMasterRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/dmr?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
      expect(mockPrisma.deviceMasterRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.deviceMasterRecord.findMany as jest.Mock).mockResolvedValueOnce([mockDMR2]);
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/dmr?status=APPROVED').set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceMasterRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by deviceClass', async () => {
      (mockPrisma.deviceMasterRecord.findMany as jest.Mock).mockResolvedValueOnce([mockDMR]);
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/dmr?deviceClass=CLASS_III').set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceMasterRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deviceClass: 'CLASS_III',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by deviceName (case-insensitive contains)', async () => {
      (mockPrisma.deviceMasterRecord.findMany as jest.Mock).mockResolvedValueOnce([mockDMR]);
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/dmr?deviceName=cardiac').set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceMasterRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deviceName: { contains: 'cardiac', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should return empty list when no DMRs exist', async () => {
      (mockPrisma.deviceMasterRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app).get('/api/dmr').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
      expect(response.body.meta.totalPages).toBe(0);
    });

    it('should order results by createdAt descending', async () => {
      (mockPrisma.deviceMasterRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/dmr').set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceMasterRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceMasterRecord.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get('/api/dmr').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list device master records');
    });
  });

  // ==========================================
  // GET /dmr/:id - Get DMR with DHR records
  // ==========================================
  describe('GET /api/dmr/:id', () => {
    it('should return a DMR with associated DHRs', async () => {
      const dmrWithDhrs = {
        ...mockDMR,
        dhrs: [mockDHR, mockDHR2],
        _count: { dhrs: 2 },
      };
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(dmrWithDhrs);

      const response = await request(app)
        .get(`/api/dmr/${mockDMR.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockDMR.id);
      expect(response.body.data.dhrs).toHaveLength(2);
      expect(response.body.data._count.dhrs).toBe(2);

      expect(mockPrisma.deviceMasterRecord.findUnique).toHaveBeenCalledWith({
        where: { id: mockDMR.id },
        include: {
          dhrs: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { dhrs: true },
          },
        },
      });
    });

    it('should return 404 when DMR is not found', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/dmr/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Device master record not found');
    });

    it('should return 404 when DMR is soft-deleted', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        deletedAt: new Date(),
        dhrs: [],
        _count: { dhrs: 0 },
      });

      const response = await request(app)
        .get(`/api/dmr/${mockDMR.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get(`/api/dmr/${mockDMR.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get device master record');
    });
  });

  // ==========================================
  // PUT /dmr/:id - Update DMR
  // ==========================================
  describe('PUT /api/dmr/:id', () => {
    it('should update a DMR successfully', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDMR);
      (mockPrisma.deviceMasterRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        deviceName: 'Updated Pacemaker',
        description: 'Updated description',
      });

      const response = await request(app)
        .put(`/api/dmr/${mockDMR.id}`)
        .set('Authorization', 'Bearer token')
        .send({ deviceName: 'Updated Pacemaker', description: 'Updated description' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deviceName).toBe('Updated Pacemaker');
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should update deviceClass successfully', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDMR);
      (mockPrisma.deviceMasterRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        deviceClass: 'CLASS_IIB',
      });

      const response = await request(app)
        .put(`/api/dmr/${mockDMR.id}`)
        .set('Authorization', 'Bearer token')
        .send({ deviceClass: 'CLASS_IIB' });

      expect(response.status).toBe(200);
      expect(response.body.data.deviceClass).toBe('CLASS_IIB');

      expect(mockPrisma.deviceMasterRecord.update).toHaveBeenCalledWith({
        where: { id: mockDMR.id },
        data: { deviceClass: 'CLASS_IIB' },
      });
    });

    it('should return 404 when DMR does not exist', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/dmr/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ deviceName: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Device master record not found');
    });

    it('should return 404 when DMR is soft-deleted', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .put(`/api/dmr/${mockDMR.id}`)
        .set('Authorization', 'Bearer token')
        .send({ deviceName: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid deviceClass value', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDMR);

      const response = await request(app)
        .put(`/api/dmr/${mockDMR.id}`)
        .set('Authorization', 'Bearer token')
        .send({ deviceClass: 'INVALID_CLASS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when deviceName is empty string', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDMR);

      const response = await request(app)
        .put(`/api/dmr/${mockDMR.id}`)
        .set('Authorization', 'Bearer token')
        .send({ deviceName: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put(`/api/dmr/${mockDMR.id}`)
        .set('Authorization', 'Bearer token')
        .send({ deviceName: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to update device master record');
    });
  });

  // ==========================================
  // POST /dmr/:id/approve - Approve DMR
  // ==========================================
  describe('POST /api/dmr/:id/approve', () => {
    it('should approve a DRAFT DMR and keep version 1.0', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDMR);
      (mockPrisma.deviceMasterRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        status: 'APPROVED',
        approvedBy: 'test@test.com',
        approvedDate: new Date(),
        currentVersion: '1.0',
      });

      const response = await request(app)
        .post(`/api/dmr/${mockDMR.id}/approve`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.approvedBy).toBe('test@test.com');
      expect(response.body.data.currentVersion).toBe('1.0');

      expect(mockPrisma.deviceMasterRecord.update).toHaveBeenCalledWith({
        where: { id: mockDMR.id },
        data: {
          status: 'APPROVED',
          approvedBy: 'test@test.com',
          approvedDate: expect.any(Date),
          currentVersion: '1.0',
        },
      });
    });

    it('should bump version when re-approving an already APPROVED DMR', async () => {
      const approvedDMR = {
        ...mockDMR,
        status: 'APPROVED',
        currentVersion: '2.0',
      };
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(approvedDMR);
      (mockPrisma.deviceMasterRecord.update as jest.Mock).mockResolvedValueOnce({
        ...approvedDMR,
        currentVersion: '3.0',
        approvedBy: 'test@test.com',
        approvedDate: new Date(),
      });

      const response = await request(app)
        .post(`/api/dmr/${mockDMR.id}/approve`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.currentVersion).toBe('3.0');

      expect(mockPrisma.deviceMasterRecord.update).toHaveBeenCalledWith({
        where: { id: mockDMR.id },
        data: expect.objectContaining({
          currentVersion: '3.0',
        }),
      });
    });

    it('should not bump version when approving a non-APPROVED status DMR', async () => {
      const draftDMR = {
        ...mockDMR,
        status: 'DRAFT',
        currentVersion: '1.0',
      };
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(draftDMR);
      (mockPrisma.deviceMasterRecord.update as jest.Mock).mockResolvedValueOnce({
        ...draftDMR,
        status: 'APPROVED',
        currentVersion: '1.0',
      });

      await request(app)
        .post(`/api/dmr/${mockDMR.id}/approve`)
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceMasterRecord.update).toHaveBeenCalledWith({
        where: { id: mockDMR.id },
        data: expect.objectContaining({
          currentVersion: '1.0',
        }),
      });
    });

    it('should use email for approvedBy when available', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDMR);
      (mockPrisma.deviceMasterRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        status: 'APPROVED',
        approvedBy: 'test@test.com',
      });

      await request(app)
        .post(`/api/dmr/${mockDMR.id}/approve`)
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceMasterRecord.update).toHaveBeenCalledWith({
        where: { id: mockDMR.id },
        data: expect.objectContaining({
          approvedBy: 'test@test.com',
        }),
      });
    });

    it('should return 404 when DMR does not exist', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/dmr/00000000-0000-4000-a000-ffffffffffff/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Device master record not found');
    });

    it('should return 404 when DMR is soft-deleted', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/dmr/${mockDMR.id}/approve`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post(`/api/dmr/${mockDMR.id}/approve`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to approve device master record');
    });
  });

  // ==========================================
  // POST /dhr - Create Device History Record
  // ==========================================
  describe('POST /api/dhr', () => {
    it('should create a DHR with all fields successfully', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDMR);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockDHR,
        id: 'new-dhr-id',
      });

      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send(validCreateDHRPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      expect(mockPrisma.deviceHistoryRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dmrId: validCreateDHRPayload.dmrId,
          batchNumber: 'BATCH-2026-001',
          manufacturingDate: expect.any(Date),
          quantityManufactured: 500,
          labelsUsed: 'UDI-L001',
          primaryId: 'PID-001',
          status: 'IN_PRODUCTION',
          createdBy: 'user-1',
        }),
      });
    });

    it('should create a DHR with only required fields', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDMR);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockDHR,
        labelsUsed: undefined,
        primaryId: undefined,
      });

      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send({
          dmrId: mockDMR.id,
          batchNumber: 'BATCH-MIN',
          manufacturingDate: '2026-03-01',
          quantityManufactured: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when referenced DMR does not exist', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send(validCreateDHRPayload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Referenced device master record not found');
    });

    it('should return 404 when referenced DMR is soft-deleted', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDMR,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send(validCreateDHRPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Referenced device master record not found');
    });

    it('should return 400 when dmrId is missing', async () => {
      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send({
          batchNumber: 'BATCH-001',
          manufacturingDate: '2026-02-01',
          quantityManufactured: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when batchNumber is missing', async () => {
      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send({
          dmrId: mockDMR.id,
          manufacturingDate: '2026-02-01',
          quantityManufactured: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when manufacturingDate is missing', async () => {
      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send({
          dmrId: mockDMR.id,
          batchNumber: 'BATCH-001',
          quantityManufactured: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when quantityManufactured is missing', async () => {
      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send({
          dmrId: mockDMR.id,
          batchNumber: 'BATCH-001',
          manufacturingDate: '2026-02-01',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when quantityManufactured is zero', async () => {
      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send({
          dmrId: mockDMR.id,
          batchNumber: 'BATCH-001',
          manufacturingDate: '2026-02-01',
          quantityManufactured: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when quantityManufactured is negative', async () => {
      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send({
          dmrId: mockDMR.id,
          batchNumber: 'BATCH-001',
          manufacturingDate: '2026-02-01',
          quantityManufactured: -10,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when quantityManufactured is not an integer', async () => {
      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send({
          dmrId: mockDMR.id,
          batchNumber: 'BATCH-001',
          manufacturingDate: '2026-02-01',
          quantityManufactured: 10.5,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceMasterRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDMR);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/dhr')
        .set('Authorization', 'Bearer token')
        .send(validCreateDHRPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create device history record');
    });
  });

  // ==========================================
  // GET /dhr - List Device History Records
  // ==========================================
  describe('GET /api/dhr', () => {
    it('should return a list of DHRs with default pagination', async () => {
      const dhrsWithDmr = [
        {
          ...mockDHR,
          dmr: {
            id: mockDMR.id,
            refNumber: mockDMR.refNumber,
            deviceName: mockDMR.deviceName,
            deviceClass: mockDMR.deviceClass,
          },
        },
        {
          ...mockDHR2,
          dmr: {
            id: mockDMR.id,
            refNumber: mockDMR.refNumber,
            deviceName: mockDMR.deviceName,
            deviceClass: mockDMR.deviceClass,
          },
        },
      ];
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce(dhrsWithDmr);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/dhr').set('Authorization', 'Bearer token');

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
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/dhr?page=5&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(5);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(100);
      expect(response.body.meta.totalPages).toBe(10);

      expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/dhr?limit=999')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
    });

    it('should filter by status', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/dhr?status=RELEASED').set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'RELEASED',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by dmrId', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get(`/api/dhr?dmrId=${mockDMR.id}`).set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dmrId: mockDMR.id,
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by batchNumber (case-insensitive contains)', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/dhr?batchNumber=BATCH-2026')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            batchNumber: { contains: 'BATCH-2026', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should include DMR select fields in results', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/dhr').set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            dmr: { select: { id: true, refNumber: true, deviceName: true, deviceClass: true } },
          },
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app).get('/api/dhr').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list device history records');
    });
  });

  // ==========================================
  // GET /dhr/:id - Get DHR with production records
  // ==========================================
  describe('GET /api/dhr/:id', () => {
    it('should return a DHR with production records and DMR info', async () => {
      const dhrWithRecords = {
        ...mockDHR,
        productionRecords: [mockDHRRecord],
        dmr: {
          id: mockDMR.id,
          refNumber: mockDMR.refNumber,
          deviceName: mockDMR.deviceName,
          deviceClass: mockDMR.deviceClass,
          currentVersion: mockDMR.currentVersion,
        },
      };
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        dhrWithRecords
      );

      const response = await request(app)
        .get(`/api/dhr/${mockDHR.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockDHR.id);
      expect(response.body.data.productionRecords).toHaveLength(1);
      expect(response.body.data.dmr).toBeDefined();
      expect(response.body.data.dmr.deviceName).toBe('Cardiac Pacemaker Model X');

      expect(mockPrisma.deviceHistoryRecord.findUnique).toHaveBeenCalledWith({
        where: { id: mockDHR.id },
        include: {
          productionRecords: { orderBy: { createdAt: 'desc' } },
          dmr: {
            select: {
              id: true,
              refNumber: true,
              deviceName: true,
              deviceClass: true,
              currentVersion: true,
            },
          },
        },
      });
    });

    it('should return 404 when DHR is not found', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/dhr/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Device history record not found');
    });

    it('should return 404 when DHR is soft-deleted', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDHR,
        deletedAt: new Date(),
        productionRecords: [],
        dmr: {},
      });

      const response = await request(app)
        .get(`/api/dhr/${mockDHR.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get(`/api/dhr/${mockDHR.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get device history record');
    });
  });

  // ==========================================
  // POST /dhr/:id/records - Add production record
  // ==========================================
  describe('POST /api/dhr/:id/records', () => {
    it('should create a production record with all fields', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDHR);
      (mockPrisma.dHRRecord.create as jest.Mock).mockResolvedValueOnce(mockDHRRecord);

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/records`)
        .set('Authorization', 'Bearer token')
        .send(validCreateRecordPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.recordType).toBe('INCOMING_INSPECTION');
      expect(response.body.data.title).toBe('Raw Material Inspection');

      expect(mockPrisma.dHRRecord.create).toHaveBeenCalledWith({
        data: {
          dhrId: mockDHR.id,
          recordType: 'INCOMING_INSPECTION',
          title: 'Raw Material Inspection',
          description: 'Inspection of incoming titanium alloy',
          result: 'Pass - within spec',
          pass: true,
          documentRef: 'DOC-INS-001',
          performedBy: 'Inspector A',
          performedDate: expect.any(Date),
        },
      });
    });

    it('should create a production record with only required fields', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDHR);
      (mockPrisma.dHRRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockDHRRecord,
        description: null,
        result: null,
        pass: null,
        documentRef: null,
        performedBy: null,
        performedDate: null,
      });

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/records`)
        .set('Authorization', 'Bearer token')
        .send({
          recordType: 'STERILIZATION',
          title: 'EtO Sterilization Cycle',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should accept all valid recordType enum values', async () => {
      const validTypes = [
        'INCOMING_INSPECTION',
        'IN_PROCESS_INSPECTION',
        'FINAL_INSPECTION',
        'ENVIRONMENTAL_MONITORING',
        'EQUIPMENT_CALIBRATION',
        'STERILIZATION',
        'PACKAGING',
        'LABELLING',
        'ACCEPTANCE_TEST',
        'OTHER',
      ];

      for (const recordType of validTypes) {
        jest.clearAllMocks();
        (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDHR);
        (mockPrisma.dHRRecord.create as jest.Mock).mockResolvedValueOnce({
          ...mockDHRRecord,
          recordType,
        });

        const response = await request(app)
          .post(`/api/dhr/${mockDHR.id}/records`)
          .set('Authorization', 'Bearer token')
          .send({ recordType, title: `Test ${recordType}` });

        expect(response.status).toBe(201);
      }
    });

    it('should set performedDate to null when not provided', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDHR);
      (mockPrisma.dHRRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockDHRRecord,
        performedDate: null,
      });

      await request(app)
        .post(`/api/dhr/${mockDHR.id}/records`)
        .set('Authorization', 'Bearer token')
        .send({
          recordType: 'PACKAGING',
          title: 'Packaging Check',
        });

      expect(mockPrisma.dHRRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          performedDate: null,
        }),
      });
    });

    it('should return 404 when DHR does not exist', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/dhr/00000000-0000-4000-a000-ffffffffffff/records')
        .set('Authorization', 'Bearer token')
        .send(validCreateRecordPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Device history record not found');
    });

    it('should return 404 when DHR is soft-deleted', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDHR,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/records`)
        .set('Authorization', 'Bearer token')
        .send(validCreateRecordPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when recordType is missing', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDHR);

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/records`)
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Some Record',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid recordType value', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDHR);

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/records`)
        .set('Authorization', 'Bearer token')
        .send({
          recordType: 'INVALID_TYPE',
          title: 'Some Record',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when title is missing', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDHR);

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/records`)
        .set('Authorization', 'Bearer token')
        .send({
          recordType: 'INCOMING_INSPECTION',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when title is empty', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDHR);

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/records`)
        .set('Authorization', 'Bearer token')
        .send({
          recordType: 'INCOMING_INSPECTION',
          title: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(mockDHR);
      (mockPrisma.dHRRecord.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/records`)
        .set('Authorization', 'Bearer token')
        .send(validCreateRecordPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create production record');
    });
  });

  // ==========================================
  // POST /dhr/:id/release - Release batch
  // ==========================================
  describe('POST /api/dhr/:id/release', () => {
    it('should release a batch when all production records pass', async () => {
      const dhrWithPassingRecords = {
        ...mockDHR,
        productionRecords: [
          { ...mockDHRRecord, pass: true },
          { ...mockDHRRecord, id: 'rec-0003', title: 'Final Inspection', pass: true },
        ],
      };
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        dhrWithPassingRecords
      );
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockDHR,
        status: 'RELEASED',
        releasedBy: 'test@test.com',
        releaseDate: new Date(),
      });

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/release`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('RELEASED');
      expect(response.body.data.releasedBy).toBe('test@test.com');

      expect(mockPrisma.deviceHistoryRecord.update).toHaveBeenCalledWith({
        where: { id: mockDHR.id },
        data: {
          status: 'RELEASED',
          releasedBy: 'test@test.com',
          releaseDate: expect.any(Date),
        },
      });
    });

    it('should release when records have pass=null (not explicitly failed)', async () => {
      const dhrWithNullPass = {
        ...mockDHR,
        productionRecords: [
          { ...mockDHRRecord, pass: true },
          { ...mockDHRRecord, id: 'rec-0003', pass: null },
        ],
      };
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        dhrWithNullPass
      );
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockDHR,
        status: 'RELEASED',
      });

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/release`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when no production records exist', async () => {
      const dhrNoRecords = {
        ...mockDHR,
        productionRecords: [],
      };
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(dhrNoRecords);

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/release`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Cannot release batch: no production records exist');
    });

    it('should return 400 when production records have failed inspections', async () => {
      const dhrWithFailedRecords = {
        ...mockDHR,
        productionRecords: [
          { ...mockDHRRecord, pass: true },
          { ...mockDHRRecordFailed, pass: false },
        ],
      };
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        dhrWithFailedRecords
      );

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/release`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain(
        '1 production record(s) have failed inspections'
      );
    });

    it('should return 400 with correct count when multiple records fail', async () => {
      const dhrWithMultipleFailures = {
        ...mockDHR,
        productionRecords: [
          { ...mockDHRRecord, pass: true },
          { ...mockDHRRecordFailed, id: 'rec-f1', pass: false },
          { ...mockDHRRecordFailed, id: 'rec-f2', pass: false },
          { ...mockDHRRecordFailed, id: 'rec-f3', pass: false },
        ],
      };
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        dhrWithMultipleFailures
      );

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/release`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain(
        '3 production record(s) have failed inspections'
      );
    });

    it('should return 404 when DHR does not exist', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/dhr/00000000-0000-4000-a000-ffffffffffff/release')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Device history record not found');
    });

    it('should return 404 when DHR is soft-deleted', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockDHR,
        deletedAt: new Date(),
        productionRecords: [],
      });

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/release`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should use email for releasedBy when available', async () => {
      const dhrWithRecords = {
        ...mockDHR,
        productionRecords: [{ ...mockDHRRecord, pass: true }],
      };
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        dhrWithRecords
      );
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockDHR,
        status: 'RELEASED',
        releasedBy: 'test@test.com',
      });

      await request(app)
        .post(`/api/dhr/${mockDHR.id}/release`)
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceHistoryRecord.update).toHaveBeenCalledWith({
        where: { id: mockDHR.id },
        data: expect.objectContaining({
          releasedBy: 'test@test.com',
        }),
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post(`/api/dhr/${mockDHR.id}/release`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to release batch');
    });

    it('should include productionRecords in the findUnique query', async () => {
      const dhrWithRecords = {
        ...mockDHR,
        productionRecords: [{ ...mockDHRRecord, pass: true }],
      };
      (mockPrisma.deviceHistoryRecord.findUnique as jest.Mock).mockResolvedValueOnce(
        dhrWithRecords
      );
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockDHR,
        status: 'RELEASED',
      });

      await request(app)
        .post(`/api/dhr/${mockDHR.id}/release`)
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.deviceHistoryRecord.findUnique).toHaveBeenCalledWith({
        where: { id: mockDHR.id },
        include: { productionRecords: true },
      });
    });
  });
});
