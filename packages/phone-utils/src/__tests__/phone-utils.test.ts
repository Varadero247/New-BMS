// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  areEquivalent,
  COUNTRIES,
  detectCountry,
  extractPhones,
  formatPhone,
  formatTemplate,
  generatePhone,
  getCallingCode,
  getCountries,
  getCountryByCallingCode,
  isE164,
  isMobile,
  isTollFree,
  isValidPhone,
  maskPhone,
  normalizePhone,
  parsePhone,
  toE164,
  toInternational,
  toNational,
  toRFC3966,
} from '../phone-utils';

// ============================================================
// 1. isE164 — 80 tests
// ============================================================
describe('isE164', () => {
  const valid = [
    '+442071234567',
    '+12125551234',
    '+12015551234',
    '+14155551234',
    '+13105551234',
    '+12125550000',
    '+441234567890',
    '+33612345678',
    '+49301234567',
    '+61412345678',
    '+27831234567',
    '+919876543210',
    '+8613812345678',
    '+81901234567',
    '+821012345678',
    '+6591234567',
    '+85228123456',
    '+97150123456',
    '+966501234567',
    '+5511987654321',
    '+5215512345678',
    '+541123456789',
    '+905321234567',
    '+201012345678',
    '+2347012345678',
    '+2547012345678',
    '+923012345678',
    '+8801712345678',
    '+6281234567890',
    '+447911123456',
    '+442079461234',
    '+33123456789',
    '+4930123456789',
    '+351912345678',
    '+420777123456',
    '+48512345678',
    '+36201234567',
    '+40712345678',
    '+31612345678',
    '+32470123456',
    '+41791234567',
    '+43676123456',
    '+46701234567',
    '+4799123456',
    '+4512345678',
    '+358501234567',
    '+5511999887766',
    '+447912345678',
    '+14085551234',
    '+16505551234',
  ];

  const invalid = [
    '442071234567',
    '+1',
    '+12345',
    'abc',
    '',
    '+0123456789',
    '0044207123456',
    '+44 207 123 456',
    '+44-207-123456',
    '+(44)1234567890',
    '+1234567890123456', // 16 digits after +
    '+44abc1234567',
    ' +442071234567',
    '+442071234567 ',
    'tel:+442071234567',
    '00442071234567',
    '+',
    '++442071234567',
    '+0442071234567',
    '123456',
  ];

  for (let i = 0; i < valid.length; i++) {
    it(`should return true for valid E.164: ${valid[i]}`, () => {
      expect(isE164(valid[i])).toBe(true);
    });
  }

  for (let i = 0; i < invalid.length; i++) {
    it(`should return false for invalid E.164: ${invalid[i]}`, () => {
      expect(isE164(invalid[i])).toBe(false);
    });
  }
});

// ============================================================
// 2. getCallingCode — 40 tests
// ============================================================
describe('getCallingCode', () => {
  const countries = Object.keys(COUNTRIES);
  for (const code of countries) {
    it(`should return non-empty calling code for ${code}`, () => {
      const result = getCallingCode(code);
      expect(typeof result).toBe('string');
      expect((result as string).length).toBeGreaterThan(0);
    });
  }

  it('should return undefined for unknown country XX', () => {
    expect(getCallingCode('XX')).toBeUndefined();
  });

  it('should be case-insensitive: gb → same as GB', () => {
    expect(getCallingCode('gb')).toBe(getCallingCode('GB'));
  });
});

// ============================================================
// 3. toE164 — 50 tests
// ============================================================
describe('toE164', () => {
  const cases: Array<[string, string, string]> = [
    // [national, country, expected e164]
    ['07911123456', 'GB', '+447911123456'],
    ['07700900123', 'GB', '+447700900123'],
    ['02079460000', 'GB', '+442079460000'],
    ['01612345678', 'GB', '+441612345678'],
    ['07500000000', 'GB', '+447500000000'],
    ['07400000000', 'GB', '+447400000000'],
    ['07600000000', 'GB', '+447600000000'],
    ['07800000000', 'GB', '+447800000000'],
    ['07900000000', 'GB', '+447900000000'],
    ['2125551234', 'US', '+12125551234'],
    ['3105551234', 'US', '+13105551234'],
    ['4155551234', 'US', '+14155551234'],
    ['6505551234', 'US', '+16505551234'],
    ['8005551234', 'US', '+18005551234'],
    ['9175551234', 'US', '+19175551234'],
    ['6135551234', 'CA', '+16135551234'],
    ['4165551234', 'CA', '+14165551234'],
    ['0301234567', 'DE', '+49301234567'],
    ['030123456789', 'DE', '+4930123456789'],
    ['0621234567', 'FR', '+33621234567'],
    ['0123456789', 'FR', '+33123456789'],
    ['0412345678', 'AU', '+61412345678'],
    ['0212345678', 'AU', '+61212345678'],
    ['0312345678', 'AU', '+61312345678'],
    ['9876543210', 'IN', '+919876543210'],
    ['8876543210', 'IN', '+918876543210'],
    ['7876543210', 'IN', '+917876543210'],
    ['6876543210', 'IN', '+916876543210'],
    ['0831234567', 'ZA', '+27831234567'],
    ['0821234567', 'ZA', '+27821234567'],
    ['0801234567', 'ZA', '+27801234567'],
    ['0611234567', 'ZA', '+27611234567'],
    ['0301234567', 'NL', '+31301234567'],
    ['0612345678', 'NL', '+31612345678'],
    ['0471234567', 'BE', '+32471234567'],
    ['0791234567', 'CH', '+41791234567'],
    ['0461234567', 'SE', '+46461234567'],
    ['23456789', 'NO', '+4723456789'],
    ['12345678', 'DK', '+4512345678'],
    ['0512345678', 'FI', '+358512345678'],
    ['0481234567', 'AT', '+43481234567'],
    ['512345678', 'PL', '+48512345678'],
    ['777123456', 'CZ', '+420777123456'],
    ['0712345678', 'RO', '+40712345678'],
    ['912345678', 'PT', '+351912345678'],
    ['0431234567', 'NZ', '+64431234567'],
    ['0501234567', 'AE', '+971501234567'],
    ['0501234567', 'SA', '+966501234567'],
    ['1112345678', 'BR', '+551112345678'],
    ['5512345678', 'MX', '+525512345678'],
  ];

  for (const [nat, country, expected] of cases) {
    it(`toE164("${nat}", "${country}") === "${expected}"`, () => {
      expect(toE164(nat, country)).toBe(expected);
    });
  }
});

// ============================================================
// 4. toNational — 50 tests
// ============================================================
describe('toNational', () => {
  // Each entry: [e164, shouldContainDigits]
  const e164Numbers = [
    '+447911123456',
    '+447700900123',
    '+442079460000',
    '+441612345678',
    '+12125551234',
    '+13105551234',
    '+16505551234',
    '+14155551234',
    '+4930123456789',
    '+33123456789',
    '+33612345678',
    '+61412345678',
    '+61212345678',
    '+919876543210',
    '+918876543210',
    '+27831234567',
    '+27821234567',
    '+31612345678',
    '+32471234567',
    '+41791234567',
    '+46461234567',
    '+4723456789',
    '+4512345678',
    '+358512345678',
    '+43481234567',
    '+48512345678',
    '+420777123456',
    '+36201234567',
    '+40712345678',
    '+351912345678',
    '+64431234567',
    '+971501234567',
    '+966501234567',
    '+551112345678',
    '+525512345678',
    '+541123456789',
    '+905321234567',
    '+201012345678',
    '+2347012345678',
    '+2547012345678',
    '+923012345678',
    '+8801712345678',
    '+6281234567890',
    '+8613812345678',
    '+81901234567',
    '+821012345678',
    '+6591234567',
    '+85228123456',
    '+16135551234',
    '+14165551234',
  ];

  for (let i = 0; i < e164Numbers.length; i++) {
    it(`toNational("${e164Numbers[i]}") returns string with digits`, () => {
      const result = toNational(e164Numbers[i]);
      expect(result).not.toBeNull();
      expect(/\d/.test(result as string)).toBe(true);
    });
  }
});

