// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { CountryPhoneInfo, PhoneFormat, PhoneNumber } from './types';

// ---------------------------------------------------------------------------
// Country registry
// ---------------------------------------------------------------------------

export const COUNTRIES: Record<string, CountryPhoneInfo> = {
  GB: {
    code: 'GB', name: 'United Kingdom', callingCode: '44',
    pattern: /^[1-9]\d{8,9}$/,
    format: '(XXXX) XXXXXX',
    trunkPrefix: '0',
  },
  US: {
    code: 'US', name: 'United States', callingCode: '1',
    pattern: /^[2-9]\d{9}$/,
    format: '(XXX) XXX-XXXX',
  },
  CA: {
    code: 'CA', name: 'Canada', callingCode: '1',
    pattern: /^[2-9]\d{9}$/,
    format: '(XXX) XXX-XXXX',
  },
  DE: {
    code: 'DE', name: 'Germany', callingCode: '49',
    pattern: /^[1-9]\d{3,12}$/,
    format: 'XXXX XXXXXXXX',
    trunkPrefix: '0',
  },
  FR: {
    code: 'FR', name: 'France', callingCode: '33',
    pattern: /^[1-9]\d{8}$/,
    format: 'XX XX XX XX XX',
    trunkPrefix: '0',
  },
  IT: {
    code: 'IT', name: 'Italy', callingCode: '39',
    pattern: /^\d{6,11}$/,
    format: 'XXX XXXXXXX',
  },
  ES: {
    code: 'ES', name: 'Spain', callingCode: '34',
    pattern: /^[6789]\d{8}$/,
    format: 'XXX XXX XXX',
  },
  NL: {
    code: 'NL', name: 'Netherlands', callingCode: '31',
    pattern: /^[1-9]\d{8}$/,
    format: 'XX XXX XXXX',
    trunkPrefix: '0',
  },
  BE: {
    code: 'BE', name: 'Belgium', callingCode: '32',
    pattern: /^[1-9]\d{7,8}$/,
    format: 'XXX XX XX XX',
    trunkPrefix: '0',
  },
  CH: {
    code: 'CH', name: 'Switzerland', callingCode: '41',
    pattern: /^[1-9]\d{8}$/,
    format: 'XX XXX XX XX',
    trunkPrefix: '0',
  },
  AT: {
    code: 'AT', name: 'Austria', callingCode: '43',
    pattern: /^[1-9]\d{3,12}$/,
    format: 'XXXX XXXXXX',
    trunkPrefix: '0',
  },
  SE: {
    code: 'SE', name: 'Sweden', callingCode: '46',
    pattern: /^[1-9]\d{6,9}$/,
    format: 'XXX XXX XX XX',
    trunkPrefix: '0',
  },
  NO: {
    code: 'NO', name: 'Norway', callingCode: '47',
    pattern: /^[2-9]\d{7}$/,
    format: 'XXXX XXXX',
  },
  DK: {
    code: 'DK', name: 'Denmark', callingCode: '45',
    pattern: /^\d{8}$/,
    format: 'XXXX XXXX',
  },
  FI: {
    code: 'FI', name: 'Finland', callingCode: '358',
    pattern: /^[1-9]\d{4,11}$/,
    format: 'XXX XXXXXXX',
    trunkPrefix: '0',
  },
  PL: {
    code: 'PL', name: 'Poland', callingCode: '48',
    pattern: /^[1-9]\d{8}$/,
    format: 'XXX XXX XXX',
  },
  CZ: {
    code: 'CZ', name: 'Czech Republic', callingCode: '420',
    pattern: /^[1-9]\d{8}$/,
    format: 'XXX XXX XXX',
  },
  HU: {
    code: 'HU', name: 'Hungary', callingCode: '36',
    pattern: /^[1-9]\d{7,8}$/,
    format: 'XX XXX XXXX',
    trunkPrefix: '06',
  },
  RO: {
    code: 'RO', name: 'Romania', callingCode: '40',
    pattern: /^[237]\d{8}$/,
    format: 'XXX XXX XXX',
    trunkPrefix: '0',
  },
  PT: {
    code: 'PT', name: 'Portugal', callingCode: '351',
    pattern: /^[239]\d{8}$/,
    format: 'XXX XXX XXX',
  },
  AU: {
    code: 'AU', name: 'Australia', callingCode: '61',
    pattern: /^[2-578]\d{8}$/,
    format: 'XXXX XXX XXX',
    trunkPrefix: '0',
  },
  NZ: {
    code: 'NZ', name: 'New Zealand', callingCode: '64',
    pattern: /^[2-9]\d{7,9}$/,
    format: 'XXX XXX XXXX',
    trunkPrefix: '0',
  },
  ZA: {
    code: 'ZA', name: 'South Africa', callingCode: '27',
    pattern: /^[1-9]\d{8}$/,
    format: 'XXX XXX XXXX',
    trunkPrefix: '0',
  },
  IN: {
    code: 'IN', name: 'India', callingCode: '91',
    pattern: /^[6-9]\d{9}$/,
    format: 'XXXXX XXXXX',
  },
  CN: {
    code: 'CN', name: 'China', callingCode: '86',
    pattern: /^1[3-9]\d{9}$/,
    format: 'XXX XXXX XXXX',
  },
  JP: {
    code: 'JP', name: 'Japan', callingCode: '81',
    pattern: /^[1-9]\d{8,9}$/,
    format: 'XXX XXXX XXXX',
    trunkPrefix: '0',
  },
  KR: {
    code: 'KR', name: 'South Korea', callingCode: '82',
    pattern: /^[1-9]\d{7,9}$/,
    format: 'XXX XXXX XXXX',
    trunkPrefix: '0',
  },
  SG: {
    code: 'SG', name: 'Singapore', callingCode: '65',
    pattern: /^[689]\d{7}$/,
    format: 'XXXX XXXX',
  },
  HK: {
    code: 'HK', name: 'Hong Kong', callingCode: '852',
    pattern: /^[2-9]\d{7}$/,
    format: 'XXXX XXXX',
  },
  AE: {
    code: 'AE', name: 'United Arab Emirates', callingCode: '971',
    pattern: /^[1-9]\d{8}$/,
    format: 'XX XXX XXXX',
    trunkPrefix: '0',
  },
  SA: {
    code: 'SA', name: 'Saudi Arabia', callingCode: '966',
    pattern: /^[1-9]\d{8}$/,
    format: 'XXX XXX XXXX',
    trunkPrefix: '0',
  },
  BR: {
    code: 'BR', name: 'Brazil', callingCode: '55',
    pattern: /^[1-9][1-9]\d{8,9}$/,
    format: 'XX XXXXX XXXX',
    trunkPrefix: '0',
  },
  MX: {
    code: 'MX', name: 'Mexico', callingCode: '52',
    pattern: /^[1-9]\d{9}$/,
    format: 'XXX XXX XXXX',
  },
  AR: {
    code: 'AR', name: 'Argentina', callingCode: '54',
    pattern: /^[1-9]\d{9}$/,
    format: 'XXX XXXX XXXX',
    trunkPrefix: '0',
  },
  TR: {
    code: 'TR', name: 'Turkey', callingCode: '90',
    pattern: /^[1-9]\d{9}$/,
    format: 'XXX XXX XXXX',
    trunkPrefix: '0',
  },
  EG: {
    code: 'EG', name: 'Egypt', callingCode: '20',
    pattern: /^[1-9]\d{9}$/,
    format: 'XXX XXXX XXXX',
    trunkPrefix: '0',
  },
  NG: {
    code: 'NG', name: 'Nigeria', callingCode: '234',
    pattern: /^[7-9]\d{9}$/,
    format: 'XXX XXXX XXXX',
    trunkPrefix: '0',
  },
  KE: {
    code: 'KE', name: 'Kenya', callingCode: '254',
    pattern: /^[7][0-9]\d{7,8}$/,
    format: 'XXX XXXXXXX',
    trunkPrefix: '0',
  },
  PK: {
    code: 'PK', name: 'Pakistan', callingCode: '92',
    pattern: /^3\d{9}$/,
    format: 'XXX XXXXXXX',
    trunkPrefix: '0',
  },
  BD: {
    code: 'BD', name: 'Bangladesh', callingCode: '880',
    pattern: /^1[3-9]\d{8}$/,
    format: 'XXXX XXXXXX',
    trunkPrefix: '0',
  },
  ID: {
    code: 'ID', name: 'Indonesia', callingCode: '62',
    pattern: /^[1-9]\d{5,11}$/,
    format: 'XXX XXXX XXXX',
    trunkPrefix: '0',
  },
};

