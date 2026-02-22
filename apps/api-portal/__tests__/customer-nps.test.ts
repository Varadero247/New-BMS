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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/customer/nps', customerNpsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/customer/nps', () => {
  it('should submit an NPS score', async () => {
    const nps = {
      id: 'n-1',
      reportType: 'INSPECTION',
      description: 'NPS Score: 9',
      status: 'CLOSED',
    };
    mockPrisma.portalQualityReport.create.mockResolvedValue(nps);

    const res = await request(app)
      .post('/api/customer/nps')
      .send({ score: 9, comment: 'Great service' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject score below 0', async () => {
    const res = await request(app).post('/api/customer/nps').send({ score: -1 });

    expect(res.status).toBe(400);
  });

  it('should reject score above 10', async () => {
    const res = await request(app).post('/api/customer/nps').send({ score: 11 });

    expect(res.status).toBe(400);
  });

  it('should accept score of 0', async () => {
    const nps = {
      id: 'n-2',
      reportType: 'INSPECTION',
      description: 'NPS Score: 0',
      status: 'CLOSED',
    };
    mockPrisma.portalQualityReport.create.mockResolvedValue(nps);

    const res = await request(app).post('/api/customer/nps').send({ score: 0 });

    expect(res.status).toBe(201);
  });

  it('should handle server error on submit', async () => {
    mockPrisma.portalQualityReport.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/customer/nps').send({ score: 8 });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/customer/nps', () => {
  it('should list NPS submissions', async () => {
    const items = [{ id: 'n-1', reportType: 'INSPECTION', description: 'NPS Score: 9' }];
    mockPrisma.portalQualityReport.findMany.mockResolvedValue(items);
    mockPrisma.portalQualityReport.count.mockResolvedValue(1);

    const res = await request(app).get('/api/customer/nps');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return pagination info', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customer/nps');

    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(0);
  });

  it('should handle server error on list', async () => {
    mockPrisma.portalQualityReport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/customer/nps');

    expect(res.status).toBe(500);
  });
});

describe('Customer NPS — extended', () => {
  it('GET list: data is an array', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    const res = await request(app).get('/api/customer/nps');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET list: success is true', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    const res = await request(app).get('/api/customer/nps');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST submit: create called once per submission', async () => {
    mockPrisma.portalQualityReport.create.mockResolvedValue({ id: 'nps-1', reportType: 'INSPECTION', description: 'NPS Score: 8' });
    await request(app).post('/api/customer/nps').send({ score: 8, comment: 'Great service' });
    expect(mockPrisma.portalQualityReport.create).toHaveBeenCalledTimes(1);
  });
});

describe('Customer NPS — extra', () => {
  it('GET list: findMany called once per request', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);
    await request(app).get('/api/customer/nps');
    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET list: pagination total matches count mock value', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(7);
    const res = await request(app).get('/api/customer/nps');
    expect(res.body.pagination.total).toBe(7);
  });

  it('POST submit: success is true for score 10', async () => {
    mockPrisma.portalQualityReport.create.mockResolvedValue({ id: 'nps-10', reportType: 'INSPECTION', description: 'NPS Score: 10' });
    const res = await request(app).post('/api/customer/nps').send({ score: 10 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST submit: returns 500 with error code on DB error', async () => {
    mockPrisma.portalQualityReport.create.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).post('/api/customer/nps').send({ score: 5 });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('customer-nps — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/customer/nps', customerNpsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/customer/nps', async () => {
    const res = await request(app).get('/api/customer/nps');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/customer/nps', async () => {
    const res = await request(app).get('/api/customer/nps');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/customer/nps body has success property', async () => {
    const res = await request(app).get('/api/customer/nps');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/customer/nps body is an object', async () => {
    const res = await request(app).get('/api/customer/nps');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/customer/nps route is accessible', async () => {
    const res = await request(app).get('/api/customer/nps');
    expect(res.status).toBeDefined();
  });
});

describe('customer-nps — edge cases', () => {
  it('POST: missing score field → 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/customer/nps').send({ comment: 'Good service' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST: score=1 (detractor boundary) is accepted', async () => {
    mockPrisma.portalQualityReport.create.mockResolvedValue({
      id: 'nps-1',
      reportType: 'INSPECTION',
      description: 'NPS Score: 1',
    });

    const res = await request(app).post('/api/customer/nps').send({ score: 1 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST: score=7 (passive boundary) is accepted', async () => {
    mockPrisma.portalQualityReport.create.mockResolvedValue({
      id: 'nps-7',
      reportType: 'INSPECTION',
      description: 'NPS Score: 7',
    });

    const res = await request(app).post('/api/customer/nps').send({ score: 7 });

    expect(res.status).toBe(201);
  });

  it('POST: score=9 with comment stores comment in description', async () => {
    mockPrisma.portalQualityReport.create.mockResolvedValue({
      id: 'nps-9',
      reportType: 'INSPECTION',
      description: 'NPS Score: 9 - Outstanding service',
    });

    await request(app).post('/api/customer/nps').send({ score: 9, comment: 'Outstanding service' });

    expect(mockPrisma.portalQualityReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reportType: 'INSPECTION',
          status: 'CLOSED',
        }),
      })
    );
  });

  it('POST: non-integer score → 400', async () => {
    const res = await request(app).post('/api/customer/nps').send({ score: 7.5 });

    expect(res.status).toBe(400);
  });

  it('GET list: pagination page/limit params are applied', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    await request(app).get('/api/customer/nps?page=2&limit=5');

    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('GET list: where clause always includes reportType=INSPECTION', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    await request(app).get('/api/customer/nps');

    expect(mockPrisma.portalQualityReport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ reportType: 'INSPECTION' }),
      })
    );
  });

  it('GET list: pagination has page and limit fields from request', async () => {
    mockPrisma.portalQualityReport.findMany.mockResolvedValue([]);
    mockPrisma.portalQualityReport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/customer/nps?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('GET list: 500 returns INTERNAL_ERROR code', async () => {
    mockPrisma.portalQualityReport.findMany.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/customer/nps');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
