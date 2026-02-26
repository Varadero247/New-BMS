// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type {
  RoundingMode,
  CurrencyCode,
  Money,
  CurrencyInfo,
  FormatOptions,
  ExchangeRate,
} from './types';

// ---------------------------------------------------------------------------
// Currency registry (30 currencies, ISO 4217)
// ---------------------------------------------------------------------------

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  GBP: { code: 'GBP', name: 'British Pound',        symbol: '£',   decimals: 2, symbolPosition: 'before' },
  USD: { code: 'USD', name: 'US Dollar',             symbol: '$',   decimals: 2, symbolPosition: 'before' },
  EUR: { code: 'EUR', name: 'Euro',                  symbol: '€',   decimals: 2, symbolPosition: 'before' },
  JPY: { code: 'JPY', name: 'Japanese Yen',          symbol: '¥',   decimals: 0, symbolPosition: 'before' },
  CHF: { code: 'CHF', name: 'Swiss Franc',           symbol: 'Fr',  decimals: 2, symbolPosition: 'before' },
  CAD: { code: 'CAD', name: 'Canadian Dollar',       symbol: 'CA$', decimals: 2, symbolPosition: 'before' },
  AUD: { code: 'AUD', name: 'Australian Dollar',     symbol: 'A$',  decimals: 2, symbolPosition: 'before' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar',    symbol: 'NZ$', decimals: 2, symbolPosition: 'before' },
  SEK: { code: 'SEK', name: 'Swedish Krona',         symbol: 'kr',  decimals: 2, symbolPosition: 'after'  },
  NOK: { code: 'NOK', name: 'Norwegian Krone',       symbol: 'kr',  decimals: 2, symbolPosition: 'after'  },
  DKK: { code: 'DKK', name: 'Danish Krone',          symbol: 'kr',  decimals: 2, symbolPosition: 'after'  },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar',      symbol: 'HK$', decimals: 2, symbolPosition: 'before' },
  SGD: { code: 'SGD', name: 'Singapore Dollar',      symbol: 'S$',  decimals: 2, symbolPosition: 'before' },
  CNY: { code: 'CNY', name: 'Chinese Yuan',          symbol: '¥',   decimals: 2, symbolPosition: 'before' },
  INR: { code: 'INR', name: 'Indian Rupee',          symbol: '₹',   decimals: 2, symbolPosition: 'before' },
  BRL: { code: 'BRL', name: 'Brazilian Real',        symbol: 'R$',  decimals: 2, symbolPosition: 'before' },
  MXN: { code: 'MXN', name: 'Mexican Peso',          symbol: 'MX$', decimals: 2, symbolPosition: 'before' },
  ZAR: { code: 'ZAR', name: 'South African Rand',    symbol: 'R',   decimals: 2, symbolPosition: 'before' },
  SAR: { code: 'SAR', name: 'Saudi Riyal',           symbol: '﷼',   decimals: 2, symbolPosition: 'before' },
  AED: { code: 'AED', name: 'UAE Dirham',            symbol: 'د.إ', decimals: 2, symbolPosition: 'after'  },
  TRY: { code: 'TRY', name: 'Turkish Lira',          symbol: '₺',   decimals: 2, symbolPosition: 'before' },
  PLN: { code: 'PLN', name: 'Polish Zloty',          symbol: 'zł',  decimals: 2, symbolPosition: 'after'  },
  CZK: { code: 'CZK', name: 'Czech Koruna',          symbol: 'Kč',  decimals: 2, symbolPosition: 'after'  },
  HUF: { code: 'HUF', name: 'Hungarian Forint',      symbol: 'Ft',  decimals: 0, symbolPosition: 'after'  },
  RUB: { code: 'RUB', name: 'Russian Ruble',         symbol: '₽',   decimals: 2, symbolPosition: 'after'  },
  KRW: { code: 'KRW', name: 'South Korean Won',      symbol: '₩',   decimals: 0, symbolPosition: 'before' },
  THB: { code: 'THB', name: 'Thai Baht',             symbol: '฿',   decimals: 2, symbolPosition: 'before' },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit',     symbol: 'RM',  decimals: 2, symbolPosition: 'before' },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah',     symbol: 'Rp',  decimals: 0, symbolPosition: 'before' },
  PHP: { code: 'PHP', name: 'Philippine Peso',       symbol: '₱',   decimals: 2, symbolPosition: 'before' },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getDecimals(currency: CurrencyCode): number {
  return CURRENCIES[currency]?.decimals ?? 2;
}

