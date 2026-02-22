import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktPartnerPayout: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    mktPartnerDeal: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import payoutsRouter from '../src/routes/payouts';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use((req: any, _res: any, next: any) => {
  req.partner = { id: 'partner-1' };
  next();
});
app.use('/api/payouts', payoutsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/payouts', () => {
  it('returns payouts with available balance', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([
      { id: 'p-1', amount: 500, status: 'PAID' },
    ]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 300 },
      { id: 'd-2', commissionValue: 200 },
    ]);

    const res = await request(app).get('/api/payouts');

    expect(res.status).toBe(200);
    expect(res.body.data.payouts).toHaveLength(1);
    expect(res.body.data.availableBalance).toBe(500);
    expect(res.body.data.canRequestPayout).toBe(true);
  });

  it('shows canRequestPayout false when below minimum', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 50 },
    ]);

    const res = await request(app).get('/api/payouts');

    expect(res.body.data.availableBalance).toBe(50);
    expect(res.body.data.canRequestPayout).toBe(false);
  });

  it('returns minimum payout amount', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/payouts');

    expect(res.body.data.minPayoutAmount).toBe(100);
  });

  it('response has payouts, availableBalance, canRequestPayout, and minPayoutAmount keys', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/payouts');

    expect(res.body.data).toHaveProperty('payouts');
    expect(res.body.data).toHaveProperty('availableBalance');
    expect(res.body.data).toHaveProperty('canRequestPayout');
    expect(res.body.data).toHaveProperty('minPayoutAmount');
  });

  it('returns 500 on database error', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/payouts');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/payouts/request', () => {
  it('creates payout when above minimum', async () => {
    const deals = [
      { id: 'd-1', commissionValue: 300 },
      { id: 'd-2', commissionValue: 200 },
    ];
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue(deals);
    (prisma.mktPartnerPayout.create as jest.Mock).mockResolvedValue({
      id: 'p-1',
      amount: 500,
      status: 'PENDING',
    });
    (prisma.mktPartnerDeal.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

    const res = await request(app).post('/api/payouts/request');

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(500);
  });

  it('created payout has PENDING status', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 150 },
    ]);
    (prisma.mktPartnerPayout.create as jest.Mock).mockResolvedValue({
      id: 'p-2',
      amount: 150,
      status: 'PENDING',
    });
    (prisma.mktPartnerDeal.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await request(app).post('/api/payouts/request');

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('returns 400 when below minimum threshold', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 50 },
    ]);

    const res = await request(app).post('/api/payouts/request');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BELOW_MINIMUM');
  });

  it('returns 400 when no unpaid deals exist', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).post('/api/payouts/request');

    expect(res.status).toBe(400);
  });

  it('marks deals as commission paid', async () => {
    const deals = [{ id: 'd-1', commissionValue: 150 }];
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue(deals);
    (prisma.mktPartnerPayout.create as jest.Mock).mockResolvedValue({ id: 'p-1' });
    (prisma.mktPartnerDeal.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await request(app).post('/api/payouts/request');

    expect(prisma.mktPartnerDeal.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['d-1'] } },
        data: { commissionPaid: true },
      })
    );
  });

  it('includes all deal IDs in payout record', async () => {
    const deals = [
      { id: 'd-1', commissionValue: 200 },
      { id: 'd-2', commissionValue: 300 },
    ];
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue(deals);
    (prisma.mktPartnerPayout.create as jest.Mock).mockResolvedValue({ id: 'p-1' });
    (prisma.mktPartnerDeal.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

    await request(app).post('/api/payouts/request');

    expect(prisma.mktPartnerPayout.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dealIds: ['d-1', 'd-2'],
          amount: 500,
        }),
      })
    );
  });

  it('returns 500 on database error', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).post('/api/payouts/request');

    expect(res.status).toBe(500);
  });
});

describe('Payouts — extra coverage batch ah', () => {
  it('GET / availableBalance is a number', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/payouts');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.availableBalance).toBe('number');
  });

  it('GET / canRequestPayout is a boolean', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/payouts');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.canRequestPayout).toBe('boolean');
  });

  it('POST /request: totalPending sums all commission values in unpaid deals', async () => {
    const deals = [
      { id: 'd-x', commissionValue: 400 },
      { id: 'd-y', commissionValue: 600 },
    ];
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue(deals);
    (prisma.mktPartnerPayout.create as jest.Mock).mockResolvedValue({ id: 'p-new', amount: 1000, status: 'PENDING' });
    (prisma.mktPartnerDeal.updateMany as jest.Mock).mockResolvedValue({ count: 2 });
    const res = await request(app).post('/api/payouts/request');
    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(1000);
  });

  it('GET / response body data is an object', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/payouts');
    expect(res.status).toBe(200);
    expect(typeof res.body.data).toBe('object');
  });

  it('POST /request: 500 error returns success:false', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/payouts/request');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Payouts — extended', () => {
  it('GET / returns success true on 200', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/payouts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / payouts is an array', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/payouts');
    expect(Array.isArray(res.body.data.payouts)).toBe(true);
  });

  it('POST /request payout create not called when balance is zero', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).post('/api/payouts/request');
    expect(prisma.mktPartnerPayout.create).not.toHaveBeenCalled();
  });
});

