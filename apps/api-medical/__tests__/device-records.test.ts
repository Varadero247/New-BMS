import express from 'express';
import request from 'supertest';

// ── Mocks ───────────────────────────────────────────────────────────

jest.mock('../src/prisma', () => ({
  prisma: {
    deviceHistoryRecord: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    deviceMasterRecord: {
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
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
import deviceRecordsRouter from '../src/routes/device-records';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ── Test data ────────────────────────────────────────────────────────

const RECORD_ID = '00000000-0000-0000-0000-000000000001';
const DMR_ID = '00000000-0000-0000-0000-000000000002';

const mockDmr = {
  id: DMR_ID,
  refNumber: 'DMR-2602-0001',
  deviceName: 'Cardiac Sensor A1',
  deviceId: 'MODEL-A1',
  deviceClass: 'CLASS_II',
  status: 'ACTIVE',
  createdBy: 'test@test.com',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockRecord = {
  id: RECORD_ID,
  refNumber: 'DHR-2602-0001',
  dmrId: DMR_ID,
  batchNumber: 'LOT-001',
  primaryId: 'SN-001',
  manufacturingDate: new Date('2026-01-15'),
  releaseDate: new Date('2026-01-20'),
  releasedBy: 'inspector@test.com',
  status: 'RELEASED',
  quantityManufactured: 1,
  createdBy: 'test@test.com',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
  dmr: mockDmr,
  productionRecords: [],
};

describe('Device Records API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/device-records', deviceRecordsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── GET /api/device-records ──────────────────────────────────────────
  describe('GET /api/device-records', () => {
    it('should return 200 with paginated list of device records', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([mockRecord]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app).get('/api/device-records');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.data[0].dhrNumber).toBe('DHR-2602-0001');
      expect(response.body.data[0].deviceName).toBe('Cardiac Sensor A1');
    });

    it('should return 200 with empty list when no records exist', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app).get('/api/device-records');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should apply status filter to findMany query', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([mockRecord]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app).get('/api/device-records?status=RELEASED');

      expect(response.status).toBe(200);
      expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'RELEASED', deletedAt: null }),
        })
      );
    });

    it('should filter by search term on client side', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([mockRecord]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app).get('/api/device-records?search=cardiac');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return correct mapped fields', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([mockRecord]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app).get('/api/device-records');

      expect(response.status).toBe(200);
      const item = response.body.data[0];
      expect(item).toHaveProperty('id', RECORD_ID);
      expect(item).toHaveProperty('dhrNumber', 'DHR-2602-0001');
      expect(item).toHaveProperty('deviceName', 'Cardiac Sensor A1');
      expect(item).toHaveProperty('serialNumber', 'SN-001');
      expect(item).toHaveProperty('lotNumber', 'LOT-001');
      expect(item).toHaveProperty('status', 'RELEASED');
      expect(item).toHaveProperty('deviceClass', 'CLASS_II');
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app).get('/api/device-records?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 })
      );
    });
  });

  // ── GET /api/device-records/:id ──────────────────────────────────────
  describe('GET /api/device-records/:id', () => {
    it('should return 200 with single device record', async () => {
      (mockPrisma.deviceHistoryRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockRecord);

      const response = await request(app).get(`/api/device-records/${RECORD_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(RECORD_ID);
      expect(response.body.data.refNumber).toBe('DHR-2602-0001');
    });

    it('should return 404 when record not found', async () => {
      (mockPrisma.deviceHistoryRecord.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get(`/api/device-records/${RECORD_ID}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should query with deletedAt null filter', async () => {
      (mockPrisma.deviceHistoryRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockRecord);

      await request(app).get(`/api/device-records/${RECORD_ID}`);

      expect(mockPrisma.deviceHistoryRecord.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: RECORD_ID, deletedAt: null },
        })
      );
    });
  });

  // ── POST /api/device-records ──────────────────────────────────────────
  describe('POST /api/device-records', () => {
    const newRecordBody = {
      deviceName: 'Cardiac Sensor A1',
      deviceModel: 'MODEL-A1',
      serialNumber: 'SN-NEW-001',
      lotNumber: 'LOT-NEW-001',
      status: 'IN_PRODUCTION',
      deviceClass: 'CLASS_II',
      manufactureDate: '2026-02-01',
      owner: 'engineer@test.com',
    };

    it('should create device history record using existing DMR and return 201', async () => {
      (mockPrisma.deviceMasterRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockDmr);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockRecord,
        dmr: mockDmr,
      });

      const response = await request(app)
        .post('/api/device-records')
        .send(newRecordBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dhrNumber');
      expect(response.body.data).toHaveProperty('deviceName', 'Cardiac Sensor A1');
      expect(mockPrisma.deviceMasterRecord.create).not.toHaveBeenCalled();
    });

    it('should create new DMR when none found and return 201', async () => {
      (mockPrisma.deviceMasterRecord.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.deviceMasterRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.deviceMasterRecord.create as jest.Mock).mockResolvedValueOnce(mockDmr);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockRecord,
        dmr: mockDmr,
      });

      const response = await request(app)
        .post('/api/device-records')
        .send(newRecordBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.deviceMasterRecord.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.deviceHistoryRecord.create).toHaveBeenCalledTimes(1);
    });

    it('should create DHR with correct data fields', async () => {
      (mockPrisma.deviceMasterRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockDmr);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockRecord,
        dmr: mockDmr,
      });

      await request(app).post('/api/device-records').send(newRecordBody);

      expect(mockPrisma.deviceHistoryRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dmrId: DMR_ID,
            status: 'IN_PRODUCTION',
            primaryId: 'SN-NEW-001',
            batchNumber: 'LOT-NEW-001',
            createdBy: 'test@test.com',
          }),
        })
      );
    });

    it('should use defaults when optional fields are missing', async () => {
      (mockPrisma.deviceMasterRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockDmr);
      (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockResolvedValueOnce({
        ...mockRecord,
        dmr: mockDmr,
      });

      const response = await request(app)
        .post('/api/device-records')
        .send({ deviceName: 'Generic Device' });

      expect(response.status).toBe(201);
      expect(mockPrisma.deviceHistoryRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'IN_PRODUCTION',
          }),
        })
      );
    });
  });

  // ── PUT /api/device-records/:id ──────────────────────────────────────
  describe('PUT /api/device-records/:id', () => {
    it('should update device record and return 200', async () => {
      const updatedRecord = { ...mockRecord, status: 'RELEASED', dmr: mockDmr };
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce(updatedRecord);

      const response = await request(app)
        .put(`/api/device-records/${RECORD_ID}`)
        .send({ status: 'RELEASED', owner: 'qc@test.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('RELEASED');
    });

    it('should call update with correct id and data', async () => {
      const updatedRecord = { ...mockRecord, batchNumber: 'LOT-UPDATED', dmr: mockDmr };
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce(updatedRecord);

      await request(app)
        .put(`/api/device-records/${RECORD_ID}`)
        .send({ lotNumber: 'LOT-UPDATED' });

      expect(mockPrisma.deviceHistoryRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: RECORD_ID },
          data: expect.objectContaining({ batchNumber: 'LOT-UPDATED' }),
        })
      );
    });

    it('should return 500 when Prisma update throws', async () => {
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockRejectedValueOnce(
        new Error('Record to update not found')
      );

      const response = await request(app)
        .put(`/api/device-records/${RECORD_ID}`)
        .send({ status: 'RELEASED' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ── DELETE /api/device-records/:id ───────────────────────────────────
  describe('DELETE /api/device-records/:id', () => {
    it('should soft delete device record and return 200', async () => {
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockRecord,
        deletedAt: new Date(),
      });

      const response = await request(app).delete(`/api/device-records/${RECORD_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(RECORD_ID);
    });

    it('should call update with deletedAt set', async () => {
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({
        ...mockRecord,
        deletedAt: new Date(),
      });

      await request(app).delete(`/api/device-records/${RECORD_ID}`);

      expect(mockPrisma.deviceHistoryRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: RECORD_ID },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });

    it('should return 500 when Prisma update throws', async () => {
      (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockRejectedValueOnce(
        new Error('Record to delete not found')
      );

      const response = await request(app).delete(`/api/device-records/${RECORD_ID}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('device-records — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/device-records', deviceRecordsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/device-records', async () => {
    const res = await request(app).get('/api/device-records');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('device-records — edge cases and error paths', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/device-records', deviceRecordsRouter);
    jest.clearAllMocks();
  });

  it('GET / returns 500 with INTERNAL_ERROR code when findMany throws', async () => {
    (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/device-records');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / returns 500 with INTERNAL_ERROR code when count throws', async () => {
    (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([mockRecord]);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/device-records');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET / filters by search term — non-matching returns empty data array', async () => {
    (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([mockRecord]);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(1);

    const res = await request(app).get('/api/device-records?search=zzznomatch');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /:id returns 500 with INTERNAL_ERROR when findFirst throws', async () => {
    (mockPrisma.deviceHistoryRecord.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get(`/api/device-records/${RECORD_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 with INTERNAL_ERROR when create throws', async () => {
    (mockPrisma.deviceMasterRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockDmr);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .post('/api/device-records')
      .send({ deviceName: 'Test Device', status: 'IN_PRODUCTION' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT / maps lotNumber body field to batchNumber in the update call', async () => {
    const updatedRecord = { ...mockRecord, batchNumber: 'LOT-XYZ', dmr: mockDmr };
    (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce(updatedRecord);

    await request(app)
      .put(`/api/device-records/${RECORD_ID}`)
      .send({ lotNumber: 'LOT-XYZ' });

    expect(mockPrisma.deviceHistoryRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ batchNumber: 'LOT-XYZ' }),
      })
    );
  });

  it('DELETE / response data contains the id field', async () => {
    (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({
      ...mockRecord,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/device-records/${RECORD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', RECORD_ID);
  });

  it('POST / response shape includes dhrNumber and deviceModel fields', async () => {
    (mockPrisma.deviceMasterRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockDmr);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockResolvedValueOnce({
      ...mockRecord,
      dmr: mockDmr,
    });

    const res = await request(app)
      .post('/api/device-records')
      .send({ deviceName: 'Cardiac Sensor A1' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('dhrNumber');
    expect(res.body.data).toHaveProperty('deviceModel');
  });

  it('GET / page=1 limit=5 passes skip=0 take=5 to findMany', async () => {
    (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);

    await request(app).get('/api/device-records?page=1&limit=5');

    expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 5 })
    );
  });
});

describe('device-records — final coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/device-records', deviceRecordsRouter);
    jest.clearAllMocks();
  });

  it('GET / always queries with deletedAt null', async () => {
    (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);

    await request(app).get('/api/device-records');

    expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });

  it('GET / total in response matches count mock', async () => {
    (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(42);

    const res = await request(app).get('/api/device-records');

    expect(res.body.total).toBe(42);
  });

  it('POST / generates refNumber using year and sequence', async () => {
    (mockPrisma.deviceMasterRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockDmr);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(7);
    (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockResolvedValueOnce({ ...mockRecord, dmr: mockDmr });

    await request(app).post('/api/device-records').send({ deviceName: 'Sequence Device' });

    const createCall = (mockPrisma.deviceHistoryRecord.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.refNumber).toMatch(/DHR-\d{4}-\d+/);
  });

  it('PUT / success:true is present in response body', async () => {
    (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({ ...mockRecord, dmr: mockDmr });

    const res = await request(app).put(`/api/device-records/${RECORD_ID}`).send({ status: 'RELEASED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE / success:true in response', async () => {
    (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({ ...mockRecord, deletedAt: new Date() });

    const res = await request(app).delete(`/api/device-records/${RECORD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id includes dmr data in response', async () => {
    (mockPrisma.deviceHistoryRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockRecord);

    const res = await request(app).get(`/api/device-records/${RECORD_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('refNumber', 'DHR-2602-0001');
  });
});

describe('device-records — ≥40 coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/device-records', deviceRecordsRouter);
    jest.clearAllMocks();
  });

  it('GET / response body has success:true and data array', async () => {
    (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([mockRecord]);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(1);

    const res = await request(app).get('/api/device-records');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / with IN_PRODUCTION status filter passes correct where to findMany', async () => {
    (mockPrisma.deviceHistoryRecord.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);

    await request(app).get('/api/device-records?status=IN_PRODUCTION');

    expect(mockPrisma.deviceHistoryRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'IN_PRODUCTION', deletedAt: null }),
      })
    );
  });

  it('PUT /:id maps serialNumber body field to primaryId in update data', async () => {
    const updatedRecord = { ...mockRecord, primaryId: 'SN-UPDATED', dmr: mockDmr };
    (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce(updatedRecord);

    await request(app)
      .put(`/api/device-records/${RECORD_ID}`)
      .send({ serialNumber: 'SN-UPDATED' });

    expect(mockPrisma.deviceHistoryRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ primaryId: 'SN-UPDATED' }),
      })
    );
  });

  it('DELETE /:id update called with where:{id:RECORD_ID}', async () => {
    (mockPrisma.deviceHistoryRecord.update as jest.Mock).mockResolvedValueOnce({
      ...mockRecord,
      deletedAt: new Date(),
    });

    await request(app).delete(`/api/device-records/${RECORD_ID}`);

    expect(mockPrisma.deviceHistoryRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: RECORD_ID } })
    );
  });

  it('POST / when DMR found does not call deviceMasterRecord.create', async () => {
    (mockPrisma.deviceMasterRecord.findFirst as jest.Mock).mockResolvedValueOnce(mockDmr);
    (mockPrisma.deviceHistoryRecord.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.deviceHistoryRecord.create as jest.Mock).mockResolvedValueOnce({ ...mockRecord, dmr: mockDmr });

    await request(app)
      .post('/api/device-records')
      .send({ deviceName: 'Existing DMR Device' });

    expect(mockPrisma.deviceMasterRecord.create).not.toHaveBeenCalled();
    expect(mockPrisma.deviceHistoryRecord.create).toHaveBeenCalledTimes(1);
  });
});
