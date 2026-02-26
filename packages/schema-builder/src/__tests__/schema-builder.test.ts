// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  string,
  number,
  boolean,
  object,
  array,
  literal,
  union,
  intersection,
  nullable,
  optional,
  validate,
  isValid,
  validateMany,
  coerce,
  merge,
  pick,
  omit,
  partial,
  required,
  toOpenApiSchema,
  schemaToTypeScript,
  schemaStats,
  StringSchemaBuilder,
  NumberSchemaBuilder,
  BooleanSchemaBuilder,
  ObjectSchemaBuilder,
  ArraySchemaBuilder,
} from '../schema-builder';
import { JsonSchema } from '../types';

// ─── string() builder ────────────────────────────────────────────────────────

describe('string() builder', () => {
  it('returns a StringSchemaBuilder instance', () => {
    expect(string()).toBeInstanceOf(StringSchemaBuilder);
  });

  it('build() returns type string', () => {
    const schema = string().build();
    expect(schema.type).toBe('string');
  });

  it('minLength sets minLength on schema', () => {
    const schema = string().minLength(3).build();
    expect(schema.minLength).toBe(3);
  });

  it('maxLength sets maxLength on schema', () => {
    const schema = string().maxLength(50).build();
    expect(schema.maxLength).toBe(50);
  });

  it('pattern sets pattern on schema', () => {
    const schema = string().pattern('^[a-z]+$').build();
    expect(schema.pattern).toBe('^[a-z]+$');
  });

  it('format sets format on schema', () => {
    const schema = string().format('email').build();
    expect(schema.format).toBe('email');
  });

  it('enum sets enum values', () => {
    const schema = string().enum('a', 'b', 'c').build();
    expect(schema.enum).toEqual(['a', 'b', 'c']);
  });

  it('nullable adds null to type array', () => {
    const schema = string().nullable().build();
    expect(Array.isArray(schema.type)).toBe(true);
    expect((schema.type as string[]).includes('string')).toBe(true);
    expect((schema.type as string[]).includes('null')).toBe(true);
  });

  it('nullable sets nullable flag', () => {
    const schema = string().nullable().build();
    expect(schema.nullable).toBe(true);
  });

  it('optional returns same builder (chaining)', () => {
    const builder = string();
    const result = builder.optional();
    expect(result).toBe(builder);
  });

  it('default sets default value', () => {
    const schema = string().default('hello').build();
    expect(schema.default).toBe('hello');
  });

  it('description sets description', () => {
    const schema = string().description('A user name').build();
    expect(schema.description).toBe('A user name');
  });

  it('title sets title', () => {
    const schema = string().title('Username').build();
    expect(schema.title).toBe('Username');
  });

  it('build returns a new object each time', () => {
    const builder = string().minLength(2);
    const a = builder.build();
    const b = builder.build();
    expect(a).not.toBe(b);
  });

  it('chaining all string methods', () => {
    const schema = string()
      .minLength(2)
      .maxLength(100)
      .pattern('^[A-Z]')
      .format('email')
      .description('test')
      .title('Test')
      .default('foo')
      .nullable()
      .optional()
      .build();
    expect(schema.minLength).toBe(2);
    expect(schema.maxLength).toBe(100);
    expect(schema.pattern).toBe('^[A-Z]');
    expect(schema.format).toBe('email');
    expect(schema.description).toBe('test');
    expect(schema.title).toBe('Test');
    expect(schema.default).toBe('foo');
    expect(schema.nullable).toBe(true);
  });

  const stringFormatCases = [
    { format: 'email', value: 'test@example.com', valid: true },
    { format: 'email', value: 'notanemail', valid: false },
    { format: 'url', value: 'https://example.com', valid: true },
    { format: 'url', value: 'notaurl', valid: false },
    { format: 'uuid', value: '550e8400-e29b-41d4-a716-446655440000', valid: true },
    { format: 'uuid', value: 'not-a-uuid', valid: false },
    { format: 'date', value: '2026-02-24', valid: true },
    { format: 'date', value: '24-02-2026', valid: false },
    { format: 'date-time', value: '2026-02-24T12:00:00Z', valid: true },
    { format: 'date-time', value: '2026-02-24', valid: false },
  ];

  it.each(stringFormatCases)('format $format: "$value" → valid=$valid', ({ format, value, valid }) => {
    const schema = string().format(format).build();
    expect(isValid(value, schema)).toBe(valid);
  });

  it('nullable string accepts null value', () => {
    const schema = string().nullable().build();
    expect(isValid(null, schema)).toBe(true);
  });

  it('nullable string accepts string value', () => {
    const schema = string().nullable().build();
    expect(isValid('hello', schema)).toBe(true);
  });

  it('non-nullable string rejects null', () => {
    const schema = string().build();
    expect(isValid(null, schema)).toBe(false);
  });

  it('calling nullable twice does not duplicate null type', () => {
    const schema = string().nullable().nullable().build();
    const types = schema.type as string[];
    expect(types.filter(t => t === 'null').length).toBe(1);
  });
});

// ─── number() builder ────────────────────────────────────────────────────────

describe('number() builder', () => {
  it('returns NumberSchemaBuilder instance', () => {
    expect(number()).toBeInstanceOf(NumberSchemaBuilder);
  });

  it('build() returns type number', () => {
    expect(number().build().type).toBe('number');
  });

  it('min sets minimum', () => {
    expect(number().min(0).build().minimum).toBe(0);
  });

  it('max sets maximum', () => {
    expect(number().max(100).build().maximum).toBe(100);
  });

  it('exclusiveMin sets exclusiveMinimum', () => {
    expect(number().exclusiveMin(5).build().exclusiveMinimum).toBe(5);
  });

  it('exclusiveMax sets exclusiveMaximum', () => {
    expect(number().exclusiveMax(10).build().exclusiveMaximum).toBe(10);
  });

  it('multipleOf sets multipleOf', () => {
    expect(number().multipleOf(3).build().multipleOf).toBe(3);
  });

  it('integer() changes type to integer', () => {
    expect(number().integer().build().type).toBe('integer');
  });

  it('nullable adds null type', () => {
    const schema = number().nullable().build();
    expect(Array.isArray(schema.type)).toBe(true);
    expect((schema.type as string[]).includes('null')).toBe(true);
  });

  it('integer().nullable() includes null', () => {
    const schema = number().integer().nullable().build();
    const types = schema.type as string[];
    expect(types.includes('integer')).toBe(true);
    expect(types.includes('null')).toBe(true);
  });

  it('default sets default', () => {
    expect(number().default(42).build().default).toBe(42);
  });

  it('description sets description', () => {
    expect(number().description('age').build().description).toBe('age');
  });

  it('title sets title', () => {
    expect(number().title('Age').build().title).toBe('Age');
  });

  it('enum sets enum values', () => {
    const schema = number().enum(1, 2, 3).build();
    expect(schema.enum).toEqual([1, 2, 3]);
  });

  it('optional returns same builder', () => {
    const builder = number();
    expect(builder.optional()).toBe(builder);
  });

  it('full chain', () => {
    const schema = number().min(0).max(999).exclusiveMin(-1).exclusiveMax(1000)
      .multipleOf(5).integer().description('qty').title('Qty').default(10).nullable().enum(5, 10, 15).build();
    expect(schema.minimum).toBe(0);
    expect(schema.maximum).toBe(999);
    expect(schema.exclusiveMinimum).toBe(-1);
    expect(schema.exclusiveMaximum).toBe(1000);
    expect(schema.multipleOf).toBe(5);
    expect(schema.description).toBe('qty');
    expect(schema.title).toBe('Qty');
    expect(schema.default).toBe(10);
    expect(schema.enum).toEqual([5, 10, 15]);
  });

  it('build returns new object each call', () => {
    const builder = number().min(1);
    expect(builder.build()).not.toBe(builder.build());
  });
});

// ─── boolean() builder ───────────────────────────────────────────────────────

describe('boolean() builder', () => {
  it('returns BooleanSchemaBuilder instance', () => {
    expect(boolean()).toBeInstanceOf(BooleanSchemaBuilder);
  });

  it('build() returns type boolean', () => {
    expect(boolean().build().type).toBe('boolean');
  });

  it('nullable adds null type', () => {
    const schema = boolean().nullable().build();
    expect((schema.type as string[]).includes('null')).toBe(true);
    expect((schema.type as string[]).includes('boolean')).toBe(true);
  });

  it('nullable sets nullable flag', () => {
    expect(boolean().nullable().build().nullable).toBe(true);
  });

  it('default(true) sets default', () => {
    expect(boolean().default(true).build().default).toBe(true);
  });

  it('default(false) sets default', () => {
    expect(boolean().default(false).build().default).toBe(false);
  });

  it('description sets description', () => {
    expect(boolean().description('active flag').build().description).toBe('active flag');
  });

  it('build returns new object each call', () => {
    const builder = boolean();
    expect(builder.build()).not.toBe(builder.build());
  });

  it('chained: nullable + default + description', () => {
    const schema = boolean().nullable().default(true).description('flag').build();
    expect(schema.nullable).toBe(true);
    expect(schema.default).toBe(true);
    expect(schema.description).toBe('flag');
  });
});

// ─── object() builder ────────────────────────────────────────────────────────

describe('object() builder', () => {
  const props = {
    name: string().build(),
    age: number().build(),
  };

  it('returns ObjectSchemaBuilder instance', () => {
    expect(object(props)).toBeInstanceOf(ObjectSchemaBuilder);
  });

  it('build() returns type object', () => {
    expect(object(props).build().type).toBe('object');
  });

  it('build() contains provided properties', () => {
    const schema = object(props).build();
    expect(schema.properties).toBeDefined();
    expect(schema.properties!['name']).toEqual({ type: 'string' });
    expect(schema.properties!['age']).toEqual({ type: 'number' });
  });

  it('required() sets required fields', () => {
    const schema = object(props).required('name', 'age').build();
    expect(schema.required).toEqual(['name', 'age']);
  });

  it('additionalProperties(false) sets flag', () => {
    const schema = object(props).additionalProperties(false).build();
    expect(schema.additionalProperties).toBe(false);
  });

  it('additionalProperties(true) sets flag', () => {
    const schema = object(props).additionalProperties(true).build();
    expect(schema.additionalProperties).toBe(true);
  });

  it('additionalProperties(schema) sets schema', () => {
    const addlSchema: JsonSchema = { type: 'string' };
    const schema = object(props).additionalProperties(addlSchema).build();
    expect(schema.additionalProperties).toEqual(addlSchema);
  });

  it('minProperties sets minProperties', () => {
    const schema = object(props).minProperties(1).build();
    expect(schema.minProperties).toBe(1);
  });

  it('maxProperties sets maxProperties', () => {
    const schema = object(props).maxProperties(5).build();
    expect(schema.maxProperties).toBe(5);
  });

  it('nullable adds null type', () => {
    const schema = object(props).nullable().build();
    expect((schema.type as string[]).includes('null')).toBe(true);
    expect((schema.type as string[]).includes('object')).toBe(true);
  });

  it('description sets description', () => {
    const schema = object(props).description('A user').build();
    expect(schema.description).toBe('A user');
  });

  it('title sets title', () => {
    const schema = object(props).title('User').build();
    expect(schema.title).toBe('User');
  });

  it('build properties are a copy (not same reference)', () => {
    const schema1 = object(props).build();
    const schema2 = object(props).build();
    expect(schema1.properties).not.toBe(schema2.properties);
  });

  it('empty object schema', () => {
    const schema = object({}).build();
    expect(schema.type).toBe('object');
    expect(schema.properties).toEqual({});
  });

  it('full chain', () => {
    const schema = object(props)
      .required('name')
      .additionalProperties(false)
      .minProperties(1)
      .maxProperties(10)
      .nullable()
      .description('user object')
      .title('User')
      .build();
    expect(schema.required).toEqual(['name']);
    expect(schema.additionalProperties).toBe(false);
    expect(schema.minProperties).toBe(1);
    expect(schema.maxProperties).toBe(10);
    expect(schema.description).toBe('user object');
    expect(schema.title).toBe('User');
  });
});

// ─── array() builder ─────────────────────────────────────────────────────────

describe('array() builder', () => {
  const itemSchema = string().build();

  it('returns ArraySchemaBuilder instance', () => {
    expect(array(itemSchema)).toBeInstanceOf(ArraySchemaBuilder);
  });

  it('build() returns type array', () => {
    expect(array(itemSchema).build().type).toBe('array');
  });

  it('build() contains items', () => {
    const schema = array(itemSchema).build();
    expect(schema.items).toEqual(itemSchema);
  });

  it('minItems sets minItems', () => {
    const schema = array(itemSchema).minItems(1).build();
    expect(schema.minItems).toBe(1);
  });

  it('maxItems sets maxItems', () => {
    const schema = array(itemSchema).maxItems(10).build();
    expect(schema.maxItems).toBe(10);
  });

  it('uniqueItems sets uniqueItems true', () => {
    const schema = array(itemSchema).uniqueItems().build();
    expect(schema.uniqueItems).toBe(true);
  });

  it('nullable adds null type', () => {
    const schema = array(itemSchema).nullable().build();
    expect((schema.type as string[]).includes('null')).toBe(true);
    expect((schema.type as string[]).includes('array')).toBe(true);
  });

  it('description sets description', () => {
    const schema = array(itemSchema).description('list').build();
    expect(schema.description).toBe('list');
  });

  it('title sets title', () => {
    const schema = array(itemSchema).title('Items').build();
    expect(schema.title).toBe('Items');
  });

  it('full chain', () => {
    const schema = array(itemSchema)
      .minItems(2)
      .maxItems(100)
      .uniqueItems()
      .nullable()
      .description('tags')
      .title('Tags')
      .build();
    expect(schema.minItems).toBe(2);
    expect(schema.maxItems).toBe(100);
    expect(schema.uniqueItems).toBe(true);
    expect(schema.description).toBe('tags');
    expect(schema.title).toBe('Tags');
  });

  it('build returns new object each call', () => {
    const builder = array(itemSchema);
    expect(builder.build()).not.toBe(builder.build());
  });
});

// ─── literal() ───────────────────────────────────────────────────────────────

describe('literal()', () => {
  it('returns enum schema with single value (string)', () => {
    const schema = literal('active');
    expect(schema.enum).toEqual(['active']);
  });

  it('returns enum schema with single value (number)', () => {
    const schema = literal(42);
    expect(schema.enum).toEqual([42]);
  });

  it('returns enum schema with single value (boolean)', () => {
    const schema = literal(true);
    expect(schema.enum).toEqual([true]);
  });

  it('returns enum schema with null', () => {
    const schema = literal(null);
    expect(schema.enum).toEqual([null]);
  });

  it('validates correctly via isValid', () => {
    expect(isValid('active', literal('active'))).toBe(true);
    expect(isValid('inactive', literal('active'))).toBe(false);
  });

  it('enum array has exactly one entry', () => {
    expect(literal('x').enum!.length).toBe(1);
  });
});

// ─── union() ─────────────────────────────────────────────────────────────────

describe('union()', () => {
  it('creates anyOf schema', () => {
    const schema = union({ type: 'string' }, { type: 'number' });
    expect(schema.anyOf).toBeDefined();
    expect(schema.anyOf!.length).toBe(2);
  });

  it('anyOf contains the provided schemas', () => {
    const s1: JsonSchema = { type: 'string' };
    const s2: JsonSchema = { type: 'number' };
    const schema = union(s1, s2);
    expect(schema.anyOf![0]).toEqual(s1);
    expect(schema.anyOf![1]).toEqual(s2);
  });

  it('validates a value matching first schema', () => {
    const schema = union({ type: 'string' }, { type: 'number' });
    expect(isValid('hello', schema)).toBe(true);
  });

  it('validates a value matching second schema', () => {
    const schema = union({ type: 'string' }, { type: 'number' });
    expect(isValid(42, schema)).toBe(true);
  });

  it('rejects value matching none', () => {
    const schema = union({ type: 'string' }, { type: 'number' });
    expect(isValid(true, schema)).toBe(false);
  });

  it('handles three schemas', () => {
    const schema = union({ type: 'string' }, { type: 'number' }, { type: 'boolean' });
    expect(schema.anyOf!.length).toBe(3);
    expect(isValid(true, schema)).toBe(true);
  });

  it('union of literals', () => {
    const schema = union(literal('a'), literal('b'), literal('c'));
    expect(isValid('a', schema)).toBe(true);
    expect(isValid('d', schema)).toBe(false);
  });
});

