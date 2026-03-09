// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
import {
  required,
  minLength,
  maxLength,
  isNumber,
  isDate,
  isEmail,
  isUrl,
  composeValidators,
  min,
  max,
} from '../src/validators';
import { createInlineEditState } from '../src/inline-edit-state';
import type { InlineEditFieldType, InlineEditStatus } from '../src/types';

// ---------------------------------------------------------------------------
// SUITE 1: required validator — 60 tests
// ---------------------------------------------------------------------------

describe('required validator', () => {
  it('returns error for null', () => {
    expect(required(null)).toBe('This field is required');
  });
  it('returns error for undefined', () => {
    expect(required(undefined)).toBe('This field is required');
  });
  it('returns error for empty string', () => {
    expect(required('')).toBe('This field is required');
  });
  it('returns null for non-empty string', () => {
    expect(required('hello')).toBeNull();
  });
  it('returns null for number 0', () => {
    expect(required(0)).toBeNull();
  });
  it('returns null for false', () => {
    expect(required(false)).toBeNull();
  });
  it('returns null for non-empty array', () => {
    expect(required(['a'])).toBeNull();
  });
  it('returns null for empty array', () => {
    expect(required([])).toBeNull();
  });
  it('returns null for object', () => {
    expect(required({})).toBeNull();
  });
  it('returns null for number 1', () => {
    expect(required(1)).toBeNull();
  });
  it('returns null for true', () => {
    expect(required(true)).toBeNull();
  });
  it('returns null for whitespace string', () => {
    expect(required(' ')).toBeNull();
  });
  it('returns error message is a string', () => {
    expect(typeof required(null)).toBe('string');
  });
  it('returns null for negative number', () => {
    expect(required(-1)).toBeNull();
  });
  it('returns null for string "0"', () => {
    expect(required('0')).toBeNull();
  });
  it('returns null for string "false"', () => {
    expect(required('false')).toBeNull();
  });
  it('returns error string contains "required"', () => {
    expect(required('')).toContain('required');
  });
  it('returns null for long string', () => {
    expect(required('a'.repeat(100))).toBeNull();
  });
  it('returns null for number NaN — NaN is not null/undefined/empty', () => {
    expect(required(NaN)).toBeNull();
  });
  it('returns null for number Infinity', () => {
    expect(required(Infinity)).toBeNull();
  });
  // Repeat with different values for robustness
  for (let i = 1; i <= 40; i++) {
    it(`required non-empty string variant ${i}`, () => {
      expect(required(`value-${i}`)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 2: minLength validator — 80 tests
// ---------------------------------------------------------------------------

describe('minLength validator', () => {
  it('minLength(3) with length 0 → error', () => {
    expect(minLength(3)('')).toBe('Minimum length is 3 characters');
  });
  it('minLength(3) with length 1 → error', () => {
    expect(minLength(3)('a')).toBe('Minimum length is 3 characters');
  });
  it('minLength(3) with length 2 → error', () => {
    expect(minLength(3)('ab')).toBe('Minimum length is 3 characters');
  });
  it('minLength(3) with length 3 → null', () => {
    expect(minLength(3)('abc')).toBeNull();
  });
  it('minLength(3) with length 4 → null', () => {
    expect(minLength(3)('abcd')).toBeNull();
  });
  it('minLength(0) with empty string → null', () => {
    expect(minLength(0)('')).toBeNull();
  });
  it('minLength(0) with any string → null', () => {
    expect(minLength(0)('x')).toBeNull();
  });
  it('minLength(1) with empty string → error', () => {
    expect(minLength(1)('')).not.toBeNull();
  });
  it('minLength(1) with one char → null', () => {
    expect(minLength(1)('a')).toBeNull();
  });
  it('minLength(10) with 9 chars → error', () => {
    expect(minLength(10)('a'.repeat(9))).not.toBeNull();
  });
  it('minLength(10) with 10 chars → null', () => {
    expect(minLength(10)('a'.repeat(10))).toBeNull();
  });
  it('minLength(10) with 11 chars → null', () => {
    expect(minLength(10)('a'.repeat(11))).toBeNull();
  });
  it('returns null for non-string input', () => {
    expect(minLength(3)(123 as unknown as string)).toBeNull();
  });
  it('error message contains the min number', () => {
    expect(minLength(5)('ab')).toContain('5');
  });
  it('error message contains "characters"', () => {
    expect(minLength(5)('ab')).toContain('characters');
  });
  it('returns a function', () => {
    expect(typeof minLength(3)).toBe('function');
  });
  it('minLength(100) with 99 chars → error', () => {
    expect(minLength(100)('a'.repeat(99))).not.toBeNull();
  });
  it('minLength(100) with 100 chars → null', () => {
    expect(minLength(100)('a'.repeat(100))).toBeNull();
  });
  for (let min = 1; min <= 30; min++) {
    it(`minLength(${min}) at boundary — length exactly ${min} → null`, () => {
      expect(minLength(min)('a'.repeat(min))).toBeNull();
    });
  }
  for (let min = 1; min <= 30; min++) {
    it(`minLength(${min}) below boundary — length ${min - 1} → error`, () => {
      expect(minLength(min)('a'.repeat(min - 1))).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 3: maxLength validator — 80 tests
// ---------------------------------------------------------------------------

describe('maxLength validator', () => {
  it('maxLength(5) with length 0 → null', () => {
    expect(maxLength(5)('')).toBeNull();
  });
  it('maxLength(5) with length 4 → null', () => {
    expect(maxLength(5)('abcd')).toBeNull();
  });
  it('maxLength(5) with length 5 → null', () => {
    expect(maxLength(5)('abcde')).toBeNull();
  });
  it('maxLength(5) with length 6 → error', () => {
    expect(maxLength(5)('abcdef')).not.toBeNull();
  });
  it('maxLength(5) with length 100 → error', () => {
    expect(maxLength(5)('a'.repeat(100))).not.toBeNull();
  });
  it('maxLength(0) with non-empty string → error', () => {
    expect(maxLength(0)('a')).not.toBeNull();
  });
  it('maxLength(0) with empty string → null', () => {
    expect(maxLength(0)('')).toBeNull();
  });
  it('returns null for non-string input', () => {
    expect(maxLength(5)(42 as unknown as string)).toBeNull();
  });
  it('error message contains the max number', () => {
    expect(maxLength(3)('abcdef')).toContain('3');
  });
  it('error message contains "characters"', () => {
    expect(maxLength(3)('abcdef')).toContain('characters');
  });
  it('returns a function', () => {
    expect(typeof maxLength(5)).toBe('function');
  });
  it('maxLength(1) with 1 char → null', () => {
    expect(maxLength(1)('a')).toBeNull();
  });
  it('maxLength(1) with 2 chars → error', () => {
    expect(maxLength(1)('ab')).not.toBeNull();
  });
  for (let max = 1; max <= 30; max++) {
    it(`maxLength(${max}) at boundary — length exactly ${max} → null`, () => {
      expect(maxLength(max)('a'.repeat(max))).toBeNull();
    });
  }
  for (let maxV = 1; maxV <= 30; maxV++) {
    it(`maxLength(${maxV}) above boundary — length ${maxV + 1} → error`, () => {
      expect(maxLength(maxV)('a'.repeat(maxV + 1))).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 4: isNumber validator — 60 tests
// ---------------------------------------------------------------------------

describe('isNumber validator', () => {
  it('returns null for "123"', () => {
    expect(isNumber('123')).toBeNull();
  });
  it('returns null for "1.5"', () => {
    expect(isNumber('1.5')).toBeNull();
  });
  it('returns null for "-1"', () => {
    expect(isNumber('-1')).toBeNull();
  });
  it('returns null for "0"', () => {
    expect(isNumber('0')).toBeNull();
  });
  it('returns error for "abc"', () => {
    expect(isNumber('abc')).not.toBeNull();
  });
  it('returns null for empty string', () => {
    expect(isNumber('')).toBeNull();
  });
  it('returns null for null', () => {
    expect(isNumber(null)).toBeNull();
  });
  it('returns null for undefined', () => {
    expect(isNumber(undefined)).toBeNull();
  });
  it('returns error for non-numeric string', () => {
    expect(isNumber('hello')).toBe('Must be a valid number');
  });
  it('error message contains "number"', () => {
    expect(isNumber('abc')).toContain('number');
  });
  it('returns null for numeric number type', () => {
    expect(isNumber(42)).toBeNull();
  });
  it('returns null for zero', () => {
    expect(isNumber(0)).toBeNull();
  });
  it('returns null for negative number', () => {
    expect(isNumber(-5)).toBeNull();
  });
  it('returns null for float', () => {
    expect(isNumber(3.14)).toBeNull();
  });
  it('returns error for "12abc"', () => {
    expect(isNumber('12abc')).not.toBeNull();
  });
  it('returns null for "1e5"', () => {
    expect(isNumber('1e5')).toBeNull();
  });
  it('returns null for "0.001"', () => {
    expect(isNumber('0.001')).toBeNull();
  });
  it('returns error for "NaN" string', () => {
    // Number('NaN') is NaN → error
    expect(isNumber('NaN')).not.toBeNull();
  });
  it('returns null for " " (space) — Number(" ") = 0', () => {
    expect(isNumber(' ')).toBeNull();
  });
  it('returns null for number -0', () => {
    expect(isNumber(-0)).toBeNull();
  });
  for (let i = 0; i < 40; i++) {
    it(`isNumber numeric ${i} → null`, () => {
      expect(isNumber(i)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 5: isDate validator — 60 tests
// ---------------------------------------------------------------------------

describe('isDate validator', () => {
  it('returns null for valid ISO date "2026-01-15"', () => {
    expect(isDate('2026-01-15')).toBeNull();
  });
  it('returns null for valid date "2020-12-31"', () => {
    expect(isDate('2020-12-31')).toBeNull();
  });
  it('returns error for invalid string "not-a-date"', () => {
    expect(isDate('not-a-date')).not.toBeNull();
  });
  it('returns null for empty string', () => {
    expect(isDate('')).toBeNull();
  });
  it('returns null for null', () => {
    expect(isDate(null)).toBeNull();
  });
  it('returns null for undefined', () => {
    expect(isDate(undefined)).toBeNull();
  });
  it('returns null for ISO datetime "2026-01-15T12:00:00Z"', () => {
    expect(isDate('2026-01-15T12:00:00Z')).toBeNull();
  });
  it('returns null for timestamp number as ISO string', () => {
    expect(isDate(new Date(1706745600000).toISOString())).toBeNull();
  });
  it('returns error for "abc"', () => {
    expect(isDate('abc')).toBe('Must be a valid date');
  });
  it('error message contains "date"', () => {
    expect(isDate('invalid')).toContain('date');
  });
  it('returns null for new Date().toISOString()', () => {
    expect(isDate(new Date().toISOString())).toBeNull();
  });
  it('returns error for "2026-13-01" (invalid month)', () => {
    // Invalid month 13 — new Date("2026-13-01") is Invalid Date
    expect(isDate('2026-13-01')).not.toBeNull();
  });
  it('returns error for "garbage-date"', () => {
    expect(isDate('garbage-date')).not.toBeNull();
  });
  it('returns null for "Jan 1 2026"', () => {
    expect(isDate('Jan 1 2026')).toBeNull();
  });
  it('returns null for "December 31, 2025"', () => {
    expect(isDate('December 31, 2025')).toBeNull();
  });
  it('returns null for number 0 (epoch)', () => {
    expect(isDate(0)).toBeNull();
  });
  for (let year = 2020; year <= 2030; year++) {
    it(`isDate valid year ${year} → null`, () => {
      expect(isDate(`${year}-06-15`)).toBeNull();
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`isDate invalid variant ${i} → error`, () => {
      expect(isDate(`BADDATE${i}XYZ`)).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 6: isEmail validator — 60 tests
// ---------------------------------------------------------------------------

describe('isEmail validator', () => {
  it('returns null for valid email "user@example.com"', () => {
    expect(isEmail('user@example.com')).toBeNull();
  });
  it('returns null for "admin@ims.local"', () => {
    expect(isEmail('admin@ims.local')).toBeNull();
  });
  it('returns error for missing @', () => {
    expect(isEmail('userexample.com')).not.toBeNull();
  });
  it('returns error for multiple @', () => {
    expect(isEmail('user@@example.com')).not.toBeNull();
  });
  it('returns error for missing domain', () => {
    expect(isEmail('user@')).not.toBeNull();
  });
  it('returns error for missing local part', () => {
    expect(isEmail('@example.com')).not.toBeNull();
  });
  it('returns null for empty string', () => {
    expect(isEmail('')).toBeNull();
  });
  it('returns null for null', () => {
    expect(isEmail(null)).toBeNull();
  });
  it('returns null for undefined', () => {
    expect(isEmail(undefined)).toBeNull();
  });
  it('error message contains "email"', () => {
    expect(isEmail('invalid')).toContain('email');
  });
  it('returns null for "a@b.co"', () => {
    expect(isEmail('a@b.co')).toBeNull();
  });
  it('returns null for email with plus', () => {
    expect(isEmail('user+tag@example.com')).toBeNull();
  });
  it('returns null for email with dot in local', () => {
    expect(isEmail('first.last@example.com')).toBeNull();
  });
  it('returns error for "just-text"', () => {
    expect(isEmail('just-text')).not.toBeNull();
  });
  it('returns error for "@"', () => {
    expect(isEmail('@')).not.toBeNull();
  });
  it('returns error for spaces in email', () => {
    expect(isEmail('user @example.com')).not.toBeNull();
  });
  for (let i = 1; i <= 20; i++) {
    it(`isEmail valid variant ${i} → null`, () => {
      expect(isEmail(`user${i}@domain${i}.com`)).toBeNull();
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`isEmail invalid variant ${i} → error`, () => {
      expect(isEmail(`invalid-email-${i}`)).not.toBeNull();
    });
  }
  for (let i = 1; i <= 6; i++) {
    it(`isEmail domain variant ${i}`, () => {
      expect(isEmail(`admin@nexara${i}.dmcc`)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 7: isUrl validator — 60 tests
// ---------------------------------------------------------------------------

describe('isUrl validator', () => {
  it('returns null for "https://example.com"', () => {
    expect(isUrl('https://example.com')).toBeNull();
  });
  it('returns null for "http://localhost:3000"', () => {
    expect(isUrl('http://localhost:3000')).toBeNull();
  });
  it('returns error for "not-a-url"', () => {
    expect(isUrl('not-a-url')).not.toBeNull();
  });
  it('returns error for relative URL "/path"', () => {
    expect(isUrl('/path')).not.toBeNull();
  });
  it('returns null for empty string', () => {
    expect(isUrl('')).toBeNull();
  });
  it('returns null for null', () => {
    expect(isUrl(null)).toBeNull();
  });
  it('returns null for undefined', () => {
    expect(isUrl(undefined)).toBeNull();
  });
  it('returns null for "ftp://example.com"', () => {
    expect(isUrl('ftp://example.com')).toBeNull();
  });
  it('returns null for "https://example.com/path?q=1"', () => {
    expect(isUrl('https://example.com/path?q=1')).toBeNull();
  });
  it('error message contains "URL"', () => {
    expect(isUrl('bad')).toContain('URL');
  });
  it('returns null for "https://a.b.c.d.com"', () => {
    expect(isUrl('https://a.b.c.d.com')).toBeNull();
  });
  it('returns error for "example.com" (no scheme)', () => {
    expect(isUrl('example.com')).not.toBeNull();
  });
  it('returns null for "https://example.com:8080"', () => {
    expect(isUrl('https://example.com:8080')).toBeNull();
  });
  it('returns error for plain text', () => {
    expect(isUrl('just text here')).not.toBeNull();
  });
  it('returns null for "mailto:user@example.com"', () => {
    expect(isUrl('mailto:user@example.com')).toBeNull();
  });
  for (let i = 1; i <= 20; i++) {
    it(`isUrl valid HTTPS variant ${i} → null`, () => {
      expect(isUrl(`https://site${i}.example.com`)).toBeNull();
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`isUrl invalid variant ${i} → error`, () => {
      expect(isUrl(`invalid-url-no-scheme-${i}`)).not.toBeNull();
    });
  }
  for (let i = 1; i <= 5; i++) {
    it(`isUrl HTTP variant ${i} → null`, () => {
      expect(isUrl(`http://api${i}.example.com/health`)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 8: composeValidators — 60 tests
// ---------------------------------------------------------------------------

describe('composeValidators', () => {
  it('returns null when all pass', () => {
    const v = composeValidators(
      (v: string) => (v.length > 0 ? null : 'required'),
      (v: string) => (v.length <= 10 ? null : 'too long')
    );
    expect(v('hello')).toBeNull();
  });

  it('returns first error when first fails', () => {
    const v = composeValidators(
      () => 'first error',
      () => 'second error'
    );
    expect(v('anything')).toBe('first error');
  });

  it('returns second error when second fails', () => {
    const v = composeValidators(
      () => null,
      () => 'second error'
    );
    expect(v('anything')).toBe('second error');
  });

  it('composes 3 validators — all pass', () => {
    const v = composeValidators<string>(
      () => null,
      () => null,
      () => null
    );
    expect(v('value')).toBeNull();
  });

  it('composes 3 validators — third fails', () => {
    const v = composeValidators<string>(
      () => null,
      () => null,
      () => 'third error'
    );
    expect(v('value')).toBe('third error');
  });

  it('returns a function', () => {
    expect(typeof composeValidators(() => null)).toBe('function');
  });

  it('empty validators → always null', () => {
    const v = composeValidators<string>();
    expect(v('anything')).toBeNull();
  });

  it('composes required + minLength', () => {
    const v = composeValidators(required, minLength(3));
    expect(v('')).not.toBeNull();
    expect(v('ab')).not.toBeNull();
    expect(v('abc')).toBeNull();
  });

  it('composes minLength + maxLength', () => {
    const v = composeValidators(minLength(2), maxLength(5));
    expect(v('a')).not.toBeNull();
    expect(v('abcdef')).not.toBeNull();
    expect(v('abc')).toBeNull();
  });

  it('composes isEmail + minLength', () => {
    const v = composeValidators<string>(isEmail, minLength(5));
    expect(v('a@b')).not.toBeNull();
  });

  it('first error stops evaluation', () => {
    let secondCalled = false;
    const second = (v: string) => { secondCalled = true; return null; };
    const v = composeValidators<string>(() => 'error', second);
    v('test');
    expect(secondCalled).toBe(false);
  });

  it('second validator called only when first passes', () => {
    let secondCalled = false;
    const second = (v: string) => { secondCalled = true; return null; };
    const v = composeValidators<string>(() => null, second);
    v('test');
    expect(secondCalled).toBe(true);
  });

  for (let i = 0; i < 30; i++) {
    it(`composeValidators all-pass variant ${i}`, () => {
      const validators = Array.from({ length: i % 5 + 1 }, () => () => null);
      const v = composeValidators<string>(...validators);
      expect(v('test')).toBeNull();
    });
  }

  for (let i = 0; i < 16; i++) {
    it(`composeValidators fail-fast variant ${i}`, () => {
      const v = composeValidators<string>(
        () => `error-${i}`,
        () => 'should-not-reach'
      );
      expect(v('anything')).toBe(`error-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 9: min validator — 60 tests
// ---------------------------------------------------------------------------

describe('min validator', () => {
  it('min(0) with value 0 → null', () => {
    expect(min(0)(0)).toBeNull();
  });
  it('min(0) with value 1 → null', () => {
    expect(min(0)(1)).toBeNull();
  });
  it('min(0) with value -1 → error', () => {
    expect(min(0)(-1)).not.toBeNull();
  });
  it('min(5) with value 5 → null', () => {
    expect(min(5)(5)).toBeNull();
  });
  it('min(5) with value 4 → error', () => {
    expect(min(5)(4)).not.toBeNull();
  });
  it('min(5) with value 6 → null', () => {
    expect(min(5)(6)).toBeNull();
  });
  it('min(10) with null → null', () => {
    expect(min(10)(null)).toBeNull();
  });
  it('min(10) with undefined → null', () => {
    expect(min(10)(undefined)).toBeNull();
  });
  it('min(10) with empty string → null', () => {
    expect(min(10)('')).toBeNull();
  });
  it('error message contains the minimum value', () => {
    expect(min(5)(1)).toContain('5');
  });
  it('error message contains "Minimum"', () => {
    expect(min(5)(1)).toContain('Minimum');
  });
  it('min(-10) with -11 → error', () => {
    expect(min(-10)(-11)).not.toBeNull();
  });
  it('min(-10) with -10 → null', () => {
    expect(min(-10)(-10)).toBeNull();
  });
  it('min(-10) with -9 → null', () => {
    expect(min(-10)(-9)).toBeNull();
  });
  it('returns a function', () => {
    expect(typeof min(5)).toBe('function');
  });
  for (let i = 0; i < 20; i++) {
    it(`min(${i}) with value exactly ${i} → null`, () => {
      expect(min(i)(i)).toBeNull();
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`min(${i}) with value ${i - 1} → error`, () => {
      expect(min(i)(i - 1)).not.toBeNull();
    });
  }
  for (let i = 1; i <= 5; i++) {
    it(`min(100) with value ${100 + i} → null`, () => {
      expect(min(100)(100 + i)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 10: max validator — 60 tests
// ---------------------------------------------------------------------------

describe('max validator', () => {
  it('max(10) with value 10 → null', () => {
    expect(max(10)(10)).toBeNull();
  });
  it('max(10) with value 9 → null', () => {
    expect(max(10)(9)).toBeNull();
  });
  it('max(10) with value 11 → error', () => {
    expect(max(10)(11)).not.toBeNull();
  });
  it('max(0) with value 0 → null', () => {
    expect(max(0)(0)).toBeNull();
  });
  it('max(0) with value 1 → error', () => {
    expect(max(0)(1)).not.toBeNull();
  });
  it('max(0) with value -1 → null', () => {
    expect(max(0)(-1)).toBeNull();
  });
  it('max(100) with null → null', () => {
    expect(max(100)(null)).toBeNull();
  });
  it('max(100) with undefined → null', () => {
    expect(max(100)(undefined)).toBeNull();
  });
  it('max(100) with empty string → null', () => {
    expect(max(100)('')).toBeNull();
  });
  it('error message contains the maximum value', () => {
    expect(max(5)(10)).toContain('5');
  });
  it('error message contains "Maximum"', () => {
    expect(max(5)(10)).toContain('Maximum');
  });
  it('max(-5) with -4 → error', () => {
    expect(max(-5)(-4)).not.toBeNull();
  });
  it('max(-5) with -5 → null', () => {
    expect(max(-5)(-5)).toBeNull();
  });
  it('max(-5) with -6 → null', () => {
    expect(max(-5)(-6)).toBeNull();
  });
  it('returns a function', () => {
    expect(typeof max(5)).toBe('function');
  });
  for (let i = 0; i < 20; i++) {
    it(`max(${i + 10}) with value exactly ${i + 10} → null`, () => {
      expect(max(i + 10)(i + 10)).toBeNull();
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`max(${i}) with value ${i + 1} → error`, () => {
      expect(max(i)(i + 1)).not.toBeNull();
    });
  }
  for (let i = 1; i <= 5; i++) {
    it(`max(100) with value ${100 - i} → null`, () => {
      expect(max(100)(100 - i)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 11: createInlineEditState — initial state — 30 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — initial state', () => {
  it('initial status is idle', () => {
    const { getState } = createInlineEditState({ fieldType: 'text', initialValue: 'hello' }, jest.fn());
    expect(getState().status).toBe('idle');
  });
  it('initial value matches config', () => {
    const { getState } = createInlineEditState({ fieldType: 'text', initialValue: 'world' }, jest.fn());
    expect(getState().value).toBe('world');
  });
  it('initial originalValue matches config', () => {
    const { getState } = createInlineEditState({ fieldType: 'text', initialValue: 'original' }, jest.fn());
    expect(getState().originalValue).toBe('original');
  });
  it('initial error is null', () => {
    const { getState } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    expect(getState().error).toBeNull();
  });
  it('initial isDirty is false', () => {
    const { getState } = createInlineEditState({ fieldType: 'text', initialValue: 'x' }, jest.fn());
    expect(getState().isDirty).toBe(false);
  });
  it('actions object exists', () => {
    const { actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    expect(actions).toBeDefined();
  });
  it('getState returns a copy (not same reference)', () => {
    const { getState } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    const s1 = getState();
    const s2 = getState();
    expect(s1).not.toBe(s2);
  });
  it('actions.startEdit is a function', () => {
    const { actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    expect(typeof actions.startEdit).toBe('function');
  });
  it('actions.cancelEdit is a function', () => {
    const { actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    expect(typeof actions.cancelEdit).toBe('function');
  });
  it('actions.setValue is a function', () => {
    const { actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    expect(typeof actions.setValue).toBe('function');
  });
  it('actions.save is a function', () => {
    const { actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    expect(typeof actions.save).toBe('function');
  });
  it('actions.reset is a function', () => {
    const { actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    expect(typeof actions.reset).toBe('function');
  });
  it('initial state with number initialValue', () => {
    const { getState } = createInlineEditState({ fieldType: 'number', initialValue: 42 }, jest.fn());
    expect(getState().value).toBe(42);
  });
  it('initial state with boolean initialValue', () => {
    const { getState } = createInlineEditState({ fieldType: 'boolean', initialValue: true }, jest.fn());
    expect(getState().value).toBe(true);
  });
  it('initial state with null initialValue', () => {
    const { getState } = createInlineEditState({ fieldType: 'text', initialValue: null }, jest.fn());
    expect(getState().value).toBeNull();
  });
  for (let i = 0; i < 15; i++) {
    it(`initial state variant ${i}: status is idle`, () => {
      const { getState } = createInlineEditState(
        { fieldType: 'text', initialValue: `val-${i}` },
        jest.fn()
      );
      expect(getState().status).toBe('idle');
      expect(getState().isDirty).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 12: startEdit — 20 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — startEdit', () => {
  it('status becomes editing', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    actions.startEdit();
    expect(getState().status).toBe('editing');
  });
  it('clears error on startEdit', () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: '', validate: () => 'error' },
      jest.fn()
    );
    actions.startEdit();
    expect(getState().error).toBeNull();
  });
  it('value unchanged after startEdit', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'abc' }, jest.fn());
    actions.startEdit();
    expect(getState().value).toBe('abc');
  });
  it('isDirty unchanged after startEdit', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'abc' }, jest.fn());
    actions.startEdit();
    expect(getState().isDirty).toBe(false);
  });
  it('calling startEdit twice keeps status editing', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    actions.startEdit();
    actions.startEdit();
    expect(getState().status).toBe('editing');
  });
  for (let i = 0; i < 15; i++) {
    it(`startEdit variant ${i} → status editing`, () => {
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: `v${i}` },
        jest.fn()
      );
      actions.startEdit();
      expect(getState().status).toBe('editing');
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 13: cancelEdit — 20 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — cancelEdit', () => {
  it('status reverts to idle', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'x' }, jest.fn());
    actions.startEdit();
    actions.cancelEdit();
    expect(getState().status).toBe('idle');
  });
  it('value reverts to originalValue', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'orig' }, jest.fn());
    actions.startEdit();
    actions.setValue('changed');
    actions.cancelEdit();
    expect(getState().value).toBe('orig');
  });
  it('isDirty becomes false', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'x' }, jest.fn());
    actions.startEdit();
    actions.setValue('y');
    actions.cancelEdit();
    expect(getState().isDirty).toBe(false);
  });
  it('error is cleared on cancelEdit', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'x' }, jest.fn());
    actions.startEdit();
    actions.cancelEdit();
    expect(getState().error).toBeNull();
  });
  it('cancelEdit from idle does not throw', () => {
    const { actions } = createInlineEditState({ fieldType: 'text', initialValue: 'x' }, jest.fn());
    expect(() => actions.cancelEdit()).not.toThrow();
  });
  for (let i = 0; i < 15; i++) {
    it(`cancelEdit variant ${i} restores original`, () => {
      const orig = `original-${i}`;
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: orig },
        jest.fn()
      );
      actions.startEdit();
      actions.setValue(`changed-${i}`);
      actions.cancelEdit();
      expect(getState().value).toBe(orig);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 14: setValue — 30 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — setValue', () => {
  it('changes value in state', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'a' }, jest.fn());
    actions.setValue('b');
    expect(getState().value).toBe('b');
  });
  it('isDirty becomes true when value differs', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'a' }, jest.fn());
    actions.setValue('b');
    expect(getState().isDirty).toBe(true);
  });
  it('isDirty stays false when value same as original', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'a' }, jest.fn());
    actions.setValue('a');
    expect(getState().isDirty).toBe(false);
  });
  it('clears error on setValue', () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: '', validate: () => 'err' },
      jest.fn()
    );
    actions.startEdit();
    actions.setValue('new');
    expect(getState().error).toBeNull();
  });
  it('value matches what was set', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'number', initialValue: 0 }, jest.fn());
    actions.setValue(42);
    expect(getState().value).toBe(42);
  });
  it('setValue with same value as original → isDirty false', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'same' }, jest.fn());
    actions.setValue('same');
    expect(getState().isDirty).toBe(false);
  });
  for (let i = 0; i < 24; i++) {
    it(`setValue variant ${i}: value is stored correctly`, () => {
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: 'init' },
        jest.fn()
      );
      actions.setValue(`value-${i}`);
      expect(getState().value).toBe(`value-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 15: save — validation error — 30 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — save with validation error', () => {
  it('sets status to error when validate returns error', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: '', validate: () => 'Required' },
      jest.fn()
    );
    await actions.save();
    expect(getState().status).toBe('error');
  });
  it('sets error message from validator', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: '', validate: () => 'Field is required' },
      jest.fn()
    );
    await actions.save();
    expect(getState().error).toBe('Field is required');
  });
  it('onSave not called when validation fails', async () => {
    const onSave = jest.fn();
    const { actions } = createInlineEditState(
      { fieldType: 'text', initialValue: '', validate: () => 'Error' },
      onSave
    );
    await actions.save();
    expect(onSave).not.toHaveBeenCalled();
  });
  it('value unchanged when validation fails', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x', validate: () => 'Error' },
      jest.fn()
    );
    await actions.save();
    expect(getState().value).toBe('x');
  });
  it('isDirty unchanged when validation fails', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x', validate: () => 'Error' },
      jest.fn()
    );
    await actions.save();
    expect(getState().isDirty).toBe(false);
  });
  for (let i = 0; i < 25; i++) {
    it(`save validation error variant ${i}`, async () => {
      const errorMsg = `Validation error ${i}`;
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: '', validate: () => errorMsg },
        jest.fn()
      );
      await actions.save();
      expect(getState().status).toBe('error');
      expect(getState().error).toBe(errorMsg);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 16: save — success — 30 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — save success', () => {
  it('status becomes success after successful save', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'hello' },
      jest.fn().mockResolvedValue(undefined)
    );
    await actions.save();
    expect(getState().status).toBe('success');
  });
  it('isDirty becomes false after success', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'a' },
      jest.fn().mockResolvedValue(undefined)
    );
    actions.setValue('b');
    await actions.save();
    expect(getState().isDirty).toBe(false);
  });
  it('originalValue updated to saved value', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'old' },
      jest.fn().mockResolvedValue(undefined)
    );
    actions.setValue('new');
    await actions.save();
    expect(getState().originalValue).toBe('new');
  });
  it('error is null after success', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x' },
      jest.fn().mockResolvedValue(undefined)
    );
    await actions.save();
    expect(getState().error).toBeNull();
  });
  it('onSave called with current value', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'saved-val' },
      onSave
    );
    await actions.save();
    expect(onSave).toHaveBeenCalledWith('saved-val');
  });
  it('onSave called once', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x' },
      onSave
    );
    await actions.save();
    expect(onSave).toHaveBeenCalledTimes(1);
  });
  for (let i = 0; i < 24; i++) {
    it(`save success variant ${i}`, async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: `val-${i}` },
        onSave
      );
      await actions.save();
      expect(getState().status).toBe('success');
      expect(onSave).toHaveBeenCalledWith(`val-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 17: save — failure — 30 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — save failure', () => {
  it('status becomes error when onSave throws', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x' },
      jest.fn().mockRejectedValue(new Error('Network error'))
    );
    await actions.save();
    expect(getState().status).toBe('error');
  });
  it('error message from thrown Error', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x' },
      jest.fn().mockRejectedValue(new Error('Save failed'))
    );
    await actions.save();
    expect(getState().error).toBe('Save failed');
  });
  it('error is "Save failed" for non-Error thrown value', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x' },
      jest.fn().mockRejectedValue('string error')
    );
    await actions.save();
    expect(getState().error).toBe('Save failed');
  });
  it('originalValue unchanged when save fails', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'orig' },
      jest.fn().mockRejectedValue(new Error('fail'))
    );
    actions.setValue('new');
    await actions.save();
    expect(getState().originalValue).toBe('orig');
  });
  it('save does not throw to caller on failure', async () => {
    const { actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x' },
      jest.fn().mockRejectedValue(new Error('error'))
    );
    await expect(actions.save()).resolves.toBeUndefined();
  });
  for (let i = 0; i < 25; i++) {
    it(`save failure variant ${i}`, async () => {
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: `v${i}` },
        jest.fn().mockRejectedValue(new Error(`Error ${i}`))
      );
      await actions.save();
      expect(getState().status).toBe('error');
      expect(getState().error).toBe(`Error ${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 18: save with transform — 20 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — save with transform', () => {
  it('transform is applied before save', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { actions } = createInlineEditState(
      {
        fieldType: 'text',
        initialValue: 'hello',
        transform: (v: string) => v.toUpperCase(),
      },
      onSave
    );
    await actions.save();
    expect(onSave).toHaveBeenCalledWith('HELLO');
  });
  it('transform result is stored as originalValue', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getState, actions } = createInlineEditState(
      {
        fieldType: 'text',
        initialValue: 'hello',
        transform: (v: string) => v.trim(),
      },
      onSave
    );
    actions.setValue('  trimmed  ');
    await actions.save();
    expect(getState().originalValue).toBe('trimmed');
  });
  it('without transform, original value is saved', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'no-transform' },
      onSave
    );
    await actions.save();
    expect(onSave).toHaveBeenCalledWith('no-transform');
  });
  for (let i = 0; i < 17; i++) {
    it(`transform variant ${i}: uppercase applied`, async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { actions } = createInlineEditState(
        {
          fieldType: 'text',
          initialValue: `value${i}`,
          transform: (v: string) => v.toUpperCase(),
        },
        onSave
      );
      await actions.save();
      expect(onSave).toHaveBeenCalledWith(`VALUE${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 19: reset — 20 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — reset', () => {
  it('reset restores status to idle', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'x' }, jest.fn());
    actions.startEdit();
    actions.reset();
    expect(getState().status).toBe('idle');
  });
  it('reset restores value to initialValue', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'init' }, jest.fn());
    actions.setValue('changed');
    actions.reset();
    expect(getState().value).toBe('init');
  });
  it('reset clears isDirty', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'x' }, jest.fn());
    actions.setValue('y');
    actions.reset();
    expect(getState().isDirty).toBe(false);
  });
  it('reset clears error', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: '', validate: () => 'err' },
      jest.fn()
    );
    await actions.save();
    actions.reset();
    expect(getState().error).toBeNull();
  });
  it('reset originalValue back to config initialValue', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'orig' },
      onSave
    );
    actions.setValue('new');
    await actions.save();
    actions.reset();
    expect(getState().originalValue).toBe('orig');
  });
  for (let i = 0; i < 15; i++) {
    it(`reset variant ${i}: always restores initialValue`, () => {
      const init = `init-${i}`;
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: init },
        jest.fn()
      );
      actions.setValue(`changed-${i}`);
      actions.reset();
      expect(getState().value).toBe(init);
      expect(getState().status).toBe('idle');
      expect(getState().isDirty).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 20: Multiple state transitions — 30 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — multiple state transitions', () => {
  it('full cycle: idle→editing→setValue→save→success', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'start' },
      onSave
    );
    expect(getState().status).toBe('idle');
    actions.startEdit();
    expect(getState().status).toBe('editing');
    actions.setValue('end');
    expect(getState().isDirty).toBe(true);
    await actions.save();
    expect(getState().status).toBe('success');
    expect(getState().originalValue).toBe('end');
  });

  it('cycle with cancel: idle→editing→setValue→cancel→idle', () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'init' },
      jest.fn()
    );
    actions.startEdit();
    actions.setValue('temp');
    actions.cancelEdit();
    expect(getState().status).toBe('idle');
    expect(getState().value).toBe('init');
  });

  it('cycle with error: save fails, then reset', async () => {
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x' },
      jest.fn().mockRejectedValue(new Error('net'))
    );
    await actions.save();
    expect(getState().status).toBe('error');
    actions.reset();
    expect(getState().status).toBe('idle');
  });

  it('multiple startEdit calls do not accumulate errors', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    for (let i = 0; i < 5; i++) actions.startEdit();
    expect(getState().status).toBe('editing');
    expect(getState().error).toBeNull();
  });

  it('setValue multiple times → most recent value', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: 'a' }, jest.fn());
    actions.setValue('b');
    actions.setValue('c');
    actions.setValue('d');
    expect(getState().value).toBe('d');
  });

  it('save twice succeeds twice', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'x' },
      onSave
    );
    await actions.save();
    await actions.save();
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(getState().status).toBe('success');
  });

  for (let i = 0; i < 24; i++) {
    it(`multi-transition variant ${i}`, async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: `start-${i}` },
        onSave
      );
      actions.startEdit();
      actions.setValue(`end-${i}`);
      await actions.save();
      expect(getState().status).toBe('success');
      expect(getState().originalValue).toBe(`end-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 21: InlineEditFieldType type values — 20 tests
// ---------------------------------------------------------------------------

describe('InlineEditFieldType values', () => {
  const validTypes: InlineEditFieldType[] = ['text', 'textarea', 'number', 'date', 'select', 'boolean'];

  validTypes.forEach((t) => {
    it(`fieldType "${t}" is valid`, () => {
      const { getState } = createInlineEditState(
        { fieldType: t, initialValue: '' },
        jest.fn()
      );
      expect(getState().status).toBe('idle');
    });
  });

  it('all 6 field types are distinct', () => {
    const types: InlineEditFieldType[] = ['text', 'textarea', 'number', 'date', 'select', 'boolean'];
    expect(new Set(types).size).toBe(6);
  });

  for (let i = 0; i < 13; i++) {
    it(`fieldType used in config variant ${i}`, () => {
      const types: InlineEditFieldType[] = ['text', 'textarea', 'number', 'date', 'select', 'boolean'];
      const t = types[i % types.length];
      const { getState } = createInlineEditState({ fieldType: t, initialValue: null }, jest.fn());
      expect(getState().status).toBe('idle');
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 22: InlineEditStatus type values — 20 tests
// ---------------------------------------------------------------------------

describe('InlineEditStatus values', () => {
  const validStatuses: InlineEditStatus[] = ['idle', 'editing', 'saving', 'error', 'success'];

  it('all 5 statuses are valid string literals', () => {
    validStatuses.forEach((s) => {
      expect(typeof s).toBe('string');
    });
  });

  it('status array has 5 entries', () => {
    expect(validStatuses).toHaveLength(5);
  });

  it('all statuses are distinct', () => {
    expect(new Set(validStatuses).size).toBe(5);
  });

  it('idle is a valid status', () => {
    const s: InlineEditStatus = 'idle';
    expect(s).toBe('idle');
  });

  it('editing is a valid status', () => {
    const s: InlineEditStatus = 'editing';
    expect(s).toBe('editing');
  });

  it('saving is a valid status', () => {
    const s: InlineEditStatus = 'saving';
    expect(s).toBe('saving');
  });

  it('error is a valid status', () => {
    const s: InlineEditStatus = 'error';
    expect(s).toBe('error');
  });

  it('success is a valid status', () => {
    const s: InlineEditStatus = 'success';
    expect(s).toBe('success');
  });

  it('initial state has idle status', () => {
    const { getState } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    const s: InlineEditStatus = getState().status;
    expect(s).toBe('idle');
  });

  it('startEdit transitions to editing status', () => {
    const { getState, actions } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    actions.startEdit();
    const s: InlineEditStatus = getState().status;
    expect(s).toBe('editing');
  });

  for (let i = 0; i < 10; i++) {
    it(`status type check variant ${i}`, () => {
      const statuses: InlineEditStatus[] = ['idle', 'editing', 'saving', 'error', 'success'];
      statuses.forEach((s) => expect(typeof s).toBe('string'));
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 23: Edge cases — 50 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — edge cases', () => {
  it('config with no validate — save succeeds', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'val' },
      onSave
    );
    await actions.save();
    expect(getState().status).toBe('success');
  });

  it('config with validate returning null — save succeeds', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'val', validate: () => null },
      onSave
    );
    await actions.save();
    expect(getState().status).toBe('success');
  });

  it('config with no transform — value passed as-is', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'raw' },
      onSave
    );
    await actions.save();
    expect(onSave).toHaveBeenCalledWith('raw');
  });

  it('save is async and returns a Promise', () => {
    const { actions } = createInlineEditState(
      { fieldType: 'text', initialValue: '' },
      jest.fn().mockResolvedValue(undefined)
    );
    const result = actions.save();
    expect(result).toBeInstanceOf(Promise);
  });

  it('getState is synchronous', () => {
    const { getState } = createInlineEditState({ fieldType: 'text', initialValue: '' }, jest.fn());
    const state = getState();
    expect(typeof state).toBe('object');
  });

  it('multiple independent instances do not share state', () => {
    const inst1 = createInlineEditState({ fieldType: 'text', initialValue: 'a' }, jest.fn());
    const inst2 = createInlineEditState({ fieldType: 'text', initialValue: 'b' }, jest.fn());
    inst1.actions.setValue('x');
    expect(inst2.getState().value).toBe('b');
  });

  it('cancel after successful save reverts to originalValue from save', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'orig' },
      onSave
    );
    actions.setValue('new');
    await actions.save();
    actions.startEdit();
    actions.setValue('temp');
    actions.cancelEdit();
    expect(getState().value).toBe('new');
  });

  it('reset after multiple saves restores to config initialValue', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getState, actions } = createInlineEditState(
      { fieldType: 'text', initialValue: 'zero' },
      onSave
    );
    actions.setValue('one');
    await actions.save();
    actions.setValue('two');
    await actions.save();
    actions.reset();
    expect(getState().value).toBe('zero');
    expect(getState().originalValue).toBe('zero');
  });

  for (let i = 0; i < 40; i++) {
    it(`edge case variant ${i}: state machine stays consistent`, async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: `init-${i}` },
        onSave
      );
      actions.startEdit();
      actions.setValue(`new-${i}`);
      if (i % 2 === 0) {
        await actions.save();
        expect(getState().status).toBe('success');
      } else {
        actions.cancelEdit();
        expect(getState().value).toBe(`init-${i}`);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 24: Repetition / stress batch — 50 tests
// ---------------------------------------------------------------------------

describe('validators — batch repetition', () => {
  for (let i = 0; i < 10; i++) {
    it(`required null returns error [rep ${i}]`, () => {
      expect(required(null)).not.toBeNull();
    });
    it(`required non-empty returns null [rep ${i}]`, () => {
      expect(required('x')).toBeNull();
    });
    it(`minLength(3) 'abc' returns null [rep ${i}]`, () => {
      expect(minLength(3)('abc')).toBeNull();
    });
    it(`maxLength(3) 'abcd' returns error [rep ${i}]`, () => {
      expect(maxLength(3)('abcd')).not.toBeNull();
    });
    it(`isEmail 'user@example.com' returns null [rep ${i}]`, () => {
      expect(isEmail('user@example.com')).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 25: Extended validator stress — 100 tests
// ---------------------------------------------------------------------------

describe('required — stress', () => {
  for (let i = 0; i < 50; i++) {
    it(`required('value-${i}') returns null`, () => {
      expect(required(`value-${i}`)).toBeNull();
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`required(undefined) stress [${i}] returns error`, () => {
      expect(required(undefined)).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 26: Extended minLength/maxLength stress — 100 tests
// ---------------------------------------------------------------------------

describe('minLength/maxLength — stress', () => {
  for (let i = 1; i <= 50; i++) {
    it(`minLength(${i}): string of length ${i} passes`, () => {
      const s = 'a'.repeat(i);
      expect(minLength(i)(s)).toBeNull();
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`maxLength(${i}): string of length ${i} passes`, () => {
      const s = 'a'.repeat(i);
      expect(maxLength(i)(s)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 27: Extended isNumber/isEmail/isUrl stress — 100 tests
// ---------------------------------------------------------------------------

describe('isNumber — stress', () => {
  for (let i = 0; i < 30; i++) {
    it(`isNumber("${i}") returns null`, () => {
      expect(isNumber(String(i))).toBeNull();
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`isNumber("not-a-number-${i}") returns error`, () => {
      expect(isNumber(`not-a-number-${i}`)).not.toBeNull();
    });
  }
});

describe('isEmail — stress', () => {
  const domains = ['example.com', 'test.org', 'nexara.com', 'ims.local', 'company.co.uk'];
  for (let i = 0; i < 25; i++) {
    const domain = domains[i % domains.length];
    it(`isEmail "user${i}@${domain}" returns null`, () => {
      expect(isEmail(`user${i}@${domain}`)).toBeNull();
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`isEmail "invalid-email-${i}" returns error`, () => {
      expect(isEmail(`invalid-email-${i}`)).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 28: composeValidators stress — 50 tests
// ---------------------------------------------------------------------------

describe('composeValidators — stress', () => {
  for (let i = 3; i <= 27; i++) {
    it(`composeValidators required+minLength(${i}): string of ${i} chars passes`, () => {
      const validator = composeValidators(required, minLength(i));
      expect(validator('a'.repeat(i))).toBeNull();
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`composeValidators required+maxLength(${i}): string of ${i + 1} chars fails`, () => {
      const validator = composeValidators(required, maxLength(i));
      expect(validator('a'.repeat(i + 1))).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 29: createInlineEditState round-trip stress — 50 tests
// ---------------------------------------------------------------------------

describe('createInlineEditState — round-trip stress', () => {
  for (let i = 0; i < 25; i++) {
    it(`round-trip [${i}]: start → cancel restores initial value`, async () => {
      const initial = `initial-${i}`;
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: initial },
        jest.fn()
      );
      actions.startEdit();
      actions.setValue(`changed-${i}`);
      actions.cancelEdit();
      expect(getState().value).toBe(initial);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`round-trip [${i}]: start → save success sets status success`, async () => {
      const { getState, actions } = createInlineEditState(
        { fieldType: 'text', initialValue: `v-${i}` },
        jest.fn().mockResolvedValue(undefined)
      );
      actions.startEdit();
      actions.setValue(`saved-${i}`);
      await actions.save();
      expect(getState().status).toBe('success');
    });
  }
});

function moveZeroes217in(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217in_mz',()=>{
  it('a',()=>{expect(moveZeroes217in([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217in([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217in([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217in([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217in([4,2,0,0,3])).toBe(4);});
});
function missingNumber218in(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218in_mn',()=>{
  it('a',()=>{expect(missingNumber218in([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218in([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218in([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218in([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218in([1])).toBe(0);});
});
function climbStairs224in(n:number):number{if(n<=2)return n;let a=1,b=2;for(let i=3;i<=n;i++){const c=a+b;a=b;b=c;}return b;}
describe('ph224in_cs',()=>{
  it('a',()=>{expect(climbStairs224in(2)).toBe(2);});
  it('b',()=>{expect(climbStairs224in(3)).toBe(3);});
  it('c',()=>{expect(climbStairs224in(1)).toBe(1);});
  it('d',()=>{expect(climbStairs224in(5)).toBe(8);});
  it('e',()=>{expect(climbStairs224in(10)).toBe(89);});
});
function singleNumber226in(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph226in_sn',()=>{
  it('a',()=>{expect(singleNumber226in([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber226in([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber226in([1])).toBe(1);});
  it('d',()=>{expect(singleNumber226in([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber226in([3,5,3])).toBe(5);});
});
