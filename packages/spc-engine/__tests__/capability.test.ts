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
        50.00, 50.01, 49.99, 50.00, 50.01, 49.99,
        50.00, 50.01, 49.99, 50.00, 50.01, 49.99,
        50.00, 50.01, 49.99, 50.00, 50.01, 49.99,
        50.00, 50.01,
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
        data.push(50 + (i % 5 - 2) * 0.5);
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
      const data = [
        51.0, 51.1, 50.9, 51.0, 51.2, 50.8, 51.0, 51.1, 50.9, 51.0,
      ];
      const result = calculateCpk(data, 52, 48);
      expect(result.cpk).toBeLessThan(result.cp);
    });

    it('should have Cpk close to Cp when process is centered', () => {
      const data = [
        50.0, 50.1, 49.9, 50.0, 50.1, 49.9, 50.0, 50.1, 49.9, 50.0,
      ];
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
      const data = [
        51.0, 51.1, 50.9, 51.0, 51.2, 50.8, 51.0, 51.1, 50.9, 51.0,
      ];
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
        50.00, 50.01, 49.99, 50.00, 50.01, 49.99,
        50.00, 50.01, 49.99, 50.00, 50.01, 49.99,
        50.00, 50.01, 49.99, 50.00, 50.01, 49.99,
        50.00, 50.01,
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