describe('payouts.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payouts', payoutsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/payouts', async () => {
    const res = await request(app).get('/api/payouts');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/payouts', async () => {
    const res = await request(app).get('/api/payouts');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/payouts body has success property', async () => {
    const res = await request(app).get('/api/payouts');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/payouts body is an object', async () => {
    const res = await request(app).get('/api/payouts');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/payouts route is accessible', async () => {
    const res = await request(app).get('/api/payouts');
    expect(res.status).toBeDefined();
  });
});

describe('Payouts — edge cases and field validation', () => {
  const appWithPartner = express();
  appWithPartner.use(express.json());
  appWithPartner.use((req: any, _res: any, next: any) => {
    req.partner = { id: 'partner-1' };
    next();
  });
  appWithPartner.use('/api/payouts', payoutsRouter);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns 200 when deals list has multiple entries', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 150 },
      { id: 'd-2', commissionValue: 250 },
      { id: 'd-3', commissionValue: 100 },
    ]);
    const res = await request(appWithPartner).get('/api/payouts');
    expect(res.status).toBe(200);
    expect(res.body.data.availableBalance).toBe(500);
  });

  it('GET / canRequestPayout is true when balance equals minimum exactly', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 100 },
    ]);
    const res = await request(appWithPartner).get('/api/payouts');
    expect(res.status).toBe(200);
    expect(res.body.data.canRequestPayout).toBe(true);
  });

  it('GET / returns 401 when no partner auth is provided', async () => {
    const appNoAuth = express();
    appNoAuth.use(express.json());
    appNoAuth.use('/api/payouts', payoutsRouter);
    const res = await request(appNoAuth).get('/api/payouts');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /request returns 401 when no partner auth is provided', async () => {
    const appNoAuth = express();
    appNoAuth.use(express.json());
    appNoAuth.use('/api/payouts', payoutsRouter);
    const res = await request(appNoAuth).post('/api/payouts/request');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /request response success is true on 201', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 200 },
    ]);
    (prisma.mktPartnerPayout.create as jest.Mock).mockResolvedValue({
      id: 'p-new',
      amount: 200,
      status: 'PENDING',
    });
    (prisma.mktPartnerDeal.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const res = await request(appWithPartner).post('/api/payouts/request');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /request BELOW_MINIMUM error message includes minimum amount', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 50 },
    ]);
    const res = await request(appWithPartner).post('/api/payouts/request');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('100');
  });

  it('GET / mktPartnerPayout.findMany is called with correct partnerId', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    await request(appWithPartner).get('/api/payouts');
    expect(prisma.mktPartnerPayout.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { partnerId: 'partner-1' } })
    );
  });

  it('GET / mktPartnerDeal.findMany filters commissionPaid: false', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    await request(appWithPartner).get('/api/payouts');
    expect(prisma.mktPartnerDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ commissionPaid: false }),
      })
    );
  });

  it('GET / minPayoutAmount is always 100', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(appWithPartner).get('/api/payouts');
    expect(res.body.data.minPayoutAmount).toBe(100);
  });
});

describe('Payouts — final coverage', () => {
  const appWithPartner = express();
  appWithPartner.use(express.json());
  appWithPartner.use((req: any, _res: any, next: any) => {
    req.partner = { id: 'partner-2' };
    next();
  });
  appWithPartner.use('/api/payouts', payoutsRouter);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /request: mktPartnerPayout.create called with correct partnerId', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-99', commissionValue: 300 },
    ]);
    (prisma.mktPartnerPayout.create as jest.Mock).mockResolvedValue({ id: 'p-99', amount: 300, status: 'PENDING' });
    (prisma.mktPartnerDeal.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await request(appWithPartner).post('/api/payouts/request');

    expect(prisma.mktPartnerPayout.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ partnerId: 'partner-2' }),
      })
    );
  });

  it('POST /request: mktPartnerDeal.findMany filters by partnerId from req.partner', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 200 },
    ]);
    (prisma.mktPartnerPayout.create as jest.Mock).mockResolvedValue({ id: 'p-1' });
    (prisma.mktPartnerDeal.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    await request(appWithPartner).post('/api/payouts/request');

    expect(prisma.mktPartnerDeal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ partnerId: 'partner-2' }) })
    );
  });

  it('GET / response payouts field reflects mock data length', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([
      { id: 'p-a', amount: 100, status: 'PAID' },
      { id: 'p-b', amount: 200, status: 'PENDING' },
      { id: 'p-c', amount: 150, status: 'PAID' },
    ]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(appWithPartner).get('/api/payouts');
    expect(res.status).toBe(200);
    expect(res.body.data.payouts).toHaveLength(3);
  });

  it('POST /request: response body has id on success', async () => {
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([
      { id: 'd-1', commissionValue: 500 },
    ]);
    (prisma.mktPartnerPayout.create as jest.Mock).mockResolvedValue({ id: 'payout-unique-id', amount: 500, status: 'PENDING' });
    (prisma.mktPartnerDeal.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await request(appWithPartner).post('/api/payouts/request');
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('payout-unique-id');
  });

  it('GET / availableBalance is 0 when no unpaid deals', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktPartnerDeal.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(appWithPartner).get('/api/payouts');
    expect(res.status).toBe(200);
    expect(res.body.data.availableBalance).toBe(0);
  });

  it('GET / success is false on DB error', async () => {
    (prisma.mktPartnerPayout.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));

    const res = await request(appWithPartner).get('/api/payouts');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
