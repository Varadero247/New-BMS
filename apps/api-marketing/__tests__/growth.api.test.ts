import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktLead: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    mktHealthScore: {
      findMany: jest.fn(),
    },
    mktPartner: {
      count: jest.fn(),
    },
    mktPartnerDeal: {
      count: jest.fn(),
    },
    mktRenewalSequence: {
      count: jest.fn(),
    },
    mktWinBackSequence: {
      count: jest.fn(),
    },
    mktEmailLog: {
      count: jest.fn(),
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

import growthRouter from '../src/routes/growth';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/growth', growthRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/growth/metrics', () => {
  it('returns aggregated metrics', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(100);
    (prisma.mktLead.groupBy as jest.Mock).mockResolvedValue([
      { source: 'ROI_CALCULATOR', _count: 40 },
      { source: 'CHATBOT', _count: 30 },
    ]);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([
      { userId: 'u1', score: 80 },
      { userId: 'u2', score: 50 },
    ]);
    (prisma.mktPartner.count as jest.Mock).mockResolvedValue(10);
    (prisma.mktPartnerDeal.count as jest.Mock).mockResolvedValue(25);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(5);
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(3);

    const res = await request(app).get('/api/growth/metrics');

    expect(res.status).toBe(200);
    expect(res.body.data.leads.total).toBe(100);
    expect(res.body.data.health.total).toBe(2);
    expect(res.body.data.partners.total).toBe(10);
  });

  it('calculates health distribution correctly', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktLead.groupBy as jest.Mock).mockResolvedValue([]);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([
      { userId: 'u1', score: 85 },
      { userId: 'u2', score: 55 },
      { userId: 'u3', score: 25 },
    ]);
    (prisma.mktPartner.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktPartnerDeal.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/growth/metrics');

    expect(res.body.data.health.healthy).toBe(1);
    expect(res.body.data.health.atRisk).toBe(1);
    expect(res.body.data.health.critical).toBe(1);
  });

  it('returns 500 on error', async () => {
    (prisma.mktLead.count as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/api/growth/metrics');

    expect(res.status).toBe(500);
  });

  it('data.health has total property', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktLead.groupBy as jest.Mock).mockResolvedValue([]);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartner.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktPartnerDeal.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data.health).toHaveProperty('total');
  });

  it('partners.total reflects mock partner count', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktLead.groupBy as jest.Mock).mockResolvedValue([]);
    (prisma.mktHealthScore.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartner.count as jest.Mock).mockResolvedValue(12);
    (prisma.mktPartnerDeal.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktRenewalSequence.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktWinBackSequence.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/growth/metrics');
    expect(res.status).toBe(200);
    expect(res.body.data.partners.total).toBe(12);
  });
});

describe('GET /api/growth/snapshot/:date', () => {
  it('returns snapshot for valid date', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(5);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(10);

    const res = await request(app).get('/api/growth/snapshot/2026-02-15');

    expect(res.status).toBe(200);
    expect(res.body.data.date).toBe('2026-02-15');
    expect(res.body.data.leads).toBe(5);
    expect(res.body.data.emailsSent).toBe(10);
  });

  it('returns 400 for invalid date', async () => {
    const res = await request(app).get('/api/growth/snapshot/not-a-date');

    expect(res.status).toBe(400);
  });

  it('snapshot data has date, leads, and emailsSent properties', async () => {
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);
    (prisma.mktEmailLog.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/growth/snapshot/2026-01-01');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('date');
    expect(res.body.data).toHaveProperty('leads');
    expect(res.body.data).toHaveProperty('emailsSent');
  });
});
