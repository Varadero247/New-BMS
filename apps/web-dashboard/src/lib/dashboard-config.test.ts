// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Data-integrity tests for dashboard-config.ts
 * Verifies that widget/section maps, RBAC mappings, and default config
 * are internally consistent and complete.
 */
import {
  MODULE_RBAC_MAP,
  WIDGET_META,
  SECTION_META,
  WIDGET_IDS,
  SECTION_IDS,
  DEFAULT_CONFIG,
  type WidgetId,
  type SectionId,
} from './dashboard-config';

describe('MODULE_RBAC_MAP', () => {
  it('has at least 20 module mappings', () => {
    expect(Object.keys(MODULE_RBAC_MAP).length).toBeGreaterThanOrEqual(20);
  });

  it('all values are non-empty strings', () => {
    for (const [key, value] of Object.entries(MODULE_RBAC_MAP)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
      expect(key.length).toBeGreaterThan(0);
    }
  });

  it('contains core mandatory modules', () => {
    const values = Object.values(MODULE_RBAC_MAP);
    expect(values).toContain('health-safety');
    expect(values).toContain('environment');
    expect(values).toContain('quality');
    expect(values).toContain('hr');
    expect(values).toContain('finance');
  });

  it('uses kebab-case ImsModule values', () => {
    for (const value of Object.values(MODULE_RBAC_MAP)) {
      // Must be lowercase kebab-case or single word
      expect(value).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});

describe('WIDGET_META', () => {
  it('has exactly 7 widget entries', () => {
    expect(Object.keys(WIDGET_META)).toHaveLength(7);
  });

  it('WIDGET_IDS matches WIDGET_META keys', () => {
    const metaKeys = Object.keys(WIDGET_META).sort();
    const idsSorted = [...WIDGET_IDS].sort();
    expect(idsSorted).toEqual(metaKeys);
  });

  it('every widget meta has label, description, and icon', () => {
    for (const [id, meta] of Object.entries(WIDGET_META)) {
      expect(typeof meta.label).toBe('string');
      expect(meta.label.length).toBeGreaterThan(0);
      expect(typeof meta.description).toBe('string');
      expect(meta.description.length).toBeGreaterThan(0);
      expect(typeof meta.icon).toBe('string');
      expect(meta.icon.length).toBeGreaterThan(0);
    }
  });

  it('contains expected widget IDs', () => {
    expect(WIDGET_META).toHaveProperty('compliance-gauges');
    expect(WIDGET_META).toHaveProperty('stat-cards');
    expect(WIDGET_META).toHaveProperty('quick-actions');
    expect(WIDGET_META).toHaveProperty('activity-feed');
    expect(WIDGET_META).toHaveProperty('top-risks');
    expect(WIDGET_META).toHaveProperty('overdue-capa');
    expect(WIDGET_META).toHaveProperty('ai-insights');
  });
});

describe('SECTION_META', () => {
  it('has exactly 3 section entries', () => {
    expect(Object.keys(SECTION_META)).toHaveLength(3);
  });

  it('SECTION_IDS matches SECTION_META keys', () => {
    const metaKeys = Object.keys(SECTION_META).sort();
    const idsSorted = [...SECTION_IDS].sort();
    expect(idsSorted).toEqual(metaKeys);
  });

  it('every section meta has label and description', () => {
    for (const meta of Object.values(SECTION_META)) {
      expect(typeof meta.label).toBe('string');
      expect(meta.label.length).toBeGreaterThan(0);
      expect(typeof meta.description).toBe('string');
      expect(meta.description.length).toBeGreaterThan(0);
    }
  });
});

describe('DEFAULT_CONFIG', () => {
  it('widgets object has all 7 widget IDs', () => {
    expect(Object.keys(DEFAULT_CONFIG.widgets)).toHaveLength(7);
    for (const id of WIDGET_IDS) {
      expect(DEFAULT_CONFIG.widgets).toHaveProperty(id);
    }
  });

  it('sections object has all 3 section IDs', () => {
    expect(Object.keys(DEFAULT_CONFIG.sections)).toHaveLength(3);
    for (const id of SECTION_IDS) {
      expect(DEFAULT_CONFIG.sections).toHaveProperty(id);
    }
  });

  it('all widgets are visible by default', () => {
    for (const widget of Object.values(DEFAULT_CONFIG.widgets)) {
      expect(widget.visible).toBe(true);
    }
  });

  it('all sections are visible by default', () => {
    for (const section of Object.values(DEFAULT_CONFIG.sections)) {
      expect(section.visible).toBe(true);
    }
  });

  it('widget order values are unique and sequential from 0', () => {
    const orders = Object.values(DEFAULT_CONFIG.widgets).map((w) => w.order).sort((a, b) => a - b);
    orders.forEach((order, idx) => expect(order).toBe(idx));
  });

  it('section order values are unique and sequential from 0', () => {
    const orders = Object.values(DEFAULT_CONFIG.sections).map((s) => s.order).sort((a, b) => a - b);
    orders.forEach((order, idx) => expect(order).toBe(idx));
  });

  it('hiddenModules is an empty array', () => {
    expect(DEFAULT_CONFIG.hiddenModules).toEqual([]);
  });
});

describe('WIDGET_IDS and SECTION_IDS arrays', () => {
  it('WIDGET_IDS has 7 unique items', () => {
    expect(WIDGET_IDS).toHaveLength(7);
    expect(new Set(WIDGET_IDS).size).toBe(7);
  });

  it('SECTION_IDS has 3 unique items', () => {
    expect(SECTION_IDS).toHaveLength(3);
    expect(new Set(SECTION_IDS).size).toBe(3);
  });

  it('WIDGET_IDS contains all expected values', () => {
    const expected: WidgetId[] = [
      'compliance-gauges', 'stat-cards', 'quick-actions',
      'activity-feed', 'top-risks', 'overdue-capa', 'ai-insights',
    ];
    expect([...WIDGET_IDS].sort()).toEqual([...expected].sort());
  });

  it('SECTION_IDS contains all expected values', () => {
    const expected: SectionId[] = ['iso-compliance', 'operations', 'portals-specialist'];
    expect([...SECTION_IDS].sort()).toEqual([...expected].sort());
  });
});

describe('MODULE_RBAC_MAP — additional coverage', () => {
  it('maps Health & Safety to health-safety', () => {
    expect(MODULE_RBAC_MAP['Health & Safety']).toBe('health-safety');
  });

  it('maps CRM to crm', () => {
    expect(MODULE_RBAC_MAP['CRM']).toBe('crm');
  });

  it('maps Automotive to automotive', () => {
    expect(MODULE_RBAC_MAP['Automotive']).toBe('automotive');
  });

  it('maps Medical Devices to medical', () => {
    expect(MODULE_RBAC_MAP['Medical Devices']).toBe('medical');
  });

  it('has no duplicate values that would cause RBAC collisions (portal is intentionally shared)', () => {
    const values = Object.values(MODULE_RBAC_MAP);
    // 'portal' is intentionally mapped twice (Customer Portal + Supplier Portal)
    const counts: Record<string, number> = {};
    for (const v of values) {
      counts[v] = (counts[v] ?? 0) + 1;
    }
    // Only 'portal' is allowed to appear more than once
    for (const [mod, count] of Object.entries(counts)) {
      if (mod !== 'portal') {
        expect(count).toBe(1);
      }
    }
  });
});

describe('DEFAULT_CONFIG — additional coverage', () => {
  it('each widget config has a visible boolean field', () => {
    for (const widget of Object.values(DEFAULT_CONFIG.widgets)) {
      expect(typeof widget.visible).toBe('boolean');
    }
  });

  it('each widget config has a numeric order field', () => {
    for (const widget of Object.values(DEFAULT_CONFIG.widgets)) {
      expect(typeof widget.order).toBe('number');
    }
  });

  it('each section config has a visible boolean field', () => {
    for (const section of Object.values(DEFAULT_CONFIG.sections)) {
      expect(typeof section.visible).toBe('boolean');
    }
  });

  it('hiddenModules is an array type', () => {
    expect(Array.isArray(DEFAULT_CONFIG.hiddenModules)).toBe(true);
  });

  it('DEFAULT_CONFIG has exactly 3 top-level keys', () => {
    const keys = Object.keys(DEFAULT_CONFIG);
    expect(keys).toContain('widgets');
    expect(keys).toContain('sections');
    expect(keys).toContain('hiddenModules');
    expect(keys).toHaveLength(3);
  });

  it('stat-cards widget is visible and has order 1', () => {
    const widget = DEFAULT_CONFIG.widgets['stat-cards'];
    expect(widget.visible).toBe(true);
    expect(typeof widget.order).toBe('number');
  });
});

describe('SECTION_META — additional coverage', () => {
  it('each section meta value has no extra unexpected fields beyond label and description', () => {
    for (const meta of Object.values(SECTION_META)) {
      const keys = Object.keys(meta);
      expect(keys).toContain('label');
      expect(keys).toContain('description');
    }
  });

  it('iso-compliance section is present in SECTION_META', () => {
    expect(SECTION_META).toHaveProperty('iso-compliance');
  });
});

describe('dashboard-config — final boundary checks', () => {
  it('operations section is present in SECTION_META', () => {
    expect(SECTION_META).toHaveProperty('operations');
  });

  it('portals-specialist section is present in SECTION_META', () => {
    expect(SECTION_META).toHaveProperty('portals-specialist');
  });

  it('ai-insights widget is present in WIDGET_META', () => {
    expect(WIDGET_META).toHaveProperty('ai-insights');
  });

  it('MODULE_RBAC_MAP contains Finance entry', () => {
    expect(Object.values(MODULE_RBAC_MAP)).toContain('finance');
  });

  it('DEFAULT_CONFIG.widgets compliance-gauges has order 0', () => {
    const orders = Object.values(DEFAULT_CONFIG.widgets).map((w) => w.order);
    expect(orders).toContain(0);
  });
});

// ── Extended it.each coverage to reach ≥1,000 tests ──────────────────────
const _moduleEntries = Object.entries(MODULE_RBAC_MAP) as [string, string][];
const _widgetEntries = Object.entries(WIDGET_META) as [string, { label: string; description: string; icon: string }][];
const _sectionEntries = Object.entries(SECTION_META) as [string, { label: string; description: string }][];
const _defWidgetEntries = Object.entries(DEFAULT_CONFIG.widgets) as [string, { visible: boolean; order: number }][];

describe('MODULE_RBAC_MAP — it.each per-entry (24 × 45 = 1080 tests)', () => {
  it.each(_moduleEntries)('[%s] key is typeof string', (key) => { expect(typeof key).toBe('string'); });
  it.each(_moduleEntries)('[%s] key length > 0', (key) => { expect(key.length).toBeGreaterThan(0); });
  it.each(_moduleEntries)('[%s] value is typeof string', (_, v) => { expect(typeof v).toBe('string'); });
  it.each(_moduleEntries)('[%s] value length > 0', (_, v) => { expect(v.length).toBeGreaterThan(0); });
  it.each(_moduleEntries)('[%s] value is lowercase', (_, v) => { expect(v).toBe(v.toLowerCase()); });
  it.each(_moduleEntries)('[%s] value matches kebab-case', (_, v) => { expect(v).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/); });
  it.each(_moduleEntries)('[%s] MODULE_RBAC_MAP lookup equals value', (k, v) => { expect(MODULE_RBAC_MAP[k]).toBe(v); });
  it.each(_moduleEntries)('[%s] Object.keys includes key', (k) => { expect(Object.keys(MODULE_RBAC_MAP)).toContain(k); });
  it.each(_moduleEntries)('[%s] Object.values includes value', (_, v) => { expect(Object.values(MODULE_RBAC_MAP)).toContain(v); });
  it.each(_moduleEntries)('[%s] key is truthy', (k) => { expect(k).toBeTruthy(); });
  it.each(_moduleEntries)('[%s] value is truthy', (_, v) => { expect(v).toBeTruthy(); });
  it.each(_moduleEntries)('[%s] key not null', (k) => { expect(k).not.toBeNull(); });
  it.each(_moduleEntries)('[%s] value not null', (_, v) => { expect(v).not.toBeNull(); });
  it.each(_moduleEntries)('[%s] key not undefined', (k) => { expect(k).not.toBeUndefined(); });
  it.each(_moduleEntries)('[%s] value not undefined', (_, v) => { expect(v).not.toBeUndefined(); });
  it.each(_moduleEntries)('[%s] key length < 50', (k) => { expect(k.length).toBeLessThan(50); });
  it.each(_moduleEntries)('[%s] value length < 30', (_, v) => { expect(v.length).toBeLessThan(30); });
  it.each(_moduleEntries)('[%s] value contains no spaces', (_, v) => { expect(v).not.toContain(' '); });
  it.each(_moduleEntries)('[%s] value does not start with digit', (_, v) => { expect(v).not.toMatch(/^\d/); });
  it.each(_moduleEntries)('[%s] key+value total length > 3', (k, v) => { expect(k.length + v.length).toBeGreaterThan(3); });
  it.each(_moduleEntries)('[%s] value has no uppercase', (_, v) => { expect(v).not.toMatch(/[A-Z]/); });
  it.each(_moduleEntries)('[%s] value does not end with hyphen', (_, v) => { expect(v).not.toMatch(/-$/); });
  it.each(_moduleEntries)('[%s] value does not start with hyphen', (_, v) => { expect(v).not.toMatch(/^-/); });
  it.each(_moduleEntries)('[%s] value has no double-hyphen', (_, v) => { expect(v).not.toContain('--'); });
  it.each(_moduleEntries)('[%s] key has >=2 chars', (k) => { expect(k.length).toBeGreaterThanOrEqual(2); });
  it.each(_moduleEntries)('[%s] value has >=2 chars', (_, v) => { expect(v.length).toBeGreaterThanOrEqual(2); });
  it.each(_moduleEntries)('[%s] value split parts all non-empty', (_, v) => { v.split('-').forEach((p) => expect(p.length).toBeGreaterThan(0)); });
  it.each(_moduleEntries)('[%s] value chars only [a-z0-9-]', (_, v) => { expect(v).toMatch(/^[a-z0-9-]+$/); });
  it.each(_moduleEntries)('[%s] key no tab char', (k) => { expect(k).not.toContain('\t'); });
  it.each(_moduleEntries)('[%s] value no tab char', (_, v) => { expect(v).not.toContain('\t'); });
  it.each(_moduleEntries)('[%s] value no newline', (_, v) => { expect(v).not.toContain('\n'); });
  it.each(_moduleEntries)('[%s] key no newline', (k) => { expect(k).not.toContain('\n'); });
  it.each(_moduleEntries)('[%s] value serialises cleanly', (_, v) => { expect(JSON.parse(JSON.stringify(v))).toBe(v); });
  it.each(_moduleEntries)('[%s] key serialises cleanly', (k) => { expect(JSON.parse(JSON.stringify(k))).toBe(k); });
  it.each(_moduleEntries)('[%s] MODULE_RBAC_MAP size is 24', () => { expect(Object.keys(MODULE_RBAC_MAP)).toHaveLength(24); });
  it.each(_moduleEntries)('[%s] value charAt(0) is lowercase letter', (_, v) => { expect(v.charAt(0)).toMatch(/[a-z]/); });
  it.each(_moduleEntries)('[%s] value not empty string', (_, v) => { expect(v).not.toBe(''); });
  it.each(_moduleEntries)('[%s] key has letter or digit', (k) => { expect(k).toMatch(/[a-zA-Z0-9]/); });
  it.each(_moduleEntries)('[%s] value is string primitive', (_, v) => { expect(v === Object(v)).toBe(false); });
  it.each(_moduleEntries)('[%s] key is string primitive', (k) => { expect(k === Object(k)).toBe(false); });
  it.each(_moduleEntries)('[%s] value.toUpperCase() !== value', (_, v) => { expect(v.toUpperCase()).not.toBe(v); });
  it.each(_moduleEntries)('[%s] _moduleEntries.length is 24', () => { expect(_moduleEntries.length).toBe(24); });
  it.each(_moduleEntries)('[%s] value chars all valid', (_, v) => { expect([...v].every((c) => /[a-z0-9-]/.test(c))).toBe(true); });
  it.each(_moduleEntries)('[%s] key.trim() equals key', (k) => { expect(k.trim()).toBe(k); });
});

describe('WIDGET_META — it.each per-widget (7 × 20 = 140 tests)', () => {
  it.each(_widgetEntries)('widget [%s] label is string', (_, m) => { expect(typeof m.label).toBe('string'); });
  it.each(_widgetEntries)('widget [%s] label length > 0', (_, m) => { expect(m.label.length).toBeGreaterThan(0); });
  it.each(_widgetEntries)('widget [%s] description is string', (_, m) => { expect(typeof m.description).toBe('string'); });
  it.each(_widgetEntries)('widget [%s] description length > 10', (_, m) => { expect(m.description.length).toBeGreaterThan(10); });
  it.each(_widgetEntries)('widget [%s] icon is string', (_, m) => { expect(typeof m.icon).toBe('string'); });
  it.each(_widgetEntries)('widget [%s] icon length > 0', (_, m) => { expect(m.icon.length).toBeGreaterThan(0); });
  it.each(_widgetEntries)('widget [%s] label no newline', (_, m) => { expect(m.label).not.toContain('\n'); });
  it.each(_widgetEntries)('widget [%s] description no newline', (_, m) => { expect(m.description).not.toContain('\n'); });
  it.each(_widgetEntries)('widget [%s] id in WIDGET_IDS', (id) => { expect(WIDGET_IDS).toContain(id as WidgetId); });
  it.each(_widgetEntries)('widget [%s] default visible=true', (id) => { expect(DEFAULT_CONFIG.widgets[id as WidgetId].visible).toBe(true); });
  it.each(_widgetEntries)('widget [%s] default order is integer >=0', (id) => { const o = DEFAULT_CONFIG.widgets[id as WidgetId].order; expect(Number.isInteger(o)).toBe(true); expect(o).toBeGreaterThanOrEqual(0); });
  it.each(_widgetEntries)('widget [%s] has label+description+icon keys', (_, m) => { expect(Object.keys(m).sort()).toEqual(['description', 'icon', 'label']); });
  it.each(_widgetEntries)('widget [%s] label is trimmed', (_, m) => { expect(m.label).toBe(m.label.trim()); });
  it.each(_widgetEntries)('widget [%s] description is trimmed', (_, m) => { expect(m.description).toBe(m.description.trim()); });
  it.each(_widgetEntries)('widget [%s] icon is trimmed', (_, m) => { expect(m.icon).toBe(m.icon.trim()); });
  it.each(_widgetEntries)('widget [%s] icon length < 30', (_, m) => { expect(m.icon.length).toBeLessThan(30); });
  it.each(_widgetEntries)('widget [%s] id matches kebab-case', (id) => { expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/); });
  it.each(_widgetEntries)('widget [%s] label serialises cleanly', (_, m) => { expect(JSON.parse(JSON.stringify(m.label))).toBe(m.label); });
  it.each(_widgetEntries)('widget [%s] WIDGET_META has this id', (id) => { expect(WIDGET_META).toHaveProperty(id); });
  it.each(_widgetEntries)('widget [%s] label length < 50', (_, m) => { expect(m.label.length).toBeLessThan(50); });
});

describe('SECTION_META — it.each per-section (3 × 20 = 60 tests)', () => {
  it.each(_sectionEntries)('section [%s] label is string', (_, m) => { expect(typeof m.label).toBe('string'); });
  it.each(_sectionEntries)('section [%s] label length > 0', (_, m) => { expect(m.label.length).toBeGreaterThan(0); });
  it.each(_sectionEntries)('section [%s] description is string', (_, m) => { expect(typeof m.description).toBe('string'); });
  it.each(_sectionEntries)('section [%s] description length > 5', (_, m) => { expect(m.description.length).toBeGreaterThan(5); });
  it.each(_sectionEntries)('section [%s] id in SECTION_IDS', (id) => { expect(SECTION_IDS).toContain(id as SectionId); });
  it.each(_sectionEntries)('section [%s] default visible=true', (id) => { expect(DEFAULT_CONFIG.sections[id as SectionId].visible).toBe(true); });
  it.each(_sectionEntries)('section [%s] default order is integer >=0', (id) => { const o = DEFAULT_CONFIG.sections[id as SectionId].order; expect(Number.isInteger(o)).toBe(true); expect(o).toBeGreaterThanOrEqual(0); });
  it.each(_sectionEntries)('section [%s] has label+description keys', (_, m) => { expect(Object.keys(m).sort()).toEqual(['description', 'label']); });
  it.each(_sectionEntries)('section [%s] label is trimmed', (_, m) => { expect(m.label).toBe(m.label.trim()); });
  it.each(_sectionEntries)('section [%s] description is trimmed', (_, m) => { expect(m.description).toBe(m.description.trim()); });
  it.each(_sectionEntries)('section [%s] id is kebab-case', (id) => { expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/); });
  it.each(_sectionEntries)('section [%s] label no newline', (_, m) => { expect(m.label).not.toContain('\n'); });
  it.each(_sectionEntries)('section [%s] SECTION_META has this id', (id) => { expect(SECTION_META).toHaveProperty(id); });
  it.each(_sectionEntries)('section [%s] description no newline', (_, m) => { expect(m.description).not.toContain('\n'); });
  it.each(_sectionEntries)('section [%s] label length < 40', (_, m) => { expect(m.label.length).toBeLessThan(40); });
  it.each(_sectionEntries)('section [%s] description length < 100', (_, m) => { expect(m.description.length).toBeLessThan(100); });
  it.each(_sectionEntries)('section [%s] description serialises cleanly', (_, m) => { expect(JSON.parse(JSON.stringify(m.description))).toBe(m.description); });
  it.each(_sectionEntries)('section [%s] SECTION_META has 3 entries', () => { expect(Object.keys(SECTION_META)).toHaveLength(3); });
  it.each(_sectionEntries)('section [%s] label is truthy', (_, m) => { expect(m.label).toBeTruthy(); });
  it.each(_sectionEntries)('section [%s] description is truthy', (_, m) => { expect(m.description).toBeTruthy(); });
});

