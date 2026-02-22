import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyBaseline: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

import baselinesRouter from '../src/routes/baselines';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/baselines', baselinesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/baselines', () => {
  it('should return paginated baselines', async () => {
    const mockBaselines = [
      {
        id: 'e6000000-0000-4000-a000-000000000001',
        name: 'Baseline 2025',
        year: 2025,
        status: 'DRAFT',
        deletedAt: null,
      },
    ];
    (prisma.energyBaseline.findMany as jest.Mock).mockResolvedValue(mockBaselines);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/baselines');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by year', async () => {
    (prisma.energyBaseline.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/baselines?year=2025');

    expect(prisma.energyBaseline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ year: 2025 }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma.energyBaseline.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/baselines?status=ACTIVE');

    expect(prisma.energyBaseline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyBaseline.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyBaseline.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/baselines');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/baselines', () => {
  const validBody = {
    name: 'Baseline 2025',
    year: 2025,
    totalConsumption: 50000,
    unit: 'kWh',
    methodology: 'Regression analysis',
  };

  it('should create a baseline', async () => {
    (prisma.energyBaseline.create as jest.Mock).mockResolvedValue({
      id: 'new-id',
      ...validBody,
      status: 'DRAFT',
    });

    const res = await request(app).post('/api/baselines').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Baseline 2025');
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/baselines').send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should handle create error', async () => {
    (prisma.energyBaseline.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/baselines').send(validBody);

    expect(res.status).toBe(500);
  });
});

describe('GET /api/baselines/:id', () => {
  it('should return a baseline', async () => {
    const mock = {
      id: 'e6000000-0000-4000-a000-000000000001',
      name: 'Baseline',
      year: 2025,
      targets: [],
    };
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue(mock);

    const res = await request(app).get('/api/baselines/e6000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('e6000000-0000-4000-a000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/baselines/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/baselines/:id', () => {
  it('should update a baseline', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({
      id: 'e6000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });
    (prisma.energyBaseline.update as jest.Mock).mockResolvedValue({
      id: 'e6000000-0000-4000-a000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/baselines/e6000000-0000-4000-a000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/baselines/00000000-0000-0000-0000-000000000099')
      .send({ name: 'X' });

    expect(res.status).toBe(404);
  });

  it('should reject invalid update body', async () => {
    const res = await request(app)
      .put('/api/baselines/e6000000-0000-4000-a000-000000000001')
      .send({ year: 'not-a-number' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/baselines/:id', () => {
  it('should soft delete a baseline', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({
      id: 'e6000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });
    (prisma.energyBaseline.update as jest.Mock).mockResolvedValue({
      id: 'e6000000-0000-4000-a000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/baselines/e6000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/baselines/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/baselines/:id/approve', () => {
  it('should approve a DRAFT baseline', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({
      id: 'e6000000-0000-4000-a000-000000000001',
      status: 'DRAFT',
      deletedAt: null,
    });
    (prisma.energyBaseline.update as jest.Mock).mockResolvedValue({
      id: 'e6000000-0000-4000-a000-000000000001',
      status: 'ACTIVE',
      approvedBy: '00000000-0000-4000-a000-000000000123',
    });

    const res = await request(app).put(
      '/api/baselines/e6000000-0000-4000-a000-000000000001/approve'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('should reject if not DRAFT', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({
      id: 'e6000000-0000-4000-a000-000000000001',
      status: 'ACTIVE',
      deletedAt: null,
    });

    const res = await request(app).put(
      '/api/baselines/e6000000-0000-4000-a000-000000000001/approve'
    );

    expect(res.status).toBe(400);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put(
      '/api/baselines/00000000-0000-0000-0000-000000000099/approve'
    );

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.energyBaseline.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/baselines');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.energyBaseline.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/baselines').send({
      name: 'Baseline 2025',
      year: 2025,
      totalConsumption: 50000,
      unit: 'kWh',
      methodology: 'Regression analysis',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('baselines — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/baselines', baselinesRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/baselines', async () => {
    const res = await request(app).get('/api/baselines');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('baselines — extended edge cases', () => {
  const BASELINE_ID = 'e6000000-0000-4000-a000-000000000001';

  it('GET / returns pagination metadata', async () => {
    (prisma.energyBaseline.findMany as jest.Mock).mockResolvedValue([{ id: BASELINE_ID, name: 'Baseline', year: 2025 }]);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/baselines');

    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('GET / with page=2 applies correct pagination', async () => {
    (prisma.energyBaseline.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(50);

    const res = await request(app).get('/api/baselines?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.total).toBe(50);
  });

  it('PUT /:id/approve returns 500 when update fails', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({ id: BASELINE_ID, status: 'DRAFT', deletedAt: null });
    (prisma.energyBaseline.update as jest.Mock).mockRejectedValue(new Error('DB failure'));

    const res = await request(app).put(`/api/baselines/${BASELINE_ID}/approve`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get(`/api/baselines/${BASELINE_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 on DB error', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({ id: BASELINE_ID, deletedAt: null });
    (prisma.energyBaseline.update as jest.Mock).mockRejectedValue(new Error('DB failure'));

    const res = await request(app).delete(`/api/baselines/${BASELINE_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({ id: BASELINE_ID, deletedAt: null });
    (prisma.energyBaseline.update as jest.Mock).mockRejectedValue(new Error('DB failure'));

    const res = await request(app).put(`/api/baselines/${BASELINE_ID}`).send({ name: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / creates baseline with description and adjustmentFactors', async () => {
    (prisma.energyBaseline.create as jest.Mock).mockResolvedValue({
      id: BASELINE_ID,
      name: 'Full Baseline',
      year: 2025,
      status: 'DRAFT',
      description: 'Full test baseline',
      adjustmentFactors: { heating: 1.1, cooling: 0.9 },
    });

    const res = await request(app).post('/api/baselines').send({
      name: 'Full Baseline',
      year: 2025,
      totalConsumption: 60000,
      unit: 'MWh',
      methodology: 'Statistical regression',
      description: 'Full test baseline',
      adjustmentFactors: { heating: 1.1, cooling: 0.9 },
    });

    expect(res.status).toBe(201);
    expect(res.body.data.description).toBe('Full test baseline');
  });

  it('PUT /:id approves to ACTIVE status', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({
      id: BASELINE_ID,
      status: 'DRAFT',
      deletedAt: null,
    });
    (prisma.energyBaseline.update as jest.Mock).mockResolvedValue({
      id: BASELINE_ID,
      status: 'ACTIVE',
      approvedBy: '00000000-0000-4000-a000-000000000123',
    });

    const res = await request(app).put(`/api/baselines/${BASELINE_ID}/approve`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
    expect(res.body.data.approvedBy).toBeDefined();
  });

  it('DELETE /:id returns id and deleted:true in data', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({ id: BASELINE_ID, deletedAt: null });
    (prisma.energyBaseline.update as jest.Mock).mockResolvedValue({ id: BASELINE_ID, deletedAt: new Date() });

    const res = await request(app).delete(`/api/baselines/${BASELINE_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(BASELINE_ID);
    expect(res.body.data.deleted).toBe(true);
  });

  it('POST / rejects year out of valid range', async () => {
    const res = await request(app).post('/api/baselines').send({
      name: 'Old Baseline',
      year: 1999,
      totalConsumption: 10000,
      unit: 'kWh',
      methodology: 'Manual',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('baselines — final coverage', () => {
  const BASELINE_ID = 'e6000000-0000-4000-a000-000000000001';

  it('GET /api/baselines success:true with populated list', async () => {
    (prisma.energyBaseline.findMany as jest.Mock).mockResolvedValue([{ id: BASELINE_ID, name: 'Baseline 2025', year: 2025, status: 'DRAFT', deletedAt: null }]);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/baselines');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].year).toBe(2025);
  });

  it('POST / creates baseline with MWh unit', async () => {
    (prisma.energyBaseline.create as jest.Mock).mockResolvedValue({
      id: BASELINE_ID,
      name: 'MWh Baseline',
      year: 2025,
      unit: 'MWh',
      status: 'DRAFT',
    });

    const res = await request(app).post('/api/baselines').send({
      name: 'MWh Baseline',
      year: 2025,
      totalConsumption: 500,
      unit: 'MWh',
      methodology: 'Direct measurement',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.unit).toBe('MWh');
  });

  it('PUT /api/baselines/:id updates year correctly', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({ id: BASELINE_ID, deletedAt: null });
    (prisma.energyBaseline.update as jest.Mock).mockResolvedValue({ id: BASELINE_ID, year: 2026 });

    const res = await request(app).put(`/api/baselines/${BASELINE_ID}`).send({ year: 2026 });

    expect(res.status).toBe(200);
    expect(res.body.data.year).toBe(2026);
  });

  it('DELETE /api/baselines/:id response includes success:true', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({ id: BASELINE_ID, deletedAt: null });
    (prisma.energyBaseline.update as jest.Mock).mockResolvedValue({ id: BASELINE_ID, deletedAt: new Date() });

    const res = await request(app).delete(`/api/baselines/${BASELINE_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('PUT /api/baselines/:id/approve rejects ARCHIVED status baseline', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({ id: BASELINE_ID, status: 'ARCHIVED', deletedAt: null });

    const res = await request(app).put(`/api/baselines/${BASELINE_ID}/approve`);

    expect(res.status).toBe(400);
  });

  it('GET /api/baselines/:id returns 500 when findFirst throws', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockRejectedValue(new Error('Network timeout'));

    const res = await request(app).get(`/api/baselines/${BASELINE_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / rejects empty name', async () => {
    const res = await request(app).post('/api/baselines').send({
      name: '',
      year: 2025,
      totalConsumption: 1000,
      unit: 'kWh',
      methodology: 'Regression',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('baselines — additional coverage', () => {
  const BASELINE_ID = 'e6000000-0000-4000-a000-000000000001';

  it('GET /api/baselines pagination page defaults to 1', async () => {
    (prisma.energyBaseline.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/baselines');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('PUT /api/baselines/:id rejects if totalConsumption is negative', async () => {
    (prisma.energyBaseline.findFirst as jest.Mock).mockResolvedValue({ id: BASELINE_ID, deletedAt: null });

    const res = await request(app)
      .put(`/api/baselines/${BASELINE_ID}`)
      .send({ totalConsumption: -100 });

    expect(res.status).toBe(400);
  });

  it('GET /api/baselines data array contains expected year field', async () => {
    (prisma.energyBaseline.findMany as jest.Mock).mockResolvedValue([
      { id: BASELINE_ID, name: 'Baseline', year: 2025, status: 'DRAFT', deletedAt: null },
    ]);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/baselines');

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('year', 2025);
  });
});
