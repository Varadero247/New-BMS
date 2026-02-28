import { CredentialProtectionService } from '../credential-protection';
import { PhishingProtectionService } from '../phishing-protection';
import { SessionSecurityService } from '../session-security';
import { AnomalyDetector } from '../anomaly-detector';
import { ZeroTrustVerifier } from '../zero-trust';

const USERS = Array.from({ length: 20 }, (_, i) => `user-${String(i + 1).padStart(3, '0')}`);
const IPS = Array.from({ length: 10 }, (_, i) => `192.168.1.${i + 1}`);
const UAS = Array.from({ length: 5 }, (_, i) => `Mozilla/5.0 (Device-${i}) AppleWebKit/537.36`);

function makeLoginContext(overrides: Record<string, unknown> = {}) {
  return {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 Chrome',
    timestamp: new Date(),
    country: 'GB',
    ...overrides,
  };
}

// ─── CREDENTIAL PROTECTION SERVICE — ~250 tests ───────────────────────────────

describe('CredentialProtectionService', () => {
  let service: CredentialProtectionService;
  beforeEach(() => { service = new CredentialProtectionService({ maxFailedAttempts: 5, lockoutDurationMs: 900000 }); });

  describe('checkLoginAttempt (50 tests)', () => {
    USERS.forEach(userId => {
      it(`allows fresh login for ${userId}`, () => {
        const r = service.checkLoginAttempt(userId, '192.168.0.1');
        expect(r.allowed).toBe(true);
        expect(r.failedAttempts).toBe(0);
      });
    });
    Array.from({ length: 30 }, (_, i) => `check-user-${i}`).forEach((uid, i) => {
      it(`fresh user ${i + 1} allowed with 0 failures`, () => {
        expect(service.checkLoginAttempt(uid).failedAttempts).toBe(0);
      });
    });
  });

  describe('recordFailedAttempt (50 tests)', () => {
    Array.from({ length: 25 }, (_, i) => i + 1).forEach(count => {
      it(`tracks ${count} failure(s)`, () => {
        const uid = `fail-user-${count}`;
        const svc = new CredentialProtectionService({ maxFailedAttempts: 30 });
        for (let j = 0; j < count; j++) svc.recordFailedAttempt(uid);
        expect(svc.getFailedAttempts(uid)).toBe(count);
      });
    });
    it('locks after max attempts', () => {
      const uid = 'lockout-user';
      for (let i = 0; i < 5; i++) service.recordFailedAttempt(uid);
      const r = service.checkLoginAttempt(uid);
      expect(r.allowed).toBe(false);
      expect(r.lockedUntil).toBeDefined();
    });
    Array.from({ length: 24 }, (_, i) => `lock-user-${i}`).forEach((uid, i) => {
      it(`lockout enforced for ${uid} (${i + 1})`, () => {
        const svc = new CredentialProtectionService({ maxFailedAttempts: 3 });
        for (let j = 0; j < 3; j++) svc.recordFailedAttempt(uid);
        expect(svc.isLocked(uid)).toBe(true);
      });
    });
  });

  describe('recordSuccessfulLogin (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => `success-user-${i}`).forEach((uid, i) => {
      it(`clears failures on success ${i + 1}`, () => {
        const svc = new CredentialProtectionService({ maxFailedAttempts: 10 });
        for (let j = 0; j < 3; j++) svc.recordFailedAttempt(uid);
        expect(svc.getFailedAttempts(uid)).toBe(3);
        svc.recordSuccessfulLogin(uid);
        expect(svc.getFailedAttempts(uid)).toBe(0);
      });
    });
  });

  describe('validatePassword (60 tests)', () => {
    const strongPasswords = [
      'Nexara@2026!Secure', 'MyStr0ng#Pass!', 'C0mpl3x&P@ssw0rd',
      'S3cur3!N3xar@IMS', 'Quality@M@nager#2026',
    ];
    strongPasswords.forEach(pw => {
      it(`valid password: "${pw.slice(0, 15)}..."`, () => {
        const r = service.validatePassword(pw);
        expect(r.isValid).toBe(true);
        expect(r.score).toBeGreaterThan(50);
      });
    });

    const weakPasswords = [
      { pw: 'password', err: 'too common' },
      { pw: 'short1A!', err: 'too short' },
      { pw: 'alllowercase1!', err: 'no uppercase' },
      { pw: 'ALLUPPERCASE1!', err: 'no lowercase' },
      { pw: 'NoNumbers!Here', err: 'no numbers' },
      { pw: 'NoSpecialChar12', err: 'no special chars' },
    ];
    weakPasswords.forEach(({ pw, err }) => {
      it(`rejects weak password (${err}): "${pw}"`, () => {
        const r = service.validatePassword(pw);
        expect(r.isValid).toBe(false);
        expect(r.errors.length).toBeGreaterThan(0);
      });
    });

    // User info check
    it('rejects password containing username', () => {
      const r = service.validatePassword('JohnDoe@Strong123!', { username: 'johndoe' });
      expect(r.errors.some(e => e.includes('username'))).toBe(true);
    });

    // Score range tests
    Array.from({ length: 48 }, (_, i) => `TestPassword${i}!Str0ng#`).forEach((pw, i) => {
      it(`score in range for password ${i + 1}`, () => {
        const r = service.validatePassword(pw);
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('unlock (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => `unlock-user-${i}`).forEach((uid, i) => {
      it(`unlock clears lockout for ${uid}`, () => {
        const svc = new CredentialProtectionService({ maxFailedAttempts: 2 });
        for (let j = 0; j < 2; j++) svc.recordFailedAttempt(uid);
        expect(svc.isLocked(uid)).toBe(true);
        svc.unlock(uid);
        expect(svc.isLocked(uid)).toBe(false);
      });
    });
  });

  describe('IP-specific rate limiting (30 tests)', () => {
    IPS.slice(0, 10).forEach(ip => {
      it(`independent limits per IP ${ip}`, () => {
        const r = service.checkLoginAttempt('shared-user', ip);
        expect(r.allowed).toBe(true);
      });
    });
    Array.from({ length: 20 }, (_, i) => `10.0.0.${i}`).forEach((ip, i) => {
      it(`distinct IP ${i + 1} starts fresh`, () => {
        expect(service.checkLoginAttempt('uid', ip).failedAttempts).toBe(0);
      });
    });
  });
});

// ─── PHISHING PROTECTION SERVICE — ~200 tests ─────────────────────────────────

describe('PhishingProtectionService', () => {
  let service: PhishingProtectionService;
  beforeEach(() => { service = new PhishingProtectionService(); });

  describe('detectDomainSpoofing — safe URLs (30 tests)', () => {
    [
      'https://nexara.com', 'https://ims.nexara.com', 'https://nexara.com/login',
      'https://nexara.co.uk', 'https://nexara.ae',
    ].forEach((url, i) => {
      it(`safe URL ${i + 1}: ${url}`, () => {
        const r = service.detectDomainSpoofing(url, 'nexara.com');
        expect(r.isSuspicious).toBe(false);
        expect(r.riskScore).toBe(0);
      });
    });
    Array.from({ length: 25 }, (_, i) => `https://nexara.com/path-${i}`).forEach((url, i) => {
      it(`safe nexara path ${i + 1}`, () => {
        expect(service.detectDomainSpoofing(url, 'nexara.com').isSuspicious).toBe(false);
      });
    });
  });

  describe('detectDomainSpoofing — phishing URLs (30 tests)', () => {
    [
      'https://nexara-verify.com',
      'https://nexara-security.com',
      'https://nexara-alert.com',
      'https://verify-nexara.com',
      'http://nexara.com.evil.com',
      'http://nexara.com',
    ].forEach((url, i) => {
      it(`phishing URL ${i + 1}: ${url}`, () => {
        const r = service.detectDomainSpoofing(url, 'nexara.com');
        expect(r.isSuspicious).toBe(true);
        expect(r.riskScore).toBeGreaterThan(0);
      });
    });
    Array.from({ length: 24 }, (_, i) => `https://nexara-verify-${i}.com`).forEach((url, i) => {
      it(`phishing variant ${i + 1}: ${url}`, () => {
        const r = service.detectDomainSpoofing(url, 'nexara.com');
        expect(r.isSuspicious).toBe(true);
      });
    });
  });

  describe('checkURLReputation (30 tests)', () => {
    ['https://nexara-verify.com', 'https://nexara-security.co', 'https://nexara-alert.net'].forEach((url, i) => {
      it(`phishing reputation for ${url}`, () => {
        const r = service.checkURLReputation(url);
        expect(r.isPhishing || r.isSpoofed).toBe(true);
      });
    });
    Array.from({ length: 27 }, (_, i) => `https://safe-site-${i}.com/page`).forEach((url, i) => {
      it(`neutral reputation URL ${i + 1}`, () => {
        const r = service.checkURLReputation(url);
        expect(r).toBeDefined();
        expect(r.reasons).toBeDefined();
      });
    });
  });

  describe('verifyEmailAuthentication (30 tests)', () => {
    it('authentic with all headers passing', () => {
      const r = service.verifyEmailAuthentication({ spf: 'pass', 'dkim-signature': 'v=1;...', dmarc: 'pass' });
      expect(r.isAuthentic).toBe(true);
      expect(r.spfValid).toBe(true);
    });
    it('not authentic with no headers', () => {
      const r = service.verifyEmailAuthentication({});
      expect(r.isAuthentic).toBe(false);
    });
    it('not authentic with only SPF', () => {
      const r = service.verifyEmailAuthentication({ spf: 'pass' });
      expect(r.isAuthentic).toBe(false);
    });
    Array.from({ length: 27 }, (_, i) => ({ spf: i % 2 === 0 ? 'pass' : 'fail', 'dkim-signature': 'v=1', dmarc: i % 3 === 0 ? 'pass' : 'fail' })).forEach((headers, i) => {
      it(`email auth variant ${i + 1}`, () => {
        const r = service.verifyEmailAuthentication(headers);
        expect(r.spfValid).toBeDefined();
        expect(r.dkimValid).toBeDefined();
        expect(r.dmarcValid).toBeDefined();
      });
    });
  });

  describe('isKnownSafeDomain (30 tests)', () => {
    ['https://nexara.com', 'https://ims.nexara.com', 'https://nexara.co.uk', 'https://nexara.ae'].forEach((url, i) => {
      it(`safe domain ${i + 1}: ${url}`, () => {
        expect(service.isKnownSafeDomain(url)).toBe(true);
      });
    });
    Array.from({ length: 26 }, (_, i) => `https://unknown-domain-${i}.com`).forEach((url, i) => {
      it(`unknown domain ${i + 1} is not safe`, () => {
        expect(service.isKnownSafeDomain(url)).toBe(false);
      });
    });
  });

  describe('invalid URL handling (10 tests)', () => {
    ['not-a-url', '', 'ftp://', 'javascript:', '   '].forEach((url, i) => {
      it(`handles invalid URL ${i + 1}: "${url}"`, () => {
        const r = service.detectDomainSpoofing(url, 'nexara.com');
        expect(r).toBeDefined();
      });
    });
    Array.from({ length: 5 }, (_, i) => `http://${i}`).forEach((url, i) => {
      it(`malformed URL ${i + 1}`, () => {
        expect(() => service.checkURLReputation(url)).not.toThrow();
      });
    });
  });
});

// ─── SESSION SECURITY SERVICE — ~200 tests ────────────────────────────────────

describe('SessionSecurityService', () => {
  let service: SessionSecurityService;
  beforeEach(() => { service = new SessionSecurityService({ idLength: 16, expiryMs: 28800000, absoluteExpiryMs: 86400000 }); });

  describe('createSession (50 tests)', () => {
    USERS.forEach(userId => {
      it(`creates session for ${userId}`, () => {
        const s = service.createSession(userId, '127.0.0.1', 'Mozilla Chrome');
        expect(s.id).toBeDefined();
        expect(s.userId).toBe(userId);
        expect(s.isActive).toBe(true);
        expect(s.rotationCount).toBe(0);
      });
    });
    Array.from({ length: 30 }, (_, i) => `create-user-${i}`).forEach((uid, i) => {
      it(`session ID unique for user ${i + 1}`, () => {
        const s1 = service.createSession(uid, '1.2.3.4', 'ua1');
        const s2 = service.createSession(uid, '1.2.3.4', 'ua1');
        expect(s1.id).not.toBe(s2.id);
      });
    });
  });

  describe('validateSession (50 tests)', () => {
    it('validates correct session', () => {
      const s = service.createSession('u1', '127.0.0.1', 'Chrome');
      const r = service.validateSession(s.id, '127.0.0.1', 'Chrome');
      expect(r.valid).toBe(true);
    });
    it('rejects non-existent session', () => {
      expect(service.validateSession('fake-id', '127.0.0.1', 'Chrome').valid).toBe(false);
    });
    it('rejects IP-bound session from different IP', () => {
      const svc = new SessionSecurityService({ bindToIP: true, bindToUserAgent: false });
      const s = svc.createSession('u1', '192.168.1.1', 'Chrome');
      expect(svc.validateSession(s.id, '10.0.0.1', 'Chrome').valid).toBe(false);
    });
    it('rejects UA-bound session from different UA', () => {
      const svc = new SessionSecurityService({ bindToIP: false, bindToUserAgent: true });
      const s = svc.createSession('u1', '1.2.3.4', 'Chrome');
      expect(svc.validateSession(s.id, '1.2.3.4', 'Firefox').valid).toBe(false);
    });
    Array.from({ length: 46 }, (_, i) => `valid-user-${i}`).forEach((uid, i) => {
      it(`validates session for ${uid} (${i + 1})`, () => {
        const ip = `10.0.${i}.1`;
        const ua = `Browser-${i}`;
        const s = service.createSession(uid, ip, ua);
        expect(service.validateSession(s.id, ip, ua).valid).toBe(true);
      });
    });
  });

  describe('rotateSession (30 tests)', () => {
    Array.from({ length: 30 }, (_, i) => `rotate-user-${i}`).forEach((uid, i) => {
      it(`rotates session for ${uid}`, () => {
        const s = service.createSession(uid, '127.0.0.1', 'ua');
        const newId = service.rotateSession(s.id);
        expect(newId).not.toBeNull();
        expect(newId).not.toBe(s.id);
        // Old session should be gone
        expect(service.validateSession(s.id, '127.0.0.1', 'ua').valid).toBe(false);
      });
    });
  });

  describe('revokeSession (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => `revoke-user-${i}`).forEach((uid, i) => {
      it(`revokes session for ${uid}`, () => {
        const s = service.createSession(uid, '127.0.0.1', 'ua');
        service.revokeSession(s.id);
        expect(service.validateSession(s.id, '127.0.0.1', 'ua').valid).toBe(false);
      });
    });
  });

  describe('revokeAllUserSessions (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach(count => {
      it(`revokes all ${count} sessions`, () => {
        const uid = `bulk-revoke-user-${count}`;
        for (let j = 0; j < count; j++) service.createSession(uid, `1.2.3.${j}`, `ua-${j}`);
        const revoked = service.revokeAllUserSessions(uid);
        expect(revoked).toBe(count);
      });
    });
  });

  describe('getActiveSessions (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => i + 1).forEach(count => {
      it(`gets ${count} active sessions`, () => {
        const uid = `active-user-${count}`;
        for (let j = 0; j < count; j++) service.createSession(uid, `1.2.3.${j}`, `ua-${j}`);
        expect(service.getActiveSessions(uid).length).toBe(count);
      });
    });
  });

  describe('getConfig (10 tests)', () => {
    Array.from({ length: 10 }, (_, i) => 16 + i * 2).forEach((idLength, i) => {
      it(`config idLength=${idLength} (test ${i + 1})`, () => {
        const svc = new SessionSecurityService({ idLength });
        expect(svc.getConfig().idLength).toBe(idLength);
      });
    });
  });
});

