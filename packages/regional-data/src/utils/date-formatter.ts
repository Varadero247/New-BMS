// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { RegionConfig } from '../types/region-config.types';

export function formatDate(date: Date | string, config: RegionConfig): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = config.languages[0]?.code || 'en';
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export function formatDateTime(date: Date | string, config: RegionConfig): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = config.languages[0]?.code || 'en';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: config.timezone[0],
  }).format(d);
}

export function getFinancialYearDates(config: RegionConfig, year: number): { start: Date; end: Date } {
  const fyEnd = config.finance.fiscalYearEnd;
  if (fyEnd === 'Mar 31') return { start: new Date(year - 1, 3, 1), end: new Date(year, 2, 31) };
  if (fyEnd === 'Jun 30') return { start: new Date(year - 1, 6, 1), end: new Date(year, 5, 30) };
  if (fyEnd === 'Sep 30') return { start: new Date(year - 1, 9, 1), end: new Date(year, 8, 30) };
  // Default Dec 31
  return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
}
