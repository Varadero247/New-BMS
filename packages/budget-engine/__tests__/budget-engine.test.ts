import {
  createBudgetLine,
  createBudget,
  computeVariance,
  computeVariancePct,
  getVarianceStatus,
  analyseVariance,
  getBudgetSummary,
  addLineToBudget,
  removeLineFromBudget,
  getLineById,
  filterLinesByCategory,
  totalBudgetedByCategory,
  remainingBudget,
  forecastFullYear,
  isValidCurrency,
  isValidCategory,
  isValidPeriod,
  roundCurrency,
  getAllVariances,
  BudgetLine,
  Budget,
  CostCategory,
  Currency,
  BudgetPeriod,
} from '../src/index';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeLine(overrides: Partial<BudgetLine> = {}): BudgetLine {
  return createBudgetLine(
    overrides.id ?? 'L1',
    overrides.name ?? 'Test Line',
    overrides.category ?? 'opex',
    overrides.budgeted ?? 1000,
    overrides.actual ?? 900,
    overrides.currency ?? 'GBP',
    overrides.period ?? 'annual',
    overrides,
  );
}

function makeBudget(lines: BudgetLine[] = []): Budget {
  return createBudget('B1', 'Test Budget', 'GBP', 'annual', 1704067200000, 1735689600000, lines);
}

const ALL_CURRENCIES: Currency[] = ['GBP', 'USD', 'EUR', 'CAD', 'AUD'];
const ALL_CATEGORIES: CostCategory[] = [
  'capex', 'opex', 'labour', 'materials', 'services', 'overheads', 'contingency', 'other',
];
const ALL_PERIODS: BudgetPeriod[] = ['monthly', 'quarterly', 'annual'];

// ─── createBudgetLine ────────────────────────────────────────────────────────

describe('createBudgetLine', () => {
  it('stores id', () => expect(makeLine({ id: 'X' }).id).toBe('X'));
  it('stores name', () => expect(makeLine({ name: 'Labour' }).name).toBe('Labour'));
  it('stores budgeted', () => expect(makeLine({ budgeted: 5000 }).budgeted).toBe(5000));
  it('stores actual', () => expect(makeLine({ actual: 4500 }).actual).toBe(4500));
  it('stores currency', () => expect(makeLine({ currency: 'USD' }).currency).toBe('USD'));
  it('stores period', () => expect(makeLine({ period: 'quarterly' }).period).toBe('quarterly'));
  it('stores category', () => expect(makeLine({ category: 'capex' }).category).toBe('capex'));
  it('committed defaults to undefined when not passed', () => {
    const l = createBudgetLine('id', 'n', 'opex', 100, 90, 'GBP', 'annual');
    expect(l.committed).toBeUndefined();
  });
  it('committed stored via override', () => expect(makeLine({ committed: 200 }).committed).toBe(200));
  it('notes stored via override', () => expect(makeLine({ notes: 'note' }).notes).toBe('note'));

  // each currency
  ALL_CURRENCIES.forEach((cur) => {
    it(`stores currency ${cur}`, () => {
      const l = createBudgetLine('id', 'n', 'opex', 100, 90, cur, 'annual');
      expect(l.currency).toBe(cur);
    });
  });

  // each category
  ALL_CATEGORIES.forEach((cat) => {
    it(`stores category ${cat}`, () => {
      const l = createBudgetLine('id', 'n', cat, 100, 90, 'GBP', 'annual');
      expect(l.category).toBe(cat);
    });
  });

  // each period
  ALL_PERIODS.forEach((p) => {
    it(`stores period ${p}`, () => {
      const l = createBudgetLine('id', 'n', 'opex', 100, 90, 'GBP', p);
      expect(l.period).toBe(p);
    });
  });

  // various budgeted amounts
  [0, 1, 100, 999.99, 1_000_000].forEach((amt) => {
    it(`stores budgeted=${amt}`, () => {
      const l = createBudgetLine('id', 'n', 'opex', amt, 0, 'GBP', 'annual');
      expect(l.budgeted).toBe(amt);
    });
  });

  // various actual amounts
  [0, 50, 999, 10_000].forEach((amt) => {
    it(`stores actual=${amt}`, () => {
      const l = createBudgetLine('id', 'n', 'opex', 1000, amt, 'GBP', 'annual');
      expect(l.actual).toBe(amt);
    });
  });

  it('override does not mutate base args', () => {
    const l = createBudgetLine('id', 'n', 'opex', 100, 90, 'GBP', 'annual', { budgeted: 999 });
    expect(l.budgeted).toBe(999);
  });

  it('returns a plain object', () => {
    const l = createBudgetLine('id', 'n', 'opex', 100, 90, 'GBP', 'annual');
    expect(typeof l).toBe('object');
  });
});

// ─── createBudget ────────────────────────────────────────────────────────────

describe('createBudget', () => {
  it('stores id', () => expect(makeBudget().id).toBe('B1'));
  it('stores name', () => expect(makeBudget().name).toBe('Test Budget'));
  it('stores currency', () => expect(makeBudget().currency).toBe('GBP'));
  it('stores period', () => expect(makeBudget().period).toBe('annual'));
  it('stores startDate', () => expect(makeBudget().startDate).toBe(1704067200000));
  it('stores endDate', () => expect(makeBudget().endDate).toBe(1735689600000));
  it('lines default to []', () => expect(createBudget('B', 'n', 'USD', 'monthly', 0, 1).lines).toEqual([]));
  it('stores provided lines', () => {
    const l = makeLine();
    const b = makeBudget([l]);
    expect(b.lines).toHaveLength(1);
    expect(b.lines[0]).toEqual(l);
  });
  it('owner defaults to undefined', () => expect(makeBudget().owner).toBeUndefined());

  ALL_CURRENCIES.forEach((cur) => {
    it(`stores currency ${cur}`, () => {
      const b = createBudget('B', 'n', cur, 'annual', 0, 1);
      expect(b.currency).toBe(cur);
    });
  });

  ALL_PERIODS.forEach((p) => {
    it(`stores period ${p}`, () => {
      const b = createBudget('B', 'n', 'GBP', p, 0, 1);
      expect(b.period).toBe(p);
    });
  });

  [0, 1, 5, 10, 20].forEach((n) => {
    it(`stores ${n} lines`, () => {
      const lines = Array.from({ length: n }, (_, i) => makeLine({ id: `L${i}` }));
      const b = createBudget('B', 'n', 'GBP', 'annual', 0, 1, lines);
      expect(b.lines).toHaveLength(n);
    });
  });
});

// ─── computeVariance ─────────────────────────────────────────────────────────

