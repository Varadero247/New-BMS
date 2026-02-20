import { assessLoginRisk, riskScoreToAction, type LoginContext } from '../src/adaptive-auth';

const BASE_CTX: LoginContext = {
  userId: 'u-1',
  ip: '1.2.3.4',
  isKnownDevice: true,
  isKnownLocation: true,
  recentFailedAttempts: 0,
  isTorOrProxy: false,
  mfaEnabled: true,
};

describe('assessLoginRisk()', () => {
  // ── Low risk ─────────────────────────────────────────────────────────────────

  describe('low-risk scenarios → ALLOW', () => {
    it('returns score 0 and ALLOW for a trusted context', () => {
      const result = assessLoginRisk(BASE_CTX);
      expect(result.score).toBe(0);
      expect(result.action).toBe('ALLOW');
      expect(result.factors).toHaveLength(0);
    });

    it('ALLOW when hourOfDay is within normal hours', () => {
      const ctx: LoginContext = {
        ...BASE_CTX,
        hourOfDay: 9,
        normalLoginHours: [8, 9, 10, 11],
      };
      const { action } = assessLoginRisk(ctx);
      expect(action).toBe('ALLOW');
    });
  });

  // ── Unknown device ────────────────────────────────────────────────────────────

  describe('unknown device factor', () => {
    it('adds 25 points for unknown device', () => {
      const { score, factors } = assessLoginRisk({ ...BASE_CTX, isKnownDevice: false });
      expect(score).toBe(25);
      expect(factors.some((f) => f.name === 'unknown_device')).toBe(true);
    });
  });

  // ── Unknown location ──────────────────────────────────────────────────────────

  describe('unknown location factor', () => {
    it('adds 20 points for new location', () => {
      const { score, factors } = assessLoginRisk({ ...BASE_CTX, isKnownLocation: false });
      expect(score).toBe(20);
      expect(factors.some((f) => f.name === 'unknown_location')).toBe(true);
    });
  });

  // ── Tor / Proxy ───────────────────────────────────────────────────────────────

  describe('Tor/proxy factor', () => {
    it('adds 30 points for Tor connection', () => {
      const { score, factors } = assessLoginRisk({ ...BASE_CTX, isTorOrProxy: true });
      expect(score).toBe(30);
      expect(factors.some((f) => f.name === 'tor_or_proxy')).toBe(true);
    });
  });

  // ── Unusual hour ──────────────────────────────────────────────────────────────

  describe('unusual login hour factor', () => {
    it('adds 15 points for off-hours login', () => {
      const ctx: LoginContext = {
        ...BASE_CTX,
        hourOfDay: 3,
        normalLoginHours: [8, 9, 10],
      };
      const { score, factors } = assessLoginRisk(ctx);
      expect(score).toBe(15);
      expect(factors.some((f) => f.name === 'unusual_hour')).toBe(true);
    });

    it('no penalty when hourOfDay not provided', () => {
      const ctx: LoginContext = { ...BASE_CTX, normalLoginHours: [8, 9, 10] };
      const { score } = assessLoginRisk(ctx);
      expect(score).toBe(0);
    });

    it('no penalty when normalLoginHours is empty', () => {
      const ctx: LoginContext = { ...BASE_CTX, hourOfDay: 3, normalLoginHours: [] };
      const { score } = assessLoginRisk(ctx);
      expect(score).toBe(0);
    });
  });

  // ── Failed attempts ───────────────────────────────────────────────────────────

  describe('failed attempts factor', () => {
    it('adds 20 points for 3 recent failures', () => {
      const { score, factors } = assessLoginRisk({ ...BASE_CTX, recentFailedAttempts: 3 });
      expect(score).toBe(20);
      expect(factors.some((f) => f.name === 'failed_attempts')).toBe(true);
    });

    it('adds 40 points for 5+ recent failures', () => {
      const { score, factors } = assessLoginRisk({ ...BASE_CTX, recentFailedAttempts: 5 });
      expect(score).toBe(40);
      expect(factors.some((f) => f.name === 'brute_force')).toBe(true);
    });

    it('adds 40 points for 10 failures (brute_force not failed_attempts)', () => {
      const { score, factors } = assessLoginRisk({ ...BASE_CTX, recentFailedAttempts: 10 });
      expect(score).toBe(40);
      const names = factors.map((f) => f.name);
      expect(names).toContain('brute_force');
      expect(names).not.toContain('failed_attempts');
    });

    it('no penalty for 0-2 failures', () => {
      for (const n of [0, 1, 2]) {
        const { score } = assessLoginRisk({ ...BASE_CTX, recentFailedAttempts: n });
        expect(score).toBe(0);
      }
    });
  });

  // ── No MFA ────────────────────────────────────────────────────────────────────

  describe('no MFA factor', () => {
    it('adds 10 points when MFA is disabled', () => {
      const { score, factors } = assessLoginRisk({ ...BASE_CTX, mfaEnabled: false });
      expect(score).toBe(10);
      expect(factors.some((f) => f.name === 'no_mfa')).toBe(true);
    });
  });

  // ── Score combinations & actions ──────────────────────────────────────────────

  describe('risk action thresholds', () => {
    it('ALLOW for score < 30', () => {
      const { action } = assessLoginRisk({ ...BASE_CTX, mfaEnabled: false }); // +10
      expect(action).toBe('ALLOW');
    });

    it('STEP_UP_MFA for score in [30, 59]', () => {
      // unknown device (+25) + unusual hour (+15) = 40
      const ctx: LoginContext = {
        ...BASE_CTX,
        isKnownDevice: false,
        hourOfDay: 3,
        normalLoginHours: [9, 10],
      };
      const { action, score } = assessLoginRisk(ctx);
      expect(score).toBe(40);
      expect(action).toBe('STEP_UP_MFA');
    });

    it('BLOCK for score >= 60', () => {
      // Tor (+30) + unknown device (+25) + unknown location (+20) = 75
      const ctx: LoginContext = {
        ...BASE_CTX,
        isTorOrProxy: true,
        isKnownDevice: false,
        isKnownLocation: false,
      };
      const { action, score } = assessLoginRisk(ctx);
      expect(score).toBeGreaterThanOrEqual(60);
      expect(action).toBe('BLOCK');
    });

    it('score is capped at 100', () => {
      const ctx: LoginContext = {
        userId: 'u-x',
        ip: '10.0.0.1',
        isTorOrProxy: true,
        isKnownDevice: false,
        isKnownLocation: false,
        recentFailedAttempts: 10,
        mfaEnabled: false,
        hourOfDay: 2,
        normalLoginHours: [9, 10],
      };
      const { score } = assessLoginRisk(ctx);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  // ── Factor details ────────────────────────────────────────────────────────────

  describe('factor metadata', () => {
    it('each factor has name, points, reason', () => {
      const ctx: LoginContext = { ...BASE_CTX, isKnownDevice: false };
      const { factors } = assessLoginRisk(ctx);
      factors.forEach((f) => {
        expect(typeof f.name).toBe('string');
        expect(typeof f.points).toBe('number');
        expect(typeof f.reason).toBe('string');
        expect(f.reason.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('riskScoreToAction()', () => {
  it('returns ALLOW for score 0', () => expect(riskScoreToAction(0)).toBe('ALLOW'));
  it('returns ALLOW for score 29', () => expect(riskScoreToAction(29)).toBe('ALLOW'));
  it('returns STEP_UP_MFA for score 30', () => expect(riskScoreToAction(30)).toBe('STEP_UP_MFA'));
  it('returns STEP_UP_MFA for score 59', () => expect(riskScoreToAction(59)).toBe('STEP_UP_MFA'));
  it('returns BLOCK for score 60', () => expect(riskScoreToAction(60)).toBe('BLOCK'));
  it('returns BLOCK for score 100', () => expect(riskScoreToAction(100)).toBe('BLOCK'));
});
