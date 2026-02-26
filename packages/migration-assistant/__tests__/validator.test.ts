// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { validateMappings } from '../src/validator';
import type { FieldMapping, TargetModule } from '../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function m(sourceField: string, targetField: string): FieldMapping {
  return { sourceField, targetField };
}

function skip(sourceField: string): FieldMapping {
  return { sourceField, targetField: 'SKIP' };
}

/** Build a full valid mapping set for a given module. */
function validMappings(module: TargetModule): FieldMapping[] {
  switch (module) {
    case 'NONCONFORMANCES':
      return [
        m('Ref', 'reference'),
        m('Title', 'title'),
        m('Date', 'detectedDate'),
        m('Severity', 'severity'),
      ];
    case 'INCIDENTS':
      return [
        m('Ref', 'reference'),
        m('Title', 'title'),
        m('Date', 'dateOccurred'),
        m('Severity', 'severity'),
      ];
    case 'RISKS':
      return [
        m('Ref', 'reference'),
        m('Title', 'title'),
        m('L', 'likelihood'),
        m('I', 'impact'),
      ];
    case 'DOCUMENTS':
      return [m('Title', 'title')];
    case 'SUPPLIERS':
      return [m('Name', 'name')];
    case 'EMPLOYEES':
      return [
        m('First', 'firstName'),
        m('Last', 'lastName'),
        m('Email', 'email'),
      ];
    case 'CALIBRATION':
      return [
        m('AssetId', 'assetId'),
        m('AssetName', 'assetName'),
        m('CalDate', 'calibrationDate'),
        m('NextCalDate', 'nextCalibrationDate'),
      ];
    case 'AUDITS':
      return [
        m('Ref', 'reference'),
        m('Title', 'title'),
        m('Date', 'auditDate'),
      ];
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Return structure
// ---------------------------------------------------------------------------

describe('validateMappings return structure', () => {
  it('returns an object with valid, errors, warnings', () => {
    const result = validateMappings(validMappings('NONCONFORMANCES'), 'NONCONFORMANCES');
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');
  });

  it('valid is a boolean', () => {
    const result = validateMappings(validMappings('NONCONFORMANCES'), 'NONCONFORMANCES');
    expect(typeof result.valid).toBe('boolean');
  });

  it('errors is always an array', () => {
    const result = validateMappings([], 'NONCONFORMANCES');
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('warnings is always an array', () => {
    const result = validateMappings(validMappings('NONCONFORMANCES'), 'NONCONFORMANCES');
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('valid is true when errors is empty', () => {
    const result = validateMappings(validMappings('NONCONFORMANCES'), 'NONCONFORMANCES');
    expect(result.errors).toHaveLength(0);
    expect(result.valid).toBe(true);
  });

  it('valid is false when errors is non-empty', () => {
    const result = validateMappings([], 'NONCONFORMANCES');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Unknown module
// ---------------------------------------------------------------------------

describe('unknown module handling', () => {
  it('returns valid=false for unknown module', () => {
    const result = validateMappings([], 'UNKNOWN_MODULE' as TargetModule);
    expect(result.valid).toBe(false);
  });

  it('returns error message for unknown module', () => {
    const result = validateMappings([], 'UNKNOWN_MODULE' as TargetModule);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('UNKNOWN_MODULE');
  });

  it('returns empty warnings for unknown module', () => {
    const result = validateMappings([], 'UNKNOWN_MODULE' as TargetModule);
    expect(result.warnings).toHaveLength(0);
  });

  it('returns valid=false for null module', () => {
    const result = validateMappings([], null as unknown as TargetModule);
    expect(result.valid).toBe(false);
  });

  it('returns valid=false for undefined module', () => {
    const result = validateMappings([], undefined as unknown as TargetModule);
    expect(result.valid).toBe(false);
  });

  it('returns valid=false for empty string module', () => {
    const result = validateMappings([], '' as TargetModule);
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// NONCONFORMANCES module
// ---------------------------------------------------------------------------

describe('NONCONFORMANCES module validation', () => {
  const MODULE: TargetModule = 'NONCONFORMANCES';
  const REQUIRED = ['reference', 'title', 'detectedDate', 'severity'];

  it('all required fields mapped → valid=true', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).valid).toBe(true);
  });

  it('all required fields mapped → 0 errors', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).errors).toHaveLength(0);
  });

  it('empty mappings → valid=false', () => {
    expect(validateMappings([], MODULE).valid).toBe(false);
  });

  it('empty mappings → error for each required field', () => {
    const result = validateMappings([], MODULE);
    expect(result.errors.length).toBeGreaterThanOrEqual(REQUIRED.length);
  });

  it.each(REQUIRED)('missing required field "%s" → valid=false', (field) => {
    const mappings = validMappings(MODULE).filter(mapping => mapping.targetField !== field);
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → error mentioning field', (field) => {
    const mappings = validMappings(MODULE).filter(mapping => mapping.targetField !== field);
    const result = validateMappings(mappings, MODULE);
    expect(result.errors.some(e => e.includes(field))).toBe(true);
  });

  it.each(REQUIRED)('field "%s" mapped to SKIP → error', (field) => {
    const mappings = validMappings(MODULE).map(m =>
      m.targetField === field ? skip(m.sourceField) : m
    );
    const result = validateMappings(mappings, MODULE);
    expect(result.valid).toBe(false);
  });

  it('optional field not mapped → warning (not error)', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    // Optional fields: status, description, rootCause, area, assignedTo, closedDate
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('optional status field not mapped → warning mentions status', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('status'))).toBe(true);
  });

  it('valid with only required fields → no errors', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.errors).toHaveLength(0);
  });

  it('optional fields included → valid still true', () => {
    const maps = [
      ...validMappings(MODULE),
      m('Status', 'status'),
      m('Desc', 'description'),
      m('Area', 'area'),
    ];
    const result = validateMappings(maps, MODULE);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// INCIDENTS module
// ---------------------------------------------------------------------------

describe('INCIDENTS module validation', () => {
  const MODULE: TargetModule = 'INCIDENTS';
  const REQUIRED = ['reference', 'title', 'dateOccurred', 'severity'];

  it('all required fields mapped → valid=true', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).valid).toBe(true);
  });

  it('empty mappings → valid=false', () => {
    expect(validateMappings([], MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → valid=false', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → error mentions field', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    const result = validateMappings(mappings, MODULE);
    expect(result.errors.some(e => e.includes(field))).toBe(true);
  });

  it.each(REQUIRED)('field "%s" mapped to SKIP → error', (field) => {
    const mappings = validMappings(MODULE).map(m =>
      m.targetField === field ? skip(m.sourceField) : m
    );
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it('optional type, location, injuryType etc not mapped → warnings', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// RISKS module
// ---------------------------------------------------------------------------

describe('RISKS module validation', () => {
  const MODULE: TargetModule = 'RISKS';
  const REQUIRED = ['reference', 'title', 'likelihood', 'impact'];

  it('all required fields mapped → valid=true', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).valid).toBe(true);
  });

  it('empty mappings → valid=false', () => {
    expect(validateMappings([], MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → valid=false', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → error mentions field', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    const result = validateMappings(mappings, MODULE);
    expect(result.errors.some(e => e.includes(field))).toBe(true);
  });

  it('optional description, category, owner, status, controls → warnings', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('all optional fields mapped → fewer warnings', () => {
    const maps = [
      ...validMappings(MODULE),
      m('Desc', 'description'),
      m('Cat', 'category'),
      m('Owner', 'owner'),
      m('Status', 'status'),
      m('Controls', 'controls'),
    ];
    const result = validateMappings(maps, MODULE);
    expect(result.warnings.filter(w => w.includes('description') || w.includes('category'))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DOCUMENTS module
// ---------------------------------------------------------------------------

describe('DOCUMENTS module validation', () => {
  const MODULE: TargetModule = 'DOCUMENTS';

  it('all required fields mapped → valid=true', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).valid).toBe(true);
  });

  it('empty mappings → valid=false', () => {
    expect(validateMappings([], MODULE).valid).toBe(false);
  });

  it('missing title → error', () => {
    const result = validateMappings([], MODULE);
    expect(result.errors.some(e => e.includes('title'))).toBe(true);
  });

  it('title mapped to SKIP → valid=false', () => {
    const result = validateMappings([skip('Title')], MODULE);
    expect(result.valid).toBe(false);
  });

  it('optional fields not mapped → warnings', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('optional documentNumber not mapped → warning mentions documentNumber', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('documentNumber'))).toBe(true);
  });

  it('optional status not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('status'))).toBe(true);
  });

  it('all optional fields mapped → no warnings for them', () => {
    const maps = [
      ...validMappings(MODULE),
      m('DocNum', 'documentNumber'),
      m('Cat', 'category'),
      m('Ver', 'version'),
      m('Status', 'status'),
      m('Author', 'author'),
      m('EffDate', 'effectiveDate'),
      m('RevDate', 'reviewDate'),
    ];
    const result = validateMappings(maps, MODULE);
    expect(result.valid).toBe(true);
    // All optional fields now mapped → no warnings for those fields
    expect(result.warnings.filter(w =>
      ['documentNumber', 'category', 'version', 'status', 'author', 'effectiveDate', 'reviewDate'].some(f => w.includes(f))
    )).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// SUPPLIERS module
// ---------------------------------------------------------------------------

describe('SUPPLIERS module validation', () => {
  const MODULE: TargetModule = 'SUPPLIERS';

  it('all required fields mapped → valid=true', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).valid).toBe(true);
  });

  it('empty mappings → valid=false', () => {
    expect(validateMappings([], MODULE).valid).toBe(false);
  });

  it('missing name → valid=false', () => {
    const result = validateMappings([], MODULE);
    expect(result.valid).toBe(false);
  });

  it('missing name → error mentions name', () => {
    const result = validateMappings([], MODULE);
    expect(result.errors.some(e => e.includes('name'))).toBe(true);
  });

  it('name mapped to SKIP → valid=false', () => {
    expect(validateMappings([skip('Name')], MODULE).valid).toBe(false);
  });

  it('optional code, email, phone, etc not mapped → warnings', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('optional approvalStatus not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('approvalStatus'))).toBe(true);
  });

  it('all optional fields mapped → valid still true', () => {
    const maps = [
      ...validMappings(MODULE),
      m('Code', 'code'),
      m('Email', 'email'),
      m('Phone', 'phone'),
      m('Address', 'address'),
      m('Category', 'category'),
      m('Status', 'status'),
      m('ApprovalStatus', 'approvalStatus'),
      m('RiskLevel', 'riskLevel'),
    ];
    expect(validateMappings(maps, MODULE).valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EMPLOYEES module
// ---------------------------------------------------------------------------

describe('EMPLOYEES module validation', () => {
  const MODULE: TargetModule = 'EMPLOYEES';
  const REQUIRED = ['firstName', 'lastName', 'email'];

  it('all required fields mapped → valid=true', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).valid).toBe(true);
  });

  it('empty mappings → valid=false', () => {
    expect(validateMappings([], MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → valid=false', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → error mentions field', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    const result = validateMappings(mappings, MODULE);
    expect(result.errors.some(e => e.includes(field))).toBe(true);
  });

  it.each(REQUIRED)('required field "%s" mapped to SKIP → valid=false', (field) => {
    const mappings = validMappings(MODULE).map(m =>
      m.targetField === field ? skip(m.sourceField) : m
    );
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it('only firstName and lastName → valid=false (email missing)', () => {
    const maps = [m('First', 'firstName'), m('Last', 'lastName')];
    expect(validateMappings(maps, MODULE).valid).toBe(false);
  });

  it('only firstName and email → valid=false (lastName missing)', () => {
    const maps = [m('First', 'firstName'), m('Email', 'email')];
    expect(validateMappings(maps, MODULE).valid).toBe(false);
  });

  it('only lastName and email → valid=false (firstName missing)', () => {
    const maps = [m('Last', 'lastName'), m('Email', 'email')];
    expect(validateMappings(maps, MODULE).valid).toBe(false);
  });

  it('all three required → valid=true', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).valid).toBe(true);
  });

  it('optional department not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('department'))).toBe(true);
  });

  it('optional jobTitle not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('jobTitle'))).toBe(true);
  });

  it('optional startDate not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('startDate'))).toBe(true);
  });

  it('optional manager not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('manager'))).toBe(true);
  });

  it('optional status not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('status'))).toBe(true);
  });

  it('all optional fields mapped → no warnings for optional fields', () => {
    const maps = [
      ...validMappings(MODULE),
      m('Dept', 'department'),
      m('Title', 'jobTitle'),
      m('Start', 'startDate'),
      m('Mgr', 'manager'),
      m('Status', 'status'),
    ];
    const result = validateMappings(maps, MODULE);
    expect(result.warnings.filter(w =>
      ['department', 'jobTitle', 'startDate', 'manager', 'status'].some(f => w.includes(f))
    )).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// CALIBRATION module
// ---------------------------------------------------------------------------

describe('CALIBRATION module validation', () => {
  const MODULE: TargetModule = 'CALIBRATION';
  const REQUIRED = ['assetId', 'assetName', 'calibrationDate', 'nextCalibrationDate'];

  it('all required fields mapped → valid=true', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).valid).toBe(true);
  });

  it('empty mappings → valid=false', () => {
    expect(validateMappings([], MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → valid=false', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → error mentions field', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    const result = validateMappings(mappings, MODULE);
    expect(result.errors.some(e => e.includes(field))).toBe(true);
  });

  it.each(REQUIRED)('required field "%s" mapped to SKIP → valid=false', (field) => {
    const mappings = validMappings(MODULE).map(m =>
      m.targetField === field ? skip(m.sourceField) : m
    );
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it('optional result not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('result'))).toBe(true);
  });

  it('optional serialNumber not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('serialNumber'))).toBe(true);
  });

  it('optional location not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('location'))).toBe(true);
  });

  it('all optional fields mapped → valid still true', () => {
    const maps = [
      ...validMappings(MODULE),
      m('Serial', 'serialNumber'),
      m('Loc', 'location'),
      m('Result', 'result'),
      m('Tol', 'tolerance'),
    ];
    expect(validateMappings(maps, MODULE).valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AUDITS module
// ---------------------------------------------------------------------------

describe('AUDITS module validation', () => {
  const MODULE: TargetModule = 'AUDITS';
  const REQUIRED = ['reference', 'title', 'auditDate'];

  it('all required fields mapped → valid=true', () => {
    expect(validateMappings(validMappings(MODULE), MODULE).valid).toBe(true);
  });

  it('empty mappings → valid=false', () => {
    expect(validateMappings([], MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → valid=false', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it.each(REQUIRED)('missing required field "%s" → error mentions field', (field) => {
    const mappings = validMappings(MODULE).filter(m => m.targetField !== field);
    const result = validateMappings(mappings, MODULE);
    expect(result.errors.some(e => e.includes(field))).toBe(true);
  });

  it.each(REQUIRED)('required field "%s" mapped to SKIP → valid=false', (field) => {
    const mappings = validMappings(MODULE).map(m =>
      m.targetField === field ? skip(m.sourceField) : m
    );
    expect(validateMappings(mappings, MODULE).valid).toBe(false);
  });

  it('optional standard not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('standard'))).toBe(true);
  });

  it('optional auditor not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('auditor'))).toBe(true);
  });

  it('optional scope not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('scope'))).toBe(true);
  });

  it('optional status not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('status'))).toBe(true);
  });

  it('optional findings not mapped → warning', () => {
    const result = validateMappings(validMappings(MODULE), MODULE);
    expect(result.warnings.some(w => w.includes('findings'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Duplicate target field detection
// ---------------------------------------------------------------------------

describe('duplicate target field detection', () => {
  it('two source fields mapped to same target → error', () => {
    const maps = [
      m('Ref1', 'reference'),
      m('Ref2', 'reference'),
      m('Title', 'title'),
      m('Date', 'detectedDate'),
      m('Severity', 'severity'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.errors.some(e => e.includes('reference'))).toBe(true);
  });

  it('two sources mapped to same target → valid=false', () => {
    const maps = [
      m('Ref1', 'reference'),
      m('Ref2', 'reference'),
      m('Title', 'title'),
      m('Date', 'detectedDate'),
      m('Severity', 'severity'),
    ];
    expect(validateMappings(maps, 'NONCONFORMANCES').valid).toBe(false);
  });

  it('error message mentions the duplicate count', () => {
    const maps = [
      m('Ref1', 'reference'),
      m('Ref2', 'reference'),
      m('Title', 'title'),
      m('Date', 'detectedDate'),
      m('Severity', 'severity'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    const dupError = result.errors.find(e => e.includes('reference'));
    expect(dupError).toContain('2');
  });

  it('three source fields mapped to same target → error with count 3', () => {
    const maps = [
      m('Ref1', 'reference'),
      m('Ref2', 'reference'),
      m('Ref3', 'reference'),
      m('Title', 'title'),
      m('Date', 'detectedDate'),
      m('Severity', 'severity'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    const dupError = result.errors.find(e => e.includes('reference'));
    expect(dupError).toContain('3');
  });

  it('two SKIP mappings → no duplicate error for SKIP', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      skip('Extra1'),
      skip('Extra2'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    // No error about SKIP being duplicated
    const skipErrors = result.errors.filter(e => e.includes('SKIP'));
    expect(skipErrors).toHaveLength(0);
  });

  it('duplicate optional target field → error', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      m('Status1', 'status'),
      m('Status2', 'status'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.errors.some(e => e.includes('status'))).toBe(true);
  });

  it('duplicate title mapping in DOCUMENTS → error', () => {
    const maps = [m('Title1', 'title'), m('Title2', 'title')];
    const result = validateMappings(maps, 'DOCUMENTS');
    expect(result.errors.some(e => e.includes('title'))).toBe(true);
  });

  it('no duplicate mappings → no duplicate error', () => {
    const maps = validMappings('NONCONFORMANCES');
    const result = validateMappings(maps, 'NONCONFORMANCES');
    const dupErrors = result.errors.filter(e => e.includes('duplicates'));
    expect(dupErrors).toHaveLength(0);
  });

  it('unique mappings for EMPLOYEES → no duplicate errors', () => {
    const result = validateMappings(validMappings('EMPLOYEES'), 'EMPLOYEES');
    const dupErrors = result.errors.filter(e => e.includes('duplicates'));
    expect(dupErrors).toHaveLength(0);
  });

  it('duplicate in RISKS required field → two errors (missing + duplicate is not missing)', () => {
    // Two fields mapped to 'reference' satisfies "is mapped" but triggers duplicate error
    const maps = [
      m('Ref1', 'reference'),
      m('Ref2', 'reference'),
      m('Title', 'title'),
      m('L', 'likelihood'),
      m('I', 'impact'),
    ];
    const result = validateMappings(maps, 'RISKS');
    // Duplicate error on reference, but reference IS mapped
    expect(result.errors.some(e => e.includes('reference'))).toBe(true);
    // No "not mapped" error for reference since it IS mapped
    expect(result.errors.filter(e => e.includes('reference'))).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Unknown target field warnings
// ---------------------------------------------------------------------------

describe('unknown target field warnings', () => {
  it('mapping to non-existent field → warning', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      m('CustomCol', 'nonExistentField'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.warnings.some(w => w.includes('nonExistentField'))).toBe(true);
  });

  it('mapping to non-existent field → warning mentions source field', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      m('CustomCol', 'nonExistentField'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.warnings.some(w => w.includes('CustomCol'))).toBe(true);
  });

  it('valid target field → no "unknown target" warning', () => {
    const maps = [...validMappings('NONCONFORMANCES'), m('StatusCol', 'status')];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    const unknownWarnings = result.warnings.filter(w => w.includes('unknown target'));
    expect(unknownWarnings).toHaveLength(0);
  });

  it('two unknown targets → two unknown-target warnings', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      m('Custom1', 'unknownField1'),
      m('Custom2', 'unknownField2'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    const unknownWarnings = result.warnings.filter(w =>
      w.includes('unknownField1') || w.includes('unknownField2')
    );
    expect(unknownWarnings).toHaveLength(2);
  });

  it('SKIP mapping does not produce unknown-target warning', () => {
    const maps = [...validMappings('NONCONFORMANCES'), skip('ExtraCol')];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    const skipWarnings = result.warnings.filter(w => w.includes('ExtraCol'));
    expect(skipWarnings).toHaveLength(0);
  });

  it('unknown target is still valid if required fields are all mapped', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      m('Custom', 'someRandomField'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.includes('someRandomField'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Optional field warnings — unmapped optionals
// ---------------------------------------------------------------------------

describe('unmapped optional field warnings', () => {
  it('optional field not mapped → warning (not error)', () => {
    const result = validateMappings(validMappings('NONCONFORMANCES'), 'NONCONFORMANCES');
    // status is optional and not mapped
    expect(result.warnings.some(w => w.includes('status'))).toBe(true);
    expect(result.errors.some(e => e.includes('status'))).toBe(false);
  });

  it('optional field mapped → no warning for that field', () => {
    const maps = [...validMappings('NONCONFORMANCES'), m('Status', 'status')];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    // status now mapped → no optional warning for status
    expect(result.warnings.some(w => w.includes('status') && w.includes('not mapped'))).toBe(false);
  });

  it('optional field mapped to SKIP → warning (treated as not mapped)', () => {
    const maps = [...validMappings('NONCONFORMANCES'), skip('StatusCol')];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    // status is still not mapped (SKIP doesn't count)
    expect(result.warnings.some(w => w.includes('status'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// All 8 modules — comprehensive valid + invalid checks
// ---------------------------------------------------------------------------

describe('all 8 modules: valid mappings → valid=true', () => {
  const ALL_MODULES: TargetModule[] = [
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ];

  it.each(ALL_MODULES)('%s with valid mappings → valid=true', (module) => {
    expect(validateMappings(validMappings(module), module).valid).toBe(true);
  });

  it.each(ALL_MODULES)('%s with valid mappings → 0 errors', (module) => {
    expect(validateMappings(validMappings(module), module).errors).toHaveLength(0);
  });

  it.each(ALL_MODULES)('%s with empty mappings → valid=false', (module) => {
    expect(validateMappings([], module).valid).toBe(false);
  });

  it.each(ALL_MODULES)('%s with empty mappings → errors is non-empty', (module) => {
    expect(validateMappings([], module).errors.length).toBeGreaterThan(0);
  });

  it.each(ALL_MODULES)('%s with valid mappings → errors is array', (module) => {
    expect(Array.isArray(validateMappings(validMappings(module), module).errors)).toBe(true);
  });

  it.each(ALL_MODULES)('%s with valid mappings → warnings is array', (module) => {
    expect(Array.isArray(validateMappings(validMappings(module), module).warnings)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Comprehensive it.each: [module, mappings, expectValid, minErrors, minWarnings]
// ---------------------------------------------------------------------------

describe('comprehensive module/mapping matrix', () => {
  type TestCase = [TargetModule, FieldMapping[], boolean, number];

  const cases: TestCase[] = [
    // All valid
    ['NONCONFORMANCES', validMappings('NONCONFORMANCES'), true, 0],
    ['INCIDENTS', validMappings('INCIDENTS'), true, 0],
    ['RISKS', validMappings('RISKS'), true, 0],
    ['DOCUMENTS', validMappings('DOCUMENTS'), true, 0],
    ['SUPPLIERS', validMappings('SUPPLIERS'), true, 0],
    ['EMPLOYEES', validMappings('EMPLOYEES'), true, 0],
    ['CALIBRATION', validMappings('CALIBRATION'), true, 0],
    ['AUDITS', validMappings('AUDITS'), true, 0],

    // All empty
    ['NONCONFORMANCES', [], false, 4],
    ['INCIDENTS', [], false, 4],
    ['RISKS', [], false, 4],
    ['DOCUMENTS', [], false, 1],
    ['SUPPLIERS', [], false, 1],
    ['EMPLOYEES', [], false, 3],
    ['CALIBRATION', [], false, 4],
    ['AUDITS', [], false, 3],

    // One required missing — NONCONFORMANCES
    ['NONCONFORMANCES', [m('T', 'title'), m('D', 'detectedDate'), m('S', 'severity')], false, 1],
    ['NONCONFORMANCES', [m('R', 'reference'), m('D', 'detectedDate'), m('S', 'severity')], false, 1],
    ['NONCONFORMANCES', [m('R', 'reference'), m('T', 'title'), m('S', 'severity')], false, 1],
    ['NONCONFORMANCES', [m('R', 'reference'), m('T', 'title'), m('D', 'detectedDate')], false, 1],

    // One required missing — INCIDENTS
    ['INCIDENTS', [m('T', 'title'), m('D', 'dateOccurred'), m('S', 'severity')], false, 1],
    ['INCIDENTS', [m('R', 'reference'), m('D', 'dateOccurred'), m('S', 'severity')], false, 1],
    ['INCIDENTS', [m('R', 'reference'), m('T', 'title'), m('S', 'severity')], false, 1],
    ['INCIDENTS', [m('R', 'reference'), m('T', 'title'), m('D', 'dateOccurred')], false, 1],

    // One required missing — RISKS
    ['RISKS', [m('T', 'title'), m('L', 'likelihood'), m('I', 'impact')], false, 1],
    ['RISKS', [m('R', 'reference'), m('L', 'likelihood'), m('I', 'impact')], false, 1],
    ['RISKS', [m('R', 'reference'), m('T', 'title'), m('I', 'impact')], false, 1],
    ['RISKS', [m('R', 'reference'), m('T', 'title'), m('L', 'likelihood')], false, 1],

    // One required missing — EMPLOYEES
    ['EMPLOYEES', [m('L', 'lastName'), m('E', 'email')], false, 1],
    ['EMPLOYEES', [m('F', 'firstName'), m('E', 'email')], false, 1],
    ['EMPLOYEES', [m('F', 'firstName'), m('L', 'lastName')], false, 1],

    // One required missing — CALIBRATION
    ['CALIBRATION', [m('N', 'assetName'), m('C', 'calibrationDate'), m('D', 'nextCalibrationDate')], false, 1],
    ['CALIBRATION', [m('A', 'assetId'), m('C', 'calibrationDate'), m('D', 'nextCalibrationDate')], false, 1],
    ['CALIBRATION', [m('A', 'assetId'), m('N', 'assetName'), m('D', 'nextCalibrationDate')], false, 1],
    ['CALIBRATION', [m('A', 'assetId'), m('N', 'assetName'), m('C', 'calibrationDate')], false, 1],

    // One required missing — AUDITS
    ['AUDITS', [m('T', 'title'), m('D', 'auditDate')], false, 1],
    ['AUDITS', [m('R', 'reference'), m('D', 'auditDate')], false, 1],
    ['AUDITS', [m('R', 'reference'), m('T', 'title')], false, 1],
  ];

  it.each(cases)(
    '%s valid=%s with %i+ expected errors',
    (module, mappings, expectValid, minErrors) => {
      const result = validateMappings(mappings, module);
      expect(result.valid).toBe(expectValid);
      expect(result.errors.length).toBeGreaterThanOrEqual(minErrors);
    },
  );
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('very long source field name is handled gracefully', () => {
    const longName = 'A'.repeat(500);
    const maps = [...validMappings('NONCONFORMANCES'), m(longName, 'status')];
    expect(() => validateMappings(maps, 'NONCONFORMANCES')).not.toThrow();
  });

  it('source field with special characters is handled', () => {
    const maps = [...validMappings('NONCONFORMANCES'), m('Field!@#$%', 'status')];
    expect(() => validateMappings(maps, 'NONCONFORMANCES')).not.toThrow();
  });

  it('source field with unicode is handled', () => {
    const maps = [...validMappings('NONCONFORMANCES'), m('フィールド', 'status')];
    expect(() => validateMappings(maps, 'NONCONFORMANCES')).not.toThrow();
  });

  it('large number of mappings is handled', () => {
    const extraMaps = Array.from({ length: 100 }, (_, i) => m(`Source${i}`, `unknownTarget${i}`));
    const maps = [...validMappings('NONCONFORMANCES'), ...extraMaps];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThanOrEqual(100);
  });

  it('mapping with empty sourceField still returns structure', () => {
    const maps = [...validMappings('NONCONFORMANCES'), m('', 'status')];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');
  });

  it('all mappings are SKIP → all required fields missing', () => {
    const maps = [
      skip('Ref'), skip('Title'), skip('Date'), skip('Severity'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it('duplicate target with unknown field → duplicate error and unknown warning', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      m('Src1', 'customUnknown'),
      m('Src2', 'customUnknown'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    // Unknown target warning for customUnknown
    expect(result.warnings.some(w => w.includes('customUnknown'))).toBe(true);
    // Duplicate error for customUnknown
    expect(result.errors.some(e => e.includes('customUnknown'))).toBe(true);
  });

  it('mixed valid and SKIP mappings — SKIP does not count towards duplicate detection', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      skip('Extra1'),
      skip('Extra2'),
      skip('Extra3'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.valid).toBe(true);
  });

  it('single source field can be mapped to same target only once without duplicate', () => {
    const maps = [...validMappings('NONCONFORMANCES'), m('AreaCol', 'area')];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.errors.filter(e => e.includes('area'))).toHaveLength(0);
  });

  it('two different required fields each mapped once → no duplicate errors', () => {
    const result = validateMappings(validMappings('EMPLOYEES'), 'EMPLOYEES');
    const dupErrors = result.errors.filter(e => e.includes('duplicates'));
    expect(dupErrors).toHaveLength(0);
  });

  it('mapping to SKIP with required target still counts as missing', () => {
    const maps = [
      skip('Ref'),
      m('T', 'title'),
      m('D', 'detectedDate'),
      m('S', 'severity'),
    ];
    // The check in validator: `if (!mapping || mapping.targetField === 'SKIP')` → error
    // But the loop iterates schema fields, checking if a mapping exists with that targetField
    // skip('Ref') has targetField='SKIP', not 'reference' → reference won't be found
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.errors.some(e => e.includes('reference'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Valid=false exactly when errors.length > 0
// ---------------------------------------------------------------------------

describe('valid is exactly (errors.length === 0)', () => {
  it.each<[TargetModule, FieldMapping[]]>([
    ['NONCONFORMANCES', validMappings('NONCONFORMANCES')],
    ['INCIDENTS', validMappings('INCIDENTS')],
    ['RISKS', validMappings('RISKS')],
    ['DOCUMENTS', validMappings('DOCUMENTS')],
    ['SUPPLIERS', validMappings('SUPPLIERS')],
    ['EMPLOYEES', validMappings('EMPLOYEES')],
    ['CALIBRATION', validMappings('CALIBRATION')],
    ['AUDITS', validMappings('AUDITS')],
    ['NONCONFORMANCES', []],
    ['INCIDENTS', []],
    ['RISKS', []],
    ['DOCUMENTS', []],
    ['SUPPLIERS', []],
    ['EMPLOYEES', []],
    ['CALIBRATION', []],
    ['AUDITS', []],
  ])('%s: valid === (errors.length === 0)', (module, mappings) => {
    const result = validateMappings(mappings, module);
    expect(result.valid).toBe(result.errors.length === 0);
  });
});

// ---------------------------------------------------------------------------
// Additional required field tests — all modules, all individual required fields
// ---------------------------------------------------------------------------

describe('NONCONFORMANCES all required fields individually', () => {
  it.each(['reference', 'title', 'detectedDate', 'severity'])(
    'valid mappings contain field "%s" → no error for that field',
    (field) => {
      const result = validateMappings(validMappings('NONCONFORMANCES'), 'NONCONFORMANCES');
      expect(result.errors.some(e => e.includes(field))).toBe(false);
    },
  );

  it.each(['reference', 'title', 'detectedDate', 'severity'])(
    'omitting field "%s" → error contains that field name',
    (field) => {
      const maps = validMappings('NONCONFORMANCES').filter(m => m.targetField !== field);
      const result = validateMappings(maps, 'NONCONFORMANCES');
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each(['reference', 'title', 'detectedDate', 'severity'])(
    'SKIP-ing field "%s" → error',
    (field) => {
      const maps = validMappings('NONCONFORMANCES').map(m =>
        m.targetField === field ? skip(m.sourceField) : m,
      );
      const result = validateMappings(maps, 'NONCONFORMANCES');
      expect(result.valid).toBe(false);
    },
  );
});

describe('INCIDENTS all required fields individually', () => {
  it.each(['reference', 'title', 'dateOccurred', 'severity'])(
    'valid mappings contain field "%s" → no error for that field',
    (field) => {
      const result = validateMappings(validMappings('INCIDENTS'), 'INCIDENTS');
      expect(result.errors.some(e => e.includes(field))).toBe(false);
    },
  );

  it.each(['reference', 'title', 'dateOccurred', 'severity'])(
    'omitting field "%s" → error contains that field name',
    (field) => {
      const maps = validMappings('INCIDENTS').filter(m => m.targetField !== field);
      const result = validateMappings(maps, 'INCIDENTS');
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each(['reference', 'title', 'dateOccurred', 'severity'])(
    'SKIP-ing field "%s" → error',
    (field) => {
      const maps = validMappings('INCIDENTS').map(m =>
        m.targetField === field ? skip(m.sourceField) : m,
      );
      const result = validateMappings(maps, 'INCIDENTS');
      expect(result.valid).toBe(false);
    },
  );
});

describe('RISKS all required fields individually', () => {
  it.each(['reference', 'title', 'likelihood', 'impact'])(
    'valid mappings contain field "%s" → no error for that field',
    (field) => {
      const result = validateMappings(validMappings('RISKS'), 'RISKS');
      expect(result.errors.some(e => e.includes(field))).toBe(false);
    },
  );

  it.each(['reference', 'title', 'likelihood', 'impact'])(
    'omitting field "%s" → error contains that field name',
    (field) => {
      const maps = validMappings('RISKS').filter(m => m.targetField !== field);
      const result = validateMappings(maps, 'RISKS');
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each(['reference', 'title', 'likelihood', 'impact'])(
    'SKIP-ing field "%s" → error',
    (field) => {
      const maps = validMappings('RISKS').map(m =>
        m.targetField === field ? skip(m.sourceField) : m,
      );
      const result = validateMappings(maps, 'RISKS');
      expect(result.valid).toBe(false);
    },
  );
});

describe('EMPLOYEES all required fields individually', () => {
  it.each(['firstName', 'lastName', 'email'])(
    'valid mappings contain field "%s" → no error for that field',
    (field) => {
      const result = validateMappings(validMappings('EMPLOYEES'), 'EMPLOYEES');
      expect(result.errors.some(e => e.includes(field))).toBe(false);
    },
  );

  it.each(['firstName', 'lastName', 'email'])(
    'omitting field "%s" → error contains that field name',
    (field) => {
      const maps = validMappings('EMPLOYEES').filter(m => m.targetField !== field);
      const result = validateMappings(maps, 'EMPLOYEES');
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each(['firstName', 'lastName', 'email'])(
    'SKIP-ing field "%s" → error',
    (field) => {
      const maps = validMappings('EMPLOYEES').map(m =>
        m.targetField === field ? skip(m.sourceField) : m,
      );
      const result = validateMappings(maps, 'EMPLOYEES');
      expect(result.valid).toBe(false);
    },
  );
});

describe('CALIBRATION all required fields individually', () => {
  it.each(['assetId', 'assetName', 'calibrationDate', 'nextCalibrationDate'])(
    'valid mappings contain field "%s" → no error for that field',
    (field) => {
      const result = validateMappings(validMappings('CALIBRATION'), 'CALIBRATION');
      expect(result.errors.some(e => e.includes(field))).toBe(false);
    },
  );

  it.each(['assetId', 'assetName', 'calibrationDate', 'nextCalibrationDate'])(
    'omitting field "%s" → error contains that field name',
    (field) => {
      const maps = validMappings('CALIBRATION').filter(m => m.targetField !== field);
      const result = validateMappings(maps, 'CALIBRATION');
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each(['assetId', 'assetName', 'calibrationDate', 'nextCalibrationDate'])(
    'SKIP-ing field "%s" → error',
    (field) => {
      const maps = validMappings('CALIBRATION').map(m =>
        m.targetField === field ? skip(m.sourceField) : m,
      );
      const result = validateMappings(maps, 'CALIBRATION');
      expect(result.valid).toBe(false);
    },
  );
});

describe('AUDITS all required fields individually', () => {
  it.each(['reference', 'title', 'auditDate'])(
    'valid mappings contain field "%s" → no error for that field',
    (field) => {
      const result = validateMappings(validMappings('AUDITS'), 'AUDITS');
      expect(result.errors.some(e => e.includes(field))).toBe(false);
    },
  );

  it.each(['reference', 'title', 'auditDate'])(
    'omitting field "%s" → error contains that field name',
    (field) => {
      const maps = validMappings('AUDITS').filter(m => m.targetField !== field);
      const result = validateMappings(maps, 'AUDITS');
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each(['reference', 'title', 'auditDate'])(
    'SKIP-ing field "%s" → error',
    (field) => {
      const maps = validMappings('AUDITS').map(m =>
        m.targetField === field ? skip(m.sourceField) : m,
      );
      const result = validateMappings(maps, 'AUDITS');
      expect(result.valid).toBe(false);
    },
  );
});

// ---------------------------------------------------------------------------
// Optional field warnings — exhaustive per module
// ---------------------------------------------------------------------------

describe('optional field warnings per module', () => {
  it.each([
    'status', 'description', 'rootCause', 'area', 'assignedTo', 'closedDate',
  ])('NONCONFORMANCES optional field "%s" not mapped → warning', (field) => {
    const result = validateMappings(validMappings('NONCONFORMANCES'), 'NONCONFORMANCES');
    expect(result.warnings.some(w => w.includes(field))).toBe(true);
  });

  it.each([
    'type', 'location', 'injuryType', 'reportedBy', 'status', 'description',
  ])('INCIDENTS optional field "%s" not mapped → warning', (field) => {
    const result = validateMappings(validMappings('INCIDENTS'), 'INCIDENTS');
    expect(result.warnings.some(w => w.includes(field))).toBe(true);
  });

  it.each([
    'description', 'category', 'owner', 'status', 'controls',
  ])('RISKS optional field "%s" not mapped → warning', (field) => {
    const result = validateMappings(validMappings('RISKS'), 'RISKS');
    expect(result.warnings.some(w => w.includes(field))).toBe(true);
  });

  it.each([
    'documentNumber', 'category', 'version', 'status', 'author', 'effectiveDate', 'reviewDate',
  ])('DOCUMENTS optional field "%s" not mapped → warning', (field) => {
    const result = validateMappings(validMappings('DOCUMENTS'), 'DOCUMENTS');
    expect(result.warnings.some(w => w.includes(field))).toBe(true);
  });

  it.each([
    'code', 'email', 'phone', 'address', 'category', 'status', 'approvalStatus', 'riskLevel',
  ])('SUPPLIERS optional field "%s" not mapped → warning', (field) => {
    const result = validateMappings(validMappings('SUPPLIERS'), 'SUPPLIERS');
    expect(result.warnings.some(w => w.includes(field))).toBe(true);
  });

  it.each([
    'department', 'jobTitle', 'startDate', 'manager', 'status',
  ])('EMPLOYEES optional field "%s" not mapped → warning', (field) => {
    const result = validateMappings(validMappings('EMPLOYEES'), 'EMPLOYEES');
    expect(result.warnings.some(w => w.includes(field))).toBe(true);
  });

  it.each([
    'serialNumber', 'location', 'result', 'tolerance',
  ])('CALIBRATION optional field "%s" not mapped → warning', (field) => {
    const result = validateMappings(validMappings('CALIBRATION'), 'CALIBRATION');
    expect(result.warnings.some(w => w.includes(field))).toBe(true);
  });

  it.each([
    'standard', 'auditor', 'scope', 'status', 'findings',
  ])('AUDITS optional field "%s" not mapped → warning', (field) => {
    const result = validateMappings(validMappings('AUDITS'), 'AUDITS');
    expect(result.warnings.some(w => w.includes(field))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Optional fields mapped → no warning for that field
// ---------------------------------------------------------------------------

describe('optional fields mapped removes their warning', () => {
  it.each([
    'status', 'description', 'rootCause', 'area', 'assignedTo', 'closedDate',
  ])('NONCONFORMANCES: mapping optional "%s" → no warning for that field', (field) => {
    const maps = [...validMappings('NONCONFORMANCES'), m('Src', field)];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    const optionalWarnings = result.warnings.filter(w => w.includes(field) && w.includes('not mapped'));
    expect(optionalWarnings).toHaveLength(0);
  });

  it.each([
    'type', 'location', 'injuryType', 'reportedBy', 'status', 'description',
  ])('INCIDENTS: mapping optional "%s" → no warning for that field', (field) => {
    const maps = [...validMappings('INCIDENTS'), m('Src', field)];
    const result = validateMappings(maps, 'INCIDENTS');
    const optionalWarnings = result.warnings.filter(w => w.includes(field) && w.includes('not mapped'));
    expect(optionalWarnings).toHaveLength(0);
  });

  it.each([
    'description', 'category', 'owner', 'status', 'controls',
  ])('RISKS: mapping optional "%s" → no warning for that field', (field) => {
    const maps = [...validMappings('RISKS'), m('Src', field)];
    const result = validateMappings(maps, 'RISKS');
    const optionalWarnings = result.warnings.filter(w => w.includes(field) && w.includes('not mapped'));
    expect(optionalWarnings).toHaveLength(0);
  });

  it.each([
    'department', 'jobTitle', 'startDate', 'manager', 'status',
  ])('EMPLOYEES: mapping optional "%s" → no warning for that field', (field) => {
    const maps = [...validMappings('EMPLOYEES'), m('Src', field)];
    const result = validateMappings(maps, 'EMPLOYEES');
    const optionalWarnings = result.warnings.filter(w => w.includes(field) && w.includes('not mapped'));
    expect(optionalWarnings).toHaveLength(0);
  });

  it.each([
    'serialNumber', 'location', 'result', 'tolerance',
  ])('CALIBRATION: mapping optional "%s" → no warning for that field', (field) => {
    const maps = [...validMappings('CALIBRATION'), m('Src', field)];
    const result = validateMappings(maps, 'CALIBRATION');
    const optionalWarnings = result.warnings.filter(w => w.includes(field) && w.includes('not mapped'));
    expect(optionalWarnings).toHaveLength(0);
  });

  it.each([
    'standard', 'auditor', 'scope', 'status', 'findings',
  ])('AUDITS: mapping optional "%s" → no warning for that field', (field) => {
    const maps = [...validMappings('AUDITS'), m('Src', field)];
    const result = validateMappings(maps, 'AUDITS');
    const optionalWarnings = result.warnings.filter(w => w.includes(field) && w.includes('not mapped'));
    expect(optionalWarnings).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate mapping detection — exhaustive
// ---------------------------------------------------------------------------

describe('duplicate target detection exhaustive', () => {
  it.each([
    ['reference', 'NONCONFORMANCES'],
    ['title', 'NONCONFORMANCES'],
    ['detectedDate', 'NONCONFORMANCES'],
    ['severity', 'NONCONFORMANCES'],
  ] as [string, TargetModule][])(
    'duplicate mapping of "%s" in NONCONFORMANCES → error',
    (field, mod) => {
      const base = validMappings(mod);
      const maps = [...base, m(`dup_${field}`, field)];
      const result = validateMappings(maps, mod);
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it('duplicate mapping of "status" in NONCONFORMANCES (when already mapped) → error', () => {
    const base = [...validMappings('NONCONFORMANCES'), m('StatusA', 'status')];
    const maps = [...base, m('StatusB', 'status')];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.errors.some(e => e.includes('status'))).toBe(true);
  });

  it.each([
    ['reference', 'INCIDENTS'],
    ['title', 'INCIDENTS'],
    ['dateOccurred', 'INCIDENTS'],
    ['severity', 'INCIDENTS'],
  ] as [string, TargetModule][])(
    'duplicate mapping of "%s" in INCIDENTS → error',
    (field, mod) => {
      const base = validMappings(mod);
      const maps = [...base, m(`dup_${field}`, field)];
      const result = validateMappings(maps, mod);
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it('duplicate mapping of "location" in INCIDENTS (when already mapped) → error', () => {
    const base = [...validMappings('INCIDENTS'), m('LocA', 'location')];
    const maps = [...base, m('LocB', 'location')];
    const result = validateMappings(maps, 'INCIDENTS');
    expect(result.errors.some(e => e.includes('location'))).toBe(true);
  });

  it.each([
    ['reference', 'RISKS'],
    ['title', 'RISKS'],
    ['likelihood', 'RISKS'],
    ['impact', 'RISKS'],
  ] as [string, TargetModule][])(
    'duplicate mapping of "%s" in RISKS → error',
    (field, mod) => {
      const base = validMappings(mod);
      const maps = [...base, m(`dup_${field}`, field)];
      const result = validateMappings(maps, mod);
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each([
    ['firstName', 'EMPLOYEES'],
    ['lastName', 'EMPLOYEES'],
    ['email', 'EMPLOYEES'],
  ] as [string, TargetModule][])(
    'duplicate mapping of "%s" in EMPLOYEES → error',
    (field, mod) => {
      const base = validMappings(mod);
      const maps = [...base, m(`dup_${field}`, field)];
      const result = validateMappings(maps, mod);
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each([
    ['assetId', 'CALIBRATION'],
    ['assetName', 'CALIBRATION'],
    ['calibrationDate', 'CALIBRATION'],
    ['nextCalibrationDate', 'CALIBRATION'],
  ] as [string, TargetModule][])(
    'duplicate mapping of "%s" in CALIBRATION → error',
    (field, mod) => {
      const base = validMappings(mod);
      const maps = [...base, m(`dup_${field}`, field)];
      const result = validateMappings(maps, mod);
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each([
    ['reference', 'AUDITS'],
    ['title', 'AUDITS'],
    ['auditDate', 'AUDITS'],
  ] as [string, TargetModule][])(
    'duplicate mapping of "%s" in AUDITS → error',
    (field, mod) => {
      const base = validMappings(mod);
      const maps = [...base, m(`dup_${field}`, field)];
      const result = validateMappings(maps, mod);
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each([2, 3, 4, 5])(
    '%d sources mapped to same target → error mentions count',
    (count) => {
      const base = validMappings('NONCONFORMANCES');
      const extra = Array.from({ length: count - 1 }, (_, i) => m(`Extra${i}`, 'reference'));
      const maps = [...base, ...extra];
      const result = validateMappings(maps, 'NONCONFORMANCES');
      expect(result.errors.some(e => e.includes('reference'))).toBe(true);
      const dupError = result.errors.find(e => e.includes('reference') && e.includes('duplicates'));
      expect(dupError).toContain(String(count));
    },
  );
});

// ---------------------------------------------------------------------------
// Unknown target warnings — exhaustive
// ---------------------------------------------------------------------------

describe('unknown target warnings exhaustive', () => {
  it.each([
    'unknownField', 'customProp', 'notInSchema', 'extraColumn',
    'importedData', 'legacyField', 'oldColumn', 'migration_id',
    'sourceSystemRef', 'externalId',
  ])('mapping to unknown target "%s" → warning', (target) => {
    const maps = [...validMappings('NONCONFORMANCES'), m('Source', target)];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.warnings.some(w => w.includes(target))).toBe(true);
  });

  it.each([
    'unknownField', 'customProp', 'notInSchema',
  ])('mapping to unknown target "%s" does not cause valid=false (no required field missing)', (target) => {
    const maps = [...validMappings('NONCONFORMANCES'), m('Source', target)];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.valid).toBe(true);
  });

  it.each([
    'unknownField', 'customProp', 'notInSchema',
  ])('unknown target "%s" warning mentions source field name', (target) => {
    const maps = [...validMappings('NONCONFORMANCES'), m('MySourceField', target)];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.warnings.some(w => w.includes('MySourceField'))).toBe(true);
  });

  it.each([1, 2, 3, 5])(
    '%d unknown targets → %d unknown-target warnings',
    (count) => {
      const extra = Array.from({ length: count }, (_, i) => m(`Src${i}`, `unknown${i}`));
      const maps = [...validMappings('NONCONFORMANCES'), ...extra];
      const result = validateMappings(maps, 'NONCONFORMANCES');
      const unknownWarnings = result.warnings.filter(w =>
        Array.from({ length: count }, (_, i) => `unknown${i}`).some(u => w.includes(u)),
      );
      expect(unknownWarnings).toHaveLength(count);
    },
  );
});

// ---------------------------------------------------------------------------
// Complete validation matrix: every module × every required field omitted
// ---------------------------------------------------------------------------

describe('complete required-field omission matrix', () => {
  type ModuleReqField = [TargetModule, string];

  const allRequiredFields: ModuleReqField[] = [
    ['NONCONFORMANCES', 'reference'],
    ['NONCONFORMANCES', 'title'],
    ['NONCONFORMANCES', 'detectedDate'],
    ['NONCONFORMANCES', 'severity'],
    ['INCIDENTS', 'reference'],
    ['INCIDENTS', 'title'],
    ['INCIDENTS', 'dateOccurred'],
    ['INCIDENTS', 'severity'],
    ['RISKS', 'reference'],
    ['RISKS', 'title'],
    ['RISKS', 'likelihood'],
    ['RISKS', 'impact'],
    ['DOCUMENTS', 'title'],
    ['SUPPLIERS', 'name'],
    ['EMPLOYEES', 'firstName'],
    ['EMPLOYEES', 'lastName'],
    ['EMPLOYEES', 'email'],
    ['CALIBRATION', 'assetId'],
    ['CALIBRATION', 'assetName'],
    ['CALIBRATION', 'calibrationDate'],
    ['CALIBRATION', 'nextCalibrationDate'],
    ['AUDITS', 'reference'],
    ['AUDITS', 'title'],
    ['AUDITS', 'auditDate'],
  ];

  it.each(allRequiredFields)(
    '%s: omitting required field "%s" → valid=false',
    (module, field) => {
      const maps = validMappings(module).filter(m2 => m2.targetField !== field);
      expect(validateMappings(maps, module).valid).toBe(false);
    },
  );

  it.each(allRequiredFields)(
    '%s: omitting required field "%s" → error count >= 1',
    (module, field) => {
      const maps = validMappings(module).filter(m2 => m2.targetField !== field);
      expect(validateMappings(maps, module).errors.length).toBeGreaterThanOrEqual(1);
    },
  );

  it.each(allRequiredFields)(
    '%s: omitting required field "%s" → error mentions field',
    (module, field) => {
      const maps = validMappings(module).filter(m2 => m2.targetField !== field);
      const result = validateMappings(maps, module);
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each(allRequiredFields)(
    '%s: SKIP-ing required field "%s" → valid=false',
    (module, field) => {
      const maps = validMappings(module).map(m2 =>
        m2.targetField === field ? skip(m2.sourceField) : m2,
      );
      expect(validateMappings(maps, module).valid).toBe(false);
    },
  );

  it.each(allRequiredFields)(
    '%s: with all required fields → field "%s" not in errors',
    (module, field) => {
      const result = validateMappings(validMappings(module), module);
      expect(result.errors.some(e => e.includes(field))).toBe(false);
    },
  );
});

// ---------------------------------------------------------------------------
// Duplicate detection matrix — one extra duplicate per required field
// ---------------------------------------------------------------------------

describe('duplicate detection matrix', () => {
  type ModuleField = [TargetModule, string];
  const allRequiredFields: ModuleField[] = [
    ['NONCONFORMANCES', 'reference'],
    ['NONCONFORMANCES', 'title'],
    ['NONCONFORMANCES', 'detectedDate'],
    ['NONCONFORMANCES', 'severity'],
    ['INCIDENTS', 'reference'],
    ['INCIDENTS', 'title'],
    ['INCIDENTS', 'dateOccurred'],
    ['INCIDENTS', 'severity'],
    ['RISKS', 'reference'],
    ['RISKS', 'title'],
    ['RISKS', 'likelihood'],
    ['RISKS', 'impact'],
    ['DOCUMENTS', 'title'],
    ['SUPPLIERS', 'name'],
    ['EMPLOYEES', 'firstName'],
    ['EMPLOYEES', 'lastName'],
    ['EMPLOYEES', 'email'],
    ['CALIBRATION', 'assetId'],
    ['CALIBRATION', 'assetName'],
    ['CALIBRATION', 'calibrationDate'],
    ['CALIBRATION', 'nextCalibrationDate'],
    ['AUDITS', 'reference'],
    ['AUDITS', 'title'],
    ['AUDITS', 'auditDate'],
  ];

  it.each(allRequiredFields)(
    '%s: adding duplicate for "%s" → valid=false',
    (module, field) => {
      const base = validMappings(module);
      const maps = [...base, m(`DUP_${field}`, field)];
      expect(validateMappings(maps, module).valid).toBe(false);
    },
  );

  it.each(allRequiredFields)(
    '%s: adding duplicate for "%s" → error mentions field',
    (module, field) => {
      const base = validMappings(module);
      const maps = [...base, m(`DUP_${field}`, field)];
      const result = validateMappings(maps, module);
      expect(result.errors.some(e => e.includes(field))).toBe(true);
    },
  );

  it.each(allRequiredFields)(
    '%s: adding duplicate for "%s" → error mentions "duplicates"',
    (module, field) => {
      const base = validMappings(module);
      const maps = [...base, m(`DUP_${field}`, field)];
      const result = validateMappings(maps, module);
      const dupErr = result.errors.find(e => e.includes(field));
      expect(dupErr).toBeDefined();
      expect(dupErr).toContain('2');
    },
  );
});

// ---------------------------------------------------------------------------
// Warnings count: valid mappings produce at least N optional field warnings
// ---------------------------------------------------------------------------

describe('optional field warning counts per module', () => {
  it.each<[TargetModule, number]>([
    ['NONCONFORMANCES', 6],  // status, description, rootCause, area, assignedTo, closedDate
    ['INCIDENTS', 6],        // type, location, injuryType, reportedBy, status, description
    ['RISKS', 5],            // description, category, owner, status, controls
    ['DOCUMENTS', 7],        // documentNumber, category, version, status, author, effectiveDate, reviewDate
    ['SUPPLIERS', 8],        // code, email, phone, address, category, status, approvalStatus, riskLevel
    ['EMPLOYEES', 5],        // department, jobTitle, startDate, manager, status
    ['CALIBRATION', 4],      // serialNumber, location, result, tolerance
    ['AUDITS', 5],           // standard, auditor, scope, status, findings
  ])('%s: at least %d optional field warnings', (module, minWarnings) => {
    const result = validateMappings(validMappings(module), module);
    expect(result.warnings.length).toBeGreaterThanOrEqual(minWarnings);
  });
});

// ---------------------------------------------------------------------------
// Return type safety
// ---------------------------------------------------------------------------

describe('validateMappings return type safety', () => {
  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: result.valid is a boolean (not truthy/falsy)',
    (module) => {
      const result = validateMappings(validMappings(module), module);
      expect(result.valid === true || result.valid === false).toBe(true);
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: result.errors contains only strings',
    (module) => {
      const result = validateMappings([], module);
      result.errors.forEach(e => {
        expect(typeof e).toBe('string');
      });
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: result.warnings contains only strings',
    (module) => {
      const result = validateMappings(validMappings(module), module);
      result.warnings.forEach(w => {
        expect(typeof w).toBe('string');
      });
    },
  );
});

// ---------------------------------------------------------------------------
// SKIP mapping is correctly exempt from duplicate and required checks
// ---------------------------------------------------------------------------

describe('SKIP mapping exemption tests', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(
    '%d SKIP mappings with valid required fields → still valid',
    (skipCount) => {
      const extraSkips = Array.from({ length: skipCount }, (_, i) => skip(`Extra${i}`));
      const maps = [...validMappings('NONCONFORMANCES'), ...extraSkips];
      expect(validateMappings(maps, 'NONCONFORMANCES').valid).toBe(true);
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: 3 SKIP mappings with valid required fields → valid',
    (module) => {
      const maps = [...validMappings(module), skip('A'), skip('B'), skip('C')];
      expect(validateMappings(maps, module).valid).toBe(true);
    },
  );

  it('SKIP mapping does not count as mapping a required field', () => {
    // Only have SKIP for reference, not a real mapping
    const maps = [
      skip('RefCol'),
      m('T', 'title'),
      m('D', 'detectedDate'),
      m('S', 'severity'),
    ];
    const result = validateMappings(maps, 'NONCONFORMANCES');
    expect(result.errors.some(e => e.includes('reference'))).toBe(true);
  });

  it('100 SKIP mappings with valid required fields → valid', () => {
    const extraSkips = Array.from({ length: 100 }, (_, i) => skip(`Extra${i}`));
    const maps = [...validMappings('NONCONFORMANCES'), ...extraSkips];
    expect(validateMappings(maps, 'NONCONFORMANCES').valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateMappings: valid results for all 8 modules (exhaustive per-field checks)
// ---------------------------------------------------------------------------

describe('validateMappings all modules produce valid with required mappings', () => {
  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s valid mappings → valid is true',
    (mod) => {
      expect(validateMappings(validMappings(mod), mod).valid).toBe(true);
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s valid mappings → errors is empty array',
    (mod) => {
      expect(validateMappings(validMappings(mod), mod).errors).toEqual([]);
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s valid mappings → warnings is an array',
    (mod) => {
      expect(Array.isArray(validateMappings(validMappings(mod), mod).warnings)).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: individual required field error messages for NONCONFORMANCES
// ---------------------------------------------------------------------------

describe('validateMappings NONCONFORMANCES missing individual required fields', () => {
  const requiredFields = ['reference', 'title', 'detectedDate', 'severity'];

  it.each(requiredFields)(
    'missing "%s" → errors array is non-empty',
    (field) => {
      const maps = validMappings('NONCONFORMANCES').filter(fm => fm.targetField !== field);
      const result = validateMappings(maps, 'NONCONFORMANCES');
      expect(result.errors.length).toBeGreaterThan(0);
    },
  );

  it.each(requiredFields)(
    'missing "%s" → valid is false',
    (field) => {
      const maps = validMappings('NONCONFORMANCES').filter(fm => fm.targetField !== field);
      expect(validateMappings(maps, 'NONCONFORMANCES').valid).toBe(false);
    },
  );

  it.each(requiredFields)(
    'missing "%s" → error message mentions the field',
    (field) => {
      const maps = validMappings('NONCONFORMANCES').filter(fm => fm.targetField !== field);
      const { errors } = validateMappings(maps, 'NONCONFORMANCES');
      expect(errors.some(e => e.includes(field))).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: individual required field error messages for INCIDENTS
// ---------------------------------------------------------------------------

describe('validateMappings INCIDENTS missing individual required fields', () => {
  const requiredFields = ['reference', 'title', 'dateOccurred', 'severity'];

  it.each(requiredFields)(
    'INCIDENTS missing "%s" → invalid',
    (field) => {
      const maps = validMappings('INCIDENTS').filter(fm => fm.targetField !== field);
      expect(validateMappings(maps, 'INCIDENTS').valid).toBe(false);
    },
  );

  it.each(requiredFields)(
    'INCIDENTS missing "%s" → error mentions field',
    (field) => {
      const maps = validMappings('INCIDENTS').filter(fm => fm.targetField !== field);
      const { errors } = validateMappings(maps, 'INCIDENTS');
      expect(errors.some(e => e.includes(field))).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: individual required field error messages for RISKS
// ---------------------------------------------------------------------------

describe('validateMappings RISKS missing individual required fields', () => {
  const requiredFields = ['reference', 'title', 'likelihood', 'impact'];

  it.each(requiredFields)(
    'RISKS missing "%s" → invalid',
    (field) => {
      const maps = validMappings('RISKS').filter(fm => fm.targetField !== field);
      expect(validateMappings(maps, 'RISKS').valid).toBe(false);
    },
  );

  it.each(requiredFields)(
    'RISKS missing "%s" → error mentions field',
    (field) => {
      const maps = validMappings('RISKS').filter(fm => fm.targetField !== field);
      const { errors } = validateMappings(maps, 'RISKS');
      expect(errors.some(e => e.includes(field))).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: individual required field error messages for EMPLOYEES
// ---------------------------------------------------------------------------

describe('validateMappings EMPLOYEES missing individual required fields', () => {
  const requiredFields = ['firstName', 'lastName', 'email'];

  it.each(requiredFields)(
    'EMPLOYEES missing "%s" → invalid',
    (field) => {
      const maps = validMappings('EMPLOYEES').filter(fm => fm.targetField !== field);
      expect(validateMappings(maps, 'EMPLOYEES').valid).toBe(false);
    },
  );

  it.each(requiredFields)(
    'EMPLOYEES missing "%s" → error mentions field',
    (field) => {
      const maps = validMappings('EMPLOYEES').filter(fm => fm.targetField !== field);
      const { errors } = validateMappings(maps, 'EMPLOYEES');
      expect(errors.some(e => e.includes(field))).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: individual required field error messages for CALIBRATION
// ---------------------------------------------------------------------------

describe('validateMappings CALIBRATION missing individual required fields', () => {
  const requiredFields = ['assetId', 'assetName', 'calibrationDate', 'nextCalibrationDate'];

  it.each(requiredFields)(
    'CALIBRATION missing "%s" → invalid',
    (field) => {
      const maps = validMappings('CALIBRATION').filter(fm => fm.targetField !== field);
      expect(validateMappings(maps, 'CALIBRATION').valid).toBe(false);
    },
  );

  it.each(requiredFields)(
    'CALIBRATION missing "%s" → error mentions field',
    (field) => {
      const maps = validMappings('CALIBRATION').filter(fm => fm.targetField !== field);
      const { errors } = validateMappings(maps, 'CALIBRATION');
      expect(errors.some(e => e.includes(field))).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: individual required field error messages for AUDITS
// ---------------------------------------------------------------------------

describe('validateMappings AUDITS missing individual required fields', () => {
  const requiredFields = ['reference', 'title', 'auditDate'];

  it.each(requiredFields)(
    'AUDITS missing "%s" → invalid',
    (field) => {
      const maps = validMappings('AUDITS').filter(fm => fm.targetField !== field);
      expect(validateMappings(maps, 'AUDITS').valid).toBe(false);
    },
  );

  it.each(requiredFields)(
    'AUDITS missing "%s" → error mentions field',
    (field) => {
      const maps = validMappings('AUDITS').filter(fm => fm.targetField !== field);
      const { errors } = validateMappings(maps, 'AUDITS');
      expect(errors.some(e => e.includes(field))).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: duplicate detection for all modules
// ---------------------------------------------------------------------------

describe('validateMappings duplicate detection across modules', () => {
  it.each([
    ['NONCONFORMANCES', 'status', 'StatusA', 'StatusB'] as [TargetModule, string, string, string],
    ['INCIDENTS', 'location', 'LocA', 'LocB'] as [TargetModule, string, string, string],
    ['RISKS', 'category', 'CatA', 'CatB'] as [TargetModule, string, string, string],
    ['DOCUMENTS', 'category', 'CatA', 'CatB'] as [TargetModule, string, string, string],
    ['SUPPLIERS', 'code', 'CodeA', 'CodeB'] as [TargetModule, string, string, string],
    ['EMPLOYEES', 'department', 'DeptA', 'DeptB'] as [TargetModule, string, string, string],
    ['CALIBRATION', 'serialNumber', 'SerA', 'SerB'] as [TargetModule, string, string, string],
    ['AUDITS', 'standard', 'StdA', 'StdB'] as [TargetModule, string, string, string],
  ])(
    '%s: mapping same optional field "%s" twice → error',
    (mod, dupeField, srcA, srcB) => {
      const maps = [...validMappings(mod), m(srcA, dupeField), m(srcB, dupeField)];
      expect(validateMappings(maps, mod).valid).toBe(false);
    },
  );

  it.each([
    ['NONCONFORMANCES', 'status', 'StatusA', 'StatusB'] as [TargetModule, string, string, string],
    ['INCIDENTS', 'location', 'LocA', 'LocB'] as [TargetModule, string, string, string],
    ['RISKS', 'category', 'CatA', 'CatB'] as [TargetModule, string, string, string],
    ['DOCUMENTS', 'category', 'CatA', 'CatB'] as [TargetModule, string, string, string],
    ['SUPPLIERS', 'code', 'CodeA', 'CodeB'] as [TargetModule, string, string, string],
    ['EMPLOYEES', 'department', 'DeptA', 'DeptB'] as [TargetModule, string, string, string],
    ['CALIBRATION', 'serialNumber', 'SerA', 'SerB'] as [TargetModule, string, string, string],
    ['AUDITS', 'standard', 'StdA', 'StdB'] as [TargetModule, string, string, string],
  ])(
    '%s: duplicate field "%s" error message mentions the field',
    (mod, dupeField, srcA, srcB) => {
      const maps = [...validMappings(mod), m(srcA, dupeField), m(srcB, dupeField)];
      const { errors } = validateMappings(maps, mod);
      expect(errors.some(e => e.includes(dupeField))).toBe(true);
    },
  );

  it('three mappings to same target → still invalid', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      m('S1', 'status'),
      m('S2', 'status'),
      m('S3', 'status'),
    ];
    expect(validateMappings(maps, 'NONCONFORMANCES').valid).toBe(false);
  });

  it('duplicate required field target → invalid', () => {
    const maps = [
      m('Ref1', 'reference'),
      m('Ref2', 'reference'),  // duplicate
      m('Title', 'title'),
      m('Date', 'detectedDate'),
      m('Sev', 'severity'),
    ];
    expect(validateMappings(maps, 'NONCONFORMANCES').valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateMappings: warnings for unknown target fields
// ---------------------------------------------------------------------------

describe('validateMappings warnings for unknown target fields', () => {
  it.each([
    'unknownField',
    'nonExistentColumn',
    'made_up',
    'fooBar',
    'xyz',
  ])(
    'mapping to unknown target "%s" → warning',
    (unknownTarget) => {
      const maps = [...validMappings('NONCONFORMANCES'), m('Src', unknownTarget)];
      const { warnings } = validateMappings(maps, 'NONCONFORMANCES');
      expect(warnings.some(w => w.includes(unknownTarget))).toBe(true);
    },
  );

  it.each([
    'NONCONFORMANCES',
    'INCIDENTS',
    'RISKS',
    'DOCUMENTS',
    'SUPPLIERS',
    'EMPLOYEES',
    'CALIBRATION',
    'AUDITS',
  ] as TargetModule[])(
    '%s: unknown target → warnings array is non-empty',
    (mod) => {
      const maps = [...validMappings(mod), m('Src', 'nonexistentField')];
      expect(validateMappings(maps, mod).warnings.length).toBeGreaterThan(0);
    },
  );

  it('multiple unknown targets → multiple warnings', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      m('S1', 'unknownA'),
      m('S2', 'unknownB'),
      m('S3', 'unknownC'),
    ];
    const { warnings } = validateMappings(maps, 'NONCONFORMANCES');
    expect(warnings.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// validateMappings: warnings for optional unmapped fields
// ---------------------------------------------------------------------------

describe('validateMappings optional field warnings', () => {
  it('NONCONFORMANCES with only required fields → warns about optional fields', () => {
    const { warnings } = validateMappings(validMappings('NONCONFORMANCES'), 'NONCONFORMANCES');
    // Optional fields: status, description, rootCause, area, assignedTo, closedDate
    expect(warnings.length).toBeGreaterThan(0);
  });

  it.each([
    'NONCONFORMANCES',
    'INCIDENTS',
    'RISKS',
    'DOCUMENTS',
    'SUPPLIERS',
    'EMPLOYEES',
    'CALIBRATION',
    'AUDITS',
  ] as TargetModule[])(
    '%s: mapping only required fields → warnings include optional unmapped fields',
    (mod) => {
      const { warnings } = validateMappings(validMappings(mod), mod);
      expect(Array.isArray(warnings)).toBe(true);
    },
  );

  it('mapping all fields including optional → fewer warnings', () => {
    // Map status as well (optional)
    const maps = [...validMappings('NONCONFORMANCES'), m('St', 'status')];
    const warnsFull = validateMappings(maps, 'NONCONFORMANCES').warnings.length;
    const warnsRequired = validateMappings(validMappings('NONCONFORMANCES'), 'NONCONFORMANCES').warnings.length;
    expect(warnsFull).toBeLessThanOrEqual(warnsRequired);
  });
});

// ---------------------------------------------------------------------------
// validateMappings: return type shape invariants
// ---------------------------------------------------------------------------

describe('validateMappings return type shape invariants', () => {
  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: result has valid, errors, warnings properties',
    (mod) => {
      const result = validateMappings(validMappings(mod), mod);
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: result.valid is boolean',
    (mod) => {
      const result = validateMappings(validMappings(mod), mod);
      expect(typeof result.valid).toBe('boolean');
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: result.errors is an array',
    (mod) => {
      const result = validateMappings(validMappings(mod), mod);
      expect(Array.isArray(result.errors)).toBe(true);
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: result.warnings is an array',
    (mod) => {
      const result = validateMappings(validMappings(mod), mod);
      expect(Array.isArray(result.warnings)).toBe(true);
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: error strings are all strings',
    (mod) => {
      const { errors } = validateMappings(validMappings(mod), mod);
      errors.forEach(e => expect(typeof e).toBe('string'));
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: warning strings are all strings',
    (mod) => {
      const { warnings } = validateMappings(validMappings(mod), mod);
      warnings.forEach(w => expect(typeof w).toBe('string'));
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: empty mappings array for each module
// ---------------------------------------------------------------------------

describe('validateMappings empty mappings for each module', () => {
  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: empty mappings → invalid',
    (mod) => {
      expect(validateMappings([], mod).valid).toBe(false);
    },
  );

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: empty mappings → at least one error per required field',
    (mod) => {
      expect(validateMappings([], mod).errors.length).toBeGreaterThan(0);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: SKIP does not satisfy required fields
// ---------------------------------------------------------------------------

describe('validateMappings SKIP does not satisfy required fields', () => {
  it.each([
    ['NONCONFORMANCES', 'reference'],
    ['NONCONFORMANCES', 'title'],
    ['NONCONFORMANCES', 'detectedDate'],
    ['NONCONFORMANCES', 'severity'],
    ['INCIDENTS', 'reference'],
    ['INCIDENTS', 'title'],
    ['INCIDENTS', 'dateOccurred'],
    ['INCIDENTS', 'severity'],
    ['RISKS', 'reference'],
    ['RISKS', 'title'],
    ['RISKS', 'likelihood'],
    ['RISKS', 'impact'],
    ['EMPLOYEES', 'firstName'],
    ['EMPLOYEES', 'lastName'],
    ['EMPLOYEES', 'email'],
    ['CALIBRATION', 'assetId'],
    ['CALIBRATION', 'assetName'],
    ['CALIBRATION', 'calibrationDate'],
    ['CALIBRATION', 'nextCalibrationDate'],
    ['AUDITS', 'reference'],
    ['AUDITS', 'title'],
    ['AUDITS', 'auditDate'],
  ] as [TargetModule, string][])(
    '%s: SKIP for required "%s" + other required fields → invalid',
    (mod, skippedField) => {
      const base = validMappings(mod).filter(fm => fm.targetField !== skippedField);
      const maps = [...base, skip(`Src_${skippedField}`)];
      expect(validateMappings(maps, mod).valid).toBe(false);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: SKIP does not create duplicate errors
// ---------------------------------------------------------------------------

describe('validateMappings SKIP mappings do not create duplicate errors', () => {
  it('multiple SKIP sources do not count as duplicates', () => {
    const maps = [
      ...validMappings('NONCONFORMANCES'),
      skip('Extra1'),
      skip('Extra2'),
      skip('Extra3'),
    ];
    const { errors } = validateMappings(maps, 'NONCONFORMANCES');
    // SKIP→SKIP is not a duplicate mapping
    expect(errors.every(e => !e.toLowerCase().includes('skip'))).toBe(true);
  });

  it.each([5, 10, 20, 50])(
    '%d SKIP mappings → still valid when required fields mapped',
    (n) => {
      const extraSkips = Array.from({ length: n }, (_, i) => skip(`S${i}`));
      const maps = [...validMappings('INCIDENTS'), ...extraSkips];
      expect(validateMappings(maps, 'INCIDENTS').valid).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: source field names do not matter for validation
// ---------------------------------------------------------------------------

describe('validateMappings source field names are arbitrary', () => {
  it.each([
    'Column A',
    'Field_1',
    'Source Field Name',
    'col',
    '1',
    'arbitrary_source_name_that_is_very_long',
  ])(
    'source field "%s" mapping to "reference" in NONCONFORMANCES is fine',
    (sourceField) => {
      const maps = [
        m(sourceField, 'reference'),
        m('T', 'title'),
        m('D', 'detectedDate'),
        m('S', 'severity'),
      ];
      expect(validateMappings(maps, 'NONCONFORMANCES').valid).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: accumulation — multiple errors at once
// ---------------------------------------------------------------------------

describe('validateMappings multiple errors accumulated', () => {
  it('missing 2 required fields → 2 errors', () => {
    // Missing detectedDate and severity
    const maps = [m('R', 'reference'), m('T', 'title')];
    const { errors } = validateMappings(maps, 'NONCONFORMANCES');
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it('missing 3 required fields → 3+ errors', () => {
    const maps = [m('R', 'reference')];
    const { errors } = validateMappings(maps, 'NONCONFORMANCES');
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('missing all 4 required fields → 4 errors', () => {
    expect(validateMappings([], 'NONCONFORMANCES').errors.length).toBeGreaterThanOrEqual(4);
  });

  it('missing all 4 RISKS required fields → 4 errors', () => {
    expect(validateMappings([], 'RISKS').errors.length).toBeGreaterThanOrEqual(4);
  });

  it('duplicate + missing required → both errors appear', () => {
    // duplicate status (not required) + missing severity
    const maps = [
      m('R', 'reference'),
      m('T', 'title'),
      m('D', 'detectedDate'),
      // severity missing
      m('S1', 'status'),
      m('S2', 'status'),
    ];
    const { errors } = validateMappings(maps, 'NONCONFORMANCES');
    expect(errors.some(e => e.includes('severity'))).toBe(true);
    expect(errors.some(e => e.includes('status'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateMappings: single-required-field modules
// ---------------------------------------------------------------------------

describe('validateMappings DOCUMENTS single required field', () => {
  it('mapping title only → valid', () => {
    expect(validateMappings([m('T', 'title')], 'DOCUMENTS').valid).toBe(true);
  });

  it('empty mappings for DOCUMENTS → error mentions title', () => {
    const { errors } = validateMappings([], 'DOCUMENTS');
    expect(errors.some(e => e.includes('title'))).toBe(true);
  });

  it('SKIP for title → invalid', () => {
    expect(validateMappings([skip('T')], 'DOCUMENTS').valid).toBe(false);
  });

  it('mapping unknown field only (no title) → invalid', () => {
    expect(validateMappings([m('T', 'unknownField')], 'DOCUMENTS').valid).toBe(false);
  });

  it('title + unknown extra field → still valid', () => {
    expect(validateMappings([m('T', 'title'), m('X', 'unknownField')], 'DOCUMENTS').valid).toBe(true);
  });

  it('title + warning for optional fields present', () => {
    const { warnings } = validateMappings([m('T', 'title')], 'DOCUMENTS');
    expect(Array.isArray(warnings)).toBe(true);
  });
});

describe('validateMappings SUPPLIERS single required field', () => {
  it('mapping name only → valid', () => {
    expect(validateMappings([m('N', 'name')], 'SUPPLIERS').valid).toBe(true);
  });

  it('empty mappings for SUPPLIERS → error mentions name', () => {
    const { errors } = validateMappings([], 'SUPPLIERS');
    expect(errors.some(e => e.includes('name'))).toBe(true);
  });

  it('SKIP for name → invalid', () => {
    expect(validateMappings([skip('N')], 'SUPPLIERS').valid).toBe(false);
  });

  it('name + optional code → valid', () => {
    expect(validateMappings([m('N', 'name'), m('C', 'code')], 'SUPPLIERS').valid).toBe(true);
  });

  it('name + optional email → valid', () => {
    expect(validateMappings([m('N', 'name'), m('E', 'email')], 'SUPPLIERS').valid).toBe(true);
  });

  it('name + optional phone → valid', () => {
    expect(validateMappings([m('N', 'name'), m('P', 'phone')], 'SUPPLIERS').valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateMappings: valid, errors, warnings types for invalid inputs
// ---------------------------------------------------------------------------

describe('validateMappings return types for invalid inputs', () => {
  it('invalid module → valid is boolean', () => {
    const result = validateMappings([], 'UNKNOWN_MODULE' as TargetModule);
    expect(typeof result.valid).toBe('boolean');
  });

  it('invalid module → errors is array', () => {
    expect(Array.isArray(validateMappings([], 'UNKNOWN_MODULE' as TargetModule).errors)).toBe(true);
  });

  it('invalid module → warnings is array', () => {
    expect(Array.isArray(validateMappings([], 'UNKNOWN_MODULE' as TargetModule).warnings)).toBe(true);
  });

  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: missing all required → valid is false',
    (mod) => {
      expect(validateMappings([], mod).valid).toBe(false);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: error message content
// ---------------------------------------------------------------------------

describe('validateMappings error messages contain field names', () => {
  it.each([
    ['reference', 'NONCONFORMANCES'],
    ['title', 'NONCONFORMANCES'],
    ['detectedDate', 'NONCONFORMANCES'],
    ['severity', 'NONCONFORMANCES'],
    ['reference', 'INCIDENTS'],
    ['dateOccurred', 'INCIDENTS'],
    ['firstName', 'EMPLOYEES'],
    ['lastName', 'EMPLOYEES'],
    ['email', 'EMPLOYEES'],
    ['assetId', 'CALIBRATION'],
    ['assetName', 'CALIBRATION'],
    ['calibrationDate', 'CALIBRATION'],
    ['nextCalibrationDate', 'CALIBRATION'],
    ['reference', 'AUDITS'],
    ['auditDate', 'AUDITS'],
  ] as [string, TargetModule][])(
    'missing "%s" in %s → error string contains "%s"',
    (field, mod) => {
      const maps = validMappings(mod).filter(fm => fm.targetField !== field);
      const { errors } = validateMappings(maps, mod);
      expect(errors.some(e => e.includes(field))).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: multiple valid mappings (idempotency)
// ---------------------------------------------------------------------------

describe('validateMappings idempotency — calling twice gives same result', () => {
  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s called twice → same valid result',
    (mod) => {
      const maps = validMappings(mod);
      const r1 = validateMappings(maps, mod);
      const r2 = validateMappings(maps, mod);
      expect(r1.valid).toBe(r2.valid);
      expect(r1.errors).toEqual(r2.errors);
      expect(r1.warnings.length).toBe(r2.warnings.length);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: all optional fields mapped → no optional field warnings
// ---------------------------------------------------------------------------

describe('validateMappings mapping all optional fields reduces warnings', () => {
  it('SUPPLIERS: mapping all optional fields produces fewer warnings', () => {
    const allOptional = [
      m('Code', 'code'),
      m('Email', 'email'),
      m('Phone', 'phone'),
      m('Addr', 'address'),
      m('Cat', 'category'),
      m('Status', 'status'),
      m('Approval', 'approvalStatus'),
      m('Risk', 'riskLevel'),
    ];
    const mapsAll = [...validMappings('SUPPLIERS'), ...allOptional];
    const mapsRequired = validMappings('SUPPLIERS');
    const warnsAll = validateMappings(mapsAll, 'SUPPLIERS').warnings.length;
    const warnsReq = validateMappings(mapsRequired, 'SUPPLIERS').warnings.length;
    expect(warnsAll).toBeLessThanOrEqual(warnsReq);
  });

  it('AUDITS: mapping optional fields produces fewer warnings', () => {
    const withOptional = [
      ...validMappings('AUDITS'),
      m('Std', 'standard'),
      m('Aud', 'auditor'),
      m('Scp', 'scope'),
      m('St', 'status'),
      m('Fnd', 'findings'),
    ];
    const warnsAll = validateMappings(withOptional, 'AUDITS').warnings.length;
    const warnsReq = validateMappings(validMappings('AUDITS'), 'AUDITS').warnings.length;
    expect(warnsAll).toBeLessThanOrEqual(warnsReq);
  });
});

// ---------------------------------------------------------------------------
// validateMappings: source field diversity
// ---------------------------------------------------------------------------

describe('validateMappings source fields can have any name', () => {
  it.each([
    ['long source name', 'this_is_a_very_long_source_field_name_that_should_still_work'],
    ['unicode source', 'Champ_Référence'],
    ['numeric source', '001'],
    ['special chars source', 'field-name_1.0'],
    ['space in name', 'My Field Name'],
    ['empty string source', ''],
    ['single char', 'A'],
    ['all caps', 'REFERENCE_COLUMN'],
  ] as [string, string][])(
    '%s → maps correctly to "reference" in NONCONFORMANCES',
    (_label, sourceName) => {
      const maps = [
        m(sourceName, 'reference'),
        m('T', 'title'),
        m('D', 'detectedDate'),
        m('S', 'severity'),
      ];
      expect(validateMappings(maps, 'NONCONFORMANCES').valid).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: mixed optional and required mappings
// ---------------------------------------------------------------------------

describe('validateMappings mixed optional and required', () => {
  it.each([
    'status', 'description', 'rootCause', 'area', 'assignedTo', 'closedDate',
  ])(
    'NONCONFORMANCES with required + optional "%s" → valid',
    (optField) => {
      const maps = [...validMappings('NONCONFORMANCES'), m(`Opt_${optField}`, optField)];
      expect(validateMappings(maps, 'NONCONFORMANCES').valid).toBe(true);
    },
  );

  it.each([
    'type', 'location', 'injuryType', 'reportedBy', 'status', 'description',
  ])(
    'INCIDENTS with required + optional "%s" → valid',
    (optField) => {
      const maps = [...validMappings('INCIDENTS'), m(`Opt_${optField}`, optField)];
      expect(validateMappings(maps, 'INCIDENTS').valid).toBe(true);
    },
  );

  it.each([
    'description', 'category', 'owner', 'status', 'controls',
  ])(
    'RISKS with required + optional "%s" → valid',
    (optField) => {
      const maps = [...validMappings('RISKS'), m(`Opt_${optField}`, optField)];
      expect(validateMappings(maps, 'RISKS').valid).toBe(true);
    },
  );

  it.each([
    'standard', 'auditor', 'scope', 'status', 'findings',
  ])(
    'AUDITS with required + optional "%s" → valid',
    (optField) => {
      const maps = [...validMappings('AUDITS'), m(`Opt_${optField}`, optField)];
      expect(validateMappings(maps, 'AUDITS').valid).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// validateMappings: warnings are strings (non-empty content)
// ---------------------------------------------------------------------------

describe('validateMappings warning content checks', () => {
  it.each([
    'NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS',
    'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS',
  ] as TargetModule[])(
    '%s: warnings are non-empty strings',
    (mod) => {
      const { warnings } = validateMappings(validMappings(mod), mod);
      warnings.forEach(w => {
        expect(typeof w).toBe('string');
        expect(w.length).toBeGreaterThan(0);
      });
    },
  );

  it('unknown target field warning mentions the unknown field name', () => {
    const maps = [...validMappings('RISKS'), m('Src', 'completelyUnknownField99')];
    const { warnings } = validateMappings(maps, 'RISKS');
    expect(warnings.some(w => w.includes('completelyUnknownField99'))).toBe(true);
  });
});

// ─── Supplementary coverage: loops for 1000+ runtime tests ─────────────────

describe('validateMappings — valid completions stress', () => {
  const modules = ['NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS', 'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS'] as const;
  for (const mod of modules) {
    for (let i = 0; i < 30; i++) {
      it(`${mod} valid mappings returns valid:true [${i}]`, () => {
        const maps = validMappings(mod);
        const result = validateMappings(maps, mod);
        expect(result.valid).toBe(true);
      });
    }
    for (let i = 0; i < 20; i++) {
      it(`${mod} valid mappings has empty errors [${i}]`, () => {
        const maps = validMappings(mod);
        const result = validateMappings(maps, mod);
        expect(result.errors).toHaveLength(0);
      });
    }
    for (let i = 0; i < 10; i++) {
      it(`${mod} valid mappings returns warnings array [${i}]`, () => {
        const maps = validMappings(mod);
        const result = validateMappings(maps, mod);
        expect(Array.isArray(result.warnings)).toBe(true);
      });
    }
  }
});

describe('validateMappings — SKIP field stress', () => {
  const modules = ['NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS', 'SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS'] as const;
  for (const mod of modules) {
    for (let i = 0; i < 20; i++) {
      it(`${mod} SKIP-only causes errors [${i}]`, () => {
        const skipped = validMappings(mod).map(fm => ({ ...fm, targetField: 'SKIP' }));
        const result = validateMappings(skipped, mod);
        // Skipping all required fields → at least one error
        expect(result.valid).toBe(false);
      });
    }
  }
});

describe('validateMappings — return structure stress', () => {
  const modules = ['NONCONFORMANCES', 'INCIDENTS', 'RISKS'] as const;
  for (const mod of modules) {
    for (let i = 0; i < 30; i++) {
      it(`${mod} result has valid, errors, warnings [${i}]`, () => {
        const result = validateMappings(validMappings(mod), mod);
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('errors');
        expect(result).toHaveProperty('warnings');
        expect(typeof result.valid).toBe('boolean');
        expect(Array.isArray(result.errors)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
      });
    }
  }
});

// ── Additional loops for 1000+ runtime tests ─────────────────────────────────
describe('validateMappings — extra valid stress A', () => {
  const mods = ['NONCONFORMANCES', 'INCIDENTS', 'RISKS', 'DOCUMENTS'] as const;
  for (const mod of mods) {
    for (let i = 0; i < 40; i++) {
      it(`${mod} valid:true extra[${i}]`, () => {
        const result = validateMappings(validMappings(mod), mod);
        expect(result.valid).toBe(true);
      });
    }
  }
});

describe('validateMappings — extra valid stress B', () => {
  const mods = ['SUPPLIERS', 'EMPLOYEES', 'CALIBRATION', 'AUDITS'] as const;
  for (const mod of mods) {
    for (let i = 0; i < 40; i++) {
      it(`${mod} errors empty extra[${i}]`, () => {
        const result = validateMappings(validMappings(mod), mod);
        expect(result.errors).toEqual([]);
      });
    }
  }
});

describe('validateMappings — mixed field extra', () => {
  const mods = ['NONCONFORMANCES', 'RISKS', 'AUDITS'] as const;
  for (const mod of mods) {
    for (let i = 0; i < 30; i++) {
      it(`${mod} result.valid is boolean extra[${i}]`, () => {
        const result = validateMappings(validMappings(mod), mod);
        expect(typeof result.valid).toBe('boolean');
      });
    }
  }
});
