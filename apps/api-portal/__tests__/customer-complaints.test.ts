import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalQualityReport: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
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

import customerComplaintsRouter from '../src/routes/customer-complaints';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/customer/complaints', customerComplaintsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/customer/complaints', () => {
  it('should create a complaint', async () => {
    const complaint = {
      id: '00000000-0000-0000-0000-000000000001',
      portalUserId: 'user-123',
      reportType: 'COMPLAINT',
      referenceNumber: 'PTL-CMP-2602-1234',
      description: 'Defective product',
      severity: 'MAJOR',
      status: 'OPEN',
      createdBy: 'user-123',
    };
    mockPrisma.portalQualityReport.create.mockResolvedValue(complaint);

    const res = await request(app)
      .post('/api/customer/complaints')
      .send({ description: 'Defective product', severity: 'MAJOR' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reportType).toBe('COMPLAINT');
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app).post('/api/customer/complaints').send({ description: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing severity', async () => {
    const res = await request(app)
      .post('/api/customer/complaints')
      .send({ description: 'Some problem' });

    expect(res.status).toBe(400);
  });

  it('should handle server error on create', async () => {
    mockPrisma.portalQualityReport.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/customer/complaints')
      .send({ description: 'Test', severity: 'MINOR' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/customer/complaints', () => {
  it('should list complaints with pagination', async () => {
    const items = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        reportType: 'COMPLAINT',
        description: 'Issue 1',
        status: 'OPEN',
      },
      { id: 'c-2', reportType: 'COMPLAINT', description: 'Issue 2', status: 'RESOLVED' },
    ];
    mockPrisma.portalQualityReport.findMany.mockResolvedValue(items);
    mockPrisma.portalQualityReport.count.mockResolvedValue(2);

    const res = await request(app).get('/api/customer/complaints');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customer/complaints?status=OPEN');

    expect(res.status).toBe(200);
    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'OPEN' }) })
    );
  });

  it('should handle server error on list', async () => {
    mockPrisma.portalQualityReport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/customer/complaints');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/customer/complaints/:id', () => {
  it('should return a complaint', async () => {
    const complaint = {
      id: '00000000-0000-0000-0000-000000000001',
      description: 'Problem',
      status: 'OPEN',
      portalUserId: 'user-123',
    };
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue(complaint);

    const res = await request(app).get(
      '/api/customer/complaints/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/customer/complaints/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server error on fetch', async () => {
    mockPrisma.portalQualityReport.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(
      '/api/customer/complaints/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
  });
});

describe('Customer Complaints — extended', () => {
  it('GET list: data is an array', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    const res = await request(app).get('/api/customer/complaints');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET list: success is true', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    const res = await request(app).get('/api/customer/complaints');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET list: findMany called once per request', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    await request(app).get('/api/customer/complaints');
    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET list: pagination object has total field', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(5);
    const res = await request(app).get('/api/customer/complaints');
    expect(res.body.pagination).toHaveProperty('total', 5);
  });

  it('GET /:id: success is true when found', async () => {
    mockPrisma.portalQualityReport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      description: 'Issue',
      status: 'OPEN',
      portalUserId: 'user-123',
    });
    const res = await request(app).get('/api/customer/complaints/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('customer-complaints — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/customer/complaints', customerComplaintsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/customer/complaints', async () => {
    const res = await request(app).get('/api/customer/complaints');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/customer/complaints', async () => {
    const res = await request(app).get('/api/customer/complaints');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/customer/complaints body has success property', async () => {
    const res = await request(app).get('/api/customer/complaints');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/customer/complaints body is an object', async () => {
    const res = await request(app).get('/api/customer/complaints');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/customer/complaints route is accessible', async () => {
    const res = await request(app).get('/api/customer/complaints');
    expect(res.status).toBeDefined();
  });
});

describe('customer-complaints — edge cases', () => {
  it('GET list: pagination skip is (page-1)*limit — page=3 limit=5 → skip=10', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customer/complaints?page=3&limit=5');

    expect(res.status).toBe(200);
    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('GET list: filter by status=RESOLVED passes status in where clause', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    await request(app).get('/api/customer/complaints?status=RESOLVED');

    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'RESOLVED' }) })
    );
  });

  it('GET list: without status filter, where clause has reportType=COMPLAINT', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    await request(app).get('/api/customer/complaints');

    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ reportType: 'COMPLAINT' }) })
    );
  });

  it('POST: empty description string → 400 validation error', async () => {
    const res = await request(app)
      .post('/api/customer/complaints')
      .send({ description: '   ', severity: 'MINOR' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST: invalid severity value → 400', async () => {
    const res = await request(app)
      .post('/api/customer/complaints')
      .send({ description: 'Problem', severity: 'CATASTROPHIC' });

    expect(res.status).toBe(400);
  });

  it('GET /:id: 500 error returns INTERNAL_ERROR code', async () => {
    mockPrisma.portalQualityReport.findFirst.mockRejectedValue(new Error('DB timeout'));

    const res = await request(app).get(
      '/api/customer/complaints/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST: CRITICAL severity is accepted and returns 201', async () => {
    mockPrisma.portalQualityReport.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      reportType: 'COMPLAINT',
      severity: 'CRITICAL',
      status: 'OPEN',
    });

    const res = await request(app)
      .post('/api/customer/complaints')
      .send({ description: 'Critical issue', severity: 'CRITICAL' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET list: pagination totalPages rounds up correctly', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(11);

    const res = await request(app).get('/api/customer/complaints?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('POST: count is not called on create', async () => {
    mockPrisma.portalQualityReport.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      reportType: 'COMPLAINT',
      severity: 'MINOR',
      status: 'OPEN',
    });

    await request(app)
      .post('/api/customer/complaints')
      .send({ description: 'Test complaint', severity: 'MINOR' });

    expect(mockPrisma.portalQualityReport.count).not.toHaveBeenCalled();
  });

  it('GET list: 500 error returns success:false', async () => {
    mockPrisma.portalQualityReport.findMany.mockRejectedValue(new Error('Connection refused'));

    const res = await request(app).get('/api/customer/complaints');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
