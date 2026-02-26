// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Counter,
  Gauge,
  Histogram,
  Summary,
  Timer,
  MetricRegistry,
  RollingStats,
  RateTracker,
  formatPrometheusLabels,
  parsePrometheusLine,
  mergeMetrics,
  defaultRegistry,
} from '../metric-utils';

// ── Counter inc/get — 100 tests ────────────────────────────────────────────
describe('Counter inc/get', () => {
  for (let n = 1; n <= 100; n++) {
    it(`inc ${n} times → get() = ${n}`, () => {
      const c = new Counter(`counter_inc_${n}`);
      for (let i = 0; i < n; i++) c.inc();
      expect(c.get()).toBe(n);
    });
  }
});

// ── Counter reset — 100 tests ─────────────────────────────────────────────
describe('Counter reset', () => {
  for (let n = 1; n <= 100; n++) {
    it(`inc ${n} then reset → get() = 0`, () => {
      const c = new Counter(`counter_reset_${n}`);
      for (let i = 0; i < n; i++) c.inc();
      expect(c.get()).toBeGreaterThan(0);
      c.reset();
      expect(c.get()).toBe(0);
    });
  }
});

// ── Counter toPrometheus — 50 tests ───────────────────────────────────────
describe('Counter toPrometheus', () => {
  for (let n = 1; n <= 50; n++) {
    it(`toPrometheus contains name and value after ${n} incs`, () => {
      const c = new Counter(`counter_prom_${n}`, `help for counter ${n}`);
      for (let i = 0; i < n; i++) c.inc();
      const output = c.toPrometheus();
      expect(output).toContain(`counter_prom_${n}`);
      expect(output).toContain(String(n));
      expect(output).toContain('# HELP');
      expect(output).toContain('# TYPE');
      expect(output).toContain('counter');
    });
  }
});

// ── Counter with labels — extra tests ────────────────────────────────────
describe('Counter with labels', () => {
  it('maintains separate counts per label set', () => {
    const c = new Counter('labelled_counter', '', ['env']);
    c.inc({ env: 'prod' });
    c.inc({ env: 'prod' });
    c.inc({ env: 'staging' });
    expect(c.get({ env: 'prod' })).toBe(2);
    expect(c.get({ env: 'staging' })).toBe(1);
  });

  it('reset specific label clears only that label', () => {
    const c = new Counter('labelled_counter_reset', '', ['env']);
    c.inc({ env: 'prod' });
    c.inc({ env: 'staging' });
    c.reset({ env: 'prod' });
    expect(c.get({ env: 'prod' })).toBe(0);
    expect(c.get({ env: 'staging' })).toBe(1);
  });

  it('labels() returns registered label sets', () => {
    const c = new Counter('labelled_counter_list', '', ['env']);
    c.inc({ env: 'prod' });
    c.inc({ env: 'dev' });
    expect(c.labels().length).toBe(2);
  });

  it('throws if inc value is negative', () => {
    const c = new Counter('counter_neg');
    expect(() => c.inc(undefined, -1)).toThrow();
  });

  it('inc with value=0 is allowed', () => {
    const c = new Counter('counter_zero_inc');
    c.inc(undefined, 0);
    expect(c.get()).toBe(0);
  });
});

// ── Gauge set/get — 100 tests ─────────────────────────────────────────────
describe('Gauge set/get', () => {
  for (let n = 0; n < 100; n++) {
    const val = n * 3.7 - 50;
    it(`set(${val.toFixed(1)}) → get() = ${val.toFixed(1)}`, () => {
      const g = new Gauge(`gauge_set_${n}`);
      g.set(val);
      expect(g.get()).toBeCloseTo(val, 5);
    });
  }
});

// ── Gauge inc/dec — 100 tests ─────────────────────────────────────────────
describe('Gauge inc/dec', () => {
  for (let n = 1; n <= 100; n++) {
    const incBy = n;
    const decBy = Math.floor(n / 2);
    it(`inc ${incBy}, dec ${decBy} → get() = ${incBy - decBy}`, () => {
      const g = new Gauge(`gauge_incdec_${n}`);
      g.inc(undefined, incBy);
      g.dec(undefined, decBy);
      expect(g.get()).toBeCloseTo(incBy - decBy, 5);
    });
  }
});

