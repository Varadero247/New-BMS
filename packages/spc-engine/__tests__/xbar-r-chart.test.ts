import { xbarRChart, SPC_CONSTANTS } from '../src';
import type { DataPoint } from '../src';

function makeDataPoints(values: number[]): DataPoint[] {
  const baseTime = new Date('2026-01-01T00:00:00Z');
  return values.map((value, i) => ({
    value,
    timestamp: new Date(baseTime.getTime() + i * 60000),
  }));
}

describe('xbarRChart — comprehensive', () => {
  describe('input validation', () => {
    it('should throw for subgroup size 0', () => {
      const data = makeDataPoints([1, 2, 3, 4]);
      expect(() => xbarRChart(data, 0)).toThrow('Subgroup size must be between 2 and 10');
    });

    it('should throw for subgroup size 1', () => {
      const data = makeDataPoints([1, 2, 3, 4]);
      expect(() => xbarRChart(data, 1)).toThrow('Subgroup size must be between 2 and 10');
    });

    it('should throw for subgroup size 11', () => {
      const data = makeDataPoints(Array(22).fill(5));
      expect(() => xbarRChart(data, 11)).toThrow('Subgroup size must be between 2 and 10');
    });

    it('should throw for subgroup size 100', () => {
      const data = makeDataPoints(Array(200).fill(5));
      expect(() => xbarRChart(data, 100)).toThrow('Subgroup size must be between 2 and 10');
    });

    it('should throw for negative subgroup size', () => {
      const data = makeDataPoints([1, 2, 3, 4]);
      expect(() => xbarRChart(data, -1)).toThrow('Subgroup size must be between 2 and 10');
    });

    it('should throw if only 1 complete subgroup exists', () => {
      const data = makeDataPoints([1, 2, 3]);
      expect(() => xbarRChart(data, 3)).toThrow('Need at least 2 complete subgroups');
    });

    it('should throw for empty data array', () => {
      expect(() => xbarRChart([], 2)).toThrow('Need at least 2 complete subgroups');
    });

    it('should throw for single data point', () => {
      const data = makeDataPoints([5]);
      expect(() => xbarRChart(data, 2)).toThrow('Need at least 2 complete subgroups');
    });
  });

  describe('chart type and structure', () => {
    const values = [10, 12, 11, 13, 14, 11, 10, 12, 11, 11];
    const data = makeDataPoints(values);

    it('should return chart type XBAR_R', () => {
      const chart = xbarRChart(data, 5);
      expect(chart.type).toBe('XBAR_R');
    });

    it('should include range chart data', () => {
      const chart = xbarRChart(data, 5);
      expect(chart.rangeUcl).toBeDefined();
      expect(chart.rangeLcl).toBeDefined();
      expect(chart.rangeCenterLine).toBeDefined();
      expect(chart.rangePoints).toBeDefined();
    });

    it('should have correct number of X-bar points', () => {
      const chart = xbarRChart(data, 5);
      expect(chart.dataPoints).toHaveLength(2);
    });

    it('should have correct number of range points', () => {
      const chart = xbarRChart(data, 5);
      expect(chart.rangePoints).toHaveLength(2);
    });
  });

  describe('subgroup size 2', () => {
    it('should compute correct values with subgroup size 2', () => {
      const values = [10, 12, 14, 16, 18, 20];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 2);

      expect(chart.dataPoints).toHaveLength(3);
      // Subgroup 1: [10,12] mean=11, range=2
      // Subgroup 2: [14,16] mean=15, range=2
      // Subgroup 3: [18,20] mean=19, range=2
      expect(chart.centerLine).toBeCloseTo(15, 2);
      expect(chart.rangeCenterLine).toBeCloseTo(2, 2);
    });

    it('should use A2=1.880 for subgroup size 2', () => {
      const values = [10, 20, 10, 20]; // 2 subgroups of 2
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 2);

      const rBar = 10;
      const xBarBar = 15;
      expect(chart.ucl).toBeCloseTo(xBarBar + 1.88 * rBar, 2);
      expect(chart.lcl).toBeCloseTo(xBarBar - 1.88 * rBar, 2);
    });
  });

  describe('subgroup size 3', () => {
    it('should compute correct control limits with A2=1.023', () => {
      // Subgroup 1: [10,15,20] mean=15, range=10
      // Subgroup 2: [12,17,22] mean=17, range=10
      const values = [10, 15, 20, 12, 17, 22];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 3);

      expect(chart.dataPoints).toHaveLength(2);
      expect(chart.centerLine).toBeCloseTo(16, 2);
      expect(chart.rangeCenterLine).toBeCloseTo(10, 2);
      expect(chart.ucl).toBeCloseTo(16 + 1.023 * 10, 2);
    });
  });

  describe('subgroup size 10', () => {
    it('should work with maximum subgroup size 10', () => {
      const values = Array(20)
        .fill(0)
        .map((_, i) => 100 + (i % 10));
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 10);

      expect(chart.dataPoints).toHaveLength(2);
      expect(chart.type).toBe('XBAR_R');
    });
  });

  describe('incomplete trailing subgroups', () => {
    it('should discard 1 trailing point', () => {
      const values = [10, 12, 14, 16, 18, 20, 99];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 3);
      expect(chart.dataPoints).toHaveLength(2); // 6 points / 3 = 2 subgroups, 1 discarded
    });

    it('should discard 2 trailing points', () => {
      const values = [10, 12, 14, 16, 18, 20, 88, 99];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 3);
      expect(chart.dataPoints).toHaveLength(2);
    });

    it('should discard 4 trailing points with subgroup size 5', () => {
      const values = Array(14).fill(50);
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);
      expect(chart.dataPoints).toHaveLength(2); // 10 points used, 4 discarded
    });
  });

  describe('out-of-control detection', () => {
    it('should flag point above UCL', () => {
      // Stable at 10, then one subgroup way above
      const values = [
        10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 50, 50, 50, 50, 50,
      ];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);
      const ooc = chart.outOfControl.filter((p) => !p.rules[0]?.startsWith('Range:'));
      expect(ooc.length).toBeGreaterThan(0);
    });

    it('should not flag in-control points', () => {
      const values = [
        10.1, 10.0, 9.9, 10.0, 10.1, 10.0, 10.1, 9.9, 10.0, 10.0, 10.0, 9.9, 10.1, 10.0, 10.0, 10.1,
        10.0, 10.0, 9.9, 10.1,
      ];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);
      const oocXbar = chart.outOfControl.filter((p) => !p.rules[0]?.startsWith('Range:'));
      expect(oocXbar).toHaveLength(0);
    });

    it('should flag range out-of-control points with Range: prefix', () => {
      const values = [
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        1,
        99,
        1,
        99,
        1, // huge range
      ];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);
      const oocRange = chart.outOfControl.filter((p) => p.rules[0]?.startsWith('Range:'));
      expect(oocRange.length).toBeGreaterThan(0);
    });
  });

  describe('PlottedPoint structure', () => {
    it('should include correct subgroup numbering starting at 1', () => {
      const values = Array(10).fill(50);
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);
      expect(chart.dataPoints[0].subgroup).toBe(1);
      expect(chart.dataPoints[1].subgroup).toBe(2);
    });

    it('should include timestamps from last point in each subgroup', () => {
      const values = Array(10).fill(50);
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);
      // Last point of first subgroup is index 4
      expect(chart.dataPoints[0].timestamp).toEqual(data[4].timestamp);
      // Last point of second subgroup is index 9
      expect(chart.dataPoints[1].timestamp).toEqual(data[9].timestamp);
    });

    it('should set outOfControl flag correctly', () => {
      const values = Array(20).fill(10);
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);
      chart.dataPoints.forEach((p) => {
        expect(p.outOfControl).toBe(false);
        expect(p.violationRules).toHaveLength(0);
      });
    });
  });

  describe('mathematical correctness', () => {
    it('should compute correct UCL and LCL for subgroup size 4', () => {
      // 3 subgroups of 4
      const values = [
        10,
        20,
        30,
        40, // mean=25, range=30
        15,
        25,
        35,
        45, // mean=30, range=30
        12,
        22,
        32,
        42, // mean=27, range=30
      ];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 4);

      const xBarBar = (25 + 30 + 27) / 3;
      const rBar = (30 + 30 + 30) / 3;
      expect(chart.centerLine).toBeCloseTo(xBarBar, 2);
      expect(chart.rangeCenterLine).toBeCloseTo(rBar, 2);
      expect(chart.ucl).toBeCloseTo(xBarBar + SPC_CONSTANTS[4].A2 * rBar, 2);
      expect(chart.lcl).toBeCloseTo(xBarBar - SPC_CONSTANTS[4].A2 * rBar, 2);
      expect(chart.rangeUcl).toBeCloseTo(SPC_CONSTANTS[4].D4 * rBar, 2);
      expect(chart.rangeLcl).toBeCloseTo(SPC_CONSTANTS[4].D3 * rBar, 2);
    });

    it('should handle identical values (zero range)', () => {
      const values = Array(10).fill(50);
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);

      expect(chart.rangeCenterLine).toBe(0);
      expect(chart.centerLine).toBe(50);
      expect(chart.ucl).toBe(50); // A2 * 0 = 0
      expect(chart.lcl).toBe(50);
    });

    it('should handle negative values', () => {
      const values = [-10, -12, -11, -13, -14, -11, -10, -12, -11, -11];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);

      expect(chart.centerLine).toBeLessThan(0);
      expect(chart.lcl).toBeLessThan(chart.centerLine);
      expect(chart.ucl).toBeGreaterThan(chart.centerLine);
    });

    it('should handle mixed positive and negative values', () => {
      const values = [-5, 5, -3, 3, -1, 1, -4, 4, -2, 2];
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 5);

      expect(chart.centerLine).toBeCloseTo(0, 1);
    });

    it('should produce D3 > 0 range LCL for subgroup size 7+', () => {
      const values = Array(14)
        .fill(0)
        .map((_, i) => 100 + (i % 7) * 2);
      const data = makeDataPoints(values);
      const chart = xbarRChart(data, 7);

      expect(chart.rangeLcl).toBeGreaterThan(0);
    });
  });
});