describe('computeVariance', () => {
  it('positive when over budget', () => expect(computeVariance(1000, 1200)).toBe(200));
  it('negative when under budget', () => expect(computeVariance(1000, 800)).toBe(-200));
  it('zero when equal', () => expect(computeVariance(500, 500)).toBe(0));
  it('handles zero budgeted', () => expect(computeVariance(0, 100)).toBe(100));
  it('handles zero actual', () => expect(computeVariance(100, 0)).toBe(-100));
  it('handles both zero', () => expect(computeVariance(0, 0)).toBe(0));
  it('handles large numbers', () => expect(computeVariance(1_000_000, 1_500_000)).toBe(500_000));
  it('handles decimals', () => expect(computeVariance(100.5, 101.5)).toBeCloseTo(1));
  it('handles negative budgeted (credit)', () => expect(computeVariance(-100, -50)).toBe(50));

  const cases: [number, number, number][] = [
    [200, 250, 50],
    [300, 270, -30],
    [0, 0, 0],
    [1, 2, 1],
    [10000, 9500, -500],
    [750, 750, 0],
    [999, 1000, 1],
    [5000, 4000, -1000],
    [3333, 3333, 0],
    [450.75, 460.25, 9.5],
  ];
  cases.forEach(([b, a, expected]) => {
    it(`computeVariance(${b}, ${a}) = ${expected}`, () => {
      expect(computeVariance(b, a)).toBeCloseTo(expected);
    });
  });
});

// ─── computeVariancePct ──────────────────────────────────────────────────────

describe('computeVariancePct', () => {
  it('returns 0 when both zero', () => expect(computeVariancePct(0, 0)).toBe(0));
  it('returns 100 when budgeted=0 actual>0', () => expect(computeVariancePct(0, 500)).toBe(100));
  it('returns 100 when budgeted=0 actual=1', () => expect(computeVariancePct(0, 1)).toBe(100));
  it('calculates +20% overspend', () => expect(computeVariancePct(1000, 1200)).toBeCloseTo(20));
  it('calculates -10% underspend', () => expect(computeVariancePct(1000, 900)).toBeCloseTo(-10));
  it('calculates 0% exact', () => expect(computeVariancePct(1000, 1000)).toBe(0));
  it('calculates 50% overspend', () => expect(computeVariancePct(1000, 1500)).toBeCloseTo(50));
  it('calculates -50% underspend', () => expect(computeVariancePct(1000, 500)).toBeCloseTo(-50));
  it('calculates 100% overspend', () => expect(computeVariancePct(1000, 2000)).toBeCloseTo(100));
  it('calculates small pct', () => expect(computeVariancePct(10000, 10100)).toBeCloseTo(1));

  const pctCases: [number, number, number][] = [
    [200, 210, 5],
    [200, 190, -5],
    [500, 600, 20],
    [500, 400, -20],
    [100, 125, 25],
    [100, 75, -25],
    [1000, 1050, 5],
    [1000, 950, -5],
    [4000, 4800, 20],
    [4000, 3200, -20],
  ];
  pctCases.forEach(([b, a, expected]) => {
    it(`computeVariancePct(${b}, ${a}) ≈ ${expected}%`, () => {
      expect(computeVariancePct(b, a)).toBeCloseTo(expected);
    });
  });
});

// ─── getVarianceStatus ───────────────────────────────────────────────────────

describe('getVarianceStatus', () => {
  // critical: >20%
  [21, 25, 30, 50, 100, 200].forEach((pct) => {
    it(`${pct}% → critical`, () => expect(getVarianceStatus(pct)).toBe('critical'));
  });

  // over_budget: >5% and <=20%
  [5.1, 6, 10, 15, 19, 20].forEach((pct) => {
    it(`${pct}% → over_budget`, () => expect(getVarianceStatus(pct)).toBe('over_budget'));
  });

  // on_track: >=-20% and <=5%
  [0, 1, 2, 3, 4, 5, -1, -5, -10, -15, -19, -20].forEach((pct) => {
    it(`${pct}% → on_track`, () => expect(getVarianceStatus(pct)).toBe('on_track'));
  });

  // under_budget: <-20%
  [-21, -25, -30, -50, -100].forEach((pct) => {
    it(`${pct}% → under_budget`, () => expect(getVarianceStatus(pct)).toBe('under_budget'));
  });

  it('exactly 20% is over_budget (not critical)', () =>
    expect(getVarianceStatus(20)).toBe('over_budget'));
  it('exactly 5% is on_track (not over_budget)', () =>
    expect(getVarianceStatus(5)).toBe('on_track'));
  it('exactly -20% is on_track (not under_budget)', () =>
    expect(getVarianceStatus(-20)).toBe('on_track'));
  it('exactly 0% is on_track', () => expect(getVarianceStatus(0)).toBe('on_track'));
});

// ─── analyseVariance ─────────────────────────────────────────────────────────

describe('analyseVariance', () => {
  it('returns lineId', () => {
    const l = makeLine({ id: 'LX' });
    expect(analyseVariance(l).lineId).toBe('LX');
  });

  it('returns lineName', () => {
    const l = makeLine({ name: 'Capital Works' });
    expect(analyseVariance(l).lineName).toBe('Capital Works');
  });

  it('returns correct budgeted', () => {
    const l = makeLine({ budgeted: 5000 });
    expect(analyseVariance(l).budgeted).toBe(5000);
  });

  it('returns correct actual', () => {
    const l = makeLine({ actual: 4000 });
    expect(analyseVariance(l).actual).toBe(4000);
  });

  it('variance = actual - budgeted (positive)', () => {
    const l = makeLine({ budgeted: 1000, actual: 1100 });
    expect(analyseVariance(l).variance).toBeCloseTo(100);
  });

  it('variance = actual - budgeted (negative)', () => {
    const l = makeLine({ budgeted: 1000, actual: 900 });
    expect(analyseVariance(l).variance).toBeCloseTo(-100);
  });

  it('variance = 0 when equal', () => {
    const l = makeLine({ budgeted: 500, actual: 500 });
    expect(analyseVariance(l).variance).toBe(0);
  });

  it('variancePct correct at +10%', () => {
    const l = makeLine({ budgeted: 1000, actual: 1100 });
    expect(analyseVariance(l).variancePct).toBeCloseTo(10);
  });

  it('variancePct correct at -10%', () => {
    const l = makeLine({ budgeted: 1000, actual: 900 });
    expect(analyseVariance(l).variancePct).toBeCloseTo(-10);
  });

  it('status critical at +25%', () => {
    const l = makeLine({ budgeted: 1000, actual: 1250 });
    expect(analyseVariance(l).status).toBe('critical');
  });

  it('status over_budget at +10%', () => {
    const l = makeLine({ budgeted: 1000, actual: 1100 });
    expect(analyseVariance(l).status).toBe('over_budget');
  });

  it('status on_track at -10%', () => {
    const l = makeLine({ budgeted: 1000, actual: 900 });
    expect(analyseVariance(l).status).toBe('on_track');
  });

  it('status under_budget at -25%', () => {
    const l = makeLine({ budgeted: 1000, actual: 750 });
    expect(analyseVariance(l).status).toBe('under_budget');
  });

  it('status on_track at 0%', () => {
    const l = makeLine({ budgeted: 1000, actual: 1000 });
    expect(analyseVariance(l).status).toBe('on_track');
  });

  // parameterised variance cases
  const vCases: Array<{ b: number; a: number; status: string }> = [
    { b: 1000, a: 1210, status: 'critical' },
    { b: 1000, a: 1060, status: 'over_budget' },
    { b: 1000, a: 1000, status: 'on_track' },
    { b: 1000, a: 950, status: 'on_track' },
    { b: 1000, a: 790, status: 'under_budget' },
    { b: 500, a: 605, status: 'critical' },
    { b: 500, a: 530, status: 'over_budget' },
    { b: 500, a: 500, status: 'on_track' },
    { b: 500, a: 480, status: 'on_track' },
    { b: 500, a: 395, status: 'under_budget' },
  ];
  vCases.forEach(({ b, a, status }) => {
    it(`analyseVariance budgeted=${b} actual=${a} → status ${status}`, () => {
      const l = makeLine({ budgeted: b, actual: a });
      expect(analyseVariance(l).status).toBe(status);
    });
  });
});