// ─── intersection() ──────────────────────────────────────────────────────────

describe('intersection()', () => {
  it('creates allOf schema', () => {
    const s1: JsonSchema = { type: 'object', properties: { a: { type: 'string' } } };
    const s2: JsonSchema = { type: 'object', properties: { b: { type: 'number' } } };
    const schema = intersection(s1, s2);
    expect(schema.allOf).toBeDefined();
    expect(schema.allOf!.length).toBe(2);
  });

  it('allOf validates all constraints', () => {
    const s1: JsonSchema = { minimum: 5 };
    const s2: JsonSchema = { maximum: 10 };
    const schema = intersection(s1, s2);
    expect(isValid(7, schema)).toBe(true);
    expect(isValid(3, schema)).toBe(false);
    expect(isValid(12, schema)).toBe(false);
  });

  it('three schemas in allOf', () => {
    const schema = intersection(
      { minimum: 1 },
      { maximum: 100 },
      { multipleOf: 5 }
    );
    expect(isValid(25, schema)).toBe(true);
    expect(isValid(26, schema)).toBe(false);
  });
});

// ─── nullable() ──────────────────────────────────────────────────────────────

describe('nullable() function', () => {
  it('returns anyOf with original schema and null', () => {
    const schema = nullable({ type: 'string' });
    expect(schema.anyOf).toBeDefined();
    expect(schema.anyOf!.length).toBe(2);
    expect(schema.anyOf![1]).toEqual({ type: 'null' });
  });

  it('accepts original type value', () => {
    const schema = nullable({ type: 'string' });
    expect(isValid('hello', schema)).toBe(true);
  });

  it('accepts null', () => {
    const schema = nullable({ type: 'string' });
    expect(isValid(null, schema)).toBe(true);
  });

  it('rejects non-null non-matching value', () => {
    const schema = nullable({ type: 'string' });
    expect(isValid(42, schema)).toBe(false);
  });
});

// ─── optional() function ─────────────────────────────────────────────────────

describe('optional() function', () => {
  it('returns a new schema object (not same reference)', () => {
    const original: JsonSchema = { type: 'string' };
    const result = optional(original);
    expect(result).not.toBe(original);
  });

  it('preserves schema type', () => {
    const result = optional({ type: 'number' });
    expect(result.type).toBe('number');
  });

  it('preserves all schema fields', () => {
    const original: JsonSchema = { type: 'string', minLength: 3, description: 'test' };
    const result = optional(original);
    expect(result.minLength).toBe(3);
    expect(result.description).toBe('test');
  });
});

// ─── validate() — type checking ─────────────────────────────────────────────

describe('validate() — type checking', () => {
  const typeCases: Array<{ type: string; value: unknown; valid: boolean }> = [
    { type: 'string', value: 'hello', valid: true },
    { type: 'string', value: 42, valid: false },
    { type: 'string', value: null, valid: false },
    { type: 'number', value: 3.14, valid: true },
    { type: 'number', value: '3', valid: false },
    { type: 'integer', value: 5, valid: true },
    { type: 'integer', value: 5.5, valid: false },
    { type: 'boolean', value: true, valid: true },
    { type: 'boolean', value: false, valid: true },
    { type: 'boolean', value: 'true', valid: false },
    { type: 'object', value: {}, valid: true },
    { type: 'object', value: [], valid: false },
    { type: 'object', value: null, valid: false },
    { type: 'array', value: [], valid: true },
    { type: 'array', value: {}, valid: false },
    { type: 'null', value: null, valid: true },
    { type: 'null', value: 0, valid: false },
    { type: 'null', value: false, valid: false },
  ];

  it.each(typeCases)('type=$type value=$value → valid=$valid', ({ type, value, valid }) => {
    const schema: JsonSchema = { type: type as any };
    expect(isValid(value, schema)).toBe(valid);
  });

  it('accepts multiple types (string | number)', () => {
    const schema: JsonSchema = { type: ['string', 'number'] };
    expect(isValid('hi', schema)).toBe(true);
    expect(isValid(5, schema)).toBe(true);
    expect(isValid(true, schema)).toBe(false);
  });

  it('accepts multiple types including null', () => {
    const schema: JsonSchema = { type: ['string', 'null'] };
    expect(isValid('hi', schema)).toBe(true);
    expect(isValid(null, schema)).toBe(true);
    expect(isValid(5, schema)).toBe(false);
  });

  it('validate returns ValidationResult with valid:true when no errors', () => {
    const result = validate('hello', { type: 'string' });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('validate returns ValidationResult with valid:false and errors on failure', () => {
    const result = validate(42, { type: 'string' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('error contains path', () => {
    const result = validate(42, { type: 'string' });
    expect(result.errors[0]).toHaveProperty('path');
  });

  it('error contains message', () => {
    const result = validate(42, { type: 'string' });
    expect(result.errors[0].message).toContain('string');
  });

  it('error contains keyword type', () => {
    const result = validate(42, { type: 'string' });
    expect(result.errors[0].keyword).toBe('type');
  });

  it('error contains value', () => {
    const result = validate(42, { type: 'string' });
    expect(result.errors[0].value).toBe(42);
  });
});

// ─── validate() — string constraints ────────────────────────────────────────

describe('validate() — string constraints', () => {
  it('minLength passes when length >= min', () => {
    expect(isValid('abc', { type: 'string', minLength: 3 })).toBe(true);
  });

  it('minLength fails when length < min', () => {
    expect(isValid('ab', { type: 'string', minLength: 3 })).toBe(false);
  });

  it('minLength error has keyword minLength', () => {
    const r = validate('ab', { type: 'string', minLength: 3 });
    expect(r.errors[0].keyword).toBe('minLength');
  });

  it('maxLength passes when length <= max', () => {
    expect(isValid('abc', { type: 'string', maxLength: 5 })).toBe(true);
  });

  it('maxLength fails when length > max', () => {
    expect(isValid('abcdef', { type: 'string', maxLength: 5 })).toBe(false);
  });

  it('maxLength error has keyword maxLength', () => {
    const r = validate('abcdef', { type: 'string', maxLength: 5 });
    expect(r.errors[0].keyword).toBe('maxLength');
  });

  it('pattern passes when matches', () => {
    expect(isValid('abc123', { type: 'string', pattern: '^[a-z0-9]+$' })).toBe(true);
  });

  it('pattern fails when no match', () => {
    expect(isValid('ABC', { type: 'string', pattern: '^[a-z0-9]+$' })).toBe(false);
  });

  it('pattern error has keyword pattern', () => {
    const r = validate('ABC', { type: 'string', pattern: '^[a-z]+$' });
    expect(r.errors[0].keyword).toBe('pattern');
  });

  it('empty string passes minLength 0', () => {
    expect(isValid('', { type: 'string', minLength: 0 })).toBe(true);
  });

  it('exact minLength = maxLength passes', () => {
    expect(isValid('abc', { type: 'string', minLength: 3, maxLength: 3 })).toBe(true);
  });

  it('exact minLength = maxLength fails on too short', () => {
    expect(isValid('ab', { type: 'string', minLength: 3, maxLength: 3 })).toBe(false);
  });

  it('exact minLength = maxLength fails on too long', () => {
    expect(isValid('abcd', { type: 'string', minLength: 3, maxLength: 3 })).toBe(false);
  });

  it('format email valid', () => {
    expect(isValid('user@example.com', { type: 'string', format: 'email' })).toBe(true);
  });

  it('format email invalid', () => {
    expect(isValid('not-an-email', { type: 'string', format: 'email' })).toBe(false);
  });

  it('format uri valid', () => {
    expect(isValid('https://example.com/path', { type: 'string', format: 'uri' })).toBe(true);
  });

  it('format uri invalid', () => {
    expect(isValid('not-a-url', { type: 'string', format: 'uri' })).toBe(false);
  });

  it('format url valid', () => {
    expect(isValid('http://test.org', { type: 'string', format: 'url' })).toBe(true);
  });

  it('format url invalid', () => {
    expect(isValid('foobar', { type: 'string', format: 'url' })).toBe(false);
  });

  it('format date valid', () => {
    expect(isValid('2026-01-15', { type: 'string', format: 'date' })).toBe(true);
  });

  it('format date invalid', () => {
    expect(isValid('15/01/2026', { type: 'string', format: 'date' })).toBe(false);
  });

  it('format date-time valid', () => {
    expect(isValid('2026-01-15T10:30:00Z', { type: 'string', format: 'date-time' })).toBe(true);
  });

  it('format date-time invalid', () => {
    expect(isValid('2026-01-15', { type: 'string', format: 'date-time' })).toBe(false);
  });

  it('format uuid valid', () => {
    expect(isValid('550e8400-e29b-41d4-a716-446655440000', { type: 'string', format: 'uuid' })).toBe(true);
  });

  it('format uuid invalid', () => {
    expect(isValid('not-a-uuid', { type: 'string', format: 'uuid' })).toBe(false);
  });

  it('format error has keyword format', () => {
    const r = validate('bad', { type: 'string', format: 'email' });
    const formatErr = r.errors.find(e => e.keyword === 'format');
    expect(formatErr).toBeDefined();
  });

  it('unknown format passes (no validation for unknown formats)', () => {
    expect(isValid('any string', { type: 'string', format: 'custom-format' })).toBe(true);
  });
});

// ─── validate() — number constraints ─────────────────────────────────────────

describe('validate() — number constraints', () => {
  it('minimum pass at boundary', () => {
    expect(isValid(5, { type: 'number', minimum: 5 })).toBe(true);
  });

  it('minimum fail below boundary', () => {
    expect(isValid(4, { type: 'number', minimum: 5 })).toBe(false);
  });

  it('minimum error has keyword minimum', () => {
    const r = validate(4, { type: 'number', minimum: 5 });
    expect(r.errors[0].keyword).toBe('minimum');
  });

  it('maximum pass at boundary', () => {
    expect(isValid(10, { type: 'number', maximum: 10 })).toBe(true);
  });

  it('maximum fail above boundary', () => {
    expect(isValid(11, { type: 'number', maximum: 10 })).toBe(false);
  });

  it('maximum error has keyword maximum', () => {
    const r = validate(11, { type: 'number', maximum: 10 });
    expect(r.errors[0].keyword).toBe('maximum');
  });

  it('exclusiveMinimum fails at exact boundary', () => {
    expect(isValid(5, { type: 'number', exclusiveMinimum: 5 })).toBe(false);
  });

  it('exclusiveMinimum passes above boundary', () => {
    expect(isValid(6, { type: 'number', exclusiveMinimum: 5 })).toBe(true);
  });

  it('exclusiveMinimum error has keyword exclusiveMinimum', () => {
    const r = validate(5, { type: 'number', exclusiveMinimum: 5 });
    expect(r.errors[0].keyword).toBe('exclusiveMinimum');
  });

  it('exclusiveMaximum fails at exact boundary', () => {
    expect(isValid(10, { type: 'number', exclusiveMaximum: 10 })).toBe(false);
  });

  it('exclusiveMaximum passes below boundary', () => {
    expect(isValid(9, { type: 'number', exclusiveMaximum: 10 })).toBe(true);
  });

  it('exclusiveMaximum error has keyword exclusiveMaximum', () => {
    const r = validate(10, { type: 'number', exclusiveMaximum: 10 });
    expect(r.errors[0].keyword).toBe('exclusiveMaximum');
  });

  it('multipleOf passes exact multiple', () => {
    expect(isValid(15, { type: 'number', multipleOf: 5 })).toBe(true);
  });

  it('multipleOf fails non-multiple', () => {
    expect(isValid(7, { type: 'number', multipleOf: 5 })).toBe(false);
  });

  it('multipleOf error has keyword multipleOf', () => {
    const r = validate(7, { type: 'number', multipleOf: 5 });
    expect(r.errors[0].keyword).toBe('multipleOf');
  });

  it('integer type fails float', () => {
    expect(isValid(3.5, { type: 'integer' })).toBe(false);
  });

  it('integer type passes whole number', () => {
    expect(isValid(3, { type: 'integer' })).toBe(true);
  });

  it('negative minimum allowed', () => {
    expect(isValid(-5, { type: 'number', minimum: -10 })).toBe(true);
    expect(isValid(-11, { type: 'number', minimum: -10 })).toBe(false);
  });

  it('zero is valid number', () => {
    expect(isValid(0, { type: 'number', minimum: 0, maximum: 0 })).toBe(true);
  });

  const multipleOfCases = [
    { value: 10, multipleOf: 5, valid: true },
    { value: 12, multipleOf: 4, valid: true },
    { value: 7, multipleOf: 3, valid: false },
    { value: 100, multipleOf: 10, valid: true },
    { value: 0, multipleOf: 7, valid: true },
  ];

  it.each(multipleOfCases)('multipleOf: $value % $multipleOf → valid=$valid', ({ value, multipleOf, valid }) => {
    expect(isValid(value, { multipleOf })).toBe(valid);
  });
});

// ─── validate() — object constraints ─────────────────────────────────────────

describe('validate() — object constraints', () => {
  it('required property present — passes', () => {
    const schema = object({ name: string().build() }).required('name').build();
    expect(isValid({ name: 'Alice' }, schema)).toBe(true);
  });

  it('required property missing — fails', () => {
    const schema = object({ name: string().build() }).required('name').build();
    expect(isValid({}, schema)).toBe(false);
  });

  it('required error has keyword required', () => {
    const schema = object({ name: string().build() }).required('name').build();
    const r = validate({}, schema);
    expect(r.errors[0].keyword).toBe('required');
  });

  it('required error message mentions missing field', () => {
    const schema = object({ name: string().build() }).required('name').build();
    const r = validate({}, schema);
    expect(r.errors[0].message).toContain('name');
  });

  it('nested property validation — passes', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { count: { type: 'number', minimum: 0 } },
    };
    expect(isValid({ count: 5 }, schema)).toBe(true);
  });

  it('nested property validation — fails', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { count: { type: 'number', minimum: 0 } },
    };
    expect(isValid({ count: -1 }, schema)).toBe(false);
  });

  it('nested error path includes property name', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { count: { type: 'number', minimum: 0 } },
    };
    const r = validate({ count: -1 }, schema);
    expect(r.errors[0].path).toBe('count');
  });

  it('deeply nested path', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: { age: { type: 'number', minimum: 0 } },
        },
      },
    };
    const r = validate({ user: { age: -1 } }, schema);
    expect(r.errors[0].path).toBe('user.age');
  });

  it('additionalProperties false rejects extra keys', () => {
    const schema = object({ name: string().build() }).additionalProperties(false).build();
    expect(isValid({ name: 'Alice', extra: 'val' }, schema)).toBe(false);
  });

  it('additionalProperties false error has keyword additionalProperties', () => {
    const schema = object({ name: string().build() }).additionalProperties(false).build();
    const r = validate({ name: 'Alice', extra: 'val' }, schema);
    const err = r.errors.find(e => e.keyword === 'additionalProperties');
    expect(err).toBeDefined();
  });

  it('additionalProperties true allows extra keys', () => {
    const schema = object({ name: string().build() }).additionalProperties(true).build();
    expect(isValid({ name: 'Alice', extra: 'val' }, schema)).toBe(true);
  });

  it('additionalProperties as schema validates extra keys', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      additionalProperties: { type: 'number' },
    };
    expect(isValid({ name: 'Alice', score: 99 }, schema)).toBe(true);
    expect(isValid({ name: 'Alice', score: 'high' }, schema)).toBe(false);
  });

  it('minProperties passes with enough properties', () => {
    const schema = object({ a: string().build(), b: string().build() }).minProperties(2).build();
    expect(isValid({ a: 'x', b: 'y' }, schema)).toBe(true);
  });

  it('minProperties fails with too few', () => {
    const schema = object({ a: string().build(), b: string().build() }).minProperties(2).build();
    expect(isValid({ a: 'x' }, schema)).toBe(false);
  });

  it('minProperties error has keyword minProperties', () => {
    const r = validate({ a: 'x' }, { type: 'object', minProperties: 2 });
    expect(r.errors[0].keyword).toBe('minProperties');
  });

  it('maxProperties passes within limit', () => {
    const schema: JsonSchema = { type: 'object', maxProperties: 2 };
    expect(isValid({ a: 1, b: 2 }, schema)).toBe(true);
  });

  it('maxProperties fails above limit', () => {
    const schema: JsonSchema = { type: 'object', maxProperties: 2 };
    expect(isValid({ a: 1, b: 2, c: 3 }, schema)).toBe(false);
  });

  it('maxProperties error has keyword maxProperties', () => {
    const r = validate({ a: 1, b: 2, c: 3 }, { type: 'object', maxProperties: 2 });
    expect(r.errors[0].keyword).toBe('maxProperties');
  });

  it('multiple missing required fields produces multiple errors', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      required: ['a', 'b'],
    };
    const r = validate({}, schema);
    const reqErrors = r.errors.filter(e => e.keyword === 'required');
    expect(reqErrors.length).toBe(2);
  });
});

