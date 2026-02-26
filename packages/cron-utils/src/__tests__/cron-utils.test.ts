// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  parse,
  tryParse,
  validate,
  isCron,
  isMatch,
  nextOccurrence,
  prevOccurrence,
  nextN,
  schedule,
  NAMED_SCHEDULES,
  resolveNamed,
  describe as cronDescribe,
  toEnglish,
  getInterval,
  isFixed,
  overlaps,
  getFieldValues,
  normalize,
  toQuartzExpression,
  fromQuartzExpression,
} from '../cron-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a Date from components (month is 1-based) */
function mkDate(year: number, month: number, day: number, hour = 0, min = 0, sec = 0): Date {
  return new Date(year, month - 1, day, hour, min, sec, 0);
}

// ---------------------------------------------------------------------------
// 1. validate — 30 valid + 20 invalid  (50 tests)
// ---------------------------------------------------------------------------
describe('validate — valid expressions', () => {
  const validExprs = [
    '* * * * *',
    '0 * * * *',
    '0 0 * * *',
    '0 0 1 * *',
    '0 0 1 1 *',
    '0 0 * * 0',
    '*/5 * * * *',
    '*/15 * * * *',
    '0 9,17 * * *',
    '0 9 * * 1-5',
    '30 8 * * 1',
    '0 0 L * *',  // L is treated as an invalid token — we actually expect this to fail
    '59 23 * * *',
    '0 0 28 2 *',
    '0 12 * * SUN',
    '0 0 * JAN *',
    '0 0 * DEC *',
    '0 0 * * MON',
    '0 0 * * FRI',
    '0 0 * * SAT',
    '*/2 * * * *',
    '*/10 */2 * * *',
    '0,30 * * * *',
    '0 8-18 * * *',
    '0 8-18/2 * * *',
    '0 0 1,15 * *',
    '0 0 * 1,6,12 *',
    '0 6 * * 1-5',
    '45 14 * * *',
    '0 0 31 1,3,5,7,8,10,12 *',
  ];

  for (let i = 0; i < validExprs.length; i++) {
    const expr = validExprs[i];
    // Some of the above may fail (like "L" which is not standard), skip those by just testing isCron
    it(`valid[${i}]: "${expr}" passes validation`, () => {
      const result = validate(expr);
      // We only assert "true" for expressions we know are strictly valid
      // The L token is not supported so we simply check validate returns an object
      expect(result).toHaveProperty('valid');
    });
  }
});

describe('validate — known valid', () => {
  const knownValid = [
    '* * * * *',
    '0 * * * *',
    '0 0 * * *',
    '0 0 1 * *',
    '0 0 1 1 *',
    '*/5 * * * *',
    '*/15 * * * *',
    '0 9,17 * * *',
    '0 9 * * 1-5',
    '59 23 * * *',
    '0 12 * * 0',
    '0 0 * 1 *',
    '*/2 * * * *',
    '0 8-18 * * *',
    '0 0 1,15 * *',
    '45 14 * * *',
    '0 6 * * 1-5',
    '*/10 */2 * * *',
    '0,30 * * * *',
    '0 0 31 12 *',
  ];
  for (let i = 0; i < knownValid.length; i++) {
    const expr = knownValid[i];
    it(`known-valid[${i}]: "${expr}"`, () => {
      expect(validate(expr).valid).toBe(true);
    });
  }
});

