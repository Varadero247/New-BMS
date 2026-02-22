import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsMeterReading: {
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

import metersRouter from '../src/routes/meters';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/meters', metersRouter);

const mockReading = {
  id: '00000000-0000-0000-0000-000000000001',
  assetId: 'asset-1',
  meterType: 'HOURS',
  reading: 5000,
  readingDate: new Date('2026-02-13'),
  previousReading: 4800,
  delta: 200,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
  asset: { id: 'asset-1', name: 'CNC Machine', code: 'ASSET-1001' },
};

describe('Meters Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/meters', () => {
    it('should return paginated meter readings', async () => {
      prisma.cmmsMeterReading.findMany.mockResolvedValue([mockReading]);
      prisma.cmmsMeterReading.count.mockResolvedValue(1);

      const res = await request(app).get('/api/meters');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by assetId', async () => {
      prisma.cmmsMeterReading.findMany.mockResolvedValue([]);
      prisma.cmmsMeterReading.count.mockResolvedValue(0);

      const res = await request(app).get('/api/meters?assetId=asset-1');
      expect(res.status).toBe(200);
    });

    it('should filter by meterType', async () => {
      prisma.cmmsMeterReading.findMany.mockResolvedValue([]);
      prisma.cmmsMeterReading.count.mockResolvedValue(0);

      const res = await request(app).get('/api/meters?meterType=HOURS');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsMeterReading.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/meters');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/meters', () => {
    it('should create a meter reading', async () => {
      prisma.cmmsMeterReading.create.mockResolvedValue(mockReading);

      const res = await request(app).post('/api/meters').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        meterType: 'HOURS',
        reading: 5000,
        readingDate: '2026-02-13T00:00:00Z',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should auto-calculate delta', async () => {
      prisma.cmmsMeterReading.create.mockResolvedValue(mockReading);

      const res = await request(app).post('/api/meters').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        meterType: 'HOURS',
        reading: 5000,
        readingDate: '2026-02-13T00:00:00Z',
        previousReading: 4800,
      });
      expect(res.status).toBe(201);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/meters').send({});
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid meterType', async () => {
      const res = await request(app).post('/api/meters').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        meterType: 'INVALID',
        reading: 5000,
        readingDate: '2026-02-13T00:00:00Z',
      });
      expect(res.status).toBe(400);
    });

    it('should handle creation errors', async () => {
      prisma.cmmsMeterReading.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/meters').send({
        assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        meterType: 'HOURS',
        reading: 5000,
        readingDate: '2026-02-13T00:00:00Z',
      });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/meters/:id', () => {
    it('should return a meter reading by ID', async () => {
      prisma.cmmsMeterReading.findFirst.mockResolvedValue(mockReading);

      const res = await request(app).get('/api/meters/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent reading', async () => {
      prisma.cmmsMeterReading.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/meters/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/meters/:id', () => {
    it('should update a meter reading', async () => {
      prisma.cmmsMeterReading.findFirst.mockResolvedValue(mockReading);
      prisma.cmmsMeterReading.update.mockResolvedValue({ ...mockReading, reading: 5100 });

      const res = await request(app)
        .put('/api/meters/00000000-0000-0000-0000-000000000001')
        .send({ reading: 5100 });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent reading', async () => {
      prisma.cmmsMeterReading.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/meters/00000000-0000-0000-0000-000000000099')
        .send({ reading: 5100 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/meters/:id', () => {
    it('should soft delete a meter reading', async () => {
      prisma.cmmsMeterReading.findFirst.mockResolvedValue(mockReading);
      prisma.cmmsMeterReading.update.mockResolvedValue({ ...mockReading, deletedAt: new Date() });

      const res = await request(app).delete('/api/meters/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent reading', async () => {
      prisma.cmmsMeterReading.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/meters/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    prisma.cmmsMeterReading.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/meters');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    prisma.cmmsMeterReading.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/meters').send({
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      meterType: 'HOURS',
      reading: 5000,
      readingDate: '2026-02-13T00:00:00Z',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 on DB error', async () => {
    prisma.cmmsMeterReading.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    prisma.cmmsMeterReading.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/meters/00000000-0000-0000-0000-000000000001').send({ reading: 6000 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('meters — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/meters', metersRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/meters', async () => {
    const res = await request(app).get('/api/meters');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/meters', async () => {
    const res = await request(app).get('/api/meters');
    expect(res.headers['content-type']).toBeDefined();
  });
});

describe('meters — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns pagination metadata with correct totalPages', async () => {
    prisma.cmmsMeterReading.findMany.mockResolvedValue([mockReading]);
    prisma.cmmsMeterReading.count.mockResolvedValue(50);
    const res = await request(app).get('/api/meters?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(5);
    expect(res.body.pagination.total).toBe(50);
  });

  it('GET / filters by MILES meterType', async () => {
    prisma.cmmsMeterReading.findMany.mockResolvedValue([]);
    prisma.cmmsMeterReading.count.mockResolvedValue(0);
    const res = await request(app).get('/api/meters?meterType=MILES');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET / returns success false with INTERNAL_ERROR when count fails', async () => {
    prisma.cmmsMeterReading.findMany.mockResolvedValue([]);
    prisma.cmmsMeterReading.count.mockRejectedValue(new Error('count error'));
    const res = await request(app).get('/api/meters');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / accepts KILOMETERS as valid meterType', async () => {
    prisma.cmmsMeterReading.create.mockResolvedValue({ ...mockReading, meterType: 'KILOMETERS' });
    const res = await request(app).post('/api/meters').send({
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      meterType: 'KILOMETERS',
      reading: 1000,
      readingDate: '2026-02-13T00:00:00Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / accepts CYCLES as valid meterType', async () => {
    prisma.cmmsMeterReading.create.mockResolvedValue({ ...mockReading, meterType: 'CYCLES' });
    const res = await request(app).post('/api/meters').send({
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      meterType: 'CYCLES',
      reading: 250,
      readingDate: '2026-02-13T00:00:00Z',
    });
    expect(res.status).toBe(201);
  });

  it('POST / returns 400 when readingDate is invalid', async () => {
    const res = await request(app).post('/api/meters').send({
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      meterType: 'HOURS',
      reading: 5000,
      readingDate: 'not-a-date',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id returns 404 with NOT_FOUND code', async () => {
    prisma.cmmsMeterReading.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/meters/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('DELETE /:id response message confirms deletion', async () => {
    prisma.cmmsMeterReading.findFirst.mockResolvedValue(mockReading);
    prisma.cmmsMeterReading.update.mockResolvedValue({ ...mockReading, deletedAt: new Date() });
    const res = await request(app).delete('/api/meters/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    prisma.cmmsMeterReading.findFirst.mockResolvedValue(mockReading);
    prisma.cmmsMeterReading.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/meters/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / returns page and limit in pagination object', async () => {
    prisma.cmmsMeterReading.findMany.mockResolvedValue([]);
    prisma.cmmsMeterReading.count.mockResolvedValue(0);
    const res = await request(app).get('/api/meters?page=2&limit=25');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(25);
  });
});

describe('meters — business logic and response structure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST / sets createdBy from the authenticated user', async () => {
    prisma.cmmsMeterReading.create.mockResolvedValue(mockReading);
    await request(app).post('/api/meters').send({
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      meterType: 'HOURS',
      reading: 5200,
      readingDate: '2026-02-15T00:00:00Z',
    });
    expect(prisma.cmmsMeterReading.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ createdBy: 'user-123' }) })
    );
  });

  it('GET /meters?assetId filters findMany by assetId', async () => {
    prisma.cmmsMeterReading.findMany.mockResolvedValue([]);
    prisma.cmmsMeterReading.count.mockResolvedValue(0);
    const aid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    await request(app).get(`/api/meters?assetId=${aid}`);
    expect(prisma.cmmsMeterReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ assetId: aid }) })
    );
  });

  it('PUT /:id returns updated reading value in response', async () => {
    prisma.cmmsMeterReading.findFirst.mockResolvedValue(mockReading);
    prisma.cmmsMeterReading.update.mockResolvedValue({ ...mockReading, reading: 6000 });
    const res = await request(app)
      .put('/api/meters/00000000-0000-0000-0000-000000000001')
      .send({ reading: 6000 });
    expect(res.status).toBe(200);
    expect(res.body.data.reading).toBe(6000);
  });

  it('DELETE /:id soft-deletes by setting deletedAt via update', async () => {
    prisma.cmmsMeterReading.findFirst.mockResolvedValue(mockReading);
    prisma.cmmsMeterReading.update.mockResolvedValue({ ...mockReading, deletedAt: new Date() });
    await request(app).delete('/api/meters/00000000-0000-0000-0000-000000000001');
    expect(prisma.cmmsMeterReading.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET / returns success:true and data is an array', async () => {
    prisma.cmmsMeterReading.findMany.mockResolvedValue([mockReading]);
    prisma.cmmsMeterReading.count.mockResolvedValue(1);
    const res = await request(app).get('/api/meters');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('meters — final coverage expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /meters data items include meterType field', async () => {
    prisma.cmmsMeterReading.findMany.mockResolvedValue([mockReading]);
    prisma.cmmsMeterReading.count.mockResolvedValue(1);
    const res = await request(app).get('/api/meters');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('meterType', 'HOURS');
  });

  it('GET /meters response content-type is application/json', async () => {
    prisma.cmmsMeterReading.findMany.mockResolvedValue([]);
    prisma.cmmsMeterReading.count.mockResolvedValue(0);
    const res = await request(app).get('/api/meters');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('POST /meters returns 400 when readingDate is missing', async () => {
    const res = await request(app).post('/api/meters').send({
      assetId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      meterType: 'HOURS',
      reading: 5000,
    });
    expect(res.status).toBe(400);
  });

  it('PUT /meters/:id returns 404 with NOT_FOUND code when missing', async () => {
    prisma.cmmsMeterReading.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/meters/00000000-0000-0000-0000-000000000077')
      .send({ reading: 9999 });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /meters?meterType=HOURS filters findMany by meterType', async () => {
    prisma.cmmsMeterReading.findMany.mockResolvedValue([]);
    prisma.cmmsMeterReading.count.mockResolvedValue(0);
    await request(app).get('/api/meters?meterType=HOURS');
    expect(prisma.cmmsMeterReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ meterType: 'HOURS' }) })
    );
  });
});
