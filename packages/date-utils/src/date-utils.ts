// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/**
 * Pure date utility functions for IMS monorepo.
 * No external dependencies — all dates as Date objects or primitive values.
 */

/** Add a number of days to a date. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/** Add a number of months to a date. */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);
  return result;
}

/** Add a number of years to a date. */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date.getTime());
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/** Add a number of hours to a date. */
export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3600000);
}

/** Add a number of minutes to a date. */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/** Add a number of seconds to a date. */
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

/** Subtract a number of days from a date. */
export function subDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/** Subtract a number of months from a date. */
export function subMonths(date: Date, months: number): Date {
  return addMonths(date, -months);
}

/** Subtract a number of years from a date. */
export function subYears(date: Date, years: number): Date {
  return addYears(date, -years);
}

/** Absolute difference in whole days between two dates. */
export function diffDays(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.round(Math.abs(a.getTime() - b.getTime()) / msPerDay);
}

/** Absolute difference in whole hours between two dates. */
export function diffHours(a: Date, b: Date): number {
  return Math.round(Math.abs(a.getTime() - b.getTime()) / 3600000);
}

/** Absolute difference in whole minutes between two dates. */
export function diffMinutes(a: Date, b: Date): number {
  return Math.round(Math.abs(a.getTime() - b.getTime()) / 60000);
}

/** Returns true if date a is strictly before date b. */
export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}

/** Returns true if date a is strictly after date b. */
export function isAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}

/** Returns true if two dates fall on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Returns true if two dates fall in the same calendar month and year. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Returns true if two dates fall in the same calendar year. */
export function isSameYear(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear();
}

/** Returns true if the date falls on Saturday (6) or Sunday (0). */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Returns true if the given year is a leap year. */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Returns a new Date set to the very start of the day (00:00:00.000). */
export function startOfDay(date: Date): Date {
  const result = new Date(date.getTime());
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Returns a new Date set to the very end of the day (23:59:59.999). */
export function endOfDay(date: Date): Date {
  const result = new Date(date.getTime());
  result.setHours(23, 59, 59, 999);
  return result;
}

/** Returns a new Date set to the first day of the month at 00:00:00.000. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/** Returns a new Date set to the last millisecond of the month. */
export function endOfMonth(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return result;
}

/** Returns a new Date set to January 1 of the year at 00:00:00.000. */
export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

/** Returns a new Date set to December 31 of the year at 23:59:59.999. */
export function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

/**
 * Returns the number of days in a given month.
 * @param year  Full year, e.g. 2024
 * @param month Month 1-12
 */
export function getDaysInMonth(year: number, month: number): number {
  // Day 0 of the next month equals the last day of the target month
  return new Date(year, month, 0).getDate();
}

/**
 * Returns the ISO 8601 week number (1-53) for a date.
 * ISO weeks start on Monday; week 1 is the week containing the first Thursday.
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to Thursday of the current week (ISO week day: Mon=1...Sun=7)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Returns the day of the year (1-366).
 * Uses UTC-based arithmetic to avoid DST skew.
 */
export function getDayOfYear(date: Date): number {
  // Use UTC noon to avoid any DST offset issues
  const utcYear = date.getFullYear();
  const utcDate = Date.UTC(utcYear, date.getMonth(), date.getDate());
  const utcStart = Date.UTC(utcYear, 0, 1);
  return Math.round((utcDate - utcStart) / 86400000) + 1;
}

/**
 * Simple date formatter supporting tokens: YYYY MM DD HH mm ss
 */
export function formatDate(date: Date, format: string): string {
  const pad = (n: number, len = 2): string => String(n).padStart(len, '0');
  return format
    .replace('YYYY', pad(date.getFullYear(), 4))
    .replace('MM', pad(date.getMonth() + 1))
    .replace('DD', pad(date.getDate()))
    .replace('HH', pad(date.getHours()))
    .replace('mm', pad(date.getMinutes()))
    .replace('ss', pad(date.getSeconds()));
}

/**
 * Parse a date string according to a simple format (YYYY MM DD HH mm ss).
 * Throws if the string does not match the format.
 */
export function parseDate(str: string, format: string): Date {
  let year = 0, month = 1, day = 1, hours = 0, minutes = 0, seconds = 0;

  const extract = (token: string): string => {
    const idx = format.indexOf(token);
    if (idx === -1) return '';
    return str.substring(idx, idx + token.length);
  };

  if (format.includes('YYYY')) year = parseInt(extract('YYYY'), 10);
  if (format.includes('MM')) month = parseInt(extract('MM'), 10);
  if (format.includes('DD')) day = parseInt(extract('DD'), 10);
  if (format.includes('HH')) hours = parseInt(extract('HH'), 10);
  if (format.includes('mm')) minutes = parseInt(extract('mm'), 10);
  if (format.includes('ss')) seconds = parseInt(extract('ss'), 10);

  return new Date(year, month - 1, day, hours, minutes, seconds, 0);
}

/**
 * Clamps a date to within [min, max].
 */
export function clampDate(date: Date, min: Date, max: Date): Date {
  if (date.getTime() < min.getTime()) return new Date(min.getTime());
  if (date.getTime() > max.getTime()) return new Date(max.getTime());
  return new Date(date.getTime());
}