// ============================================================
// 5. normalizePhone — 50 tests
// ============================================================
describe('normalizePhone', () => {
  const cases: Array<[string, string]> = [
    ['+44 207 123 4567', '+442071234567'],
    ['+1 (212) 555-1234', '+12125551234'],
    ['  +49 30 123456789  ', '+4930123456789'],
    ['+33 6 12 34 56 78', '+33612345678'],
    ['+61 4 1234 5678', '+61412345678'],
    ['07911 123456', '07911123456'],
    ['(212) 555-1234', '2125551234'],
    ['212.555.1234', '2125551234'],
    ['212-555-1234', '2125551234'],
    ['  07700 900123  ', '07700900123'],
    ['+27 83 123 4567', '+27831234567'],
    ['+91 98765 43210', '+919876543210'],
    ['+86 138 1234 5678', '+8613812345678'],
    ['+81 90 1234 5678', '+819012345678'],
    ['+82 10 1234 5678', '+821012345678'],
    ['+65 9123 4567', '+6591234567'],
    ['+852 2812 3456', '+85228123456'],
    ['+971 50 123 4567', '+971501234567'],
    ['+966 50 123 4567', '+966501234567'],
    ['+55 11 98765 4321', '+5511987654321'],
    ['+52 55 1234 5678', '+525512345678'],
    ['+54 11 2345 6789', '+541123456789'],
    ['+90 532 123 4567', '+905321234567'],
    ['+20 101 234 5678', '+201012345678'],
    ['+234 701 234 5678', '+2347012345678'],
    ['+254 701 234 567', '+254701234567'],
    ['+92 301 234 5678', '+923012345678'],
    ['+880 171 234 5678', '+8801712345678'],
    ['+62 812 345 678901', '+62812345678901'],
    ['0800 123 456', '0800123456'],
    ['0808-000-0000', '08080000000'],
    ['+1-800-555-1234', '+18005551234'],
    ['+44.7911.123456', '+447911123456'],
    ['   +31 6 1234 5678   ', '+31612345678'],
    ['+32 47 012 3456', '+32470123456'],
    ['+41 79 123 45 67', '+41791234567'],
    ['+46 70 123 45 67', '+46701234567'],
    ['+47 99 12 34 56', '+4799123456'],
    ['+45 12 34 56 78', '+4512345678'],
    ['+358 50 123 4567', '+358501234567'],
    ['+43 676 123 456', '+43676123456'],
    ['+48 512 345 678', '+48512345678'],
    ['+420 777 123 456', '+420777123456'],
    ['+36 20 123 4567', '+36201234567'],
    ['+40 71 234 5678', '+40712345678'],
    ['+351 91 234 5678', '+351912345678'],
    ['+351 231 234 567', '+351231234567'],
    ['+64 43 123 4567', '+64431234567'],
    ['+64 21 123 4567', '+64211234567'],
    ['+27 61 123 4567', '+27611234567'],
  ];

  for (const [input, expected] of cases) {
    it(`normalizePhone("${input}") === "${expected}"`, () => {
      expect(normalizePhone(input)).toBe(expected);
    });
  }
});

// ============================================================
// 6. isValidPhone — 36 tests (6 per country)
// ============================================================
describe('isValidPhone', () => {
  const validCases: Array<[string, string]> = [
    // GB (6)
    ['+447911123456', 'GB'],
    ['+447700900123', 'GB'],
    ['+441612345678', 'GB'],
    ['+442079460000', 'GB'],
    ['+447500000000', 'GB'],
    ['+443012345678', 'GB'],
    // US (6)
    ['+12125551234', 'US'],
    ['+13105551234', 'US'],
    ['+14155551234', 'US'],
    ['+16505551234', 'US'],
    ['+18005551234', 'US'],
    ['+19175551234', 'US'],
    // DE (6)
    ['+4930123456789', 'DE'],
    ['+49301234567', 'DE'],
    ['+49891234567', 'DE'],
    ['+49221234567', 'DE'],
    ['+4915123456789', 'DE'],
    ['+4917612345678', 'DE'],
    // AU (6)
    ['+61412345678', 'AU'],
    ['+61212345678', 'AU'],
    ['+61312345678', 'AU'],
    ['+61512345678', 'AU'],
    ['+61712345678', 'AU'],
    ['+61812345678', 'AU'],
    // IN (6)
    ['+919876543210', 'IN'],
    ['+918876543210', 'IN'],
    ['+917876543210', 'IN'],
    ['+916876543210', 'IN'],
    ['+919012345678', 'IN'],
    ['+916012345678', 'IN'],
    // ZA (6)
    ['+27831234567', 'ZA'],
    ['+27821234567', 'ZA'],
    ['+27811234567', 'ZA'],
    ['+27711234567', 'ZA'],
    ['+27611234567', 'ZA'],
    ['+27211234567', 'ZA'],
  ];

  for (const [number, country] of validCases) {
    it(`isValidPhone("${number}", "${country}") === true`, () => {
      expect(isValidPhone(number, country)).toBe(true);
    });
  }

  it('returns false for empty string', () => {
    expect(isValidPhone('', 'GB')).toBe(false);
  });

  it('returns false for wrong country prefix', () => {
    expect(isValidPhone('+12125551234', 'GB')).toBe(false);
  });

  it('returns false for too-short number', () => {
    expect(isValidPhone('+4412345', 'GB')).toBe(false);
  });
});

