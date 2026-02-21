import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktPartner: {
      findUnique: jest.fn(),
    },
    mktPartnerDeal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import dealsRouter from '../src/routes/deals';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
// Mock partner auth
app.use((req: any, _res: any, next: any) => {
  req.partner = { id: 'partner-1' };
  next();
});
app.use('/api/deals', dealsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockDeal = {
  id: '00000000-0000-0000-0000-000000000001',
  partnerId: 'partner-1',
  companyName: 'ClientCo',
  contactName: 'Jane Client',
  contactEmail: 'jane@client.com',
  estimatedUsers: 20,
  isoStandards: ['9001', '14001'],
  estimatedACV: 12000,
  status: 'SUBMITTED',
  commissionRate: 0.25,
  commissionValue: null,
  commissionPaid: false,
  createdAt: new Date(),
};

describe('POST /api/deals', () => {
  it('creates a deal with valid data', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({
      id: 'partner-1',
      tier: 'REFERRAL',
    });
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockDeal);

    const res = await request(app)
      .post('/api/deals')
      .send({
        companyName: 'ClientCo',
        contactName: 'Jane Client',
        contactEmail: 'jane@client.com',
        estimatedUsers: 20,
        isoStandards: ['9001', '14001'],
        estimatedACV: 12000,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.companyName).toBe('ClientCo');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/deals').send({ companyName: 'ClientCo' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/deals')
      .send({
        companyName: 'Co',
        contactName: 'Jane',
        contactEmail: 'not-email',
        estimatedUsers: 10,
        isoStandards: ['9001'],
      });

    expect(res.status).toBe(400);
  });

  it('sets commission rate from partner tier', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({
      id: 'partner-1',
      tier: 'RESELLER',
    });
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockDeal);

    await request(app)
      .post('/api/deals')
      .send({
        companyName: 'Co',
        contactName: 'Jane',
        contactEmail: 'jane@co.com',
        estimatedUsers: 10,
        isoStandards: ['9001'],
      });

    expect(prisma.mktPartnerDeal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ commissionRate: 0.375 }),
      })
    );
  });

  it('requires at least one ISO standard', async () => {
    const res = await request(app).post('/api/deals').send({
      companyName: 'Co',
      contactName: 'Jane',
      contactEmail: 'jane@co.com',
      estimatedUsers: 10,
      isoStandards: [],
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/deals', () => {
  it('returns deals with summary', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { ...mockDeal, status: 'SUBMITTED' },
      { ...mockDeal, id: 'deal-2', status: 'CLOSED_WON', commissionValue: 3000 },
    ]);

    const res = await request(app).get('/api/deals');

    expect(res.status).toBe(200);
    expect(res.body.data.deals).toHaveLength(2);
    expect(res.body.data.summary.closedWon).toBe(1);
    expect(res.body.data.summary.totalCommission).toBe(3000);
  });

  it('filters by status', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/deals?status=SUBMITTED');

    expect(prisma.mktPartnerDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { partnerId: 'partner-1', status: 'SUBMITTED' } })
    );
  });
});

describe('PATCH /api/deals/:id/status', () => {
  it('transitions SUBMITTED → IN_DEMO', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'SUBMITTED',
    });
    (prisma.mktPartnerDeal.update as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'IN_DEMO',
    });

    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'IN_DEMO' });

    expect(res.status).toBe(200);
  });

  it('transitions IN_DEMO → NEGOTIATING', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'IN_DEMO',
    });
    (prisma.mktPartnerDeal.update as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'NEGOTIATING',
    });

    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'NEGOTIATING' });

    expect(res.status).toBe(200);
  });

  it('calculates commission on CLOSED_WON', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'NEGOTIATING',
      estimatedACV: 10000,
      commissionRate: 0.25,
    });
    (prisma.mktPartnerDeal.update as jest.Mock).mockResolvedValue({});

    await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'CLOSED_WON', actualACV: 15000 });

    expect(prisma.mktPartnerDeal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CLOSED_WON',
          actualACV: 15000,
          commissionValue: 3750, // 15000 * 0.25
          closedAt: expect.any(Date),
        }),
      })
    );
  });

  it('rejects invalid transition SUBMITTED → CLOSED_WON', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'SUBMITTED',
    });

    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'CLOSED_WON' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });

  it('rejects transition from CLOSED_WON', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'CLOSED_WON',
    });

    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'SUBMITTED' });

    expect(res.status).toBe(400);
  });

  it('rejects transition from CLOSED_LOST', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'CLOSED_LOST',
    });

    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'IN_DEMO' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent deal', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000099/status')
      .send({ status: 'IN_DEMO' });

    expect(res.status).toBe(404);
  });

  it('returns 404 when deal belongs to different partner', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({
      ...mockDeal,
      partnerId: 'other-partner',
    });

    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'IN_DEMO' });

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST /api/deals returns 500 when create fails', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ id: 'partner-1', tier: 'REFERRAL' });
    (prisma.mktPartnerDeal.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/deals').send({
      companyName: 'ClientCo',
      contactName: 'Jane Client',
      contactEmail: 'jane@client.com',
      estimatedUsers: 20,
      isoStandards: ['9001'],
      estimatedACV: 12000,
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/deals returns 500 on DB error', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/deals');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
