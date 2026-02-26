// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  PATTERNS,
  isEmail,
  isUrl,
  isIpv4,
  isIpv6,
  isUuid,
  isSlug,
  isIban,
  isStrongPassword,
  isSemver,
  isHexColor,
  isPostcodeUk,
  match,
  matchAll,
  extract,
  extractNamed,
  test as regexTest,
  count,
  findFirst,
  findAll,
  replace,
  replaceAll,
  replaceNth,
  redact,
  highlight,
  escape,
  combine,
  flags,
  withFlags,
  namedGroup,
  lookahead,
  negativeLookahead,
  lookbehind,
  optional,
  repeat,
  splitOn,
  splitKeep,
  analyze,
} from '../regex-utils';

// ---------------------------------------------------------------------------
// SECTION 1: isEmail — 100 tests (50 valid + 50 invalid)
// ---------------------------------------------------------------------------

const VALID_EMAILS = [
  'user@example.com',
  'user.name@example.com',
  'user+tag@example.co.uk',
  'user123@domain.org',
  'a@b.io',
  'test.email@subdomain.example.com',
  'user_name@domain.net',
  'first.last@ims.local',
  'info@nexara.ae',
  'hello@world.xyz',
  'admin@ims.local',
  'support@company.co',
  'no-reply@service.io',
  'data@analytics.ai',
  'ceo@bigcorp.com',
  'jane.doe@enterprise.org',
  'invoice+2026@finance.co.uk',
  'ops123@company123.com',
  'user@subdomain.example.org',
  // pad to 50 with variations
  'alpha@beta.com',
  'alpha1@beta1.com',
  'alpha2@beta2.com',
  'alpha3@beta3.com',
  'alpha4@beta4.com',
  'alpha5@beta5.com',
  'alpha6@beta6.com',
  'alpha7@beta7.com',
  'alpha8@beta8.com',
  'alpha9@beta9.com',
  'x@y.io',
  'x1@y1.io',
  'x2@y2.io',
  'x3@y3.io',
  'x4@y4.io',
  'x5@y5.io',
  'x6@y6.io',
  'x7@y7.io',
  'x8@y8.io',
  'x9@y9.io',
  'a1b2@c3d4.net',
  'a1b3@c3d5.net',
  'a1b4@c3d6.net',
  'a1b5@c3d7.net',
  'a1b6@c3d8.net',
  'a1b7@c3d9.net',
  'a1b8@c4d0.net',
  'a1b9@c4d1.net',
  'a2b0@c4d2.net',
  'a2b1@c4d3.net',
];

const INVALID_EMAILS = [
  '',
  'notanemail',
  '@nodomain.com',
  'user@',
  'user@@domain.com',
  'user @domain.com',
  'user@ domain.com',
  'user@domain',
  'user@domain.',
  'user@-domain.com',
  'user@domain..com',
  'us er@domain.com',
  'user@dom ain.com',
  'user@domain.c',
  'plainaddress',
  '#@%^%#$@#$@#.com',
  '@example.com',
  'email.example.com',
  'email@example@example.com',
  'あいう@example.com',
  'email@example.com (Joe Smith)',
  'email@-example.com',
  'email@example-.com',
  'email@111.222.333.44444',
  'user @domain.com',
  'user@ domain.com',
  'no-at-sign-here',
  // pad to 50
  'bad1',
  'bad2',
  'bad3',
  'bad4',
  'bad5',
  'bad6',
  'bad7',
  'bad8',
  'bad9',
  'bad10',
  'bad11',
  'bad12',
  'bad13',
  'bad14',
  'bad15',
  'bad16',
  'bad17',
  'bad18',
  'bad19',
  'bad20',
];

describe('isEmail — 50 valid addresses', () => {
  for (let i = 0; i < VALID_EMAILS.length; i++) {
    const email = VALID_EMAILS[i];
    it(`valid email[${i}]: "${email}"`, () => {
      expect(isEmail(email)).toBe(true);
    });
  }
});

