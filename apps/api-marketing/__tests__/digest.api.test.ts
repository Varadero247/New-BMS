import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktLead: {
      count: jest.fn(),
    },
    mktEmailLog: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    mktWinBackSequence: {
      count: jest.fn(),
    },
    mktRenewalSequence: {
      count: jest.fn(),
    },
    mktHealthScore: {
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

jest.mock('../src/config', () => ({
  AutomationConfig: {
    founder: { email: 'founder@test.com' },
    health: { criticalThreshold: 40 },
  },
}));

import digestRouter from '../src/routes/digest';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/digest', digestRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/digest/trigger', () => {
  it('generates digest data', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(5);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(20);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(3);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(2);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).post('/api/digest/trigger');

    expect(res.status).toBe(200);
    expect(res.body.data.yesterday.newLeads).toBe(5);
    expect(res.body.data.today.activeWinBacks).toBe(3);
  });

  it('logs digest to email log', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).post('/api/digest/trigger');

    expect(prisma.mktEmailLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          template: 'daily_digest',
          email: 'founder@test.com',
        }),
      })
    );
  });

  it('returns 500 on error', async () => {
    (prisma.mktLead.count as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).post('/api/digest/trigger');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/digest/history', () => {
  it('returns digest email history', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([
      { id: 'log-1', template: 'daily_digest', sentAt: new Date() },
    ]);

    const res = await request(app).get('/api/digest/history');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by daily_digest template', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/digest/history');

    expect(prisma.mktEmailLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { template: 'daily_digest' } })
    );
  });

  it('returns 500 on DB error for history', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/digest/history');
    expect(res.status).toBe(500);
  });

  it('returns empty list when no digest history exists', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/digest/history');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('Digest — extended', () => {
  it('trigger response has yesterday and today keys', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post('/api/digest/trigger');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('yesterday');
    expect(res.body.data).toHaveProperty('today');
  });

  it('history data is an array', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/digest/history');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('trigger success is true on 200', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(2);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(10);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-2' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(1);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(1);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post('/api/digest/trigger');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Digest — further extended', () => {
  it('yesterday.newLeads is a number', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(7);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-3' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post('/api/digest/trigger');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.yesterday.newLeads).toBe('number');
  });

  it('mktEmailLog.create is called once per trigger', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-4' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).post('/api/digest/trigger');
    expect(prisma.mktEmailLog.create).toHaveBeenCalledTimes(1);
  });

  it('history success is true', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/digest/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('today.activeWinBacks is a number', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-5' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(5);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post('/api/digest/trigger');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.today.activeWinBacks).toBe('number');
  });

  it('history returns 500 on DB failure', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockRejectedValue(new Error('DB gone'));
    const res = await request(app).get('/api/digest/history');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Digest — additional coverage', () => {
  it('trigger response includes a date field formatted as YYYY-MM-DD', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post('/api/digest/trigger');
    expect(res.status).toBe(200);
    expect(res.body.data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('trigger sets upcomingRenewals from mktRenewalSequence.count', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(4);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).post('/api/digest/trigger');
    expect(res.status).toBe(200);
    expect(res.body.data.today.upcomingRenewals).toBe(4);
  });

  it('trigger sets criticalCustomers to health score result length', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([
      { userId: 'u1', score: 20 },
      { userId: 'u2', score: 30 },
    ]);
    const res = await request(app).post('/api/digest/trigger');
    expect(res.status).toBe(200);
    expect(res.body.data.today.criticalCustomers).toBe(2);
  });

  it('trigger calls mktHealthScore.findMany with take:5 and distinct userId', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.create as jest.Mock).mockResolvedValue({ id: 'log-1' });
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).post('/api/digest/trigger');
    expect(prisma.mktHealthScore.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5, distinct: ['userId'] })
    );
  });

  it('history respects take:30 with sentAt desc ordering', async () => {
    (prisma.mktEmailLog.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/digest/history');
    expect(prisma.mktEmailLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { sentAt: 'desc' }, take: 30 })
    );
  });
});
