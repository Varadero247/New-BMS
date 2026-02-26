// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { TimezoneInfo, ZonedDate, BusinessHoursOptions } from './types';

// ---------------------------------------------------------------------------
// TIMEZONES — well-known IANA timezone names (80+), grouped by region
// ---------------------------------------------------------------------------
export const TIMEZONES: string[] = [
  // Americas
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'America/Adak',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Monterrey',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'America/Caracas',
  'America/Halifax',
  'America/St_Johns',
  'America/Manaus',
  'America/Fortaleza',
  // Europe
  'Europe/London',
  'Europe/Dublin',
  'Europe/Lisbon',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Warsaw',
  'Europe/Prague',
  'Europe/Vienna',
  'Europe/Budapest',
  'Europe/Bucharest',
  'Europe/Athens',
  'Europe/Helsinki',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Zurich',
  'Europe/Moscow',
  'Europe/Kiev',
  'Europe/Istanbul',
  // Africa
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Casablanca',
  'Africa/Accra',
  'Africa/Tunis',
  'Africa/Addis_Ababa',
  // Asia
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Kuwait',
  'Asia/Baghdad',
  'Asia/Tehran',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Colombo',
  'Asia/Dhaka',
  'Asia/Yangon',
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Kuala_Lumpur',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Taipei',
  'Asia/Seoul',
  'Asia/Tokyo',
  'Asia/Manila',
  'Asia/Ho_Chi_Minh',
  'Asia/Almaty',
  'Asia/Tashkent',
  'Asia/Yekaterinburg',
  // Pacific / Oceania
  'Australia/Perth',
  'Australia/Darwin',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Hobart',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'Pacific/Guam',
  // UTC
  'UTC',
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extract numeric parts of a date in a given timezone using Intl.DateTimeFormat.
 * Returns { year, month (1-12), day, hour, minute, second }.
 */
function getLocalParts(
  date: Date,
  timezone: string,
): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = fmt.formatToParts(date);
  const get = (type: string): number => {
    const p = parts.find((x) => x.type === type);
    return p ? parseInt(p.value, 10) : 0;
  };

  let hour = get('hour');
  // Intl hour12:false can return 24 for midnight in some environments
  if (hour === 24) hour = 0;

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour,
    minute: get('minute'),
    second: get('second'),
  };
}

/**
 * Compute UTC offset in minutes for a timezone at a given date.
 * Strategy: parse the local time parts, reconstruct as UTC, difference = offset.
 */
function computeOffsetMinutes(timezone: string, date: Date): number {
  const { year, month, day, hour, minute, second } = getLocalParts(date, timezone);
  // Treat local parts as if they were UTC to get their epoch ms
  const localAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const utcMs = date.getTime() - (date.getMilliseconds()); // strip millis from UTC epoch
  // Round to nearest minute to avoid subsecond drift
  return Math.round((localAsUtcMs - utcMs) / 60000);
}

/**
 * Determine DST status by comparing January and July offsets.
 * If current offset !== the standard (winter) offset, DST is active.
 * For Southern Hemisphere this still works: DST is active in their summer (our winter).
 */
function computeIsDST(timezone: string, date: Date): boolean {
  const janOffset = computeOffsetMinutes(timezone, new Date(date.getFullYear(), 0, 15));
  const julOffset = computeOffsetMinutes(timezone, new Date(date.getFullYear(), 6, 15));
  if (janOffset === julOffset) return false; // No DST for this timezone
  const currentOffset = computeOffsetMinutes(timezone, date);
  // DST = larger offset (further from UTC) is in effect
  return currentOffset === Math.max(janOffset, julOffset);
}

// ---------------------------------------------------------------------------
// Core timezone conversion
// ---------------------------------------------------------------------------

export function convertToTimezone(date: Date, timezone: string): ZonedDate {
  const { year, month, day, hour, minute, second } = getLocalParts(date, timezone);
  const offsetMinutes = computeOffsetMinutes(timezone, date);
  const dst = computeIsDST(timezone, date);

  return {
    date,
    timezone,
    localYear: year,
    localMonth: month,
    localDay: day,
    localHour: hour,
    localMinute: minute,
    localSecond: second,
    offsetMinutes,
    isDST: dst,
  };
}