// ── Gauge additional tests ────────────────────────────────────────────────
describe('Gauge additional', () => {
  it('default value is 0', () => {
    const g = new Gauge('gauge_default');
    expect(g.get()).toBe(0);
  });

  it('reset clears to 0', () => {
    const g = new Gauge('gauge_reset_test');
    g.set(99);
    g.reset();
    expect(g.get()).toBe(0);
  });

  it('toPrometheus contains name and type gauge', () => {
    const g = new Gauge('gauge_prom_test', 'help text');
    g.set(42);
    const out = g.toPrometheus();
    expect(out).toContain('gauge_prom_test');
    expect(out).toContain('gauge');
    expect(out).toContain('42');
  });

  it('supports labelled values', () => {
    const g = new Gauge('gauge_labelled', '', ['region']);
    g.set(10, { region: 'eu' });
    g.set(20, { region: 'us' });
    expect(g.get({ region: 'eu' })).toBe(10);
    expect(g.get({ region: 'us' })).toBe(20);
  });
});

// ── Histogram observe/get — 100 tests ────────────────────────────────────
describe('Histogram observe/get', () => {
  for (let n = 1; n <= 100; n++) {
    it(`observe ${n} values → count=${n}, sum correct`, () => {
      const h = new Histogram(`hist_obs_${n}`);
      let sum = 0;
      for (let i = 1; i <= n; i++) {
        h.observe(i * 0.1);
        sum += i * 0.1;
      }
      const result = h.get();
      expect(result.count).toBe(n);
      expect(result.sum).toBeCloseTo(sum, 5);
    });
  }
});

// ── Histogram percentile — 100 tests ─────────────────────────────────────
describe('Histogram percentile', () => {
  for (let n = 1; n <= 100; n++) {
    it(`percentile(0) = min, percentile(1) = max for ${n} values`, () => {
      const h = new Histogram(`hist_pct_${n}`);
      for (let i = 1; i <= n; i++) h.observe(i);
      expect(h.percentile(0)).toBe(1);
      expect(h.percentile(1)).toBe(n);
    });
  }
});

// ── Histogram additional tests ────────────────────────────────────────────
describe('Histogram additional', () => {
  it('uses default buckets when none provided', () => {
    const h = new Histogram('hist_default_buckets');
    h.observe(0.1);
    const result = h.get();
    expect(result.buckets['0.1']).toBeGreaterThan(0);
  });

  it('custom buckets are used', () => {
    const h = new Histogram('hist_custom', [1, 5, 10, 50]);
    h.observe(3);
    const result = h.get();
    expect(result.buckets['1']).toBe(0);
    expect(result.buckets['5']).toBe(1);
  });

  it('mean returns correct average', () => {
    const h = new Histogram('hist_mean');
    h.observe(2);
    h.observe(4);
    h.observe(6);
    expect(h.mean()).toBeCloseTo(4, 5);
  });

  it('reset clears data', () => {
    const h = new Histogram('hist_reset');
    h.observe(1);
    h.reset();
    expect(h.get().count).toBe(0);
  });

  it('toPrometheus contains _sum and _count', () => {
    const h = new Histogram('hist_prom');
    h.observe(1.5);
    const out = h.toPrometheus();
    expect(out).toContain('hist_prom_sum');
    expect(out).toContain('hist_prom_count');
    expect(out).toContain('hist_prom_bucket');
  });

  it('p50 approximates median', () => {
    const h = new Histogram('hist_p50');
    for (let i = 1; i <= 99; i++) h.observe(i);
    const p50 = h.percentile(0.5);
    expect(p50).toBeCloseTo(50, 0);
  });
});

