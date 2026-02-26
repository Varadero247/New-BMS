// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  toMilliseconds,
  fromMilliseconds,
  formatHHMMSS,
  formatHHMMSSms,
  parseHHMMSS,
  formatISO8601,
  parseISO8601,
  addDurations,
  subtractDurations,
  scaleDuration,
  compareDurations,
  humanize,
  humanizeShort,
  convert,
  isValidDuration,
  elapsed,
  remaining,
  businessDays,
  toSeconds,
  toMinutes,
  toHours,
  toDays,
} from '../src/index';

// ─── Constants used in assertions ────────────────────────────────────────────
const MS  = 1;
const SEC = 1_000;
const MIN = 60_000;
const HR  = 3_600_000;
const DAY = 86_400_000;
const WK  = 604_800_000;
const MO  = 2_592_000_000;
const YR  = 31_536_000_000;

// ─────────────────────────────────────────────────────────────────────────────
// 1. toMilliseconds — 24 hour tests + 60 minute tests + 60 second tests
//    + 12 month tests + 7 week tests + 365 day tests = 528 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('toMilliseconds', () => {
  describe('hours (0–23)', () => {
    for (let h = 0; h < 24; h++) {
      it(`{hours: ${h}} → ${h * HR}`, () => {
        expect(toMilliseconds({ hours: h })).toBe(h * HR);
      });
    }
  });

  describe('minutes (0–59)', () => {
    for (let m = 0; m < 60; m++) {
      it(`{minutes: ${m}} → ${m * MIN}`, () => {
        expect(toMilliseconds({ minutes: m })).toBe(m * MIN);
      });
    }
  });

  describe('seconds (0–59)', () => {
    for (let s = 0; s < 60; s++) {
      it(`{seconds: ${s}} → ${s * SEC}`, () => {
        expect(toMilliseconds({ seconds: s })).toBe(s * SEC);
      });
    }
  });

  describe('months (0–11)', () => {
    for (let mo = 0; mo <= 11; mo++) {
      it(`{months: ${mo}} → ${mo * MO}`, () => {
        expect(toMilliseconds({ months: mo })).toBe(mo * MO);
      });
    }
  });

  describe('weeks (0–6)', () => {
    for (let w = 0; w <= 6; w++) {
      it(`{weeks: ${w}} → ${w * WK}`, () => {
        expect(toMilliseconds({ weeks: w })).toBe(w * WK);
      });
    }
  });

  describe('days (1–365)', () => {
    for (let d = 1; d <= 365; d++) {
      it(`{days: ${d}} → ${d * DAY}`, () => {
        expect(toMilliseconds({ days: d })).toBe(d * DAY);
      });
    }
  });

  describe('combined', () => {
    it('empty duration is 0', () => {
      expect(toMilliseconds({})).toBe(0);
    });
    it('1 year', () => {
      expect(toMilliseconds({ years: 1 })).toBe(YR);
    });
    it('1 year + 1 month', () => {
      expect(toMilliseconds({ years: 1, months: 1 })).toBe(YR + MO);
    });
    it('1h 30m', () => {
      expect(toMilliseconds({ hours: 1, minutes: 30 })).toBe(HR + 30 * MIN);
    });
    it('all fields simultaneously', () => {
      const result = toMilliseconds({ years: 1, months: 1, weeks: 1, days: 1, hours: 1, minutes: 1, seconds: 1, milliseconds: 1 });
      expect(result).toBe(YR + MO + WK + DAY + HR + MIN + SEC + 1);
    });
    it('zero all fields', () => {
      expect(toMilliseconds({ years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. fromMilliseconds — 48 tests (0–47 hours converted to ms then decomposed)
// ─────────────────────────────────────────────────────────────────────────────
describe('fromMilliseconds', () => {
  describe('whole hours (0–47)', () => {
    for (let h = 0; h < 48; h++) {
      it(`${h * HR}ms → hours component correct`, () => {
        const result = fromMilliseconds(h * HR);
        // After stripping years/months/weeks/days, remaining hours = h % 24
        const daysInH = Math.floor(h / 24);
        const hoursRem = h - daysInH * 24;
        expect(result.hours).toBe(hoursRem);
      });
    }
  });

  describe('known exact values', () => {
    it('0ms all zero', () => {
      const r = fromMilliseconds(0);
      expect(r).toEqual({ years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    });
    it('1 second', () => {
      const r = fromMilliseconds(SEC);
      expect(r.seconds).toBe(1);
      expect(r.milliseconds).toBe(0);
    });
    it('1 minute', () => {
      const r = fromMilliseconds(MIN);
      expect(r.minutes).toBe(1);
      expect(r.seconds).toBe(0);
    });
    it('1 hour', () => {
      const r = fromMilliseconds(HR);
      expect(r.hours).toBe(1);
      expect(r.minutes).toBe(0);
    });
    it('1 day', () => {
      const r = fromMilliseconds(DAY);
      expect(r.days).toBe(1);
    });
    it('1 week', () => {
      const r = fromMilliseconds(WK);
      expect(r.weeks).toBe(1);
    });
    it('1 month', () => {
      const r = fromMilliseconds(MO);
      expect(r.months).toBe(1);
    });
    it('1 year', () => {
      const r = fromMilliseconds(YR);
      expect(r.years).toBe(1);
    });
    it('1h 2m 3s', () => {
      const r = fromMilliseconds(HR + 2 * MIN + 3 * SEC);
      expect(r.hours).toBe(1);
      expect(r.minutes).toBe(2);
      expect(r.seconds).toBe(3);
    });
    it('negative ms treated as absolute', () => {
      const r = fromMilliseconds(-SEC);
      expect(r.seconds).toBe(1);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. formatHHMMSS — 60 tests (0–59 minutes)
// ─────────────────────────────────────────────────────────────────────────────
describe('formatHHMMSS', () => {
  describe('minutes 0–59 with 0 seconds', () => {
    for (let m = 0; m < 60; m++) {
      const expectedMM = String(m).padStart(2, '0');
      it(`${m * MIN}ms → 00:${expectedMM}:00`, () => {
        expect(formatHHMMSS(m * MIN)).toBe(`00:${expectedMM}:00`);
      });
    }
  });

  describe('seconds 0–59', () => {
    for (let s = 0; s < 60; s++) {
      const ss = String(s).padStart(2, '0');
      it(`${s * SEC}ms → 00:00:${ss}`, () => {
        expect(formatHHMMSS(s * SEC)).toBe(`00:00:${ss}`);
      });
    }
  });

  describe('known values', () => {
    it('3723000ms → 01:02:03', () => {
      expect(formatHHMMSS(3_723_000)).toBe('01:02:03');
    });
    it('0ms → 00:00:00', () => {
      expect(formatHHMMSS(0)).toBe('00:00:00');
    });
    it('hours > 23 not capped', () => {
      expect(formatHHMMSS(25 * HR)).toBe('25:00:00');
    });
    it('negative input uses absolute value', () => {
      expect(formatHHMMSS(-3_723_000)).toBe('01:02:03');
    });
    it('exactly 1 hour', () => {
      expect(formatHHMMSS(HR)).toBe('01:00:00');
    });
    it('99 hours', () => {
      expect(formatHHMMSS(99 * HR)).toBe('99:00:00');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. formatHHMMSSms — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('formatHHMMSSms', () => {
  describe('millisecond component (0, 10, 20, ... 290)', () => {
    for (let i = 0; i < 30; i++) {
      const millis = i * 10;
      const mmm = String(millis).padStart(3, '0');
      it(`${millis}ms → 00:00:00.${mmm}`, () => {
        expect(formatHHMMSSms(millis)).toBe(`00:00:00.${mmm}`);
      });
    }
  });

  describe('known values', () => {
    it('3723456ms → 01:02:03.456', () => {
      expect(formatHHMMSSms(3_723_456)).toBe('01:02:03.456');
    });
    it('0ms → 00:00:00.000', () => {
      expect(formatHHMMSSms(0)).toBe('00:00:00.000');
    });
    it('1001ms → 00:00:01.001', () => {
      expect(formatHHMMSSms(1_001)).toBe('00:00:01.001');
    });
    it('negative treated as absolute', () => {
      expect(formatHHMMSSms(-500)).toBe('00:00:00.500');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. parseHHMMSS — 30 tests (HH:MM:SS) + 30 tests (MM:SS)
// ─────────────────────────────────────────────────────────────────────────────
describe('parseHHMMSS', () => {
  describe('HH:MM:SS format (hours 0–29)', () => {
    for (let h = 0; h < 30; h++) {
      const hh = String(h).padStart(2, '0');
      it(`'${hh}:00:00' → ${h * HR}`, () => {
        expect(parseHHMMSS(`${hh}:00:00`)).toBe(h * HR);
      });
    }
  });

  describe('MM:SS format (minutes 0–29)', () => {
    for (let m = 0; m < 30; m++) {
      const mm = String(m).padStart(2, '0');
      it(`'${mm}:00' → ${m * MIN}`, () => {
        expect(parseHHMMSS(`${mm}:00`)).toBe(m * MIN);
      });
    }
  });

  describe('known values', () => {
    it("'01:02:03' → 3723000", () => {
      expect(parseHHMMSS('01:02:03')).toBe(3_723_000);
    });
    it("'00:00:00' → 0", () => {
      expect(parseHHMMSS('00:00:00')).toBe(0);
    });
    it("'01:30' → 90000", () => {
      expect(parseHHMMSS('01:30')).toBe(90_000);
    });
    it("invalid returns 0", () => {
      expect(parseHHMMSS('')).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. formatISO8601 — 15 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('formatISO8601', () => {
  it('empty → P0D', () => {
    expect(formatISO8601({})).toBe('P0D');
  });
  it('1 year', () => {
    expect(formatISO8601({ years: 1 })).toBe('P1Y');
  });
  it('1 month', () => {
    expect(formatISO8601({ months: 1 })).toBe('P1M');
  });
  it('1 day', () => {
    expect(formatISO8601({ days: 1 })).toBe('P1D');
  });
  it('1 hour', () => {
    expect(formatISO8601({ hours: 1 })).toBe('PT1H');
  });
  it('1 minute', () => {
    expect(formatISO8601({ minutes: 1 })).toBe('PT1M');
  });
  it('1 second', () => {
    expect(formatISO8601({ seconds: 1 })).toBe('PT1S');
  });
  it('1Y2M3D', () => {
    expect(formatISO8601({ years: 1, months: 2, days: 3 })).toBe('P1Y2M3D');
  });
  it('T4H5M6S', () => {
    expect(formatISO8601({ hours: 4, minutes: 5, seconds: 6 })).toBe('PT4H5M6S');
  });
  it('weeks fold into days', () => {
    expect(formatISO8601({ weeks: 1 })).toBe('P7D');
  });
  it('1Y2M3DT4H5M6S', () => {
    expect(formatISO8601({ years: 1, months: 2, days: 3, hours: 4, minutes: 5, seconds: 6 })).toBe('P1Y2M3DT4H5M6S');
  });
  it('milliseconds become fractional seconds', () => {
    const result = formatISO8601({ seconds: 1, milliseconds: 500 });
    expect(result).toBe('PT1.5S');
  });
  it('0 values omitted', () => {
    expect(formatISO8601({ years: 0, hours: 0 })).toBe('P0D');
  });
  it('only minutes', () => {
    expect(formatISO8601({ minutes: 30 })).toBe('PT30M');
  });
  it('2 years', () => {
    expect(formatISO8601({ years: 2 })).toBe('P2Y');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. parseISO8601 — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('parseISO8601', () => {
  it('P1Y', () => {
    expect(parseISO8601('P1Y').years).toBe(1);
  });
  it('P2M', () => {
    expect(parseISO8601('P2M').months).toBe(2);
  });
  it('P3W', () => {
    expect(parseISO8601('P3W').weeks).toBe(3);
  });
  it('P4D', () => {
    expect(parseISO8601('P4D').days).toBe(4);
  });
  it('PT5H', () => {
    expect(parseISO8601('PT5H').hours).toBe(5);
  });
  it('PT6M', () => {
    expect(parseISO8601('PT6M').minutes).toBe(6);
  });
  it('PT7S', () => {
    expect(parseISO8601('PT7S').seconds).toBe(7);
  });
  it('P1Y2M3DT4H5M6S all fields', () => {
    const d = parseISO8601('P1Y2M3DT4H5M6S');
    expect(d.years).toBe(1);
    expect(d.months).toBe(2);
    expect(d.days).toBe(3);
    expect(d.hours).toBe(4);
    expect(d.minutes).toBe(5);
    expect(d.seconds).toBe(6);
  });
  it('empty string returns empty object', () => {
    const d = parseISO8601('');
    expect(d.years).toBeUndefined();
  });
  it('P0D returns empty', () => {
    const d = parseISO8601('P0D');
    expect(d.days).toBe(0);
  });
  it('fractional seconds → seconds + milliseconds', () => {
    const d = parseISO8601('PT1.5S');
    expect(d.seconds).toBe(1);
    expect(d.milliseconds).toBe(500);
  });
  it('roundtrip: format then parse years', () => {
    const d = parseISO8601(formatISO8601({ years: 3 }));
    expect(d.years).toBe(3);
  });
  it('roundtrip: format then parse hours', () => {
    const d = parseISO8601(formatISO8601({ hours: 10 }));
    expect(d.hours).toBe(10);
  });
  it('roundtrip: format then parse minutes', () => {
    const d = parseISO8601(formatISO8601({ minutes: 45 }));
    expect(d.minutes).toBe(45);
  });
  it('P10Y', () => {
    expect(parseISO8601('P10Y').years).toBe(10);
  });
  it('PT30M', () => {
    expect(parseISO8601('PT30M').minutes).toBe(30);
  });
  it('P1Y6M', () => {
    const d = parseISO8601('P1Y6M');
    expect(d.years).toBe(1);
    expect(d.months).toBe(6);
  });
  it('PT2H30M', () => {
    const d = parseISO8601('PT2H30M');
    expect(d.hours).toBe(2);
    expect(d.minutes).toBe(30);
  });
  it('P2W', () => {
    expect(parseISO8601('P2W').weeks).toBe(2);
  });
  it('P1Y2M3W4DT5H6M7S all', () => {
    const d = parseISO8601('P1Y2M3W4DT5H6M7S');
    expect(d.years).toBe(1);
    expect(d.weeks).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. addDurations — 24 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('addDurations', () => {
  describe('adding hours 0–23 to 1 hour', () => {
    for (let h = 0; h < 24; h++) {
      it(`{hours:1} + {hours:${h}} = ${(1 + h) * HR}ms`, () => {
        const result = addDurations({ hours: 1 }, { hours: h });
        expect(result.milliseconds).toBe((1 + h) * HR);
      });
    }
  });

  it('add two empty durations', () => {
    expect(addDurations({}, {}).milliseconds).toBe(0);
  });
  it('add 30m + 30m = 1h', () => {
    const r = addDurations({ minutes: 30 }, { minutes: 30 });
    expect(r.milliseconds).toBe(HR);
  });
  it('add year + month', () => {
    const r = addDurations({ years: 1 }, { months: 1 });
    expect(r.milliseconds).toBe(YR + MO);
  });
  it('add 0 to duration preserves value', () => {
    const r = addDurations({ hours: 5 }, {});
    expect(r.milliseconds).toBe(5 * HR);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. subtractDurations — 24 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('subtractDurations', () => {
  describe('subtract hours 0–23 from 24 hours', () => {
    for (let h = 0; h < 24; h++) {
      it(`{hours:24} - {hours:${h}} = ${(24 - h) * HR}ms`, () => {
        const result = subtractDurations({ hours: 24 }, { hours: h });
        expect(result.milliseconds).toBe((24 - h) * HR);
      });
    }
  });

  it('result floors at 0', () => {
    const r = subtractDurations({ hours: 1 }, { hours: 2 });
    expect(r.milliseconds).toBe(0);
  });
  it('subtract 0 preserves value', () => {
    const r = subtractDurations({ hours: 3 }, {});
    expect(r.milliseconds).toBe(3 * HR);
  });
  it('equal durations → 0', () => {
    const r = subtractDurations({ minutes: 10 }, { minutes: 10 });
    expect(r.milliseconds).toBe(0);
  });
  it('subtract from empty → 0', () => {
    const r = subtractDurations({}, { hours: 1 });
    expect(r.milliseconds).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. scaleDuration — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('scaleDuration', () => {
  describe('scale {hours:1} by factors 1–30', () => {
    for (let f = 1; f <= 30; f++) {
      it(`factor ${f} → ${f * HR}ms`, () => {
        const result = scaleDuration({ hours: 1 }, f);
        expect(result.milliseconds).toBe(f * HR);
      });
    }
  });

  it('scale by 0 → 0', () => {
    expect(scaleDuration({ hours: 5 }, 0).milliseconds).toBe(0);
  });
  it('scale by 0.5 halves', () => {
    expect(scaleDuration({ hours: 2 }, 0.5).milliseconds).toBe(HR);
  });
  it('scale by negative', () => {
    expect(scaleDuration({ hours: 1 }, -1).milliseconds).toBe(-HR);
  });
  it('scale empty by 100 → 0', () => {
    expect(scaleDuration({}, 100).milliseconds).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. compareDurations — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('compareDurations', () => {
  describe('compare {minutes: N} vs {minutes: 10} for N 0–9 (less)', () => {
    for (let n = 0; n < 10; n++) {
      it(`{minutes:${n}} < {minutes:10} → -1`, () => {
        expect(compareDurations({ minutes: n }, { minutes: 10 })).toBe(-1);
      });
    }
  });

  describe('compare {minutes: N} vs {minutes: 10} for N 11–19 (greater)', () => {
    for (let n = 11; n <= 19; n++) {
      it(`{minutes:${n}} > {minutes:10} → 1`, () => {
        expect(compareDurations({ minutes: n }, { minutes: 10 })).toBe(1);
      });
    }
  });

  it('equal durations → 0', () => {
    expect(compareDurations({ hours: 1 }, { minutes: 60 })).toBe(0);
  });
  it('empty vs empty → 0', () => {
    expect(compareDurations({}, {})).toBe(0);
  });
  it('1 year vs 1 month → 1', () => {
    expect(compareDurations({ years: 1 }, { months: 1 })).toBe(1);
  });
  it('1 second vs 1 minute → -1', () => {
    expect(compareDurations({ seconds: 1 }, { minutes: 1 })).toBe(-1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. humanize — 30 tests (long form)
// ─────────────────────────────────────────────────────────────────────────────
describe('humanize', () => {
  describe('whole hours 1–23 long form', () => {
    for (let h = 1; h <= 23; h++) {
      const expected = h === 1 ? '1 hour' : `${h} hours`;
      it(`${h * HR}ms → '${expected}'`, () => {
        expect(humanize(h * HR)).toBe(expected);
      });
    }
    // 24 hours rolls up to 1 day in humanize
    it('24 hours ms → 1 day', () => {
      expect(humanize(24 * HR)).toBe('1 day');
    });
  });

  describe('whole minutes 1–5 short form', () => {
    for (let m = 1; m <= 5; m++) {
      it(`${m * MIN}ms short → '${m}m'`, () => {
        expect(humanize(m * MIN, true)).toBe(`${m}m`);
      });
    }
  });

  it('0ms long → 0 seconds', () => {
    expect(humanize(0)).toBe('0 seconds');
  });
  it('0ms short → 0s', () => {
    expect(humanize(0, true)).toBe('0s');
  });
  it('1 second long', () => {
    expect(humanize(SEC)).toBe('1 second');
  });
  it('2 seconds long', () => {
    expect(humanize(2 * SEC)).toBe('2 seconds');
  });
  it('1 minute long', () => {
    expect(humanize(MIN)).toBe('1 minute');
  });
  it('2 minutes long', () => {
    expect(humanize(2 * MIN)).toBe('2 minutes');
  });
  it('1h 30m long', () => {
    expect(humanize(HR + 30 * MIN)).toBe('1 hour 30 minutes');
  });
  it('1h 30m short', () => {
    expect(humanize(HR + 30 * MIN, true)).toBe('1h 30m');
  });
  it('2h 30m 15s long', () => {
    expect(humanize(2 * HR + 30 * MIN + 15 * SEC)).toBe('2 hours 30 minutes 15 seconds');
  });
  it('1 day long', () => {
    expect(humanize(DAY)).toBe('1 day');
  });
  it('1 week long', () => {
    expect(humanize(WK)).toBe('1 week');
  });
  it('1 month long', () => {
    expect(humanize(MO)).toBe('1 month');
  });
  it('1 year long', () => {
    expect(humanize(YR)).toBe('1 year');
  });
  it('2 years long', () => {
    expect(humanize(2 * YR)).toBe('2 years');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. humanizeShort — 10 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('humanizeShort', () => {
  it('0ms → 0s', () => expect(humanizeShort(0)).toBe('0s'));
  it('1s', () => expect(humanizeShort(SEC)).toBe('1s'));
  it('1m', () => expect(humanizeShort(MIN)).toBe('1m'));
  it('1h', () => expect(humanizeShort(HR)).toBe('1h'));
  it('1d', () => expect(humanizeShort(DAY)).toBe('1d'));
  it('1w', () => expect(humanizeShort(WK)).toBe('1w'));
  it('1mo', () => expect(humanizeShort(MO)).toBe('1mo'));
  it('1y', () => expect(humanizeShort(YR)).toBe('1y'));
  it('2h 30m 15s', () => expect(humanizeShort(2 * HR + 30 * MIN + 15 * SEC)).toBe('2h 30m 15s'));
  it('matches humanize(ms, true)', () => {
    const ms = 3 * HR + 7 * MIN;
    expect(humanizeShort(ms)).toBe(humanize(ms, true));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. convert — 40 minutes-to-seconds + 40 hours-to-minutes = 80 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('convert', () => {
  describe('minutes → seconds (0–39)', () => {
    for (let m = 0; m < 40; m++) {
      it(`convert(${m}, 'minutes', 'seconds') ≈ ${m * 60}`, () => {
        expect(convert(m, 'minutes', 'seconds')).toBeCloseTo(m * 60);
      });
    }
  });

  describe('hours → minutes (0–39)', () => {
    for (let h = 0; h < 40; h++) {
      it(`convert(${h}, 'hours', 'minutes') ≈ ${h * 60}`, () => {
        expect(convert(h, 'hours', 'minutes')).toBeCloseTo(h * 60);
      });
    }
  });

  describe('other conversions', () => {
    it('1 hour to ms', () => expect(convert(1, 'hours', 'milliseconds')).toBe(HR));
    it('1 day to hours', () => expect(convert(1, 'days', 'hours')).toBe(24));
    it('1 week to days', () => expect(convert(1, 'weeks', 'days')).toBe(7));
    it('1 year to days', () => expect(convert(1, 'years', 'days')).toBe(365));
    it('1000 ms to seconds', () => expect(convert(1000, 'milliseconds', 'seconds')).toBe(1));
    it('60 seconds to minutes', () => expect(convert(60, 'seconds', 'minutes')).toBe(1));
    it('24 hours to days', () => expect(convert(24, 'hours', 'days')).toBe(1));
    it('same unit returns same value', () => expect(convert(5, 'hours', 'hours')).toBe(5));
    it('months to days', () => expect(convert(1, 'months', 'days')).toBe(30));
    it('years to months', () => expect(convert(1, 'years', 'months')).toBeCloseTo(365 / 30, 5));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. isValidDuration — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('isValidDuration', () => {
  describe('valid durations with single numeric fields (hours 0–9)', () => {
    for (let h = 0; h < 10; h++) {
      it(`{hours: ${h}} is valid`, () => {
        expect(isValidDuration({ hours: h })).toBe(true);
      });
    }
  });

  describe('valid durations with single numeric fields (minutes 0–9)', () => {
    for (let m = 0; m < 10; m++) {
      it(`{minutes: ${m}} is valid`, () => {
        expect(isValidDuration({ minutes: m })).toBe(true);
      });
    }
  });

  describe('invalid inputs', () => {
    it('null is invalid', () => expect(isValidDuration(null)).toBe(false));
    it('string is invalid', () => expect(isValidDuration('1h')).toBe(false));
    it('number is invalid', () => expect(isValidDuration(42)).toBe(false));
    it('array is invalid', () => expect(isValidDuration([])).toBe(false));
    it('undefined is invalid', () => expect(isValidDuration(undefined)).toBe(false));
    it('non-finite hours invalid', () => expect(isValidDuration({ hours: Infinity })).toBe(false));
    it('NaN hours invalid', () => expect(isValidDuration({ hours: NaN })).toBe(false));
    it('string hours invalid', () => expect(isValidDuration({ hours: '5' })).toBe(false));
    it('empty object is valid', () => expect(isValidDuration({})).toBe(true));
    it('all fields numeric → valid', () => {
      expect(isValidDuration({ years: 1, months: 2, weeks: 3, days: 4, hours: 5, minutes: 6, seconds: 7, milliseconds: 8 })).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16. elapsed — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('elapsed', () => {
  describe('elapsed between t=0 and t=N hours (0–9)', () => {
    for (let h = 0; h < 10; h++) {
      it(`elapsed(0, ${h * HR}) → hours=${h}`, () => {
        const r = elapsed(0, h * HR);
        expect(r.hours).toBe(h);
      });
    }
  });

  describe('elapsed between t=0 and t=N seconds (0–9)', () => {
    for (let s = 0; s < 10; s++) {
      it(`elapsed(0, ${s * SEC}) → seconds=${s}`, () => {
        const r = elapsed(0, s * SEC);
        expect(r.seconds).toBe(s);
      });
    }
  });

  it('start and end equal → all zeros', () => {
    const r = elapsed(1000, 1000);
    expect(r).toEqual({ years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  });
  it('reversed start/end still positive', () => {
    const r = elapsed(HR, 0);
    expect(r.hours).toBe(1);
  });
  it('1h 30m elapsed', () => {
    const r = elapsed(0, HR + 30 * MIN);
    expect(r.hours).toBe(1);
    expect(r.minutes).toBe(30);
  });
  it('returns FormattedDuration shape', () => {
    const r = elapsed(0, DAY);
    expect(typeof r.years).toBe('number');
    expect(typeof r.months).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 17. remaining — 25 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('remaining', () => {
  describe('10% increments of 100-hour task', () => {
    const total = 100 * HR;
    for (let pct = 0; pct <= 100; pct += 10) {
      const expected = pct >= 100 ? 0 : total * (1 - pct / 100);
      it(`${pct}% progress → ${expected}ms remaining`, () => {
        expect(remaining(0, total, pct)).toBeCloseTo(expected);
      });
    }
  });

  describe('progress 0–9% of 1 hour', () => {
    for (let p = 0; p < 10; p++) {
      it(`${p}% of 1h remaining`, () => {
        const r = remaining(0, HR, p);
        expect(r).toBeCloseTo(HR * (1 - p / 100));
      });
    }
  });

  it('0% → full duration', () => {
    expect(remaining(0, DAY, 0)).toBe(DAY);
  });
  it('100% → 0', () => {
    expect(remaining(0, DAY, 100)).toBe(0);
  });
  it('50% → half', () => {
    expect(remaining(0, 2 * HR, 50)).toBeCloseTo(HR);
  });
  it('negative progress treated as 0%', () => {
    expect(remaining(0, HR, -10)).toBe(HR);
  });
  it('progress > 100 → 0', () => {
    expect(remaining(0, HR, 150)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 18. businessDays — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('businessDays', () => {
  describe('multiples of 8 hours (1–20 business days)', () => {
    for (let d = 1; d <= 20; d++) {
      it(`${d * 8 * HR}ms → ${d} business days`, () => {
        expect(businessDays(d * 8 * HR)).toBe(d);
      });
    }
  });

  it('0ms → 0 business days', () => {
    expect(businessDays(0)).toBe(0);
  });
  it('4 hours → 0.5 business days', () => {
    expect(businessDays(4 * HR)).toBe(0.5);
  });
  it('negative input treated as absolute', () => {
    expect(businessDays(-8 * HR)).toBe(1);
  });
  it('1 full day = 3 business days', () => {
    expect(businessDays(DAY)).toBe(3);
  });
  it('1 week = 21 business days', () => {
    expect(businessDays(WK)).toBe(21);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 19. toSeconds — 30 tests (hours 0–29)
// ─────────────────────────────────────────────────────────────────────────────
describe('toSeconds', () => {
  describe('hours 0–29', () => {
    for (let h = 0; h < 30; h++) {
      it(`{hours:${h}} → ${h * 3600}s`, () => {
        expect(toSeconds({ hours: h })).toBe(h * 3600);
      });
    }
  });

  it('{seconds:90} → 90', () => expect(toSeconds({ seconds: 90 })).toBe(90));
  it('{minutes:2} → 120', () => expect(toSeconds({ minutes: 2 })).toBe(120));
  it('empty → 0', () => expect(toSeconds({})).toBe(0));
  it('1 day → 86400s', () => expect(toSeconds({ days: 1 })).toBe(86400));
});

// ─────────────────────────────────────────────────────────────────────────────
// 20. toMinutes — 30 tests (hours 0–29)
// ─────────────────────────────────────────────────────────────────────────────
describe('toMinutes', () => {
  describe('hours 0–29', () => {
    for (let h = 0; h < 30; h++) {
      it(`{hours:${h}} → ${h * 60}m`, () => {
        expect(toMinutes({ hours: h })).toBe(h * 60);
      });
    }
  });

  it('{minutes:90} → 90', () => expect(toMinutes({ minutes: 90 })).toBe(90));
  it('{seconds:120} → 2', () => expect(toMinutes({ seconds: 120 })).toBe(2));
  it('empty → 0', () => expect(toMinutes({})).toBe(0));
  it('1 day → 1440m', () => expect(toMinutes({ days: 1 })).toBe(1440));
});

// ─────────────────────────────────────────────────────────────────────────────
// 21. toHours — 30 tests (minutes 0–29)
// ─────────────────────────────────────────────────────────────────────────────
describe('toHours', () => {
  describe('minutes 0–29', () => {
    for (let m = 0; m < 30; m++) {
      it(`{minutes:${m}} → ${m / 60}h`, () => {
        expect(toHours({ minutes: m })).toBeCloseTo(m / 60);
      });
    }
  });

  it('{hours:5} → 5', () => expect(toHours({ hours: 5 })).toBe(5));
  it('{days:1} → 24', () => expect(toHours({ days: 1 })).toBe(24));
  it('{weeks:1} → 168', () => expect(toHours({ weeks: 1 })).toBe(168));
  it('empty → 0', () => expect(toHours({})).toBe(0));
});

// ─────────────────────────────────────────────────────────────────────────────
// 22. toDays — 30 tests (hours 0–29)
// ─────────────────────────────────────────────────────────────────────────────
describe('toDays', () => {
  describe('hours 0–29', () => {
    for (let h = 0; h < 30; h++) {
      it(`{hours:${h}} → ${h / 24}d`, () => {
        expect(toDays({ hours: h })).toBeCloseTo(h / 24);
      });
    }
  });

  it('{days:7} → 7', () => expect(toDays({ days: 7 })).toBe(7));
  it('{weeks:2} → 14', () => expect(toDays({ weeks: 2 })).toBe(14));
  it('{months:1} → 30', () => expect(toDays({ months: 1 })).toBe(30));
  it('empty → 0', () => expect(toDays({})).toBe(0));
});

// ─────────────────────────────────────────────────────────────────────────────
// 23. Cross-function round-trip — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('round-trips', () => {
  describe('toMilliseconds → fromMilliseconds for hours 1–10', () => {
    for (let h = 1; h <= 10; h++) {
      it(`round-trip {hours:${h}}`, () => {
        const ms = toMilliseconds({ hours: h });
        const back = fromMilliseconds(ms);
        expect(back.hours).toBe(h % 24);
      });
    }
  });

  describe('parseHHMMSS → formatHHMMSS for hours 0–9', () => {
    for (let h = 0; h < 10; h++) {
      const hh = String(h).padStart(2, '0');
      it(`parse then format '${hh}:00:00' is identity`, () => {
        const ms = parseHHMMSS(`${hh}:00:00`);
        expect(formatHHMMSS(ms)).toBe(`${hh}:00:00`);
      });
    }
  });

  it('add then subtract same value returns 0', () => {
    const base = { hours: 3 };
    const added = addDurations(base, base);
    const back = subtractDurations({ milliseconds: added.milliseconds }, base);
    expect(back.milliseconds).toBe(3 * HR);
  });
  it('scale by 2 then compare to double', () => {
    const scaled = scaleDuration({ hours: 1 }, 2);
    expect(compareDurations(scaled, { hours: 2 })).toBe(0);
  });
  it('elapsed(a,b) ms matches toMilliseconds of each field', () => {
    const ms = 2 * HR + 30 * MIN + 15 * SEC;
    const r = elapsed(0, ms);
    const back = toMilliseconds({ hours: r.hours, minutes: r.minutes, seconds: r.seconds, milliseconds: r.milliseconds });
    expect(back).toBe(ms);
  });
  it('convert round-trip hours → ms → hours', () => {
    expect(convert(convert(5, 'hours', 'milliseconds'), 'milliseconds', 'hours')).toBe(5);
  });
  it('parseISO8601 then formatISO8601 for P1Y', () => {
    const d = parseISO8601('P1Y');
    expect(formatISO8601(d)).toBe('P1Y');
  });
  it('formatISO8601 then parseISO8601 for PT2H30M', () => {
    const iso = formatISO8601({ hours: 2, minutes: 30 });
    const d = parseISO8601(iso);
    expect(d.hours).toBe(2);
    expect(d.minutes).toBe(30);
  });
  it('humanize and humanizeShort agree on direction', () => {
    const ms = 1 * HR + 1 * MIN;
    expect(humanize(ms, true)).toBe(humanizeShort(ms));
  });
  it('toSeconds × 1000 = toMilliseconds', () => {
    const d = { hours: 2, minutes: 15 };
    expect(toSeconds(d) * 1000).toBe(toMilliseconds(d));
  });
  it('toMinutes × 60 = toSeconds', () => {
    const d = { days: 1 };
    expect(toMinutes(d) * 60).toBe(toSeconds(d));
  });
  it('toHours × 60 = toMinutes', () => {
    const d = { weeks: 1 };
    expect(toHours(d) * 60).toBe(toMinutes(d));
  });
  it('toDays × 24 = toHours', () => {
    const d = { months: 1 };
    expect(toDays(d) * 24).toBe(toHours(d));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 24. Edge cases — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('edge cases', () => {
  it('toMilliseconds with float hours', () => {
    expect(toMilliseconds({ hours: 1.5 })).toBe(1.5 * HR);
  });
  it('toMilliseconds with negative value', () => {
    expect(toMilliseconds({ hours: -1 })).toBe(-HR);
  });
  it('fromMilliseconds with float ms', () => {
    const r = fromMilliseconds(1500.9);
    expect(r.seconds).toBe(1);
  });
  it('formatHHMMSS with very large ms', () => {
    const result = formatHHMMSS(100 * HR);
    expect(result).toBe('100:00:00');
  });
  it('parseHHMMSS with single digit parts returns correct ms', () => {
    expect(parseHHMMSS('1:2:3')).toBe((3600 + 120 + 3) * SEC);
  });
  it('businessDays with 1ms returns very small value', () => {
    expect(businessDays(1)).toBeCloseTo(1 / (8 * HR), 10);
  });
  it('remaining at exactly 50%', () => {
    expect(remaining(0, 200, 50)).toBe(100);
  });
  it('scaleDuration by 1 unchanged', () => {
    const d = { hours: 3, minutes: 30 };
    const scaled = scaleDuration(d, 1);
    expect(scaled.milliseconds).toBe(toMilliseconds(d));
  });
  it('addDurations commutativity', () => {
    const a = { hours: 1 };
    const b = { minutes: 30 };
    expect(addDurations(a, b).milliseconds).toBe(addDurations(b, a).milliseconds);
  });
  it('compareDurations is anti-symmetric', () => {
    const a = { hours: 1 };
    const b = { hours: 2 };
    expect(compareDurations(a, b)).toBe(-compareDurations(b, a));
  });
  it('isValidDuration: nested object invalid', () => {
    expect(isValidDuration({ hours: { value: 5 } })).toBe(false);
  });
  it('isValidDuration: extra unknown fields still valid', () => {
    expect(isValidDuration({ hours: 1, extra: 'ignored' } as any)).toBe(true);
  });
  it('humanize with very large value', () => {
    expect(humanize(10 * YR)).toContain('10 years');
  });
  it('humanizeShort with very large value', () => {
    expect(humanizeShort(10 * YR)).toContain('10y');
  });
  it('elapsed with same start and end timestamps', () => {
    const r = elapsed(5000, 5000);
    expect(r.milliseconds).toBe(0);
  });
  it('formatHHMMSSms with exactly 1 second', () => {
    expect(formatHHMMSSms(SEC)).toBe('00:00:01.000');
  });
  it('convert with 0 value', () => {
    expect(convert(0, 'hours', 'seconds')).toBe(0);
  });
  it('convert years to milliseconds', () => {
    expect(convert(1, 'years', 'milliseconds')).toBe(YR);
  });
  it('subtractDurations: equal negative-result clamped to 0', () => {
    const r = subtractDurations({ seconds: 10 }, { minutes: 1 });
    expect(r.milliseconds).toBe(0);
  });
  it('toHours for 1 year', () => {
    expect(toHours({ years: 1 })).toBe(365 * 24);
  });
});
