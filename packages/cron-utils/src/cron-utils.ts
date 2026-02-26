// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { CronExpression, CronField, CronSchedule, CronValidationResult } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_NAMES: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const DOW_NAMES: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

export const NAMED_SCHEDULES: Record<string, string> = {
  '@yearly':    '0 0 1 1 *',
  '@annually':  '0 0 1 1 *',
  '@monthly':   '0 0 1 * *',
  '@weekly':    '0 0 * * 0',
  '@daily':     '0 0 * * *',
  '@midnight':  '0 0 * * *',
  '@hourly':    '0 * * * *',
  '@minutely':  '* * * * *',
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Replace month/day-of-week names with their numeric equivalents */
function substituteNames(raw: string, isMonth: boolean, isDow: boolean): string {
  let s = raw.toUpperCase();
  if (isMonth) {
    for (const [name, num] of Object.entries(MONTH_NAMES)) {
      s = s.replace(new RegExp(name, 'g'), String(num));
    }
  }
  if (isDow) {
    for (const [name, num] of Object.entries(DOW_NAMES)) {
      s = s.replace(new RegExp(name, 'g'), String(num));
    }
  }
  return s;
}

/** Expand a single cron field token into an array of numbers */
function expandToken(token: string, min: number, max: number): number[] {
  // */step
  if (token.startsWith('*/')) {
    const step = parseInt(token.slice(2), 10);
    if (isNaN(step) || step < 1) throw new Error(`Invalid step: ${token}`);
    const vals: number[] = [];
    for (let i = min; i <= max; i += step) vals.push(i);
    return vals;
  }
  // *
  if (token === '*') {
    const vals: number[] = [];
    for (let i = min; i <= max; i++) vals.push(i);
    return vals;
  }
  // range with optional step: a-b or a-b/n
  if (token.includes('-')) {
    const slashIdx = token.indexOf('/');
    const step = slashIdx !== -1 ? parseInt(token.slice(slashIdx + 1), 10) : 1;
    const rangePart = slashIdx !== -1 ? token.slice(0, slashIdx) : token;
    const [startStr, endStr] = rangePart.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (isNaN(start) || isNaN(end) || isNaN(step) || step < 1) {
      throw new Error(`Invalid range: ${token}`);
    }
    if (start < min || end > max || start > end) {
      throw new Error(`Range out of bounds: ${token} (allowed ${min}-${max})`);
    }
    const vals: number[] = [];
    for (let i = start; i <= end; i += step) vals.push(i);
    return vals;
  }
  // specific value
  const val = parseInt(token, 10);
  if (isNaN(val)) throw new Error(`Invalid value: ${token}`);
  if (val < min || val > max) throw new Error(`Value ${val} out of range ${min}-${max}`);
  return [val];
}

/** Parse a full cron field string (may contain commas) */
function parseField(
  raw: string,
  min: number,
  max: number,
  isMonth = false,
  isDow = false,
): CronField {
  const substituted = substituteNames(raw, isMonth, isDow);
  const tokens = substituted.split(',');
  const valueSet = new Set<number>();
  for (const token of tokens) {
    for (const v of expandToken(token.trim(), min, isDow ? 7 : max)) {
      // Normalise DOW: 7 → 0 (both = Sunday)
      valueSet.add(isDow && v === 7 ? 0 : v);
    }
  }
  return { raw, values: Array.from(valueSet).sort((a, b) => a - b) };
}

// ---------------------------------------------------------------------------
// Public parsing API
// ---------------------------------------------------------------------------

export function resolveNamed(expression: string): string {
  const trimmed = expression.trim().toLowerCase();
  if (trimmed in NAMED_SCHEDULES) return NAMED_SCHEDULES[trimmed];
  return expression;
}

export function parse(expression: string): CronExpression {
  const resolved = resolveNamed(expression.trim());
  const parts = resolved.trim().split(/\s+/);

  if (parts.length === 5) {
    const [minute, hour, dom, month, dow] = parts;
    return {
      minute:     parseField(minute, 0, 59),
      hour:       parseField(hour,   0, 23),
      dayOfMonth: parseField(dom,    1, 31),
      month:      parseField(month,  1, 12, true),
      dayOfWeek:  parseField(dow,    0, 7,  false, true),
      raw: expression,
    };
  } else if (parts.length === 6) {
    const [second, minute, hour, dom, month, dow] = parts;
    return {
      second:     parseField(second, 0, 59),
      minute:     parseField(minute, 0, 59),
      hour:       parseField(hour,   0, 23),
      dayOfMonth: parseField(dom,    1, 31),
      month:      parseField(month,  1, 12, true),
      dayOfWeek:  parseField(dow,    0, 7,  false, true),
      raw: expression,
    };
  } else {
    throw new Error(
      `Invalid cron expression "${expression}": expected 5 or 6 fields, got ${parts.length}`,
    );
  }
}

export function tryParse(expression: string): CronExpression | null {
  try {
    return parse(expression);
  } catch {
    return null;
  }
}

export function validate(expression: string): CronValidationResult {
  try {
    parse(expression);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}

export function isCron(expression: string): boolean {
  return validate(expression).valid;
}

// ---------------------------------------------------------------------------
// Date matching
// ---------------------------------------------------------------------------

export function isMatch(expression: string, date: Date): boolean {
  const expr = parse(expression);
  const second = date.getSeconds();
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dom = date.getDate();
  const month = date.getMonth() + 1; // 1-12
  const dow = date.getDay();         // 0=Sunday

  if (expr.second && !expr.second.values.includes(second)) return false;
  if (!expr.minute.values.includes(minute)) return false;
  if (!expr.hour.values.includes(hour)) return false;
  if (!expr.month.values.includes(month)) return false;

  // cron standard: if both dom and dow are restricted, either can match
  const domIsRestricted = expr.dayOfMonth.raw !== '*';
  const dowIsRestricted = expr.dayOfWeek.raw !== '*';

  if (domIsRestricted && dowIsRestricted) {
    if (!expr.dayOfMonth.values.includes(dom) && !expr.dayOfWeek.values.includes(dow)) return false;
  } else {
    if (!expr.dayOfMonth.values.includes(dom)) return false;
    if (!expr.dayOfWeek.values.includes(dow)) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Smart next/prev occurrence (field-based jump algorithm)
// ---------------------------------------------------------------------------

const MAX_YEARS = 4;

/**
 * Find the next value >= current in a sorted array.
 * Returns { value, carry: false } if found in same cycle,
 * Returns { value: min, carry: true } if we wrapped around.
 */
function nextVal(values: number[], current: number): { value: number; carry: boolean } {
  for (const v of values) {
    if (v >= current) return { value: v, carry: false };
  }
  return { value: values[0], carry: true };
}

/**
 * Fast smart iterator for 5-field cron (minute granularity).
 * Uses field-carry logic to jump over non-matching ranges quickly.
 */
function findNext5(expr: CronExpression, from: Date, direction: 1 | -1): Date | null {
  // We work in local time. All fields in arrays (sorted ascending).
  const domIsRestricted = expr.dayOfMonth.raw !== '*';
  const dowIsRestricted = expr.dayOfWeek.raw !== '*';

  // For prev direction, reverse the sorted value arrays
  const months  = direction === 1 ? [...expr.month.values]      : [...expr.month.values].reverse();
  const hours   = direction === 1 ? [...expr.hour.values]        : [...expr.hour.values].reverse();
  const minutes = direction === 1 ? [...expr.minute.values]      : [...expr.minute.values].reverse();
  const doms    = direction === 1 ? [...expr.dayOfMonth.values]  : [...expr.dayOfMonth.values].reverse();
  const dows    = direction === 1 ? [...expr.dayOfWeek.values]   : [...expr.dayOfWeek.values].reverse();

  // Start 1 minute past `from`
  const stepMs = 60_000;
  let cursor: Date;
  if (direction === 1) {
    cursor = new Date(from.getTime() + stepMs);
    cursor.setSeconds(0, 0);
  } else {
    cursor = new Date(from.getTime() - stepMs);
    cursor.setSeconds(0, 0);
  }

  const limitYear = direction === 1
    ? from.getFullYear() + MAX_YEARS
    : from.getFullYear() - MAX_YEARS;

  // Safety: iterate up to 2.5 million times (roughly 4+ years of minutes)
  const MAX_ITER = 2_200_000;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    const yr  = cursor.getFullYear();
    if (direction === 1 && yr > limitYear) return null;
    if (direction === -1 && yr < limitYear) return null;

    const mo  = cursor.getMonth() + 1; // 1-12
    const dom = cursor.getDate();
    const dow = cursor.getDay();
    const hr  = cursor.getHours();
    const mn  = cursor.getMinutes();

    // Check month
    if (!expr.month.values.includes(mo)) {
      // Jump to next valid month
      if (direction === 1) {
        const nm = months.find(m => m > mo);
        if (nm !== undefined) {
          cursor = new Date(yr, nm - 1, 1, 0, 0, 0, 0);
        } else {
          // Next year, first valid month
          cursor = new Date(yr + 1, months[0] - 1, 1, 0, 0, 0, 0);
        }
      } else {
        const nm = [...months].find(m => m < mo);
        if (nm !== undefined) {
          // Last day of that month
          const lastDay = new Date(yr, nm, 0).getDate();
          cursor = new Date(yr, nm - 1, lastDay, 23, 59, 0, 0);
        } else {
          const lastMonth = dows.length > 0 ? months[months.length - 1] : months[0];
          const lastDay = new Date(yr - 1, lastMonth, 0).getDate();
          cursor = new Date(yr - 1, lastMonth - 1, lastDay, 23, 59, 0, 0);
        }
      }
      continue;
    }

    // Check day
    const domOk = !domIsRestricted || expr.dayOfMonth.values.includes(dom);
    const dowOk = !dowIsRestricted || expr.dayOfWeek.values.includes(dow);
    const dayOk = domIsRestricted && dowIsRestricted ? (domOk || dowOk) : (domOk && dowOk);

    if (!dayOk) {
      if (direction === 1) {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1, 0, 0, 0, 0);
      } else {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1, 23, 59, 0, 0);
      }
      continue;
    }

    // Check hour
    if (!expr.hour.values.includes(hr)) {
      if (direction === 1) {
        const nh = hours.find(h => h > hr);
        if (nh !== undefined) {
          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), nh, 0, 0, 0);
        } else {
          // Next day
          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1, 0, 0, 0, 0);
        }
      } else {
        const ph = [...hours].find(h => h < hr);
        if (ph !== undefined) {
          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), ph, 59, 0, 0);
        } else {
          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1, 23, 59, 0, 0);
        }
      }
      continue;
    }

    // Check minute
    if (!expr.minute.values.includes(mn)) {
      if (direction === 1) {
        const nm2 = minutes.find(m => m > mn);
        if (nm2 !== undefined) {
          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), cursor.getHours(), nm2, 0, 0);
        } else {
          // Next hour
          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), cursor.getHours() + 1, 0, 0, 0);
        }
      } else {
        const pm = [...minutes].find(m => m < mn);
        if (pm !== undefined) {
          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), cursor.getHours(), pm, 0, 0);
        } else {
          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), cursor.getHours() - 1, 59, 0, 0);
        }
      }
      continue;
    }

    // All fields match!
    cursor.setSeconds(0, 0);
    return cursor;
  }
  return null;
}