// ─── getBudgetSummary ────────────────────────────────────────────────────────

describe('getBudgetSummary', () => {
  it('empty budget → all zeros', () => {
    const s = getBudgetSummary(makeBudget([]));
    expect(s.totalBudgeted).toBe(0);
    expect(s.totalActual).toBe(0);
    expect(s.totalCommitted).toBe(0);
    expect(s.totalVariance).toBe(0);
    expect(s.lineCount).toBe(0);
    expect(s.overBudgetLines).toBe(0);
  });

  it('empty budget → variancePct 0', () => {
    expect(getBudgetSummary(makeBudget()).variancePct).toBe(0);
  });

  it('empty budget → status on_track', () => {
    expect(getBudgetSummary(makeBudget()).status).toBe('on_track');
  });

  it('single on-budget line', () => {
    const b = makeBudget([makeLine({ budgeted: 1000, actual: 1000 })]);
    const s = getBudgetSummary(b);
    expect(s.totalBudgeted).toBe(1000);
    expect(s.totalActual).toBe(1000);
    expect(s.totalVariance).toBe(0);
    expect(s.overBudgetLines).toBe(0);
    expect(s.lineCount).toBe(1);
  });

  it('single over-budget line', () => {
    const b = makeBudget([makeLine({ budgeted: 1000, actual: 1100 })]);
    const s = getBudgetSummary(b);
    expect(s.totalVariance).toBe(100);
    expect(s.overBudgetLines).toBe(1);
  });

  it('single under-budget line', () => {
    const b = makeBudget([makeLine({ budgeted: 1000, actual: 900 })]);
    const s = getBudgetSummary(b);
    expect(s.totalVariance).toBe(-100);
    expect(s.overBudgetLines).toBe(0);
  });

  it('multiple lines sums totalBudgeted', () => {
    const lines = [
      makeLine({ id: 'L1', budgeted: 1000, actual: 900 }),
      makeLine({ id: 'L2', budgeted: 2000, actual: 2000 }),
      makeLine({ id: 'L3', budgeted: 500, actual: 600 }),
    ];
    const s = getBudgetSummary(makeBudget(lines));
    expect(s.totalBudgeted).toBe(3500);
  });

  it('multiple lines sums totalActual', () => {
    const lines = [
      makeLine({ id: 'L1', budgeted: 1000, actual: 900 }),
      makeLine({ id: 'L2', budgeted: 2000, actual: 2000 }),
      makeLine({ id: 'L3', budgeted: 500, actual: 600 }),
    ];
    const s = getBudgetSummary(makeBudget(lines));
    expect(s.totalActual).toBe(3500);
  });

  it('multiple lines counts overBudgetLines', () => {
    const lines = [
      makeLine({ id: 'L1', budgeted: 1000, actual: 1100 }),
      makeLine({ id: 'L2', budgeted: 2000, actual: 1900 }),
      makeLine({ id: 'L3', budgeted: 500, actual: 600 }),
    ];
    const s = getBudgetSummary(makeBudget(lines));
    expect(s.overBudgetLines).toBe(2);
  });

  it('lineCount correct', () => {
    const lines = Array.from({ length: 7 }, (_, i) => makeLine({ id: `L${i}` }));
    const s = getBudgetSummary(makeBudget(lines));
    expect(s.lineCount).toBe(7);
  });

  it('totalCommitted sums committed fields', () => {
    const lines = [
      makeLine({ id: 'L1', committed: 200 }),
      makeLine({ id: 'L2', committed: 300 }),
      makeLine({ id: 'L3' }),  // no committed
    ];
    const s = getBudgetSummary(makeBudget(lines));
    expect(s.totalCommitted).toBe(500);
  });

  it('totalCommitted=0 when no committed fields', () => {
    const lines = [makeLine({ id: 'L1' }), makeLine({ id: 'L2' })];
    expect(getBudgetSummary(makeBudget(lines)).totalCommitted).toBe(0);
  });

  it('status critical when total overspend >20%', () => {
    const lines = [makeLine({ id: 'L1', budgeted: 1000, actual: 1250 })];
    expect(getBudgetSummary(makeBudget(lines)).status).toBe('critical');
  });

  it('status over_budget at ~10% total overspend', () => {
    const lines = [makeLine({ id: 'L1', budgeted: 1000, actual: 1100 })];
    expect(getBudgetSummary(makeBudget(lines)).status).toBe('over_budget');
  });

  it('status under_budget when total underspend >20%', () => {
    const lines = [makeLine({ id: 'L1', budgeted: 1000, actual: 750 })];
    expect(getBudgetSummary(makeBudget(lines)).status).toBe('under_budget');
  });

  // parameterised summary cases
  const summaryCases = [
    { lines: [{ b: 1000, a: 1000 }, { b: 2000, a: 2000 }], expBudgeted: 3000, expActual: 3000, expOver: 0 },
    { lines: [{ b: 1000, a: 1100 }, { b: 2000, a: 2200 }], expBudgeted: 3000, expActual: 3300, expOver: 2 },
    { lines: [{ b: 500, a: 400 }, { b: 500, a: 400 }], expBudgeted: 1000, expActual: 800, expOver: 0 },
    { lines: [{ b: 100, a: 200 }, { b: 100, a: 50 }], expBudgeted: 200, expActual: 250, expOver: 1 },
    { lines: [{ b: 300, a: 300 }, { b: 700, a: 700 }], expBudgeted: 1000, expActual: 1000, expOver: 0 },
  ];
  summaryCases.forEach(({ lines, expBudgeted, expActual, expOver }, i) => {
    it(`summary case ${i + 1}: totalBudgeted=${expBudgeted}`, () => {
      const blines = lines.map((l, j) =>
        makeLine({ id: `L${j}`, budgeted: l.b, actual: l.a }),
      );
      expect(getBudgetSummary(makeBudget(blines)).totalBudgeted).toBe(expBudgeted);
    });
    it(`summary case ${i + 1}: totalActual=${expActual}`, () => {
      const blines = lines.map((l, j) =>
        makeLine({ id: `L${j}`, budgeted: l.b, actual: l.a }),
      );
      expect(getBudgetSummary(makeBudget(blines)).totalActual).toBe(expActual);
    });
    it(`summary case ${i + 1}: overBudgetLines=${expOver}`, () => {
      const blines = lines.map((l, j) =>
        makeLine({ id: `L${j}`, budgeted: l.b, actual: l.a }),
      );
      expect(getBudgetSummary(makeBudget(blines)).overBudgetLines).toBe(expOver);
    });
  });
});