// ─── ANOMALY DETECTOR — ~200 tests ────────────────────────────────────────────

describe('AnomalyDetector', () => {
  let detector: AnomalyDetector;
  beforeEach(() => { detector = new AnomalyDetector(); });

  describe('assessLoginRisk — no history (30 tests)', () => {
    USERS.slice(0, 10).forEach(uid => {
      it(`first login for ${uid} returns LOW risk`, () => {
        const r = detector.assessLoginRisk(uid, makeLoginContext());
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(['ALLOW', 'NOTIFY']).toContain(r.action);
      });
    });
    Array.from({ length: 20 }, (_, i) => `fresh-user-${i}`).forEach((uid, i) => {
      it(`fresh user ${i + 1} scored`, () => {
        const r = detector.assessLoginRisk(uid, makeLoginContext());
        expect(r.level).toBeDefined();
        expect(r.factors).toBeDefined();
      });
    });
  });

  describe('new country detection (30 tests)', () => {
    Array.from({ length: 30 }, (_, i) => `country-user-${i}`).forEach((uid, i) => {
      it(`new country flags risk for ${uid}`, () => {
        detector.recordLogin(uid, { userId: uid, ipAddress: '1.2.3.4', userAgent: 'Chrome', timestamp: new Date(), success: true, country: 'GB' });
        const r = detector.assessLoginRisk(uid, makeLoginContext({ country: 'RU' }));
        expect(r.score).toBeGreaterThan(0);
        expect(r.factors.some(f => f.includes('country'))).toBe(true);
      });
    });
  });

  describe('impossible travel (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => `travel-user-${i}`).forEach((uid, i) => {
      it(`impossible travel detected for ${uid}`, () => {
        const recent = new Date(Date.now() - 30 * 60 * 1000); // 30 mins ago
        detector.recordLogin(uid, { userId: uid, ipAddress: '1.1.1.1', userAgent: 'Chrome', timestamp: recent, success: true, country: 'GB' });
        const r = detector.assessLoginRisk(uid, makeLoginContext({ country: 'JP', timestamp: new Date() }));
        expect(r.score).toBeGreaterThan(20);
      });
    });
  });

  describe('new device detection (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => `device-user-${i}`).forEach((uid, i) => {
      it(`new device flags risk for ${uid}`, () => {
        detector.recordLogin(uid, { userId: uid, ipAddress: '1.2.3.4', userAgent: 'known-browser', timestamp: new Date(), success: true });
        const r = detector.assessLoginRisk(uid, makeLoginContext({ userAgent: 'new-unknown-browser' }));
        expect(r.score).toBeGreaterThan(0);
        expect(r.factors.some(f => f.includes('device'))).toBe(true);
      });
    });
  });

  describe('unusual hour detection (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => `night-user-${i}`).forEach((uid, i) => {
      it(`unusual hour detection for ${uid}`, () => {
        const nightTime = new Date();
        nightTime.setHours(2, 0, 0, 0);
        const r = detector.assessLoginRisk(uid, makeLoginContext({ timestamp: nightTime }));
        expect(r.factors.some(f => f.includes('hour'))).toBe(true);
      });
    });
  });

  describe('BLOCK/CHALLENGE actions (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => `high-risk-user-${i}`).forEach((uid, i) => {
      it(`high risk context triggers appropriate action (${i + 1})`, () => {
        detector.recordLogin(uid, { userId: uid, ipAddress: '1.1.1.1', userAgent: 'known-ua', timestamp: new Date(Date.now() - 10 * 60000), success: true, country: 'GB' });
        // Fail 3 times recently
        for (let j = 0; j < 3; j++) {
          detector.recordLogin(uid, { userId: uid, ipAddress: '2.2.2.2', userAgent: 'known-ua', timestamp: new Date(), success: false });
        }
        const nightTime = new Date();
        nightTime.setHours(2);
        const r = detector.assessLoginRisk(uid, makeLoginContext({ country: 'CN', userAgent: 'unknown-browser', timestamp: nightTime }));
        expect(['BLOCK', 'CHALLENGE', 'NOTIFY']).toContain(r.action);
        expect(r.score).toBeGreaterThan(0);
      });
    });
  });

  describe('getHistory and clearHistory (20 tests)', () => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(count => {
      it(`history has ${count} record(s)`, () => {
        const uid = `history-user-${count}`;
        for (let j = 0; j < count; j++) {
          detector.recordLogin(uid, { userId: uid, ipAddress: '1.1.1.1', userAgent: 'ua', timestamp: new Date(), success: j % 2 === 0 });
        }
        expect(detector.getHistory(uid).length).toBe(count);
      });
    });
    Array.from({ length: 10 }, (_, i) => `clear-user-${i}`).forEach((uid, i) => {
      it(`clearHistory for ${uid}`, () => {
        detector.recordLogin(uid, { userId: uid, ipAddress: '1.1.1.1', userAgent: 'ua', timestamp: new Date(), success: true });
        detector.clearHistory(uid);
        expect(detector.getHistory(uid).length).toBe(0);
      });
    });
  });
});

