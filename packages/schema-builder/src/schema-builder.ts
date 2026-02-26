// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { JsonSchema, JsonSchemaType, ValidationError, ValidationResult } from './types';

// ─── String Builder ──────────────────────────────────────────────────────────

export class StringSchemaBuilder {
  private schema: JsonSchema = { type: 'string' };

  minLength(n: number): this {
    this.schema.minLength = n;
    return this;
  }

  maxLength(n: number): this {
    this.schema.maxLength = n;
    return this;
  }

  pattern(regex: string): this {
    this.schema.pattern = regex;
    return this;
  }

  format(fmt: string): this {
    this.schema.format = fmt;
    return this;
  }

  enum(...values: string[]): this {
    this.schema.enum = values;
    return this;
  }

  nullable(): this {
    this.schema.nullable = true;
    const types = Array.isArray(this.schema.type) ? this.schema.type : [this.schema.type as JsonSchemaType];
    if (!types.includes('null')) {
      this.schema.type = [...types, 'null'];
    }
    return this;
  }

  optional(): this {
    // Marks for documentation; no structural change needed here
    return this;
  }

  default(v: unknown): this {
    this.schema.default = v;
    return this;
  }

  description(s: string): this {
    this.schema.description = s;
    return this;
  }

  title(s: string): this {
    this.schema.title = s;
    return this;
  }

  build(): JsonSchema {
    return { ...this.schema };
  }
}

// ─── Number Builder ───────────────────────────────────────────────────────────

export class NumberSchemaBuilder {
  private schema: JsonSchema = { type: 'number' };

  min(n: number): this {
    this.schema.minimum = n;
    return this;
  }

  max(n: number): this {
    this.schema.maximum = n;
    return this;
  }

  exclusiveMin(n: number): this {
    this.schema.exclusiveMinimum = n;
    return this;
  }

  exclusiveMax(n: number): this {
    this.schema.exclusiveMaximum = n;
    return this;
  }

  multipleOf(n: number): this {
    this.schema.multipleOf = n;
    return this;
  }

  integer(): this {
    this.schema.type = 'integer';
    return this;
  }

  nullable(): this {
    this.schema.nullable = true;
    const types = Array.isArray(this.schema.type) ? this.schema.type : [this.schema.type as JsonSchemaType];
    if (!types.includes('null')) {
      this.schema.type = [...types, 'null'];
    }
    return this;
  }

  optional(): this {
    return this;
  }

  default(v: unknown): this {
    this.schema.default = v;
    return this;
  }

  description(s: string): this {
    this.schema.description = s;
    return this;
  }

  title(s: string): this {
    this.schema.title = s;
    return this;
  }

  enum(...values: number[]): this {
    this.schema.enum = values;
    return this;
  }

  build(): JsonSchema {
    return { ...this.schema };
  }
}

// ─── Boolean Builder ──────────────────────────────────────────────────────────

export class BooleanSchemaBuilder {
  private schema: JsonSchema = { type: 'boolean' };

  nullable(): this {
    this.schema.nullable = true;
    const types = Array.isArray(this.schema.type) ? this.schema.type : [this.schema.type as JsonSchemaType];
    if (!types.includes('null')) {
      this.schema.type = [...types, 'null'];
    }
    return this;
  }

  default(v: unknown): this {
    this.schema.default = v;
    return this;
  }

  description(s: string): this {
    this.schema.description = s;
    return this;
  }

  build(): JsonSchema {
    return { ...this.schema };
  }
}

// ─── Object Builder ───────────────────────────────────────────────────────────

export class ObjectSchemaBuilder {
  private schema: JsonSchema;

  constructor(properties: Record<string, JsonSchema>) {
    this.schema = { type: 'object', properties: { ...properties } };
  }

  required(...keys: string[]): this {
    this.schema.required = keys;
    return this;
  }

  additionalProperties(v: boolean | JsonSchema): this {
    this.schema.additionalProperties = v;
    return this;
  }

  minProperties(n: number): this {
    this.schema.minProperties = n;
    return this;
  }

  maxProperties(n: number): this {
    this.schema.maxProperties = n;
    return this;
  }

