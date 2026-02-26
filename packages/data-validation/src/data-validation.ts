// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential.

export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isPhone(phone: string): boolean {
  return /^[\+]?[\d\s\-\(\)]{7,20}$/.test(phone);
}

export function isPostcode(postcode: string): boolean {
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  return /^[A-Z]{1,2}\d{1,2}[A-Z]?\d[A-Z]{2}$/.test(cleaned);
}

export function isIpv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const n = parseInt(p, 10);
    return /^\d+$/.test(p) && n >= 0 && n <= 255;
  });
}

export function isIpv6(ip: string): boolean {
  return /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(ip);
}

export function isMacAddress(mac: string): boolean {
  return /^([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}$/.test(mac);
}

export function isUuid(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function isNumeric(value: string): boolean {
  return value.trim() !== '' && !isNaN(Number(value));
}

export function isInteger(value: string): boolean {
  return /^-?\d+$/.test(value.trim());
}

export function isPositive(value: number): boolean {
  return value > 0;
}

export function isNegative(value: number): boolean {
  return value < 0;
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function isNonEmpty(value: string | unknown[]): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  return value.length > 0;
}

export function isAlpha(value: string): boolean {
  return /^[a-zA-Z]+$/.test(value);
}

export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

export function hasMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function hasMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

export function isDate(value: string): boolean {
  const d = new Date(value);
  return !isNaN(d.getTime());
}

export function isFutureDate(value: string): boolean {
  return isDate(value) && new Date(value) > new Date();
}

export function isPastDate(value: string): boolean {
  return isDate(value) && new Date(value) < new Date();
}

export function isValidJson(value: string): boolean {
  try { JSON.parse(value); return true; } catch { return false; }
}

export function isValidBase64String(value: string): boolean {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(value) && value.length % 4 === 0;
}

export function validateRequired(fields: Record<string, unknown>, required: string[]): string[] {
  return required.filter(f => {
    const v = fields[f];
    return v === undefined || v === null || v === '';
  });
}

export function validateSchema(data: Record<string, unknown>, schema: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, type] of Object.entries(schema)) {
    if (!(field in data)) { errors[field] = `${field} is required`; continue; }
    if (type === 'string' && typeof data[field] !== 'string') errors[field] = `${field} must be a string`;
    if (type === 'number' && typeof data[field] !== 'number') errors[field] = `${field} must be a number`;
    if (type === 'boolean' && typeof data[field] !== 'boolean') errors[field] = `${field} must be a boolean`;
    if (type === 'array' && !Array.isArray(data[field])) errors[field] = `${field} must be an array`;
  }
  return errors;
}

export function sanitizeString(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

export function isValidCreditCard(number: string): boolean {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}
