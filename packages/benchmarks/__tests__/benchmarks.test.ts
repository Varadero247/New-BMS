import {
  getBenchmark,
  calculatePercentile,
  generateBenchmarkNarrative,
  BENCHMARK_DATA,
} from '../src';

describe('benchmarks', () => {
  describe('BENCHMARK_DATA', () => {
    it('should have all 10 KPIs defined', () => {
      const kpis = Object.keys(BENCHMARK_DATA);
      expect(kpis).toContain('ltifr');
      expect(kpis).toContain('trir');
      expect(kpis).toContain('dpmo');
      expect(kpis).toContain('firstPassYield');
      expect(kpis).toContain('capaCloseRate');
      expect(kpis).toContain('auditPassRate');
      expect(kpis).toContain('carbonIntensity');
      expect(kpis).toContain('genderPayGap');
      expect(kpis).toContain('trainingCompliance');
      expect(kpis).toContain('supplierNCRRate');
    });

    it('should have manufacturing data for LTIFR', () => {
      expect(BENCHMARK_DATA.ltifr.manufacturing.average).toBe(2.8);
    });

    it('should have automotive DPMO as 233', () => {
      expect(BENCHMARK_DATA.dpmo.automotive.average).toBe(233);
    });

    it('should have construction TRIR average of 4.2', () => {
      expect(BENCHMARK_DATA.trir.construction.average).toBe(4.2);
    });
  });

  describe('getBenchmark', () => {
    it('should return benchmark for LTIFR in manufacturing', () => {
      const result = getBenchmark('ltifr', 'manufacturing');
      expect(result).not.toBeNull();
      expect(result!.average).toBe(2.8);
      expect(result!.bestInClass).toBe(0.5);
      expect(result!.lowerIsBetter).toBe(true);
    });

    it('should return benchmark for firstPassYield in automotive', () => {
      const result = getBenchmark('firstPassYield', 'automotive');
      expect(result).not.toBeNull();
      expect(result!.average).toBe(98);
      expect(result!.lowerIsBetter).toBe(false);
    });

    it('should return null for unknown KPI', () => {
      const result = getBenchmark('unknown' as string, 'manufacturing');
      expect(result).toBeNull();
    });

    it('should return null for unknown industry', () => {
      const result = getBenchmark('ltifr', 'unknown' as string);
      expect(result).toBeNull();
    });

    it('should include unit information', () => {
      const result = getBenchmark('carbonIntensity', 'services');
      expect(result!.unit).toBe('tCO2e/GBP M');
    });
  });

  describe('calculatePercentile', () => {
    it('should rank best-in-class LTIFR near 100th percentile', () => {
      const percentile = calculatePercentile(0.5, 'ltifr', 'manufacturing');
      expect(percentile).toBeGreaterThanOrEqual(90);
    });

    it('should rank worst-in-class LTIFR near 0th percentile', () => {
      const percentile = calculatePercentile(8.0, 'ltifr', 'manufacturing');
      expect(percentile).toBeLessThanOrEqual(10);
    });

    it('should rank average LTIFR near 50th percentile', () => {
      const percentile = calculatePercentile(2.8, 'ltifr', 'manufacturing');
      // Should be roughly in the middle range
      expect(percentile).toBeGreaterThanOrEqual(30);
      expect(percentile).toBeLessThanOrEqual(80);
    });

    it('should handle higher-is-better KPIs correctly', () => {
      // Best in class firstPassYield in automotive is 99.9%
      const bestPercentile = calculatePercentile(99.9, 'firstPassYield', 'automotive');
      const worstPercentile = calculatePercentile(90, 'firstPassYield', 'automotive');
      expect(bestPercentile).toBeGreaterThan(worstPercentile);
    });

    it('should clamp to 0-100 range', () => {
      // Value better than best in class
      const percentile = calculatePercentile(0.01, 'ltifr', 'manufacturing');
      expect(percentile).toBeLessThanOrEqual(100);
      expect(percentile).toBeGreaterThanOrEqual(0);
    });

    it('should return 50 for unknown KPI', () => {
      const percentile = calculatePercentile(5, 'unknown' as string, 'manufacturing');
      expect(percentile).toBe(50);
    });

    it('should handle capaCloseRate scoring', () => {
      // 95% close rate in manufacturing (best in class) should be high percentile
      const high = calculatePercentile(95, 'capaCloseRate', 'manufacturing');
      const low = calculatePercentile(60, 'capaCloseRate', 'manufacturing');
      expect(high).toBeGreaterThan(low);
    });
  });

  describe('generateBenchmarkNarrative', () => {
    it('should generate narrative for good LTIFR', () => {
      const narrative = generateBenchmarkNarrative(1.8, 'ltifr', 'manufacturing');
      expect(narrative).toContain('LTIFR');
      expect(narrative).toContain('1.8');
      expect(narrative).toContain('manufacturing');
      expect(narrative).toContain('better');
    });

    it('should generate narrative for poor LTIFR', () => {
      const narrative = generateBenchmarkNarrative(5.0, 'ltifr', 'manufacturing');
      expect(narrative).toContain('worse');
    });

    it('should include industry average', () => {
      const narrative = generateBenchmarkNarrative(90, 'capaCloseRate', 'manufacturing');
      expect(narrative).toContain('85');
    });

    it('should include best-in-class value', () => {
      const narrative = generateBenchmarkNarrative(80, 'trainingCompliance', 'manufacturing');
      expect(narrative).toContain('98');
    });

    it('should handle unknown KPI gracefully', () => {
      const narrative = generateBenchmarkNarrative(5, 'unknown' as string, 'manufacturing');
      expect(narrative).toContain('No benchmark data');
    });

    it('should format percentage KPIs correctly', () => {
      const narrative = generateBenchmarkNarrative(96, 'firstPassYield', 'manufacturing');
      expect(narrative).toContain('%');
    });

    it('should indicate performance level', () => {
      const narrative = generateBenchmarkNarrative(0.3, 'ltifr', 'manufacturing');
      expect(narrative).toContain('best-in-class');
    });
  });
});