function scaleFor(currency: CurrencyCode): number {
  return getDecimals(currency);
}

function pow10(n: number): bigint {
  let result = 1n;
  for (let i = 0; i < n; i++) result *= 10n;
  return result;
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

/**
 * Round a bigint value (already scaled) using the given mode.
 * `remainder` is the fractional part (0 <= |remainder| < divisor).
 * `divisor` is what we divided by to get the integer part.
 * `negative` indicates the original value was negative.
 */
function applyRoundingMode(
  intPart: bigint,
  remainder: bigint,
  divisor: bigint,
  negative: boolean,
  mode: RoundingMode,
): bigint {
  if (remainder === 0n) return intPart;

  const absRemainder = remainder < 0n ? -remainder : remainder;
  const half = divisor / 2n;
  const halfway = absRemainder * 2n === divisor;
  const moreThanHalf = absRemainder * 2n > divisor;

  switch (mode) {
    case 'UP':
      // Away from zero
      return negative ? intPart - 1n : intPart + 1n;
    case 'DOWN':
      // Towards zero
      return intPart;
    case 'CEILING':
      // Towards positive infinity
      return negative ? intPart : intPart + 1n;
    case 'FLOOR':
      // Towards negative infinity
      return negative ? intPart - 1n : intPart;
    case 'HALF_UP':
      return absRemainder * 2n >= divisor
        ? negative ? intPart - 1n : intPart + 1n
        : intPart;
    case 'HALF_DOWN':
      return moreThanHalf
        ? negative ? intPart - 1n : intPart + 1n
        : intPart;
    case 'HALF_EVEN': {
      if (!halfway) {
        return moreThanHalf
          ? negative ? intPart - 1n : intPart + 1n
          : intPart;
      }
      // Banker's rounding: round to nearest even
      const isEven = intPart % 2n === 0n;
      return isEven ? intPart : negative ? intPart - 1n : intPart + 1n;
    }
    default:
      // HALF_UP fallback
      return absRemainder >= half
        ? negative ? intPart - 1n : intPart + 1n
        : intPart;
  }
}

/**
 * Multiply a bigint amount by a number factor, rounding to same scale.
 */
function multiplyBigIntByFloat(
  amount: bigint,
  factor: number,
  mode: RoundingMode = 'HALF_UP',
): bigint {
  if (factor === 0) return 0n;
  const negative = (amount < 0n) !== (factor < 0);
  const absAmount = amount < 0n ? -amount : amount;
  const absFactor = Math.abs(factor);

  // Use 10-decimal precision for intermediate
  const precision = 1_000_000_000_000n; // 1e12
  const factorScaled = BigInt(Math.round(absFactor * 1e12));
  const product = absAmount * factorScaled;
  const intPart = product / precision;
  const remainder = product % precision;

  const rounded = applyRoundingMode(intPart, remainder, precision, negative, mode);
  return negative ? -rounded : rounded;
}

// ---------------------------------------------------------------------------
// Money factory & conversion
// ---------------------------------------------------------------------------

export function money(amount: number | string, currency: CurrencyCode): Money {
  const scale = scaleFor(currency);
  const multiplier = Math.pow(10, scale);
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  // Round to avoid floating point drift
  const minorUnits = BigInt(Math.round(numAmount * multiplier));
  return { amount: minorUnits, currency, scale };
}

export function moneyFromMinorUnits(minorUnits: bigint, currency: CurrencyCode): Money {
  return { amount: minorUnits, currency, scale: scaleFor(currency) };
}

export function toDecimal(m: Money): number {
  return Number(m.amount) / Math.pow(10, m.scale);
}

export function toDecimalString(m: Money): string {
  const scale = m.scale;
  if (scale === 0) return m.amount.toString();
  const divisor = pow10(scale);
  const negative = m.amount < 0n;
  const abs = negative ? -m.amount : m.amount;
  const intPart = abs / divisor;
  const fracPart = abs % divisor;
  const fracStr = fracPart.toString().padStart(scale, '0');
  return `${negative ? '-' : ''}${intPart}.${fracStr}`;
}

export function toPrecisionString(m: Money, extraDecimals = 0): string {
  const targetScale = m.scale + extraDecimals;
  if (targetScale === 0) return m.amount.toString();
  const divisor = pow10(targetScale);
  const negative = m.amount < 0n;
  const abs = negative ? -m.amount : m.amount;
  // scale up to targetScale
  const scaled = extraDecimals > 0 ? abs * pow10(extraDecimals) : abs;
  const intPart = scaled / divisor;
  const fracPart = scaled % divisor;
  const fracStr = fracPart.toString().padStart(targetScale, '0');
  return `${negative ? '-' : ''}${intPart}.${fracStr}`;
}

// ---------------------------------------------------------------------------
// Arithmetic
// ---------------------------------------------------------------------------

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency, scale: a.scale };
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount - b.amount, currency: a.currency, scale: a.scale };
}