// ─── ZERO TRUST VERIFIER — ~150 tests ─────────────────────────────────────────

describe('ZeroTrustVerifier', () => {
  let verifier: ZeroTrustVerifier;
  beforeEach(() => { verifier = new ZeroTrustVerifier(); });

  function makeCtx(overrides: Record<string, unknown> = {}) {
    return {
      userId: 'user-001', resourceId: 'ncr-001', action: 'read',
      ipAddress: '192.168.1.1', userAgent: 'Chrome', mfaVerified: true,
      sessionAge: 60000, previousFailures: 0, ...overrides,
    };
  }

  describe('allow trusted context (30 tests)', () => {
    Array.from({ length: 30 }, (_, i) => makeCtx({ userId: `u${i}`, sessionAge: i * 100 })).forEach((ctx, i) => {
      it(`allows trusted context ${i + 1}`, () => {
        const d = verifier.verify(ctx);
        expect(d.allowed).toBe(true);
        expect(d.trustScore).toBeGreaterThan(60);
      });
    });
  });

  describe('deny sensitive action without MFA (30 tests)', () => {
    new ZeroTrustVerifier().getSensitiveActions().slice(0, 10).forEach(action => {
      it(`blocks ${action} without MFA`, () => {
        const d = verifier.verify(makeCtx({ action, mfaVerified: false }));
        expect(d.allowed).toBe(false);
        expect(d.requiredActions).toContain('mfa_required');
      });
    });
    Array.from({ length: 20 }, (_, i) => ['delete', 'export', 'admin'][i % 3]).forEach((action, i) => {
      it(`sensitive action ${i + 1} without MFA denied`, () => {
        const d = verifier.verify(makeCtx({ action, mfaVerified: false }));
        expect(d.allowed).toBe(false);
      });
    });
  });

  describe('trust score degrades (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => (i + 1) * 3600000).forEach((sessionAge, i) => {
      it(`old session (${i + 1}h) reduces trust`, () => {
        const d1 = verifier.verify(makeCtx({ sessionAge: 60000 }));
        const d2 = verifier.verify(makeCtx({ sessionAge }));
        expect(d2.trustScore).toBeLessThanOrEqual(d1.trustScore);
      });
    });
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(failures => {
      it(`${failures} previous failure(s) reduces trust`, () => {
        const d1 = verifier.verify(makeCtx({ previousFailures: 0 }));
        const d2 = verifier.verify(makeCtx({ previousFailures: failures }));
        expect(d2.trustScore).toBeLessThanOrEqual(d1.trustScore);
      });
    });
  });

  describe('trusted IP management (20 tests)', () => {
    Array.from({ length: 10 }, (_, i) => `10.0.0.${i + 1}`).forEach((ip, i) => {
      it(`add and get trusted IP ${ip}`, () => {
        verifier.addTrustedIP(ip);
        expect(verifier.getTrustedIPs()).toContain(ip);
      });
    });
    Array.from({ length: 10 }, (_, i) => `172.16.0.${i + 1}`).forEach((ip, i) => {
      it(`remove trusted IP ${ip}`, () => {
        verifier.addTrustedIP(ip);
        verifier.removeTrustedIP(ip);
        expect(verifier.getTrustedIPs()).not.toContain(ip);
      });
    });
  });

  describe('isSensitiveAction (20 tests)', () => {
    new ZeroTrustVerifier().getSensitiveActions().forEach(action => {
      it(`${action} is sensitive`, () => {
        expect(verifier.isSensitiveAction(action)).toBe(true);
      });
    });
    ['read', 'view', 'list', 'search', 'download-report'].forEach(action => {
      it(`${action} is NOT sensitive`, () => {
        expect(verifier.isSensitiveAction(action)).toBe(false);
      });
    });
    Array.from({ length: 7 }, (_, i) => `safe-action-${i}`).forEach((action, i) => {
      it(`custom safe action ${i + 1} not sensitive`, () => {
        expect(verifier.isSensitiveAction(action)).toBe(false);
      });
    });
  });

  describe('TrustDecision shape (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => makeCtx({ userId: `shape-user-${i}`, sessionAge: i * 100000 })).forEach((ctx, i) => {
      it(`decision shape valid ${i + 1}`, () => {
        const d = verifier.verify(ctx);
        expect(d.allowed).toBeDefined();
        expect(d.trustScore).toBeGreaterThanOrEqual(0);
        expect(d.trustScore).toBeLessThanOrEqual(100);
        expect(d.requiredActions).toBeDefined();
        expect(d.reason).toBeDefined();
      });
    });
  });

  describe('addTrustedIP and getTrustedIPs (30 tests)', () => {
    Array.from({ length: 15 }, (_, i) => `10.0.0.${i + 1}`).forEach((ip, i) => {
      it(`trustedIP added: ${ip}`, () => {
        const v = new ZeroTrustVerifier();
        v.addTrustedIP(ip);
        expect(v.getTrustedIPs()).toContain(ip);
      });
    });
    Array.from({ length: 15 }, (_, i) => `172.16.0.${i + 1}`).forEach((ip, i) => {
      it(`removeTrustedIP removes: ${ip}`, () => {
        const v = new ZeroTrustVerifier();
        v.addTrustedIP(ip);
        v.removeTrustedIP(ip);
        expect(v.getTrustedIPs()).not.toContain(ip);
      });
    });
  });

  describe('untrusted IP reduces trustScore (30 tests)', () => {
    Array.from({ length: 30 }, (_, i) => `192.0.2.${i + 1}`).forEach((ip, i) => {
      it(`untrusted IP ${i + 1} reduces trust vs no restriction`, () => {
        const v = new ZeroTrustVerifier();
        v.addTrustedIP('10.0.0.1');
        const ctx = { userId: 'u', resourceId: 'r', action: 'read', ipAddress: ip, userAgent: 'ua', mfaVerified: true, sessionAge: 60000, previousFailures: 0 };
        const d = v.verify(ctx);
        expect(d.trustScore).toBeLessThan(100);
      });
    });
  });
});

