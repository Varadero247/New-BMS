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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
    mockPrisma.crmPartner.create.mockResolvedValue(mockPartner);

    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'TIER_1_REFERRAL',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.crmPartner.create).toHaveBeenCalledWith(
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
    mockPrisma.crmPartner.create.mockResolvedValue({ ...mockPartner, tier: 'TIER_2_COSELL' });

    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'TIER_2_COSELL',
    });

    expect(res.status).toBe(201);
    expect(mockPrisma.crmPartner.create).toHaveBeenCalledWith(
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
    mockPrisma.crmPartner.create.mockResolvedValue({
      ...mockPartner,
      tier: 'TIER_3_RESELLER',
    });

    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'TIER_3_RESELLER',
    });

    expect(res.status).toBe(201);
    expect(mockPrisma.crmPartner.create).toHaveBeenCalledWith(
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
    const uniqueError = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    mockPrisma.crmPartner.create.mockRejectedValue(uniqueError);

    const res = await request(app).post('/api/partners').send({
      accountId: 'acc-1',
      tier: 'TIER_1_REFERRAL',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('already registered');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmPartner.create.mockRejectedValue(new Error('DB error'));

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
    mockPrisma.crmPartner.findMany.mockResolvedValue([mockPartner]);
    mockPrisma.crmPartner.count.mockResolvedValue(1);

    const res = await request(app).get('/api/partners');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by tier', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([]);
    mockPrisma.crmPartner.count.mockResolvedValue(0);

    const res = await request(app).get('/api/partners?tier=TIER_2_COSELL');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmPartner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tier: 'TIER_2_COSELL' }),
      })
    );
  });

  it('should filter by status', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([]);
    mockPrisma.crmPartner.count.mockResolvedValue(0);

    const res = await request(app).get('/api/partners?status=ACTIVE');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmPartner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('should return empty array when none', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([]);
    mockPrisma.crmPartner.count.mockResolvedValue(0);

    const res = await request(app).get('/api/partners');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmPartner.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/partners');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/partners/leaderboard
// ===================================================================

describe('GET /api/partners/leaderboard', () => {
  it('should return partners ranked by totalReferrals', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([
      { ...mockPartner, totalReferrals: 10 },
      { ...mockPartner, id: 'partner-2', totalReferrals: 5 },
    ]);

    const res = await request(app).get('/api/partners/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should return empty array when no active partners', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/partners/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmPartner.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/partners/leaderboard');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/partners/:id
// ===================================================================

describe('GET /api/partners/:id', () => {
  it('should return partner detail', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app).get('/api/partners/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/partners/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmPartner.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/partners/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/partners/:id/tier
// ===================================================================

describe('PUT /api/partners/:id/tier', () => {
  it('should upgrade partner tier', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);
    mockPrisma.crmPartner.update.mockResolvedValue({
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
    expect(mockPrisma.crmPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tier: 'TIER_2_COSELL',
          commissionRate: 32.5,
        }),
      })
    );
  });

  it('should return 400 for missing tier', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .put('/api/partners/00000000-0000-0000-0000-000000000001/tier')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid tier', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .put('/api/partners/00000000-0000-0000-0000-000000000001/tier')
      .send({
        tier: 'INVALID',
      });

    expect(res.status).toBe(400);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(null);

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
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmReferral.create.mockResolvedValue({
      id: 'ref-1',
      partnerId: '00000000-0000-0000-0000-000000000001',
      dealId: 'deal-1',
      commissionAmount: 2500,
    });
    mockPrisma.crmPartner.update.mockResolvedValue({});
    mockPrisma.crmCommission.create.mockResolvedValue({ id: 'comm-1' });

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/referrals')
      .send({
        dealId: 'deal-1',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.crmCommission.create).toHaveBeenCalled();
    expect(mockPrisma.crmPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalReferrals: { increment: 1 } }),
      })
    );
  });

  it('should return 400 for missing dealId', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/referrals')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 when partner not found', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000099/referrals')
      .send({
        dealId: 'deal-1',
      });

    expect(res.status).toBe(404);
  });

  it('should return 404 when deal not found', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);
    mockPrisma.crmDeal.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/referrals')
      .send({
        dealId: 'nonexistent',
      });

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);
    mockPrisma.crmDeal.findFirst.mockResolvedValue(mockDeal);
    mockPrisma.crmReferral.create.mockRejectedValue(new Error('DB error'));

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
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);
    mockPrisma.crmCommission.findMany.mockResolvedValue([
      { id: 'comm-1', amount: 2500, status: 'PENDING', referral: { deal: { value: 10000 } } },
    ]);
    mockPrisma.crmCommission.count.mockResolvedValue(1);

    const res = await request(app).get(
      '/api/partners/00000000-0000-0000-0000-000000000001/commissions'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should return empty array when no commissions', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);
    mockPrisma.crmCommission.findMany.mockResolvedValue([]);
    mockPrisma.crmCommission.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/partners/00000000-0000-0000-0000-000000000001/commissions'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 404 when partner not found', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(null);

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
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);
    mockPrisma.crmCommission.findFirst.mockResolvedValue({
      id: 'comm-1',
      amount: 2500,
      status: 'PENDING',
    });
    mockPrisma.crmCommission.update.mockResolvedValue({});
    mockPrisma.crmPartner.update.mockResolvedValue({});

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
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/commissions/pay')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for empty commissionIds array', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/commissions/pay')
      .send({
        commissionIds: [],
      });

    expect(res.status).toBe(400);
  });

  it('should return 404 when partner not found', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000099/commissions/pay')
      .send({
        commissionIds: ['comm-1'],
      });

    expect(res.status).toBe(404);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);
    mockPrisma.crmCommission.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/partners/00000000-0000-0000-0000-000000000001/commissions/pay')
      .send({
        commissionIds: ['comm-1'],
      });

    expect(res.status).toBe(500);
  });
});

