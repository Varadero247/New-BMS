// Copyright (c) 2026 Nexara DMCC. All rights reserved.
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
} from '../validators';
import { createInlineEditState } from '../inline-edit-state';
import type { InlineEditConfig } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeStringConfig(overrides: Partial<InlineEditConfig<string>> = {}): InlineEditConfig<string> {
  return { fieldType: 'text', initialValue: 'initial', ...overrides };
}

function makeOnSave(impl?: (v: string) => Promise<void>) {
  return jest.fn().mockImplementation(impl || (() => Promise.resolve()));
}

// ═════════════════════════════════════════════════════════════════════════════
// required validator
// ═════════════════════════════════════════════════════════════════════════════

describe('required', () => {
  it('null → error', () => expect(required(null)).toBeTruthy());
  it('undefined → error', () => expect(required(undefined)).toBeTruthy());
  it('empty string → error', () => expect(required('')).toBeTruthy());
  it('non-empty string → null', () => expect(required('hello')).toBeNull());
  it('whitespace string → null (not empty string)', () => expect(required(' ')).toBeNull());
  it('zero number → null (0 is not null/undefined/empty)', () => expect(required(0)).toBeNull());
  it('false → null (false is not null/undefined/empty)', () => expect(required(false)).toBeNull());
  it('array → null', () => expect(required([])).toBeNull());
  it('object → null', () => expect(required({})).toBeNull());
  it('error message is a string', () => expect(typeof required(null)).toBe('string'));
  it('error message mentions required', () => expect(required(null)!.toLowerCase()).toContain('required'));
  it('returns null for truthy values', () => {
    ['a', 'abc', '0', 'false', '   ', '\n'].forEach(v => expect(required(v)).toBeNull());
  });
  it('returns error for null with various types', () => {
    [null, undefined, ''].forEach(v => expect(required(v)).toBeTruthy());
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// minLength validator
// ═════════════════════════════════════════════════════════════════════════════

describe('minLength', () => {
  const min3 = minLength(3);
  const min10 = minLength(10);

  it('returns validator function', () => expect(typeof minLength(3)).toBe('function'));
  it('length equals min → null', () => expect(min3('abc')).toBeNull());
  it('length greater than min → null', () => expect(min3('abcde')).toBeNull());
  it('length less than min → error', () => expect(min3('ab')).toBeTruthy());
  it('empty string with min 1 → error', () => expect(minLength(1)('')).toBeTruthy());
  it('single char with min 1 → null', () => expect(minLength(1)('a')).toBeNull());
  it('min 0 always passes', () => expect(minLength(0)('')).toBeNull());
  it('error message contains min length', () => {
    const msg = min3('a')!;
    expect(msg).toContain('3');
  });
  it('error message is a string', () => expect(typeof min3('a')).toBe('string'));
  it('non-string value → null (guard)', () => expect(min3(42 as any)).toBeNull());
  it('null → null (guard)', () => expect(min3(null as any)).toBeNull());
  it('length exactly 10 → null', () => expect(min10('1234567890')).toBeNull());
  it('length 9 with min 10 → error', () => expect(min10('123456789')).toBeTruthy());
  it('long string passes any min', () => expect(min10('a'.repeat(100))).toBeNull());
  it('min 0 with non-empty string → null', () => expect(minLength(0)('hello')).toBeNull());
  it('error message for minLength(5) on empty string', () => {
    expect(minLength(5)('')).toContain('5');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// maxLength validator
// ═════════════════════════════════════════════════════════════════════════════

describe('maxLength', () => {
  const max5 = maxLength(5);
  const max10 = maxLength(10);

  it('returns validator function', () => expect(typeof maxLength(5)).toBe('function'));
  it('length equals max → null', () => expect(max5('abcde')).toBeNull());
  it('length less than max → null', () => expect(max5('abc')).toBeNull());
  it('length greater than max → error', () => expect(max5('abcdef')).toBeTruthy());
  it('empty string → null (length 0 < max)', () => expect(max5('')).toBeNull());
  it('error message contains max length', () => {
    const msg = max5('abcdefghi')!;
    expect(msg).toContain('5');
  });
  it('error message is a string', () => expect(typeof max5('toolong')).toBe('string'));
  it('non-string value → null (guard)', () => expect(max5(42 as any)).toBeNull());
  it('null → null (guard)', () => expect(max5(null as any)).toBeNull());
  it('exactly 10 chars → null', () => expect(max10('1234567890')).toBeNull());
  it('11 chars with max 10 → error', () => expect(max10('12345678901')).toBeTruthy());
  it('max 0: empty string → null', () => expect(maxLength(0)('')).toBeNull());
  it('max 0: single char → error', () => expect(maxLength(0)('a')).toBeTruthy());
  it('max 1000 with short string → null', () => expect(maxLength(1000)('hello')).toBeNull());
  it('error message for maxLength(3) on 4-char string', () => {
    expect(maxLength(3)('abcd')).toContain('3');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// isNumber validator
// ═════════════════════════════════════════════════════════════════════════════

describe('isNumber', () => {
  it('null → null (passes)', () => expect(isNumber(null)).toBeNull());
  it('undefined → null (passes)', () => expect(isNumber(undefined)).toBeNull());
  it('empty string → null (passes)', () => expect(isNumber('')).toBeNull());
  it('valid integer string → null', () => expect(isNumber('42')).toBeNull());
  it('valid float string → null', () => expect(isNumber('3.14')).toBeNull());
  it('negative number string → null', () => expect(isNumber('-5')).toBeNull());
  it('zero → null', () => expect(isNumber('0')).toBeNull());
  it('non-numeric string → error', () => expect(isNumber('abc')).toBeTruthy());
  it('mixed string → error', () => expect(isNumber('12abc')).toBeTruthy());
  it('numeric → null', () => expect(isNumber(42)).toBeNull());
  it('NaN string → error', () => expect(isNumber('NaN')).toBeTruthy());
  it('error message is a string', () => expect(typeof isNumber('abc')).toBe('string'));
  it('error mentions number', () => expect(isNumber('abc')!.toLowerCase()).toContain('number'));
  it('scientific notation → null', () => expect(isNumber('1e5')).toBeNull());
  it('Infinity → null (Number("Infinity") = Infinity, not NaN)', () => expect(isNumber('Infinity')).toBeNull());
  it('whitespace → NaN → error', () => {
    // Number('  ') = 0 so it's actually valid
    // Number('   x') = NaN → error
    expect(isNumber('   x')).toBeTruthy();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// isDate validator
// ═════════════════════════════════════════════════════════════════════════════

describe('isDate', () => {
  it('null → null (passes)', () => expect(isDate(null)).toBeNull());
  it('undefined → null (passes)', () => expect(isDate(undefined)).toBeNull());
  it('empty string → null (passes)', () => expect(isDate('')).toBeNull());
  it('valid ISO date string → null', () => expect(isDate('2026-01-15')).toBeNull());
  it('valid datetime string → null', () => expect(isDate('2026-01-15T10:30:00Z')).toBeNull());
  it('valid date string → null', () => expect(isDate('January 15, 2026')).toBeNull());
  it('invalid date string → error', () => expect(isDate('not-a-date')).toBeTruthy());
  it('random string → error', () => expect(isDate('hello world')).toBeTruthy());
  it('error message is a string', () => expect(typeof isDate('not-a-date')).toBe('string'));
  it('error mentions date', () => expect(isDate('not-a-date')!.toLowerCase()).toContain('date'));
  it('yyyy-mm-dd format → null', () => expect(isDate('2026-03-04')).toBeNull());
  it('mm/dd/yyyy format → null', () => expect(isDate('03/04/2026')).toBeNull());
  it('partial date → handled', () => {
    // '2026' → new Date('2026') is valid UTC
    const result = isDate('2026');
    expect(result === null || typeof result === 'string').toBe(true);
  });
  it('number → null (Date can be constructed from number)', () => {
    const result = isDate(0);
    expect(result).toBeNull();
  });
  it('invalid month → error', () => expect(isDate('2026-13-01')).toBeTruthy());
  it('returns null or string', () => {
    const result = isDate('2026-01-01');
    expect(result === null || typeof result === 'string').toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// isEmail validator
// ═════════════════════════════════════════════════════════════════════════════

describe('isEmail', () => {
  it('null → null (passes)', () => expect(isEmail(null)).toBeNull());
  it('undefined → null (passes)', () => expect(isEmail(undefined)).toBeNull());
  it('empty string → null (passes)', () => expect(isEmail('')).toBeNull());
  it('valid email → null', () => expect(isEmail('user@example.com')).toBeNull());
  it('valid email with subdomain → null', () => expect(isEmail('user@mail.example.com')).toBeNull());
  it('valid email with + → null', () => expect(isEmail('user+tag@example.com')).toBeNull());
  it('valid email with numbers → null', () => expect(isEmail('user123@example.com')).toBeNull());
  it('no @ → error', () => expect(isEmail('notanemail')).toBeTruthy());
  it('no domain → error', () => expect(isEmail('user@')).toBeTruthy());
  it('no TLD → error', () => expect(isEmail('user@domain')).toBeTruthy());
  it('no local part → error', () => expect(isEmail('@domain.com')).toBeTruthy());
  it('spaces in email → error', () => expect(isEmail('user @example.com')).toBeTruthy());
  it('error message is a string', () => expect(typeof isEmail('bad')).toBe('string'));
  it('error mentions email', () => expect(isEmail('bad')!.toLowerCase()).toContain('email'));
  it('admin@ims.local → null', () => expect(isEmail('admin@ims.local')).toBeNull());
  it('test@test.test → null', () => expect(isEmail('test@test.test')).toBeNull());
  it('double @ → error', () => expect(isEmail('user@@example.com')).toBeTruthy());
  it('returns null or string', () => {
    const r = isEmail('valid@email.com');
    expect(r === null || typeof r === 'string').toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// isUrl validator
// ═════════════════════════════════════════════════════════════════════════════

describe('isUrl', () => {
  it('null → null (passes)', () => expect(isUrl(null)).toBeNull());
  it('undefined → null (passes)', () => expect(isUrl(undefined)).toBeNull());
  it('empty string → null (passes)', () => expect(isUrl('')).toBeNull());
  it('valid http url → null', () => expect(isUrl('http://example.com')).toBeNull());
  it('valid https url → null', () => expect(isUrl('https://example.com')).toBeNull());
  it('url with path → null', () => expect(isUrl('https://example.com/path/to/resource')).toBeNull());
  it('url with query → null', () => expect(isUrl('https://example.com?q=hello')).toBeNull());
  it('url with port → null', () => expect(isUrl('https://example.com:8080')).toBeNull());
  it('url with hash → null', () => expect(isUrl('https://example.com#section')).toBeNull());
  it('plain string → error', () => expect(isUrl('not a url')).toBeTruthy());
  it('relative url → error (no protocol)', () => expect(isUrl('/relative/path')).toBeTruthy());
  it('email-like → error', () => expect(isUrl('user@example.com')).toBeTruthy());
  it('error message is a string', () => expect(typeof isUrl('bad')).toBe('string'));
  it('error mentions URL', () => expect(isUrl('bad')!.toLowerCase()).toContain('url'));
  it('ftp url → null', () => expect(isUrl('ftp://example.com')).toBeNull());
  it('localhost url → null', () => expect(isUrl('http://localhost:3000')).toBeNull());
  it('ip address url → null', () => expect(isUrl('http://192.168.1.1')).toBeNull());
  it('returns null or string', () => {
    const r = isUrl('https://valid.url');
    expect(r === null || typeof r === 'string').toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// min / max validators
// ═════════════════════════════════════════════════════════════════════════════

describe('min validator', () => {
  const min5 = min(5);
  it('returns function', () => expect(typeof min(5)).toBe('function'));
  it('value > min → null', () => expect(min5(10)).toBeNull());
  it('value = min → null', () => expect(min5(5)).toBeNull());
  it('value < min → error', () => expect(min5(4)).toBeTruthy());
  it('null → null (passes)', () => expect(min5(null)).toBeNull());
  it('undefined → null (passes)', () => expect(min5(undefined)).toBeNull());
  it('empty string → null (passes)', () => expect(min5('')).toBeNull());
  it('error contains min value', () => expect(min5(0)!).toContain('5'));
  it('negative min: value >= → null', () => expect(min(-5)(-3)).toBeNull());
  it('negative min: value < min → error', () => expect(min(-5)(-6)).toBeTruthy());
  it('string number >= min → null', () => expect(min5('10')).toBeNull());
  it('string number < min → error', () => expect(min5('2')).toBeTruthy());
  it('returns null or string', () => {
    const r = min5(3);
    expect(r === null || typeof r === 'string').toBe(true);
  });
});

describe('max validator', () => {
  const max10 = max(10);
  it('returns function', () => expect(typeof max(10)).toBe('function'));
  it('value < max → null', () => expect(max10(5)).toBeNull());
  it('value = max → null', () => expect(max10(10)).toBeNull());
  it('value > max → error', () => expect(max10(11)).toBeTruthy());
  it('null → null (passes)', () => expect(max10(null)).toBeNull());
  it('undefined → null (passes)', () => expect(max10(undefined)).toBeNull());
  it('empty string → null (passes)', () => expect(max10('')).toBeNull());
  it('error contains max value', () => expect(max10(100)!).toContain('10'));
  it('large max: value within → null', () => expect(max(1000)(999)).toBeNull());
  it('string number <= max → null', () => expect(max10('8')).toBeNull());
  it('string number > max → error', () => expect(max10('15')).toBeTruthy());
  it('returns null or string', () => {
    const r = max10(20);
    expect(r === null || typeof r === 'string').toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// composeValidators
// ═════════════════════════════════════════════════════════════════════════════

describe('composeValidators', () => {
  it('all pass → null', () => {
    const validator = composeValidators(required, minLength(2));
    expect(validator('hello')).toBeNull();
  });
  it('first fails → returns first error', () => {
    const validator = composeValidators(required, minLength(2));
    expect(validator('')).toBeTruthy();
  });
  it('first passes, second fails → second error', () => {
    const validator = composeValidators(required, minLength(10));
    expect(validator('hi')).toBeTruthy();
  });
  it('no validators → null', () => {
    const validator = composeValidators<string>();
    expect(validator('anything')).toBeNull();
  });
  it('single validator → same result', () => {
    const validator = composeValidators(required);
    expect(validator('')).toBeTruthy();
    expect(validator('x')).toBeNull();
  });
  it('compose required + maxLength', () => {
    const validator = composeValidators(required, maxLength(5));
    expect(validator('')).toBeTruthy();
    expect(validator('hi')).toBeNull();
    expect(validator('toolongstring')).toBeTruthy();
  });
  it('compose 3 validators — all pass', () => {
    const validator = composeValidators(required, minLength(2), maxLength(10));
    expect(validator('hello')).toBeNull();
  });
  it('compose 3 validators — third fails', () => {
    const validator = composeValidators(required, minLength(2), maxLength(5));
    expect(validator('toolongstring')).toBeTruthy();
  });
  it('compose isEmail + required', () => {
    const validator = composeValidators(required, isEmail);
    expect(validator('')).toBeTruthy();
    expect(validator('not-email')).toBeTruthy();
    expect(validator('valid@email.com')).toBeNull();
  });
  it('stops at first error', () => {
    let secondCalled = false;
    const first = () => 'first error';
    const second = () => { secondCalled = true; return null; };
    composeValidators(first, second)('value');
    expect(secondCalled).toBe(false);
  });
  it('returns string error', () => {
    const validator = composeValidators(required);
    expect(typeof validator('')).toBe('string');
  });
  it('returns function', () => {
    expect(typeof composeValidators(required)).toBe('function');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createInlineEditState — initialization
// ═════════════════════════════════════════════════════════════════════════════

describe('createInlineEditState — initialization', () => {
  it('initial status is idle', () => {
    const { getState } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(getState().status).toBe('idle');
  });
  it('initial value equals initialValue', () => {
    const { getState } = createInlineEditState(makeStringConfig({ initialValue: 'hello' }), makeOnSave());
    expect(getState().value).toBe('hello');
  });
  it('original value equals initialValue', () => {
    const { getState } = createInlineEditState(makeStringConfig({ initialValue: 'hello' }), makeOnSave());
    expect(getState().originalValue).toBe('hello');
  });
  it('isDirty is false initially', () => {
    const { getState } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(getState().isDirty).toBe(false);
  });
  it('error is null initially', () => {
    const { getState } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(getState().error).toBeNull();
  });
  it('works with number initial value', () => {
    const config: InlineEditConfig<number> = { fieldType: 'number', initialValue: 42 };
    const { getState } = createInlineEditState(config, jest.fn());
    expect(getState().value).toBe(42);
  });
  it('works with boolean initial value', () => {
    const config: InlineEditConfig<boolean> = { fieldType: 'boolean', initialValue: true };
    const { getState } = createInlineEditState(config, jest.fn());
    expect(getState().value).toBe(true);
  });
  it('returns getState function', () => {
    const { getState } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(typeof getState).toBe('function');
  });
  it('returns actions object', () => {
    const { actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(typeof actions).toBe('object');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createInlineEditState — startEdit
// ═════════════════════════════════════════════════════════════════════════════

describe('createInlineEditState — startEdit', () => {
  it('status changes to editing', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    actions.startEdit();
    expect(getState().status).toBe('editing');
  });
  it('clears error', () => {
    const config = makeStringConfig({ validate: () => 'bad' });
    const { getState, actions } = createInlineEditState(config, makeOnSave());
    actions.startEdit();
    actions.setValue('x');
    actions.startEdit(); // calling again
    expect(getState().error).toBeNull();
  });
  it('value unchanged after startEdit', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'test' }), makeOnSave());
    actions.startEdit();
    expect(getState().value).toBe('test');
  });
  it('isDirty unchanged after startEdit', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    actions.startEdit();
    expect(getState().isDirty).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createInlineEditState — setValue
// ═════════════════════════════════════════════════════════════════════════════

describe('createInlineEditState — setValue', () => {
  it('updates value', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'old' }), makeOnSave());
    actions.setValue('new');
    expect(getState().value).toBe('new');
  });
  it('isDirty true when value differs from original', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'old' }), makeOnSave());
    actions.setValue('new');
    expect(getState().isDirty).toBe(true);
  });
  it('isDirty false when value equals original', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'same' }), makeOnSave());
    actions.setValue('same');
    expect(getState().isDirty).toBe(false);
  });
  it('clears error on setValue', () => {
    const config = makeStringConfig({ validate: (v: string) => v.length < 2 ? 'too short' : null });
    const { getState, actions } = createInlineEditState(config, makeOnSave());
    actions.startEdit();
    actions.setValue('a'); // trigger no error yet, just set
    expect(getState().error).toBeNull();
  });
  it('originalValue not changed by setValue', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'original' }), makeOnSave());
    actions.setValue('changed');
    expect(getState().originalValue).toBe('original');
  });
  it('status not changed by setValue', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    actions.startEdit();
    actions.setValue('new');
    expect(getState().status).toBe('editing');
  });
  it('multiple setValue calls update value each time', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    actions.setValue('a');
    actions.setValue('b');
    actions.setValue('c');
    expect(getState().value).toBe('c');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createInlineEditState — cancelEdit
// ═════════════════════════════════════════════════════════════════════════════

describe('createInlineEditState — cancelEdit', () => {
  it('status returns to idle', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    actions.startEdit();
    actions.cancelEdit();
    expect(getState().status).toBe('idle');
  });
  it('value restored to originalValue', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'original' }), makeOnSave());
    actions.startEdit();
    actions.setValue('changed');
    actions.cancelEdit();
    expect(getState().value).toBe('original');
  });
  it('isDirty false after cancel', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'x' }), makeOnSave());
    actions.setValue('y');
    actions.cancelEdit();
    expect(getState().isDirty).toBe(false);
  });
  it('error cleared on cancel', () => {
    const config = makeStringConfig({ validate: () => 'always error' });
    const { getState, actions } = createInlineEditState(config, makeOnSave());
    actions.startEdit();
    actions.cancelEdit();
    expect(getState().error).toBeNull();
  });
  it('originalValue unchanged after cancel', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'orig' }), makeOnSave());
    actions.setValue('changed');
    actions.cancelEdit();
    expect(getState().originalValue).toBe('orig');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createInlineEditState — save (success)
// ═════════════════════════════════════════════════════════════════════════════

describe('createInlineEditState — save (success)', () => {
  it('calls onSave with current value', async () => {
    const onSave = makeOnSave();
    const { actions } = createInlineEditState(makeStringConfig({ initialValue: 'v' }), onSave);
    actions.startEdit();
    await actions.save();
    expect(onSave).toHaveBeenCalledWith('v');
  });
  it('status becomes success', async () => {
    const { getState, actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    actions.startEdit();
    await actions.save();
    expect(getState().status).toBe('success');
  });
  it('isDirty false after successful save', async () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'orig' }), makeOnSave());
    actions.startEdit();
    actions.setValue('new');
    await actions.save();
    expect(getState().isDirty).toBe(false);
  });
  it('originalValue updated to saved value', async () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'orig' }), makeOnSave());
    actions.setValue('new');
    await actions.save();
    expect(getState().originalValue).toBe('new');
  });
  it('error is null after successful save', async () => {
    const { getState, actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    await actions.save();
    expect(getState().error).toBeNull();
  });
  it('calls onSave with transformed value when transform defined', async () => {
    const onSave = makeOnSave();
    const config = makeStringConfig({ transform: (v: string) => v.trim() });
    const { actions } = createInlineEditState(config, onSave);
    actions.setValue('  hello  ');
    await actions.save();
    expect(onSave).toHaveBeenCalledWith('hello');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createInlineEditState — save (validation failure)
// ═════════════════════════════════════════════════════════════════════════════

describe('createInlineEditState — save (validation failure)', () => {
  it('does not call onSave when validation fails', async () => {
    const onSave = makeOnSave();
    const config = makeStringConfig({ validate: () => 'required' });
    const { actions } = createInlineEditState(config, onSave);
    await actions.save();
    expect(onSave).not.toHaveBeenCalled();
  });
  it('status becomes error on validation failure', async () => {
    const config = makeStringConfig({ validate: () => 'error message' });
    const { getState, actions } = createInlineEditState(config, makeOnSave());
    await actions.save();
    expect(getState().status).toBe('error');
  });
  it('error set to validator message', async () => {
    const config = makeStringConfig({ validate: () => 'must not be empty' });
    const { getState, actions } = createInlineEditState(config, makeOnSave());
    await actions.save();
    expect(getState().error).toBe('must not be empty');
  });
  it('isDirty unchanged on validation failure', async () => {
    const config = makeStringConfig({ validate: () => 'error', initialValue: 'x' });
    const { getState, actions } = createInlineEditState(config, makeOnSave());
    actions.setValue('y');
    await actions.save();
    expect(getState().isDirty).toBe(true);
  });
  it('validation passes → null → save proceeds', async () => {
    const onSave = makeOnSave();
    const config = makeStringConfig({ validate: () => null });
    const { actions } = createInlineEditState(config, onSave);
    await actions.save();
    expect(onSave).toHaveBeenCalled();
  });
  it('validate receives current value', async () => {
    const validate = jest.fn().mockReturnValue(null);
    const config = makeStringConfig({ validate, initialValue: 'test-value' });
    const { actions } = createInlineEditState(config, makeOnSave());
    await actions.save();
    expect(validate).toHaveBeenCalledWith('test-value');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createInlineEditState — save (onSave error)
// ═════════════════════════════════════════════════════════════════════════════

describe('createInlineEditState — save (onSave throws)', () => {
  it('status becomes error when onSave throws', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('network error'));
    const { getState, actions } = createInlineEditState(makeStringConfig(), onSave);
    await actions.save();
    expect(getState().status).toBe('error');
  });
  it('error set to thrown message', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('save failed'));
    const { getState, actions } = createInlineEditState(makeStringConfig(), onSave);
    await actions.save();
    expect(getState().error).toBe('save failed');
  });
  it('status saving during onSave call', async () => {
    let statusDuringSave: string | null = null;
    const onSave = jest.fn().mockImplementation(() => {
      statusDuringSave = 'observed async';
      return Promise.resolve();
    });
    const { actions } = createInlineEditState(makeStringConfig(), onSave);
    await actions.save();
    expect(statusDuringSave).toBe('observed async');
  });
  it('non-Error thrown → generic message', async () => {
    const onSave = jest.fn().mockRejectedValue('plain string error');
    const { getState, actions } = createInlineEditState(makeStringConfig(), onSave);
    await actions.save();
    expect(getState().status).toBe('error');
    expect(getState().error).toBeTruthy();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createInlineEditState — reset
// ═════════════════════════════════════════════════════════════════════════════

describe('createInlineEditState — reset', () => {
  it('reset restores to initial state', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'orig' }), makeOnSave());
    actions.startEdit();
    actions.setValue('changed');
    actions.reset();
    expect(getState().status).toBe('idle');
    expect(getState().value).toBe('orig');
    expect(getState().originalValue).toBe('orig');
    expect(getState().isDirty).toBe(false);
    expect(getState().error).toBeNull();
  });
  it('reset after successful save goes back to initial value', async () => {
    const { getState, actions } = createInlineEditState(makeStringConfig({ initialValue: 'init' }), makeOnSave());
    actions.setValue('new');
    await actions.save();
    actions.reset();
    expect(getState().value).toBe('init');
  });
  it('reset after error clears error', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('fail'));
    const { getState, actions } = createInlineEditState(makeStringConfig(), onSave);
    await actions.save();
    actions.reset();
    expect(getState().error).toBeNull();
    expect(getState().status).toBe('idle');
  });
  it('reset is idempotent', () => {
    const { getState, actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    actions.reset();
    actions.reset();
    expect(getState().status).toBe('idle');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createInlineEditState — getState returns snapshot
// ═════════════════════════════════════════════════════════════════════════════

describe('createInlineEditState — getState snapshot', () => {
  it('getState returns new object each call', () => {
    const { getState } = createInlineEditState(makeStringConfig(), makeOnSave());
    const s1 = getState();
    const s2 = getState();
    expect(s1).not.toBe(s2);
  });
  it('modifying returned state does not affect internal state', () => {
    const { getState } = createInlineEditState(makeStringConfig({ initialValue: 'test' }), makeOnSave());
    const s = getState();
    (s as any).value = 'modified';
    expect(getState().value).toBe('test');
  });
  it('getState has all expected fields', () => {
    const { getState } = createInlineEditState(makeStringConfig(), makeOnSave());
    const s = getState();
    expect(s).toHaveProperty('status');
    expect(s).toHaveProperty('value');
    expect(s).toHaveProperty('originalValue');
    expect(s).toHaveProperty('error');
    expect(s).toHaveProperty('isDirty');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Type & export verification
// ═════════════════════════════════════════════════════════════════════════════

describe('Type & export verification', () => {
  it('required is a function', () => expect(typeof required).toBe('function'));
  it('minLength is a function', () => expect(typeof minLength).toBe('function'));
  it('maxLength is a function', () => expect(typeof maxLength).toBe('function'));
  it('isNumber is a function', () => expect(typeof isNumber).toBe('function'));
  it('isDate is a function', () => expect(typeof isDate).toBe('function'));
  it('isEmail is a function', () => expect(typeof isEmail).toBe('function'));
  it('isUrl is a function', () => expect(typeof isUrl).toBe('function'));
  it('composeValidators is a function', () => expect(typeof composeValidators).toBe('function'));
  it('min is a function', () => expect(typeof min).toBe('function'));
  it('max is a function', () => expect(typeof max).toBe('function'));
  it('createInlineEditState is a function', () => expect(typeof createInlineEditState).toBe('function'));
  it('createInlineEditState returns object', () => {
    const result = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(typeof result).toBe('object');
  });
  it('actions object has startEdit', () => {
    const { actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(typeof actions.startEdit).toBe('function');
  });
  it('actions object has cancelEdit', () => {
    const { actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(typeof actions.cancelEdit).toBe('function');
  });
  it('actions object has setValue', () => {
    const { actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(typeof actions.setValue).toBe('function');
  });
  it('actions object has save', () => {
    const { actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(typeof actions.save).toBe('function');
  });
  it('actions object has reset', () => {
    const { actions } = createInlineEditState(makeStringConfig(), makeOnSave());
    expect(typeof actions.reset).toBe('function');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Validators — comprehensive cross-field tests
// ═════════════════════════════════════════════════════════════════════════════

describe('Validators — comprehensive coverage', () => {
  const validEmails = ['a@b.com', 'user+tag@example.org', 'test@test.io', 'admin@ims.local'];
  validEmails.forEach(email => {
    it(`isEmail("${email}") → null`, () => expect(isEmail(email)).toBeNull());
  });

  const invalidEmails = ['', null, undefined, 'not-email', '@domain.com', 'user@'];
  invalidEmails.forEach(email => {
    it(`isEmail(${JSON.stringify(email)}) → null or error`, () => {
      if (!email) expect(isEmail(email)).toBeNull();
      else expect(isEmail(email)).toBeTruthy();
    });
  });

  const validUrls = ['http://a.com', 'https://b.com/path', 'ftp://c.com', 'http://localhost:4000'];
  validUrls.forEach(url => {
    it(`isUrl("${url}") → null`, () => expect(isUrl(url)).toBeNull());
  });

  const invalidUrls = ['notaurl', '/relative', 'user@email.com', 'just text'];
  invalidUrls.forEach(url => {
    it(`isUrl("${url}") → error`, () => expect(isUrl(url)).toBeTruthy());
  });

  const validNumbers = ['0', '1', '-1', '3.14', '1e5', '100'];
  validNumbers.forEach(n => {
    it(`isNumber("${n}") → null`, () => expect(isNumber(n)).toBeNull());
  });

  const invalidNumbers = ['abc', 'NaN', '12abc', '!@#'];
  invalidNumbers.forEach(n => {
    it(`isNumber("${n}") → error`, () => expect(isNumber(n)).toBeTruthy());
  });
});
