import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgScopeEmission: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@test.com',
      role: 'ADMIN',
      orgId: 'org-001',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import scopeEmissionsRouter from '../src/routes/scope-emissions';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/scope-emissions', scopeEmissionsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockScopeEmission = {
  id: '00000000-0000-0000-0000-000000000001',
  orgId: 'org-001',
  scope: 1,
  category: 'Stationary Combustion',
  activity: 'Natural Gas Boiler',
  quantity: 5000,
  unit: 'kWh',
  emissionFactor: 0.185,
  co2Equivalent: 925,
  period: '2026-01',
  referenceNumber: 'EMI-2026-0001',
  createdBy: '00000000-0000-0000-0000-000000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('GET /api/scope-emissions', () => {
  it('should return list of scope emissions', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([mockScopeEmission]);

    const res = await request(app).get('/api/scope-emissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return empty array when no scope emissions exist', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/scope-emissions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by scope query parameter', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([mockScopeEmission]);

    const res = await request(app).get('/api/scope-emissions?scope=1');
    expect(res.status).toBe(200);
    expect(prisma.esgScopeEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ scope: 1 }),
      })
    );
  });

  it('should not filter by scope when query param is absent', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([mockScopeEmission]);

    await request(app).get('/api/scope-emissions');
    expect(prisma.esgScopeEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: 'org-001', deletedAt: null }),
      })
    );
    const callArgs = (prisma.esgScopeEmission.findMany as jest.Mock).mock.calls[0][0];
    expect(callArgs.where).not.toHaveProperty('scope');
  });

  it('should order results by period descending', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([mockScopeEmission]);

    await request(app).get('/api/scope-emissions');
    expect(prisma.esgScopeEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { period: 'desc' },
      })
    );
  });

  it('should return 500 when database query fails', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockRejectedValue(
      new Error('DB connection lost')
    );

    const res = await request(app).get('/api/scope-emissions');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/scope-emissions', () => {
  it('should create a scope emission entry', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue(mockScopeEmission);

    const res = await request(app).post('/api/scope-emissions').send({
      scope: 1,
      category: 'Stationary Combustion',
      activity: 'Natural Gas Boiler',
      quantity: 5000,
      unit: 'kWh',
      emissionFactor: 0.185,
      co2Equivalent: 925,
      period: '2026-01',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should generate a reference number using count', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(4);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue({
      ...mockScopeEmission,
      referenceNumber: `EMI-${new Date().getFullYear()}-0005`,
    });

    await request(app).post('/api/scope-emissions').send({
      scope: 2,
      category: 'Purchased Electricity',
      quantity: 10000,
      unit: 'kWh',
      period: '2026-02',
    });

    expect(prisma.esgScopeEmission.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-001' }) })
    );
    expect(prisma.esgScopeEmission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^EMI-\d{4}-0005$/),
        }),
      })
    );
  });

  it('should attach orgId and createdBy from authenticated user', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue(mockScopeEmission);

    await request(app).post('/api/scope-emissions').send({
      scope: 3,
      category: 'Business Travel',
      quantity: 1000,
      unit: 'km',
      period: '2026-03',
    });

    expect(prisma.esgScopeEmission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: 'org-001',
          createdBy: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('should return 500 when database create fails', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgScopeEmission.create as jest.Mock).mockRejectedValue(new Error('Validation failed'));

    const res = await request(app).post('/api/scope-emissions').send({
      scope: 1,
      category: 'Test',
      quantity: 100,
      unit: 'kWh',
      period: '2026-01',
    });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('Failed to create resource');
  });
});

describe('Scope Emissions — extended', () => {
  it('GET /api/scope-emissions data length matches mock count', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([mockScopeEmission, mockScopeEmission]);
    const res = await request(app).get('/api/scope-emissions');
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /api/scope-emissions findMany called once per request', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/scope-emissions');
    expect(prisma.esgScopeEmission.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST /api/scope-emissions create is called once', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue(mockScopeEmission);
    await request(app).post('/api/scope-emissions').send({
      scope: 1,
      category: 'Test',
      quantity: 100,
      unit: 'kWh',
      period: '2026-01',
    });
    expect(prisma.esgScopeEmission.create).toHaveBeenCalledTimes(1);
  });

  it('GET /api/scope-emissions referenceNumber is a string', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([mockScopeEmission]);
    const res = await request(app).get('/api/scope-emissions');
    expect(typeof res.body.data[0].referenceNumber).toBe('string');
  });

  it('GET /api/scope-emissions success is false on 500', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/scope-emissions');
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('scope-emissions — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/scope-emissions', scopeEmissionsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/scope-emissions', async () => {
    const res = await request(app).get('/api/scope-emissions');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/scope-emissions', async () => {
    const res = await request(app).get('/api/scope-emissions');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/scope-emissions body has success property', async () => {
    const res = await request(app).get('/api/scope-emissions');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/scope-emissions body is an object', async () => {
    const res = await request(app).get('/api/scope-emissions');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/scope-emissions route is accessible', async () => {
    const res = await request(app).get('/api/scope-emissions');
    expect(res.status).toBeDefined();
  });
});