export function multiply(m: Money, factor: number, mode: RoundingMode = 'HALF_UP'): Money {
  return { amount: multiplyBigIntByFloat(m.amount, factor, mode), currency: m.currency, scale: m.scale };
}

export function divide(m: Money, divisor: number, mode: RoundingMode = 'HALF_UP'): Money {
  if (divisor === 0) throw new Error('Division by zero');
  return multiply(m, 1 / divisor, mode);
}

export function percentage(m: Money, pct: number): Money {
  return multiply(m, pct / 100);
}

export function addPercentage(m: Money, pct: number): Money {
  return multiply(m, 1 + pct / 100);
}

export function subtractPercentage(m: Money, pct: number): Money {
  // Extract tax from gross: net = gross / (1 + pct/100)
  return divide(m, 1 + pct / 100);
}

export function negate(m: Money): Money {
  return { amount: -m.amount, currency: m.currency, scale: m.scale };
}

export function abs(m: Money): Money {
  return { amount: m.amount < 0n ? -m.amount : m.amount, currency: m.currency, scale: m.scale };
}

// ---------------------------------------------------------------------------
// Rounding
// ---------------------------------------------------------------------------

export function roundNumber(value: number, decimals: number, mode: RoundingMode = 'HALF_UP'): number {
  const factor = Math.pow(10, decimals);
  const scaled = value * factor;
  const intPart = Math.trunc(scaled);
  const remainder = scaled - intPart;
  const negative = value < 0;
  const absRemainder = Math.abs(remainder);

  let rounded: number;
  switch (mode) {
    case 'UP':
      rounded = remainder !== 0 ? (negative ? intPart - 1 : intPart + 1) : intPart;
      break;
    case 'DOWN':
      rounded = intPart;
      break;
    case 'CEILING':
      rounded = remainder > 0 ? intPart + 1 : intPart;
      break;
    case 'FLOOR':
      rounded = remainder < 0 ? intPart - 1 : intPart;
      break;
    case 'HALF_DOWN':
      rounded = absRemainder > 0.5 ? (negative ? intPart - 1 : intPart + 1) : intPart;
      break;
    case 'HALF_EVEN': {
      if (absRemainder === 0.5) {
        rounded = intPart % 2 === 0 ? intPart : (negative ? intPart - 1 : intPart + 1);
      } else {
        rounded = absRemainder > 0.5 ? (negative ? intPart - 1 : intPart + 1) : intPart;
      }
      break;
    }
    case 'HALF_UP':
    default:
      rounded = absRemainder >= 0.5 ? (negative ? intPart - 1 : intPart + 1) : intPart;
      break;
  }
  return rounded / factor;
}

export function round(m: Money, mode: RoundingMode = 'HALF_UP'): Money {
  return m; // already stored in minor units at currency's scale
}

