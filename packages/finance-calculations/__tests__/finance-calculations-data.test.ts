// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Phase 162 — Comprehensive computation and invariant tests for
 * @ims/finance-calculations.
 *
 * Covers exact formula verification for:
 *   simpleInterest   — P × r × t
 *   compoundInterest — P(1 + r/n)^(nt)
 *   npv              — Σ cf[i] / (1+r)^i
 *   irr              — Newton's method convergence; npv(irr)≈0
 *   straightLine     — (cost − salvage) / life
 *   reducingBalance  — declining-balance, year-specific
 *   sumOfDigits      — SYD, front-loaded
 *   unitsOfProduction— proportional to output
 *   convertCurrency  — (amount / fromRate) × toRate
 *   calculateFxGainLoss — amount × (currentRate − originalRate)
 *   roundToDecimal   — banker's rounding (round-half-to-even)
 */

import {
  simpleInterest,
  compoundInterest,
  npv,
  irr,
  straightLine,
  reducingBalance,
  sumOfDigits,
  unitsOfProduction,
  convertCurrency,
  calculateFxGainLoss,
  roundToDecimal,
} from '../src';

// ─── simpleInterest ──────────────────────────────────────────────────────────

describe('simpleInterest', () => {
  const CASES = [
    { p: 1000,   r: 0.05, t: 1,    expected: 50 },
    { p: 1000,   r: 0.05, t: 3,    expected: 150 },
    { p: 5000,   r: 0.10, t: 2,    expected: 1000 },
    { p: 0,      r: 0.05, t: 5,    expected: 0 },
    { p: 1000,   r: 0,    t: 5,    expected: 0 },
    { p: 1000,   r: 0.05, t: 0,    expected: 0 },
    { p: 250000, r: 0.035,t: 12,   expected: 105000 },
    { p: 10000,  r: 0.08, t: 0.5,  expected: 400 },
  ];

  for (const { p, r, t, expected } of CASES) {
    describe(`principal=${p} rate=${r} periods=${t}`, () => {
      it(`returns ${expected}`, () => {
        expect(simpleInterest(p, r, t)).toBeCloseTo(expected, 8);
      });
      it('is finite and non-negative', () => {
        const result = simpleInterest(p, r, t);
        expect(Number.isFinite(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(0);
      });
    });
  }

  describe('proportionality invariants', () => {
    it('doubling principal doubles interest', () => {
      expect(simpleInterest(2000, 0.05, 3)).toBeCloseTo(2 * simpleInterest(1000, 0.05, 3), 8);
    });
    it('doubling rate doubles interest', () => {
      expect(simpleInterest(1000, 0.10, 3)).toBeCloseTo(2 * simpleInterest(1000, 0.05, 3), 8);
    });
    it('doubling periods doubles interest', () => {
      expect(simpleInterest(1000, 0.05, 6)).toBeCloseTo(2 * simpleInterest(1000, 0.05, 3), 8);
    });
  });

  describe('error cases', () => {
    it('throws for negative principal', () => {
      expect(() => simpleInterest(-100, 0.05, 1)).toThrow();
    });
    it('throws for negative rate', () => {
      expect(() => simpleInterest(1000, -0.05, 1)).toThrow();
    });
    it('throws for negative periods', () => {
      expect(() => simpleInterest(1000, 0.05, -1)).toThrow();
    });
  });
});

// ─── compoundInterest ────────────────────────────────────────────────────────

describe('compoundInterest', () => {
  const CASES = [
    // P(1 + r/n)^(nt)
    { p: 1000, r: 0.05, t: 1, n: 1,  expected: 1050 },
    { p: 1000, r: 0.05, t: 2, n: 1,  expected: 1102.5 },
    { p: 1000, r: 0,    t: 5, n: 12, expected: 1000 },
    { p: 1000, r: 0.05, t: 0, n: 12, expected: 1000 },
    { p: 2000, r: 0.04, t: 3, n: 2,  expected: 2000 * Math.pow(1.02, 6) },
    { p: 500,  r: 0.12, t: 5, n: 4,  expected: 500 * Math.pow(1.03, 20) },
  ];

  for (const { p, r, t, n, expected } of CASES) {
    describe(`principal=${p} rate=${r} periods=${t} n=${n}`, () => {
      it(`returns ${expected.toFixed(4)}`, () => {
        expect(compoundInterest(p, r, t, n)).toBeCloseTo(expected, 6);
      });
      it('result ≥ principal (non-negative rate)', () => {
        expect(compoundInterest(p, r, t, n)).toBeGreaterThanOrEqual(p);
      });
    });
  }

  describe('frequency invariants', () => {
    it('daily compounding > monthly > annual for positive rate', () => {
      const annual  = compoundInterest(1000, 0.06, 5, 1);
      const monthly = compoundInterest(1000, 0.06, 5, 12);
      const daily   = compoundInterest(1000, 0.06, 5, 365);
      expect(daily).toBeGreaterThan(monthly);
      expect(monthly).toBeGreaterThan(annual);
    });
    it('compound total > simple total for positive rate over multiple periods', () => {
      const ci = compoundInterest(1000, 0.08, 5, 1);
      const si = 1000 + simpleInterest(1000, 0.08, 5);
      expect(ci).toBeGreaterThan(si);
    });
  });

  describe('error cases', () => {
    it('throws for negative principal', () => {
      expect(() => compoundInterest(-100, 0.05, 1, 12)).toThrow();
    });
    it('throws for negative rate', () => {
      expect(() => compoundInterest(1000, -0.05, 1, 12)).toThrow();
    });
    it('throws for negative periods', () => {
      expect(() => compoundInterest(1000, 0.05, -1, 12)).toThrow();
    });
    it('throws for compoundsPerPeriod = 0', () => {
      expect(() => compoundInterest(1000, 0.05, 1, 0)).toThrow();
    });
    it('throws for compoundsPerPeriod < 0', () => {
      expect(() => compoundInterest(1000, 0.05, 1, -1)).toThrow();
    });
  });
});

// ─── npv ─────────────────────────────────────────────────────────────────────

describe('npv', () => {
  describe('exact values', () => {
    it('single cf at t=0 is not discounted: npv(0.1, [100]) = 100', () => {
      expect(npv(0.1, [100])).toBeCloseTo(100, 8);
    });

    it('two cash flows: npv(0.1, [100, 110]) = 100 + 110/1.1 = 200', () => {
      expect(npv(0.1, [100, 110])).toBeCloseTo(200, 6);
    });

    it('break-even: npv(0.1, [-100, 110]) ≈ 0', () => {
      expect(npv(0.1, [-100, 110])).toBeCloseTo(0, 8);
    });

    it('npv(0.1, [-1000, 500, 500, 500]) ≈ 243.43', () => {
      // -1000 + 500/1.1 + 500/1.21 + 500/1.331
      const expected = -1000 + 500 / 1.1 + 500 / 1.21 + 500 / 1.331;
      expect(npv(0.1, [-1000, 500, 500, 500])).toBeCloseTo(expected, 4);
    });

    it('rate=0 returns sum of cash flows', () => {
      expect(npv(0, [-100, 50, 60, 70])).toBeCloseTo(-100 + 50 + 60 + 70, 8);
    });

    it('all-negative cash flows → negative NPV', () => {
      expect(npv(0.05, [-100, -50, -30])).toBeLessThan(0);
    });

    it('single large t=0 positive flow is positive NPV', () => {
      expect(npv(0.15, [1000000])).toBeGreaterThan(0);
    });
  });

  describe('monotone invariants', () => {
    it('higher discount rate → lower NPV for standard investment', () => {
      const cfs = [-1000, 400, 400, 400, 400];
      expect(npv(0.05, cfs)).toBeGreaterThan(npv(0.10, cfs));
      expect(npv(0.10, cfs)).toBeGreaterThan(npv(0.20, cfs));
    });
  });

  describe('error cases', () => {
    it('throws for empty cash flows', () => {
      expect(() => npv(0.1, [])).toThrow();
    });
    it('throws for rate ≤ -1', () => {
      expect(() => npv(-1, [100, 110])).toThrow();
    });
    it('throws for rate = -1', () => {
      expect(() => npv(-1, [100, 110])).toThrow();
    });
  });
});

// ─── irr ─────────────────────────────────────────────────────────────────────

describe('irr', () => {
  describe('exact values', () => {
    it('[-100, 110] → IRR = 0.10 (10%)', () => {
      expect(irr([-100, 110])).toBeCloseTo(0.10, 6);
    });

    it('[-100, 50, 50, 50] → IRR ≈ 23.38%', () => {
      // Newton's method converges to ~0.2338
      const result = irr([-100, 50, 50, 50]);
      expect(result).toBeCloseTo(0.2338, 3);
    });

    it('[-1000, 300, 400, 500] → positive IRR', () => {
      const result = irr([-1000, 300, 400, 500]);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('convergence invariants', () => {
    it('npv at the computed IRR is ≈ 0', () => {
      const cfs = [-200, 80, 90, 100];
      const rate = irr(cfs);
      expect(npv(rate, cfs)).toBeCloseTo(0, 4);
    });

    it('custom guess produces same result', () => {
      const cfs = [-100, 110];
      expect(irr(cfs, 0.2)).toBeCloseTo(irr(cfs), 6);
    });
  });

  describe('error cases', () => {
    it('throws for fewer than 2 cash flows', () => {
      expect(() => irr([-100])).toThrow();
    });
    it('throws for empty array', () => {
      expect(() => irr([])).toThrow();
    });
  });
});

// ─── straightLine ────────────────────────────────────────────────────────────

describe('straightLine', () => {
  const CASES = [
    { cost: 10000, salvage: 0,    life: 5,  expected: 2000 },
    { cost: 10000, salvage: 2000, life: 4,  expected: 2000 },
    { cost: 5000,  salvage: 0,    life: 1,  expected: 5000 },
    { cost: 12000, salvage: 2000, life: 5,  expected: 2000 },
    { cost: 100000,salvage: 10000,life: 10, expected: 9000 },
    { cost: 1000,  salvage: 1000, life: 5,  expected: 0 },
    { cost: 50000, salvage: 5000, life: 9,  expected: 5000 },
  ];

  for (const { cost, salvage, life, expected } of CASES) {
    describe(`cost=${cost} salvage=${salvage} life=${life}`, () => {
      it(`annual depreciation = ${expected}`, () => {
        expect(straightLine(cost, salvage, life)).toBeCloseTo(expected, 6);
      });
      it('total over life = cost − salvage', () => {
        expect(straightLine(cost, salvage, life) * life).toBeCloseTo(cost - salvage, 6);
      });
    });
  }

  describe('error cases', () => {
    it('throws for life ≤ 0', () => {
      expect(() => straightLine(10000, 0, 0)).toThrow();
    });
    it('throws for negative life', () => {
      expect(() => straightLine(10000, 0, -1)).toThrow();
    });
    it('throws for negative cost', () => {
      expect(() => straightLine(-1000, 0, 5)).toThrow();
    });
    it('throws for negative salvage', () => {
      expect(() => straightLine(10000, -500, 5)).toThrow();
    });
    it('throws when salvage > cost', () => {
      expect(() => straightLine(5000, 6000, 5)).toThrow();
    });
  });
});

// ─── reducingBalance ─────────────────────────────────────────────────────────

describe('reducingBalance', () => {
  describe('year-1 is the largest annual depreciation', () => {
    it('year 1 > year 3 > year 5 for cost=10000 salvage=1000 life=5', () => {
      const y1 = reducingBalance(10000, 1000, 5, 1);
      const y3 = reducingBalance(10000, 1000, 5, 3);
      const y5 = reducingBalance(10000, 1000, 5, 5);
      expect(y1).toBeGreaterThan(y3);
      expect(y3).toBeGreaterThan(y5);
    });
  });

  describe('total depreciation over life ≈ cost − salvage', () => {
    it('cost=10000 salvage=1000 life=5: sum ≈ 9000', () => {
      let total = 0;
      for (let y = 1; y <= 5; y++) {
        total += reducingBalance(10000, 1000, 5, y);
      }
      expect(total).toBeCloseTo(9000, 4);
    });

    it('cost=50000 salvage=5000 life=8: sum ≈ 45000', () => {
      let total = 0;
      for (let y = 1; y <= 8; y++) {
        total += reducingBalance(50000, 5000, 8, y);
      }
      expect(total).toBeCloseTo(45000, 3);
    });
  });

  describe('exact year-1 value', () => {
    it('cost=10000 salvage=1000 life=5 year=1', () => {
      // rate = 1 - (1000/10000)^(1/5) = 1 - 0.1^0.2
      const rate = 1 - Math.pow(0.1, 0.2);
      expect(reducingBalance(10000, 1000, 5, 1)).toBeCloseTo(10000 * rate, 6);
    });
  });

  describe('all-year results are positive', () => {
    it('all 5 years return positive values', () => {
      for (let y = 1; y <= 5; y++) {
        expect(reducingBalance(10000, 1000, 5, y)).toBeGreaterThan(0);
      }
    });
  });

  describe('error cases', () => {
    it('throws for year < 1', () => {
      expect(() => reducingBalance(10000, 0, 5, 0)).toThrow();
    });
    it('throws for year > life', () => {
      expect(() => reducingBalance(10000, 0, 5, 6)).toThrow();
    });
    it('throws for life ≤ 0', () => {
      expect(() => reducingBalance(10000, 0, 0, 1)).toThrow();
    });
    it('throws when salvage > cost', () => {
      expect(() => reducingBalance(5000, 6000, 5, 1)).toThrow();
    });
  });
});

// ─── sumOfDigits ─────────────────────────────────────────────────────────────

describe('sumOfDigits', () => {
  describe('exact values', () => {
    it('cost=10000 salvage=0 life=5 year=1 → 3333.33', () => {
      // SYD: (cost-salvage) * (life-year+1) / sum(1..life)
      // sum(1..5)=15; (5-1+1)/15 * 10000 = 5/15 * 10000 = 3333.33
      expect(sumOfDigits(10000, 0, 5, 1)).toBeCloseTo(10000 * 5 / 15, 4);
    });

    it('cost=10000 salvage=0 life=5 year=5 → 666.67', () => {
      expect(sumOfDigits(10000, 0, 5, 5)).toBeCloseTo(10000 * 1 / 15, 4);
    });

    it('cost=10000 salvage=0 life=5 year=3 → 2000', () => {
      // (5-3+1)/15 * 10000 = 3/15 * 10000 = 2000
      expect(sumOfDigits(10000, 0, 5, 3)).toBeCloseTo(2000, 4);
    });
  });

  describe('front-loading invariant', () => {
    it('year 1 > year 2 > year 5 (depreciates faster early)', () => {
      const y1 = sumOfDigits(10000, 0, 5, 1);
      const y2 = sumOfDigits(10000, 0, 5, 2);
      const y5 = sumOfDigits(10000, 0, 5, 5);
      expect(y1).toBeGreaterThan(y2);
      expect(y2).toBeGreaterThan(y5);
    });
  });

  describe('total over life = cost − salvage', () => {
    it('cost=10000 salvage=0 life=5: sum = 10000', () => {
      let total = 0;
      for (let y = 1; y <= 5; y++) {
        total += sumOfDigits(10000, 0, 5, y);
      }
      expect(total).toBeCloseTo(10000, 6);
    });

    it('cost=20000 salvage=4000 life=4: sum = 16000', () => {
      let total = 0;
      for (let y = 1; y <= 4; y++) {
        total += sumOfDigits(20000, 4000, 4, y);
      }
      expect(total).toBeCloseTo(16000, 6);
    });
  });

  describe('error cases', () => {
    it('throws for life ≤ 0', () => {
      expect(() => sumOfDigits(10000, 0, 0, 1)).toThrow();
    });
    it('throws for year < 1', () => {
      expect(() => sumOfDigits(10000, 0, 5, 0)).toThrow();
    });
    it('throws for year > life', () => {
      expect(() => sumOfDigits(10000, 0, 5, 6)).toThrow();
    });
    it('throws when salvage > cost', () => {
      expect(() => sumOfDigits(5000, 6000, 5, 1)).toThrow();
    });
  });
});

// ─── unitsOfProduction ───────────────────────────────────────────────────────

describe('unitsOfProduction', () => {
  const CASES = [
    { cost: 10000, salvage: 0,    total: 100000, units: 10000, expected: 1000 },
    { cost: 10000, salvage: 2000, total: 100000, units: 25000, expected: 2000 },
    { cost: 50000, salvage: 5000, total: 500000, units: 50000, expected: 4500 },
    { cost: 1000,  salvage: 0,    total: 10000,  units: 0,     expected: 0 },
    { cost: 1000,  salvage: 0,    total: 10000,  units: 10000, expected: 1000 },
  ];

  for (const { cost, salvage, total, units, expected } of CASES) {
    describe(`cost=${cost} salvage=${salvage} total=${total} units=${units}`, () => {
      it(`depreciation = ${expected}`, () => {
        expect(unitsOfProduction(cost, salvage, total, units)).toBeCloseTo(expected, 6);
      });
    });
  }

  describe('proportionality', () => {
    it('doubling units doubles depreciation', () => {
      const base = unitsOfProduction(10000, 0, 100000, 5000);
      expect(unitsOfProduction(10000, 0, 100000, 10000)).toBeCloseTo(base * 2, 6);
    });
  });

  describe('error cases', () => {
    it('throws for totalUnits ≤ 0', () => {
      expect(() => unitsOfProduction(10000, 0, 0, 1000)).toThrow();
    });
    it('throws for negative unitsThisPeriod', () => {
      expect(() => unitsOfProduction(10000, 0, 100000, -500)).toThrow();
    });
    it('throws when salvage > cost', () => {
      expect(() => unitsOfProduction(5000, 6000, 100000, 1000)).toThrow();
    });
  });
});

// ─── convertCurrency ─────────────────────────────────────────────────────────

describe('convertCurrency', () => {
  describe('exact values', () => {
    it('same rate: amount unchanged', () => {
      expect(convertCurrency(100, 1, 1)).toBeCloseTo(100, 8);
    });

    it('USD→GBP: 100 at fromRate=1, toRate=0.79 → 79', () => {
      expect(convertCurrency(100, 1, 0.79)).toBeCloseTo(79, 8);
    });

    it('GBP→USD: 79 at fromRate=0.79, toRate=1 → 100', () => {
      expect(convertCurrency(79, 0.79, 1)).toBeCloseTo(100, 6);
    });

    it('USD→EUR: 100 at fromRate=1, toRate=0.92 → 92', () => {
      expect(convertCurrency(100, 1, 0.92)).toBeCloseTo(92, 8);
    });

    it('doubling toRate doubles result', () => {
      const base = convertCurrency(100, 1.2, 0.8);
      expect(convertCurrency(100, 1.2, 1.6)).toBeCloseTo(base * 2, 6);
    });

    it('round-trip conversion recovers original', () => {
      const converted = convertCurrency(100, 1, 0.85);
      const back = convertCurrency(converted, 0.85, 1);
      expect(back).toBeCloseTo(100, 6);
    });

    it('fromRate = toRate: amount returned unchanged', () => {
      expect(convertCurrency(500, 1.3, 1.3)).toBeCloseTo(500, 8);
    });
  });

  describe('error cases', () => {
    it('throws for fromRate = 0', () => {
      expect(() => convertCurrency(100, 0, 1)).toThrow();
    });
    it('throws for toRate = 0', () => {
      expect(() => convertCurrency(100, 1, 0)).toThrow();
    });
    it('throws for negative fromRate', () => {
      expect(() => convertCurrency(100, -1, 1)).toThrow();
    });
    it('throws for negative toRate', () => {
      expect(() => convertCurrency(100, 1, -1)).toThrow();
    });
  });
});

// ─── calculateFxGainLoss ─────────────────────────────────────────────────────

describe('calculateFxGainLoss', () => {
  describe('exact values', () => {
    it('currency appreciated → gain (positive)', () => {
      // original 1.2 USD/GBP → current 1.3 USD/GBP: 1000 GBP × (1.3−1.2) = 100
      expect(calculateFxGainLoss(1000, 1.2, 1.3)).toBeCloseTo(100, 6);
    });

    it('currency depreciated → loss (negative)', () => {
      expect(calculateFxGainLoss(1000, 1.3, 1.2)).toBeCloseTo(-100, 6);
    });

    it('same rate → 0 gain/loss', () => {
      expect(calculateFxGainLoss(1000, 1.2, 1.2)).toBeCloseTo(0, 8);
    });

    it('formula: amount × (currentRate − originalRate)', () => {
      const amount = 5000;
      const orig = 0.85;
      const curr = 0.91;
      expect(calculateFxGainLoss(amount, orig, curr)).toBeCloseTo(amount * (curr - orig), 8);
    });

    it('negative originalAmount: appreciated rate still produces result', () => {
      // liability: negative amount with rate rise = loss
      const result = calculateFxGainLoss(-1000, 1.0, 1.1);
      expect(result).toBeCloseTo(-100, 6);
    });
  });

  describe('error cases', () => {
    it('throws for originalRate ≤ 0', () => {
      expect(() => calculateFxGainLoss(1000, 0, 1.2)).toThrow();
    });
    it('throws for currentRate ≤ 0', () => {
      expect(() => calculateFxGainLoss(1000, 1.2, 0)).toThrow();
    });
    it('throws for negative originalRate', () => {
      expect(() => calculateFxGainLoss(1000, -1, 1)).toThrow();
    });
  });
});

// ─── roundToDecimal ──────────────────────────────────────────────────────────

describe('roundToDecimal', () => {
  describe('standard rounding', () => {
    it('1.234 to 2dp → 1.23', () => {
      expect(roundToDecimal(1.234, 2)).toBe(1.23);
    });
    it('1.236 to 2dp → 1.24', () => {
      expect(roundToDecimal(1.236, 2)).toBeCloseTo(1.24, 8);
    });
    it('1.235 to 2dp → 1.24 (rounds up to even 4)', () => {
      // 1.235 * 100 = 123.5; truncated=123 (odd) → rounds up to 124 → 1.24
      expect(roundToDecimal(1.235, 2)).toBeCloseTo(1.24, 8);
    });
    it('0 places → integer rounding', () => {
      expect(roundToDecimal(4.6, 0)).toBe(5);
      expect(roundToDecimal(4.4, 0)).toBe(4);
    });
    it('0 → 0 regardless of places', () => {
      expect(roundToDecimal(0, 2)).toBe(0);
      expect(roundToDecimal(0, 5)).toBe(0);
    });
    it('large decimal places preserved', () => {
      expect(roundToDecimal(1.234567, 4)).toBeCloseTo(1.2346, 4);
    });
  });

  describe("banker's rounding (round-half-to-even)", () => {
    it('0.5 → 0 (0 is even)', () => {
      expect(roundToDecimal(0.5, 0)).toBe(0);
    });
    it('1.5 → 2 (2 is even)', () => {
      expect(roundToDecimal(1.5, 0)).toBe(2);
    });
    it('2.5 → 2 (2 is even)', () => {
      expect(roundToDecimal(2.5, 0)).toBe(2);
    });
    it('3.5 → 4 (4 is even)', () => {
      expect(roundToDecimal(3.5, 0)).toBe(4);
    });
  });

  describe('error cases', () => {
    it('throws for negative places', () => {
      expect(() => roundToDecimal(1.23, -1)).toThrow();
    });
  });
});

// ─── cross-function invariants ───────────────────────────────────────────────

describe('cross-function invariants', () => {
  it('straightLine gives lower year-1 depr than sumOfDigits for same asset', () => {
    const sl = straightLine(10000, 0, 5);
    const syd = sumOfDigits(10000, 0, 5, 1);
    expect(sl).toBeLessThan(syd);
  });

  it('straightLine gives higher year-5 depr than sumOfDigits (SYD is front-loaded)', () => {
    const sl = straightLine(10000, 0, 5);
    const syd = sumOfDigits(10000, 0, 5, 5);
    expect(sl).toBeGreaterThan(syd);
  });

  it('all 3 methods total cost-salvage over life', () => {
    const cost = 20000, salvage = 2000, life = 4;
    const dep = cost - salvage;

    const slTotal = straightLine(cost, salvage, life) * life;
    let sydTotal = 0, rbTotal = 0;
    for (let y = 1; y <= life; y++) {
      sydTotal += sumOfDigits(cost, salvage, life, y);
      rbTotal  += reducingBalance(cost, salvage, life, y);
    }

    expect(slTotal).toBeCloseTo(dep, 4);
    expect(sydTotal).toBeCloseTo(dep, 4);
    expect(rbTotal).toBeCloseTo(dep, 3);
  });

  it('IRR of break-even investment equals the discount rate', () => {
    // npv(r, [-100, 110]) = 0 → irr = 0.10
    const rate = irr([-100, 110]);
    expect(rate).toBeCloseTo(0.10, 6);
  });

  it('positive NPV at lower rate and negative at higher rate straddle the IRR', () => {
    const cfs = [-1000, 400, 400, 400];
    const irrRate = irr(cfs);
    expect(npv(irrRate * 0.5, cfs)).toBeGreaterThan(0);
    expect(npv(irrRate * 2, cfs)).toBeLessThan(0);
  });

  it('simpleInterest 0 periods = compoundInterest result − principal', () => {
    expect(simpleInterest(1000, 0.05, 0)).toBe(0);
    expect(compoundInterest(1000, 0.05, 0, 12) - 1000).toBeCloseTo(0, 8);
  });

  it('convertCurrency round-trip exact', () => {
    const orig = 999.99;
    const converted = convertCurrency(orig, 1, 3.67);
    const back = convertCurrency(converted, 3.67, 1);
    expect(back).toBeCloseTo(orig, 6);
  });
});
