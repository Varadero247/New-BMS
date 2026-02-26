// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { PackManifest, PackCustomisationOption } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CustomisationValues {
  [key: string]: string | number | boolean | undefined;
}

export function validateCustomisation(
  manifest: PackManifest,
  values: CustomisationValues,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const opt of manifest.customisationOptions) {
    const val = values[opt.key];

    if (opt.required && (val === undefined || val === null || val === '')) {
      errors.push(`"${opt.label}" is required`);
      continue;
    }

    if (val === undefined || val === null) continue;

    switch (opt.type) {
      case 'string': {
        if (typeof val !== 'string') {
          errors.push(`"${opt.label}" must be a string`);
        }
        break;
      }
      case 'number': {
        if (typeof val !== 'number' || isNaN(val)) {
          errors.push(`"${opt.label}" must be a number`);
        }
        break;
      }
      case 'boolean': {
        if (typeof val !== 'boolean') {
          errors.push(`"${opt.label}" must be true or false`);
        }
        break;
      }
      case 'select': {
        if (!opt.options?.includes(String(val))) {
          errors.push(`"${opt.label}" must be one of: ${opt.options?.join(', ')}`);
        }
        break;
      }
    }
  }

  // Warn about unknown keys
  const knownKeys = new Set(manifest.customisationOptions.map(o => o.key));
  for (const key of Object.keys(values)) {
    if (!knownKeys.has(key)) {
      warnings.push(`Unknown customisation key: "${key}"`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validatePrerequisites(
  manifest: PackManifest,
  enabledModules: string[],
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const normalised = enabledModules.map(m => m.toLowerCase());

  for (const prereq of manifest.prerequisites) {
    // Map prerequisite text to module identifiers
    const prereqLower = prereq.toLowerCase();
    const met = normalised.some(m =>
      prereqLower.includes(m) || m.includes(prereqLower.replace(' module enabled', '').trim()),
    );
    if (!met) {
      errors.push(`Prerequisite not met: "${prereq}"`);
    }
  }

  if (manifest.estimatedSetupMinutes > 60) {
    warnings.push(
      `This pack has an estimated setup time of ${manifest.estimatedSetupMinutes} minutes. Consider allocating dedicated time for onboarding.`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function applyCustomisation(
  option: PackCustomisationOption,
  rawValue: unknown,
): string | number | boolean | undefined {
  if (rawValue === undefined || rawValue === null || rawValue === '') return undefined;

  switch (option.type) {
    case 'number': {
      const n = Number(rawValue);
      return isNaN(n) ? undefined : n;
    }
    case 'boolean': {
      if (typeof rawValue === 'boolean') return rawValue;
      if (rawValue === 'true' || rawValue === '1' || rawValue === 'yes') return true;
      if (rawValue === 'false' || rawValue === '0' || rawValue === 'no') return false;
      return undefined;
    }
    default:
      return String(rawValue);
  }
}
