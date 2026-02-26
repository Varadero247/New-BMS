import { FieldError, FieldSchema, FieldType, ImportResult, ImportSchema, ImportStatus, RowResult } from "./types";

export function coerceType(value: unknown, type: FieldType): unknown {
  if (value === null || value === undefined || value === "") return null;
  switch (type) {
    case "number": {
      const n = Number(value);
      return isNaN(n) ? null : n;
    }
    case "boolean": {
      if (typeof value === "boolean") return value;
      const s = String(value).toLowerCase();
      if (s === "true" || s === "1" || s === "yes") return true;
      if (s === "false" || s === "0" || s === "no") return false;
      return null;
    }
    case "date": {
      const d = new Date(String(value));
      return isNaN(d.getTime()) ? null : d.toISOString();
    }
    default: return String(value);
  }
}

export function validateField(field: FieldSchema, value: unknown): FieldError[] {
  const errors: FieldError[] = [];
  const coerced = coerceType(value, field.type);

  if (field.required && (coerced === null || coerced === undefined)) {
    errors.push({ field: field.name, message: field.name + " is required", value });
    return errors;
  }
  if (value === null || value === undefined || value === '') return errors;

  switch (field.type) {
    case "string":
    case "email":
    case "url":
    case "uuid": {
      const s = String(coerced);
      if (field.minLength !== undefined && s.length < field.minLength)
        errors.push({ field: field.name, message: field.name + " must be at least " + field.minLength + " chars", value });
      if (field.maxLength !== undefined && s.length > field.maxLength)
        errors.push({ field: field.name, message: field.name + " must be at most " + field.maxLength + " chars", value });
      if (field.enum && !field.enum.includes(s))
        errors.push({ field: field.name, message: field.name + " must be one of: " + field.enum.join(", "), value });
      if (field.pattern && !new RegExp(field.pattern).test(s))
        errors.push({ field: field.name, message: field.name + " does not match required pattern", value });
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
        errors.push({ field: field.name, message: field.name + " must be a valid email", value });
      if (field.type === "url") {
        try { new URL(s); } catch (_e) { errors.push({ field: field.name, message: field.name + " must be a valid URL", value }); }
      }
      break;
    }
    case "number": {
      if (coerced === null) { errors.push({ field: field.name, message: field.name + " must be a number", value }); break; }
      const n = Number(coerced);
      if (isNaN(n)) { errors.push({ field: field.name, message: field.name + " must be a number", value }); break; }
      if (field.min !== undefined && n < field.min)
        errors.push({ field: field.name, message: field.name + " must be >= " + field.min, value });
      if (field.max !== undefined && n > field.max)
        errors.push({ field: field.name, message: field.name + " must be <= " + field.max, value });
      break;
    }
    case "boolean": {
      if (coerced === null)
        errors.push({ field: field.name, message: field.name + " must be a boolean", value });
      break;
    }
    case "date": {
      if (coerced === null)
        errors.push({ field: field.name, message: field.name + " must be a valid date", value });
      break;
    }
  }
  return errors;
}

export function validateRow(schema: ImportSchema, row: Record<string, unknown>, rowIndex: number): RowResult {
  const errors: FieldError[] = [];
  const data: Record<string, unknown> = {};

  for (const field of schema.fields) {
    const value = row[field.name];
    const coerced = coerceType(value, field.type);
    data[field.name] = coerced;
    errors.push(...validateField(field, value));
  }

  if (!schema.allowExtra) {
    const knownFields = new Set(schema.fields.map(f => f.name));
    for (const key of Object.keys(row)) {
      if (!knownFields.has(key)) {
        errors.push({ field: key, message: "Unknown field: " + key, value: row[key] });
      }
    }
  }

  const status: ImportStatus = errors.length === 0 ? "valid" : "invalid";
  return { rowIndex, status, data, errors };
}

export function validateImport(schema: ImportSchema, rows: Record<string, unknown>[]): ImportResult {
  const results = rows.map((row, i) => validateRow(schema, row, i));
  const validRows = results.filter(r => r.status === "valid").length;
  const invalidRows = results.filter(r => r.status === "invalid").length;
  const allErrors = results.flatMap(r => r.errors);
  return {
    schema: schema.name,
    totalRows: rows.length,
    validRows,
    invalidRows,
    skippedRows: 0,
    rows: results,
    errors: allErrors,
  };
}

export function makeSchema(name: string, fields: FieldSchema[], allowExtra = false): ImportSchema {
  return { name, fields, allowExtra };
}

export function makeField(name: string, type: FieldType, required = false): FieldSchema {
  return { name, type, required };
}

export function isValidFieldType(t: string): t is FieldType {
  return ["string", "number", "boolean", "date", "email", "url", "uuid"].includes(t);
}

export function summariseErrors(result: ImportResult): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const err of result.errors) {
    counts[err.field] = (counts[err.field] ?? 0) + 1;
  }
  return counts;
}

export function validRowsOnly(result: ImportResult): Record<string, unknown>[] {
  return result.rows.filter(r => r.status === "valid").map(r => r.data);
}

export function importPassRate(result: ImportResult): number {
  if (result.totalRows === 0) return 100;
  return Math.round((result.validRows / result.totalRows) * 100);
}
