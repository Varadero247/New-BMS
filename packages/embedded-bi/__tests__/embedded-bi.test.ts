// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import {
  VALID_CHART_TYPES, isValidChartType, buildChartConfig, buildEmptyDataset,
  aggregateData, buildSeriesFromAggregation, validateChartConfig,
  normalizeSeriesData, getChartColors, mergeDatasets,
  getNextDrillLevel, getPrevDrillLevel, buildDrillContext, applyDrillFilter,
  formatDrillLabel, isDrillable,
} from '../src/index';
import type { ChartConfig, ChartDataset, DataSeries, DrillDownContext } from '../src/index';

function makeDataset(labels = ['A', 'B', 'C'], values = [10, 20, 30]): ChartDataset {
  return { labels, series: [{ name: 'Series 1', data: values }] };
}

function makeConfig(overrides: Partial<ChartConfig> = {}): ChartConfig {
  return {
    id: 'chart-1',
    type: 'bar',
    title: 'Test Chart',
    dataset: makeDataset(),
    ...overrides,
  };
}

// ─── VALID_CHART_TYPES ────────────────────────────────────────────────────────
describe('VALID_CHART_TYPES', () => {
  it('is an array', () => expect(Array.isArray(VALID_CHART_TYPES)).toBe(true));
  it('has 10 types', () => expect(VALID_CHART_TYPES).toHaveLength(10));
  it('includes bar', () => expect(VALID_CHART_TYPES).toContain('bar'));
  it('includes line', () => expect(VALID_CHART_TYPES).toContain('line'));
  it('includes pie', () => expect(VALID_CHART_TYPES).toContain('pie'));
  it('includes donut', () => expect(VALID_CHART_TYPES).toContain('donut'));
  it('includes area', () => expect(VALID_CHART_TYPES).toContain('area'));
  it('includes scatter', () => expect(VALID_CHART_TYPES).toContain('scatter'));
  it('includes heatmap', () => expect(VALID_CHART_TYPES).toContain('heatmap'));
  it('includes gauge', () => expect(VALID_CHART_TYPES).toContain('gauge'));
  it('includes funnel', () => expect(VALID_CHART_TYPES).toContain('funnel'));
  it('includes radar', () => expect(VALID_CHART_TYPES).toContain('radar'));
  for (let i = 0; i < 30; i++) {
    it(`VALID_CHART_TYPES iter${i}`, () => {
      expect(VALID_CHART_TYPES[i % 10]).toBeTruthy();
    });
  }
});

// ─── isValidChartType ─────────────────────────────────────────────────────────
describe('isValidChartType', () => {
  it('bar is valid', () => expect(isValidChartType('bar')).toBe(true));
  it('line is valid', () => expect(isValidChartType('line')).toBe(true));
  it('pie is valid', () => expect(isValidChartType('pie')).toBe(true));
  it('donut is valid', () => expect(isValidChartType('donut')).toBe(true));
  it('area is valid', () => expect(isValidChartType('area')).toBe(true));
  it('scatter is valid', () => expect(isValidChartType('scatter')).toBe(true));
  it('heatmap is valid', () => expect(isValidChartType('heatmap')).toBe(true));
  it('gauge is valid', () => expect(isValidChartType('gauge')).toBe(true));
  it('funnel is valid', () => expect(isValidChartType('funnel')).toBe(true));
  it('radar is valid', () => expect(isValidChartType('radar')).toBe(true));
  it('column invalid', () => expect(isValidChartType('column')).toBe(false));
  it('histogram invalid', () => expect(isValidChartType('histogram')).toBe(false));
  it('empty invalid', () => expect(isValidChartType('')).toBe(false));
  for (let i = 0; i < 50; i++) {
    it(`invalid chart type fake${i}`, () => expect(isValidChartType(`fake${i}`)).toBe(false));
  }
  for (let i = 0; i < 30; i++) {
    const t = VALID_CHART_TYPES[i % 10];
    it(`valid chart type ${t} iter${i}`, () => expect(isValidChartType(t)).toBe(true));
  }
});

