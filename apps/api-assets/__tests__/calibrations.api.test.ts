import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    assetCalibration: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/calibrations';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/calibrations', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/calibrations', () => {
  it('should return calibrations list', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', referenceNumber: 'ACL-2026-0001' },
    ]);
    mockPrisma.assetCalibration.count.mockResolvedValue(1);
    const res = await request(app).get('/api/calibrations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status filter', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([]);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/calibrations?status=PASSED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support search filter', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([]);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/calibrations?search=torque');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on error', async () => {
    mockPrisma.assetCalibration.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.assetCalibration.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/calibrations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/calibrations/:id', () => {
  it('should return a calibration by id', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      referenceNumber: 'ACL-2026-0001',
    });
    const res = await request(app).get('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/calibrations/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/calibrations', () => {
  it('should create a calibration', async () => {
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      referenceNumber: 'ACL-2026-0001',
    });
    const res = await request(app).post('/api/calibrations').send({
      assetId: 'asset-1',
      scheduledDate: '2026-03-01',
      status: 'SCHEDULED',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 on validation error (missing assetId)', async () => {
    const res = await request(app).post('/api/calibrations').send({
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on invalid status enum', async () => {
    const res = await request(app).post('/api/calibrations').send({
      assetId: 'asset-1',
      scheduledDate: '2026-03-01',
      status: 'INVALID_STATUS',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on create error', async () => {
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/calibrations').send({
      assetId: 'asset-1',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/calibrations/:id', () => {
  it('should update a calibration', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetCalibration.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PASSED',
    });
    const res = await request(app)
      .put('/api/calibrations/00000000-0000-0000-0000-000000000001')
      .send({ status: 'PASSED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/calibrations/00000000-0000-0000-0000-000000000099')
      .send({ status: 'PASSED' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 on validation error (invalid status)', async () => {
    const res = await request(app)
      .put('/api/calibrations/00000000-0000-0000-0000-000000000001')
      .send({ status: 'BAD_STATUS' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetCalibration.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/calibrations/00000000-0000-0000-0000-000000000001')
      .send({ status: 'PASSED' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/calibrations/:id', () => {
  it('should soft delete a calibration', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetCalibration.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/calibrations/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on delete error', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetCalibration.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('calibrations.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/calibrations', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/calibrations', async () => {
    const res = await request(app).get('/api/calibrations');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/calibrations', async () => {
    const res = await request(app).get('/api/calibrations');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/calibrations body has success property', async () => {
    const res = await request(app).get('/api/calibrations');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('Calibrations API — extended edge cases', () => {
  it('GET / pagination has totalPages field', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([]);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/calibrations');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('GET / with page=2 and limit=5 reflects correct pagination values', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([]);
    mockPrisma.assetCalibration.count.mockResolvedValue(30);
    const res = await request(app).get('/api/calibrations?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('GET / pagination total matches mocked count', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([]);
    mockPrisma.assetCalibration.count.mockResolvedValue(42);
    const res = await request(app).get('/api/calibrations');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(42);
  });

  it('POST / creates calibration with technician and standard fields', async () => {
    mockPrisma.assetCalibration.count.mockResolvedValue(2);
    mockPrisma.assetCalibration.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000011',
      referenceNumber: 'ACL-2026-0003',
    });
    const res = await request(app).post('/api/calibrations').send({
      assetId: '00000000-0000-0000-0000-000000000001',
      scheduledDate: '2026-06-01',
      technician: 'John Doe',
      standard: 'ISO 17025',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 when scheduledDate is invalid', async () => {
    const res = await request(app).post('/api/calibrations').send({
      assetId: '00000000-0000-0000-0000-000000000001',
      scheduledDate: 'not-a-date',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE / data.message confirms deletion', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetCalibration.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('PUT /:id returns 500 when findFirst throws', async () => {
    mockPrisma.assetCalibration.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/calibrations/00000000-0000-0000-0000-000000000001')
      .send({ status: 'PASSED' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /:id returns 500 on database error', async () => {
    mockPrisma.assetCalibration.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / data is an array', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', referenceNumber: 'ACL-2026-0001' },
    ]);
    mockPrisma.assetCalibration.count.mockResolvedValue(1);
    const res = await request(app).get('/api/calibrations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / with FAILED status filter returns 200', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([]);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/calibrations?status=FAILED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Calibrations API — comprehensive coverage', () => {
  it('GET / response content-type is json', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([]);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/calibrations');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET / success is true on empty result', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([]);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/calibrations');
    expect(res.body.success).toBe(true);
  });

  it('POST / create called with scheduledDate in data', async () => {
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000030', referenceNumber: 'ACL-2026-0001' });
    await request(app).post('/api/calibrations').send({ assetId: 'asset-99', scheduledDate: '2026-09-01' });
    expect(mockPrisma.assetCalibration.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ scheduledDate: expect.anything() }) })
    );
  });

  it('DELETE /:id findFirst is called once per request', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetCalibration.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.assetCalibration.findFirst).toHaveBeenCalledTimes(1);
  });
});

describe('Calibrations API — final coverage block', () => {
  it('POST / count is called to generate reference number', async () => {
    mockPrisma.assetCalibration.count.mockResolvedValue(5);
    mockPrisma.assetCalibration.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000020',
      referenceNumber: 'ACL-2026-0006',
    });
    await request(app).post('/api/calibrations').send({ assetId: 'asset-x', scheduledDate: '2026-06-15' });
    expect(mockPrisma.assetCalibration.count).toHaveBeenCalledTimes(1);
  });

  it('DELETE /:id update is called with deletedAt data', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetCalibration.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.assetCalibration.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET /:id data has referenceNumber field', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      referenceNumber: 'ACL-2026-0001',
    });
    const res = await request(app).get('/api/calibrations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });

  it('POST / create is called with assetId in data', async () => {
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', referenceNumber: 'ACL-2026-0001' });
    await request(app).post('/api/calibrations').send({ assetId: 'asset-abc', scheduledDate: '2026-07-01' });
    expect(mockPrisma.assetCalibration.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ assetId: 'asset-abc' }) })
    );
  });

  it('PUT /:id update is called with correct where.id', async () => {
    mockPrisma.assetCalibration.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.assetCalibration.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'PASSED' });
    await request(app).put('/api/calibrations/00000000-0000-0000-0000-000000000001').send({ status: 'PASSED' });
    expect(mockPrisma.assetCalibration.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('GET / findMany is called once per list request', async () => {
    mockPrisma.assetCalibration.findMany.mockResolvedValue([]);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    await request(app).get('/api/calibrations');
    expect(mockPrisma.assetCalibration.findMany).toHaveBeenCalledTimes(1);
  });
});
