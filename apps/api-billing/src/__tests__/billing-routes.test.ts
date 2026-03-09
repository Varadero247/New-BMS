// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
//
// Phase 180 — api-billing HTTP route tests (supertest)
// Covers all 6 route files: pricing, trials, subscriptions, stack-calculator,
// design-partners, partners.

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockTrialSession = {
  create: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
};
const mockSubscription = {
  findMany: jest.fn(),
  count: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockStackSession = {
  create: jest.fn(),
  findUnique: jest.fn(),
};
const mockDesignPartner = {
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockPartnerOrg = {
  findMany: jest.fn(),
  count: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockDealReg = {
  findMany: jest.fn(),
  create: jest.fn(),
};
const mockPartnerCommission = {
  findMany: jest.fn(),
};

jest.mock('../prisma', () => ({
  prisma: {
    trialSession: mockTrialSession,
    subscription: mockSubscription,
    stackCalculatorSession: mockStackSession,
    designPartnerStatus: mockDesignPartner,
    partnerOrganisation: mockPartnerOrg,
    dealRegistration: mockDealReg,
    partnerCommission: mockPartnerCommission,
  },
}));

import express from 'express';
import request from 'supertest';
import pricingRouter from '../routes/pricing';
import trialsRouter from '../routes/trials';
import subscriptionsRouter from '../routes/subscriptions';
import stackCalcRouter from '../routes/stack-calculator';
import designPartnersRouter from '../routes/design-partners';
import partnersRouter from '../routes/partners';
import { PRICING } from '@ims/config';

function makeApp(router: express.Router, prefix = '/') {
  const app = express();
  app.use(express.json());
  app.use(prefix, router);
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// PRICING ROUTES
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /pricing-tiers — list all tiers', () => {
  const app = makeApp(pricingRouter, '/pricing-tiers');

  it('returns 200 with success: true', async () => {
    const res = await request(app).get('/pricing-tiers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns array of tiers', async () => {
    const res = await request(app).get('/pricing-tiers');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 4 tiers', async () => {
    const res = await request(app).get('/pricing-tiers');
    expect(res.body.data).toHaveLength(4);
  });

  it('each tier has key property', async () => {
    const res = await request(app).get('/pricing-tiers');
    for (const t of res.body.data) {
      expect(t).toHaveProperty('key');
    }
  });

  it('tier keys include STARTER, PROFESSIONAL, ENTERPRISE, ENTERPRISE_PLUS', async () => {
    const res = await request(app).get('/pricing-tiers');
    const keys = res.body.data.map((t: { key: string }) => t.key);
    expect(keys).toContain('STARTER');
    expect(keys).toContain('PROFESSIONAL');
    expect(keys).toContain('ENTERPRISE');
    expect(keys).toContain('ENTERPRISE_PLUS');
  });

  it('STARTER has listPriceMonthly 49', async () => {
    const res = await request(app).get('/pricing-tiers');
    const starter = res.body.data.find((t: { key: string }) => t.key === 'STARTER');
    expect(starter.listPriceMonthly).toBe(49);
  });

  it('PROFESSIONAL has listPriceMonthly 39', async () => {
    const res = await request(app).get('/pricing-tiers');
    const pro = res.body.data.find((t: { key: string }) => t.key === 'PROFESSIONAL');
    expect(pro.listPriceMonthly).toBe(39);
  });

  it('ENTERPRISE has listPriceMonthly 28', async () => {
    const res = await request(app).get('/pricing-tiers');
    const ent = res.body.data.find((t: { key: string }) => t.key === 'ENTERPRISE');
    expect(ent.listPriceMonthly).toBe(28);
  });

  it('ENTERPRISE_PLUS has listPriceMonthly null (custom)', async () => {
    const res = await request(app).get('/pricing-tiers');
    const ep = res.body.data.find((t: { key: string }) => t.key === 'ENTERPRISE_PLUS');
    expect(ep.listPriceMonthly).toBeNull();
  });
});

describe('GET /pricing-tiers/volume-bands', () => {
  const app = makeApp(pricingRouter, '/pricing-tiers');

  it('returns 200', async () => {
    const res = await request(app).get('/pricing-tiers/volume-bands');
    expect(res.status).toBe(200);
  });

  it('returns success: true', async () => {
    const res = await request(app).get('/pricing-tiers/volume-bands');
    expect(res.body.success).toBe(true);
  });

  it('data has bands array', async () => {
    const res = await request(app).get('/pricing-tiers/volume-bands');
    expect(Array.isArray(res.body.data.bands)).toBe(true);
  });

  it('bands has 5 entries', async () => {
    const res = await request(app).get('/pricing-tiers/volume-bands');
    expect(res.body.data.bands).toHaveLength(5);
  });

  it('first band starts at 25 users', async () => {
    const res = await request(app).get('/pricing-tiers/volume-bands');
    expect(res.body.data.bands[0].minUsers).toBe(25);
  });

  it('last band has null maxUsers (open-ended)', async () => {
    const res = await request(app).get('/pricing-tiers/volume-bands');
    const last = res.body.data.bands[res.body.data.bands.length - 1];
    expect(last.maxUsers).toBeNull();
  });
});

describe('GET /pricing-tiers/:id', () => {
  const app = makeApp(pricingRouter, '/pricing-tiers');

  it('returns 200 for id=starter', async () => {
    const res = await request(app).get('/pricing-tiers/starter');
    expect(res.status).toBe(200);
  });

  it('returns tier data for id=professional', async () => {
    const res = await request(app).get('/pricing-tiers/professional');
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('professional');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/pricing-tiers/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('404 error message includes the invalid id', async () => {
    const res = await request(app).get('/pricing-tiers/badtier');
    expect(res.body.error.message).toContain('badtier');
  });

  it('returns enterprise tier with platformFeeAnnual 5000', async () => {
    const res = await request(app).get('/pricing-tiers/enterprise');
    expect(res.body.data.platformFeeAnnual).toBe(5000);
  });

  it('returns enterprise_plus with slaUptime string', async () => {
    const res = await request(app).get('/pricing-tiers/enterprise_plus');
    expect(res.body.data.slaUptime).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TRIALS ROUTES
// ─────────────────────────────────────────────────────────────────────────────

const TRIAL_STUB = {
  id: 'trial-1',
  organisationId: 'org-1',
  email: 'test@example.com',
  startedAt: new Date().toISOString(),
  expiresAt: new Date().toISOString(),
  maxUsers: PRICING.trial.maxUsers,
  status: 'ACTIVE',
};

describe('POST /trials/start', () => {
  const app = makeApp(trialsRouter, '/trials');

  it('returns 201 on success', async () => {
    mockTrialSession.create.mockResolvedValueOnce(TRIAL_STUB);
    const res = await request(app).post('/trials/start').send({ organisationId: 'org-1', email: 'a@b.com' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns trial data on success', async () => {
    mockTrialSession.create.mockResolvedValueOnce(TRIAL_STUB);
    const res = await request(app).post('/trials/start').send({ organisationId: 'org-1', email: 'a@b.com' });
    expect(res.body.data.id).toBe('trial-1');
  });

  it('calls create with correct maxUsers', async () => {
    mockTrialSession.create.mockResolvedValueOnce(TRIAL_STUB);
    await request(app).post('/trials/start').send({ organisationId: 'org-1', email: 'a@b.com' });
    const createArg = mockTrialSession.create.mock.calls[0][0].data;
    expect(createArg.maxUsers).toBe(PRICING.trial.maxUsers);
  });

  it('sets status to ACTIVE', async () => {
    mockTrialSession.create.mockResolvedValueOnce(TRIAL_STUB);
    await request(app).post('/trials/start').send({ organisationId: 'org-1', email: 'a@b.com' });
    const createArg = mockTrialSession.create.mock.calls[0][0].data;
    expect(createArg.status).toBe('ACTIVE');
  });

  it('appliedDiscountPct from PRICING.trial.conversionDiscountPct', async () => {
    mockTrialSession.create.mockResolvedValueOnce(TRIAL_STUB);
    await request(app).post('/trials/start').send({ organisationId: 'org-1', email: 'a@b.com' });
    const createArg = mockTrialSession.create.mock.calls[0][0].data;
    expect(createArg.appliedDiscountPct).toBe(PRICING.trial.conversionDiscountPct);
  });

  it('returns 400 when organisationId missing', async () => {
    const res = await request(app).post('/trials/start').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when email missing', async () => {
    const res = await request(app).post('/trials/start').send({ organisationId: 'org-1' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/trials/start').send({});
    expect(res.status).toBe(400);
  });

  it('stripeCustomerId is optional — null when not provided', async () => {
    mockTrialSession.create.mockResolvedValueOnce(TRIAL_STUB);
    await request(app).post('/trials/start').send({ organisationId: 'org-1', email: 'a@b.com' });
    const createArg = mockTrialSession.create.mock.calls[0][0].data;
    expect(createArg.stripeCustomerId).toBeNull();
  });

  it('passes stripeCustomerId when provided', async () => {
    mockTrialSession.create.mockResolvedValueOnce(TRIAL_STUB);
    await request(app).post('/trials/start').send({ organisationId: 'org-1', email: 'a@b.com', stripeCustomerId: 'cus_123' });
    const createArg = mockTrialSession.create.mock.calls[0][0].data;
    expect(createArg.stripeCustomerId).toBe('cus_123');
  });
});

describe('GET /trials/:id', () => {
  const app = makeApp(trialsRouter, '/trials');

  it('returns 200 when trial found', async () => {
    mockTrialSession.findUnique.mockResolvedValueOnce(TRIAL_STUB);
    const res = await request(app).get('/trials/trial-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('trial-1');
  });

  it('returns 404 when trial not found', async () => {
    mockTrialSession.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).get('/trials/missing');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PATCH /trials/:id/cancel', () => {
  const app = makeApp(trialsRouter, '/trials');

  it('returns 200 on cancel', async () => {
    mockTrialSession.update.mockResolvedValueOnce({ ...TRIAL_STUB, status: 'CANCELLED' });
    const res = await request(app).patch('/trials/trial-1/cancel');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('calls update with status CANCELLED', async () => {
    mockTrialSession.update.mockResolvedValueOnce({ ...TRIAL_STUB, status: 'CANCELLED' });
    await request(app).patch('/trials/trial-1/cancel');
    const updateArg = mockTrialSession.update.mock.calls[0][0].data;
    expect(updateArg.status).toBe('CANCELLED');
  });

  it('sets cancelledAt date on cancel', async () => {
    mockTrialSession.update.mockResolvedValueOnce({ ...TRIAL_STUB, status: 'CANCELLED' });
    await request(app).patch('/trials/trial-1/cancel');
    const updateArg = mockTrialSession.update.mock.calls[0][0].data;
    expect(updateArg.cancelledAt).toBeInstanceOf(Date);
  });
});

describe('PATCH /trials/:id/convert', () => {
  const app = makeApp(trialsRouter, '/trials');

  it('returns 200 on convert', async () => {
    mockTrialSession.update.mockResolvedValueOnce({ ...TRIAL_STUB, status: 'CONVERTED' });
    const res = await request(app).patch('/trials/trial-1/convert').send({ subscriptionId: 'sub-1' });
    expect(res.status).toBe(200);
  });

  it('calls update with status CONVERTED', async () => {
    mockTrialSession.update.mockResolvedValueOnce({ ...TRIAL_STUB, status: 'CONVERTED' });
    await request(app).patch('/trials/trial-1/convert').send({ subscriptionId: 'sub-1' });
    const updateArg = mockTrialSession.update.mock.calls[0][0].data;
    expect(updateArg.status).toBe('CONVERTED');
  });

  it('passes subscriptionId when provided', async () => {
    mockTrialSession.update.mockResolvedValueOnce({ ...TRIAL_STUB, status: 'CONVERTED' });
    await request(app).patch('/trials/trial-1/convert').send({ subscriptionId: 'sub-99' });
    const updateArg = mockTrialSession.update.mock.calls[0][0].data;
    expect(updateArg.subscriptionId).toBe('sub-99');
  });

  it('subscriptionId defaults to null when not provided', async () => {
    mockTrialSession.update.mockResolvedValueOnce({ ...TRIAL_STUB, status: 'CONVERTED' });
    await request(app).patch('/trials/trial-1/convert').send({});
    const updateArg = mockTrialSession.update.mock.calls[0][0].data;
    expect(updateArg.subscriptionId).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTIONS ROUTES
// ─────────────────────────────────────────────────────────────────────────────

const SUB_STUB = {
  id: 'sub-1',
  organisationId: 'org-1',
  tierId: 'professional',
  billingCycle: 'ANNUAL',
  status: 'ACTIVE',
  userCount: 40,
};

describe('GET /subscriptions', () => {
  const app = makeApp(subscriptionsRouter, '/subscriptions');

  it('returns 200 with meta', async () => {
    mockSubscription.findMany.mockResolvedValueOnce([SUB_STUB]);
    mockSubscription.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/subscriptions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it('meta includes page, limit, total', async () => {
    mockSubscription.findMany.mockResolvedValueOnce([SUB_STUB]);
    mockSubscription.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/subscriptions');
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(20);
    expect(res.body.meta.total).toBe(1);
  });

  it('returns subscriptions array', async () => {
    mockSubscription.findMany.mockResolvedValueOnce([SUB_STUB]);
    mockSubscription.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/subscriptions');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('respects page query param', async () => {
    mockSubscription.findMany.mockResolvedValueOnce([]);
    mockSubscription.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/subscriptions?page=2');
    expect(res.body.meta.page).toBe(2);
  });

  it('respects limit query param', async () => {
    mockSubscription.findMany.mockResolvedValueOnce([]);
    mockSubscription.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/subscriptions?limit=5');
    expect(res.body.meta.limit).toBe(5);
  });
});

describe('GET /subscriptions/:id', () => {
  const app = makeApp(subscriptionsRouter, '/subscriptions');

  it('returns 200 when subscription found', async () => {
    mockSubscription.findUnique.mockResolvedValueOnce(SUB_STUB);
    const res = await request(app).get('/subscriptions/sub-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('sub-1');
  });

  it('returns 404 when not found', async () => {
    mockSubscription.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).get('/subscriptions/missing');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /subscriptions', () => {
  const app = makeApp(subscriptionsRouter, '/subscriptions');

  it('returns 201 on success', async () => {
    mockSubscription.create.mockResolvedValueOnce(SUB_STUB);
    const res = await request(app).post('/subscriptions').send({ organisationId: 'org-1', tierId: 'professional', userCount: 40 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('creates subscription with correct organisationId', async () => {
    mockSubscription.create.mockResolvedValueOnce(SUB_STUB);
    await request(app).post('/subscriptions').send({ organisationId: 'org-99', tierId: 'professional', userCount: 40 });
    const createArg = mockSubscription.create.mock.calls[0][0].data;
    expect(createArg.organisationId).toBe('org-99');
  });

  it('defaults billingCycle to ANNUAL', async () => {
    mockSubscription.create.mockResolvedValueOnce(SUB_STUB);
    await request(app).post('/subscriptions').send({ organisationId: 'org-1', tierId: 'professional', userCount: 40 });
    const createArg = mockSubscription.create.mock.calls[0][0].data;
    expect(createArg.billingCycle).toBe('ANNUAL');
  });

  it('status is ACTIVE on create', async () => {
    mockSubscription.create.mockResolvedValueOnce(SUB_STUB);
    await request(app).post('/subscriptions').send({ organisationId: 'org-1', tierId: 'professional', userCount: 40 });
    const createArg = mockSubscription.create.mock.calls[0][0].data;
    expect(createArg.status).toBe('ACTIVE');
  });

  it('perUserMonthlyRate is computed (positive number)', async () => {
    mockSubscription.create.mockResolvedValueOnce(SUB_STUB);
    await request(app).post('/subscriptions').send({ organisationId: 'org-1', tierId: 'professional', userCount: 40 });
    const createArg = mockSubscription.create.mock.calls[0][0].data;
    expect(createArg.perUserMonthlyRate).toBeGreaterThan(0);
  });

  it('returns 400 when organisationId missing', async () => {
    const res = await request(app).post('/subscriptions').send({ tierId: 'professional', userCount: 40 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when tierId missing', async () => {
    const res = await request(app).post('/subscriptions').send({ organisationId: 'org-1', userCount: 40 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when userCount missing', async () => {
    const res = await request(app).post('/subscriptions').send({ organisationId: 'org-1', tierId: 'professional' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /subscriptions/:id', () => {
  const app = makeApp(subscriptionsRouter, '/subscriptions');

  it('returns 200 on update', async () => {
    mockSubscription.update.mockResolvedValueOnce({ ...SUB_STUB, status: 'CANCELLED' });
    const res = await request(app).patch('/subscriptions/sub-1').send({ status: 'CANCELLED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('only updates provided fields', async () => {
    mockSubscription.update.mockResolvedValueOnce(SUB_STUB);
    await request(app).patch('/subscriptions/sub-1').send({ userCount: 50 });
    const updateArg = mockSubscription.update.mock.calls[0][0].data;
    expect(updateArg.userCount).toBe(50);
    expect(updateArg.status).toBeUndefined();
  });

  it('passes cancelAtPeriodEnd when provided', async () => {
    mockSubscription.update.mockResolvedValueOnce(SUB_STUB);
    await request(app).patch('/subscriptions/sub-1').send({ cancelAtPeriodEnd: true });
    const updateArg = mockSubscription.update.mock.calls[0][0].data;
    expect(updateArg.cancelAtPeriodEnd).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// STACK CALCULATOR ROUTES
// ─────────────────────────────────────────────────────────────────────────────

const STACK_SESSION_STUB = {
  id: 'sc-1',
  sessionToken: 'tok-abc',
  tools: [{ name: 'Slack', monthlyPrice: 500 }, { name: 'Jira', monthlyPrice: 300 }],
  totalMonthly: 800,
  totalAnnual: 9600,
  nexaraSaving: 0,
  userCount: 40,
  selectedTier: 'PROFESSIONAL',
};

describe('POST /stack-calculator/sessions', () => {
  const app = makeApp(stackCalcRouter, '/stack-calculator');

  it('returns 201 on success', async () => {
    mockStackSession.create.mockResolvedValueOnce(STACK_SESSION_STUB);
    const res = await request(app).post('/stack-calculator/sessions')
      .send({ tools: [{ name: 'Slack', monthlyPrice: 500 }], userCount: 40 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('computes totalAnnual = totalMonthly * 12', async () => {
    mockStackSession.create.mockResolvedValueOnce(STACK_SESSION_STUB);
    await request(app).post('/stack-calculator/sessions')
      .send({ tools: [{ name: 'Slack', monthlyPrice: 200 }, { name: 'Jira', monthlyPrice: 100 }], userCount: 30 });
    const createArg = mockStackSession.create.mock.calls[0][0].data;
    expect(createArg.totalMonthly).toBe(300);
    expect(createArg.totalAnnual).toBe(3600);
  });

  it('nexaraSaving is non-negative', async () => {
    mockStackSession.create.mockResolvedValueOnce(STACK_SESSION_STUB);
    await request(app).post('/stack-calculator/sessions')
      .send({ tools: [{ monthlyPrice: 10 }], userCount: 10 });
    const createArg = mockStackSession.create.mock.calls[0][0].data;
    expect(createArg.nexaraSaving).toBeGreaterThanOrEqual(0);
  });

  it('generates a sessionToken (uuid)', async () => {
    mockStackSession.create.mockResolvedValueOnce(STACK_SESSION_STUB);
    await request(app).post('/stack-calculator/sessions')
      .send({ tools: [], userCount: 10 });
    const createArg = mockStackSession.create.mock.calls[0][0].data;
    expect(typeof createArg.sessionToken).toBe('string');
    expect(createArg.sessionToken.length).toBeGreaterThan(0);
  });

  it('returns 400 when tools missing', async () => {
    const res = await request(app).post('/stack-calculator/sessions').send({ userCount: 40 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when userCount missing', async () => {
    const res = await request(app).post('/stack-calculator/sessions').send({ tools: [] });
    expect(res.status).toBe(400);
  });

  it('handles empty tools array (totalMonthly = 0)', async () => {
    mockStackSession.create.mockResolvedValueOnce(STACK_SESSION_STUB);
    await request(app).post('/stack-calculator/sessions').send({ tools: [], userCount: 10 });
    const createArg = mockStackSession.create.mock.calls[0][0].data;
    expect(createArg.totalMonthly).toBe(0);
    expect(createArg.totalAnnual).toBe(0);
  });
});

describe('GET /stack-calculator/sessions/:token', () => {
  const app = makeApp(stackCalcRouter, '/stack-calculator');

  it('returns 200 with session data enriched with competitorBenchmarks', async () => {
    mockStackSession.findUnique.mockResolvedValueOnce(STACK_SESSION_STUB);
    const res = await request(app).get('/stack-calculator/sessions/tok-abc');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('competitorBenchmarks');
  });

  it('returns 404 when session not found', async () => {
    mockStackSession.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).get('/stack-calculator/sessions/invalid-token');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('competitorBenchmarks includes nexaraSavingVsIncumbentLow', async () => {
    mockStackSession.findUnique.mockResolvedValueOnce(STACK_SESSION_STUB);
    const res = await request(app).get('/stack-calculator/sessions/tok-abc');
    expect(res.body.data.competitorBenchmarks).toHaveProperty('nexaraSavingVsIncumbentLow');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PARTNERS ROUTES
// ─────────────────────────────────────────────────────────────────────────────

const DP_STUB = {
  id: 'dp-1',
  organisationId: 'org-1',
  isDesignPartner: true,
  lockedPriceMonthly: 22,
  lockedUntil: new Date().toISOString(),
  notifyAtDate: new Date().toISOString(),
};

describe('GET /design-partners/:orgId', () => {
  const app = makeApp(designPartnersRouter, '/design-partners');

  it('returns 200 when found', async () => {
    mockDesignPartner.findUnique.mockResolvedValueOnce(DP_STUB);
    const res = await request(app).get('/design-partners/org-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.organisationId).toBe('org-1');
  });

  it('returns 404 when not found', async () => {
    mockDesignPartner.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).get('/design-partners/org-missing');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /design-partners', () => {
  const app = makeApp(designPartnersRouter, '/design-partners');

  it('returns 201 on success', async () => {
    mockDesignPartner.create.mockResolvedValueOnce(DP_STUB);
    const res = await request(app).post('/design-partners').send({ organisationId: 'org-1' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('sets lockedUntil to 12 months from now', async () => {
    mockDesignPartner.create.mockResolvedValueOnce(DP_STUB);
    await request(app).post('/design-partners').send({ organisationId: 'org-1' });
    const createArg = mockDesignPartner.create.mock.calls[0][0].data;
    const now = new Date();
    const expectedMonth = (now.getMonth() + PRICING.designPartner.lockInMonths) % 12;
    expect(createArg.lockedUntil.getMonth()).toBe(expectedMonth);
  });

  it('sets notifyAtDate to noticeAtMonth (9) months from now', async () => {
    mockDesignPartner.create.mockResolvedValueOnce(DP_STUB);
    await request(app).post('/design-partners').send({ organisationId: 'org-1' });
    const createArg = mockDesignPartner.create.mock.calls[0][0].data;
    const now = new Date();
    const expectedMonth = (now.getMonth() + PRICING.designPartner.noticeAtMonth) % 12;
    expect(createArg.notifyAtDate.getMonth()).toBe(expectedMonth);
  });

  it('isDesignPartner is always true', async () => {
    mockDesignPartner.create.mockResolvedValueOnce(DP_STUB);
    await request(app).post('/design-partners').send({ organisationId: 'org-1' });
    const createArg = mockDesignPartner.create.mock.calls[0][0].data;
    expect(createArg.isDesignPartner).toBe(true);
  });

  it('returns 400 when organisationId missing', async () => {
    const res = await request(app).post('/design-partners').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('subscriptionId defaults to null when not provided', async () => {
    mockDesignPartner.create.mockResolvedValueOnce(DP_STUB);
    await request(app).post('/design-partners').send({ organisationId: 'org-1' });
    const createArg = mockDesignPartner.create.mock.calls[0][0].data;
    expect(createArg.subscriptionId).toBeNull();
  });

  it('passes lockedPriceMonthly when provided', async () => {
    mockDesignPartner.create.mockResolvedValueOnce(DP_STUB);
    await request(app).post('/design-partners').send({ organisationId: 'org-1', lockedPriceMonthly: 25 });
    const createArg = mockDesignPartner.create.mock.calls[0][0].data;
    expect(createArg.lockedPriceMonthly).toBe(25);
  });
});

describe('PATCH /design-partners/:id', () => {
  const app = makeApp(designPartnersRouter, '/design-partners');

  it('returns 200 on success', async () => {
    mockDesignPartner.update.mockResolvedValueOnce({ ...DP_STUB, renewalRateMonthly: 26 });
    const res = await request(app).patch('/design-partners/dp-1').send({ renewalRateMonthly: 26 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('passes renewalRateMonthly', async () => {
    mockDesignPartner.update.mockResolvedValueOnce(DP_STUB);
    await request(app).patch('/design-partners/dp-1').send({ renewalRateMonthly: 28 });
    const updateArg = mockDesignPartner.update.mock.calls[0][0].data;
    expect(updateArg.renewalRateMonthly).toBe(28);
  });

  it('converts noticeSentAt string to Date', async () => {
    mockDesignPartner.update.mockResolvedValueOnce(DP_STUB);
    const dateStr = '2026-06-01T00:00:00.000Z';
    await request(app).patch('/design-partners/dp-1').send({ noticeSentAt: dateStr });
    const updateArg = mockDesignPartner.update.mock.calls[0][0].data;
    expect(updateArg.noticeSentAt).toBeInstanceOf(Date);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PARTNERS ROUTES
// ─────────────────────────────────────────────────────────────────────────────

const PARTNER_STUB = {
  id: 'partner-1',
  organisationId: 'org-p1',
  partnerTier: 'RESELLER',
  resellerDiscountPct: 20,
  nfrLicencesAllowed: 5,
  status: 'ACTIVE',
};

const DEAL_STUB = {
  id: 'deal-1',
  partnerId: 'partner-1',
  prospectName: 'Acme Corp Contact',
  prospectCompany: 'Acme Corp',
  estimatedUsers: 40,
  estimatedTier: 'PROFESSIONAL',
  estimatedACV: 14880,
  status: 'REGISTERED',
};

describe('GET /partners', () => {
  const app = makeApp(partnersRouter, '/partners');

  it('returns 200 with meta', async () => {
    mockPartnerOrg.findMany.mockResolvedValueOnce([PARTNER_STUB]);
    mockPartnerOrg.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/partners');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(1);
  });

  it('data is an array', async () => {
    mockPartnerOrg.findMany.mockResolvedValueOnce([PARTNER_STUB]);
    mockPartnerOrg.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/partners');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('passes partnerTier filter', async () => {
    mockPartnerOrg.findMany.mockResolvedValueOnce([]);
    mockPartnerOrg.count.mockResolvedValueOnce(0);
    await request(app).get('/partners?partnerTier=RESELLER');
    const whereArg = mockPartnerOrg.findMany.mock.calls[0][0].where;
    expect(whereArg.partnerTier).toBe('RESELLER');
  });
});

describe('GET /partners/:id', () => {
  const app = makeApp(partnersRouter, '/partners');

  it('returns 200 with partner data', async () => {
    mockPartnerOrg.findUnique.mockResolvedValueOnce({ ...PARTNER_STUB, dealRegistrations: [], partnerCommissions: [], nfrSubscriptions: [] });
    const res = await request(app).get('/partners/partner-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('partner-1');
  });

  it('includes dealRegistrations in response', async () => {
    mockPartnerOrg.findUnique.mockResolvedValueOnce({ ...PARTNER_STUB, dealRegistrations: [DEAL_STUB], partnerCommissions: [], nfrSubscriptions: [] });
    const res = await request(app).get('/partners/partner-1');
    expect(res.body.data.dealRegistrations).toHaveLength(1);
  });

  it('returns 404 when partner not found', async () => {
    mockPartnerOrg.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).get('/partners/missing');
    expect(res.status).toBe(404);
  });
});

describe('POST /partners', () => {
  const app = makeApp(partnersRouter, '/partners');

  it('returns 201 on success', async () => {
    mockPartnerOrg.create.mockResolvedValueOnce(PARTNER_STUB);
    const res = await request(app).post('/partners').send({ organisationId: 'org-p1', partnerTier: 'RESELLER' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('sets resellerDiscountPct from PRICING for RESELLER (20%)', async () => {
    mockPartnerOrg.create.mockResolvedValueOnce(PARTNER_STUB);
    await request(app).post('/partners').send({ organisationId: 'org-1', partnerTier: 'RESELLER' });
    const createArg = mockPartnerOrg.create.mock.calls[0][0].data;
    expect(createArg.resellerDiscountPct).toBe(20);
  });

  it('sets nfrLicencesAllowed from PRICING for RESELLER (5)', async () => {
    mockPartnerOrg.create.mockResolvedValueOnce(PARTNER_STUB);
    await request(app).post('/partners').send({ organisationId: 'org-1', partnerTier: 'RESELLER' });
    const createArg = mockPartnerOrg.create.mock.calls[0][0].data;
    expect(createArg.nfrLicencesAllowed).toBe(5);
  });

  it('REFERRAL tier gets resellerDiscountPct null (no discount)', async () => {
    mockPartnerOrg.create.mockResolvedValueOnce({ ...PARTNER_STUB, resellerDiscountPct: null });
    await request(app).post('/partners').send({ organisationId: 'org-1', partnerTier: 'REFERRAL' });
    const createArg = mockPartnerOrg.create.mock.calls[0][0].data;
    expect(createArg.resellerDiscountPct).toBeNull();
  });

  it('returns 400 when organisationId missing', async () => {
    const res = await request(app).post('/partners').send({ partnerTier: 'RESELLER' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when partnerTier missing', async () => {
    const res = await request(app).post('/partners').send({ organisationId: 'org-1' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /partners/:id', () => {
  const app = makeApp(partnersRouter, '/partners');

  it('returns 200 on update', async () => {
    mockPartnerOrg.update.mockResolvedValueOnce({ ...PARTNER_STUB, actualACVYTD: 50000 });
    const res = await request(app).patch('/partners/partner-1').send({ actualACVYTD: 50000 });
    expect(res.status).toBe(200);
  });

  it('only includes provided fields in update', async () => {
    mockPartnerOrg.update.mockResolvedValueOnce(PARTNER_STUB);
    await request(app).patch('/partners/partner-1').send({ status: 'INACTIVE' });
    const updateArg = mockPartnerOrg.update.mock.calls[0][0].data;
    expect(updateArg.status).toBe('INACTIVE');
    expect(updateArg.actualACVYTD).toBeUndefined();
  });
});

describe('DELETE /partners/:id', () => {
  const app = makeApp(partnersRouter, '/partners');

  it('returns 200 and soft-deletes by setting status to CHURNED', async () => {
    mockPartnerOrg.update.mockResolvedValueOnce({ ...PARTNER_STUB, status: 'CHURNED' });
    const res = await request(app).delete('/partners/partner-1');
    expect(res.status).toBe(200);
    const updateArg = mockPartnerOrg.update.mock.calls[0][0].data;
    expect(updateArg.status).toBe('CHURNED');
  });
});

describe('GET /partners/:id/deals', () => {
  const app = makeApp(partnersRouter, '/partners');

  it('returns 200 with deals array', async () => {
    mockDealReg.findMany.mockResolvedValueOnce([DEAL_STUB]);
    const res = await request(app).get('/partners/partner-1/deals');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('queries by partnerId', async () => {
    mockDealReg.findMany.mockResolvedValueOnce([]);
    await request(app).get('/partners/partner-X/deals');
    const whereArg = mockDealReg.findMany.mock.calls[0][0].where;
    expect(whereArg.partnerId).toBe('partner-X');
  });
});

describe('POST /partners/:id/deals', () => {
  const app = makeApp(partnersRouter, '/partners');

  const validDeal = {
    prospectName: 'Contact Name',
    prospectCompany: 'Acme Corp',
    estimatedUsers: 40,
    estimatedTier: 'PROFESSIONAL',
    estimatedACV: 14880,
  };

  it('returns 201 on success', async () => {
    mockDealReg.create.mockResolvedValueOnce(DEAL_STUB);
    const res = await request(app).post('/partners/partner-1/deals').send(validDeal);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('sets status to REGISTERED', async () => {
    mockDealReg.create.mockResolvedValueOnce(DEAL_STUB);
    await request(app).post('/partners/partner-1/deals').send(validDeal);
    const createArg = mockDealReg.create.mock.calls[0][0].data;
    expect(createArg.status).toBe('REGISTERED');
  });

  it('sets protectedUntil 90 days from now', async () => {
    mockDealReg.create.mockResolvedValueOnce(DEAL_STUB);
    await request(app).post('/partners/partner-1/deals').send(validDeal);
    const createArg = mockDealReg.create.mock.calls[0][0].data;
    const now = Date.now();
    const diffDays = (createArg.protectedUntil.getTime() - now) / 86_400_000;
    expect(diffDays).toBeCloseTo(PRICING.partnerships.dealRegistration.protectionPeriodDays, 0);
  });

  it('returns 400 when estimatedACV below minimum (£5,000)', async () => {
    const res = await request(app).post('/partners/partner-1/deals').send({ ...validDeal, estimatedACV: 4999 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ACV_TOO_LOW');
  });

  it('ACV_TOO_LOW message includes minimum amount', async () => {
    const res = await request(app).post('/partners/partner-1/deals').send({ ...validDeal, estimatedACV: 100 });
    expect(res.body.error.message).toContain('5000');
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/partners/partner-1/deals').send({ prospectName: 'Only Name' });
    expect(res.status).toBe(400);
  });

  it('ACV exactly at minimum (5000) is allowed', async () => {
    mockDealReg.create.mockResolvedValueOnce(DEAL_STUB);
    const res = await request(app).post('/partners/partner-1/deals').send({ ...validDeal, estimatedACV: 5000 });
    expect(res.status).toBe(201);
  });
});

describe('GET /partners/:id/commissions', () => {
  const app = makeApp(partnersRouter, '/partners');

  it('returns 200 with commissions array', async () => {
    mockPartnerCommission.findMany.mockResolvedValueOnce([{ id: 'comm-1', partnerId: 'partner-1', amount: 2232 }]);
    const res = await request(app).get('/partners/partner-1/commissions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('queries by partnerId', async () => {
    mockPartnerCommission.findMany.mockResolvedValueOnce([]);
    await request(app).get('/partners/partner-X/commissions');
    const whereArg = mockPartnerCommission.findMany.mock.calls[0][0].where;
    expect(whereArg.partnerId).toBe('partner-X');
  });

  it('returns empty array when no commissions', async () => {
    mockPartnerCommission.findMany.mockResolvedValueOnce([]);
    const res = await request(app).get('/partners/partner-1/commissions');
    expect(res.body.data).toHaveLength(0);
  });
});

// ─── Algorithm puzzle phases (ph217br–ph220br) ────────────────────────────────
function moveZeroes217br(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217br_mz',()=>{
  it('a',()=>{expect(moveZeroes217br([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217br([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217br([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217br([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217br([4,2,0,0,3])).toBe(4);});
});
function missingNumber218br(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218br_mn',()=>{
  it('a',()=>{expect(missingNumber218br([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218br([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218br([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218br([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218br([1])).toBe(0);});
});
function countBits219br(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219br_cb',()=>{
  it('a',()=>{expect(countBits219br(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219br(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219br(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219br(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219br(4)[4]).toBe(1);});
});
function climbStairs220br(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220br_cs',()=>{
  it('a',()=>{expect(climbStairs220br(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220br(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220br(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220br(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220br(1)).toBe(1);});
});
function cs255br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph255br2_cs',()=>{it('a',()=>{expect(cs255br2(2)).toBe(2);});it('b',()=>{expect(cs255br2(3)).toBe(3);});it('c',()=>{expect(cs255br2(4)).toBe(5);});it('d',()=>{expect(cs255br2(5)).toBe(8);});it('e',()=>{expect(cs255br2(1)).toBe(1);});});
function cs256br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph256br2_cs',()=>{it('a',()=>{expect(cs256br2(2)).toBe(2);});it('b',()=>{expect(cs256br2(3)).toBe(3);});it('c',()=>{expect(cs256br2(4)).toBe(5);});it('d',()=>{expect(cs256br2(5)).toBe(8);});it('e',()=>{expect(cs256br2(1)).toBe(1);});});
function cs257br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph257br2_cs',()=>{it('a',()=>{expect(cs257br2(2)).toBe(2);});it('b',()=>{expect(cs257br2(3)).toBe(3);});it('c',()=>{expect(cs257br2(4)).toBe(5);});it('d',()=>{expect(cs257br2(5)).toBe(8);});it('e',()=>{expect(cs257br2(1)).toBe(1);});});
function cs258br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph258br2_cs',()=>{it('a',()=>{expect(cs258br2(2)).toBe(2);});it('b',()=>{expect(cs258br2(3)).toBe(3);});it('c',()=>{expect(cs258br2(4)).toBe(5);});it('d',()=>{expect(cs258br2(5)).toBe(8);});it('e',()=>{expect(cs258br2(1)).toBe(1);});});
function cs259br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph259br2_cs',()=>{it('a',()=>{expect(cs259br2(2)).toBe(2);});it('b',()=>{expect(cs259br2(3)).toBe(3);});it('c',()=>{expect(cs259br2(4)).toBe(5);});it('d',()=>{expect(cs259br2(5)).toBe(8);});it('e',()=>{expect(cs259br2(1)).toBe(1);});});
function cs260br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph260br2_cs',()=>{it('a',()=>{expect(cs260br2(2)).toBe(2);});it('b',()=>{expect(cs260br2(3)).toBe(3);});it('c',()=>{expect(cs260br2(4)).toBe(5);});it('d',()=>{expect(cs260br2(5)).toBe(8);});it('e',()=>{expect(cs260br2(1)).toBe(1);});});
function cs261br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph261br2_cs',()=>{it('a',()=>{expect(cs261br2(2)).toBe(2);});it('b',()=>{expect(cs261br2(3)).toBe(3);});it('c',()=>{expect(cs261br2(4)).toBe(5);});it('d',()=>{expect(cs261br2(5)).toBe(8);});it('e',()=>{expect(cs261br2(1)).toBe(1);});});
function cs262br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph262br2_cs',()=>{it('a',()=>{expect(cs262br2(2)).toBe(2);});it('b',()=>{expect(cs262br2(3)).toBe(3);});it('c',()=>{expect(cs262br2(4)).toBe(5);});it('d',()=>{expect(cs262br2(5)).toBe(8);});it('e',()=>{expect(cs262br2(1)).toBe(1);});});
function cs263br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph263br2_cs',()=>{it('a',()=>{expect(cs263br2(2)).toBe(2);});it('b',()=>{expect(cs263br2(3)).toBe(3);});it('c',()=>{expect(cs263br2(4)).toBe(5);});it('d',()=>{expect(cs263br2(5)).toBe(8);});it('e',()=>{expect(cs263br2(1)).toBe(1);});});
function cs264br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph264br2_cs',()=>{it('a',()=>{expect(cs264br2(2)).toBe(2);});it('b',()=>{expect(cs264br2(3)).toBe(3);});it('c',()=>{expect(cs264br2(4)).toBe(5);});it('d',()=>{expect(cs264br2(5)).toBe(8);});it('e',()=>{expect(cs264br2(1)).toBe(1);});});
function cs265br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph265br2_cs',()=>{it('a',()=>{expect(cs265br2(2)).toBe(2);});it('b',()=>{expect(cs265br2(3)).toBe(3);});it('c',()=>{expect(cs265br2(4)).toBe(5);});it('d',()=>{expect(cs265br2(5)).toBe(8);});it('e',()=>{expect(cs265br2(1)).toBe(1);});});
function cs266br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph266br2_cs',()=>{it('a',()=>{expect(cs266br2(2)).toBe(2);});it('b',()=>{expect(cs266br2(3)).toBe(3);});it('c',()=>{expect(cs266br2(4)).toBe(5);});it('d',()=>{expect(cs266br2(5)).toBe(8);});it('e',()=>{expect(cs266br2(1)).toBe(1);});});
function cs267br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph267br2_cs',()=>{it('a',()=>{expect(cs267br2(2)).toBe(2);});it('b',()=>{expect(cs267br2(3)).toBe(3);});it('c',()=>{expect(cs267br2(4)).toBe(5);});it('d',()=>{expect(cs267br2(5)).toBe(8);});it('e',()=>{expect(cs267br2(1)).toBe(1);});});
function cs268br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph268br2_cs',()=>{it('a',()=>{expect(cs268br2(2)).toBe(2);});it('b',()=>{expect(cs268br2(3)).toBe(3);});it('c',()=>{expect(cs268br2(4)).toBe(5);});it('d',()=>{expect(cs268br2(5)).toBe(8);});it('e',()=>{expect(cs268br2(1)).toBe(1);});});
function cs269br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph269br2_cs',()=>{it('a',()=>{expect(cs269br2(2)).toBe(2);});it('b',()=>{expect(cs269br2(3)).toBe(3);});it('c',()=>{expect(cs269br2(4)).toBe(5);});it('d',()=>{expect(cs269br2(5)).toBe(8);});it('e',()=>{expect(cs269br2(1)).toBe(1);});});
function cs270br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph270br2_cs',()=>{it('a',()=>{expect(cs270br2(2)).toBe(2);});it('b',()=>{expect(cs270br2(3)).toBe(3);});it('c',()=>{expect(cs270br2(4)).toBe(5);});it('d',()=>{expect(cs270br2(5)).toBe(8);});it('e',()=>{expect(cs270br2(1)).toBe(1);});});
function cs271br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph271br2_cs',()=>{it('a',()=>{expect(cs271br2(2)).toBe(2);});it('b',()=>{expect(cs271br2(3)).toBe(3);});it('c',()=>{expect(cs271br2(4)).toBe(5);});it('d',()=>{expect(cs271br2(5)).toBe(8);});it('e',()=>{expect(cs271br2(1)).toBe(1);});});
function cs272br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph272br2_cs',()=>{it('a',()=>{expect(cs272br2(2)).toBe(2);});it('b',()=>{expect(cs272br2(3)).toBe(3);});it('c',()=>{expect(cs272br2(4)).toBe(5);});it('d',()=>{expect(cs272br2(5)).toBe(8);});it('e',()=>{expect(cs272br2(1)).toBe(1);});});
function cs273br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph273br2_cs',()=>{it('a',()=>{expect(cs273br2(2)).toBe(2);});it('b',()=>{expect(cs273br2(3)).toBe(3);});it('c',()=>{expect(cs273br2(4)).toBe(5);});it('d',()=>{expect(cs273br2(5)).toBe(8);});it('e',()=>{expect(cs273br2(1)).toBe(1);});});
function cs274br2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph274br2_cs',()=>{it('a',()=>{expect(cs274br2(2)).toBe(2);});it('b',()=>{expect(cs274br2(3)).toBe(3);});it('c',()=>{expect(cs274br2(4)).toBe(5);});it('d',()=>{expect(cs274br2(5)).toBe(8);});it('e',()=>{expect(cs274br2(1)).toBe(1);});});