export function convertBetweenTimezones(date: Date, fromTz: string, toTz: string): Date {
  // Interpret `date`'s numeric values (year/month/day/hour/min/sec) as local time
  // in fromTz, then produce a UTC Date that represents that same instant,
  // then return it (caller can inspect using convertToTimezone with toTz).
  const utcEquivalent = localToUtc(date, fromTz);
  // Return a Date that when displayed in toTz shows the equivalent local time.
  // Since JS Date is always UTC internally, we just return the UTC equivalent.
  return utcToLocal(utcEquivalent, toTz);
}

export function getOffsetMinutes(timezone: string, date?: Date): number {
  return computeOffsetMinutes(timezone, date ?? new Date());
}

export function getOffsetString(timezone: string, date?: Date): string {
  const offset = computeOffsetMinutes(timezone, date ?? new Date());
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60).toString().padStart(2, '0');
  const minutes = (absOffset % 60).toString().padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

export function getTimezoneInfo(timezone: string, date?: Date): TimezoneInfo {
  const d = date ?? new Date();
  const offsetMinutes = computeOffsetMinutes(timezone, d);
  const offsetString = getOffsetString(timezone, d);
  const dst = computeIsDST(timezone, d);
  const abbr = getAbbreviation(timezone, d);

  return {
    name: timezone,
    offsetMinutes,
    offsetString,
    abbr,
    isDST: dst,
  };
}

export function isDST(timezone: string, date?: Date): boolean {
  return computeIsDST(timezone, date ?? new Date());
}

export function utcToLocal(date: Date, timezone: string): Date {
  const offset = computeOffsetMinutes(timezone, date);
  return new Date(date.getTime() + offset * 60000);
}

export function localToUtc(localDate: Date, timezone: string): Date {
  // localDate's numeric values (getTime()) represent UTC milliseconds,
  // but we want to treat them as local time. We need to find the UTC instant
  // whose local representation in timezone matches localDate's UTC numeric values.
  // Approximate: subtract offset computed at localDate (iterate once to refine).
  const approxOffset = computeOffsetMinutes(timezone, localDate);
  const approxUtc = new Date(localDate.getTime() - approxOffset * 60000);
  // Refine with the offset at the approximated UTC time
  const refinedOffset = computeOffsetMinutes(timezone, approxUtc);
  return new Date(localDate.getTime() - refinedOffset * 60000);
}

export function formatInTimezone(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const opts: Intl.DateTimeFormatOptions = options ?? {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: timezone }).format(date);
}

// ---------------------------------------------------------------------------
// Timezone validation and lookup
// ---------------------------------------------------------------------------

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function getTimezonesByOffset(offsetMinutes: number, date?: Date): string[] {
  const d = date ?? new Date();
  return TIMEZONES.filter((tz) => computeOffsetMinutes(tz, d) === offsetMinutes);
}

export function getTimezonesByRegion(region: string): string[] {
  return TIMEZONES.filter((tz) => tz.startsWith(region + '/') || tz === region);
}

export function guessTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// ---------------------------------------------------------------------------
// Comparison utilities
// ---------------------------------------------------------------------------

export function isSameLocalDay(a: Date, tzA: string, b: Date, tzB: string): boolean {
  const partsA = getLocalParts(a, tzA);
  const partsB = getLocalParts(b, tzB);
  return (
    partsA.year === partsB.year &&
    partsA.month === partsB.month &&
    partsA.day === partsB.day
  );
}

export function getLocalMidnight(date: Date, timezone: string): Date {
  const { year, month, day } = getLocalParts(date, timezone);
  // Construct local midnight as a fake UTC date then convert back
  const localMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return localToUtc(localMidnight, timezone);
}

export function getLocalNoon(date: Date, timezone: string): Date {
  const { year, month, day } = getLocalParts(date, timezone);
  const localNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  return localToUtc(localNoon, timezone);
}

export function offsetDifference(tzA: string, tzB: string, date?: Date): number {
  const d = date ?? new Date();
  return computeOffsetMinutes(tzA, d) - computeOffsetMinutes(tzB, d);
}

// ---------------------------------------------------------------------------
// Business hours
// ---------------------------------------------------------------------------

const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 17;
const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri

export function isBusinessHours(
  date: Date,
  timezone: string,
  options?: BusinessHoursOptions,
): boolean {
  const startHour = options?.startHour ?? DEFAULT_START_HOUR;
  const endHour = options?.endHour ?? DEFAULT_END_HOUR;
  const workDays = options?.workDays ?? DEFAULT_WORK_DAYS;

  const { year, month, day, hour, minute } = getLocalParts(date, timezone);

  // Get day of week in local timezone
  // Reconstruct local date to get weekday
  const localDate = new Date(Date.UTC(year, month - 1, day));
  // UTC day of week won't match local — use Intl for weekday
  const weekdayFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  });
  const weekdayStr = weekdayFmt.format(date);
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const dayOfWeek = weekdayMap[weekdayStr] ?? localDate.getUTCDay();

  if (!workDays.includes(dayOfWeek)) return false;

  const currentMinutes = hour * 60 + minute;
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

export function nextBusinessOpen(
  date: Date,
  timezone: string,
  options?: BusinessHoursOptions,
): Date {
  const startHour = options?.startHour ?? DEFAULT_START_HOUR;
  const endHour = options?.endHour ?? DEFAULT_END_HOUR;
  const workDays = options?.workDays ?? DEFAULT_WORK_DAYS;

  // Start from local midnight of current day, advance until we find open time
  let candidate = getLocalMidnight(date, timezone);
  // Add startHour hours to get opening time
  candidate = new Date(candidate.getTime() + startHour * 60 * 60 * 1000);

  // If we are currently in business hours, next open is tomorrow's open
  if (isBusinessHours(date, timezone, options)) {
    const { year, month, day } = getLocalParts(date, timezone);
    const nextDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
    candidate = new Date(localToUtc(nextDay, timezone).getTime() + startHour * 60 * 60 * 1000);
  } else if (candidate <= date) {
    // Opening already passed today, move to tomorrow
    const { year, month, day } = getLocalParts(date, timezone);
    const nextDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
    candidate = new Date(localToUtc(nextDay, timezone).getTime() + startHour * 60 * 60 * 1000);
  }

  // Advance past non-work days
  let maxIter = 14;
  while (maxIter-- > 0) {
    const weekdayFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
    });
    const weekdayStr = weekdayFmt.format(candidate);
    const weekdayMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    const dayOfWeek = weekdayMap[weekdayStr] ?? 1;
    if (workDays.includes(dayOfWeek)) break;

    // Move to next day
    const { year, month, day } = getLocalParts(candidate, timezone);
    const nextDay = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
    candidate = new Date(localToUtc(nextDay, timezone).getTime() + startHour * 60 * 60 * 1000);
  }

  // Clamp: if endHour <= startHour treat as invalid, return candidate as-is
  if (endHour <= startHour) return candidate;

  return candidate;
}

export function nextBusinessClose(
  date: Date,
  timezone: string,
  options?: BusinessHoursOptions,
): Date {
  const startHour = options?.startHour ?? DEFAULT_START_HOUR;
  const endHour = options?.endHour ?? DEFAULT_END_HOUR;

  const openTime = nextBusinessOpen(date, timezone, options);
  // Close is endHour - startHour hours after open
  return new Date(openTime.getTime() + (endHour - startHour) * 60 * 60 * 1000);
}

export function businessHoursRemaining(
  date: Date,
  timezone: string,
  options?: BusinessHoursOptions,
): number {
  if (!isBusinessHours(date, timezone, options)) return 0;

  const endHour = options?.endHour ?? DEFAULT_END_HOUR;
  const { hour, minute } = getLocalParts(date, timezone);
  const currentMinutes = hour * 60 + minute;
  const endMinutes = endHour * 60;
  return Math.max(0, endMinutes - currentMinutes);
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function toISOStringInTimezone(date: Date, timezone: string): string {
  const { year, month, day, hour, minute, second } = getLocalParts(date, timezone);
  const offsetStr = getOffsetString(timezone, date);

  const pad = (n: number, len = 2): string => n.toString().padStart(len, '0');

  return (
    `${pad(year, 4)}-${pad(month)}-${pad(day)}` +
    `T${pad(hour)}:${pad(minute)}:${pad(second)}${offsetStr}`
  );
}

export function getTimezoneName(
  timezone: string,
  locale: string = 'en-US',
  format: 'long' | 'short' = 'long',
): string {
  try {
    const fmt = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      timeZoneName: format,
    });
    const parts = fmt.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart?.value ?? timezone;
  } catch {
    return timezone;
  }
}

export function getAbbreviation(timezone: string, date?: Date): string {
  try {
    const d = date ?? new Date();
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = fmt.formatToParts(d);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart?.value ?? timezone;
  } catch {
    return timezone;
  }
}
