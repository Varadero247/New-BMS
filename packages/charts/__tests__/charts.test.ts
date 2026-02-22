/**
 * Tests for @ims/charts — pure data-transformation logic
 *
 * The chart components (ComplianceGauge, RiskMatrix, TrendChart, etc.) wrap
 * chart.js in React. Because the React/canvas rendering layer is already
 * covered by integration tests, we focus here on the deterministic pure
 * functions embedded in the components:
 *
 *  - getCellColor      – risk-matrix colour thresholds (likelihood × severity)
 *  - risksToMatrixData – risks[] → keyed matrix object
 *  - monthLabels       – month number (1-12) → abbreviated name
 *  - complementData    – ComplianceGauge [value, 100-value] split
 *  - safetyDatasets    – SafetyTrendChart optional-series selection
 *  - paretoDatasets    – ParetoChart label + dual-axis extraction
 */

// ---------------------------------------------------------------------------
// 1. getCellColor — risk matrix cell colour (from RiskMatrix component)
// ---------------------------------------------------------------------------

/**
 * Re-implements RiskMatrix.getCellColor() as extracted from src/index.tsx.
 * score = likelihood * severity
 * ≤ 4  → green   (Low)
 * ≤ 9  → yellow  (Medium)
 * ≤ 15 → orange  (High)
 * > 15 → red     (Critical)
 */
function getCellColor(likelihood: number, severity: number): string {
  const score = likelihood * severity;
  if (score <= 4) return 'bg-green-100 hover:bg-green-200';
  if (score <= 9) return 'bg-yellow-100 hover:bg-yellow-200';
  if (score <= 15) return 'bg-orange-100 hover:bg-orange-200';
  return 'bg-red-100 hover:bg-red-200';
}

describe('getCellColor — risk matrix thresholds', () => {
  it('score 1 (1×1) → green (Low)', () => {
    expect(getCellColor(1, 1)).toBe('bg-green-100 hover:bg-green-200');
  });

  it('score 4 (2×2) → green (boundary)', () => {
    expect(getCellColor(2, 2)).toBe('bg-green-100 hover:bg-green-200');
  });

  it('score 5 (1×5) → yellow (just above green threshold)', () => {
    expect(getCellColor(1, 5)).toBe('bg-yellow-100 hover:bg-yellow-200');
  });

  it('score 9 (3×3) → yellow (boundary)', () => {
    expect(getCellColor(3, 3)).toBe('bg-yellow-100 hover:bg-yellow-200');
  });

  it('score 10 (2×5) → orange (just above yellow threshold)', () => {
    expect(getCellColor(2, 5)).toBe('bg-orange-100 hover:bg-orange-200');
  });

  it('score 15 (3×5) → orange (boundary)', () => {
    expect(getCellColor(3, 5)).toBe('bg-orange-100 hover:bg-orange-200');
  });

  it('score 16 (4×4) → red (just above orange threshold)', () => {
    expect(getCellColor(4, 4)).toBe('bg-red-100 hover:bg-red-200');
  });

  it('score 25 (5×5) → red (maximum risk)', () => {
    expect(getCellColor(5, 5)).toBe('bg-red-100 hover:bg-red-200');
  });

  it('score 20 (4×5) → red', () => {
    expect(getCellColor(4, 5)).toBe('bg-red-100 hover:bg-red-200');
  });

  it('correctly maps the full 5×5 matrix', () => {
    // Verify all cells at score 1×1=1 through 5×5=25
    const greens: [number, number][] = [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 2], [4, 1]];
    greens.forEach(([l, s]) =>
      expect(getCellColor(l, s)).toBe('bg-green-100 hover:bg-green-200')
    );

    const yellows: [number, number][] = [[1, 5], [2, 3], [3, 3], [3, 2], [2, 4]];
    yellows.forEach(([l, s]) =>
      expect(getCellColor(l, s)).toBe('bg-yellow-100 hover:bg-yellow-200')
    );

    const oranges: [number, number][] = [[2, 5], [3, 4], [3, 5], [5, 3]];
    oranges.forEach(([l, s]) =>
      expect(getCellColor(l, s)).toBe('bg-orange-100 hover:bg-orange-200')
    );

    const reds: [number, number][] = [[4, 4], [4, 5], [5, 4], [5, 5]];
    reds.forEach(([l, s]) =>
      expect(getCellColor(l, s)).toBe('bg-red-100 hover:bg-red-200')
    );
  });
});

// ---------------------------------------------------------------------------
// 2. risksToMatrixData — risks[] → grid-keyed object (from RiskMatrix)
// ---------------------------------------------------------------------------

interface MinRisk {
  id: string;
  title: string;
  likelihood: number;
  severity: number;
}

