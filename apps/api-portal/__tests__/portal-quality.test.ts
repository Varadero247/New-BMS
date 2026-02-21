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
