import { calculateRiskScore, getRiskLevel, calculateWelPercentage, getWelStatus } from '../src/services/riskCalculator';

describe('riskCalculator', () => {
  describe('calculateRiskScore', () => {
    it('should return 1 for likelihood=1, severity=1', () => {
      expect(calculateRiskScore(1, 1)).toBe(1);
    });

    it('should return 12 for likelihood=3, severity=4', () => {
      expect(calculateRiskScore(3, 4)).toBe(12);
    });

    it('should return 25 for likelihood=5, severity=5', () => {
      expect(calculateRiskScore(5, 5)).toBe(25);
    });

    it('should return 5 for likelihood=1, severity=5', () => {
      expect(calculateRiskScore(1, 5)).toBe(5);
    });

    it('should return 10 for likelihood=2, severity=5', () => {
      expect(calculateRiskScore(2, 5)).toBe(10);
    });

    it('should clamp values below 1 to 1', () => {
      expect(calculateRiskScore(0, 3)).toBe(3);
      expect(calculateRiskScore(-1, 4)).toBe(4);
    });

    it('should clamp values above 5 to 5', () => {
      expect(calculateRiskScore(6, 3)).toBe(15);
      expect(calculateRiskScore(3, 10)).toBe(15);
    });
  });

  describe('getRiskLevel', () => {
    it('should return VERY_LOW for score 1', () => {
      expect(getRiskLevel(1)).toBe('VERY_LOW');
    });

    it('should return VERY_LOW for score 2', () => {
      expect(getRiskLevel(2)).toBe('VERY_LOW');
    });

    it('should return LOW for score 3', () => {
      expect(getRiskLevel(3)).toBe('LOW');
    });

    it('should return LOW for score 4', () => {
      expect(getRiskLevel(4)).toBe('LOW');
    });

    it('should return MEDIUM for score 5', () => {
      expect(getRiskLevel(5)).toBe('MEDIUM');
    });

    it('should return MEDIUM for score 9', () => {
      expect(getRiskLevel(9)).toBe('MEDIUM');
    });

    it('should return HIGH for score 10', () => {
      expect(getRiskLevel(10)).toBe('HIGH');
    });

    it('should return HIGH for score 12', () => {
      expect(getRiskLevel(12)).toBe('HIGH');
    });

    it('should return HIGH for score 14', () => {
      expect(getRiskLevel(14)).toBe('HIGH');
    });

    it('should return VERY_HIGH for score 15', () => {
      expect(getRiskLevel(15)).toBe('VERY_HIGH');
    });

    it('should return VERY_HIGH for score 19', () => {
      expect(getRiskLevel(19)).toBe('VERY_HIGH');
    });

    it('should return UNACCEPTABLE for score 20', () => {
      expect(getRiskLevel(20)).toBe('UNACCEPTABLE');
    });

    it('should return UNACCEPTABLE for score 25', () => {
      expect(getRiskLevel(25)).toBe('UNACCEPTABLE');
    });
  });

  describe('calculateWelPercentage', () => {
    it('should return 50 for result=5, limit=10', () => {
      expect(calculateWelPercentage(5, 10)).toBe(50);
    });

    it('should return 100 for result=10, limit=10', () => {
      expect(calculateWelPercentage(10, 10)).toBe(100);
    });

    it('should return 150 for result=15, limit=10', () => {
      expect(calculateWelPercentage(15, 10)).toBe(150);
    });

    it('should return 0 for result=0, limit=10', () => {
      expect(calculateWelPercentage(0, 10)).toBe(0);
    });

    it('should return 0 when limit is 0', () => {
      expect(calculateWelPercentage(5, 0)).toBe(0);
    });

    it('should return 0 when limit is negative', () => {
      expect(calculateWelPercentage(5, -1)).toBe(0);
    });

    it('should round to one decimal place', () => {
      // 1/3 * 100 = 33.333... => 33.3
      expect(calculateWelPercentage(1, 3)).toBe(33.3);
    });
  });

  describe('getWelStatus', () => {
    it('should return BELOW_WEL for 50%', () => {
      expect(getWelStatus(50)).toBe('BELOW_WEL');
    });

    it('should return BELOW_WEL for 0%', () => {
      expect(getWelStatus(0)).toBe('BELOW_WEL');
    });

    it('should return BELOW_WEL for 89.9%', () => {
      expect(getWelStatus(89.9)).toBe('BELOW_WEL');
    });

    it('should return AT_WEL for 90%', () => {
      expect(getWelStatus(90)).toBe('AT_WEL');
    });

    it('should return AT_WEL for 95%', () => {
      expect(getWelStatus(95)).toBe('AT_WEL');
    });

    it('should return AT_WEL for 99.9%', () => {
      expect(getWelStatus(99.9)).toBe('AT_WEL');
    });

    it('should return ABOVE_WEL for 100%', () => {
      expect(getWelStatus(100)).toBe('ABOVE_WEL');
    });

    it('should return ABOVE_WEL for 110%', () => {
      expect(getWelStatus(110)).toBe('ABOVE_WEL');
    });

    it('should return ABOVE_WEL for 200%', () => {
      expect(getWelStatus(200)).toBe('ABOVE_WEL');
    });
  });
});
