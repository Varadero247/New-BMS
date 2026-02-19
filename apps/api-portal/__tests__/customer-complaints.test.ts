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
