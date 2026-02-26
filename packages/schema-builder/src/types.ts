// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type JsonSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';

export interface JsonSchema {
  type?: JsonSchemaType | JsonSchemaType[];
  title?: string;
  description?: string;
  // String
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  enum?: unknown[];
  // Number
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  // Object
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  minProperties?: number;
  maxProperties?: number;
  // Array
  items?: JsonSchema | JsonSchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  // Composition
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
  // Other
  nullable?: boolean;
  default?: unknown;
  examples?: unknown[];
  $ref?: string;
  $defs?: Record<string, JsonSchema>;
}

export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
  keyword: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