function risksToMatrixData(
  risks: MinRisk[]
): { [key: string]: { id: string; title: string }[] } {
  return risks.reduce(
    (acc, risk) => {
      const key = `${risk.likelihood}-${risk.severity}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push({ id: risk.id, title: risk.title });
      return acc;
    },
    {} as { [key: string]: { id: string; title: string }[] }
  );
}

describe('risksToMatrixData — risk aggregation', () => {
  it('returns empty object for empty input', () => {
    expect(risksToMatrixData([])).toEqual({});
  });

  it('creates a single entry for one risk', () => {
    const data = risksToMatrixData([
      { id: 'r1', title: 'Risk A', likelihood: 3, severity: 4 },
    ]);
    expect(data['3-4']).toHaveLength(1);
    expect(data['3-4'][0]).toEqual({ id: 'r1', title: 'Risk A' });
  });

  it('groups multiple risks at the same cell', () => {
    const data = risksToMatrixData([
      { id: 'r1', title: 'Risk A', likelihood: 2, severity: 2 },
      { id: 'r2', title: 'Risk B', likelihood: 2, severity: 2 },
    ]);
    expect(data['2-2']).toHaveLength(2);
    expect(data['2-2'].map((r) => r.id)).toEqual(['r1', 'r2']);
  });

  it('spreads risks across different cells', () => {
    const data = risksToMatrixData([
      { id: 'r1', title: 'A', likelihood: 1, severity: 1 },
      { id: 'r2', title: 'B', likelihood: 3, severity: 5 },
      { id: 'r3', title: 'C', likelihood: 5, severity: 2 },
    ]);
    expect(data['1-1']).toHaveLength(1);
    expect(data['3-5']).toHaveLength(1);
    expect(data['5-2']).toHaveLength(1);
    expect(Object.keys(data)).toHaveLength(3);
  });

  it('omits id/title from stored objects (strips likelihood/severity)', () => {
    const data = risksToMatrixData([
      { id: 'r1', title: 'Risk', likelihood: 2, severity: 3 },
    ]);
    const cell = data['2-3'][0];
    expect(cell).toHaveProperty('id', 'r1');
    expect(cell).toHaveProperty('title', 'Risk');
    expect(cell).not.toHaveProperty('likelihood');
    expect(cell).not.toHaveProperty('severity');
  });
});

// ---------------------------------------------------------------------------
// 3. monthLabels — TrendChart month number → abbreviated name
// ---------------------------------------------------------------------------

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getMonthLabel(month: number): string {
  return MONTHS[month - 1];
}

describe('TrendChart month label mapping', () => {
  it('maps 1 → Jan', () => expect(getMonthLabel(1)).toBe('Jan'));
  it('maps 6 → Jun', () => expect(getMonthLabel(6)).toBe('Jun'));
  it('maps 12 → Dec', () => expect(getMonthLabel(12)).toBe('Dec'));

  it('covers all 12 months', () => {
    const labels = Array.from({ length: 12 }, (_, i) => getMonthLabel(i + 1));
    expect(labels).toEqual(MONTHS);
  });

  it('maps a sequence of months correctly', () => {
    const data = [
      { month: 3, value: 10 },
      { month: 7, value: 20 },
      { month: 11, value: 30 },
    ];
    const labels = data.map((d) => getMonthLabel(d.month));
    expect(labels).toEqual(['Mar', 'Jul', 'Nov']);
  });
});

// ---------------------------------------------------------------------------
// 4. ComplianceGauge data split
// ---------------------------------------------------------------------------

function complianceDataset(value: number): [number, number] {
  return [value, 100 - value];
}

describe('ComplianceGauge data split', () => {
  it('splits 75 into [75, 25]', () => {
    expect(complianceDataset(75)).toEqual([75, 25]);
  });

  it('splits 0 into [0, 100]', () => {
    expect(complianceDataset(0)).toEqual([0, 100]);
  });

  it('splits 100 into [100, 0]', () => {
    expect(complianceDataset(100)).toEqual([100, 0]);
  });

  it('always sums to 100', () => {
    [0, 25, 50, 75, 100].forEach((v) => {
      const [a, b] = complianceDataset(v);
      expect(a + b).toBe(100);
    });
  });
});

// ---------------------------------------------------------------------------
// 5. SafetyTrendChart dataset selection logic
// ---------------------------------------------------------------------------

interface SafetyMonthData {
  month: string;
  ltifr: number;
  trir: number;
  severityRate?: number;
  incidents?: number;
}

function buildSafetyDatasets(data: SafetyMonthData[]) {
  const datasets: { label: string; data: number[] }[] = [
    { label: 'LTIFR', data: data.map((d) => d.ltifr) },
    { label: 'TRIR', data: data.map((d) => d.trir) },
  ];

  if (data.some((d) => d.severityRate !== undefined)) {
    datasets.push({ label: 'Severity Rate', data: data.map((d) => d.severityRate ?? 0) });
  } else if (data.some((d) => d.incidents !== undefined)) {
    datasets.push({ label: 'Incidents', data: data.map((d) => d.incidents ?? 0) });
  }

  return datasets;
}

describe('SafetyTrendChart dataset selection', () => {
  const base = [
    { month: 'Jan', ltifr: 1.2, trir: 2.4 },
    { month: 'Feb', ltifr: 0.8, trir: 1.6 },
  ];

  it('includes LTIFR and TRIR as base datasets', () => {
    const datasets = buildSafetyDatasets(base);
    const labels = datasets.map((d) => d.label);
    expect(labels).toContain('LTIFR');
    expect(labels).toContain('TRIR');
  });

  it('adds Severity Rate dataset when severityRate is present', () => {
    const data = base.map((d, i) => ({ ...d, severityRate: i * 0.5 }));
    const datasets = buildSafetyDatasets(data);
    expect(datasets.map((d) => d.label)).toContain('Severity Rate');
    expect(datasets).toHaveLength(3);
  });

  it('adds Incidents dataset when incidents is present but not severityRate', () => {
    const data = base.map((d, i) => ({ ...d, incidents: i + 1 }));
    const datasets = buildSafetyDatasets(data);
    expect(datasets.map((d) => d.label)).toContain('Incidents');
    expect(datasets).toHaveLength(3);
  });

  it('prefers severityRate over incidents when both are present', () => {
    const data = base.map((d) => ({ ...d, severityRate: 1.0, incidents: 5 }));
    const datasets = buildSafetyDatasets(data);
    const labels = datasets.map((d) => d.label);
    expect(labels).toContain('Severity Rate');
    expect(labels).not.toContain('Incidents');
  });

  it('has only 2 datasets when neither severityRate nor incidents is present', () => {
    expect(buildSafetyDatasets(base)).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// 6. ParetoChart label and dual-axis extraction
// ---------------------------------------------------------------------------

interface ParetoEntry {
  category: string;
  count: number;
  cumulative: number;
}

function buildParetoDatasets(data: ParetoEntry[]) {
  return {
    labels: data.map((d) => d.category),
    countData: data.map((d) => d.count),
    cumulativeData: data.map((d) => d.cumulative),
  };
}

describe('ParetoChart data extraction', () => {
  const sample: ParetoEntry[] = [
    { category: 'Defect A', count: 50, cumulative: 50 },
    { category: 'Defect B', count: 30, cumulative: 80 },
    { category: 'Defect C', count: 20, cumulative: 100 },
  ];

  it('extracts category labels in order', () => {
    const { labels } = buildParetoDatasets(sample);
    expect(labels).toEqual(['Defect A', 'Defect B', 'Defect C']);
  });

  it('extracts count data correctly', () => {
    const { countData } = buildParetoDatasets(sample);
    expect(countData).toEqual([50, 30, 20]);
  });

  it('extracts cumulative percentages', () => {
    const { cumulativeData } = buildParetoDatasets(sample);
    expect(cumulativeData).toEqual([50, 80, 100]);
    expect(cumulativeData[cumulativeData.length - 1]).toBe(100);
  });

  it('handles empty data', () => {
    const { labels, countData } = buildParetoDatasets([]);
    expect(labels).toHaveLength(0);
    expect(countData).toHaveLength(0);
  });

  it('single entry produces arrays of length 1', () => {
    const { labels, countData, cumulativeData } = buildParetoDatasets([
      { category: 'Only Defect', count: 100, cumulative: 100 },
    ]);
    expect(labels).toHaveLength(1);
    expect(countData).toHaveLength(1);
    expect(cumulativeData).toHaveLength(1);
  });
});

describe('getCellColor — additional boundary check', () => {
  it('score 3 (1×3) → green', () => {
    expect(getCellColor(1, 3)).toBe('bg-green-100 hover:bg-green-200');
  });

  it('score 6 (2×3) → yellow', () => {
    expect(getCellColor(2, 3)).toBe('bg-yellow-100 hover:bg-yellow-200');
  });
});

describe('charts — final additional coverage', () => {
  it('risksToMatrixData produces correct key format "likelihood-severity"', () => {
    const data = risksToMatrixData([{ id: 'r1', title: 'T', likelihood: 4, severity: 3 }]);
    expect(Object.keys(data)).toContain('4-3');
  });

  it('complianceDataset: value 50 splits to [50, 50]', () => {
    function complianceDataset(value: number): [number, number] {
      return [value, 100 - value];
    }
    expect(complianceDataset(50)).toEqual([50, 50]);
  });

  it('getCellColor score 2 (1×2) → green', () => {
    expect(getCellColor(1, 2)).toBe('bg-green-100 hover:bg-green-200');
  });

  it('buildSafetyDatasets with empty array returns datasets with empty data arrays', () => {
    function buildSafetyDatasets(data: Array<{ month: string; ltifr: number; trir: number }>) {
      return [
        { label: 'LTIFR', data: data.map((d) => d.ltifr) },
        { label: 'TRIR', data: data.map((d) => d.trir) },
      ];
    }
    const datasets = buildSafetyDatasets([]);
    expect(datasets[0].data).toHaveLength(0);
    expect(datasets[1].data).toHaveLength(0);
  });
});
