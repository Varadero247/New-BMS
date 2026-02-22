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

describe('Expansion — extra', () => {
  it('GET triggers success is true', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/expansion/triggers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET triggers error code is INTERNAL_ERROR on 500', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/expansion/triggers');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST check message field is a string', async () => {
    const res = await request(app).post('/api/expansion/check');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.message).toBe('string');
  });

  it('POST check userLimitApproaching is an array', async () => {
    const res = await request(app).post('/api/expansion/check');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.results.userLimitApproaching)).toBe(true);
  });
});

describe('Expansion — additional coverage', () => {
  it('POST /check with explicit orgId still returns 200', async () => {
    const res = await request(app)
      .post('/api/expansion/check')
      .send({ orgId: 'org-abc' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /check with custom thresholds returns all three result keys', async () => {
    const res = await request(app)
      .post('/api/expansion/check')
      .send({ thresholds: { userLimit: 5, moduleLimit: 3 } });
    expect(res.status).toBe(200);
    expect(res.body.data.results).toHaveProperty('userLimitApproaching');
    expect(res.body.data.results).toHaveProperty('unusedModuleNudge');
    expect(res.body.data.results).toHaveProperty('growthFlag');
  });

  it('GET /triggers orderBy is createdAt desc', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/expansion/triggers');
    expect(prisma.mktEmailLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });

  it('GET /triggers take is 50', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/expansion/triggers');
    expect(prisma.mktEmailLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it('POST /check message contains the word completed', async () => {
    const res = await request(app).post('/api/expansion/check');
    expect(res.status).toBe(200);
    expect(res.body.data.message.toLowerCase()).toContain('completed');
  });
});

describe('Expansion — edge cases', () => {
  it('POST /check with non-object thresholds returns 400', async () => {
    const res = await request(app)
      .post('/api/expansion/check')
      .send({ thresholds: 'bad-value' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /check with orgId as number returns 400', async () => {
    const res = await request(app)
      .post('/api/expansion/check')
      .send({ orgId: 99 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /triggers returns each log with id and template', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([
      { id: 'log-3', template: 'expansion_growth_flag', email: 'c@co.com' },
    ]);
    const res = await request(app).get('/api/expansion/triggers');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('template');
  });

  it('POST /check with empty body returns 200 (all fields optional)', async () => {
    const res = await request(app)
      .post('/api/expansion/check')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /check unusedModuleNudge is an array', async () => {
    const res = await request(app).post('/api/expansion/check');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.results.unusedModuleNudge)).toBe(true);
  });

  it('POST /check growthFlag is an array', async () => {
    const res = await request(app).post('/api/expansion/check');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.results.growthFlag)).toBe(true);
  });

  it('GET /triggers where clause uses startsWith expansion_', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/expansion/triggers');
    const callArg = (prisma.mktEmailLog.findMany as jest.Mock).mock.calls[0][0];
    expect(callArg.where.template.startsWith).toBe('expansion_');
  });

  it('POST /check with thresholds.userLimit 0 still returns 200', async () => {
    const res = await request(app)
      .post('/api/expansion/check')
      .send({ thresholds: { userLimit: 0 } });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