export function roundTo(m: Money, decimals: number, mode: RoundingMode = 'HALF_UP'): Money {
  if (decimals >= m.scale) return m;
  const diff = m.scale - decimals;
  const divisor = pow10(diff);
  const negative = m.amount < 0n;
  const abs = negative ? -m.amount : m.amount;
  const intPart = abs / divisor;
  const remainder = abs % divisor;
  const rounded = applyRoundingMode(intPart, remainder, divisor, negative, mode);
  const finalAmount = negative ? -rounded : rounded;
  // Scale back up
  return { amount: finalAmount * pow10(diff), currency: m.currency, scale: m.scale };
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export function equal(a: Money, b: Money): boolean {
  assertSameCurrency(a, b);
  return a.amount === b.amount;
}

export function greaterThan(a: Money, b: Money): boolean {
  assertSameCurrency(a, b);
  return a.amount > b.amount;
}

export function lessThan(a: Money, b: Money): boolean {
  assertSameCurrency(a, b);
  return a.amount < b.amount;
}

export function greaterThanOrEqual(a: Money, b: Money): boolean {
  assertSameCurrency(a, b);
  return a.amount >= b.amount;
}

export function lessThanOrEqual(a: Money, b: Money): boolean {
  assertSameCurrency(a, b);
  return a.amount <= b.amount;
}

export function isZero(m: Money): boolean {
  return m.amount === 0n;
}

export function isPositive(m: Money): boolean {
  return m.amount > 0n;
}

export function isNegative(m: Money): boolean {
  return m.amount < 0n;
}

export function compare(a: Money, b: Money): -1 | 0 | 1 {
  assertSameCurrency(a, b);
  if (a.amount < b.amount) return -1;
  if (a.amount > b.amount) return 1;
  return 0;
}

export function min(...amounts: Money[]): Money {
  if (amounts.length === 0) throw new Error('min requires at least one argument');
  return amounts.reduce((acc, cur) => lessThan(cur, acc) ? cur : acc);
}

export function max(...amounts: Money[]): Money {
  if (amounts.length === 0) throw new Error('max requires at least one argument');
  return amounts.reduce((acc, cur) => greaterThan(cur, acc) ? cur : acc);
}

// ---------------------------------------------------------------------------
// Allocation
// ---------------------------------------------------------------------------

export function allocate(m: Money, ratios: number[]): Money[] {
  if (ratios.length === 0) throw new Error('allocate requires at least one ratio');
  const total = ratios.reduce((s, r) => s + r, 0);
  if (total === 0) throw new Error('Sum of ratios must be non-zero');

  const results: bigint[] = [];
  let allocated = 0n;

  for (const ratio of ratios) {
    const share = multiplyBigIntByFloat(m.amount, ratio / total, 'DOWN');
    results.push(share);
    allocated += share;
  }

  let remainder = m.amount - allocated;
  const unit = remainder >= 0n ? 1n : -1n;
  let i = 0;
  while (remainder !== 0n) {
    results[i % results.length] += unit;
    remainder -= unit;
    i++;
  }

  return results.map((a) => ({ amount: a, currency: m.currency, scale: m.scale }));
}

export function split(m: Money, n: number): Money[] {
  if (n <= 0) throw new Error('split requires n > 0');
  return allocate(m, Array(n).fill(1));
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function addThousandsSeparator(intStr: string): string {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function format(m: Money, options: FormatOptions = {}): string {
  const showSymbol = options.symbol !== false;
  const showThousands = options.thousands !== false;
  const info = CURRENCIES[m.currency];
  const decimals = options.decimals ?? (info?.decimals ?? m.scale);

  const negative = m.amount < 0n;
  const abs = negative ? -m.amount : m.amount;
  const divisor = pow10(m.scale);
  const intPart = abs / divisor;
  const fracPart = abs % divisor;

  let fracStr = '';
  if (decimals > 0) {
    // Scale fracPart to requested decimals
    if (decimals <= m.scale) {
      const diff = m.scale - decimals;
      const scaledFrac = fracPart / pow10(diff);
      fracStr = '.' + scaledFrac.toString().padStart(decimals, '0');
    } else {
      const extra = decimals - m.scale;
      fracStr = '.' + fracPart.toString().padStart(m.scale, '0') + '0'.repeat(extra);
    }
  }

  let intStr = intPart.toString();
  if (showThousands) intStr = addThousandsSeparator(intStr);

  const valueStr = `${negative ? '-' : ''}${intStr}${fracStr}`;

  if (!showSymbol || !info) return valueStr;

  const symbol = info.symbol;
  if (info.symbolPosition === 'before') return `${symbol}${valueStr}`;
  return `${valueStr} ${symbol}`;
}

export function formatCompact(m: Money): string {
  const info = CURRENCIES[m.currency];
  const symbol = info?.symbol ?? m.currency;
  const before = info?.symbolPosition !== 'after';
  const val = toDecimal(m);
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  let compactVal: string;
  if (absVal >= 1_000_000_000) {
    compactVal = (absVal / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (absVal >= 1_000_000) {
    compactVal = (absVal / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (absVal >= 1_000) {
    compactVal = (absVal / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    compactVal = absVal.toFixed(info?.decimals ?? 2);
  }

  if (before) return `${sign}${symbol}${compactVal}`;
  return `${sign}${compactVal} ${symbol}`;
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCIES[currency]?.symbol ?? currency;
}

export function getCurrencyDecimals(currency: CurrencyCode): number {
  return CURRENCIES[currency]?.decimals ?? 2;
}

export function getCurrencyInfo(currency: CurrencyCode): CurrencyInfo | undefined {
  return CURRENCIES[currency];
}

// ---------------------------------------------------------------------------
// Exchange rates (stub)
// ---------------------------------------------------------------------------

export function applyRate(m: Money, rate: ExchangeRate): Money {
  if (m.currency !== rate.from) {
    throw new Error(`Currency mismatch: money is ${m.currency}, rate is from ${rate.from}`);
  }
  const targetScale = scaleFor(rate.to);
  const targetDivisor = pow10(targetScale);
  const sourceDivisor = pow10(m.scale);

  // Convert: (amount / sourceDivisor) * rate * targetDivisor
  // Use bigint arithmetic with precision
  const precision = 1_000_000_000_000n;
  const rateScaled = BigInt(Math.round(rate.rate * 1e12));
  const rawAmount = m.amount * rateScaled * targetDivisor;
  const result = rawAmount / (sourceDivisor * precision);

  return { amount: result, currency: rate.to, scale: targetScale };
}

export function invertRate(rate: ExchangeRate): ExchangeRate {
  return {
    from: rate.to,
    to: rate.from,
    rate: 1 / rate.rate,
    date: rate.date,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function isValidCurrency(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(CURRENCIES, code);
}

export function parseMoney(s: string, currency: CurrencyCode): Money | null {
  if (!s || typeof s !== 'string') return null;
  // Strip currency symbols, spaces, and thousands separators
  const cleaned = s
    .replace(/[£$€¥₹₺₽₩฿₱﷼]/g, '')
    .replace(/[A-Z]{2,3}\$?/g, '')    // strip currency codes like CA$, A$, etc
    .replace(/\s+/g, '')
    .replace(/,/g, '')                 // remove thousands separators
    .trim();

  const num = parseFloat(cleaned);
  if (isNaN(num) || !isFinite(num)) return null;
  return money(num, currency);
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export function sum(amounts: Money[]): Money {
  if (amounts.length === 0) throw new Error('sum requires at least one element');
  const currency = amounts[0].currency;
  const scale = amounts[0].scale;
  for (const m of amounts) {
    if (m.currency !== currency) throw new Error(`Currency mismatch in sum: ${currency} vs ${m.currency}`);
  }
  const total = amounts.reduce((acc, m) => acc + m.amount, 0n);
  return { amount: total, currency, scale };
}

export function average(amounts: Money[]): Money {
  if (amounts.length === 0) throw new Error('average requires at least one element');
  const total = sum(amounts);
  return divide(total, amounts.length);
}
