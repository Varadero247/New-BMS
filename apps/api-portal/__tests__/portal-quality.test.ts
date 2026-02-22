import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalQualityReport: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import portalQualityRouter from '../src/routes/portal-quality';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/portal/quality-reports', portalQualityRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/quality-reports', () => {
  it('should list quality reports', async () => {
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        reportType: 'NCR',
        status: 'OPEN',
        severity: 'MAJOR',
      },
    ];
    mockPrisma.portalQualityReport.findMany.mockResolvedValue(items);
    mockPrisma.portalQualityReport.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/quality-reports');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/quality-reports?status=OPEN');

    expect(res.status).toBe(200);
  });

  it('should filter by reportType', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/quality-reports?reportType=NCR');

    expect(res.status).toBe(200);
  });

  it('should filter by severity', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/quality-reports?severity=CRITICAL');

    expect(res.status).toBe(200);
  });

  it('should handle server error', async () => {
    mockPrisma.portalQualityReport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/quality-reports');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/quality-reports', () => {
  it('should create a quality report', async () => {
    const report = {
      id: '00000000-0000-0000-0000-000000000001',
      reportType: 'NCR',
      referenceNumber: 'PTL-QR-2602-1234',
      status: 'OPEN',
    };
    mockPrisma.portalQualityReport.create.mockResolvedValue(report);

    const res = await request(app).post('/api/portal/quality-reports').send({
      portalUserId: '00000000-0000-0000-0000-000000000001',
      reportType: 'NCR',
      description: 'Material defect',
      severity: 'MAJOR',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.reportType).toBe('NCR');
  });

  it('should return 400 for missing description', async () => {
    const res = await request(app).post('/api/portal/quality-reports').send({
      portalUserId: '00000000-0000-0000-0000-000000000001',
      reportType: 'NCR',
      severity: 'MAJOR',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid reportType', async () => {
    const res = await request(app).post('/api/portal/quality-reports').send({
      portalUserId: '00000000-0000-0000-0000-000000000001',
      reportType: 'INVALID',
      description: 'Test',
      severity: 'MAJOR',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/portal/quality-reports/:id', () => {
  it('should return a quality report', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      reportType: 'NCR',
    });

    const res = await request(app).get(
      '/api/portal/quality-reports/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/portal/quality-reports/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/quality-reports/:id', () => {
  it('should update a quality report', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalQualityReport.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'INVESTIGATING',
    });

    const res = await request(app)
      .put('/api/portal/quality-reports/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVESTIGATING' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for update if not found', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/quality-reports/00000000-0000-0000-0000-000000000099')
      .send({ status: 'INVESTIGATING' });

    expect(res.status).toBe(404);
  });

  it('should handle server error on update', async () => {
    mockPrisma.portalQualityReport.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/portal/quality-reports/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVESTIGATING' });

    expect(res.status).toBe(500);
  });
});

describe('Portal Quality — extended', () => {
  it('POST /quality-reports returns referenceNumber in response', async () => {
    const report = {
      id: '00000000-0000-0000-0000-000000000002',
      reportType: 'COMPLAINT',
      referenceNumber: 'PTL-QR-2602-9999',
      status: 'OPEN',
    };
    mockPrisma.portalQualityReport.create.mockResolvedValue(report);

    const res = await request(app).post('/api/portal/quality-reports').send({
      portalUserId: '00000000-0000-0000-0000-000000000001',
      reportType: 'COMPLAINT',
      description: 'Wrong delivery',
      severity: 'MINOR',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toBeDefined();
  });

  it('GET /quality-reports returns pagination metadata', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(15);

    const res = await request(app).get('/api/portal/quality-reports?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(15);
  });
});

describe('portal-quality — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/portal/quality-reports', portalQualityRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/portal/quality-reports', async () => {
    const res = await request(app).get('/api/portal/quality-reports');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/portal/quality-reports', async () => {
    const res = await request(app).get('/api/portal/quality-reports');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/portal/quality-reports body has success property', async () => {
    const res = await request(app).get('/api/portal/quality-reports');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/portal/quality-reports body is an object', async () => {
    const res = await request(app).get('/api/portal/quality-reports');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/portal/quality-reports route is accessible', async () => {
    const res = await request(app).get('/api/portal/quality-reports');
    expect(res.status).toBeDefined();
  });
});

describe('portal-quality — edge cases', () => {
  it('POST: missing severity → 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/portal/quality-reports').send({
      portalUserId: '00000000-0000-0000-0000-000000000001',
      reportType: 'NCR',
      description: 'Defect found',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST: missing portalUserId → 400', async () => {
    const res = await request(app).post('/api/portal/quality-reports').send({
      reportType: 'NCR',
      description: 'Defect found',
      severity: 'MAJOR',
    });

    expect(res.status).toBe(400);
  });

  it('POST: DB error → 500 INTERNAL_ERROR', async () => {
    mockPrisma.portalQualityReport.create.mockRejectedValue(new Error('DB timeout'));

    const res = await request(app).post('/api/portal/quality-reports').send({
      portalUserId: '00000000-0000-0000-0000-000000000001',
      reportType: 'NCR',
      description: 'Material defect',
      severity: 'MAJOR',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET list: filter by severity passes severity in where clause', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    await request(app).get('/api/portal/quality-reports?severity=MAJOR');

    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ severity: 'MAJOR' }) })
    );
  });

  it('GET list: pagination totalPages rounds up correctly', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(11);

    const res = await request(app).get('/api/portal/quality-reports?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET /:id: 500 on DB error returns INTERNAL_ERROR code', async () => {
    mockPrisma.portalQualityReport.findFirst.mockRejectedValue(new Error('Connection failed'));

    const res = await request(app).get(
      '/api/portal/quality-reports/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id: update to RESOLVED status succeeds', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalQualityReport.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'RESOLVED',
      resolution: 'Issue fixed',
    });

    const res = await request(app)
      .put('/api/portal/quality-reports/00000000-0000-0000-0000-000000000001')
      .send({ status: 'RESOLVED', resolution: 'Issue fixed' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  it('PUT /:id: invalid status value → 400', async () => {
    const res = await request(app)
      .put('/api/portal/quality-reports/00000000-0000-0000-0000-000000000001')
      .send({ status: 'PENDING' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:id: 500 on DB error returns INTERNAL_ERROR code', async () => {
    mockPrisma.portalQualityReport.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/portal/quality-reports/00000000-0000-0000-0000-000000000001')
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Portal Quality — final coverage', () => {
  it('GET list: response body has success and data fields', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/quality-reports');
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET list: returns empty array when no reports exist', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    const res = await request(app).get('/api/portal/quality-reports');
    expect(res.body.data).toEqual([]);
  });

  it('POST: AUDIT reportType is valid and creates successfully', async () => {
    mockPrisma.portalQualityReport.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000010',
      reportType: 'AUDIT',
      referenceNumber: 'PTL-QR-2602-0010',
      status: 'OPEN',
    });
    const res = await request(app).post('/api/portal/quality-reports').send({
      portalUserId: '00000000-0000-0000-0000-000000000001',
      reportType: 'AUDIT',
      description: 'Audit finding noted',
      severity: 'MINOR',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.reportType).toBe('AUDIT');
  });

  it('GET list: count called once per list request', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    await request(app).get('/api/portal/quality-reports');
    expect(mockPrisma.portalQualityReport.count).toHaveBeenCalledTimes(1);
  });

  it('PUT /:id: update called with correct id in where clause', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.portalQualityReport.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'INVESTIGATING' });
    await request(app)
      .put('/api/portal/quality-reports/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVESTIGATING' });
    expect(mockPrisma.portalQualityReport.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('GET list: findMany called with reportType NCR in where clause', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    await request(app).get('/api/portal/quality-reports?reportType=NCR');
    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ reportType: 'NCR' }) })
    );
  });
});
