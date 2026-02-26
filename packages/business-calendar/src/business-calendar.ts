// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { BusinessDayOptions, SLAResult } from './types';
import { isHoliday } from './holidays';

const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri

/** Format a Date as yyyy-mm-dd using UTC values. */
export function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse a yyyy-mm-dd string into a Date (UTC midnight). */
export function parseDate(str: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) throw new Error('Invalid date format');
  return new Date(str + 'T00:00:00Z');
}

function dateStr(d: Date): string {
  return formatDate(d);
}

function isWorkDay(date: Date, opts: BusinessDayOptions = {}): boolean {
  const wd = opts.workDays ?? DEFAULT_WORK_DAYS;
  if (!wd.includes(date.getUTCDay())) return false;
  if (opts.country && isHoliday(date, opts.country)) return false;
  if (opts.holidays?.some(h => h.date === dateStr(date))) return false;
  return true;
}

/** Add N business days to a date (skipping weekends and holidays). */
export function addBusinessDays(date: Date, days: number, opts: BusinessDayOptions = {}): Date {
  // Work in UTC to avoid DST shifts
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  let remaining = Math.abs(days);
  const direction = days >= 0 ? 1 : -1;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + direction);
    if (isWorkDay(result, opts)) remaining--;
  }
  return result;
}

/** Count business days between two dates (exclusive of start, inclusive of end). */
export function countBusinessDays(from: Date, to: Date, opts: BusinessDayOptions = {}): number {
  let count = 0;
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  const forward = end >= cursor;
  while (forward ? cursor < end : cursor > end) {
    cursor.setUTCDate(cursor.getUTCDate() + (forward ? 1 : -1));
    if (isWorkDay(cursor, opts)) count++;
  }
  return forward ? count : -count;
}

/** Check whether a given date is a business day. */
export function isBusinessDay(date: Date, opts: BusinessDayOptions = {}): boolean {
  return isWorkDay(date, opts);
}

/** Get the next business day (starting from the day after the given date). */
export function nextBusinessDay(date: Date, opts: BusinessDayOptions = {}): Date {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  result.setUTCDate(result.getUTCDate() + 1);
  while (!isWorkDay(result, opts)) result.setUTCDate(result.getUTCDate() + 1);
  return result;
}

/** Get the previous business day (starting from the day before the given date). */
export function prevBusinessDay(date: Date, opts: BusinessDayOptions = {}): Date {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  result.setUTCDate(result.getUTCDate() - 1);
  while (!isWorkDay(result, opts)) result.setUTCDate(result.getUTCDate() - 1);
  return result;
}

/** Get the ISO week number (1–53) for a date. */
export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/** Get the ISO week year (the year that the ISO week belongs to). */
export function isoWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}

/** Get the start date (Monday) of a given ISO week. */
export function isoWeekStart(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setUTCDate(jan4.getUTCDate() - day + 1 + (week - 1) * 7);
  return weekStart;
}

/** Compute SLA deadline given start date, business hours, and work hours per day. */
export function computeSLA(
  start: Date,
  slaHours: number,
  opts: BusinessDayOptions & { workHoursPerDay?: number } = {}
): SLAResult {
  const hoursPerDay = opts.workHoursPerDay ?? 8;
  const businessDays = Math.ceil(slaHours / hoursPerDay);
  const deadline = addBusinessDays(start, businessDays, opts);
  return { businessDays, businessHours: slaHours, deadline };
}

/** Get quarter number (1–4) for a date. */
export function getQuarter(date: Date): number {
  return Math.floor(date.getUTCMonth() / 3) + 1;
}

/** Get the first day of the quarter for a date. */
export function quarterStart(date: Date): Date {
  const q = getQuarter(date);
  return new Date(date.getUTCFullYear(), (q - 1) * 3, 1);
}

/** Get the last day of the quarter for a date. */
export function quarterEnd(date: Date): Date {
  const q = getQuarter(date);
  return new Date(date.getUTCFullYear(), q * 3, 0);
}

/** Check if two dates are in the same week (ISO). */
export function isSameWeek(a: Date, b: Date): boolean {
  return isoWeekNumber(a) === isoWeekNumber(b) && isoWeekYear(a) === isoWeekYear(b);
}

/** Check if two dates are in the same month. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

/** Check if two dates are in the same quarter. */
export function isSameQuarter(a: Date, b: Date): boolean {
  return getQuarter(a) === getQuarter(b) && a.getUTCFullYear() === b.getUTCFullYear();
}

/** Get number of business days in a given month. */
export function businessDaysInMonth(year: number, month: number, opts: BusinessDayOptions = {}): number {
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (isWorkDay(cursor, opts)) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}
