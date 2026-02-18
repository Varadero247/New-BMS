import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    crmPartner: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    crmReferral: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    crmCommission: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    crmDeal: {
      findFirst: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import partnersRouter from '../src/routes/partners';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/partners', partnersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockPartner = {
  id: '00000000-0000-0000-0000-000000000001',
  accountId: 'acc-1',
  tier: 'TIER_1_REFERRAL',
  status: 'ACTIVE',
  commissionRate: 25,
  bountyAmount: 500,
  commissionDuration: 12,
  totalReferrals: 3,
  totalCommissionPaid: 1500,
  notes: null,
  account: { id: 'acc-1', name: 'Partner Corp' },
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockDeal = {
  id: 'deal-1',
  value: 10000,
  status: 'OPEN',
  deletedAt: null,
};

// ===================================================================
// POST /api/partners
// ===================================================================

describe('POST /api/partners', () => {
  it('should register partner with tier config applied', async () => {
    (prisma as any).crmPartner.create.mockResolvedValue(mockPartner);

    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'TIER_1_REFERRAL',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect((prisma as any).crmPartner.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          commissionRate: 25,
          bountyAmount: 500,
          commissionDuration: 12,
        }),
      })
    );
  });

  it('should apply TIER_2_COSELL config', async () => {
    (prisma as any).crmPartner.create.mockResolvedValue({ ...mockPartner, tier: 'TIER_2_COSELL' });

    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'TIER_2_COSELL',
    });

    expect(res.status).toBe(201);
    expect((prisma as any).crmPartner.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          commissionRate: 32.5,
          bountyAmount: 750,
          commissionDuration: 18,
        }),
      })
    );
  });

  it('should apply TIER_3_RESELLER config', async () => {
    (prisma as any).crmPartner.create.mockResolvedValue({
      ...mockPartner,
      tier: 'TIER_3_RESELLER',
    });

    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'TIER_3_RESELLER',
    });

    expect(res.status).toBe(201);
    expect((prisma as any).crmPartner.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          commissionRate: 37.5,
          bountyAmount: 1000,
          commissionDuration: 24,
        }),
      })
    );
  });

  it('should return 400 for missing accountId', async () => {
    const res = await request(app).post('/api/partners').send({
      tier: 'TIER_1_REFERRAL',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing tier', async () => {
    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid tier', async () => {
    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'INVALID',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 409 for duplicate account', async () => {
    const uniqueError = new Error('Unique constraint');
    (uniqueError as any).code = 'P2002';
    (prisma as any).crmPartner.create.mockRejectedValue(uniqueError);

    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'TIER_1_REFERRAL',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('already registered');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmPartner.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'TIER_1_REFERRAL',
    });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/partners
// ===================================================================

describe('GET /api/partners', () => {
  it('should return paginated list', async () => {
    (prisma as any).crmPartner.findMany.mockResolvedValue([mockPartner]);
    (prisma as any).crmPartner.count.mockResolvedValue(1);

    const res = await request(app).get('/api/partners');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by tier', async () => {
    (prisma as any).crmPartner.findMany.mockResolvedValue([]);
    (prisma as any).crmPartner.count.mockResolvedValue(0);

    const res = await request(app).get('/api/partners?tier=TIER_2_COSELL');

    expect(res.status).toBe(200);
    expect((prisma as any).crmPartner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tier: 'TIER_2_COSELL' }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma as any).crmPartner.findMany.mockResolvedValue([]);
    (prisma as any).crmPartner.count.mockResolvedValue(0);

    const res = await request(app).get('/api/partners?status=ACTIVE');

    expect(res.status).toBe(200);
    expect((prisma as any).crmPartner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('should return empty array when none', async () => {
    (prisma as any).crmPartner.findMany.mockResolvedValue([]);
    (prisma as any).crmPartner.count.mockResolvedValue(0);

    const res = await request(app).get('/api/partners');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmPartner.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/partners');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/partners/leaderboard
// ===================================================================

describe('GET /api/partners/leaderboard', () => {
  it('should return partners ranked by totalReferrals', async () => {
    (prisma as any).crmPartner.findMany.mockResolvedValue([
      { ...mockPartner, totalReferrals: 10 },
      { ...mockPartner, id: 'partner-2', totalReferrals: 5 },
    ]);

    const res = await request(app).get('/api/partners/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should return empty array when no active partners', async () => {
    (prisma as any).crmPartner.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/partners/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmPartner.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/partners/leaderboard');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/partners/:id
// ===================================================================

describe('GET /api/partners/:id', () => {
  it('should return partner detail', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app).get('/api/partners/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/partners/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmPartner.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/partners/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/partners/:id/tier
// ===================================================================

describe('PUT /api/partners/:id/tier', () => {
  it('should upgrade partner tier', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);
    (prisma as any).crmPartner.update.mockResolvedValue({
      ...mockPartner,
      tier: 'TIER_2_COSELL',
      commissionRate: 32.5,
    });

    const res = await request(app)
      .put('/api/partners/00000000-0000-0000-0000-000000000001/tier')
      .send({
        tier: 'TIER_2_COSELL',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect((prisma as any).crmPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tier: 'TIER_2_COSELL',
          commissionRate: 32.5,
        }),
      })
    );
  });

  it('should return 400 for missing tier', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .put('/api/partners/00000000-0000-0000-0000-000000000001/tier')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid tier', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .put('/api/partners/00000000-0000-0000-0000-000000000001/tier')
      .send({
        tier: 'INVALID',
      });

    expect(res.status).toBe(400);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/partners/00000000-0000-0000-0000-000000000099/tier')
      .send({
        tier: 'TIER_2_COSELL',
      });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/partners/:id/referrals
// ===================================================================

describe('POST /api/partners/:id/referrals', () => {
  it('should log deal referral and create commission', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);
    (prisma as any).crmDeal.findFirst.mockResolvedValue(mockDeal);
    (prisma as any).crmReferral.create.mockResolvedValue({
      id: 'ref-1',
      partnerId: '00000000-0000-0000-0000-000000000001',
      dealId: 'deal-1',
      commissionAmount: 2500,
    });
    (prisma as any).crmPartner.update.mockResolvedValue({});
    (prisma as any).crmCommission.create.mockResolvedValue({ id: 'comm-1' });

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/referrals')
      .send({
        dealId: 'deal-1',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect((prisma as any).crmCommission.create).toHaveBeenCalled();
    expect((prisma as any).crmPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalReferrals: { increment: 1 } }),
      })
    );
  });

  it('should return 400 for missing dealId', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/referrals')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 when partner not found', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000099/referrals')
      .send({
        dealId: 'deal-1',
      });

    expect(res.status).toBe(404);
  });

  it('should return 404 when deal not found', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);
    (prisma as any).crmDeal.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/referrals')
      .send({
        dealId: 'nonexistent',
      });

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);
    (prisma as any).crmDeal.findFirst.mockResolvedValue(mockDeal);
    (prisma as any).crmReferral.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/referrals')
      .send({
        dealId: 'deal-1',
      });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/partners/:id/commissions
// ===================================================================

describe('GET /api/partners/:id/commissions', () => {
  it('should return commission ledger', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);
    (prisma as any).crmCommission.findMany.mockResolvedValue([
      { id: 'comm-1', amount: 2500, status: 'PENDING', referral: { deal: { value: 10000 } } },
    ]);
    (prisma as any).crmCommission.count.mockResolvedValue(1);

    const res = await request(app).get(
      '/api/partners/00000000-0000-0000-0000-000000000001/commissions'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should return empty array when no commissions', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);
    (prisma as any).crmCommission.findMany.mockResolvedValue([]);
    (prisma as any).crmCommission.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/partners/00000000-0000-0000-0000-000000000001/commissions'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 404 when partner not found', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/partners/00000000-0000-0000-0000-000000000099/commissions'
    );

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// POST /api/partners/:id/commissions/pay
// ===================================================================

describe('POST /api/partners/:id/commissions/pay', () => {
  it('should mark commissions as paid', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);
    (prisma as any).crmCommission.findFirst.mockResolvedValue({
      id: 'comm-1',
      amount: 2500,
      status: 'PENDING',
    });
    (prisma as any).crmCommission.update.mockResolvedValue({});
    (prisma as any).crmPartner.update.mockResolvedValue({});

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/commissions/pay')
      .send({
        commissionIds: ['comm-1'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paidCount).toBe(1);
  });

  it('should return 400 for missing commissionIds', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/commissions/pay')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for empty commissionIds array', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/commissions/pay')
      .send({
        commissionIds: [],
      });

    expect(res.status).toBe(400);
  });

  it('should return 404 when partner not found', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000099/commissions/pay')
      .send({
        commissionIds: ['comm-1'],
      });

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).crmPartner.findFirst.mockResolvedValue(mockPartner);
    (prisma as any).crmCommission.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/commissions/pay')
      .send({
        commissionIds: ['comm-1'],
      });

    expect(res.status).toBe(500);
  });
});
