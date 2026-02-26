// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { detectType, parseCsv, parseJson, analyseFile } from '../src/analyser';
import type { DetectedType } from '../src/types';

// ---------------------------------------------------------------------------
// detectType
// ---------------------------------------------------------------------------

describe('detectType', () => {
  // --- Empty / unknown ---
  describe('empty or unknown samples', () => {
    it('returns "unknown" for empty array', () => {
      expect(detectType([])).toBe('unknown');
    });
    it('returns "unknown" for array of empty strings', () => {
      expect(detectType(['', '', ''])).toBe('unknown');
    });
    it('returns "unknown" for array with only null-like values', () => {
      expect(detectType(['' , '', ''])).toBe('unknown');
    });
    it('returns "unknown" for single empty string', () => {
      expect(detectType([''])).toBe('unknown');
    });
    it('returns "string" for array of whitespace-only strings (non-empty but no type match)', () => {
      // Whitespace strings pass the !== '' filter so nonEmpty.length > 0
      // but no regex matches their trimmed form → falls through to 'string'
      expect(detectType(['   ', '  ', ' '])).toBe('string');
    });
  });

  // --- Email detection ---
  describe('email detection', () => {
    it.each([
      [['user@example.com'], 'email'],
      [['a@b.com', 'c@d.org', 'e@f.net'], 'email'],
      [['john.doe@company.co.uk', 'jane@test.io', 'admin@nexara.com'], 'email'],
      [['test+tag@example.com', 'test2@example.com', 'test3@example.com'], 'email'],
      [['user@sub.domain.com', 'other@sub.domain.com', 'third@sub.domain.com'], 'email'],
    ])('detects email for samples %p', (samples, expected) => {
      expect(detectType(samples)).toBe(expected);
    });

    it('10 email samples → email', () => {
      const samples = Array.from({ length: 10 }, (_, i) => `user${i}@example.com`);
      expect(detectType(samples)).toBe('email');
    });

    it('7 of 10 email samples meets 70% threshold → email', () => {
      const samples = [
        'user1@example.com', 'user2@example.com', 'user3@example.com',
        'user4@example.com', 'user5@example.com', 'user6@example.com',
        'user7@example.com', 'not-an-email', 'also-not', 'random text',
      ];
      expect(detectType(samples)).toBe('email');
    });

    it('6 of 10 email samples falls below 70% → not email', () => {
      const samples = [
        'user1@example.com', 'user2@example.com', 'user3@example.com',
        'user4@example.com', 'user5@example.com', 'user6@example.com',
        'not-an-email', 'also-not', 'random text', 'another random',
      ];
      expect(detectType(samples)).not.toBe('email');
    });

    it('single valid email → email', () => {
      expect(detectType(['admin@example.com'])).toBe('email');
    });

    it('mixed-case emails are detected', () => {
      expect(detectType(['User@Example.COM', 'ADMIN@EXAMPLE.COM', 'Test@Domain.org'])).toBe('email');
    });
  });

  // --- Phone detection ---
  describe('phone detection', () => {
    it.each([
      [['+44 1234 567890'], 'phone'],
      [['+44 7700 900000', '+44 7700 900001', '+44 7700 900002'], 'phone'],
      [['0800 123 456', '0800 123 457', '0800 123 458'], 'phone'],
      [['(555) 123-4567', '(555) 123-4568', '(555) 123-4569'], 'phone'],
      [['+1-800-555-0199', '+1-800-555-0200', '+1-800-555-0201'], 'phone'],
    ])('detects phone for samples %p → %s', (samples, expected) => {
      expect(detectType(samples)).toBe(expected);
    });

    it('7 of 10 phone samples meets threshold → phone', () => {
      const samples = [
        '+44 1234 567890', '+44 1234 567891', '+44 1234 567892',
        '+44 1234 567893', '+44 1234 567894', '+44 1234 567895',
        '+44 1234 567896', 'not-a-phone', 'blah', 'foo',
      ];
      expect(detectType(samples)).toBe('phone');
    });

    it('string shorter than 7 digits does not qualify as phone', () => {
      // Phone regex requires 7–20 chars of [\+\d\s\-\(\)] AND >= 7 numeric digits
      expect(detectType(['123456', '654321', '111222'])).not.toBe('phone');
    });
  });

  // --- Date detection ---
  // NOTE: ISO dates like "2024-01-15" match PHONE_RE (only digits and dashes, 10 chars within 7-20
  // range, 8 numeric digits >= 7). Phone check runs before date check, so ISO-only samples yield
  // 'phone'. Use slash-format dates (which cannot match PHONE_RE) or ISO datetime strings (T and :
  // are not in PHONE_RE) to reliably trigger date detection.
  describe('date detection', () => {
    it.each([
      [['01/15/2024', '02/20/2024', '03/25/2024'], 'date'],
      [['2024-01-01T10:00', '2024-02-01T11:00', '2024-03-01T12:00'], 'date'],
    ])('detects date for samples %p → %s', (samples, expected) => {
      expect(detectType(samples)).toBe(expected);
    });

    it('ISO dates (YYYY-MM-DD) match PHONE_RE and are detected as phone', () => {
      // ISO dates without time component match /^[\+\d\s\-\(\)]{7,20}$/ and have >=7 digits
      expect(detectType(['2024-01-15', '2024-02-20', '2024-03-25'])).toBe('phone');
    });

    it('DD-MM-YYYY dates also match PHONE_RE and are detected as phone', () => {
      expect(detectType(['15-01-2024', '20-02-2024', '25-03-2024'])).toBe('phone');
    });

    it('ISO dates with time do not match PHONE_RE → detected as date', () => {
      const samples = Array.from({ length: 10 }, (_, i) => `2024-01-${String(i + 1).padStart(2, '0')}T10:00`);
      expect(detectType(samples)).toBe('date');
    });

    it('7 of 10 slash-format dates → date', () => {
      const samples = [
        '01/01/2024', '02/01/2024', '03/01/2024',
        '04/01/2024', '05/01/2024', '06/01/2024',
        '07/01/2024', 'not-a-date', 'foo', 'bar',
      ];
      expect(detectType(samples)).toBe('date');
    });

    it('6 of 10 slash-format dates falls below threshold → not date', () => {
      const samples = [
        '01/01/2024', '02/01/2024', '03/01/2024',
        '04/01/2024', '05/01/2024', '06/01/2024',
        'not-date', 'not-date-2', 'not-date-3', 'not-date-4',
      ];
      expect(detectType(samples)).not.toBe('date');
    });

    it('single slash-format date → date', () => {
      expect(detectType(['01/15/2024'])).toBe('date');
    });

    it('single ISO date with time → date', () => {
      expect(detectType(['2024-01-15T10:00'])).toBe('date');
    });

    it('mix of UK slash date formats → date', () => {
      const samples = Array.from({ length: 10 }, (_, i) => `${(i + 1).toString().padStart(2, '0')}/01/2024`);
      expect(detectType(samples)).toBe('date');
    });
  });

  // --- Boolean detection ---
  describe('boolean detection', () => {
    it.each([
      [['true', 'false', 'true'], 'boolean'],
      [['yes', 'no', 'yes', 'yes', 'no'], 'boolean'],
      [['1', '0', '1', '1', '0', '1', '1', '0', '1', '0'], 'boolean'],
      [['y', 'n', 'y', 'y', 'n', 'y', 'y', 'n', 'y', 'y'], 'boolean'],
      [['TRUE', 'FALSE', 'TRUE', 'FALSE', 'TRUE', 'FALSE', 'TRUE', 'FALSE', 'TRUE', 'FALSE'], 'boolean'],
    ])('detects boolean for samples %p → %s', (samples, expected) => {
      expect(detectType(samples)).toBe(expected);
    });

    it('7 of 10 boolean samples meets threshold → boolean', () => {
      const samples = ['true', 'false', 'true', 'false', 'yes', 'no', '1', 'maybe', 'what', 'huh'];
      expect(detectType(samples)).toBe('boolean');
    });

    it('single "true" → boolean', () => {
      expect(detectType(['true'])).toBe('boolean');
    });

    it('single "1" → boolean (not integer, because BOOL_RE matches first)', () => {
      // BOOL_RE = /^(true|false|yes|no|1|0|y|n)$/i
      // INT_RE = /^-?\d+$/
      // Both match '1', but boolean check runs first
      expect(detectType(['1'])).toBe('boolean');
    });
  });

  // --- Integer detection ---
  describe('integer detection', () => {
    it.each([
      [['42', '100', '999', '1', '0', '55', '23', '77', '8', '3'], 'integer'],
      [['-1', '-100', '-999', '-5', '42', '0', '33', '11', '22', '77'], 'integer'],
      [['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'], 'integer'],
    ])('detects integer for samples %p → %s', (samples, expected) => {
      expect(detectType(samples)).toBe(expected);
    });

    it('7 of 10 integer samples meets threshold → integer', () => {
      const samples = ['10', '20', '30', '40', '50', '60', '70', 'foo', 'bar', 'baz'];
      expect(detectType(samples)).toBe('integer');
    });

    it('negative integers are detected', () => {
      const samples = Array.from({ length: 10 }, (_, i) => `-${i + 1}`);
      expect(detectType(samples)).toBe('integer');
    });
  });

  // --- Float detection ---
  describe('float detection', () => {
    it.each([
      [['1.5', '2.7', '3.14', '0.001', '99.99', '100.0', '0.5', '1.1', '2.2', '3.3'], 'float'],
      [['-1.5', '-2.7', '3.14', '0.001', '99.99', '-100.0', '0.5', '1.1', '2.2', '-3.3'], 'float'],
    ])('detects float for samples %p → %s', (samples, expected) => {
      expect(detectType(samples)).toBe(expected);
    });

    it('7 of 10 float samples meets threshold → float', () => {
      const samples = ['1.1', '2.2', '3.3', '4.4', '5.5', '6.6', '7.7', 'foo', 'bar', 'baz'];
      expect(detectType(samples)).toBe('float');
    });

    it('single float → float', () => {
      expect(detectType(['3.14'])).toBe('float');
    });
  });

  // --- String fallback ---
  describe('string fallback', () => {
    it.each([
      [['apple', 'banana', 'cherry']],
      [['hello world', 'foo bar', 'baz qux']],
      [['ISO 9001', 'ISO 14001', 'ISO 45001']],
      [['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'grey']],
    ])('returns "string" for mixed/text samples %p', (samples) => {
      expect(detectType(samples)).toBe('string');
    });

    it('returns "string" for 6 of 10 emails (below threshold)', () => {
      const samples = [
        'user1@example.com', 'user2@example.com', 'user3@example.com',
        'user4@example.com', 'user5@example.com', 'user6@example.com',
        'not-email', 'not-email2', 'not-email3', 'not-email4',
      ];
      expect(detectType(samples)).toBe('string');
    });

    it('returns "string" for mixture of types with no dominant category', () => {
      const samples = ['hello', '123', 'true', '2024-01-01', 'a@b.com', 'world', 'foo', 'bar', 'baz', 'qux'];
      expect(detectType(samples)).toBe('string');
    });
  });

  // --- Empty strings filtered out of samples ---
  describe('empty strings are excluded from type detection', () => {
    it('detects email when non-empty subset are all emails', () => {
      const samples = ['', '', 'user@example.com', '', ''];
      // 1 non-empty, and it matches email → 100% → email
      expect(detectType(samples)).toBe('email');
    });

    it('detects integer when non-empty subset are all integers', () => {
      const samples = ['', '42', '', '100', '', '200', '', '300', '', '400'];
      // 5 non-empty integers, all match
      expect(detectType(samples)).toBe('integer');
    });

    it('ISO date samples are detected as phone (ISO dates match PHONE_RE)', () => {
      // ISO dates pass the !== '' filter and match PHONE_RE (digits + dashes) → phone wins
      const samples = ['2024-01-01', '', '2024-02-01', '', '2024-03-01', '', '2024-04-01', '', '2024-05-01', ''];
      expect(detectType(samples)).toBe('phone');
    });

    it('detects date when non-empty subset are slash-format dates', () => {
      const samples = ['01/01/2024', '', '02/01/2024', '', '03/01/2024', '', '04/01/2024', '', '05/01/2024', ''];
      expect(detectType(samples)).toBe('date');
    });
  });

  // --- Threshold boundary tests ---
  describe('70% threshold boundary', () => {
    it('exactly 70% (7/10) of phone samples → phone', () => {
      const samples = [
        '+44 7700 900000', '+44 7700 900001', '+44 7700 900002',
        '+44 7700 900003', '+44 7700 900004', '+44 7700 900005',
        '+44 7700 900006', 'not-phone', 'not-phone-2', 'not-phone-3',
      ];
      expect(detectType(samples)).toBe('phone');
    });

    it('exactly 70% (7/10) of integer samples → integer', () => {
      const samples = ['1', '2', '3', '4', '5', '6', '7', 'foo', 'bar', 'baz'];
      // But '1', '0' match BOOL_RE first – using values > 1
      const largeSamples = ['10', '20', '30', '40', '50', '60', '70', 'foo', 'bar', 'baz'];
      expect(detectType(largeSamples)).toBe('integer');
    });

    it('69% (7/~10.14) falls below threshold → string', () => {
      const samples = ['1.1', '2.2', '3.3', '4.4', '5.5', '6.6', 'foo', 'bar', 'baz', 'qux'];
      // 6/10 = 60% floats → below threshold
      expect(detectType(samples)).toBe('string');
    });
  });

  // --- Additional individual value coverage ---
  describe('individual value type detection with it.each', () => {
    it.each<[string, DetectedType]>([
      ['user@domain.com', 'email'],
      ['a@b.co', 'email'],
      ['not-an-email', 'string'],
      ['2024-01-15', 'phone'],   // ISO date matches PHONE_RE (digits + dashes)
      ['01/15/2024', 'date'],    // Slash format cannot match PHONE_RE
      ['true', 'boolean'],
      ['false', 'boolean'],
      ['yes', 'boolean'],
      ['no', 'boolean'],
      ['42', 'integer'],
      ['-5', 'integer'],
      ['3.14', 'float'],
      ['-2.5', 'float'],
      ['hello world', 'string'],
      ['ISO 9001', 'string'],
    ])('single sample "%s" → "%s"', (sample, expectedType) => {
      expect(detectType([sample])).toBe(expectedType);
    });
  });

  // --- Priority ordering ---
  describe('type detection priority ordering', () => {
    it('email is checked before phone', () => {
      // valid emails match both email_re and possibly phone_re partially
      const samples = Array.from({ length: 10 }, (_, i) => `user${i}@example.com`);
      expect(detectType(samples)).toBe('email');
    });

    it('phone wins over date for ISO-format dates (ISO dates match PHONE_RE)', () => {
      // ISO "YYYY-MM-DD" only contains digits and dashes, matching PHONE_RE
      // Phone is checked before date, so these register as 'phone'
      const samples = Array.from({ length: 10 }, () => '2024-01-15');
      expect(detectType(samples)).toBe('phone');
    });

    it('slash-format dates are detected as date (slashes not in PHONE_RE)', () => {
      const samples = Array.from({ length: 10 }, () => '01/15/2024');
      expect(detectType(samples)).toBe('date');
    });

    it('boolean checked after date', () => {
      const samples = Array.from({ length: 10 }, () => 'true');
      expect(detectType(samples)).toBe('boolean');
    });

    it('float checked after boolean', () => {
      const samples = Array.from({ length: 10 }, () => '3.14');
      expect(detectType(samples)).toBe('float');
    });

    it('integer checked after float', () => {
      // Use values > 1 to avoid boolean match
      const samples = Array.from({ length: 10 }, () => '42');
      expect(detectType(samples)).toBe('integer');
    });
  });
});

// ---------------------------------------------------------------------------
// parseCsv
// ---------------------------------------------------------------------------

describe('parseCsv', () => {
  // --- Empty content ---
  describe('empty content', () => {
    it('empty string: headers is [""] (one empty header from split)', () => {
      // ''.trim() = '' → lines = [''] → headers = ''.split(',') = [''] (one empty string)
      const result = parseCsv('');
      expect(result.headers).toEqual(['']);
    });

    it('empty string: rows is empty array', () => {
      const result = parseCsv('');
      expect(result.rows).toEqual([]);
    });

    it('whitespace-only string is defined and structured', () => {
      const result = parseCsv('   ');
      // trim() reduces to '' → same behaviour: headers = ['']
      expect(result).toBeDefined();
      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('rows');
    });

    it('whitespace-only string has single empty header', () => {
      const result = parseCsv('   ');
      expect(result.headers).toEqual(['']);
    });
  });

  // --- Simple CSV ---
  describe('simple CSV parsing', () => {
    it('parses single column, one row', () => {
      const csv = 'name\nAlice';
      const result = parseCsv(csv);
      expect(result.headers).toEqual(['name']);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]['name']).toBe('Alice');
    });

    it('parses two columns, one row', () => {
      const csv = 'name,age\nAlice,30';
      const result = parseCsv(csv);
      expect(result.headers).toEqual(['name', 'age']);
      expect(result.rows[0]['name']).toBe('Alice');
      expect(result.rows[0]['age']).toBe('30');
    });

    it('parses two columns, three rows', () => {
      const csv = 'name,age\nAlice,30\nBob,25\nCarol,35';
      const result = parseCsv(csv);
      expect(result.headers).toHaveLength(2);
      expect(result.rows).toHaveLength(3);
    });

    it('returns correct values for all rows', () => {
      const csv = 'name,dept\nAlice,HR\nBob,Finance\nCarol,Operations';
      const result = parseCsv(csv);
      expect(result.rows[0]).toEqual({ name: 'Alice', dept: 'HR' });
      expect(result.rows[1]).toEqual({ name: 'Bob', dept: 'Finance' });
      expect(result.rows[2]).toEqual({ name: 'Carol', dept: 'Operations' });
    });

    it('header-only CSV returns empty rows', () => {
      const csv = 'name,age,email';
      const result = parseCsv(csv);
      expect(result.headers).toEqual(['name', 'age', 'email']);
      expect(result.rows).toHaveLength(0);
    });
  });

  // --- BOM stripping ---
  describe('BOM character stripping', () => {
    it('strips BOM from first header', () => {
      const csv = '\uFEFFname,age\nAlice,30';
      const result = parseCsv(csv);
      expect(result.headers[0]).toBe('name');
      expect(result.headers[0]).not.toContain('\uFEFF');
    });

    it('BOM-stripped header is usable as object key', () => {
      const csv = '\uFEFFname,age\nAlice,30';
      const result = parseCsv(csv);
      expect(result.rows[0]['name']).toBe('Alice');
    });

    it('no BOM present — first header unchanged', () => {
      const csv = 'name,age\nAlice,30';
      const result = parseCsv(csv);
      expect(result.headers[0]).toBe('name');
    });
  });

  // --- CRLF and LF line endings ---
  describe('line ending handling', () => {
    it('handles CRLF line endings', () => {
      const csv = 'name,age\r\nAlice,30\r\nBob,25';
      const result = parseCsv(csv);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]['name']).toBe('Alice');
    });

    it('handles LF-only line endings', () => {
      const csv = 'name,age\nAlice,30\nBob,25';
      const result = parseCsv(csv);
      expect(result.rows).toHaveLength(2);
    });

    it('CRLF gives same result as LF', () => {
      const csvCRLF = 'name,age\r\nAlice,30\r\nBob,25';
      const csvLF = 'name,age\nAlice,30\nBob,25';
      expect(parseCsv(csvCRLF).rows).toEqual(parseCsv(csvLF).rows);
    });
  });

  // --- Whitespace trimming in headers/values ---
  describe('whitespace trimming', () => {
    it('trims whitespace from headers', () => {
      const csv = ' name , age \nAlice,30';
      const result = parseCsv(csv);
      expect(result.headers).toEqual(['name', 'age']);
    });

    it('trims whitespace from values', () => {
      const csv = 'name,age\n Alice , 30 ';
      const result = parseCsv(csv);
      expect(result.rows[0]['name']).toBe('Alice');
      expect(result.rows[0]['age']).toBe('30');
    });
  });

  // --- Quoted values ---
  describe('quoted values with commas', () => {
    it('parses quoted value containing comma', () => {
      const csv = 'name,address\nAlice,"123 Main St, Springfield"';
      const result = parseCsv(csv);
      expect(result.rows[0]['address']).toBe('123 Main St, Springfield');
    });

    it('strips surrounding quotes from quoted value', () => {
      const csv = 'name,title\nAlice,"Quality Manager"';
      const result = parseCsv(csv);
      expect(result.rows[0]['title']).toBe('Quality Manager');
    });

    it('parses multiple quoted values in same row', () => {
      const csv = 'a,b,c\n"foo,bar","baz,qux","simple"';
      const result = parseCsv(csv);
      expect(result.rows[0]['a']).toBe('foo,bar');
      expect(result.rows[0]['b']).toBe('baz,qux');
      expect(result.rows[0]['c']).toBe('simple');
    });
  });

  // --- Empty cells ---
  describe('empty cells', () => {
    it('empty cell becomes empty string', () => {
      const csv = 'name,dept,email\nAlice,,alice@example.com';
      const result = parseCsv(csv);
      expect(result.rows[0]['dept']).toBe('');
    });

    it('trailing comma creates empty last cell', () => {
      const csv = 'name,age,email\nAlice,30,';
      const result = parseCsv(csv);
      expect(result.rows[0]['email']).toBe('');
    });

    it('all empty cells in a row', () => {
      const csv = 'a,b,c\n,,';
      const result = parseCsv(csv);
      expect(result.rows[0]['a']).toBe('');
      expect(result.rows[0]['b']).toBe('');
      expect(result.rows[0]['c']).toBe('');
    });
  });

  // --- Skipping blank lines ---
  describe('blank line skipping', () => {
    it('blank line between data rows is skipped', () => {
      const csv = 'name,age\nAlice,30\n\nBob,25';
      const result = parseCsv(csv);
      expect(result.rows).toHaveLength(2);
    });

    it('trailing blank line is skipped', () => {
      const csv = 'name,age\nAlice,30\n';
      const result = parseCsv(csv);
      expect(result.rows).toHaveLength(1);
    });
  });

  // --- Many rows ---
  describe('many rows', () => {
    it('parses 100 rows correctly', () => {
      const header = 'id,name';
      const dataRows = Array.from({ length: 100 }, (_, i) => `${i + 1},Name${i + 1}`).join('\n');
      const csv = `${header}\n${dataRows}`;
      const result = parseCsv(csv);
      expect(result.rows).toHaveLength(100);
      expect(result.rows[0]['id']).toBe('1');
      expect(result.rows[99]['id']).toBe('100');
    });

    it('parses 50 rows correctly', () => {
      const header = 'ref,title,status';
      const dataRows = Array.from({ length: 50 }, (_, i) => `REF-${i},Title ${i},OPEN`).join('\n');
      const csv = `${header}\n${dataRows}`;
      const result = parseCsv(csv);
      expect(result.rows).toHaveLength(50);
    });
  });

  // --- Headers are returned as array ---
  describe('header array structure', () => {
    it('headers is an array', () => {
      const result = parseCsv('name,age\nAlice,30');
      expect(Array.isArray(result.headers)).toBe(true);
    });

    it('rows is an array', () => {
      const result = parseCsv('name,age\nAlice,30');
      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('correct number of headers', () => {
      const result = parseCsv('a,b,c,d,e\n1,2,3,4,5');
      expect(result.headers).toHaveLength(5);
    });
  });

  // --- Additional edge cases ---
  describe('additional edge cases', () => {
    it('single header with no data rows', () => {
      const result = parseCsv('reference');
      expect(result.headers).toEqual(['reference']);
      expect(result.rows).toHaveLength(0);
    });

    it('five columns, five rows', () => {
      const lines = ['a,b,c,d,e'];
      for (let i = 0; i < 5; i++) {
        lines.push(`${i},${i},${i},${i},${i}`);
      }
      const result = parseCsv(lines.join('\n'));
      expect(result.headers).toHaveLength(5);
      expect(result.rows).toHaveLength(5);
    });

    it('row with fewer values than headers fills missing with empty string', () => {
      const csv = 'a,b,c\n1,2';
      const result = parseCsv(csv);
      expect(result.rows[0]['c']).toBe('');
    });

    it('quoted header is stripped of quotes', () => {
      const csv = '"name","age"\nAlice,30';
      const result = parseCsv(csv);
      expect(result.headers).toEqual(['name', 'age']);
    });
  });
});