  nullable(): this {
    this.schema.nullable = true;
    const types = Array.isArray(this.schema.type) ? this.schema.type : [this.schema.type as JsonSchemaType];
    if (!types.includes('null')) {
      this.schema.type = [...types, 'null'];
    }
    return this;
  }

  description(s: string): this {
    this.schema.description = s;
    return this;
  }

  title(s: string): this {
    this.schema.title = s;
    return this;
  }

  build(): JsonSchema {
    return { ...this.schema, properties: { ...(this.schema.properties ?? {}) } };
  }
}

// ─── Array Builder ────────────────────────────────────────────────────────────

export class ArraySchemaBuilder {
  private schema: JsonSchema;

  constructor(items: JsonSchema) {
    this.schema = { type: 'array', items };
  }

  minItems(n: number): this {
    this.schema.minItems = n;
    return this;
  }

  maxItems(n: number): this {
    this.schema.maxItems = n;
    return this;
  }

  uniqueItems(): this {
    this.schema.uniqueItems = true;
    return this;
  }

  nullable(): this {
    this.schema.nullable = true;
    const types = Array.isArray(this.schema.type) ? this.schema.type : [this.schema.type as JsonSchemaType];
    if (!types.includes('null')) {
      this.schema.type = [...types, 'null'];
    }
    return this;
  }

  description(s: string): this {
    this.schema.description = s;
    return this;
  }

  title(s: string): this {
    this.schema.title = s;
    return this;
  }

  build(): JsonSchema {
    return { ...this.schema };
  }
}

// ─── Fluent Factory Functions ─────────────────────────────────────────────────

export function string(): StringSchemaBuilder {
  return new StringSchemaBuilder();
}

export function number(): NumberSchemaBuilder {
  return new NumberSchemaBuilder();
}

export function boolean(): BooleanSchemaBuilder {
  return new BooleanSchemaBuilder();
}

export function object(properties: Record<string, JsonSchema>): ObjectSchemaBuilder {
  return new ObjectSchemaBuilder(properties);
}

export function array(items: JsonSchema): ArraySchemaBuilder {
  return new ArraySchemaBuilder(items);
}

export function literal(value: unknown): JsonSchema {
  return { enum: [value] };
}

export function union(...schemas: JsonSchema[]): JsonSchema {
  return { anyOf: schemas };
}

export function intersection(...schemas: JsonSchema[]): JsonSchema {
  return { allOf: schemas };
}

export function nullable(schema: JsonSchema): JsonSchema {
  return { anyOf: [schema, { type: 'null' }] };
}

export function optional(schema: JsonSchema): JsonSchema {
  // Returns the same schema; "optional" is a structural concept at the object level
  return { ...schema };
}

// ─── Internal Validation Helpers ─────────────────────────────────────────────

function getActualType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number' && isNaN(value)) return 'nan';
  return typeof value;
}

function isInteger(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value);
}

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

function validateDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(value) && !isNaN(Date.parse(value));
}

function validateUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function validateType(value: unknown, type: JsonSchemaType, path: string, errors: ValidationError[]): boolean {
  const actual = getActualType(value);
  if (type === 'integer') {
    if (!isInteger(value)) {
      errors.push({ path, message: `Expected integer, got ${actual}`, value, keyword: 'type' });
      return false;
    }
    return true;
  }
  if (actual !== type) {
    errors.push({ path, message: `Expected ${type}, got ${actual}`, value, keyword: 'type' });
    return false;
  }
  return true;
}

// ─── Core Validate Function ───────────────────────────────────────────────────

export function validate(value: unknown, schema: JsonSchema, path = ''): ValidationResult {
  const errors: ValidationError[] = [];
  _validate(value, schema, path, errors);
  return { valid: errors.length === 0, errors };
}