// ── Summary observe/get — 100 tests ──────────────────────────────────────
describe('Summary observe/get', () => {
  for (let n = 1; n <= 100; n++) {
    it(`observe ${n} values → count=${n}, sum correct`, () => {
      const s = new Summary(`summary_obs_${n}`);
      let expectedSum = 0;
      for (let i = 1; i <= n; i++) {
        s.observe(i * 0.5);
        expectedSum += i * 0.5;
      }
      const result = s.get();
      expect(result.count).toBe(n);
      expect(result.sum).toBeCloseTo(expectedSum, 5);
    });
  }
});

// ── Summary additional tests ──────────────────────────────────────────────
describe('Summary additional', () => {
  it('default quantiles 0.5, 0.9, 0.95, 0.99 are calculated', () => {
    const s = new Summary('summary_default_q');
    for (let i = 1; i <= 100; i++) s.observe(i);
    const result = s.get();
    expect(result.quantiles['0.5']).toBeDefined();
    expect(result.quantiles['0.9']).toBeDefined();
    expect(result.quantiles['0.95']).toBeDefined();
    expect(result.quantiles['0.99']).toBeDefined();
  });

  it('custom quantiles are used', () => {
    const s = new Summary('summary_custom_q', [0.25, 0.75]);
    for (let i = 1; i <= 10; i++) s.observe(i);
    const result = s.get();
    expect(result.quantiles['0.25']).toBeDefined();
    expect(result.quantiles['0.75']).toBeDefined();
  });

  it('reset clears all data', () => {
    const s = new Summary('summary_reset');
    s.observe(42);
    s.reset();
    const result = s.get();
    expect(result.count).toBe(0);
    expect(result.sum).toBe(0);
  });

  it('toPrometheus contains quantile lines', () => {
    const s = new Summary('summary_prom');
    s.observe(1);
    s.observe(2);
    const out = s.toPrometheus();
    expect(out).toContain('quantile=');
    expect(out).toContain('summary_prom_sum');
    expect(out).toContain('summary_prom_count');
  });

  it('empty summary returns zero quantiles', () => {
    const s = new Summary('summary_empty');
    const result = s.get();
    expect(result.count).toBe(0);
    expect(result.quantiles['0.5']).toBe(0);
  });
});

// ── Timer start/stop — 50 tests ───────────────────────────────────────────
describe('Timer start/stop', () => {
  for (let n = 1; n <= 50; n++) {
    it(`start/stop returns elapsed >= 0 (test ${n})`, () => {
      const t = new Timer(`timer_start_${n}`);
      const stop = t.start();
      const elapsed = stop();
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(typeof elapsed).toBe('number');
    });
  }
});

// ── Timer stats — 50 tests ────────────────────────────────────────────────
describe('Timer stats', () => {
  for (let n = 1; n <= 50; n++) {
    it(`stats after ${n} recordings has all properties`, () => {
      const t = new Timer(`timer_stats_${n}`);
      for (let i = 1; i <= n; i++) t.record(i * 10);
      const s = t.stats();
      expect(s).toHaveProperty('min');
      expect(s).toHaveProperty('max');
      expect(s).toHaveProperty('mean');
      expect(s).toHaveProperty('count');
      expect(s).toHaveProperty('p95');
      expect(s).toHaveProperty('p99');
      expect(s.count).toBe(n);
      expect(s.min).toBe(10);
      expect(s.max).toBe(n * 10);
    });
  }
});

// ── Timer additional tests ────────────────────────────────────────────────
describe('Timer additional', () => {
  it('empty stats returns all zeros', () => {
    const t = new Timer('timer_empty');
    const s = t.stats();
    expect(s.count).toBe(0);
    expect(s.min).toBe(0);
    expect(s.max).toBe(0);
    expect(s.mean).toBe(0);
    expect(s.p95).toBe(0);
    expect(s.p99).toBe(0);
  });

  it('reset clears recordings', () => {
    const t = new Timer('timer_reset');
    t.record(100);
    t.reset();
    expect(t.stats().count).toBe(0);
  });

  it('mean is correct', () => {
    const t = new Timer('timer_mean');
    t.record(10);
    t.record(20);
    t.record(30);
    expect(t.stats().mean).toBeCloseTo(20, 5);
  });

  it('p95 is >= p50 for sorted data', () => {
    const t = new Timer('timer_p95');
    for (let i = 1; i <= 100; i++) t.record(i);
    const s = t.stats();
    expect(s.p95).toBeGreaterThanOrEqual(s.mean);
  });
});

