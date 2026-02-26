// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export function required(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return 'This field is required';
  return null;
}

export function minLength(min: number) {
  return (value: string): string | null => {
    if (typeof value !== 'string') return null;
    if (value.length < min) return `Minimum length is ${min} characters`;
    return null;
  };
}

export function maxLength(max: number) {
  return (value: string): string | null => {
    if (typeof value !== 'string') return null;
    if (value.length > max) return `Maximum length is ${max} characters`;
    return null;
  };
}

export function isNumber(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (isNaN(Number(value))) return 'Must be a valid number';
  return null;
}

export function isDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return 'Must be a valid date';
  return null;
}

export function isEmail(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(value))) return 'Must be a valid email address';
  return null;
}

export function isUrl(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  try {
    new URL(String(value));
    return null;
  } catch {
    return 'Must be a valid URL';
  }
}

export function composeValidators<T>(...validators: Array<(value: T) => string | null>) {
  return (value: T): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

export function min(minimum: number) {
  return (value: unknown): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) < minimum) return `Minimum value is ${minimum}`;
    return null;
  };
}

export function max(maximum: number) {
  return (value: unknown): string | null => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) > maximum) return `Maximum value is ${maximum}`;
    return null;
  };
}
