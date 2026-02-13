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

const app = express();
app.use(express.json());
app.use('/api/portal/quality-reports', portalQualityRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/quality-reports', () => {
  it('should list quality reports', async () => {
    const items = [{ id: 'qr-1', reportType: 'NCR', status: 'OPEN', severity: 'MAJOR' }];
    (prisma as any).portalQualityReport.findMany.mockResolvedValue(items);
    (prisma as any).portalQualityReport.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/quality-reports');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).portalQualityReport.findMany.mockResolvedValue([]);
    (prisma as any).portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/quality-reports?status=OPEN');

    expect(res.status).toBe(200);
  });

  it('should filter by reportType', async () => {
    (prisma as any).portalQualityReport.findMany.mockResolvedValue([]);
    (prisma as any).portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/quality-reports?reportType=NCR');

    expect(res.status).toBe(200);
  });

  it('should filter by severity', async () => {
    (prisma as any).portalQualityReport.findMany.mockResolvedValue([]);
    (prisma as any).portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/quality-reports?severity=CRITICAL');

    expect(res.status).toBe(200);
  });

  it('should handle server error', async () => {
    (prisma as any).portalQualityReport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/quality-reports');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/quality-reports', () => {
  it('should create a quality report', async () => {
    const report = { id: 'qr-1', reportType: 'NCR', referenceNumber: 'PTL-QR-2602-1234', status: 'OPEN' };
    (prisma as any).portalQualityReport.create.mockResolvedValue(report);

    const res = await request(app)
      .post('/api/portal/quality-reports')
      .send({ portalUserId: '00000000-0000-0000-0000-000000000001', reportType: 'NCR', description: 'Material defect', severity: 'MAJOR' });

    expect(res.status).toBe(201);
    expect(res.body.data.reportType).toBe('NCR');
  });

  it('should return 400 for missing description', async () => {
    const res = await request(app)
      .post('/api/portal/quality-reports')
      .send({ portalUserId: '00000000-0000-0000-0000-000000000001', reportType: 'NCR', severity: 'MAJOR' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid reportType', async () => {
    const res = await request(app)
      .post('/api/portal/quality-reports')
      .send({ portalUserId: '00000000-0000-0000-0000-000000000001', reportType: 'INVALID', description: 'Test', severity: 'MAJOR' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/portal/quality-reports/:id', () => {
  it('should return a quality report', async () => {
    (prisma as any).portalQualityReport.findFirst.mockResolvedValue({ id: 'qr-1', reportType: 'NCR' });

    const res = await request(app).get('/api/portal/quality-reports/qr-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('qr-1');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).portalQualityReport.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/portal/quality-reports/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/quality-reports/:id', () => {
  it('should update a quality report', async () => {
    (prisma as any).portalQualityReport.findFirst.mockResolvedValue({ id: 'qr-1' });
    (prisma as any).portalQualityReport.update.mockResolvedValue({ id: 'qr-1', status: 'INVESTIGATING' });

    const res = await request(app)
      .put('/api/portal/quality-reports/qr-1')
      .send({ status: 'INVESTIGATING' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for update if not found', async () => {
    (prisma as any).portalQualityReport.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/quality-reports/nonexistent')
      .send({ status: 'INVESTIGATING' });

    expect(res.status).toBe(404);
  });

  it('should handle server error on update', async () => {
    (prisma as any).portalQualityReport.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/portal/quality-reports/qr-1')
      .send({ status: 'INVESTIGATING' });

    expect(res.status).toBe(500);
  });
});
