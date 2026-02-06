import {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiry,
} from '../src/jwt';

describe('JWT Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-at-least-64-characters-for-testing';
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

    it('should set default expiration of 7 days', () => {
      const token = generateToken({ userId: 'user-123' });
      const decoded = decodeToken(token);
      expect(decoded?.exp).toBeDefined();

      const expiresIn = (decoded!.exp! - decoded!.iat!) * 1000;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expect(expiresIn).toBe(sevenDays);
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

    it('should have 30 day expiration', () => {
      const token = generateRefreshToken('user-123');
      const decoded = decodeToken(token);

      const expiresIn = (decoded!.exp! - decoded!.iat!) * 1000;
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      expect(expiresIn).toBe(thirtyDays);
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
      // Small delay to ensure token expires
      expect(() => verifyToken(token)).toThrow();
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

    it('should default to 7 days for invalid format', () => {
      const now = new Date();
      const expiry = getTokenExpiry('invalid');
      const diff = expiry.getTime() - now.getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expect(Math.abs(diff - sevenDays)).toBeLessThan(1000);
    });
  });

  describe('JWT_SECRET validation', () => {
    it('should throw in production without JWT_SECRET', () => {
      delete process.env.JWT_SECRET;
      process.env.NODE_ENV = 'production';

      // Clear module cache to re-evaluate the module
      jest.resetModules();

      // Re-import after changing env
      const { generateToken: genToken } = require('../src/jwt');
      expect(() => genToken({ userId: 'test' })).toThrow('JWT_SECRET environment variable is required in production');
    });

    it('should warn in development without JWT_SECRET', () => {
      delete process.env.JWT_SECRET;
      process.env.NODE_ENV = 'development';

      jest.resetModules();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { generateToken: genToken } = require('../src/jwt');
      const token = genToken({ userId: 'test' });

      expect(token).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SECURITY WARNING'));

      consoleSpy.mockRestore();
    });
  });
});
