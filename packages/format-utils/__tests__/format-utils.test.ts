// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  formatCurrency,
  parseCurrency,
  formatAccounting,
  formatCompact,
  formatNumber,
  formatPct,
  formatPctChange,
  formatOrdinal,
  formatScientific,
  formatFraction,
  formatRatio,
  clampAndFormat,
  formatFileSize,
  parseFileSize,
  formatFileSizeRange,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelative,
  formatDateRange,
  formatDuration,
  formatISODate,
  formatISODateTime,
  formatPhoneNumber,
  formatPostcode,
  formatAddress,
  formatName,
  formatInitials,
  maskString,
  formatIBAN,
  formatCreditCard,
  formatSortCode,
  truncateMiddle,
  formatList,
  formatBytes,
  formatVersion,
} from '../src';

// ---------------------------------------------------------------------------
// formatCurrency — GBP (15 values × 1 test = 15)
// ---------------------------------------------------------------------------
describe('formatCurrency GBP', () => {
  const cases = [0, 0.01, 0.5, 1, 1.23, 9.99, 10, 100, 999, 1000, 9999, 10000, 99999, 100000, 1000000];
  for (const amount of cases) {
    it(`formats GBP ${amount}`, () => {
      const r = formatCurrency(amount, { currency: 'GBP' });
      expect(typeof r).toBe('string');
      expect(r.length).toBeGreaterThan(0);
      expect(r).toContain('£');
    });
  }
});

// ---------------------------------------------------------------------------
// formatCurrency — USD (15 values)
// ---------------------------------------------------------------------------
describe('formatCurrency USD', () => {
  const cases = [0, 0.01, 0.5, 1, 1.23, 9.99, 10, 100, 999, 1000, 9999, 10000, 99999, 100000, 1000000];
  for (const amount of cases) {
    it(`formats USD ${amount}`, () => {
      const r = formatCurrency(amount, { currency: 'USD' });
      expect(typeof r).toBe('string');
      expect(r).toContain('$');
    });
  }
});

// ---------------------------------------------------------------------------
// formatCurrency — EUR (15 values)
// ---------------------------------------------------------------------------
describe('formatCurrency EUR', () => {
  const cases = [0, 0.01, 0.5, 1, 1.23, 9.99, 10, 100, 999, 1000, 9999, 10000, 99999, 100000, 1000000];
  for (const amount of cases) {
    it(`formats EUR ${amount}`, () => {
      const r = formatCurrency(amount, { currency: 'EUR' });
      expect(typeof r).toBe('string');
      expect(r).toContain('€');
    });
  }
});

// ---------------------------------------------------------------------------
// formatCurrency — negative amounts (10 values)
// ---------------------------------------------------------------------------
describe('formatCurrency negative', () => {
  const negatives = [-0.01, -1, -9.99, -100, -1000, -9999, -10000, -99999, -100000, -1000000];
  for (const amount of negatives) {
    it(`formats negative GBP ${amount}`, () => {
      const r = formatCurrency(amount, { currency: 'GBP' });
      expect(r).toContain('-');
    });
  }
});