export function nextOccurrence(expression: string, from?: Date): Date {
  const base = from ? new Date(from.getTime()) : new Date();
  const expr = parse(expression);

  if (expr.second !== undefined) {
    // 6-field: fall back to second-by-second for simplicity
    const stepMs = 1000;
    let cursor = new Date(Math.floor(base.getTime() / stepMs) * stepMs + stepMs);
    cursor.setMilliseconds(0);
    const limit = new Date(base.getTime() + MAX_YEARS * 365 * 24 * 60 * 60 * 1000);
    while (cursor <= limit) {
      if (isMatch(expression, cursor)) return new Date(cursor);
      cursor = new Date(cursor.getTime() + 1000);
    }
    throw new Error(`No match found within ${MAX_YEARS} years for "${expression}"`);
  }

  const result = findNext5(expr, base, 1);
  if (!result) throw new Error(`No match found within ${MAX_YEARS} years for "${expression}"`);
  return result;
}

export function prevOccurrence(expression: string, from?: Date): Date {
  const base = from ? new Date(from.getTime()) : new Date();
  const expr = parse(expression);

  if (expr.second !== undefined) {
    const stepMs = 1000;
    let cursor = new Date(Math.floor(base.getTime() / stepMs) * stepMs - stepMs);
    cursor.setMilliseconds(0);
    const limit = new Date(base.getTime() - MAX_YEARS * 365 * 24 * 60 * 60 * 1000);
    while (cursor >= limit) {
      if (isMatch(expression, cursor)) return new Date(cursor);
      cursor = new Date(cursor.getTime() - 1000);
    }
    throw new Error(`No previous match within ${MAX_YEARS} years for "${expression}"`);
  }

  const result = findNext5(expr, base, -1);
  if (!result) throw new Error(`No previous match within ${MAX_YEARS} years for "${expression}"`);
  return result;
}

