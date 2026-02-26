// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { DayOfWeek, RecurrenceRule, WorkingHours } from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Clone a Date so we never mutate the caller's value. */
function cloneDate(d: Date): Date {
  return new Date(d.getTime());
}

/** Parse "HH:MM" → { h, m } */
function parseHHMM(s: string): { h: number; m: number } {
  const [hStr, mStr] = s.split(':');
  return { h: parseInt(hStr, 10), m: parseInt(mStr, 10) };
}

/** Total minutes since midnight for a Date (local time). */
function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

// ---------------------------------------------------------------------------
// Business day calculations
// ---------------------------------------------------------------------------

/** Returns true if the date falls on Monday–Friday (local time). */
export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

/** Returns true if the date falls on Saturday or Sunday (local time). */
export function isWeekend(date: Date): boolean {
  return !isWeekday(date);
}

/**
 * Add `days` business days (Mon–Fri) to `date`, skipping weekends.
 * Handles negative values by delegating to subtractBusinessDays.
 */
export function addBusinessDays(date: Date, days: number): Date {
  if (days < 0) return subtractBusinessDays(date, -days);
  const result = cloneDate(date);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWeekday(result)) remaining--;
  }
  return result;
}

/**
 * Subtract `days` business days (Mon–Fri) from `date`, skipping weekends.
 * Handles negative values by delegating to addBusinessDays.
 */
export function subtractBusinessDays(date: Date, days: number): Date {
  if (days < 0) return addBusinessDays(date, -days);
  const result = cloneDate(date);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() - 1);
    if (isWeekday(result)) remaining--;
  }
  return result;
}

/**
 * Count the number of weekdays (Mon–Fri) strictly between `start` and `end`.
 * If end < start the result is negative.
 */
export function businessDaysBetween(start: Date, end: Date): number {
  const sign = end.getTime() >= start.getTime() ? 1 : -1;
  let cursor = cloneDate(sign === 1 ? start : end);
  const finish = sign === 1 ? end : start;
  // Normalise to midnight
  cursor.setHours(0, 0, 0, 0);
  const finishMidnight = cloneDate(finish);
  finishMidnight.setHours(0, 0, 0, 0);

  let count = 0;
  while (cursor.getTime() < finishMidnight.getTime()) {
    cursor.setDate(cursor.getDate() + 1);
    if (isWeekday(cursor) && cursor.getTime() <= finishMidnight.getTime()) count++;
  }
  return sign * count;
}

/** Returns the next weekday strictly after `date` (skips Sat/Sun). */
export function nextBusinessDay(date: Date): Date {
  const result = cloneDate(date);
  do {
    result.setDate(result.getDate() + 1);
  } while (!isWeekday(result));
  return result;
}

/** Returns the previous weekday strictly before `date` (skips Sat/Sun). */
export function previousBusinessDay(date: Date): Date {
  const result = cloneDate(date);
  do {
    result.setDate(result.getDate() - 1);
  } while (!isWeekday(result));
  return result;
}

/**
 * Returns true if `date` matches any of the provided `holidays`
 * (comparison is by local calendar date, not exact timestamp).
 */
export function isPublicHoliday(date: Date, holidays: Date[]): boolean {
  const y = date.getFullYear();
  const mo = date.getMonth();
  const d = date.getDate();
  return holidays.some(
    (h) => h.getFullYear() === y && h.getMonth() === mo && h.getDate() === d,
  );
}

/**
 * Add `days` business days to `date`, skipping weekends AND public holidays.
 */