function _validate(value: unknown, schema: JsonSchema, path: string, errors: ValidationError[]): void {
  // Handle $ref (basic — not following references, just skip)
  if (schema.$ref !== undefined) return;

  // Type validation
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = getActualType(value);
    let typeOk = false;
    for (const t of types) {
      if (t === 'integer') {
        if (isInteger(value)) { typeOk = true; break; }
      } else if (actual === t) {
        typeOk = true;
        break;
      }
    }
    if (!typeOk) {
      errors.push({
        path,
        message: `Expected ${types.join(' | ')}, got ${actual}`,
        value,
        keyword: 'type',
      });
      // Still continue to collect other errors where possible
    }
  }

  // enum
  if (schema.enum !== undefined) {
    const match = schema.enum.some(e => JSON.stringify(e) === JSON.stringify(value));
    if (!match) {
      errors.push({ path, message: `Value must be one of: ${JSON.stringify(schema.enum)}`, value, keyword: 'enum' });
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path, message: `String length ${value.length} is less than minLength ${schema.minLength}`, value, keyword: 'minLength' });
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({ path, message: `String length ${value.length} exceeds maxLength ${schema.maxLength}`, value, keyword: 'maxLength' });
    }
    if (schema.pattern !== undefined) {
      const re = new RegExp(schema.pattern);
      if (!re.test(value)) {
        errors.push({ path, message: `String does not match pattern ${schema.pattern}`, value, keyword: 'pattern' });
      }
    }
    if (schema.format !== undefined) {
      let formatOk = true;
      switch (schema.format) {
        case 'email': formatOk = validateEmail(value); break;
        case 'url':
        case 'uri': formatOk = validateUrl(value); break;
        case 'date': formatOk = validateDate(value); break;
        case 'date-time': formatOk = validateDateTime(value); break;
        case 'uuid': formatOk = validateUuid(value); break;
      }
      if (!formatOk) {
        errors.push({ path, message: `String does not match format "${schema.format}"`, value, keyword: 'format' });
      }
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path, message: `Value ${value} is less than minimum ${schema.minimum}`, value, keyword: 'minimum' });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path, message: `Value ${value} exceeds maximum ${schema.maximum}`, value, keyword: 'maximum' });
    }
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) {
      errors.push({ path, message: `Value ${value} must be greater than ${schema.exclusiveMinimum}`, value, keyword: 'exclusiveMinimum' });
    }
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) {
      errors.push({ path, message: `Value ${value} must be less than ${schema.exclusiveMaximum}`, value, keyword: 'exclusiveMaximum' });
    }
    if (schema.multipleOf !== undefined && schema.multipleOf !== 0) {
      const remainder = value % schema.multipleOf;
      if (Math.abs(remainder) > Number.EPSILON) {
        errors.push({ path, message: `Value ${value} is not a multiple of ${schema.multipleOf}`, value, keyword: 'multipleOf' });
      }
    }
  }

  // Object validations
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (schema.minProperties !== undefined && keys.length < schema.minProperties) {
      errors.push({ path, message: `Object has ${keys.length} properties, minimum is ${schema.minProperties}`, value, keyword: 'minProperties' });
    }
    if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) {
      errors.push({ path, message: `Object has ${keys.length} properties, maximum is ${schema.maxProperties}`, value, keyword: 'maxProperties' });
    }

    if (schema.required !== undefined) {
      for (const req of schema.required) {
        if (!(req in obj)) {
          errors.push({ path, message: `Required property "${req}" is missing`, value, keyword: 'required' });
        }
      }
    }

    if (schema.properties !== undefined) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          _validate(obj[key], propSchema, path ? `${path}.${key}` : key, errors);
        }
      }
    }

    if (schema.additionalProperties !== undefined && schema.properties !== undefined) {
      const knownKeys = new Set(Object.keys(schema.properties));
      for (const key of keys) {
        if (!knownKeys.has(key)) {
          if (schema.additionalProperties === false) {
            errors.push({ path: path ? `${path}.${key}` : key, message: `Additional property "${key}" is not allowed`, value: obj[key], keyword: 'additionalProperties' });
          } else if (typeof schema.additionalProperties === 'object') {
            _validate(obj[key], schema.additionalProperties, path ? `${path}.${key}` : key, errors);
          }
        }
      }
    }
  }

  // Array validations
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({ path, message: `Array has ${value.length} items, minimum is ${schema.minItems}`, value, keyword: 'minItems' });
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({ path, message: `Array has ${value.length} items, maximum is ${schema.maxItems}`, value, keyword: 'maxItems' });
    }
    if (schema.uniqueItems === true) {
      const seen = new Set<string>();
      for (let i = 0; i < value.length; i++) {
        const serialized = JSON.stringify(value[i]);
        if (seen.has(serialized)) {
          errors.push({ path, message: `Array items must be unique; duplicate at index ${i}`, value: value[i], keyword: 'uniqueItems' });
        }
        seen.add(serialized);
      }
    }
    if (schema.items !== undefined) {
      if (Array.isArray(schema.items)) {
        // Tuple validation
        for (let i = 0; i < schema.items.length; i++) {
          if (i < value.length) {
            _validate(value[i], schema.items[i], `${path}[${i}]`, errors);
          }
        }
      } else {
        for (let i = 0; i < value.length; i++) {
          _validate(value[i], schema.items as JsonSchema, `${path}[${i}]`, errors);
        }
      }
    }
  }

  // Composition: allOf
  if (schema.allOf !== undefined) {
    for (let i = 0; i < schema.allOf.length; i++) {
      _validate(value, schema.allOf[i], path, errors);
    }
  }

  // Composition: anyOf
  if (schema.anyOf !== undefined) {
    const anyValid = schema.anyOf.some(s => validate(value, s, path).valid);
    if (!anyValid) {
      errors.push({ path, message: 'Value does not match any of the schemas in anyOf', value, keyword: 'anyOf' });
    }
  }

  // Composition: oneOf
  if (schema.oneOf !== undefined) {
    const matchCount = schema.oneOf.filter(s => validate(value, s, path).valid).length;
    if (matchCount !== 1) {
      errors.push({ path, message: `Value must match exactly one schema in oneOf (matched ${matchCount})`, value, keyword: 'oneOf' });
    }
  }

  // Composition: not
  if (schema.not !== undefined) {
    const notResult = validate(value, schema.not, path);
    if (notResult.valid) {
      errors.push({ path, message: 'Value must not match the schema in "not"', value, keyword: 'not' });
    }
  }

  // if/then/else
  if (schema.if !== undefined) {
    const ifResult = validate(value, schema.if, path);
    if (ifResult.valid && schema.then !== undefined) {
      _validate(value, schema.then, path, errors);
    } else if (!ifResult.valid && schema.else !== undefined) {
      _validate(value, schema.else, path, errors);
    }
  }
}

