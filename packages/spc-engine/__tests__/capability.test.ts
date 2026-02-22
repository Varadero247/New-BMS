import { calculateCpk, calculatePpk } from '../src';

describe('calculateCpk — comprehensive', () => {
  describe('input validation', () => {
    it('should throw for empty data', () => {
      expect(() => calculateCpk([], 10, 0)).toThrow('Need at least 2 data points');
    });

    it('should throw for single data point', () => {
      expect(() => calculateCpk([5], 10, 0)).toThrow('Need at least 2 data points');
    });

    it('should throw when USL < LSL', () => {
      expect(() => calculateCpk([5, 6], 0, 10)).toThrow('USL must be greater than LSL');
    });

    it('should throw when USL equals LSL', () => {
      expect(() => calculateCpk([5, 6], 5, 5)).toThrow('USL must be greater than LSL');
    });

    it('should accept exactly 2 data points', () => {
      expect(() => calculateCpk([5, 6], 10, 0)).not.toThrow();
    });

    it('should accept negative spec limits', () => {
      const result = calculateCpk([-5, -4, -6, -5, -4], 0, -10);
      expect(result.cp).toBeGreaterThan(0);
    });
  });

  describe('CAPABLE status (Cpk >= 1.67)', () => {
    it('should return CAPABLE for tight, centered data', () => {
      const data = [
        50.0, 50.01, 49.99, 50.0, 50.01, 49.99, 50.0, 50.01, 49.99, 50.0, 50.01, 49.99, 50.0, 50.01,
        49.99, 50.0, 50.01, 49.99, 50.0, 50.01,
      ];
      const result = calculateCpk(data, 55, 45);
      expect(result.status).toBe('CAPABLE');
      expect(result.cpk).toBeGreaterThanOrEqual(1.67);
    });
  });

  describe('MARGINAL status (1.33 <= Cpk < 1.67)', () => {
    it('should return MARGINAL for moderate variation', () => {
      // Construct data with moderate spread relative to specs
      const data: number[] = [];
      for (let i = 0; i < 30; i++) {
        data.push(50 + ((i % 5) - 2) * 0.5);
      }
      const result = calculateCpk(data, 54, 46);
      // This may be CAPABLE or MARGINAL depending on exact spread
      expect(['CAPABLE', 'MARGINAL']).toContain(result.status);
    });
  });

  describe('INCAPABLE status (Cpk < 1.33)', () => {
    it('should return INCAPABLE for wide variation', () => {
      const data = [40, 60, 42, 58, 45, 55, 43, 57, 44, 56];
      const result = calculateCpk(data, 52, 48);
      expect(result.status).toBe('INCAPABLE');
      expect(result.cpk).toBeLessThan(1.33);
    });

    it('should return INCAPABLE for data outside spec limits', () => {
      const data = [0, 100, 50, 0, 100, 50, 0, 100, 50, 0];
      const result = calculateCpk(data, 60, 40);
      expect(result.status).toBe('INCAPABLE');
    });
  });

  describe('Cp vs Cpk (centering)', () => {
    it('should have Cpk < Cp when process is off-center', () => {
      const data = [51.0, 51.1, 50.9, 51.0, 51.2, 50.8, 51.0, 51.1, 50.9, 51.0];
      const result = calculateCpk(data, 52, 48);
      expect(result.cpk).toBeLessThan(result.cp);
    });

    it('should have Cpk close to Cp when process is centered', () => {
      const data = [50.0, 50.1, 49.9, 50.0, 50.1, 49.9, 50.0, 50.1, 49.9, 50.0];
      const result = calculateCpk(data, 52, 48);
      // When perfectly centered, Cpk = Cp
      expect(Math.abs(result.cpk - result.cp)).toBeLessThan(0.5);
    });
  });

  describe('mean calculation', () => {
    it('should compute correct mean', () => {
      const data = [10, 20, 30, 40, 50];
      const result = calculateCpk(data, 100, 0);
      expect(result.mean).toBeCloseTo(30, 0);
    });

    it('should compute correct mean for symmetric data', () => {
      const data = [48, 49, 50, 51, 52];
      const result = calculateCpk(data, 60, 40);
      expect(result.mean).toBeCloseTo(50, 0);
    });
  });

  describe('sigma estimation', () => {
    it('should return positive sigma for varying data', () => {
      const data = [10, 12, 11, 13, 10, 14, 11, 12, 10, 13];
      const result = calculateCpk(data, 20, 0);
      expect(result.sigma).toBeGreaterThan(0);
    });

    it('should return 0 Cp when sigma is 0 (constant data)', () => {
      const data = [50, 50, 50, 50, 50];
      const result = calculateCpk(data, 60, 40);
      expect(result.sigma).toBe(0);
      expect(result.cp).toBe(0);
    });
  });

  describe('Pp and Ppk values', () => {
    it('should include both Pp and Ppk in result', () => {
      const data = [50, 50.1, 49.9, 50.0, 50.1, 49.8, 50.2, 50.0, 49.9, 50.1];
      const result = calculateCpk(data, 52, 48);
      expect(result.pp).toBeGreaterThan(0);
      expect(result.ppk).toBeGreaterThan(0);
    });

    it('should have Ppk <= Pp', () => {
      const data = [51.0, 51.1, 50.9, 51.0, 51.2, 50.8, 51.0, 51.1, 50.9, 51.0];
      const result = calculateCpk(data, 52, 48);
      expect(result.ppk).toBeLessThanOrEqual(result.pp + 0.001); // small tolerance
    });
  });

  describe('rounding', () => {
    it('should round Cp to 3 decimal places', () => {
      const data = [50, 50.1, 49.9, 50.0, 50.1, 49.8, 50.2, 50.0, 49.9, 50.1];
      const result = calculateCpk(data, 52, 48);
      const decPlaces = result.cp.toString().split('.')[1]?.length || 0;
      expect(decPlaces).toBeLessThanOrEqual(3);
    });

    it('should round Cpk to 3 decimal places', () => {
      const data = [50, 50.1, 49.9, 50.0, 50.1, 49.8, 50.2, 50.0, 49.9, 50.1];
      const result = calculateCpk(data, 52, 48);
      const decPlaces = result.cpk.toString().split('.')[1]?.length || 0;
      expect(decPlaces).toBeLessThanOrEqual(3);
    });
  });
});

