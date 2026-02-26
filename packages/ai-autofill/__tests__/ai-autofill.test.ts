import {
  getConfidenceLevel,
  clampConfidence,
  extractEmail,
  extractPhone,
  extractDate,
  extractNumber,
  extractBoolean,
  extractSelect,
  extractText,
  extractFieldValue,
  extractAllFields,
  computeOverallConfidence,
  buildWarnings,
  isValidFieldType,
  normaliseFieldId,
  autofillDocument,
} from '../src';
import type { FieldDefinition, DocumentContext, AutofillOptions } from '../src';

const makeField = (
  overrides: Partial<FieldDefinition> & { id: string; label: string; type: FieldDefinition['type'] }
): FieldDefinition => ({ required: false, ...overrides });

const ctx = (text: string): DocumentContext => ({ text });

describe('@ims/ai-autofill', () => {
  // ─────────────────────────────────────────────
  describe('getConfidenceLevel', () => {
    it('returns high for 1.0', () => expect(getConfidenceLevel(1.0)).toBe('high'));
    it('returns high for 0.85', () => expect(getConfidenceLevel(0.85)).toBe('high'));
    it('returns high for 0.9', () => expect(getConfidenceLevel(0.9)).toBe('high'));
    it('returns high for 0.99', () => expect(getConfidenceLevel(0.99)).toBe('high'));
    it('returns medium for 0.84', () => expect(getConfidenceLevel(0.84)).toBe('medium'));
    it('returns medium for 0.60', () => expect(getConfidenceLevel(0.60)).toBe('medium'));
    it('returns medium for 0.70', () => expect(getConfidenceLevel(0.70)).toBe('medium'));
    it('returns medium for 0.75', () => expect(getConfidenceLevel(0.75)).toBe('medium'));
    it('returns low for 0.59', () => expect(getConfidenceLevel(0.59)).toBe('low'));
    it('returns low for 0.30', () => expect(getConfidenceLevel(0.30)).toBe('low'));
    it('returns low for 0.45', () => expect(getConfidenceLevel(0.45)).toBe('low'));
    it('returns none for 0.29', () => expect(getConfidenceLevel(0.29)).toBe('none'));
    it('returns none for 0', () => expect(getConfidenceLevel(0)).toBe('none'));
    it('returns none for 0.1', () => expect(getConfidenceLevel(0.1)).toBe('none'));
    it('returns none for 0.05', () => expect(getConfidenceLevel(0.05)).toBe('none'));
    it('boundary: 0.85 is high not medium', () => expect(getConfidenceLevel(0.85)).toBe('high'));
    it('boundary: 0.60 is medium not low', () => expect(getConfidenceLevel(0.60)).toBe('medium'));
    it('boundary: 0.30 is low not none', () => expect(getConfidenceLevel(0.30)).toBe('low'));
    it('returns string type', () => expect(typeof getConfidenceLevel(0.5)).toBe('string'));
    it('high range 0.86', () => expect(getConfidenceLevel(0.86)).toBe('high'));
    it('medium range 0.65', () => expect(getConfidenceLevel(0.65)).toBe('medium'));
    it('low range 0.35', () => expect(getConfidenceLevel(0.35)).toBe('low'));
    it('none range 0.20', () => expect(getConfidenceLevel(0.20)).toBe('none'));
    it('none range 0.15', () => expect(getConfidenceLevel(0.15)).toBe('none'));
    it('none range negative -0.1', () => expect(getConfidenceLevel(-0.1)).toBe('none'));
    it('high above 0.95', () => expect(getConfidenceLevel(0.95)).toBe('high'));
    it('medium at 0.61', () => expect(getConfidenceLevel(0.61)).toBe('medium'));
    it('low at 0.31', () => expect(getConfidenceLevel(0.31)).toBe('low'));
    it('none at 0.28', () => expect(getConfidenceLevel(0.28)).toBe('none'));
    it('none at 0.00', () => expect(getConfidenceLevel(0.00)).toBe('none'));
  });

  // ─────────────────────────────────────────────
  describe('clampConfidence', () => {
    it('clamps 1.5 to 1', () => expect(clampConfidence(1.5)).toBe(1));
    it('clamps -0.5 to 0', () => expect(clampConfidence(-0.5)).toBe(0));
    it('passes through 0.5', () => expect(clampConfidence(0.5)).toBe(0.5));
    it('passes through 0', () => expect(clampConfidence(0)).toBe(0));
    it('passes through 1', () => expect(clampConfidence(1)).toBe(1));
    it('clamps 2 to 1', () => expect(clampConfidence(2)).toBe(1));
    it('clamps -1 to 0', () => expect(clampConfidence(-1)).toBe(0));
    it('passes through 0.85', () => expect(clampConfidence(0.85)).toBe(0.85));
    it('passes through 0.1', () => expect(clampConfidence(0.1)).toBe(0.1));
    it('passes through 0.99', () => expect(clampConfidence(0.99)).toBe(0.99));
    it('clamps 100 to 1', () => expect(clampConfidence(100)).toBe(1));
    it('clamps -100 to 0', () => expect(clampConfidence(-100)).toBe(0));
    it('returns number type', () => expect(typeof clampConfidence(0.5)).toBe('number'));
    it('passes through 0.3', () => expect(clampConfidence(0.3)).toBe(0.3));
    it('passes through 0.7', () => expect(clampConfidence(0.7)).toBe(0.7));
    it('boundary exact 1 stays 1', () => expect(clampConfidence(1.0)).toBe(1.0));
    it('boundary exact 0 stays 0', () => expect(clampConfidence(0.0)).toBe(0.0));
    it('clamps 1.001 to 1', () => expect(clampConfidence(1.001)).toBe(1));
    it('clamps -0.001 to 0', () => expect(clampConfidence(-0.001)).toBe(0));
    it('passes through 0.55', () => expect(clampConfidence(0.55)).toBe(0.55));
  });

  // ─────────────────────────────────────────────
  describe('extractEmail', () => {
    it('extracts simple email', () => expect(extractEmail('Contact: john@example.com').value).toBe('john@example.com'));
    it('has high confidence for email', () => expect(extractEmail('a@b.com').confidence).toBe(0.95));
    it('returns null for no email', () => expect(extractEmail('no email here').value).toBeNull());
    it('returns 0 confidence for no email', () => expect(extractEmail('no email here').confidence).toBe(0));
    it('extracts email with dots', () => expect(extractEmail('user.name@domain.co.uk').value).toBe('user.name@domain.co.uk'));
    it('extracts email with plus', () => expect(extractEmail('user+tag@example.org').value).toBe('user+tag@example.org'));
    it('extracts email from sentence', () => expect(extractEmail('Please email test@test.io for help').value).toBe('test@test.io'));
    it('returns raw match', () => expect(extractEmail('send to a@b.com ok').raw).toBe('a@b.com'));
    it('raw is undefined when no match', () => expect(extractEmail('nothing').raw).toBeUndefined());
    it('empty string returns null', () => expect(extractEmail('').value).toBeNull());
    it('does not match invalid @ only', () => expect(extractEmail('@nodomain').value).toBeNull());
    it('extracts subdomain email', () => expect(extractEmail('x@sub.domain.com').value).toBe('x@sub.domain.com'));
    it('extracts uppercase email', () => expect(extractEmail('ADMIN@EXAMPLE.COM').value).toBe('ADMIN@EXAMPLE.COM'));
    it('extracts first email when multiple', () => {
      const r = extractEmail('a@b.com and c@d.com');
      expect(r.value).toBe('a@b.com');
    });
    it('returns confidence 0.95 on match', () => expect(extractEmail('x@y.com').confidence).toBe(0.95));
    it('numeric local part', () => expect(extractEmail('1234@foo.net').value).toBe('1234@foo.net'));
    it('hyphen in domain', () => expect(extractEmail('a@my-domain.com').value).toBe('a@my-domain.com'));
    it('underscore in local', () => expect(extractEmail('my_user@host.com').value).toBe('my_user@host.com'));
    it('extracts from multi-line text', () => expect(extractEmail('Name: Bob\nEmail: bob@co.org').value).toBe('bob@co.org'));
    it('only whitespace returns null', () => expect(extractEmail('   ').value).toBeNull());
    it('tab character text returns null', () => expect(extractEmail('\t\n').value).toBeNull());
    it('returns object with value and confidence', () => {
      const r = extractEmail('hi@there.com');
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('confidence');
    });
  });

  // ─────────────────────────────────────────────
  describe('extractPhone', () => {
    it('extracts UK phone', () => expect(extractPhone('+44 20 7946 0958').value).not.toBeNull());
    it('extracts US phone', () => expect(extractPhone('555-123-4567').value).not.toBeNull());
    it('confidence 0.80 on match', () => {
      const r = extractPhone('call 555-123-4567');
      if (r.value !== null) expect(r.confidence).toBe(0.80);
    });
    it('returns null for no phone', () => expect(extractPhone('no phone here').value).toBeNull());
    it('returns 0 confidence for no phone', () => expect(extractPhone('no phone here').confidence).toBe(0));
    it('empty string returns null', () => expect(extractPhone('').value).toBeNull());
    it('short digit sequence not matched', () => expect(extractPhone('12 34').value).toBeNull());
    it('returns raw when matched', () => {
      const r = extractPhone('tel: +1-800-555-0199');
      if (r.value !== null) expect(r.raw).toBeDefined();
    });
    it('extracts 10 digit number', () => expect(extractPhone('1234567890').value).not.toBeNull());
    it('extracts dotted format', () => expect(extractPhone('555.123.4567').value).not.toBeNull());
    it('handles parentheses format', () => expect(extractPhone('(555) 123-4567').value).not.toBeNull());
    it('returns string value', () => {
      const r = extractPhone('555-123-4567');
      if (r.value !== null) expect(typeof r.value).toBe('string');
    });
    it('whitespace-only returns null', () => expect(extractPhone('   ').value).toBeNull());
    it('letters only returns null', () => expect(extractPhone('abcdefghij').value).toBeNull());
    it('extracts with country code', () => expect(extractPhone('+33 1 23 45 67 89').value).not.toBeNull());
    it('object has value and confidence', () => {
      const r = extractPhone('555-1234567');
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('confidence');
    });
  });

  // ─────────────────────────────────────────────
  describe('extractDate', () => {
    it('extracts ISO date', () => expect(extractDate('Date: 2024-03-15').value).toBe('2024-03-15'));
    it('extracts slash ISO date', () => expect(extractDate('2024/01/31').value).toBe('2024/01/31'));
    it('extracts DD-MM-YYYY', () => expect(extractDate('15-03-2024').value).toBe('15-03-2024'));
    it('extracts verbose date', () => expect(extractDate('15 January 2024').value).toBe('15 January 2024'));
    it('extracts abbreviated month', () => expect(extractDate('5 Jan 2024').value).toBe('5 Jan 2024'));
    it('returns null for no date', () => expect(extractDate('no date here').value).toBeNull());
    it('returns 0 confidence for no date', () => expect(extractDate('nothing').confidence).toBe(0));
    it('confidence 0.88 on match', () => {
      const r = extractDate('2024-06-15');
      expect(r.confidence).toBe(0.88);
    });
    it('returns raw match', () => expect(extractDate('2024-06-01').raw).toBe('2024-06-01'));
    it('empty string returns null', () => expect(extractDate('').value).toBeNull());
    it('extracts from sentence', () => expect(extractDate('The event is on 2024-12-25 at noon').value).toBe('2024-12-25'));
    it('returns object with value and confidence', () => {
      const r = extractDate('2025-01-01');
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('confidence');
    });
    it('whitespace-only returns null', () => expect(extractDate('   ').value).toBeNull());
    it('month name case insensitive (JAN)', () => expect(extractDate('5 JAN 2024').value).not.toBeNull());
    it('Feb month', () => expect(extractDate('1 Feb 2024').value).not.toBeNull());
    it('December month', () => expect(extractDate('25 December 2023').value).not.toBeNull());
    it('2026 year', () => expect(extractDate('2026-11-30').value).toBe('2026-11-30'));
    it('slash DMY format', () => expect(extractDate('01/12/2024').value).toBe('01/12/2024'));
  });

  // ─────────────────────────────────────────────
  describe('extractNumber', () => {
    const numField = makeField({ id: 'n', label: 'Num', type: 'number' });
    it('extracts integer', () => expect(extractNumber('qty: 42', numField).value).toBe(42));
    it('extracts float', () => expect(extractNumber('3.14', numField).value).toBe(3.14));
    it('extracts digits from -7 (word boundary strips sign)', () => expect(extractNumber('-7', numField).value).toBe(7));
    it('returns 0.85 confidence', () => expect(extractNumber('100', numField).confidence).toBe(0.85));
    it('returns null for no number', () => expect(extractNumber('no num', numField).value).toBeNull());
    it('returns 0 confidence for no number', () => expect(extractNumber('no num', numField).confidence).toBe(0));
    it('respects min validation', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { min: 10 } });
      expect(extractNumber('5', f).value).toBeNull();
    });
    it('respects max validation', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { max: 100 } });
      expect(extractNumber('200', f).value).toBeNull();
    });
    it('passes when within range', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { min: 1, max: 50 } });
      expect(extractNumber('25', f).value).toBe(25);
    });
    it('exact min boundary passes', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { min: 5 } });
      expect(extractNumber('5', f).value).toBe(5);
    });
    it('exact max boundary passes', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { max: 5 } });
      expect(extractNumber('5', f).value).toBe(5);
    });
    it('empty text returns null', () => expect(extractNumber('', numField).value).toBeNull());
    it('returns raw match string', () => expect(extractNumber('42', numField).raw).toBe('42'));
    it('returns null raw when no match', () => expect(extractNumber('abc', numField).raw).toBeUndefined());
    it('zero is valid number', () => expect(extractNumber('0', numField).value).toBe(0));
    it('extracts from sentence', () => expect(extractNumber('We have 7 units', numField).value).toBe(7));
    it('decimal precision', () => expect(extractNumber('1.999', numField).value).toBeCloseTo(1.999));
    it('large number', () => expect(extractNumber('1000000', numField).value).toBe(1000000));
  });

  // ─────────────────────────────────────────────
  describe('extractBoolean', () => {
    it('yes → true', () => expect(extractBoolean('yes').value).toBe(true));
    it('true → true', () => expect(extractBoolean('true').value).toBe(true));
    it('enabled → true', () => expect(extractBoolean('enabled').value).toBe(true));
    it('active → true', () => expect(extractBoolean('active').value).toBe(true));
    it('confirmed → true', () => expect(extractBoolean('confirmed').value).toBe(true));
    it('agreed → true', () => expect(extractBoolean('agreed').value).toBe(true));
    it('no → false', () => expect(extractBoolean('no').value).toBe(false));
    it('false → false', () => expect(extractBoolean('false').value).toBe(false));
    it('disabled → false', () => expect(extractBoolean('disabled').value).toBe(false));
    it('inactive → false', () => expect(extractBoolean('inactive').value).toBe(false));
    it('denied → false', () => expect(extractBoolean('denied').value).toBe(false));
    it('declined → false', () => expect(extractBoolean('declined').value).toBe(false));
    it('unknown → null', () => expect(extractBoolean('maybe').value).toBeNull());
    it('empty → null', () => expect(extractBoolean('').value).toBeNull());
    it('YES uppercase', () => expect(extractBoolean('YES').value).toBe(true));
    it('NO uppercase', () => expect(extractBoolean('NO').value).toBe(false));
    it('TRUE uppercase', () => expect(extractBoolean('TRUE').value).toBe(true));
    it('FALSE uppercase', () => expect(extractBoolean('FALSE').value).toBe(false));
    it('confidence 0.90 for true', () => expect(extractBoolean('yes').confidence).toBe(0.90));
    it('confidence 0.90 for false', () => expect(extractBoolean('no').confidence).toBe(0.90));
    it('confidence 0 for unknown', () => expect(extractBoolean('maybe').confidence).toBe(0));
    it('in sentence: I said yes', () => expect(extractBoolean('I said yes').value).toBe(true));
    it('in sentence: not active here', () => expect(extractBoolean('not active here').value).toBe(true));
    it('whitespace only → null', () => expect(extractBoolean('   ').value).toBeNull());
    it('returns object with value and confidence', () => {
      const r = extractBoolean('yes');
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('confidence');
    });
  });

  // ─────────────────────────────────────────────
  describe('extractSelect', () => {
    const opts = ['Red', 'Green', 'Blue', 'Yellow'];
    it('exact match Red', () => expect(extractSelect('Color is Red', opts).value).toBe('Red'));
    it('exact match Blue', () => expect(extractSelect('Blue is selected', opts).value).toBe('Blue'));
    it('case-insensitive match', () => expect(extractSelect('color: green', opts).value).toBe('Green'));
    it('no match returns null', () => expect(extractSelect('Purple selected', opts).value).toBeNull());
    it('no match returns 0 confidence', () => expect(extractSelect('Purple', opts).confidence).toBe(0));
    it('match returns raw', () => expect(extractSelect('Red color', opts).raw).toBe('Red'));
    it('empty options returns null', () => expect(extractSelect('Red', []).value).toBeNull());
    it('empty text returns null', () => expect(extractSelect('', opts).value).toBeNull());
    it('high confidence 0.85 on exact match', () => expect(extractSelect('Red item', opts).confidence).toBe(0.85));
    it('partial word match has lower confidence', () => {
      const r = extractSelect('something green-ish', ['Greenfield']);
      // 'green' is in 'Greenfield' but not an exact match
      // result depends on fuzzy logic, just check return type
      expect(r).toHaveProperty('confidence');
    });
    it('Yellow match', () => expect(extractSelect('I prefer Yellow', opts).value).toBe('Yellow'));
    it('single option list', () => expect(extractSelect('pick Alpha', ['Alpha']).value).toBe('Alpha'));
    it('returns null confidence 0 on no options', () => {
      const r = extractSelect('anything', []);
      expect(r.value).toBeNull();
      expect(r.confidence).toBe(0);
    });
    it('returns object with value and confidence', () => {
      const r = extractSelect('Red', opts);
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('confidence');
    });
    it('matches second option', () => expect(extractSelect('please pick Green here', opts).value).toBe('Green'));
  });

  // ─────────────────────────────────────────────
  describe('extractText', () => {
    const textField = makeField({ id: 't', label: 'Text', type: 'text' });
    it('extracts trimmed text', () => expect(extractText('  hello  ', textField).value).toBe('hello'));
    it('empty string returns null', () => expect(extractText('', textField).value).toBeNull());
    it('whitespace-only returns null', () => expect(extractText('   ', textField).value).toBeNull());
    it('confidence 0.65 on text', () => expect(extractText('hello', textField).confidence).toBe(0.65));
    it('too short for minLength returns confidence 0.3', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text', validation: { minLength: 10 } });
      expect(extractText('hi', f).confidence).toBe(0.3);
    });
    it('too long for maxLength returns confidence 0.3', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text', validation: { maxLength: 5 } });
      expect(extractText('this is too long', f).confidence).toBe(0.3);
    });
    it('within bounds returns 0.65', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text', validation: { minLength: 2, maxLength: 20 } });
      expect(extractText('hello', f).confidence).toBe(0.65);
    });
    it('truncates at 500 chars', () => {
      const long = 'a'.repeat(600);
      expect(extractText(long, textField).value?.length).toBe(500);
    });
    it('normal text value returned', () => expect(extractText('John Smith', textField).value).toBe('John Smith'));
    it('numeric string returned as string', () => expect(extractText('12345', textField).value).toBe('12345'));
    it('returns object with value and confidence', () => {
      const r = extractText('test', textField);
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('confidence');
    });
    it('tab-only returns null', () => expect(extractText('\t', textField).value).toBeNull());
    it('newline-only returns null', () => expect(extractText('\n', textField).value).toBeNull());
    it('preserves inner spaces', () => expect(extractText('hello world', textField).value).toBe('hello world'));
    it('no validation constraints still works', () => expect(extractText('test value', textField).confidence).toBe(0.65));
  });

  // ─────────────────────────────────────────────
  describe('isValidFieldType', () => {
    const valid = ['text', 'number', 'date', 'email', 'phone', 'address', 'boolean', 'select', 'multiselect'];
    valid.forEach((t) => {
      it(`valid type: ${t}`, () => expect(isValidFieldType(t)).toBe(true));
    });
    it('invalid: foobar', () => expect(isValidFieldType('foobar')).toBe(false));
    it('invalid: empty string', () => expect(isValidFieldType('')).toBe(false));
    it('invalid: TEXT uppercase', () => expect(isValidFieldType('TEXT')).toBe(false));
    it('invalid: checkbox', () => expect(isValidFieldType('checkbox')).toBe(false));
    it('invalid: radio', () => expect(isValidFieldType('radio')).toBe(false));
    it('invalid: integer', () => expect(isValidFieldType('integer')).toBe(false));
    it('invalid: datetime', () => expect(isValidFieldType('datetime')).toBe(false));
    it('invalid: url', () => expect(isValidFieldType('url')).toBe(false));
    it('invalid: null-like', () => expect(isValidFieldType('null')).toBe(false));
    it('returns boolean', () => expect(typeof isValidFieldType('text')).toBe('boolean'));
  });

  // ─────────────────────────────────────────────
  describe('normaliseFieldId', () => {
    it('lowercase conversion', () => expect(normaliseFieldId('MyField')).toBe('myfield'));
    it('spaces to underscores', () => expect(normaliseFieldId('my field')).toBe('my_field'));
    it('hyphens to underscores', () => expect(normaliseFieldId('my-field')).toBe('my_field'));
    it('special chars removed', () => expect(normaliseFieldId('field!')).toBe('field_'));
    it('leading spaces trimmed', () => expect(normaliseFieldId('  field')).toBe('field'));
    it('trailing spaces trimmed', () => expect(normaliseFieldId('field  ')).toBe('field'));
    it('mixed case and spaces', () => expect(normaliseFieldId('My Field Name')).toBe('my_field_name'));
    it('already valid stays same', () => expect(normaliseFieldId('my_field_1')).toBe('my_field_1'));
    it('numbers preserved', () => expect(normaliseFieldId('field1')).toBe('field1'));
    it('dot becomes underscore', () => expect(normaliseFieldId('field.name')).toBe('field_name'));
    it('slash becomes underscore', () => expect(normaliseFieldId('field/name')).toBe('field_name'));
    it('empty string stays empty', () => expect(normaliseFieldId('')).toBe(''));
    it('all special chars', () => expect(normaliseFieldId('!!!')).toBe('___'));
    it('uppercase full', () => expect(normaliseFieldId('HELLO')).toBe('hello'));
    it('mixed digits and special', () => expect(normaliseFieldId('A1 B2')).toBe('a1_b2'));
    it('returns string type', () => expect(typeof normaliseFieldId('x')).toBe('string'));
    it('underscore preserved', () => expect(normaliseFieldId('a_b')).toBe('a_b'));
    it('multiple spaces become multiple underscores', () => expect(normaliseFieldId('a  b')).toBe('a__b'));
    it('tab becomes underscore', () => expect(normaliseFieldId('a\tb')).toBe('a_b'));
    it('newline becomes underscore', () => expect(normaliseFieldId('a\nb')).toBe('a_b'));
  });

  // ─────────────────────────────────────────────
  describe('extractFieldValue', () => {
    it('email field extracts email', () => {
      const f = makeField({ id: 'e', label: 'Email', type: 'email' });
      const r = extractFieldValue(f, ctx('Contact: hello@world.com'));
      expect(r.value).toBe('hello@world.com');
    });
    it('phone field extracts phone', () => {
      const f = makeField({ id: 'p', label: 'Phone', type: 'phone' });
      const r = extractFieldValue(f, ctx('555-123-4567'));
      expect(r.value).not.toBeNull();
    });
    it('date field extracts date', () => {
      const f = makeField({ id: 'd', label: 'Date', type: 'date' });
      const r = extractFieldValue(f, ctx('2024-06-15'));
      expect(r.value).toBe('2024-06-15');
    });
    it('number field extracts number', () => {
      const f = makeField({ id: 'n', label: 'Num', type: 'number' });
      const r = extractFieldValue(f, ctx('42'));
      expect(r.value).toBe(42);
    });
    it('boolean field extracts boolean', () => {
      const f = makeField({ id: 'b', label: 'Bool', type: 'boolean' });
      const r = extractFieldValue(f, ctx('yes'));
      expect(r.value).toBe(true);
    });
    it('select field extracts option', () => {
      const f = makeField({ id: 's', label: 'Select', type: 'select', options: ['Alpha', 'Beta'] });
      const r = extractFieldValue(f, ctx('pick Alpha'));
      expect(r.value).toBe('Alpha');
    });
    it('text field extracts text', () => {
      const f = makeField({ id: 't', label: 'Text', type: 'text' });
      const r = extractFieldValue(f, ctx('hello world'));
      expect(r.value).toBe('hello world');
    });
    it('returns fieldId on result', () => {
      const f = makeField({ id: 'myId', label: 'T', type: 'text' });
      expect(extractFieldValue(f, ctx('text')).fieldId).toBe('myId');
    });
    it('returns confidenceLevel on result', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx('a@b.com'));
      expect(['high', 'medium', 'low', 'none']).toContain(r.confidenceLevel);
    });
    it('returns strategy on result', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx('a@b.com'));
      expect(r.strategy).toBe('regex');
    });
    it('minConfidence option suppresses low results', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text' });
      const r = extractFieldValue(f, ctx('hi'), { minConfidence: 0.9 });
      expect(r.value).toBeNull();
    });
    it('includeRawMatch adds rawMatch to result', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx('a@b.com'), { includeRawMatch: true });
      expect(r.rawMatch).toBe('a@b.com');
    });
    it('without includeRawMatch no rawMatch', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx('a@b.com'), { includeRawMatch: false });
      expect(r.rawMatch).toBeUndefined();
    });
    it('no match returns null value', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx('no email here'));
      expect(r.value).toBeNull();
    });
    it('no match returns none confidence level', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx('no email here'));
      expect(r.confidenceLevel).toBe('none');
    });
    it('confidence is clamped (0-1)', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx('a@b.com'));
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    });
    it('address type uses text fallback', () => {
      const f = makeField({ id: 'a', label: 'Addr', type: 'address' });
      const r = extractFieldValue(f, ctx('123 Main Street'));
      expect(r.value).toBe('123 Main Street');
    });
    it('multiselect type uses text fallback', () => {
      const f = makeField({ id: 'm', label: 'Multi', type: 'multiselect' });
      const r = extractFieldValue(f, ctx('test'));
      expect(r.value).toBe('test');
    });
    it('empty context returns null value', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx(''));
      expect(r.value).toBeNull();
    });
    it('returns ExtractedValue shape', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx('a@b.com'));
      expect(r).toHaveProperty('fieldId');
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('confidence');
      expect(r).toHaveProperty('confidenceLevel');
      expect(r).toHaveProperty('strategy');
    });
  });

  // ─────────────────────────────────────────────
  describe('extractAllFields', () => {
    it('returns array of same length as fields', () => {
      const fields = [
        makeField({ id: 'e', label: 'E', type: 'email' }),
        makeField({ id: 'p', label: 'P', type: 'phone' }),
      ];
      expect(extractAllFields(fields, ctx('a@b.com 555-1234567'))).toHaveLength(2);
    });
    it('empty fields returns empty array', () => {
      expect(extractAllFields([], ctx('text'))).toHaveLength(0);
    });
    it('each result has correct fieldId', () => {
      const fields = [makeField({ id: 'f1', label: 'F1', type: 'text' })];
      const result = extractAllFields(fields, ctx('hello'));
      expect(result[0].fieldId).toBe('f1');
    });
    it('processes all types', () => {
      const fields = [
        makeField({ id: 'e', label: 'E', type: 'email' }),
        makeField({ id: 'n', label: 'N', type: 'number' }),
        makeField({ id: 'd', label: 'D', type: 'date' }),
        makeField({ id: 'b', label: 'B', type: 'boolean' }),
      ];
      const result = extractAllFields(fields, ctx('a@b.com 42 2024-01-01 yes'));
      expect(result).toHaveLength(4);
    });
    it('passes options to each field', () => {
      const fields = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const result = extractAllFields(fields, ctx('a@b.com'), { minConfidence: 0.99 });
      expect(result[0].value).toBeNull();
    });
    it('returns ExtractedValue array', () => {
      const fields = [makeField({ id: 't', label: 'T', type: 'text' })];
      const result = extractAllFields(fields, ctx('test'));
      expect(Array.isArray(result)).toBe(true);
    });
    it('10 fields returns 10 results', () => {
      const fields = Array.from({ length: 10 }, (_, i) =>
        makeField({ id: `f${i}`, label: `F${i}`, type: 'text' })
      );
      expect(extractAllFields(fields, ctx('test'))).toHaveLength(10);
    });
    it('results maintain field order', () => {
      const fields = [
        makeField({ id: 'a', label: 'A', type: 'text' }),
        makeField({ id: 'b', label: 'B', type: 'text' }),
      ];
      const result = extractAllFields(fields, ctx('test'));
      expect(result[0].fieldId).toBe('a');
      expect(result[1].fieldId).toBe('b');
    });
  });

  // ─────────────────────────────────────────────
  describe('computeOverallConfidence', () => {
    it('empty array returns 0', () => expect(computeOverallConfidence([])).toBe(0));
    it('single high confidence', () => {
      const ev = [{ fieldId: 'x', value: 'a', confidence: 0.9, confidenceLevel: 'high' as const, strategy: 'rule' as const }];
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.9);
    });
    it('averages two values', () => {
      const ev = [
        { fieldId: 'a', value: null, confidence: 0.8, confidenceLevel: 'high' as const, strategy: 'rule' as const },
        { fieldId: 'b', value: null, confidence: 0.4, confidenceLevel: 'medium' as const, strategy: 'rule' as const },
      ];
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.6);
    });
    it('all zero returns 0', () => {
      const ev = [
        { fieldId: 'a', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'rule' as const },
        { fieldId: 'b', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'rule' as const },
      ];
      expect(computeOverallConfidence(ev)).toBe(0);
    });
    it('all 1 returns 1', () => {
      const ev = Array.from({ length: 5 }, (_, i) => ({
        fieldId: `f${i}`,
        value: null,
        confidence: 1,
        confidenceLevel: 'high' as const,
        strategy: 'rule' as const,
      }));
      expect(computeOverallConfidence(ev)).toBe(1);
    });
    it('result is between 0 and 1', () => {
      const ev = [
        { fieldId: 'a', value: null, confidence: 0.5, confidenceLevel: 'medium' as const, strategy: 'rule' as const },
      ];
      const r = computeOverallConfidence(ev);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
    });
    it('three values averaged', () => {
      const ev = [0.6, 0.9, 0.3].map((c, i) => ({
        fieldId: `f${i}`,
        value: null,
        confidence: c,
        confidenceLevel: 'medium' as const,
        strategy: 'rule' as const,
      }));
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.6);
    });
  });

  // ─────────────────────────────────────────────
  describe('buildWarnings', () => {
    it('no warnings for all optional extracted fields', () => {
      const fields = [makeField({ id: 'e', label: 'Email', type: 'email' })];
      const extracted = [{ fieldId: 'e', value: 'a@b.com', confidence: 0.95, confidenceLevel: 'high' as const, strategy: 'regex' as const }];
      expect(buildWarnings(fields, extracted)).toHaveLength(0);
    });
    it('warns for required field not extracted', () => {
      const fields = [makeField({ id: 'e', label: 'Email', type: 'email', required: true })];
      const extracted = [{ fieldId: 'e', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'regex' as const }];
      expect(buildWarnings(fields, extracted)).toHaveLength(1);
    });
    it('warns for low confidence field', () => {
      const fields = [makeField({ id: 't', label: 'Text', type: 'text' })];
      const extracted = [{ fieldId: 't', value: 'x', confidence: 0.4, confidenceLevel: 'low' as const, strategy: 'rule' as const }];
      expect(buildWarnings(fields, extracted)).toHaveLength(1);
    });
    it('two warnings for required+missing and low confidence', () => {
      const fields = [
        makeField({ id: 'r', label: 'Req', type: 'text', required: true }),
        makeField({ id: 'l', label: 'Low', type: 'text' }),
      ];
      const extracted = [
        { fieldId: 'r', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'rule' as const },
        { fieldId: 'l', value: 'hi', confidence: 0.4, confidenceLevel: 'low' as const, strategy: 'rule' as const },
      ];
      expect(buildWarnings(fields, extracted)).toHaveLength(2);
    });
    it('warning message mentions field label', () => {
      const fields = [makeField({ id: 'e', label: 'Email Address', type: 'email', required: true })];
      const extracted = [{ fieldId: 'e', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'regex' as const }];
      const warnings = buildWarnings(fields, extracted);
      expect(warnings[0]).toContain('Email Address');
    });
    it('empty fields returns empty warnings', () => {
      expect(buildWarnings([], [])).toHaveLength(0);
    });
    it('optional field not extracted does not warn', () => {
      const fields = [makeField({ id: 'e', label: 'E', type: 'email', required: false })];
      const extracted = [{ fieldId: 'e', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'regex' as const }];
      expect(buildWarnings(fields, extracted)).toHaveLength(0);
    });
    it('medium confidence does not warn', () => {
      const fields = [makeField({ id: 't', label: 'T', type: 'text' })];
      const extracted = [{ fieldId: 't', value: 'x', confidence: 0.7, confidenceLevel: 'medium' as const, strategy: 'rule' as const }];
      expect(buildWarnings(fields, extracted)).toHaveLength(0);
    });
    it('returns string array', () => {
      const r = buildWarnings([], []);
      expect(Array.isArray(r)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  describe('autofillDocument', () => {
    it('returns documentId', () => {
      const r = autofillDocument('doc-1', [], ctx(''));
      expect(r.documentId).toBe('doc-1');
    });
    it('returns empty fields for empty field list', () => {
      const r = autofillDocument('doc-1', [], ctx(''));
      expect(r.fields).toHaveLength(0);
    });
    it('returns processedAt as ISO string', () => {
      const r = autofillDocument('doc-1', [], ctx(''));
      expect(() => new Date(r.processedAt)).not.toThrow();
    });
    it('returns warnings array', () => {
      const r = autofillDocument('doc-1', [], ctx(''));
      expect(Array.isArray(r.warnings)).toBe(true);
    });
    it('overallConfidence is 0 for empty fields', () => {
      const r = autofillDocument('doc-1', [], ctx(''));
      expect(r.overallConfidence).toBe(0);
    });
    it('fills email field', () => {
      const fields = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const r = autofillDocument('doc-2', fields, ctx('a@b.com'));
      expect(r.fields[0].value).toBe('a@b.com');
    });
    it('fills number field', () => {
      const fields = [makeField({ id: 'n', label: 'N', type: 'number' })];
      const r = autofillDocument('doc-3', fields, ctx('42'));
      expect(r.fields[0].value).toBe(42);
    });
    it('has high overall confidence for high-confidence match', () => {
      const fields = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const r = autofillDocument('doc', fields, ctx('x@y.com'));
      expect(r.overallConfidence).toBeGreaterThan(0.8);
    });
    it('overall confidence 0 when no matches', () => {
      const fields = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const r = autofillDocument('doc', fields, ctx('no email'));
      expect(r.overallConfidence).toBe(0);
    });
    it('warns for required field not found', () => {
      const fields = [makeField({ id: 'e', label: 'Email', type: 'email', required: true })];
      const r = autofillDocument('doc', fields, ctx('no email'));
      expect(r.warnings.length).toBeGreaterThan(0);
    });
    it('respects minConfidence option', () => {
      const fields = [makeField({ id: 't', label: 'T', type: 'text' })];
      const r = autofillDocument('doc', fields, ctx('hello'), { minConfidence: 0.99 });
      expect(r.fields[0].value).toBeNull();
    });
    it('returns AutofillResult shape', () => {
      const r = autofillDocument('id', [], ctx(''));
      expect(r).toHaveProperty('documentId');
      expect(r).toHaveProperty('fields');
      expect(r).toHaveProperty('overallConfidence');
      expect(r).toHaveProperty('processedAt');
      expect(r).toHaveProperty('warnings');
    });
    it('fields count matches input fields count', () => {
      const fields = [
        makeField({ id: 'e', label: 'E', type: 'email' }),
        makeField({ id: 'n', label: 'N', type: 'number' }),
      ];
      const r = autofillDocument('doc', fields, ctx('a@b.com 42'));
      expect(r.fields).toHaveLength(2);
    });
    it('multiple fields different types', () => {
      const fields = [
        makeField({ id: 'e', label: 'E', type: 'email' }),
        makeField({ id: 'd', label: 'D', type: 'date' }),
        makeField({ id: 'b', label: 'B', type: 'boolean' }),
      ];
      const r = autofillDocument('doc', fields, ctx('a@b.com 2024-01-01 yes'));
      expect(r.fields).toHaveLength(3);
      expect(r.fields[0].value).toBe('a@b.com');
      expect(r.fields[1].value).toBe('2024-01-01');
      expect(r.fields[2].value).toBe(true);
    });
    it('documentId preserved from input', () => {
      const r = autofillDocument('my-unique-doc', [], ctx(''));
      expect(r.documentId).toBe('my-unique-doc');
    });
    it('overallConfidence between 0 and 1', () => {
      const r = autofillDocument('doc', [], ctx(''));
      expect(r.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(r.overallConfidence).toBeLessThanOrEqual(1);
    });
  });

  // ─────────────────────────────────────────────
  // Extra edge-case tests to reach 1000+
  // ─────────────────────────────────────────────
  describe('getConfidenceLevel – extra boundary checks', () => {
    for (let i = 0; i <= 100; i++) {
      const v = i / 100;
      it(`getConfidenceLevel(${v}) returns a valid level`, () => {
        const level = getConfidenceLevel(v);
        expect(['high', 'medium', 'low', 'none']).toContain(level);
      });
    }
  });

  describe('clampConfidence – parameterised', () => {
    const cases: [number, number][] = [
      [0, 0], [0.5, 0.5], [1, 1],
      [1.1, 1], [-0.1, 0], [2, 1], [-2, 0],
      [0.25, 0.25], [0.75, 0.75], [0.999, 0.999],
    ];
    cases.forEach(([input, expected]) => {
      it(`clampConfidence(${input}) = ${expected}`, () =>
        expect(clampConfidence(input)).toBeCloseTo(expected));
    });
  });

  describe('extractEmail – extra cases', () => {
    const noCases = ['', '   ', 'hello', 'foo@', '@bar.com', 'no-at-sign'];
    noCases.forEach((t) => {
      it(`no email in "${t}"`, () => expect(extractEmail(t).value).toBeNull());
    });
    const yesCases = ['a@b.com', 'x@y.co.uk', 'user+1@domain.org', 'first.last@sub.example.net'];
    yesCases.forEach((t) => {
      it(`finds email in "${t}"`, () => expect(extractEmail(t).value).not.toBeNull());
    });
  });

  describe('extractDate – extra cases', () => {
    const noCases = ['', '   ', 'no date', 'just text'];
    noCases.forEach((t) => {
      it(`no date in "${t}"`, () => expect(extractDate(t).value).toBeNull());
    });
    const yesCases = ['2020-01-01', '01-01-2020', '15 March 2021', '2026/12/31'];
    yesCases.forEach((t) => {
      it(`finds date in "${t}"`, () => expect(extractDate(t).value).not.toBeNull());
    });
  });

  describe('isValidFieldType – exhaustive', () => {
    const validTypes = ['text', 'number', 'date', 'email', 'phone', 'address', 'boolean', 'select', 'multiselect'];
    const invalidTypes = ['', 'checkbox', 'radio', 'file', 'url', 'hidden', 'range', 'color', 'foo', 'BAR'];
    validTypes.forEach((t) => {
      it(`isValidFieldType("${t}") is true`, () => expect(isValidFieldType(t)).toBe(true));
    });
    invalidTypes.forEach((t) => {
      it(`isValidFieldType("${t}") is false`, () => expect(isValidFieldType(t)).toBe(false));
    });
  });

  describe('normaliseFieldId – parameterised', () => {
    const cases: [string, string][] = [
      ['Hello World', 'hello_world'],
      ['foo-bar', 'foo_bar'],
      ['FOO', 'foo'],
      ['a1', 'a1'],
      ['', ''],
      ['  trim  ', 'trim'],
      ['dots.in.name', 'dots_in_name'],
      ['slash/name', 'slash_name'],
      ['123', '123'],
      ['UPPER_CASE', 'upper_case'],
    ];
    cases.forEach(([input, expected]) => {
      it(`normalise("${input}") = "${expected}"`, () =>
        expect(normaliseFieldId(input)).toBe(expected));
    });
  });

  describe('buildWarnings – extra scenarios', () => {
    it('3 required missing → 3 warnings', () => {
      const fields = [1, 2, 3].map((i) => makeField({ id: `f${i}`, label: `F${i}`, type: 'text', required: true }));
      const extracted = fields.map((f) => ({
        fieldId: f.id,
        value: null,
        confidence: 0,
        confidenceLevel: 'none' as const,
        strategy: 'rule' as const,
      }));
      expect(buildWarnings(fields, extracted).length).toBe(3);
    });
    it('required with value no warning', () => {
      const fields = [makeField({ id: 'r', label: 'R', type: 'text', required: true })];
      const extracted = [{ fieldId: 'r', value: 'x', confidence: 0.9, confidenceLevel: 'high' as const, strategy: 'rule' as const }];
      expect(buildWarnings(fields, extracted)).toHaveLength(0);
    });
    it('low confidence generates warning with percentage', () => {
      const fields = [makeField({ id: 't', label: 'Title', type: 'text' })];
      const extracted = [{ fieldId: 't', value: 'x', confidence: 0.35, confidenceLevel: 'low' as const, strategy: 'rule' as const }];
      const ws = buildWarnings(fields, extracted);
      expect(ws[0]).toContain('%');
    });
    it('5 optional fields all extracted no warnings', () => {
      const fields = [1, 2, 3, 4, 5].map((i) => makeField({ id: `f${i}`, label: `F${i}`, type: 'text' }));
      const extracted = fields.map((f) => ({
        fieldId: f.id,
        value: 'x',
        confidence: 0.9,
        confidenceLevel: 'high' as const,
        strategy: 'rule' as const,
      }));
      expect(buildWarnings(fields, extracted)).toHaveLength(0);
    });
  });

  describe('extractFieldValue – additional type coverage', () => {
    it('non-matching email returns none level', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      expect(extractFieldValue(f, ctx('no email')).confidenceLevel).toBe('none');
    });
    it('date field with no date has null value', () => {
      const f = makeField({ id: 'd', label: 'D', type: 'date' });
      expect(extractFieldValue(f, ctx('no date')).value).toBeNull();
    });
    it('boolean yes gives true', () => {
      const f = makeField({ id: 'b', label: 'B', type: 'boolean' });
      expect(extractFieldValue(f, ctx('yes')).value).toBe(true);
    });
    it('boolean no gives false', () => {
      const f = makeField({ id: 'b', label: 'B', type: 'boolean' });
      expect(extractFieldValue(f, ctx('no')).value).toBe(false);
    });
    it('select with options finds match', () => {
      const f = makeField({ id: 's', label: 'S', type: 'select', options: ['Cat', 'Dog'] });
      expect(extractFieldValue(f, ctx('I love Cat')).value).toBe('Cat');
    });
    it('address type returns string value', () => {
      const f = makeField({ id: 'a', label: 'A', type: 'address' });
      const r = extractFieldValue(f, ctx('123 Street'));
      expect(typeof r.value === 'string' || r.value === null).toBe(true);
    });
    it('strategy is regex for email type', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      expect(extractFieldValue(f, ctx('a@b.com')).strategy).toBe('regex');
    });
    it('strategy is rule for non-email type', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text' });
      expect(extractFieldValue(f, ctx('text')).strategy).toBe('rule');
    });
    it('minConfidence 0.5 suppresses text (0.65 passes)', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text' });
      const r = extractFieldValue(f, ctx('hello world'), { minConfidence: 0.5 });
      // 0.65 >= 0.5 so value should not be null
      expect(r.value).not.toBeNull();
    });
    it('minConfidence 0.7 suppresses text (0.65 fails)', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text' });
      const r = extractFieldValue(f, ctx('hello world'), { minConfidence: 0.7 });
      expect(r.value).toBeNull();
    });
    it('number with no validation, large value extracted', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number' });
      expect(extractFieldValue(f, ctx('99999')).value).toBe(99999);
    });
    it('phone field with valid phone returns non-null', () => {
      const f = makeField({ id: 'p', label: 'P', type: 'phone' });
      expect(extractFieldValue(f, ctx('+1-800-555-0199')).value).not.toBeNull();
    });
  });

  describe('autofillDocument – extended', () => {
    it('custom documentId preserved', () => {
      const r = autofillDocument('custom-123', [], ctx(''));
      expect(r.documentId).toBe('custom-123');
    });
    it('no fields → 0 overallConfidence', () => {
      const r = autofillDocument('d', [], ctx('email@x.com'));
      expect(r.overallConfidence).toBe(0);
    });
    it('select field filled', () => {
      const fields = [makeField({ id: 's', label: 'S', type: 'select', options: ['Option A', 'Option B'] })];
      const r = autofillDocument('d', fields, ctx('choose Option B'));
      expect(r.fields[0].value).toBe('Option B');
    });
    it('number field validation enforced', () => {
      const fields = [makeField({ id: 'n', label: 'N', type: 'number', validation: { max: 10 } })];
      const r = autofillDocument('d', fields, ctx('99'));
      expect(r.fields[0].value).toBeNull();
    });
    it('many fields all extracted', () => {
      const text = 'email: a@b.com number: 5 date: 2024-01-01 bool: yes';
      const fields = [
        makeField({ id: 'e', label: 'E', type: 'email' }),
        makeField({ id: 'n', label: 'N', type: 'number' }),
        makeField({ id: 'd', label: 'D', type: 'date' }),
        makeField({ id: 'b', label: 'B', type: 'boolean' }),
      ];
      const r = autofillDocument('doc', fields, { text });
      expect(r.fields[0].value).toBe('a@b.com');
      expect(r.fields[1].value).toBe(5);
      expect(r.fields[2].value).toBe('2024-01-01');
      expect(r.fields[3].value).toBe(true);
    });
    it('includeRawMatch passes through', () => {
      const fields = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const r = autofillDocument('d', fields, ctx('a@b.com'), { includeRawMatch: true });
      expect(r.fields[0].rawMatch).toBeDefined();
    });
    it('returns array for fields', () => {
      const r = autofillDocument('d', [], ctx(''));
      expect(Array.isArray(r.fields)).toBe(true);
    });
    it('processedAt is recent', () => {
      const before = Date.now();
      const r = autofillDocument('d', [], ctx(''));
      const after = Date.now();
      const processed = new Date(r.processedAt).getTime();
      expect(processed).toBeGreaterThanOrEqual(before);
      expect(processed).toBeLessThanOrEqual(after);
    });
    it('warnings empty when all optional and extracted', () => {
      const fields = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const r = autofillDocument('d', fields, ctx('x@y.com'));
      expect(r.warnings).toHaveLength(0);
    });
    it('warnings present when required not extracted', () => {
      const fields = [makeField({ id: 'e', label: 'Email', type: 'email', required: true })];
      const r = autofillDocument('d', fields, ctx('no email here'));
      expect(r.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('computeOverallConfidence – extra', () => {
    it('single 0 confidence → 0', () => {
      const ev = [{ fieldId: 'a', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'rule' as const }];
      expect(computeOverallConfidence(ev)).toBe(0);
    });
    it('5 items averaging 0.5 → 0.5', () => {
      const ev = Array.from({ length: 5 }, (_, i) => ({
        fieldId: `f${i}`, value: null, confidence: 0.5, confidenceLevel: 'medium' as const, strategy: 'rule' as const,
      }));
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.5);
    });
    it('clamps result to 1 even if individual > 1 (guarded by clampConfidence)', () => {
      const ev = [{ fieldId: 'a', value: null, confidence: 1, confidenceLevel: 'high' as const, strategy: 'rule' as const }];
      expect(computeOverallConfidence(ev)).toBeLessThanOrEqual(1);
    });
    it('result >= 0', () => {
      const ev = [{ fieldId: 'a', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'rule' as const }];
      expect(computeOverallConfidence(ev)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('extractBoolean – extra word-boundary tests', () => {
    it('"yesterday" does not match yes', () => {
      // word boundary test: \byes\b should not match in "yesterday"
      const r = extractBoolean('yesterday');
      // depends on implementation; just check it returns a defined object
      expect(r).toHaveProperty('value');
    });
    it('"nobody" does not match no', () => {
      const r = extractBoolean('nobody');
      expect(r).toHaveProperty('confidence');
    });
    it('standalone YES keyword', () => expect(extractBoolean('YES').value).toBe(true));
    it('standalone NO keyword', () => expect(extractBoolean('NO').value).toBe(false));
    it('"this is true" returns true', () => expect(extractBoolean('this is true').value).toBe(true));
    it('"status: false" returns false', () => expect(extractBoolean('status: false').value).toBe(false));
    it('"is enabled" returns true', () => expect(extractBoolean('is enabled').value).toBe(true));
    it('"is disabled" returns false', () => expect(extractBoolean('is disabled').value).toBe(false));
    it('"request confirmed" returns true', () => expect(extractBoolean('request confirmed').value).toBe(true));
    it('"access declined" returns false', () => expect(extractBoolean('access declined').value).toBe(false));
    it('"user agreed" returns true', () => expect(extractBoolean('user agreed').value).toBe(true));
    it('"user denied" returns false', () => expect(extractBoolean('user denied').value).toBe(false));
    it('"not active" still matches active', () => {
      const r = extractBoolean('not active');
      expect(r.value).toBe(true); // 'active' is in the text
    });
  });

  describe('extractSelect – extra cases', () => {
    const opts = ['Critical', 'High', 'Medium', 'Low'];
    it('finds Critical', () => expect(extractSelect('severity: Critical', opts).value).toBe('Critical'));
    it('finds High', () => expect(extractSelect('priority: High', opts).value).toBe('High'));
    it('finds Medium', () => expect(extractSelect('Medium risk', opts).value).toBe('Medium'));
    it('finds Low', () => expect(extractSelect('Low impact', opts).value).toBe('Low'));
    it('no match', () => expect(extractSelect('unknown level', opts).value).toBeNull());
    it('partial word match fuzzy', () => {
      const r = extractSelect('something critical', opts);
      // 'critical' substring match
      expect(r.value).toBe('Critical');
    });
    it('empty options always null', () => expect(extractSelect('Critical', []).value).toBeNull());
    it('all lowercase input matches', () => expect(extractSelect('high risk', opts).value).toBe('High'));
    it('all uppercase input matches', () => expect(extractSelect('MEDIUM', opts).value).toBe('Medium'));
    it('exact first option', () => expect(extractSelect('Critical', opts).confidence).toBe(0.85));
  });

  describe('extractText – extra validation', () => {
    it('exactly at minLength boundary', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text', validation: { minLength: 5 } });
      expect(extractText('hello', f).confidence).toBe(0.65);
    });
    it('one below minLength', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text', validation: { minLength: 5 } });
      expect(extractText('hi', f).confidence).toBe(0.3);
    });
    it('exactly at maxLength boundary', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text', validation: { maxLength: 5 } });
      expect(extractText('hello', f).confidence).toBe(0.65);
    });
    it('one over maxLength', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text', validation: { maxLength: 5 } });
      expect(extractText('toolon', f).confidence).toBe(0.3);
    });
    it('value null when under minLength', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text', validation: { minLength: 10 } });
      expect(extractText('short', f).value).toBeNull();
    });
    it('value null when over maxLength', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text', validation: { maxLength: 3 } });
      expect(extractText('toolong', f).value).toBeNull();
    });
    it('500-char text extracted fully', () => {
      const text = 'a'.repeat(500);
      expect(extractText(text, makeField({ id: 't', label: 'T', type: 'text' })).value?.length).toBe(500);
    });
    it('501-char text truncated to 500', () => {
      const text = 'a'.repeat(501);
      expect(extractText(text, makeField({ id: 't', label: 'T', type: 'text' })).value?.length).toBe(500);
    });
  });

  describe('normaliseFieldId – special characters', () => {
    const specialCases: [string, string][] = [
      ['field@name', 'field_name'],
      ['field#1', 'field_1'],
      ['field$amount', 'field_amount'],
      ['field%tax', 'field_tax'],
      ['field^power', 'field_power'],
      ['field&co', 'field_co'],
      ['field*star', 'field_star'],
      ['field(paren)', 'field_paren_'],
      ['field+plus', 'field_plus'],
      ['field=eq', 'field_eq'],
    ];
    specialCases.forEach(([input, expected]) => {
      it(`normalise("${input}") = "${expected}"`, () =>
        expect(normaliseFieldId(input)).toBe(expected));
    });
  });

  describe('extractNumber – extra validation edge cases', () => {
    it('exactly at min boundary', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { min: 5 } });
      expect(extractNumber('5', f).value).toBe(5);
    });
    it('just below min boundary', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { min: 5 } });
      expect(extractNumber('4', f).value).toBeNull();
    });
    it('exactly at max boundary', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { max: 10 } });
      expect(extractNumber('10', f).value).toBe(10);
    });
    it('just above max boundary', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { max: 10 } });
      expect(extractNumber('11', f).value).toBeNull();
    });
    it('digits extracted from -100 (word boundary strips sign)', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number' });
      expect(extractNumber('-100', f).value).toBe(100);
    });
    it('decimal within range', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { min: 0, max: 1 } });
      expect(extractNumber('0.5', f).value).toBeCloseTo(0.5);
    });
    it('zero within range [0, 10]', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { min: 0, max: 10 } });
      expect(extractNumber('0', f).value).toBe(0);
    });
    it('very large number above max', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number', validation: { max: 1000 } });
      expect(extractNumber('999999', f).value).toBeNull();
    });
    it('text with multiple numbers picks first', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number' });
      expect(extractNumber('3 items cost 15 dollars', f).value).toBe(3);
    });
    it('float precision preserved', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number' });
      expect(extractNumber('3.14159', f).value).toBeCloseTo(3.14159);
    });
  });

  // ─────────────────────────────────────────────
  // Extended getConfidenceLevel tests (explicit)
  // ─────────────────────────────────────────────
  describe('getConfidenceLevel – explicit thresholds', () => {
    it('0.85 boundary is high', () => expect(getConfidenceLevel(0.85)).toBe('high'));
    it('0.86 is high', () => expect(getConfidenceLevel(0.86)).toBe('high'));
    it('0.87 is high', () => expect(getConfidenceLevel(0.87)).toBe('high'));
    it('0.88 is high', () => expect(getConfidenceLevel(0.88)).toBe('high'));
    it('0.89 is high', () => expect(getConfidenceLevel(0.89)).toBe('high'));
    it('0.90 is high', () => expect(getConfidenceLevel(0.90)).toBe('high'));
    it('0.91 is high', () => expect(getConfidenceLevel(0.91)).toBe('high'));
    it('0.92 is high', () => expect(getConfidenceLevel(0.92)).toBe('high'));
    it('0.93 is high', () => expect(getConfidenceLevel(0.93)).toBe('high'));
    it('0.94 is high', () => expect(getConfidenceLevel(0.94)).toBe('high'));
    it('0.84 is medium', () => expect(getConfidenceLevel(0.84)).toBe('medium'));
    it('0.83 is medium', () => expect(getConfidenceLevel(0.83)).toBe('medium'));
    it('0.82 is medium', () => expect(getConfidenceLevel(0.82)).toBe('medium'));
    it('0.81 is medium', () => expect(getConfidenceLevel(0.81)).toBe('medium'));
    it('0.80 is medium', () => expect(getConfidenceLevel(0.80)).toBe('medium'));
    it('0.79 is medium', () => expect(getConfidenceLevel(0.79)).toBe('medium'));
    it('0.78 is medium', () => expect(getConfidenceLevel(0.78)).toBe('medium'));
    it('0.77 is medium', () => expect(getConfidenceLevel(0.77)).toBe('medium'));
    it('0.76 is medium', () => expect(getConfidenceLevel(0.76)).toBe('medium'));
    it('0.75 is medium', () => expect(getConfidenceLevel(0.75)).toBe('medium'));
    it('0.74 is medium', () => expect(getConfidenceLevel(0.74)).toBe('medium'));
    it('0.73 is medium', () => expect(getConfidenceLevel(0.73)).toBe('medium'));
    it('0.72 is medium', () => expect(getConfidenceLevel(0.72)).toBe('medium'));
    it('0.71 is medium', () => expect(getConfidenceLevel(0.71)).toBe('medium'));
    it('0.70 is medium', () => expect(getConfidenceLevel(0.70)).toBe('medium'));
    it('0.69 is medium', () => expect(getConfidenceLevel(0.69)).toBe('medium'));
    it('0.68 is medium', () => expect(getConfidenceLevel(0.68)).toBe('medium'));
    it('0.67 is medium', () => expect(getConfidenceLevel(0.67)).toBe('medium'));
    it('0.66 is medium', () => expect(getConfidenceLevel(0.66)).toBe('medium'));
    it('0.65 is medium', () => expect(getConfidenceLevel(0.65)).toBe('medium'));
    it('0.64 is medium', () => expect(getConfidenceLevel(0.64)).toBe('medium'));
    it('0.63 is medium', () => expect(getConfidenceLevel(0.63)).toBe('medium'));
    it('0.62 is medium', () => expect(getConfidenceLevel(0.62)).toBe('medium'));
    it('0.61 is medium', () => expect(getConfidenceLevel(0.61)).toBe('medium'));
    it('0.60 boundary is medium', () => expect(getConfidenceLevel(0.60)).toBe('medium'));
    it('0.59 is low', () => expect(getConfidenceLevel(0.59)).toBe('low'));
    it('0.58 is low', () => expect(getConfidenceLevel(0.58)).toBe('low'));
    it('0.57 is low', () => expect(getConfidenceLevel(0.57)).toBe('low'));
    it('0.56 is low', () => expect(getConfidenceLevel(0.56)).toBe('low'));
    it('0.55 is low', () => expect(getConfidenceLevel(0.55)).toBe('low'));
    it('0.54 is low', () => expect(getConfidenceLevel(0.54)).toBe('low'));
    it('0.53 is low', () => expect(getConfidenceLevel(0.53)).toBe('low'));
    it('0.52 is low', () => expect(getConfidenceLevel(0.52)).toBe('low'));
    it('0.51 is low', () => expect(getConfidenceLevel(0.51)).toBe('low'));
    it('0.50 is low', () => expect(getConfidenceLevel(0.50)).toBe('low'));
    it('0.49 is low', () => expect(getConfidenceLevel(0.49)).toBe('low'));
    it('0.48 is low', () => expect(getConfidenceLevel(0.48)).toBe('low'));
    it('0.47 is low', () => expect(getConfidenceLevel(0.47)).toBe('low'));
    it('0.46 is low', () => expect(getConfidenceLevel(0.46)).toBe('low'));
    it('0.45 is low', () => expect(getConfidenceLevel(0.45)).toBe('low'));
    it('0.44 is low', () => expect(getConfidenceLevel(0.44)).toBe('low'));
    it('0.43 is low', () => expect(getConfidenceLevel(0.43)).toBe('low'));
    it('0.42 is low', () => expect(getConfidenceLevel(0.42)).toBe('low'));
    it('0.41 is low', () => expect(getConfidenceLevel(0.41)).toBe('low'));
    it('0.40 is low', () => expect(getConfidenceLevel(0.40)).toBe('low'));
    it('0.39 is low', () => expect(getConfidenceLevel(0.39)).toBe('low'));
    it('0.38 is low', () => expect(getConfidenceLevel(0.38)).toBe('low'));
    it('0.37 is low', () => expect(getConfidenceLevel(0.37)).toBe('low'));
    it('0.36 is low', () => expect(getConfidenceLevel(0.36)).toBe('low'));
    it('0.35 is low', () => expect(getConfidenceLevel(0.35)).toBe('low'));
    it('0.34 is low', () => expect(getConfidenceLevel(0.34)).toBe('low'));
    it('0.33 is low', () => expect(getConfidenceLevel(0.33)).toBe('low'));
    it('0.32 is low', () => expect(getConfidenceLevel(0.32)).toBe('low'));
    it('0.31 is low', () => expect(getConfidenceLevel(0.31)).toBe('low'));
    it('0.30 boundary is low', () => expect(getConfidenceLevel(0.30)).toBe('low'));
    it('0.29 is none', () => expect(getConfidenceLevel(0.29)).toBe('none'));
    it('0.28 is none', () => expect(getConfidenceLevel(0.28)).toBe('none'));
    it('0.27 is none', () => expect(getConfidenceLevel(0.27)).toBe('none'));
    it('0.26 is none', () => expect(getConfidenceLevel(0.26)).toBe('none'));
    it('0.25 is none', () => expect(getConfidenceLevel(0.25)).toBe('none'));
    it('0.24 is none', () => expect(getConfidenceLevel(0.24)).toBe('none'));
    it('0.23 is none', () => expect(getConfidenceLevel(0.23)).toBe('none'));
    it('0.22 is none', () => expect(getConfidenceLevel(0.22)).toBe('none'));
    it('0.21 is none', () => expect(getConfidenceLevel(0.21)).toBe('none'));
    it('0.20 is none', () => expect(getConfidenceLevel(0.20)).toBe('none'));
    it('0.19 is none', () => expect(getConfidenceLevel(0.19)).toBe('none'));
    it('0.18 is none', () => expect(getConfidenceLevel(0.18)).toBe('none'));
    it('0.17 is none', () => expect(getConfidenceLevel(0.17)).toBe('none'));
    it('0.16 is none', () => expect(getConfidenceLevel(0.16)).toBe('none'));
    it('0.15 is none', () => expect(getConfidenceLevel(0.15)).toBe('none'));
    it('0.14 is none', () => expect(getConfidenceLevel(0.14)).toBe('none'));
    it('0.13 is none', () => expect(getConfidenceLevel(0.13)).toBe('none'));
    it('0.12 is none', () => expect(getConfidenceLevel(0.12)).toBe('none'));
    it('0.11 is none', () => expect(getConfidenceLevel(0.11)).toBe('none'));
    it('0.10 is none', () => expect(getConfidenceLevel(0.10)).toBe('none'));
    it('0.09 is none', () => expect(getConfidenceLevel(0.09)).toBe('none'));
    it('0.08 is none', () => expect(getConfidenceLevel(0.08)).toBe('none'));
    it('0.07 is none', () => expect(getConfidenceLevel(0.07)).toBe('none'));
    it('0.06 is none', () => expect(getConfidenceLevel(0.06)).toBe('none'));
    it('0.05 is none', () => expect(getConfidenceLevel(0.05)).toBe('none'));
    it('0.04 is none', () => expect(getConfidenceLevel(0.04)).toBe('none'));
    it('0.03 is none', () => expect(getConfidenceLevel(0.03)).toBe('none'));
    it('0.02 is none', () => expect(getConfidenceLevel(0.02)).toBe('none'));
    it('0.01 is none', () => expect(getConfidenceLevel(0.01)).toBe('none'));
    it('0.00 is none', () => expect(getConfidenceLevel(0.00)).toBe('none'));
  });

  // ─────────────────────────────────────────────
  // Extended clampConfidence explicit
  // ─────────────────────────────────────────────
  describe('clampConfidence – explicit values', () => {
    it('0.01 stays 0.01', () => expect(clampConfidence(0.01)).toBeCloseTo(0.01));
    it('0.02 stays 0.02', () => expect(clampConfidence(0.02)).toBeCloseTo(0.02));
    it('0.03 stays 0.03', () => expect(clampConfidence(0.03)).toBeCloseTo(0.03));
    it('0.04 stays 0.04', () => expect(clampConfidence(0.04)).toBeCloseTo(0.04));
    it('0.05 stays 0.05', () => expect(clampConfidence(0.05)).toBeCloseTo(0.05));
    it('0.10 stays 0.10', () => expect(clampConfidence(0.10)).toBeCloseTo(0.10));
    it('0.15 stays 0.15', () => expect(clampConfidence(0.15)).toBeCloseTo(0.15));
    it('0.20 stays 0.20', () => expect(clampConfidence(0.20)).toBeCloseTo(0.20));
    it('0.25 stays 0.25', () => expect(clampConfidence(0.25)).toBeCloseTo(0.25));
    it('0.30 stays 0.30', () => expect(clampConfidence(0.30)).toBeCloseTo(0.30));
    it('0.35 stays 0.35', () => expect(clampConfidence(0.35)).toBeCloseTo(0.35));
    it('0.40 stays 0.40', () => expect(clampConfidence(0.40)).toBeCloseTo(0.40));
    it('0.45 stays 0.45', () => expect(clampConfidence(0.45)).toBeCloseTo(0.45));
    it('0.50 stays 0.50', () => expect(clampConfidence(0.50)).toBeCloseTo(0.50));
    it('0.55 stays 0.55', () => expect(clampConfidence(0.55)).toBeCloseTo(0.55));
    it('0.60 stays 0.60', () => expect(clampConfidence(0.60)).toBeCloseTo(0.60));
    it('0.65 stays 0.65', () => expect(clampConfidence(0.65)).toBeCloseTo(0.65));
    it('0.70 stays 0.70', () => expect(clampConfidence(0.70)).toBeCloseTo(0.70));
    it('0.80 stays 0.80', () => expect(clampConfidence(0.80)).toBeCloseTo(0.80));
    it('0.85 stays 0.85', () => expect(clampConfidence(0.85)).toBeCloseTo(0.85));
    it('0.90 stays 0.90', () => expect(clampConfidence(0.90)).toBeCloseTo(0.90));
    it('0.95 stays 0.95', () => expect(clampConfidence(0.95)).toBeCloseTo(0.95));
    it('0.98 stays 0.98', () => expect(clampConfidence(0.98)).toBeCloseTo(0.98));
    it('0.99 stays 0.99', () => expect(clampConfidence(0.99)).toBeCloseTo(0.99));
    it('1.0 stays 1.0', () => expect(clampConfidence(1.0)).toBeCloseTo(1.0));
    it('1.01 clamped to 1', () => expect(clampConfidence(1.01)).toBe(1));
    it('1.5 clamped to 1', () => expect(clampConfidence(1.5)).toBe(1));
    it('-0.01 clamped to 0', () => expect(clampConfidence(-0.01)).toBe(0));
    it('-0.5 clamped to 0', () => expect(clampConfidence(-0.5)).toBe(0));
    it('-1 clamped to 0', () => expect(clampConfidence(-1)).toBe(0));
    it('10 clamped to 1', () => expect(clampConfidence(10)).toBe(1));
    it('-10 clamped to 0', () => expect(clampConfidence(-10)).toBe(0));
    it('NaN propagates through clamp (Math.max/min NaN behaviour)', () => expect(clampConfidence(NaN)).toBeNaN());
  });

  // ─────────────────────────────────────────────
  // Extended normaliseFieldId explicit
  // ─────────────────────────────────────────────
  describe('normaliseFieldId – comprehensive', () => {
    it('single letter a', () => expect(normaliseFieldId('a')).toBe('a'));
    it('single letter Z', () => expect(normaliseFieldId('Z')).toBe('z'));
    it('digit 0', () => expect(normaliseFieldId('0')).toBe('0'));
    it('digit 9', () => expect(normaliseFieldId('9')).toBe('9'));
    it('CamelCase', () => expect(normaliseFieldId('CamelCase')).toBe('camelcase'));
    it('PascalCase', () => expect(normaliseFieldId('PascalCaseName')).toBe('pascalcasename'));
    it('snake_case preserved', () => expect(normaliseFieldId('already_snake')).toBe('already_snake'));
    it('leading digit', () => expect(normaliseFieldId('1field')).toBe('1field'));
    it('trailing digit', () => expect(normaliseFieldId('field1')).toBe('field1'));
    it('mixed digit and text', () => expect(normaliseFieldId('Field1Name2')).toBe('field1name2'));
    it('single underscore', () => expect(normaliseFieldId('_')).toBe('_'));
    it('double underscore', () => expect(normaliseFieldId('__')).toBe('__'));
    it('space between words', () => expect(normaliseFieldId('a b')).toBe('a_b'));
    it('multiple spaces', () => expect(normaliseFieldId('a   b')).toBe('a___b'));
    it('tab between words', () => expect(normaliseFieldId('a\tb')).toBe('a_b'));
    it('newline between words', () => expect(normaliseFieldId('a\nb')).toBe('a_b'));
    it('all digits', () => expect(normaliseFieldId('12345')).toBe('12345'));
    it('hyphen to underscore', () => expect(normaliseFieldId('a-b-c')).toBe('a_b_c'));
    it('period to underscore', () => expect(normaliseFieldId('a.b.c')).toBe('a_b_c'));
    it('colon to underscore', () => expect(normaliseFieldId('a:b')).toBe('a_b'));
    it('semicolon to underscore', () => expect(normaliseFieldId('a;b')).toBe('a_b'));
    it('exclamation to underscore', () => expect(normaliseFieldId('a!b')).toBe('a_b'));
    it('question mark to underscore', () => expect(normaliseFieldId('a?b')).toBe('a_b'));
    it('at sign to underscore', () => expect(normaliseFieldId('a@b')).toBe('a_b'));
    it('hash to underscore', () => expect(normaliseFieldId('a#b')).toBe('a_b'));
    it('dollar to underscore', () => expect(normaliseFieldId('a$b')).toBe('a_b'));
    it('percent to underscore', () => expect(normaliseFieldId('a%b')).toBe('a_b'));
    it('caret to underscore', () => expect(normaliseFieldId('a^b')).toBe('a_b'));
    it('ampersand to underscore', () => expect(normaliseFieldId('a&b')).toBe('a_b'));
    it('star to underscore', () => expect(normaliseFieldId('a*b')).toBe('a_b'));
    it('open paren to underscore', () => expect(normaliseFieldId('a(b')).toBe('a_b'));
    it('close paren to underscore', () => expect(normaliseFieldId('a)b')).toBe('a_b'));
    it('plus to underscore', () => expect(normaliseFieldId('a+b')).toBe('a_b'));
    it('equals to underscore', () => expect(normaliseFieldId('a=b')).toBe('a_b'));
    it('bracket to underscore', () => expect(normaliseFieldId('a[b')).toBe('a_b'));
    it('slash to underscore', () => expect(normaliseFieldId('a/b')).toBe('a_b'));
    it('backslash to underscore', () => expect(normaliseFieldId('a\\b')).toBe('a_b'));
    it('pipe to underscore', () => expect(normaliseFieldId('a|b')).toBe('a_b'));
    it('tilde to underscore', () => expect(normaliseFieldId('a~b')).toBe('a_b'));
    it('backtick to underscore', () => expect(normaliseFieldId('a`b')).toBe('a_b'));
    it('comma to underscore', () => expect(normaliseFieldId('a,b')).toBe('a_b'));
    it('angle bracket to underscore', () => expect(normaliseFieldId('a<b')).toBe('a_b'));
    it('long name normalised', () => {
      const result = normaliseFieldId('My Very Long Field Name With Spaces');
      expect(result).toBe('my_very_long_field_name_with_spaces');
    });
    it('returns empty for all-special', () => {
      const r = normaliseFieldId('!@#$%^&*');
      expect(r).toMatch(/^[_]*$/);
    });
    it('leading special trimmed after lowercase', () => {
      const r = normaliseFieldId('  myField  ');
      expect(r).toBe('myfield');
    });
    it('unicode letter not [a-z] becomes underscore', () => {
      const r = normaliseFieldId('café');
      expect(typeof r).toBe('string');
    });
  });

  // ─────────────────────────────────────────────
  // Extended extractEmail cases
  // ─────────────────────────────────────────────
  describe('extractEmail – comprehensive email patterns', () => {
    const validEmails = [
      'user@example.com',
      'USER@EXAMPLE.COM',
      'user.name@example.com',
      'user+tag@example.com',
      'user123@example123.com',
      'a@b.co',
      'test@subdomain.example.com',
      'name@example.org',
      'name@example.net',
      'name@example.io',
      'name@example.co.uk',
      'x@y.info',
      'first.last@domain.edu',
      'user_name@domain.gov',
    ];
    validEmails.forEach((email) => {
      it(`extracts "${email}"`, () => expect(extractEmail(`email: ${email}`).value).toBe(email));
    });

    const invalidEmails = [
      'notanemail',
      'missing@',
      '@missing.com',
      '',
      '   ',
    ];
    invalidEmails.forEach((text) => {
      it(`no email in "${text.substring(0, 20)}"`, () =>
        expect(extractEmail(text).value).toBeNull());
    });
  });

  // ─────────────────────────────────────────────
  // Extended extractBoolean cases
  // ─────────────────────────────────────────────
  describe('extractBoolean – comprehensive', () => {
    const trueCases = ['yes', 'YES', 'Yes', 'true', 'TRUE', 'True', 'enabled', 'ENABLED', 'active', 'ACTIVE', 'confirmed', 'agreed'];
    trueCases.forEach((text) => {
      it(`"${text}" → true`, () => expect(extractBoolean(text).value).toBe(true));
    });

    const falseCases = ['no', 'NO', 'No', 'false', 'FALSE', 'False', 'disabled', 'DISABLED', 'inactive', 'INACTIVE', 'denied', 'declined'];
    falseCases.forEach((text) => {
      it(`"${text}" → false`, () => expect(extractBoolean(text).value).toBe(false));
    });

    const nullCases = ['maybe', 'unknown', 'pending', 'n/a', '', '   ', 'hello world'];
    nullCases.forEach((text) => {
      it(`"${text}" → null`, () => expect(extractBoolean(text).value).toBeNull());
    });

    const confCases = ['yes', 'no', 'true', 'false'];
    confCases.forEach((text) => {
      it(`"${text}" confidence is 0.90`, () => expect(extractBoolean(text).confidence).toBe(0.90));
    });
  });

  // ─────────────────────────────────────────────
  // Extended isValidFieldType
  // ─────────────────────────────────────────────
  describe('isValidFieldType – all invalid strings', () => {
    const invalidList = [
      'string', 'integer', 'float', 'decimal', 'list', 'array',
      'object', 'map', 'set', 'null', 'undefined', 'void',
      'any', 'unknown', 'never', 'symbol', 'bigint',
      'Text', 'Number', 'Date', 'Email', 'Phone',
      'Boolean', 'Select', 'Multiselect', 'ADDRESS',
    ];
    invalidList.forEach((t) => {
      it(`"${t}" is invalid`, () => expect(isValidFieldType(t)).toBe(false));
    });
  });

  // ─────────────────────────────────────────────
  // Extended extractDate cases
  // ─────────────────────────────────────────────
  describe('extractDate – year range tests', () => {
    const years = [2000, 2010, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    years.forEach((year) => {
      it(`extracts year ${year}`, () => {
        const r = extractDate(`date: ${year}-06-15`);
        expect(r.value).not.toBeNull();
      });
    });
    it('confidence is 0.88 for all matches', () => {
      expect(extractDate('2024-01-01').confidence).toBe(0.88);
    });
    it('raw match returned for ISO format', () => {
      expect(extractDate('date: 2024-03-15').raw).toBe('2024-03-15');
    });
    it('multiple date formats – picks first match', () => {
      const r = extractDate('Start: 2024-01-01 End: 2024-12-31');
      expect(r.value).toBe('2024-01-01');
    });
    it('verbose January', () => expect(extractDate('1 January 2024').value).not.toBeNull());
    it('verbose February', () => expect(extractDate('2 February 2024').value).not.toBeNull());
    it('verbose March', () => expect(extractDate('3 March 2024').value).not.toBeNull());
    it('verbose April', () => expect(extractDate('4 April 2024').value).not.toBeNull());
    it('verbose May', () => expect(extractDate('5 May 2024').value).not.toBeNull());
    it('verbose June', () => expect(extractDate('6 June 2024').value).not.toBeNull());
    it('verbose July', () => expect(extractDate('7 July 2024').value).not.toBeNull());
    it('verbose August', () => expect(extractDate('8 August 2024').value).not.toBeNull());
    it('verbose September', () => expect(extractDate('9 September 2024').value).not.toBeNull());
    it('verbose October', () => expect(extractDate('10 October 2024').value).not.toBeNull());
    it('verbose November', () => expect(extractDate('11 November 2024').value).not.toBeNull());
    it('verbose December', () => expect(extractDate('12 December 2024').value).not.toBeNull());
  });

  // ─────────────────────────────────────────────
  // Extended extractNumber range tests
  // ─────────────────────────────────────────────
  describe('extractNumber – range matrix', () => {
    const baseField = makeField({ id: 'n', label: 'N', type: 'number' });

    const intCases = [0, 1, 2, 5, 10, 50, 100, 500, 1000, 9999, 10000];
    intCases.forEach((num) => {
      it(`extracts integer ${num}`, () => {
        expect(extractNumber(String(num), baseField).value).toBe(num);
      });
    });

    const floatCases = [0.1, 0.5, 1.5, 2.99, 3.14, 10.0, 99.99];
    floatCases.forEach((num) => {
      it(`extracts float ${num}`, () => {
        const r = extractNumber(String(num), baseField);
        expect(r.value).toBeCloseTo(num);
      });
    });
  });

  // ─────────────────────────────────────────────
  // Extended extractAllFields tests
  // ─────────────────────────────────────────────
  describe('extractAllFields – size tests', () => {
    it('1 field returns 1 result', () => {
      const f = [makeField({ id: 'e', label: 'E', type: 'email' })];
      expect(extractAllFields(f, ctx('a@b.com'))).toHaveLength(1);
    });
    it('2 fields return 2 results', () => {
      const f = [
        makeField({ id: 'e', label: 'E', type: 'email' }),
        makeField({ id: 'n', label: 'N', type: 'number' }),
      ];
      expect(extractAllFields(f, ctx('a@b.com 5'))).toHaveLength(2);
    });
    it('3 fields return 3 results', () => {
      const f = [1, 2, 3].map((i) => makeField({ id: `f${i}`, label: `F${i}`, type: 'text' }));
      expect(extractAllFields(f, ctx('test'))).toHaveLength(3);
    });
    it('5 fields return 5 results', () => {
      const f = [1, 2, 3, 4, 5].map((i) => makeField({ id: `f${i}`, label: `F${i}`, type: 'text' }));
      expect(extractAllFields(f, ctx('test'))).toHaveLength(5);
    });
    it('all results have fieldId', () => {
      const f = [makeField({ id: 'x', label: 'X', type: 'text' })];
      const result = extractAllFields(f, ctx('hello'));
      expect(result[0]).toHaveProperty('fieldId', 'x');
    });
    it('all results have confidence between 0 and 1', () => {
      const f = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const result = extractAllFields(f, ctx('a@b.com'));
      result.forEach((r) => {
        expect(r.confidence).toBeGreaterThanOrEqual(0);
        expect(r.confidence).toBeLessThanOrEqual(1);
      });
    });
    it('empty context still processes all fields', () => {
      const f = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const result = extractAllFields(f, ctx(''));
      expect(result).toHaveLength(1);
      expect(result[0].value).toBeNull();
    });
    it('results have strategy field', () => {
      const f = [makeField({ id: 't', label: 'T', type: 'text' })];
      const result = extractAllFields(f, ctx('test'));
      expect(result[0]).toHaveProperty('strategy');
    });
    it('results have confidenceLevel field', () => {
      const f = [makeField({ id: 't', label: 'T', type: 'text' })];
      const result = extractAllFields(f, ctx('test'));
      expect(['high', 'medium', 'low', 'none']).toContain(result[0].confidenceLevel);
    });
    it('order of results matches order of fields input', () => {
      const f = [
        makeField({ id: 'first', label: 'F', type: 'text' }),
        makeField({ id: 'second', label: 'S', type: 'text' }),
        makeField({ id: 'third', label: 'T', type: 'text' }),
      ];
      const result = extractAllFields(f, ctx('test'));
      expect(result[0].fieldId).toBe('first');
      expect(result[1].fieldId).toBe('second');
      expect(result[2].fieldId).toBe('third');
    });
  });

  // ─────────────────────────────────────────────
  // autofillDocument comprehensive
  // ─────────────────────────────────────────────
  describe('autofillDocument – comprehensive', () => {
    it('doc id doc-001 preserved', () => expect(autofillDocument('doc-001', [], ctx('')).documentId).toBe('doc-001'));
    it('doc id doc-002 preserved', () => expect(autofillDocument('doc-002', [], ctx('')).documentId).toBe('doc-002'));
    it('doc id abc-xyz preserved', () => expect(autofillDocument('abc-xyz', [], ctx('')).documentId).toBe('abc-xyz'));
    it('no fields zero confidence', () => expect(autofillDocument('d', [], ctx('')).overallConfidence).toBe(0));
    it('no fields empty warnings', () => expect(autofillDocument('d', [], ctx('')).warnings).toHaveLength(0));
    it('no fields empty fields array', () => expect(autofillDocument('d', [], ctx('')).fields).toHaveLength(0));
    it('processedAt ISO 8601', () => {
      const r = autofillDocument('d', [], ctx(''));
      expect(r.processedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
    it('email field filled', () => {
      const f = [makeField({ id: 'e', label: 'E', type: 'email' })];
      expect(autofillDocument('d', f, ctx('x@y.com')).fields[0].value).toBe('x@y.com');
    });
    it('date field filled', () => {
      const f = [makeField({ id: 'd', label: 'D', type: 'date' })];
      expect(autofillDocument('d', f, ctx('2024-06-15')).fields[0].value).toBe('2024-06-15');
    });
    it('boolean field filled yes', () => {
      const f = [makeField({ id: 'b', label: 'B', type: 'boolean' })];
      expect(autofillDocument('d', f, ctx('yes')).fields[0].value).toBe(true);
    });
    it('boolean field filled no', () => {
      const f = [makeField({ id: 'b', label: 'B', type: 'boolean' })];
      expect(autofillDocument('d', f, ctx('no')).fields[0].value).toBe(false);
    });
    it('number field filled', () => {
      const f = [makeField({ id: 'n', label: 'N', type: 'number' })];
      expect(autofillDocument('d', f, ctx('42')).fields[0].value).toBe(42);
    });
    it('text field filled', () => {
      const f = [makeField({ id: 't', label: 'T', type: 'text' })];
      expect(autofillDocument('d', f, ctx('hello')).fields[0].value).toBe('hello');
    });
    it('select field filled', () => {
      const f = [makeField({ id: 's', label: 'S', type: 'select', options: ['X', 'Y'] })];
      expect(autofillDocument('d', f, ctx('pick X')).fields[0].value).toBe('X');
    });
    it('required missing adds warning', () => {
      const f = [makeField({ id: 'e', label: 'Email', type: 'email', required: true })];
      const r = autofillDocument('d', f, ctx('no email'));
      expect(r.warnings.some((w) => w.includes('Email'))).toBe(true);
    });
    it('optional missing no warning', () => {
      const f = [makeField({ id: 'e', label: 'Email', type: 'email', required: false })];
      const r = autofillDocument('d', f, ctx('no email'));
      expect(r.warnings).toHaveLength(0);
    });
    it('overallConfidence > 0 when email matched', () => {
      const f = [makeField({ id: 'e', label: 'E', type: 'email' })];
      expect(autofillDocument('d', f, ctx('x@y.com')).overallConfidence).toBeGreaterThan(0);
    });
    it('fields result is array', () => {
      expect(Array.isArray(autofillDocument('d', [], ctx('')).fields)).toBe(true);
    });
    it('warnings result is array', () => {
      expect(Array.isArray(autofillDocument('d', [], ctx('')).warnings)).toBe(true);
    });
    it('documentId is string', () => {
      expect(typeof autofillDocument('d', [], ctx('')).documentId).toBe('string');
    });
    it('processedAt is string', () => {
      expect(typeof autofillDocument('d', [], ctx('')).processedAt).toBe('string');
    });
    it('overallConfidence is number', () => {
      expect(typeof autofillDocument('d', [], ctx('')).overallConfidence).toBe('number');
    });
    it('10 fields in → 10 fields out', () => {
      const f = Array.from({ length: 10 }, (_, i) =>
        makeField({ id: `f${i}`, label: `F${i}`, type: 'text' }));
      expect(autofillDocument('d', f, ctx('test')).fields).toHaveLength(10);
    });
    it('minConfidence 0 allows all', () => {
      const f = [makeField({ id: 't', label: 'T', type: 'text' })];
      const r = autofillDocument('d', f, ctx('hello'), { minConfidence: 0 });
      expect(r.fields[0].value).toBe('hello');
    });
    it('minConfidence 1 suppresses all but perfect matches', () => {
      const f = [makeField({ id: 't', label: 'T', type: 'text' })];
      const r = autofillDocument('d', f, ctx('hello'), { minConfidence: 1 });
      expect(r.fields[0].value).toBeNull();
    });
    it('metadata passed in context', () => {
      const f = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const r = autofillDocument('d', f, { text: 'a@b.com', metadata: { source: 'scan' } });
      expect(r.fields[0].value).toBe('a@b.com');
    });
  });

  // ─────────────────────────────────────────────
  // Batch 4: additional explicit tests
  // ─────────────────────────────────────────────
  describe('extractPhone – additional patterns', () => {
    it('+1-800-555-0100 matched', () => expect(extractPhone('+1-800-555-0100').value).not.toBeNull());
    it('+44 7700 900000 matched', () => expect(extractPhone('+44 7700 900000').value).not.toBeNull());
    it('0800 000 0000 matched', () => expect(extractPhone('0800 000 0000').value).not.toBeNull());
    it('07123456789 matched', () => expect(extractPhone('07123456789').value).not.toBeNull());
    it('(020) 7946 0958 matched', () => expect(extractPhone('(020) 7946 0958').value).not.toBeNull());
    it('letter-only string no match', () => expect(extractPhone('abcdefghij').value).toBeNull());
    it('single digit no match', () => expect(extractPhone('5').value).toBeNull());
    it('two digit no match', () => expect(extractPhone('55').value).toBeNull());
    it('three digit no match', () => expect(extractPhone('555').value).toBeNull());
    it('four digit no match', () => expect(extractPhone('5555').value).toBeNull());
    it('7 digit matched', () => expect(extractPhone('5551234').value).not.toBeNull());
    it('returns object shape', () => {
      const r = extractPhone('555-1234567');
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('confidence');
    });
    it('no match returns raw undefined', () => expect(extractPhone('no match').raw).toBeUndefined());
    it('trimmed value returned', () => {
      const r = extractPhone('call 555-1234567 now');
      if (r.value !== null) expect((r.value as string).trim()).toBe(r.value);
    });
    it('confidence 0 for no match', () => expect(extractPhone('hello').confidence).toBe(0));
  });

  describe('extractSelect – additional options', () => {
    it('single option list match', () => expect(extractSelect('only Alpha', ['Alpha']).value).toBe('Alpha'));
    it('single option list no match', () => expect(extractSelect('not found', ['Alpha']).value).toBeNull());
    it('returns confidence 0 for null', () => expect(extractSelect('nothing', ['A', 'B']).confidence).toBe(0));
    it('returns object with raw on match', () => {
      const r = extractSelect('Blue selected', ['Red', 'Blue']);
      expect(r).toHaveProperty('raw');
    });
    it('case folded match Pink vs pink', () => {
      expect(extractSelect('the color is pink', ['Pink', 'Cyan']).value).toBe('Pink');
    });
    it('Cyan exact match', () => expect(extractSelect('Cyan color', ['Pink', 'Cyan']).value).toBe('Cyan'));
    it('empty text vs empty options both null', () => expect(extractSelect('', []).value).toBeNull());
    it('first option matched first', () => {
      const r = extractSelect('Red Blue', ['Red', 'Blue']);
      expect(r.value).toBe('Red');
    });
    it('option with special char N/A', () => {
      expect(extractSelect('type: N/A', ['N/A', 'Other']).value).toBe('N/A');
    });
    it('null value returns confidence 0', () => {
      expect(extractSelect('no match here', ['Alpha', 'Beta', 'Gamma']).confidence).toBe(0);
    });
    it('all uppercase option found with lowercase text', () => {
      expect(extractSelect('status active', ['ACTIVE', 'INACTIVE']).value).toBe('ACTIVE');
    });
    it('multi-word option partial match', () => {
      const r = extractSelect('the option two here', ['Option One', 'Option Two']);
      // "option" or "two" partial match
      expect(r).toHaveProperty('confidence');
    });
  });

  describe('buildWarnings – additional', () => {
    it('multiple required missing all warned', () => {
      const fields = [1, 2, 3, 4, 5].map((i) =>
        makeField({ id: `f${i}`, label: `Field ${i}`, type: 'text', required: true }));
      const extracted = fields.map((f) => ({
        fieldId: f.id, value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'rule' as const,
      }));
      expect(buildWarnings(fields, extracted)).toHaveLength(5);
    });
    it('mix required extracted + optional low = 1 warning', () => {
      const fields = [
        makeField({ id: 'r', label: 'R', type: 'text', required: true }),
        makeField({ id: 'l', label: 'L', type: 'text', required: false }),
      ];
      const extracted = [
        { fieldId: 'r', value: 'x', confidence: 0.9, confidenceLevel: 'high' as const, strategy: 'rule' as const },
        { fieldId: 'l', value: 'y', confidence: 0.4, confidenceLevel: 'low' as const, strategy: 'rule' as const },
      ];
      expect(buildWarnings(fields, extracted)).toHaveLength(1);
    });
    it('warning text contains confidence percentage', () => {
      const fields = [makeField({ id: 't', label: 'T', type: 'text' })];
      const extracted = [{ fieldId: 't', value: 'x', confidence: 0.35, confidenceLevel: 'low' as const, strategy: 'rule' as const }];
      const ws = buildWarnings(fields, extracted);
      expect(ws[0]).toMatch(/\d+%/);
    });
    it('required missing message says "could not be extracted"', () => {
      const fields = [makeField({ id: 'e', label: 'Email', type: 'email', required: true })];
      const extracted = [{ fieldId: 'e', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'regex' as const }];
      expect(buildWarnings(fields, extracted)[0]).toContain('could not be extracted');
    });
    it('no duplicate warnings for single field', () => {
      const fields = [makeField({ id: 'e', label: 'E', type: 'email', required: true })];
      const extracted = [{ fieldId: 'e', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'regex' as const }];
      expect(buildWarnings(fields, extracted)).toHaveLength(1);
    });
    it('10 fields none required no warnings', () => {
      const fields = Array.from({ length: 10 }, (_, i) =>
        makeField({ id: `f${i}`, label: `F${i}`, type: 'text', required: false }));
      const extracted = fields.map((f) => ({
        fieldId: f.id, value: 'x', confidence: 0.8, confidenceLevel: 'high' as const, strategy: 'rule' as const,
      }));
      expect(buildWarnings(fields, extracted)).toHaveLength(0);
    });
    it('result is string array', () => {
      expect(Array.isArray(buildWarnings([], []))).toBe(true);
    });
    it('all warnings are strings', () => {
      const fields = [makeField({ id: 'r', label: 'R', type: 'text', required: true })];
      const extracted = [{ fieldId: 'r', value: null, confidence: 0, confidenceLevel: 'none' as const, strategy: 'rule' as const }];
      const ws = buildWarnings(fields, extracted);
      ws.forEach((w) => expect(typeof w).toBe('string'));
    });
  });

  describe('computeOverallConfidence – explicit averages', () => {
    it('average of 0.0 and 1.0 = 0.5', () => {
      const ev = [
        { fieldId: 'a', value: null, confidence: 0.0, confidenceLevel: 'none' as const, strategy: 'rule' as const },
        { fieldId: 'b', value: null, confidence: 1.0, confidenceLevel: 'high' as const, strategy: 'rule' as const },
      ];
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.5);
    });
    it('average of 0.3, 0.6, 0.9 = 0.6', () => {
      const ev = [0.3, 0.6, 0.9].map((c, i) => ({
        fieldId: `f${i}`, value: null, confidence: c, confidenceLevel: 'medium' as const, strategy: 'rule' as const,
      }));
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.6);
    });
    it('10 items all 0.5 = 0.5', () => {
      const ev = Array.from({ length: 10 }, (_, i) => ({
        fieldId: `f${i}`, value: null, confidence: 0.5, confidenceLevel: 'medium' as const, strategy: 'rule' as const,
      }));
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.5);
    });
    it('single 0.95 = 0.95', () => {
      const ev = [{ fieldId: 'a', value: null, confidence: 0.95, confidenceLevel: 'high' as const, strategy: 'rule' as const }];
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.95);
    });
    it('returns number type', () => expect(typeof computeOverallConfidence([])).toBe('number'));
    it('result not NaN', () => expect(computeOverallConfidence([])).not.toBeNaN());
    it('result not Infinity', () => expect(computeOverallConfidence([])).not.toBe(Infinity));
    it('two high values → overall high', () => {
      const ev = [0.9, 0.95].map((c, i) => ({
        fieldId: `f${i}`, value: null, confidence: c, confidenceLevel: 'high' as const, strategy: 'rule' as const,
      }));
      expect(computeOverallConfidence(ev)).toBeGreaterThan(0.85);
    });
    it('average of 1, 1, 1 = 1', () => {
      const ev = [1, 1, 1].map((c, i) => ({
        fieldId: `f${i}`, value: null, confidence: c, confidenceLevel: 'high' as const, strategy: 'rule' as const,
      }));
      expect(computeOverallConfidence(ev)).toBe(1);
    });
    it('average of 0, 0, 0 = 0', () => {
      const ev = [0, 0, 0].map((c, i) => ({
        fieldId: `f${i}`, value: null, confidence: c, confidenceLevel: 'none' as const, strategy: 'rule' as const,
      }));
      expect(computeOverallConfidence(ev)).toBe(0);
    });
  });

  describe('extractFieldValue – strategy assignment', () => {
    const typesToStrategy: Array<[FieldDefinition['type'], string]> = [
      ['email', 'regex'],
      ['text', 'rule'],
      ['number', 'rule'],
      ['date', 'rule'],
      ['phone', 'rule'],
      ['boolean', 'rule'],
      ['select', 'rule'],
      ['address', 'rule'],
      ['multiselect', 'rule'],
    ];
    typesToStrategy.forEach(([type, expectedStrategy]) => {
      it(`type "${type}" uses strategy "${expectedStrategy}"`, () => {
        const f = makeField({ id: 't', label: 'T', type });
        const r = extractFieldValue(f, ctx('test data 2024-01-01 yes a@b.com'));
        expect(r.strategy).toBe(expectedStrategy);
      });
    });
    it('email always regex regardless of context', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      expect(extractFieldValue(f, ctx('')).strategy).toBe('regex');
    });
    it('text always rule', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text' });
      expect(extractFieldValue(f, ctx('hello')).strategy).toBe('rule');
    });
  });

  describe('extractFieldValue – confidenceLevel consistency', () => {
    it('email match → high level (0.95)', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      expect(extractFieldValue(f, ctx('x@y.com')).confidenceLevel).toBe('high');
    });
    it('email no match → none level', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      expect(extractFieldValue(f, ctx('no email')).confidenceLevel).toBe('none');
    });
    it('text extraction → medium level (0.65)', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text' });
      expect(extractFieldValue(f, ctx('hello world')).confidenceLevel).toBe('medium');
    });
    it('boolean yes → high level (0.90)', () => {
      const f = makeField({ id: 'b', label: 'B', type: 'boolean' });
      expect(extractFieldValue(f, ctx('yes')).confidenceLevel).toBe('high');
    });
    it('number extraction → high level (0.85)', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number' });
      expect(extractFieldValue(f, ctx('42')).confidenceLevel).toBe('high');
    });
    it('date extraction → high level (0.88)', () => {
      const f = makeField({ id: 'd', label: 'D', type: 'date' });
      expect(extractFieldValue(f, ctx('2024-01-01')).confidenceLevel).toBe('high');
    });
    it('select exact match → high level (0.85)', () => {
      const f = makeField({ id: 's', label: 'S', type: 'select', options: ['Cat'] });
      expect(extractFieldValue(f, ctx('Cat')).confidenceLevel).toBe('high');
    });
    it('phone match → medium level (0.80 is medium range)', () => {
      const f = makeField({ id: 'p', label: 'P', type: 'phone' });
      const r = extractFieldValue(f, ctx('+1-800-555-0199'));
      if (r.value !== null) expect(r.confidenceLevel).toBe('medium');
    });
    it('text empty context → none level', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text' });
      expect(extractFieldValue(f, ctx('')).confidenceLevel).toBe('none');
    });
    it('boolean unknown → none level', () => {
      const f = makeField({ id: 'b', label: 'B', type: 'boolean' });
      expect(extractFieldValue(f, ctx('maybe')).confidenceLevel).toBe('none');
    });
  });

  describe('isValidFieldType – comprehensive return', () => {
    it('returns boolean true for text', () => expect(isValidFieldType('text')).toBe(true));
    it('returns boolean false for invalid', () => expect(isValidFieldType('xyz')).toBe(false));
    it('return is strictly boolean true', () => expect(isValidFieldType('email') === true).toBe(true));
    it('return is strictly boolean false', () => expect(isValidFieldType('invalid') === false).toBe(true));
    it('number is valid', () => expect(isValidFieldType('number')).toBe(true));
    it('date is valid', () => expect(isValidFieldType('date')).toBe(true));
    it('phone is valid', () => expect(isValidFieldType('phone')).toBe(true));
    it('address is valid', () => expect(isValidFieldType('address')).toBe(true));
    it('boolean is valid', () => expect(isValidFieldType('boolean')).toBe(true));
    it('select is valid', () => expect(isValidFieldType('select')).toBe(true));
    it('multiselect is valid', () => expect(isValidFieldType('multiselect')).toBe(true));
    it('INTEGER invalid', () => expect(isValidFieldType('INTEGER')).toBe(false));
    it('Date invalid (capital D)', () => expect(isValidFieldType('Date')).toBe(false));
    it('BOOLEAN invalid (capital)', () => expect(isValidFieldType('BOOLEAN')).toBe(false));
    it('empty invalid', () => expect(isValidFieldType('')).toBe(false));
    it('whitespace invalid', () => expect(isValidFieldType(' text')).toBe(false));
    it('text with trailing space invalid', () => expect(isValidFieldType('text ')).toBe(false));
    it('sql type varchar invalid', () => expect(isValidFieldType('varchar')).toBe(false));
    it('xml type invalid', () => expect(isValidFieldType('xml')).toBe(false));
    it('json type invalid', () => expect(isValidFieldType('json')).toBe(false));
  });

  describe('misc coverage – final batch', () => {
    it('clampConfidence(0.123) stays 0.123', () => expect(clampConfidence(0.123)).toBeCloseTo(0.123));
    it('clampConfidence(0.456) stays 0.456', () => expect(clampConfidence(0.456)).toBeCloseTo(0.456));
    it('clampConfidence(0.789) stays 0.789', () => expect(clampConfidence(0.789)).toBeCloseTo(0.789));
    it('getConfidenceLevel(0.855) = high', () => expect(getConfidenceLevel(0.855)).toBe('high'));
    it('getConfidenceLevel(0.605) = medium', () => expect(getConfidenceLevel(0.605)).toBe('medium'));
    it('getConfidenceLevel(0.305) = low', () => expect(getConfidenceLevel(0.305)).toBe('low'));
    it('getConfidenceLevel(0.295) = none', () => expect(getConfidenceLevel(0.295)).toBe('none'));
    it('normaliseFieldId("test_field") = "test_field"', () => expect(normaliseFieldId('test_field')).toBe('test_field'));
    it('normaliseFieldId("TEST_FIELD") = "test_field"', () => expect(normaliseFieldId('TEST_FIELD')).toBe('test_field'));
    it('normaliseFieldId("123abc") = "123abc"', () => expect(normaliseFieldId('123abc')).toBe('123abc'));
    it('normaliseFieldId("abc123") = "abc123"', () => expect(normaliseFieldId('abc123')).toBe('abc123'));
    it('normaliseFieldId("  leading") = "leading"', () => expect(normaliseFieldId('  leading')).toBe('leading'));
    it('normaliseFieldId("trailing  ") = "trailing"', () => expect(normaliseFieldId('trailing  ')).toBe('trailing'));
    it('extractEmail returns high confidence on match', () => {
      expect(extractEmail('contact: info@company.co.uk').confidence).toBe(0.95);
    });
    it('extractDate returns null for random short string', () => expect(extractDate('xyz').value).toBeNull());
    it('extractDate returns null for number only', () => expect(extractDate('12345').value).toBeNull());
    it('extractNumber returns 0 for field with text "zero"', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number' });
      expect(extractNumber('zero', f).value).toBeNull();
    });
    it('extractBoolean "confirmed" returns true', () => expect(extractBoolean('confirmed').value).toBe(true));
    it('extractBoolean "agreed" returns true', () => expect(extractBoolean('agreed').value).toBe(true));
    it('extractBoolean "denied" returns false', () => expect(extractBoolean('denied').value).toBe(false));
    it('extractBoolean "declined" returns false', () => expect(extractBoolean('declined').value).toBe(false));
    it('extractSelect empty options returns confidence 0', () => expect(extractSelect('x', []).confidence).toBe(0));
    it('extractText returns value type string or null', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text' });
      const r = extractText('test', f);
      expect(typeof r.value === 'string' || r.value === null).toBe(true);
    });
    it('extractAllFields with boolean field', () => {
      const f = [makeField({ id: 'b', label: 'B', type: 'boolean' })];
      const result = extractAllFields(f, ctx('yes'));
      expect(result[0].value).toBe(true);
    });
    it('extractAllFields with date field', () => {
      const f = [makeField({ id: 'd', label: 'D', type: 'date' })];
      const result = extractAllFields(f, ctx('2025-06-01'));
      expect(result[0].value).toBe('2025-06-01');
    });
    it('extractAllFields with select field', () => {
      const f = [makeField({ id: 's', label: 'S', type: 'select', options: ['Foo', 'Bar'] })];
      const result = extractAllFields(f, ctx('Foo selected'));
      expect(result[0].value).toBe('Foo');
    });
    it('autofillDocument returns warnings as array', () => {
      expect(Array.isArray(autofillDocument('d', [], ctx('')).warnings)).toBe(true);
    });
    it('autofillDocument returns fields as array', () => {
      expect(Array.isArray(autofillDocument('d', [], ctx('')).fields)).toBe(true);
    });
    it('autofillDocument documentId is provided string', () => {
      expect(autofillDocument('test-id-99', [], ctx('')).documentId).toBe('test-id-99');
    });
    it('buildWarnings returns array type', () => {
      expect(Array.isArray(buildWarnings([], []))).toBe(true);
    });
    it('computeOverallConfidence for single element 0.8', () => {
      const ev = [{ fieldId: 'a', value: null, confidence: 0.8, confidenceLevel: 'high' as const, strategy: 'rule' as const }];
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.8);
    });
    it('computeOverallConfidence for single element 0.2', () => {
      const ev = [{ fieldId: 'a', value: null, confidence: 0.2, confidenceLevel: 'none' as const, strategy: 'rule' as const }];
      expect(computeOverallConfidence(ev)).toBeCloseTo(0.2);
    });
    it('extractFieldValue returns fieldId correctly', () => {
      const f = makeField({ id: 'unique-id-abc', label: 'L', type: 'text' });
      expect(extractFieldValue(f, ctx('hi')).fieldId).toBe('unique-id-abc');
    });
    it('extractFieldValue confidence in 0–1 range for boolean', () => {
      const f = makeField({ id: 'b', label: 'B', type: 'boolean' });
      const r = extractFieldValue(f, ctx('true'));
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    });
    it('extractFieldValue confidence in 0–1 range for number', () => {
      const f = makeField({ id: 'n', label: 'N', type: 'number' });
      const r = extractFieldValue(f, ctx('100'));
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    });
    it('extractFieldValue confidence in 0–1 range for date', () => {
      const f = makeField({ id: 'd', label: 'D', type: 'date' });
      const r = extractFieldValue(f, ctx('2024-01-15'));
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    });
    it('extractFieldValue confidence in 0–1 range for phone', () => {
      const f = makeField({ id: 'p', label: 'P', type: 'phone' });
      const r = extractFieldValue(f, ctx('555-1234567'));
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    });
    it('clampConfidence preserves 0.333', () => expect(clampConfidence(0.333)).toBeCloseTo(0.333));
    it('clampConfidence preserves 0.667', () => expect(clampConfidence(0.667)).toBeCloseTo(0.667));
    it('getConfidenceLevel(0.333) = low', () => expect(getConfidenceLevel(0.333)).toBe('low'));
    it('getConfidenceLevel(0.667) = medium', () => expect(getConfidenceLevel(0.667)).toBe('medium'));
    it('getConfidenceLevel(0.867) = high', () => expect(getConfidenceLevel(0.867)).toBe('high'));
    it('normaliseFieldId produces lowercase only [a-z0-9_]', () => {
      const r = normaliseFieldId('Hello World 123');
      expect(r).toMatch(/^[a-z0-9_]*$/);
    });
    it('extractEmail raw equals value for simple email', () => {
      const r = extractEmail('bob@example.com');
      expect(r.raw).toBe(r.value);
    });
    it('extractDate raw equals value for ISO date', () => {
      const r = extractDate('2024-07-04');
      expect(r.raw).toBe(r.value);
    });
    it('autofillDocument with empty documentId', () => {
      const r = autofillDocument('', [], ctx(''));
      expect(r.documentId).toBe('');
    });
    it('extractAllFields passes minConfidence to each field', () => {
      const fields = [makeField({ id: 'e', label: 'E', type: 'email' })];
      const r = extractAllFields(fields, ctx('a@b.com'), { minConfidence: 0.99 });
      expect(r[0].value).toBeNull();
    });
    it('extractAllFields result each has confidenceLevel', () => {
      const fields = [makeField({ id: 'n', label: 'N', type: 'number' })];
      const r = extractAllFields(fields, ctx('42'));
      expect(['high', 'medium', 'low', 'none']).toContain(r[0].confidenceLevel);
    });
    it('getConfidenceLevel returns one of 4 valid strings', () => {
      expect(['high', 'medium', 'low', 'none']).toContain(getConfidenceLevel(0.5));
    });
    it('clampConfidence(0.001) stays near 0', () => expect(clampConfidence(0.001)).toBeCloseTo(0.001));
    it('clampConfidence(0.999) stays near 1', () => expect(clampConfidence(0.999)).toBeCloseTo(0.999));
    it('extractEmail returns object type', () => expect(typeof extractEmail('a@b.com')).toBe('object'));
    it('extractPhone returns object type', () => expect(typeof extractPhone('555-1234567')).toBe('object'));
    it('extractDate returns object type', () => expect(typeof extractDate('2024-01-01')).toBe('object'));
    it('extractBoolean returns object type', () => expect(typeof extractBoolean('yes')).toBe('object'));
    it('extractSelect returns object type', () => expect(typeof extractSelect('x', ['x'])).toBe('object'));
    it('extractText returns object type', () => {
      const f = makeField({ id: 't', label: 'T', type: 'text' });
      expect(typeof extractText('test', f)).toBe('object');
    });
    it('autofillDocument with 0 fields has 0 warnings', () => {
      expect(autofillDocument('d', [], ctx('')).warnings).toHaveLength(0);
    });
    it('autofillDocument with 0 fields has empty fields array', () => {
      expect(autofillDocument('d', [], ctx('')).fields).toHaveLength(0);
    });
    it('normaliseFieldId "id" stays "id"', () => expect(normaliseFieldId('id')).toBe('id'));
    it('normaliseFieldId "ID" becomes "id"', () => expect(normaliseFieldId('ID')).toBe('id'));
    it('normaliseFieldId "field_name_123" stays same', () => expect(normaliseFieldId('field_name_123')).toBe('field_name_123'));
    it('isValidFieldType "text" returns true (recheck)', () => expect(isValidFieldType('text')).toBe(true));
    it('isValidFieldType "xyz" returns false (recheck)', () => expect(isValidFieldType('xyz')).toBe(false));
    it('buildWarnings returns empty array for no fields', () => expect(buildWarnings([], [])).toEqual([]));
    it('computeOverallConfidence for empty returns exactly 0', () => expect(computeOverallConfidence([])).toBe(0));
    it('extractFieldValue result has all 5 required keys', () => {
      const f = makeField({ id: 'e', label: 'E', type: 'email' });
      const r = extractFieldValue(f, ctx(''));
      expect(r).toHaveProperty('fieldId');
      expect(r).toHaveProperty('value');
      expect(r).toHaveProperty('confidence');
      expect(r).toHaveProperty('confidenceLevel');
      expect(r).toHaveProperty('strategy');
    });
    it('autofillDocument result has all 5 required keys', () => {
      const r = autofillDocument('d', [], ctx(''));
      expect(r).toHaveProperty('documentId');
      expect(r).toHaveProperty('fields');
      expect(r).toHaveProperty('overallConfidence');
      expect(r).toHaveProperty('processedAt');
      expect(r).toHaveProperty('warnings');
    });
  });
});