// ─── Convenience Validation Functions ────────────────────────────────────────

export function isValid(value: unknown, schema: JsonSchema): boolean {
  return validate(value, schema).valid;
}

export function validateMany(items: unknown[], schema: JsonSchema): ValidationResult[] {
  return items.map(item => validate(item, schema));
}

// ─── Coerce ───────────────────────────────────────────────────────────────────

export function coerce(value: unknown, schema: JsonSchema): unknown {
  const targetType = Array.isArray(schema.type)
    ? schema.type.find(t => t !== 'null')
    : schema.type;

  if (targetType === 'number' || targetType === 'integer') {
    if (typeof value === 'string') {
      const n = Number(value);
      if (!isNaN(n)) return targetType === 'integer' ? Math.trunc(n) : n;
    }
    if (typeof value === 'boolean') return value ? 1 : 0;
  }

  if (targetType === 'string') {
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value === null) return 'null';
  }

  if (targetType === 'boolean') {
    if (value === 'true' || value === 1) return true;
    if (value === 'false' || value === 0) return false;
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
    }
  }

  if (targetType === 'array') {
    if (!Array.isArray(value)) return [value];
  }

  return value;
}

// ─── Schema Utilities ─────────────────────────────────────────────────────────

export function merge(...schemas: JsonSchema[]): JsonSchema {
  const result: JsonSchema = { type: 'object', properties: {}, required: [] };
  for (const schema of schemas) {
    if (schema.properties) {
      result.properties = { ...(result.properties ?? {}), ...schema.properties };
    }
    if (schema.required) {
      const existing = result.required ?? [];
      result.required = Array.from(new Set([...existing, ...schema.required]));
    }
    if (schema.description) result.description = schema.description;
    if (schema.title) result.title = schema.title;
    if (schema.additionalProperties !== undefined) result.additionalProperties = schema.additionalProperties;
    if (schema.minProperties !== undefined) result.minProperties = schema.minProperties;
    if (schema.maxProperties !== undefined) result.maxProperties = schema.maxProperties;
  }
  if (result.required && result.required.length === 0) {
    delete result.required;
  }
  return result;
}

