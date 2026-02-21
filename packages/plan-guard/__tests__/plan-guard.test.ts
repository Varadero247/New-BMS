/**
 * Unit tests for @ims/plan-guard package
 * Covers plan limits, org plan store, and Express middleware.
 */

import {
  PLAN_LIMITS,
  getOrgPlan,
  setOrgPlan,
  checkLimit,
  planGuard,
  type PlanTier,
} from '../src/index';

// Derive middleware parameter types from the source to avoid express import
type GuardFn = ReturnType<typeof planGuard>;
type GuardReq = Parameters<GuardFn>[0];
type GuardRes = Parameters<GuardFn>[1];
type GuardNext = Parameters<GuardFn>[2];

describe('PLAN_LIMITS', () => {
  it('FREE plan has tightest limits', () => {
    expect(PLAN_LIMITS.FREE.users).toBe(3);
    expect(PLAN_LIMITS.FREE.modules).toBe(2);
    expect(PLAN_LIMITS.FREE.aiCallsPerMonth).toBe(10);
  });

  it('ENTERPRISE plan has null (unlimited) limits', () => {
    expect(PLAN_LIMITS.ENTERPRISE.users).toBeNull();
    expect(PLAN_LIMITS.ENTERPRISE.recordsPerModule).toBeNull();
    expect(PLAN_LIMITS.ENTERPRISE.aiCallsPerMonth).toBeNull();
    expect(PLAN_LIMITS.ENTERPRISE.modules).toBeNull();
  });

  it('PROFESSIONAL plan has null recordsPerModule and modules', () => {
    expect(PLAN_LIMITS.PROFESSIONAL.recordsPerModule).toBeNull();
    expect(PLAN_LIMITS.PROFESSIONAL.modules).toBeNull();
  });

  it('all four tiers are defined', () => {
    const tiers: PlanTier[] = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
    for (const tier of tiers) {
      expect(PLAN_LIMITS[tier]).toBeDefined();
    }
  });
});

describe('getOrgPlan / setOrgPlan', () => {
  it('returns PROFESSIONAL as default for unknown org', () => {
    expect(getOrgPlan('org-unknown-xyz')).toBe('PROFESSIONAL');
  });

  it('stores and retrieves plan for an org', () => {
    setOrgPlan('org-1', 'FREE');
    expect(getOrgPlan('org-1')).toBe('FREE');
  });

  it('can update org plan', () => {
    setOrgPlan('org-2', 'STARTER');
    expect(getOrgPlan('org-2')).toBe('STARTER');

    setOrgPlan('org-2', 'ENTERPRISE');
    expect(getOrgPlan('org-2')).toBe('ENTERPRISE');
  });

  it('different orgs have independent plans', () => {
    setOrgPlan('org-3', 'FREE');
    setOrgPlan('org-4', 'ENTERPRISE');

    expect(getOrgPlan('org-3')).toBe('FREE');
    expect(getOrgPlan('org-4')).toBe('ENTERPRISE');
  });
});

describe('checkLimit', () => {
  it('always returns allowed: true (billing not yet enforced)', () => {
    const result = checkLimit('org-1', 'records');
    expect(result.allowed).toBe(true);
  });

  it('returns correct shape', () => {
    const result = checkLimit('org-1', 'users');
    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('current');
    expect(result).toHaveProperty('limit');
    expect(result).toHaveProperty('plan');
    expect(result).toHaveProperty('upgradeRequired');
    expect(result.upgradeRequired).toBe(false);
  });
});

describe('planGuard middleware', () => {
  type MockReq = {
    user?: { id: string; orgId?: string };
  };

  type MockRes = {
    status: jest.Mock;
    json: jest.Mock;
  };

  const makeReq = (orgId?: string): MockReq => ({
    user: orgId ? { id: 'user-1', orgId } : { id: 'user-1' },
  });

  const makeRes = (): MockRes => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  });

  it('returns a middleware function', () => {
    const middleware = planGuard('records');
    expect(typeof middleware).toBe('function');
  });

  it('calls next() when limit is not exceeded', () => {
    const middleware = planGuard('records');
    const mockReq = makeReq('org-1');
    const mockRes = makeRes();
    const mockNext: GuardNext = jest.fn();

    middleware(
      mockReq as unknown as GuardReq,
      mockRes as unknown as GuardRes,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('does not return 402 when limit is not exceeded', () => {
    const middleware = planGuard('users');
    const mockReq = makeReq('org-1');
    const mockRes = makeRes();
    const mockNext: GuardNext = jest.fn();

    middleware(
      mockReq as unknown as GuardReq,
      mockRes as unknown as GuardRes,
      mockNext
    );

    expect(mockRes.status).not.toHaveBeenCalledWith(402);
  });

  it('uses "default" orgId when user has no orgId', () => {
    const middleware = planGuard('records');
    const mockReq: MockReq = { user: { id: 'user-1' } };
    const mockRes = makeRes();
    const mockNext: GuardNext = jest.fn();

    // Should not throw
    expect(() =>
      middleware(
        mockReq as unknown as GuardReq,
        mockRes as unknown as GuardRes,
        mockNext
      )
    ).not.toThrow();

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('handles missing user gracefully', () => {
    const middleware = planGuard('records');
    const mockReq: MockReq = {};
    const mockRes = makeRes();
    const mockNext: GuardNext = jest.fn();

    expect(() =>
      middleware(
        mockReq as unknown as GuardReq,
        mockRes as unknown as GuardRes,
        mockNext
      )
    ).not.toThrow();

    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});

describe('Plan Guard — additional coverage', () => {
  it('PLAN_LIMITS has FREE tier', () => {
    expect(PLAN_LIMITS).toHaveProperty('FREE');
  });

  it('setOrgPlan and getOrgPlan round-trip', () => {
    setOrgPlan('test-org-999', 'PROFESSIONAL');
    const plan = getOrgPlan('test-org-999');
    expect(plan).toBe('PROFESSIONAL');
  });

  it('getOrgPlan returns a default plan for unknown org', () => {
    const plan = getOrgPlan('unknown-org-never-set-xyz');
    expect(['FREE', 'PROFESSIONAL', 'ENTERPRISE']).toContain(plan);
  });

  it('checkLimit returns allowed:true for a valid org', () => {
    setOrgPlan('test-limit-org', 'PROFESSIONAL');
    const result = checkLimit('test-limit-org', 'users');
    expect(result).toHaveProperty('allowed', true);
  });

  it('planGuard returns a middleware function', () => {
    const mw = planGuard('users');
    expect(typeof mw).toBe('function');
  });
});
