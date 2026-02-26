// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type SchemaType = 'string' | 'number' | 'boolean' | 'array' | 'object';
export interface FieldSchema {
  type: SchemaType;
  required?: boolean;
  default?: unknown;
  min?: number;
  max?: number;
  enum?: unknown[];
  pattern?: RegExp;
  items?: FieldSchema;
  properties?: Record<string, FieldSchema>;
}
export type Schema = Record<string, FieldSchema>;
export interface ValidationResult { valid: boolean; errors: string[]; }

export function defineSchema(schema: Schema): Schema { return schema; }

export function validate(data: Record<string, unknown>, schema: Schema): ValidationResult {
  const errors: string[] = [];
  for (const [key, field] of Object.entries(schema)) {
    const val = data[key];
    if (val === undefined || val === null) {
      if (field.required) errors.push(`Field "${key}" is required`);
      continue;
    }
    const actual = Array.isArray(val) ? 'array' : typeof val;
    if (actual !== field.type && !(field.type === 'array' && Array.isArray(val))) {
      errors.push(`Field "${key}" must be ${field.type}, got ${actual}`);
      continue;
    }
    if (field.type === 'number') {
      if (field.min !== undefined && (val as number) < field.min) errors.push(`Field "${key}" must be >= ${field.min}`);
      if (field.max !== undefined && (val as number) > field.max) errors.push(`Field "${key}" must be <= ${field.max}`);
    }
    if (field.type === 'string') {
      if (field.min !== undefined && (val as string).length < field.min) errors.push(`Field "${key}" length must be >= ${field.min}`);
      if (field.max !== undefined && (val as string).length > field.max) errors.push(`Field "${key}" length must be <= ${field.max}`);
      if (field.pattern && !field.pattern.test(val as string)) errors.push(`Field "${key}" does not match pattern`);
    }
    if (field.enum && !field.enum.includes(val)) errors.push(`Field "${key}" must be one of: ${field.enum.join(', ')}`);
  }
  return { valid: errors.length === 0, errors };
}

export function coerce(data: Record<string, unknown>, schema: Schema): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };
  for (const [key, field] of Object.entries(schema)) {
    const val = result[key];
    if (val === undefined) continue;
    if (field.type === 'number' && typeof val === 'string') result[key] = parseFloat(val);
    if (field.type === 'boolean' && typeof val === 'string') result[key] = val === 'true';
    if (field.type === 'array' && !Array.isArray(val)) result[key] = [val];
  }
  return result;
}

export function applyDefaults(data: Record<string, unknown>, schema: Schema): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };
  for (const [key, field] of Object.entries(schema)) {
    if (result[key] === undefined && field.default !== undefined) result[key] = field.default;
  }
  return result;
}

export function requiredFields(schema: Schema): string[] {
  return Object.entries(schema).filter(([,f]) => f.required).map(([k]) => k);
}

export function optionalFields(schema: Schema): string[] {
  return Object.entries(schema).filter(([,f]) => !f.required).map(([k]) => k);
}

export function mergeSchemas(a: Schema, b: Schema): Schema { return { ...a, ...b }; }

export function pickFields(data: Record<string, unknown>, schema: Schema): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(schema)) if (key in data) result[key] = data[key];
  return result;
}

export function stripUnknown(data: Record<string, unknown>, schema: Schema): Record<string, unknown> {
  return pickFields(data, schema);
}
