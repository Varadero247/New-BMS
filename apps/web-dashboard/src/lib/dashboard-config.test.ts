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