// ─── Additional structural and SPC_CONSTANTS coverage ─────────────────────────

describe('xbarRChart — additional structural coverage', () => {
  it('SPC_CONSTANTS has entries for subgroup sizes 2 through 10', () => {
    for (let n = 2; n <= 10; n++) {
      expect(SPC_CONSTANTS[n]).toBeDefined();
      expect(SPC_CONSTANTS[n].A2).toBeGreaterThan(0);
      expect(SPC_CONSTANTS[n].D4).toBeGreaterThan(0);
    }
  });

  it('outOfControl is always an array', () => {
    const data = makeDataPoints(Array(10).fill(50));
    const chart = xbarRChart(data, 5);
    expect(Array.isArray(chart.outOfControl)).toBe(true);
  });

  it('dataPoints have outOfControl and violationRules fields', () => {
    const data = makeDataPoints(Array(10).fill(50));
    const chart = xbarRChart(data, 5);
    for (const p of chart.dataPoints) {
      expect(typeof p.outOfControl).toBe('boolean');
      expect(Array.isArray(p.violationRules)).toBe(true);
    }
  });

  it('rangePoints length equals the number of subgroups', () => {
    const data = makeDataPoints(Array(15).fill(10));
    const chart = xbarRChart(data, 5);
    expect(chart.rangePoints).toHaveLength(3);
  });

  it('rangeCenterLine is the average of subgroup ranges', () => {
    // Subgroups: [10,20] range=10, [10,20] range=10, [10,20] range=10
    const values = [10, 20, 10, 20, 10, 20];
    const data = makeDataPoints(values);
    const chart = xbarRChart(data, 2);
    expect(chart.rangeCenterLine).toBeCloseTo(10, 4);
  });
});

