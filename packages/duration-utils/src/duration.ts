// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Duration, FormattedDuration, TimeUnit } from './types';

// ─── Constants ───────────────────────────────────────────────────────────────

const MS_PER_SECOND      = 1_000;
const MS_PER_MINUTE      = 60_000;
const MS_PER_HOUR        = 3_600_000;
const MS_PER_DAY         = 86_400_000;
const MS_PER_WEEK        = 604_800_000;
const MS_PER_MONTH       = 2_592_000_000;   // 30 days
const MS_PER_YEAR        = 31_536_000_000;  // 365 days

// ─── Core conversion ─────────────────────────────────────────────────────────

/**
 * Convert a Duration object to total milliseconds.
 */
export function toMilliseconds(duration: Duration): number {
  const {
    years = 0,
    months = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
  } = duration;

  return (
    years   * MS_PER_YEAR   +
    months  * MS_PER_MONTH  +
    weeks   * MS_PER_WEEK   +
    days    * MS_PER_DAY    +
    hours   * MS_PER_HOUR   +
    minutes * MS_PER_MINUTE +
    seconds * MS_PER_SECOND +
    milliseconds
  );
}

/**
 * Break a millisecond value into a FormattedDuration.
 * Each field is the remainder after extracting larger units.
 */
export function fromMilliseconds(ms: number): FormattedDuration {
  let remaining = Math.abs(Math.floor(ms));

  const years = Math.floor(remaining / MS_PER_YEAR);
  remaining -= years * MS_PER_YEAR;

  const months = Math.floor(remaining / MS_PER_MONTH);
  remaining -= months * MS_PER_MONTH;

  const weeks = Math.floor(remaining / MS_PER_WEEK);
  remaining -= weeks * MS_PER_WEEK;

  const days = Math.floor(remaining / MS_PER_DAY);
  remaining -= days * MS_PER_DAY;

  const hours = Math.floor(remaining / MS_PER_HOUR);
  remaining -= hours * MS_PER_HOUR;

  const minutes = Math.floor(remaining / MS_PER_MINUTE);
  remaining -= minutes * MS_PER_MINUTE;

  const seconds = Math.floor(remaining / MS_PER_SECOND);
  remaining -= seconds * MS_PER_SECOND;

  const milliseconds = remaining;

  return { years, months, weeks, days, hours, minutes, seconds, milliseconds };
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/**
 * Format milliseconds as 'HH:MM:SS'.
 * Hours may exceed 23 (not capped at 24).
 */
export function formatHHMMSS(ms: number): string {
  const totalSeconds = Math.floor(Math.abs(ms) / MS_PER_SECOND);
  const secs  = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const mins  = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const hh = String(hours).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * Format milliseconds as 'HH:MM:SS.mmm'.
 */
export function formatHHMMSSms(ms: number): string {
  const absMs = Math.abs(ms);
  const millis = Math.floor(absMs) % 1000;
  const base = formatHHMMSS(absMs);
  const mmm = String(millis).padStart(3, '0');
  return `${base}.${mmm}`;
}

/**
 * Parse 'HH:MM:SS' or 'MM:SS' string into milliseconds.
 */
export function parseHHMMSS(str: string): number {
  const parts = str.split(':').map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return ((h * 3600) + (m * 60) + s) * MS_PER_SECOND;
  } else if (parts.length === 2) {
    const [m, s] = parts;
    return ((m * 60) + s) * MS_PER_SECOND;
  }
  return 0;
}

/**
 * Format a Duration as an ISO 8601 duration string, e.g. 'P1Y2M3DT4H5M6S'.
 */
export function formatISO8601(duration: Duration): string {
  const {
    years = 0,
    months = 0,
    weeks = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
  } = duration;

  // Combine weeks into days for ISO format (weeks not standard in all parsers)
  const totalDays = days + weeks * 7;
  // Combine milliseconds into fractional seconds
  const totalSeconds = seconds + milliseconds / 1000;

  let result = 'P';
  if (years)       result += `${years}Y`;
  if (months)      result += `${months}M`;
  if (totalDays)   result += `${totalDays}D`;

  const hasTime = hours || minutes || totalSeconds;
  if (hasTime) {
    result += 'T';
    if (hours)        result += `${hours}H`;
    if (minutes)      result += `${minutes}M`;
    if (totalSeconds) result += `${totalSeconds}S`;
  }

  if (result === 'P') result = 'P0D';
  return result;
}

/**
 * Parse an ISO 8601 duration string into a Duration object.
 */
export function parseISO8601(iso: string): Duration {
  const duration: Duration = {};
  const re = /P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?/;
  const match = re.exec(iso);
  if (!match) return duration;

  if (match[1]) duration.years        = parseFloat(match[1]);
  if (match[2]) duration.months       = parseFloat(match[2]);
  if (match[3]) duration.weeks        = parseFloat(match[3]);
  if (match[4]) duration.days         = parseFloat(match[4]);
  if (match[5]) duration.hours        = parseFloat(match[5]);
  if (match[6]) duration.minutes      = parseFloat(match[6]);
  if (match[7]) {
    const secs = parseFloat(match[7]);
    duration.seconds      = Math.floor(secs);
    const frac = secs - Math.floor(secs);
    if (frac > 0) duration.milliseconds = Math.round(frac * 1000);
  }

  return duration;
}

// ─── Arithmetic ──────────────────────────────────────────────────────────────

/**
 * Add two durations (via ms conversion). Result expressed as milliseconds in Duration.
 */
export function addDurations(a: Duration, b: Duration): Duration {
  const totalMs = toMilliseconds(a) + toMilliseconds(b);
  return { milliseconds: totalMs };
}

/**
 * Subtract b from a (floors at 0ms).
 */
export function subtractDurations(a: Duration, b: Duration): Duration {
  const diff = Math.max(0, toMilliseconds(a) - toMilliseconds(b));
  return { milliseconds: diff };
}

/**
 * Scale a duration by a numeric factor.
 */
export function scaleDuration(duration: Duration, factor: number): Duration {
  const scaled = toMilliseconds(duration) * factor;
  return { milliseconds: scaled };
}

/**
 * Compare two durations: returns -1 | 0 | 1.
 */
export function compareDurations(a: Duration, b: Duration): number {
  const msA = toMilliseconds(a);
  const msB = toMilliseconds(b);
  if (msA < msB) return -1;
  if (msA > msB) return 1;
  return 0;
}

// ─── Human-readable ──────────────────────────────────────────────────────────

/**
 * Return human-readable string for a millisecond value.
 * short=false (default): '2 hours 30 minutes'
 * short=true:            '2h 30m'
 */
export function humanize(ms: number, short = false): string {
  const absMs = Math.abs(ms);
  const parts: string[] = [];

  const units: Array<{ ms: number; long: string; abbr: string }> = [
    { ms: MS_PER_YEAR,   long: 'year',   abbr: 'y'  },
    { ms: MS_PER_MONTH,  long: 'month',  abbr: 'mo' },
    { ms: MS_PER_WEEK,   long: 'week',   abbr: 'w'  },
    { ms: MS_PER_DAY,    long: 'day',    abbr: 'd'  },
    { ms: MS_PER_HOUR,   long: 'hour',   abbr: 'h'  },
    { ms: MS_PER_MINUTE, long: 'minute', abbr: 'm'  },
    { ms: MS_PER_SECOND, long: 'second', abbr: 's'  },
  ];

  let remaining = absMs;
  for (const unit of units) {
    const count = Math.floor(remaining / unit.ms);
    if (count > 0) {
      remaining -= count * unit.ms;
      if (short) {
        parts.push(`${count}${unit.abbr}`);
      } else {
        parts.push(`${count} ${unit.long}${count !== 1 ? 's' : ''}`);
      }
    }
  }

  return parts.length > 0 ? parts.join(' ') : (short ? '0s' : '0 seconds');
}

/**
 * Always return a short-form humanized string (e.g. '2h 30m 15s').
 */
export function humanizeShort(ms: number): string {
  return humanize(ms, true);
}

// ─── Unit conversion ─────────────────────────────────────────────────────────

const UNIT_TO_MS: Record<TimeUnit, number> = {
  milliseconds: 1,
  seconds:      MS_PER_SECOND,
  minutes:      MS_PER_MINUTE,
  hours:        MS_PER_HOUR,
  days:         MS_PER_DAY,
  weeks:        MS_PER_WEEK,
  months:       MS_PER_MONTH,
  years:        MS_PER_YEAR,
};

/**
 * Convert a value from one TimeUnit to another.
 */
export function convert(value: number, from: TimeUnit, to: TimeUnit): number {
  const ms = value * UNIT_TO_MS[from];
  return ms / UNIT_TO_MS[to];
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Type guard: returns true if the value is a valid Duration object.
 */
export function isValidDuration(duration: unknown): duration is Duration {
  if (typeof duration !== 'object' || duration === null || Array.isArray(duration)) {
    return false;
  }
  const d = duration as Record<string, unknown>;
  const keys: Array<keyof Duration> = [
    'years', 'months', 'weeks', 'days',
    'hours', 'minutes', 'seconds', 'milliseconds',
  ];
  // Every present key must be a finite number
  for (const key of keys) {
    if (key in d && (typeof d[key] !== 'number' || !isFinite(d[key] as number))) {
      return false;
    }
  }
  return true;
}

// ─── Time helpers ────────────────────────────────────────────────────────────

/**
 * Return the FormattedDuration elapsed between two timestamps (in ms).
 */
export function elapsed(startMs: number, endMs: number): FormattedDuration {
  return fromMilliseconds(Math.abs(endMs - startMs));
}

/**
 * Estimate remaining milliseconds given a start time, total duration, and progress %.
 */
export function remaining(startMs: number, totalMs: number, progressPercent: number): number {
  if (progressPercent <= 0) return totalMs;
  if (progressPercent >= 100) return 0;
  const done = totalMs * (progressPercent / 100);
  return Math.max(0, totalMs - done);
}

/**
 * Approximate the number of business days in a given millisecond span.
 * 1 business day = 8 working hours.
 */
export function businessDays(ms: number): number {
  return Math.abs(ms) / (8 * MS_PER_HOUR);
}

// ─── Convenience totals ──────────────────────────────────────────────────────

/** Total seconds represented by a Duration. */
export function toSeconds(duration: Duration): number {
  return toMilliseconds(duration) / MS_PER_SECOND;
}

/** Total minutes represented by a Duration. */
export function toMinutes(duration: Duration): number {
  return toMilliseconds(duration) / MS_PER_MINUTE;
}

/** Total hours represented by a Duration. */
export function toHours(duration: Duration): number {
  return toMilliseconds(duration) / MS_PER_HOUR;
}

/** Total days represented by a Duration. */
export function toDays(duration: Duration): number {
  return toMilliseconds(duration) / MS_PER_DAY;
}
