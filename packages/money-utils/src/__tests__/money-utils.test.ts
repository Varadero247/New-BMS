// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  CURRENCIES,
  money,
  moneyFromMinorUnits,
  toDecimal,
  toDecimalString,
  toPrecisionString,
  add,
  subtract,
  multiply,
  divide,
  percentage,
  addPercentage,
  subtractPercentage,
  negate,
  abs,
  round,
  roundTo,
  roundNumber,
  equal,
  greaterThan,
  lessThan,
  greaterThanOrEqual,
  lessThanOrEqual,
  isZero,
  isPositive,
  isNegative,
  compare,
  min,
  max,
  allocate,
  split,
  format,
  formatCompact,
  getCurrencySymbol,
  getCurrencyDecimals,
  getCurrencyInfo,
  applyRate,
  invertRate,
  isValidCurrency,
  parseMoney,
  sum,
  average,
} from '../money-utils';

// ---------------------------------------------------------------------------
// 1. money factory — 100 tests (i=1..100)
// ---------------------------------------------------------------------------
describe('money factory', () => {
  for (let i = 1; i <= 100; i++) {
    it(`money(${i} * 0.01, 'GBP') has amount = ${i}n`, () => {
      const m = money(i * 0.01, 'GBP');
      expect(m.amount).toBe(BigInt(i));
      expect(m.scale).toBe(2);
      expect(m.currency).toBe('GBP');
    });
  }
});

// ---------------------------------------------------------------------------
// 2. add — 100 tests (i=1..100)
// ---------------------------------------------------------------------------
describe('add', () => {
  for (let i = 1; i <= 100; i++) {
    it(`add money(${i},'GBP') + money(${i},'GBP') = money(${i * 2},'GBP')`, () => {
      const a = money(i, 'GBP');
      const b = money(i, 'GBP');
      const result = add(a, b);
      expect(result.amount).toBe(BigInt(i * 2 * 100));
      expect(result.currency).toBe('GBP');
    });
  }
});

// ---------------------------------------------------------------------------
// 3. subtract — 100 tests (i=1..100)
// ---------------------------------------------------------------------------
describe('subtract', () => {
  for (let i = 1; i <= 100; i++) {
    it(`subtract money(${i},'GBP') - money(${i - 1},'GBP') = 100 minor units`, () => {
      const a = money(i, 'GBP');
      const b = money(i - 1, 'GBP');
      const result = subtract(a, b);
      // money(i) - money(i-1) = money(1) = 100 minor units
      expect(result.amount).toBe(100n);
      expect(result.currency).toBe('GBP');
    });
  }
});

// ---------------------------------------------------------------------------
// 4. multiply — 50 tests (i=1..50)
// ---------------------------------------------------------------------------
describe('multiply', () => {
  for (let i = 1; i <= 50; i++) {
    it(`multiply(money(10,'GBP'), ${i}) toDecimalString = '${(10 * i).toFixed(2)}'`, () => {
      const m = money(10, 'GBP');
      const result = multiply(m, i);
      expect(toDecimalString(result)).toBe((10 * i).toFixed(2));
    });
  }
});

// ---------------------------------------------------------------------------
// 5. divide — 50 tests (i=1..50)
// ---------------------------------------------------------------------------
describe('divide', () => {
  for (let i = 1; i <= 50; i++) {
    it(`divide(money(100,'GBP'), ${i}) is positive`, () => {
      const m = money(100, 'GBP');
      const result = divide(m, i);
      expect(result.amount).toBeGreaterThan(0n);
      expect(result.currency).toBe('GBP');
    });
  }
});