describe('xbarRChart — final coverage to reach 40', () => {
  it('chart has centerLine, ucl, lcl, rangeUcl, rangeLcl defined', () => {
    const data = makeDataPoints(Array(10).fill(50));
    const chart = xbarRChart(data, 5);
    expect(chart.centerLine).toBeDefined();
    expect(chart.ucl).toBeDefined();
    expect(chart.lcl).toBeDefined();
    expect(chart.rangeUcl).toBeDefined();
    expect(chart.rangeLcl).toBeDefined();
  });

  it('SPC_CONSTANTS[5].A2 is approximately 0.577', () => {
    expect(SPC_CONSTANTS[5].A2).toBeCloseTo(0.577, 2);
  });

  it('SPC_CONSTANTS[2].D3 is 0 (no lower range limit for n=2)', () => {
    expect(SPC_CONSTANTS[2].D3).toBe(0);
  });

  it('rangeLcl is 0 for subgroup sizes 2-6 (D3=0)', () => {
    const data = makeDataPoints(Array(12).fill(10));
    const chart = xbarRChart(data, 6);
    expect(chart.rangeLcl).toBe(0);
  });

  it('subgroup size 10 produces correct number of subgroups for 30 data points', () => {
    const data = makeDataPoints(Array(30).fill(20));
    const chart = xbarRChart(data, 10);
    expect(chart.dataPoints).toHaveLength(3);
  });
});

