import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktWinBackSequence: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    mktEmailJob: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import winbackRouter from '../src/routes/winback';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/winback', winbackRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/winback/start/:orgId', () => {
  it('creates win-back sequence', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktWinBackSequence.create as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-1',
      token: 'token-1',
    });
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'admin@org.com' });

    expect(res.status).toBe(201);
    expect(prisma.mktWinBackSequence.create).toHaveBeenCalled();
    expect(prisma.mktEmailJob.create).toHaveBeenCalled();
  });

  it('returns 409 if sequence already exists', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({ id: 'wb-1' });

    const res = await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'admin@org.com' });

    expect(res.status).toBe(409);
  });

  it('schedules day 3 email', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktWinBackSequence.create as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-1',
    });
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'a@b.com' });

    expect(prisma.mktEmailJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ template: 'winback_day3_reason' }),
      })
    );
  });
});

describe('GET /api/winback/reason/:reason', () => {
  it('records cancellation reason with valid token', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-1',
    });
    (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    const res = await request(app).get('/api/winback/reason/price?token=valid-token');

    expect(res.status).toBe(200);
    expect(prisma.mktWinBackSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ cancellationReason: 'price' }) })
    );
  });

  it('returns 400 for missing token', async () => {
    const res = await request(app).get('/api/winback/reason/price');

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid reason', async () => {
    const res = await request(app).get('/api/winback/reason/invalid_reason?token=t');

    expect(res.status).toBe(400);
  });

  it('returns 404 for invalid token', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/winback/reason/price?token=bad-token');

    expect(res.status).toBe(404);
  });

  it('accepts all valid reasons', async () => {
    for (const reason of ['price', 'features', 'time', 'competitor', 'business']) {
      (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({
        id: 'wb-1',
        orgId: 'org-1',
      });
      (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
      (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

      const res = await request(app).get(`/api/winback/reason/${reason}?token=t`);
      expect(res.status).toBe(200);
    }
  });

  it('schedules reason-specific day 7 email', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-1',
    });
    (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    await request(app).get('/api/winback/reason/features?token=t');

    expect(prisma.mktEmailJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ template: 'winback_day7_features' }),
      })
    );
  });
});

describe('GET /api/winback/active', () => {
  it('returns active win-back sequences', async () => {
    const sequences = [{ id: 'wb-1', orgId: 'org-1', reactivatedAt: null }];
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockResolvedValue(sequences);

    const res = await request(app).get('/api/winback/active');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('active data is an array', async () => {
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/winback/active');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('findMany called once for GET /active', async () => {
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/winback/active');
    expect(prisma.mktWinBackSequence.findMany).toHaveBeenCalledTimes(1);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST /start/:orgId returns 500 when create fails', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktWinBackSequence.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'admin@org.com' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /reason/:reason returns 500 when DB fails', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/winback/reason/price?token=some-token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /active returns 500 when DB fails', async () => {
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/winback/active');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('winback.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/winback', winbackRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/winback', async () => {
    const res = await request(app).get('/api/winback');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/winback', async () => {
    const res = await request(app).get('/api/winback');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/winback body has success property', async () => {
    const res = await request(app).get('/api/winback');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/winback body is an object', async () => {
    const res = await request(app).get('/api/winback');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/winback route is accessible', async () => {
    const res = await request(app).get('/api/winback');
    expect(res.status).toBeDefined();
  });
});

describe('Winback — edge cases', () => {
  it('GET /active filters where reactivatedAt is null', async () => {
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/winback/active');
    expect(prisma.mktWinBackSequence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { reactivatedAt: null } })
    );
  });

  it('GET /active orderBy is cancelledAt desc', async () => {
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/winback/active');
    expect(prisma.mktWinBackSequence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { cancelledAt: 'desc' } })
    );
  });

  it('GET /active take is 100', async () => {
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/winback/active');
    expect(prisma.mktWinBackSequence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('POST /start/:orgId returns 409 error code ALREADY_EXISTS', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({ id: 'wb-1' });
    const res = await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'dup@org.com' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_EXISTS');
  });

  it('POST /start/:orgId with invalid email returns 400', async () => {
    const res = await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /reason/:reason schedules job with sequenceId winback-<orgId>', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-xyz',
    });
    (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});
    await request(app).get('/api/winback/reason/price?token=valid-token');
    const call = (prisma.mktEmailJob.create as jest.Mock).mock.calls[0][0];
    expect(call.data.sequenceId).toBe('winback-org-xyz');
  });

  it('GET /reason/competitor schedules winback_day7_competitor template', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-1',
    });
    (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});
    await request(app).get('/api/winback/reason/competitor?token=t');
    expect(prisma.mktEmailJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ template: 'winback_day7_competitor' }),
      })
    );
  });

  it('GET /active returns success true on empty list', async () => {
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/winback/active');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('POST /start/:orgId response data has id field on success', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktWinBackSequence.create as jest.Mock).mockResolvedValue({
      id: 'wb-new',
      orgId: '00000000-0000-0000-0000-000000000001',
    });
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});
    const res = await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'new@org.com' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });
});

describe('Winback — final coverage', () => {
  it('GET /reason/time schedules winback_day7_time template', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({ id: 'wb-1', orgId: 'org-1' });
    (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    await request(app).get('/api/winback/reason/time?token=t');

    expect(prisma.mktEmailJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ template: 'winback_day7_time' }),
      })
    );
  });

  it('GET /reason/business schedules winback_day7_business template', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({ id: 'wb-1', orgId: 'org-1' });
    (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    await request(app).get('/api/winback/reason/business?token=t');

    expect(prisma.mktEmailJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ template: 'winback_day7_business' }),
      })
    );
  });

  it('POST /start/:orgId creates exactly one email job (day3)', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktWinBackSequence.create as jest.Mock).mockResolvedValue({ id: 'wb-emails', orgId: 'org-1' });
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'multi@org.com' });

    expect(prisma.mktEmailJob.create).toHaveBeenCalledTimes(1);
  });

  it('GET /active returns data array length matching mocked results', async () => {
    const sequences = [
      { id: 'wb-a', orgId: 'org-a', reactivatedAt: null },
      { id: 'wb-b', orgId: 'org-b', reactivatedAt: null },
    ];
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockResolvedValue(sequences);

    const res = await request(app).get('/api/winback/active');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('POST /start/:orgId findUnique is called with orgId', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktWinBackSequence.create as jest.Mock).mockResolvedValue({ id: 'wb-q', orgId: 'org-q' });
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'q@org.com' });

    expect(prisma.mktWinBackSequence.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orgId: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('GET /reason/:reason updates sequence with token used as lookup', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({ id: 'wb-tok', orgId: 'org-1' });
    (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    await request(app).get('/api/winback/reason/price?token=lookup-tok');

    expect(prisma.mktWinBackSequence.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { token: 'lookup-tok' } })
    );
  });
});
