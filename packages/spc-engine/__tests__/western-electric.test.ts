import { detectWesternElectricRules } from '../src';
import type { ControlChart, PlottedPoint } from '../src';

function makeChart(values: number[], cl: number, ucl: number, lcl: number): ControlChart {
  const points: PlottedPoint[] = values.map((v, i) => ({
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

// CL=10, UCL=13, LCL=7 => 1-sigma zone = 1, 2-sigma zone = 2
// 1-sigma upper = 11, 1-sigma lower = 9
// 2-sigma upper = 12, 2-sigma lower = 8

describe('detectWesternElectricRules — comprehensive', () => {
  describe('Rule 1: Point beyond 3-sigma', () => {
    it('should detect point above UCL', () => {
      const chart = makeChart([10, 10, 10, 14, 10], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule1 = violations.filter((v) => v.rule === 'RULE_1');
      expect(rule1.length).toBe(1);
      expect(rule1[0].pointIndex).toBe(3);
    });

    it('should detect point below LCL', () => {
      const chart = makeChart([10, 10, 10, 6, 10], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule1 = violations.filter((v) => v.rule === 'RULE_1');
      expect(rule1.length).toBe(1);
      expect(rule1[0].pointIndex).toBe(3);
    });

    it('should detect multiple points beyond limits', () => {
      const chart = makeChart([14, 10, 6, 10, 14], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule1 = violations.filter((v) => v.rule === 'RULE_1');
      expect(rule1.length).toBe(3); // indices 0, 2, 4
    });

    it('should not trigger for points exactly at UCL', () => {
      const chart = makeChart([13, 10, 10], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule1 = violations.filter((v) => v.rule === 'RULE_1');
      expect(rule1).toHaveLength(0);
    });

    it('should not trigger for points exactly at LCL', () => {
      const chart = makeChart([7, 10, 10], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule1 = violations.filter((v) => v.rule === 'RULE_1');
      expect(rule1).toHaveLength(0);
    });

    it('should include description with value and limits', () => {
      const chart = makeChart([14], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      expect(violations[0].description).toContain('14');
      expect(violations[0].description).toContain('3-sigma');
    });
  });

  describe('Rule 2: 2 of 3 consecutive points beyond 2-sigma on same side', () => {
    it('should detect 2 of 3 above 2-sigma upper', () => {
      // 2-sigma upper = 12
      const chart = makeChart([12.5, 10, 12.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule2 = violations.filter((v) => v.rule === 'RULE_2');
      expect(rule2.length).toBeGreaterThan(0);
    });

    it('should detect 2 of 3 below 2-sigma lower', () => {
      // 2-sigma lower = 8
      const chart = makeChart([7.5, 10, 7.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule2 = violations.filter((v) => v.rule === 'RULE_2');
      expect(rule2.length).toBeGreaterThan(0);
    });

    it('should detect 3 of 3 above 2-sigma', () => {
      const chart = makeChart([12.5, 12.5, 12.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule2 = violations.filter((v) => v.rule === 'RULE_2');
      expect(rule2.length).toBeGreaterThan(0);
    });

    it('should not trigger when only 1 of 3 above 2-sigma', () => {
      const chart = makeChart([10, 10, 12.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule2 = violations.filter((v) => v.rule === 'RULE_2');
      expect(rule2).toHaveLength(0);
    });

    it('should not trigger with 2 points on opposite sides', () => {
      // One above 2-sigma upper, one below 2-sigma lower
      const chart = makeChart([12.5, 10, 7.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule2 = violations.filter((v) => v.rule === 'RULE_2');
      expect(rule2).toHaveLength(0);
    });

    it('should not trigger for fewer than 3 points', () => {
      const chart = makeChart([12.5, 12.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule2 = violations.filter((v) => v.rule === 'RULE_2');
      expect(rule2).toHaveLength(0);
    });
  });

  describe('Rule 3: 4 of 5 consecutive points beyond 1-sigma on same side', () => {
    it('should detect 4 of 5 above 1-sigma upper', () => {
      // 1-sigma upper = 11
      const chart = makeChart([11.5, 11.5, 10, 11.5, 11.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule3 = violations.filter((v) => v.rule === 'RULE_3');
      expect(rule3.length).toBeGreaterThan(0);
    });

    it('should detect 4 of 5 below 1-sigma lower', () => {
      // 1-sigma lower = 9
      const chart = makeChart([8.5, 8.5, 10, 8.5, 8.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule3 = violations.filter((v) => v.rule === 'RULE_3');
      expect(rule3.length).toBeGreaterThan(0);
    });

    it('should detect 5 of 5 above 1-sigma', () => {
      const chart = makeChart([11.5, 11.5, 11.5, 11.5, 11.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule3 = violations.filter((v) => v.rule === 'RULE_3');
      expect(rule3.length).toBeGreaterThan(0);
    });

    it('should not trigger with only 3 of 5', () => {
      const chart = makeChart([11.5, 10, 10, 11.5, 11.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule3 = violations.filter((v) => v.rule === 'RULE_3');
      expect(rule3).toHaveLength(0);
    });

    it('should not trigger for fewer than 5 points', () => {
      const chart = makeChart([11.5, 11.5, 11.5, 11.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule3 = violations.filter((v) => v.rule === 'RULE_3');
      expect(rule3).toHaveLength(0);
    });
  });

  describe('Rule 4: 8 consecutive points on same side of center line', () => {
    it('should detect 8 consecutive above CL', () => {
      const chart = makeChart([10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule4 = violations.filter((v) => v.rule === 'RULE_4');
      expect(rule4.length).toBeGreaterThan(0);
    });

    it('should detect 8 consecutive below CL', () => {
      const chart = makeChart([9.5, 9.5, 9.5, 9.5, 9.5, 9.5, 9.5, 9.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule4 = violations.filter((v) => v.rule === 'RULE_4');
      expect(rule4.length).toBeGreaterThan(0);
    });

    it('should detect continuing runs (9+ points)', () => {
      const chart = makeChart([10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule4 = violations.filter((v) => v.rule === 'RULE_4');
      expect(rule4.length).toBeGreaterThanOrEqual(2);
    });

    it('should not trigger with 7 consecutive on same side', () => {
      const chart = makeChart([10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule4 = violations.filter((v) => v.rule === 'RULE_4');
      expect(rule4).toHaveLength(0);
    });

    it('should not trigger when a point crosses center line', () => {
      const chart = makeChart([10.5, 10.5, 10.5, 10.5, 9.5, 10.5, 10.5, 10.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule4 = violations.filter((v) => v.rule === 'RULE_4');
      expect(rule4).toHaveLength(0);
    });

    it('should not trigger if a point equals the center line', () => {
      const chart = makeChart([10.5, 10.5, 10.5, 10, 10.5, 10.5, 10.5, 10.5], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule4 = violations.filter((v) => v.rule === 'RULE_4');
      expect(rule4).toHaveLength(0);
    });
  });

  describe('combined rules', () => {
    it('should detect multiple rules on same point', () => {
      // Point at index 2 = 14: above UCL (Rule 1) and also 2 of 3 above 2-sigma (Rule 2)
      const chart = makeChart([12.5, 10, 14], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rulesAt2 = violations.filter((v) => v.pointIndex === 2);
      const ruleNames = rulesAt2.map((v) => v.rule);
      expect(ruleNames).toContain('RULE_1');
      expect(ruleNames).toContain('RULE_2');
    });

    it('should return empty for perfectly stable process', () => {
      const chart = makeChart([10, 10.1, 9.9, 10.2, 9.8, 10.1, 9.9, 10.0], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      expect(violations.filter((v) => v.rule === 'RULE_1')).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty data points', () => {
      const chart = makeChart([], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      expect(violations).toHaveLength(0);
    });

    it('should handle single data point', () => {
      const chart = makeChart([10], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      const rule2_3_4 = violations.filter((v) => v.rule !== 'RULE_1');
      expect(rule2_3_4).toHaveLength(0);
    });

    it('should handle all points on center line', () => {
      const chart = makeChart([10, 10, 10, 10, 10, 10, 10, 10], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      // Points ON center line don't count as "above" or "below"
      expect(violations.filter((v) => v.rule === 'RULE_4')).toHaveLength(0);
    });

    it('should include violation descriptions', () => {
      const chart = makeChart([14], 10, 13, 7);
      const violations = detectWesternElectricRules(chart);
      expect(violations[0].description).toBeTruthy();
      expect(violations[0].description.length).toBeGreaterThan(0);
    });

    it('should handle symmetric control limits', () => {
      const chart = makeChart([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 6, 12, 0);
      const violations = detectWesternElectricRules(chart);
      // Should not crash
      expect(violations).toBeDefined();
    });
  });
});

// ─── Return structure and additional rules coverage ────────────────────────────

describe('detectWesternElectricRules — return structure coverage', () => {
  it('each violation has rule, pointIndex, and description fields', () => {
    const chart = makeChart([10, 10, 10, 14, 10], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);
    expect(violations.length).toBeGreaterThan(0);
    for (const v of violations) {
      expect(v).toHaveProperty('rule');
      expect(v).toHaveProperty('pointIndex');
      expect(v).toHaveProperty('description');
    }
  });

  it('pointIndex is always a valid index into dataPoints', () => {
    const chart = makeChart([14, 10, 6, 10, 14, 10, 14], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);
    for (const v of violations) {
      expect(v.pointIndex).toBeGreaterThanOrEqual(0);
      expect(v.pointIndex).toBeLessThan(chart.dataPoints.length);
    }
  });

  it('rule field is one of RULE_1, RULE_2, RULE_3, RULE_4', () => {
    const chart = makeChart([14, 12.5, 11.5, 11.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);
    const validRules = new Set(['RULE_1', 'RULE_2', 'RULE_3', 'RULE_4']);
    for (const v of violations) {
      expect(validRules.has(v.rule)).toBe(true);
    }
  });

  it('returns empty array for 2 perfectly in-control points', () => {
    const chart = makeChart([10, 10], 10, 13, 7);
    const violations = detectWesternElectricRules(chart);
    expect(violations).toHaveLength(0);
  });

  it('Rule 4 triggers at exactly the 8th consecutive point on the same side', () => {
    const chart = makeChart([10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5, 10.5], 10, 13, 7);
    const rule4 = detectWesternElectricRules(chart).filter((v) => v.rule === 'RULE_4');
    expect(rule4.length).toBeGreaterThan(0);
    expect(rule4[0].pointIndex).toBe(7); // 8th index = 7
  });
});
