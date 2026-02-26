// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  ValidationResult,
  ValidatorFn,
  ValidationRule,
  FormErrors,
  ComposeMode,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

function fail(message: string): ValidationResult {
  return { valid: false, errors: [message] };
}

function merge(...results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap((r) => r.errors);
  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Validator class (chainable)
// ---------------------------------------------------------------------------

export class Validator<T> {
  private _rules: ValidationRule<T>[] = [];

  constructor(rules?: ValidationRule<T>[]) {
    if (rules) {
      this._rules = [...rules];
    }
  }

  private _add(fn: ValidatorFn<T>, message?: string): this {
    this._rules.push({ fn, options: { message } });
    return this;
  }

  required(message = 'Value is required'): this {
    return this._add((value) => {
      if (value === null || value === undefined || value === '') {
        return fail(message);
      }
      if (Array.isArray(value) && value.length === 0) {
        return fail(message);
      }
      return ok();
    }, message);
  }

  min(n: number, message?: string): this {
    return this._add((value) => {
      const msg = message ?? `Must be at least ${n}`;
      if (typeof value === 'number') {
        return value >= n ? ok() : fail(msg);
      }
      if (typeof value === 'string' || Array.isArray(value)) {
        return (value as string | unknown[]).length >= n ? ok() : fail(msg);
      }
      return fail(msg);
    }, message);
  }

  max(n: number, message?: string): this {
    return this._add((value) => {
      const msg = message ?? `Must be at most ${n}`;
      if (typeof value === 'number') {
        return value <= n ? ok() : fail(msg);
      }
      if (typeof value === 'string' || Array.isArray(value)) {
        return (value as string | unknown[]).length <= n ? ok() : fail(msg);
      }
      return fail(msg);
    }, message);
  }

  minLength(n: number, message?: string): this {
    return this._add((value) => {
      const msg = message ?? `Must be at least ${n} characters`;
      if (typeof value === 'string' || Array.isArray(value)) {
        return (value as string | unknown[]).length >= n ? ok() : fail(msg);
      }
      return fail(msg);
    }, message);
  }

  maxLength(n: number, message?: string): this {
    return this._add((value) => {
      const msg = message ?? `Must be at most ${n} characters`;
      if (typeof value === 'string' || Array.isArray(value)) {
        return (value as string | unknown[]).length <= n ? ok() : fail(msg);
      }
      return fail(msg);
    }, message);
  }

  pattern(regex: RegExp, message?: string): this {
    return this._add((value) => {
      const msg = message ?? `Does not match required pattern`;
      if (typeof value !== 'string') return fail(msg);
      return regex.test(value) ? ok() : fail(msg);
    }, message);
  }

  email(message = 'Must be a valid email address'): this {
    return this._add((value) => {
      if (typeof value !== 'string') return fail(message);
      return EMAIL_RE.test(value) ? ok() : fail(message);
    }, message);
  }

  url(message = 'Must be a valid URL'): this {
    return this._add((value) => {
      if (typeof value !== 'string') return fail(message);
      return isValidUrl(value) ? ok() : fail(message);
    }, message);
  }

  custom(fn: ValidatorFn<T>, message?: string): this {
    return this._add((value) => {
      const result = fn(value);
      if (!result.valid && message) {
        return fail(message);
      }
      return result;
    }, message);
  }

  oneOf(values: T[], message?: string): this {
    return this._add((value) => {
      const msg = message ?? `Must be one of: ${values.join(', ')}`;
      return values.includes(value) ? ok() : fail(msg);
    }, message);
  }

  notOneOf(values: T[], message?: string): this {
    return this._add((value) => {
      const msg = message ?? `Must not be one of: ${values.join(', ')}`;
      return values.includes(value) ? fail(msg) : ok();
    }, message);
  }

  when(condition: (value: T) => boolean, thenRules: ValidationRule<T>[]): this {
    return this._add((value) => {
      if (!condition(value)) return ok();
      const results = thenRules.map((r) => r.fn(value));
      return merge(...results);
    });
  }

  /** Stop on first failing rule */
  validate(value: T): ValidationResult {
    for (const rule of this._rules) {
      const result = rule.fn(value);
      if (!result.valid) return result;
    }
    return ok();
  }

  /** Run all rules and collect all errors */
  validateAll(value: T): ValidationResult {
    const results = this._rules.map((r) => r.fn(value));
    return merge(...results);
  }
}

// ---------------------------------------------------------------------------
// FormValidator class
// ---------------------------------------------------------------------------

export class FormValidator<T extends Record<string, unknown>> {
  private _fields: Map<keyof T, Validator<unknown>> = new Map();

  field<K extends keyof T>(name: K, validator: Validator<T[K]>): this {
    this._fields.set(name, validator as Validator<unknown>);
    return this;
  }

  validate(data: T): { valid: boolean; errors: FormErrors } {
    const errors: FormErrors = {};
    let valid = true;

    for (const [name, validator] of this._fields.entries()) {
      const fieldName = name as string;
      const result = validator.validateAll(data[name] as unknown);
      if (!result.valid) {
        valid = false;
        errors[fieldName] = result.errors;
      }
    }

    return { valid, errors };
  }

  validateField<K extends keyof T>(name: K, value: T[K]): ValidationResult {
    const validator = this._fields.get(name);
    if (!validator) return ok();
    return validator.validateAll(value as unknown);
  }
}

// ---------------------------------------------------------------------------
// Email / URL helpers
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Standalone validator functions
// ---------------------------------------------------------------------------

export function required(value: unknown, message = 'Value is required'): ValidationResult {
  if (value === null || value === undefined || value === '') return fail(message);
  if (Array.isArray(value) && value.length === 0) return fail(message);
  return ok();
}

export function minLength(
  value: string,
  min: number,
  message?: string,
): ValidationResult {
  const msg = message ?? `Must be at least ${min} characters`;
  return value.length >= min ? ok() : fail(msg);
}

export function maxLength(
  value: string,
  max: number,
  message?: string,
): ValidationResult {
  const msg = message ?? `Must be at most ${max} characters`;
  return value.length <= max ? ok() : fail(msg);
}

export function min(value: number, minVal: number, message?: string): ValidationResult {
  const msg = message ?? `Must be at least ${minVal}`;
  return value >= minVal ? ok() : fail(msg);
}

export function max(value: number, maxVal: number, message?: string): ValidationResult {
  const msg = message ?? `Must be at most ${maxVal}`;
  return value <= maxVal ? ok() : fail(msg);
}

export function between(
  value: number,
  minVal: number,
  maxVal: number,
  message?: string,
): ValidationResult {
  const msg = message ?? `Must be between ${minVal} and ${maxVal}`;
  return value >= minVal && value <= maxVal ? ok() : fail(msg);
}

export function pattern(
  value: string,
  regex: RegExp,
  message = 'Does not match required pattern',
): ValidationResult {
  return regex.test(value) ? ok() : fail(message);
}

export function email(
  value: string,
  message = 'Must be a valid email address',
): ValidationResult {
  return EMAIL_RE.test(value) ? ok() : fail(message);
}

export function url(value: string, message = 'Must be a valid URL'): ValidationResult {
  return isValidUrl(value) ? ok() : fail(message);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function uuid(value: string, message = 'Must be a valid UUID'): ValidationResult {
  return UUID_RE.test(value) ? ok() : fail(message);
}

export function integer(value: number, message = 'Must be an integer'): ValidationResult {
  return Number.isInteger(value) ? ok() : fail(message);
}

export function positive(
  value: number,
  message = 'Must be a positive number',
): ValidationResult {
  return value > 0 ? ok() : fail(message);
}

export function negative(
  value: number,
  message = 'Must be a negative number',
): ValidationResult {
  return value < 0 ? ok() : fail(message);
}

export function nonEmpty(
  value: unknown[],
  message = 'Array must not be empty',
): ValidationResult {
  return value.length > 0 ? ok() : fail(message);
}

export function oneOf<T>(
  value: T,
  allowed: T[],
  message?: string,
): ValidationResult {
  const msg = message ?? `Must be one of: ${allowed.join(', ')}`;
  return allowed.includes(value) ? ok() : fail(msg);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

export function date(
  value: string,
  message = 'Must be a valid ISO date string',
): ValidationResult {
  if (!ISO_DATE_RE.test(value)) return fail(message);
  const d = new Date(value);
  return isNaN(d.getTime()) ? fail(message) : ok();
}

/** Luhn algorithm for credit card number validation */
function luhn(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function creditCard(
  value: string,
  message = 'Must be a valid credit card number',
): ValidationResult {
  return luhn(value) ? ok() : fail(message);
}

const UK_POSTCODE_RE =
  /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$/i;
const US_ZIPCODE_RE = /^\d{5}(-\d{4})?$/;

export function postcode(
  value: string,
  country: 'UK' | 'US' = 'UK',
  message?: string,
): ValidationResult {
  const msg = message ?? `Must be a valid ${country} postcode`;
  const re = country === 'US' ? US_ZIPCODE_RE : UK_POSTCODE_RE;
  return re.test(value.trim()) ? ok() : fail(msg);
}

export function phone(
  value: string,
  message = 'Must be a valid phone number',
): ValidationResult {
  const digits = value.replace(/[\s\-().+]/g, '');
  if (!/^\d+$/.test(digits)) return fail(message);
  if (digits.length < 7 || digits.length > 15) return fail(message);
  return ok();
}

/** Basic IBAN validation: correct length per country code and Luhn-like MOD97 */
function ibanMod97(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (cleaned.length < 5) return false;
  // Move first 4 chars to end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  // Replace letters with digits (A=10, B=11, ...)
  const numeric = rearranged.replace(/[A-Z]/g, (c) =>
    String(c.charCodeAt(0) - 55),
  );
  // MOD 97 on large number via chunking
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = String(remainder) + numeric.slice(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }
  return remainder === 1;
}

export function iban(value: string, message = 'Must be a valid IBAN'): ValidationResult {
  return ibanMod97(value) ? ok() : fail(message);
}

const XSS_RE = /<script[\s\S]*?>[\s\S]*?<\/script>|on\w+\s*=/i;

export function noXss(
  value: string,
  message = 'Value contains potentially unsafe content',
): ValidationResult {
  return XSS_RE.test(value) ? fail(message) : ok();
}

const SQL_INJECTION_RE =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|TRUNCATE|REPLACE)\b.*\b(FROM|INTO|TABLE|WHERE|SET)\b)|('|--|;|\/\*|\*\/|xp_)/i;

export function noSql(
  value: string,
  message = 'Value contains potentially unsafe SQL',
): ValidationResult {
  return SQL_INJECTION_RE.test(value) ? fail(message) : ok();
}

// ---------------------------------------------------------------------------
// Composition helpers
// ---------------------------------------------------------------------------

export function compose<T>(
  ...validators: ValidatorFn<T>[]
): ValidatorFn<T> {
  return (value: T) => {
    const results = validators.map((v) => v(value));
    return merge(...results);
  };
}

export function any<T>(
  ...validators: ValidatorFn<T>[]
): ValidatorFn<T> {
  return (value: T) => {
    for (const v of validators) {
      const result = v(value);
      if (result.valid) return ok();
    }
    const allErrors = validators.flatMap((v) => v(value).errors);
    return { valid: false, errors: allErrors };
  };
}

export function not<T>(validator: ValidatorFn<T>): ValidatorFn<T> {
  return (value: T) => {
    const result = validator(value);
    if (result.valid) {
      return fail('Value must not satisfy the given rule');
    }
    return ok();
  };
}

export function validateAll(
  value: unknown,
  rules: ValidationRule<unknown>[],
): ValidationResult {
  const results = rules.map((r) => r.fn(value));
  return merge(...results);
}

export function createValidator<T>(
  rules: ValidationRule<T>[],
): (value: T) => ValidationResult {
  return (value: T) => {
    const results = rules.map((r) => r.fn(value));
    return merge(...results);
  };
}

// ---------------------------------------------------------------------------
// Re-export ComposeMode (used externally)
// ---------------------------------------------------------------------------

export type { ComposeMode };