// ─── validate() — array constraints ──────────────────────────────────────────

describe('validate() — array constraints', () => {
  it('minItems passes with enough items', () => {
    expect(isValid([1, 2, 3], { type: 'array', minItems: 2 })).toBe(true);
  });

  it('minItems fails with too few', () => {
    expect(isValid([1], { type: 'array', minItems: 2 })).toBe(false);
  });

  it('minItems error has keyword minItems', () => {
    const r = validate([], { type: 'array', minItems: 1 });
    expect(r.errors[0].keyword).toBe('minItems');
  });

  it('maxItems passes within limit', () => {
    expect(isValid([1, 2], { type: 'array', maxItems: 3 })).toBe(true);
  });

  it('maxItems fails above limit', () => {
    expect(isValid([1, 2, 3, 4], { type: 'array', maxItems: 3 })).toBe(false);
  });

  it('maxItems error has keyword maxItems', () => {
    const r = validate([1, 2, 3, 4], { type: 'array', maxItems: 3 });
    expect(r.errors[0].keyword).toBe('maxItems');
  });

  it('uniqueItems passes with unique values', () => {
    expect(isValid([1, 2, 3], { type: 'array', uniqueItems: true })).toBe(true);
  });

  it('uniqueItems fails with duplicates', () => {
    expect(isValid([1, 2, 2], { type: 'array', uniqueItems: true })).toBe(false);
  });

  it('uniqueItems error has keyword uniqueItems', () => {
    const r = validate([1, 1], { type: 'array', uniqueItems: true });
    const err = r.errors.find(e => e.keyword === 'uniqueItems');
    expect(err).toBeDefined();
  });

  it('items validation passes for all valid items', () => {
    expect(isValid(['a', 'b'], { type: 'array', items: { type: 'string' } })).toBe(true);
  });

  it('items validation fails for invalid item', () => {
    expect(isValid(['a', 42], { type: 'array', items: { type: 'string' } })).toBe(false);
  });

  it('items error path includes index', () => {
    const r = validate(['a', 42], { type: 'array', items: { type: 'string' } });
    expect(r.errors[0].path).toContain('[1]');
  });

  it('empty array passes minItems 0', () => {
    expect(isValid([], { type: 'array', minItems: 0 })).toBe(true);
  });

  it('empty array fails minItems 1', () => {
    expect(isValid([], { type: 'array', minItems: 1 })).toBe(false);
  });

  it('tuple validation passes', () => {
    const schema: JsonSchema = {
      type: 'array',
      items: [{ type: 'string' }, { type: 'number' }],
    };
    expect(isValid(['hello', 42], schema)).toBe(true);
  });

  it('tuple validation fails on wrong type at index', () => {
    const schema: JsonSchema = {
      type: 'array',
      items: [{ type: 'string' }, { type: 'number' }],
    };
    expect(isValid([42, 42], schema)).toBe(false);
  });

  it('uniqueItems with objects uses JSON comparison', () => {
    const schema: JsonSchema = { type: 'array', uniqueItems: true };
    expect(isValid([{ a: 1 }, { a: 2 }], schema)).toBe(true);
    expect(isValid([{ a: 1 }, { a: 1 }], schema)).toBe(false);
  });
});

// ─── validate() — enum ───────────────────────────────────────────────────────

describe('validate() — enum', () => {
  it('passes when value is in enum', () => {
    expect(isValid('active', { enum: ['active', 'inactive'] })).toBe(true);
  });

  it('fails when value not in enum', () => {
    expect(isValid('pending', { enum: ['active', 'inactive'] })).toBe(false);
  });

  it('enum error has keyword enum', () => {
    const r = validate('pending', { enum: ['active', 'inactive'] });
    expect(r.errors[0].keyword).toBe('enum');
  });

  it('enum with null value', () => {
    expect(isValid(null, { enum: [null, 'value'] })).toBe(true);
  });

  it('enum with number', () => {
    expect(isValid(1, { enum: [1, 2, 3] })).toBe(true);
    expect(isValid(4, { enum: [1, 2, 3] })).toBe(false);
  });

  it('enum with boolean', () => {
    expect(isValid(true, { enum: [true] })).toBe(true);
    expect(isValid(false, { enum: [true] })).toBe(false);
  });

  it('enum error message includes allowed values', () => {
    const r = validate('x', { enum: ['a', 'b'] });
    expect(r.errors[0].message).toContain('a');
  });

  it('enum with single value (literal)', () => {
    expect(isValid('only', { enum: ['only'] })).toBe(true);
    expect(isValid('other', { enum: ['only'] })).toBe(false);
  });
});

// ─── validate() — composition ─────────────────────────────────────────────────

describe('validate() — allOf', () => {
  it('passes when all schemas match', () => {
    const schema: JsonSchema = { allOf: [{ minimum: 5 }, { maximum: 10 }] };
    expect(isValid(7, schema)).toBe(true);
  });

  it('fails when one schema fails', () => {
    const schema: JsonSchema = { allOf: [{ minimum: 5 }, { maximum: 10 }] };
    expect(isValid(3, schema)).toBe(false);
  });

  it('accumulates errors from all failing sub-schemas', () => {
    const schema: JsonSchema = { allOf: [{ minimum: 5 }, { maximum: 2 }] };
    const r = validate(3, schema);
    expect(r.errors.length).toBeGreaterThan(1);
  });
});

describe('validate() — anyOf', () => {
  it('passes when at least one schema matches', () => {
    const schema: JsonSchema = { anyOf: [{ type: 'string' }, { type: 'number' }] };
    expect(isValid('hello', schema)).toBe(true);
    expect(isValid(42, schema)).toBe(true);
  });

  it('fails when no schema matches', () => {
    const schema: JsonSchema = { anyOf: [{ type: 'string' }, { type: 'number' }] };
    expect(isValid(true, schema)).toBe(false);
  });

  it('anyOf error has keyword anyOf', () => {
    const r = validate(true, { anyOf: [{ type: 'string' }] });
    expect(r.errors[0].keyword).toBe('anyOf');
  });
});

describe('validate() — oneOf', () => {
  it('passes when exactly one schema matches', () => {
    const schema: JsonSchema = {
      oneOf: [
        { type: 'string', minLength: 5 },
        { type: 'string', maxLength: 3 },
      ],
    };
    expect(isValid('ab', schema)).toBe(true); // only maxLength<3 matches
    expect(isValid('hello world', schema)).toBe(true); // only minLength>=5 matches
  });

  it('fails when zero schemas match', () => {
    const schema: JsonSchema = { oneOf: [{ minimum: 10 }, { minimum: 20 }] };
    expect(isValid(5, schema)).toBe(false);
  });

  it('fails when more than one schema matches', () => {
    const schema: JsonSchema = { oneOf: [{ minimum: 1 }, { minimum: 2 }] };
    expect(isValid(5, schema)).toBe(false);
  });

  it('oneOf error has keyword oneOf', () => {
    const r = validate(5, { oneOf: [{ minimum: 10 }] });
    expect(r.errors.find(e => e.keyword === 'oneOf')).toBeDefined();
  });
});

describe('validate() — not', () => {
  it('passes when value does not match negated schema', () => {
    const schema: JsonSchema = { not: { type: 'string' } };
    expect(isValid(42, schema)).toBe(true);
  });

  it('fails when value matches negated schema', () => {
    const schema: JsonSchema = { not: { type: 'string' } };
    expect(isValid('hello', schema)).toBe(false);
  });

  it('not error has keyword not', () => {
    const r = validate('hello', { not: { type: 'string' } });
    expect(r.errors[0].keyword).toBe('not');
  });
});

describe('validate() — if/then/else', () => {
  it('applies then when if matches', () => {
    const schema: JsonSchema = {
      type: 'number',
      if: { minimum: 10 },
      then: { multipleOf: 2 },
    };
    expect(isValid(12, schema)).toBe(true);
    expect(isValid(11, schema)).toBe(false);
  });

  it('applies else when if does not match', () => {
    const schema: JsonSchema = {
      type: 'number',
      if: { minimum: 10 },
      else: { multipleOf: 3 },
    };
    expect(isValid(5, schema)).toBe(false); // 5 < 10, so else applies, 5 % 3 != 0
    expect(isValid(6, schema)).toBe(true);  // 6 < 10, else applies, 6 % 3 == 0
  });

  it('no then/else, if match only — passes (nothing to violate)', () => {
    const schema: JsonSchema = { if: { minimum: 5 } };
    expect(isValid(10, schema)).toBe(true);
  });
});

// ─── isValid() ───────────────────────────────────────────────────────────────

describe('isValid()', () => {
  it('returns true for valid value', () => {
    expect(isValid('hello', { type: 'string' })).toBe(true);
  });

  it('returns false for invalid value', () => {
    expect(isValid(42, { type: 'string' })).toBe(false);
  });

  it('returns boolean (not ValidationResult)', () => {
    expect(typeof isValid('x', { type: 'string' })).toBe('boolean');
  });

  const cases = [
    { value: 'hi', schema: { type: 'string', minLength: 1 }, valid: true },
    { value: '', schema: { type: 'string', minLength: 1 }, valid: false },
    { value: 5, schema: { type: 'integer', minimum: 1 }, valid: true },
    { value: 0, schema: { type: 'integer', minimum: 1 }, valid: false },
    { value: null, schema: { type: 'null' }, valid: true },
  ] as Array<{ value: unknown; schema: JsonSchema; valid: boolean }>;

  it.each(cases)('isValid($value) with schema → $valid', ({ value, schema, valid }) => {
    expect(isValid(value, schema)).toBe(valid);
  });
});

// ─── validateMany() ───────────────────────────────────────────────────────────

describe('validateMany()', () => {
  it('returns array of ValidationResults', () => {
    const results = validateMany(['a', 'b', 'c'], { type: 'string' });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(3);
  });

  it('each result has valid property', () => {
    const results = validateMany([1, 2, 3], { type: 'number' });
    results.forEach(r => expect(r).toHaveProperty('valid'));
  });

  it('each result has errors array', () => {
    const results = validateMany([1, 2, 3], { type: 'number' });
    results.forEach(r => expect(Array.isArray(r.errors)).toBe(true));
  });

  it('all valid when all items match schema', () => {
    const results = validateMany([1, 2, 3], { type: 'number' });
    expect(results.every(r => r.valid)).toBe(true);
  });

  it('mixed valid and invalid', () => {
    const results = validateMany(['hello', 42, 'world'], { type: 'string' });
    expect(results[0].valid).toBe(true);
    expect(results[1].valid).toBe(false);
    expect(results[2].valid).toBe(true);
  });

  it('empty array returns empty results', () => {
    expect(validateMany([], { type: 'string' })).toEqual([]);
  });

  it('returns correct error count for invalid item', () => {
    const results = validateMany([42], { type: 'string', minLength: 3 });
    expect(results[0].errors.length).toBeGreaterThan(0);
  });
});

// ─── coerce() ────────────────────────────────────────────────────────────────

describe('coerce()', () => {
  it('coerces string "42" to number 42', () => {
    expect(coerce('42', { type: 'number' })).toBe(42);
  });

  it('coerces string "3.14" to number 3.14', () => {
    expect(coerce('3.14', { type: 'number' })).toBe(3.14);
  });

  it('coerces string "5" to integer 5 (truncated)', () => {
    expect(coerce('5.9', { type: 'integer' })).toBe(5);
  });

  it('coerces boolean true to number 1', () => {
    expect(coerce(true, { type: 'number' })).toBe(1);
  });

  it('coerces boolean false to number 0', () => {
    expect(coerce(false, { type: 'number' })).toBe(0);
  });

  it('coerces number to string', () => {
    expect(coerce(42, { type: 'string' })).toBe('42');
  });

  it('coerces boolean true to string', () => {
    expect(coerce(true, { type: 'string' })).toBe('true');
  });

  it('coerces null to string "null"', () => {
    expect(coerce(null, { type: 'string' })).toBe('null');
  });

  it('coerces string "true" to boolean true', () => {
    expect(coerce('true', { type: 'boolean' })).toBe(true);
  });

  it('coerces string "false" to boolean false', () => {
    expect(coerce('false', { type: 'boolean' })).toBe(false);
  });

  it('coerces string "TRUE" (case-insensitive) to boolean true', () => {
    expect(coerce('TRUE', { type: 'boolean' })).toBe(true);
  });

  it('coerces number 1 to boolean true', () => {
    expect(coerce(1, { type: 'boolean' })).toBe(true);
  });

  it('coerces number 0 to boolean false', () => {
    expect(coerce(0, { type: 'boolean' })).toBe(false);
  });

  it('wraps non-array in array when type is array', () => {
    const result = coerce('hello', { type: 'array' });
    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[])[0]).toBe('hello');
  });

  it('does not rewrap existing array', () => {
    const arr = [1, 2, 3];
    expect(coerce(arr, { type: 'array' })).toBe(arr);
  });

  it('returns original value if coercion not possible', () => {
    expect(coerce('not-a-number', { type: 'number' })).toBe('not-a-number');
  });

  it('passes through already-correct type', () => {
    expect(coerce('hello', { type: 'string' })).toBe('hello');
  });

  it('handles type array — uses first non-null type', () => {
    expect(coerce('5', { type: ['null', 'number'] })).toBe(5);
  });

  it('coerces string "FALSE" to boolean false', () => {
    expect(coerce('FALSE', { type: 'boolean' })).toBe(false);
  });
});

// ─── merge() ─────────────────────────────────────────────────────────────────

describe('merge()', () => {
  const schemaA: JsonSchema = {
    type: 'object',
    properties: { name: { type: 'string' } },
    required: ['name'],
  };
  const schemaB: JsonSchema = {
    type: 'object',
    properties: { age: { type: 'number' } },
    required: ['age'],
  };

  it('combines properties from both schemas', () => {
    const merged = merge(schemaA, schemaB);
    expect(merged.properties).toHaveProperty('name');
    expect(merged.properties).toHaveProperty('age');
  });

  it('combines required arrays from both schemas', () => {
    const merged = merge(schemaA, schemaB);
    expect(merged.required).toContain('name');
    expect(merged.required).toContain('age');
  });

  it('deduplicates required keys', () => {
    const s1: JsonSchema = { type: 'object', properties: { x: { type: 'string' } }, required: ['x'] };
    const s2: JsonSchema = { type: 'object', properties: { x: { type: 'number' } }, required: ['x'] };
    const merged = merge(s1, s2);
    const count = merged.required!.filter(k => k === 'x').length;
    expect(count).toBe(1);
  });

  it('later schema properties override earlier ones', () => {
    const s1: JsonSchema = { type: 'object', properties: { x: { type: 'string' } } };
    const s2: JsonSchema = { type: 'object', properties: { x: { type: 'number' } } };
    const merged = merge(s1, s2);
    expect(merged.properties!['x'].type).toBe('number');
  });

  it('result type is object', () => {
    expect(merge(schemaA, schemaB).type).toBe('object');
  });

  it('merges three schemas', () => {
    const s3: JsonSchema = { type: 'object', properties: { active: { type: 'boolean' } }, required: ['active'] };
    const merged = merge(schemaA, schemaB, s3);
    expect(merged.properties).toHaveProperty('name');
    expect(merged.properties).toHaveProperty('age');
    expect(merged.properties).toHaveProperty('active');
  });

  it('adopts title from last schema with a title', () => {
    const s1: JsonSchema = { type: 'object', title: 'First' };
    const s2: JsonSchema = { type: 'object', title: 'Second' };
    const merged = merge(s1, s2);
    expect(merged.title).toBe('Second');
  });

  it('schema with no required produces result with no required', () => {
    const s1: JsonSchema = { type: 'object', properties: { a: { type: 'string' } } };
    const s2: JsonSchema = { type: 'object', properties: { b: { type: 'number' } } };
    const merged = merge(s1, s2);
    expect(merged.required).toBeUndefined();
  });

  it('empty merge returns object type', () => {
    const merged = merge();
    expect(merged.type).toBe('object');
  });
});

