/**
 * Tests for ID validation utilities in @ims/shared.
 * Covers: isValidId (UUID + CUID), validateIdParam middleware factory.
 */

import { isValidId, validateIdParam } from '../src/validation';

// ── isValidId ─────────────────────────────────────────────────────────────────

describe('isValidId', () => {
  // Valid UUIDs
  it('accepts standard UUID v4', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('accepts uppercase UUID', () => {
    expect(isValidId('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('accepts UUID with mixed case', () => {
    expect(isValidId('550e8400-e29b-41d4-A716-446655440000')).toBe(true);
  });

  it('accepts all-zeros UUID', () => {
    expect(isValidId('00000000-0000-0000-0000-000000000000')).toBe(true);
  });

  it('accepts UUID with different version digits', () => {
    // UUID v1 format
    expect(isValidId('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  // Valid CUIDs
  it('accepts a standard CUID (starts with c, 21+ chars)', () => {
    expect(isValidId('cjld2cyuq0000t3rmniod1foy')).toBe(true);
  });

  it('accepts a minimal valid CUID (c + 20 alphanumeric chars)', () => {
    expect(isValidId('c' + 'a'.repeat(20))).toBe(true);
  });

  it('accepts a long CUID', () => {
    expect(isValidId('c' + 'a1b2c3d4e5'.repeat(5))).toBe(true);
  });

  // Invalid IDs
  it('rejects empty string', () => {
    expect(isValidId('')).toBe(false);
  });

  it('rejects plain integer string', () => {
    expect(isValidId('123')).toBe(false);
  });

  it('rejects UUID missing hyphens', () => {
    expect(isValidId('550e8400e29b41d4a716446655440000')).toBe(false);
  });

  it('rejects UUID with wrong segment lengths', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-4466554400')).toBe(false);
  });

  it('rejects CUID too short (c + 19 chars)', () => {
    expect(isValidId('c' + 'a'.repeat(19))).toBe(false);
  });

  it('rejects CUID with uppercase characters', () => {
    // CUID regex requires lowercase only
    expect(isValidId('CJLD2CYUQ0000T3RMNIOD1FOY')).toBe(false);
  });

  it('rejects string starting with non-c non-UUID character', () => {
    expect(isValidId('xjld2cyuq0000t3rmniod1foy')).toBe(false);
    expect(isValidId('test-id')).toBe(false);
  });

  it('rejects UUID with extra characters', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false);
  });
});

// ── validateIdParam middleware ─────────────────────────────────────────────────

describe('validateIdParam', () => {
  // Test doubles
  function makeRes() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res as unknown as { status: jest.Mock; json: jest.Mock };
  }

  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  const VALID_CUID = 'cjld2cyuq0000t3rmniod1foy';
  const INVALID_ID = 'not-a-valid-id';

  // Used as router.param() callback (value passed explicitly)
  describe('called as router.param() handler (value arg provided)', () => {
    it('calls next() for a valid UUID', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, VALID_UUID);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // no error arg
    });

    it('calls next() for a valid CUID', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, VALID_CUID);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('returns 400 for an invalid ID', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, INVALID_ID);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'INVALID_ID' }),
        })
      );
    });

    it('includes the param name in the error message', () => {
      const middleware = validateIdParam('productId');
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, INVALID_ID);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'Invalid productId format' }),
        })
      );
    });
  });

  // Used as inline route middleware (no value arg — reads from req.params)
  describe('called as inline route middleware (no value arg)', () => {
    it('calls next() when req.params.id is a valid UUID', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: { id: VALID_UUID } }, res, next, undefined);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('returns 400 when req.params.id is invalid', () => {
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: { id: INVALID_ID } }, res, next, undefined);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('calls next() when req.params has no id (undefined id is allowed)', () => {
      // No id param present — the middleware should pass through (not reject undefined)
      const middleware = validateIdParam();
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: {} }, res, next, undefined);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('reads from custom param name in req.params', () => {
      const middleware = validateIdParam('orderId');
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: { orderId: INVALID_ID } }, res, next, undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'Invalid orderId format' }),
        })
      );
    });
  });

  describe('default parameter name', () => {
    it('defaults to "id" when no param name given', () => {
      const middleware = validateIdParam(); // no arg
      const next = jest.fn();
      const res = makeRes();
      middleware({ params: { id: INVALID_ID } }, res, next, undefined);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: 'Invalid id format' }),
        })
      );
    });
  });
});