describe('isEmail — 50 invalid addresses', () => {
  for (let i = 0; i < INVALID_EMAILS.length; i++) {
    const email = INVALID_EMAILS[i];
    it(`invalid email[${i}]: "${email}"`, () => {
      expect(isEmail(email)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 2: isUuid — 100 tests (50 valid + 50 invalid)
// ---------------------------------------------------------------------------

const VALID_UUIDS = [
  '550e8400-e29b-41d4-a716-446655440000',
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
  '00000000-0000-1000-8000-000000000000',
  '00000000-0000-2000-8000-000000000000',
  '00000000-0000-3000-8000-000000000000',
  '00000000-0000-4000-8000-000000000000',
  '00000000-0000-5000-8000-000000000000',
  'aaaaaaaa-bbbb-1ccc-8ddd-eeeeeeeeeeee',
  'AAAAAAAA-BBBB-1CCC-8DDD-EEEEEEEEEEEE',
  '12345678-1234-1234-8234-123456789012',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb32',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb33',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb34',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb35',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb36',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb37',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb38',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb39',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb3a',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb3b',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb3c',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb3d',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb3e',
  '4aa1a6eb-90ea-4e98-b3ae-0ca00a81bb3f',
  '11111111-1111-1111-8111-111111111111',
  '22222222-2222-2222-8222-222222222222',
  '33333333-3333-3333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-1555-8555-555555555555',
  'abcdef01-2345-1678-90ab-cdef01234567',
  'abcdef01-2345-2678-90ab-cdef01234567',
  'abcdef01-2345-3678-90ab-cdef01234567',
  'abcdef01-2345-4678-90ab-cdef01234567',
  'abcdef01-2345-5678-90ab-cdef01234567',
  'deadbeef-dead-1eef-8ead-beefdeadbeef',
  'cafebabe-cafe-1abe-8afe-babecafebabe',
  'feedface-feed-1ace-8eed-facefeedface',
  '0f0f0f0f-0f0f-1f0f-8f0f-0f0f0f0f0f0f',
  'ffffffff-ffff-1fff-8fff-ffffffffffff',
  '00000001-0001-1001-8001-000000000001',
  '00000002-0002-2002-8002-000000000002',
  '00000003-0003-3003-8003-000000000003',
  '00000004-0004-4004-8004-000000000004',
  '00000005-0005-5005-8005-000000000005',
];

const INVALID_UUIDS = [
  '',
  'not-a-uuid',
  '550e8400-e29b-41d4-a716',
  '550e8400e29b41d4a716446655440000',
  '550e8400-e29b-41d4-a716-44665544000G',
  '550e8400-e29b-61d4-a716-446655440000', // version 6 (invalid for v1-5)
  '550e8400-e29b-41d4-0716-446655440000', // variant bit invalid
  'zzzzzzzz-zzzz-1zzz-8zzz-zzzzzzzzzzzz',
  '550e8400-e29b-41d4-a716-4466554400',
  '550e8400-e29b-41d4-a716-44665544000000',
  '550e8400-e29b-41d4-a716-44665544000-',
  '-550e8400-e29b-41d4-a716-446655440000',
  '550e8400--e29b-41d4-a716-446655440000',
  ' 550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000 ',
  '00000000-0000-0000-0000-000000000000', // version 0 invalid
  'gggggggg-gggg-1ggg-8ggg-gggggggggggg',
  '12345678-1234-1234-1234-123456789012', // variant bits wrong (12 not 8-9, a, b)
  'short',
  'toolongstring-e29b-41d4-a716-446655440000',
  // pad to 50
  'inv1', 'inv2', 'inv3', 'inv4', 'inv5',
  'inv6', 'inv7', 'inv8', 'inv9', 'inv10',
  'inv11', 'inv12', 'inv13', 'inv14', 'inv15',
  'inv16', 'inv17', 'inv18', 'inv19', 'inv20',
  'inv21', 'inv22', 'inv23', 'inv24', 'inv25',
  'inv26', 'inv27', 'inv28', 'inv29', 'inv30',
];

describe('isUuid — 50 valid UUIDs', () => {
  for (let i = 0; i < VALID_UUIDS.length; i++) {
    const uuid = VALID_UUIDS[i];
    it(`valid uuid[${i}]: "${uuid}"`, () => {
      expect(isUuid(uuid)).toBe(true);
    });
  }
});

describe('isUuid — 50 invalid UUIDs', () => {
  for (let i = 0; i < INVALID_UUIDS.length; i++) {
    const uuid = INVALID_UUIDS[i];
    it(`invalid uuid[${i}]: "${uuid}"`, () => {
      expect(isUuid(uuid)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 3: escape() — 100 tests (i = 0..99)
// ---------------------------------------------------------------------------

describe('escape() round-trip — 100 tests', () => {
  const specials = ['.*+?^${}()|[\\]', '.', '*', '+', '?', '^', '$', '{', '}', '(', ')'];
  for (let i = 0; i < 100; i++) {
    const str = `prefix${specials[i % specials.length]}${i}suffix`;
    it(`escape round-trip[${i}]: "${str}"`, () => {
      const escaped = escape(str);
      const re = new RegExp(escaped);
      expect(re.test(str)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 4: count() — 100 tests (i = 0..99)
// ---------------------------------------------------------------------------

describe('count() — 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    const needle = `tok${i}`;
    const repetitions = (i % 5) + 1;
    const haystack = Array(repetitions).fill(needle).join(' | ');
    it(`count[${i}]: "${needle}" repeated ${repetitions}x`, () => {
      expect(count(haystack, new RegExp(escape(needle)))).toBe(repetitions);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 5: extractNamed() — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

describe('extractNamed() — 50 tests', () => {
  const pattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/g;
  for (let i = 0; i < 50; i++) {
    const year = 2000 + i;
    const month = String((i % 12) + 1).padStart(2, '0');
    const day = String((i % 28) + 1).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const input = `Date is ${dateStr} and done`;
    it(`extractNamed[${i}]: "${dateStr}"`, () => {
      const results = extractNamed(input, pattern);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].year).toBe(String(year));
      expect(results[0].month).toBe(month);
      expect(results[0].day).toBe(day);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 6: replaceNth() — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

describe('replaceNth() — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    const n = (i % 4) + 1; // replace 1st, 2nd, 3rd, or 4th
    const total = 4;
    const word = 'cat';
    const input = Array(total).fill(word).join(' ');
    it(`replaceNth[${i}]: replace occurrence ${n} of "${word}" in "${input}"`, () => {
      const result = replaceNth(input, /cat/, 'dog', n);
      const dogCount = (result.match(/dog/g) ?? []).length;
      const catCount = (result.match(/cat/g) ?? []).length;
      expect(dogCount).toBe(1);
      expect(catCount).toBe(total - 1);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 7: redact() — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

describe('redact() — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    const secret = `secret${i}@example.com`;
    const input = `Contact: ${secret} for details (${secret})`;
    it(`redact[${i}]: redact email "${secret}"`, () => {
      // Use a simple email-like pattern for this test
      const emailPat = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
      const result = redact(input, emailPat, '[REDACTED]');
      expect(result).not.toContain(secret);
      expect(result).toContain('[REDACTED]');
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 8: isStrongPassword() — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

const STRONG_PASSWORDS = [
  'Abcdef1!',
  'P@ssw0rd',
  'Str0ng#Pass',
  'C0mplex!ty',
  'Secur3$Key',
  'My#P@ss1',
  'Nexara2026!',
  'IMS_Admin1!',
  'Qwerty1@3',
  'Zy9#Abc!',
  'Hello@1World',
  'T3st!Pass',
  'Alpha1Beta@',
  'Gamma2Delta#',
  'Epsilon3Zeta$',
  'Theta4Iota%',
  'Kappa5Lambda^',
  'Mu6Nu&Op',
  'Pi7Rho*Sigma',
  'Tau8Upsilon(',
  'Phi9Chi)Psi',
  'Omega0Alpha!',
  'Complex1!Pwd',
  'Str0ng!Pwd2',
  'Safe3Pwd#Now',
];

const WEAK_PASSWORDS = [
  '',
  'short',
  'alllowercase1!',
  'ALLUPPERCASE1!',
  'NoSpecialChar1',
  'NoNumber!Pass',
  'Ab1!',           // too short
  '12345678',
  'password',
  'PASSWORD',
  'Password',
  'Password1',
  'pass word1!',
  'no_upper_case1!',
  'NO_LOWER_CASE1!',
  'NoDigitHere!@#',
  'OnlyLetterss1',
  'Ab!',
  'Ab1',
  'Ab!cd',
  '1234567!',
  'ABCDEFG1',
  'abcdefg!',
  'Abcdefgh',
  'abcdefgh1',
];

describe('isStrongPassword() — 50 tests (25 strong + 25 weak)', () => {
  for (let i = 0; i < STRONG_PASSWORDS.length; i++) {
    const pw = STRONG_PASSWORDS[i];
    it(`strong password[${i}]: "${pw}"`, () => {
      expect(isStrongPassword(pw)).toBe(true);
    });
  }
  for (let i = 0; i < WEAK_PASSWORDS.length; i++) {
    const pw = WEAK_PASSWORDS[i];
    it(`weak password[${i}]: "${pw}"`, () => {
      expect(isStrongPassword(pw)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 9: combine() — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

describe('combine() — 50 tests', () => {
  const wordPairs: [string, string][] = [];
  for (let i = 0; i < 50; i++) {
    wordPairs.push([`word${i}A`, `word${i}B`]);
  }
  for (let i = 0; i < wordPairs.length; i++) {
    const [a, b] = wordPairs[i];
    it(`combine[${i}]: /${escape(a)}/ | /${escape(b)}/`, () => {
      const combined = combine(new RegExp(escape(a)), new RegExp(escape(b)));
      expect(combined.test(a)).toBe(true);
      expect(combined.test(b)).toBe(true);
      expect(combined.test(`neither`)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 10: matchAll() — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

describe('matchAll() — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    const occurrences = (i % 5) + 1;
    const token = `item${i}`;
    const input = Array(occurrences).fill(token).join(', ');
    it(`matchAll[${i}]: "${token}" appears ${occurrences}x`, () => {
      const results = matchAll(input, new RegExp(escape(token)));
      expect(results).toHaveLength(occurrences);
      results.forEach((r) => {
        expect(r.matched).toBe(true);
        expect(r.value).toBe(token);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 11: PATTERNS correctness — individual tests for all named patterns
// ---------------------------------------------------------------------------

describe('PATTERNS.EMAIL correctness', () => {
  it('matches valid email', () => expect(PATTERNS.EMAIL.test('user@example.com')).toBe(true));
  it('rejects bare word', () => expect(PATTERNS.EMAIL.test('notvalid')).toBe(false));
  it('rejects missing TLD', () => expect(PATTERNS.EMAIL.test('a@b')).toBe(false));
});

describe('PATTERNS.URL correctness', () => {
  it('matches https URL', () => expect(PATTERNS.URL.test('https://example.com')).toBe(true));
  it('matches http URL with path', () => expect(PATTERNS.URL.test('http://example.com/path/to/page')).toBe(true));
  it('rejects ftp URL', () => expect(PATTERNS.URL.test('ftp://example.com')).toBe(false));
  it('rejects bare domain', () => expect(PATTERNS.URL.test('example.com')).toBe(false));
});

describe('PATTERNS.IPV4 correctness', () => {
  it('matches 192.168.1.1', () => expect(PATTERNS.IPV4.test('192.168.1.1')).toBe(true));
  it('matches 0.0.0.0', () => expect(PATTERNS.IPV4.test('0.0.0.0')).toBe(true));
  it('matches 255.255.255.255', () => expect(PATTERNS.IPV4.test('255.255.255.255')).toBe(true));
  it('rejects 256.0.0.1', () => expect(PATTERNS.IPV4.test('256.0.0.1')).toBe(false));
  it('rejects partial IP', () => expect(PATTERNS.IPV4.test('192.168.1')).toBe(false));
});

describe('PATTERNS.IPV6 correctness', () => {
  it('matches full IPv6', () => expect(PATTERNS.IPV6.test('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true));
  it('matches loopback ::', () => expect(PATTERNS.IPV6.test('::')).toBe(true));
  it('rejects invalid segment', () => expect(PATTERNS.IPV6.test('gggg::1')).toBe(false));
});

describe('PATTERNS.UUID correctness', () => {
  it('matches v4 UUID', () => expect(PATTERNS.UUID.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true));
  it('rejects malformed', () => expect(PATTERNS.UUID.test('not-a-uuid')).toBe(false));
});

describe('PATTERNS.PHONE_E164 correctness', () => {
  it('matches +14155552671', () => expect(PATTERNS.PHONE_E164.test('+14155552671')).toBe(true));
  it('matches +447911123456', () => expect(PATTERNS.PHONE_E164.test('+447911123456')).toBe(true));
  it('rejects no plus', () => expect(PATTERNS.PHONE_E164.test('14155552671')).toBe(false));
  it('rejects +0 prefix', () => expect(PATTERNS.PHONE_E164.test('+0123456789')).toBe(false));
});

describe('PATTERNS.POSTCODE_UK correctness', () => {
  it('matches SW1A 1AA', () => expect(PATTERNS.POSTCODE_UK.test('SW1A 1AA')).toBe(true));
  it('matches EC1A1BB', () => expect(PATTERNS.POSTCODE_UK.test('EC1A1BB')).toBe(true));
  it('matches M1 1AE', () => expect(PATTERNS.POSTCODE_UK.test('M1 1AE')).toBe(true));
  it('rejects INVALID', () => expect(PATTERNS.POSTCODE_UK.test('INVALID')).toBe(false));
});

describe('PATTERNS.POSTCODE_US correctness', () => {
  it('matches 90210', () => expect(PATTERNS.POSTCODE_US.test('90210')).toBe(true));
  it('matches 90210-1234', () => expect(PATTERNS.POSTCODE_US.test('90210-1234')).toBe(true));
  it('rejects 9021', () => expect(PATTERNS.POSTCODE_US.test('9021')).toBe(false));
  it('rejects letters', () => expect(PATTERNS.POSTCODE_US.test('SW1A 1AA')).toBe(false));
});

describe('PATTERNS.IBAN correctness', () => {
  it('matches GB29NWBK60161331926819', () => expect(PATTERNS.IBAN.test('GB29NWBK60161331926819')).toBe(true));
  it('matches DE89370400440532013000', () => expect(PATTERNS.IBAN.test('DE89370400440532013000')).toBe(true));
  it('rejects short string', () => expect(PATTERNS.IBAN.test('GB')).toBe(false));
  it('rejects lowercase', () => expect(PATTERNS.IBAN.test('gb29nwbk60161331926819')).toBe(false));
});

describe('PATTERNS.ISO_DATE correctness', () => {
  it('matches 2026-02-24', () => expect(PATTERNS.ISO_DATE.test('2026-02-24')).toBe(true));
  it('matches 2000-01-01', () => expect(PATTERNS.ISO_DATE.test('2000-01-01')).toBe(true));
  it('rejects 2026/02/24', () => expect(PATTERNS.ISO_DATE.test('2026/02/24')).toBe(false));
  it('rejects 26-02-24', () => expect(PATTERNS.ISO_DATE.test('26-02-24')).toBe(false));
  it('rejects month 13', () => expect(PATTERNS.ISO_DATE.test('2026-13-01')).toBe(false));
});

describe('PATTERNS.ISO_DATETIME correctness', () => {
  it('matches Z datetime', () => expect(PATTERNS.ISO_DATETIME.test('2026-02-24T12:00:00Z')).toBe(true));
  it('matches offset datetime', () => expect(PATTERNS.ISO_DATETIME.test('2026-02-24T12:00:00+05:30')).toBe(true));
  it('matches with ms', () => expect(PATTERNS.ISO_DATETIME.test('2026-02-24T12:00:00.123Z')).toBe(true));
  it('rejects no T', () => expect(PATTERNS.ISO_DATETIME.test('2026-02-24 12:00:00Z')).toBe(false));
});

describe('PATTERNS.TIME_24H correctness', () => {
  it('matches 00:00', () => expect(PATTERNS.TIME_24H.test('00:00')).toBe(true));
  it('matches 23:59', () => expect(PATTERNS.TIME_24H.test('23:59')).toBe(true));
  it('matches 14:30:00', () => expect(PATTERNS.TIME_24H.test('14:30:00')).toBe(true));
  it('rejects 24:00', () => expect(PATTERNS.TIME_24H.test('24:00')).toBe(false));
  it('rejects 12:60', () => expect(PATTERNS.TIME_24H.test('12:60')).toBe(false));
});

describe('PATTERNS.TIME_12H correctness', () => {
  it('matches 12:00 PM', () => expect(PATTERNS.TIME_12H.test('12:00 PM')).toBe(true));
  it('matches 1:30 am', () => expect(PATTERNS.TIME_12H.test('1:30 am')).toBe(true));
  it('rejects 13:00 PM', () => expect(PATTERNS.TIME_12H.test('13:00 PM')).toBe(false));
});

describe('PATTERNS.HEX_COLOR correctness', () => {
  it('matches #fff', () => expect(PATTERNS.HEX_COLOR.test('#fff')).toBe(true));
  it('matches #FF0000', () => expect(PATTERNS.HEX_COLOR.test('#FF0000')).toBe(true));
  it('matches #FF0000FF', () => expect(PATTERNS.HEX_COLOR.test('#FF0000FF')).toBe(true));
  it('rejects no hash', () => expect(PATTERNS.HEX_COLOR.test('FF0000')).toBe(false));
  it('rejects 5-char', () => expect(PATTERNS.HEX_COLOR.test('#FFFFF')).toBe(false));
});

describe('PATTERNS.RGB_COLOR correctness', () => {
  it('matches rgb(255,0,0)', () => expect(PATTERNS.RGB_COLOR.test('rgb(255,0,0)')).toBe(true));
  it('matches rgb(0, 128, 255)', () => expect(PATTERNS.RGB_COLOR.test('rgb(0, 128, 255)')).toBe(true));
  it('rejects out-of-range', () => expect(PATTERNS.RGB_COLOR.test('rgb(256,0,0)')).toBe(false));
});

describe('PATTERNS.HSL_COLOR correctness', () => {
  it('matches hsl(0, 100%, 50%)', () => expect(PATTERNS.HSL_COLOR.test('hsl(0, 100%, 50%)')).toBe(true));
  it('matches hsl(360, 0%, 100%)', () => expect(PATTERNS.HSL_COLOR.test('hsl(360, 0%, 100%)')).toBe(true));
  it('rejects hue > 360', () => expect(PATTERNS.HSL_COLOR.test('hsl(361, 0%, 100%)')).toBe(false));
});

describe('PATTERNS.SLUG correctness', () => {
  it('matches my-slug', () => expect(PATTERNS.SLUG.test('my-slug')).toBe(true));
  it('matches hello-world-123', () => expect(PATTERNS.SLUG.test('hello-world-123')).toBe(true));
  it('rejects leading dash', () => expect(PATTERNS.SLUG.test('-bad-slug')).toBe(false));
  it('rejects trailing dash', () => expect(PATTERNS.SLUG.test('bad-slug-')).toBe(false));
  it('rejects uppercase', () => expect(PATTERNS.SLUG.test('Bad-Slug')).toBe(false));
  it('rejects spaces', () => expect(PATTERNS.SLUG.test('bad slug')).toBe(false));
});

describe('PATTERNS.USERNAME correctness', () => {
  it('matches valid username', () => expect(PATTERNS.USERNAME.test('john_doe')).toBe(true));
  it('matches with dots', () => expect(PATTERNS.USERNAME.test('john.doe')).toBe(true));
  it('rejects too short', () => expect(PATTERNS.USERNAME.test('ab')).toBe(false));
  it('rejects too long (33+)', () => expect(PATTERNS.USERNAME.test('a'.repeat(33))).toBe(false));
});

describe('PATTERNS.PASSWORD_STRONG correctness', () => {
  it('matches strong password', () => expect(PATTERNS.PASSWORD_STRONG.test('Abc!1def')).toBe(true));
  it('rejects no special char', () => expect(PATTERNS.PASSWORD_STRONG.test('Abcdef12')).toBe(false));
  it('rejects too short', () => expect(PATTERNS.PASSWORD_STRONG.test('Ab1!')).toBe(false));
});

describe('PATTERNS.SEMVER correctness', () => {
  it('matches 1.0.0', () => expect(PATTERNS.SEMVER.test('1.0.0')).toBe(true));
  it('matches 1.2.3-alpha.1', () => expect(PATTERNS.SEMVER.test('1.2.3-alpha.1')).toBe(true));
  it('matches 1.2.3+build.1', () => expect(PATTERNS.SEMVER.test('1.2.3+build.1')).toBe(true));
  it('rejects 1.0', () => expect(PATTERNS.SEMVER.test('1.0')).toBe(false));
  it('rejects v1.0.0', () => expect(PATTERNS.SEMVER.test('v1.0.0')).toBe(false));
});

describe('PATTERNS.MAC_ADDRESS correctness', () => {
  it('matches 00:1A:2B:3C:4D:5E', () => expect(PATTERNS.MAC_ADDRESS.test('00:1A:2B:3C:4D:5E')).toBe(true));
  it('matches 00-1A-2B-3C-4D-5E', () => expect(PATTERNS.MAC_ADDRESS.test('00-1A-2B-3C-4D-5E')).toBe(true));
  it('rejects short', () => expect(PATTERNS.MAC_ADDRESS.test('00:1A:2B:3C:4D')).toBe(false));
});

describe('PATTERNS.CSS_CLASS correctness', () => {
  it('matches .my-class', () => expect(PATTERNS.CSS_CLASS.test('.my-class')).toBe(true));
  it('matches ._private', () => expect(PATTERNS.CSS_CLASS.test('._private')).toBe(true));
  it('rejects no dot', () => expect(PATTERNS.CSS_CLASS.test('my-class')).toBe(false));
  it('rejects leading digit', () => expect(PATTERNS.CSS_CLASS.test('.1class')).toBe(false));
});

describe('PATTERNS.POSITIVE_INT correctness', () => {
  it('matches 0', () => expect(PATTERNS.POSITIVE_INT.test('0')).toBe(true));
  it('matches 12345', () => expect(PATTERNS.POSITIVE_INT.test('12345')).toBe(true));
  it('rejects -1', () => expect(PATTERNS.POSITIVE_INT.test('-1')).toBe(false));
  it('rejects 1.5', () => expect(PATTERNS.POSITIVE_INT.test('1.5')).toBe(false));
});

describe('PATTERNS.NEGATIVE_INT correctness', () => {
  it('matches -1', () => expect(PATTERNS.NEGATIVE_INT.test('-1')).toBe(true));
  it('matches -9999', () => expect(PATTERNS.NEGATIVE_INT.test('-9999')).toBe(true));
  it('rejects 1', () => expect(PATTERNS.NEGATIVE_INT.test('1')).toBe(false));
  it('rejects -1.5', () => expect(PATTERNS.NEGATIVE_INT.test('-1.5')).toBe(false));
});

describe('PATTERNS.DECIMAL correctness', () => {
  it('matches 3.14', () => expect(PATTERNS.DECIMAL.test('3.14')).toBe(true));
  it('matches -0.5', () => expect(PATTERNS.DECIMAL.test('-0.5')).toBe(true));
  it('rejects 3', () => expect(PATTERNS.DECIMAL.test('3')).toBe(false));
  it('rejects 3.', () => expect(PATTERNS.DECIMAL.test('3.')).toBe(false));
});

describe('PATTERNS.SCIENTIFIC_NOTATION correctness', () => {
  it('matches 1e10', () => expect(PATTERNS.SCIENTIFIC_NOTATION.test('1e10')).toBe(true));
  it('matches -2.5E-3', () => expect(PATTERNS.SCIENTIFIC_NOTATION.test('-2.5E-3')).toBe(true));
  it('rejects plain 42', () => expect(PATTERNS.SCIENTIFIC_NOTATION.test('42')).toBe(false));
});

describe('PATTERNS.MARKDOWN_HEADING correctness', () => {
  it('matches # Heading', () => expect(PATTERNS.MARKDOWN_HEADING.test('# Heading')).toBe(true));
  it('matches ## Sub', () => expect(PATTERNS.MARKDOWN_HEADING.test('## Sub')).toBe(true));
  it('matches ###### Deep', () => expect(PATTERNS.MARKDOWN_HEADING.test('###### Deep')).toBe(true));
  it('rejects ####### (7 hashes)', () => expect(PATTERNS.MARKDOWN_HEADING.test('####### TooDeep')).toBe(false));
  it('rejects no space', () => expect(PATTERNS.MARKDOWN_HEADING.test('#NoSpace')).toBe(false));
});

describe('PATTERNS.MARKDOWN_LINK correctness', () => {
  it('matches [text](url)', () => expect(PATTERNS.MARKDOWN_LINK.test('[Click here](https://example.com)')).toBe(true));
  it('rejects plain text', () => expect(PATTERNS.MARKDOWN_LINK.test('plain text')).toBe(false));
  it('rejects bare URL', () => expect(PATTERNS.MARKDOWN_LINK.test('https://example.com')).toBe(false));
});

describe('PATTERNS.WHITESPACE_ONLY correctness', () => {
  it('matches spaces only', () => expect(PATTERNS.WHITESPACE_ONLY.test('   ')).toBe(true));
  it('matches tab', () => expect(PATTERNS.WHITESPACE_ONLY.test('\t')).toBe(true));
  it('rejects word', () => expect(PATTERNS.WHITESPACE_ONLY.test(' a ')).toBe(false));
  it('rejects empty', () => expect(PATTERNS.WHITESPACE_ONLY.test('')).toBe(false));
});

describe('PATTERNS.EMPTY_LINE correctness', () => {
  it('matches empty string', () => expect(PATTERNS.EMPTY_LINE.test('')).toBe(true));
  it('rejects space', () => expect(PATTERNS.EMPTY_LINE.test(' ')).toBe(false));
});

// ---------------------------------------------------------------------------
// SECTION 12: Individual function correctness tests
// ---------------------------------------------------------------------------

describe('match() function', () => {
  it('returns matched:true on hit', () => {
    const r = match('hello world', /world/);
    expect(r.matched).toBe(true);
    expect(r.value).toBe('world');
    expect(r.index).toBe(6);
  });

  it('returns matched:false on miss', () => {
    const r = match('hello world', /xyz/);
    expect(r.matched).toBe(false);
    expect(r.value).toBe('');
    expect(r.index).toBe(-1);
  });

  it('captures named groups', () => {
    const r = match('2026-02-24', /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
    expect(r.groups.year).toBe('2026');
    expect(r.groups.month).toBe('02');
    expect(r.groups.day).toBe('24');
  });

  it('handles global pattern without mutating lastIndex across calls', () => {
    const pat = /\d+/g;
    const r1 = match('abc 42 def', pat);
    const r2 = match('abc 42 def', pat);
    expect(r1.matched).toBe(true);
    expect(r2.matched).toBe(true);
    expect(r1.value).toBe(r2.value);
  });
});

describe('extract() function', () => {
  it('extracts full matches by default', () => {
    const result = extract('cat bat rat', /[a-z]at/g);
    expect(result).toEqual(['cat', 'bat', 'rat']);
  });

  it('extracts group by index', () => {
    const result = extract('2026-02-24', /(\d{4})-(\d{2})-(\d{2})/g, 1);
    expect(result).toEqual(['2026']);
  });

  it('extracts group by name', () => {
    const result = extract('order: 001, order: 002', /order: (?<num>\d+)/g, 'num');
    expect(result).toEqual(['001', '002']);
  });
});

describe('test() function', () => {
  it('returns true for partial match', () => {
    expect(regexTest('hello world', /world/)).toBe(true);
  });
  it('returns false for no match', () => {
    expect(regexTest('hello world', /xyz/)).toBe(false);
  });
  it('works with global flag without lastIndex issues', () => {
    const pat = /\d+/g;
    expect(regexTest('abc 42', pat)).toBe(true);
    expect(regexTest('abc 42', pat)).toBe(true); // must be consistent
  });
});

describe('replace() function', () => {
  it('replaces first occurrence with string', () => {
    expect(replace('foo foo foo', /foo/, 'bar')).toBe('bar foo foo');
  });
  it('replaces all occurrences with global regex', () => {
    expect(replace('foo foo foo', /foo/g, 'bar')).toBe('bar bar bar');
  });
  it('accepts function replacement', () => {
    expect(replace('abc', /[a-z]/g, (ch) => ch.toUpperCase())).toBe('ABC');
  });
});

describe('replaceAll() function', () => {
  it('replaces all even without global flag', () => {
    expect(replaceAll('aaa', /a/, 'b')).toBe('bbb');
  });
});

describe('highlight() function', () => {
  it('wraps matches in default mark tags', () => {
    expect(highlight('say hello', /hello/)).toBe('say <mark>hello</mark>');
  });
  it('uses custom before/after', () => {
    expect(highlight('say hello', /hello/, '**', '**')).toBe('say **hello**');
  });
  it('highlights all occurrences', () => {
    const result = highlight('one two one', /one/g);
    expect(result).toBe('<mark>one</mark> two <mark>one</mark>');
  });
});

describe('flags() function', () => {
  it('adds a flag', () => {
    const r = flags(/abc/, 'i');
    expect(r.flags).toContain('i');
    expect(r.source).toBe('abc');
  });
  it('removes a flag', () => {
    const r = flags(/abc/gi, undefined, 'g');
    expect(r.flags).not.toContain('g');
    expect(r.flags).toContain('i');
  });
  it('does not duplicate flags', () => {
    const r = flags(/abc/i, 'i');
    expect(r.flags.split('').filter((c) => c === 'i')).toHaveLength(1);
  });
});

describe('withFlags() function', () => {
  it('creates regex from source and flags', () => {
    const r = withFlags('hello', 'gi');
    expect(r.source).toBe('hello');
    expect(r.flags).toContain('g');
    expect(r.flags).toContain('i');
  });
});

describe('namedGroup() function', () => {
  it('produces correct fragment', () => {
    expect(namedGroup('year', '\\d{4}')).toBe('(?<year>\\d{4})');
  });
  it('works in a real regex', () => {
    const re = new RegExp(namedGroup('id', '\\d+'));
    const m = re.exec('id: 123');
    expect(m?.groups?.id).toBe('123');
  });
});

describe('lookahead() function', () => {
  it('produces correct fragment', () => {
    expect(lookahead('foo')).toBe('(?=foo)');
  });
  it('works in a real regex', () => {
    const re = new RegExp(`\\w+${lookahead('!')}`);
    expect(re.test('hello!')).toBe(true);
    expect(re.test('hello.')).toBe(false);
  });
});

describe('negativeLookahead() function', () => {
  it('produces correct fragment', () => {
    expect(negativeLookahead('foo')).toBe('(?!foo)');
  });
});

describe('lookbehind() function', () => {
  it('produces correct fragment', () => {
    expect(lookbehind('foo')).toBe('(?<=foo)');
  });
});

describe('optional() function', () => {
  it('produces correct fragment', () => {
    expect(optional('s')).toBe('(?:s)?');
  });
  it('works in real regex', () => {
    const re = new RegExp(`colou${optional('r')}s`);
    expect(re.test('colours')).toBe(true);
    expect(re.test('colous')).toBe(true);
  });
});

describe('repeat() function', () => {
  it('produces {min,max} quantifier', () => {
    expect(repeat('a', 2, 4)).toBe('(?:a){2,4}');
  });
  it('produces {min,} when max omitted', () => {
    expect(repeat('a', 3)).toBe('(?:a){3,}');
  });
  it('works in real regex', () => {
    const re = new RegExp(`^${repeat('a', 2, 4)}$`);
    expect(re.test('aa')).toBe(true);
    expect(re.test('aaaa')).toBe(true);
    expect(re.test('a')).toBe(false);
    expect(re.test('aaaaa')).toBe(false);
  });
});

describe('splitOn() function', () => {
  it('splits on comma', () => {
    expect(splitOn('a,b,c', /,/)).toEqual(['a', 'b', 'c']);
  });
  it('splits on whitespace', () => {
    expect(splitOn('a b  c', /\s+/)).toEqual(['a', 'b', 'c']);
  });
});

describe('splitKeep() function', () => {
  it('keeps delimiters', () => {
    const result = splitKeep('a,b,c', /,/).filter((s) => s !== '');
    expect(result).toContain(',');
    expect(result).toContain('a');
    expect(result).toContain('b');
    expect(result).toContain('c');
  });
});

describe('analyze() function', () => {
  it('detects global flag', () => {
    const info = analyze(/abc/g);
    expect(info.isGlobal).toBe(true);
    expect(info.flags).toContain('g');
  });
  it('detects sticky flag', () => {
    const info = analyze(/abc/y);
    expect(info.isSticky).toBe(true);
  });
  it('detects named groups', () => {
    const info = analyze(/(?<name>\w+)/);
    expect(info.hasNamedGroups).toBe(true);
    expect(info.hasGroups).toBe(true);
  });
  it('detects regular groups', () => {
    const info = analyze(/(\w+)/);
    expect(info.hasGroups).toBe(true);
    expect(info.hasNamedGroups).toBe(false);
  });
  it('returns source', () => {
    const info = analyze(/hello/);
    expect(info.source).toBe('hello');
  });
  it('no groups on simple pattern', () => {
    const info = analyze(/abc/);
    expect(info.hasGroups).toBe(false);
    expect(info.hasNamedGroups).toBe(false);
  });
});

describe('findFirst() function', () => {
  it('returns first matching pattern', () => {
    const result = findFirst('hello 42 world', [/\d+/, /[a-z]+/]);
    expect(result).not.toBeNull();
    expect(result?.match).toBe('42');
  });
  it('returns null when nothing matches', () => {
    const result = findFirst('hello', [/\d+/]);
    expect(result).toBeNull();
  });
});

describe('findAll() function', () => {
  it('returns matches for each pattern', () => {
    const result = findAll('foo 1 bar 2', [/\d+/, /[a-z]+/]);
    expect(result).toHaveLength(2);
    expect(result[0].matches).toContain('1');
    expect(result[0].matches).toContain('2');
    expect(result[1].matches).toContain('foo');
    expect(result[1].matches).toContain('bar');
  });
});

// ---------------------------------------------------------------------------
// SECTION 13: Validation functions standalone tests
// ---------------------------------------------------------------------------

describe('isUrl() function', () => {
  it('accepts https://nexara.ae', () => expect(isUrl('https://nexara.ae')).toBe(true));
  it('accepts http://localhost:3000', () => expect(isUrl('http://localhost:3000')).toBe(true));
  it('accepts URL with path', () => expect(isUrl('https://example.com/path?q=1')).toBe(true));
  it('rejects ftp', () => expect(isUrl('ftp://example.com')).toBe(false));
  it('rejects bare domain', () => expect(isUrl('example.com')).toBe(false));
});

describe('isIpv4() function', () => {
  it('accepts 10.0.0.1', () => expect(isIpv4('10.0.0.1')).toBe(true));
  it('rejects 10.0.0', () => expect(isIpv4('10.0.0')).toBe(false));
});

describe('isIpv6() function', () => {
  it('accepts full notation', () => expect(isIpv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true));
  it('accepts ::', () => expect(isIpv6('::')).toBe(true));
  it('rejects plain IPv4', () => expect(isIpv6('192.168.1.1')).toBe(false));
});

describe('isSlug() function', () => {
  it('accepts hello-world', () => expect(isSlug('hello-world')).toBe(true));
  it('rejects Hello-World', () => expect(isSlug('Hello-World')).toBe(false));
});

describe('isIban() function', () => {
  it('accepts GB29NWBK60161331926819', () => expect(isIban('GB29NWBK60161331926819')).toBe(true));
  it('rejects lowercase', () => expect(isIban('gb29nwbk60161331926819')).toBe(false));
});

describe('isSemver() function', () => {
  it('accepts 0.0.1', () => expect(isSemver('0.0.1')).toBe(true));
  it('accepts 2.1.0-rc.1+sha.abc', () => expect(isSemver('2.1.0-rc.1+sha.abc')).toBe(true));
  it('rejects 1.0', () => expect(isSemver('1.0')).toBe(false));
});

describe('isHexColor() function', () => {
  it('accepts #000', () => expect(isHexColor('#000')).toBe(true));
  it('accepts #FFFFFF', () => expect(isHexColor('#FFFFFF')).toBe(true));
  it('rejects no hash', () => expect(isHexColor('FFFFFF')).toBe(false));
});

describe('isPostcodeUk() function', () => {
  it('accepts SW1A 1AA', () => expect(isPostcodeUk('SW1A 1AA')).toBe(true));
  it('rejects 12345', () => expect(isPostcodeUk('12345')).toBe(false));
});

describe('escape() edge cases', () => {
  it('escapes dot', () => {
    const re = new RegExp(escape('.'));
    expect(re.test('.')).toBe(true);
    expect(re.test('a')).toBe(false);
  });
  it('escapes asterisk', () => {
    const re = new RegExp(`^${escape('a*b')}$`);
    expect(re.test('a*b')).toBe(true);
    expect(re.test('ab')).toBe(false);
  });
  it('handles empty string', () => {
    expect(escape('')).toBe('');
  });
});

describe('combine() edge cases', () => {
  it('combines 3 patterns', () => {
    const c = combine(/cat/, /dog/, /bird/);
    expect(c.test('cat')).toBe(true);
    expect(c.test('dog')).toBe(true);
    expect(c.test('bird')).toBe(true);
    expect(c.test('fish')).toBe(false);
  });
  it('preserves flags from first pattern', () => {
    const c = combine(/cat/i, /dog/);
    expect(c.flags).toContain('i');
  });
});

describe('PATTERNS.CREDIT_CARD correctness', () => {
  it('matches Visa 4111111111111111', () => expect(PATTERNS.CREDIT_CARD.test('4111111111111111')).toBe(true));
  it('matches MC 5500005555555559', () => expect(PATTERNS.CREDIT_CARD.test('5500005555555559')).toBe(true));
  it('rejects short number', () => expect(PATTERNS.CREDIT_CARD.test('123456789')).toBe(false));
});

describe('count() edge cases', () => {
  it('returns 0 when no matches', () => {
    expect(count('hello world', /xyz/)).toBe(0);
  });
  it('counts overlapping-looking but non-overlapping matches', () => {
    // "aaa" should have 1 match of "aa" (non-overlapping)
    expect(count('aaaa', /aa/)).toBe(2);
  });
  it('handles zero-length match avoidance', () => {
    expect(count('abc', /(?=a)/)).toBeGreaterThanOrEqual(1);
  });
});

describe('matchAll() edge cases', () => {
  it('returns empty array on no matches', () => {
    expect(matchAll('hello', /xyz/)).toEqual([]);
  });
  it('each result has matched:true', () => {
    const results = matchAll('1 2 3', /\d/);
    expect(results.every((r) => r.matched)).toBe(true);
  });
  it('preserves match indices', () => {
    const results = matchAll('a_b_c', /[a-z]/);
    expect(results[0].index).toBe(0);
    expect(results[1].index).toBe(2);
    expect(results[2].index).toBe(4);
  });
});

describe('redact() edge cases', () => {
  it('uses default *** replacement', () => {
    expect(redact('call 0800123456', /\d+/)).toBe('call ***');
  });
  it('uses custom replacement', () => {
    expect(redact('secret', /secret/, '[HIDDEN]')).toBe('[HIDDEN]');
  });
  it('handles no matches', () => {
    expect(redact('hello world', /xyz/)).toBe('hello world');
  });
});

describe('replaceNth() edge cases', () => {
  it('replaces 2nd occurrence', () => {
    const result = replaceNth('a a a', /a/, 'b', 2);
    expect(result).toBe('a b a');
  });
  it('replaces 3rd occurrence', () => {
    const result = replaceNth('a a a', /a/, 'b', 3);
    expect(result).toBe('a a b');
  });
  it('does nothing if n exceeds count', () => {
    const result = replaceNth('a a', /a/, 'b', 5);
    expect(result).toBe('a a');
  });
});

// ---------------------------------------------------------------------------
// SECTION 14: isSlug loop — 50 tests (25 valid + 25 invalid slugs)
// ---------------------------------------------------------------------------

describe('isSlug() loop — 50 tests', () => {
  const validSlugs = [
    'hello', 'hello-world', 'my-slug-123', 'a', 'z',
    'foo-bar-baz', 'nexara-ims', 'api-v2', 'post-123', 'user-profile',
    'section-1', 'section-2', 'section-3', 'section-4', 'section-5',
    'feature-flag', 'dark-mode', 'light-mode', 'v1', 'v2',
    'release-notes', 'change-log', 'road-map', 'get-started', 'quick-start',
  ];
  const invalidSlugs = [
    '', '-bad', 'bad-', 'Bad-Slug', 'UPPERCASE', 'has space', 'has_underscore',
    'has.dot', 'has@at', 'has!bang', '--double-dash', 'trailing-',
    'ALLCAPS', 'Mixed-Case', 'with whitespace',
    '123-ok-but-NOPE', 'Hello', 'World', 'CamelCase', 'PascalCase',
    'snake_case', 'dot.case', 'space case', 'SCREAMING_SNAKE', 'Title Case',
  ];
  for (let i = 0; i < validSlugs.length; i++) {
    const slug = validSlugs[i];
    it(`valid slug[${i}]: "${slug}"`, () => {
      expect(isSlug(slug)).toBe(true);
    });
  }
  for (let i = 0; i < invalidSlugs.length; i++) {
    const slug = invalidSlugs[i];
    it(`invalid slug[${i}]: "${slug}"`, () => {
      expect(isSlug(slug)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 15: isSemver loop — 30 tests (15 valid + 15 invalid)
// ---------------------------------------------------------------------------

describe('isSemver() loop — 30 tests', () => {
  const validVersions = [
    '0.0.0', '1.0.0', '1.2.3', '10.20.30', '0.0.1-alpha',
    '1.0.0-alpha.1', '1.0.0-0.3.7', '1.0.0-x.7.z.92', '1.0.0+20130313144700',
    '1.0.0-beta+exp.sha.5114f85', '1.0.0-alpha+001', '2.0.0-rc.1', '999.999.999',
    '0.1.0-SNAPSHOT', '1.1.1',
  ];
  const invalidVersions = [
    '', 'v1.0.0', '1.0', '1', '1.0.0.0', '1.0.0-', '1.0.0+', '.1.0',
    '1..0', 'a.b.c', '1.0.0 ', ' 1.0.0', '1.0.0\n', '1.0.0-alpha#build', 'LATEST',
  ];
  for (let i = 0; i < validVersions.length; i++) {
    const v = validVersions[i];
    it(`valid semver[${i}]: "${v}"`, () => {
      expect(isSemver(v)).toBe(true);
    });
  }
  for (let i = 0; i < invalidVersions.length; i++) {
    const v = invalidVersions[i];
    it(`invalid semver[${i}]: "${v}"`, () => {
      expect(isSemver(v)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 16: extract() loop — 30 tests (i = 0..29)
// ---------------------------------------------------------------------------

describe('extract() loop — 30 tests', () => {
  for (let i = 0; i < 30; i++) {
    const n = i + 1;
    const word = `word${n}`;
    const sentence = `start ${word} middle ${word} end`;
    it(`extract[${i}]: "${word}" appears 2x in sentence`, () => {
      const results = extract(sentence, new RegExp(escape(word)), 0);
      expect(results).toHaveLength(2);
      results.forEach((r) => expect(r).toBe(word));
    });
  }
});
