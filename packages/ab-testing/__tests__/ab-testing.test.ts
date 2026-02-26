import {
  createVariant,
  createExperiment,
  totalWeight,
  normaliseWeights,
  assignVariant,
  startExperiment,
  pauseExperiment,
  completeExperiment,
  isExperimentActive,
  computeVariantStats,
  computeResults,
  isValidStatus,
  isValidMetric,
  filterActiveExperiments,
  getExperimentById,
  makeEvent,
} from '../src/index';

import type {
  Variant,
  Experiment,
  ExperimentEvent,
  MetricType,
  ExperimentStatus,
  VariantType,
} from '../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeVariant(overrides: Partial<Variant> = {}): Variant {
  return createVariant(
    overrides.id ?? 'v1',
    overrides.name ?? 'Control',
    overrides.type ?? 'control',
    overrides.weight ?? 50,
    overrides.config,
  );
}

function makeDraftExperiment(overrides: Partial<Experiment> = {}): Experiment {
  const variants = overrides.variants ?? [
    makeVariant({ id: 'control', name: 'Control', type: 'control', weight: 50 }),
    makeVariant({ id: 'treatment', name: 'Treatment', type: 'treatment', weight: 50 }),
  ];
  const metrics = overrides.metrics ?? ['conversion'];
  return {
    ...createExperiment(overrides.id ?? 'exp1', overrides.name ?? 'Test Experiment', variants, metrics),
    ...overrides,
  };
}

function makeRunningExperiment(overrides: Partial<Experiment> = {}): Experiment {
  return startExperiment(makeDraftExperiment(overrides));
}

function makeConversionEvent(
  userId: string,
  experimentId: string,
  variantId: string,
  value = 1,
): ExperimentEvent {
  return makeEvent(userId, experimentId, variantId, 'conversion', value);
}

function makeRevenueEvent(
  userId: string,
  experimentId: string,
  variantId: string,
  value: number,
): ExperimentEvent {
  return makeEvent(userId, experimentId, variantId, 'revenue', value);
}

// ---------------------------------------------------------------------------
// 1. createVariant
// ---------------------------------------------------------------------------

describe('createVariant', () => {
  it('sets id', () => {
    expect(createVariant('abc', 'A', 'control', 50).id).toBe('abc');
  });
  it('sets name', () => {
    expect(createVariant('v1', 'My Variant', 'control', 50).name).toBe('My Variant');
  });
  it('sets type control', () => {
    expect(createVariant('v1', 'A', 'control', 50).type).toBe('control');
  });
  it('sets type treatment', () => {
    expect(createVariant('v1', 'A', 'treatment', 50).type).toBe('treatment');
  });
  it('sets weight 0', () => {
    expect(createVariant('v1', 'A', 'control', 0).weight).toBe(0);
  });
  it('sets weight 100', () => {
    expect(createVariant('v1', 'A', 'control', 100).weight).toBe(100);
  });
  it('sets weight 50', () => {
    expect(createVariant('v1', 'A', 'control', 50).weight).toBe(50);
  });
  it('omits config when not provided', () => {
    expect(createVariant('v1', 'A', 'control', 50).config).toBeUndefined();
  });
  it('stores config when provided', () => {
    const cfg = { theme: 'blue', size: 42 };
    expect(createVariant('v1', 'A', 'control', 50, cfg).config).toEqual(cfg);
  });
  it('stores nested config', () => {
    const cfg = { nested: { deep: true } };
    expect(createVariant('v1', 'A', 'control', 50, cfg).config).toEqual(cfg);
  });
  it('stores empty config object', () => {
    expect(createVariant('v1', 'A', 'control', 50, {}).config).toEqual({});
  });

  // Parameterised: various weights
  const weights = [0, 1, 10, 25, 33, 50, 66, 75, 90, 99, 100];
  weights.forEach(w => {
    it(`stores weight ${w}`, () => {
      expect(createVariant('v', 'N', 'control', w).weight).toBe(w);
    });
  });

  // Parameterised: variant types
  const types: VariantType[] = ['control', 'treatment'];
  types.forEach(t => {
    it(`stores type '${t}'`, () => {
      expect(createVariant('v', 'N', t, 50).type).toBe(t);
    });
  });

  // Parameterised: ids
  const ids = ['a', 'variant-1', 'VAR_XYZ', '123', 'very-long-id-with-dashes-and-numbers-001'];
  ids.forEach(id => {
    it(`stores id '${id}'`, () => {
      expect(createVariant(id, 'N', 'control', 50).id).toBe(id);
    });
  });

  // Parameterised: config shapes
  const configs: Array<Record<string, unknown>> = [
    { a: 1 },
    { flag: true },
    { label: 'hello' },
    { n: null },
    { arr: [1, 2, 3] },
    { fn: 'noop' },
    { deep: { x: { y: 1 } } },
  ];
  configs.forEach((cfg, i) => {
    it(`stores config shape ${i}`, () => {
      expect(createVariant('v', 'N', 'control', 50, cfg).config).toEqual(cfg);
    });
  });
});

// ---------------------------------------------------------------------------
// 2. createExperiment
// ---------------------------------------------------------------------------