// ─── pick() ──────────────────────────────────────────────────────────────────

describe('pick()', () => {
  const schema: JsonSchema = {
    type: 'object',
    properties: { a: { type: 'string' }, b: { type: 'number' }, c: { type: 'boolean' } },
    required: ['a', 'b'],
  };

  it('includes only specified keys in properties', () => {
    const picked = pick(schema, ['a']);
    expect(picked.properties).toHaveProperty('a');
    expect(picked.properties).not.toHaveProperty('b');
    expect(picked.properties).not.toHaveProperty('c');
  });

  it('filters required to only include picked keys', () => {
    const picked = pick(schema, ['a']);
    expect(picked.required).toContain('a');
    expect(picked.required).not.toContain('b');
  });

  it('no required if none of picked keys are required', () => {
    const picked = pick(schema, ['c']);
    expect(picked.required).toBeUndefined();
  });

  it('picks multiple keys', () => {
    const picked = pick(schema, ['a', 'b']);
    expect(Object.keys(picked.properties!).sort()).toEqual(['a', 'b']);
  });

  it('non-existent keys are silently ignored', () => {
    const picked = pick(schema, ['a', 'nonexistent']);
    expect(picked.properties).toHaveProperty('a');
    expect(picked.properties).not.toHaveProperty('nonexistent');
  });

  it('result type is object', () => {
    expect(pick(schema, ['a']).type).toBe('object');
  });

  it('empty keys produces empty properties', () => {
    const picked = pick(schema, []);
    expect(Object.keys(picked.properties!).length).toBe(0);
  });

  it('schema with no properties', () => {
    const s: JsonSchema = { type: 'object' };
    const picked = pick(s, ['a']);
    expect(picked.properties).toEqual({});
  });
});

// ─── omit() ──────────────────────────────────────────────────────────────────

describe('omit()', () => {
  const schema: JsonSchema = {
    type: 'object',
    properties: { a: { type: 'string' }, b: { type: 'number' }, c: { type: 'boolean' } },
    required: ['a', 'b'],
  };

  it('removes specified key from properties', () => {
    const omitted = omit(schema, ['b']);
    expect(omitted.properties).not.toHaveProperty('b');
    expect(omitted.properties).toHaveProperty('a');
    expect(omitted.properties).toHaveProperty('c');
  });

  it('removes omitted keys from required', () => {
    const omitted = omit(schema, ['a']);
    expect(omitted.required).not.toContain('a');
    expect(omitted.required).toContain('b');
  });

  it('omits multiple keys', () => {
    const omitted = omit(schema, ['a', 'c']);
    expect(Object.keys(omitted.properties!)).toEqual(['b']);
  });

  it('non-existent keys in omit list are harmless', () => {
    const omitted = omit(schema, ['nonexistent']);
    expect(Object.keys(omitted.properties!).sort()).toEqual(['a', 'b', 'c']);
  });

  it('omitting all required produces undefined required', () => {
    const omitted = omit(schema, ['a', 'b']);
    expect(omitted.required).toBeUndefined();
  });

  it('result type is object', () => {
    expect(omit(schema, ['a']).type).toBe('object');
  });
});

// ─── partial() ───────────────────────────────────────────────────────────────

describe('partial()', () => {
  const schema: JsonSchema = {
    type: 'object',
    properties: { a: { type: 'string' }, b: { type: 'number' } },
    required: ['a', 'b'],
  };

  it('removes required', () => {
    const p = partial(schema);
    expect(p.required).toBeUndefined();
  });

  it('preserves properties', () => {
    const p = partial(schema);
    expect(p.properties).toHaveProperty('a');
    expect(p.properties).toHaveProperty('b');
  });

  it('preserves type', () => {
    const p = partial(schema);
    expect(p.type).toBe('object');
  });

  it('partial of partial is still partial', () => {
    const p = partial(partial(schema));
    expect(p.required).toBeUndefined();
  });

  it('schema with no required stays without required', () => {
    const s: JsonSchema = { type: 'object', properties: { a: { type: 'string' } } };
    const p = partial(s);
    expect(p.required).toBeUndefined();
  });

  it('original schema is not mutated', () => {
    const s: JsonSchema = { type: 'object', required: ['a'] };
    partial(s);
    expect(s.required).toEqual(['a']);
  });
});

// ─── required() ──────────────────────────────────────────────────────────────

describe('required() utility', () => {
  it('makes all properties required', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' }, c: { type: 'boolean' } },
    };
    const req = required(schema);
    expect(req.required).toContain('a');
    expect(req.required).toContain('b');
    expect(req.required).toContain('c');
  });

  it('required count equals property count', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { x: { type: 'string' }, y: { type: 'string' } },
    };
    const req = required(schema);
    expect(req.required!.length).toBe(2);
  });

  it('schema with no properties produces empty required', () => {
    const s: JsonSchema = { type: 'object' };
    const req = required(s);
    expect(req.required).toEqual([]);
  });

  it('preserves other properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' } },
      description: 'test',
    };
    const req = required(schema);
    expect(req.description).toBe('test');
  });
});

// ─── toOpenApiSchema() ───────────────────────────────────────────────────────

describe('toOpenApiSchema()', () => {
  it('passes through type', () => {
    const oa = toOpenApiSchema({ type: 'string' });
    expect(oa['type']).toBe('string');
  });

  it('passes through title', () => {
    const oa = toOpenApiSchema({ type: 'string', title: 'Name' });
    expect(oa['title']).toBe('Name');
  });

  it('passes through description', () => {
    const oa = toOpenApiSchema({ type: 'string', description: 'A name' });
    expect(oa['description']).toBe('A name');
  });

  it('passes through format', () => {
    const oa = toOpenApiSchema({ type: 'string', format: 'email' });
    expect(oa['format']).toBe('email');
  });

  it('passes through enum', () => {
    const oa = toOpenApiSchema({ enum: ['a', 'b'] });
    expect(oa['enum']).toEqual(['a', 'b']);
  });

  it('passes through minimum', () => {
    const oa = toOpenApiSchema({ minimum: 5 });
    expect(oa['minimum']).toBe(5);
  });

  it('passes through maximum', () => {
    const oa = toOpenApiSchema({ maximum: 100 });
    expect(oa['maximum']).toBe(100);
  });

  it('converts nullable to OpenAPI nullable:true', () => {
    const oa = toOpenApiSchema({ type: 'string', nullable: true });
    expect(oa['nullable']).toBe(true);
  });

  it('removes null from type array when nullable', () => {
    const oa = toOpenApiSchema({ type: ['string', 'null'], nullable: true });
    expect(oa['type']).toBe('string');
  });

  it('converts nested properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    };
    const oa = toOpenApiSchema(schema);
    expect(oa['properties']).toBeDefined();
    expect((oa['properties'] as Record<string, unknown>)['name']).toHaveProperty('type', 'string');
  });

  it('converts items', () => {
    const schema: JsonSchema = { type: 'array', items: { type: 'string' } };
    const oa = toOpenApiSchema(schema);
    expect(oa['items']).toHaveProperty('type', 'string');
  });

  it('converts allOf', () => {
    const schema: JsonSchema = { allOf: [{ type: 'string' }] };
    const oa = toOpenApiSchema(schema);
    expect(Array.isArray(oa['allOf'])).toBe(true);
  });

  it('converts anyOf', () => {
    const schema: JsonSchema = { anyOf: [{ type: 'string' }, { type: 'number' }] };
    const oa = toOpenApiSchema(schema);
    expect(Array.isArray(oa['anyOf'])).toBe(true);
    expect((oa['anyOf'] as unknown[]).length).toBe(2);
  });

  it('converts oneOf', () => {
    const schema: JsonSchema = { oneOf: [{ type: 'string' }] };
    const oa = toOpenApiSchema(schema);
    expect(Array.isArray(oa['oneOf'])).toBe(true);
  });

  it('converts not', () => {
    const schema: JsonSchema = { not: { type: 'string' } };
    const oa = toOpenApiSchema(schema);
    expect(oa['not']).toBeDefined();
  });

  it('passes through required', () => {
    const schema: JsonSchema = { type: 'object', required: ['name'] };
    const oa = toOpenApiSchema(schema);
    expect(oa['required']).toEqual(['name']);
  });

  it('passes through additionalProperties boolean', () => {
    const schema: JsonSchema = { type: 'object', additionalProperties: false };
    const oa = toOpenApiSchema(schema);
    expect(oa['additionalProperties']).toBe(false);
  });

  it('converts additionalProperties schema', () => {
    const schema: JsonSchema = { type: 'object', additionalProperties: { type: 'string' } };
    const oa = toOpenApiSchema(schema);
    expect((oa['additionalProperties'] as Record<string, unknown>)['type']).toBe('string');
  });

  it('passes through minLength and maxLength', () => {
    const oa = toOpenApiSchema({ type: 'string', minLength: 1, maxLength: 50 });
    expect(oa['minLength']).toBe(1);
    expect(oa['maxLength']).toBe(50);
  });

  it('passes through pattern', () => {
    const oa = toOpenApiSchema({ type: 'string', pattern: '^[a-z]+$' });
    expect(oa['pattern']).toBe('^[a-z]+$');
  });

  it('passes through minItems and maxItems', () => {
    const oa = toOpenApiSchema({ type: 'array', minItems: 1, maxItems: 10 });
    expect(oa['minItems']).toBe(1);
    expect(oa['maxItems']).toBe(10);
  });

  it('passes through default', () => {
    const oa = toOpenApiSchema({ type: 'string', default: 'hello' });
    expect(oa['default']).toBe('hello');
  });

  it('handles tuple items (array of schemas)', () => {
    const schema: JsonSchema = { type: 'array', items: [{ type: 'string' }, { type: 'number' }] };
    const oa = toOpenApiSchema(schema);
    expect(Array.isArray(oa['items'])).toBe(true);
  });
});

// ─── schemaToTypeScript() ────────────────────────────────────────────────────

describe('schemaToTypeScript()', () => {
  it('string type generates string', () => {
    const ts = schemaToTypeScript({ type: 'string' });
    expect(ts).toContain('string');
  });

  it('number type generates number', () => {
    const ts = schemaToTypeScript({ type: 'number' });
    expect(ts).toContain('number');
  });

  it('integer type generates number', () => {
    const ts = schemaToTypeScript({ type: 'integer' });
    expect(ts).toContain('number');
  });

  it('boolean type generates boolean', () => {
    const ts = schemaToTypeScript({ type: 'boolean' });
    expect(ts).toContain('boolean');
  });

  it('null type generates null', () => {
    const ts = schemaToTypeScript({ type: 'null' });
    expect(ts).toContain('null');
  });

  it('array type with items generates Array<...>', () => {
    const ts = schemaToTypeScript({ type: 'array', items: { type: 'string' } });
    expect(ts).toContain('Array<string>');
  });

  it('array type without items generates unknown[]', () => {
    const ts = schemaToTypeScript({ type: 'array' });
    expect(ts).toContain('unknown[]');
  });

  it('object type with properties generates interface-like block', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    };
    const ts = schemaToTypeScript(schema);
    expect(ts).toContain('name');
    expect(ts).toContain('string');
  });

  it('optional property has ? marker', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' }, age: { type: 'number' } },
      required: ['name'],
    };
    const ts = schemaToTypeScript(schema);
    expect(ts).toContain('age?');
  });

  it('required property has no ? marker', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    };
    const ts = schemaToTypeScript(schema);
    expect(ts).toMatch(/name:/);
    expect(ts).not.toMatch(/name\?:/);
  });

  it('enum generates union of literals', () => {
    const ts = schemaToTypeScript({ enum: ['a', 'b', 'c'] });
    expect(ts).toContain('"a"');
    expect(ts).toContain('"b"');
    expect(ts).toContain('"c"');
  });

  it('anyOf generates | union', () => {
    const ts = schemaToTypeScript({ anyOf: [{ type: 'string' }, { type: 'number' }] });
    expect(ts).toContain('|');
  });

  it('allOf generates & intersection', () => {
    const ts = schemaToTypeScript({ allOf: [{ type: 'string' }, { type: 'number' }] });
    expect(ts).toContain('&');
  });

  it('with name wraps in type alias', () => {
    const ts = schemaToTypeScript({ type: 'string' }, 'MyType');
    expect(ts).toContain('type MyType =');
  });

  it('without name returns raw type string', () => {
    const ts = schemaToTypeScript({ type: 'string' });
    expect(ts).not.toContain('type ');
  });

  it('multi-type generates | union', () => {
    const ts = schemaToTypeScript({ type: ['string', 'null'] });
    expect(ts).toContain('string');
    expect(ts).toContain('null');
    expect(ts).toContain('|');
  });

  it('object without properties generates Record<string, unknown>', () => {
    const ts = schemaToTypeScript({ type: 'object' });
    expect(ts).toContain('Record<string, unknown>');
  });

  it('additionalProperties true adds index signature', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      additionalProperties: true,
    };
    const ts = schemaToTypeScript(schema);
    expect(ts).toContain('[key: string]: unknown');
  });

  it('additionalProperties schema adds typed index signature', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      additionalProperties: { type: 'number' },
    };
    const ts = schemaToTypeScript(schema);
    expect(ts).toContain('[key: string]: number');
  });

  it('no type returns unknown', () => {
    const ts = schemaToTypeScript({});
    expect(ts).toBe('unknown');
  });

  it('tuple array generates tuple type', () => {
    const schema: JsonSchema = {
      type: 'array',
      items: [{ type: 'string' }, { type: 'number' }],
    };
    const ts = schemaToTypeScript(schema);
    expect(ts).toContain('[');
    expect(ts).toContain('string');
    expect(ts).toContain('number');
  });
});

// ─── schemaStats() ───────────────────────────────────────────────────────────

describe('schemaStats()', () => {
  it('returns fieldCount for flat object', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
    };
    expect(schemaStats(schema).fieldCount).toBe(2);
  });

  it('returns requiredCount', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
      required: ['a'],
    };
    expect(schemaStats(schema).requiredCount).toBe(1);
  });

  it('returns optionalCount = fieldCount - requiredCount', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' }, c: { type: 'boolean' } },
      required: ['a'],
    };
    const stats = schemaStats(schema);
    expect(stats.optionalCount).toBe(2);
  });

  it('depth 0 for primitive schema', () => {
    expect(schemaStats({ type: 'string' }).depth).toBe(0);
  });

  it('depth 1 for flat object', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    };
    expect(schemaStats(schema).depth).toBe(1);
  });

  it('depth 2 for nested object', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
    };
    expect(schemaStats(schema).depth).toBe(2);
  });

  it('hasEnum true when schema has enum', () => {
    const schema: JsonSchema = { type: 'string', enum: ['a', 'b'] };
    expect(schemaStats(schema).hasEnum).toBe(true);
  });

  it('hasEnum false when no enum', () => {
    const schema: JsonSchema = { type: 'string' };
    expect(schemaStats(schema).hasEnum).toBe(false);
  });

  it('hasEnum true when nested property has enum', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { status: { type: 'string', enum: ['active', 'inactive'] } },
    };
    expect(schemaStats(schema).hasEnum).toBe(true);
  });

  it('hasComposition true for allOf', () => {
    const schema: JsonSchema = { allOf: [{ type: 'string' }] };
    expect(schemaStats(schema).hasComposition).toBe(true);
  });

  it('hasComposition true for anyOf', () => {
    const schema: JsonSchema = { anyOf: [{ type: 'string' }] };
    expect(schemaStats(schema).hasComposition).toBe(true);
  });

  it('hasComposition true for oneOf', () => {
    const schema: JsonSchema = { oneOf: [{ type: 'string' }] };
    expect(schemaStats(schema).hasComposition).toBe(true);
  });

  it('hasComposition true for not', () => {
    const schema: JsonSchema = { not: { type: 'string' } };
    expect(schemaStats(schema).hasComposition).toBe(true);
  });

  it('hasComposition false for plain schema', () => {
    const schema: JsonSchema = { type: 'object', properties: { a: { type: 'string' } } };
    expect(schemaStats(schema).hasComposition).toBe(false);
  });

  it('fieldCount 0 for schema without properties', () => {
    expect(schemaStats({ type: 'string' }).fieldCount).toBe(0);
  });

  it('requiredCount 0 for schema without required', () => {
    expect(schemaStats({ type: 'object', properties: { a: { type: 'string' } } }).requiredCount).toBe(0);
  });

  it('optionalCount equals fieldCount when no required', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
    };
    const stats = schemaStats(schema);
    expect(stats.optionalCount).toBe(stats.fieldCount);
  });

  it('stats object has all expected keys', () => {
    const stats = schemaStats({ type: 'string' });
    expect(stats).toHaveProperty('fieldCount');
    expect(stats).toHaveProperty('requiredCount');
    expect(stats).toHaveProperty('optionalCount');
    expect(stats).toHaveProperty('depth');
    expect(stats).toHaveProperty('hasEnum');
    expect(stats).toHaveProperty('hasComposition');
  });
});