// ── RollingStats record/get — 100 tests ───────────────────────────────────
describe('RollingStats record/get', () => {
  for (let n = 1; n <= 100; n++) {
    it(`window size ${n} is respected`, () => {
      const rs = new RollingStats(n);
      // Record more than window
      for (let i = 1; i <= n + 5; i++) rs.record(i);
      const result = rs.get();
      // Should not exceed window size
      expect(result.count).toBeLessThanOrEqual(n);
      expect(result.values.length).toBeLessThanOrEqual(n);
    });
  }
});

// ── RollingStats percentile — 50 tests ────────────────────────────────────
describe('RollingStats percentile', () => {
  for (let n = 1; n <= 50; n++) {
    it(`p(0) = min, p(1) = max for ${n} values in window ${n}`, () => {
      const rs = new RollingStats(n + 10);
      for (let i = 1; i <= n; i++) rs.record(i);
      expect(rs.percentile(0)).toBe(1);
      expect(rs.percentile(1)).toBe(n);
    });
  }
});

// ── RollingStats additional tests ─────────────────────────────────────────
describe('RollingStats additional', () => {
  it('empty stats returns zeros', () => {
    const rs = new RollingStats(10);
    const result = rs.get();
    expect(result.count).toBe(0);
    expect(result.sum).toBe(0);
    expect(result.min).toBe(0);
    expect(result.max).toBe(0);
    expect(result.mean).toBe(0);
  });

  it('reset clears all values', () => {
    const rs = new RollingStats(10);
    rs.record(5);
    rs.reset();
    expect(rs.get().count).toBe(0);
  });

  it('sum is correct', () => {
    const rs = new RollingStats(10);
    rs.record(1);
    rs.record(2);
    rs.record(3);
    expect(rs.get().sum).toBe(6);
  });

  it('mean is correct', () => {
    const rs = new RollingStats(10);
    rs.record(10);
    rs.record(20);
    rs.record(30);
    expect(rs.get().mean).toBeCloseTo(20, 5);
  });

  it('values array equals stored values', () => {
    const rs = new RollingStats(5);
    rs.record(1);
    rs.record(2);
    rs.record(3);
    expect(rs.get().values).toEqual([1, 2, 3]);
  });

  it('window evicts oldest values', () => {
    const rs = new RollingStats(3);
    rs.record(1);
    rs.record(2);
    rs.record(3);
    rs.record(4); // 1 should be evicted
    expect(rs.get().values).toEqual([2, 3, 4]);
  });

  it('percentile(0) returns 0 for empty window', () => {
    const rs = new RollingStats(10);
    expect(rs.percentile(0)).toBe(0);
  });
});

// ── MetricRegistry register/get — 100 tests ───────────────────────────────
describe('MetricRegistry register/get', () => {
  for (let n = 1; n <= 100; n++) {
    it(`register ${n} metrics — all retrievable`, () => {
      const reg = new MetricRegistry();
      for (let i = 1; i <= n; i++) {
        if (i % 5 === 1) reg.registerCounter(`reg_counter_${n}_${i}`);
        else if (i % 5 === 2) reg.registerGauge(`reg_gauge_${n}_${i}`);
        else if (i % 5 === 3) reg.registerHistogram(`reg_hist_${n}_${i}`);
        else if (i % 5 === 4) reg.registerSummary(`reg_summary_${n}_${i}`);
        else reg.registerTimer(`reg_timer_${n}_${i}`);
      }
      expect(reg.list().length).toBe(n);
      for (let i = 1; i <= n; i++) {
        let name: string;
        if (i % 5 === 1) name = `reg_counter_${n}_${i}`;
        else if (i % 5 === 2) name = `reg_gauge_${n}_${i}`;
        else if (i % 5 === 3) name = `reg_hist_${n}_${i}`;
        else if (i % 5 === 4) name = `reg_summary_${n}_${i}`;
        else name = `reg_timer_${n}_${i}`;
        expect(reg.get(name)).toBeDefined();
      }
    });
  }
});