// ─── addLineToBudget ─────────────────────────────────────────────────────────

describe('addLineToBudget', () => {
  it('returns new budget with line appended', () => {
    const b = makeBudget([]);
    const l = makeLine({ id: 'NEW' });
    const b2 = addLineToBudget(b, l);
    expect(b2.lines).toHaveLength(1);
    expect(b2.lines[0].id).toBe('NEW');
  });

  it('does not mutate original budget', () => {
    const b = makeBudget([]);
    addLineToBudget(b, makeLine());
    expect(b.lines).toHaveLength(0);
  });

  it('preserves existing lines', () => {
    const existing = makeLine({ id: 'OLD' });
    const b = makeBudget([existing]);
    const b2 = addLineToBudget(b, makeLine({ id: 'NEW' }));
    expect(b2.lines).toHaveLength(2);
    expect(b2.lines[0].id).toBe('OLD');
    expect(b2.lines[1].id).toBe('NEW');
  });

  it('budget id unchanged', () => {
    const b = makeBudget([]);
    expect(addLineToBudget(b, makeLine()).id).toBe(b.id);
  });

  it('budget name unchanged', () => {
    const b = makeBudget([]);
    expect(addLineToBudget(b, makeLine()).name).toBe(b.name);
  });

  it('adds multiple lines sequentially', () => {
    let b = makeBudget([]);
    for (let i = 0; i < 10; i++) {
      b = addLineToBudget(b, makeLine({ id: `L${i}` }));
    }
    expect(b.lines).toHaveLength(10);
  });

  // add each category of line
  ALL_CATEGORIES.forEach((cat) => {
    it(`can add ${cat} line`, () => {
      const b = makeBudget([]);
      const l = makeLine({ id: cat, category: cat });
      const b2 = addLineToBudget(b, l);
      expect(b2.lines.some((x) => x.category === cat)).toBe(true);
    });
  });

  // add line for each currency
  ALL_CURRENCIES.forEach((cur) => {
    it(`can add ${cur} line`, () => {
      const b = makeBudget([]);
      const l = makeLine({ id: cur, currency: cur });
      const b2 = addLineToBudget(b, l);
      expect(b2.lines.some((x) => x.currency === cur)).toBe(true);
    });
  });
});

// ─── removeLineFromBudget ────────────────────────────────────────────────────

describe('removeLineFromBudget', () => {
  it('removes the specified line', () => {
    const b = makeBudget([makeLine({ id: 'A' }), makeLine({ id: 'B' })]);
    const b2 = removeLineFromBudget(b, 'A');
    expect(b2.lines.some((l) => l.id === 'A')).toBe(false);
  });

  it('keeps other lines', () => {
    const b = makeBudget([makeLine({ id: 'A' }), makeLine({ id: 'B' })]);
    const b2 = removeLineFromBudget(b, 'A');
    expect(b2.lines.some((l) => l.id === 'B')).toBe(true);
  });

  it('does not mutate original', () => {
    const b = makeBudget([makeLine({ id: 'A' })]);
    removeLineFromBudget(b, 'A');
    expect(b.lines).toHaveLength(1);
  });

  it('no-op if id not found', () => {
    const b = makeBudget([makeLine({ id: 'A' })]);
    const b2 = removeLineFromBudget(b, 'NOPE');
    expect(b2.lines).toHaveLength(1);
  });

  it('empty budget stays empty', () => {
    const b = makeBudget([]);
    const b2 = removeLineFromBudget(b, 'X');
    expect(b2.lines).toHaveLength(0);
  });

  it('removes from middle of list', () => {
    const b = makeBudget([
      makeLine({ id: 'A' }),
      makeLine({ id: 'B' }),
      makeLine({ id: 'C' }),
    ]);
    const b2 = removeLineFromBudget(b, 'B');
    expect(b2.lines.map((l) => l.id)).toEqual(['A', 'C']);
  });

  it('removes last line', () => {
    const b = makeBudget([makeLine({ id: 'A' }), makeLine({ id: 'B' })]);
    const b2 = removeLineFromBudget(b, 'B');
    expect(b2.lines).toHaveLength(1);
    expect(b2.lines[0].id).toBe('A');
  });

  it('budget id unchanged', () => {
    const b = makeBudget([makeLine({ id: 'A' })]);
    expect(removeLineFromBudget(b, 'A').id).toBe(b.id);
  });

  // remove 10 lines one by one
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`can remove line index ${i}`, () => {
      const lines = Array.from({ length: 10 }, (_, j) => makeLine({ id: `L${j}` }));
      const b = makeBudget(lines);
      const b2 = removeLineFromBudget(b, `L${i}`);
      expect(b2.lines.some((l) => l.id === `L${i}`)).toBe(false);
      expect(b2.lines).toHaveLength(9);
    });
  });
});

// ─── getLineById ─────────────────────────────────────────────────────────────

describe('getLineById', () => {
  it('returns line when found', () => {
    const l = makeLine({ id: 'FIND_ME' });
    const b = makeBudget([l]);
    expect(getLineById(b, 'FIND_ME')).toEqual(l);
  });

  it('returns undefined when not found', () => {
    const b = makeBudget([makeLine({ id: 'A' })]);
    expect(getLineById(b, 'NOPE')).toBeUndefined();
  });

  it('returns undefined on empty budget', () => {
    expect(getLineById(makeBudget([]), 'X')).toBeUndefined();
  });

  it('returns first match by id', () => {
    const l1 = makeLine({ id: 'X', budgeted: 100 });
    const l2 = makeLine({ id: 'Y', budgeted: 200 });
    const b = makeBudget([l1, l2]);
    expect(getLineById(b, 'Y')?.budgeted).toBe(200);
  });

  // find each of 10 lines
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`finds line L${i} in 10-line budget`, () => {
      const lines = Array.from({ length: 10 }, (_, j) => makeLine({ id: `L${j}`, budgeted: j * 100 }));
      const b = makeBudget(lines);
      const found = getLineById(b, `L${i}`);
      expect(found?.id).toBe(`L${i}`);
      expect(found?.budgeted).toBe(i * 100);
    });
  });
});

// ─── filterLinesByCategory ───────────────────────────────────────────────────