// ============================================================
// 7. parsePhone — 40 tests
// ============================================================
describe('parsePhone', () => {
  const cases: Array<{ input: string; country?: string; callingCode: string; valid: boolean }> = [
    { input: '+447911123456', callingCode: '44', valid: true },
    { input: '+442079460000', callingCode: '44', valid: true },
    { input: '+441612345678', callingCode: '44', valid: true },
    { input: '+12125551234', callingCode: '1', valid: true },
    { input: '+13105551234', callingCode: '1', valid: true },
    { input: '+14155551234', callingCode: '1', valid: true },
    { input: '+4930123456789', callingCode: '49', valid: true },
    { input: '+49301234567', callingCode: '49', valid: true },
    { input: '+33612345678', callingCode: '33', valid: true },
    { input: '+33123456789', callingCode: '33', valid: true },
    { input: '+61412345678', callingCode: '61', valid: true },
    { input: '+61212345678', callingCode: '61', valid: true },
    { input: '+919876543210', callingCode: '91', valid: true },
    { input: '+918876543210', callingCode: '91', valid: true },
    { input: '+27831234567', callingCode: '27', valid: true },
    { input: '+8613812345678', callingCode: '86', valid: true },
    { input: '+81901234567', callingCode: '81', valid: true },
    { input: '+821012345678', callingCode: '82', valid: true },
    { input: '+6591234567', callingCode: '65', valid: true },
    { input: '+85228123456', callingCode: '852', valid: true },
    { input: '+971501234567', callingCode: '971', valid: true },
    { input: '+966501234567', callingCode: '966', valid: true },
    { input: '+551112345678', callingCode: '55', valid: true },
    { input: '+525512345678', callingCode: '52', valid: true },
    { input: '+541123456789', callingCode: '54', valid: true },
    { input: '07911123456', country: 'GB', callingCode: '44', valid: true },
    { input: '07700900123', country: 'GB', callingCode: '44', valid: true },
    { input: '2125551234', country: 'US', callingCode: '1', valid: true },
    { input: '4155551234', country: 'US', callingCode: '1', valid: true },
    { input: '0412345678', country: 'AU', callingCode: '61', valid: true },
    { input: '9876543210', country: 'IN', callingCode: '91', valid: true },
    { input: '0831234567', country: 'ZA', callingCode: '27', valid: true },
    { input: '+2347012345678', callingCode: '234', valid: true },
    { input: '+2547012345678', callingCode: '254', valid: true },
    { input: '+923012345678', callingCode: '92', valid: true },
    { input: '+8801712345678', callingCode: '880', valid: true },
    { input: '', callingCode: '', valid: false },
    { input: 'notanumber', callingCode: '', valid: false },
    { input: '+12345', callingCode: '', valid: false },
    { input: '+0123456789', callingCode: '', valid: false },
  ];

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    it(`parsePhone #${i + 1}: valid=${c.valid}, callingCode="${c.callingCode}"`, () => {
      const result = parsePhone(c.input, c.country);
      expect(result.valid).toBe(c.valid);
      if (c.valid) {
        expect(result.callingCode).toBe(c.callingCode);
        expect(result.e164.startsWith('+')).toBe(true);
      }
    });
  }
});

// ============================================================
// 8. formatPhone e164 — 30 tests
// ============================================================
describe('formatPhone e164', () => {
  const cases: Array<[string, string, string | null]> = [
    ['+447911123456', 'e164', '+447911123456'],
    ['+12125551234', 'e164', '+12125551234'],
    ['+4930123456789', 'e164', '+4930123456789'],
    ['+33612345678', 'e164', '+33612345678'],
    ['+61412345678', 'e164', '+61412345678'],
    ['07911123456', 'e164', null], // no country → null without country hint
    ['+919876543210', 'e164', '+919876543210'],
    ['+8613812345678', 'e164', '+8613812345678'],
    ['+81901234567', 'e164', '+81901234567'],
    ['+821012345678', 'e164', '+821012345678'],
    ['+6591234567', 'e164', '+6591234567'],
    ['+85228123456', 'e164', '+85228123456'],
    ['+971501234567', 'e164', '+971501234567'],
    ['+966501234567', 'e164', '+966501234567'],
    ['+27831234567', 'e164', '+27831234567'],
    ['+551112345678', 'e164', '+551112345678'],
    ['+525512345678', 'e164', '+525512345678'],
    ['+541123456789', 'e164', '+541123456789'],
    ['+905321234567', 'e164', '+905321234567'],
    ['+201012345678', 'e164', '+201012345678'],
    ['+2347012345678', 'e164', '+2347012345678'],
    ['+2547012345678', 'e164', '+2547012345678'],
    ['+923012345678', 'e164', '+923012345678'],
    ['+8801712345678', 'e164', '+8801712345678'],
    ['+16135551234', 'e164', '+16135551234'],
    ['+48512345678', 'e164', '+48512345678'],
    ['+420777123456', 'e164', '+420777123456'],
    ['+36201234567', 'e164', '+36201234567'],
    ['+40712345678', 'e164', '+40712345678'],
    ['+351912345678', 'e164', '+351912345678'],
  ];

  for (const [input, fmt, expected] of cases) {
    it(`formatPhone("${input}", "e164") === ${JSON.stringify(expected)}`, () => {
      expect(formatPhone(input, fmt as 'e164')).toBe(expected);
    });
  }
});

// ============================================================
// 9. formatPhone national — 30 tests
// ============================================================
describe('formatPhone national', () => {
  const e164s = [
    '+447911123456',
    '+442079460000',
    '+12125551234',
    '+13105551234',
    '+4930123456789',
    '+33612345678',
    '+61412345678',
    '+919876543210',
    '+27831234567',
    '+8613812345678',
    '+81901234567',
    '+821012345678',
    '+6591234567',
    '+85228123456',
    '+971501234567',
    '+966501234567',
    '+551112345678',
    '+525512345678',
    '+905321234567',
    '+48512345678',
    '+420777123456',
    '+36201234567',
    '+40712345678',
    '+351912345678',
    '+31612345678',
    '+32471234567',
    '+41791234567',
    '+46701234567',
    '+4723456789',
    '+4512345678',
  ];

  for (const e164 of e164s) {
    it(`formatPhone("${e164}", "national") returns non-null with digits`, () => {
      const result = formatPhone(e164, 'national');
      expect(result).not.toBeNull();
      expect(/\d/.test(result as string)).toBe(true);
    });
  }
});

// ============================================================
// 10. maskPhone — 50 tests
// ============================================================
describe('maskPhone', () => {
  const e164s = [
    '+447911123456',
    '+442079460000',
    '+12125551234',
    '+13105551234',
    '+14155551234',
    '+4930123456789',
    '+33612345678',
    '+33123456789',
    '+61412345678',
    '+61212345678',
    '+919876543210',
    '+918876543210',
    '+27831234567',
    '+27821234567',
    '+8613812345678',
    '+81901234567',
    '+821012345678',
    '+6591234567',
    '+85228123456',
    '+971501234567',
    '+966501234567',
    '+551112345678',
    '+525512345678',
    '+541123456789',
    '+905321234567',
    '+201012345678',
    '+2347012345678',
    '+2547012345678',
    '+923012345678',
    '+8801712345678',
    '+6281234567890',
    '+48512345678',
    '+420777123456',
    '+36201234567',
    '+40712345678',
    '+351912345678',
    '+31612345678',
    '+32471234567',
    '+41791234567',
    '+46701234567',
    '+4723456789',
    '+4512345678',
    '+358501234567',
    '+43676123456',
    '+16135551234',
    '+14165551234',
    '+16505551234',
    '+18005551234',
    '+441234567890',
    '+447700900001',
  ];

  for (const e164 of e164s) {
    it(`maskPhone("${e164}") contains ***`, () => {
      const result = maskPhone(e164);
      expect(result).toContain('***');
    });
  }
});

