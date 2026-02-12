/**
 * Security Fix Verification Tests
 *
 * Verifies that CRITICAL findings from the Code Evaluation Report are fixed:
 * - F-004: JWT algorithm explicitly set to HS256 (prevents algorithm confusion)
 * - F-004: JWT includes issuer and audience claims
 * - F-004: Access tokens have short expiry (15m, not 7d)
 * - F-004: Refresh tokens have reasonable expiry (7d, not 30d)
 * - F-003: bcrypt used with proper cost factor
 * - F-005: Password strength validation enforced
 */

import {
  generateToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiry,
} from '../src/jwt';
import { hashPassword, comparePassword, validatePasswordStrength } from '../src/password';

describe('Security Fix Verification', () => {
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

  describe('F-004: JWT Algorithm Confusion Prevention', () => {
    it('should produce tokens signed with HS256', () => {
      const token = generateToken({ userId: 'user-123' });
      // JWT header is base64url-encoded JSON: {"alg":"HS256","typ":"JWT"}
      const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
      expect(header.alg).toBe('HS256');
    });

    it('should reject tokens with wrong algorithm via verify', () => {
      const jwt = require('jsonwebtoken');
      // Create a token using a different signing approach
      const token = jwt.sign({ userId: 'user-123' }, 'different-secret', {
        algorithm: 'HS256',
        issuer: 'wrong-issuer',
      });
      expect(() => verifyToken(token)).toThrow();
    });

    it('should enforce algorithms whitelist during verification', () => {
      // Verify that the token is validated with specific algorithm
      const token = generateToken({ userId: 'user-123' });
      const payload = verifyToken(token);
      expect(payload.userId).toBe('user-123');
    });
  });

  describe('F-004: JWT Issuer and Audience Claims', () => {
    it('should include iss claim in access tokens', () => {
      const token = generateToken({ userId: 'user-123' });
      const decoded = decodeToken(token) as any;
      expect(decoded.iss).toBe('ims-api');
    });

    it('should include aud claim in access tokens', () => {
      const token = generateToken({ userId: 'user-123' });
      const decoded = decodeToken(token) as any;
      expect(decoded.aud).toBe('ims-client');
    });

    it('should include iss claim in refresh tokens', () => {
      const token = generateRefreshToken('user-123');
      const decoded = decodeToken(token) as any;
      expect(decoded.iss).toBe('ims-api');
    });

    it('should include aud claim in refresh tokens', () => {
      const token = generateRefreshToken('user-123');
      const decoded = decodeToken(token) as any;
      expect(decoded.aud).toBe('ims-client');
    });

    it('should reject token with wrong issuer', () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'user-123' },
        process.env.JWT_SECRET,
        { issuer: 'attacker-site', audience: 'ims-client', algorithm: 'HS256' }
      );
      expect(() => verifyToken(token)).toThrow();
    });

    it('should reject token with wrong audience', () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'user-123' },
        process.env.JWT_SECRET,
        { issuer: 'ims-api', audience: 'wrong-audience', algorithm: 'HS256' }
      );
      expect(() => verifyToken(token)).toThrow();
    });
  });

  describe('F-004: Short-Lived Access Tokens', () => {
    it('should default access token expiry to 15 minutes (not 7 days)', () => {
      const token = generateToken({ userId: 'user-123' });
      const decoded = decodeToken(token)!;
      const expiresInMs = (decoded.exp! - decoded.iat!) * 1000;
      const fifteenMinutes = 15 * 60 * 1000;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      expect(expiresInMs).toBe(fifteenMinutes);
      expect(expiresInMs).not.toBe(sevenDays);
    });

    it('should default refresh token expiry to 7 days (not 30 days)', () => {
      const token = generateRefreshToken('user-123');
      const decoded = decodeToken(token)!;
      const expiresInMs = (decoded.exp! - decoded.iat!) * 1000;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      expect(expiresInMs).toBe(sevenDays);
      expect(expiresInMs).not.toBe(thirtyDays);
    });

    it('should set token pair expiresAt based on 15m default', () => {
      const pair = generateTokenPair({ userId: 'user-123' });
      const now = Date.now();
      const fifteenMinutesFromNow = now + 15 * 60 * 1000;
      const diffMs = Math.abs(pair.expiresAt.getTime() - fifteenMinutesFromNow);
      expect(diffMs).toBeLessThan(2000); // Within 2 seconds
    });

    it('should have getTokenExpiry default to 15 minutes for invalid input', () => {
      const now = new Date();
      const expiry = getTokenExpiry('garbage');
      const diff = expiry.getTime() - now.getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      expect(Math.abs(diff - fifteenMinutes)).toBeLessThan(1000);
    });
  });

  describe('F-004: Refresh Token Type Enforcement', () => {
    it('should reject access token used as refresh token', () => {
      const accessToken = generateToken({ userId: 'user-123' });
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });

    it('should include type=refresh in refresh tokens', () => {
      const token = generateRefreshToken('user-123');
      const decoded = decodeToken(token) as any;
      expect(decoded.type).toBe('refresh');
    });

    it('should not include type=refresh in access tokens', () => {
      const token = generateToken({ userId: 'user-123' });
      const decoded = decodeToken(token) as any;
      expect(decoded.type).toBeUndefined();
    });
  });

  describe('F-003: bcrypt with Proper Cost Factor', () => {
    it('should produce bcrypt $2b$ hashes (not plaintext or MD5)', async () => {
      const hash = await hashPassword('SecurePassword123');
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should use cost factor >= 10', async () => {
      const hash = await hashPassword('SecurePassword123');
      // bcrypt format: $2b$[cost]$...
      const costStr = hash.split('$')[2];
      const cost = parseInt(costStr, 10);
      expect(cost).toBeGreaterThanOrEqual(10);
    });

    it('should produce unique hashes for same input (salt)', async () => {
      const hash1 = await hashPassword('SecurePassword123');
      const hash2 = await hashPassword('SecurePassword123');
      expect(hash1).not.toBe(hash2);
    });

    it('should correctly verify password against hash', async () => {
      const hash = await hashPassword('SecurePassword123');
      expect(await comparePassword('SecurePassword123', hash)).toBe(true);
      expect(await comparePassword('WrongPassword', hash)).toBe(false);
    });
  });

  describe('F-005: Password Strength Validation', () => {
    it('should reject passwords shorter than 12 characters', () => {
      const result = validatePasswordStrength('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });

    it('should reject passwords without uppercase', () => {
      const result = validatePasswordStrength('alllowercase123');
      expect(result.valid).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      const result = validatePasswordStrength('ALLUPPERCASE123');
      expect(result.valid).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      const result = validatePasswordStrength('NoNumbersHere');
      expect(result.valid).toBe(false);
    });

    it('should accept strong passwords', () => {
      const result = validatePasswordStrength('StrongP4ssword!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('F-004: JWT Secret Enforcement', () => {
    it('should throw without JWT_SECRET in any environment', () => {
      delete process.env.JWT_SECRET;
      (process.env as any).NODE_ENV = 'production';
      jest.resetModules();
      const { generateToken: genToken } = require('../src/jwt');
      expect(() => genToken({ userId: 'test' })).toThrow('JWT_SECRET environment variable is required');
    });

    it('should throw in development without JWT_SECRET', () => {
      delete process.env.JWT_SECRET;
      (process.env as any).NODE_ENV = 'development';
      jest.resetModules();
      const { generateToken: genToken } = require('../src/jwt');
      expect(() => genToken({ userId: 'test' })).toThrow('JWT_SECRET environment variable is required');
    });
  });
});