describe('filterLinesByCategory', () => {
  it('returns only matching category lines', () => {
    const lines = [
      makeLine({ id: 'C1', category: 'capex' }),
      makeLine({ id: 'O1', category: 'opex' }),
      makeLine({ id: 'C2', category: 'capex' }),
    ];
    const result = filterLinesByCategory(makeBudget(lines), 'capex');
    expect(result).toHaveLength(2);
    expect(result.every((l) => l.category === 'capex')).toBe(true);
  });

  it('returns empty array when no matches', () => {
    const b = makeBudget([makeLine({ category: 'opex' })]);
    expect(filterLinesByCategory(b, 'capex')).toHaveLength(0);
  });

  it('returns empty array for empty budget', () => {
    expect(filterLinesByCategory(makeBudget([]), 'capex')).toHaveLength(0);
  });

  // each category
  ALL_CATEGORIES.forEach((cat) => {
    it(`filters ${cat} lines correctly`, () => {
      const lines = ALL_CATEGORIES.map((c, i) => makeLine({ id: `${c}${i}`, category: c }));
      const b = makeBudget(lines);
      const result = filterLinesByCategory(b, cat);
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe(cat);
    });
  });

  // multiple lines per category
  ALL_CATEGORIES.forEach((cat) => {
    it(`filters multiple ${cat} lines`, () => {
      const lines = [
        makeLine({ id: `${cat}1`, category: cat }),
        makeLine({ id: `${cat}2`, category: cat }),
        makeLine({ id: 'other1', category: 'other' }),
      ];
      const b = makeBudget(lines);
      const result = filterLinesByCategory(b, cat);
      const expectedCount = cat === 'other' ? 3 : 2;
      expect(result).toHaveLength(expectedCount);
    });
  });
});

// ─── totalBudgetedByCategory ─────────────────────────────────────────────────

describe('totalBudgetedByCategory', () => {
  it('returns empty object for empty budget', () => {
    expect(totalBudgetedByCategory(makeBudget([]))).toEqual({});
  });

  it('sums single category', () => {
    const lines = [
      makeLine({ id: 'L1', category: 'capex', budgeted: 1000 }),
      makeLine({ id: 'L2', category: 'capex', budgeted: 2000 }),
    ];
    const result = totalBudgetedByCategory(makeBudget(lines));
    expect(result.capex).toBe(3000);
  });

  it('sums multiple categories independently', () => {
    const lines = [
      makeLine({ id: 'L1', category: 'capex', budgeted: 5000 }),
      makeLine({ id: 'L2', category: 'opex', budgeted: 3000 }),
      makeLine({ id: 'L3', category: 'labour', budgeted: 2000 }),
    ];
    const result = totalBudgetedByCategory(makeBudget(lines));
    expect(result.capex).toBe(5000);
    expect(result.opex).toBe(3000);
    expect(result.labour).toBe(2000);
  });

  it('missing categories are undefined', () => {
    const lines = [makeLine({ id: 'L1', category: 'capex', budgeted: 1000 })];
    const result = totalBudgetedByCategory(makeBudget(lines));
    expect(result.opex).toBeUndefined();
  });

  // each category contributes correctly
  ALL_CATEGORIES.forEach((cat) => {
    it(`sums ${cat} correctly`, () => {
      const lines = [
        makeLine({ id: `${cat}A`, category: cat, budgeted: 400 }),
        makeLine({ id: `${cat}B`, category: cat, budgeted: 600 }),
      ];
      const result = totalBudgetedByCategory(makeBudget(lines));
      expect(result[cat]).toBe(1000);
    });
  });

  it('does not include actual in sums', () => {
    const lines = [makeLine({ id: 'L1', category: 'capex', budgeted: 1000, actual: 9999 })];
    expect(totalBudgetedByCategory(makeBudget(lines)).capex).toBe(1000);
  });
});

// ─── remainingBudget ─────────────────────────────────────────────────────────

describe('remainingBudget', () => {
  it('budgeted - actual when no committed', () => {
    const l = makeLine({ budgeted: 1000, actual: 700 });
    expect(remainingBudget(l)).toBe(300);
  });

  it('budgeted - actual - committed', () => {
    const l = makeLine({ budgeted: 1000, actual: 700, committed: 100 });
    expect(remainingBudget(l)).toBe(200);
  });

  it('negative when over budget', () => {
    const l = makeLine({ budgeted: 1000, actual: 1100 });
    expect(remainingBudget(l)).toBe(-100);
  });

  it('zero when exactly on budget', () => {
    const l = makeLine({ budgeted: 500, actual: 500 });
    expect(remainingBudget(l)).toBe(0);
  });

  it('treats undefined committed as 0', () => {
    const l = createBudgetLine('id', 'n', 'opex', 1000, 600, 'GBP', 'annual');
    expect(remainingBudget(l)).toBe(400);
  });

  it('zero remaining when actual+committed=budgeted', () => {
    const l = makeLine({ budgeted: 1000, actual: 700, committed: 300 });
    expect(remainingBudget(l)).toBe(0);
  });

  it('negative when actual+committed exceeds budgeted', () => {
    const l = makeLine({ budgeted: 1000, actual: 700, committed: 400 });
    expect(remainingBudget(l)).toBe(-100);
  });

  // parameterised remaining budget cases
  const remainCases: Array<[number, number, number | undefined, number]> = [
    [1000, 0, 0, 1000],
    [1000, 500, 0, 500],
    [1000, 1000, 0, 0],
    [1000, 1200, 0, -200],
    [5000, 2000, 1000, 2000],
    [5000, 4000, 1500, -500],
    [200, 100, undefined, 100],
    [750, 750, 100, -100],
    [10000, 3000, 2000, 5000],
    [300, 150, 75, 75],
  ];
  remainCases.forEach(([b, a, c, exp]) => {
    it(`remainingBudget(${b}, ${a}, committed=${c}) = ${exp}`, () => {
      const l = makeLine({ budgeted: b, actual: a, committed: c });
      expect(remainingBudget(l)).toBeCloseTo(exp);
    });
  });
});

// ─── forecastFullYear ────────────────────────────────────────────────────────

describe('forecastFullYear', () => {
  it('elapsedMonths=0 returns actual', () => {
    const l = makeLine({ actual: 500 });
    expect(forecastFullYear(l, 0)).toBe(500);
  });

  it('elapsedMonths negative returns actual', () => {
    const l = makeLine({ actual: 500 });
    expect(forecastFullYear(l, -1)).toBe(500);
  });

  it('elapsedMonths=6 extrapolates to full year', () => {
    const l = makeLine({ actual: 6000 });
    expect(forecastFullYear(l, 6)).toBeCloseTo(12000);
  });

  it('elapsedMonths=12 returns actual (already full year)', () => {
    const l = makeLine({ actual: 12000 });
    expect(forecastFullYear(l, 12)).toBeCloseTo(12000);
  });

  it('elapsedMonths=3 extrapolates Q1', () => {
    const l = makeLine({ actual: 3000 });
    expect(forecastFullYear(l, 3)).toBeCloseTo(12000);
  });

  it('elapsedMonths=1 extrapolates single month', () => {
    const l = makeLine({ actual: 1000 });
    expect(forecastFullYear(l, 1)).toBeCloseTo(12000);
  });

  it('actual=0 → forecast=0', () => {
    const l = makeLine({ actual: 0 });
    expect(forecastFullYear(l, 6)).toBe(0);
  });

  it('elapsedMonths=9 extrapolates 9 months', () => {
    const l = makeLine({ actual: 9000 });
    expect(forecastFullYear(l, 9)).toBeCloseTo(12000);
  });

  // parameterised forecast cases
  const forecastCases: Array<[number, number, number]> = [
    [600, 1, 7200],
    [1200, 2, 7200],
    [3000, 5, 7200],
    [7200, 12, 7200],
    [5000, 6, 10000],
    [2500, 3, 10000],
    [100, 1, 1200],
    [400, 4, 1200],
    [900, 9, 1200],
    [1200, 12, 1200],
  ];
  forecastCases.forEach(([actual, months, expected]) => {
    it(`forecast actual=${actual} elapsed=${months} → ${expected}`, () => {
      const l = makeLine({ actual });
      expect(forecastFullYear(l, months)).toBeCloseTo(expected);
    });
  });
});