// Build a calling-code → country map (longest match first for disambiguation)
const CALLING_CODE_MAP: Map<string, CountryPhoneInfo> = new Map();
(function buildCallingCodeMap() {
  // Insert longer codes first so they win when iterating
  const entries = Object.values(COUNTRIES).sort(
    (a, b) => b.callingCode.length - a.callingCode.length,
  );
  for (const info of entries) {
    if (!CALLING_CODE_MAP.has(info.callingCode)) {
      CALLING_CODE_MAP.set(info.callingCode, info);
    }
  }
})();

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Strip everything except digits and a leading '+'.
 */
export function normalizePhone(number: string): string {
  if (!number) return '';
  const trimmed = number.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Return true when the string is a valid E.164 number.
 */
export function isE164(number: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(number);
}

// ---------------------------------------------------------------------------
// Calling-code / country lookups
// ---------------------------------------------------------------------------

export function getCallingCode(country: string): string | undefined {
  return COUNTRIES[country.toUpperCase()]?.callingCode;
}

export function getCountryByCallingCode(callingCode: string): CountryPhoneInfo | undefined {
  return CALLING_CODE_MAP.get(callingCode);
}

/**
 * Detect country from an E.164 string by trying longest calling-code first.
 */
export function detectCountry(e164: string): CountryPhoneInfo | undefined {
  if (!e164.startsWith('+')) return undefined;
  const digits = e164.slice(1);
  // Try 3-digit, 2-digit, 1-digit calling codes
  for (const len of [3, 2, 1]) {
    const candidate = digits.slice(0, len);
    const info = CALLING_CODE_MAP.get(candidate);
    if (info) return info;
  }
  return undefined;
}

export function getCountries(): CountryPhoneInfo[] {
  return Object.values(COUNTRIES);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function isValidPhone(number: string, country?: string): boolean {
  const normalized = normalizePhone(number);
  if (!normalized) return false;

  if (country) {
    const info = COUNTRIES[country.toUpperCase()];
    if (!info) return false;
    // Strip leading + and calling code if present
    let national = normalized;
    if (national.startsWith(`+${info.callingCode}`)) {
      national = national.slice(1 + info.callingCode.length);
    } else if (national.startsWith('+')) {
      return false; // different country
    } else {
      // Strip trunk prefix
      if (info.trunkPrefix && national.startsWith(info.trunkPrefix)) {
        national = national.slice(info.trunkPrefix.length);
      }
    }
    return info.pattern.test(national);
  }

  // No country hint — try to detect via calling code
  if (normalized.startsWith('+')) {
    const info = detectCountry(normalized);
    if (!info) return false;
    const national = normalized.slice(1 + info.callingCode.length);
    return info.pattern.test(national);
  }

  return false;
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

/**
 * Convert a national number to E.164, stripping trunk prefix.
 */
export function toE164(nationalNumber: string, country: string): string | null {
  const info = COUNTRIES[country.toUpperCase()];
  if (!info) return null;

  let national = normalizePhone(nationalNumber).replace(/^\+/, '');

  // Strip calling code if already included
  if (national.startsWith(info.callingCode)) {
    national = national.slice(info.callingCode.length);
  }

  // Strip trunk prefix
  if (info.trunkPrefix && national.startsWith(info.trunkPrefix)) {
    national = national.slice(info.trunkPrefix.length);
  }

  if (!info.pattern.test(national)) return null;
  return `+${info.callingCode}${national}`;
}

/**
 * Convert an E.164 number to national format with trunk prefix.
 */
export function toNational(e164: string): string | null {
  if (!isE164(e164)) return null;
  const info = detectCountry(e164);
  if (!info) return null;
  const national = e164.slice(1 + info.callingCode.length);
  const trunk = info.trunkPrefix ?? '';
  const withTrunk = `${trunk}${national}`;
  if (info.format) {
    return formatTemplate(withTrunk, info.format.replace(/X/g, (_) => 'X'));
  }
  return withTrunk;
}

/**
 * Convert an E.164 number to international display format: "+CC NNN..."
 */
export function toInternational(e164: string): string | null {
  if (!isE164(e164)) return null;
  const info = detectCountry(e164);
  if (!info) return null;
  const national = e164.slice(1 + info.callingCode.length);
  return `+${info.callingCode} ${national}`;
}

/**
 * Convert an E.164 number to RFC 3966 tel URI.
 */
export function toRFC3966(e164: string): string | null {
  if (!isE164(e164)) return null;
  return `tel:${e164}`;
}

/**
 * Apply a format template to a digit string. 'X' positions are filled with
 * consecutive digits; all other characters are kept as-is.
 * If there are more digits than X positions the remainder is appended.
 */
export function formatTemplate(nationalNumber: string, template: string): string {
  const digits = nationalNumber.replace(/\D/g, '');
  let di = 0;
  let result = '';
  for (const ch of template) {
    if (ch === 'X') {
      if (di < digits.length) {
        result += digits[di++];
      }
    } else {
      result += ch;
    }
  }
  // Append any remaining digits
  if (di < digits.length) {
    result += digits.slice(di);
  }
  return result.trim();
}

// ---------------------------------------------------------------------------
// Main format dispatcher
// ---------------------------------------------------------------------------

export function formatPhone(
  number: string,
  format: PhoneFormat,
  country?: string,
): string | null {
  // First, get an E.164 representation
  let e164: string | null = null;

  const normalized = normalizePhone(number);
  if (isE164(normalized)) {
    e164 = normalized;
  } else if (country) {
    e164 = toE164(normalized, country);
  }

  if (!e164) return null;

  switch (format) {
    case 'e164':        return e164;
    case 'national':    return toNational(e164);
    case 'international': return toInternational(e164);
    case 'rfc3966':     return toRFC3966(e164);
    default:            return null;
  }
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export function parsePhone(number: string, defaultCountry?: string): PhoneNumber {
  const raw = number;
  const normalized = normalizePhone(number);
  const empty: PhoneNumber = {
    raw, e164: '', nationalNumber: '', countryCode: '', callingCode: '', valid: false,
  };

  if (!normalized) return empty;

  // --- Case 1: starts with '+'  → treat as international
  if (normalized.startsWith('+')) {
    if (!isE164(normalized)) return empty;
    const info = detectCountry(normalized);
    if (!info) return empty;
    const national = normalized.slice(1 + info.callingCode.length);
    const valid = info.pattern.test(national);
    return {
      raw,
      e164: normalized,
      nationalNumber: national,
      countryCode: info.code,
      callingCode: info.callingCode,
      valid,
    };
  }

  // --- Case 2: no '+', use defaultCountry
  if (defaultCountry) {
    const info = COUNTRIES[defaultCountry.toUpperCase()];
    if (!info) return empty;
    let national = normalized;
    if (info.trunkPrefix && national.startsWith(info.trunkPrefix)) {
      national = national.slice(info.trunkPrefix.length);
    }
    const valid = info.pattern.test(national);
    const e164 = valid ? `+${info.callingCode}${national}` : '';
    return {
      raw,
      e164,
      nationalNumber: national,
      countryCode: info.code,
      callingCode: info.callingCode,
      valid,
    };
  }

  return empty;
}

// ---------------------------------------------------------------------------
// Type-detection helpers
// ---------------------------------------------------------------------------

export function isMobile(number: string, country?: string): boolean {
  const normalized = normalizePhone(number);
  const parsed = parsePhone(normalized, country);

  if (!parsed.valid && !isE164(normalized)) return false;

  const nat = parsed.nationalNumber || normalized.replace(/^\+\d{1,3}/, '');
  const cc = parsed.callingCode || (country ? getCallingCode(country) : undefined);

  switch (cc) {
    case '44': return /^7/.test(nat);   // UK 07xxx
    case '1':  return /^[2-9]\d{9}$/.test(nat); // US/CA all 10-digit start 2-9
    case '49': return /^1[5-7]/.test(nat); // DE mobile
    case '33': return /^[67]/.test(nat);  // FR
    case '39': return /^3/.test(nat);     // IT
    case '34': return /^[67]/.test(nat);  // ES
    case '61': return /^4/.test(nat);     // AU
    case '91': return /^[6-9]/.test(nat); // IN
    case '27': return /^[678]/.test(nat); // ZA (6x, 7x, 8x = mobile)
    case '86': return /^1[3-9]/.test(nat); // CN
    case '81': return /^[79]0/.test(nat);  // JP
    case '82': return /^10/.test(nat);     // KR
    case '65': return /^[89]/.test(nat);   // SG
    case '852': return /^[5-9]/.test(nat); // HK (5x, 6x, 9x = mobile)
    case '971': return /^5/.test(nat);     // AE
    case '55': return /^\d{2}9/.test(nat); // BR (9 = mobile)
    case '92': return /^3/.test(nat);      // PK
    case '234': return /^[789]/.test(nat); // NG
    default: return false;
  }
}

export function isLocalRate(number: string): boolean {
  const normalized = normalizePhone(number);
  // UK 03xxx or US 8xx numbers (local/non-geographic)
  if (/^(\+44|0)3/.test(normalized)) return true;
  if (/^\+18[0-9]{2}/.test(normalized)) return true;
  return false;
}

export function isTollFree(number: string, country?: string): boolean {
  const normalized = normalizePhone(number);
  const cc = country ? getCallingCode(country) : detectCountry(normalized.startsWith('+') ? normalized : '')?.callingCode;

  // UK toll-free: 0800, 0808
  if (/^(\+44|0)(800|808)/.test(normalized)) return true;
  // US/CA toll-free: 800, 888, 877, 866, 855, 844, 833
  if (/^(\+1)?8(00|88|77|66|55|44|33)\d{7}$/.test(normalized.replace(/\s/g, ''))) return true;
  // AU toll-free: 1800 (E.164: +611800..., national: 1800... or 01800...)
  if (/^(\+61|0)1800/.test(normalized)) return true;
  if (/^\+611800/.test(normalized)) return true;

  if (cc === '44') return /^(800|808)/.test(normalized.replace(/^\+44/, '').replace(/^0/, ''));
  if (cc === '1')  return /^8(00|88|77|66|55|44|33)\d{7}$/.test(normalized.replace(/^\+1/, ''));
  if (cc === '61') return /^1800/.test(normalized.replace(/^\+61/, '').replace(/^0/, ''));

  return false;
}

// ---------------------------------------------------------------------------
// Text extraction
// ---------------------------------------------------------------------------

/**
 * Extract phone-number-like patterns from free text.
 * Returns an array of raw matched strings.
 */
export function extractPhones(text: string): string[] {
  if (!text) return [];
  const pattern =
    /(?:\+\d{1,3}[\s\-.]?)(?:\(?\d{1,4}\)?[\s\-.]?)(?:\d[\s\-.]?){4,10}\d|(?:\(?\d{2,4}\)?[\s\-.]?)(?:\d[\s\-.]?){3,8}\d/g;
  const matches = text.match(pattern) ?? [];
  return matches.map((m) => m.trim());
}

// ---------------------------------------------------------------------------
// Masking
// ---------------------------------------------------------------------------

/**
 * Mask a phone number, keeping the last `visibleLast` digits visible.
 * Default: last 4 visible.
 */
export function maskPhone(e164: string, visibleLast = 4): string {
  if (!e164) return '';
  const normalized = normalizePhone(e164);
  if (!normalized) return '';

  const info = normalized.startsWith('+') ? detectCountry(normalized) : undefined;
  const prefix = info ? `+${info.callingCode}` : normalized.startsWith('+') ? '+' : '';
  const national = normalized.startsWith('+')
    ? normalized.slice(prefix.length)
    : normalized;

  if (national.length <= visibleLast) {
    return `${prefix}${national}`;
  }

  const visible = national.slice(-visibleLast);
  const hidden = '*** *** ';
  return `${prefix} ${hidden}${visible}`.trim();
}

// ---------------------------------------------------------------------------
// Equivalence
// ---------------------------------------------------------------------------

/**
 * Normalise both numbers to E.164 and compare.
 */
export function areEquivalent(a: string, b: string, country?: string): boolean {
  const parsedA = parsePhone(normalizePhone(a), country);
  const parsedB = parsePhone(normalizePhone(b), country);
  if (!parsedA.valid || !parsedB.valid) return false;
  return parsedA.e164 === parsedB.e164;
}

// ---------------------------------------------------------------------------
// Random phone generation (syntactically valid, for testing)
// ---------------------------------------------------------------------------

function randomDigit(min = 0, max = 9): string {
  return String(min + Math.floor(Math.random() * (max - min + 1)));
}

function randomDigits(count: number): string {
  let s = '';
  for (let i = 0; i < count; i++) s += randomDigit();
  return s;
}

export function generatePhone(country: string): string {
  const info = COUNTRIES[country.toUpperCase()];
  if (!info) throw new Error(`Unknown country: ${country}`);

  // Use pattern source to derive a valid number length
  const src = info.pattern.source;

  // Extract min/max length from pattern (heuristic)
  const rangeMatch = src.match(/\\d\{(\d+),(\d+)\}/);
  const exactMatch = src.match(/\\d\{(\d+)\}/);

  let natLen: number;
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    natLen = min + Math.floor(Math.random() * (max - min + 1));
  } else if (exactMatch) {
    natLen = parseInt(exactMatch[1], 10);
  } else {
    natLen = 9; // sensible default
  }

  // Determine the first digit constraint from pattern
  const firstDigitMatch = src.match(/^\^?\[([^\]]+)\]/);
  let firstDigit: string;
  if (firstDigitMatch) {
    const chars = firstDigitMatch[1];
    // e.g. "[1-9]" → pick between 1 and 9, "[6789]" → pick one of those
    if (chars.includes('-')) {
      const [lo, hi] = chars.split('-');
      const loD = parseInt(lo.replace(/[^0-9]/, '') || '1', 10);
      const hiD = parseInt(hi.replace(/[^0-9]/, '') || '9', 10);
      firstDigit = randomDigit(loD, hiD);
    } else {
      firstDigit = chars[Math.floor(Math.random() * chars.length)];
    }
  } else if (src.startsWith('^1')) {
    firstDigit = '1';
  } else if (src.startsWith('^3')) {
    firstDigit = '3';
  } else if (src.startsWith('^\\d')) {
    firstDigit = randomDigit(0, 9);
  } else {
    firstDigit = randomDigit(1, 9);
  }

  // For patterns starting with "1[3-9]" (CN, BD)
  let national: string;
  if (/^\^?1\[3-9\]/.test(src)) {
    national = '1' + randomDigit(3, 9) + randomDigits(natLen - 2 + 1);
  } else if (/^\^?[2-9]/.test(src) && country === 'US') {
    // US: [2-9]XXXXXXXXX = 10 digits total
    national = firstDigit + randomDigit(0, 9) + randomDigit(0, 9) + randomDigits(7);
  } else {
    const remainLen = Math.max(0, natLen - 1);
    national = firstDigit + randomDigits(remainLen);
  }

  // Clamp to a length that typically satisfies the pattern
  return `+${info.callingCode}${national}`;
}
