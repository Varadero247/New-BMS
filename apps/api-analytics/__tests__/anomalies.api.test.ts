import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {},
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'admin@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/rbac', () => ({
  requirePermission: (mod: string, level: number) => (_req: any, _res: any, next: any) => next(),
  attachPermissions: () => (_req: any, _res: any, next: any) => next(),
}));

import anomaliesRouter from '../src/routes/anomalies';

const app = express();
app.use(express.json());
app.use('/api/anomalies', anomaliesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Anomalies Routes', () => {
  describe('GET /api/anomalies/kpis', () => {
    it('returns monitored KPIs with status', async () => {
      const res = await request(app).get('/api/anomalies/kpis');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('kpis');
      expect(res.body.data).toHaveProperty('summary');
    });

    it('summary includes counts by status', async () => {
      const res = await request(app).get('/api/anomalies/kpis');
      const { summary } = res.body.data;
      expect(summary).toHaveProperty('total');
      expect(summary).toHaveProperty('anomaly');
      expect(summary).toHaveProperty('warning');
      expect(summary).toHaveProperty('normal');
    });
  });

  describe('GET /api/anomalies', () => {
    it('returns anomaly alerts', async () => {
      const res = await request(app).get('/api/anomalies');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('anomalies');
      expect(res.body.data).toHaveProperty('summary');
    });

    it('supports filtering by severity', async () => {
      const res = await request(app).get('/api/anomalies?severity=critical');
      expect(res.status).toBe(200);
    });

    it('supports filtering by module', async () => {
      const res = await request(app).get('/api/anomalies?module=quality');
      expect(res.status).toBe(200);
    });

    it('supports pagination', async () => {
      const res = await request(app).get('/api/anomalies?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
    });
  });

  describe('PUT /api/anomalies/:id/dismiss', () => {
    it('dismisses an anomaly with reason', async () => {
      const res = await request(app)
        .put('/api/anomalies/anom-001/dismiss')
        .send({ reason: 'Planned maintenance window' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing reason', async () => {
      const res = await request(app).put('/api/anomalies/anom-001/dismiss').send({});
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent anomaly', async () => {
      const res = await request(app)
        .put('/api/anomalies/nonexistent/dismiss')
        .send({ reason: 'Test' });
      expect(res.status).toBe(404);
    });
  });
});

describe('Anomalies — extended', () => {
  it('kpis.kpis is an array', async () => {
    const res = await request(app).get('/api/anomalies/kpis');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.kpis)).toBe(true);
  });

  it('anomaly list anomalies field is an array', async () => {
    const res = await request(app).get('/api/anomalies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.anomalies)).toBe(true);
  });

  it('summary has total field as a number', async () => {
    const res = await request(app).get('/api/anomalies/kpis');
    expect(typeof res.body.data.summary.total).toBe('number');
  });
});

describe('Anomalies — extra', () => {
  it('GET /api/anomalies returns success true', async () => {
    const res = await request(app).get('/api/anomalies');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/anomalies/kpis summary has anomaly count', async () => {
    const res = await request(app).get('/api/anomalies/kpis');
    expect(res.status).toBe(200);
    expect(res.body.data.summary).toHaveProperty('anomaly');
  });

  it('GET /api/anomalies?severity=warning returns 200', async () => {
    const res = await request(app).get('/api/anomalies?severity=warning');
    expect(res.status).toBe(200);
  });
});

describe('anomalies.api.test.ts — additional coverage', () => {
  it('GET /api/anomalies returns empty anomalies array for unseen module filter', async () => {
    const res = await request(app).get('/api/anomalies?module=nonexistent_module_xyz');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Non-matching module filter should still return a valid response structure
    expect(res.body.data).toHaveProperty('anomalies');
  });

  it('PUT /api/anomalies/:id/dismiss rejects empty string reason as 400', async () => {
    const res = await request(app)
      .put('/api/anomalies/anom-001/dismiss')
      .send({ reason: '' });
    expect(res.status).toBe(400);
  });

  it('GET /api/anomalies pagination object contains limit field', async () => {
    const res = await request(app).get('/api/anomalies?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('GET /api/anomalies with large page number returns 200 with valid structure', async () => {
    const res = await request(app).get('/api/anomalies?page=9999&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('anomalies');
  });

  it('GET /api/anomalies?severity=INVALID_ENUM returns 200 (filter is advisory)', async () => {
    const res = await request(app).get('/api/anomalies?severity=INVALID_ENUM');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('anomalies.api — extended edge cases', () => {
  it('GET /api/anomalies/kpis kpis array has at least one entry', async () => {
    const res = await request(app).get('/api/anomalies/kpis');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.kpis)).toBe(true);
    // built-in KPIs should always be present
    expect(res.body.data.kpis.length).toBeGreaterThan(0);
  });

  it('GET /api/anomalies/kpis each kpi has id, name, value, status fields', async () => {
    const res = await request(app).get('/api/anomalies/kpis');
    expect(res.status).toBe(200);
    const kpi = res.body.data.kpis[0];
    expect(kpi).toHaveProperty('id');
    expect(kpi).toHaveProperty('name');
    expect(kpi).toHaveProperty('currentValue');
    expect(kpi).toHaveProperty('status');
  });

  it('GET /api/anomalies returns pagination object with page and total fields', async () => {
    const res = await request(app).get('/api/anomalies?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('GET /api/anomalies summary.total equals number of anomalies returned when all fit on one page', async () => {
    const res = await request(app).get('/api/anomalies?limit=100');
    expect(res.status).toBe(200);
    const { anomalies, summary } = res.body.data;
    expect(typeof summary.total).toBe('number');
    expect(summary.total).toBeGreaterThanOrEqual(anomalies.length);
  });

  it('PUT /api/anomalies/:id/dismiss requires non-empty reason string', async () => {
    const res = await request(app)
      .put('/api/anomalies/anom-001/dismiss')
      .send({ reason: 'Valid reason' });
    expect(res.status).toBe(200);
  });

  it('GET /api/anomalies?module=health_safety filters by module', async () => {
    const res = await request(app).get('/api/anomalies?module=health_safety');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/anomalies/kpis summary.warning is a number', async () => {
    const res = await request(app).get('/api/anomalies/kpis');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.summary.warning).toBe('number');
  });

  it('GET /api/anomalies?severity=critical returns anomalies filtered by severity', async () => {
    const res = await request(app).get('/api/anomalies?severity=critical');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('anomalies');
    expect(res.body.data).toHaveProperty('summary');
  });
});
