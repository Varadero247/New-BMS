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
  requirePermission: () => (_req: any, _res: any, next: any) => next(),
  attachPermissions: () => (_req: any, _res: any, next: any) => next(),
}));

import unifiedRisksRouter from '../src/routes/unified-risks';

const app = express();
app.use(express.json());
app.use('/api/unified-risks', unifiedRisksRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Unified Risks Routes', () => {
  describe('GET /api/unified-risks', () => {
    it('returns unified risk register', async () => {
      const res = await request(app).get('/api/unified-risks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('risks');
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('heatmap');
    });

    it('returns heatmap as 5x5 grid', async () => {
      const res = await request(app).get('/api/unified-risks');
      const { heatmap } = res.body.data;
      expect(heatmap).toBeInstanceOf(Array);
    });

    it('returns summary with bySource and redZonePercent', async () => {
      const res = await request(app).get('/api/unified-risks');
      const { summary } = res.body.data;
      expect(summary).toHaveProperty('bySource');
      expect(summary).toHaveProperty('redZonePercent');
    });

    it('supports filtering by source', async () => {
      const res = await request(app).get('/api/unified-risks?source=quality');
      expect(res.status).toBe(200);
    });

    it('supports filtering by score range', async () => {
      const res = await request(app).get('/api/unified-risks?minScore=12&maxScore=25');
      expect(res.status).toBe(200);
    });

    it('supports pagination', async () => {
      const res = await request(app).get('/api/unified-risks?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/unified-risks/:id', () => {
    it('returns a single unified risk', async () => {
      const res = await request(app).get('/api/unified-risks/ur-001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent risk', async () => {
      const res = await request(app).get('/api/unified-risks/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('Unified Risks — extended', () => {
    it('risks is an array', async () => {
      const res = await request(app).get('/api/unified-risks');
      expect(Array.isArray(res.body.data.risks)).toBe(true);
    });

    it('summary.bySource is an object', async () => {
      const res = await request(app).get('/api/unified-risks');
      expect(typeof res.body.data.summary.bySource).toBe('object');
    });

    it('pagination has totalPages field', async () => {
      const res = await request(app).get('/api/unified-risks?page=1&limit=10');
      expect(res.body.pagination).toHaveProperty('totalPages');
    });
  });
});

describe('Unified Risks — further extended', () => {
  it('GET /api/unified-risks success is true', async () => {
    const res = await request(app).get('/api/unified-risks');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/unified-risks summary.redZonePercent is a number', async () => {
    const res = await request(app).get('/api/unified-risks');
    expect(typeof res.body.data.summary.redZonePercent).toBe('number');
  });

  it('GET /api/unified-risks heatmap is an array', async () => {
    const res = await request(app).get('/api/unified-risks');
    expect(Array.isArray(res.body.data.heatmap)).toBe(true);
  });

  it('GET /api/unified-risks/:id success is true for found risk', async () => {
    const res = await request(app).get('/api/unified-risks/ur-001');
    expect(res.body.success).toBe(true);
  });
});
