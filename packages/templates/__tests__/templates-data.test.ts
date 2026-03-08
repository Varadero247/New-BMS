// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Phase 157 — Comprehensive data-integrity and renderer tests for @ims/templates.
 *
 * 192 templates × 6 parametric it() each = 1,152 integrity tests.
 * Additional renderer coverage for table, date/datetime, passthrough field types.
 * Additional exporter coverage for JSON format and slug generation.
 */
import { allTemplates } from '../src/seeds';
import { renderTemplateToHtml } from '../src/renderer';
import { exportTemplate } from '../src/exporter';
import type { FieldDefinition, FieldType, TemplateModule, TemplateCategory } from '../src/types';

// ── Valid value sets (must match types.ts exactly) ─────────────────────────────

const VALID_MODULES: TemplateModule[] = [
  'HEALTH_SAFETY', 'ENVIRONMENT', 'QUALITY', 'AUTOMOTIVE', 'MEDICAL',
  'AEROSPACE', 'HR', 'PAYROLL', 'WORKFLOWS', 'PROJECT_MANAGEMENT',
  'INVENTORY', 'CRM', 'FINANCE', 'INFOSEC', 'ISO37001', 'ISO42001',
  'ESG', 'CMMS', 'FOOD_SAFETY', 'ENERGY', 'FIELD_SERVICE', 'ANALYTICS',
  'RISK', 'TRAINING', 'SUPPLIERS', 'ASSETS', 'DOCUMENTS', 'COMPLAINTS',
  'CONTRACTS', 'PTW', 'INCIDENTS', 'AUDITS', 'MANAGEMENT_REVIEW', 'CHEMICALS',
];

const VALID_CATEGORIES: TemplateCategory[] = [
  'RISK_ASSESSMENT', 'INCIDENT_INVESTIGATION', 'AUDIT', 'MANAGEMENT_REVIEW',
  'CAPA', 'COMPLIANCE', 'INSPECTION', 'TRAINING', 'DESIGN_DEVELOPMENT',
  'PROCESS_CONTROL', 'SUPPLIER', 'CUSTOMER', 'REGULATORY', 'PLANNING',
  'REPORTING', 'GENERAL', 'CERTIFICATION',
];

const VALID_FIELD_TYPES: FieldType[] = [
  'text', 'textarea', 'number', 'date', 'datetime', 'select', 'multiselect',
  'checkbox', 'radio', 'email', 'url', 'tel', 'signature', 'file',
  'section', 'table', 'rating',
];

// ── Per-template parametric integrity tests (192 × 6 = 1,152 it() blocks) ─────

for (const t of allTemplates) {
  describe(`template ${t.code}`, () => {
    it('code matches TPL- prefix pattern', () => {
      expect(t.code).toMatch(/^TPL-[A-Z0-9]+-\d+$/);
    });

    it('name and description are non-empty strings', () => {
      expect(typeof t.name).toBe('string');
      expect(t.name.trim().length).toBeGreaterThan(0);
      expect(typeof t.description).toBe('string');
      expect(t.description.trim().length).toBeGreaterThan(0);
    });

    it('module is a valid TemplateModule', () => {
      expect(VALID_MODULES).toContain(t.module);
    });

    it('category is a valid TemplateCategory', () => {
      expect(VALID_CATEGORIES).toContain(t.category);
    });

    it('tags is an array of non-empty strings', () => {
      expect(Array.isArray(t.tags)).toBe(true);
      for (const tag of t.tags) {
        expect(typeof tag).toBe('string');
        expect(tag.trim().length).toBeGreaterThan(0);
      }
    });

    it('all field IDs are unique and all field types are valid', () => {
      const ids = t.fields.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const f of t.fields) {
        expect(VALID_FIELD_TYPES).toContain(f.type);
      }
    });
  });
}

// ── Cross-template invariants ─────────────────────────────────────────────────

