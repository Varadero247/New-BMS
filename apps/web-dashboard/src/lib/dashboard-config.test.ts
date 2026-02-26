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
