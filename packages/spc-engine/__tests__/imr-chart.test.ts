import { iMrChart } from '../src';
import type { DataPoint } from '../src';

function makeDataPoints(values: number[]): DataPoint[] {
  const baseTime = new Date('2026-01-01T00:00:00Z');
  return values.map((value, i) => ({
    value,
    timestamp: new Date(baseTime.getTime() + i * 60000),
  }));
}

describe('iMrChart — comprehensive', () => {
  describe('input validation', () => {
    it('should throw for empty data', () => {
      expect(() => iMrChart([])).toThrow('Need at least 2 data points');
    });

    it('should throw for single data point', () => {
      const data = makeDataPoints([5]);
      expect(() => iMrChart(data)).toThrow('Need at least 2 data points');
    });

    it('should accept exactly 2 data points', () => {
      const data = makeDataPoints([10, 12]);
      expect(() => iMrChart(data)).not.toThrow();
    });
  });

  describe('chart structure', () => {
    const values = [10, 12, 11, 13, 10, 14, 11, 12, 10, 13];
    const data = makeDataPoints(values);
    let chart: ReturnType<typeof iMrChart>;

    beforeAll(() => {
      chart = iMrChart(data);
    });

    it('should return chart type IMR', () => {
      expect(chart.type).toBe('IMR');
    });

    it('should have same number of individual points as data', () => {
      expect(chart.dataPoints).toHaveLength(10);
    });

    it('should have n-1 moving range points', () => {
      expect(chart.rangePoints).toHaveLength(9);
    });

    it('should have range LCL of 0', () => {
      expect(chart.rangeLcl).toBe(0);
    });

    it('should include rangeUcl, rangeLcl, rangeCenterLine', () => {
      expect(chart.rangeUcl).toBeDefined();
      expect(chart.rangeLcl).toBeDefined();
      expect(chart.rangeCenterLine).toBeDefined();
    });
  });

  describe('moving range calculation', () => {
    it('should compute correct moving ranges', () => {
      const values = [10, 15, 12, 20];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      // MR: |15-10|=5, |12-15|=3, |20-12|=8
      const expectedMRBar = (5 + 3 + 8) / 3;
      expect(chart.rangeCenterLine).toBeCloseTo(expectedMRBar, 4);
    });

    it('should compute zero moving range for identical values', () => {
      const values = [10, 10, 10, 10, 10];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      expect(chart.rangeCenterLine).toBe(0);
    });

    it('should handle alternating values', () => {
      const values = [10, 20, 10, 20, 10, 20];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      // All MRs = 10
      expect(chart.rangeCenterLine).toBeCloseTo(10, 4);
    });
  });

  describe('control limits', () => {
    it('should compute UCL = xbar + 2.66 * MRbar', () => {
      const values = [10, 12, 11, 13, 10];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      const xBar = (10 + 12 + 11 + 13 + 10) / 5;
      const mrs = [2, 1, 2, 3];
      const mrBar = mrs.reduce((a, b) => a + b, 0) / mrs.length;

      expect(chart.ucl).toBeCloseTo(xBar + 2.66 * mrBar, 2);
    });

    it('should compute LCL = xbar - 2.66 * MRbar', () => {
      const values = [10, 12, 11, 13, 10];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      const xBar = (10 + 12 + 11 + 13 + 10) / 5;
      const mrs = [2, 1, 2, 3];
      const mrBar = mrs.reduce((a, b) => a + b, 0) / mrs.length;

      expect(chart.lcl).toBeCloseTo(xBar - 2.66 * mrBar, 2);
    });

    it('should compute range UCL = 3.267 * MRbar', () => {
      const values = [10, 12, 11, 13, 10];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      const mrs = [2, 1, 2, 3];
      const mrBar = mrs.reduce((a, b) => a + b, 0) / mrs.length;

      expect(chart.rangeUcl).toBeCloseTo(3.267 * mrBar, 2);
    });

    it('should have zero-width limits for constant data', () => {
      const values = [50, 50, 50, 50, 50];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      expect(chart.ucl).toBe(50);
      expect(chart.lcl).toBe(50);
      expect(chart.centerLine).toBe(50);
    });
  });

  describe('out-of-control detection', () => {
    it('should flag individual points above UCL', () => {
      // Stable data with one extreme outlier
      const values = [10, 10, 10, 10, 10, 10, 10, 10, 10, 100];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      const oocIndiv = chart.outOfControl.filter((p) => !p.rules[0]?.startsWith('MR:'));
      expect(oocIndiv.length).toBeGreaterThan(0);
    });

    it('should flag individual points below LCL', () => {
      // Stable data with one extreme low value
      const values = [100, 100, 100, 100, 100, 100, 100, 100, 100, 0];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      const oocIndiv = chart.outOfControl.filter((p) => !p.rules[0]?.startsWith('MR:'));
      expect(oocIndiv.length).toBeGreaterThan(0);
    });

    it('should flag large moving ranges', () => {
      const values = [10, 10, 10, 10, 10, 10, 10, 10, 10, 100];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      const oocMR = chart.outOfControl.filter((p) => p.rules[0]?.startsWith('MR:'));
      expect(oocMR.length).toBeGreaterThan(0);
    });

    it('should return no OOC for stable process', () => {
      const values = [50.0, 50.1, 49.9, 50.0, 50.1, 49.9, 50.0, 50.1, 49.9, 50.0];
      const data = makeDataPoints(values);
      const chart = iMrChart(data);

      expect(chart.outOfControl).toHaveLength(0);
    });
  });

  describe('special cases', () => {
    it('should handle 2 data points (minimum)', () => {
      const data = makeDataPoints([10, 20]);
      const chart = iMrChart(data);

      expect(chart.dataPoints).toHaveLength(2);
      expect(chart.rangePoints).toHaveLength(1);
      expect(chart.centerLine).toBeCloseTo(15, 2);
      expect(chart.rangeCenterLine).toBeCloseTo(10, 2);
    });

    it('should handle negative values', () => {
      const data = makeDataPoints([-10, -5, -8, -12, -7]);
      const chart = iMrChart(data);

      expect(chart.centerLine).toBeLessThan(0);
      expect(chart.dataPoints).toHaveLength(5);
    });

    it('should handle very large values', () => {
      const data = makeDataPoints([1e9, 1e9 + 1, 1e9 - 1, 1e9 + 2, 1e9 - 2]);
      const chart = iMrChart(data);

      expect(chart.type).toBe('IMR');
      expect(chart.dataPoints).toHaveLength(5);
    });

    it('should handle decimal precision values', () => {
      const data = makeDataPoints([0.001, 0.002, 0.0015, 0.0018, 0.0012]);
      const chart = iMrChart(data);

      expect(chart.centerLine).toBeCloseTo(0.0015, 4);
    });

    it('should preserve timestamps in plotted points', () => {
      const data = makeDataPoints([10, 20, 30]);
      const chart = iMrChart(data);

      expect(chart.dataPoints[0].timestamp).toEqual(data[0].timestamp);
      expect(chart.dataPoints[1].timestamp).toEqual(data[1].timestamp);
      expect(chart.dataPoints[2].timestamp).toEqual(data[2].timestamp);
    });

    it('should use second timestamp for first MR point', () => {
      const data = makeDataPoints([10, 20, 30]);
      const chart = iMrChart(data);

      // MR point 0 is between data[0] and data[1], uses data[1] timestamp
      expect(chart.rangePoints![0].timestamp).toEqual(data[1].timestamp);
    });
  });
});