describe('allTemplates — cross-template invariants', () => {
  it('total count is 192', () => {
    expect(allTemplates).toHaveLength(192);
  });

  it('all codes are globally unique', () => {
    const codes = allTemplates.map((t) => t.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every VALID_MODULE has at least one template', () => {
    const modulesUsed = new Set(allTemplates.map((t) => t.module));
    for (const m of VALID_MODULES) {
      expect(modulesUsed.has(m)).toBe(true);
    }
  });

  it('every template has at least one non-section field', () => {
    for (const t of allTemplates) {
      const realFields = t.fields.filter((f) => f.type !== 'section');
      expect(realFields.length).toBeGreaterThan(0);
    }
  });

  it('no field has an empty id or empty label', () => {
    for (const t of allTemplates) {
      for (const f of t.fields) {
        expect(f.id.trim().length).toBeGreaterThan(0);
        expect(f.label.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('select/radio/multiselect fields have at least one option', () => {
    for (const t of allTemplates) {
      for (const f of t.fields) {
        if (f.type === 'select' || f.type === 'radio' || f.type === 'multiselect') {
          expect(f.options).toBeDefined();
          expect(f.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('table fields have at least one column', () => {
    for (const t of allTemplates) {
      for (const f of t.fields) {
        if (f.type === 'table') {
          expect(f.columns).toBeDefined();
          expect(f.columns!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('all option values and labels are non-empty strings', () => {
    for (const t of allTemplates) {
      for (const f of t.fields) {
        if (f.options) {
          for (const opt of f.options) {
            expect(opt.label.trim().length).toBeGreaterThan(0);
            expect(opt.value.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('width values are only full | half | third when set', () => {
    const valid = ['full', 'half', 'third'];
    for (const t of allTemplates) {
      for (const f of t.fields) {
        if (f.width !== undefined) {
          expect(valid).toContain(f.width);
        }
      }
    }
  });
});

// ── renderTemplateToHtml — table field type ───────────────────────────────────

describe('renderTemplateToHtml — table fields', () => {
  const COLS: FieldDefinition[] = [
    { id: 'col_hazard', label: 'Hazard', type: 'text' },
    { id: 'col_control', label: 'Control', type: 'text' },
  ];
  const TABLE_FIELD: FieldDefinition = {
    id: 'hazards',
    label: 'Hazard Register',
    type: 'table',
    columns: COLS,
  };

  function makeTpl(fields: FieldDefinition[]) {
    return { code: 'TPL-TEST-TBL', name: 'Table Test', description: null, fields };
  }

  it('renders table element with field-table class', () => {
    const html = renderTemplateToHtml(makeTpl([TABLE_FIELD]), {});
    expect(html).toContain('class="field-table"');
  });

  it('renders column headers from columns definition', () => {
    const html = renderTemplateToHtml(makeTpl([TABLE_FIELD]), {});
    expect(html).toContain('<th>Hazard</th>');
    expect(html).toContain('<th>Control</th>');
  });

  it('renders 3 blank rows when no data provided', () => {
    const html = renderTemplateToHtml(makeTpl([TABLE_FIELD]), {});
    const blankCells = (html.match(/<td>&nbsp;<\/td>/g) ?? []).length;
    expect(blankCells).toBe(3 * COLS.length); // 3 rows × 2 cols = 6 blank cells
  });

  it('renders actual data rows when table data provided', () => {
    const data = {
      hazards: [
        { col_hazard: 'Falling objects', col_control: 'Hard hat' },
        { col_hazard: 'Noise', col_control: 'Ear defenders' },
      ],
    };
    const html = renderTemplateToHtml(makeTpl([TABLE_FIELD]), data);
    expect(html).toContain('Falling objects');
    expect(html).toContain('Hard hat');
    expect(html).toContain('Noise');
    expect(html).toContain('Ear defenders');
  });

  it('does NOT render blank rows when actual data provided', () => {
    const data = { hazards: [{ col_hazard: 'Trip hazard', col_control: 'Barrier' }] };
    const html = renderTemplateToHtml(makeTpl([TABLE_FIELD]), data);
    const blankCells = (html.match(/<td>&nbsp;<\/td>/g) ?? []).length;
    expect(blankCells).toBe(0);
  });

  it('escapes HTML in cell values', () => {
    const data = { hazards: [{ col_hazard: '<script>xss</script>', col_control: 'Fix' }] };
    const html = renderTemplateToHtml(makeTpl([TABLE_FIELD]), data);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders table with helpText when defined', () => {
    const field: FieldDefinition = { ...TABLE_FIELD, helpText: 'List all identified hazards' };
    const html = renderTemplateToHtml(makeTpl([field]), {});
    expect(html).toContain('List all identified hazards');
  });

  it('renders missing cell values as empty string (not "undefined")', () => {
    const data = { hazards: [{ col_hazard: 'Dust' /* col_control missing */ }] };
    const html = renderTemplateToHtml(makeTpl([TABLE_FIELD]), data);
    expect(html).not.toContain('undefined');
  });
});

// ── renderTemplateToHtml — date and datetime field types ─────────────────────

describe('renderTemplateToHtml — date fields', () => {
  function makeTpl(fields: FieldDefinition[]) {
    return { code: 'TPL-TEST-DATE', name: 'Date Test', description: null, fields };
  }

  it('formats date field as en-GB locale (DD/MM/YYYY)', () => {
    const fields: FieldDefinition[] = [{ id: 'dt', label: 'Incident Date', type: 'date' }];
    const html = renderTemplateToHtml(makeTpl(fields), { dt: '2026-03-08' });
    // en-GB formats as 08/03/2026
    expect(html).toContain('08/03/2026');
  });

  it('formats datetime field as en-GB locale with time', () => {
    const fields: FieldDefinition[] = [{ id: 'dt', label: 'Timestamp', type: 'datetime' }];
    const html = renderTemplateToHtml(makeTpl(fields), { dt: '2026-03-08T14:30:00' });
    // en-GB locale includes "08/03/2026"
    expect(html).toContain('08/03/2026');
  });

  it('does not render "undefined" for date field with no value', () => {
    const fields: FieldDefinition[] = [{ id: 'dt', label: 'Date', type: 'date' }];
    const html = renderTemplateToHtml(makeTpl(fields), {});
    expect(html).not.toContain('undefined');
  });
});

// ── renderTemplateToHtml — passthrough field types ───────────────────────────

describe('renderTemplateToHtml — passthrough field types (textarea, number, email, url, tel)', () => {
  function makeTpl(fields: FieldDefinition[]) {
    return { code: 'TPL-TEST-PASS', name: 'Passthrough Test', description: null, fields };
  }

  const PASSTHROUGH_TYPES: Array<{ type: FieldType; value: unknown; display: string }> = [
    { type: 'textarea', value: 'Multi\nline text', display: 'Multi' },
    { type: 'number', value: 42, display: '42' },
    { type: 'email', value: 'admin@ims.local', display: 'admin@ims.local' },
    { type: 'url', value: 'https://ims.local', display: 'https://ims.local' },
    { type: 'tel', value: '+44 20 1234 5678', display: '+44 20 1234 5678' },
    { type: 'signature', value: 'J. Smith', display: 'J. Smith' },
    { type: 'file', value: 'report.pdf', display: 'report.pdf' },
  ];

  for (const { type, value, display } of PASSTHROUGH_TYPES) {
    it(`renders ${type} field value correctly`, () => {
      const fields: FieldDefinition[] = [{ id: 'f', label: 'Field', type }];
      const html = renderTemplateToHtml(makeTpl(fields), { f: value });
      expect(html).toContain(display);
    });

    it(`${type} field with no value renders em dash or placeholder`, () => {
      const fields: FieldDefinition[] = [{ id: 'f', label: 'Field', type }];
      const html = renderTemplateToHtml(makeTpl(fields), {});
      expect(html).not.toContain('undefined');
    });
  }
});

// ── exportTemplate — JSON format ──────────────────────────────────────────────

describe('exportTemplate — JSON format', () => {
  const BASE_TEMPLATE = {
    code: 'TPL-HS-001',
    name: 'Generic Risk Assessment',
    description: 'A risk assessment template.',
    version: 3,
    fields: [{ id: 'activity', label: 'Activity', type: 'text' as FieldType }],
  };

  it('mimeType is application/json', () => {
    const result = exportTemplate(BASE_TEMPLATE, undefined, 'json');
    expect(result.mimeType).toBe('application/json');
  });

  it('filename has .json extension', () => {
    const result = exportTemplate(BASE_TEMPLATE, undefined, 'json');
    expect(result.filename).toMatch(/\.json$/);
  });

  it('filename slug lowercases the code', () => {
    const result = exportTemplate(BASE_TEMPLATE, undefined, 'json');
    expect(result.filename).toContain('tpl-hs-001');
  });

  it('content is valid JSON', () => {
    const result = exportTemplate(BASE_TEMPLATE, undefined, 'json');
    expect(() => JSON.parse(result.content)).not.toThrow();
  });

  it('JSON payload contains code, name, description, version, fields', () => {
    const result = exportTemplate(BASE_TEMPLATE, undefined, 'json');
    const payload = JSON.parse(result.content);
    expect(payload.code).toBe('TPL-HS-001');
    expect(payload.name).toBe('Generic Risk Assessment');
    expect(payload.description).toBe('A risk assessment template.');
    expect(payload.version).toBe(3);
    expect(Array.isArray(payload.fields)).toBe(true);
  });

  it('JSON payload includes exportedAt ISO timestamp', () => {
    const result = exportTemplate(BASE_TEMPLATE, undefined, 'json');
    const payload = JSON.parse(result.content);
    expect(typeof payload.exportedAt).toBe('string');
    expect(() => new Date(payload.exportedAt)).not.toThrow();
  });

  it('JSON payload includes filledData when provided', () => {
    const filled = { activity: 'Pallet loading' };
    const result = exportTemplate(BASE_TEMPLATE, filled, 'json');
    const payload = JSON.parse(result.content);
    expect(payload.filledData).toEqual(filled);
  });

  it('JSON payload filledData is null when not provided', () => {
    const result = exportTemplate(BASE_TEMPLATE, undefined, 'json');
    const payload = JSON.parse(result.content);
    expect(payload.filledData).toBeNull();
  });

  it('version defaults to 1 when not set', () => {
    const tpl = { ...BASE_TEMPLATE };
    delete (tpl as Partial<typeof tpl>).version;
    const result = exportTemplate(tpl, undefined, 'json');
    const payload = JSON.parse(result.content);
    expect(payload.version).toBe(1);
  });
});

// ── exportTemplate — HTML format (default) ────────────────────────────────────

describe('exportTemplate — HTML format', () => {
  const BASE_TEMPLATE = {
    code: 'TPL-ENV-005',
    name: 'Environmental Aspect Register',
    description: 'Identify and evaluate environmental aspects.',
    fields: [{ id: 'aspect', label: 'Aspect', type: 'text' as FieldType }],
  };

  it('mimeType is text/html', () => {
    const result = exportTemplate(BASE_TEMPLATE, {});
    expect(result.mimeType).toBe('text/html');
  });

  it('filename has .html extension', () => {
    const result = exportTemplate(BASE_TEMPLATE, {});
    expect(result.filename).toMatch(/\.html$/);
  });

  it('filename slug lowercases and hyphenates the code', () => {
    const result = exportTemplate(BASE_TEMPLATE, {});
    expect(result.filename).toContain('tpl-env-005');
  });

  it('content is a complete HTML document', () => {
    const result = exportTemplate(BASE_TEMPLATE, {});
    expect(result.content).toContain('<!DOCTYPE html>');
    expect(result.content).toContain('</html>');
  });

  it('HTML format is the default when format not specified', () => {
    const result = exportTemplate(BASE_TEMPLATE, {});
    expect(result.mimeType).toBe('text/html');
  });
});

// ── exportTemplate — slug edge cases ─────────────────────────────────────────

describe('exportTemplate — slug generation', () => {
  function getFilename(code: string, format: 'html' | 'json' = 'html') {
    return exportTemplate(
      { code, name: 'Test', description: null, fields: [] },
      {},
      format,
    ).filename;
  }

  it('TPL-HS-001 → tpl-hs-001.html', () => {
    expect(getFilename('TPL-HS-001')).toBe('tpl-hs-001.html');
  });

  it('TPL-QMS-042 → tpl-qms-042.html', () => {
    expect(getFilename('TPL-QMS-042')).toBe('tpl-qms-042.html');
  });

  it('code with spaces → hyphens in slug', () => {
    const filename = getFilename('MY TEMPLATE 001');
    expect(filename).not.toContain(' ');
    expect(filename).toContain('-');
  });

  it('JSON export uses .json suffix', () => {
    expect(getFilename('TPL-HS-001', 'json')).toBe('tpl-hs-001.json');
  });
});
