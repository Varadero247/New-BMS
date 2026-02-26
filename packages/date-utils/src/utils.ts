import { BusinessDayOptions, DateRange, DayOfWeek, QuarterNumber, TimeUnit } from './types';

const DEFAULT_WORK_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5];

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function addTime(date: Date, amount: number, unit: TimeUnit): Date {
  switch (unit) {
    case 'ms': return new Date(date.getTime() + amount);
    case 'seconds': return new Date(date.getTime() + amount * 1000);
    case 'minutes': return new Date(date.getTime() + amount * 60000);
    case 'hours': return new Date(date.getTime() + amount * 3600000);
    case 'days': return addDays(date, amount);
    case 'weeks': return addWeeks(date, amount);
    case 'months': return addMonths(date, amount);
    case 'years': return addYears(date, amount);
    default: return new Date(date);
  }
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

export function getQuarter(date: Date): QuarterNumber {
  return (Math.floor(date.getMonth() / 3) + 1) as QuarterNumber;
}

export function startOfQuarter(date: Date): Date {
  const q = getQuarter(date);
  return new Date(date.getFullYear(), (q - 1) * 3, 1);
}

export function endOfQuarter(date: Date): Date {
  const q = getQuarter(date);
  return new Date(date.getFullYear(), q * 3, 0, 23, 59, 59, 999);
}

export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function diffHours(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 3600000;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isBusinessDay(date: Date, opts: BusinessDayOptions = {}): boolean {
  const workDays = opts.workDays ?? DEFAULT_WORK_DAYS;
  if (!workDays.includes(date.getDay() as DayOfWeek)) return false;
  if (opts.holidays) {
    return !opts.holidays.some(h => isSameDay(h, date));
  }
  return true;
}

export function nextBusinessDay(date: Date, opts: BusinessDayOptions = {}): Date {
  let d = addDays(date, 1);
  while (!isBusinessDay(d, opts)) d = addDays(d, 1);
  return d;
}

export function addBusinessDays(date: Date, days: number, opts: BusinessDayOptions = {}): Date {
  let d = new Date(date);
  let count = 0;
  while (count < days) {
    d = addDays(d, 1);
    if (isBusinessDay(d, opts)) count++;
  }
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isBefore(a: Date, b: Date): boolean {
  return a.getTime() < b.getTime();
}

export function isAfter(a: Date, b: Date): boolean {
  return a.getTime() > b.getTime();
}

export function isWithinRange(date: Date, range: DateRange): boolean {
  return date.getTime() >= range.start.getTime() && date.getTime() <= range.end.getTime();
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function fromISODateString(str: string): Date {
  return new Date(str + 'T00:00:00.000Z');
}

export function getDayOfYear(date: Date): number {
  const start = startOfYear(date);
  return diffDays(start, date) + 1;
}

export function getWeekOfYear(date: Date): number {
  return Math.ceil(getDayOfYear(date) / 7);
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isValidTimeUnit(u: string): u is TimeUnit {
  return ['ms','seconds','minutes','hours','days','weeks','months','years'].includes(u);
}

export function clampDate(date: Date, min: Date, max: Date): Date {
  if (date.getTime() < min.getTime()) return new Date(min);
  if (date.getTime() > max.getTime()) return new Date(max);
  return new Date(date);
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return days + 'd ' + (hours % 24) + 'h';
  if (hours > 0) return hours + 'h ' + (minutes % 60) + 'm';
  if (minutes > 0) return minutes + 'm ' + (seconds % 60) + 's';
  return seconds + 's';
}
