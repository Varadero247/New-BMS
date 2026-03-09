// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { templatesV2 } from '../seeds/templates-v2';

// ── Valid enum values ─────────────────────────────────────────────────────────

const VALID_MODULES = [
  'HEALTH_SAFETY', 'ENVIRONMENT', 'QUALITY', 'AUTOMOTIVE', 'MEDICAL',
  'AEROSPACE', 'HR', 'PAYROLL', 'WORKFLOWS', 'PROJECT_MANAGEMENT',
  'INVENTORY', 'CRM', 'FINANCE', 'INFOSEC', 'ISO37001', 'ISO42001',
  'ESG', 'CMMS', 'FOOD_SAFETY', 'ENERGY', 'FIELD_SERVICE', 'ANALYTICS',
  'RISK', 'TRAINING', 'SUPPLIERS', 'ASSETS', 'DOCUMENTS', 'COMPLAINTS',
  'CONTRACTS', 'PTW', 'INCIDENTS', 'AUDITS', 'MANAGEMENT_REVIEW',
  'CHEMICALS', 'BUSINESS_CONTINUITY',
] as const;

const VALID_CATEGORIES = [
  'RISK_ASSESSMENT', 'INCIDENT_INVESTIGATION', 'AUDIT', 'MANAGEMENT_REVIEW',
  'CAPA', 'COMPLIANCE', 'INSPECTION', 'TRAINING', 'DESIGN_DEVELOPMENT',
  'PROCESS_CONTROL', 'SUPPLIER', 'CUSTOMER', 'REGULATORY', 'PLANNING',
  'REPORTING', 'GENERAL', 'CERTIFICATION', 'POLICY', 'PROCEDURE', 'FORM',
  'REGISTER', 'PLAN', 'REPORT', 'CHECKLIST', 'MATRIX', 'SCHEDULE',
  'RECORD', 'ASSESSMENT', 'MANUAL',
] as const;

const VALID_FIELD_TYPES = [
  'text', 'textarea', 'number', 'date', 'datetime', 'select', 'multiselect',
  'checkbox', 'radio', 'email', 'url', 'tel', 'signature', 'file',
  'section', 'table', 'rating',
] as const;

