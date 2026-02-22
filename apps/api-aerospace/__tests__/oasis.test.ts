import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    oasisMonitoredSupplier: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    oasisAlert: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    OasisMonitoredSupplierWhereInput: {},
    OasisAlertWhereInput: {},
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
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import oasisRouter from '../src/routes/oasis';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/oasis', oasisRouter);

describe('OASIS Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ============================================
  // GET /api/oasis/lookup
  // ============================================
  describe('GET /api/oasis/lookup', () => {
    it('should return mock OASIS data with cage parameter', async () => {
      const res = await request(app).get('/api/oasis/lookup?cage=1A2B3');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cageCode).toBe('1A2B3');
      expect(res.body.data.certifications).toBeDefined();
      expect(Array.isArray(res.body.data.certifications)).toBe(true);
    });

    it('should return mock OASIS data with company parameter', async () => {
      const res = await request(app).get('/api/oasis/lookup?company=AcmeCorp');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.companyName).toBe('AcmeCorp');
    });

    it('should return certifications with standard and certBody', async () => {
      const res = await request(app).get('/api/oasis/lookup?cage=TEST1');
      expect(res.status).toBe(200);
      const certs = res.body.data.certifications;
      expect(certs.length).toBeGreaterThan(0);
      expect(certs[0].standard).toBeDefined();
      expect(certs[0].certBody).toBeDefined();
      expect(certs[0].status).toBe('CURRENT');
    });

    it('should return 400 when no cage or company provided', async () => {
      const res = await request(app).get('/api/oasis/lookup');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept both cage and company', async () => {
      const res = await request(app).get('/api/oasis/lookup?cage=TEST&company=AcmeCorp');
      expect(res.status).toBe(200);
      expect(res.body.data.cageCode).toBe('TEST');
      expect(res.body.data.companyName).toBe('AcmeCorp');
    });
  });

  // ============================================
  // POST /api/oasis/monitor
  // ============================================
  describe('POST /api/oasis/monitor', () => {
    it('should add supplier to monitoring', async () => {
      const created = {
        id: 'sup-1',
        cageCode: 'AB123',
        companyName: 'AcmeCorp',
        certStatus: 'UNKNOWN',
        createdBy: 'test@test.com',
      };
      (mockPrisma.oasisMonitoredSupplier.create as jest.Mock).mockResolvedValue(created);

      const res = await request(app).post('/api/oasis/monitor').send({
        cageCode: 'AB123',
        companyName: 'AcmeCorp',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cageCode).toBe('AB123');
    });

    it('should return 400 for missing cageCode', async () => {
      const res = await request(app).post('/api/oasis/monitor').send({
        companyName: 'AcmeCorp',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing companyName', async () => {
      const res = await request(app).post('/api/oasis/monitor').send({
        cageCode: 'AB123',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty cageCode', async () => {
      const res = await request(app).post('/api/oasis/monitor').send({
        cageCode: '',
        companyName: 'AcmeCorp',
      });
      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate CAGE code', async () => {
      (mockPrisma.oasisMonitoredSupplier.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

      const res = await request(app).post('/api/oasis/monitor').send({
        cageCode: 'AB123',
        companyName: 'AcmeCorp',
      });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('DUPLICATE');
    });

    it('should accept optional certStandard and certBody', async () => {
      const created = {
        id: 'sup-1',
        cageCode: 'AB123',
        companyName: 'Acme',
        certStandard: 'AS9100D',
        certBody: 'BSI',
      };
      (mockPrisma.oasisMonitoredSupplier.create as jest.Mock).mockResolvedValue(created);

      const res = await request(app).post('/api/oasis/monitor').send({
        cageCode: 'AB123',
        companyName: 'Acme',
        certStandard: 'AS9100D',
        certBody: 'BSI',
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 for internal errors', async () => {
      (mockPrisma.oasisMonitoredSupplier.create as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const res = await request(app).post('/api/oasis/monitor').send({
        cageCode: 'AB123',
        companyName: 'AcmeCorp',
      });
      expect(res.status).toBe(500);
    });
  });

  // ============================================
  // GET /api/oasis/monitor
  // ============================================
  describe('GET /api/oasis/monitor', () => {
    it('should list monitored suppliers', async () => {
      (mockPrisma.oasisMonitoredSupplier.findMany as jest.Mock).mockResolvedValue([
        { id: 'sup-1', cageCode: 'AB123', companyName: 'Acme', alerts: [] },
      ]);
      (mockPrisma.oasisMonitoredSupplier.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/oasis/monitor');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.oasisMonitoredSupplier.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.oasisMonitoredSupplier.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/oasis/monitor?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.totalPages).toBe(5);
    });

    it('should filter by certStatus', async () => {
      (mockPrisma.oasisMonitoredSupplier.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.oasisMonitoredSupplier.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/oasis/monitor?certStatus=CURRENT');
      expect(mockPrisma.oasisMonitoredSupplier.findMany).toHaveBeenCalled();
    });

    it('should filter by search', async () => {
      (mockPrisma.oasisMonitoredSupplier.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.oasisMonitoredSupplier.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/oasis/monitor?search=Acme');
      expect(mockPrisma.oasisMonitoredSupplier.findMany).toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.oasisMonitoredSupplier.findMany as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const res = await request(app).get('/api/oasis/monitor');
      expect(res.status).toBe(500);
    });
  });

  // ============================================
  // GET /api/oasis/alerts
  // ============================================
  describe('GET /api/oasis/alerts', () => {
    it('should list unacknowledged alerts', async () => {
      (mockPrisma.oasisAlert.findMany as jest.Mock).mockResolvedValue([
        {
          id: '00000000-0000-0000-0000-000000000001',
          acknowledged: false,
          supplier: { companyName: 'Acme' },
        },
      ]);
      (mockPrisma.oasisAlert.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/oasis/alerts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination for alerts', async () => {
      (mockPrisma.oasisAlert.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.oasisAlert.count as jest.Mock).mockResolvedValue(25);

      const res = await request(app).get('/api/oasis/alerts?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.totalPages).toBe(3);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.oasisAlert.findMany as jest.Mock).mockRejectedValue(new Error('DB fail'));
      const res = await request(app).get('/api/oasis/alerts');
      expect(res.status).toBe(500);
    });
  });

  // ============================================
  // PUT /api/oasis/alerts/:id/acknowledge
  // ============================================
  describe('PUT /api/oasis/alerts/:id/acknowledge', () => {
    it('should acknowledge an alert', async () => {
      (mockPrisma.oasisAlert.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        acknowledged: false,
      });
      (mockPrisma.oasisAlert.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        acknowledged: true,
        acknowledgedBy: 'test@test.com',
      });

      const res = await request(app).put(
        '/api/oasis/alerts/00000000-0000-0000-0000-000000000001/acknowledge'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.acknowledged).toBe(true);
    });

    it('should return 404 for non-existent alert', async () => {
      (mockPrisma.oasisAlert.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put(
        '/api/oasis/alerts/00000000-0000-0000-0000-000000000099/acknowledge'
      );
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for already acknowledged alert', async () => {
      (mockPrisma.oasisAlert.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        acknowledged: true,
      });

      const res = await request(app).put(
        '/api/oasis/alerts/00000000-0000-0000-0000-000000000001/acknowledge'
      );
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ALREADY_ACKNOWLEDGED');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.oasisAlert.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        acknowledged: false,
      });
      (mockPrisma.oasisAlert.update as jest.Mock).mockRejectedValue(new Error('DB fail'));

      const res = await request(app).put(
        '/api/oasis/alerts/00000000-0000-0000-0000-000000000001/acknowledge'
      );
      expect(res.status).toBe(500);
    });
  });
});

describe('OASIS Routes — additional coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/oasis/monitor returns correct totalPages for multi-page result', async () => {
    (mockPrisma.oasisMonitoredSupplier.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.oasisMonitoredSupplier.count as jest.Mock).mockResolvedValue(100);

    const res = await request(app).get('/api/oasis/monitor?page=1&limit=25');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(4);
  });

  it('GET /api/oasis/alerts returns success:true response shape', async () => {
    (mockPrisma.oasisAlert.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.oasisAlert.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/oasis/alerts');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /api/oasis/alerts page 2 limit 5 totalPages computed correctly', async () => {
    (mockPrisma.oasisAlert.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.oasisAlert.count as jest.Mock).mockResolvedValue(15);

    const res = await request(app).get('/api/oasis/alerts?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(3);
    expect(res.body.meta.page).toBe(2);
  });

  it('POST /api/oasis/monitor sets createdBy to logged-in user email', async () => {
    const created = { id: 'sup-99', cageCode: 'XY999', companyName: 'SupplierX', createdBy: 'test@test.com' };
    (mockPrisma.oasisMonitoredSupplier.create as jest.Mock).mockResolvedValue(created);

    const res = await request(app).post('/api/oasis/monitor').send({ cageCode: 'XY999', companyName: 'SupplierX' });
    expect(res.status).toBe(201);
    expect(res.body.data.createdBy).toBe('test@test.com');
  });

  it('GET /api/oasis/lookup returns 400 with error.code VALIDATION_ERROR for missing params', async () => {
    const res = await request(app).get('/api/oasis/lookup');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/oasis/monitor returns empty data array with correct meta when no suppliers', async () => {
    (mockPrisma.oasisMonitoredSupplier.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.oasisMonitoredSupplier.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/oasis/monitor');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
    expect(res.body.meta.totalPages).toBe(0);
  });

  it('GET /api/oasis/alerts page 3 limit 10 computes skip=20', async () => {
    (mockPrisma.oasisAlert.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.oasisAlert.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/oasis/alerts?page=3&limit=10');
    expect(mockPrisma.oasisAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('PUT /api/oasis/alerts/:id/acknowledge returns success:true in response body', async () => {
    (mockPrisma.oasisAlert.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      acknowledged: false,
    });
    (mockPrisma.oasisAlert.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      acknowledged: true,
      acknowledgedBy: 'test@test.com',
    });

    const res = await request(app).put(
      '/api/oasis/alerts/00000000-0000-0000-0000-000000000002/acknowledge'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.acknowledged).toBe(true);
  });

  it('GET /api/oasis/monitor response shape has success:true', async () => {
    (mockPrisma.oasisMonitoredSupplier.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.oasisMonitoredSupplier.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/oasis/monitor');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /api/oasis/monitor page 2 limit 5 computes correct skip in findMany', async () => {
    (mockPrisma.oasisMonitoredSupplier.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.oasisMonitoredSupplier.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/oasis/monitor?page=2&limit=5');
    expect(mockPrisma.oasisMonitoredSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('GET /api/oasis/alerts returns empty data array with correct meta', async () => {
    (mockPrisma.oasisAlert.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.oasisAlert.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/oasis/alerts');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });
});
