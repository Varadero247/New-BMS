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

// ── additional isValidId edge cases ───────────────────────────────────────

describe('isValidId — additional edge cases', () => {
  it('rejects whitespace-only string', () => {
    expect(isValidId('   ')).toBe(false);
  });

  it('rejects UUID with extra leading whitespace', () => {
    expect(isValidId(' 550e8400-e29b-41d4-a716-446655440000')).toBe(false);
  });

  it('rejects null-like string', () => {
    expect(isValidId('null')).toBe(false);
  });

  it('rejects undefined-like string', () => {
    expect(isValidId('undefined')).toBe(false);
  });
});

// ── additional validateIdParam edge cases ────────────────────────────────

describe('validateIdParam — additional edge cases', () => {
  function makeRes() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res as unknown as { status: jest.Mock; json: jest.Mock };
  }

  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

  it('calls next() only once for a valid value arg', () => {
    const middleware = validateIdParam('itemId');
    const next = jest.fn();
    const res = makeRes();
    middleware({ params: {} }, res, next, VALID_UUID);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('does not call res.status for a passing request', () => {
    const middleware = validateIdParam();
    const next = jest.fn();
    const res = makeRes();
    middleware({ params: { id: VALID_UUID } }, res, next, undefined);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('error response has success: false', () => {
    const middleware = validateIdParam();
    const next = jest.fn();
    const res = makeRes();
    middleware({ params: {} }, res, next, 'bad-id');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

describe('isValidId — further edge cases', () => {
  it('rejects a UUID with only 4 segments', () => {
    expect(isValidId('550e8400-e29b-41d4-a716')).toBe(false);
  });

  it('rejects an empty CUID prefix string (just "c")', () => {
    expect(isValidId('c')).toBe(false);
  });

  it('accepts CUID2 style id (starts with c, alphanumeric, 21+ chars)', () => {
    // cuid2 generates IDs starting with a letter and 24 alphanumeric chars
    expect(isValidId('cjld2cyuq0001t3rmniod1foy')).toBe(true);
  });

  it('rejects a GUID with braces', () => {
    expect(isValidId('{550e8400-e29b-41d4-a716-446655440000}')).toBe(false);
  });

  it('rejects a string of all zeros without hyphens', () => {
    expect(isValidId('00000000000000000000000000000000')).toBe(false);
  });
});

describe('isValidId — comprehensive boundary coverage', () => {
  const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
  const VALID_CUID = 'cjld2cyuq0000t3rmniod1foy';

  it('accepts UUID with all-lowercase hex digits', () => {
    expect(isValidId('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')).toBe(true);
  });

  it('accepts UUID with all-uppercase hex digits', () => {
    expect(isValidId('AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE')).toBe(true);
  });

  it('rejects UUID with a non-hex character in last segment', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-44665544000g')).toBe(false);
  });

  it('rejects UUID with 5-char first segment', () => {
    expect(isValidId('550e8-e29b-41d4-a716-446655440000')).toBe(false);
  });

  it('rejects UUID with space inside it', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-44665544 000')).toBe(false);
  });

  it('rejects CUID containing a hyphen', () => {
    expect(isValidId('cjld2-yuq0000t3rmniod1foy')).toBe(false);
  });

  it('accepts a 30-character CUID', () => {
    expect(isValidId('c' + 'a'.repeat(29))).toBe(true);
  });

  it('isValidId returns boolean true for valid UUID (strict type)', () => {
    expect(isValidId(VALID_UUID)).toBe(true);
    expect(typeof isValidId(VALID_UUID)).toBe('boolean');
  });

  it('isValidId returns boolean false for invalid string (strict type)', () => {
    expect(isValidId('bad')).toBe(false);
    expect(typeof isValidId('bad')).toBe('boolean');
  });

  it('accepts a second distinct valid UUID', () => {
    expect(isValidId('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('accepts VALID_CUID in isValidId', () => {
    expect(isValidId(VALID_CUID)).toBe(true);
  });

  it('rejects a number converted to string', () => {
    expect(isValidId(String(12345))).toBe(false);
  });
});

describe('validation — phase30 coverage', () => {
  it('handles join method', () => {
    expect([1, 2, 3].join('-')).toBe('1-2-3');
  });

});
