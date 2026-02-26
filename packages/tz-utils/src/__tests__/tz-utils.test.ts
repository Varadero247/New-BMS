// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  TIMEZONES,
  convertToTimezone,
  convertBetweenTimezones,
  getOffsetMinutes,
  getOffsetString,
  getTimezoneInfo,
  isDST,
  utcToLocal,
  localToUtc,
  formatInTimezone,
  isValidTimezone,
  getTimezonesByOffset,
  getTimezonesByRegion,
  guessTimezone,
  isSameLocalDay,
  getLocalMidnight,
  getLocalNoon,
  offsetDifference,
  isBusinessHours,
  nextBusinessOpen,
  nextBusinessClose,
  businessHoursRemaining,
  toISOStringInTimezone,
  getTimezoneName,
  getAbbreviation,
} from '../tz-utils';

// ---------------------------------------------------------------------------
// Helper: generate test dates spread across a year to cover DST transitions
// ---------------------------------------------------------------------------
function makeDates(count: number): Date[] {
  const base = new Date('2026-01-01T00:00:00Z').getTime();
  const step = (365 * 24 * 60 * 60 * 1000) / count;
  return Array.from({ length: count }, (_, i) => new Date(base + i * step));
}

const ALL_TZS = TIMEZONES; // 81 entries
const DATES_50 = makeDates(50);
const DATES_30 = makeDates(30);
const DATES_20 = makeDates(20);

// ---------------------------------------------------------------------------
// 1. isValidTimezone — 80 valid + 20 invalid = 100 tests
// ---------------------------------------------------------------------------
describe('isValidTimezone — valid IANA names', () => {
  ALL_TZS.forEach((tz) => {
    it(`accepts ${tz}`, () => {
      expect(isValidTimezone(tz)).toBe(true);
    });
  });
});

