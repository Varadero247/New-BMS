// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import type { ExportColumn, ExportFormat } from './types';

export const MIME_TYPES: Record<ExportFormat, string> = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  pdf: 'application/pdf',
  json: 'application/json',
};

export const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  xlsx: 'xlsx',
  csv: 'csv',
  pdf: 'pdf',
  json: 'json',
};

export const MAX_ROWS: Record<ExportFormat, number> = {
  xlsx: 1_048_576,
  csv: 10_000_000,
  pdf: 10_000,
  json: 1_000_000,
};

export function getMimeType(format: ExportFormat): string {
  return MIME_TYPES[format] ?? 'application/octet-stream';
}

export function getExtension(format: ExportFormat): string {
  return FILE_EXTENSIONS[format] ?? 'bin';
}

export function getMaxRows(format: ExportFormat): number {
  return MAX_ROWS[format] ?? 10_000;
}

export function formatCellValue(
  value: unknown,
  col: ExportColumn,
  opts: { dateFormat?: string; currencySymbol?: string } = {}
): string {
  if (value === null || value === undefined) return '';
  const { format = 'text', } = col;
  const { dateFormat = 'YYYY-MM-DD', currencySymbol = '£' } = opts;

  switch (format) {
    case 'number':
      return typeof value === 'number' ? value.toString() : String(Number(value));
    case 'currency':
      return `${currencySymbol}${(Number(value) || 0).toFixed(2)}`;
    case 'date': {
      const d = value instanceof Date ? value : new Date(String(value));
      if (isNaN(d.getTime())) return String(value);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return dateFormat === 'DD/MM/YYYY' ? `${dd}/${mm}/${yyyy}` : `${yyyy}-${mm}-${dd}`;
    }
    case 'boolean':
      return value ? 'Yes' : 'No';
    default:
      return String(value);
  }
}

export function buildCsvRow(cells: string[]): string {
  return cells
    .map((c) => {
      if (c.includes(',') || c.includes('"') || c.includes('\n')) {
        return `"${c.replace(/"/g, '""')}"`;
      }
      return c;
    })
    .join(',');
}

export function buildCsvContent(
  rows: Record<string, unknown>[],
  columns: ExportColumn[],
  includeHeaders = true,
  opts: { dateFormat?: string; currencySymbol?: string } = {}
): string {
  const lines: string[] = [];
  if (includeHeaders) {
    lines.push(buildCsvRow(columns.map((c) => c.label)));
  }
  for (const row of rows) {
    lines.push(buildCsvRow(columns.map((c) => formatCellValue(row[c.key], c, opts))));
  }
  return lines.join('\n');
}

export function buildJsonContent(
  rows: Record<string, unknown>[],
  columns: ExportColumn[]
): string {
  const projected = rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const col of columns) {
      out[col.key] = row[col.key] ?? null;
    }
    return out;
  });
  return JSON.stringify(projected, null, 2);
}

export function ensureFilenameExtension(filename: string, format: ExportFormat): string {
  const ext = `.${getExtension(format)}`;
  return filename.endsWith(ext) ? filename : `${filename}${ext}`;
}

export function isValidFormat(format: string): format is ExportFormat {
  return ['xlsx', 'csv', 'pdf', 'json'].includes(format);
}

export function validateColumns(columns: ExportColumn[]): string | null {
  if (!columns || columns.length === 0) return 'At least one column is required';
  for (const col of columns) {
    if (!col.key || typeof col.key !== 'string') return `Invalid column key: ${col.key}`;
    if (!col.label || typeof col.label !== 'string') return `Invalid column label for key ${col.key}`;
  }
  return null;
}
