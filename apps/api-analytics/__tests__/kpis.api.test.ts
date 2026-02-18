import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    analyticsKpi: {
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

import kpisRouter from '../src/routes/kpis';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/kpis', kpisRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/kpis — List KPIs
// ===================================================================
describe('GET /api/kpis', () => {
  it('should return a list of KPIs with pagination', async () => {
    const kpis = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'TRIR', module: 'HEALTH_SAFETY', trend: 'DOWN' },
      { id: 'kpi-2', name: 'FPY', module: 'QUALITY', trend: 'UP' },
    ];
    (prisma as any).analyticsKpi.findMany.mockResolvedValue(kpis);
    (prisma as any).analyticsKpi.count.mockResolvedValue(2);

    const res = await request(app).get('/api/kpis');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by module', async () => {
    (prisma as any).analyticsKpi.findMany.mockResolvedValue([]);
    (prisma as any).analyticsKpi.count.mockResolvedValue(0);

    const res = await request(app).get('/api/kpis?module=QUALITY');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsKpi.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ module: 'QUALITY' }) })
    );
  });

  it('should filter by frequency', async () => {
    (prisma as any).analyticsKpi.findMany.mockResolvedValue([]);
    (prisma as any).analyticsKpi.count.mockResolvedValue(0);

    const res = await request(app).get('/api/kpis?frequency=DAILY');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsKpi.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ frequency: 'DAILY' }) })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).analyticsKpi.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/kpis');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/kpis — Create KPI
// ===================================================================
describe('POST /api/kpis', () => {
  it('should create a new KPI', async () => {
    const created = { id: 'kpi-new', name: 'New KPI', module: 'HR', trend: 'STABLE', frequency: 'MONTHLY' };
    (prisma as any).analyticsKpi.create.mockResolvedValue(created);

    const res = await request(app).post('/api/kpis').send({
      name: 'New KPI', module: 'HR', trend: 'STABLE', frequency: 'MONTHLY',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New KPI');
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/kpis').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ===================================================================
// GET /api/kpis/executive-dashboard — Executive dashboard
// ===================================================================
describe('GET /api/kpis/executive-dashboard', () => {
  it('should return KPIs grouped by module', async () => {
    const kpis = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'TRIR', module: 'HEALTH_SAFETY', trend: 'DOWN' },
      { id: 'kpi-2', name: 'FPY', module: 'QUALITY', trend: 'UP' },
      { id: 'kpi-3', name: 'NCR Rate', module: 'QUALITY', trend: 'DOWN' },
    ];
    (prisma as any).analyticsKpi.findMany.mockResolvedValue(kpis);

    const res = await request(app).get('/api/kpis/executive-dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.HEALTH_SAFETY).toHaveLength(1);
    expect(res.body.data.QUALITY).toHaveLength(2);
  });
});

// ===================================================================
// GET /api/kpis/modules/:module — Module KPIs
// ===================================================================
describe('GET /api/kpis/modules/:module', () => {
  it('should return KPIs for a specific module', async () => {
    const kpis = [{ id: '00000000-0000-0000-0000-000000000001', name: 'TRIR', module: 'HEALTH_SAFETY' }];
    (prisma as any).analyticsKpi.findMany.mockResolvedValue(kpis);

    const res = await request(app).get('/api/kpis/modules/HEALTH_SAFETY');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

// ===================================================================
// GET /api/kpis/:id — Get by ID
// ===================================================================
describe('GET /api/kpis/:id', () => {
  it('should return a KPI by ID', async () => {
    (prisma as any).analyticsKpi.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', name: 'TRIR' });

    const res = await request(app).get('/api/kpis/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent KPI', async () => {
    (prisma as any).analyticsKpi.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/kpis/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/kpis/:id — Update
// ===================================================================
describe('PUT /api/kpis/:id', () => {
  it('should update a KPI', async () => {
    (prisma as any).analyticsKpi.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).analyticsKpi.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Updated' });

    const res = await request(app).put('/api/kpis/00000000-0000-0000-0000-000000000001').send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for non-existent KPI', async () => {
    (prisma as any).analyticsKpi.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/kpis/00000000-0000-0000-0000-000000000099').send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/kpis/:id — Soft delete
// ===================================================================
describe('DELETE /api/kpis/:id', () => {
  it('should soft delete a KPI', async () => {
    (prisma as any).analyticsKpi.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).analyticsKpi.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });

    const res = await request(app).delete('/api/kpis/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('KPI deleted');
  });

  it('should return 404 for non-existent KPI', async () => {
    (prisma as any).analyticsKpi.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/kpis/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/kpis/:id/calculate — Recalculate
// ===================================================================
describe('POST /api/kpis/:id/calculate', () => {
  it('should recalculate a KPI', async () => {
    (prisma as any).analyticsKpi.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', currentValue: 50 });
    (prisma as any).analyticsKpi.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', currentValue: 75, previousValue: 50, trend: 'UP', lastCalculated: new Date() });

    const res = await request(app).post('/api/kpis/00000000-0000-0000-0000-000000000001/calculate');

    expect(res.status).toBe(200);
    expect(res.body.data.lastCalculated).toBeDefined();
  });

  it('should return 404 for non-existent KPI', async () => {
    (prisma as any).analyticsKpi.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/kpis/00000000-0000-0000-0000-000000000099/calculate');

    expect(res.status).toBe(404);
  });
});