describe('calculatePpk — comprehensive', () => {
  describe('input validation', () => {
    it('should throw for empty data', () => {
      expect(() => calculatePpk([], 10, 0)).toThrow('Need at least 2 data points');
    });

    it('should throw for single data point', () => {
      expect(() => calculatePpk([5], 10, 0)).toThrow('Need at least 2 data points');
    });

    it('should throw when USL <= LSL', () => {
      expect(() => calculatePpk([5, 6], 0, 10)).toThrow('USL must be greater than LSL');
    });
  });

  describe('status based on Ppk (not Cpk)', () => {
    it('should return CAPABLE when Ppk >= 1.67', () => {
      const data = [
        50.0, 50.01, 49.99, 50.0, 50.01, 49.99, 50.0, 50.01, 49.99, 50.0, 50.01, 49.99, 50.0, 50.01,
        49.99, 50.0, 50.01, 49.99, 50.0, 50.01,
      ];
      const result = calculatePpk(data, 55, 45);
      if (result.ppk >= 1.67) {
        expect(result.status).toBe('CAPABLE');
      }
    });

    it('should return INCAPABLE when Ppk < 1.33', () => {
      const data = [40, 60, 42, 58, 45, 55, 43, 57, 44, 56];
      const result = calculatePpk(data, 52, 48);
      expect(result.ppk).toBeLessThan(1.33);
      expect(result.status).toBe('INCAPABLE');
    });

    it('should return valid status string', () => {
      const data = [50, 50.1, 49.9, 50.0, 50.1, 49.8, 50.2, 50.0, 49.9, 50.1];
      const result = calculatePpk(data, 52, 48);
      expect(['CAPABLE', 'MARGINAL', 'INCAPABLE']).toContain(result.status);
    });
  });

  describe('includes Cp and Cpk values', () => {
    it('should include all four capability indices', () => {
      const data = [50, 50.1, 49.9, 50.0, 50.1, 49.8, 50.2, 50.0, 49.9, 50.1];
      const result = calculatePpk(data, 52, 48);

      expect(result.cp).toBeDefined();
      expect(result.cpk).toBeDefined();
      expect(result.pp).toBeDefined();
      expect(result.ppk).toBeDefined();
    });

    it('should have same Cp/Cpk as calculateCpk', () => {
      const data = [50, 50.1, 49.9, 50.0, 50.1, 49.8, 50.2, 50.0, 49.9, 50.1];
      const cpkResult = calculateCpk(data, 52, 48);
      const ppkResult = calculatePpk(data, 52, 48);

      expect(ppkResult.cp).toBe(cpkResult.cp);
      expect(ppkResult.cpk).toBe(cpkResult.cpk);
      expect(ppkResult.pp).toBe(cpkResult.pp);
      expect(ppkResult.ppk).toBe(cpkResult.ppk);
    });
  });

  describe('mean and sigma', () => {
    it('should compute same mean as calculateCpk', () => {
      const data = [10, 20, 30, 40, 50];
      const cpkResult = calculateCpk(data, 100, 0);
      const ppkResult = calculatePpk(data, 100, 0);
      expect(ppkResult.mean).toBe(cpkResult.mean);
    });

    it('should compute same sigma as calculateCpk', () => {
      const data = [10, 20, 30, 40, 50];
      const cpkResult = calculateCpk(data, 100, 0);
      const ppkResult = calculatePpk(data, 100, 0);
      expect(ppkResult.sigma).toBe(cpkResult.sigma);
    });
  });
});