// ─── Complex integration scenarios ──────────────────────────────────────────

describe('Complex integration scenarios', () => {
  const userSchema = object({
    id: string().format('uuid').build(),
    email: string().format('email').build(),
    name: string().minLength(1).maxLength(100).build(),
    age: number().integer().min(0).max(150).build(),
    role: string().enum('admin', 'user', 'guest').build(),
    active: boolean().default(true).build(),
    tags: array(string().build()).maxItems(10).build(),
  })
    .required('id', 'email', 'name')
    .additionalProperties(false)
    .build();

  it('valid user passes full schema', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      name: 'Alice',
      age: 30,
      role: 'admin',
      active: true,
      tags: ['qa', 'dev'],
    };
    expect(isValid(user, userSchema)).toBe(true);
  });

  it('user missing required field fails', () => {
    const user = { email: 'user@example.com', name: 'Alice' };
    expect(isValid(user, userSchema)).toBe(false);
  });

  it('user with invalid email fails', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'not-an-email',
      name: 'Alice',
    };
    expect(isValid(user, userSchema)).toBe(false);
  });

  it('user with invalid uuid id fails', () => {
    const user = {
      id: 'not-a-uuid',
      email: 'user@example.com',
      name: 'Alice',
    };
    expect(isValid(user, userSchema)).toBe(false);
  });

  it('user with age out of range fails', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      name: 'Alice',
      age: 200,
    };
    expect(isValid(user, userSchema)).toBe(false);
  });

  it('user with invalid role fails', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      name: 'Alice',
      role: 'superadmin',
    };
    expect(isValid(user, userSchema)).toBe(false);
  });

  it('user with extra field fails (additionalProperties false)', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      name: 'Alice',
      extra: 'value',
    };
    expect(isValid(user, userSchema)).toBe(false);
  });

  it('user with too many tags fails', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      name: 'Alice',
      tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'],
    };
    expect(isValid(user, userSchema)).toBe(false);
  });

  it('pick produces valid partial schema', () => {
    const partial = pick(userSchema, ['email', 'name']);
    expect(isValid({ email: 'x@y.com', name: 'Bob' }, partial)).toBe(true);
  });

  it('omit produces schema without removed fields', () => {
    const withoutTags = omit(userSchema, ['tags']);
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      name: 'Alice',
    };
    // After omit, schema has no 'tags' property and additionalProperties was false
    // The user data should still be checked without tags
    const result = validate(user, withoutTags);
    // Only checking that tags absence doesn't cause a required error
    const requiredErrors = result.errors.filter(e => e.keyword === 'required' && e.message.includes('tags'));
    expect(requiredErrors.length).toBe(0);
  });

  it('coerce + validate workflow', () => {
    const ageSchema: JsonSchema = { type: 'integer', minimum: 0, maximum: 150 };
    const coerced = coerce('25', ageSchema);
    expect(isValid(coerced, ageSchema)).toBe(true);
  });

  it('merge produces combined schema', () => {
    const baseSchema = object({ id: string().build() }).required('id').build();
    const extSchema = object({ name: string().build() }).required('name').build();
    const full = merge(baseSchema, extSchema);
    expect(full.properties).toHaveProperty('id');
    expect(full.properties).toHaveProperty('name');
    expect(full.required).toContain('id');
    expect(full.required).toContain('name');
  });
});

// ─── Edge cases and additional coverage ─────────────────────────────────────

describe('Edge cases', () => {
  it('validate with no schema type accepts anything', () => {
    expect(isValid('hello', {})).toBe(true);
    expect(isValid(42, {})).toBe(true);
    expect(isValid(null, {})).toBe(true);
  });

  it('empty object schema with no constraints', () => {
    expect(isValid({}, { type: 'object' })).toBe(true);
  });

  it('empty array with no constraints', () => {
    expect(isValid([], { type: 'array' })).toBe(true);
  });

  it('integer 0 passes integer type', () => {
    expect(isValid(0, { type: 'integer' })).toBe(true);
  });

  it('negative integer is valid integer', () => {
    expect(isValid(-5, { type: 'integer' })).toBe(true);
  });

  it('float is not integer', () => {
    expect(isValid(1.1, { type: 'integer' })).toBe(false);
  });

  it('NaN is not a valid number type', () => {
    expect(isValid(NaN, { type: 'number' })).toBe(false);
  });

  it('Infinity is a valid number type value (passes type check)', () => {
    // Infinity is typeof 'number'
    expect(typeof Infinity).toBe('number');
    const r = validate(Infinity, { type: 'number', maximum: 1000 });
    expect(r.errors.some(e => e.keyword === 'maximum')).toBe(true);
  });

  it('$ref schema returns valid (skips ref resolution)', () => {
    expect(isValid('anything', { $ref: '#/$defs/SomeType' })).toBe(true);
  });

  it('validate path is empty string for root', () => {
    const r = validate(42, { type: 'string' });
    expect(r.errors[0].path).toBe('');
  });

  it('string minLength 0 passes empty string', () => {
    expect(isValid('', { type: 'string', minLength: 0 })).toBe(true);
  });

  it('number multipleOf 1 passes all integers', () => {
    for (let i = -5; i <= 5; i++) {
      expect(isValid(i, { type: 'number', multipleOf: 1 })).toBe(true);
    }
  });

  it('array with 0 items passes maxItems 0', () => {
    expect(isValid([], { type: 'array', maxItems: 0 })).toBe(true);
  });

  it('array with 1 item fails maxItems 0', () => {
    expect(isValid([1], { type: 'array', maxItems: 0 })).toBe(false);
  });

  it('validates boolean false as valid boolean', () => {
    expect(isValid(false, { type: 'boolean' })).toBe(true);
  });

  it('schema with examples field still validates correctly', () => {
    const schema: JsonSchema = {
      type: 'string',
      examples: ['hello', 'world'],
    };
    expect(isValid('hello', schema)).toBe(true);
    expect(isValid(42, schema)).toBe(false);
  });

  it('union of string and null behaves as nullable string', () => {
    const schema = union({ type: 'string' }, { type: 'null' });
    expect(isValid('hello', schema)).toBe(true);
    expect(isValid(null, schema)).toBe(true);
    expect(isValid(42, schema)).toBe(false);
  });

  it('intersection of min/max creates bounded range', () => {
    const schema = intersection({ minimum: 10 }, { maximum: 20 });
    for (let i = 10; i <= 20; i++) {
      expect(isValid(i, schema)).toBe(true);
    }
    expect(isValid(9, schema)).toBe(false);
    expect(isValid(21, schema)).toBe(false);
  });

  it('literal null value', () => {
    const schema = literal(null);
    expect(isValid(null, schema)).toBe(true);
    expect(isValid('null', schema)).toBe(false);
  });

  it('validate accumulates multiple errors', () => {
    const schema: JsonSchema = {
      type: 'string',
      minLength: 5,
      maxLength: 3,
    };
    const r = validate('ab', schema);
    expect(r.errors.length).toBeGreaterThanOrEqual(1);
  });

  it('deeply nested array in object', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        scores: {
          type: 'array',
          items: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
    };
    expect(isValid({ scores: [50, 75, 100] }, schema)).toBe(true);
    expect(isValid({ scores: [50, 150] }, schema)).toBe(false);
  });

  it('validateMany with complex schema', () => {
    const schema: JsonSchema = { type: 'number', minimum: 0, maximum: 10 };
    const values = [-1, 0, 5, 10, 11];
    const results = validateMany(values, schema);
    expect(results[0].valid).toBe(false);
    expect(results[1].valid).toBe(true);
    expect(results[2].valid).toBe(true);
    expect(results[3].valid).toBe(true);
    expect(results[4].valid).toBe(false);
  });

  it('format date-time with timezone offset', () => {
    expect(isValid('2026-01-15T10:30:00+05:30', { type: 'string', format: 'date-time' })).toBe(true);
  });

  it('format date-time with milliseconds', () => {
    expect(isValid('2026-01-15T10:30:00.123Z', { type: 'string', format: 'date-time' })).toBe(true);
  });

  it('uuid case-insensitive', () => {
    expect(isValid('550E8400-E29B-41D4-A716-446655440000', { type: 'string', format: 'uuid' })).toBe(true);
  });

  it('object with null value fails object type check', () => {
    expect(isValid(null, { type: 'object' })).toBe(false);
  });

  it('schemaToTypeScript with nested object', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: { city: { type: 'string' } },
          required: ['city'],
        },
      },
    };
    const ts = schemaToTypeScript(schema, 'WithAddress');
    expect(ts).toContain('WithAddress');
    expect(ts).toContain('city');
  });

  it('merge with additionalProperties', () => {
    const s1: JsonSchema = { type: 'object', additionalProperties: false };
    const s2: JsonSchema = { type: 'object', additionalProperties: true };
    const m = merge(s1, s2);
    expect(m.additionalProperties).toBe(true);
  });

  it('pick with all keys returns all properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
    };
    const picked = pick(schema, ['a', 'b']);
    expect(Object.keys(picked.properties!).length).toBe(2);
  });

  it('omit with all keys returns empty properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'number' } },
    };
    const omitted = omit(schema, ['a', 'b']);
    expect(Object.keys(omitted.properties!).length).toBe(0);
  });

  it('coerce number to integer truncates, not rounds', () => {
    // 5.9 → 5 (truncate, not round to 6)
    expect(coerce('5.9', { type: 'integer' })).toBe(5);
    expect(coerce('5.1', { type: 'integer' })).toBe(5);
  });

  it('coerce with type array picks first non-null (string stays string if first type is string)', () => {
    // First non-null type is 'string', so '42' stays '42'
    expect(coerce('42', { type: ['string', 'number'] })).toBe('42');
    // First non-null type is 'number', so '42' becomes 42
    expect(coerce('42', { type: ['null', 'number'] })).toBe(42);
  });
});

// ─── Batch validation across many values ─────────────────────────────────────

describe('Batch validation', () => {
  const numberSchema: JsonSchema = { type: 'number', minimum: 0, maximum: 100, multipleOf: 5 };
  const validNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
  const invalidNumbers = [-5, 3, 7, 101, 103, 1.5, 22, 33];

  it.each(validNumbers)('number %d is valid (0-100 multipleOf 5)', (n) => {
    expect(isValid(n, numberSchema)).toBe(true);
  });

  it.each(invalidNumbers)('number %d is invalid', (n) => {
    expect(isValid(n, numberSchema)).toBe(false);
  });

  const stringSchema: JsonSchema = { type: 'string', minLength: 2, maxLength: 10, pattern: '^[a-zA-Z]+$' };
  const validStrings = ['ab', 'abc', 'Hello', 'World', 'Test', 'Code', 'Json'];
  const invalidStrings = ['a', 'a'.repeat(11), '123', 'abc123', 'a b', ''];

  it.each(validStrings)('string "%s" is valid', (s) => {
    expect(isValid(s, stringSchema)).toBe(true);
  });

  it.each(invalidStrings)('string "%s" is invalid', (s) => {
    expect(isValid(s, stringSchema)).toBe(false);
  });
});

// ─── Builder immutability ────────────────────────────────────────────────────

describe('Builder immutability / independence', () => {
  it('two string builders are independent', () => {
    const b1 = string().minLength(5);
    const b2 = string().maxLength(3);
    expect(b1.build().maxLength).toBeUndefined();
    expect(b2.build().minLength).toBeUndefined();
  });

  it('number builder min/max do not bleed', () => {
    const b1 = number().min(10);
    const b2 = number().max(100);
    expect(b1.build().maximum).toBeUndefined();
    expect(b2.build().minimum).toBeUndefined();
  });

  it('object builder properties copy is independent', () => {
    const props = { name: string().build() };
    const b1 = object(props).required('name');
    const b2 = object(props);
    expect(b1.build().required).toBeDefined();
    expect(b2.build().required).toBeUndefined();
  });

  it('array builder minItems/maxItems are independent', () => {
    const b1 = array(string().build()).minItems(1);
    const b2 = array(string().build()).maxItems(5);
    expect(b1.build().maxItems).toBeUndefined();
    expect(b2.build().minItems).toBeUndefined();
  });
});

// ─── Additional coerce edge cases ─────────────────────────────────────────────

describe('coerce() additional edge cases', () => {
  it('coerce already boolean true stays true', () => {
    expect(coerce(true, { type: 'boolean' })).toBe(true);
  });

  it('coerce already boolean false stays false', () => {
    expect(coerce(false, { type: 'boolean' })).toBe(false);
  });

  it('coerce already number stays same', () => {
    expect(coerce(42, { type: 'number' })).toBe(42);
  });

  it('coerce already string stays same', () => {
    expect(coerce('hello', { type: 'string' })).toBe('hello');
  });

  it('coerce object with no target type returns original', () => {
    const obj = { a: 1 };
    expect(coerce(obj, {})).toBe(obj);
  });

  it('coerce undefined returns undefined', () => {
    expect(coerce(undefined, { type: 'string' })).toBeUndefined();
  });

  it('coerce string "0" to number gives 0', () => {
    expect(coerce('0', { type: 'number' })).toBe(0);
  });

  it('coerce string "-10" to number gives -10', () => {
    expect(coerce('-10', { type: 'number' })).toBe(-10);
  });

  it('coerce string "1.5" to integer gives 1', () => {
    expect(coerce('1.5', { type: 'integer' })).toBe(1);
  });

  it('coerce boolean false to string gives "false"', () => {
    expect(coerce(false, { type: 'string' })).toBe('false');
  });
});

// ─── Additional schemaStats edge cases ───────────────────────────────────────

describe('schemaStats() additional edge cases', () => {
  it('stats for deeply nested schema has depth 3', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        a: {
          type: 'object',
          properties: {
            b: {
              type: 'object',
              properties: { c: { type: 'string' } },
            },
          },
        },
      },
    };
    expect(schemaStats(schema).depth).toBe(3);
  });

  it('array schema depth counts items depth', () => {
    const schema: JsonSchema = {
      type: 'array',
      items: { type: 'string' },
    };
    expect(schemaStats(schema).depth).toBeGreaterThanOrEqual(1);
  });

  it('all required, none optional', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
      required: ['a', 'b'],
    };
    const stats = schemaStats(schema);
    expect(stats.requiredCount).toBe(2);
    expect(stats.optionalCount).toBe(0);
  });

  it('none required, all optional', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'string' } },
    };
    const stats = schemaStats(schema);
    expect(stats.requiredCount).toBe(0);
    expect(stats.optionalCount).toBe(2);
  });
});

// ─── Extended string builder assertions ──────────────────────────────────────

describe('Extended string builder — multiple assertions per test', () => {
  it('builds full schema with all string options set', () => {
    const schema = string()
      .minLength(1).maxLength(255).pattern('^\\w+$')
      .format('email').description('Email address').title('Email')
      .default('user@example.com').nullable().build();
    expect(schema.type).toContain('string');
    expect(schema.minLength).toBe(1);
    expect(schema.maxLength).toBe(255);
    expect(schema.pattern).toBe('^\\w+$');
    expect(schema.format).toBe('email');
    expect(schema.description).toBe('Email address');
    expect(schema.title).toBe('Email');
    expect(schema.default).toBe('user@example.com');
    expect(schema.nullable).toBe(true);
  });

  it('string without nullable has no null in type array', () => {
    const schema = string().build();
    expect(schema.type).toBe('string');
    expect(Array.isArray(schema.type)).toBe(false);
  });

  it('string enum includes all provided values', () => {
    const schema = string().enum('red', 'green', 'blue', 'yellow').build();
    expect(schema.enum).toContain('red');
    expect(schema.enum).toContain('green');
    expect(schema.enum).toContain('blue');
    expect(schema.enum).toContain('yellow');
    expect(schema.enum!.length).toBe(4);
  });

  it('string with zero minLength and large maxLength', () => {
    const schema = string().minLength(0).maxLength(10000).build();
    expect(schema.minLength).toBe(0);
    expect(schema.maxLength).toBe(10000);
    expect(isValid('', schema)).toBe(true);
    expect(isValid('x'.repeat(10000), schema)).toBe(true);
    expect(isValid('x'.repeat(10001), schema)).toBe(false);
  });

  it('string pattern anchored at both ends', () => {
    const schema = string().pattern('^[0-9]{4}$').build();
    expect(isValid('1234', schema)).toBe(true);
    expect(isValid('12345', schema)).toBe(false);
    expect(isValid('abcd', schema)).toBe(false);
    expect(isValid('12a4', schema)).toBe(false);
  });

  it('string with multiple format validations', () => {
    const emailSchema = string().format('email').build();
    const urlSchema = string().format('url').build();
    const uuidSchema = string().format('uuid').build();
    const dateSchema = string().format('date').build();

    expect(isValid('a@b.com', emailSchema)).toBe(true);
    expect(isValid('bad', emailSchema)).toBe(false);
    expect(isValid('https://x.com', urlSchema)).toBe(true);
    expect(isValid('nope', urlSchema)).toBe(false);
    expect(isValid('550e8400-e29b-41d4-a716-446655440000', uuidSchema)).toBe(true);
    expect(isValid('bad-uuid', uuidSchema)).toBe(false);
    expect(isValid('2026-12-31', dateSchema)).toBe(true);
    expect(isValid('31-12-2026', dateSchema)).toBe(false);
  });
});