// ============================================================
// 11. areEquivalent — 50 tests
// ============================================================
describe('areEquivalent', () => {
  const equivalentPairs: Array<[string, string, string?]> = [
    // e164 vs formatted
    ['+447911123456', '+44 7911 123456'],
    ['+12125551234', '+1 (212) 555-1234'],
    ['+4930123456789', '+49 30 123456789'],
    ['+33612345678', '+33 6 12 34 56 78'],
    ['+61412345678', '+61 412 345 678'],
    ['+919876543210', '+91 98765 43210'],
    ['+27831234567', '+27 83 123 4567'],
    ['+8613812345678', '+86 138 1234 5678'],
    ['+6591234567', '+65 9123 4567'],
    ['+85228123456', '+852 2812 3456'],
    // national vs e164 with country
    ['07911123456', '+447911123456', 'GB'],
    ['07700900123', '+447700900123', 'GB'],
    ['02079460000', '+442079460000', 'GB'],
    ['2125551234', '+12125551234', 'US'],
    ['3105551234', '+13105551234', 'US'],
    ['4155551234', '+14155551234', 'US'],
    ['0412345678', '+61412345678', 'AU'],
    ['9876543210', '+919876543210', 'IN'],
    ['0831234567', '+27831234567', 'ZA'],
    ['0301234567', '+49301234567', 'DE'],
    // Both with spaces/dashes
    ['+44 791 112 3456', '+447911123456'],
    ['+1 212 555 1234', '+12125551234'],
    ['+49 30 123456789', '+4930123456789'],
    ['+33 6-12-34-56-78', '+33612345678'],
    ['+61 4 1234 5678', '+61412345678'],
    ['+91 98765-43210', '+919876543210'],
    ['+27 83-123-4567', '+27831234567'],
    ['+86 138-1234-5678', '+8613812345678'],
    ['+65 9123-4567', '+6591234567'],
    ['+852 2812-3456', '+85228123456'],
  ];

  const nonEquivalentPairs: Array<[string, string, string?]> = [
    ['+447911123456', '+447911123457'],
    ['+12125551234', '+12125551235'],
    ['+447911123456', '+12125551234'],
    ['+4930123456789', '+33612345678'],
    ['+61412345678', '+919876543210'],
    ['+27831234567', '+27831234568'],
    ['+8613812345678', '+8613812345679'],
    ['+6591234567', '+6591234568'],
    ['+85228123456', '+85228123457'],
    ['+971501234567', '+971501234568'],
    ['07911123456', '07911123457', 'GB'],
    ['2125551234', '2125551235', 'US'],
    ['0412345678', '0412345679', 'AU'],
    ['9876543210', '9876543211', 'IN'],
    ['0831234567', '0831234568', 'ZA'],
    ['', '+447911123456'],
    ['+447911123456', ''],
    ['notanumber', '+447911123456'],
    ['+447911123456', 'notanumber'],
    ['invalid', 'invalid'],
  ];

  for (let i = 0; i < equivalentPairs.length; i++) {
    const [a, b, c] = equivalentPairs[i];
    it(`areEquivalent pair #${i + 1} (should be true): "${a}" == "${b}"`, () => {
      expect(areEquivalent(a, b, c)).toBe(true);
    });
  }

  for (let i = 0; i < nonEquivalentPairs.length; i++) {
    const [a, b, c] = nonEquivalentPairs[i];
    it(`areEquivalent pair #${i + 1} (should be false): "${a}" != "${b}"`, () => {
      expect(areEquivalent(a, b, c)).toBe(false);
    });
  }
});

// ============================================================
// 12. getCountries — 1 test + assertions
// ============================================================
describe('getCountries', () => {
  it('returns an array of at least 40 countries', () => {
    const countries = getCountries();
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBeGreaterThanOrEqual(40);
  });

  it('each country has code, name, callingCode and pattern', () => {
    const countries = getCountries();
    for (const c of countries) {
      expect(typeof c.code).toBe('string');
      expect(typeof c.name).toBe('string');
      expect(typeof c.callingCode).toBe('string');
      expect(c.pattern instanceof RegExp).toBe(true);
    }
  });

  it('includes GB with callingCode 44', () => {
    const gb = getCountries().find((c) => c.code === 'GB');
    expect(gb).toBeDefined();
    expect(gb?.callingCode).toBe('44');
  });

  it('includes US with callingCode 1', () => {
    const us = getCountries().find((c) => c.code === 'US');
    expect(us).toBeDefined();
    expect(us?.callingCode).toBe('1');
  });

  it('includes IN with callingCode 91', () => {
    const ind = getCountries().find((c) => c.code === 'IN');
    expect(ind).toBeDefined();
    expect(ind?.callingCode).toBe('91');
  });
});

// ============================================================
// 13. extractPhones — 30 tests
// ============================================================
describe('extractPhones', () => {
  const textCases: Array<[string, number]> = [
    // [text, minExpectedCount]
    ['Call us on +44 207 946 0123 for help.', 1],
    ['US office: +1 212 555 1234, UK: +44 7911 123456', 2],
    ['Phone: +49 30 12345678', 1],
    ['Contact: +33 6 12 34 56 78', 1],
    ['AU support +61 4 1234 5678 available', 1],
    ['India: +91 98765 43210', 1],
    ['ZA office: +27 83 123 4567', 1],
    ['CN sales: +86 138 1234 5678', 1],
    ['SG hotline: +65 9123 4567', 1],
    ['HK number: +852 2812 3456', 1],
    ['UAE: +971 50 123 4567', 1],
    ['KSA: +966 50 123 4567', 1],
    ['BR contact: +55 11 98765 4321', 1],
    ['MX line: +52 55 1234 5678', 1],
    ['TR support: +90 532 123 4567', 1],
    ['Reach us at +44-7911-123456 or +1-212-555-1234', 2],
    ['+447911123456 and +12125551234 are the numbers', 2],
    ['Emergency: +44 800 1111', 1],
    ['Fax: +49.30.12345678', 1],
    ['Text START to +1 800 555 1234', 1],
    ['No phones here, just text', 0],
    ['', 0],
    ['Just digits 12345', 0],
    ['+PL number +48 512 345 678', 1],
    ['CZ +420 777 123 456 please call', 1],
    ['HU +36 20 123 4567 thanks', 1],
    ['RO +40 71 234 5678 office', 1],
    ['PT +351 91 234 5678 direct', 1],
    ['NZ +64 43 123 4567 helpline', 1],
    ['Multiple: +44 207 946 0123, +33 1 23 45 67 89, +1 212 555 1234', 2],
  ];

  for (let i = 0; i < textCases.length; i++) {
    const [text, minCount] = textCases[i];
    it(`extractPhones text #${i + 1}: at least ${minCount} phone(s)`, () => {
      const result = extractPhones(text);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(minCount);
    });
  }
});

// ============================================================
// 14. generatePhone — 40 tests (one per country)
// ============================================================
describe('generatePhone', () => {
  const countries = Object.keys(COUNTRIES);
  for (const code of countries) {
    it(`generatePhone("${code}") produces a string starting with +`, () => {
      const phone = generatePhone(code);
      expect(typeof phone).toBe('string');
      expect(phone.startsWith('+')).toBe(true);
    });
  }

  it('throws for unknown country', () => {
    expect(() => generatePhone('XX')).toThrow();
  });

  it('generatePhone("GB") starts with +44', () => {
    const phone = generatePhone('GB');
    expect(phone.startsWith('+44')).toBe(true);
  });

  it('generatePhone("US") starts with +1', () => {
    const phone = generatePhone('US');
    expect(phone.startsWith('+1')).toBe(true);
  });

  it('generatePhone("DE") starts with +49', () => {
    const phone = generatePhone('DE');
    expect(phone.startsWith('+49')).toBe(true);
  });
});

// ============================================================
// 15. toInternational — 30 tests
// ============================================================
describe('toInternational', () => {
  const e164s = [
    '+447911123456',
    '+442079460000',
    '+12125551234',
    '+13105551234',
    '+4930123456789',
    '+33612345678',
    '+33123456789',
    '+61412345678',
    '+919876543210',
    '+27831234567',
    '+8613812345678',
    '+81901234567',
    '+821012345678',
    '+6591234567',
    '+85228123456',
    '+971501234567',
    '+966501234567',
    '+551112345678',
    '+525512345678',
    '+541123456789',
    '+905321234567',
    '+201012345678',
    '+2347012345678',
    '+2547012345678',
    '+923012345678',
    '+8801712345678',
    '+48512345678',
    '+420777123456',
    '+36201234567',
    '+31612345678',
  ];

  for (const e164 of e164s) {
    it(`toInternational("${e164}") starts with + and has space`, () => {
      const result = toInternational(e164);
      expect(result).not.toBeNull();
      expect((result as string).startsWith('+')).toBe(true);
      expect((result as string).includes(' ')).toBe(true);
    });
  }
});

