import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyEnpi: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    energyEnpiData: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import enpisRouter from '../src/routes/enpis';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/enpis', enpisRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/enpis', () => {
  it('should return paginated EnPIs', async () => {
    (prisma.energyEnpi.findMany as jest.Mock).mockResolvedValue([
      { id: 'e2000000-0000-4000-a000-000000000001', name: 'kWh/m2' },
    ]);
    (prisma.energyEnpi.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/enpis');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by frequency', async () => {
    (prisma.energyEnpi.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyEnpi.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/enpis?frequency=MONTHLY');

    expect(prisma.energyEnpi.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ frequency: 'MONTHLY' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyEnpi.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyEnpi.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/enpis');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/enpis', () => {
  const validBody = {
    name: 'Energy Intensity',
    formula: 'total_consumption / floor_area',
    unit: 'kWh/m2',
    frequency: 'MONTHLY',
  };

  it('should create an EnPI', async () => {
    (prisma.energyEnpi.create as jest.Mock).mockResolvedValue({ id: 'new-id', ...validBody });

    const res = await request(app).post('/api/enpis').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Energy Intensity');
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/enpis').send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/enpis/:id', () => {
  it('should return an EnPI', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
      name: 'EnPI 1',
    });

    const res = await request(app).get('/api/enpis/e2000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('e2000000-0000-4000-a000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/enpis/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/enpis/:id', () => {
  it('should update an EnPI', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
    });
    (prisma.energyEnpi.update as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/enpis/e2000000-0000-4000-a000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/enpis/00000000-0000-0000-0000-000000000099')
      .send({ name: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/enpis/:id', () => {
  it('should soft delete an EnPI', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
    });
    (prisma.energyEnpi.update as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete('/api/enpis/e2000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/enpis/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/enpis/:id/data-points', () => {
  const validBody = {
    value: 125.5,
    periodStart: '2025-01-01',
    periodEnd: '2025-01-31',
  };

  it('should add a data point', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
    });
    (prisma.energyEnpiData.create as jest.Mock).mockResolvedValue({
      id: 'e2100000-0000-4000-a000-000000000001',
      ...validBody,
      enpiId: 'e2000000-0000-4000-a000-000000000001',
    });
    (prisma.energyEnpi.update as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
      currentValue: 125.5,
    });

    const res = await request(app)
      .post('/api/enpis/e2000000-0000-4000-a000-000000000001/data-points')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if EnPI not found', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/enpis/00000000-0000-0000-0000-000000000099/data-points')
      .send(validBody);

    expect(res.status).toBe(404);
  });

  it('should reject invalid body', async () => {
    const res = await request(app)
      .post('/api/enpis/e2000000-0000-4000-a000-000000000001/data-points')
      .send({ value: 'not-a-number' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/enpis/:id/data-points', () => {
  it('should return data points', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
    });
    (prisma.energyEnpiData.findMany as jest.Mock).mockResolvedValue([
      { id: 'e2100000-0000-4000-a000-000000000001', value: 100 },
    ]);
    (prisma.energyEnpiData.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get(
      '/api/enpis/e2000000-0000-4000-a000-000000000001/data-points'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 if EnPI not found', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(
      '/api/enpis/00000000-0000-0000-0000-000000000099/data-points'
    );

    expect(res.status).toBe(404);
  });
});

describe('GET /api/enpis/:id/trend', () => {
  it('should return trend data', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
      name: 'Intensity',
      unit: 'kWh/m2',
      baselineValue: 150,
      currentValue: 120,
      targetValue: 100,
    });
    (prisma.energyEnpiData.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'e2000000-0000-4000-a000-000000000001',
        value: 130,
        periodStart: new Date('2025-01-01'),
        periodEnd: new Date('2025-01-31'),
      },
      {
        id: 'e2000000-0000-4000-a000-000000000002',
        value: 120,
        periodStart: new Date('2025-02-01'),
        periodEnd: new Date('2025-02-28'),
      },
    ]);

    const res = await request(app).get('/api/enpis/e2000000-0000-4000-a000-000000000001/trend');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Intensity');
    expect(res.body.data.statistics.count).toBe(2);
    expect(res.body.data.dataPoints).toHaveLength(2);
  });

  it('should return 404 if EnPI not found', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/enpis/00000000-0000-0000-0000-000000000099/trend');

    expect(res.status).toBe(404);
  });

  it('should handle empty data points', async () => {
    (prisma.energyEnpi.findFirst as jest.Mock).mockResolvedValue({
      id: 'e2000000-0000-4000-a000-000000000001',
      name: 'Intensity',
      unit: 'kWh/m2',
      baselineValue: null,
      currentValue: null,
      targetValue: null,
    });
    (prisma.energyEnpiData.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/enpis/e2000000-0000-4000-a000-000000000001/trend');

    expect(res.status).toBe(200);
    expect(res.body.data.trend).toBe('STABLE');
    expect(res.body.data.statistics.count).toBe(0);
  });
});
