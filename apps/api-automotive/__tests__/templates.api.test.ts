import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them
// No prisma mock needed — templates route uses a static in-memory array

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 't@t.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

import templatesRouter from '../src/routes/templates';

const app = express();
app.use(express.json());
app.use('/api/templates', templatesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET / ────────────────────────────────────────────────────────────────────

describe('GET /api/templates', () => {
  it('returns 200 with an array of templates', async () => {
    const res = await request(app).get('/api/templates');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns an array with length greater than zero', async () => {
    const res = await request(app).get('/api/templates');

    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('each template has required fields: id, name, category, format, version', async () => {
    const res = await request(app).get('/api/templates');

    for (const tpl of res.body.data) {
      expect(tpl).toHaveProperty('id');
      expect(tpl).toHaveProperty('name');
      expect(tpl).toHaveProperty('category');
      expect(tpl).toHaveProperty('format');
      expect(tpl).toHaveProperty('version');
    }
  });

  it('supports category filter — returns only APQP templates', async () => {
    const res = await request(app).get('/api/templates?category=APQP');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const tpl of res.body.data) {
      expect(tpl.category).toBe('APQP');
    }
  });

  it('supports category filter — returns only FMEA templates', async () => {
    const res = await request(app).get('/api/templates?category=FMEA');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const tpl of res.body.data) {
      expect(tpl.category).toBe('FMEA');
    }
  });

  it('returns empty array for category that does not exist', async () => {
    const res = await request(app).get('/api/templates?category=NONEXISTENT');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('supports search query param — matches by name', async () => {
    const res = await request(app).get('/api/templates?search=PPAP');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const tpl of res.body.data) {
      const matchesName = tpl.name.toLowerCase().includes('ppap');
      const matchesDesc = tpl.description.toLowerCase().includes('ppap');
      expect(matchesName || matchesDesc).toBe(true);
    }
  });

  it('supports search query param — matches by description case-insensitively', async () => {
    const res = await request(app).get('/api/templates?search=aiag');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('returns empty array when search matches nothing', async () => {
    const res = await request(app).get('/api/templates?search=zzznomatch999');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────

describe('GET /api/templates/:id', () => {
  it('returns 200 with a single template matching slug tpl-apqp-01', async () => {
    const res = await request(app).get('/api/templates/tpl-apqp-01');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('tpl-apqp-01');
    expect(res.body.data.name).toBe('APQP Phase Gate Checklist');
  });

  it('returns 200 with correct template for tpl-ppap-01', async () => {
    const res = await request(app).get('/api/templates/tpl-ppap-01');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('tpl-ppap-01');
    expect(res.body.data.category).toBe('PPAP');
  });

  it('returns 404 for an unknown but validly-formatted slug', async () => {
    const res = await request(app).get('/api/templates/tpl-unknown-99');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for a slug with invalid format', async () => {
    const res = await request(app).get('/api/templates/not-a-valid-template-id');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_ID');
  });
});

describe('Automotive Templates — extended', () => {
  it('GET / success is true on 200', async () => {
    const res = await request(app).get('/api/templates');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id returns 200 with success true for known FMEA template', async () => {
    const res = await request(app).get('/api/templates/tpl-fmea-01');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe('FMEA');
  });
});
describe('Automotive Templates — additional coverage', () => {
  it('enforces authentication — authenticate middleware is called on GET /', async () => {
    const { authenticate } = require('@ims/auth');
    await request(app).get('/api/templates');
    expect(authenticate).toHaveBeenCalled();
  });

  it('GET / returns empty array for unknown category', async () => {
    const res = await request(app).get('/api/templates?category=NONEXISTENT_CATEGORY');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('GET /:id returns 400 for id with invalid format (not matching slug pattern)', async () => {
    const res = await request(app).get('/api/templates/not-valid');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_ID');
  });

  it('GET /:id returns 404 for correctly-formatted but non-existent template slug', async () => {
    const res = await request(app).get('/api/templates/tpl-xyz-99');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET / returns CONTROL_PLAN template with correct fields when filtering by category', async () => {
    const res = await request(app).get('/api/templates?category=CONTROL_PLAN');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    const tpl = res.body.data[0];
    expect(tpl.category).toBe('CONTROL_PLAN');
    expect(tpl).toHaveProperty('id');
    expect(tpl).toHaveProperty('name');
    expect(tpl).toHaveProperty('format');
    expect(tpl).toHaveProperty('version');
  });
});
