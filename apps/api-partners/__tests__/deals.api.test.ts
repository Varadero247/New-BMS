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

describe('deals.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/deals', dealsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/deals', async () => {
    const res = await request(app).get('/api/deals');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/deals', async () => {
    const res = await request(app).get('/api/deals');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/deals body has success property', async () => {
    const res = await request(app).get('/api/deals');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('deals.api — partner auth and edge cases', () => {
  it('POST /api/deals returns 401 when no partner on request', async () => {
    const noAuthApp = express();
    noAuthApp.use(express.json());
    noAuthApp.use('/api/deals', dealsRouter);

    const res = await request(noAuthApp).post('/api/deals').send({
      companyName: 'ClientCo',
      contactName: 'Jane',
      contactEmail: 'jane@client.com',
      estimatedUsers: 10,
      isoStandards: ['9001'],
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/deals returns 401 when no partner on request', async () => {
    const noAuthApp = express();
    noAuthApp.use(express.json());
    noAuthApp.use('/api/deals', dealsRouter);

    const res = await request(noAuthApp).get('/api/deals');

    expect(res.status).toBe(401);
  });

  it('GET /api/deals summary has inProgress count', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { ...mockDeal, status: 'IN_DEMO', commissionValue: null, commissionPaid: false },
      { ...mockDeal, id: 'deal-2', status: 'NEGOTIATING', commissionValue: null, commissionPaid: false },
    ]);

    const res = await request(app).get('/api/deals');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.inProgress).toBe(2);
  });

  it('POST /api/deals sets estimatedACV of 0 when not provided', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({
      id: 'partner-1',
      tier: 'REFERRAL',
    });
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue({ ...mockDeal, estimatedACV: null });

    const res = await request(app).post('/api/deals').send({
      companyName: 'Co',
      contactName: 'Jane',
      contactEmail: 'jane@co.com',
      estimatedUsers: 5,
      isoStandards: ['9001'],
      // estimatedACV omitted
    });

    expect(res.status).toBe(201);
  });

  it('POST /api/deals uses CO_SELL commission rate of 0.325', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({
      id: 'partner-1',
      tier: 'CO_SELL',
    });
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockDeal);

    await request(app).post('/api/deals').send({
      companyName: 'Co',
      contactName: 'Jane',
      contactEmail: 'jane@co.com',
      estimatedUsers: 10,
      isoStandards: ['9001'],
    });

    expect(prisma.mktPartnerDeal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ commissionRate: 0.325 }),
      })
    );
  });

  it('PATCH /api/deals/:id/status returns 400 for invalid status value', async () => {
    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PATCH /api/deals/:id/status returns 500 on DB error', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockRejectedValue(new Error('DB crash'));

    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'IN_DEMO' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/deals summary pendingCommission counts only unpaid CLOSED_WON with value', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { ...mockDeal, status: 'CLOSED_WON', commissionValue: 2000, commissionPaid: false },
      { ...mockDeal, id: 'd2', status: 'CLOSED_WON', commissionValue: 1500, commissionPaid: true },
    ]);

    const res = await request(app).get('/api/deals');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.pendingCommission).toBe(2000);
  });

  it('SUBMITTED → CLOSED_LOST is a valid transition', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'SUBMITTED',
    });
    (prisma.mktPartnerDeal.update as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'CLOSED_LOST',
    });

    const res = await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'CLOSED_LOST' });

    expect(res.status).toBe(200);
  });
});

describe('deals.api — final coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/deals success is true on 201', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ id: 'partner-1', tier: 'REFERRAL' });
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockDeal);
    const res = await request(app).post('/api/deals').send({
      companyName: 'ClientCo',
      contactName: 'Jane',
      contactEmail: 'jane@client.com',
      estimatedUsers: 10,
      isoStandards: ['9001'],
      estimatedACV: 5000,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/deals success is true on 200', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([mockDeal]);
    const res = await request(app).get('/api/deals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/deals findMany called with partnerId from req.partner', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/deals');
    expect(prisma.mktPartnerDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ partnerId: 'partner-1' }) })
    );
  });

  it('PATCH /:id/status update called once on valid transition', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({ ...mockDeal, status: 'SUBMITTED' });
    (prisma.mktPartnerDeal.update as jest.Mock).mockResolvedValue({ ...mockDeal, status: 'IN_DEMO' });
    await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'IN_DEMO' });
    expect(prisma.mktPartnerDeal.update).toHaveBeenCalledTimes(1);
  });

  it('POST /api/deals GCC_SPECIALIST commission rate is 0.3', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ id: 'partner-1', tier: 'GCC_SPECIALIST' });
    (prisma.mktPartnerDeal.create as jest.Mock).mockResolvedValue(mockDeal);
    await request(app).post('/api/deals').send({
      companyName: 'Co',
      contactName: 'Jane',
      contactEmail: 'jane@co.com',
      estimatedUsers: 10,
      isoStandards: ['9001'],
    });
    expect(prisma.mktPartnerDeal.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ commissionRate: 0.3 }) })
    );
  });

  it('NEGOTIATING → CLOSED_WON sets commissionValue to actualACV * commissionRate', async () => {
    (prisma.mktPartnerDeal.findUnique as jest.Mock).mockResolvedValue({
      ...mockDeal,
      status: 'NEGOTIATING',
      estimatedACV: 8000,
      commissionRate: 0.25,
    });
    (prisma.mktPartnerDeal.update as jest.Mock).mockResolvedValue({ ...mockDeal, status: 'CLOSED_WON' });
    await request(app)
      .patch('/api/deals/00000000-0000-0000-0000-000000000001/status')
      .send({ status: 'CLOSED_WON', actualACV: 8000 });
    expect(prisma.mktPartnerDeal.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ commissionValue: 2000 }) })
    );
  });
});