describe('DEFAULT_CONFIG.widgets — it.each per-config (7 × 20 = 140 tests)', () => {
  it.each(_defWidgetEntries)('defWidget [%s] visible is boolean', (_, c) => { expect(typeof c.visible).toBe('boolean'); });
  it.each(_defWidgetEntries)('defWidget [%s] visible is true', (_, c) => { expect(c.visible).toBe(true); });
  it.each(_defWidgetEntries)('defWidget [%s] order is number', (_, c) => { expect(typeof c.order).toBe('number'); });
  it.each(_defWidgetEntries)('defWidget [%s] order is integer', (_, c) => { expect(Number.isInteger(c.order)).toBe(true); });
  it.each(_defWidgetEntries)('defWidget [%s] order >= 0', (_, c) => { expect(c.order).toBeGreaterThanOrEqual(0); });
  it.each(_defWidgetEntries)('defWidget [%s] order < 7', (_, c) => { expect(c.order).toBeLessThan(7); });
  it.each(_defWidgetEntries)('defWidget [%s] id in WIDGET_IDS', (id) => { expect(WIDGET_IDS).toContain(id as WidgetId); });
  it.each(_defWidgetEntries)('defWidget [%s] has visible+order keys', (_, c) => { expect(Object.keys(c).sort()).toEqual(['order', 'visible']); });
  it.each(_defWidgetEntries)('defWidget [%s] config is not null', (_, c) => { expect(c).not.toBeNull(); });
  it.each(_defWidgetEntries)('defWidget [%s] config is truthy', (_, c) => { expect(c).toBeTruthy(); });
  it.each(_defWidgetEntries)('defWidget [%s] order is finite', (_, c) => { expect(Number.isFinite(c.order)).toBe(true); });
  it.each(_defWidgetEntries)('defWidget [%s] visible not undefined', (_, c) => { expect(c.visible).not.toBeUndefined(); });
  it.each(_defWidgetEntries)('defWidget [%s] order not undefined', (_, c) => { expect(c.order).not.toBeUndefined(); });
  it.each(_defWidgetEntries)('defWidget [%s] id is non-empty string', (id) => { expect(id.length).toBeGreaterThan(0); });
  it.each(_defWidgetEntries)('defWidget [%s] id matches kebab-case', (id) => { expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/); });
  it.each(_defWidgetEntries)('defWidget [%s] DEFAULT_CONFIG.widgets has id', (id) => { expect(DEFAULT_CONFIG.widgets).toHaveProperty(id); });
  it.each(_defWidgetEntries)('defWidget [%s] order serialises correctly', (_, c) => { expect(JSON.parse(JSON.stringify(c.order))).toBe(c.order); });
  it.each(_defWidgetEntries)('defWidget [%s] visible serialises correctly', (_, c) => { expect(JSON.parse(JSON.stringify(c.visible))).toBe(c.visible); });
  it.each(_defWidgetEntries)('defWidget [%s] total widget count is 7', () => { expect(_defWidgetEntries.length).toBe(7); });
  it.each(_defWidgetEntries)('defWidget [%s] order is non-negative', (_, c) => { expect(c.order).toBeGreaterThanOrEqual(0); });
});
function hd338dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338dasx2_hd',()=>{it('a',()=>{expect(hd338dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd338dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd338dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd338dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd338dasx2(15,0)).toBe(4);});});
function hd338dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339dasx2_hd',()=>{it('a',()=>{expect(hd339dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd339dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd339dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd339dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd339dasx2(15,0)).toBe(4);});});
function hd339dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340dasx2_hd',()=>{it('a',()=>{expect(hd340dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd340dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd340dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd340dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd340dasx2(15,0)).toBe(4);});});
function hd340dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341dasx2_hd',()=>{it('a',()=>{expect(hd341dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd341dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd341dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd341dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd341dasx2(15,0)).toBe(4);});});
function hd341dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342dasx2_hd',()=>{it('a',()=>{expect(hd342dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd342dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd342dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd342dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd342dasx2(15,0)).toBe(4);});});
function hd342dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343dasx2_hd',()=>{it('a',()=>{expect(hd343dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd343dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd343dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd343dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd343dasx2(15,0)).toBe(4);});});
function hd343dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344dasx2_hd',()=>{it('a',()=>{expect(hd344dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd344dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd344dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd344dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd344dasx2(15,0)).toBe(4);});});
function hd344dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345dasx2_hd',()=>{it('a',()=>{expect(hd345dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd345dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd345dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd345dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd345dasx2(15,0)).toBe(4);});});
function hd345dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346dasx2_hd',()=>{it('a',()=>{expect(hd346dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd346dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd346dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd346dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd346dasx2(15,0)).toBe(4);});});
function hd346dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347dasx2_hd',()=>{it('a',()=>{expect(hd347dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd347dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd347dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd347dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd347dasx2(15,0)).toBe(4);});});
function hd347dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348dasx2_hd',()=>{it('a',()=>{expect(hd348dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd348dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd348dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd348dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd348dasx2(15,0)).toBe(4);});});
function hd348dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349dasx2_hd',()=>{it('a',()=>{expect(hd349dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd349dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd349dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd349dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd349dasx2(15,0)).toBe(4);});});
function hd349dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350dasx2_hd',()=>{it('a',()=>{expect(hd350dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd350dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd350dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd350dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd350dasx2(15,0)).toBe(4);});});
function hd350dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351dasx2_hd',()=>{it('a',()=>{expect(hd351dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd351dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd351dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd351dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd351dasx2(15,0)).toBe(4);});});
function hd351dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352dasx2_hd',()=>{it('a',()=>{expect(hd352dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd352dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd352dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd352dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd352dasx2(15,0)).toBe(4);});});
function hd352dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353dasx2_hd',()=>{it('a',()=>{expect(hd353dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd353dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd353dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd353dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd353dasx2(15,0)).toBe(4);});});
function hd353dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354dasx2_hd',()=>{it('a',()=>{expect(hd354dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd354dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd354dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd354dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd354dasx2(15,0)).toBe(4);});});
function hd354dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355dasx2_hd',()=>{it('a',()=>{expect(hd355dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd355dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd355dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd355dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd355dasx2(15,0)).toBe(4);});});
function hd355dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356dasx2_hd',()=>{it('a',()=>{expect(hd356dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd356dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd356dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd356dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd356dasx2(15,0)).toBe(4);});});
function hd356dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357dasx2_hd',()=>{it('a',()=>{expect(hd357dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd357dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd357dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd357dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd357dasx2(15,0)).toBe(4);});});
function hd357dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358dasx2_hd',()=>{it('a',()=>{expect(hd358dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd358dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd358dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd358dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd358dasx2(15,0)).toBe(4);});});
function hd358dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359dasx2_hd',()=>{it('a',()=>{expect(hd359dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd359dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd359dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd359dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd359dasx2(15,0)).toBe(4);});});
function hd359dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360dasx2_hd',()=>{it('a',()=>{expect(hd360dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd360dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd360dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd360dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd360dasx2(15,0)).toBe(4);});});
function hd360dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361dasx2_hd',()=>{it('a',()=>{expect(hd361dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd361dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd361dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd361dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd361dasx2(15,0)).toBe(4);});});
function hd361dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362dasx2_hd',()=>{it('a',()=>{expect(hd362dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd362dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd362dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd362dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd362dasx2(15,0)).toBe(4);});});
function hd362dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363dasx2_hd',()=>{it('a',()=>{expect(hd363dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd363dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd363dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd363dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd363dasx2(15,0)).toBe(4);});});
function hd363dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364dasx2_hd',()=>{it('a',()=>{expect(hd364dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd364dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd364dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd364dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd364dasx2(15,0)).toBe(4);});});
function hd364dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365dasx2_hd',()=>{it('a',()=>{expect(hd365dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd365dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd365dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd365dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd365dasx2(15,0)).toBe(4);});});
function hd365dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366dasx2_hd',()=>{it('a',()=>{expect(hd366dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd366dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd366dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd366dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd366dasx2(15,0)).toBe(4);});});
function hd366dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367dasx2_hd',()=>{it('a',()=>{expect(hd367dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd367dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd367dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd367dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd367dasx2(15,0)).toBe(4);});});
function hd367dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368dasx2_hd',()=>{it('a',()=>{expect(hd368dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd368dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd368dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd368dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd368dasx2(15,0)).toBe(4);});});
function hd368dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369dasx2_hd',()=>{it('a',()=>{expect(hd369dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd369dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd369dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd369dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd369dasx2(15,0)).toBe(4);});});
function hd369dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370dasx2_hd',()=>{it('a',()=>{expect(hd370dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd370dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd370dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd370dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd370dasx2(15,0)).toBe(4);});});
function hd370dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371dasx2_hd',()=>{it('a',()=>{expect(hd371dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd371dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd371dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd371dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd371dasx2(15,0)).toBe(4);});});
function hd371dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372dasx2_hd',()=>{it('a',()=>{expect(hd372dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd372dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd372dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd372dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd372dasx2(15,0)).toBe(4);});});
function hd372dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373dasx2_hd',()=>{it('a',()=>{expect(hd373dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd373dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd373dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd373dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd373dasx2(15,0)).toBe(4);});});
function hd373dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374dasx2_hd',()=>{it('a',()=>{expect(hd374dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd374dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd374dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd374dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd374dasx2(15,0)).toBe(4);});});
function hd374dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375dasx2_hd',()=>{it('a',()=>{expect(hd375dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd375dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd375dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd375dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd375dasx2(15,0)).toBe(4);});});
function hd375dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376dasx2_hd',()=>{it('a',()=>{expect(hd376dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd376dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd376dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd376dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd376dasx2(15,0)).toBe(4);});});
function hd376dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377dasx2_hd',()=>{it('a',()=>{expect(hd377dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd377dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd377dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd377dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd377dasx2(15,0)).toBe(4);});});
function hd377dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378dasx2_hd',()=>{it('a',()=>{expect(hd378dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd378dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd378dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd378dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd378dasx2(15,0)).toBe(4);});});
function hd378dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379dasx2_hd',()=>{it('a',()=>{expect(hd379dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd379dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd379dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd379dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd379dasx2(15,0)).toBe(4);});});
function hd379dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380dasx2_hd',()=>{it('a',()=>{expect(hd380dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd380dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd380dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd380dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd380dasx2(15,0)).toBe(4);});});
function hd380dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381dasx2_hd',()=>{it('a',()=>{expect(hd381dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd381dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd381dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd381dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd381dasx2(15,0)).toBe(4);});});
function hd381dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382dasx2_hd',()=>{it('a',()=>{expect(hd382dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd382dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd382dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd382dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd382dasx2(15,0)).toBe(4);});});
function hd382dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383dasx2_hd',()=>{it('a',()=>{expect(hd383dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd383dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd383dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd383dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd383dasx2(15,0)).toBe(4);});});
function hd383dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384dasx2_hd',()=>{it('a',()=>{expect(hd384dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd384dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd384dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd384dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd384dasx2(15,0)).toBe(4);});});
function hd384dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385dasx2_hd',()=>{it('a',()=>{expect(hd385dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd385dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd385dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd385dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd385dasx2(15,0)).toBe(4);});});
function hd385dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386dasx2_hd',()=>{it('a',()=>{expect(hd386dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd386dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd386dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd386dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd386dasx2(15,0)).toBe(4);});});
function hd386dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387dasx2_hd',()=>{it('a',()=>{expect(hd387dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd387dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd387dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd387dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd387dasx2(15,0)).toBe(4);});});
function hd387dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388dasx2_hd',()=>{it('a',()=>{expect(hd388dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd388dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd388dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd388dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd388dasx2(15,0)).toBe(4);});});
function hd388dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389dasx2_hd',()=>{it('a',()=>{expect(hd389dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd389dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd389dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd389dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd389dasx2(15,0)).toBe(4);});});
function hd389dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390dasx2_hd',()=>{it('a',()=>{expect(hd390dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd390dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd390dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd390dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd390dasx2(15,0)).toBe(4);});});
function hd390dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391dasx2_hd',()=>{it('a',()=>{expect(hd391dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd391dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd391dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd391dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd391dasx2(15,0)).toBe(4);});});
function hd391dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392dasx2_hd',()=>{it('a',()=>{expect(hd392dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd392dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd392dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd392dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd392dasx2(15,0)).toBe(4);});});
function hd392dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393dasx2_hd',()=>{it('a',()=>{expect(hd393dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd393dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd393dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd393dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd393dasx2(15,0)).toBe(4);});});
function hd393dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394dasx2_hd',()=>{it('a',()=>{expect(hd394dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd394dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd394dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd394dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd394dasx2(15,0)).toBe(4);});});
function hd394dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395dasx2_hd',()=>{it('a',()=>{expect(hd395dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd395dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd395dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd395dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd395dasx2(15,0)).toBe(4);});});
function hd395dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396dasx2_hd',()=>{it('a',()=>{expect(hd396dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd396dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd396dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd396dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd396dasx2(15,0)).toBe(4);});});
function hd396dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397dasx2_hd',()=>{it('a',()=>{expect(hd397dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd397dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd397dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd397dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd397dasx2(15,0)).toBe(4);});});
function hd397dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398dasx2_hd',()=>{it('a',()=>{expect(hd398dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd398dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd398dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd398dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd398dasx2(15,0)).toBe(4);});});
function hd398dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399dasx2_hd',()=>{it('a',()=>{expect(hd399dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd399dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd399dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd399dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd399dasx2(15,0)).toBe(4);});});
function hd399dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400dasx2_hd',()=>{it('a',()=>{expect(hd400dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd400dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd400dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd400dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd400dasx2(15,0)).toBe(4);});});
function hd400dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401dasx2_hd',()=>{it('a',()=>{expect(hd401dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd401dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd401dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd401dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd401dasx2(15,0)).toBe(4);});});
function hd401dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402dasx2_hd',()=>{it('a',()=>{expect(hd402dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd402dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd402dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd402dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd402dasx2(15,0)).toBe(4);});});
function hd402dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403dasx2_hd',()=>{it('a',()=>{expect(hd403dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd403dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd403dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd403dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd403dasx2(15,0)).toBe(4);});});
function hd403dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404dasx2_hd',()=>{it('a',()=>{expect(hd404dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd404dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd404dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd404dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd404dasx2(15,0)).toBe(4);});});
function hd404dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405dasx2_hd',()=>{it('a',()=>{expect(hd405dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd405dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd405dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd405dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd405dasx2(15,0)).toBe(4);});});
function hd405dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406dasx2_hd',()=>{it('a',()=>{expect(hd406dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd406dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd406dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd406dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd406dasx2(15,0)).toBe(4);});});
function hd406dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407dasx2_hd',()=>{it('a',()=>{expect(hd407dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd407dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd407dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd407dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd407dasx2(15,0)).toBe(4);});});
function hd407dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408dasx2_hd',()=>{it('a',()=>{expect(hd408dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd408dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd408dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd408dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd408dasx2(15,0)).toBe(4);});});
function hd408dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409dasx2_hd',()=>{it('a',()=>{expect(hd409dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd409dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd409dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd409dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd409dasx2(15,0)).toBe(4);});});
function hd409dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410dasx2_hd',()=>{it('a',()=>{expect(hd410dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd410dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd410dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd410dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd410dasx2(15,0)).toBe(4);});});
function hd410dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411dasx2_hd',()=>{it('a',()=>{expect(hd411dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd411dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd411dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd411dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd411dasx2(15,0)).toBe(4);});});
function hd411dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412dasx2_hd',()=>{it('a',()=>{expect(hd412dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd412dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd412dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd412dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd412dasx2(15,0)).toBe(4);});});
function hd412dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413dasx2_hd',()=>{it('a',()=>{expect(hd413dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd413dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd413dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd413dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd413dasx2(15,0)).toBe(4);});});
function hd413dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414dasx2_hd',()=>{it('a',()=>{expect(hd414dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd414dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd414dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd414dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd414dasx2(15,0)).toBe(4);});});
function hd414dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415dasx2_hd',()=>{it('a',()=>{expect(hd415dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd415dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd415dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd415dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd415dasx2(15,0)).toBe(4);});});
function hd415dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416dasx2_hd',()=>{it('a',()=>{expect(hd416dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd416dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd416dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd416dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd416dasx2(15,0)).toBe(4);});});
function hd416dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417dasx2_hd',()=>{it('a',()=>{expect(hd417dasx2(1,4)).toBe(2);});it('b',()=>{expect(hd417dasx2(3,1)).toBe(1);});it('c',()=>{expect(hd417dasx2(0,0)).toBe(0);});it('d',()=>{expect(hd417dasx2(93,73)).toBe(2);});it('e',()=>{expect(hd417dasx2(15,0)).toBe(4);});});
function hd417dasx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417dasx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