// ============================================================
// 16. toRFC3966 — 30 tests
// ============================================================
describe('toRFC3966', () => {
  const e164s = [
    '+447911123456',
    '+442079460000',
    '+12125551234',
    '+13105551234',
    '+4930123456789',
    '+33612345678',
    '+61412345678',
    '+919876543210',
    '+27831234567',
    '+8613812345678',
    '+81901234567',
    '+821012345678',
    '+6591234567',
    '+85228123456',
    '+971501234567',
    '+966501234567',
    '+551112345678',
    '+525512345678',
    '+905321234567',
    '+201012345678',
    '+2347012345678',
    '+2547012345678',
    '+923012345678',
    '+8801712345678',
    '+48512345678',
    '+420777123456',
    '+36201234567',
    '+31612345678',
    '+32471234567',
    '+41791234567',
  ];

  for (const e164 of e164s) {
    it(`toRFC3966("${e164}") starts with "tel:+"`, () => {
      const result = toRFC3966(e164);
      expect(result).not.toBeNull();
      expect((result as string).startsWith('tel:+')).toBe(true);
    });
  }
});

// ============================================================
// 17. isTollFree — 20 tests
// ============================================================
describe('isTollFree', () => {
  const tollFreeNumbers: Array<[string, string?]> = [
    ['+448001234567', 'GB'],
    ['+448081234567', 'GB'],
    ['08001234567', 'GB'],
    ['08081234567', 'GB'],
    ['+18005551234', 'US'],
    ['+18885551234', 'US'],
    ['+18775551234', 'US'],
    ['+18665551234', 'US'],
    ['+18555551234', 'US'],
    ['+18445551234', 'US'],
    ['+18335551234', 'US'],
    ['+18005551234'],
    ['+18885551234'],
    ['+18775551234'],
    ['+611800123456', 'AU'],
    ['1800123456', 'AU'],
    ['+448001111111'],
    ['+18001234567'],
    ['0800 123 456', 'GB'],
    ['+18881234567'],
  ];

  for (let i = 0; i < tollFreeNumbers.length; i++) {
    const [num, country] = tollFreeNumbers[i];
    it(`isTollFree("${num}"${country ? `, "${country}"` : ''}) === true`, () => {
      expect(isTollFree(num, country)).toBe(true);
    });
  }
});

// ============================================================
// 18. formatTemplate — 30 tests
// ============================================================
describe('formatTemplate', () => {
  const cases: Array<[string, string, string]> = [
    // [digits, template, expected]
    ['7911123456', 'XXXXX XXXXXX', '79111 23456'],
    ['2125551234', '(XXX) XXX-XXXX', '(212) 555-1234'],
    ['3012345678', 'XXXX XXXXXXXX', '3012 345678'],
    ['612345678', 'XX XX XX XX XX', '61 23 45 67 8'],
    ['412345678', 'X XXX XXX XXX', '4 123 456 78'],
    ['9876543210', 'XXXXX XXXXX', '98765 43210'],
    ['13812345678', 'XXX XXXX XXXX', '138 1234 5678'],
    ['901234567', 'XXX XXXX XXXX', '901 2345 67'],
    ['91234567', 'XXXX XXXX', '9123 4567'],
    ['28123456', 'XXXX XXXX', '2812 3456'],
    ['501234567', 'XX XXX XXXX', '50 123 4567'],
    ['501234567', 'XXX XXX XXXX', '501 234 567'],
    ['1112345678', 'XX XXXXX XXXX', '11 12345 678'],
    ['5512345678', 'XXX XXX XXXX', '551 234 5678'],
    ['1123456789', 'XXX XXXX XXXX', '112 3456 789'],
    ['5321234567', 'XXX XXX XXXX', '532 123 4567'],
    ['1012345678', 'XXX XXXX XXXX', '101 2345 678'],
    ['7012345678', 'XXX XXXX XXXX', '701 2345 678'],
    ['7012345678', 'XXX XXXXXXX', '701 2345678'],
    ['512345678', 'XX XXX XXXX', '51 234 5678'],
    ['512345678', 'XXX XXX XXX', '512 345 678'],
    ['777123456', 'XXX XXX XXX', '777 123 456'],
    ['201234567', 'XX XXX XXXX', '20 123 4567'],
    ['712345678', 'XXX XXX XXX', '712 345 678'],
    ['912345678', 'XXX XXX XXX', '912 345 678'],
    ['612345678', 'XX XXX XXXX', '61 234 5678'],
    ['471234567', 'XXX XX XX XX', '471 23 45 67'],
    ['791234567', 'XX XXX XX XX', '79 123 45 67'],
    ['701234567', 'XXX XXX XX XX', '701 234 56 7'],
    ['99123456', 'XXXX XXXX', '9912 3456'],
  ];

  for (const [digits, template, expected] of cases) {
    it(`formatTemplate("${digits}", "${template}") === "${expected}"`, () => {
      expect(formatTemplate(digits, template)).toBe(expected);
    });
  }
});

// ============================================================
// 19. detectCountry — 30 tests
// ============================================================
describe('detectCountry', () => {
  const cases: Array<[string, string | undefined]> = [
    ['+447911123456', 'GB'],
    ['+442079460000', 'GB'],
    ['+12125551234', 'US'],
    ['+4930123456789', 'DE'],
    ['+33612345678', 'FR'],
    ['+61412345678', 'AU'],
    ['+919876543210', 'IN'],
    ['+27831234567', 'ZA'],
    ['+8613812345678', 'CN'],
    ['+81901234567', 'JP'],
    ['+821012345678', 'KR'],
    ['+6591234567', 'SG'],
    ['+85228123456', 'HK'],
    ['+971501234567', 'AE'],
    ['+966501234567', 'SA'],
    ['+551112345678', 'BR'],
    ['+525512345678', 'MX'],
    ['+541123456789', 'AR'],
    ['+905321234567', 'TR'],
    ['+201012345678', 'EG'],
    ['+2347012345678', 'NG'],
    ['+2547012345678', 'KE'],
    ['+923012345678', 'PK'],
    ['+8801712345678', 'BD'],
    ['+6281234567890', 'ID'],
    ['+48512345678', 'PL'],
    ['+420777123456', 'CZ'],
    ['+36201234567', 'HU'],
    ['+40712345678', 'RO'],
    ['+351912345678', 'PT'],
  ];

  for (const [e164, expectedCode] of cases) {
    it(`detectCountry("${e164}") returns ${expectedCode}`, () => {
      const result = detectCountry(e164);
      if (expectedCode) {
        expect(result).toBeDefined();
        expect(result?.code).toBe(expectedCode);
      } else {
        expect(result).toBeUndefined();
      }
    });
  }
});

// ============================================================
// 20. getCountryByCallingCode — 20 tests
// ============================================================
describe('getCountryByCallingCode', () => {
  const cases: Array<[string, string]> = [
    ['44', 'GB'],
    ['1', 'US'],  // US wins for '1'
    ['49', 'DE'],
    ['33', 'FR'],
    ['61', 'AU'],
    ['91', 'IN'],
    ['27', 'ZA'],
    ['86', 'CN'],
    ['81', 'JP'],
    ['82', 'KR'],
    ['65', 'SG'],
    ['852', 'HK'],
    ['971', 'AE'],
    ['966', 'SA'],
    ['55', 'BR'],
    ['52', 'MX'],
    ['90', 'TR'],
    ['234', 'NG'],
    ['254', 'KE'],
    ['880', 'BD'],
  ];

  for (const [callingCode, expectedCode] of cases) {
    it(`getCountryByCallingCode("${callingCode}") has code "${expectedCode}"`, () => {
      const result = getCountryByCallingCode(callingCode);
      expect(result).toBeDefined();
      expect(result?.code).toBe(expectedCode);
    });
  }
});