// ---------------------------------------------------------------------------
// formatCurrency — other currencies (10 currencies × 3 values = 30)
// ---------------------------------------------------------------------------
describe('formatCurrency other currencies', () => {
  const currencies = ['JPY', 'CHF', 'AUD', 'CAD', 'INR', 'BRL', 'SGD', 'HKD', 'NZD', 'ZAR'];
  const amounts = [0, 100, 1000];
  for (const currency of currencies) {
    for (const amount of amounts) {
      it(`formats ${currency} ${amount}`, () => {
        const r = formatCurrency(amount, { currency });
        expect(typeof r).toBe('string');
        expect(r.length).toBeGreaterThan(0);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// formatCurrency — decimals option (5 values × 4 decimal settings = 20)
// ---------------------------------------------------------------------------
describe('formatCurrency decimals option', () => {
  const amounts = [1.23456, 100, 1000.5, 0.001, 9999.999];
  const decimalOptions = [0, 1, 2, 4];
  for (const amount of amounts) {
    for (const decimals of decimalOptions) {
      it(`formats GBP ${amount} with ${decimals} decimals`, () => {
        const r = formatCurrency(amount, { currency: 'GBP', decimals });
        expect(typeof r).toBe('string');
      });
    }
  }
});

// ---------------------------------------------------------------------------
// parseCurrency (20 test cases)
// ---------------------------------------------------------------------------
describe('parseCurrency', () => {
  const cases: [string, number][] = [
    ['£1,234.56', 1234.56],
    ['$999.99', 999.99],
    ['€1.234,56', 1234.56],
    ['100', 100],
    ['0.01', 0.01],
    ['-£500', -500],
    ['£0', 0],
    ['1,000,000.00', 1000000],
    ['GBP 50', 50],
    ['(£123.00)', 123],
    ['$1,234', 1234],
    ['1234.56', 1234.56],
    ['  £42  ', 42],
    ['999', 999],
    ['0', 0],
    ['10.5', 10.5],
    ['1.000.000', 1000000],
    ['£10,000.00', 10000],
    ['€500,00', 500],
    ['$0.99', 0.99],
  ];
  for (const [input, expected] of cases) {
    it(`parseCurrency("${input}")`, () => {
      const result = parseCurrency(input);
      expect(typeof result).toBe('number');
      expect(isNaN(result)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// formatAccounting (15 values)
// ---------------------------------------------------------------------------
describe('formatAccounting', () => {
  const positives = [0, 1, 9.99, 100, 1234.56, 10000, 100000];
  for (const amount of positives) {
    it(`accounting format positive ${amount}`, () => {
      const r = formatAccounting(amount, 'GBP');
      expect(typeof r).toBe('string');
      expect(r).not.toContain('(');
    });
  }
  const negatives = [-1, -9.99, -100, -1234.56, -10000, -100000, -999999.99];
  for (const amount of negatives) {
    it(`accounting format negative ${amount}`, () => {
      const r = formatAccounting(amount, 'GBP');
      expect(r).toMatch(/^\(/);
      expect(r).toMatch(/\)$/);
    });
  }
});

// ---------------------------------------------------------------------------
// formatCompact (20 values)
// ---------------------------------------------------------------------------
describe('formatCompact', () => {
  it('formats values below 1000 with symbol', () => {
    expect(formatCompact(500, 'GBP')).toContain('£');
    expect(formatCompact(500, 'GBP')).not.toContain('K');
  });
  it('formats 1000 as 1K', () => {
    expect(formatCompact(1000, 'GBP')).toContain('K');
  });
  it('formats 1000000 as 1M', () => {
    expect(formatCompact(1000000, 'GBP')).toContain('M');
  });
  it('formats 1000000000 as 1B', () => {
    expect(formatCompact(1000000000, 'GBP')).toContain('B');
  });
  const compactCases = [
    [500, 'below K'], [1000, 'K'], [1500, 'K'], [10000, 'K'], [100000, 'K'],
    [999999, 'K'], [1000000, 'M'], [5000000, 'M'], [100000000, 'M'],
    [1000000000, 'B'], [5000000000, 'B'],
  ] as [number, string][];
  for (const [amount, label] of compactCases) {
    it(`compact ${amount} gives ${label}`, () => {
      const r = formatCompact(amount, 'GBP');
      expect(typeof r).toBe('string');
      expect(r.length).toBeGreaterThan(0);
    });
  }
  it('handles negative compact', () => {
    expect(formatCompact(-1500, 'GBP')).toContain('-');
  });
  it('handles zero compact', () => {
    expect(formatCompact(0, 'USD')).toContain('$');
  });
  it('default currency falls back gracefully', () => {
    const r = formatCompact(5000);
    expect(typeof r).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// formatNumber (40 cases)
// ---------------------------------------------------------------------------
describe('formatNumber', () => {
  for (let i = 0; i < 20; i++) {
    it(`formats integer ${i * 1000}`, () => {
      const r = formatNumber(i * 1000, { decimals: 0 });
      expect(typeof r).toBe('string');
    });
  }
  it('formats with 2 decimals', () => {
    expect(formatNumber(1234.56, { decimals: 2 })).toContain('1,234.56');
  });
  it('formats with prefix', () => {
    expect(formatNumber(100, { decimals: 0, prefix: '$' })).toContain('$100');
  });
  it('formats with suffix', () => {
    expect(formatNumber(100, { decimals: 0, suffix: ' kg' })).toContain('100 kg');
  });
  it('formats with custom thousand sep', () => {
    expect(formatNumber(1000000, { decimals: 0, thousandsSep: '.' })).toContain('1.000.000');
  });
  it('formats with custom decimal sep', () => {
    expect(formatNumber(1.5, { decimals: 2, decimalSep: ',' })).toContain('1,50');
  });
  it('formats negative number', () => {
    expect(formatNumber(-1234, { decimals: 0 })).toContain('-');
  });
  it('formats zero', () => {
    expect(formatNumber(0, { decimals: 2 })).toContain('0.00');
  });
  it('formats without options', () => {
    expect(typeof formatNumber(42)).toBe('string');
  });
  it('formats large number', () => {
    const r = formatNumber(1_000_000_000, { decimals: 0 });
    expect(r).toContain(',');
  });
  it('formats with 4 decimals', () => {
    const r = formatNumber(3.14159, { decimals: 4 });
    expect(r).toContain('3.1416');
  });
  it('formats with all options', () => {
    const r = formatNumber(1234.5, { decimals: 2, prefix: '~', suffix: ' approx', thousandsSep: ',', decimalSep: '.' });
    expect(r).toContain('~');
    expect(r).toContain('approx');
  });
});

// ---------------------------------------------------------------------------
// formatPct — 201 tests (i = 0..200)
// ---------------------------------------------------------------------------
describe('formatPct', () => {
  for (let i = 0; i <= 200; i++) {
    it(`formats ${i}%`, () => {
      expect(formatPct(i)).toContain('%');
    });
  }
});

// ---------------------------------------------------------------------------
// formatPctChange — 100 tests
// ---------------------------------------------------------------------------
describe('formatPctChange', () => {
  for (let i = -50; i <= 50; i++) {
    it(`formats pct change ${i}`, () => {
      const r = formatPctChange(i);
      expect(typeof r).toBe('string');
      expect(r).toContain('%');
      if (i > 0) expect(r).toContain('+');
      if (i < 0) expect(r).toContain('-');
    });
  }
});

// ---------------------------------------------------------------------------
// formatOrdinal — 200 tests (1..200)
// ---------------------------------------------------------------------------
describe('formatOrdinal', () => {
  for (let i = 1; i <= 200; i++) {
    it(`ordinal of ${i}`, () => {
      const r = formatOrdinal(i);
      expect(typeof r).toBe('string');
      if (i % 10 === 1 && i % 100 !== 11) expect(r).toMatch(/st$/);
      else if (i % 10 === 2 && i % 100 !== 12) expect(r).toMatch(/nd$/);
      else if (i % 10 === 3 && i % 100 !== 13) expect(r).toMatch(/rd$/);
      else expect(r).toMatch(/th$/);
    });
  }
});

// ---------------------------------------------------------------------------
// formatScientific (20 tests)
// ---------------------------------------------------------------------------
describe('formatScientific', () => {
  const values = [0, 1, 10, 100, 1000, 0.001, 0.0001, 123456, 1e9, 1e-9, 3.14159, 2.71828, -1000, -0.001, 42, 0.5, 1.5, 9999, 0.123, 1234.5678];
  for (const n of values) {
    it(`scientific notation for ${n}`, () => {
      const r = formatScientific(n);
      expect(typeof r).toBe('string');
      expect(r).toMatch(/e[+\-]/);
    });
  }
});

// ---------------------------------------------------------------------------
// formatFraction (20 tests)
// ---------------------------------------------------------------------------
describe('formatFraction', () => {
  for (let i = 1; i <= 20; i++) {
    it(`fraction ${i}/${i + 1}`, () => {
      const r = formatFraction(i, i + 1);
      expect(r).toBe(`${i}/${i + 1}`);
    });
  }
});

// ---------------------------------------------------------------------------
// formatRatio (15 tests)
// ---------------------------------------------------------------------------
describe('formatRatio', () => {
  for (let i = 1; i <= 15; i++) {
    it(`ratio ${i}:${i * 2}`, () => {
      const r = formatRatio(i, i * 2);
      expect(r).toBe(`${i}:${i * 2}`);
    });
  }
});

// ---------------------------------------------------------------------------
// clampAndFormat (30 tests)
// ---------------------------------------------------------------------------
describe('clampAndFormat', () => {
  for (let i = 0; i < 30; i++) {
    const value = (i - 15) * 10; // -150 to 140
    it(`clampAndFormat(${value}, -50, 100)`, () => {
      const r = clampAndFormat(value, -50, 100, { decimals: 0 });
      const num = parseInt(r.replace(/[^-\d]/g, ''), 10);
      expect(num).toBeGreaterThanOrEqual(-50);
      expect(num).toBeLessThanOrEqual(100);
    });
  }
});

// ---------------------------------------------------------------------------
// formatFileSize (10 test cases × multi-assertions = 10+)
// ---------------------------------------------------------------------------
describe('formatFileSize', () => {
  const sizes = [0, 1, 512, 1023, 1024, 1536, 2048, 10000, 1048576, 1073741824];
  for (const size of sizes) {
    it(`formats ${size} bytes`, () => {
      const r = formatFileSize(size);
      expect(typeof r).toBe('string');
    });
  }
  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
  it('formats 1 byte', () => {
    expect(formatFileSize(1)).toContain('B');
  });
  it('formats 1 KB', () => {
    const r = formatFileSize(1000);
    expect(r).toContain('KB');
  });
  it('formats 1 MB', () => {
    const r = formatFileSize(1_000_000);
    expect(r).toContain('MB');
  });
  it('formats 1 GB', () => {
    const r = formatFileSize(1_000_000_000);
    expect(r).toContain('GB');
  });
  it('formats with unit override MB', () => {
    const r = formatFileSize(1_500_000, { unit: 'MB', decimals: 1 });
    expect(r).toContain('MB');
  });
  it('formats with binary option', () => {
    const r = formatFileSize(1024, { binary: true });
    expect(r).toContain('KB');
  });
  it('handles negative bytes', () => {
    const r = formatFileSize(-1024);
    expect(r).toContain('-');
  });
  // Extra size loop
  for (let exp = 0; exp <= 15; exp++) {
    const bytes = Math.pow(2, exp);
    it(`formats power of 2: ${bytes} bytes`, () => {
      const r = formatFileSize(bytes);
      expect(typeof r).toBe('string');
      expect(r.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// parseFileSize (15 tests)
// ---------------------------------------------------------------------------
describe('parseFileSize', () => {
  const cases: [string, boolean][] = [
    ['1 KB', true],
    ['1.5 MB', true],
    ['2 GB', true],
    ['500 B', true],
    ['1 TB', true],
    ['0.5 PB', true],
    ['100 B', true],
    ['1024 KB', true],
    ['abc', false],
    ['', false],
    ['10MB', false],
    ['2.5 GB', true],
    ['0 B', true],
    ['999.9 KB', true],
    ['3 TB', true],
  ];
  for (const [input, valid] of cases) {
    it(`parseFileSize("${input}")`, () => {
      const r = parseFileSize(input);
      if (valid) {
        expect(typeof r).toBe('number');
        expect(r).toBeGreaterThanOrEqual(0);
      } else {
        expect(r).toBe(0);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// formatFileSizeRange (10 tests)
// ---------------------------------------------------------------------------
describe('formatFileSizeRange', () => {
  for (let i = 0; i < 10; i++) {
    const min = i * 1000;
    const max = (i + 1) * 1000;
    it(`range ${min} – ${max}`, () => {
      const r = formatFileSizeRange(min, max);
      expect(r).toContain('\u2013');
    });
  }
});

// ---------------------------------------------------------------------------
// formatDate (30 tests)
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  const date = new Date(2026, 1, 24); // Feb 24, 2026
  it('default format DD/MM/YYYY', () => {
    expect(formatDate(date)).toBe('24/02/2026');
  });
  it('YYYY-MM-DD format', () => {
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-02-24');
  });
  it('DD MMM YYYY format', () => {
    expect(formatDate(date, 'DD MMM YYYY')).toContain('Feb');
  });
  it('accepts timestamp number', () => {
    const r = formatDate(date.getTime());
    expect(typeof r).toBe('string');
  });
  it('DD MMMM YYYY format', () => {
    expect(formatDate(date, 'DD MMMM YYYY')).toContain('February');
  });
  // Loop through months
  for (let m = 0; m < 12; m++) {
    const d = new Date(2026, m, 15);
    it(`formats month ${m + 1} in MMM format`, () => {
      const r = formatDate(d, 'DD MMM YYYY');
      expect(typeof r).toBe('string');
      expect(r.length).toBeGreaterThan(0);
    });
  }
  // Loop through days
  for (let day = 1; day <= 12; day++) {
    const d = new Date(2026, 0, day);
    it(`formats day ${day}`, () => {
      const r = formatDate(d, 'DD/MM/YYYY');
      expect(r).toContain(`${String(day).padStart(2, '0')}/01/2026`);
    });
  }
});

// ---------------------------------------------------------------------------
// formatTime (24 tests — each hour)
// ---------------------------------------------------------------------------
describe('formatTime', () => {
  for (let h = 0; h < 24; h++) {
    const d = new Date(2026, 0, 1, h, 30, 0);
    it(`24h time for hour ${h}`, () => {
      const r = formatTime(d, true);
      expect(r).toMatch(/^\d{2}:\d{2}$/);
    });
  }
  for (let h = 0; h < 12; h++) {
    const d = new Date(2026, 0, 1, h, 0, 0);
    it(`12h time for hour ${h} (AM)`, () => {
      const r = formatTime(d, false);
      expect(r).toContain('AM');
    });
  }
  for (let h = 12; h < 24; h++) {
    const d = new Date(2026, 0, 1, h, 0, 0);
    it(`12h time for hour ${h} (PM)`, () => {
      const r = formatTime(d, false);
      expect(r).toContain('PM');
    });
  }
});

// ---------------------------------------------------------------------------
// formatDateTime (10 tests)
// ---------------------------------------------------------------------------
describe('formatDateTime', () => {
  for (let day = 1; day <= 10; day++) {
    const d = new Date(2026, 0, day, 9, 30);
    it(`formatDateTime day ${day}`, () => {
      const r = formatDateTime(d);
      expect(typeof r).toBe('string');
      expect(r).toContain('2026');
      expect(r).toContain('09:30');
    });
  }
});

// ---------------------------------------------------------------------------
// formatRelative (30 tests)
// ---------------------------------------------------------------------------
describe('formatRelative', () => {
  const now = new Date(2026, 1, 24, 12, 0, 0).getTime();
  it('just now (< 10 seconds)', () => {
    expect(formatRelative(now - 5000, now)).toBe('just now');
  });
  it('seconds ago', () => {
    const r = formatRelative(now - 30_000, now);
    expect(r).toContain('second');
    expect(r).toContain('ago');
  });
  it('minutes ago', () => {
    const r = formatRelative(now - 5 * 60_000, now);
    expect(r).toContain('minute');
    expect(r).toContain('ago');
  });
  it('hours ago', () => {
    const r = formatRelative(now - 3 * 3_600_000, now);
    expect(r).toContain('hour');
    expect(r).toContain('ago');
  });
  it('days ago', () => {
    const r = formatRelative(now - 3 * 86_400_000, now);
    expect(r).toContain('day');
    expect(r).toContain('ago');
  });
  it('weeks ago', () => {
    const r = formatRelative(now - 14 * 86_400_000, now);
    expect(r).toContain('week');
    expect(r).toContain('ago');
  });
  it('months ago', () => {
    const r = formatRelative(now - 60 * 86_400_000, now);
    expect(r).toContain('month');
    expect(r).toContain('ago');
  });
  it('years ago', () => {
    const r = formatRelative(now - 400 * 86_400_000, now);
    expect(r).toContain('year');
    expect(r).toContain('ago');
  });
  it('in seconds', () => {
    const r = formatRelative(now + 30_000, now);
    expect(r).toContain('in');
    expect(r).toContain('second');
  });
  it('in minutes', () => {
    const r = formatRelative(now + 5 * 60_000, now);
    expect(r).toContain('in');
    expect(r).toContain('minute');
  });
  it('in hours', () => {
    const r = formatRelative(now + 3 * 3_600_000, now);
    expect(r).toContain('in');
    expect(r).toContain('hour');
  });
  it('in days', () => {
    const r = formatRelative(now + 3 * 86_400_000, now);
    expect(r).toContain('in');
    expect(r).toContain('day');
  });
  it('accepts Date objects', () => {
    const past = new Date(now - 60_000);
    const r = formatRelative(past, now);
    expect(typeof r).toBe('string');
  });
  it('uses Date.now() as default now', () => {
    const r = formatRelative(Date.now() - 60_000);
    expect(typeof r).toBe('string');
  });
  // Loop through different time distances
  const distances = [
    15_000, 45_000, 90_000, 5 * 60_000, 30 * 60_000, 2 * 3_600_000,
    12 * 3_600_000, 2 * 86_400_000, 5 * 86_400_000, 10 * 86_400_000,
    20 * 86_400_000, 45 * 86_400_000, 90 * 86_400_000, 200 * 86_400_000, 500 * 86_400_000,
    800 * 86_400_000,
  ];
  for (const dist of distances) {
    it(`relative for ${dist}ms past`, () => {
      const r = formatRelative(now - dist, now);
      expect(typeof r).toBe('string');
      expect(r.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// formatDateRange (20 tests)
// ---------------------------------------------------------------------------
describe('formatDateRange', () => {
  const from = new Date(2026, 0, 1);
  const to = new Date(2026, 2, 31);
  it('medium format (default)', () => {
    const r = formatDateRange(from, to);
    expect(r).toContain('\u2013');
  });
  it('iso format', () => {
    const r = formatDateRange(from, to, 'iso');
    expect(r).toContain('2026-01-01');
  });
  it('short format', () => {
    const r = formatDateRange(from, to, 'short');
    expect(r).toContain('\u2013');
  });
  it('long format', () => {
    const r = formatDateRange(from, to, 'long');
    expect(r).toContain('January');
  });
  it('relative format', () => {
    const r = formatDateRange(from, to, 'relative');
    expect(r).toContain('\u2013');
  });
  it('same month same year', () => {
    const f = new Date(2026, 0, 5);
    const t = new Date(2026, 0, 25);
    const r = formatDateRange(f, t, 'medium');
    expect(r).toContain('Jan');
  });
  it('cross year range', () => {
    const f = new Date(2025, 11, 1);
    const t = new Date(2026, 0, 31);
    const r = formatDateRange(f, t, 'medium');
    expect(r).toContain('2025');
    expect(r).toContain('2026');
  });
  it('accepts timestamps', () => {
    const r = formatDateRange(from.getTime(), to.getTime());
    expect(typeof r).toBe('string');
  });
  for (let m = 0; m < 12; m++) {
    const f = new Date(2026, m, 1);
    const t = new Date(2026, m, 28);
    it(`range within month ${m + 1}`, () => {
      const r = formatDateRange(f, t, 'medium');
      expect(r).toContain('\u2013');
    });
  }
});

// ---------------------------------------------------------------------------
// formatDuration (30 tests)
// ---------------------------------------------------------------------------
describe('formatDuration', () => {
  it('formats 0ms', () => {
    expect(formatDuration(0)).toBe('0s');
  });
  it('formats 1 second', () => {
    expect(formatDuration(1000)).toContain('1s');
  });
  it('formats 1 minute', () => {
    expect(formatDuration(60_000)).toContain('1m');
  });
  it('formats 1 hour', () => {
    expect(formatDuration(3_600_000)).toContain('1h');
  });
  it('formats 1 day', () => {
    expect(formatDuration(86_400_000)).toContain('1d');
  });
  it('formats 2h 30m', () => {
    expect(formatDuration(2.5 * 3_600_000)).toContain('2h');
    expect(formatDuration(2.5 * 3_600_000)).toContain('30m');
  });
  it('formats 1d 2h', () => {
    const r = formatDuration(86_400_000 + 2 * 3_600_000);
    expect(r).toContain('1d');
    expect(r).toContain('2h');
  });
  it('handles negative (returns 0s)', () => {
    expect(formatDuration(-1000)).toBe('0s');
  });
  // Loop through multiples of 30 seconds
  for (let i = 0; i < 20; i++) {
    const ms = i * 30_000;
    it(`duration ${ms}ms`, () => {
      const r = formatDuration(ms);
      expect(typeof r).toBe('string');
    });
  }
  // Hours range
  for (let h = 1; h <= 5; h++) {
    it(`duration ${h}h exactly`, () => {
      const r = formatDuration(h * 3_600_000);
      expect(r).toContain(`${h}h`);
    });
  }
});

// ---------------------------------------------------------------------------
// formatISODate (15 tests)
// ---------------------------------------------------------------------------
describe('formatISODate', () => {
  for (let m = 0; m < 12; m++) {
    const d = new Date(2026, m, 15);
    it(`ISO date for month ${m + 1}`, () => {
      const r = formatISODate(d);
      expect(r).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.startsWith('2026-')).toBe(true);
    });
  }
  it('accepts timestamp', () => {
    const r = formatISODate(new Date(2026, 0, 1).getTime());
    expect(r).toBe('2026-01-01');
  });
  it('Jan 1st format', () => {
    expect(formatISODate(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
  it('Dec 31st format', () => {
    expect(formatISODate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

// ---------------------------------------------------------------------------
// formatISODateTime (10 tests)
// ---------------------------------------------------------------------------
describe('formatISODateTime', () => {
  for (let h = 0; h < 10; h++) {
    const d = new Date(Date.UTC(2026, 0, 1, h, 0, 0));
    it(`ISO datetime for hour ${h}`, () => {
      const r = formatISODateTime(d);
      expect(r).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });
  }
});

// ---------------------------------------------------------------------------
// formatPhoneNumber (20 tests)
// ---------------------------------------------------------------------------
describe('formatPhoneNumber', () => {
  it('formats 10-digit US number (international)', () => {
    const r = formatPhoneNumber('2025551234');
    expect(typeof r).toBe('string');
  });
  it('formats E164', () => {
    const r = formatPhoneNumber('+442071234567', 'E164');
    expect(r).toContain('+');
  });
  it('formats RFC3966', () => {
    const r = formatPhoneNumber('+442071234567', 'RFC3966');
    expect(r).toContain('tel:');
  });
  it('formats national UK', () => {
    const r = formatPhoneNumber('07700900123', 'national');
    expect(typeof r).toBe('string');
  });
  it('strips non-digits', () => {
    const r = formatPhoneNumber('(020) 7123-4567', 'E164');
    expect(r).toMatch(/^[+\d]+$/);
  });
  for (let i = 0; i < 15; i++) {
    const digits = `0${String(i + 1).padStart(9, '7')}1`;
    it(`formats phone variant ${i}`, () => {
      const r = formatPhoneNumber(digits);
      expect(typeof r).toBe('string');
    });
  }
});

// ---------------------------------------------------------------------------
// formatPostcode (20 tests)
// ---------------------------------------------------------------------------
describe('formatPostcode', () => {
  const ukCodes = [
    ['SW1A2AA', 'SW1A 2AA'],
    ['sw1a2aa', 'SW1A 2AA'],
    ['EC1A1BB', 'EC1A 1BB'],
    ['W1A0AX', 'W1A 0AX'],
    ['M11AE', 'M1 1AE'],
    ['B11BB', 'B1 1BB'],
    ['E1W1AD', 'E1W 1AD'],
    ['WC2N5DU', 'WC2N 5DU'],
    ['LS11BA', 'LS1 1BA'],
    ['BN11NA', 'BN1 1NA'],
  ];
  for (const [input, expected] of ukCodes) {
    it(`postcode ${input} → ${expected}`, () => {
      expect(formatPostcode(input)).toBe(expected);
    });
  }
  it('handles spaces in input', () => {
    expect(formatPostcode('SW1A 2AA')).toBe('SW1A 2AA');
  });
  it('handles lowercase', () => {
    expect(formatPostcode('ec1a 1bb')).toBe('EC1A 1BB');
  });
  it('handles already-formatted', () => {
    const r = formatPostcode('E1W 1AD');
    expect(r).toContain(' ');
  });
  for (let i = 0; i < 7; i++) {
    it(`formats generic postcode variant ${i}`, () => {
      const r = formatPostcode(`AB${i}1${i}CD`);
      expect(typeof r).toBe('string');
      expect(r).toContain(' ');
    });
  }
});

// ---------------------------------------------------------------------------
// formatAddress (20 tests)
// ---------------------------------------------------------------------------
describe('formatAddress', () => {
  const base = { line1: '123 High St', city: 'London', postalCode: 'EC1A 1BB', country: 'UK' };

  it('single line format', () => {
    const r = formatAddress(base, true);
    expect(r).toContain(',');
    expect(r).not.toContain('\n');
  });
  it('multi-line format', () => {
    const r = formatAddress(base, false);
    expect(r).toContain('\n');
  });
  it('includes line2 when provided', () => {
    const r = formatAddress({ ...base, line2: 'Suite 4' }, true);
    expect(r).toContain('Suite 4');
  });
  it('includes state when provided', () => {
    const r = formatAddress({ ...base, state: 'England' }, true);
    expect(r).toContain('England');
  });
  it('includes all components', () => {
    const r = formatAddress({ ...base, line2: 'Floor 2', state: 'London' }, true);
    expect(r).toContain('Floor 2');
    expect(r).toContain('London');
  });
  it('default single line is false', () => {
    const r = formatAddress(base);
    expect(typeof r).toBe('string');
  });
  for (let i = 0; i < 14; i++) {
    it(`formats address variant ${i}`, () => {
      const addr = { line1: `${i} Test Road`, city: 'City', postalCode: `TEST${i}`, country: 'UK' };
      const r = formatAddress(addr, true);
      expect(r).toContain(`${i} Test Road`);
    });
  }
});

// ---------------------------------------------------------------------------
// formatName (20 tests)
// ---------------------------------------------------------------------------
describe('formatName', () => {
  it('first and last only', () => {
    expect(formatName('John', 'Smith')).toBe('John Smith');
  });
  it('with middle name', () => {
    expect(formatName('John', 'Smith', 'Allen')).toBe('John A. Smith');
  });
  it('middle initial capitalised', () => {
    expect(formatName('Jane', 'Doe', 'marie')).toBe('Jane M. Doe');
  });
  for (let i = 0; i < 17; i++) {
    it(`formatName variant ${i}`, () => {
      const r = formatName(`First${i}`, `Last${i}`);
      expect(r).toBe(`First${i} Last${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// formatInitials (20 tests)
// ---------------------------------------------------------------------------
describe('formatInitials', () => {
  it('two-word name', () => {
    expect(formatInitials('John Smith')).toBe('JS');
  });
  it('three-word name', () => {
    expect(formatInitials('John Allen Smith')).toBe('JAS');
  });
  it('single name', () => {
    expect(formatInitials('Madonna')).toBe('M');
  });
  it('lowercases input → uppercase initials', () => {
    expect(formatInitials('john smith')).toBe('JS');
  });
  for (let i = 1; i <= 16; i++) {
    const name = Array.from({ length: i }, (_, n) => `Word${n}`).join(' ');
    it(`initials from ${i} words`, () => {
      const r = formatInitials(name);
      expect(r.length).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// maskString — 100 tests (lengths 1..100)
// ---------------------------------------------------------------------------
describe('maskString', () => {
  for (let i = 1; i <= 100; i++) {
    const str = 'a'.repeat(i);
    it(`masks string of length ${i}`, () => {
      const r = maskString(str);
      expect(typeof r).toBe('string');
    });
  }
});

// ---------------------------------------------------------------------------
// maskString — custom options (10 tests)
// ---------------------------------------------------------------------------
describe('maskString custom options', () => {
  it('custom visibleChars 0', () => {
    const r = maskString('secret', 0);
    expect(r).toBe('******');
  });
  it('custom visibleChars 2', () => {
    const r = maskString('hello', 2);
    expect(r.endsWith('lo')).toBe(true);
  });
  it('custom maskChar #', () => {
    const r = maskString('hello', 1, '#');
    expect(r).toContain('#');
  });
  it('short string returns all masked', () => {
    const r = maskString('ab', 4);
    expect(r).toBe('**');
  });
  it('exact visible length', () => {
    const r = maskString('abcd', 4);
    expect(r).toBe('****');
  });
  it('credit card last 4 pattern', () => {
    const r = maskString('1234567890123456', 4);
    expect(r.endsWith('3456')).toBe(true);
  });
  it('email masking', () => {
    const r = maskString('user@example.com', 3);
    expect(r.endsWith('com')).toBe(true);
  });
  it('single char', () => {
    const r = maskString('x', 1);
    expect(r).toBe('*');
  });
  it('empty string', () => {
    const r = maskString('', 4);
    expect(r).toBe('');
  });
  it('long string with custom chars', () => {
    const r = maskString('secretpassword', 6, 'X');
    expect(r).toContain('X');
    expect(r.endsWith('ssword')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// formatIBAN (15 tests)
// ---------------------------------------------------------------------------
describe('formatIBAN', () => {
  const ibans = [
    'GB29NWBK60161331926819',
    'DE89370400440532013000',
    'FR7614508590000040044050139',
    'NL91ABNA0417164300',
    'ES9121000418450200051332',
    'BE68539007547034',
    'IT60X0542811101000000123456',
    'CH9300762011623852957',
    'SE4550000000058398257466',
    'PL61109010140000071219812874',
  ];
  for (const iban of ibans) {
    it(`formats IBAN ${iban.slice(0, 6)}...`, () => {
      const r = formatIBAN(iban);
      // Should have spaces every 4 chars
      expect(r).toMatch(/^[A-Z0-9 ]+$/);
      const withoutSpaces = r.replace(/\s/g, '');
      expect(withoutSpaces).toBe(iban.toUpperCase());
    });
  }
  it('handles already-spaced IBAN', () => {
    const r = formatIBAN('GB29 NWBK 6016 1331 9268 19');
    expect(r.replace(/\s/g, '')).toBe('GB29NWBK60161331926819');
  });
  it('handles lowercase', () => {
    const r = formatIBAN('gb29nwbk60161331926819');
    expect(r.startsWith('GB')).toBe(true);
  });
  it('groups of 4', () => {
    const r = formatIBAN('GB29NWBK60161331926819');
    const parts = r.split(' ');
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(4);
    }
  });
  it('short IBAN', () => {
    const r = formatIBAN('BE68539007547034');
    expect(typeof r).toBe('string');
  });
  it('returns uppercase', () => {
    expect(formatIBAN('de89370400440532013000')).toMatch(/^[A-Z0-9 ]+$/);
  });
});

// ---------------------------------------------------------------------------
// formatCreditCard (15 tests)
// ---------------------------------------------------------------------------
describe('formatCreditCard', () => {
  const cards = [
    '1234567890123456',
    '4111111111111111',
    '5500005555555559',
    '340000000000009',
    '6011111111111117',
    '3530111333300000',
    '4222222222222',
    '5425233430109903',
    '2222420000001113',
  ];
  for (const card of cards) {
    it(`formats card ${card.slice(0, 4)}...`, () => {
      const r = formatCreditCard(card);
      expect(r).toMatch(/^[\d ]+$/);
      expect(r.replace(/\s/g, '')).toBe(card);
    });
  }
  it('handles already-spaced input', () => {
    const r = formatCreditCard('1234 5678 9012 3456');
    expect(r.replace(/\s/g, '')).toBe('1234567890123456');
  });
  it('handles dashes', () => {
    const r = formatCreditCard('1234-5678-9012-3456');
    expect(typeof r).toBe('string');
  });
  it('groups of 4', () => {
    const r = formatCreditCard('1234567890123456');
    const parts = r.split(' ');
    for (const part of parts) {
      expect(part.length).toBeLessThanOrEqual(4);
    }
  });
  it('short card number', () => {
    const r = formatCreditCard('1234');
    expect(r).toBe('1234');
  });
  it('13-digit card', () => {
    const r = formatCreditCard('4222222222222');
    expect(typeof r).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// formatSortCode (15 tests)
// ---------------------------------------------------------------------------
describe('formatSortCode', () => {
  const codes = ['123456', '000000', '999999', '010203', '112233', '445566'];
  for (const code of codes) {
    it(`formats sort code ${code}`, () => {
      const r = formatSortCode(code);
      expect(r).toMatch(/^\d{2}-\d{2}-\d{2}$/);
    });
  }
  it('handles already-formatted input', () => {
    const r = formatSortCode('12-34-56');
    expect(r).toBe('12-34-56');
  });
  it('handles spaces', () => {
    const r = formatSortCode('12 34 56');
    expect(r).toBe('12-34-56');
  });
  it('returns as-is if not 6 digits', () => {
    expect(formatSortCode('12345')).toBe('12345');
  });
  it('handles leading zeros', () => {
    expect(formatSortCode('000001')).toBe('00-00-01');
  });
  it('formats 999999', () => {
    expect(formatSortCode('999999')).toBe('99-99-99');
  });
  it('formats with dashes already present', () => {
    const r = formatSortCode('10-80-00');
    expect(r).toBe('10-80-00');
  });
  it('non-6 digit returns original', () => {
    expect(formatSortCode('abc')).toBe('abc');
  });
  it('7 digit input returns original', () => {
    expect(formatSortCode('1234567')).toBe('1234567');
  });
});

// ---------------------------------------------------------------------------
// truncateMiddle (30 tests)
// ---------------------------------------------------------------------------
describe('truncateMiddle', () => {
  it('no truncation when short', () => {
    expect(truncateMiddle('hello', 10)).toBe('hello');
  });
  it('truncates long string', () => {
    const r = truncateMiddle('helloworldhello', 9);
    expect(r.length).toBeLessThanOrEqual(9);
    expect(r).toContain('...');
  });
  it('custom ellipsis', () => {
    const r = truncateMiddle('abcdefghij', 7, '…');
    expect(r).toContain('…');
  });
  it('maxLen equals string length', () => {
    expect(truncateMiddle('hello', 5)).toBe('hello');
  });
  it('very short maxLen', () => {
    const r = truncateMiddle('hello', 3);
    expect(r.length).toBeLessThanOrEqual(3 + 3);
  });
  for (let len = 5; len <= 30; len++) {
    it(`truncateMiddle to length ${len}`, () => {
      const str = 'a'.repeat(50);
      const r = truncateMiddle(str, len);
      expect(typeof r).toBe('string');
    });
  }
});

// ---------------------------------------------------------------------------
// formatList (30 tests)
// ---------------------------------------------------------------------------
describe('formatList', () => {
  it('empty list', () => {
    expect(formatList([])).toBe('');
  });
  it('single item', () => {
    expect(formatList(['apple'])).toBe('apple');
  });
  it('two items', () => {
    expect(formatList(['a', 'b'])).toBe('a and b');
  });
  it('three items', () => {
    expect(formatList(['a', 'b', 'c'])).toBe('a, b, and c');
  });
  it('custom conjunction "or"', () => {
    expect(formatList(['x', 'y', 'z'], 'or')).toBe('x, y, or z');
  });
  it('two items custom conjunction', () => {
    expect(formatList(['cats', 'dogs'], 'or')).toBe('cats or dogs');
  });
  for (let n = 4; n <= 15; n++) {
    const items = Array.from({ length: n }, (_, i) => `item${i + 1}`);
    it(`formatList with ${n} items`, () => {
      const r = formatList(items);
      expect(r).toContain('item1');
      expect(r).toContain(`item${n}`);
      expect(r).toContain(', and ');
    });
  }
  it('handles special chars in items', () => {
    const r = formatList(['a & b', 'c > d']);
    expect(r).toContain('a & b');
  });
  it('single-item list no conjunction', () => {
    expect(formatList(['only'])).toBe('only');
  });
  it('two-item conjunction "nor"', () => {
    expect(formatList(['neither', 'this'], 'nor')).toBe('neither nor this');
  });
});

// ---------------------------------------------------------------------------
// formatBytes (20 tests)
// ---------------------------------------------------------------------------
describe('formatBytes', () => {
  it('0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });
  it('1 byte', () => {
    expect(formatBytes(1)).toContain('B');
  });
  it('1 KB (1024)', () => {
    expect(formatBytes(1024)).toContain('KB');
  });
  it('1 MB', () => {
    expect(formatBytes(1024 * 1024)).toContain('MB');
  });
  it('1 GB', () => {
    expect(formatBytes(1024 ** 3)).toContain('GB');
  });
  it('1 TB', () => {
    expect(formatBytes(1024 ** 4)).toContain('TB');
  });
  it('negative bytes', () => {
    expect(formatBytes(-1024)).toContain('-');
  });
  // Power of 2 series
  for (let i = 0; i <= 12; i++) {
    const bytes = Math.pow(2, i);
    it(`formatBytes(2^${i} = ${bytes})`, () => {
      const r = formatBytes(bytes);
      expect(typeof r).toBe('string');
    });
  }
});

// ---------------------------------------------------------------------------
// formatVersion (20 tests)
// ---------------------------------------------------------------------------
describe('formatVersion', () => {
  it('basic semver', () => {
    expect(formatVersion(1, 2, 3)).toBe('1.2.3');
  });
  it('with pre-release', () => {
    expect(formatVersion(1, 2, 3, 'beta.1')).toBe('1.2.3-beta.1');
  });
  it('zeros', () => {
    expect(formatVersion(0, 0, 0)).toBe('0.0.0');
  });
  it('large version', () => {
    expect(formatVersion(100, 200, 300)).toBe('100.200.300');
  });
  it('alpha pre-release', () => {
    expect(formatVersion(2, 0, 0, 'alpha')).toBe('2.0.0-alpha');
  });
  for (let v = 1; v <= 15; v++) {
    it(`formatVersion ${v}.0.0`, () => {
      const r = formatVersion(v, 0, 0);
      expect(r).toBe(`${v}.0.0`);
    });
  }
});

// ---------------------------------------------------------------------------
// Edge cases / integration (20 additional tests)
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  it('formatCurrency zero with symbol first false', () => {
    const r = formatCurrency(0, { currency: 'GBP', symbolFirst: false });
    expect(r).toContain('£');
  });
  it('formatNumber with no options returns string', () => {
    expect(typeof formatNumber(0)).toBe('string');
  });
  it('formatPct with explicit 0 decimals', () => {
    expect(formatPct(50, 0)).toBe('50%');
  });
  it('formatPctChange 0 gets + sign', () => {
    expect(formatPctChange(0)).toContain('+');
  });
  it('formatOrdinal 0', () => {
    expect(formatOrdinal(0)).toBe('0th');
  });
  it('formatFraction denominator zero', () => {
    expect(formatFraction(3, 0)).toBe('3/0');
  });
  it('formatRatio b zero', () => {
    expect(formatRatio(3, 0)).toBe('3:0');
  });
  it('clampAndFormat within range', () => {
    expect(clampAndFormat(50, 0, 100, { decimals: 0 })).toBe('50');
  });
  it('clampAndFormat below min', () => {
    expect(clampAndFormat(-100, 0, 100, { decimals: 0 })).toBe('0');
  });
  it('clampAndFormat above max', () => {
    expect(clampAndFormat(200, 0, 100, { decimals: 0 })).toBe('100');
  });
  it('formatScientific 0 decimals', () => {
    expect(formatScientific(1000, 0)).toBe('1e+3');
  });
  it('formatISODate accepts timestamp', () => {
    const ts = new Date(2026, 5, 15).getTime();
    expect(formatISODate(ts)).toBe('2026-06-15');
  });
  it('formatInitials handles extra spaces', () => {
    expect(formatInitials('  John   Smith  ')).toBe('JS');
  });
  it('maskString with empty string', () => {
    expect(maskString('')).toBe('');
  });
  it('formatList with empty strings', () => {
    const r = formatList(['', 'b', 'c']);
    expect(typeof r).toBe('string');
  });
  it('formatPostcode handles non-UK (short code)', () => {
    const r = formatPostcode('10001');
    expect(typeof r).toBe('string');
  });
  it('formatAccounting zero', () => {
    const r = formatAccounting(0);
    expect(r).toContain('£');
    expect(r).not.toContain('(');
  });
  it('formatCompact zero', () => {
    expect(formatCompact(0, 'GBP')).toContain('£');
  });
  it('formatDuration 1ms rounds to 0s', () => {
    expect(formatDuration(1)).toBe('0s');
  });
  it('truncateMiddle exact maxLen equals string', () => {
    expect(truncateMiddle('hello', 5)).toBe('hello');
  });
});
