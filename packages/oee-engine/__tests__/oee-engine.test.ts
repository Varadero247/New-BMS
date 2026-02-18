import { calculateOEE, calculateMTBF, calculateMTTR, isWorldClass, getOEECategory } from '../src';

describe('oee-engine', () => {
  describe('calculateOEE', () => {
    it('should calculate perfect OEE (100%)', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        downtime: 0,
        idealCycleTime: 1,
        totalPieces: 480,
        goodPieces: 480,
      });
      expect(result.oee).toBe(1);
      expect(result.availability).toBe(1);
      expect(result.performance).toBe(1);
      expect(result.quality).toBe(1);
    });

    it('should calculate a typical manufacturing scenario', () => {
      // 8-hour shift, 60 min downtime, 1 min cycle, 390 pieces, 370 good
      const result = calculateOEE({
        plannedProductionTime: 480,
        downtime: 60,
        idealCycleTime: 1,
        totalPieces: 390,
        goodPieces: 370,
      });
      // Availability: 420/480 = 0.875
      expect(result.availability).toBeCloseTo(0.875, 3);
      // Performance: (1 * 390) / 420 = 0.9286
      expect(result.performance).toBeCloseTo(0.9286, 3);
      // Quality: 370/390 = 0.9487
      expect(result.quality).toBeCloseTo(0.9487, 3);
      // OEE: 0.875 * 0.9286 * 0.9487 = 0.7708
      expect(result.oee).toBeCloseTo(0.7708, 2);
    });

    it('should cap performance at 1.0', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        downtime: 0,
        idealCycleTime: 1,
        totalPieces: 500, // more than possible
        goodPieces: 500,
      });
      expect(result.performance).toBe(1);
    });

    it('should handle zero total pieces', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        downtime: 0,
        idealCycleTime: 1,
        totalPieces: 0,
        goodPieces: 0,
      });
      expect(result.quality).toBe(0);
      expect(result.oee).toBe(0);
    });

    it('should calculate defect pieces', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        downtime: 0,
        idealCycleTime: 1,
        totalPieces: 400,
        goodPieces: 380,
      });
      expect(result.defectPieces).toBe(20);
    });

    it('should calculate run time', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        downtime: 80,
        idealCycleTime: 1,
        totalPieces: 400,
        goodPieces: 400,
      });
      expect(result.runTime).toBe(400);
    });

    it('should format OEE percent string', () => {
      const result = calculateOEE({
        plannedProductionTime: 480,
        downtime: 60,
        idealCycleTime: 1,
        totalPieces: 390,
        goodPieces: 370,
      });
      expect(result.oeePercent).toMatch(/^\d+\.\d%$/);
    });

    it('should throw for negative downtime', () => {
      expect(() =>
        calculateOEE({
          plannedProductionTime: 480,
          downtime: -10,
          idealCycleTime: 1,
          totalPieces: 400,
          goodPieces: 400,
        })
      ).toThrow('Downtime must be non-negative');
    });

    it('should throw when downtime exceeds planned time', () => {
      expect(() =>
        calculateOEE({
          plannedProductionTime: 480,
          downtime: 500,
          idealCycleTime: 1,
          totalPieces: 400,
          goodPieces: 400,
        })
      ).toThrow('Downtime cannot exceed planned production time');
    });

    it('should throw when good pieces exceed total', () => {
      expect(() =>
        calculateOEE({
          plannedProductionTime: 480,
          downtime: 0,
          idealCycleTime: 1,
          totalPieces: 100,
          goodPieces: 150,
        })
      ).toThrow('Good pieces cannot exceed total pieces');
    });
  });

  describe('calculateMTBF', () => {
    it('should calculate MTBF correctly', () => {
      expect(calculateMTBF(5, 1000)).toBe(200);
    });

    it('should return Infinity for zero failures', () => {
      expect(calculateMTBF(0, 1000)).toBe(Infinity);
    });

    it('should handle single failure', () => {
      expect(calculateMTBF(1, 720)).toBe(720);
    });

    it('should throw for negative failures', () => {
      expect(() => calculateMTBF(-1, 100)).toThrow('Failures must be non-negative');
    });
  });

  describe('calculateMTTR', () => {
    it('should calculate average repair time', () => {
      expect(calculateMTTR([2, 3, 1, 4])).toBe(2.5);
    });

    it('should return 0 for empty array', () => {
      expect(calculateMTTR([])).toBe(0);
    });

    it('should handle single repair', () => {
      expect(calculateMTTR([5])).toBe(5);
    });
  });

  describe('isWorldClass', () => {
    it('should return true for OEE >= 0.85', () => {
      expect(isWorldClass(0.85)).toBe(true);
      expect(isWorldClass(0.9)).toBe(true);
    });

    it('should return false for OEE < 0.85', () => {
      expect(isWorldClass(0.84)).toBe(false);
      expect(isWorldClass(0.5)).toBe(false);
    });
  });

  describe('getOEECategory', () => {
    it('should return world-class for >= 85%', () => {
      expect(getOEECategory(0.9)).toBe('world-class');
    });

    it('should return good for 75-84%', () => {
      expect(getOEECategory(0.8)).toBe('good');
    });

    it('should return average for 65-74%', () => {
      expect(getOEECategory(0.7)).toBe('average');
    });

    it('should return below-average for 50-64%', () => {
      expect(getOEECategory(0.55)).toBe('below-average');
    });

    it('should return poor for < 50%', () => {
      expect(getOEECategory(0.4)).toBe('poor');
    });
  });
});
