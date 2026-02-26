// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface TimezoneInfo {
  name: string;           // IANA name e.g. "Europe/London"
  offsetMinutes: number;  // current UTC offset in minutes (positive = east)
  offsetString: string;   // e.g. "+05:30"
  abbr: string;           // e.g. "GMT", "EST", "IST"
  isDST: boolean;
}
export interface ZonedDate {
  date: Date;             // JS Date (always UTC internally)
  timezone: string;       // IANA timezone string
  localYear: number;
  localMonth: number;     // 1-12
  localDay: number;       // 1-31
  localHour: number;      // 0-23
  localMinute: number;
  localSecond: number;
  offsetMinutes: number;
  isDST: boolean;
}
export interface BusinessHoursOptions {
  startHour?: number;   // default 9
  endHour?: number;     // default 17
  workDays?: number[];  // 0=Sun,1=Mon...6=Sat; default [1,2,3,4,5]
}
