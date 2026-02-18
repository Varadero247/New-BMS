import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgReport: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    esgEmission: { findMany: jest.fn() },
    esgTarget: { findMany: jest.fn() },
    esgInitiative: { findMany: jest.fn() },
    esgSocialMetric: { findMany: jest.fn() },
    esgGovernanceMetric: { findMany: jest.fn() },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import reportsRouter from '../src/routes/reports';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/reports', reportsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockReport = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'Annual ESG Report 2026',
  reportType: 'ANNUAL',
  year: 2026,
  quarter: null,
  status: 'DRAFT',
  publishedAt: null,
  content: null,
  generatedBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/reports', () => {
  it('should return paginated reports list', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockReport]);
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by reportType', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/reports?reportType=ANNUAL');
    expect(prisma.esgReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ reportType: 'ANNUAL' }) })
    );
  });

  it('should filter by year and status', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/reports?year=2026&status=DRAFT');
    expect(prisma.esgReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ year: 2026, status: 'DRAFT' }) })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgReport.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/reports');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/reports', () => {
  it('should create a report', async () => {
    (prisma.esgReport.create as jest.Mock).mockResolvedValue(mockReport);

    const res = await request(app).post('/api/reports').send({
      title: 'Annual ESG Report 2026',
      reportType: 'ANNUAL',
      year: 2026,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing fields', async () => {
    const res = await request(app).post('/api/reports').send({
      title: 'Test',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid reportType', async () => {
    const res = await request(app).post('/api/reports').send({
      title: 'Test',
      reportType: 'INVALID',
      year: 2026,
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/reports/:id', () => {
  it('should return a single report', async () => {
    (prisma.esgReport.findFirst as jest.Mock).mockResolvedValue(mockReport);

    const res = await request(app).get('/api/reports/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgReport.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/reports/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/reports/:id', () => {
  it('should update a report', async () => {
    (prisma.esgReport.findFirst as jest.Mock).mockResolvedValue(mockReport);
    (prisma.esgReport.update as jest.Mock).mockResolvedValue({ ...mockReport, status: 'REVIEW' });

    const res = await request(app).put('/api/reports/00000000-0000-0000-0000-000000000001').send({ status: 'REVIEW' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgReport.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/reports/00000000-0000-0000-0000-000000000099').send({ status: 'REVIEW' });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app).put('/api/reports/00000000-0000-0000-0000-000000000001').send({ status: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/reports/:id', () => {
  it('should soft delete a report', async () => {
    (prisma.esgReport.findFirst as jest.Mock).mockResolvedValue(mockReport);
    (prisma.esgReport.update as jest.Mock).mockResolvedValue({ ...mockReport, deletedAt: new Date() });

    const res = await request(app).delete('/api/reports/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgReport.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/reports/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/reports/dashboard', () => {
  it('should return ESG dashboard KPIs', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([
      { co2Equivalent: 1000 }, { co2Equivalent: 500 },
    ]);
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([
      { status: 'ON_TRACK' }, { status: 'ACHIEVED' }, { status: 'AT_RISK' },
    ]);
    (prisma.esgInitiative.findMany as jest.Mock).mockResolvedValue([
      { status: 'IN_PROGRESS' }, { status: 'PLANNED' },
    ]);
    (prisma.esgReport.findMany as jest.Mock).mockResolvedValue([mockReport]);
    (prisma.esgSocialMetric.findMany as jest.Mock).mockResolvedValue([{}, {}]);
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([{}]);

    const res = await request(app).get('/api/reports/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalEmissions).toBe(1500);
    expect(res.body.data.targets.onTrack).toBe(2);
    expect(res.body.data.initiatives.active).toBe(1);
  });
});

describe('GET /api/reports/csrd', () => {
  it('should return CSRD report data', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([{ co2Equivalent: 2000 }]);
    (prisma.esgSocialMetric.findMany as jest.Mock).mockResolvedValue([{}]);
    (prisma.esgGovernanceMetric.findMany as jest.Mock).mockResolvedValue([{}]);
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([{ status: 'ACHIEVED' }]);

    const res = await request(app).get('/api/reports/csrd?year=2026');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.year).toBe(2026);
    expect(res.body.data.environmental).toBeDefined();
  });
});

describe('GET /api/reports/tcfd', () => {
  it('should return TCFD disclosure data', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([
      { scope: 'SCOPE_1', co2Equivalent: 1000 },
      { scope: 'SCOPE_2', co2Equivalent: 500 },
    ]);
    (prisma.esgTarget.findMany as jest.Mock).mockResolvedValue([
      { id: 't1', year: 2026, targetValue: 3000, actualValue: 1500, status: 'ON_TRACK' },
    ]);
    (prisma.esgInitiative.findMany as jest.Mock).mockResolvedValue([{}]);

    const res = await request(app).get('/api/reports/tcfd?year=2026');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metricsAndTargets.emissions.SCOPE_1).toBe(1000);
    expect(res.body.data.metricsAndTargets.totalEmissions).toBe(1500);
  });
});