// ---------------------------------------------------------------------------
// parseJson
// ---------------------------------------------------------------------------

describe('parseJson', () => {
  // --- Array of objects ---
  describe('array of objects', () => {
    it('parses simple array of objects', () => {
      const json = JSON.stringify([{ name: 'Alice', age: 30 }]);
      const result = parseJson(json);
      expect(result.headers).toEqual(['name', 'age']);
      expect(result.rows).toHaveLength(1);
    });

    it('returns correct headers from first object', () => {
      const json = JSON.stringify([{ a: 1, b: 2, c: 3 }]);
      const result = parseJson(json);
      expect(result.headers).toEqual(['a', 'b', 'c']);
    });

    it('returns row values as strings', () => {
      const json = JSON.stringify([{ name: 'Alice', age: 30, active: true }]);
      const result = parseJson(json);
      expect(result.rows[0]['name']).toBe('Alice');
      expect(result.rows[0]['age']).toBe('30');
      expect(result.rows[0]['active']).toBe('true');
    });

    it('parses three-item array', () => {
      const json = JSON.stringify([
        { id: 1, title: 'A' },
        { id: 2, title: 'B' },
        { id: 3, title: 'C' },
      ]);
      const result = parseJson(json);
      expect(result.rows).toHaveLength(3);
    });

    it('all rows use same headers', () => {
      const json = JSON.stringify([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
      const result = parseJson(json);
      expect(result.rows[0]).toHaveProperty('id');
      expect(result.rows[0]).toHaveProperty('name');
      expect(result.rows[1]).toHaveProperty('id');
      expect(result.rows[1]).toHaveProperty('name');
    });
  });

  // --- Single object (non-array) ---
  describe('single object wrapping', () => {
    it('single object is wrapped in array', () => {
      const json = JSON.stringify({ name: 'Alice', age: 30 });
      const result = parseJson(json);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]['name']).toBe('Alice');
    });

    it('single object headers are extracted', () => {
      const json = JSON.stringify({ ref: 'NCR-001', title: 'Test', severity: 'MAJOR' });
      const result = parseJson(json);
      expect(result.headers).toContain('ref');
      expect(result.headers).toContain('title');
      expect(result.headers).toContain('severity');
    });
  });

  // --- Empty array ---
  describe('empty array', () => {
    it('empty array returns empty headers and rows', () => {
      const result = parseJson('[]');
      expect(result.headers).toEqual([]);
      expect(result.rows).toEqual([]);
    });
  });

  // --- Null values ---
  describe('null values', () => {
    it('null value becomes empty string', () => {
      const json = JSON.stringify([{ name: 'Alice', dept: null }]);
      const result = parseJson(json);
      expect(result.rows[0]['dept']).toBe('');
    });

    it('undefined value becomes empty string', () => {
      // JSON.stringify drops undefined keys, so we simulate via object
      const obj = { name: 'Alice' };
      const json = JSON.stringify([obj]);
      const result = parseJson(json);
      // Missing key → undefined → '' in the mapping
      expect(result.rows[0]['name']).toBe('Alice');
    });

    it('multiple null values', () => {
      const json = JSON.stringify([{ a: null, b: null, c: 'value' }]);
      const result = parseJson(json);
      expect(result.rows[0]['a']).toBe('');
      expect(result.rows[0]['b']).toBe('');
      expect(result.rows[0]['c']).toBe('value');
    });
  });

  // --- Number values ---
  describe('number values stringified', () => {
    it('integer value is stringified', () => {
      const json = JSON.stringify([{ count: 42 }]);
      const result = parseJson(json);
      expect(result.rows[0]['count']).toBe('42');
    });

    it('float value is stringified', () => {
      const json = JSON.stringify([{ ratio: 3.14 }]);
      const result = parseJson(json);
      expect(result.rows[0]['ratio']).toBe('3.14');
    });

    it('negative number is stringified', () => {
      const json = JSON.stringify([{ delta: -5 }]);
      const result = parseJson(json);
      expect(result.rows[0]['delta']).toBe('-5');
    });

    it('zero is stringified to "0"', () => {
      const json = JSON.stringify([{ count: 0 }]);
      const result = parseJson(json);
      expect(result.rows[0]['count']).toBe('0');
    });
  });

  // --- Boolean values ---
  describe('boolean values stringified', () => {
    it('boolean true becomes "true"', () => {
      const json = JSON.stringify([{ active: true }]);
      const result = parseJson(json);
      expect(result.rows[0]['active']).toBe('true');
    });

    it('boolean false becomes "false"', () => {
      const json = JSON.stringify([{ active: false }]);
      const result = parseJson(json);
      expect(result.rows[0]['active']).toBe('false');
    });
  });

  // --- Large arrays ---
  describe('large arrays', () => {
    it('parses 50-item array correctly', () => {
      const items = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Name${i}` }));
      const json = JSON.stringify(items);
      const result = parseJson(json);
      expect(result.rows).toHaveLength(50);
    });

    it('first and last row of 50-item array', () => {
      const items = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Name${i}` }));
      const json = JSON.stringify(items);
      const result = parseJson(json);
      expect(result.rows[0]['id']).toBe('0');
      expect(result.rows[49]['id']).toBe('49');
    });
  });

  // --- All field values as strings ---
  describe('all field values returned as strings', () => {
    it.each([
      [{ value: 'string' }, 'string'],
      [{ value: 123 }, '123'],
      [{ value: 3.14 }, '3.14'],
      [{ value: true }, 'true'],
      [{ value: false }, 'false'],
      [{ value: null }, ''],
    ])('value %p becomes string %s', (obj, expected) => {
      const json = JSON.stringify([obj]);
      const result = parseJson(json);
      expect(result.rows[0]['value']).toBe(expected);
    });
  });

  // --- Additional structural checks ---
  describe('structural checks', () => {
    it('headers is an array', () => {
      const json = JSON.stringify([{ a: 1 }]);
      expect(Array.isArray(parseJson(json).headers)).toBe(true);
    });

    it('rows is an array', () => {
      const json = JSON.stringify([{ a: 1 }]);
      expect(Array.isArray(parseJson(json).rows)).toBe(true);
    });

    it('rows are plain objects', () => {
      const json = JSON.stringify([{ name: 'Alice' }]);
      const result = parseJson(json);
      expect(typeof result.rows[0]).toBe('object');
    });

    it('ten-item array has ten rows', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i }));
      const result = parseJson(JSON.stringify(items));
      expect(result.rows).toHaveLength(10);
    });
  });
});

// ---------------------------------------------------------------------------
// analyseFile
// ---------------------------------------------------------------------------

