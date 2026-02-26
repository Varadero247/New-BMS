// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// JSON utilities
export function safeJsonParse<T = unknown>(text: string, fallback?: T): T | undefined {
  try { return JSON.parse(text) as T; }
  catch { return fallback; }
}

export function safeJsonStringify(value: unknown, indent?: number): string | undefined {
  try { return JSON.stringify(value, null, indent); }
  catch { return undefined; }
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function flattenObject(obj: Record<string, unknown>, prefix = '', sep = '.'): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}${sep}${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey, sep));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

export function unflattenObject(obj: Record<string, unknown>, sep = '.'): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split(sep);
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

// CSV utilities
export function parseCsvLine(line: string, delimiter = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function parseCsv(text: string, delimiter = ','): string[][] {
  return text.split('\n').filter(l => l.trim()).map(l => parseCsvLine(l, delimiter));
}

export function csvToObjects(text: string, delimiter = ','): Record<string, string>[] {
  const rows = parseCsv(text, delimiter);
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj;
  });
}

export function objectsToCsv(objects: Record<string, unknown>[], delimiter = ','): string {
  if (!objects.length) return '';
  const headers = Object.keys(objects[0]);
  const rows = [headers.join(delimiter)];
  for (const obj of objects) {
    rows.push(headers.map(h => {
      const v = String(obj[h] ?? '');
      return v.includes(delimiter) || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(delimiter));
  }
  return rows.join('\n');
}

// URL encoding
export function encodeQueryParams(params: Record<string, string | number | boolean>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

export function decodeQueryParams(qs: string): Record<string, string> {
  const clean = qs.startsWith('?') ? qs.slice(1) : qs;
  const result: Record<string, string> = {};
  for (const pair of clean.split('&')) {
    const [k, v = ''] = pair.split('=');
    if (k) result[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return result;
}

// Binary-like encoding (numeric arrays)
export function serializeNumbers(nums: number[]): string {
  return nums.join(',');
}

export function deserializeNumbers(str: string): number[] {
  if (!str.trim()) return [];
  return str.split(',').map(Number);
}

export function serializeMap<V>(map: Map<string, V>): string {
  return JSON.stringify(Array.from(map.entries()));
}

export function deserializeMap<V>(str: string): Map<string, V> {
  try {
    const entries = JSON.parse(str) as Array<[string, V]>;
    return new Map(entries);
  } catch { return new Map(); }
}

// Key-value format
export function parseKeyValue(text: string, sep = '='): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(sep);
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      result[key] = value;
    }
  }
  return result;
}

export function stringifyKeyValue(obj: Record<string, unknown>, sep = '='): string {
  return Object.entries(obj).map(([k, v]) => `${k}${sep}${v}`).join('\n');
}

// Diff utilities
export function diff<T>(a: T[], b: T[]): { added: T[]; removed: T[]; unchanged: T[] } {
  const setA = new Set(a);
  const setB = new Set(b);
  return {
    added: b.filter(x => !setA.has(x)),
    removed: a.filter(x => !setB.has(x)),
    unchanged: a.filter(x => setB.has(x)),
  };
}