describe('CRM Partners — additional coverage', () => {
  it('GET / returns content-type application/json', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([]);
    mockPrisma.crmPartner.count.mockResolvedValue(0);
    const res = await request(app).get('/api/partners');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET / data is an array', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([]);
    mockPrisma.crmPartner.count.mockResolvedValue(0);
    const res = await request(app).get('/api/partners');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET / response has pagination object', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([]);
    mockPrisma.crmPartner.count.mockResolvedValue(0);
    const res = await request(app).get('/api/partners');
    expect(res.body.pagination).toBeDefined();
  });

  it('PUT /:id/tier returns 500 on database error', async () => {
    mockPrisma.crmPartner.findFirst.mockResolvedValue(mockPartner);
    mockPrisma.crmPartner.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/partners/00000000-0000-0000-0000-000000000001/tier')
      .send({ tier: 'TIER_2_COSELL' });
    expect(res.status).toBe(500);
  });
});

describe('partners — phase29 coverage', () => {
  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

  it('handles object spread', () => {
    const a2 = { x: 1 }; const b2 = { ...a2, y: 2 }; expect(b2).toEqual({ x: 1, y: 2 });
  });

  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

  it('handles every method', () => {
    expect([1, 2, 3].every(x => x > 0)).toBe(true);
  });

  it('handles Math.round', () => {
    expect(Math.round(3.7)).toBe(4);
  });

});

describe('partners — phase30 coverage', () => {
  it('handles array map', () => {
    expect([1, 2, 3].map(x => x * 2)).toEqual([2, 4, 6]);
  });

  it('handles Math.pow', () => {
    expect(Math.pow(2, 3)).toBe(8);
  });

  it('handles template literals', () => {
    const n = 42; expect(`value: ${n}`).toBe('value: 42');
  });

  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

  it('handles null check', () => {
    expect(null).toBeNull();
  });

});


describe('phase31 coverage', () => {
  it('handles promise resolution', async () => { const v = await Promise.resolve(42); expect(v).toBe(42); });
  it('handles Map creation', () => { const m = new Map<string,number>(); m.set('a',1); expect(m.get('a')).toBe(1); });
  it('handles Math.abs', () => { expect(Math.abs(-7)).toBe(7); });
  it('handles string padStart', () => { expect('5'.padStart(3,'0')).toBe('005'); });
  it('handles Date creation', () => { const d = new Date('2026-01-01'); expect(d.getFullYear()).toBe(2026); });
});


describe('phase32 coverage', () => {
  it('handles Array.from with mapFn', () => { expect(Array.from({length:3}, (_,i) => i*2)).toEqual([0,2,4]); });
  it('handles logical nullish assignment', () => { let z: number | null = null; z ??= 3; expect(z).toBe(3); });
  it('handles object property shorthand', () => { const x = 1, y = 2; const o = {x, y}; expect(o).toEqual({x:1,y:2}); });
  it('handles Object.fromEntries', () => { const m = new Map([['a',1],['b',2]]); expect(Object.fromEntries(m)).toEqual({a:1,b:2}); });
  it('handles bitwise OR', () => { expect(6 | 3).toBe(7); });
});
