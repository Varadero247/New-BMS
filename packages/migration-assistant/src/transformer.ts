// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { FieldMapping, TransformedRow, TransformWarning, TargetModule } from './types';
import { MIGRATION_SCHEMAS } from './schema-registry';

// Date conversion: detect format, output ISO 8601
const DATE_PATTERNS: Array<{ re: RegExp; parse: (m: RegExpMatchArray) => string }> = [
  { re: /^(\d{4})-(\d{2})-(\d{2})/, parse: m => `${m[1]}-${m[2]}-${m[3]}` },
  { re: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, parse: m => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` },
  { re: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, parse: m => `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` },
  {
    re: /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i,
    parse: m => {
      const months: Record<string, string> = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
      return `${m[3]}-${months[m[2].toLowerCase()] ?? '01'}-${m[1].padStart(2, '0')}`;
    },
  },
  {
    re: /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})$/i,
    parse: m => {
      const months: Record<string, string> = { january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12' };
      return `${m[3]}-${months[m[1].toLowerCase()] ?? '01'}-${m[2].padStart(2, '0')}`;
    },
  },
];

export function convertDate(value: string): string | null {
  if (!value || !value.trim()) return null;
  const trimmed = value.trim();
  // Unix timestamp (13 digits = ms, 10 digits = s)
  if (/^\d{10}$/.test(trimmed)) {
    return new Date(parseInt(trimmed, 10) * 1000).toISOString().split('T')[0];
  }
  if (/^\d{13}$/.test(trimmed)) {
    return new Date(parseInt(trimmed, 10)).toISOString().split('T')[0];
  }
  for (const { re, parse } of DATE_PATTERNS) {
    const m = trimmed.match(re);
    if (m) return parse(m);
  }
  return null;
}

export function normalizeEnum(value: string, allowedValues: string[]): string | null {
  if (!value) return null;
  const trimmed = value.trim().toUpperCase();
  if (allowedValues.includes(trimmed)) return trimmed;
  // Try case-insensitive match
  const match = allowedValues.find(v => v.toUpperCase() === trimmed);
  return match ?? null;
}

export function parseBoolean(value: string): boolean | null {
  const v = value.trim().toLowerCase();
  if (['true', 'yes', '1', 'y', 'on'].includes(v)) return true;
  if (['false', 'no', '0', 'n', 'off'].includes(v)) return false;
  return null;
}

export function parseNumber(value: string): number | null {
  const cleaned = value.replace(/,/g, '').trim();
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}

export function transformRows(
  rows: Record<string, unknown>[],
  mappings: FieldMapping[],
  targetModule: TargetModule,
): TransformedRow[] {
  const schema = MIGRATION_SCHEMAS[targetModule];
  const activeMappings = mappings.filter(m => m.targetField !== 'SKIP');

  return rows.map(original => {
    const transformed: Record<string, unknown> = {};
    const warnings: TransformWarning[] = [];
    const errors: string[] = [];

    for (const mapping of activeMappings) {
      const rawValue = String(original[mapping.sourceField] ?? '');
      const fieldDef = schema?.fields[mapping.targetField];
      if (!fieldDef) {
        transformed[mapping.targetField] = rawValue;
        continue;
      }

      // Handle empty values
      if (!rawValue.trim()) {
        if (fieldDef.required) {
          errors.push(`Required field '${mapping.targetField}' is empty`);
        } else {
          transformed[mapping.targetField] = null;
        }
        continue;
      }

      // Type coercion
      switch (fieldDef.type) {
        case 'date': {
          const converted = convertDate(rawValue);
          if (!converted) {
            warnings.push({ field: mapping.targetField, message: `Could not parse date: '${rawValue}'`, originalValue: rawValue });
            transformed[mapping.targetField] = rawValue;
          } else {
            if (converted !== rawValue) {
              warnings.push({ field: mapping.targetField, message: `Converted date from '${rawValue}' to ISO 8601`, originalValue: rawValue, transformedValue: converted });
            }
            transformed[mapping.targetField] = converted;
          }
          break;
        }
        case 'enum': {
          const values = fieldDef.values ?? [];
          const normalized = normalizeEnum(rawValue, values);
          if (!normalized) {
            warnings.push({ field: mapping.targetField, message: `Enum value '${rawValue}' not in allowed values [${values.join(', ')}]`, originalValue: rawValue });
            transformed[mapping.targetField] = rawValue;
          } else {
            if (normalized !== rawValue) {
              warnings.push({ field: mapping.targetField, message: `Normalized enum from '${rawValue}' to '${normalized}'`, originalValue: rawValue, transformedValue: normalized });
            }
            transformed[mapping.targetField] = normalized;
          }
          break;
        }
        case 'integer': {
          const n = parseNumber(rawValue);
          if (n === null) {
            warnings.push({ field: mapping.targetField, message: `Could not parse integer: '${rawValue}'`, originalValue: rawValue });
            transformed[mapping.targetField] = rawValue;
          } else {
            transformed[mapping.targetField] = Math.round(n);
          }
          break;
        }
        case 'float': {
          const n = parseNumber(rawValue);
          if (n === null) {
            warnings.push({ field: mapping.targetField, message: `Could not parse number: '${rawValue}'`, originalValue: rawValue });
            transformed[mapping.targetField] = rawValue;
          } else {
            transformed[mapping.targetField] = n;
          }
          break;
        }
        case 'boolean': {
          const b = parseBoolean(rawValue);
          if (b === null) {
            warnings.push({ field: mapping.targetField, message: `Could not parse boolean: '${rawValue}'`, originalValue: rawValue });
            transformed[mapping.targetField] = rawValue;
          } else {
            transformed[mapping.targetField] = b;
          }
          break;
        }
        default: {
          // String / text / email / phone
          const maxLen = fieldDef.maxLength;
          if (maxLen && rawValue.length > maxLen) {
            const truncated = rawValue.slice(0, maxLen);
            warnings.push({ field: mapping.targetField, message: `Truncated string from ${rawValue.length} to ${maxLen} chars`, originalValue: rawValue, transformedValue: truncated });
            transformed[mapping.targetField] = truncated;
          } else {
            transformed[mapping.targetField] = rawValue;
          }
        }
      }
    }

    return { original, transformed, warnings, errors };
  });
}
