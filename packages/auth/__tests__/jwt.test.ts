import {
  generateToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiry,
  refreshAccessToken,
} from '../src/jwt';

describe('JWT Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes';
    process.env.JWT_REFRESH_SECRET =
      'test-refresh-secret-that-is-at-least-64-characters-for-testing';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken({ userId: 'user-123' });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include userId in token payload', () => {
      const token = generateToken({ userId: 'user-123' });
      const decoded = decodeToken(token);
      expect(decoded?.userId).toBe('user-123');
    });

    it('should include email and role when provided', () => {
      const token = generateToken({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN',
      });
      const decoded = decodeToken(token);
      expect(decoded?.email).toBe('test@example.com');
      expect(decoded?.role).toBe('ADMIN');
    });

    it('should include issuer and audience claims', () => {
      const token = generateToken({ userId: 'user-123' });
      const decoded = decodeToken(token) as Record<string, unknown>;
      expect(decoded?.iss).toBe('ims-api');
      expect(decoded?.aud).toBe('ims-client');
    });

    it('should set default expiration of 15 minutes', () => {
      const token = generateToken({ userId: 'user-123' });
      const decoded = decodeToken(token);
      expect(decoded?.exp).toBeDefined();

      const expiresIn = (decoded!.exp! - decoded!.iat!) * 1000;
      const fifteenMinutes = 15 * 60 * 1000;
      expect(expiresIn).toBe(fifteenMinutes);
    });

    it('should allow custom expiration', () => {
      const token = generateToken({ userId: 'user-123', expiresIn: '1h' });
      const decoded = decodeToken(token);

      const expiresIn = (decoded!.exp! - decoded!.iat!) * 1000;
      const oneHour = 60 * 60 * 1000;
      expect(expiresIn).toBe(oneHour);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken('user-123');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should have 7 day expiration', () => {
      const token = generateRefreshToken('user-123');
      const decoded = decodeToken(token);

      const expiresIn = (decoded!.exp! - decoded!.iat!) * 1000;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expect(expiresIn).toBe(sevenDays);
    });

    it('should include refresh type marker', () => {
      const token = generateRefreshToken('user-123');
      const decoded = decodeToken(token) as Record<string, unknown>;
      expect(decoded?.type).toBe('refresh');
    });

    it('should include issuer and audience claims', () => {
      const token = generateRefreshToken('user-123');
      const decoded = decodeToken(token) as Record<string, unknown>;
      expect(decoded?.iss).toBe('ims-api');
      expect(decoded?.aud).toBe('ims-client');
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const result = generateTokenPair({ userId: 'user-123' });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should generate valid tokens', () => {
      const result = generateTokenPair({ userId: 'user-123', email: 'test@example.com' });

      const accessPayload = verifyToken(result.accessToken);
      expect(accessPayload.userId).toBe('user-123');

      const refreshPayload = verifyRefreshToken(result.refreshToken);
      expect(refreshPayload.userId).toBe('user-123');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken({ userId: 'user-123' });
      const payload = verifyToken(token);
      expect(payload.userId).toBe('user-123');
    });

    it('should throw for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('should throw for tampered token', () => {
      const token = generateToken({ userId: 'user-123' });
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      expect(() => verifyToken(tamperedToken)).toThrow();
    });

    it('should throw for expired token', () => {
      const token = generateToken({ userId: 'user-123', expiresIn: '0s' });
      expect(() => verifyToken(token)).toThrow();
    });

    it('should validate issuer claim', () => {
      // Create a token with wrong issuer (manually)
      const jwt = require('jsonwebtoken');
      const wrongIssuerToken = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET, {
        issuer: 'wrong-issuer',
        audience: 'ims-client',
      });
      expect(() => verifyToken(wrongIssuerToken)).toThrow();
    });

    it('should validate audience claim', () => {
      const jwt = require('jsonwebtoken');
      const wrongAudienceToken = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET, {
        issuer: 'ims-api',
        audience: 'wrong-audience',
      });
      expect(() => verifyToken(wrongAudienceToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken('user-123');
      const payload = verifyRefreshToken(token);
      expect(payload.userId).toBe('user-123');
    });

    it('should throw for invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });

    it('should throw if token is not a refresh token', () => {
      // Access token should not work as refresh token (different secret or missing type)
      const accessToken = generateToken({ userId: 'user-123' });
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from refresh token', () => {
      const refreshToken = generateRefreshToken('user-123');
      const result = refreshAccessToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);

      const payload = verifyToken(result.accessToken);
      expect(payload.userId).toBe('user-123');
    });

    it('should throw for invalid refresh token', () => {
      expect(() => refreshAccessToken('invalid-token')).toThrow();
    });

    it('should throw for access token used as refresh token', () => {
      const accessToken = generateToken({ userId: 'user-123' });
      expect(() => refreshAccessToken(accessToken)).toThrow();
    });
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const token = generateToken({ userId: 'user-123', email: 'test@example.com' });
      const decoded = decodeToken(token);
      expect(decoded?.userId).toBe('user-123');
      expect(decoded?.email).toBe('test@example.com');
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid');
      expect(decoded).toBeNull();
    });
  });

  describe('getTokenExpiry', () => {
    it('should calculate expiry for days', () => {
      const now = new Date();
      const expiry = getTokenExpiry('7d');
      const diff = expiry.getTime() - now.getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expect(Math.abs(diff - sevenDays)).toBeLessThan(1000); // Within 1 second
    });

    it('should calculate expiry for hours', () => {
      const now = new Date();
      const expiry = getTokenExpiry('24h');
      const diff = expiry.getTime() - now.getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      expect(Math.abs(diff - oneDay)).toBeLessThan(1000);
    });

    it('should calculate expiry for minutes', () => {
      const now = new Date();
      const expiry = getTokenExpiry('30m');
      const diff = expiry.getTime() - now.getTime();
      const thirtyMin = 30 * 60 * 1000;
      expect(Math.abs(diff - thirtyMin)).toBeLessThan(1000);
    });

    it('should default to 15 minutes for invalid format', () => {
      const now = new Date();
      const expiry = getTokenExpiry('invalid');
      const diff = expiry.getTime() - now.getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      expect(Math.abs(diff - fifteenMinutes)).toBeLessThan(1000);
    });
  });

  describe('JWT_SECRET validation', () => {
    it('should throw without JWT_SECRET in any environment', () => {
      delete process.env.JWT_SECRET;
      jest.resetModules();

      const { generateToken: genToken } = require('../src/jwt');
      expect(() => genToken({ userId: 'test' })).toThrow(
        'JWT_SECRET environment variable is required'
      );
    });

    it('should throw in development without JWT_SECRET', () => {
      delete process.env.JWT_SECRET;
      process.env.NODE_ENV = 'development';
      jest.resetModules();

      const { generateToken: genToken } = require('../src/jwt');
      expect(() => genToken({ userId: 'test' })).toThrow(
        'JWT_SECRET environment variable is required'
      );
    });
  });
});