export function nextN(expression: string, n: number, from?: Date): Date[] {
  const results: Date[] = [];
  let cursor = from ? new Date(from) : new Date();
  for (let i = 0; i < n; i++) {
    const next = nextOccurrence(expression, cursor);
    results.push(next);
    cursor = next;
  }
  return results;
}

// ---------------------------------------------------------------------------
// Schedule object
// ---------------------------------------------------------------------------

export function schedule(expression: string): CronSchedule {
  const expr = parse(expression);
  return {
    expression: expr,
    next(from?: Date): Date { return nextOccurrence(expression, from); },
    prev(from?: Date): Date { return prevOccurrence(expression, from); },
    nextN(n: number, from?: Date): Date[] { return nextN(expression, n, from); },
    isMatch(date: Date): boolean { return isMatch(expression, date); },
  };
}

// ---------------------------------------------------------------------------
// Human-readable descriptions
// ---------------------------------------------------------------------------

function pad(n: number): string { return String(n).padStart(2, '0'); }

const DOW_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_LABELS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isWildcard(field: CronField, min: number, max: number): boolean {
  return field.raw === '*' || field.values.length === max - min + 1;
}

function isStep(raw: string): number | null {
  if (raw.startsWith('*/')) {
    const n = parseInt(raw.slice(2), 10);
    return isNaN(n) ? null : n;
  }
  return null;
}