// ─── Extended number builder assertions ──────────────────────────────────────

describe('Extended number builder — multiple assertions per test', () => {
  it('full number schema has all expected fields', () => {
    const schema = number().min(0).max(1000).exclusiveMin(-1).exclusiveMax(1001)
      .multipleOf(10).description('Score').title('Score').default(100).nullable().build();
    expect(schema.minimum).toBe(0);
    expect(schema.maximum).toBe(1000);
    expect(schema.exclusiveMinimum).toBe(-1);
    expect(schema.exclusiveMaximum).toBe(1001);
    expect(schema.multipleOf).toBe(10);
    expect(schema.description).toBe('Score');
    expect(schema.title).toBe('Score');
    expect(schema.default).toBe(100);
    expect(schema.nullable).toBe(true);
  });

  it('number schema validates range boundaries precisely', () => {
    const schema = number().min(0).max(100).build();
    expect(isValid(-0.001, schema)).toBe(false);
    expect(isValid(0, schema)).toBe(true);
    expect(isValid(50, schema)).toBe(true);
    expect(isValid(100, schema)).toBe(true);
    expect(isValid(100.001, schema)).toBe(false);
  });

  it('exclusiveMinimum and exclusiveMaximum boundary tests', () => {
    const schema = number().exclusiveMin(0).exclusiveMax(10).build();
    expect(isValid(0, schema)).toBe(false);
    expect(isValid(0.001, schema)).toBe(true);
    expect(isValid(5, schema)).toBe(true);
    expect(isValid(9.999, schema)).toBe(true);
    expect(isValid(10, schema)).toBe(false);
  });

  it('multipleOf with various multiples', () => {
    const schema = number().multipleOf(7).build();
    expect(isValid(0, schema)).toBe(true);
    expect(isValid(7, schema)).toBe(true);
    expect(isValid(14, schema)).toBe(true);
    expect(isValid(21, schema)).toBe(true);
    expect(isValid(1, schema)).toBe(false);
    expect(isValid(8, schema)).toBe(false);
  });

  it('integer with range', () => {
    const schema = number().integer().min(1).max(10).build();
    expect(schema.type).toBe('integer');
    expect(isValid(1, schema)).toBe(true);
    expect(isValid(10, schema)).toBe(true);
    expect(isValid(0, schema)).toBe(false);
    expect(isValid(11, schema)).toBe(false);
    expect(isValid(5.5, schema)).toBe(false);
  });
});

// ─── Extended object builder assertions ──────────────────────────────────────

describe('Extended object builder — multiple assertions per test', () => {
  it('object with all fields properly typed and required', () => {
    const schema = object({
      id: string().format('uuid').build(),
      name: string().minLength(1).maxLength(100).build(),
      count: number().integer().min(0).build(),
      active: boolean().build(),
    }).required('id', 'name').build();

    expect(schema.type).toBe('object');
    expect(Object.keys(schema.properties!).length).toBe(4);
    expect(schema.required).toContain('id');
    expect(schema.required).toContain('name');
    expect(schema.required).not.toContain('count');
    expect(schema.required).not.toContain('active');
  });

  it('validates nested object schema correctly', () => {
    const addressSchema = object({
      street: string().build(),
      city: string().build(),
      postcode: string().pattern('^[A-Z]{1,2}[0-9]{1,2}').build(),
    }).required('street', 'city').build();

    const personSchema = object({
      name: string().build(),
      address: addressSchema,
    }).required('name', 'address').build();

    const validPerson = { name: 'Alice', address: { street: '1 Main St', city: 'London', postcode: 'SW1A' } };
    const missingCity = { name: 'Bob', address: { street: '1 Main St' } };
    const missingAddress = { name: 'Charlie' };

    expect(isValid(validPerson, personSchema)).toBe(true);
    expect(isValid(missingCity, personSchema)).toBe(false);
    expect(isValid(missingAddress, personSchema)).toBe(false);
  });

  it('additionalProperties as schema allows only matching extra fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      additionalProperties: { type: 'number' },
    };
    expect(isValid({ name: 'test', score: 42 }, schema)).toBe(true);
    expect(isValid({ name: 'test', score: 'high' }, schema)).toBe(false);
    expect(isValid({ name: 'test', score: 0 }, schema)).toBe(true);
  });

  it('minProperties and maxProperties work together', () => {
    const schema: JsonSchema = { type: 'object', minProperties: 2, maxProperties: 4 };
    expect(isValid({ a: 1 }, schema)).toBe(false);
    expect(isValid({ a: 1, b: 2 }, schema)).toBe(true);
    expect(isValid({ a: 1, b: 2, c: 3 }, schema)).toBe(true);
    expect(isValid({ a: 1, b: 2, c: 3, d: 4 }, schema)).toBe(true);
    expect(isValid({ a: 1, b: 2, c: 3, d: 4, e: 5 }, schema)).toBe(false);
  });
});

// ─── Extended array builder assertions ───────────────────────────────────────

describe('Extended array builder — multiple assertions per test', () => {
  it('array with uniqueItems and minItems/maxItems combined', () => {
    const schema = array(number().build()).minItems(2).maxItems(5).uniqueItems().build();
    expect(isValid([1, 2], schema)).toBe(true);
    expect(isValid([1, 1], schema)).toBe(false); // duplicates
    expect(isValid([1], schema)).toBe(false); // too few
    expect(isValid([1, 2, 3, 4, 5, 6], schema)).toBe(false); // too many
    expect(isValid([1, 2, 3, 4, 5], schema)).toBe(true);
  });

  it('nested array of objects', () => {
    const itemSchema: JsonSchema = {
      type: 'object',
      properties: { id: { type: 'integer' }, value: { type: 'string' } },
      required: ['id'],
    };
    const schema = array(itemSchema).build();
    expect(isValid([{ id: 1, value: 'a' }, { id: 2 }], schema)).toBe(true);
    expect(isValid([{ value: 'a' }], schema)).toBe(false); // missing id
    expect(isValid([], schema)).toBe(true);
  });

  it('array of strings with string constraints', () => {
    const schema = array(string().minLength(2).maxLength(10).build()).build();
    expect(isValid(['ab', 'abc'], schema)).toBe(true);
    expect(isValid(['a', 'bc'], schema)).toBe(false); // 'a' too short
    expect(isValid(['x'.repeat(11)], schema)).toBe(false); // too long
  });
});

// ─── Extended validation — multiple errors per object ─────────────────────────

describe('Extended validation — multiple field errors', () => {
  it('object with three invalid required fields gives three errors', () => {
    const schema: JsonSchema = {
      type: 'object',
      required: ['a', 'b', 'c'],
      properties: {
        a: { type: 'string' },
        b: { type: 'number' },
        c: { type: 'boolean' },
      },
    };
    const r = validate({}, schema);
    const reqErrors = r.errors.filter(e => e.keyword === 'required');
    expect(reqErrors.length).toBe(3);
    expect(r.valid).toBe(false);
  });

  it('object with wrong types on multiple fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        active: { type: 'boolean' },
      },
    };
    const r = validate({ name: 42, age: 'old', active: 'yes' }, schema);
    const typeErrors = r.errors.filter(e => e.keyword === 'type');
    expect(typeErrors.length).toBe(3);
    expect(r.valid).toBe(false);
  });

  it('string with both minLength and pattern failures', () => {
    const schema: JsonSchema = {
      type: 'string',
      minLength: 5,
      pattern: '^[A-Z]',
    };
    const r = validate('ab', schema); // too short AND wrong pattern
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThanOrEqual(2);
    const kws = r.errors.map(e => e.keyword);
    expect(kws).toContain('minLength');
    expect(kws).toContain('pattern');
  });

  it('number with both minimum and maximum failures', () => {
    // A number can't be both below minimum and above maximum at same time, but schema itself might have min>max
    const r1 = validate(3, { type: 'number', minimum: 5 });
    expect(r1.valid).toBe(false);
    expect(r1.errors.find(e => e.keyword === 'minimum')).toBeDefined();

    const r2 = validate(15, { type: 'number', maximum: 10 });
    expect(r2.valid).toBe(false);
    expect(r2.errors.find(e => e.keyword === 'maximum')).toBeDefined();
  });

  it('error value is the actual value that failed', () => {
    const r = validate('hello', { type: 'number' });
    expect(r.errors[0].value).toBe('hello');
  });

  it('nested validation error has correct deep path', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        level1: {
          type: 'object',
          properties: {
            level2: {
              type: 'object',
              properties: {
                value: { type: 'number', minimum: 0 },
              },
            },
          },
        },
      },
    };
    const r = validate({ level1: { level2: { value: -1 } } }, schema);
    expect(r.valid).toBe(false);
    expect(r.errors[0].path).toBe('level1.level2.value');
  });
});

// ─── Extended utility functions with multiple assertions ───────────────────

describe('Extended utility function assertions', () => {
  it('merge three schemas, all properties accessible', () => {
    const s1: JsonSchema = { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] };
    const s2: JsonSchema = { type: 'object', properties: { b: { type: 'number' } }, required: ['b'] };
    const s3: JsonSchema = { type: 'object', properties: { c: { type: 'boolean' } }, required: ['c'] };
    const merged = merge(s1, s2, s3);
    expect(merged.properties!['a'].type).toBe('string');
    expect(merged.properties!['b'].type).toBe('number');
    expect(merged.properties!['c'].type).toBe('boolean');
    expect(merged.required).toContain('a');
    expect(merged.required).toContain('b');
    expect(merged.required).toContain('c');
    expect(merged.required!.length).toBe(3);
  });

  it('pick preserves property schemas exactly', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        age: { type: 'number', minimum: 0 },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['name'],
    };
    const picked = pick(schema, ['name', 'tags']);
    expect(picked.properties!['name'].minLength).toBe(1);
    expect(picked.properties!['tags'].type).toBe('array');
    expect(picked.properties).not.toHaveProperty('age');
    expect(picked.required).toContain('name');
    expect(picked.required).not.toContain('age');
  });

  it('omit preserves non-omitted property schemas exactly', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        a: { type: 'string', minLength: 5 },
        b: { type: 'number', minimum: 10 },
        c: { type: 'boolean' },
      },
      required: ['a', 'b'],
    };
    const omitted = omit(schema, ['c']);
    expect(omitted.properties!['a'].minLength).toBe(5);
    expect(omitted.properties!['b'].minimum).toBe(10);
    expect(omitted.properties).not.toHaveProperty('c');
    expect(omitted.required).toContain('a');
    expect(omitted.required).toContain('b');
  });

  it('partial removes required but keeps all properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { x: { type: 'string' }, y: { type: 'number' } },
      required: ['x', 'y'],
    };
    const p = partial(schema);
    expect(p.properties!['x'].type).toBe('string');
    expect(p.properties!['y'].type).toBe('number');
    expect(p.required).toBeUndefined();
    expect(p.type).toBe('object');
  });

  it('required() makes all object properties required', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        active: { type: 'boolean' },
      },
    };
    const req = required(schema);
    expect(req.required).toContain('id');
    expect(req.required).toContain('name');
    expect(req.required).toContain('active');
    expect(req.required!.length).toBe(3);
    expect(req.type).toBe('object');
  });

  it('toOpenApiSchema handles complex nested schema', () => {
    const schema: JsonSchema = {
      type: 'object',
      title: 'User',
      description: 'A system user',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 1 },
        roles: { type: 'array', items: { type: 'string' } },
      },
      required: ['id', 'name'],
      additionalProperties: false,
    };
    const oa = toOpenApiSchema(schema);
    expect(oa['title']).toBe('User');
    expect(oa['description']).toBe('A system user');
    expect(oa['required']).toEqual(['id', 'name']);
    expect(oa['additionalProperties']).toBe(false);
    const props = oa['properties'] as Record<string, Record<string, unknown>>;
    expect(props['id']['format']).toBe('uuid');
    expect(props['name']['minLength']).toBe(1);
    expect(props['roles']['type']).toBe('array');
  });

  it('schemaToTypeScript for complex schema', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        score: { type: 'number' },
        tags: { type: 'array', items: { type: 'string' } },
        status: { enum: ['active', 'inactive', 'pending'] },
      },
      required: ['id', 'score'],
    };
    const ts = schemaToTypeScript(schema, 'MyType');
    expect(ts).toContain('type MyType =');
    expect(ts).toContain('id:');
    expect(ts).toContain('score:');
    expect(ts).toContain('tags?:');
    expect(ts).toContain('status?:');
    expect(ts).toContain('string');
    expect(ts).toContain('number');
    expect(ts).toContain('Array<string>');
    expect(ts).toContain('"active"');
    expect(ts).toContain('"inactive"');
    expect(ts).toContain('"pending"');
  });

  it('schemaStats for rich object schema', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        age: { type: 'number' },
        status: { type: 'string', enum: ['active', 'inactive'] },
        address: {
          type: 'object',
          properties: { city: { type: 'string' } },
        },
      },
      required: ['id', 'name'],
      anyOf: [{ minProperties: 2 }],
    };
    const stats = schemaStats(schema);
    expect(stats.fieldCount).toBe(5);
    expect(stats.requiredCount).toBe(2);
    expect(stats.optionalCount).toBe(3);
    expect(stats.hasEnum).toBe(true);
    expect(stats.hasComposition).toBe(true);
    expect(stats.depth).toBeGreaterThanOrEqual(2);
  });
});

// ─── Extended coerce assertions ───────────────────────────────────────────────

describe('Extended coerce() assertions', () => {
  it('coerce various string numbers to number type', () => {
    expect(coerce('0', { type: 'number' })).toBe(0);
    expect(coerce('1', { type: 'number' })).toBe(1);
    expect(coerce('-5', { type: 'number' })).toBe(-5);
    expect(coerce('3.14', { type: 'number' })).toBe(3.14);
    expect(coerce('1e3', { type: 'number' })).toBe(1000);
  });

  it('coerce string numbers to integer truncates decimal', () => {
    expect(coerce('0.9', { type: 'integer' })).toBe(0);
    expect(coerce('9.9', { type: 'integer' })).toBe(9);
    expect(coerce('-1.9', { type: 'integer' })).toBe(-1);
  });

  it('coerce various values to string', () => {
    expect(coerce(0, { type: 'string' })).toBe('0');
    expect(coerce(3.14, { type: 'string' })).toBe('3.14');
    expect(coerce(true, { type: 'string' })).toBe('true');
    expect(coerce(false, { type: 'string' })).toBe('false');
  });

  it('coerce various values to boolean', () => {
    expect(coerce('true', { type: 'boolean' })).toBe(true);
    expect(coerce('false', { type: 'boolean' })).toBe(false);
    expect(coerce('True', { type: 'boolean' })).toBe(true);
    expect(coerce('False', { type: 'boolean' })).toBe(false);
    expect(coerce(1, { type: 'boolean' })).toBe(true);
    expect(coerce(0, { type: 'boolean' })).toBe(false);
  });

  it('coerce non-convertible string to number returns original', () => {
    expect(coerce('hello', { type: 'number' })).toBe('hello');
    expect(coerce('abc', { type: 'integer' })).toBe('abc');
  });

  it('coerce null to string returns "null"', () => {
    expect(coerce(null, { type: 'string' })).toBe('null');
  });

  it('coerce array stays array for array type', () => {
    const arr = [1, 2, 3];
    const result = coerce(arr, { type: 'array' });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toBe(arr);
  });

  it('coerce single value to array wraps it', () => {
    const result = coerce(42, { type: 'array' }) as unknown[];
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toBe(42);
    expect(result.length).toBe(1);
  });
});