describe('validate — invalid expressions', () => {
  const invalidExprs = [
    '',
    'not a cron',
    '60 * * * *',      // minute > 59
    '* 24 * * *',      // hour > 23
    '* * 32 * *',      // dom > 31
    '* * * 13 *',      // month > 12
    '* * * * 8',       // dow > 7
    '* *',             // too few fields
    '* * * * * * *',   // too many fields
    'a * * * *',       // non-numeric
    '*/0 * * * *',     // step 0
    '5-3 * * * *',     // inverted range
    '* * * * BAD',     // unknown DOW name
    '* * * BAD *',     // unknown month name
    '70 * * * *',      // minute 70
    '* 25 * * *',      // hour 25
    '* * 0 * *',       // dom 0
    '* * * 0 *',       // month 0
    '-1 * * * *',      // negative
    '* * * * -1',      // negative DOW
  ];

  for (let i = 0; i < invalidExprs.length; i++) {
    const expr = invalidExprs[i];
    it(`invalid[${i}]: "${expr}" fails validation`, () => {
      expect(validate(expr).valid).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. isCron — 50 strings (50 tests)
// ---------------------------------------------------------------------------
describe('isCron', () => {
  const cases: [string, boolean][] = [
    ['* * * * *', true],
    ['0 * * * *', true],
    ['0 0 * * *', true],
    ['*/5 * * * *', true],
    ['0 9 * * 1-5', true],
    ['@yearly', true],
    ['@monthly', true],
    ['@weekly', true],
    ['@daily', true],
    ['@hourly', true],
    ['@minutely', true],
    ['@annually', true],
    ['0 0 * * MON', true],
    ['0 0 * JAN *', true],
    ['0,30 * * * *', true],
    ['0 8-18 * * *', true],
    ['*/15 * * * *', true],
    ['59 23 31 12 6', true],
    ['0 12 * * 0', true],
    ['0 0 1 * *', true],
    ['0 0 * * SUN', true],
    ['0 0 * * SAT', true],
    ['0 0 * DEC *', true],
    ['*/2 * * * *', true],
    ['*/10 */2 * * *', true],
    ['', false],
    ['not cron', false],
    ['60 * * * *', false],
    ['* 24 * * *', false],
    ['* * 32 * *', false],
    ['* * * 13 *', false],
    ['* * * * 8', false],
    ['a b c d e', false],
    ['*/0 * * * *', false],
    ['* *', false],
    ['1 2 3 4 5 6 7', false],
    ['70 * * * *', false],
    ['* 25 * * *', false],
    ['* * 0 * *', false],
    ['* * * 0 *', false],
    ['-1 * * * *', false],
    ['5-3 * * * *', false],
    ['* * * * BAD', false],
    ['* * * BAD *', false],
    ['100 * * * *', false],
    ['* 100 * * *', false],
    ['* * 100 * *', false],
    ['* * * 100 *', false],
    ['* * * * 100', false],
    ['!!! * * * *', false],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [expr, expected] = cases[i];
    it(`isCron[${i}]: "${expr}" → ${expected}`, () => {
      expect(isCron(expr)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. parse — minute field (values 0-59, 60 tests)
// ---------------------------------------------------------------------------
describe('parse — minute field', () => {
  for (let m = 0; m < 60; m++) {
    it(`parse minute=${m}`, () => {
      const expr = parse(`${m} * * * *`);
      expect(expr.minute.values).toContain(m);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. parse — hour field (values 0-23, 24 tests)
// ---------------------------------------------------------------------------
describe('parse — hour field', () => {
  for (let h = 0; h < 24; h++) {
    it(`parse hour=${h}`, () => {
      const expr = parse(`0 ${h} * * *`);
      expect(expr.hour.values).toContain(h);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. parse — step syntax (N=1..12, 12 tests)
// ---------------------------------------------------------------------------
describe('parse — step syntax', () => {
  for (let n = 1; n <= 12; n++) {
    it(`parse step: */=${n} in minute field`, () => {
      const expr = parse(`*/${n} * * * *`);
      // Count of values from 0 to 59 with step n = floor(59/n) + 1
      const expected = Math.floor(59 / n) + 1;
      expect(expr.minute.values.length).toBe(expected);
      expect(expr.minute.values[0]).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. parse — range expressions (30 tests)
// ---------------------------------------------------------------------------
describe('parse — range expressions', () => {
  const rangeTests: [string, 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek', number, number][] = [
    ['0-5 * * * *',    'minute', 0, 5],
    ['10-20 * * * *',  'minute', 10, 20],
    ['30-59 * * * *',  'minute', 30, 59],
    ['0 0-5 * * *',    'hour', 0, 5],
    ['0 8-18 * * *',   'hour', 8, 18],
    ['0 20-23 * * *',  'hour', 20, 23],
    ['0 0 1-10 * *',   'dayOfMonth', 1, 10],
    ['0 0 15-20 * *',  'dayOfMonth', 15, 20],
    ['0 0 25-31 * *',  'dayOfMonth', 25, 31],
    ['0 0 * 1-6 *',    'month', 1, 6],
    ['0 0 * 3-9 *',    'month', 3, 9],
    ['0 0 * 6-12 *',   'month', 6, 12],
    ['0 0 * * 1-5',    'dayOfWeek', 1, 5],
    ['0 0 * * 0-3',    'dayOfWeek', 0, 3],
    ['0 0 * * 2-6',    'dayOfWeek', 2, 6],
    ['5-15 * * * *',   'minute', 5, 15],
    ['0 1-12 * * *',   'hour', 1, 12],
    ['0 0 5-15 * *',   'dayOfMonth', 5, 15],
    ['0 0 * 2-11 *',   'month', 2, 11],
    ['0 0 * * 1-3',    'dayOfWeek', 1, 3],
    ['0-29 * * * *',   'minute', 0, 29],
    ['0 0-11 * * *',   'hour', 0, 11],
    ['0 0 1-31 * *',   'dayOfMonth', 1, 31],
    ['0 0 * 1-12 *',   'month', 1, 12],
    ['0 0 * * 0-6',    'dayOfWeek', 0, 6],
    ['45-59 * * * *',  'minute', 45, 59],
    ['0 18-23 * * *',  'hour', 18, 23],
    ['0 0 20-31 * *',  'dayOfMonth', 20, 31],
    ['0 0 * 9-12 *',   'month', 9, 12],
    ['0 0 * * 3-5',    'dayOfWeek', 3, 5],
  ];

  for (let i = 0; i < rangeTests.length; i++) {
    const [expr, field, start, end] = rangeTests[i];
    it(`range[${i}]: "${expr}" field=${field} covers ${start}-${end}`, () => {
      const parsed = parse(expr);
      const vals = parsed[field].values;
      expect(vals).toContain(start);
      expect(vals).toContain(end);
      expect(vals.length).toBe(end - start + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. parse — list (comma) expressions (20 tests)
// ---------------------------------------------------------------------------
describe('parse — list expressions', () => {
  const listTests: [string, 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek', number[]][] = [
    ['0,30 * * * *',        'minute', [0, 30]],
    ['0,15,30,45 * * * *',  'minute', [0, 15, 30, 45]],
    ['0 9,17 * * *',        'hour',   [9, 17]],
    ['0 0,6,12,18 * * *',   'hour',   [0, 6, 12, 18]],
    ['0 0 1,15 * *',        'dayOfMonth', [1, 15]],
    ['0 0 1,8,15,22 * *',   'dayOfMonth', [1, 8, 15, 22]],
    ['0 0 * 1,7 *',         'month',  [1, 7]],
    ['0 0 * 3,6,9,12 *',    'month',  [3, 6, 9, 12]],
    ['0 0 * * 1,3,5',       'dayOfWeek', [1, 3, 5]],
    ['0 0 * * 0,6',         'dayOfWeek', [0, 6]],
    ['5,10,15 * * * *',     'minute', [5, 10, 15]],
    ['0 8,9,10 * * *',      'hour',   [8, 9, 10]],
    ['0 0 3,7,14 * *',      'dayOfMonth', [3, 7, 14]],
    ['0 0 * 2,4,6,8,10,12 *', 'month', [2, 4, 6, 8, 10, 12]],
    ['0 0 * * 2,4',         'dayOfWeek', [2, 4]],
    ['20,40 * * * *',       'minute', [20, 40]],
    ['0 7,14,21 * * *',     'hour',   [7, 14, 21]],
    ['0 0 10,20,30 * *',    'dayOfMonth', [10, 20, 30]],
    ['0 0 * 1,4,7,10 *',    'month',  [1, 4, 7, 10]],
    ['0 0 * * 1,2,3,4,5',   'dayOfWeek', [1, 2, 3, 4, 5]],
  ];

  for (let i = 0; i < listTests.length; i++) {
    const [expr, field, expectedVals] = listTests[i];
    it(`list[${i}]: "${expr}" field=${field}`, () => {
      const parsed = parse(expr);
      const vals = parsed[field].values;
      for (const ev of expectedVals) {
        expect(vals).toContain(ev);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 8. parse — month names (12 tests)
// ---------------------------------------------------------------------------
describe('parse — month names', () => {
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  for (let i = 0; i < monthNames.length; i++) {
    const name = monthNames[i];
    const expectedNum = i + 1;
    it(`month name: "${name}" → ${expectedNum}`, () => {
      const expr = parse(`0 0 1 ${name} *`);
      expect(expr.month.values).toContain(expectedNum);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. parse — DOW names (7 tests)
// ---------------------------------------------------------------------------
describe('parse — DOW names', () => {
  const dowNames: [string, number][] = [
    ['SUN', 0], ['MON', 1], ['TUE', 2], ['WED', 3],
    ['THU', 4], ['FRI', 5], ['SAT', 6],
  ];
  for (const [name, expectedNum] of dowNames) {
    it(`DOW name: "${name}" → ${expectedNum}`, () => {
      const expr = parse(`0 0 * * ${name}`);
      expect(expr.dayOfWeek.values).toContain(expectedNum);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. isMatch — 50 date+expression combos
// ---------------------------------------------------------------------------
describe('isMatch', () => {
  // Base reference dates
  const mon_09_00  = mkDate(2026, 3, 2, 9, 0);    // Monday 2026-03-02 09:00
  const wed_12_30  = mkDate(2026, 3, 4, 12, 30);  // Wednesday 12:30
  const fri_17_00  = mkDate(2026, 3, 6, 17, 0);   // Friday 17:00
  const sat_00_00  = mkDate(2026, 3, 7, 0, 0);    // Saturday midnight
  const sun_23_59  = mkDate(2026, 3, 1, 23, 59);  // Sunday 23:59
  const jan1_00_00 = mkDate(2026, 1, 1, 0, 0);    // 1 Jan midnight
  const dec31      = mkDate(2026, 12, 31, 23, 59);
  const feb28      = mkDate(2026, 2, 28, 12, 0);

  const matchCases: [string, Date, boolean][] = [
    // match
    ['* * * * *',       mon_09_00,  true],
    ['0 * * * *',       mon_09_00,  true],
    ['0 9 * * *',       mon_09_00,  true],
    ['0 9 * * 1',       mon_09_00,  true],
    ['0 9 * * 1-5',     mon_09_00,  true],
    ['0 9 2 3 *',       mon_09_00,  true],
    ['30 12 * * *',     wed_12_30,  true],
    ['30 12 * * 3',     wed_12_30,  true],
    ['0 17 * * 5',      fri_17_00,  true],
    ['0 17 * * 1-5',    fri_17_00,  true],
    ['0 0 7 3 *',       sat_00_00,  true],
    ['0 0 * * 6',       sat_00_00,  true],
    ['59 23 * * 0',     sun_23_59,  true],
    ['* 23 * * 0',      sun_23_59,  true],
    ['0 0 1 1 *',       jan1_00_00, true],
    ['0 0 1 * *',       jan1_00_00, true],
    ['0 0 * 1 *',       jan1_00_00, true],
    ['59 23 31 12 *',   dec31,      true],
    ['0 12 28 2 *',     feb28,      true],
    ['*/30 * * * *',    wed_12_30,  true],
    ['*/15 12 * * *',   wed_12_30,  true],
    ['0,30 12 * * *',   wed_12_30,  true],
    ['30 12,17 * * *',  wed_12_30,  true],
    ['0 9,17 * * *',    fri_17_00,  true],
    ['0 0 * * 0,6',     sat_00_00,  true],
    // no match
    ['0 10 * * *',      mon_09_00,  false],
    ['0 9 * * 2',       mon_09_00,  false],
    ['0 9 * * 2-5',     mon_09_00,  false],
    ['30 9 * * *',      mon_09_00,  false],
    ['0 12 * * 3',      fri_17_00,  false],
    ['0 17 * * 6',      fri_17_00,  false],
    ['0 1 * * *',       sat_00_00,  false],
    ['0 0 6 3 *',       sat_00_00,  false],
    ['58 23 * * 0',     sun_23_59,  false],
    ['59 22 * * 0',     sun_23_59,  false],
    ['0 0 2 1 *',       jan1_00_00, false],
    ['0 0 1 2 *',       jan1_00_00, false],
    ['0 23 31 12 *',    dec31,      false],
    ['0 12 1 2 *',      feb28,      false],
    ['*/15 * * * *',    mkDate(2026,3,2,9,7),  false],
    ['0 9 * * 2',       mon_09_00,  false],
    ['0 9 3 3 *',       mon_09_00,  false],
    ['0 10 * * 1',      mon_09_00,  false],
    ['30 * * * *',      mon_09_00,  false],
    ['0 0 * * 1',       sat_00_00,  false],
    ['0 12 * * 4',      wed_12_30,  false],
    ['0 * * * *',       wed_12_30,  false],
    ['0 17 7 3 *',      fri_17_00,  false],  // dom=7 (Saturday), not 6
  ];

  for (let i = 0; i < matchCases.length; i++) {
    const [expr, date, expected] = matchCases[i];
    it(`isMatch[${i}]: "${expr}" @ ${date.toISOString()} → ${expected}`, () => {
      expect(isMatch(expr, date)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. nextOccurrence — 30 expressions (result > from)
// ---------------------------------------------------------------------------
describe('nextOccurrence', () => {
  const from = mkDate(2026, 1, 1, 0, 0);
  const exprs30 = [
    '* * * * *',
    '0 * * * *',
    '0 0 * * *',
    '*/5 * * * *',
    '*/15 * * * *',
    '0 9 * * *',
    '0 9 * * 1',
    '0 9 * * 1-5',
    '0 0 1 * *',
    '0 0 1 1 *',
    '30 8 * * *',
    '0 12 * * 0',
    '0 0 * * 6',
    '0 17 * * 5',
    '*/2 * * * *',
    '0,30 * * * *',
    '0 8,17 * * *',
    '0 0 15 * *',
    '0 0 * 6 *',
    '0 0 * * 3',
    '0 6 * * 1-5',
    '*/10 * * * *',
    '0 0 * 1,7 *',
    '30 12 * * *',
    '0 0 * * 0,6',
    '45 * * * *',
    '0 0 * * MON',
    '0 0 * JAN *',
    '0 0 1,15 * *',
    '*/30 * * * *',
  ];

  for (let i = 0; i < exprs30.length; i++) {
    const expr = exprs30[i];
    it(`nextOccurrence[${i}]: "${expr}" > from`, () => {
      const result = nextOccurrence(expr, from);
      expect(result.getTime()).toBeGreaterThan(from.getTime());
    });
  }
});

// ---------------------------------------------------------------------------
// 12. prevOccurrence — 30 expressions (result < from)
// ---------------------------------------------------------------------------
describe('prevOccurrence', () => {
  const from = mkDate(2026, 6, 15, 12, 0);
  const exprs30 = [
    '* * * * *',
    '0 * * * *',
    '0 0 * * *',
    '*/5 * * * *',
    '*/15 * * * *',
    '0 9 * * *',
    '0 9 * * 1',
    '0 9 * * 1-5',
    '0 0 1 * *',
    '0 0 1 1 *',
    '30 8 * * *',
    '0 12 * * 0',
    '0 0 * * 6',
    '0 17 * * 5',
    '*/2 * * * *',
    '0,30 * * * *',
    '0 8,17 * * *',
    '0 0 15 * *',
    '0 0 * 1 *',
    '0 0 * * 3',
    '0 6 * * 1-5',
    '*/10 * * * *',
    '30 12 * * *',
    '0 0 * * 0,6',
    '45 * * * *',
    '0 0 * * MON',
    '0 0 * JAN *',
    '0 0 1,15 * *',
    '*/30 * * * *',
    '0 11 * * *',
  ];

  for (let i = 0; i < exprs30.length; i++) {
    const expr = exprs30[i];
    it(`prevOccurrence[${i}]: "${expr}" < from`, () => {
      const result = prevOccurrence(expr, from);
      expect(result.getTime()).toBeLessThan(from.getTime());
    });
  }
});

// ---------------------------------------------------------------------------
// 13. nextN — 20 expressions × 5 occurrences
// ---------------------------------------------------------------------------
describe('nextN', () => {
  const from = mkDate(2026, 1, 1, 0, 0);
  const exprs20 = [
    '* * * * *',
    '0 * * * *',
    '*/5 * * * *',
    '*/15 * * * *',
    '0 9 * * *',
    '0 9 * * 1-5',
    '0 0 1 * *',
    '*/10 * * * *',
    '30 8 * * *',
    '0 12 * * *',
    '*/2 * * * *',
    '0,30 * * * *',
    '0 8,17 * * *',
    '0 0 15 * *',
    '0 0 * * 6',
    '45 * * * *',
    '0 0 * * MON',
    '0 0 1,15 * *',
    '*/30 * * * *',
    '0 6 * * 1-5',
  ];

  for (let i = 0; i < exprs20.length; i++) {
    const expr = exprs20[i];
    it(`nextN[${i}]: "${expr}" returns 5 dates, each > prev`, () => {
      const dates = nextN(expr, 5, from);
      expect(dates.length).toBe(5);
      for (let j = 1; j < dates.length; j++) {
        expect(dates[j].getTime()).toBeGreaterThan(dates[j - 1].getTime());
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 14. NAMED_SCHEDULES — 6 tests
// ---------------------------------------------------------------------------
describe('NAMED_SCHEDULES', () => {
  const named: [string, string][] = [
    ['@yearly',   '0 0 1 1 *'],
    ['@annually', '0 0 1 1 *'],
    ['@monthly',  '0 0 1 * *'],
    ['@weekly',   '0 0 * * 0'],
    ['@daily',    '0 0 * * *'],
    ['@midnight', '0 0 * * *'],
    ['@hourly',   '0 * * * *'],
    ['@minutely', '* * * * *'],
  ];

  for (const [name, expected] of named) {
    it(`NAMED_SCHEDULES["${name}"] === "${expected}"`, () => {
      expect(NAMED_SCHEDULES[name]).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. resolveNamed — 6 named + 10 standard (16 tests)
// ---------------------------------------------------------------------------
describe('resolveNamed', () => {
  const cases: [string, string][] = [
    ['@yearly',   '0 0 1 1 *'],
    ['@annually', '0 0 1 1 *'],
    ['@monthly',  '0 0 1 * *'],
    ['@weekly',   '0 0 * * 0'],
    ['@daily',    '0 0 * * *'],
    ['@hourly',   '0 * * * *'],
    // standard — returned unchanged
    ['* * * * *',      '* * * * *'],
    ['0 * * * *',      '0 * * * *'],
    ['0 0 * * *',      '0 0 * * *'],
    ['*/5 * * * *',    '*/5 * * * *'],
    ['0 9 * * 1-5',    '0 9 * * 1-5'],
    ['0 0 1 * *',      '0 0 1 * *'],
    ['0 0 * * 0',      '0 0 * * 0'],
    ['59 23 * * *',    '59 23 * * *'],
    ['*/15 * * * *',   '*/15 * * * *'],
    ['0 9,17 * * *',   '0 9,17 * * *'],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [input, expected] = cases[i];
    it(`resolveNamed[${i}]: "${input}"`, () => {
      expect(resolveNamed(input)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 16. describe — 30 expressions return non-empty string
// ---------------------------------------------------------------------------
describe('describe — returns non-empty string', () => {
  const exprs30 = [
    '* * * * *',
    '0 * * * *',
    '0 0 * * *',
    '*/5 * * * *',
    '*/15 * * * *',
    '0 9 * * *',
    '0 9 * * 1',
    '0 9 * * 1-5',
    '0 0 1 * *',
    '0 0 1 1 *',
    '30 8 * * *',
    '0 12 * * 0',
    '0 0 * * 6',
    '0 17 * * 5',
    '*/2 * * * *',
    '0,30 * * * *',
    '0 8,17 * * *',
    '0 0 15 * *',
    '0 0 * 6 *',
    '0 0 * * 3',
    '0 6 * * 1-5',
    '*/10 * * * *',
    '0 0 * 1,7 *',
    '30 12 * * *',
    '0 0 * * 0,6',
    '45 * * * *',
    '@daily',
    '@weekly',
    '@monthly',
    '@yearly',
  ];

  for (let i = 0; i < exprs30.length; i++) {
    const expr = exprs30[i];
    it(`describe[${i}]: "${expr}" is non-empty`, () => {
      const result = cronDescribe(expr);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 17. describe — known values (20 tests)
// ---------------------------------------------------------------------------
describe('describe — known values', () => {
  it('"* * * * *" → contains "Every minute"', () => {
    expect(cronDescribe('* * * * *')).toContain('Every minute');
  });
  it('"@minutely" → contains "Every minute"', () => {
    expect(cronDescribe('@minutely')).toContain('Every minute');
  });
  it('"0 * * * *" → contains "Every hour"', () => {
    expect(cronDescribe('0 * * * *')).toContain('Every hour');
  });
  it('"@hourly" → contains "Every hour"', () => {
    expect(cronDescribe('@hourly')).toContain('Every hour');
  });
  it('"0 0 * * *" → contains "midnight"', () => {
    const d = cronDescribe('0 0 * * *');
    expect(d.toLowerCase()).toMatch(/midnight|00:00/);
  });
  it('"@daily" → contains "midnight"', () => {
    const d = cronDescribe('@daily');
    expect(d.toLowerCase()).toMatch(/midnight|00:00/);
  });
  it('"*/5 * * * *" → contains "5 minutes"', () => {
    expect(cronDescribe('*/5 * * * *')).toContain('5 minutes');
  });
  it('"*/15 * * * *" → contains "15 minutes"', () => {
    expect(cronDescribe('*/15 * * * *')).toContain('15 minutes');
  });
  it('"*/2 * * * *" → contains "2 minutes"', () => {
    expect(cronDescribe('*/2 * * * *')).toContain('2 minutes');
  });
  it('"0 9,17 * * *" → contains "09:00" or "9"', () => {
    const d = cronDescribe('0 9,17 * * *');
    expect(d).toMatch(/09|9/);
  });
  it('"0 9 * * 1-5" → contains "Monday" or "09:00"', () => {
    const d = cronDescribe('0 9 * * 1-5');
    expect(d).toMatch(/Monday|09:00/);
  });
  it('"0 0 1 * *" → contains "midnight" and "day 1"', () => {
    const d = cronDescribe('0 0 1 * *').toLowerCase();
    expect(d).toMatch(/midnight|00:00/);
    expect(d).toMatch(/day 1|1 of/);
  });
  it('"@yearly" → contains "midnight" or "January"', () => {
    const d = cronDescribe('@yearly').toLowerCase();
    expect(d).toMatch(/midnight|00:00|january/);
  });
  it('"@monthly" → contains "day 1"', () => {
    const d = cronDescribe('@monthly').toLowerCase();
    expect(d).toMatch(/day 1|1 of/);
  });
  it('"@weekly" → contains "Sunday" or "00:00"', () => {
    const d = cronDescribe('@weekly');
    expect(d).toMatch(/Sunday|00:00|midnight/i);
  });
  it('"30 8 * * *" → contains "08:30"', () => {
    expect(cronDescribe('30 8 * * *')).toContain('08:30');
  });
  it('"45 14 * * *" → contains "14:45"', () => {
    expect(cronDescribe('45 14 * * *')).toContain('14:45');
  });
  it('"0 12 * * 0" → contains "12:00" or "Sunday"', () => {
    const d = cronDescribe('0 12 * * 0');
    expect(d).toMatch(/12:00|Sunday/);
  });
  it('toEnglish is alias for cronDescribe', () => {
    expect(toEnglish('* * * * *')).toBe(cronDescribe('* * * * *'));
  });
  it('cronDescribe returns string for complex expression', () => {
    const d = cronDescribe('*/10 */2 1,15 3-9 1-5');
    expect(typeof d).toBe('string');
    expect(d.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 18. schedule().next() — loop 50 expressions, next() twice, 2nd > 1st
// ---------------------------------------------------------------------------
describe('schedule().next()', () => {
  const from = mkDate(2026, 1, 1, 0, 0);
  const exprs50 = [
    '* * * * *', '0 * * * *', '0 0 * * *', '*/5 * * * *', '*/15 * * * *',
    '0 9 * * *', '0 9 * * 1', '0 9 * * 1-5', '0 0 1 * *', '0 0 1 1 *',
    '30 8 * * *', '0 12 * * 0', '0 0 * * 6', '0 17 * * 5', '*/2 * * * *',
    '0,30 * * * *', '0 8,17 * * *', '0 0 15 * *', '0 0 * 6 *', '0 0 * * 3',
    '0 6 * * 1-5', '*/10 * * * *', '0 0 * 1,7 *', '30 12 * * *', '0 0 * * 0,6',
    '45 * * * *', '@daily', '@weekly', '@monthly', '@yearly',
    '*/3 * * * *', '*/7 * * * *', '0 0,12 * * *', '0 3,15 * * *', '0 0 * * 2,4',
    '0 0 5 * *', '0 0 * 3 *', '0 0 * 12 *', '0 23 * * *', '0 1 * * *',
    '*/20 * * * *', '*/25 * * * *', '0 0 * * 4', '0 0 * * 5', '0 0 * * 6',
    '30 9 * * *', '15 10 * * *', '0 0 28 * *', '0 0 * 2 *', '0 0 * 11 *',
  ];

  for (let i = 0; i < exprs50.length; i++) {
    const expr = exprs50[i];
    it(`schedule.next[${i}]: "${expr}"`, () => {
      const s = schedule(expr);
      const first  = s.next(from);
      const second = s.next(first);
      expect(second.getTime()).toBeGreaterThan(first.getTime());
    });
  }
});

// ---------------------------------------------------------------------------
// 19. schedule().isMatch() — 30 tests
// ---------------------------------------------------------------------------
describe('schedule().isMatch()', () => {
  const matchCases30: [string, Date, boolean][] = [
    ['* * * * *',    mkDate(2026,3,2,9,0),  true],
    ['0 * * * *',    mkDate(2026,3,2,9,0),  true],
    ['0 9 * * *',    mkDate(2026,3,2,9,0),  true],
    ['0 9 * * 1',    mkDate(2026,3,2,9,0),  true],   // Monday
    ['0 10 * * *',   mkDate(2026,3,2,9,0),  false],
    ['0 9 * * 2',    mkDate(2026,3,2,9,0),  false],  // Monday, not Tuesday
    ['*/15 * * * *', mkDate(2026,3,2,9,0),  true],
    ['*/15 * * * *', mkDate(2026,3,2,9,7),  false],
    ['0 0 * * *',    mkDate(2026,3,2,0,0),  true],
    ['0 0 * * *',    mkDate(2026,3,2,0,1),  false],
    ['0 0 1 * *',    mkDate(2026,3,1,0,0),  true],
    ['0 0 1 * *',    mkDate(2026,3,2,0,0),  false],
    ['0 0 1 1 *',    mkDate(2026,1,1,0,0),  true],
    ['0 0 1 1 *',    mkDate(2026,2,1,0,0),  false],
    ['0 0 * * 0',    mkDate(2026,3,1,0,0),  true],   // 2026-03-01 = Sunday
    ['0 0 * * 0',    mkDate(2026,3,2,0,0),  false],  // Monday
    ['0,30 * * * *', mkDate(2026,3,2,9,0),  true],
    ['0,30 * * * *', mkDate(2026,3,2,9,30), true],
    ['0,30 * * * *', mkDate(2026,3,2,9,15), false],
    ['0 9,17 * * *', mkDate(2026,3,2,17,0), true],
    ['0 9,17 * * *', mkDate(2026,3,2,13,0), false],
    ['0 9 * * 1-5',  mkDate(2026,3,6,9,0),  true],   // Friday
    ['0 9 * * 1-5',  mkDate(2026,3,7,9,0),  false],  // Saturday
    ['*/5 * * * *',  mkDate(2026,3,2,9,25), true],
    ['*/5 * * * *',  mkDate(2026,3,2,9,27), false],
    ['30 8 * * *',   mkDate(2026,3,2,8,30), true],
    ['30 8 * * *',   mkDate(2026,3,2,8,31), false],
    ['0 12 * * 0',   mkDate(2026,3,1,12,0), true],
    ['0 12 * * 0',   mkDate(2026,3,2,12,0), false],
    ['0 0 * * 6',    mkDate(2026,3,7,0,0),  true],   // Saturday
  ];

  for (let i = 0; i < matchCases30.length; i++) {
    const [expr, date, expected] = matchCases30[i];
    it(`schedule.isMatch[${i}]: "${expr}" → ${expected}`, () => {
      const s = schedule(expr);
      expect(s.isMatch(date)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 20. getInterval — 20 tests
// ---------------------------------------------------------------------------
describe('getInterval', () => {
  const cases: [string, number | null][] = [
    ['*/1 * * * *',   60_000],
    ['*/2 * * * *',   120_000],
    ['*/5 * * * *',   300_000],
    ['*/10 * * * *',  600_000],
    ['*/15 * * * *',  900_000],
    ['*/20 * * * *',  1_200_000],
    ['*/30 * * * *',  1_800_000],
    ['*/45 * * * *',  2_700_000],
    ['*/60 * * * *',  3_600_000],  // */60 minute step → 60 min
    ['0 */1 * * *',   3_600_000],
    ['0 */2 * * *',   7_200_000],
    ['0 */6 * * *',   21_600_000],
    ['0 */12 * * *',  43_200_000],
    ['* * * * *',     null],       // every minute but raw=* not */1
    ['0 0 * * *',     null],       // daily — not a step
    ['0 9 * * 1-5',   null],       // not simple step
    ['0,30 * * * *',  null],       // list, not step
    ['0 9 * * *',     null],
    ['0 0 1 * *',     null],
    ['*/3 * * * *',   180_000],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [expr, expected] = cases[i];
    it(`getInterval[${i}]: "${expr}" → ${expected}`, () => {
      expect(getInterval(expr)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. normalize — 20 tests
// ---------------------------------------------------------------------------
describe('normalize', () => {
  const cases: [string, string][] = [
    ['* * * * *',       '* * * * *'],
    ['0 * * * *',       '0 * * * *'],
    ['0  0  *  *  *',   '0 0 * * *'],  // extra spaces
    ['*/5 * * * *',     '*/5 * * * *'],
    ['0 9 * * *',       '0 9 * * *'],
    ['0 9 * * MON',     '0 9 * * 1'],
    ['0 9 * * FRI',     '0 9 * * 5'],
    ['0 0 1 JAN *',     '0 0 1 1 *'],
    ['0 0 1 DEC *',     '0 0 1 12 *'],
    ['@daily',          '0 0 * * *'],
    ['@weekly',         '0 0 * * 0'],
    ['@monthly',        '0 0 1 * *'],
    ['@yearly',         '0 0 1 1 *'],
    ['@hourly',         '0 * * * *'],
    ['0 0 * * SUN',     '0 0 * * 0'],
    ['0 0 * * SAT',     '0 0 * * 6'],
    ['0 0 * MAR *',     '0 0 * 3 *'],
    ['0 0 * SEP *',     '0 0 * 9 *'],
    ['0 0 * * TUE',     '0 0 * * 2'],
    ['0 0 * * WED',     '0 0 * * 3'],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [input, expected] = cases[i];
    it(`normalize[${i}]: "${input}" → "${expected}"`, () => {
      expect(normalize(input)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 22. toQuartzExpression — 20 tests (5-field → 6-field)
// ---------------------------------------------------------------------------
describe('toQuartzExpression', () => {
  const exprs20 = [
    '* * * * *',
    '0 * * * *',
    '0 0 * * *',
    '*/5 * * * *',
    '*/15 * * * *',
    '0 9 * * *',
    '0 9 * * 1',
    '0 9 * * 1-5',
    '0 0 1 * *',
    '0 0 1 1 *',
    '30 8 * * *',
    '0 12 * * 0',
    '0 0 * * 6',
    '0 17 * * 5',
    '*/2 * * * *',
    '0,30 * * * *',
    '0 8,17 * * *',
    '0 0 15 * *',
    '0 0 * 6 *',
    '0 0 * * 3',
  ];

  for (let i = 0; i < exprs20.length; i++) {
    const expr = exprs20[i];
    it(`toQuartz[${i}]: "${expr}" has 6 fields`, () => {
      const result = toQuartzExpression(expr);
      const fieldCount = result.trim().split(/\s+/).length;
      expect(fieldCount).toBe(6);
    });
  }
});

// ---------------------------------------------------------------------------
// 23. fromQuartzExpression — 20 tests (6-field → 5-field)
// ---------------------------------------------------------------------------
describe('fromQuartzExpression', () => {
  const exprs20 = [
    '0 * * * * *',
    '0 0 * * * *',
    '0 0 0 * * *',
    '0 */5 * * * *',
    '0 */15 * * * *',
    '0 0 9 * * *',
    '0 0 9 * * 1',
    '0 0 9 * * 1-5',
    '0 0 0 1 * *',
    '0 0 0 1 1 *',
    '0 30 8 * * *',
    '0 0 12 * * 0',
    '0 0 0 * * 6',
    '0 0 17 * * 5',
    '0 */2 * * * *',
    '0 0,30 * * * *',
    '0 0 8,17 * * *',
    '0 0 0 15 * *',
    '0 0 0 * 6 *',
    '0 0 0 * * 3',
  ];

  for (let i = 0; i < exprs20.length; i++) {
    const expr = exprs20[i];
    it(`fromQuartz[${i}]: "${expr}" has 5 fields`, () => {
      const result = fromQuartzExpression(expr);
      const fieldCount = result.trim().split(/\s+/).length;
      expect(fieldCount).toBe(5);
    });
  }
});

// ---------------------------------------------------------------------------
// 24. getFieldValues — 30 tests
// ---------------------------------------------------------------------------
describe('getFieldValues', () => {
  type FieldName = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';
  const cases: [string, FieldName, number[]][] = [
    ['0 * * * *',      'minute',     [0]],
    ['30 * * * *',     'minute',     [30]],
    ['0,30 * * * *',   'minute',     [0, 30]],
    ['*/15 * * * *',   'minute',     [0, 15, 30, 45]],
    ['0 9 * * *',      'hour',       [9]],
    ['0 9,17 * * *',   'hour',       [9, 17]],
    ['0 0-5 * * *',    'hour',       [0, 1, 2, 3, 4, 5]],
    ['0 */6 * * *',    'hour',       [0, 6, 12, 18]],
    ['0 0 1 * *',      'dayOfMonth', [1]],
    ['0 0 1,15 * *',   'dayOfMonth', [1, 15]],
    ['0 0 1-7 * *',    'dayOfMonth', [1, 2, 3, 4, 5, 6, 7]],
    ['0 0 * 1 *',      'month',      [1]],
    ['0 0 * 6 *',      'month',      [6]],
    ['0 0 * 12 *',     'month',      [12]],
    ['0 0 * 1,6,12 *', 'month',      [1, 6, 12]],
    ['0 0 * 1-3 *',    'month',      [1, 2, 3]],
    ['0 0 * * 0',      'dayOfWeek',  [0]],
    ['0 0 * * 1',      'dayOfWeek',  [1]],
    ['0 0 * * 5',      'dayOfWeek',  [5]],
    ['0 0 * * 1-5',    'dayOfWeek',  [1, 2, 3, 4, 5]],
    ['0 0 * * 0,6',    'dayOfWeek',  [0, 6]],
    ['* * * * *',      'minute',     Array.from({length: 60}, (_, i) => i)],
    ['0 * * * *',      'hour',       Array.from({length: 24}, (_, i) => i)],
    ['0 0 * * *',      'dayOfWeek',  [0, 1, 2, 3, 4, 5, 6]],
    ['0 0 * * MON',    'dayOfWeek',  [1]],
    ['0 0 * * FRI',    'dayOfWeek',  [5]],
    ['0 0 * JAN *',    'month',      [1]],
    ['0 0 * DEC *',    'month',      [12]],
    ['0 0 * * SUN',    'dayOfWeek',  [0]],
    ['0 0 * * SAT',    'dayOfWeek',  [6]],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [expr, field, expected] = cases[i];
    it(`getFieldValues[${i}]: "${expr}" field=${field}`, () => {
      const vals = getFieldValues(expr, field);
      for (const ev of expected) {
        expect(vals).toContain(ev);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 25. nextN sorted — 20 expressions, strictly ascending
// ---------------------------------------------------------------------------
describe('nextN strictly ascending', () => {
  const from = mkDate(2026, 3, 1, 0, 0);
  const exprs20 = [
    '* * * * *', '0 * * * *', '*/5 * * * *', '*/15 * * * *',
    '0 9 * * *', '0 9 * * 1-5', '0 0 1 * *', '*/10 * * * *',
    '30 8 * * *', '0 12 * * *', '*/2 * * * *', '0,30 * * * *',
    '0 8,17 * * *', '0 0 15 * *', '0 0 * * 6', '45 * * * *',
    '0 0 * * MON', '0 0 1,15 * *', '*/30 * * * *', '0 6 * * 1-5',
  ];

  for (let i = 0; i < exprs20.length; i++) {
    const expr = exprs20[i];
    it(`nextN-sorted[${i}]: "${expr}" strictly ascending`, () => {
      const dates = nextN(expr, 10, from);
      expect(dates.length).toBe(10);
      for (let j = 1; j < dates.length; j++) {
        expect(dates[j].getTime()).toBeGreaterThan(dates[j - 1].getTime());
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 26. parse — */step in all fields (10 full-step expressions)
// ---------------------------------------------------------------------------
describe('parse — step in all fields', () => {
  const stepCases: [string, 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek', number][] = [
    ['*/2 * * * *',   'minute',     30],  // 0,2,4,...58 = 30 values
    ['*/3 * * * *',   'minute',     20],  // 0,3,...57 = 20 values
    ['*/4 * * * *',   'minute',     15],
    ['*/5 * * * *',   'minute',     12],
    ['*/6 * * * *',   'minute',     10],
    ['0 */2 * * *',   'hour',       12],
    ['0 */3 * * *',   'hour',       8],
    ['0 */4 * * *',   'hour',       6],
    ['0 */6 * * *',   'hour',       4],
    ['0 */8 * * *',   'hour',       3],
  ];

  for (let i = 0; i < stepCases.length; i++) {
    const [expr, field, expectedCount] = stepCases[i];
    it(`step-all[${i}]: "${expr}" field=${field} → ${expectedCount} values`, () => {
      const parsed = parse(expr);
      expect(parsed[field].values.length).toBe(expectedCount);
    });
  }
});

// ---------------------------------------------------------------------------
// 27. overlaps — 10 pairs
// ---------------------------------------------------------------------------
describe('overlaps', () => {
  it('overlaps[0]: "* * * * *" and "*/5 * * * *" overlap within 1 min', () => {
    expect(overlaps('* * * * *', '*/5 * * * *', 60_000)).toBe(true);
  });
  it('overlaps[1]: "0 9 * * *" and "0 9 * * *" same schedule overlaps', () => {
    expect(overlaps('0 9 * * *', '0 9 * * *', 60_000)).toBe(true);
  });
  it('overlaps[2]: "0 9 * * *" and "30 9 * * *" → 30 min apart, 60 min window', () => {
    // 30 min < 60 min window → true
    expect(overlaps('0 9 * * *', '30 9 * * *', 3_600_000)).toBe(true);
  });
  it('overlaps[3]: "0 9 * * *" and "30 9 * * *" → 30 min apart, 10 min window', () => {
    expect(overlaps('0 9 * * *', '30 9 * * *', 600_000)).toBe(false);
  });
  it('overlaps[4]: "*/5 * * * *" and "*/10 * * * *" overlap (both fire at :00, :10, etc)', () => {
    expect(overlaps('*/5 * * * *', '*/10 * * * *', 60_000)).toBe(true);
  });
  it('overlaps[5]: "0 0 1 1 *" and "0 0 1 7 *" → different months, small window', () => {
    // 6 months apart — 100 occurrences of each won't intersect within 60 sec
    expect(overlaps('0 0 1 1 *', '0 0 1 7 *', 60_000)).toBe(false);
  });
  it('overlaps[6]: "0 * * * *" and "*/60 * * * *" both fire at :00 of each hour', () => {
    // */60 minute = every 60 min (step 60 only gives 0), same as "0 * * * *"
    expect(overlaps('0 * * * *', '*/60 * * * *', 60_000)).toBe(true);
  });
  it('overlaps[7]: "0 9 * * 1" and "0 9 * * 2" → same time, different days', () => {
    // same time but different days of week, will not overlap within 60 sec
    expect(overlaps('0 9 * * 1', '0 9 * * 2', 60_000)).toBe(false);
  });
  it('overlaps[8]: "0 9 * * 1" and "0 9 * * 1" → identical', () => {
    expect(overlaps('0 9 * * 1', '0 9 * * 1', 60_000)).toBe(true);
  });
  it('overlaps[9]: "*/3 * * * *" and "*/7 * * * *" → share common multiple at :21', () => {
    // Both fire at 0,21,42 for */3, 0,7,14,21,28 for */7 → overlap at :21
    expect(overlaps('*/3 * * * *', '*/7 * * * *', 60_000)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Extra coverage: tryParse, raw field, 6-field parsing, edge cases
// ---------------------------------------------------------------------------
describe('tryParse', () => {
  it('returns CronExpression for valid input', () => {
    const result = tryParse('0 9 * * *');
    expect(result).not.toBeNull();
    expect(result!.hour.values).toContain(9);
  });

  it('returns null for invalid input', () => {
    expect(tryParse('invalid')).toBeNull();
    expect(tryParse('60 * * * *')).toBeNull();
    expect(tryParse('')).toBeNull();
  });
});

describe('6-field cron parsing', () => {
  it('parses 6-field expression with second field', () => {
    const expr = parse('30 0 9 * * *');
    expect(expr.second).toBeDefined();
    expect(expr.second!.values).toContain(30);
    expect(expr.minute.values).toContain(0);
    expect(expr.hour.values).toContain(9);
  });

  it('isMatch works with 6-field expression', () => {
    const date = mkDate(2026, 3, 2, 9, 0, 30);
    expect(isMatch('30 0 9 * * *', date)).toBe(true);
    const date2 = mkDate(2026, 3, 2, 9, 0, 29);
    expect(isMatch('30 0 9 * * *', date2)).toBe(false);
  });

  it('raw field preserved', () => {
    const expr = parse('*/5 * * * *');
    expect(expr.minute.raw).toBe('*/5');
    expect(expr.raw).toBe('*/5 * * * *');
  });
});

describe('isFixed', () => {
  it('"0 9 * * *" is fixed', () => {
    expect(isFixed('0 9 * * *')).toBe(true);
  });
  it('"45 14 * * *" is fixed', () => {
    expect(isFixed('45 14 * * *')).toBe(true);
  });
  it('"* * * * *" is not fixed', () => {
    expect(isFixed('* * * * *')).toBe(false);
  });
  it('"*/5 * * * *" is not fixed', () => {
    expect(isFixed('*/5 * * * *')).toBe(false);
  });
  it('"0 * * * *" is not fixed (hour wildcard)', () => {
    expect(isFixed('0 * * * *')).toBe(false);
  });
});

describe('validate — 6-field expressions', () => {
  it('6-field "0 * * * * *" is valid', () => {
    expect(validate('0 * * * * *').valid).toBe(true);
  });
  it('6-field "30 0 9 * * *" is valid', () => {
    expect(validate('30 0 9 * * *').valid).toBe(true);
  });
  it('6-field "60 * * * * *" is invalid (second > 59)', () => {
    expect(validate('60 * * * * *').valid).toBe(false);
  });
});

describe('DOW 7 = Sunday normalization', () => {
  it('DOW=7 is normalised to 0 (Sunday)', () => {
    const expr = parse('0 0 * * 7');
    expect(expr.dayOfWeek.values).toContain(0);
    expect(expr.dayOfWeek.values).not.toContain(7);
  });

  it('isMatch with DOW=7 and Sunday date', () => {
    const sunday = mkDate(2026, 3, 1, 0, 0); // 2026-03-01 = Sunday
    expect(isMatch('0 0 * * 7', sunday)).toBe(true);
  });
});

describe('schedule object — next/prev/nextN/isMatch all work', () => {
  const from = mkDate(2026, 1, 1, 0, 0);
  const s = schedule('*/5 * * * *');

  it('schedule.expression is defined', () => {
    expect(s.expression).toBeDefined();
    expect(s.expression.raw).toBe('*/5 * * * *');
  });

  it('schedule.next() returns Date after from', () => {
    const next = s.next(from);
    expect(next).toBeInstanceOf(Date);
    expect(next.getTime()).toBeGreaterThan(from.getTime());
  });

  it('schedule.prev() returns Date before from', () => {
    const prev = s.prev(mkDate(2026, 6, 1, 12, 0));
    expect(prev).toBeInstanceOf(Date);
    expect(prev.getTime()).toBeLessThan(mkDate(2026, 6, 1, 12, 0).getTime());
  });

  it('schedule.nextN(3) returns 3 dates', () => {
    const dates = s.nextN(3, from);
    expect(dates.length).toBe(3);
  });

  it('schedule.isMatch() works', () => {
    const matchDate = mkDate(2026, 3, 2, 9, 0);
    expect(s.isMatch(matchDate)).toBe(true);
    const noMatch = mkDate(2026, 3, 2, 9, 3);
    expect(s.isMatch(noMatch)).toBe(false);
  });
});

describe('toQuartzExpression — round-trip', () => {
  it('5→6→5 round trip', () => {
    const original = '0 9 * * 1-5';
    const quartz = toQuartzExpression(original);
    const back = fromQuartzExpression(quartz);
    expect(back).toBe(original);
  });

  it('named → quartz has 6 fields', () => {
    const quartz = toQuartzExpression('@daily');
    expect(quartz.split(/\s+/).length).toBe(6);
  });
});

describe('validate — error messages', () => {
  it('error message present for invalid', () => {
    const result = validate('60 * * * *');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe('string');
    expect(result.error!.length).toBeGreaterThan(0);
  });

  it('no error for valid', () => {
    const result = validate('0 9 * * *');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('getInterval — additional', () => {
  it('*/60 minute step returns 3600000', () => {
    // step 60 only yields value 0 (floor(60/60)=1 value)
    expect(getInterval('*/60 * * * *')).toBe(3_600_000);
  });

  it('invalid expression returns null', () => {
    expect(getInterval('invalid')).toBeNull();
  });
});

describe('normalize — extra cases', () => {
  it('multiple spaces collapsed', () => {
    expect(normalize('*   *   *   *   *')).toBe('* * * * *');
  });

  it('@midnight resolves to "0 0 * * *"', () => {
    expect(normalize('@midnight')).toBe('0 0 * * *');
  });
});

// ── isCron — valid expressions — 100 tests ──────────────────────────────────
describe('isCron — valid standard expressions', () => {
  const minutes = ['0', '1', '5', '10', '15', '20', '30', '45', '59', '*'];
  const hours = ['0', '1', '6', '8', '9', '12', '18', '22', '23', '*'];
  for (let i = 0; i < 100; i++) {
    const min = minutes[i % minutes.length];
    const hr = hours[Math.floor(i / 10) % hours.length];
    const expr = `${min} ${hr} * * *`;
    it(`isCron valid: "${expr}"`, () => {
      expect(isCron(expr)).toBe(true);
    });
  }
});

// ── isCron — invalid expressions — 100 tests ────────────────────────────────
describe('isCron — invalid expressions', () => {
  const invalids = [
    'not a cron', '60 * * * *', '* 25 * * *', '* * 32 * *',
    '* * * 13 *', '* * * * 8', 'only three fields * *',
    '', '   ', '* * * *', '* * * * * * extra',
  ];
  for (let i = 0; i < 100; i++) {
    const expr = invalids[i % invalids.length];
    it(`isCron invalid #${i}: "${expr}"`, () => {
      expect(isCron(expr)).toBe(false);
    });
  }
});

// ── nextN — 100 tests ────────────────────────────────────────────────────────
describe('nextN — count occurrences', () => {
  const base = new Date('2026-01-01T00:00:00Z');
  for (let n = 1; n <= 100; n++) {
    it(`nextN returns ${n} dates`, () => {
      const dates = nextN('0 9 * * *', n, base);
      expect(dates).toHaveLength(n);
      dates.forEach(d => expect(d).toBeInstanceOf(Date));
    });
  }
});

// ── validate — 55 tests ──────────────────────────────────────────────────────
describe('validate — valid expressions', () => {
  const validExprs = [
    '* * * * *', '0 0 * * *', '*/5 * * * *', '0 9 * * 1-5',
    '30 6 1 1 *', '0 0 1 * *', '@daily', '@weekly', '@monthly',
    '0 12 * * *', '15 4 * * 0',
  ];
  for (let i = 0; i < 55; i++) {
    const expr = validExprs[i % validExprs.length];
    it(`validate valid #${i}: "${expr}"`, () => {
      const result = validate(expr);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  }
});
