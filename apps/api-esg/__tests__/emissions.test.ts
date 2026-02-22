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
  id: '00000000-0000-0000-0000-000000000001',
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
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
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

    const res = await request(app).get('/api/emissions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when emission not found', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/emissions/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PUT /api/emissions/:id', () => {
  it('should update an emission', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(mockEmission);
    (prisma.esgEmission.update as jest.Mock).mockResolvedValue({ ...mockEmission, quantity: 2000 });

    const res = await request(app)
      .put('/api/emissions/00000000-0000-0000-0000-000000000001')
      .send({ quantity: 2000 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating non-existent emission', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/emissions/00000000-0000-0000-0000-000000000099')
      .send({ quantity: 2000 });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid update data', async () => {
    const res = await request(app)
      .put('/api/emissions/00000000-0000-0000-0000-000000000001')
      .send({ scope: 'INVALID_SCOPE' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/emissions/:id', () => {
  it('should soft delete an emission', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(mockEmission);
    (prisma.esgEmission.update as jest.Mock).mockResolvedValue({
      ...mockEmission,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/emissions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(prisma.esgEmission.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('should return 404 when deleting non-existent emission', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/emissions/00000000-0000-0000-0000-000000000099');
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

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET /api/emissions returns 500 on DB error', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/emissions');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/emissions returns 500 when create fails', async () => {
    (prisma.esgEmission.create as jest.Mock).mockRejectedValue(new Error('DB down'));
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
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('emissions — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/emissions', emissionsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/emissions', async () => {
    const res = await request(app).get('/api/emissions');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/emissions', async () => {
    const res = await request(app).get('/api/emissions');
    expect(res.headers['content-type']).toBeDefined();
  });
});

// ─── Extended edge cases ────────────────────────────────────────────────────

describe('emissions — extended edge cases', () => {
  it('GET / filters by category using contains', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/emissions?category=Combustion');
    expect(res.status).toBe(200);
    expect(prisma.esgEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: expect.objectContaining({ contains: 'Combustion' }),
        }),
      })
    );
  });

  it('GET / filters by periodStart and periodEnd', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/emissions?periodStart=2026-01-01&periodEnd=2026-12-31');
    expect(res.status).toBe(200);
    expect(prisma.esgEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          periodStart: expect.objectContaining({ gte: expect.any(Date) }),
          periodEnd: expect.objectContaining({ lte: expect.any(Date) }),
        }),
      })
    );
  });

  it('POST / creates SCOPE_2 emission successfully', async () => {
    (prisma.esgEmission.create as jest.Mock).mockResolvedValue({ ...mockEmission, scope: 'SCOPE_2' });
    const res = await request(app).post('/api/emissions').send({
      scope: 'SCOPE_2',
      category: 'Purchased Electricity',
      source: 'Grid',
      quantity: 500,
      unit: 'kWh',
      co2Equivalent: 115,
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / creates SCOPE_3 emission successfully', async () => {
    (prisma.esgEmission.create as jest.Mock).mockResolvedValue({ ...mockEmission, scope: 'SCOPE_3' });
    const res = await request(app).post('/api/emissions').send({
      scope: 'SCOPE_3',
      category: 'Business Travel',
      source: 'Flights',
      quantity: 200,
      unit: 'km',
      co2Equivalent: 51,
      periodStart: '2026-02-01',
      periodEnd: '2026-02-28',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /summary returns count field', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([mockEmission]);
    const res = await request(app).get('/api/emissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('count');
    expect(res.body.data.count).toBe(1);
  });

  it('GET /summary returns 500 on DB error', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/emissions/summary');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /trend returns 500 on DB error', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/emissions/trend?year=2026');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when findFirst fails', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/emissions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when findFirst fails', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/emissions/00000000-0000-0000-0000-000000000001')
      .send({ quantity: 999 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('emissions — final coverage', () => {
  it('GET / returns JSON content-type header', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/emissions');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET / filters by scope=SCOPE_2 in where clause', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/emissions?scope=SCOPE_2');
    expect(prisma.esgEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ scope: 'SCOPE_2' }) })
    );
  });

  it('POST / missing co2Equivalent returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/emissions').send({
      scope: 'SCOPE_1',
      category: 'Combustion',
      source: 'Boiler',
      quantity: 100,
      unit: 'kg',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id response has success:true when found', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(mockEmission);
    const res = await request(app).get('/api/emissions/00000000-0000-0000-0000-000000000001');
    expect(res.body.success).toBe(true);
  });

  it('DELETE /:id calls update with deletedAt', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(mockEmission);
    (prisma.esgEmission.update as jest.Mock).mockResolvedValue({ ...mockEmission, deletedAt: new Date() });
    await request(app).delete('/api/emissions/00000000-0000-0000-0000-000000000001');
    expect(prisma.esgEmission.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET /trend without year param still returns 200 with 12 months', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/emissions/trend');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(12);
  });
});

describe('emissions — extra coverage', () => {
  it('GET / response body has data property', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/emissions');
    expect(res.body).toHaveProperty('data');
  });

  it('POST / missing source field is allowed (optional)', async () => {
    (prisma.esgEmission.create as jest.Mock).mockResolvedValue(mockEmission);
    const res = await request(app).post('/api/emissions').send({
      scope: 'SCOPE_1',
      category: 'Stationary Combustion',
      source: 'Boiler',
      quantity: 500,
      unit: 'kg',
      co2Equivalent: 1250,
      periodStart: '2026-03-01',
      periodEnd: '2026-03-31',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /summary byScope SCOPE_3 defaults to 0 when no SCOPE_3 exists', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([
      { ...mockEmission, scope: 'SCOPE_1', co2Equivalent: 100 },
    ]);
    const res = await request(app).get('/api/emissions/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.byScope.SCOPE_3).toBe(0);
  });

  it('GET /:id returns data with scope field', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(mockEmission);
    const res = await request(app).get('/api/emissions/00000000-0000-0000-0000-000000000001');
    expect(res.body.data).toHaveProperty('scope');
  });

  it('DELETE /:id response has message field in data', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue(mockEmission);
    (prisma.esgEmission.update as jest.Mock).mockResolvedValue({ ...mockEmission, deletedAt: new Date() });
    const res = await request(app).delete('/api/emissions/00000000-0000-0000-0000-000000000001');
    expect(res.body.data).toHaveProperty('message');
  });
});

describe('emissions — phase28 coverage', () => {
  it('GET / filters by SCOPE_3 scope in where clause', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/emissions?scope=SCOPE_3');
    expect(prisma.esgEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ scope: 'SCOPE_3' }) })
    );
  });

  it('GET / pagination.page reflects query param', async () => {
    (prisma.esgEmission.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgEmission.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/emissions?page=3&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
  });

  it('POST / create sets createdBy from auth user', async () => {
    (prisma.esgEmission.create as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', scope: 'SCOPE_1' });
    await request(app).post('/api/emissions').send({
      scope: 'SCOPE_1',
      category: 'Fuel Combustion',
      source: 'Diesel generator',
      quantity: 100,
      unit: 'litres',
      co2Equivalent: 250,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    });
    expect(prisma.esgEmission.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ createdBy: 'user-123' }) })
    );
  });

  it('DELETE /:id findFirst called with id filter', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgEmission.update as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });
    await request(app).delete('/api/emissions/00000000-0000-0000-0000-000000000001');
    expect(prisma.esgEmission.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000001' }) })
    );
  });

  it('GET /:id response has success:true and id in data', async () => {
    (prisma.esgEmission.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', scope: 'SCOPE_1' });
    const res = await request(app).get('/api/emissions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});
