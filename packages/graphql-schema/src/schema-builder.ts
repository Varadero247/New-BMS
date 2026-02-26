// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

/** Returns standard pagination argument definitions */
export function buildPageArgs(): Record<string, unknown> {
  return {
    first: { type: 'Int', defaultValue: 20, description: 'Number of items to return' },
    after: { type: 'String', description: 'Cursor for forward pagination' },
    last: { type: 'Int', description: 'Number of items from the end' },
    before: { type: 'String', description: 'Cursor for backward pagination' },
  };
}

/** Builds filter argument definitions for given fields */
export function buildFilterArgs(fields: string[]): Record<string, unknown> {
  const args: Record<string, unknown> = {};
  for (const field of fields) {
    args[field] = { type: `${field}Filter`, description: `Filter by ${field}` };
  }
  return args;
}

/** Builds sort argument definitions for given fields */
export function buildSortArgs(fields: string[]): Record<string, unknown> {
  const args: Record<string, unknown> = {};
  for (const field of fields) {
    args[`sortBy${field.charAt(0).toUpperCase()}${field.slice(1)}`] = {
      type: 'SortOrder',
      description: `Sort by ${field}`,
    };
  }
  return args;
}

/** Basic GraphQL query validation — checks balanced braces, valid characters */
export function validateGraphQLQuery(query: string): { valid: boolean; errors?: string[] } {
  if (!query || typeof query !== 'string') {
    return { valid: false, errors: ['Query must be a non-empty string'] };
  }

  const errors: string[] = [];

  // Check balanced braces
  let depth = 0;
  for (const ch of query) {
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth < 0) {
      errors.push('Unmatched closing brace }');
      break;
    }
  }
  if (depth > 0) errors.push(`Unclosed brace: ${depth} opening brace(s) not closed`);

  // Check balanced parentheses
  let parenDepth = 0;
  for (const ch of query) {
    if (ch === '(') parenDepth++;
    else if (ch === ')') parenDepth--;
    if (parenDepth < 0) {
      errors.push('Unmatched closing parenthesis )');
      break;
    }
  }
  if (parenDepth > 0) errors.push(`Unclosed parenthesis: ${parenDepth} opening paren(s) not closed`);

  // Disallow invalid control characters
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(query)) {
    errors.push('Query contains invalid control characters');
  }

  // Must contain at least one field name (alpha chars)
  if (!/[a-zA-Z]/.test(query)) {
    errors.push('Query contains no field identifiers');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/** Sanitises GraphQL variables — strips undefined values and coerces safe types */
export function parseGraphQLVariables(
  variables: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(variables)) {
    if (value === undefined) continue;
    if (value === null) {
      result[key] = null;
      continue;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value;
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      result[key] = value.filter((v) => v !== undefined);
    } else if (typeof value === 'object') {
      result[key] = parseGraphQLVariables(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/** Generates a Connection type definition string for a given type name */
export function buildConnectionType(typeName: string): string {
  return `
  type ${typeName}Edge {
    node: ${typeName}!
    cursor: String!
  }

  type ${typeName}Connection {
    edges: [${typeName}Edge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }
`.trim();
}

/** Merges multiple schema strings by concatenation (deduplication of scalar/directive lines omitted for simplicity) */
export function mergeSchemas(...schemas: string[]): string {
  return schemas
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join('\n\n');
}
