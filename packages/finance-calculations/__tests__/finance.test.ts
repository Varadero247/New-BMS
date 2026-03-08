import { straightLine, reducingBalance, sumOfDigits, unitsOfProduction } from '../src/depreciation';
import { simpleInterest, compoundInterest, npv, irr } from '../src/interest';
import { convertCurrency, calculateFxGainLoss, roundToDecimal } from '../src/currency';

// ── straightLine ──────────────────────────────────────────────────────────────

describe('straightLine depreciation', () => {
  it('basic calculation: (cost - salvage) / life', () => {
    expect(straightLine(10000, 1000, 5)).toBe(1800);
  });

  it('zero salvage', () => {
    expect(straightLine(12000, 0, 4)).toBe(3000);
  });

  it('1-year life', () => {
    expect(straightLine(5000, 500, 1)).toBe(4500);
  });

  it('salvage equals cost', () => {
    expect(straightLine(1000, 1000, 10)).toBe(0);
  });

  it('throws when life is 0', () => {
    expect(() => straightLine(1000, 0, 0)).toThrow();
  });

  it('throws when life is negative', () => {
    expect(() => straightLine(1000, 0, -1)).toThrow();
  });

  it('throws when cost is negative', () => {
    expect(() => straightLine(-1, 0, 5)).toThrow();
  });

  it('throws when salvage is negative', () => {
    expect(() => straightLine(1000, -1, 5)).toThrow();
  });

  it('throws when salvage exceeds cost', () => {
    expect(() => straightLine(1000, 1500, 5)).toThrow();
  });

  it('same amount every year', () => {
    const annual = straightLine(10000, 2000, 8);
    expect(annual).toBe(1000);
  });
});

// ── reducingBalance ───────────────────────────────────────────────────────────

describe('reducingBalance depreciation', () => {
  it('depreciation for year 1 is larger than year 2', () => {
    const y1 = reducingBalance(10000, 1000, 5, 1);
    const y2 = reducingBalance(10000, 1000, 5, 2);
    expect(y1).toBeGreaterThan(y2);
  });

  it('throws when life is 0', () => {
    expect(() => reducingBalance(10000, 1000, 0, 1)).toThrow();
  });

  it('throws when year is 0', () => {
    expect(() => reducingBalance(10000, 1000, 5, 0)).toThrow();
  });

  it('throws when year exceeds life', () => {
    expect(() => reducingBalance(10000, 1000, 5, 6)).toThrow();
  });

  it('throws when cost is negative', () => {
    expect(() => reducingBalance(-1, 0, 5, 1)).toThrow();
  });

  it('throws when salvage is negative', () => {
    expect(() => reducingBalance(10000, -1, 5, 1)).toThrow();
  });

  it('throws when salvage exceeds cost', () => {
    expect(() => reducingBalance(1000, 2000, 5, 1)).toThrow();
  });

  it('returns a positive number for valid inputs', () => {
    expect(reducingBalance(10000, 1000, 5, 3)).toBeGreaterThan(0);
  });

  it('final year is valid', () => {
    expect(reducingBalance(10000, 1000, 5, 5)).toBeGreaterThan(0);
  });
});

// ── sumOfDigits ───────────────────────────────────────────────────────────────

describe('sumOfDigits depreciation', () => {
  it('year 1 depreciation is larger than year life', () => {
    const y1 = sumOfDigits(10000, 0, 5, 1);
    const yN = sumOfDigits(10000, 0, 5, 5);
    expect(y1).toBeGreaterThan(yN);
  });

  it('sum of all years equals (cost - salvage)', () => {
    const cost = 10000, salvage = 1000, life = 5;
    let total = 0;
    for (let y = 1; y <= life; y++) total += sumOfDigits(cost, salvage, life, y);
    expect(total).toBeCloseTo(cost - salvage, 2);
  });

  it('year 1 for 5-year life: 5/15 of depreciable base', () => {
    expect(sumOfDigits(10000, 0, 5, 1)).toBeCloseTo((10000 * 5) / 15, 4);
  });

  it('throws when life is 0', () => {
    expect(() => sumOfDigits(10000, 0, 0, 1)).toThrow();
  });

  it('throws when year is 0', () => {
    expect(() => sumOfDigits(10000, 0, 5, 0)).toThrow();
  });

  it('throws when year exceeds life', () => {
    expect(() => sumOfDigits(10000, 0, 5, 6)).toThrow();
  });

  it('throws when salvage exceeds cost', () => {
    expect(() => sumOfDigits(1000, 2000, 5, 1)).toThrow();
  });
});

// ── unitsOfProduction ─────────────────────────────────────────────────────────