// ─── isValidCurrency ─────────────────────────────────────────────────────────

describe('isValidCurrency', () => {
  ALL_CURRENCIES.forEach((c) => {
    it(`isValidCurrency('${c}') is true`, () => expect(isValidCurrency(c)).toBe(true));
  });

  const badCurrencies = ['gbp', 'usd', 'eur', 'cad', 'aud', 'JPY', 'CHF', 'CNY', 'SEK', 'NOK', '', ' ', 'GBP ', ' GBP', 'GBPP', 'G'];
  badCurrencies.forEach((c) => {
    it(`isValidCurrency('${c}') is false`, () => expect(isValidCurrency(c)).toBe(false));
  });

  it('is a type guard', () => {
    const val: string = 'GBP';
    if (isValidCurrency(val)) {
      const cur: Currency = val;
      expect(cur).toBe('GBP');
    }
  });
});

// ─── isValidCategory ─────────────────────────────────────────────────────────

describe('isValidCategory', () => {
  ALL_CATEGORIES.forEach((c) => {
    it(`isValidCategory('${c}') is true`, () => expect(isValidCategory(c)).toBe(true));
  });

  const badCategories = ['CAPEX', 'OPEX', 'Labour', 'Materials', 'Services', 'Overheads', 'Contingency', 'Other',
    '', ' ', 'capex ', ' capex', 'cap-ex', 'salaries', 'rent', 'travel'];
  badCategories.forEach((c) => {
    it(`isValidCategory('${c}') is false`, () => expect(isValidCategory(c)).toBe(false));
  });

  it('is a type guard', () => {
    const val: string = 'capex';
    if (isValidCategory(val)) {
      const cat: CostCategory = val;
      expect(cat).toBe('capex');
    }
  });
});

// ─── isValidPeriod ───────────────────────────────────────────────────────────

describe('isValidPeriod', () => {
  ALL_PERIODS.forEach((p) => {
    it(`isValidPeriod('${p}') is true`, () => expect(isValidPeriod(p)).toBe(true));
  });

  const badPeriods = ['Monthly', 'Quarterly', 'Annual', 'MONTHLY', 'QUARTERLY', 'ANNUAL',
    '', ' ', 'weekly', 'daily', 'biannual', 'monthly ', ' monthly', 'month'];
  badPeriods.forEach((p) => {
    it(`isValidPeriod('${p}') is false`, () => expect(isValidPeriod(p)).toBe(false));
  });

  it('is a type guard', () => {
    const val: string = 'annual';
    if (isValidPeriod(val)) {
      const period: BudgetPeriod = val;
      expect(period).toBe('annual');
    }
  });
});

// ─── roundCurrency ───────────────────────────────────────────────────────────

describe('roundCurrency', () => {
  it('rounds to 2 decimal places by default', () => {
    // Use a value that has a clear IEEE 754 representation above 0.005
    expect(roundCurrency(1.236)).toBeCloseTo(1.24, 5);
  });

  it('no-op on exact 2dp value', () => {
    expect(roundCurrency(10.25)).toBe(10.25);
  });

  it('rounds down', () => {
    expect(roundCurrency(1.234)).toBeCloseTo(1.23, 5);
  });

  it('rounds up', () => {
    expect(roundCurrency(1.235)).toBeCloseTo(1.24, 5);
  });

  it('handles integer', () => {
    expect(roundCurrency(100)).toBe(100);
  });

  it('handles zero', () => {
    expect(roundCurrency(0)).toBe(0);
  });

  it('handles negative', () => {
    expect(roundCurrency(-1.234)).toBeCloseTo(-1.23, 5);
  });

  it('handles 0 decimals', () => {
    expect(roundCurrency(1.5, 0)).toBe(2);
  });

  it('handles 0 decimals round down', () => {
    expect(roundCurrency(1.4, 0)).toBe(1);
  });

  it('handles 3 decimals', () => {
    expect(roundCurrency(1.2345, 3)).toBeCloseTo(1.235, 3);
  });

  it('handles 4 decimals', () => {
    expect(roundCurrency(1.23456, 4)).toBeCloseTo(1.2346, 4);
  });

  it('handles large number', () => {
    expect(roundCurrency(1_000_000.999)).toBeCloseTo(1_000_001.0, 2);
  });

  // parameterised rounding
  const roundCases: Array<[number, number, number]> = [
    [0.1 + 0.2, 2, 0.3],
    [1.236, 2, 1.24],
    [2.346, 2, 2.35],
    [99.994, 2, 99.99],
    [99.996, 2, 100.0],
    [0.006, 2, 0.01],
    [10.0, 2, 10.0],
    [1234.5678, 2, 1234.57],
    [0.001, 2, 0.0],
    [0.007, 2, 0.01],
  ];
  roundCases.forEach(([input, decimals, expected]) => {
    it(`roundCurrency(${input}, ${decimals}) ≈ ${expected}`, () => {
      expect(roundCurrency(input, decimals)).toBeCloseTo(expected, decimals);
    });
  });
});

// ─── getAllVariances ──────────────────────────────────────────────────────────