export function describe(expression: string, _locale: 'en' = 'en'): string {
  const resolved = resolveNamed(expression.trim());
  const expr = parse(resolved);

  const allMinutes = isWildcard(expr.minute, 0, 59);
  const allHours   = isWildcard(expr.hour,   0, 23);
  const allDom     = isWildcard(expr.dayOfMonth, 1, 31);
  const allMonth   = isWildcard(expr.month,  1, 12);
  const allDow     = isWildcard(expr.dayOfWeek, 0, 6);

  const minuteStep = isStep(expr.minute.raw);
  const hourStep   = isStep(expr.hour.raw);

  // @minutely / * * * * *
  if (allMinutes && allHours && allDom && allMonth && allDow) return 'Every minute';

  // Every N minutes
  if (minuteStep !== null && allHours && allDom && allMonth && allDow) {
    if (minuteStep === 1) return 'Every minute';
    return `Every ${minuteStep} minutes`;
  }

  // Every N hours
  if (expr.minute.values.length === 1 && expr.minute.values[0] === 0 &&
      hourStep !== null && allDom && allMonth && allDow) {
    return `Every ${hourStep} hours`;
  }

  // Every hour (0 * * * *)
  if (expr.minute.values.length === 1 && expr.minute.values[0] === 0 &&
      allHours && allDom && allMonth && allDow) return 'Every hour';

  // Every day at specific time
  if (!allMinutes || !allHours) {
    const min = expr.minute.values;
    const hr  = expr.hour.values;

    // Single specific time each day
    if (hr.length === 1 && min.length === 1 && allDom && allMonth && allDow) {
      const timeStr = `${pad(hr[0])}:${pad(min[0])}`;
      if (hr[0] === 0 && min[0] === 0) return 'Every day at midnight';
      return `Every day at ${timeStr}`;
    }

    // Multiple specific hours same minute
    if (min.length === 1 && allDom && allMonth && allDow) {
      const timeStrs = hr.map(h => `${pad(h)}:${pad(min[0])}`).join(' and ');
      return `At ${timeStrs}`;
    }

    // Specific time on specific DOW range
    if (hr.length === 1 && min.length === 1 && !allDow && allDom && allMonth) {
      const timeStr = `${pad(hr[0])}:${pad(min[0])}`;
      const dowRaw = expr.dayOfWeek.raw;
      // Range like 1-5
      if (/^\d-\d$/.test(dowRaw)) {
        const [s, e] = dowRaw.split('-').map(Number);
        return `At ${timeStr}, ${DOW_LABELS[s]} through ${DOW_LABELS[e]}`;
      }
      const dowNames = expr.dayOfWeek.values.map(v => DOW_LABELS[v]);
      return `At ${timeStr}, ${dowNames.join(' and ')}`;
    }

    // Specific time on specific DOM
    if (hr.length === 1 && min.length === 1 && !allDom && allMonth && allDow) {
      const timeStr = hr[0] === 0 && min[0] === 0 ? 'midnight' : `${pad(hr[0])}:${pad(min[0])}`;
      const domVals = expr.dayOfMonth.values;
      const domStr = domVals.length === 1 ? `day ${domVals[0]}` : `days ${domVals.join(', ')}`;
      return `At ${timeStr}, on ${domStr} of the month`;
    }
  }

  // Fallback structured description
  const parts: string[] = [];

  if (minuteStep !== null) {
    parts.push(`every ${minuteStep} minutes`);
  } else if (!allMinutes) {
    parts.push(`at minute ${expr.minute.values.join(', ')}`);
  }
  if (hourStep !== null) {
    parts.push(`every ${hourStep} hours`);
  } else if (!allHours) {
    parts.push(`past hour ${expr.hour.values.join(', ')}`);
  }
  if (!allDow) {
    const names = expr.dayOfWeek.values.map(v => DOW_LABELS[v]);
    parts.push(`on ${names.join(', ')}`);
  } else if (!allDom) {
    parts.push(`on day ${expr.dayOfMonth.values.join(', ')}`);
  }
  if (!allMonth) {
    const names = expr.month.values.map(v => MONTH_LABELS[v]);
    parts.push(`in ${names.join(', ')}`);
  }

  if (parts.length === 0) return 'Every minute';
  return parts.join(', ').replace(/^(.)/, c => c.toUpperCase());
}

