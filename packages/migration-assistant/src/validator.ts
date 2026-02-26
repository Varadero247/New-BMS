// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { FieldMapping, TargetModule, ValidationResult } from './types';
import { MIGRATION_SCHEMAS } from './schema-registry';

export function validateMappings(
  mappings: FieldMapping[],
  targetModule: TargetModule,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const schema = MIGRATION_SCHEMAS[targetModule];
  if (!schema) {
    return { valid: false, errors: [`Unknown target module: ${targetModule}`], warnings: [] };
  }

  // Check all required fields are mapped (not SKIP)
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    if (fieldDef.required) {
      const mapping = mappings.find(m => m.targetField === fieldName);
      if (!mapping || mapping.targetField === 'SKIP') {
        errors.push(`Required field '${fieldDef.label}' (${fieldName}) is not mapped`);
      }
    }
  }

  // Check for duplicate target field mappings (excluding SKIP)
  const targetCounts = new Map<string, number>();
  for (const m of mappings) {
    if (m.targetField !== 'SKIP') {
      targetCounts.set(m.targetField, (targetCounts.get(m.targetField) ?? 0) + 1);
    }
  }
  for (const [target, count] of targetCounts) {
    if (count > 1) {
      errors.push(`Target field '${target}' is mapped from ${count} source fields (duplicates not allowed)`);
    }
  }

  // Warn about unmapped optional fields
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    if (!fieldDef.required) {
      const mapping = mappings.find(m => m.targetField === fieldName);
      if (!mapping || mapping.targetField === 'SKIP') {
        warnings.push(`Optional field '${fieldDef.label}' (${fieldName}) is not mapped`);
      }
    }
  }

  // Warn about source fields mapped to unknown targets
  const validTargets = new Set(Object.keys(schema.fields));
  for (const m of mappings) {
    if (m.targetField !== 'SKIP' && !validTargets.has(m.targetField)) {
      warnings.push(`Source field '${m.sourceField}' is mapped to unknown target '${m.targetField}'`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
