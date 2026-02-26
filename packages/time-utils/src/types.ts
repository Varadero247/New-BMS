// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Working hours configuration */
export interface WorkingHours {
  /** Start time in "HH:MM" format, e.g. "09:00" */
  start: string;
  /** End time in "HH:MM" format, e.g. "17:00" */
  end: string;
  /** Days of the week that are working days */
  days: DayOfWeek[];
}

/** A named calendar with a set of public holidays */
export interface BusinessCalendar {
  name: string;
  holidays: Date[];
  workingHours: WorkingHours;
}

/** A time slot with start and end Date */
export interface TimeSlot {
  start: Date;
  end: Date;
}

/** A date range (inclusive) */
export interface DateRange {
  from: Date;
  to: Date;
}

/** A time period described by a value and unit */
export interface TimePeriod {
  value: number;
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
}

/** UTC offset in minutes (e.g. +60 for UTC+1, -300 for UTC-5) */
export type TimeZoneOffset = number;

/** Recurrence frequency */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

/** Rule describing a recurring event */
export interface RecurrenceRule {
  /** Start date/time of recurrence */
  start: Date;
  /** Frequency of recurrence */
  frequency: RecurrenceFrequency;
  /** Interval between occurrences (default: 1) */
  interval?: number;
  /** Maximum number of occurrences to generate */
  count?: number;
  /** Stop generating occurrences after this date */
  until?: Date;
}
