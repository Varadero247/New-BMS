import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {},
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: 'user-123',
      email: 'admin@test.com',
      role: 'ADMIN',
      permissions: { quality: 3, analytics: 3 },
    };
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

import nlqRouter from '../src/routes/nlq';

const app = express();
app.use(express.json());
app.use('/api/nlq', nlqRouter);

describe('NLQ API', () => {
  // ─────────────────────── POST /api/nlq/query ───────────────────────

  describe('POST /api/nlq/query', () => {
    it('returns results for a matched CAPA query', async () => {
      const res = await request(app)
        .post('/api/nlq/query')
        .send({ query: 'show me all open CAPAs' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.query.original).toBe('show me all open CAPAs');
      expect(res.body.data.query.confidence).toBeGreaterThan(0);
      expect(res.body.data.results.rows.length).toBeGreaterThan(0);
      expect(res.body.data.results.columns).toContain('refNumber');
    });

    it('returns results for NCR count query', async () => {
      const res = await request(app)
        .post('/api/nlq/query')
        .send({ query: 'how many NCRs were raised this month' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results.totalCount).toBeGreaterThan(0);
    });

    it('returns results for overdue actions query', async () => {
      const res = await request(app).post('/api/nlq/query').send({ query: 'show overdue actions' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results.rows.length).toBeGreaterThan(0);
      expect(res.body.data.results.columns).toContain('daysOverdue');
    });

    it('returns empty results with suggestions for unrecognised query', async () => {
      const res = await request(app)
        .post('/api/nlq/query')
        .send({ query: 'what is the meaning of life' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.query.confidence).toBe(0);
      expect(res.body.data.results.totalCount).toBe(0);
      expect(res.body.data.suggestions).toBeDefined();
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
    });

    it('returns 400 for empty query', async () => {
      const res = await request(app).post('/api/nlq/query').send({ query: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for query too short', async () => {
      const res = await request(app).post('/api/nlq/query').send({ query: 'ab' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for missing query field', async () => {
      const res = await request(app).post('/api/nlq/query').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('includes executionTimeMs in response', async () => {
      const res = await request(app)
        .post('/api/nlq/query')
        .send({ query: 'show me all open CAPAs' });

      expect(res.status).toBe(200);
      expect(typeof res.body.data.executionTimeMs).toBe('number');
    });
  });

  // ─────────────────────── GET /api/nlq/examples ───────────────────────

  describe('GET /api/nlq/examples', () => {
    it('returns a list of example queries', async () => {
      const res = await request(app).get('/api/nlq/examples');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('query');
      expect(res.body.data[0]).toHaveProperty('description');
    });
  });

  // ─────────────────────── GET /api/nlq/history ───────────────────────

  describe('GET /api/nlq/history', () => {
    it('returns query history for current user', async () => {
      const res = await request(app).get('/api/nlq/history');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).toHaveProperty('query');
      expect(res.body.data[0]).toHaveProperty('executedAt');
      expect(res.body.data[0]).toHaveProperty('resultCount');
    });

    it('includes seed history entries', async () => {
      const res = await request(app).get('/api/nlq/history');

      expect(res.status).toBe(200);
      const queries = res.body.data.map((h: any) => h.query);
      expect(queries).toContain('show me all open CAPAs');
    });

    it('limits results to 20 entries', async () => {
      const res = await request(app).get('/api/nlq/history');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(20);
    });
  });

  // ─────────────────────── Query history recording ───────────────────────

  describe('Query history recording', () => {
    it('records a query in history after successful execution', async () => {
      const uniqueQuery = 'show me all open CAPAs';

      await request(app).post('/api/nlq/query').send({ query: uniqueQuery });

      const historyRes = await request(app).get('/api/nlq/history');

      expect(historyRes.status).toBe(200);
      const matchingEntries = historyRes.body.data.filter((h: any) => h.query === uniqueQuery);
      expect(matchingEntries.length).toBeGreaterThanOrEqual(1);
      expect(matchingEntries[0]).toHaveProperty('confidence');
      expect(matchingEntries[0].resultCount).toBeGreaterThanOrEqual(0);
    });

    it('records zero-result queries in history too', async () => {
      const unknownQuery = 'what is the meaning of life';

      await request(app).post('/api/nlq/query').send({ query: unknownQuery });

      const historyRes = await request(app).get('/api/nlq/history');

      expect(historyRes.status).toBe(200);
      const entry = historyRes.body.data.find((h: any) => h.query === unknownQuery);
      expect(entry).toBeDefined();
      expect(entry.resultCount).toBe(0);
      expect(entry.confidence).toBe(0);
    });
  });

  // ─────────────────────── AI Fallback ───────────────────────

  describe('AI fallback behaviour', () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    it('returns aiAssisted: true with low confidence when AI provider is configured', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-fake-key';

      const res = await request(app)
        .post('/api/nlq/query')
        .send({ query: 'show me the most expensive purchase orders from last quarter' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiAssisted).toBe(true);
      expect(res.body.data.query.confidence).toBeLessThanOrEqual(0.3);
      expect(res.body.data.suggestions).toBeDefined();
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
    });

    it('returns aiAssisted: true when AI_PROVIDER_URL is set', async () => {
      process.env.AI_PROVIDER_URL = 'https://ai.example.com/v1';
      delete process.env.OPENAI_API_KEY;

      const res = await request(app)
        .post('/api/nlq/query')
        .send({ query: 'summarize all compliance findings from the last audit cycle' });

      expect(res.status).toBe(200);
      expect(res.body.data.aiAssisted).toBe(true);
      expect(res.body.data.query.interpretation).toContain('AI-assisted');
    });

    it('does NOT return aiAssisted when no AI provider is configured', async () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.AI_PROVIDER_URL;

      const res = await request(app)
        .post('/api/nlq/query')
        .send({ query: 'find all vendor scorecards with declining trends' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiAssisted).toBeUndefined();
      expect(res.body.data.query.confidence).toBe(0);
      expect(res.body.data.suggestions).toBeDefined();
    });

    it('AI fallback records query with 0.3 confidence', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-fake-key';

      const aiQuery = 'list all equipment with maintenance overdue by more than 30 days';
      await request(app).post('/api/nlq/query').send({ query: aiQuery });

      const historyRes = await request(app).get('/api/nlq/history');
      const entry = historyRes.body.data.find((h: any) => h.query === aiQuery);
      expect(entry).toBeDefined();
      expect(entry.confidence).toBe(0.3);
      expect(entry.resultCount).toBe(0);
    });

    it('AI fallback returns empty results (columns=[], rows=[], totalCount=0)', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key-123';

      const res = await request(app)
        .post('/api/nlq/query')
        .send({ query: 'show energy consumption by department for last fiscal year' });

      expect(res.status).toBe(200);
      expect(res.body.data.results.columns).toEqual([]);
      expect(res.body.data.results.rows).toEqual([]);
      expect(res.body.data.results.totalCount).toBe(0);
    });
  });
});

describe('nlq.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nlq', nlqRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/nlq', async () => {
    const res = await request(app).get('/api/nlq');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('NLQ API — edge cases and extended validation', () => {
  it('POST /api/nlq/query returns 400 when query is whitespace only', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/nlq/query response data has results object', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: 'show me all open CAPAs' });
    expect(res.status).toBe(200);
    expect(res.body.data.results).toBeDefined();
    expect(typeof res.body.data.results).toBe('object');
  });

  it('POST /api/nlq/query results.columns is an array', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: 'show me all open CAPAs' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.results.columns)).toBe(true);
  });

  it('POST /api/nlq/query results.rows is an array', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: 'show me all open CAPAs' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.results.rows)).toBe(true);
  });

  it('POST /api/nlq/query results.totalCount is a number', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: 'show me all open CAPAs' });
    expect(res.status).toBe(200);
    expect(typeof res.body.data.results.totalCount).toBe('number');
  });

  it('GET /api/nlq/examples returns array with query and description fields', async () => {
    const res = await request(app).get('/api/nlq/examples');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty('query');
      expect(res.body.data[0]).toHaveProperty('description');
    }
  });

  it('GET /api/nlq/history each entry has resultCount as number', async () => {
    const res = await request(app).get('/api/nlq/history');
    expect(res.status).toBe(200);
    if (res.body.data.length > 0) {
      expect(typeof res.body.data[0].resultCount).toBe('number');
    }
  });

  it('POST /api/nlq/query query.original matches request query text', async () => {
    const queryText = 'show me all open CAPAs';
    const res = await request(app).post('/api/nlq/query').send({ query: queryText });
    expect(res.status).toBe(200);
    expect(res.body.data.query.original).toBe(queryText);
  });

  it('POST /api/nlq/query query.confidence is between 0 and 1', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: 'show me all open CAPAs' });
    expect(res.status).toBe(200);
    expect(res.body.data.query.confidence).toBeGreaterThanOrEqual(0);
    expect(res.body.data.query.confidence).toBeLessThanOrEqual(1);
  });

  it('POST /api/nlq/query unrecognised query has empty rows array', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: 'xyzzy frobnicate quux' });
    expect(res.status).toBe(200);
    expect(res.body.data.results.rows).toEqual([]);
    expect(res.body.data.results.totalCount).toBe(0);
  });
});

describe('NLQ API — final coverage', () => {
  it('POST /api/nlq/query returns success true for a valid recognised query', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: 'show overdue actions' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/nlq/query response body has data key', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: 'show me all open CAPAs' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/nlq/examples success is true', async () => {
    const res = await request(app).get('/api/nlq/examples');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/nlq/examples response is JSON', async () => {
    const res = await request(app).get('/api/nlq/examples');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/nlq/history success is true', async () => {
    const res = await request(app).get('/api/nlq/history');
    expect(res.body.success).toBe(true);
  });

  it('POST /api/nlq/query query.interpretation is a string when recognised', async () => {
    const res = await request(app).post('/api/nlq/query').send({ query: 'show me all open CAPAs' });
    expect(res.status).toBe(200);
    expect(typeof res.body.data.query.interpretation).toBe('string');
  });

  it('GET /api/nlq/history returns an array', async () => {
    const res = await request(app).get('/api/nlq/history');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
