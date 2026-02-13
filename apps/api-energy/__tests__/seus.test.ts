import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energySeu: {
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

import seusRouter from '../src/routes/seus';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/seus', seusRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/seus', () => {
  it('should return paginated SEUs', async () => {
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([{ id: '1', name: 'HVAC System' }]);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/seus');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by priority', async () => {
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/seus?priority=HIGH');

    expect(prisma.energySeu.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ priority: 'HIGH' }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/seus?status=IDENTIFIED');

    expect(prisma.energySeu.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'IDENTIFIED' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energySeu.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energySeu.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/seus');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/seus', () => {
  const validBody = {
    name: 'HVAC System',
    consumptionPercentage: 35,
    annualConsumption: 175000,
    unit: 'kWh',
    facility: 'Building A',
    priority: 'HIGH',
  };

  it('should create a SEU', async () => {
    (prisma.energySeu.create as jest.Mock).mockResolvedValue({ id: 'new-id', ...validBody, status: 'IDENTIFIED' });

    const res = await request(app).post('/api/seus').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('HVAC System');
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/seus').send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/seus/:id', () => {
  it('should return a SEU', async () => {
    (prisma.energySeu.findFirst as jest.Mock).mockResolvedValue({ id: '1', name: 'HVAC' });

    const res = await request(app).get('/api/seus/1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if not found', async () => {
    (prisma.energySeu.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/seus/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/seus/:id', () => {
  it('should update a SEU', async () => {
    (prisma.energySeu.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
    (prisma.energySeu.update as jest.Mock).mockResolvedValue({ id: '1', name: 'Updated HVAC' });

    const res = await request(app).put('/api/seus/1').send({ name: 'Updated HVAC' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated HVAC');
  });

  it('should return 404 if not found', async () => {
    (prisma.energySeu.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/seus/nonexistent').send({ name: 'X' });

    expect(res.status).toBe(404);
  });

  it('should handle Decimal conversion for annualConsumption', async () => {
    (prisma.energySeu.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
    (prisma.energySeu.update as jest.Mock).mockResolvedValue({ id: '1', annualConsumption: 200000 });

    const res = await request(app).put('/api/seus/1').send({ annualConsumption: 200000 });

    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/seus/:id', () => {
  it('should soft delete a SEU', async () => {
    (prisma.energySeu.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
    (prisma.energySeu.update as jest.Mock).mockResolvedValue({ id: '1', deletedAt: new Date() });

    const res = await request(app).delete('/api/seus/1');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energySeu.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/seus/nonexistent');

    expect(res.status).toBe(404);
  });
});
