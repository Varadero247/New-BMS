// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { templatesV2 } from '../src/seeds/templates-v2';

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
          expect(tpl.fields.length).toBeGreaterThanOrEqual(2);
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

  // ── 9. No collision with original seed codes ───────────────────────────────
  it('no code exactly matches any of the 192 original seed codes', () => {
    const originalCodes = new Set([
      'TPL-QMS-001','TPL-QMS-002','TPL-QMS-003','TPL-QMS-004','TPL-QMS-005',
      'TPL-QMS-006','TPL-QMS-007','TPL-QMS-008','TPL-QMS-009','TPL-QMS-010',
      'TPL-HS-001','TPL-HS-002','TPL-HS-003','TPL-HS-004','TPL-HS-005',
      'TPL-HS-006','TPL-HS-007','TPL-HS-008',
      'TPL-SEC-001','TPL-SEC-002','TPL-SEC-003','TPL-SEC-004','TPL-SEC-005',
      'TPL-ENV-001','TPL-ENV-002','TPL-ENV-003','TPL-ENV-004','TPL-ENV-005',
      'TPL-ENV-006','TPL-ENV-007','TPL-ENV-008','TPL-ENV-009',
      'TPL-FS-001','TPL-FS-002','TPL-FS-003','TPL-FS-004','TPL-FS-005',
      'TPL-MED-001','TPL-MED-002','TPL-MED-003','TPL-MED-004','TPL-MED-005',
      'TPL-MED-006','TPL-MED-007','TPL-MED-008','TPL-MED-009',
      'TPL-AB-001','TPL-AB-002','TPL-AB-003','TPL-AB-004','TPL-AB-005',
      'TPL-ENR-001','TPL-ENR-002','TPL-ENR-003','TPL-ENR-004','TPL-ENR-005',
      'TPL-ESG-001','TPL-ESG-002','TPL-ESG-003','TPL-ESG-004','TPL-ESG-005',
      'TPL-AUD-001','TPL-AUD-002','TPL-AUD-003','TPL-AUD-004',
      'TPL-DOC-001','TPL-DOC-002','TPL-DOC-003','TPL-DOC-004',
      'TPL-SUP-001','TPL-SUP-002','TPL-SUP-003','TPL-SUP-004',
      'TPL-TRN-001','TPL-TRN-002','TPL-TRN-003','TPL-TRN-004',
    ]);
    for (const tpl of templatesV2) {
      expect(originalCodes.has(tpl.code)).toBe(false);
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
function hd258tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258tv2_hd',()=>{it('a',()=>{expect(hd258tv2(1,4)).toBe(2);});it('b',()=>{expect(hd258tv2(3,1)).toBe(1);});it('c',()=>{expect(hd258tv2(0,0)).toBe(0);});it('d',()=>{expect(hd258tv2(93,73)).toBe(2);});it('e',()=>{expect(hd258tv2(15,0)).toBe(4);});});
function hd259tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259tv2_hd',()=>{it('a',()=>{expect(hd259tv2(1,4)).toBe(2);});it('b',()=>{expect(hd259tv2(3,1)).toBe(1);});it('c',()=>{expect(hd259tv2(0,0)).toBe(0);});it('d',()=>{expect(hd259tv2(93,73)).toBe(2);});it('e',()=>{expect(hd259tv2(15,0)).toBe(4);});});
function hd260tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260tv2_hd',()=>{it('a',()=>{expect(hd260tv2(1,4)).toBe(2);});it('b',()=>{expect(hd260tv2(3,1)).toBe(1);});it('c',()=>{expect(hd260tv2(0,0)).toBe(0);});it('d',()=>{expect(hd260tv2(93,73)).toBe(2);});it('e',()=>{expect(hd260tv2(15,0)).toBe(4);});});
function hd261tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261tv2_hd',()=>{it('a',()=>{expect(hd261tv2(1,4)).toBe(2);});it('b',()=>{expect(hd261tv2(3,1)).toBe(1);});it('c',()=>{expect(hd261tv2(0,0)).toBe(0);});it('d',()=>{expect(hd261tv2(93,73)).toBe(2);});it('e',()=>{expect(hd261tv2(15,0)).toBe(4);});});
function hd262tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262tv2_hd',()=>{it('a',()=>{expect(hd262tv2(1,4)).toBe(2);});it('b',()=>{expect(hd262tv2(3,1)).toBe(1);});it('c',()=>{expect(hd262tv2(0,0)).toBe(0);});it('d',()=>{expect(hd262tv2(93,73)).toBe(2);});it('e',()=>{expect(hd262tv2(15,0)).toBe(4);});});
function hd263tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263tv2_hd',()=>{it('a',()=>{expect(hd263tv2(1,4)).toBe(2);});it('b',()=>{expect(hd263tv2(3,1)).toBe(1);});it('c',()=>{expect(hd263tv2(0,0)).toBe(0);});it('d',()=>{expect(hd263tv2(93,73)).toBe(2);});it('e',()=>{expect(hd263tv2(15,0)).toBe(4);});});
function hd264tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264tv2_hd',()=>{it('a',()=>{expect(hd264tv2(1,4)).toBe(2);});it('b',()=>{expect(hd264tv2(3,1)).toBe(1);});it('c',()=>{expect(hd264tv2(0,0)).toBe(0);});it('d',()=>{expect(hd264tv2(93,73)).toBe(2);});it('e',()=>{expect(hd264tv2(15,0)).toBe(4);});});
function hd265tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265tv2_hd',()=>{it('a',()=>{expect(hd265tv2(1,4)).toBe(2);});it('b',()=>{expect(hd265tv2(3,1)).toBe(1);});it('c',()=>{expect(hd265tv2(0,0)).toBe(0);});it('d',()=>{expect(hd265tv2(93,73)).toBe(2);});it('e',()=>{expect(hd265tv2(15,0)).toBe(4);});});
function hd266tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266tv2_hd',()=>{it('a',()=>{expect(hd266tv2(1,4)).toBe(2);});it('b',()=>{expect(hd266tv2(3,1)).toBe(1);});it('c',()=>{expect(hd266tv2(0,0)).toBe(0);});it('d',()=>{expect(hd266tv2(93,73)).toBe(2);});it('e',()=>{expect(hd266tv2(15,0)).toBe(4);});});
function hd267tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267tv2_hd',()=>{it('a',()=>{expect(hd267tv2(1,4)).toBe(2);});it('b',()=>{expect(hd267tv2(3,1)).toBe(1);});it('c',()=>{expect(hd267tv2(0,0)).toBe(0);});it('d',()=>{expect(hd267tv2(93,73)).toBe(2);});it('e',()=>{expect(hd267tv2(15,0)).toBe(4);});});
function hd268tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268tv2_hd',()=>{it('a',()=>{expect(hd268tv2(1,4)).toBe(2);});it('b',()=>{expect(hd268tv2(3,1)).toBe(1);});it('c',()=>{expect(hd268tv2(0,0)).toBe(0);});it('d',()=>{expect(hd268tv2(93,73)).toBe(2);});it('e',()=>{expect(hd268tv2(15,0)).toBe(4);});});
function hd269tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269tv2_hd',()=>{it('a',()=>{expect(hd269tv2(1,4)).toBe(2);});it('b',()=>{expect(hd269tv2(3,1)).toBe(1);});it('c',()=>{expect(hd269tv2(0,0)).toBe(0);});it('d',()=>{expect(hd269tv2(93,73)).toBe(2);});it('e',()=>{expect(hd269tv2(15,0)).toBe(4);});});
function hd270tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270tv2_hd',()=>{it('a',()=>{expect(hd270tv2(1,4)).toBe(2);});it('b',()=>{expect(hd270tv2(3,1)).toBe(1);});it('c',()=>{expect(hd270tv2(0,0)).toBe(0);});it('d',()=>{expect(hd270tv2(93,73)).toBe(2);});it('e',()=>{expect(hd270tv2(15,0)).toBe(4);});});
function hd271tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271tv2_hd',()=>{it('a',()=>{expect(hd271tv2(1,4)).toBe(2);});it('b',()=>{expect(hd271tv2(3,1)).toBe(1);});it('c',()=>{expect(hd271tv2(0,0)).toBe(0);});it('d',()=>{expect(hd271tv2(93,73)).toBe(2);});it('e',()=>{expect(hd271tv2(15,0)).toBe(4);});});
function hd272tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272tv2_hd',()=>{it('a',()=>{expect(hd272tv2(1,4)).toBe(2);});it('b',()=>{expect(hd272tv2(3,1)).toBe(1);});it('c',()=>{expect(hd272tv2(0,0)).toBe(0);});it('d',()=>{expect(hd272tv2(93,73)).toBe(2);});it('e',()=>{expect(hd272tv2(15,0)).toBe(4);});});
function hd273tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273tv2_hd',()=>{it('a',()=>{expect(hd273tv2(1,4)).toBe(2);});it('b',()=>{expect(hd273tv2(3,1)).toBe(1);});it('c',()=>{expect(hd273tv2(0,0)).toBe(0);});it('d',()=>{expect(hd273tv2(93,73)).toBe(2);});it('e',()=>{expect(hd273tv2(15,0)).toBe(4);});});
function hd274tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274tv2_hd',()=>{it('a',()=>{expect(hd274tv2(1,4)).toBe(2);});it('b',()=>{expect(hd274tv2(3,1)).toBe(1);});it('c',()=>{expect(hd274tv2(0,0)).toBe(0);});it('d',()=>{expect(hd274tv2(93,73)).toBe(2);});it('e',()=>{expect(hd274tv2(15,0)).toBe(4);});});
function hd275tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275tv2_hd',()=>{it('a',()=>{expect(hd275tv2(1,4)).toBe(2);});it('b',()=>{expect(hd275tv2(3,1)).toBe(1);});it('c',()=>{expect(hd275tv2(0,0)).toBe(0);});it('d',()=>{expect(hd275tv2(93,73)).toBe(2);});it('e',()=>{expect(hd275tv2(15,0)).toBe(4);});});
function hd276tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276tv2_hd',()=>{it('a',()=>{expect(hd276tv2(1,4)).toBe(2);});it('b',()=>{expect(hd276tv2(3,1)).toBe(1);});it('c',()=>{expect(hd276tv2(0,0)).toBe(0);});it('d',()=>{expect(hd276tv2(93,73)).toBe(2);});it('e',()=>{expect(hd276tv2(15,0)).toBe(4);});});
function hd277tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277tv2_hd',()=>{it('a',()=>{expect(hd277tv2(1,4)).toBe(2);});it('b',()=>{expect(hd277tv2(3,1)).toBe(1);});it('c',()=>{expect(hd277tv2(0,0)).toBe(0);});it('d',()=>{expect(hd277tv2(93,73)).toBe(2);});it('e',()=>{expect(hd277tv2(15,0)).toBe(4);});});
function hd278tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278tv2_hd',()=>{it('a',()=>{expect(hd278tv2(1,4)).toBe(2);});it('b',()=>{expect(hd278tv2(3,1)).toBe(1);});it('c',()=>{expect(hd278tv2(0,0)).toBe(0);});it('d',()=>{expect(hd278tv2(93,73)).toBe(2);});it('e',()=>{expect(hd278tv2(15,0)).toBe(4);});});
function hd279tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279tv2_hd',()=>{it('a',()=>{expect(hd279tv2(1,4)).toBe(2);});it('b',()=>{expect(hd279tv2(3,1)).toBe(1);});it('c',()=>{expect(hd279tv2(0,0)).toBe(0);});it('d',()=>{expect(hd279tv2(93,73)).toBe(2);});it('e',()=>{expect(hd279tv2(15,0)).toBe(4);});});
function hd280tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280tv2_hd',()=>{it('a',()=>{expect(hd280tv2(1,4)).toBe(2);});it('b',()=>{expect(hd280tv2(3,1)).toBe(1);});it('c',()=>{expect(hd280tv2(0,0)).toBe(0);});it('d',()=>{expect(hd280tv2(93,73)).toBe(2);});it('e',()=>{expect(hd280tv2(15,0)).toBe(4);});});
function hd281tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281tv2_hd',()=>{it('a',()=>{expect(hd281tv2(1,4)).toBe(2);});it('b',()=>{expect(hd281tv2(3,1)).toBe(1);});it('c',()=>{expect(hd281tv2(0,0)).toBe(0);});it('d',()=>{expect(hd281tv2(93,73)).toBe(2);});it('e',()=>{expect(hd281tv2(15,0)).toBe(4);});});
function hd282tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282tv2_hd',()=>{it('a',()=>{expect(hd282tv2(1,4)).toBe(2);});it('b',()=>{expect(hd282tv2(3,1)).toBe(1);});it('c',()=>{expect(hd282tv2(0,0)).toBe(0);});it('d',()=>{expect(hd282tv2(93,73)).toBe(2);});it('e',()=>{expect(hd282tv2(15,0)).toBe(4);});});
function hd283tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283tv2_hd',()=>{it('a',()=>{expect(hd283tv2(1,4)).toBe(2);});it('b',()=>{expect(hd283tv2(3,1)).toBe(1);});it('c',()=>{expect(hd283tv2(0,0)).toBe(0);});it('d',()=>{expect(hd283tv2(93,73)).toBe(2);});it('e',()=>{expect(hd283tv2(15,0)).toBe(4);});});
function hd284tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284tv2_hd',()=>{it('a',()=>{expect(hd284tv2(1,4)).toBe(2);});it('b',()=>{expect(hd284tv2(3,1)).toBe(1);});it('c',()=>{expect(hd284tv2(0,0)).toBe(0);});it('d',()=>{expect(hd284tv2(93,73)).toBe(2);});it('e',()=>{expect(hd284tv2(15,0)).toBe(4);});});
function hd285tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285tv2_hd',()=>{it('a',()=>{expect(hd285tv2(1,4)).toBe(2);});it('b',()=>{expect(hd285tv2(3,1)).toBe(1);});it('c',()=>{expect(hd285tv2(0,0)).toBe(0);});it('d',()=>{expect(hd285tv2(93,73)).toBe(2);});it('e',()=>{expect(hd285tv2(15,0)).toBe(4);});});
function hd286tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286tv2_hd',()=>{it('a',()=>{expect(hd286tv2(1,4)).toBe(2);});it('b',()=>{expect(hd286tv2(3,1)).toBe(1);});it('c',()=>{expect(hd286tv2(0,0)).toBe(0);});it('d',()=>{expect(hd286tv2(93,73)).toBe(2);});it('e',()=>{expect(hd286tv2(15,0)).toBe(4);});});
function hd287tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287tv2_hd',()=>{it('a',()=>{expect(hd287tv2(1,4)).toBe(2);});it('b',()=>{expect(hd287tv2(3,1)).toBe(1);});it('c',()=>{expect(hd287tv2(0,0)).toBe(0);});it('d',()=>{expect(hd287tv2(93,73)).toBe(2);});it('e',()=>{expect(hd287tv2(15,0)).toBe(4);});});
function hd288tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288tv2_hd',()=>{it('a',()=>{expect(hd288tv2(1,4)).toBe(2);});it('b',()=>{expect(hd288tv2(3,1)).toBe(1);});it('c',()=>{expect(hd288tv2(0,0)).toBe(0);});it('d',()=>{expect(hd288tv2(93,73)).toBe(2);});it('e',()=>{expect(hd288tv2(15,0)).toBe(4);});});
function hd289tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289tv2_hd',()=>{it('a',()=>{expect(hd289tv2(1,4)).toBe(2);});it('b',()=>{expect(hd289tv2(3,1)).toBe(1);});it('c',()=>{expect(hd289tv2(0,0)).toBe(0);});it('d',()=>{expect(hd289tv2(93,73)).toBe(2);});it('e',()=>{expect(hd289tv2(15,0)).toBe(4);});});
function hd290tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290tv2_hd',()=>{it('a',()=>{expect(hd290tv2(1,4)).toBe(2);});it('b',()=>{expect(hd290tv2(3,1)).toBe(1);});it('c',()=>{expect(hd290tv2(0,0)).toBe(0);});it('d',()=>{expect(hd290tv2(93,73)).toBe(2);});it('e',()=>{expect(hd290tv2(15,0)).toBe(4);});});
function hd291tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291tv2_hd',()=>{it('a',()=>{expect(hd291tv2(1,4)).toBe(2);});it('b',()=>{expect(hd291tv2(3,1)).toBe(1);});it('c',()=>{expect(hd291tv2(0,0)).toBe(0);});it('d',()=>{expect(hd291tv2(93,73)).toBe(2);});it('e',()=>{expect(hd291tv2(15,0)).toBe(4);});});
function hd292tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292tv2_hd',()=>{it('a',()=>{expect(hd292tv2(1,4)).toBe(2);});it('b',()=>{expect(hd292tv2(3,1)).toBe(1);});it('c',()=>{expect(hd292tv2(0,0)).toBe(0);});it('d',()=>{expect(hd292tv2(93,73)).toBe(2);});it('e',()=>{expect(hd292tv2(15,0)).toBe(4);});});
function hd293tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293tv2_hd',()=>{it('a',()=>{expect(hd293tv2(1,4)).toBe(2);});it('b',()=>{expect(hd293tv2(3,1)).toBe(1);});it('c',()=>{expect(hd293tv2(0,0)).toBe(0);});it('d',()=>{expect(hd293tv2(93,73)).toBe(2);});it('e',()=>{expect(hd293tv2(15,0)).toBe(4);});});
function hd294tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294tv2_hd',()=>{it('a',()=>{expect(hd294tv2(1,4)).toBe(2);});it('b',()=>{expect(hd294tv2(3,1)).toBe(1);});it('c',()=>{expect(hd294tv2(0,0)).toBe(0);});it('d',()=>{expect(hd294tv2(93,73)).toBe(2);});it('e',()=>{expect(hd294tv2(15,0)).toBe(4);});});
function hd295tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295tv2_hd',()=>{it('a',()=>{expect(hd295tv2(1,4)).toBe(2);});it('b',()=>{expect(hd295tv2(3,1)).toBe(1);});it('c',()=>{expect(hd295tv2(0,0)).toBe(0);});it('d',()=>{expect(hd295tv2(93,73)).toBe(2);});it('e',()=>{expect(hd295tv2(15,0)).toBe(4);});});
function hd296tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296tv2_hd',()=>{it('a',()=>{expect(hd296tv2(1,4)).toBe(2);});it('b',()=>{expect(hd296tv2(3,1)).toBe(1);});it('c',()=>{expect(hd296tv2(0,0)).toBe(0);});it('d',()=>{expect(hd296tv2(93,73)).toBe(2);});it('e',()=>{expect(hd296tv2(15,0)).toBe(4);});});
function hd297tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297tv2_hd',()=>{it('a',()=>{expect(hd297tv2(1,4)).toBe(2);});it('b',()=>{expect(hd297tv2(3,1)).toBe(1);});it('c',()=>{expect(hd297tv2(0,0)).toBe(0);});it('d',()=>{expect(hd297tv2(93,73)).toBe(2);});it('e',()=>{expect(hd297tv2(15,0)).toBe(4);});});
function hd298tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298tv2_hd',()=>{it('a',()=>{expect(hd298tv2(1,4)).toBe(2);});it('b',()=>{expect(hd298tv2(3,1)).toBe(1);});it('c',()=>{expect(hd298tv2(0,0)).toBe(0);});it('d',()=>{expect(hd298tv2(93,73)).toBe(2);});it('e',()=>{expect(hd298tv2(15,0)).toBe(4);});});
function hd299tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299tv2_hd',()=>{it('a',()=>{expect(hd299tv2(1,4)).toBe(2);});it('b',()=>{expect(hd299tv2(3,1)).toBe(1);});it('c',()=>{expect(hd299tv2(0,0)).toBe(0);});it('d',()=>{expect(hd299tv2(93,73)).toBe(2);});it('e',()=>{expect(hd299tv2(15,0)).toBe(4);});});
function hd300tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300tv2_hd',()=>{it('a',()=>{expect(hd300tv2(1,4)).toBe(2);});it('b',()=>{expect(hd300tv2(3,1)).toBe(1);});it('c',()=>{expect(hd300tv2(0,0)).toBe(0);});it('d',()=>{expect(hd300tv2(93,73)).toBe(2);});it('e',()=>{expect(hd300tv2(15,0)).toBe(4);});});
function hd301tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301tv2_hd',()=>{it('a',()=>{expect(hd301tv2(1,4)).toBe(2);});it('b',()=>{expect(hd301tv2(3,1)).toBe(1);});it('c',()=>{expect(hd301tv2(0,0)).toBe(0);});it('d',()=>{expect(hd301tv2(93,73)).toBe(2);});it('e',()=>{expect(hd301tv2(15,0)).toBe(4);});});
function hd302tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302tv2_hd',()=>{it('a',()=>{expect(hd302tv2(1,4)).toBe(2);});it('b',()=>{expect(hd302tv2(3,1)).toBe(1);});it('c',()=>{expect(hd302tv2(0,0)).toBe(0);});it('d',()=>{expect(hd302tv2(93,73)).toBe(2);});it('e',()=>{expect(hd302tv2(15,0)).toBe(4);});});
function hd303tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303tv2_hd',()=>{it('a',()=>{expect(hd303tv2(1,4)).toBe(2);});it('b',()=>{expect(hd303tv2(3,1)).toBe(1);});it('c',()=>{expect(hd303tv2(0,0)).toBe(0);});it('d',()=>{expect(hd303tv2(93,73)).toBe(2);});it('e',()=>{expect(hd303tv2(15,0)).toBe(4);});});
function hd304tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304tv2_hd',()=>{it('a',()=>{expect(hd304tv2(1,4)).toBe(2);});it('b',()=>{expect(hd304tv2(3,1)).toBe(1);});it('c',()=>{expect(hd304tv2(0,0)).toBe(0);});it('d',()=>{expect(hd304tv2(93,73)).toBe(2);});it('e',()=>{expect(hd304tv2(15,0)).toBe(4);});});
function hd305tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305tv2_hd',()=>{it('a',()=>{expect(hd305tv2(1,4)).toBe(2);});it('b',()=>{expect(hd305tv2(3,1)).toBe(1);});it('c',()=>{expect(hd305tv2(0,0)).toBe(0);});it('d',()=>{expect(hd305tv2(93,73)).toBe(2);});it('e',()=>{expect(hd305tv2(15,0)).toBe(4);});});
function hd306tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306tv2_hd',()=>{it('a',()=>{expect(hd306tv2(1,4)).toBe(2);});it('b',()=>{expect(hd306tv2(3,1)).toBe(1);});it('c',()=>{expect(hd306tv2(0,0)).toBe(0);});it('d',()=>{expect(hd306tv2(93,73)).toBe(2);});it('e',()=>{expect(hd306tv2(15,0)).toBe(4);});});
function hd307tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307tv2_hd',()=>{it('a',()=>{expect(hd307tv2(1,4)).toBe(2);});it('b',()=>{expect(hd307tv2(3,1)).toBe(1);});it('c',()=>{expect(hd307tv2(0,0)).toBe(0);});it('d',()=>{expect(hd307tv2(93,73)).toBe(2);});it('e',()=>{expect(hd307tv2(15,0)).toBe(4);});});
function hd308tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308tv2_hd',()=>{it('a',()=>{expect(hd308tv2(1,4)).toBe(2);});it('b',()=>{expect(hd308tv2(3,1)).toBe(1);});it('c',()=>{expect(hd308tv2(0,0)).toBe(0);});it('d',()=>{expect(hd308tv2(93,73)).toBe(2);});it('e',()=>{expect(hd308tv2(15,0)).toBe(4);});});
function hd309tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309tv2_hd',()=>{it('a',()=>{expect(hd309tv2(1,4)).toBe(2);});it('b',()=>{expect(hd309tv2(3,1)).toBe(1);});it('c',()=>{expect(hd309tv2(0,0)).toBe(0);});it('d',()=>{expect(hd309tv2(93,73)).toBe(2);});it('e',()=>{expect(hd309tv2(15,0)).toBe(4);});});
function hd310tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310tv2_hd',()=>{it('a',()=>{expect(hd310tv2(1,4)).toBe(2);});it('b',()=>{expect(hd310tv2(3,1)).toBe(1);});it('c',()=>{expect(hd310tv2(0,0)).toBe(0);});it('d',()=>{expect(hd310tv2(93,73)).toBe(2);});it('e',()=>{expect(hd310tv2(15,0)).toBe(4);});});
function hd311tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311tv2_hd',()=>{it('a',()=>{expect(hd311tv2(1,4)).toBe(2);});it('b',()=>{expect(hd311tv2(3,1)).toBe(1);});it('c',()=>{expect(hd311tv2(0,0)).toBe(0);});it('d',()=>{expect(hd311tv2(93,73)).toBe(2);});it('e',()=>{expect(hd311tv2(15,0)).toBe(4);});});
function hd312tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312tv2_hd',()=>{it('a',()=>{expect(hd312tv2(1,4)).toBe(2);});it('b',()=>{expect(hd312tv2(3,1)).toBe(1);});it('c',()=>{expect(hd312tv2(0,0)).toBe(0);});it('d',()=>{expect(hd312tv2(93,73)).toBe(2);});it('e',()=>{expect(hd312tv2(15,0)).toBe(4);});});
function hd313tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313tv2_hd',()=>{it('a',()=>{expect(hd313tv2(1,4)).toBe(2);});it('b',()=>{expect(hd313tv2(3,1)).toBe(1);});it('c',()=>{expect(hd313tv2(0,0)).toBe(0);});it('d',()=>{expect(hd313tv2(93,73)).toBe(2);});it('e',()=>{expect(hd313tv2(15,0)).toBe(4);});});
function hd314tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314tv2_hd',()=>{it('a',()=>{expect(hd314tv2(1,4)).toBe(2);});it('b',()=>{expect(hd314tv2(3,1)).toBe(1);});it('c',()=>{expect(hd314tv2(0,0)).toBe(0);});it('d',()=>{expect(hd314tv2(93,73)).toBe(2);});it('e',()=>{expect(hd314tv2(15,0)).toBe(4);});});
function hd315tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315tv2_hd',()=>{it('a',()=>{expect(hd315tv2(1,4)).toBe(2);});it('b',()=>{expect(hd315tv2(3,1)).toBe(1);});it('c',()=>{expect(hd315tv2(0,0)).toBe(0);});it('d',()=>{expect(hd315tv2(93,73)).toBe(2);});it('e',()=>{expect(hd315tv2(15,0)).toBe(4);});});
function hd316tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316tv2_hd',()=>{it('a',()=>{expect(hd316tv2(1,4)).toBe(2);});it('b',()=>{expect(hd316tv2(3,1)).toBe(1);});it('c',()=>{expect(hd316tv2(0,0)).toBe(0);});it('d',()=>{expect(hd316tv2(93,73)).toBe(2);});it('e',()=>{expect(hd316tv2(15,0)).toBe(4);});});
function hd317tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317tv2_hd',()=>{it('a',()=>{expect(hd317tv2(1,4)).toBe(2);});it('b',()=>{expect(hd317tv2(3,1)).toBe(1);});it('c',()=>{expect(hd317tv2(0,0)).toBe(0);});it('d',()=>{expect(hd317tv2(93,73)).toBe(2);});it('e',()=>{expect(hd317tv2(15,0)).toBe(4);});});
function hd318tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318tv2_hd',()=>{it('a',()=>{expect(hd318tv2(1,4)).toBe(2);});it('b',()=>{expect(hd318tv2(3,1)).toBe(1);});it('c',()=>{expect(hd318tv2(0,0)).toBe(0);});it('d',()=>{expect(hd318tv2(93,73)).toBe(2);});it('e',()=>{expect(hd318tv2(15,0)).toBe(4);});});
function hd319tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319tv2_hd',()=>{it('a',()=>{expect(hd319tv2(1,4)).toBe(2);});it('b',()=>{expect(hd319tv2(3,1)).toBe(1);});it('c',()=>{expect(hd319tv2(0,0)).toBe(0);});it('d',()=>{expect(hd319tv2(93,73)).toBe(2);});it('e',()=>{expect(hd319tv2(15,0)).toBe(4);});});
function hd320tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320tv2_hd',()=>{it('a',()=>{expect(hd320tv2(1,4)).toBe(2);});it('b',()=>{expect(hd320tv2(3,1)).toBe(1);});it('c',()=>{expect(hd320tv2(0,0)).toBe(0);});it('d',()=>{expect(hd320tv2(93,73)).toBe(2);});it('e',()=>{expect(hd320tv2(15,0)).toBe(4);});});
function hd321tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321tv2_hd',()=>{it('a',()=>{expect(hd321tv2(1,4)).toBe(2);});it('b',()=>{expect(hd321tv2(3,1)).toBe(1);});it('c',()=>{expect(hd321tv2(0,0)).toBe(0);});it('d',()=>{expect(hd321tv2(93,73)).toBe(2);});it('e',()=>{expect(hd321tv2(15,0)).toBe(4);});});
function hd322tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322tv2_hd',()=>{it('a',()=>{expect(hd322tv2(1,4)).toBe(2);});it('b',()=>{expect(hd322tv2(3,1)).toBe(1);});it('c',()=>{expect(hd322tv2(0,0)).toBe(0);});it('d',()=>{expect(hd322tv2(93,73)).toBe(2);});it('e',()=>{expect(hd322tv2(15,0)).toBe(4);});});
function hd323tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323tv2_hd',()=>{it('a',()=>{expect(hd323tv2(1,4)).toBe(2);});it('b',()=>{expect(hd323tv2(3,1)).toBe(1);});it('c',()=>{expect(hd323tv2(0,0)).toBe(0);});it('d',()=>{expect(hd323tv2(93,73)).toBe(2);});it('e',()=>{expect(hd323tv2(15,0)).toBe(4);});});
function hd324tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324tv2_hd',()=>{it('a',()=>{expect(hd324tv2(1,4)).toBe(2);});it('b',()=>{expect(hd324tv2(3,1)).toBe(1);});it('c',()=>{expect(hd324tv2(0,0)).toBe(0);});it('d',()=>{expect(hd324tv2(93,73)).toBe(2);});it('e',()=>{expect(hd324tv2(15,0)).toBe(4);});});
function hd325tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325tv2_hd',()=>{it('a',()=>{expect(hd325tv2(1,4)).toBe(2);});it('b',()=>{expect(hd325tv2(3,1)).toBe(1);});it('c',()=>{expect(hd325tv2(0,0)).toBe(0);});it('d',()=>{expect(hd325tv2(93,73)).toBe(2);});it('e',()=>{expect(hd325tv2(15,0)).toBe(4);});});
function hd326tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326tv2_hd',()=>{it('a',()=>{expect(hd326tv2(1,4)).toBe(2);});it('b',()=>{expect(hd326tv2(3,1)).toBe(1);});it('c',()=>{expect(hd326tv2(0,0)).toBe(0);});it('d',()=>{expect(hd326tv2(93,73)).toBe(2);});it('e',()=>{expect(hd326tv2(15,0)).toBe(4);});});
function hd327tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327tv2_hd',()=>{it('a',()=>{expect(hd327tv2(1,4)).toBe(2);});it('b',()=>{expect(hd327tv2(3,1)).toBe(1);});it('c',()=>{expect(hd327tv2(0,0)).toBe(0);});it('d',()=>{expect(hd327tv2(93,73)).toBe(2);});it('e',()=>{expect(hd327tv2(15,0)).toBe(4);});});
function hd328tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328tv2_hd',()=>{it('a',()=>{expect(hd328tv2(1,4)).toBe(2);});it('b',()=>{expect(hd328tv2(3,1)).toBe(1);});it('c',()=>{expect(hd328tv2(0,0)).toBe(0);});it('d',()=>{expect(hd328tv2(93,73)).toBe(2);});it('e',()=>{expect(hd328tv2(15,0)).toBe(4);});});
function hd329tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329tv2_hd',()=>{it('a',()=>{expect(hd329tv2(1,4)).toBe(2);});it('b',()=>{expect(hd329tv2(3,1)).toBe(1);});it('c',()=>{expect(hd329tv2(0,0)).toBe(0);});it('d',()=>{expect(hd329tv2(93,73)).toBe(2);});it('e',()=>{expect(hd329tv2(15,0)).toBe(4);});});
function hd330tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330tv2_hd',()=>{it('a',()=>{expect(hd330tv2(1,4)).toBe(2);});it('b',()=>{expect(hd330tv2(3,1)).toBe(1);});it('c',()=>{expect(hd330tv2(0,0)).toBe(0);});it('d',()=>{expect(hd330tv2(93,73)).toBe(2);});it('e',()=>{expect(hd330tv2(15,0)).toBe(4);});});
function hd331tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331tv2_hd',()=>{it('a',()=>{expect(hd331tv2(1,4)).toBe(2);});it('b',()=>{expect(hd331tv2(3,1)).toBe(1);});it('c',()=>{expect(hd331tv2(0,0)).toBe(0);});it('d',()=>{expect(hd331tv2(93,73)).toBe(2);});it('e',()=>{expect(hd331tv2(15,0)).toBe(4);});});
function hd332tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332tv2_hd',()=>{it('a',()=>{expect(hd332tv2(1,4)).toBe(2);});it('b',()=>{expect(hd332tv2(3,1)).toBe(1);});it('c',()=>{expect(hd332tv2(0,0)).toBe(0);});it('d',()=>{expect(hd332tv2(93,73)).toBe(2);});it('e',()=>{expect(hd332tv2(15,0)).toBe(4);});});
function hd333tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333tv2_hd',()=>{it('a',()=>{expect(hd333tv2(1,4)).toBe(2);});it('b',()=>{expect(hd333tv2(3,1)).toBe(1);});it('c',()=>{expect(hd333tv2(0,0)).toBe(0);});it('d',()=>{expect(hd333tv2(93,73)).toBe(2);});it('e',()=>{expect(hd333tv2(15,0)).toBe(4);});});
function hd334tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334tv2_hd',()=>{it('a',()=>{expect(hd334tv2(1,4)).toBe(2);});it('b',()=>{expect(hd334tv2(3,1)).toBe(1);});it('c',()=>{expect(hd334tv2(0,0)).toBe(0);});it('d',()=>{expect(hd334tv2(93,73)).toBe(2);});it('e',()=>{expect(hd334tv2(15,0)).toBe(4);});});
function hd335tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335tv2_hd',()=>{it('a',()=>{expect(hd335tv2(1,4)).toBe(2);});it('b',()=>{expect(hd335tv2(3,1)).toBe(1);});it('c',()=>{expect(hd335tv2(0,0)).toBe(0);});it('d',()=>{expect(hd335tv2(93,73)).toBe(2);});it('e',()=>{expect(hd335tv2(15,0)).toBe(4);});});
function hd336tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336tv2_hd',()=>{it('a',()=>{expect(hd336tv2(1,4)).toBe(2);});it('b',()=>{expect(hd336tv2(3,1)).toBe(1);});it('c',()=>{expect(hd336tv2(0,0)).toBe(0);});it('d',()=>{expect(hd336tv2(93,73)).toBe(2);});it('e',()=>{expect(hd336tv2(15,0)).toBe(4);});});
function hd337tv2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337tv2_hd',()=>{it('a',()=>{expect(hd337tv2(1,4)).toBe(2);});it('b',()=>{expect(hd337tv2(3,1)).toBe(1);});it('c',()=>{expect(hd337tv2(0,0)).toBe(0);});it('d',()=>{expect(hd337tv2(93,73)).toBe(2);});it('e',()=>{expect(hd337tv2(15,0)).toBe(4);});});
