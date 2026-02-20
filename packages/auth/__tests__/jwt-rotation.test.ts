import {
  JwtKeyRotationManager,
  jwtKeyManager,
  type JwtKeyRecord,
} from '../src/jwt-rotation';
import jwt from 'jsonwebtoken';

describe('JwtKeyRotationManager', () => {
  let manager: JwtKeyRotationManager;

  beforeEach(() => {
    manager = new JwtKeyRotationManager(60_000); // 60s grace period for tests
  });

  // ── Construction ────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with zero keys', () => {
      expect(manager.keyCount).toBe(0);
    });

    it('throws when getActiveKey() called before rotateKey()', () => {
      expect(() => manager.getActiveKey()).toThrow('No active JWT key');
    });
  });

  // ── rotateKey() ─────────────────────────────────────────────────────────────

  describe('rotateKey()', () => {
    it('generates a key with required fields', async () => {
      const key = await manager.rotateKey();
      expect(key.keyId).toBeTruthy();
      expect(key.secret.length).toBeGreaterThan(40);
      expect(key.algorithm).toBe('HS256');
      expect(key.createdAt).toBeInstanceOf(Date);
      expect(key.deprecatedAt).toBeNull();
      expect(key.expiresAt).toBeInstanceOf(Date);
    });

    it('increments keyCount', async () => {
      await manager.rotateKey();
      expect(manager.keyCount).toBe(1);
    });

    it('second rotation adds second key', async () => {
      await manager.rotateKey();
      await manager.rotateKey();
      expect(manager.keyCount).toBe(2);
    });

    it('marks previous key as deprecated on second rotation', async () => {
      const k1 = await manager.rotateKey();
      const k2 = await manager.rotateKey();
      // k1 should now be deprecated
      const found = manager.getKeyById(k1.keyId);
      expect(found?.deprecatedAt).toBeInstanceOf(Date);
      // k2 is the active key
      expect(manager.getActiveKey().keyId).toBe(k2.keyId);
    });

    it('generates unique secrets on each rotation', async () => {
      const k1 = await manager.rotateKey();
      const k2 = await manager.rotateKey();
      expect(k1.secret).not.toBe(k2.secret);
    });

    it('generates unique key IDs on each rotation', async () => {
      const k1 = await manager.rotateKey();
      const k2 = await manager.rotateKey();
      expect(k1.keyId).not.toBe(k2.keyId);
    });
  });

  // ── getActiveKey() ───────────────────────────────────────────────────────────

  describe('getActiveKey()', () => {
    it('returns the most recently rotated key', async () => {
      const k1 = await manager.rotateKey();
      expect(manager.getActiveKey().keyId).toBe(k1.keyId);

      const k2 = await manager.rotateKey();
      expect(manager.getActiveKey().keyId).toBe(k2.keyId);
    });
  });

  // ── getKeyById() ─────────────────────────────────────────────────────────────

  describe('getKeyById()', () => {
    it('returns active key by ID', async () => {
      const k = await manager.rotateKey();
      expect(manager.getKeyById(k.keyId)?.keyId).toBe(k.keyId);
    });

    it('returns deprecated key within grace period', async () => {
      const k1 = await manager.rotateKey();
      await manager.rotateKey(); // deprecates k1
      expect(manager.getKeyById(k1.keyId)).not.toBeNull();
    });

    it('returns null for unknown key ID', async () => {
      await manager.rotateKey();
      expect(manager.getKeyById('nonexistent')).toBeNull();
    });

    it('returns null for expired keys', async () => {
      // Use a manager with a 1ms grace period so keys expire immediately
      const shortManager = new JwtKeyRotationManager(1);
      const k1 = await shortManager.rotateKey();
      await shortManager.rotateKey();
      // Wait for grace period to pass
      await new Promise((r) => setTimeout(r, 10));
      expect(shortManager.getKeyById(k1.keyId)).toBeNull();
    });
  });

  // ── sign() & verify() ────────────────────────────────────────────────────────

  describe('sign() and verify()', () => {
    it('signs and verifies a payload', async () => {
      await manager.rotateKey();
      const payload = { userId: 'u-1', email: 'a@b.com', role: 'admin' };
      const token = manager.sign(payload, '5m');
      const decoded = manager.verify(token);
      expect(decoded.userId).toBe('u-1');
      expect(decoded.email).toBe('a@b.com');
    });

    it('token header contains kid', async () => {
      const k = await manager.rotateKey();
      const token = manager.sign({ userId: 'u-1', role: 'user' }, '5m');
      const decoded = jwt.decode(token, { complete: true });
      expect((decoded?.header as { kid?: string })?.kid).toBe(k.keyId);
    });

    it('verifies token signed with deprecated key', async () => {
      const k1 = await manager.rotateKey();
      const token = manager.sign({ userId: 'u-1', role: 'user' }, '5m');
      // Rotate — k1 becomes deprecated but still valid
      await manager.rotateKey();
      expect(() => manager.verify(token)).not.toThrow();
    });

    it('throws on tampered token', async () => {
      await manager.rotateKey();
      const token = manager.sign({ userId: 'u-1', role: 'user' }, '5m');
      const tampered = token.slice(0, -3) + 'xxx';
      expect(() => manager.verify(tampered)).toThrow();
    });

    it('throws before any key is generated', () => {
      expect(() => manager.sign({ userId: 'u-1', role: 'user' }, '5m')).toThrow();
    });
  });

  // ── isKeyValid() ─────────────────────────────────────────────────────────────

  describe('isKeyValid()', () => {
    it('returns true for active key', async () => {
      const k = await manager.rotateKey();
      expect(manager.isKeyValid(k.keyId)).toBe(true);
    });

    it('returns false for unknown key', async () => {
      expect(manager.isKeyValid('bogus')).toBe(false);
    });
  });

  // ── Singleton export ─────────────────────────────────────────────────────────

  describe('jwtKeyManager singleton', () => {
    it('is an instance of JwtKeyRotationManager', () => {
      expect(jwtKeyManager).toBeInstanceOf(JwtKeyRotationManager);
    });
  });
});