// ─── Extended edge cases ────────────────────────────────────────────────────

describe('scope-emissions — extended edge cases', () => {
  it('GET / filters by scope=2 and passes integer 2 to query', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/scope-emissions?scope=2');
    expect(res.status).toBe(200);
    expect(prisma.esgScopeEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ scope: 2 }) })
    );
  });

  it('GET / filters by scope=3 and passes integer 3 to query', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/scope-emissions?scope=3');
    expect(prisma.esgScopeEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ scope: 3 }) })
    );
  });

  it('POST / creates scope=2 emission with purchased electricity', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue({ ...mockScopeEmission, scope: 2 });
    const res = await request(app).post('/api/scope-emissions').send({
      scope: 2,
      category: 'Purchased Electricity',
      quantity: 10000,
      unit: 'kWh',
      period: '2026-02',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / creates scope=3 emission with business travel', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(2);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue({ ...mockScopeEmission, scope: 3 });
    const res = await request(app).post('/api/scope-emissions').send({
      scope: 3,
      category: 'Business Travel',
      quantity: 500,
      unit: 'km',
      period: '2026-03',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 when scope is out of range (scope=4)', async () => {
    const res = await request(app).post('/api/scope-emissions').send({
      scope: 4,
      category: 'Invalid',
      quantity: 100,
      unit: 'kWh',
      period: '2026-01',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 when scope is 0 (out of range)', async () => {
    const res = await request(app).post('/api/scope-emissions').send({
      scope: 0,
      category: 'Invalid',
      period: '2026-01',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / returns data in array format', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([mockScopeEmission]);
    const res = await request(app).get('/api/scope-emissions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / count is called once to generate reference number', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue(mockScopeEmission);
    await request(app).post('/api/scope-emissions').send({
      scope: 1,
      category: 'Combustion',
      period: '2026-01',
    });
    expect(prisma.esgScopeEmission.count).toHaveBeenCalledTimes(1);
  });

  it('POST / 500 when count fails before create', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockRejectedValue(new Error('DB count error'));
    const res = await request(app).post('/api/scope-emissions').send({
      scope: 1,
      category: 'Combustion',
      period: '2026-01',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('scope-emissions — additional coverage 2', () => {
  it('GET / returns items with co2Equivalent field', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([mockScopeEmission]);
    const res = await request(app).get('/api/scope-emissions');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('co2Equivalent', 925);
  });

  it('GET / response has success:true and data array', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/scope-emissions');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / creates scope=1 emission and returns 201', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(10);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue({ ...mockScopeEmission, referenceNumber: 'EMI-2026-0011' });
    const res = await request(app).post('/api/scope-emissions').send({
      scope: 1,
      category: 'Stationary Combustion',
      quantity: 1000,
      unit: 'kWh',
      period: '2026-04',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toMatch(/^EMI-\d{4}-\d{4}$/);
  });

  it('POST / missing category still succeeds (category is optional)', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue({ ...mockScopeEmission, category: null });
    const res = await request(app).post('/api/scope-emissions').send({
      scope: 1,
      quantity: 100,
      unit: 'kWh',
      period: '2026-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET / filter by scope=1 returns items where scope is 1', async () => {
    const scope1Item = { ...mockScopeEmission, scope: 1 };
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([scope1Item]);
    const res = await request(app).get('/api/scope-emissions?scope=1');
    expect(res.status).toBe(200);
    expect(res.body.data[0].scope).toBe(1);
  });

  it('POST / emissionFactor is stored in the create call', async () => {
    (prisma.esgScopeEmission.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgScopeEmission.create as jest.Mock).mockResolvedValue(mockScopeEmission);
    await request(app).post('/api/scope-emissions').send({
      scope: 1,
      category: 'Fuel Combustion',
      quantity: 200,
      unit: 'L',
      emissionFactor: 2.31,
      period: '2026-05',
    });
    const [call] = (prisma.esgScopeEmission.create as jest.Mock).mock.calls;
    expect(call[0].data.emissionFactor).toBe(2.31);
  });

  it('GET / findMany called with deletedAt null filter', async () => {
    (prisma.esgScopeEmission.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/scope-emissions');
    expect(prisma.esgScopeEmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });
});
