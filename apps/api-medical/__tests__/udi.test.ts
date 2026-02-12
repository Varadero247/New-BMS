import express from 'express';
import request from 'supertest';

// ── Mocks ───────────────────────────────────────────────────────────

jest.mock('../src/prisma', () => ({
  prisma: {
    udiDevice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    udiDiRecord: {
      create: jest.fn(),
    },
    udiPiRecord: {
      create: jest.fn(),
    },
    udiSubmission: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    UdiDeviceWhereInput: {},
    UdiSubmissionWhereInput: {},
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
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import udiRouter from '../src/routes/udi';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockDevice = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'UDI-2602-0001',
  deviceName: 'Cardiac Monitor Pro',
  modelNumber: 'CM-PRO-100',
  manufacturer: 'MedTech Corp',
  deviceClass: 'CLASS_IIA',
  riskClass: 'Medium',
  gmdn: '12345',
  emdn: 'V030201',
  status: 'DRAFT',
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

const mockDiRecord = {
  id: '30000000-0000-4000-a000-000000000001',
  deviceId: mockDevice.id,
  issuingAgency: 'GS1',
  diCode: '08714729999991',
  version: '1.0',
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

const mockPiRecord = {
  id: '40000000-0000-4000-a000-000000000001',
  deviceId: mockDevice.id,
  lotNumber: 'LOT-2026-001',
  serialNumber: 'SN-00001',
  manufacturingDate: new Date('2026-01-10'),
  expirationDate: new Date('2028-01-10'),
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

const mockSubmission = {
  id: '50000000-0000-4000-a000-000000000001',
  deviceId: mockDevice.id,
  database: 'GUDID',
  status: 'PENDING',
  submissionDate: new Date('2026-02-01'),
  referenceNumber: 'GUDID-REF-001',
  notes: 'Initial submission',
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

// ==========================================
// App setup
// ==========================================

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/udi', udiRouter);
  return app;
}

// ==========================================
// Tests
// ==========================================

describe('UDI Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = buildApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // POST /api/udi/devices
  // ------------------------------------------
  describe('POST /api/udi/devices', () => {
    it('should create a new UDI device', async () => {
      (mockPrisma.udiDevice.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.udiDevice.create as jest.Mock).mockResolvedValue({ ...mockDevice });

      const res = await request(app)
        .post('/api/udi/devices')
        .send({
          deviceName: 'Cardiac Monitor Pro',
          modelNumber: 'CM-PRO-100',
          manufacturer: 'MedTech Corp',
          deviceClass: 'CLASS_IIA',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deviceName).toBe('Cardiac Monitor Pro');
      expect(mockPrisma.udiDevice.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when deviceName is missing', async () => {
      const res = await request(app)
        .post('/api/udi/devices')
        .send({
          modelNumber: 'CM-PRO-100',
          manufacturer: 'MedTech Corp',
          deviceClass: 'CLASS_IIA',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when modelNumber is missing', async () => {
      const res = await request(app)
        .post('/api/udi/devices')
        .send({
          deviceName: 'Cardiac Monitor Pro',
          manufacturer: 'MedTech Corp',
          deviceClass: 'CLASS_IIA',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid deviceClass', async () => {
      const res = await request(app)
        .post('/api/udi/devices')
        .send({
          deviceName: 'Cardiac Monitor Pro',
          modelNumber: 'CM-PRO-100',
          manufacturer: 'MedTech Corp',
          deviceClass: 'INVALID_CLASS',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.udiDevice.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.udiDevice.create as jest.Mock).mockRejectedValue(new Error('DB failure'));

      const res = await request(app)
        .post('/api/udi/devices')
        .send({
          deviceName: 'Cardiac Monitor Pro',
          modelNumber: 'CM-PRO-100',
          manufacturer: 'MedTech Corp',
          deviceClass: 'CLASS_IIA',
        });

      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ------------------------------------------
  // GET /api/udi/devices
  // ------------------------------------------
  describe('GET /api/udi/devices', () => {
    it('should list devices with pagination', async () => {
      (mockPrisma.udiDevice.findMany as jest.Mock).mockResolvedValue([mockDevice]);
      (mockPrisma.udiDevice.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/udi/devices');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
      expect(res.body.meta.page).toBe(1);
    });

    it('should filter by status', async () => {
      (mockPrisma.udiDevice.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.udiDevice.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get('/api/udi/devices?status=ACTIVE');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should filter by deviceClass', async () => {
      (mockPrisma.udiDevice.findMany as jest.Mock).mockResolvedValue([mockDevice]);
      (mockPrisma.udiDevice.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/udi/devices?deviceClass=CLASS_IIA');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.udiDevice.findMany as jest.Mock).mockRejectedValue(new Error('DB failure'));

      const res = await request(app).get('/api/udi/devices');

      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ------------------------------------------
  // GET /api/udi/devices/:id
  // ------------------------------------------
  describe('GET /api/udi/devices/:id', () => {
    it('should get a device with includes', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue({
        ...mockDevice,
        diRecords: [mockDiRecord],
        piRecords: [mockPiRecord],
        submissions: [mockSubmission],
      });

      const res = await request(app).get(`/api/udi/devices/${mockDevice.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deviceName).toBe('Cardiac Monitor Pro');
    });

    it('should return 404 when device not found', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/udi/devices/nonexistent-id');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when device is soft-deleted', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue({
        ...mockDevice,
        deletedAt: new Date(),
      });

      const res = await request(app).get(`/api/udi/devices/${mockDevice.id}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ------------------------------------------
  // POST /api/udi/devices/:id/di
  // ------------------------------------------
  describe('POST /api/udi/devices/:id/di', () => {
    it('should create a DI record', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiDiRecord.create as jest.Mock).mockResolvedValue(mockDiRecord);

      const res = await request(app)
        .post(`/api/udi/devices/${mockDevice.id}/di`)
        .send({ issuingAgency: 'GS1', diCode: '08714729999991' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.diCode).toBe('08714729999991');
    });

    it('should return 404 when device not found', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/udi/devices/nonexistent/di')
        .send({ issuingAgency: 'GS1', diCode: '08714729999991' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when issuingAgency is missing', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);

      const res = await request(app)
        .post(`/api/udi/devices/${mockDevice.id}/di`)
        .send({ diCode: '08714729999991' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 on duplicate DI code', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiDiRecord.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

      const res = await request(app)
        .post(`/api/udi/devices/${mockDevice.id}/di`)
        .send({ issuingAgency: 'GS1', diCode: '08714729999991' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('DUPLICATE_DI_CODE');
    });
  });

  // ------------------------------------------
  // POST /api/udi/devices/:id/pi
  // ------------------------------------------
  describe('POST /api/udi/devices/:id/pi', () => {
    it('should create a PI record', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiPiRecord.create as jest.Mock).mockResolvedValue(mockPiRecord);

      const res = await request(app)
        .post(`/api/udi/devices/${mockDevice.id}/pi`)
        .send({ lotNumber: 'LOT-2026-001', serialNumber: 'SN-00001' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lotNumber).toBe('LOT-2026-001');
    });

    it('should return 404 when device not found', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/udi/devices/nonexistent/pi')
        .send({ lotNumber: 'LOT-2026-001' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should create a PI record with optional fields only', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiPiRecord.create as jest.Mock).mockResolvedValue({ ...mockPiRecord, lotNumber: null });

      const res = await request(app)
        .post(`/api/udi/devices/${mockDevice.id}/pi`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ------------------------------------------
  // GET /api/udi/devices/:id/submissions
  // ------------------------------------------
  describe('GET /api/udi/devices/:id/submissions', () => {
    it('should list submissions for a device', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiSubmission.findMany as jest.Mock).mockResolvedValue([mockSubmission]);
      (mockPrisma.udiSubmission.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get(`/api/udi/devices/${mockDevice.id}/submissions`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should return 404 when device not found', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/udi/devices/nonexistent/submissions');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should filter submissions by status and database', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiSubmission.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.udiSubmission.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app)
        .get(`/api/udi/devices/${mockDevice.id}/submissions?status=PENDING&database=GUDID`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  // ------------------------------------------
  // PUT /api/udi/devices/:id/submissions/:sid
  // ------------------------------------------
  describe('PUT /api/udi/devices/:id/submissions/:sid', () => {
    it('should update a submission status', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiSubmission.findFirst as jest.Mock).mockResolvedValue(mockSubmission);
      (mockPrisma.udiSubmission.update as jest.Mock).mockResolvedValue({
        ...mockSubmission,
        status: 'ACCEPTED',
      });

      const res = await request(app)
        .put(`/api/udi/devices/${mockDevice.id}/submissions/${mockSubmission.id}`)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');
    });

    it('should return 404 when device not found', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/udi/devices/nonexistent/submissions/sub-1')
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when submission not found', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiSubmission.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/udi/devices/${mockDevice.id}/submissions/nonexistent`)
        .send({ status: 'ACCEPTED' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid submission status', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiSubmission.findFirst as jest.Mock).mockResolvedValue(mockSubmission);

      const res = await request(app)
        .put(`/api/udi/devices/${mockDevice.id}/submissions/${mockSubmission.id}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid database value', async () => {
      (mockPrisma.udiDevice.findUnique as jest.Mock).mockResolvedValue(mockDevice);
      (mockPrisma.udiSubmission.findFirst as jest.Mock).mockResolvedValue(mockSubmission);

      const res = await request(app)
        .put(`/api/udi/devices/${mockDevice.id}/submissions/${mockSubmission.id}`)
        .send({ database: 'INVALID_DB' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