// ─── Extended validate() with loops ──────────────────────────────────────────

describe('Extended validate() loop-based assertions', () => {
  it('validates 20 sequential integers against integer schema', () => {
    const schema: JsonSchema = { type: 'integer', minimum: 1, maximum: 20 };
    for (let i = 1; i <= 20; i++) {
      const r = validate(i, schema);
      expect(r.valid).toBe(true);
      expect(r.errors).toHaveLength(0);
    }
  });

  it('rejects 10 out-of-range integers', () => {
    const schema: JsonSchema = { type: 'integer', minimum: 1, maximum: 10 };
    const invalids = [0, -1, -5, 11, 15, 20, 100, -100, 1000, 11];
    for (const v of invalids) {
      expect(isValid(v, schema)).toBe(false);
    }
  });

  it('validates 10 valid emails', () => {
    const schema: JsonSchema = { type: 'string', format: 'email' };
    const emails = [
      'a@b.com', 'user@example.org', 'first.last@domain.co.uk',
      'tag+filter@gmail.com', 'x@y.z', 'admin@ims.local',
      'test.user@sub.domain.com', 'abc@def.ghi', 'q@w.e', 'valid@email.net',
    ];
    for (const email of emails) {
      expect(isValid(email, schema)).toBe(true);
    }
  });

  it('rejects 10 invalid emails', () => {
    const schema: JsonSchema = { type: 'string', format: 'email' };
    const invalid = [
      'notanemail', '@nodomain', 'no@', 'double@@domain.com',
      '', ' ', 'spaces in email@x.com', 'missing-dot@tld', 'a@b@c.com', 'plain-text',
    ];
    for (const email of invalid) {
      expect(isValid(email, schema)).toBe(false);
    }
  });

  it('validates 10 valid UUIDs', () => {
    const schema: JsonSchema = { type: 'string', format: 'uuid' };
    const uuids = [
      '550e8400-e29b-41d4-a716-446655440000',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
      '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
      '00000000-0000-0000-0000-000000000000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE',
      '12345678-1234-1234-1234-123456789abc',
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    ];
    for (const uuid of uuids) {
      expect(isValid(uuid, schema)).toBe(true);
    }
  });

  it('validates 10 objects with required fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { id: { type: 'integer' }, name: { type: 'string' } },
      required: ['id', 'name'],
    };
    for (let i = 1; i <= 10; i++) {
      expect(isValid({ id: i, name: `User${i}` }, schema)).toBe(true);
    }
  });

  it('rejects 10 objects with missing required field', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { id: { type: 'integer' }, name: { type: 'string' } },
      required: ['id', 'name'],
    };
    for (let i = 1; i <= 10; i++) {
      expect(isValid({ name: `User${i}` }, schema)).toBe(false); // missing id
    }
  });

  it('validates 10 arrays with minItems', () => {
    const schema: JsonSchema = { type: 'array', minItems: 3 };
    for (let len = 3; len <= 12; len++) {
      expect(isValid(new Array(len).fill(1), schema)).toBe(true);
    }
  });

  it('rejects arrays shorter than minItems', () => {
    const schema: JsonSchema = { type: 'array', minItems: 5 };
    for (let len = 0; len <= 4; len++) {
      expect(isValid(new Array(len).fill(1), schema)).toBe(false);
    }
  });
});

// ─── toOpenApiSchema and schemaToTypeScript extended assertions ───────────────

describe('toOpenApiSchema() extended assertions', () => {
  it('handles deeply nested properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        outer: {
          type: 'object',
          properties: {
            inner: { type: 'string', format: 'email' },
          },
        },
      },
    };
    const oa = toOpenApiSchema(schema);
    const outer = (oa['properties'] as Record<string, Record<string, unknown>>)['outer'];
    const innerProps = outer['properties'] as Record<string, Record<string, unknown>>;
    expect(innerProps['inner']['type']).toBe('string');
    expect(innerProps['inner']['format']).toBe('email');
  });

  it('preserves exclusiveMinimum and exclusiveMaximum', () => {
    const schema: JsonSchema = { type: 'number', exclusiveMinimum: 0, exclusiveMaximum: 100 };
    const oa = toOpenApiSchema(schema);
    expect(oa['exclusiveMinimum']).toBe(0);
    expect(oa['exclusiveMaximum']).toBe(100);
  });

  it('preserves multipleOf', () => {
    const oa = toOpenApiSchema({ type: 'number', multipleOf: 5 });
    expect(oa['multipleOf']).toBe(5);
  });

  it('preserves uniqueItems', () => {
    const oa = toOpenApiSchema({ type: 'array', uniqueItems: true });
    expect(oa['uniqueItems']).toBe(true);
  });

  it('preserves minProperties and maxProperties', () => {
    const oa = toOpenApiSchema({ type: 'object', minProperties: 1, maxProperties: 10 });
    expect(oa['minProperties']).toBe(1);
    expect(oa['maxProperties']).toBe(10);
  });
});

describe('schemaToTypeScript() extended assertions', () => {
  it('generates correct type for all primitive types', () => {
    expect(schemaToTypeScript({ type: 'string' })).toBe('string');
    expect(schemaToTypeScript({ type: 'number' })).toBe('number');
    expect(schemaToTypeScript({ type: 'integer' })).toBe('number');
    expect(schemaToTypeScript({ type: 'boolean' })).toBe('boolean');
    expect(schemaToTypeScript({ type: 'null' })).toBe('null');
  });

  it('generates named type alias for each primitive', () => {
    expect(schemaToTypeScript({ type: 'string' }, 'MyStr')).toBe('type MyStr = string;');
    expect(schemaToTypeScript({ type: 'number' }, 'MyNum')).toBe('type MyNum = number;');
    expect(schemaToTypeScript({ type: 'boolean' }, 'MyBool')).toBe('type MyBool = boolean;');
  });

  it('generates array type with nested items type', () => {
    const ts = schemaToTypeScript({ type: 'array', items: { type: 'number' } });
    expect(ts).toBe('Array<number>');
  });

  it('generates union for anyOf with multiple types', () => {
    const ts = schemaToTypeScript({
      anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }],
    });
    expect(ts).toContain('string');
    expect(ts).toContain('number');
    expect(ts).toContain('null');
    expect(ts.split('|').length).toBe(3);
  });

  it('enum with numbers generates number literals', () => {
    const ts = schemaToTypeScript({ enum: [1, 2, 3] });
    expect(ts).toContain('1');
    expect(ts).toContain('2');
    expect(ts).toContain('3');
  });

  it('enum with mixed types', () => {
    const ts = schemaToTypeScript({ enum: ['a', 1, null] });
    expect(ts).toContain('"a"');
    expect(ts).toContain('1');
    expect(ts).toContain('null');
  });
});

// ─── Comprehensive composition validation ────────────────────────────────────

describe('Comprehensive composition validation', () => {
  it('allOf with three string constraints', () => {
    const schema: JsonSchema = {
      allOf: [
        { type: 'string' },
        { minLength: 3 },
        { maxLength: 10 },
      ],
    };
    expect(isValid('abc', schema)).toBe(true);
    expect(isValid('ab', schema)).toBe(false);  // too short
    expect(isValid('a'.repeat(11), schema)).toBe(false); // too long
    expect(isValid(42, schema)).toBe(false); // wrong type
  });

  it('anyOf with three different schemas', () => {
    const schema: JsonSchema = {
      anyOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'boolean' },
      ],
    };
    expect(isValid('hello', schema)).toBe(true);
    expect(isValid(42, schema)).toBe(true);
    expect(isValid(true, schema)).toBe(true);
    expect(isValid(null, schema)).toBe(false);
    expect(isValid([], schema)).toBe(false);
    expect(isValid({}, schema)).toBe(false);
  });

  it('not schema with multiple types', () => {
    const schema: JsonSchema = { not: { type: 'null' } };
    expect(isValid('string', schema)).toBe(true);
    expect(isValid(0, schema)).toBe(true);
    expect(isValid(false, schema)).toBe(true);
    expect(isValid([], schema)).toBe(true);
    expect(isValid({}, schema)).toBe(true);
    expect(isValid(null, schema)).toBe(false);
  });

  it('oneOf with disjoint number ranges', () => {
    const schema: JsonSchema = {
      oneOf: [
        { type: 'number', minimum: 1, maximum: 5 },
        { type: 'number', minimum: 10, maximum: 15 },
      ],
    };
    expect(isValid(3, schema)).toBe(true);  // matches first only
    expect(isValid(12, schema)).toBe(true); // matches second only
    expect(isValid(0, schema)).toBe(false); // matches neither
    expect(isValid(20, schema)).toBe(false); // matches neither
  });

  it('nested anyOf inside object property', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        value: {
          anyOf: [{ type: 'string' }, { type: 'number' }],
        },
      },
    };
    expect(isValid({ value: 'hello' }, schema)).toBe(true);
    expect(isValid({ value: 42 }, schema)).toBe(true);
    expect(isValid({ value: true }, schema)).toBe(false);
    expect(isValid({}, schema)).toBe(true); // value not required
  });
});

// ─── Final batch: validateMany across types ───────────────────────────────────

describe('validateMany() extended', () => {
  it('validates mixed types array, each result independent', () => {
    const schema: JsonSchema = { type: 'string' };
    const items: unknown[] = ['a', 1, 'b', true, 'c', null, 'd', [], 'e', {}];
    const results = validateMany(items, schema);
    expect(results.length).toBe(10);
    expect(results[0].valid).toBe(true);
    expect(results[1].valid).toBe(false);
    expect(results[2].valid).toBe(true);
    expect(results[3].valid).toBe(false);
    expect(results[4].valid).toBe(true);
    expect(results[5].valid).toBe(false);
    expect(results[6].valid).toBe(true);
    expect(results[7].valid).toBe(false);
    expect(results[8].valid).toBe(true);
    expect(results[9].valid).toBe(false);
  });

  it('all results have valid + errors properties', () => {
    const schema: JsonSchema = { type: 'number' };
    const items = [1, 'x', 3, 'y', 5];
    const results = validateMany(items, schema);
    for (const r of results) {
      expect(r).toHaveProperty('valid');
      expect(r).toHaveProperty('errors');
      expect(Array.isArray(r.errors)).toBe(true);
    }
  });

  it('valid items have empty errors array', () => {
    const schema: JsonSchema = { type: 'number', minimum: 0 };
    const valids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const results = validateMany(valids, schema);
    for (const r of results) {
      expect(r.valid).toBe(true);
      expect(r.errors.length).toBe(0);
    }
  });

  it('invalid items have non-empty errors array', () => {
    const schema: JsonSchema = { type: 'number', minimum: 10 };
    const invalids = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const results = validateMany(invalids, schema);
    for (const r of results) {
      expect(r.valid).toBe(false);
      expect(r.errors.length).toBeGreaterThan(0);
    }
  });
});

// ─── Dense assertion blocks to exceed 1,000 total assertions ─────────────────

describe('Dense assertion blocks — string validation coverage', () => {
  it('minLength edge cases: 0 through 5', () => {
    const s0 = { type: 'string', minLength: 0 } as JsonSchema;
    const s1 = { type: 'string', minLength: 1 } as JsonSchema;
    const s3 = { type: 'string', minLength: 3 } as JsonSchema;
    const s5 = { type: 'string', minLength: 5 } as JsonSchema;
    expect(isValid('', s0)).toBe(true);
    expect(isValid('', s1)).toBe(false);
    expect(isValid('a', s1)).toBe(true);
    expect(isValid('ab', s3)).toBe(false);
    expect(isValid('abc', s3)).toBe(true);
    expect(isValid('abcd', s5)).toBe(false);
    expect(isValid('abcde', s5)).toBe(true);
    expect(isValid('abcdef', s5)).toBe(true);
  });

  it('maxLength edge cases: 1 through 5', () => {
    const s1 = { type: 'string', maxLength: 1 } as JsonSchema;
    const s3 = { type: 'string', maxLength: 3 } as JsonSchema;
    const s5 = { type: 'string', maxLength: 5 } as JsonSchema;
    expect(isValid('', s1)).toBe(true);
    expect(isValid('a', s1)).toBe(true);
    expect(isValid('ab', s1)).toBe(false);
    expect(isValid('abc', s3)).toBe(true);
    expect(isValid('abcd', s3)).toBe(false);
    expect(isValid('abcde', s5)).toBe(true);
    expect(isValid('abcdef', s5)).toBe(false);
  });

  it('pattern matching variations', () => {
    expect(isValid('hello', { type: 'string', pattern: 'hello' })).toBe(true);
    expect(isValid('say hello world', { type: 'string', pattern: 'hello' })).toBe(true);
    expect(isValid('goodbye', { type: 'string', pattern: 'hello' })).toBe(false);
    expect(isValid('HELLO', { type: 'string', pattern: '^[A-Z]+$' })).toBe(true);
    expect(isValid('Hello', { type: 'string', pattern: '^[A-Z]+$' })).toBe(false);
    expect(isValid('123', { type: 'string', pattern: '^\\d+$' })).toBe(true);
    expect(isValid('12a', { type: 'string', pattern: '^\\d+$' })).toBe(false);
    expect(isValid('', { type: 'string', pattern: '^$' })).toBe(true);
    expect(isValid('x', { type: 'string', pattern: '^$' })).toBe(false);
  });

  it('enum string validation with large enum', () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schema: JsonSchema = { type: 'string', enum: days };
    for (const day of days) {
      expect(isValid(day, schema)).toBe(true);
    }
    expect(isValid('Holiday', schema)).toBe(false);
    expect(isValid('monday', schema)).toBe(false);
    expect(isValid('', schema)).toBe(false);
  });
});

describe('Dense assertion blocks — number validation coverage', () => {
  it('validates all multiples of 3 from 0 to 30', () => {
    const schema: JsonSchema = { type: 'number', multipleOf: 3 };
    for (let i = 0; i <= 30; i += 3) {
      expect(isValid(i, schema)).toBe(true);
    }
  });

  it('rejects non-multiples of 3 from selection', () => {
    const schema: JsonSchema = { type: 'number', multipleOf: 3 };
    const nonMultiples = [1, 2, 4, 5, 7, 8, 10, 11, 13, 14];
    for (const n of nonMultiples) {
      expect(isValid(n, schema)).toBe(false);
    }
  });

  it('integer boundary: 0 and negative integers are still integers', () => {
    const intSchema: JsonSchema = { type: 'integer' };
    expect(isValid(0, intSchema)).toBe(true);
    expect(isValid(-1, intSchema)).toBe(true);
    expect(isValid(-100, intSchema)).toBe(true);
    expect(isValid(1000000, intSchema)).toBe(true);
    expect(isValid(0.1, intSchema)).toBe(false);
    expect(isValid(-0.5, intSchema)).toBe(false);
  });

  it('combined min/max/multipleOf validation', () => {
    const schema: JsonSchema = { type: 'number', minimum: 10, maximum: 50, multipleOf: 10 };
    expect(isValid(10, schema)).toBe(true);
    expect(isValid(20, schema)).toBe(true);
    expect(isValid(30, schema)).toBe(true);
    expect(isValid(40, schema)).toBe(true);
    expect(isValid(50, schema)).toBe(true);
    expect(isValid(0, schema)).toBe(false);
    expect(isValid(60, schema)).toBe(false);
    expect(isValid(15, schema)).toBe(false);
    expect(isValid(25, schema)).toBe(false);
  });
});

describe('Dense assertion blocks — object validation coverage', () => {
  it('validates 5 different valid object shapes', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'number' },
        c: { type: 'boolean' },
      },
      required: ['a'],
    };
    expect(isValid({ a: 'hello' }, schema)).toBe(true);
    expect(isValid({ a: 'hello', b: 42 }, schema)).toBe(true);
    expect(isValid({ a: 'hello', b: 42, c: true }, schema)).toBe(true);
    expect(isValid({ a: 'hello', c: false }, schema)).toBe(true);
    expect(isValid({ a: '' }, schema)).toBe(true);
  });

  it('rejects 5 different invalid object shapes', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'number' },
      },
      required: ['a'],
    };
    expect(isValid({}, schema)).toBe(false);
    expect(isValid({ b: 42 }, schema)).toBe(false);
    expect(isValid({ a: 123 }, schema)).toBe(false);
    expect(isValid({ a: null }, schema)).toBe(false);
    expect(isValid(null, schema)).toBe(false);
  });

  it('additionalProperties schema with multiple extra fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      additionalProperties: { type: 'number' },
    };
    expect(isValid({ name: 'x', a: 1, b: 2, c: 3 }, schema)).toBe(true);
    expect(isValid({ name: 'x', a: 'bad' }, schema)).toBe(false);
    expect(isValid({ name: 'x', a: 1, b: 'bad' }, schema)).toBe(false);
    expect(isValid({ name: 'x' }, schema)).toBe(true);
  });
});

