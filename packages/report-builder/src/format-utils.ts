// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { ReportFieldType } from './types';

/** Formats a raw value according to its field type and optional format string. */
export function formatValue(
  value: unknown,
  type: ReportFieldType,
  format?: string
): string {
  if (value === null || value === undefined) return '';

  switch (type) {
    case 'date': {
      const date = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(date.getTime())) return String(value);
      if (format === 'YYYY-MM-DD') {
        return date.toISOString().slice(0, 10);
      }
      if (format === 'DD/MM/YYYY') {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
      }
      if (format === 'MM/DD/YYYY') {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${m}/${d}/${y}`;
      }
      return date.toISOString();
    }

    case 'number': {
      const n = Number(value);
      if (Number.isNaN(n)) return String(value);
      if (format === 'currency') return `£${n.toFixed(2)}`;
      if (format === 'percent') return `${(n * 100).toFixed(1)}%`;
      if (format === '0.0') return n.toFixed(1);
      if (format === '0.00') return n.toFixed(2);
      if (format === 'integer') return String(Math.round(n));
      return String(n);
    }

    case 'boolean':
      return value ? 'Yes' : 'No';

    case 'enum':
      return String(value)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    case 'text':
    case 'computed':
    default:
      return String(value);
  }
}

/** Returns the MIME type for a given report format. */
export function getMimeType(format: string): string {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    json: 'application/json',
    html: 'text/html',
  };
  return map[format] ?? 'application/octet-stream';
}

/** Returns the file extension for a given report format. */
export function getFileExtension(format: string): string {
  const map: Record<string, string> = {
    pdf: 'pdf',
    xlsx: 'xlsx',
    csv: 'csv',
    json: 'json',
    html: 'html',
  };
  return map[format] ?? 'bin';
}