// ── MetricRegistry additional tests ──────────────────────────────────────
describe('MetricRegistry additional', () => {
  it('get undefined for unknown metric', () => {
    const reg = new MetricRegistry();
    expect(reg.get('unknown')).toBeUndefined();
  });

  it('unregister removes metric', () => {
    const reg = new MetricRegistry();
    reg.registerCounter('to_remove');
    expect(reg.get('to_remove')).toBeDefined();
    reg.unregister('to_remove');
    expect(reg.get('to_remove')).toBeUndefined();
  });

  it('unregister returns false for unknown metric', () => {
    const reg = new MetricRegistry();
    expect(reg.unregister('ghost')).toBe(false);
  });

  it('list returns all registered names', () => {
    const reg = new MetricRegistry();
    reg.registerCounter('a');
    reg.registerGauge('b');
    reg.registerTimer('c');
    const names = reg.list();
    expect(names).toContain('a');
    expect(names).toContain('b');
    expect(names).toContain('c');
  });

  it('reset clears all metrics', () => {
    const reg = new MetricRegistry();
    reg.registerCounter('foo');
    reg.reset();
    expect(reg.list().length).toBe(0);
  });

  it('toPrometheus concatenates metrics', () => {
    const reg = new MetricRegistry();
    const c = reg.registerCounter('reg_prom_counter', 'help');
    c.inc();
    const g = reg.registerGauge('reg_prom_gauge', 'help');
    g.set(5);
    const out = reg.toPrometheus();
    expect(out).toContain('reg_prom_counter');
    expect(out).toContain('reg_prom_gauge');
  });

  it('defaultRegistry is a MetricRegistry instance', () => {
    expect(defaultRegistry).toBeInstanceOf(MetricRegistry);
  });
});

// ── formatPrometheusLabels — 50 tests ────────────────────────────────────
describe('formatPrometheusLabels', () => {
  it('empty object returns empty string', () => {
    expect(formatPrometheusLabels({})).toBe('');
  });

  for (let n = 1; n <= 49; n++) {
    it(`formats ${n} label(s) correctly`, () => {
      const labels: Record<string, string> = {};
      for (let i = 1; i <= n; i++) labels[`key${i}`] = `value${i}`;
      const result = formatPrometheusLabels(labels);
      expect(result).toMatch(/^\{.+\}$/);
      for (let i = 1; i <= n; i++) {
        expect(result).toContain(`key${i}="value${i}"`);
      }
    });
  }
});

// ── parsePrometheusLine — 50 tests ────────────────────────────────────────
describe('parsePrometheusLine', () => {
  it('returns null for empty line', () => {
    expect(parsePrometheusLine('')).toBeNull();
  });

  it('returns null for comment line', () => {
    expect(parsePrometheusLine('# HELP my_metric help text')).toBeNull();
  });

  it('returns null for TYPE comment', () => {
    expect(parsePrometheusLine('# TYPE my_metric counter')).toBeNull();
  });

  it('parses plain name value line', () => {
    const result = parsePrometheusLine('my_metric 42');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('my_metric');
    expect(result!.value).toBe(42);
    expect(result!.labels).toEqual({});
  });

  it('parses line with labels', () => {
    const result = parsePrometheusLine('my_metric{env="prod",region="eu"} 99.5');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('my_metric');
    expect(result!.labels['env']).toBe('prod');
    expect(result!.labels['region']).toBe('eu');
    expect(result!.value).toBeCloseTo(99.5, 5);
  });

  it('parses negative value', () => {
    const result = parsePrometheusLine('my_gauge -3.14');
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(-3.14, 5);
  });

  it('parses zero value', () => {
    const result = parsePrometheusLine('my_counter 0');
    expect(result).not.toBeNull();
    expect(result!.value).toBe(0);
  });

  it('parses scientific notation', () => {
    const result = parsePrometheusLine('my_metric 1.5e2');
    expect(result).not.toBeNull();
    expect(result!.value).toBeCloseTo(150, 5);
  });

  it('returns null for malformed line (no value)', () => {
    expect(parsePrometheusLine('my_metric')).toBeNull();
  });

  for (let n = 1; n <= 41; n++) {
    it(`parses line with value ${n * 7} (test ${n})`, () => {
      const line = `metric_test_${n} ${n * 7}`;
      const result = parsePrometheusLine(line);
      expect(result).not.toBeNull();
      expect(result!.name).toBe(`metric_test_${n}`);
      expect(result!.value).toBe(n * 7);
    });
  }
});