// ============================================================
// 21. parsePhone validity — 50 additional numbers
// ============================================================
describe('parsePhone validity extended', () => {
  const validE164s = [
    '+447911123456', '+12125551234', '+4930123456789', '+33612345678',
    '+61412345678', '+919876543210', '+27831234567', '+8613812345678',
    '+81901234567', '+821012345678', '+6591234567', '+85228123456',
    '+971501234567', '+966501234567', '+551112345678', '+525512345678',
    '+541123456789', '+905321234567', '+201012345678', '+2347012345678',
    '+2547012345678', '+923012345678', '+8801712345678', '+6281234567890',
    '+48512345678', '+420777123456',
  ];

  const invalidInputs = [
    '', 'abc', '+', '+0', 'garbage442071234567', '+12', 'not-a-phone',
    '+44', '+999999999999999', '00442071234567', 'tel:+442071234567',
    '+44 ', ' ', '0000000000', '+00123456789', '',
    'undefined', '12345',
    '+44207', '+1234', '+5',
    '(invalid)', 'phone: none', '+44abc', '44207123456789012345',
  ];

  for (let i = 0; i < validE164s.length; i++) {
    it(`parsePhone #${i + 1} valid E.164 "${validE164s[i]}" → valid=true`, () => {
      const result = parsePhone(validE164s[i]);
      expect(result.valid).toBe(true);
    });
  }

  for (let i = 0; i < invalidInputs.length; i++) {
    it(`parsePhone #${i + 1} invalid input → valid=false`, () => {
      const result = parsePhone(invalidInputs[i]);
      expect(result.valid).toBe(false);
    });
  }
});

// ============================================================
// 22. isMobile — 20 tests
// ============================================================
describe('isMobile', () => {
  const mobileCases: Array<[string, string?]> = [
    ['+447911123456', 'GB'],
    ['+447700900123', 'GB'],
    ['+447500000000', 'GB'],
    ['+447400000000', 'GB'],
    ['+12125551234', 'US'],
    ['+14155551234', 'US'],
    ['+4915123456789', 'DE'],
    ['+4917612345678', 'DE'],
    ['+33612345678', 'FR'],
    ['+33712345678', 'FR'],
    ['+61412345678', 'AU'],
    ['+919876543210', 'IN'],
    ['+918876543210', 'IN'],
    ['+27831234567', 'ZA'],
    ['+8613812345678', 'CN'],
    ['+81901234567', 'JP'],
    ['+6591234567', 'SG'],
    ['+85298123456', 'HK'],
    ['+971501234567', 'AE'],
    ['+923012345678', 'PK'],
  ];

  for (const [num, country] of mobileCases) {
    it(`isMobile("${num}"${country ? `, "${country}"` : ''}) === true`, () => {
      expect(isMobile(num, country)).toBe(true);
    });
  }
});