describe('unitsOfProduction depreciation', () => {
  it('proportional to units produced', () => {
    const d1 = unitsOfProduction(10000, 0, 100000, 5000);
    const d2 = unitsOfProduction(10000, 0, 100000, 10000);
    expect(d2).toBeCloseTo(d1 * 2, 4);
  });

  it('zero units produces zero depreciation', () => {
    expect(unitsOfProduction(10000, 1000, 100000, 0)).toBe(0);
  });

  it('exact formula: (cost-salvage)/totalUnits * unitsThisPeriod', () => {
    expect(unitsOfProduction(10000, 2000, 80000, 4000)).toBeCloseTo(400, 4);
  });

  it('throws when totalUnits is 0', () => {
    expect(() => unitsOfProduction(10000, 0, 0, 100)).toThrow();
  });

  it('throws when unitsThisPeriod is negative', () => {
    expect(() => unitsOfProduction(10000, 0, 100000, -1)).toThrow();
  });

  it('throws when cost is negative', () => {
    expect(() => unitsOfProduction(-1, 0, 100000, 100)).toThrow();
  });

  it('throws when salvage exceeds cost', () => {
    expect(() => unitsOfProduction(1000, 2000, 100000, 100)).toThrow();
  });
});

// ── simpleInterest ────────────────────────────────────────────────────────────

describe('simpleInterest', () => {
  it('P * r * t', () => {
    expect(simpleInterest(1000, 0.05, 3)).toBe(150);
  });

  it('zero principal gives zero', () => {
    expect(simpleInterest(0, 0.1, 5)).toBe(0);
  });

  it('zero rate gives zero', () => {
    expect(simpleInterest(1000, 0, 5)).toBe(0);
  });

  it('zero periods gives zero', () => {
    expect(simpleInterest(1000, 0.1, 0)).toBe(0);
  });

  it('1 period', () => {
    expect(simpleInterest(5000, 0.04, 1)).toBe(200);
  });

  it('throws when principal is negative', () => {
    expect(() => simpleInterest(-1, 0.05, 1)).toThrow();
  });

  it('throws when rate is negative', () => {
    expect(() => simpleInterest(1000, -0.01, 1)).toThrow();
  });

  it('throws when periods is negative', () => {
    expect(() => simpleInterest(1000, 0.05, -1)).toThrow();
  });
});

// ── compoundInterest ──────────────────────────────────────────────────────────

describe('compoundInterest', () => {
  it('total amount after 1 year monthly compounding', () => {
    const result = compoundInterest(1000, 0.12, 1, 12);
    expect(result).toBeCloseTo(1126.83, 1);
  });

  it('annual compounding: (1+r)^n * P', () => {
    expect(compoundInterest(1000, 0.1, 2, 1)).toBeCloseTo(1210, 4);
  });

  it('zero periods returns principal', () => {
    expect(compoundInterest(1000, 0.1, 0, 1)).toBe(1000);
  });

  it('zero rate returns principal', () => {
    expect(compoundInterest(1000, 0, 5, 12)).toBe(1000);
  });

  it('more compounds = higher amount', () => {
    const annual = compoundInterest(1000, 0.1, 1, 1);
    const monthly = compoundInterest(1000, 0.1, 1, 12);
    expect(monthly).toBeGreaterThan(annual);
  });

  it('throws when principal is negative', () => {
    expect(() => compoundInterest(-1, 0.1, 1, 12)).toThrow();
  });

  it('throws when rate is negative', () => {
    expect(() => compoundInterest(1000, -0.01, 1, 12)).toThrow();
  });

  it('throws when periods is negative', () => {
    expect(() => compoundInterest(1000, 0.1, -1, 12)).toThrow();
  });

  it('throws when compoundsPerPeriod is 0', () => {
    expect(() => compoundInterest(1000, 0.1, 1, 0)).toThrow();
  });
});

// ── npv ───────────────────────────────────────────────────────────────────────

describe('npv', () => {
  it('basic NPV: single period', () => {
    // -100 + 110/1.1 = 0
    expect(npv(0.1, [-100, 110])).toBeCloseTo(0, 4);
  });

  it('positive NPV for profitable investment', () => {
    const result = npv(0.1, [-1000, 400, 400, 400, 400]);
    expect(result).toBeGreaterThan(0);
  });

  it('negative NPV for losing investment', () => {
    const result = npv(0.5, [-1000, 100, 100, 100]);
    expect(result).toBeLessThan(0);
  });

  it('index 0 is not discounted', () => {
    // cf[0] / (1+r)^0 = cf[0]
    expect(npv(0.1, [-500])).toBeCloseTo(-500, 4);
  });

  it('rate 0 = sum of cash flows', () => {
    expect(npv(0, [-100, 50, 50, 50])).toBeCloseTo(50, 4);
  });

  it('throws for empty cash flows', () => {
    expect(() => npv(0.1, [])).toThrow();
  });

  it('throws when rate is -1 or less', () => {
    expect(() => npv(-1, [-100, 200])).toThrow();
  });
});