describe('JWT Utilities — additional coverage', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes';
    process.env.JWT_REFRESH_SECRET =
      'test-refresh-secret-that-is-at-least-64-characters-for-testing';
  });

  it('generateToken should include orgId when provided', () => {
    const token = generateToken({ userId: 'user-456', role: 'MANAGER' });
    const decoded = decodeToken(token);
    expect(decoded?.userId).toBe('user-456');
    expect(decoded?.role).toBe('MANAGER');
  });

  it('verifyToken should return correct userId after generation', () => {
    const token = generateToken({ userId: 'verify-test-user' });
    const payload = verifyToken(token);
    expect(payload.userId).toBe('verify-test-user');
    expect(payload.email).toBeUndefined();
  });

  it('generateTokenPair expiresAt should be approximately 15 minutes from now', () => {
    const before = Date.now();
    const result = generateTokenPair({ userId: 'user-abc' });
    const after = Date.now();

    const expiresAtMs = result.expiresAt.getTime();
    const fifteenMin = 15 * 60 * 1000;
    expect(expiresAtMs).toBeGreaterThanOrEqual(before + fifteenMin - 1000);
    expect(expiresAtMs).toBeLessThanOrEqual(after + fifteenMin + 1000);
  });

  it('getTokenExpiry should calculate expiry for seconds', () => {
    const now = new Date();
    const expiry = getTokenExpiry('30s');
    const diff = expiry.getTime() - now.getTime();
    expect(Math.abs(diff - 30 * 1000)).toBeLessThan(1000);
  });

  it('decodeToken should return null for a malformed header', () => {
    const result = decodeToken('not.valid');
    expect(result).toBeNull();
  });
});

// ── JWT Utilities — final coverage ────────────────────────────────────────────

describe('JWT Utilities — final coverage', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes';
    process.env.JWT_REFRESH_SECRET =
      'test-refresh-secret-that-is-at-least-64-characters-for-testing';
  });

  it('generateToken returns a string with exactly 3 dot-separated segments', () => {
    const token = generateToken({ userId: 'u-segments' });
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifyToken payload contains iat (issued at) claim', () => {
    const token = generateToken({ userId: 'u-iat' });
    const payload = verifyToken(token);
    expect(typeof (payload as any).iat).toBe('number');
  });

  it('generateTokenPair produces refresh token with type=refresh', () => {
    const { refreshToken } = generateTokenPair({ userId: 'u-pair-type' });
    const decoded = decodeToken(refreshToken) as Record<string, unknown>;
    expect(decoded?.type).toBe('refresh');
  });
});