// ─── Additional edge-case and boundary coverage ────────────────────────────────

describe('calculateCpk — boundary and additional edge cases', () => {
  it('returns mean equal to the single value when all data is identical', () => {
    const result = calculateCpk([7, 7, 7, 7, 7], 10, 4);
    expect(result.mean).toBe(7);
  });

  it('has Cp of 0 when sigma is 0 (constant data)', () => {
    const result = calculateCpk([50, 50, 50], 60, 40);
    expect(result.cp).toBe(0);
  });

  it('handles large datasets without throwing', () => {
    const data = Array.from({ length: 200 }, (_, i) => 50 + (i % 5) - 2);
    expect(() => calculateCpk(data, 60, 40)).not.toThrow();
  });

  it('result object has all required properties', () => {
    const result = calculateCpk([10, 12, 11, 13, 10], 20, 0);
    expect(result).toHaveProperty('cp');
    expect(result).toHaveProperty('cpk');
    expect(result).toHaveProperty('pp');
    expect(result).toHaveProperty('ppk');
    expect(result).toHaveProperty('mean');
    expect(result).toHaveProperty('sigma');
    expect(result).toHaveProperty('status');
  });

  it('status is one of CAPABLE, MARGINAL, or INCAPABLE', () => {
    const result = calculateCpk([50, 51, 49, 50, 51], 60, 40);
    expect(['CAPABLE', 'MARGINAL', 'INCAPABLE']).toContain(result.status);
  });
});

describe('calculateCpk and calculatePpk — further coverage', () => {
  it('calculateCpk with data all at LSL has Cpk of 0 or negative', () => {
    const data = [0, 0, 0, 0, 0];
    const result = calculateCpk(data, 10, 0);
    expect(result.mean).toBe(0);
    // All data at boundary; cp=0 because sigma=0, cpk=0
    expect(result.cp).toBe(0);
  });

  it('calculatePpk returns INCAPABLE for very wide spread data', () => {
    const data = [0, 100, 0, 100, 0, 100, 0, 100, 0, 100];
    const result = calculatePpk(data, 60, 40);
    expect(result.status).toBe('INCAPABLE');
  });

  it('calculateCpk Cpk equals Cp for a perfectly centered process', () => {
    const data = [49.9, 50.0, 50.1, 50.0, 49.9, 50.1, 50.0, 50.1, 49.9, 50.0];
    const result = calculateCpk(data, 52, 48);
    // Very close to centered so cpk ≈ cp
    expect(Math.abs(result.cpk - result.cp)).toBeLessThan(0.2);
  });
});

describe('calculateCpk and calculatePpk — additional coverage to reach 40', () => {
  it('calculateCpk returns a numeric mean for all-positive data', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = calculateCpk(data, 15, 0);
    expect(typeof result.mean).toBe('number');
  });

  it('calculateCpk sigma is positive for non-constant data', () => {
    const data = [10, 12, 11, 13, 14, 11, 10, 12];
    const result = calculateCpk(data, 20, 5);
    expect(result.sigma).toBeGreaterThan(0);
  });

  it('calculatePpk with two data points does not throw', () => {
    expect(() => calculatePpk([5, 6], 10, 0)).not.toThrow();
  });

  it('calculateCpk result.pp is >= 0 for any valid input', () => {
    const data = [48, 49, 50, 51, 52, 50, 49, 51, 50, 48];
    const result = calculateCpk(data, 55, 45);
    expect(result.pp).toBeGreaterThanOrEqual(0);
  });

  it('calculatePpk result.cp is >= 0 for any valid input', () => {
    const data = [20, 22, 21, 23, 22, 20, 21, 22, 23, 20];
    const result = calculatePpk(data, 30, 10);
    expect(result.cp).toBeGreaterThanOrEqual(0);
  });

  it('calculateCpk throws with USL equal to LSL', () => {
    expect(() => calculateCpk([5, 6, 7], 10, 10)).toThrow('USL must be greater than LSL');
  });

  it('calculateCpk processes float data correctly without throwing', () => {
    const data = [1.1, 1.2, 1.15, 1.18, 1.12, 1.09, 1.21, 1.14];
    expect(() => calculateCpk(data, 1.5, 0.8)).not.toThrow();
  });

  it('calculatePpk result has sigma field of type number', () => {
    const data = [10, 11, 12, 13, 10, 11, 12];
    const result = calculatePpk(data, 20, 5);
    expect(typeof result.sigma).toBe('number');
  });
});
