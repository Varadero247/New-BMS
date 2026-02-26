// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function formatNumber(n: number, locale = 'en-GB', opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, opts).format(n);
}
export function formatCurrency(amount: number, currency: string, locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
export function formatPercent(n: number, locale = 'en-GB', decimals = 1): string {
  return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}
export function formatDate(d: Date, locale = 'en-GB', opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, opts).format(d);
}
export function formatRelativeTime(diffMs: number, locale = 'en-GB'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diffMs);
  if (abs < 60000) return rtf.format(Math.round(diffMs/1000), 'second');
  if (abs < 3600000) return rtf.format(Math.round(diffMs/60000), 'minute');
  if (abs < 86400000) return rtf.format(Math.round(diffMs/3600000), 'hour');
  return rtf.format(Math.round(diffMs/86400000), 'day');
}
export function formatCompact(n: number, locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact' }).format(n);
}
export function formatOrdinal(n: number, locale = 'en'): string {
  const pr = new Intl.PluralRules(locale, { type: 'ordinal' });
  const suffixes: Record<string, string> = { one: 'st', two: 'nd', few: 'rd', other: 'th' };
  return `${n}${suffixes[pr.select(n)] ?? 'th'}`;
}
export function parseNumber(s: string): number { return parseFloat(s.replace(/[^0-9.-]/g, '')); }
export function truncateDecimal(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.trunc(n * factor) / factor;
}
export function roundTo(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}
export function padStart(s: string | number, len: number, char = '0'): string {
  return String(s).padStart(len, char);
}
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes/1048576).toFixed(1)} MB`;
  return `${(bytes/1073741824).toFixed(1)} GB`;
}
export function formatDuration(ms: number): string {
  const s = Math.floor(ms/1000), m = Math.floor(s/60), h = Math.floor(m/60);
  if (h > 0) return `${h}h ${m%60}m`;
  if (m > 0) return `${m}m ${s%60}s`;
  return `${s}s`;
}
export function collate(a: string, b: string, locale = 'en-GB'): number {
  return new Intl.Collator(locale).compare(a, b);
}
export function listFormat(items: string[], locale = 'en-GB', type: 'conjunction' | 'disjunction' = 'conjunction'): string {
  return new Intl.ListFormat(locale, { type }).format(items);
}