describe('createExperiment', () => {
  it('sets id', () => {
    expect(createExperiment('e1', 'Test', [], ['conversion']).id).toBe('e1');
  });
  it('sets name', () => {
    expect(createExperiment('e1', 'My Exp', [], ['conversion']).name).toBe('My Exp');
  });
  it('sets status to draft', () => {
    expect(createExperiment('e1', 'Test', [], ['conversion']).status).toBe('draft');
  });
  it('sets variants array', () => {
    const variants = [makeVariant()];
    expect(createExperiment('e1', 'Test', variants, ['conversion']).variants).toEqual(variants);
  });
  it('sets metrics array', () => {
    const metrics: MetricType[] = ['conversion', 'revenue'];
    expect(createExperiment('e1', 'Test', [], metrics).metrics).toEqual(metrics);
  });
  it('sets createdAt as a number', () => {
    expect(typeof createExperiment('e1', 'Test', [], ['conversion']).createdAt).toBe('number');
  });
  it('createdAt is approximately now', () => {
    const before = Date.now();
    const exp = createExperiment('e1', 'Test', [], ['conversion']);
    const after = Date.now();
    expect(exp.createdAt).toBeGreaterThanOrEqual(before);
    expect(exp.createdAt).toBeLessThanOrEqual(after);
  });
  it('description is undefined by default', () => {
    expect(createExperiment('e1', 'Test', [], ['conversion']).description).toBeUndefined();
  });
  it('startDate is undefined by default', () => {
    expect(createExperiment('e1', 'Test', [], ['conversion']).startDate).toBeUndefined();
  });
  it('endDate is undefined by default', () => {
    expect(createExperiment('e1', 'Test', [], ['conversion']).endDate).toBeUndefined();
  });
  it('targetAudience is undefined by default', () => {
    expect(createExperiment('e1', 'Test', [], ['conversion']).targetAudience).toBeUndefined();
  });
  it('accepts empty variants array', () => {
    expect(createExperiment('e1', 'Test', [], ['conversion']).variants).toHaveLength(0);
  });
  it('accepts multiple variants', () => {
    const variants = [makeVariant({ id: 'a' }), makeVariant({ id: 'b' }), makeVariant({ id: 'c' })];
    expect(createExperiment('e1', 'Test', variants, ['conversion']).variants).toHaveLength(3);
  });

  // Parameterised: all metric types
  const allMetrics: MetricType[] = ['conversion', 'revenue', 'engagement', 'retention', 'custom'];
  allMetrics.forEach(m => {
    it(`stores metric '${m}'`, () => {
      expect(createExperiment('e1', 'Test', [], [m]).metrics).toContain(m);
    });
  });

  // Parameterised: multiple metric combinations
  const metricCombos: MetricType[][] = [
    ['conversion'],
    ['revenue'],
    ['conversion', 'revenue'],
    ['engagement', 'retention'],
    ['conversion', 'revenue', 'engagement', 'retention', 'custom'],
  ];
  metricCombos.forEach((combo, i) => {
    it(`stores metric combo ${i}: [${combo.join(', ')}]`, () => {
      expect(createExperiment('e1', 'Test', [], combo).metrics).toEqual(combo);
    });
  });

  // Parameterised: experiment names
  const names = ['Exp A', 'Button Color Test', 'Checkout Flow v2', 'Pricing Page'];
  names.forEach(n => {
    it(`stores name '${n}'`, () => {
      expect(createExperiment('e1', n, [], ['conversion']).name).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 3. totalWeight
// ---------------------------------------------------------------------------

describe('totalWeight', () => {
  it('returns 0 for empty array', () => {
    expect(totalWeight([])).toBe(0);
  });
  it('returns weight of single variant', () => {
    expect(totalWeight([makeVariant({ weight: 60 })])).toBe(60);
  });
  it('sums two variants', () => {
    expect(totalWeight([makeVariant({ weight: 50 }), makeVariant({ weight: 50 })])).toBe(100);
  });
  it('sums three variants', () => {
    const vs = [makeVariant({ weight: 25 }), makeVariant({ weight: 25 }), makeVariant({ weight: 50 })];
    expect(totalWeight(vs)).toBe(100);
  });
  it('handles weight 0', () => {
    expect(totalWeight([makeVariant({ weight: 0 }), makeVariant({ weight: 0 })])).toBe(0);
  });
  it('handles non-round numbers', () => {
    const vs = [makeVariant({ weight: 33.3 }), makeVariant({ weight: 33.3 }), makeVariant({ weight: 33.4 })];
    expect(totalWeight(vs)).toBeCloseTo(100, 5);
  });

  // Parameterised: single-variant weights
  const singleWeights = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  singleWeights.forEach(w => {
    it(`totalWeight([${w}]) === ${w}`, () => {
      expect(totalWeight([makeVariant({ weight: w })])).toBe(w);
    });
  });

  // Parameterised: pairs
  const pairs: [number, number][] = [
    [0, 100], [50, 50], [30, 70], [20, 80], [10, 90], [1, 99],
  ];
  pairs.forEach(([a, b]) => {
    it(`totalWeight([${a}, ${b}]) === ${a + b}`, () => {
      expect(totalWeight([makeVariant({ weight: a }), makeVariant({ weight: b })])).toBe(a + b);
    });
  });

  // Parameterised: triples
  const triples: [number, number, number][] = [
    [33, 33, 34], [25, 25, 50], [10, 20, 70], [40, 40, 20],
  ];
  triples.forEach(([a, b, c]) => {
    it(`totalWeight([${a}, ${b}, ${c}]) === ${a + b + c}`, () => {
      const vs = [makeVariant({ weight: a }), makeVariant({ weight: b }), makeVariant({ weight: c })];
      expect(totalWeight(vs)).toBe(a + b + c);
    });
  });
});

// ---------------------------------------------------------------------------
// 4. normaliseWeights
// ---------------------------------------------------------------------------

describe('normaliseWeights', () => {
  it('returns same array structure for empty input', () => {
    expect(normaliseWeights([])).toEqual([]);
  });
  it('returns variants unchanged if total is 0 (avoids NaN)', () => {
    const vs = [makeVariant({ weight: 0 }), makeVariant({ weight: 0 })];
    const result = normaliseWeights(vs);
    expect(result[0].weight).toBe(0);
    expect(result[1].weight).toBe(0);
  });
  it('normalises two equal variants to 50/50', () => {
    const vs = [makeVariant({ id: 'a', weight: 1 }), makeVariant({ id: 'b', weight: 1 })];
    const result = normaliseWeights(vs);
    expect(result[0].weight).toBeCloseTo(50, 5);
    expect(result[1].weight).toBeCloseTo(50, 5);
  });
  it('normalises already-100% input unchanged', () => {
    const vs = [makeVariant({ id: 'a', weight: 50 }), makeVariant({ id: 'b', weight: 50 })];
    const result = normaliseWeights(vs);
    expect(result[0].weight).toBeCloseTo(50, 5);
    expect(result[1].weight).toBeCloseTo(50, 5);
  });
  it('normalises single variant to 100%', () => {
    const vs = [makeVariant({ weight: 7 })];
    const result = normaliseWeights(vs);
    expect(result[0].weight).toBeCloseTo(100, 5);
  });
  it('total of normalised weights is 100', () => {
    const vs = [makeVariant({ id: 'a', weight: 30 }), makeVariant({ id: 'b', weight: 70 })];
    const result = normaliseWeights(vs);
    expect(totalWeight(result)).toBeCloseTo(100, 5);
  });
  it('does not mutate original variants', () => {
    const vs = [makeVariant({ id: 'a', weight: 25 }), makeVariant({ id: 'b', weight: 75 })];
    const origWeights = vs.map(v => v.weight);
    normaliseWeights(vs);
    expect(vs.map(v => v.weight)).toEqual(origWeights);
  });
  it('preserves ids after normalisation', () => {
    const vs = [makeVariant({ id: 'alpha', weight: 30 }), makeVariant({ id: 'beta', weight: 70 })];
    const result = normaliseWeights(vs);
    expect(result[0].id).toBe('alpha');
    expect(result[1].id).toBe('beta');
  });
  it('preserves names after normalisation', () => {
    const vs = [makeVariant({ id: 'a', name: 'Control', weight: 40 }), makeVariant({ id: 'b', name: 'Treatment', weight: 60 })];
    const result = normaliseWeights(vs);
    expect(result[0].name).toBe('Control');
    expect(result[1].name).toBe('Treatment');
  });
  it('preserves types after normalisation', () => {
    const vs = [makeVariant({ id: 'a', type: 'control', weight: 40 }), makeVariant({ id: 'b', type: 'treatment', weight: 60 })];
    const result = normaliseWeights(vs);
    expect(result[0].type).toBe('control');
    expect(result[1].type).toBe('treatment');
  });

  // Parameterised: various weight totals that should normalise to 100
  const totalCases = [10, 20, 50, 200, 400, 1000];
  totalCases.forEach(total => {
    it(`two variants with equal weights summing to ${total} normalise to 50/50`, () => {
      const half = total / 2;
      const vs = [makeVariant({ id: 'a', weight: half }), makeVariant({ id: 'b', weight: half })];
      const result = normaliseWeights(vs);
      expect(totalWeight(result)).toBeCloseTo(100, 3);
      expect(result[0].weight).toBeCloseTo(50, 3);
      expect(result[1].weight).toBeCloseTo(50, 3);
    });
  });

  // Parameterised: three-variant normalisation total = 100
  const threeCases: [number, number, number][] = [
    [1, 1, 1], [10, 20, 70], [25, 25, 50], [33, 33, 34], [50, 30, 20],
  ];
  threeCases.forEach(([a, b, c]) => {
    it(`three variants [${a},${b},${c}] normalise to total=100`, () => {
      const vs = [
        makeVariant({ id: 'a', weight: a }),
        makeVariant({ id: 'b', weight: b }),
        makeVariant({ id: 'c', weight: c }),
      ];
      const result = normaliseWeights(vs);
      expect(totalWeight(result)).toBeCloseTo(100, 3);
    });
  });
});

// ---------------------------------------------------------------------------
// 5. assignVariant
// ---------------------------------------------------------------------------

describe('assignVariant', () => {
  const runningExp = makeRunningExperiment();

  it('returns null for draft experiment', () => {
    const exp = makeDraftExperiment();
    expect(assignVariant('user1', exp)).toBeNull();
  });
  it('returns null for paused experiment', () => {
    const exp = pauseExperiment(makeRunningExperiment());
    expect(assignVariant('user1', exp)).toBeNull();
  });
  it('returns null for completed experiment', () => {
    const exp = completeExperiment(makeRunningExperiment());
    expect(assignVariant('user1', exp)).toBeNull();
  });
  it('returns null for archived experiment', () => {
    const exp = { ...makeRunningExperiment(), status: 'archived' as ExperimentStatus };
    expect(assignVariant('user1', exp)).toBeNull();
  });
  it('returns null for running experiment with no variants', () => {
    const exp = { ...makeRunningExperiment(), variants: [] };
    expect(assignVariant('user1', exp)).toBeNull();
  });
  it('returns an assignment object for running experiment', () => {
    expect(assignVariant('user1', runningExp)).not.toBeNull();
  });
  it('returned assignment has correct userId', () => {
    expect(assignVariant('user42', runningExp)?.userId).toBe('user42');
  });
  it('returned assignment has correct experimentId', () => {
    expect(assignVariant('user1', runningExp)?.experimentId).toBe(runningExp.id);
  });
  it('returned assignment has a variantId', () => {
    const result = assignVariant('user1', runningExp);
    expect(typeof result?.variantId).toBe('string');
    expect(result?.variantId.length).toBeGreaterThan(0);
  });
  it('returned assignment variantId is one of the experiment variants', () => {
    const result = assignVariant('user1', runningExp);
    const variantIds = runningExp.variants.map(v => v.id);
    expect(variantIds).toContain(result?.variantId);
  });
  it('returned assignment has assignedAt as a number', () => {
    expect(typeof assignVariant('user1', runningExp)?.assignedAt).toBe('number');
  });
  it('is deterministic — same userId+experiment → same variant', () => {
    const r1 = assignVariant('user-abc', runningExp);
    const r2 = assignVariant('user-abc', runningExp);
    expect(r1?.variantId).toBe(r2?.variantId);
  });
  it('different userIds may produce different variants (distribution)', () => {
    const results = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const r = assignVariant(`user-${i}`, runningExp);
      if (r) results.add(r.variantId);
    }
    expect(results.size).toBeGreaterThan(1);
  });

  // Parameterised: determinism for many users
  const deterministicUsers = Array.from({ length: 50 }, (_, i) => `stable-user-${i}`);
  deterministicUsers.forEach(uid => {
    it(`deterministic for userId '${uid}'`, () => {
      const r1 = assignVariant(uid, runningExp);
      const r2 = assignVariant(uid, runningExp);
      expect(r1?.variantId).toBe(r2?.variantId);
    });
  });

  // Parameterised: non-running statuses all return null
  const nonRunning: ExperimentStatus[] = ['draft', 'paused', 'completed', 'archived'];
  nonRunning.forEach(status => {
    it(`returns null for status '${status}'`, () => {
      const exp = { ...runningExp, status };
      expect(assignVariant('user1', exp)).toBeNull();
    });
  });

  it('all-weight-on-one-variant always assigns that variant', () => {
    const exp: Experiment = {
      ...makeRunningExperiment(),
      variants: [
        makeVariant({ id: 'only', weight: 100 }),
      ],
    };
    for (let i = 0; i < 20; i++) {
      expect(assignVariant(`user-${i}`, exp)?.variantId).toBe('only');
    }
  });

  it('single variant experiment always assigns that variant for any user', () => {
    const exp: Experiment = {
      ...makeRunningExperiment(),
      variants: [makeVariant({ id: 'solo', weight: 100 })],
    };
    const users = ['a', 'b', 'c', 'd', 'e'];
    users.forEach(u => {
      expect(assignVariant(u, exp)?.variantId).toBe('solo');
    });
  });
});

// ---------------------------------------------------------------------------
// 6. startExperiment
// ---------------------------------------------------------------------------

describe('startExperiment', () => {
  it('sets status to running', () => {
    expect(startExperiment(makeDraftExperiment()).status).toBe('running');
  });
  it('sets startDate as a number', () => {
    expect(typeof startExperiment(makeDraftExperiment()).startDate).toBe('number');
  });
  it('startDate is approximately now', () => {
    const before = Date.now();
    const exp = startExperiment(makeDraftExperiment());
    const after = Date.now();
    expect(exp.startDate!).toBeGreaterThanOrEqual(before);
    expect(exp.startDate!).toBeLessThanOrEqual(after);
  });
  it('preserves id', () => {
    const draft = makeDraftExperiment({ id: 'my-id' });
    expect(startExperiment(draft).id).toBe('my-id');
  });
  it('preserves name', () => {
    const draft = makeDraftExperiment({ name: 'My Exp' });
    expect(startExperiment(draft).name).toBe('My Exp');
  });
  it('preserves variants', () => {
    const draft = makeDraftExperiment();
    const started = startExperiment(draft);
    expect(started.variants).toEqual(draft.variants);
  });
  it('preserves metrics', () => {
    const draft = makeDraftExperiment({ metrics: ['revenue', 'engagement'] });
    expect(startExperiment(draft).metrics).toEqual(['revenue', 'engagement']);
  });
  it('does not mutate original experiment', () => {
    const draft = makeDraftExperiment();
    startExperiment(draft);
    expect(draft.status).toBe('draft');
  });

  // Parameterised: starting experiments with various ids
  const expIds = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
  expIds.forEach(id => {
    it(`preserves id '${id}' after start`, () => {
      const draft = makeDraftExperiment({ id });
      expect(startExperiment(draft).id).toBe(id);
    });
  });

  // Parameterised: starting already-paused or completed experiment still sets running
  const otherStatuses: ExperimentStatus[] = ['paused', 'completed', 'archived'];
  otherStatuses.forEach(s => {
    it(`can force status to running from '${s}'`, () => {
      const exp = { ...makeDraftExperiment(), status: s };
      expect(startExperiment(exp).status).toBe('running');
    });
  });
});

// ---------------------------------------------------------------------------
// 7. pauseExperiment
// ---------------------------------------------------------------------------

describe('pauseExperiment', () => {
  it('sets status to paused', () => {
    expect(pauseExperiment(makeRunningExperiment()).status).toBe('paused');
  });
  it('preserves id', () => {
    const exp = makeRunningExperiment({ id: 'my-exp' });
    expect(pauseExperiment(exp).id).toBe('my-exp');
  });
  it('preserves name', () => {
    const exp = makeRunningExperiment({ name: 'Running Exp' });
    expect(pauseExperiment(exp).name).toBe('Running Exp');
  });
  it('preserves variants', () => {
    const exp = makeRunningExperiment();
    expect(pauseExperiment(exp).variants).toEqual(exp.variants);
  });
  it('preserves metrics', () => {
    const exp = makeRunningExperiment({ metrics: ['retention'] });
    expect(pauseExperiment(exp).metrics).toEqual(['retention']);
  });
  it('does not mutate original experiment', () => {
    const exp = makeRunningExperiment();
    pauseExperiment(exp);
    expect(exp.status).toBe('running');
  });
  it('does not set endDate', () => {
    const exp = makeRunningExperiment();
    expect(pauseExperiment(exp).endDate).toBeUndefined();
  });

  // Parameterised: pausing from various statuses
  const statuses: ExperimentStatus[] = ['draft', 'running', 'completed', 'archived'];
  statuses.forEach(s => {
    it(`pausing from '${s}' yields paused`, () => {
      const exp = { ...makeDraftExperiment(), status: s };
      expect(pauseExperiment(exp).status).toBe('paused');
    });
  });

  // Parameterised: preserves various experiment ids
  const ids = ['p1', 'pause-me', 'exp-999', 'X'];
  ids.forEach(id => {
    it(`preserves id '${id}' after pause`, () => {
      const exp = makeRunningExperiment({ id });
      expect(pauseExperiment(exp).id).toBe(id);
    });
  });
});

// ---------------------------------------------------------------------------
// 8. completeExperiment
// ---------------------------------------------------------------------------

describe('completeExperiment', () => {
  it('sets status to completed', () => {
    expect(completeExperiment(makeRunningExperiment()).status).toBe('completed');
  });
  it('sets endDate as a number', () => {
    expect(typeof completeExperiment(makeRunningExperiment()).endDate).toBe('number');
  });
  it('endDate is approximately now', () => {
    const before = Date.now();
    const exp = completeExperiment(makeRunningExperiment());
    const after = Date.now();
    expect(exp.endDate!).toBeGreaterThanOrEqual(before);
    expect(exp.endDate!).toBeLessThanOrEqual(after);
  });
  it('preserves id', () => {
    const exp = makeRunningExperiment({ id: 'final-exp' });
    expect(completeExperiment(exp).id).toBe('final-exp');
  });
  it('preserves name', () => {
    const exp = makeRunningExperiment({ name: 'Final' });
    expect(completeExperiment(exp).name).toBe('Final');
  });
  it('preserves variants', () => {
    const exp = makeRunningExperiment();
    expect(completeExperiment(exp).variants).toEqual(exp.variants);
  });
  it('preserves metrics', () => {
    const exp = makeRunningExperiment({ metrics: ['custom'] });
    expect(completeExperiment(exp).metrics).toEqual(['custom']);
  });
  it('does not mutate original experiment', () => {
    const exp = makeRunningExperiment();
    completeExperiment(exp);
    expect(exp.status).toBe('running');
  });

  // Parameterised: completing from various statuses
  const statuses: ExperimentStatus[] = ['draft', 'running', 'paused', 'archived'];
  statuses.forEach(s => {
    it(`completing from '${s}' yields completed`, () => {
      const exp = { ...makeDraftExperiment(), status: s };
      expect(completeExperiment(exp).status).toBe('completed');
    });
  });

  // Parameterised: endDate set for multiple experiments
  const expNames = ['Exp Alpha', 'Exp Beta', 'Exp Gamma', 'Exp Delta'];
  expNames.forEach(n => {
    it(`sets endDate for experiment named '${n}'`, () => {
      const exp = makeRunningExperiment({ name: n });
      expect(completeExperiment(exp).endDate).toBeDefined();
    });
  });
});

// ---------------------------------------------------------------------------
// 9. isExperimentActive
// ---------------------------------------------------------------------------

describe('isExperimentActive', () => {
  it('returns true for running', () => {
    expect(isExperimentActive(makeRunningExperiment())).toBe(true);
  });
  it('returns false for draft', () => {
    expect(isExperimentActive(makeDraftExperiment())).toBe(false);
  });
  it('returns false for paused', () => {
    expect(isExperimentActive(pauseExperiment(makeRunningExperiment()))).toBe(false);
  });
  it('returns false for completed', () => {
    expect(isExperimentActive(completeExperiment(makeRunningExperiment()))).toBe(false);
  });
  it('returns false for archived', () => {
    const exp = { ...makeRunningExperiment(), status: 'archived' as ExperimentStatus };
    expect(isExperimentActive(exp)).toBe(false);
  });

  // Parameterised: all non-running statuses return false
  const inactiveStatuses: ExperimentStatus[] = ['draft', 'paused', 'completed', 'archived'];
  inactiveStatuses.forEach(s => {
    it(`returns false for status '${s}'`, () => {
      const exp = { ...makeDraftExperiment(), status: s };
      expect(isExperimentActive(exp)).toBe(false);
    });
  });

  // Parameterised: running status always true
  const runningExps = Array.from({ length: 10 }, (_, i) =>
    makeRunningExperiment({ id: `run-exp-${i}`, name: `Running ${i}` }),
  );
  runningExps.forEach((exp, i) => {
    it(`running experiment ${i} isActive === true`, () => {
      expect(isExperimentActive(exp)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 10. computeVariantStats
// ---------------------------------------------------------------------------

describe('computeVariantStats', () => {
  const experimentId = 'exp1';
  const variantId = 'v1';

  it('returns variantId', () => {
    expect(computeVariantStats(variantId, []).variantId).toBe(variantId);
  });
  it('returns 0 participants for empty events', () => {
    expect(computeVariantStats(variantId, []).participants).toBe(0);
  });
  it('returns 0 conversions for empty events', () => {
    expect(computeVariantStats(variantId, []).conversions).toBe(0);
  });
  it('returns 0 conversionRate for empty events', () => {
    expect(computeVariantStats(variantId, []).conversionRate).toBe(0);
  });
  it('returns 0 totalRevenue for empty events', () => {
    expect(computeVariantStats(variantId, []).totalRevenue).toBe(0);
  });
  it('returns 0 avgRevenue for empty events', () => {
    expect(computeVariantStats(variantId, []).avgRevenue).toBe(0);
  });

  it('counts unique participants', () => {
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', experimentId, variantId),
      makeConversionEvent('u1', experimentId, variantId),
      makeConversionEvent('u2', experimentId, variantId),
    ];
    expect(computeVariantStats(variantId, events).participants).toBe(2);
  });

  it('counts conversions where value > 0', () => {
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', experimentId, variantId, 1),
      makeConversionEvent('u2', experimentId, variantId, 0),
      makeConversionEvent('u3', experimentId, variantId, 1),
    ];
    expect(computeVariantStats(variantId, events).conversions).toBe(2);
  });

  it('zero-value conversion events do not count', () => {
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', experimentId, variantId, 0),
    ];
    expect(computeVariantStats(variantId, events).conversions).toBe(0);
  });

  it('conversionRate = conversions / participants', () => {
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', experimentId, variantId, 1),
      makeConversionEvent('u2', experimentId, variantId, 1),
      makeConversionEvent('u3', experimentId, variantId, 0),
    ];
    const stats = computeVariantStats(variantId, events);
    expect(stats.conversionRate).toBeCloseTo(2 / 3, 5);
  });

  it('filters events to correct variantId', () => {
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', experimentId, 'other-variant', 1),
      makeConversionEvent('u2', experimentId, variantId, 1),
    ];
    expect(computeVariantStats(variantId, events).participants).toBe(1);
  });

  it('sums revenue events', () => {
    const events: ExperimentEvent[] = [
      makeRevenueEvent('u1', experimentId, variantId, 100),
      makeRevenueEvent('u2', experimentId, variantId, 200),
    ];
    expect(computeVariantStats(variantId, events).totalRevenue).toBe(300);
  });

  it('computes average revenue', () => {
    const events: ExperimentEvent[] = [
      makeRevenueEvent('u1', experimentId, variantId, 100),
      makeRevenueEvent('u2', experimentId, variantId, 200),
    ];
    expect(computeVariantStats(variantId, events).avgRevenue).toBe(150);
  });

  it('ignores non-revenue events for revenue calculation', () => {
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', experimentId, variantId, 1),
      makeEvent('u1', experimentId, variantId, 'engagement', 5),
    ];
    expect(computeVariantStats(variantId, events).totalRevenue).toBe(0);
  });

  it('100% conversion rate when all participants convert', () => {
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', experimentId, variantId, 1),
      makeConversionEvent('u2', experimentId, variantId, 1),
    ];
    expect(computeVariantStats(variantId, events).conversionRate).toBe(1);
  });

  // Parameterised: N users each converting once → conversionRate = 1
  [1, 2, 5, 10, 20].forEach(n => {
    it(`${n} users all converting → conversionRate 1`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        makeConversionEvent(`user-${i}`, experimentId, variantId, 1),
      );
      expect(computeVariantStats(variantId, events).conversionRate).toBe(1);
    });
  });

  // Parameterised: revenue sums
  const revenueCases: [number[], number][] = [
    [[10, 20, 30], 60],
    [[100], 100],
    [[0, 0, 0], 0],
    [[9.99, 0.01], 10],
    [[1, 2, 3, 4, 5], 15],
  ];
  revenueCases.forEach(([amounts, expected]) => {
    it(`revenue [${amounts.join(', ')}] → totalRevenue ${expected}`, () => {
      const events = amounts.map((a, i) => makeRevenueEvent(`u${i}`, experimentId, variantId, a));
      expect(computeVariantStats(variantId, events).totalRevenue).toBeCloseTo(expected, 5);
    });
  });

  // Parameterised: average revenue
  const avgCases: [number[], number][] = [
    [[100, 200], 150],
    [[50, 50, 50], 50],
    [[10], 10],
    [[0, 100], 50],
  ];
  avgCases.forEach(([amounts, expected]) => {
    it(`revenue [${amounts.join(', ')}] → avgRevenue ${expected}`, () => {
      const events = amounts.map((a, i) => makeRevenueEvent(`u${i}`, experimentId, variantId, a));
      expect(computeVariantStats(variantId, events).avgRevenue).toBeCloseTo(expected, 5);
    });
  });
});

// ---------------------------------------------------------------------------
// 11. computeResults
// ---------------------------------------------------------------------------

describe('computeResults', () => {
  const makeExp = (variants: Variant[]): Experiment =>
    makeRunningExperiment({ variants });

  it('returns correct experimentId', () => {
    const exp = makeRunningExperiment({ id: 'result-exp' });
    expect(computeResults(exp, []).experimentId).toBe('result-exp');
  });

  it('returns variantStats for each variant', () => {
    const exp = makeRunningExperiment();
    const results = computeResults(exp, []);
    expect(results.variantStats).toHaveLength(exp.variants.length);
  });

  it('sampleSize is 0 when no events', () => {
    expect(computeResults(makeRunningExperiment(), []).sampleSize).toBe(0);
  });

  it('winner is undefined when no conversions', () => {
    expect(computeResults(makeRunningExperiment(), []).winner).toBeUndefined();
  });

  it('selects winner with highest conversionRate', () => {
    // ctrl: 1 converter out of 3 participants (rate=0.33)
    // trt: 2 converters out of 2 participants (rate=1.0) → trt wins
    const exp = makeRunningExperiment({
      variants: [
        makeVariant({ id: 'ctrl', type: 'control', weight: 50 }),
        makeVariant({ id: 'trt', type: 'treatment', weight: 50 }),
      ],
    });
    const events: ExperimentEvent[] = [
      makeConversionEvent('ctrl-u1', exp.id, 'ctrl', 1),
      makeConversionEvent('ctrl-u2', exp.id, 'ctrl', 0),  // did not convert
      makeConversionEvent('ctrl-u3', exp.id, 'ctrl', 0),  // did not convert
      makeConversionEvent('trt-u1', exp.id, 'trt', 1),
      makeConversionEvent('trt-u2', exp.id, 'trt', 1),
    ];
    expect(computeResults(exp, events).winner).toBe('trt');
  });

  it('computes correct sampleSize from distinct participants', () => {
    const exp = makeRunningExperiment({
      variants: [
        makeVariant({ id: 'ctrl', type: 'control', weight: 50 }),
        makeVariant({ id: 'trt', type: 'treatment', weight: 50 }),
      ],
    });
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', exp.id, 'ctrl', 1),
      makeConversionEvent('u2', exp.id, 'trt', 1),
      makeConversionEvent('u3', exp.id, 'trt', 1),
    ];
    expect(computeResults(exp, events).sampleSize).toBe(3);
  });

  it('returns variantStats array with one entry per variant', () => {
    const exp = makeRunningExperiment({
      variants: [
        makeVariant({ id: 'a', type: 'control', weight: 33 }),
        makeVariant({ id: 'b', type: 'treatment', weight: 33 }),
        makeVariant({ id: 'c', type: 'treatment', weight: 34 }),
      ],
    });
    expect(computeResults(exp, []).variantStats).toHaveLength(3);
  });

  it('handles experiment with zero variants', () => {
    const exp = { ...makeRunningExperiment(), variants: [] };
    const results = computeResults(exp, []);
    expect(results.variantStats).toHaveLength(0);
    expect(results.sampleSize).toBe(0);
  });

  it('filters events correctly per variant in results', () => {
    const exp = makeRunningExperiment({
      variants: [
        makeVariant({ id: 'ctrl', type: 'control', weight: 50 }),
        makeVariant({ id: 'trt', type: 'treatment', weight: 50 }),
      ],
    });
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', exp.id, 'ctrl', 1),
      makeConversionEvent('u2', exp.id, 'ctrl', 1),
      makeConversionEvent('u3', exp.id, 'trt', 1),
    ];
    const results = computeResults(exp, events);
    const ctrlStats = results.variantStats.find(vs => vs.variantId === 'ctrl')!;
    const trtStats = results.variantStats.find(vs => vs.variantId === 'trt')!;
    expect(ctrlStats.participants).toBe(2);
    expect(trtStats.participants).toBe(1);
  });

  // Parameterised: winner selection with clear winner.
  // Strategy: give the losing variant extra non-converting participants so its rate < winner's rate.
  // Each case: winnerConverters/winnerTotal vs loserConverters/loserTotal
  // ctrl converters, ctrl total, trt converters, trt total, expected winner
  const winnerCases: Array<{ ctrlConv: number; ctrlTotal: number; trtConv: number; trtTotal: number; expected: string }> = [
    // trt wins: ctrl 1/5 (0.2) vs trt 4/5 (0.8)
    { ctrlConv: 1, ctrlTotal: 5, trtConv: 4, trtTotal: 5, expected: 'trt' },
    // ctrl wins: ctrl 4/5 (0.8) vs trt 1/5 (0.2)
    { ctrlConv: 4, ctrlTotal: 5, trtConv: 1, trtTotal: 5, expected: 'ctrl' },
    // ctrl wins: ctrl 9/10 (0.9) vs trt 1/10 (0.1)
    { ctrlConv: 9, ctrlTotal: 10, trtConv: 1, trtTotal: 10, expected: 'ctrl' },
    // trt wins: ctrl 1/10 (0.1) vs trt 9/10 (0.9)
    { ctrlConv: 1, ctrlTotal: 10, trtConv: 9, trtTotal: 10, expected: 'trt' },
  ];
  winnerCases.forEach(({ ctrlConv, ctrlTotal, trtConv, trtTotal, expected }) => {
    it(`winner is '${expected}' when ctrl=${ctrlConv}/${ctrlTotal} trt=${trtConv}/${trtTotal}`, () => {
      const exp = makeRunningExperiment({
        variants: [
          makeVariant({ id: 'ctrl', type: 'control', weight: 50 }),
          makeVariant({ id: 'trt', type: 'treatment', weight: 50 }),
        ],
      });
      const events: ExperimentEvent[] = [
        // ctrl: ctrlConv converters, rest non-converting
        ...Array.from({ length: ctrlConv }, (_, i) => makeConversionEvent(`ctrl-conv-${i}`, exp.id, 'ctrl', 1)),
        ...Array.from({ length: ctrlTotal - ctrlConv }, (_, i) => makeConversionEvent(`ctrl-noconv-${i}`, exp.id, 'ctrl', 0)),
        // trt: trtConv converters, rest non-converting
        ...Array.from({ length: trtConv }, (_, i) => makeConversionEvent(`trt-conv-${i}`, exp.id, 'trt', 1)),
        ...Array.from({ length: trtTotal - trtConv }, (_, i) => makeConversionEvent(`trt-noconv-${i}`, exp.id, 'trt', 0)),
      ];
      expect(computeResults(exp, events).winner).toBe(expected);
    });
  });

  // Parameterised: sampleSize counts
  [1, 3, 5, 10].forEach(n => {
    it(`sampleSize=${n} when ${n} unique participants total`, () => {
      const exp = makeRunningExperiment({
        variants: [makeVariant({ id: 'ctrl', type: 'control', weight: 100 })],
      });
      const events = Array.from({ length: n }, (_, i) =>
        makeConversionEvent(`user-${i}`, exp.id, 'ctrl', 1),
      );
      expect(computeResults(exp, events).sampleSize).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 12. isValidStatus
// ---------------------------------------------------------------------------

describe('isValidStatus', () => {
  const validStatuses = ['draft', 'running', 'paused', 'completed', 'archived'];
  validStatuses.forEach(s => {
    it(`'${s}' is a valid status`, () => {
      expect(isValidStatus(s)).toBe(true);
    });
  });

  const invalidStatuses = [
    'RUNNING', 'DRAFT', 'active', 'pending', 'stopped', 'deleted',
    '', ' ', 'run', 'Run', 'archive', 'complete', 'Completed', 'ARCHIVED',
    'running ', ' running', 'drafted', 'pausing', 'complete',
  ];
  invalidStatuses.forEach(s => {
    it(`'${s}' is NOT a valid status`, () => {
      expect(isValidStatus(s)).toBe(false);
    });
  });

  it('returns boolean', () => {
    expect(typeof isValidStatus('draft')).toBe('boolean');
  });

  it('is case-sensitive', () => {
    expect(isValidStatus('Running')).toBe(false);
    expect(isValidStatus('PAUSED')).toBe(false);
  });

  // Parameterised: exhaustive valid check
  const knownValid: ExperimentStatus[] = ['draft', 'running', 'paused', 'completed', 'archived'];
  knownValid.forEach(s => {
    it(`type-level valid status '${s}' returns true`, () => {
      expect(isValidStatus(s)).toBe(true);
    });
  });

  // Parameterised: numeric-like strings
  const numericStrings = ['0', '1', '123', '-1'];
  numericStrings.forEach(s => {
    it(`numeric string '${s}' is not a valid status`, () => {
      expect(isValidStatus(s)).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// 13. isValidMetric
// ---------------------------------------------------------------------------

describe('isValidMetric', () => {
  const validMetrics = ['conversion', 'revenue', 'engagement', 'retention', 'custom'];
  validMetrics.forEach(m => {
    it(`'${m}' is a valid metric`, () => {
      expect(isValidMetric(m)).toBe(true);
    });
  });

  const invalidMetrics = [
    'CONVERSION', 'Revenue', 'engage', 'RETENTION', 'Custom',
    '', ' ', 'click', 'pageview', 'bounce', 'session', 'impressions',
    'Conversion', 'conversion ', ' conversion', 'revenues', 'engaged',
  ];
  invalidMetrics.forEach(m => {
    it(`'${m}' is NOT a valid metric`, () => {
      expect(isValidMetric(m)).toBe(false);
    });
  });

  it('returns boolean', () => {
    expect(typeof isValidMetric('revenue')).toBe('boolean');
  });

  it('is case-sensitive', () => {
    expect(isValidMetric('Engagement')).toBe(false);
    expect(isValidMetric('CUSTOM')).toBe(false);
  });

  // Parameterised: all 5 metric types
  const allMetrics: MetricType[] = ['conversion', 'revenue', 'engagement', 'retention', 'custom'];
  allMetrics.forEach(m => {
    it(`MetricType '${m}' is valid`, () => {
      expect(isValidMetric(m)).toBe(true);
    });
  });

  // Parameterised: special characters
  const specialStrings = ['conv.ersion', 'rev-enue', 'eng_agement', 'ret!ention'];
  specialStrings.forEach(s => {
    it(`special string '${s}' is invalid`, () => {
      expect(isValidMetric(s)).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// 14. filterActiveExperiments
// ---------------------------------------------------------------------------

describe('filterActiveExperiments', () => {
  it('returns empty array for empty input', () => {
    expect(filterActiveExperiments([])).toEqual([]);
  });

  it('returns only running experiments', () => {
    const running = makeRunningExperiment({ id: 'r1' });
    const draft = makeDraftExperiment({ id: 'd1' });
    const result = filterActiveExperiments([running, draft]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });

  it('returns all experiments when all are running', () => {
    const exps = [
      makeRunningExperiment({ id: 'r1' }),
      makeRunningExperiment({ id: 'r2' }),
      makeRunningExperiment({ id: 'r3' }),
    ];
    expect(filterActiveExperiments(exps)).toHaveLength(3);
  });

  it('returns empty when none are running', () => {
    const exps = [
      makeDraftExperiment({ id: 'd1' }),
      pauseExperiment(makeRunningExperiment({ id: 'p1' })),
      completeExperiment(makeRunningExperiment({ id: 'c1' })),
    ];
    expect(filterActiveExperiments(exps)).toHaveLength(0);
  });

  it('filters out draft', () => {
    const exps = [makeDraftExperiment({ id: 'd1' }), makeRunningExperiment({ id: 'r1' })];
    const result = filterActiveExperiments(exps);
    expect(result.every(e => e.status === 'running')).toBe(true);
  });

  it('filters out paused', () => {
    const exps = [pauseExperiment(makeRunningExperiment({ id: 'p1' })), makeRunningExperiment({ id: 'r1' })];
    const result = filterActiveExperiments(exps);
    expect(result).toHaveLength(1);
  });

  it('filters out completed', () => {
    const exps = [completeExperiment(makeRunningExperiment({ id: 'c1' })), makeRunningExperiment({ id: 'r1' })];
    const result = filterActiveExperiments(exps);
    expect(result).toHaveLength(1);
  });

  it('filters out archived', () => {
    const archived = { ...makeRunningExperiment({ id: 'a1' }), status: 'archived' as ExperimentStatus };
    const exps = [archived, makeRunningExperiment({ id: 'r1' })];
    const result = filterActiveExperiments(exps);
    expect(result).toHaveLength(1);
  });

  it('does not mutate the input array', () => {
    const exps = [makeRunningExperiment({ id: 'r1' }), makeDraftExperiment({ id: 'd1' })];
    const origLength = exps.length;
    filterActiveExperiments(exps);
    expect(exps).toHaveLength(origLength);
  });

  // Parameterised: N running + M non-running
  const mixedCases: Array<{ running: number; nonRunning: number }> = [
    { running: 1, nonRunning: 1 },
    { running: 2, nonRunning: 3 },
    { running: 5, nonRunning: 0 },
    { running: 0, nonRunning: 5 },
    { running: 3, nonRunning: 2 },
  ];
  mixedCases.forEach(({ running, nonRunning }) => {
    it(`${running} running + ${nonRunning} non-running → ${running} active`, () => {
      const runExps = Array.from({ length: running }, (_, i) =>
        makeRunningExperiment({ id: `run-${i}` }),
      );
      const nonRunExps = Array.from({ length: nonRunning }, (_, i) =>
        makeDraftExperiment({ id: `draft-${i}` }),
      );
      const all = [...runExps, ...nonRunExps];
      expect(filterActiveExperiments(all)).toHaveLength(running);
    });
  });

  // Parameterised: all-running arrays of different sizes
  [1, 2, 3, 5, 10].forEach(n => {
    it(`all ${n} running → returns all ${n}`, () => {
      const exps = Array.from({ length: n }, (_, i) => makeRunningExperiment({ id: `r${i}` }));
      expect(filterActiveExperiments(exps)).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 15. getExperimentById
// ---------------------------------------------------------------------------

describe('getExperimentById', () => {
  it('returns undefined for empty array', () => {
    expect(getExperimentById([], 'any')).toBeUndefined();
  });

  it('returns undefined when id not found', () => {
    const exps = [makeDraftExperiment({ id: 'e1' })];
    expect(getExperimentById(exps, 'does-not-exist')).toBeUndefined();
  });

  it('finds experiment by id', () => {
    const exp = makeDraftExperiment({ id: 'find-me' });
    expect(getExperimentById([exp], 'find-me')).toBe(exp);
  });

  it('returns the correct experiment when multiple exist', () => {
    const exps = [
      makeDraftExperiment({ id: 'e1', name: 'First' }),
      makeDraftExperiment({ id: 'e2', name: 'Second' }),
      makeDraftExperiment({ id: 'e3', name: 'Third' }),
    ];
    expect(getExperimentById(exps, 'e2')?.name).toBe('Second');
  });

  it('returns the first match when duplicates exist', () => {
    const exps = [
      makeDraftExperiment({ id: 'dupe', name: 'First' }),
      makeDraftExperiment({ id: 'dupe', name: 'Second' }),
    ];
    expect(getExperimentById(exps, 'dupe')?.name).toBe('First');
  });

  it('is case-sensitive', () => {
    const exps = [makeDraftExperiment({ id: 'ABC' })];
    expect(getExperimentById(exps, 'abc')).toBeUndefined();
  });

  // Parameterised: finding many different ids
  const experimentIds = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta'];
  const expArray = experimentIds.map(id => makeDraftExperiment({ id, name: `Exp-${id}` }));
  experimentIds.forEach(id => {
    it(`finds experiment with id '${id}'`, () => {
      expect(getExperimentById(expArray, id)?.id).toBe(id);
    });
  });

  // Parameterised: non-existent ids
  const nonExistentIds = ['not-there', 'missing', 'gone', 'nope', '404', ''];
  nonExistentIds.forEach(id => {
    it(`returns undefined for non-existent id '${id}'`, () => {
      expect(getExperimentById(expArray, id)).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// 16. makeEvent
// ---------------------------------------------------------------------------

describe('makeEvent', () => {
  it('sets userId', () => {
    expect(makeEvent('u1', 'e1', 'v1', 'conversion', 1).userId).toBe('u1');
  });
  it('sets experimentId', () => {
    expect(makeEvent('u1', 'e1', 'v1', 'conversion', 1).experimentId).toBe('e1');
  });
  it('sets variantId', () => {
    expect(makeEvent('u1', 'e1', 'v1', 'conversion', 1).variantId).toBe('v1');
  });
  it('sets metricType', () => {
    expect(makeEvent('u1', 'e1', 'v1', 'revenue', 99).metricType).toBe('revenue');
  });
  it('sets value', () => {
    expect(makeEvent('u1', 'e1', 'v1', 'conversion', 42).value).toBe(42);
  });
  it('sets timestamp as a number', () => {
    expect(typeof makeEvent('u1', 'e1', 'v1', 'conversion', 1).timestamp).toBe('number');
  });
  it('timestamp is approximately now', () => {
    const before = Date.now();
    const ev = makeEvent('u1', 'e1', 'v1', 'conversion', 1);
    const after = Date.now();
    expect(ev.timestamp).toBeGreaterThanOrEqual(before);
    expect(ev.timestamp).toBeLessThanOrEqual(after);
  });
  it('value 0 is stored', () => {
    expect(makeEvent('u1', 'e1', 'v1', 'conversion', 0).value).toBe(0);
  });
  it('large value is stored', () => {
    expect(makeEvent('u1', 'e1', 'v1', 'revenue', 999999).value).toBe(999999);
  });
  it('fractional value is stored', () => {
    expect(makeEvent('u1', 'e1', 'v1', 'revenue', 9.99).value).toBeCloseTo(9.99);
  });

  // Parameterised: all metric types
  const metrics: MetricType[] = ['conversion', 'revenue', 'engagement', 'retention', 'custom'];
  metrics.forEach(m => {
    it(`stores metricType '${m}'`, () => {
      expect(makeEvent('u', 'e', 'v', m, 1).metricType).toBe(m);
    });
  });

  // Parameterised: various values
  const values = [0, 1, 10, 100, 999, 0.5, 9.99, 1000000];
  values.forEach(v => {
    it(`stores value ${v}`, () => {
      expect(makeEvent('u', 'e', 'v', 'custom', v).value).toBeCloseTo(v, 5);
    });
  });

  // Parameterised: various userId strings
  const userIds = ['u1', 'user-123', 'USER_ABC', 'a@b.com', 'very-long-user-id-here'];
  userIds.forEach(uid => {
    it(`stores userId '${uid}'`, () => {
      expect(makeEvent(uid, 'e1', 'v1', 'conversion', 1).userId).toBe(uid);
    });
  });
});

// ---------------------------------------------------------------------------
// 17. Integration / end-to-end scenarios
// ---------------------------------------------------------------------------

describe('end-to-end: full experiment lifecycle', () => {
  it('creates, starts, assigns, tracks, and completes an experiment', () => {
    const variants = [
      createVariant('ctrl', 'Control', 'control', 50),
      createVariant('trt', 'Treatment', 'treatment', 50),
    ];
    const exp = createExperiment('lifecycle-exp', 'Lifecycle Test', variants, ['conversion', 'revenue']);
    expect(exp.status).toBe('draft');

    const started = startExperiment(exp);
    expect(started.status).toBe('running');
    expect(isExperimentActive(started)).toBe(true);

    const assignment1 = assignVariant('user-1', started);
    const assignment2 = assignVariant('user-2', started);
    expect(assignment1).not.toBeNull();
    expect(assignment2).not.toBeNull();

    const events: ExperimentEvent[] = [
      makeEvent('user-1', 'lifecycle-exp', assignment1!.variantId, 'conversion', 1),
      makeEvent('user-2', 'lifecycle-exp', assignment2!.variantId, 'conversion', 1),
      makeEvent('user-1', 'lifecycle-exp', assignment1!.variantId, 'revenue', 50),
    ];

    const results = computeResults(started, events);
    expect(results.experimentId).toBe('lifecycle-exp');
    expect(results.sampleSize).toBeGreaterThanOrEqual(1);

    const completed = completeExperiment(started);
    expect(completed.status).toBe('completed');
    expect(completed.endDate).toBeDefined();
    expect(isExperimentActive(completed)).toBe(false);
  });

  it('pause and resume experiment', () => {
    const exp = makeRunningExperiment({ id: 'pause-resume' });
    const paused = pauseExperiment(exp);
    expect(paused.status).toBe('paused');
    expect(assignVariant('user1', paused)).toBeNull();
    const resumed = startExperiment(paused);
    expect(resumed.status).toBe('running');
    expect(assignVariant('user1', resumed)).not.toBeNull();
  });

  it('weight normalisation followed by assignment stays within variants', () => {
    const variants = [
      createVariant('a', 'A', 'control', 1),
      createVariant('b', 'B', 'treatment', 3),
    ];
    const normalised = normaliseWeights(variants);
    const exp: Experiment = {
      ...makeRunningExperiment({ variants: normalised }),
    };
    const validIds = new Set(normalised.map(v => v.id));
    for (let i = 0; i < 30; i++) {
      const assignment = assignVariant(`user-${i}`, exp);
      expect(validIds.has(assignment!.variantId)).toBe(true);
    }
  });

  it('filterActiveExperiments finds only running among mixed statuses', () => {
    const experiments: Experiment[] = [
      makeDraftExperiment({ id: 'd1' }),
      makeRunningExperiment({ id: 'r1' }),
      pauseExperiment(makeRunningExperiment({ id: 'p1' })),
      completeExperiment(makeRunningExperiment({ id: 'c1' })),
      { ...makeRunningExperiment({ id: 'a1' }), status: 'archived' as ExperimentStatus },
      makeRunningExperiment({ id: 'r2' }),
    ];
    const active = filterActiveExperiments(experiments);
    expect(active.map(e => e.id).sort()).toEqual(['r1', 'r2']);
  });

  it('multiple events from same user for same variant counts once for participants', () => {
    const variantId = 'ctrl';
    const experimentId = 'multi-event-exp';
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', experimentId, variantId, 1),
      makeConversionEvent('u1', experimentId, variantId, 1),
      makeConversionEvent('u1', experimentId, variantId, 1),
    ];
    const stats = computeVariantStats(variantId, events);
    expect(stats.participants).toBe(1);
    expect(stats.conversions).toBe(3);
  });

  it('cross-variant isolation in results', () => {
    const exp = makeRunningExperiment({
      id: 'iso-exp',
      variants: [
        makeVariant({ id: 'a', type: 'control', weight: 50 }),
        makeVariant({ id: 'b', type: 'treatment', weight: 50 }),
      ],
    });
    const events: ExperimentEvent[] = [
      makeRevenueEvent('u1', 'iso-exp', 'a', 100),
      makeRevenueEvent('u2', 'iso-exp', 'b', 200),
      makeRevenueEvent('u3', 'iso-exp', 'b', 300),
    ];
    const results = computeResults(exp, events);
    const aStats = results.variantStats.find(s => s.variantId === 'a')!;
    const bStats = results.variantStats.find(s => s.variantId === 'b')!;
    expect(aStats.totalRevenue).toBe(100);
    expect(bStats.totalRevenue).toBe(500);
  });

  // Parameterised: end-to-end determinism for many users across restarts
  const stableUsers = Array.from({ length: 20 }, (_, i) => `e2e-user-${i}`);
  const stableExp = makeRunningExperiment({ id: 'stable-e2e', variants: [
    makeVariant({ id: 'x', type: 'control', weight: 50 }),
    makeVariant({ id: 'y', type: 'treatment', weight: 50 }),
  ]});
  const firstRound = stableUsers.map(u => assignVariant(u, stableExp)?.variantId);
  stableUsers.forEach((u, i) => {
    it(`e2e user '${u}' gets same variant on re-assignment`, () => {
      const r = assignVariant(u, stableExp);
      expect(r?.variantId).toBe(firstRound[i]);
    });
  });
});

// ---------------------------------------------------------------------------
// 18. Edge cases and boundary conditions
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('assignVariant with all weights at 0 still returns a variant', () => {
    const exp: Experiment = {
      ...makeRunningExperiment(),
      variants: [
        makeVariant({ id: 'a', weight: 0 }),
        makeVariant({ id: 'b', weight: 0 }),
      ],
    };
    // All weights 0 means cumulative never exceeds bucket, so last variant is returned
    const result = assignVariant('user1', exp);
    expect(result?.variantId).toBe('b');
  });

  it('normaliseWeights with all-zero weights returns originals', () => {
    const vs = [makeVariant({ id: 'z1', weight: 0 }), makeVariant({ id: 'z2', weight: 0 })];
    const result = normaliseWeights(vs);
    expect(result[0].weight).toBe(0);
    expect(result[1].weight).toBe(0);
  });

  it('computeVariantStats ignores events for other variants', () => {
    const events: ExperimentEvent[] = [
      makeConversionEvent('u1', 'e1', 'other', 1),
      makeConversionEvent('u2', 'e1', 'other', 1),
    ];
    expect(computeVariantStats('target', events).participants).toBe(0);
  });

  it('isValidStatus rejects undefined-like strings', () => {
    expect(isValidStatus('undefined')).toBe(false);
    expect(isValidStatus('null')).toBe(false);
  });

  it('isValidMetric rejects undefined-like strings', () => {
    expect(isValidMetric('undefined')).toBe(false);
    expect(isValidMetric('null')).toBe(false);
  });

  it('createExperiment with empty name is still valid object', () => {
    const exp = createExperiment('e1', '', [], ['conversion']);
    expect(exp.name).toBe('');
  });

  it('makeEvent with empty strings stores them', () => {
    const ev = makeEvent('', '', '', 'conversion', 0);
    expect(ev.userId).toBe('');
    expect(ev.experimentId).toBe('');
    expect(ev.variantId).toBe('');
  });

  it('totalWeight with fractional weights', () => {
    const vs = [
      makeVariant({ weight: 33.33 }),
      makeVariant({ weight: 33.33 }),
      makeVariant({ weight: 33.34 }),
    ];
    expect(totalWeight(vs)).toBeCloseTo(100, 2);
  });

  it('completeExperiment endDate >= startDate', () => {
    const started = startExperiment(makeDraftExperiment());
    const completed = completeExperiment(started);
    expect(completed.endDate!).toBeGreaterThanOrEqual(started.startDate!);
  });

  // Parameterised: getExperimentById with single-element arrays
  const singleIds = ['solo-1', 'solo-2', 'solo-3'];
  singleIds.forEach(id => {
    it(`getExperimentById finds only element with id '${id}'`, () => {
      const exp = makeDraftExperiment({ id });
      expect(getExperimentById([exp], id)?.id).toBe(id);
    });
    it(`getExperimentById returns undefined for wrong id in single-element array`, () => {
      const exp = makeDraftExperiment({ id });
      expect(getExperimentById([exp], 'wrong')).toBeUndefined();
    });
  });

  // Parameterised: createVariant with numeric-looking ids
  const numericIds = ['0', '1', '42', '100', '999'];
  numericIds.forEach(id => {
    it(`createVariant stores numeric-looking id '${id}'`, () => {
      expect(createVariant(id, 'N', 'control', 50).id).toBe(id);
    });
  });

  // Parameterised: makeEvent with large values
  const largeValues = [1e6, 1e9, Number.MAX_SAFE_INTEGER];
  largeValues.forEach(v => {
    it(`makeEvent stores large value ${v}`, () => {
      expect(makeEvent('u', 'e', 'v', 'revenue', v).value).toBe(v);
    });
  });
});

// ---------------------------------------------------------------------------
// 19. Snapshot-style consistency checks
// ---------------------------------------------------------------------------

describe('consistency checks', () => {
  it('startExperiment -> pauseExperiment -> startExperiment -> completeExperiment lifecycle', () => {
    const exp = makeDraftExperiment({ id: 'lifecycle2' });
    const s1 = startExperiment(exp);
    const p1 = pauseExperiment(s1);
    const s2 = startExperiment(p1);
    const c1 = completeExperiment(s2);
    expect(c1.status).toBe('completed');
    expect(c1.id).toBe('lifecycle2');
  });

  it('multiple filterActiveExperiments calls return same result', () => {
    const exps = [
      makeRunningExperiment({ id: 'r1' }),
      makeDraftExperiment({ id: 'd1' }),
    ];
    const r1 = filterActiveExperiments(exps);
    const r2 = filterActiveExperiments(exps);
    expect(r1).toHaveLength(r2.length);
    expect(r1[0].id).toBe(r2[0].id);
  });

  it('computeResults returns same experimentId as input', () => {
    const exp = makeRunningExperiment({ id: 'consistent-id' });
    expect(computeResults(exp, []).experimentId).toBe('consistent-id');
  });

  it('normaliseWeights is idempotent on already-100% total', () => {
    const vs = [
      makeVariant({ id: 'a', weight: 40 }),
      makeVariant({ id: 'b', weight: 60 }),
    ];
    const r1 = normaliseWeights(vs);
    const r2 = normaliseWeights(r1);
    expect(r2[0].weight).toBeCloseTo(r1[0].weight, 5);
    expect(r2[1].weight).toBeCloseTo(r1[1].weight, 5);
  });

  it('all 5 valid statuses pass isValidStatus', () => {
    const statuses: ExperimentStatus[] = ['draft', 'running', 'paused', 'completed', 'archived'];
    expect(statuses.every(isValidStatus)).toBe(true);
  });

  it('all 5 valid metrics pass isValidMetric', () => {
    const metrics: MetricType[] = ['conversion', 'revenue', 'engagement', 'retention', 'custom'];
    expect(metrics.every(isValidMetric)).toBe(true);
  });

  // Parameterised: properties preserved through start/pause/complete chain
  const expProps = ['id', 'name', 'metrics', 'variants'] as const;
  expProps.forEach(prop => {
    it(`'${prop}' preserved through full lifecycle`, () => {
      const draft = makeDraftExperiment({ id: 'prop-test', name: 'PropTest', metrics: ['custom'] });
      const started = startExperiment(draft);
      const paused = pauseExperiment(started);
      const completed = completeExperiment(paused);
      expect((completed as Record<string, unknown>)[prop]).toEqual((draft as Record<string, unknown>)[prop]);
    });
  });

  // Parameterised: computeVariantStats variantId field always matches input
  const variantIds = ['v1', 'control', 'treatment-a', 'B', '123'];
  variantIds.forEach(vid => {
    it(`computeVariantStats variantId field is '${vid}'`, () => {
      expect(computeVariantStats(vid, []).variantId).toBe(vid);
    });
  });
});

// ---------------------------------------------------------------------------
// 20. Extended createVariant parameterisation
// ---------------------------------------------------------------------------

describe('createVariant extended', () => {
  // 50 additional weight checks covering boundary and mid values
  const extendedWeights = Array.from({ length: 50 }, (_, i) => i * 2);
  extendedWeights.forEach(w => {
    it(`weight ${w} is stored correctly`, () => {
      expect(createVariant(`v-${w}`, 'N', 'control', w).weight).toBe(w);
    });
  });

  // 20 treatment variants with config
  const treatmentConfigs = Array.from({ length: 20 }, (_, i) => ({
    flag: `feature-${i}`,
    enabled: i % 2 === 0,
    value: i * 10,
  }));
  treatmentConfigs.forEach((cfg, i) => {
    it(`treatment variant ${i} stores config flag=${cfg.flag}`, () => {
      const v = createVariant(`t${i}`, `Treatment ${i}`, 'treatment', 50, cfg);
      expect(v.config).toEqual(cfg);
      expect(v.type).toBe('treatment');
    });
  });

  // 20 control variants without config
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`control variant ${i} has no config`, () => {
      expect(createVariant(`c${i}`, `Control ${i}`, 'control', 50).config).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// 21. Extended createExperiment parameterisation
// ---------------------------------------------------------------------------

describe('createExperiment extended', () => {
  // 30 experiments with unique ids, check all have status='draft'
  Array.from({ length: 30 }, (_, i) => `exp-ext-${i}`).forEach(id => {
    it(`experiment '${id}' starts as draft`, () => {
      expect(createExperiment(id, 'Test', [], ['conversion']).status).toBe('draft');
    });
  });

  // 30 experiments: createdAt is a finite number
  Array.from({ length: 30 }, (_, i) => `exp-ts-${i}`).forEach(id => {
    it(`experiment '${id}' createdAt is finite`, () => {
      expect(Number.isFinite(createExperiment(id, 'T', [], ['custom']).createdAt)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 22. Extended normaliseWeights parameterisation
// ---------------------------------------------------------------------------

describe('normaliseWeights extended', () => {
  // 40 single-variant cases: normalised weight always 100
  Array.from({ length: 40 }, (_, i) => i + 1).forEach(w => {
    it(`single variant weight ${w} normalises to 100`, () => {
      const vs = [makeVariant({ id: 'a', weight: w })];
      const result = normaliseWeights(vs);
      expect(result[0].weight).toBeCloseTo(100, 3);
    });
  });

  // 20 two-variant cases: weights sum to 100 after normalisation
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(a => {
    const b = 100 - a * 3;  // non-100 totals
    if (b <= 0) return;
    it(`two-variant [${a}, ${b}] normalises to sum 100`, () => {
      const vs = [makeVariant({ id: 'a', weight: a }), makeVariant({ id: 'b', weight: b })];
      expect(totalWeight(normaliseWeights(vs))).toBeCloseTo(100, 3);
    });
  });
});

// ---------------------------------------------------------------------------
// 23. Extended assignVariant distribution checks
// ---------------------------------------------------------------------------

describe('assignVariant distribution extended', () => {
  // For an experiment with two equal-weight variants, over 100 unique users
  // we expect both variants to appear at least once
  const equalExp = makeRunningExperiment({
    id: 'dist-exp',
    variants: [
      makeVariant({ id: 'a', type: 'control', weight: 50 }),
      makeVariant({ id: 'b', type: 'treatment', weight: 50 }),
    ],
  });

  // 50 determinism checks for different user patterns
  Array.from({ length: 50 }, (_, i) => `dist-user-${i * 7}`).forEach(uid => {
    it(`assignVariant is consistent for user '${uid}'`, () => {
      const r1 = assignVariant(uid, equalExp);
      const r2 = assignVariant(uid, equalExp);
      expect(r1?.variantId).toBe(r2?.variantId);
    });
  });

  // 30 checks that assigned variantId is always one of the defined variants
  Array.from({ length: 30 }, (_, i) => `bounds-user-${i}`).forEach(uid => {
    it(`assignVariant result for '${uid}' is within valid variant ids`, () => {
      const result = assignVariant(uid, equalExp);
      expect(['a', 'b']).toContain(result?.variantId);
    });
  });
});

// ---------------------------------------------------------------------------
// 24. Extended computeVariantStats parameterisation
// ---------------------------------------------------------------------------

describe('computeVariantStats extended', () => {
  const vid = 'ext-variant';
  const eid = 'ext-exp';

  // 20 cases: N non-converting participants → conversionRate 0
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`${n} participants with 0 conversions → conversionRate 0`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        makeConversionEvent(`user-${i}`, eid, vid, 0),
      );
      expect(computeVariantStats(vid, events).conversionRate).toBe(0);
    });
  });

  // 20 cases: N participants all converting → rate 1
  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`${n} participants all converting → conversionRate 1`, () => {
      const events = Array.from({ length: n }, (_, i) =>
        makeConversionEvent(`cu${i}`, eid, vid, 1),
      );
      expect(computeVariantStats(vid, events).conversionRate).toBe(1);
    });
  });

  // 20 revenue accumulation cases
  Array.from({ length: 20 }, (_, i) => (i + 1) * 5).forEach(amount => {
    it(`single revenue event of ${amount} → totalRevenue ${amount}`, () => {
      const events = [makeRevenueEvent('u1', eid, vid, amount)];
      expect(computeVariantStats(vid, events).totalRevenue).toBe(amount);
    });
  });

  // 10 participant-uniqueness checks
  Array.from({ length: 10 }, (_, i) => i + 2).forEach(numDup => {
    it(`${numDup} duplicate events from same user → 1 participant`, () => {
      const events = Array.from({ length: numDup }, () =>
        makeConversionEvent('same-user', eid, vid, 1),
      );
      expect(computeVariantStats(vid, events).participants).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// 25. Extended isValidStatus and isValidMetric with generated strings
// ---------------------------------------------------------------------------

describe('isValidStatus generated invalids', () => {
  // 50 generated strings that should never be valid statuses
  const prefixes = ['x', 'test', 'foo', 'bar', 'baz', 'qux', 'abc', 'xyz', 'zzz', 'aaa'];
  const suffixes = ['1', '2', '3', '4', '5'];
  prefixes.forEach(p => {
    suffixes.forEach(s => {
      it(`'${p}${s}' is not a valid status`, () => {
        expect(isValidStatus(`${p}${s}`)).toBe(false);
      });
    });
  });
});

describe('isValidMetric generated invalids', () => {
  // 50 generated strings that should never be valid metrics
  const prefixes2 = ['m', 'kpi', 'stat', 'cnt', 'sum', 'avg', 'max', 'min', 'p95', 'err'];
  const suffixes2 = ['1', '2', '3', '4', '5'];
  prefixes2.forEach(p => {
    suffixes2.forEach(s => {
      it(`'${p}${s}' is not a valid metric`, () => {
        expect(isValidMetric(`${p}${s}`)).toBe(false);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 26. Extended filterActiveExperiments large-scale checks
// ---------------------------------------------------------------------------

describe('filterActiveExperiments large-scale', () => {
  // 20 checks: arrays of size N with exactly K running
  const largeCases: Array<[number, number]> = [
    [10, 3], [10, 7], [20, 5], [20, 15], [30, 10], [30, 20],
    [15, 0], [15, 15], [5, 2], [5, 3],
    [8, 4], [12, 6], [25, 12], [25, 13], [40, 20],
    [40, 0], [40, 40], [50, 25], [50, 10], [50, 40],
  ];
  largeCases.forEach(([total, running]) => {
    it(`${running}/${total} running → exactly ${running} active`, () => {
      const runExps = Array.from({ length: running }, (_, i) =>
        makeRunningExperiment({ id: `lg-run-${total}-${i}` }),
      );
      const draftExps = Array.from({ length: total - running }, (_, i) =>
        makeDraftExperiment({ id: `lg-draft-${total}-${i}` }),
      );
      expect(filterActiveExperiments([...runExps, ...draftExps])).toHaveLength(running);
    });
  });
});

// ---------------------------------------------------------------------------
// 27. Extended getExperimentById search coverage
// ---------------------------------------------------------------------------

describe('getExperimentById extended', () => {
  // Build a pool of 30 experiments with unique ids
  const pool = Array.from({ length: 30 }, (_, i) =>
    makeDraftExperiment({ id: `pool-${i}`, name: `Pool Exp ${i}` }),
  );

  // Search for each one successfully
  pool.forEach((exp, i) => {
    it(`finds pool experiment ${i} by id '${exp.id}'`, () => {
      expect(getExperimentById(pool, exp.id)?.id).toBe(exp.id);
    });
  });

  // 20 miss checks
  Array.from({ length: 20 }, (_, i) => `missing-${i}`).forEach(missingId => {
    it(`returns undefined for non-existent id '${missingId}'`, () => {
      expect(getExperimentById(pool, missingId)).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// 28. Extended makeEvent parameterisation
// ---------------------------------------------------------------------------

describe('makeEvent extended', () => {
  // 40 events with distinct userId patterns
  Array.from({ length: 40 }, (_, i) => `mk-user-${i}`).forEach(uid => {
    it(`makeEvent userId '${uid}' stored`, () => {
      expect(makeEvent(uid, 'e1', 'v1', 'conversion', 1).userId).toBe(uid);
    });
  });

  // 20 events with distinct experimentId patterns
  Array.from({ length: 20 }, (_, i) => `mk-exp-${i}`).forEach(eid => {
    it(`makeEvent experimentId '${eid}' stored`, () => {
      expect(makeEvent('u1', eid, 'v1', 'conversion', 1).experimentId).toBe(eid);
    });
  });

  // 20 events with fractional values
  Array.from({ length: 20 }, (_, i) => parseFloat((i * 0.15).toFixed(2))).forEach(val => {
    it(`makeEvent fractional value ${val} stored`, () => {
      expect(makeEvent('u', 'e', 'v', 'revenue', val).value).toBeCloseTo(val, 5);
    });
  });
});

// ---------------------------------------------------------------------------
// 29. startExperiment / pauseExperiment / completeExperiment bulk
// ---------------------------------------------------------------------------

describe('lifecycle transitions bulk', () => {
  // 30 experiments: all start correctly from draft
  Array.from({ length: 30 }, (_, i) => `bulk-exp-${i}`).forEach(id => {
    it(`draft experiment '${id}' starts with status running`, () => {
      const draft = makeDraftExperiment({ id });
      expect(startExperiment(draft).status).toBe('running');
    });
  });

  // 20 experiments: pauseExperiment always yields paused
  Array.from({ length: 20 }, (_, i) => `pause-bulk-${i}`).forEach(id => {
    it(`running experiment '${id}' pauses correctly`, () => {
      const running = makeRunningExperiment({ id });
      expect(pauseExperiment(running).status).toBe('paused');
    });
  });

  // 20 experiments: completeExperiment always yields completed with endDate
  Array.from({ length: 20 }, (_, i) => `complete-bulk-${i}`).forEach(id => {
    it(`running experiment '${id}' completes with endDate`, () => {
      const running = makeRunningExperiment({ id });
      const completed = completeExperiment(running);
      expect(completed.status).toBe('completed');
      expect(completed.endDate).toBeDefined();
    });
  });
});
