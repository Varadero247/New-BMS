import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktPartnerDeal: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import commissionRouter from '../src/routes/commission';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use((req: any, _res: any, next: any) => {
  req.partner = { id: 'partner-1' };
  next();
});
app.use('/api/commission', commissionRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockDeals = [
  {
    id: 'd1',
    partnerId: 'partner-1',
    status: 'CLOSED_WON',
    commissionValue: 3000,
    commissionPaid: true,
    commissionRate: 0.25,
    estimatedACV: 12000,
    actualACV: 12000,
    companyName: 'Co A',
    closedAt: new Date(),
  },
  {
    id: 'd2',
    partnerId: 'partner-1',
    status: 'CLOSED_WON',
    commissionValue: 5000,
    commissionPaid: false,
    commissionRate: 0.25,
    estimatedACV: 20000,
    actualACV: 20000,
    companyName: 'Co B',
    closedAt: new Date(),
  },
  {
    id: 'd3',
    partnerId: 'partner-1',
    status: 'NEGOTIATING',
    commissionValue: null,
    commissionPaid: false,
    commissionRate: 0.25,
    estimatedACV: 10000,
    actualACV: null,
    companyName: 'Co C',
    closedAt: null,
  },
];

describe('GET /api/commission/summary', () => {
  it('returns correct commission summary', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue(mockDeals);
    const res = await request(app).get('/api/commission/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.totalEarned).toBe(8000);
    expect(res.body.data.totalPaid).toBe(3000);
    expect(res.body.data.pendingPayout).toBe(5000);
    expect(res.body.data.dealsWon).toBe(2);
    expect(res.body.data.dealsInPipeline).toBe(1);
    expect(res.body.data.pipelineValue).toBe(2500); // 10000 * 0.25
  });
});

describe('GET /api/commission/history', () => {
  it('returns commission history for won deals', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([mockDeals[0], mockDeals[1]]);
    const res = await request(app).get('/api/commission/history');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('returns empty when no won deals', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/commission/history');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/commission/pending', () => {
  it('returns unpaid commission deals', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([mockDeals[1]]);
    const res = await request(app).get('/api/commission/pending');
    expect(res.status).toBe(200);
    expect(res.body.data.totalPending).toBe(5000);
    expect(res.body.data.deals).toHaveLength(1);
  });
});

describe('Auth guard', () => {
  it('returns 401 without partner on request', async () => {
    const noAuthApp = express();
    noAuthApp.use(express.json());
    noAuthApp.use('/api/commission', commissionRouter);

    const res = await request(noAuthApp).get('/api/commission/summary');
    expect(res.status).toBe(401);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET /api/commission/summary returns 500 on DB error', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/commission/summary');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
