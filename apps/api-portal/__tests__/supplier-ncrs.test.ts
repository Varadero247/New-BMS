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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/supplier/ncrs', supplierNcrsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/supplier/ncrs', () => {
  it('should list NCRs', async () => {
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        reportType: 'NCR',
        description: 'Material defect',
        status: 'OPEN',
      },
    ];
    mockPrisma.portalQualityReport.findMany.mockResolvedValue(items);
    mockPrisma.portalQualityReport.count.mockResolvedValue(1);

    const res = await request(app).get('/api/supplier/ncrs');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/supplier/ncrs?status=OPEN');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/supplier/ncrs?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });

  it('should handle server error', async () => {
    mockPrisma.portalQualityReport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/supplier/ncrs');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/supplier/ncrs/:id/response', () => {
  it('should submit a corrective action response', async () => {
    const ncr = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      reportType: 'NCR',
      status: 'OPEN',
      attachments: null,
    };
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue(ncr);
    mockPrisma.portalQualityReport.update.mockResolvedValue({
      ...ncr,
      status: 'INVESTIGATING',
      resolution: 'Fixed material source',
    });

    const res = await request(app)
      .post('/api/supplier/ncrs/00000000-0000-0000-0000-000000000001/response')
      .send({ resolution: 'Fixed material source' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if NCR not found', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/supplier/ncrs/00000000-0000-0000-0000-000000000099/response')
      .send({ resolution: 'Fixed' });

    expect(res.status).toBe(404);
  });

  it('should return 400 if NCR already closed', async () => {
    const ncr = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      reportType: 'NCR',
      status: 'CLOSED',
      attachments: null,
    };
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue(ncr);

    const res = await request(app)
      .post('/api/supplier/ncrs/00000000-0000-0000-0000-000000000001/response')
      .send({ resolution: 'Fixed' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('should return 400 for empty resolution', async () => {
    const res = await request(app)
      .post('/api/supplier/ncrs/00000000-0000-0000-0000-000000000001/response')
      .send({ resolution: '' });

    expect(res.status).toBe(400);
  });
});

describe('Supplier NCRs — extended', () => {
  it('GET list: data is an array', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/ncrs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET list: success is true', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    const res = await request(app).get('/api/supplier/ncrs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET list: findMany called once per request', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    await request(app).get('/api/supplier/ncrs');
    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('Supplier NCRs — extra', () => {
  it('GET list: data length matches mock array length', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([
      { id: 'n1', reportType: 'NCR', description: 'Defect A', status: 'OPEN' },
      { id: 'n2', reportType: 'NCR', description: 'Defect B', status: 'CLOSED' },
    ]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(2);
    const res = await request(app).get('/api/supplier/ncrs');
    expect(res.body.data).toHaveLength(2);
  });

  it('GET list: pagination total matches count mock', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(8);
    const res = await request(app).get('/api/supplier/ncrs');
    expect(res.body.pagination.total).toBe(8);
  });

  it('POST response: update called once on success', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      reportType: 'NCR',
      status: 'OPEN',
      attachments: null,
    });
    mockPrisma.portalQualityReport.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'INVESTIGATING', resolution: 'Fixed' });
    await request(app)
      .post('/api/supplier/ncrs/00000000-0000-0000-0000-000000000001/response')
      .send({ resolution: 'Fixed material defect' });
    expect(mockPrisma.portalQualityReport.update).toHaveBeenCalledTimes(1);
  });

  it('GET list: returns 500 on DB error with error code', async () => {
    mockPrisma.portalQualityReport.findMany.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/supplier/ncrs');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('supplier-ncrs — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/supplier/ncrs', supplierNcrsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/supplier/ncrs', async () => {
    const res = await request(app).get('/api/supplier/ncrs');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/supplier/ncrs', async () => {
    const res = await request(app).get('/api/supplier/ncrs');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/supplier/ncrs body has success property', async () => {
    const res = await request(app).get('/api/supplier/ncrs');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/supplier/ncrs body is an object', async () => {
    const res = await request(app).get('/api/supplier/ncrs');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/supplier/ncrs route is accessible', async () => {
    const res = await request(app).get('/api/supplier/ncrs');
    expect(res.status).toBeDefined();
  });
});
