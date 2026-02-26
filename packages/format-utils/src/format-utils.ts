// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type {
  CurrencyOptions,
  NumberFormatOptions,
  FileSizeOptions,
  FileSizeUnit,
  DateRangeFormat,
  PhoneFormat,
  AddressComponents,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  CHF: 'Fr',
  AUD: 'A$',
  CAD: 'C$',
  CNY: '¥',
  INR: '₹',
  KRW: '₩',
  BRL: 'R$',
  MXN: 'MX$',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  SEK: 'kr',
  DKK: 'kr',
  NZD: 'NZ$',
  ZAR: 'R',
  AED: 'د.إ',
};

// Locales that use period as thousands sep and comma as decimal sep
const COMMA_DECIMAL_CURRENCIES = new Set(['EUR', 'NOK', 'SEK', 'DKK']);

function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency.toUpperCase();
}

function _formatWithSeparators(
  num: number,
  decimals: number,
  thousandsSep: string,
  decimalSep: string,
): string {
  const fixed = Math.abs(num).toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  if (decPart !== undefined && decimals > 0) {
    return `${withThousands}${decimalSep}${decPart}`;
  }
  return withThousands;
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

export function formatCurrency(amount: number, options?: CurrencyOptions): string {
  const currency = options?.currency ?? 'GBP';
  const decimals = options?.decimals ?? 2;
  const symbol = options?.symbol ?? getCurrencySymbol(currency);
  const symbolFirst = options?.symbolFirst ?? true;
  const isEuro = COMMA_DECIMAL_CURRENCIES.has(currency.toUpperCase());
  const thousandsSep = isEuro ? '.' : ',';
  const decimalSep = isEuro ? ',' : '.';
  const formatted = _formatWithSeparators(amount, decimals, thousandsSep, decimalSep);
  const sign = amount < 0 ? '-' : '';
  const value = symbolFirst ? `${sign}${symbol}${formatted}` : `${sign}${formatted} ${symbol}`;
  return value;
}

export function parseCurrency(str: string): number {
  // Remove all non-numeric characters except periods and commas and minus
  let cleaned = str.replace(/[^0-9.,''\-]/gu, '');
  // Detect European format: if last separator is comma and comma appears only once after digits
  // e.g. "1.234,56" → European; "1,234.56" → US/UK
  const lastComma = cleaned.lastIndexOf(',');
  const lastPeriod = cleaned.lastIndexOf('.');
  if (lastComma > lastPeriod) {
    // European format: periods are thousands sep, comma is decimal
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // US/UK format: commas are thousands sep
    cleaned = cleaned.replace(/,/g, '');
  }
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

export function formatAccounting(amount: number, currency?: string): string {
  const curr = currency ?? 'GBP';
  const symbol = getCurrencySymbol(curr);
  const abs = Math.abs(amount).toFixed(2);
  const [intPart, decPart] = abs.split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = `${symbol}${withThousands}.${decPart}`;
  if (amount < 0) {
    return `(${formatted})`;
  }
  return formatted;
}

export function formatCompact(amount: number, currency?: string): string {
  const symbol = getCurrencySymbol(currency ?? 'GBP');
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}${symbol}${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${symbol}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${symbol}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${sign}${symbol}${abs.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

export function formatNumber(n: number, opts?: NumberFormatOptions): string {
  const decimals = opts?.decimals ?? 0;
  const thousandsSep = opts?.thousandsSep ?? ',';
  const decimalSep = opts?.decimalSep ?? '.';
  const prefix = opts?.prefix ?? '';
  const suffix = opts?.suffix ?? '';
  const sign = n < 0 ? '-' : '';
  const formatted = _formatWithSeparators(n, decimals, thousandsSep, decimalSep);
  return `${sign}${prefix}${formatted}${suffix}`;
}

export function formatPct(n: number, decimals?: number): string {
  const dec = decimals ?? 1;
  return `${n.toFixed(dec)}%`;
}

export function formatPctChange(n: number, decimals?: number): string {
  const dec = decimals ?? 1;
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(dec)}%`;
}

export function formatOrdinal(n: number): string {
  const abs = Math.abs(Math.trunc(n));
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  let suffix: string;
  if (mod10 === 1 && mod100 !== 11) {
    suffix = 'st';
  } else if (mod10 === 2 && mod100 !== 12) {
    suffix = 'nd';
  } else if (mod10 === 3 && mod100 !== 13) {
    suffix = 'rd';
  } else {
    suffix = 'th';
  }
  return `${n}${suffix}`;
}

export function formatScientific(n: number, decimals?: number): string {
  const dec = decimals ?? 2;
  return n.toExponential(dec);
}

export function formatFraction(numerator: number, denominator: number): string {
  if (denominator === 0) return `${numerator}/0`;
  return `${numerator}/${denominator}`;
}

export function formatRatio(a: number, b: number): string {
  if (b === 0) return `${a}:0`;
  return `${a}:${b}`;
}

export function clampAndFormat(
  n: number,
  min: number,
  max: number,
  opts?: NumberFormatOptions,
): string {
  const clamped = Math.min(Math.max(n, min), max);
  return formatNumber(clamped, opts);
}

// ---------------------------------------------------------------------------
// File sizes
// ---------------------------------------------------------------------------

const BINARY_UNITS: FileSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const BINARY_DIVISOR = 1024;
const DECIMAL_DIVISOR = 1000;

function unitToBytes(unit: FileSizeUnit, binary: boolean): number {
  const idx = BINARY_UNITS.indexOf(unit);
  const divisor = binary ? BINARY_DIVISOR : DECIMAL_DIVISOR;
  return Math.pow(divisor, idx);
}

export function formatFileSize(bytes: number, opts?: FileSizeOptions): string {
  const binary = opts?.binary ?? false;
  const divisor = binary ? BINARY_DIVISOR : DECIMAL_DIVISOR;
  const decimals = opts?.decimals ?? 2;

  if (opts?.unit) {
    const unitBytes = unitToBytes(opts.unit, binary);
    const value = bytes / unitBytes;
    return `${value.toFixed(decimals)} ${opts.unit}`;
  }

  if (bytes === 0) return '0 B';

  const abs = Math.abs(bytes);
  let idx = 0;
  let value = abs;
  while (value >= divisor && idx < BINARY_UNITS.length - 1) {
    value /= divisor;
    idx++;
  }
  const sign = bytes < 0 ? '-' : '';
  const unit = BINARY_UNITS[idx];
  if (idx === 0) {
    return `${sign}${value.toFixed(0)} B`;
  }
  return `${sign}${value.toFixed(decimals)} ${unit}`;
}

export function parseFileSize(str: string): number {
  const match = str.trim().match(/^([\d.]+)\s+(B|KB|MB|GB|TB|PB)$/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase() as FileSizeUnit;
  return value * unitToBytes(unit, false);
}

export function formatFileSizeRange(minBytes: number, maxBytes: number): string {
  return `${formatFileSize(minBytes)} \u2013 ${formatFileSize(maxBytes)}`;
}

// ---------------------------------------------------------------------------
// Dates / times
// ---------------------------------------------------------------------------

function toDate(date: Date | number): Date {
  return typeof date === 'number' ? new Date(date) : date;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatDate(date: Date | number, format?: string): string {
  const d = toDate(date);
  const fmt = format ?? 'DD/MM/YYYY';
  const yyyy = String(d.getFullYear());
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const mon = MONTH_NAMES_SHORT[d.getMonth()];
  const month = MONTH_NAMES_LONG[d.getMonth()];
  // Replace longest tokens first to avoid partial replacement (MMMM before MMM before MM)
  return fmt
    .replace('YYYY', yyyy)
    .replace('MMMM', month)
    .replace('MMM', mon)
    .replace('MM', mm)
    .replace('DD', dd);
}

export function formatTime(date: Date | number, use24h?: boolean): string {
  const d = toDate(date);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  if (use24h !== false) {
    return `${pad2(hours)}:${pad2(minutes)}`;
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${pad2(minutes)} ${period}`;
}

export function formatDateTime(date: Date | number): string {
  const d = toDate(date);
  const day = d.getDate();
  const mon = MONTH_NAMES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  const time = formatTime(d, true);
  return `${day} ${mon} ${year}, ${time}`;
}

export function formatRelative(date: Date | number, now?: Date | number): string {
  const d = toDate(date).getTime();
  const n = now !== undefined ? toDate(now).getTime() : Date.now();
  const diffMs = d - n;
  const absMs = Math.abs(diffMs);
  const past = diffMs < 0;

  const seconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(absMs / 60_000);
  const hours = Math.floor(absMs / 3_600_000);
  const days = Math.floor(absMs / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let label: string;
  if (seconds < 10) {
    label = 'just now';
    return label;
  } else if (seconds < 60) {
    label = `${seconds} second${seconds === 1 ? '' : 's'}`;
  } else if (minutes < 60) {
    label = `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else if (hours < 24) {
    label = `${hours} hour${hours === 1 ? '' : 's'}`;
  } else if (days < 7) {
    label = `${days} day${days === 1 ? '' : 's'}`;
  } else if (weeks < 5) {
    label = `${weeks} week${weeks === 1 ? '' : 's'}`;
  } else if (months < 12) {
    label = `${months} month${months === 1 ? '' : 's'}`;
  } else {
    label = `${years} year${years === 1 ? '' : 's'}`;
  }

  return past ? `${label} ago` : `in ${label}`;
}

export function formatDateRange(
  from: Date | number,
  to: Date | number,
  format?: DateRangeFormat,
): string {
  const f = toDate(from);
  const t = toDate(to);
  const fmt = format ?? 'medium';

  if (fmt === 'iso') {
    return `${formatISODate(f)} / ${formatISODate(t)}`;
  }
  if (fmt === 'relative') {
    return `${formatRelative(f)} \u2013 ${formatRelative(t)}`;
  }

  const fromDay = f.getDate();
  const fromMon = fmt === 'long' ? MONTH_NAMES_LONG[f.getMonth()] : MONTH_NAMES_SHORT[f.getMonth()];
  const fromYear = f.getFullYear();
  const toDay = t.getDate();
  const toMon = fmt === 'long' ? MONTH_NAMES_LONG[t.getMonth()] : MONTH_NAMES_SHORT[t.getMonth()];
  const toYear = t.getFullYear();

  if (fmt === 'short') {
    return `${pad2(fromDay)}/${pad2(f.getMonth() + 1)}/${fromYear} \u2013 ${pad2(toDay)}/${pad2(t.getMonth() + 1)}/${toYear}`;
  }

  if (fromYear === toYear) {
    if (f.getMonth() === t.getMonth()) {
      return `${fromDay} \u2013 ${toDay} ${toMon} ${toYear}`;
    }
    return `${fromDay} ${fromMon} \u2013 ${toDay} ${toMon} ${toYear}`;
  }
  return `${fromDay} ${fromMon} ${fromYear} \u2013 ${toDay} ${toMon} ${toYear}`;
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

export function formatISODate(date: Date | number): string {
  const d = toDate(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatISODateTime(date: Date | number): string {
  const d = toDate(date);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// ---------------------------------------------------------------------------
// Strings / identifiers
// ---------------------------------------------------------------------------

export function formatPhoneNumber(phone: string, format?: PhoneFormat): string {
  // Strip all non-digit characters except leading +
  const hasPlus = phone.trimStart().startsWith('+');
  const digits = phone.replace(/\D/g, '');
  const fmt = format ?? 'international';

  if (fmt === 'E164') {
    return hasPlus ? `+${digits}` : `+${digits}`;
  }
  if (fmt === 'RFC3966') {
    return `tel:${hasPlus ? '+' : ''}${digits}`;
  }
  if (fmt === 'national') {
    // Remove leading country code heuristic (first 1-2 digits if >10 digits)
    if (digits.length === 11 && digits.startsWith('0')) {
      // UK national format: 07XXX XXXXXX
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return digits;
  }
  // international
  if (digits.length === 10) {
    // US/CA: (XXX) XXX-XXXX
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && (hasPlus || digits.startsWith('1'))) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return hasPlus ? `+${digits}` : digits;
}

export function formatPostcode(postcode: string): string {
  // Normalise UK postcodes: remove spaces, uppercase, then insert space before last 3 chars
  const clean = postcode.replace(/\s+/g, '').toUpperCase();
  if (clean.length >= 5 && clean.length <= 7) {
    const inward = clean.slice(-3);
    const outward = clean.slice(0, -3);
    return `${outward} ${inward}`;
  }
  return clean;
}

export function formatAddress(components: AddressComponents, singleLine?: boolean): string {
  const parts = [
    components.line1,
    components.line2,
    components.city,
    components.state,
    components.postalCode,
    components.country,
  ].filter((p): p is string => Boolean(p));

  if (singleLine) {
    return parts.join(', ');
  }
  return parts.join('\n');
}

export function formatName(first: string, last: string, middle?: string): string {
  if (middle) {
    const initial = middle.charAt(0).toUpperCase();
    return `${first} ${initial}. ${last}`;
  }
  return `${first} ${last}`;
}

export function formatInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

export function maskString(str: string, visibleChars?: number, maskChar?: string): string {
  const visible = visibleChars ?? 4;
  const mask = maskChar ?? '*';
  if (str.length === 0) return '';
  if (visible <= 0) {
    return mask.repeat(str.length);
  }
  if (str.length <= visible) {
    return mask.repeat(str.length);
  }
  const show = str.slice(-visible);
  const hidden = mask.repeat(str.length - visible);
  return `${hidden}${show}`;
}

export function formatIBAN(iban: string): string {
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  // Group into blocks of 4
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

export function formatCreditCard(number: string): string {
  const clean = number.replace(/\D/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

export function formatSortCode(sortCode: string): string {
  const digits = sortCode.replace(/\D/g, '');
  if (digits.length !== 6) return sortCode;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
}

export function truncateMiddle(str: string, maxLen: number, ellipsis?: string): string {
  const sep = ellipsis ?? '...';
  if (str.length <= maxLen) return str;
  const charsToShow = maxLen - sep.length;
  if (charsToShow <= 0) return sep;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return `${str.slice(0, frontChars)}${sep}${str.slice(str.length - backChars)}`;
}

// ---------------------------------------------------------------------------
// Lists / misc
// ---------------------------------------------------------------------------

export function formatList(items: string[], conjunction?: string): string {
  const conj = conjunction ?? 'and';
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conj} ${items[1]}`;
  const allButLast = items.slice(0, -1).join(', ');
  return `${allButLast}, ${conj} ${items[items.length - 1]}`;
}

export function formatBytes(bytes: number): string {
  // Binary (1024-based) shorthand
  if (bytes === 0) return '0 B';
  const abs = Math.abs(bytes);
  const sign = bytes < 0 ? '-' : '';
  const units: FileSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let idx = 0;
  let value = abs;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx++;
  }
  if (idx === 0) return `${sign}${value.toFixed(0)} B`;
  return `${sign}${value.toFixed(2)} ${units[idx]}`;
}

export function formatVersion(
  major: number,
  minor: number,
  patch: number,
  pre?: string,
): string {
  const base = `${major}.${minor}.${patch}`;
  return pre ? `${base}-${pre}` : base;
}