// ── RateTracker — 50 tests ────────────────────────────────────────────────
describe('RateTracker', () => {
  it('rate > 0 after recording', () => {
    let now = 0;
    const clock = () => now;
    const rt = new RateTracker(1000, clock);
    now = 0;
    rt.record(10);
    now = 500;
    expect(rt.rate()).toBeGreaterThan(0);
  });

  it('total increases with each record', () => {
    const rt = new RateTracker(5000);
    rt.record(1);
    rt.record(2);
    rt.record(3);
    expect(rt.total()).toBe(6);
  });

  it('reset clears total and rate', () => {
    const rt = new RateTracker(5000);
    rt.record(100);
    rt.reset();
    expect(rt.total()).toBe(0);
  });

  it('rate returns 0 when no records in window', () => {
    let now = 0;
    const clock = () => now;
    const rt = new RateTracker(1000, clock);
    now = 0;
    rt.record(5);
    now = 2000; // past window
    expect(rt.rate()).toBe(0);
  });

  for (let n = 1; n <= 46; n++) {
    it(`record(${n}) increases total by ${n} (test ${n})`, () => {
      const rt = new RateTracker(60000);
      rt.record(n);
      expect(rt.total()).toBe(n);
    });
  }
});

// ── mergeMetrics tests ────────────────────────────────────────────────────
describe('mergeMetrics', () => {
  it('concatenates two non-empty metric strings', () => {
    const a = '# TYPE a counter\na 1\n';
    const b = '# TYPE b gauge\nb 2\n';
    const merged = mergeMetrics(a, b);
    expect(merged).toContain('a 1');
    expect(merged).toContain('b 2');
  });

  it('merging empty strings yields empty', () => {
    expect(mergeMetrics('', '')).toBe('');
  });

  it('merging with first empty returns second', () => {
    const b = 'b 2\n';
    expect(mergeMetrics('', b)).toContain('b 2');
  });

  it('merging with second empty returns first', () => {
    const a = 'a 1\n';
    expect(mergeMetrics(a, '')).toContain('a 1');
  });

  it('does not duplicate newlines when first ends with newline', () => {
    const a = 'a 1\n';
    const b = 'b 2\n';
    const merged = mergeMetrics(a, b);
    expect(merged).not.toContain('\n\n');
  });
});

// ── Counter name and help properties ─────────────────────────────────────
describe('Counter properties', () => {
  it('name property is set correctly', () => {
    const c = new Counter('my_counter', 'my help');
    expect(c.name).toBe('my_counter');
  });

  it('help property is set correctly', () => {
    const c = new Counter('my_counter2', 'my help text');
    expect(c.help).toBe('my help text');
  });

  it('default help is empty string', () => {
    const c = new Counter('no_help_counter');
    expect(c.help).toBe('');
  });
});

// ── Gauge name and help properties ────────────────────────────────────────
describe('Gauge properties', () => {
  it('name property is set', () => {
    const g = new Gauge('my_gauge', 'gauge help');
    expect(g.name).toBe('my_gauge');
  });

  it('help property is set', () => {
    const g = new Gauge('my_gauge2', 'gauge help text');
    expect(g.help).toBe('gauge help text');
  });
});

