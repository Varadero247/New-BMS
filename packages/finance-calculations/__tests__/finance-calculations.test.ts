import {
  straightLine,
  reducingBalance,
  sumOfDigits,
  unitsOfProduction,
  simpleInterest,
  compoundInterest,
  npv,
  irr,
  convertCurrency,
  calculateFxGainLoss,
  roundToDecimal,
} from '../src';

describe('finance-calculations', () => {
  describe('straightLine', () => {
    it('should calculate annual depreciation correctly', () => {
      expect(straightLine(10000, 1000, 5)).toBe(1800);
    });

    it('should handle zero salvage value', () => {
      expect(straightLine(12000, 0, 4)).toBe(3000);
    });

    it('should throw if life is zero', () => {
      expect(() => straightLine(10000, 1000, 0)).toThrow('Life must be greater than 0');
    });

    it('should throw if salvage exceeds cost', () => {
      expect(() => straightLine(1000, 2000, 5)).toThrow('Salvage cannot exceed cost');
    });
  });

  describe('reducingBalance', () => {
    it('should calculate higher depreciation in early years', () => {
      const year1 = reducingBalance(10000, 1000, 5, 1);
      const year2 = reducingBalance(10000, 1000, 5, 2);
      expect(year1).toBeGreaterThan(year2);
    });

    it('should depreciate to approximately salvage value over full life', () => {
      let bookValue = 10000;
      for (let y = 1; y <= 5; y++) {
        bookValue -= reducingBalance(10000, 1000, 5, y);
      }
      expect(bookValue).toBeCloseTo(1000, 0);
    });

    it('should throw for year out of range', () => {
      expect(() => reducingBalance(10000, 1000, 5, 6)).toThrow('Year must be between 1 and life');
    });
  });

  describe('sumOfDigits', () => {
    it('should calculate SYD depreciation for year 1', () => {
      // cost=10000, salvage=1000, life=5, year=1
      // sum = 15, remaining = 5, dep = 9000 * 5/15 = 3000
      expect(sumOfDigits(10000, 1000, 5, 1)).toBe(3000);
    });

    it('should calculate SYD depreciation for year 5', () => {
      // remaining = 1, dep = 9000 * 1/15 = 600
      expect(sumOfDigits(10000, 1000, 5, 5)).toBe(600);
    });

    it('should sum to depreciable amount over all years', () => {
      let total = 0;
      for (let y = 1; y <= 5; y++) {
        total += sumOfDigits(10000, 1000, 5, y);
      }
      expect(total).toBeCloseTo(9000, 2);
    });
  });

  describe('unitsOfProduction', () => {
    it('should calculate based on units produced', () => {
      // cost=50000, salvage=5000, totalUnits=100000, thisperiod=8000
      // rate = 45000/100000 = 0.45 per unit, dep = 0.45 * 8000 = 3600
      expect(unitsOfProduction(50000, 5000, 100000, 8000)).toBe(3600);
    });

    it('should return zero for zero units produced', () => {
      expect(unitsOfProduction(50000, 5000, 100000, 0)).toBe(0);
    });

    it('should throw for zero total units', () => {
      expect(() => unitsOfProduction(50000, 5000, 0, 100)).toThrow(
        'Total units must be greater than 0'
      );
    });
  });

  describe('simpleInterest', () => {
    it('should calculate simple interest correctly', () => {
      // 10000 * 0.05 * 3 = 1500
      expect(simpleInterest(10000, 0.05, 3)).toBe(1500);
    });

    it('should return zero for zero rate', () => {
      expect(simpleInterest(10000, 0, 5)).toBe(0);
    });
  });

  describe('compoundInterest', () => {
    it('should calculate annual compounding', () => {
      // 1000 * (1 + 0.05)^3 = 1157.625
      expect(compoundInterest(1000, 0.05, 3, 1)).toBeCloseTo(1157.625, 2);
    });

    it('should calculate monthly compounding', () => {
      // 1000 * (1 + 0.12/12)^(12*1) = 1126.825
      expect(compoundInterest(1000, 0.12, 1, 12)).toBeCloseTo(1126.825, 2);
    });

    it('should return principal when rate is zero', () => {
      expect(compoundInterest(5000, 0, 10, 12)).toBe(5000);
    });
  });

  describe('npv', () => {
    it('should calculate NPV of a simple investment', () => {
      // Initial investment -1000, then 500 each year for 3 years at 10%
      const result = npv(0.1, [-1000, 500, 500, 500]);
      expect(result).toBeCloseTo(243.43, 0);
    });

    it('should return negative NPV for bad investment', () => {
      const result = npv(0.1, [-10000, 1000, 1000, 1000]);
      expect(result).toBeLessThan(0);
    });

    it('should handle zero discount rate', () => {
      const result = npv(0, [-1000, 500, 500, 500]);
      expect(result).toBeCloseTo(500, 2);
    });
  });

  describe('irr', () => {
    it('should find IRR for a simple investment', () => {
      // -1000 initial, 400 per year for 4 years => IRR ~21.86%
      const result = irr([-1000, 400, 400, 400, 400]);
      expect(result).toBeCloseTo(0.2186, 2);
    });

    it('should find zero IRR when cashflows sum to zero', () => {
      const result = irr([-1000, 500, 500]);
      expect(result).toBeCloseTo(0, 2);
    });

    it('should throw for insufficient cash flows', () => {
      expect(() => irr([100])).toThrow('Cash flows must have at least 2 values');
    });
  });

  describe('convertCurrency', () => {
    it('should convert USD to GBP', () => {
      // 100 USD at rate 1.0 to GBP at rate 0.79
      expect(convertCurrency(100, 1.0, 0.79)).toBeCloseTo(79, 2);
    });

    it('should convert GBP to EUR', () => {
      // 100 GBP (rate 0.79) to EUR (rate 0.92)
      expect(convertCurrency(100, 0.79, 0.92)).toBeCloseTo(116.46, 1);
    });

    it('should throw for zero rate', () => {
      expect(() => convertCurrency(100, 0, 1)).toThrow('fromRate must be positive');
    });
  });

  describe('calculateFxGainLoss', () => {
    it('should calculate FX gain', () => {
      // 1000 USD bought at 0.75 GBP/USD, now 0.80 GBP/USD
      const result = calculateFxGainLoss(1000, 0.75, 0.8);
      expect(result).toBeCloseTo(50, 2);
    });

    it('should calculate FX loss', () => {
      const result = calculateFxGainLoss(1000, 0.8, 0.75);
      expect(result).toBeCloseTo(-50, 2);
    });

    it('should return zero when rates are equal', () => {
      expect(calculateFxGainLoss(1000, 0.8, 0.8)).toBe(0);
    });
  });

  describe('roundToDecimal', () => {
    it('should round normally', () => {
      expect(roundToDecimal(1.236, 2)).toBe(1.24);
    });

    it('should use bankers rounding (round half to even) - round down', () => {
      // 2.5 -> 2 (even)
      expect(roundToDecimal(2.5, 0)).toBe(2);
    });

    it('should use bankers rounding (round half to even) - round up', () => {
      // 3.5 -> 4 (even)
      expect(roundToDecimal(3.5, 0)).toBe(4);
    });

    it('should handle more decimal places', () => {
      expect(roundToDecimal(1.23456, 4)).toBe(1.2346);
    });

    it('should handle zero places', () => {
      expect(roundToDecimal(5.7, 0)).toBe(6);
    });
  });
});