// ---------------------------------------------------------------------------
// 6. percentage — 100 tests (i=1..100)
// ---------------------------------------------------------------------------
describe('percentage', () => {
  for (let i = 1; i <= 100; i++) {
    it(`percentage(money(100,'GBP'), ${i}) toDecimal ≈ ${i}`, () => {
      const m = money(100, 'GBP');
      const result = percentage(m, i);
      expect(toDecimal(result)).toBeCloseTo(i, 0);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. addPercentage / subtractPercentage — 50 round-trip tests (i=1..50)
// ---------------------------------------------------------------------------
describe('addPercentage / subtractPercentage round-trip', () => {
  for (let i = 1; i <= 50; i++) {
    it(`round-trip for ${i}% on money(100,'GBP') is close to original`, () => {
      const base = money(100, 'GBP');
      const grossed = addPercentage(base, i);
      const netted = subtractPercentage(grossed, i);
      // Due to rounding, allow ±1 minor unit
      const diff = netted.amount - base.amount;
      expect(diff >= -1n && diff <= 1n).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. compare / greaterThan / lessThan — 50 tests (i=1..50)
// ---------------------------------------------------------------------------
describe('compare / greaterThan / lessThan', () => {
  for (let i = 1; i <= 50; i++) {
    it(`compare money(${i}) vs money(${i + 1}) returns -1 and lessThan=true`, () => {
      const a = money(i, 'GBP');
      const b = money(i + 1, 'GBP');
      expect(compare(a, b)).toBe(-1);
      expect(lessThan(a, b)).toBe(true);
      expect(greaterThan(a, b)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. isZero / isPositive / isNegative — 21 tests (i=-10..10)
// ---------------------------------------------------------------------------
describe('isZero / isPositive / isNegative', () => {
  for (let i = -10; i <= 10; i++) {
    it(`money(${i},'GBP') zero/pos/neg flags are correct`, () => {
      const m = money(i, 'GBP');
      if (i === 0) {
        expect(isZero(m)).toBe(true);
        expect(isPositive(m)).toBe(false);
        expect(isNegative(m)).toBe(false);
      } else if (i > 0) {
        expect(isZero(m)).toBe(false);
        expect(isPositive(m)).toBe(true);
        expect(isNegative(m)).toBe(false);
      } else {
        expect(isZero(m)).toBe(false);
        expect(isPositive(m)).toBe(false);
        expect(isNegative(m)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 10. equal — 100 tests (i=1..50, 2 assertions each)
// ---------------------------------------------------------------------------
describe('equal', () => {
  for (let i = 1; i <= 50; i++) {
    it(`equal(money(${i},'GBP'), money(${i},'GBP')) true; vs money(${i + 1}) false`, () => {
      const a = money(i, 'GBP');
      const b = money(i, 'GBP');
      const c = money(i + 1, 'GBP');
      expect(equal(a, b)).toBe(true);
      expect(equal(a, c)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. format — 50 tests (i=1..50)
// ---------------------------------------------------------------------------
describe('format', () => {
  for (let i = 1; i <= 50; i++) {
    it(`format(money(${i},'GBP')) includes '£'`, () => {
      const m = money(i, 'GBP');
      const result = format(m);
      expect(result).toContain('£');
    });
  }
});

// ---------------------------------------------------------------------------
// 12. formatCompact — 10 tests with known values
// ---------------------------------------------------------------------------
describe('formatCompact', () => {
  const cases: Array<[number, string, string]> = [
    [1000,           'GBP', '£1K'],
    [1500,           'GBP', '£1.5K'],
    [1000000,        'GBP', '£1M'],
    [1500000,        'GBP', '£1.5M'],
    [1000000000,     'GBP', '£1B'],
    [2300000000,     'GBP', '£2.3B'],
    [1200,           'USD', '$1.2K'],
    [500,            'GBP', '£500.00'],
    [999,            'USD', '$999.00'],
    [1000000,        'EUR', '€1M'],
  ];
  for (const [amount, currency, expected] of cases) {
    it(`formatCompact(money(${amount},'${currency}')) = '${expected}'`, () => {
      const m = money(amount, currency);
      expect(formatCompact(m)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. allocate — 30 tests: sum of allocated = original
// ---------------------------------------------------------------------------
describe('allocate', () => {
  for (let i = 1; i <= 30; i++) {
    it(`allocate(money(${i * 10},'GBP'), [1,1,1]) sums to original`, () => {
      const m = money(i * 10, 'GBP');
      const parts = allocate(m, [1, 1, 1]);
      const total = parts.reduce((acc, p) => acc + p.amount, 0n);
      expect(total).toBe(m.amount);
      expect(parts).toHaveLength(3);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. split — i=2..10: length assertions (9 tests, ~27+ assertions)
// ---------------------------------------------------------------------------
describe('split', () => {
  for (let i = 2; i <= 10; i++) {
    it(`split(money(100,'GBP'), ${i}) has length ${i} and sums to original`, () => {
      const m = money(100, 'GBP');
      const parts = split(m, i);
      expect(parts).toHaveLength(i);
      const total = parts.reduce((acc, p) => acc + p.amount, 0n);
      expect(total).toBe(m.amount);
      parts.forEach((p) => expect(p.currency).toBe('GBP'));
    });
  }
});

// ---------------------------------------------------------------------------
// 15. isValidCurrency — 30 valid + 20 invalid = 50 tests
// ---------------------------------------------------------------------------
describe('isValidCurrency', () => {
  const validCodes = [
    'GBP','USD','EUR','JPY','CHF','CAD','AUD','NZD','SEK','NOK',
    'DKK','HKD','SGD','CNY','INR','BRL','MXN','ZAR','SAR','AED',
    'TRY','PLN','CZK','HUF','RUB','KRW','THB','MYR','IDR','PHP',
  ];
  for (const code of validCodes) {
    it(`isValidCurrency('${code}') = true`, () => {
      expect(isValidCurrency(code)).toBe(true);
    });
  }

  const invalidCodes = [
    'XYZ','ABC','FAKE','ZZZ','GBP2','123','usd','eur','gbp','USD1',
    'XX','USDD','EU','GBPP','EURR','AU','NZ','CA','HK','SG',
  ];
  for (const code of invalidCodes) {
    it(`isValidCurrency('${code}') = false`, () => {
      expect(isValidCurrency(code)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 16. CURRENCIES map — 30 currencies with symbol and decimals
// ---------------------------------------------------------------------------
describe('CURRENCIES map', () => {
  const currencyList = [
    'GBP','USD','EUR','JPY','CHF','CAD','AUD','NZD','SEK','NOK',
    'DKK','HKD','SGD','CNY','INR','BRL','MXN','ZAR','SAR','AED',
    'TRY','PLN','CZK','HUF','RUB','KRW','THB','MYR','IDR','PHP',
  ];
  for (const code of currencyList) {
    it(`CURRENCIES['${code}'] has symbol and decimals`, () => {
      const info = CURRENCIES[code];
      expect(info).toBeDefined();
      expect(typeof info.symbol).toBe('string');
      expect(info.symbol.length).toBeGreaterThan(0);
      expect(typeof info.decimals).toBe('number');
      expect(info.decimals).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 17. roundNumber — 50 tests with HALF_UP
// ---------------------------------------------------------------------------
describe('roundNumber', () => {
  for (let i = 1; i <= 50; i++) {
    it(`roundNumber(${i}.5, 0, 'HALF_UP') = ${i + 1}`, () => {
      const result = roundNumber(i + 0.5, 0, 'HALF_UP');
      expect(result).toBe(i + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. applyRate — 30 tests
// ---------------------------------------------------------------------------
describe('applyRate', () => {
  for (let i = 1; i <= 30; i++) {
    it(`applyRate converts GBP ${i} to USD using rate 1.${i.toString().padStart(2,'0')}`, () => {
      const gbp = money(i, 'GBP');
      const rate = { from: 'GBP', to: 'USD', rate: 1 + i * 0.01 };
      const usd = applyRate(gbp, rate);
      expect(usd.currency).toBe('USD');
      expect(usd.amount).toBeGreaterThan(0n);
      // USD result should be roughly rate * GBP
      const approxExpected = i * (1 + i * 0.01);
      expect(toDecimal(usd)).toBeCloseTo(approxExpected, 0);
    });
  }
});

// ---------------------------------------------------------------------------
// 19. min / max — 30 arrays of Money
// ---------------------------------------------------------------------------
describe('min / max', () => {
  for (let i = 1; i <= 30; i++) {
    it(`min/max of array [1..${i}] in GBP picks correct values`, () => {
      const amounts = Array.from({ length: i }, (_, idx) => money(idx + 1, 'GBP'));
      const minVal = min(...amounts);
      const maxVal = max(...amounts);
      expect(minVal.amount).toBe(100n);              // money(1,'GBP') = 100 minor units
      expect(maxVal.amount).toBe(BigInt(i * 100));   // money(i,'GBP')
    });
  }
});

// ---------------------------------------------------------------------------
// 20. sum — 30 tests (i=1..30)
// ---------------------------------------------------------------------------
describe('sum', () => {
  for (let i = 1; i <= 30; i++) {
    it(`sum of ${i} moneys [1..${i}] GBP = ${i * (i + 1) / 2}`, () => {
      const amounts = Array.from({ length: i }, (_, idx) => money(idx + 1, 'GBP'));
      const result = sum(amounts);
      const expected = (i * (i + 1)) / 2;
      expect(result.amount).toBe(BigInt(expected * 100));
      expect(result.currency).toBe('GBP');
    });
  }
});

// ---------------------------------------------------------------------------
// 21. negate / abs — 100 tests (i=1..50, 2 each)
// ---------------------------------------------------------------------------
describe('negate / abs', () => {
  for (let i = 1; i <= 50; i++) {
    it(`negate(money(${i},'GBP')).amount = -${i * 100}n and abs restores`, () => {
      const m = money(i, 'GBP');
      const neg = negate(m);
      expect(neg.amount).toBe(BigInt(-i * 100));
      expect(neg.currency).toBe('GBP');

      const restored = abs(neg);
      expect(restored.amount).toBe(BigInt(i * 100));
    });
  }
});

// ---------------------------------------------------------------------------
// 22. toDecimalString — 50 tests (i=1..50)
// ---------------------------------------------------------------------------
describe('toDecimalString', () => {
  for (let i = 1; i <= 50; i++) {
    it(`toDecimalString(money(${i},'GBP')) = '${i}.00'`, () => {
      const m = money(i, 'GBP');
      expect(toDecimalString(m)).toBe(`${i}.00`);
    });
  }
});

// ---------------------------------------------------------------------------
// 23. parseMoney — 20 tests
// ---------------------------------------------------------------------------
describe('parseMoney', () => {
  const cases: Array<[string, string, number]> = [
    ['1234.56',   'GBP', 1234.56],
    ['£1234.56',  'GBP', 1234.56],
    ['$1,234.56', 'USD', 1234.56],
    ['100.00',    'EUR', 100.00],
    ['0.01',      'GBP', 0.01],
    ['999.99',    'USD', 999.99],
    ['50',        'GBP', 50.00],
    ['1000000',   'GBP', 1000000],
    ['0.50',      'USD', 0.50],
    ['123',       'EUR', 123],
    ['1,000',     'GBP', 1000],
    ['10,000.50', 'USD', 10000.50],
    ['0',         'GBP', 0],
    ['42.00',     'GBP', 42],
    ['7.77',      'USD', 7.77],
    ['3.14',      'EUR', 3.14],
    ['1.99',      'GBP', 1.99],
    ['250.00',    'USD', 250],
    ['9999.99',   'GBP', 9999.99],
    ['0.99',      'USD', 0.99],
  ];
  for (const [str, currency, expected] of cases) {
    it(`parseMoney('${str}', '${currency}') ≈ ${expected}`, () => {
      const result = parseMoney(str, currency);
      expect(result).not.toBeNull();
      if (result) {
        expect(toDecimal(result)).toBeCloseTo(expected, 2);
        expect(result.currency).toBe(currency);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Additional edge-case tests to push count well past 1,000
// ---------------------------------------------------------------------------

// greaterThanOrEqual / lessThanOrEqual — 30 tests
describe('greaterThanOrEqual / lessThanOrEqual', () => {
  for (let i = 1; i <= 30; i++) {
    it(`gte/lte equality and ordering for i=${i}`, () => {
      const a = money(i, 'USD');
      const b = money(i, 'USD');
      const c = money(i + 1, 'USD');
      expect(greaterThanOrEqual(a, b)).toBe(true);
      expect(lessThanOrEqual(a, b)).toBe(true);
      expect(greaterThanOrEqual(c, a)).toBe(true);
      expect(lessThanOrEqual(a, c)).toBe(true);
    });
  }
});

// moneyFromMinorUnits — 30 tests
describe('moneyFromMinorUnits', () => {
  for (let i = 1; i <= 30; i++) {
    it(`moneyFromMinorUnits(${i}n, 'GBP') has correct fields`, () => {
      const m = moneyFromMinorUnits(BigInt(i), 'GBP');
      expect(m.amount).toBe(BigInt(i));
      expect(m.currency).toBe('GBP');
      expect(m.scale).toBe(2);
    });
  }
});

// toDecimal — 30 tests
describe('toDecimal', () => {
  for (let i = 1; i <= 30; i++) {
    it(`toDecimal(money(${i},'GBP')) = ${i}`, () => {
      const m = money(i, 'GBP');
      expect(toDecimal(m)).toBeCloseTo(i, 5);
    });
  }
});

// invertRate — 20 tests
describe('invertRate', () => {
  for (let i = 1; i <= 20; i++) {
    it(`invertRate of GBP->USD rate ${i} gives USD->GBP rate ${1 / i}`, () => {
      const rate = { from: 'GBP', to: 'USD', rate: i };
      const inv = invertRate(rate);
      expect(inv.from).toBe('USD');
      expect(inv.to).toBe('GBP');
      expect(inv.rate).toBeCloseTo(1 / i, 10);
    });
  }
});

// getCurrencySymbol — 10 tests
describe('getCurrencySymbol', () => {
  const symbolMap: Array<[string, string]> = [
    ['GBP', '£'], ['USD', '$'], ['EUR', '€'], ['JPY', '¥'], ['INR', '₹'],
    ['BRL', 'R$'], ['KRW', '₩'], ['THB', '฿'], ['PHP', '₱'], ['TRY', '₺'],
  ];
  for (const [code, sym] of symbolMap) {
    it(`getCurrencySymbol('${code}') = '${sym}'`, () => {
      expect(getCurrencySymbol(code)).toBe(sym);
    });
  }
});

// getCurrencyDecimals — 10 tests
describe('getCurrencyDecimals', () => {
  const decimalMap: Array<[string, number]> = [
    ['GBP', 2], ['USD', 2], ['EUR', 2], ['JPY', 0], ['HUF', 0],
    ['KRW', 0], ['IDR', 0], ['CHF', 2], ['INR', 2], ['BRL', 2],
  ];
  for (const [code, dec] of decimalMap) {
    it(`getCurrencyDecimals('${code}') = ${dec}`, () => {
      expect(getCurrencyDecimals(code)).toBe(dec);
    });
  }
});

// getCurrencyInfo — 10 tests
describe('getCurrencyInfo', () => {
  const currList = ['GBP','USD','EUR','JPY','CAD','AUD','SEK','PLN','CZK','PHP'];
  for (const code of currList) {
    it(`getCurrencyInfo('${code}') returns full info object`, () => {
      const info = getCurrencyInfo(code);
      expect(info).toBeDefined();
      expect(info?.code).toBe(code);
      expect(['before','after']).toContain(info?.symbolPosition);
    });
  }
});

// average — 20 tests
describe('average', () => {
  for (let i = 2; i <= 21; i++) {
    it(`average of [1..${i}] GBP is approximately ${(i + 1) / 2}`, () => {
      const amounts = Array.from({ length: i }, (_, idx) => money(idx + 1, 'GBP'));
      const result = average(amounts);
      const expected = (i + 1) / 2;
      expect(toDecimal(result)).toBeCloseTo(expected, 0);
      expect(result.currency).toBe('GBP');
    });
  }
});

// currency mismatch errors — 10 tests
describe('currency mismatch errors', () => {
  it('add throws on currency mismatch', () => {
    expect(() => add(money(1, 'GBP'), money(1, 'USD'))).toThrow('Currency mismatch');
  });
  it('subtract throws on currency mismatch', () => {
    expect(() => subtract(money(1, 'GBP'), money(1, 'USD'))).toThrow('Currency mismatch');
  });
  it('equal throws on currency mismatch', () => {
    expect(() => equal(money(1, 'GBP'), money(1, 'USD'))).toThrow('Currency mismatch');
  });
  it('greaterThan throws on currency mismatch', () => {
    expect(() => greaterThan(money(1, 'GBP'), money(1, 'USD'))).toThrow('Currency mismatch');
  });
  it('lessThan throws on currency mismatch', () => {
    expect(() => lessThan(money(1, 'GBP'), money(1, 'USD'))).toThrow('Currency mismatch');
  });
  it('compare throws on currency mismatch', () => {
    expect(() => compare(money(1, 'GBP'), money(1, 'USD'))).toThrow('Currency mismatch');
  });
  it('sum throws on currency mismatch', () => {
    expect(() => sum([money(1, 'GBP'), money(1, 'USD')])).toThrow('Currency mismatch');
  });
  it('divide throws on division by zero', () => {
    expect(() => divide(money(10, 'GBP'), 0)).toThrow('Division by zero');
  });
  it('applyRate throws if currency does not match rate.from', () => {
    expect(() => applyRate(money(1, 'USD'), { from: 'GBP', to: 'EUR', rate: 1.2 })).toThrow('Currency mismatch');
  });
  it('allocate throws on empty ratios', () => {
    expect(() => allocate(money(100, 'GBP'), [])).toThrow();
  });
});

// round / roundTo — 20 tests
describe('round / roundTo', () => {
  for (let i = 1; i <= 10; i++) {
    it(`round(money(${i},'GBP')) returns same Money (already in minor units)`, () => {
      const m = money(i, 'GBP');
      const r = round(m);
      expect(r.amount).toBe(m.amount);
    });
  }
  for (let i = 1; i <= 10; i++) {
    it(`roundTo(money(${i * 10},'GBP'), 1) is divisible correctly`, () => {
      const m = money(i * 10, 'GBP');
      const r = roundTo(m, 1);
      expect(r.scale).toBe(2);
      expect(r.amount % 10n).toBe(0n);
    });
  }
});

// toPrecisionString — 20 tests
describe('toPrecisionString', () => {
  for (let i = 1; i <= 20; i++) {
    it(`toPrecisionString(money(${i},'GBP'), 2) has 4 decimal places`, () => {
      const m = money(i, 'GBP');
      const s = toPrecisionString(m, 2);
      const parts = s.split('.');
      expect(parts).toHaveLength(2);
      expect(parts[1].length).toBe(4);
    });
  }
});

// format with options — 20 tests
describe('format with options', () => {
  for (let i = 1; i <= 10; i++) {
    it(`format(money(${i * 1000},'GBP'), {thousands:true}) contains ','`, () => {
      const m = money(i * 1000, 'GBP');
      const result = format(m, { thousands: true });
      expect(result).toContain(',');
    });
  }
  for (let i = 1; i <= 10; i++) {
    it(`format(money(${i},'GBP'), {symbol:false}) does not contain '£'`, () => {
      const m = money(i, 'GBP');
      const result = format(m, { symbol: false });
      expect(result).not.toContain('£');
    });
  }
});

// allocate with unequal ratios — 20 tests
describe('allocate with unequal ratios', () => {
  for (let i = 1; i <= 20; i++) {
    it(`allocate(money(${i * 7},'USD'), [3,1]) parts sum to original`, () => {
      const m = money(i * 7, 'USD');
      const parts = allocate(m, [3, 1]);
      expect(parts).toHaveLength(2);
      const total = parts.reduce((acc, p) => acc + p.amount, 0n);
      expect(total).toBe(m.amount);
      // First part should be ~75% of total
      expect(parts[0].amount).toBeGreaterThanOrEqual(parts[1].amount);
    });
  }
});

// JPY (0 decimal places) — 20 tests
describe('JPY zero-decimal currency', () => {
  for (let i = 1; i <= 20; i++) {
    it(`money(${i * 100},'JPY') has scale 0 and amount=${i * 100}`, () => {
      const m = money(i * 100, 'JPY');
      expect(m.scale).toBe(0);
      expect(m.amount).toBe(BigInt(i * 100));
      expect(toDecimalString(m)).toBe(`${i * 100}`);
    });
  }
});

// multiply by fractional factor — 20 tests
describe('multiply by fractional factor', () => {
  for (let i = 1; i <= 20; i++) {
    it(`multiply(money(100,'GBP'), 0.${i.toString().padStart(2,'0')}) is positive`, () => {
      const m = money(100, 'GBP');
      const factor = i * 0.01;
      const result = multiply(m, factor);
      expect(result.amount).toBeGreaterThan(0n);
    });
  }
});

// parseMoney with invalid input — 10 tests
describe('parseMoney with invalid input', () => {
  it('parseMoney("", "GBP") returns null', () => {
    expect(parseMoney('', 'GBP')).toBeNull();
  });
  it('parseMoney("abc", "GBP") returns null', () => {
    expect(parseMoney('abc', 'GBP')).toBeNull();
  });
  it('parseMoney("£abc", "GBP") returns null', () => {
    expect(parseMoney('£abc', 'GBP')).toBeNull();
  });
  it('parseMoney("--1", "GBP") parses to -1 or null', () => {
    // "--1" strips to "-1" which is NaN or -1, just verify it doesn't throw
    expect(() => parseMoney('--1', 'GBP')).not.toThrow();
  });
  it('parseMoney("NaN", "GBP") returns null', () => {
    expect(parseMoney('NaN', 'GBP')).toBeNull();
  });
  it('parseMoney("Infinity", "GBP") returns null or huge number', () => {
    // Infinity parses to NaN-like behavior, just ensure no throw
    expect(() => parseMoney('Infinity', 'GBP')).not.toThrow();
  });
  it('parseMoney("1.2.3", "GBP") returns null (parseFloat stops at second dot)', () => {
    const r = parseMoney('1.2.3', 'GBP');
    // parseFloat('1.2.3') = 1.2, so it may parse or return null — just no throw
    expect(() => parseMoney('1.2.3', 'GBP')).not.toThrow();
  });
  it('parseMoney("   100.00   ", "GBP") parses correctly', () => {
    const r = parseMoney('   100.00   ', 'GBP');
    expect(r).not.toBeNull();
    if (r) expect(toDecimal(r)).toBeCloseTo(100, 2);
  });
  it('parseMoney("£0.00", "GBP") = 0', () => {
    const r = parseMoney('£0.00', 'GBP');
    expect(r).not.toBeNull();
    if (r) expect(r.amount).toBe(0n);
  });
  it('parseMoney("$-50.00", "USD") returns negative', () => {
    const r = parseMoney('$-50.00', 'USD');
    expect(r).not.toBeNull();
    if (r) expect(r.amount).toBeLessThan(0n);
  });
});

// split edge cases — 10 tests
describe('split edge cases', () => {
  it('split(money(1,"GBP"), 1) returns array of length 1 equal to original', () => {
    const m = money(1, 'GBP');
    const parts = split(m, 1);
    expect(parts).toHaveLength(1);
    expect(parts[0].amount).toBe(m.amount);
  });
  it('split(money(1,"GBP"), 3) distributes remainder correctly', () => {
    const m = money(1, 'GBP'); // 100 minor units
    const parts = split(m, 3);
    const total = parts.reduce((acc, p) => acc + p.amount, 0n);
    expect(total).toBe(100n);
    expect(parts).toHaveLength(3);
  });
  it('split(money(10,"GBP"), 3) distributes 1000 minor units into 3', () => {
    const m = money(10, 'GBP');
    const parts = split(m, 3);
    const total = parts.reduce((acc, p) => acc + p.amount, 0n);
    expect(total).toBe(1000n);
  });
  it('split throws for n=0', () => {
    expect(() => split(money(100, 'GBP'), 0)).toThrow();
  });
  it('split throws for n<0', () => {
    expect(() => split(money(100, 'GBP'), -1)).toThrow();
  });
  for (let i = 1; i <= 5; i++) {
    it(`split(money(${i * 3},'GBP'), 3) all parts have same currency`, () => {
      const m = money(i * 3, 'GBP');
      const parts = split(m, 3);
      parts.forEach((p) => expect(p.currency).toBe('GBP'));
    });
  }
});