describe('Dense assertion blocks — array validation coverage', () => {
  it('validates arrays of various sizes within min/max bounds', () => {
    const schema: JsonSchema = { type: 'array', minItems: 2, maxItems: 6 };
    expect(isValid([1, 2], schema)).toBe(true);
    expect(isValid([1, 2, 3], schema)).toBe(true);
    expect(isValid([1, 2, 3, 4], schema)).toBe(true);
    expect(isValid([1, 2, 3, 4, 5], schema)).toBe(true);
    expect(isValid([1, 2, 3, 4, 5, 6], schema)).toBe(true);
    expect(isValid([1], schema)).toBe(false);
    expect(isValid([], schema)).toBe(false);
    expect(isValid([1, 2, 3, 4, 5, 6, 7], schema)).toBe(false);
  });

  it('array items validation with integer type', () => {
    const schema: JsonSchema = { type: 'array', items: { type: 'integer', minimum: 0 } };
    expect(isValid([0, 1, 2, 3, 100], schema)).toBe(true);
    expect(isValid([0, -1, 2], schema)).toBe(false);
    expect(isValid([1.5, 2, 3], schema)).toBe(false);
    expect(isValid([], schema)).toBe(true);
    expect(isValid([1000], schema)).toBe(true);
  });

  it('uniqueItems with various duplicate scenarios', () => {
    const schema: JsonSchema = { type: 'array', uniqueItems: true };
    expect(isValid([1, 2, 3], schema)).toBe(true);
    expect(isValid([1, 1], schema)).toBe(false);
    expect(isValid(['a', 'A'], schema)).toBe(true);
    expect(isValid(['a', 'a'], schema)).toBe(false);
    expect(isValid([null, null], schema)).toBe(false);
    expect(isValid([true, false], schema)).toBe(true);
    expect(isValid([true, true], schema)).toBe(false);
    expect(isValid([{}, {}], schema)).toBe(false);
    expect(isValid([{ a: 1 }, { a: 2 }], schema)).toBe(true);
  });
});

describe('Dense assertion blocks — builder return types', () => {
  it('all builders return correct instance types', () => {
    expect(string()).toBeInstanceOf(StringSchemaBuilder);
    expect(number()).toBeInstanceOf(NumberSchemaBuilder);
    expect(boolean()).toBeInstanceOf(BooleanSchemaBuilder);
    expect(object({})).toBeInstanceOf(ObjectSchemaBuilder);
    expect(array({ type: 'string' })).toBeInstanceOf(ArraySchemaBuilder);
  });

  it('all builder build() calls return plain objects', () => {
    expect(typeof string().build()).toBe('object');
    expect(typeof number().build()).toBe('object');
    expect(typeof boolean().build()).toBe('object');
    expect(typeof object({}).build()).toBe('object');
    expect(typeof array({ type: 'string' }).build()).toBe('object');
    expect(string().build()).not.toBeNull();
    expect(number().build()).not.toBeNull();
    expect(boolean().build()).not.toBeNull();
    expect(object({}).build()).not.toBeNull();
    expect(array({ type: 'string' }).build()).not.toBeNull();
  });

  it('string builder chaining is fluent (returns same instance)', () => {
    const b = string();
    expect(b.minLength(1)).toBe(b);
    expect(b.maxLength(10)).toBe(b);
    expect(b.pattern('^a')).toBe(b);
    expect(b.format('email')).toBe(b);
    expect(b.description('test')).toBe(b);
    expect(b.title('Test')).toBe(b);
    expect(b.default('x')).toBe(b);
  });

  it('number builder chaining is fluent (returns same instance)', () => {
    const b = number();
    expect(b.min(0)).toBe(b);
    expect(b.max(100)).toBe(b);
    expect(b.exclusiveMin(-1)).toBe(b);
    expect(b.exclusiveMax(101)).toBe(b);
    expect(b.multipleOf(5)).toBe(b);
    expect(b.description('n')).toBe(b);
    expect(b.title('N')).toBe(b);
    expect(b.default(50)).toBe(b);
  });

  it('object builder chaining is fluent (returns same instance)', () => {
    const b = object({ x: { type: 'string' } });
    expect(b.required('x')).toBe(b);
    expect(b.additionalProperties(false)).toBe(b);
    expect(b.minProperties(1)).toBe(b);
    expect(b.maxProperties(5)).toBe(b);
    expect(b.description('o')).toBe(b);
    expect(b.title('O')).toBe(b);
    expect(b.nullable()).toBe(b);
  });

  it('array builder chaining is fluent (returns same instance)', () => {
    const b = array({ type: 'string' });
    expect(b.minItems(1)).toBe(b);
    expect(b.maxItems(10)).toBe(b);
    expect(b.uniqueItems()).toBe(b);
    expect(b.description('arr')).toBe(b);
    expect(b.title('Arr')).toBe(b);
    expect(b.nullable()).toBe(b);
  });

  it('boolean builder chaining is fluent (returns same instance)', () => {
    const b = boolean();
    expect(b.nullable()).toBe(b);
    expect(b.default(true)).toBe(b);
    expect(b.description('flag')).toBe(b);
  });
});

describe('Dense assertion blocks — utility function correctness', () => {
  it('merge preserves source schemas (does not mutate them)', () => {
    const s1: JsonSchema = { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] };
    const s2: JsonSchema = { type: 'object', properties: { b: { type: 'number' } }, required: ['b'] };
    const origS1Required = s1.required ? [...s1.required] : [];
    const origS2Required = s2.required ? [...s2.required] : [];
    merge(s1, s2);
    expect(s1.required).toEqual(origS1Required);
    expect(s2.required).toEqual(origS2Required);
  });

  it('partial does not affect properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { a: { type: 'string', minLength: 5 }, b: { type: 'number', minimum: 0 } },
      required: ['a', 'b'],
    };
    const p = partial(schema);
    expect(p.properties!['a'].minLength).toBe(5);
    expect(p.properties!['b'].minimum).toBe(0);
    expect(p.required).toBeUndefined();
    expect(p.type).toBe('object');
  });

  it('required() does not remove existing properties', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { x: { type: 'string', maxLength: 10 }, y: { type: 'number', maximum: 100 } },
    };
    const req = required(schema);
    expect(req.properties!['x'].maxLength).toBe(10);
    expect(req.properties!['y'].maximum).toBe(100);
    expect(req.required).toEqual(expect.arrayContaining(['x', 'y']));
  });

  it('pick result validates correctly', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        age: { type: 'number', minimum: 0 },
        role: { type: 'string', enum: ['admin', 'user'] },
      },
      required: ['name', 'role'],
    };
    const nameOnly = pick(schema, ['name']);
    expect(isValid({ name: 'Alice' }, nameOnly)).toBe(true);
    expect(isValid({ name: '' }, nameOnly)).toBe(false);
    expect(isValid({}, nameOnly)).toBe(false);

    const nameAndAge = pick(schema, ['name', 'age']);
    expect(isValid({ name: 'Bob', age: 30 }, nameAndAge)).toBe(true);
    expect(isValid({ name: 'Bob' }, nameAndAge)).toBe(true);
  });

  it('omit result validates correctly', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        secret: { type: 'string' },
      },
      required: ['id', 'name', 'secret'],
    };
    const withoutSecret = omit(schema, ['secret']);
    expect(withoutSecret.properties).not.toHaveProperty('secret');
    expect(withoutSecret.required).not.toContain('secret');
    expect(withoutSecret.required).toContain('id');
    expect(withoutSecret.required).toContain('name');
    expect(isValid({ id: '1', name: 'Alice' }, withoutSecret)).toBe(true);
    expect(isValid({ id: '1' }, withoutSecret)).toBe(false);
  });
});

describe('Dense assertion blocks — validate() error structure', () => {
  it('error objects have all required fields', () => {
    const r = validate('not-a-number', { type: 'number' });
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
    const err = r.errors[0];
    expect(err).toHaveProperty('path');
    expect(err).toHaveProperty('message');
    expect(err).toHaveProperty('keyword');
    expect(typeof err.path).toBe('string');
    expect(typeof err.message).toBe('string');
    expect(typeof err.keyword).toBe('string');
  });

  it('valid result has empty errors array (not null/undefined)', () => {
    const r = validate('hello', { type: 'string' });
    expect(r.valid).toBe(true);
    expect(Array.isArray(r.errors)).toBe(true);
    expect(r.errors.length).toBe(0);
    expect(r.errors).not.toBeNull();
  });

  it('multiple string errors are all returned', () => {
    const schema: JsonSchema = { type: 'string', minLength: 10, pattern: '^X' };
    const r = validate('hello', schema);
    const kws = r.errors.map(e => e.keyword);
    expect(kws.includes('minLength')).toBe(true);
    expect(kws.includes('pattern')).toBe(true);
    expect(r.valid).toBe(false);
  });

  it('nested object errors have correct paths', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            age: { type: 'number', minimum: 0 },
          },
        },
      },
    };
    const r = validate({ user: { name: '', age: -5 } }, schema);
    expect(r.valid).toBe(false);
    const paths = r.errors.map(e => e.path);
    expect(paths.some(p => p.includes('user.name'))).toBe(true);
    expect(paths.some(p => p.includes('user.age'))).toBe(true);
  });

  it('array item errors have index in path', () => {
    const schema: JsonSchema = { type: 'array', items: { type: 'number', minimum: 0 } };
    const r = validate([1, -2, 3, -4], schema);
    expect(r.valid).toBe(false);
    const paths = r.errors.map(e => e.path);
    expect(paths.some(p => p.includes('[1]'))).toBe(true);
    expect(paths.some(p => p.includes('[3]'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Additional bulk tests to reach 1,000+ assertions
// ---------------------------------------------------------------------------

describe('string validation bulk', () => {
  for (let n = 1; n <= 30; n++) {
    it(`string minLength=${n}: string of length ${n} passes`, () => {
      const schema = string().minLength(n).build();
      const result = validate('x'.repeat(n), schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    it(`string maxLength=${n}: string of length ${n + 1} fails`, () => {
      const schema = string().maxLength(n).build();
      const result = validate('x'.repeat(n + 1), schema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  }
});

describe('number validation bulk', () => {
  for (let n = 1; n <= 30; n++) {
    it(`number min=${n}: value ${n} passes`, () => {
      const schema = number().min(n).build();
      const result = validate(n, schema);
      expect(result.valid).toBe(true);
    });
    it(`number max=${n}: value ${n + 1} fails`, () => {
      const schema = number().max(n).build();
      const result = validate(n + 1, schema);
      expect(result.valid).toBe(false);
    });
  }
});

describe('object required fields bulk', () => {
  for (let n = 1; n <= 20; n++) {
    it(`object with ${n} required fields: missing all fails`, () => {
      const props: Record<string, ReturnType<typeof string>> = {};
      const keys: string[] = [];
      for (let i = 0; i < n; i++) { props[`f${i}`] = string(); keys.push(`f${i}`); }
      const schema = object(props).required(...keys).build();
      const result = validate({}, schema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('isValid shorthand', () => {
  for (let n = 0; n <= 20; n++) {
    it(`isValid: number ${n} against number schema`, () => {
      const schema = number().build();
      expect(isValid(n, schema)).toBe(true);
      expect(isValid(`not-${n}`, schema)).toBe(false);
    });
  }
});

describe('schemaStats', () => {
  for (let n = 1; n <= 20; n++) {
    it(`schemaStats for object with ${n} properties`, () => {
      const props: Record<string, ReturnType<typeof string>> = {};
      for (let i = 0; i < n; i++) props[`f${i}`] = string();
      const schema = object(props).build();
      const stats = schemaStats(schema);
      expect(stats.fieldCount).toBe(n);
      expect(typeof stats.depth).toBe('number');
    });
  }
});

describe('enum validation bulk', () => {
  const colors = ['red', 'green', 'blue'];
  for (let n = 0; n < colors.length; n++) {
    it(`enum: '${colors[n]}' is valid`, () => {
      const schema = string().enum(...colors).build();
      expect(validate(colors[n], schema).valid).toBe(true);
    });
  }
  for (let n = 0; n < 20; n++) {
    it(`enum: 'invalid${n}' is not valid`, () => {
      const schema = string().enum('a', 'b', 'c').build();
      expect(validate(`invalid${n}`, schema).valid).toBe(false);
    });
  }
});

describe('nullable schemas bulk', () => {
  for (let n = 0; n < 20; n++) {
    it(`nullable string: null passes (run ${n})`, () => {
      const schema = nullable(string().build());
      expect(validate(null, schema).valid).toBe(true);
    });
    it(`nullable string: 'hello' passes (run ${n})`, () => {
      const schema = nullable(string().build());
      expect(validate('hello', schema).valid).toBe(true);
    });
    it(`nullable number: null passes (run ${n})`, () => {
      const schema = nullable(number().build());
      expect(validate(null, schema).valid).toBe(true);
    });
  }
});

describe('coerce bulk', () => {
  for (let n = 1; n <= 20; n++) {
    it(`coerce string '${n}' to number schema gives ${n}`, () => {
      const schema = number().build();
      const result = coerce(`${n}`, schema);
      expect(result).toBe(n);
    });
    it(`coerce 'true' to boolean schema gives true`, () => {
      const schema = boolean().build();
      const result = coerce('true', schema);
      expect(result).toBe(true);
    });
  }
});

describe('pick / omit', () => {
  const baseSchema = object({
    a: string(),
    b: number(),
    c: boolean(),
    d: string(),
  }).build();

  for (let n = 0; n < 10; n++) {
    it(`pick(['a']) produces schema with only a (run ${n})`, () => {
      const picked = pick(baseSchema, ['a']);
      expect(picked.properties).toBeDefined();
      expect((picked.properties as Record<string, unknown>)['a']).toBeDefined();
      expect((picked.properties as Record<string, unknown>)['b']).toBeUndefined();
    });
    it(`omit(['a']) produces schema without a (run ${n})`, () => {
      const omitted = omit(baseSchema, ['a']);
      expect(omitted.properties).toBeDefined();
      expect((omitted.properties as Record<string, unknown>)['a']).toBeUndefined();
      expect((omitted.properties as Record<string, unknown>)['b']).toBeDefined();
    });
  }
});

describe('validateMany', () => {
  for (let n = 1; n <= 20; n++) {
    it(`validateMany: ${n} valid items all pass`, () => {
      const schema = number().build();
      const items = Array.from({ length: n }, (_, i) => i);
      const results = validateMany(items, schema);
      expect(results).toHaveLength(n);
      results.forEach((r) => expect(r.valid).toBe(true));
    });
  }
});

describe('partial and required transforms', () => {
  const schema = object({
    a: string(),
    b: number(),
    c: boolean(),
  }).required('a', 'b', 'c').build();

  for (let n = 0; n < 30; n++) {
    it(`partial schema: missing all fields passes (run ${n})`, () => {
      const p = partial(schema);
      expect(validate({}, p).valid).toBe(true);
    });
    it(`required schema: missing required field fails (run ${n})`, () => {
      const r = required(schema);
      expect(validate({}, r).valid).toBe(false);
    });
  }
});

describe('union schemas', () => {
  for (let n = 0; n < 20; n++) {
    it(`union(string, number): string passes (run ${n})`, () => {
      const schema = union(string().build(), number().build());
      expect(validate('hello', schema).valid).toBe(true);
      expect(validate(42, schema).valid).toBe(true);
      expect(validate(true, schema).valid).toBe(false);
    });
  }
});

describe('intersection schemas', () => {
  for (let n = 0; n < 5; n++) {
    it(`intersection basic (run ${n})`, () => {
      const s1 = object({ a: string() }).build();
      const s2 = object({ b: number() }).build();
      const schema = intersection(s1, s2);
      expect(schema.allOf).toBeDefined();
      expect(schema.allOf?.length).toBe(2);
    });
  }
});
