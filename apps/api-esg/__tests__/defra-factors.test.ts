import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgDefraFactor: {
      findMany: jest.fn(),
      create: jest.fn(),
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

import defraFactorsRouter from '../src/routes/defra-factors';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/defra-factors', defraFactorsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockDefraFactor = {
  id: '00000000-0000-0000-0000-000000000001',
  orgId: 'org-001',
  category: 'Electricity',
  subCategory: 'UK Grid',
  factor: 0.233,
  unit: 'kgCO2e/kWh',
  year: 2026,
  source: 'DEFRA 2026',
  createdBy: '00000000-0000-0000-0000-000000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('GET /api/defra-factors', () => {
  it('should return list of DEFRA factors', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([mockDefraFactor]);

    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return empty array when no DEFRA factors exist', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by orgId from authenticated user', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([mockDefraFactor]);

    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(prisma.esgDefraFactor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: 'org-001', deletedAt: null }),
      })
    );
  });

  it('should return 500 when database query fails', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/defra-factors', () => {
  it('should create a DEFRA factor entry', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(mockDefraFactor);

    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      subcategory: 'UK Grid',
      activity: 'Grid electricity consumption',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
      year: 2026,
      source: 'DEFRA 2026',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should attach orgId and createdBy from authenticated user', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(mockDefraFactor);

    await request(app).post('/api/defra-factors').send({
      category: 'Fuel',
      activity: 'Diesel combustion',
      factor: 2.5,
      unit: 'kgCO2e/litre',
      year: 2026,
      source: 'DEFRA 2026',
    });

    expect(prisma.esgDefraFactor.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: 'org-001',
          createdBy: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('should return 500 when database create fails', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockRejectedValue(
      new Error('Unique constraint violation')
    );

    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      activity: 'Grid electricity consumption',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
      year: 2026,
    });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/defra-factors — extended', () => {
  it('data is an array', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('findMany is called once per request', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/defra-factors');
    expect(prisma.esgDefraFactor.findMany).toHaveBeenCalledTimes(1);
  });

  it('returned factors have category and factor fields', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([mockDefraFactor]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('category');
    expect(res.body.data[0]).toHaveProperty('factor');
  });
});

describe('DEFRA Factors — further extended', () => {
  it('factor field is a number', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([mockDefraFactor]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].factor).toBe('number');
  });

  it('POST returns 201 status on success', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(mockDefraFactor);
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Fuel',
      activity: 'Diesel',
      factor: 2.5,
      unit: 'kgCO2e/litre',
      year: 2026,
      source: 'DEFRA 2026',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('create called once per POST request', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(mockDefraFactor);
    await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      activity: 'Grid',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
      year: 2026,
      source: 'DEFRA 2026',
    });
    expect(prisma.esgDefraFactor.create).toHaveBeenCalledTimes(1);
  });

  it('data length matches number of mock results', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([mockDefraFactor, mockDefraFactor]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET success is false on DB rejection', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});


describe('DEFRA Factors — additional coverage', () => {
  it('auth enforcement: authenticate middleware is called on GET', async () => {
    const { authenticate } = require('@ims/auth');
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/defra-factors');
    expect(authenticate).toHaveBeenCalled();
  });


  it('empty list response: GET returns [] and success true when no records exist', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('invalid params (400): POST without required activity field returns VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
      year: 2026,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DB error handling (500): POST create failure returns INTERNAL_ERROR', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockRejectedValue(new Error('Connection refused'));
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Fuel',
      activity: 'Diesel combustion',
      factor: 2.68,
      unit: 'kgCO2e/litre',
      year: 2026,
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('additional positive case: POST creates factor and response data contains id', async () => {
    const factorWithExtras = { ...mockDefraFactor, subcategory: 'Diesel', notes: 'Scope 1' };
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(factorWithExtras);
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Fuel',
      subcategory: 'Diesel',
      activity: 'Diesel combustion',
      factor: 2.68,
      unit: 'kgCO2e/litre',
      year: 2026,
      source: 'DEFRA 2026',
      notes: 'Scope 1',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });
});

// ─── Extended edge cases ────────────────────────────────────────────────────

describe('DEFRA Factors — extended edge cases', () => {
  it('GET / response body has success property', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.body).toHaveProperty('success');
  });

  it('GET / response is JSON content-type', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST / with subcategory field stores it correctly', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue({
      ...mockDefraFactor,
      subcategory: 'UK Grid Average',
    });
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      subcategory: 'UK Grid Average',
      activity: 'Grid electricity',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
      year: 2026,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / without source field still succeeds', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(mockDefraFactor);
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Transport',
      activity: 'Short haul flight',
      factor: 0.255,
      unit: 'kgCO2e/km',
      year: 2026,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / missing factor field returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      activity: 'Grid electricity',
      unit: 'kgCO2e/kWh',
      year: 2026,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / missing unit field returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      activity: 'Grid electricity',
      factor: 0.233,
      year: 2026,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / returns multiple factors when DB has multiple records', async () => {
    const secondFactor = { ...mockDefraFactor, id: '00000000-0000-0000-0000-000000000002', category: 'Transport' };
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([mockDefraFactor, secondFactor]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[1].category).toBe('Transport');
  });

  it('POST / year field must be an integer (string year returns 400)', async () => {
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      activity: 'Grid electricity',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
      year: 'twenty-twenty-six',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / returned data items have id field', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([mockDefraFactor]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
  });
});

describe('DEFRA Factors — final coverage', () => {
  it('GET / response body has data property', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/defra-factors');
    expect(res.body).toHaveProperty('data');
  });

  it('POST / with year as number creates factor', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(mockDefraFactor);
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Waste',
      activity: 'Landfill disposal',
      factor: 0.587,
      unit: 'kgCO2e/tonne',
      year: 2025,
      source: 'DEFRA 2025',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / without year returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      activity: 'Grid electricity',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET / findMany is called with deletedAt: null filter', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/defra-factors');
    expect(prisma.esgDefraFactor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });

  it('POST / returned data contains category', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(mockDefraFactor);
    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      activity: 'Grid',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
      year: 2026,
    });
    expect(res.body.data).toHaveProperty('category');
  });

  it('GET / success:false and error.code set on DB error', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockRejectedValue(new Error('Timeout'));
    const res = await request(app).get('/api/defra-factors');
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