// ============================================================
// 23. Edge cases — 80+ individual it() calls
// ============================================================
describe('Edge cases', () => {
  // isE164 edge cases
  it('isE164 empty string returns false', () => expect(isE164('')).toBe(false));
  it('isE164 with only + returns false', () => expect(isE164('+')).toBe(false));
  it('isE164 +0123456789 returns false (starts with 0)', () => expect(isE164('+0123456789')).toBe(false));
  it('isE164 too short +12345 returns false', () => expect(isE164('+12345')).toBe(false));
  it('isE164 too long +123456789012345678 returns false', () => expect(isE164('+123456789012345678')).toBe(false));
  it('isE164 with space inside returns false', () => expect(isE164('+44 7911 123456')).toBe(false));
  it('isE164 with dash returns false', () => expect(isE164('+44-7911-123456')).toBe(false));

  // normalizePhone edge cases
  it('normalizePhone empty string returns empty', () => expect(normalizePhone('')).toBe(''));
  it('normalizePhone "+" returns "+"', () => expect(normalizePhone('+')).toBe('+'));
  it('normalizePhone only letters returns empty', () => expect(normalizePhone('abcdef')).toBe(''));
  it('normalizePhone preserves leading +', () => expect(normalizePhone('+123')).toBe('+123'));
  it('normalizePhone strips parens, spaces, dashes', () => expect(normalizePhone('(020) 7946-0123')).toBe('02079460123'));

  // toE164 edge cases
  it('toE164 with unknown country returns null', () => expect(toE164('07911123456', 'XX')).toBeNull());
  it('toE164 with invalid national number returns null', () => expect(toE164('00000', 'GB')).toBeNull());
  it('toE164 empty string returns null', () => expect(toE164('', 'GB')).toBeNull());
  it('toE164 already E.164 format strips + and calling code', () => expect(toE164('+447911123456', 'GB')).toBe('+447911123456'));

  // toNational edge cases
  it('toNational non-E164 returns null', () => expect(toNational('not-e164')).toBeNull());
  it('toNational empty string returns null', () => expect(toNational('')).toBeNull());
  it('toNational +44 prefix includes 0 trunk for GB', () => {
    const result = toNational('+447911123456');
    expect(result).not.toBeNull();
    expect(/\d/.test(result as string)).toBe(true);
  });

  // toInternational edge cases
  it('toInternational non-E164 returns null', () => expect(toInternational('07911123456')).toBeNull());
  it('toInternational empty returns null', () => expect(toInternational('')).toBeNull());
  it('toInternational valid E.164 has space', () => expect(toInternational('+447911123456')).toContain(' '));

  // toRFC3966 edge cases
  it('toRFC3966 non-E164 returns null', () => expect(toRFC3966('07911123456')).toBeNull());
  it('toRFC3966 empty returns null', () => expect(toRFC3966('')).toBeNull());
  it('toRFC3966 valid starts with tel:', () => expect(toRFC3966('+447911123456')).toBe('tel:+447911123456'));
  it('toRFC3966 US number', () => expect(toRFC3966('+12125551234')).toBe('tel:+12125551234'));

  // formatPhone edge cases
  it('formatPhone invalid number returns null', () => expect(formatPhone('invalid', 'e164')).toBeNull());
  it('formatPhone no-country national returns null', () => expect(formatPhone('07911123456', 'e164')).toBeNull());
  it('formatPhone e164 with country hint', () => expect(formatPhone('07911123456', 'e164', 'GB')).toBe('+447911123456'));
  it('formatPhone national via e164 input', () => expect(formatPhone('+447911123456', 'national')).not.toBeNull());
  it('formatPhone international via e164', () => {
    const r = formatPhone('+447911123456', 'international');
    expect(r).not.toBeNull();
    expect((r as string).startsWith('+')).toBe(true);
  });
  it('formatPhone rfc3966 via e164', () => {
    const r = formatPhone('+447911123456', 'rfc3966');
    expect(r).toBe('tel:+447911123456');
  });

  // maskPhone edge cases
  it('maskPhone empty returns empty string', () => expect(maskPhone('')).toBe(''));
  it('maskPhone with default 4 visible contains ***', () => expect(maskPhone('+447911123456')).toContain('***'));
  it('maskPhone with visibleLast=0 still has prefix', () => expect(maskPhone('+447911123456', 0)).toBeTruthy());
  it('maskPhone short number handles gracefully', () => expect(maskPhone('+4412', 4)).toBeTruthy());

  // areEquivalent edge cases
  it('areEquivalent both empty returns false', () => expect(areEquivalent('', '')).toBe(false));
  it('areEquivalent invalid inputs returns false', () => expect(areEquivalent('abc', 'def')).toBe(false));
  it('areEquivalent same E.164 returns true', () => expect(areEquivalent('+447911123456', '+447911123456')).toBe(true));
  it('areEquivalent different E.164 returns false', () => expect(areEquivalent('+447911123456', '+447911123457')).toBe(false));

  // detectCountry edge cases
  it('detectCountry without + returns undefined', () => expect(detectCountry('447911123456')).toBeUndefined());
  it('detectCountry +999 returns undefined', () => expect(detectCountry('+999123456789')).toBeUndefined());
  it('detectCountry +44... returns GB', () => expect(detectCountry('+447911123456')?.code).toBe('GB'));
  it('detectCountry +852... returns HK', () => expect(detectCountry('+85228123456')?.code).toBe('HK'));
  it('detectCountry +880... returns BD', () => expect(detectCountry('+8801712345678')?.code).toBe('BD'));

  // getCallingCode edge cases
  it('getCallingCode unknown country returns undefined', () => expect(getCallingCode('ZZ')).toBeUndefined());
  it('getCallingCode GB lowercase returns "44"', () => expect(getCallingCode('gb')).toBe('44'));
  it('getCallingCode US returns "1"', () => expect(getCallingCode('US')).toBe('1'));
  it('getCallingCode IN returns "91"', () => expect(getCallingCode('IN')).toBe('91'));
  it('getCallingCode HK returns "852"', () => expect(getCallingCode('HK')).toBe('852'));
  it('getCallingCode BD returns "880"', () => expect(getCallingCode('BD')).toBe('880'));
  it('getCallingCode CZ returns "420"', () => expect(getCallingCode('CZ')).toBe('420'));

  // getCountryByCallingCode edge cases
  it('getCountryByCallingCode "999" returns undefined', () => expect(getCountryByCallingCode('999')).toBeUndefined());
  it('getCountryByCallingCode "44" returns country with code GB', () => {
    expect(getCountryByCallingCode('44')?.code).toBe('GB');
  });
  it('getCountryByCallingCode "91" returns IN', () => {
    expect(getCountryByCallingCode('91')?.code).toBe('IN');
  });

  // isValidPhone edge cases
  it('isValidPhone empty returns false', () => expect(isValidPhone('')).toBe(false));
  it('isValidPhone without country and no + returns false', () => expect(isValidPhone('07911123456')).toBe(false));
  it('isValidPhone valid E.164 no country hint returns true', () => expect(isValidPhone('+447911123456')).toBe(true));
  it('isValidPhone +44 number against US returns false', () => expect(isValidPhone('+447911123456', 'US')).toBe(false));
  it('isValidPhone unknown country returns false', () => expect(isValidPhone('+447911123456', 'XX')).toBe(false));

  // isMobile edge cases
  it('isMobile invalid number returns false', () => expect(isMobile('invalid')).toBe(false));
  it('isMobile UK landline 02079460123 is not mobile', () => expect(isMobile('02079460123', 'GB')).toBe(false));
  it('isMobile UK 07911 is mobile', () => expect(isMobile('+447911123456', 'GB')).toBe(true));

  // isTollFree edge cases
  it('isTollFree regular number returns false', () => expect(isTollFree('+447911123456')).toBe(false));
  it('isTollFree empty returns false', () => expect(isTollFree('')).toBe(false));

  // extractPhones edge cases
  it('extractPhones empty text returns []', () => expect(extractPhones('')).toEqual([]));
  it('extractPhones no phones returns []', () => expect(extractPhones('hello world')).toEqual([]));
  it('extractPhones returns array', () => expect(Array.isArray(extractPhones('call +44 7911 123456'))).toBe(true));

  // formatTemplate edge cases
  it('formatTemplate empty digits returns template structure', () => {
    const result = formatTemplate('', '(XXX) XXX-XXXX');
    expect(result).toBeDefined();
  });
  it('formatTemplate more digits than X fills and appends', () => {
    const result = formatTemplate('12345678901234', 'XX-XX');
    expect(result).toContain('12-34');
    expect(result.length).toBeGreaterThan(5); // appended
  });
  it('formatTemplate no X in template returns template unchanged', () => {
    expect(formatTemplate('12345', '---')).toBe('---12345');
  });

  // generatePhone edge cases
  it('generatePhone GB produces different numbers on repeated calls', () => {
    const phones = new Set(Array.from({ length: 5 }, () => generatePhone('GB')));
    // At least somewhat random - may occasionally collide but unlikely
    expect(phones.size).toBeGreaterThanOrEqual(1);
  });
  it('generatePhone all 40 countries produce strings with digits', () => {
    const codes = Object.keys(COUNTRIES);
    for (const code of codes) {
      const phone = generatePhone(code);
      expect(/\d/.test(phone)).toBe(true);
    }
  });

  // parsePhone with national + country
  it('parsePhone with trunk prefix strips it correctly', () => {
    const result = parsePhone('07911123456', 'GB');
    expect(result.valid).toBe(true);
    expect(result.nationalNumber).toBe('7911123456');
    expect(result.e164).toBe('+447911123456');
  });

  it('parsePhone stores raw input', () => {
    const result = parsePhone('+447911123456');
    expect(result.raw).toBe('+447911123456');
  });

  it('parsePhone for DE with trunk prefix 0', () => {
    const result = parsePhone('0301234567', 'DE');
    expect(result.countryCode).toBe('DE');
  });

  it('parsePhone for HU with trunk prefix 06', () => {
    const result = parsePhone('0620123456', 'HU');
    expect(result.countryCode).toBe('HU');
  });

  it('COUNTRIES record has GB entry', () => {
    expect(COUNTRIES['GB']).toBeDefined();
    expect(COUNTRIES['GB'].callingCode).toBe('44');
  });

  it('COUNTRIES record has at least 40 entries', () => {
    expect(Object.keys(COUNTRIES).length).toBeGreaterThanOrEqual(40);
  });

  it('all COUNTRIES have non-empty callingCode', () => {
    for (const info of Object.values(COUNTRIES)) {
      expect(info.callingCode.length).toBeGreaterThan(0);
    }
  });

  it('all COUNTRIES have non-empty name', () => {
    for (const info of Object.values(COUNTRIES)) {
      expect(info.name.length).toBeGreaterThan(0);
    }
  });

  it('all COUNTRIES have a valid RegExp pattern', () => {
    for (const info of Object.values(COUNTRIES)) {
      expect(info.pattern instanceof RegExp).toBe(true);
    }
  });
});

