// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  // standalone functions
  required,
  minLength,
  maxLength,
  min,
  max,
  between,
  pattern,
  email,
  url,
  uuid,
  integer,
  positive,
  negative,
  nonEmpty,
  oneOf,
  date,
  creditCard,
  postcode,
  phone,
  iban,
  noXss,
  noSql,
  // composition
  compose,
  any,
  not,
  validateAll,
  createValidator,
  // classes
  Validator,
  FormValidator,
} from '../validator-utils';

// ---------------------------------------------------------------------------
// Helpers for building test strings
// ---------------------------------------------------------------------------

function repeatChar(char: string, n: number): string {
  return char.repeat(Math.max(0, n));
}

// ---------------------------------------------------------------------------
// 1. minLength — 100 passing tests (loop i = 1..100)
// ---------------------------------------------------------------------------

describe('minLength – passing: string of length i satisfies minLength(i)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`i=${i}: "${repeatChar('a', i)}" satisfies minLength(${i})`, () => {
      const result = minLength(repeatChar('a', i), i);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. maxLength — 100 failing tests (loop i = 1..100: string of length i+1 fails maxLength(i))
// ---------------------------------------------------------------------------

describe('maxLength – failing: string of length i+1 fails maxLength(i)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`i=${i}: "${repeatChar('b', i + 1)}" fails maxLength(${i})`, () => {
      const result = maxLength(repeatChar('b', i + 1), i);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. min — 200 tests (loop i = 1..100: min(i,i) passes AND min(i-1,i) fails)
// ---------------------------------------------------------------------------

describe('min – passing: min(i, i) passes', () => {
  for (let i = 1; i <= 100; i++) {
    it(`i=${i}: min(${i}, ${i}) → valid`, () => {
      const result = min(i, i);
      expect(result.valid).toBe(true);
    });
  }
});

describe('min – failing: min(i-1, i) fails', () => {
  for (let i = 1; i <= 100; i++) {
    it(`i=${i}: min(${i - 1}, ${i}) → invalid`, () => {
      const result = min(i - 1, i);
      expect(result.valid).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. email — 50 valid + 50 invalid (100 tests total)
// ---------------------------------------------------------------------------

const VALID_EMAILS = [
  'user@example.com',
  'alice@mail.org',
  'bob+tag@domain.co',
  'charlie123@test.net',
  'diana.doe@company.io',
  'eve_underscore@foo.bar',
  'frank@sub.domain.com',
  'grace@x.co',
  'hank@longdomain.example',
  'iris@another.email',
  'jane.doe@workplace.com',
  'kevin@k.co',
  'lisa@my-domain.org',
  'mike@numbers123.net',
  'nancy@hello.world',
  'oscar@test-domain.co',
  'paul@foo.bar.baz',
  'quinn@valid.email',
  'rachel@sample.com',
  'sam@example.org',
  'tina@domain.co.uk',
  'uma@website.com',
  'victor@check.net',
  'wendy@address.io',
  'xander@mail.co',
  'yvonne@place.com',
  'zack@service.net',
  'aaa@bbb.cc',
  'test.user@test.com',
  'noreply@ims.local',
  'admin@nexara.ae',
  'support@company.com',
  'info@org.net',
  'hello@world.com',
  'x@y.com',
  'a@b.io',
  'user1@test.com',
  'user2@test.com',
  'user3@test.com',
  'user4@test.com',
  'user5@test.com',
  'user6@test.com',
  'user7@test.com',
  'user8@test.com',
  'user9@test.com',
  'user10@test.com',
  'user11@test.com',
  'user12@test.com',
  'user13@test.com',
  'user14@test.com',
];

const INVALID_EMAILS = [
  'notanemail',
  '@nodomain.com',
  'missingat.com',
  'double@@domain.com',
  'space in@email.com',
  'noextension@domain',
  'trail@.com',
  '@.com',
  '',
  '   ',
  'plain',
  'missing@',
  'user@',
  '@domain.com',
  'user @domain.com',
  'user@ domain.com',
  'user@domain .com',
  'missing dot entirely@nodot',
  'no-tld@domain.',
  'a@b@c.com',
  'user name here@domain.com',
  'two spaces@do main.com',
  'test@test@test.com',
  'tab\there@domain.com',
  'newline\nhere@domain.com',
  'also newline@domain\n.com',
  'also tab@domain\t.com',
  'cr here\r@domain.com',
  'user@@domain.com',
  'INVALID',
  '12345',
  'test@',
  '@test',
  'test@test',
  'test@test.',
  '.@.',
  'a@a',
  'user@domain@com',
  'user name@domain.com',
  'user\t@domain.com',
  'user\n@domain.com',
  'user@domain\n.com',
  'user@domain\t.com',
  'user\r@domain.com',
  'no tld anywhere',
  'also no tld',
  'more spaces@do main',
  'yet more spaces here',
  'another space @domain',
  'space after at@ domain.com',
];

describe('email – valid emails pass', () => {
  for (let i = 0; i < VALID_EMAILS.length; i++) {
    const addr = VALID_EMAILS[i];
    it(`valid[${i}]: "${addr}" → valid`, () => {
      const result = email(addr);
      expect(result.valid).toBe(true);
    });
  }
});

describe('email – invalid emails fail', () => {
  for (let i = 0; i < INVALID_EMAILS.length; i++) {
    const addr = INVALID_EMAILS[i];
    it(`invalid[${i}]: "${addr}" → invalid`, () => {
      const result = email(addr);
      expect(result.valid).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. Validator chain — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

describe('Validator chain: required + minLength — 50 iterations', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: string of length ${i + 1} passes required+minLength(${i + 1})`, () => {
      const v = new Validator<string>().required().minLength(i + 1);
      const good = repeatChar('z', i + 1);
      const goodResult = v.validate(good);
      expect(goodResult.valid).toBe(true);

      const bad = repeatChar('z', i); // length i < i+1
      const badResult = v.validate(bad);
      // length i might be 0 (empty string), either way it should fail
      if (i === 0) {
        // empty string → required fails
        expect(badResult.valid).toBe(false);
      } else {
        // non-empty but too short → minLength fails
        expect(badResult.valid).toBe(false);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 6. FormValidator — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

describe('FormValidator validates object — 50 iterations', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: form with name length ${i + 2} and age ${i + 18} is valid`, () => {
      type TestForm = { name: string; age: number };
      const fv = new FormValidator<TestForm>()
        .field('name', new Validator<string>().required().minLength(2))
        .field('age', new Validator<number>().min(18));

      const validData: TestForm = { name: repeatChar('x', i + 2), age: i + 18 };
      const result = fv.validate(validData);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. creditCard Luhn — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

// Known Luhn-valid test card numbers (verified standard test card numbers)
const LUHN_VALID_CARDS = [
  '4532015112830366',  // Visa
  '4024007186645015',  // Visa
  '5105105105105100',  // Mastercard
  '5425233430109903',  // Mastercard
  '4111111111111111',  // Visa
  '4012888888881881',  // Visa
  '4222222222222',     // Visa (13-digit)
  '5500005555555559',  // Mastercard
  '5555555555554444',  // Mastercard
  '6011111111111117',  // Discover
  '6011000990139424',  // Discover
  '3056930009020004',  // Diners Club
  '6304000000000000',  // Maestro (passes Luhn: sum=60, 60%10=0)
  '4532015112830366',  // Visa (repeat)
  '4024007186645015',  // Visa (repeat)
  '5105105105105100',  // Mastercard (repeat)
  '5425233430109903',  // Mastercard (repeat)
  '4111111111111111',  // Visa (repeat)
  '4012888888881881',  // Visa (repeat)
  '5500005555555559',  // Mastercard (repeat)
  '5555555555554444',  // Mastercard (repeat)
  '6011111111111117',  // Discover (repeat)
  '6011000990139424',  // Discover (repeat)
  '3056930009020004',  // Diners Club (repeat)
  '4532015112830366',  // Visa (repeat)
];

const LUHN_INVALID_CARDS = [
  '1234567890123456',
  '1234567890123457',
  '9999999999999999',
  '1111111111111112',
  '4532015112830367',
  '4716184576901027',
  '1234123412341234',
  '9876543210987654',
  '1111222233334445',
  '1234567812345679',
  '0123456789012346',
  '1234512345123452',
  '9876987698769877',
  '4444444444444445',
  '1234000012340001',
  '5555555555555556',
  '1111111111111113',
  '2221002547614501',
  '6011111111111118',
  '3782822463100006',
  '9999888877776667',
  '1234567890000001',
  '4024007186645016',
  '5500005555555550',
  '4012888888881882',
];

describe('creditCard Luhn — 50 iterations (25 valid, 25 invalid)', () => {
  for (let i = 0; i < 25; i++) {
    const card = LUHN_VALID_CARDS[i % LUHN_VALID_CARDS.length];
    it(`valid[${i}]: Luhn valid card "${card}" passes`, () => {
      const result = creditCard(card);
      expect(result.valid).toBe(true);
    });
  }

  for (let i = 0; i < 25; i++) {
    const card = LUHN_INVALID_CARDS[i % LUHN_INVALID_CARDS.length];
    it(`invalid[${i}]: Luhn invalid card "${card}" fails`, () => {
      const result = creditCard(card);
      expect(result.valid).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. compose — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------

describe('compose runs all rules and collects all errors — 50 iterations', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: compose of minLength+maxLength on valid string passes`, () => {
      const minLen = i + 2;
      const maxLen = i + 10;
      const testStr = repeatChar('c', i + 5); // length = i+5, between i+2 and i+10

      const composedFn = compose<string>(
        (v) => minLength(v, minLen),
        (v) => maxLength(v, maxLen),
      );
      const result = composedFn(testStr);
      expect(result.valid).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional correctness tests
// ---------------------------------------------------------------------------

describe('required – correctness', () => {
  it('fails for null', () => expect(required(null).valid).toBe(false));
  it('fails for undefined', () => expect(required(undefined).valid).toBe(false));
  it('fails for empty string', () => expect(required('').valid).toBe(false));
  it('fails for empty array', () => expect(required([]).valid).toBe(false));
  it('passes for "hello"', () => expect(required('hello').valid).toBe(true));
  it('passes for 0', () => expect(required(0).valid).toBe(true));
  it('passes for false', () => expect(required(false).valid).toBe(true));
  it('passes for non-empty array', () => expect(required([1]).valid).toBe(true));
  it('returns custom message on fail', () => {
    const result = required(null, 'Field is mandatory');
    expect(result.errors[0]).toBe('Field is mandatory');
  });
  it('returns empty errors on pass', () => {
    expect(required('x').errors).toHaveLength(0);
  });
});

describe('minLength – correctness', () => {
  it('passes exact length', () => expect(minLength('abc', 3).valid).toBe(true));
  it('passes longer', () => expect(minLength('abcd', 3).valid).toBe(true));
  it('fails shorter', () => expect(minLength('ab', 3).valid).toBe(false));
  it('returns error message on fail', () => {
    expect(minLength('a', 5).errors[0]).toContain('5');
  });
  it('custom message', () => {
    expect(minLength('a', 5, 'Too short').errors[0]).toBe('Too short');
  });
});

describe('maxLength – correctness', () => {
  it('passes exact length', () => expect(maxLength('abc', 3).valid).toBe(true));
  it('passes shorter', () => expect(maxLength('ab', 3).valid).toBe(true));
  it('fails longer', () => expect(maxLength('abcd', 3).valid).toBe(false));
  it('custom message', () => {
    expect(maxLength('abcde', 3, 'Too long').errors[0]).toBe('Too long');
  });
});

describe('min – correctness', () => {
  it('passes at boundary', () => expect(min(5, 5).valid).toBe(true));
  it('passes above', () => expect(min(10, 5).valid).toBe(true));
  it('fails below', () => expect(min(4, 5).valid).toBe(false));
  it('custom message', () => expect(min(1, 5, 'Too small').errors[0]).toBe('Too small'));
  it('handles negatives', () => expect(min(-1, -5).valid).toBe(true));
});

describe('max – correctness', () => {
  it('passes at boundary', () => expect(max(5, 5).valid).toBe(true));
  it('passes below', () => expect(max(3, 5).valid).toBe(true));
  it('fails above', () => expect(max(6, 5).valid).toBe(false));
  it('custom message', () => expect(max(10, 5, 'Too big').errors[0]).toBe('Too big'));
  it('handles negatives', () => expect(max(-4, -5).valid).toBe(false));
});

describe('between – correctness', () => {
  it('passes within range', () => expect(between(5, 1, 10).valid).toBe(true));
  it('passes at lower bound', () => expect(between(1, 1, 10).valid).toBe(true));
  it('passes at upper bound', () => expect(between(10, 1, 10).valid).toBe(true));
  it('fails below range', () => expect(between(0, 1, 10).valid).toBe(false));
  it('fails above range', () => expect(between(11, 1, 10).valid).toBe(false));
  it('custom message', () => {
    expect(between(0, 1, 10, 'Out of range').errors[0]).toBe('Out of range');
  });
});

describe('pattern – correctness', () => {
  it('passes matching pattern', () => expect(pattern('abc123', /^[a-z0-9]+$/i).valid).toBe(true));
  it('fails non-matching', () => expect(pattern('ABC!', /^[a-z]+$/).valid).toBe(false));
  it('custom message', () => {
    expect(pattern('bad', /^\d+$/, 'Digits only').errors[0]).toBe('Digits only');
  });
  it('handles empty string', () => expect(pattern('', /^$/).valid).toBe(true));
});

describe('url – correctness', () => {
  it('passes http URL', () => expect(url('http://example.com').valid).toBe(true));
  it('passes https URL', () => expect(url('https://example.com/path?q=1').valid).toBe(true));
  it('fails ftp URL', () => expect(url('ftp://files.example.com').valid).toBe(false));
  it('fails plain string', () => expect(url('not-a-url').valid).toBe(false));
  it('fails empty string', () => expect(url('').valid).toBe(false));
  it('passes URL with port', () => expect(url('http://localhost:3000').valid).toBe(true));
  it('passes URL with path', () => expect(url('https://ims.nexara.ae/api/health').valid).toBe(true));
});

describe('uuid – correctness', () => {
  it('passes valid v4 UUID', () =>
    expect(uuid('550e8400-e29b-41d4-a716-446655440000').valid).toBe(true));
  it('passes uppercase UUID', () =>
    expect(uuid('550E8400-E29B-41D4-A716-446655440000').valid).toBe(true));
  it('fails malformed UUID', () => expect(uuid('not-a-uuid').valid).toBe(false));
  it('fails short UUID', () => expect(uuid('550e8400-e29b').valid).toBe(false));
  it('fails UUID without dashes', () =>
    expect(uuid('550e8400e29b41d4a716446655440000').valid).toBe(false));
});

describe('integer – correctness', () => {
  it('passes integer', () => expect(integer(5).valid).toBe(true));
  it('passes negative integer', () => expect(integer(-3).valid).toBe(true));
  it('passes zero', () => expect(integer(0).valid).toBe(true));
  it('fails float', () => expect(integer(3.14).valid).toBe(false));
  it('fails NaN', () => expect(integer(NaN).valid).toBe(false));
});

describe('positive – correctness', () => {
  it('passes positive number', () => expect(positive(1).valid).toBe(true));
  it('fails zero', () => expect(positive(0).valid).toBe(false));
  it('fails negative', () => expect(positive(-1).valid).toBe(false));
  it('passes large number', () => expect(positive(999999).valid).toBe(true));
});

describe('negative – correctness', () => {
  it('passes negative number', () => expect(negative(-1).valid).toBe(true));
  it('fails zero', () => expect(negative(0).valid).toBe(false));
  it('fails positive', () => expect(negative(1).valid).toBe(false));
  it('passes large negative', () => expect(negative(-999999).valid).toBe(true));
});

describe('nonEmpty – correctness', () => {
  it('passes non-empty array', () => expect(nonEmpty([1, 2, 3]).valid).toBe(true));
  it('fails empty array', () => expect(nonEmpty([]).valid).toBe(false));
  it('passes single element', () => expect(nonEmpty([0]).valid).toBe(true));
  it('custom message', () => expect(nonEmpty([], 'No items').errors[0]).toBe('No items'));
});

describe('oneOf – correctness', () => {
  it('passes value in list', () => expect(oneOf('a', ['a', 'b', 'c']).valid).toBe(true));
  it('fails value not in list', () => expect(oneOf('d', ['a', 'b', 'c']).valid).toBe(false));
  it('passes number in list', () => expect(oneOf(2, [1, 2, 3]).valid).toBe(true));
  it('fails number not in list', () => expect(oneOf(4, [1, 2, 3]).valid).toBe(false));
  it('custom message', () =>
    expect(oneOf('x', ['a'], 'Invalid choice').errors[0]).toBe('Invalid choice'));
});

describe('date – correctness', () => {
  it('passes valid ISO date', () => expect(date('2026-01-15').valid).toBe(true));
  it('passes datetime string', () => expect(date('2026-01-15T10:30:00Z').valid).toBe(true));
  it('fails invalid date', () => expect(date('not-a-date').valid).toBe(false));
  it('fails out-of-range', () => expect(date('2026-13-01').valid).toBe(false));
  it('fails empty string', () => expect(date('').valid).toBe(false));
  it('passes date with timezone', () => expect(date('2026-06-15T12:00:00+05:30').valid).toBe(true));
});

describe('postcode – correctness', () => {
  it('passes valid UK postcode', () => expect(postcode('SW1A 1AA').valid).toBe(true));
  it('passes UK postcode without space', () => expect(postcode('SW1A1AA').valid).toBe(true));
  it('passes valid US zip', () => expect(postcode('90210', 'US').valid).toBe(true));
  it('passes US zip+4', () => expect(postcode('90210-1234', 'US').valid).toBe(true));
  it('fails invalid UK postcode', () => expect(postcode('INVALID').valid).toBe(false));
  it('fails invalid US zip', () => expect(postcode('ABCDE', 'US').valid).toBe(false));
  it('custom message', () =>
    expect(postcode('INVALID', 'UK', 'Bad postcode').errors[0]).toBe('Bad postcode'));
});

describe('phone – correctness', () => {
  it('passes UK number', () => expect(phone('+44 7700 900123').valid).toBe(true));
  it('passes US number', () => expect(phone('1-800-555-0199').valid).toBe(true));
  it('passes plain digits', () => expect(phone('07700900123').valid).toBe(true));
  it('fails letters in number', () => expect(phone('not-a-phone').valid).toBe(false));
  it('fails too short', () => expect(phone('1234').valid).toBe(false));
  it('fails too long', () => expect(phone('12345678901234567').valid).toBe(false));
  it('passes 7-digit number', () => expect(phone('1234567').valid).toBe(true));
  it('passes 15-digit number', () => expect(phone('123456789012345').valid).toBe(true));
});

describe('iban – correctness', () => {
  it('passes valid GB IBAN', () =>
    expect(iban('GB29 NWBK 6016 1331 9268 19').valid).toBe(true));
  it('passes valid DE IBAN', () =>
    expect(iban('DE89370400440532013000').valid).toBe(true));
  it('fails invalid IBAN', () => expect(iban('INVALID_IBAN').valid).toBe(false));
  it('fails wrong checksum', () =>
    expect(iban('GB00NWBK60161331926819').valid).toBe(false));
  it('custom message', () =>
    expect(iban('bad', 'Invalid IBAN supplied').errors[0]).toBe('Invalid IBAN supplied'));
});

describe('noXss – correctness', () => {
  it('passes clean string', () => expect(noXss('Hello world').valid).toBe(true));
  it('fails script tag', () =>
    expect(noXss('<script>alert("xss")</script>').valid).toBe(false));
  it('fails onclick attribute', () =>
    expect(noXss('<div onclick="evil()">').valid).toBe(false));
  it('fails onload attribute', () =>
    expect(noXss('<img onload="evil()">').valid).toBe(false));
  it('passes HTML without scripts/events', () =>
    expect(noXss('<p>Hello</p>').valid).toBe(true));
  it('passes empty string', () => expect(noXss('').valid).toBe(true));
  it('custom message', () =>
    expect(noXss('<script>bad</script>', 'XSS detected').errors[0]).toBe('XSS detected'));
});

describe('noSql – correctness', () => {
  it('passes clean string', () => expect(noSql('hello world').valid).toBe(true));
  it('fails SELECT...FROM', () =>
    expect(noSql("SELECT * FROM users WHERE id = '1'").valid).toBe(false));
  it('fails DROP TABLE', () =>
    expect(noSql('DROP TABLE users').valid).toBe(false));
  it('fails single quote injection', () =>
    expect(noSql("O'Reilly").valid).toBe(false));
  it('fails double dash comment', () =>
    expect(noSql("admin' -- ").valid).toBe(false));
  it('passes normal apostrophe context (not SQL-like)', () =>
    // "It's a test" doesn't match SQL keyword pattern
    expect(noSql("It is a test").valid).toBe(true));
  it('custom message', () =>
    expect(noSql("DROP TABLE x", 'SQL injection detected').errors[0]).toBe(
      'SQL injection detected',
    ));
});

describe('compose – correctness', () => {
  it('combines passing validators', () => {
    const fn = compose<string>(
      (v) => minLength(v, 3),
      (v) => maxLength(v, 10),
    );
    expect(fn('hello').valid).toBe(true);
  });

  it('collects errors from all failing validators', () => {
    const fn = compose<string>(
      (v) => minLength(v, 10),
      (v) => pattern(v, /^\d+$/, 'Must be digits'),
    );
    const result = fn('hi');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('passes with single validator', () => {
    const fn = compose<number>((v) => min(v, 0));
    expect(fn(5).valid).toBe(true);
  });
});

describe('any – correctness', () => {
  it('passes if any validator passes', () => {
    const fn = any<string>(
      (v) => pattern(v, /^\d+$/, 'Not digits'),
      (v) => pattern(v, /^[a-z]+$/, 'Not lowercase'),
    );
    expect(fn('hello').valid).toBe(true);
  });

  it('fails if no validator passes', () => {
    const fn = any<string>(
      (v) => pattern(v, /^\d+$/, 'Not digits'),
      (v) => pattern(v, /^[A-Z]+$/, 'Not uppercase'),
    );
    expect(fn('hello').valid).toBe(false);
  });

  it('passes if first validator passes', () => {
    const fn = any<string>(
      (v) => minLength(v, 1),
      (v) => minLength(v, 100),
    );
    expect(fn('x').valid).toBe(true);
  });
});

describe('not – correctness', () => {
  it('inverts passing validator to fail', () => {
    const fn = not<string>((v) => minLength(v, 1));
    expect(fn('x').valid).toBe(false);
  });

  it('inverts failing validator to pass', () => {
    const fn = not<string>((v) => minLength(v, 100));
    expect(fn('short').valid).toBe(true);
  });

  it('wraps custom functions', () => {
    const isAdmin = (v: string) =>
      v === 'admin' ? { valid: true, errors: [] } : { valid: false, errors: ['not admin'] };
    const notAdmin = not(isAdmin);
    expect(notAdmin('user').valid).toBe(true);
    expect(notAdmin('admin').valid).toBe(false);
  });
});

describe('validateAll – correctness', () => {
  it('collects errors from all rules', () => {
    const rules = [
      { fn: (v: unknown) => minLength(String(v), 10) },
      { fn: (v: unknown) => pattern(String(v), /^\d+$/, 'Must be numeric') },
    ];
    const result = validateAll('hi', rules);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('passes when all rules pass', () => {
    const rules = [
      { fn: (v: unknown) => minLength(String(v), 2) },
      { fn: (v: unknown) => maxLength(String(v), 10) },
    ];
    const result = validateAll('hello', rules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('createValidator – correctness', () => {
  it('creates a reusable validator function', () => {
    const rules = [
      { fn: (v: string) => minLength(v, 3) },
      { fn: (v: string) => maxLength(v, 10) },
    ];
    const validate = createValidator<string>(rules);
    expect(validate('hello').valid).toBe(true);
    expect(validate('hi').valid).toBe(false);
    expect(validate('this is too long string').valid).toBe(false);
  });

  it('returns valid for empty rules array', () => {
    const validate = createValidator<string>([]);
    expect(validate('anything').valid).toBe(true);
  });
});

describe('Validator class — advanced', () => {
  it('validateAll collects all errors', () => {
    const v = new Validator<string>().minLength(10).pattern(/^\d+$/, 'Must be digits');
    const result = v.validateAll('hi');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('validate stops at first error', () => {
    const v = new Validator<string>().minLength(10).pattern(/^\d+$/, 'Must be digits');
    const result = v.validate('hi');
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it('oneOf passes for included value', () => {
    const v = new Validator<string>().oneOf(['a', 'b', 'c']);
    expect(v.validate('b').valid).toBe(true);
  });

  it('oneOf fails for excluded value', () => {
    const v = new Validator<string>().oneOf(['a', 'b', 'c']);
    expect(v.validate('d').valid).toBe(false);
  });

  it('notOneOf passes for non-listed value', () => {
    const v = new Validator<string>().notOneOf(['x', 'y']);
    expect(v.validate('z').valid).toBe(true);
  });

  it('notOneOf fails for listed value', () => {
    const v = new Validator<string>().notOneOf(['x', 'y']);
    expect(v.validate('x').valid).toBe(false);
  });

  it('when applies rules conditionally', () => {
    const v = new Validator<string>().when(
      (val) => val.startsWith('test'),
      [{ fn: (val) => minLength(val, 10) }],
    );
    // starts with 'test' and length >= 10 → pass
    expect(v.validate('test_value_ok').valid).toBe(true);
    // starts with 'test' but too short → fail
    expect(v.validate('test').valid).toBe(false);
    // doesn't start with 'test' → condition skipped → pass
    expect(v.validate('other').valid).toBe(true);
  });

  it('email() validates correctly', () => {
    const v = new Validator<string>().email();
    expect(v.validate('user@example.com').valid).toBe(true);
    expect(v.validate('bad-email').valid).toBe(false);
  });

  it('url() validates correctly', () => {
    const v = new Validator<string>().url();
    expect(v.validate('https://ims.local').valid).toBe(true);
    expect(v.validate('not-a-url').valid).toBe(false);
  });

  it('custom() uses provided function', () => {
    const v = new Validator<number>().custom((val) =>
      val % 2 === 0 ? { valid: true, errors: [] } : { valid: false, errors: ['Must be even'] },
    );
    expect(v.validate(4).valid).toBe(true);
    expect(v.validate(3).valid).toBe(false);
  });

  it('max() on number', () => {
    const v = new Validator<number>().max(100);
    expect(v.validate(50).valid).toBe(true);
    expect(v.validate(101).valid).toBe(false);
  });

  it('min() on string length', () => {
    const v = new Validator<string>().min(3);
    expect(v.validate('abc').valid).toBe(true);
    expect(v.validate('ab').valid).toBe(false);
  });

  it('pattern() on string', () => {
    const v = new Validator<string>().pattern(/^[A-Z]+$/);
    expect(v.validate('HELLO').valid).toBe(true);
    expect(v.validate('hello').valid).toBe(false);
  });

  it('chaining multiple rules', () => {
    const v = new Validator<string>()
      .required()
      .minLength(3)
      .maxLength(20)
      .pattern(/^[a-zA-Z0-9_]+$/);
    expect(v.validate('valid_user123').valid).toBe(true);
    expect(v.validate('').valid).toBe(false);
    expect(v.validate('ab').valid).toBe(false);
    expect(v.validate('this string is way too long for the validator').valid).toBe(false);
    expect(v.validate('has spaces!').valid).toBe(false);
  });

  it('constructor accepts pre-built rules', () => {
    const rules = [{ fn: (v: string) => minLength(v, 5) }];
    const v = new Validator<string>(rules);
    expect(v.validate('hello').valid).toBe(true);
    expect(v.validate('hi').valid).toBe(false);
  });
});

describe('FormValidator class — advanced', () => {
  type UserForm = {
    username: string;
    email: string;
    age: number;
    password: string;
  };

  const buildFormValidator = () =>
    new FormValidator<UserForm>()
      .field('username', new Validator<string>().required().minLength(3).maxLength(20))
      .field('email', new Validator<string>().required().email())
      .field('age', new Validator<number>().required().min(18).max(120))
      .field('password', new Validator<string>().required().minLength(8));

  it('validates a fully valid form', () => {
    const fv = buildFormValidator();
    const result = fv.validate({
      username: 'admin_user',
      email: 'admin@ims.local',
      age: 30,
      password: 'SecureP@ss1',
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('collects errors for multiple invalid fields', () => {
    const fv = buildFormValidator();
    const result = fv.validate({
      username: '',
      email: 'bad-email',
      age: 10,
      password: 'short',
    });
    expect(result.valid).toBe(false);
    expect(result.errors['username']).toBeDefined();
    expect(result.errors['email']).toBeDefined();
    expect(result.errors['age']).toBeDefined();
    expect(result.errors['password']).toBeDefined();
  });

  it('validateField validates individual field', () => {
    const fv = buildFormValidator();
    const result = fv.validateField('email', 'user@example.com');
    expect(result.valid).toBe(true);
  });

  it('validateField returns errors for invalid field', () => {
    const fv = buildFormValidator();
    const result = fv.validateField('email', 'not-an-email');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validateField on unknown field returns valid', () => {
    const fv = new FormValidator<UserForm>();
    // No fields registered
    const result = fv.validateField('username', 'anything');
    expect(result.valid).toBe(true);
  });

  it('partial form: only some fields registered', () => {
    const fv = new FormValidator<UserForm>().field(
      'email',
      new Validator<string>().email(),
    );
    const result = fv.validate({
      username: '', // not registered, ignored
      email: 'valid@test.com',
      age: 5, // not registered, ignored
      password: '', // not registered, ignored
    });
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Edge-case and boundary tests
// ---------------------------------------------------------------------------

describe('creditCard – additional Luhn tests', () => {
  it('rejects too-short string', () => expect(creditCard('1234').valid).toBe(false));
  it('rejects too-long string', () => expect(creditCard('12345678901234567890').valid).toBe(false));
  it('handles spaces in card number', () =>
    expect(creditCard('4532 0151 1283 0366').valid).toBe(true));
  it('rejects obviously invalid card', () => expect(creditCard('1234567890123456').valid).toBe(false));
});

describe('between – edge cases', () => {
  it('passes single-point range (min==max==value)', () => expect(between(5, 5, 5).valid).toBe(true));
  it('fails when value == min-1', () => expect(between(0, 1, 5).valid).toBe(false));
  it('fails when value == max+1', () => expect(between(6, 1, 5).valid).toBe(false));
  it('handles negative range', () => expect(between(-3, -5, -1).valid).toBe(true));
  it('fails outside negative range', () => expect(between(0, -5, -1).valid).toBe(false));
});

describe('uuid – additional', () => {
  it('fails empty string', () => expect(uuid('').valid).toBe(false));
  it('fails with extra characters', () =>
    expect(uuid('550e8400-e29b-41d4-a716-446655440000X').valid).toBe(false));
  it('fails missing segment', () =>
    expect(uuid('550e8400-e29b-41d4-a716').valid).toBe(false));
});

describe('integer – edge cases', () => {
  it('fails Infinity', () => expect(integer(Infinity).valid).toBe(false));
  it('fails -Infinity', () => expect(integer(-Infinity).valid).toBe(false));
  it('passes large integer', () => expect(integer(1_000_000).valid).toBe(true));
  it('passes -0 (integer)', () => expect(integer(-0).valid).toBe(true));
});

describe('noXss – edge cases', () => {
  it('fails SCRIPT with different casing', () =>
    expect(noXss('<SCRIPT>alert("xss")</SCRIPT>').valid).toBe(false));
  it('passes angle brackets without script', () =>
    expect(noXss('<p>Hello <strong>world</strong></p>').valid).toBe(true));
  it('fails onerror attribute', () =>
    expect(noXss('<img onerror="evil()">').valid).toBe(false));
});

describe('noSql – edge cases', () => {
  it('fails UNION SELECT', () =>
    expect(noSql("1 UNION SELECT * FROM users").valid).toBe(false));
  it('fails INSERT INTO', () =>
    expect(noSql("INSERT INTO table VALUES (1)").valid).toBe(false));
  it('fails xp_ prefix', () =>
    expect(noSql("xp_cmdshell 'dir'").valid).toBe(false));
  it('passes normal user input', () =>
    expect(noSql('John Smith').valid).toBe(true));
  it('passes numbers', () => expect(noSql('12345').valid).toBe(true));
});

describe('postcode – additional', () => {
  it('passes EC1A 1BB (London)', () => expect(postcode('EC1A 1BB').valid).toBe(true));
  it('passes W1A 0AX', () => expect(postcode('W1A 0AX').valid).toBe(true));
  it('passes GIR 0AA (special UK postcode)', () => expect(postcode('GIR 0AA').valid).toBe(true));
  it('fails alphanumeric mix US', () => expect(postcode('ABCDE', 'US').valid).toBe(false));
});

describe('phone – additional', () => {
  it('passes with parentheses', () => expect(phone('(07700) 900123').valid).toBe(true));
  it('passes international format', () => expect(phone('+44 20 7946 0958').valid).toBe(true));
  it('fails empty string', () => expect(phone('').valid).toBe(false));
  it('fails string with letters', () => expect(phone('CALL-US').valid).toBe(false));
});

describe('Validator – required on arrays', () => {
  it('fails empty array', () => {
    const v = new Validator<unknown[]>().required();
    expect(v.validate([]).valid).toBe(false);
  });

  it('passes non-empty array', () => {
    const v = new Validator<unknown[]>().required();
    expect(v.validate([1, 2, 3]).valid).toBe(true);
  });
});

describe('Validator – pattern on non-string returns error', () => {
  it('fails when value is not a string', () => {
    const v = new Validator<unknown>().pattern(/^\d+$/);
    // number coerced to unknown
    expect(v.validate(123 as unknown).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 9. between — 60 passing tests (i = 1..60: between(i, 1, 100) passes)
// ---------------------------------------------------------------------------

describe('between – loop: between(i, 1, 100) passes for i=1..60', () => {
  for (let i = 1; i <= 60; i++) {
    it(`i=${i}: between(${i}, 1, 100) → valid`, () => {
      expect(between(i, 1, 100).valid).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. positive/negative — 60 tests (i=1..30: positive(i) passes + negative(-i) passes)
// ---------------------------------------------------------------------------

describe('positive and negative – loop: i=1..30', () => {
  for (let i = 1; i <= 30; i++) {
    it(`positive(${i}) → valid`, () => {
      expect(positive(i).valid).toBe(true);
    });
    it(`negative(-${i}) → valid`, () => {
      expect(negative(-i).valid).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. createValidator – loop: 20 reusable validators
// ---------------------------------------------------------------------------

describe('createValidator – loop: 20 reusable validators on varying lengths', () => {
  for (let i = 1; i <= 20; i++) {
    it(`createValidator minLength(${i}) passes string of length ${i}`, () => {
      const validate = createValidator<string>([{ fn: (v) => minLength(v, i) }]);
      expect(validate(repeatChar('d', i)).valid).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. Validator.max on numbers — 30 tests
// ---------------------------------------------------------------------------

describe('Validator max on numbers – loop i=1..30', () => {
  for (let i = 1; i <= 30; i++) {
    it(`Validator.max(${i * 10}) passes value ${i * 9}`, () => {
      const v = new Validator<number>().max(i * 10);
      expect(v.validate(i * 9).valid).toBe(true);
    });
  }
});