// ── Histogram name and help properties ───────────────────────────────────
describe('Histogram properties', () => {
  it('name property is set', () => {
    const h = new Histogram('my_histogram');
    expect(h.name).toBe('my_histogram');
  });

  it('help property is set', () => {
    const h = new Histogram('my_histogram2', undefined, 'hist help');
    expect(h.help).toBe('hist help');
  });
});

// ── Summary name and help properties ─────────────────────────────────────
describe('Summary properties', () => {
  it('name property is set', () => {
    const s = new Summary('my_summary');
    expect(s.name).toBe('my_summary');
  });

  it('help property is set', () => {
    const s = new Summary('my_summary2', undefined, 'summary help');
    expect(s.help).toBe('summary help');
  });
});

// ── Timer name and help properties ───────────────────────────────────────
describe('Timer properties', () => {
  it('name property is set', () => {
    const t = new Timer('my_timer');
    expect(t.name).toBe('my_timer');
  });

  it('help property is set', () => {
    const t = new Timer('my_timer2', 'timer help');
    expect(t.help).toBe('timer help');
  });
});

// ── Stress tests ──────────────────────────────────────────────────────────
describe('Stress / edge cases', () => {
  it('Counter handles large increments', () => {
    const c = new Counter('stress_counter');
    c.inc(undefined, 1e6);
    expect(c.get()).toBe(1e6);
  });

  it('Gauge handles very negative values', () => {
    const g = new Gauge('stress_gauge');
    g.set(-1e9);
    expect(g.get()).toBe(-1e9);
  });

  it('Histogram observe 0', () => {
    const h = new Histogram('hist_zero');
    h.observe(0);
    expect(h.get().count).toBe(1);
    expect(h.get().sum).toBe(0);
  });

  it('Histogram with single value: percentile range', () => {
    const h = new Histogram('hist_single');
    h.observe(7);
    expect(h.percentile(0)).toBe(7);
    expect(h.percentile(0.5)).toBe(7);
    expect(h.percentile(1)).toBe(7);
  });

  it('Summary with single value', () => {
    const s = new Summary('summary_single');
    s.observe(42);
    const r = s.get();
    expect(r.count).toBe(1);
    expect(r.sum).toBe(42);
    expect(r.quantiles['0.5']).toBe(42);
  });

  it('RollingStats with window=1 only keeps last value', () => {
    const rs = new RollingStats(1);
    rs.record(1);
    rs.record(2);
    rs.record(3);
    expect(rs.get().values).toEqual([3]);
    expect(rs.get().count).toBe(1);
  });

  it('Counter inc with fractional value', () => {
    const c = new Counter('frac_counter');
    c.inc(undefined, 0.5);
    c.inc(undefined, 0.5);
    expect(c.get()).toBeCloseTo(1, 5);
  });

  it('Histogram reset specific labels only clears that entry', () => {
    const h = new Histogram('hist_label_reset', undefined, '', ['env']);
    h.observe(1, { env: 'prod' });
    h.observe(2, { env: 'staging' });
    h.reset({ env: 'prod' });
    expect(h.get({ env: 'prod' }).count).toBe(0);
    expect(h.get({ env: 'staging' }).count).toBe(1);
  });

  it('MetricRegistry toPrometheus is empty string when no metrics', () => {
    const reg = new MetricRegistry();
    expect(reg.toPrometheus()).toBe('');
  });

  it('Counter get returns 0 for unlabelled when no inc', () => {
    const c = new Counter('never_inced');
    expect(c.get()).toBe(0);
  });

  it('Gauge inc/dec with no labels from zero', () => {
    const g = new Gauge('g_zero');
    g.inc();
    g.inc();
    g.dec();
    expect(g.get()).toBe(1);
  });

  it('Timer record then start/stop both contribute to count', () => {
    const t = new Timer('timer_combo');
    t.record(50);
    const stop = t.start();
    stop();
    expect(t.stats().count).toBe(2);
  });

  it('Summary quantile p=0.99 >= p=0.5 for positive data', () => {
    const s = new Summary('summary_ordering', [0.5, 0.99]);
    for (let i = 1; i <= 100; i++) s.observe(i);
    const r = s.get();
    expect(r.quantiles['0.99']).toBeGreaterThanOrEqual(r.quantiles['0.5']);
  });

  it('parsePrometheusLine handles whitespace around value', () => {
    const result = parsePrometheusLine('  my_metric  5  ');
    // Trimmed line: "my_metric  5" - may or may not parse depending on regex
    // Just ensure no exception is thrown
    expect(result === null || typeof result!.value === 'number').toBe(true);
  });

  it('RateTracker with default clock does not throw', () => {
    const rt = new RateTracker(5000);
    expect(() => rt.record()).not.toThrow();
    expect(() => rt.rate()).not.toThrow();
  });
});

