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

  it('GET /api/commission/history returns 500 on DB error', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/commission/history');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/commission/pending returns 500 on DB error', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/commission/pending');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Response shape', () => {
  it('summary has totalEarned, totalPaid, pendingPayout properties', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/commission/summary');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalEarned');
    expect(res.body.data).toHaveProperty('totalPaid');
    expect(res.body.data).toHaveProperty('pendingPayout');
  });

  it('commission history data is an array', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/commission/history');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('pending.deals is an array', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/commission/pending');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.deals)).toBe(true);
  });
});

describe('Commission — extended', () => {
  it('summary success is true on 200', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/commission/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('summary totalEarned is a number', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue(mockDeals);
    const res = await request(app).get('/api/commission/summary');
    expect(typeof res.body.data.totalEarned).toBe('number');
  });

  it('history success is true on 200', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/commission/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('pending totalPending is a number', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/commission/pending');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalPending).toBe('number');
  });
});

describe('Commission — additional coverage', () => {
  it('summary: dealsWon is 0 when all deals are in pipeline', async () => {
    const pipelineDeals = [
      { ...mockDeals[2], id: 'p1', status: 'IN_DEMO' },
      { ...mockDeals[2], id: 'p2', status: 'SUBMITTED' },
    ];
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue(pipelineDeals);

    const res = await request(app).get('/api/commission/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.dealsWon).toBe(0);
    expect(res.body.data.dealsInPipeline).toBe(2);
  });

  it('summary: pendingPayout equals totalEarned when nothing is paid', async () => {
    const unpaidDeal = {
      ...mockDeals[0],
      commissionPaid: false,
      commissionValue: 4000,
    };
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([unpaidDeal]);

    const res = await request(app).get('/api/commission/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.pendingPayout).toBe(res.body.data.totalEarned);
  });

  it('summary: pipelineValue is 0 when no pipeline deals', async () => {
    const wonDeals = [mockDeals[0], mockDeals[1]];
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue(wonDeals);

    const res = await request(app).get('/api/commission/summary');

    expect(res.status).toBe(200);
    expect(res.body.data.pipelineValue).toBe(0);
  });

  it('pending: deals array contains only unpaid entries', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([mockDeals[1]]);

    const res = await request(app).get('/api/commission/pending');

    expect(res.status).toBe(200);
    expect(res.body.data.deals.every((d: { commissionPaid: boolean }) => !d.commissionPaid)).toBe(true);
  });

  it('history: response data items have commissionValue property', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([mockDeals[0]]);

    const res = await request(app).get('/api/commission/history');

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('commissionValue');
  });
});
