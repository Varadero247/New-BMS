import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktEmailLog: {
      findMany: jest.fn(),
    },
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

import expansionRouter from '../src/routes/expansion';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/expansion', expansionRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/expansion/triggers
// ===================================================================

describe('GET /api/expansion/triggers', () => {
  it('returns recent trigger events', async () => {
    const triggers = [{ id: 'log-1', template: 'expansion_user_limit', email: 'admin@co.com' }];
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue(triggers);

    const res = await request(app).get('/api/expansion/triggers');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by expansion_ template prefix', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/expansion/triggers');

    expect(prisma.mktEmailLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { template: { startsWith: 'expansion_' } },
      })
    );
  });

  it('returns 500 on database error', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/expansion/triggers');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/expansion/check
// ===================================================================

describe('POST /api/expansion/check', () => {
  it('runs expansion check and returns results', async () => {
    const res = await request(app).post('/api/expansion/check');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('check completed');
    expect(res.body.data.results).toBeDefined();
  });

  it('returns empty results arrays', async () => {
    const res = await request(app).post('/api/expansion/check');

    expect(res.body.data.results.userLimitApproaching).toEqual([]);
    expect(res.body.data.results.unusedModuleNudge).toEqual([]);
    expect(res.body.data.results.growthFlag).toEqual([]);
  });

  it('results object has all three expected keys', async () => {
    const res = await request(app).post('/api/expansion/check');
    expect(res.body.data.results).toHaveProperty('userLimitApproaching');
    expect(res.body.data.results).toHaveProperty('unusedModuleNudge');
    expect(res.body.data.results).toHaveProperty('growthFlag');
  });
});

describe('GET /api/expansion/triggers — additional', () => {
  it('findMany is called once per request', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/expansion/triggers');
    expect(prisma.mktEmailLog.findMany).toHaveBeenCalledTimes(1);
  });

  it('returns multiple triggers when DB has multiple matching logs', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([
      { id: 'log-1', template: 'expansion_user_limit', email: 'a@co.com' },
      { id: 'log-2', template: 'expansion_module_nudge', email: 'b@co.com' },
    ]);
    const res = await request(app).get('/api/expansion/triggers');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('triggers data is an array', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/expansion/triggers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('expansion check success is true', async () => {
    const res = await request(app).post('/api/expansion/check');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('expansion check results is an object', async () => {
    const res = await request(app).post('/api/expansion/check');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.results).toBe('object');
  });
});
