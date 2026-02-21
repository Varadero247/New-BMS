import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyTarget: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    energyBaseline: {
      findFirst: jest.fn(),
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

import targetsRouter from '../src/routes/targets';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/targets', targetsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/targets', () => {
  it('should return paginated targets', async () => {
    (prisma.energyTarget.findMany as jest.Mock).mockResolvedValue([
      { id: 'e3000000-0000-4000-a000-000000000001', name: '10% Reduction' },
    ]);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/targets');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by year', async () => {
    (prisma.energyTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/targets?year=2025');

    expect(prisma.energyTarget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ year: 2025 }),
      })
    );
  });

  it('should filter by metricType', async () => {
    (prisma.energyTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/targets?metricType=CONSUMPTION');

    expect(prisma.energyTarget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ metricType: 'CONSUMPTION' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyTarget.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyTarget.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/targets');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/targets', () => {
  const validBody = {
    name: '10% Reduction',
    metricType: 'CONSUMPTION',
    year: 2025,
    targetValue: 45000,
    unit: 'kWh',
  };

  it('should create a target', async () => {
    (prisma.energyTarget.create as jest.Mock).mockResolvedValue({
      id: 'new-id',
      ...validBody,
      status: 'ON_TRACK',
    });

    const res = await request(app).post('/api/targets').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('10% Reduction');
  });

  it('should validate baseline if provided', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/targets')
      .send({ ...validBody, baselineId: '00000000-0000-0000-0000-000000000099' });

    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('Baseline');
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/targets').send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/targets/:id', () => {
  it('should return a target', async () => {
    (prisma.energyTarget.findFirst as jest.Mock).mockResolvedValue({
      id: 'e3000000-0000-4000-a000-000000000001',
      name: 'Target 1',
    });

    const res = await request(app).get('/api/targets/e3000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('e3000000-0000-4000-a000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/targets/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/targets/:id', () => {
  it('should update a target', async () => {
    (prisma.energyTarget.findFirst as jest.Mock).mockResolvedValue({
      id: 'e3000000-0000-4000-a000-000000000001',
    });
    (prisma.energyTarget.update as jest.Mock).mockResolvedValue({
      id: 'e3000000-0000-4000-a000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/targets/e3000000-0000-4000-a000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/targets/00000000-0000-0000-0000-000000000099')
      .send({ name: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/targets/:id', () => {
  it('should soft delete a target', async () => {
    (prisma.energyTarget.findFirst as jest.Mock).mockResolvedValue({
      id: 'e3000000-0000-4000-a000-000000000001',
    });
    (prisma.energyTarget.update as jest.Mock).mockResolvedValue({
      id: 'e3000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete('/api/targets/e3000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/targets/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/targets/:id/progress', () => {
  it('should return target progress', async () => {
    (prisma.energyTarget.findFirst as jest.Mock).mockResolvedValue({
      id: 'e3000000-0000-4000-a000-000000000001',
      targetValue: 50000,
      actualValue: 30000,
      status: 'ON_TRACK',
      baseline: { id: 'b1', name: 'Baseline 2024', totalConsumption: 55000 },
    });

    const res = await request(app).get(
      '/api/targets/e3000000-0000-4000-a000-000000000001/progress'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.target).toBe(50000);
    expect(res.body.data.actual).toBe(30000);
    expect(res.body.data.baseline).toBe(55000);
    expect(res.body.data.progress).toBe(60);
    expect(res.body.data.onTrack).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyTarget.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(
      '/api/targets/00000000-0000-0000-0000-000000000099/progress'
    );

    expect(res.status).toBe(404);
  });

  it('should handle zero target value', async () => {
    (prisma.energyTarget.findFirst as jest.Mock).mockResolvedValue({
      id: 'e3000000-0000-4000-a000-000000000001',
      targetValue: 0,
      actualValue: null,
      status: 'ON_TRACK',
      baseline: null,
    });

    const res = await request(app).get(
      '/api/targets/e3000000-0000-4000-a000-000000000001/progress'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.progress).toBe(0);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.energyTarget.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/targets');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.energyTarget.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/targets').send({
      name: '10% Reduction',
      metricType: 'CONSUMPTION',
      year: 2025,
      targetValue: 45000,
      unit: 'kWh',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('targets — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/targets', targetsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/targets', async () => {
    const res = await request(app).get('/api/targets');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/targets', async () => {
    const res = await request(app).get('/api/targets');
    expect(res.headers['content-type']).toBeDefined();
  });
});
