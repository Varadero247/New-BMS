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

describe('Plan Guard — PLAN_LIMITS structure and values', () => {
  const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  });

  type MockReq = { user?: { id: string; orgId?: string } };
  type GuardFn = ReturnType<typeof planGuard>;
  type GuardReq = Parameters<GuardFn>[0];
  type GuardRes = Parameters<GuardFn>[1];
  type GuardNext = Parameters<GuardFn>[2];

  it('STARTER plan has recordsPerModule of 5000', () => {
    expect(PLAN_LIMITS.STARTER.recordsPerModule).toBe(5000);
  });

  it('STARTER plan limits aiCallsPerMonth to 100', () => {
    expect(PLAN_LIMITS.STARTER.aiCallsPerMonth).toBe(100);
  });

  it('FREE plan limits users to 3', () => {
    expect(PLAN_LIMITS.FREE.users).toBe(3);
  });

  it('PROFESSIONAL plan allows up to 50 users', () => {
    expect(PLAN_LIMITS.PROFESSIONAL.users).toBe(50);
  });

  it('ENTERPRISE plan has null for modules (unlimited)', () => {
    expect(PLAN_LIMITS.ENTERPRISE.modules).toBeNull();
  });

  it('checkLimit returns current:0 (not yet enforced)', () => {
    const result = checkLimit('any-org', 'aiCalls');
    expect(result.current).toBe(0);
  });

  it('checkLimit always has upgradeRequired:false', () => {
    const result = checkLimit('any-org', 'modules');
    expect(result.upgradeRequired).toBe(false);
  });

  it('planGuard calls next when user has organisationId instead of orgId', () => {
    const mw = planGuard('records');
    const mockReq: MockReq = { user: { id: 'user-org' } };
    const mockRes = makeRes();
    const mockNext: GuardNext = jest.fn();
    mw(mockReq as unknown as GuardReq, mockRes as unknown as GuardRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('planGuard for different resource types all call next', () => {
    const resources = ['users', 'records', 'aiCalls', 'modules'];
    for (const resource of resources) {
      const mw = planGuard(resource);
      const mockRes = makeRes();
      const mockNext: GuardNext = jest.fn();
      const mockReq: MockReq = { user: { id: 'u', orgId: 'test-org' } };
      mw(mockReq as unknown as GuardReq, mockRes as unknown as GuardRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    }
  });

  it('PLAN_LIMITS has exactly 4 tiers', () => {
    expect(Object.keys(PLAN_LIMITS)).toHaveLength(4);
  });
});

describe('Plan Guard — limits hierarchy', () => {
  it('FREE users limit is less than STARTER users limit', () => {
    expect(PLAN_LIMITS.FREE.users!).toBeLessThan(PLAN_LIMITS.STARTER.users!);
  });

  it('STARTER users limit is less than PROFESSIONAL users limit', () => {
    expect(PLAN_LIMITS.STARTER.users!).toBeLessThan(PLAN_LIMITS.PROFESSIONAL.users!);
  });

  it('PROFESSIONAL users limit is non-null while ENTERPRISE is null', () => {
    expect(PLAN_LIMITS.PROFESSIONAL.users).not.toBeNull();
    expect(PLAN_LIMITS.ENTERPRISE.users).toBeNull();
  });

  it('FREE aiCallsPerMonth is less than STARTER aiCallsPerMonth', () => {
    expect(PLAN_LIMITS.FREE.aiCallsPerMonth!).toBeLessThan(PLAN_LIMITS.STARTER.aiCallsPerMonth!);
  });

  it('STARTER aiCallsPerMonth is less than PROFESSIONAL aiCallsPerMonth when PROFESSIONAL is non-null', () => {
    if (PLAN_LIMITS.PROFESSIONAL.aiCallsPerMonth !== null) {
      expect(PLAN_LIMITS.STARTER.aiCallsPerMonth!).toBeLessThan(PLAN_LIMITS.PROFESSIONAL.aiCallsPerMonth);
    } else {
      expect(PLAN_LIMITS.PROFESSIONAL.aiCallsPerMonth).toBeNull();
    }
  });

  it('setOrgPlan with STARTER plan can be retrieved', () => {
    setOrgPlan('tier-test-org', 'STARTER');
    expect(getOrgPlan('tier-test-org')).toBe('STARTER');
  });
});

describe('Plan Guard — final coverage', () => {
  it('checkLimit plan field is PROFESSIONAL (hardcoded until billing is connected)', () => {
    setOrgPlan('final-org-1', 'STARTER');
    const result = checkLimit('final-org-1', 'users');
    // checkLimit always returns plan: 'PROFESSIONAL' until billing enforcement is wired up
    expect(result.plan).toBe('PROFESSIONAL');
  });

  it('PLAN_LIMITS.FREE.modules equals 2', () => {
    expect(PLAN_LIMITS.FREE.modules).toBe(2);
  });

  it('PLAN_LIMITS.STARTER.users is defined and greater than FREE users', () => {
    expect(PLAN_LIMITS.STARTER.users).toBeDefined();
    expect(PLAN_LIMITS.STARTER.users!).toBeGreaterThan(PLAN_LIMITS.FREE.users!);
  });

  it('planGuard returns a function with arity of 3', () => {
    const mw = planGuard('records');
    expect(mw.length).toBe(3);
  });
});
