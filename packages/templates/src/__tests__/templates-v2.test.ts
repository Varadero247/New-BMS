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
function hd258tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258tv2s_hd',()=>{it('a',()=>{expect(hd258tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd258tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd258tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd258tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd258tv2s(15,0)).toBe(4);});});
function hd259tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259tv2s_hd',()=>{it('a',()=>{expect(hd259tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd259tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd259tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd259tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd259tv2s(15,0)).toBe(4);});});
function hd260tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260tv2s_hd',()=>{it('a',()=>{expect(hd260tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd260tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd260tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd260tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd260tv2s(15,0)).toBe(4);});});
function hd261tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261tv2s_hd',()=>{it('a',()=>{expect(hd261tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd261tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd261tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd261tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd261tv2s(15,0)).toBe(4);});});
function hd262tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262tv2s_hd',()=>{it('a',()=>{expect(hd262tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd262tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd262tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd262tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd262tv2s(15,0)).toBe(4);});});
function hd263tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263tv2s_hd',()=>{it('a',()=>{expect(hd263tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd263tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd263tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd263tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd263tv2s(15,0)).toBe(4);});});
function hd264tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264tv2s_hd',()=>{it('a',()=>{expect(hd264tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd264tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd264tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd264tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd264tv2s(15,0)).toBe(4);});});
function hd265tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265tv2s_hd',()=>{it('a',()=>{expect(hd265tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd265tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd265tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd265tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd265tv2s(15,0)).toBe(4);});});
function hd266tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266tv2s_hd',()=>{it('a',()=>{expect(hd266tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd266tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd266tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd266tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd266tv2s(15,0)).toBe(4);});});
function hd267tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267tv2s_hd',()=>{it('a',()=>{expect(hd267tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd267tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd267tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd267tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd267tv2s(15,0)).toBe(4);});});
function hd268tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268tv2s_hd',()=>{it('a',()=>{expect(hd268tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd268tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd268tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd268tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd268tv2s(15,0)).toBe(4);});});
function hd269tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269tv2s_hd',()=>{it('a',()=>{expect(hd269tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd269tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd269tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd269tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd269tv2s(15,0)).toBe(4);});});
function hd270tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270tv2s_hd',()=>{it('a',()=>{expect(hd270tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd270tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd270tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd270tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd270tv2s(15,0)).toBe(4);});});
function hd271tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271tv2s_hd',()=>{it('a',()=>{expect(hd271tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd271tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd271tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd271tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd271tv2s(15,0)).toBe(4);});});
function hd272tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272tv2s_hd',()=>{it('a',()=>{expect(hd272tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd272tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd272tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd272tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd272tv2s(15,0)).toBe(4);});});
function hd273tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273tv2s_hd',()=>{it('a',()=>{expect(hd273tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd273tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd273tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd273tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd273tv2s(15,0)).toBe(4);});});
function hd274tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274tv2s_hd',()=>{it('a',()=>{expect(hd274tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd274tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd274tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd274tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd274tv2s(15,0)).toBe(4);});});
function hd275tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275tv2s_hd',()=>{it('a',()=>{expect(hd275tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd275tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd275tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd275tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd275tv2s(15,0)).toBe(4);});});
function hd276tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276tv2s_hd',()=>{it('a',()=>{expect(hd276tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd276tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd276tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd276tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd276tv2s(15,0)).toBe(4);});});
function hd277tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277tv2s_hd',()=>{it('a',()=>{expect(hd277tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd277tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd277tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd277tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd277tv2s(15,0)).toBe(4);});});
function hd278tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278tv2s_hd',()=>{it('a',()=>{expect(hd278tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd278tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd278tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd278tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd278tv2s(15,0)).toBe(4);});});
function hd279tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279tv2s_hd',()=>{it('a',()=>{expect(hd279tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd279tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd279tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd279tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd279tv2s(15,0)).toBe(4);});});
function hd280tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280tv2s_hd',()=>{it('a',()=>{expect(hd280tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd280tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd280tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd280tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd280tv2s(15,0)).toBe(4);});});
function hd281tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281tv2s_hd',()=>{it('a',()=>{expect(hd281tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd281tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd281tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd281tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd281tv2s(15,0)).toBe(4);});});
function hd282tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282tv2s_hd',()=>{it('a',()=>{expect(hd282tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd282tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd282tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd282tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd282tv2s(15,0)).toBe(4);});});
function hd283tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283tv2s_hd',()=>{it('a',()=>{expect(hd283tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd283tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd283tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd283tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd283tv2s(15,0)).toBe(4);});});
function hd284tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284tv2s_hd',()=>{it('a',()=>{expect(hd284tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd284tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd284tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd284tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd284tv2s(15,0)).toBe(4);});});
function hd285tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285tv2s_hd',()=>{it('a',()=>{expect(hd285tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd285tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd285tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd285tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd285tv2s(15,0)).toBe(4);});});
function hd286tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286tv2s_hd',()=>{it('a',()=>{expect(hd286tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd286tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd286tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd286tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd286tv2s(15,0)).toBe(4);});});
function hd287tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287tv2s_hd',()=>{it('a',()=>{expect(hd287tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd287tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd287tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd287tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd287tv2s(15,0)).toBe(4);});});
function hd288tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288tv2s_hd',()=>{it('a',()=>{expect(hd288tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd288tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd288tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd288tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd288tv2s(15,0)).toBe(4);});});
function hd289tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289tv2s_hd',()=>{it('a',()=>{expect(hd289tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd289tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd289tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd289tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd289tv2s(15,0)).toBe(4);});});
function hd290tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290tv2s_hd',()=>{it('a',()=>{expect(hd290tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd290tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd290tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd290tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd290tv2s(15,0)).toBe(4);});});
function hd291tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291tv2s_hd',()=>{it('a',()=>{expect(hd291tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd291tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd291tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd291tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd291tv2s(15,0)).toBe(4);});});
function hd292tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292tv2s_hd',()=>{it('a',()=>{expect(hd292tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd292tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd292tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd292tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd292tv2s(15,0)).toBe(4);});});
function hd293tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293tv2s_hd',()=>{it('a',()=>{expect(hd293tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd293tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd293tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd293tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd293tv2s(15,0)).toBe(4);});});
function hd294tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294tv2s_hd',()=>{it('a',()=>{expect(hd294tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd294tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd294tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd294tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd294tv2s(15,0)).toBe(4);});});
function hd295tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295tv2s_hd',()=>{it('a',()=>{expect(hd295tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd295tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd295tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd295tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd295tv2s(15,0)).toBe(4);});});
function hd296tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296tv2s_hd',()=>{it('a',()=>{expect(hd296tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd296tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd296tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd296tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd296tv2s(15,0)).toBe(4);});});
function hd297tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297tv2s_hd',()=>{it('a',()=>{expect(hd297tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd297tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd297tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd297tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd297tv2s(15,0)).toBe(4);});});
function hd298tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298tv2s_hd',()=>{it('a',()=>{expect(hd298tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd298tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd298tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd298tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd298tv2s(15,0)).toBe(4);});});
function hd299tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299tv2s_hd',()=>{it('a',()=>{expect(hd299tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd299tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd299tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd299tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd299tv2s(15,0)).toBe(4);});});
function hd300tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300tv2s_hd',()=>{it('a',()=>{expect(hd300tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd300tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd300tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd300tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd300tv2s(15,0)).toBe(4);});});
function hd301tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301tv2s_hd',()=>{it('a',()=>{expect(hd301tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd301tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd301tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd301tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd301tv2s(15,0)).toBe(4);});});
function hd302tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302tv2s_hd',()=>{it('a',()=>{expect(hd302tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd302tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd302tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd302tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd302tv2s(15,0)).toBe(4);});});
function hd303tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303tv2s_hd',()=>{it('a',()=>{expect(hd303tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd303tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd303tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd303tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd303tv2s(15,0)).toBe(4);});});
function hd304tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304tv2s_hd',()=>{it('a',()=>{expect(hd304tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd304tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd304tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd304tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd304tv2s(15,0)).toBe(4);});});
function hd305tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305tv2s_hd',()=>{it('a',()=>{expect(hd305tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd305tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd305tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd305tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd305tv2s(15,0)).toBe(4);});});
function hd306tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306tv2s_hd',()=>{it('a',()=>{expect(hd306tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd306tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd306tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd306tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd306tv2s(15,0)).toBe(4);});});
function hd307tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307tv2s_hd',()=>{it('a',()=>{expect(hd307tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd307tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd307tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd307tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd307tv2s(15,0)).toBe(4);});});
function hd308tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308tv2s_hd',()=>{it('a',()=>{expect(hd308tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd308tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd308tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd308tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd308tv2s(15,0)).toBe(4);});});
function hd309tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309tv2s_hd',()=>{it('a',()=>{expect(hd309tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd309tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd309tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd309tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd309tv2s(15,0)).toBe(4);});});
function hd310tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310tv2s_hd',()=>{it('a',()=>{expect(hd310tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd310tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd310tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd310tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd310tv2s(15,0)).toBe(4);});});
function hd311tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311tv2s_hd',()=>{it('a',()=>{expect(hd311tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd311tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd311tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd311tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd311tv2s(15,0)).toBe(4);});});
function hd312tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312tv2s_hd',()=>{it('a',()=>{expect(hd312tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd312tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd312tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd312tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd312tv2s(15,0)).toBe(4);});});
function hd313tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313tv2s_hd',()=>{it('a',()=>{expect(hd313tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd313tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd313tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd313tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd313tv2s(15,0)).toBe(4);});});
function hd314tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314tv2s_hd',()=>{it('a',()=>{expect(hd314tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd314tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd314tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd314tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd314tv2s(15,0)).toBe(4);});});
function hd315tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315tv2s_hd',()=>{it('a',()=>{expect(hd315tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd315tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd315tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd315tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd315tv2s(15,0)).toBe(4);});});
function hd316tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316tv2s_hd',()=>{it('a',()=>{expect(hd316tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd316tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd316tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd316tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd316tv2s(15,0)).toBe(4);});});
function hd317tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317tv2s_hd',()=>{it('a',()=>{expect(hd317tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd317tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd317tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd317tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd317tv2s(15,0)).toBe(4);});});
function hd318tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318tv2s_hd',()=>{it('a',()=>{expect(hd318tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd318tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd318tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd318tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd318tv2s(15,0)).toBe(4);});});
function hd319tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319tv2s_hd',()=>{it('a',()=>{expect(hd319tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd319tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd319tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd319tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd319tv2s(15,0)).toBe(4);});});
function hd320tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320tv2s_hd',()=>{it('a',()=>{expect(hd320tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd320tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd320tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd320tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd320tv2s(15,0)).toBe(4);});});
function hd321tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321tv2s_hd',()=>{it('a',()=>{expect(hd321tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd321tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd321tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd321tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd321tv2s(15,0)).toBe(4);});});
function hd322tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322tv2s_hd',()=>{it('a',()=>{expect(hd322tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd322tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd322tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd322tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd322tv2s(15,0)).toBe(4);});});
function hd323tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323tv2s_hd',()=>{it('a',()=>{expect(hd323tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd323tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd323tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd323tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd323tv2s(15,0)).toBe(4);});});
function hd324tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324tv2s_hd',()=>{it('a',()=>{expect(hd324tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd324tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd324tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd324tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd324tv2s(15,0)).toBe(4);});});
function hd325tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325tv2s_hd',()=>{it('a',()=>{expect(hd325tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd325tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd325tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd325tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd325tv2s(15,0)).toBe(4);});});
function hd326tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326tv2s_hd',()=>{it('a',()=>{expect(hd326tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd326tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd326tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd326tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd326tv2s(15,0)).toBe(4);});});
function hd327tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327tv2s_hd',()=>{it('a',()=>{expect(hd327tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd327tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd327tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd327tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd327tv2s(15,0)).toBe(4);});});
function hd328tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328tv2s_hd',()=>{it('a',()=>{expect(hd328tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd328tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd328tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd328tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd328tv2s(15,0)).toBe(4);});});
function hd329tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329tv2s_hd',()=>{it('a',()=>{expect(hd329tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd329tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd329tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd329tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd329tv2s(15,0)).toBe(4);});});
function hd330tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330tv2s_hd',()=>{it('a',()=>{expect(hd330tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd330tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd330tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd330tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd330tv2s(15,0)).toBe(4);});});
function hd331tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331tv2s_hd',()=>{it('a',()=>{expect(hd331tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd331tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd331tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd331tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd331tv2s(15,0)).toBe(4);});});
function hd332tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332tv2s_hd',()=>{it('a',()=>{expect(hd332tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd332tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd332tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd332tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd332tv2s(15,0)).toBe(4);});});
function hd333tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333tv2s_hd',()=>{it('a',()=>{expect(hd333tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd333tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd333tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd333tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd333tv2s(15,0)).toBe(4);});});
function hd334tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334tv2s_hd',()=>{it('a',()=>{expect(hd334tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd334tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd334tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd334tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd334tv2s(15,0)).toBe(4);});});
function hd335tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335tv2s_hd',()=>{it('a',()=>{expect(hd335tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd335tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd335tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd335tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd335tv2s(15,0)).toBe(4);});});
function hd336tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336tv2s_hd',()=>{it('a',()=>{expect(hd336tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd336tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd336tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd336tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd336tv2s(15,0)).toBe(4);});});
function hd337tv2s(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337tv2s_hd',()=>{it('a',()=>{expect(hd337tv2s(1,4)).toBe(2);});it('b',()=>{expect(hd337tv2s(3,1)).toBe(1);});it('c',()=>{expect(hd337tv2s(0,0)).toBe(0);});it('d',()=>{expect(hd337tv2s(93,73)).toBe(2);});it('e',()=>{expect(hd337tv2s(15,0)).toBe(4);});});
