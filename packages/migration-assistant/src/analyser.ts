// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { DetectedColumn, DetectedFileStructure, DetectedType } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\+\d\s\-\(\)]{7,20}$/;
const DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/;
const DATE_UK_RE = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
const DATE_US_RE = /^\d{1,2}-\d{1,2}-\d{4}$/;
const BOOL_RE = /^(true|false|yes|no|1|0|y|n)$/i;
const INT_RE = /^-?\d+$/;
const FLOAT_RE = /^-?\d+\.\d+$/;

function maskPii(value: string): string {
  if (EMAIL_RE.test(value.trim())) {
    const [local, domain] = value.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  }
  if (PHONE_RE.test(value.trim()) && value.replace(/\D/g, '').length >= 7) {
    return value.slice(0, 3) + '***' + value.slice(-2);
  }
  return value;
}

export function detectType(samples: string[]): DetectedType {
  const nonEmpty = samples.filter(s => s !== '' && s !== null && s !== undefined);
  if (nonEmpty.length === 0) return 'unknown';

  let emailCount = 0, phoneCount = 0, dateCount = 0, boolCount = 0, intCount = 0, floatCount = 0;
  for (const v of nonEmpty) {
    const trimmed = v.trim();
    if (EMAIL_RE.test(trimmed)) emailCount++;
    else if (PHONE_RE.test(trimmed) && trimmed.replace(/\D/g, '').length >= 7) phoneCount++;
    else if (DATE_ISO_RE.test(trimmed) || DATE_UK_RE.test(trimmed) || DATE_US_RE.test(trimmed)) dateCount++;
    else if (BOOL_RE.test(trimmed)) boolCount++;
    else if (INT_RE.test(trimmed)) intCount++;
    else if (FLOAT_RE.test(trimmed)) floatCount++;
  }

  const total = nonEmpty.length;
  const threshold = 0.7;
  if (emailCount / total >= threshold) return 'email';
  if (phoneCount / total >= threshold) return 'phone';
  if (dateCount / total >= threshold) return 'date';
  if (boolCount / total >= threshold) return 'boolean';
  if (floatCount / total >= threshold) return 'float';
  if (intCount / total >= threshold) return 'integer';
  return 'string';
}

export function parseCsv(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Remove BOM if present
  const firstLine = lines[0].replace(/^\uFEFF/, '');
  const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? '').trim().replace(/^"|"$/g, '');
    });
    rows.push(row);
  }
  return { headers, rows };
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function parseJson(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const parsed: unknown = JSON.parse(content);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return { headers: [], rows: [] };

  const headers = Object.keys(arr[0] as Record<string, unknown>);
  const rows = arr.map(item => {
    const row: Record<string, string> = {};
    headers.forEach(h => {
      const val = (item as Record<string, unknown>)[h];
      row[h] = val === null || val === undefined ? '' : String(val);
    });
    return row;
  });
  return { headers, rows };
}

export function analyseFile(
  content: string,
  filename: string,
  uploadId: string,
): DetectedFileStructure {
  const ext = filename.toLowerCase().split('.').pop() ?? 'csv';
  let headers: string[];
  let rows: Record<string, string>[];
  let fileType: DetectedFileStructure['fileType'];

  if (ext === 'json') {
    ({ headers, rows } = parseJson(content));
    fileType = 'json';
  } else {
    // Default to CSV
    ({ headers, rows } = parseCsv(content));
    fileType = ext === 'xlsx' ? 'xlsx' : 'csv';
  }

  const sampleRows = rows.slice(0, 5).map(row => {
    const maskedRow: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      maskedRow[k] = maskPii(v);
    }
    return maskedRow;
  });

  const detectedTypes: Record<string, DetectedType> = {};
  const columns: DetectedColumn[] = headers.map(header => {
    const colValues = rows.map(r => r[header] ?? '');
    const type = detectType(colValues);
    detectedTypes[header] = type;
    const nonEmpty = colValues.filter(v => v !== '');
    const uniqueValues = [...new Set(colValues)];
    return {
      name: header,
      detectedType: type,
      nullCount: colValues.length - nonEmpty.length,
      uniqueCount: uniqueValues.length,
      sampleValues: colValues.slice(0, 3).map(maskPii),
    };
  });

  const confidence = headers.length > 0 && rows.length > 0 ? Math.min(1, 0.5 + headers.length * 0.02 + Math.min(rows.length, 50) * 0.005) : 0;

  return {
    uploadId,
    filename,
    rowCount: rows.length,
    headers,
    columns,
    sampleRows,
    detectedTypes,
    confidence,
    fileType,
  };
}