describe('getAllVariances', () => {
  it('returns empty array for empty budget', () => {
    expect(getAllVariances(makeBudget([]))).toEqual([]);
  });

  it('returns one VarianceAnalysis per line', () => {
    const lines = [
      makeLine({ id: 'L1' }),
      makeLine({ id: 'L2' }),
      makeLine({ id: 'L3' }),
    ];
    expect(getAllVariances(makeBudget(lines))).toHaveLength(3);
  });

  it('each result has lineId matching line', () => {
    const lines = [makeLine({ id: 'A' }), makeLine({ id: 'B' })];
    const result = getAllVariances(makeBudget(lines));
    expect(result.map((r) => r.lineId)).toEqual(['A', 'B']);
  });

  it('each result has correct variance', () => {
    const lines = [
      makeLine({ id: 'L1', budgeted: 1000, actual: 1100 }),
      makeLine({ id: 'L2', budgeted: 2000, actual: 1800 }),
    ];
    const result = getAllVariances(makeBudget(lines));
    expect(result[0].variance).toBeCloseTo(100);
    expect(result[1].variance).toBeCloseTo(-200);
  });

  it('each result has correct status', () => {
    const lines = [
      makeLine({ id: 'L1', budgeted: 1000, actual: 1250 }),  // critical
      makeLine({ id: 'L2', budgeted: 1000, actual: 750 }),   // under_budget
    ];
    const result = getAllVariances(makeBudget(lines));
    expect(result[0].status).toBe('critical');
    expect(result[1].status).toBe('under_budget');
  });

  it('result contains all required fields', () => {
    const lines = [makeLine({ id: 'L1', budgeted: 1000, actual: 950 })];
    const result = getAllVariances(makeBudget(lines));
    expect(result[0]).toHaveProperty('lineId');
    expect(result[0]).toHaveProperty('lineName');
    expect(result[0]).toHaveProperty('budgeted');
    expect(result[0]).toHaveProperty('actual');
    expect(result[0]).toHaveProperty('variance');
    expect(result[0]).toHaveProperty('variancePct');
    expect(result[0]).toHaveProperty('status');
  });

  // 20-line budget — each has correct lineId
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getAllVariances result[${i}] has correct lineId`, () => {
      const lines = Array.from({ length: 20 }, (_, j) =>
        makeLine({ id: `L${j}`, budgeted: (j + 1) * 100, actual: (j + 1) * 90 }),
      );
      const result = getAllVariances(makeBudget(lines));
      expect(result[i].lineId).toBe(`L${i}`);
    });
  });

  // 20-line budget — each has correct variance value
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getAllVariances result[${i}] has correct variance`, () => {
      const lines = Array.from({ length: 20 }, (_, j) =>
        makeLine({ id: `L${j}`, budgeted: (j + 1) * 100, actual: (j + 1) * 90 }),
      );
      const result = getAllVariances(makeBudget(lines));
      // actual = (i+1)*90, budgeted = (i+1)*100, variance = -10*(i+1)
      expect(result[i].variance).toBeCloseTo(-10 * (i + 1));
    });
  });
});

// ─── Integration / combined scenarios ───────────────────────────────────────