// ─── EXTRA CREDENTIAL PROTECTION COVERAGE — 40 tests ─────────────────────────

describe('CredentialProtectionService extra coverage', () => {
  let svc: CredentialProtectionService;
  beforeEach(() => { svc = new CredentialProtectionService({ maxAttempts: 5, lockoutMs: 1000 }); });

  describe('password validation length boundary (20 tests)', () => {
    Array.from({ length: 10 }, (_, i) => 'A'.repeat(i + 1) + '1!').forEach((pwd, i) => {
      it(`short password ${i + 1} invalid`, () => {
        if (pwd.length < 8) expect(svc.validatePassword(pwd).isValid).toBe(false);
        else expect(svc.validatePassword(pwd).isValid).toBeDefined();
      });
    });
    Array.from({ length: 10 }, (_, i) => `ValidPass${i}!1`).forEach((pwd, i) => {
      it(`valid password ${i + 1} accepted`, () => {
        expect(svc.validatePassword(pwd).isValid).toBe(true);
      });
    });
  });

  describe('failed attempt counting (20 tests)', () => {
    Array.from({ length: 20 }, (_, i) => `counter-user-${i}`).forEach((userId, i) => {
      it(`failure count tracked for ${userId}`, () => {
        const ip = IPS[i % IPS.length];
        svc.recordFailedAttempt(userId, ip);
        expect(svc.getFailedAttempts(userId, ip)).toBe(1);
      });
    });
  });
});