// ── irr ───────────────────────────────────────────────────────────────────────

describe('irr', () => {
  it('converges for simple 1-period investment', () => {
    // -100 at t=0, +110 at t=1 → irr=10%
    const result = irr([-100, 110]);
    expect(result).toBeCloseTo(0.1, 4);
  });

  it('positive IRR for profitable project', () => {
    const result = irr([-1000, 400, 400, 400, 400]);
    expect(result).toBeGreaterThan(0);
  });

  it('NPV at IRR is approximately 0', () => {
    const cashFlows = [-1000, 300, 400, 500];
    const rate = irr(cashFlows);
    const checkNpv = npv(rate, cashFlows);
    expect(checkNpv).toBeCloseTo(0, 3);
  });

  it('throws for single cash flow', () => {
    expect(() => irr([-100])).toThrow();
  });
});

// ── convertCurrency ───────────────────────────────────────────────────────────

describe('convertCurrency', () => {
  it('same rates → same amount', () => {
    expect(convertCurrency(100, 1, 1)).toBe(100);
  });

  it('USD to EUR when fromRate=1, toRate=0.9', () => {
    expect(convertCurrency(100, 1, 0.9)).toBeCloseTo(90, 4);
  });

  it('EUR to GBP cross-rate calculation', () => {
    // 100 EUR → USD at 1.1, then to GBP at 0.79
    expect(convertCurrency(100, 1.1, 0.79)).toBeCloseTo(71.818, 2);
  });

  it('zero amount gives zero', () => {
    expect(convertCurrency(0, 1.5, 1.2)).toBe(0);
  });

  it('throws when fromRate is 0', () => {
    expect(() => convertCurrency(100, 0, 1)).toThrow();
  });

  it('throws when fromRate is negative', () => {
    expect(() => convertCurrency(100, -1, 1)).toThrow();
  });

  it('throws when toRate is 0', () => {
    expect(() => convertCurrency(100, 1, 0)).toThrow();
  });

  it('throws when toRate is negative', () => {
    expect(() => convertCurrency(100, 1, -1)).toThrow();
  });
});

// ── calculateFxGainLoss ───────────────────────────────────────────────────────

describe('calculateFxGainLoss', () => {
  it('positive gain when current rate is higher', () => {
    // 100 USD at rate 1.2, now 1.3 → gain
    expect(calculateFxGainLoss(100, 1.2, 1.3)).toBeCloseTo(10, 4);
  });

  it('negative loss when current rate is lower', () => {
    expect(calculateFxGainLoss(100, 1.2, 1.1)).toBeCloseTo(-10, 4);
  });

  it('zero when rates are equal', () => {
    expect(calculateFxGainLoss(500, 1.5, 1.5)).toBe(0);
  });

  it('scales with original amount', () => {
    const small = calculateFxGainLoss(100, 1.0, 1.1);
    const large = calculateFxGainLoss(1000, 1.0, 1.1);
    expect(large).toBeCloseTo(small * 10, 4);
  });

  it('throws when originalRate is 0', () => {
    expect(() => calculateFxGainLoss(100, 0, 1)).toThrow();
  });

  it('throws when currentRate is 0', () => {
    expect(() => calculateFxGainLoss(100, 1, 0)).toThrow();
  });
});

// ── roundToDecimal ────────────────────────────────────────────────────────────

describe('roundToDecimal', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundToDecimal(3.14159, 2)).toBe(3.14);
  });

  it('rounds up', () => {
    expect(roundToDecimal(3.145, 2)).toBeCloseTo(3.14, 10); // banker's rounds to even
  });

  it('rounds 0 decimal places to integer', () => {
    expect(roundToDecimal(3.7, 0)).toBe(4);
  });

  it('banker rounding: 2.5 rounds to 2 (nearest even)', () => {
    expect(roundToDecimal(2.5, 0)).toBe(2);
  });

  it('banker rounding: 3.5 rounds to 4 (nearest even)', () => {
    expect(roundToDecimal(3.5, 0)).toBe(4);
  });

  it('no rounding when already at target precision', () => {
    expect(roundToDecimal(1.23, 2)).toBe(1.23);
  });

  it('throws when places is negative', () => {
    expect(() => roundToDecimal(1.5, -1)).toThrow();
  });

  it('handles zero', () => {
    expect(roundToDecimal(0, 4)).toBe(0);
  });
});
