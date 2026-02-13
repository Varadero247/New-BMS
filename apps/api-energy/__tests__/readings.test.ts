import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyReading: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    energyMeter: {
      findFirst: jest.fn(),
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

import readingsRouter from '../src/routes/readings';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/readings', readingsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/readings', () => {
  it('should return paginated readings', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([{ id: '1', value: 100 }]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/readings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by meterId', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/readings?meterId=00000000-0000-0000-0000-000000000001');

    expect(prisma.energyReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ meterId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('should filter by source', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/readings?source=MANUAL');

    expect(prisma.energyReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ source: 'MANUAL' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyReading.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/readings');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/readings', () => {
  const validBody = {
    meterId: '00000000-0000-0000-0000-000000000001',
    value: 1500.5,
    readingDate: '2025-01-15',
    source: 'MANUAL',
  };

  it('should create a reading', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({ id: 'meter-1' });
    (prisma.energyReading.create as jest.Mock).mockResolvedValue({ id: 'new-id', ...validBody });

    const res = await request(app).post('/api/readings').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject if meter not found', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post('/api/readings').send({
      ...validBody,
      meterId: '00000000-0000-0000-0000-000000000099',
    });

    expect(res.status).toBe(400);
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/readings').send({ value: -1 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/readings/:id', () => {
  it('should return a reading', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({ id: '1', value: 100 });

    const res = await request(app).get('/api/readings/1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/readings/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/readings/:id', () => {
  it('should update a reading', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
    (prisma.energyReading.update as jest.Mock).mockResolvedValue({ id: '1', value: 200 });

    const res = await request(app).put('/api/readings/1').send({ value: 200 });

    expect(res.status).toBe(200);
    expect(res.body.data.value).toBe(200);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/readings/nonexistent').send({ value: 200 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/readings/:id', () => {
  it('should soft delete a reading', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
    (prisma.energyReading.update as jest.Mock).mockResolvedValue({ id: '1', deletedAt: new Date() });

    const res = await request(app).delete('/api/readings/1');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyReading.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/readings/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/readings/summary', () => {
  it('should return consumption summary', async () => {
    (prisma.energyReading.aggregate as jest.Mock).mockResolvedValue({
      _sum: { value: 50000, cost: 12000 },
      _avg: { value: 500 },
      _count: 100,
      _min: { readingDate: new Date('2025-01-01') },
      _max: { readingDate: new Date('2025-12-31') },
    });

    const res = await request(app).get('/api/readings/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalConsumption).toBe(50000);
    expect(res.body.data.totalCost).toBe(12000);
    expect(res.body.data.averageConsumption).toBe(500);
    expect(res.body.data.readingCount).toBe(100);
  });

  it('should handle null aggregation results', async () => {
    (prisma.energyReading.aggregate as jest.Mock).mockResolvedValue({
      _sum: { value: null, cost: null },
      _avg: { value: null },
      _count: 0,
      _min: { readingDate: null },
      _max: { readingDate: null },
    });

    const res = await request(app).get('/api/readings/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.totalConsumption).toBe(0);
    expect(res.body.data.totalCost).toBe(0);
  });
});