export function pick(schema: JsonSchema, keys: string[]): JsonSchema {
  const pickedProps: Record<string, JsonSchema> = {};
  const props = schema.properties ?? {};
  for (const key of keys) {
    if (key in props) {
      pickedProps[key] = props[key];
    }
  }
  const result: JsonSchema = { type: 'object', properties: pickedProps };
  if (schema.required) {
    const req = schema.required.filter(k => keys.includes(k));
    if (req.length > 0) result.required = req;
  }
  return result;
}

export function omit(schema: JsonSchema, keys: string[]): JsonSchema {
  const omittedProps: Record<string, JsonSchema> = {};
  const props = schema.properties ?? {};
  const keySet = new Set(keys);
  for (const [k, v] of Object.entries(props)) {
    if (!keySet.has(k)) {
      omittedProps[k] = v;
    }
  }
  const result: JsonSchema = { type: 'object', properties: omittedProps };
  if (schema.required) {
    const req = schema.required.filter(k => !keySet.has(k));
    if (req.length > 0) result.required = req;
  }
  return result;
}

export function partial(schema: JsonSchema): JsonSchema {
  return { ...schema, required: undefined };
}

export function required(schema: JsonSchema): JsonSchema {
  const props = schema.properties ?? {};
  return { ...schema, required: Object.keys(props) };
}

// ─── OpenAPI Schema Conversion ────────────────────────────────────────────────

export function toOpenApiSchema(schema: JsonSchema): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Copy most fields directly
  const directFields: (keyof JsonSchema)[] = [
    'type', 'title', 'description', 'format', 'enum', 'default', 'examples',
    'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
    'minLength', 'maxLength', 'pattern',
    'minItems', 'maxItems', 'uniqueItems',
    'minProperties', 'maxProperties',
    'required',
  ];

  for (const field of directFields) {
    if (schema[field] !== undefined) {
      result[field] = schema[field];
    }
  }

  // Handle nullable: OpenAPI 3.0 uses nullable:true alongside type
  if (schema.nullable === true) {
    result['nullable'] = true;
    // Remove 'null' from type array if present
    if (Array.isArray(schema.type)) {
      const filtered = (schema.type as JsonSchemaType[]).filter(t => t !== 'null');
      result['type'] = filtered.length === 1 ? filtered[0] : filtered;
    }
  }

  // Handle properties recursively
  if (schema.properties) {
    const convertedProps: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(schema.properties)) {
      convertedProps[k] = toOpenApiSchema(v);
    }
    result['properties'] = convertedProps;
  }

  // Handle additionalProperties
  if (schema.additionalProperties !== undefined) {
    if (typeof schema.additionalProperties === 'boolean') {
      result['additionalProperties'] = schema.additionalProperties;
    } else {
      result['additionalProperties'] = toOpenApiSchema(schema.additionalProperties);
    }
  }

  // Handle items
  if (schema.items !== undefined) {
    if (Array.isArray(schema.items)) {
      result['items'] = schema.items.map(toOpenApiSchema);
    } else {
      result['items'] = toOpenApiSchema(schema.items);
    }
  }

  // Handle composition
  if (schema.allOf) result['allOf'] = schema.allOf.map(toOpenApiSchema);
  if (schema.anyOf) result['anyOf'] = schema.anyOf.map(toOpenApiSchema);
  if (schema.oneOf) result['oneOf'] = schema.oneOf.map(toOpenApiSchema);
  if (schema.not) result['not'] = toOpenApiSchema(schema.not);

  return result;
}

// ─── TypeScript Type Generation ───────────────────────────────────────────────

export function schemaToTypeScript(schema: JsonSchema, name?: string): string {
  const typeStr = _schemaToTsType(schema, 0);
  if (name) {
    return `type ${name} = ${typeStr};`;
  }
  return typeStr;
}

