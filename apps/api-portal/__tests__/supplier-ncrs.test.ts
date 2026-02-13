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

import supplierNcrsRouter from '../src/routes/supplier-ncrs';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/supplier/ncrs', supplierNcrsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/supplier/ncrs', () => {
  it('should list NCRs', async () => {
    const items = [
      { id: 'ncr-1', reportType: 'NCR', description: 'Material defect', status: 'OPEN' },
    ];
    (prisma as any).portalQualityReport.findMany.mockResolvedValue(items);
    (prisma as any).portalQualityReport.count.mockResolvedValue(1);

    const res = await request(app).get('/api/supplier/ncrs');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).portalQualityReport.findMany.mockResolvedValue([]);
    (prisma as any).portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/supplier/ncrs?status=OPEN');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).portalQualityReport.findMany.mockResolvedValue([]);
    (prisma as any).portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/supplier/ncrs?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });

  it('should handle server error', async () => {
    (prisma as any).portalQualityReport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/supplier/ncrs');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/supplier/ncrs/:id/response', () => {
  it('should submit a corrective action response', async () => {
    const ncr = { id: 'ncr-1', portalUserId: 'user-123', reportType: 'NCR', status: 'OPEN', attachments: null };
    (prisma as any).portalQualityReport.findFirst.mockResolvedValue(ncr);
    (prisma as any).portalQualityReport.update.mockResolvedValue({ ...ncr, status: 'INVESTIGATING', resolution: 'Fixed material source' });

    const res = await request(app)
      .post('/api/supplier/ncrs/ncr-1/response')
      .send({ resolution: 'Fixed material source' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if NCR not found', async () => {
    (prisma as any).portalQualityReport.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/supplier/ncrs/nonexistent/response')
      .send({ resolution: 'Fixed' });

    expect(res.status).toBe(404);
  });

  it('should return 400 if NCR already closed', async () => {
    const ncr = { id: 'ncr-1', portalUserId: 'user-123', reportType: 'NCR', status: 'CLOSED', attachments: null };
    (prisma as any).portalQualityReport.findFirst.mockResolvedValue(ncr);

    const res = await request(app)
      .post('/api/supplier/ncrs/ncr-1/response')
      .send({ resolution: 'Fixed' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('should return 400 for empty resolution', async () => {
    const res = await request(app)
      .post('/api/supplier/ncrs/ncr-1/response')
      .send({ resolution: '' });

    expect(res.status).toBe(400);
  });
});
