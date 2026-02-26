// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  isWeekday,
  isWeekend,
  addBusinessDays,
  subtractBusinessDays,
  businessDaysBetween,
  nextBusinessDay,
  previousBusinessDay,
  isPublicHoliday,
  addBusinessDaysWithHolidays,
  isWithinWorkingHours,
  nextWorkingTime,
  minutesUntilNextWorkingTime,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  addHours,
  addMinutes,
  addSeconds,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameMonth,
  isSameYear,
  isBefore,
  isAfter,
  isBetween,
  daysBetween,
  hoursBetween,
  minutesBetween,
  age,
  generateRecurrence,
  nextOccurrence,
  getDayOfYear,
  getWeekOfYear,
  getDaysInMonth,
  isLeapYear,
  formatDuration,
  parseDuration,
  toUtcMidnight,
} from '../time-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a local Date without worrying about time component. */
function d(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

/** Build a local Date with time. */
function dt(year: number, month: number, day: number, h: number, m: number, s = 0): Date {
  return new Date(year, month - 1, day, h, m, s, 0);
}

// Monday 2026-01-05 (known weekday)
const MON = d(2026, 1, 5);
// Tuesday 2026-01-06
const TUE = d(2026, 1, 6);
// Saturday 2026-01-03
const SAT = d(2026, 1, 3);
// Sunday 2026-01-04
const SUN = d(2026, 1, 4);

const WORK_HOURS = {
  start: '09:00',
  end: '17:00',
  days: [1, 2, 3, 4, 5] as const,
} as const;

// ---------------------------------------------------------------------------
// BLOCK 1: addDays loop — 100 tests (i = 0..99)
// ---------------------------------------------------------------------------
describe('addDays — 100 loop tests', () => {
  const base = d(2026, 1, 5); // 2026-01-05
  for (let i = 0; i < 100; i++) {
    it(`addDays(base, ${i}) advances date by ${i} days`, () => {
      const result = addDays(base, i);
      const expected = new Date(base.getTime() + i * 86_400_000);
      expect(result.getFullYear()).toBe(expected.getFullYear());
      expect(result.getMonth()).toBe(expected.getMonth());
      expect(result.getDate()).toBe(expected.getDate());
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 2: addBusinessDays loop — 100 tests (i = 0..99)
// ---------------------------------------------------------------------------
describe('addBusinessDays — 100 loop tests', () => {
  // Use Monday 2026-01-05 as fixed base
  const base = d(2026, 1, 5);
  for (let i = 0; i < 100; i++) {
    it(`addBusinessDays(base, ${i}) result is a weekday`, () => {
      const result = addBusinessDays(base, i);
      if (i === 0) {
        // Adding 0 business days keeps the same date
        expect(result.getTime()).toBe(base.getTime());
      } else {
        expect(isWeekday(result)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 3: daysBetween loop — 100 tests (i = 1..100)
// ---------------------------------------------------------------------------
describe('daysBetween — 100 loop tests', () => {
  const base = d(2026, 3, 1);
  for (let i = 1; i <= 100; i++) {
    it(`daysBetween(base, addDays(base, ${i})) === ${i}`, () => {
      expect(daysBetween(base, addDays(base, i))).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 4: startOfDay / endOfDay loop — 102 tests (i = 0..50, × 2)
// ---------------------------------------------------------------------------
describe('startOfDay — 51 loop tests', () => {
  const base = d(2026, 1, 1);
  for (let i = 0; i <= 50; i++) {
    it(`startOfDay i=${i} has hours 0, minutes 0, seconds 0, ms 0`, () => {
      const target = addDays(base, i);
      const sod = startOfDay(target);
      expect(sod.getHours()).toBe(0);
      expect(sod.getMinutes()).toBe(0);
      expect(sod.getSeconds()).toBe(0);
      expect(sod.getMilliseconds()).toBe(0);
    });
  }
});

describe('endOfDay — 51 loop tests', () => {
  const base = d(2026, 1, 1);
  for (let i = 0; i <= 50; i++) {
    it(`endOfDay i=${i} has hours 23, minutes 59, seconds 59, ms 999`, () => {
      const target = addDays(base, i);
      const eod = endOfDay(target);
      expect(eod.getHours()).toBe(23);
      expect(eod.getMinutes()).toBe(59);
      expect(eod.getSeconds()).toBe(59);
      expect(eod.getMilliseconds()).toBe(999);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 5: getDaysInMonth loop — 12 tests (i = 1..12)
// ---------------------------------------------------------------------------
describe('getDaysInMonth — 12 loop tests', () => {
  const knownDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 2026 (non-leap)
  for (let i = 1; i <= 12; i++) {
    it(`getDaysInMonth(2026, ${i}) === ${knownDays[i - 1]}`, () => {
      expect(getDaysInMonth(2026, i)).toBe(knownDays[i - 1]);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 6: isBefore loop — 50 tests (i = 0..49)
// ---------------------------------------------------------------------------
describe('isBefore — 50 loop tests', () => {
  const base = d(2026, 6, 1);
  for (let i = 0; i < 50; i++) {
    it(`isBefore(base, addDays(base, ${i + 1})) is true`, () => {
      expect(isBefore(base, addDays(base, i + 1))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 7: isLeapYear loop — 50 tests (years 2000..2049)
// ---------------------------------------------------------------------------
describe('isLeapYear — 50 loop tests (2000–2049)', () => {
  // Precomputed: leap years in 2000-2049
  const leapYears = new Set([2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028, 2032, 2036, 2040, 2044, 2048]);
  for (let i = 0; i < 50; i++) {
    const year = 2000 + i;
    it(`isLeapYear(${year}) === ${leapYears.has(year)}`, () => {
      expect(isLeapYear(year)).toBe(leapYears.has(year));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 8: addHours loop — 50 tests
// ---------------------------------------------------------------------------
describe('addHours — 50 loop tests', () => {
  const base = dt(2026, 1, 5, 0, 0, 0);
  for (let i = 0; i < 50; i++) {
    it(`addHours(base, ${i}) = base + ${i} hours`, () => {
      const result = addHours(base, i);
      expect(result.getTime()).toBe(base.getTime() + i * 3_600_000);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 9: addMinutes loop — 50 tests
// ---------------------------------------------------------------------------
describe('addMinutes — 50 loop tests', () => {
  const base = dt(2026, 1, 5, 0, 0, 0);
  for (let i = 0; i < 50; i++) {
    it(`addMinutes(base, ${i}) = base + ${i} minutes`, () => {
      const result = addMinutes(base, i);
      expect(result.getTime()).toBe(base.getTime() + i * 60_000);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 10: addSeconds loop — 50 tests
// ---------------------------------------------------------------------------
describe('addSeconds — 50 loop tests', () => {
  const base = dt(2026, 1, 5, 0, 0, 0);
  for (let i = 0; i < 50; i++) {
    it(`addSeconds(base, ${i}) = base + ${i} seconds`, () => {
      const result = addSeconds(base, i);
      expect(result.getTime()).toBe(base.getTime() + i * 1_000);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 11: isSameDay loop — 50 tests
// ---------------------------------------------------------------------------
describe('isSameDay — 50 loop tests', () => {
  const base = d(2026, 2, 10);
  for (let i = 0; i < 50; i++) {
    it(`isSameDay(base, addDays(base, ${i})) is ${i === 0}`, () => {
      expect(isSameDay(base, addDays(base, i))).toBe(i === 0);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 12: isAfter loop — 50 tests
// ---------------------------------------------------------------------------
describe('isAfter — 50 loop tests', () => {
  const base = d(2026, 6, 15);
  for (let i = 1; i <= 50; i++) {
    it(`isAfter(addDays(base, ${i}), base) is true`, () => {
      expect(isAfter(addDays(base, i), base)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 13: hoursBetween loop — 50 tests
// ---------------------------------------------------------------------------
describe('hoursBetween — 50 loop tests', () => {
  const base = dt(2026, 1, 5, 0, 0, 0);
  for (let i = 1; i <= 50; i++) {
    it(`hoursBetween(base, addHours(base, ${i})) === ${i}`, () => {
      expect(hoursBetween(base, addHours(base, i))).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 14: minutesBetween loop — 50 tests
// ---------------------------------------------------------------------------
describe('minutesBetween — 50 loop tests', () => {
  const base = dt(2026, 1, 5, 0, 0, 0);
  for (let i = 1; i <= 50; i++) {
    it(`minutesBetween(base, addMinutes(base, ${i})) === ${i}`, () => {
      expect(minutesBetween(base, addMinutes(base, i))).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 15: addWeeks loop — 50 tests
// ---------------------------------------------------------------------------
describe('addWeeks — 50 loop tests', () => {
  const base = d(2026, 1, 5);
  for (let i = 0; i < 50; i++) {
    it(`addWeeks(base, ${i}) === addDays(base, ${i * 7})`, () => {
      const byWeeks = addWeeks(base, i);
      const byDays = addDays(base, i * 7);
      expect(byWeeks.getTime()).toBe(byDays.getTime());
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 16: subtractBusinessDays loop — 50 tests
// ---------------------------------------------------------------------------
describe('subtractBusinessDays — 50 loop tests', () => {
  // Use Friday 2026-01-09 as base so we can subtract safely
  const base = d(2026, 1, 9);
  for (let i = 1; i <= 50; i++) {
    it(`subtractBusinessDays(base, ${i}) gives a weekday`, () => {
      const result = subtractBusinessDays(base, i);
      expect(isWeekday(result)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 17: isBetween loop — 50 tests
// ---------------------------------------------------------------------------
describe('isBetween — 50 loop tests', () => {
  const start = d(2026, 1, 1);
  const end = d(2026, 12, 31);
  for (let i = 0; i < 50; i++) {
    const target = addDays(start, i * 7);
    it(`isBetween(addDays(start, ${i * 7}), start, end) is true`, () => {
      expect(isBetween(target, start, end)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 18: getDayOfYear loop — 50 tests
// ---------------------------------------------------------------------------
describe('getDayOfYear — 50 loop tests', () => {
  const base = d(2026, 1, 1);
  for (let i = 0; i < 50; i++) {
    it(`getDayOfYear(addDays(base, ${i})) === ${i + 1}`, () => {
      expect(getDayOfYear(addDays(base, i))).toBe(i + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 19: addMonths loop — 12 tests
// ---------------------------------------------------------------------------
describe('addMonths — 12 loop tests', () => {
  const base = d(2026, 1, 15);
  for (let i = 0; i < 12; i++) {
    it(`addMonths(base, ${i}) has month ${(0 + i) % 12}`, () => {
      const result = addMonths(base, i);
      expect(result.getMonth()).toBe(i % 12);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 20: addYears loop — 20 tests
// ---------------------------------------------------------------------------
describe('addYears — 20 loop tests', () => {
  const base = d(2026, 6, 15);
  for (let i = 0; i < 20; i++) {
    it(`addYears(base, ${i}).getFullYear() === ${2026 + i}`, () => {
      expect(addYears(base, i).getFullYear()).toBe(2026 + i);
    });
  }
});

// ---------------------------------------------------------------------------
// INDIVIDUAL CORRECTNESS TESTS
// ---------------------------------------------------------------------------

describe('isWeekday / isWeekend', () => {
  it('Monday is a weekday', () => expect(isWeekday(MON)).toBe(true));
  it('Tuesday is a weekday', () => expect(isWeekday(TUE)).toBe(true));
  it('Saturday is a weekend', () => expect(isWeekend(SAT)).toBe(true));
  it('Sunday is a weekend', () => expect(isWeekend(SUN)).toBe(true));
  it('Saturday is not a weekday', () => expect(isWeekday(SAT)).toBe(false));
  it('Sunday is not a weekday', () => expect(isWeekday(SUN)).toBe(false));
  it('Monday is not a weekend', () => expect(isWeekend(MON)).toBe(false));

  const allDays = [
    { date: d(2026, 1, 4), expected: false },  // Sunday
    { date: d(2026, 1, 5), expected: true  },  // Monday
    { date: d(2026, 1, 6), expected: true  },  // Tuesday
    { date: d(2026, 1, 7), expected: true  },  // Wednesday
    { date: d(2026, 1, 8), expected: true  },  // Thursday
    { date: d(2026, 1, 9), expected: true  },  // Friday
    { date: d(2026, 1, 10), expected: false }, // Saturday
  ];

  allDays.forEach(({ date, expected }) => {
    it(`isWeekday(${date.toDateString()}) === ${expected}`, () => {
      expect(isWeekday(date)).toBe(expected);
    });
  });
});

describe('addBusinessDays correctness', () => {
  it('Mon + 1 = Tue', () => {
    const result = addBusinessDays(d(2026, 1, 5), 1);
    expect(result.getDate()).toBe(6);
  });

  it('Fri + 1 = Mon (skips weekend)', () => {
    const result = addBusinessDays(d(2026, 1, 9), 1);
    expect(result.getDay()).toBe(1); // Monday
  });

  it('Fri + 2 = Tue (skips weekend)', () => {
    const result = addBusinessDays(d(2026, 1, 9), 2);
    expect(result.getDay()).toBe(2); // Tuesday
  });

  it('Sat + 1 = Mon (next business day after Sat)', () => {
    // Saturday → advance 1: Sun (skip) → Mon = first business day
    const result = addBusinessDays(d(2026, 1, 10), 1);
    expect(result.getDay()).toBe(1); // Monday
  });

  it('Mon + 0 = Mon (same date)', () => {
    const result = addBusinessDays(MON, 0);
    expect(result.getTime()).toBe(MON.getTime());
  });

  it('Mon + 5 = Mon next week', () => {
    const result = addBusinessDays(d(2026, 1, 5), 5);
    expect(result.getDay()).toBe(1);
  });

  it('handles negative (delegates to subtract)', () => {
    const result = addBusinessDays(d(2026, 1, 7), -2);
    expect(result.getDay()).toBe(1); // back to Monday
  });
});

describe('subtractBusinessDays correctness', () => {
  it('Wed - 1 = Tue', () => {
    const result = subtractBusinessDays(d(2026, 1, 7), 1);
    expect(result.getDay()).toBe(2);
  });

  it('Mon - 1 = Fri (skips weekend)', () => {
    const result = subtractBusinessDays(d(2026, 1, 5), 1);
    expect(result.getDay()).toBe(5); // Friday
  });

  it('Mon - 2 = Thu', () => {
    const result = subtractBusinessDays(d(2026, 1, 5), 2);
    expect(result.getDay()).toBe(4); // Thursday
  });

  it('handles negative (delegates to add)', () => {
    const result = subtractBusinessDays(d(2026, 1, 5), -1);
    expect(result.getDay()).toBe(2); // Tuesday
  });
});

describe('businessDaysBetween', () => {
  it('Mon to Fri (same week) = 4 business days', () => {
    expect(businessDaysBetween(d(2026, 1, 5), d(2026, 1, 9))).toBe(4);
  });

  it('same date = 0', () => {
    expect(businessDaysBetween(MON, MON)).toBe(0);
  });

  it('Mon to Mon+7 = 5 business days', () => {
    expect(businessDaysBetween(d(2026, 1, 5), d(2026, 1, 12))).toBe(5);
  });

  it('reversed order gives negative result', () => {
    const val = businessDaysBetween(d(2026, 1, 9), d(2026, 1, 5));
    expect(val).toBeLessThan(0);
  });
});

describe('nextBusinessDay / previousBusinessDay', () => {
  it('next from Mon = Tue', () => {
    expect(nextBusinessDay(d(2026, 1, 5)).getDay()).toBe(2);
  });

  it('next from Fri = Mon', () => {
    expect(nextBusinessDay(d(2026, 1, 9)).getDay()).toBe(1);
  });

  it('next from Sat = Mon', () => {
    expect(nextBusinessDay(d(2026, 1, 10)).getDay()).toBe(1);
  });

  it('next from Sun = Mon', () => {
    expect(nextBusinessDay(d(2026, 1, 11)).getDay()).toBe(1);
  });

  it('previous from Wed = Tue', () => {
    expect(previousBusinessDay(d(2026, 1, 7)).getDay()).toBe(2);
  });

  it('previous from Mon = Fri', () => {
    expect(previousBusinessDay(d(2026, 1, 5)).getDay()).toBe(5);
  });

  it('previous from Sun = Fri', () => {
    expect(previousBusinessDay(d(2026, 1, 11)).getDay()).toBe(5);
  });
});

describe('isPublicHoliday', () => {
  const holidays = [d(2026, 1, 1), d(2026, 12, 25)];

  it('New Year is a holiday', () => expect(isPublicHoliday(d(2026, 1, 1), holidays)).toBe(true));
  it('Christmas is a holiday', () => expect(isPublicHoliday(d(2026, 12, 25), holidays)).toBe(true));
  it('Random day is not a holiday', () => expect(isPublicHoliday(d(2026, 6, 15), holidays)).toBe(false));
  it('Empty holidays array → false', () => expect(isPublicHoliday(d(2026, 1, 1), [])).toBe(false));
  it('Different year same date → false', () => expect(isPublicHoliday(d(2025, 1, 1), holidays)).toBe(false));
  it('Time component irrelevant (same date match)', () => {
    const h = [new Date(2026, 0, 1, 12, 0, 0)];
    expect(isPublicHoliday(d(2026, 1, 1), h)).toBe(true);
  });
});

describe('addBusinessDaysWithHolidays', () => {
  const holidays = [d(2026, 1, 6)]; // Tuesday is a holiday

  it('Mon + 1 skips Tuesday holiday → Wed', () => {
    const result = addBusinessDaysWithHolidays(d(2026, 1, 5), 1, holidays);
    expect(result.getDay()).toBe(3); // Wednesday
  });

  it('no holidays: same as addBusinessDays', () => {
    const r1 = addBusinessDays(d(2026, 1, 5), 3);
    const r2 = addBusinessDaysWithHolidays(d(2026, 1, 5), 3, []);
    expect(r1.getTime()).toBe(r2.getTime());
  });
});

describe('isWithinWorkingHours', () => {
  it('Mon 10:00 → within working hours', () => {
    expect(isWithinWorkingHours(dt(2026, 1, 5, 10, 0), WORK_HOURS)).toBe(true);
  });

  it('Mon 08:59 → not within working hours', () => {
    expect(isWithinWorkingHours(dt(2026, 1, 5, 8, 59), WORK_HOURS)).toBe(false);
  });

  it('Mon 17:00 → not within (exclusive end)', () => {
    expect(isWithinWorkingHours(dt(2026, 1, 5, 17, 0), WORK_HOURS)).toBe(false);
  });

  it('Mon 16:59 → within working hours', () => {
    expect(isWithinWorkingHours(dt(2026, 1, 5, 16, 59), WORK_HOURS)).toBe(true);
  });

  it('Sat 10:00 → not within working hours', () => {
    expect(isWithinWorkingHours(dt(2026, 1, 10, 10, 0), WORK_HOURS)).toBe(false);
  });

  it('Sun 10:00 → not within working hours', () => {
    expect(isWithinWorkingHours(dt(2026, 1, 11, 10, 0), WORK_HOURS)).toBe(false);
  });

  it('Mon 09:00 (exact start) → within working hours', () => {
    expect(isWithinWorkingHours(dt(2026, 1, 5, 9, 0), WORK_HOURS)).toBe(true);
  });
});

describe('nextWorkingTime', () => {
  it('within hours returns the same Date (same ms)', () => {
    const t = dt(2026, 1, 5, 10, 0);
    const result = nextWorkingTime(t, WORK_HOURS);
    expect(result.getTime()).toBe(t.getTime());
  });

  it('Sat → returns Mon 09:00', () => {
    const sat = dt(2026, 1, 10, 12, 0); // Saturday noon
    const result = nextWorkingTime(sat, WORK_HOURS);
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });

  it('Mon 17:01 → Tue 09:00', () => {
    const afterHours = dt(2026, 1, 5, 17, 1);
    const result = nextWorkingTime(afterHours, WORK_HOURS);
    expect(result.getDay()).toBe(2); // Tuesday
    expect(result.getHours()).toBe(9);
  });

  it('Mon 08:00 (before start) → Mon 09:00', () => {
    const before = dt(2026, 1, 5, 8, 0);
    const result = nextWorkingTime(before, WORK_HOURS);
    expect(result.getDay()).toBe(1);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });
});

describe('minutesUntilNextWorkingTime', () => {
  it('within working hours → 0', () => {
    expect(minutesUntilNextWorkingTime(dt(2026, 1, 5, 10, 0), WORK_HOURS)).toBe(0);
  });

  it('Mon 08:00 → 60 minutes until 09:00', () => {
    expect(minutesUntilNextWorkingTime(dt(2026, 1, 5, 8, 0), WORK_HOURS)).toBe(60);
  });

  it('always returns non-negative number', () => {
    const result = minutesUntilNextWorkingTime(dt(2026, 1, 10, 14, 0), WORK_HOURS);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

describe('startOfWeek / endOfWeek', () => {
  it('startOfWeek defaults to Sunday', () => {
    const result = startOfWeek(d(2026, 1, 7)); // Wednesday
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getHours()).toBe(0);
  });

  it('startOfWeek with Monday start', () => {
    const result = startOfWeek(d(2026, 1, 7), 1); // Wednesday
    expect(result.getDay()).toBe(1); // Monday
  });

  it('endOfWeek defaults to Saturday', () => {
    const result = endOfWeek(d(2026, 1, 7)); // Wednesday
    expect(result.getDay()).toBe(6); // Saturday
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });

  it('endOfWeek with Monday start → Sunday', () => {
    const result = endOfWeek(d(2026, 1, 7), 1); // Wednesday
    expect(result.getDay()).toBe(0); // Sunday
  });

  it('startOfWeek is always <= given date', () => {
    const dt2 = d(2026, 4, 15);
    const sow = startOfWeek(dt2);
    expect(sow.getTime()).toBeLessThanOrEqual(dt2.getTime());
  });
});

describe('startOfMonth / endOfMonth', () => {
  it('startOfMonth gives day 1', () => {
    expect(startOfMonth(d(2026, 6, 15)).getDate()).toBe(1);
  });

  it('startOfMonth midnight', () => {
    const som = startOfMonth(d(2026, 6, 15));
    expect(som.getHours()).toBe(0);
    expect(som.getMinutes()).toBe(0);
  });

  it('endOfMonth gives last day of month', () => {
    expect(endOfMonth(d(2026, 6, 15)).getDate()).toBe(30); // June has 30 days
  });

  it('endOfMonth for January', () => {
    expect(endOfMonth(d(2026, 1, 1)).getDate()).toBe(31);
  });

  it('endOfMonth 23:59:59.999', () => {
    const eom = endOfMonth(d(2026, 3, 10));
    expect(eom.getHours()).toBe(23);
    expect(eom.getMinutes()).toBe(59);
    expect(eom.getSeconds()).toBe(59);
    expect(eom.getMilliseconds()).toBe(999);
  });

  it('endOfMonth Feb 2024 (leap) = 29', () => {
    expect(endOfMonth(d(2024, 2, 1)).getDate()).toBe(29);
  });

  it('endOfMonth Feb 2026 (non-leap) = 28', () => {
    expect(endOfMonth(d(2026, 2, 1)).getDate()).toBe(28);
  });
});

describe('startOfYear / endOfYear', () => {
  it('startOfYear is Jan 1', () => {
    const soy = startOfYear(d(2026, 7, 4));
    expect(soy.getMonth()).toBe(0);
    expect(soy.getDate()).toBe(1);
    expect(soy.getHours()).toBe(0);
  });

  it('endOfYear is Dec 31', () => {
    const eoy = endOfYear(d(2026, 7, 4));
    expect(eoy.getMonth()).toBe(11);
    expect(eoy.getDate()).toBe(31);
    expect(eoy.getHours()).toBe(23);
    expect(eoy.getMinutes()).toBe(59);
    expect(eoy.getSeconds()).toBe(59);
    expect(eoy.getMilliseconds()).toBe(999);
  });
});

describe('isSameMonth / isSameYear', () => {
  it('same month', () => expect(isSameMonth(d(2026, 3, 1), d(2026, 3, 31))).toBe(true));
  it('different month', () => expect(isSameMonth(d(2026, 3, 1), d(2026, 4, 1))).toBe(false));
  it('same year', () => expect(isSameYear(d(2026, 1, 1), d(2026, 12, 31))).toBe(true));
  it('different year', () => expect(isSameYear(d(2026, 1, 1), d(2025, 1, 1))).toBe(false));
});

describe('isBefore / isAfter / isBetween (single)', () => {
  const a = d(2026, 1, 1);
  const b = d(2026, 6, 1);
  const c = d(2026, 12, 31);

  it('a is before b', () => expect(isBefore(a, b)).toBe(true));
  it('b is not before a', () => expect(isBefore(b, a)).toBe(false));
  it('a equals a → not before', () => expect(isBefore(a, a)).toBe(false));
  it('b is after a', () => expect(isAfter(b, a)).toBe(true));
  it('a is not after b', () => expect(isAfter(a, b)).toBe(false));
  it('a equals a → not after', () => expect(isAfter(a, a)).toBe(false));
  it('b is between a and c', () => expect(isBetween(b, a, c)).toBe(true));
  it('a is at boundary (inclusive start)', () => expect(isBetween(a, a, c)).toBe(true));
  it('c is at boundary (inclusive end)', () => expect(isBetween(c, a, c)).toBe(true));
  it('date before range → false', () => expect(isBetween(addDays(a, -1), a, c)).toBe(false));
  it('date after range → false', () => expect(isBetween(addDays(c, 1), a, c)).toBe(false));
});

describe('age', () => {
  it('30 years old', () => {
    expect(age(d(1996, 2, 24), d(2026, 2, 24))).toBe(30);
  });

  it('birthday not yet this year → 29', () => {
    expect(age(d(1996, 3, 1), d(2026, 2, 24))).toBe(29);
  });

  it('birthday already this year → 30', () => {
    expect(age(d(1996, 2, 1), d(2026, 2, 24))).toBe(30);
  });

  it('newborn', () => {
    expect(age(d(2026, 1, 1), d(2026, 1, 1))).toBe(0);
  });

  it('negative years handled (future birth date)', () => {
    expect(age(d(2030, 1, 1), d(2026, 1, 1))).toBe(-4);
  });
});

describe('generateRecurrence', () => {
  it('daily with count=5', () => {
    const dates = generateRecurrence({ start: d(2026, 1, 5), frequency: 'daily', count: 5 });
    expect(dates).toHaveLength(5);
    expect(isSameDay(dates[0], d(2026, 1, 5))).toBe(true);
    expect(isSameDay(dates[4], d(2026, 1, 9))).toBe(true);
  });

  it('weekly with count=4', () => {
    const dates = generateRecurrence({ start: d(2026, 1, 5), frequency: 'weekly', count: 4 });
    expect(dates).toHaveLength(4);
    expect(daysBetween(dates[0], dates[1])).toBe(7);
  });

  it('monthly with count=3', () => {
    const dates = generateRecurrence({ start: d(2026, 1, 15), frequency: 'monthly', count: 3 });
    expect(dates).toHaveLength(3);
    expect(dates[0].getDate()).toBe(15);
    expect(dates[1].getMonth()).toBe(1); // February
    expect(dates[2].getMonth()).toBe(2); // March
  });

  it('yearly with count=3', () => {
    const dates = generateRecurrence({ start: d(2026, 6, 1), frequency: 'yearly', count: 3 });
    expect(dates).toHaveLength(3);
    expect(dates[0].getFullYear()).toBe(2026);
    expect(dates[2].getFullYear()).toBe(2028);
  });

  it('stops at until date', () => {
    const dates = generateRecurrence({
      start: d(2026, 1, 1),
      frequency: 'daily',
      until: d(2026, 1, 5),
    });
    expect(dates).toHaveLength(5);
    expect(isSameDay(dates[dates.length - 1], d(2026, 1, 5))).toBe(true);
  });

  it('interval=2 daily gives every other day', () => {
    const dates = generateRecurrence({ start: d(2026, 1, 1), frequency: 'daily', interval: 2, count: 4 });
    expect(daysBetween(dates[0], dates[1])).toBe(2);
  });

  it('first occurrence equals start', () => {
    const dates = generateRecurrence({ start: d(2026, 3, 10), frequency: 'weekly', count: 1 });
    expect(isSameDay(dates[0], d(2026, 3, 10))).toBe(true);
  });
});

describe('nextOccurrence', () => {
  it('returns first future occurrence', () => {
    const rule = { start: d(2026, 1, 5), frequency: 'daily' as const, count: 10 };
    const result = nextOccurrence(rule, d(2026, 1, 7));
    expect(result).not.toBeNull();
    expect(isSameDay(result!, d(2026, 1, 7))).toBe(true);
  });

  it('returns start when from equals start', () => {
    const rule = { start: d(2026, 1, 5), frequency: 'daily' as const, count: 5 };
    const result = nextOccurrence(rule, d(2026, 1, 5));
    expect(result).not.toBeNull();
    expect(isSameDay(result!, d(2026, 1, 5))).toBe(true);
  });

  it('returns null when from is after all occurrences', () => {
    const rule = { start: d(2026, 1, 1), frequency: 'daily' as const, count: 3 };
    const result = nextOccurrence(rule, d(2026, 2, 1));
    expect(result).toBeNull();
  });
});

describe('getDayOfYear', () => {
  it('Jan 1 = 1', () => expect(getDayOfYear(d(2026, 1, 1))).toBe(1));
  it('Jan 2 = 2', () => expect(getDayOfYear(d(2026, 1, 2))).toBe(2));
  it('Dec 31 = 365 (non-leap)', () => expect(getDayOfYear(d(2026, 12, 31))).toBe(365));
  it('Dec 31 = 366 (leap year)', () => expect(getDayOfYear(d(2024, 12, 31))).toBe(366));
  it('Feb 28 (non-leap) = 59', () => expect(getDayOfYear(d(2026, 2, 28))).toBe(59));
});

describe('getWeekOfYear', () => {
  it('2026-01-01 is ISO week 1', () => expect(getWeekOfYear(d(2026, 1, 1))).toBe(1));
  it('2026-01-05 (Mon) is ISO week 2', () => expect(getWeekOfYear(d(2026, 1, 5))).toBe(2));
  it('returns a number in range 1–53', () => {
    const w = getWeekOfYear(d(2026, 7, 15));
    expect(w).toBeGreaterThanOrEqual(1);
    expect(w).toBeLessThanOrEqual(53);
  });
  it('2026-12-28 is ISO week 53 or 1 of 2027', () => {
    const w = getWeekOfYear(d(2026, 12, 28));
    expect(w).toBeGreaterThanOrEqual(1);
  });
});

describe('getDaysInMonth correctness', () => {
  it('February 2024 (leap) = 29', () => expect(getDaysInMonth(2024, 2)).toBe(29));
  it('February 2026 (non-leap) = 28', () => expect(getDaysInMonth(2026, 2)).toBe(28));
  it('April = 30', () => expect(getDaysInMonth(2026, 4)).toBe(30));
  it('December = 31', () => expect(getDaysInMonth(2026, 12)).toBe(31));
});

describe('isLeapYear correctness', () => {
  it('2000 is leap (divisible by 400)', () => expect(isLeapYear(2000)).toBe(true));
  it('1900 is NOT leap (div by 100, not 400)', () => expect(isLeapYear(1900)).toBe(false));
  it('2024 is leap', () => expect(isLeapYear(2024)).toBe(true));
  it('2026 is NOT leap', () => expect(isLeapYear(2026)).toBe(false));
  it('2100 is NOT leap', () => expect(isLeapYear(2100)).toBe(false));
  it('2400 is leap', () => expect(isLeapYear(2400)).toBe(true));
});

describe('addMonths end-of-month handling', () => {
  it('Jan 31 + 1 month = Feb 28 (non-leap)', () => {
    const result = addMonths(d(2026, 1, 31), 1);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(28);
  });

  it('Jan 31 + 1 month = Feb 29 (leap year)', () => {
    const result = addMonths(d(2024, 1, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });

  it('Mar 31 + 1 month = Apr 30', () => {
    const result = addMonths(d(2026, 3, 31), 1);
    expect(result.getMonth()).toBe(3); // April
    expect(result.getDate()).toBe(30);
  });

  it('adding 12 months brings same month', () => {
    const result = addMonths(d(2026, 6, 15), 12);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(5); // June
  });

  it('subtracting months (negative)', () => {
    const result = addMonths(d(2026, 3, 15), -1);
    expect(result.getMonth()).toBe(1); // February
  });
});

describe('formatDuration', () => {
  it('0ms → "0s"', () => expect(formatDuration(0)).toBe('0s'));
  it('1000ms → "1s"', () => expect(formatDuration(1_000)).toBe('1s'));
  it('60000ms → "1m"', () => expect(formatDuration(60_000)).toBe('1m'));
  it('3600000ms → "1h"', () => expect(formatDuration(3_600_000)).toBe('1h'));
  it('9015000ms → "2h 30m 15s"', () => expect(formatDuration(9_015_000)).toBe('2h 30m 15s'));
  it('negative ms still formats (takes abs)', () => expect(formatDuration(-60_000)).toBe('1m'));
  it('90061000ms → "25h 1m 1s"', () => expect(formatDuration(90_061_000)).toBe('25h 1m 1s'));
  it('no seconds component when exact minutes', () => {
    expect(formatDuration(120_000)).toBe('2m');
  });
  it('hours and seconds, no minutes', () => {
    expect(formatDuration(3_605_000)).toBe('1h 5s');
  });
});

describe('parseDuration', () => {
  it('"1s" → 1000', () => expect(parseDuration('1s')).toBe(1_000));
  it('"1m" → 60000', () => expect(parseDuration('1m')).toBe(60_000));
  it('"1h" → 3600000', () => expect(parseDuration('1h')).toBe(3_600_000));
  it('"1d" → 86400000', () => expect(parseDuration('1d')).toBe(86_400_000));
  it('"2h 30m" → 9000000', () => expect(parseDuration('2h 30m')).toBe(9_000_000));
  it('"1h 0m 0s" → 3600000', () => expect(parseDuration('1h 0m 0s')).toBe(3_600_000));
  it('"500ms" → 500', () => expect(parseDuration('500ms')).toBe(500));
  it('empty string → 0', () => expect(parseDuration('')).toBe(0));
  it('"2h 30m 15s" → 9015000', () => expect(parseDuration('2h 30m 15s')).toBe(9_015_000));
  it('case insensitive: "2H 30M" → 9000000', () => expect(parseDuration('2H 30M')).toBe(9_000_000));
});

describe('formatDuration / parseDuration round-trip', () => {
  const cases = [1_000, 60_000, 3_600_000, 9_015_000, 86_400_000, 7_200_000, 3_661_000];
  cases.forEach((ms) => {
    it(`round-trip ${ms}ms`, () => {
      const str = formatDuration(ms);
      const parsed = parseDuration(str);
      expect(parsed).toBe(ms);
    });
  });
});

describe('toUtcMidnight', () => {
  it('returns UTC midnight', () => {
    const input = new Date(Date.UTC(2026, 0, 5, 14, 30, 0));
    const result = toUtcMidnight(input);
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
    expect(result.getUTCMilliseconds()).toBe(0);
  });

  it('preserves UTC date', () => {
    const input = new Date(Date.UTC(2026, 5, 15, 23, 59, 59));
    const result = toUtcMidnight(input);
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(5);
    expect(result.getUTCDate()).toBe(15);
  });

  it('returns a new Date (no mutation)', () => {
    const input = new Date(Date.UTC(2026, 0, 5, 12, 0, 0));
    const result = toUtcMidnight(input);
    expect(result).not.toBe(input);
    expect(input.getUTCHours()).toBe(12);
  });
});

describe('immutability (no input mutation)', () => {
  const base = d(2026, 6, 15);
  const baseTime = base.getTime();

  it('addDays does not mutate', () => { addDays(base, 10); expect(base.getTime()).toBe(baseTime); });
  it('addWeeks does not mutate', () => { addWeeks(base, 2); expect(base.getTime()).toBe(baseTime); });
  it('addMonths does not mutate', () => { addMonths(base, 3); expect(base.getTime()).toBe(baseTime); });
  it('addYears does not mutate', () => { addYears(base, 1); expect(base.getTime()).toBe(baseTime); });
  it('addHours does not mutate', () => { addHours(base, 5); expect(base.getTime()).toBe(baseTime); });
  it('addMinutes does not mutate', () => { addMinutes(base, 30); expect(base.getTime()).toBe(baseTime); });
  it('addSeconds does not mutate', () => { addSeconds(base, 60); expect(base.getTime()).toBe(baseTime); });
  it('startOfDay does not mutate', () => { startOfDay(base); expect(base.getTime()).toBe(baseTime); });
  it('endOfDay does not mutate', () => { endOfDay(base); expect(base.getTime()).toBe(baseTime); });
  it('startOfMonth does not mutate', () => { startOfMonth(base); expect(base.getTime()).toBe(baseTime); });
  it('endOfMonth does not mutate', () => { endOfMonth(base); expect(base.getTime()).toBe(baseTime); });
  it('addBusinessDays does not mutate', () => { addBusinessDays(base, 3); expect(base.getTime()).toBe(baseTime); });
  it('subtractBusinessDays does not mutate', () => { subtractBusinessDays(base, 2); expect(base.getTime()).toBe(baseTime); });
  it('nextBusinessDay does not mutate', () => { nextBusinessDay(base); expect(base.getTime()).toBe(baseTime); });
  it('previousBusinessDay does not mutate', () => { previousBusinessDay(base); expect(base.getTime()).toBe(baseTime); });
  it('startOfWeek does not mutate', () => { startOfWeek(base); expect(base.getTime()).toBe(baseTime); });
  it('endOfWeek does not mutate', () => { endOfWeek(base); expect(base.getTime()).toBe(baseTime); });
  it('startOfYear does not mutate', () => { startOfYear(base); expect(base.getTime()).toBe(baseTime); });
  it('endOfYear does not mutate', () => { endOfYear(base); expect(base.getTime()).toBe(baseTime); });
});

describe('edge cases', () => {
  it('addDays with 0 days returns same date', () => {
    expect(addDays(d(2026, 6, 15), 0).getTime()).toBe(d(2026, 6, 15).getTime());
  });

  it('addDays with negative days goes backwards', () => {
    expect(addDays(d(2026, 6, 15), -5).getDate()).toBe(10);
  });

  it('daysBetween is symmetric (absolute)', () => {
    const a = d(2026, 1, 1);
    const b = d(2026, 3, 1);
    expect(daysBetween(a, b)).toBe(daysBetween(b, a));
  });

  it('hoursBetween is symmetric', () => {
    const a = dt(2026, 1, 1, 0, 0);
    const b = dt(2026, 1, 1, 12, 0);
    expect(hoursBetween(a, b)).toBe(hoursBetween(b, a));
  });

  it('minutesBetween is symmetric', () => {
    const a = dt(2026, 1, 1, 0, 0);
    const b = dt(2026, 1, 1, 0, 45);
    expect(minutesBetween(a, b)).toBe(minutesBetween(b, a));
  });

  it('isSameDay: same date different time', () => {
    expect(isSameDay(dt(2026, 1, 5, 0, 0), dt(2026, 1, 5, 23, 59))).toBe(true);
  });

  it('getDaysInMonth: Feb 2000 (leap) = 29', () => {
    expect(getDaysInMonth(2000, 2)).toBe(29);
  });

  it('addWeeks(date, 0) is same date', () => {
    expect(addWeeks(d(2026, 6, 15), 0).getTime()).toBe(d(2026, 6, 15).getTime());
  });

  it('addMonths(date, 0) is same date', () => {
    expect(addMonths(d(2026, 6, 15), 0).getTime()).toBe(d(2026, 6, 15).getTime());
  });

  it('addYears(date, 0) is same date', () => {
    expect(addYears(d(2026, 6, 15), 0).getTime()).toBe(d(2026, 6, 15).getTime());
  });
});