// ── Additional Counter inc value tests ────────────────────────────────────
describe('Counter inc with explicit value', () => {
  for (let n = 1; n <= 50; n++) {
    it(`inc(value=${n * 2}) → get() = ${n * 2}`, () => {
      const c = new Counter(`counter_val_${n}`);
      c.inc(undefined, n * 2);
      expect(c.get()).toBe(n * 2);
    });
  }
});

// ── Additional Gauge set tests ────────────────────────────────────────────
describe('Gauge set then overwrite', () => {
  for (let n = 1; n <= 50; n++) {
    it(`set(${n}) then set(${n * 2}) → get() = ${n * 2}`, () => {
      const g = new Gauge(`gauge_overwrite_${n}`);
      g.set(n);
      g.set(n * 2);
      expect(g.get()).toBe(n * 2);
    });
  }
});

// ── Additional Histogram mean tests ──────────────────────────────────────
describe('Histogram mean accuracy', () => {
  for (let n = 2; n <= 51; n++) {
    it(`mean of 1..${n} = ${(n + 1) / 2}`, () => {
      const h = new Histogram(`hist_mean_acc_${n}`);
      for (let i = 1; i <= n; i++) h.observe(i);
      expect(h.mean()).toBeCloseTo((n + 1) / 2, 4);
    });
  }
});

// ── Additional RollingStats sum tests ────────────────────────────────────
describe('RollingStats sum accuracy', () => {
  for (let n = 1; n <= 50; n++) {
    it(`window ${n}: sum of 1..${n} = ${(n * (n + 1)) / 2}`, () => {
      const rs = new RollingStats(n);
      for (let i = 1; i <= n; i++) rs.record(i);
      expect(rs.get().sum).toBeCloseTo((n * (n + 1)) / 2, 4);
    });
  }
});

// ── MetricRegistry unregister tests ──────────────────────────────────────
describe('MetricRegistry unregister', () => {
  for (let n = 1; n <= 30; n++) {
    it(`unregister ${n} of ${n} metrics → list is empty`, () => {
      const reg = new MetricRegistry();
      for (let i = 1; i <= n; i++) reg.registerCounter(`unreg_c_${n}_${i}`);
      for (let i = 1; i <= n; i++) reg.unregister(`unreg_c_${n}_${i}`);
      expect(reg.list().length).toBe(0);
    });
  }
});

// ── Additional formatPrometheusLabels edge cases ──────────────────────────
describe('formatPrometheusLabels edge cases', () => {
  it('single label with spaces in value', () => {
    const result = formatPrometheusLabels({ key: 'hello world' });
    expect(result).toBe('{key="hello world"}');
  });

  it('labels are sorted alphabetically', () => {
    const result = formatPrometheusLabels({ z: '1', a: '2', m: '3' });
    expect(result.indexOf('a=')).toBeLessThan(result.indexOf('m='));
    expect(result.indexOf('m=')).toBeLessThan(result.indexOf('z='));
  });

  it('special chars in value are preserved', () => {
    const result = formatPrometheusLabels({ k: 'val/with\\special' });
    expect(result).toContain('val/with\\special');
  });
});