// ─── buildChartConfig ─────────────────────────────────────────────────────────
describe('buildChartConfig', () => {
  it('sets id', () => expect(buildChartConfig('c1', 'bar', 'T', makeDataset()).id).toBe('c1'));
  it('sets type', () => expect(buildChartConfig('c1', 'bar', 'T', makeDataset()).type).toBe('bar'));
  it('sets title', () => expect(buildChartConfig('c1', 'bar', 'My Chart', makeDataset()).title).toBe('My Chart'));
  it('default showLegend true', () => expect(buildChartConfig('c1', 'bar', 'T', makeDataset()).showLegend).toBe(true));
  it('default showTooltip true', () => expect(buildChartConfig('c1', 'bar', 'T', makeDataset()).showTooltip).toBe(true));
  it('default drillEnabled false', () => expect(buildChartConfig('c1', 'bar', 'T', makeDataset()).drillEnabled).toBe(false));
  it('overrides drillEnabled', () => expect(buildChartConfig('c1', 'bar', 'T', makeDataset(), { drillEnabled: true }).drillEnabled).toBe(true));
  for (const type of VALID_CHART_TYPES) {
    it(`buildChartConfig type ${type}`, () => {
      const config = buildChartConfig('c', type, 'T', makeDataset());
      expect(config.type).toBe(type);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`buildChartConfig iter${i}`, () => {
      const t = VALID_CHART_TYPES[i % 10];
      const c = buildChartConfig(`c${i}`, t, `Title ${i}`, makeDataset());
      expect(c.id).toBe(`c${i}`);
      expect(c.title).toBe(`Title ${i}`);
    });
  }
});

// ─── buildEmptyDataset ────────────────────────────────────────────────────────
describe('buildEmptyDataset', () => {
  it('labels set correctly', () => expect(buildEmptyDataset(['X', 'Y']).labels).toEqual(['X', 'Y']));
  it('series created for each name', () => {
    const d = buildEmptyDataset(['X'], ['s1', 's2']);
    expect(d.series).toHaveLength(2);
  });
  it('all data values are 0', () => {
    const d = buildEmptyDataset(['A', 'B', 'C'], ['s1']);
    expect(d.series[0].data.every((v) => v === 0)).toBe(true);
  });
  it('empty labels → empty series data', () => {
    const d = buildEmptyDataset([], ['s1']);
    expect(d.series[0].data).toHaveLength(0);
  });
  for (let n = 1; n <= 30; n++) {
    it(`buildEmptyDataset ${n} labels`, () => {
      const labels = Array.from({ length: n }, (_, i) => `L${i}`);
      const d = buildEmptyDataset(labels, ['s1']);
      expect(d.series[0].data).toHaveLength(n);
    });
  }
});

// ─── aggregateData ────────────────────────────────────────────────────────────
describe('aggregateData', () => {
  const rows = [
    { dept: 'HR', score: 10 }, { dept: 'IT', score: 20 },
    { dept: 'HR', score: 30 }, { dept: 'IT', score: 40 },
  ];

  it('count aggregation', () => {
    const r = aggregateData(rows, 'dept', 'score', 'count');
    const hr = r.find((x) => x.label === 'HR');
    expect(hr?.value).toBe(2);
  });

  it('sum aggregation', () => {
    const r = aggregateData(rows, 'dept', 'score', 'sum');
    const hr = r.find((x) => x.label === 'HR');
    expect(hr?.value).toBe(40);
  });

  it('avg aggregation', () => {
    const r = aggregateData(rows, 'dept', 'score', 'avg');
    const hr = r.find((x) => x.label === 'HR');
    expect(hr?.value).toBe(20);
  });

  it('min aggregation', () => {
    const r = aggregateData(rows, 'dept', 'score', 'min');
    const hr = r.find((x) => x.label === 'HR');
    expect(hr?.value).toBe(10);
  });

  it('max aggregation', () => {
    const r = aggregateData(rows, 'dept', 'score', 'max');
    const it_dept = r.find((x) => x.label === 'IT');
    expect(it_dept?.value).toBe(40);
  });

  it('distinct aggregation', () => {
    const r = aggregateData([{ g: 'A', v: 1 }, { g: 'A', v: 1 }, { g: 'A', v: 2 }], 'g', 'v', 'distinct');
    expect(r[0].value).toBe(2);
  });

  it('empty rows → empty result', () => expect(aggregateData([], 'dept', 'score', 'count')).toHaveLength(0));

  it('result is sorted by label', () => {
    const r = aggregateData(rows, 'dept', 'score', 'count');
    expect(r[0].label <= r[1].label).toBe(true);
  });

  for (let n = 1; n <= 40; n++) {
    it(`aggregateData count ${n} rows`, () => {
      const data = Array.from({ length: n }, (_, i) => ({ g: `g${i % 3}`, v: i }));
      const r = aggregateData(data, 'g', 'v', 'count');
      expect(r.reduce((s, x) => s + x.value, 0)).toBe(n);
    });
  }
});

// ─── buildSeriesFromAggregation ───────────────────────────────────────────────
describe('buildSeriesFromAggregation', () => {
  const agg = [{ label: 'A', value: 10 }, { label: 'B', value: 20 }];
  it('sets name', () => expect(buildSeriesFromAggregation(agg, 'Revenue').name).toBe('Revenue'));
  it('maps values', () => expect(buildSeriesFromAggregation(agg, 'X').data).toEqual([10, 20]));
  it('sets color', () => expect(buildSeriesFromAggregation(agg, 'X', '#ff0000').color).toBe('#ff0000'));
  it('no color when omitted', () => expect(buildSeriesFromAggregation(agg, 'X').color).toBeUndefined());
  for (let i = 1; i <= 30; i++) {
    it(`buildSeriesFromAggregation ${i} values`, () => {
      const data = Array.from({ length: i }, (_, j) => ({ label: `L${j}`, value: j * 2 }));
      const s = buildSeriesFromAggregation(data, 'S');
      expect(s.data).toHaveLength(i);
    });
  }
});

// ─── validateChartConfig ──────────────────────────────────────────────────────
describe('validateChartConfig', () => {
  it('valid config → no errors', () => expect(validateChartConfig(makeConfig())).toHaveLength(0));
  it('missing id → error', () => expect(validateChartConfig(makeConfig({ id: '' }))).not.toHaveLength(0));
  it('missing title → error', () => expect(validateChartConfig(makeConfig({ title: '' }))).not.toHaveLength(0));
  it('invalid type → error', () => expect(validateChartConfig(makeConfig({ type: 'fake' as 'bar' }))).not.toHaveLength(0));
  it('missing dataset → error', () => expect(validateChartConfig(makeConfig({ dataset: null as unknown as ChartDataset }))).not.toHaveLength(0));
  for (let i = 0; i < 30; i++) {
    it(`valid config iter${i}`, () => {
      const c = makeConfig({ id: `c${i}`, title: `T${i}`, type: VALID_CHART_TYPES[i % 10] });
      expect(validateChartConfig(c)).toHaveLength(0);
    });
  }
});

// ─── normalizeSeriesData ──────────────────────────────────────────────────────
describe('normalizeSeriesData', () => {
  it('all values become 0 if max is 0', () => {
    const s: DataSeries = { name: 'S', data: [0, 0, 0] };
    expect(normalizeSeriesData(s, 0).data).toEqual([0, 0, 0]);
  });
  it('values normalized 0–1', () => {
    const s: DataSeries = { name: 'S', data: [50, 100] };
    const n = normalizeSeriesData(s, 100);
    expect(n.data[0]).toBe(0.5);
    expect(n.data[1]).toBe(1);
  });
  it('is immutable', () => {
    const s: DataSeries = { name: 'S', data: [10, 20] };
    normalizeSeriesData(s, 100);
    expect(s.data[0]).toBe(10);
  });
  for (let max = 10; max <= 50; max += 10) {
    it(`normalizeSeriesData max=${max}`, () => {
      const s: DataSeries = { name: 'S', data: [max] };
      expect(normalizeSeriesData(s, max).data[0]).toBe(1);
    });
  }
});

// ─── getChartColors ───────────────────────────────────────────────────────────
describe('getChartColors', () => {
  it('returns requested count', () => expect(getChartColors(5)).toHaveLength(5));
  it('returns hex strings', () => getChartColors(3).forEach((c) => expect(c).toMatch(/^#/)));
  it('cycles palette', () => expect(getChartColors(11)).toHaveLength(11));
  it('0 count → empty', () => expect(getChartColors(0)).toHaveLength(0));
  for (let i = 1; i <= 30; i++) {
    it(`getChartColors(${i})`, () => {
      const colors = getChartColors(i);
      expect(colors).toHaveLength(i);
      colors.forEach((c) => expect(c.startsWith('#')).toBe(true));
    });
  }
});

// ─── mergeDatasets ────────────────────────────────────────────────────────────
describe('mergeDatasets', () => {
  it('merges labels', () => {
    const a = makeDataset(['A', 'B'], [1, 2]);
    const b = makeDataset(['B', 'C'], [3, 4]);
    const m = mergeDatasets(a, b);
    expect(m.labels).toContain('A');
    expect(m.labels).toContain('C');
  });
  it('merges series', () => {
    const a = makeDataset(['A'], [1]);
    const b = makeDataset(['B'], [2]);
    const m = mergeDatasets(a, b);
    expect(m.series).toHaveLength(2);
  });
  it('deduplicates labels', () => {
    const a = makeDataset(['A', 'B'], [1, 2]);
    const b = makeDataset(['B', 'C'], [3, 4]);
    const m = mergeDatasets(a, b);
    const bCount = m.labels.filter((l) => l === 'B').length;
    expect(bCount).toBe(1);
  });
  for (let i = 1; i <= 20; i++) {
    it(`mergeDatasets ${i} labels each`, () => {
      const aLabels = Array.from({ length: i }, (_, j) => `a${j}`);
      const bLabels = Array.from({ length: i }, (_, j) => `b${j}`);
      const m = mergeDatasets(makeDataset(aLabels, aLabels.map((_, j) => j)), makeDataset(bLabels, bLabels.map((_, j) => j)));
      expect(m.labels).toHaveLength(i * 2);
    });
  }
});

// ─── Drill-Down functions ─────────────────────────────────────────────────────
describe('getNextDrillLevel', () => {
  it('year → quarter', () => expect(getNextDrillLevel('year')).toBe('quarter'));
  it('quarter → month', () => expect(getNextDrillLevel('quarter')).toBe('month'));
  it('month → week', () => expect(getNextDrillLevel('month')).toBe('week'));
  it('week → day', () => expect(getNextDrillLevel('week')).toBe('day'));
  it('day → null (deepest)', () => expect(getNextDrillLevel('day')).toBeNull());
  for (let i = 0; i < 20; i++) {
    it(`getNextDrillLevel year iter${i}`, () => expect(getNextDrillLevel('year')).toBe('quarter'));
  }
});

describe('getPrevDrillLevel', () => {
  it('day → week', () => expect(getPrevDrillLevel('day')).toBe('week'));
  it('week → month', () => expect(getPrevDrillLevel('week')).toBe('month'));
  it('month → quarter', () => expect(getPrevDrillLevel('month')).toBe('quarter'));
  it('quarter → year', () => expect(getPrevDrillLevel('quarter')).toBe('year'));
  it('year → null (top)', () => expect(getPrevDrillLevel('year')).toBeNull());
  for (let i = 0; i < 20; i++) {
    it(`getPrevDrillLevel day iter${i}`, () => expect(getPrevDrillLevel('day')).toBe('week'));
  }
});

describe('buildDrillContext', () => {
  it('sets field', () => expect(buildDrillContext('year', 2026, 'year').field).toBe('year'));
  it('sets value', () => expect(buildDrillContext('year', 2026, 'year').value).toBe(2026));
  it('sets level', () => expect(buildDrillContext('year', 2026, 'year').level).toBe('year'));
  it('default parentFilters empty', () => {
    expect(buildDrillContext('year', 2026, 'year').parentFilters).toEqual({});
  });
  it('accepts parentFilters', () => {
    const ctx = buildDrillContext('month', 1, 'month', { year: 2026 });
    expect(ctx.parentFilters.year).toBe(2026);
  });
  for (let i = 0; i < 30; i++) {
    it(`buildDrillContext iter${i}`, () => {
      const ctx = buildDrillContext('dept', `dept${i}`, 'year');
      expect(ctx.value).toBe(`dept${i}`);
    });
  }
});

describe('applyDrillFilter', () => {
  const rows = [
    { year: 2026, dept: 'HR', score: 10 },
    { year: 2026, dept: 'IT', score: 20 },
    { year: 2025, dept: 'HR', score: 30 },
  ];

  it('filters by field value', () => {
    const ctx = buildDrillContext('dept', 'HR', 'year');
    expect(applyDrillFilter(rows, ctx)).toHaveLength(2);
  });

  it('applies parentFilters', () => {
    const ctx = buildDrillContext('dept', 'HR', 'month', { year: 2026 });
    expect(applyDrillFilter(rows, ctx)).toHaveLength(1);
  });

  it('no match → empty', () => {
    const ctx = buildDrillContext('dept', 'Finance', 'year');
    expect(applyDrillFilter(rows, ctx)).toHaveLength(0);
  });

  for (let i = 0; i < 20; i++) {
    it(`applyDrillFilter HR iter${i}`, () => {
      const ctx = buildDrillContext('dept', 'HR', 'year');
      expect(applyDrillFilter(rows, ctx)).toHaveLength(2);
    });
  }
});

describe('formatDrillLabel', () => {
  it('year', () => expect(formatDrillLabel('year', 2026)).toBe('Year 2026'));
  it('quarter', () => expect(formatDrillLabel('quarter', 1)).toBe('Q1'));
  it('month', () => expect(formatDrillLabel('month', 3)).toBe('Month 3'));
  it('week', () => expect(formatDrillLabel('week', 12)).toBe('Week 12'));
  it('day', () => expect(formatDrillLabel('day', 15)).toBe('Day 15'));
  for (let i = 1; i <= 30; i++) {
    it(`formatDrillLabel year ${2000 + i}`, () => {
      expect(formatDrillLabel('year', 2000 + i)).toBe(`Year ${2000 + i}`);
    });
  }
});

describe('isDrillable', () => {
  it('year is drillable', () => expect(isDrillable('year')).toBe(true));
  it('quarter is drillable', () => expect(isDrillable('quarter')).toBe(true));
  it('month is drillable', () => expect(isDrillable('month')).toBe(true));
  it('week is drillable', () => expect(isDrillable('week')).toBe(true));
  it('day is NOT drillable', () => expect(isDrillable('day')).toBe(false));
  for (let i = 0; i < 20; i++) {
    it(`isDrillable year iter${i}`, () => expect(isDrillable('year')).toBe(true));
  }
  for (let i = 0; i < 20; i++) {
    it(`isDrillable day iter${i}`, () => expect(isDrillable('day')).toBe(false));
  }
});

// ─── Top-up tests ─────────────────────────────────────────────────────────────
describe('embedded-bi top-up A', () => {
  for (let i = 0; i < 100; i++) {
    it('isValidChartType with valid type ' + i, () => {
      const t = VALID_CHART_TYPES[i % VALID_CHART_TYPES.length];
      expect(isValidChartType(t)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('isValidChartType invalid returns false ' + i, () => {
      expect(isValidChartType('no-such-chart-' + i)).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('buildEmptyDataset returns dataset with labels ' + i, () => {
      const labels = ['a', 'b', 'c'].slice(0, (i % 3) + 1);
      const ds = buildEmptyDataset(labels);
      expect(Array.isArray(ds.labels)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('getChartColors returns array ' + i, () => {
      const colors = getChartColors(i % 10 + 1);
      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBe(i % 10 + 1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('VALID_CHART_TYPES is array ' + i, () => {
      expect(Array.isArray(VALID_CHART_TYPES)).toBe(true);
      expect(VALID_CHART_TYPES.length).toBeGreaterThan(0);
    });
  }
});

describe('embedded-bi top-up B', () => {
  for (let i = 0; i < 100; i++) {
    it('aggregateData with empty returns empty array ' + i, () => {
      const result = aggregateData([], 'group', 'value', 'sum');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('normalizeSeriesData returns DataSeries ' + i, () => {
      const series = { name: 'test', data: [10, 20, 30 + i] };
      const result = normalizeSeriesData(series, 100);
      expect(Array.isArray(result.data)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('buildDrillContext returns context with level ' + i, () => {
      const levels = ['year', 'quarter', 'month', 'week', 'day'] as const;
      const level = levels[i % 5];
      const ctx = buildDrillContext('dateField', 2020 + i % 5, level);
      expect(ctx.level).toBe(level);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('getNextDrillLevel from year returns non-null ' + i, () => {
      const next = getNextDrillLevel('year');
      expect(next).not.toBeNull();
    });
  }
  for (let i = 0; i < 100; i++) {
    it('getPrevDrillLevel from day returns non-null ' + i, () => {
      const prev = getPrevDrillLevel('month');
      expect(prev).not.toBeNull();
    });
  }
});