export function addBusinessDaysWithHolidays(
  date: Date,
  days: number,
  holidays: Date[],
): Date {
  const result = cloneDate(date);
  let remaining = Math.abs(days);
  const step = days >= 0 ? 1 : -1;
  while (remaining > 0) {
    result.setDate(result.getDate() + step);
    if (isWeekday(result) && !isPublicHoliday(result, holidays)) remaining--;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Working hours
// ---------------------------------------------------------------------------

/**
 * Returns true if `date` falls within the given working hours
 * (correct day-of-week AND between start/end times, inclusive of start, exclusive of end).
 */
export function isWithinWorkingHours(date: Date, hours: WorkingHours): boolean {
  const dow = date.getDay() as DayOfWeek;
  if (!hours.days.includes(dow)) return false;
  const current = minutesSinceMidnight(date);
  const { h: sh, m: sm } = parseHHMM(hours.start);
  const { h: eh, m: em } = parseHHMM(hours.end);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  return current >= startMin && current < endMin;
}

/**
 * Returns the next Date (>= `date`) that falls inside the given working hours.
 * If `date` itself is within working hours it is returned as-is.
 */
export function nextWorkingTime(date: Date, hours: WorkingHours): Date {
  const result = cloneDate(date);
  const { h: sh, m: sm } = parseHHMM(hours.start);

  // Safety: cap iterations to avoid infinite loop if days array is empty
  for (let i = 0; i < 10_000; i++) {
    if (isWithinWorkingHours(result, hours)) return result;

    const dow = result.getDay() as DayOfWeek;
    const current = minutesSinceMidnight(result);
    const { h: eh, m: em } = parseHHMM(hours.end);
    const endMin = eh * 60 + em;

    if (!hours.days.includes(dow) || current >= endMin) {
      // Move to start of next calendar day, then check
      result.setDate(result.getDate() + 1);
      result.setHours(sh, sm, 0, 0);
    } else {
      // Same working day but before start
      result.setHours(sh, sm, 0, 0);
    }
  }
  return result;
}

/**
 * Returns the number of whole minutes until the next working time from `date`.
 */
export function minutesUntilNextWorkingTime(date: Date, hours: WorkingHours): number {
  if (isWithinWorkingHours(date, hours)) return 0;
  const next = nextWorkingTime(date, hours);
  return Math.floor((next.getTime() - date.getTime()) / 60_000);
}

// ---------------------------------------------------------------------------
// Date arithmetic
// ---------------------------------------------------------------------------

/** Add `days` calendar days (may be negative). */
export function addDays(date: Date, days: number): Date {
  const result = cloneDate(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Add `weeks` calendar weeks. */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Add `months` to `date`.
 * If the resulting month has fewer days than the original day-of-month,
 * clamp to the last day of that month (end-of-month handling).
 */
export function addMonths(date: Date, months: number): Date {
  const result = cloneDate(date);
  const originalDay = result.getDate();
  result.setDate(1); // avoid skipping months on e.g. Jan 31 + 1 month
  result.setMonth(result.getMonth() + months);
  const daysInTarget = getDaysInMonth(result.getFullYear(), result.getMonth() + 1);
  result.setDate(Math.min(originalDay, daysInTarget));
  return result;
}

/** Add `years` to `date` (leap-year safe via addMonths). */
export function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12);
}

/** Add `hours` to `date`. */
export function addHours(date: Date, hours: number): Date {
  const result = cloneDate(date);
  result.setTime(result.getTime() + hours * 3_600_000);
  return result;
}

/** Add `minutes` to `date`. */
export function addMinutes(date: Date, minutes: number): Date {
  const result = cloneDate(date);
  result.setTime(result.getTime() + minutes * 60_000);
  return result;
}

/** Add `seconds` to `date`. */
export function addSeconds(date: Date, seconds: number): Date {
  const result = cloneDate(date);
  result.setTime(result.getTime() + seconds * 1_000);
  return result;
}

/** Return a new Date at 00:00:00.000 on the same local calendar day. */
export function startOfDay(date: Date): Date {
  const result = cloneDate(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Return a new Date at 23:59:59.999 on the same local calendar day. */
export function endOfDay(date: Date): Date {
  const result = cloneDate(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Return the start of the week containing `date`.
 * `startDay` defaults to 0 (Sunday).
 */
export function startOfWeek(date: Date, startDay: DayOfWeek = 0): Date {
  const result = cloneDate(date);
  const dow = result.getDay();
  const diff = (dow - startDay + 7) % 7;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Return the end of the week containing `date`.
 * `startDay` defaults to 0 (Sunday).
 */
export function endOfWeek(date: Date, startDay: DayOfWeek = 0): Date {
  const sow = startOfWeek(date, startDay);
  const result = addDays(sow, 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/** Return a new Date at the first moment of the month (day 1, 00:00:00.000). */
export function startOfMonth(date: Date): Date {
  const result = cloneDate(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Return a new Date at the last moment of the month (last day, 23:59:59.999). */
export function endOfMonth(date: Date): Date {
  const result = cloneDate(date);
  result.setMonth(result.getMonth() + 1, 0); // day 0 of next month = last day of this month
  result.setHours(23, 59, 59, 999);
  return result;
}

/** Return Jan 1 00:00:00.000 of the same year. */
export function startOfYear(date: Date): Date {
  const result = cloneDate(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Return Dec 31 23:59:59.999 of the same year. */
export function endOfYear(date: Date): Date {
  const result = cloneDate(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
}

// ---------------------------------------------------------------------------
// Comparison / measurement
// ---------------------------------------------------------------------------

/** True if `a` and `b` are on the same local calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** True if `a` and `b` are in the same local calendar month of the same year. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** True if `a` and `b` are in the same calendar year. */
export function isSameYear(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear();
}

/** True if `a` is strictly before `b`. */
export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}

/** True if `a` is strictly after `b`. */
export function isAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}

/** True if `date` is >= `start` and <= `end`. */
export function isBetween(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

/** Absolute number of calendar days between `a` and `b`. */
export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  const aMs = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bMs = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.abs(Math.round((bMs - aMs) / msPerDay));
}

/** Absolute number of whole hours between `a` and `b`. */
export function hoursBetween(a: Date, b: Date): number {
  return Math.abs(Math.floor((b.getTime() - a.getTime()) / 3_600_000));
}

/** Absolute number of whole minutes between `a` and `b`. */
export function minutesBetween(a: Date, b: Date): number {
  return Math.abs(Math.floor((b.getTime() - a.getTime()) / 60_000));
}

/**
 * Calculate age in whole years between `birthDate` and `referenceDate`.
 * `referenceDate` defaults to now.
 */
export function age(birthDate: Date, referenceDate?: Date): number {
  const ref = referenceDate ?? new Date();
  let years = ref.getFullYear() - birthDate.getFullYear();
  const monthDiff = ref.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birthDate.getDate())) {
    years--;
  }
  return years;
}

// ---------------------------------------------------------------------------
// Recurrence
// ---------------------------------------------------------------------------

/**
 * Generate an array of occurrence Dates according to `rule`.
 * At least one of `rule.count` or `rule.until` must be set, or generation
 * stops at 1 000 occurrences as a safety cap.
 */
export function generateRecurrence(rule: RecurrenceRule): Date[] {
  const interval = rule.interval ?? 1;
  const results: Date[] = [];
  let current = cloneDate(rule.start);
  const cap = rule.count ?? 1_000;

  while (true) {
    if (rule.until && current.getTime() > rule.until.getTime()) break;
    if (results.length >= cap) break;
    results.push(cloneDate(current));

    switch (rule.frequency) {
      case 'daily':
        current = addDays(current, interval);
        break;
      case 'weekly':
        current = addWeeks(current, interval);
        break;
      case 'monthly':
        current = addMonths(current, interval);
        break;
      case 'yearly':
        current = addYears(current, interval);
        break;
    }
  }

  return results;
}

/**
 * Return the next occurrence on or after `from` (defaults to now).
 * Returns null if no occurrence exists after `from` within the rule constraints.
 */
export function nextOccurrence(rule: RecurrenceRule, from?: Date): Date | null {
  const after = from ?? new Date();
  const occurrences = generateRecurrence(rule);
  return occurrences.find((d) => d.getTime() >= after.getTime()) ?? null;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Return the 1-indexed day of the year (1 = Jan 1, 365/366 = Dec 31).
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 86_400_000;
  return Math.floor(diff / oneDay);
}

/**
 * Return the ISO 8601 week number (1–53) for `date`.
 * ISO weeks start on Monday; week 1 is the week containing the first Thursday.
 */
export function getWeekOfYear(date: Date): number {
  const d = cloneDate(date);
  d.setHours(0, 0, 0, 0);
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/**
 * Return the number of days in the given month.
 * `month` is 1-indexed (1 = January, 12 = December).
 */
export function getDaysInMonth(year: number, month: number): number {
  // Day 0 of month+1 is the last day of month
  return new Date(year, month, 0).getDate();
}

/** Return true if `year` is a leap year. */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Format a duration given in milliseconds to a human-readable string.
 * Example: 9015000 → "2h 30m 15s"
 * Zero-value components are omitted unless the entire duration is 0 (returns "0s").
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(Math.abs(ms) / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join(' ') : '0s';
}

/**
 * Parse a human-readable duration string to milliseconds.
 * Supports: `Xd`, `Xh`, `Xm`, `Xs`, `Xms` tokens (case-insensitive).
 * Example: "2h 30m" → 9_000_000
 */
export function parseDuration(str: string): number {
  let total = 0;
  const pattern = /(\d+(?:\.\d+)?)\s*(ms|d|h|m|s)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(str)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    switch (unit) {
      case 'ms': total += value; break;
      case 's':  total += value * 1_000; break;
      case 'm':  total += value * 60_000; break;
      case 'h':  total += value * 3_600_000; break;
      case 'd':  total += value * 86_400_000; break;
    }
  }

  return total;
}

/**
 * Return a new Date set to 00:00:00.000 UTC on the same UTC calendar date as `date`.
 */
export function toUtcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