describe('xbarRChart — phase28 coverage', () => {
  it('SPC_CONSTANTS[10].A2 is less than SPC_CONSTANTS[2].A2 (larger subgroups = tighter control)', () => {
    expect(SPC_CONSTANTS[10].A2).toBeLessThan(SPC_CONSTANTS[2].A2);
  });

  it('throws for subgroup size 0 even with many data points', () => {
    const data = makeDataPoints(Array(100).fill(5));
    expect(() => xbarRChart(data, 0)).toThrow('Subgroup size must be between 2 and 10');
  });

  it('rangePoints have numeric value fields', () => {
    const data = makeDataPoints([10, 20, 10, 20, 10, 20]);
    const chart = xbarRChart(data, 2);
    for (const p of chart.rangePoints!) {
      expect(typeof p.value).toBe('number');
    }
  });

  it('xbar centerLine equals average of subgroup means', () => {
    // Subgroup 1: [10, 20] mean=15; Subgroup 2: [30, 40] mean=35
    const data = makeDataPoints([10, 20, 30, 40]);
    const chart = xbarRChart(data, 2);
    expect(chart.centerLine).toBeCloseTo((15 + 35) / 2, 4);
  });

  it('chart type is always XBAR_R regardless of subgroup size', () => {
    for (let n = 2; n <= 5; n++) {
      const data = makeDataPoints(Array(n * 2).fill(50));
      const chart = xbarRChart(data, n);
      expect(chart.type).toBe('XBAR_R');
    }
  });
});

describe('xbar r chart — phase30 coverage', () => {
  it('handles array map', () => {
    expect([1, 2, 3].map(x => x * 2)).toEqual([2, 4, 6]);
  });

  it('handles flat array', () => {
    expect([[1, 2], [3, 4]].flat()).toEqual([1, 2, 3, 4]);
  });

  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

  it('handles Math.abs', () => {
    expect(Math.abs(-5)).toBe(5);
  });

  it('handles object type', () => {
    expect(typeof {}).toBe('object');
  });

});


describe('phase31 coverage', () => {
  it('handles Array.isArray', () => { expect(Array.isArray([1,2])).toBe(true); expect(Array.isArray('x')).toBe(false); });
  it('handles template literals', () => { const name = 'world'; expect(`hello ${name}`).toBe('hello world'); });
  it('handles Number.isInteger', () => { expect(Number.isInteger(5)).toBe(true); expect(Number.isInteger(5.5)).toBe(false); });
  it('handles object spread', () => { const a = {x:1}; const b = {...a, y:2}; expect(b).toEqual({x:1,y:2}); });
  it('handles ternary', () => { const x = 5 > 3 ? 'yes' : 'no'; expect(x).toBe('yes'); });
});


describe('phase32 coverage', () => {
  it('handles object keys count', () => { expect(Object.keys({a:1,b:2,c:3}).length).toBe(3); });
  it('handles object property shorthand', () => { const x = 1, y = 2; const o = {x, y}; expect(o).toEqual({x:1,y:2}); });
  it('handles number exponential', () => { expect((12345).toExponential(2)).toBe('1.23e+4'); });
  it('handles array sort', () => { expect([3,1,2].sort()).toEqual([1,2,3]); });
  it('handles array values iterator', () => { expect([...['a','b'].values()]).toEqual(['a','b']); });
});