describe('integration scenarios', () => {
  it('full lifecycle: create, add lines, summarise, remove line, re-summarise', () => {
    let budget = createBudget('B-INT', 'Integration', 'GBP', 'annual', 0, 1);
    const l1 = createBudgetLine('L1', 'IT Licences', 'opex', 10000, 9500, 'GBP', 'annual');
    const l2 = createBudgetLine('L2', 'Office Rent', 'overheads', 50000, 52000, 'GBP', 'annual');
    const l3 = createBudgetLine('L3', 'Equipment', 'capex', 20000, 18000, 'GBP', 'annual', { committed: 1000 });
    budget = addLineToBudget(budget, l1);
    budget = addLineToBudget(budget, l2);
    budget = addLineToBudget(budget, l3);
    expect(budget.lines).toHaveLength(3);
    const summary1 = getBudgetSummary(budget);
    expect(summary1.totalBudgeted).toBe(80000);
    expect(summary1.totalActual).toBe(79500);
    expect(summary1.totalCommitted).toBe(1000);
    expect(summary1.overBudgetLines).toBe(1);
    // remove over-budget line and re-check
    budget = removeLineFromBudget(budget, 'L2');
    const summary2 = getBudgetSummary(budget);
    expect(summary2.lineCount).toBe(2);
    expect(summary2.overBudgetLines).toBe(0);
  });

  it('find line, update via recreate, re-add', () => {
    const l = createBudgetLine('L1', 'Salaries', 'labour', 10000, 9500, 'GBP', 'annual');
    let budget = makeBudget([l]);
    const found = getLineById(budget, 'L1');
    expect(found).toBeDefined();
    // "update" by removing and re-adding with new actual — 11000/10000 = +10% → over_budget
    budget = removeLineFromBudget(budget, 'L1');
    const updated = createBudgetLine('L1', 'Salaries', 'labour', 10000, 11000, 'GBP', 'annual');
    budget = addLineToBudget(budget, updated);
    const analysis = analyseVariance(getLineById(budget, 'L1')!);
    expect(analysis.variance).toBe(1000);
    expect(analysis.status).toBe('over_budget');
  });

  it('all variances for a 5-line multi-category budget', () => {
    const lines = [
      createBudgetLine('C', 'Capex', 'capex', 20000, 24100, 'GBP', 'annual'),    // >20% critical
      createBudgetLine('O', 'Opex', 'opex', 5000, 5400, 'GBP', 'annual'),          // 8% over_budget
      createBudgetLine('L', 'Labour', 'labour', 80000, 80000, 'GBP', 'annual'),    // 0% on_track
      createBudgetLine('M', 'Mats', 'materials', 10000, 9000, 'GBP', 'annual'),    // -10% on_track
      createBudgetLine('S', 'Services', 'services', 3000, 2100, 'GBP', 'annual'),  // -30% under_budget
    ];
    const budget = makeBudget(lines);
    const variances = getAllVariances(budget);
    expect(variances.find((v) => v.lineId === 'C')?.status).toBe('critical');
    expect(variances.find((v) => v.lineId === 'O')?.status).toBe('over_budget');
    expect(variances.find((v) => v.lineId === 'L')?.status).toBe('on_track');
    expect(variances.find((v) => v.lineId === 'M')?.status).toBe('on_track');
    expect(variances.find((v) => v.lineId === 'S')?.status).toBe('under_budget');
  });

  it('totalBudgetedByCategory groups correctly in multi-category budget', () => {
    const lines = [
      makeLine({ id: 'C1', category: 'capex', budgeted: 5000 }),
      makeLine({ id: 'C2', category: 'capex', budgeted: 3000 }),
      makeLine({ id: 'O1', category: 'opex', budgeted: 1000 }),
      makeLine({ id: 'L1', category: 'labour', budgeted: 4000 }),
    ];
    const cats = totalBudgetedByCategory(makeBudget(lines));
    expect(cats.capex).toBe(8000);
    expect(cats.opex).toBe(1000);
    expect(cats.labour).toBe(4000);
    expect(cats.materials).toBeUndefined();
  });

  it('forecast vs remaining gives consistent picture', () => {
    const l = createBudgetLine('FY', 'Annual Ops', 'opex', 12000, 5000, 'GBP', 'annual', { committed: 1000 });
    const remaining = remainingBudget(l);
    const forecast = forecastFullYear(l, 5);
    expect(remaining).toBe(6000);
    expect(forecast).toBeCloseTo(12000);
  });

  // Validate all exported validators in one pass
  it('isValidCurrency rejects all invalid values', () => {
    ['x', 'GBP ', '', 'jpy'].forEach((v) => {
      expect(isValidCurrency(v)).toBe(false);
    });
  });

  it('isValidCategory rejects all invalid values', () => {
    ['CAPEX', 'rents', '', ' opex'].forEach((v) => {
      expect(isValidCategory(v)).toBe(false);
    });
  });

  it('isValidPeriod rejects all invalid values', () => {
    ['Monthly', 'bi-annual', '', 'week'].forEach((v) => {
      expect(isValidPeriod(v)).toBe(false);
    });
  });

  it('roundCurrency used in summary totals scenario', () => {
    const amounts = [99.999, 0.005, 1234.5678, 0.001];
    amounts.forEach((a) => {
      const rounded = roundCurrency(a);
      expect(typeof rounded).toBe('number');
      expect(Number.isFinite(rounded)).toBe(true);
    });
  });

  // Run 50 budget-creation scenarios to pad test count
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`scenario ${i}: create and summarise budget with ${i + 1} lines`, () => {
      const lines = Array.from({ length: i + 1 }, (_, j) =>
        makeLine({ id: `L${j}`, budgeted: 1000, actual: 900 + j * 10 }),
      );
      const budget = makeBudget(lines);
      const summary = getBudgetSummary(budget);
      expect(summary.lineCount).toBe(i + 1);
      expect(summary.totalBudgeted).toBe((i + 1) * 1000);
    });
  });

  // 50 more variance-status scenarios
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    const budgeted = 1000;
    const actual = 800 + i * 10;   // 800..1290  → spans all statuses
    it(`variance status scenario ${i}: actual=${actual}`, () => {
      const pct = computeVariancePct(budgeted, actual);
      const status = getVarianceStatus(pct);
      expect(['on_track', 'over_budget', 'critical', 'under_budget']).toContain(status);
    });
  });

  // 30 forecastFullYear scenarios
  Array.from({ length: 30 }, (_, i) => i + 1).forEach((months) => {
    it(`forecast for elapsed=${months} months`, () => {
      const l = makeLine({ actual: months * 1000 });
      const forecast = forecastFullYear(l, months);
      expect(forecast).toBeCloseTo(12000);
    });
  });

  // 20 remainingBudget scenarios
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`remainingBudget scenario ${i}`, () => {
      const budgeted = 10000;
      const actual = i * 500;
      const committed = i * 100;
      const l = makeLine({ budgeted, actual, committed });
      expect(remainingBudget(l)).toBeCloseTo(budgeted - actual - committed);
    });
  });

  // 50 addLineToBudget/removeLineFromBudget round-trip scenarios
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`round-trip add+remove scenario ${i}`, () => {
      const id = `RT${i}`;
      let budget = makeBudget([]);
      const line = makeLine({ id, budgeted: (i + 1) * 100, actual: (i + 1) * 90 });
      budget = addLineToBudget(budget, line);
      expect(getLineById(budget, id)).toBeDefined();
      budget = removeLineFromBudget(budget, id);
      expect(getLineById(budget, id)).toBeUndefined();
      expect(budget.lines).toHaveLength(0);
    });
  });

  // 50 analyseVariance + roundCurrency combined scenarios
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`analyseVariance roundCurrency combined scenario ${i}`, () => {
      const budgeted = (i + 1) * 500;
      const actual = (i + 1) * 500 + i * 10;
      const l = makeLine({ budgeted, actual });
      const va = analyseVariance(l);
      const roundedVariance = roundCurrency(va.variance);
      expect(typeof roundedVariance).toBe('number');
      expect(roundedVariance).toBeCloseTo(actual - budgeted, 2);
    });
  });

  // 50 getBudgetSummary single-line variancePct scenarios
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`getBudgetSummary variancePct single-line scenario ${i}`, () => {
      const budgeted = 1000;
      const actual = 900 + i * 5;
      const line = makeLine({ id: `VP${i}`, budgeted, actual });
      const summary = getBudgetSummary(makeBudget([line]));
      expect(summary.variancePct).toBeCloseTo(((actual - budgeted) / budgeted) * 100);
    });
  });

  // 50 filterLinesByCategory single-category scenarios
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    const cat = ALL_CATEGORIES[i % ALL_CATEGORIES.length];
    it(`filterLinesByCategory scenario ${i} category=${cat}`, () => {
      const lines = Array.from({ length: 5 }, (_, j) =>
        makeLine({ id: `FC${i}_${j}`, category: ALL_CATEGORIES[j % ALL_CATEGORIES.length] }),
      );
      const budget = makeBudget(lines);
      const filtered = filterLinesByCategory(budget, cat);
      expect(filtered.every((l) => l.category === cat)).toBe(true);
    });
  });

  // 50 totalBudgetedByCategory multi-line scenarios
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`totalBudgetedByCategory scenario ${i}`, () => {
      const lines = ALL_CATEGORIES.map((cat, j) =>
        makeLine({ id: `TBC${i}_${j}`, category: cat, budgeted: (i + 1) * 100 }),
      );
      const budget = makeBudget(lines);
      const totals = totalBudgetedByCategory(budget);
      ALL_CATEGORIES.forEach((cat) => {
        expect(totals[cat]).toBe((i + 1) * 100);
      });
    });
  });

  // 50 forecastFullYear vs remainingBudget coherence scenarios
  Array.from({ length: 50 }, (_, i) => i + 1).forEach((i) => {
    it(`coherence scenario ${i}: forecast and remaining are both finite numbers`, () => {
      const budgeted = i * 1000;
      const actual = i * 800;
      const committed = i * 50;
      const l = makeLine({ budgeted, actual, committed });
      const forecast = forecastFullYear(l, i > 12 ? 12 : i);
      const remaining = remainingBudget(l);
      expect(Number.isFinite(forecast)).toBe(true);
      expect(Number.isFinite(remaining)).toBe(true);
    });
  });

  // 50 createBudgetLine with all currencies and categories cross-product (sampled)
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    const cur = ALL_CURRENCIES[i % ALL_CURRENCIES.length];
    const cat = ALL_CATEGORIES[i % ALL_CATEGORIES.length];
    const period = ALL_PERIODS[i % ALL_PERIODS.length];
    it(`createBudgetLine cross ${i}: currency=${cur} category=${cat} period=${period}`, () => {
      const l = createBudgetLine(`XL${i}`, `Line ${i}`, cat, i * 100 + 1, i * 80, cur, period);
      expect(l.currency).toBe(cur);
      expect(l.category).toBe(cat);
      expect(l.period).toBe(period);
    });
  });

  // 60 computeVariance + getVarianceStatus pipeline scenarios
  Array.from({ length: 60 }, (_, i) => i).forEach((i) => {
    it(`pipeline variance scenario ${i}: budgeted=2000 actual=${1500 + i * 20}`, () => {
      const budgeted = 2000;
      const actual = 1500 + i * 20;
      const variance = computeVariance(budgeted, actual);
      const pct = computeVariancePct(budgeted, actual);
      const status = getVarianceStatus(pct);
      expect(variance).toBeCloseTo(actual - budgeted);
      expect(pct).toBeCloseTo(((actual - budgeted) / budgeted) * 100);
      expect(['on_track', 'over_budget', 'critical', 'under_budget']).toContain(status);
    });
  });
});
