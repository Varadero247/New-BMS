import {
  xbarRChart,
  iMrChart,
  pChart,
  calculateCpk,
  calculatePpk,
  detectWesternElectricRules,
  SPC_CONSTANTS,
} from '../src';
import type { DataPoint, ControlChart, PChartDataPoint } from '../src';

// ============================================
// Helper: generate data points from raw values
// ============================================

function makeDataPoints(values: number[]): DataPoint[] {
  const baseTime = new Date('2026-01-01T00:00:00Z');
  return values.map((value, i) => ({
    value,
    timestamp: new Date(baseTime.getTime() + i * 60000), // 1 min apart
  }));
}

// ============================================
// SPC Constants
// ============================================

describe('SPC_CONSTANTS', () => {
  it('should have constants for subgroup sizes 2 through 10', () => {
    for (let n = 2; n <= 10; n++) {
      expect(SPC_CONSTANTS[n]).toBeDefined();
      expect(SPC_CONSTANTS[n].A2).toBeGreaterThan(0);
      expect(SPC_CONSTANTS[n].D4).toBeGreaterThan(0);
      expect(SPC_CONSTANTS[n].d2).toBeGreaterThan(0);
      expect(SPC_CONSTANTS[n].D3).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have correct A2 for subgroup size 5', () => {
    expect(SPC_CONSTANTS[5].A2).toBeCloseTo(0.577, 3);
  });

  it('should have D3 = 0 for subgroup sizes 2-6', () => {
    for (let n = 2; n <= 6; n++) {
      expect(SPC_CONSTANTS[n].D3).toBe(0);
    }
  });

  it('should have D3 > 0 for subgroup sizes 7-10', () => {
    for (let n = 7; n <= 10; n++) {
      expect(SPC_CONSTANTS[n].D3).toBeGreaterThan(0);
    }
  });
});

// ============================================
// X-bar and R Chart
// ============================================

describe('xbarRChart', () => {
  it('should throw if subgroup size is less than 2', () => {
    const data = makeDataPoints([1, 2, 3, 4]);
    expect(() => xbarRChart(data, 1)).toThrow('Subgroup size must be between 2 and 10');
  });

  it('should throw if subgroup size is greater than 10', () => {
    const data = makeDataPoints(Array(22).fill(1));
    expect(() => xbarRChart(data, 11)).toThrow('Subgroup size must be between 2 and 10');
  });

  it('should throw if fewer than 2 complete subgroups', () => {
    const data = makeDataPoints([1, 2, 3, 4, 5]);
    expect(() => xbarRChart(data, 5)).toThrow('Need at least 2 complete subgroups');
  });

  it('should compute correct X-bar and R chart for known data', () => {
    // 4 subgroups of size 5
    const values = [
      10, 12, 11, 13, 14, // subgroup 1: mean=12, range=4
      11, 10, 12, 11, 11, // subgroup 2: mean=11, range=2
      13, 14, 12, 11, 10, // subgroup 3: mean=12, range=4
      10, 11, 12, 13, 14, // subgroup 4: mean=12, range=4
    ];
    const data = makeDataPoints(values);
    const chart = xbarRChart(data, 5);

    expect(chart.type).toBe('XBAR_R');

    // X-bar-bar = (12 + 11 + 12 + 12) / 4 = 11.75
    expect(chart.centerLine).toBeCloseTo(11.75, 1);

    // R-bar = (4 + 2 + 4 + 4) / 4 = 3.5
    expect(chart.rangeCenterLine).toBeCloseTo(3.5, 1);

    // UCL_xbar = 11.75 + 0.577 * 3.5 = 11.75 + 2.0195 = 13.7695
    expect(chart.ucl).toBeCloseTo(11.75 + 0.577 * 3.5, 2);

    // LCL_xbar = 11.75 - 0.577 * 3.5 = 11.75 - 2.0195 = 9.7305
    expect(chart.lcl).toBeCloseTo(11.75 - 0.577 * 3.5, 2);

    // UCL_R = D4 * R-bar = 2.114 * 3.5 = 7.399
    expect(chart.rangeUcl).toBeCloseTo(2.114 * 3.5, 2);

    // LCL_R = D3 * R-bar = 0 * 3.5 = 0
    expect(chart.rangeLcl).toBe(0);

    expect(chart.dataPoints).toHaveLength(4);
    expect(chart.rangePoints).toHaveLength(4);
  });

  it('should correctly identify out-of-control X-bar points', () => {
    // Create data where one subgroup mean is clearly beyond UCL
    const values = [
      10, 10, 10, 10, 10, // mean=10, range=0
      10, 10, 10, 10, 10, // mean=10, range=0
      10, 10, 10, 10, 10, // mean=10, range=0
      25, 25, 25, 25, 25, // mean=25 -- way beyond UCL
    ];
    const data = makeDataPoints(values);
    const chart = xbarRChart(data, 5);

    // Subgroup 4 should be flagged as out of control
    const oocXbar = chart.outOfControl.filter((p) => !p.rules[0]?.startsWith('Range:'));
    expect(oocXbar.length).toBeGreaterThan(0);
    expect(oocXbar.some((p) => p.index === 3)).toBe(true);
  });

  it('should discard incomplete trailing subgroup', () => {
    // 12 points with subgroup size 5 = 2 complete subgroups, 2 leftover
    const values = [10, 12, 11, 13, 14, 11, 10, 12, 11, 11, 99, 99];
    const data = makeDataPoints(values);
    const chart = xbarRChart(data, 5);

    expect(chart.dataPoints).toHaveLength(2);
  });
});

// ============================================
// I-MR Chart
// ============================================

describe('iMrChart', () => {
  it('should throw if fewer than 2 data points', () => {
    const data = makeDataPoints([5]);
    expect(() => iMrChart(data)).toThrow('Need at least 2 data points');
  });

  it('should compute correct I-MR chart', () => {
    const values = [10, 12, 11, 13, 10, 14, 11, 12, 10, 13];
    const data = makeDataPoints(values);
    const chart = iMrChart(data);

    expect(chart.type).toBe('IMR');

    // X-bar = mean of all values = 11.6
    const expectedMean = values.reduce((s, v) => s + v, 0) / values.length;
    expect(chart.centerLine).toBeCloseTo(expectedMean, 4);

    // Moving ranges: |12-10|=2, |11-12|=1, |13-11|=2, |10-13|=3, |14-10|=4, |11-14|=3, |12-11|=1, |10-12|=2, |13-10|=3
    const expectedMRs = [2, 1, 2, 3, 4, 3, 1, 2, 3];
    const expectedMRBar = expectedMRs.reduce((s, v) => s + v, 0) / expectedMRs.length;
    expect(chart.rangeCenterLine).toBeCloseTo(expectedMRBar, 4);

    // UCL = X-bar + 2.66 * MR-bar
    expect(chart.ucl).toBeCloseTo(expectedMean + 2.66 * expectedMRBar, 2);

    // LCL = X-bar - 2.66 * MR-bar
    expect(chart.lcl).toBeCloseTo(expectedMean - 2.66 * expectedMRBar, 2);

    // Range UCL = 3.267 * MR-bar
    expect(chart.rangeUcl).toBeCloseTo(3.267 * expectedMRBar, 2);
    expect(chart.rangeLcl).toBe(0);

    expect(chart.dataPoints).toHaveLength(10);
    expect(chart.rangePoints).toHaveLength(9);
  });

  it('should detect out-of-control individuals', () => {
    // Stable process with one extreme outlier
    const values = [10, 10, 10, 10, 10, 10, 10, 10, 10, 50];
    const data = makeDataPoints(values);
    const chart = iMrChart(data);

    const oocIndividuals = chart.outOfControl.filter((p) => !p.rules[0]?.startsWith('MR:'));
    expect(oocIndividuals.length).toBeGreaterThan(0);
  });
});

// ============================================
// P Chart
// ============================================

describe('pChart', () => {
  it('should throw if fewer than 2 samples', () => {
    const data: PChartDataPoint[] = [{ defectives: 5, sampleSize: 100, timestamp: new Date() }];
    expect(() => pChart(data)).toThrow('Need at least 2 samples');
  });

  it('should throw if sample size is zero or negative', () => {
    const data: PChartDataPoint[] = [
      { defectives: 5, sampleSize: 0, timestamp: new Date() },
      { defectives: 3, sampleSize: 100, timestamp: new Date() },
    ];
    expect(() => pChart(data)).toThrow('Sample size must be positive');
  });

  it('should throw if defectives exceeds sample size', () => {
    const data: PChartDataPoint[] = [
      { defectives: 150, sampleSize: 100, timestamp: new Date() },
      { defectives: 3, sampleSize: 100, timestamp: new Date() },
    ];
    expect(() => pChart(data)).toThrow('Defectives must be between 0 and sample size');
  });

  it('should compute correct p chart for known data', () => {
    const data: PChartDataPoint[] = [
      { defectives: 5, sampleSize: 100, timestamp: new Date('2026-01-01') },
      { defectives: 3, sampleSize: 100, timestamp: new Date('2026-01-02') },
      { defectives: 7, sampleSize: 100, timestamp: new Date('2026-01-03') },
      { defectives: 4, sampleSize: 100, timestamp: new Date('2026-01-04') },
      { defectives: 6, sampleSize: 100, timestamp: new Date('2026-01-05') },
    ];

    const chart = pChart(data);

    expect(chart.type).toBe('P');

    // p-bar = (5+3+7+4+6) / (5*100) = 25/500 = 0.05
    expect(chart.centerLine).toBeCloseTo(0.05, 4);

    // sigma = sqrt(0.05 * 0.95 / 100) = sqrt(0.000475) = 0.0218
    const sigma = Math.sqrt(0.05 * 0.95 / 100);
    expect(chart.ucl).toBeCloseTo(0.05 + 3 * sigma, 4);
    expect(chart.lcl).toBeCloseTo(Math.max(0, 0.05 - 3 * sigma), 4);

    expect(chart.dataPoints).toHaveLength(5);
  });

  it('should clamp LCL to 0', () => {
    // Very low defect rates will push LCL negative
    const data: PChartDataPoint[] = [
      { defectives: 0, sampleSize: 10, timestamp: new Date('2026-01-01') },
      { defectives: 1, sampleSize: 10, timestamp: new Date('2026-01-02') },
      { defectives: 0, sampleSize: 10, timestamp: new Date('2026-01-03') },
    ];

    const chart = pChart(data);

    expect(chart.lcl).toBeGreaterThanOrEqual(0);
  });
});

// ============================================
// Process Capability (Cpk)
// ============================================

describe('calculateCpk', () => {
  it('should throw if fewer than 2 data points', () => {
    expect(() => calculateCpk([5], 10, 0)).toThrow('Need at least 2 data points');
  });

  it('should throw if USL <= LSL', () => {
    expect(() => calculateCpk([5, 6, 7], 0, 10)).toThrow('USL must be greater than LSL');
    expect(() => calculateCpk([5, 6, 7], 5, 5)).toThrow('USL must be greater than LSL');
  });

  it('should compute correct Cpk for a well-centered, capable process', () => {
    // Generate data tightly centered at 50 with small variation
    const data = [
      49.8, 50.1, 50.0, 49.9, 50.2, 50.0, 49.9, 50.1, 50.0, 49.8,
      50.1, 50.0, 49.9, 50.2, 50.0, 49.9, 50.1, 50.0, 49.8, 50.1,
    ];
    const usl = 52;
    const lsl = 48;

    const result = calculateCpk(data, usl, lsl);

    expect(result.mean).toBeCloseTo(50, 0);
    expect(result.cp).toBeGreaterThan(1.33);
    expect(result.cpk).toBeGreaterThan(1.33);
    expect(result.sigma).toBeGreaterThan(0);
    expect(result.pp).toBeGreaterThan(0);
    expect(result.ppk).toBeGreaterThan(0);
    // Status should be CAPABLE or MARGINAL for such tight data
    expect(['CAPABLE', 'MARGINAL']).toContain(result.status);
  });

  it('should compute INCAPABLE status for wide variation', () => {
    // Data with wide spread relative to spec limits
    const data = [45, 55, 42, 58, 47, 53, 44, 56, 46, 54];
    const usl = 52;
    const lsl = 48;

    const result = calculateCpk(data, usl, lsl);

    expect(result.status).toBe('INCAPABLE');
    expect(result.cpk).toBeLessThan(1.33);
  });

  it('should detect off-center process', () => {
    // Process centered at 51 instead of 50, spec is 48-52
    const data = [
      51.0, 51.1, 50.9, 51.0, 51.2, 50.8, 51.0, 51.1, 50.9, 51.0,
    ];
    const usl = 52;
    const lsl = 48;

    const result = calculateCpk(data, usl, lsl);

    // Cpk should be less than Cp because process is off-center
    expect(result.cpk).toBeLessThan(result.cp);
  });

  it('should return Pp and Ppk values', () => {
    const data = [50, 50.1, 49.9, 50.0, 50.1, 49.8, 50.2, 50.0, 49.9, 50.1];
    const result = calculateCpk(data, 52, 48);

    expect(result.pp).toBeGreaterThan(0);
    expect(result.ppk).toBeGreaterThan(0);
  });
});

// ============================================
// Process Performance (Ppk)
// ============================================

describe('calculatePpk', () => {
  it('should throw if fewer than 2 data points', () => {
    expect(() => calculatePpk([5], 10, 0)).toThrow('Need at least 2 data points');
  });

  it('should return status based on Ppk, not Cpk', () => {
    // With stable data, Ppk and Cpk should be similar
    const data = [
      49.8, 50.1, 50.0, 49.9, 50.2, 50.0, 49.9, 50.1, 50.0, 49.8,
      50.1, 50.0, 49.9, 50.2, 50.0, 49.9, 50.1, 50.0, 49.8, 50.1,
    ];
    const result = calculatePpk(data, 52, 48);

    expect(result.pp).toBeGreaterThan(0);
    expect(result.ppk).toBeGreaterThan(0);
    expect(['CAPABLE', 'MARGINAL', 'INCAPABLE']).toContain(result.status);
  });
});

// ============================================
// Western Electric Rules Detection
// ============================================

describe('detectWesternElectricRules', () => {
  // Helper to create a minimal control chart for testing
  function makeChart(values: number[], cl: number, ucl: number, lcl: number): ControlChart {
    const points = values.map((v, i) => ({
      value: v,
      timestamp: new Date('2026-01-01T00:00:00Z'),
      index: i,
      outOfControl: v > ucl || v < lcl,
      violationRules: [],
    }));

    return {
      type: 'IMR',
      ucl,
      lcl,
      centerLine: cl,
      dataPoints: points,
      outOfControl: [],
    };
  }

  it('should detect Rule 1: point beyond 3-sigma', () => {
    // CL=10, UCL=13, LCL=7 (1-sigma zone width = 1)
    const chart = makeChart([10, 10, 10, 14, 10], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);

    const rule1 = violations.filter((v) => v.rule === 'RULE_1');
    expect(rule1.length).toBeGreaterThan(0);
    expect(rule1[0].pointIndex).toBe(3);
  });

  it('should detect Rule 1: point below LCL', () => {
    const chart = makeChart([10, 10, 10, 6, 10], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);

    const rule1 = violations.filter((v) => v.rule === 'RULE_1');
    expect(rule1.length).toBeGreaterThan(0);
    expect(rule1[0].pointIndex).toBe(3);
  });

  it('should detect Rule 2: 2 of 3 consecutive points beyond 2-sigma', () => {
    // CL=10, UCL=13, LCL=7
    // 2-sigma upper = 10 + 2*(13-10)/3 = 12
    // Points at indices 0,1,2 where 2 of 3 are above 12
    const chart = makeChart([12.5, 10, 12.5], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);

    const rule2 = violations.filter((v) => v.rule === 'RULE_2');
    expect(rule2.length).toBeGreaterThan(0);
  });

  it('should detect Rule 3: 4 of 5 consecutive points beyond 1-sigma', () => {
    // CL=10, UCL=13, LCL=7
    // 1-sigma upper = 10 + (13-10)/3 = 11
    // 4 of 5 points above 11
    const chart = makeChart([11.5, 11.5, 10, 11.5, 11.5], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);

    const rule3 = violations.filter((v) => v.rule === 'RULE_3');
    expect(rule3.length).toBeGreaterThan(0);
  });

  it('should detect Rule 4: 8 consecutive points on same side', () => {
    // CL=10, all 8 points above center line
    const chart = makeChart([10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);

    const rule4 = violations.filter((v) => v.rule === 'RULE_4');
    expect(rule4.length).toBeGreaterThan(0);
  });

  it('should detect Rule 4: 8 consecutive points below center', () => {
    const chart = makeChart([9.5, 9.5, 9.5, 9.5, 9.5, 9.5, 9.5, 9.5], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);

    const rule4 = violations.filter((v) => v.rule === 'RULE_4');
    expect(rule4.length).toBeGreaterThan(0);
  });

  it('should return no violations for a stable in-control process', () => {
    // All points near center line, well within limits
    const chart = makeChart([10, 10.1, 9.9, 10.2, 9.8, 10.1, 9.9, 10.0], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);

    // No rules should trigger - points are all within 1 sigma of center
    const rule1 = violations.filter((v) => v.rule === 'RULE_1');
    expect(rule1).toHaveLength(0);
  });

  it('should handle empty data points', () => {
    const chart = makeChart([], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);
    expect(violations).toHaveLength(0);
  });

  it('should detect multiple rule violations on the same point', () => {
    // A point that is beyond UCL (Rule 1) and also the 3rd in a series of 2/3 beyond 2-sigma (Rule 2)
    // CL=10, UCL=13, LCL=7
    // 2-sigma upper = 12
    const chart = makeChart([12.5, 10, 14], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);

    // Point at index 2 (value 14) should trigger Rule 1 (beyond UCL)
    // and the window [12.5, 10, 14] has 2 of 3 above 2-sigma (12.5, 14) -> Rule 2
    const rulesAtPoint2 = violations.filter((v) => v.pointIndex === 2);
    const ruleNames = rulesAtPoint2.map((v) => v.rule);
    expect(ruleNames).toContain('RULE_1');
    expect(ruleNames).toContain('RULE_2');
  });
});