export function toEnglish(expression: string): string {
  return describe(expression);
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export function getInterval(expression: string): number | null {
  try {
    const expr = parse(expression);
    // "*/N * * * *" → N minutes in ms
    const minuteStep = isStep(expr.minute.raw);
    if (
      minuteStep !== null &&
      isWildcard(expr.hour, 0, 23) &&
      isWildcard(expr.dayOfMonth, 1, 31) &&
      isWildcard(expr.month, 1, 12) &&
      isWildcard(expr.dayOfWeek, 0, 6)
    ) {
      return minuteStep * 60_000;
    }

    // "0 */N * * *" → N hours in ms
    if (
      expr.minute.values.length === 1 && expr.minute.values[0] === 0 &&
      isStep(expr.hour.raw) !== null &&
      isWildcard(expr.dayOfMonth, 1, 31) &&
      isWildcard(expr.month, 1, 12) &&
      isWildcard(expr.dayOfWeek, 0, 6)
    ) {
      const h = isStep(expr.hour.raw)!;
      return h * 60 * 60_000;
    }

    return null;
  } catch {
    return null;
  }
}

export function isFixed(expression: string): boolean {
  try {
    const expr = parse(expression);
    return (
      !isWildcard(expr.minute, 0, 59) &&
      !isWildcard(expr.hour,   0, 23) &&
      isStep(expr.minute.raw) === null &&
      isStep(expr.hour.raw) === null
    );
  } catch {
    return false;
  }
}

export function overlaps(a: string, b: string, windowMs = 60_000): boolean {
  const from = new Date();
  try {
    // Use a smaller sample (20 instead of 100) to keep performance reasonable
    const aDates = nextN(a, 20, from);
    const bDates = nextN(b, 20, from);
    for (const ad of aDates) {
      for (const bd of bDates) {
        if (Math.abs(ad.getTime() - bd.getTime()) <= windowMs) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function getFieldValues(
  expression: string,
  field: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek',
): number[] {
  const expr = parse(expression);
  return expr[field].values;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function normalize(expression: string): string {
  const resolved = resolveNamed(expression.trim());
  const parts = resolved.trim().split(/\s+/);
  if (parts.length === 5) {
    const [m, h, dom, mo, dow] = parts;
    const normalizedMo = substituteNames(mo, true, false).toUpperCase().replace(
      /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/g,
      s => String(MONTH_NAMES[s]),
    );
    const normalizedDow = substituteNames(dow, false, true).toUpperCase().replace(
      /SUN|MON|TUE|WED|THU|FRI|SAT/g,
      s => String(DOW_NAMES[s]),
    );
    return [
      substituteNames(m,   false, false),
      substituteNames(h,   false, false),
      substituteNames(dom, false, false),
      normalizedMo,
      normalizedDow,
    ].join(' ');
  }
  if (parts.length === 6) {
    return parts.join(' ');
  }
  return expression;
}

export function toQuartzExpression(expression: string): string {
  const resolved = resolveNamed(expression.trim());
  const parts = resolved.trim().split(/\s+/);
  if (parts.length === 5) {
    return `0 ${parts.join(' ')}`;
  }
  if (parts.length === 6) return resolved.trim();
  throw new Error(`Cannot convert to Quartz: expected 5 fields, got ${parts.length}`);
}

export function fromQuartzExpression(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length === 6) {
    return parts.slice(1).join(' ');
  }
  if (parts.length === 5) return expression.trim();
  throw new Error(`Cannot convert from Quartz: expected 6 fields, got ${parts.length}`);
}
