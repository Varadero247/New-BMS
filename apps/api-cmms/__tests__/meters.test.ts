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