function _schemaToTsType(schema: JsonSchema, depth: number): string {
  const indent = '  '.repeat(depth);
  const innerIndent = '  '.repeat(depth + 1);

  // anyOf / oneOf → union
  if (schema.anyOf) {
    return schema.anyOf.map(s => _schemaToTsType(s, depth)).join(' | ');
  }
  if (schema.oneOf) {
    return schema.oneOf.map(s => _schemaToTsType(s, depth)).join(' | ');
  }
  // allOf → intersection
  if (schema.allOf) {
    return schema.allOf.map(s => _schemaToTsType(s, depth)).join(' & ');
  }

  // enum
  if (schema.enum !== undefined) {
    return schema.enum.map(v => JSON.stringify(v)).join(' | ');
  }

  const types = Array.isArray(schema.type) ? schema.type : (schema.type ? [schema.type] : []);

  const tsTypes: string[] = [];
  for (const t of types) {
    switch (t) {
      case 'string': tsTypes.push('string'); break;
      case 'number':
      case 'integer': tsTypes.push('number'); break;
      case 'boolean': tsTypes.push('boolean'); break;
      case 'null': tsTypes.push('null'); break;
      case 'array': {
        if (schema.items && !Array.isArray(schema.items)) {
          tsTypes.push(`Array<${_schemaToTsType(schema.items, depth)}>`);
        } else if (Array.isArray(schema.items)) {
          const tupleTypes = schema.items.map(s => _schemaToTsType(s, depth)).join(', ');
          tsTypes.push(`[${tupleTypes}]`);
        } else {
          tsTypes.push('unknown[]');
        }
        break;
      }
      case 'object': {
        if (schema.properties) {
          const required = new Set(schema.required ?? []);
          const lines: string[] = [];
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            const opt = required.has(key) ? '' : '?';
            lines.push(`${innerIndent}${key}${opt}: ${_schemaToTsType(propSchema, depth + 1)};`);
          }
          if (schema.additionalProperties === true) {
            lines.push(`${innerIndent}[key: string]: unknown;`);
          } else if (typeof schema.additionalProperties === 'object') {
            lines.push(`${innerIndent}[key: string]: ${_schemaToTsType(schema.additionalProperties, depth + 1)};`);
          }
          tsTypes.push(`{\n${lines.join('\n')}\n${indent}}`);
        } else {
          tsTypes.push('Record<string, unknown>');
        }
        break;
      }
      default: tsTypes.push('unknown');
    }
  }

  if (tsTypes.length === 0) return 'unknown';
  return tsTypes.join(' | ');
}

// ─── Schema Statistics ────────────────────────────────────────────────────────

export interface SchemaStats {
  fieldCount: number;
  requiredCount: number;
  optionalCount: number;
  depth: number;
  hasEnum: boolean;
  hasComposition: boolean;
}

export function schemaStats(schema: JsonSchema): SchemaStats {
  return _computeStats(schema);
}

function _computeStats(schema: JsonSchema): SchemaStats {
  const fieldCount = schema.properties ? Object.keys(schema.properties).length : 0;
  const requiredCount = schema.required ? schema.required.length : 0;
  const optionalCount = fieldCount - requiredCount;
  const depth = _computeDepth(schema);
  const hasEnum = schema.enum !== undefined || _hasEnumInProperties(schema);
  const hasComposition = !!(schema.allOf || schema.anyOf || schema.oneOf || schema.not);

  return { fieldCount, requiredCount, optionalCount, depth, hasEnum, hasComposition };
}

function _hasEnumInProperties(schema: JsonSchema): boolean {
  if (!schema.properties) return false;
  return Object.values(schema.properties).some(p => p.enum !== undefined || _hasEnumInProperties(p));
}

function _computeDepth(schema: JsonSchema, current = 0): number {
  if (!schema.properties) {
    if (schema.items && !Array.isArray(schema.items)) {
      return _computeDepth(schema.items as JsonSchema, current + 1);
    }
    return current;
  }
  const childDepths = Object.values(schema.properties).map(p => _computeDepth(p, current + 1));
  return childDepths.length > 0 ? Math.max(...childDepths) : current;
}
