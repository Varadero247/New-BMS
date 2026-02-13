import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgEmission: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
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

import emissionsRouter from '../src/routes/emissions';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/emissions', emissionsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockEmission = {
  id: 'em-1',
  scope: 'SCOPE_1',
  category: 'Stationary Combustion',
  source: 'Boiler',
  quantity: 1000,
  unit: 'kg',
  co2Equivalent: 2500,
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-01-31'),
  methodology: 'GHG Protocol',
  verifiedBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/emissions', () => {
  it('should return paginated emissions list', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([mockEmission]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/emissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by scope', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/emissions?scope=SCOPE_1');
    expect(res.status).toBe(200);
    expect(prisma.esgEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ scope: 'SCOPE_1' }) })
    );
  });

  it('should handle pagination params', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(50);

    const res = await request(app).get('/api/emissions?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(prisma.esgEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('should return empty data when no emissions exist', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/emissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });
});

describe('POST /api/emissions', () => {
  it('should create an emission entry', async () => {
    (prisma.esgEmission.create as jest.Mock).mockResolvedValue(mockEmission);

    const res = await request(app).post('/api/emissions').send({
      scope: 'SCOPE_1',
      category: 'Stationary Combustion',
      source: 'Boiler',
      quantity: 1000,
      unit: 'kg',
      co2Equivalent: 2500,
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('em-1');
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/emissions').send({
      scope: 'SCOPE_1',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid scope', async () => {
    const res = await request(app).post('/api/emissions').send({
      scope: 'INVALID',
      category: 'Test',
      source: 'Test',
      quantity: 100,
      unit: 'kg',
      co2Equivalent: 200,
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/emissions/:id', () => {
  it('should return a single emission', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(mockEmission);

    const res = await request(app).get('/api/emissions/em-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('em-1');
  });

  it('should return 404 when emission not found', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/emissions/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PUT /api/emissions/:id', () => {
  it('should update an emission', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(mockEmission);
    (prisma.esgEmission.update as jest.Mock).mockResolvedValue({ ...mockEmission, quantity: 2000 });

    const res = await request(app).put('/api/emissions/em-1').send({ quantity: 2000 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating non-existent emission', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/emissions/nonexistent').send({ quantity: 2000 });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid update data', async () => {
    const res = await request(app).put('/api/emissions/em-1').send({ scope: 'INVALID_SCOPE' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/emissions/:id', () => {
  it('should soft delete an emission', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(mockEmission);
    (prisma.esgEmission.update as jest.Mock).mockResolvedValue({ ...mockEmission, deletedAt: new Date() });

    const res = await request(app).delete('/api/emissions/em-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.esgEmission.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('should return 404 when deleting non-existent emission', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/emissions/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/emissions/summary', () => {
  it('should return emissions summary by scope', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([
      { ...mockEmission, scope: 'SCOPE_1', co2Equivalent: 1000 },
      { ...mockEmission, scope: 'SCOPE_2', co2Equivalent: 500 },
      { ...mockEmission, scope: 'SCOPE_3', co2Equivalent: 300 },
    ]);

    const res = await request(app).get('/api/emissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(1800);
    expect(res.body.data.byScope.SCOPE_1).toBe(1000);
    expect(res.body.data.byScope.SCOPE_2).toBe(500);
    expect(res.body.data.byScope.SCOPE_3).toBe(300);
  });
});

describe('GET /api/emissions/trend', () => {
  it('should return monthly emissions trend', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([
      { ...mockEmission, periodStart: new Date('2026-01-15'), co2Equivalent: 1000 },
      { ...mockEmission, periodStart: new Date('2026-02-15'), co2Equivalent: 800 },
    ]);

    const res = await request(app).get('/api/emissions/trend?year=2026');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(12);
    expect(res.body.data[0].month).toBe('2026-01');
  });
});