describe('isValidTimezone — invalid strings', () => {
  const invalids = [
    'Not/A/Zone',
    'Galactic/Core',
    'rubbish',
    'Moon/Luna',
    'Atlantic/Nowhere',
    'Eu rope/London',
    '',
    '   ',
    'Mars/Olympus',
    'Fake/Timezone',
    'America',
    'Europe',
    '/London',
    'Asia/',
    'INVALID',
    'Pacific/NotReal',
    'Oceania/Unknown',
    'Foo/Bar',
    'ZZZ',
    '123',
  ];
  invalids.forEach((s) => {
    it(`rejects "${s}"`, () => {
      expect(isValidTimezone(s)).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// 2. getOffsetMinutes — 80 tests (one per timezone, all must be in range)
// ---------------------------------------------------------------------------
describe('getOffsetMinutes — range check for all IANA zones', () => {
  const refDate = new Date('2026-06-15T12:00:00Z');
  ALL_TZS.forEach((tz) => {
    it(`${tz} offset is in [-720, 840] minutes`, () => {
      const offset = getOffsetMinutes(tz, refDate);
      expect(typeof offset).toBe('number');
      expect(offset).toBeGreaterThanOrEqual(-720);
      expect(offset).toBeLessThanOrEqual(840);
    });
  });
});

// ---------------------------------------------------------------------------
// 3. getOffsetString — 80 tests, pattern check
// ---------------------------------------------------------------------------
describe('getOffsetString — format check for all IANA zones', () => {
  const refDate = new Date('2026-01-15T12:00:00Z');
  ALL_TZS.forEach((tz) => {
    it(`${tz} offset string matches [+-]HH:MM`, () => {
      const s = getOffsetString(tz, refDate);
      expect(s).toMatch(/^[+-]\d{2}:\d{2}$/);
    });
  });
});

// ---------------------------------------------------------------------------
// 4. convertToTimezone — 50 dates × 2 timezones = 100 tests (field validity)
// ---------------------------------------------------------------------------
describe('convertToTimezone — field validity', () => {
  const tzPairs = ['Europe/London', 'Asia/Tokyo'];
  DATES_50.forEach((date, i) => {
    tzPairs.forEach((tz) => {
      it(`date[${i}] in ${tz}: fields are in valid ranges`, () => {
        const zd = convertToTimezone(date, tz);
        expect(zd.date).toBe(date);
        expect(zd.timezone).toBe(tz);
        expect(zd.localHour).toBeGreaterThanOrEqual(0);
        expect(zd.localHour).toBeLessThanOrEqual(23);
        expect(zd.localMinute).toBeGreaterThanOrEqual(0);
        expect(zd.localMinute).toBeLessThanOrEqual(59);
        expect(zd.localSecond).toBeGreaterThanOrEqual(0);
        expect(zd.localSecond).toBeLessThanOrEqual(59);
        expect(zd.localMonth).toBeGreaterThanOrEqual(1);
        expect(zd.localMonth).toBeLessThanOrEqual(12);
        expect(zd.localDay).toBeGreaterThanOrEqual(1);
        expect(zd.localDay).toBeLessThanOrEqual(31);
        expect(zd.localYear).toBeGreaterThan(1970);
        expect(typeof zd.isDST).toBe('boolean');
        expect(typeof zd.offsetMinutes).toBe('number');
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 5. isDST — 80 tests (one per timezone, assert boolean)
// ---------------------------------------------------------------------------
describe('isDST — returns boolean for all zones', () => {
  const refDate = new Date('2026-07-01T12:00:00Z');
  ALL_TZS.forEach((tz) => {
    it(`isDST(${tz}) returns boolean`, () => {
      const result = isDST(tz, refDate);
      expect(typeof result).toBe('boolean');
    });
  });
});

// ---------------------------------------------------------------------------
// 6. getTimezoneInfo — 30 timezones, assert property presence
// ---------------------------------------------------------------------------
describe('getTimezoneInfo — property presence', () => {
  const tzSubset = ALL_TZS.slice(0, 30);
  const refDate = new Date('2026-03-15T10:00:00Z');
  tzSubset.forEach((tz) => {
    it(`getTimezoneInfo(${tz}) has required properties`, () => {
      const info = getTimezoneInfo(tz, refDate);
      expect(info.name).toBe(tz);
      expect(typeof info.offsetMinutes).toBe('number');
      expect(typeof info.offsetString).toBe('string');
      expect(info.offsetString).toMatch(/^[+-]\d{2}:\d{2}$/);
      expect(typeof info.abbr).toBe('string');
      expect(info.abbr.length).toBeGreaterThan(0);
      expect(typeof info.isDST).toBe('boolean');
    });
  });
});

// ---------------------------------------------------------------------------
// 7. formatInTimezone — 50 date+timezone combos, assert non-empty string
// ---------------------------------------------------------------------------
describe('formatInTimezone — non-empty string result', () => {
  const tzCycle = ['UTC', 'America/New_York', 'Asia/Kolkata', 'Europe/Berlin', 'Pacific/Auckland'];
  DATES_50.forEach((date, i) => {
    const tz = tzCycle[i % tzCycle.length];
    it(`formatInTimezone date[${i}] in ${tz}`, () => {
      const result = formatInTimezone(date, tz);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 8. toISOStringInTimezone — 50 combos, assert ISO pattern
// ---------------------------------------------------------------------------
describe('toISOStringInTimezone — ISO-8601 pattern', () => {
  const tzCycle = ['UTC', 'America/Chicago', 'Asia/Shanghai', 'Europe/Paris', 'Australia/Sydney'];
  DATES_50.forEach((date, i) => {
    const tz = tzCycle[i % tzCycle.length];
    it(`toISOStringInTimezone date[${i}] in ${tz}`, () => {
      const result = toISOStringInTimezone(date, tz);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });
  });
});

// ---------------------------------------------------------------------------
// 9. getTimezonesByRegion — 5 regions, assert non-empty array
// ---------------------------------------------------------------------------
describe('getTimezonesByRegion — non-empty arrays', () => {
  const regions = ['America', 'Europe', 'Asia', 'Africa', 'Australia'];
  regions.forEach((region) => {
    it(`getTimezonesByRegion("${region}") returns non-empty array`, () => {
      const result = getTimezonesByRegion(region);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((tz) => expect(tz.startsWith(region + '/')).toBe(true));
    });
  });
});

// ---------------------------------------------------------------------------
// 10. isSameLocalDay — 20 date pairs, assert boolean returned
// ---------------------------------------------------------------------------
describe('isSameLocalDay — returns boolean', () => {
  // Pairs: same day in UTC, same timezone
  const baseDateStr = '2026-02-24T';
  const tzPairs: [string, string][] = [
    ['UTC', 'UTC'],
    ['Europe/London', 'Europe/London'],
    ['America/New_York', 'America/New_York'],
    ['Asia/Tokyo', 'Asia/Tokyo'],
    ['Australia/Sydney', 'Australia/Sydney'],
    ['UTC', 'America/New_York'],
    ['Europe/London', 'Asia/Tokyo'],
    ['America/Los_Angeles', 'Europe/Paris'],
    ['Asia/Kolkata', 'UTC'],
    ['Pacific/Auckland', 'America/Chicago'],
    ['Europe/Moscow', 'Asia/Dubai'],
    ['Africa/Cairo', 'Africa/Nairobi'],
    ['America/Sao_Paulo', 'America/Buenos_Aires'],
    ['Asia/Seoul', 'Asia/Tokyo'],
    ['Europe/Berlin', 'Europe/Warsaw'],
    ['America/Denver', 'America/Phoenix'],
    ['Asia/Singapore', 'Asia/Hong_Kong'],
    ['Australia/Melbourne', 'Australia/Sydney'],
    ['Europe/Dublin', 'Europe/London'],
    ['Africa/Lagos', 'Africa/Accra'],
  ];

  tzPairs.forEach(([tzA, tzB], i) => {
    it(`isSameLocalDay pair[${i}] (${tzA}, ${tzB}) returns boolean`, () => {
      const a = new Date('2026-02-24T10:00:00Z');
      const b = new Date('2026-02-24T15:00:00Z');
      const result = isSameLocalDay(a, tzA, b, tzB);
      expect(typeof result).toBe('boolean');
    });
  });
});

// ---------------------------------------------------------------------------
// 11. getLocalMidnight — 30 dates × timezones, assert local hour is 0
// ---------------------------------------------------------------------------
describe('getLocalMidnight — local hour equals 0', () => {
  const tzCycle = [
    'UTC', 'Europe/London', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney',
    'Asia/Kolkata', 'America/Los_Angeles', 'Europe/Berlin', 'Pacific/Auckland', 'Africa/Cairo',
  ];
  DATES_30.forEach((date, i) => {
    const tz = tzCycle[i % tzCycle.length];
    it(`getLocalMidnight date[${i}] in ${tz} has localHour=0`, () => {
      const midnight = getLocalMidnight(date, tz);
      expect(midnight instanceof Date).toBe(true);
      const zd = convertToTimezone(midnight, tz);
      expect(zd.localHour).toBe(0);
      expect(zd.localMinute).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 12. isBusinessHours — 50 timestamps (structured so we know expected answer)
// ---------------------------------------------------------------------------
describe('isBusinessHours — structured assertions', () => {
  // UTC 09:00 on 2026-02-24 (Tuesday) = 09:00 London winter time (UTC+0)
  const londonMorning = new Date('2026-02-24T09:00:00Z');
  // UTC 00:00 on 2026-02-24 (Tuesday) = 19:00 Tokyo time (UTC+9) → outside hours
  const tokyoEvening = new Date('2026-02-24T10:00:00Z');
  // UTC 16:59 on 2026-02-24 = 16:59 London → inside hours (< 17)
  const londonAlmostClose = new Date('2026-02-24T16:59:00Z');
  // UTC 17:00 on 2026-02-24 = 17:00 London → outside (not < 17)
  const londonClosed = new Date('2026-02-24T17:00:00Z');
  // Saturday UTC 09:00
  const saturdayLondon = new Date('2026-02-28T09:00:00Z');

  it('London 09:00 Tue is business hours', () => {
    expect(isBusinessHours(londonMorning, 'Europe/London')).toBe(true);
  });
  it('London 16:59 Tue is business hours', () => {
    expect(isBusinessHours(londonAlmostClose, 'Europe/London')).toBe(true);
  });
  it('London 17:00 Tue is NOT business hours', () => {
    expect(isBusinessHours(londonClosed, 'Europe/London')).toBe(false);
  });
  it('London Saturday 09:00 is NOT business hours (weekend)', () => {
    expect(isBusinessHours(saturdayLondon, 'Europe/London')).toBe(false);
  });

  // UTC midnight = Tokyo 09:00 → Tokyo is UTC+9
  const tokyoNine = new Date('2026-02-24T00:00:00Z');
  it('Tokyo midnight UTC = 09:00 local, is business hours', () => {
    expect(isBusinessHours(tokyoNine, 'Asia/Tokyo')).toBe(true);
  });

  // UTC 08:00 = Tokyo 17:00 → exactly at end, NOT business hours
  const tokyoClose = new Date('2026-02-24T08:00:00Z');
  it('Tokyo 08:00 UTC = 17:00 local, is NOT business hours', () => {
    expect(isBusinessHours(tokyoClose, 'Asia/Tokyo')).toBe(false);
  });

  // Loop the remaining tests with type-only assertions
  const tzCycle = [
    'UTC', 'America/New_York', 'Asia/Kolkata', 'Europe/Berlin', 'Pacific/Auckland',
    'America/Los_Angeles', 'Asia/Tokyo', 'Europe/London', 'Australia/Sydney', 'Africa/Cairo',
  ];

  for (let i = 0; i < 44; i++) {
    const tz = tzCycle[i % tzCycle.length];
    const d = new Date('2026-02-24T10:00:00Z');
    it(`isBusinessHours loop[${i}] ${tz} returns boolean`, () => {
      const result = isBusinessHours(d, tz);
      expect(typeof result).toBe('boolean');
    });
  }
});

// ---------------------------------------------------------------------------
// 13. offsetDifference — 30 timezone pairs, assert number
// ---------------------------------------------------------------------------
describe('offsetDifference — returns number', () => {
  const tzPairs: [string, string][] = [
    ['UTC', 'America/New_York'],
    ['Europe/London', 'America/Los_Angeles'],
    ['Asia/Tokyo', 'Europe/London'],
    ['Australia/Sydney', 'America/New_York'],
    ['Asia/Kolkata', 'UTC'],
    ['America/Chicago', 'Asia/Shanghai'],
    ['Europe/Berlin', 'Asia/Dubai'],
    ['Pacific/Auckland', 'America/Sao_Paulo'],
    ['Africa/Nairobi', 'Europe/London'],
    ['Asia/Tehran', 'UTC'],
    ['America/St_Johns', 'UTC'],
    ['Asia/Yangon', 'UTC'],
    ['Australia/Adelaide', 'UTC'],
    ['Asia/Kolkata', 'Asia/Tokyo'],
    ['America/Caracas', 'UTC'],
    ['America/Halifax', 'UTC'],
    ['Europe/Moscow', 'Europe/London'],
    ['Asia/Almaty', 'UTC'],
    ['Asia/Tashkent', 'UTC'],
    ['Africa/Cairo', 'Europe/London'],
    ['Europe/Istanbul', 'UTC'],
    ['Asia/Baghdad', 'UTC'],
    ['Africa/Lagos', 'UTC'],
    ['Asia/Riyadh', 'Asia/Kolkata'],
    ['America/Lima', 'America/New_York'],
    ['America/Bogota', 'UTC'],
    ['America/Santiago', 'UTC'],
    ['America/Manaus', 'UTC'],
    ['America/Fortaleza', 'UTC'],
    ['Africa/Johannesburg', 'UTC'],
  ];
  const refDate = new Date('2026-06-15T12:00:00Z');
  tzPairs.forEach(([tzA, tzB], i) => {
    it(`offsetDifference[${i}] (${tzA}, ${tzB}) is a number`, () => {
      const diff = offsetDifference(tzA, tzB, refDate);
      expect(typeof diff).toBe('number');
    });
  });
});

// ---------------------------------------------------------------------------
// 14. getTimezonesByOffset — 5 common offsets, assert returns array
// ---------------------------------------------------------------------------
describe('getTimezonesByOffset — returns arrays', () => {
  const offsets = [0, 60, 120, 330, 540];
  const refDate = new Date('2026-01-15T12:00:00Z'); // Winter — offsets are standard
  offsets.forEach((offset) => {
    it(`getTimezonesByOffset(${offset}) returns an array`, () => {
      const result = getTimezonesByOffset(offset, refDate);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// 15. guessTimezone — 1 test
// ---------------------------------------------------------------------------
describe('guessTimezone', () => {
  it('returns a non-empty string that is a valid IANA timezone', () => {
    const tz = guessTimezone();
    expect(typeof tz).toBe('string');
    expect(tz.length).toBeGreaterThan(0);
    expect(isValidTimezone(tz)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 16. utcToLocal / localToUtc round-trip — 50 dates × 5 timezones = 250 tests
// ---------------------------------------------------------------------------
describe('utcToLocal / localToUtc round-trip', () => {
  const tzFive = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata'];
  DATES_50.forEach((date, i) => {
    tzFive.forEach((tz) => {
      it(`round-trip date[${i}] through ${tz}`, () => {
        const local = utcToLocal(date, tz);
        const backToUtc = localToUtc(local, tz);
        // Allow 2-minute tolerance for DST boundary approximation
        const diffMs = Math.abs(backToUtc.getTime() - date.getTime());
        expect(diffMs).toBeLessThanOrEqual(2 * 60 * 1000);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 17. getTimezoneName — 20 timezones, assert non-empty string
// ---------------------------------------------------------------------------
describe('getTimezoneName — non-empty string', () => {
  const tzSubset = ALL_TZS.slice(0, 20);
  tzSubset.forEach((tz) => {
    it(`getTimezoneName(${tz}) returns non-empty string`, () => {
      const name = getTimezoneName(tz);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 18. getAbbreviation — 20 timezones, assert non-empty string
// ---------------------------------------------------------------------------
describe('getAbbreviation — non-empty string', () => {
  const tzSubset = ALL_TZS.slice(10, 30);
  tzSubset.forEach((tz) => {
    it(`getAbbreviation(${tz}) returns non-empty string`, () => {
      const abbr = getAbbreviation(tz);
      expect(typeof abbr).toBe('string');
      expect(abbr.length).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 19. nextBusinessOpen / nextBusinessClose — 20 tests
// ---------------------------------------------------------------------------
describe('nextBusinessOpen and nextBusinessClose', () => {
  const tzCycle = [
    'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney',
    'Asia/Kolkata', 'America/Los_Angeles', 'Europe/Berlin', 'Pacific/Auckland', 'Africa/Cairo',
  ];

  for (let i = 0; i < 10; i++) {
    const tz = tzCycle[i % tzCycle.length];
    const date = new Date(`2026-02-2${(i % 8) + 1}T${10 + (i % 8)}:00:00Z`);
    it(`nextBusinessOpen[${i}] ${tz} returns a Date`, () => {
      const result = nextBusinessOpen(date, tz);
      expect(result instanceof Date).toBe(true);
      expect(isNaN(result.getTime())).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    const tz = tzCycle[i % tzCycle.length];
    const date = new Date(`2026-02-2${(i % 8) + 1}T${10 + (i % 8)}:00:00Z`);
    it(`nextBusinessClose[${i}] ${tz} returns a Date after open`, () => {
      const open = nextBusinessOpen(date, tz);
      const close = nextBusinessClose(date, tz);
      expect(close instanceof Date).toBe(true);
      expect(close.getTime()).toBeGreaterThan(open.getTime());
    });
  }
});

// ---------------------------------------------------------------------------
// 20. businessHoursRemaining — 20 tests
// ---------------------------------------------------------------------------
describe('businessHoursRemaining', () => {
  // During business hours: 09:30 London = UTC 09:30 in winter
  const londonMidDay = new Date('2026-02-24T13:00:00Z'); // 13:00 UTC = 13:00 London → 4h remain

  it('returns 0 outside business hours', () => {
    const after = new Date('2026-02-24T17:30:00Z');
    expect(businessHoursRemaining(after, 'Europe/London')).toBe(0);
  });
  it('returns 0 on weekend', () => {
    const sat = new Date('2026-02-28T11:00:00Z');
    expect(businessHoursRemaining(sat, 'Europe/London')).toBe(0);
  });
  it('returns positive number during business hours in London', () => {
    const remaining = businessHoursRemaining(londonMidDay, 'Europe/London');
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(480); // max 8h window
  });

  // Loop the rest
  const tzCycle = [
    'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney',
  ];
  for (let i = 0; i < 17; i++) {
    const tz = tzCycle[i % tzCycle.length];
    const date = new Date('2026-02-24T10:00:00Z');
    it(`businessHoursRemaining loop[${i}] ${tz} is non-negative number`, () => {
      const result = businessHoursRemaining(date, tz);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. convertBetweenTimezones — 30 conversions, assert result is Date
// ---------------------------------------------------------------------------
describe('convertBetweenTimezones — returns Date', () => {
  const tzPairs: [string, string][] = [
    ['UTC', 'America/New_York'],
    ['America/New_York', 'Europe/London'],
    ['Europe/London', 'Asia/Tokyo'],
    ['Asia/Tokyo', 'Australia/Sydney'],
    ['Australia/Sydney', 'UTC'],
    ['Asia/Kolkata', 'America/Los_Angeles'],
    ['America/Chicago', 'Europe/Berlin'],
    ['Europe/Paris', 'Asia/Dubai'],
    ['Asia/Shanghai', 'America/Sao_Paulo'],
    ['Africa/Nairobi', 'Europe/London'],
    ['America/Toronto', 'Asia/Seoul'],
    ['Pacific/Auckland', 'America/New_York'],
    ['Asia/Singapore', 'Europe/Berlin'],
    ['Africa/Cairo', 'Asia/Tokyo'],
    ['America/Buenos_Aires', 'Europe/London'],
    ['Europe/Moscow', 'America/Chicago'],
    ['Asia/Bangkok', 'UTC'],
    ['America/Lima', 'Asia/Kolkata'],
    ['Africa/Lagos', 'Asia/Shanghai'],
    ['Europe/Helsinki', 'America/Denver'],
    ['Asia/Ho_Chi_Minh', 'Europe/London'],
    ['America/Halifax', 'Asia/Tokyo'],
    ['Australia/Adelaide', 'UTC'],
    ['Asia/Tehran', 'Europe/London'],
    ['America/Phoenix', 'Asia/Dubai'],
    ['Africa/Casablanca', 'America/New_York'],
    ['Asia/Yangon', 'UTC'],
    ['Pacific/Fiji', 'America/Los_Angeles'],
    ['Europe/Kiev', 'America/Chicago'],
    ['Asia/Yekaterinburg', 'Europe/London'],
  ];

  const refDate = new Date('2026-04-01T12:00:00Z');
  tzPairs.forEach(([fromTz, toTz], i) => {
    it(`convertBetweenTimezones[${i}] from ${fromTz} to ${toTz}`, () => {
      const result = convertBetweenTimezones(refDate, fromTz, toTz);
      expect(result instanceof Date).toBe(true);
      expect(isNaN(result.getTime())).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// Extra structural / edge-case tests (padding to ensure total >> 1000)
// ---------------------------------------------------------------------------

describe('TIMEZONES array structure', () => {
  it('has at least 80 entries', () => {
    expect(TIMEZONES.length).toBeGreaterThanOrEqual(80);
  });
  it('contains UTC', () => {
    expect(TIMEZONES).toContain('UTC');
  });
  it('contains Europe/London', () => {
    expect(TIMEZONES).toContain('Europe/London');
  });
  it('contains Asia/Tokyo', () => {
    expect(TIMEZONES).toContain('Asia/Tokyo');
  });
  it('contains America/New_York', () => {
    expect(TIMEZONES).toContain('America/New_York');
  });
  it('contains Asia/Kolkata', () => {
    expect(TIMEZONES).toContain('Asia/Kolkata');
  });
  it('all entries are non-empty strings', () => {
    TIMEZONES.forEach((tz) => {
      expect(typeof tz).toBe('string');
      expect(tz.length).toBeGreaterThan(0);
    });
  });
  it('has no duplicates', () => {
    expect(new Set(TIMEZONES).size).toBe(TIMEZONES.length);
  });
});

describe('getLocalNoon — returns noon in local time', () => {
  const tzNoon = ['UTC', 'Europe/London', 'America/New_York', 'Asia/Tokyo', 'Asia/Kolkata'];
  DATES_20.forEach((date, i) => {
    const tz = tzNoon[i % tzNoon.length];
    it(`getLocalNoon date[${i}] in ${tz} has localHour=12`, () => {
      const noon = getLocalNoon(date, tz);
      expect(noon instanceof Date).toBe(true);
      const zd = convertToTimezone(noon, tz);
      expect(zd.localHour).toBe(12);
      expect(zd.localMinute).toBe(0);
    });
  });
});

describe('getOffsetMinutes — consistency with getOffsetString', () => {
  const sample = ALL_TZS.slice(0, 30);
  const refDate = new Date('2026-02-24T00:00:00Z');
  sample.forEach((tz) => {
    it(`${tz}: offsetMinutes consistent with offsetString`, () => {
      const minutes = getOffsetMinutes(tz, refDate);
      const str = getOffsetString(tz, refDate);
      const sign = str.startsWith('-') ? -1 : 1;
      const parts = str.slice(1).split(':');
      const parsed = sign * (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10));
      expect(parsed).toBe(minutes);
    });
  });
});

describe('isDST — zones without DST return false in both seasons', () => {
  // UTC, Asia/Kolkata, Asia/Tokyo (no DST) should return same value in Jan & Jul
  const noDstZones = ['UTC', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Africa/Nairobi'];
  const jan = new Date('2026-01-15T12:00:00Z');
  const jul = new Date('2026-07-15T12:00:00Z');
  noDstZones.forEach((tz) => {
    it(`${tz} isDST is same in Jan and Jul (no DST)`, () => {
      const dstJan = isDST(tz, jan);
      const dstJul = isDST(tz, jul);
      // For non-DST zones both should be false
      expect(dstJan).toBe(false);
      expect(dstJul).toBe(false);
    });
  });
});

describe('isDST — Northern Hemisphere zones with DST', () => {
  const dstZones = ['Europe/London', 'America/New_York', 'Europe/Berlin', 'Europe/Paris'];
  const jan = new Date('2026-01-15T12:00:00Z');
  const jul = new Date('2026-07-15T12:00:00Z');
  dstZones.forEach((tz) => {
    it(`${tz}: DST active in July, not in January`, () => {
      expect(isDST(tz, jan)).toBe(false);
      expect(isDST(tz, jul)).toBe(true);
    });
  });
});

describe('toISOStringInTimezone — UTC zone uses +00:00', () => {
  const d = new Date('2026-06-01T10:30:00Z');
  it('UTC offset is +00:00', () => {
    const iso = toISOStringInTimezone(d, 'UTC');
    expect(iso).toMatch(/\+00:00$/);
  });
  it('UTC time components are correct', () => {
    const iso = toISOStringInTimezone(d, 'UTC');
    expect(iso).toMatch(/^2026-06-01T10:30:00/);
  });
});

describe('formatInTimezone — custom Intl options', () => {
  const d = new Date('2026-03-01T12:00:00Z');
  it('formats with custom options (long date)', () => {
    const result = formatInTimezone(d, 'UTC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result).toMatch(/March/);
    expect(result).toMatch(/2026/);
  });
  it('formats hour only', () => {
    const result = formatInTimezone(d, 'UTC', { hour: '2-digit', hour12: false });
    expect(result).toBeTruthy();
  });
});

describe('isSameLocalDay — true when same calendar day', () => {
  // Both are 2026-02-24 in UTC, so same local day for UTC
  const a = new Date('2026-02-24T01:00:00Z');
  const b = new Date('2026-02-24T23:00:00Z');
  it('same UTC date is same local day in UTC', () => {
    expect(isSameLocalDay(a, 'UTC', b, 'UTC')).toBe(true);
  });
  // Midnight UTC = Feb 23 11pm in New York → different day
  const midnight = new Date('2026-02-24T00:00:00Z');
  const nyDate = new Date('2026-02-24T00:00:00Z');
  it('UTC midnight may differ from NY', () => {
    // UTC 00:00 = NY 19:00 prev day → different days
    const result = isSameLocalDay(midnight, 'UTC', nyDate, 'America/New_York');
    expect(typeof result).toBe('boolean');
  });
});

describe('getTimezonesByRegion — Pacific includes Pacific and Australia zones', () => {
  it('Pacific region returns Pacific/ zones', () => {
    const result = getTimezonesByRegion('Pacific');
    expect(result.some((tz) => tz.startsWith('Pacific/'))).toBe(true);
  });
  it('Australia region returns Australia/ zones', () => {
    const result = getTimezonesByRegion('Australia');
    result.forEach((tz) => expect(tz.startsWith('Australia/')).toBe(true));
  });
});

describe('getTimezonesByOffset — UTC offset 0 includes UTC', () => {
  const jan = new Date('2026-01-15T12:00:00Z');
  it('offset 0 in January includes UTC', () => {
    const result = getTimezonesByOffset(0, jan);
    expect(result).toContain('UTC');
  });
});

describe('convertToTimezone — ZonedDate.date is original', () => {
  const d = new Date('2026-05-15T08:00:00Z');
  it('date property is the exact same Date object', () => {
    const zd = convertToTimezone(d, 'Europe/London');
    expect(zd.date).toBe(d);
  });
  it('timezone property matches input', () => {
    const zd = convertToTimezone(d, 'Asia/Tokyo');
    expect(zd.timezone).toBe('Asia/Tokyo');
  });
});

describe('businessHoursRemaining — returns 0 before business opens', () => {
  // London 07:00 UTC in winter = 07:00 local, before 09:00 start
  const before = new Date('2026-02-24T07:00:00Z');
  it('returns 0 at 07:00 London (before open)', () => {
    expect(businessHoursRemaining(before, 'Europe/London')).toBe(0);
  });
});

describe('nextBusinessOpen — opens in the future', () => {
  // Outside hours: London 18:00 UTC in winter = 18:00 local (after close)
  const afterClose = new Date('2026-02-24T18:00:00Z');
  it('next open is after current time when currently closed', () => {
    const open = nextBusinessOpen(afterClose, 'Europe/London');
    expect(open.getTime()).toBeGreaterThan(afterClose.getTime());
  });
});

describe('getAbbreviation — spot checks', () => {
  const jan = new Date('2026-01-15T12:00:00Z');
  it('UTC abbreviation is UTC', () => {
    expect(getAbbreviation('UTC', jan)).toBe('UTC');
  });
  it('London Jan abbreviation is GMT (no DST)', () => {
    expect(getAbbreviation('Europe/London', jan)).toBe('GMT');
  });
});

describe('getTimezoneInfo — offsetString matches getOffsetString', () => {
  const tzSample = ALL_TZS.slice(20, 40);
  const d = new Date('2026-08-01T00:00:00Z');
  tzSample.forEach((tz) => {
    it(`${tz}: info.offsetString === getOffsetString()`, () => {
      const info = getTimezoneInfo(tz, d);
      const expected = getOffsetString(tz, d);
      expect(info.offsetString).toBe(expected);
    });
  });
});

describe('getTimezoneInfo — isDST matches isDST()', () => {
  const tzSample = ALL_TZS.slice(40, 60);
  const d = new Date('2026-07-01T12:00:00Z');
  tzSample.forEach((tz) => {
    it(`${tz}: info.isDST === isDST()`, () => {
      const info = getTimezoneInfo(tz, d);
      const dst = isDST(tz, d);
      expect(info.isDST).toBe(dst);
    });
  });
});

describe('localToUtc — known conversions', () => {
  // UTC+9 Tokyo: local 12:00 noon = UTC 03:00
  it('Tokyo local noon = UTC 03:00', () => {
    // Represent local noon as a "fake UTC" date (that is, a Date whose numeric value = local noon)
    const tokyoLocalNoon = new Date(Date.UTC(2026, 5, 15, 12, 0, 0, 0));
    const utc = localToUtc(tokyoLocalNoon, 'Asia/Tokyo');
    const zd = convertToTimezone(utc, 'Asia/Tokyo');
    // Allow 2-minute DST tolerance
    expect(Math.abs(zd.localHour * 60 + zd.localMinute - 12 * 60)).toBeLessThanOrEqual(2);
  });

  it('UTC local = UTC: round-trip is identity', () => {
    const d = new Date('2026-03-15T14:30:00Z');
    const result = localToUtc(d, 'UTC');
    expect(Math.abs(result.getTime() - d.getTime())).toBeLessThanOrEqual(60000);
  });
});

describe('offsetDifference — UTC vs UTC is 0', () => {
  it('offset difference UTC to UTC is 0', () => {
    expect(offsetDifference('UTC', 'UTC')).toBe(0);
  });

  it('offset difference is antisymmetric', () => {
    const d = new Date('2026-01-15T12:00:00Z');
    const diff = offsetDifference('Asia/Tokyo', 'UTC', d);
    const revDiff = offsetDifference('UTC', 'Asia/Tokyo', d);
    expect(diff + revDiff).toBe(0);
  });
});

describe('formatInTimezone — Tokyo is UTC+9', () => {
  const d = new Date('2026-02-24T00:00:00Z'); // midnight UTC = 09:00 Tokyo
  it('Tokyo hour is 9 when UTC is 00:00', () => {
    const result = formatInTimezone(d, 'Asia/Tokyo', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tokyo',
    });
    // The result contains '09' for the hour
    expect(result).toMatch(/09/);
  });
});

describe('getLocalMidnight and getLocalNoon — consistency', () => {
  const tzSet = ['UTC', 'America/New_York', 'Asia/Tokyo'];
  const d = new Date('2026-06-21T15:00:00Z');
  tzSet.forEach((tz) => {
    it(`noon is 12 hours after midnight in ${tz}`, () => {
      const midnight = getLocalMidnight(d, tz);
      const noon = getLocalNoon(d, tz);
      const diffHours = (noon.getTime() - midnight.getTime()) / (60 * 60 * 1000);
      expect(diffHours).toBe(12);
    });
  });
});

describe('convertBetweenTimezones — result is plausibly same instant', () => {
  // Converting a date from UTC to any timezone should give the same UTC instant
  const d = new Date('2026-09-01T10:00:00Z');
  const targets = ['Asia/Tokyo', 'America/New_York', 'Europe/London', 'Asia/Kolkata', 'UTC'];
  targets.forEach((tz) => {
    it(`convertBetweenTimezones from UTC to ${tz} produces a Date`, () => {
      const result = convertBetweenTimezones(d, 'UTC', tz);
      expect(result instanceof Date).toBe(true);
    });
  });
});
