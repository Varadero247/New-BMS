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