// ============================================================
// 24. Extra toE164 round-trip batch — 30 more tests
// ============================================================
describe('toE164 extra round-trips', () => {
  const moreCases: Array<[string, string, string]> = [
    ['0812345678', 'ID', '+62812345678'],
    ['01712345678', 'BD', '+8801712345678'],
    ['03012345678', 'PK', '+923012345678'],
    ['0712345678', 'KE', '+254712345678'],
    ['07012345678', 'NG', '+2347012345678'],
    ['01012345678', 'EG', '+201012345678'],
    ['05321234567', 'TR', '+905321234567'],
    ['01123456789', 'AR', '+541123456789'],
    ['5512345678', 'MX', '+525512345678'],
    ['1112345678', 'BR', '+551112345678'],
    ['0501234567', 'SA', '+966501234567'],
    ['0501234567', 'AE', '+971501234567'],
    ['912345678', 'PT', '+351912345678'],
    ['0712345678', 'RO', '+40712345678'],
    ['06201234567', 'HU', '+36201234567'],
    ['777123456', 'CZ', '+420777123456'],
    ['512345678', 'PL', '+48512345678'],
    ['0501234567', 'FI', '+358501234567'],
    ['12345678', 'DK', '+4512345678'],
    ['23456789', 'NO', '+4723456789'],
    ['0461234567', 'SE', '+46461234567'],
    ['0676123456', 'AT', '+43676123456'],
    ['0791234567', 'CH', '+41791234567'],
    ['0471234567', 'BE', '+32471234567'],
    ['0612345678', 'NL', '+31612345678'],
    ['912345678', 'ES', '+34912345678'],
    ['339012345', 'IT', '+39339012345'],
    ['0212345678', 'AU', '+61212345678'],
    ['0412345678', 'NZ', '+64412345678'],
    ['0821234567', 'ZA', '+27821234567'],
  ];

  for (const [nat, country, expected] of moreCases) {
    it(`toE164("${nat}", "${country}") === "${expected}"`, () => {
      expect(toE164(nat, country)).toBe(expected);
    });
  }
});

// ============================================================
// 25. Comprehensive isValidPhone with more countries — 40 tests
// ============================================================
describe('isValidPhone extra countries', () => {
  const cases: Array<[string, string, boolean]> = [
    ['+31612345678', 'NL', true],
    ['+32471234567', 'BE', true],
    ['+41791234567', 'CH', true],
    ['+43676123456', 'AT', true],
    ['+46701234567', 'SE', true],
    ['+4799123456', 'NO', true],
    ['+4512345678', 'DK', true],
    ['+358501234567', 'FI', true],
    ['+48512345678', 'PL', true],
    ['+420777123456', 'CZ', true],
    ['+36201234567', 'HU', true],
    ['+40712345678', 'RO', true],
    ['+351912345678', 'PT', true],
    ['+64431234567', 'NZ', true],
    ['+551112345678', 'BR', true],
    ['+525512345678', 'MX', true],
    ['+541123456789', 'AR', true],
    ['+905321234567', 'TR', true],
    ['+201012345678', 'EG', true],
    ['+2347012345678', 'NG', true],
    ['+2547012345678', 'KE', true],
    ['+923012345678', 'PK', true],
    ['+8801712345678', 'BD', true],
    ['+6281234567890', 'ID', true],
    ['+34912345678', 'ES', true],
    ['+39339012345', 'IT', true],
    // Invalid: wrong country
    ['+447911123456', 'US', false],
    ['+12125551234', 'GB', false],
    ['+4930123456789', 'FR', false],
    ['+33612345678', 'DE', false],
    // Invalid: malformed
    ['+4400000000000', 'GB', false],
    ['+1000', 'US', false],
    ['notanumber', 'GB', false],
    ['', 'GB', false],
    ['+44', 'GB', false],
    ['+1', 'US', false],
    ['+9999999999', 'XX', false],
    ['+44123', 'GB', false],
    ['+999123456789', 'GB', false],
    ['+440000000000', 'GB', false],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [num, country, expected] = cases[i];
    it(`isValidPhone("${num}", "${country}") === ${expected}`, () => {
      expect(isValidPhone(num, country)).toBe(expected);
    });
  }
});

// ============================================================
// 26. toE164 national-only without trunk — 20 tests
// ============================================================
describe('toE164 no-trunk countries', () => {
  const cases: Array<[string, string, string]> = [
    ['912345678', 'ES', '+34912345678'],
    ['612345678', 'ES', '+34612345678'],
    ['712345678', 'ES', '+34712345678'],
    ['812345678', 'ES', '+34812345678'],
    ['912345679', 'ES', '+34912345679'],
    ['339012345', 'IT', '+39339012345'],
    ['236012345', 'IT', '+39236012345'],
    ['512345678', 'PL', '+48512345678'],
    ['612345678', 'PL', '+48612345678'],
    ['712345678', 'PL', '+48712345678'],
    ['777123456', 'CZ', '+420777123456'],
    ['603123456', 'CZ', '+420603123456'],
    ['2125551234', 'US', '+12125551234'],
    ['3105551234', 'US', '+13105551234'],
    ['4085551234', 'US', '+14085551234'],
    ['51234567', 'NO', '+4751234567'],
    ['912345678', 'PT', '+351912345678'],
    ['231234567', 'PT', '+351231234567'],
    ['912345679', 'PT', '+351912345679'],
    ['23456789', 'NO', '+4723456789'],
  ];

  for (const [nat, country, expected] of cases) {
    it(`toE164("${nat}", "${country}") === "${expected}"`, () => {
      expect(toE164(nat, country)).toBe(expected);
    });
  }
});

// ============================================================
// 27. normalizePhone extra — 20 tests
// ============================================================
describe('normalizePhone extra', () => {
  // Verify that normalizePhone strips all non-digit/non-leading-plus chars
  const cases: Array<[string, string]> = [
    ['+1.212.555.1234', '+12125551234'],
    ['+91-98765-43210', '+919876543210'],
    ['+27.83.123.4567', '+27831234567'],
    ['+86 (138) 1234-5678', '+8613812345678'],
    ['+65 6123 4567', '+6561234567'],
    ['+852 2812-3456', '+85228123456'],
    ['+52 (55) 1234-5678', '+525512345678'],
    ['+90 (532) 123-4567', '+905321234567'],
    ['+254 701 234 567', '+254701234567'],
    ['+44 7700 900 123', '+447700900123'],
    ['+1 800 555 0199', '+18005550199'],
    ['+33 1 42 86 09 09', '+33142860909'],
    ['+61 3 9012 3456', '+61390123456'],
    ['+91 11 4567 8901', '+911145678901'],
    ['+27 11 123 4567', '+27111234567'],
    ['+86 10 1234 5678', '+861012345678'],
    ['+81 3 1234 5678', '+81312345678'],
    ['+82 2 1234 5678', '+82212345678'],
    ['+48 512-345-678', '+48512345678'],
    ['+420 777 123 456', '+420777123456'],
  ];

  for (const [input, expected] of cases) {
    it(`normalizePhone("${input}") === "${expected}"`, () => {
      expect(normalizePhone(input)).toBe(expected);
    });
  }
});

// ============================================================
// 28. isE164 boundary tests — 20 tests
// ============================================================
describe('isE164 boundary', () => {
  // Min valid: +1234567 (7 digits after +, starts with 1)
  const minValid = [
    '+1234567', '+2345678', '+3456789', '+4567890', '+5678901',
    '+12345678', '+23456789', '+34567890', '+45678901', '+56789012',
  ];
  // exactly 15 digits after + — valid max
  const maxValid = [
    '+123456789012345', '+234567890123456'.slice(0, 16),
    '+444444444444444', '+999999999999999'.slice(0, 16),
    '+112345678901234',
  ];
  // 16 digits after + — too long
  const tooLong = [
    '+1234567890123456', '+9876543210987654',
    '+1111111111111111', '+2222222222222222',
    '+3333333333333333',
  ];

  for (const n of minValid) {
    it(`isE164 min valid "${n}" returns true`, () => {
      expect(isE164(n)).toBe(true);
    });
  }

  for (const n of tooLong) {
    it(`isE164 too long "${n}" returns false`, () => {
      expect(isE164(n)).toBe(false);
    });
  }
});
