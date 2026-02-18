import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsFoodDefense: {
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

import foodDefenseRouter from '../src/routes/food-defense';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/food-defense', foodDefenseRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/food-defense', () => {
  it('should return food defense records with pagination', async () => {
    (prisma as any).fsFoodDefense.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', title: 'Threat Assessment' }]);
    (prisma as any).fsFoodDefense.count.mockResolvedValue(1);

    const res = await request(app).get('/api/food-defense');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by threatType', async () => {
    (prisma as any).fsFoodDefense.findMany.mockResolvedValue([]);
    (prisma as any).fsFoodDefense.count.mockResolvedValue(0);

    await request(app).get('/api/food-defense?threatType=SABOTAGE');
    expect((prisma as any).fsFoodDefense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ threatType: 'SABOTAGE' }) })
    );
  });

  it('should filter by status', async () => {
    (prisma as any).fsFoodDefense.findMany.mockResolvedValue([]);
    (prisma as any).fsFoodDefense.count.mockResolvedValue(0);

    await request(app).get('/api/food-defense?status=IDENTIFIED');
    expect((prisma as any).fsFoodDefense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'IDENTIFIED' }) })
    );
  });

  it('should filter by riskLevel', async () => {
    (prisma as any).fsFoodDefense.findMany.mockResolvedValue([]);
    (prisma as any).fsFoodDefense.count.mockResolvedValue(0);

    await request(app).get('/api/food-defense?riskLevel=HIGH');
    expect((prisma as any).fsFoodDefense.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ riskLevel: 'HIGH' }) })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsFoodDefense.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/food-defense');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/food-defense', () => {
  it('should create a food defense record', async () => {
    const created = { id: '00000000-0000-0000-0000-000000000001', title: 'Threat Assessment', threatType: 'SABOTAGE', riskLevel: 'HIGH' };
    (prisma as any).fsFoodDefense.create.mockResolvedValue(created);

    const res = await request(app).post('/api/food-defense').send({
      title: 'Threat Assessment', threatType: 'SABOTAGE', riskLevel: 'HIGH',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/food-defense').send({ title: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should reject invalid threat type', async () => {
    const res = await request(app).post('/api/food-defense').send({
      title: 'Test', threatType: 'INVALID', riskLevel: 'HIGH',
    });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsFoodDefense.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/food-defense').send({
      title: 'Threat Assessment', threatType: 'SABOTAGE', riskLevel: 'HIGH',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/food-defense/:id', () => {
  it('should return a food defense record', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Threat' });

    const res = await request(app).get('/api/food-defense/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/food-defense/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/food-defense/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/food-defense/:id', () => {
  it('should update a food defense record', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsFoodDefense.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'MITIGATED' });

    const res = await request(app).put('/api/food-defense/00000000-0000-0000-0000-000000000001').send({ status: 'MITIGATED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/food-defense/00000000-0000-0000-0000-000000000099').send({ status: 'MITIGATED' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app).put('/api/food-defense/00000000-0000-0000-0000-000000000001').send({ threatType: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsFoodDefense.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/food-defense/00000000-0000-0000-0000-000000000001').send({ status: 'MITIGATED' });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/food-defense/:id', () => {
  it('should soft delete a food defense record', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsFoodDefense.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app).delete('/api/food-defense/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/food-defense/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsFoodDefense.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsFoodDefense.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/food-defense/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });
});
