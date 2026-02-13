import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalQualityReport: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
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

import customerNpsRouter from '../src/routes/customer-nps';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/customer/nps', customerNpsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/customer/nps', () => {
  it('should submit an NPS score', async () => {
    const nps = { id: 'n-1', reportType: 'INSPECTION', description: 'NPS Score: 9', status: 'CLOSED' };
    (prisma as any).portalQualityReport.create.mockResolvedValue(nps);

    const res = await request(app)
      .post('/api/customer/nps')
      .send({ score: 9, comment: 'Great service' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject score below 0', async () => {
    const res = await request(app)
      .post('/api/customer/nps')
      .send({ score: -1 });

    expect(res.status).toBe(400);
  });

  it('should reject score above 10', async () => {
    const res = await request(app)
      .post('/api/customer/nps')
      .send({ score: 11 });

    expect(res.status).toBe(400);
  });

  it('should accept score of 0', async () => {
    const nps = { id: 'n-2', reportType: 'INSPECTION', description: 'NPS Score: 0', status: 'CLOSED' };
    (prisma as any).portalQualityReport.create.mockResolvedValue(nps);

    const res = await request(app)
      .post('/api/customer/nps')
      .send({ score: 0 });

    expect(res.status).toBe(201);
  });

  it('should handle server error on submit', async () => {
    (prisma as any).portalQualityReport.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/customer/nps')
      .send({ score: 8 });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/customer/nps', () => {
  it('should list NPS submissions', async () => {
    const items = [{ id: 'n-1', reportType: 'INSPECTION', description: 'NPS Score: 9' }];
    (prisma as any).portalQualityReport.findMany.mockResolvedValue(items);
    (prisma as any).portalQualityReport.count.mockResolvedValue(1);

    const res = await request(app).get('/api/customer/nps');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return pagination info', async () => {
    (prisma as any).portalQualityReport.findMany.mockResolvedValue([]);
    (prisma as any).portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customer/nps');

    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(0);
  });

  it('should handle server error on list', async () => {
    (prisma as any).portalQualityReport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/customer/nps');

    expect(res.status).toBe(500);
  });
});