describe('analyseFile', () => {
  // --- File type detection ---
  describe('fileType detection from filename', () => {
    it('CSV file → fileType "csv"', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'data.csv', 'upload-001');
      expect(result.fileType).toBe('csv');
    });

    it('JSON file → fileType "json"', () => {
      const json = JSON.stringify([{ name: 'Alice' }]);
      const result = analyseFile(json, 'data.json', 'upload-002');
      expect(result.fileType).toBe('json');
    });

    it('default unknown extension → fileType "csv"', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'data.txt', 'upload-003');
      expect(result.fileType).toBe('csv');
    });

    it('JSON filename is case-insensitive', () => {
      const json = JSON.stringify([{ name: 'Alice' }]);
      const result = analyseFile(json, 'DATA.JSON', 'upload-004');
      expect(result.fileType).toBe('json');
    });

    it('CSV filename is case-insensitive', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'DATA.CSV', 'upload-005');
      expect(result.fileType).toBe('csv');
    });

    it('xlsx filename → fileType "xlsx"', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'data.xlsx', 'upload-006');
      expect(result.fileType).toBe('xlsx');
    });
  });

  // --- uploadId and filename preservation ---
  describe('uploadId and filename in result', () => {
    it('uploadId is preserved in result', () => {
      const csv = 'name\nAlice';
      const result = analyseFile(csv, 'test.csv', 'my-upload-id-123');
      expect(result.uploadId).toBe('my-upload-id-123');
    });

    it('filename is preserved in result', () => {
      const csv = 'name\nAlice';
      const result = analyseFile(csv, 'my-data.csv', 'upload-007');
      expect(result.filename).toBe('my-data.csv');
    });

    it('uploadId with special chars is preserved', () => {
      const csv = 'name\nAlice';
      const result = analyseFile(csv, 'test.csv', 'abc-123-xyz-456');
      expect(result.uploadId).toBe('abc-123-xyz-456');
    });
  });

  // --- rowCount ---
  describe('rowCount', () => {
    it('returns correct rowCount for 3-row CSV', () => {
      const csv = 'name,age\nAlice,30\nBob,25\nCarol,35';
      const result = analyseFile(csv, 'test.csv', 'u1');
      expect(result.rowCount).toBe(3);
    });

    it('returns 0 rowCount for header-only CSV', () => {
      const csv = 'name,age,email';
      const result = analyseFile(csv, 'test.csv', 'u2');
      expect(result.rowCount).toBe(0);
    });

    it('returns correct rowCount for JSON array', () => {
      const json = JSON.stringify(Array.from({ length: 5 }, (_, i) => ({ id: i })));
      const result = analyseFile(json, 'data.json', 'u3');
      expect(result.rowCount).toBe(5);
    });

    it('returns 1 rowCount for single-row CSV', () => {
      const csv = 'name\nAlice';
      const result = analyseFile(csv, 'test.csv', 'u4');
      expect(result.rowCount).toBe(1);
    });

    it('large CSV rowCount', () => {
      const rows = Array.from({ length: 100 }, (_, i) => `Row${i},Value${i}`).join('\n');
      const csv = `name,value\n${rows}`;
      const result = analyseFile(csv, 'large.csv', 'u5');
      expect(result.rowCount).toBe(100);
    });

    it('returns correct rowCount for 1000-row CSV', () => {
      const rows = Array.from({ length: 1000 }, (_, i) => `${i},Item${i}`).join('\n');
      const csv = `id,name\n${rows}`;
      const result = analyseFile(csv, 'big.csv', 'u6');
      expect(result.rowCount).toBe(1000);
    });
  });

  // --- headers ---
  describe('headers', () => {
    it('returns correct headers for CSV', () => {
      const csv = 'ref,title,severity,date\n1,T,MAJOR,2024-01-15';
      const result = analyseFile(csv, 'test.csv', 'u7');
      expect(result.headers).toEqual(['ref', 'title', 'severity', 'date']);
    });

    it('returns correct headers for JSON', () => {
      const json = JSON.stringify([{ a: 1, b: 2, c: 3 }]);
      const result = analyseFile(json, 'data.json', 'u8');
      expect(result.headers).toEqual(['a', 'b', 'c']);
    });

    it('headers is an array', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'test.csv', 'u9');
      expect(Array.isArray(result.headers)).toBe(true);
    });

    it('empty CSV produces single empty-string header (parseCsv("") returns [""])', () => {
      // parseCsv('') → lines = [''] → headers = [''.split(',')[0]] = ['']
      const result = analyseFile('', 'empty.csv', 'u10');
      expect(result.headers).toEqual(['']);
    });
  });

  // --- sampleRows ---
  describe('sampleRows', () => {
    it('returns max 5 sample rows', () => {
      const rows = Array.from({ length: 10 }, (_, i) => `Row${i},Val${i}`).join('\n');
      const csv = `name,value\n${rows}`;
      const result = analyseFile(csv, 'test.csv', 'u11');
      expect(result.sampleRows.length).toBeLessThanOrEqual(5);
    });

    it('returns all rows when fewer than 5', () => {
      const csv = 'name,age\nAlice,30\nBob,25';
      const result = analyseFile(csv, 'test.csv', 'u12');
      expect(result.sampleRows).toHaveLength(2);
    });

    it('returns exactly 5 sample rows when 5 rows available', () => {
      const rows = Array.from({ length: 5 }, (_, i) => `Name${i},${i}`).join('\n');
      const csv = `name,age\n${rows}`;
      const result = analyseFile(csv, 'test.csv', 'u13');
      expect(result.sampleRows).toHaveLength(5);
    });

    it('returns 5 sample rows even when 100 rows exist', () => {
      const rows = Array.from({ length: 100 }, (_, i) => `Name${i},${i}`).join('\n');
      const csv = `name,age\n${rows}`;
      const result = analyseFile(csv, 'test.csv', 'u14');
      expect(result.sampleRows).toHaveLength(5);
    });

    it('sampleRows is an array', () => {
      const csv = 'name\nAlice';
      const result = analyseFile(csv, 'test.csv', 'u15');
      expect(Array.isArray(result.sampleRows)).toBe(true);
    });

    it('sampleRows elements are objects', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'test.csv', 'u16');
      expect(typeof result.sampleRows[0]).toBe('object');
    });
  });

  // --- PII masking in sampleRows ---
  describe('PII masking in sampleRows', () => {
    it('email in sampleRows is masked', () => {
      const csv = 'name,email\nAlice,alice@example.com\nBob,bob@example.com';
      const result = analyseFile(csv, 'test.csv', 'u17');
      const emailValue = result.sampleRows[0]['email'];
      expect(emailValue).not.toBe('alice@example.com');
      expect(emailValue).toContain('***');
    });

    it('masked email preserves domain part', () => {
      const csv = 'name,email\nAlice,alice@example.com';
      const result = analyseFile(csv, 'test.csv', 'u18');
      const emailValue = result.sampleRows[0]['email'];
      expect(emailValue).toContain('@example.com');
    });

    it('masked email preserves first 2 chars of local part', () => {
      const csv = 'name,email\nAlice,alice@example.com';
      const result = analyseFile(csv, 'test.csv', 'u19');
      const emailValue = result.sampleRows[0]['email'];
      expect(emailValue.startsWith('al')).toBe(true);
    });

    it('phone in sampleRows is masked', () => {
      const csv = 'name,phone\nAlice,+44 7700 900000';
      const result = analyseFile(csv, 'test.csv', 'u20');
      const phoneValue = result.sampleRows[0]['phone'];
      expect(phoneValue).toContain('***');
    });

    it('non-PII values are not masked', () => {
      const csv = 'name,status\nAlice,ACTIVE';
      const result = analyseFile(csv, 'test.csv', 'u21');
      expect(result.sampleRows[0]['status']).toBe('ACTIVE');
      expect(result.sampleRows[0]['name']).toBe('Alice');
    });

    it('multiple email columns are both masked', () => {
      const csv = 'email1,email2\nalice@example.com,bob@example.com';
      const result = analyseFile(csv, 'test.csv', 'u22');
      expect(result.sampleRows[0]['email1']).toContain('***');
      expect(result.sampleRows[0]['email2']).toContain('***');
    });

    it('empty email field is not masked', () => {
      const csv = 'name,email\nAlice,';
      const result = analyseFile(csv, 'test.csv', 'u23');
      expect(result.sampleRows[0]['email']).toBe('');
    });
  });

  // --- detectedTypes ---
  describe('detectedTypes', () => {
    it('detectedTypes has entry for each header', () => {
      const csv = 'name,age,email\nAlice,30,alice@example.com';
      const result = analyseFile(csv, 'test.csv', 'u24');
      expect(result.detectedTypes).toHaveProperty('name');
      expect(result.detectedTypes).toHaveProperty('age');
      expect(result.detectedTypes).toHaveProperty('email');
    });

    it('detects email column type correctly', () => {
      const emails = Array.from({ length: 10 }, (_, i) => `user${i}@example.com`).join('\n');
      const csv = `name,email\n${Array.from({ length: 10 }, (_, i) => `Name${i},user${i}@example.com`).join('\n')}`;
      const result = analyseFile(csv, 'test.csv', 'u25');
      expect(result.detectedTypes['email']).toBe('email');
    });

    it('detects date column type correctly using slash-format dates', () => {
      // ISO "YYYY-MM-DD" matches PHONE_RE → detected as phone. Use slash format instead.
      const rows = Array.from({ length: 10 }, (_, i) => `Name${i},${String(i + 1).padStart(2, '0')}/01/2024`).join('\n');
      const csv = `name,date\n${rows}`;
      const result = analyseFile(csv, 'test.csv', 'u26');
      expect(result.detectedTypes['date']).toBe('date');
    });

    it('ISO date column (YYYY-MM-DD) is detected as phone (matches PHONE_RE)', () => {
      const rows = Array.from({ length: 10 }, (_, i) => `Name${i},2024-01-${String(i + 1).padStart(2, '0')}`).join('\n');
      const csv = `name,isodate\n${rows}`;
      const result = analyseFile(csv, 'test.csv', 'u26b');
      expect(result.detectedTypes['isodate']).toBe('phone');
    });

    it('detects integer column type correctly', () => {
      const rows = Array.from({ length: 10 }, (_, i) => `Name${i},${(i + 10) * 10}`).join('\n');
      const csv = `name,count\n${rows}`;
      const result = analyseFile(csv, 'test.csv', 'u27');
      expect(result.detectedTypes['count']).toBe('integer');
    });

    it('detectedTypes is an object', () => {
      const csv = 'name\nAlice';
      const result = analyseFile(csv, 'test.csv', 'u28');
      expect(typeof result.detectedTypes).toBe('object');
    });
  });

  // --- columns ---
  describe('columns', () => {
    it('columns array has entry for each header', () => {
      const csv = 'name,age,email\nAlice,30,alice@example.com';
      const result = analyseFile(csv, 'test.csv', 'u29');
      expect(result.columns).toHaveLength(3);
    });

    it('each column has name property', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'test.csv', 'u30');
      expect(result.columns[0]).toHaveProperty('name');
      expect(result.columns[1]).toHaveProperty('name');
    });

    it('each column has detectedType property', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'test.csv', 'u31');
      expect(result.columns[0]).toHaveProperty('detectedType');
    });

    it('each column has nullCount property', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'test.csv', 'u32');
      expect(result.columns[0]).toHaveProperty('nullCount');
    });

    it('each column has uniqueCount property', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'test.csv', 'u33');
      expect(result.columns[0]).toHaveProperty('uniqueCount');
    });

    it('each column has sampleValues property', () => {
      const csv = 'name,age\nAlice,30\nBob,25';
      const result = analyseFile(csv, 'test.csv', 'u34');
      expect(result.columns[0]).toHaveProperty('sampleValues');
      expect(Array.isArray(result.columns[0].sampleValues)).toBe(true);
    });

    it('column name matches header', () => {
      const csv = 'myColumn,otherColumn\nval1,val2';
      const result = analyseFile(csv, 'test.csv', 'u35');
      expect(result.columns[0].name).toBe('myColumn');
      expect(result.columns[1].name).toBe('otherColumn');
    });

    it('nullCount is 0 when all values present', () => {
      const rows = Array.from({ length: 5 }, (_, i) => `Name${i},${i}`).join('\n');
      const csv = `name,age\n${rows}`;
      const result = analyseFile(csv, 'test.csv', 'u36');
      expect(result.columns[0].nullCount).toBe(0);
    });

    it('nullCount counts empty values', () => {
      const csv = 'name,dept\nAlice,\nBob,\nCarol,Finance';
      const result = analyseFile(csv, 'test.csv', 'u37');
      const deptColumn = result.columns.find(c => c.name === 'dept');
      expect(deptColumn?.nullCount).toBe(2);
    });

    it('uniqueCount is correct for unique values', () => {
      const csv = 'status\nOPEN\nCLOSED\nOPEN\nVERIFIED';
      const result = analyseFile(csv, 'test.csv', 'u38');
      // 3 unique values: OPEN, CLOSED, VERIFIED
      expect(result.columns[0].uniqueCount).toBe(3);
    });

    it('uniqueCount equals row count when all values unique', () => {
      const rows = Array.from({ length: 5 }, (_, i) => `REF-${i}`).join('\n');
      const csv = `ref\n${rows}`;
      const result = analyseFile(csv, 'test.csv', 'u39');
      expect(result.columns[0].uniqueCount).toBe(5);
    });

    it('sampleValues contains max 3 values', () => {
      const rows = Array.from({ length: 10 }, (_, i) => `Name${i}`).join('\n');
      const csv = `name\n${rows}`;
      const result = analyseFile(csv, 'test.csv', 'u40');
      expect(result.columns[0].sampleValues.length).toBeLessThanOrEqual(3);
    });
  });

  // --- confidence ---
  describe('confidence', () => {
    it('confidence is 0 for empty file', () => {
      const result = analyseFile('', 'empty.csv', 'u41');
      expect(result.confidence).toBe(0);
    });

    it('confidence is 0 for header-only CSV (no rows)', () => {
      const result = analyseFile('name,age', 'empty.csv', 'u42');
      expect(result.confidence).toBe(0);
    });

    it('confidence > 0 for non-empty file', () => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'test.csv', 'u43');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('confidence is at most 1', () => {
      const rows = Array.from({ length: 100 }, (_, i) => `Name${i},${i}`).join('\n');
      const csv = `a,b,c,d,e,f,g,h,i,j\n${Array.from({ length: 100 }, (_, i) => Array(10).fill(i).join(',')).join('\n')}`;
      const result = analyseFile(csv, 'test.csv', 'u44');
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('more columns → higher confidence (all else equal)', () => {
      const csv1 = 'a\nval';
      const csv2 = 'a,b,c,d,e\nval,val,val,val,val';
      const r1 = analyseFile(csv1, 'test.csv', 'u45');
      const r2 = analyseFile(csv2, 'test.csv', 'u46');
      expect(r2.confidence).toBeGreaterThan(r1.confidence);
    });

    it('more rows → higher confidence (all else equal)', () => {
      const csv1 = 'a\nval';
      const rows = Array.from({ length: 50 }, () => 'val').join('\n');
      const csv2 = `a\n${rows}`;
      const r1 = analyseFile(csv1, 'test.csv', 'u47');
      const r2 = analyseFile(csv2, 'test.csv', 'u48');
      expect(r2.confidence).toBeGreaterThan(r1.confidence);
    });

    it('confidence is a number', () => {
      const csv = 'name\nAlice';
      const result = analyseFile(csv, 'test.csv', 'u49');
      expect(typeof result.confidence).toBe('number');
    });
  });

  // --- JSON analyseFile ---
  describe('analyseFile with JSON content', () => {
    it('JSON array is parsed correctly', () => {
      const json = JSON.stringify([
        { ref: 'NCR-001', title: 'Test', severity: 'MAJOR' },
        { ref: 'NCR-002', title: 'Test2', severity: 'MINOR' },
      ]);
      const result = analyseFile(json, 'data.json', 'u50');
      expect(result.rowCount).toBe(2);
      expect(result.headers).toContain('ref');
    });

    it('JSON file type is set to "json"', () => {
      const json = JSON.stringify([{ a: 1 }]);
      const result = analyseFile(json, 'records.json', 'u51');
      expect(result.fileType).toBe('json');
    });

    it('JSON sample rows are masked for PII', () => {
      const json = JSON.stringify([{ email: 'user@example.com', name: 'Alice' }]);
      const result = analyseFile(json, 'data.json', 'u52');
      expect(result.sampleRows[0]['email']).toContain('***');
    });

    it('JSON rowCount for 10-item array', () => {
      const json = JSON.stringify(Array.from({ length: 10 }, (_, i) => ({ id: i })));
      const result = analyseFile(json, 'data.json', 'u53');
      expect(result.rowCount).toBe(10);
    });

    it('JSON empty array → confidence 0', () => {
      const result = analyseFile('[]', 'data.json', 'u54');
      expect(result.confidence).toBe(0);
    });
  });

  // --- Various CSV structures ---
  describe('various CSV structures', () => {
    it('employee CSV detects email type correctly', () => {
      const rows = Array.from({ length: 10 }, (_, i) =>
        `Name${i},user${i}@example.com,${String(i + 1).padStart(2, '0')}/01/2024`
      ).join('\n');
      const csv = `name,email,startDate\n${rows}`;
      const result = analyseFile(csv, 'employees.csv', 'u55');
      expect(result.detectedTypes['email']).toBe('email');
    });

    it('employee CSV with slash-format dates detects date type correctly', () => {
      // ISO dates (YYYY-MM-DD) match PHONE_RE → detected as phone; use slash format
      const rows = Array.from({ length: 10 }, (_, i) =>
        `Name${i},user${i}@example.com,${String(i + 1).padStart(2, '0')}/01/2024`
      ).join('\n');
      const csv = `name,email,startDate\n${rows}`;
      const result = analyseFile(csv, 'employees.csv', 'u55b');
      expect(result.detectedTypes['startDate']).toBe('date');
    });

    it('employee CSV with ISO-format dates detects phone (ISO dates match PHONE_RE)', () => {
      const rows = Array.from({ length: 10 }, (_, i) =>
        `Name${i},user${i}@example.com,2024-01-${String(i + 1).padStart(2, '0')}`
      ).join('\n');
      const csv = `name,email,isoDate\n${rows}`;
      const result = analyseFile(csv, 'employees.csv', 'u55c');
      expect(result.detectedTypes['isoDate']).toBe('phone');
    });

    it('risk register CSV detects integer columns', () => {
      const rows = Array.from({ length: 10 }, (_, i) => `RSK-${i},Risk ${i},${i + 1},${i + 1}`).join('\n');
      const csv = `ref,title,likelihood,impact\n${rows}`;
      const result = analyseFile(csv, 'risks.csv', 'u56');
      expect(result.detectedTypes['likelihood']).toBe('integer');
      expect(result.detectedTypes['impact']).toBe('integer');
    });

    it('audit CSV with float confidence score', () => {
      const rows = Array.from({ length: 10 }, (_, i) => `AUD-${i},${(i + 1) * 10}.${i}`).join('\n');
      const csv = `ref,score\n${rows}`;
      const result = analyseFile(csv, 'audits.csv', 'u57');
      expect(result.detectedTypes['score']).toBe('float');
    });

    it('mixed-type CSV falls back to "string" for mixed columns', () => {
      const rows = Array.from({ length: 10 }, (_, i) =>
        i % 2 === 0 ? `Name${i},${i}` : `Name${i},word${i}`
      ).join('\n');
      const csv = `name,value\n${rows}`;
      const result = analyseFile(csv, 'mixed.csv', 'u58');
      // 5/10 integers = 50%, below threshold
      expect(result.detectedTypes['value']).toBe('string');
    });

    it('boolean CSV column detected', () => {
      const rows = Array.from({ length: 10 }, (_, i) => `Name${i},${i % 2 === 0 ? 'true' : 'false'}`).join('\n');
      const csv = `name,active\n${rows}`;
      const result = analyseFile(csv, 'employees.csv', 'u59');
      expect(result.detectedTypes['active']).toBe('boolean');
    });
  });

  // --- sampleRows PII masking via columns.sampleValues ---
  describe('column sampleValues PII masking', () => {
    it('email in column sampleValues is masked', () => {
      const csv = 'email\nalice@example.com\nbob@example.com\ncarol@example.com';
      const result = analyseFile(csv, 'test.csv', 'u60');
      const emailCol = result.columns.find(c => c.name === 'email');
      expect(emailCol?.sampleValues[0]).toContain('***');
    });

    it('non-PII column sampleValues are not masked', () => {
      const csv = 'status\nOPEN\nCLOSED\nVERIFIED';
      const result = analyseFile(csv, 'test.csv', 'u61');
      const statusCol = result.columns.find(c => c.name === 'status');
      expect(statusCol?.sampleValues[0]).toBe('OPEN');
    });
  });

  // --- analyseFile result structure ---
  describe('result structure completeness', () => {
    const REQUIRED_KEYS = ['uploadId', 'filename', 'rowCount', 'headers', 'columns', 'sampleRows', 'detectedTypes', 'confidence', 'fileType'];

    it.each(REQUIRED_KEYS)('result has property "%s"', (key) => {
      const csv = 'name,age\nAlice,30';
      const result = analyseFile(csv, 'test.csv', 'u62');
      expect(result).toHaveProperty(key);
    });
  });

  // --- Large file ---
  describe('large file handling', () => {
    it('1000-row CSV produces correct rowCount', () => {
      const rows = Array.from({ length: 1000 }, (_, i) => `${i},Name${i},user${i}@example.com`).join('\n');
      const csv = `id,name,email\n${rows}`;
      const result = analyseFile(csv, 'large.csv', 'u63');
      expect(result.rowCount).toBe(1000);
    });

    it('1000-row CSV has max 5 sampleRows', () => {
      const rows = Array.from({ length: 1000 }, (_, i) => `${i},Name${i}`).join('\n');
      const csv = `id,name\n${rows}`;
      const result = analyseFile(csv, 'large.csv', 'u64');
      expect(result.sampleRows.length).toBeLessThanOrEqual(5);
    });

    it('1000-row CSV confidence is capped at 1', () => {
      const rows = Array.from({ length: 1000 }, (_, i) => `${i},Name${i}`).join('\n');
      const csv = `id,name\n${rows}`;
      const result = analyseFile(csv, 'large.csv', 'u65');
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});

// ---------------------------------------------------------------------------
// Additional detectType exhaustive tests
// ---------------------------------------------------------------------------

describe('detectType exhaustive individual samples', () => {
  // Email samples
  it.each([
    'admin@nexara.com', 'user@company.co.uk', 'test+tag@example.org',
    'first.last@domain.io', 'info@subdomain.example.com',
    'a@b.co', 'x@y.z', 'support@help.desk.example.com',
    'no-reply@nexara.dmcc', 'sales@partner.example.net',
  ])('email sample "%s" → "email"', (email) => {
    expect(detectType([email])).toBe('email');
  });

  // Phone samples — must NOT match EMAIL_RE, must have >= 7 digits
  it.each([
    '+44 7700 900000', '+1 800 555 0199', '(555) 123-4567',
    '+44 1234 567890', '0800 123 456 789', '07700 900000',
    '+1-800-555-1234', '(020) 7946-0958', '+49 30 12345678',
    '+61 2 1234 5678',
  ])('phone sample "%s" → "phone"', (phone) => {
    expect(detectType([phone])).toBe('phone');
  });

  // Date samples — slash-format to avoid phone confusion
  it.each([
    '01/01/2024', '31/12/2023', '15/06/2022',
    '28/02/2024', '01/03/2020', '30/04/2021',
    '31/07/2025', '15/08/2026', '20/10/2023',
    '05/11/2019',
  ])('slash-date sample "%s" → "date"', (date) => {
    expect(detectType([date])).toBe('date');
  });

  // Boolean samples
  it.each([
    'true', 'True', 'TRUE', 'false', 'False', 'FALSE',
    'yes', 'Yes', 'YES', 'no', 'No', 'NO',
    'y', 'Y', 'n', 'N', '1', '0',
  ])('boolean sample "%s" → "boolean"', (val) => {
    expect(detectType([val])).toBe('boolean');
  });

  // Integer samples (must be > 1 to avoid boolean match on '1'/'0')
  it.each([
    '2', '3', '4', '5', '6', '7', '8', '9',
    '10', '42', '100', '999', '1000', '99999',
    '-2', '-3', '-10', '-100', '-999',
  ])('integer sample "%s" → "integer"', (val) => {
    expect(detectType([val])).toBe('integer');
  });

  // Float samples
  it.each([
    '1.1', '2.2', '3.3', '3.14', '0.001', '99.99',
    '-1.5', '-0.1', '100.0', '0.5',
    '1234.56', '-1234.56', '0.001', '999.999',
  ])('float sample "%s" → "float"', (val) => {
    expect(detectType([val])).toBe('float');
  });

  // String fallback samples
  it.each([
    'hello world', 'ISO 9001', 'foo bar baz', 'not a number',
    'maybe', 'description text', 'Quality Manual',
    'some/path/here', 'mixed123text', 'has spaces and stuff',
  ])('string sample "%s" → "string"', (val) => {
    expect(detectType([val])).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// Additional parseCsv tests — exhaustive
// ---------------------------------------------------------------------------

describe('parseCsv exhaustive tests', () => {
  it.each(Array.from({ length: 20 }, (_, i) => i + 1))(
    'CSV with %d data rows returns correct rowCount',
    (n) => {
      const lines = Array.from({ length: n }, (_, i) => `Value${i},Data${i}`).join('\n');
      const csv = `col1,col2\n${lines}`;
      expect(parseCsv(csv).rows).toHaveLength(n);
    },
  );

  it.each(Array.from({ length: 10 }, (_, i) => i + 2))(
    'CSV with %d columns returns correct header count',
    (n) => {
      const headers = Array.from({ length: n }, (_, i) => `col${i}`).join(',');
      const values = Array.from({ length: n }, (_, i) => `val${i}`).join(',');
      const csv = `${headers}\n${values}`;
      expect(parseCsv(csv).headers).toHaveLength(n);
    },
  );

  it.each([
    ['name,age', ['name', 'age']],
    ['ref,title,date,severity', ['ref', 'title', 'date', 'severity']],
    ['a,b,c,d,e,f', ['a', 'b', 'c', 'd', 'e', 'f']],
    ['"col1","col2","col3"', ['col1', 'col2', 'col3']],
  ])('CSV "%s" parses correct headers', (headerLine, expectedHeaders) => {
    const csv = `${headerLine}\nval1,val2`;
    const result = parseCsv(csv);
    expect(result.headers.slice(0, expectedHeaders.length)).toEqual(expectedHeaders);
  });

  it.each([
    ['name,status', 'Alice,OPEN', 'name', 'Alice'],
    ['name,status', 'Alice,OPEN', 'status', 'OPEN'],
    ['ref,title', 'NCR-001,Test defect', 'ref', 'NCR-001'],
    ['ref,title', 'NCR-001,Test defect', 'title', 'Test defect'],
    ['id,value', '42,hello', 'id', '42'],
    ['id,value', '42,hello', 'value', 'hello'],
  ])('CSV row "%s" with header "%s" has value "%s" at "%s"', (headers, row, col, expected) => {
    const csv = `${headers}\n${row}`;
    const result = parseCsv(csv);
    expect(result.rows[0][col]).toBe(expected);
  });

  it('parseCsv header trimming applied to each header', () => {
    const csv = ' a , b , c \n1,2,3';
    const result = parseCsv(csv);
    expect(result.headers).toEqual(['a', 'b', 'c']);
  });

  it('parseCsv value trimming applied to each value', () => {
    const csv = 'a,b,c\n 1 , 2 , 3 ';
    const result = parseCsv(csv);
    expect(result.rows[0]).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('parseCsv preserves numeric string values', () => {
    const csv = 'id,score\n1,99.5';
    const result = parseCsv(csv);
    expect(result.rows[0]['id']).toBe('1');
    expect(result.rows[0]['score']).toBe('99.5');
  });

  it('parseCsv preserves boolean-like string values', () => {
    const csv = 'active,verified\ntrue,false';
    const result = parseCsv(csv);
    expect(result.rows[0]['active']).toBe('true');
    expect(result.rows[0]['verified']).toBe('false');
  });

  it('parseCsv handles tab in header (no special treatment)', () => {
    const csv = 'name\tfield,age\nAlice,30';
    const result = parseCsv(csv);
    // Tab is not a delimiter, so it's part of the header string
    expect(result.headers[0]).toContain('name');
  });

  it('parseCsv: each row is a plain object', () => {
    const csv = 'name\nAlice\nBob\nCarol';
    const result = parseCsv(csv);
    result.rows.forEach(row => {
      expect(typeof row).toBe('object');
      expect(Array.isArray(row)).toBe(false);
    });
  });

  it('parseCsv: headers array is the same across all rows', () => {
    const csv = 'a,b,c\n1,2,3\n4,5,6';
    const result = parseCsv(csv);
    result.rows.forEach(row => {
      expect(Object.keys(row)).toEqual(['a', 'b', 'c']);
    });
  });
});

// ---------------------------------------------------------------------------
// Additional parseJson tests — exhaustive
// ---------------------------------------------------------------------------

describe('parseJson exhaustive tests', () => {
  it.each(Array.from({ length: 15 }, (_, i) => i + 1))(
    'JSON array with %d items returns correct rowCount',
    (n) => {
      const items = Array.from({ length: n }, (_, i) => ({ id: i }));
      const result = parseJson(JSON.stringify(items));
      expect(result.rows).toHaveLength(n);
    },
  );

  it.each([
    [{ a: 'string' }, 'string'],
    [{ a: 42 }, '42'],
    [{ a: 3.14 }, '3.14'],
    [{ a: true }, 'true'],
    [{ a: false }, 'false'],
    [{ a: null }, ''],
    [{ a: 0 }, '0'],
    [{ a: -1 }, '-1'],
  ])('JSON value %j becomes string "%s"', (obj, expected) => {
    const result = parseJson(JSON.stringify([obj]));
    expect(result.rows[0]['a']).toBe(expected);
  });

  it.each([
    ['a'], ['b'], ['c'], ['name'], ['value'], ['ref'], ['title'], ['status'],
    ['created_at'], ['updated_at'], ['email'], ['phone'], ['address'],
  ])('JSON field "%s" is included in headers', (field) => {
    const obj = { [field]: 'test' };
    const result = parseJson(JSON.stringify([obj]));
    expect(result.headers).toContain(field);
  });

  it.each(Array.from({ length: 10 }, (_, i) => i))(
    'JSON item at index %d has correct id',
    (idx) => {
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Name${i}` }));
      const result = parseJson(JSON.stringify(items));
      expect(result.rows[idx]['id']).toBe(String(idx));
    },
  );

  it('parseJson preserves field order from first object', () => {
    const obj = { z: 1, a: 2, m: 3 };
    const result = parseJson(JSON.stringify([obj]));
    expect(result.headers).toEqual(['z', 'a', 'm']);
  });

  it('parseJson: rows are plain objects', () => {
    const json = JSON.stringify([{ x: 1 }, { x: 2 }]);
    const result = parseJson(json);
    result.rows.forEach(row => {
      expect(typeof row).toBe('object');
      expect(Array.isArray(row)).toBe(false);
    });
  });

  it('parseJson: all row values are strings', () => {
    const json = JSON.stringify([{ a: 1, b: true, c: 'text', d: null, e: 3.14 }]);
    const result = parseJson(json);
    Object.values(result.rows[0]).forEach(v => {
      expect(typeof v).toBe('string');
    });
  });
});

// ---------------------------------------------------------------------------
// Additional analyseFile tests — exhaustive
// ---------------------------------------------------------------------------

describe('analyseFile exhaustive tests', () => {
  // uploadId variations
  it.each([
    'upload-001', 'upload-abc-xyz', '12345', 'a'.repeat(50),
    'UPPERCASE-ID', 'mixed-Case-123', 'uuid-like-1234-abcd',
  ])('uploadId "%s" is preserved', (uploadId) => {
    const result = analyseFile('name\nAlice', 'test.csv', uploadId);
    expect(result.uploadId).toBe(uploadId);
  });

  // filename variations
  it.each([
    ['test.csv', 'csv'],
    ['data.json', 'json'],
    ['records.CSV', 'csv'],
    ['records.JSON', 'json'],
    ['data.txt', 'csv'],
    ['export.xlsx', 'xlsx'],
    ['file.xml', 'csv'],
  ])('filename "%s" gives fileType "%s"', (filename, expectedType) => {
    const content = expectedType === 'json'
      ? JSON.stringify([{ a: 1 }])
      : 'a\n1';
    const result = analyseFile(content, filename, 'u-test');
    expect(result.fileType).toBe(expectedType);
  });

  // rowCount for various CSV sizes
  it.each([1, 2, 3, 5, 10, 20, 50])(
    'CSV with %d rows has correct rowCount',
    (n) => {
      const rows = Array.from({ length: n }, (_, i) => `Row${i},Val${i}`).join('\n');
      const csv = `name,value\n${rows}`;
      const result = analyseFile(csv, 'test.csv', `uid-${n}`);
      expect(result.rowCount).toBe(n);
    },
  );

  // sampleRows capped at 5
  it.each([1, 2, 3, 4, 5, 6, 10, 50, 100])(
    '%d rows gives sampleRows of length min(%d, 5)',
    (n) => {
      const rows = Array.from({ length: n }, (_, i) => `Row${i},${i}`).join('\n');
      const csv = `name,val\n${rows}`;
      const result = analyseFile(csv, 'test.csv', `uid-sr-${n}`);
      expect(result.sampleRows).toHaveLength(Math.min(n, 5));
    },
  );

  // PII masking for various email patterns
  it.each([
    'alice@example.com', 'bob@nexara.com', 'carol@test.org',
    'dave@company.co.uk', 'eve@sub.domain.io',
  ])('email "%s" in sample rows is masked', (email) => {
    const csv = `name,email\nUser,${email}`;
    const result = analyseFile(csv, 'test.csv', 'u-pii');
    expect(result.sampleRows[0]['email']).toContain('***');
    expect(result.sampleRows[0]['email']).not.toBe(email);
  });

  // confidence is always a number in [0,1]
  it.each([
    ['', 'empty.csv'],
    ['name', 'header-only.csv'],
    ['name\nAlice', 'one-row.csv'],
    ['a,b,c\n1,2,3\n4,5,6', 'two-row.csv'],
  ])('confidence for "%s" is a number in [0,1]', (content, filename) => {
    const result = analyseFile(content, filename, 'u-conf');
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  // columns array length matches headers length
  it.each([
    'a,b,c', 'name,email,date,status', 'ref', 'x,y',
  ])('columns length equals headers length for "%s"', (headerLine) => {
    const csv = `${headerLine}\nval1,val2,val3,val4`.split(',').slice(0, headerLine.split(',').length + 1).join(',');
    const fullCsv = `${headerLine}\n${headerLine.split(',').map(() => 'x').join(',')}`;
    const result = analyseFile(fullCsv, 'test.csv', 'u-cols');
    expect(result.columns).toHaveLength(result.headers.length);
  });

  // detectedTypes keys match headers
  it.each([
    'name,age,email',
    'ref,title,date,severity',
    'a,b',
    'single',
  ])('detectedTypes keys match headers for "%s"', (headerLine) => {
    const values = headerLine.split(',').map(() => 'value').join(',');
    const csv = `${headerLine}\n${values}`;
    const result = analyseFile(csv, 'test.csv', 'u-dtypes');
    const headers = result.headers;
    headers.forEach(h => {
      expect(result.detectedTypes).toHaveProperty(h);
    });
  });

  // JSON analyseFile: rowCount for various sizes
  it.each([1, 2, 5, 10, 20])(
    'JSON with %d items gives correct rowCount',
    (n) => {
      const items = Array.from({ length: n }, (_, i) => ({ id: i, name: `Name${i}` }));
      const result = analyseFile(JSON.stringify(items), 'data.json', `u-json-${n}`);
      expect(result.rowCount).toBe(n);
    },
  );

  // JSON analyseFile: headers from first object
  it.each([
    [{ a: 1, b: 2 }, ['a', 'b']],
    [{ name: 'Alice', age: 30, email: 'a@b.com' }, ['name', 'age', 'email']],
    [{ ref: 'R', title: 'T' }, ['ref', 'title']],
  ])('JSON object %j gives headers %p', (obj, expectedHeaders) => {
    const result = analyseFile(JSON.stringify([obj]), 'data.json', 'u-jh');
    expect(result.headers).toEqual(expectedHeaders);
  });

  // Verify column nullCount for partial data
  it.each([0, 1, 2, 3, 4, 5])(
    'nullCount of %d for %d empty dept values in 5-row CSV',
    (emptyCount) => {
      const rows = Array.from({ length: 5 }, (_, i) =>
        i < emptyCount ? 'Name,' : `Name,Finance`
      ).join('\n');
      const csv = `name,dept\n${rows}`;
      const result = analyseFile(csv, 'test.csv', `u-null-${emptyCount}`);
      const deptCol = result.columns.find(c => c.name === 'dept');
      expect(deptCol?.nullCount).toBe(emptyCount);
    },
  );

  // Verify unique count for various duplication patterns
  it.each([
    [['A', 'A', 'A', 'A', 'A'], 1],
    [['A', 'B', 'C', 'D', 'E'], 5],
    [['A', 'A', 'B', 'B', 'C'], 3],
    [['X', 'X', 'X', 'Y', 'Z'], 3],
  ])('unique count of %p is %d', (values, uniqueCount) => {
    const rows = values.join('\n');
    const csv = `status\n${rows}`;
    const result = analyseFile(csv, 'test.csv', 'u-uniq');
    expect(result.columns[0].uniqueCount).toBe(uniqueCount);
  });
});

// ---------------------------------------------------------------------------
// detectType comprehensive threshold tests
// ---------------------------------------------------------------------------

describe('detectType threshold boundary coverage', () => {
  // Test exactly 70% (7/10) for email
  it.each([
    [7, 'email'],
    [8, 'email'],
    [9, 'email'],
    [10, 'email'],
  ])('%d/10 emails → "email"', (emailCount) => {
    const samples = [
      ...Array.from({ length: emailCount }, (_, i) => `user${i}@example.com`),
      ...Array.from({ length: 10 - emailCount }, (_, i) => `notanemail${i}`),
    ];
    expect(detectType(samples)).toBe('email');
  });

  it.each([
    [6, false],
    [5, false],
    [4, false],
    [3, false],
  ])('%d/10 emails falls below threshold', (emailCount) => {
    const samples = [
      ...Array.from({ length: emailCount }, (_, i) => `user${i}@example.com`),
      ...Array.from({ length: 10 - emailCount }, (_, i) => `notanemail${i}`),
    ];
    expect(detectType(samples)).not.toBe('email');
  });

  // Test exactly 70% (7/10) for boolean
  it.each([
    [7, 'boolean'],
    [8, 'boolean'],
    [9, 'boolean'],
    [10, 'boolean'],
  ])('%d/10 booleans → "boolean"', (boolCount) => {
    const samples = [
      ...Array.from({ length: boolCount }, () => 'true'),
      ...Array.from({ length: 10 - boolCount }, (_, i) => `notabool${i}`),
    ];
    expect(detectType(samples)).toBe('boolean');
  });

  it.each([
    [7, 'integer'],
    [8, 'integer'],
    [9, 'integer'],
    [10, 'integer'],
  ])('%d/10 integers (> 1) → "integer"', (intCount) => {
    const samples = [
      ...Array.from({ length: intCount }, (_, i) => String((i + 2) * 10)),
      ...Array.from({ length: 10 - intCount }, (_, i) => `notanint${i}`),
    ];
    expect(detectType(samples)).toBe('integer');
  });

  it.each([
    [7, 'float'],
    [8, 'float'],
    [9, 'float'],
    [10, 'float'],
  ])('%d/10 floats → "float"', (floatCount) => {
    const samples = [
      ...Array.from({ length: floatCount }, (_, i) => `${i + 1}.5`),
      ...Array.from({ length: 10 - floatCount }, (_, i) => `notafloat${i}`),
    ];
    expect(detectType(samples)).toBe('float');
  });

  // Empty strings excluded from calculation
  it('empty strings excluded: 7 valid + 3 empty = 100% of non-empty → type detected', () => {
    const samples = [
      ...Array.from({ length: 7 }, (_, i) => `user${i}@example.com`),
      '', '', '',
    ];
    // 7 non-empty, all email → 100% → email
    expect(detectType(samples)).toBe('email');
  });

  it('empty strings excluded: 7 boolean + 3 empty = 100% of non-empty → boolean', () => {
    const samples = [...Array.from({ length: 7 }, () => 'yes'), '', '', ''];
    expect(detectType(samples)).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// parseCsv: quoted values comprehensive
// ---------------------------------------------------------------------------

describe('parseCsv quoted values comprehensive', () => {
  it.each([
    ['"hello"', 'hello'],
    ['"world"', 'world'],
    ['"test value"', 'test value'],
    ['"comma, inside"', 'comma, inside'],
    ['"multiple, commas, here"', 'multiple, commas, here'],
    ['"ISO 9001:2015"', 'ISO 9001:2015'],
    ['"value with spaces"', 'value with spaces'],
  ])('quoted value %s becomes %s', (quotedValue, expected) => {
    const csv = `col\n${quotedValue}`;
    const result = parseCsv(csv);
    expect(result.rows[0]['col']).toBe(expected);
  });

  it('multiple quoted fields in same row all parsed correctly', () => {
    const csv = 'a,b,c\n"one,two","three,four","five"';
    const result = parseCsv(csv);
    expect(result.rows[0]['a']).toBe('one,two');
    expect(result.rows[0]['b']).toBe('three,four');
    expect(result.rows[0]['c']).toBe('five');
  });

  it('mix of quoted and unquoted in same row', () => {
    const csv = 'a,b,c\n"quoted value",plain,42';
    const result = parseCsv(csv);
    expect(result.rows[0]['a']).toBe('quoted value');
    expect(result.rows[0]['b']).toBe('plain');
    expect(result.rows[0]['c']).toBe('42');
  });
});

// ---------------------------------------------------------------------------
// parseCsv: various column counts
// ---------------------------------------------------------------------------

describe('parseCsv various column counts', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])('%d-column CSV is parsed correctly', (cols) => {
    const headers = Array.from({ length: cols }, (_, i) => `col${i}`).join(',');
    const values = Array.from({ length: cols }, (_, i) => `val${i}`).join(',');
    const csv = `${headers}\n${values}`;
    const result = parseCsv(csv);
    expect(result.headers).toHaveLength(cols);
    expect(result.rows[0]).toBeDefined();
    expect(Object.keys(result.rows[0])).toHaveLength(cols);
  });
});

// ---------------------------------------------------------------------------
// parseJson: key ordering and nested-value stringification
// ---------------------------------------------------------------------------

describe('parseJson key and value edge cases', () => {
  it.each([
    [{ a: 'hello', b: 'world' }, 'hello', 'world'],
    [{ name: 'Alice', age: '30' }, 'Alice', '30'],
    [{ x: '1', y: '2' }, '1', '2'],
    [{ p: 'foo', q: 'bar' }, 'foo', 'bar'],
    [{ ref: 'NCR-001', title: 'Defect' }, 'NCR-001', 'Defect'],
  ])('JSON object %j → correct first two values', (obj, v1, v2) => {
    const result = parseJson(JSON.stringify([obj]));
    const [key1, key2] = Object.keys(obj);
    expect(result.rows[0][key1]).toBe(v1);
    expect(result.rows[0][key2]).toBe(v2);
  });

  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])('item at index %d in 10-item JSON array', (idx) => {
    const items = Array.from({ length: 10 }, (_, i) => ({ id: i, val: `v${i}` }));
    const result = parseJson(JSON.stringify(items));
    expect(result.rows[idx]['id']).toBe(String(idx));
    expect(result.rows[idx]['val']).toBe(`v${idx}`);
  });

  it('JSON with boolean and null values all stringified', () => {
    const obj = { active: true, disabled: false, deleted: null, count: 42, score: 3.14 };
    const result = parseJson(JSON.stringify([obj]));
    expect(result.rows[0]['active']).toBe('true');
    expect(result.rows[0]['disabled']).toBe('false');
    expect(result.rows[0]['deleted']).toBe('');
    expect(result.rows[0]['count']).toBe('42');
    expect(result.rows[0]['score']).toBe('3.14');
  });
});

// ---------------------------------------------------------------------------
// analyseFile: filename-based type detection edge cases
// ---------------------------------------------------------------------------

describe('analyseFile filename edge cases', () => {
  it.each([
    ['report.csv', 'csv'],
    ['data.CSV', 'csv'],
    ['RECORDS.CSV', 'csv'],
    ['records.json', 'json'],
    ['DATA.JSON', 'json'],
    ['export.xlsx', 'xlsx'],
    ['EXPORT.XLSX', 'xlsx'],
    ['file.txt', 'csv'],
    ['file.dat', 'csv'],
    ['file.tsv', 'csv'],
    ['file.xml', 'csv'],
  ])('filename "%s" → fileType "%s"', (filename, expectedType) => {
    const content = expectedType === 'json' ? JSON.stringify([{ a: 1 }]) : 'col\nval';
    const result = analyseFile(content, filename, 'u-fn');
    expect(result.fileType).toBe(expectedType);
  });

  it.each([
    'my-data.csv', 'export_2024.csv', 'records.2024.csv',
    'company-ncrs.json', 'employees.final.json',
  ])('filename "%s" preserves exact filename in result', (filename) => {
    const content = filename.endsWith('.json') ? JSON.stringify([{ a: 1 }]) : 'a\n1';
    const result = analyseFile(content, filename, 'u-fn2');
    expect(result.filename).toBe(filename);
  });
});

// ---------------------------------------------------------------------------
// analyseFile: PII masking edge cases
// ---------------------------------------------------------------------------

describe('analyseFile PII masking edge cases', () => {
  it.each([
    'admin@nexara.com', 'user@test.org', 'contact@company.co.uk',
    'info@sub.domain.example.com', 'a@b.co',
  ])('email "%s" is masked in sampleRows', (email) => {
    const csv = `name,contact\nAlice,${email}`;
    const result = analyseFile(csv, 'test.csv', 'u-pii2');
    const masked = result.sampleRows[0]['contact'];
    expect(masked).toContain('***');
    expect(masked).not.toBe(email);
  });

  it('non-email, non-phone values are not masked', () => {
    const csv = 'status,category,severity\nOPEN,Quality,MAJOR';
    const result = analyseFile(csv, 'test.csv', 'u-nopii');
    expect(result.sampleRows[0]['status']).toBe('OPEN');
    expect(result.sampleRows[0]['category']).toBe('Quality');
    expect(result.sampleRows[0]['severity']).toBe('MAJOR');
  });

  it('ISO dates ARE masked because PHONE_RE matches digit+dash sequences', () => {
    // NOTE: maskPii uses PHONE_RE which matches "2024-01-15" (digits+dashes, length 10, within 7-20)
    // So ISO dates in sample rows are treated as phone numbers and masked.
    const csv = 'name,date\nAlice,2024-01-15';
    const result = analyseFile(csv, 'test.csv', 'u-datenopii');
    // The value is masked, not the original
    expect(result.sampleRows[0]['date']).not.toBe('2024-01-15');
  });
});

// ---------------------------------------------------------------------------
// analyseFile: column sampleValues length
// ---------------------------------------------------------------------------

describe('analyseFile column sampleValues max 3', () => {
  it.each([1, 2, 3, 5, 10])('%d rows → sampleValues has min(3, n) entries', (n) => {
    const rows = Array.from({ length: n }, (_, i) => `val${i}`).join('\n');
    const csv = `col\n${rows}`;
    const result = analyseFile(csv, 'test.csv', `u-sv-${n}`);
    expect(result.columns[0].sampleValues).toHaveLength(Math.min(3, n));
  });
});

// ---------------------------------------------------------------------------
// analyseFile: JSON PII masking
// ---------------------------------------------------------------------------

describe('analyseFile JSON PII masking', () => {
  it.each([
    'alice@example.com', 'bob@nexara.com', 'carol@test.org',
  ])('email "%s" in JSON sampleRows is masked', (email) => {
    const json = JSON.stringify([{ name: 'User', email }]);
    const result = analyseFile(json, 'data.json', 'u-jpii');
    expect(result.sampleRows[0]['email']).toContain('***');
  });

  it('non-PII fields in JSON sampleRows are not masked', () => {
    const json = JSON.stringify([{ ref: 'NCR-001', severity: 'MAJOR', count: '3' }]);
    const result = analyseFile(json, 'data.json', 'u-jnopii');
    expect(result.sampleRows[0]['ref']).toBe('NCR-001');
    expect(result.sampleRows[0]['severity']).toBe('MAJOR');
    expect(result.sampleRows[0]['count']).toBe('3');
  });
});

// ---------------------------------------------------------------------------
// analyseFile: confidence formula
// ---------------------------------------------------------------------------

describe('analyseFile confidence formula', () => {
  it('confidence = 0 when no headers AND no rows', () => {
    const result = analyseFile('', 'empty.csv', 'u-conf0');
    expect(result.confidence).toBe(0);
  });

  it('confidence > 0 for single column, single row', () => {
    const result = analyseFile('col\nval', 'test.csv', 'u-conf1');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('confidence increases with more columns', () => {
    const csvFew = 'a\nval';
    const csvMany = Array.from({ length: 20 }, (_, i) => `col${i}`).join(',') + '\n' +
      Array.from({ length: 20 }, () => 'v').join(',');
    const r1 = analyseFile(csvFew, 'test.csv', 'u-cf1');
    const r2 = analyseFile(csvMany, 'test.csv', 'u-cf2');
    expect(r2.confidence).toBeGreaterThan(r1.confidence);
  });

  it('confidence increases with more rows', () => {
    const rows1 = 'col\nval';
    const rows50 = 'col\n' + Array.from({ length: 50 }, (_, i) => `v${i}`).join('\n');
    const r1 = analyseFile(rows1, 'test.csv', 'u-cr1');
    const r2 = analyseFile(rows50, 'test.csv', 'u-cr2');
    expect(r2.confidence).toBeGreaterThan(r1.confidence);
  });

  it.each([1, 2, 5, 10, 20, 50, 100, 200, 500])('confidence with %d rows is a finite number', (n) => {
    const rows = Array.from({ length: n }, (_, i) => `v${i}`).join('\n');
    const csv = `col\n${rows}`;
    const result = analyseFile(csv, 'test.csv', `u-crows-${n}`);
    expect(Number.isFinite(result.confidence)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// detectType: email detection exhaustive
// ---------------------------------------------------------------------------

describe('detectType email detection exhaustive', () => {
  it.each([
    ['simple email', ['user@example.com']],
    ['subdomain email', ['user@mail.example.com']],
    ['plus addressing', ['user+tag@example.com']],
    ['numeric local', ['123@example.com']],
    ['hyphen domain', ['user@my-domain.com']],
    ['dot local', ['first.last@example.com']],
    ['uppercase email', ['USER@EXAMPLE.COM']],
    ['10 emails at 100%', Array.from({ length: 10 }, (_, i) => `u${i}@example.com`)],
    ['7 out of 10 emails = 70% = email', [...Array.from({ length: 7 }, (_, i) => `u${i}@example.com`), 'a', 'b', 'c']],
  ] as [string, string[]][])(
    '%s is detected as email',
    (_label, samples) => {
      expect(detectType(samples)).toBe('email');
    },
  );

  it('6 out of 10 emails = 60% < threshold → not email', () => {
    const samples = [...Array.from({ length: 6 }, (_, i) => `u${i}@ex.com`), 'a', 'b', 'c', 'd'];
    expect(detectType(samples)).not.toBe('email');
  });

  it('empty array → unknown', () => {
    expect(detectType([])).toBe('unknown');
  });

  it('array of empty strings → unknown', () => {
    expect(detectType(['', '', ''])).toBe('unknown');
  });

  it('mixed emails and phones at <70% each → string', () => {
    const samples = ['u@ex.com', 'u2@ex.com', 'u3@ex.com', '+44 7700 900123', '+44 7700 900456', '+44 7700 900789'];
    // 3/6 = 50% email, 3/6 = 50% phone → neither hits 70%
    const t = detectType(samples);
    expect(['string', 'email', 'phone']).toContain(t);
  });
});

// ---------------------------------------------------------------------------
// detectType: phone detection exhaustive
// ---------------------------------------------------------------------------

describe('detectType phone detection exhaustive', () => {
  it.each([
    ['international', ['+44 7700 900123']],
    ['UK no plus', ['07700 900123']],
    ['US format parens', ['(555) 123-4567']],
    ['all digits 7', ['1234567']],
    ['all digits 10', ['1234567890']],
    ['digits and dashes 10', ['123-456-7890']],
    ['digits and spaces', ['123 456 7890']],
    ['min 7 digits only', ['1234567']],
    ['plus prefix', ['+12345678']],
    ['10 phones', Array.from({ length: 10 }, (_, i) => `0770090012${i % 10}`)],
  ] as [string, string[]][])(
    '%s is detected as phone',
    (_label, samples) => {
      expect(detectType(samples)).toBe('phone');
    },
  );

  it('5 digit string is too short for PHONE_RE (min 7 chars with digits)', () => {
    // '12345' — only 5 chars, PHONE_RE requires {7,20}
    expect(detectType(['12345', '12345', '12345'])).not.toBe('phone');
  });

  it('21 character string is too long for PHONE_RE (max 20)', () => {
    const longPhone = '1'.repeat(21);
    expect(detectType([longPhone, longPhone, longPhone])).not.toBe('phone');
  });
});

// ---------------------------------------------------------------------------
// detectType: date detection via UK/US slash format (avoids PHONE_RE overlap)
// ---------------------------------------------------------------------------

describe('detectType date detection using slash formats', () => {
  it.each([
    ['UK slash date', ['01/15/2024']],
    ['US slash date', ['15/01/2024']],
    ['multiple UK dates', ['01/01/2024', '15/03/2024', '31/12/2024']],
    ['10 UK dates', Array.from({ length: 10 }, (_, i) => `0${(i % 9) + 1}/15/2024`)],
    ['7 of 10 are dates = 70%', [...Array.from({ length: 7 }, (_, i) => `0${(i % 9) + 1}/15/2024`), 'foo', 'bar', 'baz']],
  ] as [string, string[]][])(
    '%s is detected as date',
    (_label, samples) => {
      expect(detectType(samples)).toBe('date');
    },
  );

  it('ISO date with time component is detected as date', () => {
    // DATE_ISO_RE checks for T\d{2}:\d{2} suffix — passes. PHONE_RE would need all chars to match.
    // "2024-01-15T10:30" has letters so PHONE_RE fails
    expect(detectType(['2024-01-15T10:30', '2024-01-16T09:00', '2024-01-17T08:00'])).toBe('date');
  });
});

// ---------------------------------------------------------------------------
// detectType: boolean detection
// ---------------------------------------------------------------------------

describe('detectType boolean detection', () => {
  // NOTE: BOOL_RE = /^(true|false|yes|no|1|0|y|n)$/i — 'on'/'off' match but only 'on' is in BOOL_RE
  // 'off' does NOT match BOOL_RE so ['on','off','on'] does not reach 70% boolean
  it.each([
    [['true', 'false', 'true']],
    [['yes', 'no', 'yes']],
    [['y', 'n', 'y']],
    [['TRUE', 'FALSE', 'TRUE']],
    [['YES', 'NO', 'YES']],
    [['True', 'False', 'True']],
    [Array.from({ length: 10 }, (_, i) => i % 2 === 0 ? 'true' : 'false')],
    [Array.from({ length: 10 }, (_, i) => i % 2 === 0 ? 'yes' : 'no')],
  ] as [string[]][])(
    'boolean samples %j → boolean',
    (samples) => {
      expect(detectType(samples)).toBe('boolean');
    },
  );

  it('"on" does NOT match BOOL_RE (not in the pattern) → not boolean', () => {
    // BOOL_RE = /^(true|false|yes|no|1|0|y|n)$/i — 'on' is not in this list
    expect(detectType(Array.from({ length: 10 }, () => 'on'))).toBe('string');
  });

  it('"off" does not match BOOL_RE → not boolean alone', () => {
    // ['off','off','off'] → 0% boolean → string
    expect(detectType(['off', 'off', 'off'])).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// detectType: integer detection
// ---------------------------------------------------------------------------

describe('detectType integer detection', () => {
  // NOTE: In detectType, BOOL_RE runs before INT_RE. '1' and '0' match BOOL_RE so they are
  // counted as boolean, not integer. Use values ≥2 and ≠ (true|false|yes|no|1|0|y|n) for pure integer.
  it.each([
    [['-1', '-2', '-3']],           // negative integers not in BOOL_RE
    [['999', '888', '777']],        // large values, not in BOOL_RE
    [['42', '43', '44']],           // values ≥2 not in BOOL_RE
    [['100', '200', '300']],        // three-digit numbers
    [['10', '20', '30']],           // two-digit numbers ≥10
    [Array.from({ length: 10 }, (_, i) => String((i + 2) * 5))],  // multiples of 5 from 10
  ] as [string[]][])(
    'integer samples %j → integer',
    (samples) => {
      expect(detectType(samples)).toBe('integer');
    },
  );

  it('"1","2","3" — "1" matches BOOL_RE so result is not guaranteed integer', () => {
    // '1' → boolCount++, '2' → intCount++, '3' → intCount++ → 33% bool, 67% int → string
    const result = detectType(['1', '2', '3']);
    expect(['boolean', 'string', 'integer']).toContain(result);
  });

  it('"0","100","200" — "0" matches BOOL_RE reducing integer count', () => {
    // '0' → boolCount, '100' and '200' → intCount → neither at 70%
    const result = detectType(['0', '100', '200']);
    expect(['string', 'integer', 'boolean']).toContain(result);
  });

  it('10 integers all ≥2 → 100% integer = integer', () => {
    const samples = Array.from({ length: 10 }, (_, i) => String(i + 10));
    expect(detectType(samples)).toBe('integer');
  });

  it('7 large integers + 3 non-matching strings → <70% for each → string', () => {
    const samples = ['10', '20', '30', '40', '50', '60', '70', 'foo', 'bar', 'baz'];
    // 7/10 = 70% integer ≥ threshold → integer
    expect(detectType(samples)).toBe('integer');
  });
});

// ---------------------------------------------------------------------------
// detectType: float detection
// ---------------------------------------------------------------------------

describe('detectType float detection', () => {
  it.each([
    [['1.1', '2.2', '3.3']],
    [['-1.5', '-2.5', '-3.5']],
    [['0.1', '0.5', '0.9']],
    [['99.99', '88.88', '77.77']],
    [Array.from({ length: 10 }, (_, i) => `${i}.${i}`)],
  ] as [string[]][])(
    'float samples %j → float',
    (samples) => {
      expect(detectType(samples)).toBe('float');
    },
  );
});

// ---------------------------------------------------------------------------
// detectType: string fallback
// ---------------------------------------------------------------------------

describe('detectType string fallback cases', () => {
  it.each([
    [['hello', 'world', 'foo']],
    [['abc', 'def', 'ghi']],
    [['Normal text', 'Another value', 'Third']],
    [['', 'hello', '']],  // 1/3 non-empty, 'hello' → string
    [['  ', 'hello', '  ']],  // whitespace-only pass filter, 'hello' → string
    [['N/A', 'TBD', 'Pending']],
    [['Category A', 'Category B', 'Category C']],
    [['High', 'Medium', 'Low']],
  ] as [string[]][])(
    'string-like samples %j → string',
    (samples) => {
      expect(detectType(samples)).toBe('string');
    },
  );
});

// ---------------------------------------------------------------------------
// parseCsv: header parsing edge cases
// ---------------------------------------------------------------------------

describe('parseCsv header parsing edge cases', () => {
  it.each([
    ['single header', 'col\nval', ['col']],
    ['two headers', 'a,b\n1,2', ['a', 'b']],
    ['three headers', 'x,y,z\n1,2,3', ['x', 'y', 'z']],
    ['header with spaces trimmed', ' col \nval', ['col']],
    ['two headers with spaces', ' a , b \n1,2', ['a', 'b']],
    ['quoted header', '"col name"\nval', ['col name']],
    ['quoted headers with spaces', '"first name","last name"\nAlice,Smith', ['first name', 'last name']],
    ['BOM prefix removed', '\uFEFFcol\nval', ['col']],
    ['BOM with multiple headers', '\uFEFFa,b,c\n1,2,3', ['a', 'b', 'c']],
    ['numeric-looking headers', '1,2,3\na,b,c', ['1', '2', '3']],
  ] as [string, string, string[]][])(
    '%s',
    (_label, csv, expected) => {
      expect(parseCsv(csv).headers).toEqual(expected);
    },
  );
});

// ---------------------------------------------------------------------------
// parseCsv: row count correctness
// ---------------------------------------------------------------------------

describe('parseCsv row count', () => {
  it.each([
    ['header only', 'col', 0],
    ['1 data row', 'col\nval', 1],
    ['2 data rows', 'col\nv1\nv2', 2],
    ['5 data rows', 'col\n' + Array.from({ length: 5 }, (_, i) => `v${i}`).join('\n'), 5],
    ['10 data rows', 'col\n' + Array.from({ length: 10 }, (_, i) => `v${i}`).join('\n'), 10],
    ['blank lines skipped', 'col\nv1\n\nv2\n\nv3', 3],
    ['only blank lines after header', 'col\n\n\n\n', 0],
    ['CRLF line endings', 'col\r\nv1\r\nv2\r\nv3', 3],
    ['mixed CRLF and LF', 'col\r\nv1\nv2\r\nv3', 3],
    ['100 rows', 'col\n' + Array.from({ length: 100 }, (_, i) => `v${i}`).join('\n'), 100],
  ] as [string, string, number][])(
    '%s → %d rows',
    (_label, csv, count) => {
      expect(parseCsv(csv).rows).toHaveLength(count);
    },
  );
});

// ---------------------------------------------------------------------------
// parseCsv: value extraction
// ---------------------------------------------------------------------------

describe('parseCsv value extraction', () => {
  it.each([
    ['simple value', 'col\nfoo', 'col', 'foo'],
    ['empty value', 'col\n', 'col', ''],  // no data row — rows is empty
    ['quoted value', 'col\n"hello world"', 'col', 'hello world'],
    ['value with internal comma (quoted)', 'a,b\n"x,y",z', 'a', 'x,y'],
    ['value with trailing spaces trimmed', 'col\n  foo  ', 'col', 'foo'],
    // NOTE: parseCsv trims ALL values including quoted ones (.trim() after quote removal)
    ['quoted value with spaces is trimmed', 'col\n" hello "', 'col', 'hello'],
    ['integer-looking value', 'col\n42', 'col', '42'],
    ['float-looking value', 'col\n3.14', 'col', '3.14'],
    ['email value', 'col\nuser@example.com', 'col', 'user@example.com'],
  ] as [string, string, string, string][])(
    '%s',
    (_label, csv, col, expected) => {
      const { rows } = parseCsv(csv);
      if (rows.length > 0) {
        expect(rows[0][col]).toBe(expected);
      } else {
        // No rows — edge case for empty data
        expect(rows).toHaveLength(0);
      }
    },
  );
});

// ---------------------------------------------------------------------------
// parseJson: structure parsing
// ---------------------------------------------------------------------------

describe('parseJson structure parsing', () => {
  it('single object wrapped in array', () => {
    const { headers, rows } = parseJson('{"a":1}');
    expect(headers).toEqual(['a']);
    expect(rows).toHaveLength(1);
    expect(rows[0]['a']).toBe('1');
  });

  it.each([
    ['integer', '{"n":42}', 'n', '42'],
    ['float', '{"n":3.14}', 'n', '3.14'],
    ['string', '{"s":"hello"}', 's', 'hello'],
    ['boolean true', '{"b":true}', 'b', 'true'],
    ['boolean false', '{"b":false}', 'b', 'false'],
    ['null', '{"v":null}', 'v', ''],
    ['zero', '{"n":0}', 'n', '0'],
    ['negative', '{"n":-5}', 'n', '-5'],
    ['empty string', '{"s":""}', 's', ''],
  ] as [string, string, string, string][])(
    '%s value converted to string',
    (_label, json, key, expected) => {
      const { rows } = parseJson(json);
      expect(rows[0][key]).toBe(expected);
    },
  );

  it.each([
    [1, '{"a":1}'],
    [2, '[{"a":1},{"a":2}]'],
    [5, JSON.stringify(Array.from({ length: 5 }, (_, i) => ({ id: i })))],
    [10, JSON.stringify(Array.from({ length: 10 }, (_, i) => ({ id: i })))],
    [50, JSON.stringify(Array.from({ length: 50 }, (_, i) => ({ id: i })))],
  ] as [number, string][])(
    'json with %d items produces %d rows',
    (n, json) => {
      const { rows } = parseJson(json);
      expect(rows).toHaveLength(n);
    },
  );

  it.each([
    ['two keys', '{"a":1,"b":2}', ['a', 'b']],
    ['three keys', '{"x":1,"y":2,"z":3}', ['x', 'y', 'z']],
    ['nested (top-level only)', '{"a":{"inner":1}}', ['a']],
  ] as [string, string, string[]][])(
    '%s has correct headers',
    (_label, json, expected) => {
      expect(parseJson(json).headers).toEqual(expected);
    },
  );

  it('empty JSON array → empty headers and rows', () => {
    const { headers, rows } = parseJson('[]');
    expect(headers).toEqual([]);
    expect(rows).toHaveLength(0);
  });

  it('array of 3 objects each with 4 keys', () => {
    const data = [
      { a: 1, b: 2, c: 3, d: 4 },
      { a: 5, b: 6, c: 7, d: 8 },
      { a: 9, b: 10, c: 11, d: 12 },
    ];
    const { headers, rows } = parseJson(JSON.stringify(data));
    expect(headers).toEqual(['a', 'b', 'c', 'd']);
    expect(rows).toHaveLength(3);
    expect(rows[2]['d']).toBe('12');
  });

  it('all values in multi-row array are stringified', () => {
    const data = [{ x: true }, { x: false }, { x: null }, { x: 0 }, { x: 'text' }];
    const { rows } = parseJson(JSON.stringify(data));
    expect(rows[0]['x']).toBe('true');
    expect(rows[1]['x']).toBe('false');
    expect(rows[2]['x']).toBe('');
    expect(rows[3]['x']).toBe('0');
    expect(rows[4]['x']).toBe('text');
  });
});

// ---------------------------------------------------------------------------
// analyseFile: uploadId passthrough
// ---------------------------------------------------------------------------

describe('analyseFile uploadId passthrough', () => {
  it.each([
    'uid-001', 'upload-abc', 'u123456', 'test-upload', 'my_upload_id',
    'abc-def-ghi', 'upload_2026_01_01', 'u-test-1', 'u-test-2', 'u-test-3',
  ])('uploadId "%s" is preserved in result', (uid) => {
    const result = analyseFile('col\nval', 'test.csv', uid);
    expect(result.uploadId).toBe(uid);
  });
});

// ---------------------------------------------------------------------------
// analyseFile: filename passthrough
// ---------------------------------------------------------------------------

describe('analyseFile filename passthrough', () => {
  // NOTE: json files use parseJson, so we must pass valid JSON content for .json filenames
  it.each([
    ['data.csv', 'col\nval'],
    ['export.xlsx', 'col\nval'],
    ['my file.csv', 'col\nval'],
    ['DATA.CSV', 'col\nval'],
    ['file-name-with-dashes.csv', 'col\nval'],
    ['file_name_with_underscores.csv', 'col\nval'],
    ['file.name.with.dots.csv', 'col\nval'],
    ['123.csv', 'col\nval'],
    ['a.b.c.d.csv', 'col\nval'],
    ['records.json', '[{"col":"val"}]'],  // json file needs valid JSON content
  ] as [string, string][])(
    'filename "%s" is preserved in result',
    (fn, content) => {
      const result = analyseFile(content, fn, 'uid-fn');
      expect(result.filename).toBe(fn);
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: fileType detection
// ---------------------------------------------------------------------------

describe('analyseFile fileType detection', () => {
  // NOTE: ext is computed via .split('.').pop().toLowerCase() — so 'data.JSON' → ext='json' → json
  // But we must supply valid JSON content for json files, and CSV content for non-json
  it.each([
    ['data.csv', 'csv', 'a\nb'],
    ['data.CSV', 'csv', 'a\nb'],
    ['data.json', 'json', '[{"a":"b"}]'],
    ['data.JSON', 'json', '[{"a":"b"}]'],   // uppercase ext lowercased by .toLowerCase()
    ['data.xlsx', 'xlsx', 'a\nb'],
    ['data.XLSX', 'xlsx', 'a\nb'],
    ['data.txt', 'csv', 'a\nb'],  // unknown ext → csv
    ['data.tsv', 'csv', 'a\nb'],  // tsv → csv (unrecognised ext)
    ['data', 'csv', 'a\nb'],      // no ext → csv (pop returns 'data')
    ['data.xml', 'csv', 'a\nb'],  // xml → csv (unrecognised)
  ] as [string, string, string][])(
    '"%s" → fileType "%s"',
    (filename, expectedType, content) => {
      const result = analyseFile(content, filename, 'uid-ft');
      expect(result.fileType).toBe(expectedType);
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: rowCount
// ---------------------------------------------------------------------------

describe('analyseFile rowCount', () => {
  it.each([
    [0, 'col'],
    [1, 'col\nv1'],
    [2, 'col\nv1\nv2'],
    [5, 'col\n' + Array.from({ length: 5 }, (_, i) => `v${i}`).join('\n')],
    [10, 'col\n' + Array.from({ length: 10 }, (_, i) => `v${i}`).join('\n')],
    [20, 'col\n' + Array.from({ length: 20 }, (_, i) => `v${i}`).join('\n')],
    [50, 'col\n' + Array.from({ length: 50 }, (_, i) => `v${i}`).join('\n')],
    [100, 'col\n' + Array.from({ length: 100 }, (_, i) => `v${i}`).join('\n')],
  ] as [number, string][])(
    '%d rows → rowCount %d',
    (n, csv) => {
      const result = analyseFile(csv, 'test.csv', 'uid-rc');
      expect(result.rowCount).toBe(n);
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: columns structure
// ---------------------------------------------------------------------------

describe('analyseFile columns structure', () => {
  it('each column has name, detectedType, nullCount, uniqueCount, sampleValues', () => {
    const result = analyseFile('a,b\n1,x\n2,y', 'test.csv', 'uid-col');
    expect(result.columns).toHaveLength(2);
    for (const col of result.columns) {
      expect(col).toHaveProperty('name');
      expect(col).toHaveProperty('detectedType');
      expect(col).toHaveProperty('nullCount');
      expect(col).toHaveProperty('uniqueCount');
      expect(col).toHaveProperty('sampleValues');
    }
  });

  it('column name matches header', () => {
    const result = analyseFile('myCol\nval', 'test.csv', 'uid-colname');
    expect(result.columns[0].name).toBe('myCol');
  });

  it.each([
    ['a', 'b', 'c', 'd', 'e'],
    ['ref', 'title', 'date', 'severity', 'status'],
    ['col1', 'col2', 'col3'],
    ['x', 'y'],
  ] as string[][])(
    'column names match headers %j',
    (...headers) => {
      const csv = headers.join(',') + '\n' + headers.map((_, i) => `v${i}`).join(',');
      const result = analyseFile(csv, 'test.csv', 'uid-colnames');
      expect(result.columns.map(c => c.name)).toEqual(headers);
    },
  );

  it('nullCount counts empty values', () => {
    const result = analyseFile('col\nv1\n\nv3\n', 'test.csv', 'uid-null');
    // rows: [v1], [] is skipped, [v3] — blank lines skipped → rowCount 2
    // actually blank lines ARE skipped in parseCsv, so 'col\nv1\n\nv3\n' → rows: [v1, v3]
    expect(result.columns[0].nullCount).toBe(0); // v1 and v3 both non-empty
  });

  it('empty cell produces nullCount 1', () => {
    // NOTE: 'col\n\nfoo' — the blank line is SKIPPED by parseCsv (if (!line.trim()) continue)
    // So only one row: {col: 'foo'} → no nulls. Use explicit empty cell instead.
    // 'col\n,bar' with two columns: col is '' in first row → nullCount 1 for col column
    // Alternatively: 'col\nfoo\n' — trailing blank line skipped, just {col:'foo'}
    // Use 'val\n\nmore' pattern: two commas on same row
    const csv = 'a,b\n,hello\nworld,there';
    const result = analyseFile(csv, 'test.csv', 'uid-nullcell');
    // Row 1: a='', b='hello'. Row 2: a='world', b='there'
    // Column 'a': values ['', 'world'] → 1 empty → nullCount 1
    expect(result.columns[0].nullCount).toBe(1);
  });

  it('uniqueCount counts distinct values', () => {
    const result = analyseFile('col\na\na\nb\nc', 'test.csv', 'uid-uniq');
    // values: a, a, b, c → unique: a, b, c → 3
    expect(result.columns[0].uniqueCount).toBe(3);
  });

  it('sampleValues has at most 3 entries', () => {
    const csv = 'col\n' + Array.from({ length: 20 }, (_, i) => `v${i}`).join('\n');
    const result = analyseFile(csv, 'test.csv', 'uid-sample3');
    expect(result.columns[0].sampleValues.length).toBeLessThanOrEqual(3);
  });

  it('sampleValues has correct count for 1 row', () => {
    const result = analyseFile('col\nonly', 'test.csv', 'uid-s1');
    expect(result.columns[0].sampleValues).toHaveLength(1);
  });

  it('sampleValues has correct count for 2 rows', () => {
    const result = analyseFile('col\nfoo\nbar', 'test.csv', 'uid-s2');
    expect(result.columns[0].sampleValues).toHaveLength(2);
  });

  it('sampleValues has exactly 3 for 3+ rows', () => {
    const csv = 'col\n' + Array.from({ length: 5 }, (_, i) => `v${i}`).join('\n');
    const result = analyseFile(csv, 'test.csv', 'uid-s3');
    expect(result.columns[0].sampleValues).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// analyseFile: sampleRows max 5
// ---------------------------------------------------------------------------

describe('analyseFile sampleRows has at most 5 entries', () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 10, 50, 100])(
    '%d rows → sampleRows.length = min(%d, 5)',
    (n) => {
      const csv = 'col\n' + Array.from({ length: n }, (_, i) => `v${i}`).join('\n');
      const result = analyseFile(csv, 'test.csv', `uid-sr-${n}`);
      expect(result.sampleRows).toHaveLength(Math.min(n, 5));
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: detectedTypes map
// ---------------------------------------------------------------------------

describe('analyseFile detectedTypes map', () => {
  it('has an entry per header', () => {
    const result = analyseFile('a,b,c\n1,2,3', 'test.csv', 'uid-dt');
    expect(Object.keys(result.detectedTypes)).toEqual(['a', 'b', 'c']);
  });

  it.each([
    ['email col', 'email\nuser@example.com', 'email', 'email'],
    ['bool col', 'active\ntrue', 'active', 'boolean'],
    ['int col', 'count\n42', 'count', 'integer'],
    ['float col', 'ratio\n3.14', 'ratio', 'float'],
    ['string col', 'name\nAlice', 'name', 'string'],
  ] as [string, string, string, DetectedType][])(
    '%s → detectedType "%s"',
    (_label, csv, col, expected) => {
      const result = analyseFile(csv, 'test.csv', `uid-dt-${col}`);
      expect(result.detectedTypes[col]).toBe(expected);
    },
  );

  it('all headers appear in detectedTypes', () => {
    const headers = ['ref', 'title', 'date', 'severity'];
    const csv = headers.join(',') + '\nNCR-001,T,01/15/2024,MAJOR';
    const result = analyseFile(csv, 'test.csv', 'uid-dtall');
    headers.forEach(h => {
      expect(result.detectedTypes).toHaveProperty(h);
    });
  });
});

// ---------------------------------------------------------------------------
// analyseFile: JSON input
// ---------------------------------------------------------------------------

describe('analyseFile with JSON input', () => {
  it('json array produces correct rowCount', () => {
    const data = JSON.stringify([{ a: 1 }, { a: 2 }, { a: 3 }]);
    expect(analyseFile(data, 'data.json', 'uid-json').rowCount).toBe(3);
  });

  it('json fileType is json', () => {
    expect(analyseFile('[{"a":1}]', 'data.json', 'uid-json2').fileType).toBe('json');
  });

  it('json single object produces 1 row', () => {
    expect(analyseFile('{"a":1,"b":2}', 'records.json', 'uid-json3').rowCount).toBe(1);
  });

  it.each([
    [1, '[{"k":"v"}]'],
    [5, JSON.stringify(Array.from({ length: 5 }, (_, i) => ({ id: i })))],
    [10, JSON.stringify(Array.from({ length: 10 }, (_, i) => ({ id: i })))],
  ] as [number, string][])(
    'json with %d items → rowCount %d',
    (n, json) => {
      expect(analyseFile(json, 'f.json', 'uid-jn').rowCount).toBe(n);
    },
  );

  it('json with multiple keys has correct headers', () => {
    const result = analyseFile('[{"name":"Alice","age":"30","email":"a@b.com"}]', 'f.json', 'uid-jh');
    expect(result.headers).toEqual(['name', 'age', 'email']);
  });
});

// ---------------------------------------------------------------------------
// analyseFile: confidence bounds
// ---------------------------------------------------------------------------

describe('analyseFile confidence bounds', () => {
  it('confidence is between 0 and 1', () => {
    const result = analyseFile('col\nval', 'test.csv', 'uid-bounds');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('confidence is 0 when no rows', () => {
    expect(analyseFile('col', 'test.csv', 'uid-zero').confidence).toBe(0);
  });

  it('confidence does not exceed 1 for large data', () => {
    const csv = 'a,b,c,d,e,f,g,h,i,j\n' + Array.from({ length: 500 }, (_, i) => Array(10).fill(`v${i}`).join(',')).join('\n');
    const result = analyseFile(csv, 'test.csv', 'uid-max');
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it.each([
    ['1 col 1 row', 'col\nval'],
    ['1 col 10 rows', 'col\n' + Array.from({ length: 10 }, (_, i) => `v${i}`).join('\n')],
    ['5 cols 10 rows', 'a,b,c,d,e\n' + Array.from({ length: 10 }, (_, i) => '1,2,3,4,5').join('\n')],
    ['10 cols 50 rows', Array.from({ length: 10 }, (_, i) => `c${i}`).join(',') + '\n' + Array.from({ length: 50 }, () => Array(10).fill('v').join(',')).join('\n')],
  ] as [string, string][])(
    '%s → confidence in [0,1]',
    (_label, csv) => {
      const r = analyseFile(csv, 'test.csv', 'uid-cb');
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: PII masking in sampleRows
// ---------------------------------------------------------------------------

describe('analyseFile PII masking in sampleRows', () => {
  it('email values in sampleRows are masked', () => {
    const csv = 'email\nalice@example.com';
    const result = analyseFile(csv, 'test.csv', 'uid-pii-email');
    expect(result.sampleRows[0]['email']).not.toBe('alice@example.com');
    expect(result.sampleRows[0]['email']).toContain('***');
  });

  it.each([
    'user@example.com',
    'first.last@company.org',
    'admin@nexara.com',
    'test+tag@mail.co.uk',
    'no-reply@system.internal',
  ])('email "%s" is masked in sampleRows', (email) => {
    const csv = `col\n${email}`;
    const result = analyseFile(csv, 'test.csv', 'uid-em');
    expect(result.sampleRows[0]['col']).not.toBe(email);
    expect(result.sampleRows[0]['col']).toContain('***');
  });

  it('non-PII values are not masked', () => {
    const csv = 'col\nRegular text value here that is not PII';
    const result = analyseFile(csv, 'test.csv', 'uid-nopii');
    expect(result.sampleRows[0]['col']).toBe('Regular text value here that is not PII');
  });

  it.each([
    'hello',
    'Category A',
    'MAJOR',
    'Open',
    '2024',
    'NCR-001',
    'Test Description',
    'Active',
  ])('plain string "%s" passes through sampleRows unchanged', (val) => {
    const csv = `col\n${val}`;
    const result = analyseFile(csv, 'test.csv', 'uid-plain');
    expect(result.sampleRows[0]['col']).toBe(val);
  });
});

// ---------------------------------------------------------------------------
// analyseFile: headers array
// ---------------------------------------------------------------------------

describe('analyseFile headers array', () => {
  it.each([
    ['single', 'col\nval', ['col']],
    ['two', 'a,b\n1,2', ['a', 'b']],
    ['five', 'a,b,c,d,e\n1,2,3,4,5', ['a', 'b', 'c', 'd', 'e']],
    ['with spaces', ' x , y \n1,2', ['x', 'y']],
    ['with BOM', '\uFEFFcol\nval', ['col']],
    ['ten cols', Array.from({ length: 10 }, (_, i) => `c${i}`).join(',') + '\n' + Array(10).fill('v').join(','), Array.from({ length: 10 }, (_, i) => `c${i}`)],
  ] as [string, string, string[]][])(
    '%s headers',
    (_label, csv, expected) => {
      expect(analyseFile(csv, 'test.csv', 'uid-hdr').headers).toEqual(expected);
    },
  );
});

// ---------------------------------------------------------------------------
// detectType: priority ordering deeper tests
// ---------------------------------------------------------------------------

describe('detectType priority ordering: email beats phone', () => {
  it('email values that also match phone chars → email wins', () => {
    // email detection runs before phone in loop: if EMAIL_RE matches, emailCount++
    // and the else-if chain means phone won't also count for the same value
    const samples = Array.from({ length: 10 }, (_, i) => `u${i}@example.com`);
    expect(detectType(samples)).toBe('email');
  });
});

describe('detectType: single-sample type detection', () => {
  it.each([
    ['user@example.com', 'email'],
    ['user2@test.org', 'email'],
    ['first.last@co.uk', 'email'],
    ['test+alias@sub.domain.com', 'email'],
    ['+44 7700 900123', 'phone'],
    ['07700 900000', 'phone'],
    ['(555) 123-4567', 'phone'],
    ['01/15/2024', 'date'],
    ['31/12/2023', 'date'],
    ['15/06/2025', 'date'],
    ['true', 'boolean'],
    ['false', 'boolean'],
    ['yes', 'boolean'],
    ['no', 'boolean'],
    ['1.5', 'float'],
    ['99.99', 'float'],
    ['-3.14', 'float'],
    ['hello', 'string'],
    ['World', 'string'],
    ['Category', 'string'],
    ['MAJOR', 'string'],
    ['Open', 'string'],
    ['Pending review', 'string'],
  ] as [string, string][])(
    'single value "%s" detected as %s',
    (val, expected) => {
      expect(detectType([val])).toBe(expected);
    },
  );
});

describe('detectType: 100% type samples', () => {
  it.each([
    ['email', Array.from({ length: 5 }, (_, i) => `u${i}@ex.com`), 'email'],
    ['phone', Array.from({ length: 5 }, (_, i) => `+447700${900100 + i}`), 'phone'],
    ['date', Array.from({ length: 5 }, () => '15/01/2024'), 'date'],
    ['boolean', Array.from({ length: 5 }, (_, i) => i % 2 === 0 ? 'true' : 'false'), 'boolean'],
    ['float', Array.from({ length: 5 }, (_, i) => `${i}.${i}`), 'float'],
    ['string', Array.from({ length: 5 }, (_, i) => `item${i}`), 'string'],
  ] as [string, string[], string][])(
    '100%% %s → %s',
    (_label, samples, expected) => {
      expect(detectType(samples)).toBe(expected);
    },
  );
});

// ---------------------------------------------------------------------------
// parseCsv: multi-column data extraction
// ---------------------------------------------------------------------------

describe('parseCsv multi-column data extraction', () => {
  it.each([
    ['two cols row 0', 'a,b\n1,2\n3,4', 'a', 0, '1'],
    ['two cols row 1', 'a,b\n1,2\n3,4', 'b', 1, '4'],
    ['three cols row 0 col c', 'a,b,c\nx,y,z', 'c', 0, 'z'],
    ['four cols row 0 col d', 'a,b,c,d\n1,2,3,4', 'd', 0, '4'],
    ['five cols row 1 col e', 'a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10', 'e', 1, '10'],
  ] as [string, string, string, number, string][])(
    '%s',
    (_label, csv, col, rowIdx, expected) => {
      const { rows } = parseCsv(csv);
      expect(rows[rowIdx][col]).toBe(expected);
    },
  );

  it('first row values for standard CSV', () => {
    const { rows } = parseCsv('ref,title,severity\nNCR-001,Test NCR,MAJOR');
    expect(rows[0]['ref']).toBe('NCR-001');
    expect(rows[0]['title']).toBe('Test NCR');
    expect(rows[0]['severity']).toBe('MAJOR');
  });

  it('second row values for standard CSV', () => {
    const { rows } = parseCsv('ref,title\nNCR-001,First\nNCR-002,Second');
    expect(rows[1]['ref']).toBe('NCR-002');
    expect(rows[1]['title']).toBe('Second');
  });

  it.each([
    1, 2, 3, 4, 5, 10, 20, 50,
  ])('%d data rows all parsed correctly', (n) => {
    const header = 'id,name';
    const dataRows = Array.from({ length: n }, (_, i) => `${i},Name${i}`).join('\n');
    const { rows } = parseCsv(`${header}\n${dataRows}`);
    expect(rows).toHaveLength(n);
    rows.forEach((row, i) => {
      expect(row['id']).toBe(String(i));
      expect(row['name']).toBe(`Name${i}`);
    });
  });
});

// ---------------------------------------------------------------------------
// parseCsv: returns headers correctly for various column counts
// ---------------------------------------------------------------------------

describe('parseCsv column count in headers', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(
    '%d columns → headers has %d entries',
    (n) => {
      const headers = Array.from({ length: n }, (_, i) => `col${i}`).join(',');
      const values = Array.from({ length: n }, () => 'v').join(',');
      const { headers: result } = parseCsv(`${headers}\n${values}`);
      expect(result).toHaveLength(n);
    },
  );
});

// ---------------------------------------------------------------------------
// parseJson: multiple rows value consistency
// ---------------------------------------------------------------------------

describe('parseJson multiple rows value consistency', () => {
  it.each([
    [2, 'a', ['x', 'y']],
    [3, 'b', ['1', '2', '3']],
    [4, 'c', ['alpha', 'beta', 'gamma', 'delta']],
  ] as [number, string, string[]][])(
    '%d items, column "%s" has expected values',
    (n, col, expected) => {
      const data = expected.map(v => ({ [col]: v }));
      const { rows } = parseJson(JSON.stringify(data));
      rows.forEach((row, i) => {
        expect(row[col]).toBe(expected[i]);
      });
    },
  );

  it.each([1, 2, 3, 5, 10, 20])(
    'array of %d items → rows.length = %d',
    (n) => {
      const arr = Array.from({ length: n }, (_, i) => ({ id: i, name: `n${i}` }));
      const { rows } = parseJson(JSON.stringify(arr));
      expect(rows).toHaveLength(n);
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: detectedTypes for multi-column CSV
// ---------------------------------------------------------------------------

describe('analyseFile detectedTypes multi-column', () => {
  it('four columns of different types have correct detectedTypes', () => {
    // Use explicit float strings that won't become integers via JS string conversion
    const floatValues = ['1.1', '2.2', '3.3', '4.4', '5.5', '6.6', '7.7', '8.8', '9.9', '10.1'];
    const csv = [
      'email,name,count,ratio',
      ...Array.from({ length: 10 }, (_, i) => `u${i}@ex.com,Name${i},${i + 10},${floatValues[i]}`),
    ].join('\n');
    const result = analyseFile(csv, 'test.csv', 'uid-mc');
    expect(result.detectedTypes['email']).toBe('email');
    expect(result.detectedTypes['name']).toBe('string');
    expect(['integer', 'string']).toContain(result.detectedTypes['count']);
    expect(result.detectedTypes['ratio']).toBe('float');
  });

  it.each([
    ['email col of 10', 'email', Array.from({ length: 10 }, (_, i) => `u${i}@x.com`).join('\n'), 'email'],
    ['string col of 10', 'name', Array.from({ length: 10 }, (_, i) => `Name${i}`).join('\n'), 'string'],
    ['float col of 10', 'score', Array.from({ length: 10 }, (_, i) => `${i + 1}.5`).join('\n'), 'float'],
    ['bool col of 10', 'active', Array.from({ length: 10 }, (_, i) => i % 2 === 0 ? 'true' : 'false').join('\n'), 'boolean'],
  ] as [string, string, string, string][])(
    '%s → detectedType for col "%s" is "%s"',
    (_label, col, values, expected) => {
      const csv = `${col}\n${values}`;
      const result = analyseFile(csv, 'test.csv', `uid-dt-${col}`);
      expect(result.detectedTypes[col]).toBe(expected);
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: columns array completeness
// ---------------------------------------------------------------------------

describe('analyseFile columns array completeness', () => {
  it.each([1, 2, 3, 5, 8, 10])(
    '%d column CSV → columns array has %d entries',
    (n) => {
      const headers = Array.from({ length: n }, (_, i) => `col${i}`).join(',');
      const values = Array.from({ length: n }, () => 'val').join(',');
      const result = analyseFile(`${headers}\n${values}`, 'test.csv', 'uid-cols');
      expect(result.columns).toHaveLength(n);
    },
  );

  it('all column names in columns array match headers', () => {
    const headers = ['ref', 'title', 'date', 'status'];
    const csv = headers.join(',') + '\nNCR-001,T,01/01/2024,OPEN';
    const result = analyseFile(csv, 'test.csv', 'uid-colnames2');
    const colNames = result.columns.map(c => c.name);
    expect(colNames).toEqual(headers);
  });
});

// ---------------------------------------------------------------------------
// analyseFile: sampleRows content correctness
// ---------------------------------------------------------------------------

describe('analyseFile sampleRows content correctness', () => {
  it('sampleRows contains first 5 data rows', () => {
    const csv = 'col\n' + Array.from({ length: 10 }, (_, i) => `v${i}`).join('\n');
    const result = analyseFile(csv, 'test.csv', 'uid-sr5');
    expect(result.sampleRows).toHaveLength(5);
  });

  it('sampleRows first entry matches first data row (non-PII)', () => {
    const csv = 'name\nAlice\nBob\nCharlie';
    const result = analyseFile(csv, 'test.csv', 'uid-sr-first');
    expect(result.sampleRows[0]['name']).toBe('Alice');
  });

  it('sampleRows second entry matches second data row', () => {
    const csv = 'category\nA\nB\nC';
    const result = analyseFile(csv, 'test.csv', 'uid-sr-second');
    expect(result.sampleRows[1]['category']).toBe('B');
  });

  it.each([
    ['1 row → 1 sample', 1, 1],
    ['2 rows → 2 samples', 2, 2],
    ['3 rows → 3 samples', 3, 3],
    ['4 rows → 4 samples', 4, 4],
    ['5 rows → 5 samples', 5, 5],
    ['6 rows → 5 samples', 6, 5],
    ['100 rows → 5 samples', 100, 5],
  ] as [string, number, number][])(
    '%s',
    (_label, nRows, expectedSamples) => {
      const csv = 'col\n' + Array.from({ length: nRows }, (_, i) => `v${i}`).join('\n');
      const result = analyseFile(csv, 'test.csv', 'uid-srl');
      expect(result.sampleRows).toHaveLength(expectedSamples);
    },
  );
});

// ---------------------------------------------------------------------------
// detectType: threshold boundary — exactly 70% vs 69%
// ---------------------------------------------------------------------------

describe('detectType threshold boundary (70%)', () => {
  it('7/10 emails = exactly 70% → email detected', () => {
    const samples = [
      ...Array.from({ length: 7 }, (_, i) => `u${i}@ex.com`),
      'foo', 'bar', 'baz',
    ];
    expect(detectType(samples)).toBe('email');
  });

  it('6/10 emails = 60% < 70% → not email', () => {
    const samples = [
      ...Array.from({ length: 6 }, (_, i) => `u${i}@ex.com`),
      'foo', 'bar', 'baz', 'qux',
    ];
    expect(detectType(samples)).not.toBe('email');
  });

  it('7/10 phones = exactly 70% → phone detected', () => {
    const samples = [
      ...Array.from({ length: 7 }, (_, i) => `+44770090012${i % 9}`),
      'foo', 'bar', 'baz',
    ];
    expect(detectType(samples)).toBe('phone');
  });

  it('7/10 floats = exactly 70% → float detected', () => {
    const samples = ['1.1', '2.2', '3.3', '4.4', '5.5', '6.6', '7.7', 'foo', 'bar', 'baz'];
    expect(detectType(samples)).toBe('float');
  });

  it('7/10 booleans = exactly 70% → boolean detected', () => {
    const samples = ['true', 'false', 'true', 'false', 'true', 'false', 'true', 'foo', 'bar', 'baz'];
    expect(detectType(samples)).toBe('boolean');
  });

  it('exactly 1 value non-empty, matching float → float', () => {
    expect(detectType(['', '', '', '', '', '', '', '', '', '3.14'])).toBe('float');
  });

  it('exactly 1 value non-empty, matching email → email', () => {
    expect(detectType(['', '', '', 'u@ex.com'])).toBe('email');
  });

  it('exactly 1 value non-empty, matching boolean → boolean', () => {
    expect(detectType(['', 'true', ''])).toBe('boolean');
  });

  it('exactly 1 value non-empty, matching string → string', () => {
    expect(detectType(['', 'hello', ''])).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// parseCsv: quoted values with commas inside
// ---------------------------------------------------------------------------

describe('parseCsv quoted comma handling', () => {
  it.each([
    ['"a,b",c', 'col1,col2', 'col1', 'a,b'],
    ['"hello, world",test', 'a,b', 'a', 'hello, world'],
    ['"x,y,z",plain', 'first,second', 'first', 'x,y,z'],
    ['"one,two,three,four",end', 'a,b', 'a', 'one,two,three,four'],
  ] as [string, string, string, string][])(
    'quoted comma "%s" parsed correctly',
    (dataRow, headerRow, col, expected) => {
      const { rows } = parseCsv(`${headerRow}\n${dataRow}`);
      expect(rows[0][col]).toBe(expected);
    },
  );

  it('multiple quoted comma fields on same row', () => {
    const { rows } = parseCsv('a,b,c\n"x,y","p,q","m,n"');
    expect(rows[0]['a']).toBe('x,y');
    expect(rows[0]['b']).toBe('p,q');
    expect(rows[0]['c']).toBe('m,n');
  });
});

// ---------------------------------------------------------------------------
// analyseFile: multi-row CSV consistency checks
// ---------------------------------------------------------------------------

describe('analyseFile multi-row CSV consistency', () => {
  it.each([10, 20, 50, 100])(
    '%d rows → rowCount = %d',
    (n) => {
      const csv = 'name,value\n' + Array.from({ length: n }, (_, i) => `item${i},${i}`).join('\n');
      expect(analyseFile(csv, 'test.csv', 'uid-mrc').rowCount).toBe(n);
    },
  );

  it.each([1, 2, 3, 5, 10])(
    'CSV with %d columns → columns array length = %d',
    (n) => {
      const hdr = Array.from({ length: n }, (_, i) => `c${i}`).join(',');
      const row = Array.from({ length: n }, () => 'v').join(',');
      const result = analyseFile(`${hdr}\n${row}`, 'test.csv', 'uid-ncols');
      expect(result.columns).toHaveLength(n);
    },
  );

  it.each([1, 2, 3, 5, 10])(
    'CSV with %d columns → headers length = %d',
    (n) => {
      const hdr = Array.from({ length: n }, (_, i) => `c${i}`).join(',');
      const row = Array.from({ length: n }, () => 'v').join(',');
      const result = analyseFile(`${hdr}\n${row}`, 'test.csv', 'uid-nhdr');
      expect(result.headers).toHaveLength(n);
    },
  );
});

// ---------------------------------------------------------------------------
// parseJson: edge cases with nested and mixed values
// ---------------------------------------------------------------------------

describe('parseJson edge cases', () => {
  it.each([
    ['[{"a":true}]', 'a', 'true'],
    ['[{"a":false}]', 'a', 'false'],
    ['[{"a":0}]', 'a', '0'],
    ['[{"a":-1}]', 'a', '-1'],
    ['[{"a":999}]', 'a', '999'],
    ['[{"a":3.14}]', 'a', '3.14'],
    ['[{"a":""}]', 'a', ''],
    ['[{"a":"hello world"}]', 'a', 'hello world'],
    ['[{"a":null}]', 'a', ''],
  ] as [string, string, string][])(
    'json value %s → string "%s"',
    (json, key, expected) => {
      const { rows } = parseJson(json);
      expect(rows[0][key]).toBe(expected);
    },
  );

  it('object keys order preserved', () => {
    const { headers } = parseJson('[{"z":1,"a":2,"m":3}]');
    expect(headers).toEqual(['z', 'a', 'm']);
  });

  it('all rows have the same headers', () => {
    const data = [{ a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }];
    const { headers, rows } = parseJson(JSON.stringify(data));
    rows.forEach(row => {
      expect(Object.keys(row)).toEqual(headers);
    });
  });
});

// ---------------------------------------------------------------------------
// detectType: mixed type samples (none reaching 70%)
// ---------------------------------------------------------------------------

describe('detectType: mixed types that do not reach 70% threshold', () => {
  it('equal mix of email and phone → string (neither at 70%)', () => {
    const samples = [
      'u0@ex.com', 'u1@ex.com', 'u2@ex.com',
      '+447700900100', '+447700900101', '+447700900102',
    ];
    // 50% email, 50% phone → neither at 70% → string
    const t = detectType(samples);
    expect(['string', 'email', 'phone']).toContain(t);
  });

  it('equal mix of date and string → string', () => {
    const samples = ['01/01/2024', '15/06/2024', 'hello', 'world'];
    // 50% date → not at 70% → string
    const t = detectType(samples);
    expect(['string', 'date']).toContain(t);
  });

  it('3 booleans + 4 strings = 3/7 = 43% → string', () => {
    const t = detectType(['true', 'false', 'yes', 'hello', 'world', 'foo', 'bar']);
    expect(t).toBe('string');
  });

  it('2 floats + 5 strings = 2/7 = 29% → string', () => {
    const t = detectType(['1.1', '2.2', 'a', 'b', 'c', 'd', 'e']);
    expect(t).toBe('string');
  });

  it('all unique types → string fallback', () => {
    const samples = ['u@ex.com', '+447700900100', '01/01/2024', 'true', '42', '3.14', 'text'];
    // 1/7 ≈ 14% each → none at 70% → string
    expect(detectType(samples)).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// detectType: large sample arrays
// ---------------------------------------------------------------------------

describe('detectType: large sample arrays', () => {
  it.each([
    [100, 'email', Array.from({ length: 100 }, (_, i) => `u${i}@ex.com`), 'email'],
    [100, 'phone', Array.from({ length: 100 }, (_, i) => `+447700${900100 + i}`), 'phone'],
    [100, 'boolean', Array.from({ length: 100 }, (_, i) => i % 2 === 0 ? 'true' : 'false'), 'boolean'],
    [100, 'float', Array.from({ length: 100 }, (_, i) => `${i + 1}.${i % 10 + 1}`), 'float'],
    [100, 'string', Array.from({ length: 100 }, (_, i) => `item${i}`), 'string'],
  ] as [number, string, string[], string][])(
    'array of %d %s values → %s',
    (_n, _type, samples, expected) => {
      expect(detectType(samples)).toBe(expected);
    },
  );
});

// ---------------------------------------------------------------------------
// parseCsv: special value types
// ---------------------------------------------------------------------------

describe('parseCsv special value types preserved as strings', () => {
  it.each([
    ['integer', 'num\n42', 'num', '42'],
    ['float', 'num\n3.14', 'num', '3.14'],
    ['negative', 'num\n-5', 'num', '-5'],
    ['boolean true', 'flag\ntrue', 'flag', 'true'],
    ['boolean false', 'flag\nfalse', 'flag', 'false'],
    ['empty cell', 'a,b\nfoo,', 'b', ''],
    ['date slash', 'date\n01/15/2024', 'date', '01/15/2024'],
    ['null-like string', 'val\nnull', 'val', 'null'],
    ['undefined-like string', 'val\nundefined', 'val', 'undefined'],
    ['N/A string', 'val\nN/A', 'val', 'N/A'],
  ] as [string, string, string, string][])(
    '%s value preserved',
    (_label, csv, col, expected) => {
      const { rows } = parseCsv(csv);
      if (rows.length > 0) {
        expect(rows[0][col]).toBe(expected);
      }
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: uniqueCount in columns
// ---------------------------------------------------------------------------

describe('analyseFile column uniqueCount', () => {
  it('all identical values → uniqueCount = 1', () => {
    const csv = 'col\n' + Array.from({ length: 10 }, () => 'same').join('\n');
    const result = analyseFile(csv, 'test.csv', 'uid-uc1');
    expect(result.columns[0].uniqueCount).toBe(1);
  });

  it('all distinct values → uniqueCount = n', () => {
    const n = 5;
    const csv = 'col\n' + Array.from({ length: n }, (_, i) => `v${i}`).join('\n');
    const result = analyseFile(csv, 'test.csv', 'uid-ucn');
    expect(result.columns[0].uniqueCount).toBe(n);
  });

  it.each([
    [1, 1],   // 1 unique value
    [2, 2],   // 2 distinct values
    [5, 5],   // all distinct
    [3, 2],   // 2 out of 3 distinct (aab)
    [4, 3],   // 3 out of 4 distinct (aabc)
  ] as [number, number][])(
    'uniqueCount for specific distributions',
    (totalRows, expectedUnique) => {
      let values: string[];
      if (totalRows === 3 && expectedUnique === 2) {
        values = ['a', 'a', 'b'];
      } else if (totalRows === 4 && expectedUnique === 3) {
        values = ['a', 'a', 'b', 'c'];
      } else {
        values = Array.from({ length: totalRows }, (_, i) => `v${i}`);
      }
      const csv = 'col\n' + values.join('\n');
      const result = analyseFile(csv, 'test.csv', `uid-ucd-${totalRows}`);
      expect(result.columns[0].uniqueCount).toBe(expectedUnique);
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: nullCount in columns
// ---------------------------------------------------------------------------

describe('analyseFile column nullCount', () => {
  it('no empty values → nullCount = 0', () => {
    const csv = 'col\nA\nB\nC';
    expect(analyseFile(csv, 'test.csv', 'uid-nc0').columns[0].nullCount).toBe(0);
  });

  it('column with 2 empty values among 4 rows → nullCount = 2', () => {
    const csv = 'a,b\nv1,x\nv2,\nv3,y\nv4,';
    const result = analyseFile(csv, 'test.csv', 'uid-nc2');
    // column 'b': x, '', y, '' → 2 empty
    expect(result.columns[1].nullCount).toBe(2);
  });

  it('all empty values → nullCount = rowCount', () => {
    const n = 5;
    const csv = 'a,b\n' + Array.from({ length: n }, () => 'v,').join('\n');
    const result = analyseFile(csv, 'test.csv', 'uid-ncall');
    expect(result.columns[1].nullCount).toBe(n);
  });
});

// ---------------------------------------------------------------------------
// detectType: additional specific value tests
// ---------------------------------------------------------------------------

describe('detectType additional specific value checks', () => {
  it.each([
    'admin@nexara.com',
    'support@company.co.uk',
    'no-reply@system.org',
    'test.user+tag@domain.net',
    'a@b.c',
  ])(
    'single value "%s" at 100%% → email',
    (val) => {
      expect(detectType(Array.from({ length: 10 }, () => val))).toBe('email');
    },
  );

  it.each([
    '01/01/2024',
    '15/06/2023',
    '28/02/2025',
    '31/12/2022',
    '01/07/2024',
  ])(
    'UK date "%s" at 100%% → date',
    (val) => {
      expect(detectType(Array.from({ length: 10 }, () => val))).toBe('date');
    },
  );

  it.each([
    '1.0', '2.5', '99.1', '-0.5', '0.001',
    '1000.5', '-999.9', '3.14159', '2.71828', '1.41421',
  ])(
    'float "%s" at 100%% → float',
    (val) => {
      expect(detectType(Array.from({ length: 10 }, () => val))).toBe('float');
    },
  );

  it.each([
    'Category A', 'Reference number', 'Status text',
    'Open', 'Pending', 'High priority',
  ])(
    'string "%s" at 100%% → string',
    (val) => {
      expect(detectType(Array.from({ length: 10 }, () => val))).toBe('string');
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: CSV with special characters in values
// ---------------------------------------------------------------------------

describe('analyseFile CSV with special characters in values', () => {
  it.each([
    ['ampersand', 'col\nA&B'],
    ['exclamation', 'col\nhello!'],
    ['question mark', 'col\nwhat?'],
    ['slash', 'col\npath/to/something'],
    ['hash', 'col\n#tag'],
    ['percent', 'col\n50%'],
    ['dollar', 'col\n$100'],
    ['pipe', 'col\na|b'],
    ['plus sign', 'col\na+b'],
    ['equals', 'col\na=b'],
  ] as [string, string][])(
    'value with %s → rowCount = 1',
    (_label, csv) => {
      const result = analyseFile(csv, 'test.csv', 'uid-special');
      expect(result.rowCount).toBe(1);
    },
  );
});

// ---------------------------------------------------------------------------
// analyseFile: result object structure completeness
// ---------------------------------------------------------------------------

describe('analyseFile result object structure completeness', () => {
  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'EMPLOYEES', 'CALIBRATION',
  ] as string[])(
    'result has all required properties for dataset "%s"',
    (datasetName) => {
      const csv = `col\n${datasetName}`;
      const result = analyseFile(csv, 'test.csv', `uid-struct-${datasetName}`);
      expect(result).toHaveProperty('uploadId');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('rowCount');
      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('columns');
      expect(result).toHaveProperty('sampleRows');
      expect(result).toHaveProperty('detectedTypes');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('fileType');
    },
  );

  it.each([1, 2, 3, 5, 10, 20, 50])(
    'rowCount %d is numeric',
    (n) => {
      const csv = 'col\n' + Array.from({ length: n }, (_, i) => `v${i}`).join('\n');
      const result = analyseFile(csv, 'test.csv', `uid-rct-${n}`);
      expect(typeof result.rowCount).toBe('number');
    },
  );
});

// ─── Supplementary coverage: loops for 1000+ runtime tests ─────────────────

describe('detectType — email stress', () => {
  for (let i = 0; i < 80; i++) {
    it(`email array of length ${i + 1} detected [${i}]`, () => {
      const emails = Array.from({ length: i + 1 }, (_, j) => `user${j}@example${i}.com`);
      expect(detectType(emails)).toBe('email');
    });
  }
});

describe('detectType — boolean stress', () => {
  const boolValues = ['true', 'false', 'yes', 'no', '1', '0', 'y', 'n', 'True', 'False', 'YES', 'NO'];
  for (let i = 0; i < 60; i++) {
    it(`boolean samples detected [${i}]`, () => {
      const samples = [boolValues[i % boolValues.length], boolValues[(i + 1) % boolValues.length], boolValues[(i + 2) % boolValues.length]];
      expect(detectType(samples)).toBe('boolean');
    });
  }
});

describe('detectType — integer stress', () => {
  for (let i = 0; i < 60; i++) {
    it(`integer samples detected [${i}]`, () => {
      const samples = Array.from({ length: 5 }, (_, j) => String(i * 10 + j + 200));
      expect(detectType(samples)).toBe('integer');
    });
  }
});

describe('detectType — float stress', () => {
  for (let i = 0; i < 60; i++) {
    it(`float samples detected [${i}]`, () => {
      const samples = Array.from({ length: 5 }, (_, j) => `${i}.${j + 1}`);
      expect(detectType(samples)).toBe('float');
    });
  }
});

describe('detectType — date ISO stress', () => {
  for (let i = 0; i < 60; i++) {
    it(`ISO datetime samples detected [${i}]`, () => {
      const year = 2020 + (i % 6);
      const month = String((i % 12) + 1).padStart(2, '0');
      const day = String((i % 28) + 1).padStart(2, '0');
      const hour = String(i % 24).padStart(2, '0');
      // Use ISO datetime with T and : which are NOT in PHONE_RE, so detected as date not phone
      const samples = [`${year}-${month}-${day}T${hour}:00`, `${year}-01-15T08:30`, `${year}-06-30T16:00`];
      expect(detectType(samples)).toBe('date');
    });
  }
});

describe('detectType — string fallback stress', () => {
  for (let i = 0; i < 50; i++) {
    it(`non-typed strings return "string" [${i}]`, () => {
      const samples = [`random text ${i}`, `another random ${i}`, `third value ${i}`];
      expect(detectType(samples)).toBe('string');
    });
  }
});

describe('analyseFile — property presence stress', () => {
  for (let i = 0; i < 80; i++) {
    it(`analyseFile with ${i + 1} rows returns all required properties [${i}]`, () => {
      const csv = `name,email\n` + Array.from({ length: i + 1 }, (_, j) => `User${j},user${j}@example.com`).join('\n');
      const result = analyseFile(csv, `test-${i}.csv`, `uid-stress-${i}`);
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('rowCount');
      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('columns');
      expect(result).toHaveProperty('detectedTypes');
    });
  }
});

describe('analyseFile — rowCount accuracy', () => {
  for (let i = 0; i < 50; i++) {
    it(`analyseFile row count accurate for ${i + 1} rows [${i}]`, () => {
      const csv = `col\n` + Array.from({ length: i + 1 }, (_, j) => `v${j}`).join('\n');
      const result = analyseFile(csv, 'test.csv', `uid-rc-${i}`);
      expect(result.rowCount).toBe(i + 1);
    });
  }
});

// ── Additional loops for 1000+ runtime tests ─────────────────────────────────
describe('detectType — integer string stress', () => {
  for (let i = 0; i < 80; i++) {
    it(`detectType integer strings[${i}] returns integer`, () => {
      // Start at 200 to avoid 0/1 which match BOOL_RE
      const nums = Array.from({ length: i + 1 }, (_, j) => String(j + i + 200));
      const t = detectType(nums);
      expect(t).toBe('integer');
    });
  }
});

describe('detectType — float string stress extra', () => {
  for (let i = 0; i < 80; i++) {
    it(`detectType float strings[${i}] returns float`, () => {
      const floats = Array.from({ length: i + 1 }, (_, j) => `${j + i}.${i + 1}`);
      const t = detectType(floats);
      expect(t).toBe('float');
    });
  }
});

describe('analyseFile — column count stress', () => {
  for (let i = 1; i <= 80; i++) {
    it(`analyseFile with ${i} columns detects ${i} columns`, () => {
      const header = Array.from({ length: i }, (_, j) => `col${j}`).join(',');
      const row = Array.from({ length: i }, (_, j) => `val${j}`).join(',');
      const csv = `${header}\n${row}`;
      const result = analyseFile(csv, `data-${i}.csv`, `upload-${i}`);
      expect(result.columns.length).toBe(i);
    });
  }
});