const VALID_FILE_TYPES = [
  'WORD_DOCX', 'EXCEL_XLSX', 'PDF', 'INTERACTIVE_FORM', 'SPREADSHEET',
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

type ValidModule = typeof VALID_MODULES[number];
type ValidCategory = typeof VALID_CATEGORIES[number];
type ValidFieldType = typeof VALID_FIELD_TYPES[number];
type ValidFileType = typeof VALID_FILE_TYPES[number];

// ── Test suite ────────────────────────────────────────────────────────────────

describe('templatesV2', () => {
  // ── 1. Top-level count ──────────────────────────────────────────────────────
  it('exports exactly 150 templates', () => {
    expect(templatesV2).toHaveLength(150);
  });

  // ── 3. No duplicate codes ───────────────────────────────────────────────────
  it('has no duplicate codes', () => {
    const codes = templatesV2.map((t) => t.code);
    expect(new Set(codes).size).toBe(150);
  });

  // ── 2. Parametric integrity tests ──────────────────────────────────────────
  describe('per-template integrity', () => {
    for (const tpl of templatesV2) {
      describe(`${tpl.code}`, () => {
        it('has a code matching /^TPL-[A-Z]+-\\d{3}$/', () => {
          expect(tpl.code).toMatch(/^TPL-[A-Z]+-\d{3}$/);
        });

        it('has a non-empty name', () => {
          expect(typeof tpl.name).toBe('string');
          expect(tpl.name.length).toBeGreaterThan(0);
        });

        it('has a description with length >= 20', () => {
          expect(typeof tpl.description).toBe('string');
          expect(tpl.description.length).toBeGreaterThanOrEqual(20);
        });

        it('has a valid module', () => {
          expect(VALID_MODULES as readonly string[]).toContain(tpl.module);
        });

        it('has a valid category', () => {
          expect(VALID_CATEGORIES as readonly string[]).toContain(tpl.category);
        });

        it('has tags array with at least 1 entry', () => {
          expect(Array.isArray(tpl.tags)).toBe(true);
          expect(tpl.tags.length).toBeGreaterThanOrEqual(1);
        });

        it('has fields array with at least 4 entries', () => {
          expect(Array.isArray(tpl.fields)).toBe(true);
          expect(tpl.fields.length).toBeGreaterThanOrEqual(4);
        });

        it('has fields where every field has id, label, and valid type', () => {
          for (const field of tpl.fields) {
            expect(typeof field.id).toBe('string');
            expect(field.id.length).toBeGreaterThan(0);
            expect(typeof field.label).toBe('string');
            expect(field.label.length).toBeGreaterThan(0);
            expect(VALID_FIELD_TYPES as readonly string[]).toContain(field.type);
          }
        });
      });
    }
  });

  // ── 4. Module distribution ──────────────────────────────────────────────────
  describe('module distribution', () => {
    let countByModule: Record<string, number>;

    beforeAll(() => {
      countByModule = {};
      for (const tpl of templatesV2) {
        countByModule[tpl.module] = (countByModule[tpl.module] ?? 0) + 1;
      }
    });

    it('QUALITY has 25 templates', () => {
      expect(countByModule['QUALITY']).toBe(25);
    });

    it('HEALTH_SAFETY has 20 templates', () => {
      expect(countByModule['HEALTH_SAFETY']).toBe(20);
    });

    it('INFOSEC has 20 templates', () => {
      expect(countByModule['INFOSEC']).toBe(20);
    });

    it('ENVIRONMENT has 12 templates', () => {
      expect(countByModule['ENVIRONMENT']).toBe(12);
    });

    it('FOOD_SAFETY has 12 templates', () => {
      expect(countByModule['FOOD_SAFETY']).toBe(12);
    });

    it('MEDICAL has 12 templates', () => {
      expect(countByModule['MEDICAL']).toBe(12);
    });

    it('BUSINESS_CONTINUITY has 8 templates', () => {
      expect(countByModule['BUSINESS_CONTINUITY']).toBe(8);
    });

    it('ISO42001 has 8 templates', () => {
      expect(countByModule['ISO42001']).toBe(8);
    });

    it('ESG has 8 templates', () => {
      expect(countByModule['ESG']).toBe(8);
    });

    it('ISO37001 has 6 templates', () => {
      expect(countByModule['ISO37001']).toBe(6);
    });

    it('ENERGY has 5 templates', () => {
      expect(countByModule['ENERGY']).toBe(5);
    });

    it('AUDITS has 4 templates', () => {
      expect(countByModule['AUDITS']).toBe(4);
    });

    it('DOCUMENTS has 3 templates', () => {
      expect(countByModule['DOCUMENTS']).toBe(3);
    });

    it('SUPPLIERS has 4 templates', () => {
      expect(countByModule['SUPPLIERS']).toBe(4);
    });

    it('TRAINING has 3 templates', () => {
      expect(countByModule['TRAINING']).toBe(3);
    });
  });

  // ── 5. isMandatory ──────────────────────────────────────────────────────────
  it('has at least 15 templates with isMandatory: true', () => {
    const mandatory = templatesV2.filter((t) => t.isMandatory === true);
    expect(mandatory.length).toBeGreaterThanOrEqual(15);
  });

  // ── 6. isoStandards integrity ───────────────────────────────────────────────
  it('every template with isoStandards has it as a non-empty array', () => {
    for (const tpl of templatesV2) {
      if (tpl.isoStandards !== undefined) {
        expect(Array.isArray(tpl.isoStandards)).toBe(true);
        expect(tpl.isoStandards.length).toBeGreaterThan(0);
      }
    }
  });

  // ── 7. isoClauses integrity ─────────────────────────────────────────────────
  it('every template with isoClauses has it as a non-empty array', () => {
    for (const tpl of templatesV2) {
      if (tpl.isoClauses !== undefined) {
        expect(Array.isArray(tpl.isoClauses)).toBe(true);
        expect(tpl.isoClauses.length).toBeGreaterThan(0);
      }
    }
  });

  // ── 8. fileType valid values ────────────────────────────────────────────────
  it('every template with fileType has a valid value', () => {
    for (const tpl of templatesV2) {
      if (tpl.fileType !== undefined) {
        expect(VALID_FILE_TYPES as readonly string[]).toContain(tpl.fileType);
      }
    }
  });

  // ── 9. No collision with existing codes ─────────────────────────────────────
  it('no code collides with legacy seed prefixes (TPL-XXX-00[1-9])', () => {
    const legacyPrefixes = [
      'TPL-QMS-00', 'TPL-HS-00', 'TPL-SEC-00', 'TPL-ENV-00',
      'TPL-FS-00', 'TPL-MED-00', 'TPL-AB-00', 'TPL-ENR-00',
      'TPL-ESG-00', 'TPL-AUD-00', 'TPL-DOC-00', 'TPL-SUP-00',
      'TPL-TRN-00',
    ];
    for (const tpl of templatesV2) {
      for (const prefix of legacyPrefixes) {
        expect(tpl.code.startsWith(prefix)).toBe(false);
      }
    }
  });

  // ── 10. BCM templates TPL-BCM-001 through TPL-BCM-008 ──────────────────────
  describe('BCM templates', () => {
    it('all 8 BCM templates exist: TPL-BCM-001 through TPL-BCM-008', () => {
      const codes = new Set(templatesV2.map((t) => t.code));
      for (let i = 1; i <= 8; i++) {
        const expected = `TPL-BCM-00${i}`;
        expect(codes.has(expected)).toBe(true);
      }
    });
  });

  // ── 11. Field id uniqueness within each template ─────────────────────────────
  it('field ids are unique within each template', () => {
    for (const tpl of templatesV2) {
      const fieldIds = tpl.fields.map((f) => f.id);
      const unique = new Set(fieldIds);
      expect(unique.size).toBe(
        fieldIds.length,
        // message shown on failure
      );
    }
  });

  // ── 12. Select/multiselect fields have options ──────────────────────────────
  it('every select or multiselect field has options array with >= 2 entries', () => {
    for (const tpl of templatesV2) {
      for (const field of tpl.fields) {
        if (field.type === 'select' || field.type === 'multiselect') {
          expect(Array.isArray(field.options)).toBe(true);
          expect((field.options ?? []).length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  // ── 13. Table fields have columns ───────────────────────────────────────────
  it('every table field has a columns array', () => {
    for (const tpl of templatesV2) {
      for (const field of tpl.fields) {
        if (field.type === 'table') {
          expect(Array.isArray(field.columns)).toBe(true);
          expect((field.columns ?? []).length).toBeGreaterThan(0);
        }
      }
    }
  });

  // ── 14. Width values ────────────────────────────────────────────────────────
  it('every field with a width property uses full, half, or third', () => {
    const validWidths = ['full', 'half', 'third'];
    for (const tpl of templatesV2) {
      for (const field of tpl.fields) {
        if (field.width !== undefined) {
          expect(validWidths).toContain(field.width);
        }
      }
    }
  });
});
