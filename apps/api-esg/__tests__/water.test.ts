import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgWater: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import waterRouter from '../src/routes/water';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/water', waterRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockWater = {
  id: 'wat-1',
  usageType: 'INTAKE',
  source: 'Municipal Supply',
  quantity: 10000,
  unit: 'liters',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-01-31'),
  facility: 'HQ',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/water', () => {
  it('should return paginated water records', async () => {
    (prisma.esgWater.findMany as jest.Mock).mockResolvedValue([mockWater]);
    (prisma.esgWater.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/water');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by usageType', async () => {
    (prisma.esgWater.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgWater.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/water?usageType=INTAKE');
    expect(prisma.esgWater.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ usageType: 'INTAKE' }) })
    );
  });

  it('should handle pagination', async () => {
    (prisma.esgWater.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgWater.count as jest.Mock).mockResolvedValue(30);

    await request(app).get('/api/water?page=2&limit=10');
    expect(prisma.esgWater.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgWater.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgWater.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/water');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/water', () => {
  it('should create a water record', async () => {
    (prisma.esgWater.create as jest.Mock).mockResolvedValue(mockWater);

    const res = await request(app).post('/api/water').send({
      usageType: 'INTAKE',
      quantity: 10000,
      unit: 'liters',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing fields', async () => {
    const res = await request(app).post('/api/water').send({
      usageType: 'INTAKE',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid usageType', async () => {
    const res = await request(app).post('/api/water').send({
      usageType: 'INVALID',
      quantity: 100,
      unit: 'liters',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/water/:id', () => {
  it('should return a single water record', async () => {
    (prisma.esgWater.findFirst as jest.Mock).mockResolvedValue(mockWater);

    const res = await request(app).get('/api/water/wat-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('wat-1');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgWater.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/water/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/water/:id', () => {
  it('should update a water record', async () => {
    (prisma.esgWater.findFirst as jest.Mock).mockResolvedValue(mockWater);
    (prisma.esgWater.update as jest.Mock).mockResolvedValue({ ...mockWater, quantity: 12000 });

    const res = await request(app).put('/api/water/wat-1').send({ quantity: 12000 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgWater.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/water/nonexistent').send({ quantity: 12000 });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app).put('/api/water/wat-1').send({ usageType: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/water/:id', () => {
  it('should soft delete a water record', async () => {
    (prisma.esgWater.findFirst as jest.Mock).mockResolvedValue(mockWater);
    (prisma.esgWater.update as jest.Mock).mockResolvedValue({ ...mockWater, deletedAt: new Date() });

    const res = await request(app).delete('/api/water/wat-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgWater.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/water/nonexistent');
    expect(res.status).toBe(404);
  });
});
