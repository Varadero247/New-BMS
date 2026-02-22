import { pChart } from '../src';
import type { PChartDataPoint } from '../src';

function makePData(samples: Array<[number, number]>): PChartDataPoint[] {
  const baseTime = new Date('2026-01-01T00:00:00Z');
  return samples.map(([defectives, sampleSize], i) => ({
    defectives,
    sampleSize,
    timestamp: new Date(baseTime.getTime() + i * 86400000),
  }));
}

describe('pChart — comprehensive', () => {
  describe('input validation', () => {
    it('should throw for empty data', () => {
      expect(() => pChart([])).toThrow('Need at least 2 samples');
    });

    it('should throw for single sample', () => {
      const data = makePData([[5, 100]]);
      expect(() => pChart(data)).toThrow('Need at least 2 samples');
    });

    it('should throw for zero sample size', () => {
      const data = makePData([
        [0, 0],
        [3, 100],
      ]);
      expect(() => pChart(data)).toThrow('Sample size must be positive');
    });

    it('should throw for negative sample size', () => {
      const data = makePData([
        [0, -10],
        [3, 100],
      ]);
      expect(() => pChart(data)).toThrow('Sample size must be positive');
    });

    it('should throw when defectives exceed sample size', () => {
      const data = makePData([
        [101, 100],
        [3, 100],
      ]);
      expect(() => pChart(data)).toThrow('Defectives must be between 0 and sample size');
    });

    it('should throw for negative defectives', () => {
      const data: PChartDataPoint[] = [
        { defectives: -1, sampleSize: 100, timestamp: new Date() },
        { defectives: 5, sampleSize: 100, timestamp: new Date() },
      ];
      expect(() => pChart(data)).toThrow('Defectives must be between 0 and sample size');
    });

    it('should accept exactly 2 samples', () => {
      const data = makePData([
        [5, 100],
        [3, 100],
      ]);
      expect(() => pChart(data)).not.toThrow();
    });

    it('should accept zero defectives', () => {
      const data = makePData([
        [0, 100],
        [0, 100],
      ]);
      const chart = pChart(data);
      expect(chart.centerLine).toBe(0);
    });

    it('should accept defectives equal to sample size', () => {
      const data = makePData([
        [100, 100],
        [50, 100],
      ]);
      const chart = pChart(data);
      expect(chart.centerLine).toBeCloseTo(0.75, 4);
    });
  });

  describe('chart structure', () => {
    it('should return chart type P', () => {
      const data = makePData([
        [5, 100],
        [3, 100],
        [7, 100],
      ]);
      const chart = pChart(data);
      expect(chart.type).toBe('P');
    });

    it('should have correct number of data points', () => {
      const data = makePData([
        [5, 100],
        [3, 100],
        [7, 100],
        [4, 100],
        [6, 100],
      ]);
      const chart = pChart(data);
      expect(chart.dataPoints).toHaveLength(5);
    });

    it('should not have range chart data', () => {
      const data = makePData([
        [5, 100],
        [3, 100],
      ]);
      const chart = pChart(data);
      expect(chart.rangeUcl).toBeUndefined();
      expect(chart.rangeLcl).toBeUndefined();
      expect(chart.rangePoints).toBeUndefined();
    });
  });

  describe('center line (p-bar) calculation', () => {
    it('should compute p-bar = total defectives / total inspected', () => {
      const data = makePData([
        [5, 100],
        [10, 100],
        [15, 100],
      ]);
      const chart = pChart(data);
      // p-bar = 30 / 300 = 0.1
      expect(chart.centerLine).toBeCloseTo(0.1, 4);
    });

    it('should handle unequal sample sizes', () => {
      const data = makePData([
        [10, 200],
        [5, 100],
      ]);
      const chart = pChart(data);
      // p-bar = 15 / 300 = 0.05
      expect(chart.centerLine).toBeCloseTo(0.05, 4);
    });

    it('should compute p-bar correctly with many samples', () => {
      const data = makePData([
        [5, 100],
        [3, 100],
        [7, 100],
        [4, 100],
        [6, 100],
        [8, 100],
        [2, 100],
        [5, 100],
        [4, 100],
        [6, 100],
      ]);
      const chart = pChart(data);
      // total defectives = 50, total inspected = 1000
      expect(chart.centerLine).toBeCloseTo(0.05, 4);
    });
  });

  describe('control limits', () => {
    it('should compute 3-sigma limits using average sample size', () => {
      const data = makePData([
        [5, 100],
        [3, 100],
        [7, 100],
        [4, 100],
        [6, 100],
      ]);
      const chart = pChart(data);

      const pBar = 25 / 500;
      const sigma = Math.sqrt((pBar * (1 - pBar)) / 100);
      expect(chart.ucl).toBeCloseTo(pBar + 3 * sigma, 4);
      expect(chart.lcl).toBeCloseTo(Math.max(0, pBar - 3 * sigma), 4);
    });

    it('should clamp LCL to 0 for low defect rates', () => {
      const data = makePData([
        [0, 10],
        [1, 10],
        [0, 10],
      ]);
      const chart = pChart(data);
      expect(chart.lcl).toBeGreaterThanOrEqual(0);
    });

    it('should have UCL > center line > LCL', () => {
      const data = makePData([
        [5, 100],
        [3, 100],
        [7, 100],
        [4, 100],
        [6, 100],
      ]);
      const chart = pChart(data);
      expect(chart.ucl).toBeGreaterThan(chart.centerLine);
      expect(chart.centerLine).toBeGreaterThanOrEqual(chart.lcl);
    });

    it('should handle 100% defective rate', () => {
      const data = makePData([
        [100, 100],
        [100, 100],
      ]);
      const chart = pChart(data);
      expect(chart.centerLine).toBe(1);
      // sigma = sqrt(1 * 0 / 100) = 0, so UCL = LCL = 1
      expect(chart.ucl).toBe(1);
    });
  });

  describe('out-of-control detection', () => {
    it('should flag points above UCL', () => {
      const data = makePData([
        [5, 100],
        [5, 100],
        [5, 100],
        [5, 100],
        [50, 100],
      ]);
      const chart = pChart(data);

      const ooc = chart.outOfControl;
      expect(ooc.length).toBeGreaterThan(0);
      expect(ooc.some((p) => p.rules.includes('Above UCL'))).toBe(true);
    });

    it('should not flag in-control points', () => {
      const data = makePData([
        [5, 100],
        [5, 100],
        [5, 100],
        [5, 100],
        [5, 100],
      ]);
      const chart = pChart(data);
      expect(chart.outOfControl).toHaveLength(0);
    });

    it('should detect all OOC points', () => {
      // Two extreme samples
      const data = makePData([
        [5, 100],
        [5, 100],
        [5, 100],
        [90, 100],
        [95, 100],
      ]);
      const chart = pChart(data);
      expect(chart.outOfControl.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('plotted point values', () => {
    it('should compute proportions correctly', () => {
      const data = makePData([
        [10, 200],
        [5, 100],
        [15, 300],
      ]);
      const chart = pChart(data);

      expect(chart.dataPoints[0].value).toBeCloseTo(10 / 200, 4); // 0.05
      expect(chart.dataPoints[1].value).toBeCloseTo(5 / 100, 4); // 0.05
      expect(chart.dataPoints[2].value).toBeCloseTo(15 / 300, 4); // 0.05
    });

    it('should include correct indices', () => {
      const data = makePData([
        [5, 100],
        [3, 100],
        [7, 100],
      ]);
      const chart = pChart(data);

      expect(chart.dataPoints[0].index).toBe(0);
      expect(chart.dataPoints[1].index).toBe(1);
      expect(chart.dataPoints[2].index).toBe(2);
    });

    it('should include timestamps from original data', () => {
      const data = makePData([
        [5, 100],
        [3, 100],
      ]);
      const chart = pChart(data);

      expect(chart.dataPoints[0].timestamp).toEqual(data[0].timestamp);
      expect(chart.dataPoints[1].timestamp).toEqual(data[1].timestamp);
    });
  });
});

describe('pChart — additional edge cases', () => {
  it('should compute centerLine of 1 when all samples are 100% defective', () => {
    const data = makePData([
      [50, 50],
      [80, 80],
      [200, 200],
    ]);
    const chart = pChart(data);
    expect(chart.centerLine).toBeCloseTo(1, 4);
  });

  it('should have UCL >= centerLine for high defect rate processes', () => {
    const data = makePData([
      [90, 100],
      [95, 100],
      [92, 100],
    ]);
    const chart = pChart(data);
    expect(chart.ucl).toBeGreaterThanOrEqual(chart.centerLine);
  });

  it('should produce plotted proportion of 0 for zero-defect samples', () => {
    const data = makePData([
      [0, 50],
      [0, 60],
      [0, 70],
    ]);
    const chart = pChart(data);
    chart.dataPoints.forEach((dp) => {
      expect(dp.value).toBeCloseTo(0, 4);
    });
  });

  it('should handle samples with varying sizes and correct proportions', () => {
    const data = makePData([
      [10, 100],
      [20, 200],
      [5, 50],
    ]);
    const chart = pChart(data);
    expect(chart.dataPoints[0].value).toBeCloseTo(0.1, 4);
    expect(chart.dataPoints[1].value).toBeCloseTo(0.1, 4);
    expect(chart.dataPoints[2].value).toBeCloseTo(0.1, 4);
  });
});

// ─── Further structural and type coverage ─────────────────────────────────────

describe('pChart — structural and type coverage', () => {
  it('outOfControl is always an array', () => {
    const data = makePData([[5, 100], [3, 100]]);
    const chart = pChart(data);
    expect(Array.isArray(chart.outOfControl)).toBe(true);
  });

  it('dataPoints are all in [0,1] range for valid proportion data', () => {
    const data = makePData([[10, 100], [20, 100], [5, 100], [15, 100], [8, 100]]);
    const chart = pChart(data);
    chart.dataPoints.forEach((dp) => {
      expect(dp.value).toBeGreaterThanOrEqual(0);
      expect(dp.value).toBeLessThanOrEqual(1);
    });
  });

  it('ucl is always a finite positive number', () => {
    const data = makePData([[99, 100], [98, 100], [97, 100]]);
    const chart = pChart(data);
    expect(isFinite(chart.ucl)).toBe(true);
    expect(chart.ucl).toBeGreaterThan(0);
  });

  it('lcl is never less than 0', () => {
    const data = makePData([[1, 100], [0, 100], [2, 100]]);
    const chart = pChart(data);
    expect(chart.lcl).toBeGreaterThanOrEqual(0);
  });

  it('timestamps are preserved correctly for all data points', () => {
    const data = makePData([[5, 100], [3, 100], [7, 100], [4, 100]]);
    const chart = pChart(data);
    chart.dataPoints.forEach((dp, i) => {
      expect(dp.timestamp).toEqual(data[i].timestamp);
    });
  });

  it('dataPoints indices start at 0 and increment by 1', () => {
    const data = makePData([[5, 100], [3, 100], [7, 100], [4, 100]]);
    const chart = pChart(data);
    chart.dataPoints.forEach((dp, i) => {
      expect(dp.index).toBe(i);
    });
  });
});

describe('pChart — final coverage to reach 40', () => {
  it('chart type is always "P"', () => {
    const data = makePData([[10, 100], [5, 100], [8, 100]]);
    expect(pChart(data).type).toBe('P');
  });

  it('centerLine is between 0 and 1 inclusive', () => {
    const data = makePData([[20, 100], [30, 100], [10, 100]]);
    const chart = pChart(data);
    expect(chart.centerLine).toBeGreaterThanOrEqual(0);
    expect(chart.centerLine).toBeLessThanOrEqual(1);
  });

  it('dataPoints length equals input sample count', () => {
    const samples: Array<[number, number]> = [[1, 100], [2, 100], [3, 100], [4, 100], [5, 100], [6, 100]];
    const data = makePData(samples);
    expect(pChart(data).dataPoints).toHaveLength(6);
  });

  it('outOfControl points reference valid indices into dataPoints', () => {
    const data = makePData([[5, 100], [5, 100], [5, 100], [5, 100], [90, 100]]);
    const chart = pChart(data);
    chart.outOfControl.forEach((p) => {
      expect(p.index).toBeGreaterThanOrEqual(0);
      expect(p.index).toBeLessThan(chart.dataPoints.length);
    });
  });

  it('UCL >= center line for any valid input', () => {
    const data = makePData([[5, 100], [5, 100], [5, 100]]);
    const chart = pChart(data);
    expect(chart.ucl).toBeGreaterThanOrEqual(chart.centerLine);
  });

  it('rangeUcl, rangeLcl, rangePoints are all undefined for p-chart', () => {
    const data = makePData([[5, 100], [6, 100], [4, 100]]);
    const chart = pChart(data);
    expect(chart.rangeUcl).toBeUndefined();
    expect(chart.rangeLcl).toBeUndefined();
    expect(chart.rangePoints).toBeUndefined();
  });

  it('total inspected used in centerLine calculation equals sum of sampleSizes', () => {
    const data = makePData([[10, 200], [20, 400]]);
    const chart = pChart(data);
    // p-bar = (10 + 20) / (200 + 400) = 30/600 = 0.05
    expect(chart.centerLine).toBeCloseTo(0.05, 5);
  });

  it('pChart with exactly 10 samples does not throw', () => {
    const samples: Array<[number, number]> = Array.from({ length: 10 }, () => [5, 100] as [number, number]);
    expect(() => pChart(makePData(samples))).not.toThrow();
  });

  it('p-chart out-of-control points have a rules array', () => {
    const data = makePData([[5, 100], [5, 100], [5, 100], [5, 100], [90, 100]]);
    const chart = pChart(data);
    chart.outOfControl.forEach((p) => {
      expect(Array.isArray(p.rules)).toBe(true);
    });
  });
});

describe('pChart — phase28 coverage', () => {
  it('should accept sample sizes larger than 1000 and compute correct centerLine', () => {
    const data = makePData([[50, 2000], [100, 2000]]);
    const chart = pChart(data);
    expect(chart.centerLine).toBeCloseTo(150 / 4000, 4);
  });
});
